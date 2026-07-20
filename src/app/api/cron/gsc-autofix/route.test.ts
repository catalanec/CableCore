import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

function cronRequest(authed = true) {
    const headers: Record<string, string> = {};
    if (authed) headers.authorization = 'Bearer test-cron-secret';
    return new Request('https://cablecore.es/api/cron/gsc-autofix', { headers });
}

function jsonResponse(body: unknown, ok = true) {
    return Promise.resolve({
        ok,
        text: () => Promise.resolve(JSON.stringify(body)),
        json: () => Promise.resolve(body),
    });
}

// Real blog-data.json shape: one object per slug, with per-locale nested
// { title, content: [{type, text}|{type, items}] } — NOT a flat
// { slug, locale, blocks } shape. Each fixture article below only populates
// 'es' so the cron's keyPages list (derived from article x locale) is exactly
// 5 entries, in array order, matching the 5 scenarios below.
const BLOG_DATA_FIXTURE = [
    { slug: 'article-indexed', es: { title: 'Indexed', content: [{ type: 'p', text: 'already indexed, nothing to do' }] } },
    // ~1300 words -> "content ok" skip branch even though not (yet) indexed.
    { slug: 'article-long', es: { title: 'Long', content: [{ type: 'p', text: 'word '.repeat(1300) }] } },
    { slug: 'article-groq-fail', es: { title: 'Groq Fail', content: [{ type: 'p', text: 'short' }] } },
    { slug: 'article-fixed', es: { title: 'Will Be Fixed', content: [{ type: 'p', text: 'short' }] } },
    { slug: 'article-throws', es: { title: 'Inspect Throws', content: [{ type: 'p', text: 'short' }] } },
];

