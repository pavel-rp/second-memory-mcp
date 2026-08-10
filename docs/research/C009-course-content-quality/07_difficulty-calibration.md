# Difficulty Calibration, and the Provisional Data It Rests On

**Task:** NEU-964 (SUB-7) · **Charter:** C009 (umbrella NEU-890) · **Covers:** OUT-4 · **Compiled:** 2026-08-10 · **Verification cutoff:** 2026-08-10 · **Status:** deferred — set only in `adjudication/` and, for inherited decisions, in the owning package's ledger
**Model:** claude-opus-5[1m]

---

## 0. The result, stated first

**A calibration standard ships. It calibrates on provisional data, it says so at every point of use, and it has no external cross-check at this cutoff.**

Three statements carry the whole document, and none of them is softened later:

1. **Exactly one input is verified.** `prerequisite_depth` is map-derived and **re-derivable**, and it was re-derived on 2026-08-10 by the untouched C005 integrity validator: **179/179 agree with the rubric, 0 disagree.** It is the only input in this standard whose value was checked rather than accepted.
2. **Six inputs are provisional.** The five load dimensions and `progression_stage` carry `creator_review: "deferred-provisional"` on **179/179** nodes. They are usable and **not binding**. Every calibrated output that consumes one is labelled, and every reliance is recorded with an owner and a revision trigger in §7.
3. **The external cross-check is absent — for every node, not for some.** SUB-3 (NEU-959) shipped the verification procedure and **zero citations**: all twelve sources fail the access gate at step **V0**, cluster citation coverage is **0/4** (`CAP-S3-1`), and the seed set is **empty**. The anchor-unavailable branch of OUT-4 therefore fires **universally**. Every calibrated output in this standard is labelled **no external cross-check**, and the missing anchor is recorded as `CAP-S7-1` with a named owner.

**And one thing that is not calibrated at all.** *Which* dimensions define calibration — charter assumption 16 — **could not be settled on the evidence available** and is **escalated**, not assumed through, as `OI-S7-1`, owner **the creator**. Assumption 16's default ships as the **working** set, labelled provisional on that unsettled choice everywhere it is used. It is never presented as settled.

> **The honest summary a reader should carry away:** this standard tells you how to combine the map's difficulty data and exactly how much to trust the result. At the 2026-08-10 cutoff the correct amount of trust is *"structurally sound, empirically unvalidated, and un-cross-checked."*

---

## 1. What this document is, and what it is not

**It is** the OUT-4 deliverable: the dimensions, the combination rule, the three-way input classification, the provisional-reliance record, the pre-specified `D-F5` interim branch, the pre-specified anchor-unavailable branch, and the dimension-set escalation.

**It is not:**

- **Not a difficulty score for any node.** It specifies how a calibrated value is formed and labelled; it publishes no per-node table, because doing so at this cutoff would circulate 179 provisional triples with no cross-check as though they were results.
- **Not a re-derivation of any map value.** **No map value is edited.** `docs/research/C005-dp-map/` is read and never written.
- **Not a sourcing pass.** **This sub-task issued no request to any source on any path, sanctioned or otherwise.** A rating SUB-3 did not capture is the anchor-unavailable branch (§9), never a fetch made here.
- **Not a decision about the stored field set.** That is `CH-F5-1`'s, owned by `D-F5`'s owner. This document cites the cap by id and stores nothing new (§8).
- **Not a claim about learning order.** `R1` / `X-D3` is carried **non-downgradable**: *nothing in C005 measures DP learning*, and no selected corpus is ordered by learning dependency. A calibrated difficulty here is a claim about **structural and stated load**, never a validated claim about the order in which a human learns best. §7 records this as a standing reliance.
- **It sets no status.** Status lives in a ledger.

---

## 2. The preconditions this sub-task consumes and does not re-decide

