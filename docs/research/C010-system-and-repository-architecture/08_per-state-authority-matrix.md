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

### 8.6 Required by an upstream package — no store today

Every row in this section is a thing this system **does not hold today**. Two consequences follow, and
both are deliberate:

- **The *migration path* attribute is the load-bearing one.** For an `existing` row it usually reads
  "none required"; here it is the whole content of the assignment. What the row records is where the
  category has to arrive and under whose authority — not how the DDL gets written, which is SUB-10's.
- **Several cells read "to be defined" in `04_…md`.** Where a cell's value is genuinely not determined by
  any merged input, this matrix says so and names what would determine it. It does not invent a value.
  Per clause 1's own proviso, a `to be defined` volatility cell is **not** `derived-on-read` and does not
  match clause 1 — SUB-6 states this explicitly in its `SC-S3-37` demonstration.

#### `SC-S3-31` — Corpus-neutral assessment-evidence record

**Authority: `CMP-S4-9`**, written through `CMP-S4-7`.
**Clause 5** — `Learner-scoped: question — open`. Status: `required-by-upstream`.

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-7` when assessing and when computing progression; NEU-888's mastery model downstream. |
| Writes | `CMP-S4-9`, issued through `CMP-S4-7`, on each assessment event. |
| Consistency | **Identity is `node_id` + `skill_type`.** The `citation` is an optional, replaceable, non-key attribute — a record whose citation changes is the same record, and swapping the citation must not create a second row or invalidate the evidence. This is the property the corpus-neutrality requirement exists to protect. |
| Freshness | Read-your-writes for progression computation. |
| Concurrency | Two assessments of the same `node_id` + `skill_type` must serialize if the record is an aggregate; append-per-event has no race. Which of the two shapes applies is not determined by any merged input — SUB-10 decides it with the store. |
| Conflict handling | No merge on the key. A citation replacement overwrites a non-key attribute and is not a conflict. |
| Recovery | Durable once stored. Reconstructible only from `SC-S3-9` if the assessment events are themselves retained. |
| Migration path | New category. Arrives in the `public` schema under `CMP-S4-9`, written through `CMP-S4-7` — the same path every learner-scoped record already takes, so no new write edge is introduced. Store shape is **`OI-S13-1`** (SUB-10). |
| Observability | Write volume per node and skill type; nothing exists yet. |

#### `SC-S3-32` — Problem-citation record

**Authority: `CMP-S4-7`**, written to the store by `CMP-S4-9`; originated by `CMP-S4-13`.
**Clause 6** — `Learner-scoped: no`, and §6's lookup does not place it in a gate read set. Status: `required-by-upstream`.

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-13` at authoring; `CMP-S4-17` when checking a citation for drift; `CMP-S4-16` when serving a unit that cites it. |
| Writes | `CMP-S4-7`, issued to `CMP-S4-9`, on admission of a cited problem. |
| Consistency | **The stored field set is `stable_id` + `canonical_url` only.** `DR-C09-01` (NEU-890) fixes this interim set and routes `title`, numeric `constraints`, difficulty signal and curriculum placement to ledger challenge **`CH-F5-1`**. This matrix does not widen the set; `CAP-S3-1` already carries the unresolved fields with a named owner, and is cited here rather than duplicated. |
| Freshness | The `canonical_url` is a pointer to an external site (`CMP-S4-12`). Its *freshness* is not this record's property — it is `SC-S3-34`'s verdict about it. That separation is why the two are different categories. |
| Concurrency | Keyed on `stable_id`; a re-admission of the same citation is an upsert on that key, not a second row. |
| Conflict handling | No merge; the two fields are replaced together. |
| Recovery | Durable once stored; recoverable by re-import from the authoring source. |
| Migration path | New category, `public` schema, under `CMP-S4-7`'s authority via `CMP-S4-9`. **The field set may not be widened on the way** — widening requires citing `CH-F5-1` and carrying the gap as a cap, which is what `CAP-S3-1` already does. |
| Observability | Citation count and admission failures; nothing exists yet. |

#### `SC-S3-33` — Cached citation-drift verdict

**Authority: `CMP-S4-17`** (citation-drift verdict producer). Held by `CMP-S4-18` (the drift-verdict cache).
**Clause 2 matched, resolved by tie-break (c)** — see the note below. Status: `required-by-upstream`.
`Derived: yes`, from `SC-S3-34`. `Learner-scoped: no`. **One of the three rows that close `OI-S2-2`.**

**Why this row needed a tie-break.** §6's lookup places `SC-S3-33` in a gate path — `05_…md` §7.3's
four-row disposition reads the cache on every content serve — so clause 2 matches. But clause 2's named
authority is "the MCP core, caller-side per `BND-S4-4`", and on the request path that is `CMP-S4-7`.
**That authority is unexercisable.** `03_…md` §4.3 specifies the cache as internal, keyed-read-only, with
no egress, computing nothing, and states that it "never derives, refreshes or ages" a verdict; `05_…md`
`FL-S4-13` names **`CMP-S4-17` the cache's only writer**. A rule output that requires `CMP-S4-7` to write
a store two merged predecessors say only `CMP-S4-17` writes is not an assignment this chapter may make.

