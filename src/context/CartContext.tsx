'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { Product, ProductVariant, CartItem } from '@/types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, variant: ProductVariant, qty?: number) => void;
  updateCart: (cartId: string, delta: number) => void;
  removeFromCart: (cartId: string) => void;
  cartCount: number;
  total: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback((
    product: Product,
    variant: ProductVariant,
    qty = 1
  ) => {
    setCart(prev => {
      const existing = prev.find(i => i.variantId === variant.id);
      if (existing) {
        return prev.map(i => i.variantId === variant.id ? { ...i, qty: i.qty + qty } : i);
      }
      
      const newItem: CartItem = {
        cartId: `${Date.now()}-${Math.random()}`,
        variantId: variant.id,
        productId: product.id,
        name: product.name,
        category: product.category === 'TOTEBAG' ? 'TOTE BAG' : 'T-SHIRT',
        price: variant.price,
        qty: qty,
        size: variant.size.trim(),
        color: { name: variant.color_name, hex: variant.color_hex },
        image: product.primary_image,
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