| # | Precondition | Source | Consumed as |
| --- | --- | --- | --- |
| **P1** | All twelve sources carry access disposition `Restricted`. | `01_provenance-and-rights.md` §3 | **Binding.** Not re-decided; §3.1 clause 1 bars a sub-task from forming its own view, and §11.2 reserves re-verification to SUB-1. |
| **P2** | The twelve rows are **restricted by the restricted-default rule**, not by observed refusal — NEU-957 had no network access and issued zero requests. | `OI-S1-1` … `OI-S1-12`, `CAP-S1-1` | **Restricted-by-default, never verified-restricted.** No statement here may be read as evidence that any source's terms were checked. |
| **P3** | Outbound network capability exists (neutral endpoint, deliberately not a source), firing `CAP-S1-1`'s revision trigger. | `OI-S3-2` | **Capability is not authority.** The rights gate stays shut. This sub-task fetches nothing. |
| **P4** | The seed citation set is empty; cluster coverage 0/4; `CAP-2` closure **declined** on standing. | `CAP-S3-1`, `CAP-S3-2`, `OI-S3-1`, `OI-S3-3` | The factual input to §9's anchor-unavailable branch. |
| **P5** | `CH-F5-1` is open; the stored citation record is `stable_id` + `canonical_url` **only**; title, constraints and the difficulty signal live as **dated verification observations**. | `CAP-S3-3`, `03_…` §7.1, `traceability/03_…` §2, `DR-C09-01`, `CAP-S1-2` | The binding interim for §8. **Cited by id, never restated.** |
| **P6** | The retention bound is on **retention**, not request count: an enumerating response is never stored, cached, mirrored, transcribed, or used to enumerate or rank. | `01_provenance-and-rights.md` §6, charter assumption 23 | The constraint that makes §6's list-free rule mandatory rather than stylistic. |
| **P7** | `problem-reference` is `stable_id` + `canonical_url` only; the universal pair `misconception_or_edge_case` + `separating_distractor_or_boundary_input` is never optional. | `02_content-and-exercise-forms.md` §5 | Field names used verbatim, so SUB-9 (NEU-965) merges this output without translation. |

**None of P1–P7 is re-opened here.** Each is cited by id and consumed.

---

## 3. The dimension set — **escalated, not settled**

### 3.1 Why it is escalated

Charter assumption 16 records the default — the five provisional load dimensions combined with C4's numeric ratings as an independent external anchor, `entry_gate` excluded — and marks it **`[unconfirmed]`**. OUT-4 requires this sub-task to **settle or escalate** it, never to assume through it.

The evidence that would discriminate between candidate dimension sets is of exactly two kinds:

- **the creator's plausibility review** of the map's provisional values — **deferred on 179/179** (`02_authoring-requirements.md` §4.3); and
- **real external ratings** to test whether a candidate set orders nodes the way an independent signal does — **zero available** (`CAP-S3-1`).

**Neither exists at this cutoff.** A dimension set chosen now would be chosen on the authoring pass's taste, and shipping that as settled is precisely the laundering OUT-4 exists to prevent. **The question is therefore escalated**, with the defined non-silent exit: **`OI-S7-1`**, owner **the creator** — the only qualified reviewer of the map's provisional values — carrying the candidate sets, the discriminating evidence, and the revision trigger (§10).

**Exactly one of the two exits is taken.** There is **no dimension-set decision record** in `decision-records/`, because the choice is not decided. The escalation entry is the artifact.

### 3.2 The working set, adopted loudly

Pending that escalation, the standard operates on assumption 16's default as the **working** dimension set. It is adopted **explicitly and visibly**, and **every calibrated output is labelled provisional on the unsettled dimension choice** (§7, reliance `PR-7`). It is never presented as settled, and the escalation never disappears into the standard.

Field names are taken verbatim from `../C005-dp-map-package/02_authoring-requirements.md` §4.1, `dimension_set_version: "1.0.0"`.

| # | Dimension | Field name | Input class (§4) |
| --- | --- | --- | --- |
| **D1** | Structural tier | **`prerequisite_depth`** | **MD** — map-derived, re-derivable |
| **D2** | Cost of formulating the state | **`state_formulation_load`** | **P** — provisional |
| **D3** | Cost of deriving the transition | **`transition_derivation_load`** | **P** — provisional |
| **D4** | Weight of the correctness obligation | **`proof_obligation_load`** | **P** — provisional |
| **D5** | Cost of getting it correct in code | **`implementation_load`** | **P** — provisional |
| **D6** | Cost of recognizing the technique applies | **`recognition_load`** | **P** — provisional |
| **D7** | Stage band | **`progression_stage`** (`PS-0`…`PS-4`) | **P** — provisional |
| **X** | External difficulty rating | C4's numeric rating | **X** — external signal, **cross-check only** |

**Excluded, by name and with its reason:** **`entry_gate`** — see §4.3.

### 3.3 What the map data actually looks like, as re-derived today

