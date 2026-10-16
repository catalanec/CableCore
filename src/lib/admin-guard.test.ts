import { describe, it, expect, vi, beforeEach } from 'vitest';

const headerStore = new Map<string, string>();
vi.mock('next/headers', () => ({
    headers: () => ({ get: (k: string) => headerStore.get(k.toLowerCase()) ?? null }),
}));

import { assertAdmin, isAuthorizedAdminHeader } from './admin-guard';

const basic = (u: string, p: string) => `Basic ${Buffer.from(`${u}:${p}`).toString('base64')}`;

describe('isAuthorizedAdminHeader', () => {
    it('accepts the admin Basic credentials', () => {
        expect(isAuthorizedAdminHeader(basic('test-admin', 'test-password'))).toBe(true);
    });

    it('accepts a password that itself contains a colon', () => {
        const original = process.env.ADMIN_PASSWORD;
        process.env.ADMIN_PASSWORD = 'pa:ss';
        try {
            expect(isAuthorizedAdminHeader(basic('test-admin', 'pa:ss'))).toBe(true);
        } finally {
            process.env.ADMIN_PASSWORD = original;
        }
    });

    it('rejects a wrong password or user', () => {
        expect(isAuthorizedAdminHeader(basic('test-admin', 'nope'))).toBe(false);
        expect(isAuthorizedAdminHeader(basic('someone', 'test-password'))).toBe(false);
    });

    it('accepts the cron Bearer secret and rejects others', () => {
        expect(isAuthorizedAdminHeader('Bearer test-cron-secret')).toBe(true);
        expect(isAuthorizedAdminHeader('Bearer wrong')).toBe(false);
    });

    it('rejects missing or malformed headers', () => {
        expect(isAuthorizedAdminHeader(null)).toBe(false);
        expect(isAuthorizedAdminHeader('')).toBe(false);
        expect(isAuthorizedAdminHeader('Basic')).toBe(false);
        expect(isAuthorizedAdminHeader(`Basic ${Buffer.from('nocolon').toString('base64')}`)).toBe(false);
        expect(isAuthorizedAdminHeader('Token abc')).toBe(false);
    });

    it('fails closed when admin credentials are not configured', () => {
        const original = process.env.ADMIN_PASSWORD;
        delete process.env.ADMIN_PASSWORD;
        try {
            expect(isAuthorizedAdminHeader(basic('test-admin', ''))).toBe(false);
        } finally {
            process.env.ADMIN_PASSWORD = original;
        }
    });
});

describe('assertAdmin', () => {
    beforeEach(() => headerStore.clear());

    it('throws for an anonymous caller', async () => {
        await expect(assertAdmin()).rejects.toThrow('Unauthorized');
    });

    it('passes for the admin', async () => {
        headerStore.set('authorization', basic('test-admin', 'test-password'));
        await expect(assertAdmin()).resolves.toBeUndefined();
    });
});
