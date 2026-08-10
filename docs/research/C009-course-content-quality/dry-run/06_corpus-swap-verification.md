# Corpus-Swap Verification — a retired citation against the evidence record shape

**Task:** NEU-962 (SUB-6) · **Charter:** C009 (umbrella NEU-890) · **Compiled:** 2026-08-10 · **Verification cutoff:** 2026-08-10 · **Covers:** OUT-5 · **Status:** **deferred — this document SETS no status.** Status lives in a ledger: this package's `adjudication/`, or the owning package's ledger for an inherited decision (`A1`–`A5`: a producing task may not promote its own artifact)
**Model:** claude-opus-5[1m]

This records a **run**, not an assertion. Charter assumption 18 says assessment evidence is recorded corpus-neutrally so that a dead or drifted citation degrades a placement without stranding accumulated mastery history. `06_assessment-evidence-out-of-band.md` §6 specifies a record shape intended to make that true. This document takes that shape, builds a specimen record against it, retires the citation, and reports what was observed — including anything that did not hold.

**This is the package's single execution of the corpus-swap check.** SUB-10 (NEU-966) **cites this result rather than re-running it** against a second record shape. Running it twice against two shapes would produce two results and no answer about which shape the package actually has.

**It needed no verified citation, and therefore no SUB-3 output.** The citation attribute is filled with an explicit **placeholder**, not with a real problem reference. That is why this check runs in parallel band `[P1]` alongside SUB-3 rather than behind it: the property under test is a property of *the shape*, and the shape does not care whether the value in the replaceable slot was ever resolvable.

---

## 1. Design of the run

### 1.1 What is under test

> **Claim under test.** Retiring and replacing a record's cited problem changes **only** the citation attribute. No record is orphaned, no gate result is silently invalidated, and every accumulated mastery signal survives unrecomputed.

### 1.2 Stated pass condition, fixed before the run

The run **passes** if and only if all four hold:

| # | Condition |
| --- | --- |
| **PC-1** | Every specimen record is still addressable by its key after the swap — **no record is orphaned**. |
| **PC-2** | Exactly the two citation subfields (`stable_id`, `canonical_url`) differ before vs. after. **Every other field is byte-identical.** |
| **PC-3** | No gate input changes, so **no gate result changes** and none is silently invalidated: the Gate A / Gate B / Gate C determinations computed before the swap are the same determinations after it, from the same inputs. |
| **PC-4** | The result is **identical under both dispositions of `CH-F5-1`** — i.e. it does not depend on whether the citation attribute is permitted to carry more than `stable_id` + `canonical_url`. |

Anything that fails is recorded as a finding. **A run whose pass condition is written after the result is not a run.**

### 1.3 Method

Manual construction and inspection against the field table in `06_…md` §6.1 and the procedure in §6.3. **No code was written, no database was touched, and no fetch was performed** — the record shape is a specification, not a live schema, and there is nothing yet built to execute it against. That is a real limitation of this run and is recorded as such in §5 rather than glossed.

---

## 2. The specimen

Three records at **one graph node** and **one skill type**, across **two separated sessions**, so that the swap is exercised against evidence that has actually accumulated something worth stranding. The citation attribute carries a **placeholder** throughout.

