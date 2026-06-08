import { resend } from "@/lib/resend";
import { OrderConfirmationEmail } from "@/lib/emails/order-confirmation";

interface SendOrderEmailParams {
  to: string;
  customerName: string;
  orderId: string;
  total: string;
  items: { name: string; quantity: number; price: string }[];
}

export async function SendOrderConfirmationEmail(params: SendOrderEmailParams) {
  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
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