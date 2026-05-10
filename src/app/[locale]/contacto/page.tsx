'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ContactoPage() {
    const t = useTranslations();
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const form = e.currentTarget;
        const data = {
            name: (form.elements.namedItem('name') as HTMLInputElement).value,
            phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
            email: (form.elements.namedItem('email') as HTMLInputElement).value,
            service: (form.elements.namedItem('service') as HTMLSelectElement).value,
            message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
        };

        try {
            await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, source: 'contact_form' }),
            });
            setSubmitted(true);
        } catch {
            // silently handle
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <main className="min-h-screen relative z-10 pt-20">

                {/* ═══════════════ HERO ═══════════════ */}
                <section className="py-20 lg:py-28 relative overflow-hidden">
                    <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(201,168,76,0.06)_0%,transparent_70%)] pointer-events-none" />
                    <div className="container-custom text-center max-w-3xl mx-auto relative z-10">
                        <span className="section-label mx-auto">
                            {t('contactPage.label')}
                        </span>
                        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mt-6 mb-6">
                            {t('contactPage.title')}{' '}
                            <span className="text-gradient-gold">{t('contactPage.titleHighlight')}</span>
                        </h1>
                        <p className="text-base sm:text-lg text-brand-gold-muted max-w-2xl mx-auto leading-relaxed">
                            {t('contactPage.subtitle')}
                        </p>
                    </div>
                </section>

                <div className="gold-divider" />

                {/* ═══════════════ CONTACT GRID ═══════════════ */}
                <section className="py-20 lg:py-28">
                    <div className="container-custom">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

                            {/* Contact Info */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Phone */}
                                <div className="card p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.12)] flex items-center justify-center text-xl">📞</div>
                                        <div>
                                            <h3 className="font-heading font-semibold text-white">{t('contactPage.phone')}</h3>
                                            <a href="tel:+34605974605" className="text-sm text-brand-gold hover:underline">+34 605 974 605</a>
                                        </div>
                                    </div>
                                </div>

                                {/* Landline */}
                                <div className="card p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.12)] flex items-center justify-center text-xl">☎️</div>
                                        <div>
                                            <h3 className="font-heading font-semibold text-white">{t('contactPage.phone')}</h3>
                                            <a href="tel:+34930166868" className="text-sm text-brand-gold hover:underline">+34 93 016 68 68</a>
                                        </div>
                                    </div>
                                </div>

                                {/* WhatsApp */}
                                <div className="card p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.12)] flex items-center justify-center text-xl">💬</div>
                                        <div>
                                            <h3 className="font-heading font-semibold text-white">WhatsApp</h3>
                                            <a href="https://wa.me/34605974605" target="_blank" rel="noopener noreferrer" className="text-sm text-brand-gold hover:underline">+34 605 974 605</a>
                                        </div>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="card p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.12)] flex items-center justify-center text-xl">✉️</div>
                                        <div>
                                            <h3 className="font-heading font-semibold text-white">Email</h3>
                                            <a href="mailto:info@cablecore.es" className="text-sm text-brand-gold hover:underline">info@cablecore.es</a>
                                        </div>
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="card p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.12)] flex items-center justify-center text-xl">📍</div>
                                        <div>
                                            <h3 className="font-heading font-semibold text-white">{t('contactPage.address')}</h3>
                                            <p className="text-sm text-brand-gold-muted">Carrer Vitor Balaguer 33, Badalona, 08914</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Hours */}
                                <div className="card p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.12)] flex items-center justify-center text-xl">🕐</div>
                                        <div>
                                            <h3 className="font-heading font-semibold text-white">{t('contactPage.hours')}</h3>
                                            <p className="text-sm text-brand-gold-muted">{t('footer.schedule')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Form */}
                            <div className="lg:col-span-3">
                                {submitted ? (
                                    <div className="card p-10 text-center">
                                        <div className="text-5xl mb-4">✅</div>
                                        <h2 className="font-heading text-2xl font-bold text-white mb-2">
                                            {t('contact.success.title')}
                                        </h2>
                                        <p className="text-brand-gold-muted">
                                            {t('contact.success.desc')}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="card p-8">
                                        <h2 className="font-heading text-2xl font-bold text-white mb-6">
                                            {t('contactPage.formTitle')}
                                        </h2>
                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                <div>
                                                    <label className="block text-sm text-brand-gold-muted mb-1.5">{t('contact.form.name')} *</label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        required
                                                        className="w-full px-4 py-3 bg-surface-card border border-border-subtle rounded-lg text-white placeholder-gray-500 focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 outline-none transition-all"
                                                        placeholder={t('contact.form.name')}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-brand-gold-muted mb-1.5">{t('contact.form.phone')} *</label>
                                                    <input
                                                        type="tel"
                                                        name="phone"
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
                                                    name="email"
                                                    required
                                                    className="w-full px-4 py-3 bg-surface-card border border-border-subtle rounded-lg text-white placeholder-gray-500 focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 outline-none transition-all"
                                                    placeholder="email@example.com"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm text-brand-gold-muted mb-1.5">{t('contact.form.service')}</label>
                                                <select
                                                    name="service"
                                                    className="w-full px-4 py-3 bg-surface-card border border-border-subtle rounded-lg text-white focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 outline-none transition-all appearance-none"
                                                >
                                                    <option value="">{t('contact.form.serviceDefault')}</option>
                                                    <option>Cat6</option>
                                                    <option>Cat6A</option>
                                                    <option>Cat7</option>
                                                    <option>Wi-Fi / Access Point</option>
                                                    <option>Rack / Patch Panel</option>
                                                    <option>RJ45</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm text-brand-gold-muted mb-1.5">{t('contact.form.message')}</label>
                                                <textarea
                                                    name="message"
                                                    rows={5}
                                                    className="w-full px-4 py-3 bg-surface-card border border-border-subtle rounded-lg text-white placeholder-gray-500 focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 outline-none transition-all resize-none"
                                                    placeholder={t('contact.form.messagePlaceholder')}
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="btn-gold w-full text-base py-4 justify-center disabled:opacity-50"
                                            >
                                                {loading ? '...' : t('contact.form.submit')} →
                                            </button>

                                            <p className="text-xs text-brand-gold-muted text-center flex items-center justify-center gap-1.5">
                                                🔒 {t('contact.form.note')}
                                            </p>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <div className="gold-divider" />

                {/* ═══════════════ MAP ═══════════════ */}
                <section className="py-20 lg:py-28">
                    <div className="container-custom">
                        <div className="text-center mb-10">
                            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
                                {t('contactPage.mapTitle')}{' '}
                                <span className="text-gradient-gold">{t('contactPage.mapTitleHighlight')}</span>
                            </h2>
                        </div>
                        <div className="card overflow-hidden" style={{ height: '400px' }}>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2992.5!2d2.2374!3d41.4476!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a4bcf0c1f8b9c3%3A0x1234567890!2sCarrer+Vitor+Balaguer+33%2C+08914+Badalona!5e0!3m2!1ses!2ses!4v1709000000000!5m2!1ses!2ses"
                                width="100%"
                                height="100%"
                                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.9) contrast(1.1)' }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="CableCore Location"
                            />
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    );
}
