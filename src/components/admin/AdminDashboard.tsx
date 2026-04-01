'use client';

import { useState, useMemo, useEffect } from 'react';

import { updateLeadStatus, updateQuoteStatus, updateMaterialStock, deleteLead, deleteQuote, updateLeadNotes, updateQuoteNotes } from '@/app/actions/crm';
import { downloadQuotePDF, type QuotePDFData } from '@/lib/quote-pdf';

interface AdminDashboardProps {
    initialQuotes: any[];
    initialLeads: any[];
    initialMaterials: any[];
    initialProjects: any[];
}

/* Tab types */
type Tab = 'overview' | 'quotes' | 'leads' | 'materials' | 'projects';

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

export default function AdminDashboard({ initialQuotes, initialLeads, initialMaterials, initialProjects }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedQuote, setSelectedQuote] = useState<any>(null);
    const [selectedLead, setSelectedLead] = useState<any>(null);
    
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
        const totalRevenue = projects.filter(p => p.status === 'completed').reduce((s, p) => s + (Number(p.total_revenue) || 0), 0);
        const totalCost = projects.filter(p => p.status === 'completed').reduce((s, p) => s + (Number(p.total_cost) || 0), 0);
        const totalProfit = totalRevenue - totalCost;
        const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0';
        const totalQuotes = quotes.length;
        const pendingQuotes = quotes.filter(q => q.status === 'pending' || q.status === 'sent').length;
        const completedProjects = projects.filter(p => p.status === 'completed').length;
        const newLeads = leads.filter(l => l.status === 'new').length;
        const conversionRate = leads.length > 0 ? ((leads.filter(l => l.status === 'won').length / leads.length) * 100).toFixed(0) : '0';
        const lowStock = materials.filter(m => m.stock <= m.min_stock).length;
        const avgQuoteValue = quotes.length > 0 ? (quotes.reduce((s, q) => s + (Number(q.total) || 0), 0) / quotes.length) : 0;
        return { totalRevenue, totalCost, totalProfit, profitMargin, totalQuotes, pendingQuotes, completedProjects, newLeads, conversionRate, lowStock, avgQuoteValue };
    }, [quotes, leads, projects, materials]);

    // Monthly revenue for chart (dynamic last 6 months based on DB data)
    const monthlyData = useMemo(() => {
        const months: { month: string, monthIdx: number, year: number, revenue: number, cost: number }[] = [];
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({ month: monthNames[d.getMonth()], monthIdx: d.getMonth(), year: d.getFullYear(), revenue: 0, cost: 0 });
        }
        projects.forEach(p => {
            if (p.status !== 'completed') return;
            const pd = new Date(p.created_at || p.date || new Date());
            const entry = months.find(m => m.monthIdx === pd.getMonth() && m.year === pd.getFullYear());
            if (entry) {
                entry.revenue += (Number(p.total_revenue) || p.revenue || 0);
                entry.cost += (Number(p.total_cost) || p.cost || 0);
            }
        });
        return months;
    }, [projects]);
    const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1000);

    const tabs: { id: Tab; label: string; icon: string }[] = [
        { id: 'overview', label: 'Panel General', icon: '📊' },
        { id: 'quotes', label: 'Presupuestos', icon: '📋' },
        { id: 'leads', label: 'Leads / CRM', icon: '👥' },
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
                            { label: 'Ingresos (mes)', value: `${analytics.totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€`, icon: '💰', trend: '+18%', color: 'text-green-400' },
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
                        <h3 className="font-heading font-semibold text-white mb-6 flex items-center gap-2">
                            📊 Ingresos vs Costes (últimos 6 meses)
                        </h3>
                        <div className="flex items-end gap-4 h-48">
                            {monthlyData.map((d, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                    <div className="w-full flex gap-1 justify-center items-end" style={{ height: '160px' }}>
                                        <div
                                            className="w-5 bg-gradient-to-t from-[#c9a84c] to-[#e8d48b] rounded-t-sm transition-all"
                                            style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                                            title={`Ingresos: ${d.revenue}€`}
                                        />
                                        <div
                                            className="w-5 bg-gradient-to-t from-[#444] to-[#666] rounded-t-sm transition-all"
                                            style={{ height: `${(d.cost / maxRevenue) * 100}%` }}
                                            title={`Costes: ${d.cost}€`}
                                        />
                                    </div>
                                    <span className="text-xs text-brand-gold-muted">{d.month}</span>
                                </div>
                            ))}
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
                                {materials.reduce((s, m) => s + m.stock * (Number(m.cost_price) || m.costPrice), 0).toFixed(0)}€
                            </div>
                            <div className="text-xs text-brand-gold-muted">Valor inventario (coste)</div>
                        </div>
                        <div className="card p-5 border-brand-gold/10">
                            <div className="text-2xl mb-2">📊</div>
                            <div className="font-heading text-2xl font-bold text-white">
                                {materials.length > 0 ? ((1 - materials.reduce((s, m) => s + (Number(m.cost_price) || m.costPrice), 0) / materials.reduce((s, m) => s + (Number(m.sell_price) || m.sellPrice), 0)) * 100).toFixed(0) : '0'}%
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
                                    </tr>
                                </thead>
                                <tbody>
                                    {materials.map(m => {
                                        const costPrice = Number(m.cost_price) || m.costPrice;
                                        const sellPrice = Number(m.sell_price) || m.sellPrice;
                                        const minStock = m.min_stock || m.minStock;
                                        const margin = (((sellPrice - costPrice) / sellPrice) * 100).toFixed(0);
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
                                                <td className="p-4 text-right flex justify-end items-center gap-2">
                                                    <button onClick={async () => {
                                                        const newVal = Math.max(0, m.stock - 1);
                                                        setMaterials(materials.map(x => x.id === m.id ? { ...x, stock: newVal } : x));
                                                        await updateMaterialStock(m.id, newVal);
                                                    }} className="px-2 bg-brand-dark rounded text-xs">-</button>
                                                    <span className={isLow ? 'text-red-400 font-bold' : isWarn ? 'text-yellow-400' : 'text-white'}>
                                                        {m.stock}
                                                    </span>
                                                    <button onClick={async () => {
                                                        const newVal = m.stock + 1;
                                                        setMaterials(materials.map(x => x.id === m.id ? { ...x, stock: newVal } : x));
                                                        await updateMaterialStock(m.id, newVal);
                                                    }} className="px-2 bg-brand-dark rounded text-xs">+</button>
                                                    <span className="text-brand-gold-muted text-xs ml-1">/ {minStock} mín</span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`text-xs px-2 py-1 rounded-full ${isLow ? 'bg-red-400/10 text-red-400' : isWarn ? 'bg-yellow-400/10 text-yellow-400' : 'bg-green-400/10 text-green-400'
                                                        }`}>
                                                        {isLow ? '⚠️ Bajo' : isWarn ? '⚡ Medio' : '✅ OK'}
                                                    </span>
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

            {/* ═══════ PROJECTS ═══════ */}
            {activeTab === 'projects' && (
                <div className="space-y-6">
                    {/* Profit summary */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="card p-6 border-green-500/20">
                            <div className="text-xs text-brand-gold-muted uppercase tracking-wider mb-2">Ingresos totales</div>
                            <div className="font-heading text-3xl font-bold text-green-400">
                                {projects.filter(p => p.status === 'completed').reduce((s, p) => s + (Number(p.total_revenue) || p.revenue), 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                            </div>
                        </div>
                        <div className="card p-6 border-red-500/20">
                            <div className="text-xs text-brand-gold-muted uppercase tracking-wider mb-2">Costes totales</div>
                            <div className="font-heading text-3xl font-bold text-red-400">
                                {projects.filter(p => p.status === 'completed').reduce((s, p) => s + (Number(p.total_cost) || p.cost), 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                            </div>
                        </div>
                        <div className="card p-6 border-brand-gold/20">
                            <div className="text-xs text-brand-gold-muted uppercase tracking-wider mb-2">Beneficio neto</div>
                            <div className="font-heading text-3xl font-bold text-gradient-gold">
                                {analytics.totalProfit.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                            </div>
                            <div className="text-xs text-emerald-400 mt-1">{analytics.profitMargin}% margen</div>
                        </div>
                    </div>

                    {/* Projects table */}
                    <div className="card border-brand-gold/10 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border-subtle text-brand-gold-muted text-xs uppercase tracking-wider">
                                        <th className="text-left p-4">Cliente</th>
                                        <th className="text-left p-4">Presupuesto</th>
                                        <th className="text-right p-4">Ingresos</th>
                                        <th className="text-right p-4">Costes</th>
                                        <th className="text-right p-4">Beneficio</th>
                                        <th className="text-center p-4">Estado</th>
                                        <th className="text-right p-4">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projects.map(p => {
                                        const rev = Number(p.total_revenue) || p.revenue || 0;
                                        const cst = Number(p.total_cost) || p.cost || 0;
                                        const prf = Number(p.profit) || p.profit || 0;
                                        return (
                                        <tr key={p.id} className="border-b border-border-subtle/50 hover:bg-[rgba(201,168,76,0.03)] transition-colors">
                                            <td className="p-4 font-medium text-white">{p.client_name || p.client}</td>
                                            <td className="p-4 text-brand-gold font-mono text-xs">{p.quote_id || p.quoteId}</td>
                                            <td className="p-4 text-right text-green-400">{rev.toFixed(2)}€</td>
                                            <td className="p-4 text-right text-red-400">{cst > 0 ? `${cst.toFixed(2)}€` : '—'}</td>
                                            <td className="p-4 text-right font-bold text-brand-gold">{prf > 0 ? `${prf.toFixed(2)}€` : '—'}</td>
                                            <td className="p-4 text-center">
                                                <span className={`text-xs px-3 py-1 rounded-full ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                                            </td>
                                            <td className="p-4 text-right text-brand-gold-muted text-xs">{new Date(p.created_at || p.date).toLocaleDateString()}</td>
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
        </div>
    );
}
