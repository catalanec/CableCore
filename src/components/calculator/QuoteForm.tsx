'use client';

import { useState, FormEvent } from 'react';
import { downloadQuotePDF, generateQuoteNumber, type QuotePDFData } from '@/lib/quote-pdf';
import { trackCalculatorQuoteRequest, trackLeadSubmit } from '@/lib/analytics';

interface QuoteFormProps {
    locale: string;
    calculationData: {
        cableType: string;
        cableMeters: number;
        points: number;
        installationType: string;
        installationMeters: number;
        canaleta: number;
        tubo_corrugado: number;
        tubo_pvc: number;
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
        customItems: Array<{ id: string; name: string; qty: number; price: number }>;
        additionalWork: Record<string, boolean>;
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
        urgencyMultiplier: number;
        iva: number;
        total: number;
    };
}

const formLabels: Record<string, Record<string, string>> = {
    es: {
        title: 'Generar Presupuesto PDF',
        name: 'Nombre completo',
        phone: 'Teléfono',
        email: 'Email',
        address: 'Dirección de instalación',
        notes: 'Notas adicionales',
        download: '📄 Descargar Presupuesto PDF',
        save: '💾 Guardar en CRM',
        saved: '✅ Guardado correctamente',
        close: 'Cerrar',
    },
    en: {
        title: 'Generate PDF Quote',
        name: 'Full name',
        phone: 'Phone',
        email: 'Email',
        address: 'Installation address',
        notes: 'Additional notes',
        download: '📄 Download PDF Quote',
        save: '💾 Save to CRM',
        saved: '✅ Saved successfully',
        close: 'Close',
    },
    ru: {
        title: 'Сформировать PDF-смету',
        name: 'ФИО',
        phone: 'Телефон',
        email: 'Email',
        address: 'Адрес установки',
        notes: 'Дополнительные заметки',
        download: '📄 Скачать PDF-смету',
        save: '💾 Сохранить в CRM',
        saved: '✅ Сохранено успешно',
        close: 'Закрыть',
    },
};

const installLabels: Record<string, string> = {
    external: 'Superficial (Canaleta)',
    ceiling: 'Techo técnico (falso techo)',
    existing_wall: 'Empotrado (tubos existentes)',
    new_wall: 'Empotrado nuevo (regata)',
    industrial: 'Industrial (Nave / Fábrica)',
    trays: 'Bandejas portacables',
};

