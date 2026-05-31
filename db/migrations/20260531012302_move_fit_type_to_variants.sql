-- migrate:up
UPDATE product_variants pv
SET fit_type = p.fit_type
FROM products p
WHERE pv.product_id = p.id
  AND (pv.fit_type IS NULL OR pv.fit_type = '');

UPDATE product_variants SET fit_type = 'REGULAR' WHERE fit_type = 'NORMAL';
UPDATE product_variants SET fit_type = 'REGULAR' WHERE fit_type IS NULL OR fit_type = '';

ALTER TABLE product_variants
ADD CONSTRAINT chk_fit_type CHECK (fit_type IN ('REGULAR', 'OVERSIZED'));

ALTER TABLE product_variants ALTER COLUMN fit_type SET NOT NULL;

ALTER TABLE products DROP COLUMN fit_type;

-- migrate:down

