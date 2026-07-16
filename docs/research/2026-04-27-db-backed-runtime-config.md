# DB-Backed Runtime Configuration — Architecture Recommendation

**Date:** 2026-04-27
**Status:** Research findings. No implementation.
**Scope:** Replace the .env-driven tunable surface (algorithm, embedding, classifier configs — currently ~55 vars across `resolve-algorithm-config.ts`, `resolve-embedding-config.ts`, `resolve-classifier-config.ts`) with a Postgres-backed config store that supports a global default plus per-user overrides. Secrets and bootstrap settings stay in env.
**Driver:** Pavel — "a lot of stuff that could be configured through db-based config is now in .env … typical configs will be sth like 'embedding model', 'classification model', all spaced rep settings, etc."

---

## Position summary (TL;DR)

The architecture from `prompts-as-data-architecture.md` (NEU-660) transfers almost wholesale. **Use the same pattern**: one schema, one table per concern, JSONB content, Zod-validated at read time, per-request fetch with no in-process cache, code-bundled defaults as the disaster-recovery floor. The new dimension is per-user override resolution, which adds one column and one merge step.

**Don't reach for a config library.** None of the popular Node/TS options (dotenv, dotenvx, convict, node-config, env-var) ships a Postgres source — they're all file/env loaders. The feature-flag platforms that do have Postgres backends (Unleash, Flagsmith) are full services with their own UI, auth, and operational surface — same overkill that prompts research already rejected.

**Don't reach for caching.** MCP tool calls are < 1 Hz steady-state; an unindexed config `SELECT` is ~1 ms; any LLM call in the pipeline is 100–10,000× longer. A per-request fetch plus a code-bundled default is simpler than every alternative and matches the precedent the project already set for prompts.

**Two-layer partition** for what stays in env vs moves to DB:

- **Env**: `DATABASE_URL`, `AUDIT_DATABASE_URL`, `OPENAI_API_KEY`, `OLLAMA_BASE_URL`, `LOG_LEVEL`/`DEBUG`, `TRANSPORT`, `HTTP_PORT`, `HTTP_HOST`, `NODE_ENV`, `BUILD_TIME`, `SEED_SOURCE`. (Connection strings, credentials, transport bootstrap, logger seed.)
- **DB**: every `SM_*`, `EMBEDDING_*` (except `OPENAI_API_KEY`/`OLLAMA_BASE_URL`), `CLASSIFIER_*` (except `*_API_KEY`). That's ~50 of the 55 current vars.

---

## RQ1. Should we use a config library or roll our own?

### Evidence

- **Current state.** Three `resolve-*-config.ts` files (`resolve-algorithm-config.ts`, `resolve-embedding-config.ts`, `resolve-classifier-config.ts`) read `process.env` once in `createAppContext()` (`src/composition-root.ts:357-359`) and merge into hardcoded `DEFAULT_*_CONFIG` objects. Pure functions: pass `env` arg, get back typed config. This is already the right shape — env is just the _source_.
- **Library survey:**
  - **dotenv / dotenvx** — load `.env` into `process.env`. Dotenvx adds at-rest encryption. Neither has a Postgres source.
  - **convict** — schema + multi-source loader (env, args, files, JSON). Robust validation, hierarchical structure. **No DB backend out of the box**; you'd write a custom loader anyway.
  - **node-config** — file hierarchy keyed by `NODE_ENV`. File-only.
  - **env-var, env-schema** — typed env parsers. Same shape as the project's own `parseNumber/parseBoolean/parseEnum` in `src/shared/env-parsing.ts`.
- **Feature-flag platforms with Postgres backends:**
  - **Unleash** — full server, requires Postgres, separate auth/UI. Targeted at percentage rollouts and experiments, not generic typed config.
  - **Flagsmith** — same shape, same operational cost.
  - **GrowthBook** — MongoDB control plane.
  - **OpenFeature** — vendor-neutral SDK abstraction over the above.
- **Operational cost.** Adding any of those means a second service, a second auth boundary, and a second source of truth that has to stay in sync with `learning_chunks` (which is per-user). The `prompts-as-data-architecture.md` finding ("triples operational surface for one feature") applies identically.
- **2026 ecosystem.** No widely adopted Node library ships "typed runtime config with a Postgres source and per-user overrides" as a turnkey feature. Articles describing the pattern (PostgreSQL JSONB + Zod, pgTyped, Zapatos) all describe roll-your-own composition.

