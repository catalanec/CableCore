'use client';

import { useLocale } from 'next-intl';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

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

function generateJsonLd(data: SEOPageData, locale: string) {
    const localBusiness = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'CableCore',
        description: data.metaDescription,
        url: `https://cablecore.es/${locale}/servicios/${data.slug}`,
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
        geo: {
            '@type': 'GeoCoordinates',
            latitude: 41.4500,
            longitude: 2.2474,
        },
        openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            opens: '09:00',
            closes: '19:00',
        },
        areaServed: {
            '@type': 'State',
            name: 'Barcelona',
        },
        priceRange: '€€',
        image: 'https://cablecore.es/logocablecore.png',
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
        },
        areaServed: {
            '@type': 'State',
            name: 'Barcelona',
        },
        url: `https://cablecore.es/${locale}/servicios/${data.slug}`,
    };

    const faqPage = data.faq.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: data.faq.map(item => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.a,
            },
        })),
    } : null;

    return { localBusiness, service, faqPage };
}

export default function SEOLandingPage({ data }: { data: SEOPageData }) {
    const locale = useLocale();
    const jsonLd = generateJsonLd(data, locale);

    const ctaLabels: Record<string, Record<string, string>> = {
        es: { call: 'Llamar ahora', whatsapp: 'WhatsApp', quote: 'Presupuesto gratis', callUs: 'Llámanos', orWrite: 'o escríbenos por WhatsApp' },
        en: { call: 'Call now', whatsapp: 'WhatsApp', quote: 'Free quote', callUs: 'Call us', orWrite: 'or write us on WhatsApp' },
        ru: { call: 'Позвонить', whatsapp: 'WhatsApp', quote: 'Бесплатная смета', callUs: 'Звоните', orWrite: 'или напишите в WhatsApp' },
    };
    const cl = ctaLabels[locale] || ctaLabels.es;

    return (
        <>
            <Header />

            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.localBusiness) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.service) }}
            />
            {jsonLd.faqPage && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.faqPage) }}
                />
            )}

            <main className="min-h-screen relative z-10 pt-20">
                {/* Hero */}
                <section className="py-16 lg:py-24 border-b border-border-subtle">
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
                                rel="noopener"
                                className="btn-outline justify-center px-8 py-4 text-base"
                            >
                                💬 {cl.whatsapp}
                            </a>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="py-16">
                    <div className="container-custom">
                        <h2 className="font-heading text-2xl lg:text-3xl font-bold text-center mb-12">
                            {data.h2s[0] || '¿Por qué elegirnos?'}
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
                                { step: '1', title: 'Contacto', desc: 'Llámanos o pide presupuesto online gratis.' },
                                { step: '2', title: 'Visita técnica', desc: 'Un técnico visitará el espacio para evaluar la instalación.' },
                                { step: '3', title: 'Presupuesto', desc: 'Recibirás un presupuesto detallado sin compromiso.' },
                                { step: '4', title: 'Instalación', desc: 'Realizamos la instalación profesional en el plazo acordado.' },
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

                {/* FAQ */}
                {data.faq.length > 0 && (
                    <section className="py-16 border-t border-border-subtle">
                        <div className="container-custom max-w-3xl mx-auto">
                            <h2 className="font-heading text-2xl lg:text-3xl font-bold text-center mb-10">
                                {data.h2s[2] || 'Preguntas frecuentes'}
                            </h2>
                            <div className="space-y-4">
                                {data.faq.map((item, i) => (
                                    <div key={i} className="card p-5 border-brand-gold/10">
                                        <h3 className="font-heading font-semibold text-white mb-2">{item.q}</h3>
                                        <p className="text-sm text-brand-gold-muted leading-relaxed">{item.a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* CTA */}
                <section className="py-16 border-t border-border-subtle">
                    <div className="container-custom text-center max-w-2xl mx-auto">
                        <h2 className="font-heading text-2xl lg:text-3xl font-bold mb-4">
                            {data.cta}
                        </h2>
                        <p className="text-brand-gold-muted mb-8">{cl.callUs} <span className="text-brand-gold font-bold">+34 605 974 605</span> {cl.orWrite}</p>
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
            </main>
            <Footer />
        </>
    );
}
