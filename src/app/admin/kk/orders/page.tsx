'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MOCK_ORDERS } from '@/data/admin';
import { OrderStatus } from '@/types';

export default function AdminOrders() {
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');

  const filteredOrders = filter === 'ALL' 
    ? MOCK_ORDERS 
    : MOCK_ORDERS.filter(o => o.status === filter);

  const statuses: (OrderStatus | 'ALL')[] = [
    'ALL',
    'PENDING_PAYMENT',
    'PAYMENT_CONFIRMATION',
    'PROCESSING',
    'SHIPPED',
    'COMPLETED',
    'CANCELLED'
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48 }}>ORDERS</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                border: '1px solid var(--line)',
                background: filter === s ? 'var(--black)' : 'white',
                color: filter === s ? 'var(--cream)' : 'var(--black)',
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--cream-2)' }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Buyer</th>
              <th style={thStyle}>Total</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={tdStyle}>{order.id}</td>
                <td style={tdStyle}>{order.buyerName}</td>
                <td style={tdStyle}>€{order.totalPrice}</td>
                <td style={tdStyle}>{order.date}</td>
                <td style={tdStyle}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: 4, 
                    fontSize: 10, 
                    fontWeight: 600, 
                    background: getStatusColor(order.status),
                    color: 'white'
                  }}>
                    {order.status.replace('_', ' ')}
                  </span>
                </td>
                <td style={tdStyle}>
                  <Link 
                    href={`/admin/kk/orders/${order.id}`}
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

function getStatusColor(status: OrderStatus) {
  switch (status) {
    case 'PENDING_PAYMENT': return '#f39200';
    case 'PAYMENT_CONFIRMATION': return '#2196f3';
    case 'PROCESSING': return '#9c27b0';
    case 'SHIPPED': return '#3f51b5';
    case 'COMPLETED': return '#4caf50';
    case 'CANCELLED': return '#f44336';
    default: return '#9e9e9e';
  }
}
