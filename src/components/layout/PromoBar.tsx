const ITEMS = [
  'FREE SHIPPING — 4 NEGARA EUROPA',
  'NEW DROP — AW26 COLLECTION',
  'INDONESIA × DEUTSCHLAND',
  'SUPPORT YOUR PPI',
  'LIMITED RUN — RESTOCKING SOON',
];

export default function PromoBar() {
  return (
    <div style={{ background: 'var(--black)', color: 'var(--cream)', padding: '8px 0', overflow: 'hidden', position: 'relative', zIndex: 1001 }}>
      <div style={{ display: 'flex', animation: 'marquee 35s linear infinite', width: 'max-content' }}>
        {Array.from({ length: 3 }).map((_, k) => (
          <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '0 14px' }}>
            {ITEMS.map((t, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase' }}>{t}</span>
                <span style={{ color: 'var(--orange)', fontSize: 8 }}>✦</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
