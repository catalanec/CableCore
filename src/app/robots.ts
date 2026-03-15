const BASE_URL = 'https://cablecore.es';

export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/admin/'],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
