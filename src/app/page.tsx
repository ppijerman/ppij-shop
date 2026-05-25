import Hero from "@/components/home/Hero";
import Editorial from "@/components/home/Editorial";
import PhotoStrip from "@/components/home/PhotoStrip";
import CtaStrip from "@/components/home/CtaStrip";
import CatalogWrapper from "@/components/catalog/CatalogWrapper";
import { getAllProductsWithVariants } from "@/lib/dal/products";

export default async function HomePage() {
  const products = await getAllProductsWithVariants();

  return (
    <>
      <Hero />
      <CatalogWrapper products={products} />
      <Editorial />
      <PhotoStrip />
      <CtaStrip />
    </>
  );
}
