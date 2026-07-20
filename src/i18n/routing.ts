import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
    locales: ['es', 'en', 'ru'],
    defaultLocale: 'es',
    localePrefix: 'always',
    // Without this, next-intl picks a bare URL's redirect target from the
    // request's Accept-Language header/NEXT_LOCALE cookie. Googlebot crawls
    // the same URL with different simulated language headers as part of its
    // "language-dependent crawling" checks, so the same bare URL could 308
    // to /es/, /en/ or /ru/ on different passes — GSC's "Page with redirect"
    // validator expects a single stable target and flags that instability
    // as unresolved (round 18 audit). Force every bare URL to the default
    // locale deterministically, matching what the sitemap/canonical/hreflang
    // already assume (x-default -> /es/... everywhere).
    localeDetection: false
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
    createNavigation(routing);
