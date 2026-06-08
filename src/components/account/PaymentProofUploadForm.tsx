'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadPaymentProofAction } from '@/lib/actions/orders';

const MAX_PROOF_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_PROOF_SIZE_LABEL = '5 MB';

function formatTimeRemaining(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function PaymentProofUploadForm({ orderId, paymentExpiresAt }: { orderId: string; paymentExpiresAt: string | Date | null }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const expiresAtTime = useMemo(() => paymentExpiresAt ? new Date(paymentExpiresAt).getTime() : null, [paymentExpiresAt]);
  const [now, setNow] = useState(() => Date.now());
  const refreshedAfterExpiry = useRef(false);
  const timeRemaining = expiresAtTime === null ? null : expiresAtTime - now;
  const isExpired = timeRemaining !== null && timeRemaining <= 0;

  useEffect(() => {
    if (expiresAtTime === null || isExpired) {
      return;
    }

    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, [expiresAtTime, isExpired]);

  useEffect(() => {
    if (!isExpired || refreshedAfterExpiry.current) {
      return;
    }

    refreshedAfterExpiry.current = true;
    router.refresh();
  }, [isExpired, router]);

  async function handleSubmit(formData: FormData) {
    setMessage(null);
    setError(null);

    if (isExpired) {
      setError('Payment time limit has expired. This order will be cancelled automatically.');
      router.refresh();
      return;
    }

    const file = formData.get('paymentProof');
    if (file instanceof File && file.size > MAX_PROOF_SIZE_BYTES) {
      setError(`Payment proof must be ${MAX_PROOF_SIZE_LABEL} or smaller.`);
      return;
    }

    setSubmitting(true);
    const result = await uploadPaymentProofAction(formData);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setMessage(result.message ?? 'Payment proof uploaded.');
    router.refresh();
  }

  return (
    <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input type="hidden" name="orderId" value={orderId} />
      <input
        name="paymentProof"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        required
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];

          if (file && file.size > MAX_PROOF_SIZE_BYTES) {
            event.currentTarget.value = '';
            setMessage(null);
            setError(`Payment proof must be ${MAX_PROOF_SIZE_LABEL} or smaller.`);
            return;
          }

          setError(null);
        }}
        style={{ border: '1px solid var(--line)', background: 'white', padding: 12, fontSize: 13 }}
      />
      {timeRemaining !== null && (
        <p style={{ color: isExpired ? '#b91c1c' : 'var(--muted)', fontSize: 12, lineHeight: 1.4 }}>
          {isExpired
            ? 'Payment time limit expired.'
            : `Upload proof within ${formatTimeRemaining(timeRemaining)}.`}
        </p>
      )}
      {error && <p style={{ color: '#b91c1c', fontSize: 12 }}>{error}</p>}
      {message && <p style={{ color: '#166534', fontSize: 12 }}>{message}</p>}
      <button
        type="submit"
        disabled={submitting || isExpired}
        style={{
          background: submitting || isExpired ? 'var(--muted)' : 'var(--orange)',
          color: 'var(--black)',
          border: 'none',
          padding: '13px 16px',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          borderRadius: 999,
          cursor: submitting || isExpired ? 'not-allowed' : 'pointer',
          fontWeight: 700,
        }}
      >
        {submitting ? 'uploading...' : isExpired ? 'time expired' : 'upload proof'}
      </button>
    </form>
  );
}
