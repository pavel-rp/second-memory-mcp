# 10 — The republished per-state authority matrix: every routed finding dispositioned, both audits re-proved

**Sub-task:** SUB-16 (NEU-979)
**Charter:** C010 — system and repository architecture
**Discharges:** `OUT-3`'s republication obligation (the corrected revision, with the exactly-one-authority and state-inventory ↔ matrix audits **re-run over it**); `OUT-4` (the disposition of every isolation-invariant failure SUB-14 routed)
**Revision:** **post-validation** — see §2
**Supersedes:** `08_per-state-authority-matrix.md` at its `pre-validation` revision
**Model:** claude-opus-5[1m]

---

## 1. What this chapter is, and what it is not

SUB-13 (`08_…md`) applied SUB-6's assignment rule to SUB-3's 45 state categories and published a
matrix. SUB-14 (`09_…md`) validated that matrix — the isolation invariant per row under two named
target states, four scenario walks, the cross-check against SUB-4's 22 authority-annotated flows, and
NEU-890's durability property — and its whole purpose was to **invalidate rows**. What it produced is a
**routed-findings list, not a corrected matrix**. This chapter turns that list into dispositions and
publishes the corrected revision.

**What this chapter does:**

- **Dispositions every finding SUB-14 routed** — eleven of them — each with **its cause as SUB-14 named
  it**, an explicit disposition, a **named owner**, and the row or rows it affected. A disposition of
  *no change* carries its reason. **The count received equals the count dispositioned** (§4.1).
- **Revises the rows the dispositions call for**, by **re-running SUB-6's published assignment rule
  against the failing row** — never by fresh judgement. Each revised row cites the clause that produced
  its authority and repopulates all nine of `OUT-3`'s attributes.
- **Re-proves** both of SUB-13's mechanical audits on *this* revision (§7), because a revision that
  repaired an invariant failure by splitting or merging a row could break either property.
- **Publishes the revision marker and the consumption statement** (§2), so the five downstream
  consumers resolve against this revision and cite it by marker.
- **Names every row still carrying an unresolved finding, with its owner** (§9).

**What this chapter is not:**

- **It is not a second validation.** SUB-14's per-row invariant application, its four scenario walks,
  its flow cross-check and its durability-property application are **consumed here as finished**. This
  chapter re-derives none of them and contradicts none of them.
- **It is not a re-opening of SUB-6's model.** `M-A` was selected, its criteria and weights were scored,
  and its assignment rule is published. Where a finding's cause is **the model**, this chapter
  **re-routes it to SUB-6 and records the outcome** — or carries it as a cap with a named owner when no
  answer arrives. It never re-decides the model locally. `F-S14-3` is exactly that case (§5.3).
- **It originates no authority assignment.** Every authority below is either carried unchanged from
  `08_…md` or is the output of re-running `07_…md` §6.1 against the row's own cells. No category the
  matrix never carried acquires an authority here; no category is added, removed, split or merged.
- **It is not an edit to any merged sibling chapter.** `05_…md`, `08_…md` and `09_…md` are merged and
  the package's registers are append-only. **The finding and its published disposition are the
  correction** — see §6, which is where the discipline is stated and applied.
- **It is not a schema, a migration or a DDL proposal.** A row states its migration **path**, never a
  statement. Store topology is SUB-10's (NEU-984).
- **It does not assert a learner-scoping fact.** `04_…md` §6 searched `schema.ts` for `user_id`,
  `userId`, `learner_id` and `learnerId` and found **zero matches** — no ownership column exists on any
  of the twelve Drizzle tables or either raw-SQL log table. NEU-850's `OUT-2` is **a decision to
  honour, never an existing schema fact**. **No revised row below describes an ownership column as
  present**, and the composed target state that assumes one is labelled as composed at every use.

---

## 2. Revision marker, and the consumption statement

**This is the `post-validation` revision of the per-state authority matrix.** It is the revision
produced by absorbing SUB-14's validation into SUB-13's assignment. Cite it as:

> **`08_…md` + `10_…md`, revision `post-validation` (SUB-16 / NEU-979)**

