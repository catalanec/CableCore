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
        ];
    },
};

export default withNextIntl(nextConfig);
