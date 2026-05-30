'use client';

import { useState } from 'react';

const FAQ_ITEMS = [
  { q: 'Berapa lama pengiriman ke Jerman?', a: '3–5 hari kerja via DHL Express untuk dalam Jerman. Negara Eropa lainnya 5–10 hari kerja. Gratis ongkir untuk semua pesanan.' },
  { q: 'Apakah ukuran sesuai standar Eropa?', a: 'Ya, semua produk mengikuti standar ukuran Eropa. Panduan ukuran detail tersedia di setiap halaman produk.' },
  { q: 'Bagaimana cara mengembalikan produk?', a: 'Jika produk cacat atau tidak sesuai, hubungi kami dalam 7 hari setelah terima. Kami akan kirim pengganti gratis.' },
  { q: 'Metode pembayaran apa yang diterima?', a: 'Pembayaran dilakukan melalui transfer IBAN ke rekening PPI Jerman, lalu unggah bukti pembayaran di detail pesanan.' },
  { q: 'Bagaimana melacak pesanan?', a: 'Setelah diproses, Anda menerima email konfirmasi dengan nomor tracking DHL.' },
  { q: 'Ada diskon untuk pemesanan massal?', a: 'Ya! Untuk lebih dari 10 item, hubungi kami untuk harga khusus grup, fakultas, atau event PPI cabang.' },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section style={{ background: 'var(--cream)', padding: '60px 28px 80px' }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--orange-deep)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 14 }}>—— frequently asked ——</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(64px, 9vw, 128px)', color: 'var(--black)', lineHeight: 0.92, marginBottom: 40 }}>
          FAQ<span style={{ color: 'var(--orange)' }}>.</span>
        </h1>

        {FAQ_ITEMS.map((item, i) => (
          <div key={i} style={{ borderTop: '1px solid var(--line)' }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{ width: '100%', background: 'none', border: 'none', padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: 20 }}
            >
              <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--black)', textAlign: 'left' }}>{item.q}</span>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: open === i ? 'var(--orange)' : 'transparent', border: open === i ? 'none' : '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                <span style={{ fontSize: 16, transform: open === i ? 'rotate(45deg)' : 'rotate(0)', transition: 'transform 0.2s', display: 'block' }}>+</span>
              </div>
            </button>
            {open === i && (
              <div style={{ padding: '0 0 20px', fontSize: 14.5, color: 'var(--ink)', lineHeight: 1.8, animation: 'fadeIn 0.2s ease' }}>
                {item.a}
              </div>
            )}
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--line)' }} />
      </div>
    </section>
  );
}
