import { NextResponse } from 'next/server';

const SITE = 'cablecore.es';

const KEYWORDS = [
    'instalación cable de red Barcelona',
    'cableado estructurado Barcelona',
    'instalar red oficina Barcelona',
    'precio punto de red Barcelona',
    'instalador red barcelona',
    'puntos de red barcelona precio',
    'empresa cableado estructurado barcelona',
];

function positionEmoji(pos: number | null): string {
    if (pos === null) return '⚪';
    if (pos <= 3) return '🏆';
    if (pos <= 10) return '🟢';
    if (pos <= 20) return '🟡';
    return '🔴';
}

/**
 * Real rank check via Google Custom Search API
 * Searches pages 1-3 (30 results) to find our site
 */
async function checkRankWithGoogleCSE(
    keyword: string,
    apiKey: string,
    cx: string
): Promise<{ position: number | null; url: string | null }> {
    const MAX_PAGES = 3; // check first 30 results (3 pages × 10)

    for (let page = 0; page < MAX_PAGES; page++) {
        const start = page * 10 + 1;
        const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(keyword)}&gl=es&hl=es&num=10&start=${start}`;

        try {
            const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                console.error('CSE error:', err?.error?.message);
                return { position: null, url: null };
            }

            const data = await res.json();
            const items: { link: string; title?: string }[] = data.items || [];

            for (let i = 0; i < items.length; i++) {
                const link = items[i].link || '';
                if (link.includes(SITE)) {
                    return {
                        position: start + i,
                        url: link,
                    };
                }
            }

            // If fewer than 10 results, no point checking next page
            if (items.length < 10) break;
        } catch (err) {
            console.error(`CSE fetch error for "${keyword}":`, err);
            return { position: null, url: null };
        }
    }

    return { position: null, url: null }; // not in top 30
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
        const GOOGLE_CSE_API_KEY = process.env.GOOGLE_CSE_API_KEY;
        const GOOGLE_CSE_CX = process.env.GOOGLE_CSE_CX;

        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            return NextResponse.json({ error: 'Missing Telegram API Keys' }, { status: 500 });
        }

        const today = new Date().toLocaleDateString('es-ES', {
            weekday: 'long', day: 'numeric', month: 'long',
            timeZone: 'Europe/Madrid',
        });

        let results: { keyword: string; position: number | null; url: string | null }[] = [];
        let dataSource = '';

        if (GOOGLE_CSE_API_KEY && GOOGLE_CSE_CX) {
            // ✅ Real Google positions via Custom Search API
            dataSource = 'Google Custom Search · datos reales';

            results = await Promise.all(
                KEYWORDS.map(async (keyword) => {
                    const { position, url } = await checkRankWithGoogleCSE(
                        keyword, GOOGLE_CSE_API_KEY, GOOGLE_CSE_CX
                    );
                    return { keyword, position, url };
                })
            );
        } else {
            // Fallback: OpenAI estimation
            dataSource = 'Estimación (configura GOOGLE_CSE_API_KEY en Vercel)';
            results = KEYWORDS.map(kw => ({ keyword: kw, position: null, url: null }));
        }

        // Build rows
        const rows = results.map(r => {
            const emoji = positionEmoji(r.position);
            const posText = r.position !== null
                ? `pos. <b>${r.position}</b>`
                : 'no encontrado (pos. &gt;30)';
            return `${emoji} ${r.keyword}: ${posText}`;
        }).join('\n');

        // Stats
        const ranked = results.filter(r => r.position !== null);
        const top10 = ranked.filter(r => r.position! <= 10).length;
        const top20 = ranked.filter(r => r.position! <= 20).length;
        const best = ranked.sort((a, b) => (a.position ?? 999) - (b.position ?? 999))[0];

        const reportText = [
            `📊 <b>SEO diario CableCore</b> — ${today}`,
            `<i>Fuente: ${dataSource}</i>`,
            '',
            rows,
            '',
            '━━━━━━━━━━━━━━',
            `📈 <b>Resumen:</b>`,
            `• TOP 10: <b>${top10}</b> · TOP 20: <b>${top20}</b> · Indexadas: <b>${ranked.length}/${results.length}</b>`,
            best ? `• 🏆 Mejor: "<i>${best.keyword}</i>" — pos. ${best.position}` : '',
            '',
            '🏆 TOP 3 · 🟢 TOP 10 · 🟡 TOP 20 · 🔴 &gt;20 · ⚪ &gt;30',
            `🔗 <a href="https://search.google.com/search-console/performance/search-analytics?resource_id=https://cablecore.es/">Google Search Console</a>`,
        ].filter(l => l !== null).join('\n');

        const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: reportText,
                parse_mode: 'HTML',
                disable_web_page_preview: true,
            }),
        });

        if (!tgRes.ok) {
            const err = await tgRes.text();
            throw new Error(`Telegram error: ${err}`);
        }

        return NextResponse.json({
            success: true,
            dataSource,
            results: results.map(r => ({ keyword: r.keyword, position: r.position })),
            top10,
            top20,
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
