import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protect the routes
    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
    const isApiRoute = request.nextUrl.pathname.startsWith('/api/')
    const isPublicRoute = request.nextUrl.pathname === '/' || isAuthRoute || isApiRoute

    if (!user && !isPublicRoute && !isAdminRoute) {
        // If user is not logged in, redirect to login page for protected routes
        const url = request.nextUrl.clone()
        const redirectTo = url.pathname + url.search
        url.pathname = '/login'
        url.search = `?next=${encodeURIComponent(redirectTo)}`
        return NextResponse.redirect(url)
    }

    // Role-based protection for /admin
    if (isAdminRoute) {
        if (!user) {
            const url = request.nextUrl.clone()
            const redirectTo = url.pathname + url.search
            url.pathname = '/login'
            url.search = `?next=${encodeURIComponent(redirectTo)}`
            return NextResponse.redirect(url)
        }

        // Fetch profile to check if admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single()

        if (!profile?.is_admin) {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }
    }

    // Optional: If user is logged in, and tries to go to an auth page redirect to dashboard
    if (user && isAuthRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    // Optional: If logged in user hits rool redirect to dashboard
    if (user && request.nextUrl.pathname === '/') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
