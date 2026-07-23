import { describe, it, expect } from 'vitest';
import { generateQuoteNumber, generateQuoteHTML, type QuotePDFData } from './quote-pdf';

describe('generateQuoteNumber', () => {
    it('matches the CC-YYMMDD-NNN format', () => {
        expect(generateQuoteNumber()).toMatch(/^CC-\d{6}-\d{3}$/);
    });

    it('embeds today\'s date (YYMMDD)', () => {
        const now = new Date();
        const y = now.getFullYear().toString().slice(-2);
        const m = (now.getMonth() + 1).toString().padStart(2, '0');
        const d = now.getDate().toString().padStart(2, '0');
        expect(generateQuoteNumber()).toContain(`CC-${y}${m}${d}-`);
    });
});

const baseData: QuotePDFData = {
    quoteNumber: 'CC-260101-001',
    date: '01/01/2026',
    client: { name: 'Alice', phone: '600111222', email: 'alice@example.com' },
    items: [{ description: 'Cableado Cat6', quantity: '50', unitPrice: '0.55€', total: '27.50€' }],
    subtotal: '27.50€',
    iva: '5.78€',
    total: '33.28€',
};

describe('generateQuoteHTML', () => {
    it('includes the quote number and client info', () => {
        const html = generateQuoteHTML(baseData);
        expect(html).toContain('CC-260101-001');
        expect(html).toContain('Alice');
        expect(html).toContain('600111222');
    });

    it('omits the address line when the client address is not provided', () => {
        const html = generateQuoteHTML(baseData);
        expect(html).not.toContain('Dirección:');
    });

    it('includes the address line when provided', () => {
        const html = generateQuoteHTML({ ...baseData, client: { ...baseData.client, address: 'Calle Falsa 123' } });
        expect(html).toContain('Dirección:');
        expect(html).toContain('Calle Falsa 123');
    });

    it('shows the discount row only when a discount is provided, including the percent label', () => {
        const withoutDiscount = generateQuoteHTML(baseData);
        expect(withoutDiscount).not.toContain('Descuento');

        const withDiscount = generateQuoteHTML({ ...baseData, discount: '10.00€', discountPercent: 10 });
        expect(withDiscount).toContain('Descuento (-10%)');
        expect(withDiscount).toContain('-10.00€');
    });

    it('shows the urgency multiplier row only when provided', () => {
        const html = generateQuoteHTML({ ...baseData, urgencyMultiplier: 'x1.5' });
        expect(html).toContain('Multiplicador urgencia');
    });

    // Previously the printed quote had no warranty terms at all — a client
    // reading only the PDF (not the marketing site's FAQ) had no way to know
    // one applied, which is exactly what a real client asked about (round 19).
    it('states the 5-year labor warranty in the conditions block', () => {
        const html = generateQuoteHTML(baseData);
        expect(html).toContain('5 años en mano de obra');
    });

    it('sanitizes the client name for the PDF title by replacing whitespace with underscores', () => {
        const html = generateQuoteHTML({ ...baseData, client: { ...baseData.client, name: 'Alice Wonderland' } });
        expect(html).toContain('Presupuesto_CableCore_Alice_Wonderland');
    });

    it('falls back to the quote number for the title when the client name is empty', () => {
        const html = generateQuoteHTML({ ...baseData, client: { ...baseData.client, name: '' } });
        expect(html).toContain(`Presupuesto_CableCore_${baseData.quoteNumber}`);
    });

    it('falls back to default signature labels when not provided', () => {
        const html = generateQuoteHTML(baseData);
        expect(html).toContain('Anton Shapoval');
        expect(html).toContain('Alice'); // client signature falls back to client name
    });
});
