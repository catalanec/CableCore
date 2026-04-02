import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
    try {
        const stripeKey = (process.env.STRIPE_SECRET_KEY || '').trim();
        if (!stripeKey) {
            return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
        }

        const stripe = new Stripe(stripeKey);
        const body = await req.json();
        const { amount, clientName, projectId, description, paymentType } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        const origin = req.headers.get('origin') || req.nextUrl.origin;
        const type = paymentType === 'final' ? 'final' : 'advance';
        const label = type === 'advance' ? 'Anticipo (50%)' : 'Pago Final (50%)';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: `CableCore — ${label}`,
                            ...(description ? { description } : {}),
                        },
                        unit_amount: Math.round(amount * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/es/admin?payment=success&project=${projectId || ''}&type=${type}`,
            cancel_url: `${origin}/es/admin?payment=cancelled`,
            metadata: {
                projectId: projectId || '',
                clientName: clientName || '',
                paymentType: type,
            },
            customer_email: body.clientEmail || undefined,
        });

        return NextResponse.json({ url: session.url, sessionId: session.id });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to create checkout session';
        console.error('Stripe checkout error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
