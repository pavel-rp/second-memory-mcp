# 11 — The package end to end: four cluster exemplars, the standards-conformance review, and both acceptance scenarios

**Task:** NEU-967 (SUB-11) · **Charter:** C009 (umbrella NEU-890) · **Compiled:** 2026-08-10 · **Verification cutoff:** 2026-08-10 · **Status:** deferred — set only in `adjudication/` and, for inherited C005 decisions, in the owning package's ledger
**Model:** claude-opus-5[1m]

**Covers:** **OUT-11** in full · **OUT-2**'s standards-conformance review of the exemplars only · **OUT-9**'s self-classification of this sub-task's own quality requirements only.

---

## 0. The result, stated first

**Four exemplars exist, one per cluster, on four real map nodes. Cluster coverage is 4/4. One of the four is complete. Three cannot be completed, and the reason is structural rather than editorial.**

| | |
| --- | --- |
| **Clusters carrying an exemplar** | **4 of 4** — CL-1, CL-2, CL-3, CL-4 |
| **Exemplars whose REQUIRED form set is fully instantiable at this cutoff** | **1 of 4** — CL-1 only |
| **Why the other three are not** | Their nodes are `strategic`/`transfer`, where SUB-2 §6.3 marks **`problem-reference` and `solution` REQUIRED**. The only fillable shape of `problem-reference` today is `REFUSED — not verifiable` (`CAP-S3-1`, `CAP-S3-2`). **Two REQUIRED limbs per exemplar are `unreachable`, not merely unexercised.** Filed as `OI-S11-2`. |
| **Non-root `conceptual` attachment points outside CL-1** | **Zero.** CL-2, CL-3 and CL-4's conceptual limb is `unreachable`, inheriting **`CAP-S5-1`** and **`OI-S5-1`** by id. **No route in `05_…` §6 is chosen here.** |
| **Standards-conformance review** | Run, 4 exemplars × 4 standards, **by each standard's own stated violation-detection method**. **Two of SUB-4's twelve checks are structurally vacuous on these exemplars** — §4.5. Filed as `OI-S11-3` and `OI-S11-4`. |
| **Both acceptance scenarios** | Walked limb by limb, every limb class-labelled. The adversarial scenario **passes**: three non-`AI` mechanisms stop the artifact **before** any `AI` row is consulted. |
| **Requests issued by this sub-task to any of the twelve sources** | **Zero.** On any path. |
| **Verified citations produced** | **Zero.** Every `problem_ref` in this document reads exactly `REFUSED — not verifiable`. |
| **Class 7 `[future-real-user]` claims** | **Zero.** Class 7 does not exist for this package. |
| **New gate ids introduced** | **Zero** — §10.5. |
| **QA-engine runs claimed** | **Zero** — §13. |

**What this document is evidence of, and what it is not.** It is evidence that the package's specifications **compose**: a node record, a placement matrix, ten form templates, four correctness standards, a difficulty rule, an evidence-signal map, a workflow and a 59-gate enforcement scheme were pointed at four real nodes together, and the seams they produce are enumerable. **It is not evidence that any of it works in use.** No gate is implemented (`CAP-S9-1`), no unit has moved through the workflow (`CAP-S8-4`), and no creator has confirmed anything (`CAP-S8-2`). **The finding, not a pass, is the deliverable.**

---

## 1. What this document is, and what it is not

**It is a desk-executed, per-limb class-labelled proof.** Every limb of every exemplar and every limb of both acceptance scenarios carries **exactly one** class from a closed three-value set, defined in §2, and **exactly one** NEU-887 evidence class.

**It is not a pipeline run**, because there is no pipeline. `OI-S9-16` reads *"every gate specified, none built"*, and `CAP-S9-1` states that **no gate named in `09_…` §4 or §7 exists as code and none has ever run against a content unit.** An exemplar therefore cannot be "passed through" anything, and this document never says one was. **This sub-task files that as its own cap — `CAP-S11-3` — rather than borrowing SUB-9's**, because the gap between the charter's word *prove* and what is executable is SUB-11's to declare, not SUB-9's to have anticipated.

**It is not a substitute for SUB-4's own walkthrough, and SUB-4's is not a substitute for this.** `CAP-S4-3` assigns the standards-conformance review of the package's exemplars to SUB-11 and records that SUB-4's `04_…` §7 three-artifact walkthrough *"exercises the standards against artifacts SUB-4 constructed to fail; it says nothing about whether real exemplars pass."* §4 below is the review `CAP-S4-3` names. **Its closure condition is discharged as to the run and the citing. `CAP-S4-3` is SUB-4's row and is not edited here.**

**It authors no course.** Four exemplars are **specification instruments**, not curriculum. They exist to be walked against the standards, not to be taught from.

**It sets no status.** A producing task may not promote its own artifact to `settled` (`A4`). Nothing here is promoted, and this document defers its status in its header exactly as its eleven siblings do.

---

## 2. The class scheme this proof uses

### 2.1 The per-limb class — a closed three-value set

Every limb below carries exactly one:

| Class | Definition | What it licenses a reader to conclude |
| --- | --- | --- |
| **`exercised`** | A real check that **this sub-task actually ran** against a real artifact, whose command and outcome are recorded in `traceability/11_…` and re-runnable by a third party. | That the checked property holds of the checked artifact at this cutoff. |
| **`simulated`** | A **constructed specimen** walked against the published specification **by the producing task**, at a desk. | That the *specification* has the property the walk exhibits. **Never** that an implementation does, and never that a real artifact would. |
| **`unreachable`** | Blocked before the limb could be attempted, by a cause recorded as a **cap or open item cited by id**. | Nothing about the limb — only that the blocker is named and owned. |

**A limb never carries two classes**, and `simulated` is never upgraded by volume: four simulated limbs are four desk walks, not one demonstration.

### 2.2 The NEU-887 evidence class

Classes used in this document: **1 `[literature]`**, **2 `[code-evidence]`**, **3 `[dogfooding]`**. Classes 4, 5 and 6 are not collected here. **Class 7 `[future-real-user]` does not exist anywhere in this package**, and `92_package-completeness-gate.md` treats a single class-7 **claim** as a failure.

**Precision, so a lexical scan reads this document correctly.** The string `[future-real-user]` occurs in this document exactly **four** times — §0's roll-up, the paragraph above, this sentence, and the `EQ-S11-6` row — and **every one of the four is a negative statement that no such claim is made.** A scan counting raw occurrences finds four; a scan counting *claims* finds **zero**, and zero is the number that matters. The distinction is recorded because this document cannot be the one that quietly trips the gate it endorses. (The count is re-derived mechanically in `traceability/11_…` §6, so it cannot silently rot as this document is edited.)

**On class 3.** `CAP-S8-1` scopes *"zero class 3 evidence"* to **SUB-8's creator-review loop specifically** — it is not a package-wide statement, and `dry-run/06_corpus-swap-verification.md` §6 already carries a class 3 run self-labelled **`3 [dogfooding]`, n = 1**, a constructed specimen exercised by the producing task. This document's `simulated` limbs are that same shape and carry that same label with the same honesty: **n = 1, producing task, no distribution.**

**Exemplars are proxy evidence and are labelled proxy.** They are creator-side desk construction and structured self-review. They are **never** external-user or expert validation, and no reader may read them as either.

### 2.3 The seven observable elements — fixed here, and the fixing is recorded

The charter requires each exemplar to carry **seven observable elements** and does not enumerate them in a form this sub-task could copy verbatim. They are fixed here as **E1–E7**, derived from what the acceptance scenarios actually demand, and **the act of fixing them is filed as `OI-S11-1`** so SUB-12 can reconcile if the charter's own list differs. **They are not presented as quoted.**

| # | Element | Observable how |
| --- | --- | --- |
| **E1** | **Node identity** — a real node id copied from the map, with its recorded `skill_type` and cluster | String equality against `docs/research/C005-dp-map/nodes/*.yaml` |
| **E2** | **The REQUIRED form set** for that node's `skill_type` per SUB-2 §6.3, each form present or explicitly `unreachable` | Row lookup in the placement matrix, then presence count |
| **E3** | **The discriminative pair** — `misconception_or_edge_case` + `separating_distractor_or_boundary_input` — on every discriminative form | Field presence and non-emptiness |
| **E4** | **Provenance** — the sanctioned access path from SUB-3's record, and the refusal it produces | String equality against `03_…` §9.1's recorded per-source resolution path |
| **E5** | **Standards conformance**, judged by each standard's own stated violation-detection method | §4 |
| **E6** | **Calibrated difficulty** — SUB-7 §5.1's triple, carrying the §9.4 label verbatim | Recomputation from `difficulty_dimensions` |
| **E7** | **Workflow position** — the SUB-8 state the unit occupies, and the node's `creator_review` value | String equality against the node record and `08_…` §3.1 |

---

## 3. The four exemplars

### 3.0 Node selection, and why these four

Each exemplar sits on a node **quoted from `05_…` §4** — CL-1's from §4.1's carrier row, and CL-2's, CL-3's and CL-4's from their clusters' *"nearest existing nodes, and why each is not the carrier"* tables. Choosing from those tables is deliberate: they are the nodes SUB-5 already examined and already ruled **not** the conceptual carrier, so building an exemplar on one **cannot be misread as covering the conceptual obligation**.

Every id, `skill_type`, `prerequisites.*` list and `difficulty_dimensions` block below was **read from the map on 2026-08-10** and is class **2 `[code-evidence]`**. **No value here is described, inferred or remembered.**

