"use client";

import { useState } from "react";
import CapsuleGrid from "@/components/catalog/CapsuleGrid";
import QuickViewModal from "@/components/product/QuickViewModal";
import Link from "next/link";

export default function CatalogWrapper({ products, bundles }: { products: any[], bundles: any[] }) {
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  return (
    <>
      <CapsuleGrid products={products} onQuickView={setSelectedProduct} />
        {selectedProduct && (
          <QuickViewModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
      )}
      {bundles.length > 0 && (
        <section style={{ padding: '80px 28px 40px' }}>
          <div style={{ maxWidth: 1440, margin: '0 auto' }}>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent-deep)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 8 }}>
                -- excluesive deals --
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 6vw, 48px)', color: 'var(--black)' }}>
                CURATED BUNDLES<span style={{ color: 'var(--accent)' }}>.</span>
              </h2>
            </div>

            <div className="bundle-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
              {bundles.map(bundle => (
                <Link
                  key={bundle.id}
                  href={`/bundle/${bundle.slug}`}
                  style={{ textDecoration: 'none', background: 'var(--black)', color: 'var(--cream)', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', overflow: 'hidden' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {bundle.bundle_image_url ? (
                    <img src={bundle.bundle_image_url} alt={bundle.name} style={{ width: '100%', aspectRatio: '2/1', objectFit: 'cover', display: 'block' }} />
                  ) : (bundle.product_images ?? []).length > 0 ? (
                    <div style={{ display: 'flex', width: '100%', aspectRatio: '2/1', overflow: 'hidden' }}>
                      {(bundle.product_images as string[]).map((url: string, i: number) => (
                        <img key={i} src={url} alt="" style={{ flex: 1, width: 0, height: '100%', objectFit: 'cover', display: 'block' }} />
                      ))}
                    </div>
                  ) : null}
                  <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, minHeight: 140 }}>
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 8 }}>{bundle.name.toUpperCase()}</h3>
                    </div>
                    <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18 }}>€{Number(bundle.price).toFixed(2)}</span>
                        {bundle.original_price && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, textDecoration: 'line-through', opacity: 0.5 }}>€{Number(bundle.original_price).toFixed(2)}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, background: 'var(--accent)', color: '#fff', padding: '2px 6px', borderRadius: 999 }}>
                              -{Math.round((1 - bundle.price / bundle.original_price) * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', background: 'var(--accent)', color: '#fff', padding: '11px 18px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        view bundle <span style={{ fontSize: 14 }}>↗</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 48, gap: 16 }}>
            <div style={{ width: 60, height: 1, background: 'var(--line)' }} />
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
          <div style={{ width: 60, height: 1, background: 'var(--line)' }} />
        </div>
        </section>
      )}
    </>
  );
}
