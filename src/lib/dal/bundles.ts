import { db } from "../db"

export async function getAllBundles() {
  const res = await db.query(`
    SELECT
      b.id, b.name, b.price, b.original_price, b.slug, b."desc", b.sku, b.created_at, b.updated_at,
      CASE WHEN b.image_data IS NOT NULL THEN '/api/bundles/' || b.id::text || '/image?v=' || extract(epoch from b.updated_at)::bigint::text ELSE NULL END AS bundle_image_url,
      (
        SELECT json_agg(img_url)
        FROM (
          SELECT DISTINCT ON (p.id)
            CASE WHEN pi.url IS NOT NULL THEN pi.url ELSE '/api/products/images/' || pi.id::text END AS img_url
          FROM bundle_items bi
          JOIN product_variants pv ON bi.variant_id = pv.id
          JOIN products p ON pv.product_id = p.id
          LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
          WHERE bi.bundle_id = b.id
          LIMIT 3
        ) subq
      ) AS product_images
    FROM bundles b
    WHERE b.is_active = true
    ORDER BY b.display_order ASC
  `)
  return res.rows
}

export async function getAllBundlesAdmin() {
  const res = await db.query(`
    SELECT
      b.id, b.name, b.price, b.original_price, b.slug, b."desc", b.sku, b.is_active, b.created_at, b.updated_at,
      CASE WHEN b.image_data IS NOT NULL THEN '/api/bundles/' || b.id::text || '/image?v=' || extract(epoch from b.updated_at)::bigint::text ELSE NULL END AS bundle_image_url,
      (
        SELECT json_agg(img_url)
        FROM (
          SELECT DISTINCT ON (p.id)
            CASE WHEN pi.url IS NOT NULL THEN pi.url ELSE '/api/products/images/' || pi.id::text END AS img_url
          FROM bundle_items bi
          JOIN product_variants pv ON bi.variant_id = pv.id
          JOIN products p ON pv.product_id = p.id
          LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
          WHERE bi.bundle_id = b.id
          LIMIT 3
        ) subq
      ) AS product_images
    FROM bundles b
    ORDER BY b.is_active DESC, b.created_at DESC
  `)
  return res.rows
}

export async function getBundleById(id: string) {
  const res = await db.query(
    `
    SELECT
      b.id, b.name, b.price, b.original_price, b.slug, b."desc", b.sku, b.created_at, b.updated_at,
      CASE WHEN b.image_data IS NOT NULL THEN b.id::text ELSE NULL END AS image_id,
      CASE WHEN b.image_data IS NOT NULL THEN '/api/bundles/' || b.id::text || '/image?v=' || extract(epoch from b.updated_at)::bigint::text ELSE NULL END AS image_url,
      COALESCE(
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
      b.id, b.name, b.price, b.original_price, b.slug, b."desc", b.sku, b.created_at, b.updated_at,
      CASE WHEN b.image_data IS NOT NULL THEN '/api/bundles/' || b.id::text || '/image?v=' || extract(epoch from b.updated_at)::bigint::text ELSE NULL END AS bundle_image_url,
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
          SELECT DISTINCT p.id, p.name, p.subtitle, p.category,
            CASE WHEN pi.url IS NOT NULL THEN pi.url ELSE '/api/products/images/' || pi.id::text END AS primary_image
          FROM bundle_items bi
          JOIN product_variants pv ON bi.variant_id = pv.id
          JOIN products p ON pv.product_id = p.id
          LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
          WHERE bi.bundle_id = b.id
        ) p
      ) AS products
      FROM bundles b
      WHERE b.slug = $1 AND b.is_active = true
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

export async function reorderBundles(orderedIds: string[]) {
  await Promise.all(
    orderedIds.map((id, i) =>
      db.query('UPDATE bundles SET display_order = $1 WHERE id = $2', [i, id])
    )
  );
}