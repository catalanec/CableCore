import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { generatePageMetadata } from '@/lib/seo-metadata';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
    return generatePageMetadata('contacto', params.locale, '/contacto');
}

export default function ContactoLayout({ children, params }: { children: React.ReactNode; params: { locale: string } }) {
    setRequestLocale(params.locale);

    return <>{children}</>;
}
