import { getResend, getFromEmail } from "@/lib/resend";
import OrderConfirmationEmail from "@/lib/emails/order-confirmation";
import OrderCancelledEmail from "@/lib/emails/order-cancelled";
import OrderExpiredEmail from "@/lib/emails/order-expired";
import PaymentApprovedEmail from "../emails/payment-approved";
import PaymentProofUploadedEmail from "../emails/payment-proof-uploaded";
import PaymentRejectedEmail from "../emails/payment-rejected";
import OrderShippedEmail from "../emails/order-shipped";

export async function SendOrderConfirmationEmail(params: {
  to: string;
  customerName: string;
  orderId: string;
  total: string;
  items: { name: string; quantity: number; price: string }[];
}) {
  const { data, error } = await getResend().emails.send({
    from: getFromEmail(),
    to: params.to,
    subject: `Order Confirmed - #${params.orderId}`,
    react: OrderConfirmationEmail({
      customerName: params.customerName,
      orderId: params.orderId,
      total: params.total,
      items: params.items,
    }),
  });

  if (error) {
    console.error("Resend error: ", error);
    throw new Error("Failed to send order confirmation email");
  }

  return data;
}

export async function SendOrderCancelledEmail(params: {
  to: string;
  customerName: string;
  orderId: string;
}) {
  const { data, error } = await getResend().emails.send({
    from: getFromEmail(),
    to: params.to,
    subject: `Order Cancelled - #${params.orderId}`,
    react: OrderCancelledEmail({
      customerName: params.customerName,
      orderId: params.orderId,
    }),
  });

  if (error) {
    console.error("Resend error: ", error);
    throw new Error("Failed to send order cancelled email");
  }

  return data;
}

export async function SendOrderExpiredEmail(params: {
  to: string;
  customerName: string;
  orderId: string;
}) {
  const { data, error } = await getResend().emails.send({
    from: getFromEmail(),
    to: params.to,
    subject: `Order Cancelled — Payment Window Expired - #${params.orderId}`,
    react: OrderExpiredEmail({
      customerName: params.customerName,
      orderId: params.orderId,
    }),
  });

  if (error) {
    console.error("Resend error: ", error);
    throw new Error("Failed to send order expired email");
  }

  return data;
}

export async function SendPaymentApprovedEmail(params: {
  to: string;
  customerName: string;
  orderId: string;
}) {
  const { data, error } = await getResend().emails.send({
    from: getFromEmail(),
    to: params.to,
    subject: `Payment Approved - Order #${params.orderId}`,
    react: PaymentApprovedEmail({
      customerName: params.customerName,
      orderId: params.orderId,
    }),
  });

  if (error) {
    console.error("Resend error: ", error);
    throw new Error("Failed to send payment approved email");
  }

  return data;
}

export async function SendPaymentProofUploadedEmail(params: {
  to: string;
  customerName: string;
  orderId: string;
}) {
  const { data, error } = await getResend().emails.send({
    from: getFromEmail(),
    to: params.to,
    subject: `Payment Proof has been uploaded - Order #${params.orderId}`,
    react: PaymentProofUploadedEmail({
      customerName: params.customerName,
      orderId: params.orderId,
    }),
  });

  if (error) {
    console.error("Resend error: ", error);
    throw new Error("Failed to send payment proof uploaded email");
  }

  return data;
}

export async function SendPaymentRejectedEmail(params: {
  to: string;
  customerName: string;
  orderId: string;
}) {
  const { data, error } = await getResend().emails.send({
    from: getFromEmail(),
    to: params.to,
    subject: `Payment Proof has been rejected - Order #${params.orderId}`,
    react: PaymentRejectedEmail({
      customerName: params.customerName,
      orderId: params.orderId
    })
  })

  if (error) {
    console.error("Resend error: ", error);
    throw new Error("Failed to send payment rejected email");
  }

  return data;
}

export async function SendOrderShippedEmail(params: {
  to: string;
  customerName: string;
  orderId: string;
  shippingProvider: string;
  trackingNumber: string;
}) {
  const { data, error } = await getResend().emails.send({
    from: getFromEmail(),
    to: params.to,
    subject: `Your Order Has Been Shipped - #${params.orderId}`,
    react: OrderShippedEmail({
      customerName: params.customerName,
      orderId: params.orderId,
      shippingProvider: params.shippingProvider,
      trackingNumber: params.trackingNumber,
    })
  })

  if (error) {
    console.error("Resend error: ", error);
    throw new Error("Failed to send order shipped email");
  }

  return data;
}
