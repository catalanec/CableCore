import createMiddleware from 'next-intl/middleware';
import { defineRouting } from 'next-intl/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const routing = defineRouting({
    locales: ['es', 'en', 'ru'],
    defaultLocale: 'es',
    localePrefix: 'always',
});

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
    if (req.nextUrl.pathname.includes('/admin')) {
        const basicAuth = req.headers.get('authorization');
        const adminUser = process.env.ADMIN_USER || 'admin';
        const adminPass = process.env.ADMIN_PASSWORD || 'secretadmin24';

        if (basicAuth) {
            const authValue = basicAuth.split(' ')[1];
            const [user, pwd] = atob(authValue).split(':');
            if (user === adminUser && pwd === adminPass) {
                return intlMiddleware(req);
            }
        }

        return new NextResponse('Authentication required', {
            status: 401,
            headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' },
        });
    }

    const response = intlMiddleware(req);
    // next-intl uses 307 (temporary) — change to 308 (permanent) for SEO
    if (response.status === 307) {
        return new Response(null, { status: 308, headers: response.headers });
    }
    return response;
}

export const config = {
    matcher: ['/', '/(es|en|ru)/:path*', '/((?!api|_next|_vercel|.*\..*).*)'],
};
