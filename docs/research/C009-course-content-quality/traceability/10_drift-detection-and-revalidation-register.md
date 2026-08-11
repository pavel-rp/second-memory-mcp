# 10 — Drift Detection and Revalidation: Simulation and Audit Register

**Task:** NEU-966 (SUB-10) · **Charter:** C009 (umbrella NEU-890) · **Compiled:** 2026-08-11 · **Verification cutoff:** 2026-08-11 · **Covers:** OUT-10 · **Status:** **deferred — this document SETS no status.**
**Model:** claude-opus-5[1m]

Companion to `../10_citation-drift-detection-and-revalidation.md`. This file records the **runs and the audits**; the policy lives in the topic document.

> **The governing fact, stated before any result.** **No request was issued to any of the twelve sources, by this sub-task, at any time.** Every simulation below is **desk-executed against a constructed specimen citation**, in the `03_requirement-decision-mapping-gate.md` §4 shape. A specimen is not a source, and a desk execution is not a run against one. `CAP-S10-5`.

---

## 1. Design of the runs

### 1.1 What is under test

> **Claim under test.** Every enumerated drift signal, and every change no signal matches, produces a **detection signal and a defined degradation** — never a silent pass. And the frequency bound holds: a citation served repeatedly inside its window issues no request, and an exhausted budget degrades rather than widening.

### 1.2 Pass condition, fixed before the runs

| # | Condition |
| --- | --- |
| **PC-1** | Every constructed drift case fires **at least one** enumerated signal, or the residual clause. **No case passes as unchanged.** |
| **PC-2** | Every fired signal resolves to a **defined degradation** naming the unit state and the placement outcome. |
| **PC-3** | The restricted-stored-set run detects `D3`/`D4`/`D5` **without any field added to storage**. |
| **PC-4** | The frequency cases issue **zero** requests inside the window, and the budget-exhausted case does **not** widen the rate. |
| **PC-5** | No case requires a second access method, a re-descent of the hierarchy, or any enumeration. |

**A run whose pass condition is written after the result is not a run.** These five were fixed before §2 was populated.

### 1.3 Method

Manual construction and inspection against `../10_…` §2 (signals), §4 (baselines), §5 (frequency) and §6 (degradation). **No code was written, no store was touched, and no fetch was performed.** The specimen citation carries an explicit **placeholder** identifier throughout — never a real or plausible-looking one, per `C2` and incident `EXC-1`.

### 1.4 The specimen

**Node:** `dp.knapsack.bounded` · **Skill type:** `implementation` · **Citation:** `{ stable_id: "PLACEHOLDER-PROBLEM-A", canonical_url: "PLACEHOLDER-URL-A" }`

**Recorded baseline** — the dated SUB-3 verification observations this specimen is compared against. **These are constructed for the specimen; no such observation exists for any real citation, because no real citation exists.**

| Observation | Value | SUB-3 step |
| --- | --- | --- |
| `title_observed` | `PLACEHOLDER-TITLE-A` | `V5`, dated |
| `constraints_observed` | `PLACEHOLDER-CONSTRAINTS-A` | `V5`, dated |
| `difficulty_observed` | `PLACEHOLDER-RATING-A` | `V6`, dated |
| `last_verified_at` | `2026-04-01` (constructed) | — |

---

## 2. The drift simulations

