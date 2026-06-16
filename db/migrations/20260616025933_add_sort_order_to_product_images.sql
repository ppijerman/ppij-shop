-- migrate:up

ALTER TABLE product_images ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

UPDATE product_images pi
SET sort_order = sub.rn - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY is_primary DESC, id ASC) AS rn
  FROM product_images
) sub
WHERE pi.id = sub.id;

-- migrate:down

