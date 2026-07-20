import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { createSupabaseMock } from '@/test-utils/supabase-mock';

const createClientMock = vi.fn();
vi.mock('@supabase/supabase-js', () => ({
    createClient: (...args: unknown[]) => createClientMock(...args),
}));

function basicAuthHeader(user: string, pass: string) {
    return `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
}

function invoiceRequest(body: unknown, authed = true) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authed) headers.authorization = basicAuthHeader('test-admin', 'test-password');
    return new NextRequest('https://cablecore.es/api/invoice/create', { method: 'POST', body: JSON.stringify(body), headers });
}

describe('POST /api/invoice/create', () => {
    beforeEach(() => {
        createClientMock.mockReset();
    });

    it('rejects unauthenticated requests', async () => {
        const { POST } = await import('./route');
        const res = await POST(invoiceRequest({ razon_social: 'Acme', cif: 'B12345678' }, false));
        expect(res.status).toBe(401);
    });

    it('returns 400 when razon_social is missing', async () => {
        const { POST } = await import('./route');
        const res = await POST(invoiceRequest({ cif: 'B12345678' }));
        expect(res.status).toBe(400);
    });

    it('returns 400 when cif is missing', async () => {
        const { POST } = await import('./route');
        const res = await POST(invoiceRequest({ razon_social: 'Acme' }));
        expect(res.status).toBe(400);
    });

    it('creates the invoice and returns its number on success', async () => {
        createClientMock.mockReturnValue(createSupabaseMock({
            tables: {
                invoices: [{ data: { id: 'inv-1', invoice_number: 42 }, error: null }],
                quotes: [{ data: null, error: null }],
            },
        }));
        const { POST } = await import('./route');
        const res = await POST(invoiceRequest({ razon_social: 'Acme', cif: 'B12345678', quote_id: 'quote-1' }));
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toEqual({ success: true, invoice_number: 42, invoice_id: 'inv-1' });
    });

    it('does not attempt to update a quote when quote_id is not provided', async () => {
        const mock = createSupabaseMock({ tables: { invoices: [{ data: { id: 'inv-1', invoice_number: 1 }, error: null }] } });
        createClientMock.mockReturnValue(mock);
        const { POST } = await import('./route');
        await POST(invoiceRequest({ razon_social: 'Acme', cif: 'B12345678' }));
        expect(mock.from).not.toHaveBeenCalledWith('quotes');
    });

    it('returns 500 when the Supabase insert fails', async () => {
        createClientMock.mockReturnValue(createSupabaseMock({
            tables: { invoices: [{ data: null, error: { message: 'duplicate key' } }] },
        }));
        const { POST } = await import('./route');
        const res = await POST(invoiceRequest({ razon_social: 'Acme', cif: 'B12345678' }));
        expect(res.status).toBe(500);
    });

    it('returns 500 when Supabase credentials are not configured', async () => {
        const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const originalAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        process.env.NEXT_PUBLIC_SUPABASE_URL = '';
        process.env.SUPABASE_SERVICE_ROLE_KEY = '';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';
        try {
            const { POST } = await import('./route');
            const res = await POST(invoiceRequest({ razon_social: 'Acme', cif: 'B12345678' }));
            expect(res.status).toBe(500);
            expect((await res.json()).error).toBe('Database configuration missing');
        } finally {
            process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
            process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalAnon;
        }
    });

    it('returns 500 (outer catch) when the request body is not valid JSON', async () => {
        const { POST } = await import('./route');
        const badReq = new NextRequest('https://cablecore.es/api/invoice/create', {
            method: 'POST',
            body: '{not-json',
            headers: { 'Content-Type': 'application/json', authorization: basicAuthHeader('test-admin', 'test-password') },
        });
        const res = await POST(badReq);
        expect(res.status).toBe(500);
        expect((await res.json()).error).toBe('Server error');
    });
});
