import { EmailButton, EmailDivider, EmailHeading, EmailLayout, EmailText } from "./email-layout";

export default function OrderDoneEmail(params: {
  customerName: string;
  orderId: string;
}) {
  return (
    <EmailLayout preview={`Your order #${params.orderId.slice(0, 8)} is complete`}>
      <EmailHeading>Order Complete</EmailHeading>
      <EmailText>
        Hi {params.customerName}, your order <strong>#{params.orderId.slice(0, 8)}</strong> has been marked as complete.
      </EmailText>
      <EmailText>
        We hope you enjoy your purchase! If you have any questions or concerns, feel free to reach out to us.
      </EmailText>
      <EmailDivider />
      <EmailButton href={`https://shop.ppijerman.org/account/orders/${params.orderId}`}>
        View Order
      </EmailButton>
      <EmailText style={{ textAlign: "center", marginTop: "16px" }}>
        Thank you for shopping with us!
      </EmailText>
    </EmailLayout>
  );
}
