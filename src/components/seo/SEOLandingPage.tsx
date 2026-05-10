'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { getAllPages } from '@/lib/seo-data';

interface SEOPageData {
    slug: string;
    title: string;
    h1: string;
    h2s: string[];
    intro: string;
    features: { icon: string; title: string; text: string }[];
    faq: { q: string; a: string }[];
    metaDescription: string;
    cta: string;
}

const TRUST_STATS = [
    { value: '500+', label: { es: 'instalaciones realizadas', en: 'installations done', ru: 'установок выполнено' } },
    { value: '5 años', label: { es: 'de experiencia en Barcelona', en: 'years of experience', ru: 'лет опыта' } },
    { value: '24h', label: { es: 'respuesta garantizada', en: 'response guaranteed', ru: 'гарантия ответа' } },
    { value: '5 años', label: { es: 'de garantía en materiales', en: 'materials warranty', ru: 'гарантия на материалы' } },
];

const COVERAGE_CITIES = [
    'Barcelona', "L'Hospitalet", 'Badalona', 'Sabadell', 'Terrassa',
    'Sant Cugat', 'Cornellà', 'Sant Boi', 'Castelldefels', 'Mataró', 'Granollers',
];

function generateJsonLd(data: SEOPageData, locale: string) {
    const BASE = 'https://cablecore.es';

    const localBusiness = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'CableCore',
        description: data.metaDescription,
        url: `${BASE}/${locale}/servicios/${data.slug}`,
        telephone: '+34605974605',
        email: 'info@cablecore.es',
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Carrer Vitor Balaguer 33',
            addressLocality: 'Badalona',
            postalCode: '08914',
            addressRegion: 'Barcelona',
            addressCountry: 'ES',
        },
        geo: { '@type': 'GeoCoordinates', latitude: 41.4500, longitude: 2.2474 },
        openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            opens: '09:00',
            closes: '19:00',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            reviewCount: '5',
            bestRating: '5',
        },
        areaServed: COVERAGE_CITIES.map(city => ({ '@type': 'City', name: city })),
        priceRange: '€€',
        image: `${BASE}/logocablecore.png`,
    };

    const service = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: data.h1,
        description: data.intro,
        provider: {
            '@type': 'LocalBusiness',
            name: 'CableCore',
            telephone: '+34605974605',
            url: BASE,
        },
        areaServed: COVERAGE_CITIES.map(city => ({ '@type': 'City', name: city })),
        url: `${BASE}/${locale}/servicios/${data.slug}`,
    };

    const faqPage = data.faq.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: data.faq.map(item => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
    } : null;

    const breadcrumb = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: locale === 'ru' ? 'Главная' : locale === 'en' ? 'Home' : 'Inicio', item: `${BASE}/${locale}` },
            { '@type': 'ListItem', position: 2, name: locale === 'ru' ? 'Услуги' : locale === 'en' ? 'Services' : 'Servicios', item: `${BASE}/${locale}/servicios` },
            { '@type': 'ListItem', position: 3, name: data.h1, item: `${BASE}/${locale}/servicios/${data.slug}` },
        ],
    };

    return { localBusiness, service, faqPage, breadcrumb };
}

