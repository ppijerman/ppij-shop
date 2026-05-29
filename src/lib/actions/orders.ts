'use server';

import { revalidatePath } from 'next/cache';
import { db, withTransaction } from '@/lib/db';
import { requireOrderAdmin } from '@/lib/auth';
import { getCurrentDbUserOrThrow } from '@/lib/users';
import type { PaymentMethod } from '@/types';

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DONE', 'CANCELLED'] as const;
const PAYMENT_METHODS = ['IBAN'] as const;
const DELIVERY_TYPES = ['PICKUP', 'DELIVERY'] as const;
const MAX_PROOF_SIZE_BYTES = 5 * 1024 * 1024;
const PROOF_MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

type OrderStatus = (typeof ORDER_STATUSES)[number];
type DeliveryType = (typeof DELIVERY_TYPES)[number];

export type CreateOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; code: 'VALIDATION_ERROR' | 'EMPTY_CART' | 'OUT_OF_STOCK'; message: string; items?: string[] };

export type SimpleActionResult = { ok: true; message?: string } | { ok: false; message: string };

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function isPaymentMethod(value: string): value is PaymentMethod {
  return PAYMENT_METHODS.includes(value as PaymentMethod);
}

function isDeliveryType(value: string): value is DeliveryType {
  return DELIVERY_TYPES.includes(value as DeliveryType);
}

function isOrderStatus(value: string): value is OrderStatus {
  return ORDER_STATUSES.includes(value as OrderStatus);
}

function parseDeliveryAddress(formData: FormData, deliveryType: DeliveryType) {
  if (deliveryType === 'PICKUP') {
    return null;
  }

  const address = {
    street: formString(formData, 'street'),
    city: formString(formData, 'city'),
    postcode: formString(formData, 'postcode'),
    country: formString(formData, 'country'),
  };

  if (!address.street || !address.city || !address.postcode || !address.country) {
    return null;
  }

  return address;
}

