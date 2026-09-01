-- migrate:up
ALTER TABLE orders ADD COLUMN pickup_location TEXT;

-- migrate:down
ALTER TABLE orders DROP COLUMN pickup_location;
