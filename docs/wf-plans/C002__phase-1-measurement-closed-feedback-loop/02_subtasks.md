# C002 — sub-task decomposition

**Updated:** 2026-07-07
**Decomposed by:** claude-fable-5

## Coverage map

| Outcome | Covered by |
|---------|-----------|
| OUT-1 | SUB-1 |
| OUT-2 | SUB-2 |
| OUT-3 | SUB-3 |
| OUT-4 | SUB-4 |
| OUT-5 | SUB-5 |
| OUT-6 | SUB-6 |
| OUT-7 | SUB-7 |

## Dependency order

1. SUB-1
2. SUB-2 (depends on SUB-1)
3. SUB-3 (depends on SUB-1, SUB-2)
4. SUB-4 (depends on SUB-3)
5. SUB-5 [P] (depends on SUB-1)
6. SUB-6 [P] (depends on SUB-1)
7. SUB-7 [P] (depends on SUB-1)

## Published ids

Umbrella: NEU-842

| Sub-task | Tracker id |
|----------|-----------|
| SUB-1 | NEU-843 |
| SUB-2 | NEU-844 |
| SUB-3 | NEU-845 |
| SUB-4 | NEU-846 |
| SUB-5 | NEU-847 |
| SUB-6 | NEU-848 |
| SUB-7 | NEU-849 |

---

## SUB-1: Verify every charter-baked code fact against the current repo and publish the drift report

**Covers:** OUT-1
**Complexity:** S
**Type:** feat
**Depends on:** —
**Actor:** The implementation pipeline (and the system owner relying on it) — every later sub-task executes against verified, current code facts instead of a possibly stale charter.

**Problem slice:** The C002 charter was written on 2026-07-07 while Phase 0 (umbrella NEU-832, sub-tasks NEU-833–NEU-841) was actively changing the same code paths — NEU-837 modifies the `submit_answer` path, NEU-839's config audit may have already removed dead-config targets. If implementation starts from the charter's file:line facts without re-verification, edits may land in the wrong place or duplicate/contradict Phase 0 work.

**Desired outcome:** A drift report at `docs/wf-plans/C002__phase-1-measurement-closed-feedback-loop/04_drift-check.md` in which every code fact the charter bakes in is marked **HOLDS**, **SHIFTED** (with the new location), or **INVALIDATED**, with grep/read evidence. Any INVALIDATED fact produces a recorded amendment to the affected sub-task brief (or the charter) before that sub-task's implementation begins. All other C002 sub-tasks are blocked until this report exists.

**In scope:** Grep/read-level verification of the six charter fact groups, recorded per-fact in `04_drift-check.md`:
- (a) the `submit_answer` second-failure path and response shapes (charter cites src/orchestration/teaching-workflows.ts:1090–1163 and src/domain/types/teaching.ts) — NEU-837 changes this same path;
- (b) whether NEU-839 already wired or deleted any of the dead-config targets: `src/domain/services/cognitive-load.ts`, the `sessionComposition` config block, the `recommendationConfig.cognitiveLoad` knobs;
- (c) the analytics module shapes: src/server/analytics-tools.ts, src/orchestration/analytics-workflows.ts, src/domain/services/analytics-calculator.ts, `ReviewPersistencePort`;
- (d) the schema fields relied on for snapshot capture: `session_question_attempts`, `learning_chunks` SR columns (`next_review_at`, `ease_factor`, `repetitions`, `interval_days`), `session_chunks.teachingApproach` (charter cites src/infrastructure/db/schema.ts:59–65, 137, 197–228);
- (e) the session-analyzer thresholds and `session_status` semantics (src/domain/services/session-analyzer.ts, src/domain/config/algorithm-defaults.ts:30–35 — `timeThresholdMs` 90 min, `maxTimeMs` 2 h);
- (f) the `classifyChunk` FSRS power-law retrievability formula treated as the implicit prediction model (src/domain/algorithms/classify-chunk.ts:37–66, including the R = 1.0 fresh-chunk band at lines 45–47).
Routing amendments for INVALIDATED facts into the affected sub-task briefs is part of this sub-task.

**Out of scope:** Any source-code change; fixing drift; re-researching pedagogy evidence; verifying anything not on the fact list above.

