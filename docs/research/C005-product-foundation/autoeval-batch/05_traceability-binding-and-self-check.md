# Traceability Results-Binding & Adversarial Self-Check

**Task:** NEU-903 (SUB-10) · **Compiled:** 2026-07-11 · **Inputs:** NEU-901 (`../measurement-contracts/`), NEU-902 (`../automated-evaluation/`), NEU-899 (`../traceability/`).
This file records NEU-903's contribution to the `LINK-3` slot — the **results** half — and runs the adversarial self-check. It **adjudicates no status** and **invents no measurement value**.

---

## 1. `LINK-3` results-binding (per the NEU-899 binding protocol)

NEU-899 reserved `LINK-3` for "the automated-eval reliability protocol + DP-domain results" (`../traceability/03_…` §3), resolving `INC-3`. NEU-902 bound the **protocol** (PARTIALLY BOUND). NEU-903 now binds the **results** it owns — the executed `BATCH-AUTOEVAL` raw evidence.

| Slot | Will hold | Owner | Binding by NEU-903 |
| --- | --- | --- | --- |
| **`LINK-3`** | The automated-eval reliability protocol + DP-domain results. | NEU-902 (protocol) → **NEU-903 (results)** → NEU-906 (adjudication) | **RESULTS BOUND** → `autoeval-batch/` (this package): `AEP-1`/`ACS-1 v1.0` executed across 3 isolated clean-context runs (`RUN-1/2/3`); per-case raw `quality`/`action`, oracle-vs-actual, and per-item over-validation flags retained (`RET`), each run carrying all 7 `CCR-*` fields. **Raw over-validation flags:** `{ACS-1-03, ACS-1-07, ACS-1-11}` (the three INCOMPLETE cases), stable across all 3 repeats; 6 SHALLOW/WRONG adversarial cases not over-validated; 3 CONTROLs correctly passed (oracle-validity guard OK). **Adjudication of R3/FM4/BM-5 remains pending NEU-906 via `LINK-4`.** |

The `../traceability/03_…` `LINK-3` row is updated to reflect **PARTIALLY BOUND → RESULTS BOUND (protocol + executed results; adjudication pending)**. Per the binding protocol, this attaches the artifact identifier to the slot **without** editing any element's evidence class, limitation, or id, and **without** enacting any mutable STATUS change (NEU-906 via `LINK-4`).

## 2. What stays UNRESOLVED (reported, never invented)

| Marker | State after NEU-903 | Why |
| --- | --- | --- |
| **`INC-3`** | **UNRESOLVED** (protocol + results bound; adjudication pending) | NEU-903 **collected** the DP-grading over-validation evidence via `AEP-1`; **settling** R3/FM4/BM-5 (whether the bound is `supports/contradicts/inconclusive`) is **NEU-906's** exclusive authority. Producing evidence ≠ adjudicating it. |

R3 (the FM4/BM-5 reliability risk) stays **UNRESOLVED and non-downgradable** (`OC-7`); no automated result can settle or drop a High risk. The class-5 structural bound holds: green cases do not establish reliability, and the three raw flags do not by themselves establish an over-validation *rate* — they bound the specific probed failures (`03_…` §3, G5.1).

## 3. Adversarial self-check (claim discipline)

Performed 2026-07-11 before completion, mirroring the NEU-897…904 self-checks.

- **Run-not-adjudicate.** This task **executed** 12 cases × 3 isolated runs and recorded raw evidence + run-level verdicts. It set **zero** mutable status, changed **zero** frozen values, adjusted **zero** oracles. Adjudication is NEU-906's. ✅
- **Pre-run gate honored.** `GATE-STATE = PASS` at `v1.0` confirmed; `MC-4 v1.0`/`AEP-1`/`ACS-1 v1.0`/`CCR-1…7` versioned+frozen before the first run; blocked-run test reproduced (`00_…`). ✅
- **Caps intact.** 1 automatable hypothesis (≤ 6), 12 cases (≤ 18), 1 batch; cap-exceedance routing rule stands and was not triggered (`04_…` §3; acceptance scenario 4). ✅
- **Reference, never redefine.** The only quantity used, `quality ≥ 3` = pass, is quoted from `MC-4 v1.0`/`FEAS-2`; the BOUNDING rule and `GRADER-VAR`/`MODEL-VERSION-BOUND` tolerance are quoted, not redefined. No metric/threshold/oracle invented (`OC-5` respected). ✅
- **Never-fabricate-scores.** Every `quality`/`action` was **read from the grader response** (`03_…`); the oracle is the authored input's ground truth, not a fabricated score; the executor performed the oracle comparison **after** the grader committed (`CCR-7`). ✅
- **Genuine clean-context isolation.** Three separately-initialized isolated subagent runs; each carries all seven `CCR-*` evidence fields; `CCR-3`/`CCR-7` achieved by fresh isolated contexts with byte-identical prompts containing no prior output/oracle/archetype; seed `UNSUPPORTED` recorded honestly with `GRADER-VAR` (not faked) (`02_…`). ✅
- **Verdict comparison recorded raw.** 12/12 per-case verdicts and the over-validation flag set reproduced across all 3 runs; the only divergence (sub-threshold `q=0↔1` on two WRONG cases, both FAIL) is recorded, not smoothed (`04_…` §1). ✅
- **Oracle-validity guard.** All 3 CONTROLs passed in all 3 runs ⇒ no under-crediting defect; the grader discriminates correct from deficient answers, so the INCOMPLETE-case PASSes are a genuine signal, not an artifact (`04_…` §2). ✅
- **Evidence-class integrity (no laundering).** All results labeled class-5 `[automated-eval]` with the "green ≠ product-correct / bounds-not-reliability" limitation; never presented as class-3 dogfooding, class-4 critique, class-6 log, or class-7 external-user/expert/market validation. The LLM grader is never called a human learner or expert. ✅
- **Minimal-harness discipline.** The `JNY-F3` reserved harness was used only because the live path was unreachable; it exposes **only** the quality-derivation step and created **no** UI/architecture/provider/production commitment (EX4/BX-4; `00_…` §5). ✅
- **Severity floor.** R3 (and untouched R1/R2/R4/R5) stay UNRESOLVED/non-downgradable; no automated result settles or drops a High risk (`OC-7`). ✅
- **Privacy scan.** Inputs are authored synthetic DP answers — **no** operational-log payload; every record is payload-free (`PLA-1…3`, `EX6`/`BX-5`). ✅
- **No new-id collision / no renumbering.** Only run ids (`RUN-1/2/3`, isolated-run ids) and fixture ids (`FIX-*`, `BASE-ACS1v1.0`) are introduced; every upstream `MC-*`/`H-*`/`ACL-*`/`AEP-*`/`ACS-*`/`CCR-*`/`INC-*`/`LINK-*` id is reused verbatim. `LINK-3` is bound (results), not duplicated. ✅
