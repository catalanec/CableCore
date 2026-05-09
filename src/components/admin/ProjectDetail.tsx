'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProjectStatus, updateProjectInfo, updateProjectCosts, updateProjectPayment, addActivity , updateProjectLocations} from '@/app/actions/crm';
import ActivityFeed from './ActivityFeed';
import TaskManager from './TaskManager';

interface ProjectDetailProps {
    project: any;
    activities: any[];
    tasks: any[];
}

const STATUS_STYLES: Record<string, string> = {
    planned: 'bg-gray-400/10 text-gray-400 border-gray-400/20',
    in_progress: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    completed: 'bg-green-400/10 text-green-400 border-green-400/20',
    cancelled: 'bg-red-400/10 text-red-400 border-red-400/20',
};

const PAYMENT_STYLES: Record<string, string> = {
    pending: 'bg-yellow-400/10 text-yellow-400',
    paid: 'bg-green-400/10 text-green-400',
    partial: 'bg-blue-400/10 text-blue-400',
    overdue: 'bg-red-400/10 text-red-400',
};

export default function ProjectDetail({ project: initialProject, activities, tasks }: ProjectDetailProps) {
    const router = useRouter();
    const [project, setProject] = useState(initialProject);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({
        client_name: project.client_name || '',
        client_phone: project.client_phone || '',
        client_email: project.client_email || '',
        address: project.address || '',
        notes: project.notes || '',
        start_date: project.start_date || '',
        end_date: project.end_date || '',
    });
    const [costData, setCostData] = useState({
        actual_material_cost: String(project.actual_material_cost || 0),
        actual_labor_cost: String(project.actual_labor_cost || 0),
        actual_other_cost: String(project.actual_other_cost || 0),
    });
    const [saving, setSaving] = useState(false)
            const [locations, setLocations] = useState(project.locations || []);
        const [editingLoc, setEditingLoc] = useState<number | null>(null);
        const [newLoc, setNewLoc] = useState({ name: '', status: 'planned' });;

    const grossRevenue = Number(project.total_revenue) || 0;
    const baseRevenue = grossRevenue / 1.21;
    const ivaDeduction = grossRevenue - baseRevenue;

    const matCost = Number(costData.actual_material_cost) || 0;
    const laborAsProfitBase = Number(costData.actual_labor_cost) || 0; // This IS the gross profit
    const othCost = Number(costData.actual_other_cost) || 0;
    const totalBusinessCost = matCost + othCost; // Real expenses (pass-through to client)
    
    const grossProfit = laborAsProfitBase; // The user's actual money
    const irpfDeduction = grossProfit * 0.20; // 20% of labor
    const netProfit = grossProfit - irpfDeduction;
    
    const margin = baseRevenue > 0 ? ((netProfit / baseRevenue) * 100).toFixed(1) : '0';

    const handleSaveInfo = async () => {
        setSaving(true);
        await updateProjectInfo(project.id, editData);
        setProject({ ...project, ...editData });
        setEditMode(false);
        setSaving(false);
    };

    const handleSaveCosts = async () => {
        setSaving(true);
        const numericData = {
            actual_material_cost: Number(costData.actual_material_cost) || 0,
            actual_labor_cost: Number(costData.actual_labor_cost) || 0,
            actual_other_cost: Number(costData.actual_other_cost) || 0,
        };
        await updateProjectCosts(project.id, numericData);
        setProject({ ...project, ...numericData });
        setSaving(false);
    };

    const handleStatusChange = async (status: string) => {
        setProject({ ...project, status });
        await updateProjectStatus(project.id, status);
    };

    const handlePaymentChange = async (status: string) => {
        const date = status === 'paid' ? new Date().toISOString().split('T')[0] : null;
        setProject({ ...project, payment_status: status, payment_date: date });
        await updateProjectPayment(project.id, { payment_status: status, payment_date: date });

        if (status === 'paid') {
            await addActivity({
                type: 'payment',
                description: `Pago recibido — ${grossRevenue.toLocaleString('es-ES')}€`,
                entity_type: 'project',
                entity_id: project.id,
            });
        }
    };

    const inputClass = "w-full bg-brand-dark border border-border-subtle rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold/50 transition-all";

    return (
        <div className="space-y-6">
            {/* Breadcrumb + back */}
            <div className="flex items-center gap-3 text-sm text-brand-gold-muted">
                <button onClick={() => router.back()} className="hover:text-white transition-colors">
                    ← Volver al CRM
                </button>
                <span>/</span>
                <span className="text-white font-medium">{project.client_name}</span>
            </div>

            {/* Header card */}
            <div className="card p-6 border-brand-gold/15">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <h1 className="font-heading text-2xl font-bold text-white">{project.client_name}</h1>
                            <select
                                value={project.status || 'planned'}
                                onChange={e => handleStatusChange(e.target.value)}
                                className={`text-xs px-3 py-1 rounded-full border outline-none cursor-pointer ${STATUS_STYLES[project.status] || STATUS_STYLES.planned}`}
                            >
                                <option value="planned">Planificado</option>
                                <option value="in_progress">En progreso</option>
                                <option value="completed">Completado</option>
                                <option value="cancelled">Cancelado</option>
                            </select>
                            <select
                                value={project.payment_status || 'pending'}
                                onChange={e => handlePaymentChange(e.target.value)}
                                className={`text-xs px-3 py-1 rounded-full outline-none cursor-pointer ${PAYMENT_STYLES[project.payment_status] || PAYMENT_STYLES.pending}`}
                            >
                                <option value="pending">💳 Pendiente</option>
                                <option value="partial">💳 Parcial</option>
                                <option value="paid">✅ Pagado</option>
                                <option value="overdue">⛔ Vencido</option>
                            </select>
                        </div>
                        <div className="text-sm text-brand-gold-muted">
                            {project.cable_type && <span className="mr-3">📡 {project.cable_type}</span>}
                            {project.network_points && <span className="mr-3">🔌 {project.network_points} puntos</span>}
                            {project.address && <span>📍 {project.address}</span>}
                        </div>
                    </div>

                    {/* Quick contact actions */}
                    <div className="flex gap-2 shrink-0 flex-wrap">
                        {project.client_phone && (
                            <>
                                <a
                                    href={`tel:${project.client_phone}`}
                                    onClick={() => addActivity({ type: 'call', description: `Llamada a ${project.client_name}`, entity_type: 'project', entity_id: project.id })}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/20 transition-all"
                                >
                                    📞 Llamar
                                </a>
                                <a
                                    href={`https://wa.me/${project.client_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${project.client_name?.split(' ')[0]}, te contactamos desde CableCore sobre tu proyecto.`)}`}
                                    target="_blank"
                                    rel="noopener"
                                    onClick={() => addActivity({ type: 'whatsapp', description: `WhatsApp a ${project.client_name}`, entity_type: 'project', entity_id: project.id })}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/20 transition-all"
                                >
                                    💬 WhatsApp
                                </a>
                            </>
                        )}
                        {project.client_email && (
                            <a
                                href={`mailto:${project.client_email}`}
                                className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/20 transition-all"
                            >
                                📧 Email
                            </a>
                        )}
                        <button
                            onClick={() => setEditMode(!editMode)}
                            className="px-3 py-2 bg-brand-gold/10 border border-brand-gold/20 text-brand-gold rounded-lg text-sm hover:bg-brand-gold/20 transition-all"
                        >
                            ✏️ Editar
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit form */}
            {editMode && (
                <div className="card p-6 border-brand-gold/20 space-y-4">
                    <h3 className="font-semibold text-white">Editar información del cliente</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-brand-gold-muted mb-1">Nombre</label>
                            <input type="text" value={editData.client_name} onChange={e => setEditData({...editData, client_name: e.target.value})} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-xs text-brand-gold-muted mb-1">Teléfono</label>
                            <input type="tel" value={editData.client_phone} onChange={e => setEditData({...editData, client_phone: e.target.value})} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-xs text-brand-gold-muted mb-1">Email</label>
                            <input type="email" value={editData.client_email} onChange={e => setEditData({...editData, client_email: e.target.value})} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-xs text-brand-gold-muted mb-1">Dirección</label>
                            <input type="text" value={editData.address} onChange={e => setEditData({...editData, address: e.target.value})} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-xs text-brand-gold-muted mb-1">Fecha inicio</label>
                            <input type="date" value={editData.start_date} onChange={e => setEditData({...editData, start_date: e.target.value})} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-xs text-brand-gold-muted mb-1">Fecha fin</label>
                            <input type="date" value={editData.end_date} onChange={e => setEditData({...editData, end_date: e.target.value})} className={inputClass} />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs text-brand-gold-muted mb-1">Notas internas</label>
                            <textarea rows={3} value={editData.notes} onChange={e => setEditData({...editData, notes: e.target.value})} className={`${inputClass} resize-none`} />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleSaveInfo} disabled={saving} className="btn-gold px-4 py-2 text-sm disabled:opacity-50">
                            {saving ? 'Guardando...' : '✓ Guardar'}
                        </button>
                        <button onClick={() => setEditMode(false)} className="px-4 py-2 text-sm text-brand-gold-muted hover:text-white transition-colors">
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Financial + Tasks + Activity grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT: Financial */}
                <div className="space-y-4">
                    {/* Revenue card */}
                    <div className="card p-5 border-brand-gold/15">
                        <h3 className="font-semibold text-white mb-4 text-sm">💰 Finanzas</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-brand-gold-muted">Facturación (con IVA)</span>
                                <span className="text-lg font-bold text-brand-gold">{grossRevenue.toLocaleString('es-ES', {minimumFractionDigits: 2})}€</span>
                            </div>
                            <div className="flex justify-between items-center text-red-400/80">
                                <span className="text-xs">IVA (21%)</span>
                                <span className="text-xs font-bold">-{ivaDeduction.toLocaleString('es-ES', {minimumFractionDigits: 2})}€</span>
                            </div>
                            <div className="flex justify-between items-center text-white pb-2 border-b border-white/5">
                                <span className="text-xs">Facturación Base</span>
                                <span className="text-sm font-bold">{baseRevenue.toLocaleString('es-ES', {minimumFractionDigits: 2})}€</span>
                            </div>
                            <div className="flex justify-between items-center text-red-400/80 pt-2">
                                <span className="text-xs">Costes (Mat + Otros)</span>
                                <span className="text-xs font-bold">-{totalBusinessCost.toLocaleString('es-ES', {minimumFractionDigits: 2})}€</span>
                            </div>
                            <div className="flex justify-between items-center text-white pb-2 border-b border-white/5">
                                <span className="text-xs">Beneficio Bruto (Mano de obra)</span>
                                <span className="text-sm font-bold">{grossProfit.toLocaleString('es-ES', {minimumFractionDigits: 2})}€</span>
                            </div>
                            <div className="flex justify-between items-center text-red-400/80 pt-2">
                                <span className="text-xs">IRPF (20%)</span>
                                <span className="text-xs font-bold">-{irpfDeduction.toLocaleString('es-ES', {minimumFractionDigits: 2})}€</span>
                            </div>
                            <div className="border-t border-border-subtle mt-3 pt-3 flex justify-between items-center">
                                <span className="text-xs text-brand-gold-muted">Beneficio neto</span>
                                <span className={`text-sm font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString('es-ES', {minimumFractionDigits: 2})}€
                                    <span className="text-xs ml-1 font-normal opacity-70">({margin}%)</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Cost breakdown */}
                    <div className="card p-5 border-brand-gold/10">
                        <h3 className="font-semibold text-white mb-4 text-sm">📊 Desglose costes / ganancias</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-brand-gold-muted mb-1">Materiales (Coste real)</label>
                                <div className="flex gap-2 items-center">
                                    <input type="number" step="0.01" value={costData.actual_material_cost} onChange={e => setCostData({ ...costData, actual_material_cost: e.target.value })} className="flex-1 bg-brand-dark border border-border-subtle rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-brand-gold/50" />
                                    <span className="text-xs text-brand-gold-muted">€</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-brand-gold-muted mb-1">Tus Servicios (Mano de obra, Testeo, etc. - Base IRPF)</label>
                                <div className="flex gap-2 items-center">
                                    <input type="number" step="0.01" value={costData.actual_labor_cost} onChange={e => setCostData({ ...costData, actual_labor_cost: e.target.value })} className="flex-1 bg-brand-dark border border-border-subtle rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-brand-gold/50" />
                                    <span className="text-xs text-brand-gold-muted">€</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-brand-gold-muted mb-1">Otros (Coste real)</label>
                                <div className="flex gap-2 items-center">
                                    <input type="number" step="0.01" value={costData.actual_other_cost} onChange={e => setCostData({ ...costData, actual_other_cost: e.target.value })} className="flex-1 bg-brand-dark border border-border-subtle rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-brand-gold/50" />
                                    <span className="text-xs text-brand-gold-muted">€</span>
                                </div>
                            </div>
                            <button onClick={handleSaveCosts} disabled={saving} className="w-full btn-outline py-2 text-xs mt-1 disabled:opacity-50">
                                {saving ? 'Guardando...' : '✓ Actualizar costes'}
                            </button>
                        </div>
                    </div>

                    {/* Project dates */}
                    <div className="card p-5 border-brand-gold/10">
                        <h3 className="font-semibold text-white mb-3 text-sm">📅 Fechas</h3>
                        <div className="space-y-2 text-sm">
                            {project.start_date && (
                                <div className="flex justify-between">
                                    <span className="text-brand-gold-muted">Inicio</span>
                                    <span className="text-white">{new Date(project.start_date).toLocaleDateString('es-ES')}</span>
                                </div>
                            )}
                            {project.end_date && (
                                <div className="flex justify-between">
                                    <span className="text-brand-gold-muted">Fin</span>
                                    <span className="text-white">{new Date(project.end_date).toLocaleDateString('es-ES')}</span>
                                </div>
                            )}
                            {project.payment_date && (
                                <div className="flex justify-between">
                                    <span className="text-brand-gold-muted">Cobrado</span>
                                    <span className="text-green-400">{new Date(project.payment_date).toLocaleDateString('es-ES')}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-brand-gold-muted">Creado</span>
                                <span className="text-white">{new Date(project.created_at).toLocaleDateString('es-ES')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CENTER: Tasks */}
                <div className="card p-5 border-brand-gold/10">
                    <h3 className="font-semibold text-white mb-4 text-sm">✅ Tareas</h3>
                    <TaskManager
                        tasks={tasks}
                        entityType="project"
                        entityId={project.id}
                    />
                </div>

                {/* RIGHT: Activity feed */}
                <div className="card p-5 border-brand-gold/10">
                    <h3 className="font-semibold text-white mb-4 text-sm">📋 Actividad</h3>
                    <ActivityFeed
                        activities={activities}
                        entityType="project"
                        entityId={project.id}
                    />
                </div>
            </div>

            {/* Notes section */}
            {project.notes && (
                <div className="card p-5 border-brand-gold/10">
                    <h3 className="font-semibold text-white mb-3 text-sm">📝 Notas internas</h3>
                    <p className="text-sm text-brand-gold-muted leading-relaxed whitespace-pre-wrap">{project.notes}</p>
                </div>
            )}
        </div>
    );
}
