import { ProductCategory } from "@/types";
import { db } from "../db"

export async function getAllProducts() {
  const res = await db.query(
    "SELECT * FROM products WHERE is_active = true"
  )
  return res.rows;
}

export async function getProductById(id: string) {
  const res = await db.query(
    `
    SELECT * FROM products p
    WHERE p.id = $1
    `,
    [id]
  )
  return res.rows[0] || null
}

export async function getProductBySlug(slug: string) {
  const res = await db.query(
    `
    SELECT * FROM products p
    WHERE p.slug = $1
    `,
    [slug]
  )
  return res.rows[0] || null
}

export async function getProductByCategory(category: ProductCategory) {
  const res = await db.query(
    `
      SELECT * FROM products p
      WHERE p.category = $1 AND is_active = true
    `,
    [category]
  )
  return res.rows
}

export async function getProductPrimaryImage(id: string) {
  const res = await db.query(
    `
      SELECT primary_image FROM products p
      WHERE p.id = $1
    `,
    [id]
  )
  return res.rows[0]?.primary_image || null
}

export async function getProductImages(productId: string) {
  const res = await db.query(
    `
      SELECT * FROM product_images
      WHERE product_id = $1
    `,
    [productId]
  )
  return res.rows
}