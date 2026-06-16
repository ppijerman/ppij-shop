# PPI Jerman — Merch Shop

Official merchandise store for **Perhimpunan Pelajar Indonesia di Jerman (PPI Jerman)** — the Indonesian student association in Germany.

Customers can browse products, place orders, and submit bank transfer payment proofs. Admins review payments and manage order fulfillment through a built-in dashboard.

---

## Features

- **Product catalog** — browse items with size, color, and fit-type (Regular / Oversized) variants
- **Shopping cart** — persistent cart tied to signed-in user accounts
- **Order placement** — variant-level stock management with price snapshotted at purchase
- **Payment flow** — manual bank transfer upload; admins review and approve proofs
- **Order tracking** — customers can follow their order from payment through shipping
- **Admin dashboard** — separate views for payment review and order management (`ADMIN_KK` / `ADMIN_IT` roles)
- **Role-based access control** — `BUYER`, `ADMIN_KK`, `ADMIN_IT` roles enforced server-side

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, RSC) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL via `pg` driver with connection pooling |
| Auth | Clerk (`@clerk/nextjs`) synced to local `users` table via webhook |
| Styling | CSS custom properties — no Tailwind or CSS-in-JS |
| Mutations | Next.js Server Actions — no separate API layer |
| Migrations | dbmate |
| Email | Resend (`@react-email/components`) |
| Shipping | SendCloud API |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- [Clerk](https://clerk.com) account
- [Resend](https://resend.com) account (transactional email)
- [SendCloud](https://www.sendcloud.com) account (shipping, optional for local dev)
- [dbmate](https://github.com/amacneil/dbmate) for migrations

### Installation

```bash
git clone https://github.com/ppijerman/ppij-shop.git
cd ppij-shop
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Database
DATABASE_URL=postgres://user:password@localhost:5432/ppij_shop

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...

# Email (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=no-reply@shop.ppijerman.org
ADMIN_KK_EMAIL=partnership@ppijerman.org

# Shipping (SendCloud) — leave blank to disable shipping integration locally
SENDCLOUD_API_KEY=
SENDCLOUD_API_SECRET=
SENDCLOUD_SENDER_ADDRESS_ID=
SENDCLOUD_WEBHOOK_SECRET=
SENDCLOUD_TEST_MODE=true

# Cron job secret — used to authenticate the /api/cron/* endpoints
CRON_SECRET=
```

### Database Setup

```bash
npm run db:up        # run all pending migrations
npm run db:status    # check migration status
npm run db:new       # create a new migration file
npm run db:rollback  # roll back the last migration
```

### Run Locally

```bash
npm run dev     # starts dev server at http://localhost:3000
npm run build   # production build
npm run lint    # lint check
```

---

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── globals.css               # Design tokens (CSS variables)
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # / — Home
│   ├── catalog/                  # /catalog — Product listing
│   ├── product/[slug]/           # /product/[slug] — Product detail
│   ├── bundle/[slug]/            # /bundle/[slug] — Bundle detail
│   ├── cart/                     # /cart — Shopping cart
│   ├── account/orders/           # /account/orders — Order history & payment upload
│   └── admin/[role]/             # /admin/kk | /admin/it — Admin dashboard
│
├── lib/
│   ├── db.ts                     # DB pool & withTransaction()
│   ├── auth.ts                   # requireAdmin(), requireOrderAdmin()
│   ├── users.ts                  # getCurrentDbUserOrThrow()
│   ├── actions/                  # Server Actions (auth-guarded mutations)
│   └── dal/                      # Data Access Layer (raw SQL queries)
│
├── components/                   # UI components
├── context/                      # CartContext, ToastContext
└── types/index.ts                # Shared TypeScript types
```

---

## Order Lifecycle

```
AWAITING_PAYMENT → PAYMENT_REVIEW → PROCESSING → SHIPPED → DONE
                                                          ↘ CANCELLED
```

1. Customer places an order → status: `AWAITING_PAYMENT`
2. Customer uploads bank transfer proof → status: `PAYMENT_REVIEW`
3. Admin approves payment → status: `PROCESSING`
4. Admin marks as shipped → status: `SHIPPED`
5. Order delivered → status: `DONE`

---

## Admin Roles

| Role | Access |
|---|---|
| `BUYER` | Place orders, upload payment proofs, view own orders |
| `ADMIN_KK` | Review and approve payment proofs |
| `ADMIN_IT` | Manage orders, shipping, and product data |

Admin routes live under `/admin/[role]` and are enforced inside Server Actions via `requireAdmin()` / `requireOrderAdmin()`.

---

## Contributing

1. Branch off `master` — never push directly to `master`
2. Open a pull request with a clear description of the change
3. If your change includes a migration, include it in the same PR
4. Get review and approval before merging

---

## License

Internal project — PPI Jerman. Not open for public contributions at this time.
