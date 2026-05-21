export interface Color {
  name: string;
  hex: string;
}

export type ProductCategory = 'TSHIRT' | 'TOTEBAG';

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  fit_type: string;
  primary_image: string;
  slug: string;
  category: ProductCategory;
  desc: string;
  skuPrefix?: string;
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

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
}

export interface CartItem {
  cartId: string;
  variantId: string;
  productId: string;
  name: string;
  category: string;
  price: number;
  qty: number;
  size: string;
  color: Color;
  image: string;
}

export type OrderStatus = 'PENDING_PAYMENT' | 'PAYMENT_CONFIRMATION' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  name: string;
  size: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  buyerName: string;
  email: string;
  address: string;
  totalPrice: number;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  paymentProof?: string; 
}

export interface Bundle {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  skuPrefix?: string;
  productIds: number[];
}
