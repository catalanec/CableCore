import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/es/admin/', '/en/admin/', '/ru/admin/'],
            },
        ],
        sitemap: 'https://cablecore.es/sitemap.xml',
        host: 'https://cablecore.es',
    };
}
