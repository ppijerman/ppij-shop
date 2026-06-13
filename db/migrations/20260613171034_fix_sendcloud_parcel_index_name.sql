-- migrate:up
ALTER INDEX IF EXISTS "oders_sendcloud_parcel_id_idx" RENAME TO "orders_sendcloud_parcel_id_idx";

-- migrate:down
