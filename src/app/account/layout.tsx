'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ACCOUNT_LINKS = [
  { href: '/account', label: 'Overview' },
  { href: '/account/orders', label: 'My Orders' },
  { href: '/account/settings', label: 'Settings' },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ maxWidth: 1000, margin: '60px auto', padding: '0 28px', minHeight: '60vh' }}>
      <header style={{ marginBottom: 48 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, marginBottom: 12, letterSpacing: '0.04em' }}>
          MY ACCOUNT
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Manage your profile, view orders, and update your settings.
        </p>
      </header>

      <div style={{ display: 'flex', gap: 40, borderBottom: '1px solid var(--line)', marginBottom: 40 }}>
        {ACCOUNT_LINKS.map((link) => {
          const active = link.href === '/account' ? pathname === '/account' : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                textDecoration: 'none',
                paddingBottom: 16,
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: 14,
                color: active ? 'var(--black)' : 'var(--muted)',
                borderBottom: active ? '2px solid var(--black)' : '2px solid transparent',
                transition: 'all 0.2s',
                marginBottom: -1,
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      <div>{children}</div>
    </div>
  );
}
