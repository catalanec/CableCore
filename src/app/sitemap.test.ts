import { describe, it, expect } from 'vitest';
import sitemap from './sitemap';
import { SEO_PAGES } from '@/lib/seo-data';

const BASE_URL = 'https://cablecore.es';

function entryFor(url: string) {
    return sitemap().find(e => e.url === url);
}

describe('sitemap lastModified', () => {
    it('reports the page-specific update date for a service page that declares one', () => {
        const updated = SEO_PAGES.filter(p => p.updated);
        expect(updated.length).toBeGreaterThan(0);

        for (const page of updated) {
            for (const locale of ['es', 'en', 'ru']) {
                const entry = entryFor(`${BASE_URL}/${locale}/servicios/${page.slug}`);
                expect(entry, `${locale}/${page.slug} missing from sitemap`).toBeDefined();
                expect(
                    entry!.lastModified,
                    `${locale}/${page.slug} must report its own update date, not the shared fallback`
                ).toBe(page.updated);
            }
        }
    });

    it('never reports a lastModified newer than today', () => {
        const now = Date.now();
        for (const entry of sitemap()) {
            const stamp = new Date(entry.lastModified as string).getTime();
            expect(Number.isNaN(stamp), `${entry.url} has an unparsable lastModified`).toBe(false);
            expect(stamp, `${entry.url} is dated in the future`).toBeLessThanOrEqual(now);
        }
    });

    it('keeps blog entries on their own article date', () => {
        const blog = sitemap().filter(e => e.url.includes('/blog/'));
        expect(blog.length).toBeGreaterThan(0);
        const distinct = new Set(blog.map(e => String(e.lastModified)));
        expect(distinct.size).toBeGreaterThan(1);
    });
});
