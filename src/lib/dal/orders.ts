import { db } from "../db"

const ORDER_COLUMNS = `
  o.id,
  o.user_id,
  o.status,
  o.total_price,
  o.delivery_address,
  o.delivery_type,
  o.payment_proof_url,
  o.payment_proof_content_type,
  o.shipping_tracking_number,
  o.created_at,
  o.updated_at,
  o.payment_method
`;

export async function getAllOrders() {
  const res = await db.query(
    `
    SELECT
      ${ORDER_COLUMNS},
      u.first_name,
      u.last_name,
      u.email
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    ORDER BY o.created_at DESC
    `
  )
  return res.rows
}

export async function getOrdersByUser(userId: string) {
  const res = await db.query(
    `
    SELECT ${ORDER_COLUMNS}
    FROM orders o
    WHERE o.user_id = $1
    ORDER BY o.created_at DESC
    `,
    [userId],
  )
  return res.rows
}

export async function getOrderById(id: string) {
  const res = await db.query(
    `
    SELECT ${ORDER_COLUMNS}
    FROM orders o
    WHERE o.id = $1
    `,
    [id],
  )
  return res.rows[0]
}

export async function getOrderByIdForUser(id: string, userId: string) {
  const res = await db.query(
    `
    SELECT ${ORDER_COLUMNS}
    FROM orders o
    WHERE o.id = $1 AND o.user_id = $2
    `,
    [id, userId]
  )
  return res.rows[0]
}

export async function getOrderItems(orderId: string) {
  const res = await db.query("SELECT * FROM order_items WHERE order_id = $1", [orderId])
  return res.rows
}
