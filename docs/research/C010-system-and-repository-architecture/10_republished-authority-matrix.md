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
(NEU-985)'s audits and SUB-12 (NEU-986)'s completeness gate, and so does every downstream
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
| Open items received alongside them | **1** — `OI-S14-1`, dispositioned separately at §5.8 |
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
| `F-S14-2` | adjudication order (SUB-5) | **No change to any row; a reading constraint published at the census.** Both census tables in §8 carry `fails-principal: 0` annotated **`UNREACHED — not passed`** in the cell itself, so the number cannot be read bare. | **SUB-11 (NEU-985)** for the audits that consume the distribution; **NEU-893** owns the `sub`/`azp` defect | none — a property of both censuses, not of a row |
| `F-S14-3` | **SUB-6's model, clause 4** | **Re-routed to SUB-6 as `F-S16-2`; no answer arrives inside this pass, so carried as `CAP-S16-1` with a named owner.** The assignment is **not** revised: re-running clause 4 reproduces `CMP-S4-10`. §5.3. | **SUB-6 (NEU-976)** | `SC-S3-45` — authority unchanged, `noted` |
| `F-S14-4` | pending decision | **No change; carried as a named residual at the row** (§9). The row's own Consistency cell already names NEU-891 as the decider, and a matrix that guessed which way would be worse than one that routes. | **NEU-891** | `SC-S3-42` — divergence outcome stays **UNDEFINED**, `noted` |
| `F-S14-5` | pending decision | **No change; carried as a named residual at the row** (§9). Aggregate-vs-append is a store-shape decision, and `09_…md` §13.2 already checked that NEU-890's durability property survives **either** resolution. | **SUB-10 (NEU-984)** | `SC-S3-31` — conflicting-write outcome stays **UNDEFINED**, `noted` |
| `F-S14-6` | model consequence (SUB-6) | **No change; the reading is recorded** (§5.1). Re-running clause 3 reproduces zero: `07_…md` §6.3's enumerated list is **empty under `M-A`**, so no row can take the presentation exception, and `CMP-S4-3` holds 0 of 45 **by construction**. `FL-S4-2` describes a display relationship, not a state authority. | **SUB-16 (NEU-979)** — discharged here; consumer **SUB-7 (NEU-980)**, which must not mis-scope web-tier work on the assumption `CMP-S4-3` holds something | none — `CMP-S4-3` holds zero rows, before and after |
| `F-S14-7` | assignment consistency | **No authority revised — the apparent inconsistency dissolves under the rule's own ordering** (§5.2). Re-running `07_…md` §6.1 first-match-wins: `SC-S3-26` is process-local, so **clause 1 matches and clause 4 is never reached**; `SC-S3-45` is not process-local, so clause 1 falls through and **clause 4 matches**. Two different clauses, not two different judgements. An ordering note is recorded at both rows; the clause-order question is re-routed to SUB-6 as `F-S16-3`. | **SUB-16 (NEU-979)** for the disposition; **SUB-6 (NEU-976)** for `F-S16-3` | `SC-S3-26` (clause 1 → `CMP-S4-4`) and `SC-S3-45` (clause 4 → `CMP-S4-10`) — **both authorities unchanged**, both `noted` |
| `F-S14-8` | flow-vs-flow + flow-vs-matrix | **Authority confirmed by re-running clause 5; the *write path* revised; `05_…md` not edited** (§5.4, §6.1, §6.2). The intra-`05_…md` contradiction is **named and dispositioned, never silently reconciled**, and is re-routed as `F-S16-4`. | **SUB-16 (NEU-979)** for the matrix half; **SUB-4 (NEU-974)** for the `05_…md` half via `F-S16-4`; consumer **SUB-11 (NEU-985)** | `SC-S3-16`, `SC-S3-17` — **`revised`** (Writes, Consistency, Observability re-authored; **authority unchanged**) |
| `F-S14-9` | flow-vs-flow + flow-vs-matrix | **No change — the matrix is the reading consistent with `05_…md`'s own §5** (§5.5). Re-running clause 2 with tie-break (c) reproduces `CMP-S4-17`, and `FL-S4-13` — same document, same section — already calls `CMP-S4-17` the cache's **only writer**, so `FL-S4-14` is the outlier. Direction named; neither artifact amended. | **SUB-16 (NEU-979)**; the `05_…md` half re-routed to **SUB-4 (NEU-974)** via `F-S16-4`; consumer **SUB-11 (NEU-985)** | `SC-S3-33` — authority unchanged (`CMP-S4-17`), `noted` |
| `F-S14-10` | resolution not propagated | **No change to the row — the matrix is ahead and correct** (§5.6). Re-running clause 2's by-id membership check reproduces `CMP-S4-14`: `05_…md` places `SC-S3-35` in `CMP-S4-14`'s "Demanded by" read set. `FL-S4-16`'s *"Undetermined"* is stale, recorded with direction **matrix → flow**, and **not amended** — the disposition is the correction. | **SUB-16 (NEU-979)**; the staleness re-routed to **SUB-4 (NEU-974)** via `F-S16-4` | `SC-S3-35` — authority unchanged (`CMP-S4-14`, clause 2, `W = CMP-S4-15`), `noted` |
| `F-S14-11` | vocabulary gap between `05_…md` and `08_…md` | **No change to any row; the vocabulary mapping is published at §3.2**, which is precisely what the finding asks for, and SUB-14's carried recommendation — *"publish the vocabulary mapping; amend neither artifact"* — is **adopted, not overridden**. All five pairings fall on the granularity side of the published rule. | **SUB-16 (NEU-979)**; consumer **SUB-11 (NEU-985)**, so its mechanical audits do not re-report the five | `SC-S3-13`, `SC-S3-1`, `SC-S3-2`, `SC-S3-32`, `SC-S3-44`, `SC-S3-41`, `SC-S3-37` — none revised; each already carries the flow's component in its `W` |

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
   SUB-12 (NEU-986).

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

**The same drift runs through SUB-14's consumer table in a second, independent pairing.** `09_…md` §17
writes **`SUB-11 (NEU-983)`** and **`SUB-12 (NEU-985)`**; the tracker records **SUB-11 = `NEU-985`**
(*"Run the package's mechanical audits…"*), **SUB-12 = `NEU-986`** (*"Close the package…"*) and
**`NEU-983` = SUB-9** (*"Decide the repository topology…"*). Counting both pairings, the drift stands at
**24 instances across 5 merged files**: 16 × `SUB-16 (NEU-980)`, 7 × `NEU-983 (SUB-11)`, 1 ×
`SUB-12 (NEU-985)`. The earlier chapters are **correct** — `04_…md` §7, `07_…md` §7 and `90_…md` all
write `SUB-11 (NEU-985)` and `SUB-12 (NEU-986)`, and `05_…md` §7 correctly pairs `NEU-983` with SUB-9 —
so this is drift introduced at SUB-14, not a package-wide convention.

This is the same class as **`F-S3-2`**, where SUB-2 wrote `NEU-987` for `NEU-977` in 13 places across 6
merged files — and it is the second sighting of that class, which is itself worth recording. **Filed as
`F-S16-1`**, owner **SUB-12 (NEU-986)** at the completeness gate. **The 24 instances are not repaired
here**: the files are merged and the discipline is append-only, so the finding is the correction. **This
chapter writes only the correct ids** — SUB-16 is NEU-979, SUB-7 is NEU-980, SUB-9 is NEU-983,
SUB-11 is NEU-985, SUB-12 is NEU-986 — and a reader who follows `NEU-980` out of `09_…md` §17 or
`02_findings-register.md` `### SUB-14` lands on SUB-7, not here. **A downstream consumer that routes by
tracker id rather than by sub-task label will mis-deliver three of SUB-14's four handoffs**, which is why
this is a finding and not a typo.

