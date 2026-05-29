'use client';

import { useRouter, useParams } from 'next/navigation';
import ProductForm from './ProductForm';

interface AdminProductEditFormProps {
  initialData: any;
  updateProduct: (formData: FormData) => Promise<void>;
}

export default function AdminProductEditForm({ initialData, updateProduct }: AdminProductEditFormProps) {
  const router = useRouter();
  const { role } = useParams();

  const handleSubmit = async (formData: FormData) => {
    await updateProduct(formData);
    alert('Product updated successfully!');
    router.push(`/admin/${role}/products`);
  };

  return (
    <ProductForm initialData={initialData} action={handleSubmit} />
  );
}
