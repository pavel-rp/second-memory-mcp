# C002 — Review log

Reviews: 3 · Revisions used: 2 of 3

## Round 1 — 2026-07-07

**Audited by:** claude-fable-5

```
REVIEWER — Round 1: FINDINGS
Model: claude-fable-5
Coverage: 7/7 outcomes
Findings: 6 (0 critical, 0 high, 4 medium, 2 low)
- F1.1 | MEDIUM | confidence high | route charter-writer | check 6 | 01_charter.md § Outcomes (OUT-6) | quote: "the fixed 90-minute `timeThresholdMs` clock stops being the break trigger" | issue: In src/domain/services/session-analyzer.ts the 90-min `timeMet` drives two branches — the 'break' path (lines 127–132) and a `qualityMet && timeMet` → `shouldComplete/'complete'` path (lines 120–126) — and the charter retires only the break role, leaving undefined whether the completion branch survives (fixed clock persists unmentioned) or is removed (making `SM_SESSION_TIME_THRESHOLD_MS` parsed-but-unread, colliding with the "existing `SM_*` knobs keep working" constraint and OUT-7's no-parsed-but-unread audit). | fix: State explicitly what happens to the `qualityMet && timeMet` completion branch and what `SM_SESSION_TIME_THRESHOLD_MS` controls after the change.
- F1.2 | MEDIUM | confidence medium | route charter-writer | check 6 | 01_charter.md § Outcomes (OUT-7) | quote: "config audit shows no parsed-but-unread pedagogy fields" | issue: "pedagogy fields" is undefined while `recommendationConfig.conversation` (`SM_REC_CONVO_ENCOURAGEMENT`, `SM_REC_CONVO_PROGRESS`, `SM_REC_CONVO_VERBOSITY`, src/config/resolve-algorithm-config.ts:143–153) is also parsed and read by nothing, so the audit either false-fails or invites deleting knobs the intake never sanctioned. | fix: Enumerate exactly which fields the audit covers (or explicitly exclude the conversation knobs as non-pedagogy).
- F1.3 | MEDIUM | confidence medium | route user | check 13 | 01_charter.md § Assumptions & decisions (#7) | quote: "True retention counts the **first** attempt of a scored question as the retrieval event" | issue: This [unconfirmed] assumption defines the semantics of the headline metric that becomes the future dashboard contract, yet it is delegated to SUB-3's spec phase instead of being confirmed by the user. | fix: Confirm the retention definition with the user (see Q1.1) and mark #7 confirmed or amended.
- F1.4 | MEDIUM | confidence medium | route charter-writer | check 12 | 01_charter.md § Risks | quote: "The 2-hour `maxTimeMs` hard ceiling stays as a documented engineering-default backstop (assumption #10)" | issue: The backstop is only ever surfaced through `session_status` (SUB-6's scenario tests it there alone), a polling-dependent surface the charter's own in-band rationale de-emphasizes — so an agent that never polls gets no stopping guidance in a marathon session where the fatigue signal stays silent. | fix: State whether the `maxTimeMs` backstop also injects an in-band advisory into `teach_next`/`submit_answer`, or explicitly accept session_status-only delivery.
- F1.5 | LOW | confidence medium | route decomposer | check 3 | 02_subtasks.md § SUB-5 (Verification evidence) | quote: "pass and first-fail responses are byte-stable" | issue: Parallel SUB-6 injects fatigue advisories into the same `submit_answer` responses (including pass/first-fail), so byte-stability only holds if SUB-5's tests pin the fatigue signal silent — as worded, the two [P] sub-tasks' acceptance criteria can contradict after both land. | fix: Reword to "unchanged except blocks owned by SUB-6" or require SUB-5 fixtures to hold the fatigue signal silent.
- F1.6 | LOW | confidence low | route charter-writer | check 12 | 01_charter.md § Risks | quote: "Teaching-path response bloat (advisory + answer blocks on the hot path)" | issue: The risk table covers response size but not the added per-call cost of loading the session's attempt history to compute the fatigue trend on every `teach_next`/`submit_answer`. | fix: Add a risk/constraint noting the trend must compute from data already fetched or one indexed per-session query.
Questions for user:
- Q1.1 | Should true retention be defined by the first attempt of a scored question (eventual-pass reported alongside), or by eventual pass across both attempts? | options: first-attempt defines the metric (charter default; retry carries a pivot hint, so eventual-pass overstates recall) | eventual-pass defines the metric | context: This fixes the semantics of the headline metric and the future dashboard contract, and it is currently an [unconfirmed] assumption deferred to a downstream spec phase.
```

## Round 2 — 2026-07-07

**Audited by:** claude-fable-5

