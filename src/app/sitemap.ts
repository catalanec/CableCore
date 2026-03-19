import { SEO_PAGES } from '@/lib/seo-data';
import { BLOG_ARTICLES } from '@/lib/blog-data';

const BASE_URL = 'https://cablecore.es';
const LOCALES = ['es', 'en', 'ru'];

export default function sitemap() {
    const staticPages = ['', '/servicios', '/proceso', '/proyectos', '/nosotros', '/contacto', '/calculator', '/blog'];

    const staticUrls = LOCALES.flatMap(locale =>
        staticPages.map(page => ({
            url: `${BASE_URL}/${locale}${page}`,
            lastModified: new Date().toISOString(),
            changeFrequency: page === '' ? 'weekly' : 'monthly' as const,
            priority: page === '' ? 1 : page === '/blog' ? 0.8 : 0.8,
        }))
    );

    const seoUrls = SEO_PAGES.flatMap(page =>
        LOCALES.map(locale => ({
            url: `${BASE_URL}/${locale}/servicios/${page.slug}`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'monthly' as const,
            priority: 0.9,
        }))
    );

    const blogUrls = BLOG_ARTICLES.flatMap(article =>
        LOCALES.map(locale => ({
            url: `${BASE_URL}/${locale}/blog/${article.slug}`,
            lastModified: article.date,
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        }))
    );

    return [...staticUrls, ...seoUrls, ...blogUrls];
}
