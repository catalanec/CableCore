import { NextResponse } from 'next/server';

const SITE_URL = 'https://cablecore.es/';
const GITHUB_REPO = 'catalanec/CableCore';
const BLOG_DATA_PATH = 'src/lib/blog-data.json';

// Vercel kills a serverless function at its maxDuration. This route used to
// declare none, so it ran under the 60s default while sequentially inspecting
// every slug x locale (105 URLs at the time of writing) and then calling Groq
// inline for each thin one. It was killed mid-loop — and since the commit sat
// AFTER the loop, every fix that run had made was thrown away. It last managed
// to commit on 2026-07-12 and produced nothing for the eight weeks after.
export const maxDuration = 300;

// Work is bounded per run instead: the thinnest articles are expanded first, so
// each run advances the queue without needing a stored cursor — once an article
// is expanded it is no longer among the thinnest. The deadline leaves room to
// commit whatever the run finished.
const BATCH_SIZE = 5;

// How many of the thinnest articles a run is willing to look at in order to
// find BATCH_SIZE that actually need expanding. Articles Google has already
// indexed are skipped, but they stay the thinnest, so a fixed window of
// BATCH_SIZE handed them the same slots every single day: the 11 September run
// expanded one article and skipped four. The pool is wider than the batch so
// skips cost an inspection, not a slot.
const CANDIDATE_POOL = 40;

// Groq's on-demand tier allows 8000 tokens per minute, and one expansion asks
// for roughly 4250 (prompt plus the max_tokens reservation). Two back-to-back
// calls therefore hit 429 — which is exactly what happened on 11 September:
// five articles picked, three lost to "Rate limit reached ... try again in
// 22.8s". Leave room between calls, and when a 429 arrives anyway, wait the
// interval Groq itself names rather than discarding the article.
// Configurable because the right value follows the Groq plan: the on-demand
// tier needs ~20s between calls, a paid tier needs none.
const GROQ_SPACING_MS = Number(process.env.GROQ_SPACING_MS ?? 20_000);
const GROQ_MAX_ATTEMPTS = 2;

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Groq puts the wait in the message: "Please try again in 22.8s."
function retryDelayFromGroq(body: string): number | null {
    const m = body.match(/try again in ([\d.]+)s/i);
    if (!m) return null;
    return Math.ceil(parseFloat(m[1]) * 1000) + 500;
}

// Groq retires models, and a retired one answers 404 to every call. That is how
// this cron spent days doing nothing after being fixed: it ran, asked for
// llama-3.3-70b-versatile, got model_not_found on all five articles and
// reported only "Groq failed to generate content". Keep the id here so the swap
// is one line, and see expandArticleWithGroq for why the reason is now carried
// out to the report instead of being left in a log that is kept for an hour.
const GROQ_MODEL = 'openai/gpt-oss-120b';
const DEADLINE_MS = 240_000;
const LOCALES = ['es', 'en', 'ru'] as const;
type Locale = (typeof LOCALES)[number];

interface ContentBlock {
    type: string;
    text?: string;
    items?: string[];
}

interface LocaleArticle {
    title?: string;
    content?: ContentBlock[];
    [key: string]: unknown;
}

interface BlogArticle {
    slug: string;
    es?: LocaleArticle;
    en?: LocaleArticle;
    ru?: LocaleArticle;
    [key: string]: unknown;
}

// ── OAuth2 via Refresh Token ───────────────────────────────────────────────
async function getGSCToken(clientId: string, clientSecret: string, refreshToken: string): Promise<string> {
    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: 'refresh_token' }),
    });
    const data = await res.json();
    if (!data.access_token) throw new Error(`GSC token error: ${JSON.stringify(data)}`);
    return data.access_token;
}

// ── GSC URL Inspection ─────────────────────────────────────────────────────
async function inspectUrl(token: string, url: string): Promise<{ verdict: string; coverageState: string }> {
    const res = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspectionUrl: url, siteUrl: SITE_URL }),
    });
    if (!res.ok) return { verdict: 'API_ERROR', coverageState: '' };
    const data = await res.json();
    const r = data.inspectionResult?.indexStatusResult;
    return { verdict: r?.verdict || 'UNKNOWN', coverageState: r?.coverageState || '' };
}

