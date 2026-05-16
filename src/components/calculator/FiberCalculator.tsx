'use client';

import { useState, useMemo } from 'react';
import QuoteForm from './QuoteForm';

/* ═════════════════════════════════════
   FIBER CONFIG — цены рынка Испании 2025
   ═════════════════════════════════════ */

const FIBER_CONFIG = {
    cablePrices: {
        sm_2f: 0.45,   // Monomodo 2 fibras (más común)
        sm_4f: 0.65,   // Monomodo 4 fibras
        sm_12f: 1.20,  // Monomodo 12 fibras
        mm_om3: 0.90,  // Multimodo OM3
        mm_om4: 1.40,  // Multimodo OM4
    },
    installationMultiplier: {
        surface: 1.0,
        ceiling: 1.1,
        trunking: 1.15,
        industrial: 1.5,
    },
    routingPricePerMeter: {
        surface: 3,
        ceiling: 5,
        trunking: 4,
        industrial: 10,
    },
    laborPerPoint: 35,          // Mano de obra por punto
    fusionPerSplice: 15,        // Fusión (empalme por arco) por fibra
    certificationPerPoint: 8,   // Certificación OTDR por punto
    rosetaOptica: 12,           // Roseta óptica 2 puertos SC/APC
    patchCordFibra: 5,          // Patch cord SC/APC-SC/APC duplex
    acopladorScApc: 3,          // Acoplador SC/APC hembra-hembra (duplex)
    pigtailScApc: 4,            // Pigtail SC/APC para fusión
    bandejaEmpalme12: 45,       // Bandeja empalme 1U 12F
    bandejaEmpalme24: 65,       // Bandeja empalme 1U 24F
    cajaProtecEmpalme: 5,       // Caja protección de empalme
} as const;

const IVA_RATE = 0.21;

/* ═════════════════════════════════════
   DISPLAY DATA
   ═════════════════════════════════════ */

const FIBER_CABLE_TYPES = [
    { id: 'sm_2f' as const, name: 'Monomodo 2F', desc: 'SM G.657A', price: FIBER_CONFIG.cablePrices.sm_2f },
    { id: 'sm_4f' as const, name: 'Monomodo 4F', desc: 'SM interior', price: FIBER_CONFIG.cablePrices.sm_4f },
    { id: 'sm_12f' as const, name: 'Monomodo 12F', desc: 'SM multi-hilo', price: FIBER_CONFIG.cablePrices.sm_12f },
    { id: 'mm_om3' as const, name: 'Multimodo OM3', desc: '10Gb hasta 300m', price: FIBER_CONFIG.cablePrices.mm_om3 },
    { id: 'mm_om4' as const, name: 'Multimodo OM4', desc: '10Gb hasta 550m', price: FIBER_CONFIG.cablePrices.mm_om4 },
    { id: 'none' as const, name: 'Ninguno', desc: 'Sin cable', price: 0 },
];

const FIBER_INSTALL_TYPES = [
    { id: 'surface' as const, icon: '📌' },
    { id: 'ceiling' as const, icon: '🏗️' },
    { id: 'trunking' as const, icon: '📏' },
    { id: 'industrial' as const, icon: '🏭' },
];

const FIBER_RACK_OPTIONS = [
    { id: 'none' as const, price: 0 },
    { id: 'caja_mural_8f' as const, price: 35, icon: '📦' },
    { id: 'rack_fibra_6u' as const, price: 120, icon: '🗄️' },
    { id: 'rack_fibra_12u' as const, price: 200, icon: '🗄️' },
    { id: 'rack_fibra_22u' as const, price: 400, icon: '🏗️' },
];

const FIBER_URGENCY = [
    { id: 'normal' as const, multiplier: 1.0, icon: '🟢' },
    { id: 'urgente' as const, multiplier: 1.2, icon: '🟡' },
    { id: 'weekend' as const, multiplier: 1.5, icon: '🔴' },
];

/* ═════════════════════════════════════
   TRANSLATIONS
   ═════════════════════════════════════ */

