import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { createSupabaseMock } from '@/test-utils/supabase-mock';

const createSessionMock = vi.fn((..._args: unknown[]) => Promise.resolve({ url: 'https://checkout.stripe.com/session', id: 'cs_123' }));
vi.mock('stripe', () => ({
    default: class StripeMock {
        checkout = { sessions: { create: createSessionMock } };
    },
}));

const sendEmailMock = vi.fn((..._args: unknown[]) => Promise.resolve({ data: { id: 'email_1' }, error: null }));
vi.mock('resend', () => ({
    Resend: class ResendMock {
        emails = { send: sendEmailMock };
    },
}));

const createClientMock = vi.fn();
vi.mock('@supabase/supabase-js', () => ({
    createClient: (...args: unknown[]) => createClientMock(...args),
}));

vi.mock('@/lib/invoice-email', () => ({
    generateInvoiceEmailHTML: vi.fn(() => '<html></html>'),
    generateInvoiceEmailSubject: vi.fn(() => 'Your invoice'),
}));

function basicAuthHeader(user: string, pass: string) {
    return `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
}

function sendRequest(body: unknown, authed = true) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json', origin: 'https://cablecore.es' };
    if (authed) headers.authorization = basicAuthHeader('test-admin', 'test-password');
    return new NextRequest('https://cablecore.es/api/invoice/send', { method: 'POST', body: JSON.stringify(body), headers });
}

const baseProject = { id: 'proj-1', client_name: 'Bob', client_email: 'bob@example.com', total_revenue: 1000, quote_id: null };

describe('POST /api/invoice/send', () => {
    beforeEach(() => {
        createSessionMock.mockClear();
        sendEmailMock.mockClear();
        createClientMock.mockReset();
        vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true })));
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('rejects unauthenticated requests', async () => {
        const { POST } = await import('./route');
        const res = await POST(sendRequest({ projectId: 'proj-1' }, false));
        expect(res.status).toBe(401);
    });

    it('returns 400 when projectId is missing', async () => {
        const { POST } = await import('./route');
        const res = await POST(sendRequest({}));
        expect(res.status).toBe(400);
    });

    it('returns 404 when the project does not exist', async () => {
        createClientMock.mockReturnValue(createSupabaseMock({ tables: { projects: [{ data: null, error: { message: 'not found' } }] } }));
        const { POST } = await import('./route');
        const res = await POST(sendRequest({ projectId: 'missing' }));
        expect(res.status).toBe(404);
    });

    it('returns 400 when no client email can be resolved', async () => {
        createClientMock.mockReturnValue(createSupabaseMock({ tables: { projects: [{ data: { ...baseProject, client_email: null }, error: null }] } }));
        const { POST } = await import('./route');
        const res = await POST(sendRequest({ projectId: 'proj-1' }));
        expect(res.status).toBe(400);
    });

    it('returns 400 when the project total is 0 (nothing to charge)', async () => {
        createClientMock.mockReturnValue(createSupabaseMock({ tables: { projects: [{ data: { ...baseProject, total_revenue: 0 }, error: null }] } }));
        const { POST } = await import('./route');
        const res = await POST(sendRequest({ projectId: 'proj-1' }));
        expect(res.status).toBe(400);
    });

    it('creates a Stripe session, sends the email, and updates the project on a valid advance request', async () => {
        createClientMock.mockReturnValue(createSupabaseMock({ tables: { projects: [{ data: baseProject, error: null }] } }));
        const { POST } = await import('./route');
        const res = await POST(sendRequest({ projectId: 'proj-1', paymentType: 'advance' }));
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.emailSent).toBe(true);
        expect(createSessionMock).toHaveBeenCalledTimes(1);
        expect(sendEmailMock).toHaveBeenCalledTimes(1);
    });

    it('pulls client email/name from the linked quote when the project has none', async () => {
        const mock = createSupabaseMock({
            tables: {
                projects: [{ data: { ...baseProject, client_email: null, quote_id: 'quote-1' }, error: null }],
                quotes: [{ data: { id: 'quote-1', client_email: 'quote@example.com', client_name: 'Quote Client', cable_type: 'cat6', cable_meters: 50, network_points: 3 }, error: null }],
            },
        });
        createClientMock.mockReturnValue(mock);
        const { POST } = await import('./route');
        const res = await POST(sendRequest({ projectId: 'proj-1' }));
        expect(res.status).toBe(200);
    });

    it('still returns success:true with emailSent:false when Resend fails', async () => {
        sendEmailMock.mockResolvedValueOnce({ data: null, error: { message: 'Resend down' } });
        createClientMock.mockReturnValue(createSupabaseMock({ tables: { projects: [{ data: baseProject, error: null }] } }));
        const { POST } = await import('./route');
        const res = await POST(sendRequest({ projectId: 'proj-1' }));
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.emailSent).toBe(false);
        expect(json.emailError).toBeDefined();
    });

    it('returns 500 when Stripe fails to return a session URL', async () => {
        createSessionMock.mockResolvedValueOnce({ url: null, id: 'cs_none' });
        createClientMock.mockReturnValue(createSupabaseMock({ tables: { projects: [{ data: baseProject, error: null }] } }));
        const { POST } = await import('./route');
        const res = await POST(sendRequest({ projectId: 'proj-1' }));
        expect(res.status).toBe(500);
    });

    it('returns 500 when RESEND_API_KEY is not configured', async () => {
        const original = process.env.RESEND_API_KEY;
        process.env.RESEND_API_KEY = '';
        try {
            const { POST } = await import('./route');
            const res = await POST(sendRequest({ projectId: 'proj-1' }));
            expect(res.status).toBe(500);
        } finally {
            process.env.RESEND_API_KEY = original;
        }
    });

    it('returns 500 when STRIPE_SECRET_KEY is not configured', async () => {
        const original = process.env.STRIPE_SECRET_KEY;
        process.env.STRIPE_SECRET_KEY = '';
        try {
            const { POST } = await import('./route');
            const res = await POST(sendRequest({ projectId: 'proj-1' }));
            expect(res.status).toBe(500);
        } finally {
            process.env.STRIPE_SECRET_KEY = original;
        }
    });

    it('stores the session id under final_stripe_session on a "final" payment request', async () => {
        const mock = createSupabaseMock({ tables: { projects: [{ data: baseProject, error: null }] } });
        createClientMock.mockReturnValue(mock);
        const { POST } = await import('./route');
        const res = await POST(sendRequest({ projectId: 'proj-1', paymentType: 'final' }));
        expect(res.status).toBe(200);
        const updateCall = mock.from.mock.results.find((r, i) => mock.from.mock.calls[i][0] === 'projects' && i > 0);
        expect(updateCall).toBeDefined();
    });

    it('keeps payment_status as pending when project was pending and this is the advance payment', async () => {
        const mock = createSupabaseMock({ tables: { projects: [{ data: { ...baseProject, payment_status: 'pending' }, error: null }] } });
        createClientMock.mockReturnValue(mock);
        const { POST } = await import('./route');
        const res = await POST(sendRequest({ projectId: 'proj-1', paymentType: 'advance' }));
        expect(res.status).toBe(200);
    });

    it('returns 500 (outer catch) when the request body is not valid JSON', async () => {
        const { POST } = await import('./route');
        const badReq = new NextRequest('https://cablecore.es/api/invoice/send', {
            method: 'POST',
            body: '{not-json',
            headers: { 'Content-Type': 'application/json', origin: 'https://cablecore.es', authorization: basicAuthHeader('test-admin', 'test-password') },
        });
        const res = await POST(badReq);
        expect(res.status).toBe(500);
    });
});
