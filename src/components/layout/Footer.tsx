'use client';

import { useState } from 'react';
import Link from 'next/link';

const SOCIAL = ['IG', 'X', 'YT', 'TT'];

const COLUMNS = [
  { title: 'Shop', links: [{ href: '/catalog', label: 'All Products' }, { href: '/catalog', label: 'T-Shirts' }, { href: '/catalog', label: 'Tote Bags' }, { href: '/catalog', label: 'New Arrivals' }] },
  { title: 'Info', links: [{ href: '/about', label: 'About PPI' }, { href: '/editorial', label: 'Editorial' }, { href: '/faq', label: 'Size Guide' }, { href: '/shipping', label: 'Shipping' }] },
  { title: 'Legal', links: [{ href: '/terms', label: 'Terms & Conditions' }, { href: '/privacy', label: 'Privacy Policy' }, { href: '/impressum', label: 'Impressum' }, { href: '/shipping', label: 'Shipping Policy' }, { href: '/returns', label: 'Return Policy' }, { href: '/withdrawal', label: 'Withdrawal Form' }] },
];

export default function Footer() {
  return (
    <footer style={{ background: 'var(--black)', color: 'var(--cream)', padding: '60px 28px 24px' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 40, paddingBottom: 36, borderBottom: '1px solid #222' }}>
          <div>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--cream)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--cream)', letterSpacing: '0.04em' }}>PPI</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--accent)', letterSpacing: '0.04em' }}>JERMAN</span>
              </div>
            </Link>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(239,234,224,0.6)', maxWidth: 300 }}>
              Official merchandise dari Perhimpunan Pelajar Indonesia di Jerman. Wear your roots, support your community.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              {SOCIAL.map(s => <SocialBtn key={s} label={s} />)}
            </div>
          </div>

          {COLUMNS.map(col => (
            <div key={col.title}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 14 }}>— {col.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {col.links.map((l, j) => <FooterLink key={j} href={l.href}>{l.label}</FooterLink>)}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '24px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(239,234,224,0.4)' }}>© 2026 PPI Jerman · all rights reserved</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(239,234,224,0.4)' }}>🇮🇩 Indonesia × 🇩🇪 Deutschland</span>
        </div>
      </div>
    </footer>
  );
}

function SocialBtn({ label }: { label: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      style={{ width: 32, height: 32, borderRadius: '50%', border: `1px solid ${hovered ? 'var(--accent)' : '#333'}`, background: hovered ? 'var(--accent)' : 'transparent', color: hovered ? 'var(--black)' : 'var(--cream)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.2s' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
    </button>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href}
      style={{ display: 'block', textDecoration: 'none', fontFamily: 'var(--font-body)', fontSize: 13, color: hovered ? 'var(--cream)' : 'rgba(239,234,224,0.7)', transition: 'color 0.2s' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </Link>
  );
}
