# DR-M10 — Progression (mastery gating & advancement)

- **Record id / mechanism:** DR-M10 · M10 Progression · cluster §C-ASSESS · author NEU-921 · 2026-07-13
- **Learning-critical:** yes  (source: synthesis **C1** HIGH — the prerequisite mastery gate decides advancement; a corrupted/too-weak gate advances on a false signal; template §3 row M10)

## Decision (observable behavior)

A dependent concept is **not unlocked until the prerequisite's mastery signal crosses a durability gate**, and the gate is evaluated **server-side from persisted multi-observation review history** — never from a single success, a client-supplied flag, or an in-session performance spike. Concretely observable:

- Given a prerequisite with only **one success ever** (`repetitions == 1`) and a mastery signal below the bar, a reviewer can watch the dependent stay **locked** — `teach_next` / unlock does not surface it.
- Given a prerequisite whose persisted retrieval history clears the bar, the dependent **unlocks**, and the unlock emits an **observable gate-decision** (which prerequisite, which signal value, gate pass) so the advance is auditable rather than implicit.
- **Speed alone never unlocks:** a fast-but-shallow prerequisite (low latency, thin retrieval history) does not satisfy the gate — the gate reads *durability*, not throughput.

## Durable-vs-speed resolution (framework `../framework/00_durable-vs-speed-framework.md`)

Progression exposes the **mastery-gate-strictness dial** — the paradigmatic curriculum-level durable-vs-speed case, so the framework's no-third-exit rule applies. **Material-tension certificate (T1∧T2∧T3):**

- **T1 — Opposing gradient: PASS.** Raising the gate (stricter mastery bar) **increases durable mastery** — dependents rest on genuinely-known prerequisites (F-M10-1 90% mastery bar; F-M10-2 BKT P≥0.95) — but **decreases contest throughput/speed**: more time gated per prerequisite slows breadth coverage, and a bar that demands durable schema forfeits the immediate-fluency shortcut (F-DD-2: lowering difficulty protects immediate success but forfeits the largest gain). Opposite-sign gradients on one dial.
- **T2 — Evidenced, non-negligible: PASS (asymmetric).** Durable side is framework/convention-grade (F-M10-1 quasi-experimental; F-M10-2 modeling convention); the speed-cost side is directional (F-DD-2 mechanistic). Evidenced both sides; the directional speed side feeds provisional status.
- **T3 — Both goals in-objective: PASS.** The fixed CP audience needs durable prerequisite mastery (unlock correctly) **and** contest speed/breadth (advance fast enough to cover the curriculum). The gate serves the *learning* goal; pacing serves the *contest* goal.

→ **Material.** Shape choice (§3.3): there **is** a defensible readiness ordering — contest speed built on an unmastered prerequisite is fragile (F-TR-2: retention/fluency ≠ transfer; a fast-but-shallow learner has no durable schema to be fast about) — and an **observable discrete gate signal** (prerequisite mastery signal crossing a bar) exists → **branch 1 → staged.**

- **Stage 1 — durability-first unlock:** the dependent unlocks only on the prerequisite's **durable** mastery signal (multi-session retrieval history ≥ bar). Gate **value = `UNRESOLVED → LINK-I2`** (mastery-model owns the number; the framework fixes the *shape*, not the constant).
- **Stage 2 — speed/fluency criterion is a *later* phase, never a *lower* unlock bar.** Contest speed is pursued after the durability gate clears; it may **not** be used to relax Stage 1.

Dual-goal evidence (§4.1): durable = F-M10-1/2; speed = F-DD-2 (with F-TR-2 for the fragility ordering). No silent single-goal optimisation.

## Mastery signal

Progression's objective is met when the prerequisite's mastery signal crosses the **durability bar**; observable as: *the dependent unlocks iff the prerequisite's persisted multi-session retrieval-history posterior/retrievability ≥ bar.* The **bar value is UNRESOLVED → LINK-I2** (mastery-model sub-task; `OC-5` no-invented-value — this record invents no 90% / 0.95). The signal's observable **shape** — multi-observation, server-evaluated, monotonic in the mastery signal — is fixed here; only the calibrated constant defers.

## Constraints

- **Cognitive-load / desirable-difficulty:** Progression **manages intrinsic load across the curriculum**: too low a bar advances before the prerequisite is genuinely known, so every downstream item inherits **excess intrinsic load** (an unmastered prerequisite makes the dependent harder). The gate **deliberately preserves desirable difficulty** — it does *not* lower the bar to buy immediate speed (that would forfeit durable schema). Where difficulty is **removed:** the bar must not be set impossibly high (over-practice trap, forfeiting the spaced desirable difficulty of re-meeting the prerequisite in context, M04) — but that upper-calibration is the mastery-model's number (`LINK-I2`), not invented here.
- **Privacy gate:** the gate reads per-learner review history (a within-account signal, not class-6 cross-user operational data); no aggregate-only class-6 signal is consumed, so the aggregate gate is not engaged.
- **Caps / conflicts not to contradict:** C1 (HIGH, non-downgradable) — this record supplies the enforceable control C1 requires and must not assert C1 *resolved* (reconciliation NEU-923 owns the live-rule verdict). The gate consumes the **assessment** signal, so it inherits the C4/DR-M08 dependency: a gate on a corrupted grade advances on a false signal — DR-M08's control is a precondition for this gate's integrity.

