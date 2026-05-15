'use client';

import ProductForm from '@/components/admin/ProductForm';
import { useRouter } from 'next/navigation';

export default function NewProduct() {
  const router = useRouter();

  const handleSubmit = (data: any) => {
    console.log('Creating product:', data);
    alert('Product created successfully!');
    router.push('/admin/kk/products');
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, marginBottom: 40 }}>NEW PRODUCT</h1>
      <ProductForm onSubmit={handleSubmit} />
    </div>
  );
}
