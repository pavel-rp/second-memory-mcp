# DR-M04 — Spacing (Distributed Practice)

- **Record id / mechanism:** DR-M04 · Spacing / distributed practice · cluster §C-PRAC · author NEU-919 · 2026-07-13
- **Learning-critical:** yes  (source: synthesis **C2** HIGH — the massed-vs-spaced recovery gate corrupts the scheduling signal, F-M04-2/6; template §3)

## Decision (observable behavior)

A concept or problem type **returns for review across separated sessions**, not massed within one, and the mastery/scheduling signal treats a correct recall as spaced-criterion evidence **only when it occurs in a session separated from the prior counted recall of that item**. Between-session forgetting is deliberately allowed to accrue so the next retrieval is harder and more potent. **Observable:** (a) a reviewer/test can watch that the spaced-criterion counter for a chunk advances at most once per session — a burst of correct recalls inside one session does not satisfy it; (b) a same-session massed recovery (roadblock follow-up) is recorded but is **not** treated as equivalent to a spaced criterion recall for progression/scheduling. The review interval **expands as a function of successful spaced recall** rather than by a fixed massed cadence (the interval algorithm itself is NEU-923; this record fixes only that spacing is signal-gated across sessions).

## Cited evidence + class

- F-M04-1 [class 1, causal — large meta-analysis, 317 experiments] — distributed practice is top-tier utility on an exceptionally large base; grounds "return across separated sessions" as the default.
- F-M04-2 [class 1, causal — direct comparison] — spaced correct recalls **68%** vs same-session massed **26%** retention; the causal basis for the spaced-criterion gate and for excluding massed recoveries (C2).
- F-M04-3 [class 1, causal/definitional] — successive relearning: practice to criterion, then again in **other spaced sessions**; grounds the across-sessions criterion structure (exact per-session count is G6, not asserted).
- F-DD-2 [class 1, mechanistic] — difficulty that depresses immediate performance is where durable gain sits; supports the **contest-speed side** of the durable-vs-speed resolution (directional: massing buys immediate fluency).
- F-M04-4 [class 1/2, large **observational** benchmark] — FSRS calibration superiority over SM-2; cited **only** as a calibration/observational fact, **not** as a causal retention-gain claim and **not** as a scheduler-choice decision (that is NEU-923).
- F-M04-6 [class 2, code-fact] — *compatibility only*: the current roadblock gate requires same-session massed follow-ups (the inferior 26% condition). Cited for what exists, **not** as endorsement; it is the failure the control targets.
- F-M04-5 [class 2, code-fact] — *compatibility only*: current modified-SM-2 has no fuzz/jitter and fits no per-item stability; cited as context, materiality verdict deferred to reconciliation/NEU-923.

## Mastery signal

Observable signal: the learner **recalls the item correctly at criterion across ≥1 separated (spaced) session** — a spaced successive-relearning trajectory, not a single-session burst. The **calibrated number of spaced sessions / interval schedule is UNRESOLVED → LINK-I2** (mastery-model sub-task) and the interval math is NEU-923; F-M04-3 notes "no benefit beyond ~3, typically 1 per session" but the exact count is **G6** and is **not** fixed here. Signal shape (spaced across sessions) fixed; number deferred.

## Constraints

