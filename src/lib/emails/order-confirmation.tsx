import {
  Body, Container, Head, Heading, Html, Row, Section, Text
} from "@react-email/components";

interface OrderConfirmationEmailProps {
  customerName: string;
  orderId: string;
  total: string;
  items: { name: string; quantity : number; price: string }[];
}

export default function OrderConfirmationEmail({ customerName, orderId, total, items }: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f9f9f9" }}>
        <Container style={{ maxWidth: "600px", margin: "auto", padding: "24px" }}>
          <Heading>Order Confirmed</Heading>
          <Text>Hi {customerName}, your order has been received.</Text>
          <Text>
            <strong>Order ID:</strong> {orderId}
          </Text>
          <Section>
            {(items ?? []).map((item) => (
              <Row key={item.name}>
                <Text>
                  {item.name} x {item.quantity} - {item.price}
                </Text>
              </Row>
            ))}
          </Section>
          <Text>
            <strong>Total: {total}</strong>
          </Text>
          <Text>Thank you for shopping with us!</Text>
        </Container>
      </Body>
    </Html>
  )
}