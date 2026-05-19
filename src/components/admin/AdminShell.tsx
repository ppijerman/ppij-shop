'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type React from 'react';

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isItMode = pathname.startsWith('/admin/it');

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 200px)', background: 'var(--cream)' }}>
      {/* Sidebar */}
      <aside style={{ width: 240, borderRight: '1px solid var(--line)', padding: '40px 24px', flexShrink: 0 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 32, letterSpacing: '0.05em' }}>
          {isItMode ? 'ADMIN IT' : 'ADMIN KK'}
        </h2>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AdminNavLink href="/admin/kk">KK Mode</AdminNavLink>
          <AdminNavLink href="/admin/it">IT Mode</AdminNavLink>

          {!isItMode && (
            <>
              <AdminNavLink href="/admin/kk" activeOnSubroutes={false}>
                Dashboard
              </AdminNavLink>
              <AdminNavLink href="/admin/kk/orders">Orders</AdminNavLink>
              <AdminNavLink href="/admin/kk/payments">Payments</AdminNavLink>
              <AdminNavLink href="/admin/kk/products">Products</AdminNavLink>
              <AdminNavLink href="/admin/kk/bundles">Bundles</AdminNavLink>
            </>
          )}

          {isItMode && (
            <AdminNavLink href="/admin/it">Users</AdminNavLink>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px' }}>
        {children}
      </main>
    </div>
  );
}

function AdminNavLink({ 
        href,
        children, 
        activeOnSubroutes = true,
      }: { 
        href: string;
        children: React.ReactNode;
        activeOnSubroutes?: boolean;
      }) {
  const pathname = usePathname();
  const isActive = pathname === href || (activeOnSubroutes && pathname.startsWith(`${href}/`));

  return (
    <Link 
      href={href} 
      style={{ 
        textDecoration: 'none', 
        color: isActive ? 'var(--orange-deep)' : 'var(--black)', 
        fontFamily: 'var(--font-mono)', 
        fontSize: 12, 
        letterSpacing: '0.1em', 
        textTransform: 'uppercase',
        padding: '10px 0',
        borderBottom: isActive ? '1px solid var(--orange-deep)' : '1px solid transparent',
        transition: 'all 0.2s',
        fontWeight: isActive ? 700 : 400
      }}
    >
      {children}
    </Link>
  );
}