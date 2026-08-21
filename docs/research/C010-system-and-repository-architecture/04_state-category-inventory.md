# 04 — The complete state-category inventory, with an argued completeness method

**Task:** NEU-973 (SUB-3) · **Charter:** C010 (umbrella NEU-895) · **Compiled:** 2026-08-21 · **Verification cutoff:** 2026-08-21 · **Status:** deferred — this document enumerates and classifies; it assigns no authority
**Model:** claude-opus-5[1m]
**Discharges:** `OUT-2` (`01_outcome-register.md`)

**What this document is.** One inventory in which **every category of state this system holds today, or
will hold, appears exactly once**. Each entry records its store (or `none`), its lifecycle, its
volatility, whether it is derived, whether it is learner-scoped, and its status — **existing**,
**required-by-upstream**, or **assumed**. Completeness is **argued** (§7–§8), not asserted: the document
states the method by which it claims to be exhaustive and names the evidence that would falsify it.

**What this document is not.** It assigns **no authority** to any category — that is `SUB-13 (NEU-977)`,
over the ownership model `SUB-6 (NEU-976)` selects. It states **no isolation invariant** (`SUB-5`) and
judges no category against one (`SUB-14`). It designs no column and writes no migration. It does not
decide data-store topology (`SUB-10`).

---

## 1. Vocabulary, disambiguated at first use

Per `00_method-and-provenance.md` §4, three words in this codebase already mean something else. This
document uses only the qualified forms.

| Word | Sense used here | Never means, here |
| --- | --- | --- |
| **learning session** | A learning run — the `learning_sessions` row and its lifecycle. | An HTTP or auth session. |
| **web session** | A browser-held, authenticated session. **No such state exists today** (`SC-S3-43`, `assumed`). | A learning run. |
| **JWT subject** / **authenticated subject** | The principal a token resolves to (`payload.sub \|\| azp`). | A chunk's academic category. |
| **chunk subject** | A chunk's academic category. | The authenticated principal. |
| **database schema** | A Postgres schema — `public`, `infrastructure`. | A learner's mental problem-pattern. |
| **learner schema** | A learner's mental problem-pattern. | A Postgres schema. |

**One further term, defined here because the inventory turns on it.** A **state category** is a set of
state that would necessarily take **one** authority under `OUT-3`. The rule that decides when two pieces
of state are one category — and its five rejected alternatives — is `DR-C10-S3-1`
(`decision-records/DR-C10-S3-1_state-category-individuation.md`). Everything in §3 is individuated by
that rule and by nothing else.

**Glossary position.** No `docs/GLOSSARY.md` row is added. *State category* is package-governance
vocabulary — it describes how this decision package is written and audited, and names nothing a learner,
a chunk, a review or a scheduler touches — and `00_method-and-provenance.md` §4.1 keeps that vocabulary
out of the product glossary deliberately. The concrete categories below are, without exception, either
existing product concepts that already have rows or unbuilt state that no product vocabulary yet
describes. This is a decision, not an omission.

---

## 2. The entry schema

Every entry in §3 carries these fields. The id family is **`SC-S3-<k>`** — namespaced to this sub-task
like every other id in this package, so no later append renumbers it. It is a **document-local entry id**,
not a sixth register family: it does not appear in `02_findings-register.md`, `90_…`, `91_…`, `92_…` or
`93_…`, and it does not compete with `F-`, `OI-`, `CAP-`, `SPK-` or `A-`.

| Field | Values |
| --- | --- |
| **Store** | The concrete store, or **`none`**. |
| **Lifecycle** | Created by → mutated by → ends at. |
| **Volatility** | `durable` · `TTL` · `process-lifetime` · `request-scoped` · `derived-on-read` |
| **Derived** | `yes` / `no` — whether it is recomputed from other state rather than held. |
| **Learner-scoped** | `yes` / `no` / `question — open`. **This column records the scoping *question*, never a schema fact.** |
| **Status** | `existing` · `required-by-upstream` · `assumed` (with the `A-<n>` cited) |

**`durable` and `derived-on-read` are not opposites.** A derived value is recomputed every time and has
no store; a durable value is written and read back. An entry is never both.

---

## 3. The inventory — 41 entries, each appearing exactly once

### 3.1 Existing, persisted — `public` database schema

All line citations are `src/infrastructure/db/schema.ts` unless stated.

