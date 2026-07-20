import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { createSupabaseMock } from '@/test-utils/supabase-mock';

const createClientMock = vi.fn();
vi.mock('@supabase/supabase-js', () => ({
    createClient: (...args: unknown[]) => createClientMock(...args),
}));

const sendQuoteNotificationMock = vi.fn((..._args: unknown[]) => Promise.resolve());
vi.mock('@/lib/email', () => ({ sendQuoteNotification: (...args: unknown[]) => sendQuoteNotificationMock(...args) }));

const notifyNewQuoteMock = vi.fn((..._args: unknown[]) => Promise.resolve());
vi.mock('@/lib/telegram', () => ({ notifyNewQuote: (...args: unknown[]) => notifyNewQuoteMock(...args) }));

function postRequest(body: unknown) {
    return new NextRequest('https://cablecore.es/api/quotes', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });
}

const validQuote = {
    client_name: 'Alice', client_phone: '600111222', client_email: 'alice@example.com',
    cableType: 'cat6', points: 5, total: 1200,
};

describe('POST /api/quotes', () => {
    beforeEach(() => {
        createClientMock.mockReset();
        notifyNewQuoteMock.mockClear();
        sendQuoteNotificationMock.mockClear();
        createClientMock.mockReturnValue(createSupabaseMock({
            tables: { quotes: [{ data: null, error: null }], leads: [{ data: null, error: null }] },
        }));
    });

    it('pretends success and skips DB/notifications when the honeypot field is filled', async () => {
        const { POST } = await import('./route');
        const res = await POST(postRequest({ ...validQuote, website: 'http://spam.com' }));
        const json = await res.json();
        expect(json).toEqual({ success: true });
        expect(notifyNewQuoteMock).not.toHaveBeenCalled();
    });

    it('returns 400 when required client fields are missing', async () => {
        const { POST } = await import('./route');
        const res = await POST(postRequest({ client_name: 'Alice' }));
        expect(res.status).toBe(400);
    });

    it('saves the quote and lead, notifies Telegram, and returns a generated quote number', async () => {
        const { POST } = await import('./route');
        const res = await POST(postRequest(validQuote));
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.quoteNumber).toMatch(/^CC-\d{8}-[A-Z0-9]{6}$/);
        expect(notifyNewQuoteMock).toHaveBeenCalledTimes(1);
    });

    it('returns 500 and skips notifications when the quote insert fails', async () => {
        createClientMock.mockReturnValue(createSupabaseMock({
            tables: { quotes: [{ data: null, error: { message: 'insert failed' } }] },
        }));
        const { POST } = await import('./route');
        const res = await POST(postRequest(validQuote));
        expect(res.status).toBe(500);
        expect(notifyNewQuoteMock).not.toHaveBeenCalled();
    });

    it('still returns success when the lead insert fails after the quote succeeds (logged, not fatal)', async () => {
        createClientMock.mockReturnValue(createSupabaseMock({
            tables: {
                quotes: [{ data: null, error: null }],
                leads: [{ data: null, error: { message: 'lead insert failed' } }],
            },
        }));
        const { POST } = await import('./route');
        const res = await POST(postRequest(validQuote));
        expect(res.status).toBe(200);
        expect(notifyNewQuoteMock).toHaveBeenCalledTimes(1);
    });

    it('returns 500 when the request body is not valid JSON', async () => {
        const { POST } = await import('./route');
        const badReq = new NextRequest('https://cablecore.es/api/quotes', {
            method: 'POST',
            body: '{not-json',
            headers: { 'Content-Type': 'application/json' },
        });
        const res = await POST(badReq);
        expect(res.status).toBe(500);
    });
});
