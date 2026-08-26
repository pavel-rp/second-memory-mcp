# 13 — The DDL, the migration plan, and the rollout/rollback runbook

**Task:** NEU-1006 (SUB-13) · **Charter:** C011 (umbrella NEU-893) · **Authored:** 2026-08-26 · **Verification cutoff:** `fd05ca1`, 2026-08-26
**Model:** claude-opus-5[1m]
**Covers:** OUT-19 (`90_outcome-register.md`)

**Consumes:** `DR-C11-S2-1`, `DR-C11-S2-2`, `DR-C11-S2-3` (SUB-2); `DR-C11-S4-1`,
`DR-C11-S4-2`, `DR-C11-S4-3` (SUB-4); `DR-C11-S5-1`, `DR-C11-S5-2` (SUB-5); `DR-C11-S6-1`,
`DR-C11-S6-2` (SUB-6); `DR-C11-S7-1`, `DR-C11-S7-2` (SUB-7); `DR-C11-S16-1` (SUB-16);
`DR-C11-S8-2` (SUB-8); `DR-C11-S9-1` (SUB-9); and, from C010,
`../C010-system-and-repository-architecture/decision-records/DR-C10-S8-2_token-bound-identity-over-per-call-identity.md`
together with `NEU-850`'s `OUT-2` as reproduced at
`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:50`–`:53`.

---

## 0. What this chapter is

Three artifacts, authored at a fidelity an implementer executes without asking a question, and
**applied nowhere**: the schema DDL (§2), the migration plan (§3), and the rollout/rollback runbook
over SUB-7's ten stages (§4), with the disable-path control surface those stages name but do not
build (§5).

**This chapter decides almost nothing.** SUB-2 fixed the identity rule, SUB-4 the token binding,
SUB-5 the enforcement point, SUB-6 the fourteen-table disposition, SUB-7 the ten-stage order and
SUB-16 the attribution carrier. What is genuinely chosen here is the *constraint shape* the DDL uses
to represent those decisions (`DR-C11-S13-1`), the *sweep contract* (`DR-C11-S13-2`) and the
*control surface* of the six disable paths (`DR-C11-S13-3`). Everything else is composition, and
every consumed constraint names its source.

**Zero files under `src/`, `drizzle/`, `.github/` or `docker-compose.yml` change here.** The SQL below
is document text. It is not a migration, it creates no journal entry, and nothing in it has been
executed against any database.

**Nothing here has been measured.** No production credential exists in the authoring environment —
`SMOKE_PROD_*`, `DATABASE_URL`, `AUTH_*` and `VPS_*` were probed and are all unset, which is
`F-S1-2`'s condition, unchanged. Every duration, batch size and threshold below is a cited
derivation, a registered stand-in with an owner and a re-validation trigger, or a deferred spike.
**No number in this chapter is an observation**, and `observed-in-production` is used zero times.

---

## 1. The schema as it is at this cutoff, re-read rather than inherited

Every fact in this section was re-read from the repository at `fd05ca1`. Nothing is carried on an
upstream chapter's citation alone, because the DDL below is written against it.

`src/infrastructure/db/schema.ts` declares **twelve** Drizzle tables, and **not one carries a
`user_id`, a `principal_id` or any other owner column**:

| Table | Primary key | Declared at |
| --- | --- | --- |
| `public.learning_topics` | `id` | `src/infrastructure/db/schema.ts:21`–`:47`, key at `:24` |
| `public.learning_chunks` | `id` | `src/infrastructure/db/schema.ts:49`–`:97`, key at `:52` |
| `public.learning_sessions` | `id` | `src/infrastructure/db/schema.ts:99`–`:124`, key at `:102` |
| `public.session_chunks` | `id` | `src/infrastructure/db/schema.ts:126`–`:154`, key at `:129` |
| `public.session_questions` | `id` | `src/infrastructure/db/schema.ts:156`–`:177`, key at `:159` |
| `public.session_question_chunks` | `id` | `src/infrastructure/db/schema.ts:179`–`:195`, key at `:182` |
| `public.session_question_attempts` | `id` | `src/infrastructure/db/schema.ts:197`–`:245`, key at `:200` |
| `public.session_question_attempt_revisions` | `id` | `src/infrastructure/db/schema.ts:250`–`:285`, key at `:253` |
| `public.notes` | `id` | `src/infrastructure/db/schema.ts:288`–`:310`, key at `:291` |
| `public.context_tokens` | `id` | `src/infrastructure/db/schema.ts:312`–`:321`, key at `:315` |
| `infrastructure.linter_validation_corpus` | `id` (bigserial) | `src/infrastructure/db/schema.ts:333`–`:362`, key at `:336` |
| `infrastructure.linter_rule_validation_report` | `rule_id` | `src/infrastructure/db/schema.ts:364`–`:378`, key at `:367` |

The two log tables are **not** in `src/infrastructure/db/schema.ts`. They exist only as raw SQL:
`infrastructure.mcp_request_log` at `drizzle/0010_create_infrastructure_mcp_request_log.sql:3`,
extended by `drizzle/0012_extend_mcp_request_log.sql:1`–`:3`; and
`infrastructure.operation_event_log` at `drizzle/0013_create_operation_event_log.sql:1`. Both key on
`id BIGSERIAL PRIMARY KEY` and both carry `timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()` and
`created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`. `mcp_request_log` additionally carries
`correlation_id` and `session_id` (`drizzle/0012_extend_mcp_request_log.sql:2`–`:3`).

`context_tokens` carries exactly three columns — `id TEXT PRIMARY KEY`,
`created_at BIGINT NOT NULL`, `expires_at BIGINT NOT NULL` — and one index at
`src/infrastructure/db/schema.ts:320`. This is `F-S1-1`, re-confirmed rather than restated.

**The boot order, which prices everything in §4 and §5.** `src/transport/main.ts:27` calls
`initializeDatabase()` on **both** transports; `src/infrastructure/db/migrate.ts:45`–`:49` resolves
the migrations folder and runs the Drizzle migrator. Configuration resolves *after*, at
`src/transport/main.ts:42`–`:43` and `src/composition-root.ts:379`. There are twenty-five SQL
files under `drizzle/` and the journal's last entry is `idx: 24`, tag
`0024_add_attempt_scheduling_snapshot`, so the first migration this plan describes would be `0025`.

### 1.1 How the migrator decides what to run, and the two consequences that shape §3

Read from the library rather than assumed, because the entire migration plan's shape depends on it.

`src/infrastructure/db/migrate.ts:45`–`:49` calls the Drizzle `node-postgres` migrator on the
application's own pool. That migrator (`node_modules/drizzle-orm/pg-core/dialect.cjs:46`–`:73`)
creates `drizzle.__drizzle_migrations` (`id SERIAL PRIMARY KEY`, `hash text NOT NULL`, `created_at
bigint`), selects **the single most recent applied row**, and applies every migration whose journal
timestamp is greater than that row's `created_at` — the check at `:64` is
`if (!lastDbMigration || Number(lastDbMigration.created_at) < migration.folderMillis)`.

**Consequence one: a migration file runs exactly once, so a sweep cannot be a migration file.** The
migrator *process* runs on every one of `OBJ-7`'s ≥ 7 daily restarts; an individual migration's
statements do not. A batched sweep shipped as a migration file would be marked applied after its
first boot and would never run again — so it would either have to finish inside that one boot, which
defeats batching entirely, or it would leave the population permanently half-keyed with **no
mechanism to resume**, which is `R-S5-1`'s exact precondition arriving by accident.

**This is why §3 separates two artifacts that SUB-6 and SUB-7 both describe as one.** The schema DDL
of §2 lands as ordinary **one-shot Drizzle migrations**. The data sweeps of §3 land as a **boot-time
sweep runner that is not a migration** — predicate-driven, time-boxed, and re-entered on every boot
until its predicate returns nothing. Both still run at boot, so SUB-7's feasibility assessment and
`R-S6-2`'s "cannot be deferred" both survive unchanged; what changes is which mechanism carries
which half. Registered as **`F-S13-9`**, because SUB-6's `S1`–`S5` and SUB-7's *"Yes, but only as
boot migrations"* both read as though the sweeps were migration files, and neither sub-task owns the
distinction.

**Consequence two: the ledger's `created_at` must not be used as the cutover instant.** The value
inserted is `migration.folderMillis` — the `when` field from `drizzle/meta/_journal.json`, a
**hand-authored constant in the repository**, not the moment the migration was applied. It can
precede the real application instant by an arbitrary interval. §3.4's marker table therefore exists
for a correctness reason and not a tidiness one: reading the cutover from the ledger would set it to
an authoring timestamp and archive the wrong rows. `F-S13-7`.

Two smaller facts follow from the same source. **All pending migrations run inside one transaction**
(`session.transaction` wraps the loop), so a long sweep shipped as a migration would hold one
transaction open for its whole duration — a second, independent reason the sweeps are not
migrations. And **`CREATE INDEX CONCURRENTLY` cannot be used anywhere in this plan**, because it
cannot run inside a transaction block; the indexes in §2.1 are therefore plain `CREATE INDEX`.

---

## 2. The DDL

### 2.1 The ownership key — `NEU-850`'s `OUT-2`, realized

The consumed constraint, quoted from where C010 reproduces it:

> **`NEU-850's OUT-2`** decided that learner ownership lives in **the MCP core database schema,
> keyed to the JWT subject**: a `user_id` column, `NOT NULL`, on every core table, with the JWT
> subject threaded through the row-owning repository ports rather than resolved ad hoc at each call
> site.
>
> — `../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:50`–`:53`

It is **converged but unimplemented**, *"never an existing schema fact"*
(`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:65`–`:66`),
which §1 confirms directly. The column name `user_id` is taken from that decision verbatim.

**One widening is consumed, not introduced here.** SUB-5 widens the *value* from the literal "JWT
subject" to *"the resolved principal identifier"* so the key is well-defined on STDIO, where there is
no JWT (`05_the-enforcement-point-that-confines-every-read-and-write.md` §8.1, clause `C1`;
`DR-C11-S4-1` clause 2). This chapter writes SUB-5's widened value and states it as SUB-5's, not as
its own.

**The ten tables that take the key** are exactly SUB-6's `backfill` and `backfill-by-join` rows
(`06_the-disposition-of-every-unowned-row.md` §3, rows 1–9 and 11). **They span two schemas** — nine
in `public` and `infrastructure.linter_validation_corpus` — so the `S3` and `S5` DDL cannot be
written as one `public`-schema loop. That is `F-S13-4`.

```sql
-- ============================================================
-- S3 / stage T3 — add the ownership key, NULLABLE, to all ten
-- population-A tables. Additive; nothing refuses; reversible by
-- dropping the columns.
-- Source: NEU-850 OUT-2 (name, type, eventual NOT NULL);
--         DR-C11-S6-1 (which tables); DR-C11-S7-1 T3 (when).
-- ============================================================
ALTER TABLE public.learning_topics                     ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE public.learning_chunks                     ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE public.learning_sessions                   ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE public.session_chunks                      ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE public.session_questions                   ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE public.session_question_chunks             ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE public.session_question_attempts           ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE public.session_question_attempt_revisions  ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE public.notes                               ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE infrastructure.linter_validation_corpus    ADD COLUMN IF NOT EXISTS user_id TEXT;

-- The predicate every row-owning query will carry needs an index on each
-- table. Created here, at T3, so T8's first confined request does not meet
-- a sequential scan. CONCURRENTLY is NOT used: the boot migrator wraps ALL
-- pending migrations in ONE transaction (see 1.1) and CREATE INDEX CONCURRENTLY
-- cannot run inside a transaction block. A stated cost, not an oversight.
CREATE INDEX IF NOT EXISTS idx_learning_topics_user_id                     ON public.learning_topics (user_id);
CREATE INDEX IF NOT EXISTS idx_learning_chunks_user_id                     ON public.learning_chunks (user_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_id                   ON public.learning_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_session_chunks_user_id                      ON public.session_chunks (user_id);
CREATE INDEX IF NOT EXISTS idx_session_questions_user_id                   ON public.session_questions (user_id);
CREATE INDEX IF NOT EXISTS idx_session_question_chunks_user_id             ON public.session_question_chunks (user_id);
CREATE INDEX IF NOT EXISTS idx_session_question_attempts_user_id           ON public.session_question_attempts (user_id);
CREATE INDEX IF NOT EXISTS idx_session_question_attempt_revisions_user_id  ON public.session_question_attempt_revisions (user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id                               ON public.notes (user_id);
CREATE INDEX IF NOT EXISTS idx_linter_validation_corpus_user_id            ON infrastructure.linter_validation_corpus (user_id);
```

