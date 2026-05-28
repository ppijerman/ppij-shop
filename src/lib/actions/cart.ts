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
      trim(pv.size) AS size,
      pv.color_name,
      pv.color_hex,
      COALESCE(
        pi.url,
        (
          SELECT bpi.url
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
    size: row.size,
    color: row.color_name && row.color_hex ? { name: row.color_name, hex: row.color_hex } : null,
    image: row.image,
  }));
}

export async function addVariantToCartAction(variantId: string, quantity = 1): Promise<void> {
  const user = await getCurrentDbUserOrThrow();
  const safeQuantity = normalizeQuantity(quantity);

  const variant = await db.query(
    `
    SELECT pv.id
    FROM product_variants pv
    JOIN products p ON p.id = pv.product_id
    WHERE pv.id = $1 AND p.is_active = true
    LIMIT 1
    `,
    [variantId],
  );

  if (variant.rowCount === 0) {
    throw new Error('Product variant is unavailable.');
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

export async function updateCartItemQuantityAction(cartItemId: string, delta: number): Promise<void> {
  const user = await getCurrentDbUserOrThrow();
  const safeDelta = Math.trunc(delta);

  if (safeDelta === 0) return;

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
