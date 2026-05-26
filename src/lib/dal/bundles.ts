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
  const res = await db.query("SELECT * FROM bundles WHERE slug = $1", [slug])
  return res.rows[0]
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