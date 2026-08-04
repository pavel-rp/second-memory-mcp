# C002 — Intake

**Charter:** C002 — Phase 1: Measurement — closed feedback loop
**Date:** 2026-07-07
**Input source:** feature description (command argument to /charter)
**Captured by:** claude-fable-5

## Original idea (verbatim)

Phase 1 of the 2026-07-07 roadmap: Measurement — build the closed feedback loop the pedagogy audit found missing.

CONTEXT FOR YOU (the chartering agent): This repo completed a four-report research pass on 2026-07-07. Before drafting anything, read `docs/research/SYNTHESIS.md` (the roadmap — this charter is its "Phase 1" table) and `docs/research/results/03-pedagogy-evidence-audit.md` sections Q4, Q12, Q13 (the evidence behind every item below). Phase 0 is already chartered and published: umbrella NEU-832 with sub-tasks NEU-833–NEU-841, artifacts in `docs/wf-plans/C001__phase-0-hardening-trivial-wins/` — follow that charter's artifact style and do not overlap its scope (isError, fuzz, assessment mapping 4/2, prereq gate, leech gate, instructions restructure are all Phase 0, not yours).

THE PROBLEM (from report 03, executive summary finding #3): the system collects rich attempt-level data (`session_question_attempts`, `time_spent_ms`) but computes none of the standard SRS health metrics from it. There is no true retention rate, no calibration check, no forgetting-curve fit — no way to tell whether the scheduler's assumptions match observed recall. This is the enabling phase: without it, no later scheduler change (including the Phase 3 FSRS migration) can be validated.

SCOPE ITEMS (from SYNTHESIS.md Phase 1 table):
| Item | What | Evidence |
| 1.1 | True retention rate: pass-rate at due time, overall + by tier/interval band. Anki ships this as a first-class "True Retention" table; this system has zero pass/fail-at-due-time aggregation | report 03 Q13 |
| 1.2 | Calibration check: bucket reviews by implicit predicted-recall probability vs observed pass rate (RMSE-bins style, per the FSRS benchmark methodology), or log-loss | report 03 Q13 |
| 1.3 | Correct-answer exposure after the second failed attempt: today the failure is silently recorded; Pashler et al. 2005 found supplying the correct answer after an incorrect response increased final retention by 494%. Light-touch — surface the correct answer/explanation, not a forced restudy | report 03 Q4 |
| 1.4 | Use `time_spent_ms`: per-session latency+quality trend as a real fatigue signal; replace the unvalidated hard 90-min cutoff with periodic break prompts (evidence favors micro-breaks over a single cutoff); make session/day thresholds configurable and documented as engineering defaults, not evidence-derived | report 03 Q12, Q13 |
| 1.5 | Resolve dead pedagogy config: wire the never-called cognitive-load model (`src/domain/services/cognitive-load.ts`) to real signals or delete it; same decision for the dead session-composition config (`sessionComposition` in `src/domain/config/algorithm-defaults.ts` — maxNew caps, interleaveStrategy). Note: do NOT implement interleaving here (Phase 3); this item is only wire-or-delete of dead surface | report 03 Q13; recon facts in SYNTHESIS.md |

DECISIONS ALREADY MADE (do not re-ask): hard-cutover rollout with no new rollout flags is the established Phase 0 precedent for behavior changes; hexagonal purity (src/domain/ zero-I/O, never throws) is non-negotiable; integration tests are a ship-gate for DB-mutating paths (project CLAUDE.md); no session-lifecycle investment (the 2026-07-28 MCP spec RC removes protocol sessions — see SYNTHESIS.md corrections).

STRATEGIC NOTE (from report 04 / SYNTHESIS monetization section): these metrics are the future paid product surface — the consumer "is this working for me" screen and the B2B dashboard. Design the data shapes with that reuse in mind, but UI/dashboard work is OUT of scope (Phase 2+).

MANDATORY FIRST OUTCOME (AC1 — DRIFT VERIFICATION): make this the charter's first outcome (OUT-1) and the decomposer's first sub-task in dependency order, blocking every other sub-task. This charter may be executed well after it is written, and Phase 0 (NEU-833–841) merges will have moved things. Before any other item is implemented, quickly re-verify every code fact this charter bakes in against the repo at that time: the submit_answer/teaching-workflows references (NEU-837 changes the same path item 1.3 touches), whether NEU-839's config audit already wired-or-deleted parts of item 1.5's dead config (sessionComposition, cognitive-load), and the analytics module shapes. Grep/read-level verification only — target under an hour of agent effort, no re-research. Output: a drift report at 04_drift-check.md in the charter folder listing each checked fact as HOLDS / SHIFTED (with new location) / INVALIDATED; any INVALIDATED fact routes back as an amendment to the affected sub-task brief (or the charter) before that item's implementation begins.

OPEN QUESTIONS THE INTERVIEW SHOULD SETTLE (pick the material ones): (a) where the new metrics surface — extend the existing analytics_daily/analytics_window MCP tools, add new dedicated tools, or both; (b) whether item 1.3 changes the submit_answer response schema (additive field) or adds a new step in the teaching flow; (c) break-prompt mechanics for 1.4 — server-injected advisory in teach_next responses vs. session_status recommendation change; (d) for 1.5, whether the default posture is delete (audit leaned "an uninvoked model is itself a measurement gap") or wire.

## Clarifications

**2026-07-07 — Q:** Where should the new SRS health metrics (true retention 1.1, calibration 1.2) surface in the MCP API?
**A:** One new dedicated tool (e.g. `analytics_health`) returning true-retention + calibration. These are lifetime/cohort metrics, not date-window KPIs — a purpose-built shape becomes the future dashboard contract; only +1 tool against Phase 2's consolidation goal.

**2026-07-07 — Q:** Item 1.3 (correct-answer exposure after the second failed attempt): how should it reach the learner?
**A:** Additive `submit_answer` response field — on the second failure the response gains an additive block (correct answer/explanation + directive to present it before moving on). No flow-state machine change; additive = hard-cutover safe. NEU-837 (Phase 0) touches the same path — drift check covers it.

**2026-07-07 — Q:** Item 1.4: how should break prompts be delivered when the fatigue signal fires?
**A:** In-band advisory — server injects an advisory block into `teach_next`/`submit_answer` responses when the fatigue signal (rising latency + falling quality) fires. Replaces the hard 90-min cutoff; no polling dependency.

**2026-07-07 — Q:** Item 1.5 (dead pedagogy config — cognitive-load model and sessionComposition): what's the posture?
**A:** Delete both. `sessionComposition`'s easy/medium/hard interleaveStrategy is the wrong axis per report 03 Q10 (Phase 3 reimplements interleaving by topic/category fresh); cognitive-load is superseded by 1.4's measured fatigue signal. Audit leaned delete: an uninvoked model is itself a measurement gap. (Drift check still verifies whether NEU-839 already removed parts.)

**2026-07-07 — Q (reviewer round 1, Q1.1):** Should true retention be defined by the first attempt of a scored question, or by eventual pass across both attempts?
**A:** First-attempt defines the metric — a review counts as "retained" only if the first attempt of a scored question passes; eventual-pass (after the pivot-hint retry) is reported alongside as a secondary number. The retry carries a hint, so counting it would overstate real recall; matches Anki/FSRS lapse-on-first-grade semantics. (Charter assumption #7 confirmed.)

**2026-07-07 — Q (reviewer round 2, Q2.1):** When a session crosses the 2-hour maxTimeMs ceiling while the fatigue signal is silent, in-band advisory or session_status only?
**A:** In-band + session_status — the ceiling injects a recurring in-band stopping advisory into `teach_next`/`submit_answer` (same advisory channel as the fatigue signal) and `session_status` reflects it. A non-polling agent still gets stopping guidance; consistent with the in-band choice for break prompts. (Charter assumption #10 confirmed.)

## Deferred
