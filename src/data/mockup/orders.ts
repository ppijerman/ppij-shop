import { ProductVariant, getVariantById } from "./variants"
import { Bundle, getBundleById } from "./bundles"
import { getUserById } from "./user"
import { Product, getProductById } from "./products"

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DONE'
export type DeliveryType = 'PICKUP' | 'DELIVERY'

export interface Order {
  id: number
  user_id: number
  status: OrderStatus
  total_price: number
  delivery_type: DeliveryType
  delivery_address: string | null
  payment_proof_url: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: number
  order_id: number
  variant_id: number | null
  bundle_id: number | null
  quantity: number
  price_at_purchase: number
  created_at: string
}

export interface OrderStatusLog {
  id: number
  order_id: number
  status: OrderStatus
  note: string | null
  created_at: string
}

export const ORDERS: Order[] = [
  {
    id: 1,
    user_id: 1,
    status: 'SHIPPED',
    total_price: 63,
    delivery_type: 'DELIVERY',
    delivery_address: 'Musterstraße 1, 10115 Berlin',
    payment_proof_url: '/assets/mockup/proof-1.jpg',
    created_at: '2026-05-01T10:34:00Z',
    updated_at: '2026-05-04T14:00:00Z',
  },
  {
    id: 2,
    user_id: 2,
    status: 'PENDING',
    total_price: 38,
    delivery_type: 'PICKUP',
    delivery_address: null,
    payment_proof_url: null,
    created_at: '2026-05-13T09:20:00Z',
    updated_at: '2026-05-13T09:20:00Z',
  },
  {
    id: 3,
    user_id: 1,
    status: 'CONFIRMED',
    total_price: 25,
    delivery_type: 'DELIVERY',
    delivery_address: 'Musterstraße 1, 10115 Berlin',
    payment_proof_url: '/assets/mockup/proof-3.jpg',
    created_at: '2026-05-10T11:00:00Z',
    updated_at: '2026-05-11T09:00:00Z',
  },
]

export const ORDER_ITEMS: OrderItem[] = [
  { id: 1, order_id: 1, variant_id: 1, bundle_id: null, quantity: 2, price_at_purchase: 25, created_at: '2026-05-01T10:34:00Z' },
  { id: 2, order_id: 1, variant_id: null, bundle_id: 1, quantity: 1, price_at_purchase: 18, created_at: '2026-05-01T10:34:00Z' }
]

export const ORDER_STATUS_LOGS: OrderStatusLog[] = [
  // Order 1 logs
  { id: 1, order_id: 1, status: 'PENDING' as const,    note: 'Order received', created_at: '2026-05-01T10:34:00Z' },
  { id: 2, order_id: 1, status: 'CONFIRMED' as const,  note: 'Payment verified', created_at: '2026-05-02T09:00:00Z' },
  { id: 3, order_id: 1, status: 'PROCESSING' as const, note: 'Packing order', created_at: '2026-05-03T11:00:00Z' },
  { id: 4, order_id: 1, status: 'SHIPPED' as const,    note: 'Sent via DHL — 1234567', created_at: '2026-05-04T14:00:00Z' },

  // Order 2 logs
  { id: 5, order_id: 2, status: 'PENDING',    note: 'Order received',          created_at: '2026-05-13T09:20:00Z' },

  // Order 3 logs
  { id: 6, order_id: 3, status: 'PENDING',    note: 'Order received',          created_at: '2026-05-10T11:00:00Z' },
  { id: 7, order_id: 3, status: 'CONFIRMED',  note: 'Payment verified',        created_at: '2026-05-11T09:00:00Z' },
]

export interface OrderItemWithDetails extends OrderItem {
  variant: ProductVariant | null
  product: Product | null
  bundle: Bundle | null
}

export interface OrderWithDetails extends Order {
  user: ReturnType<typeof getUserById>
  items: OrderItemWithDetails[]
  logs: OrderStatusLog[]
}

export function getOrderWithDetails(orderId: number): OrderWithDetails | null {
  const order = ORDERS.find(o => o.id === orderId)
  if (!order) return null

  const user = getUserById(order.user_id)
  const logs = ORDER_STATUS_LOGS
    .filter(l => l.order_id === orderId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  const items: OrderItemWithDetails[] = ORDER_ITEMS
    .filter(i => i.order_id === orderId)
    .map(item => {
      const variant = item.variant_id ? getVariantById(item.variant_id) : null
      const product = variant ? getProductById(variant.product_id) : null
      const bundle = item.bundle_id ? getBundleById(item.bundle_id) : null
      return { ...item, variant, product, bundle }
    })

  return { ...order, user, items, logs }
}

// Get all orders for a user
export function getOrdersByUser(userId: number): Order[] {
  return ORDERS
    .filter(o => o.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

// Get all orders (for admin)
export function getAllOrders(): Order[] {
  return [...ORDERS].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

// Get orders by status (for admin KK)
export function getOrdersByStatus(status: OrderStatus): Order[] {
  return ORDERS.filter(o => o.status === status)
}

// Get pending payment orders (for admin KK payments page)
export function getPendingPaymentOrders(): Order[] {
  return ORDERS.filter(o =>
    o.status === 'PENDING' && o.payment_proof_url !== null
  )
}