`ADD COLUMN … IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS` are used throughout, but **not for the
reason a reader might assume, and the assumption matters enough to state**. See §1.1: a Drizzle
migration file executes **exactly once**, not on every boot. The `IF NOT EXISTS` clauses are
therefore defence against a statement being run by hand during an incident, or against a partially
applied file being re-authored — not against the boot loop. `ADD CONSTRAINT` is written **without**
a guard because PostgreSQL has no `ADD CONSTRAINT IF NOT EXISTS`, and it does not need one: the file
runs once.

### 2.2 The three principal states, and the `iff` rule as a database constraint

**There are two carriers, not one, and they are differently shaped.** Conflating them is the single
easiest error to make in this DDL, so they are set out side by side before either is written.

| | `public.context_tokens` | `infrastructure.mcp_request_log` and `infrastructure.operation_event_log` |
| --- | --- | --- |
| Source | `DR-C11-S4-2` | `DR-C11-S16-1` |
| Columns | `principal_id`, `principal_kind`, `principal_claim_source` | `principal_kind`, `learner_key` |
| `principal_kind` domain | **two-valued** — `user \| client` | **three-valued** — `user \| client \| none` |
| Nullability at landing | all three **nullable**, tightened at `T9` | `principal_kind NOT NULL` from the start, `learner_key` nullable |
| Where the learner key lives | `principal_id`, **when and only when** `principal_kind = 'user'` | `learner_key`, non-null **iff** `principal_kind = 'user'` |

The asymmetry is not an inconsistency, and SUB-5 already reconciled it rather than leaving it for a
reader to infer: *"`none` is unreachable on the token row and reachable at the enforcement point"*
(`05_the-enforcement-point-that-confines-every-read-and-write.md:266`–`:276`, registered as
`F-S5-6`, with the reconciliation routed here). A `context_tokens` row exists only because a
principal *was* determined, so the third state has no row to sit on; a log row is written whether or
not one was, so it needs one. **This chapter therefore emits two different `CHECK` constraints, and
they are consistent by construction rather than by coincidence.** The asymmetric nullability is
likewise consumed, not chosen: `DR-C11-S16-1` gives `principal_kind` a correct default in `none`
(*"the record predates attribution"*, `16_attribution-and-detection.md:89`), and the token binding
has no correct default at all, which is why one lands in a single step and the other in three
(`07_the-rollout-sequence-and-what-each-stage-cannot-undo.md:266`–`:273`).

```sql
-- ============================================================
-- T1 — the attribution carrier on both log tables.
-- One step: principal_kind has a correct default ('none'), so no
-- backfill and no nullable window are needed. Source: DR-C11-S16-1.
-- These two tables have NO Drizzle definition (§1), so nothing in
-- src/infrastructure/db/schema.ts changes and no snapshot regenerates.
-- ============================================================
ALTER TABLE infrastructure.mcp_request_log
  ADD COLUMN IF NOT EXISTS principal_kind TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS learner_key    TEXT;

ALTER TABLE infrastructure.operation_event_log
  ADD COLUMN IF NOT EXISTS principal_kind TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS learner_key    TEXT;

-- The three-valued domain (DR-C11-S16-1 decision 4: client and none are
-- distinct states and must never be folded together).
ALTER TABLE infrastructure.mcp_request_log
  ADD CONSTRAINT chk_mcp_request_log_principal_kind
  CHECK (principal_kind IN ('user', 'client', 'none'));

ALTER TABLE infrastructure.operation_event_log
  ADD CONSTRAINT chk_operation_event_log_principal_kind
  CHECK (principal_kind IN ('user', 'client', 'none'));

-- THE iff RULE, ENFORCED. learner_key is non-null if and only if
-- principal_kind = 'user'. This is DR-C11-S16-1 decision 1's own wording,
-- written as a constraint rather than as an instruction, and it is what
-- makes R-S4-1's failure mode unrepresentable on these two tables.
ALTER TABLE infrastructure.mcp_request_log
  ADD CONSTRAINT chk_mcp_request_log_learner_key_iff_user
  CHECK ((principal_kind = 'user') = (learner_key IS NOT NULL));

ALTER TABLE infrastructure.operation_event_log
  ADD CONSTRAINT chk_operation_event_log_learner_key_iff_user
  CHECK ((principal_kind = 'user') = (learner_key IS NOT NULL));

CREATE INDEX IF NOT EXISTS idx_mcp_request_log_learner_key    ON infrastructure.mcp_request_log (learner_key);
CREATE INDEX IF NOT EXISTS idx_operation_event_log_learner_key ON infrastructure.operation_event_log (learner_key);
```

`(a) = (b)` over two booleans is Postgres's own biconditional and is exact here: neither operand can
be `NULL`, because `principal_kind` is `NOT NULL` and `IS NOT NULL` never yields `NULL`. The
constraint is therefore total, with no three-valued-logic escape.

The index on `learner_key` exists because SUB-16 chose to **copy** the key rather than reference it,
precisely so that erasure is `WHERE learner_key = $1` (`DR-C11-S16-1`, Rationale). An erasure
predicate with no index is a sequential scan over the largest tables in the deployment.

```sql
-- ============================================================
-- T3 / stage A — the context-token binding, all three columns NULLABLE.
-- Source: DR-C11-S4-2 clauses 1-3 and 5.
-- These columns DO belong to a Drizzle-defined table, so the
-- implementation charter must also extend src/infrastructure/db/schema.ts
-- and regenerate the snapshot. See F-S13-6.
-- ============================================================
ALTER TABLE public.context_tokens
  ADD COLUMN IF NOT EXISTS principal_id           TEXT,
  ADD COLUMN IF NOT EXISTS principal_kind         TEXT,
  ADD COLUMN IF NOT EXISTS principal_claim_source TEXT;

-- The two-valued domain. `none` is deliberately absent: it is unreachable
-- on this table by construction: see 05_the-enforcement-point-that-confines-every-read-and-write.md:266-:276
ALTER TABLE public.context_tokens
  ADD CONSTRAINT chk_context_tokens_principal_kind
  CHECK (principal_kind IS NULL OR principal_kind IN ('user', 'client'));

-- The provenance domain. DR-C11-S4-2 clause 3.
ALTER TABLE public.context_tokens
  ADD CONSTRAINT chk_context_tokens_claim_source
  CHECK (principal_claim_source IS NULL
         OR principal_claim_source IN ('token:sub', 'token:azp', 'configured:transport-principal'));

-- A row is wholly bound or wholly unbound — never half. Without this a
-- partially-written binding is a representable state, and the gate's
-- "NULL binding => reject" rule (DR-C11-S4-2 clause 5) would have to be
-- evaluated per column rather than per row.
ALTER TABLE public.context_tokens
  ADD CONSTRAINT chk_context_tokens_binding_is_whole
  CHECK (num_nonnulls(principal_id, principal_kind, principal_claim_source) IN (0, 3));

-- Provenance and kind must agree. DR-C11-S2-2 determines the kind and
-- DR-C11-S2-3 keeps provenance a separate field; this constraint stops the
-- two from disagreeing on a row, which is the shape a re-introduced
-- `sub || azp` merge would leave behind.
-- `configured:transport-principal` is compatible with either kind, because
-- on STDIO the kind is the operator's DECLARED kind (DR-C11-S4-1 clause 2).
ALTER TABLE public.context_tokens
  ADD CONSTRAINT chk_context_tokens_source_matches_kind
  CHECK (principal_claim_source IS NULL
         OR (principal_claim_source = 'token:sub'                    AND principal_kind = 'user')
         OR (principal_claim_source = 'token:azp'                    AND principal_kind = 'client')
         OR (principal_claim_source = 'configured:transport-principal'));
```

#### The one place the `iff` rule cannot be written as a null-ness constraint, and what is done about it

On the log tables the rule is a nullability fact, so a `CHECK` states it exactly. On
`context_tokens` it is not: `principal_id` is non-null under **both** kinds, and its
learner-key-ness is a property of *how a consumer reads it*. That is precisely `R-S4-1` — *"a
consumer that reads `principal_id` and ignores `principal_kind` has re-created, one layer lower,
exactly the `payload.sub || azp` collapse"*
(`04_the-stdio-identity-gate-and-the-bound-context-token.md` §4).

SUB-5 settled `R-S4-1` at the port boundary by making the principal an indivisible
`(principal_id, principal_kind)` pair (`DR-C11-S5-1` clause 2) and handed this chapter the job of
*"mak[ing] it structural in DDL"*
(`05_the-enforcement-point-that-confines-every-read-and-write.md:1436`). This is how:

```sql
-- LANDS AT T9, NOT T3 — with the tightening, as part of what SUB-7 calls
-- "the carrier's constraint". Adding a STORED generated column REWRITES the
-- table, and at T3 that rewrite would run over the entire pre-cutover
-- population under ACCESS EXCLUSIVE; by T9 the table has been emptied by T5
-- and holds only rows minted between T5 and T6, so the rewrite is trivial.
-- Nothing needs the column before T9: the enforcement point that goes live
-- at T8 reads the indivisible (principal_id, principal_kind) pair, never
-- this column.
--
-- The learner key as a GENERATED column: NULL by construction whenever the
-- kind is not `user`. A consumer cannot read the learner key without the
-- database having consulted the kind first, because the database computed
-- the value from it.
--
-- This ADDS a derived column; it asserts no new state and contradicts
-- nothing in DR-C11-S4-2, whose three columns remain the only stored
-- binding. It also aligns the token row's vocabulary with the log tables',
-- where the same concept is already spelled `learner_key`.
ALTER TABLE public.context_tokens
  ADD COLUMN IF NOT EXISTS learner_key TEXT
  GENERATED ALWAYS AS (CASE WHEN principal_kind = 'user' THEN principal_id END) STORED;
```

**What this does and does not close.** It closes `R-S4-1` on the token row: a consumer reading
`learner_key` cannot get a service principal's identifier, whatever it does with `principal_kind`.
It does **not** close it on the ten owned tables, where `user_id` is stored with no `principal_kind`
beside it and the guarantee is entirely upstream — the adapter refuses `client` and `none` before any
write (`DR-C11-S5-1` clause 3). No database constraint can check that, because the fact the check
would need is not in the row. That residual is `R-S13-4`, registered rather than implied.

**Three costs, stated.** A `STORED` generated column occupies storage per row. Its expression cannot
be altered in place — changing it means dropping and re-adding the column. And **adding one rewrites
the table**, which is why the statement is placed at `T9` rather than with the other two `T3`
additions: `T5` empties `context_tokens` wholesale **four stages earlier**, so by `T9` the rewrite
runs over only the rows minted between `T5` and `T6`. All three costs are acceptable at that
position and would not all be acceptable at `T3`. Generated columns require **PostgreSQL 12 or
later**; see `SPK-S13-1`.

*(`T5` to `T9` is four stages, not six. The figure is spelled out here because `F-S13-8` registers
that two merged texts get this same separation wrong, and a draft of this paragraph got it wrong in
exactly the same way.)*

### 2.3 The partial unique index SUB-5 §4.2 requires

SUB-5 deletes `createSession`'s orchestration guard and re-expresses the one-active-session-per-
learner rule as *"a partial unique index over `(owner, status)` restricted to `status = 'active'`"*,
stating the requirement and routing the authoring here
(`05_the-enforcement-point-that-confines-every-read-and-write.md:444`–`:446`). It also records that
the current guard is a time-of-check-to-time-of-use race (`F-S5-8`), which the index closes as a side
effect.

```sql
-- T9 / stage S5's companion. Placed at T9 rather than T3 because before the
-- backfill every user_id is NULL, and NULLs are distinct in a unique index —
-- so at T3 the index would be created and would constrain nothing, which is
-- exactly the "present but confining nothing" condition R1 warns reads as
-- evidence of confinement.
CREATE UNIQUE INDEX IF NOT EXISTS uq_learning_sessions_one_active_per_user
  ON public.learning_sessions (user_id, status)
  WHERE status = 'active';
```