| Cluster | Node id | `skill_type` | `prerequisite_depth` | REQUIRED forms (SUB-2 §6.3) |
| --- | --- | --- | --- | --- |
| **CL-1** | `cl-1.judge-dp-applicability` | `conceptual` | 1 | lesson · example · visualization · reflection · retrieval · assessment — **6** |
| **CL-2** | `cl-2.recognize-an-implicit-dag` | `transfer` | 5 | lesson · example · **problem-reference** · **solution** · reflection · retrieval · assessment — **7** |
| **CL-3** | `cl-3.recognize-bitmask-state-applicability` | `strategic` | 5 | lesson · example · **problem-reference** · **solution** · reflection · retrieval · assessment — **7** |
| **CL-4** | `cl-4.select-mainstream-optimization` | `strategic` | 6 | lesson · example · **problem-reference** · **solution** · reflection · retrieval · assessment — **7** |

**`test` is `—` for `conceptual`.** It is not optional on CL-1's node; it is **not applicable**. That fact does real work in §4.4.

---

### 3.1 CL-1 — `cl-1.judge-dp-applicability` · `conceptual`

**E1 — node identity.** `cl-1.judge-dp-applicability`, `node_kind: "skill"`, `skill_type: "conceptual"`, `cluster: "CL-1"`, `role: "technique"`. The **only** non-root `conceptual` node in the entire graph (`05_…` §1). · **`exercised`** · class **2**

**E7 — workflow position.** `prerequisites.intra_cluster: []`; `prerequisites.roots: ["cl-1.root.recognize-optimal-substructure", "cl-1.root.recognize-overlapping-subproblems"]`; `boundary_anchors: []`. `creator_review: "deferred-provisional"`. The unit below is in SUB-8 state **`draft`** and has taken **no** transition: `T-01` requires an author, and this sub-task authored a specimen, not a unit. · **`exercised`** (the reads) + **`unreachable`** (the state advance, `CAP-S8-2`, `CAP-S8-4`) · class **2**

**E2 — the six REQUIRED forms.** All six instantiable; **none carries a citation-bearing REQUIRED field**, which is precisely why this exemplar completes and the other three do not (`05_…` §8 records the same citation-independence, and `CAP-S5-4` guards against reading it as progress).

**`lesson`** · **`simulated`** · class **3 `[dogfooding]`, n = 1**
```
form: lesson
node_id:              cl-1.judge-dp-applicability
title:                When DP is the right tool, and when it only looks like it
applies_when:         An optimal solution to the whole is composed of optimal solutions to
                      sub-parts, AND the same sub-part is reached along more than one path
                      through the decomposition. Both, jointly, checked against the statement
                      in front of you.
does_not_apply_when:  Exactly one of the two holds. Substructure without recurrence is
                      divide-and-conquer — the decomposition is real and memoization buys
                      nothing. Recurrence without substructure is a search whose repeated
                      states are not sub-optima — caching them caches wrong answers faster.
prerequisite_recall:  cl-1.root.recognize-optimal-substructure ·
                      cl-1.root.recognize-overlapping-subproblems
                      (read from prerequisites.roots; never inferred from a cluster span)
claim_citations:      REFUSED — not verifiable
body:                 <the exposition>
```
**`does_not_apply_when` is not the negation-by-restatement of `applies_when`.** It names two *different* situations — one per failure direction — rather than "when not X". That is the exact defect SUB-4 §2.1's restatement check exists to catch, and it is why the field is written this way.

**`example`** · **`simulated`** · class **3**, n = 1
```
form: example
node_id:                                  cl-1.judge-dp-applicability
title:                                    Two statements that decompose, one that memoizes
scaffold_fade_level:                      full derivation
derivation_steps:                         <ordered; both properties checked separately, then jointly>
misconception_or_edge_case:               "Any problem with a recursive decomposition is a DP problem."
separating_distractor_or_boundary_input:  A divide-and-conquer instance whose sub-parts are
                                          disjoint by construction, so no sub-part is ever
                                          reached twice — the decomposition holds and DP buys
                                          nothing.
problem_ref:                              REFUSED — not verifiable
```

**`visualization`** · **`simulated`** · class **3**, n = 1
```
form: visualization
node_id:                                  cl-1.judge-dp-applicability
title:                                    The call graph, with revisits marked
renders_state:                            The recursion's state-argument tuple at each call
invariant_shown:                          A state reached along two distinct paths carries the
                                          same optimum on both — or visibly does not
misconception_or_edge_case:               "Repeated states are enough."
separating_distractor_or_boundary_input:  A configuration where the same state tuple is
                                          reached twice but the whole's optimum does not
                                          decompose into it — the revisit is visible and the
                                          cached value is visibly wrong.
interaction:                              step
```
`visualization` is **R** only for `conceptual`. It appears on **one** exemplar in this document, and on no other, because no other exemplar's node type requires it.

**`reflection`** · **`simulated`** · class **3**, n = 1 — prompt targets the joint judgment; `misconception_or_edge_case` = "I checked substructure, so DP applies"; the separating response is one that names substructure and never mentions recurrence at all; `remediation_hook` routes back to the two roots.

**`retrieval`** · **`simulated`** · class **3**, n = 1 — `stem` does not contain its own answer; `expected_response` is the two-property joint check stated in the learner's own words; `hint_ladder` offers the first property before failure is recorded; `spacing_eligible: true`.

