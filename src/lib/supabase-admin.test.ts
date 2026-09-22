import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const ORIGINAL_ENV = process.env;

describe('createAdminClient', () => {
    beforeEach(() => {
        process.env = { ...ORIGINAL_ENV };
        vi.resetModules();
    });
    afterEach(() => {
        process.env = ORIGINAL_ENV;
        vi.unstubAllGlobals();
    });

    // The admin dashboard read stale rows for days: quotes and leads were in the
    // database, the page showed the state of an earlier deploy. supabase-js goes
    // through global fetch, Next.js caches fetch results in a Data Cache, and on
    // Vercel that cache outlives a deployment — so a new build served old rows.
    it('never lets a query be served from the Next.js data cache', async () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';

        const seen: RequestInit[] = [];
        vi.stubGlobal('fetch', vi.fn((_url: string, init?: RequestInit) => {
            seen.push(init ?? {});
            return Promise.resolve(new Response('[]', { status: 200, headers: { 'content-type': 'application/json' } }));
        }));

        const { createAdminClient } = await import('./supabase-admin');
        await createAdminClient().from('quotes').select('*');

        expect(seen.length, 'the query must reach fetch').toBeGreaterThan(0);
        expect(seen[0].cache, 'every Supabase read must opt out of the data cache').toBe('no-store');
    });

    it('fails loudly when the service key is absent instead of falling back to anon', async () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
        delete process.env.SUPABASE_SERVICE_ROLE_KEY;
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

        const { createAdminClient } = await import('./supabase-admin');
        // Row-level security lets anon INSERT but not SELECT, so a silent fallback
        // to the anon key renders an empty dashboard and looks like data loss.
        expect(() => createAdminClient()).toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
    });
});
