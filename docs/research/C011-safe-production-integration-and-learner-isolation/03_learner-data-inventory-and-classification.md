# The learner-data inventory, and what each category is

**Sub-task:** SUB-3 (NEU-995) · **Covers:** OUT-9
**Written:** 2026-08-25 · **Model:** claude-opus-5[1m]
**Codebase cutoff:** `origin/develop` @ `86fb38a`
**Depends on:** SUB-1 (NEU-993), position 1 — merged
**Consumes:** `01_production-evidence-and-the-access-audit.md` §6 (the sixth copy class's terms, read as
recorded); `../C010-system-and-repository-architecture/04_state-category-inventory.md` (the
45-category state inventory this chapter cross-checks against);
`../C010-system-and-repository-architecture/decision-records/DR-C10-S3-1_state-category-individuation.md`
(the individuation rule, consumed with its source cited).
**Decision records:** `DR-C11-S3-1`, `DR-C11-S3-2`, `DR-C11-S3-3` · **Traceability:** `traceability/S3_learner-data-inventory.md`

---

## 0. What this chapter is

The single place that says **what learner data this system holds, where each piece lives, and what
each piece is**. Thirty-two categories, each appearing exactly once, each carrying six classification
fields. It is the surface OUT-10 (consent), OUT-11 (export and erasure) and OUT-12 (propagation) are
designed over; without it those three are designed over an unknown.

**It is classification, not policy.** Deciding what consent covers and what erasure does per category
is SUB-8's; assigning a propagation action per copy class is SUB-9's; determining whether a logged
request is attributable to a learner is SUB-16's; threat-modelling these categories is SUB-12's.
Nothing below does any of those.

**A framing constraint, stated once and meant literally.** This chapter is designed against a
GDPR-shaped baseline — lawful basis, purpose limitation, data minimization — authored as **product
and engineering requirements, not legal advice**. Where a duty turns on a legal determination, the
determination is routed to `OI-S3-1` with a named owner and is **not made here**.

**Two disambiguations, because this package's vocabulary collides with the product's.**

- **`subject`** in this chapter always means the **academic subject** — the `text` column on
  `learning_topics` (`src/infrastructure/db/schema.ts:26`) and `learning_chunks` (`:57`). The OIDC
  `sub` claim is written `sub` and never `subject`.
- **`session`** means a **learning session** (`learning_sessions`) unless written *MCP transport
  session*, which is the connection-scoped thing `src/transport/http.ts:82` keys its map on. They are
  unrelated.

**The greenfield statement, because it is load-bearing.** C010 contains no GDPR, consent or export
material anywhere; its only retention/deletion content is the `CAP-S3-3` / `CAP-S4-1` / `F-S3-3` /
`CAP-S7-1` chain over the two operational-log tables (charter assumption 37, full-package sweep
2026-08-24). This chapter therefore carries **its own** evidence and its own rejected alternatives,
and is not written as if it refines an upstream position. The residual — that a lifecycle position is
quietly assumed anyway — is `R12` in `92_risk-register.md`.

**No production quantity in this chapter is measured.** SUB-1 executed zero of its nine designed
spikes; no production credential exists in the authoring environment (`F-S1-2`, `CAP-S1-1`). Every
statement below is about the **declared schema and the code that writes it** at cutoff `86fb38a`.
Whether a given production row actually contains learner free text is `OI-S1-5` and `OI-S1-6`, owned
and unclosed — cited here, never assumed. That limit is registered as `CAP-S3-1`.

---

## 1. The entry shape — published, because SUB-8 must match it

Every inventory entry below carries exactly these six classification fields, on top of its identity
(id, category name, and where it lives).

| # | Field | What it records |
| --- | --- | --- |
| 1 | **Data class** | What kind of data it is — learner-authored free text, derived scheduling state, session-control state, corpus metadata, operational telemetry, or transport/auth state. |
| 2 | **Personal-data status** | One of the four values fixed in §2. |
| 3 | **Lawful basis (position)** | The basis this category **would** rest on, stated as a product-and-engineering position. **Never a legal conclusion** — selection is `OI-S3-1`. |
| 4 | **Purpose** | What it is for, stated so it can be traced to a real use in the codebase (§12). |
| 5 | **Minimization position** | Whether the field set is the minimum for that purpose, and where it is not. |
| 6 | **Derivation** | `learner-supplied`, `agent-authored`, `derived` (computed from other categories), or `system-generated`. |

**This is the shape SUB-8 must match.** The versioned consent record OUT-10 creates does not exist at
position 3, so it is not inventoried here (§9). When SUB-8 authors that category's classification
entry, it writes these six fields **plus a seventh** — the retention/erasure position after
withdrawal — per charter assumption 50. This chapter publishes the shape; it asserts nothing about
SUB-8's entry, which does not exist yet.

---

## 2. The personal-data status vocabulary, and the fact that forces it

**Exactly four values.**

| Value | Meaning |
| --- | --- |
| **learner-identifying** | Carries an identifier that resolves to a natural person, or to the authenticated principal standing for one. |
| **learner-linked** | Attributable to a specific learner through a principal column, or an FK chain reaching one. |
| **unattributed learner content** | Content authored by, or describing, a learner, with **no** column anywhere in the store that attributes it to one. |
| **not personal data** | Neither learner content nor an attribution. |

**The fact that forces a four-value vocabulary rather than a binary one: no ownership column exists
on any table today.** A direct read of `src/infrastructure/db/schema.ts` at cutoff `86fb38a` finds no
`owner`, `user_id`, `learner_id` or principal column on any of the twelve tables it declares; the only
`subject` columns are the academic-subject fields at `:26` and `:57`. `context_tokens` — the one table
that exists specifically to represent an authorized session — carries exactly `id`, `created_at` and
`expires_at` (`:312`), which SUB-1 already recorded as `F-S1-1`. C010 states the same fact from its
own independent walk (`../C010-system-and-repository-architecture/04_state-category-inventory.md` §7).

