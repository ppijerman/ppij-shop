'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadPaymentProofAction } from '@/lib/actions/orders';

const MAX_PROOF_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_PROOF_SIZE_LABEL = '5 MB';

export default function PaymentProofUploadForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setMessage(null);
    setError(null);

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
      {error && <p style={{ color: '#b91c1c', fontSize: 12 }}>{error}</p>}
      {message && <p style={{ color: '#166534', fontSize: 12 }}>{message}</p>}
      <button
        type="submit"
        disabled={submitting}
        style={{
          background: submitting ? 'var(--muted)' : 'var(--orange)',
          color: 'var(--black)',
          border: 'none',
          padding: '13px 16px',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          borderRadius: 999,
          cursor: submitting ? 'not-allowed' : 'pointer',
          fontWeight: 700,
        }}
      >
        {submitting ? 'uploading...' : 'upload proof'}
      </button>
    </form>
  );
}
