import { getAllProductsWithVariants } from '@/lib/dal/products';
import BundleForm from '@/components/admin/BundleForm';
import { redirect } from 'next/navigation';
import { createBundle } from '@/lib/actions/bundles';
import { generateSlug } from '@/lib/utils';

export default async function NewBundle({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  const products = await getAllProductsWithVariants();

  async function createBundleAction(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const imageFile = formData.get('bundle_image_file') as File | null;
    const imageBuffer = imageFile && imageFile.size > 0
      ? Buffer.from(await imageFile.arrayBuffer())
      : undefined;

    await createBundle({
      name,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      originalPrice: formData.get('originalPrice') ? Number(formData.get('originalPrice')) : null,
      skuPrefix: formData.get('skuPrefix') as string,
      slug: generateSlug(name),
      variantIds: JSON.parse(formData.get('selectedVariantIds') as string),
      imageFile: imageBuffer,
      imageContentType: imageBuffer ? 'image/webp' : undefined,
    });
    redirect(`/admin/${role}/bundles`);
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, marginBottom: 40 }}>NEW BUNDLE</h1>
      <BundleForm products={products} action={createBundleAction} />
    </div>
  );
}
