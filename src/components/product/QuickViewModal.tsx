'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import ProductCrop from './ProductCrop';
import { useUser } from '@clerk/nextjs';

interface QuickViewModalProps {
  product: any;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const variants = product.variants || [];
  const [selColor, setSelColor] = useState(variants[0]?.color_name || 'Default');
  const [selSize, setSelSize] = useState(variants[0]?.size || 'ONE SIZE');
  const [qty, setQty] = useState(1);
  const { addToCart, cart } = useCart();
  const { showToast } = useToast();
  
  const categoryLabel = product.category === 'TOTEBAG' ? 'TOTE BAG' : 'T-SHIRT';
  const currentVariant = variants.find((v: any) => v.size === selSize && v.color_name === selColor) || variants[0];
  const currentPrice = currentVariant?.price || 0;
  const currentOriginalPrice = currentVariant?.original_price || null;
  const currentStock = Number(currentVariant?.stock ?? 0);
  const quantityInCart = currentVariant
    ? cart.find((item) => item.variantId === currentVariant.id)?.qty ?? 0
    : 0;
  const remainingStock = Math.max(0, currentStock - quantityInCart);
  const isSoldOut = currentStock <= 0;
  const cannotAddMore = remainingStock <= 0;
  const isAtStockLimit = qty >= remainingStock;

  useEffect(() => {
    if (remainingStock > 0) {
      setQty((currentQty) => Math.min(Math.max(1, currentQty), remainingStock));
    }
  }, [remainingStock]);

  const handleAdd = async () => {
    if (!currentVariant || isSoldOut || cannotAddMore) {
      showToast(isSoldOut ? 'This item is sold out.' : 'You already have all available stock in your cart.');
      return;
    }

    try {
      await addToCart(product, currentVariant, qty);
      showToast(`✦ added · ${product.name}`);
      setQty(1);
      onClose();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to add item');
    }
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
            <ProductCrop src={product.primary_image ?? 'editorial-color.jpeg'} height={560} scale={2.4} />
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
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 38, color: 'var(--black)' }}>€{Number(currentPrice).toFixed(2)}</span>
              {currentOriginalPrice && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--muted)', textDecoration: 'line-through' }}>€{Number(currentOriginalPrice).toFixed(2)}</span>}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: isSoldOut ? '#b91c1c' : '#1F8A5B', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              {isSoldOut ? 'sold out' : `${currentStock} in stock`}
            </div>
            {!isSoldOut && quantityInCart > 0 && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: cannotAddMore ? '#b91c1c' : 'var(--muted)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                {cannotAddMore ? 'max in cart' : `${remainingStock} left to add`}
              </div>
            )}

            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 8 }}>warna · {selColor}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[...new Set(variants.map((v: any) => v.color_name))].map((c: any) => (
                  <button key={c} onClick={() => setSelColor(c)} style={{ width: 28, height: 28, borderRadius: '50%', background: variants.find((v:any) => v.color_name === c)?.color_hex, border: 'none', outline: selColor === c ? '2px solid var(--orange)' : '1px solid var(--line)', outlineOffset: 2, cursor: 'pointer' }} />
                ))}
              </div>
            </div>

            {variants[0]?.size !== 'ONE SIZE' && (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 8 }}>size</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[...new Set(variants.map((v: any) => v.size))].map(s => (
                    <button key={s as string} onClick={() => setSelSize(s as string)} style={{ minWidth: 42, padding: '8px 12px', border: '1px solid', borderColor: selSize === s ? 'var(--black)' : 'var(--line)', background: selSize === s ? 'var(--black)' : 'transparent', color: selSize === s ? 'var(--cream)' : 'var(--ink)', fontFamily: 'var(--font-mono)', fontSize: 12, cursor: 'pointer', transition: 'all 0.15s' }}>{s as string}</button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.22em', textTransform: 'uppercase' }}>qty</div>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: 999, overflow: 'hidden' }}>
                <button disabled={isSoldOut} onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 38, height: 38, background: 'none', border: 'none', cursor: isSoldOut ? 'not-allowed' : 'pointer', fontSize: 16, opacity: isSoldOut ? 0.45 : 1 }}>−</button>
                <span style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 14 }}>{qty}</span>
                <button disabled={isSoldOut || cannotAddMore || isAtStockLimit} onClick={() => setQty(q => Math.min(remainingStock, q + 1))} style={{ width: 38, height: 38, background: 'none', border: 'none', cursor: isSoldOut || cannotAddMore || isAtStockLimit ? 'not-allowed' : 'pointer', fontSize: 16, color: isSoldOut || cannotAddMore || isAtStockLimit ? 'var(--muted)' : 'var(--black)', opacity: isSoldOut || cannotAddMore || isAtStockLimit ? 0.45 : 1 }}>+</button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
              <AddBtn price={Number(currentPrice) * qty} onClick={handleAdd} disabled={isSoldOut || cannotAddMore || !currentVariant} soldOut={isSoldOut} />
              <Link
                href={`/product/${product.slug}`}
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

function AddBtn({
  price,
  onClick,
  disabled = false,
  soldOut = false,
}: {
  price: number;
  onClick: () => void;
  disabled?: boolean;
  soldOut?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const { user } = useUser();
  const role = user?.publicMetadata?.role;
  const isAdmin = role === 'ADMIN_IT' || role === 'ADMIN_KK';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: disabled ? 'var(--muted)' : hovered ? 'var(--orange)' : 'var(--black)', color: disabled ? 'var(--cream)' : hovered ? 'var(--black)' : 'var(--cream)', border: 'none', padding: '15px', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', cursor: disabled ? 'not-allowed' : 'pointer', borderRadius: 999, transition: 'background 0.2s, color 0.2s' }}
    >
      {disabled ? (soldOut ? 'sold out' : 'max in cart') : `add to cart — €${price.toFixed(2)} ↗`}
    </button>
  );
}