The consequence is that **no persisted category can be `learner-linked` on the data alone at this
cutoff.** Attribution today is a property of the *deployment* — single-tenant, `n = 1`, the creator
(charter assumption 31) — not of any stored value. A binary personal/not-personal vocabulary cannot
express that, which is precisely why the third value exists. The alternative is recorded and rejected
in `DR-C11-S3-1`.

**Two different futures, and they are not the same kind of statement.**

- For the `public` and Drizzle-defined `infrastructure` tables, attribution is a **scheduled**
  change: OUT-8 obligates an ownership column and OUT-13 designs what the `context_tokens` row
  carries beyond its three columns. These entries read *"unattributed learner content at this
  cutoff, `learner-linked` once that column lands"* — a transition with a known cause.
- For the **two port-less log tables**, attribution is **undetermined**: whether `NEU-850`'s *"every
  core table"* even ranges over them is `OI-S5-1`, owned by `NEU-850` (this package's stand-in for it
  is `A-36`), and whether a request is made attributable at all is SUB-16's determination. Those two
  entries are therefore genuinely **conditional** — both readings written out, with the condition
  that selects between them (§5).

Those are different statements and this chapter does not blur them.

---

## 3. The enumeration, re-derived at this cutoff

**Ten + two + two + the in-memory set.** Re-derived here against the schema file rather than
inherited.

| Group | What | Count | Evidence |
| --- | --- | --- | --- |
| A | `public` tables | **10** | `src/infrastructure/db/schema.ts` — `pgTable(` occurs exactly 10 times |
| B | `infrastructure` tables **defined in the same file** | **2** | `src/infrastructure/db/schema.ts:333`, `:364`, under the `pgSchema('infrastructure')` declared at `:331` |
| C | `infrastructure` log tables **defined in raw SQL**, not in `schema.ts` | **2** | `drizzle/0010_create_infrastructure_mcp_request_log.sql`, `drizzle/0013_create_operation_event_log.sql` |
| D | process-local in-memory structures | **10** | §6 |

The ten `public` tables, in schema-file order, each with the line its `export const` sits on:

| # | Table | Line |
| --- | --- | --- |
| 1 | `learning_topics` | `src/infrastructure/db/schema.ts:21` |
| 2 | `learning_chunks` | `:50` |
| 3 | `learning_sessions` | `:100` |
| 4 | `session_chunks` | `:127` |
| 5 | `session_questions` | `:157` |
| 6 | `session_question_chunks` | `:180` |
| 7 | `session_question_attempts` | `:198` |
| 8 | `session_question_attempt_revisions` | `:251` |
| 9 | `notes` | `:289` |
| **10** | **`context_tokens`** | **`:312`** |

**`context_tokens` is the tenth of the ten, not an eleventh item beside them.** It is named
explicitly because an eleven-item reading — counting the ten and then adding `context_tokens` again —
is the specific miscount this enumeration exists to prevent. It appears exactly once in this chapter,
as `LD-S3-13`.

The two Drizzle-defined `infrastructure` tables are `linter_validation_corpus` (`:333`) and
`linter_rule_validation_report` (`:364`). The two raw-SQL log tables are a **separate pair**, defined
in `drizzle/` rather than in `schema.ts`, and are the reason group C exists at all.

**Category count ≠ table count.** The inventory individuates by *column group* where two groups in
one table have different purposes, different derivations and different erasure consequences —
consuming C010's individuation rule from
`../C010-system-and-repository-architecture/decision-records/DR-C10-S3-1_state-category-individuation.md`
with its source cited rather than inventing a second rule. So `learning_chunks` carries three
categories and `session_question_attempts` carries two: **13 categories over 10 tables**
(13 − 3 surplus = 10). The tables and their columns were re-derived independently here; only the
individuation rule is consumed.

**Tool surface, stated once for provenance.** Re-counted at this cutoff: `registerTool(` occurs 46
times across `src/server/`, and `EXCLUDED_TOOLS` at `src/transport/context-token-middleware.ts:5`–`:9`
holds exactly three names. **46 registered / 43 gated / 3 exempt**, matching the settled figure. The
superseded miscount that propagated through earlier documents is not repeated here as a codebase fact.

---

## 4. The inventory — persisted `public` state (`LD-S3-1` … `LD-S3-13`)

Every entry: **status** is the personal-data status of §2; **basis** is a position, not a legal
conclusion.

### `LD-S3-1` — Topic record
- **Where:** `learning_topics`, `src/infrastructure/db/schema.ts:21`
- **Data class:** learner- or agent-authored study-structure content (`title`, `subject`, `summary`, `summary_embedding`, `dependency_graph_type`)
- **Status:** unattributed learner content at this cutoff → `learner-linked` once OUT-8's ownership column lands
- **Basis:** contract — the learner asked for the learning service this record constitutes
- **Purpose:** organize a learner's study material into topics and drive topic-level scheduling and search
- **Minimization:** proportionate. `summary_embedding` (`vector(1536)`) is a derived representation of `summary` and carries no additional learner fact; it is retained because it is the search index, not the content.
- **Derivation:** mixed — `title`/`subject` learner-supplied; `summary`, `summary_embedding` agent-authored or derived

### `LD-S3-2` — Chunk content record
- **Where:** `learning_chunks`, `:50` — the content column group (`title`, `subject`, `content`, `condensed_summary`, `content_embedding`, `content_status`, `knowledge_type`, `prerequisites_json`, `tags_json`, `order_index`)
- **Data class:** learner- or agent-authored free-text study content
- **Status:** unattributed learner content → `learner-linked` once the ownership column lands
- **Basis:** contract
- **Purpose:** hold the material a learner studies, and support similarity search over it
- **Minimization:** proportionate to the study purpose. `content` is unbounded free text by design; it is the product.
- **Derivation:** mixed — learner-supplied and agent-authored

### `LD-S3-3` — Per-chunk SM-2 scheduling state
- **Where:** `learning_chunks`, `:50` — the scheduling column group (`difficulty`, `next_review_at`, `ease_factor`, `repetitions`, `consecutive_failures`, `last_reviewed_at`, `interval_days`)
- **Data class:** derived behavioural state
- **Status:** unattributed learner content → `learner-linked` once the ownership column lands. **This is behavioural data about a person** — it records how well someone remembers things — and is separated from `LD-S3-2` for exactly that reason.
- **Basis:** contract
- **Purpose:** decide when each chunk is next due, which is the core spaced-repetition function
- **Minimization:** proportionate; every field is an SM-2 input or output.
- **Derivation:** derived — computed from `LD-S3-9`'s grades

