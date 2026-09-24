import { describe, it, expect } from 'vitest';
import { buildQuoteItems, isQuotePartUsed, mergeQuoteParts, type QuoteCalculationData } from './quote-items';

function base(overrides: Partial<QuoteCalculationData> = {}): QuoteCalculationData {
    return {
        calculatorType: 'ethernet',
        cableType: 'none',
        cableMeters: 0,
        points: 0,
        installationType: 'external',
        installationMeters: 0,
        canaleta: 0,
        tubo_corrugado: 0,
        tubo_pvc: 0,
        canaleta_extra: 0,
        mano_de_obra_horas: 0,
        regata: 0,
        patchPanel12: 0,
        patchPanel24: 0,
        patchPanel48: 0,
        materialsCustomNames: {},
        materialsCustomPrices: {},
        rackCustomName: '',
        rackCustomPrice: 0,
        equipmentCustom: {},
        customItems: [],
        additionalWork: {},
        rack: 'none',
        urgency: 'normal',
        cablesCost: 0,
        pointsCost: 0,
        installCost: 0,
        laborCost: 0,
        materialsCost: 0,
        workCost: 0,
        rackCost: 0,
        subtotal: 0,
        discountPercent: 0,
        discount: 0,
        urgencyMultiplier: 1,
        iva: 0,
        total: 0,
        ...overrides,
    };
}

/** 4 Cat6 points, 25 m each, ceiling, 12U rack. */
const ethernet = () => base({
    cableType: 'cat6',
    cableMeters: 100,
    points: 4,
    installationType: 'ceiling',
    cablesCost: 80,
    pointsCost: 60,
    installCost: 300,
    laborCost: 160,
    rack: 'rack_12u',
    rackCost: 180,
    subtotal: 780,
    discountPercent: 5,
    discount: 39,
    iva: 155.61,
    total: 896.61,
});

/** 2 fibre points, with a customer-specific fixed line and splices. */
const fiber = () => base({
    calculatorType: 'fiber',
    cableType: 'Fibra Monomodo 4F',
    cableMeters: 60,
    points: 2,
    installationType: 'Fibra - ceiling',
    cablesCost: 42,
    pointsCost: 50,
    installCost: 300,
    laborCost: 88,
    rack: 'rack_fibra_6u',
    rackCustomName: 'Rack fibra pared 6U',
    rackCost: 120,
    customItems: [{ id: 'x', type: 'fixed', name: 'Permiso comunidad', price: '35' }],
    fiberItems: [{ description: 'Fusión (empalme por arco)', quantity: '4 fusiones', unitPrice: '15.00€', total: '60.00€' }],
    subtotal: 695,
    discountPercent: 0,
    discount: 0,
    iva: 145.95,
    total: 840.95,
});

const descriptions = (items: { description: string }[]) => items.map(i => i.description);
const sumRows = (items: { total: string }[]) => items.reduce((s, i) => s + parseFloat(i.total), 0);

describe('buildQuoteItems', () => {
    it('describes fibre rows as fibre, not as the Ethernet defaults', () => {
        const items = buildQuoteItems(fiber());
        const text = descriptions(items).join('\n');
        expect(text).toContain('roseta óptica SC/APC');
        expect(text).not.toContain('RJ45');
        expect(text).toContain('Tendido de fibra óptica — Falso techo');
        expect(text).toContain('Mano de obra fibra óptica');
        expect(text).toContain('Rack fibra pared 6U');
        expect(text).not.toContain('rack_fibra_6u');
    });

    it('prints every euro of the subtotal as a row', () => {
        expect(sumRows(buildQuoteItems(ethernet()))).toBeCloseTo(780, 2);
        expect(sumRows(buildQuoteItems(fiber()))).toBeCloseTo(695, 2);
    });
});

describe('cable and conduit on the document', () => {
    it('names the cable instead of printing the internal id', () => {
        const [cable] = buildQuoteItems(base({ cableType: 'cat6a_ext', cableMeters: 100, cablesCost: 100, subtotal: 100 }));
        expect(cable.description).toBe('Cableado Cat 6A U/UTP exterior (cubierta PE anti-UV) — suministro de cable');
    });

    it('prints flexible steel conduit rows with their own price', () => {
        const items = buildQuoteItems(base({
            tubo_acero_pg16: 40, tubo_acero_pg21: 10,
            materialsCustomPrices: { steelFlex16: 1.6, steelFlex21: 2.4 },
            materialsCost: 88, subtotal: 88,
        }));
        expect(items).toEqual([
            { description: 'Tubo flexible de acero PG16', quantity: '40m', unitPrice: '1.60€', total: '64.00€' },
            { description: 'Tubo flexible de acero PG21', quantity: '10m', unitPrice: '2.40€', total: '24.00€' },
        ]);
    });
});

