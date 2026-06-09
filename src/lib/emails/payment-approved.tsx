import { Html, Head, Body, Container, Heading, Text, Link } from "@react-email/components";

export default function PaymentApprovedEmail(params: {
  customerName: string;
  orderId: string;
}) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9f9f9' }}>
        <Container style={{ maxWidth: '600px', margin: 'auto', padding: '24px' }}>
          <Heading>Payment Approved</Heading>
          <Text>Hi {params.customerName}, your payment for order <strong>#{params.orderId}</strong> has been approved.</Text>
          <Text>We are now processing your order and will notify you once it has been shipped.</Text>
          <Text>
            <Link href={`https://ppij-shop.de/account/orders/${params.orderId}`}>View your order</Link>
          </Text>
          <Text>Thank you for shopping with us!</Text>
        </Container>
      </Body>
    </Html>
  )
}