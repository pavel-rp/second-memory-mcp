# DR-M03 — Retrieval Practice

- **Record id / mechanism:** DR-M03 · Retrieval practice · cluster §C-PRAC · author NEU-919 · 2026-07-13
- **Learning-critical:** yes  (source: synthesis **C2** HIGH — roadblock same-session massed recalls feed a performance-inflated signal to the scheduler; template §3)

## Decision (observable behavior)

The system elicits DP knowledge by **production from memory**, not re-study: every teaching interaction prompts the learner to reconstruct a concept, derive a recurrence/state/transition, or produce a solution unaided before any answer is shown. A failed attempt yields a **real second retrieval attempt** (hint-scaffolded, not the answer) before failure is recorded — an errorful-retrieval attempt is deliberately allowed to stand. **Observable:** (a) a reviewer/test can watch that an answer is never revealed before ≥1 unaided attempt has been submitted; (b) on a first failure a second genuine attempt is offered before the item is marked failed; (c) the mastery signal handed to scheduling is derived **only** from retrieval events that are **not** same-session massed repeats of the same chunk — a same-session re-recall triggered by a roadblock is recorded for pedagogy but is **flagged and excluded** from the mastery-signal aggregate. The retrieval *difficulty* presented per item tracks the learner's current retrieval-strength signal so the attempt stays effortful yet accomplishable.

## Cited evidence + class

- F-M03-1 [class 1, causal — review of controlled studies] — retrieval/practice-testing is top-tier utility; grounds "elicit production from memory" as the default over re-study.
- F-M03-2 [class 1, causal] — **errorful/unsuccessful retrieval still enhances learning**; grounds allowing a real attempt (incl. a failing one) before the answer.
- F-M03-3 [class 1, causal — condition comparison] — the retrieval *attempt* carries most of the benefit (test-without-feedback 78% vs restudy 57%); grounds "attempt before answer."
- F-M03-4 [class 1, mechanistic/theoretical] — gain is largest when retrieval strength is low **if the attempt succeeds**; grounds tracking retrieval-strength to keep difficulty in the accomplishable band (measured resolution below).
- F-DD-2 [class 1, mechanistic] — lowering difficulty to recognition protects immediate success but forfeits the largest gain; supports the **contest-speed side** of the durable-vs-speed resolution (directional).
- F-M04-2 [class 1, causal — direct comparison] — spaced correct recalls (68%) beat same-session massed (26%); the causal basis for excluding same-session massed re-recalls from the mastery signal (C2).
- F-M03-5 [class 2, code-fact] — *compatibility only*: the current system is already retrieval-centric with a 2-attempt-with-hint structure but exposes no correct-answer after a 2nd failure. Cited for what exists, **not** as pedagogical endorsement; the correct-answer-exposure gap is C6, owned by M06/NEU-920.

## Mastery signal

Observable signal: the learner **produces the target (recurrence/state/transition or solution) unaided, at criterion, on a retrieval event that is not a same-session massed repeat**, on ≥1 occasion. The **calibrated count/quality threshold is UNRESOLVED → LINK-I2** (mastery-model sub-task owns the value; per OC-5 / no-invented-value it is not fixed here). The signal's *shape* — unaided production on a non-massed retrieval event — is fixed here; its number is not.

## Constraints

