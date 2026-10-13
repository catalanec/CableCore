/* ═══════════════════════════════════════════
   Factura rectificativa — anula una factura emitida por error
   (p. ej. duplicada). Es un documento propio, con su propia serie
   (R0001, R0002…), que reproduce la factura original con todos los
   importes en negativo y dice qué factura rectifica y por qué.
   ═══════════════════════════════════════════ */

import { formatInvoiceNumber, type InvoicePDFData } from './invoice-pdf';

export interface InvoiceRow {
    id: string;
    invoice_number: number;
    razon_social: string;
    cif: string;
    address?: string | null;
    email?: string | null;
    phone?: string | null;
    total_data?: Record<string, any> | null;
    created_at: string;
}

export interface RectificationRow {
    id: string;
    rect_number: number;
    invoice_id: string;
    reason: string;
    issue_date: string; // YYYY-MM-DD
    created_at: string;
}

/** R0001, R0002… — serie separada de la de facturas, mismo ancho que «00036». */
export function formatRectNumber(n: number): string {
    return `R${String(n).padStart(4, '0')}`;
}

/** "8.25€" → "-8.25€"; acepta números o cadenas con o sin "€". */
export function negateMoney(value: unknown): string {
    const n = typeof value === 'number' ? value : parseFloat(String(value ?? '').replace(/[^\d.,-]/g, '').replace(',', '.'));
    if (!Number.isFinite(n) || n === 0) return '0.00€';
    return `${(-Math.abs(n)).toFixed(2)}€`;
}

function formatDateES(d: Date): string {
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** "2026-09-18" → "18/09/2026" sin desfases de zona horaria. */
export function isoDateToES(iso: string): string {
    const [y, m, d] = iso.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
}

/** Datos para imprimir la rectificativa de `inv`. */
export function buildRectificationPDFData(inv: InvoiceRow, rect: RectificationRow): InvoicePDFData {
    const td = inv.total_data || {};
    const items: InvoicePDFData['items'] = (td.items && td.items.length
        ? td.items
        : [{ description: 'Servicios técnicos', quantity: '1', unitPrice: td.subtotal, total: td.subtotal }]
    ).map((it: any) => ({
        description: it.description,
        quantity: it.quantity,
        unitPrice: negateMoney(it.unitPrice),
        total: negateMoney(it.total),
    }));
    const hasDiscount = Number(td.discount || 0) > 0;
    return {
        invoiceNumber: formatRectNumber(rect.rect_number),
        date: isoDateToES(rect.issue_date),
        client: {
            razonSocial: inv.razon_social,
            cif: inv.cif,
            address: inv.address || '',
            email: inv.email || '',
            phone: inv.phone || '',
        },
        items,
        subtotal: negateMoney(td.subtotal),
        ...(hasDiscount ? {
            discount: negateMoney(td.discount).replace(/^-/, ''),
            discountPercent: Number(td.discountPercent) || undefined,
            base: negateMoney(td.base ?? td.subtotal),
        } : {}),
        iva: negateMoney(td.iva),
        total: negateMoney(td.total),
        signatureEmisor: td.signatureEmisor || 'Anton Shapoval',
        signatureClient: td.signatureClient || inv.razon_social,
        rectification: {
            number: formatRectNumber(rect.rect_number),
            originalNumber: formatInvoiceNumber(inv.invoice_number),
            originalDate: formatDateES(new Date(inv.created_at)),
            reason: rect.reason,
        },
    };
}
