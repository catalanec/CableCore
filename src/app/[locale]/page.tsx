import { useTranslations } from 'next-intl';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';

export default function HomePage() {
    const t = useTranslations();

    const serviceIcons = ['🏠', '🏢', '🛍️', '🏭'];
    const serviceKeys = ['home', 'office', 'retail', 'business'] as const;

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
        'Barcelona', 'Hospitalet de Llobregat', 'Badalona', 'Sabadell',
        'Terrassa', 'Mataró', 'Granollers', 'Cornellà de Llobregat',
        'Sant Cugat del Vallès', 'El Prat de Llobregat',
    ];

    return (
        <>
            <Header />

            <main className="min-h-screen relative z-10">

                {/* ═══════════════ HERO ═══════════════ */}
                <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/images/hero-bg.png"
                            alt=""
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
                                <div key={city} className="card p-4 text-center">
                                    <span className="text-sm text-brand-gold-muted">📍 {city}</span>
                                </div>
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
