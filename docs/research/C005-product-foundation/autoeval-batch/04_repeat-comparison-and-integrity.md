# Clean-Context Repeat Comparison, Oracle-Validity Guard & Batch Integrity

**Task:** NEU-903 · **Compiled:** 2026-07-11 · **Discharges:** acceptance scenario 3 + verification evidence "*verdict comparison against declared tolerance; check that no mutable evidence status was set; batch-count and coverage checks*".

This file compares the initial run against the clean-context repeats **within the declared `MC-4 v1.0` tolerance**, records agreement/divergence **raw**, confirms the oracle-validity guard, and audits batch counts — **without** setting any hypothesis or decision status.

---

## 1. Run-level verdict comparison (initial vs clean-context repeats)

Declared tolerance (frozen, `MC-4 v1.0`): **`GRADER-VAR` + `MODEL-VERSION-BOUND`** — a reading is valid for the exact recorded grader model/version (identical across all three runs, `02_…` §2); grader jitter is tolerated **so long as the run-level PASS/NOT-pass verdict and over-validation flag reproduce**. Seed is `UNSUPPORTED`, so reproducibility is evidenced by cross-repeat verdict agreement (`02_…` §3, `CCR-6`).

| Comparison surface | `RUN-1` vs `RUN-2` | `RUN-1` vs `RUN-3` | `RUN-2` vs `RUN-3` | Within tolerance? |
| --- | --- | --- | --- | --- |
| Per-case PASS/NOT-pass verdict (12 cases) | 12/12 identical | 12/12 identical | 12/12 identical | ✅ full reproduction |
| Per-item over-validation flag (9 adversarial) | identical (`03/07/11` flagged) | identical | identical | ✅ full reproduction |
| CONTROL guard verdict (3) | identical (all PASS) | identical | identical | ✅ |
| Raw `quality` value | identical on 10/12; `ACS-1-02` & `ACS-1-10` differ (RUN-1 `q=0`, RUN-2/3 `q=1`) | same 2 cases differ | identical 12/12 | ✅ within `GRADER-VAR` |

**Verdict agreement:** the run-level verdict **reproduces across all three isolated clean-context runs for all 12 cases (100%)**, and the over-validation flag set `{ACS-1-03, ACS-1-07, ACS-1-11}` is **identical** in every run.

**Recorded divergence (raw, not smoothed):** the only cross-run difference is a sub-threshold `quality`-value jitter on the two WRONG cases `ACS-1-02` and `ACS-1-10` — `q=0` in `RUN-1`, `q=1` in `RUN-2`/`RUN-3`. Both values are `≤ 2` (FAIL / NOT-pass), so **no verdict and no over-validation flag changes**. This is exactly the `GRADER-VAR` jitter the tolerance anticipates; it is recorded, not averaged away (BOUNDING is conservative). No case exhibited **intermittent over-validation** (a case passing in some repeats and failing in others); the three flagged INCOMPLETE items were graded `quality 3`/PASS in every repeat.

## 2. Oracle-validity guard (CONTROL cases)

Per `../automated-evaluation/02_…` §3, a CONTROL case (oracle pass) the grader *fails* would be **under-crediting** (out of `MC-4` scope) and, if every CONTROL failed, the run would be an oracle/grader-configuration defect (not FM4 evidence).

| CONTROL case | Oracle | Actual (all runs) | Guard result |
| --- | --- | --- | --- |
| `ACS-1-04` (KNAP) | pass | PASS (`q=5`) | ✅ correctly credited |
| `ACS-1-08` (LCS) | pass | PASS (`q=5`) | ✅ correctly credited |
| `ACS-1-12` (COIN) | pass | PASS (`q=5`) | ✅ correctly credited |

**All 3 CONTROLs passed in all 3 runs** ⇒ the oracle/grader configuration is **valid** (no under-crediting defect); the runs are admissible FM4 evidence. No CONTROL result is averaged into or subtracted from the over-validation reading. The guard confirms the grader is **not** simply failing everything: it discriminates correct answers (PASS `q=5`) from shallow/wrong ones (FAIL) — which makes the INCOMPLETE-case PASSes a genuine over-validation signal rather than a grading artifact.

## 3. Batch-count & coverage audit (acceptance scenario 4; NEU-902 `04_…` checklist)

| Check | Requirement | This batch | Result |
| --- | --- | --- | --- |
| Automatable hypotheses executed | ≤ 6 | 1 (H-F3 / `ACL-4`) | ✔ |
| Total cases executed | ≤ 18 | 12 (`ACS-1-01…12`) | ✔ |
| Every case → an automatable hypothesis | no orphan case | 12/12 → H-F3 / `MC-4 v1.0` | ✔ |
| Automatable hypothesis covered by ≥1 case | yes | H-F3 covered by 12 | ✔ |
| Clean-context repeats per case | ≥ 2 | 2 (`RUN-2`, `RUN-3`; plus clean-context-valid `RUN-1`) | ✔ |
| Every executed run carries all 7 `CCR-*` fields | yes | 3/3 runs (`02_…` §3) | ✔ |
| Cap-exceedance routing | reject & route to scope revision | not triggered (1 ≤ 6, 12 ≤ 18) | ✔ (rule stands, `../automated-evaluation/04_…` §5) |

**Incomplete-run register:** **none.** All 12 cases executed across all 3 runs; every run is clean-context-valid; no case was rejected for a missing `CCR-*` field. (Contrast NEU-904, whose class-3 creator halves were incomplete/pending-creator — `AEP-1` is fully agent-executable, so this batch is complete.)

## 4. Privacy & class integrity (raw record)

- Every record is **payload-free**: inputs are authored synthetic DP answers (`01_…`), not learner data; `PLA-1…3` / `EX6`/`BX-5` honored.
- All results are **class-5 `[automated-eval]`**; none is presented as class-3 dogfooding, class-4 AI-critique, class-6 log, or class-7 external-user/expert/market validation (`../automated-evaluation/05_…` claim discipline).

## 5. Handoff (raw evidence → adjudication)

The retained over-validation flags (`{ACS-1-03, ACS-1-07, ACS-1-11}`, stable across 3 repeats) + the frozen `MC-4` BOUNDING rule + the `GRADER-VAR`/`MODEL-VERSION-BOUND` tolerance are handed to **NEU-906**, which alone flips mutable status for R3/FM4/BM-5 via `LINK-4` (a new interpretation requires a new run/version). NEU-907 consumes the bound `LINK-3` + this batch's results for the decision package (`LINK-5`).

## 6. No-mutable-status-set attestation (acceptance scenario 3)

> This batch recorded **raw evaluation evidence and run-level verdicts only**. It set **no** mutable hypothesis or decision status (FM4/R3/BM-5/RA5 remain exactly as NEU-901/NEU-899 left them — UNRESOLVED/non-downgradable), changed **no** frozen metric/threshold/decision-rule/tolerance, adjusted **no** oracle, and added **no** hypothesis or case beyond the NEU-902 cap. Adjudication is deferred entirely to NEU-906 (SUB-11). ✅
