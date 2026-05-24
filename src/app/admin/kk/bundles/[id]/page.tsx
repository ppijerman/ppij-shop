import { getBundleById } from '@/lib/dal/bundles';
import { getAllProducts } from '@/lib/dal/products';
import BundleForm from '@/components/admin/BundleForm';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';

export default async function EditBundle({ params }: { params: { id: string } }) {
  const { id } = await params;
  const bundle = await getBundleById(id);
  const products = await getAllProducts();

  if (!bundle) notFound();

  async function handleSubmit(formData: FormData) {
    'use server';
    console.log('Updating bundle:', formData);
    // TODO: Implement server action for updating bundle
    redirect('/admin/kk/bundles');
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, marginBottom: 40 }}>EDIT BUNDLE</h1>
      <BundleForm initialData={bundle} products={products} action={handleSubmit} />
    </div>
  );
}
