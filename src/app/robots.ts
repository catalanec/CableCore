import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                // next/font self-hosts fonts and auto-injects a preload <link> for
                // them; Googlebot sometimes follows that and tries (and fails) to
                // index the binary font file, showing up in GSC as a harmless
                // "Crawled - currently not indexed" entry. Excluding just the media
                // path (not all of /_next/static/) keeps JS/CSS crawlable, which
                // Google still needs to render the page.
                disallow: ['/api/', '/es/admin/', '/en/admin/', '/ru/admin/', '/_next/static/media/'],
            },
        ],
        sitemap: 'https://cablecore.es/sitemap.xml',
        host: 'https://cablecore.es',
    };
}
