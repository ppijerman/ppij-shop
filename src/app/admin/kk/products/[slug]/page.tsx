'use client';

import { useRouter } from 'next/navigation';
import { getProductBySlug } from '@/lib/dal/products';
import ProductForm from '@/components/admin/ProductForm';

export default async function EditProduct({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const router = useRouter();
  const product = await getProductBySlug(slug);

  if (!product) return <div>Product not found</div>;

  const handleSubmit = (data: any) => {
    console.log('Updating product:', data);
    alert('Product updated successfully!');
    router.push('/admin/kk/products');
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, marginBottom: 40 }}>EDIT PRODUCT</h1>
      <ProductForm initialData={product} onSubmit={handleSubmit} />
    </div>
  );
}