**`assessment`** · **`simulated`** · class **3**, n = 1 — `rubric_payload` is structured and rubric-anchored, **never a self-report**, and is **not** collapsed to pass/fail (`06_…` §4.7's may-feed rule depends on that non-collapse); `gate_relevance` names the dependent this result could contribute to unlocking.

**E3 — the discriminative pair.** Present and non-empty on all five discriminative forms placed here (`example`, `visualization`, `reflection`, `retrieval`, `assessment`). `lesson` is one of SUB-2's three non-discriminative forms and carries no pair by design. · **`exercised`** · class **2**

**E4 — provenance.** SUB-3's recorded resolution path for **every one of the twelve sources** is the literal **`none — gate`** (`03_…` §9.1) — a real recorded value, not an absence. All twelve fail step **`V0`**: `01_…` §3 records every source `Restricted` under the restricted-by-default rule. **This sub-task issued zero requests on any path.** Outbound network capability exists (`OI-S3-2`) and **capability is not authority**; the gate is opened only by a SUB-1-owned dated rights re-verification. Inherited by id: **`CAP-S3-1`** (coverage 0/4), **`CAP-S3-2`** (`CAP-2` closure declined, `D-R5`). Both `claim_citations` and `problem_ref` read `REFUSED — not verifiable`. · **`unreachable`** · cited by id

**E6 — calibrated difficulty.** `difficulty_dimensions` read from the map: `prerequisite_depth: 1`, `state_formulation_load: 2`, `transition_derivation_load: 1`, `proof_obligation_load: 1`, `implementation_load: 1`, `recognition_load: 3`, `progression_stage: "PS-1"`.

**`calibrated_difficulty(cl-1.judge-dp-applicability) = (structural_tier 1, PLI 8, stage_band PS-1)`** — PLI as SUB-7 §5.1's equal-weight sum 2+1+1+1+3. · **`exercised`** · class **2**

> **`no external cross-check` — the external anchor was unavailable at the 2026-08-10 cutoff (`CAP-S7-1`); this value rests on the map's five provisional load dimensions and `progression_stage`, all `creator_review: "deferred-provisional"`, plus the re-derivable `prerequisite_depth`. It is not corroborated by any independent signal, and it is provisional on the unsettled dimension choice (`OI-S7-1`).**

**E5 — standards conformance.** §4.

**Cluster conceptual obligation.** **Discharged content-side**, exactly as `05_…` §4.1 states: the six REQUIRED forms attach to this node and the obligation's two failure directions are carried in `does_not_apply_when` and in the misconception fields. `OI-S5-4`'s fragility is **not** relieved: CL-1's compliance still rests on **one** node, and this exemplar's existence does not add a second.

---

### 3.2 CL-2 — `cl-2.recognize-an-implicit-dag` · `transfer`

**E1.** `cl-2.recognize-an-implicit-dag`, `node_kind: "skill"`, `skill_type: "transfer"`, `cluster: "CL-2"`. `05_…` §4.2 records it as *"the closest candidate, and still a recognition of a known shape rather than a property judgment."* · **`exercised`** · class **2**

**E7.** `prerequisites.intra_cluster: ["cl-2.dp-state-graph-is-a-dag", "cl-2.longest-path-in-a-dag", "cl-2.cyclic-state-dependency-breaks-dp"]`; `roots: ["cl-1.root.recognize-optimal-substructure", "cl-1.root.recognize-overlapping-subproblems"]`. `creator_review: "deferred-provisional"`. Unit state **`draft`**, no transition taken. · **`exercised`** + **`unreachable`** · class **2**

**E2 — seven REQUIRED forms, five instantiable and two unreachable.**

| Form | Status | Class |
| --- | --- | --- |
| `lesson` | Instantiated — `applies_when`: the statement names situations and legal moves between them, and no sequence of moves returns to a situation. `does_not_apply_when`: the move relation admits a cycle, so the "DAG" is not one and the longest path is undefined — **a different situation, not a negation**. `prerequisite_recall: cl-2.dp-state-graph-is-a-dag` (read from `prerequisites.intra_cluster`). `claim_citations: REFUSED — not verifiable`. | `simulated` · **3**, n = 1 |
| `example` | Instantiated — misconception *"if it mentions no graph, it is not a graph problem"*; separating input: a statement about a string whose situations are prefix positions and whose legal moves are single-character extensions. | `simulated` · **3**, n = 1 |
| **`problem-reference`** | **`REFUSED — not verifiable`** in **both** fields. Its only fillable shape today. | **`unreachable`** · `CAP-S3-1` |
| **`solution`** | Its REQUIRED `problem_ref` reads `REFUSED — not verifiable`, so the form cannot be completed as specified. The remaining fields are given for the walk in §4.2, not as a completed instance. | **`unreachable`** · `CAP-S3-1` |
| `reflection` | Instantiated — misconception *"acyclicity is a formality"*; the separating response asserts the construction without ever checking that no move sequence returns. | `simulated` · **3**, n = 1 |
| `retrieval` | Instantiated — `spacing_eligible: true`; `hint_ladder` offers "what is a situation here?" before failure is recorded. | `simulated` · **3**, n = 1 |
| `assessment` | Instantiated — `rubric_payload` structured, `gate_relevance` named. | `simulated` · **3**, n = 1 |

**E3.** Pair present and non-empty on all four instantiated discriminative forms. On the two unreachable forms the pair is **not applicable**: neither `problem-reference` nor `solution` is discriminative in SUB-2's sense. · **`exercised`** · class **2**

**E4 — provenance.** Recorded resolution path `none — gate`; zero requests; `CAP-S3-1`, `CAP-S3-2` inherited by id. · **`unreachable`**

**E6.** `prerequisite_depth: 5`; loads 3+2+2+1+5; `progression_stage: "PS-4"`.
**`calibrated_difficulty = (structural_tier 5, PLI 13, stage_band PS-4)`**, carrying the verbatim `no external cross-check` label of §3.1. · **`exercised`** · class **2**

**Cluster conceptual obligation — `unreachable`, and no route is chosen.** CL-2 instantiates `conceptual` **zero** times (`05_…` §1). The obligation `05_…` §4.2 states — *whether a combinatorial structure indexes a state space at all* — **has no attachment point**, because SUB-2's placement matrix keys the REQUIRED form set off the **node's** `skill_type` and every ten templates require the exact node id from the map. Inherited by id: **`CAP-S5-1`**, **`OI-S5-1`**.

**What was refused here, in this sub-task's own words.** Authoring the conceptual obligation's content against this `transfer` node and reporting CL-2 covered. The artifacts would be individually valid — `reflection`, `retrieval` and `assessment` are **R** for `transfer` too — but the matrix reads the *node's* type, so the coverage produced would be `transfer` coverage wearing a conceptual label. `05_…` §3.4 refuses conceptual-*flavoured* content in CL-2/3/4 and this exemplar honours that refusal. Also refused: **retyping** the node (`05_…` §6 bars Route 4; `G-NO-RETYPE`). **This document chooses none of `05_…` §6's three open routes** — mint a node, amend the cascade, or decline the spread bar — and takes no position on which the map's owner should take. That adjudication is `CAP-S5-1`'s and `CAP-S5-2`'s, owned by the map's owner, and choosing it here would be this package deciding a map question.

---

### 3.3 CL-3 — `cl-3.recognize-bitmask-state-applicability` · `strategic`

**E1.** `cl-3.recognize-bitmask-state-applicability`, `skill_type: "strategic"`, `cluster: "CL-3"`. `05_…` §4.3: *"Encoding-specific and a selection under a cost constraint (S5)."* · **`exercised`** · class **2**

**E7.** `intra_cluster: ["cl-3.bitmask-state-encoding"]`; `roots: ["cl-1.root.formulate-state-transition-base-case", "cl-1.root.recognize-optimal-substructure"]`. `creator_review: "deferred-provisional"`. Unit state **`draft`**. · **`exercised`** + **`unreachable`** · class **2**

**E2 — seven REQUIRED forms, five instantiable, two unreachable**, the same split as CL-2 and for the same cause.

- `lesson` — `applies_when`: the subset's **identity** (not its size or its sum) drives the transition, **and** n is small enough for 2^n to fit. `does_not_apply_when`: a scalar summary of the subset suffices, so the mask carries information the transition never reads — **a different situation, not a negation**. `prerequisite_recall: cl-3.bitmask-state-encoding`. `claim_citations: REFUSED — not verifiable`. · `simulated` · **3**, n = 1
- `example` — misconception *"n ≤ 20 means bitmask"*; separating input: a statement with small n whose structure admits a polynomial formulation the mask would obscure. The node's own summary names this failure direction, so the misconception is **available without invention**. · `simulated` · **3**, n = 1
- **`problem-reference`** — `REFUSED — not verifiable` in both fields. · **`unreachable`** · `CAP-S3-1`
- **`solution`** — REQUIRED `problem_ref` refused; form incompletable. · **`unreachable`** · `CAP-S3-1`
- `reflection`, `retrieval`, `assessment` — instantiated, pair present on each. · `simulated` · **3**, n = 1

**E3.** Pair present on all four instantiated discriminative forms. · **`exercised`** · class **2**

**E4.** `none — gate`; zero requests; `CAP-S3-1`, `CAP-S3-2` by id. · **`unreachable`**

**E6.** `prerequisite_depth: 5`; loads 4+2+0+1+3; `progression_stage: "PS-4"`.
**`calibrated_difficulty = (structural_tier 5, PLI 10, stage_band PS-4)`**, with the verbatim label. · **`exercised`** · class **2**

**Cluster conceptual obligation — `unreachable`.** CL-3 instantiates `conceptual` zero times. `05_…` §4.3's obligation — *whether a state is compressible* — has no attachment point. `05_…` §4.3 records the sharpest form of the gap: `cl-3.probability-vs-expectation-dp-semantics` **states** the distinction the obligation requires the learner to **judge with**, but it is a `knowledge` node, carries no `skill_type`, and cannot instantiate one. **The content exists as knowledge; the skill it licenses does not exist as a node.** Inherited by id: **`CAP-S5-1`**, **`OI-S5-1`**. **No route chosen.**

---

### 3.4 CL-4 — `cl-4.select-mainstream-optimization` · `strategic`

**E1.** `cl-4.select-mainstream-optimization`, `skill_type: "strategic"`, `cluster: "CL-4"`, from the mainstream file. `05_…` §4.4: *"The canonical S5 selection … it presupposes that one applies, which is exactly the judgment the obligation names."* · **`exercised`** · class **2**

**E7.** `intra_cluster` carries six sibling technique nodes; `roots: ["cl-1.root.formulate-state-transition-base-case"]`. `creator_review: "deferred-provisional"`. Unit state **`draft`**. · **`exercised`** + **`unreachable`** · class **2**

**E2 — seven REQUIRED forms, five instantiable, two unreachable.**

- `lesson` — `applies_when`: a **correct** DP is too slow and its recurrence carries a readable structural signature. `does_not_apply_when`: the recurrence is correct, slow, and carries **no** exploitable structure — the situation the cluster's own framing invites a learner to assume away. `prerequisite_recall: cl-4.monotonic-queue-optimization` (read from `prerequisites.intra_cluster`). `claim_citations: REFUSED — not verifiable`. · `simulated` · **3**, n = 1
- `example` — misconception *"slow implies optimizable"*; separating input: a correct recurrence whose transition admits no convexity, no monotone argmin, no bounded window and no low-rank factorization, where the correct answer is that no mainstream optimization applies. · `simulated` · **3**, n = 1
- **`problem-reference`** — `REFUSED — not verifiable`. · **`unreachable`** · `CAP-S3-1`
- **`solution`** — REQUIRED `problem_ref` refused. · **`unreachable`** · `CAP-S3-1`
- `reflection`, `retrieval`, `assessment` — instantiated, pair present. · `simulated` · **3**, n = 1

**E3.** Pair present on all four instantiated discriminative forms. · **`exercised`** · class **2**

**E4.** `none — gate`; zero requests; `CAP-S3-1`, `CAP-S3-2` by id. · **`unreachable`**

**E6.** `prerequisite_depth: 6`; loads 1+2+1+1+5; `progression_stage: "PS-4"`.
**`calibrated_difficulty = (structural_tier 6, PLI 10, stage_band PS-4)`**, with the verbatim label. · **`exercised`** · class **2**

**Scope note carried forward, not re-decided.** This exemplar is on a **mapped** CL-4 member. It asserts nothing about the **10 `INC-C1` techniques**, which have no nodes at all — so their conceptual obligation cannot even be enumerated (`OI-S5-3`), and authoring against them is out of scope for this sub-task by its own spec.

**Cluster conceptual obligation — `unreachable`.** CL-4 instantiates `conceptual` zero times in **either** of its two files. `05_…` §4.4's obligation — *whether a too-slow recurrence's cost is structural* — has no attachment point. Inherited by id: **`CAP-S5-1`**, **`OI-S5-1`**, and **`OI-S5-3`** for the unmapped ten. **No route chosen.**

---

### 3.5 The 4/4 coverage check, and the completability asymmetry

| Cluster | Exemplar node | `skill_type` | REQUIRED | Instantiated | `unreachable` | Conceptual limb |
| --- | --- | --- | --- | --- | --- | --- |
| CL-1 | `cl-1.judge-dp-applicability` | `conceptual` | 6 | **6** | 0 | **discharged content-side** |
| CL-2 | `cl-2.recognize-an-implicit-dag` | `transfer` | 7 | 5 | **2** | **`unreachable`** — `CAP-S5-1`, `OI-S5-1` |
| CL-3 | `cl-3.recognize-bitmask-state-applicability` | `strategic` | 7 | 5 | **2** | **`unreachable`** — `CAP-S5-1`, `OI-S5-1` |
| CL-4 | `cl-4.select-mainstream-optimization` | `strategic` | 7 | 5 | **2** | **`unreachable`** — `CAP-S5-1`, `OI-S5-1`, `OI-S5-3` |
| **Total** | | | **27** | **21** | **6** | **1 of 4 discharged** |

**Cluster coverage: 4 of 4.** Every cluster carries an exemplar. **Completability: 1 of 4.**

**The asymmetry is the finding, and it is not a coincidence of node choice.** Any exemplar on **any** `strategic`, `transfer`, `implementation`, `optimization` or `debugging` node hits it, because SUB-2 §6.3 marks `problem-reference` **R** for `implementation`, `strategic`, `optimization` and `transfer`, and `solution` **R** for `implementation`, `strategic`, `debugging`, `optimization` and `transfer`. **Six of the eight skill types carry at least one REQUIRED citation-bearing form, and every one of them is unsatisfiable while `CAP-S3-1` stands.** Only `conceptual`, `procedural` and `proof` escape — and CL-2, CL-3 and CL-4 instantiate `conceptual` zero times.

**This is a compound of two caps that were filed independently and have never been read together:** `CAP-S3-1` (the access gate) and `CAP-S5-1` (no conceptual attachment point). Separately each is survivable. Together they mean **no exemplar in CL-2, CL-3 or CL-4 can be completed by any route available inside C009.** Filed as **`OI-S11-2`**, owner **SUB-1 (NEU-957)** for the rights half and **the map's owner** for the conceptual half — **not re-owned here**, and neither cap is restated.

**What was refused.** Reporting *"21 of 27 forms instantiated, 78%"* as a coverage result. A percentage over a form set whose missing members are all the citation-bearing ones is a number that hides its own shape. The table above reports **which** limbs are missing and **why**, which is the only reading that survives contact with `CAP-S3-1`.

---

## 4. The standards-conformance review

**This is OUT-2's primary verification signal, produced once, here** (`CAP-S4-3`). Each standard is applied **by its own stated violation-detection method**, quoted from `04_…` and applied without substitution. **SUB-4's standards are not re-authored, re-decided or relaxed**, and no check is replaced by an easier one.

### 4.1 The explanation standard — `04_…` §2.1, on `lesson`

**Its own three-layer method:** the **field floor** (mechanical), the **restatement check** (string-level), and the **depth check** — *"Name the first term in the lesson body that is neither in `prerequisite_recall` nor explained in place"* — **which is judgment, and for which SUB-4 proposes no mechanical proxy.**

| Exemplar | Field floor | Restatement check | Depth check | Class |
| --- | --- | --- | --- | --- |
| CL-1 | **PASS** — all four fields present; `prerequisite_recall` resolves to two declared root ids | **PASS** — two distinct failure directions, not "when not X" | **NOT RUN — see below** | `exercised` (floor, restatement) · class **2** |
| CL-2 | **PASS** — `prerequisite_recall: cl-2.dp-state-graph-is-a-dag` resolves | **PASS** — cyclic move relation is a different situation | **NOT RUN** | `exercised` · class **2** |
| CL-3 | **PASS** — `prerequisite_recall: cl-3.bitmask-state-encoding` resolves | **PASS** — scalar-summary case is a different situation | **NOT RUN** | `exercised` · class **2** |
| CL-4 | **PASS** — `prerequisite_recall: cl-4.monotonic-queue-optimization` resolves | **PASS** — no-structure case is a different situation | **NOT RUN** | `exercised` · class **2** |

**Every `claim_citations` slot reads `REFUSED — not verifiable`, and the standard admits that.** `04_…` §2.1 states a slot carries *"either a verified citation or the literal `REFUSED — not verifiable`"* and that a slot carrying **neither** is a defect. **4/4 lessons pass the floor on the refusal branch, not on the citation branch.** `G-REFUSAL-OK` is the gate that would enforce it.

**The depth check is NOT RUN, and this is a refusal rather than an omission.** Running it requires a judgement about whether the first undefined term in a body **this sub-task wrote** is undefined — an author checking their own explanation for the terms they assumed. That is `C-3`'s failure shape in miniature, and `CAP-S9-4` already records that the package's **one** AI correctness review **FAILS** `C-3` because author and reviewer carry the same model id. Running the depth check here and reporting a pass would add a second `C-3` failure and dress it as a result. **Recorded as `unreachable`** — the compensating gate `G-DEPTH-BOUND` exists in specification only (`OI-S9-1`, `CAP-S9-1`), and the residue is **`OI-S11-5`**.

### 4.2 The solution standard — `04_…` §2.2, on `solution`

**Its own three checks, in SUB-4's stated order of increasing strength:** **slot presence** (an `invariant` slot inside `reasoning`), **falsifiability** (the invariant names a condition some input class could violate), and **boundary confrontation** — *"the approach in `approach_class`, run over the `separating_distractor_or_boundary_input` of **every `test` instance placed on the same node**, produces something other than that test's `expected_behavior`"* — which SUB-4 names *"the one that matters"* and the catcher of **a hidden failing case**.

| Exemplar | Slot presence | Falsifiability | **Boundary confrontation** | Class |
| --- | --- | --- | --- | --- |
| CL-1 | n/a — `solution` is **`O`** on `conceptual` and none is placed | n/a | **VACUOUS** — `test` is **`—`** for `conceptual`, so the node can carry **no** `test` instance and the adversarial set is **empty by construction** | `exercised` (the vacuity) · class **2** |
| CL-2 | **NOT REACHED** — the form is incompletable, `problem_ref` refused | — | **VACUOUS** — `test` is `O` on `transfer` and none is placed | `unreachable` · `CAP-S3-1` |
| CL-3 | **NOT REACHED** | — | **VACUOUS** — `test` is `O` on `strategic` and none is placed | `unreachable` · `CAP-S3-1` |
| CL-4 | **NOT REACHED** | — | **VACUOUS** — same | `unreachable` · `CAP-S3-1` |

**Finding — the solution standard's strongest check is structurally vacuous on `conceptual` nodes, and contingently vacuous everywhere else.** Boundary confrontation draws its adversarial set from the `test` instances placed on the **same node**. SUB-2 §6.3 marks `test` **`—`** for `conceptual` and **`proof`**, and merely **`O`** for `strategic`, `debugging` (`R`), `optimization` and `transfer`. So:

- On a `conceptual` or `proof` node the check **can never run**: `test` is not applicable, so the set is empty by construction, and no author action can populate it.
- On a `strategic`, `optimization` or `transfer` node the check runs **only if** somebody chose to place an optional `test` — and **nothing requires anyone to.** A node with a REQUIRED `solution` and zero optional `test` instances passes boundary confrontation **vacuously**, which in a summary table is indistinguishable from surviving it.

This is a real gap between two landed specifications that neither could see alone: SUB-2 fixed the placement matrix before SUB-4 wrote the standard, and SUB-4's strongest check reads a form the matrix does not require to exist. **Filed as `OI-S11-3`**, owner **SUB-4 (NEU-960)** for the standard and **SUB-9 (NEU-965)** for the gate (`G-BOUNDARY`). **SUB-4's standard is not amended here** — that is expressly out of this sub-task's scope, and a downstream consumer's discomfort is not an adjudication.

**What was refused.** Placing an optional `test` on each node purely so the boundary-confrontation check would have something to run against, and then reporting the check as passed. That would be manufacturing the adversarial set the check exists to draw independently, and the pass would be a fact about this sub-task's tidiness rather than about the artifact.

### 4.3 The proof standard — `04_…` §2.3, on `proof`

**Its own three checks:** **slot presence** (all three of `optimal_substructure`, `overlapping_subproblems`, `recurrence_justification`), the **closure link** — *"the instance in `separating_distractor_or_boundary_input` names no case label appearing in `recurrence_justification`"* — which SUB-4 names **the gap-catcher**, and **dependency resolution**.

`proof` is **`O`** on `conceptual`, `strategic` and `transfer` — the types of all four exemplar nodes — and is **`R`** only on nodes typed `proof`. **No exemplar in this document places a `proof` instance**, and none is required to.

| Exemplar | Verdict | Class |
| --- | --- | --- |
| CL-1 · CL-2 · CL-3 · CL-4 | **NOT APPLICABLE** — `proof` is `O` on all four node types and none is placed. **All three checks are vacuous, and none is reported as passed.** | `unreachable` (no artifact) · no evidence class claimed |

**Filed as `OI-S11-4`**: **the proof standard is entirely unexercised by this package's exemplar set**, and it will stay unexercised until an exemplar is authored on a node typed `proof`. CL-1 owns five such nodes (`cl-1.prove-recurrence-correctness` plus five per-technique proofs, per the cluster file's own type census) — none of which is in any cluster's *"nearest existing nodes"* table, so none was selectable under §3.0's node-selection rule. Owner: **SUB-12 (NEU-969)** at package reconciliation, to decide whether the package needs a fifth exemplar on a `proof`-typed node. **This sub-task does not author one**: its charter allocates one exemplar per cluster, and a fifth would be authoring beyond the allocation.

