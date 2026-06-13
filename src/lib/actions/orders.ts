'use server';

import { revalidatePath } from 'next/cache';
import { db, withTransaction } from '@/lib/db';
import { requireOrderAdmin } from '@/lib/auth';
import { getCurrentDbUserOrThrow } from '@/lib/users';
import { expireOverdueAwaitingPaymentOrders, getPaymentExpiresAtExpression } from '@/lib/orderExpiry';
import type { DeliveryAddress, PaymentMethod } from '@/types';
import { SendOrderConfirmationEmail, SendOrderCancelledEmail, SendOrderExpiredEmail, SendPaymentApprovedEmail, SendPaymentProofUploadedEmail, SendPaymentRejectedEmail, SendOrderShippedEmail } from '@/lib/actions/send-order-email';
import { createParcel, getShippingMethods, getParcel } from '@/lib/sendcloud';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants';

const ORDER_STATUSES = ['AWAITING_PAYMENT', 'PAYMENT_REVIEW', 'PROCESSING', 'SHIPPED', 'DONE', 'CANCELLED'] as const;
const PAYMENT_METHODS = ['IBAN'] as const;
const DELIVERY_TYPES = ['PICKUP', 'DELIVERY'] as const;
const MAX_PROOF_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_TIMELINE_COMMENT_LENGTH = 500;
const PROOF_MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

type OrderStatus = (typeof ORDER_STATUSES)[number];
type DeliveryType = (typeof DELIVERY_TYPES)[number];
type TimelineCommentValidationResult = { ok: true; comment: string } | { ok: false; message: string };

export type CreateOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; code: 'VALIDATION_ERROR' | 'EMPTY_CART' | 'OUT_OF_STOCK'; message: string; items?: string[] };

export type SimpleActionResult = { ok: true; message?: string } | { ok: false; message: string };

export interface ShippingOption {
  methodId: string;
  name: string;
  carrier: string;
  costCents: number;
  leadTimeHours: number | null;
}

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

