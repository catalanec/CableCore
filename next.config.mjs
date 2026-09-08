import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        formats: ['image/avif', 'image/webp'],
    },
    staticPageGenerationTimeout: 300,
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    experimental: {
        workerThreads: false,
    },
    async redirects() {
        return [
            {
                source: '/servicios/:slug',
                destination: '/es/servicios/:slug',
                permanent: true,
            },
            {
                source: '/blog/:slug',
                destination: '/es/blog/:slug',
                permanent: true,
            },
            // The :slug rules above never matched the section roots, so
            // /blog and /servicios answered 404 — the two most obvious URLs
            // a person or a crawler would try by hand.
            {
                source: '/servicios',
                destination: '/es/servicios',
                permanent: true,
            },
            {
                source: '/blog',
                destination: '/es/blog',
                permanent: true,
            },
        ];
    },
    async headers() {
        return [
            {
                // Search Console was reporting a hashed .woff2 as a page it had
                // crawled and declined to index. Build output is not content;
                // keep it out of the index and out of the coverage report.
                source: '/_next/static/:path*',
                headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
            },
        ];
    },
};

export default withNextIntl(nextConfig);
