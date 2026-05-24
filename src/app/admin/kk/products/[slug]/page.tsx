import { getProductBySlug } from '@/lib/dal/products';
import AdminProductEditForm from '@/components/admin/AdminProductEditForm';
import { updateProduct } from '@/lib/dal/products'; // Assuming you have an updateProduct function in DAL

export default async function EditProduct({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return <div>Product not found</div>;

  // Server Action
  const updateProductAction = async (formData: FormData) => {
    'use server';
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const subtitle = formData.get('subtitle') as string;
    const category = formData.get('category') as string;
    const fitType = formData.get('fitType') as string;
    const tag = formData.get('tag') as string;
    const skuPrefix = formData.get('skuPrefix') as string;
    const price = parseFloat(formData.get('price') as string);

    const originalPriceValue = formData.get('originalPrice');
    const parsedOriginalPrice = 
      typeof originalPriceValue === 'string' && 
        originalPriceValue.trim() !== '' 
      ? parseFloat(originalPriceValue)
      : NaN;
    const originalPrice = Number.isNaN(parsedOriginalPrice) ? null : parsedOriginalPrice;

    const description = formData.get('desc') as string;
    const primaryImage = formData.get('primaryImage') as string;
    const sizes = JSON.parse(formData.get('sizes') as string);
    const colors = JSON.parse(formData.get('colors') as string);
    const stock = JSON.parse(formData.get('stock') as string);

    await updateProduct(id, { name, subtitle, category, fitType, tag, skuPrefix, price, originalPrice, description, primaryImage, sizes, colors, stock });
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, marginBottom: 40 }}>EDIT PRODUCT</h1>
      <AdminProductEditForm initialData={product} updateProduct={updateProductAction} />
    </div>
  );
}
