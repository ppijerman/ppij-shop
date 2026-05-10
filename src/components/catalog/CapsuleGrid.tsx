'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Product, Color } from '@/types';
import { useTweaks } from '@/context/TweaksContext';
import ProductCrop from '@/components/product/ProductCrop';

function getImgSrc(primaryImg: string) {
  return primaryImg === 'tshirt_grid' ? '/assets/v4/tshirt-grid.jpeg' : '/assets/v4/totebag-grid.jpeg';
}

interface CapsuleGridProps {
  products: Product[];
  onQuickView: (product: Product) => void;
}

export default function CapsuleGrid({ products, onQuickView }: CapsuleGridProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedColors, setSelectedColors] = useState<Record<number, Color>>({});
  const { tweaks } = useTweaks();

  return (
    <section id="catalog" style={{ background: 'var(--cream)', padding: '60px 28px 40px' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 12 }}>—— shop the drop ——</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 6.5vw, 96px)', letterSpacing: '0.02em', color: 'var(--black)', lineHeight: 0.95 }}>
            THE PPI CAPSULE
          </h2>
          <div style={{ fontFamily: 'var(--font-script)', fontSize: 38, color: 'var(--orange)', marginTop: -12 }}>vol. 01</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: tweaks.gridGap }}>
          {products.map((product, i) => {
            const selColor = selectedColors[product.id] ?? product.colors[0];
            const isHovered = hoveredId === product.id;
            const imgSrc = getImgSrc(product.primaryImg);

            return (
              <div
                key={product.id}
                onMouseEnter={() => setHoveredId(product.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ cursor: 'pointer', position: 'relative', animation: `fadeUp 0.5s ${i * 0.06}s ease both`, opacity: 0, animationFillMode: 'forwards' }}
              >
                <Link href={`/product/${product.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--cream-2)' }}>
                    <ProductCrop src={imgSrc} pos={product.featurePos} height={340} scale={2.4} />
                    {tweaks.showBadges && product.tag && (
                      <div style={{ position: 'absolute', top: 10, left: 10, background: 'var(--cream)', padding: '4px 9px', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--orange-deep)', border: '1px solid var(--orange-deep)' }}>
                        {product.tag}
                      </div>
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(14,14,14,0.55)', backdropFilter: 'blur(2px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: isHovered ? 1 : 0, transition: 'opacity 0.25s' }}>
                      <span style={{ background: 'var(--orange)', color: 'var(--black)', padding: '10px 18px', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
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
                      No. {product.no} · {product.category}
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--black)', letterSpacing: '0.03em', lineHeight: 1.1 }}>
                      {product.name.toUpperCase()}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink)', marginTop: 6, fontWeight: 500 }}>
                      €{product.price.toFixed(2)}
                      {product.originalPrice && (
                        <span style={{ color: 'var(--muted)', textDecoration: 'line-through', marginLeft: 8, fontSize: 11 }}>€{product.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 10 }}>
                      {product.sizes.map(s => (
                        <span key={s} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                </Link>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8, paddingBottom: 4 }}>
                  {product.colors.map(c => (
                    <button
                      key={c.hex}
                      onClick={() => setSelectedColors(s => ({ ...s, [product.id]: c }))}
                      style={{ width: 12, height: 12, borderRadius: '50%', background: c.hex, border: 'none', outline: selColor.hex === c.hex ? '1.5px solid var(--black)' : '1px solid var(--line)', outlineOffset: 2, cursor: 'pointer', padding: 0, transition: 'transform 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.3)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 48, gap: 16 }}>
          <div style={{ width: 60, height: 1, background: 'var(--line)' }} />
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--orange)' }} />
          <div style={{ width: 60, height: 1, background: 'var(--line)' }} />
        </div>
      </div>
    </section>
  );
}