### 4.4 The test standard — `04_…` §2.4, on `test`

**Its own four checks:** **label presence** (`kind:` reading exactly `edge` or `misconception`), the **set-level coverage count** (*"the node's `test` set does not contain **both** labels"*), **refusal accounting** (a `test` whose `expected_behavior` reads `REFUSED — not verifiable` is **not counted** toward either label), and the **self-oracle** check.

| Exemplar | `test` placement | Verdict | Class |
| --- | --- | --- | --- |
| CL-1 | **`—`** — not applicable for `conceptual` | **NOT APPLICABLE.** The standard cannot attach, and no coverage is claimed or implied. | `unreachable` (structural) · class **2** |
| CL-2 · CL-3 · CL-4 | **`O`** — none placed | **NOT RUN.** The set-level coverage count over an **empty** set would report "does not contain both labels" — a **failure on an artifact that does not exist**, which is not a finding about anything. | `unreachable` · class **2** |

**Consequence, stated rather than left implicit.** SUB-4 §2.4's coverage obligation is a property of the **set** of `test` instances on a node. Where `test` is `O` and none is placed, the set is empty, and an empty set trivially fails the both-labels count. **The standard as written has no stated disposition for the empty set** — it is silent on whether an unplaced optional form is a coverage failure or simply out of scope. This document reads it as out of scope (no artifact, no verdict) and **records the reading rather than asserting it is the standard's**. Carried inside `OI-S11-3`, whose owner is SUB-4.