### Finding

Roll your own. The `resolve-*` modules already encapsulate the reader pattern — swap the source from `process.env` to a typed `ConfigStorePort` and the rest of the codebase doesn't change.

### Recommendation

Mirror the prompts-as-data architecture: one new schema, a `ConfigStorePort` in `src/ports/`, a Drizzle adapter in `src/adapters/drizzle/`. Continue using Zod for validation, continue using `DEFAULT_*_CONFIG` as the in-code floor, continue resolving once per call site (per-request, see RQ4).

---

## RQ2. Schema shape: key/value vs JSONB blob

### Evidence

- The current config tree has **clear domain partitions**: `algorithm` (~30 fields, deeply nested), `embedding` (~10 fields, flat), `classifier` (~10 fields, flat). Consumers don't read individual leaves — they receive a typed `AlgorithmConfig` object and pass it to pure domain functions (e.g. `sr-calculator`, `recommendation-engine`).
- **Coupling within a domain**: `priorityWeights.urgency + .ease + .repetitions + .difficulty` should sum to ~1.0; `hybridKeywordWeight + hybridSemanticWeight` should sum to ~1.0 (warning logged at `resolve-embedding-config.ts:54`). These are bundle invariants — splitting them across rows fragments the validation point.
- **Per-user override** (RQ3) wants partial overrides — a user can override `dailyCaps.maxNew` without touching `priorityWeights`. JSONB deep merge is natural here; row-per-leaf-key makes overrides verbose.
- **Postgres JSONB** is well-supported by Drizzle (`jsonb('value').$type<...>()`), and node-postgres auto-serializes JS objects through `JSON.parse`/`stringify` at the boundary.
- **Granular EAV** (one row per leaf path, e.g. `'algorithm.priorityWeights.urgency' = 0.6`) is appealing for audit but adds a join + groupBy on every read, and breaks Zod validation as a single shot — you'd rebuild the object before validating.

### Finding

One row per **domain bundle** per **scope**, with the value as JSONB matching the existing `AlgorithmConfig` / `EmbeddingConfig` / `ClassifierConfig` shape. Coarse granularity wins for the same reason it won in prompts research: the parts have to evolve together, and validation lives at the bundle level.

### Recommendation

```sql
CREATE SCHEMA config;

CREATE TABLE config.config_setting (
  key          text NOT NULL,        -- 'algorithm' | 'embedding' | 'classifier'
                                     -- (one row per ConfigBundle type)
  scope_type   text NOT NULL,        -- 'global' | 'user'
  scope_id     text NOT NULL,        -- '' for global; user_id for per-user
  value        jsonb NOT NULL,       -- full config object (global) OR partial
                                     -- override (user); deep-merged at read
  updated_at   timestamptz NOT NULL DEFAULT now(),
  updated_by   text NOT NULL,        -- 'pavel' | 'agent:neu-XXX' | 'migration'
  PRIMARY KEY (key, scope_type, scope_id)
);

-- Append-only audit (optional, follows the prompts.prompt_revision pattern;
-- defer if not immediately needed — ordinary Drizzle migrations cover most edits).
-- ID is `text` to match the project convention (`learning_chunks.id`, `session.id`
-- etc. are all text — generated by the app layer, not Postgres). Use the same
-- ID-generation helper the rest of the codebase uses; don't introduce uuid here.
CREATE TABLE config.config_setting_revision (
  id              text PRIMARY KEY,
  key             text NOT NULL,
  scope_type      text NOT NULL,
  scope_id        text NOT NULL,
  value           jsonb NOT NULL,
  notes           text,
  created_by      text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);
```

Three columns of compound key, one JSONB blob, one audit trail. No EAV explosion, no per-leaf row count.

The `key` column is a plain `text` (not enum) because adding a new bundle should be a code change (new Zod schema) plus a row insert — no DDL ceremony. The Zod registry in code is the closed set.

### Open questions

