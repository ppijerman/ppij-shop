const sections = [
  {
    title: 'Processing Time',
    body: 'Orders are processed within 3 business days after payment verification.',
  },
  {
    title: 'Shipping Cost',
    body: 'Shipping cost is calculated at checkout based on the destination and selected shipping method.',
  },
  {
    title: 'Free Shipping',
    body: 'Free shipping applies to orders of €49 or more.',
  },
  {
    title: 'Delivery Information',
    body: 'The buyer is responsible for providing accurate and complete delivery information. Incorrect or incomplete delivery details may delay fulfillment.',
  },
  {
    title: 'Carrier Delays',
    body: 'PPI Jerman is not liable for delays caused by the carrier after the parcel has been handed over.',
  },
  {
    title: 'Lost in Transit',
    body: 'If a parcel appears lost in transit, PPI Jerman will assist with the carrier investigation where possible.',
  },
];

export default function ShippingPage() {
  return (
    <section style={{ background: 'var(--cream)', padding: '60px 28px 100px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-deep)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 14 }}>
          —— policy ——
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 8vw, 96px)', color: 'var(--black)', lineHeight: 0.92, marginBottom: 48 }}>
          SHIPPING<span style={{ color: 'var(--accent)' }}>.</span>
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 40, fontFamily: 'var(--font-body)', color: 'var(--ink)', lineHeight: 1.8 }}>
          {sections.map((section) => (
            <Section key={section.title} title={section.title}>
              <p>{section.body}</p>
            </Section>
          ))}
        </div>
      </div>
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ borderTop: '1px solid var(--line)', paddingTop: 32 }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--black)', marginBottom: 16 }}>
        {title}
      </h2>
      <div style={{ fontSize: 15 }}>{children}</div>
    </div>
  );
}