### 4.5 Roll-up

| | |
| --- | --- |
| Standard × exemplar cells | **16** |
| Cells with a **run** check producing a verdict | **8** — the explanation standard's field floor and restatement check, ×4 exemplars |
| Cells `unreachable` behind `CAP-S3-1` | **3** — the solution standard on CL-2/CL-3/CL-4 |
| Cells structurally **not applicable** | **4** — the proof standard ×4 |
| Cells **vacuous by construction** | **1** — the solution standard on CL-1 (empty adversarial set) |
| Checks **not run by refusal**, with the refusal recorded | **4** — the depth check ×4 (`OI-S11-5`) |
| **Violations detected** | **0 in the artifacts.** **Two in the standards' own reach** — `OI-S11-3` (boundary confrontation is vacuous where `test` is `—` or unplaced) and `OI-S11-4` (the proof standard is unexercised by the exemplar set). |

**Zero detected artifact violations is not a pass, and is not reported as one.** Eight of sixteen cells ran a check, all eight of them the two *mechanical* layers of one standard, against artifacts **this sub-task wrote to satisfy them**. `CAP-S1-4`'s lineage applies in full: an author checking its own completeness shares the author's blind spots by construction. The mitigation is that the eight ran checks are **mechanical** (field presence, id resolution, string non-equality modulo a negation token) and re-runnable by a third party from `traceability/11_…`. The mitigation is not a fix, and it is filed as **`CAP-S11-2`**.

---

## 5. Acceptance scenario 1 — the rubric review of four exemplars

**The scenario:** *a rubric review of four exemplars against seven observable elements, with 4/4 cluster coverage.*

| Limb | Outcome | Class | Evidence class |
| --- | --- | --- | --- |
| **Four exemplars exist** | **YES** — §3.1–§3.4 | `exercised` | 2 |
| **One per cluster; coverage 4/4** | **YES** — §3.5 | `exercised` | 2 |
| **E1 node identity** on each | **YES, 4/4** — every id, `skill_type` and cluster read from `docs/research/C005-dp-map/nodes/*.yaml` by string equality | `exercised` | 2 |
| **E2 REQUIRED form set** per SUB-2 §6.3 | **PARTIAL, 1/4 complete** — 21 of 27 instantiated, 6 `unreachable`, every one of the 6 a citation-bearing REQUIRED form | `exercised` (the count) · `simulated` (the instances) | 2 · 3 (n = 1) |
| **E3 discriminative pair** on every discriminative form | **YES** — present and non-empty on all 17 instantiated discriminative forms | `exercised` | 2 |
| **E4 provenance** naming the sanctioned path | **YES, 4/4** — recorded path `none — gate` for all twelve sources; **zero requests issued by this sub-task**; `CAP-S3-1`/`CAP-S3-2` cited by id | `unreachable` (the citation) · `exercised` (the record read) | 2 |
| **E5 standards conformance** | **PARTIAL** — §4.5; 8 of 16 cells produced a verdict | `exercised` / `unreachable` | 2 |
| **E6 calibrated difficulty** with the verbatim label | **YES, 4/4** — four triples computed from the map, each carrying `07_…` §9.4 verbatim | `exercised` | 2 |
| **E7 workflow position** | **YES, 4/4** — all four units in `draft`, no transition taken; `creator_review: "deferred-provisional"` on 4/4 nodes | `exercised` | 2 |

**Scenario verdict: the review ran, 4/4 clusters are covered, and 1 of 4 exemplars is complete.** The scenario's observable elements are all present; **three of the four artifacts they describe are not.**

### 5.1 The first-ever execution of SUB-7's combination rule — bounded, n = 4

`CAP-S7-3` records that *"the combination rule has never been run end-to-end over real values. No `calibrated_difficulty` triple was computed, published or compared for any of the 179 nodes."* **This document computes four**, from map values, and reports what the n = 4 sample shows and nothing more.

| Node | `structural_tier` | PLI | `stage_band` |
| --- | --- | --- | --- |
| `cl-1.judge-dp-applicability` | 1 | 8 | `PS-1` |
| `cl-3.recognize-bitmask-state-applicability` | 5 | 10 | `PS-4` |
| `cl-2.recognize-an-implicit-dag` | 5 | 13 | `PS-4` |
| `cl-4.select-mainstream-optimization` | 6 | 10 | `PS-4` |

**Lexicographic order (tier, then PLI, then band):** CL-1 < CL-3 < CL-2 < CL-4. **No two triples are equal, so no incomparability arose in this sample** — a bounded observation against `OI-S7-4`, over **4 of 179 nodes**, which says nothing whatever about the rate over the full set.

**One observation SUB-7 explicitly declined to assert, now available at n = 4 and reported as n = 4.** `07_…` §3.3 states *"the per-dimension numeric range of D2–D6 is not asserted here. No pass audited it."* In this sample the five load dimensions take values in **{0, 1, 2, 3, 4, 5}** — `proof_obligation_load: 0` on `cl-3.recognize-bitmask-state-applicability`, `recognition_load: 5` on two nodes. **The dimensions are therefore not 1-indexed.** This is **not** a range for the 179 and must not be read as one; it is four nodes' worth of observed values, filed as **`OI-S11-6`** so a future pass measures the range properly rather than generalising from here.

**`CAP-S7-3` is not closed, not partially closed, and not edited.** Its closure condition is *"the rule is executed over the real node set and its output characteristics are recorded"* — **179 nodes, not 4.** Four is a demonstration that the rule computes; it is not the execution the cap names. **`CAP-S7-3` is SUB-7's row and is not touched here.**

### 5.2 Provisional difficulty reliance, surfaced with owner and revision trigger

Every one of the four triples above rests on **six provisional inputs on a node whose `creator_review` reads `"deferred-provisional"`** — confirmed by direct read on all four, 4/4.

| Reliance | SUB-7 row | Owner | Revision trigger |
| --- | --- | --- | --- |
| PLI's five summands (`state_formulation_load`, `transition_derivation_load`, `proof_obligation_load`, `implementation_load`, `recognition_load`) | `PR-1`…`PR-5` | **the creator** | The creator reviews progression plausibility (`CAP-S8-2`; C005 assumption #11) |
| `stage_band` = `progression_stage`, and its `PS-2`/`PS-3`/`PS-4` granularity | `PR-6` | **the creator** (review) / **NEU-940 · NEU-888** (granularity) | The creator reviews plausibility; **or** NEU-888 supplies discriminating evidence |
| The whole combination rule — that these seven fields are the dimensions and that PLI weights them equally | `PR-7` | **the creator** | **`OI-S7-1`** — the escalated dimension-set choice is settled |
| The absence of any external cross-check | `PR-11` / **`CAP-S7-1`** | **SUB-1 (NEU-957)** for re-verification; **SUB-3's successor** for execution | `CAP-S3-1` closes and `07_…` §5.4 executes for real |

**Only `structural_tier` is class MD.** `prerequisite_depth` is re-derivable from the map by a third party and was re-derived 179/179 by SUB-7's validator run. **The other two components of every triple are class P**, and this document re-classes nothing upward.

---

## 6. Acceptance scenario 2 — the adversarial AI-generated solution

**The scenario:** *an AI-generated solution carrying ambiguity, unsupported provenance and a hidden failing case is deterministically blocked or quarantined with an explicit reason, **without an AI judge being the only thing that looked at it***.

**The specimen.** A constructed `solution` instance offered against `cl-3.recognize-bitmask-state-applicability`, carrying all three defects deliberately. **It is a specimen, not a real submission**; every identifier in it is withheld under `C2` / `EXC-1`.

```
form: solution
node_id:                cl-3.recognize-bitmask-state-applicability
problem_ref:            <a plausible-looking identifier and address, supplied from memory>
approach_class:         "bitmask DP"
reasoning:              "The subset is small so we can carry it in a mask and iterate over
                         all submasks. This is efficient enough."
                        [no named `invariant` slot]
exposure_precondition:  "after the learner has attempted"
complexity_claim:       "fast enough in practice"
```

**The one deliberate exception in this document, stated rather than hidden.** Every other `problem_ref` and `problem-reference` field here reads exactly `REFUSED — not verifiable`. **This one does not, and cannot** — an unsupported-provenance defect that reads `REFUSED — not verifiable` carries no defect, and step 1 below would have nothing to fire on. The field therefore carries a **bracketed description of the defect, not an instance of it**: no identifier, no address, no URL and no source name appears in it or anywhere else in this document. The mechanical scan in `traceability/11_…` §6 reports **22 citation-field-bearing lines, 1 deliberate specimen exception, 0 URL-shaped strings and 0 identifier-shaped strings**, and names this line explicitly rather than excluding it from the count.

### 6.1 The walk, in firing order