async function getCartWeightG(userId: string): Promise<number> {
  const result = await db.query(
    `
    SELECT COALESCE(SUM(p.weight_g * ci.quantity), 500) AS total_weight_g
    FROM cart_items ci
    LEFT JOIN product_variants pv ON pv.id = ci.variant_id
    LEFT JOIN products p ON p.id = pv.product_id
    WHERE ci.user_id = $1
    `,
    [userId],
  );
  return Number(result.rows[0]?.total_weight_g ?? 500);
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

const ALLOWED_DELIVERY_COUNTRIES = new Set(['DE']);

function parseDeliveryAddress(formData: FormData): { address: DeliveryAddress } | { error: string } {
  const street = formString(formData, 'street').trim();
  const city = formString(formData, 'city').trim();
  const postcode = formString(formData, 'postcode').trim();
  const country = formString(formData, 'country').trim();

  if (!street || !city || !postcode || !country) {
    return { error: 'Delivery address is incomplete.' };
  }
  if (street.length > 100) {
    return { error: 'Street address is too long (max 100 characters).' };
  }
  if (city.length > 100) {
    return { error: 'City is too long (max 100 characters).' };
  }
  if (!ALLOWED_DELIVERY_COUNTRIES.has(country)) {
    return { error: 'Delivery is only available within Germany.' };
  }
  if (!/^\d{5}$/.test(postcode)) {
    return { error: 'Enter a valid 5-digit German postcode (e.g. 52070).' };
  }

  return { address: { street, city, postcode, country } };
}

function truncateLogValue(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
}

function normalizeTimelineComment(commentInput: string): TimelineCommentValidationResult {
  const comment = commentInput.trim();

  if (!comment) {
    return { ok: false, message: 'Enter a comment.' };
  }

  if (comment.length > MAX_TIMELINE_COMMENT_LENGTH) {
    return { ok: false, message: `Comment must be ${MAX_TIMELINE_COMMENT_LENGTH} characters or fewer.` };
  }

  return { ok: true, comment };
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

  const isDelivery = deliveryTypeInput === 'DELIVERY';

  let deliveryAddress: DeliveryAddress | null = null;
  if (isDelivery) {
    const addressResult = parseDeliveryAddress(formData);
    if ('error' in addressResult) {
      return { ok: false, code: 'VALIDATION_ERROR', message: addressResult.error };
    }
    deliveryAddress = addressResult.address;
  }

  const shippingMethodId = isDelivery
    ? formString(formData, 'shippingMethodId') || null
    : null;

  let shippingCost = 0;
  if (isDelivery) {
    if (!shippingMethodId) {
      return { ok: false, code: 'VALIDATION_ERROR', message: 'Choose a shipping option.' };
    }
    try {
      const weightG = await getCartWeightG(user.id);
      const methods = await getShippingMethods(deliveryAddress!.country, weightG);
      const method = methods.find((m) => String(m.id) === shippingMethodId);
      if (!method) {
        return { ok: false, code: 'VALIDATION_ERROR', message: 'The selected shipping option is no longer available.' };
      }
      shippingCost = Number(method.price);
    } catch (err) {
      console.error('SendCloud getShippingMethods failed:', err);
      return { ok: false, code: 'VALIDATION_ERROR', message: 'Could not confirm the shipping cost. Please try again later.' };
    }
  }

  const emailDataRef: { value: { total: number; itemsTotal: number; items: { name: string; quantity: number; price: string }[] } | null } = { value: null };

  const result = await withTransaction<CreateOrderResult>(async (query) => {
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

    const itemsTotal = cartRows.reduce((sum, item) => {
      const unitPrice = Number(item.variant_price ?? item.bundle_price ?? 0);
      return sum + unitPrice * Number(item.quantity);
    }, 0);

    if (itemsTotal >= FREE_SHIPPING_THRESHOLD) {
      shippingCost = 0;
    }

    const total = itemsTotal + shippingCost;

    const orderResult = await query(
      `
      INSERT INTO orders (user_id, status, total_price, delivery_address, delivery_type, payment_method, payment_expires_at, shipping_cost, shipping_method_id)
      VALUES ($1, 'AWAITING_PAYMENT', $2, $3::jsonb, $4::delivery_type, $5::payment_method, ${getPaymentExpiresAtExpression()}, $6, $7)
      RETURNING id
      `,
      [
        user.id,
        total,
        deliveryAddress === null ? null : JSON.stringify(deliveryAddress),
        deliveryTypeInput,
        paymentMethodInput,
        shippingCost,
        shippingMethodId,
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
      INSERT INTO order_status_logs (order_id, status, note, changed_by_user_id)
      VALUES ($1, 'AWAITING_PAYMENT', $2, $3)
      `,
      [orderId, 'Order created. Waiting for payment proof.', user.id],
    );

    await query(
      `DELETE FROM cart_items WHERE user_id = $1 AND id = ANY($2::uuid[])`,
      [user.id, cartRows.map((row: any) => row.id)],
    );

    emailDataRef.value = {
      total,
      itemsTotal,
      items: cartRows.map((item) => ({
        name: item.bundle_name ?? item.product_name,
        quantity: Number(item.quantity),
        price: `€${Number(item.bundle_price ?? item.variant_price ?? 0).toFixed(2)}`,
      })),
    };

    return { ok: true, orderId };
  });

  if (result.ok) {
    revalidatePath('/cart');
    revalidatePath('/account/orders');
  }

  if (result.ok && emailDataRef.value) {
    try {
      await SendOrderConfirmationEmail({
        to: user.email,
        customerName: user.first_name,
        orderId: result.orderId,
        itemsTotal: `€${emailDataRef.value.itemsTotal.toFixed(2)}`,
        shippingCost: `€${(emailDataRef.value.total - emailDataRef.value.itemsTotal).toFixed(2)}`,
        total: `€${Number(emailDataRef.value.total).toFixed(2)}`,
        items: emailDataRef.value.items,
      });
    } catch (err) {
      console.error('Failed to send order confirmation email:', err);
    }
  }

  return result;
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

  const expiredRef = { wasExpired: false };

  const result = await withTransaction(async (query) => {
    const expiredIds = await expireOverdueAwaitingPaymentOrders(query, { orderId, userId: user.id });
    expiredRef.wasExpired = expiredIds.includes(orderId);

    const orderResult = await query(
      `
      SELECT id, status, payment_expires_at
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

    if (order.status !== 'AWAITING_PAYMENT') {
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
        status = 'PAYMENT_REVIEW'
      WHERE id = $1
      `,
      [orderId, proofUrl, buffer, proofFile.type],
    );

    await query(
      `
      INSERT INTO order_status_logs (order_id, status, note, changed_by_user_id)
      VALUES ($1, 'PAYMENT_REVIEW', $2, $3)
      `,
      [orderId, 'Payment proof uploaded. Waiting for admin review.', user.id],
    );

    return { ok: true, message: 'Payment proof uploaded.' };
  });

  if (result.ok) {
    revalidatePath(`/account/orders/${orderId}`);
    revalidatePath('/admin/kk/payments');
    revalidatePath('/admin/it/payments');
  }

  if (expiredRef.wasExpired && user.email) {
    try {
      await SendOrderExpiredEmail({
        to: user.email,
        customerName: user.first_name,
        orderId,
      });
    } catch (err) {
      console.error('Failed to send order expired email:', err);
    }
  }

  if (result.ok && user.email) {
    try {
      await SendPaymentProofUploadedEmail({
        to: user.email,
        customerName: user.first_name,
        orderId,
      });
    } catch (err) {
      console.error("Failed to send payment proof uploaded email: ", err);
    }
  }

  return result;
}

export async function cancelOrderByUserAction(orderId: string): Promise<SimpleActionResult> {
  const user = await getCurrentDbUserOrThrow();

  const buyerRef = { value: null as { email: string; first_name: string } | null };

  const result = await withTransaction(async (query) => {
    const orderResult = await query(
      `SELECT id, status FROM orders WHERE id = $1 AND user_id = $2 FOR UPDATE`,
      [orderId, user.id],
    );
    const order = orderResult.rows[0];

    if (!order) {
      return { ok: false, message: 'Order not found.' };
    }

    if (order.status !== 'AWAITING_PAYMENT' && order.status !== 'PAYMENT_REVIEW') {
      return { ok: false, message: 'This order can no longer be cancelled.' };
    }

    await query(`UPDATE orders SET status = 'CANCELLED' WHERE id = $1`, [orderId]);

    const restockResult = await query(
      `
      SELECT variant_id, SUM(quantity)::integer AS quantity
      FROM (
        SELECT oi.variant_id, oi.quantity
        FROM order_items oi
        WHERE oi.order_id = $1 AND oi.variant_id IS NOT NULL

        UNION ALL

        SELECT bi.variant_id, oi.quantity
        FROM order_items oi
        JOIN bundle_items bi ON bi.bundle_id = oi.bundle_id
        WHERE oi.order_id = $1 AND oi.bundle_id IS NOT NULL
      ) reserved_items
      GROUP BY variant_id
      `,
      [orderId],
    );

    for (const item of restockResult.rows as { variant_id: string; quantity: number }[]) {
      await query(`UPDATE product_variants SET stock = stock + $2 WHERE id = $1`, [item.variant_id, item.quantity]);
    }

    await query(
      `INSERT INTO order_status_logs (order_id, status, note, changed_by_user_id) VALUES ($1, 'CANCELLED', $2, $3)`,
      [orderId, 'Order cancelled by buyer.', user.id],
    );

    buyerRef.value = { email: user.email, first_name: user.first_name };

    return { ok: true, message: 'Order cancelled.' };
  });

  if (result.ok) {
    revalidatePath(`/account/orders/${orderId}`);
    revalidatePath('/account/orders');
  }

  if (result.ok && buyerRef.value?.email) {
    try {
      await SendOrderCancelledEmail({
        to: buyerRef.value.email,
        customerName: buyerRef.value.first_name,
        orderId,
      });
    } catch (err) {
      console.error('Failed to send order cancelled email:', err);
    }
  }

  return result;
}

export async function updateOrderStatusAction(orderId: string, status: string, commentInput = ''): Promise<SimpleActionResult> {
  const admin = await requireOrderAdmin();
  const comment = commentInput.trim();

  if (!isOrderStatus(status)) {
    return { ok: false, message: 'Invalid order status.' };
  }

  if (comment.length > MAX_TIMELINE_COMMENT_LENGTH) {
    return { ok: false, message: `Comment must be ${MAX_TIMELINE_COMMENT_LENGTH} characters or fewer.` };
  }

  const buyerRef = { value: null as { email: string; first_name: string } | null };

  const result = await withTransaction(async (query) => {
    if (status === 'SHIPPED') {
      const orderResult = await query(
        `
        SELECT delivery_type, shipping_tracking_number, shipping_provider
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

      if (order.delivery_type === 'DELIVERY' && (!order.shipping_tracking_number || !order.shipping_provider)) {
        return { ok: false, message: 'Add a shipping provider and number before marking the order as shipped.' };
      }
    }

    if (status === 'CANCELLED') {
      const currentResult = await query(
        `SELECT status FROM orders WHERE id = $1 FOR UPDATE`,
        [orderId],
      );
      const current = currentResult.rows[0];
      if (!current) {
        return { ok: false, message: 'Order not found.' };
      }
      if (current.status === 'CANCELLED') {
        return { ok: false, message: 'Order is already cancelled.' };
      }
    }

    const updateResult = await query(
      `UPDATE orders SET status = $2::order_status WHERE id = $1 RETURNING id`,
      [orderId, status],
    );

    if (updateResult.rowCount === 0) {
      return { ok: false, message: 'Order not found.' };
    }

    let note: string;
    if (status === 'CANCELLED') {
      note = comment ? `Order cancelled by admin. Reason: ${comment}` : 'Order cancelled by admin.';
    } else {
      note = comment ? `Status manually changed to ${status}.\nReason: ${comment}` : `Status manually changed to ${status}.`;
    }

    await query(
      `
      INSERT INTO order_status_logs (order_id, status, note, changed_by_user_id)
      VALUES ($1, $2::order_status, $3, $4)
      `,
      [orderId, status, note, admin.id],
    );

    if (status === 'CANCELLED') {
      const restockResult = await query(
        `
        SELECT variant_id, SUM(quantity)::integer AS quantity
        FROM (
          SELECT oi.variant_id, oi.quantity
          FROM order_items oi
          WHERE oi.order_id = $1 AND oi.variant_id IS NOT NULL

          UNION ALL

          SELECT bi.variant_id, oi.quantity
          FROM order_items oi
          JOIN bundle_items bi ON bi.bundle_id = oi.bundle_id
          WHERE oi.order_id = $1 AND oi.bundle_id IS NOT NULL
        ) reserved_items
        GROUP BY variant_id
        `,
        [orderId],
      );

      for (const item of restockResult.rows as { variant_id: string; quantity: number }[]) {
        await query(`UPDATE product_variants SET stock = stock + $2 WHERE id = $1`, [item.variant_id, item.quantity]);
      }

      const buyerResult = await query(
        `SELECT u.email, u.first_name FROM orders o JOIN users u ON u.id = o.user_id WHERE o.id = $1`,
        [orderId],
      );
      buyerRef.value = buyerResult.rows[0] ?? null;
    }

    return { ok: true, message: 'Status updated.' };
  });

  if (result.ok) {
    revalidatePath(`/admin/kk/orders/${orderId}`);
    revalidatePath(`/admin/it/orders/${orderId}`);
    revalidatePath(`/account/orders/${orderId}`);
  }

  if (result.ok && status === 'CANCELLED' && buyerRef.value?.email) {
    try {
      await SendOrderCancelledEmail({
        to: buyerRef.value.email,
        customerName: buyerRef.value.first_name,
        orderId,
      });
    } catch (err) {
      console.error('Failed to send order cancelled email:', err);
    }
  }

  return result;
}

export async function addOrderTimelineCommentAction(orderId: string, commentInput: string): Promise<SimpleActionResult> {
  const admin = await requireOrderAdmin();
  const normalized = normalizeTimelineComment(commentInput);

  if (!normalized.ok) {
    return normalized;
  }

  const result = await withTransaction(async (query) => {
    const orderResult = await query(
      `
      SELECT id, status
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

    await query(
      `
      INSERT INTO order_status_logs (order_id, status, note, changed_by_user_id)
      VALUES ($1, $2::order_status, $3, $4)
      `,
      [orderId, order.status, `Admin comment: ${normalized.comment}`, admin.id],
    );

    return { ok: true, message: 'Comment added.' };
  });

  if (result.ok) {
    revalidatePath(`/admin/kk/orders/${orderId}`);
    revalidatePath(`/admin/it/orders/${orderId}`);
  }

  return result;
}

export async function updatePickupDetailsAction(
  orderId: string,
  detailsInput: string,
): Promise<SimpleActionResult> {
  const admin = await requireOrderAdmin();

  const details = detailsInput.trim();

  if (!details) {
    return { ok: false, message: 'Enter pickup details.' };
  }

  if (details.length > 500) {
    return { ok: false, message: 'Pickup details must be 500 characters or fewer.' };
  }

  return withTransaction(async (query) => {
    const result = await query(
      `
      UPDATE orders
      SET pickup_details = $2
      WHERE id = $1 AND delivery_type = 'PICKUP'
      RETURNING id, status
      `,
      [orderId, details],
    );

    if (result.rowCount === 0) {
      return { ok: false, message: 'Order not found or not a pickup order.' };
    }

    const order = result.rows[0];

    await query(
      `
      INSERT INTO order_status_logs (order_id, status, note, changed_by_user_id)
      VALUES ($1, $2::order_status, $3, $4)
      `,
      [orderId, order.status, `Pickup details updated: ${truncateLogValue(details, 120)}`, admin.id],
    );

    revalidatePath(`/admin/kk/orders/${orderId}`);
    revalidatePath(`/admin/it/orders/${orderId}`);
    revalidatePath(`/account/orders/${orderId}`);

    return { ok: true, message: 'Pickup details saved.' };
  });
}

export async function updateShippingTrackingNumberAction(
  orderId: string,
  providerInput: string,
  trackingNumberInput: string,
): Promise<SimpleActionResult> {
  const admin = await requireOrderAdmin();

  const provider = providerInput.trim();
  const trackingNumber = trackingNumberInput.trim();

  if (!provider) {
    return { ok: false, message: 'Choose a shipping provider before marking the order as shipped.' };
  }

  if (provider.length > 100) {
    return { ok: false, message: 'Shipping provider must be 100 characters or fewer.' };
  }

  if (!trackingNumber) {
    return { ok: false, message: 'Enter a shipping number before marking the order as shipped.' };
  }

  if (trackingNumber.length > 120) {
    return { ok: false, message: 'Shipping number must be 120 characters or fewer.' };
  }

  const buyerRef = { value: null as { email: string; first_name: string; sendcloud_parcel_id: number | null } | null };

  const result = await withTransaction(async (query) => {
    const updateResult = await query(
      `
      UPDATE orders
      SET shipping_provider = $2, shipping_tracking_number = $3, status = 'SHIPPED'
      WHERE id = $1 AND delivery_type = 'DELIVERY' AND status IN ('PROCESSING', 'SHIPPED')
      RETURNING id
      `,
      [orderId, provider, trackingNumber],
    );

    if (updateResult.rowCount === 0) {
      return { ok: false, message: 'Only delivery orders in processing or shipped status can receive a shipping number.' };
    }

    await query(
      `
      INSERT INTO order_status_logs (order_id, status, note, changed_by_user_id)
      VALUES ($1, 'SHIPPED', $2, $3)
      `,
      [orderId, `Shipping saved: ${provider} ${trackingNumber}`, admin.id],
    );

    const buyerResult = await query(
      `
      SELECT u.email, u.first_name, o.sendcloud_parcel_id
      FROM orders o JOIN users u ON u.id = o.user_id
      WHERE o.id = $1
      `,
      [orderId],
    );
    buyerRef.value = buyerResult.rows[0] ?? null;

    return { ok: true, message: 'Shipping number saved.' };
  });

  if (result.ok) {
    revalidatePath(`/admin/kk/orders/${orderId}`);
    revalidatePath(`/admin/it/orders/${orderId}`);
    revalidatePath(`/account/orders/${orderId}`);
  }

  if (result.ok && buyerRef.value?.email && !buyerRef.value.sendcloud_parcel_id) {
    try {
      await SendOrderShippedEmail({
        to: buyerRef.value.email,
        customerName: buyerRef.value.first_name,
        orderId,
        shippingProvider: provider,
        trackingNumber,
      });
    } catch (err) {
      console.error('Failed to send order shipped email: ', err);
    }
  }

  return result;
}

export async function approvePaymentAction(orderId: string): Promise<SimpleActionResult> {
  const admin = await requireOrderAdmin();

  const detailsRef: { value: any | null } = { value: null };

  const result = await withTransaction(async (query) => {
    const updateResult = await query(
      `
      UPDATE orders
      SET status = 'PROCESSING'
      WHERE id = $1 AND status = 'PAYMENT_REVIEW' AND payment_proof_data IS NOT NULL
      RETURNING id
      `,
      [orderId],
    );

    if (updateResult.rowCount === 0) {
      return { ok: false, message: 'Only confirmed orders with proof can be approved.' };
    }

    await query(
      `
      INSERT INTO order_status_logs (order_id, status, note, changed_by_user_id)
      VALUES ($1, 'PROCESSING', $2, $3)
      `,
      [orderId, 'Payment approved by admin.', admin.id],
    );

    const detailsResult = await query(
      `
      SELECT o.delivery_type, o.delivery_address, o.shipping_method_id, 
        u.email, u.first_name, u.last_name,
        COALESCE(SUM(p.weight_g * oi.quantity), 500) AS total_weight_g
      FROM orders o 
      JOIN users u ON u.id = o.user_id 
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN product_variants pv ON pv.id = oi.variant_id
      LEFT JOIN products p ON p.id = pv.product_id
      WHERE o.id = $1
      GROUP BY o.id, o.delivery_type, o.delivery_address, o.shipping_method_id, u.email, u.first_name, u.last_name
      `,
      [orderId],
    );
    detailsRef.value = detailsResult.rows[0] ?? null;

    return { ok: true, message: 'Payment approved.' };
  });

  if (result.ok) {
    revalidatePath('/admin/kk/payments');
    revalidatePath('/admin/it/payments');
    revalidatePath(`/admin/kk/orders/${orderId}`);
    revalidatePath(`/admin/it/orders/${orderId}`);
    revalidatePath(`/account/orders/${orderId}`);
  }

  if (result.ok && detailsRef.value?.delivery_type === 'DELIVERY') {
    try {
      const senderAddressId = Number(process.env.SENDCLOUD_SENDER_ADDRESS_ID);
      if (!process.env.SENDCLOUD_SENDER_ADDRESS_ID || isNaN(senderAddressId)) {
        throw new Error('SENDCLOUD_SENDER_ADDRESS_ID env var is missing or not a valid number');
      }

      const d = detailsRef.value;
      const addr = d.delivery_address as DeliveryAddress;

      const parcel = await createParcel({
        name: `${d.first_name} ${d.last_name ?? ''}`.trim(),
        address: addr.street,
        city: addr.city,
        postal_code: addr.postcode,
        country: addr.country,
        weight: Math.max(Number(d.total_weight_g), 100) / 1000,
        shipment: { id: d.shipping_method_id as string },
        sender_address: senderAddressId,
        order_number: orderId.slice(0, 8),
      });

      await withTransaction(async (query) => {
        await query(
          'UPDATE orders SET sendcloud_parcel_id = $2 WHERE id = $1',
          [orderId, parcel.id],
        );
        await query(
          `
          INSERT INTO order_status_logs (order_id, status, note, changed_by_user_id)
          VALUES ($1, 'PROCESSING', $2, $3)
          `,
          [orderId, `Shipping label created via SendCloud (parcel #${parcel.id}, tracking: ${parcel.tracking_number || 'pending'})`, admin.id],
        );
      });
    } catch (err) {
      console.error('Failed to create/save parcel: ', err);

      await db.query(
        `
        INSERT INTO order_status_logs (order_id, status, note, changed_by_user_id)
        VALUES ($1, 'PROCESSING', $2, $3)
        `,
        [orderId, `Failed to create shipping parcel: ${err instanceof Error ? err.message : String(err)}`.slice(0, 255), admin.id],
      );
    }
  }

  if (result.ok && detailsRef.value?.email) {
    try {
      await SendPaymentApprovedEmail({
        to: detailsRef.value.email,
        customerName: detailsRef.value.first_name,
        orderId,
      });
    } catch (err) {
      console.error('Failed to send payment approved email: ', err);
    }
  }

  return result;
}

export async function rejectPaymentAction(orderId: string): Promise<SimpleActionResult> {
  const admin = await requireOrderAdmin();

  const buyerRef = { value: null as { email: string; first_name: string} | null };

  const result = await withTransaction(async (query) => {
    const updateResult = await query(
      `
      UPDATE orders
      SET
        status = 'AWAITING_PAYMENT',
        payment_proof_url = NULL,
        payment_proof_data = NULL,
        payment_proof_content_type = NULL,
        payment_expires_at = ${getPaymentExpiresAtExpression()}
      WHERE id = $1 AND status = 'PAYMENT_REVIEW'
      RETURNING id
      `,
      [orderId],
    );

    if (updateResult.rowCount === 0) {
      return { ok: false, message: 'Only confirmed orders can be rejected.' };
    }

    await query(
      `
      INSERT INTO order_status_logs (order_id, status, note, changed_by_user_id)
      VALUES ($1, 'AWAITING_PAYMENT', $2, $3)
      `,
      [orderId, 'Payment proof rejected. Waiting for a new upload.', admin.id],
    );

    const buyerResult = await query(
      `
      SELECT u.email, u.first_name
      FROM orders o JOIN users u on u.id = o.user_id
      WHERE o.id = $1
      `,
      [orderId],
    );
    buyerRef.value = buyerResult.rows[0] ?? null;

    return { ok: true, message: 'Payment rejected.' };
  });

  if (result.ok) {
    revalidatePath('/admin/kk/payments');
    revalidatePath('/admin/it/payments');
    revalidatePath(`/admin/kk/orders/${orderId}`);
    revalidatePath(`/admin/it/orders/${orderId}`);
    revalidatePath(`/account/orders/${orderId}`);
  }

  if (result.ok && buyerRef.value?.email) {
    try {
      await SendPaymentRejectedEmail({
        to: buyerRef.value.email,
        customerName: buyerRef.value.first_name,
        orderId,
      });
    } catch (err) {
      console.error("Failed to send payment rejected email: ", err);
    }
  }

  return result;
}

export async function getShippingOptionsAction(
  toCountry: string,
): Promise<{ ok: true; options: ShippingOption[] } | { ok: false; message: string }> {
  const user = await getCurrentDbUserOrThrow();

  const weightG = await getCartWeightG(user.id);

  try {
    const methods = await getShippingMethods(toCountry, weightG);

    if (methods.length === 0) {
      return { ok: false, message: 'No shipping options available for the provided address.' };
    }

    const options: ShippingOption[] = methods.map((method) => ({
      methodId: method.id,
      name: method.name,
      carrier: method.carrier,
      costCents: Math.round(Number(method.price) * 100),
      leadTimeHours: method.lead_time_hours,
    }));

    options.sort((a,b) => a.costCents - b.costCents);

    return { ok: true, options };
  } catch (err) {
    console.error('SendCloud getShippingMethods failed:', err);
    return { ok: false, message: 'Failed to fetch shipping options. Please try again later.' };
  }
}

export async function getParcelLabelUrlAction(
  orderId: string,
): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  await requireOrderAdmin();

  const res = await db.query(
    'SELECT sendcloud_parcel_id FROM orders WHERE id = $1',
    [orderId],
  );
  const row = res.rows[0];
  
  if (!row?.sendcloud_parcel_id) {
    return { ok: false, message: 'No parcel associated with this order.' };
  }

  try {
    const parcel = await getParcel(row.sendcloud_parcel_id);
    const url = parcel.documents?.find(d => d.type === 'label')?.link;
    if (!url) return { ok: false, message: 'No label available for this parcel.' };
    return { ok: true, url };
  } catch (err) {
    console.error('Failed to fetch parcel details:', err);
    return { ok: false, message: 'Failed to fetch label URL. Please try again later.' };
  }
}