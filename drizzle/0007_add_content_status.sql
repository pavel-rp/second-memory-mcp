ALTER TABLE "learning_chunks" ADD COLUMN "content_status" text DEFAULT 'final' NOT NULL;
ALTER TABLE "learning_chunks" ADD CONSTRAINT "chk_content_status" CHECK ("learning_chunks"."content_status" IN ('draft', 'final'));
