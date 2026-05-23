import { getCurrentDbUserOrThrow } from '@/lib/users';
import { getOrdersByUser } from '@/lib/dal/orders';
import Link from 'next/link';

export default async function OrdersPage() {
  const user = await getCurrentDbUserOrThrow();
  const orders = await getOrdersByUser(user.id);

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 32, letterSpacing: '0.02em' }}>
        ORDER HISTORY
      </h2>

      {orders.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Table Header (Hidden on Mobile) */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1.5fr 1fr 1fr 1fr 0.5fr', 
            padding: '16px 24px',
            borderBottom: '2px solid var(--black)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--muted)'
          }}>
            <span>Order ID</span>
            <span>Date</span>
            <span>Total</span>
            <span>Status</span>
            <span style={{ textAlign: 'right' }}>Actions</span>
          </div>

          {orders.map((order: any) => (
            <div 
              key={order.id}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '1.5fr 1fr 1fr 1fr 0.5fr', 
                padding: '24px',
                background: 'var(--cream-2)',
                alignItems: 'center',
                fontSize: 14
              }}
            >
              <span style={{ fontWeight: 600 }}>#{order.id.substring(0, 8)}</span>
              <span>{new Date(order.created_at).toLocaleDateString()}</span>
              <span style={{ fontWeight: 600 }}>€{Number(order.total_price).toFixed(2)}</span>
              <span>
                <span style={{ 
                  fontSize: 10, 
                  fontWeight: 700, 
                  padding: '4px 8px', 
                  background: 'var(--black)', 
                  color: 'white',
                  borderRadius: 4,
                  textTransform: 'uppercase'
                }}>
                  {order.status}
                </span>
              </span>
              <div style={{ textAlign: 'right' }}>
                <Link 
                  href={`/account/orders/${order.id}`}
                  style={{ 
                    color: 'var(--black)', 
                    textDecoration: 'underline',
                    fontSize: 12,
                    fontWeight: 600
                  }}
                >
                  VIEW
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '60px 0', textAlign: 'center', background: 'var(--cream-2)' }}>
          <p style={{ color: 'var(--muted)', marginBottom: 20 }}>You haven't placed any orders yet.</p>
          <Link 
            href="/catalog"
            style={{ 
              display: 'inline-block',
              padding: '12px 24px',
              background: 'var(--black)',
              color: 'var(--cream)',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 600
            }}
          >
            START SHOPPING
          </Link>
        </div>
      )}
    </div>
  );
}
