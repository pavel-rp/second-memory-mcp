# M10 — Progression (Mastery Gating & Advancement)

**Mechanism:** The rule that decides when a learner has "mastered" an item enough to advance / unlock dependents. **Task:** NEU-915 · **Cutoff:** 2026-07-07 (reused). **Makes no decision.**

## Scope

For DP acquisition by the fixed audience, progression is the mastery bar: how much demonstrated competence unlocks the next concept or marks a prerequisite satisfied. This file collects the evidence on mastery thresholds and adaptive advancement. It selects no threshold or signal — thresholds and their uncertainty bands are the mastery-model sub-task's job (NEU-888 OUT-4).

## Labeled findings

**F-M10-1** — `[literature]` · Mastery-learning traditions set a **high, evidence-referenced bar** before advancing: "students must achieve a level of mastery (e.g., 90% on a knowledge test) in prerequisite knowledge before moving forward," and Khan Academy's founder frames mastery as "90 percent-plus correct." *Provenance:* https://en.wikipedia.org/wiki/Mastery_learning; https://www.cultofpedagogy.com/khan-mastery-learning/ (reused, audit Q9). *Cutoff:* 2026-07-07. *Evidence type:* pedagogical framework / quasi-experimental. *Limitation:* 90% is illustrative and domain-general; not causally optimized, not DP-specific.

**F-M10-2** — `[literature]` · Probabilistic mastery models advance only on a **high posterior**, not a single success: Bayesian Knowledge Tracing conventionally advances once P(mastery) crosses **0.95**, and "higher thresholds, such as 0.98, yield additional benefits." *Provenance:* Corbett & Anderson (1994) via EDM 2025, https://educationaldatamining.org/edm2025/proceedings/2025.EDM.short-papers.4/2025.EDM.short-papers.4.pdf (reused, audit Q9). *Cutoff:* 2026-07-07. *Evidence type:* modeling convention (secondary-confirmed). *Limitation:* 0.95 is a convention, not a proven optimum; requires a fitted knowledge-tracing model this product lacks.

**F-M10-3** — `[literature]` · Adaptive/scaffolded advancement (ITS) is nearly as effective as human tutoring, supporting per-learner progression over fixed pacing: "the effect size of human tutoring was ... d = 0.79 ... intelligent tutoring systems was 0.76." *Provenance:* VanLehn (2011) via ERIC, https://eric.ed.gov/?id=EJ946764 (reused, audit Q11). *Cutoff:* 2026-07-07. *Evidence type:* review/meta-analytic. *Limitation:* General ITS effectiveness, not progression-rule-specific; not DP-specific.

**F-M10-4** — `[literature]` · A mastery threshold set with **false precision for an unmeasured population** is a known failure mode; thresholds need an uncertainty band and a revision signal until calibrated on real data (inherited NEU-887 discipline; this product has no true-retention/calibration metric yet — see M04 F-M04-4 and the audit's measurement gap). *Provenance:* NEU-887 risk framing + audit Q13 (`docs/research/results/03-pedagogy-evidence-audit.md`). *Cutoff:* 2026-07-07. *Evidence type:* methodological. *Limitation:* This is a discipline constraint, not an empirical effect; it bounds how confidently any threshold may be stated.

## Cognitive-load / desirable-difficulty note

Progression is where desirable difficulty is *enforced across the curriculum*: too low a bar advances the learner before a prerequisite is genuinely known, so every downstream item inherits excess intrinsic load (an unmastered prerequisite makes the dependent harder). Too high a bar traps the learner in over-practice, forfeiting the spaced desirable difficulty of meeting the prerequisite again later in context (M04). Progression is thus the curriculum-level dual of M07's within-item difficulty calibration.

## DP-transfer uncertainty

Mastery thresholds (90%, P≥0.95) come from other domains and models; the defensible DP mastery bar — and whether a fluency/speed criterion (contest need) differs from a durable-understanding criterion — is unmeasured (F-TR-3). DP progression thresholds stay provisional pending later dogfooding/production calibration (explicitly the mastery-model sub-task's domain, not decided here).

## Prior in-repo reconciliation evidence (evidence only — verdict deferred)

**F-M10-5** — `[code-evidence]`/contested · The prior audit found prerequisite "mastery" gated on `repetitions > 0` (one success ever), **Contradicted** by every mastery system checked (F-M10-1/2). NEU-888 flags this characterization as **stale**: current gating is retrievability-threshold-based (`resolve-stale-prerequisites.ts`, `classify-chunk.ts`), so the exact live rule must be re-verified. Both are carried; neither is resolved here. *Provenance:* audit Q9 vs. NEU-888 description; `src/domain/algorithms/`. *Cutoff:* mixed. *Evidence type:* contested code fact. *Limitation:* This is the highest-severity open reconciliation conflict (see `03_synthesis.md` C1); its resolution — including which live rule is in force — belongs to the reconciliation and mastery-model sub-tasks.
