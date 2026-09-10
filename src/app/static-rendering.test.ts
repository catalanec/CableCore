import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const LOCALE_DIR = join(process.cwd(), 'src/app/[locale]');

// The admin area is deliberately dynamic: it sits behind Basic Auth in
// middleware and reads live CRM data, so it must not be statically rendered.
const DELIBERATELY_DYNAMIC = ['admin'];

// A 'use client' route cannot call a server-only API. Where one exists, the
// sibling layout.tsx declares the locale for that route instead.
function isClientComponent(source: string): boolean {
    return /^\s*['"]use client['"]/.test(source);
}

function pagesUnderLocale(dir: string, rel = ''): string[] {
    return readdirSync(dir).flatMap(entry => {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
            if (DELIBERATELY_DYNAMIC.includes(entry)) return [];
            return pagesUnderLocale(full, join(rel, entry));
        }
        return entry === 'page.tsx' || entry === 'layout.tsx' ? [join(rel, entry)] : [];
    });
}

describe('static rendering under [locale]', () => {
    const files = pagesUnderLocale(LOCALE_DIR);

    it('finds the route files to check', () => {
        expect(files.length).toBeGreaterThan(10);
    });

    // next-intl resolves the locale from a request header unless the route
    // declares it up front. Reading a header opts the route out of static
    // rendering, so every page was being rendered per request — served with
    // `private, no-cache, no-store` and x-vercel-cache: MISS on every hit,
    // despite being listed as prerendered in the build output.
    it.each(files)('%s declares its locale so it can render statically', file => {
        const source = readFileSync(join(LOCALE_DIR, file), 'utf8');
        if (isClientComponent(source)) {
            const layout = join(LOCALE_DIR, file.replace(/page\.tsx$/, 'layout.tsx'));
            expect(
                readFileSync(layout, 'utf8').includes('setRequestLocale'),
                `${file} is a client component, so its sibling layout.tsx must declare the locale`
            ).toBe(true);
            return;
        }
        expect(
            source.includes('setRequestLocale'),
            `${file} must call setRequestLocale(locale) — without it next-intl reads a header and the route turns dynamic`
        ).toBe(true);
    });
});
