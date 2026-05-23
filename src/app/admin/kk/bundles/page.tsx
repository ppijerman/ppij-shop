import { getAllBundles, getAllBundleItems } from '@/lib/dal/bundles';
import Link from 'next/link';

async function deleteBundle(formData: FormData) {
  'use server';
  const id = formData.get('id');
  console.log('Deleting bundle:', id);
  // Implement actual DB deletion here
}

export default async function AdminBundles() {
  const bundles = await getAllBundles();
  const bundleItems = await getAllBundleItems();

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
            {bundles.map((bundle: any) => {
              return (
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
                    <div style={{ display: 'flex', gap: 12 }}>
                      <Link 
                        href={`/admin/kk/bundles/${bundle.id}`}
                        style={{ color: 'var(--black)', fontSize: 12, fontWeight: 600, textDecoration: 'none', padding: 1 }}
                      >
                        EDIT
                      </Link>
                      <form action={deleteBundle}>
                        <input type="hidden" name="id" value={bundle.id} />
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
