import { getAllProducts } from '@/lib/dal/products';
import Link from 'next/link';

// Simple server action for deletion
async function deleteProduct(formData: FormData) {
  'use server';
  const id = formData.get('id');
  console.log('Deleting product:', id);
  // Implement actual DB deletion here
}

export default async function AdminProducts() {
  const products = await getAllProducts();

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
              <th style={thStyle}>Product</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Price</th>
              <th style={thStyle}>Stock</th>
              <th style={thStyle}>Actions</th>
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
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Link 
                      href={`/admin/kk/products/${product.slug}`}
                      style={{ color: 'var(--black)', fontSize: 12, fontWeight: 600, textDecoration: 'none', padding: 1 }}
                    >
                      EDIT
                    </Link>
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={product.id} />
                      <button 
                        type="submit"
                        style={{ background: 'none', border: 'none', color: '#f44336', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0.5 }}
                      >
                        DELETE
                      </button>
                    </form>
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
