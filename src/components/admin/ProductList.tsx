'use client';

import { useState, useRef, useEffect } from 'react';
import { deleteProduct, toggleProductActiveAction } from '@/lib/actions/products';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { useParams } from 'next/navigation';

export default function ProductList({ initialProducts }: { initialProducts: any[] }) {
  const { role } = useParams();
  const { showToast } = useToast();
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tableRef.current && !tableRef.current.contains(event.target as Node)) {
        setDeletingProductId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const removeFromList = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const setActive = (id: string, isActive: boolean) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: isActive } : p));
  };

  const activeProducts = products.filter(p => p.is_active);
  const inactiveProducts = products.filter(p => !p.is_active);

  return (
    <div ref={tableRef}>
      <ProductTable
        products={activeProducts}
        role={role as string}
        deletingProductId={deletingProductId}
        setDeletingProductId={setDeletingProductId}
        removeFromList={removeFromList}
        setActive={setActive}
        showToast={showToast}
      />

      {inactiveProducts.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--muted)', margin: 0 }}>
              Deactivated
            </h2>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '1px 8px', borderRadius: 999 }}>
              {inactiveProducts.length}
            </span>
          </div>
          <ProductTable
            products={inactiveProducts}
            role={role as string}
            deletingProductId={deletingProductId}
            setDeletingProductId={setDeletingProductId}
            removeFromList={removeFromList}
            setActive={setActive}
            showToast={showToast}
            inactive
          />
        </div>
      )}
    </div>
  );
}

function ProductTable({
  products,
  role,
  deletingProductId,
  setDeletingProductId,
  removeFromList,
  setActive,
  showToast,
  inactive = false,
}: {
  products: any[];
  role: string;
  deletingProductId: string | null;
  setDeletingProductId: (id: string | null) => void;
  removeFromList: (id: string) => void;
  setActive: (id: string, isActive: boolean) => void;
  showToast: (msg: string) => void;
  inactive?: boolean;
}) {
  if (products.length === 0) return null;

  return (
    <div className="admin-scroll-x" style={{
      background: inactive ? '#fafafa' : 'white',
      border: '1px solid var(--line)',
      borderRadius: 12,
      overflowX: 'auto',
      opacity: inactive ? 0.8 : 1,
    }}>
      <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--line)', background: inactive ? '#f5f5f5' : 'var(--cream-2)' }}>
            <th style={thStyle}>Product</th>
            <th style={thStyle}>Category</th>
            <th style={thStyle}>Price</th>
            <th style={thStyle}>Stock</th>
            <th style={{ ...thStyle, width: '240px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product: any) => (
            <tr key={product.id} style={{ borderBottom: '1px solid var(--line)' }}>
              <td style={tdStyle}>
                <div style={{ fontWeight: 600, color: inactive ? 'var(--muted)' : 'inherit' }}>{product.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{product.subtitle}</div>
              </td>
              <td style={tdStyle}>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', background: 'var(--cream)', padding: '2px 6px', borderRadius: 4 }}>
                  {product.category}
                </span>
              </td>
              <td style={tdStyle}>
                <span style={{ color: inactive ? 'var(--muted)' : 'inherit' }}>
                  {product.variants && product.variants.length > 0
                    ? `€${Number(product.variants[0].price).toFixed(2)}`
                    : 'N/A'}
                </span>
              </td>
              <td style={tdStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(() => {
                    const fits = Array.from(new Set(product.variants?.map((v: any) => v.fit_type)));
                    return fits.map((fit: any) => (
                      <div key={fit} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {fit}
                        </div>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {product.variants
                            ?.filter((v: any) => v.fit_type === fit)
                            .map((v: any) => (
                              <span
                                key={v.id}
                                style={{
                                  fontSize: 10,
                                  border: '1px solid var(--line)',
                                  padding: '2px 4px',
                                  borderRadius: 2,
                                  background: fit === 'OVERSIZED' ? 'rgba(255, 165, 0, 0.05)' : 'transparent',
                                  borderColor: fit === 'OVERSIZED' ? 'rgba(255, 165, 0, 0.2)' : 'var(--line)'
                                }}
                              >
                                {v.size}: {v.stock}
                              </span>
                            ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </td>
              <td style={tdStyle}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {deletingProductId === product.id ? (
                    <>
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--black)' }}>Confirm?</span>
                      <button
                        onClick={async () => {
                          try {
                            await deleteProduct(product.id);
                            removeFromList(product.id);
                            showToast(`deleted · ${product.name}`);
                            setDeletingProductId(null);
                          } catch (err) {
                            showToast(`error · ${err instanceof Error ? err.message : 'failed to delete product'}`);
                            setDeletingProductId(null);
                          }
                        }}
                        style={{ ...dangerButtonStyle, minWidth: 60, padding: '4px 8px' }}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeletingProductId(null)}
                        style={{ ...secondaryButtonStyle, minWidth: 60, padding: '4px 8px' }}
                      >
                        No
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href={`/admin/${role}/products/${product.slug}`}
                        style={{ color: 'var(--black)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
                      >
                        EDIT
                      </Link>
                      <button
                        onClick={async () => {
                          const next = !product.is_active;
                          setActive(product.id, next);
                          try {
                            await toggleProductActiveAction(product.id, next);
                            showToast(next ? `activated · ${product.name}` : `deactivated · ${product.name}`);
                          } catch (err) {
                            setActive(product.id, !next);
                            showToast(`error · ${err instanceof Error ? err.message : 'failed to update product'}`);
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
                        onClick={() => setDeletingProductId(product.id)}
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
