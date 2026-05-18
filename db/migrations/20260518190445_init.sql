-- migrate:up
-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE IF NOT EXISTS "users" (
	"id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	"clerk_user_id" TEXT NOT NULL,
	"first_name" VARCHAR(255) NOT NULL,
	"last_name" VARCHAR(255),
	"email" VARCHAR(255) NOT NULL UNIQUE,
	"role" VARCHAR(255) NOT NULL,
	"created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
	"updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "products" (
	"id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" VARCHAR(255) NOT NULL,
	"subtitle" VARCHAR(255) NOT NULL,
	"fit_type" VARCHAR(255) NOT NULL,
	"primary_image" TEXT NOT NULL,
	"slug" VARCHAR(255) NOT NULL UNIQUE,
	"category" VARCHAR(255) NOT NULL,
	"desc" TEXT NOT NULL,
	"tag" VARCHAR(255),
	"created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
	"updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "orders" (
	"id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" UUID NOT NULL,
	"status" VARCHAR(255) NOT NULL,
	"total_price" NUMERIC NOT NULL,
	"delivery_address" VARCHAR(255),
	"delivery_type" VARCHAR(255) NOT NULL,
	"payment_proof_url" VARCHAR(255),
	"created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
	"updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "bundles" (
	"id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" VARCHAR(255) NOT NULL,
	"price" NUMERIC NOT NULL,
	"original_price" NUMERIC,
	"slug" VARCHAR(255) NOT NULL UNIQUE,
	"desc" TEXT NOT NULL,
	"created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
	"updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "cart_items" (
	"id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	"variant_id" UUID,
	"user_id" UUID NOT NULL,
	"bundle_id" UUID,
	"quantity" INTEGER NOT NULL,
	"created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
	CONSTRAINT "cart_items_exclusive_id" CHECK (
		(variant_id IS NOT NULL AND bundle_id IS NULL) OR 
		(variant_id IS NULL AND bundle_id IS NOT NULL)
	)
);

CREATE TABLE IF NOT EXISTS "product_variants" (
	"id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	"product_id" UUID NOT NULL,
	"size" CHAR(10),
	"stock" INTEGER NOT NULL,
	"fit_type" VARCHAR(50),
	"price" NUMERIC NOT NULL,
	"original_price" NUMERIC,
	"sku" VARCHAR(100) NOT NULL UNIQUE,
	"color_name" VARCHAR(100),
	"color_hex" VARCHAR(7),
	"created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
	"updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "order_items" (
	"id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	"order_id" UUID NOT NULL,
	"variant_id" UUID,
	"bundle_id" UUID,
	"quantity" INTEGER NOT NULL,
	"price_at_purchase" NUMERIC NOT NULL,
	CONSTRAINT "order_items_exclusive_id" CHECK (
		(variant_id IS NOT NULL AND bundle_id IS NULL) OR 
		(variant_id IS NULL AND bundle_id IS NOT NULL)
	)
);

CREATE TABLE IF NOT EXISTS "order_status_logs" (
	"id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	"order_id" UUID NOT NULL,
	"status" VARCHAR(255) NOT NULL,
	"note" VARCHAR(255) NOT NULL,
	"created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "bundle_items" (
	"id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	"variant_id" UUID NOT NULL,
	"bundle_id" UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS "product_images" (
	"id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	"product_id" UUID NOT NULL,
	"url" TEXT NOT NULL
);

ALTER TABLE "orders"
ADD CONSTRAINT "fk_orders_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL;

ALTER TABLE "product_variants"
ADD CONSTRAINT "fk_variants_product" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE;

ALTER TABLE "order_items"
ADD CONSTRAINT "fk_order_items_order" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE CASCADE;

ALTER TABLE "order_items"
ADD CONSTRAINT "fk_order_items_variant" FOREIGN KEY ("variant_id") REFERENCES "product_variants" ("id") ON DELETE SET NULL;

ALTER TABLE "order_items"
ADD CONSTRAINT "fk_order_items_bundle" FOREIGN KEY ("bundle_id") REFERENCES "bundles" ("id") ON DELETE SET NULL;

ALTER TABLE "order_status_logs"
ADD CONSTRAINT "fk_status_logs_order" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE CASCADE;

ALTER TABLE "cart_items"
ADD CONSTRAINT "fk_cart_items_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

ALTER TABLE "cart_items"
ADD CONSTRAINT "fk_cart_items_variant" FOREIGN KEY ("variant_id") REFERENCES "product_variants" ("id") ON DELETE CASCADE;

ALTER TABLE "cart_items"
ADD CONSTRAINT "fk_cart_items_bundle" FOREIGN KEY ("bundle_id") REFERENCES "bundles" ("id") ON DELETE CASCADE;

ALTER TABLE "bundle_items"
ADD CONSTRAINT "fk_bundle_items_bundle" FOREIGN KEY ("bundle_id") REFERENCES "bundles" ("id") ON DELETE CASCADE;

ALTER TABLE "bundle_items"
ADD CONSTRAINT "fk_bundle_items_variant" FOREIGN KEY ("variant_id") REFERENCES "product_variants" ("id") ON DELETE CASCADE;

ALTER TABLE "product_images"
ADD CONSTRAINT "fk_product_images_product" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "idx_users_clerk_id" ON "users" ("clerk_user_id");
CREATE INDEX IF NOT EXISTS "idx_products_slug" ON "products" ("slug");
CREATE INDEX IF NOT EXISTS "idx_bundles_slug" ON "bundles" ("slug");
CREATE INDEX IF NOT EXISTS "idx_orders_user_id" ON "orders" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_order_items_order_id" ON "order_items" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_cart_items_user_id" ON "cart_items" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_product_variants_product_id" ON "product_variants" ("product_id");
CREATE INDEX IF NOT EXISTS "idx_product_images_product_id" ON "product_images" ("product_id");
CREATE INDEX IF NOT EXISTS "idx_order_status_logs_order_id" ON "order_status_logs" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_bundle_items_bundle_id" ON "bundle_items" ("bundle_id");
CREATE INDEX IF NOT EXISTS "idx_bundle_items_variant_id" ON "bundle_items" ("variant_id");

CREATE TRIGGER set_timestamp_users BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_timestamp_products BEFORE UPDATE ON "products" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_timestamp_orders BEFORE UPDATE ON "orders" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_timestamp_bundles BEFORE UPDATE ON "bundles" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_timestamp_product_variants BEFORE UPDATE ON "product_variants" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- migrate:down