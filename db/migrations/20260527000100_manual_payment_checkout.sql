-- migrate:up
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE payment_method AS ENUM ('PAYPAL', 'IBAN');
  END IF;
END
$$;

ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'CANCELLED';

ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "payment_method" payment_method NOT NULL DEFAULT 'PAYPAL';

ALTER TABLE "orders"
  ALTER COLUMN "payment_method" DROP DEFAULT;

-- migrate:down
ALTER TABLE "orders"
  DROP COLUMN IF EXISTS "payment_method";

DROP TYPE IF EXISTS payment_method;
