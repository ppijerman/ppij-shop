'use client';

import { useAuth, useUser } from "@clerk/nextjs";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { redirect, usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/catalog', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { isLoaded: authLoaded, isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const role = user?.publicMetadata?.role;
  const isAdmin = role === 'ADMIN_IT' || role === 'ADMIN_KK';
  const adminPrefix = role === 'ADMIN_IT' ? 'it' : 'kk';
  const mobileToggleRef = useRef<HTMLDivElement | null>(null);
  const mobilePanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: MouseEvent): void {
      const target = event.target;
      if (!(target instanceof Node)) return;
      const insideToggle = mobileToggleRef.current?.contains(target) ?? false;
      const insidePanel = mobilePanelRef.current?.contains(target) ?? false;
      if (!insideToggle && !insidePanel) setMenuOpen(false);
    }

    function handleEscape(event: KeyboardEvent): void {
      if (event.key === 'Escape') setMenuOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  if (pathname.startsWith('/admin')) return null;

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  const displayLinks = isAdmin ? [{href: `/admin/${adminPrefix}`, label: 'Dashboard'}, ...NAV_LINKS] : NAV_LINKS;

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 1000,
      background: scrolled ? 'rgba(239,234,224,0.93)' : 'var(--cream)',
      backdropFilter: scrolled ? 'blur(14px)' : 'none',
      borderBottom: '1px solid var(--line)',
      transition: 'background 0.2s',
    }}>
      <div className="r-pad-x nav-grid" style={{ maxWidth: 1440, margin: '0 auto', padding: '0 28px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', height: 62, gap: 16 }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, justifySelf: 'start' }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--black)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--black)', letterSpacing: '0.04em' }}>PPI</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--accent)', letterSpacing: '0.04em' }}>JERMAN</span>
          </div>
        </Link>

        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {displayLinks.map(l => (
              <NavLink key={l.href} href={l.href} active={isActive(l.href)}>
                {l.label}
              </NavLink>
            ))
          }
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, justifySelf: 'end' }}>
          <AccountControl
            authLoaded={authLoaded}
            isSignedIn={Boolean(isSignedIn)}
            triggerName={user?.firstName ?? user?.username ?? "Member"}
            signedInName={user?.fullName ?? user?.firstName ?? user?.username ?? "Member"}
            signOut={signOut}
            role={role as string}
          />
          {!isAdmin && <CartPill count={cartCount} className="nav-cart-desktop" />}
          <div ref={mobileToggleRef}>
            <button
              type="button"
              className="nav-toggle"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(open => !open)}
              style={{
                background: menuOpen ? 'var(--accent)' : 'transparent',
                color: menuOpen ? '#fff' : 'var(--black)',
                border: '1px solid var(--line)',
                borderRadius: 999,
                padding: '8px 12px',
                cursor: 'pointer',
                alignItems: 'center',
                transition: 'all 0.2s',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                {menuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div
          ref={mobilePanelRef}
          role="menu"
          aria-label="Navigation menu"
          className="nav-mobile-panel"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'rgba(239,234,224,0.98)',
            border: '1px solid var(--line)',
            boxShadow: '0 18px 40px rgba(14,14,14,0.12)',
            backdropFilter: 'blur(16px)',
            padding: '8px',
            zIndex: 1100,
            animation: 'fadeIn 0.18s ease',
          }}
        >
          <div style={{ padding: '10px 12px 12px', borderBottom: '1px solid var(--line)', marginBottom: 6 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              Navigation
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {displayLinks.map((l, i) => (
              <div
                key={l.href}
                style={{
                  borderTop: i > 0 ? '1px solid var(--line)' : 'none',
                  marginTop: i > 0 ? 6 : 0,
                  paddingTop: i > 0 ? 6 : 0,
                }}
              >
                <MobileNavItem
                  href={l.href}
                  active={isActive(l.href)}
                  onClick={() => setMenuOpen(false)}
                >
                  {l.label}
                </MobileNavItem>
              </div>
            ))}
          </div>
          {!isAdmin && (
            <div style={{ borderTop: '1px solid var(--line)', marginTop: 6, paddingTop: 6 }}>
              <div onClick={() => setMenuOpen(false)}>
                <CartPill count={cartCount} />
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

interface AccountControlProps {
  authLoaded: boolean;
  isSignedIn: boolean;
  triggerName: string;
  signedInName: string;
  signOut: ReturnType<typeof useAuth>["signOut"];
  role: string
}

type AccountMenuItem =
  | { id: 'account'; label: string; kind: 'account' }
  | { id: 'orders'; label: string; kind: 'orders' }
  | { id: 'sign-out'; label: string; kind: 'signout' };

const ACCOUNT_MENU_ITEMS: AccountMenuItem[] = [
  { id: 'account', label: 'Account', kind: 'account' },
  { id: 'orders', label: 'Orders', kind: 'orders' },
  { id: 'sign-out', label: 'Sign out', kind: 'signout' },
];

interface AccountActionItemProps {
  label: string;
  onClick: () => void;
}

function AccountActionItem({ label, onClick }: AccountActionItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        background: hovered ? 'rgba(61, 90, 128, 0.1)' : 'transparent',
        border: 'none',
        padding: '11px 12px',
        color: 'var(--black)',
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s',
      }}
    >
      <span>{label}</span>
    </button>
  );
}

function AccountControl({ authLoaded, isSignedIn, triggerName, signedInName, signOut, role }: AccountControlProps) {
  const isAdmin = role === 'ADMIN_IT' || role === 'ADMIN_KK';
  const adminPrefix = role === 'ADMIN_IT' ? 'it' : 'kk';

  const [isOpen, setIsOpen] = useState(false);
  const accountControlRef = useRef<HTMLDivElement | null>(null);

  const filteredMenuItems = ACCOUNT_MENU_ITEMS.filter(item => {
    if (isAdmin && item.kind === 'orders') return false;
    return true;
  })

  useEffect(() => {
    if (!isSignedIn) {
      setIsOpen(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent): void {
      if (accountControlRef.current === null) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (!accountControlRef.current.contains(target)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  if (!authLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return (
      <Link
        href="/auth/login"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--black)',
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          textDecoration: 'none',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
        <span className="nav-account-name">Account</span>
      </Link>
    );
  }

  return (
    <div
      ref={accountControlRef}
      style={{ position: 'relative' }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: isOpen ? 'var(--accent)' : 'transparent',
          color: isOpen ? '#fff' : 'var(--black)',
          border: '1px solid var(--line)',
          borderRadius: 999,
          padding: '8px 14px',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          <span className="nav-account-name" style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>{triggerName}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Account menu"
          className="account-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            minWidth: 220,
            background: 'rgba(239,234,224,0.98)',
            border: '1px solid var(--line)',
            boxShadow: '0 18px 40px rgba(14,14,14,0.12)',
            backdropFilter: 'blur(16px)',
            padding: 8,
            zIndex: 1100,
          }}
        >
          <div
            style={{
              padding: '10px 12px 12px',
              borderBottom: '1px solid var(--line)',
              marginBottom: 6,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: 'var(--muted)',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Signed in as
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: 'var(--black)' }}>
              {signedInName}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {filteredMenuItems.map((item) => {
              const isSignOutItem = item.kind === 'signout';

              return (
                <div
                  key={item.id}
                  style={{
                    borderTop: isSignOutItem ? '1px solid var(--line)' : 'none',
                    marginTop: isSignOutItem ? 6 : 0,
                    paddingTop: isSignOutItem ? 6 : 0,
                  }}
                >
                  <AccountActionItem
                    label={item.label}
                    onClick={() => {
                      setIsOpen(false);
                      if (item.kind === 'account') {
                        redirect(isAdmin ? `/admin/${adminPrefix}/settings` : '/account')
                      } else if (item.kind === 'orders') {
                        redirect('/account/orders')
                      } else if (item.kind === 'signout') {
                        void signOut({ redirectUrl: '/' });
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileNavItem({ href, active, onClick, children }: { href: string; active: boolean; onClick: () => void; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        textDecoration: 'none',
        background: hovered ? 'rgba(61, 90, 128, 0.1)' : 'transparent',
        padding: '11px 12px',
        color: active ? 'var(--accent-deep)' : 'var(--black)',
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        fontWeight: 600,
        textAlign: 'left',
        transition: 'all 0.2s',
      }}
    >
      <span>{children}</span>
    </Link>
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
        color: hovered ? 'var(--accent-deep)' : active ? 'var(--black)' : 'var(--ink)',
        letterSpacing: '0.04em', position: 'relative', transition: 'color 0.15s',
      }}
    >
      {children}
      {active && <span style={{ position: 'absolute', bottom: -1, left: '50%', transform: 'translateX(-50%)', width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)' }} />}
    </Link>
  );
}

function CartPill({ count, className }: { count: number; className?: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href="/cart"
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8,
        background: hovered ? 'var(--accent)' : 'var(--black)',
        color: 'var(--cream)',
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
