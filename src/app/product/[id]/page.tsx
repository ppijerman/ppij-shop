import { notFound } from "next/navigation";
import { PRODUCTS } from "@/data/mockup/products";
import ProductDetailPage from "@/components/product/ProductDetailPage";
import { getProductImages } from "@/data/mockup/images";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === parseInt(id));
  if (!product) notFound();

  const images = await getProductImages(product.id)

  return <ProductDetailPage product={product} images={images} products={PRODUCTS} />;
}
