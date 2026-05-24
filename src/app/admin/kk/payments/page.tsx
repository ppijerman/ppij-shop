import { getAllOrders } from '@/lib/dal/orders';
import AdminPaymentsForm from './PaymentsListForm';
import { notFound } from 'next/navigation';

export default async function AdminPayments() {
  const orders = await getAllOrders();
  if (!orders) notFound();
  return <AdminPaymentsForm orders={orders} />
}
