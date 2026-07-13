# Targeted In-Charter Experiments — Inventory, Ranking, Vehicle Selection & Cap Application

- **Program:** C005 (AI-backed dynamic-programming course) · **Umbrella:** NEU-888 (OUT-6) · **Task:** NEU-924 (run the targeted in-charter experiments for materially inconclusive decisions)
- **Depends on:** the ten decision records `../decision-records/DR-M01…DR-M10`, the operational mastery model `../mastery-model/00_operational-mastery-model.md` (MM-T1…MM-T15), the reconciliation register `../reconciliation/00_conflict-register.md` (live facts L1–L12, verdicts), the ledger `../adjudication/01_instructional-decision-ledger.md`, the framework `../framework/00_durable-vs-speed-framework.md`, and NEU-887's vehicle/protocol machinery (`../../C005-product-foundation/benchmark-suite/`, `../../C005-product-foundation/automated-evaluation/`).
- **Compiled:** 2026-07-13 · **Status: provisional. Settles nothing. Flips nothing to `settled`/`accepted`. Modifies no source file. Resolves no conflict.**
- **Live-code baseline for every executed experiment:** commit `bc77bc6` (develop head at execution time).

---

## 1. What this is — and is not

**Is.** The single inventory that (a) determines, from the DR residual-uncertainty fields, the MM-T uncertainty bands, and the reconciliation verdicts, **which decisions/thresholds remain materially inconclusive**; (b) ranks those by linked charter-risk severity; (c) selects the **smallest sufficient NEU-887 vehicle** per contested decision; (d) applies the **six-item non-deferrable-vehicle cap** and the **creator-unavailability deferral rule**; and (e) indexes the executed experiment records (`01_…`–`06_…`) and the deferral register (`07_…`).

**Is not.** It runs no experiment on a decision the evidence already settles at its contested point; it flips no ledger status; it invents no MM-T value; it presents no class-1–6 result as external-user/expert/market validation (only class-7 could be, and class-7 is absent project-wide); it implements no scheduler/MCP change (experiment fixtures are throwaway evidence artifacts, never product code).

## 2. Materiality rule applied

A decision or threshold is **materially inconclusive** here iff all three hold:

1. **A named residual uncertainty exists** in its own record (DR field 6, an MM-T uncertainty band, or a reconciliation GAP/CONFLICT verdict) — not merely the blanket "nothing is settled" firewall, which is true of every row by construction.
2. **The uncertainty is charter-risk-linked** — it sits on a Critical/High risk axis (R1 transfer; silent adoption of contradicted coded behavior; prose-only learning-critical control; collapsed durable-vs-speed tension) or a register conflict C1–C6.
3. **An NEU-887 vehicle could reduce it** — some vehicle (MCP workflow, paper/WoZ, creator dogfooding, AI review, automated-eval) produces correctly-classed evidence that narrows the uncertainty. Uncertainties reducible **only** by class-7/production evidence are recorded as inconclusive-but-untestable-in-charter and are **not** experiment candidates (no vehicle is sufficient).

**Settled points get no experiment.** No decision in this package is `settled` (firewall), but several *contested points* are already carried on adequate evidence and were not re-tested: M01's prerequisite-first *ordering* (reconciliation verdict **ALIGNMENT**, causal literature F-M01-1/2 uncontested); M07's bounded-struggle *shape* (verdict **ALIGNMENT**, live L8/L9 match); M05's *axis choice* = category (decided on causal findings F-M05-1/2/3 — the open residual is the UNVERIFIED blocking-first ordering, a different point); MM-T3's q ≥ 3 floor (verdict **ALIGNMENT**, class-2 basis stated). Experimenting on these would over-test settled evidence (acceptance scenario 3).

## 3. Materiality inventory

### 3.1 Mechanism decisions (from DR field 6 + reconciliation §5)

