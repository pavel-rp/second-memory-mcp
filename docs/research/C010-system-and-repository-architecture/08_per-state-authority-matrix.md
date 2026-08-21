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

<!-- BATCH-CURSOR -->
