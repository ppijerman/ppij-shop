SET TIME ZONE 'Europe/Berlin';

TRUNCATE TABLE "users", "products", "bundles", "cart_items", "product_variants", "order_items", "order_status_logs", "bundle_items", "product_images" RESTART IDENTITY CASCADE;

INSERT INTO "users" (clerk_user_id, first_name, last_name, email, role, created_at, updated_at) VALUES 
('user_2NNEqL2nrIRdJ194ndJiSCjFMnP', 'Mulyono', NULL, 'mulyono@gmail.com', 'BUYER', NOW(), NOW()),
('user_2NNEqL2nrIRdJ194ndJiSCjFMnQ', 'John', 'Pork', 'john@pork.com', 'BUYER', NOW(), NOW()),
('user_2NNEqL2nrIRdJ194ndJiSCjFMnR', 'Budi', 'Santoso', 'budi@ppij.org', 'ADMIN_KK', NOW(), NOW());

INSERT INTO "products" (name, subtitle, category, weight_g, fit_type, "desc", tag, slug, created_at, updated_at)
VALUES
  ('Fang & Horn', 'OVERSIZED TEE — WHITE', 'TSHIRT', 220, 'normal', 'Kaos oversized 220gsm dengan hand-drawn graphic.', 'BESTSELLER', 'fang-and-horn', NOW(), NOW()),
  ('Trio Komodores', 'GRAPHIC TEE — BLACK', 'TSHIRT', 250, 'normal', 'Graphic tee dengan illustrasi.', 'NEW', 'trio-komodores', NOW(), NOW()),
  ('Elle the Elephant', 'BACK PRINT TEE — GREY', 'TSHIRT', 220, 'oversized', 'Tee abu dengan POV back print.', 'LIMITED', 'elle-the-elephant', NOW(), NOW()),
  ('"Einkaufen 101"', 'HEAVY CANVAS TOTE — BLUE PRINT', 'TOTEBAG', 400, 'none', 'Tote canvas dengan blue print.', 'NEW', 'einkaufen-101', NOW(), NOW()),
  ('"Mit Karte Bitte"', 'HEAVY CANVAS TOTE — GREEN PRINT', 'TOTEBAG', 400, 'none', 'Tote canvas dengan green print.', 'BESTSELLER', 'mit-karte-bitte', NOW(), NOW());

INSERT INTO "product_images" (product_id, url, is_primary)
SELECT p.id, v.url, v.is_primary
FROM (
  SELECT 'fang-and-horn' as slug, '/assets/v4/tshirt-grid.jpeg' as url, TRUE as is_primary
  UNION ALL SELECT 'trio-komodores', '/assets/v4/tshirt-grid.jpeg', TRUE
  UNION ALL SELECT 'elle-the-elephant', '/assets/v4/tshirt-grid.jpeg', TRUE
  UNION ALL SELECT 'einkaufen-101', '/assets/v4/totebag-grid.jpeg', TRUE
  UNION ALL SELECT 'mit-karte-bitte', '/assets/v4/totebag-grid.jpeg', TRUE
) v
JOIN "products" p ON p.slug = v.slug;

INSERT INTO "product_variants" (product_id, size, fit_type, price, original_price, sku, color_name, color_hex, stock, created_at, updated_at)SELECT p.id, v.size, v.fit_type, v.price, v.original_price, v.sku, v.color_name, v.color_hex, v.stock, NOW(), NOW()
FROM (
  SELECT 'fang-and-horn' as slug, 'S' as size, 'OVERSIZED' as fit_type, 25 as price, 30 as original_price, 'FH-S-WHITE' as sku, 'White' as color_name, '#F5F1E6' as color_hex, 10 as stock
  UNION ALL SELECT 'fang-and-horn', 'M', 'OVERSIZED', 25, 30, 'FH-M-WHITE', 'White', '#F5F1E6', 8
  UNION ALL SELECT 'fang-and-horn', 'L', 'OVERSIZED', 25, 30, 'FH-L-WHITE', 'White', '#F5F1E6', 5
  UNION ALL SELECT 'fang-and-horn', 'S', 'OVERSIZED', 25, 30, 'FH-S-BLACK', 'Black', '#0E0E0E', 7
  UNION ALL SELECT 'trio-komodores', 'S', 'NORMAL', 25, NULL, 'TK-S-BLACK', 'Black', '#0E0E0E', 10
  UNION ALL SELECT 'trio-komodores', 'S', 'NORMAL', 25, NULL, 'TK-S-CHARCOAL', 'Charcoal', '#3A3A3A', 5
  UNION ALL SELECT 'elle-the-elephant', 'S', 'NORMAL', 28, 35, 'EE-S-GREY', 'Grey', '#5A5A5A', 5
  UNION ALL SELECT 'elle-the-elephant', 'S', 'NORMAL', 28, 35, 'EE-S-SAND', 'Sand', '#C9B89A', 4
  UNION ALL SELECT 'einkaufen-101', 'ONE SIZE', 'none', 18, NULL, 'EK-OS-NATBLUE', 'Natural / Blue', '#E8E0CC', 20
  UNION ALL SELECT 'mit-karte-bitte', 'ONE SIZE', 'none', 18, NULL, 'MKB-OS-NATGREEN', 'Natural / Green', '#E8E0CC', 15
) v
JOIN "products" p ON p.slug = v.slug;

INSERT INTO "bundles" (name, "desc", price, original_price, slug, sku, created_at, updated_at) VALUES 
('Classic Bundle', 'Totebag + Normal Fit T-Shirt', 38, 43, 'classic-bundle', 'BNDL-CLASSIC', NOW(), NOW());

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
