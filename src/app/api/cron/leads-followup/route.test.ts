import { describe, it, expect, vi, beforeEach } from 'vitest';

const notifyStaleLeadsMock = vi.fn();
vi.mock('@/app/actions/crm', () => ({ notifyStaleLeads: (...args: unknown[]) => notifyStaleLeadsMock(...args) }));

function cronRequest(authed = true) {
    const headers: Record<string, string> = {};
    if (authed) headers.authorization = 'Bearer test-cron-secret';
    return new Request('https://cablecore.es/api/cron/leads-followup', { headers });
}

describe('GET /api/cron/leads-followup', () => {
    beforeEach(() => {
        notifyStaleLeadsMock.mockReset();
    });

    it('rejects requests without an authorization header', async () => {
        const { GET } = await import('./route');
        const res = await GET(cronRequest(false));
        expect(res.status).toBe(401);
        expect(notifyStaleLeadsMock).not.toHaveBeenCalled();
    });

    it('rejects requests with the wrong bearer token', async () => {
        const { GET } = await import('./route');
        const req = new Request('https://cablecore.es/api/cron/leads-followup', { headers: { authorization: 'Bearer wrong-secret' } });
        const res = await GET(req);
        expect(res.status).toBe(401);
        expect(notifyStaleLeadsMock).not.toHaveBeenCalled();
    });

    it('invokes notifyStaleLeads and returns its result on a valid cron call', async () => {
        notifyStaleLeadsMock.mockResolvedValue({ success: true, staleCount: 2, followupCount: 1 });
        const { GET } = await import('./route');
        const res = await GET(cronRequest());
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toEqual({ success: true, staleCount: 2, followupCount: 1 });
        expect(notifyStaleLeadsMock).toHaveBeenCalledTimes(1);
    });

    it('propagates a failure result from notifyStaleLeads as a 200 with success:false', async () => {
        notifyStaleLeadsMock.mockResolvedValue({ success: false, error: 'db down' });
        const { GET } = await import('./route');
        const res = await GET(cronRequest());
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toEqual({ success: false, error: 'db down' });
    });
});
