import { Body, Container, Head, Heading, Html, Link, Row, Section, Text } from "@react-email/components"

export default function AdminPaymentProofReceivedEmail(params: {
  customerName: string;
  customerEmail: string;
  orderId: string;
  items: { name: string; quantity: number; price: string }[];
  itemsTotal: string;
  shippingCost: string;
  total: string;
}) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9f9f9' }}>
        <Container style={{ maxWidth: '600px', margin: 'auto', padding: '24px' }}>
          <Heading>New Payment Proof Submitted</Heading>
          <Text>
            <strong>{params.customerName}</strong> ({params.customerEmail}) has uploaded a payment proof for order{' '}
            <strong>#{params.orderId}</strong>.
          </Text>
          <Section>
            {params.items.map((item) => (
              <Row key={item.name}>
                <Text>{item.name} x {item.quantity} — {item.price}</Text>
              </Row>
            ))}
          </Section>
          <Text><strong>Items Total: {params.itemsTotal}</strong></Text>
          <Text><strong>Shipping: {params.shippingCost}</strong></Text>
          <Text><strong>Total: {params.total}</strong></Text>
          <Text>
            <Link href={`https://ppij-shop.de/admin/kk/payments`}>Review payment</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
