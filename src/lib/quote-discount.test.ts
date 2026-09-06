import { describe, it, expect } from 'vitest';
import { quoteDiscount, quoteDiscountPercent } from './quote-discount';

/**
 * Afonso Pires, quote 1735ae61 — the row that surfaced the bug. The quote PDF
 * showed a 5% discount, but converting it to an invoice charged IVA on the
 * pre-discount base and came out 190.75€ too high.
 */
const legacyQuote = {
    subtotal: '3152.90',
    iva: '629.00',
    total: '3624.26',
    urgency_multiplier: '1.00',
    discount: '0',
    discount_percent: '0',
};

describe('quoteDiscount', () => {
    it('prefers the stored discount once the column is populated', () => {
        expect(quoteDiscount({ ...legacyQuote, discount: '157.64' })).toBe(157.64);
    });

    it('recovers the discount from a row written before the column existed', () => {
        expect(quoteDiscount(legacyQuote)).toBeCloseTo(157.64, 2);
    });

    it('accounts for the urgency multiplier, which is applied after the discount', () => {
        // subtotal 1000, 10% off, ×1.5 urgency → base 1350, iva 283.50, total 1633.50
        expect(quoteDiscount({
            subtotal: '1000.00', iva: '283.50', total: '1633.50', urgency_multiplier: '1.50',
        })).toBeCloseTo(100, 2);
    });

    it('returns 0 for a quote that never had a discount', () => {
        expect(quoteDiscount({
            subtotal: '1000.00', iva: '210.00', total: '1210.00', urgency_multiplier: '1.00',
        })).toBe(0);
    });

    it('treats sub-cent drift as no discount rather than inventing one', () => {
        expect(quoteDiscount({
            subtotal: '1000.00', iva: '209.99', total: '1209.99', urgency_multiplier: '1.00',
        })).toBe(0);
    });

    it('returns 0 rather than NaN when the totals are missing', () => {
        expect(quoteDiscount({})).toBe(0);
        expect(quoteDiscount(null)).toBe(0);
    });

    it('does not divide by a zero urgency multiplier', () => {
        expect(quoteDiscount({ ...legacyQuote, urgency_multiplier: '0' })).toBeCloseTo(157.64, 2);
    });
});

describe('quoteDiscountPercent', () => {
    it('prefers the stored percent', () => {
        expect(quoteDiscountPercent({ ...legacyQuote, discount_percent: '5' })).toBe(5);
    });

    it('derives the percent from a legacy row', () => {
        expect(quoteDiscountPercent(legacyQuote)).toBeCloseTo(5, 2);
    });

    it('returns 0 when there is no discount to express as a percent', () => {
        expect(quoteDiscountPercent({
            subtotal: '1000.00', iva: '210.00', total: '1210.00', urgency_multiplier: '1.00',
        })).toBe(0);
    });

    it('returns 0 for a zero subtotal instead of dividing by it', () => {
        expect(quoteDiscountPercent({ subtotal: '0', discount: '10' })).toBe(0);
    });
});

describe('the total the bug produced', () => {
    it('reproduces the wrong invoice total when the discount is ignored', () => {
        const subtotal = 3152.90;
        const wrongIva = subtotal * 0.21;
        expect(Number((subtotal + wrongIva).toFixed(2))).toBe(3815.01);
    });

    it('matches the quote once the discount is applied before IVA', () => {
        const subtotal = 3152.90;
        const base = subtotal - quoteDiscount(legacyQuote);
        const iva = base * 0.21;
        expect(Number(iva.toFixed(2))).toBe(629.00);
        expect(Number((base + iva).toFixed(2))).toBe(3624.26);
    });
});
