'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import AIQuoteAssistant from './AIQuoteAssistant';
import QuoteForm from './QuoteForm';

/* ═════════════════════════════════════
   PRICING DATA (from user specification)
   ═════════════════════════════════════ */

const CABLE_TYPES = [
    { id: 'cat5e', name: 'Cat 5e', price: 2.5 },
    { id: 'cat6', name: 'Cat 6', price: 3 },
    { id: 'cat6a', name: 'Cat 6A', price: 4 },
    { id: 'cat7', name: 'Cat 7', price: 5 },
] as const;

const INSTALLATION_TYPES = [
    { id: 'superficial', price: 12, icon: '📌' },
    { id: 'techo', price: 10, icon: '🏗️' },
    { id: 'empotrado_existente', price: 15, icon: '🔩' },
    { id: 'empotrado_nuevo', price: 22, icon: '🧱' },
    { id: 'industrial', price: 25, icon: '🏭' },
] as const;

const MATERIALS = [
    { id: 'canaleta', price: 8, unit: 'm', icon: '📏' },
    { id: 'tubo_corrugado', price: 4, unit: 'm', icon: '🔧' },
    { id: 'regata', price: 20, unit: 'm', icon: '⚒️' },
] as const;

const ADDITIONAL_WORK = [
    { id: 'switch', price: 60, icon: '🔌' },
    { id: 'router', price: 60, icon: '📡' },
    { id: 'network_config', price: 120, icon: '⚙️' },
    { id: 'patch_panel', price: 80, icon: '🔗' },
] as const;

const RACK_OPTIONS = [
    { id: 'none', price: 0 },
    { id: 'small', price: 150, icon: '🗄️' },
    { id: 'professional', price: 300, icon: '🏗️' },
    { id: 'with_patch', price: 420, icon: '⚡' },
] as const;

const URGENCY_LEVELS = [
    { id: 'normal', multiplier: 1, icon: '🟢' },
    { id: 'urgente', multiplier: 1.5, icon: '🟡' },
    { id: 'weekend', multiplier: 2, icon: '🔴' },
] as const;

const IVA_RATE = 0.21;
const POINT_PRICE = 15; // €per point: RJ45 connector, rosette, termination, testing

