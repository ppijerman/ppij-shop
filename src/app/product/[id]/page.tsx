import { notFound } from "next/navigation";
import { PRODUCTS } from "@/data/products";
import ProductDetailPage from "@/components/product/ProductDetailPage";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id.toString() }));
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = PRODUCTS.find((p) => p.id === parseInt(params.id));
  if (!product) notFound();
  return <ProductDetailPage product={product} products={PRODUCTS} />;
}
