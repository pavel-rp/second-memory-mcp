# Instructional Decision Ledger (skeleton — NEU-887 adjudication ledger, extended)

**Task:** NEU-916 · **Compiled:** 2026-07-13 · **Method / discipline:** `00_adjudication-extension-method.md` · **Extends** `../../C005-product-foundation/adjudication/03_decision-status-register.md` (NEU-906). **Register:** `../traceability/01_instructional-evidence-register.md`.

The mutable-status ledger for instructional decisions. **Seeded, not driven:** NEU-916 sets each row's *initial* status per the seeding rule (`00_…` §4) and flips **nothing** to `settled`/`accepted`. Every mechanism, conflict, and gap carries a status ∈ {`settled`(=`accepted`, none here) / `provisional` / `unresolved`} and a **named owner**, so zero elements are unadjudicated-but-counted. Statuses move only in this ledger, on correctly-classed evidence, when a compliant `DR-Mxx` (`../decision-records/00_…`) is authored.

Sections are delimited per cluster so downstream siblings update their own block without colliding.

Legend: **Dec. status** = mutable decision status. **Ev. status** = evidence status (the `F-*` behind it). `INC-I#` = missing-artifact marker. All rows below are seeded `unresolved`/`provisional`; **none is `settled`.**

---

## §C-ACQ — Acquisition / sequencing cluster · owner NEU-918

| Element | Ev. status (findings) | Dec. status | INC / blocker | Owner | Note |
| --- | --- | --- | --- | --- | --- |
| **M01 Sequencing** (decision) | provisional (F-M01-1…4 directional; F-M01-5/6 code) | **provisional** | INC-I2 ✓ bound → `../decision-records/DR-M01_sequencing.md` · INC-I1 (DP) still open | NEU-918 | **`DR-M01` authored** (NEU-918): prerequisite-first ordering + advance-on-demonstration; CL-framing (intrinsic-load lever, desirable difficulty preserved at the boundary) + rejected alt (exposure-based advancement). Durable-vs-speed **immateriality-certified** (T2 fails — no evidenced opposing gradient; latent, recorded as gap). C1/C5 **not resolved** (deferred to M10/reconciliation, NEU-919). Not learning-critical. **Not settled.** |
| **M02 Worked examples** (decision) | provisional (F-M02-1/3/4 causal; F-M02-2 magnitude UNVERIFIED) | **provisional** | INC-I2 ✓ bound → `../decision-records/DR-M02_worked-examples.md` · INC-I1 (DP) still open · G4 | NEU-918 | **`DR-M02` authored** (NEU-918): expertise-weighted worked-example fading; CL-framing (extraneous-load lever = same dial as desirable difficulty at different expertise) + rejected alts (fixed full worked examples; fixed fading schedule). Durable-vs-speed **material → measured resolution** (fade weighted by per-learner expertise signal; threshold → LINK-I2). Not learning-critical. **Not settled.** |

## §C-PRAC — Practice / review cluster · owner NEU-919

| Element | Ev. status (findings) | Dec. status | INC / blocker | Owner | Note |
| --- | --- | --- | --- | --- | --- |
| **M03 Retrieval** (decision) | provisional (F-M03-1…4 causal; F-M03-5 code; F-EXP-01 ai-critique, NEU-924 §EXP) | **provisional** | INC-I2 ✓ bound → `../decision-records/DR-M03_retrieval.md` (LINK-I1) · INC-I1 (DP) open · LINK-I2 unbound | NEU-919 | **Learning-critical (C2):** `DR-M03` authored with a **non-prose enforceable control** (same-session massed re-recalls flagged + excluded from the mastery-signal aggregate; runtime invariant + CI test). Measured durable-vs-speed resolution. Not settled. |
| **M04 Spacing** (decision) | provisional (F-M04-1/2/3 causal; F-M04-4 observational; F-M04-5/6 code; F-EXP-02 automated-eval, NEU-924 §EXP) | **provisional** | INC-I2 ✓ bound → `../decision-records/DR-M04_spacing.md` (LINK-I1) · INC-I1 (DP) open · LINK-I2 unbound | NEU-919 | **Learning-critical (C2):** `DR-M04` authored with a **non-prose enforceable control** (inter-session gate: criterion counter advances only across separated sessions; test asserts N same-session recalls fail the gate). Measured resolution. C2 severity floor non-downgradable. Not settled. |
| **M05 Interleaving** (decision) | provisional (F-M05-1/2/4 causal; F-M05-3 absence; F-M05-5 code) | **provisional** | INC-I2 ✓ bound → `../decision-records/DR-M05_interleaving.md` (LINK-I1) · INC-I1 (DP) open · LINK-I2 unbound | NEU-919 | Not learning-critical (C5 MEDIUM). `DR-M05` authored: axis resolved = **category** (F-M05-3), staged resolution (blocked acquisition → interleaved review of unlocked material), **supersedes** the illustrative §C-FRAME walkthrough. Not settled. |

## §C-FBK — Feedback / struggle / remediation cluster · owner NEU-920