From the 2026-08-10 validator run (`traceability/07_…` §3 carries the verbatim output):

- **187** nodes, **8** frozen roots, **179** non-root dimension-bearing nodes, **5** registered anchors.
- **All 179 share one dimension key-set** — no key drift.
- `progression_stage` distribution: **`PS-1` 19 · `PS-2` 26 · `PS-3` 27 · `PS-4` 107**. **`PS-0` is instantiated by no non-root node** — recorded as an observation, not repaired.
- `entry_gate` distribution: **`gate-a` 19 · `gate-b` 0 · `gate-c` 160 · `gate-d` 0 · `gate-e` 0** — `gate-b`, `gate-d`, `gate-e` instantiated by **no** node.

**The per-dimension numeric range of D2–D6 is not asserted here.** No pass audited it, and the validator reports key-set uniformity, not value ranges. Asserting a range this document did not measure would be the same defect at smaller scale as asserting a rating it did not capture.

---

## 4. The three-way input classification

Every input to a calibrated value carries **exactly one** class. The class is **mandatory provenance**: it travels with the value into every downstream artifact, and **a provisional input may never be re-classed upward by this sub-task**.

### 4.1 The three classes

| Class | Name | Definition | Members | Trust at this cutoff |
| --- | --- | --- | --- | --- |
| **MD** | **Map-derived and re-derivable** | A pure function of the graph. Its value can be **recomputed from the map itself** by a third party, so it is never taken on trust. | **`prerequisite_depth`** | **VERIFIED** — re-derived 2026-08-10, 179/179 agree, 0 disagree |
| **P** | **Provisional** | Recorded in the map and **usable but not binding**, because the creator plausibility review was deferred. `creator_review: "deferred-provisional"` on 179/179. | `state_formulation_load`, `transition_derivation_load`, `proof_obligation_load`, `implementation_load`, `recognition_load`, `progression_stage` | **PROVISIONAL** — owner **the creator**; revision trigger: the creator reviews progression plausibility |
| **X** | **External signal** | A difficulty marker published by the source itself, captured over SUB-3's sanctioned access path as a **dated verification observation**. **Consumed, never re-established.** | C4's numeric rating | **ABSENT** — 0 observations exist; §9 fires for every node |

### 4.2 The classification is disposition-invariant

**An observation-sourced rating is an *external* signal, and stays one.** It is never re-classed as map-derived because it was read from this package's own verification record, and it is never promoted into a provisional dimension because it happens to be the only number available. If `CH-F5-1` resolves in favour of the wider set and the rating becomes a stored field, **it is still class X** (§8). The classification does not move with the storage location.

Equally, **`prerequisite_depth` is never demoted**. It is class MD because it is re-derivable, not because anybody vouched for it.

### 4.3 `entry_gate` is excluded — it is not a fourth class

**`F-943-3`:** `entry_gate` is a **deterministic function** of `progression_stage` — `PS-1` ↔ `gate-a` (×19), `PS-2`/`PS-3`/`PS-4` ↔ `gate-c` (×160), **zero exceptions** — and therefore **carries no independent information**. `gate-b`, `gate-d` and `gate-e` are instantiated by no node.

**This document's 2026-08-10 validator run reproduces that independently**, and both limbs of the validator's `entry_gate` check are build-fatal and passed: all 179 values agree with their declared stage, and all 179 agree with the stage their rubric-computed depth implies.

**Consequence, stated as a rule:** `entry_gate` appears **nowhere** in this standard as an independent signal. It is not a dimension, not a tie-break, not a stratifier, and not a validation input. Using it would double-count `progression_stage` — which is already class **P** — and would dress one provisional value up as two corroborating ones. **That is the exact failure mode the `F-943-3` exclusion exists to prevent.**

`entry_gate` may still be *read* as a redundant integrity check on `progression_stage` (that is what the validator does with it). **Reading it as a checksum is not using it as information**, and no calibrated value in §5 consumes it.

### 4.4 What is inadmissible, and is not merely missing

Per **P6** and charter assumption 23's retention bound, the following are **inadmissible inputs**, not unavailable ones:

- any **percentile** of a problem within a source's rated problem set;
- any **cohort**, **band** or **quantile** derived from the source's problem list;
- any **difficulty distribution** over the source's corpus;
- any **ranking of candidates** against a returned set.

