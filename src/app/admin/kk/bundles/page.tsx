'use client';

import { MOCK_BUNDLES } from '@/data/admin';
import { PRODUCTS } from '@/data/products';
import Link from 'next/link';

export default function AdminBundles() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48 }}>BUNDLES</h1>
        <Link 
          href="/admin/kk/bundles/new"
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
          + ADD NEW BUNDLE
        </Link>
      </div>

      <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)', background: 'var(--cream-2)' }}>
              <th style={thStyle}>Bundle Name</th>
              <th style={thStyle}>Included Products</th>
              <th style={thStyle}>Price</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_BUNDLES.map(bundle => {
              const includedProducts = PRODUCTS.filter(p => bundle.productIds.includes(p.id));
              
              return (
                <tr key={bundle.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600 }}>{bundle.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{bundle.description}</div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {includedProducts.map(p => (
                        <span key={p.id} style={{ fontSize: 10, background: 'var(--cream)', padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={tdStyle}>€{bundle.price}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <Link 
                        href={`/admin/kk/bundles/${bundle.id}`}
                        style={{ color: 'var(--black)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
                      >
                        EDIT
                      </Link>
                      <button 
                        style={{ background: 'none', border: 'none', color: '#f44336', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                        onClick={() => confirm('Are you sure you want to delete this bundle?')}
                      >
                        DELETE
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
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
