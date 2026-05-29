export interface Color {
  name: string;
  hex: string;
}

export type ProductCategory = 'TSHIRT' | 'TOTEBAG';
export type UserRole = 'BUYER' | 'ADMIN_KK' | 'ADMIN_IT';

export interface User {
  id: string;
  clerk_user_id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}
export interface Product {
  id: string;
  name: string;
  subtitle: string;
  fit_type: string;
  primary_image?: string; // Derived from images array or join
  images?: ProductImage[];
  slug: string;
  category: ProductCategory;
  desc: string;
  tag: string | null;
  created_at: string;
  updated_at: string;
  weight_g: number;
  is_active: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  stock: number;
  fit_type: string | null;
  price: number;
  original_price: number | null;
  sku: string;
  color_name: string;
  color_hex: string;
  created_at: string;
  updated_at: string;
}

export interface ProductData {
  name: string
  subtitle: string
  category: string
  fitType: string
  tag: string
  description: string
  images: {
    url: string
    is_primary: boolean
  }[]
  colors: {
    name: string
    hex: string
  }[]
  sizes: string[]
  stock: Record<string, Record<string, number>>
  price: number
  originalPrice: number | null
  skuPrefix: string
  weightG: number
  slug: string
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  is_primary: boolean;
}

export type PaymentMethod = 'IBAN';

export interface CartItem {
  cartId: string;
  variantId: string | null;
  productId: string | null;
  bundleId: string | null;
  name: string;
  category: string;
  price: number;
  qty: number;
  size: string | null;
  color: Color | null;
  image: string;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DONE' | 'CANCELLED';
export interface DeliveryAddress {
  street: string,
  city: string,
  postcode: string,
  country: string
}

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string | null;
  bundle_id: string | null;
  quantity: number;
  price_at_purchase: number;
  product_name_snapshot: string;
  sku_snapshot: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  status: OrderStatus;
  total_price: number;
  delivery_address: DeliveryAddress | null;
  delivery_type: 'PICKUP' | 'DELIVERY';
  payment_method: PaymentMethod;
  payment_proof_url: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  paymentProof?: string; 
}

export interface Bundle {
  id: string;
  name: string;
  desc: string;
  price: number;
  original_price: number | null;
  slug: string;
  sku: string;
  category: string;
}
