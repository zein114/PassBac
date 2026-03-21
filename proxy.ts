import { type NextRequest } from 'next/server'
/**
 * Next.js 16 Proxy (formerly middleware)
 * Must export a function named 'proxy' or a default function.
 */
import createIntlMiddleware from 'next-intl/middleware'
import { updateSession } from '@/utils/supabase/middleware'

const intlMiddleware = createIntlMiddleware({
    locales: ['fr', 'ar'],
    defaultLocale: 'fr',
    localePrefix: 'always'
})

export async function proxy(request: NextRequest) {
    // 1. Handle locale routing
    const response = intlMiddleware(request)

    // 2. Wrap with Supabase session management
    return await updateSession(request, response)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
