import { ProductVariant, getVariantById } from "./variants"
import { Bundle, getBundleById } from "./bundles"
import { Product, getProductById } from "./products"

export interface CartItem {
  id: number
  user_id: number
  variant_id: number | null
  bundle_id: number | null
  quantity: number
  created_at: string
}

export const CART_ITEMS: CartItem[] = [
  { id: 1, user_id: 1, variant_id: 2,    bundle_id: null, quantity: 1, created_at: '2026-05-13T09:00:00Z' },
  { id: 2, user_id: 1, variant_id: null, bundle_id: 1,    quantity: 1, created_at: '2026-05-13T09:05:00Z' },
]

export interface CartItemWithDetails extends CartItem {
  variant: ProductVariant | null
  product: Product | null
  bundle: Bundle | null
  unit_price: number
  subtotal: number
}

export function getCartByUser(userId: number): CartItemWithDetails[] {
  return CART_ITEMS
    .filter(item => item.user_id === userId)
    .map(item => {
      const variant = item.variant_id ? getVariantById(item.variant_id) : null
      const product = variant ? getProductById(variant.product_id) : null
      const bundle = item.bundle_id ? getBundleById(item.bundle_id) : null
      const unit_price = variant ? (variant.price) : (bundle?.price ?? 0)

      return {
        ...item,
        variant,
        product,
        bundle,
        unit_price,
        subtotal: unit_price * item.quantity
      }
    })
}