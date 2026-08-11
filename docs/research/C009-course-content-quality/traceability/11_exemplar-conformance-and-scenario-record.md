# 11 — Exemplar Conformance, the Standards-Review Run, and the Acceptance-Scenario Record

**Task:** NEU-967 (SUB-11) · **Charter:** C009 (umbrella NEU-890) · **Covers:** OUT-11 evidence, OUT-2's exemplar review evidence · **Compiled:** 2026-08-10 · **Verification cutoff:** 2026-08-10 · **Status:** deferred — this file SETS no status
**Model:** claude-opus-5[1m]

**Companion to** `../11_package-end-to-end-proof-and-exemplars.md`. Claims SUB-11's already-exclusive number `11` inside `traceability/`, so no sibling can collide with it.

**Commit base for every run below:** `ff679e47c3cec9844f1a0a5fa3a657891eb22d4a` · **Date:** 2026-08-10 · **Runner:** the producing task (SUB-11), in its own worktree.

---

## 1. What this register is

The evidence half of OUT-11. Every mechanical check the companion document relies on, with the command that produced it, the outcome verbatim, and — where a check did **not** run — the reason it did not, so a third party can reproduce the ran ones and audit the refusals.

**Reproduction note.** Every command below is a `node -e` script over files in this repository at the stated commit base. No command reaches the network, and **no command in this record, at any point, contacted any of the twelve sources** — see §6.

---

## 2. The node-record reads (E1, E6, E7)

**Command.** A single `node -e` script reading `../../C005-dp-map/nodes/cl-1-foundational.yaml`, `cl-2-combinatorial.yaml`, `cl-3-state-compression.yaml`, `cl-4-optimization/mainstream.yaml` and `cl-4-optimization/frontier.yaml`; for each of the four target node ids it locates the `- id:` record, gathers the block to the next `- id:`, and extracts `skill_type`, `prerequisite_depth`, the five load dimensions, `progression_stage` and `creator_review`, then computes PLI as the equal-weight sum of the five loads.

**Output, verbatim:**

```
cl-1.judge-dp-applicability | skill_type=conceptual | depth=1 | loads=2,1,1,1,3 | PLI=8  | stage=PS-1 | creator_review=deferred-provisional
cl-2.recognize-an-implicit-dag | skill_type=transfer | depth=5 | loads=3,2,2,1,5 | PLI=13 | stage=PS-4 | creator_review=deferred-provisional
cl-3.recognize-bitmask-state-applicability | skill_type=strategic | depth=5 | loads=4,2,0,1,3 | PLI=10 | stage=PS-4 | creator_review=deferred-provisional
cl-4.select-mainstream-optimization | skill_type=strategic | depth=6 | loads=1,2,1,1,5 | PLI=10 | stage=PS-4 | creator_review=deferred-provisional
```

**Outcome.** **4/4 node ids resolve** to a declared record. **4/4 `skill_type` values** match the values quoted in `../11_…` §3. **4/4 `creator_review` values read `deferred-provisional`** — zero creator-confirmed, consistent with `CAP-S8-2`'s 179/179.

**The four triples, as published in `../11_…` §3 and §5.1:**

| Node | `calibrated_difficulty` |
| --- | --- |
| `cl-1.judge-dp-applicability` | **(1, 8, PS-1)** |
| `cl-3.recognize-bitmask-state-applicability` | **(5, 10, PS-4)** |
| `cl-2.recognize-an-implicit-dag` | **(5, 13, PS-4)** |
| `cl-4.select-mainstream-optimization` | **(6, 10, PS-4)** |

**Independence note.** The extraction and the arithmetic were re-run from the files a second time, after the companion document was written, and reproduced all four triples **exactly**. That is a re-derivation of the same script over the same inputs — it catches a transcription error and **cannot** catch a rule misreading. Recorded as what it is.

**Lexicographic ordering:** CL-1 < CL-3 < CL-2 < CL-4. **No two triples equal**, so no incomparability arose. **n = 4 of 179.** Not a rate, not a distribution, not a range.

**Observed load-dimension values across the sample:** `{0, 1, 2, 3, 4, 5}` — `proof_obligation_load: 0` on `cl-3.recognize-bitmask-state-applicability`, `recognition_load: 5` on two nodes. **The dimensions are not 1-indexed.** This is 4 nodes' worth of observation and is filed as `OI-S11-6`, not asserted as the range over the 179 — `07_…` §3.3 explicitly declines to assert that range and this record does not overturn it.

