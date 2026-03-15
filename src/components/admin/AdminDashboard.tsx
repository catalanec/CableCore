'use client';

import { useState, useMemo } from 'react';

/* ═══════════════════════════
   DEMO DATA (replaced by Supabase when connected)
   ═══════════════════════════ */

const DEMO_QUOTES = [
    { id: 'CC-260301-001', date: '2026-03-01', client: 'María García', phone: '+34 612 000 001', email: 'maria@email.com', total: 2450.80, status: 'completed' as const, cable: 'Cat6A', points: 12, meters: 180 },
    { id: 'CC-260302-002', date: '2026-03-02', client: 'Tech Solutions SL', phone: '+34 612 000 002', email: 'info@techsolutions.es', total: 8920.50, status: 'accepted' as const, cable: 'Cat7', points: 48, meters: 1200 },
    { id: 'CC-260305-003', date: '2026-03-05', client: 'Restaurante El Buen Comer', phone: '+34 612 000 003', email: 'admin@elbuencomer.es', total: 1680.30, status: 'sent' as const, cable: 'Cat6', points: 8, meters: 120 },
    { id: 'CC-260307-004', date: '2026-03-07', client: 'Farmacia Ronda', phone: '+34 612 000 004', email: 'farma@ronda.es', total: 3200.00, status: 'pending' as const, cable: 'Cat6A', points: 16, meters: 250 },
    { id: 'CC-260308-005', date: '2026-03-08', client: 'Oficina Cowork BCN', phone: '+34 612 000 005', email: 'hello@coworkbcn.es', total: 12500.75, status: 'completed' as const, cable: 'Cat7', points: 64, meters: 2000 },
    { id: 'CC-260309-006', date: '2026-03-09', client: 'Clínica Dental Salud', phone: '+34 612 000 006', email: 'info@clinicasalud.es', total: 980.50, status: 'rejected' as const, cable: 'Cat5e', points: 4, meters: 60 },
];

const DEMO_LEADS = [
    { id: 1, date: '2026-03-10', name: 'Pedro López', phone: '+34 622 111 222', email: 'pedro@gmail.com', source: 'contact_form', status: 'new' as const, service: 'Cableado oficina' },
    { id: 2, date: '2026-03-09', name: 'Ana Ruiz', phone: '+34 633 222 333', email: 'ana.ruiz@hotmail.com', source: 'calculator', status: 'contacted' as const, service: 'Red doméstica Cat6A' },
    { id: 3, date: '2026-03-08', name: 'Nave Industrial BCN', phone: '+34 644 333 444', email: 'ops@navebcn.es', source: 'whatsapp', status: 'qualified' as const, service: 'Industrial Cat7' },
    { id: 4, date: '2026-03-07', name: 'Hotel Marina', phone: '+34 655 444 555', email: 'it@hotelmarina.com', source: 'contact_form', status: 'proposal' as const, service: 'Red completa hotel' },
    { id: 5, date: '2026-03-05', name: 'Startup Digital SL', phone: '+34 666 555 666', email: 'cto@startupdigital.dev', source: 'calculator', status: 'won' as const, service: 'Oficina 24 puntos' },
];

const DEMO_MATERIALS = [
    { id: 1, name: 'Cable Cat5e UTP', category: 'Cable', unit: 'metro', costPrice: 0.35, sellPrice: 2.50, stock: 500, minStock: 100 },
    { id: 2, name: 'Cable Cat6 UTP', category: 'Cable', unit: 'metro', costPrice: 0.55, sellPrice: 3.00, stock: 800, minStock: 200 },
    { id: 3, name: 'Cable Cat6A FTP', category: 'Cable', unit: 'metro', costPrice: 0.90, sellPrice: 4.00, stock: 400, minStock: 100 },
    { id: 4, name: 'Cable Cat7 S/FTP', category: 'Cable', unit: 'metro', costPrice: 1.50, sellPrice: 5.00, stock: 300, minStock: 50 },
    { id: 5, name: 'Conector RJ45 Cat6', category: 'Conector', unit: 'unidad', costPrice: 0.15, sellPrice: 1.50, stock: 200, minStock: 50 },
    { id: 6, name: 'Conector RJ45 Cat6A', category: 'Conector', unit: 'unidad', costPrice: 0.30, sellPrice: 2.50, stock: 150, minStock: 50 },
    { id: 7, name: 'Roseta red 2 bocas', category: 'Roseta', unit: 'unidad', costPrice: 2.50, sellPrice: 8.00, stock: 80, minStock: 20 },
    { id: 8, name: 'Canaleta 60×40mm', category: 'Canalización', unit: 'metro', costPrice: 2.00, sellPrice: 8.00, stock: 120, minStock: 30 },
    { id: 9, name: 'Tubo corrugado 25mm', category: 'Canalización', unit: 'metro', costPrice: 0.80, sellPrice: 4.00, stock: 200, minStock: 50 },
    { id: 10, name: 'Patch panel 24p Cat6A', category: 'Rack', unit: 'unidad', costPrice: 35.00, sellPrice: 80.00, stock: 5, minStock: 2 },
    { id: 11, name: 'Rack 12U pared', category: 'Rack', unit: 'unidad', costPrice: 65.00, sellPrice: 150.00, stock: 3, minStock: 1 },
    { id: 12, name: 'Rack 42U suelo', category: 'Rack', unit: 'unidad', costPrice: 180.00, sellPrice: 300.00, stock: 2, minStock: 1 },
];

