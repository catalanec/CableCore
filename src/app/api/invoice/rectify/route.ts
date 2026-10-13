import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/api-auth';
import { createAdminClient } from '@/lib/supabase-admin';

/**
 * Emite la factura rectificativa (serie R) de una factura existente.
 *
 * Idempotente: una factura sólo se rectifica una vez (índice único en
 * invoice_id). Repetir la petición devuelve la rectificativa ya emitida en vez
 * de gastar otro número de la serie.
 */
export async function POST(request: NextRequest) {
    const authError = requireAdminAuth(request);
    if (authError) return authError;

    try {
        const body = await request.json().catch(() => ({}));
        const invoiceId = typeof body.invoice_id === 'string' ? body.invoice_id : '';
        const reason = typeof body.reason === 'string' ? body.reason.trim().slice(0, 200) : '';
        const issueDate = typeof body.issue_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.issue_date)
            ? body.issue_date
            : new Date().toISOString().slice(0, 10);

        if (!invoiceId) return NextResponse.json({ error: 'invoice_id es obligatorio' }, { status: 400 });
        if (!reason) return NextResponse.json({ error: 'El motivo es obligatorio' }, { status: 400 });

        const supabase = createAdminClient();

        const { data: invoice, error: invError } = await supabase
            .from('invoices').select('id').eq('id', invoiceId).maybeSingle();
        if (invError) {
            console.error('[rectify] invoice lookup failed', invError);
            return NextResponse.json({ error: 'Error de base de datos' }, { status: 500 });
        }
        if (!invoice) return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });

        const { data: existing } = await supabase
            .from('invoice_rectifications').select('*').eq('invoice_id', invoiceId).maybeSingle();
        if (existing) return NextResponse.json({ success: true, rectification: existing, alreadyExisted: true });

        const { data: created, error } = await supabase
            .from('invoice_rectifications')
            .insert({ invoice_id: invoiceId, reason, issue_date: issueDate })
            .select('*').single();

        if (error) {
            // Otra petición la emitió a la vez: devolver la que quedó.
            if (error.code === '23505') {
                const { data: again } = await supabase
                    .from('invoice_rectifications').select('*').eq('invoice_id', invoiceId).maybeSingle();
                if (again) return NextResponse.json({ success: true, rectification: again, alreadyExisted: true });
            }
            console.error('[rectify] insert failed', error);
            return NextResponse.json({ error: 'Error al emitir la rectificativa' }, { status: 500 });
        }

        return NextResponse.json({ success: true, rectification: created });
    } catch (e) {
        console.error('[rectify] server error', e);
        return NextResponse.json({ error: 'Error de servidor' }, { status: 500 });
    }
}
