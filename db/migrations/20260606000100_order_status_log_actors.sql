-- migrate:up
ALTER TABLE "order_status_logs"
  ADD COLUMN IF NOT EXISTS "changed_by_user_id" uuid;

ALTER TABLE "order_status_logs"
  ADD CONSTRAINT "fk_status_logs_changed_by_user"
  FOREIGN KEY ("changed_by_user_id") REFERENCES "users" ("id") ON DELETE SET NULL;

-- migrate:down
ALTER TABLE "order_status_logs"
  DROP CONSTRAINT IF EXISTS "fk_status_logs_changed_by_user";

ALTER TABLE "order_status_logs"
  DROP COLUMN IF EXISTS "changed_by_user_id";
