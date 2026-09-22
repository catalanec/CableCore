import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const ORIGINAL_ENV = process.env;

describe('telegram notifications', () => {
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        process.env = { ...ORIGINAL_ENV };
        delete process.env.TELEGRAM_BOT_TOKEN;
        delete process.env.TELEGRAM_CHAT_ID;
        fetchMock = vi.fn(() => Promise.resolve({ ok: true, text: () => Promise.resolve('{}') }));
        vi.stubGlobal('fetch', fetchMock);
        vi.resetModules();
    });

    afterEach(() => {
        process.env = ORIGINAL_ENV;
        vi.unstubAllGlobals();
    });

    // The credentials were read at module scope. Next.js evaluates a module
    // once and reuses it, so whatever process.env held at that moment is what
    // the module keeps for the life of the lambda — and quote notifications
    // stopped arriving while the cron, which reads env inside its handler,
    // kept working.
    it('reads the credentials when the message is sent, not when the module loads', async () => {
        const mod = await import('./telegram');

        process.env.TELEGRAM_BOT_TOKEN = 'bot-token';
        process.env.TELEGRAM_CHAT_ID = 'chat-id';

        const sent = await mod.notifyNewQuote({
            clientName: 'Cliente', clientPhone: '+34600000000', clientEmail: 'c@example.com',
            cableType: 'cat6', networkPoints: 2, installationType: 'superficie',
            total: 121, quoteNumber: 'CC-TEST-1',
        });

        expect(sent, 'credentials set after import must still be used').toBe(true);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(String(fetchMock.mock.calls[0][0])).toContain('bot-token');
    });

    it('reports failure loudly enough to find in the logs when credentials are missing', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const mod = await import('./telegram');

        const sent = await mod.notifyNewLead({
            name: 'Cliente', phone: '+34600000000', email: 'c@example.com',
        });

        expect(sent).toBe(false);
        expect(warn).toHaveBeenCalled();
        expect(fetchMock).not.toHaveBeenCalled();
        warn.mockRestore();
    });

    it('escapes user text so a crafted name cannot inject markup', async () => {
        process.env.TELEGRAM_BOT_TOKEN = 'bot-token';
        process.env.TELEGRAM_CHAT_ID = 'chat-id';
        const mod = await import('./telegram');

        await mod.notifyNewLead({
            name: '<a href="http://evil">Pincha aquí</a>', phone: '+34600000000', email: 'c@example.com',
        });

        const body = String(fetchMock.mock.calls[0][1].body);
        expect(body).not.toContain('<a href="http://evil"');
        expect(body).toContain('&lt;a href=');
    });
});