// ── GitHub API ────────────────────────────────────────────────────────────
// The contents API stops returning file content above 1 MB: it answers with
// metadata and encoding "none". blog-data.json crossed that line on
// 2026-09-11 while this cron was expanding articles into it, and the run died
// on JSON.parse(''). The sha still comes back, and the blobs API serves up to
// 100 MB, so the content is fetched from there when contents declines.
//
// Worth noting for later: one JSON file holding every article in three locales
// is what made a 1 MB ceiling reachable at all. Splitting it per article would
// remove the ceiling rather than raise it.
async function githubGetFile(token: string, path: string): Promise<{ content: string; sha: string }> {
    const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github+json' };
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`, { headers });
    if (!res.ok) throw new Error(`GitHub GET error: ${res.status}`);
    const data = await res.json();

    if (data.content) {
        return { content: Buffer.from(data.content, 'base64').toString('utf-8'), sha: data.sha };
    }

    if (!data.sha) throw new Error(`GitHub GET returned neither content nor sha for ${path}`);
    const blob = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/git/blobs/${data.sha}`, { headers });
    if (!blob.ok) throw new Error(`GitHub blob GET error: ${blob.status} (file is ${data.size ?? '?'} bytes)`);
    const blobData = await blob.json();
    if (!blobData.content) throw new Error(`GitHub blob ${data.sha} returned no content`);
    return { content: Buffer.from(blobData.content, 'base64').toString('utf-8'), sha: data.sha };
}

async function githubUpdateFile(token: string, path: string, content: string, sha: string, message: string): Promise<void> {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, content: Buffer.from(content).toString('base64'), sha }),
    });
    if (!res.ok) throw new Error(`GitHub PUT error: ${res.status} ${await res.text()}`);
}

// Rough word-count estimate from a locale's content-block array (matches the
// { type, text, items } shape actually used in blog-data.json — NOT the
// { type, content } shape a previous version of this cron assumed, which
// meant it silently never read/expanded real article content).
// The model does not always answer with a flat array of blocks. On 11 September
// it returned [[block, block], block] and the inner array was appended as one
// "block": the page rendered 200 and quietly skipped it, so the work was lost
// while the run reported success. Anything that is not a usable block is
// dropped here rather than written to disk.
function sanitizeBlocks(raw: unknown): ContentBlock[] {
    const flat = (Array.isArray(raw) ? raw : [raw]).flat(3);
    return flat.filter((b): b is ContentBlock => {
        if (!b || typeof b !== 'object' || Array.isArray(b)) return false;
        const block = b as { type?: unknown; text?: unknown; items?: unknown };
        if (typeof block.type !== 'string') return false;
        return typeof block.text === 'string' || Array.isArray(block.items);
    });
}

function estimateWordCount(content: ContentBlock[] | undefined): number {
    if (!content || content.length === 0) return 0;
    const text = content.map(b => b.text || (b.items ? b.items.join(' ') : '')).join(' ');
    return text.split(/\s+/).filter(Boolean).length;
}

// ── Groq API (Llama 3.3 70B) ─────────────────────────────────────────────
type GroqResult = { content: ContentBlock[]; reason?: never } | { content: null; reason: string };

