'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getCurrentDbUserOrThrow } from '@/lib/users';
import type { CartItem } from '@/types';

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeQuantity(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value));
}

async function getCartItemStockLimit(cartItemId: string, userId: string): Promise<number | null> {
  const result = await db.query(
    `
    SELECT
      CASE
        WHEN ci.variant_id IS NOT NULL THEN pv.stock
        WHEN array_length(ci.selected_variant_ids, 1) > 0 THEN (
          SELECT MIN(pv2.stock)
          FROM product_variants pv2
          WHERE pv2.id = ANY(ci.selected_variant_ids)
        )
        ELSE (
          SELECT MIN(bpv.stock)
          FROM bundle_items bi
          JOIN product_variants bpv ON bpv.id = bi.variant_id
          WHERE bi.bundle_id = ci.bundle_id
        )
      END AS stock
    FROM cart_items ci
    LEFT JOIN product_variants pv ON pv.id = ci.variant_id
    WHERE ci.id = $1 AND ci.user_id = $2
    LIMIT 1
    `,
    [cartItemId, userId],
  );

  if (result.rowCount === 0) {
    return null;
  }

  return Math.max(0, Number(result.rows[0].stock ?? 0));
}

export async function getCartItemsAction(): Promise<CartItem[]> {
  const user = await getCurrentDbUserOrThrow();

  const result = await db.query(
    `
    SELECT
      ci.id AS cart_id,
      ci.variant_id,
      ci.bundle_id,
      ci.quantity,
      pv.product_id,
      COALESCE(p.name, b.name) AS name,
      CASE WHEN ci.bundle_id IS NOT NULL THEN 'BUNDLE' ELSE p.category::text END AS category,
      COALESCE(pv.price, b.price) AS price,
      CASE
        WHEN ci.variant_id IS NOT NULL THEN pv.stock
        WHEN array_length(ci.selected_variant_ids, 1) > 0 THEN (
          SELECT MIN(pv2.stock)
          FROM product_variants pv2
          WHERE pv2.id = ANY(ci.selected_variant_ids)
        )
        ELSE (
          SELECT MIN(bpv.stock)
          FROM bundle_items bi
          JOIN product_variants bpv ON bpv.id = bi.variant_id
          WHERE bi.bundle_id = ci.bundle_id
        )
      END AS stock,
      trim(pv.size) AS size,
      pv.color_name,
      pv.color_hex,
      pv.fit_type,
      COALESCE(
        CASE WHEN pi.data IS NOT NULL THEN '/api/products/images/' || pi.id::text ELSE pi.url END,
        (
          SELECT CASE WHEN bpi.data IS NOT NULL THEN '/api/products/images/' || bpi.id::text ELSE bpi.url END
          FROM bundle_items bi
          JOIN product_variants bpv ON bpv.id = bi.variant_id
          JOIN product_images bpi ON bpi.product_id = bpv.product_id
          WHERE bi.bundle_id = ci.bundle_id
          ORDER BY bpi.is_primary DESC, bpi.id ASC
          LIMIT 1
        ),
        '/assets/v4/editorial-color.jpeg'
      ) AS image
    FROM cart_items ci
    LEFT JOIN product_variants pv ON pv.id = ci.variant_id
    LEFT JOIN products p ON p.id = pv.product_id
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
    LEFT JOIN bundles b ON b.id = ci.bundle_id
    WHERE ci.user_id = $1
    ORDER BY ci.created_at ASC
    `,
    [user.id],
  );

  return result.rows.map((row) => ({
    cartId: row.cart_id,
    variantId: row.variant_id,
    productId: row.product_id,
    bundleId: row.bundle_id,
    name: row.name,
    category: row.category === 'TOTEBAG' ? 'TOTE BAG' : row.category,
    price: toNumber(row.price),
    qty: normalizeQuantity(Number(row.quantity)),
    stock: Math.max(0, Number(row.stock ?? 0)),
    size: row.size,
    color: row.color_name && row.color_hex ? { name: row.color_name, hex: row.color_hex } : null,
    image: row.image,
    fit_type: row.fit_type,
  }));
}

