'use client';

import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { addBundleToCartAction } from "@/lib/actions/cart";
import { Product, ProductVariant, Bundle, Color, FitType } from "@/types";
import { useState, useMemo, useEffect } from "react";
import ProductCrop from "@/components/product/ProductCrop";
import { useUser } from "@clerk/nextjs";

interface BundleWithProducts extends Bundle {
  products: (Product & { variants: ProductVariant[] })[];
}

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'ONE SIZE'];

export default function BundleDetailClient({ bundle }: { bundle: BundleWithProducts }) {
  const { user } = useUser(); 
  const role = user?.publicMetadata?.role;
  const isAdmin = role === 'ADMIN_IT' || role === 'ADMIN_KK';

  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const { refreshCart } = useCart();
  const { showToast } = useToast();

  const handleVariantChange = (productId: string, variantId: string | null) => {
    setSelectedVariants(prev => {
      const next = { ...prev };
      if (variantId) {
        next[productId] = variantId;
      } else {
        delete next[productId];
      }
      return next;
    });
  };

  const isComplete = bundle.products.every(p => selectedVariants[p.id]);

  const handleAdd = async () => {
    if (isComplete) {
      const variantIds = Object.values(selectedVariants);
      await addBundleToCartAction(bundle.id, variantIds);
      await refreshCart();
      showToast(`✦ added bundle · ${bundle.name}`);
    }
  }

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '48px 28px 80px' }}>
      <div style={{ marginBottom: 60 }}>
        <div style={{ 
          fontFamily: 'var(--font-mono)', 
          fontSize: 10, 
          color: 'var(--accent-deep)', 
          letterSpacing: '0.3em', 
          textTransform: 'uppercase', 
          marginBottom: 14 
        }}>
          —— exclusive bundle ——
        </div>
        <h1 style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: 'clamp(56px, 8vw, 110px)', 
          color: 'var(--black)', 
          lineHeight: 0.85,
          letterSpacing: '-0.01em'
        }}>
          {bundle.name.toUpperCase()}<span style={{ color: 'var(--accent)' }}>.</span>
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'baseline', marginTop: 24 }}>
          <p style={{ 
            fontFamily: 'var(--font-serif)', 
            fontStyle: 'italic', 
            fontSize: 24, 
            color: 'var(--ink)',
            maxWidth: 600
          }}>
            {bundle.desc}
          </p>
          <div style={{ display: 'flex', gap: 20, alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 54, color: 'var(--black)' }}>
              €{Number(bundle.price).toFixed(2)}
            </span>
            {bundle.original_price && (
              <span style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: 18, 
                color: 'var(--muted)', 
                textDecoration: 'line-through' 
              }}>
                €{Number(bundle.original_price).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 24 
      }}>
        {bundle.products.map(product => (
          <BundleProductCard 
            key={product.id} 
            product={product} 
            onVariantSelect={(vid) => handleVariantChange(product.id, vid)}
          />
        ))}
      </div>

      <div style={{
        marginTop: 48,
        paddingTop: 40,
        borderTop: '1px solid var(--line)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <button
          onClick={handleAdd}
          disabled={!isComplete || isAdmin}
          style={{
            width: '100%',
            maxWidth: 640,
            padding: '18px 32px',
            background: isComplete ? 'var(--accent)' : 'var(--line)',
            color: isComplete ? '#fff' : 'var(--muted)',
            border: 'none',
            borderRadius: 999,
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            letterSpacing: '0.22em',
            cursor: isComplete ? 'pointer' : 'not-allowed',
            textTransform: 'uppercase',
            fontWeight: 700,
            transition: 'all 0.3s',
          }}
        >
          {isComplete
            ? `Add bundle to cart — €${Number(bundle.price).toFixed(2)} ↗`
            : 'Select all variants to continue'
          }
        </button>
      </div>
    </div>
  )
}

