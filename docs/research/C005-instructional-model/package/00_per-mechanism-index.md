# Per-Mechanism Unified Index — one-hop recovery across the whole package

- **Program:** C005 (AI-backed dynamic-programming course) · **Umbrella:** NEU-888 (OUT-7) · **Task:** NEU-925 (assemble the adjudicated, prompt-ready package)
- **Compiled:** 2026-07-13 · **Status: provisional. Assembly + adjudication only — authors no new mechanism decision, threshold, verdict, or experiment.**
- **Binds:** the ten decision records (`../decision-records/DR-M01…DR-M10`), the synthesis + mechanism evidence (`../README.md`, `../mechanisms/`, `../03_synthesis.md`), the durable-vs-speed framework (`../framework/00_…`), the operational mastery model (`../mastery-model/00_…`, MM-T1…MM-T15, Gates A–E), the reconciliation register (`../reconciliation/00_…`, live facts L1–L12), the experiment package (`../experiments/00…07`, F-EXP-01…06, deferrals D-1…D-6 / O-1,O-2 / U-1), and the single adjudication ledger (`../adjudication/01_…`).

---

## Why this file exists

A mechanism's decision lives in a cluster record, its reconciliation in the conflict register, its integrated mastery signal in the mastery model, and its experiment evidence in the experiment sub-task — **four different outputs**. This index is the **one-hop recovery layer**: for each of the ten mechanisms it recovers, in a single table, its **evidence + class · observable behavior · mastery signal · reconciliation verdict · uncertainty · rejected alternative · experiment evidence**, plus whether the decision is **binding-or-open** (its adjudication status). A cold-context downstream chapter agent (curriculum, content/assessment, tutoring, interaction-design) reads one row block per mechanism and needs no other file to orient.

**How to read a status.** Every mechanism *decision* is **`provisional`** — it rests on class-1/2 evidence in a domain (dynamic programming) where its effect is **unmeasured** (`INC-I1`), and **no class-7 (external-user) evidence exists project-wide**, so the inherited firewall forbids `settled`/`accepted`. "Binding vs open" therefore does **not** mean "settled vs unsettled": it means **the observable behavior + enforceable control are fixed and may be built against** (binding shape), while **the calibrated value and the DP-effectiveness claim stay open** (`LINK-I2` / `INC-I1`). A conflict marked `unresolved` is a real, live divergence whose *fix* is deferred to an implementation charter — not an unknown.

**Legend.** LC = learning-critical (mis-control silently corrupts or gates on a corrupted mastery signal). V = reconciliation verdict against live code (ALIGNMENT / GAP / CONFLICT). `→ LINK-I2` = calibrated value owned by the mastery model (`../mastery-model/00_…` §5). `INC-I1` = DP-transfer unmeasured (controlling, non-downgradable).

---

## Recovery matrix (the whole package in one screen)

| M | Mechanism | LC | Decision status | Recon V (conflict) | Experiment evidence |
| --- | --- | --- | --- | --- | --- |
| M01 | Sequencing | no | provisional | **ALIGNMENT** (—) | deferred → D-2 (dogfooding) |
| M02 | Worked examples | no | provisional | **GAP** (—) | deferred → D-3 (dogfooding) |
| M03 | Retrieval | **yes** | provisional | **GAP** (C2) | **F-EXP-01** AI review 2/2 `supports` |
| M04 | Spacing | **yes** | provisional | **GAP** (C2) | **F-EXP-02** auto-eval 6/6 ×2 |
| M05 | Interleaving | no | provisional | **CONFLICT** (C5) | deferred → O-1 (cap), D-4 (dogfooding) |
| M06 | Feedback | **yes** | provisional | **GAP** (C6) | **F-EXP-06** AI review 2/2 `supports` |
| M07 | Productive struggle | no | provisional | **ALIGNMENT** (—) | deferred → D-5 (dogfooding) |
| M08 | Assessment | **yes** | provisional | **CONFLICT** (C4) | **F-EXP-03** auto-eval 12/12 ×2 |
| M09 | Remediation | **yes** | provisional | **CONFLICT** lapse (C3) + **GAP** leech | **F-EXP-04** auto-eval 9/9 ×2; O-2 (cap) |
| M10 | Progression | **yes** | provisional | **GAP** (C1) | **F-EXP-05** auto-eval 7/7 ×2 |

Every mechanism below expands this row into the full seven-axis one-hop view.

---

## M01 — Sequencing  ·  `provisional`  ·  not learning-critical

