'use client';

import { useState } from 'react';

const FAQ_ITEMS = [
  { q: 'Are the products being sold in stock?', a: 'Product availability varies by item. Stock information is displayed on the product page. Should any stock availability issues arise after payment has been made, the PPI Jerman team will contact the buyer to provide further information.' },
  { q: 'How does the clothing sizing system work?', a: 'The sizing follows Indonesian/Asian standards. Please check the size chart carefully before completing your purchase. The regular fit and oversized fit charts include a 1-2 cm measurement tolerance.', showSizeGuide: true },
  { q: 'Does the product price include shipping costs?', a: 'Not yet. Shipping costs will be calculated at checkout based on the delivery address and the selected shipping method. Free shipping applies to purchases of at least €49.' },
  { q: 'How long does it take to process an order?', a: 'Orders will be processed within a maximum of three working days after payment has been successfully received and verified. Should operational disruptions or logistical issues cause a delay, the PPI Jerman team will contact the buyer with an update.' },
  { q: 'How long does delivery take?', a: 'Delivery time depends on the destination location and the shipping service used. Once the order has been shipped, the buyer will receive tracking information.' },
  { q: 'Can I cancel my order or return the product?', a: 'In accordance with German consumer protection regulations (Widerrufsrecht), customers have the right to return the product within 14 days of receipt. The buyer bears the full cost of return shipping. Because return postage in Germany can be expensive, please check the size chart carefully before purchasing.' },
  { q: 'What if the item I receive is damaged or incorrect?', a: "Please contact the PPI Jerman team within 3 days of receiving the item, including your order number and photographic documentation of the item's condition. Each report will be reviewed individually." },
  { q: 'How will the profits from merchandise sales be used?', a: "Profits from merchandise sales will be used to support PPI Jerman's programs, activities, and operations." },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section style={{ background: 'var(--cream)', padding: '60px 28px 80px' }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-deep)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 14 }}>—— frequently asked ——</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(64px, 9vw, 128px)', color: 'var(--black)', lineHeight: 0.92, marginBottom: 40 }}>
          FAQ<span style={{ color: 'var(--accent)' }}>.</span>
        </h1>

        {FAQ_ITEMS.map((item, i) => (
          <div key={i} style={{ borderTop: '1px solid var(--line)' }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{ width: '100%', background: 'none', border: 'none', padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: 20 }}
            >
              <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--black)', textAlign: 'left' }}>{item.q}</span>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: open === i ? 'var(--accent)' : 'transparent', border: open === i ? 'none' : '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                <span style={{ fontSize: 16, transform: open === i ? 'rotate(45deg)' : 'rotate(0)', transition: 'transform 0.2s', display: 'block', color: open === i ? '#fff' : 'var(--black)' }}>+</span>
              </div>
            </button>
            {open === i && (
              <div style={{ padding: '0 0 20px', fontSize: 14.5, color: 'var(--ink)', lineHeight: 1.8, animation: 'fadeIn 0.2s ease' }}>
                <p style={{ margin: 0 }}>{item.a}</p>
                {item.showSizeGuide && (
                  <div style={{ marginTop: 20, overflow: 'hidden', border: '1px solid var(--line)', background: 'white' }}>
                    <img
                      src="/assets/v4/size-guide.jpeg"
                      alt="PPI Jerman merchandise size guide"
                      style={{
                        width: '80%',
                        height: 'auto',
                        display: 'block',
                        margin: '0 auto',
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--line)' }} />
      </div>
    </section>
  );
}
