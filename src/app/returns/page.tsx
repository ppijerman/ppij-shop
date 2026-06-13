const sections = [
  {
    title: '14-Day Right of Withdrawal',
    body: 'In accordance with German consumer protection regulations (Widerrufsrecht), customers have the right to return the product within 14 days of receipt.',
  },
  {
    title: 'Return Shipping Cost',
    body: 'In the event of a withdrawal or return by the customer, the buyer bears the full cost of return shipping.',
  },
  {
    title: 'Size Selection',
    body: 'Given the high cost of return postage in Germany, buyers are strongly encouraged to carefully check the size chart before completing a purchase to avoid sizing errors.',
  },
  {
    title: 'Damaged or Incorrect Items',
    body: "If the item received is damaged or incorrect, please contact the PPI Jerman team within 3 days of receiving the item, including the order number and photographic documentation of the item's condition.",
  },
  {
    title: 'Individual Review',
    body: 'Each report will be reviewed individually. Statutory warranty rights remain unaffected.',
  },
  {
    title: 'Wrong Address or Buyer Error',
    body: 'The customer is responsible for the correctness and completeness of the delivery address. Costs for returns caused by incorrect address data are borne by the customer.',
  },
];

export default function ReturnsPage() {
  return (
    <section style={{ background: 'var(--cream)', padding: '60px 28px 100px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-deep)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 14 }}>
          —— policy ——
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 8vw, 96px)', color: 'var(--black)', lineHeight: 0.92, marginBottom: 48 }}>
          RETURNS<span style={{ color: 'var(--accent)' }}>.</span>
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
