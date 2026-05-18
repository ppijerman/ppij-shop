'use client';

import { useParams } from 'next/navigation';
import { MOCK_ORDERS } from '@/data/admin';
import { OrderStatus } from '@/types';
import { useState } from 'react';

export default function OrderDetail() {
  const { id } = useParams();
  const order = MOCK_ORDERS.find(o => o.id === id);
  const [status, setStatus] = useState<OrderStatus | undefined>(order?.status);

  if (!order) return <div>Order not found</div>;

  const statuses: OrderStatus[] = [
    'PENDING_PAYMENT',
    'PAYMENT_CONFIRMATION',
    'PROCESSING',
    'SHIPPED',
    'COMPLETED',
    'CANCELLED'
  ];

  return (
    <div>
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>ORDERS / {order.id}</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48 }}>ORDER DETAILS</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40 }}>
        <div>
          <section style={sectionStyle}>
            <h2 style={h2Style}>Ordered Items</h2>
            <div style={{ background: 'white', borderRadius: 8, border: '1px solid var(--line)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--cream-2)' }}>
                    <th style={thStyle}>Item</th>
                    <th style={thStyle}>Size</th>
                    <th style={thStyle}>Qty</th>
                    <th style={thStyle}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={tdStyle}>{item.name}</td>
                      <td style={tdStyle}>{item.size}</td>
                      <td style={tdStyle}>{item.quantity}</td>
                      <td style={tdStyle}>€{item.price}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>Total</td>
                    <td style={{ ...tdStyle, fontWeight: 700, fontSize: 18 }}>€{order.totalPrice}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>Payment Proof</h2>
            {order.paymentProof ? (
              <div style={{ border: '1px solid var(--line)', borderRadius: 8, padding: 16, background: 'white' }}>
                <img src={order.paymentProof} alt="Payment Proof" style={{ maxWidth: '100%', borderRadius: 4 }} />
              </div>
            ) : (
              <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No payment proof uploaded yet.</p>
            )}
          </section>
        </div>

        <div>
          <section style={sectionStyle}>
            <h2 style={h2Style}>Status</h2>
            <div style={{ background: 'white', padding: 24, borderRadius: 8, border: '1px solid var(--line)' }}>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 4,
                  border: '1px solid var(--line)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  marginBottom: 16
                }}
              >
                {statuses.map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
              <button style={{
                width: '100%',
                padding: '12px',
                background: 'var(--black)',
                color: 'var(--cream)',
                border: 'none',
                borderRadius: 4,
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                cursor: 'pointer'
              }}>
                UPDATE STATUS
              </button>
            </div>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>Buyer Information</h2>
            <div style={{ background: 'white', padding: 24, borderRadius: 8, border: '1px solid var(--line)' }}>
              <p style={infoLabel}>Name</p>
              <p style={infoValue}>{order.buyerName}</p>
              
              <p style={infoLabel}>Email</p>
              <p style={infoValue}>{order.email}</p>
              
              <p style={infoLabel}>Address</p>
              <p style={infoValue}>{order.address}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

const sectionStyle: React.CSSProperties = {
  marginBottom: 40
};

const h2Style: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 14,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: 16,
  color: 'var(--muted)'
};

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  textTransform: 'uppercase',
  textAlign: 'left'
};

const tdStyle: React.CSSProperties = {
  padding: '16px',
  fontSize: 14
};

const infoLabel: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  textTransform: 'uppercase',
  color: 'var(--muted)',
  marginBottom: 4
};

const infoValue: React.CSSProperties = {
  fontSize: 15,
  marginBottom: 16,
  fontWeight: 500
};
