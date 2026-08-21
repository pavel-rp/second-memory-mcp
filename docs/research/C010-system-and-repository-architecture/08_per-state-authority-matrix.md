# 08 — The per-state authority matrix, with a mechanical exactly-one-authority audit

**Sub-task:** SUB-13 (NEU-977)
**Charter:** C010 — system and repository architecture
**Discharges:** `OUT-3` in full; `OUT-9`'s second half (the drift-verdict store's place in the authority matrix)
**Revision:** **pre-validation** — see §2
**Model:** claude-opus-5[1m]

---

## 1. What this chapter is, and what it is not

SUB-6 (`07_…md`) selected an ownership model and published an assignment rule. A selected model is not
yet an assignment: it says *how* to decide, not *what was decided*. This chapter performs the decision.
It takes SUB-3's inventory of **45** state categories (`04_…md` §3), applies SUB-6's rule to each one,
and records for every category **exactly one authority** — the single component permitted to write it —
together with the nine attributes `OUT-3` requires.

The point of the exercise is narrow and specific. Charter C010's Critical risk is that two downstream
implementation charters each write the same state category from a different component, discover the
collision in production, and have no document to appeal to. A matrix in which every category resolves to
one named component id is the appeal document.

**What this chapter is not:**

- **It is not a re-opening of SUB-6's model.** `M-A` was selected; that selection is an input here, not a
  question. Where SUB-6's rule under-determines a row, this chapter still records **one** authority — by
  the rule's own tie-breaks — and files a finding routed back to SUB-6. It never patches the rule locally.
- **It is not a schema, a migration or a DDL proposal.** The *migration path* attribute names a path, not
  a statement. The store topology is SUB-10's.
- **It is not a validation of itself.** SUB-14 (NEU-978) validates this matrix against the isolation
  invariant, the scenario walks and SUB-4's flows. See §2.
- **It does not assert a learner-scoping fact.** `04_…md` §6 searched `schema.ts` for `user_id`,
  `userId`, `learner_id` and `learnerId` and found **zero matches**: no ownership column exists on any of
  the twelve Drizzle tables or either raw-SQL log table. NEU-850's `OUT-2` is a decision to honour, never
  an existing fact. No row below describes an ownership column as present. The `Learner-scoped` value is
  carried forward from `04_…md` unchanged, as the **question** that document recorded.

---

## 2. Revision marker — read this before consuming the matrix

This is the **pre-validation revision** of the authority matrix. It is the output of applying SUB-6's
rule; it has not yet been checked against anything.

| Stage | Sub-task | What it does to this chapter |
| --- | --- | --- |
| **Published here** | SUB-13 (NEU-977) | The assignment. **This revision.** |
| Validated | SUB-14 (NEU-978) | Applies the isolation invariant, walks the scenarios, cross-checks SUB-4's flows, re-runs both audits. Produces findings against this revision. |
| Superseded | SUB-16 | Dispositions SUB-14's findings and republishes. **That is the post-absorption revision.** |

**SUB-7, SUB-8 and SUB-10 must resolve against SUB-16's revision, not this one.** A resource inventory,
an interface contract or a store topology built on this revision is built on an unvalidated assignment.
SUB-14 is the only sub-task that should be reading this document as its primary input.

Consuming this revision early is not forbidden — it is the only assignment that exists — but a consumer
that does so owes itself a re-check when SUB-16 lands.

---

## 3. Vocabulary, disambiguated at first use

- **Authority.** The single component permitted to *write* a state category. Not the only component that
  may read it; not the component that happens to hold the bytes. Authority is about who may change the
  value, because that is the property the Critical risk turns on.
- **Component ids.** Every authority in this chapter is a **`CMP-S4-*` id** from `05_…md` §3 — never a
  role name, never a zone alone, never a layer. `05_…md`'s own merge was gated on exactly this defect
  (`BND-S4-4` originally carried a role-shaped owner), and the same discipline applies here.
- **Write path.** Several rows record an authority together with a *written through* annotation — for
  example "`CMP-S4-9`, written through `CMP-S4-7`". This is SUB-6's own demonstration form (`07_…md`
  §6.2). **The authority is always the single leading component id.** The annotation names the component
  through which the write is issued; it is never a second authority, and the exactly-one audit does not
  count it.
- **Session.** Throughout this chapter, a **learning run** — the bounded `public.learning_sessions`
  record of `SC-S3-5`. It never means an HTTP session or an authentication session. Where a
  transport-level or authentication-level concept is meant, the component id is named instead.
- **`n/a — non-durable`.** Recorded in the *writes* attribute of a clause-1 row. It means the category
  has no durable write to attribute, **not** that the row has no authority: clause 1 names one
  explicitly. See §5, clause 1, and §10's scope note.

---

## 4. The row domain — 45 categories, fixed

The rows below are exactly `04_…md` §3's entries, `SC-S3-1` … `SC-S3-45`. The domain was re-verified
mechanically against the merged artifact at authoring time: extracting every `SC-S3-<n>` token from
`04_…md` and filtering to the numeric form yields **45 distinct ids, minimum 1, maximum 45, no gaps**.
`04_…md` §8's own counts table agrees: 30 `existing`, 11 `required-by-upstream`, 4 `assumed`.

`04_…md` §3's heading reads "41 entries". **That heading is stale and is already filed as `F-S4-2`** by
SUB-4; it is cited here, not re-filed. The body of §3 carries 45 entries and §8 counts 45. The charter
and the tracker size this work at "roughly 25–30 state categories" and "250–300 authored cells"; the
merged inventory publishes 45, so this chapter authors **45 rows × 10 cells = 450 cells**. The inventory
is not trimmed to fit the estimate — see `F-S13-4`.

Nothing in this chapter adds a category, removes one, merges two or splits one. A category this chapter
believes is missing or wrongly split would be a finding routed to SUB-3, not an edit here.

---

## 5. The assignment rule, restated

Reproduced from `07_…md` §6.1 for reference. **It is ordered, and the first match wins.** Every row below
cites the number of the clause that produced it.

1. **Non-durable.** If the row's persistence cell is `derived-on-read` or process-local, authority is
   **the component whose process computes it**, taken from the row's own store/producer cell. The row is
   recorded `n/a — non-durable` in its *writes* cell and is out of the exactly-one-authority audit's
   **write** scope. A cell reading `to be defined` is *not* `derived-on-read`; it falls through.
2. **Gate-bearing.** If the row's value can change a serve or authoring verdict — established by a
   `05_…md` lookup (§6 below) — authority is **the MCP core, caller-side per `BND-S4-4`**: `CMP-S4-7` on
   the request path, `CMP-S4-14` on the authoring path. The web tier never holds gate authority.
   **No later clause may override clause 2.**
