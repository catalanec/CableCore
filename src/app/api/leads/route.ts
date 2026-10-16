import { NextRequest, NextResponse } from 'next/server';
import { clientIp, rateLimit, FORM_LIMIT, FORM_WINDOW_MS } from '@/lib/rate-limit';
import { sendLeadNotification } from '@/lib/email';
import { notifyNewLead } from '@/lib/telegram';

export async function POST(request: NextRequest) {
    if (!rateLimit(`leads:${clientIp(request.headers)}`, FORM_LIMIT, FORM_WINDOW_MS)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    try {
        const data = await request.json();

        // Cap free-text sizes: these fields end up in e-mails, Telegram and the CRM.
        const tooLong = Object.values(data ?? {}).some(
            (v) => typeof v === 'string' && v.length > 5000,
        );
        if (tooLong) {
            return NextResponse.json({ error: 'Field too long' }, { status: 400 });
        }

        // Honeypot: a hidden field real users never fill in. Bots that
        // blindly fill every input trip it — pretend success so they don't
        // learn to skip the field, but never write or notify anything.
        if (data.website) {
            return NextResponse.json({ success: true });
        }

        if (!data.name || !data.phone || !data.email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

        // Send Telegram notification (instant)
        const notified = await notifyNewLead({
            name: data.name,
            phone: data.phone,
            email: data.email,
            service: data.service,
            message: data.message,
            source: data.source || 'contact_form',
        });
        if (!notified) {
            console.error('[lead] saved but Telegram notification failed');
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