### 5.8 `OI-S14-1` — the open item SUB-14 left for this pass, answered

SUB-14 filed one open item and named SUB-16 its owner: *"this chapter validates `08_…md` at its
`pre-validation` revision. SUB-7, SUB-8 and SUB-10 consume SUB-16's post-absorption revision, not that
one. Whether absorbing the eleven findings changes any verdict here — and therefore whether this record
must be re-run against the republished matrix — is **not decidable until SUB-16 publishes**."*

**It is decidable now, and the answer is no: no verdict changes, and `09_…md`'s validation record does
not need re-running against this revision.**

The reasoning is mechanical, published at **§8.1** so SUB-11 and SUB-12 can check it rather than take
it: ten of the eleven dispositions change **nothing** on any row; the eleventh revises **`Writes`,
`Consistency` and `Observability`** on two rows and leaves the authority, the clause, the
`Learner-scoped` value and the status marking untouched; **no row was split, merged, added or removed**;
and **the write path a durable append is issued from is an input to none of `I1`–`I5`**. §7 re-proves
mechanically that the 45-row domain and the exactly-one property survived, which is the structural
change that *could* have moved a verdict and did not.

**`OI-S14-1` is therefore closed here**, with its answer recorded rather than asserted. Consumers
**SUB-11 (NEU-985)** and **SUB-12 (NEU-986)** may consume `09_…md` §15 directly against the
`post-validation` revision. **The dispositions are not thereby validated** — §7's audits prove the
matrix's two structural properties, not that a disposition was the right call; that judgement is
SUB-11's, and `OI-S16-1` records the one place this chapter could not close a loop itself.

---

## 6. The row revisions

**Two rows are revised: `SC-S3-16` and `SC-S3-17`.** Both revisions cite **clause 5** of `07_…md` §6.1
as the basis for the authority, and both re-author **all nine** of `OUT-3`'s attributes. **Neither
revision changes an authority** — §5.4 claim (i) shows the rule reproduces `CMP-S4-9` on both rows. What
is revised is the **`Writes` attribute's description of the write path**, plus the two attributes that
depended on it (`Consistency`, `Observability`).

**Why this is a revision and not a re-decision.** Clause 5's demonstration form in `07_…md` §6.2 reads
*"`CMP-S4-9`, written through `CMP-S4-7`"*. SUB-13 already deviated from that form on these two rows,
writing *"written through `CMP-S4-19`"* — correctly, because the sinks do the writing. What SUB-13's
rows did **not** say is that the write is therefore **off `CMP-S4-7`'s request path entirely**, which is
what makes `05_…md` §3.2's request-path scoping of `CMP-S4-9` sit awkwardly against them. **`F-S14-8`
claim (iii) is right about that, and it is a write-path description defect.** The revision states the
deviation explicitly instead of leaving a reader to reconcile two documents in their head. The
authority, the clause, the status marking and every input to `I1`–`I5` are untouched.

### 6.1 `SC-S3-16` — MCP request log · **revised**

**Authority: `CMP-S4-9`** (persistence adapters and Postgres) — **unchanged**.
**Clause 5**, re-derived at §5.4 claim (i): `Learner-scoped: question — open`, which is inside the
invariant's domain, and clauses 1–4 do not match. `04_…md` records that the table **holds learner
payload** (`response_body` and `params` carry learner-facing text and learner free-text answers) while
carrying **no principal field** — which is precisely why the scoping question is open rather than `no`.
**Status: `existing`** — unchanged, per `04_…md`'s marking.
**Revision basis: `07_…md` §6.1 clause 5. Revised attributes: Writes, Consistency, Observability.**

| Attribute | Value |
| --- | --- |
| Reads | Operators, for incident investigation. No component reads it on the request path. |
| Writes | **`CMP-S4-9`**, issued through **`CMP-S4-19`** (operational logging sinks) — **from a pino transport worker thread, not on `CMP-S4-7`'s request path.** *(Revised.)* Clause 5's demonstration form in `07_…md` §6.2 writes *"written through `CMP-S4-7`"*; **that form does not describe this row**, and the deviation is recorded rather than assumed. `05_…md` §3.2 scopes `CMP-S4-9` to *"the only writer of the `public` and `infrastructure` database schemas **on the request path**"*, so **this row's write is outside the sentence that scopes its own authority** — the divergence `F-S14-8` claim (iii) identifies. **The deviation is in the write path, never in the authority**: clause 5 names `CMP-S4-9` on the row's own `Learner-scoped` cell, and no clause conditions authority on which thread issues the write. `CMP-S4-19` remains a `W` annotation and **never a second authority**. Appended per request, never mutated. |
| Consistency | Best-effort by design. `CMP-S4-19` fails open: an unavailable log sink must never fail a learner's request. A missing log line is acceptable; a failed request because of logging is not. **Added at this revision:** because the write is issued off the request path, it is **not** inside the request's unit of work — a committed request and its log line are **not** atomic in either direction, and no consumer may infer one from the other. |
| Freshness | No bound. Nothing reads it synchronously. |
| Concurrency | Appends do not conflict. |
| Conflict handling | None; append-only with no update path. |
| Recovery | **Lossy.** Entries buffered in `SC-S3-25` and not yet flushed are lost on crash, and are dropped outright while that sink's breaker is open. The log is evidence, not a ledger, and must not be treated as complete. Recovery class **R5** — not recoverable (`09_…md` §11). |
| Migration path | The category stays where it is. **The gap that needs a path is a principal field**: `05_…md` §9.2 states that adding one (or giving `SC-S3-45` a store) is what turns the deletion owner from *unassignable* into merely *unassigned*, and only then can it be assigned. Until then, `CAP-S4-1` stands — **structural, and not closed here** — and `F-S3-3`'s retention gap has no owner. **A path, never DDL**: this row names what must become true, not the statement that would make it so. |
| Observability | The table is itself the primary observability substrate. It has **no** observability of its own: there is no counter for entries dropped while the breaker was open, so the lossiness above is invisible in production. **Added at this revision:** the same absence hides the write-path divergence recorded in `Writes` — nothing emits a signal that distinguishes a worker-thread write from a request-path one, so an operator cannot observe which path a given line took. |

**Isolation state, carried from `09_…md` §15.1 and unchanged by this revision:** Census A
`not-evaluable`, Census B `not-evaluable`. Cause under both: **portless attribution residue** — no
principal attribution exists **and** the table sits behind no port, so `OUT-2`'s mechanism cannot reach
it (`OI-S5-1`). **No ownership column is described as present.** **No HTTP-qualified claim is made about
this row**, because it has no transport-dependent verdict: its Census-A and Census-B verdicts are
identical and neither is `fails-transport`. Divergence, conflicting-write and interruption outcomes all
**defined**; recovery class **R5**.

### 6.2 `SC-S3-17` — Operation event log · **revised**

**Authority: `CMP-S4-9`** — **unchanged**.
**Clause 5**, re-derived at §5.4 claim (i): `Learner-scoped: question — open` (the `data` payload column
is potentially learner payload). **Clause 2 was re-tested and does not match**: `05_…md` places
`SC-S3-21`, **not** `SC-S3-17`, in the Tier-2 gate path, and `08_…md` §6's boundary reading —
*"indirect consumption is not membership"* — is **re-affirmed here, not re-litigated**. Treating it as
gate-bearing would be a fresh judgement layered on the rule, which this pass may not make.
**Status: `existing`** — unchanged.
**Revision basis: `07_…md` §6.1 clause 5. Revised attributes: Writes, Consistency, Observability.**

