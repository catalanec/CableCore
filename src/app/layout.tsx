import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
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
    title: 'CableCore — Instalación de Redes y Cableado Estructurado en Barcelona',
    description: 'Especialistas en instalación de cable de red, cableado estructurado y puntos de red en Barcelona y alrededores.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
            <head>
                <link rel="icon" href="/logocablecore.png" />
            </head>
            <body className="font-body bg-[#09090b] text-white antialiased">
                {children}
            </body>
        </html>
    );
}
