'use server';

import { db } from '../db';
import { requireAdmin } from '../auth';

export async function updateOrderStatusAction(orderId: string, status: string) {
  await requireAdmin();

  await db.query(
    `UPDATE orders SET status = $2 WHERE id = $1`,
    [orderId, status]
  );
}