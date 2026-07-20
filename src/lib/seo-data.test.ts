import { describe, it, expect } from 'vitest';
import { getAllPages, getPageBySlug, SEO_PAGES } from './seo-data';
import { SEO_PAGES_ES } from './seo-data/es';
import { SEO_PAGES_EN } from './seo-data/en';
import { SEO_PAGES_RU } from './seo-data/ru';

describe('SEO_PAGES', () => {
    it('exposes the Spanish pages as the default/fallback export', () => {
        expect(SEO_PAGES).toBe(SEO_PAGES_ES);
    });
});

describe('getAllPages', () => {
    it('returns the Spanish page set by default', () => {
        expect(getAllPages()).toBe(SEO_PAGES_ES);
    });

    it('returns the English page set for locale "en"', () => {
        expect(getAllPages('en')).toBe(SEO_PAGES_EN);
    });

    it('returns the Russian page set for locale "ru"', () => {
        expect(getAllPages('ru')).toBe(SEO_PAGES_RU);
    });

    it('falls back to Spanish for an unrecognized locale', () => {
        expect(getAllPages('fr')).toBe(SEO_PAGES_ES);
    });
});

describe('getPageBySlug', () => {
    it('finds a known Spanish page by slug', () => {
        const page = getPageBySlug('instalacion-cable-red-barcelona', 'es');
        expect(page).toBeDefined();
        expect(page?.slug).toBe('instalacion-cable-red-barcelona');
    });

    it('finds a page in the English set when locale is "en"', () => {
        const page = getPageBySlug(SEO_PAGES_EN[0].slug, 'en');
        expect(page).toEqual(SEO_PAGES_EN[0]);
    });

    it('finds a page in the Russian set when locale is "ru"', () => {
        const page = getPageBySlug(SEO_PAGES_RU[0].slug, 'ru');
        expect(page).toEqual(SEO_PAGES_RU[0]);
    });

    it('returns undefined when the slug does not exist', () => {
        expect(getPageBySlug('this-slug-does-not-exist', 'es')).toBeUndefined();
    });

    it('defaults to the Spanish set when locale is omitted', () => {
        const page = getPageBySlug('instalacion-cable-red-barcelona');
        expect(page?.slug).toBe('instalacion-cable-red-barcelona');
    });
});