Two components are therefore plausible and the tie-breaks apply. Tie-break (b) — "out of domain but read
on a gate path → core wins" — is read **narrowly**, as adjudicating core-versus-web candidacy: it is the
companion to clause 2's "the web tier never holds gate authority", and `CMP-S4-17` is neither core nor
web but a `Z-CONT` producer. On that reading (b) does not select, and **tie-break (c) applies: the
component that produces the row wins → `CMP-S4-17`.** The narrow reading is disclosed rather than
assumed, and both the under-determination and the reading are routed to SUB-6 as **`F-S13-1`**. Exactly
one authority is recorded either way; SUB-14 or SUB-16 may overturn the reading without the matrix ever
having held two.

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-16` (content serve path) — **one keyed read per unit**, per `05_…md` §7.3 hop 3. `CMP-S4-18` is authoritative for the stored verdict and its date; `CMP-S4-16` is authoritative for what to do about it. No other reader. |
| Writes | `CMP-S4-17`, out of band, on the producer's own schedule. Never on the serve path. |
| Consistency | A cached entry carries a verdict **and its date**, together. A verdict without a date cannot be aged and is therefore useless to the disposition; the pair is the unit of write. |
| Freshness | **The defining attribute of this row.** An entry is fresh only within `per_citation_staleness_window` — declared at **90 days**, not measured (`03_…md` §4.2). Beyond it the entry is *stale*, which is a recorded state, never a partial verdict. |
| Concurrency | Single writer by specification, so no write race exists. Reads are keyed and never block. |
| Conflict handling | None possible — one writer, keyed replacement. |
| Recovery | A lost cache degrades to *verdict absent*, which the disposition already handles by quarantining. **Loss is safe by construction**, which is the strongest argument for the cache being separate from `SC-S3-34`. |
| Migration path | New category. Arrives inside the drift component's own deployment, written by `CMP-S4-17` and read by `CMP-S4-16` across `BND-S4-11` — a boundary `05_…md` classifies as **neither trust nor process**. No new write edge crosses into the core. |
| **Quarantine-on-stale** | Per `05_…md` §7.3 and `03_…md` §4.4: verdict `blocked` → quarantine; residual `quarantined` → quarantine; verdict **stale** → quarantine; verdict **absent** → quarantine. **All four: the learner's request still completes.** Because `per_source_revalidation_budget` is **0 for all twelve sources**, stale-or-absent is the state every citation would be in — so `CMP-S4-16` must treat quarantine as its **ordinary** operating mode, not its exception. A serve path that only works when a fresh verdict exists is mis-built. |
| Observability | Cache hit/miss and stale-fraction are the operationally meaningful signals. At budget 0 the stale fraction is expected to be ~100%, so an alert on it would fire permanently and must not be configured naively. |

#### `SC-S3-34` — Citation-drift verdict store

**Authority: `CMP-S4-17`**. **Clause 6 matched, resolved by tie-break (c)** — see `F-S13-1`.
Status: `required-by-upstream`. `Learner-scoped: no`. **One of the three rows that close `OI-S2-2`.**

Clause 2 does **not** match: §6's lookup places `SC-S3-33`, not `SC-S3-34`, in a gate path — the serve
path reads the cache, never the producer's store. Clauses 3, 4 and 5 do not match either, so clause 6's
default names `CMP-S4-7`. That collides with `03_…md` §4.2, which specifies the store as written **only**
by the producer. Here tie-break (b) does not even arise (the row is not read on a gate path), so
**tie-break (c) applies cleanly: the producer wins → `CMP-S4-17`.**

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-17` itself, to decide what to re-check. Nothing else in this system reads it — the serve path reads `SC-S3-33`. |
| Writes | `CMP-S4-17`, exclusively. This component is **the system's only component with egress to a party outside the operator's control**, which is precisely why its write set is drawn this tightly. |
| Consistency | One tuple per check: `{ citation_id, checked_at, path, verdict, signals_fired, window_admitted_under, budget_admitted_under }`. The tuple commits whole. Recording which window and which budget a verdict was admitted under is what makes a later verdict comparable to an earlier one. |
| Freshness | Governed by `per_citation_staleness_window` (**90 days, declared not measured**) and `per_source_revalidation_budget` (**0 for all twelve sources**). At budget 0 no re-check is admitted, so in steady state the store does not refresh — that is the specified behaviour, not a defect. |
| Concurrency | **Exactly one request per citation**; a corpus walk is prohibited. That prohibition is a property of the producer's egress discipline and constrains its writes as much as its reads. |
| Conflict handling | None possible — single writer, keyed on `citation_id`. |
| Recovery | A re-check that cannot complete produces **`verdict stale` — a recorded state, never a partial verdict**. There is no half-written verdict to recover from. |
| Migration path | New category, inside the drift component's own deployment. It must **not** be co-located under an authority that would give any other component a write path to it, because that would put egress-derived state under a writer with no egress discipline. |
| Observability | Checks attempted, checks admitted, and admissions refused by budget. At budget 0 the third is expected to be every check. |

#### `SC-S3-35` — Gate-verdict record

**Authority: `CMP-S4-14`** (quality-gate battery), written through `CMP-S4-15` (the authoring-time gate
runner). **Clause 2** — `CMP-S4-14`'s "Demanded by" names this row; authoring path, so `BND-S4-4`'s
authoring half applies. Status: `required-by-upstream`. **One of the three rows that close `OI-S2-2`.**

Clause 2's answer is exercisable here, and no tie-break is needed. `03_…md` §3.5 specifies that the gate
runner writes **one gate verdict per executed unit, on that unit's review record**, and raises the
authority question as `OI-S2-2`. The answer is that `CMP-S4-15` *executes* the write inside its terminable
isolate; `CMP-S4-14` is the battery that owns `BND-S4-9` and the calling half of `BND-S4-4`, and is the
authority. This also resolves `FL-S4-16`'s "Undetermined" authority column and discharges **`F-S4-3`**.

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-14` on re-run and when deciding blocking behaviour; `CMP-S4-13` before admitting content; authoring review. |
| Writes | `CMP-S4-14`, issued through `CMP-S4-15`, **inside a terminable isolate under a host-enforced wall-clock bound**. One verdict per executed unit. |
| Consistency | Each verdict names its **gate id** and its **blocking behaviour**, and identifies the content version (`SC-S3-2`'s `contentVersion`) it was computed against. A verdict that cannot name its gate or its input is not admissible evidence for an admission decision. |
| Freshness | Valid only for the content version it names. A content edit invalidates every verdict against the prior version. |
| Concurrency | One runner per unit per run. A unit terminated by the wall-clock bound produces **no verdict**, not a partial one — the isolate's terminability is what makes that guarantee available. |
| Conflict handling | No merge. A re-run supersedes; whether prior verdicts are retained is a store-shape question (**`OI-S13-1`**, SUB-10). |
| Recovery | A terminated or crashed run leaves the unit **without** a verdict, which the quarantine path (`SC-S3-36`) already handles. Absence is a modelled state, so there is nothing to repair. |
| Migration path | New category. Arrives on the authoring side, written by `CMP-S4-14` through `CMP-S4-15` across `BND-S4-15` — the boundary `CMP-S4-13` owns, and one that is already a process boundary. Tier-2 remains post-commit. |
| Observability | Verdicts per gate id, and terminations by wall-clock bound. The termination count is the signal that distinguishes "gate passed" from "gate never finished", and losing it would make a silently-degrading gate battery look healthy. |

#### `SC-S3-36` — Quarantine record

**Authority: `CMP-S4-14`**. **Clause 2** — named in `CMP-S4-14`'s "Demanded by"; authoring path.
Status: `required-by-upstream`.

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-14` when a requirement is re-evaluated; `CMP-S4-16` indirectly, in that a quarantined requirement is not served as decided; operators and owners. |
| Writes | `CMP-S4-14`. Opened when a gate quarantines, closed by its stated exit condition. |
| Consistency | **All three slots — `reason`, `owner`, `exit_condition` — commit together.** A quarantine with no named owner or no exit condition is a permanent quarantine wearing a temporary label, and the three-slot shape exists specifically to make that unrepresentable. |
| Freshness | Read-your-writes on the authoring path. |
| Concurrency | One quarantine per requirement; re-quarantining an open record updates it rather than opening a second. |
| Conflict handling | No merge. A close and a re-open must serialize, or the exit condition of one is lost. |
| Recovery | Durable once stored. An open quarantine is the safe state, so loss-toward-closed is the dangerous direction and the store must not silently drop open records. |
| Migration path | New category, authoring side, under `CMP-S4-14`. Note the interaction with `SC-S3-33`: at revalidation budget 0 the drift path quarantines *serve-side* on every citation, and that is `CMP-S4-16`'s disposition, **not** a `SC-S3-36` record. The two quarantine notions must not be fused — one is an authoring decision with an owner, the other is a serve-time disposition with none. |
| Observability | Open quarantines by owner and by age. Age is the only signal that distinguishes a working exit condition from a decorative one. |

#### `SC-S3-37` — DP-map node and prerequisite-edge records

**Authority: `CMP-S4-7`**. Imported by `CMP-S4-13`. **Clause 6** — this is SUB-6's own second worked
demonstration (`07_…md` §6.2). Status: `required-by-upstream`. **This row closes `OI-S4-1`.**

