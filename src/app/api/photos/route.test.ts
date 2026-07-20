import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { createSupabaseMock } from '@/test-utils/supabase-mock';

const createClientMock = vi.fn();
vi.mock('@supabase/supabase-js', () => ({
    createClient: (...args: unknown[]) => createClientMock(...args),
}));

function basicAuthHeader(user: string, pass: string) {
    return `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
}

function authHeaders(authed = true): Record<string, string> {
    return authed ? { authorization: basicAuthHeader('test-admin', 'test-password') } : {};
}

// The route module creates its Supabase client at import time (module scope),
// so every test must reset modules and re-import after configuring the mock.
async function loadPhotosRoute() {
    vi.resetModules();
    return import('./route');
}

describe('/api/photos', () => {
    beforeEach(() => {
        createClientMock.mockReset();
        createClientMock.mockReturnValue(createSupabaseMock({}));
    });

    describe('module initialization', () => {
        it('throws at import time when SUPABASE_SERVICE_ROLE_KEY is missing', async () => {
            const original = process.env.SUPABASE_SERVICE_ROLE_KEY;
            process.env.SUPABASE_SERVICE_ROLE_KEY = '';
            try {
                await expect(loadPhotosRoute()).rejects.toThrow('SUPABASE_SERVICE_ROLE_KEY is not configured');
            } finally {
                process.env.SUPABASE_SERVICE_ROLE_KEY = original;
            }
        });
    });

    describe('POST (upload)', () => {
        it('rejects unauthenticated requests', async () => {
            const { POST } = await loadPhotosRoute();
            const req = new NextRequest('https://cablecore.es/api/photos', { method: 'POST', body: new FormData(), headers: authHeaders(false) });
            const res = await POST(req);
            expect(res.status).toBe(401);
        });

        it('returns 400 when file or project_id is missing', async () => {
            const { POST } = await loadPhotosRoute();
            const form = new FormData();
            form.set('project_id', 'proj-1');
            const req = new NextRequest('https://cablecore.es/api/photos', { method: 'POST', body: form, headers: authHeaders() });
            const res = await POST(req);
            expect(res.status).toBe(400);
        });

        it('rejects files larger than 10MB', async () => {
            const { POST } = await loadPhotosRoute();
            const bigFile = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'big.jpg', { type: 'image/jpeg' });
            const form = new FormData();
            form.set('file', bigFile);
            form.set('project_id', 'proj-1');
            const req = new NextRequest('https://cablecore.es/api/photos', { method: 'POST', body: form, headers: authHeaders() });
            const res = await POST(req);
            expect(res.status).toBe(413);
        });

        it('rejects disallowed file types', async () => {
            const { POST } = await loadPhotosRoute();
            const file = new File(['pdf-bytes'], 'doc.pdf', { type: 'application/pdf' });
            const form = new FormData();
            form.set('file', file);
            form.set('project_id', 'proj-1');
            const req = new NextRequest('https://cablecore.es/api/photos', { method: 'POST', body: form, headers: authHeaders() });
            const res = await POST(req);
            expect(res.status).toBe(415);
        });

        it('uploads the file, saves metadata, and returns the public URL', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({ tables: { project_photos: [{ data: null, error: null }] } }));
            const { POST } = await loadPhotosRoute();
            const file = new File(['img-bytes'], 'photo.jpg', { type: 'image/jpeg' });
            const form = new FormData();
            form.set('file', file);
            form.set('project_id', 'proj-1');
            const req = new NextRequest('https://cablecore.es/api/photos', { method: 'POST', body: form, headers: authHeaders() });
            const res = await POST(req);
            expect(res.status).toBe(200);
            const json = await res.json();
            expect(json.success).toBe(true);
            expect(json.url).toContain('proj-1/');
        });

        it('still returns success (URL only) when saving photo metadata to the DB fails', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({ tables: { project_photos: [{ data: null, error: { message: 'table missing' } }] } }));
            const { POST } = await loadPhotosRoute();
            const file = new File(['img-bytes'], 'photo.jpg', { type: 'image/jpeg' });
            const form = new FormData();
            form.set('file', file);
            form.set('project_id', 'proj-1');
            const req = new NextRequest('https://cablecore.es/api/photos', { method: 'POST', body: form, headers: authHeaders() });
            const res = await POST(req);
            expect(res.status).toBe(200);
            const json = await res.json();
            expect(json.success).toBe(true);
        });

        it('returns 500 when the storage upload itself fails', async () => {
            const mock = createSupabaseMock({});
            mock.storage.from = vi.fn(() => ({
                upload: vi.fn(() => Promise.resolve({ error: { message: 'bucket full' } })),
                remove: vi.fn(),
                list: vi.fn(),
                getPublicUrl: vi.fn(() => ({ data: { publicUrl: '' } })),
            }));
            createClientMock.mockReturnValue(mock);
            const { POST } = await loadPhotosRoute();
            const file = new File(['img-bytes'], 'photo.jpg', { type: 'image/jpeg' });
            const form = new FormData();
            form.set('file', file);
            form.set('project_id', 'proj-1');
            const req = new NextRequest('https://cablecore.es/api/photos', { method: 'POST', body: form, headers: authHeaders() });
            const res = await POST(req);
            expect(res.status).toBe(500);
        });
    });

    describe('GET (list)', () => {
        it('rejects unauthenticated requests', async () => {
            const { GET } = await loadPhotosRoute();
            const req = new NextRequest('https://cablecore.es/api/photos', { headers: authHeaders(false) });
            const res = await GET(req);
            expect(res.status).toBe(401);
        });

        it('returns an empty photos array when project_id is not provided', async () => {
            const { GET } = await loadPhotosRoute();
            const req = new NextRequest('https://cablecore.es/api/photos', { headers: authHeaders() });
            const res = await GET(req);
            const json = await res.json();
            expect(json).toEqual({ photos: [] });
        });

        it('returns photos from the database when available', async () => {
            createClientMock.mockReturnValue(createSupabaseMock({
                tables: { project_photos: [{ data: [{ id: 'p1', url: 'https://x/p1.jpg' }], error: null }] },
            }));
            const { GET } = await loadPhotosRoute();
            const req = new NextRequest('https://cablecore.es/api/photos?project_id=proj-1', { headers: authHeaders() });
            const res = await GET(req);
            const json = await res.json();
            expect(json.photos).toEqual([{ id: 'p1', url: 'https://x/p1.jpg' }]);
        });

        it('falls back to Storage listing when the DB table query errors', async () => {
            const mock = createSupabaseMock({ tables: { project_photos: [{ data: null, error: { message: 'no such table' } }] } });
            mock.storage.from = vi.fn(() => ({
                upload: vi.fn(),
                remove: vi.fn(),
                list: vi.fn(() => Promise.resolve({ data: [{ name: 'a.jpg' }] })),
                getPublicUrl: vi.fn((path: string) => ({ data: { publicUrl: `https://mock.supabase.co/${path}` } })),
            }));
            createClientMock.mockReturnValue(mock);
            const { GET } = await loadPhotosRoute();
            const req = new NextRequest('https://cablecore.es/api/photos?project_id=proj-1', { headers: authHeaders() });
            const res = await GET(req);
            const json = await res.json();
            expect(json.photos).toHaveLength(1);
            expect(json.photos[0].url).toContain('proj-1/a.jpg');
        });
    });

    describe('DELETE', () => {
        it('rejects unauthenticated requests', async () => {
            const { DELETE } = await loadPhotosRoute();
            const req = new NextRequest('https://cablecore.es/api/photos', {
                method: 'DELETE', body: JSON.stringify({}),
                headers: { ...authHeaders(false), 'Content-Type': 'application/json' },
            });
            const res = await DELETE(req);
            expect(res.status).toBe(401);
        });

        it('removes the file from storage when a path is given', async () => {
            const mock = createSupabaseMock({});
            const removeMock = vi.fn(() => Promise.resolve({ error: null }));
            mock.storage.from = vi.fn(() => ({ upload: vi.fn(), remove: removeMock, list: vi.fn(), getPublicUrl: vi.fn() }));
            createClientMock.mockReturnValue(mock);
            const { DELETE } = await loadPhotosRoute();
            const req = new NextRequest('https://cablecore.es/api/photos', {
                method: 'DELETE', body: JSON.stringify({ path: 'proj-1/a.jpg' }),
                headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            });
            const res = await DELETE(req);
            expect(res.status).toBe(200);
            expect(removeMock).toHaveBeenCalledWith(['proj-1/a.jpg']);
        });

        it('deletes the DB row when an id is given', async () => {
            const mock = createSupabaseMock({ tables: { project_photos: [{ data: null, error: null }] } });
            createClientMock.mockReturnValue(mock);
            const { DELETE } = await loadPhotosRoute();
            const req = new NextRequest('https://cablecore.es/api/photos', {
                method: 'DELETE', body: JSON.stringify({ id: 'photo-1' }),
                headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            });
            const res = await DELETE(req);
            expect(res.status).toBe(200);
            expect(mock.from).toHaveBeenCalledWith('project_photos');
        });

        it('returns 500 when the request body is not valid JSON', async () => {
            const { DELETE } = await loadPhotosRoute();
            const req = new NextRequest('https://cablecore.es/api/photos', {
                method: 'DELETE', body: '{not-json',
                headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            });
            const res = await DELETE(req);
            expect(res.status).toBe(500);
        });
    });
});
