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
        const adminUser = process.env.ADMIN_USER;
        const adminPass = process.env.ADMIN_PASSWORD;
        if (!adminUser || !adminPass) {
            return new NextResponse('Server misconfigured', { status: 500 });
        }

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

    // Strip trailing slash before passing to intl middleware to avoid redirect chains
    // e.g. /es/ → /es prevents GSC "Redirect error" caused by two-hop redirect
    const pathname = req.nextUrl.pathname;
    if (pathname.length > 1 && pathname.endsWith('/')) {
        const url = req.nextUrl.clone();
        url.pathname = pathname.slice(0, -1);
        const r = NextResponse.redirect(url, { status: 308 });
        r.headers.delete('refresh');
        return r;
    }

    const response = intlMiddleware(req);
    // next-intl uses 307 (temporary) — change to 308 (permanent) for SEO
    if (response.status === 307) {
        const location = response.headers.get('Location');
        if (location) {
            return NextResponse.redirect(location, { status: 308 });
        }
    }
    return response;
}

export const config = {
    matcher: ['/', '/(es|en|ru)/:path*', '/((?!api|_next|_vercel|.*\..*).*)'],
};
