import { EmailButton, EmailDivider, EmailHeading, EmailLayout, EmailText } from "./email-layout";

export default function PaymentProofUploadedEmail(params: {
  customerName: string;
  orderId: string;
}) {
  return (
    <EmailLayout preview="We received your payment proof">
      <EmailHeading>Payment Proof Received</EmailHeading>
      <EmailText>
        Hi {params.customerName}, we received your payment proof for order <strong>#{params.orderId.slice(0, 8)}</strong>.
      </EmailText>
      <EmailText>
        Our team will review it within 1–2 business days. You will receive another email once it is approved.
      </EmailText>
      <EmailDivider />
      <EmailButton href={`https://shop.ppijerman.org/account/orders/${params.orderId}`}>
        View Order
      </EmailButton>
      <EmailText style={{ textAlign: "center", marginTop: "16px" }}>
        Thank you for your patience!
      </EmailText>
    </EmailLayout>
  );
}