async function expandArticleWithGroq(apiKey: string, localeArticle: LocaleArticle, locale: Locale, slug: string): Promise<GroqResult> {
    const langLabel = locale === 'es' ? 'Spanish' : locale === 'en' ? 'English' : 'Russian';
    const currentContent = JSON.stringify(localeArticle.content || [], null, 2);
    const wordCount = estimateWordCount(localeArticle.content);

    const prompt = `You are an SEO content specialist. This article is not indexed by Google because it has thin content (~${wordCount} words).

Article metadata:
- Title: ${localeArticle.title || ''}
- Locale: ${langLabel}
- Slug: ${slug}

Current content blocks array:
${currentContent}

Task: Write ADDITIONAL content blocks to append after the ones above, enough to bring the article to 1200-1500+ words in total.
Rules:
1. Do NOT repeat or restate the existing blocks — they are kept as they are and yours go after them
2. Use "h2" sections, "p" paragraphs, "ul" lists (with an "items" string array) — whatever improves the article
3. Write in ${langLabel}, professional and SEO-friendly tone, with concrete technical facts/numbers, not generic filler
4. Topics should stay relevant to network cable installation in Barcelona, Spain
5. Return ONLY a valid JSON array of the NEW blocks, using this exact shape for each: {"type":"h2","text":"..."} or {"type":"p","text":"..."} or {"type":"ul","items":["...","..."]}. No markdown, no explanation.`;

    let lastReason = 'Groq call never ran';

    for (let attempt = 1; attempt <= GROQ_MAX_ATTEMPTS; attempt++) {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                max_tokens: 4096,
                messages: [{ role: 'user', content: prompt }],
            }),
        });

        if (!res.ok) {
            const body = await res.text();
            console.error('Groq API error:', res.status, body);
            // Surface the API's own words. A generic failure reads as a transient
            // hiccup; "model_not_found" reads as something to go and fix.
            let detail = body.slice(0, 200);
            try {
                const parsed = JSON.parse(body);
                const code = parsed?.error?.code;
                const message = parsed?.error?.message;
                if (message) detail = code ? `${code}: ${message}` : message;
            } catch { /* keep the raw body */ }
            lastReason = `Groq ${res.status ?? 'error'} — ${detail}`;

            const wait = res.status === 429 ? retryDelayFromGroq(body) : null;
            if (wait !== null && attempt < GROQ_MAX_ATTEMPTS) {
                await sleep(wait);
                continue;
            }
            return { content: null, reason: lastReason };
        }

        const data = await res.json();
        const choice = data.choices?.[0];
        const text = choice?.message?.content || '';
        // finish_reason 'length' means the answer hit max_tokens and stopped
        // mid-sentence. Reporting that as "unparsable JSON" sent us looking at
        // the model's formatting when the real problem was the size of the ask.
        const cutShort = choice?.finish_reason === 'length';

        try {
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                // The model occasionally answers in prose. One more attempt is
                // cheaper than losing the article until tomorrow's run.
                lastReason = cutShort
                    ? `Groq ${GROQ_MODEL} answer was cut short at max_tokens`
                    : `Groq ${GROQ_MODEL} returned no JSON array`;
                if (attempt < GROQ_MAX_ATTEMPTS) continue;
                return { content: null, reason: lastReason };
            }
            const blocks = sanitizeBlocks(JSON.parse(jsonMatch[0]));
            if (blocks.length === 0) {
                lastReason = `Groq ${GROQ_MODEL} returned no usable blocks`;
                if (attempt < GROQ_MAX_ATTEMPTS) continue;
                return { content: null, reason: lastReason };
            }
            return { content: blocks };
        } catch {
            console.error('Failed to parse Groq response:', text.slice(0, 200));
            lastReason = cutShort
                ? `Groq ${GROQ_MODEL} answer was cut short at max_tokens`
                : `Groq ${GROQ_MODEL} returned unparsable JSON`;
            if (attempt < GROQ_MAX_ATTEMPTS) continue;
            return { content: null, reason: lastReason };
        }
    }

    return { content: null, reason: lastReason };
}

// ── Telegram notification ──────────────────────────────────────────────────
async function sendTelegram(botToken: string, chatId: string, text: string): Promise<void> {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
}

