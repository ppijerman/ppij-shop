import { db } from '../db'

export async function getVariant(productId: string, size: string, colorName: string) {
  const res = await db.query(
    `
    SELECT * FROM product_variants
    WHERE product_id = $1 AND size = $2 AND color_name = $3
    ORDER BY size ASC
    `,
    [productId, size, colorName]
  )
  return res.rows
}

export async function getVariantsById(variantId: string) {
  const res = await db.query(
    `
    SELECT * FROM product_variants
    WHERE id = $1
    `,
    [variantId]
  )
  return res.rows
}

export async function getVariantsByProductId(productId: string) {
  const res = await db.query(
    `
    SELECT * FROM product_variants
    WHERE product_id = $1
    ORDER BY size ASC
    `,
    [productId]
  )
  return res.rows
}


export async function getSizesById(productId: string): Promise<string | null> {
 const res = await db.query(
  `
  SELECT size FROM product_variants
  WHERE product_id = $1
  `,
  [productId]
 )
 return res.rows[0]?.size
}

export async function getSizesForColor(productId: string, colorName: string): Promise<string[] | null> {
  const res = await db.query(
    `
    SELECT size FROM product_variants
    WHERE product_id = $1 AND color_name = $2
    `,
    [productId, colorName]
  )
  return res.rows.map(row => row.size.trim())
}

export async function getProductColors(productId: string): Promise<{name: string; hex: string}[]> {
  const res = await db.query(
    `
    SELECT DISTINCT color_name, color_hex FROM product_variants
    WHERE product_id = $1
    `,
    [productId]
  )
  return res.rows
}

export async function getProductBasePrice(productId: string): Promise<number> {
  const res = await db.query(
    `
    SELECT price FROM product_variants
    WHERE product_id = $1
    `,
    [productId]
  )
  return res.rows[0]?.price || 0
}

export async function getProductOriginalPrice(productId: string): Promise<number> {
  const res = await db.query(
    `
    SELECT original_price FROM product_variants
    WHERE product_id = $1
    `,
    [productId]
  )
  return res.rows[0]?.original_price || 0
}

export async function getProductStock(productId: string, size: string, colorName: string): Promise<number> {
  const res = await db.query(
    `
    SELECT stock FROM product_variants
    WHERE product_id = $1 AND size = $2 AND color_name = $3
    `,
    [productId, size, colorName]
  )
  return res.rows[0]?.stock || 0
}