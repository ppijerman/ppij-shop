import { db } from "../db"

export async function getAllBundles() {
  const res = await db.query("SELECT * FROM bundles")
  return res.rows
}

export async function getBundleById(id: string) {
  const res = await db.query("SELECT * FROM bundles WHERE id = $1", [id])
  return res.rows[0]
}

export async function getBundleBySlug(slug: string) {
  const res = await db.query("SELECT * FROM bundles WHERE slug = $1", [slug])
  return res.rows[0]
}
