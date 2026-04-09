CREATE INDEX IF NOT EXISTS "idx_sqa_question_created_at"
  ON "session_question_attempts" ("session_question_id", "created_at" DESC);
