'use client';

import { PRODUCTS } from '@/data/products';
import Link from 'next/link';

export default function AdminProducts() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48 }}>PRODUCTS</h1>
        <Link 
          href="/admin/kk/products/new"
          style={{
            padding: '12px 24px',
            background: 'var(--black)',
            color: 'var(--cream)',
            textDecoration: 'none',
            borderRadius: 999,
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            letterSpacing: '0.1em',
            fontWeight: 600
          }}
        >
          + ADD NEW PRODUCT
        </Link>
      </div>

      <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--cream-2)' }}>
              <th style={thStyle}>No</th>
              <th style={thStyle}>Product</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Price</th>
              <th style={thStyle}>Stock / Sizes</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map(product => (
              <tr key={product.id} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={tdStyle}>{product.no}</td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 600 }}>{product.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{product.subtitle}</div>
                </td>
                <td style={tdStyle}>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', background: 'var(--cream)', padding: '2px 6px', borderRadius: 4 }}>
                    {product.category}
                  </span>
                </td>
                <td style={tdStyle}>€{product.price}</td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {product.sizes.map(s => (
                      <span key={s} style={{ fontSize: 10, border: '1px solid var(--line)', padding: '2px 4px', borderRadius: 2 }}>
                        {s}: 10
                      </span>
                    ))}
                  </div>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Link 
                      href={`/admin/kk/products/${product.id}`}
                      style={{ color: 'var(--black)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
                    >
                      EDIT
                    </Link>
                    <button 
                      style={{ background: 'none', border: 'none', color: '#f44336', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                      onClick={() => confirm('Are you sure you want to delete this product?')}
                    >
                      DELETE
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
