import { getAllProducts } from '@/lib/dal/products';
import BundleForm from '@/components/admin/BundleForm';
import { redirect } from 'next/navigation';

export default async function NewBundle() {
  const products = await getAllProducts();

  const handleSubmit = async (data: any) => {
    'use server';
    console.log('Creating bundle:', data);
    // TODO: Implement server action for creating bundle
    redirect('/admin/kk/bundles');
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, marginBottom: 40 }}>NEW BUNDLE</h1>
      <BundleForm products={products} onSubmit={handleSubmit} />
    </div>
  );
}
