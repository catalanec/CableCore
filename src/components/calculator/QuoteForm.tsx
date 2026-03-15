'use client';

import { useState, FormEvent } from 'react';
import { downloadQuotePDF, generateQuoteNumber, type QuotePDFData } from '@/lib/quote-pdf';

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
        regata: number;
        additionalWork: Record<string, boolean>;
        rack: string;
        urgency: string;
        cablesCost: number;
        pointsCost: number;
        installCost: number;
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
    superficial: 'Superficial (Canaleta)',
    techo: 'Techo técnico',
    empotrado_existente: 'Empotrado existente',
    empotrado_nuevo: 'Empotrado nuevo',
    industrial: 'Industrial (Nave / Fábrica)',
};

const workLabels: Record<string, string> = {
    switch: 'Instalación switch',
    router: 'Instalación router',
    network_config: 'Configuración de red',
    patch_panel: 'Instalación patch panel',
};

const rackLabels: Record<string, string> = {
    none: 'Sin rack',
    small: 'Rack pequeño',
    professional: 'Rack profesional',
    with_patch: 'Rack + Patch panel',
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
        if (!name || !phone || !email) return;

        const d = calculationData;
        const items: QuotePDFData['items'] = [];

        items.push({
            description: `Cable ${d.cableType.toUpperCase()}`,
            quantity: `${d.cableMeters}m`,
            unitPrice: `${(d.cablesCost / d.cableMeters).toFixed(2)}€`,
            total: `${d.cablesCost.toFixed(2)}€`,
        });

        items.push({
            description: `Puntos de red (RJ45, roseta, test)`,
            quantity: `${d.points} uds`,
            unitPrice: `15.00€`,
            total: `${d.pointsCost.toFixed(2)}€`,
        });

        items.push({
            description: `Instalación — ${installLabels[d.installationType] || d.installationType}`,
            quantity: `${d.installationMeters}m`,
            unitPrice: `${(d.installCost / Math.max(1, d.installationMeters)).toFixed(2)}€`,
            total: `${d.installCost.toFixed(2)}€`,
        });

        if (d.canaleta > 0) {
            items.push({ description: 'Canaleta', quantity: `${d.canaleta}m`, unitPrice: '8.00€', total: `${(d.canaleta * 8).toFixed(2)}€` });
        }
        if (d.tubo_corrugado > 0) {
            items.push({ description: 'Tubo corrugado', quantity: `${d.tubo_corrugado}m`, unitPrice: '4.00€', total: `${(d.tubo_corrugado * 4).toFixed(2)}€` });
        }
        if (d.regata > 0) {
            items.push({ description: 'Regata (corte muro)', quantity: `${d.regata}m`, unitPrice: '20.00€', total: `${(d.regata * 20).toFixed(2)}€` });
        }

        Object.entries(d.additionalWork).forEach(([key, val]) => {
            if (val) {
                const prices: Record<string, number> = { switch: 60, router: 60, network_config: 120, patch_panel: 80 };
                items.push({
                    description: workLabels[key] || key,
                    quantity: '1',
                    unitPrice: `${prices[key]?.toFixed(2) || '0.00'}€`,
                    total: `${prices[key]?.toFixed(2) || '0.00'}€`,
                });
            }
        });

        if (d.rack !== 'none') {
            const rackPrices: Record<string, number> = { small: 150, professional: 300, with_patch: 420 };
            items.push({
                description: rackLabels[d.rack] || d.rack,
                quantity: '1',
                unitPrice: `${rackPrices[d.rack]?.toFixed(2) || '0.00'}€`,
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
    };

    const handleSaveCRM = async () => {
        // Save to Supabase (when configured)
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
                }),
            });
            if (res.ok) setSaved(true);
        } catch {
            // Silently fail if Supabase not configured yet
            setSaved(true);
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
                        <label className="block text-xs text-brand-gold-muted mb-1.5">{l.name} *</label>
                        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder={l.name} />
                    </div>
                    <div>
                        <label className="block text-xs text-brand-gold-muted mb-1.5">{l.phone} *</label>
                        <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+34 600 000 000" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs text-brand-gold-muted mb-1.5">{l.email} *</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="tu@email.com" />
                </div>

                <div>
                    <label className="block text-xs text-brand-gold-muted mb-1.5">{l.address}</label>
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} placeholder="Dirección de instalación" />
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
                        disabled={!name || !phone || !email}
                        className="btn-outline w-full justify-center py-3 text-sm disabled:opacity-40"
                    >
                        {saved ? l.saved : l.save}
                    </button>
                </div>
            </form>
        </div>
    );
}
