'use client';

import { useState, useMemo, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { updateLeadStatus, updateQuoteStatus, updateMaterialStock, deleteLead, deleteQuote, updateLeadNotes, updateQuoteNotes, addMaterial, deleteMaterial, updateMaterial, updateProjectCosts, updateProjectPayment, seedMaterials, sendLowStockAlerts, exportMaterialsCSV, exportProjectsCSV, getAllTasks } from '@/app/actions/crm';
import { downloadQuotePDF, type QuotePDFData } from '@/lib/quote-pdf';
import { downloadInvoicePDF, type InvoicePDFData } from '@/lib/invoice-pdf';
import Pipeline from './Pipeline';
import TaskManager from './TaskManager';

interface AdminDashboardProps {
    initialQuotes: any[];
    initialLeads: any[];
    initialMaterials: any[];
    initialProjects: any[];
    initialTasks?: any[];
}

/* Tab types */
type Tab = 'overview' | 'quotes' | 'leads' | 'pipeline' | 'materials' | 'projects' | 'tasks';

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-400/10 text-yellow-400',
    sent: 'bg-blue-400/10 text-blue-400',
    accepted: 'bg-green-400/10 text-green-400',
    rejected: 'bg-red-400/10 text-red-400',
    completed: 'bg-emerald-400/10 text-emerald-400',
    new: 'bg-cyan-400/10 text-cyan-400',
    contacted: 'bg-blue-400/10 text-blue-400',
    qualified: 'bg-indigo-400/10 text-indigo-400',
    proposal: 'bg-purple-400/10 text-purple-400',
    won: 'bg-green-400/10 text-green-400',
    lost: 'bg-red-400/10 text-red-400',
    planned: 'bg-gray-400/10 text-gray-400',
    in_progress: 'bg-amber-400/10 text-amber-400',
};

