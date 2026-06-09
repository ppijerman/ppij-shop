'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type React from 'react';
import { getOrderStatusColor, getOrderStatusLabel } from '@/lib/orderStatus';

const ORDER_STATUSES = ['AWAITING_PAYMENT', 'PAYMENT_REVIEW', 'PROCESSING', 'SHIPPED', 'DONE', 'CANCELLED'] as const;
const DELIVERY_TYPES = ['PICKUP', 'DELIVERY'] as const;
const PROOF_FILTERS = ['UPLOADED', 'NOT_UPLOADED'] as const;

type AdminOrder = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  total_price: number | string;
  created_at: string | Date;
  status: string;
  delivery_type: string;
  payment_proof_url: string | null;
};

export default function AdminOrdersList({ orders, role }: { orders: AdminOrder[], role: string }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deliveryFilter, setDeliveryFilter] = useState('');
  const [proofFilter, setProofFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const hasFilters = Boolean(search || statusFilter || deliveryFilter || proofFilter || fromDate || toDate);
  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter((order) => {
      const customerName = [order.first_name, order.last_name].filter(Boolean).join(' ');
      const orderDate = new Date(order.created_at).getTime();

      if (normalizedSearch) {
        const searchValue = [
          customerName,
          order.email,
          order.id,
          order.id.substring(0, 8),
        ].filter(Boolean).join(' ').toLowerCase();

        if (!searchValue.includes(normalizedSearch)) {
          return false;
        }
      }

      if (statusFilter && order.status !== statusFilter) {
        return false;
      }

      if (deliveryFilter && order.delivery_type !== deliveryFilter) {
        return false;
      }

      if (proofFilter === 'UPLOADED' && !order.payment_proof_url) {
        return false;
      }

      if (proofFilter === 'NOT_UPLOADED' && order.payment_proof_url) {
        return false;
      }

      if (fromDate && orderDate < new Date(`${fromDate}T00:00:00`).getTime()) {
        return false;
      }

      if (toDate && orderDate > new Date(`${toDate}T23:59:59.999`).getTime()) {
        return false;
      }

      return true;
    });
  }, [orders, search, statusFilter, deliveryFilter, proofFilter, fromDate, toDate]);

  return (
    <>
      <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr repeat(5, minmax(0, 1fr)) auto', gap: 10, alignItems: 'end' }}>
          <label style={filterLabelStyle}>
            Search
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, email, order ID"
              style={filterControlStyle}
            />
          </label>
          <label style={filterLabelStyle}>
            Status
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={filterControlStyle}>
              <option value="">All statuses</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>{getOrderStatusLabel(status)}</option>
              ))}
            </select>
          </label>
          <label style={filterLabelStyle}>
            Delivery
            <select value={deliveryFilter} onChange={(event) => setDeliveryFilter(event.target.value)} style={filterControlStyle}>
              <option value="">All types</option>
              {DELIVERY_TYPES.map((type) => (
                <option key={type} value={type}>{type === 'PICKUP' ? 'Pickup' : 'Delivery'}</option>
              ))}
            </select>
          </label>
          <label style={filterLabelStyle}>
            Proof
            <select value={proofFilter} onChange={(event) => setProofFilter(event.target.value)} style={filterControlStyle}>
              <option value="">Any proof</option>
              {PROOF_FILTERS.map((proof) => (
                <option key={proof} value={proof}>{proof === 'UPLOADED' ? 'Uploaded' : 'Not uploaded'}</option>
              ))}
            </select>
          </label>
          <label style={filterLabelStyle}>
            From
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              max={toDate || undefined}
              style={filterControlStyle}
            />
          </label>
          <label style={filterLabelStyle}>
            To
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              min={fromDate || undefined}
              style={filterControlStyle}
            />
          </label>
          <button
            type="button"
            disabled={!hasFilters}
            onClick={() => {
              setSearch('');
              setStatusFilter('');
              setDeliveryFilter('');
              setProofFilter('');
              setFromDate('');
              setToDate('');
            }}
            style={{
              height: 38,
              padding: '0 14px',
              border: '1px solid var(--line)',
              borderRadius: 6,
              background: hasFilters ? 'white' : 'var(--cream-2)',
              color: hasFilters ? 'var(--black)' : 'var(--muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: hasFilters ? 'pointer' : 'not-allowed',
            }}
          >
            Clear
          </button>
        </div>
        <p style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
          Showing {filteredOrders.length} of {orders.length} orders
        </p>
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
            {filteredOrders.length > 0 ? filteredOrders.map((order) => (
              <tr key={order.id} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={tdStyle}>{[order.first_name, order.last_name].filter(Boolean).join(' ') || order.email || 'Unknown customer'}</td>
                <td style={tdStyle}>{order.id.substring(0, 8)}</td>
                <td style={tdStyle}>€{Number(order.total_price).toFixed(2)}</td>
                <td style={tdStyle}>{new Date(order.created_at).toLocaleDateString()}</td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 600,
                    background: getOrderStatusColor(order.status),
                    color: 'white'
                  }}>
                    {getOrderStatusLabel(order.status)}
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
            )) : (
              <tr>
                <td colSpan={6} style={{ padding: 28, color: 'var(--muted)', fontSize: 14, textAlign: 'center' }}>
                  No orders match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

const filterLabelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--muted)',
};

const filterControlStyle: React.CSSProperties = {
  width: '100%',
  height: 38,
  border: '1px solid var(--line)',
  borderRadius: 6,
  background: 'white',
  color: 'var(--black)',
  fontFamily: 'inherit',
  fontSize: 12,
  letterSpacing: 0,
  textTransform: 'none',
  padding: '0 10px',
  boxSizing: 'border-box',
};

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
