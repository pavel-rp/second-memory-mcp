# 07 — Calibration Input Traceability, the §9 Provisional-Reliance Audit, and the Validator Re-Derivation Run

**Task:** NEU-964 (SUB-7) · **Charter:** C009 (umbrella NEU-890) · **Covers:** OUT-4 evidence · **Compiled:** 2026-08-10 · **Verification cutoff:** 2026-08-10 · **Status:** deferred — this file SETS no status
**Model:** claude-opus-5[1m]

**Companion to** `../07_difficulty-calibration.md`. Claims SUB-7's already-exclusive number `07` inside `traceability/`, so no sibling can collide with it.

---

## 1. What this register is

The evidence half of OUT-4. Four things, each reproducible by a third party:

1. **§2** — the **provisional-reliance audit** run against `../../C005-dp-map-package/03_open-items-and-provisional-register.md` §9, row by row.
2. **§3** — the **`prerequisite_depth` re-derivation**, with the validator's actual output recorded verbatim.
3. **§4** — the **input-traceability table**: every calibrated value back to a labelled input class.
4. **§5** — the **restricted-stored-set calibration run** and the **anchor-unavailable run**, with what each actually established and what it only vacuously satisfied.

---

## 2. The provisional-reliance audit against `C005-dp-map-package/03_…` §9

**Method.** §9 is *"The complete provisional/unresolved manifest — nothing below is binding"*, and it opens with the discipline this audit discharges: *"If you are a downstream agent and you rely on ANY row in this table, you must surface that reliance."*

Every one of §9's rows was read and given exactly one disposition: **RELIED ON** (with the surfacing point named), **EXCLUDED** (relied on by nothing, with the reason), or **NOT APPLICABLE** (out of this standard's input path).

| §9 row | Disposition | Where it is surfaced, or why it is not relied on |
| --- | --- | --- |
| **`F-943-1`** — 26/179 depths wrong, 6 stage inversions — **closed**, discharged by `D-R4` | **NOT RELIED ON — and independently re-confirmed** | The closure is why `prerequisite_depth` is class **MD**, not class **P**. §3's run reproduces it at this cutoff: **0 depth mismatches, 0 stage inversions**. Recorded in `../07_…` §7. |
| **`F-943-3`** — `entry_gate` redundant | **EXCLUDED** | `../07_…` §4.3. `entry_gate` is used as **no** independent signal anywhere in the standard — not a dimension, not a tie-break, not a stratifier, not a validation input. The standard inherits no reliance from this row. |
| **Deferred creator progression review — all 179 nodes** | **RELIED ON** | **`PR-1`…`PR-6`** — every `PLI` summand and `stage_band`. Owner **the creator**; trigger: the creator reviews progression plausibility. This is the single most load-bearing reliance in the standard. |
| **`PS-2`/`PS-3`/`PS-4` granularity — ungrounded vs NEU-888** | **RELIED ON** | **`PR-6`**, as a *second, independent* reliance on `progression_stage` beyond the deferred review. Owner **NEU-940 / NEU-888**; trigger: NEU-888 supplies discriminating evidence, or the creator re-cuts the stages. Surfaced separately precisely because the deferred review would not close it. |
| **`INC-C1`** — the 10-instance CL-4 gap class | **RELIED ON** | **`PR-10`** — the completeness of the node set a calibration ranges over. Same seam as SUB-3's disqualifier `X3`. Owner **the creator**. |
| **`INC-C2`** — `D-F4a`: SOS DP CL-4 vs CL-3 | **NOT APPLICABLE** | A cluster-assignment question. The combination rule consumes no `cluster` value, so no calibrated value moves either way. |
| **`AR-1-a/936`**, **`AR-1-b/936`**, **`AR-1-a/938`**, **`AR-1-b/938`**, **`AR-1-c/935`**, **`AR-1-d/935`** | **NOT APPLICABLE** | Anchor-request adjudications affecting `boundary_anchors`. They can change the **graph**, and therefore `prerequisite_depth` — but the standard's response is already specified: `prerequisite_depth` is **re-derived after any edge change** (§3.1), never copied. Recorded as an operating rule rather than a reliance. |
| **`D-S1a-1`** — `cl-1.derive-recurrence-routine` S7-vs-S5 | **NOT APPLICABLE** | A single node's skill-type judgement. No dimension in the working set reads `skill_type`. |
| **`CAP-2`** — problem-level ids unverified | **RELIED ON** | **`PR-11`** — the availability of the external cross-check itself. Escalated into the anchor-unavailable branch and the cap **`CAP-S7-1`**. |
| **`R1` / `X-D3`** — DP-transfer effectiveness, **provisional, non-downgradable** | **RELIED ON** | **`PR-8`** — any reading of the ordering as a *learning* order. Carried undiminished; **nothing in C005 or C009 closes it**, and `../07_…` §1 and §5.3 both state the limit rather than burying it. |
| **`JS-U1`**, **`JS-U2`**, **`JS-U3`**, **`JS-U5`** | **NOT APPLICABLE** | JavaScript-materiality items. The working dimension set reads no `javascript_materiality` field. Named as a **candidate** dimension in the `OI-S7-1` escalation, so if that candidate is adopted these rows become live reliances — recorded now so the future pass does not have to rediscover it. |
| **`F-943-2`** — `conceptual` rests on 1 non-root node | **NOT APPLICABLE** | Skill-type spread. No dimension reads `skill_type`. Reproduced incidentally by §3's run (`FRAGILE … "conceptual" rests on 1 non-root node`), reported and not acted on. |
| **`F-939-1`** — altitude reservation | **NOT APPLICABLE** | A pedagogical repointing question, not a difficulty input. |
| **`INC-S1`** — register not asserted complete | **NOT APPLICABLE to a specific input**, **acknowledged globally** | §9 is not asserted complete, so this audit's own coverage is bounded by that. Stated rather than assumed away. |
| **`INC-C7`** — node-level coverage `unaudited` ×179 | **RELIED ON** | **`PR-9`** — any node-level coverage claim attached to a calibrated value. Owner **NEU-942's route / a later pass**. |
| **`X-S1`**, **`X-D1`**, **`X-D2`** | **NOT APPLICABLE** | Carried cross-package conflicts and naming instability; no dimension in the working set reads them. |

