'use server'

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Initialize superservice client that bypasses RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const getSupabase = () => {
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase credentials not configured');
    }
    return createClient(supabaseUrl, supabaseKey);
};

const revalidate = () => revalidatePath('/[locale]/admin', 'page');

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
