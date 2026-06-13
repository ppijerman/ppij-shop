import Image from 'next/image';

export default function About() {
  return (
    <section style={{ background: 'var(--cream)', padding: '60px 28px 80px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-deep)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 14 }}>—— about ——</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(64px, 9vw, 140px)', color: 'var(--black)', lineHeight: 0.92, letterSpacing: '0.01em', marginBottom: 48 }}>
          PERHIMPUNAN PELAJAR<br />INDONESIA <span style={{ color: 'var(--accent)' }}>— DI JERMAN.</span>
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, marginBottom: 48 }}>
          <div className="photo-frame" style={{ position: 'relative' }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5' }}>
              <Image src="/assets/v4/editorial-collage.jpeg" alt="" fill style={{ objectFit: 'cover' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 8 }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 30, lineHeight: 1.3, color: 'var(--black)', marginBottom: 24 }}>
              Wadah resmi pelajar dan mahasiswa Indonesia di Deutschland.
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, color: 'var(--ink)', lineHeight: 1.85 }}>
              Setiap merch yang kami buat lahir dari cerita, candaan, dan kebanggaan kami sebagai pelajar di perantauan. Dari "Mit Karte Bitte" sampai "Trio Komodores", semuanya adalah catatan kecil hidup di Jerman yang ingin kami abadikan.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
