TRUNCATE TABLE "users", "products", "bundles", "cart_items", "product_variants", "order_items", "order_status_logs", "bundle_items", "product_images" RESTART IDENTITY CASCADE;

INSERT INTO "users" (clerk_user_id, first_name, last_name, email, role, created_at, updated_at) VALUES 
('user_2NNEqL2nrIRdJ194ndJiSCjFMnP', 'Mulyono', NULL, 'mulyono@gmail.com', 'BUYER', NOW(), NOW()),
('user_2NNEqL2nrIRdJ194ndJiSCjFMnQ', 'John', 'Pork', 'john@pork.com', 'BUYER', NOW(), NOW()),
('user_2NNEqL2nrIRdJ194ndJiSCjFMnR', 'Budi', 'Santoso', 'budi@ppij.org', 'ADMIN_KK', NOW(), NOW()),
('user_4GGFEqLgargergegrfndJiSCj76R', 'Siti', NULL, 'it@ppij.org', 'ADMIN_IT', NOW(), NOW());

INSERT INTO "products" (name, subtitle, category, fit_type, "desc", tag, primary_image, slug, created_at, updated_at) VALUES 
('Fang & Horn', 'OVERSIZED TEE — WHITE', 'TSHIRT', 'normal', 'Kaos oversized 220gsm...', 'BESTSELLER', '/assets/v4/tshirt-grid.jpeg', 'fang-and-horn', NOW(), NOW()),
('Trio Komodores', 'GRAPHIC TEE — BLACK', 'TSHIRT', 'normal', 'Graphic tee...', 'NEW', '/assets/v4/tshirt-grid.jpeg', 'trio-komodores', NOW(), NOW());

INSERT INTO "product_variants" (product_id, size, fit_type, price, sku, color_name, color_hex, stock, created_at, updated_at)
SELECT id, 'S', 'OVERSIZED', 25, 'FH-S-WHITE', 'White', '#F5F1E6', 10, NOW(), NOW() FROM "products" WHERE slug = 'fang-and-horn';

INSERT INTO "bundles" (name, "desc", price, original_price, slug, created_at, updated_at) VALUES 
('Classic Bundle', 'Totebag + Normal Fit T-Shirt', 38, 43, 'classic-bundle', NOW(), NOW());

INSERT INTO "bundle_items" (bundle_id, variant_id)
SELECT b.id, v.id 
FROM "bundles" b, "product_variants" v 
WHERE b.slug = 'classic-bundle' AND v.sku = 'FH-S-WHITE';

INSERT INTO "orders" (user_id, status, total_price, delivery_type, created_at, updated_at)
SELECT id, 'PENDING', 38, 'DELIVERY', NOW(), NOW() FROM "users" WHERE email = 'mulyono@gmail.com';
