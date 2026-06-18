import { NextRequest, NextResponse } from 'next/server';

export function requireAdminAuth(req: NextRequest): NextResponse | null {
    const basicAuth = req.headers.get('authorization');
    const adminUser = process.env.ADMIN_USER;
    const adminPass = process.env.ADMIN_PASSWORD;

    if (!adminUser || !adminPass) {
        return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    if (!basicAuth) {
        return new NextResponse('Authentication required', {
            status: 401,
            headers: { 'WWW-Authenticate': 'Basic realm="Admin API"' },
        });
    }

    const [user, pwd] = atob(basicAuth.split(' ')[1]).split(':');
    if (user !== adminUser || pwd !== adminPass) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    return null; // auth passed
}
