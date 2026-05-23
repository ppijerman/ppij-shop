import Hero from "@/components/home/Hero";
import Editorial from "@/components/home/Editorial";
import PhotoStrip from "@/components/home/PhotoStrip";
import CtaStrip from "@/components/home/CtaStrip";
import CatalogWrapper from "@/components/catalog/CatalogWrapper";
import { getAllProducts } from "@/lib/dal/products";

export default async function HomePage() {
  const products = await getAllProducts();

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
