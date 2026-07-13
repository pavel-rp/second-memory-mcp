# DR-M08 — Assessment (graded quality signal)

- **Record id / mechanism:** DR-M08 · M08 Assessment · cluster §C-ASSESS · author NEU-921 · 2026-07-13
- **Learning-critical:** yes  (source: synthesis **C4** HIGH, explicitly "learning-critical" — LLM self-grading over-validates incorrect answers up to 71%; template §3 row M08)

## Decision (observable behavior)

The AI grader **does not emit the final quality signal by free judgement.** For every graded attempt the grader must return a **structured, rubric-anchored payload** — per-criterion booleans plus the verbatim span(s) of the learner's answer that justify each criterion — and a **deterministic (non-LLM) mapping** derives the 0–5 quality from that payload. Concretely observable:

- Given an **incorrect** DP answer, a reviewer can watch the grade-derivation path reject any "pass" that is not backed by rubric criteria evidenced against the learner's own words; a bare high self-report cannot become a pass.
- Given a learner **rebuttal** ("that should be correct"), the recorded pass/fail does **not** flip upward unless a *new* rubric-anchored payload is produced — assertion alone changes nothing observable in the score.
- The quality signal is **never binary-collapsed**: assessment-mode scoring preserves the 0–5 grade granularity (difficulty-of-recall information) rather than forcing pass→5 / fail→1.

This is a behavior a test or reviewer can watch happen at the `submit_answer` grade-derivation boundary; it does not restate "grade the answer."

## Cited evidence + class

- **F-M08-3** [class 1, empirical] — LLM graders over-validate incorrect answers (F1 4–55% on incorrect solutions; up to **71%** over-validation per model). The closest analogue to this mechanism; motivates removing the LLM from the *final* quality decision. (Observed LLM behavior, not a learning claim — per synthesis §4.)
- **F-M08-4** [class 1, empirical] — Sycophancy under learner rebuttal flips a correct answer 45.2% of the time; assertive rebuttal reaches 84.5% persuasion / 17.1% correction. Motivates the rebuttal-invariance requirement.
- **F-M08-2** [class 1, empirical] — Strong LLM judges reach only human-level agreement (~80%) with baked-in position/verbosity/self-enhancement biases; self-grading one's own generated interaction compounds self-enhancement. Bounds how far the grader may be trusted.
- **F-M08-1** [class 1, algorithm specification] — A quality scale encodes *difficulty of successful recall*; collapsing it to binary discards load-bearing scheduler-input information. Motivates the no-binary-collapse requirement.
- **F-M08-5** [class 2, code-fact] — The AI client currently generates, judges, and self-reports quality 0–5; the session-scoped cap catches only post-stumble drift, not uniform first-turn leniency (the dominant F-M08-3 mode); assessment mode binary-collapses. **Class-2: supports the compatibility/where-the-control-must-live claim only — never a pedagogical endorsement** (inherited firewall). The exact live rule vs. this required shape is a reconciliation verdict (NEU-923, `INC-I3`/C4), not asserted here.

*No causal pedagogical claim is made from these findings; they are observed LLM-grader behavior (synthesis §4). Assessment produces no learning claim of its own — it protects the signal every other mechanism consumes.*

## Mastery signal

The assessment mechanism's objective (a **faithful** quality signal) is met when, on a held-out reference set, the rubric-derived quality (a) **agrees** with reference grades at ≥ an agreement bar **and** (b) keeps the **over-validation rate on known-incorrect answers ≤ a ceiling.** Both calibrated values are **UNRESOLVED → LINK-I2** (mastery-model sub-task owns the numbers; `OC-5` no-invented-value). The signal's **observable shape** — agreement + bounded over-validation measured against a held-out fixture — is fixed here; only the thresholds defer.

## Constraints

- **Cognitive-load / desirable-difficulty:** Assessment spends **no learner load directly** — but its fidelity gates the load/difficulty calibration of every other mechanism. The control **preserves desirable difficulty system-wide**: a silently lenient grade (F-M08-3) would *remove* desirable difficulty invisibly by advancing the learner before mastery, and a binary-collapsed signal (F-M08-1) would corrupt the scheduler that spaces desirable-difficulty retrieval (M04). Removing extraneous load is not this mechanism's job; protecting the signal that all difficulty-calibration reads is.
- **Privacy gate:** No class-6 operational signal is used; grading fixtures are curated reference data, not user records — aggregate-only gate not engaged.
- **Caps / conflicts not to contradict:** C4 (HIGH, non-downgradable) — this record supplies the enforceable control C4 requires; it must not, and does not, assert C4 *resolved* (reconciliation NEU-923 owns that). G7 (specific LLM-bias percentages UNVERIFIED) — the 71%/45.2% figures are cited as their sources' worst-case/observed values, not asserted as this product's rate.

