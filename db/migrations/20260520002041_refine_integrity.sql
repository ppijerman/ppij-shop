-- migrate:up
CREATE TYPE user_role AS ENUM ('BUYER', 'ADMIN_KK', 'ADMIN_IT');
CREATE TYPE product_category AS ENUM ('TSHIRT', 'TOTEBAG');
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DONE');
CREATE TYPE delivery_type AS ENUM ('PICKUP', 'DELIVERY');

ALTER TABLE "users"
  ALTER COLUMN "role" TYPE user_role USING role::user_role,
  ADD CONSTRAINT "uq_users_clerk_id" UNIQUE ("clerk_user_id");

ALTER TABLE "products"
  ADD COLUMN "weight_g" NUMERIC NOT NULL,
  ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  ALTER COLUMN "category" TYPE product_category USING category::product_category;

ALTER TABLE "product_variants"
  ADD CONSTRAINT "chk_stock" CHECK (stock >= 0),
  ADD CONSTRAINT "chk_price" CHECK (price >= 0),
  ADD CONSTRAINT "chk_original_price" CHECK (original_price IS NULL OR original_price >= price);

ALTER TABLE "bundles"
  ADD COLUMN "sku" VARCHAR(100) NOT NULL UNIQUE,
  ADD CONSTRAINT "chk_bundle_price" CHECK (price >= 0),
  ADD CONSTRAINT "chk_bundle_original_price" CHECK (original_price IS NULL OR original_price >= price);

ALTER TABLE "orders"
  ALTER COLUMN "delivery_address" TYPE JSONB USING (
    CASE
      WHEN delivery_address IS NULL THEN NULL
      ELSE jsonb_build_object('street', delivery_address)
    END
  ),
  ALTER COLUMN "status" TYPE order_status USING status::order_status,
  ALTER COLUMN "delivery_type" TYPE delivery_type USING delivery_type::delivery_type;

ALTER TABLE "orders"
  ADD CONSTRAINT "chk_order_total_price" CHECK (total_price >= 0),
  ADD CONSTRAINT "chk_delivery_address_logic" CHECK (
   (delivery_type = 'PICKUP') OR
   (delivery_type = 'DELIVERY' AND 
   delivery_address ? 'street' AND 
   delivery_address ? 'city' AND
   delivery_address ? 'postcode' AND
   delivery_address ? 'country')
  );

ALTER TABLE "order_items" DROP CONSTRAINT "fk_order_items_variant";
ALTER TABLE "order_items" DROP CONSTRAINT "fk_order_items_bundle";

ALTER TABLE "order_items"
  ADD COLUMN "product_name_snapshot" VARCHAR(255),
  ADD COLUMN "sku_snapshot" VARCHAR(100),
  ADD CONSTRAINT "chk_order_item_qty" CHECK (quantity > 0),
  ADD CONSTRAINT "fk_order_items_variant" FOREIGN KEY ("variant_id") REFERENCES "product_variants" ("id") ON DELETE RESTRICT,
  ADD CONSTRAINT "fk_order_items_bundle" FOREIGN KEY ("bundle_id") REFERENCES "bundles" ("id") ON DELETE RESTRICT;

ALTER TABLE "cart_items" 
  ADD CONSTRAINT "chk_cart_item_qty" CHECK (quantity > 0);

CREATE UNIQUE INDEX "idx_unique_cart_variant" ON "cart_items" ("user_id", "variant_id") WHERE "variant_id" IS NOT NULL;
CREATE UNIQUE INDEX "idx_unique_cart_bundle" ON "cart_items" ("user_id", "bundle_id");

ALTER TABLE "bundle_items"
  ADD CONSTRAINT "uq_bundle_variant" UNIQUE ("bundle_id", "variant_id");

ALTER TABLE "order_status_logs"
  ALTER COLUMN "status" TYPE order_status USING status::order_status;


-- migrate:down