- Whether `scope_id` for global rows should be `NULL` or `''`. `NULL` is semantically right but means PK has to be a unique constraint instead. Recommend `''` for PK simplicity; document the convention. Trades a small ick for one fewer migration footgun.
- Whether to enforce `scope_id = ''` when `scope_type = 'global'` via a CHECK constraint. Cheap; recommend yes.

---

## RQ3. Per-user override resolution

### Evidence

- User selected "global + per-user override" as the scoping model.
- Domain functions receive a `Partial<AlgorithmConfig>` today only via the optional `env` arg in `resolveAlgorithmConfig(env)`. There's no per-user resolution path; `createAppContext()` builds one config and bakes it into `topicDeps` / `chunkDeps` (`composition-root.ts:380-405`).
- Most consumers of `algorithmConfig` are session-scoped or chunk-scoped — they always know `userId` (sessions belong to a user; chunks belong to topics that belong to a user). Threading `userId` to the resolution call is feasible.
- A handful of code paths run **without a user** (e.g. health checks, system-level rule validation reports at startup). They need the global config only.

### Finding

Resolution order: **code default → global row → user row** with deep merge, all done in TypeScript at the port boundary. No SQL coalesce gymnastics.

API:

```ts
interface ConfigStorePort {
  // For request-scoped fetches with a known user
  resolveAlgorithm(userId: string | null): Promise<AlgorithmConfig>;
  resolveEmbedding(userId: string | null): Promise<EmbeddingConfig>;
  resolveClassifier(userId: string | null): Promise<ClassifierConfig>;
  // For startup/system paths (no user context)
  resolveGlobal<K extends ConfigKey>(key: K): Promise<ConfigBundle[K]>;
  // For admin write paths (used by migrations and any future MCP-tool editor)
  setGlobal<K extends ConfigKey>(key: K, value: ConfigBundle[K], by: string): Promise<void>;
  setUserOverride<K extends ConfigKey>(
    key: K,
    userId: string,
    partial: DeepPartial<ConfigBundle[K]>,
    by: string
  ): Promise<void>;
}
```

Resolution implementation (sketch):

```ts
async function resolveAlgorithm(userId: string | null): Promise<AlgorithmConfig> {
  const rows = await db
    .select()
    .from(configSetting)
    .where(
      and(
        eq(configSetting.key, 'algorithm'),
        or(
          and(eq(configSetting.scopeType, 'global'), eq(configSetting.scopeId, '')),
          userId
            ? and(eq(configSetting.scopeType, 'user'), eq(configSetting.scopeId, userId))
            : sql`false`
        )
      )
    );

  const globalRow = rows.find(r => r.scopeType === 'global');
  const userRow = rows.find(r => r.scopeType === 'user');

  // Deep-merge: code default → global → user override.
  const merged = deepMerge(
    DEFAULT_ALGORITHM_CONFIG,
    globalRow ? safeParse(AlgorithmConfigSchema.partial(), globalRow.value) : {},
    userRow ? safeParse(AlgorithmConfigSchema.deepPartial(), userRow.value) : {}
  );

  // Validate the merged result (catches edge cases where individual partials
  // are valid but the combination violates an invariant like weight sum).
  const parsed = AlgorithmConfigSchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_ALGORITHM_CONFIG;
}
```

Two `safeParse` failure modes:

1. Either row's stored JSONB doesn't match the schema → treat that row as if it didn't exist, log `config.invalid_row`.
2. The merged object fails final validation → fall back to `DEFAULT_*_CONFIG`, log `config.invalid_merged`.

Same fail-open philosophy as the prompts read path.

### Recommendation

- **Single SQL query** per `resolve*` call, fetching at most two rows (global + user). One indexed PK lookup with `IN`/`OR`.
- **Deep-merge in TS**, not in SQL. JSONB merge operators (`||`) are shallow; deep merge is cleaner in code and keeps the merge testable as a pure function.
- **Validate the merged output**, not just the input rows. This catches "global says urgency=0.5, user override says ease=0.5, sum is now wrong" cases that per-row validation misses.
- For startup/system paths (`userId = null`), skip the user branch entirely.

### Open questions

