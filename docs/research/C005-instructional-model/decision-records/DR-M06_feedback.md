# DR-M06 — Feedback

- **Record id / mechanism:** DR-M06 · Feedback · cluster §C-FBK · author NEU-920 · 2026-07-13
- **Learning-critical:** yes  (source: synthesis **C6** + **F-M06-4**; template §3 — AI-delivered diagnostic feedback needs an enforceable control)

## Decision (observable behavior)

After a learner's attempt on a DP chunk, the system delivers **corrective feedback that includes exposure to the canonical correct answer / derivation** — and, specifically, **after the terminal failed attempt** (the point where the current code records the failure and moves on, F-M06-5) it emits a **correct-answer-exposure step before the chunk outcome is recorded**. The feedback is a **structured payload** that separates the *correctness verdict* from the *correct-answer content*, so a reviewer or a test can watch that (a) a canonical correct-answer/derivation message is presented on the terminal-failure path, and (b) the recorded chunk outcome cannot be "passed/mastered" on a path that had ≥1 failed attempt without that exposure having occurred. The mechanism does **not** rely on free-form AI-generated prose as the sole channel establishing correctness.

This is an **observable/testable** behavior (a message is emitted; an outcome-record is gated), not an intention to "give good feedback."

## Cited evidence + class

- F-M06-1 [class 1, causal] — Supplying the correct answer after an incorrect response has a very large retention effect (+494% relative to a low no-feedback baseline; direction robust, magnitude study-specific). Supports the *causal* claim that correct-answer exposure after failure improves retention.
- F-M06-2 [class 1, causal] — Unreinforced errors resurface (hypercorrection; high-confidence errors reproduced on delayed test); the case against "record the failure and move on." Supports the *causal* claim that omitting correction lets errors persist.
- F-M06-3 [class 1, causal (condition comparison)] — The right generalization is "*some* correct-answer exposure after the attempt," not a fixed increment. Scopes the behavior to exposure-existence, not a tuned magnitude.
- F-M06-4 [class 1, empirical (LLM evaluation)] — LLM tutors confirm correct solutions reliably (F1 94–99%) but diagnose incorrect solutions poorly (4–55%) and valid alternatives poorly (0–76%). This is the **learning-critical** finding that forces an enforceable control on AI-delivered diagnosis.
- F-M06-5 [class 2, code-evidence] — The existing system records a second failure and moves on with no correct-answer exposure, and feedback is delivered by the same AI client that generated and judged the question (self-grading). **Compatibility fact only** (per the inherited firewall, class-2 supports a compatibility/availability claim, never a pedagogical endorsement); it establishes the current gap this decision closes.

Causal behavioral claim (correct-answer exposure improves retention) rests on causal findings F-M06-1/2/3. The AI-unreliability constraint rests on empirical F-M06-4. No class-2 finding is used as pedagogical endorsement.

## Mastery signal

UNRESOLVED → LINK-I2 (mastery-model sub-task owns the graded signal and its threshold). The observable *shape* this record fixes: whether the corrected schema held is read on a **subsequent spaced attempt** (not a same-session massed re-ask, which would inflate performance per C2 / F-M09-4), with the pass value deferred to LINK-I2. This record invents no threshold (OC-5 / no-invented-value).

## Constraints

- **Cognitive-load / desirable-difficulty:** Feedback is the **germane-load consolidation** step that follows a desirable-difficulty retrieval attempt (M07): the attempt *creates* the difficulty, the feedback *resolves* it into a corrected schema (F-M06-1/2). It **spends germane load** on schema correction and **removes extraneous load** by surfacing the canonical derivation rather than leaving the learner to re-derive blindly after a terminal failure. **Desirable difficulty — preserved vs scaffolded:** difficulty is deliberately **preserved during the attempt(s)** (the retrieval/struggle phase owned by M07); it is deliberately **removed at the terminal-failure boundary** — the correct answer is exposed rather than withheld — because withholding past the terminal attempt forfeits the +494% corrective effect and lets unreinforced errors persist (F-M06-2). Struggle is preserved *up to* correction; it is never preserved *instead of* correction.
- **Durable-vs-speed (framework `../framework/00_…`):** For the *correct-answer-exposure-existence* decision, an **immateriality certificate (§2.1-B): T1 fails** — exposing the correct answer after terminal failure raises **both** durable mastery (F-M06-1/2, causal) and eventual contest fluency (a correct schema is prerequisite to fast recognition), so the two goals' gradients on this dial are *aligned*, not opposing. The **material** durable-vs-speed axis for feedback is the separate *timing* sub-dial (immediate vs delayed correction, which can trade immediate performance against retention); it is **carried as latent** (T2 evidence not in this register within caps) and recorded as a gap — **not** silently optimized. This satisfies the no-third-exit rule (exactly one of A/B is present).
- **Privacy gate:** any leech/failure aggregate used to observe the exposure gate is aggregate-only (class-6 discipline); no per-learner class-6 signal is asserted here.
- **Caps / conflicts not to contradict:** C6 (feedback-after-failure absent) — this decision closes it; C4 (assessment over-validation) — the enforceable control below must not depend on the same self-grading channel it distrusts. Reconciliation of these behaviors against the live coded flow is **INC-I3**, owned by NEU-923 — carried, not resolved here.

