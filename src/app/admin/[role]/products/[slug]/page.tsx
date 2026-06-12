import { getProductBySlugWithVariants } from '@/lib/dal/products';
import AdminProductEditForm from '@/components/admin/AdminProductEditForm';
import { updateProduct } from '@/lib/actions/products';
import { generateSlug } from '@/lib/utils';
import { extractSkuPrefix } from '@/lib/utils';
import type { ProductImageInput } from '@/types';

export default async function EditProduct({ params }: { params: Promise<{ slug: string, role: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlugWithVariants(slug);

  if (!product) return <div>Product not found</div>;

  // Server Action
  const updateProductAction = async (formData: FormData) => {
    'use server';
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const subtitle = formData.get('subtitle') as string;
    const category = formData.get('category') as string;
    const tag = formData.get('tag') as string;
    const skuPrefix = formData.get('skuPrefix') as string;
    const description = formData.get('desc') as string;
    const colors = JSON.parse(formData.get('colors') as string);
    const newSlug = generateSlug(name);
    const weightG = Number(formData.get('weight'));
    const fits = JSON.parse(formData.get('fits') as string);
    const imageCount = Number(formData.get('image_count') ?? '0');
    const primaryIndex = Number(formData.get('image_primary') ?? '0');
    const images: ProductImageInput[] = [];
    for (let i = 0; i < imageCount; i++) {
      const existingId = formData.get(`image_existing_id_${i}`) as string | null;
      if (existingId) {
        images.push({ kind: 'existing', id: existingId, is_primary: i === primaryIndex });
      } else {
        const file = formData.get(`image_file_${i}`) as File | null;
        if (file && file.size > 0) {
          const data = Buffer.from(await file.arrayBuffer());
          images.push({ kind: 'new', data, contentType: file.type, is_primary: i === primaryIndex });
        }
      }
    }

    await updateProduct(id, { name, subtitle, category, tag, skuPrefix,description, images, colors, slug: newSlug, weightG, fits: fits });
  };

  const initialData = {
    ...product,
    sku_prefix: extractSkuPrefix(product.variants ?? []),
    images: product.images ?? [],
    primary_image: product.primary_image ?? (product.images?.[0]?.url || null)
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, marginBottom: 40 }}>EDIT PRODUCT</h1>
      <AdminProductEditForm initialData={initialData} updateProduct={updateProductAction} />
    </div>
  );
}
