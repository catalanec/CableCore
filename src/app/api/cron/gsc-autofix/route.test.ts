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
// The cron now works thinnest-first, so word counts — not array order — decide
// the sequence. They ascend here so the order matches the mocked responses
// below; article-long is over the threshold and is filtered out before any
// GSC call is made.
const BLOG_DATA_FIXTURE = [
    { slug: 'article-indexed', es: { title: 'Indexed', content: [{ type: 'p', text: 'w '.repeat(10) }] } },
    { slug: 'article-long', es: { title: 'Long', content: [{ type: 'p', text: 'w '.repeat(1300) }] } },
    { slug: 'article-groq-fail', es: { title: 'Groq Fail', content: [{ type: 'p', text: 'w '.repeat(20) }] } },
    { slug: 'article-fixed', es: { title: 'Will Be Fixed', content: [{ type: 'p', text: 'w '.repeat(30) }] } },
    { slug: 'article-throws', es: { title: 'Inspect Throws', content: [{ type: 'p', text: 'w '.repeat(40) }] } },
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

    it('derives the pages to check from every slug x locale in blog-data.json and classifies each correctly: skip (indexed), error (Groq failed), fixed (expanded), error (inspect threw) — committing once', async () => {
        const responses: Array<() => Promise<unknown>> = [
            () => jsonResponse({ access_token: 'gsc-token' }), // 1. OAuth token
            () => jsonResponse({ sha: 'sha-1', content: Buffer.from(JSON.stringify(BLOG_DATA_FIXTURE)).toString('base64') }), // 2. GitHub GET
            () => jsonResponse({ inspectionResult: { indexStatusResult: { verdict: 'PASS', coverageState: 'Submitted and indexed' } } }), // 3. article-indexed -> skip
            () => jsonResponse({ inspectionResult: { indexStatusResult: { verdict: 'FAIL', coverageState: 'Discovered - currently not indexed' } } }), // 5. article-groq-fail inspect
            () => jsonResponse({ error: { message: 'quota exceeded' } }, false), // 6. article-groq-fail groq call -> fails
            () => jsonResponse({ inspectionResult: { indexStatusResult: { verdict: 'FAIL', coverageState: 'Discovered - currently not indexed' } } }), // 7. article-fixed inspect
            () => jsonResponse({ choices: [{ message: { content: JSON.stringify([{ type: 'p', text: 'expanded' }, { type: 'h2', text: 'Más info' }]) } }] }), // 8. article-fixed groq call -> succeeds
            () => Promise.reject(new Error('ECONNRESET')), // 9. article-throws inspect -> throws
            () => jsonResponse({ ok: true }), // 10. GitHub PUT (commit)
            () => jsonResponse({ ok: true }), // 11. Telegram report
        ];
        fetchMock.mockImplementation(() => (responses.shift() ?? (() => jsonResponse({})))());

        const { GET } = await import('./route');
        const res = await GET(cronRequest());
        expect(res.status).toBe(200);
        const json = await res.json();

        // article-long (~1300 words) is now filtered out by word count before
        // any GSC call, so it neither costs a round-trip nor shows as skipped.
        expect(json.skipped).toHaveLength(1);
        expect(json.skipped.join(' ')).toContain('article-indexed');
        expect(fetchMock.mock.calls.filter(([u]) => u.includes('urlInspection')).length).toBe(4);
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
        expect(fixedArticle.es.content).toEqual([{ type: 'p', text: 'expanded' }, { type: 'h2', text: 'Más info' }]);
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

    it('caps the run at five articles and takes the thinnest first, so each run advances the queue', async () => {
        // Twelve thin articles, deliberately shuffled by length: the run must
        // pick the five shortest, in ascending order, and leave the rest.
        const lengths = [90, 40, 700, 10, 300, 60, 20, 500, 80, 30, 200, 50];
        const fixture = lengths.map((n, i) => ({
            slug: `a-${i}`,
            es: { title: `A${i}`, content: [{ type: 'p', text: 'w '.repeat(n) }] },
        }));

        fetchMock.mockImplementation((url: string) => {
            if (url.includes('oauth2')) return jsonResponse({ access_token: 't' });
            if (url.includes('api.github.com')) {
                return jsonResponse({ sha: 's', content: Buffer.from(JSON.stringify(fixture)).toString('base64') });
            }
            if (url.includes('urlInspection')) {
                return jsonResponse({ inspectionResult: { indexStatusResult: { verdict: 'FAIL', coverageState: 'Crawled - currently not indexed' } } });
            }
            if (url.includes('groq')) {
                return jsonResponse({ choices: [{ message: { content: JSON.stringify([{ type: 'p', text: 'expanded' }]) } }] });
            }
            return jsonResponse({ ok: true });
        });

        const { GET } = await import('./route');
        const json = await (await GET(cronRequest())).json();

        expect(json.fixed).toHaveLength(5);
        // ascending by word count: 10, 20, 30, 40, 50 -> a-3, a-6, a-9, a-1, a-11
        expect(json.fixed.map((f: string) => f.split('/').pop()!.split(' ')[0]))
            .toEqual(['a-3', 'a-6', 'a-9', 'a-1', 'a-11']);
        // and only those five cost a GSC round-trip
        expect(fetchMock.mock.calls.filter(([u]: any[]) => u.includes('urlInspection'))).toHaveLength(5);
    });

    it('commits nothing and reports cleanly when every article is already long enough', async () => {
        const fixture = [{ slug: 'fat', es: { title: 'Fat', content: [{ type: 'p', text: 'w '.repeat(1500) }] } }];
        fetchMock.mockImplementation((url: string) => {
            if (url.includes('oauth2')) return jsonResponse({ access_token: 't' });
            if (url.includes('api.github.com')) {
                return jsonResponse({ sha: 's', content: Buffer.from(JSON.stringify(fixture)).toString('base64') });
            }
            return jsonResponse({ ok: true });
        });

        const { GET } = await import('./route');
        const json = await (await GET(cronRequest())).json();

        expect(json.fixed).toEqual([]);
        expect(json.committed).toBe(false);
        expect(fetchMock.mock.calls.filter(([u]: any[]) => u.includes('urlInspection'))).toHaveLength(0);
    });
});
