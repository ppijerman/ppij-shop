import { db } from "../db"

export async function getAllBundles() {
  const res = await db.query("SELECT * FROM bundles")
  return res.rows
}

export async function getBundleById(id: string) {
  const res = await db.query(
    `
    SELECT
      b.*, COALESCE(
        json_agg(
          json_build_object(
            'variant_id', bi.variant_id
          )
        ) FILTER (WHERE bi.variant_id IS NOT NULL),
        '[]'
      ) AS items
    FROM bundles b
    LEFT JOIN bundle_items bi ON bi.bundle_id = b.id
    WHERE b.id = $1
    GROUP BY b.id
    `,
    [id]
  );
  return res.rows[0]
}

export async function getBundleBySlug(slug: string) {
  const res = await db.query(
    `
    SELECT 
      b.*,
      (
        SELECT json_agg(json_build_object(
          'id', p.id,
          'name', p.name,
          'subtitle', p.subtitle,
          'category', p.category,
          'primary_image', p.primary_image,
          'images', (
            SELECT json_agg(json_build_object('url', CASE WHEN pimg.url IS NOT NULL THEN pimg.url ELSE '/api/products/images/' || pimg.id::text END, 'is_primary', pimg.is_primary))
            FROM product_images pimg WHERE pimg.product_id = p.id
          ),
          'variants', (
            SELECT json_agg(json_build_object(
              'id', pv.id,
              'size', trim(pv.size),
              'stock', pv.stock,
              'fit_type', pv.fit_type,
              'price', pv.price::float,
              'color_name', pv.color_name,
              'color_hex', pv.color_hex
            ))
            FROM product_variants pv WHERE pv.product_id = p.id
          )
        ))
        FROM (
          SELECT DISTINCT p.id, p.name, p.subtitle, p.category, pi.url AS primary_image
          FROM bundle_items bi
          JOIN product_variants pv ON bi.variant_id = pv.id
          JOIN products p ON pv.product_id = p.id
          LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
          WHERE bi.bundle_id = b.id
        ) p
      ) AS products
      FROM bundles b
      WHERE b.slug = $1
    `,
    [slug]
  )
  return res.rows[0] || null
}

export async function getAllBundleItems() {
  const res = await db.query(
    `
    SELECT DISTINCT
      bi.bundle_id,
      p.id,
      p.name
    FROM bundle_items bi
    JOIN product_variants pv ON bi.variant_id = pv.id
    JOIN products p ON pv.product_id = p.id
    `
  );
  return res.rows;
}