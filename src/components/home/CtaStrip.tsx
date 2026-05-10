'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CtaStrip() {
  const [hovered, setHovered] = useState(false);

  return (
    <section style={{ background: 'var(--orange)', padding: '56px 28px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 30, flexWrap: 'wrap' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 5vw, 72px)', color: 'var(--black)', lineHeight: 0.95, letterSpacing: '0.01em' }}>
          REPRESENT.<br />WEAR YOUR ROOTS.
        </h3>
        <Link
          href="/catalog"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            textDecoration: 'none',
            background: 'var(--black)', color: 'var(--cream)', padding: '18px 32px',
            borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 12,
            letterSpacing: '0.25em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 14,
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.2s',
          }}
        >
          shop now <span style={{ fontSize: 18 }}>↗</span>
        </Link>
      </div>
    </section>
  );
}