### `LD-S3-4` — Content-audit verdict
- **Where:** `learning_chunks`, `:50` — `validator_report` (`jsonb`, `$type<ValidatorReport>`)
- **Data class:** corpus-quality metadata over learner-visible content
- **Status:** unattributed learner content — the report may quote the chunk content it judges
- **Basis:** legitimate interests — maintaining content quality
- **Purpose:** record why a chunk passed or failed the quality gates
- **Minimization:** **worth watching.** A verdict that quotes content verbatim carries a second copy of `LD-S3-2`'s free text into a differently-purposed field. Flagged, not found defective: the shape of a stored report is not established from the declared schema alone.
- **Derivation:** derived — machine-produced

### `LD-S3-5` — Learning-session record
- **Where:** `learning_sessions`, `:100` (`mode`, `estimated_duration`, `status`, `start_time`, `end_time`, `feedback`, `chunk_ids`)
- **Data class:** session-control state plus learner free text (`feedback`, `:110`)
- **Status:** unattributed learner content → `learner-linked` once the ownership column lands
- **Basis:** contract
- **Purpose:** run and record a study session
- **Minimization:** proportionate; `feedback` is unbounded free text supplied deliberately by the learner.
- **Derivation:** mixed — learner-supplied `feedback`, system-generated timings

### `LD-S3-6` — Session-chunk teaching state
- **Where:** `session_chunks`, `:127` (`status`, `teaching_approach`, `time_spent_ms`)
- **Data class:** derived behavioural state
- **Status:** unattributed learner content → `learner-linked` once the ownership column lands
- **Basis:** contract
- **Purpose:** track per-chunk progress and effort inside a session
- **Minimization:** proportionate. `time_spent_ms` is a behavioural measure and is retained because pacing is a scheduling input.
- **Derivation:** derived

### `LD-S3-7` — Session question
- **Where:** `session_questions`, `:157` (`question_index`, `prompt_text`, `status`)
- **Data class:** agent-authored assessment content
- **Status:** unattributed learner content — `prompt_text` is generated against the learner's own material
- **Basis:** contract
- **Purpose:** pose an assessment question within a session
- **Minimization:** proportionate.
- **Derivation:** agent-authored

### `LD-S3-8` — Question→chunk assessment mapping
- **Where:** `session_question_chunks`, `:180`
- **Data class:** structural join
- **Status:** unattributed learner content — it carries no content of its own, but it links a learner's question to a learner's chunk and so is part of the learner's record
- **Basis:** contract
- **Purpose:** record which chunks a question assessed
- **Minimization:** minimal by construction — two foreign keys and an id.
- **Derivation:** system-generated

### `LD-S3-9` — Attempt and grade record
- **Where:** `session_question_attempts`, `:198` — the attempt column group (`attempt_number`, `response`, `passed`, `feedback`, `quality`, `agent_quality`, `question_type`, `time_spent_ms`)
- **Data class:** **learner-authored free text plus graded performance data**
- **Status:** unattributed learner content → `learner-linked` once the ownership column lands. `response` (`:205`) is what the learner actually wrote; `quality`/`agent_quality`/`passed` are judgements about a person's performance.
- **Basis:** contract
- **Purpose:** record what the learner answered and how it was graded, and feed `LD-S3-3`'s scheduling
- **Minimization:** proportionate to the assessment purpose, and **the most sensitive persisted category in the product**: it is the only place a learner's own words and a judgement of them sit in the same row.
- **Derivation:** mixed — `response` learner-supplied; `feedback`, `agent_quality` agent-authored

### `LD-S3-10` — Pre-review scheduling snapshot
- **Where:** `session_question_attempts`, `:198` — the snapshot quad (`snapshot_band`, `snapshot_predicted_recall`, `snapshot_interval_days`, `snapshot_days_overdue`, `:217`–`:220`)
- **Data class:** derived behavioural state, frozen at grade time
- **Status:** unattributed learner content → `learner-linked` once the ownership column lands
- **Basis:** legitimate interests — algorithm evaluation and audit of scheduling decisions
- **Purpose:** preserve what the scheduler predicted **before** the grade, so predictions can be evaluated after the fact
- **Minimization:** proportionate; four numeric fields, no free text. Separated from `LD-S3-9` because its purpose is evaluation rather than assessment, and it would survive an erasure of the grade only if that were decided deliberately — a decision that is SUB-8's, not this chapter's.
- **Derivation:** derived

### `LD-S3-11` — Grade-revision audit trail
- **Where:** `session_question_attempt_revisions`, `:251`
- **Data class:** audit record containing learner-adjacent free text (`original_feedback`, `new_feedback`, `reason`)
- **Status:** unattributed learner content → `learner-linked` once the ownership column lands
- **Basis:** legitimate interests — integrity of the grading record
- **Purpose:** record that a grade was changed, from what, to what, and why
- **Minimization:** proportionate. It is an append-only audit trail; that is what makes it useful and also what will make it a **retention-exception candidate** for SUB-8 under OUT-11.
- **Derivation:** agent-authored

### `LD-S3-12` — Notes
- **Where:** `notes`, `:289` (`target_type`, `target_id`, `note_type`, `content`, `author`)
- **Data class:** learner- or agent-authored free text
- **Status:** unattributed learner content → `learner-linked` once the ownership column lands
- **Basis:** contract
- **Purpose:** attach a free-text note to a chunk, topic or session
- **Minimization:** proportionate. Note: `target_id` is a **loose polymorphic reference with no database foreign key**, so notes are not reachable by an FK walk from their target — a fact SUB-8's export sweep and SUB-9's propagation matrix both have to handle explicitly rather than by cascade.
- **Derivation:** mixed — `author` distinguishes `'agent'` from `'user'` (`:296`, `:308`)