---

## 3. The root-reference integrity check

**Command.** The same script collected every distinct `cl-1.root.*` string appearing anywhere across the five node files, then tested each against a `- id:` declaration.

**Output, verbatim:**

```
root refs distinct: 8 declared as node ids: 8 dangling: 0
```

**Outcome.** **8 distinct root ids, 8 declared, 0 dangling.** Matches `07_…` §3.3's "8 frozen roots". The `prerequisite_recall` field of all four exemplar `lesson` forms resolves to a declared node id — **4/4 resolve, 0 dangling** — which is the mechanical half of SUB-4 §2.1's field floor recorded in §5 below.

---

## 4. The reference-resolution scan (zero dangling ids)

**Command.** A `node -e` script extracting every `CAP-S<n>-<k>`, `OI-S<n>-<k>` and `G-<NAME>` token from `../11_…`, partitioning the first two into *inherited* (any namespace but `S11`) and *this sub-task's own* (`S11`), then testing each inherited token against `../91_caps-and-incomplete-scope.md` / `../90_open-items-and-provisional-register.md` and each gate token against `../09_enforceable-quality-system.md`.

**Output, verbatim:**

```
caps cited (inherited): 28 dangling: []
open items cited (inherited): 14 dangling: []
gates cited: 26 not in 09_: []
mine CAP-S11: ["CAP-S11-1","CAP-S11-2"]
mine OI-S11: ["OI-S11-1","OI-S11-2","OI-S11-3","OI-S11-4","OI-S11-5","OI-S11-6","OI-S11-7","OI-S11-8"]
EQ ids: 23
collision CAP-S11 already in register: false
collision OI-S11 already in register: false
```

**Outcome.**

| Check | Result |
| --- | --- |
| Inherited cap ids cited, all resolving to an existing entry | **28 / 28** · **0 dangling** |
| Inherited open-item ids cited, all resolving | **14 / 14** · **0 dangling** |
| Distinct gate ids cited, all already present in `09_…` | **26 / 26** · **0 new gate ids** |
| `EQ-S11-k` self-classification rows | **23** |
| Id-space collision before append | **none** — neither `CAP-S11-` nor `OI-S11-` appeared in either register |

**The 0-new-gate-ids line is the mechanical form of `../11_…` §10.5's commitment.** Every `Gate id` cell in the self-classification table names a gate SUB-9 already published, or the literal `none — cap`.

---

## 5. The standards-conformance review — what ran and what did not

**`../11_…` §4 is the review itself.** This section records only its mechanical layers and its refusals.

| Standard | Check | Ran? | Outcome |
| --- | --- | --- | --- |
| Explanation (§2.1) | **Field floor** — all four fields present; `prerequisite_recall` resolves | **YES**, ×4 | **4/4 PASS.** Resolution confirmed by §3's run. `claim_citations` passes on the **refusal branch** (`REFUSED — not verifiable`), which the standard admits; it does **not** pass on the citation branch |
| Explanation (§2.1) | **Restatement check** — `does_not_apply_when` is not the negation-by-restatement of `applies_when` | **YES**, ×4 | **4/4 PASS.** Each names a distinct situation, not "when not X" |
| Explanation (§2.1) | **Depth check** — first undefined term in the body | **NO — REFUSED** | The author would be judging its own exposition for the terms it assumed. `CAP-S9-4` already records the package's one AI correctness review **failing** `C-3` on exactly this shape; running it here would add a second and report it as a pass. Residue: **`OI-S11-5`** |
| Solution (§2.2) | **Slot presence**, **falsifiability** | **NOT REACHED**, ×3 | The form is incompletable on CL-2/CL-3/CL-4 — its REQUIRED `problem_ref` is refused (`CAP-S3-1`) |
| Solution (§2.2) | **Boundary confrontation** | **VACUOUS**, ×4 | The adversarial set is drawn from `test` instances on the same node. `test` is **`—`** for `conceptual` (CL-1 — empty **by construction**, no author action can populate it) and **`O`**, unplaced, on CL-2/CL-3/CL-4. Filed as **`OI-S11-3`** |
| Proof (§2.3) | All three checks | **NOT APPLICABLE**, ×4 | `proof` is `O` on all four node types and none is placed. **All three vacuous; none reported as passed.** Filed as **`OI-S11-4`** |
| Test (§2.4) | Label presence, coverage count, refusal accounting, self-oracle | **NOT RUN**, ×4 | CL-1: `test` is `—`, the standard cannot attach. CL-2/3/4: `test` is `O`, none placed — the coverage count over an empty set would report a failure about an artifact that does not exist. The standard is silent on the empty set; the reading taken is recorded in `../11_…` §4.4 as a **reading**, inside `OI-S11-3` |

