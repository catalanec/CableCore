import { NextResponse } from 'next/server';

const SITE_URL = 'https://cablecore.es/';

// Key pages to check indexing status daily
const KEY_PAGES = [
    'https://cablecore.es/es',
    'https://cablecore.es/es/servicios/instalacion-red-barcelona',
    'https://cablecore.es/es/servicios/instalacion-cable-red-barcelona',
    'https://cablecore.es/es/servicios/instalacion-fibra-optica-barcelona',
    'https://cablecore.es/es/blog/cat6-vs-cat6a-vs-cat7-diferencias',
    'https://cablecore.es/en/blog/cat6-vs-cat6a-vs-cat7-diferencias',
    // Was /es/blog/puntos-de-red-precio-guia — that slug redirects to this one
    // (round-17 duplicate consolidation), so it reported "Page with redirect"
    // every single day and could never come back green. /es/calculadora was
    // here too: also a permanent redirect, and the calculator behind it is
    // PIN-locked, so it has no business being in the index at all.
    //
    // A daily alert that is always red is a daily alert nobody reads.
    'https://cablecore.es/es/blog/cuanto-cuesta-instalar-red-oficina-barcelona',
];

const TARGET_KEYWORDS = [
    // Rastreados actualmente en GSC (tienen impresiones)
    'cableado estructurado',
    'cableados estructurados barcelona',
    'cableado estructurado sant cugat del valles',
    'cableado estructurado empresas',
    'cable estructurado',
    'cableado de red barcelona',
    'instalacion fibra optica barcelona',
    'instalacion cable de red barcelona',
    // Objetivos (long-tail a alcanzar)
    'instalador red barcelona',
    'precio punto de red barcelona',
];

function positionEmoji(pos: number | null): string {
    if (pos === null) return '⚪';
    if (pos <= 3) return '🏆';
    if (pos <= 10) return '🟢';
    if (pos <= 20) return '🟡';
    return '🔴';
}

// ── OAuth2 via Refresh Token (user account) ────────────────────────────────
async function getGSCAccessTokenFromRefreshToken(
    clientId: string,
    clientSecret: string,
    refreshToken: string
): Promise<string> {
    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        }),
    });
    const data = await res.json();
    if (!data.access_token) throw new Error(`Refresh token error: ${JSON.stringify(data)}`);
    return data.access_token;
}

// ── Google OAuth2 via Service Account JWT ──────────────────────────────────
async function getGSCAccessToken(serviceAccountJson: string): Promise<string> {
    const sa = JSON.parse(serviceAccountJson);
    const now = Math.floor(Date.now() / 1000);

    const header = { alg: 'RS256', typ: 'JWT' };
    const payload = {
        iss: sa.client_email,
        scope: 'https://www.googleapis.com/auth/webmasters',
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600,
    };

    const encode = (obj: object) =>
        Buffer.from(JSON.stringify(obj)).toString('base64url');

    const signingInput = `${encode(header)}.${encode(payload)}`;

    // Import the RSA private key
    const privateKey = await crypto.subtle.importKey(
        'pkcs8',
        pemToArrayBuffer(sa.private_key),
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign(
        'RSASSA-PKCS1-v1_5',
        privateKey,
        new TextEncoder().encode(signingInput)
    );

    const jwt = `${signingInput}.${Buffer.from(signature).toString('base64url')}`;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt,
        }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
        throw new Error(`OAuth error: ${JSON.stringify(tokenData)}`);
    }
    return tokenData.access_token;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
    const b64 = pem
        .replace(/-----BEGIN PRIVATE KEY-----/, '')
        .replace(/-----END PRIVATE KEY-----/, '')
        .replace(/\s+/g, '');
    const binary = Buffer.from(b64, 'base64');
    return binary.buffer.slice(binary.byteOffset, binary.byteOffset + binary.byteLength) as ArrayBuffer;
}

// ── Query GSC Search Analytics ─────────────────────────────────────────────
/**
 * Search Console publishes with a two-to-three day lag, so a window ending
 * today always has empty tail days. Comparing such a window against an older,
 * complete one shows a decline that is pure artefact — which is exactly how
 * this report came to read as "losing positions" during a month when clicks
 * grew 72%.
 */
const GSC_LAG_DAYS = 3;
const KEYWORD_WINDOW_DAYS = 28;
const TREND_WINDOW_DAYS = 7;

function dayOffset(days: number): string {
    return new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
}

type SiteTotals = { clicks: number; impressions: number; ctr: number; position: number | null };

/**
 * Site-wide totals, with no query dimension.
 *
 * The keyword table below covers ten hard commercial terms the site does not
 * rank for yet, and its totals were being printed as "Clics totales" — so the
 * report announced 0 clicks on weeks the site actually earned 17. That single
 * number is what made a growing site look dead.
 */
