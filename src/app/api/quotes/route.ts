import { NextRequest, NextResponse } from 'next/server';
import { sendQuoteNotification } from '@/lib/email';
import { notifyNewQuote } from '@/lib/telegram';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        // Validate required fields
        if (!data.client_name || !data.client_phone || !data.client_email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Generate quote number
        const now = new Date();
        const quoteNumber = `CC-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${Math.floor(Math.random()*900+100)}`;

        // If Supabase is configured, save to database
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey) {
            const { createClient } = await import('@supabase/supabase-js');
            const supabase = createClient(supabaseUrl, supabaseKey);

            const { error } = await supabase.from('quotes').insert({
                client_name: data.client_name,
                client_phone: data.client_phone,
                client_email: data.client_email,
                client_address: data.client_address || null,
                cable_type: data.cableType,
                cable_meters: data.cableMeters,
                network_points: data.points,
                installation_type: data.installationType,
                installation_meters: data.installationMeters,
                canaleta_meters: data.canaleta || 0,
                tubo_corrugado_meters: data.tubo_corrugado || 0,
                regata_meters: data.regata || 0,
                switch_install: data.additionalWork?.switch || false,
                router_install: data.additionalWork?.router || false,
                network_config: data.additionalWork?.network_config || false,
                patch_panel_install: data.additionalWork?.patch_panel || false,
                rack_type: data.rack || 'none',
                urgency: data.urgency || 'normal',
                cable_cost: data.cablesCost,
                points_cost: data.pointsCost,
                installation_cost: data.installCost,
                materials_cost: data.materialsCost,
                work_cost: data.workCost,
                rack_cost: data.rackCost,
                subtotal: data.subtotal,
                urgency_multiplier: data.urgencyMultiplier,
                iva: data.iva,
                total: data.total,
                notes: data.notes || null,
                status: 'pending',
            });

            if (error) {
                console.error('Supabase error:', error);
                return NextResponse.json({ error: error.message || error.details || 'Database error', raw: error }, { status: 500 });
            }

            const { error: leadError } = await supabase.from('leads').insert({
                name: data.client_name,
                phone: data.client_phone,
                email: data.client_email,
                service: data.cableType,
                source: 'calculator',
                status: 'new',
            });
            if (leadError) {
                console.error('Supabase lead error:', leadError);
            }
        }

        // Send email notifications (admin + client)
        await sendQuoteNotification({
            clientName: data.client_name,
            clientPhone: data.client_phone,
            clientEmail: data.client_email,
            cableType: data.cableType,
            cableMeters: data.cableMeters,
            networkPoints: data.points,
            installationType: data.installationType,
            total: data.total,
            quoteNumber,
        });

        // Send Telegram notification (instant)
        await notifyNewQuote({
            clientName: data.client_name,
            clientPhone: data.client_phone,
            clientEmail: data.client_email,
            cableType: data.cableType,
            networkPoints: data.points,
            installationType: data.installationType,
            total: data.total,
            quoteNumber,
        });

        return NextResponse.json({ success: true, quoteNumber });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
