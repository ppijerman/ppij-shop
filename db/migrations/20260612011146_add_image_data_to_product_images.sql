-- migrate:up
ALTER TABLE "product_images"
  ADD COLUMN IF NOT EXISTS "data" BYTEA,
  ADD COLUMN IF NOT EXISTS "content_type" TEXT,
  ALTER COLUMN "url" DROP NOT NULL;

-- migrate:down
ALTER TABLE "product_images"
  DROP COLUMN IF EXISTS "data",
  DROP COLUMN IF EXISTS "content_type",
  ALTER COLUMN "url" SET NOT NULL;


