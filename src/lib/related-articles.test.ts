import { describe, it, expect } from 'vitest';
import { pickRelatedArticles } from './related-articles';
import type { BlogArticle } from './blog-data';

function article(slug: string, over: Partial<BlogArticle> = {}): BlogArticle {
    return {
        slug,
        title: slug,
        metaTitle: slug,
        metaDescription: slug,
        excerpt: slug,
        date: '2026-01-01',
        readTime: '5 min',
        category: 'Guías',
        tags: [],
        content: [],
        ...over,
    };
}

const current = article('actual', { tags: ['fibra óptica', 'Barcelona'], category: 'Guías', date: '2026-06-01' });

describe('pickRelatedArticles', () => {
    it('never links an article to itself', () => {
        const out = pickRelatedArticles([current, article('otra')], current);
        expect(out.map((a) => a.slug)).not.toContain('actual');
    });

    it('ranks a shared tag above a shared category', () => {
        const byTag = article('por-tag', { tags: ['fibra óptica'], category: 'Consejos', date: '2026-06-01' });
        const byCategory = article('por-categoria', { tags: [], category: 'Guías', date: '2026-06-01' });
        const out = pickRelatedArticles([byCategory, byTag], current, 2);
        expect(out.map((a) => a.slug)).toEqual(['por-tag', 'por-categoria']);
    });

    it('ranks two shared tags above one', () => {
        const one = article('una', { tags: ['fibra óptica'], date: '2026-06-01' });
        const two = article('dos', { tags: ['fibra óptica', 'Barcelona'], date: '2026-06-01' });
        const out = pickRelatedArticles([one, two], current, 2);
        expect(out[0].slug).toBe('dos');
    });

    it('matches tags case-insensitively, since they are typed by hand', () => {
        const upper = article('mayus', { tags: ['FIBRA ÓPTICA'], category: 'Consejos' });
        const none = article('ninguna', { tags: ['rack'], category: 'Consejos' });
        const out = pickRelatedArticles([none, upper], current, 1);
        expect(out[0].slug).toBe('mayus');
    });

    it('prefers the more recent article when scores tie', () => {
        const old = article('vieja', { tags: ['fibra óptica'], date: '2025-01-01' });
        const fresh = article('nueva', { tags: ['fibra óptica'], date: '2026-05-01' });
        const out = pickRelatedArticles([old, fresh], current, 1);
        expect(out[0].slug).toBe('nueva');
    });

    it('is stable across calls so the rendered HTML does not churn between builds', () => {
        const pool = ['c', 'a', 'b'].map((s) => article(s, { tags: ['fibra óptica'], date: '2026-06-01' }));
        const first = pickRelatedArticles(pool, current, 3).map((a) => a.slug);
        const second = pickRelatedArticles([...pool].reverse(), current, 3).map((a) => a.slug);
        expect(first).toEqual(second);
        expect(first).toEqual(['a', 'b', 'c']);
    });

    it('still returns something when nothing shares a tag or category', () => {
        const unrelated = [article('x', { tags: ['rack'], category: 'Precios' })];
        expect(pickRelatedArticles(unrelated, current, 4)).toHaveLength(1);
    });

    it('caps the result at the requested limit', () => {
        const pool = Array.from({ length: 20 }, (_, i) => article(`a${i}`, { tags: ['fibra óptica'] }));
        expect(pickRelatedArticles(pool, current, 4)).toHaveLength(4);
    });

    it('returns nothing for a non-positive limit rather than the whole list', () => {
        const pool = [article('x'), article('y')];
        expect(pickRelatedArticles(pool, current, 0)).toEqual([]);
    });

    it('survives an unparseable date instead of ordering by NaN', () => {
        const broken = article('rota', { tags: ['fibra óptica'], date: 'no-es-fecha' });
        const good = article('buena', { tags: ['fibra óptica'], date: '2026-05-01' });
        const out = pickRelatedArticles([broken, good], current, 2);
        expect(out.map((a) => a.slug)).toEqual(['buena', 'rota']);
    });

    it('handles an empty pool', () => {
        expect(pickRelatedArticles([], current)).toEqual([]);
    });
});

describe('покрытие: ни одной статьи без входящих ссылок', () => {
    it('links every article at least once across the whole set', () => {
        // Scoring alone left nine of the real thirty-six articles with no
        // inbound link while one collected twenty-two. The ring slot is what
        // makes that impossible; this test is the reason it exists.
        const pool = Array.from({ length: 30 }, (_, i) =>
            article(`art-${String(i).padStart(2, '0')}`, {
                // one dominant tag, exactly the shape that caused the pile-up
                tags: i % 5 === 0 ? ['redes', 'fibra óptica'] : ['redes'],
                date: `2026-0${(i % 9) + 1}-01`,
            }),
        );
        const inbound = new Map(pool.map((a) => [a.slug, 0]));
        for (const a of pool) {
            for (const r of pickRelatedArticles(pool, a, 4)) {
                inbound.set(r.slug, (inbound.get(r.slug) ?? 0) + 1);
            }
        }
        const orphans = Array.from(inbound.entries()).filter(([, n]) => n === 0);
        expect(orphans).toEqual([]);
    });

    it('always includes the ring successor, even when nothing is topical', () => {
        const a = article('aaa'), b = article('bbb'), c = article('ccc');
        expect(pickRelatedArticles([a, b, c], a, 1).map((x) => x.slug)).toEqual(['bbb']);
        expect(pickRelatedArticles([a, b, c], c, 1).map((x) => x.slug)).toEqual(['aaa']);
    });

    it('does not list the successor twice when it also scores highest', () => {
        const cur = article('aaa', { tags: ['x'] });
        const nxt = article('bbb', { tags: ['x'] });
        const out = pickRelatedArticles([cur, nxt, article('ccc')], cur, 4);
        expect(out.filter((x) => x.slug === 'bbb')).toHaveLength(1);
    });
});