**Audit result.** **Eight §9 rows are relied on** (`PR-1`…`PR-6` share one row plus one additional row for `PR-6`; `PR-8`, `PR-9`, `PR-10`, `PR-11`). **Every one is surfaced in `../07_…` §7 with an owner and a revision trigger.** One row (`F-943-3`) is **excluded by name with its reason**, and one (`F-943-1`) is **closed and independently re-confirmed**. **No calibrated output is presented as grounded on unlabelled data.**

---

## 3. The `prerequisite_depth` re-derivation — the validator run

**Purpose.** To prove the map-derived input is **re-derivable rather than copied**. The validator is a **read-only dependency: it was run, never modified.**

| | |
| --- | --- |
| **Command** | `node docs/research/C005-dp-map-integrity/validator/audit-graph-integrity.mjs` |
| **Run from** | the task worktree, at branch base `origin/develop` |
| **Date** | 2026-08-10 |
| **Exit status** | **0** |
| **Modifications to the validator** | **none** — read-only dependency |
| **Environment note** | The validator resolves the `yaml` package at `<repo>/node_modules/yaml/dist/index.js`. A fresh worktree has no `node_modules`, so the package was linked in from the workspace store to let the validator run. **This changes no tracked file** (`node_modules` is gitignored) and **no validator source.** Recorded so a re-executor hitting `cannot locate the \`yaml\` package` knows it is an environment gap, not a finding. |

### 3.1 The output that bears on this sub-task, verbatim

```
=== B. INVENTORY ===
nodes = 187 | roots = 8 | non-root = 179 | anchors = 5

=== H. NEU-940 DIFFICULTY-DIMENSION CONSISTENCY ===
  H1 prerequisite_depth: 179/179 agree with the rubric; 0 disagree
     direction: 0 UNDER-report, 0 over-report (unanimity is the tell)
     0/0 exactly equal the depth computed WITHOUT the NEU-939 cross-cluster edges
  H2 progression_stage monotonicity, by edge class:
     intra_cluster    checked 293 | inversions 0   (clean)
     roots            checked   0 | inversions 0   (clean)
     cross_cluster    checked  25 | inversions 0   (clean)
  H3 entry_gate agreement (both limbs are check()ed and build-fatal):
     distribution over the 179 dimension-bearing nodes: gate-a 19 | gate-b 0 | gate-c 160 | gate-d 0 | gate-e 0
     instantiated by NO node: gate-b, gate-d, gate-e
     stage distribution: PS-1 19 | PS-2 26 | PS-3 27 | PS-4 107
```

```
PASS  all 179 non-root nodes carry dimensions
PASS  all 179 nodes share ONE dimension key-set (no key drift)  — 1 distinct key-sets
PASS  every progression_stage parses (none silently skipped)
PASS  limb 1: all 179 entry_gate values agree with their DECLARED progression_stage (gate-a iff PS-1)
PASS  limb 2: all 179 entry_gate values agree with the stage their RUBRIC-COMPUTED depth implies
==============================================================================
STRUCTURAL CHECKS: 30/30 passed
ANNOTATION FINDINGS (reported, routed to NEU-940 — not build-fatal): 0 depth mismatches, 0 stage inversions

STRUCTURAL VERDICT: PASS — acyclic, grounded, union-complete, OUT-6 criterion met.
```

