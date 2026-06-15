import { EmailButton, EmailDivider, EmailHeading, EmailLayout, EmailText, InfoBox } from "./email-layout";

export default function PickupLocationSetEmail(params: {
  customerName: string;
  orderId: string;
  pickupDetails: string;
}) {
  return (
    <EmailLayout preview="Your pickup location is ready">
      <EmailHeading>Pickup Location Ready</EmailHeading>
      <EmailText>
        Hi {params.customerName}, your pickup details for order <strong>#{params.orderId.slice(0, 8)}</strong> have been set.
      </EmailText>
      <InfoBox>
        <EmailText style={{ fontWeight: "600", margin: "0 0 8px" }}>Pickup details</EmailText>
        <EmailText style={{ whiteSpace: "pre-wrap", margin: 0 }}>{params.pickupDetails}</EmailText>
      </InfoBox>
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
