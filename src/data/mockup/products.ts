export interface Product {
  id: number
  name: string
  subtitle: string
  category: string
  fit_type: string | null
  desc: string,
  price: number
  original_price: number | null
  tag: string
  primary_image: string
  slug: string
  created_at: string
  updated_at: string
}

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Fang & Horn',
    subtitle: 'OVERSIZED TEE — WHITE',
    category: 'TSHIRT',
    fit_type: 'normal',
    desc: "Kaos oversized 220gsm dengan hand-drawn graphic 'Fang & Horn'. Cotton combed 30s, premium ringspun.",
    price: 25,
    original_price: 30,
    tag: 'BESTSELLER',
    primary_image: '/assets/v4/tshirt-grid.jpeg',
    slug: 'fang-and-horn',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Trio Komodores',
    subtitle: 'GRAPHIC TEE — BLACK',
    category: 'TSHIRT',
    fit_type: 'normal',
    desc: "Graphic tee dengan illustrasi 'Trio Komodores' — tribute ke fauna Indonesia. Soft heavyweight cotton.",
    price: 25,
    original_price: null,
    tag: 'NEW',
    primary_image: '/assets/v4/tshirt-grid.jpeg',
    slug: 'trio-komodores',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 3,
    name: 'Elle the Elephant',
    subtitle: 'BACK PRINT TEE — GREY',
    category: 'TSHIRT',
    fit_type: 'oversized',
    desc: 'Tee abu dengan POV back print storytelling. Vintage washed look, fabric breathable untuk daily wear.',
    price: 28,
    original_price: 35,
    tag: 'LIMITED',
    primary_image: '/assets/v4/tshirt-grid.jpeg',
    slug: 'elle-the-elephant',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 4,
    name: '"Einkaufen 101"',
    subtitle: 'HEAVY CANVAS TOTE — BLUE PRINT',
    category: 'TOTEBAG',
    fit_type: null,
    desc: "Tote canvas 400gsm dengan blue print 'Einkaufen 101'. Tribute ke kehidupan supermarket di Jerman.",
    price: 18,
    original_price: null,
    tag: 'NEW',
    primary_image: '/assets/v4/totebag-grid.jpeg',
    slug: 'einkaufen-101',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 5,
    name: '"Mit Karte Bitte"',
    subtitle: 'HEAVY CANVAS TOTE — GREEN PRINT',
    category: 'TOTEBAG',
    fit_type: null,
    desc: "Tote canvas dengan green print 'Mit Karte Bitte!' — humor klasik tentang pembayaran kartu di Jerman.",
    price: 18,
    original_price: null,
    tag: 'BESTSELLER',
    primary_image: '/assets/v4/totebag-grid.jpeg',
    slug: 'mit-karte-bitte',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
]

export function getProductById(id: number): Product | null {
  return PRODUCTS.find(p => p.id === id) ?? null
}

export function getProductBySlug(slug: string): Product | null {
  return PRODUCTS.find(p => p.slug === slug) ?? null
}

export function getProductByType(category: Product['category']): Product | null {
  return PRODUCTS.find(p => p.category === category) ?? null
}

export function getProductPrimaryImage(id: number): string | null{
  return PRODUCTS.find(p => p.id === id)?.primary_image ?? null
}