export async function createOrder(formData: FormData): Promise<CreateOrderResult> {
  const user = await getCurrentDbUserOrThrow();
  const deliveryTypeInput = formString(formData, 'deliveryType');
  const paymentMethodInput = formString(formData, 'paymentMethod');

  if (!isDeliveryType(deliveryTypeInput)) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'Choose pickup or delivery.' };
  }

  if (!isPaymentMethod(paymentMethodInput)) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'IBAN bank transfer is required.' };
  }

  const deliveryAddress = parseDeliveryAddress(formData, deliveryTypeInput);
  if (deliveryTypeInput === 'DELIVERY' && deliveryAddress === null) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'Delivery address is incomplete.' };
  }

  return withTransaction(async (query) => {
    const cartResult = await query(
      `
      SELECT
        ci.id,
        ci.variant_id,
        ci.bundle_id,
        ci.quantity,
        pv.price AS variant_price,
        pv.sku AS variant_sku,
        p.name AS product_name,
        b.price AS bundle_price,
        b.sku AS bundle_sku,
        b.name AS bundle_name
      FROM cart_items ci
      LEFT JOIN product_variants pv ON pv.id = ci.variant_id
      LEFT JOIN products p ON p.id = pv.product_id
      LEFT JOIN bundles b ON b.id = ci.bundle_id
      WHERE ci.user_id = $1
      ORDER BY ci.created_at ASC
      FOR UPDATE OF ci
      `,
      [user.id],
    );

    const cartRows: any[] = cartResult.rows;
    if (cartRows.length === 0) {
      return { ok: false, code: 'EMPTY_CART', message: 'Your cart is empty.' };
    }

    const bundleIds = cartRows.map((row: any) => row.bundle_id).filter(Boolean);
    const bundleComponents = bundleIds.length > 0
      ? await query(
          `
          SELECT bundle_id, variant_id
          FROM bundle_items
          WHERE bundle_id = ANY($1::uuid[])
          ORDER BY bundle_id, variant_id
          `,
          [bundleIds],
        )
      : { rows: [] };

    const componentsByBundle = new Map<string, string[]>();
    for (const component of bundleComponents.rows as any[]) {
      const variants = componentsByBundle.get(component.bundle_id) ?? [];
      variants.push(component.variant_id);
      componentsByBundle.set(component.bundle_id, variants);
    }

    const requiredByVariant = new Map<string, number>();
    for (const item of cartRows) {
      const quantity = Number(item.quantity);
      if (item.variant_id) {
        requiredByVariant.set(item.variant_id, (requiredByVariant.get(item.variant_id) ?? 0) + quantity);
      } else if (item.bundle_id) {
        const componentVariantIds = componentsByBundle.get(item.bundle_id) ?? [];
        if (componentVariantIds.length === 0) {
          return { ok: false, code: 'VALIDATION_ERROR', message: `${item.bundle_name} is not configured for checkout.` };
        }

        for (const variantId of componentVariantIds) {
          requiredByVariant.set(variantId, (requiredByVariant.get(variantId) ?? 0) + quantity);
        }
      }
    }

    const variantIds = Array.from(requiredByVariant.keys());
    const lockedVariants = await query(
      `
      SELECT id, stock, sku
      FROM product_variants
      WHERE id = ANY($1::uuid[])
      ORDER BY id
      FOR UPDATE
      `,
      [variantIds],
    );

    const stockByVariant = new Map<string, { stock: number; sku: string }>();
    for (const variant of lockedVariants.rows as any[]) {
      stockByVariant.set(variant.id, { stock: Number(variant.stock), sku: variant.sku });
    }

    const outOfStockItems: string[] = [];
    for (const [variantId, requiredQuantity] of requiredByVariant) {
      const stock = stockByVariant.get(variantId);
      if (!stock || stock.stock < requiredQuantity) {
        outOfStockItems.push(stock?.sku ?? variantId);
      }
    }

    if (outOfStockItems.length > 0) {
      return {
        ok: false,
        code: 'OUT_OF_STOCK',
        message: 'Some items are out of stock. Please update your cart.',
        items: outOfStockItems,
      };
    }

    const total = cartRows.reduce((sum, item) => {
      const unitPrice = Number(item.variant_price ?? item.bundle_price ?? 0);
      return sum + unitPrice * Number(item.quantity);
    }, 0);

    const orderResult = await query(
      `
      INSERT INTO orders (user_id, status, total_price, delivery_address, delivery_type, payment_method)
      VALUES ($1, 'PENDING', $2, $3::jsonb, $4::delivery_type, $5::payment_method)
      RETURNING id
      `,
      [
        user.id,
        total,
        deliveryAddress === null ? null : JSON.stringify(deliveryAddress),
        deliveryTypeInput,
        paymentMethodInput,
      ],
    );
    const orderId = orderResult.rows[0].id;

    for (const item of cartRows) {
      const isBundle = Boolean(item.bundle_id);
      await query(
        `
        INSERT INTO order_items (
          order_id,
          variant_id,
          bundle_id,
          quantity,
          price_at_purchase,
          product_name_snapshot,
          sku_snapshot
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          orderId,
          item.variant_id,
          item.bundle_id,
          item.quantity,
          Number(item.variant_price ?? item.bundle_price ?? 0),
          isBundle ? item.bundle_name : item.product_name,
          isBundle ? item.bundle_sku : item.variant_sku,
        ],
      );
    }

    for (const [variantId, requiredQuantity] of requiredByVariant) {
      await query(
        `UPDATE product_variants SET stock = stock - $2 WHERE id = $1`,
        [variantId, requiredQuantity],
      );
    }

    await query(
      `
      INSERT INTO order_status_logs (order_id, status, note)
      VALUES ($1, 'PENDING', $2)
      `,
      [orderId, 'Order created. Waiting for payment proof.'],
    );

    await query(
      `DELETE FROM cart_items WHERE user_id = $1 AND id = ANY($2::uuid[])`,
      [user.id, cartRows.map((row: any) => row.id)],
    );

    revalidatePath('/cart');
    revalidatePath('/account/orders');

    return { ok: true, orderId };
  });
}

export async function uploadPaymentProofAction(formData: FormData): Promise<SimpleActionResult> {
  const user = await getCurrentDbUserOrThrow();
  const orderId = formString(formData, 'orderId');
  const proofFile = formData.get('paymentProof');

  if (!orderId) {
    return { ok: false, message: 'Missing order ID.' };
  }

  if (!(proofFile instanceof File) || proofFile.size === 0) {
    return { ok: false, message: 'Choose a payment proof image.' };
  }

  if (proofFile.size > MAX_PROOF_SIZE_BYTES) {
    return { ok: false, message: 'Payment proof must be 5 MB or smaller.' };
  }

  const extension = PROOF_MIME_TO_EXT[proofFile.type];
  if (!extension) {
    return { ok: false, message: 'Payment proof must be a JPEG, PNG, or WebP image.' };
  }

  return withTransaction(async (query) => {
    const orderResult = await query(
      `
      SELECT id, status
      FROM orders
      WHERE id = $1 AND user_id = $2
      FOR UPDATE
      `,
      [orderId, user.id],
    );
    const order = orderResult.rows[0];

    if (!order) {
      return { ok: false, message: 'Order not found.' };
    }

    if (order.status !== 'PENDING') {
      return { ok: false, message: 'Payment proof can only be uploaded while the order is pending.' };
    }

    const proofUrl = `/api/orders/${orderId}/payment-proof`;
    const buffer = Buffer.from(await proofFile.arrayBuffer());

    await query(
      `
      UPDATE orders
      SET
        payment_proof_url = $2,
        payment_proof_data = $3,
        payment_proof_content_type = $4,
        status = 'CONFIRMED'
      WHERE id = $1
      `,
      [orderId, proofUrl, buffer, proofFile.type],
    );

    await query(
      `
      INSERT INTO order_status_logs (order_id, status, note)
      VALUES ($1, 'CONFIRMED', $2)
      `,
      [orderId, 'Payment proof uploaded. Waiting for admin review.'],
    );

    revalidatePath(`/account/orders/${orderId}`);
    revalidatePath('/admin/kk/payments');
    revalidatePath('/admin/it/payments');

    return { ok: true, message: 'Payment proof uploaded.' };
  });
}

export async function updateOrderStatusAction(orderId: string, status: string): Promise<SimpleActionResult> {
  await requireOrderAdmin();

  if (!isOrderStatus(status)) {
    return { ok: false, message: 'Invalid order status.' };
  }

  const result = await withTransaction(async (query) => {
    if (status === 'SHIPPED') {
      const orderResult = await query(
        `
        SELECT shipping_tracking_number
        FROM orders
        WHERE id = $1
        FOR UPDATE
        `,
        [orderId],
      );
      const order = orderResult.rows[0];

      if (!order) {
        return { ok: false, message: 'Order not found.' };
      }

      if (!order.shipping_tracking_number) {
        return { ok: false, message: 'Add a shipping number before marking the order as shipped.' };
      }
    }

    const updateResult = await query(
      `UPDATE orders SET status = $2::order_status WHERE id = $1 RETURNING id`,
      [orderId, status],
    );

    if (updateResult.rowCount === 0) {
      return { ok: false, message: 'Order not found.' };
    }

    await query(
      `
      INSERT INTO order_status_logs (order_id, status, note)
      VALUES ($1, $2::order_status, $3)
      `,
      [orderId, status, `Status manually changed to ${status}.`],
    );

    return { ok: true, message: 'Status updated.' };
  });

  if (result.ok) {
    revalidatePath(`/admin/kk/orders/${orderId}`);
    revalidatePath(`/admin/it/orders/${orderId}`);
    revalidatePath(`/account/orders/${orderId}`);
  }

  return result;
}

export async function updateShippingTrackingNumberAction(
  orderId: string,
  trackingNumberInput: string,
): Promise<SimpleActionResult> {
  await requireOrderAdmin();

  const trackingNumber = trackingNumberInput.trim();

  if (!trackingNumber) {
    return { ok: false, message: 'Enter a shipping number before marking the order as shipped.' };
  }

  if (trackingNumber.length > 120) {
    return { ok: false, message: 'Shipping number must be 120 characters or fewer.' };
  }

  return withTransaction(async (query) => {
    const result = await query(
      `
      UPDATE orders
      SET shipping_tracking_number = $2, status = 'SHIPPED'
      WHERE id = $1 AND status IN ('PROCESSING', 'SHIPPED')
      RETURNING id
      `,
      [orderId, trackingNumber],
    );

    if (result.rowCount === 0) {
      return { ok: false, message: 'Only processing or shipped orders can receive a shipping number.' };
    }

    await query(
      `
      INSERT INTO order_status_logs (order_id, status, note)
      VALUES ($1, 'SHIPPED', $2)
      `,
      [orderId, `Shipping number saved: ${trackingNumber}`],
    );

    revalidatePath(`/admin/kk/orders/${orderId}`);
    revalidatePath(`/admin/it/orders/${orderId}`);
    revalidatePath(`/account/orders/${orderId}`);

    return { ok: true, message: 'Shipping number saved.' };
  });
}

export async function approvePaymentAction(orderId: string): Promise<SimpleActionResult> {
  await requireOrderAdmin();

  return withTransaction(async (query) => {
    const result = await query(
      `
      UPDATE orders
      SET status = 'PROCESSING'
      WHERE id = $1 AND status = 'CONFIRMED' AND payment_proof_data IS NOT NULL
      RETURNING id
      `,
      [orderId],
    );

    if (result.rowCount === 0) {
      return { ok: false, message: 'Only confirmed orders with proof can be approved.' };
    }

    await query(
      `
      INSERT INTO order_status_logs (order_id, status, note)
      VALUES ($1, 'PROCESSING', $2)
      `,
      [orderId, 'Payment approved by admin.'],
    );

    revalidatePath('/admin/kk/payments');
    revalidatePath('/admin/it/payments');
    revalidatePath(`/admin/kk/orders/${orderId}`);
    revalidatePath(`/admin/it/orders/${orderId}`);

    return { ok: true, message: 'Payment approved.' };
  });
}

export async function rejectPaymentAction(orderId: string): Promise<SimpleActionResult> {
  await requireOrderAdmin();

  return withTransaction(async (query) => {
    const result = await query(
      `
      UPDATE orders
      SET
        status = 'PENDING',
        payment_proof_url = NULL,
        payment_proof_data = NULL,
        payment_proof_content_type = NULL
      WHERE id = $1 AND status = 'CONFIRMED'
      RETURNING id
      `,
      [orderId],
    );

    if (result.rowCount === 0) {
      return { ok: false, message: 'Only confirmed orders can be rejected.' };
    }

    await query(
      `
      INSERT INTO order_status_logs (order_id, status, note)
      VALUES ($1, 'PENDING', $2)
      `,
      [orderId, 'Payment proof rejected. Waiting for a new upload.'],
    );

    revalidatePath('/admin/kk/payments');
    revalidatePath('/admin/it/payments');
    revalidatePath(`/admin/kk/orders/${orderId}`);
    revalidatePath(`/admin/it/orders/${orderId}`);

    return { ok: true, message: 'Payment rejected.' };
  });
}