| Axis | One-hop recovery | Source |
| --- | --- | --- |
| **Evidence + class** | Prerequisite-first ordering manages **intrinsic** load (F-M01-1 [c1, CLT]); mastery traditions sequence on *demonstrated* competence (F-M01-2 [c1, framework/quasi-exp]); deployed systems micro-interleave prereq review (F-M01-4 [c1, practitioner, directional]); difficulty-ramp is **not** the evidenced construct (F-M01-3 [c1, absence]); engine already encodes prereq edges + stale-prereq re-injection (F-M01-5 [c2, compatibility]). | `../mechanisms/M01_…`, `DR-M01` |
| **Observable behavior** | Prerequisite taught before dependent; stale prereq (R<0.5) re-surfaced before its dependent; **advance on demonstrated competence, never on exposure / `repetitions>0`**. No monotone easy→hard ramp; no position on interleaving axis (C5). | `DR-M01` §Decision |
| **Mastery signal** | Learner correctly derives/applies the dependent given only the prerequisite scaffold — **≥1 unaided correct application** (MM-T9). Value `→ LINK-I2` (jointly bounded with M10). | `DR-M01` §Mastery; MM-T9 |
| **Reconciliation verdict** | **ALIGNMENT (caveat).** Prereq-first ordering is coded; stale prereqs inserted before dependents (L4). "Demonstration" quality inherits the C4 grade-fidelity + C1 unlock-strength gaps (recorded at M08/M10, not double-counted). | recon §5 M01 |
| **Uncertainty** | `INC-I1` — no source measures a specific DP concept order against DP transfer; demonstrated-competence *threshold* unmeasured for DP. Provisional-on **G1**. | `DR-M01` §Uncertainty |
| **Rejected alternative** | Exposure-based advancement (`repetitions>0`) — rejected (F-M01-2; C1 stale-gate). Difficulty-ramp-as-ordering — rejected (F-M01-3, pre-empts C5). | `DR-M01` §Rejected |
| **Experiment evidence** | **None executed.** Deferred → **D-2** (DP-ordering-vs-transfer + demonstrated-competence threshold; dogfooding vehicle, creator unavailable). Ships provisional; revision trigger = in-domain DP-ordering measurement / MM-T8/T9 calibration. | deferral §1 D-2 |

**Durable-vs-speed:** immateriality-certified (trigger T2 fails; the only defensible reading has the gradients *aligned* — durable prereq schema is the precondition for durable-then-fast). Latent tradeoff recorded as gap, not fabricated. **Binding shape / open value.**

---

## M02 — Worked examples  ·  `provisional`  ·  not learning-critical

| Axis | One-hop recovery | Source |
| --- | --- | --- |
| **Evidence + class** | Worked-example effect for novices (F-M02-1 [c1, causal]); **expertise reversal** — worked examples turn negative for the knowledgeable (F-M02-3 [c1, causal]); adaptive > fixed fading > unaided (F-M02-4 [c1, causal]); positive direction, magnitude **UNVERIFIED/G4** (F-M02-2 [c1, meta-analytic]); engine has tiering but **no** expertise-keyed fade (F-M02-5 [c2, compatibility]). | `../mechanisms/M02_…`, `DR-M02` |
| **Observable behavior** | Novices enter with full worked derivations; scaffolding **monotonically faded as a per-learner expertise signal rises**; no full worked examples past the fade band (expertise-reversal guard). Adaptive (signal-weighted), not a fixed calendar. | `DR-M02` §Decision |
| **Mastery signal** | Learner solves target-type DP problems **unaided** at the expertise band. Expertise proxy + fade thresholds `→ LINK-I2` (MM-T10: fade at unaided-success ≥0.67, 2-of-3). | `DR-M02` §Mastery; MM-T10 |
| **Reconciliation verdict** | **GAP.** Retrievability-tiered scaffolding + `reteachCompression` (L9) is adaptive-by-retrievability, but not an explicit worked-example fade keyed to an unaided-success expertise proxy. Not LC → no control required. | recon §5 M02 |
| **Uncertainty** | `INC-I1` — worked-example transfer measured within-topic, not DP far transfer; "expertise" unmeasured for DP sub-skills. Provisional-on **G4** (magnitude) + **G1**. | `DR-M02` §Uncertainty |
| **Rejected alternative** | Fixed full worked examples throughout — rejected (F-M02-3 expertise reversal). Fixed non-adaptive fade schedule — rejected (F-M02-4). | `DR-M02` §Rejected |
| **Experiment evidence** | **None executed.** Deferred → **D-3** (fade calibration + expertise proxy MM-T10; dogfooding). Ships provisional; revision trigger = DP fading measurement / expertise-signal calibration. G4 magnitude re-fetch is out-of-caps, not a vehicle. | deferral §1 D-3 |

