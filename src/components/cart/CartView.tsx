'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import ProductCrop from '@/components/product/ProductCrop';
import { createOrder } from '@/lib/actions/orders';
import { getPaymentInstruction } from '@/lib/payment';
import type { PaymentMethod } from '@/types';

type DeliveryType = 'PICKUP' | 'DELIVERY';

export default function CartView() {
  const { cart, updateCart, removeFromCart, refreshCart, total, loading, error } = useCart();
  const { showToast } = useToast();
  const router = useRouter();
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('PICKUP');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PAYPAL');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const paymentInstruction = useMemo(() => getPaymentInstruction(paymentMethod), [paymentMethod]);

  async function handleCheckout(formData: FormData) {
    setSubmitting(true);
    setCheckoutError(null);
    try {
      const result = await createOrder(formData);
      if (!result.ok) {
        const details = result.items?.length ? ` (${result.items.join(', ')})` : '';
        setCheckoutError(`${result.message}${details}`);
        return;
      }

      await refreshCart();
      showToast('Order created. Upload your payment proof next.');
      router.push(`/account/orders/${result.orderId}`);
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Checkout failed.');
    } finally {
      setSubmitting(false);
    }
  }

  const handleCartChange = async (action: () => Promise<void>) => {
    try {
      await action();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Cart update failed');
    }
  };

  return (
    <section style={{ background: 'var(--cream)', minHeight: '80vh', padding: '60px 28px 80px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <Link href="/catalog" style={{ textDecoration: 'none', display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 28 }}>← lanjut belanja</Link>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', paddingBottom: 20, borderBottom: '1px solid var(--line)', marginBottom: 36 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(56px, 7.5vw, 96px)', color: 'var(--black)', letterSpacing: '0.01em' }}>YOUR CART<span style={{ color: 'var(--orange)' }}>.</span></h1>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--muted)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
        </div>

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 80, color: 'var(--cream-2)', marginBottom: 14 }}>EMPTY.</div>
            <p style={{ color: 'var(--muted)', marginBottom: 24, fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase' }}>{loading ? 'loading cart' : 'keranjang anda kosong'}</p>
            {error && <p style={{ color: '#b91c1c', marginBottom: 18, fontSize: 13 }}>{error}</p>}
            <Link href="/catalog" style={{ textDecoration: 'none', display: 'inline-block', background: 'var(--black)', color: 'var(--cream)', padding: '14px 28px', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase' }}>shop now ↗</Link>
          </div>
        ) : (
          <form action={handleCheckout} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 50, alignItems: 'start' }}>
            <input type="hidden" name="deliveryType" value={deliveryType} />
            <input type="hidden" name="paymentMethod" value={paymentMethod} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div>
                {cart.map(item => (
                  <div key={item.cartId} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '18px 0', borderBottom: '1px solid var(--line)' }}>
                    {!item.bundleId && (
                      <div style={{ width: 84, height: 84, background: 'var(--cream-2)', flexShrink: 0, overflow: 'hidden' }}>
                        <ProductCrop src={item.image} height={84} scale={2.4} />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.22em', color: 'var(--muted)', textTransform: 'uppercase' }}>{item.category}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--black)', marginTop: 4 }}>{item.name.toUpperCase()}</div>
                      {!item.bundleId && (
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>{item.color?.name} · size {item.size}</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: 999 }}>
                      <button type="button" disabled={loading} onClick={() => void handleCartChange(() => updateCart(item.cartId, -1))} style={{ width: 32, height: 32, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>−</button>
                      <span style={{ width: 30, fontFamily: 'var(--font-mono)', fontSize: 13, textAlign: 'center' }}>{item.qty}</span>
                      <button type="button" disabled={loading} onClick={() => void handleCartChange(() => updateCart(item.cartId, 1))} style={{ width: 32, height: 32, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>+</button>
                    </div>
                    <div style={{ minWidth: 80, textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>€{(item.price * item.qty).toFixed(2)}</div>
                      <button type="button" disabled={loading} onClick={() => void handleCartChange(() => removeFromCart(item.cartId))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 4 }}>remove</button>
                    </div>
                  </div>
                ))}
              </div>

              <section style={{ borderTop: '1px solid var(--line)', paddingTop: 28 }}>
                <h2 style={sectionTitleStyle}>FULFILLMENT</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                  <ChoiceButton active={deliveryType === 'PICKUP'} onClick={() => setDeliveryType('PICKUP')} label="Pickup" />
                  <ChoiceButton active={deliveryType === 'DELIVERY'} onClick={() => setDeliveryType('DELIVERY')} label="Delivery" />
                </div>

                {deliveryType === 'DELIVERY' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <TextField name="street" label="Street" />
                    <TextField name="city" label="City" />
                    <TextField name="postcode" label="Postcode" />
                    <TextField name="country" label="Country" defaultValue="Germany" />
                  </div>
                ) : (
                  <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
                    Pickup details will be confirmed by the PPIJ team after your payment proof is reviewed.
                  </p>
                )}
              </section>

              <section style={{ borderTop: '1px solid var(--line)', paddingTop: 28 }}>
                <h2 style={sectionTitleStyle}>PAYMENT METHOD</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                  <ChoiceButton active={paymentMethod === 'PAYPAL'} onClick={() => setPaymentMethod('PAYPAL')} label="PayPal" />
                  <ChoiceButton active={paymentMethod === 'IBAN'} onClick={() => setPaymentMethod('IBAN')} label="IBAN" />
                </div>
                <div style={{ background: 'var(--cream-2)', padding: 18, border: '1px solid var(--line)' }}>
                  <div style={{ fontWeight: 800, marginBottom: 8 }}>{paymentInstruction.title}</div>
                  {paymentInstruction.lines.map((line) => (
                    <p key={line} style={{ color: 'var(--ink)', fontSize: 13, lineHeight: 1.55, marginBottom: 4 }}>{line}</p>
                  ))}
                </div>
              </section>
            </div>

            <div style={{ background: 'var(--black)', color: 'var(--cream)', padding: 24, position: 'sticky', top: 86 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 18 }}>SUMMARY<span style={{ color: 'var(--orange)' }}>.</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(239,234,224,0.6)', marginBottom: 8 }}>
                <span>SUBTOTAL</span><span style={{ color: 'var(--cream)' }}>€{total.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(239,234,224,0.6)' }}>
                <span>SHIPPING</span><span style={{ color: '#7CD992' }}>FREE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontSize: 24, marginTop: 14, paddingTop: 14, borderTop: '1px solid #222' }}>
                <span>TOTAL</span><span style={{ color: 'var(--orange)' }}>€{total.toFixed(2)}</span>
              </div>
              {(checkoutError || error) && (
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: 12, marginTop: 16, fontSize: 12, lineHeight: 1.5 }}>
                  {checkoutError ?? error}
                </div>
              )}
              <button disabled={submitting || loading} type="submit" style={{ width: '100%', background: submitting || loading ? 'var(--muted)' : 'var(--orange)', color: 'var(--black)', border: 'none', padding: '15px', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', cursor: submitting || loading ? 'not-allowed' : 'pointer', marginTop: 18, borderRadius: 999, fontWeight: 600 }}>
                {submitting ? 'creating order...' : 'place order ↗'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

function ChoiceButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '13px 14px',
        border: active ? '2px solid var(--black)' : '1px solid var(--line)',
        background: active ? 'var(--black)' : 'transparent',
        color: active ? 'var(--cream)' : 'var(--black)',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

function TextField({ name, label, defaultValue = '' }: { name: string; label: string; defaultValue?: string }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</span>
      <input name={name} defaultValue={defaultValue} style={{ border: '1px solid var(--line)', background: 'white', padding: '12px', fontSize: 14 }} />
    </label>
  );
}

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  marginBottom: 14,
  color: 'var(--muted)',
};
