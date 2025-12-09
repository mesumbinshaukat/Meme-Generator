import { Metadata } from 'next';

interface GenerateMetadataOptions {
    title: string;
    description: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article';
}

/**
 * Generate comprehensive metadata for SEO and social sharing
 */
export function generateMetadata(options: GenerateMetadataOptions): Metadata {
    const {
        title,
        description,
        image = '/og-image.png',
        url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        type = 'website',
    } = options;

    const fullTitle = `${title} | EvoMeme AI`;

    return {
        title: fullTitle,
        description,
        keywords: [
            'meme generator',
            'AI memes',
            'evolutionary memes',
            'meme maker',
            'free meme generator',
            'AI caption generator',
            'meme evolution',
            'funny memes',
        ],
        authors: [{ name: 'EvoMeme AI' }],
        creator: 'EvoMeme AI',
        publisher: 'EvoMeme AI',
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        openGraph: {
            type,
            locale: 'en_US',
            url,
            title: fullTitle,
            description,
            siteName: 'EvoMeme AI',
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description,
            images: [image],
            creator: '@evomemeai',
        },
        alternates: {
            canonical: url,
        },
    };
}

/**
 * Generate JSON-LD structured data for meme
 */
export function generateMemeStructuredData(meme: {
    id: string;
    caption: string;
    imageUrl: string;
    templateName: string;
    createdAt: string;
}) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    return {
        '@context': 'https://schema.org',
        '@type': 'ImageObject',
        contentUrl: `${baseUrl}${meme.imageUrl}`,
        name: meme.caption,
        description: `${meme.templateName} meme: ${meme.caption}`,
        datePublished: meme.createdAt,
        creator: {
            '@type': 'Organization',
            name: 'EvoMeme AI',
        },
        copyrightNotice: 'Free to use',
        license: 'https://creativecommons.org/publicdomain/zero/1.0/',
    };
}

/**
 * Generate JSON-LD structured data for website
 */
export function generateWebsiteStructuredData() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'EvoMeme AI',
        description: 'AI-powered evolutionary meme generator with intelligent mutations',
        url: baseUrl,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${baseUrl}/generate?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };
}