| Id | Category | Store | Lifecycle | Volatility | Derived | Learner-scoped | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `SC-S3-1` | **Topic record** — the authored topic, its summary, its summary embedding and its dependency-graph classification | `public.learning_topics` (`:21`) | created by the authoring path → summary mutated in place (`summaryVersion`, `summaryUpdatedAt`) → no delete path in the repository | `durable` | no | **question — open** | `existing` |
| `SC-S3-2` | **Chunk content record** — the teachable text, its version, its embedding, its status and its ordering | `public.learning_chunks` content group (`:49`, embedding index `:85`–`:88`) | created by authoring → mutated by content edits (`contentVersion`, `contentUpdatedAt`) → deleted with the topic | `durable` | no | **question — open** | `existing` |
| `SC-S3-3` | **Per-chunk SM-2 scheduling state** — `nextReviewAt`, `easeFactor`, `repetitions`, `consecutiveFailures`, `lastReviewedAt`, `intervalDays` | `public.learning_chunks` (`:59`–`:65`) | created at chunk creation with defaults → **mutated only by the scheduler** on each scored attempt → ends with the chunk | `durable` | no | **question — open** | `existing` |
| `SC-S3-4` | **Content-audit verdict** — the Tier-1/Tier-2 validator's structured report | `public.learning_chunks.validator_report` jsonb (`:77`; column added by `drizzle/0018_add_validator_report.sql:1`) | written by the audit pipeline (`src/orchestration/audit-pipeline.ts:48`) → overwritten on re-audit → ends with the chunk | `durable` | no | no | `existing` |
| `SC-S3-5` | **Learning-session record** — a bounded learning run, its mode, status, window and feedback | `public.learning_sessions` (`:99`) | created by session start → `status`/`endTime` mutated → terminal on completion | `durable` | no | **question — open** | `existing` |
| `SC-S3-6` | **Session-chunk teaching state** — per-chunk status, teaching approach and time spent within a run | `public.session_chunks` (`:126`) | created when the run covers the chunk → mutated as teaching proceeds → ends with the run | `durable` | no | **question — open** | `existing` |
| `SC-S3-7` | **Session question** — a drill question posed within a run | `public.session_questions` (`:156`) | created when posed → `status` mutated → ends with the run | `durable` | no | **question — open** | `existing` |
| `SC-S3-8` | **Question→chunk assessment mapping** — which chunk(s) a question assesses | `public.session_question_chunks` (`:179`) | created with the question → never mutated → ends with the question | `durable` | no | no | `existing` |
| `SC-S3-9` | **Attempt and grade record** — the response, pass/fail, quality, agent quality, feedback and question type | `public.session_question_attempts` (`:197`), excluding `:213`–`:220` | created on answer → **mutated in place by `revise_grade`** (`src/adapters/drizzle/session-question-repository.ts:194`–`:223`) → ends with the run | `durable` | no | **question — open** | `existing` |
| `SC-S3-10` | **Pre-review scheduling snapshot (the NEU-844 quad)** — `snapshot_band`, `snapshot_predicted_recall`, `snapshot_interval_days`, `snapshot_days_overdue`: what the scheduler predicted at answer time | `public.session_question_attempts` (`:213`–`:220`) | **written once at answer time and never revised** — including when `revise_grade` mutates the surrounding row | `durable` | no | **question — open** | `existing` |
| `SC-S3-11` | **Grade-revision audit trail** — the immutable pre-revision values a `revise_grade` preserved, with its reason | `public.session_question_attempt_revisions` (`:250`) | appended inside the revision transaction → **never mutated** → ends with the attempt | `durable` | no | **question — open** | `existing` |
| `SC-S3-12` | **Notes** — immutable annotations attached to a chunk, topic or learning session | `public.notes` (`:288`) | created → **never updated in place** (no `updatedAt`, comment `:287`; no update path in `src/adapters/drizzle/notes-repository.ts`) → deleted and re-added | `durable` | no | **question — open** | `existing` |
| `SC-S3-13` | **Context tokens** — the short-lived tokens gating every non-bootstrap MCP tool call | `public.context_tokens` (`:312`) | minted at bootstrap → never mutated → **expires by `expiresAt`**, swept by the repository | `TTL` | no | **question — open** — the table carries **no** authenticated subject | `existing` |

**Why `learning_chunks` yields three entries and `session_question_attempts` two.** Per `DR-C10-S3-1`,
they have different writers, lifecycles and volatility profiles: chunk content is author-written, the SM-2
group is scheduler-written, the validator report is audit-written; and the NEU-844 quad is write-once
while the attempt row it sits in is mutable. A one-row-per-table inventory would fuse each set and hand
`SUB-13` a row that needs two or three authorities — which `OUT-3`'s exactly-one audit forbids.

### 3.2 Existing, persisted — `infrastructure` database schema, Drizzle-defined

`pgSchema('infrastructure')` is declared at `:331`.

| Id | Category | Store | Lifecycle | Volatility | Derived | Learner-scoped | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `SC-S3-14` | **Linter validation corpus** — the labelled OOD-validation corpus for Tier-1b rules, with its split and expected verdict | `infrastructure.linter_validation_corpus` (`:333`) | curated by the maintainer → mutated by re-labelling → durable | `durable` | no | no | `existing` |
| `SC-S3-15` | **Per-rule validation report** — held-out and adversarial precision/recall, and the blocking-eligibility decision it supports | `infrastructure.linter_rule_validation_report` (`:364`) | written per validation run → superseded by the next run → durable | `durable` | no | no | `existing` |

### 3.3 Existing, persisted — `infrastructure`, raw-SQL only (no Drizzle object)

**Neither table has a Drizzle schema object, and neither is reached through any repository port.** Both
are written through hand-built parameterized `INSERT` strings from a pino transport worker thread. That
is why a port-keyed inventory would omit both (`DR-C10-S3-1`, rejected alternative 3).

| Id | Category | Store | Lifecycle | Volatility | Derived | Learner-scoped | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `SC-S3-16` | **MCP request log** — per-request method, params, response status/body, duration, correlation id and session id. **Holds learner payload**: `response_body` and `params` carry learner-facing text and learner free-text answers | `infrastructure.mcp_request_log` — created `drizzle/0010_create_infrastructure_mcp_request_log.sql:1`–`:19`, extended `drizzle/0012_extend_mcp_request_log.sql:1`–`:6`; written `src/transport/pg-audit-transport.ts:117` | appended per request → never mutated → **no retention window and no deletion owner are implemented**, which NEU-887's privacy gate requires (see `F-S3-3`) | `durable` | no | **question — open** — the table carries **no principal field**, so learner payload is stored that cannot be attributed to, or deleted for, any one learner | `existing` |
| `SC-S3-17` | **Operation event log** — structured operation events with level, tool, correlation id and a free-form `data` payload. **The payload column is potentially learner payload** | `infrastructure.operation_event_log` — created `drizzle/0013_create_operation_event_log.sql:1`–`:16`; written `src/transport/pg-event-transport.ts:109`; read by raw SQL at `src/adapters/drizzle/tier2-blocking-stats-repository.ts:39` | appended per event → never mutated → **no retention window and no deletion owner are implemented** (see `F-S3-3`) | `durable` | no | **question — open** | `existing` |

### 3.4 Existing, process-local in-memory — first-class entries, not footnotes

**This is the section that makes the current deployment single-instance.** Ten categories cover eleven
structures; the two merges are stated in the walk (§4.3) so the exactly-once property stays auditable.

