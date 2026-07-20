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

function deleteRequest(id: string | null, authed = true) {
    const url = id ? `https://cablecore.es/api/invoice/delete?id=${id}` : 'https://cablecore.es/api/invoice/delete';
    const headers: Record<string, string> = {};
    if (authed) headers.authorization = basicAuthHeader('test-admin', 'test-password');
    return new NextRequest(url, { method: 'DELETE', headers });
}

describe('DELETE /api/invoice/delete', () => {
    beforeEach(() => {
        createClientMock.mockReset();
    });

    it('rejects unauthenticated requests', async () => {
        const { DELETE } = await import('./route');
        const res = await DELETE(deleteRequest('inv-1', false));
        expect(res.status).toBe(401);
    });

    it('returns 400 when id query param is missing', async () => {
        const { DELETE } = await import('./route');
        const res = await DELETE(deleteRequest(null));
        expect(res.status).toBe(400);
    });

    it('deletes the invoice and resets the invoice sequence on success', async () => {
        const mock = createSupabaseMock({ tables: { invoices: [{ data: null, error: null }] } });
        createClientMock.mockReturnValue(mock);
        const { DELETE } = await import('./route');
        const res = await DELETE(deleteRequest('inv-1'));
        expect(res.status).toBe(200);
        expect(mock.rpc).toHaveBeenCalledWith('reset_invoice_sequence');
    });

    it('returns 500 and does not reset the sequence when the delete fails', async () => {
        const mock = createSupabaseMock({ tables: { invoices: [{ data: null, error: { message: 'not found' } }] } });
        createClientMock.mockReturnValue(mock);
        const { DELETE } = await import('./route');
        const res = await DELETE(deleteRequest('missing-id'));
        expect(res.status).toBe(500);
        expect(mock.rpc).not.toHaveBeenCalled();
    });

    it('returns 500 when Supabase credentials are not configured', async () => {
        const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const originalAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        process.env.NEXT_PUBLIC_SUPABASE_URL = '';
        process.env.SUPABASE_SERVICE_ROLE_KEY = '';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';
        try {
            const { DELETE } = await import('./route');
            const res = await DELETE(deleteRequest('inv-1'));
            expect(res.status).toBe(500);
            expect((await res.json()).error).toBe('Database configuration missing');
        } finally {
            process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
            process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalAnon;
        }
    });

    it('returns 500 (outer catch) when creating the Supabase client throws', async () => {
        createClientMock.mockImplementation(() => { throw new Error('client init failed'); });
        const { DELETE } = await import('./route');
        const res = await DELETE(deleteRequest('inv-1'));
        expect(res.status).toBe(500);
        expect((await res.json()).error).toBe('Server error');
    });
});
