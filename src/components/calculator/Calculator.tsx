'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import QuoteForm from './QuoteForm';
import FiberCalculator, { FiberCalcResult } from './FiberCalculator';

/* ═════════════════════════════════════
   CONFIG — реальные цены Испании
   (можно менять без изменения UI)
   ═════════════════════════════════════ */

const CONFIG = {
    cablePrices: { cat5: 0.30, cat6: 0.55, cat6a: 1.10, cat7: 2.00 },
    laborPerPoint: { basic: 30, conduit: 50, advanced: 90 },
    cableMultiplier: { cat5: 1.0, cat6: 1.1, cat6a: 1.25, cat7: 1.4 },
    installationMultiplier: {
        external: 1.0, ceiling: 1.1, existing_wall: 1.2,
        new_wall: 1.0, // штроба считается отдельно
        industrial: 1.5, trays: 1.4,
    },
    /* Стоимость прокладки кабеля за метр (физическая протяжка) */
    routingPricePerMeter: {
        external: 2,       // наружная прокладка по кабель-каналу
        ceiling: 4,        // через подвесной потолок
        existing_wall: 5,  // через существующие каналы в стене
        new_wall: 8,       // прокладка в новой штробе
        industrial: 9,     // промышленные помещения (высота, сложность)
        trays: 5,          // лотки / бандежи
    },
    trenchPricePerMeter: 45,
    materials: { keystone: 6, socket: 10, trunking: 4, pvc: 2, corrugated: 1, patchPanel12: 40, patchPanel24: 65, patchPanel48: 100, laborHour: 60 },
    equipment: { router: 50, switch: 40, accessPoint: 70, configuration: 150 },
    upsell: { testing: 50, labeling: 20, cableManagement: 50, extendedWarranty: 30 },
} as const;

const IVA_RATE = 0.21;

/* ═════════════════════════════════════
   DISPLAY DATA for UI buttons
   ═════════════════════════════════════ */

const CABLE_TYPES = [
    { id: 'cat5' as const, name: 'Cat 5e', price: CONFIG.cablePrices.cat5 },
    { id: 'cat6' as const, name: 'Cat 6', price: CONFIG.cablePrices.cat6 },
    { id: 'cat6a' as const, name: 'Cat 6A', price: CONFIG.cablePrices.cat6a },
    { id: 'cat7' as const, name: 'Cat 7', price: CONFIG.cablePrices.cat7 },
    { id: 'none' as const, name: 'Ninguno', price: 0 },
];

const INSTALLATION_TYPES = [
    { id: 'external' as const, icon: '📌' },
    { id: 'ceiling' as const, icon: '🏗️' },
    { id: 'existing_wall' as const, icon: '🔩' },
    { id: 'new_wall' as const, icon: '🧱' },
    { id: 'industrial' as const, icon: '🏭' },
    { id: 'trays' as const, icon: '🔗' },
];

const RACK_OPTIONS = [
    { id: 'none' as const, price: 0 },
    { id: 'rack_6u' as const, price: 90, icon: '🗄️' },
    { id: 'rack_9u' as const, price: 130, icon: '🗄️' },
    { id: 'rack_12u' as const, price: 180, icon: '🗄️' },
    { id: 'rack_18u' as const, price: 250, icon: '🏗️' },
    { id: 'rack_22u' as const, price: 380, icon: '🏗️' },
    { id: 'rack_42u' as const, price: 650, icon: '⚡' },
];

const URGENCY_LEVELS = [
    { id: 'normal' as const, multiplier: 1.0, icon: '🟢' },
    { id: 'urgente' as const, multiplier: 1.2, icon: '🟡' },
    { id: 'weekend' as const, multiplier: 1.5, icon: '🔴' },
];

const EQUIPMENT_LIST = [
    { id: 'router' as const, price: CONFIG.equipment.router, icon: '📡' },
    { id: 'switch' as const, price: CONFIG.equipment.switch, icon: '🔌' },
    { id: 'accessPoint' as const, price: CONFIG.equipment.accessPoint, icon: '📶' },
    { id: 'configuration' as const, price: CONFIG.equipment.configuration, icon: '⚙️' },
];

const UPSELL_LIST = [
    { id: 'testing' as const, price: CONFIG.upsell.testing, icon: '🔍' },
    { id: 'labeling' as const, price: CONFIG.upsell.labeling, icon: '🏷️' },
    { id: 'cableManagement' as const, price: CONFIG.upsell.cableManagement, icon: '📦' },
    { id: 'extendedWarranty' as const, price: CONFIG.upsell.extendedWarranty, icon: '🛡️' },
];

const ADDITIONAL_MATERIALS = [
    { id: 'trunking' as const, price: CONFIG.materials.trunking, unit: 'm', icon: '📏' },
    { id: 'pvc' as const, price: CONFIG.materials.pvc, unit: 'm', icon: '🔧' },
    { id: 'corrugated' as const, price: CONFIG.materials.corrugated, unit: 'm', icon: '⚒️' },
    { id: 'laborHour' as const, price: CONFIG.materials.laborHour, unit: 'h', icon: '👷' },
];

const PATCH_PANEL_OPTIONS = [
    { id: 'pp12' as const, ports: 12, price: CONFIG.materials.patchPanel12, icon: '🔗' },
    { id: 'pp24' as const, ports: 24, price: CONFIG.materials.patchPanel24, icon: '🔗' },
    { id: 'pp48' as const, ports: 48, price: CONFIG.materials.patchPanel48, icon: '🔗' },
];

/* ═════════════════════════════════════
   TRANSLATIONS
   ═════════════════════════════════════ */

