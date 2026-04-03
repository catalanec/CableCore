'use client';

import { useState } from 'react';
import { updateLeadPipelineStage, addActivity } from '@/app/actions/crm';

interface Lead {
    id: string;
    name: string;
    phone: string;
    email: string;
    service?: string;
    source?: string;
    estimated_value?: number;
    next_followup?: string;
    pipeline_stage?: string;
    status: string;
    notes?: string;
    created_at: string;
}

interface PipelineProps {
    leads: Lead[];
}

const STAGES = [
    { id: 'new', label: 'Nuevo', icon: '🆕', color: 'from-cyan-500/20 to-cyan-500/5', border: 'border-cyan-500/30', badge: 'bg-cyan-500/10 text-cyan-400' },
    { id: 'contacted', label: 'Contactado', icon: '📞', color: 'from-blue-500/20 to-blue-500/5', border: 'border-blue-500/30', badge: 'bg-blue-500/10 text-blue-400' },
    { id: 'qualified', label: 'Cualificado', icon: '⭐', color: 'from-indigo-500/20 to-indigo-500/5', border: 'border-indigo-500/30', badge: 'bg-indigo-500/10 text-indigo-400' },
    { id: 'proposal', label: 'Propuesta', icon: '📋', color: 'from-purple-500/20 to-purple-500/5', border: 'border-purple-500/30', badge: 'bg-purple-500/10 text-purple-400' },
    { id: 'won', label: 'Ganado', icon: '🏆', color: 'from-green-500/20 to-green-500/5', border: 'border-green-500/30', badge: 'bg-green-500/10 text-green-400' },
];

function isOverdue(dateStr?: string) {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date(new Date().toDateString());
}