| Id | Category | Store | Lifecycle | Volatility | Derived | Learner-scoped | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `SC-S3-18` | **MCP transport registry** — live transports keyed by MCP session id | process memory, `src/transport/http.ts:82` | created on `initialize` → removed on `onclose` (`:212`–`:218`) or shutdown (`:304`–`:311`) | `process-lifetime` | no | no | `existing` |
| `SC-S3-19` | **Subject-binding map** — which **JWT subject** owns each live MCP session, enforced against session hijack | process memory, `src/transport/http.ts:83` (`SessionIdentity` `:32`–`:35`; enforced `verifySessionBinding` `:52`–`:72`) | written at `onsessioninitialized` (`:204`–`:210`) → read per request → dropped with the transport | `process-lifetime` | no | **yes — and it is the only server-side learner-identity binding that exists anywhere in the system** | `existing` |
| `SC-S3-20` | **Rate-limit windows** — fixed-window request counters keyed on the **JWT subject** | process memory, `src/transport/rate-limit-middleware.ts:58`–`:59` | created on first request in a window → swept lazily (`:63`–`:68`) → expires at `resetAt` | `TTL` | no | **yes** — keyed per subject (`:76`–`:77`) | `existing` |
| `SC-S3-21` | **Tier-2 circuit-breaker trip set and its stats cache** — which verdict fields are tripped, plus a 60 s read-through cache over the operation event log | process memory, `src/orchestration/tier2-circuit-breaker.ts:68`, `:69`, `:76` | trip is one-shot per process and field → cache expires at 60 s → **re-derived from scratch after restart, intentionally** (`:4`–`:11`) | `process-lifetime` | partly — the trip set is derived from `SC-S3-17`, then held | no | `existing` |
| `SC-S3-22` | **Request context and correlation id** — two `AsyncLocalStorage` stores carrying the correlation id and the current tool | process memory (async context), `src/shared/logger.ts:115`–`:116`; seeded `src/transport/http.ts:153`–`:160` | entered per HTTP request / per tool call → exits with the call | `request-scoped` | no | no | `existing` |
| `SC-S3-23` | **Database client singletons** — the pg pool and the Drizzle handle wrapping it | process memory, `src/infrastructure/db/client.ts:5` and `src/infrastructure/db/operations.ts:5` | lazily created → reset only in tests → process lifetime | `process-lifetime` | no | no | `existing` |
| `SC-S3-24` | **Event-logger sink toggle** — whether a durable event sink is configured for this process | process memory, `src/shared/logger.ts:214` | set at boot when an audit/event database URL is configured → **fails open** to stderr when unset (`:247`–`:250`) | `process-lifetime` | no | no | `existing` |
| `SC-S3-25` | **Audit/event transport batch buffers and their per-sink circuit breakers** — two instances, one per sink, each with an unflushed-entry buffer, a flush timer and a failure counter | process memory (transport worker threads), `src/transport/pg-audit-transport.ts:45`–`:52` and `src/transport/pg-event-transport.ts:41`–`:48` | appended per log line → flushed on interval or batch size → **unflushed entries are lost on crash, and dropped outright while a breaker is open** | `process-lifetime` | no | no | `existing` |
| `SC-S3-26` | **JWKS remote key set** — the issuer's verification keys, cached by the JWT middleware | process memory, `src/transport/jwt-middleware.ts:90` | fetched on first verification → refreshed by the library → process lifetime | `process-lifetime` | no | no | `existing` |
| `SC-S3-27` | **Classifier per-field model cache** — one seeded runnable per verdict field | process memory, `src/adapters/langchain/content-classifier-adapter.ts:47` | lazily initialised on first classify → process lifetime | `process-lifetime` | no | no | `existing` |

**Not state, and deliberately excluded:** the module-level `Set`s at
`src/transport/context-token-middleware.ts:5`, `src/config/resolve-transport-config.ts:21`,
`src/orchestration/chunk-workflows.ts:31` and `src/shared/logger.ts:15` are **immutable configuration
constants**. They are never written after module load, so no ownership model can assign a writer to them
and they are not categories under `DR-C10-S3-1`. Recorded here so their absence is a decision rather than
a miss. Likewise the function-local `Map`/`Set` uses for joining and de-duplicating query results
(e.g. `src/adapters/drizzle/session-repository.ts:207`, `:378`) are request-scoped locals inside
`SC-S3-22`'s lifetime, not categories.

### 3.5 Existing, derived-never-persisted

**No table backs any of these three.** Each is recomputed on every read. They are categories anyway,
because `SUB-13` must still say which component may compute and serve them.

| Id | Category | Store | Lifecycle | Volatility | Derived | Learner-scoped | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `SC-S3-28` | **Mastery level** — `min(repetitions, 5)`, computed at prompt-render time | **`none`** — `src/orchestration/teaching-workflows.ts:602`, carried only on the ephemeral prompt context (`:595`–`:609`) | computed per teaching call → discarded | `derived-on-read` | **yes**, from `SC-S3-3` | **question — open** | `existing` |
| `SC-S3-29` | **`LearnerContext` aggregate** — due/overdue counts, overdue topics, recent chunk subjects, weak areas, streak, leech count, active learning session | **`none`** — type `src/orchestration/learner-context-workflows.ts:16`–`:34`, built by `buildLearnerContext` `:84`–`:228` from five parallel repository reads (`:95`–`:103`) | computed per request → discarded | `derived-on-read` | **yes**, from `SC-S3-3`, `SC-S3-5`, `SC-S3-9` | **question — open** | `existing` |
| `SC-S3-30` | **Analytics KPIs and window rollups** — reviews completed, average quality, new chunks learned, streak days, and the optional topic/tag breakdowns | **`none`** — `src/domain/services/analytics-calculator.ts:112`–`:143` and `:191`–`:246`; sole caller `src/orchestration/analytics-workflows.ts:43` | computed per request → returned in the tool response → discarded | `derived-on-read` | **yes**, from attempt and learning-session data | **question — open** | `existing` |

### 3.6 Required by an upstream package — no store today

Every row here is **a thing this system does not hold today**. `NEU-890`'s record shapes in particular are
specification-only — that package states plainly that no schema, table, query or migration implements
them. Two rows are a different case worth stating: `SC-S3-37` (the DP graph) and `SC-S3-40` (the
measurement-contract register) **exist as committed, gate-verified artifacts in their own upstream
packages**, but exist nowhere in *this* system's stores. They are `required-by-upstream` because the
status column records what this system holds, not what a document elsewhere contains.