/* Translations for calculator labels */
const calcLabels: Record<string, Record<string, string>> = {
    es: {
        pageTitle: 'Calculadora de',
        pageTitleHighlight: 'Instalación',
        pageSubtitle: 'Calcula el coste estimado de tu instalación de red. Configura los detalles y obtén un presupuesto al instante.',
        label: 'Herramienta online',
        cableType: 'Tipo de cable',
        points: 'Puntos de red',
        pointsHint: 'Cada punto incluye conector RJ45, roseta, terminación y testeo (15€/punto)',
        cableMeters: 'Metros de cable',
        cableMetersHint: 'Total de metros lineales de cable necesario',
        installType: 'Tipo de instalación',
        installTypeLabel: 'Precio por metro',
        installMeters: 'Metros de instalación',
        installMetersHint: 'Metros lineales de canalización / instalación',
        materials: 'Materiales adicionales',
        additionalWork: 'Trabajo adicional',
        rack: 'Rack de red',
        urgency: 'Urgencia',
        meters: 'metros',
        quantity: 'Cantidad',
        subtotal: 'Subtotal',
        iva: 'IVA (21%)',
        urgencyMultiplier: 'Multiplicador urgencia',
        total: 'Total estimado',
        requestQuote: 'Solicitar Presupuesto Detallado',
        disclaimer: 'Precios orientativos. El presupuesto final puede variar según las condiciones del espacio.',
        superficial: 'Superficial (Canaleta)',
        techo: 'Techo técnico',
        empotrado_existente: 'Empotrado existente',
        empotrado_nuevo: 'Empotrado nuevo',
        industrial: 'Industrial (Nave / Fábrica)',
        canaleta: 'Canaleta',
        tubo_corrugado: 'Tubo corrugado',
        regata: 'Regata (corte muro)',
        switch: 'Instalación switch',
        router: 'Instalación router',
        network_config: 'Configuración de red',
        patch_panel: 'Instalación patch panel',
        none: 'Sin rack',
        small: 'Rack pequeño',
        professional: 'Rack profesional',
        with_patch: 'Rack + Patch panel',
        normal: 'Normal',
        urgente: 'Urgente (×1.5)',
        weekend: 'Fin de semana (×2)',
    },
    en: {
        pageTitle: 'Installation',
        pageTitleHighlight: 'Calculator',
        pageSubtitle: 'Estimate the cost of your network installation. Configure the details and get an instant quote.',
        label: 'Online tool',
        cableType: 'Cable type',
        points: 'Network points',
        pointsHint: 'Each point includes RJ45 connector, faceplate, termination and testing (15€/point)',
        cableMeters: 'Cable meters',
        cableMetersHint: 'Total linear meters of cable needed',
        installType: 'Installation type',
        installTypeLabel: 'Price per meter',
        installMeters: 'Installation meters',
        installMetersHint: 'Linear meters of conduit / installation',
        materials: 'Additional materials',
        additionalWork: 'Additional work',
        rack: 'Network rack',
        urgency: 'Urgency',
        meters: 'meters',
        quantity: 'Quantity',
        subtotal: 'Subtotal',
        iva: 'VAT (21%)',
        urgencyMultiplier: 'Urgency multiplier',
        total: 'Estimated total',
        requestQuote: 'Request Detailed Quote',
        disclaimer: 'Indicative prices. The final quote may vary depending on space conditions.',
        superficial: 'Surface (Cable tray)',
        techo: 'Suspended ceiling',
        empotrado_existente: 'Existing conduit',
        empotrado_nuevo: 'New conduit',
        industrial: 'Industrial (Warehouse / Factory)',
        canaleta: 'Cable tray',
        tubo_corrugado: 'Corrugated tube',
        regata: 'Wall cutting',
        switch: 'Switch installation',
        router: 'Router installation',
        network_config: 'Network configuration',
        patch_panel: 'Patch panel installation',
        none: 'No rack',
        small: 'Small rack',
        professional: 'Professional rack',
        with_patch: 'Rack + Patch panel',
        normal: 'Normal',
        urgente: 'Urgent (×1.5)',
        weekend: 'Weekend (×2)',
    },
    ru: {
        pageTitle: 'Калькулятор',
        pageTitleHighlight: 'установки',
        pageSubtitle: 'Рассчитайте стоимость монтажа сети. Укажите параметры и получите смету мгновенно.',
        label: 'Онлайн-инструмент',
        cableType: 'Тип кабеля',
        points: 'Сетевые точки',
        pointsHint: 'Каждая точка: коннектор RJ45, розетка, терминация и тестирование (15€/точка)',
        cableMeters: 'Метры кабеля',
        cableMetersHint: 'Общее количество погонных метров кабеля',
        installType: 'Тип монтажа',
        installTypeLabel: 'Цена за метр',
        installMeters: 'Метры установки',
        installMetersHint: 'Погонные метры кабель-канала / монтажа',
        materials: 'Доп. материалы',
        additionalWork: 'Доп. работы',
        rack: 'Сетевой шкаф',
        urgency: 'Срочность',
        meters: 'метров',
        quantity: 'Количество',
        subtotal: 'Подитог',
        iva: 'НДС (21%)',
        urgencyMultiplier: 'Множитель срочности',
        total: 'Итого (ориентировочно)',
        requestQuote: 'Запросить подробную смету',
        disclaimer: 'Цены ориентировочные. Итоговая смета может измениться в зависимости от условий.',
        superficial: 'Открытый (кабель-канал)',
        techo: 'Подвесной потолок',
        empotrado_existente: 'Существующая штроба',
        empotrado_nuevo: 'Новая штроба',
        industrial: 'Промышленный (Склад / Завод)',
        canaleta: 'Кабель-канал',
        tubo_corrugado: 'Гофра',
        regata: 'Штробление стены',
        switch: 'Установка свитча',
        router: 'Установка роутера',
        network_config: 'Настройка сети',
        patch_panel: 'Установка патч-панели',
        none: 'Без шкафа',
        small: 'Маленький шкаф',
        professional: 'Профессиональный шкаф',
        with_patch: 'Шкаф + Патч-панель',
        normal: 'Обычная',
        urgente: 'Срочно (×1.5)',
        weekend: 'Выходные (×2)',
    },
};

