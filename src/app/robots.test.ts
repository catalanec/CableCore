import { describe, it, expect } from 'vitest';
import robots from './robots';

describe('robots()', () => {
    it('disallows API and admin routes for every locale while allowing everything else', () => {
        const result = robots();
        expect(result.rules).toEqual([{
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/es/admin/', '/en/admin/', '/ru/admin/', '/_next/static/media/'],
        }]);
    });

    it('points to the production sitemap and host', () => {
        const result = robots();
        expect(result.sitemap).toBe('https://cablecore.es/sitemap.xml');
        expect(result.host).toBe('https://cablecore.es');
    });
});