| Attribute | Value |
| --- | --- |
| Reads | `CMP-S4-14`'s Tier-2 blocking-stats query, by raw SQL at `src/adapters/drizzle/tier2-blocking-stats-repository.ts:39`, feeding `SC-S3-21`; operators. |
| Writes | **`CMP-S4-9`**, issued through **`CMP-S4-19`** (`src/transport/pg-event-transport.ts:109`) — **from a pino transport worker thread, not on `CMP-S4-7`'s request path.** *(Revised, on the same basis as `SC-S3-16`.)* Clause 5's *"written through `CMP-S4-7`"* demonstration form **does not describe this row**. **The deviation is in the write path, never in the authority.** `CMP-S4-19` remains a `W` annotation and **never a second authority**. Appended per event, never mutated. |
| Consistency | Best-effort, fails open, exactly as `SC-S3-16`. **Added at this revision:** the write is not inside the originating operation's unit of work, so an event's presence is **not** evidence its operation committed, and its absence is **not** evidence the operation did not. This matters more here than at `SC-S3-16` — see Recovery. |
| Freshness | The Tier-2 breaker's read tolerates **60 seconds** of staleness — that is `SC-S3-21`'s cache window, and it is the only freshness requirement any consumer places on this table. |
| Concurrency | Appends do not conflict. The breaker's read is a snapshot query and does not coordinate with writers. |
| Conflict handling | None; append-only. |
| Recovery | **Lossy**, on the same terms as `SC-S3-16`. **This matters more here**: a gap in the event log biases the Tier-2 blocking statistics computed from it, and the bias is silent. **Sharpened at this revision:** because the write is off the request path and fails open, the bias is not merely possible but **structurally undetectable from inside the request** that produced the missing event. `09_…md` §10 flags the adjacent restart hazard — a restart un-trips the breaker (`SC-S3-21`) — and the two compound. Recovery class **R5**. |
| Migration path | As `SC-S3-16` — the missing principal field is the blocker, per `05_…md` §9.2 and `CAP-S4-1`. **A path, never DDL.** |
| Observability | Consumed by `SC-S3-21`, which is the only automated consumer. No signal exists for dropped events, so a breaker-open window looks identical to a quiet period. **Added at this revision:** and because the write path is a worker thread rather than the request path, no request-scoped correlation signal ties a dropped event back to the operation that should have emitted it — so the gap is invisible from both ends. |

**Isolation state, carried from `09_…md` §15.1 and unchanged by this revision:** Census A
`not-evaluable`, Census B `not-evaluable`, cause **portless attribution residue** under both. **No
ownership column is described as present.** **No HTTP-qualified claim is made about this row** — its two
census verdicts are identical and neither is `fails-transport`. All four walk outcomes **defined**;
recovery class **R5**.

### 6.3 How `F-S14-8`'s intra-`05_…md` contradiction is dispositioned **without editing `05_…md`**