| Stage | Sub-task | What it did |
| --- | --- | --- |
| Assigned | SUB-13 (NEU-977) | Applied SUB-6's rule to 45 categories. Revision `pre-validation`. |
| Validated | SUB-14 (NEU-978) | Applied the invariant, walked the scenarios, cross-checked the flows. Produced eleven routed findings against the `pre-validation` revision. **Amended neither artifact.** |
| **Republished here** | **SUB-16 (NEU-979)** | **Dispositions all eleven, revises the rows the rule calls for, re-proves both audits. This revision.** |

**The consumption statement.** **SUB-7 (NEU-980), SUB-8 (NEU-981) and SUB-10 (NEU-984) resolve against
this revision — not SUB-13's `pre-validation` one — and cite it by the marker above.** So do SUB-11
(NEU-983)'s audits and SUB-12 (NEU-985)'s completeness gate, and so does every downstream
implementation charter that reads the matrix to learn who may write its slice's state.

**A downstream audit that cites SUB-13's `pre-validation` revision is a finding against that audit, not
against this chapter.** `08_…md` §2 said so before this chapter existed, and this chapter is the
revision it named. `08_…md` remains the place the 45 rows' nine attributes are authored in full; what
this revision changes, it re-authors here (§6), and what it leaves standing it leaves standing
explicitly (§4).

**How to read the two documents together.** `10_…md` is the revision; `08_…md` §8 is the attribute
body it revises. A consumer resolving a row reads **§8 of this chapter's table** for the row's
authority, clause, status and revision state, then `08_…md` §8 for its nine attributes — **except** for
the two rows §6 revises, whose attributes are re-authored **here in full** and supersede `08_…md`'s.
Nothing else in `08_…md` is superseded.

---

## 3. Vocabulary, disambiguated at first use

- **Authority.** The single component permitted to *write* a state category. Not the only component
  that may read it; not the component that happens to hold the bytes. Carried forward from `08_…md` §3
  unchanged, because changing it mid-package would invalidate every row.
- **`W` (write path).** The component through which the authority's write is *issued*. `08_…md` §9 is
  explicit that it **"is an annotation, never a second authority"**, and the exactly-one-authority audit
  does not count it. This chapter keeps that rule exactly.
- **Session.** Throughout this chapter, a **learning run** — the bounded `public.learning_sessions`
  record of `SC-S3-5`. It never means an HTTP session or an authentication session. Where a
  transport-level or authentication-level concept is meant, the component id is named instead.
- **Disposition.** What this chapter does to a routed finding: **revise the row**, **re-route it to the
  sub-task whose artifact owns its cause and record the outcome**, or **record no change with its
  reason**. Every disposition names an owner. **A disposition without an owner is itself a finding**,
  and none below is missing one.
- **Census A / Census B.** SUB-14's two evaluations of the isolation invariant under two **named** target
  states — **A** = target state (b), the category's row plus SUB-13's named authority *as it stands*;
  **B** = target state (c), *composed*: A **plus** NEU-850's `OUT-2` implemented in full and **nothing
  else**. **They are never summed and never merged.** The invariant's verdict depends on which target
  state is evaluated, so a single collapsed census would be a category error dressed as a number. This
  chapter carries both forward as two columns and reports no third.
- **Revision state.** A per-row marker this chapter adds: `carried` (the row is unchanged from
  `08_…md`), `noted` (unchanged, but this chapter records a disposition note at it), or `revised` (one
  or more of its nine attributes is re-authored here).

### 3.1 The two audits, named distinctly

Two different cross-checks in this package compare "a matrix" against "an inventory", and conflating
them would let one pass stand in for the other. They are named apart here and everywhere:

| Audit | Compares | Discharges | Owner |
| --- | --- | --- | --- |
| **The state-inventory ↔ matrix audit** | this matrix against **`04_…md` §3's state-category inventory** | `OUT-3`'s second required audit | SUB-13, **re-run here** (§7.2) |
| **The resource-inventory ↔ matrix cross-check** | this matrix against **SUB-7's web-API resource inventory**, which does not exist yet | **`OUT-5`** | **SUB-7 (NEU-980)** — not this chapter |

Neither substitutes for the other. §7.2 is the first; the second is not run here and is not claimed.

### 3.2 The vocabulary mapping between `05_…md` and `08_…md` — publishing what `F-S14-11` asks for

`F-S14-11` records that five flows name an **enforcing, admitting or producing** component where the
matrix names the **holding** one, and that what is missing is not a fix to either document but **a
stated mapping between the two vocabularies**. Here it is.