| # | Mechanism | Gate | Behaviour | What fires, and the explicit reason recorded | Class |
| --- | --- | --- | --- | --- | --- |
| **1** | **`schema`** | **`G-FIELDSET`** | **`blocks`** | `problem_ref` carries a value that is **not** a verified citation. The interim stored set is `stable_id` + `canonical_url` **only**, and both must be **copied from the host, never constructed**. A value supplied from memory is not a copied value. **Reason recorded: `unsupported provenance — problem_ref not sourced from a resolution record`.** | `simulated` · **3**, n = 1 |
| **2** | **`server-side`** | **`G-ACCESS-GATE`** | **`blocks`** | Condition 2 fires for the specimen's source exactly as it fires for all twelve: `reason: absent-decider`, disposition `Restricted`, hierarchy halts at **`V0`**. **No resolution record exists or can exist**, so the value in step 1 cannot be repaired by resolving it. **Reason recorded: `access gate shut — V0, no sanctioned path open`.** | `exercised` (the gate condition, read from `09_…` §6.1 against `01_…` §3) · **2** |
| **3** | **`deterministic`** | **`G-INVARIANT-SLOT`** | **`blocks`** | `reasoning` is present and carries **no named `invariant` slot**. SUB-4 §2.2's first check — slot presence — fails on the artifact as written. **Reason recorded: `no invariant slot in reasoning`.** | `simulated` · **3**, n = 1 |
| **4** | **`automated`** | **`G-BOUNDARY`** | **`blocks`** | Boundary confrontation. **Cannot run** — the node carries **zero** `test` instances (`test` is `O` on `strategic`), so the adversarial set is empty. **The hidden failing case is NOT caught here.** See §6.2. | **`unreachable`** · `OI-S11-3` |
| **5** | **`AI`** | **`G-DEPTH-BOUND`-class judgement** | **`quarantines`** | Whether *"efficient enough"* and *"fast enough in practice"* constitute **ambiguity** that makes the artifact unusable is a judgement. Per SUB-9 §3.2's binding rule, an `AI` requirement **may never `blocks` on the judgement itself**, so this **`quarantines`**: `reason: ai-judgment-unresolved`, `owner:` the correctness-reviewer role — **never the party who recorded the quarantine** — `exit_condition:` the reviewer adjudicates. | `simulated` · **3**, n = 1 |

### 6.2 Scenario verdict, limb by limb

| Limb the scenario demands | Outcome |
| --- | --- |
| **The artifact is deterministically blocked or quarantined** | **YES.** Three `blocks` verdicts fire (`schema`, `server-side`, `deterministic`) and one `quarantines`. |
| **With an explicit reason** | **YES.** Four distinct recorded reasons, quoted in §6.1. None is "failed review". |
| **Without an AI judge being the only thing that looked at it** | **YES, and this is the limb that matters.** **Three non-`AI` mechanisms across three distinct mechanism values fire *before* the `AI` row is reached**, and each blocks on its own. Removing the `AI` row entirely leaves the artifact blocked three times over. |
| **Unsupported provenance is caught** | **YES** — steps 1 and 2, `schema` then `server-side`, neither of them a judgement. |
| **Ambiguity is caught** | **PARTIALLY.** The *missing invariant slot* — the mechanical shadow of the ambiguity — is caught deterministically at step 3. The **ambiguity itself** is caught only at step 5, by judgement, and therefore `quarantines` rather than `blocks`. |
| **The hidden failing case is caught** | **NO.** Step 4 is `unreachable`. SUB-4 names boundary confrontation *"the one that matters"* and *"the difference between a standard that catches a hidden failing case and one that merely asks the author to have thought about it"* — and on this node it **cannot run**, because the node carries no `test` instances and nothing requires it to. **The specimen's hidden failing case survives every check in this package.** |

**The scenario passes on its stated criterion and fails on a criterion it did not state.** The criterion as written — *deterministically blocked or quarantined, with an explicit reason, not by an AI judge alone* — is **met, three times over, by three different non-`AI` mechanisms**. But the scenario's own premise mentions a hidden failing case, and **the hidden failing case is not detected**. Reporting only the pass would be exactly the laundering this package exists to prevent. **Filed inside `OI-S11-3`**, which now carries both the structural cause and this worked instance of its cost.

**What was refused.** Placing a `test` instance on `cl-3.recognize-bitmask-state-applicability` so that step 4 would fire, and reporting the scenario as fully passed. The `test` would have been authored by the same pass that authored the defect, chosen to catch it — a self-oracle at the set level, which is the same defect `04_…` §2.4's self-oracle check exists to reject one level down.

---

## 7. Cap inheritance, by id

**Every capped element below is inherited and cited by id, in place of the element. No cap is restated, re-argued, re-owned or closed** — `SUB-12 (NEU-969)` is the single owner of the caps register, and this section adds no duplicate of any entry.

| Capped element | Where it bites in this document | Cap id | Owner (unchanged) |
| --- | --- | --- | --- |
| No verified citation; cluster coverage 0/4 | Every `problem_ref` and `problem-reference`; the 6 `unreachable` REQUIRED limbs; the whole solution standard on 3 of 4 exemplars | **`CAP-S3-1`** | SUB-1 (NEU-957) / SUB-3's successor / the creator |
| `CAP-2` closure declined (`D-R5`) | Why no resolution record exists to repair a refused `problem_ref` | **`CAP-S3-2`** | the creator / SUB-1 / SUB-3's successor |
| Twelve rows are **restricted by default**, not verified-restricted | §3's E4 rows; nothing here reads a restricted row as an observed refusal | **`CAP-S1-1`** | the creator |
| The permitted field set is filed, not decided | The interim `stable_id` + `canonical_url` shape — consumed, never widened | **`CAP-S1-2`** · `CH-F5-1` · `DR-C09-01` · `OI-S1-13` | NEU-932 / the creator |
| Non-root `conceptual` coverage is 0/3 for CL-2, CL-3, CL-4 | The conceptual limb of three of the four exemplars | **`CAP-S5-1`** · `OI-S5-1` | the map's owner / the creator |
| Whether each obligation clears the `S1→S8` cascade is unadjudicated | Why no route in `05_…` §6 is chosen here | **`CAP-S5-2`** | the map's owner / NEU-933 |
| No external difficulty anchor for any of the 179 nodes | The verbatim label on all four triples | **`CAP-S7-1`** | SUB-1 / SUB-3's successor / the creator |
| The combination rule ships unexercised | §5.1 computes four triples and does **not** close it | **`CAP-S7-3`** | SUB-9 / the creator |
| `creator_review` `"deferred-provisional"` on 179/179; the flip is executed by nobody | E7 on all four exemplars; §5.2's reliance table | **`CAP-S8-2`** | the ledger's owner / the map's owner |
| The workflow has never run on a real content unit | All four units sit in `draft`, no transition taken | **`CAP-S8-4`** | the creator |
| 59 gates specified, zero implemented | Every `blocks`/`quarantines` verdict in §6 is a **specification** verdict | **`CAP-S9-1`** · `OI-S9-16` | the creator |
| Two residuals carry `none — cap` | Inherited unchanged; this document proposes no gate for either | **`CAP-S9-3`** | the map's owner / the creator |
| The contamination probe was not executed; the one AI review **fails** `C-3` | Why §4.1's depth check is refused rather than run | **`CAP-S9-4`** | the creator |
| The standards-conformance review is SUB-11's, cited never produced by SUB-4 | §4 **is** that review; its run-and-cite condition is discharged | **`CAP-S4-3`** | SUB-11 (NEU-967) — **this sub-task** |
| `qa-execution:engine` unconfigured | §13 | **`CAP-S1-3`** · `CAP-S2-2` · `CAP-S3-6` · `CAP-S4-1` · `CAP-S5-3` · `CAP-S6-5` · `CAP-S7-4` | the creator |
| The anti-fabrication scans are lexical | §12's limitation statement | **`CAP-S1-5`** · `CAP-S2-6` | SUB-1 (NEU-957), enforced at review |
| The drift simulations are desk-executed by the producing task; **owner named as SUB-11 at standards-conformance review** | Read and **not** re-run here — see the note below | **`CAP-S10-5`** | SUB-11 / SUB-12 |

**One inherited assignment is addressed and one is explicitly declined.**

- **`CAP-S4-3` is discharged as to its stated closure condition** — *"SUB-11 runs the standards-conformance review against these four standards and its result is cited back into this package"*. §4 is that review and this is that citing. **The underlying limitation it names — that SUB-4's own walkthrough says nothing about real exemplars — stands.** `CAP-S4-3` is SUB-4's row and is **not edited here**.
- **`CAP-S10-5` names SUB-11 as an owner** — *"closes when the simulations are re-run by a party other than the producing task, against a real citation."* **This sub-task does not close it and does not re-run them.** The closure condition has two limbs and this sub-task can satisfy at most one: there is **no real citation** to re-run against (`CAP-S3-1`), so a re-run here would be a second desk pass over the same constructed specimens by a second producing task — which changes the author and not the evidence class. **Declined explicitly rather than left ambiguous.** `CAP-S10-5` is SUB-10's row and is not edited.

---

## 8. Per-exemplar provenance, and the request audit

**Requests issued by this sub-task to any of the twelve sources, on any path, at any point: zero.**

| Exemplar | Source class the citation would come from | Sanctioned path from SUB-3's record | Recorded resolution path | Stored value |
| --- | --- | --- | --- | --- |
| CL-1 | C1 (CSES) carries the foundational material for CL-1/CL-2 | Path (2) — single targeted fetch by id. **Not** bulk enumeration, which is prohibited for everybody on every branch | **`none — gate`** | `REFUSED — not verifiable` |
| CL-2 | C1 / C2 | Path (2) | **`none — gate`** | `REFUSED — not verifiable` |
| CL-3 | C2 / C3 (AtCoder EDPC/TDPC) | Path (2) | **`none — gate`** | `REFUSED — not verifiable` |
| CL-4 | C4 (Codeforces) — **the only source with a documented public API**, path (1) | Path (1) — `api.codeforces.com`, the documented public API | **`none — gate`** | `REFUSED — not verifiable` |

