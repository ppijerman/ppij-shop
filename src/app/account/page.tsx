import { MOCK_USER, MOCK_ORDERS } from '@/data/account';
import Link from 'next/link';

export default function AccountPage() {
  const latestOrder = MOCK_ORDERS[MOCK_ORDERS.length - 1];

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
            <p style={{ fontSize: 16, fontWeight: 500 }}>{MOCK_USER.name}</p>
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Email Address</label>
            <p style={{ fontSize: 16, fontWeight: 500 }}>{MOCK_USER.email}</p>
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Account Role</label>
            <p style={{ fontSize: 16, fontWeight: 500 }}>{MOCK_USER.role}</p>
          </div>
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
              <span style={{ fontSize: 14, fontWeight: 600 }}>{latestOrder.id}</span>
              <span style={{ 
                fontSize: 10, 
                fontWeight: 700, 
                padding: '4px 8px', 
                background: 'var(--black)', 
                color: 'white',
                borderRadius: 4
              }}>
                {latestOrder.status}
              </span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>
              Placed on {new Date(latestOrder.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16 }}>
              <p style={{ fontSize: 14, marginBottom: 4 }}>Total Amount</p>
              <p style={{ fontSize: 20, fontWeight: 700 }}>€{latestOrder.total.toFixed(2)}</p>
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
