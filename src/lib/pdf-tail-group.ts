/**
 * Keeps the end of a printed document from stranding on a page of its own.
 *
 * The quote and invoice templates lay out one long items table followed by the
 * totals, the payment conditions and the signature lines. The signature block
 * already carries `page-break-inside: avoid`, so it does not split internally —
 * but nothing said that any of it belongs WITH the table. So when the last rows
 * landed near the bottom of page one, the whole tail moved to page two by
 * itself: page one ended in a wide blank gap, and page two held a total, a bank
 * account and two signature lines with no items above them. A client receives
 * that as a document that looks unfinished, or worse, altered.
 *
 * The fix is to make the last few rows part of the same unbreakable group as
 * everything that follows. Either it all fits on page one, or it moves as one
 * piece and page two opens with real content — the final items — and closes
 * with the signatures underneath them.
 *
 * Ported from the same fix in PresupuestoPRO (round 33), which reached this
 * shape after the naive version — avoid breaks inside each block separately —
 * turned out to be exactly what produced the lonely totals page.
 */

/** Rows that travel with the totals. Three is enough to fill the top of a
 *  second page without risking a group too tall to place. */
export const DEFAULT_TAIL_ROWS = 3;

/**
 * The main table must not be left with a header and one lonely row, which
 * looks just as broken as the empty page this exists to prevent.
 */
const MIN_ROWS_LEFT_BEHIND = 2;

/**
 * Column widths, shared by the main table and the continuation table.
 *
 * They have to be stated explicitly and identically in both: without them each
 * table sizes its columns from its own content, and the two halves visibly
 * disagree about where "Cantidad" starts.
 */
export const ITEM_COLUMN_WIDTHS = ['52%', '12%', '18%', '18%'] as const;

export interface TailSplit<T> {
    head: T[];
    tail: T[];
}

/**
 * Splits items into those that stay with the main table and those that travel
 * with the totals and signatures.
 *
 * Returns an empty tail when the list is too short to give rows away: a short
 * quote fits on one page anyway, and grouping would only risk pushing it onto
 * a second page for no reason.
 */
export function splitItemsForTail<T>(
    items: readonly T[],
    tailCount: number = DEFAULT_TAIL_ROWS
): TailSplit<T> {
    const all = [...items];
    const wanted = Math.max(0, Math.trunc(tailCount));
    if (wanted === 0 || all.length < wanted + MIN_ROWS_LEFT_BEHIND) {
        return { head: all, tail: [] };
    }
    return { head: all.slice(0, all.length - wanted), tail: all.slice(-wanted) };
}

/** `<colgroup>` for a table, so both halves agree on their column geometry. */
export function buildColGroup(widths: readonly string[] = ITEM_COLUMN_WIDTHS): string {
    return `<colgroup>${widths.map(w => `<col style="width:${w}">`).join('')}</colgroup>`;
}

/**
 * The continuation table holding the tail rows.
 *
 * Repeats the column widths but NOT the header: a second header row would read
 * as a new section rather than the same list continuing. `margin-top:-1px`
 * closes the hairline the second `<table>` would otherwise draw between the two
 * halves when they end up on the same page, which is the common case.
 */
export function buildTailTableHtml(
    tailRowsHtml: string,
    widths: readonly string[] = ITEM_COLUMN_WIDTHS
): string {
    if (!tailRowsHtml) return '';
    return `<table style="width:100%;border-collapse:collapse;margin-top:-1px;margin-bottom:15px;">${buildColGroup(widths)}<tbody>${tailRowsHtml}</tbody></table>`;
}

/**
 * Wraps the tail rows and everything after them into one block the renderer is
 * asked not to split.
 *
 * If the group is taller than a page the renderer overrides the request — it
 * has to — and the document degrades to exactly the behaviour it had before
 * this existed, which is the right way to fail.
 */
export function wrapTailGroup(innerHtml: string): string {
    return `<div style="page-break-inside:avoid;break-inside:avoid;">${innerHtml}</div>`;
}