### `LD-S3-13` — Context tokens
- **Where:** `context_tokens`, `:312` — `id`, `created_at`, `expires_at`, index on `expires_at`
- **Data class:** transport/authorization state
- **Status:** **not personal data at this cutoff.** The row identifies a session's existence and lifetime and nothing about whose session it is. This is `F-S1-1`, recorded by SUB-1.
- **Basis:** contract — necessary to authorize the calls the learner's agent makes
- **Purpose:** gate the 43 gated tools on a live, unexpired session token
- **Minimization:** **minimal to the point of being a gap.** There is nothing to remove; the open question is what OUT-13 must *add*, which is `OI-S8-1`, owned by `NEU-984` (`SUB-10 of C010`). This entry becomes `learner-identifying` the moment a principal is bound to it.
- **Derivation:** system-generated

---

## 5. The two port-less log tables — classified conditionally, with the condition stated

`LD-S3-16` and `LD-S3-17` are the pair defined in raw SQL under `drizzle/`, with **no port, no
Drizzle model, and no principal column**. They are the only entries in this inventory carrying two
readings, and §2 says why: their attribution is undetermined, not merely pending.

**The condition that selects between the readings, stated once and applying to both entries:**

> **If** a principal column is added to these tables (or an existing column is made to carry an
> authenticated principal), **then** they become **learner-linked** personal data. **Until then** they
> are **unattributed learner content**: they hold learner free text with nothing in the row that
> attributes it to a learner.

**The sub-task that determines it is SUB-16 (OUT-15)**, which makes a request attributable and an
isolation or privacy failure detectable. The determination happens **once, downstream of this
inventory**, and flows forward into SUB-8's export and erasure duties (OUT-11) and SUB-9's propagation
matrix (OUT-12), both of which run after SUB-16.

**This entry is complete as written.** No back-edge revision of this chapter is required and none is
owed: the conditional entry **is** the finished form of the entry, not a placeholder awaiting an
update. The reasoning, and the two rejected alternatives, are in `DR-C11-S3-2`.

Whether `NEU-850`'s *"every core table"* even ranges over these two is `OI-S5-1`, owned by `NEU-850`
and not this package's to decide; the reading this package adopted is `A-36` in
`95_stand-in-assumption-register.md`.

### `LD-S3-16` — MCP request log
- **Where:** `infrastructure.mcp_request_log` — `drizzle/0010_create_infrastructure_mcp_request_log.sql:3`, extended by `drizzle/0012_extend_mcp_request_log.sql:1` (`correlation_id`, `session_id`). Written by `src/transport/pg-audit-transport.ts:117`.
- **Columns:** `id`, `timestamp`, `method`, `rpc_id`, `params`, `response_status`, `response_body`, `duration_ms`, `created_at`, `correlation_id`, `session_id`
- **Data class:** operational telemetry **containing whole, unredacted learner free text**
- **Status (conditional):** **unattributed learner content** today — no principal column exists; `session_id` is the MCP *transport* session id, not an identity. → **`learner-linked` personal data** if attribution is added. Selected by the condition above; determined by **SUB-16**.
- **Basis (position):** legitimate interests — operating and debugging the service. **The basis is weakest here**, because §12 finds the stated purpose unsupported by any read path.
- **Purpose (as stated in the codebase):** diagnostic. `src/shared/logger.ts:35`–`:36` records the choice explicitly: *"Learner `response` text is intentionally NOT redacted — it is useful diagnostic data."*
- **Minimization:** **the worst position in the inventory, and it is a deliberate documented choice rather than an oversight.** `response_body` is the entire response buffer decoded as UTF-8 and stored whole (`src/transport/audit-middleware.ts:88`, assigned unredacted at `:109`). The only redaction that runs is `redactParams` over `params` (`:105`), and that is a credentials-only denylist of six exact key names — `src/shared/redact-params.ts:1`: `/^(token|authorization|secret|password|api_key|apikey)$/i`. It never touches `response_body`. The only bound on `response_body` is a **size cap, not a content filter**: `MAX_CAPTURE_BYTES = 65_536` (`src/transport/audit-middleware.ts:14`), which truncates. **Reported as `F-S3-1`.**
- **Retention:** a 30-day delete exists as a **script**, `scripts/retention-cleanup.sql`, whose cron registration is present only as a comment (`:2`–`:3`). Whether it is scheduled on the deployment is not establishable from the repository and is not asserted here.
- **Derivation:** system-generated envelope wrapping learner-supplied and agent-authored payloads

### `LD-S3-17` — Operation event log
- **Where:** `infrastructure.operation_event_log` — `drizzle/0013_create_operation_event_log.sql:1`. Written by `src/transport/pg-event-transport.ts:109`; **read** by `src/adapters/drizzle/tier2-blocking-stats-repository.ts:39`.
- **Columns:** `id`, `timestamp`, `correlation_id`, `tool`, `level`, `operation`, `event`, `data`, `duration_ms`, `created_at`
- **Data class:** operational telemetry whose `data` payload **may quote learner content verbatim**
- **Status (conditional):** **unattributed learner content** today — no principal column of any kind, not even a transport session id. → **`learner-linked`** if attribution is added. Determined by **SUB-16**.
- **Basis (position):** legitimate interests — operating the service and driving the Tier-2 blocking circuit breaker
- **Purpose:** record operational events, and supply the grouped rejection-rate query the circuit breaker reads (`src/orchestration/tier2-circuit-breaker.ts`)
- **Minimization:** **partially mitigated, and the codebase says so in its own words.** `src/orchestration/topic-workflows.ts:585` and `src/orchestration/chunk-workflows.ts:161` both carry the same NEU-672 note: rationales *"may quote user-supplied chunk content verbatim, so an unbounded persisted value would store unbounded PII"*, and cap the persisted rationale at `RATIONALE_PERSIST_MAX_CHARS = 256`. That is a real control, and it is **narrow** — it bounds rationale length on two named paths; it does not constrain what any other writer puts in `data`.
- **Retention:** **none. The table is indefinitely retained** — `scripts/retention-cleanup.sql` covers only `mcp_request_log`, and both orchestration comments describe this table as *"indefinitely-retained"*. This asymmetry between the two log tables is a fact SUB-8 (OUT-11) and SUB-9 (OUT-12) both inherit.
- **Derivation:** system-generated envelope wrapping quoted learner content

