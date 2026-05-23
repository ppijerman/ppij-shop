import { getAllOrders } from '@/lib/dal/orders';

export default async function AdminDashboard() {
  const orders = await getAllOrders();
  const totalOrders = orders.length;
  const pendingPayments = orders.filter(o => o.status === 'CONFIRMED').length; // Adjust logic based on schema
  
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, marginBottom: 40 }}>DASHBOARD</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 48 }}>
        <StatCard label="Total Orders" value={totalOrders} />
        <StatCard label="Pending Confirmation" value={pendingPayments} highlight />
      </div>

      <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 14, letterSpacing: '0.1em', marginBottom: 24, textTransform: 'uppercase', borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>Orders by Status</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'white', borderRadius: 8, border: '1px solid var(--line)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, textTransform: 'uppercase' }}>{status}</span>
            <span style={{ fontWeight: 600 }}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div style={{ 
      padding: '32px', 
      background: highlight ? 'var(--orange)' : 'white', 
      borderRadius: 12, 
      border: '1px solid var(--line)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, color: highlight ? 'var(--black)' : 'var(--muted)' }}>{label}</p>
      <p style={{ fontSize: 42, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{value}</p>
    </div>
  );
}
