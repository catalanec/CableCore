/* ═══════════════════════════════════
   Supabase Database Types
   ═══════════════════════════════════ */

export interface Quote {
    id?: string;
    created_at?: string;
    updated_at?: string;
    status: 'pending' | 'sent' | 'accepted' | 'rejected' | 'completed';

    // Client
    client_name: string;
    client_phone: string;
    client_email: string;
    client_address?: string;

    // Installation details
    cable_type: string;
    cable_meters: number;
    network_points: number;
    installation_type: string;
    installation_meters: number;

    // Materials
    canaleta_meters: number;
    tubo_corrugado_meters: number;
    regata_meters: number;

    // Additional work
    switch_install: boolean;
    router_install: boolean;
    network_config: boolean;
    patch_panel_install: boolean;

    // Rack
    rack_type: string;

    // Urgency
    urgency: string;

    // Pricing
    cable_cost: number;
    points_cost: number;
    installation_cost: number;
    materials_cost: number;
    work_cost: number;
    rack_cost: number;
    subtotal: number;
    urgency_multiplier: number;
    iva: number;
    total: number;

    // Notes
    notes?: string;
    internal_notes?: string;
}

export interface Lead {
    id?: string;
    created_at?: string;
    name: string;
    phone: string;
    email: string;
    service?: string;
    message?: string;
    source: 'contact_form' | 'calculator' | 'whatsapp' | 'phone' | 'manual';
    status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
    quote_id?: string;
    notes?: string;
}

export interface Material {
    id?: string;
    name: string;
    category: string;
    unit: string;
    cost_price: number;
    sell_price: number;
    stock: number;
    min_stock: number;
}

export interface Project {
    id?: string;
    created_at?: string;
    quote_id?: string;
    lead_id?: string;
    client_name: string;
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
    start_date?: string;
    end_date?: string;
    total_revenue: number;
    total_cost: number;
    profit: number;
    notes?: string;
}
