import { NextResponse } from 'next/server';
import { notifyStaleLeads } from '@/app/actions/crm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const CRON_SECRET = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');

    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await notifyStaleLeads();
    return NextResponse.json(result);
}
