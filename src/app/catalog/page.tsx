import CatalogWrapper from "@/components/catalog/CatalogWrapper";
import { getAllProducts } from "@/lib/dal/products";

export default async function CatalogPage() {
  const products = await getAllProducts();

  return <CatalogWrapper products={products} />;
}
