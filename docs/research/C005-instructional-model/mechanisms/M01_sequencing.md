# M01 — Sequencing

**Mechanism:** The order in which concepts/skills are presented, including prerequisite ordering and difficulty progression. **Task:** NEU-915 · **Cutoff:** 2026-07-13 (fresh) / 2026-07-07 (reused). **Makes no decision.**

## Scope

For this feature's fixed audience — mastery-oriented programmers acquiring dynamic programming who ultimately need competitive-programming breadth and speed — sequencing governs which DP concept a learner meets before another (e.g. recurrence/state before memoization before tabulation) and how difficulty ramps. This file collects the evidence on ordering; it selects no ordering scheme.

## Labeled findings

**F-M01-1** — `[literature]` · Managing intrinsic load by sequencing from simpler to more complex elements is a core cognitive-load prescription: instruction should respect working-memory limits (see `02_…` F-CL-1/2). Prerequisite-first ordering reduces the number of novel interacting elements a novice holds at once. *Provenance:* https://en.wikipedia.org/wiki/Cognitive_load. *Cutoff:* 2026-07-13. *Evidence type:* theoretical/CLT. *Limitation:* CLT prescribes managing element interactivity; it does not fix a specific DP concept order, and the optimal order for DP is unmeasured.

**F-M01-2** — `[literature]` · Mastery-learning traditions sequence on *demonstrated* prerequisite competence, not mere exposure: "students must achieve a level of mastery (e.g., 90% on a knowledge test) in prerequisite knowledge before moving forward." *Provenance:* https://en.wikipedia.org/wiki/Mastery_learning (reused via audit Q9, cutoff 2026-07-07). *Cutoff:* 2026-07-07. *Evidence type:* pedagogical framework / quasi-experimental (Bloom). *Limitation:* The 90% figure is illustrative of mastery-learning practice, not a DP-specific or causally-optimized threshold; belongs jointly to M10 (progression).

**F-M01-3** — `[literature]` · Difficulty-level ordering ("easy→hard") is *not* the same construct as interleaving, and the evidence base for sequencing is about element/topic structure, not a monotone difficulty ramp. The interleaving literature is framed around category/problem-type mixing; "no research literature was found treating difficulty-level (easy/medium/hard) sequencing as the 'interleaving' manipulation." *Provenance:* audit Q10, `docs/research/results/03-pedagogy-evidence-audit.md`. *Cutoff:* 2026-07-07. *Evidence type:* review/absence-of-evidence. *Limitation:* An absence-of-evidence for difficulty-as-interleaving, not proof a difficulty ramp is harmful; see M05.

**F-M01-4** — `[literature]` · Deployed systems interleave *prerequisite review* into later sessions rather than reordering initial teaching: "Reviews micro-interleave not only the problem types in the original lesson, but also the component (prerequisite) skills." *Provenance:* https://justinmath.com via audit Q10 (practitioner/blog-level, not peer-reviewed). *Cutoff:* 2026-07-07. *Evidence type:* practitioner report. *Limitation:* Non-academic source; directional only.

## Cognitive-load / desirable-difficulty note

Sequencing is primarily an **intrinsic-load** management lever: prerequisite-first ordering lowers element interactivity for novices (F-M01-1). It interacts with desirable difficulty at the boundary — ordering that is too protective (never advancing until over-practiced) forfeits the desirable difficulty of retrieving partially-consolidated prerequisites (see M03, M04). The difficulty-ramp question (F-M01-3) is where sequencing and interleaving are frequently conflated.

## DP-transfer uncertainty

No cited source measures a specific DP concept ordering against DP problem-solving transfer. The claim that a particular prerequisite graph produces better DP mastery is unmeasured (NEU-887 R1 / see `02_…` F-TR-3); DP-specific ordering effectiveness stays provisional.

## Prior in-repo reconciliation evidence (evidence only — verdict deferred)

**F-M01-5** — `[code-evidence]` · The existing system encodes prerequisites as chunk→chunk edges and orders sessions topologically plus author order; stale prerequisites (retrievability R<0.5) are re-injected before dependents; a declared `interleaveStrategy:'easy-medium-hard'` and session-composition caps exist but are **dead code**. *Provenance:* `docs/research/03-pedagogy-evidence-audit.md` (recon facts); `src/domain/algorithms/resolve-stale-prerequisites.ts`. *Cutoff:* 2026-07-07 recon. *Evidence type:* code fact. *Limitation:* Availability, not pedagogical validity; the reconciliation *verdict* (does stale-prereq re-injection match F-M01-4?) belongs to the reconciliation sub-task.

**F-M01-6** — `[code-evidence]`/contested · The prior audit characterized prerequisite "mastery" as `repetitions > 0` (one success ever), which NEU-888 flags as **stale** — current gating is retrievability-threshold-based (`resolve-stale-prerequisites.ts`, `classify-chunk.ts`). *Provenance:* audit Q9 vs. NEU-888 description. *Cutoff:* mixed. *Evidence type:* contested code fact. *Limitation:* Must be re-verified against live code by the reconciliation sub-task; carried here as an open conflict (see `03_synthesis.md` C1), not resolved.