export default function SEOLandingPage({ data }: { data: SEOPageData }) {
    const locale = useLocale();
    const jsonLd = generateJsonLd(data, locale);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const ctaLabels: Record<string, Record<string, string>> = {
        es: { call: 'Llamar ahora', whatsapp: 'WhatsApp', quote: 'Presupuesto gratis', callUs: 'Llámanos', orWrite: 'o escríbenos por WhatsApp', services: 'Servicios', home: 'Inicio', coverage: 'Zona de cobertura', whyUs: '¿Por qué CableCore?', faqTitle: 'Preguntas frecuentes' },
        en: { call: 'Call now', whatsapp: 'WhatsApp', quote: 'Free quote', callUs: 'Call us', orWrite: 'or write us on WhatsApp', services: 'Services', home: 'Home', coverage: 'Coverage area', whyUs: 'Why CableCore?', faqTitle: 'Frequently asked questions' },
        ru: { call: 'Позвонить', whatsapp: 'WhatsApp', quote: 'Бесплатная смета', callUs: 'Звоните', orWrite: 'или напишите в WhatsApp', services: 'Услуги', home: 'Главная', coverage: 'Зона покрытия', whyUs: 'Почему CableCore?', faqTitle: 'Частые вопросы' },
    };
    const cl = ctaLabels[locale] || ctaLabels.es;

    return (
        <>
            <Header />

            {/* JSON-LD Structured Data */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.breadcrumb) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.localBusiness) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.service) }} />
            {jsonLd.faqPage && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.faqPage) }} />
            )}

            <main className="min-h-screen relative z-10 pt-20">

                {/* Breadcrumbs */}
                <Breadcrumbs items={[
                    { label: cl.home, href: '/' },
                    { label: cl.services, href: '/servicios' },
                    { label: data.h1.length > 45 ? data.h1.slice(0, 45) + '…' : data.h1 },
                ]} />

                {/* Hero */}
                <section className="py-14 lg:py-20 border-b border-border-subtle">
                    <div className="container-custom text-center max-w-3xl mx-auto">
                        <span className="section-label mx-auto">CableCore Barcelona</span>
                        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mt-5 mb-6 leading-tight">
                            {data.h1}
                        </h1>
                        <p className="text-brand-gold-muted leading-relaxed text-lg mb-8">{data.intro}</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="tel:+34605974605" className="btn-gold justify-center px-8 py-4 text-base">
                                📞 {cl.call}
                            </a>
                            <a
                                href="https://wa.me/34605974605"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-outline justify-center px-8 py-4 text-base"
                            >
                                💬 {cl.whatsapp}
                            </a>
                        </div>
                    </div>
                </section>

                {/* Trust Stats */}
                <section className="py-10 border-b border-border-subtle bg-black/20">
                    <div className="container-custom">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                            {TRUST_STATS.map((s, i) => (
                                <div key={i}>
                                    <div className="font-heading text-3xl font-extrabold text-brand-gold mb-1">{s.value}</div>
                                    <div className="text-sm text-brand-gold-muted">{s.label[locale as 'es' | 'en' | 'ru'] || s.label.es}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="py-16">
                    <div className="container-custom">
                        <h2 className="font-heading text-2xl lg:text-3xl font-bold text-center mb-12">
                            {data.h2s[0] || cl.whyUs}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.features.map((f, i) => (
                                <div key={i} className="card p-6 border-brand-gold/10 hover:border-brand-gold/30 transition-colors">
                                    <span className="text-3xl mb-4 block">{f.icon}</span>
                                    <h3 className="font-heading font-semibold text-white text-lg mb-2">{f.title}</h3>
                                    <p className="text-brand-gold-muted text-sm leading-relaxed">{f.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Process */}
                <section className="py-16 border-t border-border-subtle">
                    <div className="container-custom max-w-3xl mx-auto">
                        <h2 className="font-heading text-2xl lg:text-3xl font-bold text-center mb-10">
                            {data.h2s[1] || 'Proceso de instalación'}
                        </h2>
                        <div className="space-y-4">
                            {[
                                { step: '1', title: locale === 'ru' ? 'Контакт' : locale === 'en' ? 'Contact' : 'Contacto', desc: locale === 'ru' ? 'Позвоните или запросите бесплатную смету онлайн.' : locale === 'en' ? 'Call us or request a free quote online.' : 'Llámanos o pide presupuesto online gratis.' },
                                { step: '2', title: locale === 'ru' ? 'Технический визит' : locale === 'en' ? 'Technical visit' : 'Visita técnica', desc: locale === 'ru' ? 'Техник приедет оценить установку на месте.' : locale === 'en' ? 'A technician will visit the space to evaluate the installation.' : 'Un técnico visitará el espacio para evaluar la instalación.' },
                                { step: '3', title: locale === 'ru' ? 'Смета' : locale === 'en' ? 'Quote' : 'Presupuesto', desc: locale === 'ru' ? 'Получите детальную смету без обязательств.' : locale === 'en' ? 'Receive a detailed quote with no commitment.' : 'Recibirás un presupuesto detallado sin compromiso.' },
                                { step: '4', title: locale === 'ru' ? 'Установка' : locale === 'en' ? 'Installation' : 'Instalación', desc: locale === 'ru' ? 'Профессиональная установка в согласованные сроки.' : locale === 'en' ? 'Professional installation within the agreed timeframe.' : 'Realizamos la instalación profesional en el plazo acordado.' },
                            ].map((s, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-lg bg-surface-card border border-border-subtle">
                                    <div className="w-10 h-10 rounded-full bg-[rgba(201,168,76,0.15)] text-brand-gold flex items-center justify-center font-heading font-bold text-lg flex-shrink-0">
                                        {s.step}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">{s.title}</h4>
                                        <p className="text-sm text-brand-gold-muted">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ — interactive accordion */}
                {data.faq.length > 0 && (
                    <section className="py-16 border-t border-border-subtle">
                        <div className="container-custom max-w-3xl mx-auto">
                            <h2 className="font-heading text-2xl lg:text-3xl font-bold text-center mb-10">
                                {data.h2s[2] || cl.faqTitle}
                            </h2>
                            <div className="space-y-3">
                                {data.faq.map((item, i) => (
                                    <div key={i} className={`card border transition-all duration-200 ${openFaq === i ? 'border-brand-gold/40 bg-[rgba(201,168,76,0.04)]' : 'border-brand-gold/10 hover:border-brand-gold/25'}`}>
                                        <button
                                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                            className="w-full flex items-center justify-between gap-4 p-5 text-left"
                                            aria-expanded={openFaq === i}
                                        >
                                            <h3 className="font-heading font-semibold text-white text-sm sm:text-base leading-snug">{item.q}</h3>
                                            <span className={`text-brand-gold flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}>
                                                ▼
                                            </span>
                                        </button>
                                        {openFaq === i && (
                                            <div className="px-5 pb-5">
                                                <p className="text-sm text-brand-gold-muted leading-relaxed">{item.a}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Coverage Zone */}
                <section className="py-14 border-t border-border-subtle bg-black/10">
                    <div className="container-custom max-w-3xl mx-auto text-center">
                        <h2 className="font-heading text-xl lg:text-2xl font-bold mb-3">{cl.coverage}</h2>
                        <p className="text-sm text-brand-gold-muted mb-6">
                            {locale === 'ru'
                                ? 'Работаем по всей Барселоне и метрополии'
                                : locale === 'en'
                                    ? 'We operate across Barcelona and the metropolitan area'
                                    : 'Operamos en toda Barcelona y el área metropolitana'}
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {COVERAGE_CITIES.map(city => (
                                <span key={city} className="text-xs text-brand-gold-muted bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 rounded-full">
                                    📍 {city}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 border-t border-border-subtle">
                    <div className="container-custom text-center max-w-2xl mx-auto">
                        <h2 className="font-heading text-2xl lg:text-3xl font-bold mb-4">{data.cta}</h2>
                        <p className="text-brand-gold-muted mb-8">
                            {cl.callUs} <span className="text-brand-gold font-bold">+34 605 974 605</span> {cl.orWrite}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="tel:+34605974605" className="btn-gold justify-center px-8 py-4 text-base">
                                📞 {cl.call}
                            </a>
                            <a href={`/${locale}/calculator`} className="btn-outline justify-center px-8 py-4 text-base">
                                🧮 {cl.quote}
                            </a>
                        </div>
                    </div>
                </section>

                {/* Internal linking cloud */}
                <section className="py-12 bg-black/[0.2] border-t border-border-subtle">
                    <div className="container-custom max-w-5xl mx-auto text-center">
                        <h3 className="text-sm font-semibold text-brand-gold-muted mb-4 uppercase tracking-widest">
                            {locale === 'es' ? 'Descubre más servicios y zonas' : locale === 'en' ? 'Discover more services and areas' : 'Другие услуги и зоны'}
                        </h3>
                        <div className="flex flex-wrap justify-center gap-3">
                            {getAllPages(locale).map((page) => (
                                data.slug !== page.slug && (
                                    <Link
                                        key={page.slug}
                                        href={`/servicios/${page.slug}`}
                                        className="text-xs text-gray-400 hover:text-brand-gold bg-white/[0.03] hover:bg-white/[0.08] px-3 py-1.5 rounded-full transition-colors border border-white/[0.05]"
                                    >
                                        {page.title.split(' | ')[0]}
                                    </Link>
                                )
                            ))}
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    );
}
