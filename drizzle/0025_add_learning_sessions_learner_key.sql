-- NEU-1015: nullable learner-isolation key on learning_sessions. No backfill and no NOT NULL
-- constraint here by design — NEU-1019 backfills existing rows from the configured owner key
-- and tightens this column to NOT NULL in a later migration.
ALTER TABLE "learning_sessions" ADD COLUMN "learner_key" text;
CREATE INDEX IF NOT EXISTS "idx_learning_sessions_learner_key" ON "learning_sessions" ("learner_key");
