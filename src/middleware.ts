import createMiddleware from 'next-intl/middleware';
import { defineRouting } from 'next-intl/routing';

const routing = defineRouting({
    locales: ['es', 'en', 'ru'],
    defaultLocale: 'es',
});

export default createMiddleware(routing);

export const config = {
    matcher: ['/', '/(es|en|ru)/:path*'],
};