**Acceptance scenarios:**
- Given the six fact groups (a)–(f), when the drift check completes, then `04_drift-check.md` exists in the charter folder and lists every fact with a HOLDS / SHIFTED (new location given) / INVALIDATED verdict and file-level evidence.
- Given a fact marked INVALIDATED, when the report is finalized, then an amendment against the affected sub-task brief (or the charter) is recorded, and that sub-task does not start implementation until the amendment lands.
- Given NEU-839 already deleted part of the dead-config surface, when fact group (b) is checked, then the report states exactly what remains and SUB-7's scope is amended to the remainder.

**Constraints:** Grep/read-level verification only — target under one hour of agent effort, no re-research (charter OUT-1). Writes only the drift report and brief amendments; never modifies source.
**Assumptions:** Phase 0 (NEU-833–841) may be in any merge state at execution time — the check handles fully merged, partially merged, or unmerged states identically by reading the repo as it is.
**Verification evidence:** Presence and completeness of `04_drift-check.md` covering all six fact groups; every listed fact carries a verdict and evidence; downstream sub-task briefs show amendments wherever a verdict was INVALIDATED.

---

## SUB-2: Capture a per-review scheduling snapshot on every scored attempt

**Covers:** OUT-2
**Complexity:** M
**Type:** feat
**Depends on:** SUB-1
**Actor:** The system owner — this is the data foundation that makes retention and calibration computable at all; the future dashboard reuses the same rows.

**Problem slice:** `session_question_attempts` persists `passed`, `quality`, `agent_quality`, `time_spent_ms`, `created_at` for every scored answer, but `learning_chunks` holds only the *current* SR state, mutated on each review. No table records what the interval, overdueness, or predicted recall were at answer time — so pass-rate-at-due-time and predicted-vs-observed calibration cannot be computed for any attempt, past or future.

**Desired outcome:** From cutover, every scored attempt is persisted together with the chunk's scheduling snapshot at answer time — at minimum: the implicit predicted-recall probability (the `classifyChunk` FSRS power-law estimate), the interval (days), and days overdue. One additive Drizzle migration; no historical rows rewritten.

**In scope:** Additive schema change (new columns on the attempts table or a companion table — spec decides); computing the snapshot at scoring time via a pure domain function; persisting it through the existing port/adapter path; explicit representation of the fresh/no-interval band where `classifyChunk` returns R = 1.0, so downstream calibration can treat that band distinctly; DB-backed integration tests on the capture path and migration. Whether historical attempts are approximately backfilled by deterministic replay of the SM-2 sequence is a decision for this sub-task's spec phase (charter assumption #6) — the default is no backfill, metrics downstream report coverage instead; nothing here may foreclose Phase 3's FSRS replay machinery.

**Out of scope:** Computing any metric from the snapshots (SUB-3, SUB-4); rewriting or mutating historical rows (forbidden by the charter); any change to `submit_answer`'s response shape; rollout flags.

**Acceptance scenarios:**
- Given a chunk with SR state (interval, next-review date), when a scored answer is submitted, then the persisted attempt carries predicted-recall probability (per the `classifyChunk` formula evaluated at answer time), interval in days, and days overdue.
- Given a fresh or no-interval chunk (the `classifyChunk` R = 1.0 band), when a scored answer is submitted, then the snapshot records that state explicitly (not as an ordinary 1.0 that would silently distort calibration bins later).
- Given a database with pre-existing attempt rows, when the migration applies, then it completes cleanly and no existing row is modified.
- Given the capture path, when the DB-backed integration suite runs, then snapshot persistence is proven against a real database, not stubs.

**Constraints:** Additive migration only; `drizzle/meta/_journal.json` `when` timestamps stay monotonically increasing (project CLAUDE.md). Integration tests in `tests/integration/` are a hard ship-gate for this DB-mutating path — never deferred. Snapshot computation is a pure domain function (zero I/O, never throws); persistence goes through ports/adapters (hexagonal purity). Hard cutover, no new rollout flags.
**Assumptions:** Charter assumption #5 (additive forward-only snapshot persistence) — [unconfirmed], reviewer-routed. The `classifyChunk` power-law is the system's only predicted-recall estimate and is captured as-is (fact group (f), verified by SUB-1 before this starts).
**Verification evidence:** DB-backed integration tests on the capture path; migration applies cleanly to a database with existing data; type-check passes.

---

## SUB-3: Expose true retention rate through a new analytics_health tool

**Covers:** OUT-3
**Complexity:** M
**Type:** feat
**Depends on:** SUB-1, SUB-2
**Actor:** The system owner / operator validating the scheduler — first-ever answer to "does pass rate at due time hold up?", and the baseline every later scheduler change (including the Phase 3 FSRS migration) is judged against.

