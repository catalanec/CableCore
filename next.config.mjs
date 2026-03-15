import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        formats: ['image/avif', 'image/webp'],
    },
    staticPageGenerationTimeout: 300,
    experimental: {
        workerThreads: false,
    },
};

export default withNextIntl(nextConfig);
