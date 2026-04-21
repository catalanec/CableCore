export interface SEOPageConfig {
    slug: string;
    title: string;
    h1: string;
    h2s: string[];
    intro: string;
    features: { icon: string; title: string; text: string }[];
    faq: { q: string; a: string }[];
    metaDescription: string;
    cta: string;
}
