import { withTransaction } from '@/lib/db';

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

      SELECT bi.variant_id, oi.quantity
      FROM order_items oi
      JOIN bundle_items bi ON bi.bundle_id = oi.bundle_id
      WHERE oi.order_id = ANY($1::uuid[])
        AND oi.bundle_id IS NOT NULL
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
  return withTransaction((query) => expireOverdueAwaitingPaymentOrders(query, options));
}
