import { Body, Container, Head, Heading, Html, Link, Text, } from "@react-email/components"

export default function PaymentProofUploadedEmail(params: { 
  customerName: string;
  orderId: string ;
}) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9f9f9' }}>
        <Container style={{ maxWidth: '600px', margin: 'auto', padding: '24px' }}>
          <Heading>Payment Proof Received</Heading>
          <Text>Hi {params.customerName}, we received your payment proof for order <strong>#{params.orderId.slice(0, 8)}</strong>.</Text>
          <Text>Our team will review it within 1–2 business days. You will receive another email once it is approved.</Text>
          <Text>
            <Link href={`https://ppij-shop.de/account/orders/${params.orderId}`}>View your order</Link>
          </Text>
          <Text>Thank you for your patience!</Text>
        </Container>
      </Body>
    </Html>
  )
}