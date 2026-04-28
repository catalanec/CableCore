import { SEO_PAGES_ES } from './seo-data/es';
import { SEO_PAGES_EN } from './seo-data/en';
import { SEO_PAGES_RU } from './seo-data/ru';
import { SEOPageConfig } from './seo-data/types';

export const SEO_PAGES = SEO_PAGES_ES; // fallback, used for slugs

export function getAllPages(locale: string = 'es'): SEOPageConfig[] {
    if (locale === 'en') return SEO_PAGES_EN;
    if (locale === 'ru') return SEO_PAGES_RU;
    return SEO_PAGES_ES;
}

export function getPageBySlug(slug: string, locale: string = 'es'): SEOPageConfig | undefined {
    if (locale === 'en') return SEO_PAGES_EN.find(p => p.slug === slug);
    if (locale === 'ru') return SEO_PAGES_RU.find(p => p.slug === slug);
    return SEO_PAGES_ES.find(p => p.slug === slug);
}
