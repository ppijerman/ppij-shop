'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Color } from '@/types';
import { CartItem } from '@/data/mockup/cart';
import { Product } from '@/data/mockup/products';
import { getUniqueColors, getSizesById } from '@/data/mockup/variants';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, qty?: number, color?: Color | null, size?: string | null) => void;
  updateCart: (cartId: number, delta: number) => void;
  removeFromCart: (cartId: number) => void;
  cartCount: number;
  total: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback((
    product: Product,
    qty = 1,
    color: Color | null = null,
    size: string | null = null,
  ) => {
    setCart(prev => {
      const c = color ?? getUniqueColors(product.id)[0];
      const s = size ?? getSizesById(product.id)[0];
      const key = `${product.id}-${c.hex}-${s}`;
      const existing = prev.find(i => i.cartKey === key);
      if (existing) return prev.map(i => i.cartKey === key ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { ...product, qty, cartId: Date.now() + Math.random(), cartKey: key, color: c, size: s }];
    });
  }, []);

  const updateCart = useCallback((cartId: number, delta: number) => {
    setCart(prev => prev.map(i => i.cartId === cartId ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  }, []);

  const removeFromCart = useCallback((cartId: number) => {
    setCart(prev => prev.filter(i => i.cartId !== cartId));
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

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
