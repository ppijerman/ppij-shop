import { EmailButton, EmailDivider, EmailHeading, EmailLayout, EmailText, OrderItemsTable } from "./email-layout";

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
    <EmailLayout preview={`Payment proof from ${params.customerName}`}>
      <EmailHeading>New Payment Proof Submitted</EmailHeading>
      <EmailText>
        <strong>{params.customerName}</strong> ({params.customerEmail}) has uploaded a payment proof for order <strong>#{params.orderId.slice(0, 8)}</strong>.
      </EmailText>
      <EmailDivider />
      <OrderItemsTable
        items={params.items}
        itemsTotal={params.itemsTotal}
        shippingCost={params.shippingCost}
        total={params.total}
      />
      <EmailDivider />
      <EmailButton href={`https://shop.ppijerman.org/admin/kk/orders/${params.orderId}`}>
        Review Payment
      </EmailButton>
    </EmailLayout>
  );
}
