/**
 * Telegram Bot Notification Helper
 * Sends instant messages to the business owner when new leads/quotes come in.
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

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
        `👤 <b>Nombre:</b> ${data.name}`,
        `📞 <b>Teléfono:</b> ${data.phone}`,
        `📧 <b>Email:</b> ${data.email}`,
        data.service ? `🔧 <b>Servicio:</b> ${data.service}` : '',
        data.message ? `💬 <b>Mensaje:</b> ${data.message}` : '',
        `📍 <b>Origen:</b> ${data.source || 'Formulario de contacto'}`,
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
        `📋 <b>Nº:</b> ${data.quoteNumber}`,
        `👤 <b>Cliente:</b> ${data.clientName}`,
        `📞 <b>Teléfono:</b> ${data.clientPhone}`,
        `📧 <b>Email:</b> ${data.clientEmail}`,
        '',
        `🔌 <b>Cable:</b> ${data.cableType.toUpperCase()}`,
        `📍 <b>Puntos de red:</b> ${data.networkPoints}`,
        `🏗️ <b>Instalación:</b> ${data.installationType}`,
        `💶 <b>TOTAL: ${data.total.toFixed(2)}€</b>`,
        '',
        `⚡ <b>¡Llama al cliente ahora!</b>`,
        `📲 <a href="https://wa.me/34${data.clientPhone.replace(/\D/g, '').replace(/^34/, '')}">Responder por WhatsApp</a>`,
    ].join('\n');

    return sendTelegramMessage(text);
}