**The clause walk, reproduced because SUB-6 published it.** Clause 1 does not match — the volatility cell
reads `to be defined`, and `to be defined` is not `derived-on-read`. Clause 2 does not match at this
cutoff: §6's lookup does not place the graph in `CMP-S4-14`'s or `CMP-S4-15`'s read set. Clause 3 cannot
match (§6.3 is empty). Clause 4 does not match. Clause 5 does not match — `Learner-scoped` is an explicit
**`no`**, the graph being learner-independent by construction, and only an explicit `no` leaves the
domain. **Clause 6 matches: `CMP-S4-7`.** SUB-6 also records that this answer is robust to `OI-S4-1`:
if the import lands and a gate reads the graph, clause 2 fires instead of clause 6 and the answer is
unchanged.

**The re-import, attributed.** `05_…md` §8.1 places the graph as **imported by `CMP-S4-13`**, read by
`CMP-S4-13` and `CMP-S4-16`, with **one in-system copy held** — and states explicitly that which
component is the *authority* over the imported copy is SUB-13's to decide. It is decided here:

> **A re-import is `CMP-S4-7`'s write, executed through `CMP-S4-13`.** `CMP-S4-13` is the importer and
> the only component that may originate an admission (`BND-S4-15`), but the authority over the in-system
> copy is `CMP-S4-7`. **No other component may refresh the copy**, and a refresh performed by anything
> else is a second writer by another name — which is exactly the failure `OI-S4-1` was opened to prevent.
> Upstream NEU-889 remains authoritative for the graph *itself*; this row is about the imported copy only
> (`FL-S4-21`).

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-13` at import and re-import; `CMP-S4-16` when placing content against the progression. |
| Writes | `CMP-S4-7`, executed through `CMP-S4-13`, at import **and at every re-import**. Exactly one in-system copy exists. |
| Consistency | Nodes and their edge set commit as one unit — the edge set must be **acyclic** over the nodes it references, and a partially-applied import that leaves a dangling edge or a cycle is not a valid state. Node attributes (`progression_stage`, `prerequisite_depth`, `difficulty`, `status`, `creator_review`) commit with their node. |
| Freshness | The in-system copy may lag NEU-889's artifact. **The copy's version must be identifiable**, or nothing downstream can tell which graph a progression decision was made against. |
| Concurrency | One import at a time. Two concurrent imports of different upstream versions would interleave into a graph that never existed upstream — the whole-unit commit above is what prevents it. |
| Conflict handling | No merge. A re-import **replaces** the copy; it does not reconcile it node-by-node against the previous version. |
| Recovery | Recoverable by re-import, since the upstream artifact is committed and gate-verified in NEU-889's package. This is the only `required-by-upstream` row with a trustworthy external source of truth. |
| Migration path | New category. Arrives as an imported copy under `CMP-S4-7`, written through `CMP-S4-13`. The import mechanism is SUB-10's and SUB-8's; the **authority and the re-import attribution are settled here** and are not theirs to revisit. |
| Observability | The copy's upstream version identifier, and the timestamp of the last import. Without the version identifier the freshness requirement above is unenforceable. |

#### `SC-S3-38` — Per-learner per-node progression

**Authority: `CMP-S4-9`**, written through `CMP-S4-7`.
**Clause 5** — `Learner-scoped: yes`. Status: `required-by-upstream`.

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-7` when selecting the next node; NEU-888's mastery model; `CMP-S4-16` when placing content. |
| Writes | `CMP-S4-9`, issued through `CMP-S4-7`, as assessment evidence accumulates. |
| Consistency | A learner's position must reference nodes that exist in the current `SC-S3-37` copy. A re-import that removes a node leaves progression rows pointing at nothing — the interaction is real and is **`OI-S13-1`**'s to resolve with the store shape. |
| Freshness | Read-your-writes. A progression read that misses the learner's last completed node re-serves work already done. |
| Concurrency | Two concurrent completions against one node must serialize, or a progression advance is lost — the same running-aggregate hazard as `SC-S3-3`. |
| Conflict handling | No merge; progression is order-dependent. |
| Recovery | Durable. Reconstructible from `SC-S3-31` if the evidence records are retained, which is the argument for retaining them. |
| Migration path | New category, `public` schema, under `CMP-S4-9` via `CMP-S4-7` — the standard learner-scoped path, no new write edge. |
| Observability | Advance rate per learner; nothing exists yet. |

#### `SC-S3-39` — Per-learner mastery-gate state

**Authority: `CMP-S4-9`**, written through `CMP-S4-7`.
**Clause 5** — `Learner-scoped: yes`. Status: `required-by-upstream`.

`04_…md` records this as **persisted, not recomputed per read** — that is what distinguishes it from
`SC-S3-28`, and it is why it takes clause 5 rather than clause 1. NEU-888's durability gate reads a
durable multi-session composite; a value recomputed at read time could not demonstrate durability across
sessions, only assert it.

| Attribute | Value |
| --- | --- |
| Reads | NEU-888's durability gate; `CMP-S4-7` when deciding whether a learner has passed a mastery gate. |
| Writes | `CMP-S4-9`, issued through `CMP-S4-7`, as the composite advances. |
| Consistency | The composite must be updated in the same unit of work as the attempt that advances it, or a mastery claim exists that no recorded attempt supports. |
| Freshness | Read-your-writes across learning runs. Cross-run durability is the property being measured, so a per-run cache would defeat the purpose. |
| Concurrency | Serialized per learner per gate. |
| Conflict handling | No merge; order-dependent, like `SC-S3-3` and `SC-S3-38`. |
| Recovery | Durable. **Partly derived** (a composite over recorded history) but **persisted**, so it is reconstructible from `SC-S3-9` and `SC-S3-31` only if those are retained across the full window the gate spans. |
| Migration path | New category, `public` schema, standard learner-scoped path. **It must be persisted, not materialised as a view over `SC-S3-28`** — the durability property is exactly what a read-time derivation cannot supply. |
| Observability | Gate pass/fail rates over time; nothing exists yet. |

#### `SC-S3-40` — Measurement-contract register

**Authority: `CMP-S4-7`**. **Clause 6** — `Learner-scoped: no`; not in a gate read set. Status: `required-by-upstream`. Volatility `durable` **by requirement**.

