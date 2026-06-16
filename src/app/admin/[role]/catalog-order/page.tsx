import { getAllProductsWithVariantsAdmin } from '@/lib/dal/products';
import { getAllBundlesAdmin } from '@/lib/dal/bundles';
import CatalogOrderManager from '@/components/admin/CatalogOrderManager';

export default async function CatalogOrderPage() {
  const [products, bundles] = await Promise.all([
    getAllProductsWithVariantsAdmin(),
    getAllBundlesAdmin(),
  ]);

  products.sort((a: any, b: any) => a.display_order - b.display_order);
  bundles.sort((a: any, b: any) => a.display_order - b.display_order);

  return (
    <div>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48 }}>CATALOG ORDER</h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', marginTop: 8, letterSpacing: '0.05em' }}>
          DRAG TO REORDER · CHANGES APPLY TO THE PUBLIC CATALOG
        </p>
      </div>
      <CatalogOrderManager products={products} bundles={bundles} />
    </div>
  );
}
