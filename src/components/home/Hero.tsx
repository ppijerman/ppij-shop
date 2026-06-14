'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const TAGS = ['TOTE BAG', 'T-SHIRT'];

export default function Hero() {
  const [hovered, setHovered] = useState(false);

  return (
    <section style={{ background: 'var(--cream)', padding: '24px 28px 0', position: 'relative' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <div style={{ position: 'relative', overflow: 'hidden', height: 'clamp(600px, 72vh, 700px)', background: '#0a0a0a' }}>
          <Image
            src="/assets/v4/home-img.jpg"
            alt="PPI Jerman Merch Drop"
            fill
            priority
            style={{ objectFit: 'cover', objectPosition: 'center 65%', filter: 'saturate(1.05) contrast(1.05)' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.4) 100%)' }} />

          <div style={{ position: 'absolute', top: 24, left: 30, right: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', color: 'var(--cream)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
              MERCH DROP — VOL. 01
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', textAlign: 'right' }}>
              SS / 2026 EDITION<br />
              <span style={{ opacity: 0.6 }}>5 ITEMS · LIMITED RUN</span>
            </div>
          </div>

          <div style={{ position: 'absolute', top: '14%', left: '4%', animation: 'fadeUp 0.8s ease both' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(58px, 14vw, 220px)', color: 'var(--accent)', lineHeight: 0.85, letterSpacing: '-0.01em' }}>
              MERCH
            </h1>
          </div>

          <div style={{ position: 'absolute', bottom: '12%', right: '4%', textAlign: 'right', animation: 'fadeUp 0.8s 0.1s ease both' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(58px, 14vw, 220px)', color: 'var(--accent)', lineHeight: 0.85, letterSpacing: '-0.01em' }}>
              DROP
            </h1>
          </div>

          <div style={{ position: 'absolute', top: '38%', left: '50%', transform: 'translateX(-50%) rotate(-3deg)', color: 'var(--cream)', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-script)', fontSize: 'clamp(60px, 8vw, 120px)', color: 'var(--cream)', textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
              the drop
            </div>
            <div style={{ marginTop: 6, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
              · summer field edition ·
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: '4%', left: '4%' }}>
            <Link
              href="/catalog"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              style={{
                background: hovered ? 'var(--accent)' : 'var(--cream)',
                color: hovered ? '#fff' : 'var(--black)', border: 'none', padding: '14px 26px',
                borderRadius: 999, cursor: 'pointer', textDecoration: 'none',
                fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', gap: 10,
                transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
                transition: 'all 0.2s',
              }}
            >
              shop the drop ↗
            </Link>
          </div>

          <div style={{ position: 'absolute', top: '36%', right: '6%', color: 'var(--accent)', fontSize: 48, fontFamily: 'var(--font-display)' }}>↗</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '22px 6px', gap: 30, borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.22em', textTransform: 'uppercase' }}>
            <span style={{ color: 'var(--black)', fontFamily: 'var(--font-display)', fontSize: 22, marginRight: 6 }}>5</span>
            items · 1 capsule
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            {TAGS.map(t => (
              <span key={t} style={{ padding: '6px 12px', border: '1px solid var(--line)', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink)' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