| Element | Ev. status (findings) | Dec. status | INC / blocker | Owner | Note |
| --- | --- | --- | --- | --- | --- |
| **M06 Feedback** (decision) | provisional (F-M06-1/2/3 causal; F-M06-4 empirical; F-M06-5 code; F-EXP-06 ai-critique, NEU-924 §EXP) | **provisional** | INC-I2 ✓ → `DR-M06` · INC-I1 (DP) · INC-I3 (recon) | NEU-920 | **Learning-critical (C6/F-M06-4).** `DR-M06` authored: corrective-feedback + correct-answer-exposure step after terminal failure; enforceable control = constrained feedback payload + server-side outcome gate + held-out adversarial grading fixture (fail-closed, threshold → LINK-I2). Closes C6; guards C4. **Not settled.** |
| **M07 Productive struggle** (decision) | provisional (F-M07-1/3 causal; F-M07-2/4 principle; F-M07-5 code) | **provisional** | INC-I2 ✓ → `DR-M07` · INC-I1 (DP) · G6 | NEU-920 | Not learning-critical (coupled to M06). `DR-M07` authored: bounded struggle (attempt + hinted retry) with retrievability-tiered scaffolding; material durable-vs-speed → staged resolution (struggle preserved in acquisition; per-item fluency gate → LINK-I2). Enforceable-control field carries the explicit not-applicable rationale. **Not settled.** |
| **M09 Remediation** (decision) | provisional (F-M09-1/2 practice; F-M09-3/4 causal; F-M09-5 code; F-EXP-04 automated-eval, NEU-924 §EXP) | **provisional** | INC-I2 ✓ → `DR-M09` · INC-I1 (DP) · G6 · INC-I3 (recon) | NEU-920 | **Learning-critical (C3).** `DR-M09` authored: reformulate-not-suspend + savings-preserving lapse schedule; enforceable control = deterministic post-lapse savings-floor invariant + leech-trigger provenance gate (values → LINK-I2). Closes C3; honors C2. **Not settled.** |

## §C-ASSESS — Assessment / progression cluster · owner NEU-921

| Element | Ev. status (findings) | Dec. status | INC / blocker | Owner | Note |
| --- | --- | --- | --- | --- | --- |
| **M08 Assessment** (decision) | provisional (F-M08-1 spec; F-M08-2/3/4 empirical; F-M08-5 code; F-EXP-03 automated-eval, NEU-924 §EXP) | **provisional** | INC-I2 ✓ discharged → `DR-M08` (`../decision-records/DR-M08_assessment.md`), LINK-I1 bound · INC-I1 (DP) open · LINK-I2 (thresholds) UNBOUND · G7 | NEU-921 | **Learning-critical (C4, HIGH):** `DR-M08` authored with a non-prose enforceable control (constrained rubric payload + deterministic mapper, adversarial fail-closed CI fixture, rebuttal-invariance). Agreement/over-validation thresholds → LINK-I2. **Not settled**; C4 stays `unresolved`·non-downgradable (reconciliation NEU-923). |
| **M10 Progression** (decision) | provisional (F-M10-1/3 framework; F-M10-2 convention; F-M10-4 methodological; F-M10-5 code; F-EXP-05 automated-eval, NEU-924 §EXP) | **provisional** | INC-I2 ✓ discharged → `DR-M10` (`../decision-records/DR-M10_progression.md`), LINK-I1 bound · INC-I1 (DP) open · LINK-I2 (bar) UNBOUND | NEU-921 | **Learning-critical (C1, HIGH):** `DR-M10` authored — server-side durability gate (multi-observation, fail-closed single-success test, observable gate-decision); staged durable-vs-speed resolution (durability-first unlock, speed as later phase). Mastery bar → LINK-I2 (mastery-model); cross-mechanism thresholds → NEU-922; live-rule reconciliation → NEU-923. **Not settled**; C1 stays `unresolved`·non-downgradable. |

## §C-FRAME — Cross-cutting framework · owner NEU-917

