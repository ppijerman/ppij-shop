'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getOrderStatusColor, getOrderStatusLabel } from '@/lib/orderStatus';
import {
  approvePaymentAction,
  rejectPaymentAction,
  updateOrderStatusAction,
  updatePickupDetailsAction,
  updateShippingTrackingNumberAction,
} from '@/lib/actions/orders';

const SHIPPING_PROVIDERS = ['DHL', 'Hermes', 'DPD', 'UPS', 'FedEx', 'Deutsche Post', 'Pickup / Manual'] as const;

type OrderStatusLog = {
  id: string;
  status: string;
  note: string;
  created_at: string | Date;
  changed_by_first_name: string | null;
  changed_by_last_name: string | null;
  changed_by_email: string | null;
  changed_by_role: string | null;
};

function getActorLabel(log: OrderStatusLog) {
  const fullName = [log.changed_by_first_name, log.changed_by_last_name].filter(Boolean).join(' ').trim();

  if (fullName) {
    return fullName;
  }

  return log.changed_by_email ?? 'System';
}

function getActorName(log: OrderStatusLog) {
  return [log.changed_by_first_name, log.changed_by_last_name].filter(Boolean).join(' ').trim();
}

function formatActorRole(role: string) {
  return role
    .replace('ADMIN_', 'Admin ')
    .replace('BUYER', 'Buyer')
    .replace('_', ' ');
}

function getActorMeta(log: OrderStatusLog) {
  if (!log.changed_by_role && !log.changed_by_email) {
    return null;
  }

  const fullName = getActorName(log);
  const role = log.changed_by_role ? formatActorRole(log.changed_by_role) : null;
  const email = fullName ? log.changed_by_email : null;

  return [role, email].filter(Boolean).join(' / ');
}

