import ProductForm from '@/components/admin/ProductForm';
import { redirect } from 'next/navigation';

export default async function NewProduct() {
  async function handleSubmit(formData: FormData) {
    'use server';
    console.log('Creating product:', formData);
    // TODO: Implement server action for creating product
    redirect('/admin/kk/products');
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, marginBottom: 40 }}>NEW PRODUCT</h1>
      <ProductForm action={handleSubmit} />
    </div>
  );
}