3. **Enumerated presentation exception.** Web tier `CMP-S4-3`, only for a row on the closed list in
   `07_…md` §6.3, and only when **all four** hold: (i) clause 2 did not match; (ii) classification is
   `assumed` and the stand-in is `A-27`; (iii) the value cannot change a schedule, a mastery record, an
   assessment-evidence record or a serve verdict; (iv) the store cell is `none`.
4. **Identity mapping.** A `SC-S3-45`-class row is authored in `Z-IDP` and *projected*, never authored,
   by every other zone.
5. **In the isolation invariant's domain.** If `Learner-scoped` is `yes` **or** `question — open`,
   authority is the **MCP core's persistence adapters (`CMP-S4-9`), written through `CMP-S4-7`**. An
   unanswered scoping question does not create an exception; **only an explicit `no` leaves the domain.**
6. **Default.** MCP core (`CMP-S4-7`).

**Tie-breaks**, applied only when two components both plausibly own a row: (a) in the invariant's domain
→ core wins; (b) out of domain but read on a gate path → core wins; (c) neither → the component that
**produces** the row wins; (d) two components both produce it → **not a tie, a defect in the inventory**,
routed back as a finding against `04_…md`. Authority is never split.

**Clause 3 cannot match anywhere in this chapter.** `07_…md` §6.3's enumerated list is **empty** under the
selected model `M-A`. SUB-6 retained the empty list rather than deleting it, so that a reversal to `M-C`
would change only its contents — the single row `SC-S3-43` — and never the rule's structure. The
consequence for this matrix is that a row may satisfy all four of clause 3's tests on the merits and
still not take the exception, because it is not on the list. `SC-S3-43` is exactly that row; see its
entry in §8.7.

---

## 6. How clause 2's lookup was executed

Clause 2 is the one clause whose test is not readable off the row's own cells — it asks whether the value
"can change a serve or authoring verdict", and delegates the answer to a `05_…md` lookup. Left
unspecified, that is a judgement call, and a judgement call is exactly what this matrix is supposed to
eliminate. So the lookup is written out here, and SUB-14 can re-run it.

