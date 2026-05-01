import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';
import { generatePageMetadata, getFAQJsonLd, getBreadcrumbJsonLd, BASE_URL } from '@/lib/seo-metadata';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
    return generatePageMetadata('home', params.locale, '');
}

export default function HomePage() {
    const t = useTranslations();

    const serviceIcons = ['🏠', '🏢', '🛍️', '🏭', '🔆'];
    const serviceKeys = ['home', 'office', 'retail', 'business', 'fiber'] as const;

    const trustItems = [
        { icon: '🏅', key: 'certified' as const },
        { icon: '🛡️', key: 'warranty' as const },
        { icon: '⚡', key: 'fast' as const },
        { icon: '📍', key: 'local' as const },
    ];

    const processSteps = t.raw('process.steps') as Array<{ title: string; desc: string }>;

    const testimonials = t.raw('testimonials.items') as Array<{
        text: string;
        name: string;
        role: string;
        initials: string;
    }>;

    const cities = [
        { name: 'Barcelona', href: '/servicios/instalacion-red-barcelona' },
        { name: "L'Hospitalet", href: '/servicios/instalacion-red-hospitalet' },
        { name: 'Badalona', href: '/servicios/instalacion-red-badalona' },
        { name: 'Sabadell', href: '/servicios/instalacion-red-sabadell' },
        { name: 'Terrassa', href: '/servicios/instalacion-red-terrassa' },
        { name: 'Mataró', href: '/servicios/instalacion-red-mataro' },
        { name: 'Granollers', href: '/servicios/instalacion-red-granollers' },
        { name: 'Cornellà', href: '/servicios/instalacion-red-cornella' },
        { name: 'Sant Cugat', href: '/servicios/instalacion-red-sant-cugat' },
        { name: 'Sant Boi', href: '/servicios/instalacion-red-sant-boi' },
    ];

    const faqJsonLd = getFAQJsonLd([
        { question: '¿Cuánto cuesta instalar cable de red en Barcelona?', answer: 'El precio de instalación de cable de red en Barcelona comienza desde 95€ por punto para Cat6, 115€ para Cat6A y 140€ para Cat7. El precio incluye cable, roseta RJ45, crimpado y comprobación de conexión. Usa nuestra calculadora online para un presupuesto exacto.' },
        { question: '¿Qué tipo de cable de red necesito para una oficina?', answer: 'Para una oficina en Barcelona recomendamos cable Cat6 (1 Gbps, ideal para hasta 20 puestos) o Cat6A (10 Gbps, para entornos exigentes). Cat7 es la opción premium para naves industriales y data centers.' },
        { question: '¿Cuánto tarda la instalación de cableado estructurado?', answer: 'Una instalación típica de 4-10 puntos de red se completa en 1-2 días laborables. Proyectos grandes (20+ puntos) pueden requerir 3-5 días. Hacemos visita técnica previa gratuita.' },
        { question: '¿Ofrecéis presupuesto gratis para instalación de red?', answer: 'Sí, la visita técnica y el presupuesto son completamente gratuitos y sin compromiso. Puedes llamar al +34 605 974 605, escribir por WhatsApp o usar nuestra calculadora online.' },
        { question: '¿En qué zonas de Barcelona instaláis cable de red?', answer: 'Trabajamos en toda el área metropolitana de Barcelona: ciudad de Barcelona, Badalona, Hospitalet de Llobregat, Sabadell, Terrassa, Mataró, Cornellà, Sant Cugat y alrededores. El desplazamiento es gratuito.' },
        { question: '¿Cuánto cuesta instalar un rack de red?', answer: 'La instalación de un rack mural de 6U cuesta desde 180€, un rack de 12U desde 280€ y un rack de suelo de 24U desde 450€. El precio incluye rack, patch panel, latiguillos y organización del cableado.' },
        { question: '¿Qué garantía ofrece CableCore en sus instalaciones?', answer: 'Ofrecemos 5 años de garantía en mano de obra en todas nuestras instalaciones de cableado estructurado. Todos nuestros puntos de red se verifican con equipos profesionales.' },
    ]);

    return (
        <>
            <Header />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />

            <main className="min-h-screen relative z-10">

                {/* ═══════════════ HERO ═══════════════ */}
                <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/images/hero-bg.png"
                            alt="Instalación profesional de cable de red en Barcelona — CableCore"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(9,9,11,0.82)] via-[rgba(9,9,11,0.75)] to-brand-black" />
                    </div>

                    {/* Gold glow */}
                    <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(201,168,76,0.08)_0%,rgba(160,133,53,0.03)_40%,transparent_70%)] pointer-events-none z-[1]" />

                    <div className="container-custom relative z-10 text-center max-w-4xl mx-auto">
                        <span className="section-label mx-auto">
                            📍 {t('hero.badge')}
                        </span>

                        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1] mt-6 mb-6">
                            {t('hero.title')}{' '}
                            <span className="text-gradient-gold">{t('hero.titleHighlight')}</span>
                        </h1>

                        <p className="text-base sm:text-lg text-brand-gold-muted max-w-2xl mx-auto mb-10 leading-relaxed">
                            {t('hero.subtitle')}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <a href="#quote" className="btn-gold text-base px-8 py-4 w-full sm:w-auto">
                                {t('hero.cta')} →
                            </a>
                            <a
                                href="https://wa.me/34605974605"
                                target="_blank"
                                rel="noopener"
                                className="btn-outline text-base px-8 py-4 w-full sm:w-auto"
                            >
                                💬 {t('hero.ctaWhatsapp')}
                            </a>
                        </div>

                        <div className="flex gap-10 sm:gap-16 justify-center mt-14 pt-10 border-t border-border-subtle">
                            <div className="text-center">
                                <div className="font-heading text-3xl sm:text-4xl font-bold text-gradient-gold">500+</div>
                                <div className="text-xs sm:text-sm text-brand-gold-muted mt-1">{t('hero.stats.installations')}</div>
                            </div>
                            <div className="text-center">
                                <div className="font-heading text-3xl sm:text-4xl font-bold text-gradient-gold">10+</div>
                                <div className="text-xs sm:text-sm text-brand-gold-muted mt-1">{t('hero.stats.experience')}</div>
                            </div>
                            <div className="text-center">
                                <div className="font-heading text-3xl sm:text-4xl font-bold text-gradient-gold">100%</div>
                                <div className="text-xs sm:text-sm text-brand-gold-muted mt-1">{t('hero.stats.warranty')}</div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="gold-divider" />

                {/* ═══════════════ SERVICES ═══════════════ */}
                <section id="services" className="py-20 lg:py-28 relative">
                    <div className="container-custom">
                        <div className="text-center max-w-2xl mx-auto mb-14">
                            <span className="section-label mx-auto">{t('services.label')}</span>
                            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mt-5 mb-4">
                                {t('services.title')}{' '}
                                <span className="text-gradient-gold">{t('services.titleHighlight')}</span>
                            </h2>
                            <p className="text-brand-gold-muted leading-relaxed">{t('services.subtitle')}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                            {serviceKeys.map((key, i) => {
                                const features = t.raw(`services.${key}.features`) as string[];
                                return (
                                    <div key={key} className="card p-6 group">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.12)] flex items-center justify-center text-2xl shrink-0">
                                                {serviceIcons[i]}
                                            </div>
                                            <h3 className="font-heading font-semibold text-lg text-white group-hover:text-brand-gold transition-colors">
                                                {t(`services.${key}.title`)}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-brand-gold-muted mb-4 leading-relaxed">
                                            {t(`services.${key}.desc`)}
                                        </p>
                                        <ul className="space-y-2">
                                            {features.map((f: string, j: number) => (
                                                <li key={j} className="flex items-start gap-2 text-sm text-brand-gold-muted">
                                                    <span className="text-brand-gold mt-0.5">✓</span>
                                                    <span>{f}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <div className="gold-divider" />

                {/* ═══════════════ TRUST ═══════════════ */}
                <section id="trust" className="py-20 lg:py-28">
                    <div className="container-custom">
                        <div className="text-center max-w-2xl mx-auto mb-14">
                            <span className="section-label mx-auto">{t('trust.label')}</span>
                            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mt-5 mb-4">
                                {t('trust.title')}{' '}
                                <span className="text-gradient-gold">{t('trust.titleHighlight')}</span>
                            </h2>
                            <p className="text-brand-gold-muted leading-relaxed">{t('trust.subtitle')}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {trustItems.map((item) => (
                                <div key={item.key} className="card p-6 text-center">
                                    <div className="w-14 h-14 rounded-full bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.12)] flex items-center justify-center text-2xl mx-auto mb-5">
                                        {item.icon}
                                    </div>
                                    <h3 className="font-heading font-semibold text-lg mb-2 text-white">
                                        {t(`trust.${item.key}.title`)}
                                    </h3>
                                    <p className="text-sm text-brand-gold-muted leading-relaxed">
                                        {t(`trust.${item.key}.desc`)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="gold-divider" />

                {/* ═══════════════ PROCESS ═══════════════ */}
                <section id="process" className="py-20 lg:py-28">
                    <div className="container-custom">
                        <div className="text-center max-w-2xl mx-auto mb-14">
                            <span className="section-label mx-auto">{t('process.label')}</span>
                            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mt-5 mb-4">
                                {t('process.title')}{' '}
                                <span className="text-gradient-gold">{t('process.titleHighlight')}</span>
                            </h2>
                            <p className="text-brand-gold-muted leading-relaxed">{t('process.subtitle')}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {processSteps.map((step: { title: string; desc: string }, i: number) => (
                                <div key={i} className="card p-6 relative">
                                    <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-black font-heading font-bold text-lg mb-4">
                                        {i + 1}
                                    </div>
                                    <h3 className="font-heading font-semibold text-lg mb-2 text-white">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm text-brand-gold-muted leading-relaxed">
                                        {step.desc}
                                    </p>
                                    {i < processSteps.length - 1 && (
                                        <div className="hidden lg:block absolute top-10 -right-3 text-brand-gold text-xl">→</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="gold-divider" />

                {/* ═══════════════ TESTIMONIALS ═══════════════ */}
                <section id="testimonials" className="py-20 lg:py-28">
                    <div className="container-custom">
                        <div className="text-center max-w-2xl mx-auto mb-14">
                            <span className="section-label mx-auto">{t('testimonials.label')}</span>
                            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mt-5 mb-4">
                                {t('testimonials.title')}{' '}
                                <span className="text-gradient-gold">{t('testimonials.titleHighlight')}</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {testimonials.map((item, i) => (
                                <div key={i} className="card p-6">
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(5)].map((_, j) => (
                                            <span key={j} className="text-brand-gold">★</span>
                                        ))}
                                    </div>
                                    <p className="text-sm text-brand-gold-muted leading-relaxed mb-6 italic">
                                        &ldquo;{item.text}&rdquo;
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-black font-bold text-sm">
                                            {item.initials}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-white">{item.name}</div>
                                            <div className="text-xs text-brand-gold-muted">{item.role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="gold-divider" />

                {/* ═══════════════ COVERAGE ═══════════════ */}
                <section id="coverage" className="py-20 lg:py-28">
                    <div className="container-custom">
                        <div className="text-center max-w-2xl mx-auto mb-14">
                            <span className="section-label mx-auto">{t('coverage.label')}</span>
                            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mt-5 mb-4">
                                {t('coverage.title')}{' '}
                                <span className="text-gradient-gold">{t('coverage.titleHighlight')}</span>
                            </h2>
                            <p className="text-brand-gold-muted leading-relaxed">{t('coverage.subtitle')}</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-10">
                            {cities.map((city) => (
                                <Link 
                                    key={city.name} 
                                    href={city.href}
                                    className="card p-4 text-center hover:bg-white/[0.04] transition-all group"
                                >
                                    <span className="text-sm text-brand-gold-muted group-hover:text-brand-gold transition-colors">
                                        📍 {city.name}
                                    </span>
                                </Link>
                            ))}
                        </div>

                        <div className="card p-8 text-center max-w-2xl mx-auto border-brand-gold/20">
                            <div className="text-3xl mb-3">⚡</div>
                            <h3 className="font-heading font-semibold text-xl text-white mb-2">
                                {t('coverage.highlight.title')}
                            </h3>
                            <p className="text-sm text-brand-gold-muted leading-relaxed">
                                {t('coverage.highlight.desc')}
                            </p>
                        </div>
                    </div>
                </section>

                <div className="gold-divider" />

                {/* ═══════════════ PRECIOS TEASER ═══════════════ */}
                <section id="precios" className="py-20 lg:py-28">
                    <div className="container-custom">
                        <div className="text-center max-w-2xl mx-auto mb-12">
                            <span className="section-label mx-auto">Tarifas 2025</span>
                            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mt-5 mb-4">
                                Precio{' '}
                                <span className="text-gradient-gold">instalación de red</span>
                                {' '}Barcelona
                            </h2>
                            <p className="text-brand-gold-muted leading-relaxed">
                                Precios transparentes. Sin sorpresas. IVA incluido.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto mb-8">
                            {[
                                { name: 'Cat6', price: 'desde 95€', detail: '/punto instalado', popular: false },
                                { name: 'Cat6A', price: 'desde 115€', detail: '/punto instalado', popular: true },
                                { name: 'Cat7', price: 'desde 140€', detail: '/punto instalado', popular: false },
                            ].map((plan) => (
                                <div key={plan.name} className={`card p-6 text-center relative ${plan.popular ? 'border-brand-gold/40' : ''}`}>
                                    {plan.popular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-gold text-black text-xs font-bold px-3 py-1 rounded-full">
                                            Más popular
                                        </div>
                                    )}
                                    <div className="font-heading font-bold text-2xl text-brand-gold mb-1">{plan.name}</div>
                                    <div className="font-heading text-3xl font-extrabold text-white mb-1">{plan.price}</div>
                                    <div className="text-sm text-brand-gold-muted">{plan.detail}</div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center">
                            <a href="/es/precios" className="btn-outline px-6 py-3 text-sm">
                                Ver tabla de precios completa →
                            </a>
                        </div>
                    </div>
                </section>

                <div className="gold-divider" />

                {/* ═══════════════ FAQ ═══════════════ */}
                <section id="faq" className="py-20 lg:py-28">
                    <div className="container-custom max-w-3xl mx-auto">
                        <div className="text-center mb-12">
                            <span className="section-label mx-auto">FAQ</span>
                            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mt-5 mb-4">
                                Preguntas{' '}
                                <span className="text-gradient-gold">frecuentes</span>
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {[
                                { q: '¿Cuánto cuesta instalar cable de red en Barcelona?', a: 'Cat6 desde 95€/punto, Cat6A desde 115€/punto y Cat7 desde 140€/punto. El precio incluye cable, roseta RJ45 y comprobación de conexión. Usa nuestra calculadora para un presupuesto exacto.' },
                                { q: '¿Qué tipo de cable de red necesito para una oficina?', a: 'Recomendamos Cat6 para oficinas de hasta 20 puestos (1 Gbps) o Cat6A para entornos más exigentes (10 Gbps). Cat7 es la opción premium para naves industriales.' },
                                { q: '¿Cuánto tarda la instalación de cableado estructurado?', a: 'Una instalación de 4-10 puntos se completa en 1-2 días. Proyectos de 20+ puntos requieren 3-5 días. Hacemos visita técnica previa gratuita.' },
                                { q: '¿Ofrecéis presupuesto gratis para instalación de red?', a: 'Sí, la visita técnica y el presupuesto son completamente gratuitos y sin compromiso. Contacta por teléfono, WhatsApp o usa la calculadora.' },
                                { q: '¿En qué zonas de Barcelona trabajáis?', a: 'Toda el área metropolitana: Barcelona, Badalona, Hospitalet, Sabadell, Terrassa, Mataró, Cornellà, Sant Cugat y más. Desplazamiento gratuito.' },
                            ].map((item, i) => (
                                <details key={i} className="card p-5 group" open={i === 0}>
                                    <summary className="font-semibold text-white cursor-pointer list-none flex items-center justify-between gap-4 text-sm sm:text-base">
                                        <span>{item.q}</span>
                                        <span className="text-brand-gold text-xl shrink-0 group-open:rotate-45 transition-transform duration-200">+</span>
                                    </summary>
                                    <p className="mt-3 text-sm text-brand-gold-muted leading-relaxed">{item.a}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="gold-divider" />

                {/* ═══════════════ CTA ═══════════════ */}
                <section className="py-20 lg:py-28 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[rgba(201,168,76,0.04)] to-transparent" />
                    <div className="container-custom relative z-10 text-center">
                        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                            {t('cta.title')}{' '}
                            <span className="text-gradient-gold">{t('cta.titleHighlight')}</span>?
                        </h2>
                        <p className="text-brand-gold-muted text-lg mb-10 max-w-xl mx-auto">{t('cta.subtitle')}</p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <a href="tel:+34605974605" className="btn-gold text-base px-8 py-4 w-full sm:w-auto">
                                📞 +34 605 974 605
                            </a>
                            <a
                                href="https://wa.me/34605974605"
                                target="_blank"
                                rel="noopener"
                                className="btn-outline text-base px-8 py-4 w-full sm:w-auto"
                            >
                                💬 WhatsApp
                            </a>
                        </div>
                    </div>
                </section>

                <div className="gold-divider" />

                {/* ═══════════════ QUOTE FORM ═══════════════ */}
                <section id="quote" className="py-20 lg:py-28">
                    <div className="container-custom max-w-3xl">
                        <div className="text-center mb-12">
                            <span className="section-label mx-auto">{t('contact.label')}</span>
                            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mt-5 mb-4">
                                {t('contact.title')}{' '}
                                <span className="text-gradient-gold">{t('contact.titleHighlight')}</span>
                            </h2>
                            <p className="text-brand-gold-muted leading-relaxed">{t('contact.subtitle')}</p>
                        </div>

                        <form className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm text-brand-gold-muted mb-1.5">{t('contact.form.name')} *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 bg-surface-card border border-border-subtle rounded-lg text-white placeholder-gray-500 focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 outline-none transition-all"
                                        placeholder={t('contact.form.name')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-brand-gold-muted mb-1.5">{t('contact.form.phone')} *</label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full px-4 py-3 bg-surface-card border border-border-subtle rounded-lg text-white placeholder-gray-500 focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 outline-none transition-all"
                                        placeholder="+34 600 000 000"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-brand-gold-muted mb-1.5">{t('contact.form.email')} *</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 bg-surface-card border border-border-subtle rounded-lg text-white placeholder-gray-500 focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 outline-none transition-all"
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-brand-gold-muted mb-1.5">{t('contact.form.service')}</label>
                                <select className="w-full px-4 py-3 bg-surface-card border border-border-subtle rounded-lg text-white focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 outline-none transition-all appearance-none">
                                    <option value="">{t('contact.form.serviceDefault')}</option>
                                    <option>Cat6</option>
                                    <option>Cat6A</option>
                                    <option>Cat7</option>
                                    <option>Fibra Óptica (Monomodo)</option>
                                    <option>Fibra Óptica (Multimodo)</option>
                                    <option>Fusión de Fibra</option>
                                    <option>Wi-Fi / Access Point</option>
                                    <option>Rack / Patch Panel</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-brand-gold-muted mb-1.5">{t('contact.form.message')}</label>
                                <textarea
                                    rows={4}
                                    className="w-full px-4 py-3 bg-surface-card border border-border-subtle rounded-lg text-white placeholder-gray-500 focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 outline-none transition-all resize-none"
                                    placeholder={t('contact.form.messagePlaceholder')}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn-gold w-full text-base py-4 justify-center"
                            >
                                {t('contact.form.submit')} →
                            </button>

                            <p className="text-xs text-brand-gold-muted text-center flex items-center justify-center gap-1.5">
                                🔒 {t('contact.form.note')}
                            </p>
                        </form>
                    </div>
                </section>

            </main>

            <Footer />
        </>
    );
}
