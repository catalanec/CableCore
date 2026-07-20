import { describe, it, expect } from 'vitest';
import { parseQuoteMessage } from './quote-parser';

describe('parseQuoteMessage', () => {
    it('returns a low-confidence result with a "no parameters detected" summary for an unrelated message', () => {
        const result = parseQuoteMessage('Hola, ¿cuál es vuestro horario de atención?');
        expect(result.confidence).toBe(0);
        expect(result.cableType).toBeUndefined();
        expect(result.summary).toBe('No se pudieron detectar parámetros de instalación. Por favor, especifique más detalles.');
    });

    it('detects cable type, points, and meters together and accumulates confidence', () => {
        const result = parseQuoteMessage('Necesito cable cat6, 10 puntos de red y 50 metros de cable');
        expect(result.cableType).toBe('cat6');
        expect(result.points).toBe(10);
        expect(result.cableMeters).toBe(50);
        expect(result.confidence).toBeGreaterThan(0);
        expect(result.summary).toContain('Cable: CAT6');
    });

    it('distinguishes cat6 from cat6a via negative lookahead', () => {
        expect(parseQuoteMessage('quiero instalar cat6a en mi oficina').cableType).toBe('cat6a');
        expect(parseQuoteMessage('quiero instalar cat6 en mi oficina').cableType).toBe('cat6');
    });

    it('detects cat7 and cat5e variants', () => {
        expect(parseQuoteMessage('necesito categoria 7 para el rack').cableType).toBe('cat7');
        expect(parseQuoteMessage('tengo cable cat 5e antiguo').cableType).toBe('cat5e');
    });

    it('detects installation type: superficial/canaleta', () => {
        expect(parseQuoteMessage('instalación superficial con canaleta').installationType).toBe('superficial');
    });

    it('detects installation type: techo técnico', () => {
        expect(parseQuoteMessage('pasar los cables por el falso techo').installationType).toBe('techo');
    });

    it('detects installation type: industrial (nave/warehouse)', () => {
        expect(parseQuoteMessage('es una nave industrial grande').installationType).toBe('industrial');
    });

    it('detects rack type', () => {
        expect(parseQuoteMessage('necesito un rack profesional con patch panel').rack).toBeDefined();
    });

    it('detects urgency: urgente', () => {
        expect(parseQuoteMessage('necesito esto lo antes posible, es urgente').urgency).toBe('urgente');
    });

    it('detects urgency: weekend', () => {
        expect(parseQuoteMessage('¿podéis venir el sábado?').urgency).toBe('weekend');
    });

    it('detects additional work flags: switch, router, network_config, patch_panel', () => {
        const result = parseQuoteMessage('necesito switch, router, configuración de red y patch panel');
        expect(result.additionalWork).toEqual({ switch: true, router: true, network_config: true, patch_panel: true });
    });

    it('returns additionalWork as undefined when nothing is detected', () => {
        expect(parseQuoteMessage('solo necesito información general').additionalWork).toBeUndefined();
    });

    it('extracts material quantities: canaleta, tubo corrugado, and regata', () => {
        const result = parseQuoteMessage('necesito 20 metros de canaleta, 15 metros de corrugado y 5 metros de regata');
        expect(result.materials).toEqual({ canaleta: 20, tubo_corrugado: 15, regata: 5 });
    });

    it('returns materials as undefined when none are mentioned', () => {
        expect(parseQuoteMessage('solo necesito puntos de red').materials).toBeUndefined();
    });

    it('caps confidence at 100 even when many signals are detected', () => {
        const result = parseQuoteMessage(
            'cat7, 50 puntos de red, 200 metros de cable, 30 metros de instalación, empotrado nuevo, ' +
            'rack profesional con patch, es urgente, switch, router, configuración de red, patch panel, ' +
            '20 metros de canaleta, 15 metros de corrugado, 5 metros de regata'
        );
        expect(result.confidence).toBeLessThanOrEqual(100);
    });

    it('ignores out-of-range numbers when extracting points (0 and >=100000 are rejected)', () => {
        const zero = parseQuoteMessage('necesito 0 puntos de red');
        expect(zero.points).toBeUndefined();
    });

    it('is case-insensitive and works with mixed-case input', () => {
        const result = parseQuoteMessage('Necesito CAT6 con 5 PUNTOS de RED');
        expect(result.cableType).toBe('cat6');
        expect(result.points).toBe(5);
    });

    it('handles Russian-language keywords for installation type and urgency', () => {
        const result = parseQuoteMessage('нужно быстро проложить кабель под потолок');
        expect(result.installationType).toBe('techo');
        expect(result.urgency).toBe('urgente');
    });
});
