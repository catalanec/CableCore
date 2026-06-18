import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { requireAdminAuth } from '@/lib/api-auth';

const ALLOWED_ORIGINS = ['https://cablecore.es', 'https://www.cablecore.es', 'http://localhost:3000'];

export async function POST(req: NextRequest) {
    const authError = requireAdminAuth(req);
    if (authError) return authError;

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

        // Validate amount server-side against project data when projectId is provided
        if (projectId) {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
            const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
            const { createClient } = await import('@supabase/supabase-js');
            const supabase = createClient(supabaseUrl, supabaseKey);
            const { data: project } = await supabase
                .from('projects')
                .select('total_amount')
                .eq('id', projectId)
                .single();

            if (!project) {
                return NextResponse.json({ error: 'Project not found' }, { status: 404 });
            }

            const projectTotal = Number(project.total_amount) || 0;
            const expectedAmount = projectTotal * 0.5; // both advance and final are 50%
            if (Math.abs(amount - expectedAmount) > expectedAmount * 0.02 + 1) {
                return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
            }
        }

        const origin = req.headers.get('origin');
        const safeOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : 'https://cablecore.es';
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
            success_url: `${safeOrigin}/es/admin?payment=success&project=${projectId || ''}&type=${type}`,
            cancel_url: `${safeOrigin}/es/admin?payment=cancelled`,
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