### 3.2 What this establishes, and what it does not

| Establishes | Does not establish |
| --- | --- |
| **`prerequisite_depth` is re-derivable and re-derived.** The declared value agrees with the rubric's own definition on **179/179**, so the calibration's `structural_tier` is **computed, not copied**. This is the acceptance criterion for the map-derived input, and it **passes**. | **Nothing whatsoever about the five load dimensions or `progression_stage`'s plausibility.** The validator checks **structure** — key-set uniformity, parseability, monotonicity, gate agreement. It does **not** check whether a load value is *right*, because no mechanical check can: that is the creator's deferred review. |
| **`F-943-3` is independently reproduced.** `gate-a` 19 / `gate-c` 160, `gate-b`/`gate-d`/`gate-e` at zero, both build-fatal limbs green — `entry_gate` is a deterministic function of `progression_stage` with **zero exceptions** at this cutoff. That is the exclusion's evidence, not an appeal to the finding's text. | **Nothing about difficulty as experienced by a learner** (`R1`, `PR-8`). |
| **`F-943-1`'s closure holds** at this cutoff: 0 depth mismatches, 0 stage inversions. | **Nothing about coverage**: node-level `coverage.status` remains `unaudited` on all 179 (`INC-C7`, `PR-9`). |
| The 179 dimension-bearing nodes carry **one** dimension key-set — no key drift, so the standard's seven field names resolve on every node. | The **numeric range** of any load dimension. The validator reports key-set uniformity, not value ranges, which is why `../07_…` §3.3 asserts no range. |

**One observation recorded rather than repaired:** the stage distribution spans **`PS-1`…`PS-4`**; **`PS-0` is instantiated by no non-root node**, though the rubric admits it. Reported, not acted on — it is NEU-940 / NEU-888's field, not this sub-task's.

---

## 4. The input-traceability table

**Every calibrated value, back to a labelled input class.** Classes are `MD` (map-derived, re-derivable), `P` (provisional), `X` (external signal) — as defined in `../07_…` §4.

| Calibrated value | Composed from | Input field(s) | Class | Provenance of the value at this cutoff | Labels it carries |
| --- | --- | --- | --- | --- | --- |
| **`structural_tier`** | direct | `prerequisite_depth` | **MD** | **Re-derived 2026-08-10**, 179/179 agree, 0 disagree (§3) | *provisional on the unsettled dimension choice* (`PR-7`) |
| **`provisional_load_index` (PLI)** | equal-weight sum of five | `state_formulation_load`, `transition_derivation_load`, `proof_obligation_load`, `implementation_load`, `recognition_load` | **P** ×5 | `creator_review: "deferred-provisional"` on 179/179 — **accepted, never checked** | `PR-1`…`PR-5`; *no external cross-check*; *provisional on the unsettled dimension choice* (`PR-7`); **equal weighting declared, not measured** |
| **`stage_band`** | direct | `progression_stage` | **P** | `deferred-provisional` ×179, **and** `PS-2`/`PS-3`/`PS-4` granularity separately ungrounded | `PR-6` (two distinct §9 rows); *no external cross-check*; `PR-7` |
| **`calibrated_difficulty`** (the triple) | lexicographic `(structural_tier, PLI, stage_band)` | all of the above | **MD + P** | Fully computable from the map; **not** collapsed to a scalar (`../07_…` §5.2) | Every label above, plus the §9.4 verbatim label |
| **The ordering between two nodes** | comparison of two triples | as above | **MD + P** | Structural and stated-load claim only | `PR-8` — **not** a learning-order claim (`R1`, non-downgradable) |
| **The external cross-check verdict** | §5.4 pairwise direction comparison | C4 numeric rating, as a dated verification observation | **X** | **ABSENT — zero observations exist.** Branch §9 fires for all 179 nodes | `CAP-S7-1`; `CAP-S7-2` (vacuous pass) |
| **Any percentile / cohort / distribution / candidate ranking** | — | — | — | **INADMISSIBLE, not missing** (`../07_…` §4.4) — computable only from a retained enumerating response | Not capped, because it is not a gap |
| **`entry_gate`-derived signal** | — | — | — | **NONE EXISTS.** Excluded by `F-943-3` (`../07_…` §4.3) | — |

**Closure property.** Every row above resolves to `MD`, `P`, `X`, *inadmissible*, or *excluded*. **There is no unlabelled input anywhere in the standard**, and no calibrated value that traces to something outside this table.

---

## 5. The two pre-specified branch runs, as executed

