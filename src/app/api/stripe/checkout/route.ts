import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
    try {
        const stripeKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeKey) {
            return NextResponse.json({ error: 'Stripe not configured — STRIPE_SECRET_KEY missing' }, { status: 500 });
        }

        // Stripe v21 — pass key directly, no apiVersion needed
        const stripe = new Stripe(stripeKey);
        const body = await req.json();
        const { amount, clientName, projectId, description } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        const origin = req.headers.get('origin') || req.nextUrl.origin;

        // Create a Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: `CableCore — ${description || 'Servicio de instalación'}`,
                            ...(clientName ? { description: `Cliente: ${clientName}` } : {}),
                        },
                        unit_amount: Math.round(amount * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/es/admin?payment=success&project=${projectId || ''}`,
            cancel_url: `${origin}/es/admin?payment=cancelled`,
            metadata: {
                projectId: projectId || '',
                clientName: clientName || '',
            },
        });

        return NextResponse.json({ url: session.url, sessionId: session.id });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to create checkout session';
        console.error('Stripe checkout error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
