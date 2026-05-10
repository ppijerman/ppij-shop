"use client";

import { useState } from "react";
import CapsuleGrid from "@/components/catalog/CapsuleGrid";
import QuickViewModal from "@/components/product/QuickViewModal";
import { PRODUCTS } from "@/data/products";
import { Product } from "@/types";

export default function CatalogPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <>
      <CapsuleGrid products={PRODUCTS} onQuickView={setSelectedProduct} />
      {selectedProduct && (
        <QuickViewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}