| Id | Category | Store | Lifecycle | Volatility | Derived | Learner-scoped | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `SC-S3-31` | **Corpus-neutral assessment-evidence record** — identity is `node_id` + `skill_type`; the `citation` is an optional, replaceable, non-key attribute | **`none`** | to be defined | to be defined | no | **question — open** | `required-by-upstream` |
| `SC-S3-32` | **Problem-citation record** — **`stable_id` + `canonical_url` only** | **`none`** | to be defined | to be defined | no | no | `required-by-upstream` |
| `SC-S3-33` | **Cached citation-drift verdict** — the internal, keyed-read-only cache on the serve path, carrying a dated verdict per citation | **`none`** | written by the producer of `SC-S3-34` → read on the serve path inside a staleness window → **stale by default at a revalidation budget of zero** | to be defined; the cache is internal and has **no egress** | **yes**, from `SC-S3-34` | no | `required-by-upstream` |
| `SC-S3-34` | **Citation-drift verdict store** — the out-of-band producer's own verdict store | **`none`** | written **only** by the producer, which is the system's **only component with egress to a party outside the operator's control** | to be defined | no | no | `required-by-upstream` |
| `SC-S3-35` | **Gate-verdict record** — the authoring-time gate battery's per-requirement verdicts, each naming its gate id and blocking behaviour | **`none`** | written by the gate runner inside a terminable isolate under a host-enforced wall-clock bound | to be defined | no | no | `required-by-upstream` |
| `SC-S3-36` | **Quarantine record** — the three-slot (`reason`, `owner`, `exit_condition`) record for a requirement that cannot yet be decided | **`none`** | opened when a gate quarantines → closed by its stated exit condition | to be defined | no | no | `required-by-upstream` |
| `SC-S3-37` | **DP-map node and prerequisite-edge records** — the static graph: nodes carrying `progression_stage`, `prerequisite_depth`, `difficulty`, `status`, `creator_review`, and the acyclic edge set over them | **`none`** in this system — the graph is a committed artifact in NEU-889's package, not a table here | authored and gate-verified upstream → imported → to be defined | to be defined | no | **no** — the graph is learner-independent by construction | `required-by-upstream` |
| `SC-S3-38` | **Per-learner per-node progression** — a learner's position against the DP graph | **`none`** | to be defined | to be defined | no | **yes** | `required-by-upstream` |
| `SC-S3-39` | **Per-learner mastery-gate state** — the durable multi-session composite NEU-888's durability gate reads, as distinct from the read-time `SC-S3-28` | **`none`** | to be defined | to be defined | partly — a composite over recorded history, but **persisted**, not recomputed per read | **yes** | `required-by-upstream` |
| `SC-S3-40` | **Measurement-contract register** — the frozen, versioned `MC-<n> v<major>.<minor>` contracts, superseded by new versions and never edited in place | **`none`** in this system — the register is a committed artifact in NEU-887's package | frozen at a version → superseded by a new version → **prior versions are retained, never overwritten** | `durable` by requirement | no | no | `required-by-upstream` |
| `SC-S3-41` | **Operational-log derived extract (`PLA-*`)** — the minimized, allowlisted, payload-free aggregate any log-derived claim must go through, carrying its own retention window and named deletion owner | **`none`** | derived from `SC-S3-16`/`SC-S3-17` under an allowlist → retained for a stated window → **deleted by a named owner** | to be defined | **yes**, from `SC-S3-16`/`SC-S3-17` | **question — open** | `required-by-upstream` |

**`SC-S3-32` inherits its field restriction and does not widen it.** `DR-C09-01` fixes the interim stored
set at *"`stable id` + `canonical URL` only"* and routes `title`, numeric `constraints`, difficulty signal
and curriculum placement to ledger challenge **`CH-F5-1`**
(`../C009-course-content-quality/decision-records/DR-C09-01_permitted-field-set.md:16`–`:17`, NEU-890,
compiled 2026-08-10). That record also states the **only** permitted route for a sub-task needing a wider
set: cite `CH-F5-1` by id and carry the unresolved field set **as a cap with a named owner**. This
document does exactly that — see **`CAP-S3-1`**.

**`SC-S3-33` and `SC-S3-34` are two categories, not one, and `SC-S3-35` is a third.** That split is
`SUB-2`'s specification, consumed here rather than re-derived: the producer is externally-facing and
asynchronous, the cache is internal and read-only on the serve path
(`03_execution-environment-and-citation-drift-component.md` §4.2–§4.3), and the gate-verdict state is
written by a different component again (§3.5). Merging any two of them would put egress inside a
component specified to have none.

### 3.7 Assumed — predicted only by a SUB-1 stand-in assumption

**These four are `assumed`, never `existing` and never silently promoted to `required-by-upstream`.** Each
names its stand-in **in the entry**, per `00_method-and-provenance.md` §2.3. All four stand-ins are
`[unconfirmed]` and each carries a re-validation trigger that fires when its package lands.

| Id | Category | Store | Lifecycle | Volatility | Derived | Learner-scoped | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `SC-S3-42` | **Tutoring / hint interaction state** — per-learner, per-node interaction state with sub-second read latency on the learner path | **`none`** | to be defined | to be defined | no | **yes** | **`assumed` — `A-25`** |
| `SC-S3-43` | **Web-session and UI interaction state** — browser-held state on a rich authenticated **web session**, explicitly **not gate-bearing** | **`none`** | to be defined | to be defined | no | **yes** | **`assumed` — `A-27`** |
| `SC-S3-44` | **Handoff authorization envelope** — a bounded, **expiring, revocable** authorization and context envelope crossing the trust boundary to an external MCP client | **`none`** | minted at handoff → **must expire** and **must be revocable** | `TTL` by assumption | no | **yes** | **`assumed` — `A-29`** |
| `SC-S3-45` | **Learner-identity → owner mapping** — the server-side binding of an authenticated principal to the rows it owns | **`none` — see §6; no ownership column exists on any table today** | to be defined | to be defined | no | **yes, by definition** | **`assumed` — `A-28`** |

**`A-26` introduces no state category, and that is recorded rather than left to inference.** It is an
assumption about the *absence* of AI latency, privacy and cost budgets — a budget is not a thing the
system stores. It is the one stand-in of the five that adds no row here. A reader checking "five
stand-ins, four assumed entries" is looking at a real one-to-none mapping, not a missing entry.

