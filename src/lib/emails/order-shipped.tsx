import {
  Body, Container, Head, Heading, Html, Link, Text,
} from '@react-email/components';

export default function OrderShippedEmail(params: {
  customerName: string;
  orderId: string;
  shippingProvider: string;
  trackingNumber: string;
}) {
  const trackingUrl = '#';

  return(
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9f9f9' }}>
        <Container style={{ maxWidth: '600px', margin: 'auto', padding: '24px' }}>
          <Heading>Your Order Has Been Shipped</Heading>
          <Text>Hi {params.customerName}, your order <strong>#{params.orderId}</strong> is on its way!</Text>
          <Text>
            <strong>Carrier:</strong> {params.shippingProvider}
          </Text>
          <Text>
            <strong>Tracking number:</strong> {params.trackingNumber}
          </Text>
          <Text>
            <Link href={trackingUrl}>Track your parcel</Link>
          </Text>
          <Text>
            <Link href={`https://ppij-shop.de/account/orders/${params.orderId}`}>View your order</Link>
          </Text>
          <Text>Thank you for shopping with us!</Text>
        </Container>
      </Body>
    </Html>
  )
}