**`none — gate` is a real recorded value, not a blank.** `03_…` §9.1's request-pattern audit records it for every one of the twelve sources: the gate closed before any path was reached, so the resolution path is the gate itself. **The path named in column 3 is the path that *would* be sanctioned if the gate opened** — it is read from SUB-3's hierarchy, not chosen here, and naming it is not authority to walk it.

**Nothing here promotes a restricted source.** `01_…` §3's rows are `Restricted` **by default**, not by observed refusal (`CAP-S1-1`), and this document treats an inability to read a source's terms as **never** permission. Network capability exists against a neutral endpoint (`OI-S3-2`) and **capability is not authority.**

**No problem statement text, problem list or enumerated candidate set is stored anywhere in this document** (`01_…` §5, §6). No field beyond the interim `stable_id` + `canonical_url` shape is stored — and neither of those two is populated, because neither is verifiable.

---

## 9. What this document relies on that is provisional

| Reliance | Class | Owner | Revision trigger |
| --- | --- | --- | --- |
| The four nodes' five load dimensions and `progression_stage` | **P** — `creator_review: "deferred-provisional"`, 4/4 | **the creator** | The creator reviews progression plausibility (`CAP-S8-2`) |
| The dimension set itself, and PLI's equal weighting | **P** — charter assumption 16 `[unconfirmed]` | **the creator** | **`OI-S7-1`** resolves |
| The interim stored field set | unresolved | **NEU-932 / the creator** | **`CH-F5-1`** resolves |
| SUB-2's placement matrix as a per-node truth | **provisional** — `OI-S2-3` records it as a design assertion, not a per-node derivation | **SUB-2 (NEU-958)** | A per-node derivation is performed |
| SUB-9's mechanism assignments used in §6 | **provisional** — `OI-S9-15`: one unreviewed pass by one model | **SUB-9 (NEU-965)**; **SUB-11 / SUB-12** for the misclassification half | A row's mechanism assignment is re-read |
| Every ordering statement in §5.1 as a **structural-load** claim only | **non-downgradable** — `R1` / `X-D3`, `PR-8` | **NEU-887 / the creator** | **Nothing in C005 or C009 closes it.** Carried undiminished |

**`OI-S9-15` names SUB-11 as an owner of the misclassification half** and this document exercises that: §6's walk re-reads five mechanism assignments against their membership tests and **found no misclassification among the five**. That is **5 of 89 rows**, by the same model that wrote them, and it is reported as such. It closes nothing.

---

## 10. Self-classification against SUB-9's scheme

**This section discharges SUB-9 §3.5's residual clause for this sub-task.** SUB-9's classification pass was complete when it shipped and cannot reach a requirement written here, so the requirements below are classified against SUB-9's **published** scheme, in **SUB-9 §3.6's row shape**, using SUB-9's closed vocabularies on all three axes, ids namespaced **`EQ-S11-k`**. **The weakest-sufficient, first-match-wins order — `deterministic → schema → server-side → automated → AI` — is applied, not re-derived.**

### 10.1 The table

| Id | Requirement, in the owner's own words | Mechanism | Blocking behaviour | Placement | Gate id | AI-judgment-only? |
| --- | --- | --- | --- | --- | --- | --- |
| `EQ-S11-1` | **An exemplar names a node id copied from the map**, with that node's recorded `skill_type` — never a described, inferred or remembered id (§3.0) | `deterministic` | `blocks` | authoring-time | `G-NODE-EXISTS` | no |
| `EQ-S11-2` | **The REQUIRED form set is the one SUB-2 §6.3 gives for the node's own `skill_type`** — read from the node record, never from the cluster or from the exemplar's intent (§3) | `deterministic` | `blocks` | authoring-time | `G-PLACEMENT` | no |
| `EQ-S11-3` | **A REQUIRED form that cannot be instantiated is recorded `unreachable` with a cap cited by id** — never omitted, and never counted as instantiated (§3.5) | `schema` | `blocks` | authoring-time | `G-FORM-REQUIRED` | no |
| `EQ-S11-4` | **Every limb carries exactly one class** from `exercised` · `simulated` · `unreachable`, and **exactly one** NEU-887 evidence class (§2) | `deterministic` | `blocks` | authoring-time | `G-CLASS-ONE` | no |
| `EQ-S11-5` | **A `simulated` limb is never reported as an `exercised` one**, and repetition does not promote it — four desk walks are four desk walks (§2.1) | `deterministic` | `blocks` | authoring-time | `G-CLASS-MONO` | no |
| `EQ-S11-6` | **No class 7 `[future-real-user]` claim appears**, and no exemplar is presented as external-user or expert validation (§2.2) | `deterministic` | `blocks` | authoring-time | `G-CLASS7` | no |
| `EQ-S11-7` | **Every `problem_ref` and `problem-reference` field reads exactly `REFUSED — not verifiable`** while the access gate is shut; no identifier or address is constructed, assembled or recalled (§8) | `schema` | `blocks` | authoring-time | `G-FIELDSET` | no |
| `EQ-S11-8` | **A refusal is an admissible value where the standard says so**, and a refused slot is never counted toward a coverage claim (§4.1, §4.4) | `deterministic` | `blocks` | authoring-time | `G-REFUSAL-OK` | no |
| `EQ-S11-9` | **A per-exemplar provenance row names the sanctioned path from SUB-3's record and issues no request** — naming a path is not walking it (§8) | `server-side` | `blocks` | authoring-time | `G-ACCESS-GATE` | no |
| `EQ-S11-10` | **No exemplar stores problem statement text, a problem list or an enumerated candidate set** (§8) | `automated` | `blocks` | authoring-time | `G-NOTEXT-SCAN` | no |
| `EQ-S11-11` | **Each standard is applied by its own stated violation-detection method**, named in the standard's own words — never a substitute or a global rubric (§4) | `schema` | `blocks` | authoring-time | `G-MATCH` | no |
| `EQ-S11-12` | **A check that cannot run is recorded vacuous or `unreachable`, never as passed** — a vacuous pass and a demonstrated one are not the same row (§4.2, §4.4) | `deterministic` | `blocks` | authoring-time | `G-V-ALL` | no |
| `EQ-S11-13` | **The adversarial walk records its firing order**, and a scenario passes the *"not an AI judge alone"* limb only if a **non-`AI`** mechanism blocks independently (§6) | `deterministic` | `blocks` | authoring-time | `G-HUMAN-REQUIRED` | no |
| `EQ-S11-14` | **An `AI` verdict `quarantines`; it never `blocks` on the judgement itself**, and its quarantine names `reason`, `owner` — never the recorder — and `exit_condition` (§6.1 step 5) | `deterministic` | `quarantines` | authoring-time | `G-QUARANTINE-SLOTS` | no |
| `EQ-S11-15` | **Every calibrated value carries `07_…` §9.4's label verbatim**, and the triple is never collapsed to a scalar (§3, §5.1) | `deterministic` | `blocks` | authoring-time | `G-CALIB-LABEL` | no |
| `EQ-S11-16` | **The triple is computed as SUB-7 §5.1 states** — `prerequisite_depth`, the equal-weight sum of exactly five load dimensions, and `progression_stage`; **`entry_gate` is never an input** (§5.1) | `deterministic` | `blocks` | authoring-time | `G-CALIB-SHAPE` · `G-NO-ENTRYGATE` | no |
| `EQ-S11-17` | **An n = 4 observation is reported as n = 4** and never as a range, distribution or rate over the 179 (§5.1) | `deterministic` | `blocks` | authoring-time | `G-GENLABEL` | no |
| `EQ-S11-18` | **No exemplar retypes, mints or reclassifies a map node**, and no conceptual-flavoured content is authored against a `strategic` or `transfer` node (§3.2) | `deterministic` | `blocks` | authoring-time | `G-NO-RETYPE` | no |
| `EQ-S11-19` | **Every inherited cap is cited by id and never restated, re-owned or closed** (§7) | `schema` | `blocks` | authoring-time | `G-RIGHTS-CITE` | no |
| `EQ-S11-20` | **This review was run by the party that produced the artifacts**, and says so in the same breath as its result (§4.5) | `deterministic` | `warns` | authoring-time | `G-SELF-REVIEW` | no |
| `EQ-S11-21` | **Whether an exemplar is a *good* exemplar** — whether its misconception is the one a real learner holds, and whether its `does_not_apply_when` names the situation that actually matters | **`AI`** | `quarantines` | authoring-time | `G-DISCRIMINATION` · `OI-S11-7` | **yes** |
| `EQ-S11-22` | **Whether the seven observable elements fixed in §2.3 are the charter's seven** | **`AI`** | `quarantines` | authoring-time | **`none — cap`** · `OI-S11-1` | **yes** |
| `EQ-S11-23` | **This sub-task's residual clause** — a quality requirement of this sub-task missing from this table defaults to **blocked until classified** (§10.4) | `deterministic` | `blocks` | authoring-time | `G-RESIDUAL` | no |

### 10.2 The roll-up

| | |
| --- | --- |
| **Rows** | **23** |
| **Mechanism** | `deterministic` **14** · `schema` **5** · `server-side` **1** · `automated` **1** · `AI` **2** |
| **Blocking behaviour** | `blocks` **19** · `warns` **1** · `quarantines` **3** |
| **Placement** | authoring-time **23** · serve-time **0** · both **0** |
| **`AI`-judgment-only rows** | **2** — `EQ-S11-21`, `EQ-S11-22`. **Both carry a §3.4 enforcement-gap entry** (§10.3). |
| **Rows with `none — cap`** | **1** — `EQ-S11-22` |