- **deepMerge semantics for arrays.** Recommend "user array replaces global array" (not concat). This matches `lodash.merge` default and is what `tagWeights`-style records expect. Document explicitly.
- **Empty-string vs missing user override.** A user setting `dailyCaps.maxNew = 0` should override; a missing key should fall through. Standard `JSON.stringify` semantics handle this — just don't strip falsy values when persisting.
- **Per-user override permissions.** Today there's no admin/user role distinction in the codebase. Probably the user themselves writes their own override via a future `set_my_preference` MCP tool; admins (whoever has DB access) write global. Defer ACL until we add multi-tenant.

---

## RQ4. Reload strategy: boot, polling, push, or per-request?

### Evidence

- **MCP request rate.** Single-tenant local server. Steady-state is < 1 Hz; even an aggressive teaching session is ~1 call/s.
- **Latency budget.** Every MCP tool call that touches LLMs (classify, generate teaching chunk) is 2–10 s end-to-end. Tools that don't (`session_status`, `get_chunk_content`) are 5–50 ms.
- **Postgres roundtrip on the same machine** is ~1 ms for an indexed PK lookup. The `config_setting` PK lookup with two rows is well within this.
- **prompts-as-data precedent.** `prompts-as-data-architecture.md` RQ3 reasoned that 1 ms vs 3–5 s OpenAI call is in the noise → no cache, fetch on every classify. Same math applies here, except config touches non-LLM tools too where 1 ms vs 50 ms is more visible.
- **LISTEN/NOTIFY** with `pg-listen` works but introduces: a long-lived connection (separate from the pool), reconnection logic, missed-notify recovery (notifications are lost if the listener is down at NOTIFY time), and an extra failure mode where staleness can persist silently.
- **TTL polling** is simpler than LISTEN/NOTIFY but introduces a staleness window (TTL/2 average) and steady polling load.

### Finding

**Per-request fetch, no cache** for the LLM-adjacent paths and the algorithm/recommendation engine. 1 ms × ~1 call/s is 0.1% CPU. The simplicity savings dwarf the latency cost.

For **fast-path read-only tools** (`session_status`, `get_chunk_content`, `list_learning_items`) where 1 ms is more visible: **per-request fetch is still fine**. These tools already do 1–5 SELECTs against `learning_chunks`/`session`/`session_chunks`; one more PK lookup is a rounding error.

The boot-only path goes away — config is freshly resolved at the entry of each `createAppContext`-driven request.

### Recommendation

**Per-request fetch.** No TTL cache. No LISTEN/NOTIFY.

Implementation: each MCP tool entry point in `src/server/*-tools.ts` calls `configStore.resolveAlgorithm(userId)` (or whichever bundle it needs) once, then passes the resolved object down to orchestration. The orchestration layer keeps its current shape — domain stays pure, configs flow as parameters.

Side benefit: this lets `composition-root.ts` stop reading `process.env` for tunables. The composition root only resolves _bootstrap_ config (DB URL, transport, log level) at startup; everything else moves to the request boundary.

### Open questions

- **If profiling shows the config fetch dominates a fast path:** add a request-scoped cache (one fetch per MCP tool call, multiple consumers within that call share). Don't pre-build it.
- **If the project later runs under a high-QPS HTTP transport** (multi-user web): revisit and add a `LISTEN/NOTIFY` invalidation on top of a process-local LRU. The prompts research has the same caveat. Defer.
- **Bootstrap config can't live in DB** (chicken-and-egg: `DATABASE_URL` is needed to read the DB). This isn't a problem — bootstrap stays in env; that's exactly what 12-factor recommends for "config that varies between deploys."

---

## RQ5. Validation, write surface, fail-open behavior

### Evidence

- **Existing Zod schemas don't exist yet for these configs.** The `AlgorithmConfig`/`EmbeddingConfig`/`ClassifierConfig` types are hand-written TypeScript interfaces in `src/domain/config/*.ts`. Adding Zod is a one-time exercise per bundle.
- **Postgres JSON Schema validation extensions** (`pg_jsonschema`, `pgx_validate`) exist but require superuser, change the operational surface, and reject raw-SQL inserts that don't match — heavyweight for the use case.
- **The prompts research reached an explicit verdict** (RQ5): validate at read time, fail open with code defaults, no DB-side schema constraints. The same write surface (`psql` / Drizzle migrations) and same logging hooks apply.
- **Project's logging surfaces.** `infrastructure.operation_event_log` is the agreed-on event sink (memory `project_neu_660_classifier_audit.md`). Validation failures should write `config.invalid_row` / `config.invalid_merged` events keyed by `(key, scope_type, scope_id)`.