---

## 6. The inventory — Drizzle-defined `infrastructure` and process-local in-memory state

### `LD-S3-14` — Linter validation corpus
- **Where:** `linter_validation_corpus`, `src/infrastructure/db/schema.ts:333`. FK `chunk_id` → `learning_chunks.id` ON DELETE CASCADE.
- **Data class:** corpus metadata referencing learner-visible content, plus a free-text `notes` column
- **Status:** unattributed learner content — it holds no chunk text itself, but `notes` is free text about a specific learner's chunk and the FK reaches one
- **Basis:** legitimate interests — validating the linter's rules
- **Purpose:** hold labelled examples for rule precision/recall measurement
- **Minimization:** proportionate. **The `ON DELETE CASCADE` matters downstream**: deleting a chunk removes its corpus rows automatically, which is a propagation path SUB-9 gets for free and should record as such.
- **Derivation:** agent- or creator-authored labels over learner content

### `LD-S3-15` — Per-rule validation report
- **Where:** `linter_rule_validation_report`, `:364`
- **Data class:** aggregate quality metrics
- **Status:** **not personal data.** Per-rule precision/recall/F1 counts with no learner reference and no FK.
- **Basis:** legitimate interests
- **Purpose:** decide whether a linter rule is blocking-eligible
- **Minimization:** minimal — aggregates only.
- **Derivation:** derived

### `LD-S3-18` … `LD-S3-27` — process-local in-memory structures

All ten are **process-local and non-persisted**: they exist in one server process's memory and are
gone on restart. That does not exempt them — two of them hold an identifier for a natural person.

| Id | Structure | Where | Status | Purpose · minimization |
| --- | --- | --- | --- | --- |
| `LD-S3-18` | MCP transport registry | `src/transport/http.ts:82` | pseudonymous — keyed by MCP transport session id, holds a transport object | Route a request to its live connection. Cleared on session close (`:215`) and at shutdown (`:307`). Minimal. |
| `LD-S3-19` | **Subject-binding map** | `src/transport/http.ts:83` | **learner-identifying** — holds `{ sub, email? }` per session | Reject cross-subject session hijack (`verifySessionBinding`, `:52`–`:72`). **This is the only structure in the whole system that holds an email address.** Deleted with its transport entry (`:216`, `:308`). Minimal for the purpose, and the purpose is a security control. |
| `LD-S3-20` | Rate-limit windows | `src/transport/rate-limit-middleware.ts:58` | **learner-identifying** — keyed on the JWT `sub` | Fixed-window request counting. Holds a count and an expiry, nothing else; swept lazily (`:63`–`:68`). Minimal. |
| `LD-S3-21` | Tier-2 circuit-breaker trip set and stats cache | `src/orchestration/tier2-circuit-breaker.ts:68`, cache at `:69` (60s TTL, `:43`) | **not personal data** — a set of verdict-field names | Stop a misfiring classifier field. Never cleared within a process by design. Minimal. |
| `LD-S3-22` | Request context and correlation id | `src/shared/logger.ts:115`–`:116` (two `AsyncLocalStorage` instances) | pseudonymous — a correlation id and tool name, request-scoped | Correlate log lines across a request. Torn down with the request. Minimal. |
| `LD-S3-23` | Database client singletons | `src/infrastructure/db/client.ts:5`, `src/infrastructure/db/operations.ts:5` | **not personal data** — a pool and a Drizzle handle | Connection reuse. Minimal. |
| `LD-S3-24` | Event-logger sink toggle | `src/shared/logger.ts:214` | **not personal data** | Select the event sink at boot; falls open to stderr. Minimal. |
| `LD-S3-25` | Audit/event transport batch buffers and per-sink breakers | `src/transport/pg-audit-transport.ts:45`, `src/transport/pg-event-transport.ts:41` | **unattributed learner content** — the buffers transiently hold the same payloads `LD-S3-16`/`LD-S3-17` persist, including unredacted `response_body` | Batch inserts. **Unflushed entries are lost on crash or while a breaker is open** — a documented data-loss path, and equally a transient copy of learner free text that exists outside any table. |
| `LD-S3-26` | JWKS remote key set | `src/transport/jwt-middleware.ts:90` | **not personal data** — the IdP's public keys | Verify token signatures. Minimal. |
| `LD-S3-27` | Classifier per-field model cache | `src/adapters/langchain/content-classifier-adapter.ts:47` | **not personal data** — lazily built runnables | Avoid rebuilding a model runnable per call. Minimal. |

**All ten share a basis position:** contract for `LD-S3-18`/`LD-S3-19` (necessary to serve the
authenticated request), legitimate interests for the rest (operating and protecting the service).
`LD-S3-19` and `LD-S3-20` additionally rest on a **security** justification, which is why holding a
`sub` in memory is proportionate where persisting it would need its own argument.

**`LD-S3-25` is the one to carry forward.** It is a copy of the most sensitive log content, living
outside every table, invisible to any SQL-based erasure sweep, and bounded only by flush timing. SUB-9
inherits it as a propagation target that no `DELETE` reaches.

---

## 7. Derived, never persisted (`LD-S3-28` … `LD-S3-30`)

These hold learner data **in transit** and land in no store. They are inventoried because an export
duty (OUT-11) can attach to a value the learner sees even when nothing persists it, and because
omitting them would leave the inventory unable to explain three of C010's categories.

| Id | Category | Where | Status | Note |
| --- | --- | --- | --- | --- |
| `LD-S3-28` | Mastery level | computed on read | unattributed learner content, transient | A judgement about a person that is recomputed rather than stored. Nothing to erase; **something to export**, which is SUB-8's call, not this chapter's. |
| `LD-S3-29` | `LearnerContext` aggregate | `src/orchestration/learner-context-workflows.ts` | unattributed learner content, transient | The whole-system snapshot `init_agent_context` returns — totals, due/overdue splits, recent subjects, flagged weak areas, streak. It is the single richest learner profile the system ever assembles, and it is assembled fresh each time and never stored. |
| `LD-S3-30` | Analytics KPIs and window rollups | analytics services | aggregate, transient | Derived counts over the categories above. |

