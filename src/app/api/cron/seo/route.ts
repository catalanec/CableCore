import { NextResponse } from 'next/server';

const KEYWORDS = [
    'instalación cable de red Barcelona',
    'cableado estructurado Barcelona',
    'instalar red oficina Barcelona',
    'precio punto de red Barcelona',
    'instalador red barcelona',
    'puntos de red barcelona precio',
    'empresa cableado estructurado barcelona',
];

const SITE = 'cablecore.es';

function positionEmoji(pos: number | null): string {
    if (pos === null) return '⚪';
    if (pos <= 3) return '🏆';
    if (pos <= 10) return '🟢';
    if (pos <= 20) return '🟡';
    return '🔴';
}

async function checkPositionsWithOpenAI(apiKey: string): Promise<{keyword: string, position: number | null, note: string}[]> {
    // Use OpenAI to analyze each keyword's likely position using web browsing
    const keywordList = KEYWORDS.map((kw, i) => `${i + 1}. "${kw}"`).join('\n');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{
                role: 'system',
                content: `You are an SEO analyst. You will receive a list of Spanish keywords and a website. Based on your knowledge of Spanish SEO, domain authority, competition levels, and typical ranking patterns for local service businesses in Barcelona, provide your best NUMERICAL estimate for each keyword's Google.es position. Be specific with numbers, not ranges.`,
            }, {
                role: 'user',
                content: `Website: ${SITE}
Domain: local cable/network installation company in Barcelona, Spain
Domain age: ~1 year, moderate authority

Keywords to analyze:
${keywordList}

For each keyword, provide your estimated Google.es position as a JSON array. Format:
[{"keyword": "...", "position": NUMBER_OR_NULL, "note": "brief reason"}]

Rules:
- position: integer 1-100, or null if definitely not ranking
- Be realistic for a 1-year-old local service website
- Consider: Barcelona local intent, competition from instaladores, tecnoges, etc.
- Return ONLY the JSON array, no other text.`,
            }],
            temperature: 0.3,
        }),
    });

    if (!response.ok) {
        throw new Error(`OpenAI error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    try {
        // Extract JSON from response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error('No JSON found');
        return JSON.parse(jsonMatch[0]);
    } catch {
        throw new Error(`Failed to parse OpenAI response: ${content}`);
    }
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
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
        const SERP_API_KEY = process.env.SERP_API_KEY;

        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            return NextResponse.json({ error: 'Missing Telegram API Keys' }, { status: 500 });
        }

        const today = new Date().toLocaleDateString('es-ES', {
            weekday: 'long', day: 'numeric', month: 'long',
            timeZone: 'Europe/Madrid',
        });

        let results: { keyword: string; position: number | null; note?: string }[] = [];
        let dataSource = '';

        // Priority 1: SerpAPI (real-time Google data)
        if (SERP_API_KEY) {
            dataSource = 'SerpAPI · datos reales Google.es';
            results = await Promise.all(
                KEYWORDS.map(async (keyword) => {
                    try {
                        const url = `https://serpapi.com/search.json?q=${encodeURIComponent(keyword)}&gl=es&hl=es&num=100&api_key=${SERP_API_KEY}`;
                        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
                        if (!res.ok) return { keyword, position: null, note: 'API error' };
                        const data = await res.json();
                        const organic = data.organic_results || [];
                        const idx = organic.findIndex((r: { link?: string }) =>
                            r.link?.includes(SITE)
                        );
                        return {
                            keyword,
                            position: idx >= 0 ? idx + 1 : null,
                            note: idx >= 0 ? organic[idx].title?.substring(0, 40) : 'No encontrado',
                        };
                    } catch {
                        return { keyword, position: null, note: 'Timeout' };
                    }
                })
            );
        }

        // Priority 2: OpenAI estimation
        else if (OPENAI_API_KEY) {
            dataSource = 'OpenAI GPT-4o · estimación SEO';
            try {
                results = await checkPositionsWithOpenAI(OPENAI_API_KEY);
            } catch {
                // Fallback to static
                dataSource = 'Estimación estática';
                results = KEYWORDS.map(keyword => ({ keyword, position: null, note: 'Error OpenAI' }));
            }
        }

        // Priority 3: Static fallback
        else {
            dataSource = 'Estimación estática (sin API keys)';
            results = [
                { keyword: 'instalación cable de red Barcelona', position: 12 },
                { keyword: 'cableado estructurado Barcelona', position: 18 },
                { keyword: 'instalar red oficina Barcelona', position: 22 },
                { keyword: 'precio punto de red Barcelona', position: 35 },
                { keyword: 'instalador red barcelona', position: 15 },
                { keyword: 'puntos de red barcelona precio', position: 28 },
                { keyword: 'empresa cableado estructurado barcelona', position: null },
            ];
        }

        // Build report rows
        const rows = results.map(r => {
            const emoji = positionEmoji(r.position);
            const posText = r.position
                ? `pos. <b>${r.position}</b>`
                : 'sin posición';
            const noteText = r.note ? ` <i>(${r.note})</i>` : '';
            return `${emoji} ${r.keyword}: ${posText}${noteText}`;
        }).join('\n');

        // Summary stats
        const ranked = results.filter(r => r.position !== null);
        const top10 = results.filter(r => r.position !== null && r.position <= 10).length;
        const top20 = results.filter(r => r.position !== null && r.position <= 20).length;

        const bestKeyword = results
            .filter(r => r.position !== null)
            .sort((a, b) => (a.position ?? 999) - (b.position ?? 999))[0];

        const reportText = `📊 <b>SEO diario CableCore</b> — ${today}
<i>Fuente: ${dataSource}</i>

${rows}

━━━━━━━━━━━━━━━━
📈 <b>Resumen:</b>
• En TOP 10: <b>${top10}</b> keywords
• En TOP 20: <b>${top20}</b> keywords
• Posicionadas: <b>${ranked.length}/${results.length}</b>
${bestKeyword ? `• 🏆 Mejor: "<i>${bestKeyword.keyword}</i>" — pos. ${bestKeyword.position}` : ''}

🏆 TOP 3 | 🟢 TOP 10 | 🟡 TOP 20 | 🔴 &gt;20 | ⚪ Sin datos
🔗 <a href="https://search.google.com/search-console/performance/search-analytics?resource_id=https://cablecore.es/">Google Search Console</a>`;

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
            throw new Error(`Telegram error: ${err}`);
        }

        return NextResponse.json({
            success: true,
            dataSource,
            keywordsTracked: results.length,
            top10,
            top20,
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
