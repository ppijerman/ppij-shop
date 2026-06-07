'use client';

import { useEffect, useState } from 'react';

export default function PaymentProofPreviewButton({ proofUrl, orderId }: { proofUrl: string, orderId: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-block',
          marginTop: 12,
          padding: 0,
          background: 'none',
          border: 'none',
          color: 'var(--black)',
          fontSize: 13,
          fontWeight: 700,
          textDecoration: 'underline',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        View uploaded proof
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
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
              onClick={() => setOpen(false)}
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
              x
            </button>
            <div style={{ padding: 18, borderBottom: '1px solid var(--line)' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 0 }}>
                Payment Proof
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginTop: 4 }}>
                ORDER #{orderId.substring(0, 8)}
              </p>
            </div>
            <div style={{ background: 'var(--cream-2)', padding: 18, maxHeight: 'calc(88vh - 92px)', overflow: 'auto' }}>
              <img
                src={proofUrl}
                alt="Payment proof"
                style={{ display: 'block', width: '100%', height: 'auto', objectFit: 'contain', background: 'white' }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
