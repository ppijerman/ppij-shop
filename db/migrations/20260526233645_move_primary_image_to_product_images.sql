-- migrate:up
ALTER TABLE product_images ADD COlUMN is_primary BOOLEAN DEFAULT false NOT NULL;

UPDATE product_images pi 
SET is_primary = true
FROM products p
WHERE pi.product_id = p.id AND pi.url = p.primary_image;

CREATE UNIQUE INDEX idx_product_images_only_one_primary
ON product_images (product_id)
WHERE (is_primary = true);

ALTER TABLE products DROP COlUMN primary_image;

-- migrate:down

