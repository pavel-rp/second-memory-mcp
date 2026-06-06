ALTER TABLE "learning_chunks" ADD COLUMN "order_index" integer;
UPDATE "learning_chunks" AS lc SET "order_index" = sub.rn FROM (SELECT "id", ROW_NUMBER() OVER (PARTITION BY "topic_id" ORDER BY "created_at", "id") AS rn FROM "learning_chunks") AS sub WHERE lc."id" = sub."id";
ALTER TABLE "learning_chunks" ALTER COLUMN "order_index" SET DEFAULT 1;
ALTER TABLE "learning_chunks" ALTER COLUMN "order_index" SET NOT NULL;
ALTER TABLE "learning_chunks" ADD CONSTRAINT "chk_order_index_positive" CHECK ("order_index" >= 1);
CREATE INDEX IF NOT EXISTS "idx_learning_chunks_topic_order" ON "learning_chunks" ("topic_id", "order_index");
