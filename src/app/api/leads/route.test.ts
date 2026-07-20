import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
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