function formatLogDate(value: string | Date) {
  return new Intl.DateTimeFormat('en-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function OrderDetailsForm({ initialOrder, items, statusLogs }: { initialOrder: any, items: any[], statusLogs: OrderStatusLog[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<string>(initialOrder.status);
  const [shippingProvider, setShippingProvider] = useState<string>(initialOrder.shipping_provider ?? '');
  const [shippingNumber, setShippingNumber] = useState<string>(initialOrder.shipping_tracking_number ?? '');
  const [pickupDetails, setPickupDetails] = useState<string>(initialOrder.pickup_details ?? '');
  const [hasSavedPickup, setHasSavedPickup] = useState<boolean>(!!initialOrder.pickup_details);
  const [pickupSuccess, setPickupSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [proofPreviewOpen, setProofPreviewOpen] = useState(false);

  const isPickup = initialOrder.delivery_type === 'PICKUP';
  const statuses: string[] = ['AWAITING_PAYMENT', 'PAYMENT_REVIEW', 'PROCESSING', ...(isPickup ? [] : ['SHIPPED']), 'DONE', 'CANCELLED'];
  const canEditShippingNumber = !isPickup && (initialOrder.status === 'PROCESSING' || initialOrder.status === 'SHIPPED');

  useEffect(() => {
    if (!proofPreviewOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [proofPreviewOpen]);

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
      const result = await updateShippingTrackingNumberAction(initialOrder.id, shippingProvider, shippingNumber);

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

  const handleSavePickupDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const result = await updatePickupDetailsAction(initialOrder.id, pickupDetails);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setHasSavedPickup(true);
      setPickupSuccess('Pickup details saved.');
      router.refresh();
    } catch (err) {
      setError('Failed to save pickup details. Please try again.');
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
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600 }}>{item.bundle_id ? item.bundle_name : item.product_name_snapshot}</div>
                      {!item.bundle_id && (
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                          {item.color_name} • {item.size} • {item.fit_type}
                        </div>
                      )}
                      {item.bundle_id && item.bundle_products && (
                        <div style={{ marginTop: 10, padding: 12, background: 'var(--cream-2)', borderRadius: 6, border: '1px solid var(--line)' }}>
                          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Bundle Contents
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {item.bundle_products.map((p: any, idx: number) => (
                              <div key={idx} style={{ fontSize: 12, fontWeight: 500, color: 'var(--black)' }}>
                                • {p.product_name} <span style={{ color: 'var(--muted)', fontSize: 11 }}>({p.color} • {p.size} • {p.fit})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </td>
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

        <section style={sectionStyle}>
          <h2 style={h2Style}>Status Timeline</h2>
          <div style={{ background: 'white', padding: 24, borderRadius: 8, border: '1px solid var(--line)', maxHeight: 520, overflowY: 'auto' }}>
            {statusLogs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {statusLogs.map((log, index) => {
                  const actorMeta = getActorMeta(log);

                  return (
                    <div
                      key={log.id}
                      style={{
                        position: 'relative',
                        display: 'grid',
                        gridTemplateColumns: '18px 1fr',
                        gap: 12,
                        paddingBottom: index === statusLogs.length - 1 ? 0 : 18,
                      }}
                    >
                      {index !== statusLogs.length - 1 && (
                        <span
                          aria-hidden="true"
                          style={{
                            position: 'absolute',
                            top: 18,
                            bottom: 0,
                            left: 7,
                            width: 1,
                            background: 'var(--line)',
                          }}
                        />
                      )}
                      <span
                        aria-hidden="true"
                        style={{
                          position: 'relative',
                          zIndex: 1,
                          width: 15,
                          height: 15,
                          marginTop: 2,
                          borderRadius: '50%',
                          background: getOrderStatusColor(log.status),
                          border: '3px solid white',
                          boxShadow: '0 0 0 1px var(--line)',
                        }}
                      />
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline', marginBottom: 4 }}>
                          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            {getOrderStatusLabel(log.status)}
                          </p>
                          <time dateTime={new Date(log.created_at).toISOString()} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                            {formatLogDate(log.created_at)}
                          </time>
                        </div>
                        <p style={timelineNoteStyle}>{log.note}</p>
                        <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.35 }}>
                          Changed by <span style={{ color: 'var(--black)', fontWeight: 600 }}>{getActorLabel(log)}</span>
                          {actorMeta ? ` (${actorMeta})` : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
                No status changes have been logged yet.
              </p>
            )}
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
              {statuses.map(s => <option key={s} value={s}>{getOrderStatusLabel(s)}</option>)}
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
              {initialOrder.status === 'PAYMENT_REVIEW' && initialOrder.payment_proof_url && (
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

        {isPickup && (
          <section style={sectionStyle}>
            <h2 style={h2Style}>Pickup Details</h2>
            <div style={{ background: 'white', padding: 24, borderRadius: 8, border: '1px solid var(--line)' }}>
              <label htmlFor="pickup-details" style={infoLabel}>When &amp; where to meet</label>
              <textarea
                id="pickup-details"
                value={pickupDetails}
                onChange={(e) => setPickupDetails(e.target.value)}
                disabled={loading}
                placeholder="e.g. Saturday 14 June, 14:00 at Mensa TU Berlin"
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 4,
                  border: '1px solid var(--line)',
                  fontSize: 14,
                  marginBottom: 12,
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
              <button
                onClick={handleSavePickupDetails}
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
                {loading ? 'SAVING...' : hasSavedPickup ? 'UPDATE PICKUP DETAILS' : 'SAVE PICKUP DETAILS'}
              </button>
              {pickupSuccess && (
                <p style={{ fontSize: 11, color: '#166534', marginTop: 8, fontFamily: 'var(--font-mono)' }}>
                  ✓ {pickupSuccess}
                </p>
              )}
            </div>
          </section>
        )}

        {initialOrder.delivery_type === 'DELIVERY' && (
          <section style={sectionStyle}>
            <h2 style={h2Style}>Shipping</h2>
            <div style={{ background: 'white', padding: 24, borderRadius: 8, border: '1px solid var(--line)' }}>
              <label htmlFor="shipping-provider" style={infoLabel}>Shipping Provider</label>
              <select
                id="shipping-provider"
                value={shippingProvider}
                onChange={(event) => setShippingProvider(event.target.value)}
                disabled={loading || !canEditShippingNumber}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 4,
                  border: '1px solid var(--line)',
                  fontSize: 14,
                  marginBottom: 12,
                  background: canEditShippingNumber ? 'white' : 'var(--cream-2)',
                }}
              >
                <option value="">Choose provider</option>
                {SHIPPING_PROVIDERS.map((provider) => (
                  <option key={provider} value={provider}>
                    {provider}
                  </option>
                ))}
              </select>
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
        )}
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
const timelineNoteStyle: React.CSSProperties = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  wordBreak: 'break-word',
  fontSize: 13,
  lineHeight: 1.45,
  marginBottom: 6,
};
