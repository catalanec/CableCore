import { describe, it, expect } from 'vitest';
import { formatInvoiceNumber, generateInvoiceHTML, type InvoicePDFData } from './invoice-pdf';

describe('formatInvoiceNumber', () => {
    it('pads a numeric invoice number to 5 digits', () => {
        expect(formatInvoiceNumber(21)).toBe('00021');
    });

    it('pads a string invoice number to 5 digits', () => {
        expect(formatInvoiceNumber('7')).toBe('00007');
    });

    it('does not truncate a number that already has 5+ digits', () => {
        expect(formatInvoiceNumber(123456)).toBe('123456');
    });
});

const baseData: InvoicePDFData = {
    invoiceNumber: 21,
    date: '15/03/2026',
    client: { razonSocial: 'Acme SL', cif: 'B12345678', address: 'Calle Falsa 123' },
    items: [
        { description: 'Cableado Cat6', quantity: 50, unitPrice: '0.55€', total: '27.50€' },
        { description: 'Puntos de red', quantity: 5, unitPrice: '20.00€', total: '100.00€' },
    ],
    subtotal: '127.50€',
    iva: '26.78€',
    total: '154.28€',
};

describe('generateInvoiceHTML', () => {
    it('includes the formatted invoice number and client details', () => {
        const html = generateInvoiceHTML(baseData);
        expect(html).toContain('Nº 00021');
        expect(html).toContain('Acme SL');
        expect(html).toContain('B12345678');
    });

    it('renders one table row per line item, alternating row background', () => {
        const html = generateInvoiceHTML(baseData);
        expect(html).toContain('Cableado Cat6');
        expect(html).toContain('Puntos de red');
        expect((html.match(/<tr style="background: #fff;">/g) || []).length).toBe(1);
    });

    it('calculates the due date as the invoice date plus 70 days (DD/MM/YYYY input)', () => {
        const html = generateInvoiceHTML({ ...baseData, date: '01/01/2026' });
        // 1 Jan 2026 + 70 days = 12 Mar 2026
        expect(html).toContain('Vencimiento: 12/03/2026');
    });

    it('omits the notes section when notes is not provided', () => {
        const html = generateInvoiceHTML(baseData);
        expect(html).not.toContain('Método de Pago');
    });

    it('includes the notes section when notes is provided', () => {
        const html = generateInvoiceHTML({ ...baseData, notes: 'Transferencia bancaria' });
        expect(html).toContain('Método de Pago');
        expect(html).toContain('Transferencia bancaria');
    });

    it('shows the urgency multiplier row only when provided', () => {
        const withoutUrgency = generateInvoiceHTML(baseData);
        expect(withoutUrgency).not.toContain('Multiplicador urgencia');

        const withUrgency = generateInvoiceHTML({ ...baseData, urgencyMultiplier: 'x1.5' });
        expect(withUrgency).toContain('Multiplicador urgencia');
        expect(withUrgency).toContain('x1.5');
    });

    it('falls back to default signature labels when signatureEmisor/signatureClient are not provided', () => {
        const html = generateInvoiceHTML(baseData);
        expect(html).toContain('Anton Shapoval');
        expect(html).toContain('Acme SL'); // client signature falls back to razonSocial
    });

    it('shows the additional client reference when refAdicional is provided', () => {
        const html = generateInvoiceHTML({ ...baseData, refAdicional: 'PO-9981' });
        expect(html).toContain('Ref. adicional cliente');
        expect(html).toContain('PO-9981');
    });
});
