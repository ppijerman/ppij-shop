'use client';

import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { Product, ProductVariant, Bundle, Color } from "@/types";
import { useState, useMemo, useEffect } from "react";
import ProductCrop from "@/components/product/ProductCrop";

interface BundleWithProducts extends Bundle {
  products: (Product & { variants: ProductVariant[] })[];
}

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'ONE SIZE'];

export default function BundleDetailClient({ bundle }: { bundle: BundleWithProducts }) {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const { addToCart } = useCart();
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

  const handleAdd = () => {
    if (isComplete) {
      addToCart(bundle as any);
      showToast(`✦ added bundle · ${bundle.name}`);
    }
  }

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '120px 28px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 60 }}>
        <div style={{ 
          fontFamily: 'var(--font-mono)', 
          fontSize: 10, 
          color: 'var(--orange-deep)', 
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
          {bundle.name.toUpperCase()}<span style={{ color: 'var(--orange)' }}>.</span>
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

      {/* Product List */}
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

      {/* Add to Cart Bar */}
      <div style={{ 
        marginTop: 60, 
        padding: '60px 40px', 
        background: 'var(--black)', 
        color: 'var(--cream)',
        textAlign: 'center',
        border: '1px solid #222'
      }}>
        <button
          onClick={handleAdd}
          disabled={!isComplete}
          style={{
            width: '100%',
            maxWidth: 800,
            padding: '24px',
            background: isComplete ? 'var(--orange)' : '#333',
            color: isComplete ? 'var(--black)' : '#666',
            border: 'none',
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
            letterSpacing: '0.25em',
            cursor: isComplete ? 'pointer' : 'not-allowed',
            textTransform: 'uppercase',
            fontWeight: 700,
            transition: 'all 0.3s'
          }}
        >
          {isComplete 
            ? `CONFIRM BUNDLE & ADD TO CART — €${Number(bundle.price).toFixed(2)} ↗` 
            : 'SELECT ALL PRODUCT VARIANTS TO UNLOCK'
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
  const uniqueColors = useMemo(() => {
    const map = new Map<string, Color>();
    product.variants.forEach((v) => {
      if (!map.has(v.color_name)) {
        map.set(v.color_name, { name: v.color_name, hex: v.color_hex });
      }
    });
    return Array.from(map.values());
  }, [product.variants]);

  const [selColor, setSelColor] = useState<Color | null>(uniqueColors[0] ?? null);

  const availableSizes = useMemo(() => {
    if (!selColor) return [];
    return product.variants
      .filter((v) => v.color_name === selColor.name && v.stock > 0)
      .map((v) => v.size.trim())
      .sort((a, b) => {
        const indexA = SIZE_ORDER.indexOf(a.toUpperCase());
        const indexB = SIZE_ORDER.indexOf(b.toUpperCase());
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
  }, [product.variants, selColor]);

  const [selSize, setSelSize] = useState<string | null>(null);

  // Reset size when color changes
  useEffect(() => {
    setSelSize(null);
    onVariantSelect(null);
  }, [selColor]);

  const currentVariant = useMemo(() => {
    if (!selColor || !selSize) return null;
    return product.variants.find(
      (v) => v.color_name === selColor.name && v.size.trim() === selSize
    ) || null;
  }, [product.variants, selColor, selSize]);

  useEffect(() => {
    if (currentVariant) {
      onVariantSelect(currentVariant.id);
    }
  }, [currentVariant]);

  const primaryImage = product.images?.find(img => img.is_primary)?.url || product.images?.[0]?.url || 'editorial-color.jpeg';

  return (
    <div style={{ 
      background: 'var(--cream-2)', 
      border: '1px solid var(--line)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ overflow: 'hidden', background: 'var(--cream-2)', aspectRatio: '4/5' }}>
        <img 
          src={primaryImage} 
          alt={product.name}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            display: 'block'
          }} 
        />
      </div>
      
      <div style={{ padding: 28, flex: 1, display: 'flex', flexDirection: 'column' }}>
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
          marginBottom: 20, 
          color: 'var(--black)',
          lineHeight: 1.1
        }}>
          {product.name.toUpperCase()}
        </h3>
        
        <div style={{ marginTop: 'auto' }}>
          {/* Color Selection */}
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
                    outline: selColor?.hex === c.hex ? '2px solid var(--orange)' : '1px solid var(--line)',
                    outlineOffset: 2,
                    cursor: 'pointer',
                    transition: 'transform 0.15s',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Size Selection */}
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
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {availableSizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelSize(s)}
                  style={{
                    minWidth: 44,
                    padding: '8px 10px',
                    border: '1px solid',
                    borderColor: selSize === s ? 'var(--black)' : 'var(--line)',
                    background: selSize === s ? 'var(--black)' : 'transparent',
                    color: selSize === s ? 'var(--cream)' : 'var(--ink)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
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
        </div>
      </div>
    </div>
  );
}
