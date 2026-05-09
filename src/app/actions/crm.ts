'use server'

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Initialize superservice client that bypasses RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || '';
const telegramChatId = process.env.TELEGRAM_CHAT_ID || '';

const getSupabase = () => {
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase credentials not configured');

   
    }
    return createClient(supabaseUrl, supabaseKey);
};

const revalidate = () => revalidatePath('/[locale]/admin', 'page');

// ═══════════════════════════════════
// TELEGRAM NOTIFICATIONS
// ═══════════════════════════════════

async function sendTelegram(message: string) {
    if (!telegramBotToken || !telegramChatId) return;
    try {
        await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: telegramChatId,
                text: message,
                parse_mode: 'HTML',
            }),
        });
    } catch (e) {
        console.error('Telegram send failed:', e);
    }
}

export async function sendLowStockAlerts() {
    try {
        const supabase = getSupabase();
        const { data: mats } = await supabase.from('materials').select('*');
        if (!mats) return { success: true, sent: 0 };

        const lowItems = mats.filter(m => m.stock <= m.min_stock);
        if (lowItems.length === 0) return { success: true, sent: 0 };

        const lines = lowItems.map(m =>
            `⚠️ <b>${m.name}</b> — ${m.stock} ${m.unit} (mín: ${m.min_stock})`
        );
        const msg = `🚨 <b>Alerta Stock Bajo — CableCore</b>\n\n${lines.join('\n')}\n\n📦 Total: ${lowItems.length} productos requieren reposición`;
        await sendTelegram(msg);
        return { success: true, sent: lowItems.length };
    } catch (error: any) {
        console.error('Failed to send low stock alerts:', error);
        return { success: false, error: error.message };
    }
}

// ═══════════════════════════════════
// CSV EXPORT
// ═══════════════════════════════════

