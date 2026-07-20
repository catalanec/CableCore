import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const sendMailMock = vi.fn((..._args: unknown[]) => Promise.resolve({ messageId: 'msg-1' }));
vi.mock('nodemailer', () => ({
    default: {
        createTransport: vi.fn(() => ({ sendMail: sendMailMock })),
    },
}));

async function loadEmail() {
    vi.resetModules();
    return import('./email');
}

describe('lib/email', () => {
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        process.env = { ...ORIGINAL_ENV, SMTP_PASS: 'secret', SMTP_USER: 'info@cablecore.es' };
        sendMailMock.mockClear();
    });

    afterEach(() => {
        process.env = ORIGINAL_ENV;
    });

    describe('esc', () => {
        it('escapes HTML-sensitive characters', async () => {
            const { esc } = await loadEmail();
            expect(esc(`<script>alert("x")</script>&'`)).toBe('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;&amp;&#039;');
        });

        it('returns an empty string for null/undefined/empty input', async () => {
            const { esc } = await loadEmail();
            expect(esc(null)).toBe('');
            expect(esc(undefined)).toBe('');
            expect(esc('')).toBe('');
        });
    });

    describe('sendLeadNotification', () => {
        const leadData = { name: 'Alice', phone: '600111222', email: 'alice@example.com', service: 'fibra', message: 'Hola', source: 'contact_form' };

        it('sends an admin email and a client email when an email address is provided', async () => {
            const { sendLeadNotification } = await loadEmail();
            await sendLeadNotification(leadData);
            expect(sendMailMock).toHaveBeenCalledTimes(2);
            const [adminCall, clientCall] = sendMailMock.mock.calls;
            expect(adminCall[0].to).toBe('info@cablecore.es');
            expect(adminCall[0].html).toContain('Alice');
            expect(clientCall[0].to).toBe('alice@example.com');
        });

        it('skips sending entirely when SMTP_PASS is not configured', async () => {
            process.env.SMTP_PASS = '';
            const { sendLeadNotification } = await loadEmail();
            await sendLeadNotification(leadData);
            expect(sendMailMock).not.toHaveBeenCalled();
        });

        it('does not throw when transporter.sendMail rejects', async () => {
            sendMailMock.mockRejectedValueOnce(new Error('smtp down'));
            const { sendLeadNotification } = await loadEmail();
            await expect(sendLeadNotification(leadData)).resolves.toBeUndefined();
        });

        it('escapes user-supplied fields in the generated HTML', async () => {
            const { sendLeadNotification } = await loadEmail();
            await sendLeadNotification({ ...leadData, name: '<img src=x onerror=alert(1)>' });
            const html = sendMailMock.mock.calls[0][0].html as string;
            expect(html).not.toContain('<img src=x onerror=alert(1)>');
        });
    });

    describe('sendQuoteNotification', () => {
        const quoteData = {
            clientName: 'Bob', clientPhone: '600111222', clientEmail: 'bob@example.com',
            cableType: 'cat6', cableMeters: 50, networkPoints: 5, installationType: 'superficial',
            total: 1234.567, quoteNumber: 'CC-1',
        };

        it('sends admin and client emails with the formatted total', async () => {
            const { sendQuoteNotification } = await loadEmail();
            await sendQuoteNotification(quoteData);
            expect(sendMailMock).toHaveBeenCalledTimes(2);
            const adminHtml = sendMailMock.mock.calls[0][0].html as string;
            expect(adminHtml).toContain('1234.57€');
            expect(adminHtml).toContain('CC-1');
        });

        it('skips sending entirely when SMTP_PASS is not configured', async () => {
            process.env.SMTP_PASS = '';
            const { sendQuoteNotification } = await loadEmail();
            await sendQuoteNotification(quoteData);
            expect(sendMailMock).not.toHaveBeenCalled();
        });

        it('does not throw when transporter.sendMail rejects', async () => {
            sendMailMock.mockRejectedValueOnce(new Error('smtp down'));
            const { sendQuoteNotification } = await loadEmail();
            await expect(sendQuoteNotification(quoteData)).resolves.toBeUndefined();
        });
    });
});
