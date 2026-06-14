import { EmailButton, EmailDivider, EmailHeading, EmailLayout, EmailText } from "./email-layout";

export default function OrderExpiredEmail(params: {
  customerName: string;
  orderId: string;
}) {
  return (
    <EmailLayout preview={`Your order #${params.orderId.slice(0, 8)} has expired`}>
      <EmailHeading>Order Cancelled — Payment Window Expired</EmailHeading>
      <EmailText>
        Hi {params.customerName}, your order <strong>#{params.orderId.slice(0, 8)}</strong> has been cancelled because no valid payment proof was uploaded within the payment window.
      </EmailText>
      <EmailText>
        If you still want to order, you are welcome to place a new one.
      </EmailText>
      <EmailDivider />
      <EmailButton href="https://ppij-shop.de/catalog">
        Browse the Shop
      </EmailButton>
      <EmailText style={{ textAlign: "center", marginTop: "16px" }}>
        If you think this is a mistake, please contact us directly.
      </EmailText>
    </EmailLayout>
  );
}
