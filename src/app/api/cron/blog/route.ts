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
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
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

        // Extract existing slugs to avoid duplication
        const existingSlugs = currentBlogs.map((b: any) => b.slug);

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
- Topics to choose from (pick ONE that is NOT in this list of existing slugs: [${existingSlugs.join(', ')}]):
   1. WiFi 6 vs WiFi 6E para oficinas en Barcelona
   2. Cableado estructurado en naves industriales: consideraciones
   3. PoE+ (Power over Ethernet) para cámaras de seguridad e IP
   4. Certificación de red con Fluke Networks: por qué es vital
   5. Rack de servidores doméstico: Guía de inicio
   6. Diferencia entre UTP, FTP y STP en entornos ruidosos
- Make the content highly technical, SEO-optimized, engaging. Include around 5-8 content blocks per language.`;

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
                max_tokens: 6000
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
