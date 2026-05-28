'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useMemo, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Product, ProductVariant, CartItem } from '@/types';
import {
  addVariantToCartAction,
  getCartItemsAction,
  removeCartItemAction,
  updateCartItemQuantityAction,
} from '@/lib/actions/cart';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, variant: ProductVariant, qty?: number) => Promise<void>;
  updateCart: (cartId: string, delta: number) => Promise<void>;
  removeFromCart: (cartId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  loading: boolean;
  error: string | null;
  cartCount: number;
  total: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isLoaded, isSignedIn } = useAuth();

  const refreshCart = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setCart([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setCart(await getCartItemsAction());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cart.');
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    void refreshCart();
  }, [refreshCart]);

  const addToCart = useCallback(async (
    _product: Product,
    variant: ProductVariant,
    qty = 1
  ) => {
    if (!isSignedIn) {
      throw new Error('Please sign in before adding items to your cart.');
    }

    setLoading(true);
    setError(null);
    try {
      await addVariantToCartAction(variant.id, qty);
      await refreshCart();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add item to cart.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, refreshCart]);

  const updateCart = useCallback(async (cartId: string, delta: number) => {
    setLoading(true);
    setError(null);
    try {
      await updateCartItemQuantityAction(cartId, delta);
      await refreshCart();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update cart.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [refreshCart]);

  const removeFromCart = useCallback(async (cartId: string) => {
    setLoading(true);
    setError(null);
    try {
      await removeCartItemAction(cartId);
      await refreshCart();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove cart item.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [refreshCart]);

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);
  const total = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateCart, removeFromCart, refreshCart, loading, error, cartCount, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
