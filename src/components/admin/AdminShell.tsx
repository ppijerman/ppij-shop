'use client';

import Link from 'next/link';
import { usePathname, useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import type React from 'react';

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { role } = useParams();
  const { signOut } = useAuth();
  const router = useRouter();

  const isItAdmin = role === 'it'; 
  const basePath = `/admin/${role}`;

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 62px)', background: 'var(--cream)' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: 260, 
        borderRight: '1px solid var(--line)', 
        padding: '40px 24px', 
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'var(--cream-2)'
      }}>
        <div>
          <div style={{ marginBottom: 40 }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--black)' }} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--black)', letterSpacing: '0.04em' }}>BACK TO SHOP</span>
            </Link>
            
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '0.02em', color: 'var(--black)', lineHeight: 1 }}>
              {isItAdmin ? 'IT ADMIN' : 'KK ADMIN'}
            </h2>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--orange-deep)', textTransform: 'uppercase', marginTop: 8, letterSpacing: '0.1em' }}>
              Management Portal
            </div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <AdminNavLink href={basePath} activeOnSubroutes={false}>
              Dashboard
            </AdminNavLink>
            <AdminNavLink href={`${basePath}/orders`}>Orders</AdminNavLink>
            <AdminNavLink href={`${basePath}/payments`}>Payments</AdminNavLink>
            <AdminNavLink href={`${basePath}/products`}>Products</AdminNavLink>
            <AdminNavLink href={`${basePath}/bundles`}>Bundles</AdminNavLink>
            {isItAdmin && (
              <AdminNavLink href="/admin/it/users">
                Users
              </AdminNavLink>
            )}
          </nav>
        </div>

        {/* Bottom Section: Account & Logout */}
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link 
            href={`${basePath}/settings`}
            style={{
              textDecoration: 'none',
              color: 'var(--black)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontWeight: 600
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Account Settings
          </Link>
          <button
            onClick={() => signOut(() => router.push('/'))}
            style={{
              background: 'none',
              border: 'none',
              color: '#b91c1c',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              padding: 0,
              fontWeight: 700
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '60px 48px', overflowY: 'auto' }}>
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
        color: isActive ? 'var(--black)' : 'var(--muted)', 
        background: isActive ? 'var(--cream)' : 'transparent',
        fontFamily: 'var(--font-mono)', 
        fontSize: 11, 
        letterSpacing: '0.1em', 
        textTransform: 'uppercase',
        padding: '12px 16px',
        borderRadius: 4,
        transition: 'all 0.2s',
        fontWeight: isActive ? 700 : 500,
        display: 'block',
        border: isActive ? '1px solid var(--line)' : '1px solid transparent'
      }}
    >
      {children}
    </Link>
  );
}