**No store, no retention bound, no erasure action** — but each is a **disclosure surface**, and
`LD-S3-29` in particular is a profile. Recording that distinction is this chapter's job; acting on it
is OUT-11's.

---

## 8. The copies this package's own activity creates

**A privacy design that exempts its own working copies is not one.** Charter assumption 39 makes this
package's own copies of real learner-derived data a **sixth copy class**, and membership turns on
**derivation, not on a label**.

### `LD-S3-31` — The sixth copy class: C011's captured production evidence

**This is a class with zero known members and terms that exist anyway. The distinction is
load-bearing and this chapter refuses to collapse it.** "Empty membership" and "no such class" are
not the same statement: SUB-9 (OUT-12) has to propagate a data right *through* this class, and a
class that was never inventoried because it happened to be empty on the day it was written is a class
SUB-9 cannot route through.

SUB-1 **set** these terms at position 1, before any consumer existed. This inventory **reads them as
recorded** and sets no term of its own — the flow is forward-only: **SUB-1 records → SUB-3
inventories → SUB-9 propagates.**

| Term | Value, as SUB-1 recorded it |
| --- | --- |
| **Class** | Sixth copy class — C011's own captures of real learner-derived production data |
| **Members at revision 1** | **None.** Zero captures were produced. |
| **Named owner** | The creator, as sole maintainer and sole operator of the production deployment |
| **Retention bound** | Retained only until the decision the capture was taken to settle is published in this package, and in no case longer than the package's own publication |
| **Destruction condition** | On publication of C011 under `docs/research/`, every capture is destroyed at its quarantine path |
| **Redaction discipline** | Payload segment only, never the signature; each claim recorded as a name plus a value or a redaction marker |
| **Quarantine path** | `_local/scratch/` — gitignored, outside `src/`, `tests/` and `drizzle/` |

Source: `01_production-evidence-and-the-access-audit.md` §6. **Membership is empty because SUB-1
executed zero of nine designed spikes** for want of any production credential (`F-S1-2`), not because
the class is inapplicable.

- **Data class:** would be verbatim copies of real learner-derived production data
- **Status:** would be **learner-identifying** — a captured token's decoded claim set is the one
  artifact in this whole program that carries a `sub`
- **Basis (position):** legitimate interests — establishing the platform facts the design rests on,
  bounded by the read-only access constraint
- **Purpose:** settle a named, registered spike question
- **Minimization:** the strongest position in the inventory, and untested. Redaction, a quarantine
  path, a retention bound and a destruction condition are all specified; **none has been exercised
  against a real capture**, which SUB-1 records as the residual in `R8`.
- **Derivation:** copied from production — which is exactly what makes it a member

### `LD-S3-32` — The aggregate result set

Inventoried **for what it is: per-disposition counts and dirty-data pathology probe results, never
rows.**

- **Where:** produced by OUT-2's read-only aggregate step against production (charter assumption 44); does not exist at position 3
- **Data class:** aggregate counts and probe outcomes
- **Status:** **not personal data.** Counts over rows are not the rows. No learner value, and no
  learner-derived value, is carried.
- **Basis (position):** legitimate interests — sizing and de-risking a migration
- **Purpose:** supply real per-disposition counts for SUB-6's migration, and record which dirty-data
  pathologies were probed for
- **Minimization:** minimal by construction — the decision that produced it (aggregate in place, then
  generate synthetically) exists precisely so that no row leaves production
- **Derivation:** derived from production by aggregation

### The recorded exclusion — SUB-6's synthetic dry-run dataset is **not** a member

It is recorded here as an **exclusion with its test and its reason**, so a reader sees that the
candidate was admitted-or-excluded on a stated test rather than silently omitted.

- **Candidate:** OUT-2's *"production-shaped"* dry-run dataset (SUB-6, position 8)
- **The derivation test applied:** *does this artifact contain data derived from real learner rows?*
  Membership of the sixth copy class turns on derivation, never on a label — the earlier reading that
  admitted this dataset did so on the strength of the phrase *"production-shaped"*, which was never a
  statement about its derivation (charter assumption 44, round-3 finding F3.1).
- **Result: excluded.** The dataset is **generated synthetically** from the real schema and read-only
  aggregate counts. No learner row leaves production, so there is no copy for a duty to attach to and
  nothing in it to erase.
- **What this chapter therefore does not do:** it sets **no owner, no retention bound and no
  specification** for that dataset, and it does not audit its contents. It does not exist at position
  3.
- **Who evidences the exclusion: SUB-6, at position 8**, with its generation record and its
  no-copied-rows audit. That evidence is SUB-6's acceptance, not this chapter's.

**No entry in §8 sets a term for an artifact that does not exist, and no entry waits on a term a
later sub-task has yet to record.** `LD-S3-31` reads terms already recorded; `LD-S3-32` describes a
shape fixed by a charter decision; the dry-run dataset is an exclusion, not an entry. The reasoning
and the rejected alternatives are in `DR-C11-S3-3`.

---

## 9. The consent category — a recorded seam, not an entry

**This inventory is enumerated over the categories that exist at this sub-task's own cutoff.** The
versioned consent record OUT-10 designs is a **new learner-data store that does not exist at position
3**, so this chapter neither inventories it nor is owed a later revision to add it.

Recorded, precisely:

1. **The category is created downstream** — by OUT-10, in SUB-8, at position 10.
2. **SUB-8 is the author of its inventory-shaped classification entry.** Not this chapter, and not
   SUB-14 at assembly.
3. **The entry shape SUB-8 must match is published in §1** — the six fields — **plus a seventh**
   that only this category needs: its retention/erasure position after withdrawal (charter
   assumption 50).
