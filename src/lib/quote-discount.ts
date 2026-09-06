/**
 * The discount a quote was actually written with.
 *
 * `quotes.discount` only exists from the add_discount_to_quotes migration on.
 * Rows written before it — and any written by an older deploy still running
 * against the new schema — carry the discount implicitly instead: `iva` and
 * `total` were both computed on the discounted base while `subtotal` stayed
 * pre-discount, so the difference is recoverable.
 *
 *   base     = total - iva          (what was charged, after urgency)
 *   discount = subtotal - base / urgencyMultiplier
 */
export function quoteDiscount(q: any): number {
    const stored = Number(q?.discount);
    if (Number.isFinite(stored) && stored > 0) return stored;

    const subtotal = Number(q?.subtotal);
    const iva = Number(q?.iva);
    const total = Number(q?.total);
    const urgency = Number(q?.urgency_multiplier) || 1;
    if (![subtotal, iva, total].every(Number.isFinite) || urgency === 0) return 0;

    const derived = subtotal - (total - iva) / urgency;
    // sub-cent results are rounding noise, not a discount
    return derived > 0.005 ? Math.round(derived * 100) / 100 : 0;
}

export function quoteDiscountPercent(q: any): number {
    const stored = Number(q?.discount_percent);
    if (Number.isFinite(stored) && stored > 0) return stored;

    const subtotal = Number(q?.subtotal);
    const discount = quoteDiscount(q);
    if (!Number.isFinite(subtotal) || subtotal <= 0 || discount <= 0) return 0;
    return Math.round((discount / subtotal) * 10000) / 100;
}
