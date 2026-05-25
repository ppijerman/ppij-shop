import { db } from "../db"

export async function getAllProducts() {
  const res = await db.query(
    "SELECT * FROM products WHERE is_active = true"
  )
  return res.rows;
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

export async function getProductBySlugWithVariants(slug: string) {
  const res = await db.query(
    `
    SELECT
      p.*,
      json_agg(json_build_object(
        'id', pv.id,
        'size', trim(pv.size),
        'stock', pv.stock,
        'price', pv.price::float,
        'original_price', pv.original_price::float,
        'color_name', pv.color_name,
        'color_hex', pv.color_hex,
        'sku', pv.sku
      )) FILTER (WHERE pv.id IS NOT NULL) AS variants
    FROM products p
    LEFT JOIN product_variants pv ON pv.product_id = p.id
    WHERE p.slug = $1
    GROUP BY p.id
    `,
    [slug]
  )
  return res.rows[0] || null
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

export async function getProductSlugById(id: string): Promise<string | null> {
  const res = await db.query(
    `SELECT slug FROM products WHERE id = $1`,
    [id]
  );
  return res.rows[0]?.slug || null;
}

export async function getAllProductsWithVariants() {
  const res = await db.query(
    `
    SELECT
      p.*,
      json_agg(json_build_object(
        'id', pv.id,
        'size', trim(pv.size),
        'stock', pv.stock,
        'price', pv.price::float,
        'original_price', pv.original_price::float,
        'color_name', pv.color_name,
        'color_hex', pv.color_hex,
        'sku', pv.sku
      )) FILTER (WHERE pv.id IS NOT NULL) AS variants
      FROM products p
      LEFT JOIN product_variants pv ON pv.product_id = p.id
      GROUP BY p.id
    `
  );
  return res.rows;
}