The literal two-column form SUB-5 names is written here. Because `status` is constant under the
index's own predicate, `(user_id, status) WHERE status = 'active'` and `(user_id) WHERE status =
'active'` are semantically identical; the two-column form is kept so the artifact matches the
requirement as stated. `status` is `NOT NULL DEFAULT 'active'` and constrained to
`('active','completed')` at `src/infrastructure/db/schema.ts:107` and `:122`, so the predicate is
well-defined and the index is non-trivial.

> **This index will fail on any realistic production population, and a pre-flight probe is owed
> before it is attempted.** `status` defaults to `'active'` (`src/infrastructure/db/schema.ts:107`)
> and only moves to `'completed'` when a session is completed, so **every abandoned session stays
> `'active'` for ever**. After `S4` writes **one identical `user_id` into every row**, any two
> historically-active sessions therefore collide on `(user_id, status)` and the index creation
> aborts. This is not a remote possibility: `F-S5-8` records that the guard the index replaces was a
> time-of-check-to-time-of-use race that *"does not prevent two active sessions"*, so the pre-cutover
> population is precisely the population that was never constrained. **A uniform backfill converts a
> per-learner uniqueness rule into a global one.**
>
> None of SUB-6's twelve probes covers it — `P-DUP-1`, `P-DUP-2` and `P-DUP-3` cover `notes`,
> `learning_topics` and the four already-unique-indexed tables
> (`06_the-disposition-of-every-unowned-row.md` §6.2), never multiple active sessions. The probe is
> written here as `P-DUP-4` (§3.7) and is a **hard entry condition on `T9`**, with a stated
> remediation rather than an abort: unlike a dirty-data pathology, this one is expected, benign and
> fixable in place. Registered as **`F-S13-10`**.

```sql
-- P-DUP-4 — a HARD entry condition on T9, run AFTER S4 and immediately
-- before the index is created. Non-1 means the index will abort.
SELECT COUNT(*) AS active_sessions FROM public.learning_sessions WHERE status = 'active';

