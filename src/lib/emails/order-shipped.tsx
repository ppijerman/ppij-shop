import { EmailButton, EmailDivider, EmailHeading, EmailLayout, EmailText, InfoBox } from "./email-layout";

function getTrackingUrl(provider: string, trackingNumber: string): string {
  const p = provider.toUpperCase();
  if (p.includes('DHL')) return `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`;
  if (p.includes('DPD')) return `https://tracking.dpd.de/status/en_US/parcel/${trackingNumber}`;
  return '';
}

export default function OrderShippedEmail(params: {
  customerName: string;
  orderId: string;
  shippingProvider: string;
  trackingNumber: string;
}) {
  const trackingUrl = getTrackingUrl(params.shippingProvider, params.trackingNumber);

  return (
    <EmailLayout preview={`Your order #${params.orderId.slice(0, 8)} is on its way!`}>
      <EmailHeading>Your Order Has Been Shipped</EmailHeading>
      <EmailText>
        Hi {params.customerName}, your order <strong>#{params.orderId.slice(0, 8)}</strong> is on its way!
      </EmailText>
      <InfoBox>
        <EmailText style={{ margin: "0 0 6px" }}>
          <strong>Carrier:</strong> {params.shippingProvider}
        </EmailText>
        <EmailText style={{ margin: 0 }}>
          <strong>Tracking number:</strong> {params.trackingNumber}
        </EmailText>
      </InfoBox>
      <EmailDivider />
      {trackingUrl ? (
        <EmailButton href={trackingUrl}>
          Track Your Parcel
        </EmailButton>
      ) : null}
      <EmailButton href={`https://shop.ppijerman.org/account/orders/${params.orderId}`}>
        View Order
      </EmailButton>
      <EmailText style={{ textAlign: "center", marginTop: "16px" }}>
        Thank you for shopping with us!
      </EmailText>
    </EmailLayout>
  );
}
