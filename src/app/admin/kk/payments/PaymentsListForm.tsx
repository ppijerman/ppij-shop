'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminPaymentsForm({ orders }: { orders: any[] }) {
  const pendingPayments = orders.filter(o => o.status === 'CONFIRMED');

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, marginBottom: 40 }}>PAYMENTS PENDING</h1>

      {pendingPayments.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', background: 'white', borderRadius: 12, border: '1px solid var(--line)' }}>
          <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 14 }}>All clear! No pending payments.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
          {pendingPayments.map((order: any) => (
            <div key={order.id} style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: 20, borderBottom: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>{order.id.substring(0, 8)}</span>
                  <span style={{ fontWeight: 700 }}>€{Number(order.total_price).toFixed(2)}</span>
                </div>
                <p style={{ fontWeight: 600 }}>{order.user_id}</p>
              </div>
              
              <div style={{ flex: 1, padding: 16, background: 'var(--cream-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {order.payment_proof_url ? (
                  <img 
                    src={order.payment_proof_url} 
                    alt="Proof" 
                    style={{ maxWidth: '100%', maxHeight: 300, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                  />
                ) : (
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>No proof uploaded</p>
                )}
              </div>

              <div style={{ padding: 20, display: 'flex', gap: 12 }}>
                <button style={{ ...btnStyle, background: '#4caf50', color: 'white' }}>CONFIRM</button>
                <button style={{ ...btnStyle, background: '#f44336', color: 'white' }}>REJECT</button>
                <Link 
                  href={`/admin/kk/orders/${order.id}`}
                  style={{ ...btnStyle, background: 'var(--cream)', color: 'var(--black)', textDecoration: 'none', textAlign: 'center', flex: 0.5 }}
                >
                  VIEW
                </Link>
              </div>
            </div>
          ))}
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
