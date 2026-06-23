'use client';

import { useState } from 'react';
import Link from 'next/link';

const COLUMNS = [
  { title: 'Shop', links: [{ href: '/catalog', label: 'All Products' }, { href: '/catalog', label: 'T-Shirts' }, { href: '/catalog', label: 'Tote Bags' }] },
  { title: 'Info', links: [{ href: '/about', label: 'About PPI' }, { href: '/faq', label: 'Size Guide' }, { href: '/shipping', label: 'Shipping' }] },
  { title: 'Legal', links: [{ href: '/terms', label: 'Terms & Conditions' }, { href: '/privacy', label: 'Privacy Policy' }, { href: '/impressum', label: 'Impressum' }, { href: '/shipping', label: 'Shipping Policy' }, { href: '/returns', label: 'Return Policy' }, { href: '/withdrawal', label: 'Withdrawal Form' }] },
];

const SOCIALS = [
  {
    label: 'Facebook',
    href: 'https://facebook.com/ppijerman',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/ppijerman',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://tiktok.com/@ppijerman',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
      </svg>
    ),
  },
  {
    label: 'Twitter / X',
    href: 'https://twitter.com/ppijerman',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/@ppijerman',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer style={{ background: 'var(--black)', color: 'var(--cream)', padding: '60px 28px 24px' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1.2fr', gap: 40, paddingBottom: 36, borderBottom: '1px solid #222' }}>
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
              Official merchandise of the Indonesian Students Association in Germany. Wear your roots, support your community.
            </p>
          </div>

          {COLUMNS.map(col => (
            <div key={col.title}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 14 }}>— {col.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {col.links.map((l, j) => <FooterLink key={j} href={l.href}>{l.label}</FooterLink>)}
              </div>
            </div>
          ))}

          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 14 }}>— Contact</div>
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--cream)', fontWeight: 600 }}>PPI Jerman</span>
            </div>
            <a
              href="mailto:partnership@ppijerman.org"
              style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(239,234,224,0.7)', textDecoration: 'none', display: 'block', marginBottom: 20 }}
            >
              partnership@ppijerman.org
            </a>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {SOCIALS.map(s => <SocialIconBtn key={s.label} href={s.href} label={s.label} icon={s.icon} />)}
            </div>
          </div>
        </div>

        <div style={{ padding: '24px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(239,234,224,0.4)' }}>© 2026 PPI Jerman · all rights reserved</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(239,234,224,0.4)' }}>🇮🇩 Indonesia × 🇩🇪 Deutschland</span>
        </div>
      </div>
    </footer>
  );
}

function SocialIconBtn({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={{ color: hovered ? 'var(--accent)' : 'var(--cream)', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {icon}
    </a>
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
