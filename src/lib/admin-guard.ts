import { headers } from 'next/headers';
import { timingSafeEqual } from 'crypto';

/**
 * Authorization for server actions in `src/app/actions/crm.ts`.
 *
 * The /admin pages are behind Basic auth in middleware, but a server action is
 * a POST endpoint of its own: Next.js forwards an action ID to whichever worker
 * owns it, so an action can be invoked by POSTing to a public page that the
 * middleware lets through. Every exported action therefore checks the caller
 * itself instead of trusting the page it was rendered on.
 *
 * Accepted credentials:
 *  - Basic auth with ADMIN_USER / ADMIN_PASSWORD — the browser re-sends these
 *    automatically after the /admin login, same as it does for /api/photos.
 *  - Bearer CRON_SECRET — for Vercel crons that call actions directly
 *    (e.g. /api/cron/leads-followup → notifyStaleLeads).
 */

function safeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
        timingSafeEqual(bufA, bufA);
        return false;
    }
    return timingSafeEqual(bufA, bufB);
}

export function isAuthorizedAdminHeader(authHeader: string | null): boolean {
    if (!authHeader) return false;
    const [scheme, value] = authHeader.split(' ');
    if (!scheme || !value) return false;

    if (scheme === 'Basic') {
        const adminUser = process.env.ADMIN_USER;
        const adminPass = process.env.ADMIN_PASSWORD;
        if (!adminUser || !adminPass) return false;
        let decoded: string;
        try {
            decoded = Buffer.from(value, 'base64').toString('utf8');
        } catch {
            return false;
        }
        const sep = decoded.indexOf(':');
        if (sep < 0) return false;
        const user = decoded.slice(0, sep);
        const pwd = decoded.slice(sep + 1);
        // Evaluate both comparisons so timing doesn't reveal which one failed.
        const userOk = safeEqual(user, adminUser);
        const passOk = safeEqual(pwd, adminPass);
        return userOk && passOk;
    }

    if (scheme === 'Bearer') {
        const cronSecret = process.env.CRON_SECRET;
        if (!cronSecret) return false;
        return safeEqual(value, cronSecret);
    }

    return false;
}

export async function assertAdmin(): Promise<void> {
    const authHeader = headers().get('authorization');
    if (!isAuthorizedAdminHeader(authHeader)) {
        throw new Error('Unauthorized');
    }
}
