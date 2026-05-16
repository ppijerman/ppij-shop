"use client";

import { useState } from "react";
import Hero from "@/components/home/Hero";
import CapsuleGrid from "@/components/catalog/CapsuleGrid";
import Editorial from "@/components/home/Editorial";
import PhotoStrip from "@/components/home/PhotoStrip";
import CtaStrip from "@/components/home/CtaStrip";
import QuickViewModal from "@/components/product/QuickViewModal";
import { PRODUCTS, Product } from "@/data/mockup/products";

export default function HomePage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <>
      <Hero />
      <CapsuleGrid products={PRODUCTS} onQuickView={setSelectedProduct} />
      <Editorial />
      <PhotoStrip />
      <CtaStrip />
      {selectedProduct && (
        <QuickViewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}
