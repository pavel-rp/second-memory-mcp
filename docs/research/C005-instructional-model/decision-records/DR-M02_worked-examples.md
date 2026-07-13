# DR-M02 — Worked Examples

- **Record id / mechanism:** DR-M02 · Worked examples · cluster §C-ACQ · author NEU-918 · 2026-07-13
- **Learning-critical:** no  (source: template §3 — expertise-reversal mis-tuning wastes cognitive load; it does not gate or falsify the mastery signal.)

Authored against `00_decision-record-template.md` (§1 fields, §2 enforceable-control rule, §5 conformance checklist). Evidence: `../mechanisms/M02_worked-examples.md`, register `../traceability/01_instructional-evidence-register.md` §C-ACQ · M02, framing `../02_cognitive-load-desirable-difficulty-transfer.md`, tension logic `../framework/00_durable-vs-speed-framework.md`. **Status: provisional. Settles nothing.**

## Decision (observable behavior)

The system teaches DP through **worked-example study for novices, faded toward unaided problem-solving as per-learner expertise rises** — i.e. worked-example support is a **continuous, expertise-weighted dial**, not a fixed treatment. Observable behaviors a reviewer or test can watch:

1. **Novice entry with full/near-full worked derivations.** For a learner low on a DP sub-skill's expertise signal, the delivered instruction contains a complete solution derivation (problem → recurrence → state → transition → base case → implementation) to study, rather than an unaided solve prompt.
2. **Monotone fading as expertise rises.** As the per-learner expertise signal for that DP sub-skill increases, the proportion of worked steps *shown* (equivalently, the depth of scaffolding) **decreases monotonically** — example→problem pairs give way to problem→example pairs and faded-step sequences, ending in unaided problem-solving (F-M02-4). The weighting shifts *with* the signal (a measured resolution, not a one-time switch).
3. **No full-worked-example redundancy past the expertise threshold.** A learner whose expertise signal has crossed the fade band is **not** served full worked examples (which would add redundant extraneous load — expertise reversal, F-M02-3).

The **fading is adaptive** (weighted by a live per-learner expertise signal), not a fixed calendar/step schedule; the *calibrated* mapping from signal value to fade depth is deferred (see Mastery signal / Uncertainty).

## Cited evidence + class

- **F-M02-1** [class 1, causal — many controlled studies, synthesized] — the worked-example effect: for novices, worked-example study is more effective for learning/transfer than unaided problem-solving and is *more efficient* in early acquisition; supports behavior 1 (novice entry with worked support). ("Transfer" here is within-topic, not DP — see Uncertainty.)
- **F-M02-3** [class 1, causal — expertise×treatment interaction] — **expertise reversal:** worked examples lose effectiveness and turn *negative* for more knowledgeable learners; continued full worked examples add redundant extraneous load; supports behaviors 2–3 (must fade) and the durable-side gradient below.
- **F-M02-4** [class 1, causal — fading experiments] — **guidance fading:** adaptive fading > fixed fading > unaided problem-solving; example→problem pairs suit novices, problem→example / faded sequences suit experts; supports behavior 2 (adaptive, expertise-weighted fading) and the rejection of a fixed schedule.
- **F-M02-2** [class 1, meta-analytic — magnitude partly UNVERIFIED (G4)] — the effect is meta-analytically positive with a moderate effect size (Crissman d≈0.52 directional; Barbieri 2023 significant, pooled magnitude UNVERIFIED); cited for **direction only**, not magnitude.
- **F-M02-5** [class 2, code-fact] — the engine delivers single-concept scripts with difficulty≥4 triggering incremental pacing and low-R tier degradation toward more-supported formats, but has **no** explicit expertise-keyed worked-example *fading* construct; supports **compatibility** (a fading dial can attach to the existing tiering) and identifies the build gap. *Class-2 supports compatibility only — not a pedagogical endorsement, and tiered instruction is not asserted to be a valid fading proxy (that verdict is reconciliation-owned).*
- Framing carried: **F-CL-2** [class 1] (extraneous vs germane load), **F-DD-2** [class 1, mechanistic] (difficulty forfeits immediate success), **F-TR-1** [class 1, taxonomy] and **F-TR-3** [class 1 / inherited-risk] (DP transfer unmeasured).

