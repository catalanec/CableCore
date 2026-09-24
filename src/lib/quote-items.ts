/**
 * Line items and totals for a calculator quote — one source for the PDF, the
 * CRM record and, through `quote_items`, the invoice.
 *
 * The calculator has two halves, Ethernet and fibre. A job can use either or
 * both, and the client must get ONE document covering exactly what was done:
 * network only → network rows; fibre only → fibre rows; both → both, one total.
 *
 * Each half is itemised on its own with `buildQuoteItems`, then the rows are
 * concatenated and the money added up. Merging at the level of cost fields
 * instead (cable + cable, points + points) was tried first and is wrong for an
 * invoice: Cat6 and fibre ended up on one "Cableado" row with a meaningless
 * price per metre, and optical outlets were described as RJ45.
 */

export interface QuoteLineItem {
    description: string;
    quantity: string;
    unitPrice: string;
    total: string;
}

export interface QuoteCalculationData {
    calculatorType?: 'ethernet' | 'fiber' | 'combined';
    cableType: string;
    cableMeters: number;
    points: number;
    installationType: string;
    installationMeters: number;
    canaleta: number;
    tubo_corrugado: number;
    tubo_pvc: number;
    tubo_acero_pg16?: number;
    tubo_acero_pg21?: number;
    canaleta_extra: number;
    mano_de_obra_horas: number;
    regata: number;
    patchPanel12: number;
    patchPanel24: number;
    patchPanel48: number;
    materialsCustomNames: Record<string, string>;
    materialsCustomPrices: Record<string, number>;
    rackCustomName: string;
    rackCustomPrice: number;
    equipmentCustom: Record<string, { name: string; price: number }>;
    customItems: Array<{ id: string; type: 'unit' | 'fixed'; name: string; qty?: number; price: number | string }>;
    // additionalWork only carries true/false (the API stores it into boolean
    // columns); the real count for +/- equipment lives in equipmentQty, so a
    // quantity > 1 prints as such instead of "1 ud" (round 19 audit).
    additionalWork: Record<string, boolean>;
    equipmentQty?: Record<string, number>;
    // Pre-itemised rows that don't fit the generic shape (fusion splices,
    // patch cords, OTDR certification) — appended as-is.
    fiberItems?: QuoteLineItem[];
    rack: string;
    urgency: string;
    cablesCost: number;
    pointsCost: number;
    installCost: number;
    laborCost: number;
    materialsCost: number;
    workCost: number;
    rackCost: number;
    subtotal: number;
    discountPercent?: number;
    discount?: number;
    urgencyMultiplier: number;
    iva: number;
    total: number;
}

const installLabels: Record<string, string> = {
    external: 'Superficial (Canaleta)',
    ceiling: 'Techo técnico (falso techo)',
    existing_wall: 'Empotrado (tubos existentes)',
    new_wall: 'Empotrado nuevo (regata)',
    industrial: 'Industrial (Nave / Fábrica)',
    trays: 'Bandejas portacables',
};

const fiberInstallLabels: Record<string, string> = {
    surface: 'Superficial',
    ceiling: 'Falso techo',
    trunking: 'Canaleta',
    industrial: 'Industrial (nave)',
};

const workLabels: Record<string, string> = {
    switch: 'Instalación switch',
    router: 'Instalación router',
    accessPoint: 'Punto de acceso WiFi',
    configuration: 'Configuración de red',
    network_config: 'Configuración de red',
    patch_panel: 'Instalación patch panel',
    testing: 'Testeo y verificación',
    labeling: 'Etiquetado profesional',
    cableManagement: 'Organización de cables',
    extendedWarranty: 'Garantía extendida',
};

const workPrices: Record<string, number> = {
    switch: 40, router: 50, accessPoint: 70, configuration: 150, network_config: 120,
    patch_panel: 80, testing: 50, labeling: 20, cableManagement: 50, extendedWarranty: 30,
};

const rackLabels: Record<string, string> = {
    none: 'Sin armario de red',
    rack_6u: 'Rack pared 6U',
    rack_9u: 'Rack pared 9U',
    rack_12u: 'Rack pared 12U',
    rack_18u: 'Rack pared 18U',
    rack_22u: 'Rack suelo 22U',
    rack_42u: 'Rack suelo 42U (servidor)',
};

const rackPrices: Record<string, number> = {
    rack_6u: 90, rack_9u: 130, rack_12u: 180, rack_18u: 250, rack_22u: 380, rack_42u: 650,
};

// The document names the cable, not the calculator's internal id: it used
// to print "CABLEADO CAT6A_FTP".
const cableNames: Record<string, string> = {
    cat5: 'Cat 5e U/UTP',
    cat6: 'Cat 6 U/UTP',
    cat6a_utp: 'Cat 6A U/UTP',
    cat6a_ftp: 'Cat 6A U/FTP',
    cat6a_sftp: 'Cat 6A S/FTP',
    cat6a_ext: 'Cat 6A U/UTP exterior (cubierta PE anti-UV)',
    cat7: 'Cat 7 S/FTP',
};

