import { describe, it, expect } from 'vitest';
import {
    generatePageMetadata,
    getLocalBusinessJsonLd,
    getWebSiteJsonLd,
    getBreadcrumbJsonLd,
    getFAQJsonLd,
    BASE_URL,
} from './seo-metadata';

describe('generatePageMetadata', () => {
    it('returns an empty object for an unknown page key', () => {
        expect(generatePageMetadata('nonexistent-page', 'es')).toEqual({});
    });

    it('returns the Spanish title/description for a known page and locale', () => {
        const meta = generatePageMetadata('home', 'es');
        expect(meta.title).toContain('Barcelona');
        expect(meta.description).toContain('☎');
    });

    it('falls back to Spanish content when the locale has no translation entry', () => {
        const meta = generatePageMetadata('home', 'fr');
        const esMeta = generatePageMetadata('home', 'es');
        expect(meta.title).toBe(esMeta.title);
    });

    it('defaults to Spanish when locale is an empty string', () => {
        const meta = generatePageMetadata('home', '');
        const esMeta = generatePageMetadata('home', 'es');
        expect(meta.title).toBe(esMeta.title);
    });

    it('builds canonical and alternate-language URLs including x-default', () => {
        const meta = generatePageMetadata('contacto', 'en', '/some-path') as { alternates: { canonical: string; languages: Record<string, string> } };
        expect(meta.alternates.canonical).toBe(`${BASE_URL}/en/some-path`);
        expect(meta.alternates.languages['es-ES']).toBe(`${BASE_URL}/es/some-path`);
        expect(meta.alternates.languages['x-default']).toBe(`${BASE_URL}/es/some-path`);
    });

    it('includes OpenGraph and Twitter card metadata', () => {
        const meta = generatePageMetadata('calculator', 'ru') as Record<string, any>;
        expect(meta.openGraph.locale).toBe('ru-RU');
        expect(meta.twitter.card).toBe('summary_large_image');
    });
});

describe('getLocalBusinessJsonLd', () => {
    it('returns a schema.org LocalBusiness object with the expected structured fields', () => {
        const jsonLd = getLocalBusinessJsonLd();
        expect(jsonLd['@type']).toBe('LocalBusiness');
        expect(jsonLd.address.addressCountry).toBe('ES');
        expect(jsonLd.areaServed.length).toBeGreaterThan(0);
        expect(jsonLd.hasOfferCatalog.itemListElement.length).toBeGreaterThan(0);
    });
});

describe('getWebSiteJsonLd', () => {
    it('returns a schema.org WebSite object referencing the organization', () => {
        const jsonLd = getWebSiteJsonLd();
        expect(jsonLd['@type']).toBe('WebSite');
        expect(jsonLd.publisher['@id']).toBe(`${BASE_URL}/#organization`);
    });
});

describe('getBreadcrumbJsonLd', () => {
    it('maps items into a positioned BreadcrumbList', () => {
        const jsonLd = getBreadcrumbJsonLd([
            { name: 'Inicio', url: `${BASE_URL}/es` },
            { name: 'Servicios', url: `${BASE_URL}/es/servicios` },
        ]);
        expect(jsonLd.itemListElement).toHaveLength(2);
        expect(jsonLd.itemListElement[0].position).toBe(1);
        expect(jsonLd.itemListElement[1].position).toBe(2);
    });

    it('returns an empty itemListElement for an empty input array', () => {
        expect(getBreadcrumbJsonLd([]).itemListElement).toEqual([]);
    });
});

describe('getFAQJsonLd', () => {
    it('maps question/answer pairs into an FAQPage schema', () => {
        const jsonLd = getFAQJsonLd([{ question: '¿Cuánto cuesta?', answer: 'Depende del proyecto.' }]);
        expect(jsonLd['@type']).toBe('FAQPage');
        expect(jsonLd.mainEntity[0].name).toBe('¿Cuánto cuesta?');
        expect(jsonLd.mainEntity[0].acceptedAnswer.text).toBe('Depende del proyecto.');
    });
});
