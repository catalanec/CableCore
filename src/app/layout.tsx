import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import Script from 'next/script';
import { getLocale } from 'next-intl/server';
import { getWebSiteJsonLd } from '@/lib/seo-metadata';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import './globals.css';

const GA_ID = 'G-TJV2HYNQ9L';

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
        'verificación de redes',
        'precio punto de red Barcelona',
        'empresas de cableado estructurado',
        'empalme fibra óptica Barcelona',
        'fusión fibra óptica Barcelona',
        'instalación fibra óptica Barcelona',
        'splicing fibra óptica Barcelona',
        'técnico fibra óptica Barcelona',
        'reparación fibra óptica Barcelona',
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

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const webSiteJsonLd = getWebSiteJsonLd();
    // Every page declared itself Spanish, including the English and Russian
    // ones. Google Search Console showed the consequence: 46 pages "Crawled —
    // currently not indexed", almost all of them /en/ and /ru/. Those pages
    // send hreflang saying en-US or ru-RU, sit on a Spanish-looking URL, and
    // then declared lang="es" — so the strongest signal on the page said they
    // were another copy of the Spanish version that Google had already
    // indexed. /en/blog/cat6-vs-cat6a-vs-cat7-diferencias carries 1570
    // impressions and zero clicks, which is what being shown to the wrong
    // audience looks like.
    //
    // The root layout owns <html> and sits above [locale], so the locale comes
    // from next-intl's middleware rather than from params.
    const locale = await getLocale();

    return (
        <html lang={locale} className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
            <head>
                <link rel="icon" type="image/png" href="/favicon.png" />
                <link rel="apple-touch-icon" href="/favicon.png" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
                />
            </head>
            <body className="font-body bg-[#09090b] text-white antialiased">
                {/* Google Analytics 4 */}
                <Script
                    src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                    strategy="afterInteractive"
                />
                <Script id="ga4-init" strategy="afterInteractive">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${GA_ID}', {
                            page_path: window.location.pathname,
                            send_page_view: true
                        });
                        // Custom events helpers
                        window.trackEvent = function(name, params) {
                            gtag('event', name, params || {});
                        };
                    `}
                </Script>
                {children}
                <WhatsAppButton />
            </body>
        </html>
    );
}

