# Decisions Shipping Without Evidence — dogfooding-deferred and cap-overflow-deferred

- **Program:** C005 · **Umbrella:** NEU-888 (OUT-7) · **Task:** NEU-925 · **Compiled:** 2026-07-13
- **Status: provisional. This file settles nothing and flips nothing.** It is the package's single, standalone statement of *which* binding decisions ship **without** their strongest experiment evidence, *why*, and *what would revise them*. It re-presents — it does not re-decide — the NEU-924 deferral register (`../experiments/07_deferral-register.md`), binding each deferral to its ledger row.

---

## Why this file exists (acceptance scenarios 2 and 3)

The spec requires the package to state **symmetrically**:

1. Which mechanism decisions ship **without dogfooding evidence**, because their creator-dogfooding experiment was deferred for **creator unavailability** (charter Assumption #10 — the creator is not available inside this autonomous run); and
2. Which mechanism decisions ship **without cap-covered non-deferrable-vehicle experiment evidence**, because their experiment was deferred for **six-item cap overflow** (NEU-924 / OUT-6 risk-ranked cap discipline).

Each such decision is **already `provisional`** in the adjudication ledger; deferral neither downgrades nor upgrades it. What this file adds is the **explicit named list** and, for every entry, the **revision trigger** that would move the decision off its provisional footing. A cold-context downstream agent can therefore tell, per decision, exactly *what is missing* and *what would fill it* — without reading the experiment sub-task.

**The controlling caveat first.** The single largest missing evidence is not any one mechanism's — it is the **DP-transfer risk itself** (`INC-I1` / R1 / G1): every mechanism's effect is **unmeasured in the dynamic-programming domain**, and no smaller vehicle than in-domain dogfooding/production measurement can reduce a transfer claim. That is why the whole package is `provisional` and why no decision is `settled`.

---

## §A — Ships WITHOUT dogfooding evidence (creator-unavailable deferrals: D-1…D-6)

Every decision whose smallest sufficient vehicle for its **residual** uncertainty is **creator dogfooding / in-domain measurement**. The executed experiments (F-EXP-01…06) tested the *shape / enforceability / live-divergence* side of several of these; the residual left here is the **in-domain effectiveness/calibration half**, which no non-dogfooding vehicle reaches.

| # | Decision / element (ledger row) | What ships without dogfooding evidence | Ledger status | Explicit revision trigger |
| --- | --- | --- | --- | --- |
| **D-1** | **DP transfer — all ten mechanisms + every durable-vs-speed resolution** (§GAPS G1; §CONFLICTS `INC-I1` on every row) | Whether *any* mechanism effect appears in the DP domain at all — the controlling transfer claim | provisional · non-downgradable | Creator dogfooding of representative DP benchmark journeys (`../../C005-product-foundation/benchmark-suite/03_creator-dogfooding-protocol.md`, ≥2 runs/journey, `OBS-*` records), **or** production DP measurement lands (`INC-I1`/G1 close path). Until then no external or population validity is claimed. |
| **D-2** | **M01 Sequencing** (§C-ACQ) | DP-ordering-vs-transfer effectiveness; the demonstrated-competence threshold (MM-T9) | provisional | In-domain DP-ordering-vs-transfer measurement; jointly bounded with MM-T8/T9 calibration |
| **D-3** | **M02 Worked examples** (§C-ACQ) | Fade calibration + per-learner expertise proxy (MM-T10) | provisional | DP fading measurement / expertise-signal calibration (MM-T10 revision signal). G4 magnitude re-fetch is out-of-caps, not a vehicle |
| **D-4** | **M05 Interleaving** (§C-PRAC) | Blocking-first-for-novices ordering (F-M05-2 **UNVERIFIED**); the framework §6 staged walkthrough | provisional | (a) Creator walkthrough validates/rejects the blocking-first ordering — the vehicle **named by the framework artifact itself** (§6 primary revision trigger); (b) in-domain DP interleaving measurement (`INC-I1`/G1) |
| **D-5** | **M07 Productive struggle** (§C-FBK) | Accomplishable-band boundary for DP; attempt count "2" (G6) | provisional | In-domain band / attempt-count measurement (G6 evidence) |
| **D-6** | **Mastery-model value calibrations** (§C-MASTERY, MM-T1/T2/T4/T5/T8/T11/T12/T13/T14) | The calibrated numbers behind every deferred `LINK-I2` value (K, S, agreement/over-validation rates, durability bar, fluency/discrimination/leech counts, savings-floor coefficient) | provisional, banded | Each MM-T row's own named revision signal (in-domain retention curve, grading-fixture measurement, leech rate, relearning-savings measurement, …); bands hold until then |

**Reading D-1 correctly.** D-1 is not a seventh mechanism — it is the transfer claim that sits under **all ten**. It is ranked first among all materially inconclusive items and is deferred **not** because of the six-item cap but because **no smaller vehicle can reduce a transfer claim**. Every mechanism decision therefore inherits D-1 as its controlling open evidence, over and above its own row above.

---

## §B — Ships WITHOUT cap-covered experiment evidence (six-item cap-overflow deferrals: O-1, O-2)

The cap on non-deferrable-vehicle (AI-review / automated-eval) executions is **six per session**; exactly six ran (F-EXP-01…06), ranked HIGH·learning-critical conflicts first (C2 M03/M04, C4 M08, C3 M09, C1 M10) then C6. The following candidates ranked **below the cap** and defer under the **same** discipline — symmetric to §A, satisfying acceptance scenario 3.

| # | Decision / element (ledger row) | Deferred experiment (non-deferrable vehicle) | Rank vs cap | Ledger status | Explicit revision trigger |
| --- | --- | --- | --- | --- | --- |
| **O-1** | **M05 Interleaving — axis-conflict characterization** (§C-PRAC; §CONFLICTS C5) | AI review (2 independent reviewers) of the live recommendation-composition path vs DR-M05: is the live `interleaveStrategy:'easy-medium-hard'` knob **actively conflicting** with, or merely **orthogonal** to, DR-M05's category-axis staging? | **7th of 7** (C5 MEDIUM — lowest severity tier) | provisional | A future experiment session runs the deferred AI review, **or** the implementation charter reconciles the difficulty-axis knob against DR-M05 (C5 closure path) |
| **O-2** | **M09 Remediation — leech reformulate-vs-suspend path** (§C-FBK; §CONFLICTS C3) | AI review or automated-eval of the `resolve_leech` tool path vs DR-M09 behavior 1 (outside both the reconciliation's authoritative file set and EXP-04's fixture scope) | **beyond cap** (sub-question of an already-experimented decision; C3-linked) | provisional | A future experiment session exercises `resolve_leech`, **or** the implementation charter installs/verifies the reformulation path (DR-M09 behavior 1) |

---

## §C — Materially inconclusive but untestable in-charter (no sufficient vehicle exists: U-1)

| # | Element (ledger row) | Why no vehicle suffices | Ledger status | Explicit revision trigger |
| --- | --- | --- | --- | --- |
| **U-1** | **MM-T15 contest-speed criterion** (§C-MASTERY; widest band 1.25–2×; G5) | Its validating evidence is **class-7 contest-outcome data**, which does not exist project-wide; no NEU-887 vehicle (including dogfooding) produces it in-charter | provisional, widest band | Contest-outcome data (class-7) lands; G5 pacing anchors. Until then Stage-2 speed criteria **never lower** any unlock bar (DR-M10 Stage-2 invariant) |

---

## §D — What this means for a downstream consumer

- **Nothing here is a hole in the package.** Every decision above is `provisional` with a **fixed observable behavior + (where learning-critical) an enforceable control** you can build against today (see `00_per-mechanism-index.md`). What is deferred is the **calibrated value** and the **in-domain effectiveness confirmation**, never the decision's shape.
- **Symmetry is the point.** §A (dogfooding-unavailable) and §B (cap-overflow) are treated identically: named, marked provisional, given a revision trigger. Neither class of deferral blocked the charter.
- **The firewall holds.** No decision here is presented as validated. Class-7 evidence is absent project-wide; population validity is UNEARNED; DP effectiveness is unmeasured. These are the standing conditions under which the whole package ships.

**Self-check.** Every entry names its decision, its missing evidence, its ledger status (provisional), and an explicit revision trigger; §A is the complete "ships without dogfooding evidence" list (D-1…D-6); §B is the symmetric cap-overflow list (O-1, O-2); §C is the untestable residue (U-1). No entry flips a status, invents a value, or claims external validity. Mirrors `../experiments/07_deferral-register.md` §1–§4. **PASS.**
