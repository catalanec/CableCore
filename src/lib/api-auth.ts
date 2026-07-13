import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';

// Plain `===`/`!==` on credentials leaks timing information proportional to
// how many leading characters match, letting an attacker recover the
// password byte-by-byte over many requests. timingSafeEqual compares in
// constant time regardless of where the strings first differ.
function safeCompare(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
        // Still run a same-length comparison so the early return above
        // doesn't itself leak length via timing on a cheap short-circuit.
        timingSafeEqual(bufA, bufA);
        return false;
    }
    return timingSafeEqual(bufA, bufB);
}

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
    if (!safeCompare(user, adminUser) || !safeCompare(pwd, adminPass)) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    return null; // auth passed
}