export default function Calculator({ locale }: { locale: string }) {
    const l = calcLabels[locale] || calcLabels.es;

    // State
    const [cableType, setCableType] = useState('cat6');
    const [points, setPoints] = useState(4);
    const [cableMeters, setCableMeters] = useState(20);
    const [installMeters, setInstallMeters] = useState(15);
    const [installType, setInstallType] = useState('superficial');
    const [materialQty, setMaterialQty] = useState<Record<string, number>>({
        canaleta: 0,
        tubo_corrugado: 0,
        regata: 0,
    });
    const [additionalWork, setAdditionalWork] = useState<Record<string, boolean>>({
        switch: false,
        router: false,
        network_config: false,
        patch_panel: false,
    });
    const [rack, setRack] = useState('none');
    const [urgency, setUrgency] = useState('normal');

    // AI assistant callback
    const handleAIApply = useCallback((parsed: any) => {
        if (parsed.cableType) setCableType(parsed.cableType);
        if (parsed.points) setPoints(parsed.points);
        if (parsed.cableMeters) setCableMeters(parsed.cableMeters);
        if (parsed.installationMeters) setInstallMeters(parsed.installationMeters);
        if (parsed.installationType) setInstallType(parsed.installationType);
        if (parsed.rack) setRack(parsed.rack);
        if (parsed.urgency) setUrgency(parsed.urgency);
        if (parsed.additionalWork) {
            setAdditionalWork(prev => ({ ...prev, ...parsed.additionalWork }));
        }
        if (parsed.materials) {
            setMaterialQty(prev => ({ ...prev, ...parsed.materials }));
        }
    }, []);

    // Calculations
    const calculation = useMemo(() => {
        const cable = CABLE_TYPES.find((c) => c.id === cableType)!;
        const install = INSTALLATION_TYPES.find((i) => i.id === installType)!;
        const rackOption = RACK_OPTIONS.find((r) => r.id === rack)!;
        const urgencyOption = URGENCY_LEVELS.find((u) => u.id === urgency)!;

        const cablesCost = cableMeters * cable.price;
        const pointsCost = points * POINT_PRICE;
        const installCost = installMeters * install.price;
        const materialsCost = MATERIALS.reduce(
            (sum, mat) => sum + (materialQty[mat.id] || 0) * mat.price,
            0
        );
        const workCost = ADDITIONAL_WORK.reduce(
            (sum, work) => sum + (additionalWork[work.id] ? work.price : 0),
            0
        );
        const rackCost = rackOption.price;

        const subtotal = cablesCost + pointsCost + installCost + materialsCost + workCost + rackCost;
        const afterUrgency = subtotal * urgencyOption.multiplier;
        const iva = afterUrgency * IVA_RATE;
        const total = afterUrgency + iva;

        return { cablesCost, pointsCost, installCost, materialsCost, workCost, rackCost, subtotal, afterUrgency, iva, total, urgencyOption };
    }, [cableType, cableMeters, installMeters, points, installType, materialQty, additionalWork, rack, urgency]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT — Configuration */}
            <div className="lg:col-span-2 space-y-6">

                {/* AI Quote Assistant */}
                <AIQuoteAssistant locale={locale} onApply={handleAIApply} />

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
                                className={`p-4 rounded-lg border text-center transition-all duration-200 ${cableType === cable.id
                                    ? 'bg-[rgba(201,168,76,0.1)] border-brand-gold text-brand-gold'
                                    : 'bg-surface-card border-border-subtle text-brand-gold-muted hover:border-brand-gold/30'
                                    }`}
                            >
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
                            onClick={() => setPoints(Math.max(1, points - 1))}
                            className="w-12 h-12 rounded-lg bg-surface-card border border-border-subtle text-white hover:border-brand-gold/50 transition-colors text-xl font-bold"
                        >
                            −
                        </button>
                        <div className="flex-1">
                            <input
                                type="range"
                                min={1}
                                max={100}
                                value={points}
                                onChange={(e) => setPoints(Number(e.target.value))}
                                className="w-full accent-[#c9a84c] h-2 rounded-full appearance-none bg-surface-card cursor-pointer"
                            />
                        </div>
                        <button
                            onClick={() => setPoints(Math.min(100, points + 1))}
                            className="w-12 h-12 rounded-lg bg-surface-card border border-border-subtle text-white hover:border-brand-gold/50 transition-colors text-xl font-bold"
                        >
                            +
                        </button>
                        <div className="w-16 text-center">
                            <span className="font-heading text-2xl font-bold text-gradient-gold">{points}</span>
                        </div>
                    </div>
                </div>

                {/* Cable Meters */}
                <div className="card p-6">
                    <h3 className="font-heading font-semibold text-white mb-1 flex items-center gap-2">
                        📐 {l.cableMeters}
                    </h3>
                    <p className="text-xs text-brand-gold-muted mb-4">{l.cableMetersHint}</p>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setCableMeters(Math.max(1, cableMeters - 5))}
                            className="w-12 h-12 rounded-lg bg-surface-card border border-border-subtle text-white hover:border-brand-gold/50 transition-colors text-xl font-bold"
                        >
                            −
                        </button>
                        <div className="flex-1">
                            <input
                                type="range"
                                min={1}
                                max={5000}
                                value={cableMeters}
                                onChange={(e) => setCableMeters(Number(e.target.value))}
                                className="w-full accent-[#c9a84c] h-2 rounded-full appearance-none bg-surface-card cursor-pointer"
                            />
                        </div>
                        <button
                            onClick={() => setCableMeters(Math.min(5000, cableMeters + 5))}
                            className="w-12 h-12 rounded-lg bg-surface-card border border-border-subtle text-white hover:border-brand-gold/50 transition-colors text-xl font-bold"
                        >
                            +
                        </button>
                        <div className="w-20 text-center">
                            <span className="font-heading text-2xl font-bold text-gradient-gold">{cableMeters}</span>
                            <span className="text-xs text-brand-gold-muted ml-1">m</span>
                        </div>
                    </div>
                </div>

                {/* Installation Meters */}
                <div className="card p-6">
                    <h3 className="font-heading font-semibold text-white mb-1 flex items-center gap-2">
                        📏 {l.installMeters}
                    </h3>
                    <p className="text-xs text-brand-gold-muted mb-4">{l.installMetersHint}</p>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setInstallMeters(Math.max(0, installMeters - 5))}
                            className="w-12 h-12 rounded-lg bg-surface-card border border-border-subtle text-white hover:border-brand-gold/50 transition-colors text-xl font-bold"
                        >
                            −
                        </button>
                        <div className="flex-1">
                            <input
                                type="range"
                                min={0}
                                max={2000}
                                value={installMeters}
                                onChange={(e) => setInstallMeters(Number(e.target.value))}
                                className="w-full accent-[#c9a84c] h-2 rounded-full appearance-none bg-surface-card cursor-pointer"
                            />
                        </div>
                        <button
                            onClick={() => setInstallMeters(Math.min(2000, installMeters + 5))}
                            className="w-12 h-12 rounded-lg bg-surface-card border border-border-subtle text-white hover:border-brand-gold/50 transition-colors text-xl font-bold"
                        >
                            +
                        </button>
                        <div className="w-20 text-center">
                            <span className="font-heading text-2xl font-bold text-gradient-gold">{installMeters}</span>
                            <span className="text-xs text-brand-gold-muted ml-1">m</span>
                        </div>
                    </div>
                </div>

                {/* Installation Type */}
                <div className="card p-6">
                    <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                        🔧 {l.installType}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                    <div className="text-sm text-brand-gold-muted">{install.price}€/m</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Additional Materials */}
                <div className="card p-6">
                    <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                        📦 {l.materials}
                    </h3>
                    <div className="space-y-3">
                        {MATERIALS.map((mat) => (
                            <div key={mat.id} className="flex items-center gap-4 p-3 rounded-lg bg-surface-card border border-border-subtle">
                                <span className="text-xl">{mat.icon}</span>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-white">{l[mat.id]}</div>
                                    <div className="text-xs text-brand-gold-muted">{mat.price}€/{mat.unit}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setMaterialQty((prev) => ({ ...prev, [mat.id]: Math.max(0, (prev[mat.id] || 0) - 1) }))}
                                        className="w-8 h-8 rounded bg-brand-dark text-white border border-border-subtle text-sm hover:border-brand-gold/30 transition-colors"
                                    >
                                        −
                                    </button>
                                    <span className="w-10 text-center font-heading font-bold text-brand-gold">{materialQty[mat.id] || 0}</span>
                                    <button
                                        onClick={() => setMaterialQty((prev) => ({ ...prev, [mat.id]: (prev[mat.id] || 0) + 1 }))}
                                        className="w-8 h-8 rounded bg-brand-dark text-white border border-border-subtle text-sm hover:border-brand-gold/30 transition-colors"
                                    >
                                        +
                                    </button>
                                    <span className="text-xs text-brand-gold-muted w-14 text-right shrink-0 whitespace-nowrap">{l.meters}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Additional Work */}
                <div className="card p-6">
                    <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                        🛠️ {l.additionalWork}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {ADDITIONAL_WORK.map((work) => (
                            <label
                                key={work.id}
                                className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-200 ${additionalWork[work.id]
                                    ? 'bg-[rgba(201,168,76,0.1)] border-brand-gold'
                                    : 'bg-surface-card border-border-subtle hover:border-brand-gold/30'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={additionalWork[work.id]}
                                    onChange={(e) => setAdditionalWork((prev) => ({ ...prev, [work.id]: e.target.checked }))}
                                    className="sr-only"
                                />
                                <span className="text-xl">{work.icon}</span>
                                <div className="flex-1">
                                    <div className={`text-sm font-medium ${additionalWork[work.id] ? 'text-brand-gold' : 'text-white'}`}>
                                        {l[work.id]}
                                    </div>
                                    <div className="text-xs text-brand-gold-muted">{work.price}€</div>
                                </div>
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${additionalWork[work.id] ? 'bg-brand-gold border-brand-gold text-black' : 'border-border-subtle'
                                    }`}>
                                    {additionalWork[work.id] && <span className="text-xs font-bold">✓</span>}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Rack */}
                <div className="card p-6">
                    <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
                        🗄️ {l.rack}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {RACK_OPTIONS.map((r) => (
                            <button
                                key={r.id}
                                onClick={() => setRack(r.id)}
                                className={`p-4 rounded-lg border text-left transition-all duration-200 ${rack === r.id
                                    ? 'bg-[rgba(201,168,76,0.1)] border-brand-gold'
                                    : 'bg-surface-card border-border-subtle hover:border-brand-gold/30'
                                    }`}
                            >
                                <div className={`font-semibold ${rack === r.id ? 'text-brand-gold' : 'text-white'}`}>
                                    {'icon' in r ? `${r.icon} ` : ''}{l[r.id]}
                                </div>
                                <div className="text-sm text-brand-gold-muted mt-1">{r.price > 0 ? `${r.price}€` : '—'}</div>
                            </button>
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
                                    : 'bg-surface-card border-border-subtle hover:border-brand-gold/30'
                                    }`}
                            >
                                <div className="text-xl mb-1">{u.icon}</div>
                                <div className={`text-sm font-medium ${urgency === u.id ? 'text-brand-gold' : 'text-white'}`}>
                                    {l[u.id]}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT — Price Summary (Sticky) */}
            <div className="lg:col-span-1">
                <div className="sticky top-24 card p-6 border-brand-gold/20">
                    <h3 className="font-heading font-bold text-xl text-white mb-6 pb-4 border-b border-border-subtle">
                        💰 {l.total}
                    </h3>

                    <div className="space-y-3 text-sm mb-6">
                        <div className="flex justify-between text-brand-gold-muted">
                            <span>{CABLE_TYPES.find((c) => c.id === cableType)!.name} — {cableMeters}m</span>
                            <span>{calculation.cablesCost.toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between text-brand-gold-muted">
                            <span>{l.points} — {points} × {POINT_PRICE}€</span>
                            <span>{calculation.pointsCost.toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between text-brand-gold-muted">
                            <span>{l.installType} — {installMeters}m</span>
                            <span>{calculation.installCost.toFixed(2)}€</span>
                        </div>
                        {calculation.materialsCost > 0 && (
                            <div className="flex justify-between text-brand-gold-muted">
                                <span>{l.materials}</span>
                                <span>{calculation.materialsCost.toFixed(2)}€</span>
                            </div>
                        )}
                        {calculation.workCost > 0 && (
                            <div className="flex justify-between text-brand-gold-muted">
                                <span>{l.additionalWork}</span>
                                <span>{calculation.workCost.toFixed(2)}€</span>
                            </div>
                        )}
                        {calculation.rackCost > 0 && (
                            <div className="flex justify-between text-brand-gold-muted">
                                <span>{l.rack}</span>
                                <span>{calculation.rackCost.toFixed(2)}€</span>
                            </div>
                        )}

                        <div className="h-px bg-border-subtle" />

                        <div className="flex justify-between font-medium text-white">
                            <span>{l.subtotal}</span>
                            <span>{calculation.subtotal.toFixed(2)}€</span>
                        </div>

                        {urgency !== 'normal' && (
                            <div className="flex justify-between text-yellow-400">
                                <span>{l.urgencyMultiplier}</span>
                                <span>×{calculation.urgencyOption.multiplier}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-brand-gold-muted">
                            <span>{l.iva}</span>
                            <span>{calculation.iva.toFixed(2)}€</span>
                        </div>

                        <div className="h-px bg-border-subtle" />
                    </div>

                    <div className="text-center mb-6">
                        <div className="text-xs text-brand-gold-muted uppercase tracking-wider mb-1">{l.total}</div>
                        <div className="font-heading text-4xl font-extrabold text-gradient-gold">
                            {calculation.total.toFixed(2)}€
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
                            `Hola, me gustaría un presupuesto para ${points} puntos de red, ${cableMeters}m de cable ${CABLE_TYPES.find((c) => c.id === cableType)!.name}, ${installMeters}m de instalación. Estimación: ${calculation.total.toFixed(2)}€`
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
                                cableMeters,
                                points,
                                installationType: installType,
                                installationMeters: installMeters,
                                canaleta: materialQty.canaleta || 0,
                                tubo_corrugado: materialQty.tubo_corrugado || 0,
                                regata: materialQty.regata || 0,
                                additionalWork,
                                rack,
                                urgency,
                                cablesCost: calculation.cablesCost,
                                pointsCost: calculation.pointsCost,
                                installCost: calculation.installCost,
                                materialsCost: calculation.materialsCost,
                                workCost: calculation.workCost,
                                rackCost: calculation.rackCost,
                                subtotal: calculation.subtotal,
                                urgencyMultiplier: calculation.urgencyOption.multiplier,
                                iva: calculation.iva,
                                total: calculation.total,
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
