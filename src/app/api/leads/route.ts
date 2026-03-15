import { NextRequest, NextResponse } from 'next/server';
import { sendLeadNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        if (!data.name || !data.phone || !data.email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey) {
            const { createClient } = await import('@supabase/supabase-js');
            const supabase = createClient(supabaseUrl, supabaseKey);

            const { error } = await supabase.from('leads').insert({
                name: data.name,
                phone: data.phone,
                email: data.email,
                service: data.service || null,
                message: data.message || null,
                source: data.source || 'contact_form',
                status: 'new',
            });

            if (error) {
                console.error('Supabase error:', error);
                return NextResponse.json({ error: 'Database error' }, { status: 500 });
            }
        }

        // Send email notification to admin
        await sendLeadNotification({
            name: data.name,
            phone: data.phone,
            email: data.email,
            service: data.service,
            message: data.message,
            source: data.source || 'contact_form',
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
