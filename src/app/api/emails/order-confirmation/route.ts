import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { OrderConfirmationEmail } from "@/lib/emails/order-confirmation";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { to, customerName, orderId, total, items } = body;

  if (!to || !orderId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: `Order Confirmed - #${orderId}`,
    react: OrderConfirmationEmail({
      customerName, orderId, total, items
    }),
  });

  if (error) {
    console.error("Resend error: ", error);
    return NextResponse.json({ error: "Failed to send email"}, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}