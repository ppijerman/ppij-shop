'use client';

import { useParams, useRouter } from 'next/navigation';
import { MOCK_BUNDLES } from '@/data/admin';
import { PRODUCTS } from '@/data/products';
import BundleForm from '@/components/admin/BundleForm';

export default function EditBundle() {
  const { id } = useParams();
  const router = useRouter();
  const bundle = MOCK_BUNDLES.find(b => b.id === Number(id));

  if (!bundle) return <div>Bundle not found</div>;

  const handleSubmit = (data: any) => {
    console.log('Updating bundle:', data);
    alert('Bundle updated successfully!');
    router.push('/admin/kk/bundles');
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, marginBottom: 40 }}>EDIT BUNDLE</h1>
      <BundleForm initialData={bundle} products={PRODUCTS} onSubmit={handleSubmit} />
    </div>
  );
}
