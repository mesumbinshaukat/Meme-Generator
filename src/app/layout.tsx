import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'EvoMeme AI - Evolutionary Meme Generator',
    description: 'Create and evolve hilarious memes with AI. Generate unique memes and watch them evolve through mutations.',
    keywords: ['meme generator', 'AI memes', 'evolutionary memes', 'free meme maker'],
    authors: [{ name: 'EvoMeme AI' }],
    openGraph: {
        title: 'EvoMeme AI - Evolutionary Meme Generator',
        description: 'Create and evolve hilarious memes with AI',
        type: 'website',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <ColorSchemeScript />
            </head>
            <body>
                <MantineProvider>
                    <Notifications position="top-right" />
                    {children}
                </MantineProvider>
            </body>
        </html>
    );
}
