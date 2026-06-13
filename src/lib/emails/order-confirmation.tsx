import {
  Body, Container, Head, Heading, Html, Row, Section, Text
} from "@react-email/components";

export default function OrderConfirmationEmail(params: {
  customerName: string;
  orderId: string;
  itemsTotal: string;
  shippingCost: string;
  total: string;
  items: { name: string; quantity : number; price: string }[];
}) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f9f9f9" }}>
        <Container style={{ maxWidth: "600px", margin: "auto", padding: "24px" }}>
          <Heading>Order Confirmed</Heading>
          <Text>Hi {params.customerName}, your order has been received.</Text>
          <Text>
            <strong>Order ID:</strong> {params.orderId.slice(0, 8)}
          </Text>
          <Section>
            {(params.items ?? []).map((item) => (
              <Row key={item.name}>
                <Text>
                  {item.name} x {item.quantity} - {item.price}
                </Text>
              </Row>
            ))}
          </Section>
          <Text>
            <strong>Items Total: {params.itemsTotal}</strong>
          </Text>
          <Text>
            <strong>Shipping Cost: {params.shippingCost}</strong>
          </Text>
          <Text>
            <strong>Total: {params.total}</strong>
          </Text>
          <Text>Thank you for shopping with us!</Text>
        </Container>
      </Body>
    </Html>
  )
}