'use client';

import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { Product, ProductVariant, Bundle } from "@/types";
import { useState } from "react";
import ProductCrop from "@/components/product/ProductCrop";

interface BundleWithProducts extends Bundle {
  products: (Product & { variants: ProductVariant[] })[];
}

export default function BundleDetailClient({ bundle }: { bundle: BundleWithProducts }) {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleSelect = (productId: string, variantId: string) => {
    setSelectedVariants(prev => ({ ...prev, [productId]: variantId }));
  }

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
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: 24 
      }}>
        {bundle.products.map(product => {
          const primaryImage = product.images?.find(img => img.is_primary)?.url || product.images?.[0]?.url || 'editorial-color.jpeg';
          
          return (
            <div key={product.id} style={{ 
              background: 'var(--cream-2)', 
              border: '1px solid var(--line)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ overflow: 'hidden' }}>
                <ProductCrop src={primaryImage} height={400} scale={2.5} />
              </div>
              
              <div style={{ padding: 32, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: 10, 
                  color: 'var(--muted)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.2em',
                  marginBottom: 8 
                }}>
                  {product.category}
                </div>
                <h3 style={{ 
                  fontFamily: 'var(--font-display)', 
                  fontSize: 28, 
                  marginBottom: 20, 
                  color: 'var(--black)' 
                }}>
                  {product.name.toUpperCase()}
                </h3>
                
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: 9, 
                    color: 'var(--muted)', 
                    textTransform: 'uppercase', 
                    marginBottom: 12 
                  }}>
                    pilih varian:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {product.variants.map(v => {
                      const isSelected = selectedVariants[product.id] === v.id;
                      const isOutOfStock = v.stock === 0;

                      return (
                        <button 
                          key={v.id}
                          disabled={isOutOfStock}
                          onClick={() => handleSelect(product.id, v.id)}
                          style={{
                            padding: '10px 14px',
                            border: '1px solid',
                            borderColor: isSelected ? 'var(--black)' : 'var(--line)',
                            background: isSelected ? 'var(--black)' : 'transparent',
                            color: isSelected ? 'var(--cream)' : 'var(--ink)',
                            opacity: isOutOfStock ? 0.3 : 1,
                            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                            fontFamily: 'var(--font-mono)',
                            fontSize: 11,
                            fontWeight: 600,
                            transition: 'all 0.15s'
                          }}
                        >
                          {v.color_name} · {v.size} {isOutOfStock && '(OUT)'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add to Cart Bar - Natural Flow */}
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