### 5.1 The restricted-stored-set calibration run

Executed with `CH-F5-1` **open**, so the stored citation set is `stable_id` + `canonical_url` only and **no difficulty field is stored**.

| # | Assertion | Verdict | Nature |
| --- | --- | --- | --- |
| **RS-A** | Every external rating is read from SUB-3's **dated verification observation**, never from a stored field | **PASS** | **Vacuous** — `traceability/03_…` §2 holds **zero** observations, because the seed set is empty. Nothing was read, so nothing was mis-read. Filed as **`CAP-S7-2`** |
| **RS-B** | Every dependent calibrated output is labelled with the observation date | **PASS** | **Vacuous** — no output consumed an observation |
| **RS-C** | The unresolved field set is recorded by **citing SUB-3's cap entry by id** | **PASS** | **Non-vacuous** — `CAP-S3-3` cited, with `CH-F5-1`, `DR-C09-01`, `CAP-S1-2` / `OI-S1-13` behind it. **None restated; no new field-set cap incurred by SUB-7** |
| **RS-D** | **Storage gains no field** | **PASS** | **Non-vacuous, and mechanically checkable** — this change adds no schema, no field, no stored citation record. It writes four documentation paths and nothing else |
| **RS-E** | The standard is specified for **both** dispositions, with the wider set never admitted on this package's judgment | **PASS** | **Non-vacuous** — `../07_…` §8.1, §8.2, §8.3. Under the wider disposition the rating stays **class X**; dimensions, combination rule, classification and labelling are unchanged |

**Two of five pass vacuously and are labelled so.** A vacuous pass is indistinguishable from a demonstrated one in a summary table, and `CAP-S7-2` exists so no future pass cites this section as precedent that the observation-read path has been exercised. **It has not.**

### 5.2 The anchor-unavailable run

Executed over the seed set as it actually stands: **zero entries, cluster coverage 0/4** (`CAP-S3-1`).

| # | Assertion | Verdict | Evidence |
| --- | --- | --- | --- |
| **AU-A** | The calibration **proceeds** on the five provisional load dimensions alone | **PASS** | The triple is fully computable from the map; the missing anchor removes the **cross-check**, not the calibration (`../07_…` §9.2) |
| **AU-B** | The missing anchor is recorded as a **cap with a named owner** | **PASS** | **`CAP-S7-1`** — owner **SUB-1 (NEU-957)** for re-verification, **SUB-3's successor** for execution, **the creator by default** |
| **AU-C** | **Every** affected output is labelled *no external cross-check* | **PASS** | **All 179**, not some — the anchor is absent for all 179. Verbatim label at `../07_…` §9.4 |
| **AU-D** | The anchor is **never silently dropped** | **PASS** | Recorded in three places: the cap, the label on every output, and `../07_…` §9.3 |
| **AU-E** | **No second provisional value is promoted into its place** | **PASS** | Refused **by name**: `entry_gate` is not pressed into service as a pseudo-anchor; `progression_stage` is not re-classed as an independent check on dimensions drawn from the same unreviewed pass; **no rating is inferred, estimated or recalled** |
| **AU-F** | **No request was issued to any source, on any path** | **PASS** | This sub-task performed no fetch. Network **capability** exists (`OI-S3-2`) and the rights gate is nonetheless shut — **capability is not authority** |

### 5.3 The dimension-set exit — exactly one of two

| Exit | Taken? | Artifact |
| --- | --- | --- |
| Settled dimension-set **decision record** with rationale and rejected alternatives | **NO** | **No decision record exists in `decision-records/` for the dimension set** — the choice is not decided, and writing one would present it as settled |
| **Open-items escalation entry** naming **the creator** as owner, with candidate sets, discriminating evidence and revision trigger | **YES** | **`OI-S7-1`** in `../90_open-items-and-provisional-register.md` |

**Exactly one. Never neither.**

---

## 6. Self-check caveat — inherited, not rediscovered

Inherited from **`CAP-S1-4`**, **`CAP-S2-5`** and **`CAP-S3-7`**: §2's audit, §4's table and §5's branch runs were **run by SUB-7 against SUB-7's own output**. An author checking its own completeness shares the author's blind spots by construction.

**Mitigation actually applied, and its limit.** The one genuinely independent, third-party-reproducible check in this sub-task is **§3's validator run** — a program this sub-task did not write, could not modify, and whose output is recorded verbatim including the parts that bear on nothing here. The **judgment** half — is the dimension set the right one to escalate rather than settle? is §2's `NOT APPLICABLE` disposition right on each row? — remains unvalidated by an independent reader. Carried as **`CAP-S7-3`**; **`92_package-completeness-gate.md`'s run is the intended occasion.**