describe('isQuotePartUsed', () => {
    it('treats an untouched calculator as unused', () => {
        expect(isQuotePartUsed(base())).toBe(false);
        expect(isQuotePartUsed(null)).toBe(false);
        expect(isQuotePartUsed(ethernet())).toBe(true);
    });

    it('does not count the add-on services the Ethernet side starts with as a job', () => {
        const defaultsOnly = base({ additionalWork: { testing: true, labeling: true }, subtotal: 70, iva: 14.7, total: 84.7 });
        expect(isQuotePartUsed(defaultsOnly)).toBe(false);
        // …so a fibre-only quote carries no network services.
        const { data, items } = mergeQuoteParts([defaultsOnly, fiber()]);
        expect(data.calculatorType).toBe('fiber');
        expect(descriptions(items)).not.toContain('Testeo y verificación');
    });

    it('counts equipment-only or custom-line-only network work', () => {
        expect(isQuotePartUsed(base({ workCost: 40, subtotal: 40 }))).toBe(true);
        expect(isQuotePartUsed(base({ subtotal: 90, customItems: [{ id: 'a', type: 'fixed', name: 'Visita técnica', price: 90 }] }))).toBe(true);
    });
});

describe('mergeQuoteParts', () => {
    it('network only: the quote is the Ethernet half, unchanged', () => {
        const e = ethernet();
        const { data, items } = mergeQuoteParts([e, base({ calculatorType: 'fiber' })]);
        expect(data).toBe(e);
        expect(items).toEqual(buildQuoteItems(e));
    });

    it('fibre only: the quote is the fibre half, with no empty Ethernet rows', () => {
        const f = fiber();
        const { data, items } = mergeQuoteParts([base(), f]);
        expect(data).toBe(f);
        expect(items).toEqual(buildQuoteItems(f));
    });

    it('both: one document with the rows of each half and one total', () => {
        const e = ethernet();
        const f = fiber();
        const { data, items } = mergeQuoteParts([e, f]);

        expect(items).toEqual([...buildQuoteItems(e), ...buildQuoteItems(f)]);
        // Cat6 and fibre stay on separate rows, each with its own price per metre.
        expect(items.filter(i => i.description.startsWith('Cableado'))).toHaveLength(2);
        // The fibre-side custom line survives the merge.
        expect(descriptions(items)).toContain('Permiso comunidad');

        expect(data.calculatorType).toBe('combined');
        expect(data.subtotal).toBeCloseTo(1475, 2);
        expect(data.discount).toBeCloseTo(39, 2);
        expect(data.iva).toBeCloseTo(301.56, 2);
        expect(data.total).toBeCloseTo(1737.56, 2);
        expect(sumRows(items)).toBeCloseTo(data.subtotal, 2);
        expect(data.points).toBe(6);
        expect(data.cableType).toBe('cat6 + Fibra Monomodo 4F');
    });

    it('both with different discounts: stores the percentage the invoice can reproduce', () => {
        const { data } = mergeQuoteParts([ethernet(), fiber()]);
        // The invoice applies one percentage to the sum of the rows, then IVA.
        const invoiceBase = data.subtotal * (1 - (data.discountPercent ?? 0) / 100);
        expect(invoiceBase * 1.21).toBeCloseTo(data.total, 1);
    });

    it('both with different urgency: the stored multiplier reproduces the total', () => {
        const e = ethernet();
        const f = fiber();
        f.urgencyMultiplier = 1.2;
        f.urgency = 'urgente';
        f.iva = 695 * 1.2 * 0.21;
        f.total = 695 * 1.2 * 1.21;
        const { data } = mergeQuoteParts([e, f]);
        const net = data.subtotal - (data.discount ?? 0);
        expect(net * data.urgencyMultiplier * 1.21).toBeCloseTo(data.total, 1);
    });

    it('nothing filled in yet: falls back to the empty Ethernet half without throwing', () => {
        const empty = base();
        const { data, items } = mergeQuoteParts([empty, null]);
        expect(data).toBe(empty);
        expect(items).toEqual([]);
    });
});
