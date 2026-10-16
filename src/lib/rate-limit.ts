/**
 * Best-effort per-IP rate limit for the public form endpoints
 * (/api/leads, /api/quotes). Each accepted submission writes a row and sends
 * an e-mail plus a Telegram message, so an unthrottled bot can flood the CRM
 * and the notification channels.
 *
 * State lives in the memory of one serverless instance: it stops a single
 * client hammering the endpoint, not a distributed attack. For that, add a
 * rate-limit rule in the Vercel Firewall or Cloudflare (see CLAUDE.md).
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 5000;

export function clientIp(headers: Headers): string {
    return (
        headers.get('cf-connecting-ip') ||
        headers.get('x-real-ip') ||
        headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        'unknown'
    );
}

/** Returns true when the request is allowed, false when over the limit. */
export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
        if (buckets.size >= MAX_KEYS) {
            buckets.forEach((b, k) => {
                if (b.resetAt <= now) buckets.delete(k);
            });
            if (buckets.size >= MAX_KEYS) buckets.clear();
        }
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return true;
    }
    if (bucket.count >= limit) return false;
    bucket.count += 1;
    return true;
}

export function resetRateLimits(): void {
    buckets.clear();
}

/** Form submissions: 5 per IP per 10 minutes, per endpoint. */
export const FORM_LIMIT = 5;
export const FORM_WINDOW_MS = 10 * 60 * 1000;
