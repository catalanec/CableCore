/**
 * Telegram Bot Notification Helper
 * Sends instant messages to the business owner when new leads/quotes come in.
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Telegram's parse_mode:'HTML' supports a small tag allowlist (<b>, <a href>, ...).
// User-supplied text must be escaped so a crafted "<a href=...>" in a lead's
// name/message can't render as a disguised clickable link in the owner's chat.
function escTg(s: string | undefined | null): string {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function sendTelegramMessage(text: string): Promise<boolean> {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.warn('Telegram not configured: missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
        return false;
    }

    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text,
                parse_mode: 'HTML',
                disable_web_page_preview: true,
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('Telegram API error:', err);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Telegram send error:', error);
        return false;
    }
}

/** Notify about a new contact form lead */
export async function notifyNewLead(data: {
    name: string;
    phone: string;
    email: string;
    service?: string;
    message?: string;
    source?: string;
}): Promise<boolean> {
    const text = [
        '🔔 <b>Nueva solicitud — CableCore</b>',
        '',
        `👤 <b>Nombre:</b> ${escTg(data.name)}`,
        `📞 <b>Teléfono:</b> ${escTg(data.phone)}`,
        `📧 <b>Email:</b> ${escTg(data.email)}`,
        data.service ? `🔧 <b>Servicio:</b> ${escTg(data.service)}` : '',
        data.message ? `💬 <b>Mensaje:</b> ${escTg(data.message)}` : '',
        `📍 <b>Origen:</b> ${escTg(data.source || 'Formulario de contacto')}`,
        '',
        `⚡ <b>Responde rápido para ganar el cliente!</b>`,
        `📲 <a href="https://wa.me/34${data.phone.replace(/\D/g, '').replace(/^34/, '')}">Responder por WhatsApp</a>`,
    ].filter(Boolean).join('\n');

    return sendTelegramMessage(text);
}

/** Notify about a new calculator quote */
export async function notifyNewQuote(data: {
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    cableType: string;
    networkPoints: number;
    installationType: string;
    total: number;
    quoteNumber: string;
}): Promise<boolean> {
    const text = [
        '💰 <b>Nuevo presupuesto — CableCore</b>',
        '',
        `📋 <b>Nº:</b> ${escTg(data.quoteNumber)}`,
        `👤 <b>Cliente:</b> ${escTg(data.clientName)}`,
        `📞 <b>Teléfono:</b> ${escTg(data.clientPhone)}`,
        `📧 <b>Email:</b> ${escTg(data.clientEmail)}`,
        '',
        data.cableType ? `🔌 <b>Cable:</b> ${escTg(data.cableType.toUpperCase())}` : '',
        data.networkPoints > 0 ? `📍 <b>Puntos de red:</b> ${data.networkPoints}` : '',
        data.installationType && data.installationType !== 'external' ? `🏗️ <b>Instalación:</b> ${escTg(data.installationType)}` : '',
        `💶 <b>TOTAL: ${data.total.toFixed(2)}€</b>`,
        '',
        `⚡ <b>¡Llama al cliente ahora!</b>`,
        `📲 <a href="https://wa.me/34${data.clientPhone.replace(/\D/g, '').replace(/^34/, '')}">Responder por WhatsApp</a>`,
    ].filter(Boolean).join('\n');

    return sendTelegramMessage(text);
}
