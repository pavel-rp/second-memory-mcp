# DR-M09 — Remediation

- **Record id / mechanism:** DR-M09 · Remediation · cluster §C-FBK · author NEU-920 · 2026-07-13
- **Learning-critical:** yes  (source: synthesis **C3** (HIGH); template §3 — unconditional lapse reset discards real prior learning and corrupts the retention model)

## Decision (observable behavior)

Remediation has two observable behaviors:

1. **Leech intervention = reformulate/re-present, not suspend-only.** When an item persistently fails (crosses the leech threshold), the system triggers a **reformulation/re-presentation action** (change how the content is presented) rather than merely setting it aside. A reviewer or test can watch that a flagged leech emits a re-presentation action, not a silent suspend.
2. **Lapse handling = savings-preserving, not full reset.** When a previously-known item lapses (is forgotten), the system recomputes the next schedule as a **bounded function of prior stability** — penalized-but-floored — rather than unconditionally resetting `repetitions → 0, interval → 1d`. A reviewer or test can watch that a high-prior-stability item that lapses is rescheduled to an interval bounded *below by a savings floor derived from prior stability* and *above by the prior interval*, never collapsed to first-exposure.

Both are **observable/testable** (an action is emitted; a recomputed interval is bounded), not intentions.

## Cited evidence + class

- F-M09-1 [class 1, deployed-system practice] — The evidenced leech intervention is to **reformulate/re-present** ("change how the information is presented"), not merely suspend. Supports behavior 1.
- F-M09-2 [class 1, deployed-system spec] — Thresholds vary and are not equivalent across counting rules (Anki: 8 *lifetime* lapses; a small *consecutive* threshold is structurally far more sensitive); "8" is a product default, not an optimum (gap G6). Scopes the threshold as deferred, not invented.
- F-M09-3 [class 1, algorithm design + causal replication] — Post-lapse memory is partially retained (savings): FSRS caps post-lapse stability below prior but **never zeros** it; Ebbinghaus savings — "forgotten" material relearns faster. Supports behavior 2 (savings floor).
- F-M09-4 [class 1, causal] — Massed same-session recovery repetitions buy mostly **performance, not durable memory** (spaced 68% vs massed 26%). Constrains recovery to be spaced, and is the *speed*-side evidence for the durable-vs-speed resolution below.
- F-M09-5 [class 2, code-evidence] — Current system: leech = 3 consecutive failures → EF −0.20, chunk excluded until manually resolved (`leechFailureThreshold=6` is dead code); lapse (q<3) unconditionally resets `repetitions → 0, interval → 1d`. **Compatibility fact only** — it establishes the C3 gap this decision closes; not an endorsement.

Causal behavioral claim (savings — prior learning is partially retained) rests on causal-replication F-M09-3 and F-M09-4. Practice-convention findings (F-M09-1/2) support the reformulate-not-suspend behavior and the deferred-threshold discipline, not a causal optimum. No class-2 finding is used as endorsement.

## Mastery signal

UNRESOLVED → LINK-I2 (mastery-model sub-task owns the values). The observable *shapes* this record fixes, values deferred: (a) the leech trigger = *N consecutive genuine failures* (N → LINK-I2); (b) the post-lapse interval = *f(prior stability)*, monotonic, floored below and capped by prior interval (floor/cap → LINK-I2). No threshold, rate, or floor value is invented here (OC-5 / no-invented-value; G6).

## Constraints

- **Cognitive-load / desirable-difficulty:** Remediation is the **difficulty-relief valve**. A leech is an item that has fallen *outside* the accomplishable band (persistently unlearnable as presented), so the evidenced response **lowers difficulty by reformulating** the content (spares intrinsic/extraneous load via re-presentation, F-M09-1) rather than keep-failing the learner at the same presentation. Post-lapse handling manages difficulty in the *other* direction — it must not **over**-penalize: resetting a well-established item to first-exposure difficulty discards real prior learning (F-M09-3). **Desirable difficulty — preserved vs scaffolded:** on lapse the system deliberately **PRESERVES some difficulty** (the interval is *penalized*, not zeroed — a shorter-but-spaced interval keeps a desirable-difficulty retrieval demand) while deliberately **REMOVING excess difficulty** (it does not reset to maximal first-exposure difficulty, which would be spurious). For leeches it **REMOVES** difficulty (reformulate to bring the item back inside the band). Neither branch collapses to easiest-that-passes.
- **Durable-vs-speed (framework `../framework/00_…`) — material, measured resolution (A):** The post-lapse recovery-aggressiveness dial has **opposing gradients** — massed same-session recovery *inflates immediate performance* (speed) but buys little durable memory (F-M09-4, 26% vs 68%); spaced, savings-bounded recovery serves durable retention but not immediate throughput. **T1 PASS**, **T2 PASS** (durable side causal F-M09-3/4; immediate-performance side causal-directional F-M09-4 itself), **T3 PASS**. → **Material → measured (A):** the post-lapse schedule is a **blend weighted by the continuous prior-stability signal** — the interval is floored/scaled by prior stability and recovery recalls are **spaced, not massed**, deliberately declining to collapse to same-session massed recovery (which would be pure immediate-performance optimization and is exactly C2/C3). Dual-goal evidence cited (durable F-M09-3/4; immediate-performance F-M09-4); weighting value → LINK-I2. No silent single-goal optimization.
- **Privacy gate:** leech/lapse aggregates are aggregate-only (class-6 discipline); no per-learner class-6 signal asserted.
- **Caps / conflicts not to contradict:** C3 (lapse full-reset vs savings) — closed by behavior 2; C2 (roadblock recovery = massed) — honored by spacing recovery recalls; must not contradict either. Reconciliation against the live coded SR flow is **INC-I3**, owned by NEU-923 — carried, not resolved here.