---

## 4. The schema-and-code walk, with per-item disposition

**Method.** A read-only walk over `src/` and `drizzle/` at the **2026-08-21** verification cutoff, run
against this inventory item by item. Per `00_method-and-provenance.md` §6, no codebase count is inherited
from the charter or from SUB-1 — every number below was re-counted at this cutoff. Under §1.1 this is an
**automated check**: a proxy signal establishing what the code contains at one moment, and **not**
external validation of anything.

### 4.1 Persisted tables — 14 items, 17 entries, zero missing, zero duplicated

Re-counted mechanically at this cutoff:
`grep -c "pgTable(" src/infrastructure/db/schema.ts` → **10**;
`grep -n "infrastructureSchema.table("` → **2** (`:333`, `:364`).

| Walk item | Source | Disposition |
| --- | --- | --- |
| `learning_topics` | `schema.ts:21` | → `SC-S3-1` |
| `learning_chunks` | `schema.ts:49` | → **three** entries: `SC-S3-2` (content), `SC-S3-3` (SM-2 group `:59`–`:65`), `SC-S3-4` (`validator_report` `:77`) |
| `learning_sessions` | `schema.ts:99` | → `SC-S3-5` |
| `session_chunks` | `schema.ts:126` | → `SC-S3-6` |
| `session_questions` | `schema.ts:156` | → `SC-S3-7` |
| `session_question_chunks` | `schema.ts:179` | → `SC-S3-8` |
| `session_question_attempts` | `schema.ts:197` | → **two** entries: `SC-S3-9` (attempt/grade), `SC-S3-10` (NEU-844 quad `:213`–`:220`) |
| `session_question_attempt_revisions` | `schema.ts:250` | → `SC-S3-11` |
| `notes` | `schema.ts:288` | → `SC-S3-12` |
| `context_tokens` | `schema.ts:312` | → `SC-S3-13` |
| `infrastructure.linter_validation_corpus` | `schema.ts:333` | → `SC-S3-14` |
| `infrastructure.linter_rule_validation_report` | `schema.ts:364` | → `SC-S3-15` |
| `infrastructure.mcp_request_log` | `drizzle/0010_…:1`–`:19`, `drizzle/0012_…:1`–`:6` | → `SC-S3-16` |
| `infrastructure.operation_event_log` | `drizzle/0013_…:1`–`:16` | → `SC-S3-17` |

**14 tables → 17 entries.** The three splits are `learning_chunks` (+2) and `session_question_attempts`
(+1), each justified in §3.1 and by `DR-C10-S3-1`.

### 4.2 Column groups the charter names explicitly — all present

| Named group | Entry |
| --- | --- |
| Per-chunk SM-2 scheduling state | `SC-S3-3` |
| The NEU-844 scheduling-snapshot quad | `SC-S3-10` |
| Grade revisions | `SC-S3-11` |
| Notes | `SC-S3-12` |
| Context tokens | `SC-S3-13` |
| Content-audit verdicts in `validator_report` | `SC-S3-4` |
| The linter corpus | `SC-S3-14` |
| Per-rule validation reports | `SC-S3-15` |

### 4.3 Process-local structures — 11 structures, 10 entries

| Walk item | Source | Disposition |
| --- | --- | --- |
| MCP transport map | `src/transport/http.ts:82` | → `SC-S3-18` |
| Subject-binding map | `src/transport/http.ts:83` | → `SC-S3-19` |
| Rate-limit windows | `src/transport/rate-limit-middleware.ts:58`–`:59` | → `SC-S3-20` |
| Tier-2 circuit-breaker set + cache + in-flight guard | `src/orchestration/tier2-circuit-breaker.ts:68`, `:69`, `:76` | → `SC-S3-21` |
| Correlation-id / request-context `AsyncLocalStorage` ×2 | `src/shared/logger.ts:115`–`:116` | → `SC-S3-22` (**merge**: same store, lifetime, writer and volatility) |
| pg pool singleton | `src/infrastructure/db/client.ts:5` | → `SC-S3-23` (**merge** with the next) |
| Drizzle handle singleton | `src/infrastructure/db/operations.ts:5` | → `SC-S3-23` |
| Event-logger sink toggle | `src/shared/logger.ts:214` | → `SC-S3-24` |
| Audit transport buffer + breaker | `src/transport/pg-audit-transport.ts:45`–`:52` | → `SC-S3-25` (**merge** with the next) |
| Event transport buffer + breaker | `src/transport/pg-event-transport.ts:41`–`:48` | → `SC-S3-25` |
| JWKS remote key set | `src/transport/jwt-middleware.ts:90` | → `SC-S3-26` |
| Classifier per-field model cache | `src/adapters/langchain/content-classifier-adapter.ts:47` | → `SC-S3-27` |

**Three merges, each stated rather than silent** — the two `AsyncLocalStorage` stores, the two database
client singletons, and the two transport buffer/breaker pairs. In each case all four discriminators of
`DR-C10-S3-1` agree, so no ownership model could split them. **Every merge is listed above precisely so
the exactly-once property is auditable**: 12 walk rows above, 11 distinct structures (the
`AsyncLocalStorage` row covers two), 10 entries.

### 4.4 Derived values — 3 items, 3 entries

| Walk item | Source | Disposition |
| --- | --- | --- |
| `masteryLevel` | `src/orchestration/teaching-workflows.ts:602` | → `SC-S3-28` |
| `LearnerContext` | `src/orchestration/learner-context-workflows.ts:16`–`:34`, `:84`–`:228` | → `SC-S3-29` |
| Analytics KPIs / window rollups | `src/domain/services/analytics-calculator.ts:112`–`:143`, `:191`–`:246` | → `SC-S3-30` |

Each was checked against the §4.1 column list for a backing column of the same name; **none exists**.

### 4.5 Walk result

**Zero missing. Zero duplicated.** Every table, named column group and process-local structure found by
the walk resolves to exactly one entry, and every `existing` entry in §3 traces back to at least one walk
item. The disposition tables above **are** the evidence, not a summary of it.

---

## 5. Upstream cross-check — one table per package

