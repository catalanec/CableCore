import { describe, it, expect } from 'vitest';
import { generateInvoiceEmailHTML, generateInvoiceEmailSubject, type InvoiceEmailData } from './invoice-email';

const baseData: InvoiceEmailData = {
    clientName: 'Bob Smith',
    quoteNumber: 'CC-20260101-ABC123',
    projectSummary: 'Cableado Cat6, 150m, 12 puntos',
    totalAmount: 2000,
    paymentAmount: 1000,
    paymentType: 'advance',
    paymentUrl: 'https://checkout.stripe.com/session-1',
};

describe('generateInvoiceEmailHTML', () => {
    it('renders the "advance" payment step as the active step with pending final step', () => {
        const html = generateInvoiceEmailHTML(baseData);
        expect(html).toContain('Anticipo (50%)');
        expect(html).toContain('(este pago)');
        expect(html).toContain('(al finalizar)');
    });

    it('renders the "final" payment step as active with the advance step marked paid', () => {
        const html = generateInvoiceEmailHTML({ ...baseData, paymentType: 'final' });
        expect(html).toContain('Pago Final (50%)');
        expect(html).toContain('(pagado)');
        expect(html).toContain('Estado del proyecto');
    });

    it('includes the payment URL in the CTA button', () => {
        const html = generateInvoiceEmailHTML(baseData);
        expect(html).toContain('href="https://checkout.stripe.com/session-1"');
    });

    it('formats monetary amounts to two decimal places', () => {
        const html = generateInvoiceEmailHTML({ ...baseData, paymentAmount: 999.999, totalAmount: 1999.995 });
        expect(html).toContain('1000.00€');
    });

    it('escapes HTML-sensitive characters in client name and project summary', () => {
        const html = generateInvoiceEmailHTML({ ...baseData, clientName: '<script>alert(1)</script>' });
        expect(html).not.toContain('<script>alert(1)</script>');
        expect(html).toContain('&lt;script&gt;');
    });

    it('omits the "view quote" link when quoteViewUrl is not provided', () => {
        const html = generateInvoiceEmailHTML(baseData);
        expect(html).not.toContain('Ver presupuesto completo');
    });

    it('includes the "view quote" link when quoteViewUrl is provided', () => {
        const html = generateInvoiceEmailHTML({ ...baseData, quoteViewUrl: 'https://cablecore.es/quote/1' });
        expect(html).toContain('Ver presupuesto completo');
        expect(html).toContain('https://cablecore.es/quote/1');
    });
});

describe('generateInvoiceEmailSubject', () => {
    it('returns an "Anticipo" subject for advance payments', () => {
        expect(generateInvoiceEmailSubject({ paymentType: 'advance', quoteNumber: 'CC-1' }))
            .toBe('CableCore — Anticipo Proyecto CC-1');
    });

    it('returns a "Pago Final" subject for final payments', () => {
        expect(generateInvoiceEmailSubject({ paymentType: 'final', quoteNumber: 'CC-1' }))
            .toBe('CableCore — Pago Final Proyecto CC-1');
    });
});
