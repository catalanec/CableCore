import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    trackEvent,
    trackLeadSubmit,
    trackWhatsAppClick,
    trackPhoneClick,
    trackCalculatorOpen,
    trackCalculatorQuoteRequest,
    trackBlogView,
    trackCTAClick,
} from './analytics';

describe('analytics', () => {
    let gtagMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        gtagMock = vi.fn();
        // @ts-expect-error - test stub of the browser global
        globalThis.window = { gtag: gtagMock };
    });

    describe('trackEvent', () => {
        it('calls window.gtag with event name and params', () => {
            trackEvent('custom_event', { value: 1 });
            expect(gtagMock).toHaveBeenCalledWith('event', 'custom_event', { value: 1 });
        });

        it('calls window.gtag with undefined params when none provided', () => {
            trackEvent('custom_event');
            expect(gtagMock).toHaveBeenCalledWith('event', 'custom_event', undefined);
        });

        it('is a no-op when window is undefined (SSR)', () => {
            // @ts-expect-error - simulate server environment
            delete globalThis.window;
            expect(() => trackEvent('custom_event')).not.toThrow();
        });

        it('is a no-op when window.gtag is not yet loaded', () => {
            // @ts-expect-error - simulate GA script not loaded yet
            globalThis.window = {};
            expect(() => trackEvent('custom_event')).not.toThrow();
            expect(gtagMock).not.toHaveBeenCalled();
        });
    });

    it('trackLeadSubmit defaults event_label to contact_form when service is omitted', () => {
        trackLeadSubmit();
        expect(gtagMock).toHaveBeenCalledWith('event', 'generate_lead', {
            event_category: 'leads',
            event_label: 'contact_form',
            value: 1,
        });
    });

    it('trackLeadSubmit uses provided service as event_label', () => {
        trackLeadSubmit('fibra-optica');
        expect(gtagMock).toHaveBeenCalledWith('event', 'generate_lead', {
            event_category: 'leads',
            event_label: 'fibra-optica',
            value: 1,
        });
    });

    it('trackWhatsAppClick reports the click location', () => {
        trackWhatsAppClick('footer');
        expect(gtagMock).toHaveBeenCalledWith('event', 'whatsapp_click', {
            event_category: 'engagement',
            event_label: 'footer',
        });
    });

    it('trackPhoneClick reports the click location', () => {
        trackPhoneClick('header');
        expect(gtagMock).toHaveBeenCalledWith('event', 'phone_click', {
            event_category: 'engagement',
            event_label: 'header',
        });
    });

    it('trackCalculatorOpen reports the calculator type', () => {
        trackCalculatorOpen('fiber');
        expect(gtagMock).toHaveBeenCalledWith('event', 'calculator_open', {
            event_category: 'calculator',
            event_label: 'fiber',
        });
    });

    it('trackCalculatorQuoteRequest rounds the total and sets EUR currency', () => {
        trackCalculatorQuoteRequest('ethernet', 199.6);
        expect(gtagMock).toHaveBeenCalledWith('event', 'calculator_quote_request', {
            event_category: 'calculator',
            event_label: 'ethernet',
            value: 200,
            currency: 'EUR',
        });
    });

    it('trackCalculatorQuoteRequest handles a zero total', () => {
        trackCalculatorQuoteRequest('fiber', 0);
        expect(gtagMock).toHaveBeenCalledWith('event', 'calculator_quote_request', {
            event_category: 'calculator',
            event_label: 'fiber',
            value: 0,
            currency: 'EUR',
        });
    });

    it('trackBlogView reports the article slug', () => {
        trackBlogView('cat6-vs-cat6a');
        expect(gtagMock).toHaveBeenCalledWith('event', 'blog_view', {
            event_category: 'content',
            event_label: 'cat6-vs-cat6a',
        });
    });

    it('trackCTAClick reports the CTA location', () => {
        trackCTAClick('hero');
        expect(gtagMock).toHaveBeenCalledWith('event', 'cta_click', {
            event_category: 'engagement',
            event_label: 'hero',
        });
    });
});
