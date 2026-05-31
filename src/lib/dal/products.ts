import { db } from "../db"

export async function getAllProducts() {
  const res = await db.query(
    `
    SELECT p.*, pi.url as primary_image
    FROM products p
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
    WHERE p.is_active = true
    `
  )
  return res.rows;
}

export async function getProductBySlug(slug: string) {
  const res = await db.query(
    `
    SELECT p.*, pi.url as primary_image
    FROM products p
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
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
      pi.url AS primary_image,
      (
        SELECT json_agg(json_build_object(
          'id', pv.id,
          'size', trim(pv.size),
          'stock', pv.stock,
          'fit_type', pv.fit_type,
          'price', pv.price::float,
          'original_price', pv.original_price::float,
          'color_name', pv.color_name,
          'color_hex', pv.color_hex,
          'sku', pv.sku
        ))
        FROM product_variants pv
        WHERE pv.product_id = p.id
      ) AS variants,
      (
        SELECT json_agg(json_build_object(
          'id', pimg.id,
          'url', pimg.url,
          'is_primary', pimg.is_primary
        ) ORDER BY pimg.is_primary DESC, pimg.id ASC)
        FROM product_images pimg
        WHERE pimg.product_id = p.id
      ) AS images
    FROM products p
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
    WHERE p.slug = $1
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
      ORDER BY is_primary DESC, id ASC
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
      pi.url AS primary_image,
      (
        SELECT json_agg(json_build_object(
          'id', pv.id,
          'size', trim(pv.size),
          'stock', pv.stock,
          'fit_type', pv.fit_type,
          'price', pv.price::float,
          'original_price', pv.original_price::float,
          'color_name', pv.color_name,
          'color_hex', pv.color_hex,
          'sku', pv.sku
        ))
        FROM product_variants pv
        WHERE pv.product_id = p.id
      ) AS variants,
      (
        SELECT json_agg(json_build_object(
          'id', pimg.id,
          'url', pimg.url,
          'is_primary', pimg.is_primary
        ) ORDER BY pimg.is_primary DESC, pimg.id ASC)
        FROM product_images pimg
        WHERE pimg.product_id = p.id
      ) AS images
    FROM products p
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
    WHERE p.is_active = true
    `
  );
  return res.rows;
}