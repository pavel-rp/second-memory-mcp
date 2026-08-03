# Prompts as Data — Architecture Recommendation

**Status:** Research findings. No implementation.
**Scope:** OpenAI integration prompts (NEU-660 classifier today) with a model that generalizes to all authored prompts later (MCP tool descriptions, teaching prompt-pack templates, future third-party agent prompts).
**Driver:** Pavel — "I'll add more third-party agents integration, so it's important to be able to change the prompts without redeployment."

---

## RQ1. Where should the prompts live?

### Evidence

- **Existing infrastructure** — Postgres is the only persistence layer in the project (schemas: `drizzle`, `infrastructure`, `public`). Drizzle ORM owns all schema. There is **no** existing `prompts`, `prompt_templates`, `agent_config`, `setting`, or `template` table — greenfield.
- **Existing config pattern** — `resolve-classifier-config.ts`, `resolve-algorithm-config.ts`, `resolve-embedding-config.ts` parse 30+ env vars into typed config objects at composition root (`createAppContext()`). All resolution is **startup-only**; nothing in the codebase mutates config after process start.
- **Prior art surveyed** — LangSmith Hub (closed-source, Enterprise license for self-host requires Postgres + Redis + ClickHouse), Langfuse (open-source, Postgres + ClickHouse, web UI for prompt management + observability), PromptLayer / Mirascope / Maxim AI (SaaS, content-addressable revisions). The "DB table in your existing Postgres" pattern is a documented "minimum-infrastructure" approach in 2026 prompt-management guides.
- **Tooling cost** — adding Langfuse means a second DB engine (ClickHouse), a second service (Langfuse server), and a second auth surface. The Second Memory project is small enough that this triples operational surface for one feature.

### Finding

The prompts belong in Second Memory's existing Postgres, in a new schema dedicated to runtime-mutable artifacts (`learning.prompts` is the natural home alongside `learning_chunks`; alternatively a new `prompts` schema). External SaaS or self-hosted Langfuse is overkill for the current scale and conflicts with the project's "Postgres for everything" precedent.

### Recommendation

Add three tables in a new `prompts` schema (separate from `infrastructure` because these rows are user-curated content, not operational telemetry):

```
prompts.prompt_definition (
  id              uuid primary key,
  name            text unique not null,        -- e.g. 'tier2_classifier'
  description     text not null,
  schema_version  int not null,                -- shape contract: which Zod validator applies
  created_at      timestamptz not null
)

prompts.prompt_revision (
  id              uuid primary key,
  definition_id   uuid not null references prompts.prompt_definition,
  content         jsonb not null,              -- the actual prompt body (structured)
  content_hash    text not null,               -- sha256 of canonical JSON; cheap dedup
  notes           text,                        -- free-form change reason
  created_by      text not null,               -- 'pavel', 'agent:neu-712', etc.
  created_at      timestamptz not null,
  unique (definition_id, content_hash)         -- can't save the same content twice
)

prompts.prompt_deployment (
  definition_id   uuid not null references prompts.prompt_definition,
  environment     text not null,               -- 'prod' | 'staging' | 'dev'
  revision_id    uuid not null references prompts.prompt_revision,
  activated_at    timestamptz not null,
  activated_by    text not null,
  primary key (definition_id, environment)
)
```

Three tables, not one, because the three concerns are independent: **identity** (definition), **history** (revisions, append-only), **rollout** (which revision is currently live where).

### Open questions

- Whether to namespace by environment (`prompt_deployment.environment`) or by tenant if multi-tenant ever lands. Current product is single-tenant — defer.
- Whether to seed dev/staging from prod automatically (a copy-on-deploy workflow). Probably yes; out of scope for this doc.

---

## RQ2. What's the data model for an individual prompt?

### Evidence

- The classifier's authored prompt is **not a single string**. It's: 6 rubric lines + 1 grounding block + 1 edge-case block + 18 exemplars (3 per field) + 6 user-prompt stems + 1 chunk-payload renderer. ~21 KB total. The fields are tightly coupled — changing the grounding block affects all six system prompts.
- Future third-party agents will have **different shapes**. An Anthropic teaching agent might have one system prompt with a long `<learner_profile>` XML block. A Cohere reranker might be a single template string. There's no universal schema.
- The `LangChainContentClassifierAdapter` already does composition at runtime (`buildClassifierPrompt()` returns `PerFieldClassifierPrompts`, then `renderClassifierUserPayload(input, userPrompt)` interpolates per-call). The unit it consumes is the **structured map**, not flat strings.

### Finding

A prompt revision's `content` should be a **structured JSON document**, not a flat string, validated against a per-definition Zod schema. Granularity should be **one revision per logical prompt bundle**, not one revision per template fragment. Coarse granularity wins here because the parts of a classifier prompt have to evolve together (rubric ↔ exemplars ↔ grounding).

