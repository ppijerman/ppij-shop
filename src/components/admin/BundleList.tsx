'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { useParams } from 'next/navigation';

export default function BundleList({
  initialBundles,
  bundleItems,
  deleteBundleAction,
  toggleBundleActiveAction,
}: {
  initialBundles: any[];
  bundleItems: any[];
  deleteBundleAction: (id: string) => Promise<void>;
  toggleBundleActiveAction: (id: string, isActive: boolean) => Promise<void>;
}) {
  const { role } = useParams();
  const { showToast } = useToast();
  const [bundles, setBundles] = useState<any[]>(initialBundles);
  const [deletingBundleId, setDeletingBundleId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setDeletingBundleId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const removeFromList = (id: string) => {
    setBundles(prev => prev.filter(b => b.id !== id));
  };

  const setActive = (id: string, isActive: boolean) => {
    setBundles(prev => prev.map(b => b.id === id ? { ...b, is_active: isActive } : b));
  };

  const activeBundles = bundles.filter(b => b.is_active);
  const inactiveBundles = bundles.filter(b => !b.is_active);

  return (
    <div ref={containerRef}>
      <BundleTable
        bundles={activeBundles}
        bundleItems={bundleItems}
        role={role as string}
        deletingBundleId={deletingBundleId}
        setDeletingBundleId={setDeletingBundleId}
        removeFromList={removeFromList}
        setActive={setActive}
        deleteBundleAction={deleteBundleAction}
        toggleBundleActiveAction={toggleBundleActiveAction}
        showToast={showToast}
      />

      {inactiveBundles.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--muted)', margin: 0 }}>
              Deactivated
            </h2>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '1px 8px', borderRadius: 999 }}>
              {inactiveBundles.length}
            </span>
          </div>
          <BundleTable
            bundles={inactiveBundles}
            bundleItems={bundleItems}
            role={role as string}
            deletingBundleId={deletingBundleId}
            setDeletingBundleId={setDeletingBundleId}
            removeFromList={removeFromList}
            setActive={setActive}
            deleteBundleAction={deleteBundleAction}
            toggleBundleActiveAction={toggleBundleActiveAction}
            showToast={showToast}
            inactive
          />
        </div>
      )}
    </div>
  );
}

function BundleTable({
  bundles,
  bundleItems,
  role,
  deletingBundleId,
  setDeletingBundleId,
  removeFromList,
  setActive,
  deleteBundleAction,
  toggleBundleActiveAction,
  showToast,
  inactive = false,
}: {
  bundles: any[];
  bundleItems: any[];
  role: string;
  deletingBundleId: string | null;
  setDeletingBundleId: (id: string | null) => void;
  removeFromList: (id: string) => void;
  setActive: (id: string, isActive: boolean) => void;
  deleteBundleAction: (id: string) => Promise<void>;
  toggleBundleActiveAction: (id: string, isActive: boolean) => Promise<void>;
  showToast: (msg: string) => void;
  inactive?: boolean;
}) {
  if (bundles.length === 0) return null;

  return (
    <div className="admin-scroll-x" style={{
      background: inactive ? '#fafafa' : 'white',
      border: '1px solid var(--line)',
      borderRadius: 12,
      overflowX: 'auto',
      opacity: inactive ? 0.8 : 1,
    }}>
      <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--line)', background: inactive ? '#f5f5f5' : 'var(--cream-2)' }}>
            <th style={thStyle}>Bundle Name</th>
            <th style={thStyle}>Included Products</th>
            <th style={thStyle}>Price</th>
            <th style={{ ...thStyle, width: '260px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bundles.map((bundle: any) => (
            <tr key={bundle.id} style={{ borderBottom: '1px solid var(--line)' }}>
              <td style={tdStyle}>
                <div style={{ fontWeight: 600, color: inactive ? 'var(--muted)' : 'inherit' }}>{bundle.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{bundle.desc}</div>
              </td>
              <td style={tdStyle}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {bundleItems
                    .filter((p: any) => p.bundle_id === bundle.id)
                    .map((p: any) => (
                      <span key={p.id} style={{ fontSize: 10, background: 'var(--cream)', padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>
                        {p.name}
                      </span>
                    ))}
                </div>
              </td>
              <td style={{ ...tdStyle, color: inactive ? 'var(--muted)' : 'inherit' }}>
                €{Number(bundle.price).toFixed(2)}
              </td>
              <td style={tdStyle}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {deletingBundleId === bundle.id ? (
                    <>
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--black)' }}>Confirm?</span>
                      <button
                        onClick={async () => {
                          try {
                            await deleteBundleAction(bundle.id);
                            removeFromList(bundle.id);
                            showToast(`deleted · ${bundle.name}`);
                            setDeletingBundleId(null);
                          } catch (err) {
                            showToast(`error · ${err instanceof Error ? err.message : 'failed to delete bundle'}`);
                            setDeletingBundleId(null);
                          }
                        }}
                        style={{ ...dangerButtonStyle, minWidth: 60, padding: '4px 8px' }}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeletingBundleId(null)}
                        style={{ ...secondaryButtonStyle, minWidth: 60, padding: '4px 8px' }}
                      >
                        No
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href={`/admin/${role}/bundles/${bundle.id}`}
                        style={{ color: 'var(--black)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
                      >
                        EDIT
                      </Link>
                      <button
                        onClick={async () => {
                          const next = !bundle.is_active;
                          setActive(bundle.id, next);
                          try {
                            await toggleBundleActiveAction(bundle.id, next);
                            showToast(next ? `activated · ${bundle.name}` : `deactivated · ${bundle.name}`);
                          } catch (err) {
                            setActive(bundle.id, !next);
                            showToast(`error · ${err instanceof Error ? err.message : 'failed to update bundle'}`);
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: inactive ? '#1F8A5B' : 'var(--muted)',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        {inactive ? 'ACTIVATE' : 'DEACTIVATE'}
                      </button>
                      <button
                        onClick={() => setDeletingBundleId(bundle.id)}
                        style={{ background: 'none', border: 'none', color: '#f44336', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                      >
                        DELETE
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '16px 24px',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'var(--muted)'
};

const tdStyle: React.CSSProperties = {
  padding: '20px 24px',
  fontSize: 14
};

const secondaryButtonStyle: React.CSSProperties = { padding: '8px 10px', background: 'white', border: '1px solid var(--line)', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', cursor: 'pointer' };
const dangerButtonStyle: React.CSSProperties = { padding: '8px 10px', background: '#b91c1c', color: 'white', border: 'none', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', cursor: 'pointer' };
