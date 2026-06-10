'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import ProductCrop from './ProductCrop';
import { useUser } from '@clerk/nextjs';

import { Product, ProductVariant, Color, FitType } from '@/types';

interface QuickViewModalProps {
  product: Product & { variants: ProductVariant[] };
  onClose: () => void;
}

const SIZE_ORDER = ['S', 'M', 'L', 'XL', 'XXL', 'ONE SIZE'];

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const variants = product.variants || [];

  // Derive unique fits from variants, forced order, but inclusive
  const availableFits = useMemo(() => {
    const rawFits = Array.from(new Set(variants.map((v) => v.fit_type as FitType)));
    const preferredOrder = ['REGULAR', 'OVERSIZED'] as FitType[];
    return rawFits.sort((a, b) => {
      const idxA = preferredOrder.indexOf(a);
      const idxB = preferredOrder.indexOf(b);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  }, [variants]);

  const [selFit, setSelFit] = useState<FitType>(availableFits[0]);

  useEffect(() => {
    if (availableFits.length > 0 && !availableFits.includes(selFit)) {
      setSelFit(availableFits[0]);
    }
  }, [availableFits, selFit]);

  // Filter variants by selected fit
  const currentFitVariants = useMemo(() => {
    return variants.filter((v) => v.fit_type === selFit);
  }, [variants, selFit]);

  // Derive unique colors from current fit variants
  const uniqueColors = useMemo(() => {
    const map = new Map<string, Color>();
    currentFitVariants.forEach((v) => {
      if (!map.has(v.color_name)) {
        map.set(v.color_name, { name: v.color_name, hex: v.color_hex });
      }
    });
    return Array.from(map.values());
  }, [currentFitVariants]);

  const [selColor, setSelColor] = useState<Color | null>(uniqueColors[0] ?? null);

  useEffect(() => {
    if (uniqueColors.length > 0) {
      const exists = uniqueColors.find((c) => c.name === selColor?.name);
      if (!exists) {
        setSelColor(uniqueColors[0]);
      }
    }
  }, [uniqueColors, selColor]);

  const availableSizes = useMemo(() => {
    if (!selColor) return [];
    return currentFitVariants
      .filter((v) => v.color_name === selColor.name)
      .map((v) => v.size.trim())
      .sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b));
  }, [currentFitVariants, selColor]);

  const [selSize, setSelSize] = useState<string | null>(availableSizes[0] ?? null);

  useEffect(() => {
    if (availableSizes.length > 0) {
      if (!selSize || !availableSizes.includes(selSize)) {
        setSelSize(availableSizes[0]);
      }
    }
  }, [availableSizes, selSize]);

  const [qty, setQty] = useState(1);
  const { addToCart, cart } = useCart();
  const { showToast } = useToast();
  
  const categoryLabel = product.category === 'TOTEBAG' ? 'TOTE BAG' : 'T-SHIRT';
  
  const currentVariant = useMemo(() => {
    if (!selColor || !selSize) return null;
    return currentFitVariants.find(
      (v) => v.color_name === selColor.name && v.size.trim() === selSize
    ) || null;
  }, [currentFitVariants, selColor, selSize]);

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
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr' }}>
          <div style={{ background: 'var(--cream-2)', position: 'relative', minHeight: 520 }}>
            <ProductCrop src={product.primary_image ?? 'editorial-color.jpeg'} height={560} scale={2.4} />
            {product.tag && <div style={{ position: 'absolute', top: 18, right: 18, background: 'var(--accent)', color: 'var(--black)', padding: '5px 12px', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase' }}>{product.tag}</div>}
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
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: isSoldOut ? '#b91c1c' : '#1F8A5B', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                {isSoldOut ? 'sold out' : `${currentStock} in stock`}
              </div>
              {!isSoldOut && quantityInCart > 0 && (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: cannotAddMore ? '#b91c1c' : 'var(--muted)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                  {cannotAddMore ? 'max' : `${remainingStock} left`}
                </div>
              )}
            </div>

            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 8 }}>warna · {selColor?.name}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {uniqueColors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelColor(c)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: c.hex,
                      border: 'none',
                      outline: selColor?.name === c.name ? '2px solid var(--accent)' : '1px solid var(--line)',
                      outlineOffset: 2,
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
            </div>

            {availableFits.length > 1 && (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 8 }}>fit type · {selFit}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {availableFits.map((f) => (
                    <button
                      key={f}
                      onClick={() => setSelFit(f)}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid',
                        borderColor: selFit === f ? 'var(--black)' : 'var(--line)',
                        background: selFit === f ? 'var(--black)' : 'transparent',
                        color: selFit === f ? 'var(--cream)' : 'var(--ink)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {availableSizes[0] !== 'ONE SIZE' && (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 8 }}>size</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {availableSizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelSize(s)}
                      style={{
                        minWidth: 42,
                        padding: '8px 12px',
                        border: '1px solid',
                        borderColor: selSize === s ? 'var(--black)' : 'var(--line)',
                        background: selSize === s ? 'var(--black)' : 'transparent',
                        color: selSize === s ? 'var(--cream)' : 'var(--ink)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        fontWeight: 600,
                      }}
                    >
                      {s}
                    </button>
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
      disabled={disabled || isAdmin}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: (disabled || isAdmin) ? 'var(--muted)' : hovered ? 'var(--accent)' : 'var(--black)', color: (disabled || isAdmin) ? 'var(--cream)' : hovered ? 'var(--black)' : 'var(--cream)', border: 'none', padding: '15px', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', cursor: (disabled || isAdmin) ? 'not-allowed' : 'pointer', borderRadius: 999, transition: 'background 0.2s, color 0.2s' }}
    >
      {isAdmin ? 'ADMIN MODE' : (disabled ? (soldOut ? 'sold out' : 'max in cart') : `add to cart — €${price.toFixed(2)} ↗`)}
    </button>
  );
}
