import { notFound } from "next/navigation";
import { PRODUCTS } from "@/data/products";
import ProductDetailPage from "@/components/product/ProductDetailPage";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id.toString() }));
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === parseInt(id));
  if (!product) notFound();
  return <ProductDetailPage product={product} products={PRODUCTS} />;
}
