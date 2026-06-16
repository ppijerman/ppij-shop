-- migrate:up
ALTER TABLE products ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE bundles ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0;

UPDATE products p
SET display_order = sub.rn - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM products
) sub
WHERE p.id = sub.id;

UPDATE bundles b
SET display_order = sub.rn - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM bundles
) sub
WHERE b.id = sub.id;

-- migrate:down

