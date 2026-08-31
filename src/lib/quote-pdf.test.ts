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

// The tail-group split (pdf-tail-group.ts) rebuilds the items table out of two
// tables. The failure that would matter is not a cosmetic one: a row lost
// between the halves would silently remove a priced line from a quote a client
// signs. These guard that.
describe('generateQuoteHTML — items table split across the page break', () => {
    const manyItems = (n: number) =>
        Array.from({ length: n }, (_, i) => ({
            description: `Partida numero ${i + 1}`,
            quantity: '1',
            unitPrice: '10.00€',
            total: '10.00€',
        }));

    it('renders every item exactly once on a long quote', () => {
        const html = generateQuoteHTML({ ...baseData, items: manyItems(20) });

        for (let i = 1; i <= 20; i++) {
            const occurrences = html.split(`Partida numero ${i}<`).length - 1;
            expect(occurrences).toBe(1);
        }
    });

    it('puts the last rows inside the unbreakable group, with the totals', () => {
        const html = generateQuoteHTML({ ...baseData, items: manyItems(20) });
        const groupStart = html.indexOf('page-break-inside:avoid;break-inside:avoid');

        expect(groupStart).toBeGreaterThan(-1);
        const group = html.slice(groupStart);
        // The final three rows travel with the totals rather than being left
        // at the bottom of page one.
        expect(group).toContain('Partida numero 18');
        expect(group).toContain('Partida numero 20');
        expect(group).toContain('TOTAL');
        // …and the earlier ones stay in the main table above it.
        expect(html.slice(0, groupStart)).toContain('Partida numero 1<');
        expect(group).not.toContain('Partida numero 1<');
    });

    it('leaves a short quote as a single table', () => {
        const html = generateQuoteHTML({ ...baseData, items: manyItems(3) });
        const groupStart = html.indexOf('page-break-inside:avoid;break-inside:avoid');

        expect(html.slice(0, groupStart)).toContain('Partida numero 3');
    });

    it('keeps the zebra striping continuous across the two tables', () => {
        const html = generateQuoteHTML({ ...baseData, items: manyItems(20) });
        // Row 18 is index 17 — odd, so it must carry the shaded background,
        // which only holds if the tail rows keep counting from where the head
        // left off instead of restarting at zero.
        const row18 = html.slice(html.indexOf('Partida numero 18') - 200, html.indexOf('Partida numero 18'));
        expect(row18).toContain('#f8f6f1');
    });
});

// Two constraints at once, and they pull against each other. The margin has
// to reach every page, which rules out vertical body padding (spent once by
// the flow) and the repeating <thead> spacer tried before it (Chrome honours
// it, WebKit ignores it — a real Safari print came out 21.4mm on page one and
// 3.8mm on page two). And it has to stay small enough that Chrome does not
// stamp the print dialog's header and footer onto a client's quote; measured,
// that line sits between 8mm and 10mm.
describe('generateQuoteHTML — page margins apply to every page', () => {
    it('keeps @page at 8mm — every page, and below Chrome\'s header threshold', () => {
        expect(generateQuoteHTML(baseData)).toMatch(/@page\s*\{\s*margin:\s*8mm;\s*\}/);
    });

    it('adds the rest of the side margin as horizontal body padding', () => {
        const html = generateQuoteHTML(baseData);

        expect(html).toMatch(/body\s*\{[^}]*padding:\s*0\s+6mm/);
        // Vertical body padding would reach only the first page.
        expect(html).not.toMatch(/body\s*\{[^}]*padding:\s*\d+mm\s/);
    });

    // The spacer table is gone on purpose: it produced a margin in Chrome and
    // none in Safari, which is worse than a smaller margin that is the same
    // everywhere.
    it('does not reserve the margin with a browser-specific spacer', () => {
        expect(generateQuoteHTML(baseData)).not.toContain('page-frame');
    });
});