export default function Pipeline({ leads: initialLeads }: PipelineProps) {
    const [leads, setLeads] = useState(initialLeads);
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [dragOverStage, setDragOverStage] = useState<string | null>(null);

    const getLeadsForStage = (stageId: string) =>
        leads.filter(l => (l.pipeline_stage || l.status) === stageId && l.status !== 'lost');

    const lostLeads = leads.filter(l => l.status === 'lost');

    const totalValue = leads
        .filter(l => l.status !== 'lost')
        .reduce((s, l) => s + (Number(l.estimated_value) || 0), 0);

    const handleDragStart = (e: React.DragEvent, leadId: string) => {
        setDraggedId(leadId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, stageId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverStage(stageId);
    };

    const handleDrop = async (e: React.DragEvent, targetStage: string) => {
        e.preventDefault();
        if (!draggedId) return;
        const lead = leads.find(l => l.id === draggedId);
        if (!lead || (lead.pipeline_stage || lead.status) === targetStage) {
            setDraggedId(null);
            setDragOverStage(null);
            return;
        }

        // Optimistic update
        setLeads(leads.map(l => l.id === draggedId
            ? { ...l, pipeline_stage: targetStage, status: targetStage }
            : l
        ));
        setDraggedId(null);
        setDragOverStage(null);

        await updateLeadPipelineStage(draggedId, targetStage);
    };

    const handleMoveNext = async (lead: Lead) => {
        const currentIdx = STAGES.findIndex(s => s.id === (lead.pipeline_stage || lead.status));
        if (currentIdx < STAGES.length - 1) {
            const nextStage = STAGES[currentIdx + 1].id;
            setLeads(leads.map(l => l.id === lead.id ? { ...l, pipeline_stage: nextStage, status: nextStage } : l));
            await updateLeadPipelineStage(lead.id, nextStage);
        }
    };

    const handleMarkLost = async (lead: Lead) => {
        setLeads(leads.map(l => l.id === lead.id ? { ...l, pipeline_stage: 'lost', status: 'lost' } : l));
        await updateLeadPipelineStage(lead.id, 'lost');
    };

    const handleQuickCall = async (lead: Lead) => {
        window.open(`tel:${lead.phone}`);
        await addActivity({
            type: 'call',
            description: `Llamada a ${lead.name} (${lead.phone})`,
            entity_type: 'lead',
            entity_id: lead.id,
        });
    };

    const handleQuickWhatsApp = async (lead: Lead) => {
        const msg = encodeURIComponent(`Hola ${lead.name.split(' ')[0]}, soy de CableCore. ¿Puedo ayudarte con tu instalación de red?`);
        window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${msg}`, '_blank');
        await addActivity({
            type: 'whatsapp',
            description: `Mensaje WhatsApp enviado a ${lead.name}`,
            entity_type: 'lead',
            entity_id: lead.id,
        });
    };

    return (
        <div className="space-y-4">
            {/* Pipeline summary */}
            <div className="flex items-center gap-4 text-sm text-brand-gold-muted flex-wrap">
                <span>🎯 Total pipeline: <span className="text-white font-bold">{leads.filter(l => l.status !== 'lost').length} leads</span></span>
                {totalValue > 0 && (
                    <span>💰 Valor estimado: <span className="text-brand-gold font-bold">{totalValue.toLocaleString('es-ES')}€</span></span>
                )}
                {lostLeads.length > 0 && (
                    <span className="text-red-400/70">✗ Perdidos: {lostLeads.length}</span>
                )}
            </div>

            {/* Kanban columns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 overflow-x-auto">
                {STAGES.map(stage => {
                    const stageLeads = getLeadsForStage(stage.id);
                    const stageValue = stageLeads.reduce((s, l) => s + (Number(l.estimated_value) || 0), 0);
                    const isDragTarget = dragOverStage === stage.id;

                    return (
                        <div
                            key={stage.id}
                            onDragOver={e => handleDragOver(e, stage.id)}
                            onDragLeave={() => setDragOverStage(null)}
                            onDrop={e => handleDrop(e, stage.id)}
                            className={`flex flex-col min-h-[300px] rounded-xl border bg-gradient-to-b transition-all ${stage.color} ${stage.border} ${isDragTarget ? 'ring-2 ring-brand-gold/50 scale-[1.01]' : ''}`}
                        >
                            {/* Column header */}
                            <div className="p-3 border-b border-white/5">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                                        {stage.icon} {stage.label}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${stage.badge}`}>
                                        {stageLeads.length}
                                    </span>
                                </div>
                                {stageValue > 0 && (
                                    <div className="text-[11px] text-brand-gold-muted">{stageValue.toLocaleString('es-ES')}€</div>
                                )}
                            </div>

                            {/* Cards */}
                            <div className="p-2 flex-1 space-y-2">
                                {stageLeads.map(lead => (
                                    <div
                                        key={lead.id}
                                        draggable
                                        onDragStart={e => handleDragStart(e, lead.id)}
                                        className={`bg-[#0f0f11] border border-border-subtle rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-brand-gold/20 transition-all group ${draggedId === lead.id ? 'opacity-40' : ''}`}
                                    >
                                        {/* Lead name + value */}
                                        <div className="flex items-start justify-between gap-1 mb-2">
                                            <div>
                                                <div className="text-sm font-medium text-white leading-tight">{lead.name}</div>
                                                {lead.service && (
                                                    <div className="text-[11px] text-brand-gold-muted mt-0.5">{lead.service}</div>
                                                )}
                                            </div>
                                            {lead.estimated_value ? (
                                                <span className="text-[11px] text-brand-gold font-bold whitespace-nowrap">
                                                    {Number(lead.estimated_value).toLocaleString('es-ES')}€
                                                </span>
                                            ) : null}
                                        </div>

                                        {/* Source badge */}
                                        {lead.source && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-brand-gold-muted">
                                                {lead.source}
                                            </span>
                                        )}

                                        {/* Followup */}
                                        {lead.next_followup && (
                                            <div className={`text-[10px] mt-1.5 flex items-center gap-1 ${isOverdue(lead.next_followup) ? 'text-red-400' : 'text-brand-gold-muted'}`}>
                                                ⏰ {isOverdue(lead.next_followup) ? '¡Vencido! ' : ''}{new Date(lead.next_followup).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                            </div>
                                        )}

                                        {/* Quick actions */}
                                        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleQuickCall(lead)}
                                                className="p-1 rounded text-green-400 hover:bg-green-400/10 transition-colors text-sm"
                                                title="Llamar"
                                            >📞</button>
                                            <button
                                                onClick={() => handleQuickWhatsApp(lead)}
                                                className="p-1 rounded text-emerald-400 hover:bg-emerald-400/10 transition-colors text-sm"
                                                title="WhatsApp"
                                            >💬</button>
                                            <a
                                                href={`mailto:${lead.email}`}
                                                className="p-1 rounded text-blue-400 hover:bg-blue-400/10 transition-colors text-sm"
                                                title="Email"
                                            >📧</a>
                                            {stage.id !== 'won' && (
                                                <button
                                                    onClick={() => handleMoveNext(lead)}
                                                    className="ml-auto p-1 rounded text-brand-gold-muted hover:text-brand-gold hover:bg-brand-gold/10 transition-colors text-[10px] font-bold"
                                                    title="Mover a siguiente etapa"
                                                >→</button>
                                            )}
                                            <button
                                                onClick={() => handleMarkLost(lead)}
                                                className="p-1 rounded text-red-400/50 hover:text-red-400 hover:bg-red-400/10 transition-colors text-[10px]"
                                                title="Marcar como perdido"
                                            >✕</button>
                                        </div>
                                    </div>
                                ))}

                                {/* Drop zone hint */}
                                {isDragTarget && stageLeads.length === 0 && (
                                    <div className="border-2 border-dashed border-brand-gold/30 rounded-lg p-4 text-center text-xs text-brand-gold/50">
                                        Soltar aquí
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Lost leads (collapsed) */}
            {lostLeads.length > 0 && (
                <details className="mt-4">
                    <summary className="text-xs text-red-400/70 cursor-pointer hover:text-red-400 transition-colors">
                        ✗ Leads perdidos ({lostLeads.length})
                    </summary>
                    <div className="mt-2 grid grid-cols-2 lg:grid-cols-4 gap-2">
                        {lostLeads.map(lead => (
                            <div key={lead.id} className="bg-surface-card border border-border-subtle rounded-lg p-3 opacity-60">
                                <div className="text-xs font-medium text-white">{lead.name}</div>
                                <div className="text-[10px] text-brand-gold-muted">{lead.service}</div>
                                <button
                                    onClick={async () => {
                                        setLeads(leads.map(l => l.id === lead.id ? { ...l, pipeline_stage: 'new', status: 'new' } : l));
                                        await updateLeadPipelineStage(lead.id, 'new');
                                    }}
                                    className="text-[10px] text-brand-gold hover:underline mt-1 block"
                                >
                                    Reactivar
                                </button>
                            </div>
                        ))}
                    </div>
                </details>
            )}
        </div>
    );
}
