export default function ImpressumPage() {
  return (
    <section style={{ background: 'var(--cream)', padding: '60px 28px 100px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-deep)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 14 }}>
          —— legal ——
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 8vw, 96px)', color: 'var(--black)', lineHeight: 0.92, marginBottom: 48 }}>
          IMPRESSUM<span style={{ color: 'var(--accent)' }}>.</span>
        </h1>
        <div style={{ fontFamily: 'var(--font-body)', color: 'var(--ink)', lineHeight: 1.8, borderTop: '1px solid var(--line)', paddingTop: 32 }}>
          <p style={{ fontSize: 15 }}>
            Placeholder only. The real Impressum requires PPI Jerman legal entity details, responsible person, address, and contact information and must be completed manually before go-live.
          </p>
        </div>
      </div>
    </section>
  );
}
