const sections = [
  {
    title: '1. Datenschutz auf einen Blick',
    body: 'Diese Hinweise geben einen Uberblick daruber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen oder im Web Shop bestellen. Personenbezogene Daten sind alle Daten, mit denen Sie personlich identifiziert werden konnen.',
  },
  {
    title: '2. Verantwortliche Stelle',
    body: 'Verantwortlich fur die Datenverarbeitung auf dieser Website ist die Vereinigung indonesischer Studenten e.V., Connollystr. 3, 80809 Munchen. E-Mail: partnership@ppijerman.org.',
  },
  {
    title: '3. Welche Daten wir verarbeiten',
    body: 'Wir verarbeiten Daten, die Sie uns mitteilen, etwa Name, E-Mail-Adresse, Account-Daten, Bestelldaten, Zahlungsnachweis-Informationen, Anfragen und bei Versandbestellungen die Lieferadresse. Beim Besuch der Website konnen ausserdem technische Daten wie Browsertyp, Betriebssystem, Referrer URL, Uhrzeit der Serveranfrage und IP-Adresse verarbeitet werden.',
  },
  {
    title: '4. Zwecke und Rechtsgrundlagen',
    body: 'Wir verarbeiten Daten zur Bereitstellung der Website, zur Erstellung von Accounts, zur Bearbeitung von Bestellungen, Zahlungsprufungen, Versand, Tracking, Kundenkommunikation und zur Erfullung gesetzlicher Aufbewahrungspflichten. Die Verarbeitung erfolgt insbesondere auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, Art. 6 Abs. 1 lit. c DSGVO, Art. 6 Abs. 1 lit. f DSGVO oder, soweit abgefragt, auf Grundlage Ihrer Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO.',
  },
  {
    title: '5. Hosting',
    body: 'Diese Website wird extern gehostet. Laut bereitgestellter Datenschutzerklarung wird Microsoft Ireland Operations Limited, One Microsoft Place, South County Business Park, Leopardstown, Dublin 18, Irland, als Hosting-Anbieter eingesetzt. Personenbezogene Daten, die auf dieser Website erfasst werden, konnen auf Servern des Hosters verarbeitet werden.',
  },
  {
    title: '6. Dienstleister und Empfanger',
    body: 'Im Rahmen der Shop-Abwicklung arbeiten wir mit externen Stellen zusammen. Erforderliche Bestell- und Kontaktdaten konnen insbesondere an Sendcloud fur Versandabwicklung und Tracking sowie an Resend fur transaktionale E-Mails weitergegeben werden. Personenbezogene Daten werden nur weitergegeben, wenn dies zur Vertragserfullung erforderlich ist, eine gesetzliche Pflicht besteht, ein berechtigtes Interesse vorliegt oder eine andere Rechtsgrundlage die Weitergabe erlaubt.',
  },
  {
    title: '7. Cookies und Server-Log-Dateien',
    body: 'Unsere Website kann technisch notwendige Cookies verwenden, insbesondere fur Funktionen wie Warenkorb und Sitzungen. Der Provider der Seiten kann automatisch Informationen in Server-Log-Dateien speichern, etwa Browsertyp, Browserversion, verwendetes Betriebssystem, Referrer URL, Hostname des zugreifenden Rechners, Uhrzeit der Serveranfrage und IP-Adresse.',
  },
  {
    title: '8. Anfragen per E-Mail',
    body: 'Wenn Sie uns per E-Mail kontaktieren, wird Ihre Anfrage inklusive der daraus hervorgehenden personenbezogenen Daten zum Zweck der Bearbeitung Ihres Anliegens gespeichert und verarbeitet. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter, sofern keine andere Rechtsgrundlage besteht.',
  },
  {
    title: '9. Speicherdauer',
    body: 'Soweit keine speziellere Speicherdauer genannt wird, verbleiben personenbezogene Daten bei uns, bis der Zweck fur die Datenverarbeitung entfallt. Daten konnen langer gespeichert werden, wenn gesetzliche Aufbewahrungspflichten bestehen oder andere rechtlich zulassige Grunde vorliegen.',
  },
  {
    title: '10. Rechte nach DSGVO',
    body: 'Sie haben nach Massgabe der DSGVO das Recht auf Auskunft, Berichtigung, Loschung, Einschrankung der Verarbeitung, Widerspruch gegen die Verarbeitung, Datenubertragbarkeit sowie Beschwerde bei einer zustandigen Aufsichtsbehorde. Eine erteilte Einwilligung konnen Sie jederzeit fur die Zukunft widerrufen.',
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
              Datenschutzerklarung fur den Web Shop von PPI Jerman / Vereinigung indonesischer Studenten e.V.
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