**Durable-vs-speed:** material → **measured** resolution (fade weighted by continuous per-learner expertise signal; more support = immediate performance, fading = durable schema). Calibrated fade `→ LINK-I2`. **Binding shape / open value.**

---

## M03 — Retrieval practice  ·  `provisional`  ·  **learning-critical (C2)**

| Axis | One-hop recovery | Source |
| --- | --- | --- |
| **Evidence + class** | Retrieval/practice-testing top-tier (F-M03-1 [c1, causal]); **errorful retrieval still helps** (F-M03-2 [c1, causal]); the *attempt* carries the benefit — test-no-feedback 78% vs restudy 57% (F-M03-3 [c1, causal]); gain largest at low strength *if the attempt succeeds* (F-M03-4 [c1, mechanistic]); spaced 68% vs same-session massed 26% (F-M04-2 [c1, causal] — basis for C2 exclusion); engine retrieval-centric, 2-attempt-with-hint, no post-2nd-fail answer (F-M03-5 [c2, compatibility]). | `../mechanisms/M03_…`, `DR-M03` |
| **Observable behavior** | Production from memory before any answer shown; a real hint-scaffolded 2nd attempt before failure is recorded; **the mastery signal is derived only from retrieval events that are not same-session massed repeats** — roadblock re-recalls recorded for pedagogy but **flagged + excluded** from the aggregate. | `DR-M03` §Decision |
| **Mastery signal** | Unaided production at criterion **on a non-massed retrieval event**, ≥1 occasion. Count/quality `→ LINK-I2` (MM-T1 K=3 non-massed; MM-T3 q≥3). | `DR-M03` §Mastery |
| **Reconciliation verdict** | **GAP (C2, LC).** Per-chunk quality is aggregated across in-session questions with **no** flag/exclusion of same-session massed retrievals (L8). Target: aggregate counts only non-massed retrievals; **control = DR-M03 massed-exclusion invariant + CI test.** Not adopted by default. | recon §5 M03, §7 C2 |
| **Uncertainty** | `INC-I1` — retrieval established on facts/well-structured items; far transfer to novel DP problem-solving unmeasured. Provisional-on **G1**; correct-answer-exposure dependency provisional-on M06 (C6). | `DR-M03` §Uncertainty |
| **Rejected alternative** | Recognition/MCQ drills that guarantee success — rejected (F-DD-2, F-M03-2/4). Counting same-session massed re-recalls as independent mastery evidence — rejected (F-M04-2; this is the C2 failure mode the control prevents). | `DR-M03` §Rejected |
| **Experiment evidence** | **F-EXP-01** (AI review, class 4): **2/2 independent verdicts `supports`** — massed-exclusion control **needed** (live aggregate counts same-session re-recalls, zero exclusion) and **implementable** (enforcement point identified, data in scope). | `../experiments/01_…`, §EXP |

**Enforceable control (required):** failure mode C2; every mastery-contributing retrieval carries `session_id` + deterministic `is_same_session_repeat`; a held-out invariant **fails closed** if a `same_session_repeat=true` event contributes to the aggregate; enforcement = mastery-signal aggregation path (runtime invariant + CI fixture). Exclusion is binary; the qualifying *count* `→ LINK-I2`. **Binding shape / open value.**

---

## M04 — Spacing (distributed practice)  ·  `provisional`  ·  **learning-critical (C2)**

| Axis | One-hop recovery | Source |
| --- | --- | --- |
| **Evidence + class** | Distributed practice top-tier on 317-experiment meta-analysis (F-M04-1 [c1, causal]); spaced 68% vs massed 26% (F-M04-2 [c1, causal]); successive relearning across *other spaced sessions* (F-M04-3 [c1, causal/definitional]); FSRS calibration superiority (F-M04-4 [c1/2, **observational** only]); roadblock gate requires same-session massed follow-ups (F-M04-6 [c2, compatibility]); modified-SM-2 no fuzz/per-item stability (F-M04-5 [c2, compatibility]). | `../mechanisms/M04_…`, `DR-M04` |
| **Observable behavior** | Item returns across **separated** sessions; a correct recall counts as spaced-criterion evidence **only when in a session separated from the prior counted recall**; spaced-criterion counter advances **≤ once per session** — a same-session burst does not satisfy it. Interval expands as a function of successful spaced recall (interval *math* = NEU-923). | `DR-M04` §Decision |
| **Mastery signal** | Correct recall at criterion **across ≥1 separated (spaced) session** — a successive-relearning trajectory. Spaced count/interval `→ LINK-I2` (MM-T1 K, MM-T2 S≥2). | `DR-M04` §Mastery |
| **Reconciliation verdict** | **GAP (C2, LC).** SM-2 increments `repetitions` on each completion; the 1-day floor implicitly blocks same-day re-due but there is **no explicit inter-session gate** asserting ≤once/session (L1/L12). Target: counter advances only across separated sessions; **control = DR-M04 inter-session gate + CI test.** | recon §5 M04, §7 C2 |
| **Uncertainty** | `INC-I1` — spacing robust for retention but unmeasured on DP transfer; retention-optimised spacing may not transfer. Provisional-on **G1** + **G6** (exact spaced count unsupported). | `DR-M04` §Uncertainty |
| **Rejected alternative** | Fixed same-session massed criterion (e.g. 3-in-a-sitting) as progression signal — rejected (F-M04-2/6, the C2 failure). Treating a same-session massed recovery as equivalent to a spaced recall — rejected (F-M04-3). | `DR-M04` §Rejected |
| **Experiment evidence** | **F-EXP-02** (automated-eval, class 5): **6/6 oracle ×2 runs** — live counter advances on every same-instant success; no session identity anywhere in the signal contract; **C2 GAP dynamically confirmed**. | `../experiments/02_…`, §EXP |

