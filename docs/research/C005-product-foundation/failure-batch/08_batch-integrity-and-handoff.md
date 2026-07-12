# Batch Integrity, `LINK-1`/`LINK-3` Results-Binding, Incomplete-Run Register & Self-Check

**Task:** NEU-905 · **Compiled:** 2026-07-12.
Discharges NEU-905's verification evidence: **batch-count check; AI-review independence-record audit; raw disagreement-log audit; reserved-prototype gate determination; vehicle-fidelity review; evidence-label & trace-link audit; check that no mutable hypothesis/decision status was set; explicit incomplete-run record for any unexecutable/insufficient journey element.** Adjudicates **no** status; invents **no** measurement value.

---

## 1. Batch-count & scope check (`../benchmark-suite/02_batch-allocation.md`)

| Constraint | Limit | NEU-905 actual | Pass |
| --- | --- | --- | --- |
| `BATCH-FAILURE` journeys executed | ≤ 3 | 3 (JNY-F1, JNY-F2, JNY-F3) | ✅ |
| Baseline-batch journeys touched (JNY-B1/B2) | 0 (owned by NEU-904) | 0 | ✅ |
| Targeted prototypes **built by NEU-905** | 0 (suite ≤1 allowance already spent on NEU-903's JNY-F3 harness) | 0 | ✅ |
| Suite prototype allowance | ≤ 1 whole suite | 1 (the JNY-F3 minimal grading-harness, built & executed by **NEU-903**; `00_…` §4) | ✅ |
| New journeys invented / boundary exceeded | 0 | 0 | ✅ |
| Selected non-prototype vehicles used | as NEU-900 assigned / v1.1 revised | JNY-F1/F2 v1.1 retrospective (`01_…`); JNY-F3 bound from NEU-903 | ✅ |

## 2. Execution-state ledger (raw)

| Journey | Half | Vehicle | Executed? | Evidence class | Raw result |
| --- | --- | --- | --- | --- | --- |
| JNY-F1 | BM-1 schema-transfer vs surface | v1.1 retrospective aggregates + testimony (`02_…`) | ✅ EXECUTED (2026-07-12), but transfer **not isolable** | class-3 RETROSPECTIVE **+** class-6 operational-log (separate records) | transfer signal `inconclusive` (no transfer probe); AI reviews (`03_…`) **unanimous `insufficient-evidence`** → carried **`incomplete`**; `INC-1` UNRESOLVED |
| JNY-F1 | BM-7 expertise-reversal boundary | v1.1 retrospective (n=1) | ❌ **not exercisable** (n=1 cannot un-know a pattern) | — | cap-bound **INCOMPLETE** (G2.1); not surfaced |
| JNY-F2 | BM-4 decay/relapse | v1.1 retrospective aggregates + testimony (`04_…`) | ✅ EXECUTED (2026-07-12), decay *shape* pooled | class-3 RETROSPECTIVE **+** class-6 (separate records) | decay/relapse *shape* `present`-leaning (pooled); AI reviews (`05_…`) **unanimous `insufficient-evidence`** → carried **`incomplete`**; `INC-1` UNRESOLVED |
| JNY-F2 | BM-3 hierarchical schedule optimum | v1.1 retrospective | ❌ **not computable** from aggregate | — | cap-bound **INCOMPLETE** (G1.2, `COLLECTION-GAP`); no interval rule invented |
| JNY-F3 | BM-5 AI over-validation | **NEU-903 `BATCH-AUTOEVAL`** (bound, not re-run; `06_…`) | ✅ EXECUTED by NEU-903 (3 isolated runs) | class-5 `[automated-eval]` (bound) **+** class-4 `[ai-critique]` (`07_…`) | over-validation `present` on INCOMPLETE archetype (stable ×3), SHALLOW/WRONG correctly failed; AI reviews (`07_…`) **unanimous `contradicts` of H-F3-as-worded**; `INC-3` UNRESOLVED |

## 3. Reserved-prototype gate determination

Per `../benchmark-suite/02_batch-allocation.md` §3, the suite permits ≤1 targeted prototype, reserved to JNY-F3. **Determination (`00_…` §4):** the four-part authorization gate holds (live `submit_answer` unreachable / cannot hold grader context fixed; no paper substitute; rationale recorded at build time; no UI/architecture/provider/production commitment), and it was **already exercised by NEU-903**, which built and ran the JNY-F3 minimal grading-harness as the `BATCH-AUTOEVAL` batch. The suite's single allowance is therefore **spent on that existing harness**. **NEU-905 builds 0 prototypes** — the FM4 uncertainty was already tested at that fidelity (and re-reading it under `07_…` needs no new prototype), and a second prototype would breach the suite cap (§3 last bullet; §4 routing rule). NEU-905 **does not re-adjudicate** NEU-903's gate decision and claims no authorization of its own. ✅

## 4. AI-review independence-record & disagreement-log audit

- **Executed reviews:** 3 journeys × 2 separately-initialized reviewers = **6 genuine class-4 reviews**, distinct model families (`claude-opus-4-8[1m]` + self-reported `claude-sonnet-4.5`/`claude-sonnet-5`), fresh isolated foreground subagent contexts, isolated initial verdicts, identical per-journey context packages, every reproduction field recorded (`03_…`, `05_…`, `07_…`). ✅
- **Raw disagreement log (no adjudication):**

| Journey | R1 (opus) | R2 (sonnet) | Unanimous? | `conflicted`? | Carried as |
| --- | --- | --- | --- | --- | --- |
| JNY-F1 | `insufficient-evidence` | `insufficient-evidence` | ✅ | No | **`incomplete`** (both insufficient-evidence, `04_…` §4) |
| JNY-F2 | `insufficient-evidence` | `insufficient-evidence` | ✅ | No | **`incomplete`** (both insufficient-evidence) |
| JNY-F3 | `contradicts` | `contradicts` | ✅ | No | **`contradicts` of H-F3-as-worded** (raw signal to NEU-906; settled result UNRESOLVED via `INC-3`) |

- **Zero `conflicted` journeys** (every journey's two reviewers agreed). **No verdict was averaged, smoothed, or turned into a status.** Load-bearing caveats preserved verbatim (F1: no transfer probe / reversal unexecutable; F2: BM-3 not derivable + low consecutive-failure rate cuts against naive relapse; F3: over-validation lands on INCOMPLETE not shallow/wrong). ✅
- **Note on the F3 signal:** a unanimous `contradicts` is **not** "H-F3 is false and closed." It is a raw input meaning the hypothesis **as literally worded** does not match the evidence, while a real FM4 phenomenon was found on an adjacent archetype. Reformulating/splitting the hypothesis is NEU-906's authority. Recorded raw.

## 5. No-status-set & measurement-firewall audit

- **No mutable hypothesis/decision status set.** No BM cell (BM-1/3/4/5/7), risk (R1/R3/R7), differentiator, or hypothesis (H-F1/F2/F3) was promoted/demoted. All adjudication deferred to NEU-906 via `LINK-4`. ✅
- **No metric/threshold invented.** No transfer instrument, decay curve, interval/schedule rule, mastery threshold, or over-validation *rate* was defined (SUB-4/`INC-2` sole authority; `OC-5` honored). The only quantity used for JNY-F3 (`quality ≥ 3` = pass) is quoted from the frozen `MC-4 v1.0` BOUNDING rule, not redefined. ✅
- **Severity floor.** R1, R3 (High) untouched and non-downgradable (`OC-7`); no verdict path settles or drops a High risk. The unanimous F3 `contradicts` does **not** downgrade R3 (reliability stays UNRESOLVED via `INC-3`). ✅
- **Markers preserved:** BM-1/BM-4 transfer/decay → `INC-1` UNRESOLVED; BM-7 → G2.1 INCOMPLETE; BM-3 → G1.2 `COLLECTION-GAP` INCOMPLETE; BM-5/FM4/R3 → `INC-3` UNRESOLVED. None resolved here. ✅

## 6. `LINK-1` & `LINK-3` results-binding notes (additive — per NEU-899 binding protocol)

NEU-900 left `LINK-1` **PARTIALLY BOUND** (selection/protocol; results pending NEU-904/905); NEU-904 attached its baseline results. NEU-903 **RESULTS BOUND** `LINK-3` (autoeval protocol + results). NEU-905 attaches its **failure-batch results** **without** editing any element's evidence class, limitation, or id, and **without** any mutable STATUS change (NEU-906/`LINK-4` only):

> **`LINK-1` results (failure batch) → `../failure-batch/` (NEU-905):** **JNY-F1** (BM-1/BM-7) and **JNY-F2** (BM-3/BM-4) EXECUTED under **vehicle revision v1.1** (`01_…`) — class-3 RETROSPECTIVE + class-6 operational-log evidence (separate records; `02_…`/`04_…`), 2 isolated AI reviews each (opus + sonnet). **Both journeys carried `incomplete`** (unanimous `insufficient-evidence`): BM-1 transfer not isolable (no probe), BM-7 reversal not exercisable (n=1, G2.1), BM-4 decay *shape* pooled-not-per-pattern, BM-3 optimum not derivable (G1.2). `INC-1` (BM-1/BM-4) stays **UNRESOLVED**; BM-3/BM-7 stay cap-bound **INCOMPLETE**; R1/R7 (High) non-downgradable; adjudication pending NEU-906 via `LINK-4`.

> **`LINK-3` (failure batch, additive to NEU-903's results-binding) → `../failure-batch/06_…`+`07_…` (NEU-905):** **JNY-F3** (BM-5) evidence **bound (not re-run)** from NEU-903's `../autoeval-batch/` (over-validation present on the 3 INCOMPLETE cases, stable ×3; SHALLOW/WRONG correctly failed; 3 CONTROLs OK). NEU-905 adds the **class-4 `[ai-critique]` review layer** (`07_…`): 2 isolated AI reviews (opus + sonnet), **unanimous `contradicts` of H-F3-as-worded** (the FM4 phenomenon is real but on the INCOMPLETE archetype, not shallow/wrong). BM-5/FM4/R3 stay **UNRESOLVED via `INC-3`**; R3 (High) non-downgradable; reliability *rate* not established; adjudication pending NEU-906 via `LINK-4`.

The `../traceability/03_…` `LINK-1` and `LINK-3` rows are updated to record these additive results-bindings (existing baseline/autoeval rows preserved).

## 7. Pending / optionally-open action list (higher-fidelity runs a future creator session could add)

The batch is **complete for every agent-executable element**; the following would raise fidelity but are **no longer blocking** (each is carried as an `incomplete`/`inconclusive` result, not coverage):

1. **JNY-F1 / BM-1 live transfer probe — `JNY-F1#R1/R2` (reserved, un-filled).** Live CONTENT-CREATION→TEACHING-FLOW at prereq A1, administering a **novel-instance transfer probe** to separate schema transfer from surface recall. Only this can move BM-1 from `inconclusive`.
2. **JNY-F1 / BM-7 expertise-reversal** remains **cap-bound INCOMPLETE (G2.1, EX5)** — not resolvable by a creator run at n=1; needs an out-of-caps population design.
3. **JNY-F2 / BM-4 per-pattern decay curve — `JNY-F2#R1/R2` (reserved, un-filled).** A constructed/observed single-pattern decay-then-relearn timeline. **BM-3 optimum** remains **cap-bound INCOMPLETE (G1.2)** — needs out-of-caps scheduling research (EX5), not this batch.
4. **JNY-F3** needs no further run at this fidelity; a **grader model/version change** would be a **new run** (`MODEL-VERSION-BOUND`), not a reinterpretation, and DP-grading *reliability* is OUT-7/`INC-3` work.

**No prototype is required for any of the above** (the one suite allowance is spent; none permitted beyond it).

## 8. Adversarial self-check (claim discipline)

- **Executed-only-what-is-honest.** JNY-F1/F2 executed genuine class-3 RETROSPECTIVE aggregates + class-6 operational-log (payload-free, from the authorized snapshot) + 6 genuine class-4 AI reviews; JNY-F3 bound genuine class-5 evidence from NEU-903 + 2 class-4 reviews. **No agent-executed run was relabeled as live creator dogfooding; no evidence was fabricated or class-upgraded.** The reserved live/probe runs remain un-filled. ✅
- **Incomplete carried, never counted.** JNY-F1 and JNY-F2 are carried `incomplete` (unanimous `insufficient-evidence`); BM-7/BM-3 carried cap-bound INCOMPLETE; none silently counted as coverage (acceptance scenario 5). ✅
- **Honest hypothesis mismatch surfaced, not hidden.** The JNY-F3 unanimous `contradicts` of H-F3-as-worded (shallow/wrong correctly failed; over-validation only on INCOMPLETE) is recorded as a first-class raw signal, not smoothed into a `supports`. ✅
- **Batch caps intact.** 3 journeys (≤3), 0 prototypes built by NEU-905, 0 baseline-batch journeys touched, suite ≤1 prototype allowance not exceeded. ✅
- **No new/colliding identifiers.** Only new `OBS-*`/`OPLOG-*`/`AIR-*` instances + the `JNY-F3#BIND` binding id introduced; every BM/FM/X/R/EX/BX/INC/LINK/MC/JNY/H id reused verbatim; no renumbering; `LINK-1`/`LINK-3` bound additively, not duplicated. ✅
- **Evidence-class integrity (no proxy laundering).** class-3 RETROSPECTIVE labeled class-3 with its non-standard-provenance limitation; class-6 kept separate; class-5 (bound) labeled class-5; class-4 reviews labeled class-4; **no run phrased as user/market/expert validation**; a forbidden-phrasing scan ("users want", "market validates", "experts confirm", "proven", "validated") finds these strings only inside prohibitions and this check. ✅
- **Fidelity recorded as a downgrade / no over-read.** JNY-F1/F2 revisions recorded as downgrades (`01_…` §3); reviewers' own caveats preserved verbatim; "transfer not isolable", "BM-3 not derivable", "over-validation on INCOMPLETE not shallow/wrong" all carried, not smoothed. ✅
- **Reviewer isolation.** Each reviewer saw only the sanitized raw evidence + hypothesis/fidelity boundary — **not** any orchestrator interpretation, the other verdict, or raw payloads. ✅
- **Privacy scan.** All new records payload-free (aggregate/query-scope/field-list only; JNY-F3 uses authored synthetic answers); the authorized snapshot was **not** re-queried; no additional DB queries were run (the snapshot's F1/F2 signals sufficed and the fidelity ceiling would be unchanged by more aggregates). ✅
- **Boundary & severity floor.** No `BX-*` crossed; EX3/BX-3 (no market/prevalence claim, n=1) enforced; EX4/BX-4 (no product commitment from the harness) enforced; R1/R3/R7 (High) untouched, non-downgradable (`OC-7`). ✅
- **No status flips.** No hypothesis/decision/BM-cell status set; NEU-906 retains sole adjudication authority via `LINK-4`. ✅

---

**Hand-off.** NEU-906 (adjudication) consumes the raw `incomplete` (JNY-F1/F2) and `contradicts`-of-H-F3 (JNY-F3) results above under frozen rules, plus the preserved caveats and `INC-1`/`INC-3`/G1.2/G2.1 markers; NEU-907 consumes the bound `LINK-1`/`LINK-3` once results + adjudication complete. **NEU-905 records raw evidence only.**
