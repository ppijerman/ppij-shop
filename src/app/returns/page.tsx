const sections = [
  {
    title: 'No Change-of-Mind Returns',
    body: 'Returns are not accepted for change of mind, wrong size selection, or other buyer error.',
  },
  {
    title: 'No Exchanges After Confirmation',
    body: 'Exchanges are not available after an order has been confirmed. Please review product, size, color, fit, and delivery details before placing an order.',
  },
  {
    title: 'Defective or Wrong Items',
    body: 'If you receive a defective or wrong item, report it within 3 days of receipt with your order number, a clear photo, and a description of the issue.',
  },
  {
    title: 'Individual Review',
    body: 'Each claim is reviewed individually. A report does not automatically guarantee a return, replacement, or refund.',
  },
  {
    title: 'Buyer Errors',
    body: 'Buyer errors, including incorrect size, incorrect address, or accidental order submission, are not grounds for return or exchange.',
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
