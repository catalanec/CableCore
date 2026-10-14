import { describe, it, expect } from 'vitest';
import { getAllPages } from './seo-data';
import { CARD_LINKS, HUB_COPY, HUB_GROUPS, groupPages } from './services-hub';
import sitemap from '../app/sitemap';

const LOCALES = ['es', 'en', 'ru'] as const;

describe('índice de servicios', () => {
    it.each(LOCALES)('%s: cada landing aparece exactamente una vez', (locale) => {
        const pages = getAllPages(locale);
        const shown = groupPages(pages).flatMap((g) => g.pages.map((p) => p.slug));
        expect(shown.sort()).toEqual(pages.map((p) => p.slug).sort());
    });

    it('los grupos sólo nombran landings que existen', () => {
        const slugs = new Set(getAllPages('es').map((p) => p.slug));
        for (const slug of HUB_GROUPS.flatMap((g) => g.slugs)) expect(slugs).toContain(slug);
        for (const slug of Object.values(CARD_LINKS)) expect(slugs).toContain(slug);
    });

    it('una landing nueva sin grupo no desaparece del índice', () => {
        const extra = { ...getAllPages('es')[0], slug: 'instalacion-red-nueva' };
        const groups = groupPages([...getAllPages('es'), extra]);
        expect(groups.at(-1)!.pages.map((p) => p.slug)).toContain('instalacion-red-nueva');
    });

    it.each(LOCALES)('%s: texto propio de la página, no vacío', (locale) => {
        const copy = HUB_COPY[locale];
        for (const key of HUB_GROUPS.map((g) => g.key)) expect(copy.groups[key].text.length).toBeGreaterThan(40);
        expect(copy.guide.map((g) => g.text).join(' ').split(/\s+/).length).toBeGreaterThan(150);
    });

    it('el sitemap anuncia el cambio de /servicios en los tres idiomas', () => {
        const urls = sitemap().filter((u) => /\/(es|en|ru)\/servicios$/.test(u.url));
        expect(urls).toHaveLength(3);
        for (const u of urls) expect(u.lastModified).toBe('2026-10-14T00:00:00.000Z');
    });
});
