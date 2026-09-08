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
    richSections?: { h2: string; paragraphs: string[] }[];
    /**
     * ISO date of the last real content change on this page. Feeds <lastmod> in
     * the sitemap, so bump it whenever the copy changes — leaving it stale tells
     * Google the page is unchanged and it stops coming back to re-crawl.
     */
    updated?: string;
}
