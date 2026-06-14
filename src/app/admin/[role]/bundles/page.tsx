import { getAllBundlesAdmin, getAllBundleItems } from '@/lib/dal/bundles';
import Link from 'next/link';
import BundleList from '@/components/admin/BundleList';
import { deleteBundle, toggleBundleActiveAction } from '@/lib/actions/bundles';

export default async function AdminBundles({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  const bundles = await getAllBundlesAdmin();
  const bundleItems = await getAllBundleItems();

  async function deleteBundleAction(id: string) {
    'use server';
    await deleteBundle(id);
  }

  async function toggleBundleActive(id: string, isActive: boolean) {
    'use server';
    await toggleBundleActiveAction(id, isActive);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48 }}>BUNDLES</h1>
        <Link
          href={`/admin/${role}/bundles/new`}
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

      <BundleList initialBundles={bundles} bundleItems={bundleItems} deleteBundleAction={deleteBundleAction} toggleBundleActiveAction={toggleBundleActive} />
    </div>
  );
}