### Recommendation

For each `prompt_definition`, register a Zod schema in code that validates the corresponding `prompt_revision.content`. Example for the classifier:

```ts
// Stored in code, not DB — this is the *contract* for what a row must look like.
const Tier2ClassifierContentSchema = z.object({
  version_label: z.string(), // human label, e.g. '1.2.0' — informational only
  grounding_block: z.string(),
  edge_case_block: z.string(),
  fields: z.record(
    z.enum([...VERDICT_FIELDS]),
    z.object({
      label: z.string(),
      rubric_line: z.string(),
      user_prompt_stem: z.string(),
      exemplars: z
        .array(
          z.object({
            label: z.string(),
            title: z.string(),
            content: z.string(),
            expected_score: z.number().int().min(1).max(5),
            expected_rationale: z
              .string()
              .max(240)
              .regex(/^[^\n]+$/),
            expected_applicable: z.boolean(),
          })
        )
        .length(3),
    })
  ),
});
```

Validation runs on read, not on insert (see RQ5 — there's no application-side INSERT path; edits go through raw SQL). The adapter's `buildClassifierPrompt()` becomes a pure function over `Tier2ClassifierContent` instead of compiled-in constants.

The schema travels with the code, the content travels with the row. New agents register new schemas as they're added.

### Open questions

- **Templating substitution.** The classifier doesn't use template substitution (the chunk content is rendered separately by `renderClassifierUserPayload`). Future agents may want `{{learner_name}}`-style substitution. Recommend Mustache (logic-less, safe) over Handlebars/Jinja (powerful but unsafe in user-edited content). Defer until first need.

---

## RQ3. How does the running process pick up changes without restart?

### Evidence

- A Postgres roundtrip on the same machine is ~1 ms. The classifier OpenAI call it precedes is 3–5 s end-to-end. The DB lookup is in the noise.
- Caching adds bookkeeping (TTL state, invalidation plumbing, an extra failure mode where stale content survives an update). Each is its own bug surface.
- `LISTEN`/`NOTIFY` only matters if there's a cache to invalidate.

### Finding

Don't cache. Fetch from Postgres on every call. Hot-reload is automatic — the next classify call sees the new row.

### Recommendation

- On every classify call, the adapter does one `SELECT` to load the active revision for the definition + environment.
- If the SELECT fails (DB unreachable, no active deployment, content fails the read-time Zod check — see RQ5), the adapter falls back to the code-bundled v1.1.0 default and logs `prompts.fetch_failed` (or `prompts.invalid_revision`) to `infrastructure.operation_event_log`. The classifier still functions; the operator sees the failure in logs.
- No TTL, no `LISTEN`/`NOTIFY`, no startup warm-up.

### Open questions

- Add caching later only if profiling shows the per-call `SELECT` matters. Don't pre-build it.

---

## RQ4. How does the audit trail (`prompt_version` in `validator_report.tier2`) survive the migration?

### Evidence

- `validator_report.tier2.prompt_version` currently stores `'1.1.0'` (the semver constant). Persisted in every chunk row.
- Read paths and dashboards key off this string to compare verdicts across prompt eras (memory note: NEU-660 audit found bimodal-collapse in v1.0.0 verdicts vs per-field nuance in v1.1.0).
- Replacing the constant with a UUID `revision_id` keeps the contract (opaque identifier per prompt era) but breaks any consumer that pattern-matches `'1.x.x'`.

### Finding

The migration must preserve audit-trail interpretability. Two fields, not one: keep a **human-readable label** (the `version_label` field on revision content) for dashboard display, plus the **immutable `revision_id`** for joining back to the exact prompt body.

### Recommendation

Update `validator_report.tier2` shape to:

```jsonc
{
  "rendering_clarity": { ... },
  // ...
  "prompt_revision_id": "9b7d…",       // joinable to prompts.prompt_revision
  "prompt_version_label": "1.2.0",     // copied from content.version_label at classify time
  "prompt_version": "1.2.0",           // kept for backward-compat readers; alias of label
  "classified_at": "..."
}
```

Old rows (`prompt_version: '1.0.0' | '1.1.0'`, no `prompt_revision_id`) stay valid — read paths treat `prompt_revision_id` as nullable and fall back to label-only comparison.

### Open questions

- Whether to backfill `prompt_revision_id` on historical rows by registering the v1.0.0 / v1.1.0 prompts as historical revisions in the new tables. Probably yes; cheap SQL.

---

## RQ5. How is editing safe? (validation, rollback, who can edit)

### Evidence

- The classifier prompt has internal contracts — rationale ≤ 240 chars + single-line, exactly 3 exemplars per field, etc. A bad row breaks LangChain `withStructuredOutput`.
- The editing surface is raw SQL. There is no admin UI, no CLI, no application-side INSERT helper.
- Postgres has no native Zod validator. Cross-DB JSON-schema validation requires an extension (`pgx_validate`, `pg_jsonschema`) that adds infrastructure surface and rejects raw SQL inserts that don't match — heavyweight for one feature.

### Finding

Validation lives at **read time**, in the adapter, against the Zod schema kept in code. A row that fails validation is treated identically to an unreachable DB or a missing deployment: the adapter falls back to the code-bundled default and logs the failure. The operator notices via logs and fixes the row.

This means the database itself enforces nothing about content shape. The shape contract is a code+log loop, not a DB constraint. Pavel writes whatever JSON he wants; if it's wrong, the system keeps working on the old prompt and the log says exactly what failed.

### Recommendation

- `prompt_revision` is append-only **by convention**. No UPDATE/DELETE in normal flow; not enforced by triggers. Documented in CLAUDE.md.
- Editing is `psql`. Two statements per change:

  ```sql
  INSERT INTO prompts.prompt_revision (definition_id, content, content_hash, notes, created_by)
  VALUES (
    (SELECT id FROM prompts.prompt_definition WHERE name = 'tier2_classifier'),
    '{ "version_label": "1.2.0", "fields": { ... } }'::jsonb,
    encode(sha256('...'::bytea), 'hex'),
    'fix wozniak rule citation in vocabulary_appropriate',
    'pavel'
  ) RETURNING id;

  UPDATE prompts.prompt_deployment
     SET revision_id = '<id-from-above>', activated_at = now(), activated_by = 'pavel'
   WHERE definition_id = (SELECT id FROM prompts.prompt_definition WHERE name = 'tier2_classifier')
     AND environment = 'prod';
  ```

- Validation is read-side only: the adapter loads `content`, runs `Tier2ClassifierContentSchema.safeParse()`. On failure → fallback to code-bundled v1.1.0 + log `prompts.invalid_revision` with the Zod error.
- Rollback is one `UPDATE prompts.prompt_deployment SET revision_id = <prior>`. No data movement, instantaneous.
- ACL: Postgres role permissions are sufficient if needed later. Defer.

### Open questions

- Whether to expose the active prompt content via an MCP debug tool (so the operator can sanity-check what's deployed without `psql`). Cheap; defer.
- **Eval gate before activation.** Project's core thesis is that prompt changes need empirical grounding. Adding it requires the eval harness from RQ6 to exist first. Out of scope.

---

## RQ6. How do we know a new revision is actually better?

### Evidence

- `validator_report.tier2` for every classified chunk is queryable. Comparing v1.0.0 → v1.1.0 outcomes (the audit we just did) shows the methodology works: re-classify the same chunks, compare score distributions, flag divergence.
- Re-classifying every existing chunk is expensive (~$0.001 × 6 fields × N chunks; with thousands of chunks the cost is small but not zero).
- The project has no eval harness today. Adding one is a separate ticket.

### Finding

Out of scope for the migration itself, but the architecture should be **eval-ready**: a new revision must be addressable, replayable, and comparable against a previous one without code changes. The data model in RQ4 satisfies this — given two `prompt_revision_id`s, you can re-run both against a frozen chunk set and diff.

### Recommendation

- Carve out a `prompts.eval_run` table later: `(id, baseline_revision_id, candidate_revision_id, chunk_set_id, created_at, summary jsonb)` with per-chunk verdicts persisted as ordinary `validator_report.tier2` writes tagged by `prompt_revision_id`.
- Write a CLI tool that: (1) takes two revision IDs, (2) freezes a 50-chunk sample from `learning_chunks`, (3) classifies each chunk under both revisions, (4) reports per-field score deltas + inter-rater agreement.
- Defer wiring this into the activation gate; ship the storage + hot-reload first, add the gate when the harness exists.

### Open questions

- **Sample selection bias.** Random 50 chunks is fine for sanity; targeted samples (recent failures, leeches, agent-flagged) are better but require labeling. Defer.

---

## RQ7. Migration path for the classifier

### Evidence

- `classifier-prompts.ts` is one file, ~430 lines, one consumer (`LangChainContentClassifierAdapter`). The blast radius is small.
- `CLASSIFIER_PROMPT_VERSION` is a single constant referenced only by the adapter and the persistence path.
- All v1.0.0 / v1.1.0 verdicts in production carry `prompt_version` strings — backfill is straightforward.

### Finding

A four-step migration with each step independently shippable:

### Recommendation

1. **Add tables** (`prompts.prompt_definition` / `_revision` / `_deployment`) via Drizzle migration. No reads yet.
2. **Seed v1.1.0 as a revision.** Migration inserts `name='tier2_classifier'`, one revision with `content` = the structured JSON for the current authored prompts (a one-time conversion script reads `classifier-prompts.ts` and dumps it; the conversion is mechanical). Activate that revision in `prod` deployment.
3. **Switch the read path.** `LangChainContentClassifierAdapter` gains a `PromptStorePort` dependency (added in composition root). `buildClassifierPrompt()` becomes a pure renderer over fetched content. On any fetch failure (DB error, missing deployment, content fails Zod), the adapter falls back to the code-bundled v1.1.0 — that fallback path is the **permanent** disaster-recovery floor, not a transition artifact. Deploy. Verify by inserting a draft revision in DB and confirming the next classify run picks it up.
4. **Keep the code-bundled v1.1.0 forever** as the safety net. The constants in `classifier-prompts.ts` aren't deleted; they're the floor when the DB row is missing or malformed. Only the Zod content schema continues to grow alongside new agents.

The classifier-specific work is small. The cross-cutting infrastructure (three tables, one port, one adapter that fetches + Zod-validates + falls back) is the bulk and is reusable for every future agent.

### Open questions

- Whether to backfill historical `validator_report.tier2.prompt_revision_id` for old verdicts. Cost is one UPDATE per chunk row. Recommend yes; makes future cross-version analytics simpler.

---

## RQ8. Generalization to future third-party agents (Pavel's stated requirement)

### Evidence

- No `AgentProviderPort` exists today. Each adapter (`LangChainContentClassifierAdapter`, `LangChainEmbeddingAdapter`) is hand-wired.
- Pavel mentions multi-agent integration as the _driving_ requirement, not a stretch goal. This is the load-bearing motivation.
- Different agents will have different prompt shapes (RQ2). The data model accommodates this via per-definition Zod schemas; the adapter pattern is the natural integration seam.

### Finding

The prompt-store architecture above is **agent-agnostic** by design. Each new third-party agent registers (a) a new `prompt_definition` row, (b) a new content Zod schema in code, (c) a new adapter that fetches its definition's active revision. No changes to the storage layer.

### Recommendation

When adding a new agent (e.g. an Anthropic teaching reviewer):

1. Add a Zod schema for that agent's prompt content shape under `src/shared/prompts/schemas/`.
2. Migration inserts the `prompt_definition` row + a v1 `prompt_revision` row + a `prompt_deployment` row pointing prod at it. (Migration files are SQL anyway; this is the same channel Pavel uses for ad-hoc edits, just versioned in git.)
3. Adapter takes `PromptStorePort` and the registered schema in its constructor; it pulls on every call, validates, renders, falls back to a code-bundled default on any failure.

This means a new agent shipping a prompt change post-launch is purely a row insert + activation toggle. No deploy.

For MCP tool descriptions (Pavel's "even those tools return") the same pattern applies: each tool registration consumes its description from the prompt store, with a tool-description Zod schema. This is **future scope** — out of NEU-660 — but the architecture proposed here doesn't preclude it. Same tables, different definitions.

### Open questions

- **Per-provider templating differences.** Anthropic prefers `<xml_tags>`; OpenAI prefers Markdown sections. The content schema is per-definition, so this is naturally handled, but might benefit from shared sub-schemas (e.g. `ExemplarSchema`). Defer until second agent forces the abstraction.

---

## Integrated recommendation (TL;DR)

1. **Three tables in a new `prompts` schema**: `prompt_definition`, `prompt_revision` (append-only by convention, not by trigger), `prompt_deployment` (per-environment activation pointer).
2. **Per-definition Zod schemas in code** validate revision content **at read time** in the adapter. The DB stores arbitrary JSONB; if it fails the schema check, the adapter falls back to the code-bundled default and logs `prompts.invalid_revision`.
3. **No cache.** Fetch from Postgres on every classify call. ~1 ms roundtrip is in the noise next to a 3–5 s OpenAI call.
4. **Audit trail preserved** by adding `prompt_revision_id` (joinable UUID) alongside the existing `prompt_version` label in `validator_report.tier2`.
5. **The editing surface is `psql`.** No CLI, no admin UI. Operator runs `INSERT INTO prompt_revision`, then `UPDATE prompt_deployment` to activate. Rollback is one `UPDATE`.
6. **Code-bundled v1.1.0 stays forever** as the disaster-recovery floor — used whenever the DB row is missing, unreachable, or malformed.
7. **Eval-ready by design** but no eval gate at launch. Defer until a held-out evaluation harness exists.
8. **Migration is three steps**: add tables → seed v1.1.0 (Drizzle migration is just SQL) → swap reader. Reuse the same shape for every future agent.

Total new DB objects: 3 tables.
New code surfaces: 1 port (`PromptStorePort`), 1 adapter (`DrizzlePromptStoreAdapter`). Zod content schemas grow with each new agent.

The architecture explicitly defers: caching, invalidation channel, admin UI, CLI editing helpers, write-time validation, eval gate enforcement, multi-tenant scoping, MCP tool description migration. Each is a follow-up ticket once the bones exist.
