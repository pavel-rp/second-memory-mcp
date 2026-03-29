ALTER TABLE "session_question_attempts" ADD COLUMN "agent_quality" smallint;
ALTER TABLE "session_question_attempts" ADD COLUMN "question_type" text;
ALTER TABLE "session_question_attempts" ADD CONSTRAINT "chk_agent_quality" CHECK ("agent_quality" BETWEEN 0 AND 5);
ALTER TABLE "session_question_attempts" ADD CONSTRAINT "chk_question_type" CHECK ("question_type" IN ('recall', 'explain_apply', 'analyze_create'));
-- NOTE: The CHECK constraints above use the default (VALID) mode, which acquires an ACCESS
-- EXCLUSIVE lock and scans the entire table. For large tables, prefer the NOT VALID + VALIDATE
-- CONSTRAINT pattern to avoid blocking reads/writes during migration:
--   ALTER TABLE t ADD CONSTRAINT c CHECK (...) NOT VALID;
--   ALTER TABLE t VALIDATE CONSTRAINT c;
-- See migration 0009 for the canonical example of this pattern.
