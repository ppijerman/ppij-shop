'use client';

import { useRouter, useParams } from 'next/navigation';
import ProductForm from './ProductForm';
import { useToast } from '@/context/ToastContext';

interface AdminProductEditFormProps {
  initialData: any;
  updateProduct: (formData: FormData) => Promise<void>;
}

export default function AdminProductEditForm({ initialData, updateProduct }: AdminProductEditFormProps) {
  const router = useRouter();
  const { role } = useParams();
  const { showToast } = useToast();

  const handleSubmit = async (formData: FormData) => {
    await updateProduct(formData);
    showToast('Product updated successfully!');
    router.push(`/admin/${role}/products`);
  };

  return (
    <ProductForm initialData={initialData} action={handleSubmit} />
  );
}
