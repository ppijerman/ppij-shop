import { EmailButton, EmailDivider, EmailHeading, EmailLayout, EmailText } from "./email-layout";

export default function PaymentApprovedEmail(params: {
  customerName: string;
  orderId: string;
}) {
  return (
    <EmailLayout preview="Your payment has been approved">
      <EmailHeading>Payment Approved</EmailHeading>
      <EmailText>
        Hi {params.customerName}, your payment for order <strong>#{params.orderId.slice(0, 8)}</strong> has been approved.
      </EmailText>
      <EmailText>
        We are now processing your order and will notify you once it has been shipped.
      </EmailText>
      <EmailDivider />
      <EmailButton href={`https://ppij-shop.de/account/orders/${params.orderId}`}>
        View Order
      </EmailButton>
      <EmailText style={{ textAlign: "center", marginTop: "16px" }}>
        Thank you for shopping with us!
      </EmailText>
    </EmailLayout>
  );
}
