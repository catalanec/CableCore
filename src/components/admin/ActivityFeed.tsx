'use client';

import { useState } from 'react';
import { addActivity } from '@/app/actions/crm';

interface Activity {
    id: string;
    type: string;
    description: string;
    created_at: string;
    metadata?: Record<string, unknown>;
}

interface ActivityFeedProps {
    activities: Activity[];
    entityType: string;
    entityId: string;
    onAdd?: (activity: Activity) => void;
}

const ACTIVITY_ICONS: Record<string, string> = {
    call: '📞',
    email: '📧',
    whatsapp: '💬',
    note: '📝',
    status_change: '🔄',
    payment: '💰',
    meeting: '🤝',
    task: '✅',
};

const ACTIVITY_COLORS: Record<string, string> = {
    call: 'text-green-400 bg-green-400/10 border-green-400/20',
    email: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    whatsapp: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    note: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    status_change: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    payment: 'text-brand-gold bg-brand-gold/10 border-brand-gold/20',
    meeting: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
    task: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
};

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return `hace ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `hace ${days}d`;
    return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

export default function ActivityFeed({ activities: initialActivities, entityType, entityId, onAdd }: ActivityFeedProps) {
    const [activities, setActivities] = useState(initialActivities);
    const [showForm, setShowForm] = useState(false);
    const [type, setType] = useState('note');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        if (!description.trim()) return;
        setLoading(true);
        try {
            await addActivity({ type, description, entity_type: entityType, entity_id: entityId });
            const newAct: Activity = {
                id: Date.now().toString(),
                type,
                description,
                created_at: new Date().toISOString(),
            };
            setActivities([newAct, ...activities]);
            onAdd?.(newAct);
            setDescription('');
            setShowForm(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-3">
            {/* Add activity button */}
            {!showForm ? (
                <div className="flex flex-wrap gap-2">
                    {[
                        { type: 'call', label: '📞 Llamada' },
                        { type: 'email', label: '📧 Email' },
                        { type: 'whatsapp', label: '💬 WhatsApp' },
                        { type: 'meeting', label: '🤝 Reunión' },
                        { type: 'note', label: '📝 Nota' },
                    ].map(btn => (
                        <button
                            key={btn.type}
                            onClick={() => { setType(btn.type); setShowForm(true); }}
                            className="px-3 py-1.5 text-xs rounded-lg bg-surface-card border border-border-subtle text-brand-gold-muted hover:text-white hover:border-brand-gold/30 transition-all"
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            ) : (
                <div className="card p-4 border-brand-gold/20 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        {['call', 'email', 'whatsapp', 'meeting', 'note'].map(t => (
                            <button
                                key={t}
                                onClick={() => setType(t)}
                                className={`px-3 py-1 text-xs rounded-full border transition-all ${type === t
                                    ? 'bg-brand-gold/20 text-brand-gold border-brand-gold/40'
                                    : 'text-brand-gold-muted border-border-subtle hover:border-brand-gold/20'
                                }`}
                            >
                                {ACTIVITY_ICONS[t]} {t}
                            </button>
                        ))}
                    </div>
                    <textarea
                        autoFocus
                        rows={2}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder={`Descripción de la ${type}...`}
                        className="w-full bg-brand-dark border border-border-subtle rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold/50 resize-none"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleAdd}
                            disabled={loading || !description.trim()}
                            className="btn-gold px-4 py-1.5 text-xs disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button
                            onClick={() => { setShowForm(false); setDescription(''); }}
                            className="px-4 py-1.5 text-xs rounded-lg text-brand-gold-muted hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Activity timeline */}
            <div className="relative space-y-0">
                {activities.length === 0 && (
                    <div className="text-center py-8 text-brand-gold-muted text-sm">
                        No hay actividad registrada todavía
                    </div>
                )}
                {activities.map((act, i) => (
                    <div key={act.id} className="flex gap-3 group">
                        {/* Timeline line */}
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm shrink-0 ${ACTIVITY_COLORS[act.type] || ACTIVITY_COLORS.note}`}>
                                {ACTIVITY_ICONS[act.type] || '📋'}
                            </div>
                            {i < activities.length - 1 && (
                                <div className="w-px h-full min-h-[20px] bg-border-subtle mt-1" />
                            )}
                        </div>
                        {/* Content */}
                        <div className="pb-4 flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-semibold text-white capitalize">{act.type}</span>
                                <span className="text-xs text-brand-gold-muted">{timeAgo(act.created_at)}</span>
                            </div>
                            <p className="text-sm text-brand-gold-muted leading-relaxed">{act.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
