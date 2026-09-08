/** Minimal shape the dedup helpers need; the real article carries much more. */
interface SluggedArticle {
    slug: string;
    date?: string;
}

/**
 * Slugs are compared case- and punctuation-insensitively.
 *
 * The publisher only ever produced an exact repeat, but "Guia-WiFi" and
 * "guia-wifi" would be two entries pointing at one route, which is the same
 * defect wearing a different hat.
 */
export function normaliseSlug(slug: string): string {
    return slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * True when `slug` is already published.
 *
 * The blog cron listed the existing slugs in its prompt and asked the model
 * not to repeat one. On 2026-09-04 the model repeated
 * 'cableado-de-red-para-coworkings-y-espacios-de-oficina-compartida', first
 * published on 2026-07-24, and the route appended it without checking — so
 * the sitemap carried each of its three locale URLs twice and the blog index
 * rendered the article twice. A prompt is a request, not a constraint.
 */
export function isDuplicateSlug(articles: readonly SluggedArticle[], slug: string): boolean {
    const target = normaliseSlug(slug);
    if (!target) return true; // an empty slug is never publishable
    return articles.some((a) => normaliseSlug(a.slug) === target);
}

/**
 * Drop repeated slugs, keeping the first occurrence.
 *
 * `getBlogArticles` resolves a route with `find`, so a duplicate is already
 * unreachable as a page — but it still reached the sitemap and the listing,
 * which is where the damage was. Deduplicating at the source keeps both
 * honest even if a bad entry lands again.
 */
export function dedupeBySlug<T extends SluggedArticle>(articles: readonly T[]): T[] {
    const seen = new Set<string>();
    const out: T[] = [];
    for (const a of articles) {
        const key = normaliseSlug(a.slug);
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(a);
    }
    return out;
}
