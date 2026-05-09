import { notFound } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Link } from '@/i18n/routing';
import { getBlogArticles, BLOG_ARTICLES } from '@/lib/blog-data';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import type { Metadata } from 'next';

export function generateStaticParams() {
    return BLOG_ARTICLES.map((article) => ({ slug: article.slug }));
}

export function generateMetadata({ params }: { params: { slug: string; locale: string } }): Metadata {
    const articles = getBlogArticles(params.locale);
    const article = articles.find((a) => a.slug === params.slug);
    if (!article) return {};

    const BASE_URL = 'https://cablecore.es';

    return {
        title: article.metaTitle,
        description: article.metaDescription,
        alternates: {
            canonical: `${BASE_URL}/${params.locale}/blog/${article.slug}`,
            languages: {
                'es': `${BASE_URL}/es/blog/${article.slug}`,
                'en': `${BASE_URL}/en/blog/${article.slug}`,
                'ru': `${BASE_URL}/ru/blog/${article.slug}`,
                'x-default': `${BASE_URL}/blog/${article.slug}`,
            },
        },
    };
}

export default function BlogArticlePage({ params }: { params: { slug: string } }) {
    const locale = useLocale();
    const articles = getBlogArticles(locale);
    const article = articles.find((a) => a.slug === params.slug);
    const t = useTranslations();
    const p = useTranslations('pages.blog');

    if (!article) notFound();

    // JSON-LD structured data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: article.title,
        description: article.metaDescription,
        datePublished: article.date,
        author: {
            '@type': 'Organization',
            name: 'CableCore',
            url: 'https://cablecore.es',
        },
        publisher: {
            '@type': 'Organization',
            name: 'CableCore',
            url: 'https://cablecore.es',
        },
    };

    return (
        <>
            <Header />
            <main className="min-h-screen relative z-10 pt-20">

                {/* Breadcrumbs */}
                <Breadcrumbs items={[
                    { label: locale === 'ru' ? 'Главная' : locale === 'en' ? 'Home' : 'Inicio', href: '/' },
                    { label: 'Blog', href: '/blog' },
                    { label: article.title.length > 40 ? article.title.slice(0, 40) + '...' : article.title },
                ]} />

                {/* JSON-LD */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />

                {/* ═══════════════ ARTICLE HEADER ═══════════════ */}
                <section className="py-16 lg:py-24 relative overflow-hidden">
                    <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(201,168,76,0.06)_0%,transparent_70%)] pointer-events-none" />
                    <div className="container-custom max-w-3xl mx-auto relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <Link href="/blog" className="text-sm text-brand-gold hover:underline">
                                {p('backToBlog')}
                            </Link>
                            <span className="text-brand-gold-muted">|</span>
                            <span className="text-xs px-2.5 py-1 rounded-full bg-[rgba(201,168,76,0.1)] text-brand-gold border border-brand-gold/20">
                                {article.category}
                            </span>
                            <span className="text-xs text-brand-gold-muted">{article.readTime}</span>
                        </div>
                        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.15] mb-4">
                            {article.title}
                        </h1>
                        <p className="text-brand-gold-muted leading-relaxed">
                            {article.excerpt}
                        </p>
                    </div>
                </section>

                <div className="gold-divider" />

                {/* ═══════════════ ARTICLE CONTENT ═══════════════ */}
                <section className="py-16 lg:py-24">
                    <div className="container-custom max-w-3xl mx-auto">
                        <div className="space-y-6">
                            {article.content.map((block, i) => {
                                switch (block.type) {
                                    case 'h2':
                                        return (
                                            <h2 key={i} className="font-heading text-2xl sm:text-3xl font-bold text-white mt-10 mb-4">
                                                {block.text}
                                            </h2>
                                        );
                                    case 'h3':
                                        return (
                                            <h3 key={i} className="font-heading text-xl font-semibold text-white mt-6 mb-2">
                                                {block.text}
                                            </h3>
                                        );
                                    case 'p':
                                        return (
                                            <p key={i} className="text-brand-gold-muted leading-relaxed">
                                                {block.text}
                                            </p>
                                        );
                                    case 'ul':
                                        return (
                                            <ul key={i} className="space-y-2 pl-1">
                                                {block.items?.map((item, j) => (
                                                    <li key={j} className="flex items-start gap-2 text-brand-gold-muted">
                                                        <span className="text-brand-gold mt-1">•</span>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        );
                                    case 'tip':
                                        return (
                                            <div key={i} className="card p-5 border-brand-gold/20 bg-[rgba(201,168,76,0.04)]">
                                                <p className="text-sm text-brand-gold-muted leading-relaxed">
                                                    {block.text}
                                                </p>
                                            </div>
                                        );
                                    default:
                                        return null;
                                }
                            })}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-border-subtle">
                            {article.tags.map((tag) => (
                                <span key={tag} className="text-xs px-3 py-1.5 rounded-full bg-white/[0.04] text-brand-gold-muted border border-border-subtle">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="gold-divider" />

                {/* ═══════════════ INTERNAL LINKS ═══════════════ */}
                <section className="py-16 lg:py-24">
                    <div className="container-custom max-w-3xl mx-auto">
                        <h2 className="font-heading text-2xl font-bold text-white mb-6">
                            {p('relatedArticles')}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <Link href="/precios" className="card p-5 text-center hover:border-brand-gold/30 transition-all">
                                <div className="text-2xl mb-2">💰</div>
                                <p className="text-sm text-brand-gold-muted">
                                    {locale === 'ru' ? 'Цены' : locale === 'en' ? 'Prices' : 'Precios'}
                                </p>
                            </Link>
                            <Link href="/servicios" className="card p-5 text-center hover:border-brand-gold/30 transition-all">
                                <div className="text-2xl mb-2">🔌</div>
                                <p className="text-sm text-brand-gold-muted">{t('nav.services')}</p>
                            </Link>
                            <Link href="/calculator" className="card p-5 text-center hover:border-brand-gold/30 transition-all">
                                <div className="text-2xl mb-2">🧮</div>
                                <p className="text-sm text-brand-gold-muted">{t('nav.calculator')}</p>
                            </Link>
                            <Link href="/contacto" className="card p-5 text-center hover:border-brand-gold/30 transition-all">
                                <div className="text-2xl mb-2">📞</div>
                                <p className="text-sm text-brand-gold-muted">{t('nav.contact')}</p>
                            </Link>
                        </div>
                    </div>
                </section>

                <div className="gold-divider" />

                {/* ═══════════════ CTA ═══════════════ */}
                <section className="py-16 lg:py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[rgba(201,168,76,0.04)] to-transparent" />
                    <div className="container-custom relative z-10 text-center">
                        <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
                            {p('ctaTitle')}
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
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