- **Cognitive-load / desirable-difficulty:** spacing is a **desirable difficulty** — this decision deliberately **preserves the between-session forgetting** that makes the next retrieval harder and more potent (F-M04-2, links to F-M03-4). It does **not** raise intrinsic load within a session; its managed cost is scheduling complexity and the risk of spacing so wide the retrieval fails outright (the accomplishable-difficulty bound, F-DD-1). No extraneous load is added.
- **Durable-vs-speed resolution (framework §2–4): MATERIAL → measured.** T1 PASS: widening the spacing interval increases durability (F-M04-1/2) but lowers immediate throughput/fluency (massing feels faster, F-DD-2); opposite-sign gradients on the interval dial. T2 PASS (asymmetric): durable side causal (F-M04-1/2), speed side directional (F-DD-2). T3 PASS: durable serves learning, speed serves contest. **Resolution = measured** (§3.3 branch 2): the interval is weighted per item by a continuous **retrievability/successful-spaced-recall signal** — it expands as spaced recall succeeds, contracts on lapse — rather than a fixed cadence. Dual-goal evidence: durable F-M04-1/2; speed F-DD-2. Signal observable; calibrated schedule → LINK-I2 / NEU-923. Recorded (A) resolution — **no third exit**.
- **Privacy gate:** no class-6 signal used.
- **Caps / conflicts not to contradict:** **C2** (spacing signal must be across-session, not massed — the enforceable control). No SM-2-vs-FSRS scheduler choice and no lapse-reset (C3) decision is made here (NEU-923 / M09-NEU-920).

## Uncertainty

- **DP-transfer:** INC-I1 — spacing effects are robust for retention across materials but **unmeasured on DP problem-solving transfer**; retention-optimised spacing may not produce transfer (F-M04-1 limitation, F-TR-2/3). DP effectiveness **provisional**.
- **Gaps provisional-on:** G1 (DP transfer, controlling); **G6** (exact spaced-criterion / recovery counts unsupported by evidence — the number stays UNRESOLVED → LINK-I2); optimal inter-study interval was not independently pulled (F-M04-1 limitation) and is not asserted.
- This decision is **provisional**; no spacing effect is presented as established for DP.

## Rejected alternative

- **Fixed same-session massed criterion (e.g. 3 correct recalls in one sitting) as the progression signal** — rejected: F-M04-2 shows this is the structurally inferior condition (26% vs 68%) and F-M04-6 shows the current gate does exactly this, inflating the scheduling signal (C2). This is the failure the control prevents.
- **Treating a same-session massed recovery as equivalent to a spaced criterion recall** — rejected on the same F-M04-2/3 basis: successive relearning requires the correct recalls to fall in *other spaced sessions*.

## Enforceable control   (REQUIRED — learning-critical)

- **Failure mode prevented:** C2 (F-M04-2, F-M04-6) — the recovery/progression gate treats same-session massed correct recalls as equivalent to spaced criterion recalls, so progression/scheduling fires on the inferior (26%) condition, corrupting the retention signal.
- **Mechanical check (deterministic inter-session gate):** the spaced-criterion counter for a chunk advances **only if** the current correct recall's `session_id` differs from the previous counted recall's `session_id` for that chunk (an inter-session monotonicity invariant, deterministically derived — not model-judged). A held-out test asserts that **N same-session correct recalls do not satisfy the spaced-criterion gate**, and that a massed recovery is tagged non-spaced. The required number of spaced sessions is `UNRESOLVED → LINK-I2`; the *gate shape* (different session required) needs no calibrated constant.
- **Enforcement point:** the progression/scheduling gate — specified as a runtime invariant plus a CI/integration test over the criterion-counter input; the SM-2 interval computation that consumes the gated signal is owned by NEU-923. A gate that advances on same-session recalls is detectable by the test.

## Traceability back-links

- Register findings consumed: F-M04-1, F-M04-2, F-M04-3, F-M04-4, F-M04-5, F-M04-6, F-DD-2.
- Conflicts addressed: **C2** (enforceable control). C3 (lapse reset) referenced as not-to-contradict; owned by M09/NEU-920 + reconciliation.
- INC markers carried: INC-I1 (DP transfer, open); INC-I3 (F-M04-5/6 reconciliation verdict, deferred to reconciliation/NEU-923).
- LINK slots bound: **LINK-I1 = this DR (DR-M04)**; **LINK-I2 = mastery-signal contract (spaced-session count / interval schedule, UNBOUND — mastery-model sub-task)**.

## Ledger status

- **provisional** — mirrored into `../adjudication/01_…` §C-PRAC (M04 row). Empirical (class-1/2) evidence only; the C2 severity floor is non-downgradable; `settled`/`accepted` forbidden by the inherited firewall.
