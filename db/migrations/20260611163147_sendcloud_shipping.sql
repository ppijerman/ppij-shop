-- migrate:up
ALTER TABLE "orders"
    ADD COLUMN IF NOT EXISTS "shipping_cost" NUMERIC NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "shipping_method_id" TEXT,
    ADD COLUMN IF NOT EXISTS "sendcloud_parcel_id" BIGINT;

CREATE UNIQUE INDEX IF NOT EXISTS "oders_sendcloud_parcel_id_idx"
    ON "orders" ("sendcloud_parcel_id")
    WHERE "sendcloud_parcel_id" IS NOT NULL;

-- migrate:down

