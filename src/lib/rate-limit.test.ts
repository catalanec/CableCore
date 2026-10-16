import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimit, resetRateLimits, clientIp } from './rate-limit';

describe('rateLimit', () => {
    beforeEach(() => resetRateLimits());

    it('allows up to the limit, then blocks until the window resets', () => {
        const t0 = 1_000_000;
        for (let i = 0; i < 3; i++) expect(rateLimit('k', 3, 1000, t0)).toBe(true);
        expect(rateLimit('k', 3, 1000, t0 + 10)).toBe(false);
        expect(rateLimit('k', 3, 1000, t0 + 1001)).toBe(true);
    });

    it('tracks keys independently', () => {
        expect(rateLimit('a', 1, 1000, 0)).toBe(true);
        expect(rateLimit('a', 1, 1000, 1)).toBe(false);
        expect(rateLimit('b', 1, 1000, 1)).toBe(true);
    });
});

describe('clientIp', () => {
    it('prefers cf-connecting-ip, then x-real-ip, then the first x-forwarded-for hop', () => {
        expect(clientIp(new Headers({ 'cf-connecting-ip': '1.1.1.1', 'x-real-ip': '2.2.2.2' }))).toBe('1.1.1.1');
        expect(clientIp(new Headers({ 'x-real-ip': '2.2.2.2' }))).toBe('2.2.2.2');
        expect(clientIp(new Headers({ 'x-forwarded-for': '3.3.3.3, 10.0.0.1' }))).toBe('3.3.3.3');
        expect(clientIp(new Headers())).toBe('unknown');
    });
});
