'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import ProductCrop from '@/components/product/ProductCrop';

function getImgSrc(primaryImg: string) {
  return primaryImg === 'tshirt_grid' ? '/assets/v4/tshirt-grid.jpeg' : '/assets/v4/totebag-grid.jpeg';
}

export default function CartView() {
  const { cart, updateCart, removeFromCart, total } = useCart();
  const { showToast } = useToast();

  const handleCheckout = () => showToast('✦ checkout coming soon');

  return (
    <section style={{ background: 'var(--cream)', minHeight: '80vh', padding: '60px 28px 80px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Link href="/catalog" style={{ textDecoration: 'none', display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 28 }}>← lanjut belanja</Link>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', paddingBottom: 20, borderBottom: '1px solid var(--line)', marginBottom: 36 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(56px, 7.5vw, 96px)', color: 'var(--black)', letterSpacing: '0.01em' }}>YOUR CART<span style={{ color: 'var(--orange)' }}>.</span></h1>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--muted)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
        </div>

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 80, color: 'var(--cream-2)', marginBottom: 14 }}>EMPTY.</div>
            <p style={{ color: 'var(--muted)', marginBottom: 24, fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase' }}>keranjang anda kosong</p>
            <Link href="/catalog" style={{ textDecoration: 'none', display: 'inline-block', background: 'var(--black)', color: 'var(--cream)', padding: '14px 28px', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase' }}>shop now ↗</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 50, alignItems: 'start' }}>
            <div>
              {cart.map(item => {
                const imgSrc = getImgSrc(item.primaryImg);
                return (
                  <div key={item.cartId} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '18px 0', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ width: 84, height: 84, background: 'var(--cream-2)', flexShrink: 0, overflow: 'hidden' }}>
                      <ProductCrop src={imgSrc} pos={item.featurePos} height={84} scale={2.4} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.22em', color: 'var(--muted)', textTransform: 'uppercase' }}>No. {item.no} · {item.category}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--black)', marginTop: 4 }}>{item.name.toUpperCase()}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>{item.color?.name} · size {item.size}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: 999 }}>
                      <button onClick={() => updateCart(item.cartId, -1)} style={{ width: 32, height: 32, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>−</button>
                      <span style={{ width: 30, fontFamily: 'var(--font-mono)', fontSize: 13, textAlign: 'center' }}>{item.qty}</span>
                      <button onClick={() => updateCart(item.cartId, 1)} style={{ width: 32, height: 32, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>+</button>
                    </div>
                    <div style={{ minWidth: 80, textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>€{(item.price * item.qty).toFixed(2)}</div>
                      <button onClick={() => removeFromCart(item.cartId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 4 }}>remove</button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ background: 'var(--black)', color: 'var(--cream)', padding: 24 }}>
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
              <button onClick={handleCheckout} style={{ width: '100%', background: 'var(--orange)', color: 'var(--black)', border: 'none', padding: '15px', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', cursor: 'pointer', marginTop: 18, borderRadius: 999, fontWeight: 600 }}>checkout ↗</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