const fiberLabels: Record<string, Record<string, string>> = {
    es: {
        title: 'Calculadora de Fibra Óptica',
        cableType: 'Tipo de fibra',
        points: 'Puntos de fibra',
        pointsHint: '1 punto = 1 roseta óptica (2 puertos SC/APC)',
        avgLength: 'Longitud media por punto',
        avgLengthHint: 'Metros de cable óptico promedio por punto',
        installType: 'Tipo de instalación',
        surface: 'Superficial',
        ceiling: 'Falso techo',
        trunking: 'Canaleta',
        industrial: 'Industrial (nave)',
        rack: 'Rack / Caja de fibra',
        none: 'Sin rack',
        caja_mural_8f: 'Caja mural 8F',
        rack_fibra_6u: 'Rack fibra pared 6U',
        rack_fibra_12u: 'Rack fibra pared 12U',
        rack_fibra_22u: 'Rack fibra suelo 22U',
        urgency: 'Urgencia',
        normal: 'Normal',
        urgente: 'Urgente (×1.2)',
        weekend: 'Fin de semana (×1.5)',
        // Opciones
        fusionLabel: 'Fusión (empalme por arco)',
        fusionHint: 'Empalme de fibras con fusionadora + pigtails SC/APC',
        fusionCount: 'fusiones',
        certificationLabel: 'Certificación OTDR',
        certificationHint: 'Medición y certificación de cada punto con OTDR',
        patchCordLabel: 'Patch cords SC/APC',
        patchCordHint: 'Latiguillos de fibra óptica duplex',
        acopladorLabel: 'Acopladores SC/APC hembra-hembra',
        acopladorHint: 'Para conectar patch cords entre sí (panel ↔ equipo)',
        bandejaLabel: 'Bandeja de empalme',
        bandeja12: 'Bandeja 1U 12F',
        bandeja24: 'Bandeja 1U 24F',
        // Breakdown
        cableCost: 'Cable de fibra',
        routingCost: 'Tendido de cable',
        laborCost: 'Mano de obra',
        fusionCost: 'Fusión de fibras',
        certificationCost: 'Certificación OTDR',
        rosetaCost: 'Rosetas ópticas',
        patchCordCost: 'Patch cords',
        acopladorCost: 'Acopladores',
        bandejaCost: 'Bandeja empalme',
        rackCost: 'Rack de fibra',
        subtotal: 'Subtotal',
        discount: 'Descuento',
        urgencyLabel: 'Recargo urgencia',
        iva: 'IVA (21%)',
        total: 'Total estimado',
        meters: 'metros',
        disclaimer: 'Precios orientativos. El presupuesto final puede variar según las condiciones del espacio.',
        requestQuote: 'Solicitar presupuesto',
        whatsappText: 'Hola, me gustaría un presupuesto de fibra óptica para',
        whatsappPoints: 'puntos de fibra',
        whatsappType: 'Tipo',
        whatsappEstimate: 'Estimación',
        // Tooltips
        tipCable: 'Coste del cable de fibra óptica según tipo (monomodo/multimodo). Precio por metro lineal.',
        tipRouting: 'Tendido físico del cable: pasar la fibra por falso techo, canaletas o canalizaciones. Precio según tipo de instalación.',
        tipLabor: 'Trabajo de los técnicos: preparar rutas, instalar rosetas, conexionado y pruebas. Coste por punto: 35€ base × coeficiente de instalación.',
        tipFusion: 'Empalme por arco (fusión): se unen las fibras con fusionadora profesional + pigtails SC/APC. Resultado: menor pérdida de señal que conectores mecánicos.',
        tipCert: 'Certificación OTDR: medición profesional de cada punto con reflectómetro. Verifica la calidad del empalme y la atenuación de la fibra.',
        tipRoseta: 'Roseta óptica de pared con 2 puertos SC/APC. Es el punto final donde se conecta el equipo del usuario.',
        tipPatchCord: 'Latiguillo de fibra óptica SC/APC duplex (3m). Conecta la roseta al equipo activo (ONT, switch óptico).',
        tipAcoplador: 'Acoplador hembra-hembra SC/APC: permite unir dos patch cords o conectar el patch cord del panel al del equipo.',
        tipBandeja: 'Bandeja de empalme para organizar las fusiones dentro del rack. Capacidad 12 o 24 fibras por bandeja.',
        tipRack: 'Armario para centralizar las conexiones de fibra: cajas murales (8F) para pequeñas instalaciones o racks de pared/suelo para edificios.',
        customItems: 'Partidas personalizadas',
        customItemsHint: 'Añade cualquier servicio extra o mano de obra sin material.',
        customItemName: 'Descripción',
        customItemQty: 'Cant.',
        customItemPrice: 'Precio/ud.',
        customItemTotal: 'Total',
        addCustomItem: '➕ Añadir por unidad',
        addFixedItem: '➕ Añadir partida global (sin cálculo)',
    },
    en: {
        title: 'Fiber Optic Calculator',
        cableType: 'Fiber type',
        points: 'Fiber points',
        pointsHint: '1 point = 1 optical outlet (2 SC/APC ports)',
        avgLength: 'Average length per point',
        avgLengthHint: 'Average fiber cable meters per point',
        installType: 'Installation type',
        surface: 'Surface mount',
        ceiling: 'Drop ceiling',
        trunking: 'Cable trunking',
        industrial: 'Industrial',
        rack: 'Fiber rack / enclosure',
        none: 'No rack',
        caja_mural_8f: 'Wall box 8F',
        rack_fibra_6u: 'Fiber wall rack 6U',
        rack_fibra_12u: 'Fiber wall rack 12U',
        rack_fibra_22u: 'Fiber floor rack 22U',
        urgency: 'Urgency',
        normal: 'Normal',
        urgente: 'Urgent (×1.2)',
        weekend: 'Weekend (×1.5)',
        fusionLabel: 'Fusion splicing',
        fusionHint: 'Arc fusion of fibers + SC/APC pigtails',
        fusionCount: 'splices',
        certificationLabel: 'OTDR certification',
        certificationHint: 'Measurement and certification of each point with OTDR',
        patchCordLabel: 'SC/APC patch cords',
        patchCordHint: 'Duplex fiber optic patch cables',
        acopladorLabel: 'SC/APC female-female adapters',
        acopladorHint: 'To connect patch cords (panel ↔ equipment)',
        bandejaLabel: 'Splice tray',
        bandeja12: 'Tray 1U 12F',
        bandeja24: 'Tray 1U 24F',
        cableCost: 'Fiber cable',
        routingCost: 'Cable routing',
        laborCost: 'Labor',
        fusionCost: 'Fusion splicing',
        certificationCost: 'OTDR certification',
        rosetaCost: 'Optical outlets',
        patchCordCost: 'Patch cords',
        acopladorCost: 'Adapters',
        bandejaCost: 'Splice tray',
        rackCost: 'Fiber rack',
        subtotal: 'Subtotal',
        discount: 'Discount',
        urgencyLabel: 'Urgency surcharge',
        iva: 'VAT (21%)',
        total: 'Estimated total',
        meters: 'meters',
        disclaimer: 'Prices are indicative. Final quote may vary depending on site conditions.',
        requestQuote: 'Request a quote',
        whatsappText: 'Hello, I would like a fiber optic quote for',
        whatsappPoints: 'fiber points',
        whatsappType: 'Type',
        whatsappEstimate: 'Estimate',
        // Tooltips
        tipCable: 'Fiber optic cable cost by type (singlemode/multimode). Price per linear meter.',
        tipRouting: 'Physical cable routing: pulling fiber through drop ceiling, trunking or ducts. Price varies by installation type.',
        tipLabor: 'Technician labor: preparing routes, installing outlets, connections and testing. Cost per point: 35€ base × installation coefficient.',
        tipFusion: 'Arc fusion splicing: fibers joined with professional splicer + SC/APC pigtails. Result: lower signal loss than mechanical connectors.',
        tipCert: 'OTDR certification: professional measurement of each point with reflectometer. Verifies splice quality and fiber attenuation.',
        tipRoseta: 'Wall-mount optical outlet with 2 SC/APC ports. The endpoint where user equipment connects.',
        tipPatchCord: 'SC/APC duplex fiber optic patch cord (3m). Connects the outlet to active equipment (ONT, optical switch).',
        tipAcoplador: 'SC/APC female-female adapter: joins two patch cords or connects panel patch cord to equipment.',
        tipBandeja: 'Splice tray to organize fusions inside the rack. Capacity: 12 or 24 fibers per tray.',
        tipRack: 'Cabinet to centralize fiber connections: wall boxes (8F) for small setups or wall/floor racks for buildings.',
        customItems: 'Custom line items',
        customItemsHint: 'Add any extra service or labor without materials.',
        customItemName: 'Description',
        customItemQty: 'Qty.',
        customItemPrice: 'Price/unit',
        customItemTotal: 'Total',
        addCustomItem: '➕ Add per unit',
        addFixedItem: '➕ Add fixed item (no calc)',
    },
    ru: {
        title: 'Калькулятор оптоволокна',
        cableType: 'Тип волокна',
        points: 'Точки подключения',
        pointsHint: '1 точка = 1 оптическая розетка (2 порта SC/APC)',
        avgLength: 'Средняя длина на точку',
        avgLengthHint: 'Средние метры оптического кабеля на точку',
        installType: 'Тип установки',
        surface: 'Открытый монтаж',
        ceiling: 'Фальшпотолок',
        trunking: 'Кабель-канал',
        industrial: 'Промышленный',
        rack: 'Оптический шкаф',
        none: 'Без шкафа',
        caja_mural_8f: 'Настенная коробка 8F',
        rack_fibra_6u: 'Шкаф настенный 6U',
        rack_fibra_12u: 'Шкаф настенный 12U',
        rack_fibra_22u: 'Шкаф напольный 22U',
        urgency: 'Срочность',
        normal: 'Обычная',
        urgente: 'Срочно (×1.2)',
        weekend: 'Выходные (×1.5)',
        fusionLabel: 'Сварка (дуговая)',
        fusionHint: 'Сварка волокон + пигтейлы SC/APC',
        fusionCount: 'сварок',
        certificationLabel: 'Сертификация OTDR',
        certificationHint: 'Измерение и сертификация каждой точки OTDR',
        patchCordLabel: 'Патч-корды SC/APC',
        patchCordHint: 'Оптические патч-корды duplex',
        acopladorLabel: 'Адаптеры SC/APC мама-мама',
        acopladorHint: 'Для соединения патч-кордов (панель ↔ оборудование)',
        bandejaLabel: 'Сплайс-кассета',
        bandeja12: 'Кассета 1U 12F',
        bandeja24: 'Кассета 1U 24F',
        cableCost: 'Оптический кабель',
        routingCost: 'Прокладка кабеля',
        laborCost: 'Работа',
        fusionCost: 'Сварка волокон',
        certificationCost: 'Сертификация OTDR',
        rosetaCost: 'Оптические розетки',
        patchCordCost: 'Патч-корды',
        acopladorCost: 'Адаптеры',
        bandejaCost: 'Сплайс-кассета',
        rackCost: 'Оптический шкаф',
        subtotal: 'Подитог',
        discount: 'Скидка',
        urgencyLabel: 'Наценка за срочность',
        iva: 'НДС (21%)',
        total: 'Итого (ориентировочно)',
        meters: 'метров',
        disclaimer: 'Цены ориентировочные. Окончательная смета может измениться.',
        requestQuote: 'Запросить смету',
        whatsappText: 'Здравствуйте, хочу запросить смету на оптоволокно для',
        whatsappPoints: 'точек',
        whatsappType: 'Тип',
        whatsappEstimate: 'Оценка',
        // Tooltips
        tipCable: 'Стоимость оптического кабеля по типу (одномод/многомод). Цена за погонный метр.',
        tipRouting: 'Прокладка кабеля: протяжка волокна через фальшпотолок, кабель-каналы или штробы. Цена зависит от типа установки.',
        tipLabor: 'Работа техников: подготовка трасс, установка розеток, подключение и тестирование. 35€ за точку × коэффициент сложности.',
        tipFusion: 'Сварка дугой: волокна соединяются сварочным аппаратом + пигтейлы SC/APC. Результат: минимальные потери сигнала.',
        tipCert: 'Сертификация OTDR: профессиональное измерение каждой точки рефлектометром. Проверяет качество сварки и затухание.',
        tipRoseta: 'Оптическая розетка на 2 порта SC/APC. Конечная точка подключения оборудования пользователя.',
        tipPatchCord: 'Оптический патч-корд SC/APC duplex (3м). Соединяет розетку с активным оборудованием.',
        tipAcoplador: 'Адаптер SC/APC мама-мама: для соединения двух патч-кордов или подключения панели к оборудованию.',
        tipBandeja: 'Сплайс-кассета для организации сварок внутри шкафа. Вместимость: 12 или 24 волокна.',
        tipRack: 'Шкаф для централизации оптических подключений: настенные коробки (8F) или шкафы для зданий.',
        customItems: 'Доп. позиции',
        customItemsHint: 'Добавьте работу или материалы вручную',
        customItemName: 'Описание',
        customItemQty: 'Кол-во',
        customItemPrice: 'Цена/шт',
        customItemTotal: 'Сумма',
        addCustomItem: '➕ Добавить',
        addFixedItem: '➕ Добавить общую позицию (без расчетов)',
    },
};

