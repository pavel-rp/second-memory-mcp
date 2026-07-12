# Per-Evidence-Item Adjudication (under frozen `MC-* v1.0`)

**Task:** NEU-906 · **Compiled:** 2026-07-12 · **Method/rule-versions:** `00_…`.
One row per executed evidence item. Each item names its **applicable frozen contract + version**, the **raw signal** (read from the source record, never re-derived), whether the **frozen rule held** (rule-validity check, `00_…` §2), and the resulting **evidence status** (`00_…` §4). Mutable **decision status** per hypothesis/requirement is `03_…`. **No metric/threshold/rate is invented; no v1.0 result is rescored; every High risk keeps its severity floor.**

Evidence-item id scheme reuses the upstream record ids verbatim (no renumbering): `OBS-*` (class-3), `OPLOG-*` (class-6), `RUN-*`/`ACS-*` (class-5), `AIR-*` (class-4), plus the class-2 BM-8 inspection.

---

## 1. JNY-B1 → BM-2 / BM-8 (contracts MC-1, MC-6, MC-9)

| Item | Class | Applicable rule (frozen) | Raw signal (from source) | Rule held? | Evidence status |
| --- | --- | --- | --- | --- | --- |
| BM-8 measurement-feasibility inspection (`../baseline-batch/05_…` §2) | 2 `[code-evidence]` | **MC-6 v1.0** COLLECTION-GAP (no per-pattern mastery field exists) | No schema field computes a per-DP-pattern mastery estimate; signal-feasibility gap `present`; 2 isolated AI reviews unanimous `supports` (verified at commit `3714e43`). | ✅ COLLECTION-GAP held; **no threshold invented** (`OC-5`). | `CONFIRMED-CLASS-2` (the *gap* is an operator-independent code fact) → but the mastery **signal itself** stays `COLLECTION-GAP`. |
| `OBS-JNY-B1#RETRO-BM2` (`../baseline-batch/07_…` R1) | 3 `[dogfooding]` RETRO | **MC-1 v1.0** DIRECTIONAL (retained across `≥2` re-reviews ⇒ FM1-mitigation present) | SR ladder: chunks advanced reps 2→9 with monotonically growing intervals (1→5.8→45→125→137→141d); 259 passed vs 61 failed attempts. Retention-holds direction `present`-leaning (**pooled across chunks**, not a single tracked pattern). | ✅ DIRECTIONAL held: direction only, **no effect size** (G1.1). | `PROXY-DIRECTIONAL-PRESENT` (n=1, retrospective, **not pre-registered**, pooled). |
| `OPLOG-JNY-B1#BM2` (`../baseline-batch/07_…` R2) | 6 `[operational-log]` | **MC-1 v1.0** (loop-reality corroboration) | `teach_next`(217)+`submit_answer`(285)=502 dominate learning-tool volume over 101 active days; 0 error-level events on learning tools. | ✅ Corroborates the real teach→submit loop; no intent/preference claim (class-6 limit). | `PROXY-DIRECTIONAL-PRESENT` (operational corroboration only; **admissibility PASS**, `02_…` PLA-1). |
| DP in-domain transfer effect (MC-9 umbrella) | — | **MC-9 v1.0** DIRECTIONAL proxy only | No in-domain DP benchmark result exists this stage (INC-1). | ✅ No effect-size claim authorized. | `UNRESOLVED` (INC-1). |

**Adjudication note (H-B1).** The class-3 direction and class-6 corroboration agree, but **AI-reviewer agreement is class-4↔class-3, not external validity**. Under MC-1 v1.0 the reading is *directional presence only*. The DP-domain effect (MC-9/R1) is **UNRESOLVED via INC-1** and non-downgradable — the present-leaning proxy does **not** move R1.

## 2. JNY-B2 → BM-6 (contract MC-5)