const calcLabels: Record<string, Record<string, string>> = {
    es: {
        cableType: 'Tipo de cable',
        points: 'Puntos de red',
        pointsHint: '1 punto = 1 roseta de red. Incluye por punto: cable hasta la roseta + 2 conectores Keystone (6€ c/u) + 1 roseta embellecedora (10€) + mano de obra según tipo (30–90€/pto)',
        avgLength: 'Longitud media por punto',
        avgLengthHint: 'Distancia media de cable desde el armario/switch central hasta cada roseta. Determina el coste total de cable y el tendido',
        installType: 'Tipo de instalación',
        trench: 'Regata',
        canaleta: 'Canaleta (cable canal)',
        canetaFull: 'Longitud completa (= largo total del cable)',
        canetaManual: 'Introducir metros manualmente',
        canetaLength: 'Metros de canaleta',
        canetaHint: 'Sólo se muestra si el tipo es "Superficial"',
        trenchFull: 'Longitud completa (= largo total del cable)',
        trenchManual: 'Introducir metros manualmente',
        trenchLength: 'Metros de regata',
        trenchHint: 'Sólo se muestra si el tipo es "Empotrado nuevo"',
        materials: 'Opcional',
        equipment: 'Equipamiento',
        rack: 'Armario de red (Rack)',
        upsell: 'Servicios adicionales',
        urgency: 'Urgencia',
        subtotal: 'Subtotal',
        iva: 'IVA (21%)',
        discount: 'Descuento',
        urgencyLabel: 'Recargo urgencia',
        total: 'Total estimado',
        routingCost: 'Tendido de cable',
        rackCost: 'Armario de red',
        totalCableLength: 'Longitud total de cable',
        cableCost: 'Coste del cable',
        laborCost: 'Coste de mano de obra',
        trenchCost: 'Coste de regata',
        materialsCostLabel: 'Materiales por punto',
        additionalMaterialsCost: 'Materiales adicionales',
        equipmentCost: 'Equipamiento',
        upsellCost: 'Servicios adicionales',
        requestQuote: 'Solicitar Presupuesto Detallado',
        disclaimer: 'Precios orientativos. El presupuesto final puede variar según las condiciones del espacio.',
        recommended: '★ Recomendado',
        // Tooltips
        tipCable: 'Coste del cable de red según el tipo seleccionado. A mayor categoría (Cat5e→Cat7), mayor velocidad y blindaje, pero mayor coste.',
        tipLabor: 'Trabajo de los técnicos: instalación de rosetas, conexión de cables (crimpado), montaje y testeo de cada punto. Se calcula por tipo: Básico (30€/pto), Conducto (50€/pto), Avanzado (90€/pto).',
        tipRouting: 'Tendido físico del cable por la ruta: pasar cables por el techo, canaletas o paredes. El precio varía según el tipo de instalación.',
        tipTrench: 'Apertura de regata (canal en la pared) para empotrar el cable. Incluye corte, colocación del tubo y sellado posterior.',
        tipCanaleta: 'Canal de plástico que se fija a la pared o techo para proteger y ocultar los cables. Precio por metro lineal.',
        tipMaterials: 'Materials per point: 2 Keystone connectors (6€ ea) + 1 network outlet (10€). Applied automatically per point.',
        tipRack: 'Armario de red para centralizar las conexiones. Contiene patch panels, switches y organizadores de cables.',
        tipEquipment: 'Equipos activos de red: routers, switches gestionables, puntos de acceso WiFi y configuración profesional.',
        tipUpsell: 'Servicios adicionales: verificación con equipo profesional, etiquetado de cada cable, gestión y organización dentro del rack.',
        // Installation types
        external: 'Superficial (Canaleta)',
        ceiling: 'Techo técnico',
        existing_wall: 'Empotrado existente',
        new_wall: 'Empotrado nuevo (regata)',
        industrial: 'Industrial (Nave)',
        trays: 'Bandejas portacables',
        // Racks
        none: 'Sin armario',
        rack_6u: 'Rack pared 6U',
        rack_9u: 'Rack pared 9U',
        rack_12u: 'Rack pared 12U',
        rack_18u: 'Rack pared 18U',
        rack_22u: 'Rack suelo 22U',
        rack_42u: 'Rack suelo 42U (servidor)',
        // Equipment
        router: 'Router',
        switch: 'Switch gestionable',
        accessPoint: 'Punto de acceso WiFi',
        configuration: 'Configuración de red',
        // Upsell
        testing: 'Testeo y verificación',
        labeling: 'Etiquetado profesional',
        cableManagement: 'Organización de cables',
        extendedWarranty: 'Garantía extendida',
        // Materials
        trunking: 'Canaleta',
        pvc: 'Tubo PVC',
        corrugated: 'Tubo corrugado',
        laborHour: 'Mano de obra',
        patchPanel: 'Patch panel',
        // Urgency
        normal: 'Normal',
        urgente: 'Urgente (×1.2)',
        weekend: 'Fin de semana (×1.5)',
        meters: 'metros',
        installCoeffExplanation: 'ℹ️ El coeficiente refleja la dificultad del entorno. «Émpotrado nuevo» (×1.0) incluye regata aparte (45€/m). «Émpotrado existente» (×1.2) es más lento porque hay que pasar el cable por canalizaciones ya existentes sin romper la pared.',
        installDisabled: 'Selecciona al menos 1 punto de red o longitud de cable para activar el tipo de instalación.',
        patchPanelSection: 'Patch Panel (instalación + crimpado de puertos)',
        patchPanelHint: 'Precio de montaje en rack e instalación de puertos. Varía según el número de puertos. Los patch panels de 12p son para instalaciones pequeñas, 24p para oficinas, 48p para grandes instalaciones.',
        ports: 'puertos',
        editEquipment: '✏️ Personalizar equipos',
        editRack: '✏️ Personalizar armarios',
        editMaterials: '✏️ Personalizar materiales',
        editDone: '✅ Guardar cambios',
        customItems: 'Partidas personalizadas',
        customItemsHint: 'Añade cualquier material o servicio extra con su precio. Aparecerá como línea separada en el presupuesto.',
        customItemName: 'Descripción',
        customItemQty: 'Cant.',
        customItemPrice: 'Precio/ud.',
        customItemTotal: 'Total',
        addCustomItem: '➕ Añadir por unidad',
        addFixedItem: '➕ Añadir partida global (sin cálculo)',
    },
    en: {
        cableType: 'Cable type',
        points: 'Network points',
        pointsHint: '1 point = 1 network outlet. Includes per point: cable to the outlet + 2 Keystone connectors (€6 each) + 1 wall outlet (€10) + labor by install type (30–90€/pt)',
        avgLength: 'Average length per point',
        avgLengthHint: 'Average cable distance from the rack/switch to each outlet. Determines total cable and routing cost',
        installType: 'Installation type',
        trench: 'Wall trenching',
        canaleta: 'Cable trunking',
        canetaFull: 'Full length (= total cable length)',
        canetaManual: 'Enter meters manually',
        canetaLength: 'Trunking meters',
        canetaHint: 'Only shown if type is "Surface"',
        trenchFull: 'Full length (= total cable length)',
        trenchManual: 'Enter meters manually',
        trenchLength: 'Trench meters',
        trenchHint: 'Only shown if type is "New wall conduit"',
        materials: 'Optional',
        equipment: 'Equipment',
        rack: 'Network cabinet (Rack)',
        upsell: 'Additional services',
        urgency: 'Urgency',
        subtotal: 'Subtotal',
        iva: 'VAT (21%)',
        discount: 'Discount',
        urgencyLabel: 'Urgency surcharge',
        total: 'Estimated total',
        routingCost: 'Cable routing',
        rackCost: 'Network cabinet',
        totalCableLength: 'Total cable length',
        cableCost: 'Cable cost',
        laborCost: 'Labor cost',
        trenchCost: 'Trenching cost',
        materialsCostLabel: 'Materials per point',
        additionalMaterialsCost: 'Additional materials',
        equipmentCost: 'Equipment',
        upsellCost: 'Additional services',
        requestQuote: 'Request Detailed Quote',
        disclaimer: 'Indicative prices. Final quote may vary depending on site conditions.',
        recommended: '★ Recommended',
        // Tooltips
        tipCable: 'Network cable cost by selected type. Higher category (Cat5e→Cat7) means faster speeds and better shielding, but higher cost.',
        tipLabor: 'Technician labor: outlet installation, cable crimping, mounting and testing each point. Calculated by type: Basic (30€/pt), Conduit (50€/pt), Advanced (90€/pt).',
        tipRouting: 'Physical cable routing: pulling cables through ceiling, trunking or walls. Price varies by installation type.',
        tipTrench: 'Wall trenching (chase) to embed the cable. Includes cutting, tube placement and sealing.',
        tipCanaleta: 'Plastic trunking fixed to wall or ceiling to protect and conceal cables. Price per linear meter.',
        tipMaterials: 'Materials per point: 2 Keystone connectors (6€ ea) + 1 network outlet (10€). Applied automatically per point.',
        tipRack: 'Network cabinet to centralize connections. Houses patch panels, switches and cable organizers.',
        tipEquipment: 'Active network equipment: routers, managed switches, WiFi access points and professional configuration.',
        tipUpsell: 'Additional services: professional verification, cable labeling, rack cable management and organization.',
        external: 'Surface (Cable tray)',
        ceiling: 'Suspended ceiling',
        existing_wall: 'Existing conduit',
        new_wall: 'New wall conduit (trenching)',
        industrial: 'Industrial (Warehouse)',
        trays: 'Cable trays',
        none: 'No cabinet',
        rack_6u: 'Wall rack 6U',
        rack_9u: 'Wall rack 9U',
        rack_12u: 'Wall rack 12U',
        rack_18u: 'Wall rack 18U',
        rack_22u: 'Floor rack 22U',
        rack_42u: 'Floor rack 42U (server)',
        router: 'Router',
        switch: 'Managed switch',
        accessPoint: 'WiFi access point',
        configuration: 'Network configuration',
        testing: 'Testing & verification',
        labeling: 'Professional labeling',
        cableManagement: 'Cable management',
        extendedWarranty: 'Extended warranty',
        trunking: 'Cable trunking',
        pvc: 'PVC conduit',
        corrugated: 'Corrugated tube',
        laborHour: 'Labor (hourly)',
        patchPanel: 'Patch panel',
        normal: 'Normal',
        urgente: 'Urgent (×1.2)',
        weekend: 'Weekend (×1.5)',
        meters: 'meters',
        installCoeffExplanation: 'ℹ️ The coefficient reflects work complexity. «New conduit» (×1.0) has wall trenching priced separately (€45/m). «Existing conduit» (×1.2) is slower because cables must be fed through existing channels without breaking walls.',
        installDisabled: 'Select at least 1 network point or cable length to activate installation type.',
        patchPanelSection: 'Patch Panel (installation + port crimping)',
        patchPanelHint: 'Rack mounting and port installation price. Varies by total port count. 12p for small setups, 24p for offices, 48p for large installations.',
        ports: 'ports',
        editEquipment: '✏️ Customize equipment',
        editRack: '✏️ Customize cabinets',
        editMaterials: '✏️ Customize materials',
        editDone: '✅ Save changes',
        customItems: 'Custom line items',
        customItemsHint: 'Add any extra material or service with its price. It will appear as a separate line in the quote.',
        customItemName: 'Description',
        customItemQty: 'Qty.',
        customItemPrice: 'Price/unit',
        addCustomItem: '➕ Add item',
    },
    ru: {
        cableType: 'Тип кабеля',
        points: 'Сетевые точки',
        pointsHint: '1 точка = 1 сетевая розетка. Включает: кабель до розетки + 2 коннектора Keystone (6€ шт) + 1 розетка (10€) + монтаж по типу (30–90€/тчк)',
        avgLength: 'Средняя длина на точку',
        avgLengthHint: 'Среднее расстояние кабеля от шкафа/коммутатора до каждой точки. Определяет стоимость кабеля и прокладки',
        installType: 'Тип монтажа',
        trench: 'Штроба',
        canaleta: 'Кабель-канал',
        canetaFull: 'Полная длина (= общая длина кабеля)',
        canetaManual: 'Ввести метры вручную',
        canetaLength: 'Метры кабель-канала',
        canetaHint: 'Только если тип = «Открытый»',
        trenchFull: 'Полная длина (= общая длина кабеля)',
        trenchManual: 'Ввести метры вручную',
        trenchLength: 'Метры штробы',
        trenchHint: 'Только если тип = «Новая штроба»',
        materials: 'Опционально',
        equipment: 'Оборудование',
        rack: 'Сетевой шкаф (Rack)',
        upsell: 'Доп. услуги',
        urgency: 'Срочность',
        subtotal: 'Подитог',
        iva: 'НДС (21%)',
        discount: 'Скидка',
        urgencyLabel: 'Наценка за срочность',
        total: 'Итого (ориентировочно)',
        routingCost: 'Прокладка кабеля',
        rackCost: 'Сетевой шкаф',
        totalCableLength: 'Общая длина кабеля',
        cableCost: 'Стоимость кабеля',
        laborCost: 'Стоимость работ',
        trenchCost: 'Стоимость штробления',
        materialsCostLabel: 'Материалы на точку',
        additionalMaterialsCost: 'Доп. материалы',
        equipmentCost: 'Оборудование',
        upsellCost: 'Доп. услуги',
        requestQuote: 'Запросить подробную смету',
        disclaimer: 'Цены ориентировочные. Итоговая смета может измениться в зависимости от условий.',
        recommended: '★ Рекомендуется',
        // Tooltips
        tipCable: 'Стоимость сетевого кабеля. Чем выше категория (Cat5e→Cat7), тем выше скорость и экранирование, но дороже.',
        tipLabor: 'Работа техников: установка розеток, обжим кабеля, монтаж и тестирование каждой точки. По типу: Базовый (30€/тчк), Кондуит (50€/тчк), Сложный (90€/тчк).',
        tipRouting: 'Прокладка кабеля: протяжка через потолок, кабель-каналы или стены. Цена зависит от типа установки.',
        tipTrench: 'Штроба (канал в стене) для скрытой прокладки кабеля. Включает нарезку, укладку трубы и заделку.',
        tipCanaleta: 'Пластиковый кабель-канал на стену или потолок для защиты и скрытия проводов. Цена за погонный метр.',
        tipMaterials: 'Материалы на точку: 2 коннектора Keystone (6€ шт) + 1 розетка (10€). Применяется автоматически на каждую точку.',
        tipRack: 'Сетевой шкаф для централизации подключений. Вмещает патч-панели, коммутаторы и органайзеры.',
        tipEquipment: 'Активное оборудование: роутеры, управляемые коммутаторы, точки доступа WiFi и профессиональная настройка.',
        tipUpsell: 'Дополнительные услуги: сертификация, маркировка кабелей, организация проводов в шкафу.',
        external: 'Открытый (кабель-канал)',
        ceiling: 'Подвесной потолок',
        existing_wall: 'Существующая штроба',
        new_wall: 'Новая штроба',
        industrial: 'Промышленный (Склад)',
        trays: 'Лотки кабельные',
        none: 'Без шкафа',
        rack_6u: 'Настенный 6U',
        rack_9u: 'Настенный 9U',
        rack_12u: 'Настенный 12U',
        rack_18u: 'Настенный 18U',
        rack_22u: 'Напольный 22U',
        rack_42u: 'Напольный 42U (серверный)',
        router: 'Роутер',
        switch: 'Управляемый свитч',
        accessPoint: 'Точка доступа WiFi',
        configuration: 'Настройка сети',
        testing: 'Тестирование и сертификация',
        labeling: 'Профессиональная маркировка',
        cableManagement: 'Организация кабелей',
        extendedWarranty: 'Расширенная гарантия',
        trunking: 'Кабель-канал',
        pvc: 'Труба ПВХ',
        corrugated: 'Гофра',
        laborHour: 'Мано де обра (ч/р)',
        patchPanel: 'Патч-панель',
        normal: 'Обычная',
        urgente: 'Срочно (×1.2)',
        weekend: 'Выходные (×1.5)',
        meters: 'метров',
        installCoeffExplanation: 'ℹ️ Коэффициент отражает сложность монтажа. «Новая штроба» (×1.0) — штробление считается отдельно (45€/м). «Существующая штроба» (×1.2) — медленнее, потому что кабель протягивают через готовые каналы без разрушения стен.',
        installDisabled: 'Выберите хотя бы 1 сетевую точку или длину кабеля для активации.',
        patchPanelSection: 'Патч-панель (установка + обжим портов)',
        patchPanelHint: 'Цена монтажа в стойку и установки портов. Зависит от количества портов: 12p — малые объекты, 24p — офис, 48p — крупные инсталляции.',
        ports: 'портов',
        editEquipment: '✏️ Настроить оборудование',
        editRack: '✏️ Настроить шкафы',
        editMaterials: '✏️ Настроить материалы',
        editDone: '✅ Сохранить',
        customItems: 'Доп. позиции',
        customItemsHint: 'Добавьте любой материал или услугу с нужной ценой. Появится отдельной строкой в смете.',
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

export default function Calculator({ locale }: { locale: string }) {
    const l = calcLabels[locale] || calcLabels.es;

    // ── Mode: ethernet vs fiber ──
    const [calcMode, setCalcMode] = useState<'ethernet' | 'fiber'>('ethernet');
    const [fiberCalcData, setFiberCalcData] = useState<FiberCalcResult | null>(null);

    // ── State ──
    const [cableType, setCableType] = useState<keyof typeof CONFIG.cablePrices | 'none'>('none');
    const [points, setPoints] = useState(0);
    const [avgLength, setAvgLength] = useState(0);
    const [installType, setInstallType] = useState<keyof typeof CONFIG.installationMultiplier>('external');
    const [trenchMode, setTrenchMode] = useState<'full' | 'manual'>('full');
    const [trenchLengthInput, setTrenchLengthInput] = useState(0);
    const [canetaMode, setCanetaMode] = useState<'full' | 'manual'>('full');
    const [canetaLengthInput, setCanetaLengthInput] = useState(0);
    const [additionalMaterials, setAdditionalMaterials] = useState<Record<string, number>>({
        trunking: 0, pvc: 0, corrugated: 0, laborHour: 0,
    });
    const [patchPanelCounts, setPatchPanelCounts] = useState<Record<string, number>>({ pp12: 0, pp24: 0, pp48: 0 });
    const [equipment, setEquipment] = useState<Record<string, number>>({
        router: 0, switch: 0, accessPoint: 0, configuration: 0,
    });
    const [equipmentCustom, setEquipmentCustom] = useState<Record<string, { name: string; price: number }>>(
        {
            router: { name: '', price: CONFIG.equipment.router },
            switch: { name: '', price: CONFIG.equipment.switch },
            accessPoint: { name: '', price: CONFIG.equipment.accessPoint },
            configuration: { name: '', price: CONFIG.equipment.configuration },
        }
    );
    const [equipmentEditing, setEquipmentEditing] = useState(false);
    const [materialsEditing, setMaterialsEditing] = useState(false);
    const [materialsCustom, setMaterialsCustom] = useState<Record<string, { name: string; price: number }>>({
        trunking:  { name: '', price: 4 },
        pvc:       { name: '', price: 2 },
        corrugated:{ name: '', price: 1 },
        laborHour: { name: '', price: 60 },
    });
    const [rackCustom, setRackCustom] = useState<Record<string, { name: string; price: number }>>(
        {
            rack_6u: { name: '', price: 90 },
            rack_9u: { name: '', price: 130 },
            rack_12u: { name: '', price: 180 },
            rack_18u: { name: '', price: 250 },
            rack_22u: { name: '', price: 380 },
            rack_42u: { name: '', price: 650 },
        }
    );
    const [rackEditing, setRackEditing] = useState(false);
    const [upsellOptions, setUpsellOptions] = useState<Record<string, boolean>>({
        testing: true, labeling: true, cableManagement: false, extendedWarranty: false,
    });
    const [rack, setRack] = useState('none');
    const [urgency, setUrgency] = useState('normal');
    const [customItems, setCustomItems] = useState<Array<{ id: string; type: 'unit' | 'fixed'; name: string; qty?: number; price: number }>>([]);

    // ── Per-point materials (keystone, roseta) — editable ──
    const [pointMaterials, setPointMaterials] = useState<Record<string, { enabled: boolean; qty: number; price: number; name: string; icon: string }>>({ 
        keystone: { enabled: true, qty: 2, price: 6, name: 'Keystone', icon: '🔌' },
        socket:   { enabled: true, qty: 1, price: 10, name: 'Roseta', icon: '🔲' },
    });
    const [pointMaterialsEditing, setPointMaterialsEditing] = useState(false);
    const [pointCustomMats, setPointCustomMats] = useState<Array<{ id: string; name: string; qty: number; price: number; enabled: boolean }>>([]);
    const addPointCustomMat = () => setPointCustomMats(prev => [...prev, { id: crypto.randomUUID(), name: '', qty: 1, price: 0, enabled: true }]);
    const removePointCustomMat = (id: string) => setPointCustomMats(prev => prev.filter(m => m.id !== id));
    const updatePointCustomMat = (id: string, field: string, value: string | number | boolean) =>
        setPointCustomMats(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));


    const addCustomItem = () => setCustomItems(prev => [...prev, { id: crypto.randomUUID(), type: 'unit', name: '', qty: 1, price: 0 }]);
    const addFixedItem = () => setCustomItems(prev => [...prev, { id: crypto.randomUUID(), type: 'fixed', name: '', price: 0 }]);
    const removeCustomItem = (id: string) => setCustomItems(prev => prev.filter(i => i.id !== id));
    const updateCustomItem = (id: string, field: 'name' | 'qty' | 'price', value: string | number) =>
        setCustomItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));

    // ── MAIN CALCULATION (exact user spec) ──
    const calc = useMemo(() => {
        // 1. Длина кабеля
        const totalCableLength = points * avgLength;

        // 2. Кабель
        const cablePricePerMeter = cableType === 'none' ? 0 : CONFIG.cablePrices[cableType as keyof typeof CONFIG.cablePrices];
        const cableCost = totalCableLength * cablePricePerMeter;

        // 3. Работа с коэффициентами
        let laborType: 'basic' | 'conduit' | 'advanced' = 'basic';
        if (installType === 'external') laborType = 'basic';
        if (installType === 'ceiling') laborType = 'conduit';
        if (installType === 'existing_wall') laborType = 'conduit';
        if (installType === 'new_wall') laborType = 'advanced';
        if (installType === 'industrial') laborType = 'advanced';
        if (installType === 'trays') laborType = 'conduit';

        const baseLabor = CONFIG.laborPerPoint[laborType];
        const cableMult = cableType === 'none' ? 1.0 : CONFIG.cableMultiplier[cableType as keyof typeof CONFIG.cableMultiplier];
        const installMult = CONFIG.installationMultiplier[installType];
        const laborCost = points * baseLabor * cableMult * installMult;

        // 3b. Стоимость прокладки кабеля (физическая протяжка по трассе)
        const routingPrice = CONFIG.routingPricePerMeter[installType];
        const routingCost = totalCableLength * routingPrice;

        // 4. ШТРОБА — только для new_wall
        let trenchLength = 0;
        if (installType === 'new_wall') {
            if (trenchMode === 'full') {
                trenchLength = totalCableLength;
            } else {
                trenchLength = trenchLengthInput || 0;
            }
        }
        const trenchCost = trenchLength * CONFIG.trenchPricePerMeter;

        // 4b. CANALETA — только для external (superficial)
        let canetaLength = 0;
        if (installType === 'external') {
            if (canetaMode === 'full') {
                canetaLength = totalCableLength;
            } else {
                canetaLength = canetaLengthInput || 0;
            }
        }
        const canetaCost = canetaLength * CONFIG.materials.trunking;

        // 5. Материалы на точку (настраиваемые)
        const materialsPerPoint =
            Object.values(pointMaterials).reduce((s, m) => s + (m.enabled ? m.qty * m.price : 0), 0) +
            pointCustomMats.filter(m => m.enabled).reduce((s, m) => s + m.qty * m.price, 0);
        const materialsCost = materialsPerPoint * points;

        // 6. Доп материалы (ручной ввод количества)
        let additionalMaterialsCost = 0;
        const trunkingQty = additionalMaterials.trunking || 0;
        const pvcQty = additionalMaterials.pvc || 0;
        const corrugatedQty = additionalMaterials.corrugated || 0;
        additionalMaterialsCost += trunkingQty * CONFIG.materials.trunking;
        additionalMaterialsCost += pvcQty * CONFIG.materials.pvc;
        additionalMaterialsCost += corrugatedQty * CONFIG.materials.corrugated;
        additionalMaterialsCost += (additionalMaterials.laborHour || 0) * CONFIG.materials.laborHour;
        // Patch panels por cantidad de puertos
        additionalMaterialsCost += (patchPanelCounts.pp12 || 0) * CONFIG.materials.patchPanel12;
        additionalMaterialsCost += (patchPanelCounts.pp24 || 0) * CONFIG.materials.patchPanel24;
        additionalMaterialsCost += (patchPanelCounts.pp48 || 0) * CONFIG.materials.patchPanel48;

        // 7. Оборудование — с учётом кастомных цен
        let equipmentCost = 0;
        for (const key in equipment) {
            const qty = equipment[key] || 0;
            if (qty > 0) {
                const unitPrice = equipmentCustom[key]?.price ?? CONFIG.equipment[key as keyof typeof CONFIG.equipment] ?? 0;
                equipmentCost += unitPrice * qty;
            }
        }

        // 7b. Rack — с учётом кастомных цен
        const rackOption = RACK_OPTIONS.find(r => r.id === rack) || RACK_OPTIONS[0];
        const rackCost = rack === 'none' ? 0 : (rackCustom[rack]?.price ?? rackOption.price);

        // 8. Upsell
        let upsellCost = 0;
        for (const key in upsellOptions) {
            if (upsellOptions[key]) upsellCost += CONFIG.upsell[key as keyof typeof CONFIG.upsell] || 0;
        }

        // 8b. Custom items
        const customItemsCost = customItems.reduce((sum, item) => {
            if (item.type === 'fixed') return sum + (item.price || 0);
            return sum + (item.qty || 0) * (item.price || 0);
        }, 0);

        // 9. СУММА до скидки и срочности
        const subtotal = cableCost + routingCost + laborCost + trenchCost + canetaCost + materialsCost + additionalMaterialsCost + equipmentCost + rackCost + upsellCost + customItemsCost;

        // 10. Скидка
        let discountPercent = 0;
        if (points >= 10) discountPercent = 10;
        else if (points >= 4) discountPercent = 5;
        const discount = subtotal * (discountPercent / 100);

        // 11. Срочность
        const urgencyOption = URGENCY_LEVELS.find(u => u.id === urgency) || URGENCY_LEVELS[0];
        const afterUrgency = (subtotal - discount) * urgencyOption.multiplier;

        // 12. IVA
        const iva = afterUrgency * IVA_RATE;
        const total = afterUrgency + iva;

        return {
            totalCableLength, cableCost, routingCost, routingPrice, laborCost,
            trenchLength, trenchCost, canetaLength, canetaCost,
            materialsCost, materialsPerPoint, additionalMaterialsCost,
            equipmentCost, rackCost, upsellCost, customItemsCost, subtotal, discountPercent, discount,
            urgencyOption, afterUrgency, iva, total,
        };
    }, [cableType, points, avgLength, installType, trenchMode, trenchLengthInput, canetaMode, canetaLengthInput, additionalMaterials, patchPanelCounts, equipment, equipmentCustom, rack, rackCustom, upsellOptions, urgency, customItems, pointMaterials, pointCustomMats]);

    const installationDisabled = points === 0 && avgLength === 0;

    return (
        <div className="space-y-6">
            {/* ═══ TABS: Ethernet / Fibra ═══ */}
            <div className="flex gap-2 justify-center">
                <button
                    onClick={() => setCalcMode('ethernet')}
                    className={`px-6 py-3 rounded-xl font-heading font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                        calcMode === 'ethernet'
                            ? 'bg-[rgba(201,168,76,0.15)] border-2 border-brand-gold text-brand-gold shadow-[0_0_20px_rgba(201,168,76,0.15)]'
                            : 'bg-surface-card border-2 border-border-subtle text-brand-gold-muted hover:border-brand-gold/30'
                    }`}
                >
                    🌐 {locale === 'ru' ? 'Сеть Ethernet' : locale === 'en' ? 'Ethernet Network' : 'Red Ethernet'}
                </button>
                <button
                    onClick={() => setCalcMode('fiber')}
                    className={`px-6 py-3 rounded-xl font-heading font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                        calcMode === 'fiber'
                            ? 'bg-[rgba(0,180,255,0.1)] border-2 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(0,180,255,0.15)]'
                            : 'bg-surface-card border-2 border-border-subtle text-brand-gold-muted hover:border-cyan-400/30'
                    }`}
                >
                    🔆 {locale === 'ru' ? 'Оптоволокно' : locale === 'en' ? 'Fiber Optic' : 'Fibra Óptica'}
                </button>
            </div>

            {/* ═══ FIBER CALCULATOR ═══ */}
            {calcMode === 'fiber' && (
                <FiberCalculator locale={locale} onCalcUpdate={setFiberCalcData} />
            )}

            {/* ═══ ETHERNET CALCULATOR ═══ */}
            {calcMode === 'ethernet' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT — Configuration */}
            <div className="lg:col-span-2 space-y-6">

                {/* Cable Type */}
                <div className="card p-6">
                    <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                        🔌 {l.cableType}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {CABLE_TYPES.map((cable) => (
                            <button
                                key={cable.id}
                                onClick={() => setCableType(cable.id)}
                                className={`p-4 rounded-lg border text-center transition-all duration-200 relative ${cableType === cable.id
                                    ? 'bg-[rgba(201,168,76,0.1)] border-brand-gold text-brand-gold'
                                    : 'bg-surface-card border-border-subtle text-brand-gold-muted hover:border-brand-gold/30'
                                    }`}
                            >
                                {cable.id === 'cat6' && (
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] bg-brand-gold text-black px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                                        {l.recommended}
                                    </div>
                                )}
                                <div className="font-heading font-bold text-lg">{cable.name}</div>
                                <div className="text-sm mt-1">{cable.price}€/m</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Network Points */}
                <div className="card p-6">
                    <h3 className="font-heading font-semibold text-white mb-1 flex items-center gap-2">
                        📊 {l.points}
                    </h3>
                    <p className="text-xs text-brand-gold-muted mb-4">{l.pointsHint}</p>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setPoints(Math.max(0, points - 1))}
                            className="w-12 h-12 rounded-lg bg-surface-card border border-border-subtle text-white hover:border-brand-gold/50 transition-colors text-xl font-bold"
                        >−</button>
                        <div className="flex-1">
                            <input type="range" min={0} max={100} value={points}
                                onChange={(e) => setPoints(Number(e.target.value))}
                                className="w-full accent-[#c9a84c] h-2 rounded-full appearance-none bg-surface-card cursor-pointer" />
                        </div>
                        <button
                            onClick={() => setPoints(Math.min(100, points + 1))}
                            className="w-12 h-12 rounded-lg bg-surface-card border border-border-subtle text-white hover:border-brand-gold/50 transition-colors text-xl font-bold"
                        >+</button>
                        <div className="w-16 text-center">
                            <span className="font-heading text-2xl font-bold text-gradient-gold">{points}</span>
                        </div>
                    </div>
                    {calc.discountPercent > 0 && (
                        <div className="mt-2 text-xs text-green-400">🎉 {l.discount}: -{calc.discountPercent}% ({points >= 10 ? '10+ puntos' : '4+ puntos'})</div>
                    )}
                </div>

                {/* Average Length per Point */}
                <div className="card p-6">
                    <h3 className="font-heading font-semibold text-white mb-1 flex items-center gap-2">
                        📐 {l.avgLength}
                    </h3>
                    <p className="text-xs text-brand-gold-muted mb-4">{l.avgLengthHint}</p>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setAvgLength(Math.max(0, avgLength - 1))}
                            className="w-12 h-12 rounded-lg bg-surface-card border border-border-subtle text-white hover:border-brand-gold/50 transition-colors text-xl font-bold"
                        >−</button>
                        <div className="flex-1">
                            <input type="range" min={0} max={100} value={avgLength}
                                onChange={(e) => setAvgLength(Number(e.target.value))}
                                className="w-full accent-[#c9a84c] h-2 rounded-full appearance-none bg-surface-card cursor-pointer" />
                        </div>
                        <button
                            onClick={() => setAvgLength(Math.min(100, avgLength + 1))}
                            className="w-12 h-12 rounded-lg bg-surface-card border border-border-subtle text-white hover:border-brand-gold/50 transition-colors text-xl font-bold"
                        >+</button>
                        <div className="w-20 text-center">
                            <span className="font-heading text-2xl font-bold text-gradient-gold">{avgLength}</span>
                            <span className="text-xs text-brand-gold-muted ml-1">m</span>
                        </div>
                    </div>
                    <div className="mt-2 text-xs text-brand-gold-muted">
                        {l.totalCableLength}: <span className="text-white font-bold">{calc.totalCableLength}m</span> ({points} × {avgLength}m)
                    </div>
                </div>

                {/* Installation Type */}
                <div className="card p-6">
                    <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                        🔧 {l.installType}
                    </h3>
                    {installationDisabled && (
                        <p className="text-xs text-yellow-400/80 mb-3">⚠️ {l.installDisabled}</p>
                    )}
                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${installationDisabled ? 'opacity-40 pointer-events-none select-none' : ''}`}>
                        {INSTALLATION_TYPES.map((install) => (
                            <button
                                key={install.id}
                                onClick={() => setInstallType(install.id)}
                                className={`p-4 rounded-lg border text-left transition-all duration-200 flex items-center gap-3 ${installType === install.id
                                    ? 'bg-[rgba(201,168,76,0.1)] border-brand-gold'
                                    : 'bg-surface-card border-border-subtle hover:border-brand-gold/30'
                                    }`}
                            >
                                <span className="text-2xl">{install.icon}</span>
                                <div>
                                    <div className={`font-semibold ${installType === install.id ? 'text-brand-gold' : 'text-white'}`}>
                                        {l[install.id]}
                                    </div>
                                    <div className="text-sm text-brand-gold-muted">
                                        ×{CONFIG.installationMultiplier[install.id]}
                                        {install.id === 'new_wall' && <span className="ml-1 text-yellow-400/70">+ regata</span>}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                    {!installationDisabled && (
                        <p className="text-xs text-brand-gold-muted mt-3 leading-relaxed">{l.installCoeffExplanation}</p>
                    )}
                </div>


                {/* TRENCH — only for new_wall */}
                {installType === 'new_wall' && (
                    <div className="card p-6 border-yellow-500/20">
                        <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                            ⚒️ {l.trench}
                        </h3>
                        <p className="text-xs text-brand-gold-muted mb-4">{CONFIG.trenchPricePerMeter}€/m · {l.trenchHint}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            <button
                                onClick={() => setTrenchMode('full')}
                                className={`p-4 rounded-lg border text-left transition-all duration-200 ${trenchMode === 'full'
                                    ? 'bg-[rgba(201,168,76,0.1)] border-brand-gold'
                                    : 'bg-surface-card border-border-subtle hover:border-brand-gold/30'}`}
                            >
                                <div className={`font-semibold text-sm ${trenchMode === 'full' ? 'text-brand-gold' : 'text-white'}`}>
                                    {l.trenchFull}
                                </div>
                                <div className="text-xs text-brand-gold-muted mt-1">{calc.totalCableLength}m = {(calc.totalCableLength * CONFIG.trenchPricePerMeter).toFixed(0)}€</div>
                            </button>
                            <button
                                onClick={() => setTrenchMode('manual')}
                                className={`p-4 rounded-lg border text-left transition-all duration-200 ${trenchMode === 'manual'
                                    ? 'bg-[rgba(201,168,76,0.1)] border-brand-gold'
                                    : 'bg-surface-card border-border-subtle hover:border-brand-gold/30'}`}
                            >
                                <div className={`font-semibold text-sm ${trenchMode === 'manual' ? 'text-brand-gold' : 'text-white'}`}>
                                    {l.trenchManual}
                                </div>
                            </button>
                        </div>
                        {trenchMode === 'manual' && (
                            <div className="flex items-center gap-4">
                                <button onClick={() => setTrenchLengthInput(Math.max(0, trenchLengthInput - 1))}
                                    className="w-12 h-12 rounded-lg bg-surface-card border border-border-subtle text-white hover:border-brand-gold/50 transition-colors text-xl font-bold">−</button>
                                <div className="flex-1">
                                    <input type="range" min={0} max={500} value={trenchLengthInput}
                                        onChange={(e) => setTrenchLengthInput(Number(e.target.value))}
                                        className="w-full accent-[#c9a84c] h-2 rounded-full appearance-none bg-surface-card cursor-pointer" />
                                </div>
                                <button onClick={() => setTrenchLengthInput(Math.min(500, trenchLengthInput + 1))}
                                    className="w-12 h-12 rounded-lg bg-surface-card border border-border-subtle text-white hover:border-brand-gold/50 transition-colors text-xl font-bold">+</button>
                                <div className="w-20 text-center">
                                    <span className="font-heading text-2xl font-bold text-gradient-gold">{trenchLengthInput}</span>
                                    <span className="text-xs text-brand-gold-muted ml-1">m</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* CANALETA — only for external (Superficial) */}
                {installType === 'external' && (
                    <div className="card p-6 border-yellow-500/20">
                        <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                            📏 {l.canaleta}
                        </h3>
                        <p className="text-xs text-brand-gold-muted mb-4">{CONFIG.materials.trunking}€/m · {l.canetaHint}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            <button
                                onClick={() => setCanetaMode('full')}
                                className={`p-4 rounded-lg border text-left transition-all duration-200 ${canetaMode === 'full'
                                    ? 'bg-[rgba(201,168,76,0.1)] border-brand-gold'
                                    : 'bg-surface-card border-border-subtle hover:border-brand-gold/30'}`}
                            >
                                <div className={`font-semibold text-sm ${canetaMode === 'full' ? 'text-brand-gold' : 'text-white'}`}>
                                    {l.canetaFull}
                                </div>
                                <div className="text-xs text-brand-gold-muted mt-1">{calc.totalCableLength}m = {(calc.totalCableLength * CONFIG.materials.trunking).toFixed(0)}€</div>
                            </button>
                            <button
                                onClick={() => setCanetaMode('manual')}
                                className={`p-4 rounded-lg border text-left transition-all duration-200 ${canetaMode === 'manual'
                                    ? 'bg-[rgba(201,168,76,0.1)] border-brand-gold'
                                    : 'bg-surface-card border-border-subtle hover:border-brand-gold/30'}`}
                            >
                                <div className={`font-semibold text-sm ${canetaMode === 'manual' ? 'text-brand-gold' : 'text-white'}`}>
                                    {l.canetaManual}
                                </div>
                            </button>
                        </div>
                        {canetaMode === 'manual' && (
                            <div className="flex items-center gap-4">
                                <button onClick={() => setCanetaLengthInput(Math.max(0, canetaLengthInput - 1))}
                                    className="w-12 h-12 rounded-lg bg-surface-card border border-border-subtle text-white hover:border-brand-gold/50 transition-colors text-xl font-bold">−</button>
                                <div className="flex-1">
                                    <input type="range" min={0} max={500} value={canetaLengthInput}
                                        onChange={(e) => setCanetaLengthInput(Number(e.target.value))}
                                        className="w-full accent-[#c9a84c] h-2 rounded-full appearance-none bg-surface-card cursor-pointer" />
                                </div>
                                <button onClick={() => setCanetaLengthInput(Math.min(500, canetaLengthInput + 1))}
                                    className="w-12 h-12 rounded-lg bg-surface-card border border-border-subtle text-white hover:border-brand-gold/50 transition-colors text-xl font-bold">+</button>
                                <div className="w-20 text-center">
                                    <span className="font-heading text-2xl font-bold text-gradient-gold">{canetaLengthInput}</span>
                                    <span className="text-xs text-brand-gold-muted ml-1">m</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ══ PER-POINT MATERIALS EDITOR ══ */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-heading font-semibold text-white flex items-center gap-2">
                            🔌 {locale === 'ru' ? 'Материалы на точку' : locale === 'en' ? 'Materials per point' : 'Materiales por punto'}
                        </h3>
                        <button
                            onClick={() => setPointMaterialsEditing(e => !e)}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                                pointMaterialsEditing
                                    ? 'border-brand-gold bg-[rgba(201,168,76,0.1)] text-brand-gold'
                                    : 'border-border-subtle text-brand-gold-muted hover:border-brand-gold/30'
                            }`}
                        >
                            {pointMaterialsEditing
                                ? (locale === 'ru' ? '✅ Готово' : locale === 'en' ? '✅ Done' : '✅ Listo')
                                : (locale === 'ru' ? '✏️ Редактировать' : locale === 'en' ? '✏️ Edit' : '✏️ Personalizar')}
                        </button>
                    </div>
                    <p className="text-xs text-brand-gold-muted mb-4">
                        {locale === 'ru'
                            ? 'Компоненты включаемые автоматически в каждую точку сети. Отключайте если клиент оставляет старые розетки.'
                            : locale === 'en'
                            ? 'Components automatically included in each network point. Disable if the client keeps existing outlets.'
                            : 'Componentes incluidos automáticamente en cada punto de red. Desactívalos si el cliente reutiliza las rosetas existentes.'}
                    </p>

                    <div className="space-y-2">
                        {/* Default items: keystone + socket */}
                        {Object.entries(pointMaterials).map(([key, mat]) => (
                            <div key={key} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                mat.enabled ? 'border-brand-gold/40 bg-[rgba(201,168,76,0.06)]' : 'border-border-subtle bg-surface-card opacity-60'
                            }`}>
                                {/* Toggle */}
                                <button
                                    onClick={() => setPointMaterials(prev => ({ ...prev, [key]: { ...prev[key], enabled: !prev[key].enabled } }))}
                                    className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
                                        mat.enabled ? 'bg-brand-gold border-brand-gold text-black' : 'border-border-subtle'
                                    }`}
                                >
                                    {mat.enabled && <span className="text-xs font-bold leading-none">✓</span>}
                                </button>
                                <span className="text-lg flex-shrink-0">{mat.icon}</span>
                                {pointMaterialsEditing ? (
                                    <>
                                        <input
                                            type="text" value={mat.name}
                                            onChange={e => setPointMaterials(prev => ({ ...prev, [key]: { ...prev[key], name: e.target.value } }))}
                                            className="flex-1 text-sm bg-brand-dark border border-border-subtle rounded px-2 py-1 text-white focus:outline-none focus:border-brand-gold/50"
                                        />
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <span className="text-xs text-brand-gold-muted">×</span>
                                            <input type="number" value={mat.qty} min={1}
                                                onChange={e => setPointMaterials(prev => ({ ...prev, [key]: { ...prev[key], qty: Number(e.target.value) } }))}
                                                className="w-12 text-center text-sm bg-brand-dark border border-border-subtle rounded px-1 py-1 text-brand-gold focus:outline-none focus:border-brand-gold/50"
                                            />
                                            <input type="number" value={mat.price} min={0} step={0.5}
                                                onChange={e => setPointMaterials(prev => ({ ...prev, [key]: { ...prev[key], price: Number(e.target.value) } }))}
                                                className="w-16 text-right text-sm bg-brand-dark border border-border-subtle rounded px-1 py-1 text-brand-gold focus:outline-none focus:border-brand-gold/50"
                                            />
                                            <span className="text-xs text-brand-gold-muted">€</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex-1">
                                            <div className={`text-sm font-medium ${mat.enabled ? 'text-white' : 'text-brand-gold-muted line-through'}`}>{mat.name}</div>
                                            <div className="text-xs text-brand-gold-muted">{mat.qty} ud × {mat.price}€</div>
                                        </div>
                                        <div className={`text-sm font-bold tabular-nums ${ mat.enabled ? 'text-brand-gold' : 'text-brand-gold-muted'}`}>
                                            {(mat.qty * mat.price).toFixed(2)}€/pto
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}

                        {/* Custom per-point items */}
                        {pointCustomMats.map(mat => (
                            <div key={mat.id} className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                                mat.enabled ? 'border-brand-gold/40 bg-[rgba(201,168,76,0.06)]' : 'border-border-subtle bg-surface-card opacity-60'
                            }`}>
                                <button
                                    onClick={() => updatePointCustomMat(mat.id, 'enabled', !mat.enabled)}
                                    className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
                                        mat.enabled ? 'bg-brand-gold border-brand-gold text-black' : 'border-border-subtle'
                                    }`}
                                >
                                    {mat.enabled && <span className="text-xs font-bold leading-none">✓</span>}
                                </button>
                                <input type="text" value={mat.name}
                                    placeholder={locale === 'ru' ? 'Описание' : locale === 'en' ? 'Description' : 'Descripción'}
                                    onChange={e => updatePointCustomMat(mat.id, 'name', e.target.value)}
                                    className="flex-1 text-sm bg-brand-dark border border-border-subtle rounded px-2 py-1 text-white focus:outline-none focus:border-brand-gold/50"
                                />
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <span className="text-xs text-brand-gold-muted">×</span>
                                    <input type="number" value={mat.qty} min={1}
                                        onChange={e => updatePointCustomMat(mat.id, 'qty', Number(e.target.value))}
                                        className="w-12 text-center text-sm bg-brand-dark border border-border-subtle rounded px-1 py-1 text-brand-gold focus:outline-none focus:border-brand-gold/50"
                                    />
                                    <input type="number" value={mat.price} min={0} step={0.5}
                                        onChange={e => updatePointCustomMat(mat.id, 'price', Number(e.target.value))}
                                        className="w-16 text-right text-sm bg-brand-dark border border-border-subtle rounded px-1 py-1 text-brand-gold focus:outline-none focus:border-brand-gold/50"
                                    />
                                    <span className="text-xs text-brand-gold-muted">€</span>
                                </div>
                                <button onClick={() => removePointCustomMat(mat.id)} className="text-red-400 hover:text-red-300 text-sm flex-shrink-0">✕</button>
                            </div>
                        ))}

                        {/* Add custom item button */}
                        <button
                            onClick={addPointCustomMat}
                            className="w-full mt-1 py-2 rounded-lg border border-dashed border-brand-gold/30 text-brand-gold-muted text-xs hover:border-brand-gold/60 hover:text-brand-gold transition-colors"
                        >
                            {locale === 'ru' ? '➕ Добавить материал на точку' : locale === 'en' ? '➕ Add per-point material' : '➕ Añadir material por punto'}
                        </button>

                        {/* Summary */}
                        {points > 0 && (
                            <div className="flex justify-between items-center pt-2 border-t border-border-subtle text-xs">
                                <span className="text-brand-gold-muted">
                                    {locale === 'ru' ? `${points} pts × ` : `${points} pts × `}
                                    {(
                                        Object.values(pointMaterials).reduce((s, m) => s + (m.enabled ? m.qty * m.price : 0), 0) +
                                        pointCustomMats.filter(m => m.enabled).reduce((s, m) => s + m.qty * m.price, 0)
                                    ).toFixed(2)}€/pto
                                </span>
                                <span className="text-brand-gold font-bold">
                                    = {(
                                        points * (
                                            Object.values(pointMaterials).reduce((s, m) => s + (m.enabled ? m.qty * m.price : 0), 0) +
                                            pointCustomMats.filter(m => m.enabled).reduce((s, m) => s + m.qty * m.price, 0)
                                        )
                                    ).toFixed(2)}€
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Additional Materials */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-heading font-semibold text-white flex items-center gap-2">📦 {l.materials}</h3>
                        <button onClick={() => setMaterialsEditing(e => !e)} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${materialsEditing ? 'border-brand-gold bg-[rgba(201,168,76,0.1)] text-brand-gold' : 'border-border-subtle text-brand-gold-muted hover:border-brand-gold/30'}`}>
                            {materialsEditing ? (l as Record<string,string>).editDone : (l as Record<string,string>).editMaterials}
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {ADDITIONAL_MATERIALS.map((mat) => {
                            const qty = additionalMaterials[mat.id] || 0;
                            const step = mat.unit === 'h' ? 1 : 5;
                            const unitLabel = mat.unit === 'h' ? 'h' : 'm';
                            const custom = materialsCustom[mat.id];
                            const displayName = custom?.name || (l as Record<string,string>)[mat.id];
                            const displayPrice = custom?.price ?? mat.price;
                            return (
                            <div key={mat.id} className={`p-4 rounded-lg border transition-all duration-200 ${qty > 0 ? 'bg-[rgba(201,168,76,0.1)] border-brand-gold' : 'bg-surface-card border-border-subtle hover:border-brand-gold/30'}`}>
                                <div className="flex items-center gap-3">
                                    <span className="text-xl flex-shrink-0">{mat.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        {materialsEditing ? (
                                            <div className="space-y-1.5">
                                                <input type="text" value={custom?.name || ''} placeholder={(l as Record<string,string>)[mat.id]}
                                                    onChange={(e) => setMaterialsCustom(prev => ({ ...prev, [mat.id]: { ...prev[mat.id], name: e.target.value } }))}
                                                    className="w-full text-xs bg-brand-dark border border-border-subtle rounded px-2 py-1 text-white placeholder-brand-gold-muted/50 focus:outline-none focus:border-brand-gold/50" />
                                                <div className="flex items-center gap-1">
                                                    <input type="number" value={displayPrice} min={0}
                                                        onChange={(e) => setMaterialsCustom(prev => ({ ...prev, [mat.id]: { ...prev[mat.id], price: Number(e.target.value) } }))}
                                                        className="w-20 text-xs bg-brand-dark border border-border-subtle rounded px-2 py-1 text-brand-gold focus:outline-none focus:border-brand-gold/50" />
                                                    <span className="text-xs text-brand-gold-muted">€/{mat.unit}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className={`text-sm font-medium truncate ${qty > 0 ? 'text-brand-gold' : 'text-white'}`}>{displayName}</div>
                                                <div className="text-xs text-brand-gold-muted">{displayPrice}€/{mat.unit}</div>
                                            </>
                                        )}
                                    </div>
                                    {!materialsEditing && (
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setAdditionalMaterials(prev => ({ ...prev, [mat.id]: Math.max(0, (prev[mat.id] || 0) - step) }))} className="w-8 h-8 rounded bg-brand-dark text-white border border-border-subtle text-sm hover:border-brand-gold/30 transition-colors">−</button>
                                            <span className="w-12 text-center font-heading font-bold text-brand-gold text-sm">{qty}{unitLabel}</span>
                                            <button onClick={() => setAdditionalMaterials(prev => ({ ...prev, [mat.id]: (prev[mat.id] || 0) + step }))} className="w-8 h-8 rounded bg-brand-dark text-white border border-border-subtle text-sm hover:border-brand-gold/30 transition-colors">+</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            );
                        })}
                    </div>
                </div>

                {/* Patch Panel by port count */}
                <div className="card p-6">
                    <h3 className="font-heading font-semibold text-white mb-1 flex items-center gap-2">
                        🔗 {l.patchPanelSection}
                    </h3>
                    <p className="text-xs text-brand-gold-muted mb-4">{l.patchPanelHint}</p>
                    <div className="grid grid-cols-3 gap-3">
                        {PATCH_PANEL_OPTIONS.map((pp) => {
                            const qty = patchPanelCounts[pp.id] || 0;
                            return (
                                <div key={pp.id} className={`p-4 rounded-lg border transition-all ${qty > 0 ? 'border-brand-gold bg-[rgba(201,168,76,0.1)]' : 'border-border-subtle bg-surface-card'}`}>
                                    <div className="text-center mb-3">
                                        <div className={`font-heading font-bold text-lg ${qty > 0 ? 'text-brand-gold' : 'text-white'}`}>{pp.ports}p</div>
                                        <div className="text-xs text-brand-gold-muted">{l.ports}</div>
                                        <div className="text-xs text-brand-gold-muted mt-0.5">{pp.price}€/ud</div>
                                    </div>
                                    <div className="flex items-center justify-between gap-1">
                                        <button onClick={() => setPatchPanelCounts(prev => ({ ...prev, [pp.id]: Math.max(0, (prev[pp.id] || 0) - 1) }))} className="w-8 h-8 rounded bg-brand-dark text-white border border-border-subtle text-sm hover:border-brand-gold/30">−</button>
                                        <span className="font-heading font-bold text-brand-gold">{qty}</span>
                                        <button onClick={() => setPatchPanelCounts(prev => ({ ...prev, [pp.id]: (prev[pp.id] || 0) + 1 }))} className="w-8 h-8 rounded bg-brand-dark text-white border border-border-subtle text-sm hover:border-brand-gold/30">+</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Custom Line Items */}
                <div className="card p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                        <h3 className="font-heading font-semibold text-white flex items-center gap-2">📝 {(l as Record<string,string>).customItems}</h3>
                        <div className="flex items-center gap-2">
                            <button onClick={addCustomItem} className="text-xs px-3 py-1.5 rounded-lg border border-brand-gold/40 text-brand-gold hover:bg-[rgba(201,168,76,0.1)] transition-colors">
                                {(l as Record<string,string>).addCustomItem}
                            </button>
                            <button onClick={addFixedItem} className="text-xs px-3 py-1.5 rounded-lg border border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/10 transition-colors">
                                {(l as Record<string,string>).addFixedItem}
                            </button>
                        </div>
                    </div>
                    <p className="text-xs text-brand-gold-muted mb-4">{(l as Record<string,string>).customItemsHint}</p>

                    {customItems.length === 0 ? (
                        <div className="text-center py-6 text-brand-gold-muted text-xs border border-dashed border-border-subtle rounded-lg">
                            {(l as Record<string,string>).addCustomItem} / {(l as Record<string,string>).addFixedItem}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {/* Header row */}
                            <div className="grid grid-cols-[1fr_64px_80px_32px] gap-2 text-xs text-brand-gold-muted px-1">
                                <span>{(l as Record<string,string>).customItemName}</span>
                                <span className="text-center">{(l as Record<string,string>).customItemQty}</span>
                                <span className="text-right">Precio/Total</span>
                                <span />
                            </div>
                            {customItems.map((item) => {
                                const isFixed = item.type === 'fixed';
                                return (
                                <div key={item.id} className="grid grid-cols-[1fr_64px_80px_32px] gap-2 items-center bg-surface-card border border-border-subtle rounded-lg px-3 py-2">
                                    <input
                                        type="text"
                                        value={item.name}
                                        placeholder={(l as Record<string,string>).customItemName}
                                        onChange={(e) => updateCustomItem(item.id, 'name', e.target.value)}
                                        className="bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none w-full"
                                    />
                                    {isFixed ? (
                                        <div className="text-center text-xs text-brand-gold-muted bg-brand-dark border border-border-subtle/50 rounded px-1 py-0.5 opacity-50 cursor-not-allowed">—</div>
                                    ) : (
                                        <input
                                            type="number"
                                            value={item.qty}
                                            min={1}
                                            onChange={(e) => updateCustomItem(item.id, 'qty', Number(e.target.value))}
                                            className="w-full text-center text-sm bg-brand-dark border border-border-subtle rounded px-1 py-0.5 text-brand-gold focus:outline-none focus:border-brand-gold/50"
                                        />
                                    )}
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="number"
                                            value={item.price}
                                            min={0}
                                            step={0.01}
                                            onChange={(e) => updateCustomItem(item.id, 'price', Number(e.target.value))}
                                            className={`w-full text-right text-sm bg-brand-dark border border-border-subtle rounded px-1 py-0.5 focus:outline-none ${isFixed ? 'text-cyan-300 focus:border-cyan-400/50' : 'text-brand-gold focus:border-brand-gold/50'}`}
                                            placeholder={isFixed ? (l as Record<string,string>).customItemTotal : (l as Record<string,string>).customItemPrice}
                                        />
                                        <span className="text-xs text-brand-gold-muted flex-shrink-0">€</span>
                                    </div>
                                    <button onClick={() => removeCustomItem(item.id)} className="w-7 h-7 flex items-center justify-center rounded text-red-400 hover:bg-red-400/10 transition-colors text-sm">✕</button>
                                </div>
                                );
                            })}
                            {/* Total row */}
                            {customItems.length > 0 && (
                                <div className="flex justify-end pt-1">
                                    <span className="text-xs text-brand-gold font-semibold">
                                        Total: {customItems.reduce((s, i) => {
                                            if (i.type === 'fixed') return s + (i.price || 0);
                                            return s + (i.qty || 0) * (i.price || 0);
                                        }, 0).toFixed(2)}€
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Equipment */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-heading font-semibold text-white flex items-center gap-2">🖥️ {l.equipment}</h3>
                        <button onClick={() => setEquipmentEditing(e => !e)} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${equipmentEditing ? 'border-brand-gold bg-[rgba(201,168,76,0.1)] text-brand-gold' : 'border-border-subtle text-brand-gold-muted hover:border-brand-gold/30'}`}>
                            {equipmentEditing ? l.editDone : l.editEquipment}
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {EQUIPMENT_LIST.map((eq) => {
                            const qty = equipment[eq.id] || 0;
                            const hasQtyInput = eq.id === 'switch' || eq.id === 'accessPoint';
                            const custom = equipmentCustom[eq.id];
                            const displayName = custom?.name || l[eq.id];
                            const displayPrice = custom?.price ?? eq.price;
                            return (
                            <div key={eq.id} className={`p-4 rounded-lg border transition-all duration-200 ${qty > 0 ? 'bg-[rgba(201,168,76,0.1)] border-brand-gold' : 'bg-surface-card border-border-subtle hover:border-brand-gold/30'}`}>
                                <div className="flex items-center gap-3">
                                    <span className="text-xl flex-shrink-0">{eq.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        {equipmentEditing ? (
                                            <div className="space-y-1.5">
                                                <input type="text" value={custom?.name || ''} placeholder={l[eq.id]}
                                                    onChange={(e) => setEquipmentCustom(prev => ({ ...prev, [eq.id]: { ...prev[eq.id], name: e.target.value } }))}
                                                    className="w-full text-xs bg-brand-dark border border-border-subtle rounded px-2 py-1 text-white placeholder-brand-gold-muted/50 focus:outline-none focus:border-brand-gold/50" />
                                                <div className="flex items-center gap-1">
                                                    <input type="number" value={displayPrice} min={0}
                                                        onChange={(e) => setEquipmentCustom(prev => ({ ...prev, [eq.id]: { ...prev[eq.id], price: Number(e.target.value) } }))}
                                                        className="w-20 text-xs bg-brand-dark border border-border-subtle rounded px-2 py-1 text-brand-gold focus:outline-none focus:border-brand-gold/50" />
                                                    <span className="text-xs text-brand-gold-muted">€</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className={`text-sm font-medium truncate ${qty > 0 ? 'text-brand-gold' : 'text-white'}`}>{displayName}</div>
                                                <div className="text-xs text-brand-gold-muted">{displayPrice}€{hasQtyInput ? '/ud' : ''}</div>
                                            </>
                                        )}
                                    </div>
                                    {!equipmentEditing && (hasQtyInput ? (
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setEquipment(prev => ({ ...prev, [eq.id]: Math.max(0, (prev[eq.id] || 0) - 1) }))} className="w-8 h-8 rounded bg-brand-dark text-white border border-border-subtle text-sm hover:border-brand-gold/30">−</button>
                                            <span className="w-8 text-center font-heading font-bold text-brand-gold">{qty}</span>
                                            <button onClick={() => setEquipment(prev => ({ ...prev, [eq.id]: (prev[eq.id] || 0) + 1 }))} className="w-8 h-8 rounded bg-brand-dark text-white border border-border-subtle text-sm hover:border-brand-gold/30">+</button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer">
                                            <input type="checkbox" checked={qty > 0} onChange={(e) => setEquipment(prev => ({ ...prev, [eq.id]: e.target.checked ? 1 : 0 }))} className="sr-only" />
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${qty > 0 ? 'bg-brand-gold border-brand-gold text-black' : 'border-border-subtle'}`}>
                                                {qty > 0 && <span className="text-xs font-bold">✓</span>}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            );
                        })}
                    </div>
                </div>

                {/* Network Rack */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-heading font-semibold text-white flex items-center gap-2">🗄️ {l.rack}</h3>
                        <button onClick={() => setRackEditing(e => !e)} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${rackEditing ? 'border-brand-gold bg-[rgba(201,168,76,0.1)] text-brand-gold' : 'border-border-subtle text-brand-gold-muted hover:border-brand-gold/30'}`}>
                            {rackEditing ? l.editDone : l.editRack}
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {RACK_OPTIONS.map((r) => {
                            const custom = rackCustom[r.id];
                            const displayName = r.id === 'none' ? l[r.id] : (custom?.name || l[r.id]);
                            const displayPrice = r.id === 'none' ? 0 : (custom?.price ?? r.price);
                            if (rackEditing && r.id === 'none') return null;
                            return (
                                <div key={r.id}>
                                    {rackEditing && r.id !== 'none' ? (
                                        <div className="p-4 rounded-lg border border-brand-gold/30 bg-surface-card space-y-2">
                                            <div className="text-xs text-brand-gold-muted">{'icon' in r ? `${r.icon} ` : ''}{l[r.id]}</div>
                                            <input type="text" value={custom?.name || ''} placeholder={l[r.id]}
                                                onChange={(e) => setRackCustom(prev => ({ ...prev, [r.id]: { ...prev[r.id], name: e.target.value } }))}
                                                className="w-full text-xs bg-brand-dark border border-border-subtle rounded px-2 py-1 text-white placeholder-brand-gold-muted/50 focus:outline-none focus:border-brand-gold/50" />
                                            <div className="flex items-center gap-1">
                                                <input type="number" value={displayPrice} min={0}
                                                    onChange={(e) => setRackCustom(prev => ({ ...prev, [r.id]: { ...prev[r.id], price: Number(e.target.value) } }))}
                                                    className="w-24 text-xs bg-brand-dark border border-border-subtle rounded px-2 py-1 text-brand-gold focus:outline-none focus:border-brand-gold/50" />
                                                <span className="text-xs text-brand-gold-muted">€</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <button onClick={() => setRack(r.id)} className={`w-full p-4 rounded-lg border text-left transition-all duration-200 ${rack === r.id ? 'bg-[rgba(201,168,76,0.1)] border-brand-gold' : 'bg-surface-card border-border-subtle hover:border-brand-gold/30'}`}>
                                            <div className={`font-semibold ${rack === r.id ? 'text-brand-gold' : 'text-white'}`}>{'icon' in r ? `${r.icon} ` : ''}{displayName}</div>
                                            <div className="text-sm text-brand-gold-muted mt-1">{displayPrice > 0 ? `${displayPrice}€` : '—'}</div>
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>


                {/* Upsell Services */}
                <div className="card p-6">
                    <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                        ⭐ {l.upsell}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {UPSELL_LIST.map((up) => (
                            <label
                                key={up.id}
                                className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-200 ${upsellOptions[up.id]
                                    ? 'bg-[rgba(201,168,76,0.1)] border-brand-gold'
                                    : 'bg-surface-card border-border-subtle hover:border-brand-gold/30'}`}
                            >
                                <input type="checkbox" checked={upsellOptions[up.id]}
                                    onChange={(e) => setUpsellOptions(prev => ({ ...prev, [up.id]: e.target.checked }))}
                                    className="sr-only" />
                                <span className="text-xl">{up.icon}</span>
                                <div className="flex-1">
                                    <div className={`text-sm font-medium ${upsellOptions[up.id] ? 'text-brand-gold' : 'text-white'}`}>{l[up.id]}</div>
                                    <div className="text-xs text-brand-gold-muted">{up.price}€</div>
                                </div>
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${upsellOptions[up.id] ? 'bg-brand-gold border-brand-gold text-black' : 'border-border-subtle'}`}>
                                    {upsellOptions[up.id] && <span className="text-xs font-bold">✓</span>}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Urgency */}
                <div className="card p-6">
                    <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                        ⏱️ {l.urgency}
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        {URGENCY_LEVELS.map((u) => (
                            <button
                                key={u.id}
                                onClick={() => setUrgency(u.id)}
                                className={`p-4 rounded-lg border text-center transition-all duration-200 ${urgency === u.id
                                    ? 'bg-[rgba(201,168,76,0.1)] border-brand-gold'
                                    : 'bg-surface-card border-border-subtle hover:border-brand-gold/30'}`}
                            >
                                <div className="text-xl mb-1">{u.icon}</div>
                                <div className={`text-sm font-medium ${urgency === u.id ? 'text-brand-gold' : 'text-white'}`}>{l[u.id]}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT — TRANSPARENT PRICE SUMMARY (Sticky) */}
            <div className="lg:col-span-1">
                <div className="sticky top-24 card p-6 border-brand-gold/20">
                    <h3 className="font-heading font-bold text-xl text-white mb-6 pb-4 border-b border-border-subtle">
                        💰 {l.total}
                    </h3>

                    <div className="space-y-3 text-sm mb-6">
                        {/* Points & cable length */}
                        <div className="flex justify-between text-brand-gold-muted">
                            <span>{l.points}</span>
                            <span className="text-white font-medium">{points}</span>
                        </div>
                        <div className="flex justify-between text-brand-gold-muted">
                            <span>{l.totalCableLength}</span>
                            <span className="text-white font-medium">{calc.totalCableLength}m</span>
                        </div>

                        <div className="h-px bg-border-subtle" />

                        {/* Cable cost */}
                        <div className="flex justify-between text-brand-gold-muted group/tip relative">
                            <span className="flex items-center gap-1">{l.cableCost} ({CABLE_TYPES.find(c => c.id === cableType)!.name}) <span className="text-xs opacity-50 cursor-help" title={l.tipCable}>ℹ️</span></span>
                            <span>{calc.cableCost.toFixed(2)}€</span>
                        </div>

                        {/* Labor cost */}
                        <div className="flex justify-between text-brand-gold-muted">
                            <span className="flex items-center gap-1">{l.laborCost} <span className="text-xs opacity-50 cursor-help" title={l.tipLabor}>ℹ️</span></span>
                            <span>{calc.laborCost.toFixed(2)}€</span>
                        </div>

                        {/* Routing cost */}
                        <div className="flex justify-between text-brand-gold-muted">
                            <span className="flex items-center gap-1">{l.routingCost} ({calc.routingPrice}€/m × {calc.totalCableLength}m) <span className="text-xs opacity-50 cursor-help" title={l.tipRouting}>ℹ️</span></span>
                            <span>{calc.routingCost.toFixed(2)}€</span>
                        </div>

                        {/* Trench cost — only if > 0 */}
                        {calc.trenchCost > 0 && (
                            <div className="flex justify-between text-yellow-400">
                                <span className="flex items-center gap-1">{l.trenchCost} ({calc.trenchLength}m) <span className="text-xs opacity-50 cursor-help" title={l.tipTrench}>ℹ️</span></span>
                                <span>{calc.trenchCost.toFixed(2)}€</span>
                            </div>
                        )}

                        {/* Canaleta cost — only if > 0 */}
                        {calc.canetaCost > 0 && (
                            <div className="flex justify-between text-yellow-400">
                                <span className="flex items-center gap-1">{l.canaleta} ({calc.canetaLength}m) <span className="text-xs opacity-50 cursor-help" title={l.tipCanaleta}>ℹ️</span></span>
                                <span>{calc.canetaCost.toFixed(2)}€</span>
                            </div>
                        )}

                        {/* Materials per point */}
                        <div className="flex justify-between text-brand-gold-muted">
                            <span className="flex items-center gap-1">{l.materialsCostLabel} ({calc.materialsPerPoint}€ × {points}) <span className="text-xs opacity-50 cursor-help" title={l.tipMaterials}>ℹ️</span></span>
                            <span>{calc.materialsCost.toFixed(2)}€</span>
                        </div>

                        {/* Additional materials */}
                        {calc.additionalMaterialsCost > 0 && (
                            <div className="flex justify-between text-brand-gold-muted">
                                <span>{l.additionalMaterialsCost}</span>
                                <span>{calc.additionalMaterialsCost.toFixed(2)}€</span>
                            </div>
                        )}

                        {/* Equipment */}
                        {calc.equipmentCost > 0 && (
                            <div className="flex justify-between text-brand-gold-muted">
                                <span>{l.equipmentCost}</span>
                                <span>{calc.equipmentCost.toFixed(2)}€</span>
                            </div>
                        )}

                        {/* Rack */}
                        {calc.rackCost > 0 && (
                            <div className="flex justify-between text-brand-gold-muted">
                                <span className="flex items-center gap-1">{l.rackCost} <span className="text-xs opacity-50 cursor-help" title={l.tipRack}>ℹ️</span></span>
                                <span>{calc.rackCost.toFixed(2)}€</span>
                            </div>
                        )}

                        {/* Upsell */}
                        {calc.upsellCost > 0 && (
                            <div className="flex justify-between text-brand-gold-muted">
                                <span className="flex items-center gap-1">{l.upsellCost} <span className="text-xs opacity-50 cursor-help" title={l.tipUpsell}>ℹ️</span></span>
                                <span>{calc.upsellCost.toFixed(2)}€</span>
                            </div>
                        )}

                        <div className="h-px bg-border-subtle" />

                        {/* Subtotal */}
                        <div className="flex justify-between font-medium text-white">
                            <span>{l.subtotal}</span>
                            <span>{calc.subtotal.toFixed(2)}€</span>
                        </div>

                        {/* Discount */}
                        {calc.discount > 0 && (
                            <div className="flex justify-between text-green-400">
                                <span>{l.discount} (-{calc.discountPercent}%)</span>
                                <span>-{calc.discount.toFixed(2)}€</span>
                            </div>
                        )}

                        {/* Urgency */}
                        {urgency !== 'normal' && (
                            <div className="flex justify-between text-yellow-400">
                                <span>{l.urgencyLabel}</span>
                                <span>×{calc.urgencyOption.multiplier}</span>
                            </div>
                        )}

                        {/* IVA */}
                        <div className="flex justify-between text-brand-gold-muted">
                            <span>{l.iva}</span>
                            <span>{calc.iva.toFixed(2)}€</span>
                        </div>

                        <div className="h-px bg-border-subtle" />
                    </div>

                    {/* TOTAL */}
                    <div className="text-center mb-6">
                        <div className="text-xs text-brand-gold-muted uppercase tracking-wider mb-1">{l.total}</div>
                        <div className="font-heading text-4xl font-extrabold text-gradient-gold">
                            {calc.total.toFixed(2)}€
                        </div>
                    </div>

                    <button
                        onClick={() => document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' })}
                        className="btn-gold w-full justify-center text-base py-4 mb-4"
                    >
                        {l.requestQuote} →
                    </button>

                    <a
                        href={`https://wa.me/34605974605?text=${encodeURIComponent(
                            `Hola, me gustaría un presupuesto para ${points} puntos de red (${calc.totalCableLength}m de cable ${CABLE_TYPES.find(c => c.id === cableType)!.name}). Tipo: ${l[installType]}. Estimación: ${calc.total.toFixed(2)}€`
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

                    {/* Quote Form */}
                    <div id="quote-form" className="mt-6 pt-6 border-t border-border-subtle">
                        <QuoteForm
                            locale={locale}
                            calculationData={{
                                cableType,
                                cableMeters: calc.totalCableLength,
                                points,
                                installationType: installType,
                                installationMeters: calc.trenchLength,
                                canaleta: calc.canetaLength,
                                tubo_corrugado: additionalMaterials.corrugated || 0,
                                tubo_pvc: additionalMaterials.pvc || 0,
                                canaleta_extra: additionalMaterials.trunking || 0,
                                mano_de_obra_horas: additionalMaterials.laborHour || 0,
                                regata: calc.trenchLength,
                                patchPanel12: patchPanelCounts.pp12 || 0,
                                patchPanel24: patchPanelCounts.pp24 || 0,
                                patchPanel48: patchPanelCounts.pp48 || 0,
                                materialsCustomNames: {
                                    trunking:   materialsCustom.trunking?.name  || '',
                                    pvc:        materialsCustom.pvc?.name       || '',
                                    corrugated: materialsCustom.corrugated?.name|| '',
                                    laborHour:  materialsCustom.laborHour?.name || '',
                                },
                                materialsCustomPrices: {
                                    trunking:   materialsCustom.trunking?.price   ?? 4,
                                    pvc:        materialsCustom.pvc?.price        ?? 2,
                                    corrugated: materialsCustom.corrugated?.price ?? 1,
                                    laborHour:  materialsCustom.laborHour?.price  ?? 60,
                                },
                                rackCustomName: rackCustom[rack]?.name || '',
                                rackCustomPrice: rackCustom[rack]?.price ?? 0,
                                equipmentCustom,
                                customItems,
                                additionalWork: Object.fromEntries(Object.entries(equipment).map(([k, v]) => [k, v > 0])),
                                rack,
                                urgency,
                                cablesCost: calc.cableCost,
                                pointsCost: calc.materialsCost,
                                installCost: calc.routingCost,
                                laborCost: calc.laborCost,
                                materialsCost: calc.additionalMaterialsCost,
                                workCost: calc.equipmentCost,
                                rackCost: calc.rackCost,
                                subtotal: calc.subtotal,
                                urgencyMultiplier: calc.urgencyOption.multiplier,
                                iva: calc.iva,
                                total: calc.total,
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
            )}

            {/* ═══ COMBINED SUMMARY (if both calculators used) ═══ */}
            {fiberCalcData && fiberCalcData.total > 0 && calcMode === 'ethernet' && (
                <div className="card p-6 border-cyan-400/20 mt-6">
                    <h3 className="font-heading font-semibold text-white text-lg mb-4 text-center">
                        🧾 {locale === 'ru' ? 'Сводная смета' : locale === 'en' ? 'Combined Estimate' : 'Presupuesto combinado'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <div className="card p-4 border-brand-gold/20">
                            <div className="text-xs text-brand-gold-muted uppercase tracking-wider">🌐 Red Ethernet</div>
                            <div className="font-heading text-2xl font-bold text-gradient-gold mt-1">{calc.total.toFixed(2)}€</div>
                        </div>
                        <div className="card p-4 border-cyan-400/20">
                            <div className="text-xs text-brand-gold-muted uppercase tracking-wider">🔆 Fibra Óptica</div>
                            <div className="font-heading text-2xl font-bold text-cyan-300 mt-1">{fiberCalcData.total.toFixed(2)}€</div>
                        </div>
                        <div className="card p-4 border-green-400/20">
                            <div className="text-xs text-brand-gold-muted uppercase tracking-wider">💰 Total combinado</div>
                            <div className="font-heading text-2xl font-bold text-green-400 mt-1">{(calc.total + fiberCalcData.total).toFixed(2)}€</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