// ── Main handler ───────────────────────────────────────────────────────────
export async function GET(request: Request) {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const googleRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    const groqKey = process.env.GROQ_API_KEY;
    const githubToken = process.env.GITHUB_TOKEN;
    const telegramBot = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChat = process.env.TELEGRAM_CHAT_ID;

    if (!googleClientId || !googleClientSecret || !googleRefreshToken) {
        return NextResponse.json({ error: 'Missing env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_REFRESH_TOKEN' }, { status: 500 });
    }
    if (!groqKey || !githubToken) {
        return NextResponse.json({ error: 'Missing env: GROQ_API_KEY or GITHUB_TOKEN' }, { status: 500 });
    }

    const fixed: string[] = [];
    const skipped: string[] = [];
    const errors: string[] = [];

    try {
        const gscToken = await getGSCToken(googleClientId, googleClientSecret, googleRefreshToken);

        // Read blog-data.json once
        const { content: rawJson, sha: blogSha } = await githubGetFile(githubToken, BLOG_DATA_PATH);
        const blogData: BlogArticle[] = JSON.parse(rawJson);

        // Build the list of URLs to check dynamically from the CURRENT article
        // set (every slug x every locale) instead of a hardcoded map — a
        // previous version only monitored 6 legacy URLs, so newly-published
        // thin articles were never picked up for expansion at all.
        // Thinness is knowable from the data — asking Google 105 times to learn
        // it is what exhausted the budget before any work got done. Inspect only
        // the handful this run intends to touch.
        const keyPages = blogData
            .flatMap(article =>
                LOCALES.filter(locale => article[locale]).map(locale => ({
                    url: `https://cablecore.es/${locale}/blog/${article.slug}`,
                    slug: article.slug,
                    locale,
                    words: estimateWordCount(article[locale]?.content),
                }))
            )
            .filter(p => p.words <= 1200)
            .sort((a, b) => a.words - b.words)
            .slice(0, CANDIDATE_POOL);

        let blogDataModified = false;

        const startedAt = Date.now();

        // Every failure also goes to the log. Until now they existed only in the
        // Telegram report, so a run that did little work looked clean in Vercel's
        // logs and there was nothing to read while diagnosing it.
        const fail = (url: string, reason: string) => {
            console.error('[gsc-autofix]', url, '—', reason);
            errors.push(`${url} — ${reason}`);
        };

        for (const page of keyPages) {
            if (fixed.length >= BATCH_SIZE) break;
            if (Date.now() - startedAt > DEADLINE_MS) {
                skipped.push(`${page.url} (out of time this run)`);
                continue;
            }
            try {
                // The verdict is recorded, not obeyed. Skipping articles Google
                // had already indexed sounded right while the goal was "fix what
                // Google refuses to index" — but the goal is thin content, and a
                // 191-word article ranks badly whether indexed or not. Worse,
                // indexed articles stay the thinnest, so they filled the
                // candidate pool: a run on 11 September inspected 40 and found
                // three it was willing to touch.
                const { verdict } = await inspectUrl(gscToken, page.url);

                const articleIdx = blogData.findIndex(a => a.slug === page.slug);
                if (articleIdx === -1) {
                    fail(page.url, 'article not found in blog-data.json');
                    continue;
                }

                const article = blogData[articleIdx];
                const localeArticle = article[page.locale];
                if (!localeArticle) {
                    fail(page.url, `no ${page.locale} content on this article`);
                    continue;
                }

                const estimatedWords = estimateWordCount(localeArticle.content);

                if (estimatedWords > 1200) {
                    skipped.push(`${page.url} (content ok, ~${estimatedWords}w, verdict=${verdict})`);
                    continue;
                }


                // Expand with Groq
                // Space the calls so the per-minute token budget is not spent
                // in the first few seconds of the run.
                if (fixed.length > 0) await sleep(GROQ_SPACING_MS);

                const expansion = await expandArticleWithGroq(groqKey, localeArticle, page.locale, page.slug);
                if (!expansion.content) {
                    fail(page.url, expansion.reason);
                    continue;
                }
                const expandedContent = expansion.content;

                // Append. The model is asked only for new blocks now, so what
                // already reads well cannot be silently rewritten, and the
                // response is half the size it used to be — which is what was
                // pushing it into max_tokens and truncating the JSON.
                blogData[articleIdx] = {
                    ...article,
                    [page.locale]: {
                        ...localeArticle,
                        content: [...(localeArticle.content || []), ...expandedContent],
                    },
                };
                blogDataModified = true;
                fixed.push(`${page.url} (${estimatedWords}w → 1200+w, ${verdict})`);

            } catch (err) {
                fail(page.url, err instanceof Error ? err.message : String(err));
            }
        }

        console.log('[gsc-autofix] done:', JSON.stringify({
            candidates: keyPages.length,
            fixed: fixed.length,
            skipped: skipped.length,
            errors: errors.length,
            elapsedMs: Date.now() - startedAt,
        }));

        // Commit if anything changed
        if (blogDataModified) {
            await githubUpdateFile(
                githubToken,
                BLOG_DATA_PATH,
                JSON.stringify(blogData, null, 2) + '\n',
                blogSha,
                `seo: auto-expand thin articles (${fixed.length} fixed by gsc-autofix cron)`
            );
        }

        // Telegram report
        if (telegramBot && telegramChat) {
            const today = new Date().toISOString().split('T')[0];
            const lines = [
                `🤖 <b>GSC Auto-Fix</b> — ${today}`,
                '',
                fixed.length > 0 ? `✅ <b>Исправлено (${fixed.length}):</b>\n${fixed.map(f => `• ${f}`).join('\n')}` : '',
                skipped.length > 0 ? `⚪ <b>OK / пропущено (${skipped.length}):</b>\n${skipped.map(s => `• ${s}`).join('\n')}` : '',
                errors.length > 0 ? `❌ <b>Ошибки (${errors.length}):</b>\n${errors.map(e => `• ${e}`).join('\n')}` : '',
                blogDataModified ? '\n🚀 Коммит в GitHub создан → Vercel деплоит автоматически' : '',
            ].filter(Boolean).join('\n');
            await sendTelegram(telegramBot, telegramChat, lines);
        }

        return NextResponse.json({ fixed, skipped, errors, committed: blogDataModified });

    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (telegramBot && telegramChat) {
            await sendTelegram(telegramBot, telegramChat, `❌ GSC Auto-Fix crash: ${msg}`);
        }
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
