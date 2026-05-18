'use client';

import { getOrderWithDetails } from '@/data/mockup/orders';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function OrderDetailPage() {
  const { id } = useParams();
  const order = getOrderWithDetails(Number(id));

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 16 }}>ORDER NOT FOUND</h2>
        <Link href="/account/orders" style={{ textDecoration: 'underline', color: 'var(--black)' }}>Back to orders</Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, marginBottom: 40 }}>
        <Link href="/account/orders" style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', textDecoration: 'none' }}>
          ← BACK
        </Link>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: '0.02em' }}>
          ORDER #{order.id}
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {/* Items Section */}
          <section>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20, borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
              ORDERED ITEMS
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {order.items.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: 20, background: 'var(--cream-2)', padding: 16 }}>
                  <div style={{ width: 80, height: 100, background: 'white', position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
                    {item.product?.primary_image ? (
                      <img 
                        src={item.product.primary_image} 
                        alt={item.product.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--muted)', textAlign: 'center' }}>
                        {item.bundle?.name || 'BUNDLE'}
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                      {item.product?.name || item.bundle?.name}
                    </h4>
                    <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
                      {item.variant ? `${item.variant.color_name} / ${item.variant.size}` : 'Bundle Offer'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 14 }}>Qty: {item.quantity}</span>
                      <span style={{ fontSize: 16, fontWeight: 700 }}>€{(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Timeline Section */}
          <section>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24, borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
              STATUS TIMELINE
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, paddingLeft: 20 }}>
              {order.logs.map((log, idx) => (
                <div key={idx} style={{ position: 'relative', paddingBottom: 32, paddingLeft: 30, borderLeft: idx === order.logs.length - 1 ? 'none' : '2px solid var(--black)' }}>
                  <div style={{ 
                    position: 'absolute', 
                    left: -7, 
                    top: 0, 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    background: 'var(--black)',
                    border: '2px solid var(--cream)'
                  }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase' }}>{log.status}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(log.created_at).toLocaleDateString()}</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--ink)' }}>{log.note}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {/* Address Section */}
          <section style={{ background: 'var(--black)', color: 'var(--cream)', padding: 32 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20, opacity: 0.6 }}>
              {order.delivery_type === 'PICKUP' ? 'PICKUP LOCATION' : 'DELIVERY ADDRESS'}
            </h3>
            <p style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.6 }}>
              {order.delivery_address || 'Self-Pickup at PPIJ Office'}
            </p>
          </section>

          {/* Summary Section */}
          <section style={{ background: 'var(--cream-2)', padding: 32 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20, borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
              ORDER SUMMARY
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span>Subtotal</span>
                <span>€{order.total_price.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span>Shipping</span>
                <span>{order.delivery_type === 'PICKUP' ? 'FREE' : 'EXCL.'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, marginTop: 12, borderTop: '2px solid var(--black)', paddingTop: 12 }}>
                <span>TOTAL</span>
                <span>€{order.total_price.toFixed(2)}</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