## Mastery signal

Objective met when the learner **solves DP problems of the target type unaided** (worked support fully faded) at the intended expertise band. The **observable signal shape** is stated here (unaided correct solution production without scaffolding for that DP sub-skill); the **per-learner expertise estimate driving the fade and its calibrated fade thresholds are UNRESOLVED → LINK-I2** (mastery-model sub-task). No expertise threshold or fade constant is invented in this record (template field 4 / no-invented-value).

## Constraints

- **Cognitive-load / desirable-difficulty:** Worked examples are the paradigm **extraneous-load reduction** lever for novices — they replace high means-ends search with schema study (F-M02-1). The decision **spends germane load / preserves desirable difficulty via fading:** as expertise rises, fading deliberately *restores* the productive difficulty of unaided retrieval and derivation (F-M02-3/4, F-DD-2). This is the clearest case of "reduce load" and "preserve desirable difficulty" being **the same dial read at different expertise levels** (`../02_…` §4): support is *removed as extraneous* exactly where it would otherwise *remove desirable difficulty*. Intrinsic load (the recurrence/state/transition structure itself) is managed upstream by M01 sequencing, not re-managed here.
- **Privacy gate:** if the per-learner expertise signal is derived from any class-6 operational-log aggregate, it is used **aggregate-only** (per the inherited privacy gate); no per-learner class-6 signal is asserted or invented here.
- **Caps / conflicts not to contradict:** M02 owns **no** synthesis conflict (C1–C6); the decision must not contradict the DP-transfer cap (G1/INC-I1) or assert the UNVERIFIED pooled magnitude (G4). It stays clear of M05 interleaving (a distinct dial).

## Uncertainty

- **DP-transfer: INC-I1** — worked-example transfer is measured within topics (math, physics, well-structured problems), **not** on DP far transfer; whether studying DP worked examples yields novel-DP-problem-solving transfer is unmeasured (F-M02-1 limitation; F-TR-1 far transfer is hard; F-TR-3). DP effectiveness stays **provisional**. What would settle it: in-domain (class-7 / measured) DP worked-example-to-transfer study.
- **Gaps provisional-on: G4** (worked-example pooled magnitudes UNVERIFIED — direction supported, precise effect size not) and **G1** (DP transfer). "Expertise" is domain-specific and **unmeasured for DP sub-skills** (F-M02-3 limitation); the fade calibration is therefore deferred to LINK-I2, not invented.
- This record presents **no** DP-domain worked-example effectiveness or magnitude as established.

## Rejected alternative

- **Fixed full worked examples throughout (no fading)** — **rejected** because F-M02-3 (expertise reversal: continued full worked examples become ineffective and turn *negative* for more knowledgeable learners, adding redundant extraneous load). A constant worked-example treatment optimizes early acquisition at the cost of later durable schema-building.
- **Fixed (non-adaptive) fading schedule** (fade on a fixed step/session cadence regardless of the learner) — **rejected** because F-M02-4 (adaptive fading beats fixed fading beats problem-solving); a fixed cadence fades too slowly for fast learners (redundancy) and too fast for slow ones (means-ends overload). Hence behavior 2 is expertise-weighted, not calendar-driven.

## Enforceable control   (REQUIRED if learning-critical)

- **— (not learning-critical:** expertise-reversal mis-tuning wastes cognitive load / degrades *efficiency* (redundant support or premature withdrawal); it does **not** gate progression or falsify the graded mastery signal — template §3. Mis-timed fading is visible in learner performance, not silently corrupting of the retention signal. The field is therefore carried with an explicit not-applicable rationale, per template §2.**)**

## Durable-mastery-vs-contest-speed (framework `../framework/00_…`)

**Material-tension resolution (§2.1-A) — measured (§3.2).**

