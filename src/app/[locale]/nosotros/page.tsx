import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Link } from '@/i18n/routing';
import { generatePageMetadata } from '@/lib/seo-metadata';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
    return generatePageMetadata('nosotros', params.locale, '/nosotros');
}

export default function NosotrosPage() {
    const t = useTranslations();

    const values = t.raw('aboutPage.values') as Array<{ icon: string; title: string; desc: string }>;

    return (
        <>
            <Header />
            <main className="min-h-screen relative z-10 pt-20">

                {/* ═══════════════ HERO ═══════════════ */}
                <section className="py-20 lg:py-28 relative overflow-hidden">
                    <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(201,168,76,0.06)_0%,transparent_70%)] pointer-events-none" />
                    <div className="container-custom text-center max-w-3xl mx-auto relative z-10">
                        <span className="section-label mx-auto">
                            {t('aboutPage.label')}
                        </span>
                        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mt-6 mb-6">
                            {t('aboutPage.title')}{' '}
                            <span className="text-gradient-gold">{t('aboutPage.titleHighlight')}</span>
                        </h1>
                        <p className="text-base sm:text-lg text-brand-gold-muted max-w-2xl mx-auto leading-relaxed">
                            {t('aboutPage.subtitle')}
                        </p>
                    </div>
                </section>

                <div className="gold-divider" />

                {/* ═══════════════ STORY ═══════════════ */}
                <section className="py-20 lg:py-28">
                    <div className="container-custom max-w-4xl">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                            <div>
                                <span className="section-label">{t('aboutPage.storyLabel')}</span>
                                <h2 className="font-heading text-3xl sm:text-4xl font-bold mt-4 mb-6 text-white">
                                    {t('aboutPage.storyTitle')}
                                </h2>
                                <div className="space-y-4 text-sm text-brand-gold-muted leading-relaxed">
                                    <p>{t('aboutPage.storyP1')}</p>
                                    <p>{t('aboutPage.storyP2')}</p>
                                    <p>{t('aboutPage.storyP3')}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { value: '500+', label: t('aboutPage.stats.installations') },
                                    { value: '10+', label: t('aboutPage.stats.years') },
                                    { value: '100%', label: t('aboutPage.stats.satisfaction') },
                                    { value: '24h', label: t('aboutPage.stats.response') },
                                ].map((stat) => (
                                    <div key={stat.label} className="card p-5 text-center">
                                        <div className="font-heading text-2xl sm:text-3xl font-bold text-gradient-gold">{stat.value}</div>
                                        <div className="text-xs text-brand-gold-muted mt-1">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <div className="gold-divider" />

                {/* ═══════════════ VALUES ═══════════════ */}
                <section className="py-20 lg:py-28">
                    <div className="container-custom">
                        <div className="text-center max-w-2xl mx-auto mb-14">
                            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                                {t('aboutPage.valuesTitle')}{' '}
                                <span className="text-gradient-gold">{t('aboutPage.valuesTitleHighlight')}</span>
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {values.map((val, i) => (
                                <div key={i} className="card p-6 text-center">
                                    <div className="text-3xl mb-4">{val.icon}</div>
                                    <h3 className="font-heading font-semibold text-lg text-white mb-2">{val.title}</h3>
                                    <p className="text-sm text-brand-gold-muted leading-relaxed">{val.desc}</p>
                                </div>
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
                            {t('aboutPage.ctaTitle')}{' '}
                            <span className="text-gradient-gold">{t('aboutPage.ctaTitleHighlight')}</span>
                        </h2>
                        <p className="text-brand-gold-muted text-lg mb-10 max-w-xl mx-auto">
                            {t('aboutPage.ctaSubtitle')}
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
