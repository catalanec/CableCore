import { NextResponse } from 'next/server';

const SITE_URL = 'https://cablecore.es/';
const GITHUB_REPO = 'catalanec/CableCore';
const BLOG_DATA_PATH = 'src/lib/blog-data.json';
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
async function githubGetFile(token: string, path: string): Promise<{ content: string; sha: string }> {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github+json' },
    });
    if (!res.ok) throw new Error(`GitHub GET error: ${res.status}`);
    const data = await res.json();
    return { content: Buffer.from(data.content, 'base64').toString('utf-8'), sha: data.sha };
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
function estimateWordCount(content: ContentBlock[] | undefined): number {
    if (!content || content.length === 0) return 0;
    const text = content.map(b => b.text || (b.items ? b.items.join(' ') : '')).join(' ');
    return text.split(/\s+/).filter(Boolean).length;
}

// ── Groq API (Llama 3.3 70B) ─────────────────────────────────────────────
async function expandArticleWithGroq(apiKey: string, localeArticle: LocaleArticle, locale: Locale, slug: string): Promise<ContentBlock[] | null> {
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

Task: Expand this article by adding new content blocks to reach 1200-1500+ words total.
Rules:
1. Keep ALL existing blocks exactly as they are (do not modify them)
2. Add new blocks after the existing ones
3. Add "h2" sections, "p" paragraphs, "ul" lists (with an "items" string array) — whatever improves the article
4. Write in ${langLabel}, professional and SEO-friendly tone, with concrete technical facts/numbers, not generic filler
5. Topics should stay relevant to network cable installation in Barcelona, Spain
6. Return ONLY a valid JSON array of the complete content blocks (existing + new), using this exact shape for each block: {"type":"h2","text":"..."} or {"type":"p","text":"..."} or {"type":"ul","items":["...","..."]}. No markdown, no explanation.`;

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            max_tokens: 4096,
            messages: [{ role: 'user', content: prompt }],
        }),
    });

    if (!res.ok) {
        console.error('Groq API error:', res.status, await res.text());
        return null;
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';

    try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) return null;
        return JSON.parse(jsonMatch[0]) as ContentBlock[];
    } catch {
        console.error('Failed to parse Groq response:', text.slice(0, 200));
        return null;
    }
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
        const keyPages = blogData.flatMap(article =>
            LOCALES.filter(locale => article[locale]).map(locale => ({
                url: `https://cablecore.es/${locale}/blog/${article.slug}`,
                slug: article.slug,
                locale,
            }))
        );

        let blogDataModified = false;

        for (const page of keyPages) {
            try {
                const { verdict, coverageState } = await inspectUrl(gscToken, page.url);

                // Only attempt fix if page is not indexed
                const needsFix = verdict !== 'PASS' && (
                    coverageState.includes('not indexed') ||
                    coverageState.includes('Discovered') ||
                    coverageState === '' ||
                    verdict === 'UNKNOWN'
                );

                if (!needsFix) {
                    skipped.push(`${page.url} (${verdict})`);
                    continue;
                }

                const articleIdx = blogData.findIndex(a => a.slug === page.slug);
                if (articleIdx === -1) {
                    errors.push(`${page.url} — article not found in blog-data.json`);
                    continue;
                }

                const article = blogData[articleIdx];
                const localeArticle = article[page.locale];
                if (!localeArticle) {
                    errors.push(`${page.url} — no ${page.locale} content on this article`);
                    continue;
                }

                const estimatedWords = estimateWordCount(localeArticle.content);

                if (estimatedWords > 1200) {
                    skipped.push(`${page.url} (content ok, ~${estimatedWords}w, verdict=${verdict})`);
                    continue;
                }

                // Expand with Groq
                const expandedContent = await expandArticleWithGroq(groqKey, localeArticle, page.locale, page.slug);
                if (!expandedContent) {
                    errors.push(`${page.url} — Groq failed to generate content`);
                    continue;
                }

                blogData[articleIdx] = {
                    ...article,
                    [page.locale]: { ...localeArticle, content: expandedContent },
                };
                blogDataModified = true;
                fixed.push(`${page.url} (${estimatedWords}w → 1200+w)`);

            } catch (err) {
                errors.push(`${page.url} — ${err instanceof Error ? err.message : String(err)}`);
            }
        }

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