| Decision | Residual uncertainty (own record) | Charter-risk link | Reducible in-charter? | Materially inconclusive? |
| --- | --- | --- | --- | --- |
| **M01 sequencing** | DP-ordering-vs-transfer unmeasured (INC-I1); demonstrated-competence threshold unmeasured | R1 (High) | Only by dogfooding/in-domain measurement | Yes → **defer (dogfooding)** |
| **M02 worked examples** | DP far-transfer unmeasured (INC-I1); pooled magnitude UNVERIFIED (G4); fade calibration (MM-T10) | R1 (High); G4 evidence-quality | Transfer/fade calibration: dogfooding only. G4: primary re-fetch (out of caps, not a vehicle) | Yes → **defer (dogfooding)** |
| **M03 retrieval** | Enforceability of the massed-exclusion control at the live review-aggregation path (C2 verdict GAP was a static read; aggregation is orchestration+DB-coupled) + DP transfer (INC-I1) | **C2 HIGH · LC** (prose-only-control risk); R1 | Control enforceability: **AI review** now. Transfer: dogfooding | **Yes → EXP-01 (AI review)** |
| **M04 spacing** | Whether the live counter actually advances multiple times same-session (verdict GAP rests on a static read; two audit claims in this corpus were already found stale on live re-verification) + S/K calibration (MM-T1/T2) + DP transfer | **C2 HIGH · LC** (silent-adoption/stale-claim risk); R1 | Live behavior: **automated-eval** now. Calibration/transfer: dogfooding | **Yes → EXP-02 (automated-eval)** |
| **M05 interleaving** | Blocking-first-for-novices ordering UNVERIFIED (F-M05-2); creator-walkthrough revision trigger inherited from framework §6; whether the live difficulty-axis knob actively conflicts with category-axis staging | C5 MEDIUM; collapsed durable-vs-speed risk (staged resolution rests on unverified ordering) | Ordering: dogfooding only. Axis-conflict characterization: AI review possible | Yes → ordering **defers (dogfooding)**; axis question is the 7th-ranked non-deferrable item → **defers (cap overflow)** |
| **M06 feedback** | Soundness/enforceability of the correct-answer-exposure outcome gate + constrained payload at the terminal-failure path (C6 GAP static read); AI diagnostic reliability on DP-specific errors; exposure-timing sub-dial latent | **C6 MEDIUM-HIGH · LC** (prose-only-control risk) | Gate design + absence check: **AI review** now. DP diagnostic reliability: in-domain only | **Yes → EXP-06 (AI review)** |
| **M07 productive struggle** | Accomplishable-band boundary for DP unmeasured; attempt count "2" not evidence-derived (G6) | R1 (High); G6 | In-domain measurement only | Yes → **defer (dogfooding)** |
| **M08 assessment** | Whether the DR-M08 control is mechanically realizable — a deterministic mapper that is rebuttal-invariant (MM-T6), never binary-collapses, and fails closed (the control exists only as record prose until demonstrated); DP grading fidelity; G7 magnitudes | **C4 HIGH · LC · non-downgradable** (prose-only-control + R3) | Mapper realizability: **automated-eval** now. DP fidelity: in-domain. G7: primary re-fetch | **Yes → EXP-03 (automated-eval)** |
| **M09 remediation** | Live lapse full-reset breadth (does ANY prior depth escape the reset? verdict CONFLICT was a static read); leech lifetime-floor correction (L3) unexercised dynamically; savings-floor coefficient (MM-T14 band); DP applicability | **C3 HIGH · LC · non-downgradable** (silent-adoption risk) | Live behavior: **automated-eval** now. Coefficient/DP: dogfooding | **Yes → EXP-04 (automated-eval)** |
| **M10 progression** | Whether the live gate is fail-open under a single-success prerequisite **dynamically** (C1 verdict = GAP after the audit's `repetitions>0` claim was found STALE — the one row where a static claim already failed once); durability-bar value (MM-T8 band); DP calibration | **C1 HIGH · LC · non-downgradable** (R1-adjacent; silent-adoption/stale-claim risk) | Live gate behavior: **automated-eval** now. Bar value: dogfooding/production | **Yes → EXP-05 (automated-eval)** |

### 3.2 Framework / tension resolutions (OUT-3)

| Element | Residual | Vehicle | Disposition |
| --- | --- | --- | --- |
| Durable-vs-speed framework + M05 walkthrough | Blocking-first ordering UNVERIFIED; walkthrough provisional **pending creator walkthrough** (its own primary revision trigger, Assumption #10) | Creator dogfooding (named by the artifact itself) | **Defer (dogfooding)** |
| Staged/measured resolutions in DR-M02/03/04/07/09/10 | Each rests on INC-I1 (DP transfer of the dual-goal evidence) | In-domain measurement | **Defer (dogfooding)** — no smaller vehicle reduces a transfer claim |

### 3.3 Mastery-model thresholds (from MM-T bands + reconciliation §6)

| MM-T | Band / verdict | Materially inconclusive point | Disposition |
| --- | --- | --- | --- |
| MM-T1 (K), MM-T2 (S) | medium bands; G6 "no evidence for an exact number" | value calibration | **Defer (dogfooding/production)** — revision signal named in the model |
| MM-T4/T5 (agreement/over-validation) | T5 medium band + G7 | in-domain rates | Defer (in-domain); the **control shape** they gate is tested by EXP-03 |
| MM-T6 (rebuttal-invariance) | binary invariant, untested | is the invariant mechanically satisfiable? | **Tested inside EXP-03** (oracle case class) |
| MM-T8 (durability bar) | narrow band, but C1 GAP/CONFLICT verdict | live gate vs bar shape | **Tested inside EXP-05** (gate fail-open proof); bar *value* defers (dogfooding) |
| MM-T10…T13 | medium bands | value calibration | **Defer (dogfooding/production)** |
| MM-T14 (savings floor) | medium band; CONFLICT verdict | live violation breadth | **Tested inside EXP-04**; coefficient defers |
| MM-T15 (speed criterion) | **widest band (1.25–2×)**, G5, class-7 absent | contest-outcome data | **Inconclusive-but-untestable in-charter** — only class-7 reduces it; no vehicle sufficient; ships provisional (already so marked) |

## 4. Ranking (charter-risk severity, then decision order)

Severity tiers: **HIGH · non-downgradable · learning-critical** (C1, C2, C3, C4 — these carry the R1-adjacent, silent-adoption, and prose-only-control risk axes) → **MEDIUM-HIGH** (C6) → **MEDIUM** (C5). Within a tier, decision order in the cluster sub-tasks (NEU-918: M01, M02 · NEU-919: M03, M04, M05 · NEU-920: M06, M07, M09 · NEU-921: M08, M10).

**R1 (transfer) ranks first of all** — but its smallest sufficient vehicle for every mechanism is creator dogfooding / in-domain measurement (a transfer claim cannot be reduced by AI review or a deterministic oracle), so it heads the **deferral** list, not the execution list (see `07_…` §1).

Ranked non-deferrable-vehicle candidates:

| Rank | Decision | Conflict / severity | Smallest sufficient vehicle | In cap? |
| --- | --- | --- | --- | --- |
| 1 | **M03 retrieval** | C2 · HIGH · LC | AI review (control enforceability at the orchestration aggregation path — DB-coupled, not oracle-reducible in-session) | ✔ **EXP-01** |
| 2 | **M04 spacing** | C2 · HIGH · LC | Automated-eval (live `calculateNextReview` same-day advance — deterministic, oracle-reducible) | ✔ **EXP-02** |
| 3 | **M08 assessment** | C4 · HIGH · LC | Automated-eval (deterministic-mapper realizability fixture — oracle-reducible) | ✔ **EXP-03** |
| 4 | **M09 remediation** | C3 · HIGH · LC | Automated-eval (live lapse grid + leech floor — deterministic) | ✔ **EXP-04** |
| 5 | **M10 progression** | C1 · HIGH · LC | Automated-eval (live gate fail-open under single success — deterministic) | ✔ **EXP-05** |
| 6 | **M06 feedback** | C6 · MEDIUM-HIGH · LC | AI review (outcome-gate design soundness at the terminal-failure path) | ✔ **EXP-06** |
| 7 | **M05 interleaving** (axis-conflict characterization) | C5 · MEDIUM | AI review | ✘ **cap overflow → defer** |

**Cap check:** exactly **six** non-deferrable-vehicle executions run in-session (4 automated-eval + 2 AI review). The 7th-ranked candidate (M05) defers under the same defer-and-mark-provisional discipline as an unavailable-creator dogfooding vehicle (`07_…` §2). No MCP-workflow or paper/WoZ vehicle was the smallest sufficient for any in-cap item (the contested points are either deterministic code behavior — automated-eval is smaller and higher-precision — or design-soundness questions — AI review is smaller); this is recorded per experiment.

## 5. Executed experiment index

| Experiment | Decision · conflict | Vehicle (class) | Record | Result (one line — full record in file) |
| --- | --- | --- | --- | --- |
| **EXP-01** | M03 · C2 | AI review (class 4) | `01_EXP-01_retrieval-massed-exclusion-ai-review.md` | 2/2 independent verdicts **supports** (control enforceable at the named path; GAP confirmed) |
| **EXP-02** | M04 · C2 | Automated-eval (class 5) | `02_EXP-02_spacing-intersession-autoeval.md` | Oracle met 6/6 ×2 runs: same-day successive successes each advance `repetitions`; no inter-session gate — GAP dynamically confirmed |
| **EXP-03** | M08 · C4 | Automated-eval (class 5) | `03_EXP-03_assessment-mapper-autoeval.md` | Oracle met 12/12 ×2 runs: deterministic mapper satisfying MM-T6 rebuttal-invariance, no-binary-collapse, fail-closed is mechanically realizable — control not prose-only |
| **EXP-04** | M09 · C3 | Automated-eval (class 5) | `04_EXP-04_lapse-savings-autoeval.md` | Oracle met 9/9 ×2 runs: full reset at every prior depth (MM-T14 floor violated 6/6 applicable); leech lifetime floor live (L3 confirmed) — CONFLICT dynamically confirmed |
| **EXP-05** | M10 · C1 | Automated-eval (class 5) | `05_EXP-05_progression-gate-autoeval.md` | Oracle met 7/7 ×2 runs: single-success fresh prerequisite passes (R=1.0, fail-open); reteach fires only at R<0.5, far below MM-T8 bar — GAP dynamically confirmed, stale-audit correction (L4) re-verified |
| **EXP-06** | M06 · C6 | AI review (class 4) | `06_EXP-06_feedback-outcome-gate-ai-review.md` | 2/2 independent verdicts **supports** (gate absence confirmed live; DR-M06 control implementable at the named path) |

Every result is labeled with its evidence class; **no result is presented as external-user/expert/market validation** (classes 4/5 structurally cannot be — only class 7 could, and it does not exist). No raw operational-log payload was read or exported (no experiment touched class-6 sources at all). **No status flips:** every affected decision remains `provisional`; every conflict remains `unresolved` (C1–C4 non-downgradable); an experiment attaches evidence, it does not adjudicate (NEU-925 drives the ledger).

## 6. Deferral register pointer

`07_deferral-register.md` carries: §1 the **ships-without-dogfooding-evidence** list (every decision whose smallest sufficient vehicle is creator dogfooding — creator unavailable this run, charter Assumption #10), §2 the **cap-overflow** deferral (M05 axis-conflict characterization), §3 the **untestable-in-charter** row (MM-T15), each marked provisional with an explicit revision trigger.

## 7. §SELF-CHECK-924 (inventory-level)

- **Only materially inconclusive points tested.** Each in-cap experiment cites the DR/MM-T/RECON residual it reduces (§3); the four ALIGNMENT/settled-point rows (§2) got none. **PASS.**
- **Cap honored.** Six non-deferrable-vehicle executions; 7th-ranked deferred symmetric to dogfooding deferral. **PASS.**
- **Smallest sufficient vehicle.** Per-experiment vehicle rationale recorded (each record §1); no prototype used (suite count stays 0). **PASS.**
- **Protocols.** AI reviews: ≥2 separately-initialized reviewers, verdicts committed pre-exposure, AIR-* conditions recorded. Automated-evals: versioned frozen cases, explicit oracle, ENV + CCR evidence, ≥2 isolated repeats. **PASS** (per-record attestations).
- **Evidence discipline.** All results class-4/5, labeled; no laundering; no raw log payloads; nothing flipped to `settled`. **PASS.**