| Element | Ev. status (findings) | Dec. status | INC / blocker | Owner | Note |
| --- | --- | --- | --- | --- | --- |
| **Cognitive-load framing** | provisional (F-CL-1/2 theoretical) | **unresolved** | INC-I4 · G8 (capacity precision) | NEU-917 | Framing is evidence; the framework decision is NEU-917's. |
| **Desirable-difficulty framing** | provisional (F-DD-1/2/3) | **unresolved** | INC-I4 · INC-I1 | NEU-917 | Accomplishable-band boundary unmeasured for DP. |
| **Durable-mastery-vs-contest-speed** | provisional (F-TR-1/2/3 transfer) | **provisional** | INC-I4 ✓ bound → `../framework/00_durable-vs-speed-framework.md` · INC-I1 (DP) still open | NEU-917 | NEU-888 OUT-3. **Framework authored** (`../framework/00_…`): material-tension triggers T1–T3, staged-vs-measured logic, dual-goal evidence requirement, no-third-exit invariant, and adversarial self-review (no silent single-goal exit — PASS). Per-mechanism resolutions remain downstream (NEU-918…921). **Not settled.** |
| **↳ M05 durable-vs-speed walkthrough** (illustrative) | provisional (durable F-M05-1/2 causal; speed F-M05-4/F-DD-2 directional) | **provisional** | INC-I1 (DP) · F-M05-2 blocking-first UNVERIFIED · gate value → LINK-I2 | NEU-917 (demo) → NEU-919 (binding) | Staged resolution (per-technique fluency gate → interleaved consolidation), **provisional pending creator walkthrough** (Assumption #10). Revision trigger: (a) creator validates/rejects the blocking-first ordering; (b) in-domain DP measurement lands (INC-I1/G1); (c) NEU-919 authors `DR-M05`, which supersedes this. Illustrative only — does **not** author `DR-M05`, settle M05, or touch §C-PRAC. |

## §C-MASTERY — Integrative operational mastery model (`LINK-I2`) · owner NEU-922

The cross-mechanism consolidation of the ten `DR-Mxx` mastery signals. **Binds `LINK-I2`** (the mastery-signal contract) with **provisional values + uncertainty bands** — it does **not** author a new mechanism decision, resolve a conflict, or flip any status to `settled`/`accepted`. Artifact: `../mastery-model/00_operational-mastery-model.md`.

| Element | Ev. status (findings) | Dec. status | INC / blocker | Owner | Note |
| --- | --- | --- | --- | --- | --- |
| **Operational mastery model** (integration) | provisional (consolidates DR-M01…M10; class-1/2 only) | **provisional** | `LINK-I2` ✓ bound → `../mastery-model/00_…` · `INC-I1` (DP) still open · class-7 absent | NEU-922 | Unified mastery-signal spine + staged progression rules (Gates A–E) composing the ten DR shapes. Contradicts no `DR-Mxx` invariant (DR-M10 durability gate, DR-M04 inter-session gate, DR-M08 deterministic mapper). **Not settled.** |
| **`LINK-I2` threshold binding** (MM-T1…MM-T15) | provisional (values transported from class-1 convention / class-2 default) | **provisional** | `INC-I1` (DP) open · G5/G6/G7 carried on the widest-band rows | NEU-922 | Every DR-deferred value now has a provisional value + **explicit epistemic uncertainty band** + evidence class + named revision signal. **No external validity claimed** (population validity UNEARNED until dogfooding/production). MM-T8 (C1) and MM-T4/T5 (C4) supply *target* bars only — **conflicts not resolved** (reconciliation NEU-923). **No value laundered as measured.** Not settled. |

---

## §CONFLICTS — Reconciliation conflict register (from `../03_synthesis.md` §2)

Each `[literature]`-vs-`[code-evidence]` conflict, seeded `unresolved` pending the reconciliation verdict (`INC-I3`). **HIGH conflicts are non-downgradable** (`00_…` §3.4). No conflict is resolved by NEU-916.

| Conflict | Severity | Dec. status | Blocker | Owner | Evidence |
| --- | --- | --- | --- | --- | --- |
| **C1** Prerequisite mastery gate (`repetitions>0` vs high/probabilistic bar; characterization flagged stale) | HIGH | **unresolved** · non-downgradable | INC-I3 ✓ bound → `../reconciliation/00_conflict-register.md` (verdict: **CONFIRMED GAP** — audit `repetitions>0` corrected to live retrievability-reteach at 0.5, below durability bar, no fail-closed unlock gate; not resolved) | reconciliation (NEU-923) + mastery-model | F-M01-6, F-M10-5, F-M10-1/2 |
| **C2** Roadblock recovery = same-session massed (26% vs 68% spaced) | HIGH | **unresolved** · non-downgradable | INC-I3 | mechanism-decision (M03/M04) + reconciliation | F-M04-2/6, F-M09-4 |
| **C3** Lapse full reset vs. savings (repetitions→0 vs FSRS caps-not-zeros) | HIGH | **unresolved** · non-downgradable | INC-I3 | reconciliation | F-M09-3/5 |
| **C4** Assessment fidelity (LLM over-validation; session cap misses uniform leniency) — **learning-critical** | HIGH | **unresolved** · non-downgradable | INC-I3 ✓ bound → `../reconciliation/00_conflict-register.md` (verdict: **CONFIRMED CONFLICT** — quality agent-supplied, downward session-cap only, no deterministic mapper / adversarial fixture / rebuttal-invariance, assessment binary-collapses; control = `DR-M08`; not resolved) | reconciliation (NEU-923) + mastery-model | F-M08-1/3/5 |
| **C5** Interleaving axis (category vs difficulty; none live) | MEDIUM | **unresolved** | INC-I3 | mechanism-decision (M05) | F-M05-3/5, F-M01-3 |
| **C6** Feedback after failure absent (no correct-answer exposure) | MEDIUM-HIGH | **unresolved** | INC-I3 | mechanism-decision (M06) + reconciliation | F-M06-1/5, F-M03-5 |

## §GAPS — Unresolved-gap inventory (from `../03_synthesis.md` §3)

Recorded, **never filled with an invented value** (`00_…` §3.5). Cap-bound gaps are INCOMPLETE (out of NEU-887 caps); artifact-bound gaps are `unresolved` + `INC-I*`.

| Gap | Kind | Dec. status | Blocker | Owner |
| --- | --- | --- | --- | --- |
| **G1** DP-domain transfer unmeasured (ALL mechanisms) | artifact-bound (controlling) | **unresolved** · non-downgradable | INC-I1 (inherited R1/X1) | experiment + reconciliation |
| **G2** Three spec-named input files absent | cap-bound | **unresolved** (INCOMPLETE) | INC-I5 (may stay unrecovered) | out-of-caps |
| **G3** No class-3/4/5/6-fresh/7 evidence | inherent | **unresolved** | class-7 absent project-wide | experiment (partial) |
| **G4** Worked-example pooled magnitudes UNVERIFIED | evidence-quality | **provisional** (direction supported) | primary re-fetch | mechanism-decision (M02) |
| **G5** Session-length / daily-cap numbers unanchored | cap-bound | **unresolved** (INCOMPLETE) | in-domain measurement | pacing/progression (downstream) |
| **G6** Exact criterion / recovery / attempt counts unsupported | evidence-absence | **unresolved** | in-domain measurement | mechanism-decision (M04/M07/M09) |
| **G7** Specific LLM-bias percentages UNVERIFIED | evidence-quality | **provisional** (omitted, not asserted) | primary confirm | mechanism-decision (M08) |
| **G8** Chunking-capacity precision (Cowan ~4) | cap-bound | **unresolved** (INCOMPLETE) | independent fetch | NEU-917 (framing) |

---

## §SELF-CHECK — NEU-916 ledger self-attestation

- **Zero elements unadjudicated.** All 10 mechanisms + 3 framing rows + 6 conflicts + 8 gaps carry a status and a named owner. **PASS by construction.**
- **Nothing set to `settled`/`accepted`.** Every decision row is `unresolved`; the only `provisional` rows are *evidence*-quality gaps (G4/G7) and the per-mechanism evidence status — no mechanism *decision* is `provisional` or `settled` (no `DR-Mxx` exists yet). NEU-916 makes no instructional decision. **PASS by construction.**
- **Severity floor honored.** C1–C4 and G1 (`INC-I1`) are marked non-downgradable. **PASS.**
- **No invented value.** No gap/conflict row carries a threshold, rate, or effect size. **PASS.**
- **Status discipline.** Every status uses the NEU-906 vocabulary verbatim; the ledger is the sole place a status may later flip. **PASS.**

## §SELF-CHECK-917 — NEU-917 update (framework)

NEU-917 authored the durable-mastery-vs-contest-speed framework (`../framework/00_durable-vs-speed-framework.md`) and updated **only** its owned §C-FRAME rows:

- **§C-FRAME durable-vs-speed row → `provisional`** (was `unresolved`): the framework artifact is delivered, so `INC-I4` is bound; the row rests on provisional transfer evidence (F-TR-1/2/3) and carries a provisional walkthrough. **Nothing is `settled`/`accepted`** — the settled-forbidden firewall holds. `INC-I1` (DP measurement) remains open.
- **M05 walkthrough row (illustrative) → `provisional`, pending creator (Assumption #10)** with an explicit three-part revision trigger. It authors no `DR-M05`, settles no mechanism, and does not touch §C-PRAC (NEU-919 owns the binding M05 decision).
- **Untouched:** the `cognitive-load framing` / `desirable-difficulty framing` rows (framing evidence), every mechanism decision row (still `unresolved`), and all §CONFLICTS/§GAPS rows. No `F-*` re-classed, no gap filled with an invented value. **PASS.**

## §SELF-CHECK-918 — NEU-918 update (acquisition / sequencing cluster)

NEU-918 authored the two acquisition-cluster decision records (`../decision-records/DR-M01_sequencing.md`, `../decision-records/DR-M02_worked-examples.md`) against the NEU-916 template and updated **only** its owned §C-ACQ rows:

- **§C-ACQ M01 Sequencing → `provisional`** (was `unresolved`): `DR-M01` authored, so `INC-I2` for M01 is bound (LINK-I1 = `DR-M01`); the decision rests on class-1/2 evidence with DP transfer unmeasured. Durable-vs-speed tension **immateriality-certified** (trigger T2 fails; recorded as gap, not a fabricated tradeoff). **Not `settled`/`accepted`** — the firewall holds; `INC-I1` (DP) remains open.
- **§C-ACQ M02 Worked examples → `provisional`** (was `unresolved`): `DR-M02` authored (LINK-I1 = `DR-M02`; `INC-I2` bound). Durable-vs-speed tension **material → measured resolution** (worked-example fading weighted by a per-learner expertise signal; calibrated fade threshold deferred `LINK-I2`). Carries `G4` (pooled magnitude UNVERIFIED) and `INC-I1`. **Not `settled`.**
- **No enforceable control invented:** both mechanisms are **not** learning-critical (template §3); each record carries the enforceable-control field with an explicit not-applicable rationale (not blank, not prose-aspirational).
- **Untouched:** every other cluster's rows (§C-PRAC/§C-FBK/§C-ASSESS/§C-FRAME), all §CONFLICTS rows (C1–C6 — M01 defers C1/C5 without resolving them), and all §GAPS rows. No `F-*` re-classed; no gap filled with an invented value. **PASS.**

## §SELF-CHECK-921 — NEU-921 update (assessment / progression cluster)

NEU-921 authored `DR-M08` (`../decision-records/DR-M08_assessment.md`) and `DR-M10` (`../decision-records/DR-M10_progression.md`) and updated **only** its owned §C-ASSESS rows:

- **§C-ASSESS M08 → `provisional`** (was `unresolved`): `DR-M08` is authored with a non-prose enforceable control (failure mode C4/F-M08-3/4/1 + constrained rubric payload / deterministic mapper, adversarial fail-closed CI fixture, rebuttal-invariance + server-side `submit_answer` enforcement point). `INC-I2` discharged for M08, `LINK-I1` bound; `LINK-I2` (agreement + over-validation thresholds) UNBOUND; `INC-I1` open; G7 carried. **Not `settled`** — class-7 absent; C4 stays `unresolved`·non-downgradable.
- **§C-ASSESS M10 → `provisional`** (was `unresolved`): `DR-M10` is authored with a non-prose enforceable control (failure mode C1/F-M10-5 + server-side durability gate invariant, fail-closed single-success regression test, observable gate-decision + prerequisite-unlock enforcement point) and a **staged** durable-vs-speed resolution (materiality certificate T1∧T2∧T3; durability-first unlock, speed as a later phase, gate value → LINK-I2). `INC-I2` discharged for M10, `LINK-I1` bound; `LINK-I2` (bar) UNBOUND; `INC-I1`/`INC-I4` carried. **Not `settled`** — C1 stays `unresolved`·non-downgradable.
- **Untouched:** every other mechanism decision row, all §C-ACQ/PRAC/FBK/FRAME rows, and all §CONFLICTS/§GAPS rows (C1/C4 remain `unresolved`·non-downgradable — reconciliation NEU-923 owns closure; cross-mechanism integration is NEU-922). No `F-*` re-classed, no gap filled with an invented value, no threshold invented (bars → LINK-I2). **PASS.**

## §SELF-CHECK-919 — NEU-919 update (practice / review cluster)

NEU-919 authored the three §C-PRAC decision records (`../decision-records/DR-M03_retrieval.md`, `DR-M04_spacing.md`, `DR-M05_interleaving.md`) and updated **only** its owned rows:

- **§C-PRAC M03 / M04 / M05 decision rows → `provisional`** (were `unresolved`): a compliant `DR-Mxx` now exists for each, so `INC-I2` is bound → `LINK-I1`; each row rests on class-1/2 evidence with `INC-I1` (DP) still open and `LINK-I2` (mastery-signal contract) still unbound. **Nothing is `settled`/`accepted`** — the settled-forbidden firewall holds; the C2 severity floor stays non-downgradable.
- **Learning-critical cross-check (method §5):** M03 and M04 each carry a **non-prose-only enforceable control** (failure mode C2 + a deterministic mechanical check + a named enforcement point), so the ledger showing them `provisional` is consistent with the decision-record template §2/§5. M05 is non-learning-critical (C5 MEDIUM) and carries the explicit not-applicable rationale.
- **C5 moved on its owner's evidence:** `DR-M05` resolves the interleaving axis to **category** (F-M05-3); the C5 §CONFLICTS row is left `unresolved` (its reconciliation/live-code verdict, INC-I3, is not NEU-919's) — only the M05 *decision* row moved.
- **Untouched:** all §C-ACQ / §C-FBK / §C-ASSESS / §C-FRAME rows (including the NEU-917-owned M05 durable-vs-speed walkthrough row — `DR-M05` supersedes it per the framework's own revision trigger (c), recorded in `DR-M05`, **not** by editing that row), every §CONFLICTS row (C1–C6 statuses unchanged), and every §GAPS row. No `F-*` re-classed; no gap (G1/G6) filled with an invented value — the deferred counts stay `UNRESOLVED → LINK-I2`. **PASS.**
## §SELF-CHECK-920 — NEU-920 update (feedback / struggle / remediation cluster)

NEU-920 authored the three §C-FBK decision records (`../decision-records/DR-M06_feedback.md`, `DR-M07_productive-struggle.md`, `DR-M09_remediation.md`) against the NEU-916 template and updated **only** its owned §C-FBK rows:

- **M06 / M07 / M09 decision rows → `provisional`** (were `unresolved`): each `DR-Mxx` is authored, so `INC-I2` is bound to the record for these three mechanisms. **Nothing is `settled`/`accepted`** — empirical decisions are ≤ `provisional` (class-7 absent); `INC-I1` (DP transfer) remains open on all three, and calibrated values (thresholds, savings floor, fluency gate) defer to `LINK-I2`.
- **Enforceable-control gate met on both learning-critical records.** `DR-M06` (C6/F-M06-4) and `DR-M09` (C3): each names a **non-prose** control — failure mode + machine-checkable check + enforcement point (payload gate + adversarial grading fixture for M06; post-lapse savings-floor invariant + leech-trigger provenance gate for M09), values deferred to `LINK-I2` without making the control prose-only. `DR-M07` is **not** learning-critical and carries the explicit not-applicable rationale.
- **Framework applied where material.** `DR-M07` staged resolution and `DR-M09` measured resolution each cite dual-goal evidence and satisfy the no-third-exit rule; `DR-M06` carries an immateriality certificate (T1 fails) for the exposure-existence decision, with the timing sub-dial recorded as latent. No silent single-goal optimization.
- **Untouched (not owned):** the §CONFLICTS rows (C1–C6 stay `unresolved` · non-downgradable — reconciliation is `INC-I3`, NEU-923), the §GAPS rows, the framing rows, and every non-§C-FBK cluster row. Reconciliation against the coded roadblock/retry/leech flow is **out of scope** (NEU-923). No `F-*` re-classed; no gap filled with an invented value. **PASS.**

## §SELF-CHECK-922 — NEU-922 update (integrative operational mastery model)

NEU-922 authored the integrative operational mastery model (`../mastery-model/00_operational-mastery-model.md`) and updated **only** its owned rows — the new **§C-MASTERY** section (mastery-model / `LINK-I2` rows) and this self-check:

- **`LINK-I2` bound, provisionally.** Every value the ten `DR-Mxx` deferred to `LINK-I2` now has a **provisional value, an explicit epistemic uncertainty band, an evidence class, and a named revision signal** (MM-T1…MM-T15; coverage check in the model §5). `LINK-I2` moves from UNBOUND to bound-`provisional`. **Nothing is `settled`/`accepted`** — class-7 absent, `INC-I1` (DP) open. **PASS.**
- **No conflict resolved.** C1 (progression, MM-T8) and C4 (assessment, MM-T4/T5) receive *target* bars only; both stay `unresolved`·non-downgradable in §CONFLICTS — the live-rule reconciliation verdict (`INC-I3`) remains NEU-923's. Supplying a provisional target is the mastery-model's chartered job (DR-M10/M08 deferred it here), not adjudication. **PASS.**
- **No `DR-Mxx` invariant contradicted.** The model reuses each DR's mastery-signal *shape* verbatim and only composes them + calibrates values; it honors the DR-M10 durability-gate invariant (multi-observation, not `repetitions>0`), the DR-M04 inter-session gate, and the DR-M08 deterministic grade mapper (model §6 cross-check). **PASS.**
- **No external validity; population validity UNEARNED.** Every value is class-1 convention or class-2 default transported into the **unmeasured** DP domain; no class-7 is invoked; the standing validity firewall is stated explicitly (model §2). **PASS.**
- **No invented value laundered.** Provisional numbers are labeled provisional and tied to their class-1/2 basis or to an open gap (G5/G6/G7) with a widened band — none asserted as measured or DP-established (OC-5). **PASS.**
- **Untouched (not owned):** every §C-ACQ/PRAC/FBK/ASSESS/FRAME mechanism row, all §CONFLICTS rows (C1–C6 unchanged), and all §GAPS rows. No `F-*` re-classed. **PASS.**

---

## §RECON — Reconciliation verdicts (NEU-923, `INC-I3`) · owner NEU-923

The live-rule reconciliation of the target model against the coded Second Memory behavior. Artifact: `../reconciliation/00_conflict-register.md` (per-mechanism M01–M10, thresholds MM-T1…MM-T15, and conflicts C1–C6, each with an alignment/gap/conflict verdict read directly from source as a class-2 compatibility fact). **Discharges `INC-I3` (the reconciliation was performed); resolves no conflict** — resolution requires the implementation charter to install the DR-specified controls. No source file modified; no MM-T value invented; nothing flipped to `settled`/`accepted`.

| Element | Live-code verdict | Dec. status | INC / blocker | Owner | Note |
| --- | --- | --- | --- | --- | --- |
| **C1 live-rule verdict** (M10 progression) | **CONFIRMED GAP** | **unresolved** · non-downgradable | `INC-I3` ✓ bound → register | NEU-923 | Audit `repetitions>0` **corrected** (F-M01-6/F-M10-5 stale): live gate is retrievability-reteach at 0.5, below the durability bar, **no fail-closed unlock lock**. Control = `DR-M10`. Not adopted; not resolved. |
| **C2 live-rule verdict** (M03/M04) | **CONFIRMED GAP** | **unresolved** · non-downgradable | `INC-I3` ✓ bound → register | NEU-923 | No non-massed/inter-session exclusion in the mastery aggregate. Controls = `DR-M03` (massed exclusion) + `DR-M04` (inter-session gate). Not resolved. |
| **C3 live-rule verdict** (M09 lapse) | **CONFIRMED CONFLICT** | **unresolved** · non-downgradable | `INC-I3` ✓ bound → register | NEU-923 | Lapse **fully resets** (`reps→0`, `interval→1d`), **no savings floor** (`sr-calculator.ts:92–96`). Control = `DR-M09` savings-floor invariant. Full-reset **not adopted**; not resolved. |
| **C4 live-rule verdict** (M08 assessment) | **CONFIRMED CONFLICT** | **unresolved** · non-downgradable | `INC-I3` ✓ bound → register | NEU-923 | Quality agent-supplied, downward session-cap only; no deterministic mapper / adversarial fixture / rebuttal-invariance; assessment binary-collapses. Control = `DR-M08`. Not adopted; not resolved. |
| **C5 live-rule verdict** (M05 interleaving) | **CONFIRMED CONFLICT** | **unresolved** | `INC-I3` ✓ bound → register | NEU-923 | Live axis is **difficulty** (`easy-medium-hard`); target is **category**. Not LC → no non-prose control mandated (`DR-M05`). Not adopted; not resolved. |
| **C6 live-rule verdict** (M06 feedback) | **CONFIRMED GAP** | **unresolved** | `INC-I3` ✓ bound → register | NEU-923 | No correct-answer-exposure outcome gate after terminal failure. Control = `DR-M06`. Not resolved. |
| **Mechanism verdicts M01–M10** | ALIGNMENT ×2 (M01, M07) · GAP ×5 (M02, M03, M04, M06, M10) · CONFLICT ×3 (M05, M08, M09-lapse) | **provisional** (record) | `INC-I3` ✓ bound → register · `INC-I1` (DP) open | NEU-923 | Full per-mechanism table in register §5. Class-2 compatibility facts only; no DP effectiveness claimed. |
| **Threshold verdicts MM-T1…MM-T15** | ALIGNMENT ×2 (MM-T3, MM-T9) · CONFLICT ×2 (MM-T5, MM-T14) · GAP/mixed ×11 | **provisional** (record) | `INC-I3` ✓ bound → register · `INC-I1` (DP) open | NEU-923 | Register §6. No MM-T value resolved or invented (`OC-5`). |

## §SELF-CHECK-923 — NEU-923 update (reconciliation)

NEU-923 authored the reconciliation conflict register (`../reconciliation/00_conflict-register.md`) and updated **only** its owned rows — the C1/C4 §CONFLICTS blocker/verdict cells, the new **§RECON** section, and this self-check:

- **`INC-I3` discharged, no conflict resolved.** The register records a live-code verdict for all ten mechanisms, all fifteen thresholds, and all six conflicts, discharging `INC-I3` (the reconciliation *was performed*). C1 and C4 stay **`unresolved`·non-downgradable**; recording a confirmed live divergence corroborates severity and **never downgrades** it. Resolution routes to a later implementation charter (verdict ≠ fix). **PASS.**
- **Verified against live code, not the audit.** Prerequisite gating **corrected** to retrievability-reteach (not `repetitions>0`; F-M01-6/F-M10-5 stale); lapse full reset **confirmed** (`sr-calculator.ts:92–96`); LLM over-validation **confirmed** (agent-supplied quality). F-M09-5's "`leechFailureThreshold=6` dead code" **corrected** — the `6` is a live lifetime-attempts floor (`sr-calculator.ts:215–229`). No `F-*` re-classed; corrections recorded as live-code facts, not re-classifications. **PASS.**
- **No contradicted behavior silently adopted.** Every GAP/CONFLICT marks the coded behavior **not adopted** and states the required target + (for C1/C2/C3/C4/C6) a non-prose enforceable control owned by the relevant `DR-Mxx`. This register **invents no new control**. **PASS.**
- **No code modified; no value invented; nothing settled.** Zero source files changed; no MM-T value invented (`OC-5`); no status is `settled`/`accepted`; DP transfer stays provisional (`INC-I1` open). **PASS.**
- **Untouched (not owned):** every mechanism decision row (§C-ACQ/PRAC/FBK/ASSESS/FRAME), §C-MASTERY, the §CONFLICTS severities and C2/C3/C5/C6 status cells (their reconciliation verdicts are recorded in §RECON without flipping their §CONFLICTS Dec. status), and all §GAPS rows. **PASS.**

---

## §EXP — In-charter experiment evidence (NEU-924) · owner NEU-924

The targeted experiments for materially inconclusive decisions. Inventory/ranking/cap: `../experiments/00_experiment-inventory-and-ranking.md`; deferral register (dogfooding-unavailable, cap-overflow, untestable): `../experiments/07_deferral-register.md`. **Attaches evidence only — flips no decision status, resolves no conflict** (nothing here is adjudication; NEU-925 drives the ledger). Exactly **six** non-deferrable-vehicle experiments ran in-session (the cap), ranked by charter-risk severity then decision order; every result is class-4/5, never presented as external validation.

| Experiment | Decision · conflict | Vehicle (class) | Result | Evidence / record |
| --- | --- | --- | --- | --- |
| **EXP-01** | M03 · C2 (HIGH·LC) | AI review (4) | 2/2 independent verdicts `supports` — massed-exclusion control **needed** (live aggregate counts same-session re-recalls, zero exclusion) and **implementable** (enforcement point identified with data in scope) | F-EXP-01 → `../experiments/01_…` |
| **EXP-02** | M04 · C2 (HIGH·LC) | Automated-eval (5) | 6/6 oracle ×2 runs — live counter advances on every same-instant success; no session identity anywhere in the signal contract; C2 GAP dynamically confirmed | F-EXP-02 → `../experiments/02_…` |
| **EXP-03** | M08 · C4 (HIGH·LC) | Automated-eval (5) | 12/12 oracle ×2 runs — deterministic mapper satisfying MM-T6 rebuttal-invariance, no binary collapse, fail-closed is **mechanically realizable**; control not prose-only | F-EXP-03 → `../experiments/03_…` |
| **EXP-04** | M09 · C3 (HIGH·LC) | Automated-eval (5) | 9/9 oracle ×2 runs — full reset at every prior depth (MM-T14 floor violated 5/5 applicable); leech lifetime floor live (L3 re-verified dynamically); C3 CONFLICT confirmed across full breadth | F-EXP-04 → `../experiments/04_…` |
| **EXP-05** | M10 · C1 (HIGH·LC) | Automated-eval (5) | 7/7 oracle ×2 runs — single-success/zero-review prerequisite passes (fail-open); live boundary at R=0.5, no action in [0.5, 0.90); no lock field in the gate contract; C1 GAP verified on executed behavior | F-EXP-05 → `../experiments/05_…` |
| **EXP-06** | M06 · C6 (MED-HIGH·LC) | AI review (4) | 2/2 independent verdicts `supports` — outcome gate **absent** live (free-text feedback only) and **implementable** at the terminal-failure/outcome-persistence sites | F-EXP-06 → `../experiments/06_…` |
| *deferred* | M01, M02, M05 (ordering), M07, MM-T value calibrations · R1/G1 transfer (all) | creator dogfooding — **creator unavailable this run** (Assumption #10) | defer-and-mark-provisional with explicit revision triggers — the "ships without dogfooding evidence" list | `../experiments/07_…` §1 (D-1…D-6) |
| *deferred* | M05 (axis characterization), M09 (`resolve_leech` path) | AI review / automated-eval — **beyond the six-item cap** | same defer-and-mark-provisional discipline, symmetric to dogfooding deferral | `../experiments/07_…` §2 (O-1/O-2) |

## §SELF-CHECK-924 — NEU-924 update (in-charter experiments)

NEU-924 authored the experiments package (`../experiments/00_…`–`07_…`) and updated **only** its owned rows — the new **§EXP** section, the six experiment-affected **Ev. status** cells (appending the class-4/5 finding ids F-EXP-01…06; no Dec. status cell touched), the register §EXP block (`../traceability/01_…`), and this self-check:

- **Only materially inconclusive points experimented.** Each experiment cites the DR residual / MM-T band / reconciliation verdict it reduces; settled contested points (M01 ordering ALIGNMENT, M07 shape ALIGNMENT, M05 axis choice, MM-T3 floor) got **no** experiment. **PASS.**
- **Cap honored; ranking recorded.** Exactly six non-deferrable-vehicle executions (4 automated-eval + 2 AI review), ranked HIGH·LC conflicts first (C2 M03/M04, C4 M08, C3 M09, C1 M10) then C6, with the 7th-ranked (C5) deferred as cap overflow. **PASS.**
- **Protocols followed.** AI reviews: ≥2 separately-initialized reviewers per experiment, identical context packages, initial verdicts committed before any cross-exposure, conditions recorded (AIR fields), closed verdict set — both unanimous, none `conflicted`. Automated-evals: versioned frozen case sets, explicit per-case oracles, recorded ENV + CCR evidence, ≥2 isolated repeats each, results read from process output. **PASS.**
- **Deferral discipline.** Every dogfooding-vehicle experiment defers (creator unavailable — Assumption #10) with its decision marked provisional + explicit revision trigger; cap-overflow items defer symmetrically; the charter did not block on creator availability. **PASS.**
- **Evidence discipline.** Every result labeled class 4/5; none presented as external-user/expert/market validation; no raw operational-log payload touched (no class-6 source accessed); no MM-T value invented or calibrated; no source file modified; experiment fixtures are throwaway evidence artifacts, not product code. **PASS.**
- **Nothing settled.** All six experimented decisions remain `provisional`; C1–C6 remain `unresolved` (C1–C4 non-downgradable); template criteria for `settled` are unmet everywhere (class-7 absent, INC-I1 open). **PASS.**
- **Untouched (not owned):** every Dec. status cell, all §CONFLICTS/§GAPS/§RECON/§C-MASTERY/§C-FRAME rows, all other tasks' self-checks. No `F-*` re-classed. **PASS.**