**Enforceable control (required):** failure mode C2; spaced-criterion counter advances **only if** current recall's `session_id` ≠ previous counted recall's `session_id` (deterministic inter-session invariant); held-out test asserts N same-session recalls fail the gate. Spaced count `→ LINK-I2`. C2 severity floor non-downgradable. **Binding shape / open value.**

---

## M05 — Interleaving  ·  `provisional`  ·  not learning-critical (C5 MEDIUM)

| Axis | One-hop recovery | Source |
| --- | --- | --- |
| **Evidence + class** | Interleaving delayed-test advantage d=1.34 (F-M05-1 [c1, causal, single study]); moderate overall g=0.42 (F-M05-2 [c1, meta-analytic]; low-achiever blocking-first caveat **UNVERIFIED**); evidenced axis is **category/problem-type, not difficulty** (F-M05-3 [c1, absence] — decisive for the axis); a desirable difficulty learners misjudge (F-M05-4 [c1, causal-directional]); no interleaving live, dead `interleaveStrategy:'easy-medium-hard'` names the wrong axis (F-M05-5 [c2, compatibility]). | `../mechanisms/M05_…`, `DR-M05` |
| **Observable behavior** | Interleaving on the **category/problem-type axis** (knapsack vs LIS vs interval DP), **not** difficulty-ordering; applied to **review of already-unlocked** material; **staged** — Stage 1 blocked acquisition per technique until a per-technique fluency signal fires, Stage 2 interleaved review of unlocked techniques. **Supersedes** the illustrative framework §6 walkthrough. | `DR-M05` §Decision |
| **Mastery signal** | On mixed-type review, learner **selects the correct DP technique** — discrimination accuracy. Discrimination + Stage-1→2 fluency gate `→ LINK-I2` (MM-T11, MM-T12). | `DR-M05` §Mastery |
| **Reconciliation verdict** | **CONFLICT (C5).** Live axis is difficulty (`easy-medium-hard`, L10); target is category. Not LC → no non-prose control mandated; the difficulty-axis config is **not adopted** as the interleaving model. | recon §5 M05, §7 C5 |
| **Uncertainty** | `INC-I1` — interleaving is the most transfer-relevant mechanism but unmeasured on DP problem-type discrimination; blocking-first-for-novices caveat **UNVERIFIED**; carries the creator-walkthrough revision trigger. Provisional-on **G1**. | `DR-M05` §Uncertainty |
| **Rejected alternative** | Difficulty-ordering ramp as the interleaving axis — rejected (F-M05-3; F-M05-5 dead config). Interleaving first-exposure material — rejected (F-DD-1/F-CL-2 working-memory risk). | `DR-M05` §Rejected |
| **Experiment evidence** | **None executed.** Two deferrals: **O-1** (axis-conflict characterization — is the difficulty knob actively conflicting or merely orthogonal? — AI review, **7th of 7, cap overflow**); **D-4** (blocking-first ordering / framework §6 walkthrough — creator walkthrough, dogfooding). Both ship provisional with revision triggers. | deferral §1 D-4, §2 O-1 |

**Durable-vs-speed:** material → **staged** (blocked acquisition → interleaved consolidation; readiness ordering + observable per-technique fluency gate). Gate value `→ LINK-I2`. **Binding shape / open value.**

---

## M06 — Feedback  ·  `provisional`  ·  **learning-critical (C6/F-M06-4)**

