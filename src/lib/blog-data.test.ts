import { describe, it, expect, vi } from 'vitest';

const MOCK_ARTICLES = [
    {
        slug: 'articulo-uno',
        date: '2026-01-01',
        readTime: '5 min',
        es: { title: 'Título ES', metaTitle: 'Meta ES', metaDescription: 'Desc ES', excerpt: 'Extracto ES', category: 'Guías', tags: ['redes'], content: [] },
        en: { title: 'Title EN', metaTitle: 'Meta EN', metaDescription: 'Desc EN', excerpt: 'Excerpt EN', category: 'Guides', tags: ['networks'], content: [] },
        ru: { title: 'Заголовок RU', metaTitle: 'Мета RU', metaDescription: 'Описание RU', excerpt: 'Отрывок RU', category: 'Гайды', tags: ['сети'], content: [] },
    },
];

vi.mock('./blog-data.json', () => ({ default: MOCK_ARTICLES }));

describe('getBlogArticles', () => {
    it('returns Spanish content for locale "es"', async () => {
        const { getBlogArticles } = await import('./blog-data');
        const [article] = getBlogArticles('es');
        expect(article.title).toBe('Título ES');
        expect(article.slug).toBe('articulo-uno');
    });

    it('returns English content for locale "en"', async () => {
        const { getBlogArticles } = await import('./blog-data');
        const [article] = getBlogArticles('en');
        expect(article.title).toBe('Title EN');
    });

    it('returns Russian content for locale "ru"', async () => {
        const { getBlogArticles } = await import('./blog-data');
        const [article] = getBlogArticles('ru');
        expect(article.title).toBe('Заголовок RU');
    });

    it('falls back to Spanish content for an unsupported/unknown locale', async () => {
        const { getBlogArticles } = await import('./blog-data');
        const [article] = getBlogArticles('fr');
        expect(article.title).toBe('Título ES');
    });

    it('preserves top-level slug/date/readTime alongside localized fields', async () => {
        const { getBlogArticles } = await import('./blog-data');
        const [article] = getBlogArticles('es');
        expect(article.slug).toBe('articulo-uno');
        expect(article.date).toBe('2026-01-01');
        expect(article.readTime).toBe('5 min');
    });

    it('returns an empty array when there are no articles', async () => {
        vi.doMock('./blog-data.json', () => ({ default: [] }));
        vi.resetModules();
        const { getBlogArticles } = await import('./blog-data');
        expect(getBlogArticles('es')).toEqual([]);
    });
});

describe('BLOG_ARTICLES (legacy ES export)', () => {
    it('is equivalent to getBlogArticles("es") at import time', async () => {
        const { BLOG_ARTICLES, getBlogArticles } = await import('./blog-data');
        expect(BLOG_ARTICLES).toEqual(getBlogArticles('es'));
    });
});
