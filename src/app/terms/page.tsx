const sections = [
  {
    title: '1. About Us',
    body: 'This placeholder AGB applies to the PPI Jerman Merch Shop operated for the PPI Jerman community. Real provider details, responsible legal entity, address, and contact details must be reviewed and completed before go-live.',
  },
  {
    title: '2. Account Registration',
    body: 'Customers may need to create an account to place orders. Account information must be accurate and kept up to date. Customers are responsible for keeping login credentials secure.',
  },
  {
    title: '3. Orders & Payment',
    body: 'Product listings are invitations to order. An order is created when the customer submits checkout information. Payment is currently handled by bank transfer, and orders are processed after payment proof has been verified.',
  },
  {
    title: '4. Shipping',
    body: 'Shipping options and costs are shown during checkout where delivery is available. Customers are responsible for providing complete and accurate delivery information.',
  },
  {
    title: '5. Returns & Exchanges',
    body: 'Returns and exchanges are handled according to the shop return policy. Defective or incorrect items must be reported promptly with the order number, a photo, and a description of the issue.',
  },
  {
    title: '6. Intellectual Property',
    body: 'Shop designs, logos, product images, text, and branding belong to PPI Jerman or their respective rights holders. They may not be copied, reused, or distributed without permission.',
  },
  {
    title: '7. Limitation of Liability',
    body: 'Liability is limited according to applicable law. PPI Jerman is not responsible for delays caused by carriers or circumstances outside its reasonable control.',
  },
  {
    title: '8. Changes to Terms',
    body: 'These terms may be updated from time to time. The version published at the time of order applies unless mandatory law requires otherwise.',
  },
  {
    title: '9. Contact',
    body: 'Questions about orders, these terms, or legal notices should be directed to the official PPI Jerman shop contact. Real contact details must be inserted before go-live.',
  },
];

export default function TermsPage() {
  return (
    <section style={{ background: 'var(--cream)', padding: '60px 28px 100px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-deep)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 14 }}>
          —— legal ——
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 8vw, 96px)', color: 'var(--black)', lineHeight: 0.92, marginBottom: 48 }}>
          TERMS<span style={{ color: 'var(--accent)' }}>.</span>
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 40, fontFamily: 'var(--font-body)', color: 'var(--ink)', lineHeight: 1.8 }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
              Last updated: June 2026
            </p>
            <p style={{ fontSize: 15 }}>
              Placeholder Terms & Conditions (AGB) for the PPI Jerman Merch Shop. This text must be replaced with legally reviewed terms before go-live.
            </p>
          </div>

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
