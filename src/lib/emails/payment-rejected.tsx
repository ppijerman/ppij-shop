import {
  Body, Container, Head, Heading, Html, Link, Text,
} from '@react-email/components';

export default function PaymentRejectedEmail(params: {
  customerName: string;
  orderId: string
}) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9f9f9' }}>
      <Container style={{ maxWidth: '600px', margin: 'auto', padding: '24px' }}>
          <Heading>Payment Proof Not Accepted</Heading>
          <Text>Hi {params.customerName}, unfortunately your payment proof for order <strong>#{params.orderId}</strong> could not be accepted.</Text>
          <Text>
            <strong>You have 30 minutes to upload a new proof</strong> before the order is cancelled.
          </Text>
          <Text>
            <Link href={`https://ppij-shop.de/account/orders/${params.orderId}`}>Upload new proof now</Link>
          </Text>
          <Text>If you have any questions, please contact us directly.</Text>
        </Container>
      </Body>
    </Html>
  )
}