`05_…md` §8.2 places this precisely: the register is read **in place** by `CMP-S4-20` and by no other
component, **no copy is held in this system**, and only the contract *version identifier* crosses
(`FL-S4-22`). The authority recorded here is therefore an authority over something this system does not
currently hold — which is exactly what `required-by-upstream` means, and why the migration-path cell
below is the substantive one.

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-20` (operational-log derived-extract producer), in place, and no other component. `05_…md` records `CMP-S4-20` as `[unconfirmed]` — nothing implements it today. |
| Writes | `CMP-S4-7`, if and when a copy is ever held. **Today there is no in-system write**, because there is no in-system copy. |
| Consistency | Contracts are `MC-<n> v<major>.<minor>`, **frozen at a version, superseded by a new version, and never edited in place**. Prior versions are retained. Any store that permits an in-place edit of a frozen contract is the wrong store for this category. |
| Freshness | A consumer must be able to name the exact contract version a measurement was taken under. Freshness of the *register* is irrelevant; identifiability of the *version* is everything. |
| Concurrency | Version publication is serial by construction — a new version is a new row, never an update. |
| Conflict handling | None possible under append-and-supersede. |
| Recovery | The authoritative artifact is committed in NEU-887's package; any in-system copy is recoverable from it. |
| Migration path | **The decision is to not hold a copy.** `05_…md` §8.2 establishes that only the version identifier crosses; holding a copy would create a second source of truth for a register whose entire value is that it is frozen upstream. If a future requirement forces a copy, it arrives under `CMP-S4-7` and inherits the never-edit-in-place invariant — and that would be a new decision, not an application of this row. |
| Observability | Which contract version each measurement cites. Nothing exists yet, because `CMP-S4-20` does not exist yet. |

#### `SC-S3-41` — Operational-log derived extract (`PLA-*`)

**Authority: `CMP-S4-9`**, written through `CMP-S4-20`.
**Clause 5** — `Learner-scoped: question — open`. Status: `required-by-upstream`. `Derived: yes`, from
`SC-S3-16` and `SC-S3-17`.

This row is the constructive counterpart to `CAP-S4-1`. `05_…md` §9.2 records that **no component can be
named the deletion owner for `SC-S3-16` or `SC-S3-17`, and that the obstruction is structural** — the
tables have no principal field, so there is nobody to delete for. `CAP-S4-1` **stays open**; this chapter
does not close it and could not. What `SC-S3-41` does is different: the extract is specified to carry
**its own retention window and its own named deletion owner**, so a log-derived claim can be made without
inheriting the gap. `05_…md` names `CMP-S4-20` as the component this eventually attaches to.

| Attribute | Value |
| --- | --- |
| Reads | Whoever makes a log-derived claim. `04_…md` is explicit that **any** log-derived claim must go through this extract rather than the raw tables. |
| Writes | `CMP-S4-9`, issued through `CMP-S4-20`. Derived under an allowlist, retained for a stated window, **deleted by a named owner**. |
| Consistency | The extract is **minimized, allowlisted and payload-free**. A field not on the allowlist must be unrepresentable in the extract, not merely absent from it — otherwise the payload-free property is a convention rather than a guarantee, and the whole point is that it is a guarantee. |
| Freshness | Derived on a schedule; the window it covers must be stated with the extract. Nothing reads it synchronously. |
| Concurrency | Single producer. Overlapping derivation runs would double-count, so runs must not overlap for a given window. |
| Conflict handling | None; each run produces its own extract for its own window. |
| Recovery | Re-derivable from `SC-S3-16`/`SC-S3-17` **only while those rows still exist** — and they have no retention window (`F-S3-3`), so today they always exist. If a retention window is ever added upstream of the extract, re-derivation stops being available and the extract becomes the record of last resort. |
| Migration path | New category. **The retention window and the named deletion owner are not optional attributes to be added later** — they are the reason the category exists, and an extract shipped without them reproduces `CAP-S4-1`'s gap one layer up instead of resolving it. `CMP-S4-20` is `[unconfirmed]`: nothing implements it, so this path has not started. |
| Observability | Extract runs, rows emitted, and deletions performed against the retention window. The deletion count is the only evidence that the named owner is actually deleting. |

### 8.7 Assumed — predicted only by a SUB-1 stand-in

These four rows are `assumed`, never `existing`, and are never silently promoted to
`required-by-upstream`. Each names its stand-in **in the entry**, and — per the register's own citing rule
— the assignment that rests on a stand-in **names it in the sentence**, together with the envelope that
tolerates the assignment and the outcome that would invalidate it. An appendix reference is not a
citation.

`93_…md` is **closed** at five entries, `A-25` … `A-29`. This chapter adds no sixth stand-in. `A-26`
introduces no state category — an assumption about the *absence* of AI budgets is not a thing the system
stores — which is why five stand-ins map to four assumed rows.

#### `SC-S3-42` — Tutoring / hint interaction state

**Authority: `CMP-S4-9`**, written through `CMP-S4-7`.
**Clause 5** — `Learner-scoped: yes`. Status: **`assumed` — `A-25`**.

**This assignment rests on `A-25`.** `A-25`'s **tolerance envelope** admits any hint model in which the
AI call is made **outside a gate-bearing write path** — synchronous on a read path, asynchronous
anywhere, or batched ahead of time — at any learner/node granularity, any number of escalation levels,
and with the hint store being either a new category with its own authority under `OUT-3` or an extension
of an existing one. Assigning this row to `CMP-S4-9` through `CMP-S4-7`, as a category of its own, sits
squarely inside that envelope. `A-25`'s **invalidating outcome** is a hint model requiring **synchronous
multi-turn AI orchestration inside a gate-bearing write path**, which would put a variable-latency
external dependency inside the transaction that decides mastery. If that lands, this row's authority does
not merely need re-checking — the boundary `OUT-1` draws has to move first.

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-7` on the learner path when composing a hint; the tutoring surface via `CMP-S4-6`. |
| Writes | `CMP-S4-9`, issued through `CMP-S4-7`, as the learner escalates through hint levels. |
| Consistency | The hint state and the attempt it relates to (`SC-S3-9`) must be attributable to each other, or hint usage cannot be excluded from — or included in — a mastery judgement. Which of those it is, is NEU-891's decision, not this matrix's. |
| Freshness | **Sub-second read latency on the learner path** is `A-25`'s stated requirement. `SPK-S6-1` measured the MCP tool boundary at p50 **0.077 ms** and p95 **0.189 ms** at 714 B — **≤0.02 % of `A-25`'s 1000 ms budget** — so the crossing itself is not the risk. Its residuals apply: the measurement excludes the network hop and is per-call, so *k* reads pay *k* crossings. `SPK-S6-1` expires **2027-08-21**. |
| Concurrency | Escalations are serial per learner per node by nature; a race would only duplicate a level. |
| Conflict handling | No merge; last write wins on the level. |
| Recovery | Durable once stored. Loss re-starts the learner at hint level zero — recoverable, mildly annoying, not a correctness failure. |
| Migration path | New category, `public` schema, standard learner-scoped path via `CMP-S4-9`/`CMP-S4-7`. **The AI call must stay outside a gate-bearing write path**, per `A-25`'s envelope; that is a constraint on NEU-891's implementation, and this row records it because the authority assignment depends on it. |
| Observability | Hint escalations per node, and AI-call latency at the boundary. Nothing exists yet. |

#### `SC-S3-43` — Web-session and UI interaction state

**Authority: `CMP-S4-9`**, written through `CMP-S4-7`.
**Clause 5** — `Learner-scoped: yes`. Status: **`assumed` — `A-27`**. *Web session* here is a browser
session, **not** the learning run of `SC-S3-5`.

**This is the row most likely to be assigned wrongly, and the reason `07_…md` §6.3 exists.** All four of
clause 3's tests pass on the merits: (i) clause 2 did not match — §6's lookup does not place this row in
a gate component's read set; (ii) classification is `assumed` and the stand-in is `A-27`; (iii) the value
cannot change a schedule, a mastery record, an assessment-evidence record or a serve verdict — `04_…md`
records it as **explicitly not gate-bearing**; (iv) the store cell is `none`. **Clause 3 still does not
fire**, because the clause applies "only for a row on the closed list in §6.3", and under the selected
model `M-A` **that list is empty**. Four-of-four on the merits is not an exception if the row is not on
the list. The row therefore falls to clause 5, and the authority is `CMP-S4-9` — not the web tier.

SUB-6 retained the empty list rather than deleting it precisely so that a reversal to `M-C` would change
only its *contents* — this single row — and never the rule's structure. Recording `CMP-S4-3` here would
be the single highest-consequence error available in this chapter: it would make the browser an authority
for a state category, which is `A-27`'s invalidating outcome exactly.

