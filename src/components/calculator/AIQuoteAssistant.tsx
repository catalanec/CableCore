'use client';

import { useState } from 'react';
import { parseQuoteMessage } from '@/lib/quote-parser';

const aiLabels: Record<string, Record<string, string>> = {
    es: {
        title: 'Presupuesto Inteligente',
        subtitle: 'Describe tu proyecto y autocompletaremos el calculador',
        placeholder: 'Ej: Necesito instalar 12 puntos de red Cat6A en una oficina con techo técnico, unos 200 metros de cable, con rack profesional y configuración de red.',
        analyze: '🤖 Analizar y Autocompletar',
        reset: 'Limpiar',
    },
    en: {
        title: 'Smart Quote',
        subtitle: 'Describe your project and we\'ll auto-fill the calculator',
        placeholder: 'E.g.: I need 12 Cat6A network points in an office with suspended ceiling, about 200 meters of cable, professional rack and network configuration.',
        analyze: '🤖 Analyze & Auto-fill',
        reset: 'Clear',
    },
    ru: {
        title: 'Умная смета',
        subtitle: 'Опишите проект — мы заполним калькулятор автоматически',
        placeholder: 'Напр: Нужно 12 сетевых точек Cat6A в офисе с подвесным потолком, примерно 200 метров кабеля, профессиональный шкаф и настройка сети.',
        analyze: '🤖 Анализировать и заполнить',
        reset: 'Очистить',
    },
};

interface AIQuoteAssistantProps {
    locale: string;
    onApply: (data: any) => void;
}

export default function AIQuoteAssistant({ locale, onApply }: AIQuoteAssistantProps) {
    const l = aiLabels[locale] || aiLabels.es;
    const [message, setMessage] = useState('');
    const [result, setResult] = useState<ReturnType<typeof parseQuoteMessage> | null>(null);

    const handleAnalyze = () => {
        if (!message.trim()) return;
        const parsed = parseQuoteMessage(message);
        setResult(parsed);
        onApply(parsed);
    };

    return (
        <div className="card p-6 border-brand-gold/20 mb-6">
            <div className="flex items-center gap-3 mb-1">
                <span className="text-xl">🤖</span>
                <h3 className="font-heading font-bold text-lg text-white">{l.title}</h3>
            </div>
            <p className="text-xs text-brand-gold-muted mb-4">{l.subtitle}</p>

            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-surface-card border border-border-subtle rounded-lg text-white placeholder-gray-500 focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 outline-none transition-all text-sm resize-none mb-3"
                placeholder={l.placeholder}
            />

            <div className="flex gap-3">
                <button
                    onClick={handleAnalyze}
                    disabled={!message.trim()}
                    className="btn-gold flex-1 justify-center py-3 text-sm disabled:opacity-40"
                >
                    {l.analyze}
                </button>
                {result && (
                    <button
                        onClick={() => { setMessage(''); setResult(null); }}
                        className="btn-outline px-4 py-3 text-sm"
                    >
                        {l.reset}
                    </button>
                )}
            </div>

            {result && (
                <div className={`mt-4 p-4 rounded-lg border ${result.confidence >= 50 ? 'bg-green-500/5 border-green-500/20' :
                        result.confidence >= 25 ? 'bg-yellow-500/5 border-yellow-500/20' :
                            'bg-red-500/5 border-red-500/20'
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`h-2 w-2 rounded-full ${result.confidence >= 50 ? 'bg-green-400' :
                                result.confidence >= 25 ? 'bg-yellow-400' :
                                    'bg-red-400'
                            }`} />
                        <span className="text-xs font-medium text-brand-gold-muted">
                            {result.confidence}% confianza
                        </span>
                    </div>
                    <p className="text-xs text-brand-gold-muted leading-relaxed">{result.summary}</p>
                </div>
            )}
        </div>
    );
}
