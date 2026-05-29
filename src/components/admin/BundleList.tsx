'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { useParams } from 'next/navigation';

export default function BundleList({ initialBundles, bundleItems, deleteBundleAction }: { initialBundles: any[], bundleItems: any[], deleteBundleAction: (id: string) => Promise<void> }) {
  const { role } = useParams();
  const { showToast } = useToast();
  const [bundles, setBundles] = useState<any[]>(initialBundles);
  const [deletingBundleId, setDeletingBundleId] = useState<string | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tableRef.current && !tableRef.current.contains(event.target as Node)) {
        setDeletingBundleId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const deleteBundle = (id: string) => {
    setBundles(bundles.filter(b => b.id !== id));
  };

  return (
    <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
      <table ref={tableRef} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--cream-2)' }}>
            <th style={thStyle}>Bundle Name</th>
            <th style={thStyle}>Included Products</th>
            <th style={thStyle}>Price</th>
            <th style={{ ...thStyle, width: '220px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bundles.map((bundle: any) => (
            <tr key={bundle.id} style={{ borderBottom: '1px solid var(--line)' }}>
              <td style={tdStyle}>
                <div style={{ fontWeight: 600 }}>{bundle.name}</div>
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
              <td style={tdStyle}>€{Number(bundle.price).toFixed(2)}</td>
              <td style={tdStyle}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: '180px' }}>
                  {deletingBundleId === bundle.id ? (
                    <>
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--black)' }}>Confirm?</span>
                      <button 
                        onClick={async () => {
                          try {
                            await deleteBundleAction(bundle.id);
                            deleteBundle(bundle.id);
                            showToast(`deleted · ${bundle.name}`);
                            setDeletingBundleId(null);
                          } catch (err) {
                            showToast(`error · failed to delete product`);
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
                        style={{ color: 'var(--black)', fontSize: 12, fontWeight: 600, textDecoration: 'none', padding: 1 }}
                      >
                        EDIT
                      </Link>
                      <button 
                        onClick={() => setDeletingBundleId(bundle.id)}
                        style={{ background: 'none', border: 'none', color: '#f44336', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0.5 }}
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
