import { getAllOrders } from '@/lib/dal/orders';
import AdminOrdersList from '@/components/admin/AdminOrdersList';

export default async function AdminOrders({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  const orders = await getAllOrders();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48 }}>ORDERS</h1>
      </div>

      <AdminOrdersList orders={orders} role={role} />
    </div>
  );
}
