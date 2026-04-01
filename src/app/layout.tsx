import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { getLocalBusinessJsonLd, getWebSiteJsonLd } from '@/lib/seo-metadata';
import './globals.css';

const inter = Inter({
    subsets: ['latin', 'cyrillic'],
    variable: '--font-inter',
    display: 'swap',
});

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
    display: 'swap',
});

export const metadata: Metadata = {
    metadataBase: new URL('https://cablecore.es'),
    title: {
        default: 'CableCore — Instalación de Redes y Cableado Estructurado en Barcelona',
        template: '%s | CableCore',
    },
    description: 'Especialistas en instalación de cable de red, cableado estructurado Cat6/Cat6A/Cat7, puntos de red y racks en Barcelona. ☎ +34 605 974 605',
    keywords: [
        'instalación cable de red Barcelona',
        'cableado estructurado Barcelona',
        'instalador red Barcelona',
        'cable Cat6 Barcelona',
        'cable Cat6A Barcelona',
        'cable Cat7 Barcelona',
        'punto de red Barcelona',
        'rack de red Barcelona',
        'RJ45 Barcelona',
        'red para oficina Barcelona',
        'red para hogar Barcelona',
        'LAN y WLAN corporativo',
        'certificación Fluke Networks',
        'precio punto de red Barcelona',
        'empresas de cableado estructurado',
    ],
    authors: [{ name: 'CableCore', url: 'https://cablecore.es' }],
    creator: 'CableCore',
    publisher: 'CableCore',
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
        type: 'website',
        siteName: 'CableCore',
        locale: 'es_ES',
        alternateLocale: ['en_US', 'ru_RU'],
        images: [{
            url: '/images/og-image.png',
            width: 1200,
            height: 630,
            alt: 'CableCore — Instalación de Redes en Barcelona',
        }],
    },
    twitter: {
        card: 'summary_large_image',
    },
    verification: {
        google: 'QzY_SCP1DlgGiC4N1HFl3XF2G-UalgZMl-FHBoUSj24',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const localBusinessJsonLd = getLocalBusinessJsonLd();
    const webSiteJsonLd = getWebSiteJsonLd();

    return (
        <html className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
            <head>
                <link rel="icon" type="image/png" href="/favicon.png" />
                <link rel="apple-touch-icon" href="/favicon.png" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
                />
            </head>
            <body className="font-body bg-[#09090b] text-white antialiased">
                {children}
            </body>
        </html>
    );
}