| Axis | One-hop recovery | Source |
| --- | --- | --- |
| **Evidence + class** | Correct-answer after an incorrect response has a very large retention effect, +494% direction-robust (F-M06-1 [c1, causal]); unreinforced errors resurface — hypercorrection (F-M06-2 [c1, causal]); *some* exposure, not a fixed increment (F-M06-3 [c1, causal]); **LLMs confirm correct solutions (F1 94–99%) but diagnose incorrect (4–55%) / valid-alternatives (0–76%) poorly** (F-M06-4 [c1, empirical] — the LC finding); system records 2nd failure and moves on, self-grading channel (F-M06-5 [c2, compatibility]). | `../mechanisms/M06_…`, `DR-M06` |
| **Observable behavior** | After the terminal failed attempt, emit a **correct-answer-exposure step before the chunk outcome is recorded**; feedback is a **structured payload separating verdict from correct-answer content**; a "pass/mastered" cannot be recorded on a path with ≥1 failed attempt without that exposure. Not reliant on free-form AI prose as the sole correctness channel. | `DR-M06` §Decision |
| **Mastery signal** | `→ LINK-I2`; shape fixed = corrected schema read on a **subsequent spaced** attempt (not same-session massed, per C2). Detection rate MM-T7 (≥0.90). | `DR-M06` §Mastery |
| **Reconciliation verdict** | **GAP (C6, LC).** Retry pivots + roadblock follow-ups scaffold recovery (L8) but **no** server-side gate requires correct-answer exposure before recording the outcome (L11); corrective content is agent free text. Target: no pass/mastered after an uncorrected terminal failure; **control = DR-M06 outcome gate + adversarial fixture.** | recon §5 M06, §7 C6 |
| **Uncertainty** | `INC-I1` — corrective-feedback effects measured on verbal/factual material, not DP; AI diagnostic reliability on DP-specific errors additionally unmeasured (extends F-M06-4). Provisional-on **G1**. | `DR-M06` §Uncertainty |
| **Rejected alternative** | "Record the failure and move on" (current, F-M06-5) — rejected (F-M06-1/2 hypercorrection). Rely on free-form AI diagnosis as the sole correctness channel — rejected (F-M06-4; self-grading mis-diagnosis silently confirms wrong answers, C4). | `DR-M06` §Rejected |
| **Experiment evidence** | **F-EXP-06** (AI review, class 4): **2/2 independent verdicts `supports`** — outcome gate **absent** live (free-text feedback only) and **implementable** at the terminal-failure / outcome-persistence sites. | `../experiments/06_…`, §EXP |

**Enforceable control (required):** failure mode C4/F-M06-4 + C6/F-M06-5; (1) constrained payload `{verdict, canonical_answer_ref, correct_answer_exposed}` + server-side assertion rejecting pass/mastered when `correct_answer_exposed==false` on any failed-attempt path; (2) held-out adversarial grading fixture **fail-closed** at ≥X (X `→ LINK-I2`). Enforcement = integration test over `teaching-workflows.ts` + CI fixture + payload schema at the server boundary. **Binding shape / open value.**

---

## M07 — Productive struggle  ·  `provisional`  ·  not learning-critical

| Axis | One-hop recovery | Source |
| --- | --- | --- |
| **Evidence + class** | Effortful/errorful attempts help *provided* subsequent correct-answer exposure (F-M07-1 [c1, causal]); productive only within the accomplishable band (F-M07-2 [c1, principle]); productive zone is learner-state-dependent — region of proximal learning / inverted-U (F-M07-3 [c1, causal/analogical]); a real 2nd attempt with a diagnostic hint is supported but depends on the hint correctly diagnosing (F-M07-4 [c1, causal+caveat]; "2" not evidence-derived, G6); engine has 2-attempt-with-pivot + tiered scaffolding (F-M07-5 [c2, compatibility]). | `../mechanisms/M07_…`, `DR-M07` |
| **Observable behavior** | Withhold the canonical answer for a **bounded** attempt sequence — a real first attempt, then one diagnostic-hint-scaffolded retry — before revealing; keep the task in-band via retrievability-tiered scaffolding; degrade to recognition **only when** the retrievability signal falls below the low bar; reveal at the terminal attempt (hand off to M06). Bounded, resolved, never open-ended. | `DR-M07` §Decision |
| **Mastery signal** | `→ LINK-I2`; struggle itself does **not** produce the graded signal (why M07 is not LC). Proxy = correct recall on a **subsequent spaced** attempt follows the struggle. Per-item fluency gate MM-T11; Stage-2 latency MM-T15. | `DR-M07` §Mastery |
| **Reconciliation verdict** | **ALIGNMENT.** Exactly coded: max 2 attempts, tier-branched `RETRY_PIVOT`, scaffolding ceilings, roadblock follow-ups (L8/L9). Per-item fluency gate value → MM-T11 (deferred, not a conflict). | recon §5 M07 |
| **Uncertainty** | `INC-I1` — errorful-learning benefits established on verbal/well-structured tasks; DP accomplishable-band boundary unmeasured. Provisional-on **G6** (attempt count "2") + **G1**. | `DR-M07` §Uncertainty |
| **Rejected alternative** | Error-avoidant study / immediate reveal — rejected (F-M07-1, F-DD-2). Unbounded struggle / no reveal — rejected (F-M07-2). | `DR-M07` §Rejected |
| **Experiment evidence** | **None executed.** Deferred → **D-5** (accomplishable-band boundary for DP; attempt count "2"/G6; dogfooding). Ships provisional; revision trigger = in-domain band/attempt-count measurement. | deferral §1 D-5 |

