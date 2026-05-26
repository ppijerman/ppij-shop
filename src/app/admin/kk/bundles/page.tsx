import { getAllBundles, getAllBundleItems } from '@/lib/dal/bundles';
import Link from 'next/link';
import BundleList from '@/components/admin/BundleList';
import { deleteBundle } from '@/lib/actions/bundles';

export default async function AdminBundles() {
  const bundles = await getAllBundles();
  const bundleItems = await getAllBundleItems();

  async function deleteBundle(id: string) {
    'use server';
    await deleteBundle(id);
  }

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

      <BundleList initialBundles={bundles} bundleItems={bundleItems} deleteBundleAction={deleteBundle} />
    </div>
  );
}
