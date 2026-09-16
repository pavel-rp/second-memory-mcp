-- NEU-1019: backfill every unkeyed `learning_sessions` row from the configured
-- OWNER_LEARNER_KEY setting, then enforce learner_key NOT NULL. Fully automatic
-- inside the ordinary db:migrate path — no out-of-band or manually-run step.
--
-- The runner (src/infrastructure/db/migrate.ts) sets the `app.owner_learner_key`
-- session GUC on the same connection this migration's transaction runs on, via
-- `select set_config('app.owner_learner_key', <value>, false)`. `current_setting`
-- is read with missing_ok = true, so an unset GUC reads as NULL rather than
-- erroring.
--
-- Idempotent: a repeat run with no unkeyed rows skips the backfill/refusal
-- branch entirely, and re-applying SET NOT NULL on an already-NOT NULL column
-- is a Postgres no-op.
--
-- Refusal: when unkeyed rows exist and the configured key is unset or blank
-- (including whitespace-only), this raises an exception naming the unkeyed row
-- count and the missing setting — never the key value — which rolls back the
-- whole pending migration batch and leaves this migration's row unrecorded in
-- __drizzle_migrations, so it re-applies automatically once the key is set.
DO $$
DECLARE
  unkeyed_count bigint;
  owner_key text;
BEGIN
  SELECT count(*) INTO unkeyed_count FROM "learning_sessions" WHERE "learner_key" IS NULL;

  IF unkeyed_count > 0 THEN
    owner_key := current_setting('app.owner_learner_key', true);

    IF owner_key IS NULL OR btrim(owner_key) = '' THEN
      RAISE EXCEPTION 'NEU-1019: % learning_sessions row(s) have a null learner_key and OWNER_LEARNER_KEY is not set (or is blank). Set OWNER_LEARNER_KEY and re-run migrations.', unkeyed_count;
    END IF;

    UPDATE "learning_sessions" SET "learner_key" = owner_key WHERE "learner_key" IS NULL;
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "learning_sessions" ALTER COLUMN "learner_key" SET NOT NULL;
