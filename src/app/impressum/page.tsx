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
            <p>
              Vereinigung indonesischer Studenten e.V.<br />
              Connollystr. 3<br />
              80809 Munchen
            </p>
          </Section>
          <Section title="Register">
            <p>
              Vereinsregister: VR 2912<br />
              Registergericht: Amtsgericht Bonn
            </p>
          </Section>
          <Section title="Vertreten durch">
            <p>
              Maria Patricia Viannisa (Vorsitzender)<br />
              Zulfa Nucaini Afifah (Stellvertretender Vorsitzender)<br />
              Achmad Alwi Harahar (Stellvertretender Vorsitzender)<br />
              Maria Bernadine Aurelia (Stellvertretender Vorsitzender)
            </p>
          </Section>
          <Section title="Kontakt">
            <p>E-Mail: partnership@ppijerman.org</p>
          </Section>
          <Section title="Verbraucherstreitbeilegung / Universalschlichtungsstelle">
            <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
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
