ALTER TABLE "session_question_attempts" ADD COLUMN "snapshot_band" text;
ALTER TABLE "session_question_attempts" ADD COLUMN "snapshot_predicted_recall" real;
ALTER TABLE "session_question_attempts" ADD COLUMN "snapshot_interval_days" integer;
ALTER TABLE "session_question_attempts" ADD COLUMN "snapshot_days_overdue" real;
ALTER TABLE "session_question_attempts" ADD CONSTRAINT "chk_snapshot_band" CHECK ("snapshot_band" IN ('fresh', 'established'));
ALTER TABLE "session_question_attempts" ADD CONSTRAINT "chk_snapshot_predicted_recall" CHECK ("snapshot_predicted_recall" IS NULL OR ("snapshot_predicted_recall" > 0 AND "snapshot_predicted_recall" <= 1));
ALTER TABLE "session_question_attempts" ADD CONSTRAINT "chk_snapshot_days_overdue" CHECK ("snapshot_days_overdue" IS NULL OR "snapshot_days_overdue" >= 0);
-- NOTE: The CHECK constraints above use the default (VALID) mode, which acquires an ACCESS
-- EXCLUSIVE lock and scans the entire table. For large tables, prefer the NOT VALID + VALIDATE
-- CONSTRAINT pattern to avoid blocking reads/writes during migration:
--   ALTER TABLE t ADD CONSTRAINT c CHECK (...) NOT VALID;
--   ALTER TABLE t VALIDATE CONSTRAINT c;
-- See migration 0009 for the canonical example of this pattern.
-- Every existing row is NULL on all four new columns, so the validating scan is trivially
-- satisfied here — the cost is the lock for the scan duration, not a table rewrite.