const DEMO_PROJECTS = [
    { id: 1, client: 'María García', quoteId: 'CC-260301-001', status: 'completed' as const, revenue: 2450.80, cost: 820.00, profit: 1630.80, date: '2026-03-01' },
    { id: 2, client: 'Oficina Cowork BCN', quoteId: 'CC-260308-005', status: 'completed' as const, revenue: 12500.75, cost: 4200.00, profit: 8300.75, date: '2026-03-08' },
    { id: 3, client: 'Tech Solutions SL', quoteId: 'CC-260302-002', status: 'in_progress' as const, revenue: 8920.50, cost: 3100.00, profit: 5820.50, date: '2026-03-02' },
    { id: 4, client: 'Hotel Marina', quoteId: 'CC-260310-007', status: 'planned' as const, revenue: 15800.00, cost: 0, profit: 0, date: '2026-03-10' },
];

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

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    // ──────── Analytics data ────────
    const analytics = useMemo(() => {
        const totalRevenue = DEMO_PROJECTS.filter(p => p.status === 'completed').reduce((s, p) => s + p.revenue, 0);
        const totalCost = DEMO_PROJECTS.filter(p => p.status === 'completed').reduce((s, p) => s + p.cost, 0);
        const totalProfit = totalRevenue - totalCost;
        const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0';
        const totalQuotes = DEMO_QUOTES.length;
        const pendingQuotes = DEMO_QUOTES.filter(q => q.status === 'pending' || q.status === 'sent').length;
        const completedProjects = DEMO_PROJECTS.filter(p => p.status === 'completed').length;
        const newLeads = DEMO_LEADS.filter(l => l.status === 'new').length;
        const conversionRate = ((DEMO_LEADS.filter(l => l.status === 'won').length / DEMO_LEADS.length) * 100).toFixed(0);
        const lowStock = DEMO_MATERIALS.filter(m => m.stock <= m.minStock).length;
        const avgQuoteValue = (DEMO_QUOTES.reduce((s, q) => s + q.total, 0) / DEMO_QUOTES.length);
        return { totalRevenue, totalCost, totalProfit, profitMargin, totalQuotes, pendingQuotes, completedProjects, newLeads, conversionRate, lowStock, avgQuoteValue };
    }, []);

    // Monthly revenue for chart (simple bar chart via CSS)
    const monthlyData = [
        { month: 'Oct', revenue: 8200, cost: 2800 },
        { month: 'Nov', revenue: 11500, cost: 3900 },
        { month: 'Dic', revenue: 9800, cost: 3200 },
        { month: 'Ene', revenue: 14200, cost: 4700 },
        { month: 'Feb', revenue: 12800, cost: 4100 },
        { month: 'Mar', revenue: analytics.totalRevenue, cost: analytics.totalCost },
    ];
    const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

    const tabs: { id: Tab; label: string; icon: string }[] = [
        { id: 'overview', label: 'Panel General', icon: '📊' },
        { id: 'quotes', label: 'Presupuestos', icon: '📋' },
        { id: 'leads', label: 'Leads / CRM', icon: '👥' },
        { id: 'materials', label: 'Materiales', icon: '📦' },
        { id: 'projects', label: 'Proyectos', icon: '🏗️' },
    ];

    return (
        <div>
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
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
                                {DEMO_QUOTES.slice(0, 4).map(q => (
                                    <div key={q.id} className="flex items-center justify-between p-3 rounded-lg bg-brand-dark/50">
                                        <div>
                                            <div className="text-sm font-medium text-white">{q.client}</div>
                                            <div className="text-xs text-brand-gold-muted">{q.id} · {q.points} puntos · {q.cable}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-brand-gold">{q.total.toFixed(2)}€</div>
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
                                {DEMO_MATERIALS.filter(m => m.stock <= m.minStock * 1.5).map(m => (
                                    <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-brand-dark/50">
                                        <div>
                                            <div className="text-sm font-medium text-white">{m.name}</div>
                                            <div className="text-xs text-brand-gold-muted">{m.category}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-sm font-bold ${m.stock <= m.minStock ? 'text-red-400' : 'text-yellow-400'}`}>
                                                {m.stock} {m.unit}s
                                            </div>
                                            <div className="text-xs text-brand-gold-muted">Mín: {m.minStock}</div>
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
                            <span>Total: {DEMO_QUOTES.length}</span>
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
                                </tr>
                            </thead>
                            <tbody>
                                {DEMO_QUOTES.map(q => (
                                    <tr key={q.id} className="border-b border-border-subtle/50 hover:bg-[rgba(201,168,76,0.03)] transition-colors">
                                        <td className="p-4 text-brand-gold font-mono text-xs">{q.id}</td>
                                        <td className="p-4">
                                            <div className="font-medium text-white">{q.client}</div>
                                            <div className="text-xs text-brand-gold-muted">{q.email}</div>
                                        </td>
                                        <td className="p-4 text-brand-gold-muted">{q.cable}</td>
                                        <td className="p-4 text-center text-brand-gold-muted">{q.points}</td>
                                        <td className="p-4 text-center text-brand-gold-muted">{q.meters}m</td>
                                        <td className="p-4 text-right font-bold text-brand-gold">{q.total.toFixed(2)}€</td>
                                        <td className="p-4 text-center">
                                            <span className={`text-xs px-3 py-1 rounded-full ${STATUS_COLORS[q.status]}`}>{q.status}</span>
                                        </td>
                                        <td className="p-4 text-right text-brand-gold-muted text-xs">{q.date}</td>
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
                            const count = DEMO_LEADS.filter(l => l.status === status).length;
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
                                    </tr>
                                </thead>
                                <tbody>
                                    {DEMO_LEADS.map(lead => (
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
                                                <span className={`text-xs px-3 py-1 rounded-full ${STATUS_COLORS[lead.status]}`}>{lead.status}</span>
                                            </td>
                                            <td className="p-4 text-right text-brand-gold-muted text-xs">{lead.date}</td>
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
                            <div className="font-heading text-2xl font-bold text-white">{DEMO_MATERIALS.length}</div>
                            <div className="text-xs text-brand-gold-muted">Productos</div>
                        </div>
                        <div className="card p-5 border-brand-gold/10">
                            <div className="text-2xl mb-2">💰</div>
                            <div className="font-heading text-2xl font-bold text-white">
                                {DEMO_MATERIALS.reduce((s, m) => s + m.stock * m.costPrice, 0).toFixed(0)}€
                            </div>
                            <div className="text-xs text-brand-gold-muted">Valor inventario (coste)</div>
                        </div>
                        <div className="card p-5 border-brand-gold/10">
                            <div className="text-2xl mb-2">📊</div>
                            <div className="font-heading text-2xl font-bold text-white">
                                {((1 - DEMO_MATERIALS.reduce((s, m) => s + m.costPrice, 0) / DEMO_MATERIALS.reduce((s, m) => s + m.sellPrice, 0)) * 100).toFixed(0)}%
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
                                    {DEMO_MATERIALS.map(m => {
                                        const margin = (((m.sellPrice - m.costPrice) / m.sellPrice) * 100).toFixed(0);
                                        const isLow = m.stock <= m.minStock;
                                        const isWarn = m.stock <= m.minStock * 1.5;
                                        return (
                                            <tr key={m.id} className="border-b border-border-subtle/50 hover:bg-[rgba(201,168,76,0.03)] transition-colors">
                                                <td className="p-4 font-medium text-white">{m.name}</td>
                                                <td className="p-4 text-brand-gold-muted text-xs">
                                                    <span className="bg-surface-card px-2 py-1 rounded">{m.category}</span>
                                                </td>
                                                <td className="p-4 text-right text-brand-gold-muted">{m.costPrice.toFixed(2)}€/{m.unit}</td>
                                                <td className="p-4 text-right text-white">{m.sellPrice.toFixed(2)}€/{m.unit}</td>
                                                <td className="p-4 text-right text-green-400">{margin}%</td>
                                                <td className="p-4 text-right">
                                                    <span className={isLow ? 'text-red-400 font-bold' : isWarn ? 'text-yellow-400' : 'text-white'}>
                                                        {m.stock}
                                                    </span>
                                                    <span className="text-brand-gold-muted text-xs ml-1">/ {m.minStock} mín</span>
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
                                {DEMO_PROJECTS.filter(p => p.status === 'completed').reduce((s, p) => s + p.revenue, 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                            </div>
                        </div>
                        <div className="card p-6 border-red-500/20">
                            <div className="text-xs text-brand-gold-muted uppercase tracking-wider mb-2">Costes totales</div>
                            <div className="font-heading text-3xl font-bold text-red-400">
                                {DEMO_PROJECTS.filter(p => p.status === 'completed').reduce((s, p) => s + p.cost, 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
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
                                    {DEMO_PROJECTS.map(p => (
                                        <tr key={p.id} className="border-b border-border-subtle/50 hover:bg-[rgba(201,168,76,0.03)] transition-colors">
                                            <td className="p-4 font-medium text-white">{p.client}</td>
                                            <td className="p-4 text-brand-gold font-mono text-xs">{p.quoteId}</td>
                                            <td className="p-4 text-right text-green-400">{p.revenue.toFixed(2)}€</td>
                                            <td className="p-4 text-right text-red-400">{p.cost > 0 ? `${p.cost.toFixed(2)}€` : '—'}</td>
                                            <td className="p-4 text-right font-bold text-brand-gold">{p.profit > 0 ? `${p.profit.toFixed(2)}€` : '—'}</td>
                                            <td className="p-4 text-center">
                                                <span className={`text-xs px-3 py-1 rounded-full ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                                            </td>
                                            <td className="p-4 text-right text-brand-gold-muted text-xs">{p.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