export async function exportMaterialsCSV(): Promise<{ success: boolean; csv?: string; error?: string }> {
    try {
        const supabase = getSupabase();
        const { data: mats, error } = await supabase.from('materials').select('*').order('name');
        if (error) throw error;
        if (!mats || mats.length === 0) return { success: true, csv: '' };

        const header = 'Nombre,Categoría,Unidad,Coste,Venta,Margen(%),Stock,Stock Mín,Estado';
        const rows = mats.map(m => {
            const margin = m.sell_price > 0 ? (((m.sell_price - m.cost_price) / m.sell_price) * 100).toFixed(1) : '0';
            const status = m.stock <= m.min_stock ? 'BAJO' : m.stock <= m.min_stock * 1.5 ? 'MEDIO' : 'OK';
            return `"${m.name}","${m.category}","${m.unit}",${m.cost_price},${m.sell_price},${margin},${m.stock},${m.min_stock},${status}`;
        });
        return { success: true, csv: [header, ...rows].join('\n') };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function exportProjectsCSV(): Promise<{ success: boolean; csv?: string; error?: string }> {
    try {
        const supabase = getSupabase();
        const { data: projs, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        if (!projs || projs.length === 0) return { success: true, csv: '' };

        const header = 'Cliente,Ingresos,Mat.Real,M.O.Real,Otros,Coste Total,Beneficio,Estado Pago,Fecha Pago,Estado,Fecha';
        const rows = projs.map(p => {
            const matC = Number(p.actual_material_cost) || 0;
            const labC = Number(p.actual_labor_cost) || 0;
            const othC = Number(p.actual_other_cost) || 0;
            const totalC = matC + labC + othC || Number(p.total_cost) || 0;
            const profit = (Number(p.total_revenue) || 0) - totalC;
            return `"${p.client_name || ''}",${Number(p.total_revenue) || 0},${matC},${labC},${othC},${totalC},${profit},"${p.payment_status || 'pending'}","${p.payment_date || ''}","${p.status || ''}","${p.created_at || ''}"`;
        });
        return { success: true, csv: [header, ...rows].join('\n') };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateLeadStatus(id: string, newStatus: string) {
    try {
        const supabase = getSupabase();
        const { error } = await supabase
            .from('leads')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) throw error;
        revalidate();
        return { success: true };
    } catch (error: any) {
        console.error('Failed to update lead:', error);
        return { success: false, error: error.message };
    }
}

export async function updateQuoteStatus(id: string, newStatus: string) {
    try {
        const supabase = getSupabase();
        const { error } = await supabase
            .from('quotes')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) throw error;

        // ── Auto-create project when quote is marked completed ──
        if (newStatus === 'completed') {
            // Fetch the full quote data for the project record
            const { data: quote } = await supabase
                .from('quotes')
                .select('*')
                .eq('id', id)
                .single();

            if (quote) {
                const totalRevenue = Number(quote.total) || 0;
                // Estimate cost as materials + work (real costs the business pays)
                const totalCost = (Number(quote.materials_cost) || 0) + (Number(quote.work_cost) || 0) + (Number(quote.cable_cost) || 0);
                const profit = totalRevenue - totalCost;

                // Check if project already exists for this quote
                const { data: existing } = await supabase
                    .from('projects')
                    .select('id')
                    .eq('quote_id', id)
                    .maybeSingle();

                if (existing) {
                    // Update existing project
                    await supabase.from('projects').update({
                        status: 'completed',
                        total_revenue: totalRevenue,
                        total_cost: totalCost,
                        profit: profit,
                        end_date: new Date().toISOString().split('T')[0],
                    }).eq('id', existing.id);
                } else {
                    // Create new project
                    await supabase.from('projects').insert({
                        quote_id: id,
                        client_name: quote.client_name,
                        status: 'completed',
                        start_date: new Date(quote.created_at).toISOString().split('T')[0],
                        end_date: new Date().toISOString().split('T')[0],
                        total_revenue: totalRevenue,
                        total_cost: totalCost,
                        profit: profit,
                    });
                }
            }
        }

        revalidate();
        return { success: true };
    } catch (error: any) {
        console.error('Failed to update quote:', error);
        return { success: false, error: error.message };
    }
}

export async function updateMaterialStock(id: string, newStock: number) {
    try {
        const supabase = getSupabase();
        const { error } = await supabase
            .from('materials')
            .update({ stock: newStock })
            .eq('id', id);

        if (error) throw error;
        revalidate();
        return { success: true };
    } catch (error: any) {
        console.error('Failed to update material stock:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteLead(id: string) {
    try {
        const supabase = getSupabase();
        const { error } = await supabase.from('leads').delete().eq('id', id);
        if (error) throw error;
        revalidate();
        return { success: true };
    } catch (error: any) {
        console.error('Failed to delete lead:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteQuote(id: string) {
    try {
        const supabase = getSupabase();
        // Also delete associated project if exists
        await supabase.from('projects').delete().eq('quote_id', id);
        const { error } = await supabase.from('quotes').delete().eq('id', id);
        if (error) throw error;
        revalidate();
        return { success: true };
    } catch (error: any) {
        console.error('Failed to delete quote:', error);
        return { success: false, error: error.message };
    }
}

export async function updateLeadNotes(id: string, notes: string) {
    try {
        const supabase = getSupabase();
        const { error } = await supabase.from('leads').update({ notes }).eq('id', id);
        if (error) throw error;
        revalidate();
        return { success: true };
    } catch (error: any) {
        console.error('Failed to update lead notes:', error);
        return { success: false, error: error.message };
    }
}

export async function updateQuoteNotes(id: string, internal_notes: string) {
    try {
        const supabase = getSupabase();
        const { error } = await supabase.from('quotes').update({ internal_notes }).eq('id', id);
        if (error) throw error;
        revalidate();
        return { success: true };
    } catch (error: any) {
        console.error('Failed to update quote notes:', error);
        return { success: false, error: error.message };
    }
}

// ═══════════════════════════════════
// MATERIAL CRUD
// ═══════════════════════════════════

export async function addMaterial(data: {
    name: string;
    category: string;
    unit: string;
    cost_price: number;
    sell_price: number;
    stock: number;
    min_stock: number;
}) {
    try {
        const supabase = getSupabase();
        const { error } = await supabase.from('materials').insert(data);
        if (error) throw error;
        revalidate();
        return { success: true };
    } catch (error: any) {
        console.error('Failed to add material:', error);
        return { success: false, error: error.message };
    }
}

export async function updateMaterial(id: string, data: {
    name?: string;
    category?: string;
    unit?: string;
    cost_price?: number;
    sell_price?: number;
    stock?: number;
    min_stock?: number;
}) {
    try {
        const supabase = getSupabase();
        const { error } = await supabase.from('materials').update(data).eq('id', id);
        if (error) throw error;
        revalidate();
        return { success: true };
    } catch (error: any) {
        console.error('Failed to update material:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteMaterial(id: string) {
    try {
        const supabase = getSupabase();
        const { error } = await supabase.from('materials').delete().eq('id', id);
        if (error) throw error;
        revalidate();
        return { success: true };
    } catch (error: any) {
        console.error('Failed to delete material:', error);
        return { success: false, error: error.message };
    }
}

// ═══════════════════════════════════
// PROJECT COST & PAYMENT TRACKING
// ═══════════════════════════════════

export async function updateProjectCosts(id: string, costs: {
    actual_material_cost?: number;
    actual_labor_cost?: number;
    actual_other_cost?: number;
}) {
    try {
        const supabase = getSupabase();
        
        // Calculate new total_cost and profit
        const { data: project } = await supabase.from('projects').select('*').eq('id', id).single();
        if (!project) throw new Error('Project not found');

        const matCost = costs.actual_material_cost ?? project.actual_material_cost ?? 0;
        const labCost = costs.actual_labor_cost ?? project.actual_labor_cost ?? 0;
        const othCost = costs.actual_other_cost ?? project.actual_other_cost ?? 0;
        const totalCost = Number(matCost) + Number(labCost) + Number(othCost);
        const profit = (Number(project.total_revenue) || 0) - totalCost;

        const { error } = await supabase.from('projects').update({
            ...costs,
            total_cost: totalCost,
            profit: profit,
        }).eq('id', id);

        if (error) throw error;
        revalidate();
        return { success: true };
    } catch (error: any) {
        console.error('Failed to update project costs:', error);
        return { success: false, error: error.message };
    }
}

export async function updateProjectPayment(id: string, data: {
    payment_status?: string;
    payment_date?: string | null;
}) {
    try {
        const supabase = getSupabase();
        const { error } = await supabase.from('projects').update(data).eq('id', id);
        if (error) throw error;
        revalidate();
        return { success: true };
    } catch (error: any) {
        console.error('Failed to update project payment:', error);
        return { success: false, error: error.message };
    }
}

// ═══════════════════════════════════
// SEED MATERIALS (one-time)
// ═══════════════════════════════════

export async function seedMaterials() {
    try {
        const supabase = getSupabase();

        const materialsData = [
            // Fiber cables
            { name: 'Fibra Monomodo 2F SM G.657A', category: 'fibra', unit: 'm', cost_price: 0.30, sell_price: 0.45, stock: 500, min_stock: 100 },
            { name: 'Fibra Monomodo 4F SM', category: 'fibra', unit: 'm', cost_price: 0.45, sell_price: 0.65, stock: 200, min_stock: 50 },
            { name: 'Fibra Monomodo 12F SM', category: 'fibra', unit: 'm', cost_price: 0.85, sell_price: 1.20, stock: 100, min_stock: 30 },
            { name: 'Fibra Multimodo OM3', category: 'fibra', unit: 'm', cost_price: 0.60, sell_price: 0.90, stock: 100, min_stock: 30 },
            { name: 'Fibra Multimodo OM4', category: 'fibra', unit: 'm', cost_price: 0.95, sell_price: 1.40, stock: 50, min_stock: 20 },
            // Fiber connectors
            { name: 'Pigtail SC/APC', category: 'conector_fibra', unit: 'ud', cost_price: 2.50, sell_price: 4.00, stock: 50, min_stock: 20 },
            { name: 'Patch cord SC/APC duplex 3m', category: 'conector_fibra', unit: 'ud', cost_price: 3.00, sell_price: 5.00, stock: 30, min_stock: 10 },
            { name: 'Acoplador SC/APC hembra-hembra', category: 'conector_fibra', unit: 'ud', cost_price: 1.80, sell_price: 3.00, stock: 40, min_stock: 15 },
            { name: 'Roseta óptica 2 puertos SC/APC', category: 'conector_fibra', unit: 'ud', cost_price: 7.00, sell_price: 12.00, stock: 30, min_stock: 10 },
            // Fiber racks
            { name: 'Bandeja empalme 1U 12F', category: 'rack_fibra', unit: 'ud', cost_price: 30.00, sell_price: 45.00, stock: 5, min_stock: 2 },
            { name: 'Bandeja empalme 1U 24F', category: 'rack_fibra', unit: 'ud', cost_price: 42.00, sell_price: 65.00, stock: 3, min_stock: 1 },
            { name: 'Caja mural fibra 8F', category: 'rack_fibra', unit: 'ud', cost_price: 22.00, sell_price: 35.00, stock: 5, min_stock: 2 },
            { name: 'Rack fibra pared 6U', category: 'rack_fibra', unit: 'ud', cost_price: 80.00, sell_price: 120.00, stock: 2, min_stock: 1 },
            { name: 'Rack fibra pared 12U', category: 'rack_fibra', unit: 'ud', cost_price: 140.00, sell_price: 200.00, stock: 1, min_stock: 1 },
            { name: 'Rack fibra suelo 22U', category: 'rack_fibra', unit: 'ud', cost_price: 280.00, sell_price: 400.00, stock: 1, min_stock: 1 },
            // Ethernet cables
            { name: 'Cable Cat5e UTP', category: 'cable', unit: 'm', cost_price: 0.18, sell_price: 0.30, stock: 1000, min_stock: 200 },
            { name: 'Cable Cat6 UTP', category: 'cable', unit: 'm', cost_price: 0.35, sell_price: 0.55, stock: 500, min_stock: 100 },
            { name: 'Cable Cat6A FTP', category: 'cable', unit: 'm', cost_price: 0.70, sell_price: 1.10, stock: 200, min_stock: 50 },
            { name: 'Cable Cat7 SFTP', category: 'cable', unit: 'm', cost_price: 1.30, sell_price: 2.00, stock: 100, min_stock: 30 },
            // Ethernet connectors
            { name: 'Conector RJ45 Cat6', category: 'conector', unit: 'ud', cost_price: 0.80, sell_price: 1.50, stock: 200, min_stock: 50 },
            { name: 'Keystone Jack Cat6', category: 'conector', unit: 'ud', cost_price: 3.50, sell_price: 6.00, stock: 50, min_stock: 20 },
            { name: 'Roseta de red doble', category: 'conector', unit: 'ud', cost_price: 5.50, sell_price: 10.00, stock: 30, min_stock: 10 },
            // Infrastructure
            { name: 'Canaleta PVC 40×40', category: 'canaleta', unit: 'm', cost_price: 2.00, sell_price: 4.00, stock: 100, min_stock: 30 },
            { name: 'Tubo corrugado 25mm', category: 'tubo', unit: 'm', cost_price: 0.60, sell_price: 1.00, stock: 200, min_stock: 50 },
            // Racks
            { name: 'Patch Panel 24p Cat6', category: 'rack', unit: 'ud', cost_price: 35.00, sell_price: 60.00, stock: 3, min_stock: 1 },
            { name: 'Rack pared 6U', category: 'rack', unit: 'ud', cost_price: 65.00, sell_price: 110.00, stock: 2, min_stock: 1 },
            { name: 'Rack pared 12U', category: 'rack', unit: 'ud', cost_price: 120.00, sell_price: 190.00, stock: 1, min_stock: 1 },
        ];

        const { error } = await supabase.from('materials').insert(materialsData);
        if (error) throw error;
        revalidate();
        return { success: true, count: materialsData.length };
    } catch (error: any) {
        console.error('Failed to seed materials:', error);
        return { success: false, error: error.message };
    }
}

// ═══════════════════════════════════
// CRM 2.0 — ACTIVITIES
// ═══════════════════════════════════

export async function addActivity(data: {
    type: string;
    description: string;
    entity_type: string;
    entity_id: string;
    metadata?: Record<string, unknown>;
}) {
    try {
        const supabase = getSupabase();
        const { error } = await supabase.from('activities').insert({
            type: data.type,
            description: data.description,
            entity_type: data.entity_type,
            entity_id: data.entity_id,
            metadata: data.metadata || {},
        });
        if (error) throw error;
        revalidate();
        return { success: true };
    } catch (error: any) {
        console.error('Failed to add activity:', error);
        return { success: false, error: error.message };
    }
}

export async function getActivities(entityType: string, entityId: string) {
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('activities')
            .select('*')
            .eq('entity_type', entityType)
            .eq('entity_id', entityId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error: any) {
        return { success: false, data: [], error: error.message };
    }
}

// ═══════════════════════════════════
// CRM 2.0 — TASKS
// ═══════════════════════════════════

export async function addTask(data: {
    title: string;
    description?: string;
    priority?: string;
    due_date?: string;
    entity_type?: string;
    entity_id?: string;
}) {
    try {
        const supabase = getSupabase();
        const { error } = await supabase.from('tasks').insert({
            title: data.title,
            description: data.description || null,
            priority: data.priority || 'medium',
            due_date: data.due_date || null,
            entity_type: data.entity_type || null,
            entity_id: data.entity_id || null,
            status: 'pending',
        });
        if (error) throw error;
        revalidate();
        return { success: true };
    } catch (error: any) {
        console.error('Failed to add task:', error);
        return { success: false, error: error.message };
    }
}

export async function updateTaskStatus(id: string, status: string) {
    try {
        const supabase = getSupabase();
        const { error } = await supabase
            .from('tasks')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id);
        if (error) throw error;
        revalidate();
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateTask(id: string, data: {
    title?: string;
    description?: string;
    priority?: string;
    due_date?: string | null;
    status?: string;
}) {
    try {
        const supabase = getSupabase();
        const { error } = await supabase
            .from('tasks')
            .update({ ...data, updated_at: new Date().toISOString() })
            .eq('id', id);
        if (error) throw error;
        revalidate();
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteTask(id: string) {
    try {
        const supabase = getSupabase();
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) throw error;
        revalidate();
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getTasks(entityType?: string, entityId?: string) {
    try {
        const supabase = getSupabase();
        let query = supabase.from('tasks').select('*').order('due_date', { ascending: true });
        if (entityType && entityId) {
            query = query.eq('entity_type', entityType).eq('entity_id', entityId);
        }
        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error: any) {
        return { success: false, data: [], error: error.message };
    }
}

export async function getAllTasks() {
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .neq('status', 'done')
            .order('due_date', { ascending: true, nullsFirst: false });
        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error: any) {
        return { success: false, data: [], error: error.message };
    }
}

// ═══════════════════════════════════
// CRM 2.0 — PIPELINE & LEADS
// ═══════════════════════════════════

export async function updateLeadPipelineStage(id: string, stage: string) {
    try {
        const supabase = getSupabase();
        const { error } = await supabase
            .from('leads')
            .update({ pipeline_stage: stage, status: stage })
            .eq('id', id);
        if (error) throw error;

        // Log activity
        await supabase.from('activities').insert({
            type: 'status_change',
            description: `Etapa cambiada a: ${stage}`,
            entity_type: 'lead',
            entity_id: id,
        });

        revalidate();
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateLeadFollowup(id: string, date: string | null) {
    try {
        const supabase = getSupabase();
        const { error } = await supabase
            .from('leads')
            .update({ next_followup: date })
            .eq('id', id);
        if (error) throw error;
        revalidate();
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateLeadValue(id: string, value: number) {
    try {
        const supabase = getSupabase();
        const { error } = await supabase
            .from('leads')
            .update({ estimated_value: value })
            .eq('id', id);
        if (error) throw error;
        revalidate();
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ═══════════════════════════════════
// CRM 2.0 — PROJECT DETAIL
// ═══════════════════════════════════

export async function getProjectDetail(id: string) {
    try {
        const supabase = getSupabase();

        const [projectRes, activitiesRes, tasksRes] = await Promise.all([
            supabase.from('projects').select('*, quotes(*)').eq('id', id).single(),
            supabase.from('activities').select('*').eq('entity_type', 'project').eq('entity_id', id).order('created_at', { ascending: false }),
            supabase.from('tasks').select('*').eq('entity_type', 'project').eq('entity_id', id).order('due_date', { ascending: true }),
        ]);

        if (projectRes.error) throw projectRes.error;

        return {
            success: true,
            project: projectRes.data,
            activities: activitiesRes.data || [],
            tasks: tasksRes.data || [],
        };
    } catch (error: any) {
        return { success: false, project: null, activities: [], tasks: [], error: error.message };
    }
}

export async function updateProjectStatus(id: string, status: string) {
    try {
        const supabase = getSupabase();
        const { error } = await supabase.from('projects').update({ status }).eq('id', id);
        if (error) throw error;

        await supabase.from('activities').insert({
            type: 'status_change',
            description: `Estado del proyecto cambiado a: ${status}`,
            entity_type: 'project',
            entity_id: id,
        });

        revalidate();
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateProjectInfo(id: string, data: {
    client_name?: string;
    client_phone?: string;
    client_email?: string;
    address?: string;
    notes?: string;
    start_date?: string;
    end_date?: string;
}) {
    try {
        const supabase = getSupabase();
        const { error } = await supabase.from('projects').update(data).eq('id', id);
        if (error) throw error;
        revalidate();
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// CRM 3.0 - locations, quarterly tax, gastos

// CRM 3.0
