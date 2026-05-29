import { db } from '@/lib/db';
import { getCurrentDbUserOrThrow } from '@/lib/users';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentDbUserOrThrow();
  const canReviewOrders = user.role === 'ADMIN_KK' || user.role === 'ADMIN_IT';

  const result = await db.query(
    `
    SELECT payment_proof_data, payment_proof_content_type
    FROM orders
    WHERE id = $1 AND ($2::boolean OR user_id = $3)
    LIMIT 1
    `,
    [id, canReviewOrders, user.id],
  );

  const order = result.rows[0];

  if (!order?.payment_proof_data || !order.payment_proof_content_type) {
    return new Response('Payment proof not found.', { status: 404 });
  }

  return new Response(new Uint8Array(order.payment_proof_data), {
    headers: {
      'Content-Type': order.payment_proof_content_type,
      'Content-Disposition': `inline; filename="payment-proof-${id.substring(0, 8)}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
