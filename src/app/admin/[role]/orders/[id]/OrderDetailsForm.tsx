'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'
import {
  approvePaymentAction,
  rejectPaymentAction,
  updateOrderStatusAction,
  updateShippingTrackingNumberAction,
} from '@/lib/actions/orders';

export default function OrderDetailsForm({ initialOrder, items }: { initialOrder: any, items: any[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<string>(initialOrder.status);
  const [shippingNumber, setShippingNumber] = useState<string>(initialOrder.shipping_tracking_number ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [proofPreviewOpen, setProofPreviewOpen] = useState(false);

  const statuses: string[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DONE', 'CANCELLED'];
  const canEditShippingNumber = initialOrder.status === 'PROCESSING' || initialOrder.status === 'SHIPPED';

  const handleUpdateStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const result = await updateOrderStatusAction(initialOrder.id, status);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setSuccess(result.message ?? 'Status updated.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handlePaymentReview = async (action: 'approve' | 'reject') => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const result = action === 'approve'
        ? await approvePaymentAction(initialOrder.id)
        : await rejectPaymentAction(initialOrder.id);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setSuccess(result.message ?? 'Payment review saved.');
      router.refresh();
    } catch (err) {
      setError('Failed to review payment. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleSaveShippingNumber = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const result = await updateShippingTrackingNumberAction(initialOrder.id, shippingNumber);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setStatus('SHIPPED');
      setSuccess(result.message ?? 'Shipping number saved.');
      router.refresh();
    } catch (err) {
      setError('Failed to save shipping number. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40 }}>
      <div>
        <section style={sectionStyle}>
          <h2 style={h2Style}>Ordered Items</h2>
          <div style={{ background: 'white', borderRadius: 8, border: '1px solid var(--line)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--cream-2)' }}>
                  <th style={thStyle}>Item</th>
                  <th style={thStyle}>Qty</th>
                  <th style={thStyle}>Price</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={tdStyle}>{item.product_name_snapshot}</td>
                    <td style={tdStyle}>{item.quantity}</td>
                    <td style={tdStyle}>€{Number(item.price_at_purchase).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>Total</td>
                  <td style={{ ...tdStyle, fontWeight: 700, fontSize: 18 }}>€{Number(initialOrder.total_price).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </div>

      <div>
        <section style={sectionStyle}>
          <h2 style={h2Style}>Status</h2>
          <div style={{ background: 'white', padding: 24, borderRadius: 8, border: '1px solid var(--line)' }}>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: 4, border: '1px solid var(--line)', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 16 }}
            >
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '8px 12px',
              borderRadius: 4,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              marginBottom: 12,
            }}>
              {error}
            </div>
          )}
            {success && (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#166534',
                padding: '8px 12px',
                borderRadius: 4,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                marginBottom: 12,
              }}>
                {success}
              </div>
            )}
          <button
            onClick={handleUpdateStatus}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? 'var(--muted)' : 'var(--black)',
              color: 'var(--cream)',
              border: 'none',
              borderRadius: 4,
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'UPDATING...' : 'UPDATE STATUS'}
          </button>
          </div>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Buyer Information</h2>
          <div style={{ background: 'white', padding: 24, borderRadius: 8, border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {initialOrder.delivery_type === 'PICKUP' ? (
              <div>
                <p style={infoLabel}>Delivery Type</p>
                <p style={infoValue}>Pickup</p>
              </div>
            ) : (
              <>
                <div>
                  <p style={infoLabel}>Delivery Type</p>
                  <p style={infoValue}>Delivery</p>
                </div>
                <div>
                  <p style={infoLabel}>Street</p>
                  <p style={infoValue}>{initialOrder.delivery_address?.street ?? '—'}</p>
                </div>
                <div>
                  <p style={infoLabel}>City</p>
                  <p style={infoValue}>{initialOrder.delivery_address?.city ?? '—'}</p>
                </div>
                <div>
                  <p style={infoLabel}>Postcode</p>
                  <p style={infoValue}>{initialOrder.delivery_address?.postcode ?? '—'}</p>
                </div>
                <div>
                  <p style={infoLabel}>Country</p>
                  <p style={infoValue}>{initialOrder.delivery_address?.country ?? '—'}</p>
                </div>
              </>
            )}
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16 }}>
              <p style={infoLabel}>Payment Method</p>
              <p style={infoValue}>{initialOrder.payment_method ?? '—'}</p>
            </div>
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16 }}>
              <p style={infoLabel}>Payment Proof</p>
              {initialOrder.payment_proof_url ? (
                <button
                  type="button"
                  onClick={() => setProofPreviewOpen(true)}
                  style={{ background: 'none', border: 'none', padding: 0, fontSize: 13, color: 'var(--black)', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}
                >
                  View Proof
                </button>
              ) : (
                <p style={{ ...infoValue, color: 'var(--muted)' }}>Not uploaded yet</p>
              )}
              {initialOrder.status === 'CONFIRMED' && initialOrder.payment_proof_url && (
                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  <button
                    onClick={() => void handlePaymentReview('approve')}
                    disabled={loading}
                    style={{ flex: 1, border: 'none', borderRadius: 4, padding: 10, background: '#4caf50', color: 'white', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}
                  >
                    APPROVE
                  </button>
                  <button
                    onClick={() => void handlePaymentReview('reject')}
                    disabled={loading}
                    style={{ flex: 1, border: 'none', borderRadius: 4, padding: 10, background: '#f44336', color: 'white', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}
                  >
                    REJECT
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Shipping</h2>
          <div style={{ background: 'white', padding: 24, borderRadius: 8, border: '1px solid var(--line)' }}>
            <label htmlFor="shipping-number" style={infoLabel}>Shipping Number</label>
            <input
              id="shipping-number"
              value={shippingNumber}
              onChange={(event) => setShippingNumber(event.target.value)}
              disabled={loading || !canEditShippingNumber}
              placeholder="DHL / Hermes / tracking number"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 4,
                border: '1px solid var(--line)',
                fontSize: 14,
                marginBottom: 12,
                background: canEditShippingNumber ? 'white' : 'var(--cream-2)',
              }}
            />
            <p style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--muted)', marginBottom: 14 }}>
              {canEditShippingNumber
                ? 'Saving this number marks the order as shipped.'
                : 'Available after payment approval moves the order to processing.'}
            </p>
            <button
              onClick={handleSaveShippingNumber}
              disabled={loading || !canEditShippingNumber}
              style={{
                width: '100%',
                padding: '12px',
                background: loading || !canEditShippingNumber ? 'var(--muted)' : 'var(--black)',
                color: 'var(--cream)',
                border: 'none',
                borderRadius: 4,
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                cursor: loading || !canEditShippingNumber ? 'not-allowed' : 'pointer',
              }}
            >
              {initialOrder.status === 'SHIPPED' ? 'UPDATE SHIPPING NUMBER' : 'SAVE & MARK SHIPPED'}
            </button>
          </div>
        </section>
      </div>

      {proofPreviewOpen && initialOrder.payment_proof_url && (
        <div
          onClick={() => setProofPreviewOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            background: 'rgba(14,14,14,0.62)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              position: 'relative',
              width: 'min(760px, 92vw)',
              maxHeight: '88vh',
              background: 'var(--cream)',
              border: '1px solid var(--line)',
              overflow: 'hidden',
              boxShadow: '0 22px 70px rgba(0,0,0,0.28)',
            }}
          >
            <button
              type="button"
              onClick={() => setProofPreviewOpen(false)}
              aria-label="Close proof preview"
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                zIndex: 1,
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(239,234,224,0.88)',
                border: '1px solid var(--line)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ×
            </button>
            <div style={{ padding: 18, borderBottom: '1px solid var(--line)' }}>
              <p style={{ ...infoLabel, marginBottom: 0 }}>Payment Proof</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginTop: 4 }}>
                ORDER #{initialOrder.id.substring(0, 8)}
              </p>
            </div>
            <div style={{ background: 'var(--cream-2)', padding: 18, maxHeight: 'calc(88vh - 92px)', overflow: 'auto' }}>
              <img
                src={initialOrder.payment_proof_url}
                alt="Payment proof"
                style={{ display: 'block', width: '100%', height: 'auto', objectFit: 'contain', background: 'white' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const sectionStyle: React.CSSProperties = { marginBottom: 40 };
const h2Style: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16, color: 'var(--muted)' };
const thStyle: React.CSSProperties = { padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', textAlign: 'left' };
const tdStyle: React.CSSProperties = { padding: '16px', fontSize: 14 };
const infoLabel: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 };
const infoValue: React.CSSProperties = { fontSize: 15, marginBottom: 16, fontWeight: 500 };
