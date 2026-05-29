import { getAllProductsWithVariants } from '@/lib/dal/products';
import Link from 'next/link';
import ProductList from '@/components/admin/ProductList';

export default async function AdminProducts({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  const products = await getAllProductsWithVariants();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48 }}>PRODUCTS</h1>
        <Link 
          href={`/admin/${role}/products/new`}
          style={{
            padding: '12px 24px',
            background: 'var(--black)',
            color: 'var(--cream)',
            textDecoration: 'none',
            borderRadius: 999,
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            letterSpacing: '0.1em',
            fontWeight: 600
          }}
        >
          + ADD NEW PRODUCT
        </Link>
      </div>

      <ProductList initialProducts={products} />
    </div>
  );
}
