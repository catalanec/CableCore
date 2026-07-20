import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

async function loadTelegram() {
    vi.resetModules();
    return import('./telegram');
}

describe('telegram notifications', () => {
    let fetchMock: ReturnType<typeof vi.fn>;
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        process.env = { ...ORIGINAL_ENV, TELEGRAM_BOT_TOKEN: 'bot-token', TELEGRAM_CHAT_ID: 'chat-id' };
        fetchMock = vi.fn(() => Promise.resolve({ ok: true, text: () => Promise.resolve('') }));
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        process.env = ORIGINAL_ENV;
        vi.unstubAllGlobals();
    });

    describe('notifyNewLead', () => {
        it('sends a formatted message and returns true on success', async () => {
            const { notifyNewLead } = await loadTelegram();
            const result = await notifyNewLead({ name: 'Alice', phone: '600111222', email: 'a@b.com', service: 'fibra', message: 'Urgente' });
            expect(result).toBe(true);
            expect(fetchMock).toHaveBeenCalledTimes(1);
            const [url, options] = fetchMock.mock.calls[0];
            expect(url).toContain('api.telegram.org/botbot-token/sendMessage');
            const body = JSON.parse(options.body);
            expect(body.text).toContain('Alice');
            expect(body.text).toContain('600111222');
            expect(body.text).toContain('fibra');
            expect(body.text).toContain('Urgente');
        });

        it('escapes angle brackets in user-supplied fields to prevent disguised links', async () => {
            const { notifyNewLead } = await loadTelegram();
            await notifyNewLead({ name: '<a href="evil">Bob</a>', phone: '600111222', email: 'a@b.com' });
            const body = JSON.parse(fetchMock.mock.calls[0][1].body);
            expect(body.text).not.toContain('<a href="evil">');
            expect(body.text).toContain('&lt;a href="evil"&gt;Bob&lt;/a&gt;');
        });

        it('omits optional service/message lines when not provided', async () => {
            const { notifyNewLead } = await loadTelegram();
            await notifyNewLead({ name: 'Alice', phone: '600111222', email: 'a@b.com' });
            const body = JSON.parse(fetchMock.mock.calls[0][1].body);
            expect(body.text).not.toContain('Servicio:');
            expect(body.text).not.toContain('Mensaje:');
            expect(body.text).toContain('Formulario de contacto');
        });

        it('builds a WhatsApp link that strips non-digits and a leading country code', async () => {
            const { notifyNewLead } = await loadTelegram();
            await notifyNewLead({ name: 'Alice', phone: '+34 600-111-222', email: 'a@b.com' });
            const body = JSON.parse(fetchMock.mock.calls[0][1].body);
            expect(body.text).toContain('https://wa.me/34600111222');
        });

        it('returns false without calling fetch when Telegram credentials are missing', async () => {
            process.env.TELEGRAM_BOT_TOKEN = '';
            const { notifyNewLead } = await loadTelegram();
            const result = await notifyNewLead({ name: 'Alice', phone: '600111222', email: 'a@b.com' });
            expect(result).toBe(false);
            expect(fetchMock).not.toHaveBeenCalled();
        });

        it('returns false when the Telegram API responds with a non-OK status', async () => {
            fetchMock.mockResolvedValue({ ok: false, text: () => Promise.resolve('bad request') });
            const { notifyNewLead } = await loadTelegram();
            const result = await notifyNewLead({ name: 'Alice', phone: '600111222', email: 'a@b.com' });
            expect(result).toBe(false);
        });

        it('returns false when fetch itself throws', async () => {
            fetchMock.mockRejectedValue(new Error('network down'));
            const { notifyNewLead } = await loadTelegram();
            const result = await notifyNewLead({ name: 'Alice', phone: '600111222', email: 'a@b.com' });
            expect(result).toBe(false);
        });
    });

    describe('notifyNewQuote', () => {
        const baseQuote = {
            clientName: 'Bob', clientPhone: '600111222', clientEmail: 'bob@example.com',
            cableType: 'cat6', networkPoints: 5, installationType: 'superficial', total: 1234.5, quoteNumber: 'CC-1',
        };

        it('sends a formatted message including cable type, points, and total', async () => {
            const { notifyNewQuote } = await loadTelegram();
            const result = await notifyNewQuote(baseQuote);
            expect(result).toBe(true);
            const body = JSON.parse(fetchMock.mock.calls[0][1].body);
            expect(body.text).toContain('CAT6');
            expect(body.text).toContain('5');
            expect(body.text).toContain('superficial');
            expect(body.text).toContain('1234.50€');
        });

        it('omits the installation type line when it is "external"', async () => {
            const { notifyNewQuote } = await loadTelegram();
            await notifyNewQuote({ ...baseQuote, installationType: 'external' });
            const body = JSON.parse(fetchMock.mock.calls[0][1].body);
            expect(body.text).not.toContain('Instalación:');
        });

        it('omits the network points line when networkPoints is 0', async () => {
            const { notifyNewQuote } = await loadTelegram();
            await notifyNewQuote({ ...baseQuote, networkPoints: 0 });
            const body = JSON.parse(fetchMock.mock.calls[0][1].body);
            expect(body.text).not.toContain('Puntos de red:');
        });

        it('returns false when Telegram credentials are missing', async () => {
            process.env.TELEGRAM_CHAT_ID = '';
            const { notifyNewQuote } = await loadTelegram();
            const result = await notifyNewQuote(baseQuote);
            expect(result).toBe(false);
        });
    });
});
