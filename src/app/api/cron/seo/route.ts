import { NextResponse } from 'next/server';

const SITE_URL = 'https://cablecore.es/';
const TARGET_KEYWORDS = [
    'instalación cable de red Barcelona',
    'cableado estructurado Barcelona',
    'instalar red oficina Barcelona',
    'precio punto de red Barcelona',
    'instalador red barcelona',
    'puntos de red barcelona precio',
    'empresa cableado estructurado barcelona',
    'instalacion fibra optica barcelona',
    'instalacion red hospitalet',
    'instalacion red badalona',
];

function positionEmoji(pos: number | null): string {
    if (pos === null) return '⚪';
    if (pos <= 3) return '🏆';
    if (pos <= 10) return '🟢';
    if (pos <= 20) return '🟡';
    return '🔴';
}

// ── Google OAuth2 via Service Account JWT ──────────────────────────────────
async function getGSCAccessToken(serviceAccountJson: string): Promise<string> {
    const sa = JSON.parse(serviceAccountJson);
    const now = Math.floor(Date.now() / 1000);

    const header = { alg: 'RS256', typ: 'JWT' };
    const payload = {
        iss: sa.client_email,
        scope: 'https://www.googleapis.com/auth/webmasters.readonly',
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
async function queryGSC(accessToken: string): Promise<Array<{
    keyword: string;
    position: number | null;
    clicks: number;
    impressions: number;
    ctr: number;
}>> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

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

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    const SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

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

        if (SERVICE_ACCOUNT_KEY) {
            const accessToken = await getGSCAccessToken(SERVICE_ACCOUNT_KEY);
            results = await queryGSC(accessToken);
            dataSource = 'Google Search Console · datos reales (últimos 7 días)';
        } else {
            // Fallback if not configured yet
            results = TARGET_KEYWORDS.map(kw => ({ keyword: kw, position: null, clicks: 0, impressions: 0, ctr: 0 }));
            dataSource = '⚠️ Configura GOOGLE_SERVICE_ACCOUNT_KEY en Vercel';
        }

        const rows = results.map(r => {
            const emoji = positionEmoji(r.position);
            const posText = r.position !== null
                ? `pos. <b>${r.position}</b> · ${r.clicks} clics · ${r.impressions} imp.`
                : 'sin datos (no indexado aún)';
            return `${emoji} ${r.keyword}: ${posText}`;
        }).join('\n');

        const ranked = results.filter(r => r.position !== null);
        const top10 = ranked.filter(r => r.position! <= 10).length;
        const top20 = ranked.filter(r => r.position! <= 20).length;
        const sorted = [...ranked].sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
        const best = sorted[0];
        const totalClicks = results.reduce((s, r) => s + r.clicks, 0);
        const totalImpressions = results.reduce((s, r) => s + r.impressions, 0);

        const reportText = [
            `📊 <b>SEO diario CableCore</b> — ${today}`,
            `<i>Fuente: ${dataSource}</i>`,
            '',
            rows,
            '',
            '━━━━━━━━━━━━━━',
            `📈 <b>Resumen semana:</b>`,
            `• TOP 10: <b>${top10}</b> · TOP 20: <b>${top20}</b> · Con datos: <b>${ranked.length}/${results.length}</b>`,
            `• Clics totales: <b>${totalClicks}</b> · Impresiones: <b>${totalImpressions}</b>`,
            best ? `• 🏆 Mejor posición: "<i>${best.keyword}</i>" — pos. ${best.position}` : '',
            '',
            '🏆 TOP 3 · 🟢 TOP 10 · 🟡 TOP 20 · 🔴 >20 · ⚪ sin datos',
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
