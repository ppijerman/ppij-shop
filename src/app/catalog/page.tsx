import CatalogWrapper from "@/components/catalog/CatalogWrapper";
import { getAllProductsWithVariants } from "@/lib/dal/products";

export default async function CatalogPage() {
  const products = await getAllProductsWithVariants();

  return <CatalogWrapper products={products} />;
}
