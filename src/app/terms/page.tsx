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
              These Terms and Conditions govern your use of the PPI Jerman Merch Shop and the purchase of merchandise offered through this platform. By creating an account, you agree to be bound by these terms.
            </p>
          </div>

          <Section title="1. About Us">
            <p>The PPI Jerman Merch Shop is operated by Perhimpunan Pelajar Indonesia Jerman (PPI Jerman), a non-profit student association representing Indonesian students in Germany. All proceeds support PPI Jerman's community programs and activities.</p>
          </Section>

          <Section title="2. Account Registration">
            <p>To place an order, you must create an account with a valid email address. You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate and complete information during registration and keep your account information up to date.</p>
          </Section>

          <Section title="3. Orders and Payment">
            <p>All orders are subject to availability. Prices are listed in Euros (€) and include applicable taxes. Payment is made via IBAN bank transfer to PPI Jerman's official account. Orders are confirmed only after payment proof is reviewed and approved by our team.</p>
            <p style={{ marginTop: 12 }}>We reserve the right to cancel any order at our discretion, in which case a full refund will be issued.</p>
          </Section>

          <Section title="4. Shipping">
            <p>We ship within Germany and to select European countries. Delivery times are estimates and may vary. Shipping is free on all orders. Risk of loss passes to you upon delivery to the carrier.</p>
          </Section>

          <Section title="5. Returns and Exchanges">
            <p>If you receive a defective or incorrect item, contact us within 7 days of receipt. We will arrange a free replacement. As our merchandise is produced in limited runs, we generally cannot accept returns for reasons other than defect or fulfillment error.</p>
          </Section>

          <Section title="6. Intellectual Property">
            <p>All designs, logos, and branding on PPI Jerman merchandise are the property of PPI Jerman or its licensed designers. You may not reproduce or use them without prior written permission.</p>
          </Section>

          <Section title="7. Privacy">
            <p>We collect and process personal data (name, email, shipping address) solely for order fulfillment and communication. We do not sell your data to third parties. Your data is stored securely and you may request deletion of your account and associated data at any time from your account settings.</p>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>PPI Jerman's liability for any claim arising from these terms or the use of our shop is limited to the total amount paid for the order in question. We are not liable for indirect, incidental, or consequential damages.</p>
          </Section>

          <Section title="9. Changes to Terms">
            <p>We may update these terms from time to time. Continued use of the shop after changes are posted constitutes your acceptance of the revised terms.</p>
          </Section>

          <Section title="10. Contact">
            <p>For questions about these terms or your order, please reach out to us through the official PPI Jerman channels.</p>
          </Section>
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
