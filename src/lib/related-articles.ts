import type { BlogArticle } from './blog-data';

/**
 * Pick the articles most worth linking to from `current`.
 *
 * Every article on the site had exactly one inbound internal link — from the
 * blog index — because the "related" block under each post pointed at service
 * pages and the calculator rather than at other posts. A crawler reaching an
 * article therefore found no path onward, and 111 articles shared a single
 * entry point.
 *
 * Ranking, highest first:
 *   3 points per shared tag  — the strongest signal of genuine topicality
 *   2 points for the same category
 *   1 point  if published within a year of each other
 *
 * Ties break by recency, then by slug so the output is stable between builds:
 * an unstable order would change the rendered HTML on every deploy for no
 * reason and invite spurious re-crawls.
 */
export function pickRelatedArticles(
    articles: readonly BlogArticle[],
    current: BlogArticle,
    limit = 4,
): BlogArticle[] {
    if (limit <= 0) return [];

    const currentTags = new Set(current.tags.map(normaliseTag));
    const currentTime = Date.parse(current.date);

    const scored = articles
        .filter((a) => a.slug !== current.slug)
        .map((a) => {
            let score = 0;
            for (const tag of a.tags) {
                if (currentTags.has(normaliseTag(tag))) score += 3;
            }
            if (a.category === current.category) score += 2;

            const time = Date.parse(a.date);
            if (Number.isFinite(time) && Number.isFinite(currentTime)) {
                const yearMs = 365 * 24 * 60 * 60 * 1000;
                if (Math.abs(time - currentTime) <= yearMs) score += 1;
            }
            return { article: a, score, time: Number.isFinite(time) ? time : 0 };
        });

    scored.sort((x, y) => {
        if (y.score !== x.score) return y.score - x.score;
        if (y.time !== x.time) return y.time - x.time;
        return x.article.slug.localeCompare(y.article.slug);
    });

    const byScore = scored.map((s) => s.article);

    // Scoring alone is not enough. Measured over the real 36 articles it left
    // nine of them with no inbound link at all while one collected 22, because
    // topical similarity concentrates on whatever tag is most common. One slot
    // is therefore reserved for the ring successor — every article links to the
    // next one in slug order, wrapping at the end. That single Hamiltonian
    // cycle makes an orphan impossible no matter how the tags fall.
    const successor = ringSuccessor(articles, current);
    if (!successor) return byScore.slice(0, limit);

    const rest = byScore.filter((a) => a.slug !== successor.slug);
    return [...rest.slice(0, limit - 1), successor];
}

/** The next article in slug order, wrapping — a stable cycle over the whole set. */
function ringSuccessor(articles: readonly BlogArticle[], current: BlogArticle): BlogArticle | null {
    const ordered = [...articles].sort((a, b) => a.slug.localeCompare(b.slug));
    const i = ordered.findIndex((a) => a.slug === current.slug);
    if (i === -1 || ordered.length < 2) return null;
    return ordered[(i + 1) % ordered.length];
}

/** Tags are author-entered, so "WiFi" and "wifi" are the same tag. */
function normaliseTag(tag: string): string {
    return tag.trim().toLowerCase();
}
