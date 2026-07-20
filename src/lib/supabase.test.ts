import { describe, it, expect, beforeAll } from 'vitest';

describe('lib/supabase', () => {
    beforeAll(() => {
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= 'test-anon-key';
    });

    it('exports a configured Supabase client instance', async () => {
        const { supabase } = await import('./supabase');
        expect(supabase).toBeDefined();
        expect(typeof supabase.from).toBe('function');
    });
});
