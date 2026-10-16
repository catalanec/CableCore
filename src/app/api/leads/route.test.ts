import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { resetRateLimits } from '@/lib/rate-limit';
import { createSupabaseMock } from '@/test-utils/supabase-mock';

const createClientMock = vi.fn();
vi.mock('@supabase/supabase-js', () => ({
    createClient: (...args: unknown[]) => createClientMock(...args),
}));

const sendLeadNotificationMock = vi.fn((..._args: unknown[]) => Promise.resolve());
vi.mock('@/lib/email', () => ({ sendLeadNotification: (...args: unknown[]) => sendLeadNotificationMock(...args) }));

const notifyNewLeadMock = vi.fn((..._args: unknown[]) => Promise.resolve());
vi.mock('@/lib/telegram', () => ({ notifyNewLead: (...args: unknown[]) => notifyNewLeadMock(...args) }));

function postRequest(body: unknown) {
    return new NextRequest('https://cablecore.es/api/leads', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });
}

describe('POST /api/leads', () => {
    beforeEach(() => {
        resetRateLimits();
        createClientMock.mockReset();
        sendLeadNotificationMock.mockClear();
        notifyNewLeadMock.mockClear();
        createClientMock.mockReturnValue(createSupabaseMock({ tables: { leads: [{ data: null, error: null }] } }));
    });

    it('pretends success and does nothing when the honeypot field is filled', async () => {
        const { POST } = await import('./route');
        const res = await POST(postRequest({ name: 'Bot', phone: '123', email: 'bot@spam.com', website: 'http://spam.com' }));
        const json = await res.json();
        expect(json).toEqual({ success: true });
        expect(sendLeadNotificationMock).not.toHaveBeenCalled();
        expect(notifyNewLeadMock).not.toHaveBeenCalled();
    });

    it('returns 400 when required fields are missing', async () => {
        const { POST } = await import('./route');
        const res = await POST(postRequest({ name: 'Alice' })); // missing phone + email
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toBe('Missing required fields');
    });

    it('inserts the lead, notifies by email and Telegram, and returns success on valid input', async () => {
        const { POST } = await import('./route');
        const res = await POST(postRequest({ name: 'Alice', phone: '600111222', email: 'alice@example.com', service: 'fibra' }));
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toEqual({ success: true });
        expect(sendLeadNotificationMock).toHaveBeenCalledTimes(1);
        expect(notifyNewLeadMock).toHaveBeenCalledTimes(1);
    });

    it('defaults source to "contact_form" when not provided', async () => {
        const { POST } = await import('./route');
        await POST(postRequest({ name: 'Alice', phone: '600111222', email: 'alice@example.com' }));
        expect(notifyNewLeadMock).toHaveBeenCalledWith(expect.objectContaining({ source: 'contact_form' }));
    });

    it('returns 500 when the Supabase insert fails', async () => {
        createClientMock.mockReturnValue(createSupabaseMock({
            tables: { leads: [{ data: null, error: { message: 'insert failed' } }] },
        }));
        const { POST } = await import('./route');
        const res = await POST(postRequest({ name: 'Alice', phone: '600111222', email: 'alice@example.com' }));
        expect(res.status).toBe(500);
        expect(sendLeadNotificationMock).not.toHaveBeenCalled();
    });

    it('returns 500 when the request body is not valid JSON', async () => {
        const { POST } = await import('./route');
        const badReq = new NextRequest('https://cablecore.es/api/leads', {
            method: 'POST',
            body: '{not-json',
            headers: { 'Content-Type': 'application/json' },
        });
        const res = await POST(badReq);
        expect(res.status).toBe(500);
    });
});

describe('POST /api/leads — abuse limits', () => {
    beforeEach(() => {
        resetRateLimits();
        createClientMock.mockReturnValue(createSupabaseMock({ tables: { leads: [{ data: null, error: null }] } }));
    });

    it('returns 429 after 5 submissions from the same IP', async () => {
        const { POST } = await import('./route');
        const req = () => new NextRequest('https://cablecore.es/api/leads', {
            method: 'POST',
            body: JSON.stringify({ name: 'A', phone: '600000000', email: 'a@b.es' }),
            headers: { 'Content-Type': 'application/json', 'x-real-ip': '9.9.9.9' },
        });
        for (let i = 0; i < 5; i++) expect((await POST(req())).status).not.toBe(429);
        expect((await POST(req())).status).toBe(429);
    });

    it('rejects oversized fields', async () => {
        const { POST } = await import('./route');
        const res = await POST(postRequest({ name: 'A', phone: '1', email: 'a@b.es', message: 'x'.repeat(5001) }));
        expect(res.status).toBe(400);
    });
});
