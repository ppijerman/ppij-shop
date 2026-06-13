const sections = [
  {
    title: 'Widerrufsrecht',
    body: [
      'Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Grunden diesen Vertrag zu widerrufen. Die Widerrufsfrist betragt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beforderer ist, die Waren in Besitz genommen haben bzw. hat.',
      'Um Ihr Widerrufsrecht auszuuben, mussen Sie uns, PPI Jerman / Vereinigung indonesischer Studenten e.V., E-Mail: partnership@ppijerman.org, mittels einer eindeutigen Erklarung, zum Beispiel per E-Mail, uber Ihren Entschluss informieren, diesen Vertrag zu widerrufen. Sie konnen dafur das beigefugte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.',
      'Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung uber die Ausubung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.',
    ],
  },
  {
    title: 'Folgen des Widerrufs',
    body: [
      'Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschliesslich der Lieferkosten, mit Ausnahme der zusatzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, gunstigste Standardlieferung gewahlt haben, unverzuglich und spatestens binnen vierzehn Tagen ab dem Tag zuruckzuzahlen, an dem die Mitteilung uber Ihren Widerruf dieses Vertrags bei uns eingegangen ist.',
      'Fur diese Ruckzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprunglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrucklich etwas anderes vereinbart. In keinem Fall werden Ihnen wegen dieser Ruckzahlung Entgelte berechnet.',
      'Wir konnen die Ruckzahlung verweigern, bis wir die Waren wieder zuruckerhalten haben oder bis Sie den Nachweis erbracht haben, dass Sie die Waren zuruckgesandt haben, je nachdem, welches der fruhere Zeitpunkt ist.',
      'Sie haben die Waren unverzuglich und in jedem Fall spatestens binnen vierzehn Tagen ab dem Tag, an dem Sie uns uber den Widerruf dieses Vertrags unterrichten, an uns zuruckzusenden oder zu ubergeben. Die genaue Rucksendeadresse wird Ihnen nach Kontaktaufnahme per E-Mail mitgeteilt. Die Frist ist gewahrt, wenn Sie die Waren vor Ablauf der Frist von vierzehn Tagen absenden.',
      'Sie tragen die unmittelbaren Kosten der Rucksendung der Waren.',
      'Sie mussen fur einen etwaigen Wertverlust der Waren nur aufkommen, wenn dieser Wertverlust auf einen zur Prufung der Beschaffenheit, Eigenschaften und Funktionsweise der Waren nicht notwendigen Umgang mit ihnen zuruckzufuhren ist.',
    ],
  },
  {
    title: 'Muster-Widerrufsformular',
    body: [
      'Wenn Sie den Vertrag widerrufen wollen, dann fullen Sie bitte dieses Formular aus und senden Sie es per E-Mail an uns zuruck.',
      'An: PPI Jerman / Vereinigung indonesischer Studenten e.V., E-Mail: partnership@ppijerman.org',
      'Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag uber den Kauf der folgenden Waren (*) / die Erbringung der folgenden Dienstleistung (*):',
      'Bestellt am (*):',
      'Erhalten am (*):',
      'Name des/der Verbraucher(s):',
      'Anschrift des/der Verbraucher(s):',
      'Datum:',
      '(*) Unzutreffendes streichen.',
    ],
  },
];

export default function WithdrawalPage() {
  return (
    <section style={{ background: 'var(--cream)', padding: '60px 28px 100px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-deep)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 14 }}>
          —— legal ——
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 8vw, 96px)', color: 'var(--black)', lineHeight: 0.92, marginBottom: 48 }}>
          WITHDRAWAL<span style={{ color: 'var(--accent)' }}>.</span>
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 40, fontFamily: 'var(--font-body)', color: 'var(--ink)', lineHeight: 1.8 }}>
          {sections.map((section) => (
            <Section key={section.title} title={section.title}>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 15 }}>{children}</div>
    </div>
  );
}
