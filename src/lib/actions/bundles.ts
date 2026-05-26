'use server';

import { requireAdmin } from '../auth';
import { db, withTransaction } from '../db';
import { generateSlug } from '../utils';

export interface BundleData {
  name: string
  description: string
  price: number
  originalPrice: number | null
  skuPrefix: string
  slug: string
  variantIds: string[]
}

export async function createBundle(bundleData: BundleData) {
  await requireAdmin();
  return withTransaction(async (query) => {
    const slug = generateSlug(bundleData.name);

    const res = await query(
      `
      INSERT INTO bundles (name, "desc", price, original_price, slug, sku) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
      `,
      [
        bundleData.name,
        bundleData.description,
        bundleData.price,
        bundleData.originalPrice,
        slug,
        `BDL-${bundleData.skuPrefix}`
      ]
    );
  
    const bundleId = res.rows[0].id;

    for (const variantId of bundleData.variantIds) {
      await query(
        `
        INSERT INTO bundle_items (bundle_id, variant_id)
        VALUES ($1, $2)
        `,
        [bundleId, variantId]
      );
    }
  });
}

export async function updateBundle(bundleId: string, bundleData: BundleData) {
  await requireAdmin();
  await withTransaction(async (query) => {
    const slug = generateSlug(bundleData.name);

    await query(
      `
      UPDATE bundles 
      SET name = $2, "desc" = $3, price = $4, original_price = $5, slug = $6, sku = $7
      WHERE id = $1
      `,
      [
        bundleId,
        bundleData.name,
        bundleData.description,
        bundleData.price,
        bundleData.originalPrice,
        slug,
        bundleData.skuPrefix
      ]
    );

    await query(
      `DELETE FROM bundle_items WHERE bundle_id = $1`,
      [bundleId]
    );

    for (const variantId of bundleData.variantIds) {
      await query(
        `INSERT INTO bundle_items (bundle_id, variant_id)
        VALUES ($1, $2)`,
        [bundleId, variantId]
      )
    }
  });
}

export async function deleteBundle(bundleId: string) {
  await requireAdmin();
  await db.query(
    `DELETE FROM bundles WHERE id = $1`,
    [bundleId]
  );
}