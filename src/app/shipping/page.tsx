const sections = [
  {
    title: 'Shipping Process',
    body: 'Orders will be processed once payment has been successfully received and verified. Processing and shipment take place within a maximum of three working days after payment verification.',
  },
  {
    title: 'Shipping Cost',
    body: 'Shipping costs are not included in the product price and will be calculated at checkout based on the delivery address and selected shipping method.',
  },
  {
    title: 'Free Shipping',
    body: 'Free shipping applies to purchases of at least €49.',
  },
  {
    title: 'Delivery Time',
    body: 'Delivery time depends on the destination location and the shipping service used. Once the order has been shipped, the buyer will receive tracking information.',
  },
  {
    title: 'Shipping Information',
    body: "The buyer is responsible for ensuring that the recipient's name, address, and contact information provided are correct and complete.",
  },
  {
    title: 'Delivery Delay',
    body: 'PPI Jerman is not responsible for delays caused by shipping service providers, weather conditions, operational disruptions, or circumstances beyond our control.',
  },
  {
    title: 'Items Lost in Transit',
    body: 'In the event of any issues or loss during the courier delivery process, the PPI Jerman team will assist with the investigation and help ensure that the buyer receives the due resolution.',
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