Each package is cited by version or compilation date, per `00_method-and-provenance.md` §2.2. The three
C005 versions are as recorded in `../C009-course-content-quality/README.md:76` and confirmed against each
package's own header where one is present.

### 5.1 NEU-887 — the product, learner and evidence foundation

**Cited as:** `../C005-product-foundation/`, umbrella NEU-887, consolidated by NEU-907, dated
**2026-07-12** (`../C005-product-foundation/README.md:3`).

| State it names | Entry | Status |
| --- | --- | --- |
| The frozen, versioned measurement-contract register (`MC-<n> v<major>.<minor>`) | `SC-S3-40` | `required-by-upstream` |
| The `PLA-*` operational-log derived extract, with its allowlist, retention window and named deletion owner | `SC-S3-41` | `required-by-upstream` |
| The operational logs those extracts are derived from | `SC-S3-16`, `SC-S3-17` | **`existing`** |
| The seven-class evidence taxonomy (`[literature]`, `[code-evidence]`, `[dogfooding]`, `[ai-critique]`, `[automated-eval]`, `[operational-log]`, `[future-real-user]`) — `01_evidence-taxonomy.md:12`–`:18` | **none — introduces no runtime state** | — |

**The taxonomy is a labelling discipline, not a state category, and saying so is part of the check.** It
governs how a *claim in a document* is tagged; nothing in the running system stores an evidence class. An
inventory that minted an entry for it would be reporting a documentary convention as system state.

**One attribution correction, recorded rather than silently fixed.** The *corpus-neutral
assessment-evidence record* (`SC-S3-31`) is **NEU-890's**, defined in
`../C009-course-content-quality/06_assessment-evidence-out-of-band.md`, **not** NEU-887's — a search of
`../C005-product-foundation/` for "corpus-neutral" returns zero matches. It is cross-checked under §5.4
where it belongs. This document originally attributed it to NEU-887 on the strength of the taxonomy
association; the cross-check is what caught it.

**`SC-S3-41` is the entry that makes an unmet requirement visible.** NEU-887's operational-log privacy
gate (`../C005-product-foundation/measurement-contracts/05_operational-log-privacy-gate.md:19`–`:23`)
classifies `mcp_request_log.response_body` and `.params` as **learner payload**, and
`operation_event_log.data` as potentially payload; `:37` and `:54` require every raw result and minimized
derivative to carry a stated retention window and a **named deletion owner**. Neither log table implements
either today. That gap is `F-S3-3`.

### 5.2 NEU-888 — the instructional and mastery model

**Cited as:** `../C005-instructional-model/`, umbrella NEU-888, task NEU-915, **verification cutoff
2026-07-13** inheriting 2026-07-07 (`../C005-instructional-model/README.md:3`).

| State it names | Entry | Status |
| --- | --- | --- |
| The durable multi-session mastery composite the **durability gate** reads (`mastery-model/00_operational-mastery-model.md:29`–`:36`) | `SC-S3-39` | `required-by-upstream` |
| A learner's position against the DP graph — the *pedagogical* progression NEU-889 explicitly does not own | `SC-S3-38` | `required-by-upstream` |
| The read-time mastery signal the current system already computes | `SC-S3-28` | `existing`, derived |
| Spacing state — the SM-2 interval/ease fields the current scheduler persists | `SC-S3-3` | **`existing`** |

**`SC-S3-28` and `SC-S3-39` are two entries on purpose.** `SC-S3-28` is `min(repetitions, 5)` computed at
prompt-render time and thrown away; NEU-888's durability gate is *"server-evaluated from persisted
multi-session history"* (`:36`) and requires durable state that does not exist. Recording only the first
would report a requirement as already met.

**A widening of `SC-S3-3` is not a new category, and the rule says why.** NEU-888 records that the current
scheduler *"fits/persists no per-item stability/difficulty"*, so satisfying it would add columns to the
per-chunk scheduling state. Under `DR-C10-S3-1` that is the **same** category — same store, same writer
(the scheduler), same lifecycle, same volatility — so it widens `SC-S3-3` rather than minting an entry.
Recorded here so a later reader does not read its absence as an omission.

**Misconception / "learner schema" state is deliberately absent, and that is a checked result.** A search
of `../C005-instructional-model/` for `misconception` and for `learner schema` returns **zero matches** in
both cases. NEU-888 does not name such a category, so this inventory does not invent one for it. If a
later NEU-888 revision names one, falsifier 4 in §7.3 fires.

### 5.3 NEU-889 — the dynamic-programming learning progression

**Cited as:** `../C005-dp-map-package/` **v1.0.0**, compiled **2026-07-16**
(`../C005-dp-map-package/README.md:3`).

| State it names | Entry | Status |
| --- | --- | --- |
| DP-map node records and their acyclic prerequisite-edge set | `SC-S3-37` | `required-by-upstream` |
| Per-learner per-node progression | `SC-S3-38` — **owned by NEU-888, not NEU-889** | `required-by-upstream` |

**The split between `SC-S3-37` and `SC-S3-38` is NEU-889's own, consumed rather than invented.** That
package states that ordering the graph into a teaching sequence is a different artifact — a prerequisite
edge is a **structural** claim, a progression is a **pedagogical** one — and that nothing in C005 measures
DP learning. So the static graph is `SC-S3-37` and the per-learner position against it is `SC-S3-38`,
cross-checked under NEU-888 in §5.2. Merging them would assign one authority to two things the upstream
package explicitly separates.

### 5.4 NEU-890 — the course content, problem assessment and quality system

**Cited as:** `../C009-course-content-quality/`, compiled **2026-08-10**
(`../C009-course-content-quality/README.md:3`).

| State it names | Entry | Status |
| --- | --- | --- |
| Problem-citation record, `stable_id` + `canonical_url` only, pending `CH-F5-1` | `SC-S3-32` | `required-by-upstream` |
| Corpus-neutral assessment-evidence record (`node_id` + `skill_type` identity) | `SC-S3-31` | `required-by-upstream` |
| Gate-verdict records from the authoring-time gate battery | `SC-S3-35` | `required-by-upstream` |
| Quarantine records (`reason`, `owner`, `exit_condition`) | `SC-S3-36` | `required-by-upstream` |
| Citation-drift verdict store (out-of-band producer) | `SC-S3-34` | `required-by-upstream` |
| Cached citation-drift verdict (internal, serve path) | `SC-S3-33` | `required-by-upstream` |
| Linter validation corpus | `SC-S3-14` | **`existing`** |
| Per-rule validation reports | `SC-S3-15` | **`existing`** |