**This assignment rests on `A-27`.** Its **tolerance envelope** admits any rendering model, arbitrarily
rich client-side interaction state, arbitrary client-side caching of read data, and optimistic UI —
**provided the server re-evaluates every gate from server-held state**. Assigning the authority to
`CMP-S4-9` is what makes that proviso structurally true rather than a convention. `A-27`'s
**invalidating outcome** is a UI direction requiring **offline-capable or client-authoritative learning
state**, because that makes the browser an authority for a state category under `OUT-3` and contradicts
both the trust property `OUT-1` asserts and the isolation invariant `OUT-4` states.

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-3` (web tier) when rendering; `CMP-S4-7` when restoring a learner's place. |
| Writes | `CMP-S4-9`, issued through `CMP-S4-7`. **`CMP-S4-3` never writes it directly** — that is the whole content of this assignment. |
| Consistency | Best-effort. Nothing downstream is invalidated by an inconsistent scroll position or a stale panel state. |
| Freshness | Loose. `A-27`'s envelope explicitly tolerates arbitrary client-side caching of read data, so a stale read here is inside the assumption rather than a defect. |
| Concurrency | Two browser tabs for one learner is the ordinary case; last-writer-wins is acceptable and expected. |
| Conflict handling | No merge. |
| Recovery | Durable if stored; entirely disposable. Loss costs the learner a re-orientation, nothing more. |
| Migration path | New category, standard learner-scoped path. **If `07_…md` §6.3's list is ever populated with this row under a reversal to `M-C`, this is the row that moves** — and it is the only one. Nothing else in this matrix would change. |
| Observability | Not needed. This is the one row where the absence of instrumentation is a correct decision rather than a gap. |

#### `SC-S3-44` — Handoff authorization envelope

**Authority: `CMP-S4-9`**, written through `CMP-S4-7`; enforced at `CMP-S4-4`.
**Clause 5** — `Learner-scoped: yes`. Status: **`assumed` — `A-29`**. Volatility **`TTL` by assumption**.

This row is the structural twin of `SC-S3-13` (context tokens): minted on the request path, stored under
the persistence authority, and enforced at the transport edge. The parallel is deliberate — a handoff
envelope that were minted or held anywhere else would be a second credential system.

**This assignment rests on `A-29`.** Its **tolerance envelope** admits any envelope shape — a token, a
scoped grant, a signed context blob — and any lifetime, **provided it expires and can be revoked**; it
admits the external client reading any state category the envelope's scope permits, at any freshness; it
admits one-way push of context at handoff time; and it admits the external client writing back **through
an existing gated MCP tool under its own authorization**. `A-29`'s **invalidating outcome** is a handoff
design requiring **the external client to hold write authority over any state category** — because
`OUT-3` gives each category exactly one authority, and an external client holding write authority puts a
component outside the trust boundary inside this matrix, which no isolation invariant under `OUT-4` can
then enforce. That outcome would not just change this row; it would make the matrix unenforceable.

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-4` on every request bearing the envelope, to admit or reject; `CMP-S4-2` (external MCP client) holds its own copy outside the boundary. |
| Writes | `CMP-S4-9`, issued through `CMP-S4-7`, at mint and at revoke. **`CMP-S4-2` never writes it** — an external client that could mint or extend its own envelope is `A-29`'s invalidating outcome in miniature. |
| Consistency | The envelope's scope and its expiry commit together. A scope without an expiry is not revocable in practice, whatever the revoke path claims. |
| Freshness | Strictly current at check: a revoked envelope must be rejected on the next request, not at the next sweep. This is a stronger requirement than `SC-S3-13`'s, because revocation is an explicit security action rather than passive expiry. |
| Concurrency | Mint and revoke against one envelope must serialize; a revoke that races a refresh must lose the refresh, not the revoke. |
| Conflict handling | No merge. Revocation is terminal and beats every concurrent operation. |
| Recovery | Durable. Loss of the store means every envelope is unverifiable, which must **fail closed** — the opposite of `SC-S3-24`'s fail-open logging posture, and the distinction matters. |
| Migration path | New category, `public` schema, standard learner-scoped path. **Expiry and revocability are not features to add in a later iteration** — `A-29`'s envelope is conditioned on both, so an envelope shipped without them falls outside the assumption this row's authority rests on. |
| Observability | Mints, revocations, and rejections by reason. Rejection-by-revocation must be distinguishable from rejection-by-expiry, or a revocation cannot be shown to have taken effect. |

#### `SC-S3-45` — Learner-identity → owner mapping

**Authority: `CMP-S4-10`** (identity provider), projected — never authored — by every other zone.
**Clause 4**, resolved per **`F-S13-2`** (see below). Status: **`assumed` — `A-28`**.
`Learner-scoped: yes, by definition`.

**No ownership column exists on any table today.** `04_…md` §6 searched `schema.ts` for `user_id`,
`userId`, `learner_id` and `learnerId` and found **zero matches** — none of the twelve Drizzle tables and
neither raw-SQL log table carries one. NEU-850's `OUT-2` is a **decision to honour, never an existing
schema fact**, and this row describes a category that is `assumed`, not present. Nothing in this chapter
states or implies that an ownership column exists.

**Why the authority is `CMP-S4-10` and not `CMP-S4-2` — `F-S13-2`.** Clause 4 reads: a `SC-S3-45`-class
row is "authored in `Z-IDP` (`CMP-S4-2`)". Those two identifiers do not denote the same thing. `05_…md`
§3.1 places **`CMP-S4-2` in `Z-EXT`** — it is the external MCP client, a third party — and names
**`CMP-S4-10`** as `Z-IDP`'s only component. Applied to the literal id, clause 4 would hand the identity
mapping to a third party outside the trust boundary, which is `A-29`'s invalidating outcome arriving by a
different door. This matrix records the authority for **the zone clause 4 names**, resolved to that
zone's actual component, `CMP-S4-10`; the id error is routed to SUB-6 as `F-S13-2`. Exactly one authority
is recorded, and the reasoning is on the page so SUB-14 can overturn it if SUB-6 meant something else.

**This assignment rests on `A-28`.** Its **tolerance envelope** admits isolation enforced at the
repository-port layer, in the database schema (row-level or predicate-based), or at both; a migration
that is staged, reversible, or run in a single step; existing global rows backfilled to a single owner,
quarantined, or archived; and the production Postgres being shared with a new web tier or fronted by one.
`A-28`'s **invalidating outcome** is a finding that **safe isolation requires a separate deployment or a
separate datastore** — which would relocate the authority assignments this whole chapter makes and move
the boundary `OUT-1` draws between the web tier and the MCP core. This row is the one place where that
outcome would not be a local correction.

