import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { SEO_PAGES, getPageBySlug } from '@/lib/seo-data';
import SEOLandingPage from '@/components/seo/SEOLandingPage';

export function generateStaticParams() {
    return SEO_PAGES.map(page => ({
        slug: page.slug,
    }));
}

const BASE_URL = 'https://cablecore.es';
const LOCALES = ['es', 'en', 'ru'];
const HREFLANG_MAP: Record<string, string> = {
    es: 'es-ES',
    en: 'en-US',
    ru: 'ru-RU',
};

export function generateMetadata({ params }: { params: { slug: string; locale: string } }): Metadata {
    const page = getPageBySlug(params.slug);
    if (!page) return {};

    const alternates: Record<string, string> = {};
    LOCALES.forEach(loc => {
        alternates[HREFLANG_MAP[loc]] = `${BASE_URL}/${loc}/servicios/${page.slug}`;
    });
    alternates['x-default'] = `${BASE_URL}/es/servicios/${page.slug}`;

    return {
        title: page.title,
        description: page.metaDescription,
        alternates: {
            canonical: `${BASE_URL}/${params.locale}/servicios/${page.slug}`,
            languages: alternates,
        },
        openGraph: {
            title: page.title,
            description: page.metaDescription,
            url: `${BASE_URL}/${params.locale}/servicios/${page.slug}`,
            siteName: 'CableCore',
            locale: HREFLANG_MAP[params.locale] || 'es_ES',
            type: 'website',
        },
    };
}

export default function ServicePage({ params }: { params: { slug: string } }) {
    const page = getPageBySlug(params.slug);
    if (!page) notFound();
    return <SEOLandingPage data={page} />;
}
