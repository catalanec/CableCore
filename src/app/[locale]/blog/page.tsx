import { Metadata } from 'next';
import { useTranslations, useLocale } from 'next-intl';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Link } from '@/i18n/routing';
import { getBlogArticles } from '@/lib/blog-data';
import { generatePageMetadata } from '@/lib/seo-metadata';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
    return generatePageMetadata('blog', params.locale, '/blog');
}

export default function BlogPage() {
    const t = useTranslations();
    const p = useTranslations('pages.blog');
    const locale = useLocale();
    const articles = getBlogArticles(locale);

    return (
        <>
            <Header />
            <main className="min-h-screen relative z-10 pt-20">

                {/* ═══════════════ HERO ═══════════════ */}
                <section className="py-20 lg:py-28 relative overflow-hidden">
                    <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(201,168,76,0.06)_0%,transparent_70%)] pointer-events-none" />
                    <div className="container-custom text-center max-w-3xl mx-auto relative z-10">
                        <span className="section-label mx-auto">{p('label')}</span>
                        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mt-6 mb-6">
                            {p('title')}{' '}
                            <span className="text-gradient-gold">{p('titleHighlight')}</span>
                        </h1>
                        <p className="text-base sm:text-lg text-brand-gold-muted max-w-2xl mx-auto leading-relaxed">
                            {p('subtitle')}
                        </p>
                    </div>
                </section>

                <div className="gold-divider" />

                {/* ═══════════════ ARTICLES ═══════════════ */}
                <section className="py-20 lg:py-28">
                    <div className="container-custom">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {articles.map((article) => (
                                <Link
                                    key={article.slug}
                                    href={`/blog/${article.slug}`}
                                    className="card p-6 group hover:border-brand-gold/30 transition-all duration-300 block"
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-xs px-2.5 py-1 rounded-full bg-[rgba(201,168,76,0.1)] text-brand-gold border border-brand-gold/20">
                                            {article.category}
                                        </span>
                                        <span className="text-xs text-brand-gold-muted">{article.readTime}</span>
                                    </div>
                                    <h2 className="font-heading font-semibold text-lg text-white mb-3 group-hover:text-brand-gold transition-colors leading-tight">
                                        {article.title}
                                    </h2>
                                    <p className="text-sm text-brand-gold-muted leading-relaxed mb-4">
                                        {article.excerpt}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {article.tags.slice(0, 3).map((tag) => (
                                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-brand-gold-muted">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </Link>
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
                            {p('ctaTitle')}
                        </h2>
                        <p className="text-brand-gold-muted text-lg mb-10 max-w-xl mx-auto">
                            {p('subtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link href="/contacto" className="btn-gold text-base px-8 py-4">
                                {t('hero.cta')} →
                            </Link>
                            <Link href="/calculator" className="btn-outline text-base px-8 py-4">
                                🧮 {t('nav.calculator')}
                            </Link>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    );
}
