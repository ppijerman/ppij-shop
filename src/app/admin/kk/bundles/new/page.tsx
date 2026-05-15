'use client';

import { useRouter } from 'next/navigation';
import { PRODUCTS } from '@/data/products';
import BundleForm from '@/components/admin/BundleForm';

export default function NewBundle() {
  const router = useRouter();

  const handleSubmit = (data: any) => {
    console.log('Creating bundle:', data);
    alert('Bundle created successfully!');
    router.push('/admin/kk/bundles');
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, marginBottom: 40 }}>NEW BUNDLE</h1>
      <BundleForm products={PRODUCTS} onSubmit={handleSubmit} />
    </div>
  );
}