| Case | Constructed change at source | Compared against | **Signal** | **Unit state** | **Placement** | Silent pass? |
| --- | --- | --- | --- | --- | --- | :-: |
| **DS-1** | Problem deleted; the id is unknown to the source | stored `stable_id` | **`D1`** | `blocked` | **suspended** | **No** |
| **DS-2** | Problem moved; `canonical_url` 404s, `stable_id` still resolves | stored pair | **`D2`** | `blocked` | **suspended** | **No** |
| **DS-3** | `stable_id` and `canonical_url` resolve to **different problems** | stored pair | **`D2`** | `blocked` | **suspended** | **No** |
| **DS-4** | Title restated; id, URL and constraints unchanged | dated `V5` observation | **`D3`** | `blocked` | **suspended** | **No** |
| **DS-5** | **Constraints changed**; every identifier and the title unchanged | dated `V5` observation | **`D4`** | `blocked` | **suspended** | **No** |
| **DS-6** | Source re-rated the problem; nothing else changed | dated `V6` observation | **`D5`** | advances, finding recorded | **retained** | **No** |
| **DS-7** | Licence footer changed; no enumerated field moved | all five baselines | **residual** | `quarantined` | **suspended** | **No** |
| **DS-8** | DS-4 + DS-5 + DS-6 re-run under the **interim stored set only** | dated observations only | `D3`, `D4`, `D5` | as above | as above | **No** |

**Result: 8 of 8 drift cases fired a signal and produced a defined degradation. Zero silent passes.**

### 2.1 DS-5 in full — the case the document exists for

Every identifier is valid. The id resolves, the URL resolves, the pair agrees, the title matches. **`D1`, `D2` and `D3` all PASS.** Only `D4` fires.

| Step | Observed |
| --- | --- |
| `D1` | PASS — id resolves |
| `D2` | PASS — URL resolves to the same problem; pair agrees |
| `D3` | PASS — title matches the dated observation |
| **`D4`** | **FAIL** — live constraints ≠ `PLACEHOLDER-CONSTRAINTS-A` |
| `D5` | PASS |
| **Degradation** | Unit `blocked`; placement **suspended**; accumulated mastery evidence **retained unrecomputed** (`../06_…` §6.4, executed once at `../dry-run/06_…`, 4/4 PASS — **cited, not re-run**) |
| **Residual recorded** | The node's `retrieval` item was authored against `PLACEHOLDER-CONSTRAINTS-A` and its `expected_response` is now stale. **The swap does not re-grade it.** Filed as `OI-S10-3`. |

**This is the case a placement-only check would miss**, which is why the signal set is five and not two.

### 2.2 DS-7 — the residual case

The change is real, observed, and matches nothing. Under a "signals are the specification" reading it would pass as unchanged.

| Slot | Value | Admissible per |
| --- | --- | --- |
| `reason` | `retracted-input` | `../09_…` §8.2 — closed set of five |
| `owner` | **SUB-10 (NEU-966)** | `../09_…` §8.2 — the "named work-item id" limb; the party who can enumerate a sixth signal |
| `exit_condition` | `register:OI-S10-5 closes` | `../09_…` §8.2 shape 2 |

**The owner is not the recorder.** `../09_…` §8.2's prohibition is satisfied: a `quarantine-recorder` records this; SUB-10 releases it by amending the signal set.

### 2.3 DS-8 — the restricted-stored-set run

**PC-3's case.** DS-4, DS-5 and DS-6 re-executed with the citation record holding **only** `stable_id` + `canonical_url`.

| Check | Result |
| --- | --- |
| Did `D3`, `D4`, `D5` still fire? | **Yes** — each compared against the dated `V5`/`V6` observation in `traceability/03_…`, which is **not a stored citation field**. |
| Was any field added to the citation record to make the comparison possible? | **No.** The record carried the interim pair throughout. |
| Was any wider field read from storage? | **No.** No wider field exists to read. |
| Would the result differ under the wider disposition? | **No.** The same comparison would run against stored fields instead of observations, **with no change to the signals or the degradation rule** (`../10_…` §4). |

**PC-3 PASS.**

---

## 3. The frequency simulations

| Case | Construction | **Requests issued** | Outcome |
| --- | --- | --: | --- |
| **DS-9** | One citation with a fresh dated verdict, served **500 times** inside the 90-day window | **0** | Every serve answered from the **cached dated verdict**. The source saw nothing. |
| **DS-10** | Citation whose verdict is **132 days** old; its source's `per_source_revalidation_budget` = **0** | **0** | Re-check **not issuable**. Citation marked **`verdict stale`** → `quarantined` (`retracted-input`). **The budget was not widened.** |

