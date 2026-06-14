import { Html, Head, Body, Container, Heading, Text, Link } from "@react-email/components";

export default function PickupLocationSetEmail(params: {
  customerName: string;
  orderId: string;
  pickupDetails: string;
}) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9f9f9' }}>
        <Container style={{ maxWidth: '600px', margin: 'auto', padding: '24px' }}>
          <Heading>Pickup Location Ready</Heading>
          <Text>Hi {params.customerName}, your pickup details for order <strong>#{params.orderId.slice(0, 8)}</strong> have been set.</Text>
          <Text>
            <strong>Pickup details:</strong>
          </Text>
          <Text style={{ whiteSpace: 'pre-wrap' }}>{params.pickupDetails}</Text>
          <Text>
            <Link href={`https://ppij-shop.de/account/orders/${params.orderId}`}>View your order</Link>
          </Text>
          <Text>Thank you for shopping with us!</Text>
        </Container>
      </Body>
    </Html>
  );
}
