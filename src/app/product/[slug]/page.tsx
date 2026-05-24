import { notFound } from "next/navigation";
import ProductDetailPage from "@/components/product/ProductDetailPage";
import { getProductBySlug, getAllProducts, getProductImages } from "@/lib/dal/products";
import { getVariantsByProductId } from "@/lib/dal/variants";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) notFound();

  const [products, productImages, variants] = await Promise.all([
    getAllProducts(),
    getProductImages(product.id),
    getVariantsByProductId(product.id)
  ])

  return <ProductDetailPage product={product} images={productImages} products={products} variants={variants} />;
}
