'use server';

import { requireAdmin } from '../auth';
import { db, withTransaction } from '../db';
import { revalidatePath } from 'next/cache';
import { generateSlug } from '../utils';

export interface BundleData {
  name: string
  description: string
  price: number
  originalPrice: number | null
  skuPrefix: string
  slug: string
  variantIds: string[]
  imageFile?: Buffer
  imageContentType?: string
  clearImage?: boolean
}

export async function createBundle(bundleData: BundleData) {
  await requireAdmin();
  return withTransaction(async (query) => {
    const base = generateSlug(bundleData.name);
    const existingSlugs = await query(
      `SELECT slug FROM bundles WHERE slug ~ $1`,
      [`^${base}(-[0-9]+)?$`]
    );
    const slug = existingSlugs.rows.length === 0 ? base : `${base}-${existingSlugs.rows.length}`;

    const baseSku = `BDL-${bundleData.skuPrefix}`;
    const existingSkus = await query(
      `SELECT sku FROM bundles WHERE sku ~ $1`,
      [`^${baseSku}(-[0-9]+)?$`]
    );
    const sku = existingSkus.rows.length === 0 ? baseSku : `${baseSku}-${existingSkus.rows.length}`;

    const res = await query(
      `
      INSERT INTO bundles (name, "desc", price, original_price, slug, sku, image_data, image_content_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
      `,
      [
        bundleData.name,
        bundleData.description,
        bundleData.price,
        bundleData.originalPrice,
        slug,
        sku,
        bundleData.imageFile ?? null,
        bundleData.imageContentType ?? null,
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
    const base = generateSlug(bundleData.name);
    const existingSlugs = await query(
      `SELECT slug FROM bundles WHERE slug ~ $1 AND id != $2`,
      [`^${base}(-[0-9]+)?$`, bundleId]
    );
    const slug = existingSlugs.rows.length === 0 ? base : `${base}-${existingSlugs.rows.length}`;

    const baseSku = `BDL-${bundleData.skuPrefix}`;
    const existingSkus = await query(
      `SELECT sku FROM bundles WHERE sku ~ $1 AND id != $2`,
      [`^${baseSku}(-[0-9]+)?$`, bundleId]
    );
    const sku = existingSkus.rows.length === 0 ? baseSku : `${baseSku}-${existingSkus.rows.length}`;

    const imageUpdate = bundleData.imageFile
      ? { data: bundleData.imageFile, type: bundleData.imageContentType }
      : bundleData.clearImage
        ? { data: null, type: null }
        : undefined;

    if (imageUpdate !== undefined) {
      await query(
        `UPDATE bundles SET name = $2, "desc" = $3, price = $4, original_price = $5, slug = $6, sku = $7, image_data = $8, image_content_type = $9, updated_at = NOW() WHERE id = $1`,
        [bundleId, bundleData.name, bundleData.description, bundleData.price, bundleData.originalPrice, slug, sku, imageUpdate.data, imageUpdate.type]
      );
    } else {
      await query(
        `UPDATE bundles SET name = $2, "desc" = $3, price = $4, original_price = $5, slug = $6, sku = $7, updated_at = NOW() WHERE id = $1`,
        [bundleId, bundleData.name, bundleData.description, bundleData.price, bundleData.originalPrice, slug, sku]
      );
    }

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

export async function toggleBundleActiveAction(bundleId: string, isActive: boolean): Promise<void> {
  await requireAdmin();
  await db.query(`UPDATE bundles SET is_active = $2 WHERE id = $1`, [bundleId, isActive]);
  revalidatePath('/catalog');
  revalidatePath('/admin/kk/bundles');
  revalidatePath('/admin/it/bundles');
}

export async function deleteBundle(bundleId: string) {
  await requireAdmin();

  const hasOrders = await db.query(
    `SELECT 1 FROM order_items WHERE bundle_id = $1 LIMIT 1`,
    [bundleId],
  );
  if (hasOrders.rows.length > 0) {
    throw new Error('This bundle has existing orders and cannot be deleted.');
  }

  await db.query(
    `DELETE FROM bundles WHERE id = $1`,
    [bundleId]
  );
}