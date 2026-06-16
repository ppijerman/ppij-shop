'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import ProductCrop from '@/components/product/ProductCrop';
import { createOrder, getShippingOptionsAction } from '@/lib/actions/orders';
import { getPaymentInstruction } from '@/lib/payment';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants';

import type { ShippingOption } from '@/lib/actions/orders';

type DeliveryType = 'PICKUP' | 'DELIVERY';

export default function CartView() {
  const { cart, updateCart, removeFromCart, refreshCart, total, loading, error } = useCart();
  const { showToast } = useToast();
  const router = useRouter();
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('PICKUP');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [legalError, setLegalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [country, setCountry] = useState('DE');
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const paymentInstruction = getPaymentInstruction('IBAN');
  const isDisabled = submitting || loading || shippingLoading || (deliveryType === 'DELIVERY' && shippingOptions.length === 0);

  async function handleCheckout(formData: FormData) {
    setSubmitting(true);
    setCheckoutError(null);
    setLegalError(null);
    try {
      if (!legalAccepted) {
        setLegalError('Please agree to the legal terms and policies before placing your order.');
        return;
      }

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

  const fetchSeqRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchShippingOptions = useCallback(async (toCountry: string) => {
    if (!toCountry.trim()) return;
    const seq = ++fetchSeqRef.current;
    setShippingLoading(true);
    setShippingError(null);
    try {
      const result = await getShippingOptionsAction(toCountry);
      if (seq !== fetchSeqRef.current) return;
      if (result.ok) {
        setShippingOptions(result.options);
        setSelectedMethodId(result.options[0]?.methodId ?? null);
      } else {
        setShippingOptions([]);
        setSelectedMethodId(null);
        setShippingError(result.message);
      }
    } catch {
      if (seq !== fetchSeqRef.current) return;
      setShippingOptions([]);
      setSelectedMethodId(null);
      setShippingError('Failed to fetch shipping options');
    } finally {
      if (seq === fetchSeqRef.current) setShippingLoading(false);
    }
  }, []);

  const fetchShippingOptionsDebounced = useCallback((toCountry: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void fetchShippingOptions(toCountry), 400);
  }, [fetchShippingOptions]);

  return (
    <section className="r-pad-x" style={{ background: 'var(--cream)', minHeight: '80vh', padding: '60px 28px 80px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <Link href="/catalog" style={{ textDecoration: 'none', display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 28 }}>← lanjut belanja</Link>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', paddingBottom: 20, borderBottom: '1px solid var(--line)', marginBottom: 36 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(56px, 7.5vw, 96px)', color: 'var(--black)', letterSpacing: '0.01em' }}>YOUR CART<span style={{ color: 'var(--accent)' }}>.</span></h1>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--muted)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
        </div>

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(56px, 14vw, 80px)', color: 'var(--cream-2)', marginBottom: 14 }}>EMPTY.</div>
            <p style={{ color: 'var(--muted)', marginBottom: 24, fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase' }}>{loading ? 'loading cart' : 'keranjang anda kosong'}</p>
            {error && <p style={{ color: '#b91c1c', marginBottom: 18, fontSize: 13 }}>{error}</p>}
            <Link href="/catalog" style={{ textDecoration: 'none', display: 'inline-block', background: 'var(--black)', color: 'var(--cream)', padding: '14px 28px', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase' }}>shop now ↗</Link>
          </div>
        ) : (
          <form action={handleCheckout} className="cart-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 50, alignItems: 'start' }}>
            <input type="hidden" name="deliveryType" value={deliveryType} />
            <input type="hidden" name="paymentMethod" value="IBAN" />
            <input type="hidden" name="shippingMethodId" value={deliveryType === 'DELIVERY' ? (selectedMethodId ?? '') : ''} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div>
                {cart.map(item => {
                  const atStockLimit = item.qty >= item.stock;
                  const isSoldOut = item.stock <= 0;

                  return (
                  <div key={item.cartId} className="cart-item" style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '18px 0', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ width: 84, height: 84, background: 'var(--cream-2)', flexShrink: 0, overflow: 'hidden' }}>
                      <ProductCrop src={item.image} height={84} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.22em', color: 'var(--muted)', textTransform: 'uppercase' }}>{item.category}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--black)', marginTop: 4 }}>{item.name.toUpperCase()}</div>
                      {!item.bundleId && (
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
                          {item.color?.name} · size {item.size} {item.fit_type && `· fit ${item.fit_type}`}
                        </div>
                      )}
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: isSoldOut ? '#b91c1c' : 'var(--muted)', marginTop: 5, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                        {isSoldOut ? 'sold out' : `${item.stock} available`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: 999 }}>
                      <button type="button" disabled={loading} onClick={() => void handleCartChange(() => updateCart(item.cartId, -1))} style={{ width: 32, height: 32, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>−</button>
                      <span style={{ width: 30, fontFamily: 'var(--font-mono)', fontSize: 13, textAlign: 'center' }}>{item.qty}</span>
                      <button type="button" disabled={loading || atStockLimit || isSoldOut} onClick={() => void handleCartChange(() => updateCart(item.cartId, 1))} style={{ width: 32, height: 32, background: 'none', border: 'none', cursor: loading || atStockLimit || isSoldOut ? 'not-allowed' : 'pointer', fontSize: 14, color: atStockLimit || isSoldOut ? 'var(--muted)' : 'var(--black)', opacity: atStockLimit || isSoldOut ? 0.45 : 1 }}>+</button>
                    </div>
                    <div style={{ minWidth: 80, textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>€{(item.price * item.qty).toFixed(2)}</div>
                      <button type="button" disabled={loading} onClick={() => void handleCartChange(() => removeFromCart(item.cartId))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 4 }}>remove</button>
                    </div>
                  </div>
                  );
                })}
              </div>

              <section style={{ borderTop: '1px solid var(--line)', paddingTop: 28 }}>
                <h2 style={sectionTitleStyle}>FULFILLMENT</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                  <ChoiceButton active={deliveryType === 'PICKUP'} onClick={() => {
                    setDeliveryType('PICKUP');
                    setShippingOptions([]);
                    setSelectedMethodId(null);
                    setShippingError(null);
                  }} label="Pickup" />
                  <ChoiceButton active={deliveryType === 'DELIVERY'} onClick={() => {
                    setDeliveryType('DELIVERY');
                    void fetchShippingOptions(country);
                  }} label="Delivery" />
                </div>

                {deliveryType === 'DELIVERY' ? (
                  <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <TextField name="street" label="Street" maxLength={100} />
                    <TextField name="city" label="City" maxLength={100} />
                    <TextField name="postcode" label="Postcode" maxLength={5} pattern="\d{5}" inputMode="numeric" />
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Country</span>
                      <select
                        name="country"
                        value={country}
                        onChange={(e) => {
                          setCountry(e.target.value);
                          fetchShippingOptionsDebounced(e.target.value);
                        }}
                        style={{ border: '1px solid var(--line)', background: 'white', padding: '12px', fontSize: 14 }}
                      >
                        <option value="DE">Germany</option>
                      </select>
                    </label>
                  </div>

                  <div style={{ marginTop: 18 }}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>Shipping method</p>
                    {shippingLoading && (
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.12em' }}>
                        Loading...
                      </p>
                    )}
                    {shippingError && (
                      <p style={{ fontSize: 13, color: '#b91c1c' }}>
                        {shippingError}
                      </p>
                    )}
                    {!shippingLoading && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {shippingOptions.map((option) => {
                          const selected = selectedMethodId === option.methodId;
                          const isFree = total >= FREE_SHIPPING_THRESHOLD;
                          return (
                            <label
                              key={option.methodId}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '14px 16px',
                                border: selected ? '1.5px solid var(--black)' : '1px solid var(--line)',
                                background: selected ? 'var(--cream-2)' : 'white',
                                cursor: 'pointer',
                                borderRadius: 8,
                                transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
                                boxShadow: selected ? '0 2px 10px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
                              }}
                            >
                              <input
                                type="radio"
                                name="_shippingOption"
                                value={option.methodId}
                                checked={selected}
                                onChange={() => setSelectedMethodId(option.methodId)}
                                style={{ display: 'none' }}
                              />
                              <span style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <span style={{
                                  width: 18, height: 18, borderRadius: '50%',
                                  border: selected ? '5px solid var(--black)' : '1.5px solid #ccc',
                                  flexShrink: 0,
                                  transition: 'border 0.15s',
                                  background: 'white',
                                }} />
                                <span>
                                  <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--black)', letterSpacing: '-0.01em' }}>
                                    {option.name.replace(/\s*\d+(\.\d+)?-\d+(\.\d+)?kg.*$/i, '').trim()}
                                  </span>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                      {option.carrier}
                                    </span>
                                    {option.leadTimeHours != null && (
                                      <>
                                        <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--muted)', display: 'inline-block', flexShrink: 0 }} />
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)' }}>
                                          {option.leadTimeHours <= 24
                                            ? '1 business day'
                                            : option.leadTimeHours <= 48
                                            ? '1–2 business days'
                                            : `${Math.ceil(option.leadTimeHours / 24)} business days`}
                                        </span>
                                      </>
                                    )}
                                  </span>
                                </span>
                              </span>
                              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                                {isFree ? (
                                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#aaa', textDecoration: 'line-through' }}>
                                      €{(option.costCents / 100).toFixed(2)}
                                    </span>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: '#16a34a', letterSpacing: '0.04em' }}>FREE</span>
                                  </span>
                                ) : (
                                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--black)', letterSpacing: '0.04em' }}>
                                    €{(option.costCents / 100).toFixed(2)}
                                  </span>
                                )}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  </>
                ) : (
                  <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
                    Pickup details will be confirmed by the PPIJ team after your payment proof is reviewed.
                  </p>
                )}
              </section>

              <section style={{ borderTop: '1px solid var(--line)', paddingTop: 28 }}>
                <h2 style={sectionTitleStyle}>PAYMENT</h2>
                <div style={{ background: 'rgba(255,255,255,0.42)', padding: 20, border: '1px solid var(--line)' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: '0.02em', marginBottom: 10 }}>{paymentInstruction.title.toUpperCase()}</div>
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
                </div>
              </section>
            </div>

            <div className="cart-summary" style={{ background: 'var(--black)', color: 'var(--cream)', padding: 24, position: 'sticky', top: 86 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 18 }}>SUMMARY<span style={{ color: 'var(--accent)' }}>.</span></div>
              {(() => {
                const selectedOption = shippingOptions.find(o => o.methodId === selectedMethodId);
                const isFreeShipping = deliveryType === 'DELIVERY' && total >= FREE_SHIPPING_THRESHOLD;
                const shippingCostCents = (deliveryType !== 'DELIVERY' || isFreeShipping) ? 0 : (selectedOption?.costCents ?? 0);
                const grandTotal = total + shippingCostCents / 100;
                const remaining = FREE_SHIPPING_THRESHOLD - total;
                return (
                  <>
                    {deliveryType === 'DELIVERY' && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: isFreeShipping ? '#7CD992' : 'rgba(239,234,224,0.5)', textTransform: 'uppercase' }}>
                            {isFreeShipping ? '✓ Free shipping' : 'Free shipping at €49'}
                          </span>
                          {!isFreeShipping && (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(239,234,224,0.5)' }}>
                              €{remaining.toFixed(2)} away
                            </span>
                          )}
                        </div>
                        <div style={{ height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            borderRadius: 999,
                            background: isFreeShipping ? '#7CD992' : 'var(--accent)',
                            width: `${Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100)}%`,
                            transition: 'width 0.3s ease',
                          }} />
                        </div>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(239,234,224,0.6)', marginBottom: 8 }}>
                      <span>SUBTOTAL</span><span style={{ color: 'var(--cream)' }}>€{total.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(239,234,224,0.6)' }}>
                      <span>SHIPPING</span>
                      <span style={{ color: (deliveryType === 'PICKUP' || isFreeShipping) ? '#7CD992' : 'var(--cream)' }}>
                        {deliveryType === 'PICKUP' ? 'FREE' : isFreeShipping ? 'FREE' : shippingLoading ? '...' : `€${(shippingCostCents / 100).toFixed(2)}`}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontSize: 24, marginTop: 14, paddingTop: 14, borderTop: '1px solid #222' }}>
                      <span>TOTAL</span><span style={{ color: '#fff' }}>€{grandTotal.toFixed(2)}</span>
                    </div>
                    <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid #222' }}>
                      <p style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(239,234,224,0.72)', marginBottom: 14 }}>
                        Orders cannot be cancelled once payment has been made. Please ensure all order details are correct before proceeding.
                      </p>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={legalAccepted}
                          onChange={(event) => {
                            setLegalAccepted(event.target.checked);
                            if (event.target.checked) {
                              setLegalError(null);
                            }
                          }}
                          style={{
                            marginTop: 3,
                            width: 16,
                            height: 16,
                            flexShrink: 0,
                            cursor: 'pointer',
                            accentColor: 'var(--accent)',
                          }}
                        />
                        <span style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(239,234,224,0.72)' }}>
                          I agree to the <LegalLink href="/terms">Terms & Conditions</LegalLink>, <LegalLink href="/shipping">Shipping Policy</LegalLink>, and <LegalLink href="/returns">Return Policy</LegalLink> of PPI Jerman, and confirm that I have read the <LegalLink href="/datenschutz">Privacy Policy</LegalLink>.
                        </span>
                      </label>
                      {legalError && (
                        <div style={{ background: '#fee2e2', color: '#991b1b', padding: 10, marginTop: 12, fontSize: 12, lineHeight: 1.5 }}>
                          {legalError}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
              {(checkoutError || error) && (
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: 12, marginTop: 16, fontSize: 12, lineHeight: 1.5 }}>
                  {checkoutError ?? error}
                </div>
              )}
              <button disabled={isDisabled} type="submit" style={{ width: '100%', background: isDisabled ? 'var(--muted)' : 'var(--accent)', color: '#fff', border: 'none', padding: '18px 24px', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', cursor: isDisabled ? 'not-allowed' : 'pointer', marginTop: 18, borderRadius: 999, fontWeight: 600 }}>
                {submitting ? 'creating order...' : 'place order ↗'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

function LegalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{ color: 'var(--cream)', fontWeight: 700, textDecoration: 'none', borderBottom: '1px solid rgba(239,234,224,0.72)' }}>
      {children}
    </Link>
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

function TextField({ name, label, defaultValue = '', maxLength, pattern, inputMode }: {
  name: string;
  label: string;
  defaultValue?: string;
  maxLength?: number;
  pattern?: string;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</span>
      <input name={name} defaultValue={defaultValue} maxLength={maxLength} pattern={pattern} inputMode={inputMode} style={{ border: '1px solid var(--line)', background: 'white', padding: '12px', fontSize: 14 }} />
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
