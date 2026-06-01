import ProductForm from '@/components/admin/ProductForm';
import { redirect } from 'next/navigation';
import { createProduct } from '@/lib/actions/products';
import { generateSlug } from '@/lib/utils';

export default async function NewProduct({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  
  async function handleSubmit(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    await createProduct({
      name: formData.get('name') as string,
      subtitle: formData.get('subtitle') as string,
      category: formData.get('category') as string,
      tag: formData.get('tag') as string,
      description: formData.get('desc') as string,
      images: JSON.parse(formData.get('images') as string),
      weightG: Number(formData.get('weight')),
      skuPrefix: formData.get('skuPrefix') as string,
      colors: JSON.parse(formData.get('colors') as string),
      fits: JSON.parse(formData.get('fits') as string),
      slug: generateSlug(name),
    });
    redirect(`/admin/${role}/products`);
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, marginBottom: 40 }}>NEW PRODUCT</h1>
      <ProductForm action={handleSubmit} />
    </div>
  );
}