- **Trigger evaluation.**
  - **T1 — Opposing gradient: PASS.** Dialing the fading dial **toward more worked support** (less fading) increases immediate performance/efficiency — a worked derivation lets the learner produce a correct solution faster in the moment (F-M02-1, "more efficient in early skill acquisition"; F-DD-2, lowering difficulty protects immediate success) — but, past the expertise threshold, **decreases** durable schema-building by removing the productive retrieval/derivation difficulty (F-M02-3 expertise reversal; F-M02-4 faded/unaided practice builds more durable schema). Opposite-sign gradients on the same dial.
  - **T2 — Evidenced, non-negligible: PASS.** Durable side is **causal** (F-M02-3, F-M02-4); the immediate-performance side is **causal-as-efficiency** (F-M02-1) reinforced by F-DD-2 (mechanistic). Both sides evidenced; magnitude on the durable side is causal, the pooled effect size is UNVERIFIED (G4) → feeds provisional status.
  - **T3 — Both goals in-objective: PASS.** The CP audience needs durable DP schema (derive a novel recurrence weeks later) **and** fast in-contest recognition/production. Worked support serves fast early acquisition; fading serves durable schema — both are pursued.
  - → **Material.** A resolution is required; no immateriality certificate is available.
- **Shape choice (§3.3).** The evidence (F-M02-4) makes **adaptive** fading — weighting by a **continuous per-learner expertise signal** — beat fixed (staged) fading. The optimal support level is **per-item/graded** and better tracked by a live expertise measure than by a single phase gate → **branch 2 → measured**.
- **Measured resolution.** *Signal:* per-learner DP-sub-skill expertise estimate (observable; proxy candidates — retrievability tier / recent unaided-success rate — exist in the engine, F-M02-5). *Weighting function:* worked-step support (scaffold depth) is **monotonically decreasing** in the expertise signal — high expertise → fewer worked steps (restore desirable difficulty, durable side); low expertise → more worked steps (reduce extraneous load, immediate-performance side). *Shift:* the weight moves continuously as the signal moves. **Calibrated fade thresholds = UNRESOLVED → LINK-I2** (mastery-model owns the values; this record fixes the signal's *shape and direction*, not the numbers).
- **Conformance (§4).** Dual-goal evidence: durable = F-M02-3/4; immediate-performance = F-M02-1 / F-DD-2 ✓ (§4.1). Observable signal = per-learner expertise estimate, value deferred to LINK-I2 ✓ (§4.2). DP-transfer carried: INC-I1 / F-TR-3 — DP worked-example transfer *and* pooled magnitude (G4) unmeasured ✓ (§4.3). Trigger evaluation recorded above ✓ (§4.4). M02 is **not** learning-critical, so no enforceable-control coupling is required; the resolution contradicts no conflict (M02 owns none) ✓ (§4.5). Ledger mirror: §C-ACQ, **provisional**, not settled ✓ (§4.6). Adversarial-review-safe: cites both goals (A1), gate observable with deferred value (A3), carries INC-I1 (A4).

## Traceability back-links

- **Register findings consumed:** F-M02-1, F-M02-2, F-M02-3, F-M02-4, F-M02-5; F-CL-2, F-DD-2, F-TR-1, F-TR-3.
- **Conflicts addressed (not resolved):** none owned by M02 (C1–C6 all lie outside this mechanism).
- **INC markers carried:** INC-I1 (DP transfer, open).
- **LINK slots bound:** **LINK-I1 = this record (DR-M02)** — INC-I2 (missing `DR-M02`) is thereby resolved for M02. LINK-I2 = per-learner expertise signal + fade-threshold calibration (deferred, mastery-model).

## Ledger status

- **provisional** — mirrored into `../adjudication/01_instructional-decision-ledger.md` §C-ACQ (M02 row). Empirical decision resting on class-1/2 evidence with DP transfer unmeasured and pooled magnitude UNVERIFIED (G4; class-7 absent project-wide); `settled`/`accepted` is firewall-reserved and **not** claimed. Revision trigger: in-domain DP worked-example measurement (INC-I1), verified pooled magnitude (G4), or the mastery-model's expertise-signal calibration (LINK-I2).
