import { SEO_PAGES } from '@/lib/seo-data';
import { BLOG_ARTICLES } from '@/lib/blog-data';
import type { MetadataRoute } from 'next';

const BASE_URL = 'https://cablecore.es';
const PRIMARY_LOCALE = 'es';
const SECONDARY_LOCALES = ['en', 'ru'];
const ALL_LOCALES = [PRIMARY_LOCALE, ...SECONDARY_LOCALES];

// Priority multiplier for non-primary locales (Google focuses on primary first)
const SECONDARY_PRIORITY_FACTOR = 0.5;

function generateAlternates(path: string) {
    const languages: Record<string, string> = {
        'x-default': `${BASE_URL}${path}`, // x-default points to base without locale (which middleware redirects to /es) or /es. Usually better to point x-default to the root redirector.
    };
    ALL_LOCALES.forEach(loc => {
        languages[loc] = `${BASE_URL}/${loc}${path}`;
    });
    return { languages };
}

export default function sitemap(): MetadataRoute.Sitemap {
    const staticPages = [
        { path: '', changeFreq: 'weekly' as const, basePriority: 1.0 },
        { path: '/servicios', changeFreq: 'weekly' as const, basePriority: 0.9 },
        { path: '/calculator', changeFreq: 'monthly' as const, basePriority: 0.9 },
        { path: '/blog', changeFreq: 'daily' as const, basePriority: 0.8 },
        { path: '/contacto', changeFreq: 'monthly' as const, basePriority: 0.8 },
        { path: '/proceso', changeFreq: 'monthly' as const, basePriority: 0.7 },
        { path: '/proyectos', changeFreq: 'monthly' as const, basePriority: 0.7 },
        { path: '/nosotros', changeFreq: 'monthly' as const, basePriority: 0.6 },
    ];

    const now = new Date().toISOString();

    // Static pages — primary locale first with high priority
    const staticUrls = staticPages.flatMap(page =>
        ALL_LOCALES.map(locale => ({
            url: `${BASE_URL}/${locale}${page.path}`,
            lastModified: now,
            changeFrequency: page.changeFreq,
            priority: locale === PRIMARY_LOCALE
                ? page.basePriority
                : Math.round(page.basePriority * SECONDARY_PRIORITY_FACTOR * 10) / 10,
            alternates: generateAlternates(page.path),
        }))
    );

    // SEO landing pages — high priority for primary locale
    const seoUrls = SEO_PAGES.flatMap(page =>
        ALL_LOCALES.map(locale => ({
            url: `${BASE_URL}/${locale}/servicios/${page.slug}`,
            lastModified: now,
            changeFrequency: 'weekly' as const,
            priority: locale === PRIMARY_LOCALE ? 0.9 : 0.4,
            alternates: generateAlternates(`/servicios/${page.slug}`),
        }))
    );

    // Blog articles — sorted by date, primary locale prioritized
    const sortedArticles = [...BLOG_ARTICLES].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const blogUrls = sortedArticles.flatMap(article =>
        ALL_LOCALES.map(locale => ({
            url: `${BASE_URL}/${locale}/blog/${article.slug}`,
            lastModified: article.date,
            changeFrequency: 'monthly' as const,
            priority: locale === PRIMARY_LOCALE ? 0.8 : 0.3,
            alternates: generateAlternates(`/blog/${article.slug}`),
        }))
    );

    return [...staticUrls, ...seoUrls, ...blogUrls];
}
