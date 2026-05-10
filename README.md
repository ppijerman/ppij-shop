# PPI Jerman — Merch Shop

Official merchandise store for Perhimpunan Pelajar Indonesia di Jerman (PPI Jerman).

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Inline styles + CSS custom properties (design tokens)
- **Fonts**: Google Fonts via `next/font/google` (Anton, Archivo, Caveat, JetBrains Mono, Instrument Serif)
- **State**: React Context API (Cart, Toast, Tweaks)
- **Images**: `next/image` dengan static assets di `/public`

---

## Memulai

```bash
npm install
npm run dev     # development server di http://localhost:3000
npm run build   # production build
npm run start   # production server
```

---

## Struktur Proyek

```
src/
├── app/                          # Next.js App Router
│   ├── globals.css               # CSS variables, keyframes, grain effect
│   ├── layout.tsx                # Root layout: font, providers, PromoBar, Navbar, Footer
│   ├── page.tsx                  # / — Home
│   ├── catalog/page.tsx          # /catalog — Semua produk
│   ├── product/[id]/page.tsx     # /product/[id] — Detail produk (dynamic route)
│   ├── editorial/page.tsx        # /editorial — Editorial & foto
│   ├── about/page.tsx            # /about — Tentang PPI Jerman
│   ├── faq/page.tsx              # /faq — FAQ
│   └── cart/page.tsx             # /cart — Keranjang belanja
│
├── components/
│   ├── layout/
│   │   ├── PromoBar.tsx          # Marquee bar atas (server component)
│   │   ├── Navbar.tsx            # Navigasi sticky + cart count
│   │   └── Footer.tsx            # Footer dengan kolom link + sosial
│   ├── home/
│   │   ├── Hero.tsx              # Hero section dengan foto group
│   │   ├── Editorial.tsx         # Editorial foto besar + CTA
│   │   ├── PhotoStrip.tsx        # Kolase foto + spesifikasi produk
│   │   └── CtaStrip.tsx          # Strip oranye "Represent. Wear Your Roots."
│   ├── catalog/
│   │   └── CapsuleGrid.tsx       # Grid produk dengan hover overlay + quick view
│   ├── product/
│   │   ├── ProductCrop.tsx       # Crop region dari grid foto (background-image)
│   │   ├── ProductDetailPage.tsx # Halaman detail lengkap: galeri, varian, tab info
│   │   └── QuickViewModal.tsx    # Modal quick view dari catalog
│   ├── cart/
│   │   └── CartView.tsx          # Halaman keranjang dengan summary
│   ├── pages/
│   │   ├── About.tsx             # Konten halaman About
│   │   └── FAQ.tsx               # Accordion FAQ
│   └── ui/
│       ├── Toast.tsx             # Notifikasi "added to cart"
│       └── tweaks/
│           ├── TweaksPanel.tsx   # Floating panel untuk live tweaks
│           └── TweakControls.tsx # Kontrol: TweakColor, TweakSlider, TweakToggle
│
├── context/
│   ├── CartContext.tsx           # State keranjang (add, update, remove)
│   ├── ToastContext.tsx          # State notifikasi toast
│   └── TweaksContext.tsx         # State tweaks UI (accent color, grid gap, badges)
│
├── data/
│   └── products.ts               # Data 5 produk + array CATEGORIES
│
└── types/
    └── index.ts                  # TypeScript types: Product, CartItem, Color, dll.
```

---

## Halaman & Routes

| Route | Halaman | Keterangan |
|---|---|---|
| `/` | Home | Hero + grid produk + editorial + CTA |
| `/catalog` | Shop | Grid semua produk |
| `/product/[id]` | Detail Produk | Galeri, pilih warna/ukuran, add to cart, tab info |
| `/editorial` | Editorial | Foto editorial + photo strip |
| `/about` | About | Sejarah & info PPI Jerman |
| `/faq` | FAQ | Accordion pertanyaan umum |
| `/cart` | Keranjang | Daftar item + summary + checkout |

---

## Data Produk

Semua data produk ada di `src/data/products.ts`. Untuk menambah produk baru:

```ts
// src/data/products.ts
{
  id: 6,
  no: '06',
  category: 'T-SHIRT',          // 'T-SHIRT' | 'TOTE BAG'
  name: 'Nama Produk',
  subtitle: 'SUBTITLE — WARNA',
  price: 25,
  originalPrice: null,           // null jika tidak ada diskon
  tag: 'NEW',                    // 'NEW' | 'BESTSELLER' | 'LIMITED' | null
  colors: [{ name: 'White', hex: '#F5F1E6' }],
  sizes: ['S', 'M', 'L', 'XL'], // atau ['ONE SIZE'] untuk tote bag
  desc: 'Deskripsi produk...',
  images: [],
  primaryImg: 'tshirt_grid',    // 'tshirt_grid' | 'totebag_grid'
  featurePos: { x: 50, y: 50 }, // posisi crop dari foto grid (0–100)
}
```

---

## State Management

### CartContext
Menyimpan item keranjang di memory (reset saat refresh).

```tsx
const { cart, addToCart, updateCart, removeFromCart, cartCount, total } = useCart();
```

### ToastContext
Menampilkan notifikasi toast singkat.

```tsx
const { showToast } = useToast();
showToast('✦ added · Nama Produk');
```

### TweaksContext
Live customization UI via floating panel (pojok kanan bawah → tombol "⚙ tweaks").

```tsx
const { tweaks } = useTweaks();
// tweaks.accentColor  → warna aksen (default: #F39200)
// tweaks.gridGap      → jarak antar card produk (default: 22px)
// tweaks.showBadges   → tampilkan badge NEW/BESTSELLER/LIMITED (default: true)
```

---

## Design Tokens

Semua warna dan font didefinisikan sebagai CSS custom properties di `globals.css`:

```css
--cream: #EFEAE0      /* background utama */
--black: #0E0E0E      /* teks utama */
--orange: #F39200     /* aksen (dapat diubah via TweaksPanel) */
--muted: #8A8579      /* teks sekunder */
--line: rgba(14,14,14,0.14)  /* border/divider */

--font-display: Anton         /* heading besar */
--font-body: Archivo          /* teks umum */
--font-mono: JetBrains Mono   /* label, badge, kode */
--font-serif: Instrument Serif /* heading editorial */
--font-script: Caveat          /* aksen dekoratif */
```

---

## Assets

Foto produk disimpan di `public/assets/v4/`:

| File | Digunakan untuk |
|---|---|
| `hero-group.jpeg` | Hero section |
| `editorial-color.jpeg` | Section editorial |
| `editorial-collage.jpeg` | Photo strip & halaman About |
| `tshirt-grid.jpeg` | Sumber crop foto produk T-Shirt |
| `totebag-grid.jpeg` | Sumber crop foto produk Tote Bag |

> **Cara kerja ProductCrop**: Alih-alih foto per produk, komponen `ProductCrop` melakukan crop region tertentu dari foto grid menggunakan `background-position`. Posisi diatur via `featurePos: { x, y }` di data produk.

---

## TODO / Pengembangan Lanjutan

- [ ] Koneksi ke payment gateway (Stripe / PayPal)
- [ ] Persistensi keranjang via `localStorage`
- [ ] Halaman checkout
- [ ] Filter & search produk di halaman catalog
- [ ] Sistem autentikasi akun
- [ ] CMS untuk manajemen produk (Sanity / Contentful)
- [ ] Responsive / mobile layout
- [ ] Foto produk individual (saat ini menggunakan crop dari foto grid)
