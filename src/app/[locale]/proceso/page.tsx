import { useTranslations } from 'next-intl';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ProcesoPage() {
    const t = useTranslations();

    const steps = [
        { icon: '📞', number: '01' },
        { icon: '📐', number: '02' },
        { icon: '🔧', number: '03' },
        { icon: '✅', number: '04' },
        { icon: '📋', number: '05' },
        { icon: '🛡️', number: '06' },
    ];

    const processSteps = t.raw('processPage.steps') as Array<{ title: string; desc: string }>;

    return (
        <>
            <Header />
            <main className="min-h-screen relative z-10 pt-20">

                {/* ═══════════════ HERO ═══════════════ */}
                <section className="py-20 lg:py-28 relative overflow-hidden">
                    <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(201,168,76,0.06)_0%,transparent_70%)] pointer-events-none" />
                    <div className="container-custom text-center max-w-3xl mx-auto relative z-10">
                        <span className="section-label mx-auto">
                            {t('processPage.label')}
                        </span>
                        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mt-6 mb-6">
                            {t('processPage.title')}{' '}
                            <span className="text-gradient-gold">{t('processPage.titleHighlight')}</span>
                        </h1>
                        <p className="text-base sm:text-lg text-brand-gold-muted max-w-2xl mx-auto leading-relaxed">
                            {t('processPage.subtitle')}
                        </p>
                    </div>
                </section>

                <div className="gold-divider" />

                {/* ═══════════════ STEPS ═══════════════ */}
                <section className="py-20 lg:py-28">
                    <div className="container-custom max-w-4xl">
                        <div className="space-y-0">
                            {processSteps.map((step, i) => (
                                <div key={i} className="relative flex gap-6 sm:gap-8 pb-12 last:pb-0">
                                    {/* Timeline line */}
                                    {i < processSteps.length - 1 && (
                                        <div className="absolute left-[23px] sm:left-[27px] top-14 bottom-0 w-px bg-gradient-to-b from-brand-gold/40 to-brand-gold/10" />
                                    )}

                                    {/* Number circle */}
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-gold flex items-center justify-center text-black font-heading font-bold text-lg shadow-[0_0_20px_rgba(201,168,76,0.2)]">
                                            {steps[i]?.number || `0${i + 1}`}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="card p-6 flex-1 hover:border-brand-gold/30 transition-all">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-2xl">{steps[i]?.icon || '📌'}</span>
                                            <h2 className="font-heading font-semibold text-xl text-white">
                                                {step.title}
                                            </h2>
                                        </div>
                                        <p className="text-sm text-brand-gold-muted leading-relaxed">
                                            {step.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="gold-divider" />

                {/* ═══════════════ GUARANTEE ═══════════════ */}
                <section className="py-20 lg:py-28">
                    <div className="container-custom max-w-4xl">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            {(['guarantee1', 'guarantee2', 'guarantee3'] as const).map((key) => (
                                <div key={key} className="card p-6 text-center">
                                    <div className="text-3xl mb-3">{key === 'guarantee1' ? '🛡️' : key === 'guarantee2' ? '📄' : '⚡'}</div>
                                    <h3 className="font-heading font-semibold text-lg text-white mb-2">
                                        {t(`processPage.${key}.title`)}
                                    </h3>
                                    <p className="text-sm text-brand-gold-muted leading-relaxed">
                                        {t(`processPage.${key}.desc`)}
                                    </p>
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
                            {t('processPage.ctaTitle')}{' '}
                            <span className="text-gradient-gold">{t('processPage.ctaTitleHighlight')}</span>
                        </h2>
                        <p className="text-brand-gold-muted text-lg mb-10 max-w-xl mx-auto">
                            {t('processPage.ctaSubtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <a href="#quote" className="btn-gold text-base px-8 py-4">
                                {t('hero.cta')} →
                            </a>
                            <a href="https://wa.me/34605974605" target="_blank" rel="noopener" className="btn-outline text-base px-8 py-4">
                                💬 WhatsApp
                            </a>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    );
}
