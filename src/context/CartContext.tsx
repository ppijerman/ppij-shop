'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { Product, ProductVariant, CartItem, Bundle } from '@/types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product | Bundle, variant?: ProductVariant, qty?: number) => void;
  updateCart: (cartId: string, delta: number) => void;
  removeFromCart: (cartId: string) => void;
  cartCount: number;
  total: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback((
    product: Product | Bundle,
    variant?: ProductVariant,
    qty = 1
  ) => {
    setCart(prev => {
      const isBundle = 'slug' in product && !('category' in product);
      const bundleId = isBundle ? (product as Bundle).id : null;
      const variantId = variant?.id ?? null;
      
      const existing = prev.find(i => bundleId ? i.bundleId === bundleId : i.variantId === variantId);

      if (existing) {
        return prev.map(i => 
          (bundleId ? i.bundleId === bundleId : i.variantId === variantId) 
          ? { ...i, qty: i.qty + qty } : i);
      }
      
      const newItem: CartItem = {
        cartId: `${Date.now()}-${Math.random()}`,
        variantId: variantId,
        productId: bundleId ? null : (product as Product).id,
        bundleId: bundleId,
        name: product.name,
        category: bundleId ? 'BUNDLE' : (product as Product).category,
        price: bundleId ? (product as Bundle).price : variant!.price,
        qty: qty,
        size: variant?.size.trim() ?? null,
        color: variant ? { name: variant.color_name, hex: variant.color_hex } : null,
        image: bundleId ? 'editorial-color.jpeg' :
          ((product as Product).images?.find((img: any) => img.is_primary)?.url ?? 'editorial-color.jepg')
      };
      
      return [...prev, newItem];
    });
  }, []);

  const updateCart = useCallback((cartId: string, delta: number) => {
    setCart(prev => prev.map(i => i.cartId === cartId ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  }, []);

  const removeFromCart = useCallback((cartId: string) => {
    setCart(prev => prev.filter(i => i.cartId !== cartId));
  }, []);

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);
  const total = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateCart, removeFromCart, cartCount, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