```
REVIEWER — Round 2: FINDINGS
Model: claude-fable-5
Coverage: 7/7 outcomes
Findings: 5 (0 critical, 0 high, 4 medium, 1 low)
- F2.1 | MEDIUM | confidence high | route charter-writer | check 4 | 01_charter.md § Outcomes (OUT-4) | quote: "returns a calibration comparison of implicit predicted-recall probability vs. observed pass rate — RMSE-bins per the FSRS benchmark methodology, or log-loss" | issue: Assumption #7 fixed first-attempt semantics for true retention, but neither OUT-4 nor SUB-4 states whether calibration's "observed pass rate" uses first-attempt outcomes only — the attempt-2 retry carries a pivot hint and the same predicted R, so including it (or bucketing both attempts as separate observations) systematically inflates observed recall and biases calibration. | fix: State that calibration's observed outcome per review event is the first-attempt result, one observation per scored question, mirroring assumption #7.
- F2.2 | MEDIUM | confidence medium | route charter-writer | check 6 | 01_charter.md § Outcomes (OUT-3) | quote: "true retention — defined as **first-attempt** pass rate at due time" | issue: "at due time" has no measurable reading — the charter never states whether fresh/never-reviewed chunks (the classifyChunk R = 1.0 band, interval null/0 at src/domain/algorithms/classify-chunk.ts:45–47) and arbitrarily overdue attempts count in the headline population, while the cited precedent (Anki's True Retention) excludes learning-stage cards from exactly this figure. | fix: Define the headline population — e.g. only attempts on chunks with an established interval count, with days-overdue as a breakdown axis and fresh-band attempts excluded or reported separately.
- F2.3 | MEDIUM | confidence high | route decomposer | check 11 | 02_subtasks.md § SUB-7 (Acceptance scenarios) | quote: "when `calculateSR` output is inspected, then the inline `cognitiveLoad` field in sr-calculator.ts remains present and unchanged" | issue: The cognitiveLoad field at sr-calculator.ts:231 is produced by `rankCandidatesWithConstraints`' buildOutput (a `RankedItem` field), not by `calculateSR` (whose return is repetitions/easeFactor/interval/nextReview/leech) — the scenario as written inspects the wrong function's output and can never observe the field. | fix: Reword the scenario to inspect `rankCandidatesWithConstraints` output (`RankedItem.cognitiveLoad`) instead of `calculateSR`.
- F2.4 | MEDIUM | confidence medium | route user | check 13 | 01_charter.md § Assumptions & decisions (#10) | quote: "surfaced **both** through `session_status` and as a recurring in-band stopping advisory in `teach_next`/`submit_answer` (same advisory channel as the fatigue signal) once elapsed time crosses it" | issue: This [unconfirmed] assumption adds a new in-band advisory behavior the intake never sanctioned (the clarification covered only fatigue-signal break prompts) and it shapes SUB-6's in-scope work and the response contract — a genuine two-option product choice currently resting on a default. | fix: Confirm with the user (see Q2.1) and mark #10 confirmed or amend SUB-6 to session_status-only ceiling delivery.
- F2.5 | LOW | confidence low | route decomposer | check 9 | 02_subtasks.md § SUB-6 | quote: "**Complexity:** L" | issue: SUB-6 bundles five deliverables (pure trend function, dual-response advisory injection, session-analyzer break-branch replacement plus session_status alignment, the maxTimeMs in-band backstop, and docs/prose updates) — the largest single downstream run in the set and the most likely to overflow one PR/session. | fix: If it overruns at spec time, split along the natural seam of ceiling-backstop delivery vs. fatigue-signal work; otherwise accept L as-is.
Questions for user:
- Q2.1 | When a session crosses the 2-hour maxTimeMs ceiling while the fatigue signal is silent, should the server inject a recurring in-band stopping advisory into teach_next/submit_answer (charter default, assumption #10), or surface the ceiling through session_status only? | options: in-band advisory + session_status aligned (charter default) | session_status-only delivery | context: This fixes whether a non-polling agent ever receives stopping guidance in a marathon session and determines a whole delivery mechanism inside SUB-6's scope.
```

## Round 3 — 2026-07-07

**Audited by:** claude-fable-5

```
REVIEWER — Round 3: FINDINGS
Model: claude-fable-5
Coverage: 7/7 outcomes
Findings: 2 (0 critical, 0 high, 0 medium, 2 low)
- F3.1 | LOW | confidence high | route charter-writer | check 6 | 01_charter.md § Problem & why now | quote: "after a second failed attempt, `submit_answer` marks the question answered and returns `recorded` with nothing else (src/orchestration/teaching-workflows.ts:1124–1127)" | issue: The second-fail `recorded` response is not "nothing else" — it already carries `passed`/`quality`/`question_type` plus conditional `roadblock_forecast` (teaching-workflows.ts:1133–1150, which fires on failure paths when roadblockState.remaining > 0) and `late_submission` blocks, so SUB-5's correct-answer directive will coexist with the roadblock follow-up directive on the same response and the spec gets no signal to reconcile the two. | fix: Reword to "with no corrective content" (mirrored in SUB-5's problem slice) and note that the additive block coexists with the existing conditional `roadblock_forecast` block so SUB-5's spec orders the two directives.
- F3.2 | LOW | confidence medium | route decomposer | check 6 | 02_subtasks.md § SUB-3 | quote: "days-overdue is a breakdown axis, not an exclusion — spec sets the overdue band edges" | issue: Of the three breakdown axes, overdue band edges and the minimum-N threshold are explicitly delegated to the spec phase, but interval-band edges are never defined or delegated anywhere in the charter or SUB-3, leaving that term without an owner or measurable reading. | fix: Extend the clause to "spec sets the interval-band and days-overdue band edges".
Questions for user:
- (none)
```

## Accepted warnings

Accepted by user on 2026-07-07 (round 3, "Accept as-is"):

- F3.1 — `charter-writer|6|01_charter.md § Problem & why now` (second-fail response "nothing else" wording; SUB-5 spec must order correct-answer directive vs. existing roadblock_forecast block)
- F3.2 — `decomposer|6|02_subtasks.md § SUB-3` (interval-band edges owner; spec phase sets interval-band and days-overdue band edges)