async function fetchSiteTotals(accessToken: string, startDate: string, endDate: string): Promise<SiteTotals> {
    const res = await fetch(
        `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
        {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ startDate, endDate, rowLimit: 1, dataState: 'all' }),
        }
    );
    if (!res.ok) throw new Error(`GSC totals error: ${await res.text()}`);
    const json = await res.json();
    const row = json.rows?.[0];
    return row
        ? { clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position }
        : { clicks: 0, impressions: 0, ctr: 0, position: null };
}

/** "+72%" / "−9%" / "=" — a bare number cannot say whether things are improving. */
function delta(now: number, before: number): string {
    if (before === 0) return now > 0 ? '(nuevo)' : '';
    const pct = Math.round(((now - before) / before) * 100);
    if (pct === 0) return '(=)';
    return pct > 0 ? `(+${pct}%)` : `(${pct}%)`;
}

async function queryGSC(accessToken: string): Promise<Array<{
    keyword: string;
    position: number | null;
    clicks: number;
    impressions: number;
    ctr: number;
}>> {
    const endDate = dayOffset(GSC_LAG_DAYS);
    const startDate = dayOffset(GSC_LAG_DAYS + KEYWORD_WINDOW_DAYS);

    const res = await fetch(
        `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                startDate,
                endDate,
                dimensions: ['query'],
                rowLimit: 100,
                dataState: 'all',
            }),
        }
    );

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`GSC API error: ${err}`);
    }

    const data = await res.json();
    const rows: Array<{ keys: string[]; position: number; clicks: number; impressions: number; ctr: number }> = data.rows || [];

    // Map target keywords to GSC data
    return TARGET_KEYWORDS.map(kw => {
        const kwLower = kw.toLowerCase();
        // Find exact or closest match in GSC data
        const match = rows.find(r => r.keys[0].toLowerCase() === kwLower)
            || rows.find(r => r.keys[0].toLowerCase().includes(kwLower.split(' ').slice(0, 3).join(' ')));

        return match
            ? {
                keyword: kw,
                position: Math.round(match.position),
                clicks: match.clicks,
                impressions: match.impressions,
                ctr: match.ctr,
            }
            : { keyword: kw, position: null, clicks: 0, impressions: 0, ctr: 0 };
    });
}

