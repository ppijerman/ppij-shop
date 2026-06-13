import {
  Body, Container, Head, Heading, Html, Link, Text,
} from '@react-email/components';

export default function OrderCancelledEmail(params: {
  customerName: string;
  orderId: string;
}) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9f9f9' }}>
        <Container style={{ maxWidth: '600px', margin: 'auto', padding: '24px' }}>
          <Heading>Order Cancelled</Heading>
          <Text>Hi {params.customerName}, your order <strong>#{params.orderId.slice(0, 8)}</strong> has been cancelled.</Text>
          <Text>If you still want to order, you are welcome to place a new order.</Text>
          <Text>
            <Link href="https://ppij-shop.de/catalog">Browse the shop</Link>
          </Text>
          <Text>If you have any questions, please contact us directly.</Text>
        </Container>
      </Body>
    </Html>
  );
}