**Two of NEU-890's named categories already exist.** `SC-S3-14` and `SC-S3-15` are live tables
(`schema.ts:333`, `:364`). They are therefore marked `existing`, not `required-by-upstream` — the status
field records what **is**, and a category is not "required by upstream" merely because an upstream package
also depends on it. NEU-890 itself caps the corpus as covering only the deterministic stage, so the table
existing does not mean the requirement is discharged; that is NEU-890's cap to carry, not this
document's.

### 5.5 The `EQ-S3-*` reconciliation — a foreign namespace, deliberately not carried

`F-S2-2` in `02_findings-register.md` names four rows — `EQ-S3-3`, `EQ-S3-4`, `EQ-S3-5`, `EQ-S3-6` — plus
`EQ-S3-10`, as egress rows that must not be folded into the gate runner.

**Those ids are `NEU-890`'s, not this package's.** They are defined at
`../C009-course-content-quality/09_enforceable-quality-system.md:190`–`:193` and `:197` (compiled
2026-08-10), where the `S3` segment denotes **C009's** sub-task 3. They are **not** ids in the C010
namespace and are **not** carried as `SC-S3-*` entries: this package's `README.md` defines exactly five id
families (`A-`, `OI-`, `CAP-`, `SPK-`, `F-`), `EQ-` is not among them, and minting a sixth would collide
with a live foreign namespace whose `S3` means a different sub-task. The collision hazard is filed as
**`F-S3-1`**.

**What this inventory carries instead is the state those rows imply**, cross-walked here:

| NEU-890 row (`09_enforceable-quality-system.md`) | What it does | State it implies | Entry |
| --- | --- | --- | --- |
| `EQ-S3-3` (`:190`) — `V2`, one call per path, no crawl, robots and rate limits honoured | egress | the verdict the call produces | `SC-S3-34` |
| `EQ-S3-4` (`:191`) — `V3`, the stable id resolves live at a stated date | egress | resolution verdict + the id it resolves | `SC-S3-34`, `SC-S3-32` |
| `EQ-S3-5` (`:192`) — `V4`, canonical URL resolves to the same problem and the pair agrees | egress, **both** phases | drift verdict | `SC-S3-34`, cached as `SC-S3-33` |
| `EQ-S3-6` (`:193`) — `V5`, title and constraints match, read **only to confirm**, nothing stored | egress | **no new stored state** — the row's whole point is that nothing from the page is retained | none, by design |
| `EQ-S3-10` (`:197`) — the procedure is idempotent across dates | re-run | drift verdict, compared across dates | `SC-S3-34`, `SC-S3-33` |

`EQ-S3-6` mapping to **no** entry is the row behaving correctly, not a gap: NEU-890 specifies that
nothing from the page is stored, mirrored or paraphrased, so an inventory entry for it would contradict
the requirement.

---

## 6. The learner-scoping dimension — a question per entry, never a schema fact

**Consumed, not re-decided.** `NEU-850's OUT-2` commits learner ownership to the MCP core database
schema, keyed to the **JWT subject**. This package records that as a consumed constraint and does not
re-run the placement trade study (`01_outcome-register.md`, `OUT-4`).

**The codebase fact, re-verified at this cutoff.** A search of `src/infrastructure/db/schema.ts` for
`user_id`, `userId`, `learner_id` and `learnerId` returns **zero matches**. **No ownership column exists
on any of the 12 Drizzle-defined tables, nor on either raw-SQL log table.** Consequently:

- **No entry in §3 describes an ownership column as present**, and the `Learner-scoped` column reads
  **`question — open`** wherever ownership is intended but absent.
- The only identity-bearing state anywhere in the running system is **process-local**: the subject-binding
  map (`SC-S3-19`, `src/transport/http.ts:83`) and the rate-limiter's per-subject key (`SC-S3-20`,
  `src/transport/rate-limit-middleware.ts:76`–`:77`). Neither is written to any table.
- `infrastructure.mcp_request_log` (`SC-S3-16`) has **no principal field**, so **no logged request is
  attributable to a subject today**.
- `SC-S3-41` therefore exists as an **`assumed`** category under **`A-28`** — the mapping is assumed to be
  enforceable server-side, and that assumption is `[unconfirmed]`.

`SUB-13`'s matrix carries this column forward, and `SUB-14` applies `SUB-5`'s invariant to it per row.
**This document states the question and assigns nothing.**

---

## 7. The completeness method, and the omission probe that revised it

### 7.1 The method as originally stated

Exhaustiveness was to be claimed from the union of three sweeps:

1. **A schema walk** — every table in `src/infrastructure/db/schema.ts` plus every table created by raw
   SQL under `drizzle/`.
2. **A code walk** — every module-level mutable structure (`new Map(`, `new Set(`, module-scope `let`,
   `AsyncLocalStorage`) and every read-time aggregate with no backing column.
3. **An upstream cross-check** — every state category named by NEU-887, NEU-888, NEU-889 and NEU-890,
   plus every category a SUB-1 stand-in predicts.

### 7.2 The omission probe, and what it found

**Probe.** An independent read-only walk was run over the source tree by a reader working **only** from
the charter's own list of process-local state — "MCP transport map, subject-binding map, rate-limit
windows, Tier-2 circuit-breaker set, correlation-id storage" — and asked to name any category that list
misses.

**Result — the probe found six, and they are now `SC-S3-23` … `SC-S3-27`.** The database client
singletons, the event-logger sink toggle, the two transport batch buffers with their own per-sink circuit
breakers, the JWKS key set, and the classifier's per-field model cache. All six are process-local, all six
are mutable, and **one of them loses data on restart**: `SC-S3-25` drops buffered audit and event entries
on crash, and drops them outright while its breaker is open
(`src/transport/pg-audit-transport.ts:83`–`:90`, `src/transport/pg-event-transport.ts:76`–`:83`).