describe('GET /api/cron/gsc-autofix', () => {
    let fetchMock: ReturnType<typeof vi.fn>;
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        process.env = {
            ...ORIGINAL_ENV,
            CRON_SECRET: 'test-cron-secret',
            GOOGLE_CLIENT_ID: 'client-id',
            GOOGLE_CLIENT_SECRET: 'client-secret',
            GOOGLE_REFRESH_TOKEN: 'refresh-token',
            GROQ_API_KEY: 'groq-key',
            GITHUB_TOKEN: 'gh-token',
            TELEGRAM_BOT_TOKEN: 'tg-token',
            TELEGRAM_CHAT_ID: 'tg-chat',
        };
        fetchMock = vi.fn();
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

    it('returns 500 when Google OAuth env vars are missing', async () => {
        process.env.GOOGLE_REFRESH_TOKEN = '';
        const { GET } = await import('./route');
        const res = await GET(cronRequest());
        expect(res.status).toBe(500);
        expect((await res.json()).error).toContain('GOOGLE_CLIENT_ID');
    });

    it('returns 500 when GROQ_API_KEY or GITHUB_TOKEN is missing', async () => {
        process.env.GITHUB_TOKEN = '';
        const { GET } = await import('./route');
        const res = await GET(cronRequest());
        expect(res.status).toBe(500);
        expect((await res.json()).error).toContain('GROQ_API_KEY');
    });

    it('returns 500 and notifies Telegram when the OAuth token exchange fails', async () => {
        fetchMock.mockImplementation((url: string) => {
            if (url.includes('oauth2.googleapis.com/token')) return jsonResponse({ error: 'invalid_grant' });
            return jsonResponse({ ok: true });
        });
        const { GET } = await import('./route');
        const res = await GET(cronRequest());
        expect(res.status).toBe(500);
        const json = await res.json();
        expect(json.error).toContain('GSC token error');
        const telegramCall = fetchMock.mock.calls.find(([u]) => u.includes('api.telegram.org'));
        expect(telegramCall).toBeDefined();
        expect(JSON.parse(telegramCall![1].body).text).toContain('GSC Auto-Fix crash');
    });

    it('derives the pages to check from every slug x locale in blog-data.json and classifies each correctly: skip (indexed), skip (content ok), error (Groq failed), fixed (expanded), error (inspect threw) — committing once', async () => {
        const responses: Array<() => Promise<unknown>> = [
            () => jsonResponse({ access_token: 'gsc-token' }), // 1. OAuth token
            () => jsonResponse({ sha: 'sha-1', content: Buffer.from(JSON.stringify(BLOG_DATA_FIXTURE)).toString('base64') }), // 2. GitHub GET
            () => jsonResponse({ inspectionResult: { indexStatusResult: { verdict: 'PASS', coverageState: 'Submitted and indexed' } } }), // 3. article-indexed -> skip
            () => jsonResponse({ inspectionResult: { indexStatusResult: { verdict: 'FAIL', coverageState: 'Crawled - currently not indexed' } } }), // 4. article-long -> needs fix but content ok -> skip
            () => jsonResponse({ inspectionResult: { indexStatusResult: { verdict: 'FAIL', coverageState: 'Discovered - currently not indexed' } } }), // 5. article-groq-fail inspect
            () => jsonResponse({ error: { message: 'quota exceeded' } }, false), // 6. article-groq-fail groq call -> fails
            () => jsonResponse({ inspectionResult: { indexStatusResult: { verdict: 'FAIL', coverageState: 'Discovered - currently not indexed' } } }), // 7. article-fixed inspect
            () => jsonResponse({ choices: [{ message: { content: JSON.stringify([{ type: 'p', text: 'short' }, { type: 'h2', text: 'Más info' }]) } }] }), // 8. article-fixed groq call -> succeeds
            () => Promise.reject(new Error('ECONNRESET')), // 9. article-throws inspect -> throws
            () => jsonResponse({ ok: true }), // 10. GitHub PUT (commit)
            () => jsonResponse({ ok: true }), // 11. Telegram report
        ];
        fetchMock.mockImplementation(() => (responses.shift() ?? (() => jsonResponse({})))());

        const { GET } = await import('./route');
        const res = await GET(cronRequest());
        expect(res.status).toBe(200);
        const json = await res.json();

        expect(json.skipped).toHaveLength(2);
        expect(json.errors).toHaveLength(2);
        expect(json.fixed).toHaveLength(1);
        expect(json.committed).toBe(true);

        expect(json.errors.join(' ')).toContain('Groq failed to generate content');
        expect(json.errors.join(' ')).toContain('ECONNRESET');
        expect(json.fixed[0]).toContain('article-fixed');

        const githubPutCall = fetchMock.mock.calls.find(([u, opts]) => u.includes('api.github.com') && opts?.method === 'PUT');
        expect(githubPutCall).toBeDefined();
        const putBody = JSON.parse(githubPutCall![1].body);
        expect(putBody.message).toContain('1 fixed by gsc-autofix cron');

        // The committed article's es.content should be the Groq-expanded array,
        // written back into the nested locale object (not a stray top-level
        // "blocks" field a previous version of this cron produced).
        const committedBlogData = JSON.parse(Buffer.from(putBody.content, 'base64').toString('utf-8'));
        const fixedArticle = committedBlogData.find((a: { slug: string }) => a.slug === 'article-fixed');
        expect(fixedArticle.es.content).toEqual([{ type: 'p', text: 'short' }, { type: 'h2', text: 'Más info' }]);
        expect(fixedArticle.blocks).toBeUndefined();

        const telegramCall = fetchMock.mock.calls.find(([u]) => u.includes('api.telegram.org'));
        expect(telegramCall).toBeDefined();
    });

    it('skips the Telegram report step (but still succeeds) when Telegram env vars are not configured', async () => {
        process.env.TELEGRAM_BOT_TOKEN = '';
        fetchMock.mockImplementation((url: string) => {
            if (url.includes('oauth2.googleapis.com/token')) return jsonResponse({ access_token: 'gsc-token' });
            if (url.includes('api.github.com')) return jsonResponse({ sha: 'sha-1', content: Buffer.from(JSON.stringify(BLOG_DATA_FIXTURE)).toString('base64') });
            if (url.includes('urlInspection')) return jsonResponse({ inspectionResult: { indexStatusResult: { verdict: 'PASS', coverageState: 'Submitted and indexed' } } });
            return jsonResponse({});
        });
        const { GET } = await import('./route');
        const res = await GET(cronRequest());
        expect(res.status).toBe(200);
        expect(fetchMock.mock.calls.some(([u]) => (u as string).includes('api.telegram.org'))).toBe(false);
    });
});
