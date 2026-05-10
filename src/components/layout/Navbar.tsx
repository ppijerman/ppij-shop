'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/catalog', label: 'Shop' },
  { href: '/editorial', label: 'Editorial' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { cartCount } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 1000,
      background: scrolled ? 'rgba(239,234,224,0.93)' : 'var(--cream)',
      backdropFilter: scrolled ? 'blur(14px)' : 'none',
      borderBottom: '1px solid var(--line)',
      transition: 'background 0.2s',
    }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 28px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', height: 62, gap: 16 }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, justifySelf: 'start' }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--black)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--black)', letterSpacing: '0.04em' }}>PPI</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--orange)', letterSpacing: '0.04em' }}>JERMAN</span>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {NAV_LINKS.map(l => (
            <NavLink key={l.href} href={l.href} active={isActive(l.href)}>{l.label}</NavLink>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, justifySelf: 'end' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--black)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--black)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            Account
          </button>
          <CartPill count={cartCount} />
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        textDecoration: 'none', padding: '8px 16px',
        fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13,
        color: hovered ? 'var(--orange-deep)' : active ? 'var(--black)' : 'var(--ink)',
        letterSpacing: '0.04em', position: 'relative', transition: 'color 0.15s',
      }}
    >
      {children}
      {active && <span style={{ position: 'absolute', bottom: -1, left: '50%', transform: 'translateX(-50%)', width: 5, height: 5, borderRadius: '50%', background: 'var(--orange)' }} />}
    </Link>
  );
}

function CartPill({ count }: { count: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href="/cart"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8,
        background: hovered ? 'var(--orange)' : 'var(--black)',
        color: hovered ? 'var(--black)' : 'var(--cream)',
        padding: '9px 18px', borderRadius: 999,
        fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
        transition: 'all 0.2s',
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M3 3h2l2 14h12l2-10H6" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" />
      </svg>
      Cart [{count}]
    </Link>
  );
}