## Uncertainty

- DP-transfer: INC-I1 — leech/lapse conventions come from flashcard SRS on facts; whether the same thresholds and post-lapse curves apply to conceptual DP chunks is unmeasured (F-TR-3 / G1). A DP concept may "leech" for reasons (missing prerequisite, poor chunking) that differ from a fact-recall leech. **DP effectiveness stays provisional.**
- Gaps provisional-on: G6 (exact threshold / recovery counts unsupported) and G1 (DP transfer). Settled only by class-7 / in-domain measurement. This record presents **no** post-lapse curve or threshold as established.

## Rejected alternative

- **Unconditional full reset on lapse (current coded behavior, F-M09-5)** — rejected because F-M09-3 (savings; FSRS caps-not-zeros; Ebbinghaus faster relearning) shows post-lapse memory is partially retained; a full reset discards real prior learning and corrupts the retention model (C3), and by shortening the interval to 1d it also pushes recovery toward the massed regime the evidence disfavors (F-M09-4).
- **Suspend-only leech handling (set aside, no reformulation)** — rejected because F-M09-1 shows the evidenced intervention is to reformulate/re-present; suspend-only abandons the learner on a recoverable item and never addresses *why* it leeches.

## Enforceable control   (REQUIRED — learning-critical)

- **Failure mode prevented:** C3 / F-M09-5 — unconditional lapse reset silently corrupts the retention model by discarding prior learning (savings), producing a mis-scheduled, over-massed recovery that inflates near-term performance while the durable signal is wrong; **compounded by C4** — if genuine failures are over-validated at grading (M06/M08), the leech counter never accumulates and remediation **silently never fires** on a genuinely-failing item.
- **Mechanical check (two-part, machine-checkable):**
  1. **Deterministic post-lapse savings invariant.** An assertion that the recomputed post-lapse interval is a **monotonic function of prior stability** and is **never reset below a savings floor derived from prior stability and never above the prior interval** (`floor(prior_stability) ≤ post_lapse_interval ≤ prior_interval`), i.e. never unconditionally `→ 1d` / `repetitions → 0`. A DB-backed integration test seeds a high-prior-stability item, forces a lapse, and asserts the next interval is bounded by prior stability (floor value **UNRESOLVED → LINK-I2**) and is **not** a first-exposure reset.
  2. **Leech-trigger provenance gate.** The leech counter increments only on failures from a **trustworthy, independently-verified** grading channel (not solely AI self-graded — the DR-M06 adversarial grading fixture is the trustworthy-signal source). An integration test asserts that a run of *N* genuine failures reaches the reformulation trigger, and that an over-validated (falsely-passed) answer does **not** silently suppress the counter (count *N* → LINK-I2).
- **Enforcement point:** unit + integration tests in `tests/integration/` over `src/domain/algorithms/sr-calculator.ts` (post-lapse recompute invariant — a DB-mutating scheduling path, so integration coverage is a hard gate per the project's test rules) and `src/domain/algorithms/classify-chunk.ts` / the teaching workflow (leech-trigger + reformulation step); a runtime invariant on the SR calculator's post-lapse branch. The **shape and enforcement point are fixed now**; the savings floor and leech count are deferred to LINK-I2. This record **specifies** the required control — it implements no code (implementation and reconciliation with the coded roadblock/retry/leech flow are NEU-923's job).
- *Not prose-only:* the control names a failure mode (C3/F-M09-5, C4), a machine-checkable check (savings-floor invariant + trigger-provenance gate), and an enforcement point (named source files / integration tests / runtime invariant).

## Traceability back-links

- Register findings consumed: F-M09-1, F-M09-2, F-M09-3, F-M09-4, F-M09-5 (cross-links: F-M04-2 spacing, F-M06-4 trustworthy-signal source).
- Conflicts addressed: C3 (closed by behavior 2); C2 (honored — recovery recalls spaced, not massed); C4 (guarded by the trigger-provenance gate; verdict owned downstream).
- INC markers carried: INC-I1 (DP transfer, always); INC-I3 (reconciliation verdict for C3/C2 against live code — NEU-923).
- LINK slots bound: LINK-I1 = this DR (DR-M09); LINK-I2 = mastery-signal contract, the savings floor, and the leech count (mastery-model sub-task) — referenced, values UNRESOLVED.

## Ledger status

- **provisional** — mirrored into ../adjudication/01_… §C-FBK. (Empirical decision ≤ provisional; class-7 absent project-wide, so this decision cannot be `settled`/`accepted`. The enforceable-control field is met, but DP applicability, the savings floor, and the leech count remain open.)
