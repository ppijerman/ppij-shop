# Database Management with dbmate

We use [dbmate](https://github.com/amacneil/dbmate) to handle our PostgreSQL database migrations.

## Setup

### 1. Install dbmate
If you haven't installed dbmate yet, you can do so via Homebrew (macOS):
```bash
brew install dbmate
```

### 2. Environment Variables
Create or update your `.env.local` file with your database connection string. 
**Note:** For local development, you usually need to disable SSL.

```env
DATABASE_URL="postgres://postgres:password@localhost:5433/ppij_shop?sslmode=disable"
```

## Common Commands

### Check Migration Status
See which migrations have been applied and which are pending:
```bash
dbmate status
```

### Apply Migrations
Run all pending migrations and update `db/schema.sql`:
```bash
dbmate up
```

### Create a New Migration
Generate a new migration file with a timestamp:
```bash
dbmate new <migration_name>
```

### Rollback
Undo the last applied migration:
```bash
dbmate rollback
```

---

## Seeding Data

After running `dbmate up`, you should populate your database with initial development data:

```bash
psql $DATABASE_URL -f db/seed.sql
```

## !!!!

**Never Edit Old Migrations:** Once a migration has been committed and shared with the team, do not edit it. Create a new migration instead.
