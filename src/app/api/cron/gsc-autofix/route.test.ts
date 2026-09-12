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
            // Real runs space Groq calls by 20s to stay inside the per-minute
            // token budget; tests must not wait that out.
            GROQ_SPACING_MS: '0',
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

    it('derives the pages to check from every slug x locale in blog-data.json and classifies each correctly: fixed (indexed but thin), error (Groq failed), fixed (expanded), error (inspect threw) — committing once', async () => {
        const responses: Array<() => Promise<unknown>> = [
            () => jsonResponse({ access_token: 'gsc-token' }), // 1. OAuth token
            () => jsonResponse({ sha: 'sha-1', content: Buffer.from(JSON.stringify(BLOG_DATA_FIXTURE)).toString('base64') }), // 2. GitHub GET
            () => jsonResponse({ inspectionResult: { indexStatusResult: { verdict: 'PASS', coverageState: 'Submitted and indexed' } } }), // 3. article-indexed inspect — PASS no longer skips
            () => jsonResponse({ choices: [{ message: { content: JSON.stringify([{ type: 'p', text: 'también expandido' }]) } }] }), // 4. article-indexed groq call
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

        // article-long (~1300 words) is still filtered out by word count before
        // any GSC call, so it neither costs a round-trip nor shows as skipped.
        // article-indexed is PASS and thin, so it is expanded like the rest.
        expect(json.skipped).toHaveLength(0);
        expect(fetchMock.mock.calls.filter(([u]) => u.includes('urlInspection')).length).toBe(4);
        expect(json.errors).toHaveLength(2);
        expect(json.fixed).toHaveLength(2);
        expect(json.fixed.join(' ')).toContain('article-indexed');
        expect(json.committed).toBe(true);

        expect(json.errors.join(' ')).toContain('quota exceeded');
        expect(json.errors.join(' ')).toContain('ECONNRESET');
        // thinnest first: article-indexed (10w) precedes article-fixed (30w)
        expect(json.fixed.join(' ')).toContain('article-fixed');
        expect(json.fixed[0]).toContain('article-indexed');

        const githubPutCall = fetchMock.mock.calls.find(([u, opts]) => u.includes('api.github.com') && opts?.method === 'PUT');
        expect(githubPutCall).toBeDefined();
        const putBody = JSON.parse(githubPutCall![1].body);
        expect(putBody.message).toContain('2 fixed by gsc-autofix cron');

        // The committed article's es.content keeps its original blocks with the
        // new ones appended, written back into the nested locale object (not a
        // stray top-level "blocks" field a previous version of this cron produced).
        const committedBlogData = JSON.parse(Buffer.from(putBody.content, 'base64').toString('utf-8'));
        const fixedArticle = committedBlogData.find((a: { slug: string }) => a.slug === 'article-fixed');
        const original = BLOG_DATA_FIXTURE.find(a => a.slug === 'article-fixed')!.es.content;
        expect(fixedArticle.es.content.slice(0, original.length)).toEqual(original);
        expect(fixedArticle.es.content.slice(original.length))
            .toEqual([{ type: 'p', text: 'expanded' }, { type: 'h2', text: 'Más info' }]);
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

    it('carries the reason Groq refused into the report, not just "failed"', async () => {
        // The cron ran daily against a model Groq had retired. It reported
        // "Groq failed to generate content" and returned 200, so the real cause
        // — model_not_found — lived only in Vercel logs, which are kept an hour.
        fetchMock.mockImplementation((url: string) => {
            if (url.includes('oauth2.googleapis.com')) return jsonResponse({ access_token: 'tok' });
            if (url.includes('githubusercontent') || url.includes('api.github.com/repos'))
                return jsonResponse({ content: Buffer.from(JSON.stringify(BLOG_DATA_FIXTURE)).toString('base64'), sha: 'sha1' });
            if (url.includes('searchconsole.googleapis.com'))
                return jsonResponse({ inspectionResult: { indexStatusResult: { verdict: 'NEUTRAL' } } });
            if (url.includes('api.groq.com'))
                return Promise.resolve({
                    ok: false,
                    status: 404,
                    text: () => Promise.resolve(JSON.stringify({
                        error: { message: 'The model `some-model` does not exist or you do not have access to it', code: 'model_not_found' },
                    })),
                    json: () => Promise.resolve({}),
                });
            return jsonResponse({ ok: true });
        });

        const { GET } = await import('./route');
        const res = await GET(cronRequest());
        const json = await res.json();

        expect(json.errors.length).toBeGreaterThan(0);
        expect(json.errors.join(' ')).toContain('model_not_found');

        const telegram = fetchMock.mock.calls.find(c => String(c[0]).includes('api.telegram.org'));
        expect(telegram, 'the run must report to Telegram').toBeDefined();
        expect(String(telegram![1].body)).toContain('model_not_found');
    });

    it('fills the whole batch when the thinnest articles are all already indexed', async () => {
        // This started as a starvation test: PASS articles were skipped, stayed
        // the thinnest, and took the same slots every run. The skip is gone —
        // thin is thin — so the batch now fills regardless of index status.
        const THIN = (n: number) => [{ type: 'p', text: 'w '.repeat(n) }];
        const fixture = [
            { slug: 'indexed-1', es: { title: 'A', content: THIN(10) } },
            { slug: 'indexed-2', es: { title: 'B', content: THIN(11) } },
            { slug: 'indexed-3', es: { title: 'C', content: THIN(12) } },
            { slug: 'indexed-4', es: { title: 'D', content: THIN(13) } },
            { slug: 'needs-1', es: { title: 'E', content: THIN(20) } },
            { slug: 'needs-2', es: { title: 'F', content: THIN(21) } },
            { slug: 'needs-3', es: { title: 'G', content: THIN(22) } },
            { slug: 'needs-4', es: { title: 'H', content: THIN(23) } },
            { slug: 'needs-5', es: { title: 'I', content: THIN(24) } },
        ];
        // indexed-* come back as PASS, needs-* as not indexed
        fetchMock.mockImplementation((url: string, init?: { body?: string }) => {
            if (url.includes('oauth2.googleapis.com')) return jsonResponse({ access_token: 'tok' });
            if (url.includes('githubusercontent') || url.includes('api.github.com/repos'))
                return jsonResponse({ content: Buffer.from(JSON.stringify(fixture)).toString('base64'), sha: 'sha1' });
            if (url.includes('searchconsole.googleapis.com')) {
                const isIndexed = String(init?.body || '').includes('indexed-');
                return jsonResponse({
                    inspectionResult: {
                        indexStatusResult: isIndexed
                            ? { verdict: 'PASS', coverageState: 'Submitted and indexed' }
                            : { verdict: 'NEUTRAL', coverageState: 'Crawled - currently not indexed' },
                    },
                });
            }
            if (url.includes('api.groq.com'))
                return jsonResponse({ choices: [{ message: { content: JSON.stringify([{ type: 'p', text: 'x '.repeat(1300) }]) } }] });
            return jsonResponse({ ok: true });
        });

        const { GET } = await import('./route');
        const json = await (await GET(cronRequest())).json();

        expect(
            json.fixed.length,
            `a run must do a full batch of real work; got ${json.fixed.length}`
        ).toBe(5);
    });

    it('waits out a Groq rate limit instead of losing the article', async () => {
        // Groq's free tier allows 8000 tokens per minute; each expansion asks for
        // roughly 4250, so the second and third call of a run came back 429 with
        // "try again in 22.8s". The run threw those articles away.
        const THIN = [{ type: 'p', text: 'w '.repeat(20) }];
        const fixture = [{ slug: 'rate-limited', es: { title: 'A', content: THIN } }];
        let groqCalls = 0;
        fetchMock.mockImplementation((url: string) => {
            if (url.includes('oauth2.googleapis.com')) return jsonResponse({ access_token: 'tok' });
            if (url.includes('githubusercontent') || url.includes('api.github.com/repos'))
                return jsonResponse({ content: Buffer.from(JSON.stringify(fixture)).toString('base64'), sha: 'sha1' });
            if (url.includes('searchconsole.googleapis.com'))
                return jsonResponse({ inspectionResult: { indexStatusResult: { verdict: 'NEUTRAL', coverageState: 'Crawled - currently not indexed' } } });
            if (url.includes('api.groq.com')) {
                groqCalls += 1;
                if (groqCalls === 1) {
                    return Promise.resolve({
                        ok: false,
                        status: 429,
                        headers: { get: () => null },
                        text: () => Promise.resolve(JSON.stringify({
                            error: { code: 'rate_limit_exceeded', message: 'Rate limit reached. Please try again in 0.05s.' },
                        })),
                        json: () => Promise.resolve({}),
                    });
                }
                return jsonResponse({ choices: [{ message: { content: JSON.stringify([{ type: 'p', text: 'x '.repeat(1300) }]) } }] });
            }
            return jsonResponse({ ok: true });
        });

        const { GET } = await import('./route');
        const json = await (await GET(cronRequest())).json();

        expect(groqCalls, 'a 429 must be retried, not abandoned').toBeGreaterThan(1);
        expect(json.fixed.length, 'the article should be expanded on the retry').toBe(1);
        expect(json.errors).toHaveLength(0);
    });

    it('retries once when the model returns something that is not a JSON array', async () => {
        const THIN = [{ type: 'p', text: 'w '.repeat(20) }];
        const fixture = [{ slug: 'bad-json', es: { title: 'A', content: THIN } }];
        let groqCalls = 0;
        fetchMock.mockImplementation((url: string) => {
            if (url.includes('oauth2.googleapis.com')) return jsonResponse({ access_token: 'tok' });
            if (url.includes('githubusercontent') || url.includes('api.github.com/repos'))
                return jsonResponse({ content: Buffer.from(JSON.stringify(fixture)).toString('base64'), sha: 'sha1' });
            if (url.includes('searchconsole.googleapis.com'))
                return jsonResponse({ inspectionResult: { indexStatusResult: { verdict: 'NEUTRAL', coverageState: 'Crawled - currently not indexed' } } });
            if (url.includes('api.groq.com')) {
                groqCalls += 1;
                if (groqCalls === 1) return jsonResponse({ choices: [{ message: { content: 'Sure! Here is the content you asked for.' } }] });
                return jsonResponse({ choices: [{ message: { content: JSON.stringify([{ type: 'p', text: 'x '.repeat(1300) }]) } }] });
            }
            return jsonResponse({ ok: true });
        });

        const { GET } = await import('./route');
        const json = await (await GET(cronRequest())).json();

        expect(groqCalls).toBeGreaterThan(1);
        expect(json.fixed.length).toBe(1);
    });

    it('keeps the existing blocks byte-for-byte and only appends what the model returned', async () => {
        // The prompt used to ask for the whole array back, existing blocks
        // included. That doubled the response, pushed it into max_tokens and
        // truncated the JSON mid-array — and it let the model silently rewrite
        // text that was already good.
        const existing = [
            { type: 'h2', text: 'Sección original que no debe cambiar' },
            { type: 'p', text: 'w '.repeat(20).trim() },
        ];
        const fixture = [{ slug: 'append-only', es: { title: 'A', content: existing } }];
        let committed: unknown = null;
        fetchMock.mockImplementation((url: string, init?: { body?: string; method?: string }) => {
            if (url.includes('oauth2.googleapis.com')) return jsonResponse({ access_token: 'tok' });
            if (url.includes('api.github.com/repos') && init?.method === 'PUT') {
                const body = JSON.parse(String(init.body));
                committed = JSON.parse(Buffer.from(body.content, 'base64').toString());
                return jsonResponse({ commit: { sha: 'new' } });
            }
            if (url.includes('githubusercontent') || url.includes('api.github.com/repos'))
                return jsonResponse({ content: Buffer.from(JSON.stringify(fixture)).toString('base64'), sha: 'sha1' });
            if (url.includes('searchconsole.googleapis.com'))
                return jsonResponse({ inspectionResult: { indexStatusResult: { verdict: 'NEUTRAL', coverageState: 'Crawled - currently not indexed' } } });
            if (url.includes('api.groq.com'))
                return jsonResponse({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify([{ type: 'p', text: 'nuevo '.repeat(400).trim() }]) } }] });
            return jsonResponse({ ok: true });
        });

        const { GET } = await import('./route');
        await GET(cronRequest());

        expect(committed, 'the run must commit').not.toBeNull();
        const saved = (committed as Array<{ es: { content: Array<{ type: string; text?: string }> } }>)[0].es.content;
        expect(saved.slice(0, existing.length)).toEqual(existing);
        expect(saved.length).toBeGreaterThan(existing.length);
    });

    it('says the answer was cut short rather than calling it unparsable', async () => {
        const fixture = [{ slug: 'cortada', es: { title: 'A', content: [{ type: 'p', text: 'w '.repeat(20) }] } }];
        fetchMock.mockImplementation((url: string) => {
            if (url.includes('oauth2.googleapis.com')) return jsonResponse({ access_token: 'tok' });
            if (url.includes('githubusercontent') || url.includes('api.github.com/repos'))
                return jsonResponse({ content: Buffer.from(JSON.stringify(fixture)).toString('base64'), sha: 'sha1' });
            if (url.includes('searchconsole.googleapis.com'))
                return jsonResponse({ inspectionResult: { indexStatusResult: { verdict: 'NEUTRAL', coverageState: 'Crawled - currently not indexed' } } });
            if (url.includes('api.groq.com'))
                return jsonResponse({ choices: [{ finish_reason: 'length', message: { content: '[{"type":"p","text":"empieza pero no term' } }] });
            return jsonResponse({ ok: true });
        });

        const { GET } = await import('./route');
        const json = await (await GET(cronRequest())).json();

        const reported = json.errors.join(' ');
        expect(reported, `errors were: ${reported}`).toMatch(/cut short|truncat/i);
        expect(reported).not.toMatch(/unparsable/i);
    });

    it('flattens a nested array and drops anything that is not a real block', async () => {
        // Seen in production on 11 September: the model answered
        // [[{...},{...}]] and the whole inner array was appended as a single
        // "block". The page still returned 200 and simply did not render it —
        // the work was lost silently while the run reported success.
        const fixture = [{ slug: 'anidado', es: { title: 'A', content: [{ type: 'p', text: 'w '.repeat(20).trim() }] } }];
        let committed: unknown = null;
        fetchMock.mockImplementation((url: string, init?: { body?: string; method?: string }) => {
            if (url.includes('oauth2.googleapis.com')) return jsonResponse({ access_token: 'tok' });
            if (url.includes('api.github.com/repos') && init?.method === 'PUT') {
                committed = JSON.parse(Buffer.from(JSON.parse(String(init.body)).content, 'base64').toString());
                return jsonResponse({ commit: { sha: 'new' } });
            }
            if (url.includes('githubusercontent') || url.includes('api.github.com/repos'))
                return jsonResponse({ content: Buffer.from(JSON.stringify(fixture)).toString('base64'), sha: 'sha1' });
            if (url.includes('searchconsole.googleapis.com'))
                return jsonResponse({ inspectionResult: { indexStatusResult: { verdict: 'NEUTRAL', coverageState: 'Crawled - currently not indexed' } } });
            if (url.includes('api.groq.com'))
                return jsonResponse({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify([
                    [{ type: 'h2', text: 'Anidado uno' }, { type: 'p', text: 'texto '.repeat(300).trim() }],
                    { type: 'p', text: 'plano '.repeat(300).trim() },
                    'basura suelta',
                    { sinTipo: true },
                ]) } }] });
            return jsonResponse({ ok: true });
        });

        const { GET } = await import('./route');
        await GET(cronRequest());

        const saved = (committed as Array<{ es: { content: unknown[] } }>)[0].es.content;
        expect(saved.every(b => b !== null && typeof b === 'object' && !Array.isArray(b)),
            `every stored block must be a real block object, got: ${JSON.stringify(saved.map(b => Array.isArray(b) ? 'array' : typeof b))}`).toBe(true);
        const texts = saved.map(b => (b as { text?: string }).text).filter(Boolean);
        expect(texts.some(t => t!.startsWith('Anidado uno'))).toBe(true);
        expect(texts.some(t => t!.startsWith('plano'))).toBe(true);
        expect(JSON.stringify(saved)).not.toContain('basura suelta');
        expect(JSON.stringify(saved)).not.toContain('sinTipo');
    });

    it('reads the file through the blobs API once it outgrows the contents API', async () => {
        // blog-data.json passed 1 MB on 11 September. The GitHub contents API
        // stops returning content above that — it answers with metadata and
        // encoding "none" — so JSON.parse('') threw "Unexpected end of JSON
        // input" and the run crashed with a 500.
        const fixture = [{ slug: 'grande', es: { title: 'A', content: [{ type: 'p', text: 'w '.repeat(20) }] } }];
        let blobFetched = false;
        fetchMock.mockImplementation((url: string, init?: { method?: string }) => {
            if (url.includes('oauth2.googleapis.com')) return jsonResponse({ access_token: 'tok' });
            if (url.includes('/git/blobs/')) {
                blobFetched = true;
                return jsonResponse({ content: Buffer.from(JSON.stringify(fixture)).toString('base64'), encoding: 'base64' });
            }
            if (url.includes('api.github.com/repos') && init?.method === 'PUT')
                return jsonResponse({ commit: { sha: 'new' } });
            if (url.includes('api.github.com/repos'))
                // too large: metadata only, no content
                return jsonResponse({ content: '', encoding: 'none', size: 1_090_407, sha: 'f'.repeat(40) });
            if (url.includes('searchconsole.googleapis.com'))
                return jsonResponse({ inspectionResult: { indexStatusResult: { verdict: 'NEUTRAL', coverageState: 'Crawled - currently not indexed' } } });
            if (url.includes('api.groq.com'))
                return jsonResponse({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify([{ type: 'p', text: 'x '.repeat(1300) }]) } }] });
            return jsonResponse({ ok: true });
        });

        const { GET } = await import('./route');
        const res = await GET(cronRequest());
        const json = await res.json();

        expect(res.status, 'an oversized file must not crash the run').toBe(200);
        expect(blobFetched, 'the run must fall back to the blobs API').toBe(true);
        expect(json.fixed.length).toBe(1);
    });

    it('expands a thin article even when Google has already indexed it', async () => {
        // Skipping PASS articles made sense while the goal was "fix what Google
        // refuses to index". The goal is thin content: a 191-word article ranks
        // badly whether or not it is in the index. And because PASS articles are
        // the thinnest, skipping them meant they filled the candidate pool —
        // a run on 11 September inspected 40 and found only 3 it would touch.
        const fixture = [
            { slug: 'indexado-1', es: { title: 'A', content: [{ type: 'p', text: 'w '.repeat(20) }] } },
            { slug: 'indexado-2', es: { title: 'B', content: [{ type: 'p', text: 'w '.repeat(21) }] } },
        ];
        fetchMock.mockImplementation((url: string) => {
            if (url.includes('oauth2.googleapis.com')) return jsonResponse({ access_token: 'tok' });
            if (url.includes('githubusercontent') || url.includes('api.github.com/repos'))
                return jsonResponse({ content: Buffer.from(JSON.stringify(fixture)).toString('base64'), sha: 'sha1' });
            if (url.includes('searchconsole.googleapis.com'))
                return jsonResponse({ inspectionResult: { indexStatusResult: { verdict: 'PASS', coverageState: 'Submitted and indexed' } } });
            if (url.includes('api.groq.com'))
                return jsonResponse({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify([{ type: 'p', text: 'x '.repeat(1300) }]) } }] });
            return jsonResponse({ ok: true });
        });

        const { GET } = await import('./route');
        const json = await (await GET(cronRequest())).json();

        expect(json.fixed.length, 'thin articles must be expanded regardless of index status').toBe(2);
        expect(json.skipped.join(' '), 'PASS is reported, not used to skip').not.toMatch(/indexado/);
    });

    it('spaces Groq calls by attempt, not by success', async () => {
        // The pause was guarded by `fixed.length > 0`, so a failed article left
        // the counter at zero and the next call went out with no gap at all —
        // straight into the per-minute limit. Seen on 12 September: one article
        // failed, the next came back 429 with "Used 4117, Requested 4040".
        const THIN = [{ type: 'p', text: 'w '.repeat(20) }];
        const fixture = [
            { slug: 'falla', es: { title: 'A', content: THIN } },
            { slug: 'sigue', es: { title: 'B', content: [{ type: 'p', text: 'w '.repeat(21) }] } },
        ];
        const groqAt: number[] = [];
        process.env.GROQ_SPACING_MS = '60';
        fetchMock.mockImplementation((url: string) => {
            if (url.includes('oauth2.googleapis.com')) return jsonResponse({ access_token: 'tok' });
            if (url.includes('githubusercontent') || url.includes('api.github.com/repos'))
                return jsonResponse({ content: Buffer.from(JSON.stringify(fixture)).toString('base64'), sha: 'sha1' });
            if (url.includes('searchconsole.googleapis.com'))
                return jsonResponse({ inspectionResult: { indexStatusResult: { verdict: 'NEUTRAL', coverageState: 'Crawled - currently not indexed' } } });
            if (url.includes('api.groq.com')) {
                groqAt.push(Date.now());
                // first article always fails, so `fixed` stays 0
                if (groqAt.length <= 2) return jsonResponse({ choices: [{ message: { content: 'no es json' } }] });
                return jsonResponse({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify([{ type: 'p', text: 'x '.repeat(1300) }]) } }] });
            }
            return jsonResponse({ ok: true });
        });

        const { GET } = await import('./route');
        await GET(cronRequest());

        // calls 1-2 are the failing article and its retry; call 3 is the next
        // article and must not follow immediately on the heels of call 2.
        expect(groqAt.length).toBeGreaterThanOrEqual(3);
        const gap = groqAt[2] - groqAt[1];
        expect(gap, `gap before the next article was ${gap}ms`).toBeGreaterThanOrEqual(50);
    });
});
