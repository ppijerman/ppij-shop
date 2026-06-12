'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cancelOrderByUserAction } from '@/lib/actions/orders';

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await cancelOrderByUserAction(orderId);

      if (!result.ok) {
        setError(result.message);
        setConfirming(false);
        return;
      }

      router.refresh();
    } catch {
      setError('Failed to cancel order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (confirming) {
    return (
      <div style={{ marginTop: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--black)' }}>
          Are you sure you want to cancel this order?
        </p>
        {error && (
          <p style={{ fontSize: 12, color: '#b91c1c', marginBottom: 10 }}>{error}</p>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => void handleCancel()}
            disabled={loading}
            style={{
              flex: 1,
              padding: '10px 0',
              background: '#b91c1c',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'CANCELLING...' : 'YES, CANCEL ORDER'}
          </button>
          <button
            onClick={() => { setConfirming(false); setError(null); }}
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
              letterSpacing: '0.08em',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            KEEP ORDER
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 16 }}>
      {error && (
        <p style={{ fontSize: 12, color: '#b91c1c', marginBottom: 8 }}>{error}</p>
      )}
      <button
        onClick={() => setConfirming(true)}
        style={{
          padding: '9px 16px',
          background: 'transparent',
          color: '#b91c1c',
          border: '1px solid #b91c1c',
          borderRadius: 4,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.08em',
          cursor: 'pointer',
        }}
      >
        CANCEL ORDER
      </button>
    </div>
  );
}
