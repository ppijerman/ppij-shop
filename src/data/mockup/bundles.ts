import { getProductById } from "./products"
import { getVariantById } from "./variants"
 
export interface Bundle {
  id: number
  name: string
  desc: string
  price: number
  original_price: number | null
  slug: string
  created_at: string
  updated_at: string | null
}

export interface BundleItem {
  id: number
  bundle_id: number
  variant_id: number
}

export const BUNDLES: Bundle[] = [
  {
    id: 1,
    name: 'Classic Bundle',
    desc: 'Totebag + Normal Fit T-Shirt — the everyday essential combo.',
    price: 38,
    original_price: 43,
    slug: 'classic-bundle',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Oversized Bundle',
    desc: 'Totebag + Oversized T-Shirt — relaxed fit, full statement.',
    price: 40,
    original_price: 46,
    slug: 'oversized-bundle',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
]

export const BUNDLE_ITEMS: BundleItem[] = [
  // Classic Bundle: Einkaufen 101 Tote + Trio Komodores Normal Fit
  { id: 1, bundle_id: 1, variant_id: 29 }, // Einkaufen 101 ONE SIZE
  { id: 2, bundle_id: 1, variant_id: 12 }, // Trio Komodores M Black (Normal Fit)

  // Oversized Bundle: Mit Karte Bitte Tote + Fang & Horn Oversized
  { id: 3, bundle_id: 2, variant_id: 30 }, // Mit Karte Bitte ONE SIZE
  { id: 4, bundle_id: 2, variant_id: 2  }, // Fang & Horn M White (Oversized)
]

export function getBundleById(id: number): Bundle | null {
  return BUNDLES.find(b => b.id === id) ?? null
}

export function getBundleBySlug(slug: string): Bundle | null {
  return BUNDLES.find(b => b.slug === slug) ?? null
}

export function getBundleByItems(bundleId: number) {
  const bundle = getBundleById(bundleId)
  if (!bundle) return null
  
  const items = BUNDLE_ITEMS
    .filter(bi => bi.bundle_id === bundleId)
    .map(bi => {
      const variant = getVariantById(bi.variant_id)
      const product = variant ? getProductById(variant.product_id) : null
      return { ...bi, variant, product}
    })

    return { ...bundle, items }
}

export function getAllBundlesWithItems() {
  return BUNDLES.map(b => getBundleByItems(b.id))
}