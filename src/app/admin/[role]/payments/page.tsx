import { getAllOrders } from '@/lib/dal/orders';
import AdminPaymentsForm from './PaymentsListForm';
import { notFound } from 'next/navigation';

export default async function AdminPayments({ params }: { params: Promise<{ role: string }> }) {
  const orders = await getAllOrders();
  if (!orders) notFound();
  return <AdminPaymentsForm orders={orders} />
}
