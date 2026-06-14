import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { expireOverdueAwaitingPaymentOrdersNow } from '@/lib/orderExpiry';

function verifySecret(provided: string): boolean {
    const secret = process.env.CRON_SECRET;
    if (!secret) return false;
    const a = Buffer.from(provided);
    const b = Buffer.from(secret);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    const secret = req.headers.get('x-cron-secret') ?? '';

    if (!verifySecret(secret)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const expired = await expireOverdueAwaitingPaymentOrdersNow();
        return NextResponse.json({ ok: true, expired: expired.length });
    } catch (err) {
        console.error('Cron expire-orders failed:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
