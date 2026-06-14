'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { approvePaymentAction, rejectPaymentAction } from '@/lib/actions/orders';

export default function AdminPaymentsForm({ orders }: { orders: any[] }) {
  const router = useRouter();
  const { role } = useParams();
  const pendingPayments = orders.filter(o => o.status === 'PAYMENT_REVIEW' && o.payment_proof_url);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reviewPayment(orderId: string, action: 'approve' | 'reject') {
    setBusyOrderId(orderId);
    setError(null);
    const result = action === 'approve'
      ? await approvePaymentAction(orderId)
      : await rejectPaymentAction(orderId);
    setBusyOrderId(null);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, marginBottom: 24 }}>PAYMENTS PENDING</h1>
      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: 12, marginBottom: 18, borderRadius: 6, fontSize: 13 }}>
          {error}
        </div>
      )}

      {pendingPayments.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', background: 'white', borderRadius: 12, border: '1px solid var(--line)' }}>
          <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 14 }}>All clear! No pending payments.</p>
        </div>
      ) : (
        <div className="r-grid-collapse" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
          {pendingPayments.map((order: any) => {
            const busy = busyOrderId === order.id;
            const buyerName = [order.first_name, order.last_name].filter(Boolean).join(' ') || order.email || order.user_id;

            return (
              <div key={order.id} style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: 20, borderBottom: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>{order.id.substring(0, 8)}</span>
                    <span style={{ fontWeight: 700 }}>€{Number(order.total_price).toFixed(2)}</span>
                  </div>
                  <p style={{ fontWeight: 600 }}>{buyerName}</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', marginTop: 5 }}>{order.payment_method}</p>
                </div>

                <div style={{ flex: 1, padding: 16, background: 'var(--cream-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={order.payment_proof_url}
                    alt="Proof"
                    style={{ maxWidth: '100%', maxHeight: 300, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </div>

                <div style={{ padding: 20, display: 'flex', gap: 12 }}>
                  <button disabled={busy} onClick={() => void reviewPayment(order.id, 'approve')} style={{ ...btnStyle, background: '#4caf50', color: 'white', cursor: busy ? 'not-allowed' : 'pointer' }}>
                    {busy ? '...' : 'CONFIRM'}
                  </button>
                  <button disabled={busy} onClick={() => void reviewPayment(order.id, 'reject')} style={{ ...btnStyle, background: '#f44336', color: 'white', cursor: busy ? 'not-allowed' : 'pointer' }}>
                    REJECT
                  </button>
                  <Link
                    href={`/admin/${role}/orders/${order.id}`}
                    style={{ ...btnStyle, background: 'var(--cream)', color: 'var(--black)', textDecoration: 'none', textAlign: 'center', flex: 0.5 }}
                  >
                    VIEW
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  flex: 1,
  padding: '12px',
  border: 'none',
  borderRadius: 6,
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  fontWeight: 700,
  cursor: 'pointer',
  letterSpacing: '0.05em'
};
