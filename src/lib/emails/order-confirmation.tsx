import { EmailButton, EmailDivider, EmailHeading, EmailLayout, EmailText, OrderItemsTable } from "./email-layout";

export default function OrderConfirmationEmail(params: {
  customerName: string;
  orderId: string;
  itemsTotal: string;
  shippingCost: string;
  total: string;
  items: { name: string; quantity: number; price: string }[];
}) {
  return (
    <EmailLayout preview={`Order confirmed — #${params.orderId.slice(0, 8)}`}>
      <EmailHeading>Order Confirmed</EmailHeading>
      <EmailText>
        Hi {params.customerName}, your order has been received and is being processed.
      </EmailText>
      <EmailDivider />
      <EmailText style={{ fontWeight: "600", marginBottom: "8px" }}>
        Order #{params.orderId.slice(0, 8)}
      </EmailText>
      <OrderItemsTable
        items={params.items ?? []}
        itemsTotal={params.itemsTotal}
        shippingCost={params.shippingCost}
        total={params.total}
      />
      <EmailDivider />
      <EmailButton href={`https://shop.ppijerman.org/account/orders/${params.orderId}`}>
        View Order
      </EmailButton>
      <EmailText style={{ textAlign: "center", marginTop: "16px" }}>
        Thank you for shopping with us!
      </EmailText>
    </EmailLayout>
  );
}
