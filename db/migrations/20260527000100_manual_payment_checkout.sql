-- migrate:up
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE payment_method AS ENUM ('IBAN');
  END IF;
END
$$;

ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'CANCELLED';

ALTER TYPE order_status RENAME VALUE 'PENDING' TO 'AWAITING_PAYMENT';
ALTER TYPE order_status RENAME VALUE 'CONFIRMED' TO 'PAYMENT_REVIEW';

ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "payment_method" payment_method NOT NULL DEFAULT 'IBAN',
  ADD COLUMN IF NOT EXISTS "shipping_tracking_number" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "shipping_provider" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "payment_proof_data" BYTEA,
  ADD COLUMN IF NOT EXISTS "payment_proof_content_type" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "pickup_details" TEXT;

UPDATE "orders"
SET "payment_method" = 'IBAN'
WHERE "payment_method"::text <> 'IBAN';

ALTER TABLE "orders"
  DROP CONSTRAINT IF EXISTS "orders_payment_method_iban_only";

ALTER TABLE "orders"
  ADD CONSTRAINT "orders_payment_method_iban_only"
  CHECK ("payment_method" = 'IBAN');

ALTER TABLE "orders"
  ALTER COLUMN "payment_method" DROP DEFAULT;

-- migrate:down
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'PAYMENT_REVIEW' AND enumtypid = 'order_status'::regtype) THEN
    ALTER TYPE order_status RENAME VALUE 'PAYMENT_REVIEW' TO 'CONFIRMED';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'AWAITING_PAYMENT' AND enumtypid = 'order_status'::regtype) THEN
    ALTER TYPE order_status RENAME VALUE 'AWAITING_PAYMENT' TO 'PENDING';
  END IF;
END
$$;

ALTER TABLE "orders"
  DROP CONSTRAINT IF EXISTS "orders_payment_method_iban_only";

ALTER TABLE "orders"
  DROP COLUMN IF EXISTS "pickup_details",
  DROP COLUMN IF EXISTS "payment_proof_content_type",
  DROP COLUMN IF EXISTS "payment_proof_data",
  DROP COLUMN IF EXISTS "shipping_provider",
  DROP COLUMN IF EXISTS "shipping_tracking_number",
  DROP COLUMN IF EXISTS "payment_method";

DROP TYPE IF EXISTS payment_method;
