'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Editorial() {
  const [hovered, setHovered] = useState(false);

  return (
    <section id="editorial" style={{ position: 'relative', background: '#1A1A1A' }}>
      <div style={{ position: 'relative', height: 'clamp(560px, 75vh, 720px)', overflow: 'hidden' }}>
        <Image
          src="/assets/v4/editorial-color.jpeg"
          alt="PPI editorial"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.7) 100%)' }} />

        <div style={{ position: 'absolute', top: 32, left: 0, right: 0, textAlign: 'center', color: 'var(--cream)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.35em', textTransform: 'uppercase' }}>
          PPI JERMAN × FRIENDS
        </div>

        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: 'var(--cream)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(64px, 8vw, 120px)', lineHeight: 0.95, letterSpacing: '-0.02em' }}>
            Komilitonen<br /><span style={{ color: 'var(--accent)' }}>im Feld</span>
          </h2>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: 14, opacity: 0.8 }}>
            captured by · @ppijerman
          </div>
          <Link
            href="/catalog"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              display: 'inline-block', marginTop: 28, textDecoration: 'none',
              background: hovered ? 'var(--cream)' : 'transparent',
              color: hovered ? 'var(--black)' : 'var(--cream)',
              border: '1px solid var(--cream)',
              padding: '12px 24px', borderRadius: 999, cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
              transition: 'all 0.2s',
            }}
          >
            Explore the edit ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
