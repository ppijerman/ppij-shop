import { EmailButton, EmailDivider, EmailHeading, EmailLayout, EmailText } from "./email-layout";

export default function PaymentRejectedEmail(params: {
  customerName: string;
  orderId: string;
}) {
  return (
    <EmailLayout preview="Action required: your payment proof was not accepted">
      <EmailHeading danger>Payment Proof Not Accepted</EmailHeading>
      <EmailText>
        Hi {params.customerName}, unfortunately your payment proof for order <strong>#{params.orderId.slice(0, 8)}</strong> could not be accepted.
      </EmailText>
      <EmailText style={{ fontWeight: "700", color: "#b91c1c" }}>
        You have 30 minutes to upload a new proof before the order is cancelled.
      </EmailText>
      <EmailDivider />
      <EmailButton href={`https://ppij-shop.de/account/orders/${params.orderId}`} danger>
        Upload New Proof Now
      </EmailButton>
      <EmailText style={{ textAlign: "center", marginTop: "16px" }}>
        If you have any questions, please contact us directly.
      </EmailText>
    </EmailLayout>
  );
}