| Item | Class | Applicable rule (frozen) | Raw signal (from source) | Rule held? | Evidence status |
| --- | --- | --- | --- | --- | --- |
| `OBS-JNY-B2#RETRO-BM6` (`../baseline-batch/08_…` R1) | 3 `[dogfooding]` RETRO | **MC-5 v1.0** DIRECTIONAL SHAPE-ONLY (may show adherence-collapse *shape*; **no prevalence/demand/market**) | Monthly mix: grind-heavy onboarding (Oct 90 learn / 14 review), Dec–Jan zero-activity lapse, Mar review-heavy comeback (23), relapse; **266/271 (98%) overdue** as of 2026-07-12. Adherence-collapse *shape* `present`-leaning. | ✅ SHAPE-ONLY held: **no prevalence claim**; EX3/BX-3 enforced; R5 High untouched. | `PROXY-DIRECTIONAL-PRESENT` (failure *shape* only, n=1, retrospective). |
| `OPLOG-JNY-B2#BM6` (`../baseline-batch/08_…` R2) | 6 `[operational-log]` | **MC-5 v1.0** (context) | Request log (from 2026-03-24) corroborates sustained learning-loop usage but post-dates the sharpest grind-vs-review swings. | ✅ Reported as context, `inconclusive` on its own (source's own reading). | `INCONCLUSIVE` (context only; **admissibility PASS**, `02_…` PLA-1). |
| Adherence **prevalence** (MC-5 CLASS-7 half; MC-10 demand) | 7 (n/a) | **MC-5 v1.0** CLASS-7-DEFERRED | No class-7 real-user/market/adherence evidence exists. | ✅ No verdict authorized. | `CLASS-7-ABSENT` (INC-5). |

**Adjudication note (H-B2).** The failure *shape* is present at n=1; **prevalence is CLASS-7-ABSENT (INC-5)** and R5 (High) is non-downgradable regardless of the shape reading. The `OBS`/`OPLOG` records draw **no** market/demand/preference/prevalence claim (the wall most at risk here).

## 3. JNY-F1 → BM-1 / BM-7 (contract MC-2)

| Item | Class | Applicable rule (frozen) | Raw signal (from source) | Rule held? | Evidence status |
| --- | --- | --- | --- | --- | --- |
| `OBS-JNY-F1#…` + `OPLOG-JNY-F1#…` (`../failure-batch/02_…`) | 3 RETRO + 6 | **MC-2 v1.0** DIRECTIONAL (novel-instance transfer probe) | Retrospective aggregates present, but **no transfer probe** administered → schema transfer **not isolable** from surface recall; 2 isolated AI reviews unanimous `insufficient-evidence`. | ✅ Rule held: with no novel-instance probe the rule authorizes **no transfer verdict** (it does not manufacture one). | `INSUFFICIENT-EVIDENCE` → carried `incomplete`. Transfer claim `UNRESOLVED` (INC-1); **admissibility PASS**, `02_…` PLA-1. |
| BM-7 expertise-reversal slice | — | **MC-2 v1.0** (BM-7 **INCOMPLETE** by contract) | n=1 cannot un-know a pattern → boundary **not exercisable** (G2.1). | ✅ Contract authorizes **no boundary verdict**. | `INCOMPLETE` (cap-bound, G2.1, EX5). |

## 4. JNY-F2 → BM-4 / BM-3 (contract MC-3)

| Item | Class | Applicable rule (frozen) | Raw signal (from source) | Rule held? | Evidence status |
| --- | --- | --- | --- | --- | --- |
| `OBS-JNY-F2#…` + `OPLOG-JNY-F2#…` (`../failure-batch/04_…`) | 3 RETRO + 6 | **MC-3 v1.0** BM-4 DIRECTIONAL (decay observed on illustrative timeline) | Decay/relapse *shape* `present`-leaning but **pooled across chunks**, not a single-pattern decay curve; low avg consecutive-failures cuts against naive relapse; 2 isolated AI reviews unanimous `insufficient-evidence`. | ✅ Rule held: illustrative direction only, **no measured decay curve** (G1.1). | `INSUFFICIENT-EVIDENCE` → carried `incomplete`. Decay claim `UNRESOLVED` (INC-1); **admissibility PASS**, `02_…` PLA-1. |
| BM-3 hierarchical schedule optimum | — | **MC-3 v1.0** COLLECTION-GAP (invents no interval rule) | Optimum **not computable** from aggregates (G1.2). | ✅ **No interval/schedule rule invented** (`OC-5`). | `INCOMPLETE` (cap-bound, G1.2, COLLECTION-GAP, EX5). |

## 5. JNY-F3 → BM-5 (contract MC-4) — the over-validation finding

**Bound (not re-run) from `../autoeval-batch/` (NEU-903), + class-4 review layer `../failure-batch/07_…` (NEU-905).**

| Item | Class | Applicable rule (frozen) | Raw signal (from source) | Rule held? | Evidence status |
| --- | --- | --- | --- | --- | --- |
| `RUN-1/2/3` × `ACS-1 v1.0` (`../autoeval-batch/03_…`) | 5 `[automated-eval]` | **MC-4 v1.0** BOUNDING (*any over-validation on adversarial items ⇒ FM4 present for those items*) + `MODEL-VERSION-BOUND` | 3 INCOMPLETE cases (`-03/-07/-11`, oracle NOT-pass) graded `q=3` PASS, **stable 3/3** across isolated repeats ⇒ over-validation PRESENT for those items; 6 SHALLOW/WRONG correctly FAILED; 3 CONTROLs PASS (oracle-valid). | ✅ **Rule fired exactly as frozen** on valid adversarial items. Not intermittent `GRADER-VAR` (stable). | `PROXY-BOUNDING-PRESENT` — over-validation **bounded and stable** on the **INCOMPLETE** archetype, this grader model/version **only**. |
| `AIR-JNY-F3/R1`,`/R2` (`../failure-batch/07_…`) | 4 `[ai-critique]` | **MC-4 v1.0** (review of the bound evidence vs H-F3) | 2 isolated reviewers (opus + sonnet) **unanimous `contradicts` of H-F3 as literally worded** — "shallow/wrong over-validated" is **not** matched; the FM4 phenomenon lands on the milder INCOMPLETE archetype. | ✅ Review verdict recorded raw, not smoothed. | `PROXY-BOUNDING-PRESENT` (FM4 real, on the adjacent archetype). |

**Adjudication of the H-F3 bifurcation (the notable verdict).** Two things are true and must be kept separate:
1. **FM4 / BM-5 (the failure mode):** under the frozen **MC-4 v1.0 BOUNDING** rule, the INCOMPLETE cases are valid adversarial items over-validated stably 3/3 ⇒ **FM4 is present (bounded)** for that archetype. This is a **real, rule-compliant finding** — it **reinforces** R3, never downgrades it.
2. **H-F3 as literally worded** ("over-validates a deliberately **shallow or wrong** DP answer"): **`contradicted`** — the shallow/wrong items were correctly failed.

**Consequences under the frozen decision rule:**
- The over-validation finding establishes **bounded presence for the probed items under the recorded grader model/version — NOT a rate, NOT DP-domain grading reliability** (G5.1). The three flags do **not** establish an over-validation *rate* (asserting one would be an `OC-5` invented-metric violation).
- **R3 (High) and BM-5/FM4 reliability stay `UNRESOLVED` via `INC-3`, non-downgradable.** RA5 is **reaffirmed**: AI grading is not the signal of record.
- **MC-4 did not prove invalid** (it did precisely what it was frozen to do) → **no `NON-ADJUDICABLE-FOR-CHANGED-RULE`, no v2.0, no rerun** required by this task.
- **Reformulation flag (routed, not enacted):** H-F3's wording ("shallow or wrong") is narrower than where FM4 empirically lands ("correct-core-but-omitted-rigor / INCOMPLETE"). NEU-906 **records** that H-F3 warrants reformulation/splitting to name the INCOMPLETE archetype, and **routes** it to NEU-907 (final package). This task does **not** rewrite the hypothesis or model text (out of scope).

## 6. Contracts with no executed evidence this stage (adjudicated as holes, not values)

| Contract | Governs | Applicable rule (frozen) | Evidence status | Marker |
| --- | --- | --- | --- | --- |
| MC-7 `averageQuality` | CAND-15, P4, R6 | COLLECTION-GAP (forbids presenting stubbed `0` as a signal) | `COLLECTION-GAP` — `learner-context-workflows.ts` L170 hardcodes `averageQuality: 0` (class-2 code fact); not aggregated. | INC-2 |
| MC-8 `time_spent_ms` | CAND-18, R6 | COLLECTION-GAP on reliability (supporting proxy only until `PLA-3`) | `COLLECTION-GAP` — value persisted, real-usage reliability uncharacterized; needs aggregate `PLA-3` study (not run). | INC-2 (via PLA-3) |
| MC-10 demand | R4 (High), D1, RA6 | CLASS-7-DEFERRED (no verdict) | `CLASS-7-ABSENT` — an empty niche is not demand evidence; no class-7 source exists. | INC-5 |
| MC-11 settled | DEC1–5, P3/P5/P6, EX1–6, BX1–5, RA1–6, D4/R8 | NON-MEASURED-SETTLED (audit, no metric) | `NON-MEASURED-SETTLED` — pass the mapping gate as settled; verified by audit (`05_…`) + privacy gate (`02_…`). | — |

## 7. Item-level reconciliation summary

- **Executed evidence items adjudicated:** BM-8 (class-2); BM-2 (`OBS`+`OPLOG`); BM-6 (`OBS`+`OPLOG`); F1 (`OBS`+`OPLOG`); F2 (`OBS`+`OPLOG`); F3 (`RUN-1/2/3` class-5 + 2× class-4 review). **Zero executed items left unadjudicated.**
- **Frozen rules exercised:** MC-1, MC-2, MC-3, MC-4, MC-5, MC-6 — **all held at v1.0**; MC-7/8/9/10/11 not exercised by a run (holes/settled, adjudicated as such).
- **No metric/threshold/rate invented; no v1.0 result rescored; every High risk (R1–R5) retains its severity floor.**
