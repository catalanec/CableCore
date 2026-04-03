/**
 * Google Analytics 4 — Event tracking utilities
 * GA4 Property: G-TJV2HYNQ9L
 */

declare global {
    interface Window {
        gtag: (...args: unknown[]) => void;
        dataLayer: unknown[];
    }
}

type GtagParams = {
    event_category?: string;
    event_label?: string;
    value?: number;
    currency?: string;
    [key: string]: unknown;
};

/** Fire a GA4 event */
export function trackEvent(eventName: string, params?: GtagParams) {
    if (typeof window === 'undefined') return;
    if (!window.gtag) return;
    window.gtag('event', eventName, params);
}

/* ========================================
   LEAD / CONVERSION EVENTS
   ======================================== */

/** User submits contact form → Lead */
export function trackLeadSubmit(service?: string) {
    trackEvent('generate_lead', {
        event_category: 'leads',
        event_label: service || 'contact_form',
        value: 1,
    });
}

/** User clicks WhatsApp (any location) */
export function trackWhatsAppClick(location: string) {
    trackEvent('whatsapp_click', {
        event_category: 'engagement',
        event_label: location,
    });
}

/** User clicks phone number */
export function trackPhoneClick(location: string) {
    trackEvent('phone_click', {
        event_category: 'engagement',
        event_label: location,
    });
}

/* ========================================
   CALCULATOR EVENTS
   ======================================== */

/** User opens the calculator */
export function trackCalculatorOpen(type: 'ethernet' | 'fiber') {
    trackEvent('calculator_open', {
        event_category: 'calculator',
        event_label: type,
    });
}

/** User requests a quote from calculator */
export function trackCalculatorQuoteRequest(type: 'ethernet' | 'fiber', total: number) {
    trackEvent('calculator_quote_request', {
        event_category: 'calculator',
        event_label: type,
        value: Math.round(total),
        currency: 'EUR',
    });
}

/* ========================================
   CONTENT EVENTS
   ======================================== */

/** User views a blog post */
export function trackBlogView(slug: string) {
    trackEvent('blog_view', {
        event_category: 'content',
        event_label: slug,
    });
}

/** User clicks "Solicitar presupuesto" CTA */
export function trackCTAClick(location: string) {
    trackEvent('cta_click', {
        event_category: 'engagement',
        event_label: location,
    });
}
