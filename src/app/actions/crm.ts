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

export async function updateLeadStatus(id: string, newStatus: string) {
    try {
        const supabase = getSupabase();
        const { error } = await supabase
            .from('leads')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) throw error;
        
        // Revalidate admin page so the UI updates
        revalidatePath('/[locale]/admin', 'page');
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
        
        revalidatePath('/[locale]/admin', 'page');
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
        
        revalidatePath('/[locale]/admin', 'page');
        return { success: true };
    } catch (error: any) {
        console.error('Failed to update material stock:', error);
        return { success: false, error: error.message };
    }
}
