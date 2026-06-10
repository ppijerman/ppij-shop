"use client";

import { useState } from "react";
import CapsuleGrid from "@/components/catalog/CapsuleGrid";
import QuickViewModal from "@/components/product/QuickViewModal";
import Link from "next/link";

export default function CatalogWrapper({ products, bundles }: { products: any[], bundles: any[] }) {
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  return (
    <>
      {bundles.length > 0 && (
        <section style={{ padding: '80px 28px 40px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ maxWidth: 1440, margin: '0 auto' }}>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent-deep)', letterSpacing: '0.3em', textTransform:
      'uppercase', marginBottom: 8 }}>
                -- excluesive deals --
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: 'var(--black)' }}>
                CURATED BUNDLES<span style={{ color: 'var(--accent)' }}>.</span>
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
              {bundles.map(bundle => (
                <Link
                key={bundle.id} 
                href={`/bundle/${bundle.slug}`}
                style={{ 
                  textDecoration: 'none', 
                  background: 'var(--black)', 
                  color: 'var(--cream)', 
                  padding: '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: 280,
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 12 }}>{bundle.name.toUpperCase()}</h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, opacity: 0.8, lineHeight: 1.6 }}>{bundle.desc}</p>
                </div>
                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 24 }}>€{Number(bundle.price).toFixed(2)}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', background: 'var(--accent)', color: '#fff', padding: '8px 14px', borderRadius: 999 }}>
                    view bundle ↗
                  </span>
                </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      <CapsuleGrid products={products} onQuickView={setSelectedProduct} />
      {selectedProduct && (
        <QuickViewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}
