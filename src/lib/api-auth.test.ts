import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { requireAdminAuth } from './api-auth';

function makeRequest(headers: Record<string, string> = {}) {
    return new NextRequest('https://cablecore.es/api/photos', { headers });
}

function basicAuthHeader(user: string, pass: string) {
    return `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
}

describe('requireAdminAuth', () => {
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        process.env = { ...ORIGINAL_ENV, ADMIN_USER: 'admin', ADMIN_PASSWORD: 'secret123' };
    });

    afterEach(() => {
        process.env = ORIGINAL_ENV;
    });

    it('returns null (auth passed) for correct credentials', () => {
        const req = makeRequest({ authorization: basicAuthHeader('admin', 'secret123') });
        expect(requireAdminAuth(req)).toBeNull();
    });

    it('returns 401 when Authorization header is missing', async () => {
        const req = makeRequest();
        const res = requireAdminAuth(req);
        expect(res).not.toBeNull();
        expect(res!.status).toBe(401);
        expect(res!.headers.get('WWW-Authenticate')).toContain('Basic');
    });

    it('returns 401 for wrong password', () => {
        const req = makeRequest({ authorization: basicAuthHeader('admin', 'wrong') });
        const res = requireAdminAuth(req);
        expect(res!.status).toBe(401);
    });

    it('returns 401 for wrong username', () => {
        const req = makeRequest({ authorization: basicAuthHeader('someone-else', 'secret123') });
        const res = requireAdminAuth(req);
        expect(res!.status).toBe(401);
    });

    it('returns 401 when credentials have different length than expected (safeCompare early-exit path)', () => {
        const req = makeRequest({ authorization: basicAuthHeader('a', 'b') });
        const res = requireAdminAuth(req);
        expect(res!.status).toBe(401);
    });

    it('returns 500 when ADMIN_USER is not configured', () => {
        process.env.ADMIN_USER = '';
        const req = makeRequest({ authorization: basicAuthHeader('admin', 'secret123') });
        const res = requireAdminAuth(req);
        expect(res!.status).toBe(500);
    });

    it('returns 500 when ADMIN_PASSWORD is not configured', () => {
        process.env.ADMIN_PASSWORD = '';
        const req = makeRequest({ authorization: basicAuthHeader('admin', 'secret123') });
        const res = requireAdminAuth(req);
        expect(res!.status).toBe(500);
    });

    it('GAP: malformed base64 Authorization header throws instead of returning 401', () => {
        // Documents a real bug: atob() is not wrapped in try/catch, so a
        // client sending garbage in the Authorization header causes an
        // uncaught DOMException ("Invalid character") that bubbles up as an
        // unhandled 500 instead of the intended 401 Unauthorized response.
        const req = makeRequest({ authorization: 'Basic not-valid-base64-user-pass' });
        expect(() => requireAdminAuth(req)).toThrow();
    });
});
