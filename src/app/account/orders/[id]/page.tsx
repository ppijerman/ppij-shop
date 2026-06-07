import { getOrderByIdForUser, getOrderItems } from '@/lib/dal/orders';
import { getCurrentDbUserOrThrow } from '@/lib/users';
import { getPaymentInstruction } from '@/lib/payment';
import { getOrderStatusLabel } from '@/lib/orderStatus';
import PaymentProofUploadForm from '@/components/account/PaymentProofUploadForm';
import PaymentProofPreviewButton from '@/components/account/PaymentProofPreviewButton';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentDbUserOrThrow();
  const order = await getOrderByIdForUser(id, user.id);

  if (!order) notFound();
  const items = await getOrderItems(id);
  const buyerName = [user.first_name, user.last_name].filter(Boolean).join(' ');
  const paymentInstruction = getPaymentInstruction(order.payment_method, order.id.substring(0, 8), buyerName);

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
            <h3 style={sectionHeadingStyle}>ORDERED ITEMS</h3>
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

          <section>
            <h3 style={sectionHeadingStyle}>PAYMENT</h3>
            <div style={{ background: 'var(--cream-2)', padding: 24, border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 5 }}>Method</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: '0.02em' }}>{paymentInstruction.title.toUpperCase()}</p>
                </div>
                <span style={{ alignSelf: 'start', background: 'var(--black)', color: 'var(--cream)', padding: '5px 9px', borderRadius: 4, fontSize: 10, fontWeight: 800 }}>
                  {getOrderStatusLabel(order.status)}
                </span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--ink)', marginBottom: 12 }}>{paymentInstruction.intro}</p>
              <div style={{ display: 'grid', gap: 7 }}>
                {paymentInstruction.details.map((detail) => (
                  <div key={detail.label} style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 12, alignItems: 'baseline' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>{detail.label}</span>
                    <span style={{ fontSize: 14, fontWeight: detail.strong ? 800 : 500, color: 'var(--black)', wordBreak: 'break-word' }}>{detail.value}</span>
                  </div>
                ))}
              </div>
              <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6, marginTop: 14 }}>{paymentInstruction.note}</p>

              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 18, marginTop: 18 }}>
                {order.status === 'AWAITING_PAYMENT' ? (
                  <PaymentProofUploadForm orderId={order.id} />
                ) : order.status === 'PAYMENT_REVIEW' ? (
                  <p style={{ fontSize: 13, color: 'var(--muted)' }}>Payment proof uploaded. Waiting for admin review.</p>
                ) : (
                  <p style={{ fontSize: 13, color: 'var(--muted)' }}>Payment review is complete or no longer editable.</p>
                )}
                {order.payment_proof_url && (
                  <PaymentProofPreviewButton proofUrl={order.payment_proof_url} orderId={order.id} />
                )}
              </div>
            </div>
          </section>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          <section style={{ background: 'var(--black)', color: 'var(--cream)', padding: 32 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20, opacity: 0.6 }}>
              {order.delivery_type === 'PICKUP' ? 'PICKUP LOCATION' : 'DELIVERY ADDRESS'}
            </h3>
            {order.delivery_type === 'PICKUP' ? (
              <p style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {order.pickup_details ?? 'Pickup details will be confirmed after payment review.'}
              </p>
            ) : (
              <div style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.6 }}>
                <p>{order.delivery_address?.street}</p>
                <p>{order.delivery_address?.postcode} {order.delivery_address?.city}</p>
                <p>{order.delivery_address?.country}</p>
              </div>
            )}
            {(order.shipping_provider || order.shipping_tracking_number) && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: 22, paddingTop: 18 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, opacity: 0.6 }}>
                  SHIPPING
                </p>
                {order.shipping_provider && (
                  <p style={{ fontSize: 14, fontWeight: 500, opacity: 0.75, marginBottom: 4 }}>
                    {order.shipping_provider}
                  </p>
                )}
                <p style={{ fontSize: 16, fontWeight: 700, wordBreak: 'break-word' }}>
                  {order.shipping_tracking_number}
                </p>
              </div>
            )}
          </section>

          <section style={{ background: 'var(--cream-2)', padding: 32 }}>
            <h3 style={sectionHeadingStyle}>ORDER SUMMARY</h3>
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

const sectionHeadingStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: 20,
  borderBottom: '1px solid var(--line)',
  paddingBottom: 10,
};
