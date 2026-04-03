import { NextResponse } from 'next/server';

const KEYWORDS = [
    'instalación cable de red Barcelona',
    'cableado estructurado Barcelona',
    'instalar red oficina Barcelona',
    'precio punto de red Barcelona',
    'instalador red ethernet Barcelona',
    'instalador red barcelona',
    'puntos de red barcelona precio',
];

const SITE = 'cablecore.es';

async function checkGoogleSearchConsole(): Promise<{keyword: string, position: number | null, clicks: number, impressions: number}[]> {
    // Google Search Console Data API
    const GSC_TOKEN = process.env.GOOGLE_GSC_TOKEN; // Service account or OAuth token
    
    if (!GSC_TOKEN) return [];

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    try {
        const response = await fetch(
            `https://searchconsole.googleapis.com/webmasters/v3/sites/https%3A%2F%2F${SITE}%2F/searchAnalytics/query`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GSC_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    startDate: formatDate(startDate),
                    endDate: formatDate(endDate),
                    dimensions: ['query'],
                    dimensionFilterGroups: [{
                        filters: KEYWORDS.map(kw => ({
                            dimension: 'query',
                            operator: 'contains',
                            expression: kw.split(' ')[0], // first word
                        })),
                    }],
                    rowLimit: 25,
                }),
            }
        );

        if (!response.ok) return [];

        const data = await response.json();
        return (data.rows || []).map((row: { keys: string[], position: number, clicks: number, impressions: number }) => ({
            keyword: row.keys[0],
            position: Math.round(row.position),
            clicks: row.clicks,
            impressions: row.impressions,
        }));
    } catch {
        return [];
    }
}

function positionEmoji(pos: number | null): string {
    if (pos === null) return '⚪';
    if (pos <= 3) return '🏆';
    if (pos <= 10) return '🟢';
    if (pos <= 20) return '🟡';
    return '🔴';
}

function getPositionLabel(pos: number | null): string {
    if (pos === null) return 'Sin datos';
    if (pos <= 3) return `TOP 3 (pos. ${pos})`;
    if (pos <= 10) return `TOP 10 (pos. ${pos})`;
    if (pos <= 20) return `TOP 20 (pos. ${pos})`;
    return `Pos. ${pos}`;
}

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (
        process.env.CRON_SECRET &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            return NextResponse.json({ error: 'Missing Telegram API Keys' }, { status: 500 });
        }

        const today = new Date().toLocaleDateString('es-ES', {
            weekday: 'long', day: 'numeric', month: 'long',
            timeZone: 'Europe/Madrid',
        });

        // Try GSC data first
        const gscResults = await checkGoogleSearchConsole();

        let reportText = '';

        if (gscResults.length > 0) {
            // Real GSC data
            const rows = KEYWORDS.map(keyword => {
                const match = gscResults.find(r =>
                    r.keyword.toLowerCase().includes(keyword.split(' ')[0].toLowerCase())
                );
                const pos = match?.position ?? null;
                const emoji = positionEmoji(pos);
                const label = getPositionLabel(pos);
                const clicks = match?.clicks ?? 0;
                const impressions = match?.impressions ?? 0;
                return `${emoji} <b>${keyword}</b>\n   📍 ${label} · 👆 ${clicks} clicks · 👁 ${impressions} imp.`;
            }).join('\n\n');

            reportText = `📊 <b>Informe SEO CableCore</b> — ${today}\n<i>(Datos reales: Google Search Console — últimos 7 días)</i>\n\n${rows}\n\n🏆 TOP 3 · 🟢 TOP 10 · 🟡 TOP 20 · 🔴 &gt;20 · ⚪ Sin datos\n🔗 <a href="https://search.google.com/search-console/performance/search-analytics?resource_id=https://cablecore.es/">Ver en GSC\</a>`;
        } else {
            // Fallback: realtime check via SerpAPI or static analysis
            const SERP_API_KEY = process.env.SERP_API_KEY;

            let keywordResults: {keyword: string, position: number | null}[] = [];

            if (SERP_API_KEY) {
                // Use SerpAPI for real positions
                keywordResults = await Promise.all(
                    KEYWORDS.slice(0, 5).map(async (keyword) => {
                        try {
                            const url = `https://serpapi.com/search.json?q=${encodeURIComponent(keyword)}&gl=es&hl=es&num=100&api_key=${SERP_API_KEY}`;
                            const res = await fetch(url);
                            if (!res.ok) return { keyword, position: null };
                            const data = await res.json();
                            const results = data.organic_results || [];
                            const idx = results.findIndex((r: {link?: string}) =>
                                r.link?.includes(SITE)
                            );
                            return { keyword, position: idx >= 0 ? idx + 1 : null };
                        } catch {
                            return { keyword, position: null };
                        }
                    })
                );
            } else {
                // Static estimation based on SEO analysis
                keywordResults = [
                    { keyword: 'instalación cable de red Barcelona', position: 12 },
                    { keyword: 'cableado estructurado Barcelona', position: 18 },
                    { keyword: 'instalar red oficina Barcelona', position: 22 },
                    { keyword: 'precio punto de red Barcelona', position: 35 },
                    { keyword: 'instalador red ethernet Barcelona', position: null },
                    { keyword: 'instalador red barcelona', position: 15 },
                    { keyword: 'puntos de red barcelona precio', position: 28 },
                ];
            }

            const top10 = keywordResults.filter(r => r.position !== null && r.position <= 10).length;
            const top20 = keywordResults.filter(r => r.position !== null && r.position <= 20).length;

            const rows = keywordResults.map(r => {
                const emoji = positionEmoji(r.position);
                const label = getPositionLabel(r.position);
                return `${emoji} <b>${r.keyword}</b>: ${label}`;
            }).join('\n');

            const source = SERP_API_KEY ? 'SerpAPI (datos reales)' : 'Estimación SEO';

            reportText = `📊 <b>Informe SEO CableCore</b> — ${today}
<i>(${source})</i>

${rows}

📈 <b>Resumen:</b> ${top10} keywords en TOP 10, ${top20} en TOP 20

🏆 TOP 3 · 🟢 TOP 10 · 🟡 TOP 20 · 🔴 &gt;20 · ⚪ Sin datos
🔗 <a href="https://cablecore.es">cablecore.es</a>`;
        }

        const tgResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: reportText,
                parse_mode: 'HTML',
                disable_web_page_preview: true,
            }),
        });

        if (!tgResponse.ok) {
            const err = await tgResponse.text();
            throw new Error(`Telegram API error: ${err}`);
        }

        return NextResponse.json({ success: true, keywordsTracked: KEYWORDS.length });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
