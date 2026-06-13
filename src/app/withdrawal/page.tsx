const withdrawalContent = {
  en: {
    sections: [
      {
        title: 'Right of Withdrawal',
        body: [
          'You have the right to withdraw from this contract within fourteen days without giving any reason. The withdrawal period is fourteen days from the day on which you, or a third party named by you who is not the carrier, took possession of the goods.',
          'To exercise your right of withdrawal, you must inform us, PPI Jerman / Vereinigung indonesischer Studenten e.V., E-Mail: partnership@ppijerman.org, by means of a clear statement, for example by email, of your decision to withdraw from this contract.',
          'You may use the model withdrawal form below, but it is not required. To meet the withdrawal deadline, it is sufficient that you send your notice before the withdrawal period expires.',
        ],
      },
      {
        title: 'Effects of Withdrawal',
        body: [
          'If you withdraw from this contract, we will reimburse all payments received from you, including delivery costs, except for additional costs resulting from your choice of a delivery method other than the least expensive standard delivery offered by us.',
          'The reimbursement will be made without undue delay and no later than fourteen days from the day on which we receive your notice of withdrawal. We will use the same means of payment that you used for the original transaction, unless expressly agreed otherwise.',
          'We may withhold reimbursement until we have received the goods back or until you have supplied evidence that you have sent the goods back, whichever is earlier.',
          'You must send back or hand over the goods without undue delay and no later than fourteen days from the day on which you inform us of your withdrawal. The exact return address will be provided after you contact us by email.',
          'You bear the direct cost of returning the goods. You are only liable for any loss in value of the goods if that loss results from handling that was not necessary to check the condition, properties, and functioning of the goods.',
        ],
      },
    ],
    form: {
      title: 'Model Withdrawal Form',
      helper: 'You may copy this text into an email and complete the missing details.',
      intro: 'If you wish to withdraw from the contract, please complete this form and send it back to us by email.',
      recipientLabel: 'Send to',
      statement: 'I/we (*) hereby withdraw from the contract concluded by me/us (*) for the purchase of the following goods (*) / the provision of the following service (*):',
      fields: [
        'Ordered on (*):',
        'Received on (*):',
        'Name of consumer(s):',
        'Address of consumer(s):',
        'Date:',
      ],
      note: '(*) Delete as applicable.',
    },
  },
  de: {
    sections: [
      {
        title: 'Widerrufsrecht',
        body: [
          'Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Grunden diesen Vertrag zu widerrufen. Die Widerrufsfrist betragt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beforderer ist, die Waren in Besitz genommen haben bzw. hat.',
          'Um Ihr Widerrufsrecht auszuuben, mussen Sie uns, PPI Jerman / Vereinigung indonesischer Studenten e.V., E-Mail: partnership@ppijerman.org, mittels einer eindeutigen Erklarung, zum Beispiel per E-Mail, uber Ihren Entschluss informieren, diesen Vertrag zu widerrufen.',
          'Sie konnen dafur das Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist. Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung vor Ablauf der Widerrufsfrist absenden.',
        ],
      },
      {
        title: 'Folgen des Widerrufs',
        body: [
          'Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschliesslich der Lieferkosten, mit Ausnahme der zusatzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, gunstigste Standardlieferung gewahlt haben, unverzuglich und spatestens binnen vierzehn Tagen zuruckzuzahlen.',
          'Fur diese Ruckzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprunglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrucklich etwas anderes vereinbart.',
          'Wir konnen die Ruckzahlung verweigern, bis wir die Waren wieder zuruckerhalten haben oder bis Sie den Nachweis erbracht haben, dass Sie die Waren zuruckgesandt haben, je nachdem, welches der fruhere Zeitpunkt ist.',
          'Sie tragen die unmittelbaren Kosten der Rucksendung der Waren.',
        ],
      },
    ],
    form: {
      title: 'Muster-Widerrufsformular',
      helper: 'Sie konnen diesen Text in eine E-Mail kopieren und die fehlenden Angaben erganzen.',
      intro: 'Wenn Sie den Vertrag widerrufen wollen, dann fullen Sie bitte dieses Formular aus und senden Sie es per E-Mail an uns zuruck.',
      recipientLabel: 'Senden an',
      statement: 'Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag uber den Kauf der folgenden Waren (*) / die Erbringung der folgenden Dienstleistung (*):',
      fields: [
        'Bestellt am (*):',
        'Erhalten am (*):',
        'Name des/der Verbraucher(s):',
        'Anschrift des/der Verbraucher(s):',
        'Datum:',
      ],
      note: '(*) Unzutreffendes streichen.',
    },
  },
};

const activeLanguage: keyof typeof withdrawalContent = 'en';
const content = withdrawalContent[activeLanguage];

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
          {content.sections.map((section) => (
            <Section key={section.title} title={section.title}>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </Section>
          ))}

          <Section title={content.form.title}>
            <p style={{ color: 'var(--muted)' }}>{content.form.helper}</p>
            <div style={{ border: '1px solid var(--line)', background: 'rgba(255,255,255,0.48)', padding: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 15, lineHeight: 1.7 }}>
                <p style={{ margin: 0 }}>{content.form.intro}</p>
                <div style={{ background: 'var(--cream)', border: '1px solid var(--line)', padding: 16 }}>
                  <div style={formLabelStyle}>{content.form.recipientLabel}</div>
                  <p style={{ margin: 0 }}>
                    PPI Jerman / Vereinigung indonesischer Studenten e.V.<br />
                    E-Mail: partnership@ppijerman.org
                  </p>
                </div>
                <p style={{ margin: 0 }}>{content.form.statement}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {content.form.fields.map((field) => (
                    <div key={field} style={{ display: 'grid', gridTemplateColumns: 'minmax(160px, 240px) 1fr', gap: 16, alignItems: 'end' }}>
                      <span>{field}</span>
                      <span style={{ borderBottom: '1px solid var(--line)', minHeight: 28 }} />
                    </div>
                  ))}
                </div>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>{content.form.note}</p>
              </div>
            </div>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 15 }}>{children}</div>
    </div>
  );
}

const formLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--muted)',
  marginBottom: 6,
};
