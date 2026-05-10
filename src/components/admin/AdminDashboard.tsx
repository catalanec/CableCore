'use client';

import { useState, useMemo, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { updateLeadStatus, updateQuoteStatus, updateMaterialStock, deleteLead, deleteQuote, updateLeadNotes, updateQuoteNotes, addMaterial, deleteMaterial, updateMaterial, updateProjectCosts, updateProjectPayment, seedMaterials, sendLowStockAlerts, exportMaterialsCSV, exportProjectsCSV, getAllTasks, addExpense, getExpenses, deleteExpense, notifyStaleLeads, deleteProject } from '@/app/actions/crm';
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
    initialInvoices?: any[];
}

/* Tab types */
type Tab = 'overview' | 'quotes' | 'leads' | 'pipeline' | 'materials' | 'projects' | 'tasks' | 'facturas' | 'gastos' | 'agenda';

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

export default function AdminDashboard({ initialQuotes, initialLeads, initialMaterials, initialProjects, initialTasks = [], initialInvoices = [] }: AdminDashboardProps) {
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
    const [invoices, setInvoices] = useState<any[]>(initialInvoices);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [chartPeriod, setChartPeriod] = useState(6);
    const [newMat, setNewMat] = useState({ name: '', category: 'cable', unit: 'm', cost_price: 0, sell_price: 0, stock: 0, min_stock: 5 });

    // ── Gastos rápidos ──
    const [expenses, setExpenses] = useState<Array<{id: string; description: string; amount: number; category: string; date: string}>>([]);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'materiales', date: new Date().toISOString().split('T')[0], project_id: '' });
    const [savingExpense, setSavingExpense] = useState(false);


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

    // Load expenses on mount
    useEffect(() => {
        getExpenses().then(res => {
            if (res.success && res.data) setExpenses(res.data);
        });
    }, []);

    // ── Quarterly tax ──
    const [selectedQuarter, setSelectedQuarter] = useState(() => Math.floor(new Date().getMonth() / 3) + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const quarterlyData = useMemo(() => {
        const qStart = (selectedQuarter - 1) * 3;
        const qEnd = qStart + 2;
        const periodProjects = projects.filter(p => {
            const dateStr = (p.payment_status === 'paid' && p.payment_date) ? p.payment_date : p.created_at;
            if (!dateStr) return false;
            const d = new Date(dateStr);
            return d.getFullYear() === selectedYear && d.getMonth() >= qStart && d.getMonth() <= qEnd;
        });
        const totalConIva = periodProjects.reduce((s, p) => s + (Number(p.total_revenue) || 0), 0);
        const baseImponible = totalConIva / 1.21;
        const ivaACobrar = totalConIva - baseImponible;
        const irpfBase = periodProjects.reduce((s, p) => s + (Number(p.actual_labor_cost) || 0), 0);
        const irpfEstimado = irpfBase * 0.20;
        const beneficioNeto = irpfBase - irpfEstimado;
        return { totalConIva, baseImponible, ivaACobrar, irpfBase, irpfEstimado, beneficioNeto, projectCount: periodProjects.length };
    }, [projects, selectedQuarter, selectedYear]);

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
        const wonLeads = leads.filter(l => l.status === 'won').length;
        const conversionRate = leads.length > 0 ? ((wonLeads / leads.length) * 100).toFixed(0) : '0';
        const lowStock = materials.filter(m => m.stock <= m.min_stock).length;
        const avgQuoteValue = quotes.length > 0 ? (quotes.reduce((s, q) => s + (Number(q.total) || 0), 0) / quotes.length) : 0;

        const now = new Date();
        const curM = now.getMonth();
        const curY = now.getFullYear();
        const prevM = curM === 0 ? 11 : curM - 1;
        const prevY = curM === 0 ? curY - 1 : curY;

        // Current month revenue (projects preferred, fallback quotes)
        const curProjectRev = projects
            .filter(p => p.status === 'completed' && (() => { const d = new Date(p.payment_date || p.created_at); return d.getMonth() === curM && d.getFullYear() === curY; })())
            .reduce((s, p) => s + (Number(p.total_revenue) || 0), 0);
        const curQuoteRev = quotes
            .filter(q => q.status === 'completed' && (() => { const d = new Date(q.created_at); return d.getMonth() === curM && d.getFullYear() === curY; })())
            .reduce((s, q) => s + (Number(q.total) || 0), 0);
        const currentMonthRevenue = curProjectRev > 0 ? curProjectRev : curQuoteRev;

        // Previous month revenue
        const prevProjectRev = projects
            .filter(p => p.status === 'completed' && (() => { const d = new Date(p.payment_date || p.created_at); return d.getMonth() === prevM && d.getFullYear() === prevY; })())
            .reduce((s, p) => s + (Number(p.total_revenue) || 0), 0);
        const prevQuoteRev = quotes
            .filter(q => q.status === 'completed' && (() => { const d = new Date(q.created_at); return d.getMonth() === prevM && d.getFullYear() === prevY; })())
            .reduce((s, q) => s + (Number(q.total) || 0), 0);
        const prevMonthRevenue = prevProjectRev > 0 ? prevProjectRev : prevQuoteRev;

        const monthChangePct = prevMonthRevenue > 0
            ? Math.round(((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
            : null;

        // Average value of completed projects
        const completedProjectsList = projects.filter(p => p.status === 'completed');
        const avgProjectValue = completedProjectsList.length > 0
            ? completedProjectsList.reduce((s, p) => s + (Number(p.total_revenue) || 0), 0) / completedProjectsList.length
            : 0;

        // Top lead sources
        const sourceCounts: Record<string, number> = {};
        leads.forEach(l => { const src = l.source || 'directo'; sourceCounts[src] = (sourceCounts[src] || 0) + 1; });
        const topSources = Object.entries(sourceCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([source, count]) => ({ source, count, pct: leads.length > 0 ? Math.round((count / leads.length) * 100) : 0 }));

        // Stale leads (new + older than 24h)
        const staleLeads = leads.filter(l => l.status === 'new' && new Date(l.created_at) < new Date(Date.now() - 86400000)).length;

        return {
            totalRevenue, totalCost, totalProfit, profitMargin,
            totalQuotes, pendingQuotes, completedProjects,
            newLeads, wonLeads, conversionRate, lowStock,
            avgQuoteValue, avgProjectValue,
            currentMonthRevenue, prevMonthRevenue, monthChangePct,
            topSources, staleLeads,
        };
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
        { id: 'agenda', label: 'Agenda', icon: '📅' },
        { id: 'leads', label: 'Leads', icon: '👥' },
        { id: 'quotes', label: 'Presupuestos', icon: '📋' },
        { id: 'materials', label: 'Materiales', icon: '📦' },
        { id: 'projects', label: 'Proyectos', icon: '🏗️' },
        { id: 'facturas', label: 'Facturas', icon: '🧾' },
        { id: 'gastos', label: 'Gastos', icon: '💸' },
    ];

    return (
        <div>
            {/* Top Bar: Tabs & Search */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
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
                
                {/* Search Bar */}
                <div className="relative w-full md:w-72 ml-auto">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gold-muted text-sm">🔍</span>
                    <input 
                        type="search" 
                        placeholder="Buscar cliente, email o teléfono..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-surface-card border border-border-subtle rounded-lg py-2.5 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-brand-gold/50 transition-colors"
                    />
                </div>
            </div>

            {/* ═══════ OVERVIEW ═══════ */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Ingresos mes actual con MoM% */}
                        <div className="card p-5 border-brand-gold/10">
                            <div className="flex items-start justify-between mb-3">
                                <span className="text-2xl">💰</span>
                                {analytics.monthChangePct !== null ? (
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${analytics.monthChangePct >= 0 ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                                        {analytics.monthChangePct >= 0 ? '▲' : '▼'} {Math.abs(analytics.monthChangePct)}% vs mes ant.
                                    </span>
                                ) : (
                                    <span className="text-xs text-brand-gold-muted">primer mes</span>
                                )}
                            </div>
                            <div className="font-heading text-2xl font-bold text-white mb-1">
                                {analytics.currentMonthRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                            </div>
                            <div className="text-xs text-brand-gold-muted">Ingresos (mes actual)</div>
                            {analytics.prevMonthRevenue > 0 && (
                                <div className="text-xs text-white/30 mt-1">Mes anterior: {analytics.prevMonthRevenue.toLocaleString('es-ES', { minimumFractionDigits: 0 })}€</div>
                            )}
                        </div>
                        {/* Beneficio neto */}
                        <div className="card p-5 border-brand-gold/10">
                            <div className="flex items-start justify-between mb-3">
                                <span className="text-2xl">📈</span>
                                <span className="text-xs font-medium text-emerald-400">{analytics.profitMargin}% margen</span>
                            </div>
                            <div className="font-heading text-2xl font-bold text-white mb-1">
                                {analytics.totalProfit.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                            </div>
                            <div className="text-xs text-brand-gold-muted">Beneficio neto (total)</div>
                            {analytics.avgProjectValue > 0 && (
                                <div className="text-xs text-white/30 mt-1">Ticket medio: {analytics.avgProjectValue.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</div>
                            )}
                        </div>
                        {/* Presupuestos */}
                        <div className="card p-5 border-brand-gold/10">
                            <div className="flex items-start justify-between mb-3">
                                <span className="text-2xl">📋</span>
                                <span className="text-xs font-medium text-yellow-400">{analytics.pendingQuotes} pendientes</span>
                            </div>
                            <div className="font-heading text-2xl font-bold text-white mb-1">{analytics.totalQuotes}</div>
                            <div className="text-xs text-brand-gold-muted">Presupuestos totales</div>
                            <div className="text-xs text-white/30 mt-1">Valor medio: {analytics.avgQuoteValue.toFixed(0)}€</div>
                        </div>
                        {/* Leads */}
                        <div className={`card p-5 ${analytics.staleLeads > 0 ? 'border-red-400/30 bg-red-400/5' : 'border-brand-gold/10'}`}>
                            <div className="flex items-start justify-between mb-3">
                                <span className="text-2xl">👥</span>
                                <span className="text-xs font-medium text-cyan-400">{analytics.conversionRate}% conversión</span>
                            </div>
                            <div className="font-heading text-2xl font-bold text-white mb-1">{analytics.newLeads}</div>
                            <div className="text-xs text-brand-gold-muted">Leads nuevos</div>
                            {analytics.staleLeads > 0 && (
                                <div className="text-xs text-red-400 mt-1 font-semibold">⚠ {analytics.staleLeads} sin atender +24h</div>
                            )}
                        </div>
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

                    {/* ── Quarterly Tax Widget ── */}
                    <div className="card p-6 border-amber-400/20">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                            <h3 className="font-heading font-semibold text-white flex items-center gap-2">🏛️ Resumen Fiscal Trimestral</h3>
                            <div className="flex gap-2 items-center flex-wrap">
                                <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
                                    className="bg-surface-card border border-border-subtle rounded-lg px-2 py-1.5 text-sm text-white outline-none focus:border-brand-gold/50">
                                    {[new Date().getFullYear() - 1, new Date().getFullYear()].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                                {[1,2,3,4].map(q => (
                                    <button key={q} onClick={() => setSelectedQuarter(q)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${selectedQuarter === q ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40' : 'bg-surface-card text-brand-gold-muted border border-border-subtle hover:border-amber-400/20'}`}>T{q}</button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            {[
                                { label: 'Facturado (c/IVA)', value: quarterlyData.totalConIva, color: 'text-white', icon: '💰', note: `${quarterlyData.projectCount} proyectos` },
                                { label: 'Base Imponible', value: quarterlyData.baseImponible, color: 'text-brand-gold', icon: '📋', note: 'Sin IVA' },
                                { label: 'IVA a declarar', value: quarterlyData.ivaACobrar, color: 'text-red-400', icon: '🏛️', note: 'Modelo 303' },
                                { label: 'Base IRPF (Serv.)', value: quarterlyData.irpfBase, color: 'text-orange-400', icon: '👷', note: 'Mano de obra' },
                                { label: 'IRPF estimado (20%)', value: quarterlyData.irpfEstimado, color: 'text-red-400', icon: '📤', note: 'Modelo 130' },
                                { label: 'Beneficio neto', value: quarterlyData.beneficioNeto, color: 'text-green-400', icon: '✅', note: 'Tuyo real' },
                            ].map((item, i) => (
                                <div key={i} className="bg-brand-dark/60 border border-border-subtle rounded-xl p-3 text-center">
                                    <div className="text-xl mb-1">{item.icon}</div>
                                    <div className={`font-heading font-bold text-lg ${item.color}`}>{item.value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</div>
                                    <div className="text-[10px] text-brand-gold-muted mt-1 leading-tight">{item.label}</div>
                                    <div className="text-[9px] text-white/30 mt-0.5">{item.note}</div>
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-brand-gold-muted/60 mt-3">⚠️ Estimación orientativa. Consulta con tu gestor para la declaración oficial.</p>
                    </div>

                    {/* ── Conversion Funnel + Top Sources ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="card p-6 border-brand-gold/10">
                            <h3 className="font-heading font-semibold text-white mb-5">🎯 Embudo de conversión</h3>
                            <div className="space-y-3">
                                {[
                                    { label: 'Leads totales', value: leads.length, color: 'bg-cyan-400/30' },
                                    { label: 'Contactados', value: leads.filter(l => l.status !== 'new').length, color: 'bg-blue-400/30' },
                                    { label: 'Propuesta enviada', value: leads.filter(l => ['proposal', 'won'].includes(l.status)).length, color: 'bg-purple-400/30' },
                                    { label: 'Ganados', value: analytics.wonLeads, color: 'bg-green-400/40' },
                                ].map((stage, i, arr) => {
                                    const pct = arr[0].value > 0 ? Math.round((stage.value / arr[0].value) * 100) : 0;
                                    return (
                                        <div key={i}>
                                            <div className="flex justify-between text-xs mb-1.5">
                                                <span className="text-brand-gold-muted">{stage.label}</span>
                                                <span className="text-white font-semibold">{stage.value} <span className="text-white/40">({pct}%)</span></span>
                                            </div>
                                            <div className="w-full bg-white/5 rounded-full h-2">
                                                <div className={`${stage.color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="card p-6 border-brand-gold/10">
                            <h3 className="font-heading font-semibold text-white mb-5">📡 Fuentes de leads</h3>
                            {analytics.topSources.length === 0 ? (
                                <div className="text-sm text-brand-gold-muted text-center py-8">Sin datos de fuentes todavía</div>
                            ) : (
                                <div className="space-y-3">
                                    {analytics.topSources.map(({ source, count, pct }) => (
                                        <div key={source}>
                                            <div className="flex justify-between text-xs mb-1.5">
                                                <span className="text-brand-gold-muted capitalize">{source.replace(/_/g, ' ')}</span>
                                                <span className="text-white font-semibold">{count} <span className="text-white/40">({pct}%)</span></span>
                                            </div>
                                            <div className="w-full bg-white/5 rounded-full h-2">
                                                <div className="bg-brand-gold/40 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── P&L Rápido ── */}
                    <div className="card p-6 border-brand-gold/10">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-heading font-semibold text-white">💹 P&L — Beneficio y Pérdidas</h3>
                            <button
                                onClick={() => {
                                    const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
                                    const netProfit = analytics.totalRevenue - analytics.totalCost - totalExpenses;
                                    const rows = [
                                        ['Concepto', 'Importe (€)'],
                                        ['Ingresos totales (proyectos)', analytics.totalRevenue.toFixed(2)],
                                        ['Costes directos (materiales + mano de obra)', analytics.totalCost.toFixed(2)],
                                        ['Gastos registrados', totalExpenses.toFixed(2)],
                                        ['Beneficio bruto', (analytics.totalRevenue - analytics.totalCost).toFixed(2)],
                                        ['Beneficio neto (tras gastos)', netProfit.toFixed(2)],
                                        ['Margen neto (%)', analytics.totalRevenue > 0 ? ((netProfit / analytics.totalRevenue) * 100).toFixed(1) : '0'],
                                        [''],
                                        ['--- Desglose gastos por categoría ---'],
                                        ...Object.entries(
                                            expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + Number(e.amount); return acc; }, {} as Record<string, number>)
                                        ).map(([cat, amt]) => [cat, (amt as number).toFixed(2)]),
                                    ];
                                    const csv = rows.map(r => r.join(',')).join('\n');
                                    downloadCSV(csv, `pl_cablecore_${new Date().toISOString().split('T')[0]}.csv`);
                                }}
                                className="px-3 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold hover:bg-emerald-500/30 transition-colors"
                            >
                                📥 Exportar P&L CSV
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {(() => {
                                const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
                                const netProfit = analytics.totalRevenue - analytics.totalCost - totalExpenses;
                                const netMargin = analytics.totalRevenue > 0 ? ((netProfit / analytics.totalRevenue) * 100).toFixed(1) : '0';
                                return [
                                    { label: 'Ingresos', value: analytics.totalRevenue, color: 'text-green-400', icon: '📥' },
                                    { label: 'Costes directos', value: -analytics.totalCost, color: 'text-red-400', icon: '🔧' },
                                    { label: 'Gastos', value: -totalExpenses, color: 'text-orange-400', icon: '💸' },
                                    { label: 'Beneficio neto', value: netProfit, color: netProfit >= 0 ? 'text-emerald-400' : 'text-red-500', icon: netProfit >= 0 ? '✅' : '⚠️', note: `${netMargin}% margen` },
                                ].map((item, i) => (
                                    <div key={i} className="bg-brand-dark/60 border border-border-subtle rounded-xl p-4 text-center">
                                        <div className="text-xl mb-2">{item.icon}</div>
                                        <div className={`font-heading font-bold text-xl ${item.color}`}>
                                            {item.value >= 0 ? '' : '-'}{Math.abs(item.value).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                                        </div>
                                        <div className="text-[10px] text-brand-gold-muted mt-1">{item.label}</div>
                                        {'note' in item && <div className="text-[9px] text-white/30 mt-0.5">{item.note}</div>}
                                    </div>
                                ));
                            })()}
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
                    {/* Header actions */}
                    <div className="flex items-center justify-between">
                        <h3 className="font-heading font-semibold text-white">👥 Gestión de Leads</h3>
                        <button
                            onClick={async () => {
                                const res = await notifyStaleLeads();
                                if (res.success) {
                                    alert(`✅ Telegram enviado — ${res.staleCount} sin atender, ${res.followupCount} follow-up hoy`);
                                } else {
                                    alert('❌ Error: ' + res.error);
                                }
                            }}
                            className="px-3 py-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-bold hover:bg-blue-500/30 transition-colors"
                        >
                            🔔 Notificar leads sin respuesta
                        </button>
                    </div>
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
                                        <th className="text-right p-3">Servicios (Beneficio)</th>
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
                                        const labReal = Number(p.actual_labor_cost) || 0; // Base para IRPF
                                        const othReal = Number(p.actual_other_cost) || 0;
                                        
                                        const hasActual = matReal > 0 || labReal > 0 || othReal > 0;
                                        const totalCost = hasActual ? matReal + labReal + othReal : (Number(p.total_cost) || 0);

                                        const grossProfit = labReal;
                                        const irpfDeduction = grossProfit * 0.20;
                                        const prf = grossProfit - irpfDeduction;
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
                                                {hasActual ? `${prf.toFixed(2)}€` : <span className="text-brand-gold-muted text-xs italic">est. {(rev / 1.21 - totalCost).toFixed(0)}€</span>}
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
                                                <div className="flex items-center justify-center gap-3">
                                                    <a
                                                        href={`/${locale}/admin/project/${p.id}`}
                                                        className="text-brand-gold hover:text-white transition-colors text-[10px] uppercase tracking-wider font-bold"
                                                    >
                                                        Ver →
                                                    </a>
                                                    <button
                                                        onClick={async () => {
                                                            if (!confirm(`¿Eliminar el proyecto de "${p.client_name}" permanentemente? Esta acción no se puede deshacer.`)) return;
                                                            const res = await deleteProject(p.id);
                                                            if (res.success) {
                                                                setProjects(prev => prev.filter(x => x.id !== p.id));
                                                            } else {
                                                                alert('❌ Error al eliminar: ' + res.error);
                                                            }
                                                        }}
                                                        className="text-red-400 hover:text-red-300 transition-colors text-[10px] uppercase tracking-wider font-bold"
                                                    >
                                                        Del
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
                </div>
            )}
            
            {/* ═══════ MODALS ═══════ */}
            {/* Quote Modal Overlay */}
            {selectedQuote && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-surface-card border border-brand-gold/30 rounded-xl w-full max-w-3xl flex flex-col shadow-2xl" style={{maxHeight: '90vh'}}>
                        <div className="flex justify-between items-center p-6 border-b border-border-subtle sticky top-0 bg-surface-card z-10">
                            <h3 className="text-xl font-heading font-bold text-white">Detalles del Presupuesto <span className="text-brand-gold text-sm font-mono ml-2">#{selectedQuote.id.slice(0, 8)}</span></h3>
                            <button onClick={() => setSelectedQuote(null)} className="text-gray-400 hover:text-white transition-colors">✕</button>
                        </div>
                        {/* Scrollable content */}
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm overflow-y-auto flex-1">
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
                        {/* Sticky action bar — always visible */}
                        <div className="p-4 border-t border-border-subtle bg-black/20 flex flex-wrap justify-end gap-3 flex-shrink-0">
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
                                    items: selectedQuote.quote_items && Array.isArray(selectedQuote.quote_items) && selectedQuote.quote_items.length > 0
                                        ? selectedQuote.quote_items
                                        : [
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
                                // Priority: 1) quote_items from DB (full calculator items), 2) cost fields, 3) empty
                                if (selectedQuote.quote_items && Array.isArray(selectedQuote.quote_items) && selectedQuote.quote_items.length > 0) {
                                    // Use saved items from calculator — convert string prices back to numbers
                                    setInvoiceItems(selectedQuote.quote_items.map((it: any) => ({
                                        description: it.description || '',
                                        quantity: String(it.quantity || '1').replace(/[^\d.]/g, ''),
                                        unitPrice: String(it.unitPrice || '0').replace(/[€\s]/g, ''),
                                    })));
                                } else if (hasCosts) {
                                    setInvoiceItems([
                                        { description: 'Cableado ' + (selectedQuote.cable_type || ''), quantity: String(selectedQuote.cable_meters || 1), unitPrice: Number(selectedQuote.cable_cost).toFixed(2) },
                                        { description: 'Puntos de Red', quantity: String(selectedQuote.network_points || 1), unitPrice: Number(selectedQuote.points_cost / Math.max(selectedQuote.network_points, 1)).toFixed(2) },
                                        { description: 'Tendido de cable (' + instName + ')', quantity: String(selectedQuote.cable_meters || 1), unitPrice: Number(selectedQuote.installation_cost / Math.max(selectedQuote.cable_meters, 1)).toFixed(2) },
                                        { description: 'Mano de obra (operarios y técnicos)', quantity: '1', unitPrice: Number(selectedQuote.work_cost).toFixed(2) }
                                    ].filter(it => parseFloat(it.unitPrice) > 0));
                                } else {
                                    // Manual quote with no data — start with one empty line for user to fill
                                    setInvoiceItems([{ description: '', quantity: '1', unitPrice: '' }]);
                                }
                                setShowInvoiceModal(true);
                                setSelectedQuote(null); // Close quote modal to avoid z-index overlap
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

            {/* ═══════ FACTURAS ═══════ */}
            {activeTab === 'facturas' && (
                <div className="card border-brand-gold/10 overflow-hidden">
                    <div className="p-6 border-b border-border-subtle flex items-center justify-between">
                        <h3 className="font-heading font-semibold text-white">🧾 Facturas emitidas</h3>
                        <div className="flex items-center gap-4 text-xs text-brand-gold-muted">
                            <span>Total: <span className="text-white font-bold">{invoices.length}</span></span>
                            <span>Facturado: <span className="text-brand-gold font-bold">{invoices.reduce((s, inv) => s + Number(inv.total_data?.total || 0), 0).toFixed(2)}€</span></span>
                        </div>
                    </div>

                    {invoices.length === 0 ? (
                        <div className="p-12 text-center text-brand-gold-muted">
                            <div className="text-4xl mb-4">🧾</div>
                            <p>Aún no has emitido ninguna factura.</p>
                            <p className="text-xs mt-2">Ve a Presupuestos → VER → Convertir a Factura</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border-subtle text-brand-gold-muted text-xs uppercase tracking-wider">
                                        <th className="text-left p-4 w-28">Nº Factura</th>
                                        <th className="text-left p-4">Empresa / Nombre</th>
                                        <th className="text-left p-4">Dirección</th>
                                        <th className="text-left p-4">Contacto</th>
                                        <th className="text-right p-4">Total</th>
                                        <th className="text-right p-4">Fecha</th>
                                        <th className="text-center p-4">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map(inv => (
                                        <tr key={inv.id} className="border-b border-border-subtle/50 hover:bg-[rgba(201,168,76,0.03)] transition-colors">
                                            <td className="p-4 text-brand-gold font-mono font-bold text-sm">
                                                #{String(inv.invoice_number).padStart(5,'0')}
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-white">{inv.razon_social}</div>
                                                <div className="text-xs text-brand-gold-muted font-mono mt-0.5">{inv.cif}</div>
                                            </td>
                                            <td className="p-4 text-brand-gold-muted text-xs align-top">{inv.address || '—'}</td>
                                            <td className="p-4 text-brand-gold-muted text-xs align-top">
                                                {inv.phone && <div>{inv.phone}</div>}
                                                {inv.email && <div className="mt-0.5">{inv.email}</div>}
                                            </td>
                                            <td className="p-4 text-right font-bold text-brand-gold align-top">
                                                {Number(inv.total_data?.total || 0).toFixed(2)}€
                                            </td>
                                            <td className="p-4 text-right text-brand-gold-muted text-xs align-top">
                                                {new Date(inv.created_at).toLocaleDateString('es-ES')}
                                            </td>
                                            <td className="p-4 align-top">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        title="Reimprimir PDF"
                                                        onClick={() => {
                                                            const td = inv.total_data || {};
                                                            const pdfData: InvoicePDFData = {
                                                                invoiceNumber: inv.invoice_number,
                                                                date: new Date(inv.created_at).toLocaleDateString('es-ES'),
                                                                client: {
                                                                    razonSocial: inv.razon_social,
                                                                    cif: inv.cif,
                                                                    address: inv.address || '',
                                                                    email: inv.email || '',
                                                                    phone: inv.phone || '',
                                                                },
                                                                items: td.items || [{ description: 'Servicios técnicos', quantity: '1', unitPrice: td.subtotal + '€', total: td.subtotal + '€' }],
                                                                subtotal: td.subtotal + '€',
                                                                iva: td.iva + '€',
                                                                total: td.total + '€',
                                                                notes: 'Pago realizable mediante transferencia bancaria.\nGracias por su confianza.',
                                                            };
                                                            downloadInvoicePDF(pdfData);
                                                        }}
                                                        className="text-xs px-2.5 py-1.5 bg-brand-gold/10 text-brand-gold rounded-lg hover:bg-brand-gold/20 transition-colors font-medium"
                                                    >
                                                        📄 PDF
                                                    </button>
                                                    <button
                                                        title="Eliminar factura"
                                                        onClick={async () => {
                                                            if (!confirm(`¿Eliminar factura #${String(inv.invoice_number).padStart(5,'0')} de ${inv.razon_social}?\nEsta acción no se puede deshacer.`)) return;
                                                            try {
                                                                const res = await fetch(`/api/invoice/delete?id=${inv.id}`, { method: 'DELETE' });
                                                                const r = await res.json();
                                                                if (r.success) {
                                                                    setInvoices(prev => prev.filter(i => i.id !== inv.id));
                                                                } else {
                                                                    alert('Error al eliminar: ' + r.error);
                                                                }
                                                            } catch { alert('Error de servidor'); }
                                                        }}
                                                        className="text-xs px-2.5 py-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors font-medium"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
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

                        <div className="flex flex-wrap justify-end gap-3 pt-2">
                            <button onClick={() => setShowInvoiceModal(false)} className="px-5 py-2.5 border border-border-subtle rounded-lg text-brand-gold-muted hover:text-white transition-colors whitespace-nowrap">Cancelar</button>
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
                                        downloadInvoicePDF(pdfData);
                                        // Update local invoices list so Facturas tab shows it immediately
                                        setInvoices(prev => [{
                                            id: r.invoice_id || Date.now(),
                                            invoice_number: r.invoice_number ?? 21,
                                            razon_social: invoiceData.razonSocial,
                                            cif: invoiceData.cif,
                                            address: invoiceData.address,
                                            email: invoiceData.email,
                                            phone: invoiceData.phone,
                                            total_data: { subtotal: computedSubtotal.toFixed(2), iva: computedIva.toFixed(2), total: computedTotal.toFixed(2), items: finalItems },
                                            created_at: new Date().toISOString(),
                                        }, ...prev]);
                                        setShowInvoiceModal(false);
                                    } else { alert('Error: ' + r.error); }
                                } catch(e) { alert('Server error'); }
                                setIsFacturando(false);
                            }} className={`px-6 py-2.5 bg-emerald-600 font-bold text-white rounded-lg transition-opacity whitespace-nowrap ${(isFacturando || invoiceItems.length === 0) ? 'opacity-40 cursor-not-allowed' : 'hover:bg-emerald-500'}`}>
                                {isFacturando ? 'Generando...' : '📄 Generar Factura PDF'}
                            </button>
                        </div>
                    </div>
                </div>
                );
            })()}

            {/* ═══════ GASTOS ═══════ */}
            {activeTab === 'gastos' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-heading font-semibold text-white">💸 Registro de Gastos</h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    if (expenses.length === 0) return alert('No hay gastos para exportar');
                                    const header = 'Fecha,Descripción,Categoría,Importe (€),Proyecto';
                                    const rows = expenses.map(e =>
                                        `"${e.date}","${e.description.replace(/"/g, '""')}","${e.category}",${Number(e.amount).toFixed(2)},"${(e as any).project_id || ''}"`
                                    );
                                    const total = `,,Total,${expenses.reduce((s, e) => s + Number(e.amount), 0).toFixed(2)},`;
                                    downloadCSV([header, ...rows, total].join('\n'), `gastos_cablecore_${new Date().toISOString().split('T')[0]}.csv`);
                                }}
                                className="px-3 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold hover:bg-emerald-500/30 transition-colors"
                            >
                                📥 Exportar CSV
                            </button>
                            <button onClick={() => setShowExpenseModal(true)} className="btn-gold px-4 py-2 text-sm">+ Añadir Gasto</button>
                        </div>
                    </div>
                    {expenses.length === 0 ? (
                        <div className="card p-12 text-center border-brand-gold/10">
                            <div className="text-4xl mb-3">💸</div>
                            <div className="text-white font-semibold mb-1">No hay gastos registrados</div>
                            <div className="text-sm text-brand-gold-muted mb-4">Añade gastos de materiales, herramientas, transporte, etc.</div>
                            <button onClick={() => setShowExpenseModal(true)} className="btn-outline px-4 py-2 text-sm">+ Añadir primer gasto</button>
                        </div>
                    ) : (
                        <div className="card border-brand-gold/10 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border-subtle text-brand-gold-muted text-xs uppercase tracking-wider">
                                        <th className="text-left p-4">Fecha</th>
                                        <th className="text-left p-4">Descripción</th>
                                        <th className="text-left p-4">Categoría</th>
                                        <th className="text-right p-4">Importe</th>
                                        <th className="text-center p-4 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.map(e => (
                                        <tr key={e.id} className="border-b border-border-subtle/50 group">
                                            <td className="p-4 text-brand-gold-muted text-xs">{new Date(e.date).toLocaleDateString('es-ES')}</td>
                                            <td className="p-4 text-white">{e.description}</td>
                                            <td className="p-4"><span className="text-xs px-2 py-1 rounded-full bg-surface-card text-brand-gold-muted capitalize">{e.category}</span></td>
                                            <td className="p-4 text-right font-bold text-red-400">-{Number(e.amount).toFixed(2)}€</td>
                                            <td className="p-4">
                                                <button onClick={async () => {
                                                    if (!confirm('¿Eliminar este gasto?')) return;
                                                    await deleteExpense(e.id);
                                                    setExpenses(prev => prev.filter(x => x.id !== e.id));
                                                }} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all">🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t border-brand-gold/20">
                                        <td colSpan={3} className="p-4 text-right text-brand-gold-muted font-semibold text-sm">Total gastos:</td>
                                        <td className="p-4 text-right font-bold text-red-400 text-base">-{expenses.reduce((s, e) => s + Number(e.amount), 0).toFixed(2)}€</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ═══════ AGENDA ═══════ */}
            {activeTab === 'agenda' && (
                <div className="space-y-4">
                    <h3 className="font-heading font-semibold text-white">📅 Agenda de visitas</h3>
                    <div className="card p-8 text-center border-brand-gold/10">
                        <div className="text-4xl mb-3">📅</div>
                        <div className="text-white font-semibold mb-1">Calendario — Próximamente</div>
                        <div className="text-sm text-brand-gold-muted">Vista semanal de visitas y trabajos programados.</div>
                        <div className="mt-4 text-xs text-brand-gold-muted">Por ahora usa la pestaña ✅ Tareas para gestionar fechas.</div>
                    </div>
                </div>
            )}

            {/* ═══════ QUICK EXPENSE MODAL ═══════ */}
            {showExpenseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-surface-card border border-brand-gold/30 rounded-xl w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center p-5 border-b border-border-subtle">
                            <h3 className="text-lg font-heading font-bold text-white">💸 Nuevo Gasto</h3>
                            <button onClick={() => setShowExpenseModal(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs text-brand-gold-muted mb-1">Descripción *</label>
                                <input type="text" value={newExpense.description}
                                    onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                                    placeholder="Ej: Pigtails SC/APC × 10 ud"
                                    className="w-full bg-brand-dark border border-border-subtle rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold/50" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-brand-gold-muted mb-1">Importe (€) *</label>
                                    <input type="number" step="0.01" min="0" value={newExpense.amount}
                                        onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                                        placeholder="0.00"
                                        className="w-full bg-brand-dark border border-border-subtle rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold/50" />
                                </div>
                                <div>
                                    <label className="block text-xs text-brand-gold-muted mb-1">Fecha</label>
                                    <input type="date" value={newExpense.date}
                                        onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                                        className="w-full bg-brand-dark border border-border-subtle rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold/50" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-brand-gold-muted mb-1">Categoría</label>
                                <select value={newExpense.category}
                                    onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                                    className="w-full bg-brand-dark border border-border-subtle rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold/50">
                                    <option value="materiales">📦 Materiales</option>
                                    <option value="herramientas">🔧 Herramientas</option>
                                    <option value="transporte">🚗 Transporte / Combustible</option>
                                    <option value="subcontrata">👷 Subcontrata</option>
                                    <option value="otros">📌 Otros</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-brand-gold-muted mb-1">Proyecto (opcional)</label>
                                <select value={newExpense.project_id}
                                    onChange={e => setNewExpense({...newExpense, project_id: e.target.value})}
                                    className="w-full bg-brand-dark border border-border-subtle rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold/50">
                                    <option value="">— Sin proyecto —</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.client_name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 p-5 pt-0">
                            <button onClick={() => setShowExpenseModal(false)}
                                className="flex-1 px-4 py-2.5 border border-border-subtle rounded-lg text-brand-gold-muted hover:text-white transition-colors text-sm">
                                Cancelar
                            </button>
                            <button disabled={savingExpense || !newExpense.description || !newExpense.amount}
                                onClick={async () => {
                                    if (!newExpense.description || !newExpense.amount) return;
                                    setSavingExpense(true);
                                    const expenseData = {
                                        description: newExpense.description,
                                        amount: Number(newExpense.amount),
                                        category: newExpense.category,
                                        date: newExpense.date,
                                        project_id: newExpense.project_id || undefined
                                    };
                                    
                                    const res = await addExpense(expenseData);
                                    if (res.success) {
                                        // Refresh expenses list
                                        const latest = await getExpenses();
                                        if (latest.success) setExpenses(latest.data);
                                        
                                        setNewExpense({ description: '', amount: '', category: 'materiales', date: new Date().toISOString().split('T')[0], project_id: '' });
                                        setShowExpenseModal(false);
                                    } else {
                                        alert('Error al guardar: ' + res.error);
                                    }
                                    setSavingExpense(false);
                                }}
                                className="flex-1 px-4 py-2.5 bg-brand-gold text-black font-bold rounded-lg hover:bg-white transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                                {savingExpense ? 'Guardando...' : '✓ Añadir Gasto'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

