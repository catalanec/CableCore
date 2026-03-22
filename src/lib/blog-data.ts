export interface BlogArticle {
    slug: string;
    title: string;
    metaTitle: string;
    metaDescription: string;
    excerpt: string;
    date: string;
    readTime: string;
    category: string;
    tags: string[];
    content: Array<{
        type: 'h2' | 'h3' | 'p' | 'ul' | 'tip';
        text?: string;
        items?: string[];
    }>;
}

interface MultiLangArticle {
    slug: string;
    date: string;
    readTime: string;
    es: Omit<BlogArticle, 'slug' | 'date' | 'readTime'>;
    en: Omit<BlogArticle, 'slug' | 'date' | 'readTime'>;
    ru: Omit<BlogArticle, 'slug' | 'date' | 'readTime'>;
}

import blogData from './blog-data.json';

const MULTILANG_ARTICLES: MultiLangArticle[] = blogData as MultiLangArticle[];;

/** Get blog articles for a specific locale */
export function getBlogArticles(locale: string): BlogArticle[] {
    const lang = (locale === 'en' || locale === 'ru') ? locale : 'es';
    return MULTILANG_ARTICLES.map((a) => ({
        slug: a.slug,
        date: a.date,
        readTime: a.readTime,
        ...a[lang as 'es' | 'en' | 'ru'],
    }));
}

/** Legacy export for backward compatibility — returns ES articles */
export const BLOG_ARTICLES = getBlogArticles('es');
