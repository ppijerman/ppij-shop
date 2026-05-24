import { db } from "../db"

export async function getAllOrders() {
  const res = await db.query("SELECT * FROM orders ORDER BY created_at DESC")
  return res.rows
}

export async function getOrdersByUser(userId: string) {
  const res = await db.query("SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC", [userId])
  return res.rows
}

export async function getOrderById(id: string) {
  const res = await db.query("SELECT * FROM orders WHERE id = $1", [id])
  return res.rows[0]
}

export async function getOrderItems(orderId: string) {
  const res = await db.query("SELECT * FROM order_items WHERE order_id = $1", [orderId])
  return res.rows
}