const workLabels: Record<string, string> = {
    switch: 'Instalación switch',
    router: 'Instalación router',
    network_config: 'Configuración de red',
    patch_panel: 'Instalación patch panel',
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

export default function QuoteForm({ locale, calculationData }: QuoteFormProps) {
    const l = formLabels[locale] || formLabels.es;
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [saved, setSaved] = useState(false);

    const handleDownloadPDF = (e: FormEvent) => {
        e.preventDefault();

        const d = calculationData;
        const items: QuotePDFData['items'] = [];

        if (d.cablesCost > 0 || d.cableMeters > 0) {
            items.push({
                description: `Cableado ${d.cableType.toUpperCase()} — suministro de cable`,
                quantity: `${d.cableMeters}m`,
                unitPrice: `${(d.cablesCost / Math.max(1, d.cableMeters)).toFixed(2)}€`,
                total: `${d.cablesCost.toFixed(2)}€`,
            });
        }

        if (d.pointsCost > 0 || d.points > 0) {
            items.push({
                description: `Puntos de red — roseta RJ45, keystone, caja, testeo`,
                quantity: `${d.points} uds`,
                unitPrice: `${(d.pointsCost / Math.max(1, d.points)).toFixed(2)}€`,
                total: `${d.pointsCost.toFixed(2)}€`,
            });
        }

        if (d.installCost > 0) {
            items.push({
                description: `Tendido de cable — ${installLabels[d.installationType] || d.installationType}`,
                quantity: `${d.cableMeters}m`,
                unitPrice: `${(d.installCost / Math.max(1, d.cableMeters)).toFixed(2)}€`,
                total: `${d.installCost.toFixed(2)}€`,
            });
        }

        if (d.laborCost > 0) {
            items.push({
                description: 'Mano de obra — operarios, montaje, terminación, verificación',
                quantity: `${d.points} ptos`,
                unitPrice: `${(d.laborCost / Math.max(1, d.points)).toFixed(2)}€`,
                total: `${d.laborCost.toFixed(2)}€`,
            });
        }

        if (d.canaleta > 0) {
            const name = d.materialsCustomNames?.trunking || 'Canaleta (cable canal)';
            const price = d.materialsCustomPrices?.trunking ?? 4;
            items.push({ description: name, quantity: `${d.canaleta}m`, unitPrice: `${price.toFixed(2)}€`, total: `${(d.canaleta * price).toFixed(2)}€` });
        }
        if ((d.canaleta_extra || 0) > 0) {
            const name = d.materialsCustomNames?.trunking || 'Canaleta adicional';
            const price = d.materialsCustomPrices?.trunking ?? 4;
            items.push({ description: name, quantity: `${d.canaleta_extra}m`, unitPrice: `${price.toFixed(2)}€`, total: `${(d.canaleta_extra * price).toFixed(2)}€` });
        }
        if (d.tubo_corrugado > 0) {
            const name = d.materialsCustomNames?.corrugated || 'Tubo corrugado';
            const price = d.materialsCustomPrices?.corrugated ?? 1;
            items.push({ description: name, quantity: `${d.tubo_corrugado}m`, unitPrice: `${price.toFixed(2)}€`, total: `${(d.tubo_corrugado * price).toFixed(2)}€` });
        }
        if ((d.tubo_pvc || 0) > 0) {
            const name = d.materialsCustomNames?.pvc || 'Tubo PVC';
            const price = d.materialsCustomPrices?.pvc ?? 2;
            items.push({ description: name, quantity: `${d.tubo_pvc}m`, unitPrice: `${price.toFixed(2)}€`, total: `${(d.tubo_pvc * price).toFixed(2)}€` });
        }
        if (d.regata > 0) {
            items.push({ description: 'Regata (corte muro)', quantity: `${d.regata}m`, unitPrice: '45.00€', total: `${(d.regata * 45).toFixed(2)}€` });
        }
        if ((d.mano_de_obra_horas || 0) > 0) {
            const name = d.materialsCustomNames?.laborHour || 'Mano de obra adicional';
            const price = d.materialsCustomPrices?.laborHour ?? 60;
            items.push({ description: name, quantity: `${d.mano_de_obra_horas}h`, unitPrice: `${price.toFixed(2)}€`, total: `${(d.mano_de_obra_horas * price).toFixed(2)}€` });
        }
        if ((d.patchPanel12 || 0) > 0) {
            items.push({ description: 'Patch Panel 12 puertos — instalación + crimpado', quantity: `${d.patchPanel12} ud`, unitPrice: '40.00€', total: `${(d.patchPanel12 * 40).toFixed(2)}€` });
        }
        if ((d.patchPanel24 || 0) > 0) {
            items.push({ description: 'Patch Panel 24 puertos — instalación + crimpado', quantity: `${d.patchPanel24} ud`, unitPrice: '65.00€', total: `${(d.patchPanel24 * 65).toFixed(2)}€` });
        }
        if ((d.patchPanel48 || 0) > 0) {
            items.push({ description: 'Patch Panel 48 puertos — instalación + crimpado', quantity: `${d.patchPanel48} ud`, unitPrice: '100.00€', total: `${(d.patchPanel48 * 100).toFixed(2)}€` });
        }

        // Custom line items
        (d.customItems || []).forEach((item) => {
            if (item.name && (item.qty > 0) && (item.price > 0)) {
                items.push({
                    description: item.name,
                    quantity: `${item.qty} ud`,
                    unitPrice: `${item.price.toFixed(2)}€`,
                    total: `${(item.qty * item.price).toFixed(2)}€`,
                });
            }
        });

        Object.entries(d.additionalWork).forEach(([key, val]) => {
            if (val) {
                const custom = d.equipmentCustom?.[key];
                const name = custom?.name || workLabels[key] || key;
                const price = custom?.price ?? ({ switch: 40, router: 50, accessPoint: 70, configuration: 150, network_config: 120, patch_panel: 80 }[key] || 0);
                items.push({
                    description: name,
                    quantity: '1',
                    unitPrice: `${price.toFixed(2)}€`,
                    total: `${price.toFixed(2)}€`,
                });
            }
        });

        if (d.rack !== 'none') {
            const fallbackName = rackLabels[d.rack] || d.rack;
            const fallbackPrice = ({ rack_6u: 90, rack_9u: 130, rack_12u: 180, rack_18u: 250, rack_22u: 380, rack_42u: 650 }[d.rack] || d.rackCost);
            const rackName = d.rackCustomName || fallbackName;
            const rackPrice = d.rackCustomPrice > 0 ? d.rackCustomPrice : fallbackPrice;
            items.push({
                description: rackName,
                quantity: '1',
                unitPrice: `${rackPrice.toFixed(2)}€`,
                total: `${d.rackCost.toFixed(2)}€`,
            });
        }

        const pdfData: QuotePDFData = {
            quoteNumber: generateQuoteNumber(),
            date: new Date().toLocaleDateString('es-ES'),
            client: { name, phone, email, address: address || undefined },
            items,
            subtotal: `${d.subtotal.toFixed(2)}€`,
            urgencyMultiplier: d.urgencyMultiplier > 1 ? `×${d.urgencyMultiplier}` : undefined,
            iva: `${d.iva.toFixed(2)}€`,
            total: `${d.total.toFixed(2)}€`,
            notes: notes || undefined,
        };

        downloadQuotePDF(pdfData);

        // GA4: track quote download as conversion
        trackCalculatorQuoteRequest('ethernet', calculationData.total);
    };

    const handleSaveCRM = async () => {
        // Build the same items array as the PDF — including all custom lines
        const d = calculationData;
        const quoteItems: Array<{ description: string; quantity: string; unitPrice: string; total: string }> = [];

        if (d.cablesCost > 0 || d.cableMeters > 0) quoteItems.push({ description: `Cableado ${d.cableType.toUpperCase()} — suministro de cable`, quantity: `${d.cableMeters}m`, unitPrice: `${(d.cablesCost / Math.max(1, d.cableMeters)).toFixed(2)}€`, total: `${d.cablesCost.toFixed(2)}€` });
        if (d.pointsCost > 0 || d.points > 0) quoteItems.push({ description: 'Puntos de red — roseta RJ45, keystone, caja, testeo', quantity: `${d.points} uds`, unitPrice: `${(d.pointsCost / Math.max(1, d.points)).toFixed(2)}€`, total: `${d.pointsCost.toFixed(2)}€` });
        if (d.installCost > 0) quoteItems.push({ description: `Tendido de cable — ${installLabels[d.installationType] || d.installationType}`, quantity: `${d.cableMeters}m`, unitPrice: `${(d.installCost / Math.max(1, d.cableMeters)).toFixed(2)}€`, total: `${d.installCost.toFixed(2)}€` });
        if (d.laborCost > 0) quoteItems.push({ description: 'Mano de obra — operarios, montaje, terminación, verificación', quantity: `${d.points} ptos`, unitPrice: `${(d.laborCost / Math.max(1, d.points)).toFixed(2)}€`, total: `${d.laborCost.toFixed(2)}€` });
        if (d.canaleta > 0) { const p = d.materialsCustomPrices?.trunking ?? 4; quoteItems.push({ description: d.materialsCustomNames?.trunking || 'Canaleta (cable canal)', quantity: `${d.canaleta}m`, unitPrice: `${p.toFixed(2)}€`, total: `${(d.canaleta * p).toFixed(2)}€` }); }
        if ((d.canaleta_extra || 0) > 0) { const p = d.materialsCustomPrices?.trunking ?? 4; quoteItems.push({ description: d.materialsCustomNames?.trunking || 'Canaleta adicional', quantity: `${d.canaleta_extra}m`, unitPrice: `${p.toFixed(2)}€`, total: `${(d.canaleta_extra * p).toFixed(2)}€` }); }
        if (d.tubo_corrugado > 0) { const p = d.materialsCustomPrices?.corrugated ?? 1; quoteItems.push({ description: d.materialsCustomNames?.corrugated || 'Tubo corrugado', quantity: `${d.tubo_corrugado}m`, unitPrice: `${p.toFixed(2)}€`, total: `${(d.tubo_corrugado * p).toFixed(2)}€` }); }
        if ((d.tubo_pvc || 0) > 0) { const p = d.materialsCustomPrices?.pvc ?? 2; quoteItems.push({ description: d.materialsCustomNames?.pvc || 'Tubo PVC', quantity: `${d.tubo_pvc}m`, unitPrice: `${p.toFixed(2)}€`, total: `${(d.tubo_pvc * p).toFixed(2)}€` }); }
        if (d.regata > 0) quoteItems.push({ description: 'Regata (corte muro)', quantity: `${d.regata}m`, unitPrice: '45.00€', total: `${(d.regata * 45).toFixed(2)}€` });
        if ((d.mano_de_obra_horas || 0) > 0) { const p = d.materialsCustomPrices?.laborHour ?? 60; quoteItems.push({ description: d.materialsCustomNames?.laborHour || 'Mano de obra adicional', quantity: `${d.mano_de_obra_horas}h`, unitPrice: `${p.toFixed(2)}€`, total: `${(d.mano_de_obra_horas * p).toFixed(2)}€` }); }
        if ((d.patchPanel12 || 0) > 0) quoteItems.push({ description: 'Patch Panel 12p', quantity: `${d.patchPanel12} ud`, unitPrice: '40.00€', total: `${(d.patchPanel12 * 40).toFixed(2)}€` });
        if ((d.patchPanel24 || 0) > 0) quoteItems.push({ description: 'Patch Panel 24p', quantity: `${d.patchPanel24} ud`, unitPrice: '65.00€', total: `${(d.patchPanel24 * 65).toFixed(2)}€` });
        if ((d.patchPanel48 || 0) > 0) quoteItems.push({ description: 'Patch Panel 48p', quantity: `${d.patchPanel48} ud`, unitPrice: '100.00€', total: `${(d.patchPanel48 * 100).toFixed(2)}€` });
        (d.customItems || []).forEach(item => { if (item.name && item.qty > 0 && item.price > 0) quoteItems.push({ description: item.name, quantity: `${item.qty} ud`, unitPrice: `${item.price.toFixed(2)}€`, total: `${(item.qty * item.price).toFixed(2)}€` }); });
        Object.entries(d.additionalWork).forEach(([key, val]) => { if (val) { const custom = d.equipmentCustom?.[key]; const nm = custom?.name || workLabels[key] || key; const pr = custom?.price ?? ({ switch: 40, router: 50, accessPoint: 70, configuration: 150, network_config: 120, patch_panel: 80 }[key] || 0); quoteItems.push({ description: nm, quantity: '1', unitPrice: `${pr.toFixed(2)}€`, total: `${pr.toFixed(2)}€` }); } });
        if (d.rack !== 'none') { const fb = rackLabels[d.rack] || d.rack; const fp = ({ rack_6u: 90, rack_9u: 130, rack_12u: 180, rack_18u: 250, rack_22u: 380, rack_42u: 650 }[d.rack] || d.rackCost); const rn = d.rackCustomName || fb; const rp = d.rackCustomPrice > 0 ? d.rackCustomPrice : fp; quoteItems.push({ description: rn, quantity: '1', unitPrice: `${rp.toFixed(2)}€`, total: `${d.rackCost.toFixed(2)}€` }); }

        // Save to Supabase
        try {
            const res = await fetch('/api/quotes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_name: name,
                    client_phone: phone,
                    client_email: email,
                    client_address: address,
                    ...calculationData,
                    notes,
                    quoteItems,
                }),
            });
            if (res.ok) {
                setSaved(true);
                // GA4: track CRM save as lead generation
                trackLeadSubmit('calculator_crm');
            } else {
                const data = await res.json();
                alert('No se pudo guardar: ' + (data.error || 'Error desconocido'));
            }
        } catch (err) {
            alert('Error de red al guardar en CRM');
            console.error(err);
        }
    };

    const inputClass = "w-full px-4 py-3 bg-surface-card border border-border-subtle rounded-lg text-white placeholder-gray-500 focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 outline-none transition-all text-sm";

    return (
        <div className="card p-6 border-brand-gold/20">
            <h3 className="font-heading font-bold text-lg text-white mb-5 flex items-center gap-2">
                📋 {l.title}
            </h3>

            <form onSubmit={handleDownloadPDF} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-brand-gold-muted mb-1.5">{l.name}</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder={l.name} />
                    </div>
                    <div>
                        <label className="block text-xs text-brand-gold-muted mb-1.5">{l.phone}</label>
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+34 600 000 000" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs text-brand-gold-muted mb-1.5">{l.email}</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="email@example.com" />
                </div>

                <div>
                    <label className="block text-xs text-brand-gold-muted mb-1.5">{l.address}</label>
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} placeholder={l.address} />
                </div>

                <div>
                    <label className="block text-xs text-brand-gold-muted mb-1.5">{l.notes}</label>
                    <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} resize-none`} />
                </div>

                <div className="flex flex-col gap-3 pt-2">
                    <button type="submit" className="btn-gold w-full justify-center py-3.5 text-sm">
                        {l.download}
                    </button>
                    <button
                        type="button"
                        onClick={handleSaveCRM}
                        className="btn-outline w-full justify-center py-3 text-sm"
                    >
                        {saved ? l.saved : l.save}
                    </button>
                </div>
            </form>
        </div>
    );
}
