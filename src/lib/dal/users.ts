import { db } from "../db"

export async function getAllUsers() {
  const res = await db.query("SELECT id, first_name, last_name, email, role, created_at FROM users")
  return res.rows
}
