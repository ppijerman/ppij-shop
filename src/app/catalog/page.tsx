import CatalogWrapper from "@/components/catalog/CatalogWrapper";
import { getAllBundles } from "@/lib/dal/bundles";
import { getAllProductsWithVariants } from "@/lib/dal/products";

export default async function CatalogPage() {
  const [products, bundles] = await Promise.all([
    getAllProductsWithVariants(),
    getAllBundles()
  ]);

  return <CatalogWrapper products={products} bundles={bundles}/>;
}