**Zero serve-time placements**, and that is correct rather than an omission: no learner-facing serve surface exists (`CAP-S9-6`; NEU-891 / NEU-892), and every requirement here is about how an exemplar is authored and reviewed. **Placing a gate on a surface that does not exist would be a placement this sub-task cannot honour.**

**The one `warns` row inherits `OI-S9-12` whole** — *"a warning nobody reads is an unenforced requirement wearing an enforcement's clothes."* `EQ-S11-20` is `warns` because the obligation it carries is **disclosure**, not correctness: an author who discloses that they reviewed their own work has satisfied it, and blocking on it would block every self-reviewed artifact in a package where every artifact is self-reviewed. **It was not escalated to `blocks` to make the table read stronger.**

### 10.3 The enforcement-gap entries — SUB-9 §3.4's four-field shape

| Flag | The judgement, stated | Row | Compensating observable gate | Mechanism | Gate owner | **What the gate does NOT catch** |
| --- | --- | --- | --- | --- | --- | --- |
| **`OI-S11-7`** | **Whether an exemplar is a good exemplar** — whether the misconception named in `misconception_or_edge_case` is one a real learner actually holds, and whether the `separating_distractor_or_boundary_input` genuinely separates it rather than merely differing from it | `EQ-S11-21` | **`G-DISCRIMINATION`** (`schema`) — the REQUIRED pair is present and non-empty on every discriminative form, and SUB-6 §5.2's four-condition happy-path check is decidable by inspection | `schema` | **SUB-6 (NEU-962)** for the discrimination design; build owner **the creator** | **Whether the named misconception is real.** The gate proves a field is filled and that the item is not happy-path-only. It cannot distinguish a misconception a learner holds from one an author found plausible — and **an author who invents a misconception fills the field perfectly.** In the other direction it over-fires on nothing at all, which is worse: it produces no queue of suspicious items for a reviewer to work through, so a fabricated misconception is invisible rather than merely unconfirmed. Closing it needs **class 3 evidence from real learners**, which is `CAP-S8-1`'s territory and does not exist. |
| **`OI-S11-1`** | **Whether §2.3's seven elements are the charter's seven** — the charter requires "seven observable elements" and this document fixes them as E1–E7 from what the acceptance scenarios demand, rather than copying a list it could quote | `EQ-S11-22` | **`none — cap`** — see `CAP-S11-1` | — | **SUB-12 (NEU-969)** at package reconciliation | **Everything.** No gate is possible from this side: a gate that checked E1–E7 would check this document's own list against itself. The only thing that resolves it is a reader with the charter's enumeration in hand comparing the two. **If the lists differ, every rubric row in §5 is mislabelled** — the *elements* would be wrong even though the *observations* stand, because each observation is independently recorded. That bound is the reason this is a cap and not a defect. |

### 10.4 This sub-task's residual clause

> **Any quality requirement produced by this sub-task that §10.1 does not enumerate defaults to `blocked until classified`** — never to unenforced, never to `warns`, and never to "presumably like a neighbouring row". §10.1's 23 rows are **the floor, not the boundary**.

**Why it is filed rather than read as discharged.** `OI-S9-15` records that SUB-9's classification is one unreviewed pass by one model, and `OI-S10-6` records the same of SUB-10's 23 rows. **This table is the third instance: one pass, one model, reviewed zero times.** A row wrongly assigned `deterministic` reads as enforced and is not, and **the residual clause does not fire for a *mis*classified requirement — only for a missing one.** Filed as **`OI-S11-8`**.

### 10.5 No new gate id is introduced

**Every gate id in §10.1 already exists in `09_…` §7.** This sub-task introduces **zero** new gates and proposes **zero** amendments to SUB-9's gate set. Where a row's obligation has no gate, the cell reads the literal **`none — cap`** with a named owner, per SUB-9 §3.4 — never a plausible-sounding gate invented to make the table read complete, which `CAP-S9-3` names as *"worse than `none — cap`, because it removes the row from a reader's attention."*

**Adding a gate here would be re-deciding SUB-9's artifact.** SUB-9 owns both the blocking-behaviour axis and the placement axis and published a closed 59-gate set; a downstream consumer's need for a sixtieth is a request to SUB-9, not an amendment by a consumer. **The need did not arise: 22 of 23 rows mapped to an existing gate on the first pass**, which is itself a bounded observation about the gate set's coverage — n = 23, one consumer, and it is not a completeness claim about the 59.

---

## 11. `docs/GLOSSARY.md` — untouched, and the choice is disclosed

**`docs/GLOSSARY.md` is not modified by this change.** SUB-2, SUB-7, SUB-8, SUB-9 and SUB-10 all left it untouched deliberately (`OI-S6-9` records SUB-6's identical deferral for its signal ids). **This sub-task follows that precedent rather than diverging from it**, and discloses the choice rather than leaving it silent.

The terms this document introduces — the per-limb classes `exercised` / `simulated` / `unreachable`, and the ids `E1`–`E7` and `EQ-S11-k` — are **package-internal vocabulary scoped to `docs/research/C009-course-content-quality/`**, not project domain terms of the kind the repository's glossary indexes (`chunk`, `leech`, `tier`, `roadblock`, `port`). Registering them would put research-package scaffolding into a lookup table whose stated job is resolving a term to its **owning module and defining source file**, and none of these has one. **If SUB-12 judges otherwise at reconciliation, the registration is a single append.** Recorded as part of `OI-S11-8`'s reconciliation surface.

---

## 12. Scope — what this document does not do

- It does **not** author course content. Four exemplars are **specification instruments**; the package authors no curriculum (`README.md`).
- It does **not** author, re-decide, relax or amend **any** of SUB-4's four correctness standards. §4.2 and §4.4 record findings **about** two of them and change neither.
- It does **not** mint, retype, reclassify or edit **any** map node, and touches **no** file under `docs/research/C005-*`.
- It does **not** choose among `05_…` §6's three routes, and takes no position on which the map's owner should take.
- It does **not** resolve, close or partially close **any** inherited cap or open item. It discharges **one** stated closure condition (`CAP-S4-3`'s run-and-cite limb) and explicitly declines **one** assignment (`CAP-S10-5`), editing neither row.
- It does **not** own, restate or re-decide any cap — **SUB-12 (NEU-969)** is the single owner of the caps register.
- It does **not** issue a request to any source on any path, establish or re-establish any access path, or capture any external rating.
- It does **not** widen the stored field set, and stores no field at all.
- It does **not** author against the 10 `INC-C1` techniques, which have no nodes.
- It does **not** produce SUB-13's four C005-shape deliverables, SUB-12's completeness gate, the charter §8 checklist, or the register reconciliation.
- It does **not** promote anything to `settled`. **A producing task may not promote its own artifact** (`A4`).
- It **sets no status.** Status lives in a ledger.

**The mechanical checks in this document are lexical** (`CAP-S1-5`, `CAP-S2-6`, inherited as a review obligation on every C009 sub-task). They prove structural presence and absence. **They cannot prove that no sentence here is a disguised unsourced claim, and no grep can.**

---

## 13. Verification note — `qa-execution:engine` is unconfigured

This repository's capability registry resolves to **`git, linear`** only; **no capability owns the `qa-execution:engine` surface.** The automated QA-execution phase is therefore a genuine **Core Article 8 no-op** — a phase with no provider, **not** one skipped, deferred or waived. Consistent with `CAP-S1-3`, `CAP-S2-2`, `CAP-S3-6`, `CAP-S4-1`, `CAP-S5-3`, `CAP-S6-5`, `CAP-S7-4` and `CAP-S9-1`; this is the ninth independent statement of the same environmental fact, not a new finding.

**Nothing is claimed. No QA pass, scenario, verdict, report or coverage claim is asserted or implied anywhere in SUB-11's output.** The word *scenario* appears in §5 and §6 in the charter's sense — an **acceptance scenario walked at a desk** — and in no sense involving an execution engine. **Fabricating a QA pass in a document whose subject is refusing to launder weak evidence into a strong claim would falsify the deliverable by example.**

**What verification actually is here:** file inspection, `git diff` against the task's numbered success criteria, and the re-runnable lexical and structural scans recorded with their commands and outcomes in `traceability/11_exemplar-conformance-and-scenario-record.md`. The repository's own gates (`tsc --noEmit`, `eslint`) never read `docs/**` — `lint`'s scope is literally `src tests` — so **a green line there is not evidence about anything in this package**, and is not presented as any.

---

## 14. Evidence and records

| Record | Path |
| --- | --- |
| The mechanical checks, their commands, dates and outcomes | `traceability/11_exemplar-conformance-and-scenario-record.md` |
| The four node records this document reads | `../C005-dp-map/nodes/cl-1-foundational.yaml` · `cl-2-combinatorial.yaml` · `cl-3-state-compression.yaml` · `cl-4-optimization/mainstream.yaml` |
| Open items filed by this sub-task | `90_open-items-and-provisional-register.md` § `SUB-11` |
| Caps and incomplete scope declared by this sub-task | `91_caps-and-incomplete-scope.md` § `SUB-11` |
| The standards this review applies | `04_correctness-standards-and-authoring-languages.md` §2.1–§2.4 |
| The placement matrix and the ten templates | `02_content-and-exercise-forms.md` §6.3, §7 |
| The enforcement scheme, vocabularies and gate set | `09_enforceable-quality-system.md` §3, §7, §8 |
| The access-path record and the per-source resolution paths | `03_problem-citation-verification-and-access-paths.md` §5, §9.1 |
| The per-cluster conceptual obligation and its routing | `05_per-cluster-conceptual-obligation.md` §1, §4, §5, §6 |
| The calibration rule and its labels | `07_difficulty-calibration.md` §5.1, §9.4 |