## Uncertainty

- **DP-transfer: INC-I1 / F-TR-3** — mastery thresholds (90%, P≥0.95) come from other domains/models; the defensible **DP** mastery bar — and whether a contest-speed/fluency criterion differs from a durable-understanding criterion — is **unmeasured** (F-TR-3, F-M10-4 false-precision-for-unmeasured-population). DP progression bar stays **provisional** pending in-domain dogfooding/production calibration (class-7 / mastery-model), which is where it settles.
- **Gaps provisional-on:** G1/INC-I1 (no DP measurement); G5 (session-length/daily-cap pacing numbers unanchored, relevant to the Stage-2 speed phase). The decision is **provisional**; it presents no DP mastery bar as established.

## Rejected alternative

- **Gate unlock on `repetitions > 0` (one success ever), the characterization in F-M10-5.** Rejected per C1 / F-M10-1 / F-M10-2: **Contradicted** by every mastery system checked — a single success is not durable mastery and advances dependents on a false signal (the highest-severity open conflict).
- **Fix a settled numeric bar now (e.g. 90% or P≥0.95).** Rejected per F-M10-4: a threshold set with **false precision for an unmeasured population** is a known failure mode; the bar needs an uncertainty band and a revision signal until calibrated — so the value is **deferred to LINK-I2**, not decided here (respects NEU-922 integration scope and the mastery-model's authority).
- **Speed/fluency-based unlock (advance when the learner is fast).** Rejected per F-TR-2 and the framework's staged ordering: fast-but-shallow has no durable schema to be fast about; using speed to unlock collapses the staged resolution into silent single-goal (contest-speed) optimisation.

## Enforceable control   (REQUIRED — learning-critical)

- **Failure mode prevented:** C1 / F-M10-5 (prerequisite gate too weak — `repetitions>0` advances on one success), compounded by C4 (a gate on an over-validated grade advances on a corrupted signal) — the class of failure a downstream reviewer cannot see from output alone.
- **Mechanical check (machine-checkable):**
  1. **Server-side gate invariant.** A deterministic predicate `isPrerequisiteSatisfied(prereq)` gates dependent exposure; it requires the prerequisite's mastery signal (derived from **persisted multi-session retrieval history**, not a single event and not a client flag) to be **≥ bar** (bar value `UNRESOLVED → LINK-I2`; the invariant's shape — multi-observation, server-evaluated, monotonic — is fixed now).
  2. **Fail-closed single-success regression test.** A test asserts a prerequisite at `repetitions == 1` (single success) **does not** satisfy the gate — pinning the gate closed against the C1 `repetitions>0` rule, independent of the calibrated bar.
  3. **Observable gate-decision assertion.** A test asserts each unlock emits an auditable gate-decision (prerequisite id, signal value, pass) so a silent/implicit advance is detectable.
- **Enforcement point:** the prerequisite-unlock path in `src/domain/algorithms/` (`resolve-stale-prerequisites.ts`, `classify-chunk.ts` — the retrievability-threshold gating flagged in F-M10-5), evaluated server-side; a unit test for the predicate plus a DB-backed integration test under `tests/integration/` asserting single-success does not unlock a dependent. Whether the *current* live rule already matches this required shape is the reconciliation verdict (NEU-923, C1/`INC-I3`) — required here is the control's **shape and enforcement point**, not confirmation the code conforms.

## Traceability back-links

- **Register findings consumed:** F-M10-1, F-M10-2, F-M10-3, F-M10-4, F-M10-5; framework/framing F-DD-2, F-TR-2, F-TR-3.
- **Conflicts addressed:** C1 (supplies its required enforceable control; does not mark it resolved — reconciliation owns closure). C4 carried as an inherited precondition (DR-M08).
- **INC markers carried:** INC-I1 (DP measurement, open); INC-I4 (durable-vs-speed framework, applied via `../framework/00_…`); INC-I2 discharged for M10 (this record now exists).
- **LINK slots:** **LINK-I1 = this DR (bound).** LINK-I2 = mastery-signal contract (the durability bar / uncertainty band) — **UNBOUND**, mastery-model sub-task. Cross-mechanism thresholds/decision rules across all ten mechanisms remain **NEU-922**; live-rule reconciliation remains **NEU-923** — neither pre-empted here.

## Ledger status

- **provisional** — mirrored into `../adjudication/01_instructional-decision-ledger.md` §C-ASSESS (M10 row). Empirical/convention decision on class-1/2 evidence with class-7 absent → at most `provisional`; **not** `settled`/`accepted`. C1 remains `unresolved`·non-downgradable in §CONFLICTS (not this record's to flip).
