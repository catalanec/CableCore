import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client for admin/server reads, built per call and never cached.
 *
 * Two defects made the CRM show data that was days out of date while the rows
 * sat in the database the whole time:
 *
 *  1. supabase-js issues its queries through the global `fetch`, and Next.js
 *     stores fetch results in its Data Cache. On Vercel that cache survives a
 *     deployment, so even a fresh build kept serving rows from an earlier one.
 *     Every request here opts out explicitly.
 *
 *  2. The dashboard read `SUPABASE_SERVICE_ROLE_KEY || NEXT_PUBLIC_..._ANON_KEY`.
 *     Row-level security grants anon INSERT on `quotes` but not SELECT, so that
 *     fallback does not fail — it returns an empty list, which reads as "the
 *     quotes are gone" rather than "the key is missing". Missing key now throws.
 *
 * Credentials are read on each call rather than at module scope: a module is
 * evaluated once and reused for the life of the lambda, which binds whatever
 * the environment happened to hold at that moment — the build, for instance.
 */
export function createAdminClient(): SupabaseClient {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured');
    if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');

    return createClient(url, serviceKey, {
        auth: { persistSession: false },
        global: {
            fetch: (input: RequestInfo | URL, init?: RequestInit) =>
                fetch(input, { ...init, cache: 'no-store' }),
        },
    });
}