// ── Check indexing status of key pages ────────────────────────────────────
async function checkPageIndexing(accessToken: string): Promise<Array<{
    url: string;
    verdict: string;
    coverageState: string;
    lastCrawl: string;
}>> {
    const results = [];
    for (const url of KEY_PAGES) {
        try {
            const res = await fetch(
                'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ inspectionUrl: url, siteUrl: SITE_URL }),
                }
            );
            if (!res.ok) { results.push({ url, verdict: 'API_ERROR', coverageState: '', lastCrawl: '' }); continue; }
            const data = await res.json();
            const r = data.inspectionResult?.indexStatusResult;
            results.push({
                url,
                verdict: r?.verdict || 'UNKNOWN',
                coverageState: r?.coverageState || '',
                lastCrawl: r?.lastCrawlTime ? r.lastCrawlTime.split('T')[0] : 'never',
            });
        } catch {
            results.push({ url, verdict: 'ERROR', coverageState: '', lastCrawl: '' });
        }
    }
    return results;
}

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    const SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        return NextResponse.json({ error: 'Missing Telegram credentials' }, { status: 500 });
    }

    const today = new Date().toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long',
        timeZone: 'Europe/Madrid',
    });

    try {
        let results: Array<{ keyword: string; position: number | null; clicks: number; impressions: number; ctr: number }>;
        let dataSource: string;
        let accessToken: string | null = null;

        if (GOOGLE_REFRESH_TOKEN && GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
            accessToken = await getGSCAccessTokenFromRefreshToken(
                GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
            );
            results = await queryGSC(accessToken);
            dataSource = `Google Search Console · datos reales (${KEYWORD_WINDOW_DAYS} días, hasta ${dayOffset(GSC_LAG_DAYS)})`;
        } else if (SERVICE_ACCOUNT_KEY) {
            accessToken = await getGSCAccessToken(SERVICE_ACCOUNT_KEY);
            results = await queryGSC(accessToken);
            dataSource = `Google Search Console · service account (${KEYWORD_WINDOW_DAYS} días, hasta ${dayOffset(GSC_LAG_DAYS)})`;
        } else {
            results = TARGET_KEYWORDS.map(kw => ({ keyword: kw, position: null, clicks: 0, impressions: 0, ctr: 0 }));
            dataSource = '⚠️ Configura GOOGLE_REFRESH_TOKEN en Vercel';
        }

        // Check indexing status of key pages
        let indexingRows = '';
        let hasIndexingErrors = false;
        if (accessToken) {
            try {
                const pageStatuses = await checkPageIndexing(accessToken);
                const indexLines = pageStatuses.map(p => {
                    const shortUrl = p.url.replace('https://cablecore.es', '');
                    const emoji = p.verdict === 'PASS' ? '✅' : p.verdict === 'NEUTRAL' ? '⚠️' : '❌';
                    if (p.verdict !== 'PASS') hasIndexingErrors = true;
                    return `${emoji} ${shortUrl} — ${p.coverageState || p.verdict} (${p.lastCrawl})`;
                });
                indexingRows = indexLines.join('\n');
            } catch {
                // URL Inspection API requires webmasters scope — skip silently
            }
        }

        const rows = results.map(r => {
            const emoji = positionEmoji(r.position);
            const posText = r.position !== null
                ? `pos. <b>${r.position}</b> · ${r.clicks} clics · ${r.impressions} imp.`
                // NOT "no indexado aún". This only means the term drew no
                // impressions in the window; the pages themselves are indexed
                // and ranking for other queries. Saying otherwise turned a
                // keyword gap into a false indexing alarm.
                : `sin impresiones (${KEYWORD_WINDOW_DAYS} días)`;
            return `${emoji} ${r.keyword}: ${posText}`;
        }).join('\n');

        const ranked = results.filter(r => r.position !== null);
        const top10 = ranked.filter(r => r.position! <= 10).length;
        const top20 = ranked.filter(r => r.position! <= 20).length;
        const sorted = [...ranked].sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
        const best = sorted[0];
        const totalClicks = results.reduce((s, r) => s + r.clicks, 0);
        const totalImpressions = results.reduce((s, r) => s + r.impressions, 0);

        // Site-wide reality, next to the keyword table rather than instead of it:
        // the ten tracked terms are targets the site is still climbing towards,
        // and their totals say nothing about how the site is actually doing.
        let siteBlock: string[] = [];
        if (accessToken) {
            try {
                const [now, prev] = await Promise.all([
                    fetchSiteTotals(accessToken, dayOffset(GSC_LAG_DAYS + TREND_WINDOW_DAYS), dayOffset(GSC_LAG_DAYS)),
                    fetchSiteTotals(accessToken, dayOffset(GSC_LAG_DAYS + TREND_WINDOW_DAYS * 2), dayOffset(GSC_LAG_DAYS + TREND_WINDOW_DAYS + 1)),
                ]);
                siteBlock = [
                    '━━━━━━━━━━━━━━',
                    `🌐 <b>Todo el sitio (${TREND_WINDOW_DAYS} días vs. anteriores):</b>`,
                    `• Clics: <b>${now.clicks}</b> ${delta(now.clicks, prev.clicks)} · antes ${prev.clicks}`,
                    `• Impresiones: <b>${now.impressions}</b> ${delta(now.impressions, prev.impressions)} · antes ${prev.impressions}`,
                    `• CTR: <b>${(now.ctr * 100).toFixed(2)}%</b> · antes ${(prev.ctr * 100).toFixed(2)}%`,
                    now.position !== null && prev.position !== null
                        ? `• Posición media: <b>${now.position.toFixed(1)}</b> · antes ${prev.position.toFixed(1)}`
                        : '',
                    '<i>Una posición media que empeora mientras suben las impresiones suele significar páginas nuevas entrando en el índice, no posiciones perdidas.</i>',
                    '',
                ].filter(Boolean);
            } catch (e) {
                console.error('[SEO cron] site totals failed', e);
            }
        }

        const reportText = [
            `📊 <b>SEO diario CableCore</b> — ${today}`,
            `<i>Fuente: ${dataSource}</i>`,
            '',
            `${hasIndexingErrors ? '🚨' : '✅'} <b>Estado indexación páginas clave:</b>`,
            indexingRows,
            '',
            '━━━━━━━━━━━━━━',
            `🔍 <b>Posiciones de keywords:</b>`,
            rows,
            '',
            ...siteBlock,
            '━━━━━━━━━━━━━━',
            `📈 <b>Resumen de las ${results.length} keywords objetivo:</b>`,
            `• TOP 10: <b>${top10}</b> · TOP 20: <b>${top20}</b> · Con impresiones: <b>${ranked.length}/${results.length}</b>`,
            // Explicitly scoped: these are the tracked terms only, not the site.
            `• Clics de estas keywords: <b>${totalClicks}</b> · Impresiones: <b>${totalImpressions}</b>`,
            best ? `• 🏆 Mejor posición: "<i>${best.keyword}</i>" — pos. ${best.position}` : '',
            '',
            '🏆 TOP 3 · 🟢 TOP 10 · 🟡 TOP 20 · 🔴 >20 · ⚪ sin impresiones',
            `🔗 <a href="https://search.google.com/search-console/performance/search-analytics?resource_id=https%3A%2F%2Fcablecore.es%2F">Abrir Google Search Console</a>`,
        ].filter(Boolean).join('\n');

        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: reportText,
                parse_mode: 'HTML',
                disable_web_page_preview: true,
            }),
        });

        return NextResponse.json({ success: true, dataSource, results, top10, top20 });
    } catch (error: any) {
        const errMsg = `❌ <b>SEO cron error:</b> ${error.message}`;
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: errMsg, parse_mode: 'HTML' }),
        });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
