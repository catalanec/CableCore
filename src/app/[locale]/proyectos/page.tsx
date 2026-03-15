import { useTranslations } from 'next-intl';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Link } from '@/i18n/routing';

export default function ProyectosPage() {
    const t = useTranslations();

    const projects = t.raw('projectsPage.items') as Array<{
        title: string;
        type: string;
        points: string;
        cable: string;
        desc: string;
    }>;

    const icons = ['🏢', '🏥', '🛍️', '🏠', '🏭', '🏨'];

    return (
        <>
            <Header />
            <main className="min-h-screen relative z-10 pt-20">

                {/* ═══════════════ HERO ═══════════════ */}
                <section className="py-20 lg:py-28 relative overflow-hidden">
                    <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(201,168,76,0.06)_0%,transparent_70%)] pointer-events-none" />
                    <div className="container-custom text-center max-w-3xl mx-auto relative z-10">
                        <span className="section-label mx-auto">
                            {t('projectsPage.label')}
                        </span>
                        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mt-6 mb-6">
                            {t('projectsPage.title')}{' '}
                            <span className="text-gradient-gold">{t('projectsPage.titleHighlight')}</span>
                        </h1>
                        <p className="text-base sm:text-lg text-brand-gold-muted max-w-2xl mx-auto leading-relaxed">
                            {t('projectsPage.subtitle')}
                        </p>
                    </div>
                </section>

                <div className="gold-divider" />

                {/* ═══════════════ STATS ═══════════════ */}
                <section className="py-14">
                    <div className="container-custom">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                            {[
                                { value: '500+', label: t('projectsPage.stats.installations') },
                                { value: '10+', label: t('projectsPage.stats.years') },
                                { value: '100%', label: t('projectsPage.stats.certified') },
                                { value: '5', label: t('projectsPage.stats.warranty') },
                            ].map((stat) => (
                                <div key={stat.label} className="card p-5 text-center">
                                    <div className="font-heading text-3xl font-bold text-gradient-gold">{stat.value}</div>
                                    <div className="text-xs text-brand-gold-muted mt-1">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="gold-divider" />

                {/* ═══════════════ PROJECTS GRID ═══════════════ */}
                <section className="py-20 lg:py-28">
                    <div className="container-custom">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((project, i) => (
                                <div key={i} className="card overflow-hidden group hover:border-brand-gold/30 transition-all duration-300">
                                    {/* Project icon header */}
                                    <div className="h-40 bg-gradient-to-br from-[rgba(201,168,76,0.08)] to-[rgba(201,168,76,0.02)] flex items-center justify-center border-b border-border-subtle">
                                        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                                            {icons[i] || '🏗️'}
                                        </span>
                                    </div>

                                    <div className="p-6">
                                        <h3 className="font-heading font-semibold text-lg text-white mb-2 group-hover:text-brand-gold transition-colors">
                                            {project.title}
                                        </h3>
                                        <p className="text-sm text-brand-gold-muted mb-4 leading-relaxed">
                                            {project.desc}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-xs px-2.5 py-1 rounded-full bg-[rgba(201,168,76,0.1)] text-brand-gold border border-brand-gold/20">
                                                {project.type}
                                            </span>
                                            <span className="text-xs px-2.5 py-1 rounded-full bg-[rgba(201,168,76,0.1)] text-brand-gold border border-brand-gold/20">
                                                {project.points}
                                            </span>
                                            <span className="text-xs px-2.5 py-1 rounded-full bg-[rgba(201,168,76,0.1)] text-brand-gold border border-brand-gold/20">
                                                {project.cable}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="gold-divider" />

                {/* ═══════════════ CTA ═══════════════ */}
                <section className="py-20 lg:py-28 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[rgba(201,168,76,0.04)] to-transparent" />
                    <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
                        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                            {t('projectsPage.ctaTitle')}{' '}
                            <span className="text-gradient-gold">{t('projectsPage.ctaTitleHighlight')}</span>
                        </h2>
                        <p className="text-brand-gold-muted text-lg mb-10 max-w-xl mx-auto">
                            {t('projectsPage.ctaSubtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link href="/contacto" className="btn-gold text-base px-8 py-4">
                                {t('hero.cta')} →
                            </Link>
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