**Why the original method missed them, and the revision it forced.** Sweep 2 as first stated was applied
to *the charter's enumeration* rather than to the source tree — that is, the list of five was read as the
answer instead of as an example. Six of eleven structures are therefore absent from the charter's list,
and an inventory built from that list would have been **45 % short on process-local state** while
appearing complete.

**The method is revised accordingly, and this is the revision:**

> **Sweep 2 is run against the source tree, never against any prose enumeration of it — including this
> document's own. A list of state categories written in prose is evidence that someone looked once; it is
> never the sweep.**

That revision is the reason `SC-S3-23` … `SC-S3-27` exist, and it is recorded here rather than quietly
folded in, because `OUT-2`'s third verification criterion asks for exactly this.

**A second, smaller probe result.** The probe also surfaced four module-level `Set`s that are *not* state
(§3.4). Excluding them is a decision under `DR-C10-S3-1`, and it is recorded so that a later reader
re-running the sweep finds them already dispositioned rather than apparently missed.

### 7.3 What would falsify the completeness claim

**Named in advance, so a falsification is a finding rather than a revision of the standard:**

1. **A table** in `src/infrastructure/db/schema.ts` or created under `drizzle/` at a later cutoff that
   resolves to no entry in §3, or to more than one.
2. **A module-level mutable structure** — `Map`, `Set`, `let`, `AsyncLocalStorage` — reachable from
   `src/transport/`, `src/orchestration/`, `src/adapters/`, `src/infrastructure/` or `src/shared/` that
   resolves to no entry and is not on §3.4's excluded-constants list.
3. **A read-time aggregate** returned by any MCP tool that is not `SC-S3-28`, `SC-S3-29` or `SC-S3-30`.
4. **A state category named by NEU-887, NEU-888, NEU-889 or NEU-890** with no row in §5.
5. **A category predicted by `A-25` … `A-29`** with no `assumed` entry — noting that `A-26` predicts none,
   which is itself recorded in §3.7 rather than left as an apparent gap.
6. **A row in `SUB-13`'s matrix** with no corresponding `SC-S3-*` entry, or an `SC-S3-*` entry with no
   matrix row. `SUB-11 (NEU-985)` checks this correspondence mechanically and reports counts.

**What would *not* falsify it:** a disagreement about whether two entries should have been one. That is a
disagreement with `DR-C10-S3-1`, which has its own revision trigger, and it is settled there — not by
adjusting this inventory's row count.

---

## 8. Counts

| Status | Entries | Ids |
| --- | --- | --- |
| **`existing`** | **30** | `SC-S3-1` … `SC-S3-30` |
| **`required-by-upstream`** | **11** | `SC-S3-31` … `SC-S3-41` |
| **`assumed`** | **4** | `SC-S3-42` … `SC-S3-45` |
| **Total** | **45** | — |

Breakdown of the 30 `existing`: **17** persisted (13 `public`-schema entries from 10 tables, 2
Drizzle-defined `infrastructure`, 2 raw-SQL `infrastructure`), **10** process-local (covering 11
structures), **3** derived-never-persisted.

**Well over a third of the inventory — 18 of 45 — has no store at all**, and a further 10 have a store
that does not survive a process restart. That ratio is the single most consequential number in this
document: an inventory keyed on persistence would have reported 17 entries and looked complete.

---

## 9. What this hands on

- **`SUB-4 (NEU-974)`** — receives the entry set as the state each component must be placed around. In
  particular `SC-S3-33`/`SC-S3-34`/`SC-S3-35` are three categories written by different components, and
  `SC-S3-25` is process-local state whose loss is bounded to audit fidelity rather than domain
  correctness.
- **`SUB-6 (NEU-976)`** — receives the individuation rule (`DR-C10-S3-1`) as a constraint the ownership
  model must be scored against: a model that cannot give a single authority to `SC-S3-10` separately from
  `SC-S3-9` has to say so.
- **`SUB-13 (NEU-977)`** — receives **45 rows**, each already a well-posed authority question, and the
  `Learner-scoped` column its matrix must carry. **The exactly-one-authority audit runs against this id
  set.** Note `F-S3-2`: `SUB-13` is **NEU-977**, and a merged sibling cites it under a different number,
  so grepping for its own id will not find every row addressed to it.
- **`SUB-14 (NEU-978)`** — receives the `Learner-scoped` column as the thing `SUB-5`'s invariant is tested
  against per row, plus the confirmed fact that no ownership column exists to test against today, plus
  **`F-S3-3`**: two `existing` tables hold learner payload with no retention window, no deletion owner and
  no principal field, so per-learner deletion is not expressible against them at all.
- **`SUB-11 (NEU-985)`** — receives the correspondence check (every `SC-S3-*` in the matrix, every matrix
  row in `SC-S3-*`), the falsifier list in §7.3, and **`F-S3-1`** and **`F-S3-2`** as mechanical audits it
  can run directly.
- **`SUB-12 (NEU-986)`** — receives **`CAP-S3-1`**, **`CAP-S3-2`** and **`CAP-S3-3`** for reconciliation at
  the completeness gate, and **`OI-S3-1`**/**`OI-S3-2`** as open items owned elsewhere in the charter.

---

## 10. Verification note

Per `00_method-and-provenance.md` §5, verification here is by **file inspection and `git diff`** against
countable criteria — the entry count, the status counts, the walk dispositions, and the zero-deletion
check on every shared register this sub-task appended to. **No test was run and no build output is cited
as evidence about this document's content**, because neither the type-checker nor the linter has `docs/`
in scope and this change touches zero TypeScript files.

Per §5.1, **`qa-execution:engine` is unconfigured and the automated QA phase is a genuine no-op** for this
sub-task. **No QA pass is claimed, fabricated, or implied.** No cap is filed for it either — §5.1 forbids
filing a cap for a check that was never applicable, and `CAP-S1-3` already carries the package-level
statement.

**No spike backs this document.** `92_spike-register.md` §3's justification test asks whether the question
could have been read instead; for every claim here the answer is yes, so no spike was run, none is cited,
and **no `### SUB-3` section is added to `92_…`** — that register holds records, and there is no record to
write.
