'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getOrderStatusColor, getOrderStatusLabel } from '@/lib/orderStatus';
import {
  addOrderTimelineCommentAction,
  approvePaymentAction,
  rejectPaymentAction,
  updateOrderStatusAction,
  updatePickupDetailsAction,
  updateShippingTrackingNumberAction,
} from '@/lib/actions/orders';

const SHIPPING_PROVIDERS = ['DHL', 'Hermes', 'DPD', 'UPS', 'FedEx', 'Deutsche Post', 'Pickup / Manual'] as const;

type OrderStatusLog = {
  id: string;
  changed_by_user_id: string | null;
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

function getActorFilterValue(log: OrderStatusLog) {
  return log.changed_by_user_id ?? `system:${getActorLabel(log)}`;
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

function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [locked]);
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
  const [statusComment, setStatusComment] = useState('');
  const [timelineComment, setTimelineComment] = useState('');
  const [timelineCommentError, setTimelineCommentError] = useState<string | null>(null);
  const [timelineCommentSuccess, setTimelineCommentSuccess] = useState<string | null>(null);
  const [timelineStatusFilter, setTimelineStatusFilter] = useState('');
  const [timelineActorFilter, setTimelineActorFilter] = useState('');
  const [timelineFromDate, setTimelineFromDate] = useState('');
  const [timelineToDate, setTimelineToDate] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [cancelReasonError, setCancelReasonError] = useState<string | null>(null);
  const [cancelConfirming, setCancelConfirming] = useState(false);
  const [confirmStatusOpen, setConfirmStatusOpen] = useState(false);

  useBodyScrollLock(proofPreviewOpen);

  const isPickup = initialOrder.delivery_type === 'PICKUP';
  const paymentExpiresAt = initialOrder.payment_expires_at ? new Date(initialOrder.payment_expires_at) : null;
  const STATUS_FLOW = ['AWAITING_PAYMENT', 'PAYMENT_REVIEW', 'PROCESSING', ...(isPickup ? [] : ['SHIPPED']), 'DONE', 'CANCELLED'];
  const currentIdx = STATUS_FLOW.indexOf(initialOrder.status);
  const statuses = STATUS_FLOW.map((s) => ({
    value: s,
    disabled: STATUS_FLOW.indexOf(s) < currentIdx,
  }));
  const canAdminCancel = !['CANCELLED', 'DONE', 'SHIPPED'].includes(initialOrder.status);
  const canEditShippingNumber = !isPickup && (initialOrder.status === 'PROCESSING' || initialOrder.status === 'SHIPPED');
  const timelineStatusOptions = Array.from(new Set(statusLogs.map((log) => log.status)));
  const timelineActorOptions = Array.from(
    new Map(statusLogs.map((log) => [getActorFilterValue(log), getActorLabel(log)])).entries(),
  );
  const hasTimelineFilters = Boolean(timelineStatusFilter || timelineActorFilter || timelineFromDate || timelineToDate);
  const filteredStatusLogs = statusLogs.filter((log) => {
    const logTime = new Date(log.created_at).getTime();

    if (timelineStatusFilter && log.status !== timelineStatusFilter) {
      return false;
    }

    if (timelineActorFilter && getActorFilterValue(log) !== timelineActorFilter) {
      return false;
    }

    if (timelineFromDate && logTime < new Date(`${timelineFromDate}T00:00:00`).getTime()) {
      return false;
    }

    if (timelineToDate && logTime > new Date(`${timelineToDate}T23:59:59.999`).getTime()) {
      return false;
    }

    return true;
  });

  const handleUpdateStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const result = await updateOrderStatusAction(initialOrder.id, status, statusComment);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setStatusComment('');
      setSuccess(result.message ?? 'Status updated.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleAddTimelineComment = async () => {
    try {
      setLoading(true);
      setTimelineCommentError(null);
      setTimelineCommentSuccess(null);
      const result = await addOrderTimelineCommentAction(initialOrder.id, timelineComment);

      if (!result.ok) {
        setTimelineCommentError(result.message);
        return;
      }

      setTimelineComment('');
      setTimelineCommentSuccess(result.message ?? 'Comment added.');
      router.refresh();
    } catch (err) {
      setTimelineCommentError(err instanceof Error ? err.message : 'Failed to add comment. Please try again.');
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

  const handleAdminCancel = async () => {
    const reason = cancelReason.trim();
    if (!reason) {
      setCancelReasonError('Cancellation reason is required.');
      return;
    }
    if (reason.length > 500) {
      setCancelReasonError('Reason must be 500 characters or fewer.');
      return;
    }
    try {
      setLoading(true);
      setCancelReasonError(null);
      setError(null);
      setSuccess(null);
      const result = await updateOrderStatusAction(initialOrder.id, 'CANCELLED', reason);
      if (!result.ok) {
        setError(result.message);
        setCancelConfirming(false);
        return;
      }
      setCancelReason('');
      setCancelConfirming(false);
      setSuccess('Order cancelled.');
      router.refresh();
    } catch (err) {
      setError('Failed to cancel order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          <div style={{ background: 'white', borderRadius: 8, border: '1px solid var(--line)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr)) auto', gap: 10, padding: 16, borderBottom: '1px solid var(--line)', background: 'var(--cream-2)' }}>
              <label style={timelineFilterLabelStyle}>
                Status
                <select
                  value={timelineStatusFilter}
                  onChange={(event) => setTimelineStatusFilter(event.target.value)}
                  style={timelineFilterControlStyle}
                >
                  <option value="">All statuses</option>
                  {timelineStatusOptions.map((option) => (
                    <option key={option} value={option}>{getOrderStatusLabel(option)}</option>
                  ))}
                </select>
              </label>
              <label style={timelineFilterLabelStyle}>
                User
                <select
                  value={timelineActorFilter}
                  onChange={(event) => setTimelineActorFilter(event.target.value)}
                  style={timelineFilterControlStyle}
                >
                  <option value="">All users</option>
                  {timelineActorOptions.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              <label style={timelineFilterLabelStyle}>
                From
                <input
                  type="date"
                  value={timelineFromDate}
                  onChange={(event) => setTimelineFromDate(event.target.value)}
                  max={timelineToDate || undefined}
                  style={timelineFilterControlStyle}
                />
              </label>
              <label style={timelineFilterLabelStyle}>
                To
                <input
                  type="date"
                  value={timelineToDate}
                  onChange={(event) => setTimelineToDate(event.target.value)}
                  min={timelineFromDate || undefined}
                  style={timelineFilterControlStyle}
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setTimelineStatusFilter('');
                  setTimelineActorFilter('');
                  setTimelineFromDate('');
                  setTimelineToDate('');
                }}
                disabled={!hasTimelineFilters}
                style={{
                  alignSelf: 'end',
                  height: 37,
                  padding: '0 14px',
                  border: '1px solid var(--line)',
                  borderRadius: 4,
                  background: hasTimelineFilters ? 'white' : 'var(--cream-2)',
                  color: hasTimelineFilters ? 'var(--black)' : 'var(--muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: hasTimelineFilters ? 'pointer' : 'not-allowed',
                }}
              >
                Clear
              </button>
            </div>
            <div style={{ padding: 24, maxHeight: 520, overflowY: 'auto' }}>
            {filteredStatusLogs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {filteredStatusLogs.map((log, index) => {
                  const actorMeta = getActorMeta(log);

                  return (
                    <div
                      key={log.id}
                      style={{
                        position: 'relative',
                        display: 'grid',
                        gridTemplateColumns: '18px 1fr',
                        gap: 12,
                        paddingBottom: index === filteredStatusLogs.length - 1 ? 0 : 18,
                      }}
                    >
                      {index !== filteredStatusLogs.length - 1 && (
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
                {statusLogs.length > 0 ? 'No status changes match these filters.' : 'No status changes have been logged yet.'}
              </p>
            )}
            </div>
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
              {statuses.map(({ value, disabled }) => (
                <option key={value} value={value} disabled={disabled}>{getOrderStatusLabel(value)}</option>
              ))}
            </select>
            <label htmlFor="status-comment" style={infoLabel}>Optional comment</label>
            <textarea
              id="status-comment"
              value={statusComment}
              onChange={(event) => setStatusComment(event.target.value)}
              disabled={loading}
              placeholder="e.g. Buyer sent proof via Email"
              rows={3}
              maxLength={500}
              style={textareaStyle}
            />
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
            onClick={() => setConfirmStatusOpen(true)}
            disabled={loading || status === initialOrder.status}
            style={{
              width: '100%',
              padding: '12px',
              background: loading || status === initialOrder.status ? 'var(--muted)' : 'var(--black)',
              color: 'var(--cream)',
              border: 'none',
              borderRadius: 4,
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              cursor: loading || status === initialOrder.status ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'UPDATING...' : 'UPDATE STATUS'}
          </button>
          </div>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Add Comment</h2>
          <div style={{ background: 'white', padding: 24, borderRadius: 8, border: '1px solid var(--line)' }}>
            <label htmlFor="timeline-comment" style={infoLabel}>Timeline Note</label>
            <textarea
              id="timeline-comment"
              value={timelineComment}
              onChange={(event) => setTimelineComment(event.target.value)}
              disabled={loading}
              placeholder="Add a note without changing status"
              rows={4}
              maxLength={500}
              style={textareaStyle}
            />
            {timelineCommentError && (
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
                {timelineCommentError}
              </div>
            )}
            {timelineCommentSuccess && (
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
                {timelineCommentSuccess}
              </div>
            )}
            <button
              onClick={handleAddTimelineComment}
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
              {loading ? 'ADDING...' : 'ADD COMMENT'}
            </button>
          </div>
        </section>

        {canAdminCancel && (
          <section style={sectionStyle}>
            <h2 style={h2Style}>Cancel Order</h2>
            <div style={{ background: 'white', padding: 24, borderRadius: 8, border: '1px solid #fecaca' }}>
              {!cancelConfirming ? (
                <>
                  <label htmlFor="cancel-reason" style={{ ...infoLabel, color: '#b91c1c' }}>
                    Cancellation Reason <span style={{ color: '#b91c1c' }}>*</span>
                  </label>
                  <textarea
                    id="cancel-reason"
                    value={cancelReason}
                    onChange={(e) => { setCancelReason(e.target.value); setCancelReasonError(null); }}
                    disabled={loading}
                    placeholder="e.g. Payment not received after follow-up"
                    rows={3}
                    maxLength={500}
                    style={textareaStyle}
                  />
                  {cancelReasonError && (
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
                      {cancelReasonError}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      const reason = cancelReason.trim();
                      if (!reason) { setCancelReasonError('Cancellation reason is required.'); return; }
                      if (reason.length > 500) { setCancelReasonError('Reason must be 500 characters or fewer.'); return; }
                      setCancelConfirming(true);
                    }}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: loading ? 'var(--muted)' : '#b91c1c',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    CANCEL ORDER
                  </button>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Confirm cancellation?</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.5 }}>
                    Reason: <span style={{ color: 'var(--black)', fontWeight: 500 }}>{cancelReason}</span>
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => void handleAdminCancel()}
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: '10px 0',
                        background: loading ? 'var(--muted)' : '#b91c1c',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: loading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {loading ? 'CANCELLING...' : 'CONFIRM'}
                    </button>
                    <button
                      onClick={() => setCancelConfirming(false)}
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: '10px 0',
                        background: 'transparent',
                        color: 'var(--black)',
                        border: '1px solid var(--line)',
                        borderRadius: 4,
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: loading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      GO BACK
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

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
            {paymentExpiresAt && (
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16 }}>
                <p style={infoLabel}>Payment Deadline</p>
                <p style={infoValue}>
                  {paymentExpiresAt.toLocaleString('en-DE', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
            )}
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
                style={textareaStyle}
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

      {confirmStatusOpen && (
        <div
          onClick={() => setConfirmStatusOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(14,14,14,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'var(--cream)', border: '1px solid var(--line)', borderRadius: 8, padding: 32, width: 'min(420px, 92vw)', boxShadow: '0 16px 48px rgba(0,0,0,0.2)' }}
          >
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 8 }}>Confirm status change</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 6 }}>
              {getOrderStatusLabel(initialOrder.status)} → {getOrderStatusLabel(status)}
            </p>
            {statusComment && (
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.5 }}>"{statusComment}"</p>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button
                onClick={() => setConfirmStatusOpen(false)}
                style={{ flex: 1, padding: '12px', border: '1px solid var(--line)', borderRadius: 4, background: 'white', fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer' }}
              >
                CANCEL
              </button>
              <button
                onClick={() => { setConfirmStatusOpen(false); void handleUpdateStatus(); }}
                disabled={loading}
                style={{ flex: 1, padding: '12px', border: 'none', borderRadius: 4, background: 'var(--black)', color: 'var(--cream)', fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer' }}
              >
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      )}

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
const textareaStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  borderRadius: 4,
  border: '1px solid var(--line)',
  fontSize: 14,
  marginBottom: 12,
  resize: 'vertical',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};
const timelineFilterLabelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontFamily: 'var(--font-mono)',
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--muted)',
};
const timelineFilterControlStyle: React.CSSProperties = {
  width: '100%',
  height: 37,
  border: '1px solid var(--line)',
  borderRadius: 4,
  background: 'white',
  color: 'var(--black)',
  fontFamily: 'inherit',
  fontSize: 11,
  letterSpacing: 0,
  textTransform: 'none',
  padding: '0 10px',
  boxSizing: 'border-box',
};
const timelineNoteStyle: React.CSSProperties = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  whiteSpace: 'pre-line',
  wordBreak: 'break-word',
  fontSize: 13,
  lineHeight: 1.45,
  marginBottom: 6,
};