| Attribute | Value |
| --- | --- |
| Reads | Every component that projects an owner onto a row it handles — `CMP-S4-4` at authentication, `CMP-S4-7` on every learner-scoped operation, `CMP-S4-9` when enforcing isolation at or below the port boundary. |
| Writes | `CMP-S4-10`. **Authored in `Z-IDP` and projected, never authored, by every other zone** — that is clause 4's whole content, and it is what keeps identity from acquiring a second source of truth inside this system. |
| Consistency | The mapping must resolve every authenticated principal to exactly one owner. A principal resolving to two owners, or to none, breaks isolation rather than degrading it. |
| Freshness | A revoked or re-assigned identity must take effect on the next request. The only thing this system caches from `Z-IDP` today is `SC-S3-26` (the JWKS key set), whose refresh policy is the issuer's — so the freshness of identity *facts* is an inherited dependency, not a local guarantee. |
| Concurrency | Not this system's concern; the mapping is authored upstream. |
| Conflict handling | Not this system's concern. A projection never merges. |
| Recovery | Not this system's to recover — the authority is external. What *is* this system's concern is that a projection failure must fail closed, not default to an unowned row. |
| Migration path | **This is the migration path that unblocks the most other rows in this matrix.** Today the only server-side learner-identity binding anywhere in the system is `SC-S3-19` — process-local, per-session, lost on restart. `A-28`'s envelope tolerates enforcement at the port layer, in the schema, or both, and tolerates existing global rows being backfilled to a single owner, quarantined, or archived. Giving this category a store is also, per `05_…md` §9.2, one of the two things that would turn the deletion owner for `SC-S3-16`/`SC-S3-17` **from unassignable into merely unassigned** — at which point `CAP-S4-1` becomes liftable and this matrix could assign it. Not before. |
| Observability | Projection failures, and rows encountered with no resolvable owner. The second count is the migration's completion signal: it must reach zero and stay there. |

---

## 9. The matrix in one table

The audits in §10 run against this table. `W` names the write path where §8 records one; it is an
annotation, never a second authority.

| Id | Category | **Authority** | W | Clause | Status |
| --- | --- | --- | --- | --- | --- |
| `SC-S3-1` | Topic record | `CMP-S4-9` | `CMP-S4-13` / `CMP-S4-7` | 5 | `existing` |
| `SC-S3-2` | Chunk content record | `CMP-S4-9` | `CMP-S4-13` / `CMP-S4-7` | 5 | `existing` |
| `SC-S3-3` | Per-chunk SM-2 scheduling state | `CMP-S4-9` | `CMP-S4-7` | 5 | `existing` |
| `SC-S3-4` | Content-audit verdict | `CMP-S4-7` | `CMP-S4-14` → `CMP-S4-9` | 6 | `existing` |
| `SC-S3-5` | Learning-session record | `CMP-S4-9` | `CMP-S4-7` | 5 | `existing` |
| `SC-S3-6` | Session-chunk teaching state | `CMP-S4-9` | `CMP-S4-7` | 5 | `existing` |
| `SC-S3-7` | Session question | `CMP-S4-9` | `CMP-S4-7` | 5 | `existing` |
| `SC-S3-8` | Question→chunk assessment mapping | `CMP-S4-7` | `CMP-S4-9` | 6 | `existing` |
| `SC-S3-9` | Attempt and grade record | `CMP-S4-9` | `CMP-S4-7` | 5 | `existing` |
| `SC-S3-10` | Pre-review scheduling snapshot (NEU-844) | `CMP-S4-9` | `CMP-S4-7` | 5 | `existing` |
| `SC-S3-11` | Grade-revision audit trail | `CMP-S4-9` | `CMP-S4-7` | 5 | `existing` |
| `SC-S3-12` | Notes | `CMP-S4-9` | `CMP-S4-7` | 5 | `existing` |
| `SC-S3-13` | Context tokens | `CMP-S4-9` | `CMP-S4-7`; enforced at `CMP-S4-4` | 5 | `existing` |
| `SC-S3-14` | Linter validation corpus | `CMP-S4-7` | `CMP-S4-9` | 6 | `existing` |
| `SC-S3-15` | Per-rule validation report | `CMP-S4-7` | `CMP-S4-9` | 6 | `existing` |
| `SC-S3-16` | MCP request log | `CMP-S4-9` | `CMP-S4-19` | 5 | `existing` |
| `SC-S3-17` | Operation event log | `CMP-S4-9` | `CMP-S4-19` | 5 | `existing` |
| `SC-S3-18` | MCP transport registry | `CMP-S4-4` | — non-durable | 1 | `existing` |
| `SC-S3-19` | Subject-binding map | `CMP-S4-4` | — non-durable | 1 | `existing` |
| `SC-S3-20` | Rate-limit windows | `CMP-S4-4` | — non-durable | 1 | `existing` |
| `SC-S3-21` | Tier-2 breaker trip set + stats cache | `CMP-S4-14` | — non-durable | 1 | `existing` |
| `SC-S3-22` | Request context and correlation id | `CMP-S4-4` | — non-durable | 1 | `existing` |
| `SC-S3-23` | Database client singletons | `CMP-S4-9` | — non-durable | 1 | `existing` |
| `SC-S3-24` | Event-logger sink toggle | `CMP-S4-19` | — non-durable | 1 | `existing` |
| `SC-S3-25` | Transport batch buffers + per-sink breakers | `CMP-S4-19` | — non-durable | 1 | `existing` |
| `SC-S3-26` | JWKS remote key set | `CMP-S4-4` | — non-durable | 1 | `existing` |
| `SC-S3-27` | Classifier per-field model cache | `CMP-S4-14` | — non-durable | 1 | `existing` |
| `SC-S3-28` | Mastery level | `CMP-S4-7` | — non-durable | 1 | `existing` |
| `SC-S3-29` | `LearnerContext` aggregate | `CMP-S4-7` | — non-durable | 1 | `existing` |
| `SC-S3-30` | Analytics KPIs and window rollups | `CMP-S4-8` | — non-durable | 1 | `existing` |
| `SC-S3-31` | Assessment-evidence record | `CMP-S4-9` | `CMP-S4-7` | 5 | `required-by-upstream` |
| `SC-S3-32` | Problem-citation record | `CMP-S4-7` | `CMP-S4-13` → `CMP-S4-9` | 6 | `required-by-upstream` |
| `SC-S3-33` | **Cached citation-drift verdict** | **`CMP-S4-17`** | held by `CMP-S4-18` | 2 → tb(c) | `required-by-upstream` |
| `SC-S3-34` | **Citation-drift verdict store** | **`CMP-S4-17`** | — | 6 → tb(c) | `required-by-upstream` |
| `SC-S3-35` | **Gate-verdict record** | **`CMP-S4-14`** | `CMP-S4-15` | 2 | `required-by-upstream` |
| `SC-S3-36` | Quarantine record | `CMP-S4-14` | — | 2 | `required-by-upstream` |
| `SC-S3-37` | DP-map node + prerequisite-edge records | `CMP-S4-7` | `CMP-S4-13` (import **and re-import**) | 6 | `required-by-upstream` |
| `SC-S3-38` | Per-learner per-node progression | `CMP-S4-9` | `CMP-S4-7` | 5 | `required-by-upstream` |
| `SC-S3-39` | Per-learner mastery-gate state | `CMP-S4-9` | `CMP-S4-7` | 5 | `required-by-upstream` |
| `SC-S3-40` | Measurement-contract register | `CMP-S4-7` | no in-system copy held | 6 | `required-by-upstream` |
| `SC-S3-41` | Operational-log derived extract `PLA-*` | `CMP-S4-9` | `CMP-S4-20` | 5 | `required-by-upstream` |
| `SC-S3-42` | Tutoring / hint interaction state | `CMP-S4-9` | `CMP-S4-7` | 5 | `assumed` — `A-25` |
| `SC-S3-43` | Web-session / UI interaction state | `CMP-S4-9` | `CMP-S4-7` | 5 | `assumed` — `A-27` |
| `SC-S3-44` | Handoff authorization envelope | `CMP-S4-9` | `CMP-S4-7`; enforced at `CMP-S4-4` | 5 | `assumed` — `A-29` |
| `SC-S3-45` | Learner-identity → owner mapping | **`CMP-S4-10`** | projected, never authored, elsewhere | 4 → `F-S13-2` | `assumed` — `A-28` |