**Roll-up: 16 standard × exemplar cells · 8 produced a verdict · 0 artifact violations detected · 2 violations detected in the standards' own reach** (`OI-S11-3`, `OI-S11-4`).

**Zero detected artifact violations is not recorded as a pass.** All 8 ran cells are the two *mechanical* layers of **one** standard, run by the party that authored the artifacts to satisfy them (`CAP-S1-4`'s lineage; filed as **`CAP-S11-2`**). Their mitigation is that they are mechanical and third-party re-runnable from this record — not that they are independent.

---

## 6. The anti-fabrication scan and the request audit

**Command.** A `node -e` script over `../11_…` counting citation-field-bearing lines, testing every `problem_ref:`-shaped line against the literal `REFUSED — not verifiable`, and extracting URL-shaped strings.

**Output, verbatim:**

```
CHECK-1 lines/bytes: 650 78952
CHECK-2 citation-field-bearing lines: 22
CHECK-2 field-shaped lines NOT reading REFUSED: 1 -> line(s) [428]
CHECK-3 URL-shaped strings: 0
CHECK-4 class-7 string occurrences: 4
```

*(Line 428 is the `problem_ref` of the §6 adversarial specimen — see the exception row below.)*

**Outcome, item by item — including the one exception, named rather than excluded.**

| Item | Result |
| --- | --- |
| Citation-field-bearing lines | **22** |
| Fields reading exactly `REFUSED — not verifiable` | **21 of 22** |
| **Deliberate specimen exception** | **1** — the `problem_ref` of the §6 adversarial specimen, which carries the unsupported-provenance **defect** the scenario exists to catch. A specimen reading `REFUSED — not verifiable` carries no defect and step 1 of the walk would have nothing to fire on. The field holds a **bracketed description** (`<a plausible-looking identifier and address, supplied from memory>`) — **not an identifier, not an address, not a source name**. Stated in `../11_…` §6 itself, not only here |
| URL-shaped strings | **0** |
| Identifier-shaped strings against any of the twelve sources | **0** |
| Class-7 `[future-real-user]` **claims** | **0**. The string occurs **4** times — §0's roll-up, §2.2 (twice) and the `EQ-S11-6` row — and **all four are negative statements** that no such claim is made. `../11_…` §2.2 records the distinction so a raw-occurrence scan is not misread as a gate trip. **The count was re-derived after the last edit to the companion document**, having gone stale once during authoring; that is why it is asserted from a scan rather than from memory |
| **Requests issued to any of the twelve sources, on any path** | **0** |
| Problem statement text / problem lists / enumerated candidate sets stored | **0** |
| Fields stored beyond the interim `stable_id` + `canonical_url` set | **0** — neither of the two is populated, because neither is verifiable |

**Limitation, carried not buried.** These scans are **lexical** (`CAP-S1-5`, `CAP-S2-6`). They prove structural presence and absence. **They cannot prove that no sentence in the companion document is a disguised unsourced claim**, and no grep can. Inherited as a review obligation, not discharged here.

---

## 7. The acceptance-scenario runs

### 7.1 Scenario 1 — the rubric review

Executed at a desk against the four exemplars; the per-limb table is `../11_…` §5. Mechanically supported limbs and their evidence in this record:

| Limb | Support |
| --- | --- |
| 4/4 cluster coverage | `../11_…` §3.5 |
| E1 node identity, 4/4 | §2 |
| E2 form-set counts — 27 REQUIRED, 21 instantiated, 6 `unreachable` | `../11_…` §3.5; every one of the 6 is a citation-bearing REQUIRED form |
| E3 pair present on all 17 instantiated discriminative forms | Field-presence inspection |
| E4 provenance, 4/4 | §6; recorded path `none — gate` for all twelve sources |
| E6 four triples with the verbatim label | §2 |
| E7 4/4 `deferred-provisional`, all units in `draft` | §2 |

**`CAP-S7-3` is not closed by §2's run.** Its closure condition names the **real node set** — 179 nodes. This is 4. Recorded so no reader mistakes a demonstration that the rule computes for the execution the cap requires.

### 7.2 Scenario 2 — the adversarial AI-generated solution

Executed at a desk against a constructed specimen; the firing order is `../11_…` §6.1. Recorded outcome:

| Limb | Result |
| --- | --- |
| Blocked or quarantined | **YES** — 3 × `blocks`, 1 × `quarantines` |
| Explicit reason | **YES** — 4 distinct recorded reasons; none is "failed review" |
| **Not an `AI` judge alone** | **YES** — **3 non-`AI` mechanisms** (`schema`, `server-side`, `deterministic`) fire **before** the `AI` row; deleting the `AI` row leaves the artifact blocked three times over |
| Unsupported provenance caught | **YES** — steps 1–2, neither a judgement |
| Ambiguity caught | **PARTIALLY** — its mechanical shadow (missing `invariant` slot) at step 3, deterministically; the ambiguity itself only at step 5, by judgement, therefore `quarantines` |
| **Hidden failing case caught** | **NO** — step 4 (`G-BOUNDARY`) is `unreachable`: the node carries no `test` instances and nothing requires it to. **The specimen's hidden failing case survives every check in this package.** `OI-S11-3` |

**Evidence class of both scenario runs: 3 `[dogfooding]`, n = 1, producing task** — the same class and the same honesty as `dry-run/06_corpus-swap-verification.md` §6. **Neither run is class 4, 5, 6 or 7, and neither is presented as one.**

**What was refused in both runs, recorded so the refusals are auditable:**

1. Placing an optional `test` on the exemplar nodes so boundary confrontation would have something to run against, then reporting the check passed — that manufactures the adversarial set the check exists to draw independently.
2. Reporting scenario 2 as a full pass on the strength of its stated criterion while its own premise's hidden failing case went undetected.
3. Reporting "21 of 27 forms, 78%" as a coverage result — a percentage whose missing members are all the citation-bearing ones hides its own shape.
4. Running the depth check on this sub-task's own prose and recording a pass.

---

## 8. Repository-hygiene checks

| Check | Command | Outcome |
| --- | --- | --- |
| Files added by this task | `git status --porcelain` at the commit base | **4 paths**, all under `docs/research/C009-course-content-quality/`: the topic doc, this record, and the two append-only register edits |
| `docs/research/C005-*` untouched | `git diff --numstat` | **0 changed files** — no map node minted, retyped or edited |
| Shared registers appended, never rewritten | `git diff --numstat` on `90_…` / `91_…` | **`N 0` for each** — zero deleted lines |
| Another sub-task's `###` section touched | Diff inspection | **none** |
| Reserved `90`–`99` band allocation | Filename inspection | **none** — the only writes into the band are the two appended `### SUB-11` sections |
| `.current-task` | `git diff` | **0 diff** |
| `pnpm-workspace.yaml` | `git diff` | **0 diff** |
| `docs/GLOSSARY.md` | `git diff` | **0 diff** — untouched **deliberately**, following the SUB-2/7/8/9/10 precedent; disclosed in `../11_…` §11 rather than left silent |

---

## 9. The verification no-op, stated precisely

`qa-execution:engine` is **unconfigured** — the active capability registry resolves to `git, linear` and no capability owns that surface. The automated QA-execution phase is a genuine **Core Article 8 no-op**: a phase with **no provider**, not one skipped, deferred or waived.

**No QA run, pass, verdict, report or coverage claim is asserted anywhere in SUB-11's output.**

The repository's own gates do not read this change: `lint`'s scope is literally `src tests`, and `tsc --noEmit` type-checks TypeScript sources. **`docs/**` is outside both.** A green line from either is **not evidence about anything in this change** and is not presented as any. This is the ninth independent statement of the same environmental fact in this package (`CAP-S1-3`, `CAP-S2-2`, `CAP-S3-6`, `CAP-S4-1`, `CAP-S5-3`, `CAP-S6-5`, `CAP-S7-4`, `CAP-S9-1`), not a new finding.

---

## 10. What a third party should re-run first

1. **§2's extraction** — it is the only thing standing between the four published triples and a transcription error, and it is the package's **first** execution of SUB-7's combination rule over real values.
2. **§4's reference-resolution scan** — it is what proves `../11_…` introduces **no new gate id** and cites **no dangling** cap, open item or gate.
3. **§6's anti-fabrication scan** — and then read the companion document for the thing the scan cannot see, per §6's own limitation clause.
