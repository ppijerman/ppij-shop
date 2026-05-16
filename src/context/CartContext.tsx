'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { Product, getProductById } from '@/data/mockup/products';
import { getVariant, getVariantById, getUniqueColors, getSizesById } from '@/data/mockup/variants';

// Simplified interface to match the new mockup data and user preferences
export interface CartItem {
  cartId: number;
  qty: number;
  // Derived fields for UI
  id: number;
  category: string;
  name: string;
  price: number;
  color: { name: string; hex: string };
  size: string;
  primary_image: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, qty?: number, color?: { name: string; hex: string } | null, size?: string | null) => void;
  updateCart: (cartId: number, delta: number) => void;
  removeFromCart: (cartId: number) => void;
  cartCount: number;
  total: number;
}

const CartContext = createContext<CartContextType | null>(null);

interface CartStateItem {
  cartId: number;
  variantId: number;
  qty: number;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartStateItem[]>([]);

  const addToCart = useCallback((
    product: Product,
    qty = 1,
    color: { name: string; hex: string } | null = null,
    size: string | null = null,
  ) => {
    const c = color ?? getUniqueColors(product.id)[0];
    const s = size ?? getSizesById(product.id)[0];
    const variant = getVariant(product.id, s, c.name);
    
    if (!variant) {
      console.warn(`Variant not found for product ${product.id}, size ${s}, color ${c.name}`);
      return;
    }

    setItems(prev => {
      const existing = prev.find(i => i.variantId === variant.id);
      if (existing) {
        return prev.map(i => i.variantId === variant.id ? { ...i, qty: i.qty + qty } : i);
      }
      return [...prev, { cartId: Date.now() + Math.random(), variantId: variant.id, qty }];
    });
  }, []);

  const updateCart = useCallback((cartId: number, delta: number) => {
    setItems(prev => prev.map(i => i.cartId === cartId ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  }, []);

  const removeFromCart = useCallback((cartId: number) => {
    setItems(prev => prev.filter(i => i.cartId !== cartId));
  }, []);

  const cart = useMemo(() => {
    return items.map(item => {
      const variant = getVariantById(item.variantId);
      const product = variant ? getProductById(variant.product_id) : null;
      
      if (!variant || !product) return null;

      return {
        cartId: item.cartId,
        qty: item.qty,
        id: product.id,
        category: product.category === 'TOTEBAG' ? 'TOTE BAG' : 'T-SHIRT',
        name: product.name,
        price: product.price,
        color: { name: variant.color_name, hex: variant.color_hex },
        size: variant.size,
        primary_image: product.primary_image,
      } as CartItem;
    }).filter((i): i is CartItem => i !== null);
  }, [items]);

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
