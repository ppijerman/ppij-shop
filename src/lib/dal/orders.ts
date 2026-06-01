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
  o.shipping_provider,
  o.pickup_details,
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
  const res = await db.query(
    `
    SELECT 
      oi.*,
      pv.size,
      pv.color_name,
      pv.fit_type,
      b.name as bundle_name,
      (
        SELECT json_agg(json_build_object(
          'product_name', p.name,
          'size', trim(pv.size),
          'color', pv.color_name,
          'fit', pv.fit_type
        ))
        FROM bundle_items bi
        JOIN product_variants pv ON bi.variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        WHERE bi.bundle_id = oi.bundle_id
      ) as bundle_products
    FROM order_items oi
    LEFT JOIN product_variants pv ON oi.variant_id = pv.id
    LEFT JOIN bundles b ON oi.bundle_id = b.id
    WHERE oi.order_id = $1
    `, 
    [orderId]
  )
  return res.rows
}