**PC-4 PASS.** DS-9 is the case that makes a serve-time gate admissible: the request cost is bounded by the window, not by the serve count.

### 3.1 Reconciliation with SUB-9's `G-BUDGET`

| Re-check shape | `G-BUDGET` (`../09_…` §6.3) | This policy | Agree? |
| --- | --- | --- | :-: |
| Past window, inside budget | PASS | issue one request | **Yes** |
| Inside window | BLOCK | never issued — cache is read | **Yes** |
| Over budget | BLOCK | queue and degrade | **Yes** |
| No audit record | BLOCK | inadmissible | **Yes** |

**No legitimate re-check is flagged as a scaled-up fetch, and no unbounded loop is waved through.** The audit record's four fields (`citation_id`, `checked_at`, `path`, `window`/`budget` admitted under) are exactly the fields `G-BUDGET` reads.

---

## 4. Request-pattern audit

| Axis | Finding |
| --- | --- |
| Requests issued to any of the twelve sources | **Zero.** |
| Enumerating endpoints called | **None.** |
| Crawls or corpus walks | **None**, on either the authoring-time or the serve-time specimen run. |
| Access hierarchy re-descended | **No.** No source has a recorded resolving path to re-descend — `V0` halts all twelve. |
| Second or looser access method used | **No.** |
| Candidate re-selected at re-check time | **No** — `V1` is not re-run (`../10_…` §3.2); re-selecting would import the source's current ranking (`X1`). |

**Why zero:** `G-ACCESS-GATE` condition 2 / SUB-3 `V0` shuts every source. **The audit is therefore vacuous in the same sense SUB-3 §8's was**, and is recorded as such rather than as a demonstrated clean pattern.

---

## 5. Frequency audit

| Check | Result |
| --- | --- |
| Maximum requests per citation per window, over DS-9 | **0 observed** (bound is 1; the bound was never approached because no request is issuable) |
| Every issued re-check dated and admitted under a stated window and budget | **Vacuous — zero re-checks were issued** |
| Budget-exhausted source widened its rate | **No** (DS-10) |
| Inside-window re-check issued | **No** (DS-9) |

---

## 6. Retention audit

| Check | Result |
| --- | --- |
| Was any whole-list response received during revalidation? | **No.** None was requested; none could be. |
| Was any list stored, cached, transcribed or mined? | **No** — there was nothing to retain. |
| Does any file in this sub-task's output carry a serialised response body, a candidate shortlist, or an id/rating table? | **No.** |
| Is the specified retained artifact the per-citation verdict only? | **Yes** — `{ citation_id, checked_at, path, verdict, signals_fired, window, budget }`, and no part of any enumeration. |

> **This is a vacuous pass, not a demonstrated one.** **Nothing here establishes that the retention discipline holds under a real whole-list response**, because no such response was ever obtained. A future pass that actually calls an enumerating endpoint must run this check for real and **must not cite this section as precedent that it passes.** `CAP-S10-3`, in the shape of `CAP-S3-4`.

---

## 7. Non-mutation audit

| Check | Result |
| --- | --- |
| Files changed outside `docs/research/C009-course-content-quality/` | **None** |
| Any `src/`, `tests/`, schema or migration file changed | **None** |
| Any other sub-task's topic document (`00`–`09`) changed | **None** |
| Any `90`–`99` file **claimed** as a topic doc | **None** — `10_` claimed, which was free |
| `90_…` and `91_…` | **Appends only** — one new `### SUB-10` section each; `git diff --numstat` reads `N 0` for both |
| Any other sub-task's `###` section edited, reflowed or renumbered | **None** |
| `92_package-completeness-gate.md` | **Untouched** — SUB-12's alone |
| `docs/GLOSSARY.md` | **Untouched**, following the SUB-2 / SUB-7 / SUB-8 / SUB-9 precedent; disclosed rather than silent |

---

