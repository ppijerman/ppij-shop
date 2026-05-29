import { getOrderById, getOrderItems } from '@/lib/dal/orders';
import { notFound } from 'next/navigation';
import OrderDetailsForm from './OrderDetailsForm';

export default async function OrderDetail({ params }: { params: Promise<{ id: string, role: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  
  if (!order) notFound();

  const items = await getOrderItems(id);

  return (
    <div>
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>ORDERS / {id.substring(0, 8)}</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48 }}>ORDER DETAILS</h1>
      </div>
      <OrderDetailsForm initialOrder={order} items={items} />
    </div>
  );
}
