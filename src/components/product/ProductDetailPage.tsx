'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import ProductCrop from './ProductCrop';
import { Product, ProductImage, ProductVariant, Color, FitType } from '@/types';
import { useUser } from '@clerk/nextjs';

interface ProductDetailPageProps {
  product: Product;
  images: ProductImage[];
  products: Product[];
  variants: ProductVariant[];
}

const TABS = [
  ['description', 'Story Details'],
  ['care', 'Care Instructions'],
] as const;
type Tab = (typeof TABS)[number][0];

const SIZE_ORDER = ['S', 'M', 'L', 'XL', 'XXL', 'ONE SIZE'];

export default function ProductDetailPage({
  product,
  images,
  products,
  variants,
}: ProductDetailPageProps) {
  const { user } = useUser();
  const role = user?.publicMetadata?.role;
  const isAdmin = role === 'ADMIN_IT' || role === 'ADMIN_KK';

  const [showSizeGuide, setShowSizeGuide] = useState(false);

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
  const [activeTab, setActiveTab] = useState<Tab>('description');
  const [activeImg, setActiveImg] = useState(0);
  const { addToCart, cart } = useCart();
  const { showToast } = useToast();

  const currentVariant = useMemo(() => {
    if (!selColor || !selSize) return null;
    return currentFitVariants.find(
      (v) => v.color_name === selColor.name && v.size.trim() === selSize
    ) || null;
  }, [currentFitVariants, selColor, selSize]);

  const currentPrice = currentVariant?.price ?? 0;
  const currentOriginalPrice = currentVariant?.original_price;
  const currentStock = currentVariant?.stock ?? 0;
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

  const handleAddToCart = async () => {
    if (currentVariant && !isSoldOut && !cannotAddMore) {
      try {
        await addToCart(product, currentVariant, qty);
        showToast(`✦ added · ${product.name}`);
        setQty(1);
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to add item');
      }
    }
  };

  const hasValidOriginalPrice = 
    typeof currentOriginalPrice === 'number' && 
    Number.isFinite(currentOriginalPrice) && 
    currentOriginalPrice > 0;
  const related = products.filter((p) => p.id !== product.id).slice(0, 4); 

  if (variants.length === 0) {
    return (
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '120px 28px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 42, color: 'var(--black)' }}>
          {product.name}
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 18, color: 'var(--muted)', marginTop: 20 }}>
          This product is currently unavailable.
        </p>
        <Link href="/catalog" style={{ display: 'inline-block', marginTop: 30, textDecoration: 'underline', color: 'var(--accent-deep)' }}>
          ← Back to Catalog
        </Link>
      </div>
    );
  }

  const careItems: [string, string][] =
    product.category === 'TOTEBAG'
      ? [
          ['Material', 'Heavy canvas 400 gsm'],
          ['Washing', 'Hand wash only, do not wring'],
          ['Drying', 'Air dry, avoid direct sunlight'],
          ['Ironing', 'Medium heat, avoid print area'],
        ]
      : [
          ['Material', 'Cotton combed 30s ringspun, 220 gsm'],
          ['Washing', 'Cold water wash, turn inside out'],
          ['Drying', 'Hang dry inside out, avoid direct sunlight'],
          ['Ironing', 'Medium heat, avoid print area'],
        ];

  return (
    <section style={{ background: 'var(--cream)', paddingBottom: 60 }}>
      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '22px 28px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
        }}
      >
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          home
        </Link>
        <span>/</span>
        <Link
          href="/catalog"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          shop
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--black)' }}>{product.category}</span>
      </div>

      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '22px 28px 0',
          display: 'grid',
          gridTemplateColumns: '1.15fr 1fr',
          gap: 48,
        }}
      >
        <div>
          <div
            style={{
              position: 'relative',
              background: 'var(--cream-2)',
              overflow: 'hidden',
              aspectRatio: '4/5',
            }}
          >
            <img
              src={images[activeImg]?.url || product.primary_image}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'opacity 0.3s ease',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 18,
                left: 18,
                display: 'flex',
                gap: 8,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--ink)',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  background: 'var(--cream)',
                  padding: '5px 10px',
                }}
              >
                {product.category}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--cream)',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  background: 'var(--black)',
                  padding: '5px 10px',
                }}
              >
                {product.category}
              </span>
            </div>
            {product.tag && (
              <div
                style={{
                  position: 'absolute',
                  top: 18,
                  right: 18,
                  background: 'var(--accent)',
                  color: '#fff',
                  padding: '6px 14px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                {product.tag}
              </div>
            )}
            <div
              style={{
                position: 'absolute',
                bottom: 18,
                right: 18,
                fontFamily: 'var(--font-script)',
                fontSize: 38,
                color: 'var(--cream)',
                textShadow: '0 2px 8px rgba(0,0,0,0.25)',
                transform: 'rotate(-4deg)',
              }}
            >
              vol. 01
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8,
              marginTop: 8,
            }}
          >
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                style={{
                  aspectRatio: '1',
                  border:
                    activeImg === i
                      ? '2px solid var(--accent)'
                      : '1px solid var(--line)',
                  padding: 0,
                  cursor: 'pointer',
                  background: 'var(--cream-2)',
                  overflow: 'hidden',
                  outline: 'none',
                }}
              >
                <img
                  src={img.url ?? undefined}
                  alt={`${product.name} view ${i + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </button>
            ))}
          </div>
        </div>

        <div style={{ paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--accent-deep)',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            —— ppi capsule · vol. 01 ——
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(56px, 6.5vw, 88px)',
              color: 'var(--black)',
              lineHeight: 0.92,
              letterSpacing: '0.01em',
            }}
          >
            {product.name.toUpperCase()}
            <span style={{ color: 'var(--accent)' }}>.</span>
          </h1>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 22,
              color: 'var(--ink)',
              marginTop: 6,
            }}
          >
            {product.subtitle}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginTop: 18,
              paddingBottom: 18,
              borderBottom: '1px solid var(--line)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: isSoldOut ? '#b91c1c' : '#1F8A5B',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: isSoldOut ? '#b91c1c' : '#1F8A5B',
                }}
              />{' '}
              {isSoldOut ? 'sold out' : `${currentStock} in stock`}
            </span>
            {!isSoldOut && quantityInCart > 0 && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: cannotAddMore ? '#b91c1c' : 'var(--muted)',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
              >
                {cannotAddMore ? 'max in cart' : `${remainingStock} left to add`}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 18 }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 54,
                color: 'var(--black)',
              }}
            >
              €{currentPrice.toFixed(2)}
            </span>
            {hasValidOriginalPrice && (
              <>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 16,
                    color: 'var(--muted)',
                    textDecoration: 'line-through',
                  }}
                >
                  €{currentOriginalPrice.toFixed(2)}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    background: 'var(--accent)',
                    color: '#fff',
                    padding: '4px 9px',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}
                >
                  −{Math.round((1 - currentPrice / currentOriginalPrice) * 100)}%
                </span>
              </>
            )}
          </div>

          <div style={{ marginTop: 22 }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--muted)',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              color · <span style={{ color: 'var(--black)' }}>{selColor?.name || '...'}</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {uniqueColors.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setSelColor(c)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: c.hex,
                    border: 'none',
                    outline:
                      selColor?.hex === c.hex
                        ? '2px solid var(--accent)'
                        : '1px solid var(--line)',
                    outlineOffset: 3,
                    cursor: 'pointer',
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
              ))}
            </div>
          </div>

          {availableFits.length > 1 && (
            <div style={{ marginTop: 22 }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--muted)',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  marginBottom: 10,
                }}
              >
                fit type · <span style={{ color: 'var(--black)' }}>{selFit}</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {availableFits.map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelFit(f)}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid',
                      borderColor: selFit === f ? 'var(--black)' : 'var(--line)',
                      background: selFit === f ? 'var(--black)' : 'transparent',
                      color: selFit === f ? 'var(--cream)' : 'var(--ink)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      fontWeight: 600,
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {availableSizes[0] !== 'ONE SIZE' ? (
            <div style={{ marginTop: 20 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--muted)',
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                  }}
                >
                  size · <span style={{ color: 'var(--black)' }}>{selSize}</span>
                </span>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--accent-deep)',
                    textDecoration: 'underline',
                  }}
                >
                  size guide ↗
                </button>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {availableSizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelSize(s)}
                    style={{
                      minWidth: 50,
                      padding: '11px 14px',
                      border: '1px solid',
                      borderColor: selSize === s ? 'var(--black)' : 'var(--line)',
                      background: selSize === s ? 'var(--black)' : 'transparent',
                      color: selSize === s ? 'var(--cream)' : 'var(--ink)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
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
          ) : (
            <div
              style={{
                marginTop: 20,
                padding: '12px 16px',
                background: 'var(--cream-2)',
                display: 'inline-block',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--ink)',
              }}
            >
              one size · fits all
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 24, alignItems: 'stretch' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid var(--line)',
                borderRadius: 999,
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={isSoldOut}
                style={{
                  width: 46,
                  height: 54,
                  background: 'none',
                  border: 'none',
                  cursor: isSoldOut ? 'not-allowed' : 'pointer',
                  fontSize: 18,
                  opacity: isSoldOut ? 0.45 : 1,
                }}
              >
                −
              </button>
              <span
                style={{
                  width: 40,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 15,
                  textAlign: 'center',
                }}
              >
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => Math.min(remainingStock, q + 1))}
                disabled={isSoldOut || cannotAddMore || isAtStockLimit}
                style={{
                  width: 46,
                  height: 54,
                  background: 'none',
                  border: 'none',
                  cursor: isSoldOut || cannotAddMore || isAtStockLimit ? 'not-allowed' : 'pointer',
                  fontSize: 18,
                  color: isSoldOut || cannotAddMore || isAtStockLimit ? 'var(--muted)' : 'var(--black)',
                  opacity: isSoldOut || cannotAddMore || isAtStockLimit ? 0.45 : 1,
                }}
              >
                +
              </button>
            </div>
            <AddToCartBtn price={currentPrice * qty} onClick={handleAddToCart} disabled={isSoldOut || cannotAddMore || !currentVariant} soldOut={isSoldOut} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '60px 28px 0' }}>
        <div
          style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--line)' }}
        >
          {TABS.map(([k, l]) => (
            <button
              key={k}
              onClick={() => setActiveTab(k)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '14px 18px',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: activeTab === k ? 'var(--black)' : 'var(--muted)',
                borderBottom:
                  activeTab === k ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: -1,
                fontWeight: activeTab === k ? 700 : 500,
              }}
            >
              {l}
            </button>
          ))}
        </div>
        <div style={{ padding: '30px 0', maxWidth: 780 }}>
          {activeTab === 'description' && (
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontSize: 32,
                  color: 'var(--black)',
                  marginBottom: 14,
                  lineHeight: 1.2,
                }}
              >
                The story behind {product.name}.
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 15,
                  color: 'var(--ink)',
                  lineHeight: 1.85,
                  marginBottom: 14,
                }}
              >
                {product.desc}
              </p>
            </div>
          )}
          {activeTab === 'care' && (
            <ul
              style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 0 }}
            >
              {careItems.map(([k, v]) => (
                <li
                  key={k}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '14px 0',
                    borderBottom: '1px solid var(--line)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: 'var(--muted)',
                      minWidth: 140,
                    }}
                  >
                    {k}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 14,
                      color: 'var(--black)',
                      textAlign: 'right',
                    }}
                  >
                    {v}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '40px 28px 0' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--muted)',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              —— you may also like ——
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 48,
                color: 'var(--black)',
                letterSpacing: '0.01em',
              }}
            >
              MORE FROM THE DROP<span style={{ color: 'var(--accent)' }}>.</span>
            </h2>
          </div>
          <Link
            href="/catalog"
            style={{
              textDecoration: 'none',
              color: 'var(--black)',
              border: '1px solid var(--black)',
              padding: '10px 18px',
              borderRadius: 999,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
            }}
          >
            view all ↗
          </Link>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 22,
          }}
        >
          {related.map((p) => {
            return (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                style={{ textDecoration: 'none', cursor: 'pointer' }}
              >
                <div style={{ background: 'var(--cream-2)', overflow: 'hidden' }}>
                  <ProductCrop src={p.primary_image ?? 'editorial-color.jpeg'} height={300} />
                </div>
                <div style={{ padding: '12px 4px 0', textAlign: 'center' }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 17,
                      color: 'var(--black)',
                      marginTop: 4,
                    }}
                  >
                    {p.name.toUpperCase()}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {showSizeGuide && (
        <div
          onClick={() => setShowSizeGuide(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.72)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: 900,
              width: '100%',
              background: 'var(--cream)',
              padding: 16,
            }}
          >
            <button
              onClick={() => setShowSizeGuide(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: 'none',
                background: 'var(--black)',
                color: 'var(--cream)',
                cursor: 'pointer',
                fontSize: 18,
              }}
            >
              ×
            </button>

            <img
              src="/assets/v4/size-guide.jpeg"
              alt="Size Guide"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}

function AddToCartBtn({
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
      style={{
        flex: 1,
        background: (disabled || isAdmin) ? 'var(--muted)' : hovered ? 'var(--accent)' : 'var(--black)',
        color: 'var(--cream)',
        border: 'none',
        padding: '15px',
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        cursor: (disabled || isAdmin) ? 'not-allowed' : 'pointer',
        borderRadius: 999,
        fontWeight: 600,
        transition: 'all 0.2s',
      }}
    >
      {isAdmin ? 'ADMIN MODE' : (disabled ? (soldOut ? 'sold out' : 'max in cart') : `add to cart — €${price.toFixed(2)} ↗`)}
    </button>
  );
}
