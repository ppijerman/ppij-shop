import { getProductBySlugWithVariants } from '@/lib/dal/products';
import AdminProductEditForm from '@/components/admin/AdminProductEditForm';
import { updateProduct } from '@/lib/actions/products';
import { generateSlug } from '@/lib/utils';
import { extractSkuPrefix } from '@/lib/utils';

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
    const images = JSON.parse(formData.get('images') as string);
    const colors = JSON.parse(formData.get('colors') as string);
    const newSlug = generateSlug(name);
    const weightG = Number(formData.get('weightG'));
    const fits = JSON.parse(formData.get('fits') as string);

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
