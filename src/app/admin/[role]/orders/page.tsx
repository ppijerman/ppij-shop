import { getAllOrders } from '@/lib/dal/orders';
import Link from 'next/link';

export default async function AdminOrders({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  const orders = await getAllOrders();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48 }}>ORDERS</h1>
      </div>

      <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--cream-2)' }}>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Order Id</th>
              <th style={thStyle}>Total</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order: any) => (
              <tr key={order.id} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={tdStyle}>{order.first_name} {order.last_name}</td>
                <td style={tdStyle}>{order.id}</td>
                <td style={tdStyle}>€{Number(order.total_price).toFixed(2)}</td>
                <td style={tdStyle}>{new Date(order.created_at).toLocaleDateString()}</td>
                <td style={tdStyle}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: 4, 
                    fontSize: 10, 
                    fontWeight: 600, 
                    background: getStatusColor(order.status),
                    color: 'white'
                  }}>
                    {order.status}
                  </span>
                </td>
                <td style={tdStyle}>
                  <Link 
                    href={`/admin/${role}/orders/${order.id}`}
                    style={{ color: 'var(--orange-deep)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
                  >
                    DETAILS →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '16px 24px',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'var(--muted)'
};

const tdStyle: React.CSSProperties = {
  padding: '20px 24px',
  fontSize: 14
};

function getStatusColor(status: string) {
  switch (status) {
    case 'PENDING': return '#f39200';
    case 'CONFIRMED': return '#2196f3';
    case 'PROCESSING': return '#9c27b0';
    case 'SHIPPED': return '#3f51b5';
    case 'DONE': return '#4caf50';
    case 'CANCELLED': return '#616161';
    default: return '#9e9e9e';
  }
}