**The test is a by-id membership check against `05_…md`** — the same form SUB-6 used in its own
`SC-S3-3` demonstration ("no `05_…md` lookup places SM-2 scheduling fields in `CMP-S4-14`/`CMP-S4-15`'s
read set"). The places `05_…md` names state categories by `SC-S3-*` id are: §3.2's "Demanded by" column,
§5's flow table, §7.3's quarantine disposition, and §8's two placement sub-sections. Reading those:

| Source in `05_…md` | Ids it places in a gate component's read set |
| --- | --- |
| `CMP-S4-14`'s (quality-gate battery) "Demanded by" | `SC-S3-35`, `SC-S3-36` |
| `CMP-S4-15`'s (authoring-time gate runner) "Demanded by" | none of its own |
| §7.3, the quarantine disposition | `SC-S3-33` |

**Clause 2 therefore matches exactly three rows: `SC-S3-33`, `SC-S3-35` and `SC-S3-36`.**

Two boundary readings are recorded so the test is reproducible rather than re-derived:

- **Indirect consumption is not membership.** `SC-S3-17` (the operation event log) is read by the Tier-2
  circuit breaker, whose trip state can suppress a Tier-2 gate — but `05_…md` places `SC-S3-21`, not
  `SC-S3-17`, in that path, and never lists `SC-S3-17` in a gate component's read set. Treating it as
  gate-bearing would be a fresh judgement call layered on top of the rule. It falls through to clause 5.
- **A row that a gate *writes* is not thereby gate-bearing under clause 2.** `SC-S3-4`, the content-audit
  verdict, is written by the audit pipeline; clause 2 asks what a gate *reads* to reach a verdict, and
  `05_…md` does not place `SC-S3-4` in either gate component's read set. It falls through to clause 6.
  Its authority nonetheless resolves to core, so the reading is not load-bearing for the answer.

---

## 7. How to read a row

Each category below is one `####` block. The block's second line carries the three facts the audits run
against — **authority**, **clause**, **status** — followed by a table of `OUT-3`'s nine attributes.

| Attribute | What it records |
| --- | --- |
| **Reads** | Which components read the category. Reading is unrestricted; only writing is exclusive. |
| **Writes** | The authority's write, and the path it is issued through. `n/a — non-durable` for clause-1 rows. |
| **Consistency** | What must hold at the moment a write commits. |
| **Freshness** | How stale a read may be before the value is wrong for its purpose. |
| **Concurrency** | What happens when two writes race. |
| **Conflict handling** | What happens when two writes disagree. |
| **Recovery** | What happens after a crash, a failed write, or a lost value. |
| **Migration path** | How the category gets from where it is today to where the model puts it. **A path, never DDL.** |
| **Observability** | How an operator can tell the category is healthy, and what is missing. |

A cell that cannot be answered from merged inputs says so and cites the finding or open item that owns
the gap. It is never left blank and never guessed.

---

## 8. The matrix

### 8.1 Existing, persisted — `public` database schema

#### `SC-S3-1` — Topic record

**Authority: `CMP-S4-9`** (persistence adapters and Postgres), written through `CMP-S4-7`.
**Clause 5** — `Learner-scoped: question — open`, which is inside the invariant's domain. Status: `existing`.

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-7` (orchestration workflows) on the serve and authoring paths; `CMP-S4-16` when serving content; `CMP-S4-13` when admitting new content. |
| Writes | `CMP-S4-9`, issued through `CMP-S4-7`. The authoring path (`CMP-S4-13`) originates the create and the summary update; it does not write the store directly — `05_…md` names `CMP-S4-9` the only writer of the `public` schema on the request path. |
| Consistency | The topic row and its summary-version pair (`summaryVersion`, `summaryUpdatedAt`) commit together; a summary is never visible without the version that identifies it. |
| Freshness | Read-your-writes within a learning run. No cross-run staleness bound is required: a topic summary is authored content, not a scheduling input. |
| Concurrency | Two concurrent summary updates are last-writer-wins on the row; `summaryVersion` makes the loss detectable after the fact. |
| Conflict handling | No merge. A losing update is re-applied by re-running the authoring step; nothing is reconciled field-by-field. |
| Recovery | Durable in Postgres; recovered with the database. `04_…md` records **no delete path in the repository**, so a lost-topic scenario has no in-system remediation other than re-authoring. |
| Migration path | None required. The category is already in the store the model places it in, under the authority the model assigns. |
| Observability | Writes appear in `SC-S3-16` (per-request) and `SC-S3-17` (per-operation). `summaryUpdatedAt` gives a per-row recency signal without a separate metric. |

#### `SC-S3-2` — Chunk content record

**Authority: `CMP-S4-9`**, written through `CMP-S4-7`; originated by `CMP-S4-13`.
**Clause 5** — `Learner-scoped: question — open`. Status: `existing`.

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-16` (content serve path) on every teach step; `CMP-S4-14` on the authoring path when gating content; `CMP-S4-7` throughout. |
| Writes | `CMP-S4-9`, issued through `CMP-S4-7`. `CMP-S4-13` is the only component that may *originate* an admission — `05_…md` `BND-S4-15` — but the store write is the authority's. |
| Consistency | Content, `contentVersion` and `contentUpdatedAt` commit together, and the embedding index (`schema.ts:85`–`:88`) is updated in the same unit of work as the content it indexes. A chunk whose embedding describes a superseded body is a defect, not a tolerated state. |
| Freshness | Serve-path reads must see the current committed version; there is no read-through cache between `CMP-S4-16` and the store, so this holds by construction. |
| Concurrency | Last-writer-wins per row. Two editors of the same chunk is not a modelled scenario at this cutoff — content editing is a single-authoring-pipeline activity. |
| Conflict handling | No merge. `contentVersion` identifies which body a downstream artifact (embedding, gate verdict, assessment evidence) was computed against. |
| Recovery | Durable; recovered with the database. Deleted with its topic, so a topic-level restore restores its chunks. |
| Migration path | None required. |
| Observability | `contentUpdatedAt` per row; admission events in `SC-S3-17`. |

#### `SC-S3-3` — Per-chunk SM-2 scheduling state

**Authority: `CMP-S4-9`**, written through `CMP-S4-7`.
**Clause 5** — `Learner-scoped: question — open`. Status: `existing`. This is SUB-6's own worked
demonstration (`07_…md` §6.2): clauses 1–4 do not match, clause 5 does.

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-7` when selecting what to teach or review; `CMP-S4-8` (domain core) as the scheduler's input; `CMP-S4-7` again when deriving `SC-S3-28` and `SC-S3-29`. |
| Writes | `CMP-S4-9`, issued through `CMP-S4-7`. `04_…md` records the group as **mutated only by the scheduler**, on each scored attempt — no other write path exists or may be added. |
| Consistency | The six fields (`nextReviewAt`, `easeFactor`, `repetitions`, `consecutiveFailures`, `lastReviewedAt`, `intervalDays`) commit as one group, in the same transaction as the attempt (`SC-S3-9`) and the snapshot (`SC-S3-10`) that justify them. A scheduling state that does not correspond to a recorded attempt is unreconstructible. |
| Freshness | Strictly current at read. This is the one category where a stale read changes what the learner is asked next, so no caching layer may be introduced between the store and the scheduler. |
| Concurrency | Two scored attempts against the same chunk must serialize. Concurrent application of two SM-2 updates to one row silently loses one interval advance — the loss is invisible afterwards because the state is a running aggregate, not a log. |
| Conflict handling | No merge is meaningful: SM-2 is order-dependent. The transaction boundary is the whole answer, not the field. |
| Recovery | Durable. Reconstructible in principle by replaying `SC-S3-9` + `SC-S3-10` in order — the NEU-844 snapshot quad exists precisely so the scheduler's inputs at each step are recoverable. |
| Migration path | None required. |
| Observability | `lastReviewedAt` per row. `SC-S3-10` gives per-attempt predicted-vs-actual, which is the only signal that would reveal a scheduler regression. |

#### `SC-S3-4` — Content-audit verdict

**Authority: `CMP-S4-7`** (orchestration workflows), written to the store by `CMP-S4-9`; produced by `CMP-S4-14`.
**Clause 6** — `Learner-scoped: no` leaves the invariant's domain (clause 5), and §6's lookup does not
place this row in a gate component's *read* set (clause 2). Status: `existing`.

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-14` on re-audit, to compare against the previous verdict; `CMP-S4-7` when reporting audit state; operators. |
| Writes | `CMP-S4-7`, issued to `CMP-S4-9`. Produced by the audit pipeline (`src/orchestration/audit-pipeline.ts:48`) and **overwritten on re-audit** — the column holds the current verdict, not a history. |
| Consistency | The verdict must identify the `contentVersion` of `SC-S3-2` it was computed against; a verdict that cannot name its input is not evidence about anything. |
| Freshness | A verdict is valid only for the content version it names. A content edit invalidates it immediately; a stale verdict against an edited chunk is a defect. |
| Concurrency | Two concurrent audits of one chunk are last-writer-wins. Both would be computing against the same content version, so the outcome is benign unless the content changed between them. |
| Conflict handling | No merge — the whole jsonb report is replaced. |
| Recovery | Durable; recovered with the database. Fully recomputable by re-running the audit, so loss is recoverable at cost, not fatal. |
| Migration path | None required. |
| Observability | Audit runs appear in `SC-S3-17`. The absence of a verdict history means a regression in gate strictness is not visible from this column alone. |

#### `SC-S3-5` — Learning-session record

**Authority: `CMP-S4-9`**, written through `CMP-S4-7`.
**Clause 5** — `Learner-scoped: question — open`. Status: `existing`. *Session* here is a **learning run**.

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-7` for run lifecycle; `CMP-S4-7` again when assembling `SC-S3-29`; analytics via `CMP-S4-8`. |
| Writes | `CMP-S4-9`, issued through `CMP-S4-7`: created at run start, `status` and `endTime` mutated, terminal on completion. |
| Consistency | A run's terminal transition commits with the last state change it covers. A run marked complete whose child `SC-S3-6` rows are still in progress is an inconsistent state. |
| Freshness | Read-your-writes within the run. Nothing outside the run requires sub-second visibility. |
| Concurrency | One run has one writer in practice — the request path serving it. Two concurrent terminal transitions are last-writer-wins and benign (both write the same terminal status). |
| Conflict handling | No merge. Status is a small state machine; an illegal transition is rejected, not reconciled. |
| Recovery | Durable. A crash mid-run leaves a non-terminal run; there is **no reaper** in the inventory, so such runs persist until a later write closes them. |
| Migration path | None required. |
| Observability | `status` + `endTime` are the run-level signal. Non-terminal runs older than a session window are the observable symptom of the missing reaper. |

#### `SC-S3-6` — Session-chunk teaching state

**Authority: `CMP-S4-9`**, written through `CMP-S4-7`.
**Clause 5** — `Learner-scoped: question — open`. Status: `existing`.

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-7` while the run proceeds; `CMP-S4-16` to decide what to present next; analytics. |
| Writes | `CMP-S4-9`, issued through `CMP-S4-7`: created when the run covers the chunk, mutated as teaching proceeds (`status`, teaching approach, time spent), ends with the run. |
| Consistency | Bound to its parent run (`SC-S3-5`) and chunk (`SC-S3-2`); neither reference may dangle. |
| Freshness | Read-your-writes within the run. |
| Concurrency | Single-writer per run in practice. Concurrent time-spent accumulation from two in-flight tool calls would lose one increment. |
| Conflict handling | No merge; last write wins on the row. |
| Recovery | Durable; ends with the run. A crash leaves the row at its last committed state, which is a correct partial record. |
| Migration path | None required. |
| Observability | Per-row status; run-level roll-up via `SC-S3-30`. |

#### `SC-S3-7` — Session question

**Authority: `CMP-S4-9`**, written through `CMP-S4-7`.
**Clause 5** — `Learner-scoped: question — open`. Status: `existing`.

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-7` when posing and grading; `CMP-S4-16` when presenting. |
| Writes | `CMP-S4-9`, issued through `CMP-S4-7`: created when posed, `status` mutated, ends with the run. |
| Consistency | Commits with its `SC-S3-8` mapping rows — a question that assesses nothing is not gradeable, so the mapping is part of the same unit of work. |
| Freshness | Strictly current within the run: a question's status governs whether it may be answered. |
| Concurrency | One question has one answering path. A double-submit must be idempotent at the status transition, not additive. |
| Conflict handling | No merge; the status state machine rejects illegal transitions. |
| Recovery | Durable; ends with the run. |
| Migration path | None required. |
| Observability | Per-row status; attempt records in `SC-S3-9` are the downstream evidence. |

#### `SC-S3-8` — Question→chunk assessment mapping

**Authority: `CMP-S4-7`**, written to the store by `CMP-S4-9`.
**Clause 6** — `Learner-scoped: no`; not in a gate read set. Status: `existing`.

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-7` when attributing a grade to the chunks a question assessed; `CMP-S4-8` when the scheduler applies that attribution. |
| Writes | `CMP-S4-7`, issued to `CMP-S4-9`. Created with the question and **never mutated** — `04_…md` records no update path. |
| Consistency | Written in the same transaction as `SC-S3-7`. Immutability is the invariant: a mapping that changed after grading would retroactively re-attribute a scheduling decision. |
| Freshness | Not applicable — immutable once written. |
| Concurrency | Single write, at creation. No race exists. |
| Conflict handling | None possible; there is no second write. |
| Recovery | Durable; ends with the question. |
| Migration path | None required. |
| Observability | Absence of a mapping for a graded question is the only failure mode, and is detectable by join. |

#### `SC-S3-9` — Attempt and grade record

**Authority: `CMP-S4-9`**, written through `CMP-S4-7`.
**Clause 5** — `Learner-scoped: question — open`. Status: `existing`.

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-7` when grading and when deriving `SC-S3-29`; `CMP-S4-8` as scheduler input; analytics via `SC-S3-30`. |
| Writes | `CMP-S4-9`, issued through `CMP-S4-7`. Created on answer and **mutated in place by `revise_grade`** (`src/adapters/drizzle/session-question-repository.ts:194`–`:223`). |
| Consistency | A revision commits atomically with the `SC-S3-11` audit row that preserves the pre-revision values, and with the `SC-S3-3` scheduling update it causes. A revised grade whose audit row is missing is an unreconstructible history. |
| Freshness | Strictly current — the grade is the scheduler's input. |
| Concurrency | A revision and a fresh attempt against the same question must serialize; the revision reads the row it rewrites. |
| Conflict handling | No merge. The revision replaces the graded fields wholesale and preserves the prior values in `SC-S3-11`. |
| Recovery | Durable. The `SC-S3-11` trail makes any revision reversible in principle; the original attempt values are never lost. |
| Migration path | None required. |
| Observability | The `SC-S3-11` trail is the audit signal. `SC-S3-10` records what the scheduler predicted at answer time, which survives the revision unchanged. |

#### `SC-S3-10` — Pre-review scheduling snapshot (the NEU-844 quad)

**Authority: `CMP-S4-9`**, written through `CMP-S4-7`.
**Clause 5** — `Learner-scoped: question — open`. Status: `existing`.

| Attribute | Value |
| --- | --- |
| Reads | Analytics and scheduler-calibration work; `CMP-S4-8` when comparing predicted against actual. Not read on the serve path. |
| Writes | `CMP-S4-9`, issued through `CMP-S4-7`. **Write-once at answer time, never revised** — explicitly including the case where `revise_grade` mutates the surrounding `SC-S3-9` row. |
| Consistency | Written in the same transaction as the attempt it describes. The four fields (`snapshot_band`, `snapshot_predicted_recall`, `snapshot_interval_days`, `snapshot_days_overdue`) commit as one group. |
| Freshness | Not applicable — the value is a historical record of a prediction, and is correct forever by construction. |
| Concurrency | Single write. No race. |
| Conflict handling | None possible. The write-once property is the whole point: a revised snapshot would destroy the evidence that the scheduler's prediction was wrong. |
| Recovery | Durable. Not recomputable — the scheduler state that produced it has since advanced. Loss is permanent. |
| Migration path | None required. |
| Observability | This category *is* the observability substrate for `SC-S3-3`. Nothing observes it in turn. |

#### `SC-S3-11` — Grade-revision audit trail

**Authority: `CMP-S4-9`**, written through `CMP-S4-7`.
**Clause 5** — `Learner-scoped: question — open`. Status: `existing`.

| Attribute | Value |
| --- | --- |
| Reads | Operators and audit review; `CMP-S4-7` when reporting revision history. |
| Writes | `CMP-S4-9`, issued through `CMP-S4-7`. **Appended inside the revision transaction, never mutated.** |
| Consistency | Append and revision commit together or neither commits. This is the strongest consistency requirement in the `public` schema, because the trail's only value is that it cannot be absent when a revision happened. |
| Freshness | Not applicable — append-only history. |
| Concurrency | Appends do not conflict. |
| Conflict handling | None possible; there is no update path. |
| Recovery | Durable. Not recomputable — the pre-revision values exist nowhere else once `SC-S3-9` is rewritten. |
| Migration path | None required. |
| Observability | The trail is itself an observability artifact. A revision without a trail row is the failure mode, detectable by join against `SC-S3-9`'s revised rows. |

#### `SC-S3-12` — Notes

**Authority: `CMP-S4-9`**, written through `CMP-S4-7`.
**Clause 5** — `Learner-scoped: question — open`. Status: `existing`.

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-7` when serving a chunk, topic or run with its annotations. |
| Writes | `CMP-S4-9`, issued through `CMP-S4-7`. Created, **never updated in place** (no `updatedAt`; `schema.ts:287` comment; no update path in `src/adapters/drizzle/notes-repository.ts`), deleted and re-added instead. |
| Consistency | The referenced chunk, topic or run must exist at write time. |
| Freshness | Read-your-writes. A note is a learner-facing artifact with no downstream consumer that could be misled by staleness. |
| Concurrency | Creates do not conflict. A delete-and-re-add pair from two callers can interleave into a lost note; there is no compare-and-set. |
| Conflict handling | None. The delete-and-re-add idiom means the last add wins and the intermediate content is simply gone. |
| Recovery | Durable; deleted with its referent. |
| Migration path | None required. |
| Observability | None specific. Note churn is visible only in `SC-S3-16`. |

#### `SC-S3-13` — Context tokens

**Authority: `CMP-S4-9`**, written through `CMP-S4-7`; the gate they enforce is applied at `CMP-S4-4`.
**Clause 5** — `Learner-scoped: question — open`, and `04_…md` records explicitly that the table carries
**no authenticated subject**. Status: `existing`. Volatility `TTL`.

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-4`/`CMP-S4-6` on every non-bootstrap MCP tool call, to admit or reject the call. |
| Writes | `CMP-S4-9`, issued through `CMP-S4-7`. Minted at bootstrap, **never mutated**, expires by `expiresAt` and is swept by the repository. |
| Consistency | A token is valid from commit; there is no window in which a minted token is unusable. Expiry is evaluated against `expiresAt` at read, so the sweep is reclamation, not enforcement. |
| Freshness | Strictly current: a token read after its expiry must be rejected even if the sweep has not run. |
| Concurrency | Mint and sweep do not conflict — the sweep only removes rows already past `expiresAt`. |
| Conflict handling | None; no update path. |
| Recovery | Durable, but disposable: a lost token set forces re-bootstrap, which is a recoverable inconvenience, not data loss. |
| Migration path | None required for the store. **The absence of an authenticated subject is a design gap this matrix does not close** — the row is inside the invariant's domain by clause 5, but the table has nothing to scope *by* until NEU-893 lands (`A-28`). |
| Observability | Sweep activity and admission failures appear in `SC-S3-16`. There is no signal distinguishing "expired" from "never existed". |

### 8.2 Existing, persisted — `infrastructure` schema, Drizzle-defined

#### `SC-S3-14` — Linter validation corpus

**Authority: `CMP-S4-7`**, written to the store by `CMP-S4-9`.
**Clause 6** — `Learner-scoped: no`; §6's lookup does not place it in a gate component's read set (it is
an input to *validating* a rule, not to running one). Status: `existing`.

| Attribute | Value |
| --- | --- |
| Reads | The Tier-1b rule-validation process, on the authoring side of `CMP-S4-14`; maintainers. |
| Writes | `CMP-S4-7`, issued to `CMP-S4-9`. Curated by the maintainer, mutated by re-labelling, durable. |
| Consistency | The split assignment and the expected verdict commit together; a corpus item whose split is unknown cannot be scored. |
| Freshness | No bound. The corpus is a slowly-curated asset, not a runtime input. |
| Concurrency | Maintainer-serial in practice. Two re-labellings of one item are last-writer-wins. |
| Conflict handling | No merge; the label is replaced. |
| Recovery | Durable. **Not recomputable** — the labels are human judgement, so loss requires re-labelling from scratch. |
| Migration path | None required. |
| Observability | `SC-S3-15` is the downstream signal: a corpus change shows up as a shift in the next validation report. |

#### `SC-S3-15` — Per-rule validation report

**Authority: `CMP-S4-7`**, written to the store by `CMP-S4-9`.
**Clause 6** — `Learner-scoped: no`; not in a gate read set. The report *supports* a
blocking-eligibility decision but is not consulted by `CMP-S4-14` when running a gate. Status: `existing`.

| Attribute | Value |
| --- | --- |
| Reads | Maintainers deciding whether a rule may block; rule-promotion review. |
| Writes | `CMP-S4-7`, issued to `CMP-S4-9`. Written per validation run, superseded by the next run. |
| Consistency | Held-out and adversarial precision/recall commit together with the rule identity and the corpus version they were measured against. A metric that cannot name its corpus is not evidence. |
| Freshness | Valid until the rule or the corpus changes. Either change invalidates the report. |
| Concurrency | One validation run at a time in practice; concurrent runs are last-writer-wins. |
| Conflict handling | No merge; the report row is superseded wholesale. |
| Recovery | Durable and fully recomputable by re-running validation against the corpus. |
| Migration path | None required. |
| Observability | The report is itself the observability artifact for gate strictness. |

### 8.3 Existing, persisted — `infrastructure`, raw-SQL only

Both rows below are written from a pino transport worker thread through hand-built parameterized
`INSERT` strings. **Neither has a Drizzle schema object and neither is reached through a repository
port** — which is exactly why a port-keyed inventory would have omitted both (`DR-C10-S3-1`).

Both carry the same structural gap, and it is important to state precisely what this matrix does and does
not do about it. **Deletion ownership is not write authority.** `CAP-S4-1` records that *no component in
`05_…md`'s inventory can be named the deletion owner* for either table, and that the obstruction is
**structural**: neither table has a principal field, so there is no one to delete *for*. That cap is
cited here and **stays open** — this chapter does not close it, and could not. What this chapter does is
narrower and still worth doing: it names the single component permitted to **write** each table, which is
a different question and one the rule answers cleanly.

#### `SC-S3-16` — MCP request log

**Authority: `CMP-S4-9`**, written through `CMP-S4-19` (operational logging sinks).
**Clause 5** — `Learner-scoped: question — open`. `04_…md` records that the table **holds learner
payload** (`response_body` and `params` carry learner-facing text and learner free-text answers) while
carrying **no principal field**, which is precisely why the scoping question is open rather than `no`.
Status: `existing`.

| Attribute | Value |
| --- | --- |
| Reads | Operators, for incident investigation. No component reads it on the request path. |
| Writes | `CMP-S4-9`, issued through `CMP-S4-19` — the sink batches and flushes; the store write is the persistence authority's. Appended per request, never mutated. |
| Consistency | Best-effort by design. `CMP-S4-19` fails open: an unavailable log sink must never fail a learner's request. A missing log line is acceptable; a failed request because of logging is not. |
| Freshness | No bound. Nothing reads it synchronously. |
| Concurrency | Appends do not conflict. |
| Conflict handling | None; append-only with no update path. |
| Recovery | **Lossy.** Entries buffered in `SC-S3-25` and not yet flushed are lost on crash, and are dropped outright while that sink's breaker is open. The log is evidence, not a ledger, and must not be treated as complete. |
| Migration path | The category stays where it is. **The gap that needs a path is a principal field**: `05_…md` §9.2 states that adding one (or giving `SC-S3-45` a store) is what turns the deletion owner from *unassignable* into merely *unassigned*, and only then can it be assigned. Until then, `CAP-S4-1` stands and `F-S3-3`'s retention gap has no owner. |
| Observability | The table is itself the primary observability substrate. It has **no** observability of its own: there is no counter for entries dropped while the breaker was open, so the lossiness above is invisible in production. |

#### `SC-S3-17` — Operation event log

**Authority: `CMP-S4-9`**, written through `CMP-S4-19`.
**Clause 5** — `Learner-scoped: question — open`; the `data` payload column is potentially learner
payload. Status: `existing`.

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-14`'s Tier-2 blocking-stats query, by raw SQL at `src/adapters/drizzle/tier2-blocking-stats-repository.ts:39`, feeding `SC-S3-21`; operators. |
| Writes | `CMP-S4-9`, issued through `CMP-S4-19` (`src/transport/pg-event-transport.ts:109`). Appended per event, never mutated. |
| Consistency | Best-effort, fails open, exactly as `SC-S3-16`. |
| Freshness | The Tier-2 breaker's read tolerates **60 seconds** of staleness — that is `SC-S3-21`'s cache window, and it is the only freshness requirement any consumer places on this table. |
| Concurrency | Appends do not conflict. The breaker's read is a snapshot query and does not coordinate with writers. |
| Conflict handling | None; append-only. |
| Recovery | **Lossy**, on the same terms as `SC-S3-16`. This matters more here: a gap in the event log biases the Tier-2 blocking statistics computed from it, and the bias is silent. |
| Migration path | As `SC-S3-16` — the missing principal field is the blocker, per `05_…md` §9.2 and `CAP-S4-1`. |
| Observability | Consumed by `SC-S3-21`, which is the only automated consumer. No signal exists for dropped events, so a breaker-open window looks identical to a quiet period. |

### 8.4 Existing, process-local in-memory — all clause 1

Every row in this section matches **clause 1**: its persistence cell is process-local, so authority is
the component whose process computes it, read off the row's own store cell. Each records
`n/a — non-durable` in its *writes* attribute and leaves the exactly-one-authority audit's **write**
scope — but **each still carries exactly one authority**, because clause 1 names one. See §10's scope
note, which reports both counts separately so the distinction is not lost.

This is also, in `04_…md`'s words, "the section that makes the current deployment single-instance". Every
row's *migration path* below is therefore the same question in a different costume: what happens to this
structure when there is more than one process. The matrix records the shape of that answer per row; the
topology that decides it is SUB-10's.

#### `SC-S3-18` — MCP transport registry

**Authority: `CMP-S4-4`** (HTTP transport edge). **Clause 1** — `process-lifetime`, held at
`src/transport/http.ts:82`. Status: `existing`.

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-4` on every request, to route to the live transport for an MCP session id. |
| Writes | `n/a — non-durable`. `CMP-S4-4` computes and holds it: created on `initialize`, removed on `onclose` (`:212`–`:218`) or shutdown (`:304`–`:311`). |
| Consistency | Process-local and therefore trivially consistent within its process. Across processes it is **not shared**, which is the single-instance constraint stated plainly. |
| Freshness | Always current within the process; meaningless across processes. |
| Concurrency | Node's single-threaded event loop serializes access. No lock is needed or present. |
| Conflict handling | None possible — one process, one map. |
| Recovery | Lost on restart. Clients re-`initialize`; the loss is a reconnect, not data loss. |
| Migration path | A second process makes an MCP session usable only on the instance that created it. Either sessions become sticky at the load balancer or the registry moves to a shared store — **`OI-S13-1`**; the decision is SUB-10's, not this matrix's. |
| Observability | Registry size is the natural gauge; none is currently exported. |

#### `SC-S3-19` — Subject-binding map

**Authority: `CMP-S4-4`**. **Clause 1** — `process-lifetime`, `src/transport/http.ts:83`.
`Learner-scoped: yes`. Status: `existing`.

`04_…md` records this as **the only server-side learner-identity binding that exists anywhere in the
system**. That fact does not change its clause — clause 1 precedes clause 5 and this row is process-local
— but it is the reason the row's migration path is the most consequential in §8.4.

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-4` per request, via `verifySessionBinding` (`:52`–`:72`), to reject session hijack. |
| Writes | `n/a — non-durable`. `CMP-S4-4` computes and holds it: written at `onsessioninitialized` (`:204`–`:210`), dropped with the transport. |
| Consistency | The binding must exist before the first non-`initialize` request on that session is admitted; there is no window in which a session is live and unbound. |
| Freshness | Always current in-process. |
| Concurrency | Event-loop serialized. |
| Conflict handling | None possible. A re-bind of a live session is not a modelled operation. |
| Recovery | Lost on restart together with `SC-S3-18`; the session dies with it, so the binding and the thing it protects are lost atomically. That coupling is what makes the loss safe. |
| Migration path | This is the row that decides whether the identity work in NEU-893 (`A-28`) can rest on anything that exists today. It cannot: the binding is per-process and per-session, so it can carry a subject through one connection and no further. `A-28` assumes isolation is enforced **server-side at or below the port boundary** — this structure sits *above* it. `A-28`'s invalidating outcome is that safe isolation requires a separate deployment or datastore; a durable, shared identity binding is what avoids that outcome. |
| Observability | Rejection counts on `verifySessionBinding` would be the security-relevant signal. None is exported. |

#### `SC-S3-20` — Rate-limit windows

**Authority: `CMP-S4-4`**. **Clause 1** — process-local, `TTL`,
`src/transport/rate-limit-middleware.ts:58`–`:59`. `Learner-scoped: yes` (keyed per JWT subject,
`:76`–`:77`). Status: `existing`.

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-4` per request, to admit or reject. |
| Writes | `n/a — non-durable`. `CMP-S4-4` computes and holds it: created on the first request in a window, swept lazily (`:63`–`:68`), expires at `resetAt`. |
| Consistency | Counter increments are read-modify-write on the event loop, so they are atomic in practice. |
| Freshness | Current by construction. |
| Concurrency | Event-loop serialized. |
| Conflict handling | None possible in one process. |
| Recovery | Lost on restart, which **resets every learner's window to zero**. A restart loop is therefore a rate-limit bypass. |
| Migration path | Per-process counters mean *n* processes multiply the effective limit by *n*. Either the limiter moves to a shared store or the configured limit is divided by the instance count — **`OI-S13-1`**, decided by SUB-10's topology. |
| Observability | Rejection counts are the signal; none is exported, so a bypass caused by restart churn is currently undetectable. |

#### `SC-S3-21` — Tier-2 circuit-breaker trip set and stats cache

**Authority: `CMP-S4-14`** (quality-gate battery). **Clause 1** — `process-lifetime`,
`src/orchestration/tier2-circuit-breaker.ts:68`, `:69`, `:76`. Status: `existing`.

The authority is `CMP-S4-14` rather than `CMP-S4-7` because clause 1 asks which component's process
*computes* the structure, and `05_…md` gives `CMP-S4-14` every content gate except citation drift. The
Tier-2 blocking decision is such a gate; the breaker is that gate's own machinery.

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-14` on each Tier-2 blocking decision. |
| Writes | `n/a — non-durable`. `CMP-S4-14` computes and holds it. The trip is one-shot per process and per field; the cache expires at 60 s; both are **re-derived from scratch after restart, intentionally** (`:4`–`:11`). |
| Consistency | The trip set is derived from `SC-S3-17` and then held. It is deliberately *not* kept consistent with its source afterwards — a trip is sticky for the life of the process by design. |
| Freshness | **60 seconds** for the stats cache. This is the only freshness bound any consumer places on `SC-S3-17`. |
| Concurrency | Event-loop serialized. Two concurrent gate evaluations during a cache miss can both issue the underlying query; the result is duplicate work, not an incorrect verdict. |
| Conflict handling | None. Both writers would compute the same trip state from the same query. |
| Recovery | Re-derived after restart, intentionally. A restart therefore **un-trips** a tripped breaker — deliberate, but it means restart frequency is a hidden input to gate strictness. |
| Migration path | Per-process trip state means *n* processes can hold *n* different opinions about whether Tier-2 blocking is tripped. Shared-store or accept-divergence is `OI-S13-1`. `CAP-S6-1` is relevant here: SUB-6 could not observe two-writer divergence, so the cost of divergence is capped evidence, not a measured quantity. |
| Observability | Trip transitions are the signal; they reach `SC-S3-17`, whose own lossiness (see `SC-S3-17` recovery) means a trip during a breaker-open logging window may not be recorded. |

#### `SC-S3-22` — Request context and correlation id

**Authority: `CMP-S4-4`**. **Clause 1** — `request-scoped`; two `AsyncLocalStorage` stores at
`src/shared/logger.ts:115`–`:116`, seeded at `src/transport/http.ts:153`–`:160`. Status: `existing`.

| Attribute | Value |
| --- | --- |
| Reads | Every logging call, throughout the process, for the duration of the request or tool call. |
| Writes | `n/a — non-durable`. `CMP-S4-4` seeds it; the store is entered per HTTP request or per tool call and exits with the call. |
| Consistency | The correlation id must be established before the first log line of a request, or that line is unattributable. |
| Freshness | Not applicable — the value is constant for the life of the call. |
| Concurrency | `AsyncLocalStorage` isolates concurrent calls by construction; this is the mechanism that makes concurrent requests loggable at all. |
| Conflict handling | None possible — each async context is private. |
| Recovery | Lost with the call, which is its whole lifetime. |
| Migration path | None. Request-scoped context is per-process by definition and is unaffected by topology. |
| Observability | The correlation id is itself the observability primitive: it is what joins `SC-S3-16` to `SC-S3-17`. |

#### `SC-S3-23` — Database client singletons

**Authority: `CMP-S4-9`**. **Clause 1** — `process-lifetime`, `src/infrastructure/db/client.ts:5` and
`src/infrastructure/db/operations.ts:5`. Status: `existing`. `04_…md` §4.3 records this as one of the two
structure merges (two handles, one category).

| Attribute | Value |
| --- | --- |
| Reads | Every repository call in the process. |
| Writes | `n/a — non-durable`. `CMP-S4-9` computes and holds it: lazily created, reset only in tests, process lifetime. |
| Consistency | Not applicable — the value is a connection handle, not data. |
| Freshness | Not applicable. |
| Concurrency | The pool is the concurrency mechanism, not a subject of it. |
| Conflict handling | None. |
| Recovery | Re-established on restart. A pool exhausted or broken mid-life has no in-process reset path outside tests, so recovery is a restart. |
| Migration path | None. Per-process pooling is correct at any instance count; only the aggregate connection budget scales, which is a deployment parameter and not an authority question. |
| Observability | Pool saturation is the operationally important signal and is not exported. |

#### `SC-S3-24` — Event-logger sink toggle

**Authority: `CMP-S4-19`** (operational logging sinks). **Clause 1** — `process-lifetime`,
`src/shared/logger.ts:214`. Status: `existing`.

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-19` on every log emission, to choose a durable sink or stderr. |
| Writes | `n/a — non-durable`. `CMP-S4-19` computes and holds it: set at boot when an audit/event database URL is configured. |
| Consistency | Set once at boot; never changes during the process's life. |
| Freshness | Not applicable. |
| Concurrency | Single write at boot. |
| Conflict handling | None. |
| Recovery | **Fails open** to stderr when unset (`:247`–`:250`) — a misconfigured process logs to stderr and serves learners normally. That is the intended behaviour and the reason a logging outage never becomes a serve outage. |
| Migration path | None. Per-process configuration is correct at any instance count. |
| Observability | The failure mode — a process silently logging to stderr because the URL was absent — is **not** observable from the durable logs, since by definition nothing reaches them. |

#### `SC-S3-25` — Audit/event transport batch buffers and per-sink breakers

**Authority: `CMP-S4-19`**. **Clause 1** — `process-lifetime`, in transport worker threads at
`src/transport/pg-audit-transport.ts:45`–`:52` and `src/transport/pg-event-transport.ts:41`–`:48`.
Status: `existing`. `04_…md` §4.3 records this as the second structure merge (two instances, one
category).

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-19` on flush. |
| Writes | `n/a — non-durable`. `CMP-S4-19` computes and holds it: appended per log line, flushed on interval or batch size. |
| Consistency | Best-effort. The buffer is explicitly not a durable queue. |
| Freshness | Bounded by the flush interval and batch size — the delay between an event happening and its being visible in `SC-S3-16`/`SC-S3-17`. |
| Concurrency | Per-worker-thread, so no cross-thread contention on one buffer. |
| Conflict handling | None. |
| Recovery | **Unflushed entries are lost on crash, and dropped outright while a breaker is open.** This is the mechanism behind `SC-S3-16`'s and `SC-S3-17`'s lossiness, and it is the reason neither log may be treated as a complete record. |
| Migration path | None required for correctness; each process buffers its own lines. |
| Observability | **The gap that matters most in §8.4.** There is no counter for entries dropped while a breaker is open, so the drop is invisible — a quiet log looks the same as a broken one. |

#### `SC-S3-26` — JWKS remote key set

**Authority: `CMP-S4-4`**. **Clause 1** — `process-lifetime`,
`src/transport/jwt-middleware.ts:90`. Status: `existing`.

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-4` on every JWT verification. |
| Writes | `n/a — non-durable`. `CMP-S4-4` computes and holds it: fetched on first verification, refreshed by the library. |
| Consistency | The cached key set must admit any key the issuer (`CMP-S4-10`) currently publishes; a stale set rejects valid tokens after a key rotation. |
| Freshness | Whatever the library's refresh policy provides. `05_…md` places the issuer in `Z-IDP` and outside this system's control, so the refresh policy is a dependency, not a decision here. |
| Concurrency | Concurrent first verifications may each trigger a fetch; the outcome is duplicate fetches, not an incorrect verification. |
| Conflict handling | None — all fetches return the same issuer-published set. |
| Recovery | Re-fetched on restart or refresh. An issuer outage during a cold start means no token verifies until it returns. |
| Migration path | None. Per-process caching is correct at any instance count. |
| Observability | Verification failure counts would distinguish "bad token" from "stale key set"; none is exported. |

#### `SC-S3-27` — Classifier per-field model cache

**Authority: `CMP-S4-14`**. **Clause 1** — `process-lifetime`,
`src/adapters/langchain/content-classifier-adapter.ts:47`. Status: `existing`.

The authority is `CMP-S4-14`, not `CMP-S4-11`. `05_…md` places the AI provider (`CMP-S4-11`) in `Z-EXT`
and records that it is **authoritative for no verdict**; the cache is an in-process structure held by the
gate battery that calls it. Clause 1 asks whose process computes it, and it is this system's.

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-14` on each classification. |
| Writes | `n/a — non-durable`. `CMP-S4-14` computes and holds it: lazily initialised on first classify, process lifetime. |
| Consistency | Not applicable — the value is a seeded runnable, not data. |
| Freshness | Not applicable within a process. Across a deploy, a model or prompt change takes effect only on restart, which is the intended release mechanism. |
| Concurrency | Concurrent first classifications may each seed a runnable; the loss is duplicate initialisation. |
| Conflict handling | None. |
| Recovery | Re-initialised on restart. |
| Migration path | None. Per-process caching is correct at any instance count. |
| Observability | Classification latency and failure rate reach `SC-S3-17`; the cache itself is not instrumented. |

### 8.5 Existing, derived-never-persisted — all clause 1

No table backs any of these three; each is recomputed on every read. `04_…md` records them as categories
anyway, because this matrix must still say which component may compute and serve them — and that is
exactly what clause 1 provides.

Note that all three are `Learner-scoped: question — open`. Under clause 5 that would place them in the
invariant's domain and hand them to `CMP-S4-9`. **Clause 1 precedes clause 5 and wins**, which is correct:
a value with no store has no write for a persistence adapter to own. What the isolation invariant has to
say about them is about their *inputs* — `SC-S3-3`, `SC-S3-5`, `SC-S3-9` — which are clause-5 rows and
carry the requirement there.

#### `SC-S3-28` — Mastery level

**Authority: `CMP-S4-7`** (orchestration workflows). **Clause 1** — `derived-on-read`, store `none`,
computed at `src/orchestration/teaching-workflows.ts:602`. `Derived: yes`, from `SC-S3-3`. Status: `existing`.

| Attribute | Value |
| --- | --- |
| Reads | The prompt-render step of the teaching call that computed it, and nothing else — it is carried only on the ephemeral prompt context (`:595`–`:609`). |
| Writes | `n/a — non-durable`. `CMP-S4-7` computes it per teaching call and discards it. |
| Consistency | Must be computed from the `SC-S3-3` values current at that call. `min(repetitions, 5)` is a pure function, so consistency is entirely inherited from its input. |
| Freshness | Recomputed per call; cannot be stale. |
| Concurrency | No shared state; each call computes its own. |
| Conflict handling | None possible. |
| Recovery | Not applicable — recomputed on the next call. |
| Migration path | None. A derived value has nothing to migrate. Were it ever cached, it would become a new category needing its own row — not an amendment to this one. |
| Observability | Not instrumented. A regression would surface as a change in prompt behaviour, not as a signal. |

#### `SC-S3-29` — `LearnerContext` aggregate

**Authority: `CMP-S4-7`**. **Clause 1** — `derived-on-read`, store `none`; type at
`src/orchestration/learner-context-workflows.ts:16`–`:34`, built by `buildLearnerContext` `:84`–`:228`.
`Derived: yes`, from `SC-S3-3`, `SC-S3-5`, `SC-S3-9`. Status: `existing`.

| Attribute | Value |
| --- | --- |
| Reads | The request that computed it; discarded afterwards. |
| Writes | `n/a — non-durable`. `CMP-S4-7` computes it per request from **five parallel repository reads** (`:95`–`:103`). |
| Consistency | **The one genuine consistency requirement among the derived rows.** Five parallel reads are not a snapshot: due counts, overdue topics, streak and leech count can each reflect a different instant if a write lands mid-assembly. The aggregate is presented to the learner as one coherent picture, so a torn read is a real, if low-severity, defect. |
| Freshness | Recomputed per request. Its components inherit whatever staleness their sources have — here, none, since all five read the store directly. |
| Concurrency | No shared state. The hazard is the interleaving above, not contention. |
| Conflict handling | None possible. |
| Recovery | Not applicable — recomputed. |
| Migration path | None. If it were ever materialised for cost reasons it would become a new durable category with its own authority and its own freshness bound — a new row, not an edit to this one. |
| Observability | Assembly cost is the operational signal (five reads per request); not currently instrumented. |

#### `SC-S3-30` — Analytics KPIs and window rollups

**Authority: `CMP-S4-8`** (domain core). **Clause 1** — `derived-on-read`, store `none`; computed at
`src/domain/services/analytics-calculator.ts:112`–`:143` and `:191`–`:246`. `Derived: yes`. Status: `existing`.

The authority is `CMP-S4-8`, not `CMP-S4-7`: clause 1 names the component whose process *computes* the
value, and the calculator is in the domain core. `CMP-S4-7` is its sole caller
(`src/orchestration/analytics-workflows.ts:43`), which makes it the invoker, not the computer. `05_…md`
records `CMP-S4-8` as pure with zero I/O, which is consistent — the orchestration layer performs the
reads and hands the domain core values to compute over.

| Attribute | Value |
| --- | --- |
| Reads | Returned in the tool response to the caller and discarded. |
| Writes | `n/a — non-durable`. `CMP-S4-8` computes it per request. |
| Consistency | Inherited from the reads `CMP-S4-7` performs on its behalf. The rollups are reported as a coherent window, so the same torn-read caveat as `SC-S3-29` applies. |
| Freshness | Recomputed per request; cannot be stale. |
| Concurrency | Pure computation over supplied values; no shared state. |
| Conflict handling | None possible. |
| Recovery | Not applicable — recomputed. |
| Migration path | None. Materialising a rollup would create a new durable category — the most likely future candidate in §8.5, and the one whose introduction would most need its own freshness bound. |
| Observability | Computation cost per request; not instrumented. |

<!-- BATCH-CURSOR -->
