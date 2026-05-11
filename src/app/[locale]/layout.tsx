import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const BASE_URL = 'https://cablecore.es';
const HREFLANG_MAP: Record<string, string> = {
    es: 'es-ES',
    en: 'en-US',
    ru: 'ru-RU',
};

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export function generateMetadata({
    params,
}: {
    params: { locale: string };
}): Metadata {
    const { locale } = params;
    const languages: Record<string, string> = {};
    routing.locales.forEach((loc) => {
        languages[HREFLANG_MAP[loc]] = `${BASE_URL}/${loc}`;
    });
    languages['x-default'] = `${BASE_URL}/es`;
    return {
        alternates: {
            canonical: `${BASE_URL}/${locale}`,
            languages,
        },
    };
}

export default async function LocaleLayout({
    children,
    params: { locale },
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    const messages = await getMessages();

    return (
        <NextIntlClientProvider messages={messages}>
            {children}
        </NextIntlClientProvider>
    );
}
