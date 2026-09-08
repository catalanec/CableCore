import { describe, it, expect } from 'vitest';
import { normaliseSlug, isDuplicateSlug, dedupeBySlug } from './blog-dedup';
import blogData from './blog-data.json';

const COWORKINGS = 'cableado-de-red-para-coworkings-y-espacios-de-oficina-compartida';

describe('normaliseSlug', () => {
    it('lowercases and collapses punctuation', () => {
        expect(normaliseSlug('  Guía--WiFi 6E  ')).toBe('gu-a-wifi-6e');
    });

    it('leaves an already-clean slug untouched', () => {
        expect(normaliseSlug(COWORKINGS)).toBe(COWORKINGS);
    });
});

describe('isDuplicateSlug', () => {
    const published = [{ slug: 'guia-wifi-6e-empresas' }, { slug: COWORKINGS }];

    it('catches the exact repeat the publisher actually produced', () => {
        expect(isDuplicateSlug(published, COWORKINGS)).toBe(true);
    });

    it('catches a repeat wearing different capitalisation', () => {
        expect(isDuplicateSlug(published, 'Guia-WiFi-6E-Empresas')).toBe(true);
    });

    it('lets a genuinely new slug through', () => {
        expect(isDuplicateSlug(published, 'cableado-para-hoteles')).toBe(false);
    });

    it('refuses an empty slug rather than publishing an unroutable article', () => {
        expect(isDuplicateSlug(published, '')).toBe(true);
        expect(isDuplicateSlug(published, '   ')).toBe(true);
    });
});

describe('dedupeBySlug', () => {
    it('keeps the first occurrence and drops the rest', () => {
        const out = dedupeBySlug([{ slug: 'a', date: '2026-09-04' }, { slug: 'b' }, { slug: 'a', date: '2026-07-24' }]);
        expect(out.map((a) => a.slug)).toEqual(['a', 'b']);
        expect(out[0].date).toBe('2026-09-04');
    });

    it('is a no-op on clean input', () => {
        const clean = [{ slug: 'a' }, { slug: 'b' }];
        expect(dedupeBySlug(clean)).toEqual(clean);
    });

    it('handles an empty list', () => {
        expect(dedupeBySlug([])).toEqual([]);
    });
});

describe('the shipped blog-data.json', () => {
    it('has no repeated slug — a repeat puts the URL in the sitemap twice', () => {
        const slugs = (blogData as Array<{ slug: string }>).map((a) => normaliseSlug(a.slug));
        const seen = new Set<string>();
        const dupes = slugs.filter((s) => (seen.has(s) ? true : (seen.add(s), false)));
        expect(dupes).toEqual([]);
    });
});
