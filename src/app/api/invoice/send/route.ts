import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { generateInvoiceEmailHTML, generateInvoiceEmailSubject } from '@/lib/invoice-email';

export async function POST(req: NextRequest) {
    try {
        const resendKey = (process.env.RESEND_API_KEY || '').trim();
        const stripeKey = (process.env.STRIPE_SECRET_KEY || '').trim();
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

        if (!resendKey) {
            return NextResponse.json({ error: 'Resend API key not configured' }, { status: 500 });
        }
        if (!stripeKey) {
            return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
        }

        const resend = new Resend(resendKey);
        const stripe = new Stripe(stripeKey);
        const supabase = createClient(supabaseUrl, supabaseKey);

        const body = await req.json();
        const { projectId, paymentType, clientEmail: bodyEmail } = body;
        const type: 'advance' | 'final' = paymentType === 'final' ? 'final' : 'advance';

        if (!projectId) {
            return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
        }

        // 1. Fetch project
        const { data: project, error: projErr } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

        if (projErr || !project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // 2. Get client email — priority: body override > project > quote
        let clientEmail = bodyEmail || project.client_email;
        let clientName = project.client_name;
        let quoteNumber = project.quote_id ? project.quote_id.split('-')[0].toUpperCase() : 'N/A';
        let projectSummary = `Proyecto: ${clientName}`;

        if (project.quote_id) {
            const { data: quote } = await supabase
                .from('quotes')
                .select('*')
                .eq('id', project.quote_id)
                .single();

            if (quote) {
                clientEmail = clientEmail || quote.client_email;
                clientName = quote.client_name || clientName;
                quoteNumber = `CC-${quote.id.slice(0, 8).toUpperCase()}`;

                const cableInfo = quote.cable_type ? `Cableado ${quote.cable_type}` : '';
                const metersInfo = quote.cable_meters ? `${quote.cable_meters}m` : '';
                const pointsInfo = quote.network_points ? `${quote.network_points} puntos de red` : '';
                projectSummary = [cableInfo, metersInfo, pointsInfo].filter(Boolean).join(' · ');
            }
        }

        if (!clientEmail) {
            return NextResponse.json({ error: 'No client email found for this project' }, { status: 400 });
        }

        // 3. Calculate payment amount (50% of total)
        const totalRevenue = Number(project.total_revenue) || 0;
        const paymentAmount = Math.round(totalRevenue * 50) / 100; // 50%

        if (paymentAmount <= 0) {
            return NextResponse.json({ error: 'Invalid payment amount (project total is 0)' }, { status: 400 });
        }

        const origin = req.headers.get('origin') || req.nextUrl.origin;

        // 4. Create Stripe Checkout Session
        const label = type === 'advance' ? 'Anticipo (50%)' : 'Pago Final (50%)';
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: `CableCore — ${label}`,
                        description: `Cliente: ${clientName} · ${projectSummary}`,
                    },
                    unit_amount: Math.round(paymentAmount * 100),
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${origin}/es/admin?payment=success&project=${projectId}&type=${type}`,
            cancel_url: `${origin}/es/admin?payment=cancelled`,
            metadata: {
                projectId,
                clientName,
                paymentType: type,
            },
            customer_email: clientEmail,
        });

        if (!session.url) {
            return NextResponse.json({ error: 'Failed to create Stripe session' }, { status: 500 });
        }

        // 5. Generate email HTML
        const emailHTML = generateInvoiceEmailHTML({
            clientName,
            quoteNumber,
            projectSummary,
            totalAmount: totalRevenue,
            paymentAmount,
            paymentType: type,
            paymentUrl: session.url,
            // quoteViewUrl omitted intentionally — no standalone presupuesto page yet
        });

        const emailSubject = generateInvoiceEmailSubject({ paymentType: type, quoteNumber });

        const fromEmail = process.env.RESEND_FROM_EMAIL || 'CableCore <onboarding@resend.dev>';
        let emailSentOk = false;
        let emailId: string | undefined;
        let emailErrorMsg: string | undefined;
        try {
            const { data: emailResult, error: emailError } = await resend.emails.send({
                from: fromEmail,
                to: [clientEmail],
                subject: emailSubject,
                html: emailHTML,
            });

            if (emailError) {
                emailErrorMsg = JSON.stringify(emailError);
                console.error('Resend email error:', emailErrorMsg);
            } else {
                emailSentOk = true;
                emailId = emailResult?.id;
            }
        } catch (emailCatch: unknown) {
            emailErrorMsg = emailCatch instanceof Error ? emailCatch.message : String(emailCatch);
            console.error('Resend email exception:', emailErrorMsg);
        }

        // 7. Update project in Supabase
        const updateData: Record<string, unknown> = {
            client_email: clientEmail,
            payment_stage: type === 'advance' ? 'advance_sent' : 'final_sent',
        };
        if (type === 'advance') {
            updateData.advance_stripe_session = session.id;
        } else {
            updateData.final_stripe_session = session.id;
        }
        if (project.payment_status === 'pending' && type === 'advance') {
            updateData.payment_status = 'pending';
        }

        await supabase.from('projects').update(updateData).eq('id', projectId);

        // 8. Send Telegram notification
        const telegramToken = process.env.TELEGRAM_BOT_TOKEN || '';
        const telegramChat = process.env.TELEGRAM_CHAT_ID || '';
        if (telegramToken && telegramChat) {
            const tgMsg = `📧 <b>Invoice enviado</b>\n\n👤 ${clientName}\n📧 ${clientEmail}\n💰 ${label}: ${paymentAmount.toFixed(2)}€\n📋 ${quoteNumber}`;
            await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: telegramChat, text: tgMsg, parse_mode: 'HTML' }),
            }).catch(() => {});
        }

        return NextResponse.json({
            success: true,
            paymentUrl: session.url,
            sessionId: session.id,
            emailSent: emailSentOk,
            emailId,
            emailError: emailErrorMsg,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to send invoice';
        console.error('Invoice send error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