**Durable-vs-speed:** material → **staged** (struggle preserved in acquisition; attempt budget compressed / hint latency reduced in a later contest-speed phase, gated by per-item fluency `→ LINK-I2`). The coupled learning-critical guarantee (struggle resolves into a *trustworthy* correction) is carried by **DR-M06's** control, not duplicated. **Binding shape / open value.**

---

## M08 — Assessment (graded quality signal)  ·  `provisional`  ·  **learning-critical (C4, HIGH)**

| Axis | One-hop recovery | Source |
| --- | --- | --- |
| **Evidence + class** | LLM graders over-validate incorrect answers (F1 4–55%; up to **71%**) (F-M08-3 [c1, empirical]); sycophancy under rebuttal flips correct 45.2%, assertive 84.5% (F-M08-4 [c1, empirical]); strong judges ≈ human-level ~80% agreement with baked-in biases (F-M08-2 [c1, empirical]); a quality scale encodes difficulty-of-recall — binary collapse discards scheduler input (F-M08-1 [c1, algorithm spec]); AI client generates+judges+self-reports 0–5, session cap misses uniform first-turn leniency (F-M08-5 [c2, compatibility]). | `../mechanisms/M08_…`, `DR-M08` |
| **Observable behavior** | Grader returns a **structured rubric-anchored payload** (per-criterion booleans + verbatim justifying spans); a **deterministic (non-LLM) mapper** derives 0–5. An incorrect answer cannot pass on bare self-report; a bare **rebuttal does not flip** the score without a new payload; the signal is **never binary-collapsed** (0–5 granularity preserved). | `DR-M08` §Decision |
| **Mastery signal** | Faithful signal met when rubric-derived quality (a) **agrees** with held-out reference ≥ agreement bar **and** (b) keeps **over-validation ≤ ceiling** on known-incorrect answers. Both `→ LINK-I2` (MM-T4 A≥0.80, MM-T5 V≤0.10, MM-T6 rebuttal-invariance). | `DR-M08` §Mastery |
| **Reconciliation verdict** | **CONFLICT (C4, LC).** Agent-supplied quality with a **downward** session cap only; no rubric schema, no deterministic mapper, no adversarial fixture, no rebuttal-invariance; assessment mode **binary-collapses** (L6/L7). Over-validation behavior **not adopted**; **control = DR-M08 payload schema + adversarial fail-closed fixture + rebuttal-invariance.** | recon §5 M08, §7 C4 |
| **Uncertainty** | `INC-I1` — grading-reliability figures from general/non-DP tutoring; grading fidelity on DP-specific correctness (valid-but-unusual recurrence, off-by-one base case) unmeasured, plausibly worse. Provisional-on **G7** (bias magnitudes UNVERIFIED). | `DR-M08` §Uncertainty |
| **Rejected alternative** | Trust the LLM self-reported 0–5 with the session cap (status quo) — rejected (cap fires only after an early low score, cannot catch uniform first-turn leniency). Collapse to binary in assessment mode — rejected (F-M08-1, discards scheduler input). | `DR-M08` §Rejected |
| **Experiment evidence** | **F-EXP-03** (automated-eval, class 5): **12/12 oracle ×2 runs** — a deterministic mapper satisfying MM-T6 rebuttal-invariance, no binary collapse, fail-closed is **mechanically realizable**; control is not prose-only. | `../experiments/03_…`, §EXP |

**Enforceable control (required):** failure mode C4/F-M08-3/4/1; (1) grading payload schema (rubric fields) → deterministic mapper computes 0–5; (2) adversarial fixture of known-incorrect + valid-but-unusual answers, over-validation **fails closed** ≥ bar (`→ LINK-I2`); (3) rebuttal-invariance assertion. Enforcement = `submit_answer` grade-derivation path + Zod schema + CI test. **C4 stays `unresolved`·non-downgradable.** **Binding shape / open value.**

---

## M09 — Remediation  ·  `provisional`  ·  **learning-critical (C3)**

