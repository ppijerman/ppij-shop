-- migrate:up
ALTER TABLE bundles
  ADD COLUMN image_data BYTEA,
  ADD COLUMN image_content_type TEXT;

-- migrate:down
