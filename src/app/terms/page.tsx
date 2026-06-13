const sections = [
  {
    title: '§ 1 Geltungsbereich und Anbieter',
    body: 'Diese Allgemeinen Geschaftsbedingungen (AGB) gelten fur alle Bestellungen von Waren uber den Online-Shop von PPI Jerman / Vereinigung indonesischer Studenten e.V. Vertragspartner ist PPI Jerman / Vereinigung indonesischer Studenten e.V. Die aktuellen Kontaktdaten, der Sitz des Vereins, die Registernummer und die Vertretungsverhaltnisse sind dem Impressum der Website zu entnehmen. Verbraucher im Sinne dieser AGB ist jede naturliche Person, die ein Rechtsgeschaft zu Zwecken abschliesst, die uberwiegend weder ihrer gewerblichen noch ihrer selbststandigen beruflichen Tatigkeit zugerechnet werden konnen (§ 13 BGB).',
  },
  {
    title: '§ 2 Vertragsschluss',
    body: 'Die Prasentation der Waren im Online-Shop stellt kein rechtlich bindendes Angebot, sondern einen unverbindlichen Online-Katalog dar. Durch Anklicken des Buttons "Kaufen" bzw. "Zahlungspflichtig bestellen" gibt der Kunde eine verbindliche Bestellung der im Warenkorb enthaltenen Waren ab. Die Bestatigung des Eingangs der Bestellung erfolgt unmittelbar nach dem Absenden durch eine automatisierte E-Mail. Der Kaufvertrag kommt erst zustande, wenn der Anbieter die Annahme der Bestellung per E-Mail bestatigt oder die Ware zum Versand bringt.',
  },
  {
    title: '§ 3 Preise, Versandkosten und Kleinunternehmerstatus',
    body: 'Die auf den Produktseiten genannten Preise sind Endpreise. Aufgrund der Kleinunternehmerregelung gemass § 19 UStG wird keine Umsatzsteuer erhoben und diese folglich auch nicht auf der Rechnung ausgewiesen. Die Endpreise verstehen sich zuzuglich Versandkosten. Die Versandkosten werden im Rahmen des Checkout-Prozesses vor der endgultigen Bestellung berechnet. Ab einem Mindestbestellwert von 49,00 € erfolgt der Versand fur den Kunden kostenfrei.',
  },
  {
    title: '§ 4 Lieferbedingungen und Bearbeitungszeit',
    body: 'Die Bearbeitung und der Versand der Bestellung erfolgen innerhalb von maximal 3 Werktagen nach vollstandigem Zahlungseingang. Sollte es aufgrund von unvorhersehbaren logistischen Storungen oder Engpassen zu Verzogerungen kommen, wird der Kunde unverbindlich per E-Mail informiert. Der Kunde tragt die Verantwortung fur die Richtigkeit und Vollstandigkeit der angegebenen Lieferadresse. Kosten fur Rucksendungen aufgrund fehlerhafter Adressdaten gehen zu Lasten des Kunden.',
  },
  {
    title: '§ 5 Zahlungsbedingungen',
    body: 'Die Zahlung erfolgt uber die im Online-Shop angebotenen Zahlungsmethoden. Die Ware bleibt bis zur vollstandigen Bezahlung Eigentum von PPI Jerman / Vereinigung indonesischer Studenten e.V.',
  },
  {
    title: '§ 6 Widerrufsrecht und Rucksendekosten',
    body: 'Verbraucher haben ein gesetzliches 14-tagiges Widerrufsrecht. Die Widerrufsfrist betragt vierzehn Tage ab dem Tag, an dem der Kunde oder ein von ihm benannter Dritter die Waren in Besitz genommen hat. Um das Widerrufsrecht auszuuben, muss der Kunde den Anbieter mittels einer eindeutigen Erklarung, zum Beispiel per E-Mail, uber seinen Entschluss informieren, diesen Vertrag zu widerrufen. Im Falle eines Widerrufs durch den Kunden gilt als vereinbart, dass der Kunde die unmittelbaren Kosten der Rucksendung der Waren tragt.',
  },
  {
    title: '§ 7 Gewahrleistung (Mangelhaftung)',
    body: 'Es gelten die gesetzlichen Gewahrleistungsrechte bei Mangeln der Ware. Im Falle von Transportschaden, Produktionsfehlern oder Falschlieferungen wird der Kunde gebeten, den Mangel idealerweise innerhalb von 3 Tagen nach Erhalt der Ware unter Beifugung von Fotodokumentation an den Support des Anbieters zu melden, um eine schnelle Abwicklung und Schadensregulierung zu ermoglichen. Die gesetzlichen Rechte des Kunden werden durch eine verspatete Meldung nicht eingeschrankt.',
  },
  {
    title: '§ 8 Schlussbestimmungen',
    body: 'Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der ubrigen Bestimmungen davon unberuhrt.',
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
              Allgemeine Geschaftsbedingungen fur den Web Shop von PPI Jerman / Vereinigung indonesischer Studenten e.V.
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
