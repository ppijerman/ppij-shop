export interface Color {
  name: string;
  hex: string;
}

export type ProductCategory = 'T-SHIRT' | 'TOTE BAG';
export type PrimaryImg = 'tshirt_grid' | 'totebag_grid';

export interface Product {
  id: number;
  no: string;
  category: ProductCategory;
  name: string;
  subtitle: string;
  price: number;
  originalPrice: number | null;
  tag: string | null;
  colors: Color[];
  sizes: string[];
  desc: string;
  images: string[];
  primaryImg: PrimaryImg;
  featurePos: { x: number; y: number };
}

export interface CartItem extends Product {
  qty: number;
  cartId: number;
  cartKey: string;
  color: Color;
  size: string;
}
