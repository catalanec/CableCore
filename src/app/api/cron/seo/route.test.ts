import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

function cronRequest(authed = true) {
    const headers: Record<string, string> = {};
    if (authed) headers.authorization = 'Bearer test-cron-secret';
    return new Request('https://cablecore.es/api/cron/seo', { headers });
}

function jsonResponse(body: unknown, ok = true) {
    return Promise.resolve({
        ok,
        text: () => Promise.resolve(JSON.stringify(body)),
        json: () => Promise.resolve(body),
    });
}

describe('GET /api/cron/seo', () => {
    let fetchMock: ReturnType<typeof vi.fn>;
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        process.env = {
            ...ORIGINAL_ENV,
            CRON_SECRET: 'test-cron-secret',
            TELEGRAM_BOT_TOKEN: 'tg-token',
            TELEGRAM_CHAT_ID: 'tg-chat',
            GOOGLE_CLIENT_ID: '',
            GOOGLE_CLIENT_SECRET: '',
            GOOGLE_REFRESH_TOKEN: '',
            GOOGLE_SERVICE_ACCOUNT_KEY: '',
        };
        fetchMock = vi.fn(() => jsonResponse({}));
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        process.env = ORIGINAL_ENV;
        vi.unstubAllGlobals();
    });

    it('rejects requests without a valid cron secret', async () => {
        const { GET } = await import('./route');
        const res = await GET(cronRequest(false));
        expect(res.status).toBe(401);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('returns 500 when Telegram credentials are missing', async () => {
        process.env.TELEGRAM_BOT_TOKEN = '';
        const { GET } = await import('./route');
        const res = await GET(cronRequest());
        expect(res.status).toBe(500);
        expect((await res.json()).error).toBe('Missing Telegram credentials');
    });

    it('falls back to placeholder keyword data (no positions) when no GSC credentials are configured', async () => {
        const { GET } = await import('./route');
        const res = await GET(cronRequest());
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.dataSource).toContain('GOOGLE_REFRESH_TOKEN');
        expect(json.results.every((r: { position: number | null }) => r.position === null)).toBe(true);
        expect(json.top10).toBe(0);
        // Still sends the Telegram report even with placeholder data
        expect(fetchMock.mock.calls.some(([u]) => (u as string).includes('api.telegram.org'))).toBe(true);
    });

    it('queries GSC via refresh token, checks page indexing, and reports real positions', async () => {
        process.env.GOOGLE_CLIENT_ID = 'client-id';
        process.env.GOOGLE_CLIENT_SECRET = 'client-secret';
        process.env.GOOGLE_REFRESH_TOKEN = 'refresh-token';

        fetchMock.mockImplementation((url: string) => {
            if (url.includes('oauth2.googleapis.com/token')) return jsonResponse({ access_token: 'gsc-token' });
            if (url.includes('searchAnalytics/query')) {
                return jsonResponse({
                    rows: [
                        { keys: ['cableado estructurado'], position: 3.4, clicks: 12, impressions: 300, ctr: 0.04 },
                    ],
                });
            }
            if (url.includes('urlInspection/index:inspect')) {
                return jsonResponse({ inspectionResult: { indexStatusResult: { verdict: 'PASS', coverageState: 'Submitted and indexed', lastCrawlTime: '2026-01-01T00:00:00Z' } } });
            }
            if (url.includes('api.telegram.org')) return jsonResponse({ ok: true });
            return jsonResponse({});
        });

        const { GET } = await import('./route');
        const res = await GET(cronRequest());
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.dataSource).toContain('datos reales');
        const rankedKeyword = json.results.find((r: { keyword: string }) => r.keyword === 'cableado estructurado');
        expect(rankedKeyword.position).toBe(3);
        expect(json.top10).toBeGreaterThanOrEqual(1);

        const telegramCall = fetchMock.mock.calls.find(([u]) => (u as string).includes('api.telegram.org'));
        expect(telegramCall).toBeDefined();
        expect(JSON.parse(telegramCall![1].body).text).toContain('SEO diario CableCore');
    });

    it('continues without indexing data when the URL Inspection API call fails (silently skipped)', async () => {
        process.env.GOOGLE_CLIENT_ID = 'client-id';
        process.env.GOOGLE_CLIENT_SECRET = 'client-secret';
        process.env.GOOGLE_REFRESH_TOKEN = 'refresh-token';

        fetchMock.mockImplementation((url: string) => {
            if (url.includes('oauth2.googleapis.com/token')) return jsonResponse({ access_token: 'gsc-token' });
            if (url.includes('searchAnalytics/query')) return jsonResponse({ rows: [] });
            if (url.includes('urlInspection/index:inspect')) return Promise.reject(new Error('network down'));
            return jsonResponse({ ok: true });
        });

        const { GET } = await import('./route');
        const res = await GET(cronRequest());
        expect(res.status).toBe(200);
    });

    it('returns 500 and notifies Telegram with the error when the refresh-token exchange fails', async () => {
        process.env.GOOGLE_CLIENT_ID = 'client-id';
        process.env.GOOGLE_CLIENT_SECRET = 'client-secret';
        process.env.GOOGLE_REFRESH_TOKEN = 'refresh-token';

        fetchMock.mockImplementation((url: string) => {
            if (url.includes('oauth2.googleapis.com/token')) return jsonResponse({ error: 'invalid_grant' });
            return jsonResponse({ ok: true });
        });

        const { GET } = await import('./route');
        const res = await GET(cronRequest());
        expect(res.status).toBe(500);
        const json = await res.json();
        expect(json.error).toContain('Refresh token error');

        const telegramCall = fetchMock.mock.calls.find(([u]) => (u as string).includes('api.telegram.org'));
        expect(telegramCall).toBeDefined();
        expect(JSON.parse(telegramCall![1].body).text).toContain('SEO cron error');
    });
});
