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
