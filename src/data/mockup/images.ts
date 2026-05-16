export interface ProductImage {
  id: number
  product_id: number
  url: string
}

export const PRODUCT_IMAGES: ProductImage[] = [
  // Fang & Horn (id: 1)
  { id: 1,  product_id: 1, url: '/assets/v4/tshirt-grid.jpeg' },
  { id: 2,  product_id: 1, url: '/assets/v4/editorial-color.jpeg' },

  // Trio Komodores (id: 2)
  { id: 3,  product_id: 2, url: '/assets/v4/tshirt-grid.jpeg' },
  { id: 4,  product_id: 2, url: '/assets/v4/editorial-collage.jpeg' },

  // Elle the Elephant (id: 3)
  { id: 5,  product_id: 3, url: '/assets/v4/tshirt-grid.jpeg' },
  { id: 6,  product_id: 3, url: '/assets/v4/editorial-color.jpeg' },

  // Einkaufen 101 (id: 4)
  { id: 7,  product_id: 4, url: '/assets/v4/totebag-grid.jpeg' },
  { id: 8,  product_id: 4, url: '/assets/v4/editorial-collage.jpeg' },

  // Mit Karte Bitte (id: 5)
  { id: 9,  product_id: 5, url: '/assets/v4/totebag-grid.jpeg' },
  { id: 10, product_id: 5, url: '/assets/v4/editorial-collage.jpeg' },
]

export function getProductImages(productId: number): ProductImage[] {
  return PRODUCT_IMAGES
    .filter(img => img.product_id === productId)
}