**The contradiction, stated exactly.** Inside `05_…md` §5 — one section of one merged document —
`FL-S4-8` and `FL-S4-9` name **`CMP-S4-19`** authoritative for what is stored in `SC-S3-16`/`SC-S3-17`,
while **`FL-S4-20` names `CMP-S4-9` authoritative *"for the source rows"*** — and the source rows **are**
`SC-S3-16` and `SC-S3-17` (`FL-S4-20`'s own value column reads *"Batch read of `SC-S3-16`/`SC-S3-17`
under an allowlist"*). This is the package's **first intra-document authority contradiction**, and it
exists independently of the matrix.

**Why it is not repaired by an edit.**

1. **`05_…md` is merged, and this package's discipline is append-only.** `00_method-and-provenance.md`
   fixes that discipline for `02_`, `90_`, `91_` and `92_`, and `09_…md` §12 states the reason it
   extends to the chapters themselves: *"`05_…md` is merged and `08_…md` is merged, and silently
   reconciling one to the other would **destroy the record of which one was written first and on what
   evidence**."* An edit would make the package *look* consistent while deleting the evidence that it
   once was not — which is the opposite of what a research package is for.
2. **SUB-14 deliberately amended neither artifact**, and neither `05_…md` nor `08_…md` appears in its
   changed-file set. It routed instead. This chapter keeps that discipline rather than being the first
   pass to break it.
3. **SUB-14's phrase *"`05_…md`'s half is SUB-16's to amend"* assigns ownership of the outcome, not a
   licence to rewrite a sibling's merged chapter.** Read against §12's own prohibition in the same
   document, the only reading that does not make `09_…md` contradict itself is: SUB-16 owns **closing
   the question**, and the mechanism available to it is publication, not revision. **The finding and its
   disposition are the correction.**

**The disposition, therefore.**

| What | Disposition |
| --- | --- |
| **The direction** | **Named, not smoothed over.** `FL-S4-8`/`FL-S4-9` name the **writer** (`CMP-S4-19`); `FL-S4-20` and the matrix name the **store** (`CMP-S4-9`). |
| **Which side the rule supports** | **`FL-S4-20` and the matrix.** Re-running `07_…md` §6.1 clause 5 against each row's own cells reproduces `CMP-S4-9` (§5.4 claim (i)). The rule is the arbiter, not this chapter's preference. |
| **Which side `05_…md`'s own vocabulary supports** | **Both, on different questions.** Under §3.2's published mapping, `CMP-S4-19` is the row's `W` — the component that writes — so `FL-S4-8`/`FL-S4-9` are a **granularity** statement about the write hop, and `FL-S4-20` is an **authority** statement about the store. Read through the mapping, `05_…md` is **less contradictory than it looks** — but it is not *not* contradictory, because `FL-S4-8`/`FL-S4-9` use the word "authoritative", and that is `05_…md`'s authority vocabulary, not its `W` vocabulary. |
| **The residue** | **`05_…md` §5 carries two annotations that a reader cannot reconcile from that document alone.** That is real, it is recorded, and it is **not** fixed here. |
| **Where it goes** | **`F-S16-4`**, owner **SUB-4 (NEU-974)** for the flow half, consumer **SUB-11 (NEU-985)**, whose cross-cutting audit can check flow-vs-flow consistency mechanically. |
| **What is edited** | **Nothing.** `05_…md` is byte-identical after this pass. So are `08_…md` and `09_…md`. |

**The same treatment is applied to every other flow discrepancy** — `F-S14-6`, `F-S14-7`, `F-S14-9`,
`F-S14-10`, `F-S14-11`. In each, the direction is named, the disposition is published, and **neither
side is silently reconciled**. `F-S16-4` carries the three that leave a residue in `05_…md`
(`FL-S4-8`/`FL-S4-9` vs `FL-S4-20`; `FL-S4-14` vs `FL-S4-13`; `FL-S4-16`'s staleness); `F-S14-6` and
`F-S14-11` leave none, because §5.1 and §3.2 close them by publication.

### 6.4 Rows carrying a disposition note but **no** revision

Six rows are `noted`: this chapter records a disposition at them, and changes nothing. They are listed
so a reader is not left wondering whether a finding touched a row silently.

| Row | Note recorded | From |
| --- | --- | --- |
| `SC-S3-26` | Clause **1** fires and clause 4 is never reached — the row's authority `CMP-S4-4` is the in-process cache holder, and the *key material*'s external authority is already carried in the row's own Freshness cell. Not in conflict with `SC-S3-45`. | `F-S14-7` / §5.2 |
| `SC-S3-45` | Clause **4** fires because clause 1 falls through. Authority `CMP-S4-10` confirmed. **Structurally incapable of `holds` under any target state** — `CAP-S16-1`, owner SUB-6 (NEU-976). | `F-S14-7` / §5.2 and `F-S14-3` / §5.3 |
| `SC-S3-33` | Clause **2 → tie-break (c)** reproduces `CMP-S4-17`. `FL-S4-14` is the outlier against `FL-S4-13` in its own document; direction named, nothing amended. `F-S13-1` (SUB-13's own tie-break disclosure) remains open, owner SUB-6. | `F-S14-9` / §5.5 |
| `SC-S3-35` | Clause **2** reproduces `CMP-S4-14`, `W = CMP-S4-15`. Direction **matrix → flow**: `FL-S4-16`'s *"Undetermined"* is stale and stays as written. | `F-S14-10` / §5.6 |
| `SC-S3-42` | Divergence outcome remains **UNDEFINED**; the hint-usage/mastery inclusion rule is NEU-891's. Residual, §9. | `F-S14-4` |
| `SC-S3-31` | Conflicting-write outcome remains **UNDEFINED**; aggregate-vs-append is SUB-10's store-shape decision. NEU-890's durability property survives **either** resolution (`09_…md` §13.2). Residual, §9. | `F-S14-5` |

**The stand-ins these rows rest on are cited at the row that decided them**, per SUB-1's register —
**`A-25`** (per-learner, per-node tutoring interaction state with sub-second read latency) at
`SC-S3-42`, whose tolerance envelope admits *"any number of escalation levels"* so **no point inside the
envelope resolves `F-S14-4`**, and whose invalidating outcome (synchronous multi-turn AI orchestration
inside a gate-bearing write path) would make it worse; **`A-27`** (UI interaction state that is not
gate-bearing) at `SC-S3-43`, which is the row clause 3 would have taken had `07_…md` §6.3's list not
been empty under `M-A`; **`A-28`** at `SC-S3-45`, whose invalidating outcome — *safe isolation requires a
separate deployment or datastore* — is the one outcome that would relocate this matrix's assignments
rather than correct them locally; and **`A-29`** (no continuous bidirectional handoff sync) at
`SC-S3-44`. **`93_…md` is CLOSED and is cited, never appended to.**

## 7. The two audits, re-run over the republished revision

**Both audits below were re-run mechanically over §8's table** — the table that *is* this revision — by
parsing its rows and their `**Authority**` and `Clause` cells, and by re-extracting the domain from
`04_…md`. **Neither result is inherited from `08_…md` §10.** That distinction is the point of the
exercise: a revision that repaired an invariant failure by **splitting or merging a row** would break
either property while every individual row still looked correct, and only a re-run catches it. This
revision split and merged nothing — but that is the audits' **output**, not their premise.

*(§7 precedes §8 so the properties are proved before the table is read; the parse ran over §8's table
as it stands in this file, and any consumer can reproduce it with the same filter — table rows matching
`` | `SC-S3-<n>` | `` with exactly nine columns.)*

### 7.1 The exactly-one-authority audit — re-proved

This is `OUT-3`'s first required audit.

| Measure | Count | vs. `08_…md` §10.1 |
| --- | --- | --- |
| Category rows in the republished matrix | **45** | same |
| Rows with **zero** authorities | **0** | same |
| Rows with **two or more** authorities | **0** | same |
| Rows with **exactly one** authority | **45** | same |
| Distinct `SC-S3-*` ids | **45** (duplicates: **0**) | same |
| Rows whose authority is **not** a `CMP-S4-*` id | **0** | same |

**Verdict: pass, re-proved on this revision.** Every one of the 45 categories names exactly one
authority, and every authority is a component id from `05_…md` §3 — **no role names, no zone-only
owners, no shared authorities.** The `W` annotations were excluded by construction, as `08_…md` §9
requires: on `SC-S3-13` and `SC-S3-44` the `W` cell reads *"enforced at `CMP-S4-4`"* and names a second
component id, and neither row counts as two-authority, because `W` **is an annotation, never a second
authority**.

**Scope note, published so the two numbers are not confused.** The audit above runs over **all 45**
rows. Clause 1 additionally removes its rows from the audit's *write* scope, because a process-local or
derived-on-read category has no durable write to attribute:

| Measure | Count |
| --- | --- |
| Rows recording `— non-durable` as their write path (clause 1) | **13** — `SC-S3-18` … `SC-S3-30` |
| Rows with a durable write to attribute | **32** |

**45 rows, 45 authorities, 32 durable writes.** Reporting only the second would look like a matrix of 32
rows; reporting only the first would suggest 13 rows have no authority. Neither is true.

**Two distributions re-derived from the same parse**, because they are the two figures a later reader
is most likely to re-litigate:

| Clause | Rows | | Authority | Rows |
| --- | --- | --- | --- | --- |
| 1 — Non-durable | 13 | | `CMP-S4-9` | 21 |
| 2 — Gate-bearing | 3 | | `CMP-S4-7` | 9 |
| **3 — Presentation exception** | **0** | | `CMP-S4-4` | 5 |
| 4 — Identity mapping | 1 | | `CMP-S4-14` | 4 |
| 5 — In the invariant's domain | 20 | | `CMP-S4-17` | 2 |
| 6 — Default | 8 | | `CMP-S4-19` | 2 |
| **Total** | **45** | | `CMP-S4-8` | 1 |
| | | | `CMP-S4-10` | 1 |
| | | | **Total** | **45** |

**Clause 3 → 0 and `CMP-S4-3` → 0 rows are re-proved here**, which is `F-S14-6`'s disposition made
mechanical rather than merely argued (§5.1).

### 7.2 The state-inventory ↔ matrix audit — re-proved, both directions

This is `OUT-3`'s second required audit — *that every inventory row appears in the matrix and every
matrix row appears in the inventory.* It is run in **both directions** and both counts are published,
because a one-directional check would pass on a matrix that silently invented a category.

**This audit is not SUB-7's.** §3.1 names the two apart: this one compares the matrix against
**`04_…md`'s state-category inventory**; SUB-7's `OUT-5` cross-check compares it against a **web-API
resource inventory that does not exist yet**. Neither substitutes for the other, and SUB-7's is not run
or claimed here.

| Direction | Unmatched count | Routing rule if non-zero | Named owner if non-zero |
| --- | --- | --- | --- |
| `04_…md` §3 → this matrix (an inventory category with no row) | **0** | Held here — a missing row is this chapter's defect, and the remedy is to **author** it, never to narrow the domain. | **SUB-16 (NEU-979)** |
| This matrix → `04_…md` §3 (a matrix row with no inventory category) | **0** | Routed as a finding against `04_…md` — a row the matrix believes exists but the inventory does not carry is an inventory-completeness question, and `04_…md` §7.3 already states what would falsify its completeness claim. | **SUB-3 (NEU-973)** |

**Verdict: pass, both directions, zero unmatched — re-proved on this revision.** The domain was
re-extracted **independently of the matrix**: every `SC-S3-<n>` token in `04_…md`, filtered to the
strictly numeric form, yields **45 distinct ids, minimum 1, maximum 45, no gaps** — agreeing with
`04_…md` §8's own counts table (30 `existing` + 11 `required-by-upstream` + 4 `assumed` = 45) and with
this chapter's own status distribution (§8). **There is no unmatched item in either direction and
consequently no item to route**; the routing rules and owners above are published so the audit is
**reproducible rather than merely reported**.

**The mechanical caveat, carried forward for whoever re-runs this:** `04_…md` §2 contains the bare
template token `SC-S3-<k>`, which a naive `SC-S3-` extraction picks up as a valueless match and which
corrupts a numeric sort. **It is still present** — this run confirmed it — so filter to the strictly
numeric form before counting.

### 7.3 What neither audit checks — stated so the pass verdicts are not over-read

Neither audit checks that a recorded authority is the **right** one — only that there is exactly one,
that it is a real component id, and that the row set matches the inventory. **The question of whether
the authority is right is what SUB-14 answered** (cause tally: SUB-13's assignment, 0 / 0) and what §5
dispositions. Neither audit checks a **verdict**, a **walk outcome**, or a **disposition**: §7 proves
the matrix's two structural properties survived republication, and nothing more.

---

## 8. The republished matrix in one table, with both censuses carried forward

**This table is the republished revision.** It is what §7's two audits run over, and what SUB-7, SUB-8
and SUB-10 resolve a row against. `W` names the write path where `08_…md` §8 records one; **it is an
annotation, never a second authority**, and the exactly-one audit does not count it.

**`Rev`** is this chapter's per-row revision state: **`carried`** (unchanged from `08_…md`),
**`noted`** (unchanged, with a disposition note at §6.4), **`revised`** (attributes re-authored at §6).

**Census A** = target state **(b)** — the category's row plus its named authority, as it stands.
**Census B** = target state **(c)** — *composed*: Census A **plus** NEU-850's `OUT-2` implemented in
full (an ownership key on every learner-scoped durable `public`-schema store, threaded through the
row-owning repository ports) **and nothing else**. **The two are never summed.** Both are carried from
`09_…md` §15.1 unchanged — see §8.1 for why that carry-forward is sound rather than assumed.

| Id | Category | **Authority** | W | Clause | Status | Rev | Census A (b) | Census B (c) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `SC-S3-1` | Topic record | `CMP-S4-9` | `CMP-S4-13` / `CMP-S4-7` | 5 | `existing` | carried | not-evaluable | fails-confinement |
| `SC-S3-2` | Chunk content record | `CMP-S4-9` | `CMP-S4-13` / `CMP-S4-7` | 5 | `existing` | carried | not-evaluable | fails-confinement |
| `SC-S3-3` | Per-chunk SM-2 scheduling state | `CMP-S4-9` | `CMP-S4-7` | 5 | `existing` | carried | not-evaluable | fails-confinement |
| `SC-S3-4` | Content-audit verdict | `CMP-S4-7` | `CMP-S4-14` → `CMP-S4-9` | 6 | `existing` | carried | not-applicable | not-applicable |
| `SC-S3-5` | Learning-session record | `CMP-S4-9` | `CMP-S4-7` | 5 | `existing` | carried | not-evaluable | fails-confinement |
| `SC-S3-6` | Session-chunk teaching state | `CMP-S4-9` | `CMP-S4-7` | 5 | `existing` | carried | not-evaluable | fails-confinement |
| `SC-S3-7` | Session question | `CMP-S4-9` | `CMP-S4-7` | 5 | `existing` | carried | not-evaluable | fails-confinement |
| `SC-S3-8` | Question→chunk assessment mapping | `CMP-S4-7` | `CMP-S4-9` | 6 | `existing` | carried | not-applicable | not-applicable |
| `SC-S3-9` | Attempt and grade record | `CMP-S4-9` | `CMP-S4-7` | 5 | `existing` | carried | not-evaluable | fails-confinement |
| `SC-S3-10` | Pre-review scheduling snapshot (NEU-844) | `CMP-S4-9` | `CMP-S4-7` | 5 | `existing` | carried | not-evaluable | fails-confinement |
| `SC-S3-11` | Grade-revision audit trail | `CMP-S4-9` | `CMP-S4-7` | 5 | `existing` | carried | not-evaluable | fails-confinement |
| `SC-S3-12` | Notes | `CMP-S4-9` | `CMP-S4-7` | 5 | `existing` | carried | not-evaluable | fails-confinement |
| `SC-S3-13` | Context tokens | `CMP-S4-9` | `CMP-S4-7`; enforced at `CMP-S4-4` | 5 | `existing` | carried | not-evaluable | fails-confinement |
| `SC-S3-14` | Linter validation corpus | `CMP-S4-7` | `CMP-S4-9` | 6 | `existing` | carried | not-applicable | not-applicable |
| `SC-S3-15` | Per-rule validation report | `CMP-S4-7` | `CMP-S4-9` | 6 | `existing` | carried | not-applicable | not-applicable |
| `SC-S3-16` | MCP request log | `CMP-S4-9` | `CMP-S4-19` | 5 | `existing` | **revised** | not-evaluable | not-evaluable |
| `SC-S3-17` | Operation event log | `CMP-S4-9` | `CMP-S4-19` | 5 | `existing` | **revised** | not-evaluable | not-evaluable |
| `SC-S3-18` | MCP transport registry | `CMP-S4-4` | — non-durable | 1 | `existing` | carried | not-applicable | not-applicable |
| `SC-S3-19` | Subject-binding map | `CMP-S4-4` | — non-durable | 1 | `existing` | carried | fails-transport | fails-transport |
| `SC-S3-20` | Rate-limit windows | `CMP-S4-4` | — non-durable | 1 | `existing` | carried | fails-transport | fails-transport |
| `SC-S3-21` | Tier-2 breaker trip set + stats cache | `CMP-S4-14` | — non-durable | 1 | `existing` | carried | not-applicable | not-applicable |
| `SC-S3-22` | Request context and correlation id | `CMP-S4-4` | — non-durable | 1 | `existing` | carried | not-applicable | not-applicable |
| `SC-S3-23` | Database client singletons | `CMP-S4-9` | — non-durable | 1 | `existing` | carried | not-applicable | not-applicable |
| `SC-S3-24` | Event-logger sink toggle | `CMP-S4-19` | — non-durable | 1 | `existing` | carried | not-applicable | not-applicable |
| `SC-S3-25` | Transport batch buffers + per-sink breakers | `CMP-S4-19` | — non-durable | 1 | `existing` | carried | not-applicable | not-applicable |
| `SC-S3-26` | JWKS remote key set | `CMP-S4-4` | — non-durable | 1 | `existing` | **noted** | not-applicable | not-applicable |
| `SC-S3-27` | Classifier per-field model cache | `CMP-S4-14` | — non-durable | 1 | `existing` | carried | not-applicable | not-applicable |
| `SC-S3-28` | Mastery level | `CMP-S4-7` | — non-durable | 1 | `existing` | carried | not-evaluable | fails-confinement |
| `SC-S3-29` | `LearnerContext` aggregate | `CMP-S4-7` | — non-durable | 1 | `existing` | carried | not-evaluable | fails-confinement |
| `SC-S3-30` | Analytics KPIs and window rollups | `CMP-S4-8` | — non-durable | 1 | `existing` | carried | not-evaluable | fails-confinement |
| `SC-S3-31` | Assessment-evidence record | `CMP-S4-9` | `CMP-S4-7` | 5 | `required-by-upstream` | **noted** | not-evaluable | not-evaluable |
| `SC-S3-32` | Problem-citation record | `CMP-S4-7` | `CMP-S4-13` → `CMP-S4-9` | 6 | `required-by-upstream` | carried | not-applicable | not-applicable |
| `SC-S3-33` | Cached citation-drift verdict | `CMP-S4-17` | held by `CMP-S4-18` | 2 → tb(c) | `required-by-upstream` | **noted** | not-applicable | not-applicable |
| `SC-S3-34` | Citation-drift verdict store | `CMP-S4-17` | — | 6 → tb(c) | `required-by-upstream` | carried | not-applicable | not-applicable |
| `SC-S3-35` | Gate-verdict record | `CMP-S4-14` | `CMP-S4-15` | 2 | `required-by-upstream` | **noted** | not-applicable | not-applicable |
| `SC-S3-36` | Quarantine record | `CMP-S4-14` | — | 2 | `required-by-upstream` | carried | not-applicable | not-applicable |
| `SC-S3-37` | DP-map node + prerequisite-edge records | `CMP-S4-7` | `CMP-S4-13` (import **and re-import**) | 6 | `required-by-upstream` | carried | not-applicable | not-applicable |
| `SC-S3-38` | Per-learner per-node progression | `CMP-S4-9` | `CMP-S4-7` | 5 | `required-by-upstream` | carried | not-evaluable | not-evaluable |
| `SC-S3-39` | Per-learner mastery-gate state | `CMP-S4-9` | `CMP-S4-7` | 5 | `required-by-upstream` | carried | not-evaluable | not-evaluable |
| `SC-S3-40` | Measurement-contract register | `CMP-S4-7` | no in-system copy held | 6 | `required-by-upstream` | carried | not-applicable | not-applicable |
| `SC-S3-41` | Operational-log derived extract `PLA-*` | `CMP-S4-9` | `CMP-S4-20` | 5 | `required-by-upstream` | carried | not-evaluable | not-evaluable |
| `SC-S3-42` | Tutoring / hint interaction state | `CMP-S4-9` | `CMP-S4-7` | 5 | `assumed` — `A-25` | **noted** | not-evaluable | not-evaluable |
| `SC-S3-43` | Web-session / UI interaction state | `CMP-S4-9` | `CMP-S4-7` | 5 | `assumed` — `A-27` | carried | not-evaluable | not-evaluable |
| `SC-S3-44` | Handoff authorization envelope | `CMP-S4-9` | `CMP-S4-7`; enforced at `CMP-S4-4` | 5 | `assumed` — `A-29` | carried | not-evaluable | not-evaluable |
| `SC-S3-45` | Learner-identity → owner mapping | `CMP-S4-10` | projected, never authored, elsewhere | 4 → `F-S13-2` | `assumed` — `A-28` | **noted** | not-evaluable | fails-confinement |

**Status markings are `04_…md`'s, carried through the revision unchanged: 30 `existing`, 11
`required-by-upstream`, 4 `assumed`** — the three-way `existing` / `required-by-upstream` / `assumed`
marking SUB-3 established survives republication on every row, and no row's marking was adjusted to
accommodate a disposition.

### 8.1 Why the censuses carry forward unchanged — checked, not assumed

**A carried-forward verdict is only sound if nothing this chapter did could have moved it.** The check:

| Could this revision have moved a verdict? | Answer |
| --- | --- |
| Did any row's **authority** change? | **No.** All 45 authorities are identical to `08_…md` §9. |
| Did any row's **clause** change? | **No.** The clause distribution is identical (§7.1). |
| Did any row's **`Learner-scoped`** value change? | **No.** `I1`'s input is `04_…md` §3, which this chapter does not touch. |
| Did any row's **status marking** change? | **No.** 30 / 11 / 4, unchanged. |
| Was any row **split, merged, added or removed**? | **No** — 45 in, 45 out. This is the failure mode §7 exists to catch, and it did not occur. |
| Did the two **revised** rows change an input to `I1`–`I5`? | **No.** §6.1/§6.2 revise `Writes`, `Consistency` and `Observability` — descriptive attributes. `I2` asks whether principal attribution exists (it does not, on either row, before or after); `I3` asks whether an access-path set is enumerated (it is not); `I4` asks about transport. **The write path a durable append is issued from is an input to none of the five checks.** |

**Therefore `09_…md` §15.1's per-row verdicts, §15.2's distributions and its cause tally stand over the
post-validation revision, and need not be re-run.** That is also the answer to `OI-S14-1` (§5.8).

### 8.2 The verdict distribution, both censuses, un-collapsed

| Verdict | Census A (b) | Census B (c) |
| --- | --- | --- |
| `not-applicable` | 19 | 19 |
| `not-evaluable` | **24** | 9 |
| `fails-confinement` | 0 | **15** |
| `fails-transport` | 2 | 2 |
| `fails-principal` | **0 — UNREACHED, not passed** (`F-S14-2`) | **0 — UNREACHED, not passed** (`F-S14-2`) |
| `holds` | **0 — forced by `06_…md` §3.4.1, not discovered** | **0 — forced by `06_…md` §3.4.1, not discovered** |
| **Total** | **45** | **45** |

**There is no third column, and no row of this table may be added to another.** The invariant's verdict
is a function of the target state it is evaluated against; a merged census would name no target state
and would therefore be a category error dressed as a number.

**`fails-principal: 0` must be read as "unreached".** `06_…md` §3's adjudication rule is *"the first
failing check names the verdict, stop there"*, and `I5` is **last**. Every in-domain row fails at `I2`,
`I3` or `I4` first, so `I5` is never reached and principal integrity is **never tested** by either
census. The defect `I5` exists to catch is real and merged — `06_…md` §3.6 case 5 records
`jwt-middleware.ts:127`'s `azp` fallback, which lets a client-credentials token resolve to a principal.
**A reader who takes `fails-principal: 0` at face value would conclude the opposite of the truth.** That
is `F-S14-2`, and this annotation is its disposition.

**`holds: 0` is forced.** `06_…md` §3.4.1: *"`I3` may not return `holds` by failing to find a
counter-example."* `holds` requires an **enumerated access-path set covering reads and writes**; none
exists for any category; so the count is **zero**, not "unfalsified". **`CAP-S5-1` stands — this package
does not prove the invariant satisfiable**, and zero `holds` across 90 row-evaluations is consistent
both with unsatisfiability and with a merely-unimplemented mechanism. The census cannot distinguish
them, and this chapter does not claim it can.

### 8.3 The cause tally, both censuses, un-collapsed

| Cause | Owner | Census A | Census B |
| --- | --- | --- | --- |
| Out of the invariant's domain (`I1`, explicit `no` in `04_…md` §3) | — (correctly out of scope) | 19 | 19 |
| **Attribution residue** — no principal attribution exists at all (`I2`); `F-S5-4` | NEU-850 `OUT-2`, then NEU-893 | 11 | 0 |
| **Portless attribution residue** — as above **and** behind no port (`OI-S5-1`) | NEU-850 `OUT-2` / SUB-10 | 2 | 2 |
| **Category does not exist** — `required-by-upstream` or `assumed` | the owning upstream package | 11 | 7 |
| **Confinement residue** — no enumerated access-path set exists (§3.4.1) | **SUB-8 (NEU-981)** | 0 | 14 |
| **Transport residue** — STDIO has no identity gate; `BND-S4-17`, owner `nobody` | **NEU-893** | 2 | 2 |
| **SUB-13's assignment** | SUB-13 | **0** | **0** |
| **SUB-6's model** | SUB-6 | 0 | **1** (`SC-S3-45`) |

**`SUB-13's assignment` reads 0 / 0 after republication, as it did before it.** The matrix was not found
wrong, and this chapter did not make it wrong. What blocks the invariant is the transport, the absent
attribution mechanism and the absent access-path enumeration.

### 8.4 The three confirmations, re-affirmed over this revision

1. **No revised row describes an ownership column as present.** `04_…md` §6 found **zero** matches for
   `user_id` / `userId` / `learner_id` / `learnerId` in `schema.ts`. Census A's 24 `not-evaluable` rows
   are `not-evaluable` **because** none exists; Census B assumes one **only** inside the explicitly
   enumerated composed target state and is labelled composed at every use. **NEU-850's `OUT-2` is a
   decision to honour, never an existing schema fact** — before and after this revision.
2. **Every transport-dependent verdict is transport-qualified, never stated unqualified.** The two
   `fails-transport` rows (`SC-S3-19`, `SC-S3-20`) fail **because** the verdict differs by transport —
   that is `I4`'s whole content. **No repaired verdict in this chapter holds only under HTTP**, because
   **no verdict was repaired**: the two `revised` rows' verdicts are `not-evaluable` under **both**
   censuses and **both** transports, and neither is `fails-transport`. **No row returns `holds` under
   either transport.** `F-S5-4` is honoured: the binding constraint is the **transport**, not the
   schema, and no authority was changed to "repair" a transport-caused verdict.
3. **No row returns `holds` by failing to find a counter-example.** Structurally obeyed, as §8.2 states.

---

## 9. The residual statement — every row still carrying an unresolved finding, with its owner

**A row is listed here when a consumer resolving against this revision would be resolving under a
caveat.** The point is that the caveat is **discoverable at publication rather than in production**: a
downstream audit that reads a row below knows what is unsettled about it and whose it is, instead of
finding out later. **Nothing here is published as if settled.**

| Row(s) | What is unresolved | Record | **Owner** |
| --- | --- | --- | --- |
| `SC-S3-45` | **Structurally incapable of `holds` under any target state** — its authority is external, so no in-system access-path set can be enumerated for it. Not fixable by any local change; re-routed as a model question, unanswered inside this pass. | `F-S14-3` → `F-S16-2`, capped by **`CAP-S16-1`** | **SUB-6 (NEU-976)** |
| `SC-S3-45` | Clause 4 names the **zone** `Z-IDP` but the literal id `CMP-S4-2`, which `05_…md` §3.1 places in `Z-EXT`. Resolved to `CMP-S4-10` and routed; still open. | `F-S13-2` (SUB-13's, unclosed) | **SUB-6 (NEU-976)** |
| `SC-S3-42` | **Divergence outcome UNDEFINED.** Whether hint usage taints a mastery judgement is undecided by every merged input, and the two candidate resolutions give **opposite** mastery verdicts. `A-25`'s tolerance envelope contains no point that resolves it. | `F-S14-4` | **NEU-891** |
| `SC-S3-31` | **Conflicting-write outcome UNDEFINED.** Aggregate-vs-append is a store-shape decision no merged artifact makes; the two shapes give opposite concurrency obligations. NEU-890's durability property survives either (`09_…md` §13.2), so the indeterminacy does **not** propagate to `SC-S3-38`/`SC-S3-39`. | `F-S14-5` | **SUB-10 (NEU-984)** |
| `SC-S3-16`, `SC-S3-17` | **No component can be named the deletion owner** — neither table has a principal field, so there is nobody to delete *for*. The obstruction is **structural**. Write authority is assigned (§6); deletion ownership is not, and **is not the same question**. | **`CAP-S4-1` — structural; cited here, and NOT closed** | **SUB-4 (NEU-974)** |
| `SC-S3-16`, `SC-S3-17` | `05_…md` §5 carries `FL-S4-8`/`FL-S4-9` against `FL-S4-20` about these two categories — a contradiction **internal to a merged document**. Direction named and dispositioned (§6.3); the `05_…md` residue is not repaired. | `F-S14-8` → `F-S16-4` | **SUB-4 (NEU-974)**; consumer **SUB-11 (NEU-985)** |
| `SC-S3-16`, `SC-S3-17` | Retention: no policy, and the gap has **no owner** — stated as an open gap rather than assigned to a party that has not accepted it. | `F-S3-3` (SUB-3's, unclosed) | **unowned** — routed to **SUB-12 (NEU-986)** at the gate to assign or record |
| `SC-S3-19`, `SC-S3-20` | **`fails-transport` under both censuses.** STDIO has no identity gate; `BND-S4-17` is a trust boundary whose owner is **`nobody`**. Not repairable by changing an authority — `F-S5-4` is explicit that the binding constraint is the transport. | transport residue; `BND-S4-17` | **NEU-893** |
| `SC-S3-33` | Assigned on clause 2 via **tie-break (c)** under a disclosed narrow reading of tie-break (b); SUB-13 routed the reading to SUB-6 and it is unanswered. `FL-S4-14` remains the outlier against `FL-S4-13` in `05_…md`. | `F-S13-1` (SUB-13's, unclosed); `F-S14-9` → `F-S16-4` | **SUB-6 (NEU-976)** |
| `SC-S3-35` | `05_…md` §5 `FL-S4-16` still reads *"Undetermined"* for a question this matrix resolved. Direction **matrix → flow**; `05_…md` not amended. | `F-S14-10` → `F-S16-4` | **SUB-4 (NEU-974)** |
| **The 14 Census-B `fails-confinement` rows** — Census B's 15 **less** `SC-S3-45` | **Confinement residue**: no enumerated access-path set exists, so `I3` cannot return `holds`. Not a defect in any row's authority. The fifteenth (`SC-S3-45`) is `F-S14-3`'s and belongs to SUB-6, **not** to SUB-8. | `06_…md` §3.4.1; `09_…md` §15.2 | **SUB-8 (NEU-981)** |
| **The 15 portless rows** — `SC-S3-16`, `SC-S3-17`, and the 13 clause-1 rows `SC-S3-18`…`SC-S3-30` | `I3`'s *"at or below the port boundary"* is **unaskable as written** where no port mediates the category. Read purposively; **the ruling is disclosed, not made silently**, and moves no verdict under either reading. | `F-S14-1`; `OI-S5-1` | **SUB-5 (NEU-975) / NEU-893** |
| **Both censuses, all rows** | `fails-principal: 0` is **unreached, not passed** — `I5` is last and every in-domain row fails earlier. The `sub`-vs-`azp` defect is real, merged and **unmeasured** by either census. | `F-S14-2` | **SUB-11 (NEU-985)** for the reading; **NEU-893** for the defect |
| **The whole matrix** | **This package does not prove the isolation invariant satisfiable.** Zero `holds` across 90 row-evaluations is consistent with unsatisfiability *and* with a merely-unimplemented mechanism, and §3.4.1's asymmetry means no census can distinguish them. | **`CAP-S5-1` — cited, not duplicated** | **SUB-5 (NEU-975) / NEU-893** |
| **The whole matrix** | Two-writer divergence is **unobserved**, not absent. A cap on **evidence strength**, not on the conclusion. | **`CAP-S6-1` — cited, not duplicated** | **SUB-10 (NEU-984 / NEU-896)** |
| **The package** | **No QA pass exists.** The `qa-execution` engine and host surfaces are unconfigured, so this item's scenarios are authored and marked **`NOT RUN`**. A genuine Core Article 8 no-op — **not a skipped gate, and never reported as a pass.** | **`CAP-S1-3` — cited, not duplicated** | **SUB-1 (NEU-971)** |

**`OI-S3-1` stays open, half-discharged, exactly as SUB-13 left it** — its unsatisfiability is
`F-S13-3`, owner **SUB-12 (NEU-986)**. **`OI-S13-1` stays open** — whether prior gate verdicts are
retained is a store-shape question, owner **SUB-10 (NEU-984)**. Nothing in this chapter changes either.

**Rows carrying no unresolved finding: 30 of 45.** Those are the rows a consumer resolves against with
no caveat at all, and saying so is as much a part of the residual statement as the list above.

---

## 10. What this chapter closes, and what it does not

**Closes.**

- **`OUT-3`'s republication obligation.** The corrected revision exists, carries an identifiable
  `post-validation` marker, names its consumers, and has both mechanical audits **re-proved on it**
  rather than inherited.
- **`OUT-4`.** Every isolation-invariant failure SUB-14 routed carries an explicit disposition with a
  named owner. **Received 11, dispositioned 11, undispositioned 0.**
- **`OI-S14-1`** — answered at §5.8 with its reasoning published at §8.1: **no verdict moves**, so
  `09_…md`'s record stands over this revision and need not be re-run.
- **`F-S14-6` and `F-S14-11`** — closed by publication (§5.1 and §3.2 respectively); both asked for a
  reading or a mapping to be stated, and both are now stated. Neither leaves a residue.

**Does not close, and is explicit about it.**

- **`F-S14-1`, `F-S14-2`, `F-S14-3`, `F-S14-4`, `F-S14-5`** — each is **dispositioned** here and
  **owned elsewhere**. A disposition is not a resolution: §9 names each with its owner precisely so the
  two are not confused.
- **`F-S14-7`, `F-S14-8`, `F-S14-9`, `F-S14-10`** — the matrix half of each is settled by re-running the
  rule; the `05_…md` half of three of them is **re-routed as `F-S16-4`**, unrepaired by design (§6.3).
- **`CAP-S4-1` stands and MUST NOT be closed — structural.** This is its sixth sighting in the package.
  Assigning write authority to `SC-S3-16`/`SC-S3-17` (§6) does **not** touch it: deletion ownership is a
  different question, and it is unassignable until the tables acquire a principal field or `SC-S3-45`
  acquires a store.
- **`CAP-S5-1`, `CAP-S6-1`, `CAP-S1-3` stand** — cited at §9, **not duplicated** and **not closed**.
- **`F-S13-1`, `F-S13-2`, `F-S13-3`, `F-S3-3`, `OI-S3-1`, `OI-S13-1`, `OI-S5-1`** — all pre-existing,
  all still open, none touched.
- **The isolation invariant is not proved satisfiable**, and this chapter does not claim it is.

**Raised here.** Four findings (`F-S16-1` … `F-S16-4`), one open item (`OI-S16-1`), one cap
(`CAP-S16-1`), **zero spikes**. Full records are appended to `02_findings-register.md`,
`90_open-items-and-provisional-register.md` and `91_caps-and-incomplete-scope.md` under `### SUB-16`.
**`92_spike-register.md` is unchanged** — no claim in this chapter is uncertain-and-material in a way an
existing cap does not already cover, and `SPK-S6-1` / `SPK-S2-1` are cited where relevant rather than
replicated. **`93_stand-in-assumption-register.md` is CLOSED and is cited, never appended to.**

---

## 11. Handoff

| Consumer | What it takes from here | Where |
| --- | --- | --- |
| **SUB-7 (NEU-980)** | The `post-validation` revision to resolve resource-level rows against and cite by marker. **Its `OUT-5` resource-inventory ↔ matrix cross-check is a *different* audit over a *different* inventory** than §7.2's, and is not run or claimed here. `F-S14-6`'s disposition also bounds web-tier scoping: **`CMP-S4-3` holds zero of 45 rows, by construction under `M-A`.** | §2, §3.1, §5.1, §7, §8 |
| **SUB-8 (NEU-981)** | The **14 confinement-residue rows** — Census B's 15 `fails-confinement` **less** `SC-S3-45`, which is `F-S14-3`'s and belongs to SUB-6. Read **Census B's column only**, with its target state named; it is not summable with Census A. | §8, §8.3, §9 |
| **SUB-10 (NEU-984)** | The revision to resolve store topology against; `F-S14-5` (`SC-S3-31`'s store shape); `OI-S13-1`; `CAP-S6-1`'s lifting condition. **`SC-S3-16`/`SC-S3-17`'s write path is now stated as off the request path** (§6), which bears on where those tables can live. | §6, §8, §9 |
| **SUB-11 (NEU-985)** | The vocabulary mapping (§3.2) so its mechanical flow-vs-matrix audit does not re-report `F-S14-11`'s five; `F-S14-2`'s reading constraint, which bounds how `fails-principal: 0` may be read; `F-S16-4`, the flow-vs-flow class it can check mechanically; and §7's re-proved audits, reproducible from the same parse. | §3.2, §7, §8.2, §9 |
| **SUB-12 (NEU-986)** | The gate input: **11 findings received, 11 dispositioned, 0 undispositioned, 11 of 11 owned**; both audits re-proved (45/0/0/45; 0 unmatched both directions); `OI-S14-1` closed; **`F-S16-1`** (SUB-14's tracker-id drift — `SUB-16`/`NEU-980`, `SUB-11`/`NEU-983`, `SUB-12`/`NEU-985`; **24 instances across 5 merged files**) and **`OI-S16-1`** (findings routed to a merged sub-task with no pass scheduled to answer them). | §4.1, §5.7, §7, §10 |
| **SUB-6 (NEU-976)** | **`F-S16-2`** (should a row with an external authority be in the invariant's domain?) and **`F-S16-3`** (is clause 1 preceding clause 4 intended for a process-local projection of external state?). Both are model questions; `CAP-S16-1` carries the first. | §5.2, §5.3 |
| **SUB-4 (NEU-974)** | **`F-S16-4`** — three annotations in `05_…md` §5 left unreconciled against this revision, each with direction named and **none amended**. | §6.3 |
| **NEU-893** | The two `fails-transport` rows, `BND-S4-17`'s unenforced boundary, `F-S14-1`'s `I3` phrasing gap, and `F-S14-2`'s unmeasured `sub`/`azp` defect. | §9 |
| **NEU-891** | **`F-S14-4`** — the hint-usage/mastery inclusion rule, still the only thing standing between `SC-S3-42` and a defined divergence outcome. | §9 |

---

## 12. Verification note

- **Both audits in §7 were produced by a mechanical parse of §8's table in this file**, not asserted
  from authoring notes: rows matching `` | `SC-S3-<n>` | `` with exactly nine columns, counting
  `CMP-S4-<n>` tokens in the `**Authority**` cell only. The parse reports **45 rows · 0 zero-authority ·
  0 two-or-more · 45 exactly-one · 45 distinct ids · 0 duplicates · 0 non-`CMP-S4-*`**, and the
  independent re-extraction of `04_…md` reports **45 distinct numeric ids, min 1, max 45, no gaps**,
  with **0 unmatched in both directions**. Every distribution in §7.1 and §8 comes from the same parse.
- **The count of findings received was taken independently at two locations** — `09_…md` §15.3's table
  and `02_findings-register.md` `### SUB-14`'s records — and the two agree at **11**. **11 dispositioned.**
- **No merged sibling artifact was edited.** `05_…md`, `08_…md` and `09_…md` are byte-identical after
  this pass; so are `04_…md`, `06_…md`, `07_…md` and `93_…md`. **`94_package-completeness-gate.md` was
  not touched** — it is owned solely by NEU-986. **No `README.md` row was added**; row 7's generic
  `03_…`–`89_…` range row, owned *"SUB-2 … SUB-16"*, already covers this chapter.
- **No line was deleted from any append-only register.** The three `### SUB-16` sections are pure
  appends; `git diff --numstat` reports **0** in the deletions column for `02_…md`, `90_…md` and
  `91_…md`.
- **This chapter changed no file under `src/`, `tests/` or `drizzle/`**, and wrote **no spike artifact**
  anywhere. It is documentation only.
- **No QA pass is claimed.** `qa-execution:engine` and `qa-execution:host` are unconfigured, so the
  scenarios authored for this item are marked **`NOT RUN`**. `CAP-S1-3`; a genuine Core Article 8 no-op,
  reported as such and never as a pass.
- **Every id in this chapter was checked against the tracker**, individually, not by pattern: SUB-4 is
  **NEU-974**, SUB-5 **NEU-975**, SUB-6 **NEU-976**, SUB-7 **NEU-980**, SUB-8 **NEU-981**, SUB-9
  **NEU-983**, SUB-10 **NEU-984**, SUB-11 **NEU-985**, SUB-12 **NEU-986**, SUB-13 **NEU-977**, SUB-14
  **NEU-978**, SUB-16 **NEU-979**. **The wrong pairings `SUB-16 (NEU-980)`, `NEU-983 (SUB-11)`,
  `SUB-12 (NEU-985)` and `NEU-987`/`NEU-977` appear in this chapter *only* inside §5.7's citation of
  `F-S16-1` and `F-S3-2`, where naming the wrong string is the point** — never as an assertion, never in
  a handoff, and never in a register entry. Every operative id in §5, §6, §7, §8, §9 and §11 is correct.
- **Nothing in this chapter rests on a benchmark journey.** `F-S4-5` records that all three are
  dogfooded across `BND-S4-17`, whose owner is **`nobody`** — so *"the journey ran fine"* is not
  evidence about a gated path, and none is offered as such.