### Finding

Validate **at read time** in the adapter against per-bundle Zod schemas. Failed validation → fall back to the next layer (user → global → code default) and log. The DB has no shape constraints beyond `NOT NULL` and the PK.

### Recommendation

Three Zod schemas in `src/domain/config/schemas/`:

```ts
// src/domain/config/schemas/algorithm.ts (new)
export const AlgorithmConfigSchema = z.object({
  minimumEaseFactor: z.number().min(1.3),
  initialIntervalDays: z.number().positive(),
  // ... full shape mirroring AlgorithmConfig
  priorityWeights: z
    .object({
      urgency: z.number().min(0).max(1),
      ease: z.number().min(0).max(1),
      repetitions: z.number().min(0).max(1),
      difficulty: z.number().min(0).max(1),
    })
    .refine(p => Math.abs(p.urgency + p.ease + p.repetitions + p.difficulty - 1) < 0.01, {
      message: 'priorityWeights must sum to ~1.0',
    }),
  // ...
});

export type AlgorithmConfig = z.infer<typeof AlgorithmConfigSchema>;
```

Replace the hand-written `AlgorithmConfig` interface with the inferred type. The cross-field invariants (weight sums, lapse penalty bounds) become refinements instead of `logger.warn` checks.

For per-user partial overrides: use `AlgorithmConfigSchema.deepPartial()` (Zod 4) — accepts any subset of leaves with the same constraints applied where present.

**Write surface:**

- Initial seed: a Drizzle migration inserts the global row with `value = DEFAULT_ALGORITHM_CONFIG`. Fully versioned in git, reviewable in PRs.
- Tuning the global default: one `UPDATE config.config_setting SET value = ... WHERE key = 'algorithm' AND scope_type = 'global'`. Run via `psql` or a one-shot script.
- Per-user override: a future MCP tool (`set_user_preference`) writes to `(key, 'user', userId)`. Defer until first user asks.

**Audit:** trigger on `config_setting` writes can shadow into `config_setting_revision` (append-only), or skip the table and rely on `pgaudit` / git history of the migrations. Recommend the shadow trigger; it's 10 lines and means an agent that fat-fingers an UPDATE leaves a trail.

### Open questions

- **Whether to validate writes too** (admin-side belt-and-suspenders). Cheap if writes go through the port (`setGlobal` calls Zod first), wasteful if writes go through `psql`. The fail-open read path makes write-side validation merely advisory. Recommend yes for port writes, no for raw SQL.
- **Zod version.** Project is on `zod ^3.23.8` (per `package.json`). `.deepPartial()` / `.partial()` / `.safeParse()` / `.refine()` all work as written. If/when the project moves to Zod 4, `.deepPartial()` is replaced by recursive partial helpers — small, mechanical migration.

---

## RQ6. The .env / DB partition

### Evidence

The 55 current env vars (per `.env.example`) classify cleanly:

| Bucket                                  | Vars                                                                                                                                          | Why                                                                                                                                                                                     |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bootstrap (must stay env)**           | `DATABASE_URL`, `AUDIT_DATABASE_URL`, `NODE_ENV`, `VITEST`, `BUILD_TIME`                                                                      | Needed to _open_ the DB, identify the runtime context, or stamp the binary. Chicken-and-egg with DB-backed config.                                                                      |
| **Secrets (must stay env)**             | `OPENAI_API_KEY`, `CLASSIFIER_OPENAI_API_KEY`, `OLLAMA_BASE_URL` (URL implicitly contains creds in some deploys), any future `MCP_AUTH_TOKEN` | Per 12-factor + project ethos: secrets live outside the DB, ideally in a secret manager with env injection. Storing in `config_setting` would log them in audit shadows and migrations. |
| **Transport bootstrap (must stay env)** | `TRANSPORT`, `HTTP_PORT`, `HTTP_HOST`                                                                                                         | Need values _before_ DB is reachable. `MCP_BASE_URL`, `MCP_AUTH_TOKEN` (for the smoke tests) similarly.                                                                                 |
| **Logger seed (stays env)**             | `LOG_LEVEL`, `DEBUG`                                                                                                                          | Logger initializes before DB connection. Could move to DB later behind a "logger reload" feature; defer.                                                                                |
| **Tunables (move to DB)**               | All 17 `SM_*`, all 9 `EMBEDDING_*` except API key + base URL, all 8 `CLASSIFIER_*` except API key                                             | The user's stated target. ~50 of 55 vars.                                                                                                                                               |
| **Operational one-shot (stays env)**    | `SEED_SOURCE`                                                                                                                                 | Used only by `db:seed` script. Tooling concern, not runtime config.                                                                                                                     |

