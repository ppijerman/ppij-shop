'use server';

import { db, withTransaction } from '../db';
import { FitType, ProductData } from '@/types';
import { requireAdmin } from '../auth';

export async function createProduct(productData: ProductData) {
  await requireAdmin();
  return withTransaction(async (query) => {
    const res = await query(
      `
      INSERT INTO products (name, subtitle, category, fit_type, tag, "desc", weight_g, slug)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
      `,
      [
        productData.name,
        productData.subtitle,
        productData.category,
        productData.tag,
        productData.description,
        productData.weightG,
        productData.slug,
      ]
    );
  
    const productId = res.rows[0].id;

    for (const image of productData.images) {
      await query(
        `INSERT INTO product_images (product_id, url, is_primary)
        VALUES ($1, $2, $3)`,
        [productId, image.url, image.is_primary]
      );
    }
    for ( const fitType of ['REGULAR', 'OVERSIZED'] as FitType[]) {
      const config = productData.fits[fitType];
      if (!config.enabled) continue;

      for (const color of productData.colors) {
        for (const size of config.sizes) {
          const stock = config.stock[color.name]?.[size] ?? 0;
          await query(
            `
            INSERT INTO product_variants (product_id, color_name, color_hex, size, fit_type, price, original_price, sku, stock)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `,
            [
              productId,
              color.name,
              color.hex,
              size,
              fitType,
              config.price,
              config.originalPrice,
              `${productData.skuPrefix}-${color.name}-${size}`,
              stock,
            ]
          )
        }
      }
    }
  })
}

export async function updateProduct(id: string, productData: ProductData) {
  await requireAdmin();
  await withTransaction(async (query) => {
    await query(
      `
      UPDATE products
      SET
        name = $2,
        subtitle = $3,
        category = $4,
        tag = $5,
        "desc" = $6,
        slug = $7,
        weight_g = $8
      WHERE id = $1
      `,
      [
        id,
        productData.name,
        productData.subtitle,
        productData.category,
        productData.tag,
        productData.description,
        productData.slug,
        productData.weightG
      ]
    );

    await query('DELETE FROM product_images WHERE product_id = $1', [id]);
    for (const image of productData.images) {
      await query(
        `INSERT INTO product_images (product_id, url, is_primary) VALUES ($1, $2, $3)`,
        [id, image.url, image.is_primary]
      );
    }

    const existingVariants = await query(
      'SELECT * FROM product_variants WHERE product_id = $1',
      [id]
    );

    const existingMap: Record<string, string> = {};
    for (const v of existingVariants.rows) {
      const key = `${v.color_name}__${v.size.trim()}`;
      existingMap[key] = v.id;
    }

    const incomingKeys = new Set<string>();

    for (const fitType of ['REGULAR', 'OVERSIZED'] as FitType[]) {
      const config = productData.fits[fitType];
      if (!config.enabled) continue;

      for (const color of productData.colors) {
        for (const size of config.sizes) {
          const stock = config.stock[color.name]?.[size] || 0;
          const key = `${color.name}__${size}`;
          incomingKeys.add(key);

          if (existingMap[key]) {
            // Update existing variant
            await query(
              `
              UPDATE product_variants
              SET stock = $2, price = $3, original_price = $4, color_hex = $5
              WHERE id = $1
              `,
              [existingMap[key], stock, config.price, config.originalPrice || null, color.hex]
            );
          } else {
            // Insert new variant
            await query(
              `
              INSERT INTO product_variants (product_id, color_name, color_hex, size, price, original_price, sku, stock)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
              `,
              [id, color.name, color.hex, size, config.price, config.originalPrice, `${productData.skuPrefix}-${color.name}-${size}`, stock]
            );
          }
        }
      }
    }

    for (const [key, variantId] of Object.entries(existingMap)) {
      if (!incomingKeys.has(key)) {
        await query(
          `
          DELETE FROM product_variants
          WHERE id = $1
          AND NOT EXISTS (
            SELECT 1 FROM order_items WHERE variant_id = $1
          )
          `,
          [variantId]
        );
      }
    }
  })

}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  await db.query(
    `DELETE FROM products WHERE id = $1`,
    [productId]
  )
}