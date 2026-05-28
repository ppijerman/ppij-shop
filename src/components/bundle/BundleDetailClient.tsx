'use client';

import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { Product, ProductVariant, Bundle } from "@/types";
import { useState } from "react";

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
      showToast(`+ added bundle · ${bundle.name} `)
    }
  }
  return (
    <div style={{ maxWidth: 1200, margin: '12px auto', padding: '0 28px'}}>
      <h1 style={{ fontFamily: 'var(--font-display', fontSize: 64  }}>{bundle.name.toUpperCase()}</h1>
      <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 24, marginBottom: 20 }}>
        {bundle.desc}
      </p>

      <div>
        <span style={{ display: 'flex', gap: 20, alignItems: 'baseline', marginBottom: 40 }}>€{Number(bundle.price).toFixed(2)}</span>
        {bundle.original_price && (
          <span style={{ textDecoration: 'line-through', color: 'var(--muted)', fontSize: 20  }}>
            €{Number(bundle.original_price).toFixed(2)}
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40 }}>
        {bundle.products.map(product => (
          <div key={product.id} style={{ border: '1px solid var(--line)', padding: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 12 }}>{product.name}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {product.variants.map(v => (
                <button 
                  key={v.id}
                  disabled={v.stock === 0}
                  onClick={() => handleSelect(product.id, v.id)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid',
                    borderColor: selectedVariants[product.id] === v.id ? 'var(--black)' : 'var(--lline)',
                    background: selectedVariants[product.id] == v.id ? 'var(--cream)' : 'transparent',
                    color: selectedVariants[product.id] === v.id ? 'var(--cream)' : 'var(--ink)',
                    opacity: v.stock === 0? 0.4 : 1,
                    cursor: v.stock === 0 ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12
                  }}
                >
                  {v.color_name} - {v.size} {v.stock === 0 && '(OUT)'}
                </button>
              ))}
            </div>

            <button
              onClick={handleAdd}
              disabled={!isComplete}
              style={{
                marginTop: 60,
                width: '100%',
                padding: '24px',
                background: isComplete ? 'var(--black)' : 'var(--line)',
                color: 'var(--cream)',
                border: 'none',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.2em',
                cursor: isComplete ? 'pointer' : 'not-allowed',
                textTransform: 'uppercase'
              }}
            >
              {isComplete ? `Add bundle to Cart - €${Number(bundle.price).toFixed(2)}` : 'Select all variants to continue'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}