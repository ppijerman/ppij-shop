'use client';

import { useState, useRef, useEffect } from 'react';
import { deleteProduct } from '@/lib/actions/products';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';

export default function ProductList({ initialProducts }: { initialProducts: any[] }) {
  const { showToast } = useToast();
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tableRef.current && !tableRef.current.contains(event.target as Node)) {
        setDeletingProductId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
      <table ref={tableRef} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--cream-2)' }}>
            <th style={thStyle}>Product</th>
            <th style={thStyle}>Category</th>
            <th style={thStyle}>Price</th>
            <th style={thStyle}>Stock</th>
            <th style={{ ...thStyle, width: '250px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product: any) => (
            <tr key={product.id} style={{ borderBottom: '1px solid var(--line)' }}>
              <td style={tdStyle}>
                <div style={{ fontWeight: 600 }}>{product.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{product.subtitle}</div>
              </td>
              <td style={tdStyle}>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', background: 'var(--cream)', padding: '2px 6px', borderRadius: 4 }}>
                  {product.category}
                </span>
              </td>
              <td style={tdStyle}>
                {product.variants && product.variants.length > 0 
                  ? `€${Number(product.variants[0].price).toFixed(2)}` 
                  : 'N/A'}
              </td>
              <td style={tdStyle}>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {product.variants?.map((v: any) => (
                    <span key={v.id} style={{ fontSize: 10, border: '1px solid var(--line)', padding: '2px 4px', borderRadius: 2 }}>
                      {v.size}: {v.stock}
                    </span>
                  ))}
                </div>
              </td>
              <td style={tdStyle}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: '180px' }}>
                  {deletingProductId === product.id ? (
                    <>
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--black)' }}>Confirm?</span>
                      <button 
                        onClick={async () => {
                          try {
                            await deleteProduct(product.id);
                            deleteProduct(product.id);

                            showToast(`deleted · ${product.name}`);
                            
                            setDeletingProductId(null);
                          } catch (err) {
                            showToast(`error · failed to delete product`);
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
                        href={`/admin/kk/products/${product.slug}`}
                        style={{ color: 'var(--black)', fontSize: 12, fontWeight: 600, textDecoration: 'none', padding: 1 }}
                      >
                        EDIT
                      </Link>
                      <button 
                        onClick={() => setDeletingProductId(product.id)}
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
