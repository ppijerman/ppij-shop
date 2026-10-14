# PPI Jerman — Merch Shop

Official merchandise store for **Perhimpunan Pelajar Indonesia di Jerman (PPI Jerman)** — the Indonesian student association in Germany.

Customers can browse products, place orders, and submit bank transfer payment proofs. Admins review payments and manage order fulfillment through a built-in dashboard.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Authentication & Roles](#authentication--roles)
- [Data Model](#data-model)
- [Order Lifecycle](#order-lifecycle)
- [External Integrations](#external-integrations)
- [Database Migrations](#database-migrations)
- [Coding Conventions](#coding-conventions)
- [Contributing](#contributing)
- [Contributors](#contributors)
- [License](#license)

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
| Framework | Next.js 16 (App Router, RSC) |
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
- PostgreSQL database (local install or Docker — see `docker-compose.yml`)
- [Clerk](https://clerk.com) account
- [Resend](https://resend.com) account (transactional email)
- [SendCloud](https://www.sendcloud.com) account (shipping, optional for local dev)
- [dbmate](https://github.com/amacneil/dbmate) for migrations

### Installation

```bash
git clone https://github.com/ppijerman/ppij-shop.git
cd ppij-shop
npm install
cp .env.local.example .env.local   # then fill in the values (see below)
npm run db:up                      # apply all migrations
npm run dev                        # http://localhost:3000
```

If you use Docker for Postgres:

```bash
docker compose up -d               # starts a local postgres container
```

### Commands

```bash
npm run dev      # dev server (webpack) at http://localhost:3000
npm run build    # production build
npm run start    # run the production build
npm run lint     # ESLint (next lint)

npm run db:up        # run all pending migrations
npm run db:status    # check migration status
npm run db:new       # create a new migration file
npm run db:rollback  # roll back the last migration
```

> **Note:** There are no automated tests. Verify changes manually in the browser and with `npm run build` + `npm run lint` before opening a PR.

---

## Environment Variables

Create a `.env.local` file in the project root (see `.env.local.example`):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk frontend key. |
| `CLERK_SECRET_KEY` | Clerk backend key. |
| `CLERK_WEBHOOK_SECRET` | Verifies the Clerk user-sync webhook. |
| `RESEND_API_KEY` | Transactional email. |
| `RESEND_FROM_EMAIL` | Sender address for emails. |
| `ADMIN_KK_EMAIL` | Where new-payment-proof notifications are sent. |
| `SENDCLOUD_API_KEY` / `SENDCLOUD_API_SECRET` | Shipping API (leave blank to disable locally). |
| `SENDCLOUD_SENDER_ADDRESS_ID` | SendCloud sender address. |
| `SENDCLOUD_WEBHOOK_SECRET` | Verifies the SendCloud status webhook. |
| `SENDCLOUD_TEST_MODE` | `true` to avoid creating real shipping labels. |
| `CRON_SECRET` | Shared secret to authenticate `/api/cron/*`. |

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

---

## Project Structure

```
src/
├── app/                   # Next.js App Router pages (RSC) + api/ route handlers
│   ├── globals.css        # Design tokens (CSS custom properties)
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # / — Home
│   ├── catalog/           # /catalog — product listing
│   ├── product/[slug]/    # product detail
│   ├── bundle/[slug]/     # bundle detail
│   ├── cart/              # shopping cart
│   ├── account/orders/    # order history + payment upload
│   ├── admin/[role]/      # /admin/kk | /admin/it — admin dashboard
│   └── api/               # webhooks, cron, binary/image handlers only
│
├── lib/
│   ├── db.ts              # pg Pool + withTransaction()
│   ├── auth.ts            # requireAdmin / requireITAdmin / requireOrderAdmin
│   ├── users.ts           # getCurrentDbUserOrThrow, syncClerkUser
│   ├── actions/           # Server Actions (auth-guarded mutations)
│   ├── dal/               # Data Access Layer (raw SQL)
│   ├── emails/            # React Email templates
│   ├── sendcloud.ts       # shipping integration
│   └── constants.ts       # e.g. FREE_SHIPPING_THRESHOLD
│
├── components/            # UI components (client + server)
├── context/              # CartContext, ToastContext
└── types/index.ts         # shared TypeScript types
```

---

## Architecture

The shop is a **Next.js 16 App Router** application. Pages are React Server Components (RSC) by default and run on the server. There is no separate backend service and no REST/GraphQL API layer — the browser talks to the server through RSC rendering (for reads) and **Server Actions** (for writes).

```
                    ┌──────────────────────────────────────────┐
  Browser  ───────▶ │  RSC Page (src/app/**/page.tsx)           │
  (read)            │    └─ calls DAL directly                  │
                    └──────────────────────────────────────────┘
                                      │
                    ┌──────────────────────────────────────────┐
  Browser  ───────▶ │  Server Action (src/lib/actions/**)       │
  (write)           │    1. auth check (requireAdmin / …)       │
                    │    2. validate input                      │
                    │    3. call DAL / withTransaction          │
                    │    4. revalidatePath(...)                 │
                    └──────────────────────────────────────────┘
                                      │
                    ┌──────────────────────────────────────────┐
                    │  DAL (src/lib/dal/**) — raw SQL via `pg`  │
                    └──────────────────────────────────────────┘
                                      │
                                 PostgreSQL
```

**Layers:**

- **Pages (`src/app/`)** — App Router pages/layouts. Server Components fetch data by calling the DAL directly. Client Components (`"use client"`) handle interactivity (cart, forms, image cropping) and invoke Server Actions.
- **Server Actions (`src/lib/actions/`)** — the only way to mutate data. Each `"use server"` function starts with an auth check, validates input, calls the DAL, then calls `revalidatePath()`. Expected failures are returned as typed results rather than thrown:
  ```ts
  export type CreateOrderResult =
    | { ok: true; orderId: string }
    | { ok: false; code: 'VALIDATION_ERROR' | 'EMPTY_CART' | 'OUT_OF_STOCK'; message: string; items?: string[] };
  ```
- **Data Access Layer (`src/lib/dal/`)** — raw SQL via the `pg` driver, one file per domain (`products`, `variants`, `bundles`, `orders`, `users`). The DAL does **not** check auth — that is the caller's job.
- **Database access (`src/lib/db.ts`)** — a shared pooled `pg` connection (`db`) plus `withTransaction()`. The pool is cached on `globalThis` in development to survive hot reloads. **Wrap every multi-step write in `withTransaction()`** so partial writes roll back on error.

**HTTP route handlers** (`src/app/api/`) exist only where an external system needs an HTTP endpoint or where binary data is served — not for business logic:

- `api/webhooks/clerk` — Clerk user-sync webhook
- `api/webhooks/sendcloud` — shipping status updates
- `api/cron/expire-orders` — scheduled cancellation of unpaid orders (auth via `CRON_SECRET`)
- `api/orders/[id]/payment-proof`, `api/products/images/[id]`, `api/bundles/[id]/image` — serve stored image/binary data
- `api/products/reorder`, `api/bundles/reorder` — admin display-order updates

---

## Authentication & Roles

Auth is handled by **Clerk** (`@clerk/nextjs`). Clerk owns credentials and sessions; the app keeps a mirror of each user in the local `users` table so it can attach roles and foreign keys.

**User sync:** When a user signs up or updates their profile, Clerk fires a webhook to `src/app/api/webhooks/clerk/route.ts`, which calls `syncClerkUser()` in `src/lib/users.ts`. That function upserts the user into `users` (matched by `clerk_user_id`, falling back to `email`; new users default to `BUYER`) and writes the role back into Clerk `publicMetadata`.

| Role | Access |
|---|---|
| `BUYER` | Place orders, upload payment proofs, view own orders |
| `ADMIN_KK` | Review and approve payment proofs |
| `ADMIN_IT` | Manage orders, shipping, and product/bundle data |

Every Server Action starts with one of these helpers (from `src/lib/auth.ts` / `src/lib/users.ts`), which throw on failure and abort the action:

| Helper | Guarantees |
|---|---|
| `getCurrentDbUserOrThrow()` | A signed-in user with a local DB record. |
| `requireAdmin()` | User is `ADMIN_KK` **or** `ADMIN_IT`. |
| `requireITAdmin()` | User is `ADMIN_IT`. |
| `requireOrderAdmin()` | User may act on orders (`ADMIN_KK` or `ADMIN_IT`). |

> Admin routes live under `/admin/[role]`, but authorization is enforced inside the Server Actions, **not** by route placement.

---

## Data Model

PostgreSQL, accessed with raw SQL (no ORM). The full schema dump is in [`db/schema.sql`](db/schema.sql); migrations are in [`db/migrations/`](db/migrations/). All IDs are `uuid`, and most tables carry `created_at` / `updated_at` maintained by the `update_updated_at_column()` trigger.

**Enums:** `user_role` (`BUYER`, `ADMIN_KK`, `ADMIN_IT`) · `order_status` (`AWAITING_PAYMENT`, `PAYMENT_REVIEW`, `PROCESSING`, `SHIPPED`, `DONE`, `CANCELLED`) · `payment_method` (`IBAN`) · `delivery_type` (`PICKUP`, `DELIVERY`) · `product_category` (`TSHIRT`, `TOTEBAG`)

```
users ─┬─< cart_items >─┬─ product_variants ─┬─< bundle_items >── bundles
       │                └─ bundles            └─ products ──< product_images
       │
       └─< orders ─┬─< order_items >─── product_variants / bundles
                   └─< order_status_logs >── users (changed_by_user_id)
```

| Table | Purpose |
|---|---|
| `users` | Local mirror of Clerk accounts; `role` drives authorization. |
| `products` | Catalog parent (name, slug, category, `weight_g`, `is_active`, `display_order`). Price/stock live on variants. |
| `product_variants` | Buyable unit — unique **size × color × fit_type**. Own `sku`, `price`, `original_price`, `stock`. `fit_type` ∈ {`REGULAR`, `OVERSIZED`}. |
| `product_images` | Images per product; bytes in `data` (bytea) or via `url`. `is_primary`, `sort_order`. |
| `bundles` | Promotional package sold as one SKU at a fixed price; own slug/sku, inline image, `is_active`, `display_order`. |
| `bundle_items` | Join table: which variants make up a bundle. |
| `cart_items` | One row per cart line for a signed-in user. Exactly one of `variant_id`/`bundle_id`. |
| `orders` | Order header: status, totals, delivery/pickup, payment proof, shipping fields. |
| `order_items` | Immutable line items. **Snapshots** `price_at_purchase`, `product_name_snapshot`, `sku_snapshot`. |
| `order_status_logs` | Append-only audit trail of status changes + acting admin. |
| `schema_migrations` | Managed by dbmate — do not edit. |

**Key invariants:**

- Price & stock live on **variants**, not products.
- A cart/order line is **either** a variant **or** a bundle, never both (DB check constraint).
- Orders **snapshot** prices and names at purchase time, so later edits never change history.
- Stock is decremented **inside the order-creation transaction** and can never go negative.
- Deleting a product cascades to its variants/images, but a variant referenced by `order_items` cannot be deleted (`ON DELETE RESTRICT`).

---

## Order Lifecycle

```
AWAITING_PAYMENT → PAYMENT_REVIEW → PROCESSING → SHIPPED → DONE
       │                  │
       └──────────────────┴──────────────▶ CANCELLED
```

1. Customer places an order → `AWAITING_PAYMENT`. Variant stock is decremented in the transaction and `payment_expires_at` is set.
2. Customer uploads a bank-transfer proof → `PAYMENT_REVIEW`.
3. `ADMIN_KK` approves → `PROCESSING` (or rejects → back to `AWAITING_PAYMENT`).
4. `ADMIN_IT` ships (SendCloud parcel created) → `SHIPPED`.
5. Order completes → `DONE`.

Unpaid orders past `payment_expires_at` are cancelled by the cron endpoint `src/app/api/cron/expire-orders/route.ts` (authenticated with `CRON_SECRET`), which calls `expireOverdueAwaitingPaymentOrders()`. Every status change is written to `order_status_logs` with the acting user.

---

## External Integrations

| Service | Used for | Entry points |
|---|---|---|
| **Clerk** | Auth, user sessions | `src/lib/users.ts`, `api/webhooks/clerk` |
| **Resend** | Transactional email (order/payment/shipping) | `src/lib/resend.ts`, `src/lib/actions/send-order-email.ts`, `src/lib/emails/` |
| **SendCloud** | Shipping labels, rates, tracking | `src/lib/sendcloud.ts`, `api/webhooks/sendcloud` |

---

## Database Migrations

Schema changes are managed with **dbmate** (wrapped by `scripts/run-dbmate.js`):

```bash
npm run db:new my_change   # create db/migrations/<timestamp>_my_change.sql
npm run db:up              # apply pending migrations
npm run db:rollback        # roll back the most recent migration
npm run db:status          # show applied / pending migrations
```

- Each migration has an `-- migrate:up` and `-- migrate:down` section. **Always** write a working `down`.
- `db/schema.sql` is **generated** — `db:up` / `db:rollback` rewrite it. Commit the regenerated `schema.sql` with the migration. Never edit it by hand.
- Ship the migration in the **same PR** as the code that depends on it.

---

## Coding Conventions

Enforced by convention and review — follow them to keep the codebase consistent.

- **Reads** go through the DAL (`src/lib/dal/`), called from a Server Component or Server Action.
- **Writes** go only through **Server Actions** (`src/lib/actions/`) — never from a route handler or the client.
- **Multi-step writes** are wrapped in `withTransaction()`.
- **Every Server Action**, in order: (1) auth helper → (2) validate/normalize input → (3) write via DAL / transaction → (4) `revalidatePath()` → (5) return a typed `{ ok }` result for expected failures.
- **Styling:** plain CSS only, using the design tokens in `src/app/globals.css`. No Tailwind, no CSS-in-JS.
- **TypeScript:** strict mode on; share domain types from `src/types/index.ts` rather than redefining shapes.

---

## Contributing

1. Branch off `master` — never push directly to `master`
2. Open a pull request with a clear description of the change
3. If your change includes a migration, include it in the same PR
4. Run `npm run lint` and `npm run build` locally before requesting review
5. Get review and approval before merging

---

## Contributors

Thanks to everyone who has contributed to the PPI Jerman Merch Shop:

| Contributor | GitHub |
|---|---|
| Navy Hanan | @nvhnn |
| Richie Jonathan | @rjrichie |
| Vincentius Reynaldo | @vincentreyy |
| Gabriel Madear | @GabrielMadear |
| Rafael Billy Jayadi | @RBillyJ |
| Nathan Kurnia | @nathankurnia |
| Jessica Felicia | @jessfelicia |

Maintained by the IT team of **Perhimpunan Pelajar Indonesia di Jerman (PPI Jerman)**.

---

## License

Internal project — PPI Jerman. Not open for public contributions at this time.
