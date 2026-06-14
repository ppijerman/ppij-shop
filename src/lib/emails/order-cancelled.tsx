import { EmailButton, EmailDivider, EmailHeading, EmailLayout, EmailText } from "./email-layout";

export default function OrderCancelledEmail(params: {
  customerName: string;
  orderId: string;
}) {
  return (
    <EmailLayout preview={`Your order #${params.orderId.slice(0, 8)} has been cancelled`}>
      <EmailHeading>Order Cancelled</EmailHeading>
      <EmailText>
        Hi {params.customerName}, your order <strong>#{params.orderId.slice(0, 8)}</strong> has been cancelled.
      </EmailText>
      <EmailText>
        If you still want to order, you are welcome to place a new order.
      </EmailText>
      <EmailDivider />
      <EmailButton href="https://ppij-shop.de/catalog">
        Browse the Shop
      </EmailButton>
      <EmailText style={{ textAlign: "center", marginTop: "16px" }}>
        If you have any questions, please contact us directly.
      </EmailText>
    </EmailLayout>
  );
}
