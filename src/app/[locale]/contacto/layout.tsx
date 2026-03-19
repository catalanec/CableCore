import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo-metadata';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
    return generatePageMetadata('contacto', params.locale, '/contacto');
}

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
    return children;
}
