import createMiddleware from 'next-intl/middleware';
import { defineRouting } from 'next-intl/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const routing = defineRouting({
    locales: ['es', 'en', 'ru'],
    defaultLocale: 'es',
});

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
    // Check if the current route is the admin panel
    if (req.nextUrl.pathname.includes('/admin')) {
        const basicAuth = req.headers.get('authorization');
        // You can change these defaults or set them in Vercel Environment Variables
        const adminUser = process.env.ADMIN_USER || 'admin';
        const adminPass = process.env.ADMIN_PASSWORD || 'secretadmin24';

        if (basicAuth) {
            const authValue = basicAuth.split(' ')[1];
            const [user, pwd] = atob(authValue).split(':');

            if (user === adminUser && pwd === adminPass) {
                // Auth correct, pass to i18n routing
                return intlMiddleware(req);
            }
        }

        // If no auth or incorrect, trigger standard browser password prompt
        return new NextResponse('Authentication required', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="Admin Area"',
            },
        });
    }

    // Normal behavior for public pages
    return intlMiddleware(req);
}

export const config = {
        matcher: ['/', '/(es|en|ru)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
