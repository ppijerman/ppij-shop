import ProductForm from '@/components/admin/ProductForm';
import { redirect } from 'next/navigation';
import { createProduct } from '@/lib/actions/products';
import { generateSlug } from '@/lib/utils';
import type { ProductImageInput } from '@/types';

export default async function NewProduct({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  
  async function handleSubmit(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const imageCount = Number(formData.get('image_count') ?? '0');
    const primaryIndex = Number(formData.get('image_primary') ?? '0');
    const images: ProductImageInput[] = [];
    for (let i = 0; i < imageCount; i++) {
      const file = formData.get(`image_file_${i}`) as File | null;
      if (file && file.size > 0) {
        const data = Buffer.from(await file.arrayBuffer());
        images.push({ kind: 'new', data, contentType: file.type, is_primary: i === primaryIndex });
      }
    }
    await createProduct({
      name,
      subtitle: formData.get('subtitle') as string,
      category: formData.get('category') as string,
      tag: formData.get('tag') as string,
      description: formData.get('desc') as string,
      images,
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
