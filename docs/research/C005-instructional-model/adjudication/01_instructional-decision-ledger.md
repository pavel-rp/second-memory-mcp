# Instructional Decision Ledger (skeleton — NEU-887 adjudication ledger, extended)

**Task:** NEU-916 · **Compiled:** 2026-07-13 · **Method / discipline:** `00_adjudication-extension-method.md` · **Extends** `../../C005-product-foundation/adjudication/03_decision-status-register.md` (NEU-906). **Register:** `../traceability/01_instructional-evidence-register.md`.

The mutable-status ledger for instructional decisions. **Seeded, not driven:** NEU-916 sets each row's *initial* status per the seeding rule (`00_…` §4) and flips **nothing** to `settled`/`accepted`. Every mechanism, conflict, and gap carries a status ∈ {`settled`(=`accepted`, none here) / `provisional` / `unresolved`} and a **named owner**, so zero elements are unadjudicated-but-counted. Statuses move only in this ledger, on correctly-classed evidence, when a compliant `DR-Mxx` (`../decision-records/00_…`) is authored.

Sections are delimited per cluster so downstream siblings update their own block without colliding.

Legend: **Dec. status** = mutable decision status. **Ev. status** = evidence status (the `F-*` behind it). `INC-I#` = missing-artifact marker. All rows below are seeded `unresolved`/`provisional`; **none is `settled`.**

---

## §C-ACQ — Acquisition / sequencing cluster · owner NEU-918

| Element | Ev. status (findings) | Dec. status | INC / blocker | Owner | Note |
| --- | --- | --- | --- | --- | --- |
| **M01 Sequencing** (decision) | provisional (F-M01-1…4 directional; F-M01-5/6 code) | **unresolved** | INC-I2 (no `DR-M01`) · INC-I1 (DP) | NEU-918 | Not learning-critical; DR must still carry CL-framing + rejected alt. |
| **M02 Worked examples** (decision) | provisional (F-M02-1/3/4 causal; F-M02-2 magnitude UNVERIFIED) | **unresolved** | INC-I2 (no `DR-M02`) · INC-I1 (DP) · G4 | NEU-918 | Not learning-critical. |

## §C-PRAC — Practice / review cluster · owner NEU-919

| Element | Ev. status (findings) | Dec. status | INC / blocker | Owner | Note |
| --- | --- | --- | --- | --- | --- |
| **M03 Retrieval** (decision) | provisional (F-M03-1…4 causal; F-M03-5 code) | **unresolved** | INC-I2 (no `DR-M03`) · INC-I1 (DP) | NEU-919 | **Learning-critical (C2):** DR requires a non-prose enforceable control on the roadblock/massed-recall gate. |
| **M04 Spacing** (decision) | provisional (F-M04-1/2/3 causal; F-M04-4 observational; F-M04-5/6 code) | **unresolved** | INC-I2 (no `DR-M04`) · INC-I1 (DP) | NEU-919 | **Learning-critical (C2):** enforceable control required. |
| **M05 Interleaving** (decision) | provisional (F-M05-1/2/4 causal; F-M05-3 absence; F-M05-5 code) | **unresolved** | INC-I2 (no `DR-M05`) · INC-I1 (DP) | NEU-919 | Not learning-critical (C5 MEDIUM). |

## §C-FBK — Feedback / struggle / remediation cluster · owner NEU-920

| Element | Ev. status (findings) | Dec. status | INC / blocker | Owner | Note |
| --- | --- | --- | --- | --- | --- |
| **M06 Feedback** (decision) | provisional (F-M06-1/2/3 causal; F-M06-4 empirical; F-M06-5 code) | **unresolved** | INC-I2 (no `DR-M06`) · INC-I1 (DP) | NEU-920 | **Learning-critical (C6/F-M06-4):** enforceable control required on AI-delivered diagnosis. |
| **M07 Productive struggle** (decision) | provisional (F-M07-1/3 causal; F-M07-2/4 principle; F-M07-5 code) | **unresolved** | INC-I2 (no `DR-M07`) · INC-I1 (DP) · G6 | NEU-920 | Not learning-critical; coupled to M06. |
| **M09 Remediation** (decision) | provisional (F-M09-1/2 practice; F-M09-3/4 causal; F-M09-5 code) | **unresolved** | INC-I2 (no `DR-M09`) · INC-I1 (DP) · G6 | NEU-920 | **Learning-critical (C3):** enforceable control required on lapse-reset vs. savings. |