---

## 10. The audits

Both audits below were run mechanically against §8's `####` blocks — parsing each block's id, its
`**Authority: `CMP-S4-<n>`**` marker and its clause citation — not asserted from the authoring notes.
SUB-14 can reproduce them by re-parsing the same blocks.

### 10.1 The exactly-one-authority audit

This is `OUT-3`'s first required audit.

| Measure | Count |
| --- | --- |
| Category rows in the matrix | **45** |
| Rows with **zero** authorities | **0** |
| Rows with **two or more** authorities | **0** |
| Rows with **exactly one** authority | **45** |
| Distinct `SC-S3-*` ids | **45** (duplicates: 0) |
| Rows whose authority is not a `CMP-S4-*` id | **0** |

**Verdict: pass.** Every one of the 45 categories names exactly one authority, and every authority is a
component id from `05_…md` §3 — no role names, no zone-only owners, no shared authorities.

**Scope note, stated explicitly so the two numbers are not confused.** The audit above runs over **all
45** rows. Clause 1 additionally removes its rows from the audit's *write* scope, because a process-local
or derived-on-read category has no durable write to attribute:

| Measure | Count |
| --- | --- |
| Rows recording `n/a — non-durable` in *writes* (clause 1) | **13** — `SC-S3-18` … `SC-S3-30` |
| Rows with a durable write to attribute | **32** |

Both numbers are published because reporting only the second would look like a matrix of 32 rows, and
reporting only the first would suggest 13 rows have no authority. Neither is true: **45 rows, 45
authorities, 32 durable writes.**

### 10.2 The state-inventory ↔ matrix audit

This is `OUT-3`'s second required audit — "that every `OUT-2` row appears in the matrix and every matrix
row appears in `OUT-2`". It is run in **both directions** and both counts are published, because a
one-directional check would pass on a matrix that silently invented a category.

This audit is **distinct from** SUB-7's resource-inventory ↔ matrix cross-check under `OUT-5`. That one
compares this matrix against a *resource* inventory that does not exist yet; this one compares it against
`04_…md`'s *state-category* inventory. They are named differently on purpose and neither substitutes for
the other.

| Direction | Unmatched count | Routing rule if non-zero |
| --- | --- | --- |
| `04_…md` §3 → this matrix (an inventory category with no row) | **0** | Held here. A missing row is this chapter's defect, and the remedy is to author it — never to narrow the domain. |
| This matrix → `04_…md` §3 (a matrix row with no inventory category) | **0** | Routed to SUB-3 (NEU-973) as a finding against `04_…md`. A row this matrix believes exists but the inventory does not carry is an inventory-completeness question, and `04_…md` §7.3 already states what would falsify its completeness claim. |

**Verdict: pass, both directions, zero unmatched.** The domain was verified independently of the matrix
by extracting every `SC-S3-<n>` token from `04_…md` and filtering to the numeric form: **45 distinct ids,
minimum 1, maximum 45, no gaps** — which agrees with `04_…md` §8's own counts table (30 + 11 + 4 = 45).
There is therefore **no unmatched item in either direction, and consequently no item to route** — the
routing rules above are recorded so that the audit is reproducible rather than merely reported.

One mechanical caveat for whoever re-runs this: `04_…md` §2 contains the bare template token
`SC-S3-<k>`, which a naive `SC-S3-` extraction picks up as a valueless match and which will corrupt a
numeric sort. Filter to the strictly numeric form before counting.

### 10.3 What neither audit checks

Stated so the pass verdicts are not over-read. Neither audit checks that the recorded authority is the
*right* one — only that there is exactly one, that it is a real component id, and that the row set
matches the inventory. Whether `SC-S3-33`'s authority should be `CMP-S4-17` or `CMP-S4-7`, for example, is
a question these audits cannot answer and `F-S13-1` routes to SUB-6. Validation is SUB-14's, per §2.

---

## 11. Distributions

Published so SUB-14 can re-derive them, and because the shape of the distribution is itself evidence
about the rule.

**By clause** (first match wins; every row cites exactly one):

| Clause | Rows | Share |
| --- | --- | --- |
| 1 — non-durable | **13** | 29 % |
| 2 — gate-bearing | **3** | 7 % |
| 3 — enumerated presentation exception | **0** | 0 % |
| 4 — identity mapping | **1** | 2 % |
| 5 — in the isolation invariant's domain | **20** | 44 % |
| 6 — default | **8** | 18 % |
| **Total** | **45** | 100 % |

**Clause 3's zero is the single most informative number in this table.** It is not an accident of the
inventory: it is the direct consequence of `07_…md` §6.3 being empty under the selected model `M-A`. The
web tier holds authority over **nothing**. That is what selecting `M-A` *means*, expressed as a count —
and it is the property SUB-14 should test hardest, because `SC-S3-43` would satisfy the exception on the
merits if the list were populated (see §8.7).

**By authority:**

| Authority | Component | Rows |
| --- | --- | --- |
| `CMP-S4-9` | Persistence adapters and Postgres | **21** |
| `CMP-S4-7` | Orchestration workflows | **9** |
| `CMP-S4-4` | HTTP transport edge | **5** |
| `CMP-S4-14` | Quality-gate battery | **4** |
| `CMP-S4-17` | Citation-drift verdict producer | **2** |
| `CMP-S4-19` | Operational logging sinks | **2** |
| `CMP-S4-8` | Domain core | **1** |
| `CMP-S4-10` | Identity provider | **1** |
| **Total** | 8 of 20 components | **45** |

**Twelve of `05_…md`'s twenty components hold authority over nothing**, including every `Z-EXT` component
(`CMP-S4-1`, `CMP-S4-2`, `CMP-S4-11`, `CMP-S4-12`), the web tier (`CMP-S4-3`), the STDIO transport edge
(`CMP-S4-5`), the MCP tool surface (`CMP-S4-6`), the authoring pipeline (`CMP-S4-13`), the gate runner
(`CMP-S4-15`), the content serve path (`CMP-S4-16`), the drift-verdict cache (`CMP-S4-18`) and the
derived-extract producer (`CMP-S4-20`). Several of those appear repeatedly in the `W` column — they
originate or execute writes without holding authority over them. **That separation is the mechanism this
whole chapter exists to establish**, and `CMP-S4-18` is its cleanest illustration: it *holds* `SC-S3-33`
and has authority over nothing, exactly as `03_…md` §4.3 specifies.

### 11.1 Two rows in one table, two different authorities

Worth naming so it is not read as an inconsistency. `SC-S3-2` (chunk content, `question — open` → clause
5 → `CMP-S4-9`) and `SC-S3-4` (content-audit verdict, `no` → clause 6 → `CMP-S4-7`) both live in
`public.learning_chunks`. The rule keys on the **isolation domain**, not on physical co-location, so
co-located categories can and do diverge. `04_…md` split that table into three categories for precisely
this reason — a one-row-per-table inventory would have produced a row needing two or three authorities,
which `OUT-3`'s exactly-one audit forbids.

### 11.2 Categories that could not take a single authority