4. **The union both later completeness checks read is:** *"every category this inventory marks as the
   learner's, **plus** the consent category SUB-8 creates."* SUB-8's export-completeness check
   (OUT-11) and SUB-9's unowned-copy audit (OUT-12) read that union, **not this inventory alone.**
   Without this the one category whose retention exception is most predictable — a consent record kept
   as proof of consent after withdrawal — would fall outside every completeness check the package runs.

**No revision of this inventory is produced, requested or owed.** The no-back-edge rule stands
untouched: this chapter asserts only what it itself publishes — the entry shape and the seam — and
asserts nothing about SUB-8's entry, which does not exist at position 3. Whether SUB-8's entry in fact
matches the published shape is SUB-8's acceptance at position 10.

---

## 10. The bidirectional cross-check against C010's state inventory

**Target:** `../C010-system-and-repository-architecture/04_state-category-inventory.md`, ids
`SC-S3-1` … `SC-S3-45`.

**Method.** This inventory's tables, columns and in-memory structures were derived **independently**
by a read-only walk at cutoff `86fb38a` (§3, §6); C010's were derived at its own cutoff by its own
walk. Only the *individuation rule* is consumed from C010 rather than re-invented. The two
enumerations were then matched in both directions. That the first thirty correspond one-to-one is a
**result** of the cross-check, not an assumption built into it.

### Direction 1 — C010 → this inventory

| Disposition | Count | Which |
| --- | --- | --- |
| Matched to an entry here | **30** | `SC-S3-1` … `SC-S3-30` ↔ `LD-S3-1` … `LD-S3-30`, in order |
| **Unmatched, explained** | **15** | below |
| **Total** | **45** | |

The fifteen unmatched, each explained rather than dropped:

- **`SC-S3-31` … `SC-S3-41` (11) — required by an upstream package, no store today.** Corpus-neutral
  assessment-evidence record, problem-citation record, cached citation-drift verdict, citation-drift
  verdict store, gate-verdict record, quarantine record, DP-map node and prerequisite-edge records,
  per-learner per-node progression, per-learner mastery-gate state, measurement-contract register, and
  the operational-log derived extract (`PLA-*`). **No store exists at cutoff `86fb38a`**, so there is
  no category holding learner data to classify. Several of them *will* hold learner data when built —
  per-learner progression and per-learner mastery-gate state most obviously — and that is a fact the
  package should carry, but a store that does not exist cannot be given a lawful basis or a retention
  bound here. They are named so a later inventory can pick them up.
- **`SC-S3-42` … `SC-S3-45` (4) — assumed, predicted only by a C010 stand-in assumption.** Tutoring /
  hint interaction state, web-session and UI interaction state, handoff authorization envelope, and
  learner-identity → owner mapping. These are **predictions**, not observed state; C010 records them
  as resting on its own stand-in. Classifying a predicted category would be inventing the surface this
  chapter exists to establish. Two are worth flagging forward: `SC-S3-43` (web-session/UI state) is the
  content of the adopted issue's `web-owned state` copy class, which charter assumption 42 resolves to
  browser-side state or **empty-by-decision under `M-A`**; and `SC-S3-45` (learner-identity → owner
  mapping) is precisely what OUT-8 and OUT-13 are building.

### Direction 2 — this inventory → C010

| Disposition | Count | Which |
| --- | --- | --- |
| Matched to a C010 category | **30** | `LD-S3-1` … `LD-S3-30` |
| **Unmatched, explained** | **2** | `LD-S3-31`, `LD-S3-32` |
| **Total entries** | **32** | |

The two unmatched, explained: **`LD-S3-31`** (the sixth copy class) and **`LD-S3-32`** (the aggregate
result set) have no C010 counterpart because **C010's inventory is over the product's own state,
while these two are copies this research package's activity creates.** That is not a gap in either
document; it is the reason charter assumption 39 exists. An inventory that omitted them could not
support a *"no unowned copy"* audit against the one copy class this package itself produces.

**Separately, and not counted in either direction:** the synthetic dry-run dataset appears as a
**recorded exclusion** (§8), not an entry. Counting an exclusion as an entry in either column would
misstate both totals.

**Arithmetic:** 30 + 15 = 45 ✓ · 30 + 2 = 32 ✓. Both directions reported; every unmatched entry
explained.

### One discrepancy found inside C010, recorded and routed — not resolved here

C010's `../C010-system-and-repository-architecture/04_state-category-inventory.md:70` heads its
inventory *"The inventory — 41 entries, each
appearing exactly once"*, while the same document's own count table at `:528`–`:535` reports
**45** — `existing` 30, `required-by-upstream` 11, `assumed` 4 — with ids running to `SC-S3-45`, and
its subsections 3.1–3.7 sum to 45 (13+2+2+10+3+11+4). Both were read directly at cutoff `86fb38a`.

This cross-check used **45**, the count of record, because it is the one the ids and the subsections
both support. Under this package's constraint a contradiction with C010 is **recorded and routed to
`NEU-895`, never resolved here** — it is `F-S3-4` in `91_findings-register.md`, filed as a recorded
amendment. This chapter takes no position on which number C010 intended.

---

## 11. The completeness method, and its stated falsifier

Completeness is **argued**, not asserted.

**The method — three independent enumerations that must agree.**

1. **Mechanical.** `pgTable(` counted over `src/infrastructure/db/schema.ts` → 10.
   `infrastructureSchema.table(` → 2. `CREATE TABLE ... infrastructure.` over `drizzle/` → 2.
2. **Manual.** `schema.ts` read in full, every `export const` listed with its line, and every column
   enumerated with its type and nullability (§3, §4).
3. **Cross-check.** Reconciled bidirectionally against C010's independently derived inventory (§10).

An entry enters this chapter only if it appears in (1) or (2) **and** is reconciled against (3). The
process-local structures, which no schema mechanically enumerates, rest on (2) and (3) alone — a
weaker footing, stated as such.

**The stated falsifier.**

> This inventory is falsified if any reader can name a store, or a process-local structure, that
> holds — or can hold — learner-derived data at cutoff `86fb38a` and that appears in none of
> `LD-S3-1` … `LD-S3-32`.

