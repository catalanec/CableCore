import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

function cronRequest(authed = true) {
    const headers: Record<string, string> = {};
    if (authed) headers.authorization = 'Bearer test-cron-secret';
    return new Request('https://cablecore.es/api/cron/blog', { headers });
}

function jsonResponse(body: unknown, ok = true) {
    return Promise.resolve({
        ok,
        statusText: 'error',
        json: () => Promise.resolve(body),
        text: () => Promise.resolve(JSON.stringify(body)),
    });
}

describe('GET /api/cron/blog', () => {
    let fetchMock: ReturnType<typeof vi.fn>;
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        process.env = { ...ORIGINAL_ENV, OPENAI_API_KEY: 'sk-test', GITHUB_TOKEN: 'gh-test' };
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

    it('notifies Telegram and returns 500 when OPENAI_API_KEY/GITHUB_TOKEN are missing', async () => {
        process.env.OPENAI_API_KEY = '';
        fetchMock.mockImplementation(() => jsonResponse({}));
        const { GET } = await import('./route');
        const res = await GET(cronRequest());
        expect(res.status).toBe(500);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock.mock.calls[0][0]).toContain('api.telegram.org');
    });

    it('returns 500 and notifies Telegram when the GitHub read fails', async () => {
        fetchMock.mockImplementation((url: string) => {
            if (url.includes('api.github.com')) return jsonResponse({}, false);
            return jsonResponse({});
        });
        const { GET } = await import('./route');
        const res = await GET(cronRequest());
        expect(res.status).toBe(500);
        const json = await res.json();
        expect(json.error).toContain('GitHub API error');
    });

    it('returns 500 when the OpenAI call fails', async () => {
        const existingBlogs = Buffer.from(JSON.stringify([{ slug: 'existing-post' }])).toString('base64');
        fetchMock.mockImplementation((url: string) => {
            if (url.includes('api.github.com')) return jsonResponse({ sha: 'sha-1', content: existingBlogs });
            if (url.includes('api.openai.com')) return jsonResponse({ error: { message: 'quota exceeded' } }, false);
            return jsonResponse({});
        });
        const { GET } = await import('./route');
        const res = await GET(cronRequest());
        expect(res.status).toBe(500);
        const json = await res.json();
        expect(json.error).toContain('quota exceeded');
    });

    it('publishes the generated article and commits it to GitHub on the happy path', async () => {
        const existingBlogs = Buffer.from(JSON.stringify([{ slug: 'existing-post' }])).toString('base64');
        const newArticle = { slug: 'new-post', es: { title: 'Nuevo Post' }, en: {}, ru: {} };
        fetchMock.mockImplementation((url: string, opts?: RequestInit) => {
            if (url.includes('api.github.com') && opts?.method === 'PUT') return jsonResponse({ ok: true });
            if (url.includes('api.github.com')) return jsonResponse({ sha: 'sha-1', content: existingBlogs });
            if (url.includes('api.openai.com')) return jsonResponse({ choices: [{ message: { content: JSON.stringify(newArticle) } }] });
            return jsonResponse({});
        });
        const { GET } = await import('./route');
        const res = await GET(cronRequest());
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toEqual({ success: true, slug: 'new-post' });
    });

    it('returns 500 when the GitHub commit step fails', async () => {
        const existingBlogs = Buffer.from(JSON.stringify([{ slug: 'existing-post' }])).toString('base64');
        const newArticle = { slug: 'new-post', es: { title: 'Nuevo Post' }, en: {}, ru: {} };
        fetchMock.mockImplementation((url: string, opts?: RequestInit) => {
            if (url.includes('api.github.com') && opts?.method === 'PUT') return jsonResponse({}, false);
            if (url.includes('api.github.com')) return jsonResponse({ sha: 'sha-1', content: existingBlogs });
            if (url.includes('api.openai.com')) return jsonResponse({ choices: [{ message: { content: JSON.stringify(newArticle) } }] });
            return jsonResponse({});
        });
        const { GET } = await import('./route');
        const res = await GET(cronRequest());
        expect(res.status).toBe(500);
    });
});
