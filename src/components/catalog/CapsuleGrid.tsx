'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProductCrop from '@/components/product/ProductCrop';

interface CapsuleGridProps {
  products: any[];
  onQuickView: (product: any) => void;
}

export default function CapsuleGrid({ products, onQuickView }: CapsuleGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section id="catalog" style={{ background: 'var(--cream)', padding: '60px 28px 40px' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <div style={{ textAlign: 'left', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.3em', textTransform: 'uppercase',marginBottom: 8 }}>
            —— essentials ——
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: 'var(--black)' }}>
            INDIVIDUAL PIECES<span style={{ color: 'var(--accent)' }}>.</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 22 }}>
          {products.map((product, i) => {
            const isHovered = hoveredId === product.id;
            const categoryLabel = product.category === 'TOTEBAG' ? 'TOTE BAG' : 'T-SHIRT';
            
            const prices = product.variants?.map((v: any) => Number(v.price)) || [0];
            const minPrice = Math.min(...prices);
            const hasPriceRange = new Set(prices).size > 1;
            
            const originalPrices = product.variants?.map((v: any) => Number(v.original_price)).filter((p: number) => p > 0) || [];
            const minOriginalPrice = originalPrices.length > 0 ? Math.min(...originalPrices) : null;

            const isSoldOut = !product.variants?.some((variant: any) => Number(variant.stock) > 0);

            return (
              <div
                key={product.id}
                onMouseEnter={() => setHoveredId(product.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ cursor: 'pointer', position: 'relative', animation: `fadeUp 0.5s ${i * 0.06}s ease both`, opacity: 0, animationFillMode: 'forwards' }}
              >
                <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--cream-2)' }}>
                    <ProductCrop src={product.primary_image} height={340} scale={2.4} />
                    {product.tag && (
                      <div style={{ position: 'absolute', top: 10, left: 10, background: 'var(--cream)', padding: '4px 9px', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent-deep)', border: '1px solid var(--accent-deep)' }}>
                        {product.tag}
                      </div>
                    )}
                    {isSoldOut && (
                      <div style={{ position: 'absolute', top: 10, right: 10, background: 'var(--black)', color: 'var(--cream)', padding: '5px 10px', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700 }}>
                        sold out
                      </div>
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(14,14,14,0.55)', backdropFilter: 'blur(2px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: isHovered ? 1 : 0, transition: 'opacity 0.25s' }}>
                      <span style={{ background: 'var(--accent)', color: 'var(--black)', padding: '10px 18px', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                        view details <span style={{ fontSize: 13 }}>↗</span>
                      </span>
                      <button
                        onClick={e => { e.preventDefault(); e.stopPropagation(); onQuickView(product); }}
                        style={{ background: 'transparent', color: 'var(--cream)', padding: '8px 16px', borderRadius: 999, border: '1px solid var(--cream)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase' }}
                      >
                        quick view
                      </button>
                    </div>
                  </div>

                  <div style={{ padding: '14px 4px 4px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 5 }}>
                      {categoryLabel}
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--black)', letterSpacing: '0.03em', lineHeight: 1.1 }}>
                      {product.name.toUpperCase()}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink)', marginTop: 6, fontWeight: 500 }}>
                      {hasPriceRange ? 'from ' : ''}€{Number(minPrice).toFixed(2)}
                      {minOriginalPrice && (
                        <span style={{ color: 'var(--muted)', textDecoration: 'line-through', marginLeft: 8, fontSize: 11 }}>€{Number(minOriginalPrice).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 48, gap: 16 }}>
          <div style={{ width: 60, height: 1, background: 'var(--line)' }} />
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
          <div style={{ width: 60, height: 1, background: 'var(--line)' }} />
        </div>
      </div>
    </section>
  );
}
