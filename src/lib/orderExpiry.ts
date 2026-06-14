import { db, withTransaction } from '@/lib/db';
import { SendOrderExpiredEmail } from '@/lib/actions/send-order-email';

const PAYMENT_WINDOW_MINUTES = 30;
export const PAYMENT_WINDOW_LABEL = '30 minutes';

type QueryFn = (text: string, values?: any[]) => Promise<any>;

type ExpireOptions = {
  orderId?: string;
  userId?: string;
};

export function getPaymentExpiresAtExpression() {
  return `NOW() + INTERVAL '${PAYMENT_WINDOW_MINUTES} minutes'`;
}

export async function expireOverdueAwaitingPaymentOrders(
  query: QueryFn,
  options: ExpireOptions = {},
): Promise<string[]> {
  const filters = [`status = 'AWAITING_PAYMENT'`, 'payment_expires_at IS NOT NULL', 'payment_expires_at <= NOW()'];
  const values: string[] = [];

  if (options.orderId) {
    values.push(options.orderId);
    filters.push(`id = $${values.length}`);
  }

  if (options.userId) {
    values.push(options.userId);
    filters.push(`user_id = $${values.length}`);
  }

  const expiredResult = await query(
    `
    UPDATE orders
    SET status = 'CANCELLED'
    WHERE ${filters.join(' AND ')}
    RETURNING id
    `,
    values,
  );
  const expiredOrderIds = expiredResult.rows.map((row: { id: string }) => row.id);

  if (expiredOrderIds.length === 0) {
    return [];
  }

  const restockResult = await query(
    `
    SELECT variant_id, SUM(quantity)::integer AS quantity
    FROM (
      SELECT oi.variant_id, oi.quantity
      FROM order_items oi
      WHERE oi.order_id = ANY($1::uuid[])
        AND oi.variant_id IS NOT NULL

      UNION ALL

      SELECT unnest(oi.selected_variant_ids) AS variant_id, oi.quantity
      FROM order_items oi
      WHERE oi.order_id = ANY($1::uuid[])
        AND oi.bundle_id IS NOT NULL
        AND cardinality(oi.selected_variant_ids) > 0

      UNION ALL

      SELECT bi.variant_id, oi.quantity
      FROM order_items oi
      JOIN bundle_items bi ON bi.bundle_id = oi.bundle_id
      WHERE oi.order_id = ANY($1::uuid[])
        AND oi.bundle_id IS NOT NULL
        AND (oi.selected_variant_ids IS NULL OR cardinality(oi.selected_variant_ids) = 0)
    ) reserved_items
    GROUP BY variant_id
    `,
    [expiredOrderIds],
  );

  for (const item of restockResult.rows as { variant_id: string; quantity: number }[]) {
    await query(
      `UPDATE product_variants SET stock = stock + $2 WHERE id = $1`,
      [item.variant_id, item.quantity],
    );
  }

  await query(
    `
    INSERT INTO order_status_logs (order_id, status, note, changed_by_user_id)
    SELECT unnest($1::uuid[]), 'CANCELLED'::order_status, $2, NULL
    `,
    [expiredOrderIds, `Payment window expired after ${PAYMENT_WINDOW_LABEL}. Order cancelled automatically.`],
  );

  return expiredOrderIds;
}

export async function expireOverdueAwaitingPaymentOrdersNow(options: ExpireOptions = {}) {
  const expiredOrderIds = await withTransaction((query) => expireOverdueAwaitingPaymentOrders(query, options));

  if (expiredOrderIds.length > 0) {
    const buyerResult = await db.query(
      `SELECT o.id AS order_id, u.email, u.first_name
       FROM orders o JOIN users u ON u.id = o.user_id
       WHERE o.id = ANY($1::uuid[])`,
      [expiredOrderIds],
    );
    for (const buyer of buyerResult.rows as { order_id: string; email: string; first_name: string }[]) {
      try {
        await SendOrderExpiredEmail({
          to: buyer.email,
          customerName: buyer.first_name,
          orderId: buyer.order_id,
        });
      } catch (err) {
        console.error(`Failed to send order cancelled email for order ${buyer.order_id}:`, err);
      }
    }
  }

  return expiredOrderIds;
}
