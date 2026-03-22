import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest, response?: NextResponse) {
    let supabaseResponse = response || NextResponse.next({
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
                    supabaseResponse = response || NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Helper to check paths regardless of locale prefix
    const path = request.nextUrl.pathname
    const isAuthRoute = path.match(/^\/(fr|ar|en)\/(login|register)/) || path.startsWith('/login') || path.startsWith('/register')
    const isAdminRoute = path.match(/^\/(fr|ar|en)\/admin/) || path.startsWith('/admin')
    const isDashboardRoute = path.match(/^\/(fr|ar|en)\/dashboard/) || path.startsWith('/dashboard')
    const isApiRoute = path.startsWith('/api/')
    const isRoot = path === '/' || path.match(/^\/(fr|ar|en)(\/)?$/)

    const isPublicRoute = isRoot || isAuthRoute || isApiRoute

    if (!user && !isPublicRoute && !isAdminRoute) {
        // If user is not logged in, redirect to login page for protected routes
        const url = request.nextUrl.clone()
        const redirectTo = url.pathname + url.search
        // We let next-intl handle the prefixing if we redirect to /login
        url.pathname = '/login'
        url.search = `?next=${encodeURIComponent(redirectTo)}`
        return NextResponse.redirect(url)
    }

    // Role-based protection for /admin and /dashboard
    if (isAdminRoute || isDashboardRoute) {
        if (!user) {
            const url = request.nextUrl.clone()
            const redirectTo = url.pathname + url.search
            url.pathname = '/login'
            url.search = `?next=${encodeURIComponent(redirectTo)}`
            return NextResponse.redirect(url)
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single()

        if (isAdminRoute && !profile?.is_admin) {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }

        if (isDashboardRoute && profile?.is_admin) {
            const url = request.nextUrl.clone()
            url.pathname = '/admin'
            return NextResponse.redirect(url)
        }
    }

    // If user is logged in and hits root or auth route, redirect properly
    if (user && (isRoot || isAuthRoute)) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single()

        const url = request.nextUrl.clone()
        url.pathname = profile?.is_admin ? '/admin' : '/dashboard'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