**None.** All 45 took one. Two rows required a tie-break to get there, and both are disclosed at the row
and routed to SUB-6 as `F-S13-1` and `F-S13-2` respectively. **No category was split, shared, or left
unassigned**, and no category was routed to SUB-6 *instead of* being assigned — the findings accompany
assignments rather than substituting for them.

---

## 12. What this chapter closes, and what it does not

### 12.1 Closed

- **`OI-S2-2`** — closed. Its condition is that the matrix names exactly one authority for each of three
  categories, and that "a matrix that omits one of the three, or names two owners for one, does not close
  it". All three have their own row and exactly one authority: the **gate-verdict record** `SC-S3-35` →
  `CMP-S4-14`; the **drift-verdict store** `SC-S3-34` → `CMP-S4-17`; the **drift-verdict cache**
  `SC-S3-33` → `CMP-S4-17`. Closing it also resolves `FL-S4-16`'s "Undetermined" authority column and
  discharges **`F-S4-3`**. *(The item is recorded in `90_…md` against "SUB-13 (NEU-987)". `NEU-987` is a
  known merged typo — `F-S3-2` — and `05_…md` §12 states plainly that "SUB-13 is NEU-977, and `NEU-987`
  is not a child of this charter at all". This chapter is NEU-977's.)*
- **`OI-S4-1`** — closed. Its condition is that the matrix names exactly one authority for the imported
  `SC-S3-37` copy **and** states whether a re-import is that authority's write, "because an unattributed
  re-import is a second writer by another name". `SC-S3-37` → `CMP-S4-7`, and a re-import is
  **`CMP-S4-7`'s write, executed through `CMP-S4-13`**; no other component may refresh the copy. See
  §8.6.
- **`OUT-9`'s second half** — the drift-verdict store now has a place in the authority matrix.

### 12.2 Half-discharged, and staying open

- **`OI-S3-1`** — **not closed.** Its closure condition requires a resolved learner-scoping value for
  every `SC-S3-*` row and states that "a matrix that carries the column forward still marked
  `question — open` does not close it"; it also names SUB-14 as a co-consumer, so it could not close on
  SUB-13 alone in any case. What this chapter *can* resolve, it has: every row's **isolation-domain
  membership** and hence its clause is now settled, and clause 5's "only an explicit `no` leaves the
  domain" means an unresolved question is treated conservatively rather than optimistically.
  What it must not do is assert the value itself — `04_…md` §2 defines the column as recording the
  **question**, §6 confirms no ownership column exists on any table, and NEU-850's `OUT-2` is a decision
  to honour rather than a fact to report. The closure condition as written is therefore unsatisfiable by
  any document that respects `04_…md` §6, and that tension is filed as **`F-S13-3`** and routed to
  SUB-12.

### 12.3 Explicitly not closed

- **`CAP-S4-1`** — **stays open.** No component in `05_…md`'s inventory can be named the deletion owner
  for `SC-S3-16` or `SC-S3-17`, and `05_…md` §9.2 records the obstruction as **structural**: the tables
  have no principal field, so there is nobody to delete for. Deletion ownership is not write authority;
  this chapter assigns the latter to both rows (`CMP-S4-9`) and leaves the former exactly where it found
  it. `05_…md` names the unblocking condition — a principal field on both tables, or a store for
  `SC-S3-45` — and only then can this be assigned.
- **`F-S3-3`** (no retention window and no deletion owner on either log table) is cited at both rows and
  is not re-filed.
- **`CAP-S1-3`** already records that no QA pass exists for this package; it is cited here, not
  duplicated.
- **`CAP-S3-1`** carries `SC-S3-32`'s unresolved field set under `CH-F5-1`; this chapter does not widen
  the field set and does not re-file the cap.
- **`OI-S6-1`** (the store reversal, which reverses by only 2/500 and is fragile) is SUB-6's, evaluated
  by SUB-10. This matrix is written against the selected model `M-A` as it stands. Were the reversal to
  land, §11's distribution shows the blast radius precisely: `07_…md` §6.3 would gain one entry and
  `SC-S3-43` would move to `CMP-S4-3`. Nothing else in this matrix would change.

### 12.4 Findings raised here

| Id | In one line | Routed to |
| --- | --- | --- |
| `F-S13-1` | No clause keys on "this row's sole writer is already fixed by a merged predecessor contract", so clause 2 and clause 6 both name an authority that `03_…md` §4.2–§4.3 forbids exercising for `SC-S3-33`/`SC-S3-34`; resolved by tie-break (c) under a disclosed narrow reading of tie-break (b). | SUB-6 |
| `F-S13-2` | Clause 4 names `CMP-S4-2` as `Z-IDP`'s component; `05_…md` §3.1 places `CMP-S4-2` in `Z-EXT` and names `CMP-S4-10` as `Z-IDP`'s only component. Applied literally, clause 4 hands the identity mapping to a third party outside the trust boundary. | SUB-6 |
| `F-S13-3` | `OI-S3-1`'s closure condition demands a resolved learner-scoping value for every row, which `04_…md` §2 and §6 forbid any document from asserting. The condition is unsatisfiable as written. | SUB-12 |
| `F-S13-4` | The charter and tracker size this sub-task at 25–30 categories and 250–300 cells; the merged inventory publishes 45 and this chapter authors 450. Distinct from `F-S4-2`, which is about `04_…md`'s own stale §3 heading rather than the charter's stale sizing. | SUB-12 |

### 12.5 The one open item raised here

`OI-S13-1` — the *migration path* attribute for the store-`none` rows is a **shape**, not a destination,
until `OUT-8`'s store topology lands. Owner SUB-10, which causes the resolving event. Recorded once, in
`90_…md`, rather than repeated at each row that names it.

---

## 13. What this chapter hands on

| To | What it takes | With what caveat |
| --- | --- | --- |
| **SUB-14 (NEU-978)** | This matrix, in full. It is SUB-14's primary input. | Apply the isolation invariant, walk the scenarios, cross-check `05_…md`'s flows, re-run both audits. §10.3 names what the audits do **not** check; `F-S13-1` and `F-S13-2` name the two rows whose reasoning is most worth attacking. |
| **SUB-16** | This matrix plus SUB-14's findings. | SUB-16 dispositions and republishes. **That revision supersedes this one.** |
| **SUB-7, SUB-8, SUB-10** | Nothing yet. | Resolve against **SUB-16's** post-absorption revision, not this pre-validation one (§2). A consumer that reads this revision early owes itself a re-check when SUB-16 lands. |
| **SUB-12** | `F-S13-3` and `F-S13-4`. | `91_…md` records that this chapter raises **no new cap**; the four existing caps that bound it are cited there. |
| **SUB-6 (NEU-976)** | `F-S13-1` and `F-S13-2`. | Both are defects in the rule, not in its application. Neither was repaired locally; both rows still carry exactly one authority. |
| **SUB-3 (NEU-973)** | Nothing. | The inventory ↔ matrix audit found zero unmatched items in either direction (§10.2). |

---

## 14. Verification note

Every count in §10 and §11 was produced by parsing §8's `####` blocks mechanically — id, authority marker
and clause citation per block — rather than tallied by hand. The row domain was verified independently
against the merged `04_…md` before authoring began, and again after: **45 distinct `SC-S3-*` ids, minimum
1, maximum 45, no gaps**, agreeing with `04_…md` §8's own counts.

`NEU-987` appears in this chapter exactly once, in §12.1, and only to record that it is a known merged
typo for this sub-task's real id. This sub-task is **NEU-977**.