/* ═════════════════════════════════════
   COMPONENT
   ═════════════════════════════════════ */

export interface FiberCalcResult {
    cableType: string;
    cableMeters: number;
    points: number;
    installationType: string;
    fusionCount: number;
    patchCordCount: number;
    acopladorCount: number;
    bandeja: string;
    rack: string;
    urgency: string;
    cableCost: number;
    routingCost: number;
    laborCost: number;
    fusionCost: number;
    certificationCost: number;
    rosetaCost: number;
    patchCordCost: number;
    acopladorCost: number;
    bandejaCost: number;
    rackCost: number;
    customItemsCost: number;
    subtotal: number;
    discount: number;
    discountPercent: number;
    urgencyMultiplier: number;
    iva: number;
    total: number;
}

interface FiberCalculatorProps {
    locale: string;
    onCalcUpdate?: (data: FiberCalcResult) => void;
}

export default function FiberCalculator({ locale, onCalcUpdate }: FiberCalculatorProps) {
    const l = fiberLabels[locale] || fiberLabels.es;

    // State
    const [cableType, setCableType] = useState<keyof typeof FIBER_CONFIG.cablePrices | 'none'>('sm_2f');
    const [points, setPoints] = useState(0);
    const [avgLength, setAvgLength] = useState(0);
    const [installType, setInstallType] = useState<keyof typeof FIBER_CONFIG.installationMultiplier>('ceiling');
    const [fusionCount, setFusionCount] = useState(0); // default: points × 2 fibras
    const [doCertification, setDoCertification] = useState(false);
    const [patchCordCount, setPatchCordCount] = useState(0);
    const [acopladorCount, setAcopladorCount] = useState(0);
    const [bandeja, setBandeja] = useState<'none' | 'bandeja12' | 'bandeja24'>('none');
    const [rack, setRack] = useState('none');
    const [urgency, setUrgency] = useState('normal');

    const [customItems, setCustomItems] = useState<Array<{ id: string; type: 'unit' | 'fixed'; name: string; qty?: number; price: number }>>([]);
    const addCustomItem = () => setCustomItems(prev => [...prev, { id: crypto.randomUUID(), type: 'unit', name: '', qty: 1, price: 0 }]);
    const addFixedItem = () => setCustomItems(prev => [...prev, { id: crypto.randomUUID(), type: 'fixed', name: '', price: 0 }]);
    const removeCustomItem = (id: string) => setCustomItems(prev => prev.filter(i => i.id !== id));
    const updateCustomItem = (id: string, field: 'name' | 'qty' | 'price', value: string | number) =>
        setCustomItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));

    const calc = useMemo(() => {
        const totalCableLength = points * avgLength;
        const cablePrice = cableType === 'none' ? 0 : FIBER_CONFIG.cablePrices[cableType as keyof typeof FIBER_CONFIG.cablePrices];
        const cableCost = totalCableLength * cablePrice;

        const installMult = FIBER_CONFIG.installationMultiplier[installType];
        const routingPrice = FIBER_CONFIG.routingPricePerMeter[installType];
        const routingCost = totalCableLength * routingPrice;

        const laborCost = points * FIBER_CONFIG.laborPerPoint * installMult;
        const fusionCost = fusionCount * FIBER_CONFIG.fusionPerSplice;
        const certificationCost = doCertification ? points * FIBER_CONFIG.certificationPerPoint : 0;
        const rosetaCost = points * FIBER_CONFIG.rosetaOptica;
        const patchCordCost = patchCordCount * FIBER_CONFIG.patchCordFibra;
        const acopladorCost = acopladorCount * FIBER_CONFIG.acopladorScApc;

        let bandejaCost = 0;
        if (bandeja === 'bandeja12') bandejaCost = FIBER_CONFIG.bandejaEmpalme12;
        if (bandeja === 'bandeja24') bandejaCost = FIBER_CONFIG.bandejaEmpalme24;

        const rackOption = FIBER_RACK_OPTIONS.find(r => r.id === rack) || FIBER_RACK_OPTIONS[0];
        const rackCost = rackOption.price;

        const customItemsCost = customItems.reduce((sum, item) => {
            if (item.type === 'fixed') return sum + (item.price || 0);
            return sum + (item.qty || 0) * (item.price || 0);
        }, 0);

        const subtotal = cableCost + routingCost + laborCost + fusionCost + certificationCost + rosetaCost + patchCordCost + acopladorCost + bandejaCost + rackCost + customItemsCost;

        let discountPercent = 0;
        if (points >= 10) discountPercent = 10;
        else if (points >= 4) discountPercent = 5;
        const discount = subtotal * (discountPercent / 100);

        const urgencyOption = FIBER_URGENCY.find(u => u.id === urgency) || FIBER_URGENCY[0];
        const afterUrgency = (subtotal - discount) * urgencyOption.multiplier;

        const iva = afterUrgency * IVA_RATE;
        const total = afterUrgency + iva;

        const result: FiberCalcResult = {
            cableType, cableMeters: totalCableLength, points, installationType: installType,
            fusionCount, patchCordCount, acopladorCount, bandeja, rack, urgency,
            cableCost, routingCost, laborCost, fusionCost, certificationCost,
            rosetaCost, patchCordCost, acopladorCost, bandejaCost, rackCost, customItemsCost,
            subtotal, discount, discountPercent, urgencyMultiplier: urgencyOption.multiplier,
            iva, total,
        };

        onCalcUpdate?.(result);
        return { ...result, totalCableLength, urgencyOption };
    }, [cableType, points, avgLength, installType, fusionCount, doCertification, patchCordCount, acopladorCount, bandeja, rack, urgency, customItems, onCalcUpdate]);

    const btnClass = (active: boolean) => `p-4 rounded-lg border text-center transition-all duration-200 ${active
        ? 'bg-[rgba(0,180,255,0.1)] border-cyan-400 text-cyan-300'
        : 'bg-surface-card border-border-subtle text-brand-gold-muted hover:border-cyan-400/30'}`;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT — Configuration */}
            <div className="lg:col-span-2 space-y-6">

                {/* Fiber Cable Type */}
                <div className="card p-6">
                    <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                        🔆 {l.cableType}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {FIBER_CABLE_TYPES.map((cable) => (
                            <button
                                key={cable.id}
                                onClick={() => setCableType(cable.id)}
                                className={btnClass(cableType === cable.id)}
                            >
                                <div className="font-heading font-bold text-sm">{cable.name}</div>
                                <div className="text-[11px] mt-0.5 opacity-70">{cable.desc}</div>
                                <div className="text-sm mt-1">{cable.price}€/m</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Points */}
                <div className="card p-6">
                    <h3 className="font-heading font-semibold text-white mb-1 flex items-center gap-2">
                        📊 {l.points}
                    </h3>
                    <p className="text-xs text-brand-gold-muted mb-4">{l.pointsHint}</p>
                    <div className="flex items-center gap-4">
                        <button onClick={() => { setPoints(Math.max(0, points - 1)); setFusionCount(Math.max(0, points - 1) * 2); }}
                            className="w-12 h-12 rounded-lg bg-surface-card border border-border-subtle text-white hover:border-cyan-400/50 transition-colors text-xl font-bold">−</button>
                        <div className="flex-1">
                            <input type="range" min={0} max={100} value={points}
                                onChange={(e) => { const v = Number(e.target.value); setPoints(v); setFusionCount(v * 2); }}
                                className="w-full accent-cyan-400 h-2 rounded-full appearance-none bg-surface-card cursor-pointer" />
                        </div>
                        <button onClick={() => { setPoints(Math.min(100, points + 1)); setFusionCount(Math.min(100, points + 1) * 2); }}
                            className="w-12 h-12 rounded-lg bg-surface-card border border-border-subtle text-white hover:border-cyan-400/50 transition-colors text-xl font-bold">+</button>
                        <div className="w-16 text-center">
                            <span className="font-heading text-2xl font-bold text-cyan-300">{points}</span>
                        </div>
                    </div>
                    {calc.discountPercent > 0 && (
                        <div className="mt-2 text-xs text-green-400">🎉 {l.discount}: -{calc.discountPercent}% ({points >= 10 ? '10+ puntos' : '4+ puntos'})</div>
                    )}
                </div>

                {/* Average Length */}
                <div className="card p-6">
                    <h3 className="font-heading font-semibold text-white mb-1 flex items-center gap-2">
                        📐 {l.avgLength}
                    </h3>
                    <p className="text-xs text-brand-gold-muted mb-4">{l.avgLengthHint}</p>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setAvgLength(Math.max(0, avgLength - 5))}
                            className="w-12 h-12 rounded-lg bg-surface-card border border-border-subtle text-white hover:border-cyan-400/50 transition-colors text-xl font-bold">−</button>
                        <div className="flex-1">
                            <input type="range" min={0} max={200} value={avgLength}
                                onChange={(e) => setAvgLength(Number(e.target.value))}
                                className="w-full accent-cyan-400 h-2 rounded-full appearance-none bg-surface-card cursor-pointer" />
                        </div>
                        <button onClick={() => setAvgLength(Math.min(200, avgLength + 5))}
                            className="w-12 h-12 rounded-lg bg-surface-card border border-border-subtle text-white hover:border-cyan-400/50 transition-colors text-xl font-bold">+</button>
                        <div className="w-16 text-center">
                            <span className="font-heading text-2xl font-bold text-cyan-300">{avgLength}</span>
                            <span className="text-xs text-brand-gold-muted ml-1">m</span>
                        </div>
                    </div>
                    <p className="text-xs text-brand-gold-muted mt-2">📏 Total: {calc.totalCableLength}m de fibra</p>
                </div>

                {/* Installation Type */}
                <div className="card p-6">
                    <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                        🏗️ {l.installType}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {FIBER_INSTALL_TYPES.map((inst) => (
                            <button
                                key={inst.id}
                                onClick={() => setInstallType(inst.id)}
                                className={btnClass(installType === inst.id)}
                            >
                                <div className="text-2xl mb-1">{inst.icon}</div>
                                <div className="text-sm">{l[inst.id]}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Fusión y Certificación */}
                <div className="card p-6">
                    <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                        🔥 {l.fusionLabel}
                    </h3>
                    <p className="text-xs text-brand-gold-muted mb-4">{l.fusionHint}</p>
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-sm text-brand-gold-muted">{l.fusionCount}:</span>
                        <button onClick={() => setFusionCount(Math.max(0, fusionCount - 1))}
                            className="w-10 h-10 rounded-lg bg-surface-card border border-border-subtle text-white hover:border-cyan-400/50 text-lg font-bold">−</button>
                        <span className="font-heading text-xl font-bold text-cyan-300 w-12 text-center">{fusionCount}</span>
                        <button onClick={() => setFusionCount(fusionCount + 1)}
                            className="w-10 h-10 rounded-lg bg-surface-card border border-border-subtle text-white hover:border-cyan-400/50 text-lg font-bold">+</button>
                        <span className="text-xs text-brand-gold-muted">× {FIBER_CONFIG.fusionPerSplice}€ = {(fusionCount * FIBER_CONFIG.fusionPerSplice).toFixed(2)}€</span>
                    </div>

                    {/* Temporarily disabled until equipment is acquired
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={doCertification} onChange={(e) => setDoCertification(e.target.checked)}
                            className="w-5 h-5 rounded accent-cyan-400" />
                        <div>
                            <div className="text-sm text-white">{l.certificationLabel}</div>
                            <div className="text-xs text-brand-gold-muted">{l.certificationHint} — {FIBER_CONFIG.certificationPerPoint}€/pto</div>
                        </div>
                    </label>
                    */}
                </div>

                {/* Patch cords & Acopladores */}
                <div className="card p-6">
                    <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                        🔗 Conectores y latiguillos
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Patch cords */}
                        <div>
                            <div className="text-sm text-white mb-1">{l.patchCordLabel}</div>
                            <div className="text-xs text-brand-gold-muted mb-3">{l.patchCordHint} — {FIBER_CONFIG.patchCordFibra}€/ud</div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setPatchCordCount(Math.max(0, patchCordCount - 1))}
                                    className="w-10 h-10 rounded-lg bg-surface-card border border-border-subtle text-white hover:border-cyan-400/50 text-lg font-bold">−</button>
                                <span className="font-heading text-xl font-bold text-cyan-300 w-10 text-center">{patchCordCount}</span>
                                <button onClick={() => setPatchCordCount(patchCordCount + 1)}
                                    className="w-10 h-10 rounded-lg bg-surface-card border border-border-subtle text-white hover:border-cyan-400/50 text-lg font-bold">+</button>
                            </div>
                        </div>
                        {/* Acopladores hembra-hembra */}
                        <div>
                            <div className="text-sm text-white mb-1">{l.acopladorLabel}</div>
                            <div className="text-xs text-brand-gold-muted mb-3">{l.acopladorHint} — {FIBER_CONFIG.acopladorScApc}€/ud</div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setAcopladorCount(Math.max(0, acopladorCount - 1))}
                                    className="w-10 h-10 rounded-lg bg-surface-card border border-border-subtle text-white hover:border-cyan-400/50 text-lg font-bold">−</button>
                                <span className="font-heading text-xl font-bold text-cyan-300 w-10 text-center">{acopladorCount}</span>
                                <button onClick={() => setAcopladorCount(acopladorCount + 1)}
                                    className="w-10 h-10 rounded-lg bg-surface-card border border-border-subtle text-white hover:border-cyan-400/50 text-lg font-bold">+</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bandeja de empalme */}
                <div className="card p-6">
                    <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                        📋 {l.bandejaLabel}
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        {(['none', 'bandeja12', 'bandeja24'] as const).map(b => (
                            <button key={b} onClick={() => setBandeja(b)}
                                className={btnClass(bandeja === b)}>
                                <div className="text-sm">{b === 'none' ? l.none : l[b]}</div>
                                <div className="text-xs mt-1">
                                    {b === 'none' ? '—' : b === 'bandeja12' ? `${FIBER_CONFIG.bandejaEmpalme12}€` : `${FIBER_CONFIG.bandejaEmpalme24}€`}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Rack */}
                <div className="card p-6">
                    <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                        🗄️ {l.rack}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {FIBER_RACK_OPTIONS.map(r => (
                            <button key={r.id} onClick={() => setRack(r.id)}
                                className={btnClass(rack === r.id)}>
                                <div className="text-lg mb-1">{r.icon || '❌'}</div>
                                <div className="text-xs">{l[r.id]}</div>
                                <div className="text-sm font-bold mt-1">{r.price > 0 ? `${r.price}€` : '—'}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Urgency */}
                <div className="card p-6">
                    <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                        ⏱ {l.urgency}
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        {FIBER_URGENCY.map(u => (
                            <button key={u.id} onClick={() => setUrgency(u.id)}
                                className={btnClass(urgency === u.id)}>
                                <div className="text-lg">{u.icon}</div>
                                <div className="text-xs mt-1">{l[u.id]}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom Items */}
                <div className="card p-6 border-cyan-400/10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                        <h3 className="font-heading font-semibold text-white flex items-center gap-2">
                            ✍️ {l.customItems}
                        </h3>
                        <div className="flex items-center gap-2">
                            <button onClick={addCustomItem} className="text-xs px-3 py-1.5 rounded-lg border border-cyan-300/40 text-cyan-300 hover:bg-[rgba(0,180,255,0.1)] transition-colors">
                                {l.addCustomItem}
                            </button>
                            <button onClick={addFixedItem} className="text-xs px-3 py-1.5 rounded-lg border border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/10 transition-colors">
                                {l.addFixedItem}
                            </button>
                        </div>
                    </div>
                    <p className="text-xs text-brand-gold-muted mb-4">{l.customItemsHint}</p>
                    
                    <div className="space-y-3">
                        {customItems.map((item) => {
                            const isFixed = item.type === 'fixed';
                            return (
                            <div key={item.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-background/50 p-3 rounded-lg border border-border-subtle">
                                <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => updateCustomItem(item.id, 'name', e.target.value)}
                                    placeholder={l.customItemName}
                                    className="flex-1 bg-surface-card border-none outline-none text-sm text-white px-3 py-2 rounded"
                                />
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    {isFixed ? (
                                        <div className="w-20 bg-surface-card border-none text-sm text-brand-gold-muted px-3 py-2 rounded text-center opacity-50 cursor-not-allowed">—</div>
                                    ) : (
                                        <input
                                            type="number"
                                            min="0"
                                            value={item.qty || ''}
                                            onChange={(e) => updateCustomItem(item.id, 'qty', Number(e.target.value))}
                                            placeholder={l.customItemQty}
                                            className="w-20 bg-surface-card border-none outline-none text-sm text-white px-3 py-2 rounded text-center focus:border-cyan-400/50"
                                        />
                                    )}
                                    <span className="text-brand-gold-muted text-xs">×</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.price || ''}
                                        onChange={(e) => updateCustomItem(item.id, 'price', Number(e.target.value))}
                                        placeholder={isFixed ? l.customItemTotal : l.customItemPrice}
                                        className={`w-24 bg-surface-card border-none outline-none text-sm px-3 py-2 rounded text-center focus:outline-none ${isFixed ? 'text-cyan-300 focus:border-cyan-400/50' : 'text-white focus:border-white/50'}`}
                                    />
                                    <span className="text-brand-gold-muted text-xs">€</span>
                                    <button
                                        onClick={() => removeCustomItem(item.id)}
                                        className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-400/20 rounded ml-1 transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        )})}
                    </div>
                </div>
            </div>

            {/* RIGHT — Price Breakdown */}
            <div className="lg:col-span-1">
                <div className="card p-6 sticky top-24 border-cyan-400/20">
                    <h3 className="font-heading font-semibold text-white text-lg mb-4 text-center">
                        🔆 {l.title}
                    </h3>

                    <div className="space-y-2 text-sm mb-6">
                        {[
                            { label: l.cableCost, value: calc.cableCost, show: true, tip: l.tipCable },
                            { label: l.routingCost, value: calc.routingCost, show: true, tip: l.tipRouting },
                            { label: l.laborCost, value: calc.laborCost, show: true, tip: l.tipLabor },
                            { label: l.fusionCost, value: calc.fusionCost, show: fusionCount > 0, tip: l.tipFusion },
                            { label: l.certificationCost, value: calc.certificationCost, show: doCertification, tip: l.tipCert },
                            { label: l.rosetaCost, value: calc.rosetaCost, show: true, tip: l.tipRoseta },
                            { label: l.patchCordCost, value: calc.patchCordCost, show: patchCordCount > 0, tip: l.tipPatchCord },
                            { label: l.acopladorCost, value: calc.acopladorCost, show: acopladorCount > 0, tip: l.tipAcoplador },
                            { label: l.bandejaCost, value: calc.bandejaCost, show: bandeja !== 'none', tip: l.tipBandeja },
                            { label: l.rackCost, value: calc.rackCost, show: rack !== 'none', tip: l.tipRack },
                            { label: l.customItems, value: calc.customItemsCost, show: calc.customItemsCost > 0, tip: l.customItemsHint },
                        ].filter(i => i.show).map((item, idx) => (
                            <div key={idx} className="flex justify-between text-brand-gold-muted">
                                <span className="flex items-center gap-1">{item.label} <span className="text-xs opacity-50 cursor-help" title={item.tip}>ℹ️</span></span>
                                <span>{item.value.toFixed(2)}€</span>
                            </div>
                        ))}

                        <div className="h-px bg-border-subtle my-2" />
                        <div className="flex justify-between font-semibold text-white">
                            <span>{l.subtotal}</span>
                            <span>{calc.subtotal.toFixed(2)}€</span>
                        </div>

                        {calc.discountPercent > 0 && (
                            <div className="flex justify-between text-green-400">
                                <span>{l.discount} (-{calc.discountPercent}%)</span>
                                <span>-{calc.discount.toFixed(2)}€</span>
                            </div>
                        )}

                        {calc.urgencyOption.multiplier > 1 && (
                            <div className="flex justify-between text-yellow-400">
                                <span>{l.urgencyLabel}</span>
                                <span>×{calc.urgencyOption.multiplier}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-brand-gold-muted">
                            <span>{l.iva}</span>
                            <span>{calc.iva.toFixed(2)}€</span>
                        </div>

                        <div className="h-px bg-border-subtle" />
                    </div>

                    {/* TOTAL */}
                    <div className="text-center mb-6">
                        <div className="text-xs text-brand-gold-muted uppercase tracking-wider mb-1">{l.total}</div>
                        <div className="font-heading text-4xl font-extrabold text-cyan-300">
                            {calc.total.toFixed(2)}€
                        </div>
                    </div>

                    <button
                        onClick={() => document.getElementById('fiber-quote-form')?.scrollIntoView({ behavior: 'smooth' })}
                        className="btn-gold w-full justify-center text-base py-4 mb-4"
                    >
                        {l.requestQuote} →
                    </button>

                    <a
                        href={`https://wa.me/34605974605?text=${encodeURIComponent(
                            `${l.whatsappText} ${points} ${l.whatsappPoints} (${calc.totalCableLength}m ${FIBER_CABLE_TYPES.find(c => c.id === cableType)!.name}). ${l.whatsappType}: ${l[installType]}. ${l.whatsappEstimate}: ${calc.total.toFixed(2)}€`
                        )}`}
                        target="_blank"
                        rel="noopener"
                        className="btn-outline w-full justify-center text-sm py-3"
                    >
                        💬 WhatsApp
                    </a>

                    <p className="text-xs text-brand-gold-muted text-center mt-4 leading-relaxed">
                        ℹ️ {l.disclaimer}
                    </p>
                </div>
            </div>

            {/* QUOTE FORM — full width below */}
            <div id="fiber-quote-form" className="lg:col-span-3">
                <div className="card p-6 border-cyan-400/20">
                    <QuoteForm
                        locale={locale}
                        calculationData={{
                            cableType: `Fibra ${FIBER_CABLE_TYPES.find(c => c.id === cableType)?.name || cableType}`,
                            cableMeters: calc.totalCableLength,
                            points,
                            installationType: `Fibra - ${installType}`,
                            installationMeters: calc.totalCableLength,
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
                            additionalWork: {
                                fusion: fusionCount > 0,
                                otdr: doCertification,
                            },
                            rack,
                            urgency,
                            cablesCost: calc.cableCost,
                            pointsCost: calc.rosetaCost,
                            installCost: calc.routingCost,
                            laborCost: calc.laborCost,
                            materialsCost: calc.fusionCost + calc.patchCordCost + calc.acopladorCost + calc.bandejaCost,
                            workCost: calc.certificationCost,
                            rackCost: calc.rackCost,
                            customItems,
                            subtotal: calc.subtotal,
                            urgencyMultiplier: calc.urgencyOption.multiplier,
                            iva: calc.iva,
                            total: calc.total,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