| Axis | One-hop recovery | Source |
| --- | --- | --- |
| **Evidence + class** | Evidenced leech intervention is **reformulate/re-present**, not suspend (F-M09-1 [c1, deployed practice]); thresholds are counting-rule-dependent product defaults ("8" lifetime ≠ small consecutive; G6) (F-M09-2 [c1, deployed spec]); **savings** — FSRS caps-not-zeros post-lapse stability; Ebbinghaus faster relearning (F-M09-3 [c1, algorithm design + causal replication]); massed same-session recovery buys performance not durable memory, 68% vs 26% (F-M09-4 [c1, causal]); current leech = 3 consecutive → EF −0.20, excluded until manually resolved, lapse unconditionally resets `reps→0, interval→1d` (F-M09-5 [c2, compatibility]). | `../mechanisms/M09_…`, `DR-M09` |
| **Observable behavior** | (1) A flagged leech emits a **reformulation/re-presentation** action, not a silent suspend. (2) Lapse handling is **savings-preserving**: post-lapse interval = a bounded function of prior stability, **floored below by a savings floor and capped by prior interval**, never collapsed to first-exposure `reps→0`. | `DR-M09` §Decision |
| **Mastery signal** | `→ LINK-I2`; shapes fixed: leech trigger = **N consecutive genuine failures** (MM-T13 N=3); post-lapse interval = **f(prior stability)**, monotonic, floored (MM-T14 floor ≈0.2×prior_stability). | `DR-M09` §Mastery |
| **Reconciliation verdict** | **CONFLICT (lapse, C3) + GAP (leech provenance).** Full reset on failure, no savings floor (L1/L2) — contradicts. Leech flag applies an ease penalty (L3, `leechFailureThreshold=6` **live lifetime floor** — corrects F-M09-5 "dead code"); reformulation via `resolve_leech` is outside the authoritative file set → reformulate-vs-suspend unverified. Trigger on the **agent-graded** signal (C4-coupled). Full-reset **not adopted**; **control = DR-M09 savings-floor invariant + leech-trigger provenance gate.** | recon §5 M09, §4.2, §7 C3 |
| **Uncertainty** | `INC-I1` — leech/lapse conventions from flashcard SRS on facts; whether the same thresholds/post-lapse curves apply to conceptual DP chunks unmeasured. Provisional-on **G6** + **G1**. | `DR-M09` §Uncertainty |
| **Rejected alternative** | Unconditional full reset on lapse (current, F-M09-5) — rejected (F-M09-3 savings; pushes recovery to massed regime). Suspend-only leech handling — rejected (F-M09-1 reformulate). | `DR-M09` §Rejected |
| **Experiment evidence** | **F-EXP-04** (automated-eval, class 5): **9/9 oracle ×2 runs** — full reset at every prior depth (MM-T14 floor violated 5/5 applicable); leech lifetime floor live (L3 re-verified dynamically); **C3 CONFLICT confirmed** across full breadth. Plus **O-2** deferral: `resolve_leech` reformulate-vs-suspend path (AI review/auto-eval, **beyond cap**), ships provisional. | `../experiments/04_…`, §EXP; deferral §2 O-2 |

**Enforceable control (required):** failure mode C3/F-M09-5 (+C4 coupling); (1) deterministic post-lapse savings invariant `floor(prior_stability) ≤ post_lapse ≤ prior_interval`, never `→1d`/`reps→0`, DB-backed integration test; (2) leech-trigger provenance gate — counter increments only on trustworthy, independently-verified grades (DR-M06 fixture is the source); N `→ LINK-I2`. Enforcement = integration tests over `sr-calculator.ts` / `classify-chunk.ts`. **Binding shape / open value.**

---

## M10 — Progression (mastery gating & advancement)  ·  `provisional`  ·  **learning-critical (C1, HIGH)**