## Uncertainty

- **DP-transfer: INC-I1 / F-TR-3** — grading-reliability figures are from general/non-DP tutoring tasks; grading fidelity on *DP-specific* correctness (a valid-but-unusual recurrence, an off-by-one base case) is **unmeasured** and plausibly worse (F-M08-3's "valid alternatives" weakness). DP grading fidelity stays **provisional**; only in-domain measurement (class-7 / DP grading study) would settle it.
- **Gaps provisional-on:** G7 (LLM-bias magnitudes UNVERIFIED) and G1/INC-I1 (no DP measurement). The decision is **provisional**; it presents no DP grading fidelity as established.

## Rejected alternative

- **Trust the LLM's self-reported 0–5 quality directly (status quo, F-M08-5), relying on the session-scoped cap to catch inflation.** Rejected: the cap only fires *after* an early low score, so it cannot catch **uniform first-turn leniency** — the dominant failure in F-M08-3 (over-validation up to 71%) — leaving the learning-critical failure mode uncontrolled.
- **Collapse the signal to binary in assessment mode (pass→5 / fail→1).** Rejected per F-M08-1: it discards the difficulty-of-recall information the SM-2/FSRS scheduler consumes, corrupting downstream spacing.

## Enforceable control   (REQUIRED — learning-critical)

- **Failure mode prevented:** C4 / F-M08-3 (LLM over-validates incorrect answers up to 71%), F-M08-4 (rebuttal sycophancy), F-M08-1 (binary collapse) — the grader silently certifies a non-mastered answer, feeding a performance-inflated signal to scheduling (M04) and progression (M10).
- **Mechanical check (three, machine-checkable):**
  1. **Constrained grading payload (schema).** A schema on the grader output requires the rubric fields (per-criterion booleans + cited answer spans); a payload lacking them is **rejected** and the deterministic mapper — not the LLM — computes the 0–5 quality. Absence of the rubric fields is detectable without human judgement.
  2. **Adversarial grading fixture (CI, fail-closed).** A held-out fixture of known-incorrect DP answers and valid-but-unusual correct answers runs in CI; the measured **over-validation rate on the incorrect set must fail-closed at ≥ the detection bar** (bar value `UNRESOLVED → LINK-I2`; the fixture, its pass/fail assertion, and the fail-closed direction are fixed now).
  3. **Rebuttal-invariance assertion.** A test asserts that a bare learner rebuttal, with no new rubric-anchored payload, does **not** flip the pass/fail direction upward — pinning F-M08-4.
- **Enforcement point:** the server-side grade-derivation path (`src/orchestration/teaching-workflows.ts`, the `submit_answer` quality-derivation boundary where quality is currently self-reported per F-M08-5); a Zod schema on the grading payload under `src/domain/types/`; the adversarial fixture as a CI test under `tests/` (unit for the mapper/schema, integration for the persisted grade). Whether the *current* live path already satisfies this shape is the reconciliation verdict (NEU-923, C4/`INC-I3`) — required here is the control's **shape and enforcement point**, not confirmation the code already conforms.

## Traceability back-links

- **Register findings consumed:** F-M08-1, F-M08-2, F-M08-3, F-M08-4, F-M08-5.
- **Conflicts addressed:** C4 (supplies its required enforceable control; does not mark it resolved — reconciliation owns closure).
- **INC markers carried:** INC-I1 (DP measurement, open); INC-I2 discharged for M08 (this record now exists).
- **LINK slots:** **LINK-I1 = this DR (bound).** LINK-I2 = mastery-signal contract (agreement bar + over-validation ceiling) — **UNBOUND**, mastery-model sub-task.

## Ledger status

- **provisional** — mirrored into `../adjudication/01_instructional-decision-ledger.md` §C-ASSESS (M08 row). Empirical decision on class-1/2 evidence with class-7 absent → at most `provisional`; **not** `settled`/`accepted` (inherited firewall). C4 itself remains `unresolved`·non-downgradable in §CONFLICTS (not this record's to flip).
