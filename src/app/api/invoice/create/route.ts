import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        if (!data.razon_social || !data.cif) {
            return NextResponse.json({ error: 'Razón Social y CIF son obligatorios' }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 });
        }

        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Insert the invoice
        const { data: invoiceData, error } = await supabase.from('invoices').insert({
            quote_id: data.quote_id || null,
            razon_social: data.razon_social,
            cif: data.cif,
            address: data.address || null,
            email: data.email || null,
            phone: data.phone || null,
            total_data: data.total_data || {}
        }).select('invoice_number').single();

        if (error) {
            console.error('Supabase error inserting invoice:', error);
            return NextResponse.json({ error: 'Database error creating invoice' }, { status: 500 });
        }

        // Optional: Update quote status to 'invoiced'
        if (data.quote_id) {
            await supabase.from('quotes').update({ is_invoiced: true, status: 'approved' }).eq('id', data.quote_id);
        }

        return NextResponse.json({ success: true, invoice_number: invoiceData.invoice_number });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
