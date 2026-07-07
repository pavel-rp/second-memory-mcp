# Research Prompt 03 — Learning-Science Evidence Audit

> **How to run:** Give this entire file as the prompt to a Claude Code session (Sonnet) with web access, inside `B:\Projects\second-memory` (for spot-checking code).
> **Output:** Write your full report to `docs/research/results/03-pedagogy-evidence-audit.md`. Do not edit any source files.

## Role

You are a learning-science reviewer auditing the pedagogical design of a spaced-repetition teaching system against the empirical literature (cognitive psychology of learning, spaced repetition algorithm research, ITS/tutoring-systems research). For every verdict, cite specific sources — papers (author/year), FSRS benchmark repos, or authoritative syntheses (e.g. Dunlosky et al. 2013, Rawson & Dunlosky successive-relearning work, Roediger & Karpicke testing-effect work, Bjork desirable difficulties, Cepeda et al. spacing meta-analyses, VanLehn ITS reviews). Web-search to confirm citations; do not fabricate.

## The system as implemented (recon facts — trust these; spot-check code only if a verdict hinges on details)

**Scheduler** (`src/domain/algorithms/sr-calculator.ts`, `src/domain/config/algorithm-defaults.ts`): modified SM-2. Quality 0–5. EF: +0.10 if q≥4, −0.02 if q=3, −0.20 if q<3; EF min 1.3, **no ceiling**; start 2.5. Intervals: 1d, 6d, then ×EF. Lapse (q<3): repetitions→0, interval→1d. Overdue reviews: EF −0.15 and interval pulled in by up to 50%. **No fuzz/jitter.** Leech: 3 consecutive failures → flagged, EF −0.20, chunk becomes `remediation` type, excluded from recommendations until manually resolved. A config value `leechFailureThreshold=6` exists but is dead code.

**Retrievability model** (`src/domain/algorithms/classify-chunk.ts`): FSRS-style power law `R = (1 + (19/81)·(daysOverdue/intervalDays))^(-0.5)` using SM-2 interval as a stability proxy — used **only** to pick a teaching tier (recall ≥0.7 / cued_recall ≥0.5 / reteach ≥0.3 / scaffold <0.3), each with distinct instruction templates and drill formats (scaffold→multiple choice, reteach/cued→open-ended). **Not used for scheduling.** No per-item stability/difficulty state is fitted or persisted.

**Teaching loop** (`src/orchestration/teaching-workflows.ts`): server returns a natural-language teaching instruction; the **AI client improvises the question text, judges the answer, and self-reports quality 0–5** (`passed` defaults to q≥3). A session-scoped quality cap limits grade inflation: if an earlier question on the same chunk scored 0–1, later scores cap at 3; if 2, cap at 4. Max **2 attempts per question** (fail → one retry with a "pivot" hint; second fail recorded, no third try). Chunk-level quality fed to SM-2 = **rounded mean of each question's last attempt**, once per chunk per session. **Roadblock gate**: after a low-quality answer, N additional distinct questions scoring ≥3 are required on the same chunk before progression — N = {q0:3, q1:3, q2:2, q3:1, q4:1, q5:0}. **Assessment mode**: quality forced to binary (pass→5, fail→1), single attempt.

**Sequencing**: prerequisites are chunk→chunk edges; a prerequisite counts as "mastered" (skipped) when `repetitions > 0` (one successful review, ever). Stale prerequisites (R<0.5) are re-injected into the session before their dependents. Failed chunks are re-queued after fresh pending ones within the session. **No interleaving is implemented** — an `interleaveStrategy:'easy-medium-hard'` config and session-composition caps (maxNew=3 etc.) exist but are **dead code**; ordering is topological + author order. Daily cap maxReviews=200 applies only to one standalone tool.

**Content**: chunks are single-concept teaching scripts, 200–8000 chars, ~300–1500 word lint targets; markdown structure linting; difficulty is a static author-assigned 1–10 (difficulty ≥4 triggers incremental delivery pacing). Learner notes (insight/confusion/connection/gap) and past session feedback are resurfaced into future teaching instructions for the same chunks.

**Analytics**: reviews/day, new/day, mean quality, streak. **No retention rate, no forgetting-curve fitting, no calibration of the scheduler against actual recall.** `time_spent_ms` collected but unused by scheduling. A cognitive-load model exists but is **never called**.

## Questions to adjudicate (verdict + evidence each)

1. **SM-2 vs FSRS in 2026**: how large is the practically measured gap (FSRS benchmark data)? Is grafting FSRS retrievability onto SM-2 state (as done here for tier selection) sound or self-inconsistent? What would a migration path look like given the stored state (EF, interval, reps, full attempt history in `session_question_attempts`)?
2. **Binary quality in assessment mode** (5 or 1 only): what information is lost, and does it corrupt EF trajectories?
3. **LLM/agent self-graded quality**: what does the literature (and recent LLM-grading studies) say about reliability of delegated grading; is the session quality cap a reasonable mitigation; what's known about learner self-grading bias in SRS (Anki studies)?
4. **2-attempt cap + retry pivot**: consistent with errorful-learning / feedback literature? Should a failed second attempt trigger restudy rather than just recording failure?
5. **Roadblock gate**: compare to **successive relearning** criteria (Rawson & Dunlosky: recall to criterion of N correct in session). Are the follow-up counts {3,3,2,1,1,0} defensible? Note follow-ups happen immediately (massed) — does massed same-session re-questioning add durable-memory value or only performance?
6. **Lapse handling**: full reset to 1d vs FSRS-style partial stability retention — what does evidence say about post-lapse intervals?
7. **Leech threshold 3** (vs Anki default 8 lapses): too aggressive? Best-practice leech interventions (suspend vs reformulate vs mnemonic)?
8. **No fuzz**: practical consequences (review clumping, interval synchronization) — how material is this?
9. **Prerequisite mastery = repetitions>0**: against mastery-learning literature (Bloom, Khan Academy mastery thresholds, knowledge-tracing practice), is a single success adequate for unlocking dependents? What thresholds do deployed systems use?
10. **No interleaving**: expected effect sizes of interleaving vs blocking for this content type (declarative/conceptual chunks); is the dead 'easy-medium-hard' strategy even the right kind of interleaving (vs topic/category mixing)?
11. **Retrievability-tiered instruction** (recall/cued/reteach/scaffold): is dynamically degrading to recognition-level practice when R is low supported by evidence, or does it remove desirable difficulty? Any ITS literature on retrieval-difficulty-adaptive prompting?
12. **Session-level design**: 90-minute threshold before recommending completion, up to 200 reviews/day — sane defaults vs evidence on session length and fatigue?
13. **Missing measurement**: what minimal analytics would let the system validate itself (true retention rate at review time, calibration curves, time-to-relearn)? What do Anki/FSRS communities treat as standard health metrics?
14. **Overall**: rank the top 5 pedagogical changes by expected learning-outcome impact per engineering effort.

## Output format

Markdown report: (1) one-page executive summary with a letter grade for pedagogical soundness and the 3 most consequential findings; (2) per-question verdicts — **Supported / Partially supported / Contradicted / No evidence either way**, each with citations and a concrete recommendation; (3) the ranked top-5 change list with expected impact rationale. Cite real, verifiable sources; mark anything you couldn't verify as **UNVERIFIED**.
