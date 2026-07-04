import { NextResponse } from 'next/server';

const SITE_URL = 'https://cablecore.es/';
const GITHUB_REPO = 'catalanec/CableCore';
const BLOG_DATA_PATH = 'src/lib/blog-data.json';

// Blog URLs that can be auto-fixed by expanding content
const BLOG_URL_MAP: Record<string, { locale: string; slug: string }> = {
    'https://cablecore.es/es/blog/cat6-vs-cat6a-vs-cat7-diferencias': { locale: 'es', slug: 'cat6-vs-cat6a-vs-cat7-diferencias' },
    'https://cablecore.es/en/blog/cat6-vs-cat6a-vs-cat7-diferencias': { locale: 'en', slug: 'cat6-vs-cat6a-vs-cat7-diferencias' },
    'https://cablecore.es/es/blog/puntos-de-red-precio-guia': { locale: 'es', slug: 'puntos-de-red-precio-guia' },
    'https://cablecore.es/es/blog/precio-instalacion-red-casa-oficina': { locale: 'es', slug: 'precio-instalacion-red-casa-oficina' },
    'https://cablecore.es/es/blog/como-instalar-cable-red-casa': { locale: 'es', slug: 'como-instalar-cable-red-casa' },
    'https://cablecore.es/es/blog/cuanto-cuesta-instalar-red-oficina': { locale: 'es', slug: 'cuanto-cuesta-instalar-red-oficina' },
};

const KEY_PAGES = Object.keys(BLOG_URL_MAP);

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

// ── Groq API (Llama 3.3 70B) ─────────────────────────────────────────────
async function expandArticleWithClaude(apiKey: string, article: Record<string, unknown>, locale: string): Promise<Record<string, unknown> | null> {
    const langLabel = locale === 'es' ? 'Spanish' : locale === 'en' ? 'English' : 'Russian';
    const currentBlocks = JSON.stringify(article.blocks || [], null, 2);
    const wordCount = JSON.stringify(article.blocks || []).length / 5;

    const prompt = `You are an SEO content specialist. This article is not indexed by Google because it has thin content (~${Math.round(wordCount)} words).

Article metadata:
- Title: ${article.title || ''}
- Locale: ${langLabel}
- Slug: ${article.slug || ''}

Current blocks array:
${currentBlocks}

Task: Expand this article by adding new content blocks to reach 2000+ words total.
Rules:
1. Keep ALL existing blocks exactly as they are (do not modify them)
2. Add new blocks after the existing ones
3. Add h2 sections, paragraphs, FAQ items, lists — whatever improves the article
4. Write in ${langLabel}, professional and SEO-friendly tone
5. Topics should be relevant to network cable installation in Barcelona, Spain
6. Return ONLY a valid JSON array of the complete blocks (existing + new), no markdown, no explanation

New blocks format examples:
{"type":"h2","content":"Title here"}
{"type":"p","content":"Paragraph text here"}
{"type":"list","items":["item 1","item 2","item 3"]}
{"type":"faq","question":"Question?","answer":"Answer text"}`;

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
        const newBlocks = JSON.parse(jsonMatch[0]);
        return { ...article, blocks: newBlocks };
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
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const googleRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    const anthropicKey = process.env.GROQ_API_KEY;
    const githubToken = process.env.GITHUB_TOKEN;
    const telegramBot = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChat = process.env.TELEGRAM_CHAT_ID;

    if (!googleClientId || !googleClientSecret || !googleRefreshToken) {
        return NextResponse.json({ error: 'Missing env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_REFRESH_TOKEN' }, { status: 500 });
    }
    if (!anthropicKey || !githubToken) {
        return NextResponse.json({ error: 'Missing env: GROQ_API_KEY or GITHUB_TOKEN' }, { status: 500 });
    }

    const fixed: string[] = [];
    const skipped: string[] = [];
    const errors: string[] = [];

    try {
        const gscToken = await getGSCToken(googleClientId, googleClientSecret, googleRefreshToken);

        // Read blog-data.json once
        const { content: rawJson, sha: blogSha } = await githubGetFile(githubToken, BLOG_DATA_PATH);
        const blogData: Array<Record<string, unknown>> = JSON.parse(rawJson);

        let blogDataModified = false;

        for (const url of KEY_PAGES) {
            try {
                const { verdict, coverageState } = await inspectUrl(gscToken, url);

                // Only attempt fix if page is not indexed
                const needsFix = verdict !== 'PASS' && (
                    coverageState.includes('not indexed') ||
                    coverageState.includes('Discovered') ||
                    coverageState === '' ||
                    verdict === 'UNKNOWN'
                );

                if (!needsFix) {
                    skipped.push(`${url} (${verdict})`);
                    continue;
                }

                const mapping = BLOG_URL_MAP[url];
                if (!mapping) {
                    errors.push(`${url} — no mapping (manual fix needed)`);
                    continue;
                }

                // Find the article
                const articleIdx = blogData.findIndex(a =>
                    (a.slug === mapping.slug || a.slugEs === mapping.slug) &&
                    (a.locale === mapping.locale || (!a.locale && mapping.locale === 'es'))
                );
                if (articleIdx === -1) {
                    errors.push(`${url} — article not found in blog-data.json`);
                    continue;
                }

                const article = blogData[articleIdx];
                const currentBlocks = Array.isArray(article.blocks) ? article.blocks : [];
                const estimatedWords = JSON.stringify(currentBlocks).length / 5;

                if (estimatedWords > 1500) {
                    skipped.push(`${url} (content ok, ~${Math.round(estimatedWords)}w, verdict=${verdict})`);
                    continue;
                }

                // Expand with Claude
                const expanded = await expandArticleWithClaude(anthropicKey, article, mapping.locale);
                if (!expanded) {
                    errors.push(`${url} — Claude failed to generate content`);
                    continue;
                }

                blogData[articleIdx] = expanded;
                blogDataModified = true;
                fixed.push(`${url} (${Math.round(estimatedWords)}w → 2000+w)`);

            } catch (err) {
                errors.push(`${url} — ${err instanceof Error ? err.message : String(err)}`);
            }
        }

        // Commit if anything changed
        if (blogDataModified) {
            await githubUpdateFile(
                githubToken,
                BLOG_DATA_PATH,
                JSON.stringify(blogData, null, 2),
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
