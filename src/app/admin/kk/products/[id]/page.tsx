'use client';

import { useParams, useRouter } from 'next/navigation';
import { PRODUCTS } from '@/data/products';
import ProductForm from '@/components/admin/ProductForm';

export default function EditProduct() {
  const { id } = useParams();
  const router = useRouter();
  const product = PRODUCTS.find(p => p.id === Number(id));

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