## §C-ASSESS — Assessment / progression cluster · owner NEU-921

| Element | Ev. status (findings) | Dec. status | INC / blocker | Owner | Note |
| --- | --- | --- | --- | --- | --- |
| **M08 Assessment** (decision) | provisional (F-M08-1 spec; F-M08-2/3/4 empirical; F-M08-5 code) | **unresolved** | INC-I2 (no `DR-M08`) · INC-I1 (DP) · G7 | NEU-921 | **Learning-critical (C4, HIGH):** enforceable control required beyond prose (LLM over-validation). |
| **M10 Progression** (decision) | provisional (F-M10-1/3 framework; F-M10-2 convention; F-M10-4 methodological; F-M10-5 code) | **unresolved** | INC-I2 (no `DR-M10`) · INC-I1 (DP) | NEU-921 | **Learning-critical (C1, HIGH):** enforceable control required on the mastery gate. Mastery signal/threshold owned by mastery-model sub-task (`LINK-I2`). |

## §C-FRAME — Cross-cutting framework · owner NEU-917

| Element | Ev. status (findings) | Dec. status | INC / blocker | Owner | Note |
| --- | --- | --- | --- | --- | --- |
| **Cognitive-load framing** | provisional (F-CL-1/2 theoretical) | **unresolved** | INC-I4 · G8 (capacity precision) | NEU-917 | Framing is evidence; the framework decision is NEU-917's. |
| **Desirable-difficulty framing** | provisional (F-DD-1/2/3) | **unresolved** | INC-I4 · INC-I1 | NEU-917 | Accomplishable-band boundary unmeasured for DP. |
| **Durable-mastery-vs-contest-speed** | provisional (F-TR-1/2/3 transfer) | **provisional** | INC-I4 ✓ bound → `../framework/00_durable-vs-speed-framework.md` · INC-I1 (DP) still open | NEU-917 | NEU-888 OUT-3. **Framework authored** (`../framework/00_…`): material-tension triggers T1–T3, staged-vs-measured logic, dual-goal evidence requirement, no-third-exit invariant, and adversarial self-review (no silent single-goal exit — PASS). Per-mechanism resolutions remain downstream (NEU-918…921). **Not settled.** |
| **↳ M05 durable-vs-speed walkthrough** (illustrative) | provisional (durable F-M05-1/2 causal; speed F-M05-4/F-DD-2 directional) | **provisional** | INC-I1 (DP) · F-M05-2 blocking-first UNVERIFIED · gate value → LINK-I2 | NEU-917 (demo) → NEU-919 (binding) | Staged resolution (per-technique fluency gate → interleaved consolidation), **provisional pending creator walkthrough** (Assumption #10). Revision trigger: (a) creator validates/rejects the blocking-first ordering; (b) in-domain DP measurement lands (INC-I1/G1); (c) NEU-919 authors `DR-M05`, which supersedes this. Illustrative only — does **not** author `DR-M05`, settle M05, or touch §C-PRAC. |

---

## §CONFLICTS — Reconciliation conflict register (from `../03_synthesis.md` §2)

Each `[literature]`-vs-`[code-evidence]` conflict, seeded `unresolved` pending the reconciliation verdict (`INC-I3`). **HIGH conflicts are non-downgradable** (`00_…` §3.4). No conflict is resolved by NEU-916.

| Conflict | Severity | Dec. status | Blocker | Owner | Evidence |
| --- | --- | --- | --- | --- | --- |
| **C1** Prerequisite mastery gate (`repetitions>0` vs high/probabilistic bar; characterization flagged stale) | HIGH | **unresolved** · non-downgradable | INC-I3 (live-rule re-verify) | reconciliation + mastery-model | F-M01-6, F-M10-5, F-M10-1/2 |
| **C2** Roadblock recovery = same-session massed (26% vs 68% spaced) | HIGH | **unresolved** · non-downgradable | INC-I3 | mechanism-decision (M03/M04) + reconciliation | F-M04-2/6, F-M09-4 |
| **C3** Lapse full reset vs. savings (repetitions→0 vs FSRS caps-not-zeros) | HIGH | **unresolved** · non-downgradable | INC-I3 | reconciliation | F-M09-3/5 |
| **C4** Assessment fidelity (LLM over-validation; session cap misses uniform leniency) — **learning-critical** | HIGH | **unresolved** · non-downgradable | INC-I3 · needs enforceable control (`DR-M08`) | reconciliation + mastery-model | F-M08-1/3/5 |
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
