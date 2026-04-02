import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;

export async function POST(req: NextRequest) {
    try {
        if (!stripeKey) {
            return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
        }

        const stripe = new Stripe(stripeKey, { apiVersion: '2024-12-18.acacia' as any });
        const body = await req.json();
        const { amount, clientName, projectId, description } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        // Create a Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: `CableCore — ${description || 'Servicio de instalación'}`,
                            description: clientName ? `Cliente: ${clientName}` : undefined,
                        },
                        unit_amount: Math.round(amount * 100), // Stripe uses cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${req.nextUrl.origin}/es/admin?payment=success&project=${projectId || ''}`,
            cancel_url: `${req.nextUrl.origin}/es/admin?payment=cancelled`,
            metadata: {
                projectId: projectId || '',
                clientName: clientName || '',
            },
        });

        return NextResponse.json({ url: session.url, sessionId: session.id });
    } catch (error: any) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