### Finding

The partition is sharp: secrets + bootstrap + tooling stay in env; everything else moves. No middle ground worth debating.

### Recommendation

Update `.env.example` to **shrink dramatically** — keep only the bootstrap + secrets section. Add a comment block explaining that algorithm/embedding/classifier tunables now live in `config.config_setting`, with a pointer to a `docs/operations/config.md` runbook (out of scope; new ticket).

Migration sequence:

1. Add `config` schema + tables (Drizzle migration).
2. Add `ConfigStorePort` + `DrizzleConfigStoreAdapter`.
3. Add Zod schemas for the three bundles; `AlgorithmConfig` etc. become `z.infer<>` types.
4. Seed migration: insert global rows with the existing `DEFAULT_*_CONFIG` values.
5. Replace `resolveAlgorithmConfig(env)` with `configStore.resolveAlgorithm(userId)`. Composition root passes the port down; tool entrypoints call resolve at request boundary. (Step 5 is a fan-out; can land tool-by-tool.)
6. After all callers switch: delete the env-var paths in `resolve-*-config.ts`. The `DEFAULT_*_CONFIG` constants stay forever as the disaster-recovery floor — same role they play in the prompts architecture.

### Open questions

- **Step 5 ordering:** could land per consumer (algorithm first, then embedding, then classifier), or all-at-once. Per-bundle is safer because each bundle's read path is independent. Recommend per-bundle PRs.
- **Backward compat:** during migration, env vars override DB rows? Or DB rows override env? Recommend **DB strictly overrides env during the transition window** — set the env var to "" once the DB row is seeded, delete the env-var read once the migration is done. Keeps a one-way ratchet so you can't accidentally end up reading both.

---

## RQ7. What about the actually nice things you'd get from a flag platform?

### Evidence

The user explicitly mentioned only "embedding model, classification model, all spaced rep settings." They did not ask for: percentage rollouts, A/B experiments, multi-environment promotion, audit dashboards, role-based ACL, or webhook notifications. These are real features of Unleash/GrowthBook/Flagsmith.

### Finding

The MVP does not need any of those. But the schema **doesn't preclude** them — `scope_type` already extends naturally (`'cohort'`, `'experiment'`), and the `config_setting_revision` table is a half-built audit dashboard.

### Recommendation

Build the MVP. Add experiment scoping later when the first A/B test request arrives — at that point evaluate:

- If still single-tenant + low-frequency: extend `scope_type` to `'cohort'` and add a `cohort_id → user_id[]` resolver. Minimal new infra.
- If concurrent A/B tests with statistical analysis: probably bring in **OpenFeature SDK** with a custom Postgres provider, so future migration to a managed flag platform is a config-only swap.

Don't build for that today.

### Open questions

- Whether the eventual A/B story should reuse `config_setting` or split (`config_setting` for global tunables vs `experiment_assignment` for cohort overrides). Defer.

---

## RQ8. Library ecosystem reality check

### Evidence

The popular Node config libraries are all **file/env loaders** with optional schema validation:

| Library                 | DB source? | Schema validation?  | Suitable here?                                 |
| ----------------------- | ---------- | ------------------- | ---------------------------------------------- |
| `dotenv` / `dotenvx`    | No         | No / encrypted only | No — file/env loader                           |
| `convict`               | No         | Yes                 | No — would still need a custom Postgres source |
| `node-config`           | No         | No                  | No                                             |
| `env-var`, `env-schema` | No         | Yes (typed parsers) | No                                             |
| `zod` (alone)           | N/A        | Yes                 | Yes — already pulled in by adjacent NEU work   |