export async function addVariantToCartAction(variantId: string, quantity = 1): Promise<void> {
  const user = await getCurrentDbUserOrThrow();
  const safeQuantity = normalizeQuantity(quantity);

  const variant = await db.query(
    `
    SELECT pv.id, pv.stock, COALESCE(ci.quantity, 0) AS cart_quantity
    FROM product_variants pv
    JOIN products p ON p.id = pv.product_id
    LEFT JOIN cart_items ci ON ci.variant_id = pv.id AND ci.user_id = $2
    WHERE pv.id = $1 AND p.is_active = true
    LIMIT 1
    `,
    [variantId, user.id],
  );

  if (variant.rowCount === 0) {
    throw new Error('Product variant is unavailable.');
  }

  const stock = Math.max(0, Number(variant.rows[0].stock));
  const currentQuantity = Math.max(0, Number(variant.rows[0].cart_quantity));

  if (stock <= 0) {
    throw new Error('This item is sold out.');
  }

  if (currentQuantity + safeQuantity > stock) {
    throw new Error(`Only ${stock} item${stock === 1 ? '' : 's'} available.`);
  }

  await db.query(
    `
    INSERT INTO cart_items (user_id, variant_id, quantity)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, variant_id) WHERE variant_id IS NOT NULL
    DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
    `,
    [user.id, variantId, safeQuantity],
  );

  revalidatePath('/cart');
}

export async function addBundleToCartAction(bundleId: string, selectedVariantIds: string[], quantity = 1): Promise<void> {
  const user = await getCurrentDbUserOrThrow();
  const safeQuantity = normalizeQuantity(quantity);

  const bundle = await db.query(
    `SELECT id FROM bundles WHERE id = $1 LIMIT 1`,
    [bundleId],
  );

  if (bundle.rowCount === 0) {
    throw new Error('Bundle is unavailable.');
  }

  if (selectedVariantIds.length > 0) {
    const variants = await db.query(
      `SELECT id, stock FROM product_variants WHERE id = ANY($1::uuid[])`,
      [selectedVariantIds],
    );
    
    if (variants.rowCount !== selectedVariantIds.length) {
      throw new Error('One or more selected variants are unavailable.');
    }
    
    const oosVariant = variants.rows.find(v => Number(v.stock) <= 0);
    if (oosVariant) {
      throw new Error('One of the selected sizes is sold out.');
    }
  }

  await db.query(
    `
    INSERT INTO cart_items (user_id, bundle_id, quantity, selected_variant_ids)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id, bundle_id)
    DO UPDATE SET 
      quantity = cart_items.quantity + EXCLUDED.quantity,
      selected_variant_ids = EXCLUDED.selected_variant_ids
    `,
    [user.id, bundleId, safeQuantity, selectedVariantIds],
  );

  revalidatePath('/cart');
}

export async function updateCartItemQuantityAction(cartItemId: string, delta: number): Promise<void> {
  const user = await getCurrentDbUserOrThrow();
  const safeDelta = Math.trunc(delta);

  if (safeDelta === 0) return;

  if (safeDelta > 0) {
    const stockLimit = await getCartItemStockLimit(cartItemId, user.id);
    if (stockLimit === null) {
      throw new Error('Cart item not found.');
    }

    const current = await db.query(
      `SELECT quantity FROM cart_items WHERE id = $1 AND user_id = $2 LIMIT 1`,
      [cartItemId, user.id],
    );
    const currentQuantity = Number(current.rows[0]?.quantity ?? 0);

    if (currentQuantity + safeDelta > stockLimit) {
      throw new Error(`Only ${stockLimit} item${stockLimit === 1 ? '' : 's'} available.`);
    }
  }

  await db.query(
    `
    UPDATE cart_items
    SET quantity = GREATEST(1, quantity + $3)
    WHERE id = $1 AND user_id = $2
    `,
    [cartItemId, user.id, safeDelta],
  );

  revalidatePath('/cart');
}

export async function removeCartItemAction(cartItemId: string): Promise<void> {
  const user = await getCurrentDbUserOrThrow();

  await db.query(
    `DELETE FROM cart_items WHERE id = $1 AND user_id = $2`,
    [cartItemId, user.id],
  );

  revalidatePath('/cart');
}
