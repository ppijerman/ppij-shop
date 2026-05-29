-- migrate:up
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE payment_method AS ENUM ('IBAN');
  END IF;
END
$$;

ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'CANCELLED';

ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "payment_method" payment_method NOT NULL DEFAULT 'IBAN',
  ADD COLUMN IF NOT EXISTS "shipping_tracking_number" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "payment_proof_data" BYTEA,
  ADD COLUMN IF NOT EXISTS "payment_proof_content_type" VARCHAR(100);

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
ALTER TABLE "orders"
  DROP CONSTRAINT IF EXISTS "orders_payment_method_iban_only";

ALTER TABLE "orders"
  DROP COLUMN IF EXISTS "payment_proof_content_type",
  DROP COLUMN IF EXISTS "payment_proof_data",
  DROP COLUMN IF EXISTS "shipping_tracking_number",
  DROP COLUMN IF EXISTS "payment_method";

DROP TYPE IF EXISTS payment_method;
