import Hero from "@/components/home/Hero";
import Editorial from "@/components/home/Editorial";
import PhotoStrip from "@/components/home/PhotoStrip";
import CtaStrip from "@/components/home/CtaStrip";
import CatalogWrapper from "@/components/catalog/CatalogWrapper";
import { getAllProductsWithVariants } from "@/lib/dal/products";
import { getAllBundles } from "@/lib/dal/bundles";

export default async function HomePage() {
  const [products, bundles] = await Promise.all([
    getAllProductsWithVariants(),
    getAllBundles()
  ]);

  return (
    <>
      <Hero />
      
      <CatalogWrapper products={products} bundles={bundles}/>
      <Editorial />
      <PhotoStrip />
      <CtaStrip />
    </>
  );
}