-- Remediation, if it returns more than 1. This is a DATA decision, not a
-- schema one, and it is the operator's to take: the sessions are real and
-- abandoned, not corrupt. Close all but the most recent, preserving it.
--   UPDATE public.learning_sessions SET status = 'completed', updated_at = <now-epoch-ms>
--   WHERE status = 'active'
--     AND id <> (SELECT id FROM public.learning_sessions
--                WHERE status = 'active' ORDER BY start_time DESC LIMIT 1);
-- Then re-run P-DUP-4 and proceed only when it returns 0 or 1.
```

**Why a remediation and not an abort.** `R9`'s abort condition exists for pathologies *"a dirty-data
pathology that no aggregate query probed for"* — states that indicate the data is wrong. Multiple
active sessions do not indicate wrong data; they indicate a rule that was never enforced, which is
exactly what SUB-5 deleted the orchestration guard to fix. Aborting would leave the operator with no
path forward; closing the stale sessions is the intended end state and is reversible in the only
sense that matters (a completed session is not deleted). The distinction is stated because treating
every non-zero probe as an abort is how a runbook becomes unexecutable.

### 2.4 The consent record

SUB-8 designs the versioned consent record and routes its DDL here: *"a new MCP-core-owned table in
the `public` schema. It **does not exist at this cutoff**; the DDL is **SUB-13's** (NEU-1006) under
OUT-19. Proposed columns: `consent_id`, `learner_key`, `purpose_id`, `policy_version`, `state`,
`granted_at`, `withdrawn_at`, `source`, `recorded_by`"* (`08_consent-and-what-a-learner-can-export-and-erase.md` §5, `LD-S8-1`).

```sql
CREATE TABLE IF NOT EXISTS public.learner_consent (
  consent_id     TEXT PRIMARY KEY,
  learner_key    TEXT        NOT NULL,
  purpose_id     TEXT        NOT NULL,
  policy_version TEXT        NOT NULL,
  state          TEXT        NOT NULL,
  granted_at     BIGINT      NOT NULL,          -- epoch ms, matching every other timestamp in `public`
  withdrawn_at   BIGINT,                        -- epoch ms; NULL while the grant stands
  source         TEXT        NOT NULL,
  recorded_by    TEXT        NOT NULL,
  CONSTRAINT chk_learner_consent_state
    CHECK (state IN ('granted', 'withdrawn')),
  CONSTRAINT chk_learner_consent_withdrawn_at_iff_withdrawn
    CHECK ((state = 'withdrawn') = (withdrawn_at IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS idx_learner_consent_learner_key ON public.learner_consent (learner_key);
CREATE UNIQUE INDEX IF NOT EXISTS uq_learner_consent_current
  ON public.learner_consent (learner_key, purpose_id, policy_version);
```

`granted_at`/`withdrawn_at` are `BIGINT` epoch ms because every timestamp in the `public` schema is
(`src/infrastructure/db/schema.ts:110`–`:112`, `:317`); the `infrastructure` schema uses `TIMESTAMPTZ`
and is not the model here. `state`'s two values and the `withdrawn_at` biconditional are derived from
SUB-8's own `granted`/`withdrawn` vocabulary; if SUB-8 intends a third state the constraint is where
it must be added, and this chapter does not invent one.

**This table has no stage.** SUB-7's ten-stage order carries no stage that lands it, because SUB-8
sits at dependency position 10 and SUB-7 at position 9 — SUB-7 sequenced the five sweeps and the four
gate stages it was handed, and the consent record was not among them. Inventing an eleventh stage
here would re-decide OUT-3, which is out of scope. The gap is registered as `F-S13-3` with the
placement carried as `OI-S13-1`, owner SUB-7's (NEU-1001), co-named `NEU-896`.

### 2.5 Row-level security — recommended, second, and inert as usually written

`OI-S5-1` is routed here as *"the party that would author the RLS DDL"*
(`05_the-enforcement-point-that-confines-every-read-and-write.md:1261`). SUB-5 is explicit that RLS
is **not** the enforcement point and is *"recommended, second, and not primary"* precisely so this
open item cannot block OUT-8. That framing is consumed unchanged.

**The open item records one obstacle. There is a second, and it is decisive as usually written.**
`OI-S5-1` records the *transaction cost*: a session-level setting leaks across a shared pool
(`max: 4`, `src/infrastructure/db/client.ts:42`), so every row-owning read would have to run inside a
transaction, and whether that is affordable against `OBJ-1` is unpriced. That is true and unchanged
here. The second obstacle is ownership:

- `src/infrastructure/db/migrate.ts:46` is `const pool = getPool();` — **the boot migrator runs on
  the same pool, the same `DATABASE_URL` and therefore the same database role as every application
  query** (`src/infrastructure/db/client.ts:37`–`:53`).
- A role that executes `CREATE SCHEMA` and `CREATE TABLE` **owns** the resulting tables.
- PostgreSQL exempts a table's owner from that table's row-level-security policies **unless
  `ALTER TABLE … FORCE ROW LEVEL SECURITY` is set**.
- No `ROW LEVEL SECURITY`, `CREATE POLICY` or `FORCE` statement exists anywhere under `drizzle/` or
  `src/` at this cutoff.

So an RLS layer written the usual way — `ENABLE ROW LEVEL SECURITY` plus `CREATE POLICY` — would be
**silently inert on this deployment**: it would appear in the schema, review as defence in depth, and
filter nothing. That is registered as `F-S13-2`. It is an **addition** to `OI-S5-1`, not a
contradiction of it, so no amendment is routed to `NEU-895`.

A further bound: the repository's own compose runs Postgres as `postgres`, the cluster superuser
(`docker-compose.yml:6`), and **a superuser bypasses RLS even with `FORCE`**. The production compose
stack is off-repo (`.github/workflows/cd-prod.yml:15`, `:26`–`:30`) so the production role is
unobserved; `SPK-S1-4` and `SPK-S1-9` bound what is knowable about it from here.

The DDL is therefore published with its own precondition attached, and **is not recommended for
adoption until `OI-S5-1` is priced and the role question is answered**:

```sql
-- NOT the enforcement point (DR-C11-S5-1 clause 5). Do not apply this
-- without (a) OI-S5-1 priced against OBJ-1 and (b) a confirmed
-- non-superuser, non-owner application role. Without both, it is inert.
ALTER TABLE public.notes ENABLE  ROW LEVEL SECURITY;
ALTER TABLE public.notes FORCE   ROW LEVEL SECURITY;   -- without this line the owner bypasses every policy below

CREATE POLICY notes_owner_isolation ON public.notes
  USING      (user_id = current_setting('app.principal_id', true))
  WITH CHECK (user_id = current_setting('app.principal_id', true));

-- The setting must be TRANSACTION-local (the third argument to set_config),
-- not session-local, or it leaks between requests across the shared pool.
-- This is exactly the transaction requirement OI-S5-1 leaves unpriced:
--   BEGIN;
--   SELECT set_config('app.principal_id', $1, true);
--   ... the adapter's own statements ...
--   COMMIT;
```

`current_setting(..., true)` returns `NULL` when the setting is unset, and `user_id = NULL` is
`NULL`, which is not `TRUE`, so an unset principal selects **no rows** rather than all of them. That
is the safe failure direction, and it is worth stating because the two-argument form would raise
instead. It is nonetheless an **empty scope, not a refusal** — the opposite of what `DR-C11-S5-1`
clause 3 requires of the primary layer, and a second reason this layer is second.

### 2.6 Re-verifying SUB-5's `CAP-S5-1` derivation against the DDL as written

The sub-task's own acceptance requires this check, and requires that a divergence route back to
SUB-5 rather than change the derivation.

`DR-C11-S5-2` derives `holds` for `SC-S3-12` (Notes, `public.notes`) under a composed target state
with five changes, of which `C1` is *"`public.notes` carries the ownership key `user_id NOT NULL`,
keyed to the resolved principal identifier"*.

| `C1`'s requirement | The DDL as written | Verdict |
| --- | --- | --- |
| Column named `user_id` on `public.notes` | §2.1, `ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS user_id TEXT` | **Realized** |
| `NOT NULL` | §3.6's `S5`, `ALTER TABLE public.notes ALTER COLUMN user_id SET NOT NULL` at `T9` | **Realized**, at the stage SUB-7 places it |
| Keyed to the resolved principal identifier | §3.5's `S4` writes the V1–V7-verified target subject; the enforcement point writes it thereafter (`DR-C11-S5-1` clause 3) | **Realized** |
| `C5` — a reachable transition onto a populated table | §2.1 nullable → §3.5 backfill → §3.6 tighten, the three-step form `F-S5-10` requires | **Realized** |

**No divergence on `C1` or `C5` for `notes`. Nothing is routed back to SUB-5 on the `holds`
derivation.** The scope of that sentence is exactly the two of `DR-C11-S5-2`'s five enumerated
changes that this artifact realizes: `C1`, the ownership key, and `C5`, the reachable transition.
**`C2` (the enforcement point applied to `NotesRepository`), `C3` (SUB-4's STDIO gate) and `C4`
(SUB-2's identity rule) are not checked here and are not certified**, because none is this
sub-task's to build and none is realized by DDL. A reader must not take the row above as a clearance
of the derivation as a whole.

**Four divergences are found elsewhere and are routed together.** SUB-5's per-port table says
*"`session_chunks` inherits ownership through its session rather than carrying its own key — stated
as a DDL requirement for SUB-13, not authored here"*
(`05_the-enforcement-point-that-confines-every-read-and-write.md:335`) and, in the next row,
*"The three child tables inherit ownership through `session_questions`"* (`:336`) — that is
`session_chunks`, `session_question_chunks`, `session_question_attempts` and
`session_question_attempt_revisions`. SUB-6 gives all four the disposition `backfill-by-join`, which
its own vocabulary defines as *"existing rows receive the key derived from a parent row across a
declared, `NOT NULL` foreign key"* — the row **receives** a key
(`06_the-disposition-of-every-unowned-row.md` §2.1, §3 rows 4, 6, 7, 8) — and counts all four among
the ten tables `S3` adds the column to and `S5` sets `NOT NULL`. SUB-7's `T7` and `T9` exit
conditions are both stated over **ten** tables, which is unsatisfiable over six.

The DDL follows SUB-6 and SUB-7: all four carry their own `user_id`, derived by join. The
reasons are that OUT-2 owns the dispositions, that two stages' exit conditions are counted over ten
tables and would be unsatisfiable over nine, and that a table with no key of its own cannot carry the
adapter's predicate without a join the predicate does not have. **The divergence is registered as
`F-S13-1` and routed to SUB-5 (NEU-997); it is not absorbed into this chapter's prose and no upstream
text is edited.**

---

## 3. The migration plan

### 3.1 The disposition, restated once as the sweep set

SUB-6's fourteen rows (`06_the-disposition-of-every-unowned-row.md` §3) map onto SUB-6's five sweeps
(§9.2) and SUB-7's ten stages (`DR-C11-S7-1`) as follows. This table restates nothing it does not
have to; it exists so an implementer can see which SQL belongs to which stage.

| Sweep | Stage | Tables | Disposition | What it does |
| --- | --- | --- | --- | --- |
| `S1` | `T2` | `infrastructure.mcp_request_log`, `infrastructure.operation_event_log` | `archive` | Move pre-cutover rows to a retained store; live tables continue from empty |
| `S2` | `T5` | `public.context_tokens` | `purge` | Delete every row. **Irreversible.** |
| `S3` | `T3` | the ten population-A tables | — | Add `user_id`, nullable (§2.1) |
| `S4` | `T7` | the ten population-A tables | `backfill`, `backfill-by-join` | Write the verified target subject, in four waves |
| `S5` | `T9` | the ten population-A tables | — | `SET NOT NULL` |

`infrastructure.linter_rule_validation_report` takes `no-key-owed` and appears in no sweep: *"a
statement about a **rule**, not about a learner"* (`06_the-disposition-of-every-unowned-row.md` §3
row 12). It is listed here so its absence below is visible as a decision rather than as an omission.

### 3.2 The sweep contract

`R-S6-2` requires the sweeps to be **batched, idempotent and resumable**, and `DR-C11-S7-2` clause 5
upgrades that from a mitigation preference to a hard obligation: *"a sweep that is not resumable
cannot be paused by this control class at all."* Both are consumed. The contract every sweep below
satisfies:

1. **Batched.** No sweep runs to completion in one boot unless it happens to fit. Each boot executes
   slices until either the slice budget expires or the sweep's predicate returns zero rows.
2. **Idempotent at the statement level.** Every statement's `WHERE` clause excludes the rows it has
   already acted on. Re-running a completed sweep affects zero rows and raises no error. This matters
   because the **sweep runner** re-enters on every one of `OBJ-7`'s ≥ 7 daily restarts. (The schema
   DDL is a different case: a migration file runs exactly once — §1.1, `F-S13-9`.)
3. **Resumable with no separate progress state.** **The resume cursor is the target predicate
   itself** — `WHERE user_id IS NULL` for `S4`, `WHERE timestamp < :cutover` for `S1`, the table's
   own emptiness for `S2`. A separate progress ledger was considered and rejected: it would have to
   be updated transactionally with each batch, and a ledger that can disagree with the data is a
   second thing that can be wrong. See `DR-C11-S13-2`.
4. **Safe under a concurrent second boot.** Every batch selects `FOR UPDATE SKIP LOCKED`, so two
   overlapping migrators divide the work instead of blocking or double-writing. `R-S15-3` records
   that the platform cannot guarantee exactly one concurrent boot-time migrator, and `F-S7-6` records
   that cd-prod's `concurrency: group: cd-prod` makes the window conditional rather than continuous.
   Neither entry is re-raised; the sweeps are simply written to survive the window.
5. **Interruption-safe.** Each batch is one statement in one implicit transaction. A container killed
   mid-sweep leaves committed batches committed and the in-flight batch rolled back; the next boot
   resumes from the predicate. No batch leaves a row half-processed.

### 3.3 Batch sizing when the row counts do not exist

`CAP-S7-1` is unambiguous: `T2` and `T7` *"scale with row counts that were never taken (`OI-S6-1`)"*,
so **no stage is shown to fit `OBJ-8`**. That cap is not lifted here, and no batch size is derived
from a count nobody took.

**What makes a batch size derivable without a row count is choosing a bound that does not depend on
one.** The per-boot slice is bounded by a **wall clock**, not by a row target:

```
while (elapsed_in_this_sweep < SM_MIGRATION_SLICE_MS) {
    n = execute one batch statement (LIMIT SM_MIGRATION_SLICE_ROWS)
    if (n == 0) {
        // NOT "the sweep is done" — only "this statement matched nothing".
        // Completion is a separate question, asked of the sweep's own
        // remaining-work predicate, never inferred from a rowcount:
        if (remaining_work_count() == 0) { sweep is complete }
        break   // either way, stop; a repeated zero-match makes no progress
    }
}
```

A time box is self-limiting whatever the table contains: it stops when the clock says so, and it
needs no estimate of rows-per-second, rows-in-table, or bytes-per-row to do it. The row ceiling is a
**secondary** guard, present so that a single pathologically slow statement cannot overrun the clock
check, which is only evaluated between statements.

**What a time box cannot do is bound total completion.** The number of boots the sweep needs still
scales with the row count, and the row count is still unknown. So the honest statement is:

> **The per-boot cost is bounded by construction. The number of boots is unbounded and unknown.**
> `CAP-S7-1`'s residual is unchanged; what changes is that the risk moves from *"a boot may breach
> `OBJ-8` by an unknown amount"* to *"the migration may take an unknown number of days"*. The second
> is the better failure to have, and it is still a real one. Carried as `R-S13-1`.

The two default values are **stand-ins, not derivations**, and are registered as `A-S13-1` with an
owner and a re-validation trigger:

| Parameter | Default | Why this shape, stated as an argument and not as a measurement |
| --- | --- | --- |
| `SM_MIGRATION_SLICE_MS` | `5000` | `OBJ-8`'s tightest published allowance on a day one stage lands is **11.4 s** (`07_the-rollout-sequence-and-what-each-stage-cannot-undo.md:548`). 5 000 ms is under half of it, leaving margin for the baseline boot duration, which is **unmeasured** (`OI-S15-1`, `SPK-S15-1`). It is chosen to leave margin, not because the margin is known to be enough. |
| `SM_MIGRATION_SLICE_ROWS` | `10000` | A ceiling on one statement, not a throughput target. Chosen so a single batch is small enough that the clock is re-checked often; no row count, row width or write rate is known, so no tighter justification is available or claimed. |

**Re-validation trigger:** `SPK-S6-2` executes and the per-disposition counts exist, **or**
`SPK-S15-1` executes and the restart duration is observed. Either closes the gap between "leaves
margin" and "fits". Neither has been run.

**No second spike is raised for the counts.** SUB-6 already registered `SPK-S6-2` — *"What do the
per-disposition counts and the twelve pathology probes actually return?"* — and SUB-15 already
registered `SPK-S15-1` for the restart duration. Both are cited by id; this chapter opens no
competing record. One new spike is raised, `SPK-S13-1`, for a question neither asks (§3.7).

### 3.4 `S1` — the archive, and the predicate that must not be `principal_kind = 'none'`

> **The archive predicate is a timestamp, never the carrier column.** After `T1`, a *post*-cutover
> row can legitimately carry `principal_kind = 'none'` — that is the third state's whole purpose. The
> two cases are *"distinguished by the record's timestamp against the cutover, not by the column"*
> (`16_attribution-and-detection.md` §2). A sweep predicated on `principal_kind = 'none'` would
> archive live post-cutover rows and would still be leaving pre-cutover rows behind the moment any
> post-cutover row was written unattributed. Registered as `F-S13-7`.

The cutover instant must therefore be **recorded at `T1`**, not guessed at `T2`.

**The migrator's own ledger is the obvious source and it is the wrong one** — this was checked
rather than assumed, and the check changed the answer. `drizzle.__drizzle_migrations` does exist and
its shape is known (§1.1), but the `created_at` it stores is `migration.folderMillis`, the `when`
field hand-authored in `drizzle/meta/_journal.json` — an **authoring** timestamp, not the instant of
application, and it can precede the real one by an arbitrary interval. Predicating the archive on it
would archive rows written after the carrier landed. A one-row marker written by `T1`'s own
migration, in the same transaction as the carrier columns, has none of that problem, because
`DEFAULT NOW()` evaluates when the migration actually runs:

```sql
-- Landed by T1's own migration, in the same transaction as the carrier
-- columns, so the recorded instant cannot drift from the schema change.
CREATE TABLE IF NOT EXISTS infrastructure.migration_marker (
  marker_id  TEXT PRIMARY KEY,
  marked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO infrastructure.migration_marker (marker_id)
VALUES ('c011.attribution_carrier_landed')
ON CONFLICT (marker_id) DO NOTHING;   -- belt and braces: this file runs once
                                      -- (1.1), so the guard is only against a
                                      -- statement re-run by hand.
```

```sql
-- ============================================================
-- S1 / T2 — archive the pre-cutover log population.
-- Source: DR-C11-S6-2 (archive, not delete); A-S6-2 (entry condition:
-- the carrier has landed); DR-C11-S9-1 (what happens to the archive later).
-- ============================================================
CREATE SCHEMA IF NOT EXISTS archive;

-- LIKE copies the column set as it stands AFTER T1, so the archive tables
-- carry principal_kind and learner_key too, in the same ordinal positions —
-- which is what makes the `SELECT *` in the move below safe.
--
-- Bare LIKE: no indexes, no constraints, AND NO DEFAULTS. The archive is a
-- closed retained store, not a queryable second live table, so it needs none
-- of them. Omitting INCLUDING DEFAULTS is deliberate and not an oversight:
-- `id` is BIGSERIAL on both source tables, and INCLUDING DEFAULTS would copy
-- a `nextval` default pointing at the LIVE table's sequence, quietly coupling
-- the archive to it. Every row moved below supplies `id` explicitly, so no
-- default is ever needed here.
CREATE TABLE IF NOT EXISTS archive.mcp_request_log
  (LIKE infrastructure.mcp_request_log);
CREATE TABLE IF NOT EXISTS archive.operation_event_log
  (LIKE infrastructure.operation_event_log);

-- One batch. Atomic: a row is in the live table or the archive, never both
-- and never neither, because the DELETE and the INSERT are one statement.
WITH cutover AS (
  SELECT marked_at FROM infrastructure.migration_marker
  WHERE marker_id = 'c011.attribution_carrier_landed'
),
batch AS (
  SELECT l.id
  FROM infrastructure.mcp_request_log l, cutover c
  WHERE l."timestamp" < c.marked_at
  ORDER BY l.id
  LIMIT :slice_rows
  FOR UPDATE OF l SKIP LOCKED
),
moved AS (
  DELETE FROM infrastructure.mcp_request_log l
  USING batch b
  WHERE l.id = b.id
  RETURNING l.*
)
INSERT INTO archive.mcp_request_log SELECT * FROM moved;

-- The same statement over operation_event_log, changing only the two table
-- names. It is written out in full rather than parameterised because a
-- runbook step an operator pastes must not require a substitution.
WITH cutover AS (
  SELECT marked_at FROM infrastructure.migration_marker
  WHERE marker_id = 'c011.attribution_carrier_landed'
),
batch AS (
  SELECT l.id
  FROM infrastructure.operation_event_log l, cutover c
  WHERE l."timestamp" < c.marked_at
  ORDER BY l.id
  LIMIT :slice_rows
  FOR UPDATE OF l SKIP LOCKED
),
moved AS (
  DELETE FROM infrastructure.operation_event_log l
  USING batch b
  WHERE l.id = b.id
  RETURNING l.*
)
INSERT INTO archive.operation_event_log SELECT * FROM moved;
```

**Idempotent** — the predicate shrinks with every batch and returns zero rows once the pre-cutover
population is gone. **Resumable** — the live table is the cursor. **Reversible** — the inverse
statement, with the two table names swapped, moves the rows back; that is SUB-7's `T2` reversal, and
what it cannot restore is not the rows (`07_the-rollout-sequence-and-what-each-stage-cannot-undo.md:494`).

**A bare `LIKE` — columns and types only — is deliberate.** The archive holds the most sensitive
content in the inventory (`F-S3-1`), and giving it indexes would make it convenient to query, which
is the opposite of what a closed retained store is for. Its disposal is `DR-C11-S9-1`'s bulk deletion
at archive close, whose **execution** is `R-S9-1` — cited, not re-raised, and not discharged here.

> **The retention conflict is cited and not resolved.** SUB-8 sets a 30-day window on
> `operation_event_log` (`08_consent-and-what-a-learner-can-export-and-erase.md` §9, exception 5),
> and the Tier-2 blocking aggregate reads `INTERVAL '5 weeks'` at
> `src/adapters/drizzle/tier2-blocking-stats-repository.ts:41` — verified directly at this cutoff, as
> is the 30-day `DELETE` at `scripts/retention-cleanup.sql:5`–`:6`. Thirty days is **five days below**
> the gate's own floor. That is `F-S9-6`, a conflict between two merged positions. **This chapter
> writes no retention statement of any kind**, precisely so it cannot silently override an audited
> retention period by picking a number.

### 3.5 `S4` — the backfill, with the wave order enforced by the SQL rather than by the prose

`S4`'s entry conditions are all SUB-6's and all hard: **V1–V7 pass**, re-run immediately before
execution per V7; **`P-ORPHAN-2` returns empty**; and §9.3's four-wave order is respected
(`07_the-rollout-sequence-and-what-each-stage-cannot-undo.md:351`–`:357`).

**The wave order is made self-enforcing.** §9.3 states the order as an instruction; an operator can
disregard an instruction. Every `backfill-by-join` statement below carries `AND <parent>.user_id IS
NOT NULL`, so a child row is *unreachable* until its parent is keyed. Running the waves out of order
does not corrupt anything — it simply affects zero rows until the parent wave has run. The ordering
becomes a property of the SQL rather than of the reader's diligence.

> **The join is written as a comma join, and that is required rather than stylistic.** In an
> `UPDATE … FROM`, the items in the `FROM` list are joined to each other *before* the update target
> is joined in via `WHERE`, so the target cannot be referenced from inside a `FROM … JOIN … ON`
> clause. The natural-looking
> `UPDATE public.learning_chunks c … FROM batch b JOIN public.learning_topics p ON p.id = c.topic_id`
> raises `ERROR: invalid reference to FROM-clause entry for table "c"`. Every statement below
> therefore puts both the batch predicate and the parent predicate in `WHERE`. **The first draft of
> this section had the `JOIN … ON` form in all seven statements** and is corrected here rather than
> silently — a chapter whose whole claim is *"executable as written"* should say when a draft of it
> was not.

```sql
-- ============================================================
-- S4 / T7 — backfill, wave 1: the three direct backfills.
-- :target_subject is V6's recorded value, re-verified by V7 immediately
-- before this stage runs. It is a parameter, never a literal in the file.
-- ============================================================
WITH batch AS (
  SELECT id FROM public.learning_topics WHERE user_id IS NULL
  ORDER BY id LIMIT :slice_rows FOR UPDATE SKIP LOCKED
)
UPDATE public.learning_topics t SET user_id = :target_subject
FROM batch b WHERE t.id = b.id;

WITH batch AS (
  SELECT id FROM public.learning_sessions WHERE user_id IS NULL
  ORDER BY id LIMIT :slice_rows FOR UPDATE SKIP LOCKED
)
UPDATE public.learning_sessions s SET user_id = :target_subject
FROM batch b WHERE s.id = b.id;

WITH batch AS (
  SELECT id FROM public.notes WHERE user_id IS NULL
  ORDER BY id LIMIT :slice_rows FOR UPDATE SKIP LOCKED
)
UPDATE public.notes n SET user_id = :target_subject
FROM batch b WHERE n.id = b.id;

-- ============================================================
-- Wave 2: learning_chunks (joins learning_topics); session_chunks and
-- session_questions (join learning_sessions).
-- ============================================================
WITH batch AS (
  SELECT id FROM public.learning_chunks WHERE user_id IS NULL
  ORDER BY id LIMIT :slice_rows FOR UPDATE SKIP LOCKED
)
UPDATE public.learning_chunks c SET user_id = p.user_id
FROM batch b, public.learning_topics p
WHERE c.id = b.id AND p.id = c.topic_id AND p.user_id IS NOT NULL;

WITH batch AS (
  SELECT id FROM public.session_chunks WHERE user_id IS NULL
  ORDER BY id LIMIT :slice_rows FOR UPDATE SKIP LOCKED
)
UPDATE public.session_chunks sc SET user_id = p.user_id
FROM batch b, public.learning_sessions p
WHERE sc.id = b.id AND p.id = sc.session_id AND p.user_id IS NOT NULL;

WITH batch AS (
  SELECT id FROM public.session_questions WHERE user_id IS NULL
  ORDER BY id LIMIT :slice_rows FOR UPDATE SKIP LOCKED
)
UPDATE public.session_questions sq SET user_id = p.user_id
FROM batch b, public.learning_sessions p
WHERE sq.id = b.id AND p.id = sq.session_id AND p.user_id IS NOT NULL;

-- ============================================================
-- Wave 3: session_question_chunks and session_question_attempts (join
-- session_questions); linter_validation_corpus (joins learning_chunks).
-- ============================================================
WITH batch AS (
  SELECT id FROM public.session_question_chunks WHERE user_id IS NULL
  ORDER BY id LIMIT :slice_rows FOR UPDATE SKIP LOCKED
)
UPDATE public.session_question_chunks x SET user_id = p.user_id
FROM batch b, public.session_questions p
WHERE x.id = b.id AND p.id = x.session_question_id AND p.user_id IS NOT NULL;

WITH batch AS (
  SELECT id FROM public.session_question_attempts WHERE user_id IS NULL
  ORDER BY id LIMIT :slice_rows FOR UPDATE SKIP LOCKED
)
UPDATE public.session_question_attempts x SET user_id = p.user_id
FROM batch b, public.session_questions p
WHERE x.id = b.id AND p.id = x.session_question_id AND p.user_id IS NOT NULL;

WITH batch AS (
  SELECT id FROM infrastructure.linter_validation_corpus WHERE user_id IS NULL
  ORDER BY id LIMIT :slice_rows FOR UPDATE SKIP LOCKED
)
UPDATE infrastructure.linter_validation_corpus x SET user_id = p.user_id
FROM batch b, public.learning_chunks p
WHERE x.id = b.id AND p.id = x.chunk_id AND p.user_id IS NOT NULL;

-- ============================================================
-- Wave 4: session_question_attempt_revisions — the only two-hop chain.
-- ============================================================
WITH batch AS (
  SELECT id FROM public.session_question_attempt_revisions WHERE user_id IS NULL
  ORDER BY id LIMIT :slice_rows FOR UPDATE SKIP LOCKED
)
UPDATE public.session_question_attempt_revisions x SET user_id = p.user_id
FROM batch b, public.session_question_attempts p
WHERE x.id = b.id AND p.id = x.attempt_id AND p.user_id IS NOT NULL;
```

**The exit check**, which is also `T7`'s isolation signal — every one of the ten must return zero:

```sql
SELECT 'learning_topics' AS t, COUNT(*) AS unkeyed FROM public.learning_topics WHERE user_id IS NULL
UNION ALL SELECT 'learning_chunks',                    COUNT(*) FROM public.learning_chunks                    WHERE user_id IS NULL
UNION ALL SELECT 'learning_sessions',                  COUNT(*) FROM public.learning_sessions                  WHERE user_id IS NULL
UNION ALL SELECT 'session_chunks',                     COUNT(*) FROM public.session_chunks                     WHERE user_id IS NULL
UNION ALL SELECT 'session_questions',                  COUNT(*) FROM public.session_questions                  WHERE user_id IS NULL
UNION ALL SELECT 'session_question_chunks',            COUNT(*) FROM public.session_question_chunks            WHERE user_id IS NULL
UNION ALL SELECT 'session_question_attempts',          COUNT(*) FROM public.session_question_attempts          WHERE user_id IS NULL
UNION ALL SELECT 'session_question_attempt_revisions', COUNT(*) FROM public.session_question_attempt_revisions WHERE user_id IS NULL
UNION ALL SELECT 'notes',                              COUNT(*) FROM public.notes                              WHERE user_id IS NULL
UNION ALL SELECT 'linter_validation_corpus',           COUNT(*) FROM infrastructure.linter_validation_corpus   WHERE user_id IS NULL;
```

**The reversal** is `UPDATE <table> SET user_id = NULL` per table, and it loses nothing — *"a
backfill that wrote one value everywhere carries no information that unwriting could lose"*
(`07_the-rollout-sequence-and-what-each-stage-cannot-undo.md:499`).

### 3.6 `S2`, gate `D` and `S5` — the two purges and the tightening

**`S2` and gate `D` are two different purges and neither subsumes the other** (`F-S7-4`, consumed).

> **One figure inside `F-S7-4` is wrong, and it is corrected rather than propagated.** Both
> `07_the-rollout-sequence-and-what-each-stage-cannot-undo.md:387` and the register entry at
> `91_findings-register.md:867` describe `T5` and `T9` as *"six stages apart"*. They are **four**
> apart: three stages intervene (`T6`, `T7`, `T8`), the separation is four, and the inclusive span is
> five. No reading of the ten-stage order yields six. **`F-S7-4`'s conclusion is unaffected** — both
> purges are non-empty and both are necessary at any separation of one or more, and the mechanism it
> gives (*"rows minted between `T5` and `T6` on a path that did not bind"*) is correct and is what
> this section implements. It is registered as `F-S13-8` rather than absorbed here, because a wrong
> count inside the finding that is its own sole evidence is exactly the defect class this package
> keeps catching.

```sql
-- S2 / T5 — IRREVERSIBLE. Every context_tokens row. Batched only so the
-- statement cannot monopolise a boot; there is nothing to resume to,
-- because the table's own emptiness is the completion condition.
WITH batch AS (
  SELECT id FROM public.context_tokens
  ORDER BY id LIMIT :slice_rows
  FOR UPDATE SKIP LOCKED
)
DELETE FROM public.context_tokens t USING batch b WHERE t.id = b.id;

-- Gate D / T9 — a DIFFERENT predicate. After T5 this can only match rows
-- minted between T5 and T6 on a path that did not bind.
DELETE FROM public.context_tokens WHERE principal_id IS NULL;

-- ...and only then can the binding be made mandatory.
ALTER TABLE public.context_tokens ALTER COLUMN principal_id           SET NOT NULL;
ALTER TABLE public.context_tokens ALTER COLUMN principal_kind         SET NOT NULL;
ALTER TABLE public.context_tokens ALTER COLUMN principal_claim_source SET NOT NULL;
```

`chk_context_tokens_binding_is_whole` (§2.2) guarantees that `principal_id IS NULL` implies the other
two are `NULL` too, so gate `D`'s single-column predicate is complete rather than merely
conventional.

**`S5` — the tightening, written so it is not a full-table rewrite.** The naive
**The plain one-step form is the right one here, and that conclusion is the opposite of the standard
advice.** The received wisdom is to avoid a bare `SET NOT NULL` — which takes `ACCESS EXCLUSIVE` and
scans the table — in favour of a three-step dance: add `CHECK (col IS NOT NULL) NOT VALID` (O(1)),
`VALIDATE CONSTRAINT` (one scan under `SHARE UPDATE EXCLUSIVE`, which blocks neither reads nor
writes), then `SET NOT NULL`, which PostgreSQL 12 and later can prove from the validated `CHECK`
without a second scan.

**On this deployment that dance buys nothing, and §1.1 is what proves it.** All pending migrations
run inside **one transaction** (`node_modules/drizzle-orm/pg-core/dialect.cjs:62`). Step 1 takes
`ACCESS EXCLUSIVE` on the table and, being inside that transaction, **holds it until commit** — so
step 2's weaker `SHARE UPDATE EXCLUSIVE` is irrelevant, because the stronger lock on the same table
is already held and is not released until the whole migration commits. The entire lock-contention
argument, which is the three-step form's only real benefit, evaporates. And the scan count is the
same either way: a bare `SET NOT NULL` performs **one** scan, and the three-step form performs
**one** scan, in `VALIDATE CONSTRAINT`. There is no second scan to avoid.

So the DDL is the simple form:

```sql
ALTER TABLE public.notes ALTER COLUMN user_id SET NOT NULL;
-- ...and the same for the other nine tables, schema-qualified per F-S13-4.
```

**What this costs, stated plainly.** One sequential scan per table, under `ACCESS EXCLUSIVE`, inside
the boot migrator, before the server accepts traffic. It does **not** fit `OBJ-8` in any demonstrated
sense — `CAP-S7-1` is unchanged and no claim is made that `T9` fits. What the three-step form would
have changed is nothing; what it would have added is three extra statements per table and a
plausible-sounding availability argument that is false here. Registered as **`F-S13-5`**, because the
three-step form is what a competent implementer will reach for, and the reason it does not help is
not visible from the SQL — it is visible only from the migrator's transaction wrapping.

*(If the sweeps are ever moved out of the boot migrator, or the migrator stops wrapping the batch in
one transaction, the three-step form becomes worthwhile again and this section should be revisited.
That is `DR-C11-S13-2`'s rejected alternative 4 becoming available.)*

### 3.7 The pre-flight gate

`R9` hands forward a pre-flight re-run and abort condition, and `T7`'s entry condition carries it.
**Every limb was re-verified against the codebase at this chapter's cutoff rather than inherited**,
because this is the artifact an operator actually runs and because SUB-6's first draft bounded chunk
difficulty at `1–5` when the codebase defines `1–10` — which would have aborted a real migration on
healthy data.

```sql
-- P-RANGE-1, forwarded UNCHANGED from
-- 06_the-disposition-of-every-unowned-row.md:476. Non-zero => ABORT.
SELECT COUNT(*) FROM public.learning_chunks
WHERE difficulty NOT BETWEEN 1 AND 10
   OR ease_factor < 1.3
   OR repetitions < 0
   OR interval_days < 0
   OR consecutive_failures < 0;
```

| Limb | Independent re-verification at `fd05ca1` |
| --- | --- |
| `difficulty NOT BETWEEN 1 AND 10` | **Correct, and over-determined at five sites.** `src/domain/types/spaced-repetition-tools.ts:102`, `src/domain/types/session.ts:147` and `src/domain/types/recommendations.ts:78` each declare `.int().min(1).max(10)`; `src/shared/constants/validation.ts:6`–`:7` sets `MIN_DIFFICULTY: 1` and `MAX_DIFFICULTY: 10`; and `src/domain/algorithms/sr-calculator.ts:191` clamps with `Math.max(1, Math.min(10, Math.floor(input.difficulty)))`. **Attribution, stated precisely:** SUB-7 forwarded **three** source citations for this limb (`spaced-repetition-tools.ts:102`, `algorithm.ts:76`, `algorithm-defaults.ts:7` via `06_the-disposition-of-every-unowned-row.md:476`); the other four sites in this row are this chapter's own additions, forwarded by nobody. All five were re-read at this cutoff and all five are exact. |
| `ease_factor < 1.3` | **Correct, and the floor cannot be lowered.** `src/config/resolve-algorithm-config.ts:12`–`:14` wraps the override in `Math.max(parseNumber(env.SM_MIN_EASE_FACTOR, DEFAULT_ALGORITHM_CONFIG.minimumEaseFactor), DEFAULT_ALGORITHM_CONFIG.minimumEaseFactor)`, so `SM_MIN_EASE_FACTOR` can only **raise** it; the default is `1.3` at `src/domain/config/algorithm-defaults.ts:7`; the clamp at `src/domain/config/algorithm.ts:72`–`:76` is floor-only, with an `Infinity` ceiling. This is `F-S7-7`'s conclusion, re-derived rather than taken on trust. |
| `repetitions < 0` | **Correct.** `src/domain/types/spaced-repetition-tools.ts:63`, `.int().min(0)`. |
| `interval_days < 0` | **Correct.** The tool field is spelled `interval` at `src/domain/types/spaced-repetition-tools.ts:65`, `.int().min(0)`; the column it lands in is `interval_days` at `src/infrastructure/db/schema.ts:65` and is **nullable**, so `< 0` correctly does not match an unset row. |
| `consecutive_failures < 0` | **Correct.** `src/domain/types/spaced-repetition-tools.ts:67`–`:70`, `.int().min(0)`. |

None of the five columns carries a database `CHECK` (`src/infrastructure/db/schema.ts:58`, `:60`,
`:61`, `:62`, `:65`), which is why the probe is needed at all. **The predicate is forwarded
unchanged; this re-verification changes nothing and no correction is routed to SUB-6 or SUB-7.**

**The probe `F-S6-6` says is missing.** SUB-6 resolves every pathology for every table to probed,
foreclosed or not-probed, and seven tables land in the third state — of which *"`operation_event_log`
is not [low-consequence]"* (`F-S6-6`, routed here as *"the party that would write the missing
`operation_event_log` probe before execution"*). It is written here:

```sql
-- P-ENC-3 — the missing operation_event_log probe. F-S6-6.
-- operation_event_log is named inside P-ENC-1's jsonb column list but has no
-- discovery query of its own; it takes `archive`, it holds learner free text,
-- and it is the table the one unconfinable aggregate reads (F-S5-9). A
-- pathology in it would reach the archive unexamined.
SELECT
  COUNT(*) FILTER (WHERE "level"     IS NULL OR "level"     = '') AS bad_level,
  COUNT(*) FILTER (WHERE "operation" IS NULL OR "operation" = '') AS bad_operation,
  COUNT(*) FILTER (WHERE "event"     IS NULL OR "event"     = '') AS bad_event,
  COUNT(*) FILTER (WHERE "timestamp" > NOW() OR created_at < "timestamp") AS bad_time,
  COUNT(*) FILTER (WHERE data IS NOT NULL
                     AND data::text LIKE '%' || U&'\FFFD' || '%')        AS replacement_char,
  COUNT(*) FILTER (WHERE duration_ms < 0)                                AS bad_duration
FROM infrastructure.operation_event_log;
```

The three `NOT NULL` columns are probed for emptiness rather than nullity because
`drizzle/0013_create_operation_event_log.sql` declares `level`, `operation` and `event` `NOT NULL`
but constrains none of them to be non-empty. `created_at < "timestamp"` is the inverted-pair check —
`created_at` is DB insertion time and `timestamp` is emission time, so insertion before emission is
impossible. **Six of `F-S6-6`'s seven unprobed tables remain unprobed**; the entry named
`operation_event_log` as the consequential one and that is the one written. The other six are named
here so the residual is visible: `session_chunks`, `session_question_chunks`,
`session_question_attempt_revisions`, `context_tokens`, `linter_validation_corpus` and
`linter_rule_validation_report`.

**V1–V7 are reproduced by reference, not restated.** They are `06_the-disposition-of-every-unowned-row.md`
§5's seven steps, and V7 requires the whole procedure re-run **immediately before** `S4` executes.
The runbook's `T7` entry step is *"run V1–V7 and stop if any fails"*, and V3's own text already makes
an absent `sub` a full stop rather than a delay. The procedure has never been executed (`SPK-S6-1`).

**`SPK-S13-1` — the one new spike.** *What PostgreSQL major version does the production deployment
run?* `SELECT version();`, read-only, one row, no mutation. It is not a second record of `SPK-S1-4`
(does the production schema match the repository's migration set) or of `SPK-S1-9` (region, provider,
TLS, monitoring, log-shipping) — neither asks for the engine version, and §2.2's generated column and
§3.6's step 3 both require **PG 12 or later**. Owner: the creator. Expiry: three months, on the same
basis as `SPK-S1-1`; additionally expires on any change to the off-repo compose stack's image tag.

---

## 4. The runbook

One section per stage. **Every stage is stated against the real deployment** — `develop` auto-deploys
on green CI (`.github/workflows/cd-prod.yml:3`–`:7`), the migrator runs unconditionally on boot and
applies each migration file exactly once (§1.1)
(`src/infrastructure/db/migrate.ts:45`–`:49`), there are no down-migrations, and the compose stack is
off-repo (`.github/workflows/cd-prod.yml:15`, `:26`–`:30`). Where a step cannot run under those
constraints it names the capability it needs and who owns supplying it.

### 4.0 Two facts that change how every step below is written

**The operator needs SSH to a host outside this repository**, for every per-stage control in §5. That
is a real prerequisite and a capability only the creator has (`DR-C11-S7-2` consequence 5). A stage
whose containment step cannot be reached is a stage with no containment step.

**Under STDIO there is no audit row and no event row to check.** Re-verified independently at this
cutoff: `src/transport/http.ts:179`–`:181` is the only site that constructs or registers either pg
log transport, and a repository-wide search for `createAuditPinoLogger`, `createEventPinoLogger` and
`setEventLogger` finds no other call site; the STDIO limb at `src/transport/main.ts:55`–`:59`
constructs the server and a `StdioServerTransport` and calls none of them. This is `F-S7-9`,
confirmed rather than restated.

> **Therefore no verification step in this runbook says "check the audit log" without a STDIO limb.**
> Each verification below is written in two columns. Where the STDIO column has no substitute, it
> says **"not observable on this transport"** rather than falling silent — an unexecutable step that
> looks executable is worse than an admitted gap. The STDIO substitute, where one exists, is the
> process's **stderr**, which is where the logger writes when no pg transport is mounted; it is not a
> queryable surface, it is not retained, and reading it requires the same SSH capability §4.0 already
> names.

### 4.1 The stage-by-stage procedure

Each stage carries: **Entry**, **Apply**, **Verify (HTTP / STDIO)**, **Contain**, **Reverse**. Entry
and exit conditions are SUB-7's and are cited, not re-derived. Containment is stated as **separately
executable from reversal**, which is OUT-4's requirement.

---

#### `T0` — Dispose of the deploy pipeline's smoke run

- **Entry.** One of `R-S4-2`'s three routes is chosen and **recorded** (`OI-S7-1`, open, owned by the
  creator). The runbook cannot proceed past this line by omission.
- **Apply.** A change to `.github/workflows/cd-prod.yml` or `tests/smoke/smoke.test.ts` under the
  chosen route. Merging it *is* deploying it, which is acceptable because the stage changes no
  runtime behaviour.
- **Verify.** A green `cd-prod` run whose smoke job passes. **Record the refusal-rate baseline now** —
  `SELECT response_status, COUNT(*) FROM infrastructure.mcp_request_log WHERE "timestamp" > NOW() -
  INTERVAL '24 hours' GROUP BY 1;` — because every later stage is read against it (`SIG-S16-4` limb
  (b)). **STDIO: not observable on this transport**, and the baseline is therefore an HTTP-only
  baseline; a later stage's refusal-rate comparison says nothing about STDIO traffic.
- **Contain.** **Named exception** (SUB-7): the stage has no runtime behaviour to disable. Owner: the
  creator.
- **Reverse.** Revert the CI change; one deploy. Nothing persisted.

---

#### `T1` — The identity rule and the attribution carrier

- **Entry.** `T0` exited.
- **Apply.** One migration, `0025`, containing: the `migration_marker` table and its row (§3.4), and
  the two log tables' carrier columns with their four constraints (§2.2). One step, because
  `principal_kind` has a correct default in `none`.
- **Verify.** HTTP: `SELECT principal_kind, COUNT(*) FROM infrastructure.mcp_request_log WHERE
  "timestamp" > (SELECT marked_at FROM infrastructure.migration_marker WHERE marker_id =
  'c011.attribution_carrier_landed') GROUP BY 1;` — new rows carry a determined kind, and
  `SIG-S16-1` limb 1b (`principal_kind = 'client'` on a non-exempt tool) becomes computable.
  **STDIO: not observable on this transport** — the audit-write success rate SUB-7 names as this
  stage's health signal *has no STDIO limb*, and its absence there **is not evidence of health**.
- **Contain.** `SM_ISOLATION_CARRIER_WRITE=off` over SSH, then restart. Rows then carry `none`, which
  is a defined value; no write fails.
- **Reverse.** A further migration dropping the four constraints and the four columns. One deploy.

---

#### `T2` — `S1`, archive the pre-cutover log population

- **Entry.** `T1` exited — this is `A-S6-2`, discharged. **Additionally: schedule this stage when
  `T0`'s refusal-rate baseline is quiet**, because `F-S6-5`'s transient write-unavailability window
  opens here and the move must be the only operation in the stage.
- **Apply.** Two artifacts, per §1.1. Migration `0026` creates the `archive` schema and the two
  `LIKE` tables — one-shot DDL. The batched move itself (§3.4) is the **sweep runner**, not a
  migration: it re-enters on every boot, driven by the slice loop of §3.3, until its predicate
  returns nothing.
- **Verify.** HTTP: both live tables contain only post-cutover rows —
  `SELECT COUNT(*) FROM infrastructure.mcp_request_log l, infrastructure.migration_marker m WHERE
  m.marker_id = 'c011.attribution_carrier_landed' AND l."timestamp" < m.marked_at;` must return 0,
  and the same over `operation_event_log`. Row counts in the live tables plus the archive tables must
  equal the pre-move totals. **STDIO: not applicable** — these tables receive no STDIO writes at all,
  so there is nothing on that transport to verify. This is the one place where the STDIO gap costs
  nothing.
- **Contain.** `SM_MIGRATION_SWEEP=pause` over SSH, then restart. **The pause lands between batches,
  never during one** (`F-S7-2`, `DR-C11-S7-2` clause 5) — and note the self-reference: the restart
  that applies the pause re-runs the migrator, so the sweep gets one more slice before it stops.
- **Reverse.** The inverse move, both table names swapped; one migration. **What does not come back:
  the timestamp separation** (`07_the-rollout-sequence-and-what-each-stage-cannot-undo.md:494`), and
  the five-week Tier-2 under-report window is not replayed.
- **Named exception** (SUB-7): the *completed* move has no toggle that un-moves it. Owner: SUB-13 for
  the resume logic, the creator to operate.

---

#### `T3` — Additive schema, nullable: gate stage `A` and `S3`

- **Entry.** `T2` exited.
- **Apply.** Migration `0027`: `context_tokens`' three nullable columns and their four constraints
  (§2.2); the ten `user_id` columns and their ten indexes (§2.1). **The generated `learner_key`
  column is *not* here** — it lands at `T9`, because adding a `STORED` generated column rewrites the
  table and at this stage the table still holds the full pre-cutover population (§2.2).
- **Verify.** `SELECT column_name FROM information_schema.columns WHERE table_name = 'context_tokens';`
  returns six names; the ten-table unkeyed count of §3.5 returns the full row count of each table
  (nothing is keyed yet, which is the expected state). Boot duration against `OBJ-8`.
- **Contain.** **Named exception, and it is a correction to SUB-7 rather than an inheritance.** SUB-7
  credits `T3` with a *"Migration toggle (batch pause)"*
  (`07_the-rollout-sequence-and-what-each-stage-cannot-undo.md:450`). **That control is not
  realizable.** After §1.1, `T3` is pure one-shot DDL with **no batches to pause**, and configuration
  is read *after* `initializeDatabase()` (`src/transport/main.ts:27`, `:42`–`:43`), so no boot-read
  variable can stop a migration that has already run in the same boot. Reason: the stage's product is
  a set of nullable columns and indexes, landed atomically. Owner: SUB-13 for the finding,
  **SUB-7 (NEU-1001)** for the stage set. Registered as **`F-S13-11`**. Reversal remains available
  (drop the columns; one migration), so the stage is not uncontainable — it is un-*pausable*.
  **Isolation signal: none yet** — the column exists and
  confines nothing, which is stated rather than left blank because a column present without a
  predicate is exactly the condition `R1` warns reads as evidence of confinement.
- **Reverse.** Drop the added columns; one migration. Nothing persisted.

---

#### `T4` — Gate stage `B`, observe-only on both transports

- **Entry.** `T3` exited.
- **Apply.** Code-only. `SM_IDENTITY_GATE=observe`. **This stage must *build* the STDIO recording
  surface, not merely switch it on** (`F-S7-9`) — on HTTP the would-refuse record is a queryable
  table; on STDIO it is stderr and nothing else. A reader must not assume this stage yields one
  uniform dataset across both transports.
- **Verify.** HTTP: the would-refuse record grows and is partitioned by `principal_kind` — this is
  the first point at which the production `sub`/`azp` distribution is visible. STDIO: **stderr only**,
  read over SSH, unretained.
- **Exit.** A stated observation window has elapsed **and the record has been read by the owner.**
  This is **a human read, not a metric**, because every alert route is unconfirmed (`A-S16-1`,
  `R-S16-2`). The runbook cannot make this mechanical and does not pretend to.
- **Contain.** `SM_IDENTITY_GATE=off`. Recording stops; nothing is refused either way.
- **Reverse.** Revert the deploy. **What is lost: the observation window itself** — and `T5` then has
  no evidence to read, which is why containing `T4` blocks `T5` by design.

---

#### `T5` — `S2`, purge `context_tokens`

- **Entry.** `T4` exited **and its observation has been read.** The strongest entry condition in the
  sequence, and the runbook states it as a stop: **if the observation has not been read, do not
  proceed.**
- **Apply.** The **sweep runner**, not a migration (§1.1): the batched wholesale delete of §3.6,
  re-entered each boot until `context_tokens` is empty. No schema object changes at this stage.
- **Verify.** `SELECT COUNT(*) FROM public.context_tokens;` returns 0. Then watch the re-mint success
  rate: HTTP, the `init_agent_context` call's `response_status` distribution in `mcp_request_log`;
  **STDIO: not observable on this transport** — a STDIO client whose re-mint fails produces no row
  anywhere, so a STDIO re-mint regression is invisible and would surface only as a user report.
- **Contain.** **A partial control SUB-7 did not credit, plus SUB-7's named exception — and the two
  are about different things.** Because `S2` is now a sweep rather than a migration (§1.1),
  `SM_MIGRATION_SWEEP=pause` **does** stop the purge between batches, exactly as on `T2` and `T7`.
  That is a real containment step and it did not exist when SUB-7 wrote its table. It changes nothing
  about the **effect**: rows already deleted are gone, and SUB-7's named exception stands unaltered
  for them. Registered with `F-S13-11`. **Named exception** (SUB-7): irreversible by construction —
  the *entry* to this stage is
  controllable; its effect is not. Owner: the creator.
- **Reverse.** **None.** Every `context_tokens` row is destroyed. The loss is bounded by
  `DR-C10-S8-2`'s reject-don't-grandfather rule having already voided them — bounded, not eliminated.
  In-flight sessions holding a pre-purge token fail once.

---

#### `T6` — Gate stage `C`, enforce

- **Entry.** `T0` exited and `T5` exited.
- **Apply.** Code-only. `SM_IDENTITY_GATE=enforce`. Both transports refuse an absent or NULL binding
  identically. This is `CC-S8-3`, the breaking change, owned by `NEU-984` and co-named `NEU-896`.
- **Verify.** HTTP: a refusal-rate step change is **expected**; its **size** is the signal, read
  against `T0`'s baseline. `SIG-S16-2` is zero-tolerance on HTTP. **STDIO: `SIG-S16-2` is unsettable**
  — there is no row to count, so the zero-tolerance threshold is satisfied on that transport by the
  absence of evidence rather than by the absence of failures (`R-S16-3`'s shape, cited not re-raised).
- **Contain.** `SM_IDENTITY_GATE=observe`. **The gate reverts to observe-only, not to open** — the
  three-position variable makes that structural rather than procedural (§5).
- **Reverse.** As containment; nothing persisted. A refused call wrote nothing.

---

#### `T7` — `S4`, backfill in four waves

- **Entry.** Three hard conditions, all SUB-6's, **all of which must be re-run now and not inherited
  from an earlier run**: **V1–V7 pass** (V7 requires exactly this re-run); **`P-ORPHAN-2` returns
  empty**; and the four-wave order is respected — which §3.5 makes self-enforcing. **Additionally
  run `P-RANGE-1` and the other eleven probes of `06_the-disposition-of-every-unowned-row.md` §6.2 plus `P-ENC-3` of §3.7; any
  non-zero result is an ABORT, not a warning** (`R9`).
- **Apply.** The **sweep runner**, not a migration (§1.1): the four waves of §3.5, driven by the
  slice loop, re-entered on every boot until all ten unkeyed counts reach zero. No schema object
  changes at this stage.
- **Verify.** The ten-table unkeyed count returns zero for all ten. Boot duration per batch against
  `OBJ-8`. **This is the one stage whose duration scales with a row count nobody has** (`OI-S6-1`,
  `CAP-S7-1`).
- **Contain.** `SM_MIGRATION_SWEEP=pause`. Rows already keyed stay keyed. **`T8` cannot be entered
  from this position** — a predicate over a partly-keyed population is `R-S5-1` exactly.
- **Reverse.** Set the column back to `NULL` on all ten tables — **through the sweep runner, not as
  a migration, and batched on the same contract as the forward direction** (`WHERE user_id IS NOT
  NULL`, time-boxed, `SKIP LOCKED`). An unbatched full-table `UPDATE` here would breach the very
  bound §3.3 exists to hold, over the very population §3.3 says cannot be sized. Nothing is lost:
  the value is uniform and re-derivable from V1–V7.

---

#### `T8` — Enforcement point live at the Drizzle adapter

- **Entry.** `T0` exited and `T7` exited — the population already carries an owner, so the predicate
  confines correctly from its first request.
- **Apply.** Code-only. `SM_ADAPTER_CONFINEMENT=on`. Every row-owning read and write carries the
  principal predicate; `client` and `none` are **refused, not empty-scoped** (`DR-C11-S5-1` clause 3).
- **Verify.** HTTP: `SIG-S16-1` limb 1a — the direct cross-learner-access signal — becomes computable
  for the first time, because it needs both the carrier and the ownership column. Refusal rate against
  `T6`'s post-step baseline. **STDIO: `SIG-S16-1` limb 1a is not computable on this transport**, for
  the same reason as every other stage: the signal reads the log tables and STDIO writes none.
- **Contain.** `SM_ADAPTER_CONFINEMENT=off`. **This position is not neutral.** It returns the system
  to today's unconfined behaviour — the state the whole package exists to end. It is a containment
  control against a regression, not a resting place.
- **Reverse.** As containment; nothing persisted.

---

#### `T9` — Tighten: `S5`, gate stage `D`, and the carrier's constraint

- **Entry.** `T8` exited, **and `P-DUP-4` returns 0 or 1** (§2.3). This second condition is not
  optional bookkeeping: if more than one session is `active`, the partial unique index below **will
  abort this migration**, and the fix is a data decision the operator must take deliberately rather
  than discover mid-stage.
- **Apply.** Migration `0028`: gate `D`'s NULL-binding purge, the generated `learner_key` column on
  `context_tokens` (§2.2 — placed here, not at `T3`, because it rewrites the table), `context_tokens`'
  three `SET NOT NULL`s, the ten tables' tightening (§3.6), and the partial unique index (§2.3).
  Order within the migration matters twice: the purge runs **before** the generated column is added,
  so the rewrite touches the smallest possible population; and the partial unique index is created
  **last**, so a failure there does not roll back the tightening — though, since the migrator wraps
  all pending migrations in one transaction (§1.1), a failure anywhere rolls back everything in this
  file, which is the safe direction.
- **Verify.** `SELECT is_nullable FROM information_schema.columns` returns `NO` for `user_id` on all
  ten and for all three `context_tokens` binding columns.
  **Read a failure carefully — the two likely causes are different and only one is a defect.** A
  failed `SET NOT NULL` (or a failed `VALIDATE CONSTRAINT`) means **a row was missed at `T7`**, which
  is a genuine signal and a good one. A failed **unique index** creation means **more than one
  session was `active`**, which is not a `T7` defect at all but the expected consequence of a uniform
  backfill over a rule that was never enforced (`F-S13-10`); the remedy is `P-DUP-4`'s remediation,
  not a re-run of the backfill. An earlier draft of this step attributed **both** failures to a
  missed row, which would have sent an operator to re-examine `T7` over a population that was
  correctly keyed.
- **Contain.** **Named exception** (SUB-7): a `NOT NULL` constraint is not toggleable; removing it is
  a migration. Owner: SUB-13.
- **Reverse.** Drop the constraints; one migration. Dropping a constraint restores the prior state
  exactly.

### 4.2 Cadence

`OBJ-8`'s own arithmetic requires the stages to be spread: the per-restart allowance is the daily
budget over the day's *total* restarts, so **at most one stage per day** keeps it within roughly 13%
of the published ≤ 13 s, and landing all ten in one day degrades it to ≈ 5.2 s
(`07_the-rollout-sequence-and-what-each-stage-cannot-undo.md:545`–`:556`). **Compressing the rollout
does not reduce its availability cost; it concentrates it.** That derivation is SUB-7's and is cited,
not re-derived.

**The operator controls *what* lands, not *when*.** A merge to `develop` deploys whenever CI goes
green, and `OBJ-7` records ≥ 7 unannounced restarts a day from ordinary version bumps. `F-S7-5`. The
runbook therefore says *"merge one stage per day"* and cannot say *"deploy at 03:00"*.

---

## 5. The disable-path control surface

`DR-C11-S7-2` names the control class and rejects specifying it, on the grounds that doing so *"would
pre-empt SUB-13's own design"* (rejected alternative 5). Its revision trigger is *"SUB-13 publishes
the control surface — concrete variable names, defaults and precedence."* This is that publication.

**The precedent supplies the shape and nothing else.** `CLASSIFIER_ENABLE` is read at
`src/config/resolve-classifier-config.ts:22`–`:62` with a deprecated alias and explicit conflict
detection, and `resolveClassifierConfig()` is called **exactly once**, at
`src/composition-root.ts:379`. Its runbook's emergency path is *"1. Set `CLASSIFIER_ENABLE=false` …
2. `Deploy.`"* (`docs/runbooks/classifier-blocking-activation.md:261`–`:262`) — re-read at this
cutoff and confirmed. **No path in that runbook is deploy-independent.** What is new here is applying
the toggle **over SSH directly to the off-repo compose stack at
`/home/deploy/docker-services/second-memory-mcp`, bypassing the pipeline**. That is unprecedented in
this repository, depends on a capability only the creator holds, and is **specified rather than
demonstrated**.

| Variable | Stages | Values | Default | Safe position on an unparseable value |
| --- | --- | --- | --- | --- |
| `SM_ISOLATION_CARRIER_WRITE` | `T1` | `on` \| `off` | `on` | `on` — writing `none` is worse than not writing |
| `SM_MIGRATION_SWEEP` | `T2`, `T5`, `T7` | `run` \| `pause` | `run` | **`pause`** — do not run a sweep whose control you cannot parse |
| `SM_MIGRATION_SLICE_MS` | `T2`, `T5`, `T7` | positive integer | `5000` (`A-S13-1`) | the default |
| `SM_MIGRATION_SLICE_ROWS` | `T2`, `T5`, `T7` | positive integer | `10000` (`A-S13-1`) | the default |
| `SM_IDENTITY_GATE` | `T4`, `T6` | `off` \| `observe` \| `enforce` | `off` | **`observe`** — records, refuses nothing |
| `SM_ADAPTER_CONFINEMENT` | `T8` | `on` \| `off` | `on` | **`on`** — fail closed |

**Six variables, four of which are toggles — and the two counts are not a correspondence.** The
table has six rows, and SUB-7 credits six stages with a real control, but the two sixes are a
coincidence and are not mapped onto each other. Four rows are behaviour toggles
(`SM_ISOLATION_CARRIER_WRITE`, `SM_MIGRATION_SWEEP`, `SM_IDENTITY_GATE`, `SM_ADAPTER_CONFINEMENT`);
two are numeric parameters of the sweep (`SM_MIGRATION_SLICE_MS`, `SM_MIGRATION_SLICE_ROWS`) and
disable nothing on their own. Two of the four toggles serve more than one stage each. The stages that
carry a real control are `T1`, `T2` (its in-flight move only), `T4`, `T5` (its in-flight purge only),
`T6`, `T7` and `T8`. **`T3` is not among them** — SUB-7 credits it with a batch pause, and
`F-S13-11` shows that control is not realizable, because after §1.1 `T3` is one-shot DDL with no
batches to pause. **`T5` is among them and SUB-7 credited it with none**, for the mirror-image
reason: its purge became a sweep.

`T0`, `T2`'s completed move, `T5` and
`T9` carry SUB-7's four named exceptions, reproduced in §4.1 with their reasons and owners. **Zero
stages are blank.**

**The safe position differs per control, and that is why there is no single global rule.** For a
migration sweep the safe position is *stop*; for the enforcement predicate it is *run*. A uniform
"default to off on a parse error" would fail open on `SM_ADAPTER_CONFINEMENT`, which is the one
control where failing open is the failure the package exists to prevent.

**`SM_IDENTITY_GATE` is one three-position variable rather than two booleans** because SUB-7 requires
`T6`'s off position to be *"observe-only, **not** open"*. Two booleans admit the state
`enforce=off, observe=off` reached from `T6`, which is the open position SUB-7 forbids. Three ordered
positions make the forbidden state unreachable. `SM_MIGRATION_SWEEP` is likewise one variable rather
than per-stage: `T3` and `T7` are four stages apart and never run concurrently, so which sweep is
paused is never ambiguous.

**Every application costs one restart, and that restart re-runs the boot migrator** (`F-S7-2`) —
configuration is read after `initializeDatabase()` (`src/transport/main.ts:27`, `:42`–`:43`;
`src/composition-root.ts:379`), re-verified at this cutoff. On `T2`, `T3` and `T7` this is
self-referential: the control that pauses the migration is read only after the migration has had one
more slice. **This is exactly why the sweeps must be resumable, and it is why §3.3's slice is bounded
by a clock rather than by completion.**

**The one control that is not per-stage.** Disabling the `CD Prod` workflow in the GitHub Actions UI
stops all deployment. It is a real deploy-independent control, the only one here needing no SSH, and
it is recorded separately so that "every stage has a disable path" is not quietly satisfied by a
switch that stops everything. It changes nothing about what an already-running container does.

### Is any of this genuinely deploy-independent?

**Yes, in the sense OUT-3 requires, and no in the sense a reader might hope for.** The six controls
never traverse `git`, CI or the deploy pipeline — that is real, and it is the property OUT-3 asks
for. But every one of them costs a container restart, that restart re-runs the migrator, and the
whole mechanism depends on SSH access to a host outside this repository that exactly one person has.
**None of the six has ever been exercised, because none of them exists yet.** Until the
implementation charter builds them, every "off" position in this chapter is a specification.

---

## 6. What this chapter does not establish

- **It does not establish that any stage fits `OBJ-8`.** `CAP-S7-1` is unchanged. §3.3 bounds the
  per-boot cost and leaves the number of boots unbounded and unknown; that is a better-shaped risk,
  not a smaller one.
- **It does not establish that anything here works.** No SQL statement in this chapter has been
  executed against any database. There is no production credential (`F-S1-2`) and no test run: the
  DDL is reviewed text, and `R-S13-3` records that a published-and-never-applied DDL leaves the
  schema ownership-free.
- **It does not establish that the disable paths exist.** It names them, with defaults and a
  precedence rule; none is implemented.
- **It does not resolve `F-S9-6`.** The 30-day retention window and the five-week Tier-2 floor are
  both merged positions in live conflict. This chapter writes **no retention statement**, so it
  cannot resolve the conflict by accident.
- **It does not resolve `OI-S5-1`.** The RLS transaction cost is still unpriced. §2.5 adds a second
  obstacle to the same open item and prices neither.
- **It does not choose `T0`'s route** (`OI-S7-1`) or place the consent table in a stage
  (`OI-S13-1`).
- **It changes no code.** Zero files under `src/`, `drizzle/`, `.github/` or `docker-compose.yml`.

**Three disclosures, made because certifying their absence would be easier than checking.**

1. **Two citations in this chapter land on line 42** — `src/infrastructure/db/client.ts:42` in §2.5
   and again in §1's pool statement. Both are benign: line 42 is `max: 4,` inside the pool
   constructor, read directly. The settled tool surface is **46 registered / 43 gated / 3 exempt**.
   **Two different derivations of the gated figure exist in this package and a draft of this
   disclosure conflated them.** `01_production-evidence-and-the-access-audit.md` §8 derives it as
   *"43 gated — 46 − 3"*; SUB-11 later derives it independently as a **thirteen-row mapping** of
   `context_token:` declarations onto non-exempt registrations and states explicitly that it is
   *"not `46 − 3`"* (`11_the-client-compatibility-contract.md` §1.3, `G-S11-3`). The two agree on the
   number and disagree on the method, SUB-11's being the stronger; this chapter cites SUB-11 for the
   method and asserts neither derivation as its own. `42` is not a codebase fact and is used as one
   nowhere above.
2. **Every citation here is written as a full filename**, and a clean checker result is still not
   proof. The checker skips any target containing `…` or `...`
   (`scripts/citation-paths/checker.ts:121`). **A first draft of this chapter certified zero such
   references and was wrong twice** — a SQL comment carried `(05_...md:266-:276)` and a runbook step
   carried `` `06_…` §6.2 ``, both silently exempt, both now written as full filenames. The
   certification is repeated only because the grep was then re-run over all five SUB-13-authored
   files and returns **zero** path-shaped inline-code targets containing an ellipsis. It also buckets
   a nowhere-resolving target as `MISSING-target`, invisible in both the summary and `--json`
   (`scripts/citation-paths/checker.ts:247`–`:266`). C011 is **not** in the gated list
   (`scripts/check-citation-paths.ts:21`); that is `CAP-S1-2`, owned by SUB-14, so the checker was
   run by hand.

   **The `MISSING-target` bucket was read entry by entry rather than trusted to be empty, and it is
   not empty.** C011's other two buckets — `repo-root-source` (source paths, out of the gate's scope
   by design) and `repo-root-corpus` — are large and are deliberately **not** quoted as figures here:
   both move with every commit to the package, so a number written now is stale the moment a sibling
   lands, and a stale number in a disclosure is worse than no number. What matters is the third
   bucket. **Four entries this chapter contributed were repaired** — three bare `schema.ts`
   references and one bare `.sql`, rewritten to resolve or reworded. **Three kinds remain, each
   disclosed rather than removed**, because each is deliberate and each matches an existing
   convention in the package: `pgvector/pgvector:pg16` (a container
   image tag, not a path), `/home/deploy/docker-services/second-memory-mcp` (a host path outside
   this repository, identical to the one at `DR-C11-S7-2` clause 1), and
   `decision-records/DR-C11-S13-1` in the outcome register's *"Verified by"* line — an
   extension-less reference in exactly the shape SUB-9 already uses two rows above it at
   `90_outcome-register.md:1106`. **None of the three is a broken citation**; all three are strings
   the normalizer mistakes for paths.

   **This paragraph adds its own occurrences of all three, by naming them**, so the bucket count
   attributable to this chapter is larger than the number of distinct problems in it — which is
   itself a fair illustration of how coarse the normalizer is, and is left standing rather than
   worked around. They are disclosed because the checker's zero is a weaker signal than it looks,
   and an unread bucket is how the last false certification in this package happened.
3. **The spike register's running total is not re-counted here, because it is already owned.**
   `F-S9-2` records it as **twenty-four** at SUB-9's branch HEAD (`09_proving-a-data-right-reaches-every-copy.md:85`),
   with zero executed. `SPK-S13-1` makes **twenty-five**, and that increment is the only count this
   chapter states. A fresh tally was drafted here and removed: it would have been a **second register
   record of one quantity**, which is exactly what the one-id-per-fact rule forbids and what this
   chapter criticises elsewhere. Earlier tallies in the register totalling twenty are scoped to the
   sub-tasks that had landed when they were written and are not errors.

**On C010.** No contradiction with a C010 decision was found by SUB-13. `DR-C10-S8-2`'s
reject-don't-grandfather rule is consumed and is what makes `T5` and gate `D` two separate purges;
`NEU-850`'s `OUT-2` is realized rather than amended. **No amendment is routed to `NEU-895`.**
`F-S13-2` is an **addition** to `OI-S5-1`, not a contradiction of it. **One id collision is
disclosed:** `CAP-S5-1` and `OI-S5-1` each exist in **both** C010 and C011 with different content, as
does `CAP-S7-1`; every reference above is to the **C011** entry unless the path says otherwise, and
`OI-S5-1` in particular is cited from
`05_the-enforcement-point-that-confines-every-read-and-write.md:1261`, which is C011's.

---

## 7. What this chapter hands forward

| Id | Content | To |
| --- | --- | --- |
| `DR-C11-S13-1` | The constraint shape: two carriers, two consistent `principal_kind` domains, the `iff` rule as a `CHECK`, and the generated learner key | **SUB-14**, **SUB-17**, the implementation charter |
| `DR-C11-S13-2` | The sweep contract — batched, idempotent, resumable, with the target predicate as the resume cursor | **SUB-14**, the implementation charter |
| `DR-C11-S13-3` | The disable-path control surface: six variables, their defaults, and the per-control safe position | **SUB-14**, **SUB-7**'s owner (NEU-1001), the creator |
| `F-S13-1` | SUB-5 and SUB-6 disagree on whether `session_chunks` carries its own ownership column; the DDL follows SUB-6 | **SUB-5** (NEU-997), **SUB-17** |
| `F-S13-2` | An RLS layer without `FORCE ROW LEVEL SECURITY` is inert here, because the migrator and the application share one role | **SUB-5** (NEU-997), `NEU-986`, `NEU-896` |
| `F-S13-3` | SUB-7's ten stages carry no stage for the consent table SUB-8 routes here | **SUB-7** (NEU-1001), **SUB-8** (NEU-1002), `NEU-896` |
| `F-S13-4` | The ten population-A tables span two schemas, so `S3`/`S5` cannot be one `public` loop | the implementation charter |
| `F-S13-5` | The three-step `SET NOT NULL` removes a lock and a scan, and buys no `OBJ-8` compliance | **SUB-7**'s owner, the implementation charter |
| `F-S13-6` | Two of the three carrier sites are raw-SQL tables with no Drizzle definition, and one is not — the implementation charter must keep `src/infrastructure/db/schema.ts` in step for exactly one of them | the implementation charter |
| `F-S13-7` | The archive predicate must be the recorded cutover timestamp, never `principal_kind = 'none'` | the implementation charter, **SUB-17** |
| `F-S13-8` | `F-S7-4` says `T5` and `T9` are *"six stages apart"* in two places; they are four. The finding's conclusion is unaffected | **SUB-7** (NEU-1001), **SUB-14** (which aggregates the register), **SUB-17** |
| `F-S13-9` | A Drizzle migration runs **exactly once**, so the batched sweeps cannot be migration files; they need a boot-time sweep runner. Neither SUB-6 nor SUB-7 owns the distinction | **SUB-6** (NEU-1000), **SUB-7** (NEU-1001), the implementation charter |
| `R-S13-1` | The batch bound is a stand-in, so the sweep's completion horizon is unknown in both directions | the creator, `NEU-896` |
| `R-S13-2` | Every per-stage control needs SSH to an off-repo host that one person can reach | the creator, `NEU-896` |
| `R-S13-3` | The DDL is published and never applied, so the schema stays ownership-free | the creator, `NEU-896` |
| `R-S13-4` | The `iff` rule is structural on the two carriers and unenforceable on the ten owned tables | **SUB-5** (NEU-997), `NEU-895`, `NEU-896` |
| `OI-S13-1` | Which stage lands the consent table | **SUB-7**'s owner (NEU-1001) |
| `OI-S13-2` | Whether the production role is a non-owner, without which §2.5's RLS is inert | the creator |
| `A-S13-1` | The slice defaults, `5000` ms and `10000` rows | the creator; re-validated by `SPK-S6-2` or `SPK-S15-1` |
| `CAP-S13-1` | This chapter prices no operation and validates no batch size | **SUB-17**, `NEU-896` |
| `SPK-S13-1` | The production PostgreSQL major version | the creator |
| `G-S13-1` … `G-S13-7` | OUT-19's own completeness gate rows | **SUB-17** |
| The DDL, the plan and the runbook | §2, §3, §4, §5 | the implementation charter, **SUB-14**, **SUB-17** |
