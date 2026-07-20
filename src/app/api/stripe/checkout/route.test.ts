import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { createSupabaseMock } from '@/test-utils/supabase-mock';

const createCheckoutSessionMock = vi.fn((..._args: unknown[]) => Promise.resolve({ url: 'https://checkout.stripe.com/session', id: 'cs_123' }));
vi.mock('stripe', () => ({
    default: class StripeMock {
        checkout = { sessions: { create: createCheckoutSessionMock } };
    },
}));

const createClientMock = vi.fn();
vi.mock('@supabase/supabase-js', () => ({
    createClient: (...args: unknown[]) => createClientMock(...args),
}));

function basicAuthHeader(user: string, pass: string) {
    return `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
}

function checkoutRequest(body: unknown, opts: { authed?: boolean; origin?: string } = {}) {
    const { authed = true, origin = 'https://cablecore.es' } = opts;
    const headers: Record<string, string> = { 'Content-Type': 'application/json', origin };
    if (authed) headers.authorization = basicAuthHeader('test-admin', 'test-password');
    return new NextRequest('https://cablecore.es/api/stripe/checkout', { method: 'POST', body: JSON.stringify(body), headers });
}

describe('POST /api/stripe/checkout', () => {
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        process.env = { ...ORIGINAL_ENV, STRIPE_SECRET_KEY: 'sk_test_123', ADMIN_USER: 'test-admin', ADMIN_PASSWORD: 'test-password' };
        createCheckoutSessionMock.mockClear();
        createClientMock.mockReset();
    });

    afterEach(() => {
        process.env = ORIGINAL_ENV;
    });

    it('rejects unauthenticated requests before touching Stripe', async () => {
        const { POST } = await import('./route');
        const res = await POST(checkoutRequest({ amount: 100 }, { authed: false }));
        expect(res.status).toBe(401);
        expect(createCheckoutSessionMock).not.toHaveBeenCalled();
    });

    it('rejects a zero amount', async () => {
        const { POST } = await import('./route');
        const res = await POST(checkoutRequest({ amount: 0 }));
        expect(res.status).toBe(400);
    });

    it('rejects a negative amount', async () => {
        const { POST } = await import('./route');
        const res = await POST(checkoutRequest({ amount: -50 }));
        expect(res.status).toBe(400);
    });

    it('rejects an amount that does not match 50% of the stored project total (tamper protection)', async () => {
        createClientMock.mockReturnValue(createSupabaseMock({
            tables: { projects: [{ data: { total_amount: 1000 }, error: null }] },
        }));
        const { POST } = await import('./route');
        // expected = 500 (50% of 1000); client sends 999 which is far outside tolerance
        const res = await POST(checkoutRequest({ amount: 999, projectId: 'proj-1' }));
        expect(res.status).toBe(400);
        expect(createCheckoutSessionMock).not.toHaveBeenCalled();
    });

    it('accepts an amount within tolerance of 50% of the project total', async () => {
        createClientMock.mockReturnValue(createSupabaseMock({
            tables: { projects: [{ data: { total_amount: 1000 }, error: null }] },
        }));
        const { POST } = await import('./route');
        const res = await POST(checkoutRequest({ amount: 500, projectId: 'proj-1', clientName: 'Bob' }));
        expect(res.status).toBe(200);
        expect(createCheckoutSessionMock).toHaveBeenCalledTimes(1);
    });

    it('returns 404 when projectId is supplied but no matching project exists', async () => {
        createClientMock.mockReturnValue(createSupabaseMock({ tables: { projects: [{ data: null, error: null }] } }));
        const { POST } = await import('./route');
        const res = await POST(checkoutRequest({ amount: 500, projectId: 'missing' }));
        expect(res.status).toBe(404);
    });

    it('falls back to the safe default origin when Origin header is not in the allowlist', async () => {
        const { POST } = await import('./route');
        const res = await POST(checkoutRequest({ amount: 500 }, { origin: 'https://evil.example.com' }));
        expect(res.status).toBe(200);
        const call = createCheckoutSessionMock.mock.calls[0][0] as { success_url: string };
        expect(call.success_url).toContain('https://cablecore.es');
        expect(call.success_url).not.toContain('evil.example.com');
    });

    it('returns 500 when Stripe is not configured', async () => {
        process.env.STRIPE_SECRET_KEY = '';
        const { POST } = await import('./route');
        const res = await POST(checkoutRequest({ amount: 500 }));
        expect(res.status).toBe(500);
    });

    it('returns 500 with the error message when Stripe session creation throws', async () => {
        createCheckoutSessionMock.mockRejectedValueOnce(new Error('stripe outage'));
        const { POST } = await import('./route');
        const res = await POST(checkoutRequest({ amount: 500 }));
        expect(res.status).toBe(500);
        expect((await res.json()).error).toBe('stripe outage');
    });
});
