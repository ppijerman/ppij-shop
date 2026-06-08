-- migrate:up
ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "payment_expires_at" TIMESTAMPTZ;

UPDATE "orders"
SET "payment_expires_at" = "created_at" + INTERVAL '30 minutes'
WHERE "status" = 'AWAITING_PAYMENT'
  AND "payment_expires_at" IS NULL;

CREATE INDEX IF NOT EXISTS "idx_orders_awaiting_payment_expires_at"
  ON "orders" ("payment_expires_at")
  WHERE "status" = 'AWAITING_PAYMENT';

-- migrate:down
DROP INDEX IF EXISTS "idx_orders_awaiting_payment_expires_at";

ALTER TABLE "orders"
  DROP COLUMN IF EXISTS "payment_expires_at";
