const sections = [
  {
    title: 'Data Collected',
    body: 'We collect personal data needed to operate the shop, including name, email address, account information, order details, payment proof information, and delivery address where delivery is selected.',
  },
  {
    title: 'Purpose of Processing',
    body: 'We process this data to create accounts, receive orders, verify payment, fulfill orders, arrange shipping, provide customer support, and keep legally required order records.',
  },
  {
    title: 'Third Parties',
    body: 'We may share necessary order and contact data with service providers used for fulfillment and communication, including Sendcloud for shipping and Resend for transactional emails.',
  },
  {
    title: 'GDPR / DSGVO Rights',
    body: 'Under the GDPR/DSGVO, users may request access to their personal data, correction of inaccurate data, deletion where legally possible, restriction of processing, objection to processing, and data portability where applicable.',
  },
  {
    title: 'Data Contact',
    body: 'For privacy requests, contact the PPI Jerman shop team through the official data contact. Real controller details and contact information must be inserted before go-live.',
  },
];

export default function PrivacyPage() {
  return (
    <section style={{ background: 'var(--cream)', padding: '60px 28px 100px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-deep)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 14 }}>
          —— legal ——
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 8vw, 96px)', color: 'var(--black)', lineHeight: 0.92, marginBottom: 48 }}>
          PRIVACY<span style={{ color: 'var(--accent)' }}>.</span>
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 40, fontFamily: 'var(--font-body)', color: 'var(--ink)', lineHeight: 1.8 }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
              Last updated: June 2026
            </p>
            <p style={{ fontSize: 15 }}>
              Placeholder Datenschutzerklarung for the PPI Jerman Merch Shop. This text must be replaced with legally reviewed privacy text before go-live.
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
