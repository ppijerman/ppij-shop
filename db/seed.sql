SET TIME ZONE 'Europe/Berlin';

TRUNCATE TABLE "users", "products", "bundles", "cart_items", "product_variants", "order_items", "order_status_logs", "bundle_items", "product_images" RESTART IDENTITY CASCADE;

INSERT INTO "users" (clerk_user_id, first_name, last_name, email, role, created_at, updated_at) VALUES 
('user_2NNEqL2nrIRdJ194ndJiSCjFMnP', 'Mulyono', NULL, 'mulyono@gmail.com', 'BUYER', NOW(), NOW()),
('user_2NNEqL2nrIRdJ194ndJiSCjFMnQ', 'John', 'Pork', 'john@pork.com', 'BUYER', NOW(), NOW()),
('user_2NNEqL2nrIRdJ194ndJiSCjFMnR', 'Budi', 'Santoso', 'budi@ppij.org', 'ADMIN_KK', NOW(), NOW()),
('user_4GGFEqLgargergegrfndJiSCj76R', 'Siti', NULL, 'it@ppij.org', 'ADMIN_IT', NOW(), NOW());

INSERT INTO "products" (name, subtitle, category, weight_g, fit_type, "desc", tag, primary_image, slug, created_at, updated_at) 
VALUES 
  ('Fang & Horn', 
  'OVERSIZED TEE — WHITE', 
  'TSHIRT', 
  220,
  'normal', 
  'Kaos oversized 220gsm...', 
  'BESTSELLER', 
  '/assets/v4/tshirt-grid.jpeg', 
  'fang-and-horn', 
  NOW(), NOW()),
  ('Trio Komodores', 
  'GRAPHIC TEE — BLACK', 
  'TSHIRT', 
  250,
  'normal', 
  'Graphic tee...', 
  'NEW', 
  '/assets/v4/tshirt-grid.jpeg', 
  'trio-komodores', 
  NOW(), NOW());

INSERT INTO "product_variants" (product_id, size, fit_type, price, sku, color_name, color_hex, stock, created_at, updated_at)
SELECT id, 'S', 'OVERSIZED', 25, 'FH-S-WHITE', 'White', '#F5F1E6', 10, NOW(), NOW() FROM "products" WHERE slug = 'fang-and-horn';

INSERT INTO "bundles" (name, "desc", price, original_price, slug, created_at, updated_at) VALUES 
('Classic Bundle', 'Totebag + Normal Fit T-Shirt', 38, 43, 'classic-bundle', NOW(), NOW());

INSERT INTO "bundle_items" (bundle_id, variant_id)
SELECT b.id, v.id 
FROM "bundles" b, "product_variants" v 
WHERE b.slug = 'classic-bundle' AND v.sku = 'FH-S-WHITE';

INSERT INTO "orders" (user_id, status, total_price, delivery_address, delivery_type, created_at, updated_at)
SELECT 
  id, 
  'PENDING', 
  38, 
  '{"street": "Eupenerstraße", "number": "70", "postcode": "52072", "city": "Aachen", "country": "Germany"}'::JSONB, 
  'DELIVERY', 
  NOW(), NOW() 
FROM "users" WHERE email = 'mulyono@gmail.com';

INSERT INTO "order_items" (order_id, variant_id, quantity, price_at_purchase, product_name_snapshot, sku_snapshot)
SELECT
  o.id,
  v.id,
  1,
  v.price,
  p.name,
  v.sku
FROM "orders" o CROSS JOIN "product_variants" v
JOIN "products" p ON v.product_id = p.id
WHERE v.sku = 'FH-S-WHITE' AND o.total_price = 38;

INSERT INTO "cart_items" (user_id, variant_id, quantity, created_at, updated_at)
SELECT u.id, v.id, 1, NOW(), NOW() 
FROM "users" u, "product_variants" v 
WHERE u.email = 'john@pork.com' AND v.sku = 'FH-S-WHITE';
