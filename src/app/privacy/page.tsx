const sections = [
  {
    title: '1. Verantwortlicher',
    body: 'Verantwortlich fur die Datenverarbeitung im Web Shop ist PPI Jerman / Vereinigung indonesischer Studenten e.V. Die vollstandigen Kontaktdaten, der Sitz des Vereins, die Registernummer und die Vertretungsverhaltnisse mussen vor dem Go-live im Impressum erganzt werden.',
  },
  {
    title: '2. Verarbeitete Daten',
    body: 'Wir verarbeiten personenbezogene Daten, die fur den Betrieb des Shops erforderlich sind, insbesondere Name, E-Mail-Adresse, Account-Daten, Bestelldaten, Zahlungsnachweis-Informationen und bei Versandbestellungen die Lieferadresse.',
  },
  {
    title: '3. Zweck der Verarbeitung',
    body: 'Die Daten werden verarbeitet, um Accounts zu erstellen, Bestellungen entgegenzunehmen, Zahlungen zu prufen, Waren zu liefern, Versand und Tracking bereitzustellen, Kundenanfragen zu bearbeiten und gesetzlich erforderliche Bestellunterlagen aufzubewahren.',
  },
  {
    title: '4. Dienstleister',
    body: 'Fur die Erfullung von Bestellungen konnen erforderliche Bestell- und Kontaktdaten an Dienstleister weitergegeben werden, insbesondere an Sendcloud fur Versandabwicklung und Tracking sowie an Resend fur transaktionale E-Mails.',
  },
  {
    title: '5. Rechte nach DSGVO',
    body: 'Betroffene Personen konnen nach Massgabe der DSGVO Auskunft, Berichtigung, Loschung, Einschrankung der Verarbeitung, Widerspruch gegen die Verarbeitung und Datenubertragbarkeit verlangen, soweit die gesetzlichen Voraussetzungen vorliegen.',
  },
  {
    title: '6. Datenschutzkontakt',
    body: 'Fur Datenschutzanfragen wenden Sie sich bitte an die offiziellen Kontaktkanale von PPI Jerman. Der konkrete Datenschutzkontakt muss vor dem Go-live erganzt und rechtlich gepruft werden.',
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
              Datenschutzerklarung fur den Web Shop von PPI Jerman / Vereinigung indonesischer Studenten e.V. Diese Fassung muss vor dem Go-live durch rechtlich gepruften finalen Text ersetzt werden.
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