- **Cognitive-load / desirable-difficulty:** retrieval is the archetypal **germane-load spend** — this decision deliberately **preserves retrieval difficulty** (unaided production, errorful attempts allowed) as the desirable difficulty, and manages **intrinsic** load by keeping the retrieval prompt within the accomplishable band via the retrieval-strength signal (F-M03-4, F-DD-1). It removes **extraneous** load only by scaffolding hints on the second attempt, never by collapsing the item to recognition.
- **Durable-vs-speed resolution (framework `../framework/00_…` §2–4): MATERIAL → measured.** T1 opposing-gradient PASS: raising retrieval difficulty (recall vs recognition) increases durability (F-M03-2/4) but decreases immediate fluency/success (F-DD-2). T2 PASS (asymmetric): durable side causal (F-M03-2/4), speed side directional (F-DD-2). T3 PASS: durable serves the learning phase, speed the contest phase. **Resolution = measured** (§3.3 branch 2): retrieval difficulty is weighted per item by the learner's continuous **retrieval-strength signal** — difficulty rises as strength rises, held to the band where the attempt still succeeds. Dual-goal evidence cited: durable F-M03-2/4; speed F-DD-2. Signal shape observable; calibrated weighting value → LINK-I2. **No third exit** — this is a recorded (A) resolution, not a silent single-goal optimisation.
- **Privacy gate:** no class-6 (operational-log) signal is used; aggregate-only discipline is not triggered.
- **Caps / conflicts not to contradict:** **C2** (must not feed same-session massed recalls as genuine retrieval evidence — the enforceable control below); **C6** (correct-answer exposure after failure is owned by M06/NEU-920 — this record does not decide it, only leaves room for it); no SM-2 interval math is decided here (NEU-923).

## Uncertainty

- **DP-transfer:** INC-I1 — retrieval benefits are established on facts/well-structured items; **far transfer of retrieval to novel DP problem-solving is unmeasured** (F-M03-1 limitation, F-TR-2/3). DP effectiveness is **provisional**.
- **Gaps provisional-on:** G1 (DP-domain transfer, controlling) — settled only by in-domain (class-7 / DP) measurement. The correct-answer-exposure dependency (F-M03-2 limitation) is provisional-on the M06 decision (C6, INC-I3).
- This decision is **provisional**; it presents no retrieval effect as established for DP.

## Rejected alternative

- **Recognition / multiple-choice drills that guarantee success** — rejected: F-DD-2 shows lowering difficulty to recognition protects success but forfeits the largest learning gain, and F-M03-2/4 locate durable encoding in effortful (even errorful) production. A success-guaranteeing format optimises immediate fluency at the cost of durability.
- **Counting same-session massed re-recalls (roadblock follow-ups) as independent mastery evidence** — rejected: F-M04-2 (26% vs 68%) shows massed correct recalls are the structurally inferior condition; feeding them to the scheduler inflates the signal (C2). This is the failure mode the enforceable control prevents.

## Enforceable control   (REQUIRED — learning-critical)

- **Failure mode prevented:** C2 (F-M04-6, F-M04-2) — same-session massed roadblock re-recalls are counted as genuine retrieval-practice successes, feeding a **performance-inflated mastery signal** to the scheduler.
- **Mechanical check (constrained payload + deterministic assertion):** every retrieval event contributing to the mastery-signal aggregate carries `session_id` and a deterministic `is_same_session_repeat` flag (derived, not model-judged). A held-out invariant/test **fails closed** if any event with `is_same_session_repeat = true` contributes to the mastery-signal aggregate — massed re-recalls are recorded for pedagogy but **excluded** from the signal. The exclusion is binary and needs no calibrated constant; the *count* of qualifying non-massed retrievals that constitutes mastery is `UNRESOLVED → LINK-I2`.
- **Enforcement point:** the mastery-signal aggregation path — specified here as a runtime invariant plus a CI/integration test fixture over the aggregation input; the concrete scheduler code that consumes the signal is owned by NEU-923. Absence of the flag or of the exclusion assertion is detectable at authoring time.

## Traceability back-links

- Register findings consumed: F-M03-1, F-M03-2, F-M03-3, F-M03-4, F-M03-5, F-M04-2, F-DD-2.
- Conflicts addressed: **C2** (enforceable control); **C6** referenced, ownership left to M06/NEU-920 (not decided here).
- INC markers carried: INC-I1 (DP transfer, open); INC-I3 (F-M03-5 reconciliation verdict, deferred to reconciliation/NEU-923).
- LINK slots bound: **LINK-I1 = this DR (DR-M03)**; **LINK-I2 = mastery-signal contract (count/quality threshold, UNBOUND — mastery-model sub-task)**.

## Ledger status

- **provisional** — mirrored into `../adjudication/01_…` §C-PRAC (M03 row). Empirical (class-1/2) evidence only, no class-7 and no in-domain DP measurement; `settled`/`accepted` is forbidden by the inherited firewall.