function BundleProductCard({ 
  product, 
  onVariantSelect 
}: { 
  product: Product & { variants: ProductVariant[] }, 
  onVariantSelect: (variantId: string | null) => void 
}) {
  const availableFits = useMemo(() => {
    const rawFits = Array.from(new Set(product.variants.map((v) => v.fit_type as FitType)));
    const preferredOrder = ['REGULAR', 'OVERSIZED'] as FitType[];
    return rawFits.sort((a, b) => {
      const idxA = preferredOrder.indexOf(a);
      const idxB = preferredOrder.indexOf(b);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  }, [product.variants]);

  const [selFit, setSelFit] = useState<FitType>(availableFits[0]);

  useEffect(() => {
    if (availableFits.length > 0 && !availableFits.includes(selFit)) {
      setSelFit(availableFits[0]);
    }
  }, [availableFits, selFit]);

  const currentFitVariants = useMemo(() => {
    return product.variants.filter((v) => v.fit_type === selFit);
  }, [product.variants, selFit]);

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
      .sort((a, b) => {
        const indexA = SIZE_ORDER.indexOf(a.toUpperCase());
        const indexB = SIZE_ORDER.indexOf(b.toUpperCase());
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
  }, [currentFitVariants, selColor]);

  const [selSize, setSelSize] = useState<string | null>(null);

  const getStockForSize = (size: string) => {
    const v = currentFitVariants.find(v => v.color_name === selColor?.name && v.size.trim() === size);
    return v?.stock ?? 0;
  };

  useEffect(() => {
    setSelSize(null);
    onVariantSelect(null);
  }, [selFit, selColor]);

  const currentVariant = useMemo(() => {
    if (!selColor || !selSize) return null;
    return currentFitVariants.find(
      (v) => v.color_name === selColor.name && v.size.trim() === selSize
    ) || null;
  }, [currentFitVariants, selColor, selSize]);

  useEffect(() => {
    if (currentVariant) {
      onVariantSelect(currentVariant.id);
    }
  }, [currentVariant]);

  const primaryImage = product.primary_image || product.images?.[0]?.url || 'editorial-color.jpeg';

  return (
    <div style={{ 
      background: 'var(--cream-2)', 
      border: '1px solid var(--line)',
      display: 'flex',
      flexDirection: 'row'
    }}>
      <div style={{ width: '50%', height: '100%', flexShrink: 0, overflow: 'hidden', background: 'var(--cream-2)', aspectRatio: '4/5' }}>
        <ProductCrop src={primaryImage} scale={2.4} />
      </div>
      
      <div style={{ padding: '18px 28px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          fontFamily: 'var(--font-mono)', 
          fontSize: 9, 
          color: 'var(--muted)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.2em',
          marginBottom: 6 
        }}>
          {product.category}
        </div>
        <h3 style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: 22, 
          color: 'var(--black)',
          lineHeight: 1.1,
          marginBottom: 6
        }}>
          {product.name.toUpperCase()}
        </h3>
        {product.subtitle && (
          <div style={{ 
            fontFamily: 'var(--font-serif)', 
            fontStyle: 'italic', 
            fontSize: 14, 
            color: 'var(--muted)',
            marginBottom: 20
          }}>
            {product.subtitle}
          </div>
        )}
        
        <div style={{ marginTop: 'auto' }}>
          {availableFits.length > 1 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: 9, 
                color: 'var(--muted)', 
                textTransform: 'uppercase', 
                marginBottom: 8 
              }}>
                fit: <span style={{ color: 'var(--black)' }}>{selFit}</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {availableFits.map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelFit(f)}
                    style={{
                      padding: '6px 10px',
                      border: '1px solid',
                      borderColor: selFit === f ? 'var(--black)' : 'var(--line)',
                      background: selFit === f ? 'var(--black)' : 'transparent',
                      color: selFit === f ? 'var(--cream)' : 'var(--ink)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 18 }}>
            <div style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: 9, 
              color: 'var(--muted)', 
              textTransform: 'uppercase', 
              marginBottom: 8 
            }}>
              color: <span style={{ color: 'var(--black)' }}>{selColor?.name}</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {uniqueColors.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setSelColor(c)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: c.hex,
                    border: 'none',
                    outline: selColor?.hex === c.hex ? '2px solid var(--accent)' : '1px solid var(--line)',
                    outlineOffset: 2,
                    cursor: 'pointer',
                    transition: 'transform 0.15s',
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <div style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: 9, 
              color: 'var(--muted)', 
              textTransform: 'uppercase', 
              marginBottom: 8 
            }}>
              size: <span style={{ color: 'var(--black)' }}>{selSize || 'choose size'}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {availableSizes.map((s) => {
                const stock = getStockForSize(s);
                const isSoldOut = stock <= 0;
                return (
                  <button
                    key={s}
                    disabled={isSoldOut}
                    onClick={() => setSelSize(s)}
                    style={{
                      minWidth: 44,
                      padding: '8px 10px',
                      border: '1px solid',
                      borderColor: isSoldOut ? 'var(--line)' : (selSize === s ? 'var(--black)' : 'var(--line)'),
                      background: selSize === s ? 'var(--black)' : 'transparent',
                      color: isSoldOut ? 'var(--muted)' : (selSize === s ? 'var(--cream)' : 'var(--ink)'),
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      cursor: isSoldOut ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s',
                      fontWeight: 600,
                      opacity: isSoldOut ? 0.4 : 1
                    }}
                  >
                    {s} {isSoldOut && ' (sold out)'}
                  </button>
                );
              })}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: selSize && getStockForSize(selSize) > 0 ? '#1F8A5B' : (selSize ? '#b91c1c' : 'var(--muted)'),
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginTop: 4
            }}>
              {selSize ? (getStockForSize(selSize) > 0 ? `${getStockForSize(selSize)} in stock` : 'sold out') : 'select size for stock'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
