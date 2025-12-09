/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    // Base path for subdirectory deployment (comment out for root deployment)
    // basePath: '/evomeme',
    // assetPrefix: '/evomeme',
    images: {
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    webpack: (config, { isServer }) => {
        // sql.js and sharp are pure JS/WASM, no externals needed
        return config;
    },
    // Optimize for production
    compress: true,
    poweredByHeader: false,
    reactStrictMode: true,

    // Explicitly expose environment variables to server-side code
    env: {
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
        OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
        HUGGING_FACE_ACCESS_TOKEN: process.env.HUGGING_FACE_ACCESS_TOKEN,
        HUGGING_FACE_MODEL: process.env.HUGGING_FACE_MODEL,
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
        RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX,
        RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
        SESSION_SECRET: process.env.SESSION_SECRET,
    },
};

module.exports = nextConfig;
