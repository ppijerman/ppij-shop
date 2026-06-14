-- migrate:up
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS selected_variant_ids UUID[] DEFAULT '{}';

-- migrate:down