| Axis | One-hop recovery | Source |
| --- | --- | --- |
| **Evidence + class** | 90% mastery-learning bar (F-M10-1 [c1, framework/quasi-exp]); BKT P≥0.95 convention (F-M10-2 [c1, modeling convention]); mastery is multi-observation (F-M10-3 [c1, framework]); false precision for an unmeasured population is a known failure (F-M10-4 [c1, methodological]); live prereq gate flagged as `repetitions>0` (F-M10-5 [c2, compatibility] — **corrected** by reconciliation to retrievability-reteach at 0.5). | `../mechanisms/M10_…`, `DR-M10` |
| **Observable behavior** | A dependent is **not unlocked until the prerequisite's mastery signal crosses a durability gate**, evaluated **server-side from persisted multi-observation history** — never a single success, client flag, or in-session spike. One-success prereq stays **locked**; a cleared prereq unlocks and emits an **observable gate-decision**; **speed alone never unlocks** (gate reads durability, not throughput). | `DR-M10` §Decision |
| **Mastery signal** | Dependent unlocks iff prerequisite's persisted multi-session posterior/retrievability ≥ **durability bar**. Bar `→ LINK-I2` (MM-T8 posterior ≥0.90, band 0.85–0.95); reads the Gate-B composite. | `DR-M10` §Mastery; Gate C |
| **Reconciliation verdict** | **GAP (C1, LC).** Retrievability-**reteach** at 0.5 (L4) with **no fail-closed unlock lock** (L5); single-point retrievability, no persisted multi-observation posterior, no gate-decision emission; single-success prereq passes while fresh. Audit's `repetitions>0` wording **corrected** (L4); the too-weak-gate substance **not adopted**; **control = DR-M10 durability gate + fail-closed single-success test + gate-decision.** | recon §5 M10, §4.1, §7 C1 |
| **Uncertainty** | `INC-I1` — mastery thresholds from other domains/models; defensible DP bar (and whether a speed criterion differs from a durable one) unmeasured. Provisional-on **G1** + **G5** (pacing numbers, Stage-2 speed). | `DR-M10` §Uncertainty |
| **Rejected alternative** | Gate unlock on `repetitions>0` — rejected (C1/F-M10-1/2; highest-severity open conflict). Fix a settled numeric bar now (90% / P≥0.95) — rejected (F-M10-4 false precision → deferred to LINK-I2). Speed/fluency-based unlock — rejected (F-TR-2; collapses staged resolution into single-goal speed). | `DR-M10` §Rejected |
| **Experiment evidence** | **F-EXP-05** (automated-eval, class 5): **7/7 oracle ×2 runs** — single-success / zero-review prerequisite passes (fail-open); live boundary at R=0.5, no action in [0.5, 0.90); no lock field in the gate contract; **C1 GAP verified** on executed behavior. | `../experiments/05_…`, §EXP |

**Enforceable control (required):** failure mode C1/F-M10-5 (+C4 precondition); (1) server-side `isPrerequisiteSatisfied` durability gate (multi-observation, monotonic, ≥ bar `→ LINK-I2`); (2) fail-closed single-success regression test (`repetitions==1` does not satisfy the gate); (3) observable gate-decision assertion. Enforcement = prerequisite-unlock path (`resolve-stale-prerequisites.ts`, `classify-chunk.ts`) + DB-backed integration test. **C1 stays `unresolved`·non-downgradable.** **Binding shape / open value.**

---

## Cross-cutting one-hop pointers (not per-mechanism, but load-bearing)

| Element | One-hop recovery | Source |
| --- | --- | --- |
| **Durable-vs-speed framework** | Material-tension triggers T1–T3, staged-vs-measured logic, dual-goal evidence requirement, no-third-exit invariant, adversarial self-review (PASS). Per-mechanism resolutions: immateriality M01/M06(exposure); measured M02/M03/M04/M09; staged M05/M07/M10. | `../framework/00_…`; ledger §C-FRAME |
| **Operational mastery model** | Unified signal spine (Production · Distribution · Fidelity · Correction-closure · Discrimination · Fading · Savings · Durability gate); staged ladder Gates A–E; threshold table MM-T1…MM-T15 (provisional value + epistemic band + class + revision signal each). | `../mastery-model/00_…` |
| **Live coded model** | Compatibility facts L1–L12 read from source 2026-07-13: lapse full reset (L1/L2), leech live lifetime floor (L3), retrievability-reteach prereq gate at 0.5 (L4), no unlock lock (L5), agent-supplied grade (L6), binary-collapse assessment (L7), bounded struggle coded (L8), tiered scaffolding (L9), difficulty-axis interleave knob (L10), no correct-answer gate (L11), q≥3 boundary (L12). | `../reconciliation/00_…` §3 |
| **Six executed experiments** | F-EXP-01 (M03/C2, AI review) · F-EXP-02 (M04/C2) · F-EXP-03 (M08/C4) · F-EXP-04 (M09/C3) · F-EXP-05 (M10/C1) · F-EXP-06 (M06/C6, AI review). All class-4/5; attach evidence only; settle nothing. | `../experiments/00…06`; ledger §EXP |
| **Ships-without-evidence lists** | Dogfooding-deferred (D-1…D-6, creator unavailable) + cap-overflow-deferred (O-1, O-2) + untestable (U-1). Each provisional with an explicit revision trigger. | `02_ships-without-evidence.md`; `../experiments/07_…` |

**Every cell above is one hop from its authoritative source.** No cell requires reconstructing intent from a different output. The completeness gate and the cold-context dry-run that verify this claim are in `03_completeness-gate-and-dry-run.md`.
