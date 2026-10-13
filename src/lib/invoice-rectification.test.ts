import { describe, it, expect } from 'vitest';
import { buildRectificationPDFData, formatRectNumber, negateMoney, isoDateToES } from './invoice-rectification';
import { generateInvoiceHTML } from './invoice-pdf';

// La factura 00036 real (duplicada de la 00037), tal como está guardada.
const invoice36 = {
    id: 'inv-36',
    invoice_number: 36,
    razon_social: 'LATINIA INTERACTIVE BUISNESS S.A.',
    cif: 'A62179213',
    address: 'CARRER VALENCIA 307, 4/1, 08009, BARCELONA',
    email: 'helpdesk@latinia.com',
    phone: '+34634747573',
    created_at: '2026-09-18T10:42:03.944646+00:00',
    total_data: {
        items: [
            { description: 'Cableado CAT6 — suministro de cable', quantity: '15', unitPrice: '0.55€', total: '8.25€' },
            { description: 'Tendido de cable — Techo técnico (falso techo)', quantity: '15', unitPrice: '4.00€', total: '60.00€' },
            { description: 'Mano de obra — operarios, montaje, terminación, verificación', quantity: '1', unitPrice: '60.50€', total: '60.50€' },
            { description: 'Testeo y verificación', quantity: '1', unitPrice: '50.00€', total: '50.00€' },
        ],
        subtotal: '178.75', base: '178.75', iva: '37.54', total: '216.29', discount: '0.00', discountPercent: 0,
    },
};
const rect = { id: 'r1', rect_number: 1, invoice_id: 'inv-36', reason: 'duplicidad', issue_date: '2026-09-18', created_at: '2026-10-13T19:00:00Z' };

describe('factura rectificativa', () => {
    it('numera la serie R con el mismo ancho que las facturas (R0001)', () => {
        expect(formatRectNumber(1)).toBe('R0001');
        expect(formatRectNumber(12)).toBe('R0012');
    });

    it('pone en negativo importes con o sin €', () => {
        expect(negateMoney('8.25€')).toBe('-8.25€');
        expect(negateMoney('216.29')).toBe('-216.29€');
        expect(negateMoney('0.00')).toBe('0.00€');
    });

    it('fecha ISO sin desfase de zona horaria', () => {
        expect(isoDateToES('2026-09-18')).toBe('18/09/2026');
    });

    it('reproduce la factura 00036 con cada línea y los totales en negativo', () => {
        const data = buildRectificationPDFData(invoice36, rect);
        expect(data.invoiceNumber).toBe('R0001');
        expect(data.date).toBe('18/09/2026');
        expect(data.items.map(i => [i.quantity, i.unitPrice, i.total])).toEqual([
            ['15', '-0.55€', '-8.25€'],
            ['15', '-4.00€', '-60.00€'],
            ['1', '-60.50€', '-60.50€'],
            ['1', '-50.00€', '-50.00€'],
        ]);
        expect([data.subtotal, data.iva, data.total]).toEqual(['-178.75€', '-37.54€', '-216.29€']);
        expect(data.client.cif).toBe('A62179213');
    });

    it('el PDF lleva el título, el número R0001 y la leyenda que pide la gestoría', () => {
        const html = generateInvoiceHTML(buildRectificationPDFData(invoice36, rect));
        expect(html).toContain('FACTURA RECTIFICATIVA');
        expect(html).toContain('Nº R0001');
        expect(html).toContain('FACTURA RECTIFICATIVA DE LA FACTURA 00036 POR DUPLICIDAD');
        expect(html).toContain('Rectifica la factura Nº 00036');
        expect(html).not.toContain('Vencimiento');
        expect(html).not.toContain('Método de Pago');
        expect(html).toContain('-216.29€');
    });

    it('una factura normal no cambia', () => {
        const html = generateInvoiceHTML({
            invoiceNumber: 37, date: '18/09/2026',
            client: { razonSocial: 'X', cif: 'Y', address: '' },
            items: [], subtotal: '1€', iva: '0.21€', total: '1.21€',
        });
        expect(html).toContain('Nº 00037');
        expect(html).toContain('Vencimiento');
        expect(html).not.toContain('RECTIFICATIVA');
    });
});