**The falsifier fired once during this sub-task's own work, and is recorded rather than smoothed
over.** The independent omission probe surfaced **six** process-local structures beyond the four the
sub-task's scope named parenthetically (transport map, subject-binding map, rate-limit windows,
circuit-breaker set). All six were admitted — `LD-S3-22` … `LD-S3-27` — so the falsifier is discharged
**by admission, not by argument**. It is reported as `F-S3-2` in `91_findings-register.md` with a
named recipient, not absorbed into this prose.

**What the method does not establish.** It ranges over the **declared** schema and the code that
writes it. It cannot establish what a production row actually contains — that is `OI-S1-5` and
`OI-S1-6`, owned and unclosed — and it cannot establish that a store exists in production which the
repository does not declare, which is `OI-S1-4`. `CAP-S3-1` states that limit.

---

## 12. The purpose-limitation review

Every stated purpose in §4–§8 was checked against a **real use in the codebase** at cutoff `86fb38a`.

**Traceable — 31 of 32.** Each resolves to a reader, a writer, or both. Two worth naming because they
were checked rather than assumed:

- **`LD-S3-17` is genuinely read.** `src/adapters/drizzle/tier2-blocking-stats-repository.ts:39`
  issues a grouped query over `infrastructure.operation_event_log`, feeding
  `src/orchestration/tier2-circuit-breaker.ts`. Its operational purpose is supported.
- **`LD-S3-10`'s** evaluation purpose is supported by the snapshot columns being written at grade time
  and never updated (`src/infrastructure/db/schema.ts:217`–`:220`).

**Not traceable — 1 of 32, reported as a minimization finding.**

**`LD-S3-16`'s `response_body`.** Its stated purpose is diagnostic — `src/shared/logger.ts:35`–`:36`,
*"useful diagnostic data"*. A search of the whole repository finds **no read path for that column
anywhere**. Every occurrence is on the write side: captured at
`src/transport/audit-middleware.ts:88`, assigned unredacted at `:109`, carried through
`src/transport/pg-audit-transport.ts:112` and inserted at `:117`. Nothing in `src/` selects it. The
only statement that reads `mcp_request_log` at all is `scripts/retention-cleanup.sql`, which
**deletes**; and `scripts/lint-corpus-seed.ts:18` names a hand-labelling pass against the table as a
*"deferred follow-up"*, i.e. not implemented.

So the most sensitive field in the inventory — whole, unredacted learner free text — is retained for a
purpose that **no code path in the repository consumes**. That is a purpose-limitation and data-
minimization failure on its face, and it is **reported as `F-S3-1` with a named recipient**, not
reconciled in this prose.

**Two honest bounds on that finding.** It is a statement about the **repository at this cutoff**, not
about production: an operator querying the table by hand is a use this method cannot see, and whether
production rows contain learner text at all is `OI-S1-5`. Both are stated in the finding itself.

---

## 13. Source-change confirmation

`git diff --name-only origin/develop` for this branch lists files **only** under
`docs/research/C011-safe-production-integration-and-learner-isolation/` and one appended row block in
`docs/GLOSSARY.md`.

**Zero files changed under `src/`. Zero under `drizzle/`.** This chapter reads both extensively and
edits neither; the charter forbids a source change and this sub-task is research and design.

---

## 14. Ids allocated by this sub-task

- **Inventory categories:** `LD-S3-1` … `LD-S3-32` (this chapter). A new id family; `LD` is
  *learner data*, and `S3` is the sub-task number as everywhere else in this package.
- **Findings:** `F-S3-1` … `F-S3-4` (`91_findings-register.md`).
- **Risks:** **`R10`** and **`R12`** (`92_risk-register.md`) — the two charter § Risks rows naming
  OUT-9 as their owning outcome, by their **position in the charter's own table**.
- **Open items:** `OI-S3-1` (`93_open-items-and-provisional-register.md`) — one item, one question.
- **Caps:** `CAP-S3-1` (`94_caps-and-incomplete-scope.md`).
- **Stand-ins:** **`A-36`** (`95_stand-in-assumption-register.md`) — the stand-in for **charter
  assumption 36**, which is `OI-S5-1`'s reading. The number is 36 because `A-<n>` continues the
  charter's own assumption numbering, not because it follows `A-34`.
- **Outcomes:** OUT-9's row (`90_outcome-register.md`).
- **Completeness-gate rows:** `G-16` … `G-25` (`97_package-completeness-gate.md`), SUB-3's own only.
- **Decision records:** `DR-C11-S3-1`, `DR-C11-S3-2`, `DR-C11-S3-3`.
- **Spikes:** **none.** This chapter needed no production observation; where it would have, it cites
  SUB-1's `SPK-S1-*` and the matching `OI-S1-*` rather than designing a duplicate.
- **Document numbers:** `03_` only.

**Every id above was computed from the charter and this package's published conventions alone**, so
that sub-tasks running concurrently cannot collide with them.

---

## 15. What this chapter does not establish

- **It establishes nothing about production.** Every claim is derived from the declared schema and
  the code that writes it, at a stated cutoff. No count of real rows, no sample of real content.
- It does not decide what consent covers, what export contains, or what erasure does per category
  (SUB-8, OUT-10/OUT-11), and it sets **no retention bound** for any category except by reporting the
  ones the codebase already implements or lacks.
- It does not assign a propagation action to any copy class (SUB-9, OUT-12) — including to
  `LD-S3-31`, whose terms it reads and does not extend.
- It does not determine whether a logged request is attributable to a learner (SUB-16, OUT-15). It
  supplies both readings and the condition; it selects neither.
- It does not decide whether `NEU-850`'s *"every core table"* covers the two port-less log tables
  (`OI-S5-1`, owner `NEU-850`). It states the reading it assumed, as `A-36`.
- It makes **no legal determination**: not controller/processor role, not lawful-basis selection, not
  cross-border transfer. The first two are `OI-S3-1`; the third is SUB-8's own separate open item at
  position 10, and is deliberately not raised here.
- It does not audit SUB-6's dry-run dataset, and sets no term for it. It records the **exclusion** and
  names SUB-6 as the party that evidences it.
- It asserts nothing about band placement or cross-register consistency (SUB-14), or about the
  package's audit set (SUB-17).
