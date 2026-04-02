import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
    try {
        const stripeKey = (process.env.STRIPE_SECRET_KEY || '').trim();
        if (!stripeKey) {
            return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
        }

        const stripe = new Stripe(stripeKey);
        const body = await req.text();

        // For now, without signature validation (add STRIPE_WEBHOOK_SECRET later)
        const event = JSON.parse(body) as Stripe.Event;

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const projectId = session.metadata?.projectId;
            const paymentType = session.metadata?.paymentType as 'advance' | 'final';
            const clientName = session.metadata?.clientName || '';

            if (projectId) {
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
                const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
                const supabase = createClient(supabaseUrl, supabaseKey);

                const updateData: Record<string, unknown> = {};

                if (paymentType === 'advance') {
                    updateData.payment_stage = 'advance_paid';
                    updateData.advance_paid_at = new Date().toISOString();
                    updateData.payment_status = 'partial';
                } else if (paymentType === 'final') {
                    updateData.payment_stage = 'final_paid';
                    updateData.final_paid_at = new Date().toISOString();
                    updateData.payment_status = 'paid';
                    updateData.payment_date = new Date().toISOString().split('T')[0];
                }

                if (Object.keys(updateData).length > 0) {
                    await supabase.from('projects').update(updateData).eq('id', projectId);
                }

                // Telegram notification
                const telegramToken = process.env.TELEGRAM_BOT_TOKEN || '';
                const telegramChat = process.env.TELEGRAM_CHAT_ID || '';
                if (telegramToken && telegramChat) {
                    const amount = ((session.amount_total || 0) / 100).toFixed(2);
                    const label = paymentType === 'advance' ? 'Anticipo' : 'Pago Final';
                    const emoji = paymentType === 'final' ? '🎉' : '💰';
                    const tgMsg = `${emoji} <b>Pago recibido — ${label}</b>\n\n👤 ${clientName}\n💶 ${amount}€\n📋 Proyecto: ${projectId.slice(0, 8)}`;
                    await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ chat_id: telegramChat, text: tgMsg, parse_mode: 'HTML' }),
                    }).catch(() => {});
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: unknown) {
        console.error('Stripe webhook error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