| Term | Document | Definition, quoted | What it answers |
| --- | --- | --- | --- |
| **"authoritative side"** | `05_…md` §5 | *"if the two sides disagree about this value, whose value is the fact"* | On an enforcement or admission hop: the component that **enforces or admits**. |
| **"authority"** | `08_…md` §3 | *"the single component permitted to write a state category"* | Who may **change** the stored value. |

**The mapping rule.** Where a flow's authoritative side differs from the matrix's authority **and the
flow's component appears in that row's `W` annotation**, the two documents are answering different
questions and **both are correct**. That is a **granularity** relation, not a disagreement, and it is
**not** a two-authority row. Where the flow's component does **not** appear in the row's `W`, the
difference is **substantive** and is a finding.

Applied to `09_…md` §12.2's five pairings, every one falls on the granularity side:

| Flow | The flow names… (enforcing / admitting / producing) | The matrix names… (holding) | Present in the row's `W`? |
| --- | --- | --- | --- |
| `FL-S4-5` | `CMP-S4-4` (the gate that fires) | `SC-S3-13` → `CMP-S4-9` | **yes** — *"enforced at `CMP-S4-4`"* |
| `FL-S4-17` | `CMP-S4-13` (the admitting pipeline) | `SC-S3-1`/`-2` → `CMP-S4-9`; `SC-S3-32` → `CMP-S4-7` | **yes** — `W = CMP-S4-13` on all three |
| `FL-S4-19` | `CMP-S4-4` (the minting edge) | `SC-S3-44` → `CMP-S4-9` | **yes** — *"enforced at `CMP-S4-4`"* |
| `FL-S4-20` (extract half) | `CMP-S4-20` (the extract's producer) | `SC-S3-41` → `CMP-S4-9` | **yes** — `W = CMP-S4-20` |
| `FL-S4-21` | `CMP-S4-13` (the importer) | `SC-S3-37` → `CMP-S4-7` | **yes** — `W = CMP-S4-13` |

**Five of five are granularity. None is substantive, none threatens the exactly-one-authority audit,
and neither artifact is amended** — which is the recommendation SUB-14 carried with the finding, adopted
here rather than overridden. **A mechanical flow-vs-matrix audit that applies the rule above will not
re-report these five**, which is the working outcome `F-S14-11` was asking for.

---

## 4. What this chapter consumes, verified before it is dispositioned

### 4.1 The input set, counted

**The routed-findings list is `09_…md` §15.3, with full records at `02_findings-register.md`
`### SUB-14`.** It was counted independently at both locations before anything was dispositioned, so
that a finding cannot be lost between the summary and the register:

| Measure | Count |
| --- | --- |
| Findings in `09_…md` §15.3's table | **11** — `F-S14-1` … `F-S14-11` |
| Finding records under `02_findings-register.md` `### SUB-14` | **11** — same ids, no gaps, no extras |
| **Findings received** | **11** |
| **Findings dispositioned in §5** | **11** |
| **Undispositioned** | **0** |
| Dispositions carrying a named owner | **11 of 11** |
| Open items received alongside them | **1** — `OI-S14-1`, dispositioned separately at §5.12 |
| Spike records received | **0** — SUB-14 filed none (`SPK-S14-*` is empty) |
| Cap records received | **0** — SUB-14 filed none (`CAP-S14-*` is empty); it cited three existing caps |

**Received 11, dispositioned 11.** The two numbers are equal, which is the check `OUT-4` asks for.

### 4.2 The validation record this chapter absorbs, restated without re-deriving it

Stated so a reader can see what was absorbed without opening `09_…md`, and so the dispositions below
are legible against it. **Every figure here is quoted from `09_…md`; none is recomputed.**

- **45 rows found, 45 evaluated, none omitted.** The domain was re-verified by a mechanical parse of
  `08_…md`, not read off its summary table; the two agree.
- **Two censuses under named target states, never summed** — §8 carries both forward.
- **`holds: 0` under both censuses is forced, not discovered.** `06_…md` §3.4.1 forbids returning
  `holds` for want of a counter-example; `holds` requires an **enumerated access-path set covering
  reads and writes**, and none exists for any category. `CAP-S5-1` therefore stands: **this package does
  not prove the invariant satisfiable**, and this chapter makes no satisfiability claim either.
- **`SUB-13's assignment` causes zero failures under either target state** (`09_…md` §15.2's cause
  tally, row 7: **0 / 0**). The frontier is the transport, the absent principal-attribution mechanism
  and the absent access-path enumeration — what `F-S5-4` recorded before the validation ran. **This is
  why ten of the eleven dispositions below are "no change": the matrix was not found wrong.**
- **`SUB-6's model` causes exactly one failure**, under Census B only: `SC-S3-45` (`F-S14-3`). That one
  is the model-cause finding §5.3 re-routes.
- **Scenario walks:** 180 row-walks — **178 defined, 2 undefined, both routed** (`F-S14-4`, `F-S14-5`).
- **Flow cross-check: explicitly non-zero — 11 discrepancies of 22 flows**, each with its direction
  named; 7 agree, 4 not comparable.
- **Durability property:** 4 of 4 touched rows hold; zero routed findings; three qualifications recorded.
- **No HTTP-only verdict exists**, and **no verdict rests on an ownership column being present.**

---

## 5. The disposition register

**One row per finding SUB-14 routed. Every row carries the cause *as SUB-14 named it* — not as this
chapter would re-characterise it — its disposition, its owner, and the row or rows it affected. A
`no change` disposition states its reason.**

| Id | Cause, as SUB-14 named it | Disposition | Owner | Row(s) affected |
| --- | --- | --- | --- | --- |
| `F-S14-1` | procedure gap (SUB-5) | **No change** — SUB-14 itself records that *"none of the 15 changes disposition under either reading"*; the finding asks for a **stated rule inside `I3`**, which lives in SUB-5's procedure, not in this matrix. Re-routed unchanged; the purposive reading is carried at the 15 portless rows. | **SUB-5 (NEU-975) / NEU-893** | the 15 portless rows — `SC-S3-16`, `SC-S3-17`, and the 13 clause-1 rows `SC-S3-18`…`SC-S3-30`. None revised. |
| `F-S14-2` | adjudication order (SUB-5) | **No change to any row; a reading constraint published at the census.** Both census tables in §8 carry `fails-principal: 0` annotated **`UNREACHED — not passed`** in the cell itself, so the number cannot be read bare. | **SUB-11 (NEU-983)** for the audits that consume the distribution; **NEU-893** owns the `sub`/`azp` defect | none — a property of both censuses, not of a row |
| `F-S14-3` | **SUB-6's model, clause 4** | **Re-routed to SUB-6 as `F-S16-2`; no answer arrives inside this pass, so carried as `CAP-S16-1` with a named owner.** The assignment is **not** revised: re-running clause 4 reproduces `CMP-S4-10`. §5.3. | **SUB-6 (NEU-976)** | `SC-S3-45` — authority unchanged, `noted` |
| `F-S14-4` | pending decision | **No change; carried as a named residual at the row** (§9). The row's own Consistency cell already names NEU-891 as the decider, and a matrix that guessed which way would be worse than one that routes. | **NEU-891** | `SC-S3-42` — divergence outcome stays **UNDEFINED**, `noted` |
| `F-S14-5` | pending decision | **No change; carried as a named residual at the row** (§9). Aggregate-vs-append is a store-shape decision, and `09_…md` §13.2 already checked that NEU-890's durability property survives **either** resolution. | **SUB-10 (NEU-984)** | `SC-S3-31` — conflicting-write outcome stays **UNDEFINED**, `noted` |
| `F-S14-6` | model consequence (SUB-6) | **No change; the reading is recorded** (§5.1). Re-running clause 3 reproduces zero: `07_…md` §6.3's enumerated list is **empty under `M-A`**, so no row can take the presentation exception, and `CMP-S4-3` holds 0 of 45 **by construction**. `FL-S4-2` describes a display relationship, not a state authority. | **SUB-16 (NEU-979)** — discharged here; consumer **SUB-7 (NEU-980)**, which must not mis-scope web-tier work on the assumption `CMP-S4-3` holds something | none — `CMP-S4-3` holds zero rows, before and after |
| `F-S14-7` | assignment consistency | **No authority revised — the apparent inconsistency dissolves under the rule's own ordering** (§5.2). Re-running `07_…md` §6.1 first-match-wins: `SC-S3-26` is process-local, so **clause 1 matches and clause 4 is never reached**; `SC-S3-45` is not process-local, so clause 1 falls through and **clause 4 matches**. Two different clauses, not two different judgements. An ordering note is recorded at both rows; the clause-order question is re-routed to SUB-6 as `F-S16-3`. | **SUB-16 (NEU-979)** for the disposition; **SUB-6 (NEU-976)** for `F-S16-3` | `SC-S3-26` (clause 1 → `CMP-S4-4`) and `SC-S3-45` (clause 4 → `CMP-S4-10`) — **both authorities unchanged**, both `noted` |
| `F-S14-8` | flow-vs-flow + flow-vs-matrix | **Authority confirmed by re-running clause 5; the *write path* revised; `05_…md` not edited** (§5.4, §6.1, §6.2). The intra-`05_…md` contradiction is **named and dispositioned, never silently reconciled**, and is re-routed as `F-S16-4`. | **SUB-16 (NEU-979)** for the matrix half; **SUB-4 (NEU-974)** for the `05_…md` half via `F-S16-4`; consumer **SUB-11 (NEU-983)** | `SC-S3-16`, `SC-S3-17` — **`revised`** (Writes, Consistency, Observability re-authored; **authority unchanged**) |
| `F-S14-9` | flow-vs-flow + flow-vs-matrix | **No change — the matrix is the reading consistent with `05_…md`'s own §5** (§5.5). Re-running clause 2 with tie-break (c) reproduces `CMP-S4-17`, and `FL-S4-13` — same document, same section — already calls `CMP-S4-17` the cache's **only writer**, so `FL-S4-14` is the outlier. Direction named; neither artifact amended. | **SUB-16 (NEU-979)**; the `05_…md` half re-routed to **SUB-4 (NEU-974)** via `F-S16-4`; consumer **SUB-11 (NEU-983)** | `SC-S3-33` — authority unchanged (`CMP-S4-17`), `noted` |
| `F-S14-10` | resolution not propagated | **No change to the row — the matrix is ahead and correct** (§5.6). Re-running clause 2's by-id membership check reproduces `CMP-S4-14`: `05_…md` places `SC-S3-35` in `CMP-S4-14`'s "Demanded by" read set. `FL-S4-16`'s *"Undetermined"* is stale, recorded with direction **matrix → flow**, and **not amended** — the disposition is the correction. | **SUB-16 (NEU-979)**; the staleness re-routed to **SUB-4 (NEU-974)** via `F-S16-4` | `SC-S3-35` — authority unchanged (`CMP-S4-14`, clause 2, `W = CMP-S4-15`), `noted` |
| `F-S14-11` | vocabulary gap between `05_…md` and `08_…md` | **No change to any row; the vocabulary mapping is published at §3.2**, which is precisely what the finding asks for, and SUB-14's carried recommendation — *"publish the vocabulary mapping; amend neither artifact"* — is **adopted, not overridden**. All five pairings fall on the granularity side of the published rule. | **SUB-16 (NEU-979)**; consumer **SUB-11 (NEU-983)**, so its mechanical audits do not re-report the five | `SC-S3-13`, `SC-S3-1`, `SC-S3-2`, `SC-S3-32`, `SC-S3-44`, `SC-S3-41`, `SC-S3-37` — none revised; each already carries the flow's component in its `W` |

**Totals: 11 received · 11 dispositioned · 0 undispositioned · 11 of 11 with a named owner · 2 rows
revised · 6 rows noted · 0 rows added, removed, split or merged.**

**Ten of eleven dispositions are "no change", and that is the honest result rather than a shortfall.**
SUB-14's cause tally records **zero** failures caused by SUB-13's assignment under either target state.
A pass that manufactured row revisions to look productive would be inventing defects the validation
explicitly did not find. The one substantive revision (§6) changes a **write path**, not an authority,
and it exists because SUB-14 raised a concrete conflict with `CMP-S4-9`'s own charter — not because a
verdict demanded it.

### 5.1 `F-S14-6` — the clause-3-zero reading, recorded

`FL-S4-2` names `CMP-S4-3` (the web tier) authoritative for *"learner-facing content and derived state
for display"*; the matrix gives `CMP-S4-3` authority over **zero of 45 rows**. Re-running the rule:
clause 3 is the only clause that can ever assign `CMP-S4-3`, and it admits **only** a row on the closed
list at `07_…md` §6.3. **That list is empty under the selected model `M-A`** — SUB-6 retained it empty
rather than deleting it, so a reversal to `M-C` would change only its contents (the single row
`SC-S3-43`) and never the rule's structure. A row may therefore satisfy all four of clause 3's tests on
the merits and **still** not take the exception, because it is not on the list. `SC-S3-43` is exactly
that row, and `08_…md` §8.7 already says so.

**Disposition: record the reading, amend nothing.** `CMP-S4-3` holding zero rows is `M-A`'s answer, not
an oversight, and it is the property that distinguishes `M-A` from `M-B`. The flow's annotation
describes a **display** relationship. **This is recorded rather than left implicit because a consumer
who assumes `CMP-S4-3` holds *something* would mis-scope web-tier work** — which is why the owner line
names SUB-7 (NEU-980) as the consumer, and why the clause-3-zero property is republished in §8's
clause distribution rather than dropped.

### 5.2 `F-S14-7` — the JWKS/identity pair, resolved by clause **order**

The finding's substance, in SUB-14's own words, is not either assignment in isolation but that *"the
matrix answers the same structural question the opposite way at `SC-S3-45`"* — `SC-S3-26` yields to the
in-process holder `CMP-S4-4`, while `SC-S3-45` yields to the external authority `CMP-S4-10`.

**Re-running `07_…md` §6.1 against each row's own cells shows the two rows never reach the same
clause**, and the rule is explicitly **ordered, first match wins**:

| Row | Persistence cell | Clause 1 (non-durable)? | Clause 4 (identity mapping)? | Clause that fires | Authority |
| --- | --- | --- | --- | --- | --- |
| `SC-S3-26` — JWKS remote key set | **process-local in-memory** (`jwt-middleware.ts:90`) | **matches** — authority is the component whose process computes it | **never reached** | **1** | `CMP-S4-4` |
| `SC-S3-45` — learner-identity → owner mapping | **no store; `assumed` under `A-28`** | falls through | **matches** | **4** | `CMP-S4-10` |

**Disposition: no authority revised.** The two answers differ because the two rows differ in a property
the rule tests **before** it ever asks about external authorship, and clause 1 precedes clause 4. That
is first-match-wins ordering doing exactly what it was written to do, and it is a **rule** outcome, not
a judgement — which is the only kind of answer this pass is permitted to give. The two rows are **not**
in conflict, and `SC-S3-26`'s own Freshness cell already carries the flow's answer for the *key
material* (*"the issuer's set wins… the refresh policy is `Z-IDP`'s"*) inside a row whose authority is
the *in-process cached copy*. **The flow and the matrix are answering different questions about
different things**, and the ordering note is recorded at both rows in §8.

**What is re-routed rather than settled here.** Whether clause 1 *should* precede clause 4 for a
process-local projection of external state is a question about **the rule's ordering**, and the rule is
SUB-6's. It is re-routed as **`F-S16-3`** to **SUB-6 (NEU-976)**. It is not re-decided here, and the
answer would not move either row's verdict under either census — `SC-S3-26` is `not-applicable` in both,
and `SC-S3-45`'s `fails-confinement` under Census B is `F-S14-3`'s structural matter, not this one's.

### 5.3 `F-S14-3` — the model-cause finding, re-routed and capped

**This is the only finding SUB-14 attributed to SUB-6's model rather than to SUB-13's assignment**, and
it is therefore the one finding this pass is **forbidden** to resolve locally.

**The finding.** `SC-S3-45`'s authority is `CMP-S4-10`, a component in `Z-IDP`, **outside this system**.
`I3` requires an **enumerated access-path set covering reads and writes** (`06_…md` §3.4.1). No such set
can be enumerated for a store this system does not own — in **any** target state, including one that
assumes `OUT-2` implemented in full, because `OUT-2` adds ownership keys to *this system's* tables. So
`SC-S3-45` returns `fails-confinement` **permanently**, not pending a change.

**What re-running the rule establishes, and what it cannot.** Re-running `07_…md` §6.1 clause 4 against
the row reproduces `CMP-S4-10` exactly (resolved through `F-S13-2`: clause 4 names the **zone** `Z-IDP`,
whose only component per `05_…md` §3.1 is `CMP-S4-10`, not `CMP-S4-2`, which sits in `Z-EXT`). **The
assignment is right.** What the assignment rule **cannot** resolve is whether a row whose authority is
external should be inside the invariant's domain at all — that is a question about the model's clause 4,
and only SUB-6 owns it.

**Disposition, in the two steps the brief requires.**

1. **Re-routed to SUB-6 (NEU-976) as `F-S16-2`** — *"should a category whose authority is external be in
   the isolation invariant's domain, or should clause 4 remove it, and what is `I3`'s verdict for a
   store this system does not own?"*
2. **No answer arrives inside this pass.** SUB-6 (NEU-976) is merged and closed; no scheduled pass will
   answer `F-S16-2` before this chapter publishes, and this chapter may not answer it. It is therefore
   **carried as `CAP-S16-1`, with named owner SUB-6 (NEU-976)** and consumers SUB-8 (NEU-981) and
   SUB-12 (NEU-985).

**The row is not revised**, and **`SC-S3-45` is named in the residual statement** (§9) so that a
downstream audit resolves against it under a recorded caveat rather than discovering the permanence
later. `CAP-S16-1` is a cap on **one row's reachable verdict**, not on the invariant's satisfiability in
general — that is `CAP-S5-1`'s, which stands and is **cited, not duplicated**.

### 5.4 `F-S14-8` — the log tables: authority re-derived, write path revised, `05_…md` untouched

SUB-14 calls this *"the cross-check's strongest finding"*, and it carries **three distinct claims**.
They are dispositioned separately, because collapsing them would hide which part is settled.

**Claim (i) — flow vs. matrix.** `FL-S4-8`/`FL-S4-9` name `CMP-S4-19` authoritative for what is stored
in `SC-S3-16`/`SC-S3-17`; the matrix names `CMP-S4-9`, with `CMP-S4-19` as `W`. **Re-running `07_…md`
§6.1 against each row's own cells:**

| Clause | Test | `SC-S3-16` | `SC-S3-17` |
| --- | --- | --- | --- |
| 1 — Non-durable | persistence cell `derived-on-read` or process-local? | **no** — a durable `infrastructure`-schema table | **no** — same |
| 2 — Gate-bearing | in a gate component's read set by the `05_…md` **by-id** check (`08_…md` §6)? | **no** — appears in no gate read set | **no** — `05_…md` places `SC-S3-21`, *not* `SC-S3-17`, in the Tier-2 path; `08_…md` §6 records **"indirect consumption is not membership"** |
| 3 — Presentation exception | on `07_…md` §6.3's list? | **no** — the list is empty under `M-A` | **no** |
| 4 — Identity mapping | a `SC-S3-45`-class row? | **no** | **no** |
| **5 — In the invariant's domain** | `Learner-scoped` is `yes` **or** `question — open`? | **yes — `question — open`** (holds learner payload in `response_body`/`params`, carries no principal field) | **yes — `question — open`** (the `data` payload column is potentially learner payload) |
| | **Clause 5 fires. Authority = `CMP-S4-9`.** | | |

**The rule reproduces the matrix's authority on both rows.** `FL-S4-8`/`FL-S4-9` name the **writer**,
which is `08_…md`'s `W` annotation — and by §3.2's published mapping rule, a flow naming a component
that appears in the row's `W` is a **granularity** relation, not a substantive disagreement. **Claim (i)
is dispositioned: no authority change, and the direction is named** — flow names the writer, matrix
names the store.

**Claim (ii) — flow vs. flow, and the trap this item turns on.** `FL-S4-20`, **in the same section of
the same merged document**, names `CMP-S4-9` authoritative *"for the source rows"* — and the source rows
**are** `SC-S3-16`/`SC-S3-17`. So `05_…md` contradicts **itself**, and the matrix agrees with
`FL-S4-20`. §6.2 states in full how this is dispositioned **without editing `05_…md`**.

**Claim (iii) — the substantive residue, and the one thing that genuinely needed revising.** `05_…md`
§3.2 scopes `CMP-S4-9` to *"the only writer of the `public` and `infrastructure` database schemas **on
the request path**"* — while both tables are written from **pino transport worker threads**, which is
**not** the request path. SUB-14 is right that the matrix's row, as authored, stretches `CMP-S4-9`'s
stated charter. **This is a defect in the row's `Writes` attribute — its write-path description — not in
its authority**, and §6.1 revises it on exactly that basis.

### 5.5 `F-S14-9` — the drift-verdict cache: the matrix is `05_…md`'s own reading

`FL-S4-14` names `CMP-S4-18` authoritative *"for the stored verdict and its date"*; the matrix names
`CMP-S4-17` and demotes `CMP-S4-18` to *holder*. **Re-running the rule:** `SC-S3-33` is placed in a gate
component's read set by `05_…md` §7.3's quarantine disposition, so **clause 2 matches** — gate-bearing,
authority is the gate-side component. Two components plausibly own it (`CMP-S4-17` produces the verdict,
`CMP-S4-18` holds the cache), so **tie-break (c)** applies: *"neither → the component that **produces**
the row wins"* → **`CMP-S4-17`**. The rule reproduces the matrix.

**Disposition: no change.** And the corroboration is inside `05_…md` itself: **`FL-S4-13`, same document,
same section, already calls `CMP-S4-17` the cache's *only writer*.** `03_…md` §4.3 agrees — the cache is
internal, keyed-read-only, computes nothing, *"never derives, refreshes or ages"* a verdict. So the
matrix's assignment is the reading consistent with `05_…md`'s own §5, and **`FL-S4-14` is the outlier**.

**Direction named: the flow names the holder, the matrix names the producer.** Neither artifact is
amended; the outlier is re-routed as part of `F-S16-4`. The consequence of leaving it silently
unreconciled is concrete and is why it is recorded rather than dropped: a reader taking `FL-S4-14` at
face value would conclude the cache may be written by whoever holds it — **exactly the property
`FL-S4-13`'s single-writer rule exists to deny.**

### 5.6 `F-S14-10` — the gate verdict: the matrix is ahead, and `05_…md` stays as written

`FL-S4-16` records the gate-verdict authority as **"Undetermined"**, citing `OI-S2-2` as open and owned
by SUB-13 (NEU-977), and filing `F-S4-3`. **Re-running the rule:** `08_…md` §6's by-id membership check
places `SC-S3-35` in `CMP-S4-14`'s *"Demanded by"* read set, so **clause 2 matches** and the authority is
the gate-side component on the authoring path per `BND-S4-4` → **`CMP-S4-14`**, with `CMP-S4-15` as `W`.
The rule reproduces the matrix, and SUB-13's §12 already records this as discharging `F-S4-3` and
closing `OI-S2-2`.

**Disposition: no change to the row.** **Direction: matrix → flow.** `05_…md` is stale on this one row —
and it is stale **correctly**: it was written before the resolution existed and it named the party that
would resolve it rather than narrating past the gap, which is the behaviour this package wants. **It is
not amended here**; the staleness is recorded and re-routed as part of `F-S16-4`, so it is **owned and
scheduled rather than left as a silent inconsistency** a later reader resolves by assuming the older
document is authoritative.

### 5.7 A finding this chapter raises about its own input: the tracker-id drift

Recorded here rather than only in the register, because it affects how every one of the eleven records
above is read. **SUB-14 writes `SUB-16 (NEU-980)` in 16 places across 5 merged files.** The tracker
records **`NEU-979` = SUB-16** (this sub-task) and **`NEU-980` = SUB-7** (*"Define the general web API's
scope, its negative boundary, and its resource-level inventory"*). Every `NEU-980` in the package that
is paired with **SUB-7** is correct; every one paired with **SUB-16** is not.

This is the same class as **`F-S3-2`**, where SUB-2 wrote `NEU-987` for `NEU-977` in 13 places across 6
merged files — and it is the second sighting of that class, which is itself worth recording. **Filed as
`F-S16-1`**, owner **SUB-12 (NEU-986)** at the completeness gate. **The 16 instances are not repaired
here**: the files are merged and the discipline is append-only, so the finding is the correction. **This
chapter writes only the correct ids** — SUB-16 is NEU-979, SUB-7 is NEU-980 — and a reader who follows
`NEU-980` out of `09_…md` §17 or `02_findings-register.md` `### SUB-14` lands on SUB-7, not here.
