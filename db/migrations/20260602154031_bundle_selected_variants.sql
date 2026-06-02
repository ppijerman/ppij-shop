-- migrate:up
ALTER TABLE cart_items
  ADD COLUMN IF NOT EXISTS selected_variant_ids UUID[] DEFAULT '{}';

-- migrate:down