Each could only be computed from a **retained enumerating response**. C4's sanctioned endpoint answers with the source's whole rated problem set, and SUB-1's retention disposition forbids retaining or mining it. **A calibration input that could only be computed from a retained list is inadmissible, not a missing convenience** — so it does not appear in §9's cap list either. It is not a gap awaiting access; it is a thing this project does not do.

---

## 5. The dimensions and how they combine

### 5.1 The combination rule

> **`calibrated_difficulty(n)` = the labelled triple `(structural_tier, provisional_load_index, stage_band)`, ordered lexicographically in that order, and carried with its label set.**

| Component | Definition | Class |
| --- | --- | --- |
| **`structural_tier`** | `prerequisite_depth` — the longest DP-technique path back to the floor. Roots and registered anchors are the floor; hops inside the frozen root block are not DP-technique hops. | **MD** |
| **`provisional_load_index`** (**PLI**) | The **equal-weight sum** of the five load dimensions: `state_formulation_load` + `transition_derivation_load` + `proof_obligation_load` + `implementation_load` + `recognition_load`. | **P** |
| **`stage_band`** | `progression_stage`, used as an ordering band and a consistency check against `structural_tier`. | **P** |

**The external rating is not a component.** It enters only as the cross-check of §5.4, applied to the *ordering*, never summed into it.

### 5.2 Why it is a triple and not a score — the load-bearing design decision

**The triple is deliberately not collapsed into a single scalar.**

Collapsing `(structural_tier, PLI, stage_band)` into one number requires **weights** — across the five load dimensions, and between structural depth and stated load. **Those weights are exactly what charter assumption 16 leaves unsettled** and what §3.1 escalates. Inventing them would publish the escalated choice as though it had been decided, in the most durable possible form: a number that downstream consumers would sort by and never re-open.

So the standard refuses. **A reader who wants a scalar must first resolve `OI-S7-1`.** That is the intended friction, not an omission.

**PLI's equal weighting is declared, not measured.** It is equal-weight because **no evidence discriminates a weighting**, not because the five dimensions were found to contribute equally. It is itself a reliance on the unsettled dimension choice, recorded as `PR-7`. A reader must not read equal weighting as a finding.

### 5.3 The ordering, and what it does not claim

Two nodes compare by `structural_tier` first, then `PLI`, then `stage_band`. Where the triples are equal the nodes are **incomparable**, and the standard says so rather than breaking the tie — a tie-break would need either `entry_gate` (forbidden, §4.3) or a weight (unsettled, §5.2).

**The ordering is a claim about structural and stated load. It is not a claim about learning order** (`R1` / `X-D3`, non-downgradable, `PR-8`).

### 5.4 The external cross-check — a check, never a summand

Where a node `n` has a cited problem carrying an external rating:

1. The rating is read as a **dated verification observation** (§8), with its date and its access path.
2. For each pair of nodes that **both** carry ratings, the standard compares the **direction** of the calibrated ordering with the direction of the ratings.
3. A **disagreement is recorded as a finding** with both values and both dates. It does **not** silently re-weight the dimensions — re-weighting would require resolving the escalated question, which a cross-check may not do on its own authority.
4. **Agreement raises no input's class.** A dimension that agrees with an external rating is still class **P**. Corroboration is not review, and the only thing that closes `PR-1`…`PR-6` is the creator's review.

**The cross-check is list-free by construction:** it compares only per-problem ratings for **already-cited** problems, pairwise, within this package's own seed set. It computes no percentile, cohort or distribution (§4.4), so it never needs — and never holds — an enumerating response.

**At this cutoff steps 1–4 execute over an empty set** and produce nothing. That is §9.

---

## 6. Retention safety of the combination rule

Stated as a property of the rule rather than as a promise about behaviour, because a property can be checked:

| # | Property | Why it holds |
| --- | --- | --- |
| **RS-1** | **No calibrated value requires an enumerating response.** | Every component of the triple is computed from the map alone (§5.1); the only external input is a per-problem rating for a problem **already cited** by SUB-3's pre-selection criteria. |
| **RS-2** | **No selection is sourced from a response.** | Node selection is the map's; problem selection is SUB-3 §6's, executed **before** any request (disqualifier `X1`). This sub-task selects nothing new and issues no request at all. |
| **RS-3** | **No ranking against a source's set is computed.** | §5.4 compares this package's own cited pairs, never a candidate against a returned set. |
| **RS-4** | **The inadmissible set is closed, not deferred.** | §4.4's four shapes are ruled inadmissible outright, so no future pass can reach them by acquiring access. Access would not make them admissible. |

