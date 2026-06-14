-- migrate:up
ALTER TABLE bundles ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- migrate:down

