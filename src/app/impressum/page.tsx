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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, fontFamily: 'var(--font-body)', color: 'var(--ink)', lineHeight: 1.8 }}>
          <Section title="Anbieter">
            <p>PPI Jerman / Vereinigung indonesischer Studenten e.V.</p>
          </Section>
          <Section title="Hinweis">
            <p>Die aktuellen Kontaktdaten, der Sitz des Vereins, die Registernummer und die Vertretungsverhaltnisse mussen hier vor dem Go-live erganzt und gepruft werden.</p>
          </Section>
          <Section title="Kontakt">
            <p>Bitte wenden Sie sich fur Fragen zum Web Shop an die offiziellen Kontaktkanale von PPI Jerman.</p>
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
