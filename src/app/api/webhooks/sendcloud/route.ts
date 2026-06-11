import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SendOrderShippedEmail } from '@/lib/actions/send-order-email';
import crypto from 'crypto';

function verifySignature(body: string, signature: string): boolean {
    const secret = process.env.SENDCLOUD_WEBHOOK_SECRET;
    if (!secret) return false;
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
    const expectedBuf = Buffer.from(expected);
    const signatureBuf = Buffer.from(signature);
    if (expectedBuf.length !== signatureBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, signatureBuf);
}

function toOrderStatus(parcelStatus: { code?: string } | undefined): string | null {
    if (['IN_TRANSIT', 'AT_SORTING_CENTER', 'DELIVERY_ATTEMPT', 'OUT_FOR_DELIVERY'].includes(parcelStatus?.code ?? '')) return 'SHIPPED';
    if (parcelStatus?.code === 'DELIVERED') return 'DONE';
    return null;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    const rawBody = await req.text();
    const signature = req.headers.get('sendcloud-signature') ?? '';

    if (!verifySignature(rawBody, signature)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    let payload: any;
    try {
        payload = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: 'Bad JSON' }, { status: 400 });
    }

    const parcel = payload?.parcel;
    if (!parcel) return NextResponse.json({ ok: true });

    const parcelId: number = parcel.id;
    const trackingNumber: string = parcel.tracking_number ?? '';
    const carrier: string = parcel.carrier?.code ?? parcel.carrier?.name ?? '';

    const newStatus = toOrderStatus(parcel.status);
    if (!newStatus) return NextResponse.json({ ok: true });

    const orderRes = await db.query(
        `
        SELECT o.id, o.status, u.email, u.first_name
        FROM orders o JOIN users u ON u.id = o.user_id
        WHERE o.sendcloud_parcel_id = $1
        `,
        [parcelId]
    );
    const order = orderRes.rows[0];
    if (!order) return NextResponse.json({ ok: true });

    const STATUS_ORDER = ['AWAITING_PAYMENT', 'PAYMENT_REVIEW', 'PROCESSING', 'SHIPPED', 'DONE', 'CANCELLED'];
    if (STATUS_ORDER.indexOf(newStatus) <= STATUS_ORDER.indexOf(order.status)) {
        return NextResponse.json({ ok: true });
    }

    await db.query(
        `
        UPDATE orders
        SET status = $2::order_status,
            shipping_tracking_number = COALESCE(shipping_tracking_number, $3),
            shipping_provider = COALESCE(shipping_provider, $4)
        WHERE id = $1
        `,
        [order.id, newStatus, trackingNumber, carrier.toUpperCase()]
    )

    await db.query(
        `
        INSERT INTO order_status_logs (order_id, status, note, changed_by_user_id)
        VALUES ($1, $2::order_status, $3, NULL)
        `,
        [order.id, newStatus, `SendCloud status update: ${parcel.status?.message ?? parcel.status?.code ?? ''}`]
    )

    if (newStatus === 'SHIPPED' && order.email) {
        await SendOrderShippedEmail({
            to: order.email,
            customerName: order.first_name,
            orderId: order.id,
            trackingNumber,
            shippingProvider: carrier.toUpperCase(),
        }).catch((err) => console.error('Failed to send shipped email: ', err));
    }

    return NextResponse.json({ ok: true });
}