const eur = (n: number) => `${n.toFixed(2)}€`;

function row(description: string, quantity: string, unitPrice: number, total: number): QuoteLineItem {
    return { description, quantity, unitPrice: eur(unitPrice), total: eur(total) };
}

/** The rows of one half of the calculator, in the order they print. */
export function buildQuoteItems(d: QuoteCalculationData): QuoteLineItem[] {
    const isFiber = d.calculatorType === 'fiber';
    const items: QuoteLineItem[] = [];

    if (d.cablesCost > 0 || d.cableMeters > 0) {
        items.push(row(`Cableado ${cableNames[d.cableType] ?? d.cableType} — suministro de cable`, `${d.cableMeters}m`,
            d.cablesCost / Math.max(1, d.cableMeters), d.cablesCost));
    }

    // Only with real cost behind it: a "0.00€" points row confused a client
    // reconciling the rows with the subtotal (round 19 audit).
    if (d.pointsCost > 0) {
        items.push(row(isFiber
            ? 'Puntos de red — roseta óptica SC/APC, pigtail, testeo'
            : 'Puntos de red — roseta RJ45, keystone, caja, testeo',
        `${d.points} uds`, d.pointsCost / Math.max(1, d.points), d.pointsCost));
    }

    if (d.installCost > 0) {
        // The fibre side stores "Fibra - <type>" so the CRM row says what it is.
        const fiberKey = d.installationType.replace(/^Fibra - /, '');
        const description = isFiber
            ? `Tendido de fibra óptica — ${fiberInstallLabels[fiberKey] || fiberKey}`
            : `Tendido de cable — ${installLabels[d.installationType] || d.installationType}`;
        items.push(row(description, `${d.cableMeters}m`, d.installCost / Math.max(1, d.cableMeters), d.installCost));
    }

    if (d.laborCost > 0) {
        items.push(row(isFiber
            ? 'Mano de obra fibra óptica — tendido, conectorización, verificación'
            : 'Mano de obra — operarios, montaje, terminación, verificación',
        `${d.points} ptos`, d.laborCost / Math.max(1, d.points), d.laborCost));
    }

    const material = (qty: number, key: string, fallbackName: string, fallbackPrice: number) => {
        if (!(qty > 0)) return;
        const name = d.materialsCustomNames?.[key] || fallbackName;
        const price = d.materialsCustomPrices?.[key] ?? fallbackPrice;
        items.push(row(name, `${qty}m`, price, qty * price));
    };
    material(d.canaleta, 'trunking', 'Canaleta (cable canal)', 4);
    material(d.canaleta_extra || 0, 'trunking', 'Canaleta adicional', 4);
    material(d.tubo_corrugado, 'corrugated', 'Tubo corrugado', 1);
    material(d.tubo_pvc || 0, 'pvc', 'Tubo PVC', 2);
    material(d.tubo_acero_pg16 || 0, 'steelFlex16', 'Tubo flexible de acero PG16', 1.6);
    material(d.tubo_acero_pg21 || 0, 'steelFlex21', 'Tubo flexible de acero PG21', 2.4);
    if (d.regata > 0) items.push(row('Regata (corte muro)', `${d.regata}m`, 45, d.regata * 45));
    if ((d.mano_de_obra_horas || 0) > 0) {
        const name = d.materialsCustomNames?.laborHour || 'Mano de obra adicional';
        const price = d.materialsCustomPrices?.laborHour ?? 60;
        items.push(row(name, `${d.mano_de_obra_horas}h`, price, d.mano_de_obra_horas * price));
    }

    const panel = (count: number, ports: number, price: number) => {
        if ((count || 0) > 0) {
            items.push(row(`Patch Panel ${ports} puertos — instalación + crimpado`, `${count} ud`, price, count * price));
        }
    };
    panel(d.patchPanel12, 12, 40);
    panel(d.patchPanel24, 24, 65);
    panel(d.patchPanel48, 48, 100);

    for (const item of d.customItems || []) {
        const price = typeof item.price === 'string'
            ? parseFloat(item.price.replace(',', '.')) || 0
            : Number(item.price) || 0;
        if (!item.name || price <= 0) continue;
        if (item.type === 'fixed') {
            items.push(row(item.name, '1', price, price));
        } else if ((item.qty || 0) > 0) {
            items.push(row(item.name, `${item.qty} ud`, price, (item.qty || 0) * price));
        }
    }

    for (const [key, enabled] of Object.entries(d.additionalWork || {})) {
        if (!enabled) continue;
        const custom = d.equipmentCustom?.[key];
        const name = custom?.name || workLabels[key] || key;
        const price = custom?.price ?? workPrices[key] ?? 0;
        const qty = d.equipmentQty?.[key] || 1;
        items.push(row(name, qty > 1 ? `${qty} ud` : '1', price, price * qty));
    }

    if (d.rack && d.rack !== 'none') {
        const name = d.rackCustomName || rackLabels[d.rack] || d.rack;
        const price = d.rackCustomPrice > 0 ? d.rackCustomPrice : (rackPrices[d.rack] || d.rackCost);
        items.push({ description: name, quantity: '1', unitPrice: eur(price), total: eur(d.rackCost) });
    }

    for (const item of d.fiberItems || []) items.push(item);

    return items;
}

