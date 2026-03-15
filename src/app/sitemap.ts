import { SEO_PAGES } from '@/lib/seo-data';

const BASE_URL = 'https://cablecore.es';
const LOCALES = ['es', 'en', 'ru'];

export default function sitemap() {
    const staticPages = ['', '/calculator', '/admin'];

    const staticUrls = LOCALES.flatMap(locale =>
        staticPages.map(page => ({
            url: `${BASE_URL}/${locale}${page}`,
            lastModified: new Date().toISOString(),
            changeFrequency: page === '' ? 'weekly' : 'monthly' as const,
            priority: page === '' ? 1 : 0.8,
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

    return [...staticUrls, ...seoUrls];
}
