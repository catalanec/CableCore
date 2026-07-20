import { NextResponse } from 'next/server';

export const maxDuration = 60; // Allow function to run up to 60 seconds (critical for LLM generation)
export const dynamic = 'force-dynamic';

async function sendTelegramMessage(message: string) {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    if (!BOT_TOKEN || !CHAT_ID) return;

    try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML',
            }),
        });
    } catch (e) {
        console.error('Failed to send telegram message', e);
    }
}

export async function GET(request: Request) {
    const CRON_SECRET = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');
    
    // Auth validation
    if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_REPO = 'catalanec/CableCore';
    const GITHUB_FILE_PATH = 'src/lib/blog-data.json';

    if (!OPENAI_API_KEY || !GITHUB_TOKEN) {
        await sendTelegramMessage(`⚠️ <b>Error (Blog Agent):</b> Faltan variables de entorno (OPENAI_API_KEY o GITHUB_TOKEN) en Vercel.`);
        return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
    }

    try {
        // 1. Fetch current blog-data.json from GitHub
        const ghResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'CableCore-BlogAgent'
            }
        });

        if (!ghResponse.ok) {
            throw new Error(`GitHub API error: ${ghResponse.statusText}`);
        }

        const ghData = await ghResponse.json();
        const fileSha = ghData.sha;
        const currentBlogsStr = Buffer.from(ghData.content, 'base64').toString('utf-8');
        const currentBlogs = JSON.parse(currentBlogsStr);

        // Extract existing slugs AND titles — dedup by exact slug alone let the
        // same topic get regenerated under a slightly different slug/wording
        // repeatedly (round 17 audit found 3-5 near-duplicate articles per
        // topic cluster), which is what drove GSC's "Crawled - currently not
        // indexed" count up: Google saw a small site publishing many
        // thin/redundant pages and stopped indexing most of them.
        const existingSlugs = currentBlogs.map((b: any) => b.slug);
        const existingTitles = currentBlogs.map((b: any) => b.es?.title).filter(Boolean);

        // 2. Draft Prompt
        const prompt = `You are an expert SEO content writer for a network cable installation company in Barcelona (CableCore).
Generate a deep, professional tech blog post translated accurately into 3 languages (ES, EN, RU).

### RULES:
- Output exactly as a pure JSON object. No Markdown wrappers.
- Use this precise JSON schema:
{
  "slug": "unique-kebab-case-slug",
  "date": "YYYY-MM-DD",
  "readTime": "X min",
  "es": { "title": "", "metaTitle": "", "metaDescription": "", "excerpt": "", "category": "Guías", "tags": ["redes"], "content": [ { "type": "h2", "text": "Heading" }, { "type": "p", "text": "Paragraph" }, { "type": "ul", "items": ["item1"] }, { "type": "tip", "text": "💡 Tip here" } ] },
  "en": { ... },
  "ru": { ... }
}
- For "type": "ul", provide an array in the "items" field. For others (h2, h3, p, tip), provide text in the "text" field.
- Topics to choose from (pick ONE that is NOT semantically close to any existing slug or title below — a rewording of an already-covered topic is NOT acceptable, pick a genuinely distinct one):
   1. WiFi 6 vs WiFi 6E para oficinas en Barcelona
   2. Cableado estructurado en naves industriales: consideraciones
   3. Certificación de red con Fluke Networks: por qué es vital
   4. Rack de servidores doméstico: Guía de inicio
   5. Diferencia entre UTP, FTP y STP en entornos ruidosos
   6. Fibra óptica monomodo vs multimodo: cuándo usar cada una
   7. Cómo diseñar un cuarto de telecomunicaciones (MDF/IDF) para una PYME
   8. Migración de red de Cat5e a Cat6A: cuándo merece la pena
   9. Redes VLAN para separar invitados, IoT y administración en una oficina
   10. QoS y priorización de tráfico VoIP en redes corporativas pequeñas
   11. Cableado de red para coworkings y espacios de oficina compartida
   12. Puesta a tierra y protección contra sobretensiones en racks de red
   13. Redundancia de red: switches en anillo vs topología en estrella
   14. Checklist de mantenimiento anual de una red de cableado estructurado
   15. Cableado de red para tiendas y comercio minorista (TPV, cámaras, WiFi cliente)
   16. Cómo elegir un switch PoE: presupuesto de potencia y número de puertos
   17. Errores comunes al etiquetar cableado estructurado (y cómo evitarlos)
   18. Diferencias entre fibra FTTH y fibra dedicada para empresas
   19. Redes para eventos y ferias temporales: cableado desmontable
   20. Cableado de red para restaurantes y hostelería (TPV, cocina, WiFi cliente)
- Existing slugs already covered (do not repeat this exact topic): [${existingSlugs.join(', ')}]
- Existing article titles already covered (do not pick a topic that overlaps with any of these, even under different wording): [${existingTitles.join(' | ')}]
- Depth requirement: each language version must be substantial and genuinely useful — target 1200-1500+ words per language (NOT a short overview). Structure it as 6-9 distinct H2 sections covering: what the technology/practice is, why it matters, concrete technical specifications or standards involved, a practical how-to or decision-making section, common mistakes, and pricing or real-world context specific to Barcelona/Spain where relevant. Avoid generic filler — every section should contain specific technical facts, numbers, standards, or brand/model examples, not vague marketing language.`;

        // 3. Generate article with OpenAI
        const dateNow = new Date().toISOString().split('T')[0];
        
        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                response_format: { type: 'json_object' },
                messages: [
                    { role: 'system', content: 'You are an autonomous blog JSON generation engine for a Next.js platform.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.6,
                // Bumped from 6000: three languages x 1200-1500+ words each
                // (the new depth requirement, replacing the old "5-8 content
                // blocks" target that produced ~250-350 word articles) needs
                // considerably more headroom, plus JSON structure overhead.
                max_tokens: 16000
            })
        });

        if (!aiResponse.ok) {
            const aiData = await aiResponse.json();
            throw new Error(`OpenAI error: ${aiData.error?.message || 'Unknown error'}`);
        }

        const aiData = await aiResponse.json();
        const articleJsonStr = aiData.choices[0].message.content;
        
        const newArticle = JSON.parse(articleJsonStr);
        newArticle.date = dateNow; // Ensure absolute current date format

        // 4. Prepend to current blogs
        currentBlogs.unshift(newArticle);
        const updatedBlogsStr = JSON.stringify(currentBlogs, null, 2) + '\n';
        const updatedContentBase64 = Buffer.from(updatedBlogsStr).toString('base64');

        // 5. Commit to GitHub
        const commitResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'CableCore-BlogAgent',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `content: auto-publish blog article '${newArticle.slug}'`,
                content: updatedContentBase64,
                sha: fileSha
            })
        });

        if (!commitResponse.ok) {
            throw new Error(`GitHub Commit error: ${commitResponse.statusText}`);
        }

        const articleUrl = `https://cablecore.es/es/blog/${newArticle.slug}`;

        // 6. Notify success
        await sendTelegramMessage(
            `🚀 <b>¡Nueva publicación en el Blog! (Auto-Agent)</b>\n\n` +
            `📝 <b>Tema:</b> ${newArticle.es.title}\n` +
            `🔗 <b>Enlace:</b> <a href="${articleUrl}">${articleUrl}</a>\n\n` +
            `<i>La web se está reconstruyendo y la página estará disponible en un minuto.</i>`
        );

        return NextResponse.json({ success: true, slug: newArticle.slug });

    } catch (error: any) {
        await sendTelegramMessage(`❌ <b>Error (Blog Agent):</b> ${error.message}`);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