Feature-flag platforms (Unleash, Flagsmith, GrowthBook, FeatBit) ship Postgres backends but as **whole services**, not libraries. They're appropriate when you need their server-side logic (rollouts, experiments, dashboards). They're disproportionate for "I want a tunable in a row."

The closest "named pattern" in 2026 industry writing for what we're building is "**Postgres as your config store**" — described in `aws.amazon.com/blogs/database/postgresql-as-a-json-database-advanced-patterns-and-best-practices/` and similar. The pattern is roll-your-own composition: JSONB column + Zod (or pgTyped/Zapatos for typed access).

### Finding

There is no off-the-shelf library that does what we need without operational overhead. The roll-your-own implementation is small (one schema, one table, one port, one adapter, three Zod schemas — call it a 1-week PR).

### Recommendation

Adopt the roll-your-own approach. Reuse the prompts-as-data architecture verbatim; the only delta is the per-user override dimension.

If a future contributor pushes for OpenFeature SDK adoption: align then by writing a small `OpenFeatureConfigStoreAdapter` that wraps the Postgres store. The port boundary makes this swap trivial.

---

## Integrated recommendation (TL;DR)

1. **One schema, one table** (plus an optional revisions table for audit): `config.config_setting (key, scope_type, scope_id, value jsonb, …)` with PK `(key, scope_type, scope_id)`. Same shape language as `prompts.prompt_*`.
2. **One row per typed bundle** (`'algorithm'`, `'embedding'`, `'classifier'`). JSONB stores the full object for global rows, partial overrides for user rows. Coarse, not EAV.
3. **Resolution**: deep-merge `code default → global → user`, validate the merged result with Zod, fall back to defaults on any failure. Single SQL fetch (≤ 2 rows).
4. **No cache.** Per-request fetch from MCP tool entrypoints. ~1 ms is in the noise. Add caching later only if profiling demands it.
5. **Validation lives in code at read time** (Zod), not in Postgres. DB has no shape constraints. Same fail-open philosophy as prompts.
6. **Code-bundled `DEFAULT_*_CONFIG` stays forever** as the disaster-recovery floor.
7. **Env keeps**: `DATABASE_URL`, `AUDIT_DATABASE_URL`, `NODE_ENV`, secrets (`*_API_KEY`, `OLLAMA_BASE_URL`), transport bootstrap (`TRANSPORT`, `HTTP_PORT`, `HTTP_HOST`), logger seed (`LOG_LEVEL`, `DEBUG`), `BUILD_TIME`, `SEED_SOURCE`. Everything else moves to DB.
8. **No library** — the existing `resolve-*-config.ts` modules already encapsulate the reader pattern; just swap the source. Node's config-library ecosystem doesn't ship Postgres-backed runtime config; the feature-flag platforms that do are full services with disproportionate operational cost.
9. **Migration is six steps**: tables → port/adapter → Zod schemas → seed migration → swap readers per bundle → delete env-var fallbacks. Each step independently shippable.
10. **Defer**: percentage rollouts, A/B experiments, admin UI, write-side validation, ACL, multi-tenant scope, OpenFeature integration. Each becomes its own ticket once the bones exist.

**Total new DB objects:** 1 schema, 1–2 tables.
**New code surfaces:** 1 port (`ConfigStorePort`), 1 adapter (`DrizzleConfigStoreAdapter`), 3 Zod schemas. The `resolve-*-config.ts` files shrink to thin wrappers (eventually deleted).

---

## Cross-references

- `docs/research/prompts-as-data-architecture.md` — direct architectural precedent. The reader-time validation pattern, three-tables-not-EAV decision, and "code-bundled fallback as permanent floor" all transfer.
- `MEMORY.md → project_neu_660_classifier_audit.md` — `infrastructure.operation_event_log` is the right home for `config.invalid_row` / `config.invalid_merged` events.
- `src/composition-root.ts:357-359` — the three `resolve-*Config()` calls that this work replaces.
- `src/config/resolve-algorithm-config.ts`, `src/config/resolve-embedding-config.ts`, `src/config/resolve-classifier-config.ts` — current readers; the source-swap target.
- `src/domain/config/algorithm-defaults.ts`, `embedding-defaults.ts`, `classifier-defaults.ts` — the values that become the seed migration payload and stay as the disaster-recovery floor.
