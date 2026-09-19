/** Minimal shape the dedup helpers need; the real article carries much more. */
interface SluggedArticle {
    slug: string;
    date?: string;
}

/** An article as the publisher hands it over, before anything is committed. */
interface TitledArticle extends SluggedArticle {
    es?: { title?: string };
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

/** Titles are compared ignoring case, accents, punctuation and spacing. */
function normaliseTitle(title: string): string {
    return title
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

/**
 * True when this article repeats something already published — by slug or by
 * Spanish title.
 *
 * The slug check alone was not enough. On 2026-09-11 the publisher produced
 * 'cableado-de-red-para-restaurantes-y-hosteleria-2023' against
 * 'cableado-de-red-para-restaurantes-y-hosteleria' from 2026-08-07: a year
 * suffix is a different slug, so it went through, while the Spanish title was
 * identical character for character. The bodies differ, but Google sees two
 * pages answering one query and picks one — the other is wasted work that also
 * drags on the first.
 */
export function isDuplicateArticle(
    articles: readonly TitledArticle[],
    candidate: TitledArticle,
): boolean {
    if (isDuplicateSlug(articles, candidate.slug ?? '')) return true;

    const title = normaliseTitle(candidate.es?.title ?? '');
    if (!title) return true; // an article with no Spanish title is not publishable
    return articles.some((a) => normaliseTitle(a.es?.title ?? '') === title);
}
