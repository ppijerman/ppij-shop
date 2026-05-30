import { getCurrentDbUserOrThrow } from '@/lib/users';
import { getOrdersByUser } from '@/lib/dal/orders';
import { getOrderStatusColor, getOrderStatusLabel } from '@/lib/orderStatus';
import Link from 'next/link';

export default async function AccountPage() {
  const user = await getCurrentDbUserOrThrow();
  const orders = await getOrdersByUser(user.id);
  const latestOrder = orders[0];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40 }}>
      {/* Profile Section */}
      <section style={{ background: 'var(--cream-2)', padding: 32, borderRadius: 2 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 24, letterSpacing: '0.02em' }}>
          PROFILE
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Full Name</label>
            <p style={{ fontSize: 16, fontWeight: 500 }}>{user.first_name} {user.last_name || ''}</p>
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Email Address</label>
            <p style={{ fontSize: 16, fontWeight: 500 }}>{user.email}</p>
          </div>
          {(user.role === 'ADMIN_IT' || user.role === 'ADMIN_KK') && (
          <div>
            <label style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Account Role</label>
            <p style={{ fontSize: 16, fontWeight: 500 }}>{user.role}</p>
            <Link
              href={`/admin/${user.role === 'ADMIN_IT' ? 'it' : 'kk'}`}
              style={{
                display: 'inline-block',
                marginTop: 12,
                padding: '8px 16px',
                background: 'var(--black)',
                color: 'var(--cream)',
                textDecoration: 'none',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.1em',
                fontFamily: 'var(--font-mono)',
              }}
            >
              GO TO DASHBOARD →
            </Link>
          </div>
          )}
          </div>
      </section>

      {/* Latest Order Section */}
      <section style={{ background: 'var(--cream-2)', padding: 32, borderRadius: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: '0.02em' }}>
            LATEST ORDER
          </h2>
          <Link href="/account/orders" style={{ fontSize: 12, fontWeight: 600, color: 'var(--black)', textDecoration: 'underline' }}>
            View all
          </Link>
        </div>

        {latestOrder ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>#{latestOrder.id.substring(0, 8)}</span>
              <span style={{ 
                fontSize: 10, 
                fontWeight: 700, 
                padding: '4px 8px', 
                background: getOrderStatusColor(latestOrder.status),
                color: 'white',
                borderRadius: 4
              }}>
                {getOrderStatusLabel(latestOrder.status)}
              </span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>
              Placed on {new Date(latestOrder.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16 }}>
              <p style={{ fontSize: 14, marginBottom: 4 }}>Total Amount</p>
              <p style={{ fontSize: 20, fontWeight: 700 }}>€{Number(latestOrder.total_price).toFixed(2)}</p>
            </div>
            <Link 
              href={`/account/orders/${latestOrder.id}`}
              style={{ 
                display: 'block', 
                marginTop: 24, 
                textAlign: 'center',
                padding: '12px',
                background: 'var(--black)',
                color: 'var(--cream)',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.05em'
              }}
            >
              ORDER DETAILS
            </Link>
          </div>
        ) : (
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>No orders yet.</p>
        )}
      </section>

    </div>
  );
}
