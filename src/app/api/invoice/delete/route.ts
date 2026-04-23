import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
    try {
        const id = request.nextUrl.searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 });
        }

        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 1. Delete the invoice
        const { error } = await supabase.from('invoices').delete().eq('id', id);

        if (error) {
            console.error('Supabase error deleting invoice:', error);
            return NextResponse.json({ error: 'Database error deleting invoice' }, { status: 500 });
        }

        // 2. Reset sequence to MAX(invoice_number) remaining, or 20 if table is empty
        //    so next generated invoice = MAX + 1 (or 21 if empty)
        await supabase.rpc('reset_invoice_sequence');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
