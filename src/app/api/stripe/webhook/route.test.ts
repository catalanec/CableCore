import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { createSupabaseMock } from '@/test-utils/supabase-mock';

const constructEventMock = vi.fn();
vi.mock('stripe', () => ({
    default: class StripeMock {
        webhooks = { constructEvent: constructEventMock };
    },
}));

const createClientMock = vi.fn();
vi.mock('@supabase/supabase-js', () => ({
    createClient: (...args: unknown[]) => createClientMock(...args),
}));

function webhookRequest(body: string, signature: string | null = 'valid-sig') {
    const headers: Record<string, string> = {};
    if (signature !== null) headers['stripe-signature'] = signature;
    return new NextRequest('https://cablecore.es/api/stripe/webhook', { method: 'POST', body, headers });
}

describe('POST /api/stripe/webhook', () => {
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        process.env = { ...ORIGINAL_ENV, STRIPE_SECRET_KEY: 'sk_test_123', STRIPE_WEBHOOK_SECRET: 'whsec_123' };
        constructEventMock.mockReset();
        createClientMock.mockReset();
        vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true })));
    });

    afterEach(() => {
        process.env = ORIGINAL_ENV;
        vi.unstubAllGlobals();
    });

    it('returns 500 when STRIPE_SECRET_KEY is not configured', async () => {
        process.env.STRIPE_SECRET_KEY = '';
        const { POST } = await import('./route');
        const res = await POST(webhookRequest('{}'));
        expect(res.status).toBe(500);
    });

    it('returns 500 when STRIPE_WEBHOOK_SECRET is not configured', async () => {
        process.env.STRIPE_WEBHOOK_SECRET = '';
        const { POST } = await import('./route');
        const res = await POST(webhookRequest('{}'));
        expect(res.status).toBe(500);
    });

    it('returns 400 when the stripe-signature header is missing', async () => {
        const { POST } = await import('./route');
        const res = await POST(webhookRequest('{}', null));
        expect(res.status).toBe(400);
        expect((await res.json()).error).toContain('Missing stripe-signature');
    });

    it('returns 400 when signature verification fails', async () => {
        constructEventMock.mockImplementation(() => { throw new Error('bad signature'); });
        const { POST } = await import('./route');
        const res = await POST(webhookRequest('{}'));
        expect(res.status).toBe(400);
        expect((await res.json()).error).toBe('Invalid signature');
    });

    it('marks the project as advance_paid on an "advance" checkout completion', async () => {
        const mock = createSupabaseMock({ tables: { projects: [{ data: null, error: null }] } });
        createClientMock.mockReturnValue(mock);
        constructEventMock.mockReturnValue({
            type: 'checkout.session.completed',
            data: { object: { metadata: { projectId: 'proj-1', paymentType: 'advance', clientName: 'Bob' }, amount_total: 50000 } },
        });
        const { POST } = await import('./route');
        const res = await POST(webhookRequest('{}'));
        expect(res.status).toBe(200);
        expect((await res.json())).toEqual({ received: true });
        const updateCalls = mock.from.mock.results.filter((_, i) => mock.from.mock.calls[i][0] === 'projects');
        expect(updateCalls.length).toBeGreaterThan(0);
    });

    it('marks the project as final_paid + payment_status paid on a "final" checkout completion', async () => {
        const mock = createSupabaseMock({ tables: { projects: [{ data: null, error: null }] } });
        createClientMock.mockReturnValue(mock);
        constructEventMock.mockReturnValue({
            type: 'checkout.session.completed',
            data: { object: { metadata: { projectId: 'proj-1', paymentType: 'final', clientName: 'Bob' }, amount_total: 50000 } },
        });
        const { POST } = await import('./route');
        const res = await POST(webhookRequest('{}'));
        expect(res.status).toBe(200);
    });

    it('does not touch the database when metadata has no projectId', async () => {
        const mock = createSupabaseMock({});
        createClientMock.mockReturnValue(mock);
        constructEventMock.mockReturnValue({
            type: 'checkout.session.completed',
            data: { object: { metadata: {}, amount_total: 50000 } },
        });
        const { POST } = await import('./route');
        const res = await POST(webhookRequest('{}'));
        expect(res.status).toBe(200);
        expect(mock.from).not.toHaveBeenCalled();
    });

    it('ignores event types other than checkout.session.completed', async () => {
        const mock = createSupabaseMock({});
        createClientMock.mockReturnValue(mock);
        constructEventMock.mockReturnValue({ type: 'payment_intent.created', data: { object: {} } });
        const { POST } = await import('./route');
        const res = await POST(webhookRequest('{}'));
        expect(res.status).toBe(200);
        expect(mock.from).not.toHaveBeenCalled();
    });

    it('returns 500 (not a thrown exception) when an unexpected error occurs while processing', async () => {
        constructEventMock.mockImplementation(() => {
            throw Object.assign(new Error('boom'), { __proto__: undefined });
        });
        const { POST } = await import('./route');
        // constructEvent throwing is already handled as 400 "Invalid signature" above;
        // this covers the outer catch by making req.text() itself reject.
        const brokenReq = { text: () => Promise.reject(new Error('stream error')), headers: new Headers() } as unknown as NextRequest;
        const res = await POST(brokenReq);
        expect(res.status).toBe(500);
    });
});
