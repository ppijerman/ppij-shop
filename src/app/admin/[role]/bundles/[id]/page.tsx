import { getBundleById } from '@/lib/dal/bundles';
import { getAllProductsWithVariants } from '@/lib/dal/products';
import BundleForm from '@/components/admin/BundleForm';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { updateBundle } from '@/lib/actions/bundles';
import { generateSlug } from '@/lib/utils';

export default async function EditBundle({ params }: { params: Promise<{ id: string, role: string }> }) {
  const { id, role } = await params;
  const bundle = await getBundleById(id);
  const products = await getAllProductsWithVariants();

  if (!bundle) notFound();

  async function updateBundleAction(formData: FormData) {
    'use server';
    const bundleId = formData.get('bundleId') as string;
    if (!bundleId) throw new Error('Bundle ID is required');

    const name = formData.get('name') as string;
    const skuPrefix = formData.get('skuPrefix') as string;
    const price = parseFloat(formData.get('price') as string);

    const originalPriceValue = formData.get('originalPrice');
    const parsedOriginalPrice = 
      typeof originalPriceValue === 'string' && 
        originalPriceValue.trim() !== '' 
      ? parseFloat(originalPriceValue)
      : NaN;
    const originalPrice = Number.isNaN(parsedOriginalPrice) ? null : parsedOriginalPrice;

    const description = formData.get('description') as string;
    const newSlug = generateSlug(name);
    const variantIds = JSON.parse(formData.get('selectedVariantIds') as string);

    await updateBundle(bundleId, { name, skuPrefix, price, originalPrice, description, slug: newSlug, variantIds });
    alert('Bundle updated successfully!');
    redirect(`/admin/${role}/bundles`);
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, marginBottom: 40 }}>EDIT BUNDLE</h1>
      <BundleForm initialData={bundle} products={products} action={updateBundleAction} />
    </div>
  );
}
