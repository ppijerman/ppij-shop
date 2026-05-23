import { db } from '../db'

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