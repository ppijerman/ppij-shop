import Image from 'next/image';

const SPECS = [
  ['220gsm', 'Premium combed cotton'],
  ['Hand-drawn', 'Original illustrations'],
  ['Eco print', 'Water-based ink'],
  ['Made in EU', 'Local manufacturing'],
];

export default function PhotoStrip() {
  return (
    <section style={{ background: 'var(--cream)', padding: '80px 28px' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.85fr 1fr', gap: 24, alignItems: 'start', marginBottom: 40 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--orange-deep)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 14 }}>—— stories ——</div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 42, lineHeight: 1.15, color: 'var(--black)' }}>
              Cerita pelajar Indonesia di tanah Jerman.
            </h3>
          </div>

          <div className="photo-frame" style={{ '--rot': '-2deg' } as React.CSSProperties}>
            <div style={{ position: 'relative', width: '100%', height: 380 }}>
              <Image src="/assets/v4/editorial-collage.jpeg" alt="" fill style={{ objectFit: 'cover' }} />
            </div>
            <div style={{ textAlign: 'center', padding: '6px 0 2px', fontFamily: 'var(--font-script)', fontSize: 18, color: 'var(--ink)' }}>field day · 2026</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 32 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.7, color: 'var(--ink)' }}>
              Setiap drop kami adalah hasil kolaborasi pelajar Indonesia di Jerman — dari illustrator, fotografer, hingga model. Setiap produk membawa cerita yang sangat dekat dengan kami.
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {SPECS.map(([k, v]) => (
                <li key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 14, paddingBottom: 8, borderBottom: '1px dashed var(--line)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--black)', fontWeight: 600 }}>{k}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--muted)' }}>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
