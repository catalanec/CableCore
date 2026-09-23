'use client';

import { useState, FormEvent } from 'react';
import { downloadQuotePDF, generateQuoteNumber, type QuotePDFData } from '@/lib/quote-pdf';
import { trackCalculatorQuoteRequest, trackLeadSubmit } from '@/lib/analytics';
import { mergeQuoteParts, type QuoteCalculationData } from '@/lib/quote-items';

interface QuoteFormProps {
    locale: string;
    /**
     * The Ethernet half and the fibre half. Whichever carry a cost go on the
     * quote — one, the other or both, in a single document with one total.
     */
    parts: Array<QuoteCalculationData | null | undefined>;
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

export default function QuoteForm({ locale, parts }: QuoteFormProps) {
    const { data: calculationData, items: quoteItems } = mergeQuoteParts(parts);
    const l = formLabels[locale] || formLabels.es;
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [website, setWebsite] = useState(''); // honeypot — must stay empty
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleDownloadPDF = (e: FormEvent) => {
        e.preventDefault();

        const d = calculationData;
        const items: QuotePDFData['items'] = quoteItems;

        const pdfData: QuotePDFData = {
            quoteNumber: generateQuoteNumber(),
            date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            client: { name, phone, email, address: address || undefined },
            items,
            subtotal: `${d.subtotal.toFixed(2)}€`,
            discountPercent: d.discountPercent && d.discountPercent > 0 ? d.discountPercent : undefined,
            discount: d.discount && d.discount > 0 ? `${d.discount.toFixed(2)}€` : undefined,
            urgencyMultiplier: d.urgencyMultiplier > 1 ? `×${d.urgencyMultiplier}` : undefined,
            iva: `${d.iva.toFixed(2)}€`,
            total: `${d.total.toFixed(2)}€`,
            notes: notes || undefined,
        };

        downloadQuotePDF(pdfData);

        // GA4: track quote download as conversion
        trackCalculatorQuoteRequest(d.calculatorType || 'ethernet', d.total);
    };

    const handleSaveCRM = async () => {
        if (saving || saved) return;
        setSaving(true);
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
                    website, // honeypot — API silently no-ops if this is filled
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
        } finally {
            setSaving(false);
        }
    };

    const inputClass = "w-full px-4 py-3 bg-surface-card border border-border-subtle rounded-lg text-white placeholder-gray-500 focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 outline-none transition-all text-sm";

    return (
        <div className="card p-6 border-brand-gold/20">
            <h3 className="font-heading font-bold text-lg text-white mb-5 flex items-center gap-2">
                📋 {l.title}
            </h3>

            <form onSubmit={handleDownloadPDF} className="space-y-4">
                {/* Honeypot — hidden from real users via CSS, bots that fill every field trip it */}
                <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off"
                    style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
                    aria-hidden="true" />
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
                        disabled={saving || saved}
                        className="btn-outline w-full justify-center py-3 text-sm disabled:opacity-60"
                    >
                        {saved ? l.saved : saving ? '...' : l.save}
                    </button>
                </div>
            </form>
        </div>
    );
}
