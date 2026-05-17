export interface ProductVariant {
  id: number
  product_id: number
  size: string
  fit_type: 'NORMAL' | 'OVERSIZED' | null
  price: number
  original_price: number | null
  color_name: string
  color_hex: string
  stock: number
  sku: string
}

export const PRODUCT_VARIANTS: ProductVariant[] = [
  // Fang & Horn — White (id: 1)
  { id: 1,  product_id: 1, size: 'S',        fit_type: 'OVERSIZED', price: 25, original_price: 30, color_name: 'White', color_hex: '#F5F1E6', stock: 10, sku: 'FH-S-WHITE' },
  { id: 2,  product_id: 1, size: 'M',        fit_type: 'OVERSIZED', price: 25, original_price: 30, color_name: 'White', color_hex: '#F5F1E6', stock: 8,  sku: 'FH-M-WHITE' },
  { id: 3,  product_id: 1, size: 'L',        fit_type: 'OVERSIZED', price: 25, original_price: 30, color_name: 'White', color_hex: '#F5F1E6', stock: 5,  sku: 'FH-L-WHITE' },
  { id: 4,  product_id: 1, size: 'XL',       fit_type: 'OVERSIZED', price: 25, original_price: 30, color_name: 'White', color_hex: '#F5F1E6', stock: 3,  sku: 'FH-XL-WHITE' },
  { id: 5,  product_id: 1, size: 'XXL',      fit_type: 'OVERSIZED', price: 25, original_price: 30, color_name: 'White', color_hex: '#F5F1E6', stock: 2,  sku: 'FH-XXL-WHITE' },
  // Fang & Horn — Black (id: 1)
  { id: 6,  product_id: 1, size: 'S',        fit_type: 'OVERSIZED', price: 25, original_price: 30, color_name: 'Black', color_hex: '#0E0E0E', stock: 7,  sku: 'FH-S-BLACK' },
  { id: 7,  product_id: 1, size: 'M',        fit_type: 'OVERSIZED', price: 25, original_price: 30, color_name: 'Black', color_hex: '#0E0E0E', stock: 0,  sku: 'FH-M-BLACK' },
  { id: 8,  product_id: 1, size: 'L',        fit_type: 'OVERSIZED', price: 25, original_price: 30, color_name: 'Black', color_hex: '#0E0E0E', stock: 4,  sku: 'FH-L-BLACK' },
  { id: 9,  product_id: 1, size: 'XL',       fit_type: 'OVERSIZED', price: 25, original_price: 30, color_name: 'Black', color_hex: '#0E0E0E', stock: 6,  sku: 'FH-XL-BLACK' },
  { id: 10, product_id: 1, size: 'XXL',      fit_type: 'OVERSIZED', price: 25, original_price: 30, color_name: 'Black', color_hex: '#0E0E0E', stock: 1,  sku: 'FH-XXL-BLACK' },

  // Trio Komodores — Black (id: 2)
  { id: 11, product_id: 2, size: 'S',        fit_type: 'NORMAL', price: 25,original_price: null, color_name: 'Black',    color_hex: '#0E0E0E', stock: 10, sku: 'TK-S-BLACK' },
  { id: 12, product_id: 2, size: 'M',        fit_type: 'NORMAL', price: 25,original_price: null, color_name: 'Black',    color_hex: '#0E0E0E', stock: 8,  sku: 'TK-M-BLACK' },
  { id: 13, product_id: 2, size: 'L',        fit_type: 'NORMAL', price: 25,original_price: null, color_name: 'Black',    color_hex: '#0E0E0E', stock: 6,  sku: 'TK-L-BLACK' },
  { id: 14, product_id: 2, size: 'XL',       fit_type: 'NORMAL',  price: 25,original_price: null, color_name: 'Black',    color_hex: '#0E0E0E', stock: 4,  sku: 'TK-XL-BLACK' },
  // Trio Komodores — Charcoal (id: 2)
  { id: 15, product_id: 2, size: 'S',        fit_type: 'NORMAL', price: 25,original_price: null, color_name: 'Charcoal', color_hex: '#3A3A3A', stock: 5,  sku: 'TK-S-CHARCOAL' },
  { id: 16, product_id: 2, size: 'M',        fit_type: 'NORMAL', price: 25,original_price: null, color_name: 'Charcoal', color_hex: '#3A3A3A', stock: 3,  sku: 'TK-M-CHARCOAL' },
  { id: 17, product_id: 2, size: 'L',        fit_type: 'NORMAL', price: 25,original_price: null, color_name: 'Charcoal', color_hex: '#3A3A3A', stock: 0,  sku: 'TK-L-CHARCOAL' },
  { id: 18, product_id: 2, size: 'XL',       fit_type: 'NORMAL', price: 25,original_price: null, color_name: 'Charcoal', color_hex: '#3A3A3A', stock: 2,  sku: 'TK-XL-CHARCOAL' },

  // Elle the Elephant — Grey (id: 3)
  { id: 19, product_id: 3, size: 'S',        fit_type: 'NORMAL', price: 28, original_price: 35, color_name: 'Grey', color_hex: '#5A5A5A', stock: 5,  sku: 'EE-S-GREY' },
  { id: 20, product_id: 3, size: 'M',        fit_type: 'NORMAL', price: 28, original_price: 35, color_name: 'Grey', color_hex: '#5A5A5A', stock: 4,  sku: 'EE-M-GREY' },
  { id: 21, product_id: 3, size: 'L',        fit_type: 'NORMAL', price: 28, original_price: 35, color_name: 'Grey', color_hex: '#5A5A5A', stock: 3,  sku: 'EE-L-GREY' },
  { id: 22, product_id: 3, size: 'XL',       fit_type: 'NORMAL', price: 28, original_price: 35, color_name: 'Grey', color_hex: '#5A5A5A', stock: 2,  sku: 'EE-XL-GREY' },
  { id: 23, product_id: 3, size: 'XXL',      fit_type: 'NORMAL', price: 28, original_price: 35, color_name: 'Grey', color_hex: '#5A5A5A', stock: 1,  sku: 'EE-XXL-GREY' },
  // Elle the Elephant — Sand (id: 3)
  { id: 24, product_id: 3, size: 'S',        fit_type: 'NORMAL', price: 28, original_price: 35, color_name: 'Sand', color_hex: '#C9B89A', stock: 4,  sku: 'EE-S-SAND' },
  { id: 25, product_id: 3, size: 'M',        fit_type: 'NORMAL', price: 28, original_price: 35, color_name: 'Sand', color_hex: '#C9B89A', stock: 0,  sku: 'EE-M-SAND' },
  { id: 26, product_id: 3, size: 'L',        fit_type: 'NORMAL', price: 28, original_price: 35,  color_name: 'Sand', color_hex: '#C9B89A', stock: 2,  sku: 'EE-L-SAND' },
  { id: 27, product_id: 3, size: 'XL',       fit_type: 'NORMAL',  price: 28, original_price: 35, color_name: 'Sand', color_hex: '#C9B89A', stock: 3,  sku: 'EE-XL-SAND' },
  { id: 28, product_id: 3, size: 'XXL',      fit_type: 'NORMAL', price: 28, original_price: 35, color_name: 'Sand', color_hex: '#C9B89A', stock: 1,  sku: 'EE-XXL-SAND' },

  // Einkaufen 101 — ONE SIZE (id: 4)
  { id: 29, product_id: 4, size: 'ONE SIZE', fit_type: null, price: 18, original_price: null, color_name: 'Natural / Blue', color_hex: '#E8E0CC', stock: 20, sku: 'EK-OS-NATBLUE' },

  // Mit Karte Bitte — ONE SIZE (id: 5)
  { id: 30, product_id: 5, size: 'ONE SIZE', fit_type: null, price: 18, original_price: null, color_name: 'Natural / Green', color_hex: '#E8E0CC', stock: 15, sku: 'MKB-OS-NATGREEN' },
]

