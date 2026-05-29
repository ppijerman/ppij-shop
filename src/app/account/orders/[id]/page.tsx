import { getOrderById, getOrderItems } from '@/lib/dal/orders';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const order = await getOrderById(id);
  
  if (!order) notFound();
  const items = await getOrderItems(id);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, marginBottom: 40 }}>
        <Link href="/account/orders" style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', textDecoration: 'none' }}>
          ← BACK
        </Link>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: '0.02em' }}>
          ORDER #{order.id.substring(0, 8)}
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          <section>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20, borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
              ORDERED ITEMS
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {items.map((item: any) => (
                <div key={item.id} style={{ display: 'flex', gap: 20, background: 'var(--cream-2)', padding: 16 }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                      {item.product_name_snapshot}
                    </h4>
                    <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
                      SKU: {item.sku_snapshot}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 14 }}>Qty: {item.quantity}</span>
                      <span style={{ fontSize: 16, fontWeight: 700 }}>€{Number(item.price_at_purchase).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          <section style={{ background: 'var(--black)', color: 'var(--cream)', padding: 32 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20, opacity: 0.6 }}>
              {order.delivery_type === 'PICKUP' ? 'PICKUP LOCATION' : 'DELIVERY ADDRESS'}
            </h3>
            <div style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.6 }}>
                {order.delivery_type === 'PICKUP' ? (
                  <div>
                    <p style={infoValue}>U-Bahn Tierpark, Berlin</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <p style={infoLabel}>Street</p>
                      <p style={infoValue}>{order.delivery_address?.street ?? '—'}</p>
                    </div>
                    <div>
                      <p style={infoLabel}>City</p>
                      <p style={infoValue}>{order.delivery_address?.city ?? '—'}</p>
                    </div>
                    <div>
                      <p style={infoLabel}>Postcode</p>
                      <p style={infoValue}>{order.delivery_address?.postcode ?? '—'}</p>
                    </div>
                    <div>
                      <p style={infoLabel}>Country</p>
                      <p style={infoValue}>{order.delivery_address?.country ?? '—'}</p>
                    </div>
                  </>
                )}
            </div>
          </section>

          <section style={{ background: 'var(--cream-2)', padding: 32 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20, borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
              ORDER SUMMARY
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span>Subtotal</span>
                <span>€{Number(order.total_price).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, marginTop: 12, borderTop: '2px solid var(--black)', paddingTop: 12 }}>
                <span>TOTAL</span>
                <span>€{Number(order.total_price).toFixed(2)}</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

const infoLabel: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 };
const infoValue: React.CSSProperties = { fontSize: 15, marginBottom: 16, fontWeight: 500 };