-- NEU-1054: re-runnable like 0025-0029 (IF NOT EXISTS), so migration rewind tests can replay it.
ALTER TABLE "session_question_attempts" ADD COLUMN IF NOT EXISTS "actual_prompt_text" text;
--> statement-breakpoint
ALTER TABLE "session_question_attempts" ADD COLUMN IF NOT EXISTS "question_scope" jsonb;
--> statement-breakpoint
-- A first attempt always answers the original question; only legacy retries stay unknown.
UPDATE "session_question_attempts" AS a SET "actual_prompt_text" = q."prompt_text"
FROM "session_questions" AS q
WHERE a."session_question_id" = q."id" AND a."attempt_number" = 1 AND a."actual_prompt_text" IS NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "canonical_answer_identities" (
  "id" text PRIMARY KEY NOT NULL,
  "learner_key" text NOT NULL,
  "language" text NOT NULL,
  "scope_hash" text NOT NULL,
  "scope" jsonb NOT NULL,
  "source_fingerprint" text NOT NULL,
  "current_revision_id" text,
  "head_version" integer DEFAULT 0 NOT NULL,
  "head_history" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" bigint NOT NULL,
  "updated_at" bigint NOT NULL,
  CONSTRAINT "chk_canonical_head_version" CHECK ("head_version" >= 0),
  CONSTRAINT "chk_canonical_head_history" CHECK (jsonb_typeof("head_history") = 'array')
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_canonical_identity" ON "canonical_answer_identities" ("learner_key", "language", "scope_hash", "source_fingerprint");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "canonical_answer_revisions" (
  "id" text PRIMARY KEY NOT NULL,
  "identity_id" text NOT NULL REFERENCES "canonical_answer_identities" ("id") ON DELETE CASCADE,
  "head_version" integer NOT NULL,
  "parts" jsonb NOT NULL,
  "observation" jsonb NOT NULL,
  "correction_reason" text,
  "created_at" bigint NOT NULL,
  CONSTRAINT "chk_canonical_revision_version" CHECK ("head_version" > 0),
  CONSTRAINT "chk_canonical_parts_array" CHECK (jsonb_typeof("parts") = 'array' AND jsonb_array_length("parts") > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_canonical_revision_identity" ON "canonical_answer_revisions" ("id", "identity_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_canonical_revision_version" ON "canonical_answer_revisions" ("identity_id", "head_version");
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_canonical_current_revision') THEN
    ALTER TABLE "canonical_answer_identities" ADD CONSTRAINT "fk_canonical_current_revision" FOREIGN KEY ("current_revision_id", "id") REFERENCES "canonical_answer_revisions" ("id", "identity_id");
  END IF;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "canonical_attempt_associations" (
  "attempt_id" text PRIMARY KEY NOT NULL REFERENCES "session_question_attempts" ("id") ON DELETE CASCADE,
  "revision_id" text NOT NULL REFERENCES "canonical_answer_revisions" ("id"),
  "created_at" bigint NOT NULL
);