export function getUniqueColors(productId: number): { name: string; hex: string }[] {
 const variants = PRODUCT_VARIANTS.filter(v => v.product_id === productId)
 const colorMap = new Map<string, string>()
 variants.forEach(v => {
  if (!colorMap.has(v.color_name)) colorMap.set(v.color_name, v.color_hex)
 })
return Array.from(colorMap, ([name, hex]) => ({name, hex}))
}

export function getSizesForColor(productId: number, colorName: string) {
  return PRODUCT_VARIANTS
    .filter(v => v.product_id === productId && v.color_name === colorName)
    .map(v => ({ size: v.size, stock: v.stock, inStock: v.stock > 0, variantId: v.id}))
}

export function getSizesById(productId: number): string[] {
  const variants = PRODUCT_VARIANTS.filter(v => v.product_id === productId)
  const sizes = new Array<string>()
  variants.forEach(v => {
    if (!sizes.includes(v.size)) sizes.push(v.size)
  })
return sizes
}

export function getVariant(productId: number, size: string, colorName: string): ProductVariant | null {
  return PRODUCT_VARIANTS.find(v =>
    v.product_id === productId &&
    v.size === size &&
    v.color_name === colorName
  ) ?? null
}

export function getVariantById(id: number): ProductVariant | null {
  return PRODUCT_VARIANTS.find(v => v.id === id) ?? null
}

export function getVariantsByProduct(productId: number): ProductVariant[] {
  return PRODUCT_VARIANTS.filter(v => v.product_id === productId)
}

export function getProductBasePrice(productId: number): number {
  const variants = getVariantsByProduct(productId)
  return variants.length > 0 ? variants[0].price : 0
}

export function getProductOriginalPrice(productId: number): number | null {
  const variants = getVariantsByProduct(productId)
  return variants.length > 0 ? variants[0].original_price : null
}