**Problem slice:** The only analytics that exist (`analytics_daily` / `analytics_window`) aggregate quality-by-date KPIs. No code computes true retention — pass rate at due time — so months of review history say nothing about whether the scheduler works. Anki ships this as a first-class "True Retention" table; this system has zero pass/fail-at-due-time aggregation.

**Desired outcome:** A new dedicated `analytics_health` MCP tool returns true retention — defined as **first-attempt** pass rate at due time (the pivot-hint retry never counts toward the primary figure), with eventual-pass rate reported alongside as a secondary figure. The headline population is measurably defined: first attempts on chunks whose SUB-2 snapshot shows an **established interval** (interval > 0); fresh-band attempts (the `classifyChunk` R = 1.0 no/zero-interval band) are excluded from the headline and reported separately, mirroring Anki's True Retention excluding learning-stage cards (charter assumption #14). Overdue attempts count toward the headline — days-overdue is a breakdown axis, not an exclusion. Breakdowns cover teaching tier, interval band, and days-overdue band, every figure accompanied by its underlying sample size/coverage. Metrics compute over snapshot-bearing rows (from SUB-2) and honestly report how much history is covered.

**In scope:** Pure domain computation of true retention from attempt + snapshot rows; the confirmed metric definition (charter assumption #7, confirmed by user 2026-07-07: the **first** attempt of a scored question is the retrieval event, since the retry carries a pivot hint; eventual-pass rate is reported alongside as a secondary figure but does not define the metric); the headline-population rule (charter assumption #14: established-interval chunks only — snapshot interval > 0; fresh-band attempts reported as a separate figure, never in the headline; days-overdue is a breakdown axis, not an exclusion — spec sets the overdue band edges); minimum-N handling for thin bands (spec sets the threshold); new port query methods and Drizzle adapter implementation; orchestration workflow; server tool registration for `analytics_health` (snake_case schema fields, `toolData`/`toolError` envelope, `isError` conformance); output field names designed as the future dashboard contract (stable names, breakdowns, coverage figures); unit tests on the pure computation with known fixtures; integration test through the tool.

**Out of scope:** Calibration (SUB-4 adds it to this same tool); any change to `analytics_daily`/`analytics_window` (their shapes are untouched — intake decision); forgetting-curve fits, lapse-rate, or time-to-relearn metrics (explicit charter non-goals); any UI or dashboard; per-user scoping (single shared dataset until Phase 2 tenancy).

**Acceptance scenarios:**
- Given a dataset of snapshot-bearing attempts with known pass/fail distribution, when `analytics_health` is called, then the response contains overall (headline) true retention plus per-teaching-tier, per-interval-band, and per-days-overdue-band breakdowns, each with its sample size, matching hand-computed fixture values.
- Given a fixture where a question fails on the first attempt and passes on the pivot-hint retry, when the metrics are computed, then the primary true-retention figure counts it as not retained (lowering true retention) while the secondary eventual-pass rate counts it as passed (raising eventual-pass).
- Given a fixture containing fresh-band attempts (snapshot in the `classifyChunk` R = 1.0 no/zero-interval band), when the metrics are computed, then those attempts are excluded from the headline true-retention figure yet appear in the separately reported fresh-band figure with its own sample size.
- Given a fixture with overdue attempts on established-interval chunks, when the metrics are computed, then those attempts count toward the headline figure and land in their days-overdue band — overdueness never excludes an attempt.
- Given few or no snapshot-bearing rows, when `analytics_health` is called, then the tool returns honest low-coverage figures with explicit sample sizes and coverage — never authoritative-looking aggregates over thin data; bands below the minimum-N threshold are flagged or suppressed per the spec's rule.
- Given a metric-computation failure, when `analytics_health` is called, then a valid MCP error envelope is returned (fail-open; the server never crashes).

**Constraints:** Retention computation is a pure domain function — zero I/O, never throws; data reaches it through ports/adapters. `analytics_health` is the single new tool this charter adds (a deliberate +1 against Phase 2's consolidation goal — intake decision). Snake_case in the MCP schema, camelCase internally, converted in `src/server/*-tools.ts`. Every aggregate carries sample size/coverage (honest-metrics principle). Hard cutover, no new rollout flags.
**Assumptions:** Charter assumption #7 (first-attempt-defined retention; eventual-pass reported alongside as a secondary figure) — confirmed (user answer 2026-07-07, reviewer round 1 Q1.1). Charter assumption #14 (headline population = established-interval chunks, snapshot interval > 0; fresh-band attempts excluded from the headline and reported separately; days-overdue a breakdown axis, not an exclusion) — [unconfirmed], reviewer-routed. Charter assumption #6 (no historical backfill by default; coverage reported instead) — [unconfirmed], owned by SUB-2's spec; this sub-task reports coverage regardless of that outcome.
**Verification evidence:** Unit tests on the pure metric computation with known fixtures, including a second-attempt-pass fixture that lowers true retention but raises eventual-pass, and a fresh-band fixture that is excluded from the headline yet appears in the separate fresh figure; DB-backed integration test through the registered tool; sample-size/coverage fields present in every returned figure.

---

## SUB-4: Add predicted-vs-observed calibration to analytics_health

**Covers:** OUT-4
**Complexity:** M
**Type:** feat
**Depends on:** SUB-3
**Actor:** The system owner / operator — reveals whether the scheduler's implicit recall predictions match reality, the axis the FSRS benchmark uses and the prerequisite for judging the Phase 3 FSRS migration.

**Problem slice:** Even with retention queryable (SUB-3), there is no check that the system's predicted-recall probabilities mean anything. The `classifyChunk` FSRS power-law estimate is the system's only prediction model and it has never been compared against observed outcomes — no RMSE-bins, no log-loss, nothing.

**Desired outcome:** The `analytics_health` tool (created in SUB-3) additionally returns a calibration comparison of the implicit predicted-recall probability (from the SUB-2 snapshots) vs. observed pass rate — RMSE-bins per the FSRS benchmark methodology, or log-loss — with bin sizes/coverage reported on every figure. The observed outcome per review event is the **first-attempt** result: one observation per scored question; the pivot-hint retry carries the same predicted R and never enters the observation set (charter assumption #15, mirroring the confirmed first-attempt retention definition).

**In scope:** Pure domain calibration computation (bucket snapshot-bearing attempts by predicted probability, compare to observed pass rate); the first-attempt observation rule (charter assumption #15: one observation per scored question, its observed outcome the first-attempt result; the pivot-hint retry never enters the observation set); the spec-phase choice between RMSE-bins and log-loss (or both), made with the actual data volume in view — RMSE-bins may be unstable at small N (charter risk); explicit handling of the fresh/no-interval band where predictions are R = 1.0, so it cannot distort calibration bins (segregate or exclude per spec); bin sizes and coverage in the output; extension of the `analytics_health` response shape (additive to SUB-3's contract, same dashboard-contract discipline); unit tests with fixtures of known calibration error.

**Out of scope:** Creating the tool, port, or workflow scaffolding (SUB-3 owns that); retention metrics (SUB-3); forgetting-curve fitting or any new prediction model — the existing `classifyChunk` estimate is calibrated **as-is**; any change to `analytics_daily`/`analytics_window`; UI.

**Acceptance scenarios:**
- Given fixtures with a known calibration error (predicted probabilities vs. constructed outcomes), when the calibration computation runs, then the reported RMSE-bins (or log-loss) matches the expected value.
- Given a fixture where a question fails on the first attempt and passes on the pivot-hint retry, when calibration is computed, then the observation set is unchanged by the second attempt — exactly one observation for that question, its observed outcome the first-attempt failure.
- Given attempts in the R = 1.0 fresh-chunk band, when calibration is computed, then that band is handled explicitly per the spec's rule (segregated or excluded) and does not distort the remaining bins.
- Given bins with few samples, when `analytics_health` returns calibration, then each bin's size is reported and thin bins are flagged or suppressed per the minimum-N rule — never presented as authoritative.

**Constraints:** Calibration computation is a pure domain function — zero I/O, never throws. Output rides `analytics_health` only (no second tool; no extension of the date-window KPI tools). Every figure carries bin size/coverage (honest-metrics principle). Snake_case at the tool boundary. Hard cutover, no new rollout flags.
**Assumptions:** The `classifyChunk` FSRS power-law retrievability is calibrated as-is as the system's implicit prediction model (fact group (f), verified by SUB-1). Charter assumption #15 (the first-attempt result defines each calibration observation — one per scored question; the pivot-hint retry never enters the observation set) — [unconfirmed], reviewer-routed; inferred from confirmed assumption #7. RMSE-bins-vs-log-loss is a spec-phase decision for this sub-task (charter risk log) — not pre-decided here.
**Verification evidence:** Unit tests on the pure computation with fixtures of known calibration error, including one where a second-attempt pass leaves the calibration observations unchanged; tool-level test showing calibration fields, bin sizes, and coverage in the `analytics_health` response.

---

## SUB-5: Surface the correct answer after a second failed attempt

**Covers:** OUT-5
**Complexity:** S
**Type:** feat
**Depends on:** SUB-1
**Actor:** The learner (via the AI agent) — corrective feedback lands at the moment with the largest confirmed effect size in the pedagogy audit (Pashler et al. 2005: +494% final retention from supplying the correct answer after an error).

**Problem slice:** After a second failed attempt, `submit_answer` marks the question answered and returns `recorded` with nothing else — the failure is silently recorded and the learner moves on without ever seeing the correct answer.

**Desired outcome:** On a second failed attempt, `submit_answer`'s `recorded` response additionally carries a correct-answer block: chunk-derived answer/explanation material plus a directive instructing the agent to present it before moving on. Additive field only; light-touch exposure — no forced restudy, no state-machine change, scheduling untouched.

**In scope:** The additive correct-answer block on the second-failure `recorded` response, built from server-held chunk material — `content` and `condensed_summary` (both nullable) plus title — since the server holds no per-question canonical answer; graceful degradation when `content` is null (directive plus whatever material exists); updates to agent-facing instructions/prompt-pack so agents are required to honor the block; updating existing tests that assert the current `submit_answer` response shape; unit tests on the submit path.

**Out of scope:** Any teaching-flow state-machine change or new flow step (intake decision — additive response field only); forced restudy or scheduling changes; per-question canonical answers or generated answers; changes to pass or first-fail responses; the fatigue advisory block (SUB-6, which touches the same responses — coordinate shapes at spec time but ship independently).

**Acceptance scenarios:**
- Given a session question failed twice, when `submit_answer` records the second failure, then the `recorded` response carries the correct-answer block (chunk-derived material + presentation directive) and scheduling proceeds exactly as today.
- Given a first failed attempt or a passing attempt, when `submit_answer` responds, then the response gains no correct-answer block — existing fields and actions untouched, unchanged from today except blocks owned by SUB-6 (its fatigue/stopping advisory is an independent, orthogonal block that may appear on any teaching response).
- Given a chunk whose `content` is null, when the second failure occurs, then the block degrades to the directive plus available material (title, condensed summary), and recording the attempt is never blocked.

**Constraints:** Additive response evolution only — existing fields, actions, and the retry/recorded state machine are unchanged (charter constraint). Block injection is best-effort and must never fail an otherwise-successful call (fail-open). Hard cutover, no new rollout flags. NEU-837 (Phase 0) modifies this same path — SUB-1's verdict on fact group (a) gates this sub-task; if INVALIDATED, the amended brief governs.
**Assumptions:** Charter assumption #8 (block = chunk material + directive; no canonical per-question answer exists server-side) — [unconfirmed], reviewer-routed. Charter assumption #2 (additive field, no flow change) — confirmed at intake.
**Verification evidence:** Unit tests: second-fail response gains the block; pass and first-fail responses gain no correct-answer block and are otherwise unchanged except blocks owned by SUB-6 — SUB-5's fixtures hold the fatigue signal silent so these assertions stay stable after SUB-6 lands; null-content degradation covered. Existing response-shape tests updated in the same change.

**Amendment (SUB-1 drift check, 2026-08-04 — see `04_drift-check.md` fact group (a)):** Fact (a) verdict is SHIFTED, not INVALIDATED, but materially — apply before starting implementation. Target function is `submitAnswerForQuestion` in `src/orchestration/teaching-workflows.ts:952–1216` (not the charter's cited 1090–1163). Second-failure detection is `if (!passed && attemptNumber === 2)` at line 1171. The `recorded` return to extend is at **line 1199** — the one inside `submitAnswerForQuestion`. Do **not** use the `recorded` return at line 1387; that one belongs to `submitAnswerForAssessmentQuestion` (single-attempt assessment mode, no retry concept) and is out of scope. The response type `SubmitAnswerRecorded` (`src/domain/types/teaching.ts:200–211`) already carries an additive optional `roadblock_forecast?: RoadblockForecast` field (NEU-600, added after this charter was written) — the new correct-answer block field must coexist with it as an independent optional field; fixtures should not assume `roadblock_forecast`'s presence or absence.

---

## SUB-6: Replace the fixed 90-minute break trigger with a measured fatigue advisory

**Covers:** OUT-6
**Complexity:** L
**Type:** feat
**Depends on:** SUB-1
**Actor:** The learner in a long session (via the agent) — a measured, personal stopping signal instead of an unvalidated fixed clock.

**Problem slice:** `time_spent_ms` is collected on every attempt but never analyzed. Session guidance runs on fixed clocks — the 90-minute `timeThresholdMs` and 2-hour `maxTimeMs` drive `session_status`'s continue/complete/break recommendation — and the pedagogy audit found no evidence anchoring either number; the strongest evidence favors periodic micro-breaks over a single cutoff.

**Desired outcome:** A per-session fatigue signal — rising per-attempt latency plus falling quality, computed from persisted attempts — triggers an advisory block injected into `teach_next` and `submit_answer` responses, recurring while the signal persists. The 90-minute `timeThresholdMs` clock stops being the **break** trigger: the `timeMet && progress ≥ 0.5` → 'break' branch in the session analyzer is replaced by the fatigue signal, while the `qualityMet && timeMet` → 'complete' branch survives unchanged — `SM_SESSION_TIME_THRESHOLD_MS`/`timeThresholdMs` continues to control the minimum-practice-time input to that completion heuristic and remains a read knob (charter assumption #13). `session_status`'s recommendation is aligned with the same signal so the two surfaces never contradict. The 2-hour `maxTimeMs` ceiling stays as a documented engineering-default backstop **delivered in-band too**: once session elapsed time crosses the ceiling, a recurring stopping advisory rides the same `teach_next`/`submit_answer` advisory channel, with `session_status` aligned — an agent that never polls still gets stopping guidance. Session/day thresholds (`SM_SESSION_TIME_THRESHOLD_MS`, `SM_SESSION_MAX_TIME_MS`, `SM_DAILY_CAP_NEW`, `SM_DAILY_CAP_REVIEWS`) are documented as engineering defaults, not evidence-derived.

**In scope:** A pure domain fatigue-trend function over the session's persisted attempts (within-session *relative* trend — latency direction plus quality direction — not an absolute threshold, to absorb noisy agent-reported timing); advisory-block injection into `teach_next` and `submit_answer` responses while the signal fires; re-deriving (or aligning) `session_status`'s continue/complete/break recommendation from the same signal; replacing the `timeMet && progress ≥ 0.5` → 'break' branch with the fatigue signal while leaving the `qualityMet && timeMet` → 'complete' branch unchanged; the in-band `maxTimeMs` backstop — a recurring stopping advisory on the same `teach_next`/`submit_answer` channel once session elapsed time crosses the 2-hour ceiling, aligned with `session_status`; updating the prose that documents the old behavior (charter cites src/shared/instructions.ts:49 and src/shared/prompts/prompt-pack.ts:570) and requiring agents to honor advisories; documenting the four `SM_*` thresholds as engineering defaults; unit tests on the trend computation, advisory presence, completion-branch survival, and the ceiling backstop.

**Out of scope:** Any polling, notification, or session-lifecycle machinery (the 2026-07-28 MCP spec RC removes protocol sessions — charter non-goal); server-forced interruption of the teaching flow (advisory-only, always); removing `session_status` or the `maxTimeMs` ceiling; retiring the `qualityMet && timeMet` → 'complete' completion branch or the `SM_SESSION_TIME_THRESHOLD_MS` knob (it remains a read input to that heuristic); new env flags; the correct-answer block (SUB-5, which touches the same responses — coordinate shapes at spec time but ship independently); per-user scoping.

**Acceptance scenarios:**
- Given fixtures with rising per-attempt latency and falling quality, when the trend function runs, then the fatigue signal fires; given stable or too-short sessions, then it stays silent (never throws).
- Given a firing signal, when `teach_next` or `submit_answer` responds, then the response carries the break-advisory block, and the block recurs on subsequent responses while the signal persists; the server never interrupts the flow.
- Given any session state, when `session_status` and a teaching response are produced from the same attempts, then their break guidance agrees — the advisory and the recommendation never contradict.
- Given a session exceeding the 2-hour `maxTimeMs` ceiling while the fatigue signal is silent, when `teach_next` or `submit_answer` responds, then a recurring stopping advisory rides the same advisory channel and `session_status`'s recommendation is aligned — an agent that never polls still gets stopping guidance; sessions are never left with no stopping signal.
- Given a session meeting both the quality and minimum-practice-time thresholds, when `session_status` runs, then the `qualityMet && timeMet` → 'complete' recommendation still fires exactly as today — the completion branch is untouched.

**Constraints:** Trend computation is a pure domain function — zero I/O, never throws (hexagonal purity). Fatigue-trend computation must not add hot-path DB cost: it computes from attempt data the teaching workflow already loads, or at most one additional indexed per-session query over `session_question_attempts` — never a cross-session scan (charter risk mitigation). Advisory injection is best-effort and must never fail an otherwise-successful teaching call (fail-open). Additive response blocks only — existing fields and actions unchanged. Hard cutover, no new rollout flags; existing `SM_*` knobs keep working. Docs/tests that encode the old 90-minute behavior are updated in the same change.
**Assumptions:** Charter assumption #10 (`maxTimeMs` stays as hard backstop, surfaced both through `session_status` and as a recurring in-band stopping advisory on the same channel; only the 90-minute break-trigger semantics change) — confirmed (user answer 2026-07-07, reviewer round 2 Q2.1). Charter assumption #13 (the `qualityMet && timeMet` → 'complete' branch survives unchanged; `timeThresholdMs` remains a read knob feeding it) — [unconfirmed], reviewer-routed. Charter assumption #11 (`session_status` retained and aligned with the signal) — [unconfirmed], reviewer-routed. Charter assumption #3 (in-band advisory delivery, no polling) — confirmed at intake. Agent-reported `time_spent_ms` fidelity is accepted with the trend-not-threshold mitigation (charter risk log).
**Verification evidence:** Unit tests: trend fires on deteriorating fixtures, silent on stable/short ones; advisory present in `teach_next`/`submit_answer` responses while firing; ceiling-backstop advisory present once elapsed time crosses `maxTimeMs`; the quality+time completion branch still recommends 'complete'; `session_status` agreement covered; docs check confirms threshold documentation and updated prose.
**Spec-time split guidance (reviewer F2.5):** Complexity L is accepted as-is, but this is the largest single downstream run in the set. If it overruns at spec time, split along the natural seam the reviewer identified: (1) fatigue-signal work — the pure trend function, dual-response advisory injection, break-branch replacement, and `session_status` alignment; (2) ceiling-backstop delivery — the in-band `maxTimeMs` stopping advisory plus the threshold-documentation/prose updates. Otherwise ship as one PR.

**Amendment (SUB-1 drift check, 2026-08-04 — see `04_drift-check.md` fact group (e)):** The session-analyzer thresholds and branches this sub-task touches HOLD, with only trivial one-line drift (`algorithm-defaults.ts` sessionConfig now at lines 31–36; the `'complete'`/`'break'` branches in `session-analyzer.ts` now at 120–125/127–133). The doc citation SHIFTED materially: `src/shared/instructions.ts:49` no longer holds the break-recommendation prose (that line is now inside an unrelated section). The correct citation is **`src/shared/instructions.ts:65`**: `- session_status: session metrics and completion checks. Returns progress, quality, and a continue/complete/break recommendation.` This prose is already generic — no hardcoded "90 minutes" to remove; the required update here is semantic (reflect the fatigue-driven break signal), not textual deletion of a stale number. `src/shared/prompts/prompt-pack.ts:570` is unaffected — it matches the charter's citation exactly and needs the same semantic update in place.

---

## SUB-7: Delete the dead cognitive-load model and session-composition config

**Covers:** OUT-7
**Complexity:** S
**Type:** feat
**Depends on:** SUB-1
**Actor:** Maintainers and the system owner — the config surface stops pretending to sophistication the system doesn't have; an uninvoked model is itself a measurement gap (pedagogy audit Q13 #6).

**Problem slice:** `calculateItemCognitiveLoad` (src/domain/services/cognitive-load.ts) has zero call sites. The `sessionComposition` config block (maxNew caps, easy-medium-hard `interleaveStrategy`) is typed, defaulted, and parsed from six env vars but read by nothing. Dead pedagogy surface misleads anyone auditing what the system actually measures.

**Desired outcome:** `src/domain/services/cognitive-load.ts` is deleted. The `sessionComposition` block is deleted from the config type, defaults, and env parsing (`SM_REC_MAX_NEW_DEFAULT`, `SM_REC_SHORT_SESSION_MIN`, `SM_REC_MAX_NEW_SHORT`, `SM_REC_LONG_SESSION_MIN`, `SM_REC_MAX_NEW_LONG`, `SM_REC_INTERLEAVE_STRATEGY`). Per charter assumption #9, the parsed-but-never-read `recommendationConfig.cognitiveLoad` knobs (`SM_REC_MAX_COG_LOAD_DEFAULT`, `SM_REC_COG_EASY_THRESHOLD`, `SM_REC_COG_HARD_THRESHOLD`, `SM_REC_COG_PER_MIN_FACTOR`) go too. No pedagogy config remains parsed-but-unread — and the audit scope is exactly these ten vars (the six `sessionComposition` vars plus the four `cognitiveLoad` knobs), nothing broader.

**In scope:** Deleting the module, the config type members, defaults, and env parsing listed above (charter cites src/domain/config/algorithm-defaults.ts and src/config/resolve-algorithm-config.ts:114–140); removing their tests and any doc references; a zero-reference grep and a config audit scoped to exactly the ten enumerated pedagogy knobs, confirming none remains parsed-but-unread. If SUB-1's drift check (fact group (b)) found NEU-839 already removed part of this surface, only the verified remainder is deleted, per the amended brief.

**Out of scope:** Implementing or wiring any interleaving — Phase 3 reimplements it fresh on the topic/category axis (charter non-goal; the easy/medium/hard axis is wrong per audit Q10). Wiring cognitive-load to anything (delete-not-wire is the confirmed intake decision). The inline `cognitiveLoad` field in sr-calculator.ts:231 — a `RankedItem` field built by `rankCandidatesWithConstraints`' output construction, computed without the deleted module or config — is untouched. The `recommendationConfig.conversation` knobs (`SM_REC_CONVO_ENCOURAGEMENT`, `SM_REC_CONVO_PROGRESS`, `SM_REC_CONVO_VERBOSITY`, charter cites src/config/resolve-algorithm-config.ts:141–155) — parsed-but-unread today but conversation/presentation surface, not pedagogy: explicitly outside the audit and untouched by this charter. The measured fatigue signal (SUB-6) that supersedes cognitive-load.

**Acceptance scenarios:**
- Given the deletion, when `pnpm type-check` runs, then it passes, and grep for every deleted symbol and env var (`cognitive-load`, `calculateItemCognitiveLoad`, `sessionComposition`, `interleaveStrategy`, all ten `SM_REC_*` vars above) returns zero references in `src/` and `tests/`.
- Given SUB-1's fact-group-(b) verdict that NEU-839 already removed part of the surface, when this sub-task executes, then only the remaining surface is deleted and no duplicate or conflicting removal is attempted.
- Given the deletion has landed, when `rankCandidatesWithConstraints` output is inspected, then the `cognitiveLoad` field on each returned `RankedItem` (built inline in sr-calculator.ts:231, without the deleted module or config) remains present and unchanged.
- Given the config audit, when it completes, then its scope is exactly the ten enumerated pedagogy vars, and the three `SM_REC_CONVO_*` conversation knobs remain parsed and untouched.

**Constraints:** Delete, not wire (intake decision, confirmed). The config audit after the change confirms none of the ten enumerated pedagogy knobs remains parsed-but-unread — audit scope is exactly those ten; the `SM_REC_CONVO_*` conversation knobs are outside it (charter assumption #9). Hard cutover, no new rollout flags. Type-check plus zero-reference grep gate the deletion (charter risk mitigation for unseen consumers).
**Assumptions:** Charter assumption #4 (delete posture for both targets) — confirmed at intake. Charter assumption #9 (deletion extends to the `recommendationConfig.cognitiveLoad` knobs; the inline sr-calculator output field stays) — [unconfirmed], reviewer-routed.
**Verification evidence:** Type-check passes; zero-reference grep output for all deleted symbols and env vars; config audit confirms none of the ten enumerated pedagogy knobs remains parsed-but-unread, with the `SM_REC_CONVO_*` conversation knobs untouched.

**Amendment (SUB-1 drift check, 2026-08-04 — see `04_drift-check.md` fact group (b) and the Amendment 3 note):** Confirmed nothing was pre-removed — NEU-839's actual scope was the unrelated leech-flagging config audit (OUT-8/C001); this sub-task's ten-knob deletion list and module deletion are fully live work, unchanged. Two citation-only corrections before implementation: the untouched inline `cognitiveLoad` field on `RankedItem` is now at **`src/domain/algorithms/sr-calculator.ts:346`** (not line 231), inside `rankCandidatesWithConstraints`'s output construction. In `src/config/resolve-algorithm-config.ts`, `sessionComposition` parsing is now at **lines 118–144** (not 114–140) and the out-of-scope `conversation`/`SM_REC_CONVO_*` block is now at **lines 145–159** (not 141–155) — both shifted down 4 lines by the `cognitiveLoad` knob block now parsed just above `sessionComposition` (lines 100–117). No scope change.
