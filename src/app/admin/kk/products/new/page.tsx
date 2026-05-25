import ProductForm from '@/components/admin/ProductForm';
import { redirect } from 'next/navigation';
import { createProductAction } from '@/lib/actions/products';
import { generatePrimeSync } from 'crypto';
import { generateSlug } from '@/lib/utils';

export default async function NewProduct() {
  async function handleSubmit(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    await createProductAction({
      name: formData.get('name') as string,
      subtitle: formData.get('subtitle') as string,
      category: formData.get('category') as string,
      fitType: formData.get('fitType') as string,
      tag: formData.get('tag') as string,
      description: formData.get('desc') as string,
      primaryImage: formData.get('primaryImage') as string,
      weightG: Number(formData.get('weightG')),
      price: Number(formData.get('price')),
      originalPrice: Number(formData.get('originalPrice')),
      skuPrefix: formData.get('skuPrefix') as string,
      colors: JSON.parse(formData.get('colors') as string),
      sizes: JSON.parse(formData.get('sizes') as string),
      stock: JSON.parse(formData.get('stock') as string),
      slug: generateSlug(name),
    });
    redirect('/admin/kk/products');
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, marginBottom: 40 }}>NEW PRODUCT</h1>
      <ProductForm action={handleSubmit} />
    </div>
  );
}