export default function AdminDashboard({ initialQuotes, initialLeads, initialMaterials, initialProjects, initialTasks = [] }: AdminDashboardProps) {
    const locale = useLocale();
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedQuote, setSelectedQuote] = useState<any>(null);
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [showAddMaterial, setShowAddMaterial] = useState(false);
    const [editMaterial, setEditMaterial] = useState<any>(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [isFacturando, setIsFacturando] = useState(false);
    const [invoiceData, setInvoiceData] = useState({ razonSocial: '', cif: '', address: '', email: '', phone: '' });
    const [invoiceItems, setInvoiceItems] = useState<Array<{description: string; quantity: string; unitPrice: string}>>([]);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [chartPeriod, setChartPeriod] = useState(6);
    const [newMat, setNewMat] = useState({ name: '', category: 'cable', unit: 'm', cost_price: 0, sell_price: 0, stock: 0, min_stock: 5 });

    // CSV export helper
    const downloadCSV = (csv: string, filename: string) => {
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };
    
    // Convert to local states to allow optimistic UI updates (but server actions will revalidate props too)
    const [quotes, setQuotes] = useState(initialQuotes);
    const [leads, setLeads] = useState(initialLeads);
    const [materials, setMaterials] = useState(initialMaterials);
    const [projects, setProjects] = useState(initialProjects);

    // Keep it synced with incoming props from server via revalidatePath
    useEffect(() => {
        setQuotes(initialQuotes);
        setLeads(initialLeads);
        setMaterials(initialMaterials);
        setProjects(initialProjects);
    }, [initialQuotes, initialLeads, initialMaterials, initialProjects]);

    const filteredQuotes = useMemo(() => quotes.filter(q => 
        (q.client_name || q.client || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (q.client_email || q.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.id || '').toLowerCase().includes(searchTerm.toLowerCase())
    ), [quotes, searchTerm]);

    const filteredLeads = useMemo(() => leads.filter(l => 
        (l.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.phone || '').toLowerCase().includes(searchTerm.toLowerCase())
    ), [leads, searchTerm]);

    // ──────── Analytics data ────────
    const analytics = useMemo(() => {
        // Revenue from completed projects
        const projectRevenue = projects.filter(p => p.status === 'completed').reduce((s, p) => s + (Number(p.total_revenue) || 0), 0);
        const projectCost = projects.filter(p => p.status === 'completed').reduce((s, p) => s + (Number(p.total_cost) || 0), 0);
        // Fallback: if no projects, use completed quotes
        const quoteRevenue = quotes.filter(q => q.status === 'completed').reduce((s, q) => s + (Number(q.total) || 0), 0);
        const quoteCost = quotes.filter(q => q.status === 'completed').reduce((s, q) => s + (Number(q.materials_cost) || 0) + (Number(q.work_cost) || 0) + (Number(q.cable_cost) || 0), 0);
        const totalRevenue = projectRevenue > 0 ? projectRevenue : quoteRevenue;
        const totalCost = projectCost > 0 ? projectCost : quoteCost;
        const totalProfit = totalRevenue - totalCost;
        const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0';
        const totalQuotes = quotes.length;
        const pendingQuotes = quotes.filter(q => q.status === 'pending' || q.status === 'sent').length;
        const completedProjects = projects.filter(p => p.status === 'completed').length || quotes.filter(q => q.status === 'completed').length;
        const newLeads = leads.filter(l => l.status === 'new').length;
        const conversionRate = leads.length > 0 ? ((leads.filter(l => l.status === 'won').length / leads.length) * 100).toFixed(0) : '0';
        const lowStock = materials.filter(m => m.stock <= m.min_stock).length;
        const avgQuoteValue = quotes.length > 0 ? (quotes.reduce((s, q) => s + (Number(q.total) || 0), 0) / quotes.length) : 0;
        
        // Monthly revenue for current month
        const now = new Date();
        const currentMonthRevenue = quotes
            .filter(q => q.status === 'completed' && new Date(q.created_at).getMonth() === now.getMonth() && new Date(q.created_at).getFullYear() === now.getFullYear())
            .reduce((s, q) => s + (Number(q.total) || 0), 0);
        
        return { totalRevenue, totalCost, totalProfit, profitMargin, totalQuotes, pendingQuotes, completedProjects, newLeads, conversionRate, lowStock, avgQuoteValue, currentMonthRevenue };
    }, [quotes, leads, projects, materials]);

    // Monthly revenue for chart (dynamic based on chartPeriod)
    const monthlyData = useMemo(() => {
        const months: { month: string, monthIdx: number, year: number, revenue: number, cost: number }[] = [];
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const now = new Date();
        for (let i = chartPeriod - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({ month: monthNames[d.getMonth()], monthIdx: d.getMonth(), year: d.getFullYear(), revenue: 0, cost: 0 });
        }
        // Use projects — prefer payment_date for paid projects
        projects.forEach(p => {
            if (p.status !== 'completed') return;
            const dateStr = (p.payment_status === 'paid' && p.payment_date) ? p.payment_date : (p.created_at || p.date || new Date());
            const pd = new Date(dateStr);
            const entry = months.find(m => m.monthIdx === pd.getMonth() && m.year === pd.getFullYear());
            if (entry) {
                entry.revenue += (Number(p.total_revenue) || 0);
                entry.cost += (Number(p.actual_material_cost) || 0) + (Number(p.actual_labor_cost) || 0) + (Number(p.actual_other_cost) || 0) || (Number(p.total_cost) || 0);
            }
        });
        // Fallback: also add completed quotes if projects are empty
        const hasProjectData = months.some(m => m.revenue > 0);
        if (!hasProjectData) {
            quotes.forEach(q => {
                if (q.status !== 'completed') return;
                const qd = new Date(q.created_at || new Date());
                const entry = months.find(m => m.monthIdx === qd.getMonth() && m.year === qd.getFullYear());
                if (entry) {
                    entry.revenue += (Number(q.total) || 0);
                    entry.cost += (Number(q.materials_cost) || 0) + (Number(q.work_cost) || 0) + (Number(q.cable_cost) || 0);
                }
            });
        }
        return months;
    }, [projects, quotes, chartPeriod]);
    const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1000);

    const tabs: { id: Tab; label: string; icon: string }[] = [
        { id: 'overview', label: 'Panel', icon: '📊' },
        { id: 'pipeline', label: 'Pipeline', icon: '🎯' },
        { id: 'tasks', label: 'Tareas', icon: '✅' },
        { id: 'leads', label: 'Leads', icon: '👥' },
        { id: 'quotes', label: 'Presupuestos', icon: '📋' },
        { id: 'materials', label: 'Materiales', icon: '📦' },
        { id: 'projects', label: 'Proyectos', icon: '🏗️' },
    ];

    return (
        <div>
            {/* Top Bar: Tabs & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex flex-wrap gap-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-[rgba(201,168,76,0.15)] text-brand-gold border border-brand-gold/30'
                                    : 'bg-surface-card text-brand-gold-muted border border-border-subtle hover:border-brand-gold/20'
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full md:w-72">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gold-muted text-sm">🔍</span>
                    <input 
                        type="search" 
                        placeholder="Buscar cliente, email o teléfono..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-surface-card border border-border-subtle rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-brand-gold/50 transition-colors"
                    />
                </div>
            </div>

            {/* ═══════ OVERVIEW ═══════ */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Ingresos (mes)', value: `${analytics.currentMonthRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€`, icon: '💰', trend: `${analytics.totalRevenue > 0 ? '+' + ((analytics.currentMonthRevenue / analytics.totalRevenue) * 100).toFixed(0) + '%' : '—'}`, color: 'text-green-400' },
                            { label: 'Beneficio neto', value: `${analytics.totalProfit.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€`, icon: '📈', trend: `${analytics.profitMargin}% margen`, color: 'text-emerald-400' },
                            { label: 'Presupuestos', value: analytics.totalQuotes.toString(), icon: '📋', trend: `${analytics.pendingQuotes} pendientes`, color: 'text-yellow-400' },
                            { label: 'Leads nuevos', value: analytics.newLeads.toString(), icon: '👥', trend: `${analytics.conversionRate}% conversión`, color: 'text-cyan-400' },
                        ].map((kpi, i) => (
                            <div key={i} className="card p-5 border-brand-gold/10">
                                <div className="flex items-start justify-between mb-3">
                                    <span className="text-2xl">{kpi.icon}</span>
                                    <span className={`text-xs font-medium ${kpi.color}`}>{kpi.trend}</span>
                                </div>
                                <div className="font-heading text-2xl font-bold text-white mb-1">{kpi.value}</div>
                                <div className="text-xs text-brand-gold-muted">{kpi.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Revenue Chart */}
                    <div className="card p-6 border-brand-gold/10">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-heading font-semibold text-white flex items-center gap-2">
                                📊 Ingresos vs Costes
                            </h3>
                            <div className="flex gap-1">
                                {[{ label: '3m', val: 3 }, { label: '6m', val: 6 }, { label: '1a', val: 12 }, { label: 'Todo', val: 24 }].map(p => (
                                    <button key={p.val} onClick={() => setChartPeriod(p.val)}
                                        className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${chartPeriod === p.val ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/30' : 'text-brand-gold-muted hover:text-white'}`}
                                    >{p.label}</button>
                                ))}
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                        <div className={`flex items-end h-48 ${chartPeriod > 12 ? 'gap-1' : chartPeriod > 6 ? 'gap-2' : 'gap-4'}`} style={{ minWidth: chartPeriod > 12 ? `${chartPeriod * 50}px` : undefined }}>
                            {monthlyData.map((d, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1" style={{ minWidth: chartPeriod > 12 ? '40px' : undefined }}>
                                    {d.revenue > 0 && (
                                        <div className="text-[10px] text-brand-gold font-bold mb-1 whitespace-nowrap">
                                            {d.revenue >= 1000 ? `${(d.revenue / 1000).toFixed(1)}k` : d.revenue.toFixed(0)}€
                                        </div>
                                    )}
                                    <div className="w-full flex gap-1 justify-center items-end" style={{ height: '140px' }}>
                                        <div
                                            className={`${chartPeriod > 12 ? 'w-3' : 'w-5'} bg-gradient-to-t from-[#c9a84c] to-[#e8d48b] rounded-t-sm transition-all`}
                                            style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, d.revenue > 0 ? 5 : 0)}%` }}
                                            title={`Ingresos: ${d.revenue.toFixed(2)}€`}
                                        />
                                        <div
                                            className={`${chartPeriod > 12 ? 'w-3' : 'w-5'} bg-gradient-to-t from-[#444] to-[#666] rounded-t-sm transition-all`}
                                            style={{ height: `${Math.max((d.cost / maxRevenue) * 100, d.cost > 0 ? 5 : 0)}%` }}
                                            title={`Costes: ${d.cost.toFixed(2)}€`}
                                        />
                                    </div>
                                    <span className={`text-brand-gold-muted whitespace-nowrap ${chartPeriod > 12 ? 'text-[9px]' : 'text-xs'}`}>{d.month}{chartPeriod > 12 ? `'${String(d.year).slice(-2)}` : ''}</span>
                                </div>
                            ))}
                        </div>
                        </div>
                        <div className="flex justify-center gap-6 mt-4">
                            <div className="flex items-center gap-2 text-xs text-brand-gold-muted">
                                <div className="w-3 h-3 rounded-sm bg-gradient-to-t from-[#c9a84c] to-[#e8d48b]" /> Ingresos
                            </div>
                            <div className="flex items-center gap-2 text-xs text-brand-gold-muted">
                                <div className="w-3 h-3 rounded-sm bg-gradient-to-t from-[#444] to-[#666]" /> Costes
                            </div>
                        </div>
                    </div>

                    {/* Bottom row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent quotes */}
                        <div className="card p-6 border-brand-gold/10">
                            <h3 className="font-heading font-semibold text-white mb-4">📋 Últimos presupuestos</h3>
                            <div className="space-y-3">
                                {quotes.slice(0, 4).map(q => (
                                    <div key={q.id} className="flex items-center justify-between p-3 rounded-lg bg-brand-dark/50">
                                        <div>
                                            <div className="text-sm font-medium text-white">{q.client_name || q.client}</div>
                                            <div className="text-xs text-brand-gold-muted">{q.id.split('-').pop()} · {q.network_points || q.points} puntos · {q.cable_type || q.cable}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-brand-gold">{Number(q.total).toFixed(2)}€</div>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[q.status]}`}>{q.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Stock alerts */}
                        <div className="card p-6 border-brand-gold/10">
                            <h3 className="font-heading font-semibold text-white mb-4">⚠️ Alertas de stock</h3>
                            <div className="space-y-3">
                                {materials.filter(m => m.stock <= (m.min_stock || m.minStock) * 1.5).map(m => (
                                    <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-brand-dark/50">
                                        <div>
                                            <div className="text-sm font-medium text-white">{m.name}</div>
                                            <div className="text-xs text-brand-gold-muted">{m.category}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-sm font-bold ${m.stock <= (m.min_stock || m.minStock) ? 'text-red-400' : 'text-yellow-400'}`}>
                                                {m.stock} {m.unit}s
                                            </div>
                                            <div className="text-xs text-brand-gold-muted">Mín: {m.min_stock || m.minStock}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════ PIPELINE ═══════ */}
            {activeTab === 'pipeline' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-heading font-semibold text-white">🎯 Pipeline de ventas</h3>
                        <span className="text-xs text-brand-gold-muted">Arrastra las tarjetas entre columnas</span>
                    </div>
                    <Pipeline leads={leads} />
                </div>
            )}

            {/* ═══════ TASKS ═══════ */}
            {activeTab === 'tasks' && (
                <div className="card p-6 border-brand-gold/10">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-heading font-semibold text-white">✅ Todas las tareas</h3>
                        <div className="text-xs text-brand-gold-muted">
                            {initialTasks.filter((t: any) => t.status !== 'done').length} pendientes
                        </div>
                    </div>
                    <TaskManager tasks={initialTasks} />
                </div>
            )}

            {/* ═══════ QUOTES ═══════ */}
            {activeTab === 'quotes' && (
                <div className="card border-brand-gold/10 overflow-hidden">
                    <div className="p-6 border-b border-border-subtle flex items-center justify-between">
                        <h3 className="font-heading font-semibold text-white">Presupuestos</h3>
                        <div className="flex items-center gap-3 text-xs text-brand-gold-muted">
                            <span>Total: {quotes.length}</span>
                            <span>Valor medio: {analytics.avgQuoteValue.toFixed(2)}€</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border-subtle text-brand-gold-muted text-xs uppercase tracking-wider">
                                    <th className="text-left p-4">N°</th>
                                    <th className="text-left p-4">Cliente</th>
                                    <th className="text-left p-4">Cable</th>
                                    <th className="text-center p-4">Puntos</th>
                                    <th className="text-center p-4">Metros</th>
                                    <th className="text-right p-4">Total</th>
                                    <th className="text-center p-4">Estado</th>
                                    <th className="text-right p-4">Fecha</th>
                                    <th className="text-center p-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredQuotes.map(q => (
                                    <tr key={q.id} className="border-b border-border-subtle/50 hover:bg-[rgba(201,168,76,0.03)] transition-colors">
                                        <td className="p-4 text-brand-gold font-mono text-xs">{q.id.slice(0,8)}...</td>
                                        <td className="p-4">
                                            <div className="font-medium text-white">{q.client_name || q.client}</div>
                                            <div className="text-xs text-brand-gold-muted">{q.client_email || q.email}</div>
                                        </td>
                                        <td className="p-4 text-brand-gold-muted">{q.cable_type || q.cable}</td>
                                        <td className="p-4 text-center text-brand-gold-muted">{q.network_points || q.points}</td>
                                        <td className="p-4 text-center text-brand-gold-muted">{q.installation_meters || q.meters}m</td>
                                        <td className="p-4 text-right font-bold text-brand-gold">{Number(q.total).toFixed(2)}€</td>
                                        <td className="p-4 text-center">
                                            <select 
                                                className={`text-xs px-2 py-1 rounded-full outline-none cursor-pointer appearance-none ${STATUS_COLORS[q.status]}`}
                                                value={q.status}
                                                onChange={async (e) => {
                                                    const newStatus = e.target.value;
                                                    setQuotes(quotes.map(x => x.id === q.id ? { ...x, status: newStatus } : x));
                                                    await updateQuoteStatus(q.id, newStatus);
                                                }}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="sent">Sent</option>
                                                <option value="accepted">Accepted</option>
                                                <option value="rejected">Rejected</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </td>
                                        <td className="p-4 text-right text-brand-gold-muted text-xs">{new Date(q.created_at || q.date).toLocaleDateString()}</td>
                                        <td className="p-4 text-center">
                                            <div className="flex gap-2 justify-center">
                                                <button onClick={() => setSelectedQuote(q)} className="text-blue-400 hover:text-blue-300 transition-colors uppercase text-[10px] tracking-wider font-bold">Ver</button>
                                                <button onClick={async () => {
                                                    if(confirm('¿Eliminar presupuesto permanentemente?')) {
                                                        await deleteQuote(q.id);
                                                        setQuotes(quotes.filter(x => x.id !== q.id));
                                                    }
                                                }} className="text-red-400 hover:text-red-300 transition-colors uppercase text-[10px] tracking-wider font-bold">Del</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ═══════ LEADS ═══════ */}
            {activeTab === 'leads' && (
                <div className="space-y-6">
                    {/* Lead pipeline */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                        {['new', 'contacted', 'qualified', 'proposal', 'won'].map(status => {
                            const count = leads.filter(l => l.status === status).length;
                            return (
                                <div key={status} className="card p-4 border-brand-gold/10 text-center">
                                    <div className="font-heading text-2xl font-bold text-white mb-1">{count}</div>
                                    <span className={`text-xs px-3 py-1 rounded-full ${STATUS_COLORS[status]}`}>{status}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Leads table */}
                    <div className="card border-brand-gold/10 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border-subtle text-brand-gold-muted text-xs uppercase tracking-wider">
                                        <th className="text-left p-4">Nombre</th>
                                        <th className="text-left p-4">Contacto</th>
                                        <th className="text-left p-4">Servicio</th>
                                        <th className="text-center p-4">Fuente</th>
                                        <th className="text-center p-4">Estado</th>
                                        <th className="text-right p-4">Fecha</th>
                                        <th className="text-center p-4">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLeads.map(lead => (
                                        <tr key={lead.id} className="border-b border-border-subtle/50 hover:bg-[rgba(201,168,76,0.03)] transition-colors">
                                            <td className="p-4 font-medium text-white">{lead.name}</td>
                                            <td className="p-4">
                                                <div className="text-xs text-brand-gold-muted">{lead.phone}</div>
                                                <div className="text-xs text-brand-gold-muted">{lead.email}</div>
                                            </td>
                                            <td className="p-4 text-brand-gold-muted text-xs">{lead.service}</td>
                                            <td className="p-4 text-center">
                                                <span className="text-xs text-brand-gold-muted bg-surface-card px-2 py-1 rounded">{lead.source}</span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <select 
                                                    className={`text-xs px-2 py-1 rounded-full outline-none cursor-pointer appearance-none ${STATUS_COLORS[lead.status]}`}
                                                    value={lead.status}
                                                    onChange={async (e) => {
                                                        const newStatus = e.target.value;
                                                        setLeads(leads.map(x => x.id === lead.id ? { ...x, status: newStatus } : x));
                                                        await updateLeadStatus(lead.id, newStatus);
                                                    }}
                                                >
                                                    <option value="new">New</option>
                                                    <option value="contacted">Contacted</option>
                                                    <option value="qualified">Qualified</option>
                                                    <option value="proposal">Proposal</option>
                                                    <option value="won">Won</option>
                                                    <option value="lost">Lost</option>
                                                </select>
                                            </td>
                                            <td className="p-4 text-right text-brand-gold-muted text-xs">{new Date(lead.created_at || lead.date).toLocaleDateString()}</td>
                                            <td className="p-4 text-center">
                                                <div className="flex gap-2 justify-center">
                                                    <button onClick={() => setSelectedLead(lead)} className="text-blue-400 hover:text-blue-300 transition-colors uppercase text-[10px] tracking-wider font-bold">Ver</button>
                                                    <button onClick={async () => {
                                                        if(confirm('¿Eliminar lead permanentemente?')) {
                                                            await deleteLead(lead.id);
                                                            setLeads(leads.filter(x => x.id !== lead.id));
                                                        }
                                                    }} className="text-red-400 hover:text-red-300 transition-colors uppercase text-[10px] tracking-wider font-bold">Del</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════ MATERIALS ═══════ */}
            {activeTab === 'materials' && (
                <div className="space-y-6">
                    {/* Summary cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="card p-5 border-brand-gold/10">
                            <div className="text-2xl mb-2">📦</div>
                            <div className="font-heading text-2xl font-bold text-white">{materials.length}</div>
                            <div className="text-xs text-brand-gold-muted">Productos</div>
                        </div>
                        <div className="card p-5 border-brand-gold/10">
                            <div className="text-2xl mb-2">💰</div>
                            <div className="font-heading text-2xl font-bold text-white">
                                {materials.reduce((s, m) => s + m.stock * (Number(m.cost_price) || 0), 0).toFixed(0)}€
                            </div>
                            <div className="text-xs text-brand-gold-muted">Valor inventario (coste)</div>
                        </div>
                        <div className="card p-5 border-brand-gold/10">
                            <div className="text-2xl mb-2">📊</div>
                            <div className="font-heading text-2xl font-bold text-white">
                                {materials.length > 0 && materials.reduce((s, m) => s + (Number(m.sell_price) || 0), 0) > 0
                                    ? ((1 - materials.reduce((s, m) => s + (Number(m.cost_price) || 0), 0) / materials.reduce((s, m) => s + (Number(m.sell_price) || 0), 0)) * 100).toFixed(0)
                                    : '0'}%
                            </div>
                            <div className="text-xs text-brand-gold-muted">Margen medio</div>
                        </div>
                        <div className="card p-5 border-brand-gold/10">
                            <div className="text-2xl mb-2">⚠️</div>
                            <div className={`font-heading text-2xl font-bold ${analytics.lowStock > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                {analytics.lowStock}
                            </div>
                            <div className="text-xs text-brand-gold-muted">Stock bajo</div>
                        </div>
                    </div>

                    {/* Materials table */}
                    <div className="card border-brand-gold/10 overflow-hidden">
                        <div className="p-4 border-b border-border-subtle flex flex-wrap items-center justify-between gap-3">
                            <h3 className="font-heading font-semibold text-white">Inventario de Materiales</h3>
                            <div className="flex items-center gap-2">
                                <select
                                    value={categoryFilter}
                                    onChange={e => setCategoryFilter(e.target.value)}
                                    className="bg-surface-card border border-border-subtle rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold/50"
                                >
                                    <option value="all">Todas las categorías</option>
                                    <option value="cable">🔌 Cable Ethernet</option>
                                    <option value="conector">🔗 Conectores Ethernet</option>
                                    <option value="fibra">🔆 Fibra óptica</option>
                                    <option value="conector_fibra">💎 Conectores fibra</option>
                                    <option value="rack_fibra">📡 Racks fibra</option>
                                    <option value="rack">🗄️ Racks Ethernet</option>
                                    <option value="canaleta">📏 Canaleta</option>
                                    <option value="tubo">🔧 Tubo</option>
                                    <option value="herramienta">🛠️ Herramientas</option>
                                    <option value="otro">📦 Otro</option>
                                </select>
                                {materials.length === 0 && (
                                    <button
                                        onClick={async () => {
                                            if (confirm('¿Cargar 27 materiales iniciales (Ethernet + Fibra)?')) {
                                                const result = await seedMaterials();
                                                if (result.success) {
                                                    alert(`✅ ${result.count} materiales cargados. Recargando...`);
                                                    window.location.reload();
                                                } else {
                                                    alert('❌ Error: ' + result.error);
                                                }
                                            }
                                        }}
                                        className="px-3 py-2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-bold hover:bg-cyan-500/30 transition-colors"
                                    >
                                        🌱 Cargar Inventario Inicial
                                    </button>
                                )}
                                <button
                                    onClick={async () => {
                                        const result = await exportMaterialsCSV();
                                        if (result.success && result.csv) {
                                            downloadCSV(result.csv, `materiales_cablecore_${new Date().toISOString().split('T')[0]}.csv`);
                                        } else {
                                            alert('❌ Error exportando: ' + (result.error || 'sin datos'));
                                        }
                                    }}
                                    className="px-3 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold hover:bg-emerald-500/30 transition-colors"
                                >
                                    📥 CSV
                                </button>
                                <button
                                    onClick={async () => {
                                        const result = await sendLowStockAlerts();
                                        if (result.success) {
                                            alert((result.sent ?? 0) > 0 ? `✅ Alerta enviada via Telegram (${result.sent ?? 0} productos)` : '✅ Sin productos con stock bajo');
                                        } else {
                                            alert('❌ Error: ' + result.error);
                                        }
                                    }}
                                    className="px-3 py-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-bold hover:bg-blue-500/30 transition-colors"
                                >
                                    📲 Alertas
                                </button>
                                <button
                                    onClick={() => setShowAddMaterial(true)}
                                    className="px-4 py-2 bg-brand-gold text-black rounded-lg text-sm font-bold hover:bg-brand-gold/90 transition-colors"
                                >
                                    + Añadir Material
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border-subtle text-brand-gold-muted text-xs uppercase tracking-wider">
                                        <th className="text-left p-4">Material</th>
                                        <th className="text-left p-4">Categoría</th>
                                        <th className="text-right p-4">Coste</th>
                                        <th className="text-right p-4">Venta</th>
                                        <th className="text-right p-4">Margen</th>
                                        <th className="text-right p-4">Stock</th>
                                        <th className="text-center p-4">Estado</th>
                                        <th className="text-center p-4">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {materials.filter(m => categoryFilter === 'all' || m.category === categoryFilter).length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="p-8 text-center text-brand-gold-muted">
                                                <div className="text-4xl mb-3">📦</div>
                                                <div className="text-sm">{materials.length === 0 ? 'No hay materiales todavía' : 'No hay materiales en esta categoría'}</div>
                                                <div className="text-xs mt-1">{materials.length === 0 ? 'Usa «🌱 Cargar Inventario Inicial» o «+ Añadir Material»' : 'Cambia el filtro de categoría'}</div>
                                            </td>
                                        </tr>
                                    )}
                                    {materials.filter(m => categoryFilter === 'all' || m.category === categoryFilter).map(m => {
                                        const costPrice = Number(m.cost_price) || 0;
                                        const sellPrice = Number(m.sell_price) || 0;
                                        const minStock = m.min_stock || 0;
                                        const margin = sellPrice > 0 ? (((sellPrice - costPrice) / sellPrice) * 100).toFixed(0) : '0';
                                        const isLow = m.stock <= minStock;
                                        const isWarn = m.stock <= minStock * 1.5;
                                        return (
                                            <tr key={m.id} className="border-b border-border-subtle/50 hover:bg-[rgba(201,168,76,0.03)] transition-colors">
                                                <td className="p-4 font-medium text-white">{m.name}</td>
                                                <td className="p-4 text-brand-gold-muted text-xs">
                                                    <span className="bg-surface-card px-2 py-1 rounded">{m.category}</span>
                                                </td>
                                                <td className="p-4 text-right text-brand-gold-muted">{costPrice.toFixed(2)}€/{m.unit}</td>
                                                <td className="p-4 text-right text-white">{sellPrice.toFixed(2)}€/{m.unit}</td>
                                                <td className="p-4 text-right text-green-400">{margin}%</td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end items-center gap-2">
                                                        <button onClick={async () => {
                                                            const newVal = Math.max(0, m.stock - 1);
                                                            setMaterials(materials.map(x => x.id === m.id ? { ...x, stock: newVal } : x));
                                                            await updateMaterialStock(m.id, newVal);
                                                        }} className="px-2 bg-brand-dark rounded text-xs hover:bg-brand-gold/20 transition-colors">-</button>
                                                        <span className={isLow ? 'text-red-400 font-bold' : isWarn ? 'text-yellow-400' : 'text-white'}>
                                                            {m.stock}
                                                        </span>
                                                        <button onClick={async () => {
                                                            const newVal = m.stock + 1;
                                                            setMaterials(materials.map(x => x.id === m.id ? { ...x, stock: newVal } : x));
                                                            await updateMaterialStock(m.id, newVal);
                                                        }} className="px-2 bg-brand-dark rounded text-xs hover:bg-brand-gold/20 transition-colors">+</button>
                                                        <span className="text-brand-gold-muted text-xs ml-1">/ {minStock} mín</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`text-xs px-2 py-1 rounded-full ${isLow ? 'bg-red-400/10 text-red-400' : isWarn ? 'bg-yellow-400/10 text-yellow-400' : 'bg-green-400/10 text-green-400'
                                                        }`}>
                                                        {isLow ? '⚠️ Bajo' : isWarn ? '⚡ Medio' : '✅ OK'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button onClick={() => setEditMaterial(m)} className="text-brand-gold hover:text-brand-gold/80 transition-colors uppercase text-[10px] tracking-wider font-bold">
                                                            ✏️ Editar
                                                        </button>
                                                        <button onClick={async () => {
                                                            if(confirm(`¿Eliminar "${m.name}" del inventario?`)) {
                                                                await deleteMaterial(m.id);
                                                                setMaterials(materials.filter(x => x.id !== m.id));
                                                            }
                                                        }} className="text-red-400 hover:text-red-300 transition-colors uppercase text-[10px] tracking-wider font-bold">
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Add Material Modal */}
                    {showAddMaterial && (
                        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowAddMaterial(false)}>
                            <div className="bg-surface-card border border-border-subtle rounded-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                                <h3 className="font-heading text-xl font-bold text-white mb-6">📦 Añadir Material</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-brand-gold-muted uppercase tracking-wider block mb-1">Nombre *</label>
                                        <input
                                            type="text"
                                            value={newMat.name}
                                            onChange={e => setNewMat({ ...newMat, name: e.target.value })}
                                            placeholder="Ej: Cable Cat6 UTP"
                                            className="w-full bg-brand-dark border border-border-subtle rounded-lg p-3 text-white focus:outline-none focus:border-brand-gold/50"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-brand-gold-muted uppercase tracking-wider block mb-1">Categoría</label>
                                            <select
                                                value={newMat.category}
                                                onChange={e => setNewMat({ ...newMat, category: e.target.value })}
                                                className="w-full bg-brand-dark border border-border-subtle rounded-lg p-3 text-white focus:outline-none focus:border-brand-gold/50"
                                            >
                                                {['cable', 'conector', 'fibra', 'conector_fibra', 'rack_fibra', 'rack', 'canaleta', 'tubo', 'herramienta', 'otro'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1).replace('_', ' ')}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-brand-gold-muted uppercase tracking-wider block mb-1">Unidad</label>
                                            <select
                                                value={newMat.unit}
                                                onChange={e => setNewMat({ ...newMat, unit: e.target.value })}
                                                className="w-full bg-brand-dark border border-border-subtle rounded-lg p-3 text-white focus:outline-none focus:border-brand-gold/50"
                                            >
                                                {['m', 'ud', 'rollo', 'caja', 'kg'].map(u => <option key={u} value={u}>{u}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-brand-gold-muted uppercase tracking-wider block mb-1">Precio coste (€)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={newMat.cost_price || ''}
                                                onChange={e => setNewMat({ ...newMat, cost_price: parseFloat(e.target.value) || 0 })}
                                                className="w-full bg-brand-dark border border-border-subtle rounded-lg p-3 text-white focus:outline-none focus:border-brand-gold/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-brand-gold-muted uppercase tracking-wider block mb-1">Precio venta (€)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={newMat.sell_price || ''}
                                                onChange={e => setNewMat({ ...newMat, sell_price: parseFloat(e.target.value) || 0 })}
                                                className="w-full bg-brand-dark border border-border-subtle rounded-lg p-3 text-white focus:outline-none focus:border-brand-gold/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-brand-gold-muted uppercase tracking-wider block mb-1">Stock actual</label>
                                            <input
                                                type="number"
                                                value={newMat.stock || ''}
                                                onChange={e => setNewMat({ ...newMat, stock: parseInt(e.target.value) || 0 })}
                                                className="w-full bg-brand-dark border border-border-subtle rounded-lg p-3 text-white focus:outline-none focus:border-brand-gold/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-brand-gold-muted uppercase tracking-wider block mb-1">Stock mínimo</label>
                                            <input
                                                type="number"
                                                value={newMat.min_stock || ''}
                                                onChange={e => setNewMat({ ...newMat, min_stock: parseInt(e.target.value) || 0 })}
                                                className="w-full bg-brand-dark border border-border-subtle rounded-lg p-3 text-white focus:outline-none focus:border-brand-gold/50"
                                            />
                                        </div>
                                    </div>
                                    {newMat.sell_price > 0 && newMat.cost_price > 0 && (
                                        <div className="bg-brand-dark/50 rounded-lg p-3 text-center">
                                            <span className="text-xs text-brand-gold-muted">Margen estimado: </span>
                                            <span className="text-green-400 font-bold">
                                                {(((newMat.sell_price - newMat.cost_price) / newMat.sell_price) * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        onClick={() => setShowAddMaterial(false)}
                                        className="px-4 py-2 border border-border-subtle rounded-lg text-brand-gold-muted hover:text-white transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (!newMat.name.trim()) return;
                                            await addMaterial(newMat);
                                            setMaterials([...materials, { ...newMat, id: 'temp-' + Date.now(), stock: newMat.stock }]);
                                            setNewMat({ name: '', category: 'cable', unit: 'm', cost_price: 0, sell_price: 0, stock: 0, min_stock: 5 });
                                            setShowAddMaterial(false);
                                        }}
                                        className="px-6 py-2 bg-brand-gold text-black rounded-lg font-bold hover:bg-brand-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Guardar Material
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ═══════ PROJECTS ═══════ */}
            {activeTab === 'projects' && (
                <div className="space-y-6">
                    {/* Profit summary */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <div className="card p-6 border-green-500/20">
                            <div className="text-xs text-brand-gold-muted uppercase tracking-wider mb-2">Ingresos totales</div>
                            <div className="font-heading text-2xl font-bold text-green-400">
                                {projects.filter(p => p.status === 'completed').reduce((s, p) => s + (Number(p.total_revenue) || 0), 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                            </div>
                        </div>
                        <div className="card p-6 border-red-500/20">
                            <div className="text-xs text-brand-gold-muted uppercase tracking-wider mb-2">Costes reales</div>
                            <div className="font-heading text-2xl font-bold text-red-400">
                                {projects.filter(p => p.status === 'completed').reduce((s, p) => {
                                    const actual = (Number(p.actual_material_cost) || 0) + (Number(p.actual_labor_cost) || 0) + (Number(p.actual_other_cost) || 0);
                                    return s + (actual > 0 ? actual : (Number(p.total_cost) || 0));
                                }, 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                            </div>
                        </div>
                        <div className="card p-6 border-brand-gold/20">
                            <div className="text-xs text-brand-gold-muted uppercase tracking-wider mb-2">Beneficio neto</div>
                            <div className="font-heading text-2xl font-bold text-gradient-gold">
                                {analytics.totalProfit.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                            </div>
                            <div className="text-xs text-emerald-400 mt-1">{analytics.profitMargin}% margen</div>
                        </div>
                        <div className="card p-6 border-cyan-500/20">
                            <div className="text-xs text-brand-gold-muted uppercase tracking-wider mb-2">Cobrado</div>
                            <div className="font-heading text-2xl font-bold text-cyan-400">
                                {projects.filter(p => p.payment_status === 'paid').reduce((s, p) => s + (Number(p.total_revenue) || 0), 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                            </div>
                            <div className="text-xs text-brand-gold-muted mt-1">
                                {projects.filter(p => p.payment_status === 'pending' || !p.payment_status).length} pendientes
                            </div>
                        </div>
                    </div>

                    {/* Projects table */}
                    <div className="card border-brand-gold/10 overflow-hidden">
                        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
                            <h3 className="font-heading font-semibold text-white">📋 Historial de Proyectos</h3>
                            <button
                                onClick={async () => {
                                    const result = await exportProjectsCSV();
                                    if (result.success && result.csv) {
                                        downloadCSV(result.csv, `proyectos_cablecore_${new Date().toISOString().split('T')[0]}.csv`);
                                    } else {
                                        alert('❌ Error exportando: ' + (result.error || 'sin datos'));
                                    }
                                }}
                                className="px-3 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold hover:bg-emerald-500/30 transition-colors"
                            >
                                📥 Exportar CSV
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border-subtle text-brand-gold-muted text-xs uppercase tracking-wider">
                                        <th className="text-left p-3">Cliente</th>
                                        <th className="text-right p-3">Ingresos</th>
                                        <th className="text-right p-3">Mat. Real</th>
                                        <th className="text-right p-3">M.O. Real</th>
                                        <th className="text-right p-3">Otros</th>
                                        <th className="text-right p-3">Beneficio</th>
                                        <th className="text-center p-3">Pago</th>
                                        <th className="text-center p-3">Fecha pago</th>
                                        <th className="text-center p-3">Estado</th>
                                        <th className="text-center p-3">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projects.map(p => {
                                        const rev = Number(p.total_revenue) || 0;
                                        const matReal = Number(p.actual_material_cost) || 0;
                                        const labReal = Number(p.actual_labor_cost) || 0;
                                        const othReal = Number(p.actual_other_cost) || 0;
                                        const hasActual = matReal > 0 || labReal > 0 || othReal > 0;
                                        const totalCost = hasActual ? matReal + labReal + othReal : (Number(p.total_cost) || 0);
                                        const prf = rev - totalCost;
                                        return (
                                        <tr key={p.id} className="border-b border-border-subtle/50 hover:bg-[rgba(201,168,76,0.03)] transition-colors">
                                            <td className="p-3">
                                                <div className="font-medium text-white">{p.client_name || p.client}</div>
                                                <div className="text-[10px] text-brand-gold-muted font-mono">{(p.quote_id || '').slice(0, 8)}</div>
                                            </td>
                                            <td className="p-3 text-right text-green-400 font-bold">{rev.toFixed(2)}€</td>
                                            <td className="p-3 text-right">
                                                <input type="number" step="0.01" placeholder="0.00"
                                                    className="w-20 bg-transparent border-b border-border-subtle text-right text-red-400 text-xs focus:outline-none focus:border-brand-gold"
                                                    defaultValue={matReal > 0 ? matReal : ''}
                                                    onBlur={async (e) => {
                                                        const val = parseFloat(e.target.value) || 0;
                                                        await updateProjectCosts(p.id, { actual_material_cost: val });
                                                        setProjects(projects.map(x => x.id === p.id ? { ...x, actual_material_cost: val } : x));
                                                    }}
                                                />
                                            </td>
                                            <td className="p-3 text-right">
                                                <input type="number" step="0.01" placeholder="0.00"
                                                    className="w-20 bg-transparent border-b border-border-subtle text-right text-red-400 text-xs focus:outline-none focus:border-brand-gold"
                                                    defaultValue={labReal > 0 ? labReal : ''}
                                                    onBlur={async (e) => {
                                                        const val = parseFloat(e.target.value) || 0;
                                                        await updateProjectCosts(p.id, { actual_labor_cost: val });
                                                        setProjects(projects.map(x => x.id === p.id ? { ...x, actual_labor_cost: val } : x));
                                                    }}
                                                />
                                            </td>
                                            <td className="p-3 text-right">
                                                <input type="number" step="0.01" placeholder="0.00"
                                                    className="w-20 bg-transparent border-b border-border-subtle text-right text-red-400 text-xs focus:outline-none focus:border-brand-gold"
                                                    defaultValue={othReal > 0 ? othReal : ''}
                                                    onBlur={async (e) => {
                                                        const val = parseFloat(e.target.value) || 0;
                                                        await updateProjectCosts(p.id, { actual_other_cost: val });
                                                        setProjects(projects.map(x => x.id === p.id ? { ...x, actual_other_cost: val } : x));
                                                    }}
                                                />
                                            </td>
                                            <td className={`p-3 text-right font-bold ${prf >= 0 ? 'text-brand-gold' : 'text-red-400'}`}>
                                                {hasActual ? `${prf.toFixed(2)}€` : <span className="text-brand-gold-muted text-xs italic">est. {(rev - totalCost).toFixed(0)}€</span>}
                                            </td>
                                            <td className="p-3 text-center">
                                                <select
                                                    className={`text-xs px-2 py-1 rounded-full outline-none cursor-pointer appearance-none ${
                                                        p.payment_status === 'paid' ? 'bg-green-400/10 text-green-400' :
                                                        p.payment_status === 'partial' ? 'bg-yellow-400/10 text-yellow-400' :
                                                        'bg-gray-400/10 text-gray-400'
                                                    }`}
                                                    value={p.payment_status || 'pending'}
                                                    onChange={async (e) => {
                                                        const newStatus = e.target.value;
                                                        const updateData: any = { payment_status: newStatus };
                                                        if (newStatus === 'paid' && !p.payment_date) {
                                                            updateData.payment_date = new Date().toISOString().split('T')[0];
                                                        }
                                                        await updateProjectPayment(p.id, updateData);
                                                        setProjects(projects.map(x => x.id === p.id ? { ...x, ...updateData } : x));
                                                    }}
                                                >
                                                    <option value="pending">⏳ Pendiente</option>
                                                    <option value="partial">💳 Parcial</option>
                                                    <option value="paid">✅ Cobrado</option>
                                                </select>
                                            </td>
                                            <td className="p-3 text-center">
                                                <input type="date"
                                                    className="bg-transparent border-b border-border-subtle text-brand-gold-muted text-xs focus:outline-none focus:border-brand-gold w-28"
                                                    defaultValue={p.payment_date || ''}
                                                    onBlur={async (e) => {
                                                        await updateProjectPayment(p.id, { payment_date: e.target.value || null });
                                                        setProjects(projects.map(x => x.id === p.id ? { ...x, payment_date: e.target.value } : x));
                                                    }}
                                                />
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className={`text-xs px-3 py-1 rounded-full ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                                            </td>
                                            <td className="p-3 text-center">
                                                {(() => {
                                                    const stage = p.payment_stage || 'none';
                                                    const halfAmount = (rev / 2).toFixed(2);

                                                    const handleSendInvoice = async (pType: 'advance' | 'final') => {
                                                        let clientEmail = p.client_email || '';
                                                        if (!clientEmail && !p.quote_id) {
                                                            const email = prompt('Email del cliente:');
                                                            if (!email) return;
                                                            clientEmail = email;
                                                        }

                                                        try {
                                                            const res = await fetch('/api/invoice/send', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ projectId: p.id, paymentType: pType, clientEmail: clientEmail || undefined }),
                                                            });
                                                            const data = await res.json();
                                                            if (data.success) {
                                                                const emailMsg = data.emailSent 
                                                                    ? '📧 Email enviado al cliente' 
                                                                    : '⚠️ Email no enviado (link copiado)';
                                                                await navigator.clipboard.writeText(data.paymentUrl);
                                                                alert(`✅ ${emailMsg}\n\n💳 Link de pago (${pType === 'advance' ? 'Anticipo' : 'Final'}): ${halfAmount}€\n\nLink copiado al portapapeles`);
                                                                window.location.reload();
                                                            } else {
                                                                alert('❌ Error: ' + (data.error || 'Unknown'));
                                                            }
                                                        } catch (err: any) {
                                                            alert('❌ Error: ' + err.message);
                                                        }
                                                    };

                                                    if (stage === 'final_paid' || p.payment_status === 'paid') {
                                                        return <span className="text-xs text-green-400 font-bold">✅ 100% Pagado</span>;
                                                    }
                                                    if (stage === 'final_sent') {
                                                        return (
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="text-[10px] text-green-400">✅ Anticipo</span>
                                                                <span className="text-[10px] text-yellow-400">📧 Final enviado</span>
                                                            </div>
                                                        );
                                                    }
                                                    if (stage === 'advance_paid') {
                                                        return (
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="text-[10px] text-green-400">✅ Anticipo pagado</span>
                                                                <button
                                                                    onClick={() => handleSendInvoice('final')}
                                                                    className="text-[10px] px-2 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full hover:bg-emerald-500/30 transition-colors font-bold"
                                                                >
                                                                    📧 Enviar Final ({halfAmount}€)
                                                                </button>
                                                            </div>
                                                        );
                                                    }
                                                    if (stage === 'advance_sent') {
                                                        return (
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="text-[10px] text-yellow-400">📧 Anticipo enviado</span>
                                                                <span className="text-[10px] text-gray-500">Esperando pago...</span>
                                                            </div>
                                                        );
                                                    }
                                                    // stage === 'none'
                                                    if (rev > 0) {
                                                        return (
                                                            <button
                                                                onClick={() => handleSendInvoice('advance')}
                                                                className="text-xs px-3 py-1.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full hover:bg-purple-500/30 transition-colors font-bold"
                                                            >
                                                                📧 Anticipo ({halfAmount}€)
                                                            </button>
                                                        );
                                                    }
                                                    return <span className="text-xs text-brand-gold-muted">—</span>;
                                                })()}
                                            </td>
                                            <td className="p-3 text-center">
                                                <a
                                                    href={`/${locale}/admin/project/${p.id}`}
                                                    className="text-brand-gold hover:text-white transition-colors text-[10px] uppercase tracking-wider font-bold"
                                                >
                                                    Ver →
                                                </a>
                                            </td>
                                        </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            
            {/* ═══════ MODALS ═══════ */}
            {/* Quote Modal Overlay */}
            {selectedQuote && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-surface-card border border-brand-gold/30 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center p-6 border-b border-border-subtle sticky top-0 bg-surface-card z-10">
                            <h3 className="text-xl font-heading font-bold text-white">Detalles del Presupuesto <span className="text-brand-gold text-sm font-mono ml-2">#{selectedQuote.id.slice(0, 8)}</span></h3>
                            <button onClick={() => setSelectedQuote(null)} className="text-gray-400 hover:text-white transition-colors">✕</button>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-brand-gold-muted text-xs uppercase mb-2">Cliente</h4>
                                    <div className="p-3 bg-black/20 rounded-lg">
                                        <p className="font-bold text-white">{selectedQuote.client_name || selectedQuote.client}</p>
                                        <p className="text-gray-300">📞 {selectedQuote.client_phone || selectedQuote.phone}</p>
                                        <p className="text-gray-300">✉️ {selectedQuote.client_email || selectedQuote.email}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-brand-gold-muted text-xs uppercase mb-2">Instalación</h4>
                                    <div className="p-3 bg-black/20 rounded-lg space-y-1 text-gray-300">
                                        <p>Cable: <span className="text-brand-gold font-mono">{selectedQuote.cable_type || selectedQuote.cable}</span> ({selectedQuote.cable_meters}m)</p>
                                        <p>Puntos de Red: <span className="text-white font-bold">{selectedQuote.network_points || selectedQuote.points}</span></p>
                                        <p>Tipo instalación: <span className="text-white">{selectedQuote.installation_type}</span> ({selectedQuote.installation_meters}m)</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-brand-gold-muted text-xs uppercase mb-2">Desglose de Costes</h4>
                                    <div className="p-3 bg-black/20 rounded-lg space-y-2 text-gray-300">
                                        <div className="flex justify-between border-b border-white/5 pb-1"><span>Materiales</span> <span>{Number(selectedQuote.materials_cost).toFixed(2)}€</span></div>
                                        <div className="flex justify-between border-b border-white/5 pb-1"><span>Cable</span> <span>{Number(selectedQuote.cable_cost).toFixed(2)}€</span></div>
                                        <div className="flex justify-between border-b border-white/5 pb-1"><span>Mano de Obra (Técnicos)</span> <span>{Number(selectedQuote.work_cost).toFixed(2)}€</span></div>
                                        <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-brand-gold/30">
                                            <span>TOTAL EUR</span> <span className="text-brand-gold">{Number(selectedQuote.total).toFixed(2)}€</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-2">
                                        <h4 className="text-brand-gold-muted uppercase">Notas Internas</h4>
                                        <span className="text-white/30 italic">Autoguardado al hacer click fuera</span>
                                    </div>
                                    <textarea 
                                        className="w-full bg-black/30 border border-brand-gold/20 rounded-lg p-3 text-white text-sm focus:border-brand-gold outline-none min-h-[100px]"
                                        placeholder="Escribe aquí notas internas, seguimiento, etc..."
                                        defaultValue={selectedQuote.internal_notes || ''}
                                        onBlur={async (e) => {
                                            const newNotes = e.target.value;
                                            setSelectedQuote({...selectedQuote, internal_notes: newNotes});
                                            setQuotes(quotes.map(q => q.id === selectedQuote.id ? {...q, internal_notes: newNotes} : q));
                                            await updateQuoteNotes(selectedQuote.id, newNotes);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-border-subtle bg-black/20 flex justify-end gap-4">
                            <button onClick={() => {
                                const installTitles: Record<string, string> = {
                                    external: 'Superficial',
                                    ceiling: 'Falso techo',
                                    existing_wall: 'Tubos existentes',
                                    new_wall: 'Regata nueva',
                                    industrial: 'Nave industrial',
                                    trays: 'Bandejas'
                                };
                                const instName = installTitles[selectedQuote.installation_type] || selectedQuote.installation_type;

                                const pdfData: QuotePDFData = {
                                    quoteNumber: selectedQuote.id.split('-')[0].toUpperCase(),
                                    date: new Date(selectedQuote.created_at).toLocaleDateString(),
                                    client: {
                                        name: selectedQuote.client_name,
                                        phone: selectedQuote.client_phone,
                                        email: selectedQuote.client_email,
                                        address: selectedQuote.client_address
                                    },
                                    items: [
                                        { description: 'Cableado ' + selectedQuote.cable_type, quantity: selectedQuote.cable_meters + 'm', unitPrice: '-', total: Number(selectedQuote.cable_cost).toFixed(2) + '€' },
                                        { description: 'Puntos de Red', quantity: selectedQuote.network_points.toString(), unitPrice: '-', total: Number(selectedQuote.points_cost).toFixed(2) + '€' },
                                        { description: 'Tendido de cable (' + instName + ')', quantity: selectedQuote.cable_meters + 'm', unitPrice: '-', total: Number(selectedQuote.installation_cost).toFixed(2) + '€' },
                                        { description: 'Mano de obra (operarios y técnicos)', quantity: 'Global', unitPrice: '-', total: Number(selectedQuote.work_cost).toFixed(2) + '€' }
                                    ],
                                    subtotal: Number(selectedQuote.subtotal).toFixed(2) + '€',
                                    iva: Number(selectedQuote.iva).toFixed(2) + '€',
                                    total: Number(selectedQuote.total).toFixed(2) + '€'
                                };
                                downloadQuotePDF(pdfData);
                            }} className="px-4 py-2.5 bg-brand-gold text-black font-bold rounded-lg hover:bg-white transition-colors flex items-center gap-2">
                                📄 Descargar Oferta PDF
                            </button>

                            <button onClick={() => {
                                setInvoiceData({
                                    razonSocial: selectedQuote.client_name || '',
                                    cif: '',
                                    address: selectedQuote.client_address || '',
                                    email: selectedQuote.client_email || '',
                                    phone: selectedQuote.client_phone || ''
                                });
                                // Pre-populate items from quote data
                                const hasCosts = Number(selectedQuote.cable_cost) > 0 || Number(selectedQuote.points_cost) > 0 || Number(selectedQuote.work_cost) > 0;
                                const instName = selectedQuote.installation_type || 'ceiling';
                                if (hasCosts) {
                                    setInvoiceItems([
                                        { description: 'Cableado ' + (selectedQuote.cable_type || ''), quantity: String(selectedQuote.cable_meters || 1), unitPrice: Number(selectedQuote.cable_cost).toFixed(2) },
                                        { description: 'Puntos de Red', quantity: String(selectedQuote.network_points || 1), unitPrice: Number(selectedQuote.points_cost / Math.max(selectedQuote.network_points, 1)).toFixed(2) },
                                        { description: 'Tendido de cable (' + instName + ')', quantity: String(selectedQuote.cable_meters || 1), unitPrice: Number(selectedQuote.installation_cost / Math.max(selectedQuote.cable_meters, 1)).toFixed(2) },
                                        { description: 'Mano de obra (operarios y técnicos)', quantity: '1', unitPrice: Number(selectedQuote.work_cost).toFixed(2) }
                                    ].filter(it => parseFloat(it.unitPrice) > 0));
                                } else {
                                    // Manual quote — start with one empty line for user to fill
                                    setInvoiceItems([{ description: '', quantity: '1', unitPrice: '' }]);
                                }
                                setShowInvoiceModal(true);
                            }} className="px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500 transition-colors flex items-center gap-2">
                                🧾 Convertir a Factura
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lead Modal Overlay */}
            {selectedLead && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-surface-card border border-brand-gold/30 rounded-xl w-full max-w-2xl shadow-2xl">
                        <div className="flex justify-between items-center p-6 border-b border-border-subtle">
                            <h3 className="text-xl font-heading font-bold text-white">Detalles del Contacto</h3>
                            <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-white transition-colors">✕</button>
                        </div>
                        <div className="p-6 space-y-6 text-sm">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div><span className="text-brand-gold-muted text-xs uppercase block">Nombre</span><span className="text-white font-bold">{selectedLead.name}</span></div>
                                <div><span className="text-brand-gold-muted text-xs uppercase block">Fuente</span><span className="text-brand-gold font-mono">{selectedLead.source}</span></div>
                                <div className="col-span-2"><span className="text-brand-gold-muted text-xs uppercase block">Contacto</span><span className="text-gray-300">{selectedLead.phone} / {selectedLead.email}</span></div>
                            </div>
                            
                            {selectedLead.service && (
                                <div>
                                    <span className="text-brand-gold-muted text-xs uppercase block mb-1">Servicio Solicitado</span>
                                    <div className="px-3 py-2 bg-brand-dark/50 text-brand-gold rounded font-medium">{selectedLead.service}</div>
                                </div>
                            )}

                            {selectedLead.message && (
                                <div>
                                    <span className="text-brand-gold-muted text-xs uppercase block mb-1">Mensaje Extra</span>
                                    <div className="p-4 bg-black/30 text-gray-300 rounded border border-white/5 line-clamp-4 overflow-y-auto max-h-32">{selectedLead.message}</div>
                                </div>
                            )}

                            <div>
                                <div className="flex justify-between text-xs mb-2">
                                    <h4 className="text-brand-gold-muted uppercase">Notas de Seguimiento</h4>
                                    <span className="text-white/30 italic">Autoguardado al cerrar</span>
                                </div>
                                <textarea 
                                    className="w-full bg-black/30 border border-brand-gold/20 rounded-lg p-3 text-white text-sm focus:border-brand-gold outline-none min-h-[100px]"
                                    placeholder="Ej: Le llamé el lunes, me pidió presupuesto para la semana que viene..."
                                    defaultValue={selectedLead.notes || ''}
                                    onBlur={async (e) => {
                                        const newNotes = e.target.value;
                                        setSelectedLead({...selectedLead, notes: newNotes});
                                        setLeads(leads.map(l => l.id === selectedLead.id ? {...l, notes: newNotes} : l));
                                        await updateLeadNotes(selectedLead.id, newNotes);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Material Modal */}
            {editMaterial && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setEditMaterial(null)}>
                    <div className="bg-surface-card border border-border-subtle rounded-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="font-heading text-xl font-bold text-white mb-6">✏️ Editar Material</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-brand-gold-muted uppercase tracking-wider block mb-1">Nombre</label>
                                <input
                                    type="text"
                                    defaultValue={editMaterial.name}
                                    onChange={e => setEditMaterial({ ...editMaterial, name: e.target.value })}
                                    className="w-full bg-brand-dark border border-border-subtle rounded-lg p-3 text-white focus:outline-none focus:border-brand-gold/50"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-brand-gold-muted uppercase tracking-wider block mb-1">Categoría</label>
                                    <select
                                        value={editMaterial.category}
                                        onChange={e => setEditMaterial({ ...editMaterial, category: e.target.value })}
                                        className="w-full bg-brand-dark border border-border-subtle rounded-lg p-3 text-white focus:outline-none focus:border-brand-gold/50"
                                    >
                                        {['cable', 'conector', 'fibra', 'conector_fibra', 'rack_fibra', 'rack', 'canaleta', 'tubo', 'herramienta', 'otro'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1).replace('_', ' ')}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-brand-gold-muted uppercase tracking-wider block mb-1">Unidad</label>
                                    <select
                                        value={editMaterial.unit}
                                        onChange={e => setEditMaterial({ ...editMaterial, unit: e.target.value })}
                                        className="w-full bg-brand-dark border border-border-subtle rounded-lg p-3 text-white focus:outline-none focus:border-brand-gold/50"
                                    >
                                        {['m', 'ud', 'rollo', 'caja', 'kg'].map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-brand-gold-muted uppercase tracking-wider block mb-1">Precio coste (€)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        defaultValue={editMaterial.cost_price}
                                        onChange={e => setEditMaterial({ ...editMaterial, cost_price: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-brand-dark border border-border-subtle rounded-lg p-3 text-white focus:outline-none focus:border-brand-gold/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-brand-gold-muted uppercase tracking-wider block mb-1">Precio venta (€)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        defaultValue={editMaterial.sell_price}
                                        onChange={e => setEditMaterial({ ...editMaterial, sell_price: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-brand-dark border border-border-subtle rounded-lg p-3 text-white focus:outline-none focus:border-brand-gold/50"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-brand-gold-muted uppercase tracking-wider block mb-1">Stock actual</label>
                                    <input
                                        type="number"
                                        defaultValue={editMaterial.stock}
                                        onChange={e => setEditMaterial({ ...editMaterial, stock: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-brand-dark border border-border-subtle rounded-lg p-3 text-white focus:outline-none focus:border-brand-gold/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-brand-gold-muted uppercase tracking-wider block mb-1">Stock mínimo</label>
                                    <input
                                        type="number"
                                        defaultValue={editMaterial.min_stock}
                                        onChange={e => setEditMaterial({ ...editMaterial, min_stock: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-brand-dark border border-border-subtle rounded-lg p-3 text-white focus:outline-none focus:border-brand-gold/50"
                                    />
                                </div>
                            </div>
                            {editMaterial.sell_price > 0 && editMaterial.cost_price > 0 && (
                                <div className="bg-brand-dark/50 rounded-lg p-3 text-center">
                                    <span className="text-xs text-brand-gold-muted">Margen: </span>
                                    <span className="text-green-400 font-bold">
                                        {(((editMaterial.sell_price - editMaterial.cost_price) / editMaterial.sell_price) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setEditMaterial(null)}
                                className="px-4 py-2 border border-border-subtle rounded-lg text-brand-gold-muted hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={async () => {
                                    const { id, created_at, ...data } = editMaterial;
                                    await updateMaterial(id, {
                                        name: data.name,
                                        category: data.category,
                                        unit: data.unit,
                                        cost_price: data.cost_price,
                                        sell_price: data.sell_price,
                                        stock: data.stock,
                                        min_stock: data.min_stock,
                                    });
                                    setMaterials(materials.map(x => x.id === id ? { ...x, ...data } : x));
                                    setEditMaterial(null);
                                }}
                                className="px-6 py-2 bg-brand-gold text-black rounded-lg font-bold hover:bg-brand-gold/90 transition-colors"
                            >
                                💾 Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Factura Modal */}
            {showInvoiceModal && selectedQuote && (() => {
                const ivaPct = 0.21;
                const computedSubtotal = invoiceItems.reduce((sum, it) => {
                    const qty = parseFloat(it.quantity) || 0;
                    const price = parseFloat(it.unitPrice) || 0;
                    return sum + qty * price;
                }, 0);
                const computedIva = computedSubtotal * ivaPct;
                const computedTotal = computedSubtotal + computedIva;

                return (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-surface-card border border-brand-gold/30 rounded-xl w-full max-w-3xl shadow-2xl p-6 my-4">
                        <h3 className="text-xl font-heading font-bold text-white border-b border-border-subtle pb-4 mb-6">🧾 Crear Factura</h3>

                        {/* Client info */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="text-xs text-brand-gold-muted uppercase block mb-1">Razón Social *</label>
                                <input type="text" value={invoiceData.razonSocial} onChange={e => setInvoiceData({...invoiceData, razonSocial: e.target.value})} className="w-full bg-brand-dark rounded-lg p-2.5 text-white border border-border-subtle text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-brand-gold-muted uppercase block mb-1">CIF / NIF *</label>
                                <input type="text" value={invoiceData.cif} onChange={e => setInvoiceData({...invoiceData, cif: e.target.value})} className="w-full bg-brand-dark rounded-lg p-2.5 text-white border border-border-subtle text-sm" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-brand-gold-muted uppercase block mb-1">Dirección Fiscal</label>
                                <input type="text" value={invoiceData.address} onChange={e => setInvoiceData({...invoiceData, address: e.target.value})} className="w-full bg-brand-dark rounded-lg p-2.5 text-white border border-border-subtle text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-brand-gold-muted uppercase block mb-1">Email</label>
                                <input type="text" value={invoiceData.email} onChange={e => setInvoiceData({...invoiceData, email: e.target.value})} className="w-full bg-brand-dark rounded-lg p-2.5 text-white border border-border-subtle text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-brand-gold-muted uppercase block mb-1">Teléfono</label>
                                <input type="text" value={invoiceData.phone} onChange={e => setInvoiceData({...invoiceData, phone: e.target.value})} className="w-full bg-brand-dark rounded-lg p-2.5 text-white border border-border-subtle text-sm" />
                            </div>
                        </div>

                        {/* Line items editor */}
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-xs text-brand-gold-muted uppercase tracking-wider font-bold">Líneas de Factura</h4>
                                <button onClick={() => setInvoiceItems([...invoiceItems, { description: '', quantity: '1', unitPrice: '' }])} className="text-xs px-3 py-1.5 bg-brand-gold/20 text-brand-gold rounded-lg hover:bg-brand-gold/30 transition-colors font-medium">
                                    + Añadir línea
                                </button>
                            </div>

                            {/* Header */}
                            <div className="grid grid-cols-12 gap-2 mb-2 text-[10px] text-brand-gold-muted uppercase tracking-wider px-1">
                                <div className="col-span-6">Descripción</div>
                                <div className="col-span-2 text-center">Cantidad</div>
                                <div className="col-span-2 text-right">Precio/ud. (€)</div>
                                <div className="col-span-1 text-right">Total</div>
                                <div className="col-span-1"></div>
                            </div>

                            {/* Rows */}
                            <div className="space-y-2">
                                {invoiceItems.map((item, idx) => {
                                    const rowTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
                                    return (
                                        <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                            <input
                                                className="col-span-6 bg-brand-dark border border-border-subtle rounded p-2 text-sm text-white focus:border-brand-gold outline-none"
                                                placeholder="Descripción del servicio"
                                                value={item.description}
                                                onChange={e => { const n=[...invoiceItems]; n[idx]={...n[idx], description: e.target.value}; setInvoiceItems(n); }}
                                            />
                                            <input
                                                className="col-span-2 bg-brand-dark border border-border-subtle rounded p-2 text-sm text-white text-center focus:border-brand-gold outline-none"
                                                placeholder="1"
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={item.quantity}
                                                onChange={e => { const n=[...invoiceItems]; n[idx]={...n[idx], quantity: e.target.value}; setInvoiceItems(n); }}
                                            />
                                            <input
                                                className="col-span-2 bg-brand-dark border border-border-subtle rounded p-2 text-sm text-white text-right focus:border-brand-gold outline-none"
                                                placeholder="0.00"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.unitPrice}
                                                onChange={e => { const n=[...invoiceItems]; n[idx]={...n[idx], unitPrice: e.target.value}; setInvoiceItems(n); }}
                                            />
                                            <div className="col-span-1 text-right text-sm font-bold text-brand-gold">{rowTotal.toFixed(2)}€</div>
                                            <button onClick={() => setInvoiceItems(invoiceItems.filter((_,i) => i !== idx))} className="col-span-1 text-red-400 hover:text-red-300 text-center text-lg leading-none">✕</button>
                                        </div>
                                    );
                                })}

                                {invoiceItems.length === 0 && (
                                    <div className="text-center py-6 text-brand-gold-muted text-sm border border-dashed border-border-subtle rounded-lg">
                                        Pulsa &quot;+ Añadir línea&quot; para agregar una partida
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Totals preview */}
                        <div className="flex justify-end mb-6">
                            <div className="w-64 text-sm space-y-1">
                                <div className="flex justify-between text-brand-gold-muted">
                                    <span>Base Imponible</span>
                                    <span className="text-white font-medium">{computedSubtotal.toFixed(2)}€</span>
                                </div>
                                <div className="flex justify-between text-brand-gold-muted">
                                    <span>IVA (21%)</span>
                                    <span className="text-white font-medium">{computedIva.toFixed(2)}€</span>
                                </div>
                                <div className="flex justify-between text-brand-gold font-bold text-base border-t border-border-subtle pt-2">
                                    <span>TOTAL</span>
                                    <span>{computedTotal.toFixed(2)}€</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowInvoiceModal(false)} className="px-4 py-2 border border-border-subtle rounded-lg text-brand-gold-muted hover:text-white transition-colors">Cancelar</button>
                            <button disabled={isFacturando || invoiceItems.length === 0} onClick={async () => {
                                if(!invoiceData.cif || !invoiceData.razonSocial) return alert('CIF y Razón Social son obligatorios');
                                if(invoiceItems.length === 0) return alert('Añade al menos una línea');
                                setIsFacturando(true);
                                try {
                                    const finalItems = invoiceItems.map(it => ({
                                        description: it.description,
                                        quantity: it.quantity,
                                        unitPrice: parseFloat(it.unitPrice).toFixed(2) + '€',
                                        total: ((parseFloat(it.quantity)||0) * (parseFloat(it.unitPrice)||0)).toFixed(2) + '€'
                                    }));

                                    const res = await fetch('/api/invoice/create', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            quote_id: selectedQuote.id,
                                            razon_social: invoiceData.razonSocial,
                                            cif: invoiceData.cif,
                                            address: invoiceData.address,
                                            email: invoiceData.email,
                                            phone: invoiceData.phone,
                                            total_data: { subtotal: computedSubtotal.toFixed(2), iva: computedIva.toFixed(2), total: computedTotal.toFixed(2), items: finalItems }
                                        })
                                    });
                                    const r = await res.json();

                                    if(r.success) {
                                        const pdfData: InvoicePDFData = {
                                            invoiceNumber: r.invoice_number ?? 21,
                                            date: new Date().toLocaleDateString('es-ES'),
                                            client: { razonSocial: invoiceData.razonSocial, cif: invoiceData.cif, address: invoiceData.address, email: invoiceData.email, phone: invoiceData.phone },
                                            items: finalItems,
                                            subtotal: computedSubtotal.toFixed(2) + '€',
                                            iva: computedIva.toFixed(2) + '€',
                                            total: computedTotal.toFixed(2) + '€',
                                            notes: 'Pago realizable mediante transferencia bancaria.\nGracias por su confianza.'
                                        };
                                        await downloadInvoicePDF(pdfData);
                                        setShowInvoiceModal(false);
                                    } else { alert('Error: ' + r.error); }
                                } catch(e) { alert('Server error'); }
                                setIsFacturando(false);
                            }} className={`px-6 py-2.5 bg-emerald-600 font-bold text-white rounded-lg transition-opacity ${(isFacturando || invoiceItems.length === 0) ? 'opacity-40 cursor-not-allowed' : 'hover:bg-emerald-500'}`}>
                                {isFacturando ? 'Generando...' : '📄 Generar Factura PDF'}
                            </button>
                        </div>
                    </div>
                </div>
                );
            })()}
        </div>
    );
}
