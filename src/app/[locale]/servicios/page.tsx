import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Link } from '@/i18n/routing';
import { generatePageMetadata } from '@/lib/seo-metadata';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
    return generatePageMetadata('servicios', params.locale, '/servicios');
}

const allServices = [
    {
        icon: '🔌',
        key: 'cabling',
        features: ['Cat6 — 95€/punto', 'Cat6A — 115€/punto', 'Cat7 — 140€/punto'],
    },
    {
        icon: '🏠',
        key: 'home',
    },
    {
        icon: '🏢',
        key: 'office',
    },
    {
        icon: '🛍️',
        key: 'retail',
    },
    {
        icon: '🏭',
        key: 'business',
    },
    {
        icon: '📡',
        key: 'rj45',
        features: ['Keystone RJ45', 'Placas de pared', 'Certificación de puntos'],
    },
    {
        icon: '🗄️',
        key: 'rack',
        features: ['Rack mural', 'Rack suelo', 'Patch panels', 'Organización de cableado'],
    },
    {
        icon: '🌐',
        key: 'network',
        features: ['Switches gestionables', 'Routers profesionales', 'Access Points Wi-Fi', 'Configuración de red'],
    },
    {
        icon: '🔧',
        key: 'management',
        features: ['Canaleta decorativa', 'Tubo corrugado', 'Gestión en rack', 'Etiquetado profesional'],
    },
];

export default function ServiciosPage() {
    const t = useTranslations();

    return (
        <>
            <Header />
            <main className="min-h-screen relative z-10 pt-20">

                {/* ═══════════════ HERO ═══════════════ */}
                <section className="py-20 lg:py-28 relative overflow-hidden">
                    <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(201,168,76,0.06)_0%,transparent_70%)] pointer-events-none" />
                    <div className="container-custom text-center max-w-3xl mx-auto relative z-10">
                        <span className="section-label mx-auto">
                            {t('servicesPage.label')}
                        </span>
                        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mt-6 mb-6">
                            {t('servicesPage.title')}{' '}
                            <span className="text-gradient-gold">{t('servicesPage.titleHighlight')}</span>
                        </h1>
                        <p className="text-base sm:text-lg text-brand-gold-muted max-w-2xl mx-auto mb-10 leading-relaxed">
                            {t('servicesPage.subtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/calculator" className="btn-gold text-base px-8 py-4">
                                🧮 {t('servicesPage.ctaCalc')}
                            </Link>
                            <a href="https://wa.me/34605974605" target="_blank" rel="noopener" className="btn-outline text-base px-8 py-4">
                                💬 WhatsApp
                            </a>
                        </div>
                    </div>
                </section>

                <div className="gold-divider" />

                {/* ═══════════════ ALL SERVICES ═══════════════ */}
                <section className="py-20 lg:py-28">
                    <div className="container-custom">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allServices.map((service) => {
                                const hasTranslatedFeatures = !service.features;
                                const features = hasTranslatedFeatures
                                    ? (t.raw(`services.${service.key}.features`) as string[])
                                    : service.features!;
                                return (
                                    <div key={service.key} className="card p-7 group hover:border-brand-gold/30 transition-all duration-300">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.12)] flex items-center justify-center text-2xl shrink-0">
                                                {service.icon}
                                            </div>
                                            <h2 className="font-heading font-semibold text-xl text-white group-hover:text-brand-gold transition-colors">
                                                {t(`servicesPage.items.${service.key}.title`)}
                                            </h2>
                                        </div>
                                        <p className="text-sm text-brand-gold-muted mb-5 leading-relaxed">
                                            {t(`servicesPage.items.${service.key}.desc`)}
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

                {/* ═══════════════ CTA SECTION ═══════════════ */}
                <section className="py-20 lg:py-28 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[rgba(201,168,76,0.04)] to-transparent" />
                    <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
                        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                            {t('servicesPage.ctaTitle')}{' '}
                            <span className="text-gradient-gold">{t('servicesPage.ctaTitleHighlight')}</span>
                        </h2>
                        <p className="text-brand-gold-muted text-lg mb-10 max-w-xl mx-auto">
                            {t('servicesPage.ctaSubtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link href="/contacto" className="btn-gold text-base px-8 py-4">
                                {t('hero.cta')} →
                            </Link>
                            <a href="tel:+34605974605" className="btn-outline text-base px-8 py-4">
                                📞 +34 605 974 605
                            </a>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    );
}