## 8. Classification anchors

Each `EQ-S10-k` row in `../10_…` §7.1 resolves to a section of the topic document and to a gate SUB-9 already named.

| Rows | Anchor in `../10_…` | Gate | Gate is new? |
| --- | --- | --- | :-: |
| `EQ-S10-1` … `EQ-S10-9`, `EQ-S10-17` … `EQ-S10-19` | §2.1, §2.2, §5.1, §5.6, §6.1, §6.2, §6.5 | `G-DRIFT` | **No** |
| `EQ-S10-10` … `EQ-S10-12`, `EQ-S10-16` | §5.2, §5.3, §5.5, §5.6 | `G-BUDGET` | **No** |
| `EQ-S10-13` | §3.1 | `G-ACCESS-GATE` | **No** |
| `EQ-S10-14` | §3.2 | `G-TRANSPORT` | **No** |
| `EQ-S10-15` | §3.3 | `G-ENUM-SCAN` | **No** |
| `EQ-S10-20` | §4 | `G-FIELDSET` | **No** |
| `EQ-S10-21` | §7.3 | `G-DRIFT` (bounding) · `OI-S10-1` | **No** |
| `EQ-S10-22` | §5.2 | **`none — cap`** · `OI-S10-2` · `CAP-S10-1` | — |
| `EQ-S10-23` | §7.4 | `G-RESIDUAL` | **No** |

**Distinct gate ids introduced by this sub-task: 0.** SUB-9's count of **59** distinct named gates is unchanged, and **serve-time still counts exactly 1** (`G-DRIFT`), because every served-check row is placed `both` under it rather than as an additional serve-time gate.

---

## 9. Pass condition, evaluated

| # | Condition | Verdict |
| --- | --- | :-: |
| **PC-1** | Every drift case fires a signal or the residual clause; no case passes as unchanged (§2, 8/8) | **PASS** |
| **PC-2** | Every fired signal resolves to a defined degradation naming unit state and placement (§2) | **PASS** |
| **PC-3** | `D3`/`D4`/`D5` detected under the interim stored set with no field added (§2.3) | **PASS** |
| **PC-4** | Zero requests inside the window; budget-exhausted case degrades rather than widening (§3) | **PASS** |
| **PC-5** | No second access method, no re-descent, no enumeration (§4) | **PASS** |

> **Result: 5/5 PASS — against constructed specimens, by the producing task, at specification level.**

---

## 10. Limitations

Recorded because a register that reports only its pass condition is a press release.

- **Specification-level, not execution-level.** No detector, cache, scheduler or store exists. These runs verify that **the specified policy has the property**, not that an implementation of it does. An implementation that computed the verdict on the serve path, or cached the list it derived a verdict from, would fail the real check and **nothing here would catch it.** `CAP-S10-2`, `CAP-S10-4`.
- **One pass, by the producing task.** SUB-10 specified the signals and SUB-10 checked them — weaker evidence than an independent pass, inherited from `CAP-S1-4` / `CAP-S2-5`. The mitigation available was to make each case **mechanical** — a fixed specimen, a fixed baseline, a pass condition written in advance — which bounds how much the self-check can flatter itself. It does not eliminate it.
- **The specimens were constructed to be favourable to detection, not to the result.** DS-5 (constraints changed, every identifier valid) and DS-7 (a real change matching nothing) are the two cases most likely to expose a signal set as too narrow; a case where the id simply 404s would have passed trivially and proved nothing.
- **Every baseline observation is constructed.** No dated `V5`/`V6` observation exists for any real citation, so the comparison the policy specifies has **never been performed against a real recorded value.**
- **The miss rate is unknown and unbounded.** `OI-S10-1` records it: a signal set never run against a real source cannot report how much it misses, and DS-7 exists to route those misses somewhere visible rather than to claim there are none.
- **`D5`'s `warns` inherits `OI-S9-12`.** Whether the recorded finding is ever read is not established here and is not claimed. `OI-S10-4`.
