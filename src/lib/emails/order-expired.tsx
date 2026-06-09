import {
  Body, Container, Head, Heading, Html, Link, Text,
} from '@react-email/components';

export default function OrderExpiredEmail(params: {
  customerName: string;
  orderId: string;
}) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9f9f9' }}>
        <Container style={{ maxWidth: '600px', margin: 'auto', padding: '24px' }}>
          <Heading>Order Cancelled — Payment Window Expired</Heading>
          <Text>Hi {params.customerName}, your order <strong>#{params.orderId}</strong> has been cancelled because no valid payment proof was uploaded within the payment window.</Text>
          <Text>If you still want to order, you are welcome to place a new one.</Text>
          <Text>
            <Link href="https://ppij-shop.de/catalog">Browse the shop</Link>
          </Text>
          <Text>If you think this is a mistake, please contact us directly.</Text>
        </Container>
      </Body>
    </Html>
  );
}