/**
 * True when this half of the calculator holds actual work.
 *
 * Not simply "subtotal > 0": the Ethernet side starts with testing and
 * labelling switched on, so an untouched network half is worth 70€. Counting
 * that put network services on every fibre-only quote. Those add-ons ride along
 * with real work; on their own they are not a job.
 */
export function isQuotePartUsed(d: QuoteCalculationData | null | undefined): d is QuoteCalculationData {
    if (!d || !(d.subtotal > 0)) return false;
    const hasCustomItem = (d.customItems || []).some(i => {
        const price = typeof i.price === 'string' ? parseFloat(i.price.replace(',', '.')) || 0 : Number(i.price) || 0;
        return !!i.name && price > 0 && (i.type === 'fixed' || (i.qty || 0) > 0);
    });
    return d.points > 0
        || d.cablesCost > 0
        || d.materialsCost > 0
        || d.workCost > 0
        || d.rackCost > 0
        || (d.fiberItems?.length ?? 0) > 0
        || hasCustomItem;
}

// Four decimals: at two, a 2.64% stand-in for 2.6441% already moved a
// 1.700€ invoice by seven cents.
const round4 = (n: number) => Math.round(n * 10000) / 10000;

/**
 * One quote from whichever halves are in use.
 *
 * `data` is the row stored in `quotes` and sent to Telegram; `items` are the
 * printed lines. With a single half in use, `data` is that half untouched, so
 * a plain network job or a plain fibre job produces exactly what it did before.
 */
export function mergeQuoteParts(parts: Array<QuoteCalculationData | null | undefined>): {
    data: QuoteCalculationData;
    items: QuoteLineItem[];
} {
    const used = parts.filter(isQuotePartUsed);
    if (used.length === 0) {
        const fallback = parts.find((p): p is QuoteCalculationData => !!p);
        if (!fallback) throw new Error('mergeQuoteParts: no calculator data');
        return { data: fallback, items: buildQuoteItems(fallback) };
    }
    if (used.length === 1) return { data: used[0], items: buildQuoteItems(used[0]) };

    const sum = (pick: (p: QuoteCalculationData) => number) => used.reduce((s, p) => s + (pick(p) || 0), 0);
    const [first] = used;

    const subtotal = sum(p => p.subtotal);
    const discount = sum(p => p.discount ?? 0);
    const iva = sum(p => p.iva);
    const total = sum(p => p.total);

    // Each half carries its own discount and urgency. The invoice applies ONE
    // percentage to all its rows, so the combined quote stores the effective
    // one — the percentage that reproduces the same money on the whole.
    const samePercent = used.every(p => (p.discountPercent ?? 0) === (first.discountPercent ?? 0));
    const discountPercent = samePercent
        ? first.discountPercent
        : (subtotal > 0 ? round4((discount / subtotal) * 100) : 0);

    const sameUrgency = used.every(p => p.urgencyMultiplier === first.urgencyMultiplier);
    const net = subtotal - discount;
    const urgencyMultiplier = sameUrgency
        ? first.urgencyMultiplier
        : (net > 0 ? round4((total - iva) / net) : 1);

    const data: QuoteCalculationData = {
        ...first,
        calculatorType: 'combined',
        cableType: used.map(p => p.cableType).join(' + '),
        installationType: used.map(p => p.installationType).join(' + '),
        cableMeters: sum(p => p.cableMeters),
        installationMeters: sum(p => p.installationMeters),
        points: sum(p => p.points),
        rack: used.find(p => p.rack && p.rack !== 'none')?.rack ?? 'none',
        urgency: sameUrgency ? first.urgency : used.map(p => p.urgency).join(' + '),
        cablesCost: sum(p => p.cablesCost),
        pointsCost: sum(p => p.pointsCost),
        installCost: sum(p => p.installCost),
        laborCost: sum(p => p.laborCost),
        materialsCost: sum(p => p.materialsCost),
        workCost: sum(p => p.workCost),
        rackCost: sum(p => p.rackCost),
        subtotal,
        discount,
        discountPercent,
        urgencyMultiplier,
        iva,
        total,
    };

    return { data, items: used.flatMap(buildQuoteItems) };
}