## Uncertainty

- DP-transfer: INC-I1 — corrective-feedback effects are measured on verbal/factual materials, not DP problem-solving; whether explanatory feedback on a failed DP derivation transfers to novel DP problems is unmeasured (F-TR-3 / G1). AI diagnostic reliability on *DP-specific* errors is additionally unmeasured (extends F-M06-4). **DP effectiveness stays provisional.**
- Gaps provisional-on: G1 (DP transfer, settled only by class-7 / in-domain measurement). This record presents **no** DP-feedback effectiveness as established.

## Rejected alternative

- **"Record the failure and move on" (current coded behavior, F-M06-5)** — rejected because F-M06-1/2 show unreinforced errors resurface (hypercorrection) and the design forfeits the large corrective-feedback retention effect (F-M06-1). It is precisely the condition the causal evidence argues against.
- **Rely on free-form AI-generated diagnostic feedback as the sole correctness channel** — rejected because F-M06-4 shows LLM diagnosis of *incorrect* solutions is unreliable (4–55%); a self-grading tutor that mis-diagnoses a wrong answer silently confirms it, corrupting the mastery signal (C4). Hence the structured-payload + independent-verification control below rather than trusting the prose.

## Enforceable control   (REQUIRED — learning-critical)

- **Failure mode prevented:** C4 / F-M06-4 — the AI tutor that generated and judged the item over-validates or mis-diagnoses an incorrect answer (over-validation up to 71% at assessment; incorrect-solution diagnosis 4–55%), silently confirming a wrong answer and corrupting the graded signal; **and** C6 / F-M06-5 — no correct-answer exposure after terminal failure, so the error is never reinforced-corrected.
- **Mechanical check (two-part, machine-checkable):**
  1. **Constrained payload + server-side outcome gate.** The feedback payload is a structured object `{ verdict, canonical_answer_ref, correct_answer_exposed: bool }`; a **server-side assertion rejects recording a chunk outcome as pass/mastered when `correct_answer_exposed == false` on any path that had ≥1 failed attempt.** An integration test asserts that after the terminal (2nd) failed attempt a correct-answer-exposure step exists **before** the chunk outcome is persisted.
  2. **Held-out adversarial grading fixture (fail-closed).** A deterministic fixture of known-incorrect DP answers that the grading path must **fail-closed** on at ≥ *X* detection rate (**threshold value UNRESOLVED → LINK-I2**), run as a CI gate: if the grader validates a seeded incorrect answer above the tolerated false-accept rate, the gate fails. This makes the "confirming-correct / missing-the-rest" failure (F-M06-4) detectable without a human in the loop.
- **Enforcement point:** integration test in `tests/integration/` over the teaching workflow (`src/orchestration/teaching-workflows.ts`) for the correct-answer-exposure step and the outcome gate; a CI gate running the adversarial grading fixture; a runtime schema/invariant on the feedback payload at the server tool boundary (`src/server/*-tools.ts`). The **shape and enforcement point are fixed now**; the calibrated detection threshold is deferred to LINK-I2. This record **specifies** the required control — it implements no code (implementation and reconciliation with the coded roadblock/retry/leech flow are NEU-923's job).
- *Not prose-only:* the control names a failure mode (C4/F-M06-4, C6), a machine-checkable check (payload gate + adversarial fixture), and an enforcement point (named test/CI/runtime locations).

## Traceability back-links

- Register findings consumed: F-M06-1, F-M06-2, F-M06-3, F-M06-4, F-M06-5 (and F-M03-3, F-M03-5 as cross-links to the retrieval attempt this feedback follows).
- Conflicts addressed: C6 (closed by this decision); C4 (guarded by the enforceable control; verdict owned downstream).
- INC markers carried: INC-I1 (DP transfer, always); INC-I3 (reconciliation verdict for C6/C4 against live code — NEU-923).
- LINK slots bound: LINK-I1 = this DR (DR-M06); LINK-I2 = mastery-signal contract (mastery-model sub-task) — referenced, value UNRESOLVED.

## Ledger status

- **provisional** — mirrored into ../adjudication/01_… §C-FBK. (Empirical decision ≤ provisional; class-7 absent project-wide, so this decision cannot be `settled`/`accepted`. The enforceable-control field is met, but DP effectiveness and the calibrated control threshold remain open.)