**Node:** `dp.knapsack.bounded` (a node id in the map's grammar) · **Skill type:** `implementation` (one of the eight fixed literals) · **Learner:** `learner-SPEC-1`

| | **SPEC-R1** | **SPEC-R2** | **SPEC-R3** |
| --- | --- | --- | --- |
| `node_id` | `dp.knapsack.bounded` | `dp.knapsack.bounded` | `dp.knapsack.bounded` |
| `skill_type` | `implementation` | `implementation` | `implementation` |
| `learner_id` | `learner-SPEC-1` | `learner-SPEC-1` | `learner-SPEC-1` |
| `session_ref` | `session-A` | `session-B` | `session-B` |
| `observed_at` | `2026-08-01T09:00:00Z` | `2026-08-03T09:00:00Z` | `2026-08-03T09:20:00Z` |
| `signal` | `pasted_solution` | `retrieval_item_result` | `assessment_item_result` |
| `reliability_class` | 2 `[code-evidence]` | 2 `[code-evidence]` | 2 `[code-evidence]` |
| `item_form` | `solution` | `retrieval` | `assessment` |
| `rubric_payload` | present (4 criteria, 4 spans) | present | present |
| `derived_quality` | `4` | `4` | `5` |
| `gate_relevance` | dependents of `dp.knapsack.bounded` | dependents of `dp.knapsack.bounded` | dependents of `dp.knapsack.bounded` |
| **`citation`** | **`{ stable_id: "PLACEHOLDER-PROBLEM-A", canonical_url: "PLACEHOLDER-URL-A" }`** | **same placeholder A** | **same placeholder A** |

**Accumulated state before the swap** (derived from the three records, not stored on them):

| Derived state | Value before |
| --- | --- |
| Counted non-massed successes toward `MM-T1` (K = 3) | **3** |
| Separated sessions toward `MM-T2` (S ≥ 2, ≥ 1 day apart) | **2** — `session-A` 2026-08-01, `session-B` 2026-08-03 |
| Quality floor `MM-T3` (q ≥ 3) | **satisfied on all three** (4, 4, 5) |
| Gate A (`MM-T9`) | **cleared** — SPEC-R2 is an unaided in-app retrieval success |
| Gate B | **cleared** — K = 3 at q ≥ 3 across 2 separated sessions |
| Gate C (`MM-T8`) | **Gate B cleared**; composite pending the retrievability posterior, evaluated server-side |

---

## 3. The swap, executed step by step

Following `06_…md` §6.3 exactly. `PLACEHOLDER-PROBLEM-A` is retired and replaced by `PLACEHOLDER-PROBLEM-B`.

| Step | Procedure | What was done | Observed |
| --- | --- | --- | --- |
| **1** | Select every record whose `citation.stable_id` equals the retiring identifier — **by attribute, never by key**. | Selected on `citation.stable_id == "PLACEHOLDER-PROBLEM-A"`. | Matched **SPEC-R1, SPEC-R2, SPEC-R3**. The selection predicate never mentioned `node_id`, `skill_type`, `learner_id`, `session_ref` or `observed_at`, so **no key field participated in finding the records**. |
| **2** | Write the replacement `{ stable_id, canonical_url }` — both subfields together. | `citation` ← `{ stable_id: "PLACEHOLDER-PROBLEM-B", canonical_url: "PLACEHOLDER-URL-B" }` on all three. | Both subfields replaced atomically. No half-swapped state existed at any point. |
| **3** | Write nothing else. | No other field was written. | Confirmed by field-by-field comparison in §4. |
| **4** | Recompute nothing. | No quality re-derived, no success re-counted, no gate re-evaluated. | **No gate input changed** — every gate input (`derived_quality`, `session_ref`, `observed_at`, `node_id`, `skill_type`) sits outside the citation, so there was nothing for a recomputation to consume differently. |
| **5** | Degrade the placement, not the history. | The placement that offered `PLACEHOLDER-PROBLEM-A` at `dp.knapsack.bounded` became unavailable and was refilled by the normal citation route. | The placement changed. **The three records did not**, beyond step 2. |

---

## 4. Result

### 4.1 Field-by-field, before vs. after

| Field | Before | After | Changed? |
| --- | --- | --- | :-: |
| `node_id` | `dp.knapsack.bounded` | `dp.knapsack.bounded` | **No** |
| `skill_type` | `implementation` | `implementation` | **No** |
| `learner_id` | `learner-SPEC-1` | `learner-SPEC-1` | **No** |
| `session_ref` | `session-A` / `session-B` / `session-B` | unchanged | **No** |
| `observed_at` | three timestamps | unchanged | **No** |
| `signal` | three values | unchanged | **No** |
| `reliability_class` | 2 / 2 / 2 | unchanged | **No** |
| `item_form` | `solution` / `retrieval` / `assessment` | unchanged | **No** |
| `rubric_payload` | present ×3 | unchanged | **No** |
| `derived_quality` | 4 / 4 / 5 | 4 / 4 / 5 | **No** |
| `gate_relevance` | three values | unchanged | **No** |
| **`citation.stable_id`** | `PLACEHOLDER-PROBLEM-A` | `PLACEHOLDER-PROBLEM-B` | **Yes** |
| **`citation.canonical_url`** | `PLACEHOLDER-URL-A` | `PLACEHOLDER-URL-B` | **Yes** |

**Two fields changed. Both are citation subfields. Neither is in the key.**

### 4.2 Accumulated mastery evidence, before vs. after

| Derived state | Before | After | Survived? |
| --- | --- | --- | :-: |
| Counted successes toward `MM-T1` | 3 | **3** | **Yes** |
| Separated sessions toward `MM-T2` | 2 | **2** | **Yes** |
| `MM-T3` quality floor | satisfied ×3 | **satisfied ×3** | **Yes** |
| Gate A (`MM-T9`) | cleared | **cleared** | **Yes** |
| Gate B | cleared | **cleared** | **Yes** |
| Gate C (`MM-T8`) composite inputs | Gate B output + posterior | **unchanged** | **Yes** |
| Remediation counters (`MM-T13`, `MM-T14`) | 0 consecutive failures | **0** | **Yes** |

### 4.3 Pass condition

| # | Condition | Verdict |
| --- | --- | :-: |
| **PC-1** | No record orphaned — all three still addressable by their unchanged keys. | **PASS** |
| **PC-2** | Exactly `citation.stable_id` and `citation.canonical_url` differ; every other field identical (§4.1). | **PASS** |
| **PC-3** | No gate input changed, so no gate result changed and none was silently invalidated (§4.2). | **PASS** |
| **PC-4** | Identical under both `CH-F5-1` dispositions (§4.4). | **PASS** |

> **Result: 4/4 PASS.** A retired citation left the learner's accumulated mastery evidence intact; only the replaceable citation attribute changed; no record was orphaned and no gate result was silently invalidated.

### 4.4 The check under both `CH-F5-1` dispositions

The run above was executed with the citation attribute holding the **interim restricted set** — `stable_id` + `canonical_url` and nothing else (`DR-C09-01`, `CAP-S1-2`).

**Re-inspected under the wider set** (`title`, numeric `constraints`, difficulty signal, curriculum placement admitted, should `CH-F5-1` resolve that way): step 2 replaces *more subfields of the same attribute*; steps 1, 3, 4 and 5 are unchanged word for word; the key is unchanged; and §4.2's survival table is unchanged in every row. **The result is identical.**

**Why it is identical, rather than coincidentally the same:** the record's identity is `node_id` + `skill_type` (plus the learner/session/time scoping), and **the citation is not in the key under either disposition**. The property under test is a property of the key, and the disposition changes only the payload of a non-key attribute. This is why `06_…md` §6.2 carries **no field-set cap on this axis** — the invariance is derived, not observed once and hoped for.

---

## 5. Sub-threshold observations and limitations

Recorded because a run that reports only its pass condition is a press release.

- **This is a specification-level run, not an execution against a live store.** No schema, table, query or migration exists for this record shape — SUB-6 builds none, by scope. The run therefore verifies that **the specified shape has the property**, not that an implementation of it does. An implementation that put the citation in the key would fail this check, and nothing here would catch it. Filed as **`CAP-S6-3`**.
- **One run, by the producing task.** SUB-6 specified the shape and SUB-6 checked it, which is weaker evidence than an independent pass — inherited from `CAP-S1-4` / `CAP-S2-5`. The mitigation available was to make the check **mechanical** (a field-by-field before/after comparison against a pass condition fixed in advance) rather than judgemental, which bounds how much the self-check can flatter itself. It does not eliminate it.
- **The specimen was chosen to be favourable to detection, not to the result.** Three records across two sessions with a cleared Gate A and Gate B is the state with the *most* to strand; a single ungraded record would have passed trivially and proved nothing.
- **The placement degradation is real and is not counted as a survival.** After the swap, the node's offered problem changed. That is the intended cost — a placement degrades — and it is listed in `06_…md` §6.4's "does not survive" column rather than being quietly folded into the pass.
- **`session-B` carries two records** (SPEC-R2, SPEC-R3). Only one of them is `spacing_eligible`-bearing (`retrieval`), so the separated-session count is 2 and not 3. The swap does not interact with this either way; it is noted so that the `MM-T2` figure in §2 is not read as a count of records.

---

## 6. Evidence class of this run

| What it rests on | Class | Provenance |
| --- | --- | --- |
| The record shape under test | 2 `[code-evidence]` — a specification in this package, read at its source | `../06_assessment-evidence-out-of-band.md` §6.1, §6.3, §6.4 |
| The gate and threshold semantics the survival table is stated against | 2 `[code-evidence]` | `../../C005-instructional-model/mastery-model/00_operational-mastery-model.md` §4, §5 |
| The interim permitted citation field set | 2 `[code-evidence]` | `../decision-records/DR-C09-01_permitted-field-set.md`; `../01_provenance-and-rights.md` §4.1 |
| The run itself — construction, swap, before/after comparison | 3 `[dogfooding]` — a constructed specimen exercised by the producing task, n = 1 | this document, §2–§4 |

**No class-7 `[future-real-user]` evidence supports any part of this run, and none could:** no user was involved, and the property under test is structural. Class 7 does not exist for this package.
