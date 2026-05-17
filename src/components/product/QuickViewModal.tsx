'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/data/mockup/products';
import { getUniqueColors, getSizesById, getSizesForColor, getVariant, getProductBasePrice, getProductOriginalPrice } from '@/data/mockup/variants';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import ProductCrop from './ProductCrop';

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const [selColor, setSelColor] = useState(getUniqueColors(product.id)[0]);
  const [selSize, setSelSize] = useState(getSizesForColor(product.id, selColor.name)[0].size);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const { showToast } = useToast();
  
  const categoryLabel = product.category === 'TOTEBAG' ? 'TOTE BAG' : 'T-SHIRT';
  const currentVariant = getVariant(product.id, selSize, selColor.name);
  const currentPrice = currentVariant?.price ?? getProductBasePrice(product.id);
  const currentOriginalPrice = currentVariant?.original_price ?? getProductOriginalPrice(product.id);

  const handleAdd = () => {
    addToCart(product, qty, selColor, selSize);
    showToast(`✦ added · ${product.name}`);
    onClose();
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(14,14,14,0.6)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18, animation: 'fadeIn 0.18s ease' }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--cream)', maxWidth: 980, width: '100%', maxHeight: '90vh', overflow: 'auto', animation: 'scaleIn 0.22s ease' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr' }}>
          <div style={{ background: 'var(--cream-2)', position: 'relative', minHeight: 520 }}>
            <ProductCrop src={product.primary_image} height={560} scale={2.4} />
            {product.tag && <div style={{ position: 'absolute', top: 18, right: 18, background: 'var(--orange)', color: 'var(--black)', padding: '5px 12px', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase' }}>{product.tag}</div>}
          </div>

          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative' }}>
            <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: '50%', background: 'transparent', border: '1px solid var(--line)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>

            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 8 }}>{categoryLabel} · {product.subtitle}</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 42, color: 'var(--black)', letterSpacing: '0.02em', lineHeight: 1 }}>{product.name.toUpperCase()}</h2>
            </div>

            <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.7 }}>{product.desc}</p>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, paddingBottom: 14, borderBottom: '1px solid var(--line)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 38, color: 'var(--black)' }}>€{currentPrice.toFixed(2)}</span>
              {currentOriginalPrice && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--muted)', textDecoration: 'line-through' }}>€{currentOriginalPrice.toFixed(2)}</span>}
            </div>

            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 8 }}>warna · {selColor.name}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {getUniqueColors(product.id).map(c => (
                  <button key={c.hex} onClick={() => setSelColor(c)} style={{ width: 28, height: 28, borderRadius: '50%', background: c.hex, border: 'none', outline: selColor.hex === c.hex ? '2px solid var(--orange)' : '1px solid var(--line)', outlineOffset: 2, cursor: 'pointer' }} />
                ))}
              </div>
            </div>

            {getSizesById(product.id)[0] !== 'ONE SIZE' && (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 8 }}>size</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {getSizesById(product.id).map(s => (
                    <button key={s} onClick={() => setSelSize(s)} style={{ minWidth: 42, padding: '8px 12px', border: '1px solid', borderColor: selSize === s ? 'var(--black)' : 'var(--line)', background: selSize === s ? 'var(--black)' : 'transparent', color: selSize === s ? 'var(--cream)' : 'var(--ink)', fontFamily: 'var(--font-mono)', fontSize: 12, cursor: 'pointer', transition: 'all 0.15s' }}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.22em', textTransform: 'uppercase' }}>qty</div>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: 999, overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 38, height: 38, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>−</button>
                <span style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 14 }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} style={{ width: 38, height: 38, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>+</button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
              <AddBtn price={currentPrice * qty} onClick={handleAdd} />
              <Link
                href={`/product/${product.id}`}
                onClick={onClose}
                style={{ display: 'block', textAlign: 'center', textDecoration: 'none', background: 'transparent', color: 'var(--ink)', border: '1px solid var(--line)', padding: '12px', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', borderRadius: 999 }}
              >
                view full details →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddBtn({ price, onClick }: { price: number; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? 'var(--orange)' : 'var(--black)', color: hovered ? 'var(--black)' : 'var(--cream)', border: 'none', padding: '15px', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 999, transition: 'background 0.2s, color 0.2s' }}
    >
      add to cart — €{price.toFixed(2)} ↗
    </button>
  );
}