**Nothing in §5 or §9 was weakened to make the empty seed set look better.** The list-free design is what it would be with a full seed set.

---

## 7. The provisional-reliance record

**Every point of use where a provisional value feeds a calibrated output**, with its owner and the revision trigger that would invalidate it. Audited row-by-row against `../C005-dp-map-package/03_open-items-and-provisional-register.md` §9 — the audit itself is in `traceability/07_…` §2.

| # | Point of use | Provisional input relied on | §9 row | Owner | Revision trigger |
| --- | --- | --- | --- | --- | --- |
| **PR-1** | `PLI` summand | `state_formulation_load` — `creator_review: "deferred-provisional"` ×179 | *Deferred creator progression review — all 179 nodes* | **the creator** | The creator reviews progression plausibility (C005 assumption #11) |
| **PR-2** | `PLI` summand | `transition_derivation_load` — same | *Deferred creator progression review* | **the creator** | As `PR-1` |
| **PR-3** | `PLI` summand | `proof_obligation_load` — same | *Deferred creator progression review* | **the creator** | As `PR-1` |
| **PR-4** | `PLI` summand | `implementation_load` — same | *Deferred creator progression review* | **the creator** | As `PR-1` |
| **PR-5** | `PLI` summand | `recognition_load` — same | *Deferred creator progression review* | **the creator** | As `PR-1` |
| **PR-6** | `stage_band`; the lexicographic third key | `progression_stage` — provisional, and its `PS-2`/`PS-3`/`PS-4` granularity is separately **ungrounded** | *Deferred creator progression review* **and** *`PS-2`/`PS-3`/`PS-4` granularity — ungrounded vs NEU-888* | **the creator** (review) / **NEU-940 / NEU-888** (granularity) | The creator reviews progression plausibility; **or** NEU-888 supplies discriminating evidence, or the creator re-cuts the stages |
| **PR-7** | **The whole combination rule** — that these seven fields are the dimensions, and that PLI weights them equally | Charter assumption 16, `[unconfirmed]` — the unsettled dimension choice | escalated here as **`OI-S7-1`** | **the creator** | The creator (or NEU-888 evidence) settles which dimensions define calibration — `OI-S7-1` |
| **PR-8** | **Any reading of the ordering as a learning order** | `R1` / `X-D3` — DP-transfer effectiveness, **provisional, non-downgradable** | *`R1` / `X-D3` — DP-transfer effectiveness* | **NEU-887 / the creator** | **Nothing in C005 or C009 can close it.** Carried undiminished |
| **PR-9** | **Any node-level coverage claim attached to a calibrated value** | `INC-C7` — node-level `coverage.status` is `unaudited` on all 179 | *`INC-C7` — node-level coverage `unaudited` ×179* | **NEU-942's route / a later pass** | A node-level coverage write-back is commissioned |
| **PR-10** | **The completeness of the node set a calibration ranges over** | `INC-C1` — the 10-instance CL-4 gap class has **no nodes**; SUB-3's disqualifier `X3` names the same seam | *`INC-C1` — the 10-instance CL-4 gap class* | **the creator** | The CL-4 completion task lands, or a further CL-4-by-cascade technique surfaces |
| **PR-11** | **The external cross-check's very availability** | `CAP-2` — problem-level ids unverified; and `CAP-S3-1` — seed set empty, coverage 0/4 | *`CAP-2` — problem-level ids unverified* | **the creator / SUB-1 (NEU-957)** for re-verification; **SUB-3's successor** for execution | Corpus access obtained and ids verified — then §5.4 executes for real. Recorded here as **`CAP-S7-1`** |

**Two §9 rows are read and deliberately **not** relied on**, recorded so their absence is visible rather than accidental:

- **`F-943-3`** (`entry_gate` redundant) — **excluded by §4.3.** The standard consumes no information from `entry_gate`, so it inherits no reliance from this row.
- **`F-943-1`** (26/179 depths wrong, 6 stage inversions) — **closed**, discharged by `D-R4`, and **independently re-confirmed** by this document's own validator run: 0 depth mismatches, 0 stage inversions. This is why `prerequisite_depth` is class **MD** rather than class **P**.

**No calibrated output in this standard is presented as grounded on unlabelled data.** Every output carries the labels of §7 plus the universal *no external cross-check* label of §9.

---

## 8. The `D-F5` interim branch — specified for both dispositions

`CH-F5-1` is **unresolved and open** at this cutoff. OUT-4's difficulty field is one of the three things the challenge narrows, so this is a citation-touching outcome and it carries the **both-dispositions obligation**. The branch is specified **in advance**, not improvised.

**The field-set dependency is inherited, not incurred.** It is **SUB-3's entry**, cited by id — **`CAP-S3-3`**, and behind it **`CH-F5-1`**, **`DR-C09-01`**, **`CAP-S1-2`** / **`OI-S1-13`**. **SUB-12 (NEU-969) is the single owner of every cap**, so this document restates none of them. This sub-task adds **no** new cap for the field set.

### 8.1 While the challenge is unresolved — the branch that is live now

- The stored citation record is **`stable_id` + `canonical_url` only**. **This sub-task stores no additional field, and storage gains nothing.**
- The class **X** input is read from **SUB-3's dated verification observations** (`traceability/03_…` §2), each carrying **its date** and **the access path it was captured on** — never from a stored difficulty field, which does not exist.
- **Every calibrated output that consumed an observation is labelled with that observation's date**, so a stale rating is **visible rather than assumed current**.
- **No wider field is stored to make the calibration easier.** A wider set is a ledger matter for `D-F5`'s owner, and this sub-task's need is not an argument. Its empty input set is likewise not an argument.

### 8.2 If the challenge resolves in favour of the wider set

The same input is read **from the stored difficulty field**, with **no change** to:

- the **dimensions** (§3.2), the **combination rule** (§5.1), the **input classification** (§4), or the **labelling** (§7, §9).

The rating remains **class X**. It is not re-classed as map-derived because it now lives in storage, and it is not promoted into a provisional dimension. The only thing that changes is **where the value is read from**; the date label continues to travel with it, sourced from the resolution record. This mirrors SUB-3's recorded migration property: a **promotion of existing observations**, not a re-verification, with **no citation needing re-resolution**.

### 8.3 If the challenge resolves against the wider set

**Nothing changes at all.** The observation-sourced read of §8.1 is already the operating shape.

### 8.4 The restricted-stored-set run, as actually executed

Executed over the seed set as it stands — **`stable_id` + `canonical_url` only, and zero entries**:

| Assertion | Result at 2026-08-10 |
| --- | --- |
| Every external rating is read from a dated verification observation | **Vacuously satisfied — zero observations exist to read.** Recorded as `CAP-S7-2`; a vacuous pass is not a demonstrated one |
| Each dependent output carries the observation date | **Vacuously satisfied** — no output consumed an observation |
| The inherited field-set cap is cited **by id** | **Satisfied, non-vacuously** — `CAP-S3-3`, `CH-F5-1`, `DR-C09-01`, `CAP-S1-2` cited above; none restated |
| Storage gains no field | **Satisfied, non-vacuously** — this change adds no schema, no field, and no stored citation record |

**Two of the four pass vacuously and say so.** In a summary table a vacuous pass is indistinguishable from a demonstrated one, and that is exactly how a standard comes to be trusted for something it never showed.

---

## 9. The anchor-unavailable branch — pre-specified, and firing now for every node

### 9.1 The trigger, and which limb fired

OUT-4 pre-specifies this branch for two situations. **Both** obtain:

- **The source's whole sanctioned hierarchy proved unusable.** All twelve sources fail SUB-3's step **V0**: every one carries `Restricted` in `01_provenance-and-rights.md` §3, so **no request was issued on either path** — not the documented API, not the single targeted fetch. C4's `problemset.problems` was never called (`CAP-S3-1`, `CAP-S3-2`, `OI-S3-1`).
- **No cited problem carries an external rating.** Trivially so: **there are no cited problems.** C4 is the only selected source publishing a numeric rating (charter assumptions 24 and 16), so any node whose seed citation is not a C4 problem is this case **by construction** — and at 0/4 cluster coverage, **every one of the 179 nodes is this case**.

### 9.2 What the calibration does

1. **It proceeds on the five provisional load dimensions alone**, plus the map-derived `structural_tier` and the provisional `stage_band`. The triple of §5.1 is fully computable from the map; **the absence of the anchor removes the cross-check, not the calibration.**
2. **The missing anchor is recorded as a cap with a named owner** — **`CAP-S7-1`** in `91_caps-and-incomplete-scope.md`, owner **SUB-1 (NEU-957)** for the re-verification half and **SUB-3's successor** for the execution half, **the creator by default**.
3. **Every calibrated output is labelled `no external cross-check`.** Not some — **all 179**, because the anchor is absent for all 179.
4. **No second provisional value is promoted into the anchor's place.** Specifically and by name: `entry_gate` is **not** pressed into service as a pseudo-anchor (§4.3); `progression_stage` is **not** re-classed as an independent check on the load dimensions when it is itself class **P** and drawn from the same unreviewed pass; and **no inferred, estimated, remembered or plausible rating is written anywhere.**

### 9.3 What is explicitly refused

> **No external rating is invented, estimated, or recalled.** `CH-F5-1`'s governing rule — **an unverifiable value is refused, never invented** — applies directly to any difficulty datum this sub-task cannot source. There is no cell anywhere in this package reading a C4 rating against a problem that was never resolved.

**Nor is the anchor silently dropped.** The distinction matters and is the whole point of the branch: a silently-dropped anchor produces a calibration that *looks* complete; a recorded one produces a calibration that is honestly labelled and a cap somebody owns.

### 9.4 The label, verbatim

Every calibrated value produced under this standard at this cutoff carries:

> **`no external cross-check` — the external anchor was unavailable at the 2026-08-10 cutoff (`CAP-S7-1`); this value rests on the map's five provisional load dimensions and `progression_stage`, all `creator_review: "deferred-provisional"`, plus the re-derivable `prerequisite_depth`. It is not corroborated by any independent signal, and it is provisional on the unsettled dimension choice (`OI-S7-1`).**

---

## 10. The dimension-set escalation

**The exit is defined and non-silent.** Filed as **`OI-S7-1`** in `90_open-items-and-provisional-register.md`, owner **the creator** — the only qualified reviewer of the map's provisional values.

The entry carries, in full:

- **The candidate dimension sets considered** — assumption 16's default; a depth-only set; a set that adds a `javascript_materiality`-derived implementation term; a set collapsing D2–D6 to a smaller reviewed subset; and a set weighted by an external anchor.
- **The evidence that would discriminate between them** — the creator's plausibility review of the 179 deferred values, and a non-empty seed set of externally-rated cited problems permitting the §5.4 ordering comparison.
- **The revision trigger**.

**Every calibrated output that depends on the unsettled choice is labelled provisional on it** (`PR-7`, and the §9.4 label). **Assumption 16's default is never adopted silently as though it had been settled**, and the question does not disappear into the standard.

---

## 11. Scope — what this document does not decide

- It does not review or flip any node's `creator_review` flag. That happens only through the loop **SUB-8** specifies, and only in the schema ledger.
- It does not edit any map difficulty value, or any file under `docs/research/C005-dp-map/`.
- It does not source problems, establish or re-establish any access path, or capture any external rating. **It issued no request on any path.**
- It does not decide the permitted field set, and it stores no field beyond what SUB-1 admits.
- It does not own or restate the field-set cap — inherited from SUB-3 and cited by id.
- It does not set assessment thresholds — **SUB-6's**.
- It does not define which gate validates a calibrated value — **SUB-9's (NEU-965)**, which merges this standard's dimensions, classes and labels **without translation**; the field names here are the map's and SUB-2's own.
- **It sets no status.** Status lives in a ledger.

---

## 12. Verification note — `qa-execution:engine` is unconfigured

This repository's capability registry resolves to **`git, linear`** only; **no capability owns the `qa-execution:engine` surface.** The automated QA-execution phase is therefore a genuine **Core Article 8 no-op** — a phase with no provider, **not** a phase that was skipped, deferred or waived.

**Nothing is claimed. No QA pass, scenario, verdict, report or coverage claim is asserted or implied anywhere in SUB-7's output.** Fabricating a QA pass would be the same failure class as fabricating the external rating this document spends §9 refusing to invent.

**What verification actually is here:** file inspection, `git diff` against the task's numbered success criteria, and the **re-run of the C005 integrity validator** recorded verbatim in `traceability/07_…` §3 — the one genuinely mechanical, third-party-reproducible check this sub-task has. The repository's own gates never see `docs/`, so a green line there is not evidence about anything in this package.
