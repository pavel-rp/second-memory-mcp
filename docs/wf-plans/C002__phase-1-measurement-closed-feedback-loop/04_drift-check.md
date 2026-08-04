# C002 / OUT-1 — Drift check

**Covers:** OUT-1 (SUB-1, NEU-843)
**Checked against:** repo state on branch `feature/843-verify-charter-baked-code-facts-drift`, base `develop` @ `96b96c35ac39f4570b4ab491d916a51c81f9ba33`
**Checked on:** 2026-08-04
**Model:** claude-sonnet-5
**Scope:** grep/read-level verification only, per charter constraint — no source changes, no re-research

## Summary

All six fact groups were re-verified against the current repo. **No fact is INVALIDATED.** Two groups (d, f) HOLD exactly against the charter's original line citations. Two groups (e) HOLD in substance with only trivial (off-by-one) line drift, but one associated doc citation (`instructions.ts:49`) SHIFTED materially. Two groups (a, c) SHIFTED — group (a) materially (the file the charter cited grew from ~1,090 lines' worth of context to 1,922 total lines, and the second-failure logic moved and split across two candidate "recorded" return sites, only one of which is OUT-5's real target). Fact (b) resolves the charter's open question: NEU-839 removed **none** of OUT-7's targets — confirmed independently via Linear (NEU-839's actual scope was the unrelated leech-flagging config audit, OUT-8 of C001).

Also confirmed: **C001/Phase 0 (NEU-832) is Done** (completed 2026-07-08), and both `submit_answer`-touching NEU-837 and config-auditing NEU-839 are Done. The charter's High-severity risk "Phase 0 merges shift the touched paths before this charter executes" is therefore a **settled, closed question** — Phase 0 has already fully merged; this drift check is being run against its final state, not a moving target.

Three amendments are routed below to SUB-5 (NEU-847), SUB-6 (NEU-848), and SUB-7 (NEU-849) — none block those sub-tasks' starts, but each corrects a citation their briefs currently rely on.

| Group | Subject | Verdict | New location (if shifted) |
|---|---|---|---|
| (a) | `submit_answer` second-failure path & response shape | **SHIFTED** (material) | `teaching-workflows.ts:952–1216` (`submitAnswerForQuestion`); second-failure check line 1171; `recorded` return line 1199 |
| (b) | NEU-839 dead-config removal | **HOLDS** (nothing removed) | n/a |
| (c) | Analytics module shapes | **SHIFTED** (trivial) | adapter join moved 61–101 → 123–164 |
| (d) | Schema fields for snapshot capture | **HOLDS** (exact) | n/a |
| (e) | Session-analyzer thresholds & `session_status` semantics | **HOLDS** (trivial drift) + doc citation **SHIFTED** (material) | `algorithm-defaults.ts` sessionConfig 30–35 → 31–36; `instructions.ts:49` → prose now at line 65 |
| (f) | `classifyChunk` retrievability formula | **HOLDS** (exact) | n/a |

---

## (a) `submit_answer` second-failure path and response shapes

**Charter citation:** `src/orchestration/teaching-workflows.ts:1090–1163`, `src/domain/types/teaching.ts`

**Verdict: SHIFTED (material)**

`teaching-workflows.ts` has grown to **1,922 lines** (from whatever length it was at charter-write time). NEU-600's roadblock-forecast feature was inserted into the same function, pushing everything down and adding new branching.

Evidence:
- The relevant function is `submitAnswerForQuestion`, spanning **lines 952–1216** (not a flat 1090–1163 range).
- The second-failure detection is `if (!passed && attemptNumber === 2)` at **line 1171** — it now only triggers a status update (`updateQuestionStatus(sessionQuestionId, 'answered')`); it no longer directly returns.
- Both the second-failure path and the passed path fall through to a single shared `return { action: 'recorded', ... }` at **line 1199**, which now conditionally includes a `roadblock_forecast` field (NEU-600).
- **A second, unrelated `action: 'recorded'` site exists at line 1387**, inside `submitAnswerForAssessmentQuestion` (lines 1261–1397) — this is the single-attempt assessment-mode path (`attempt: 1` always, no retry concept, `mapRubricToQuality`-derived pass/fail). **This is not OUT-5's target.** OUT-5 targets the second-failure branch inside `submitAnswerForQuestion`, i.e. the `recorded` return at line 1199, gated by the check at line 1171.
- The response type `SubmitAnswerRecorded` (`src/domain/types/teaching.ts:200–211`) already carries an **additive optional field, `roadblock_forecast?: RoadblockForecast`** (line 210), added by NEU-600 after the charter was written. This field was not present in the charter's model of the response shape.

**Assessment:** the fact that a second-failure path exists and silently returns `recorded` with no correct-answer information still holds in substance — but the exact line numbers the charter baked in are stale, and there is a decoy `recorded` site elsewhere in the same file that must not be confused with OUT-5's target. The pre-existing `roadblock_forecast` optional field means OUT-5's new correct-answer block must be added *alongside* it, not assumed to be the only optional field on the type.

**Amendment routed → SUB-5 / NEU-847** (see Amendments section below).

---

## (b) NEU-839 dead-config removal (OUT-7 targets)

**Charter question:** whether NEU-839's config audit already wired or deleted `src/domain/services/cognitive-load.ts`, the `sessionComposition` config block, or the `recommendationConfig.cognitiveLoad` knobs.

**Verdict: HOLDS — nothing was removed. SUB-7's full scope is unchanged.**

Evidence:
- `src/domain/services/cognitive-load.ts` still exists, 41 lines. `calculateItemCognitiveLoad` has **zero production call sites** — its only references are in its own test file, `tests/unit/domain/services/cognitive-load.test.ts`.
- `sessionComposition` is still present and fully wired for parsing in three files: `src/domain/config/algorithm.ts` (type), `src/domain/config/algorithm-defaults.ts` (defaults), `src/config/resolve-algorithm-config.ts` (env parsing, lines 118–144).
- All six `sessionComposition` env vars are still parsed, e.g. `SM_REC_MAX_NEW_DEFAULT` at line 120, `SM_REC_INTERLEAVE_STRATEGY` at line 140.
- All four `recommendationConfig.cognitiveLoad` knobs (`SM_REC_MAX_COG_LOAD_DEFAULT`, `SM_REC_COG_EASY_THRESHOLD`, `SM_REC_COG_HARD_THRESHOLD`, `SM_REC_COG_PER_MIN_FACTOR`) are still parsed, at `resolve-algorithm-config.ts:100–117`.
- Independently confirmed via Linear: **NEU-839's actual scope was "Require a minimum evidence base before leech flagging and eliminate dead leech config"** (OUT-8 of the *C001* charter) — a config audit of the *leech* knobs (`leechFailureThreshold`/`SM_LEECH_FAIL_THRESHOLD`), entirely unrelated to OUT-7's cognitive-load/sessionComposition targets. There was never any overlap risk between NEU-839 and SUB-7.
- Also confirmed the SUB-7-adjacent fact: the inline `cognitiveLoad` field on `RankedItem`, which SUB-7 must leave untouched, still exists — but its exact charter-cited location has shifted (see Amendment to SUB-7 below).

**No amendment needed for the removal scope itself** — all ten enumerated pedagogy knobs and the module remain exactly as the charter described, so SUB-7's deletion scope is unchanged in substance. A citation-only amendment is routed below for two shifted line references SUB-7's brief relies on.

---

## (c) Analytics module shapes

**Charter citation:** `src/server/analytics-tools.ts`, `src/orchestration/analytics-workflows.ts`, `src/domain/services/analytics-calculator.ts`, `ReviewPersistencePort`, and the join at `src/adapters/drizzle/review-persistence-adapter.ts:61–101`.

**Verdict: SHIFTED (trivial) — registration pattern and port interface unchanged; the underlying join moved.**

Evidence:
- `src/server/analytics-tools.ts` (60 lines): `analytics_daily` and `analytics_window` are still registered via `server.registerTool(...)` returning `toolData`/`toolError`, unchanged in shape.
- `src/orchestration/analytics-workflows.ts` (48 lines) and `src/domain/services/analytics-calculator.ts` (246 lines) both present.
- `ReviewPersistencePort` (`src/ports/review-persistence-port.ts:53–94`) still declares `getChunk`, `countAttempts`, `getReviewsByDateRange`, `getWeakAreas`, etc.
- The join that feeds `analytics_daily`/`analytics_window` is `getReviewsByDateRange` in `DrizzleReviewPersistenceAdapter` — it has **moved from the charter-cited lines 61–101 to lines 123–164**. Two new methods (`countAttempts`, `getReviewObservations`, added for other work — durability-gate evidence) were inserted above it, pushing it down. The join's shape (attempts → sessionQuestions → sessionQuestionChunks → learningSessions → learningChunks → learningTopics, filtered on non-null quality and a date range) is otherwise unchanged.

**Assessment:** no material impact on OUT-2/3/4, which extend the port interface and add new query methods rather than depending on this specific join's line numbers. No amendment routed.

---

## (d) Schema fields for snapshot capture

**Charter citation:** `session_question_attempts`, `learning_chunks` SR columns (`next_review_at`, `ease_factor`, `repetitions`, `interval_days`), `session_chunks.teachingApproach` — `src/infrastructure/db/schema.ts:59–65, 137, 197–228`.

**Verdict: HOLDS — exact match.**

Evidence (all confirmed by direct read of `src/infrastructure/db/schema.ts`):
- `learningChunks` SR columns: `nextReviewAt` line 59, `easeFactor` line 60, `repetitions` line 61, `intervalDays` line 65 — exactly as cited.
- `sessionChunks.teachingApproach`: line 137 — exactly as cited.
- `sessionQuestionAttempts` table: lines 197–228 — exactly as cited (including `attemptNumber`, `passed`, `quality`, `agentQuality`, `timeSpentMs`, `createdAt`, and the `chk_attempt_number IN (1,2)` check).
- Bonus (cited elsewhere in the charter's Dependencies section for OUT-5's correct-answer material, not formally part of fact group (d)'s bullet list but verified for completeness): `content` (line 69) and `condensedSummary` (line 74) also match exactly.

No amendment needed.

---

## (e) Session-analyzer thresholds and `session_status` semantics

**Charter citation:** `src/domain/services/session-analyzer.ts`, `src/domain/config/algorithm-defaults.ts:30–35` (`timeThresholdMs` 90 min, `maxTimeMs` 2 h); Scope section also cites `src/shared/instructions.ts:49` and `src/shared/prompts/prompt-pack.ts:570` for the break-recommendation prose OUT-6 must update.

**Verdict: HOLDS in substance (trivial line drift on the core thresholds/branches). The `instructions.ts` doc citation SHIFTED materially.**

Core thresholds and branches — evidence:
- `algorithm-defaults.ts` `sessionConfig` block is now at **lines 31–36** (charter cited 30–35 — off by one, trivial). `timeThresholdMs: 90 * 60 * 1000` at line 33; `maxTimeMs: 120 * 60 * 1000` at line 35. Values unchanged (90 min / 2 h).
- `session-analyzer.ts`: the `qualityMet && timeMet` → `'complete'` branch (the one assumption #13 requires survive unchanged) is at **lines 120–125** (charter cited 120–126 — off by one on the closing brace, trivial).
- `session-analyzer.ts`: the `timeMet && progress ≥ 0.5` → `'break'` branch (the one OUT-6 replaces) is at **lines 127–133** (charter cited 127–132 — same trivial one-line drift).
- `getSessionStatus` (lines 151–171) still reads `config.timeThresholdMs`/`config.maxTimeMs` from `algorithmConfig.sessionConfig` unchanged — `session_status`'s continue/complete/break semantics are otherwise as described.

Doc citation — evidence (this is not one of the charter's formal (a)–(f) fact-list bullets, but is directly cited in the charter's Scope section as prose OUT-6 must update, and is inseparable from verifying "session_status semantics" per fact group (e)):
- `src/shared/instructions.ts:49` **no longer holds the break-recommendation prose**. Line 49 is now inside the unrelated "ASSESSMENT FLOW" section (`4. Call submit_answer with session_question_id, response, the rubric grading payload...`).
- The actual `session_status` description in `instructions.ts` is now at **line 65**: `- session_status: session metrics and completion checks. Returns progress, quality, and a continue/complete/break recommendation.` This line is already generic — it does **not** hardcode "90 minutes" or any specific number that needs deleting; the update OUT-6 needs here is a semantic one (documenting that "break" now reflects a fatigue signal), not the removal of stale numeric prose.
- `src/shared/prompts/prompt-pack.ts:570` **HOLDS exactly**: `- Check status: \`session_status({ session_id: "..." })\` — returns progress, quality, and continue/complete/break recommendation`. Same generic, non-numeric phrasing — matches the charter's citation precisely.

**Amendment routed → SUB-6 / NEU-848** (see Amendments section below) for the `instructions.ts` citation only; `prompt-pack.ts:570` needs no correction.

---

## (f) `classifyChunk` retrievability formula

**Charter citation:** `src/domain/algorithms/classify-chunk.ts:37–66`, including the R = 1.0 fresh-chunk band at lines 45–47.

**Verdict: HOLDS — exact match.**

Evidence:
- `classifyChunk` function spans **lines 37–66** exactly as cited (opening `export function classifyChunk` at 37, closing brace at 66).
- The no-established-interval branch (`intervalDays <= 0` → `estimatedRetrievability = 1.0`) is at **lines 45–47** exactly as cited.
- The FSRS power-law formula (`Math.pow(1 + (19/81) * (daysOverdue/intervalDays), -0.5)`) at line 51 is unchanged.

No amendment needed.

---

## Amendments routed

### Amendment 1 → SUB-5 (NEU-847), "Surface the correct answer after a second failed attempt"

**Reason:** fact group (a) SHIFTED materially — the charter's line citations for the second-failure path are stale, and there is a decoy `recorded` return site elsewhere in the same file.

**Correction:**
- Target function: `submitAnswerForQuestion` in `src/orchestration/teaching-workflows.ts:952–1216` (not the charter's cited 1090–1163).
- Second-failure detection: `if (!passed && attemptNumber === 2)` at **line 1171**.
- The `recorded` return to extend with the correct-answer block: **line 1199** — the one inside `submitAnswerForQuestion`. **Do not use the `recorded` return at line 1387** — that one belongs to `submitAnswerForAssessmentQuestion`, the single-attempt assessment-mode path, which has no second-attempt/retry concept and is out of scope for OUT-5.
- The response type to extend, `SubmitAnswerRecorded` (`src/domain/types/teaching.ts:200–211`), **already carries an additive optional field**, `roadblock_forecast?: RoadblockForecast` (line 210), added by NEU-600 after this charter was written. SUB-5's new correct-answer block field must coexist with `roadblock_forecast` as a second, independent optional field — SUB-5's fixtures should assert the new field's presence/absence without assuming `roadblock_forecast` is absent or present in a fixed way (it depends on independent roadblock-forecast logic, not on the correct-answer feature).

### Amendment 2 → SUB-6 (NEU-848), "Replace the fixed 90-minute break trigger with a measured fatigue advisory"

**Reason:** the charter's citation for the session_status break-recommendation prose in `src/shared/instructions.ts` no longer points at that prose.

**Correction:**
- Replace the citation `src/shared/instructions.ts:49` with **`src/shared/instructions.ts:65`**: `- session_status: session metrics and completion checks. Returns progress, quality, and a continue/complete/break recommendation.`
- Note for the spec/implement phase: this prose is already generic (no hardcoded "90 minutes" or numeric threshold to strip) — the required update is semantic (reflect that "break" is now driven by the fatigue signal, not a fixed clock), not a textual removal of stale numbers.
- `src/shared/prompts/prompt-pack.ts:570` is unaffected — it matches the charter's citation exactly and needs the same semantic update at that unchanged location.

### Amendment 3 → SUB-7 (NEU-849), "Delete the dead cognitive-load model and session-composition config"

**Reason:** two of SUB-7's own out-of-scope/audit-scope citations have drifted (trivial, non-blocking) due to the `cognitiveLoad` knob block being added ahead of `sessionComposition` in `resolve-algorithm-config.ts`, and an unrelated NEU-927 addition in `sr-calculator.ts`.

**Correction:**
- The untouched inline `cognitiveLoad` field on `RankedItem` (SUB-7's explicit out-of-scope item) is now at **`src/domain/algorithms/sr-calculator.ts:346`** (not line 231 as cited), inside the `rankCandidatesWithConstraints` output-construction closure (`ranked: RankedItem[] = selected.map(...)`, lines ~333–348).
- In `src/config/resolve-algorithm-config.ts`: `sessionComposition` parsing is now at **lines 118–144** (charter cited 114–140); `conversation` (the `SM_REC_CONVO_*` knobs, explicitly out of SUB-7's audit scope) is now at **lines 145–159** (charter cited 141–155). Both blocks shifted down by 4 lines because the `cognitiveLoad` knob block (lines 100–117) is now parsed immediately above `sessionComposition`, ahead of where it was when the charter was written.
- No scope change — SUB-7's ten-knob deletion list and its explicit exclusions (`sr-calculator.ts`'s inline `cognitiveLoad` field, the `SM_REC_CONVO_*` knobs) are unaffected; only the line numbers its brief cites need correcting before implementation to avoid editing the wrong region.

---

## Spot-check reconciliation

An independent partial spot-check was run before this full drift check and is reconciled here fact-by-fact:

- `schema.ts:197` (`session_question_attempts`), `schema.ts:59–65` (SR columns) — **spot-check correct**, HOLDS confirmed.
- `classify-chunk.ts:37–66` with the R=1.0 band at ~45–47 — **spot-check correct**, HOLDS confirmed exactly.
- `session-analyzer.ts:120–126` (complete branch) and `:127–132` (break branch) — **spot-check correct** in substance; this report additionally pins the exact current lines (120–125, 127–133) and flags the co-cited `instructions.ts:49` doc reference as materially shifted, which the spot-check did not check.
- `algorithm-defaults.ts` `sessionConfig` block, 90 min / 2 h — **spot-check correct**, HOLDS confirmed (trivial one-line shift to 31–36 noted here).
- `resolve-algorithm-config.ts` — **spot-check correct on the SHIFTED verdict**; this report confirms the exact new ranges (`sessionComposition` 118–144, `conversation` 145–159) and additionally identifies `cognitiveLoad` at 100–117 as the cause of the shift.
- `teaching-workflows.ts` growth to 1,922 lines, second-failure check at 1171, `recorded` at both 1199 and 1387 — **spot-check correct on all cited line numbers**. This report resolves the spot-check's open question ("determine ... which of the two recorded sites OUT-5 actually targets"): **line 1199**, inside `submitAnswerForQuestion`; line 1387 belongs to the unrelated assessment-mode path.
- `cognitive-load.ts` still existing with zero production call sites; `sessionComposition` still present in `algorithm.ts`/`algorithm-defaults.ts`/`resolve-algorithm-config.ts`; `SM_REC_MAX_NEW_DEFAULT`/`SM_REC_INTERLEAVE_STRATEGY` still parsed at `resolve-algorithm-config.ts:120,140` — **spot-check correct on every point**. This report additionally confirms via Linear that NEU-839's actual scope (leech-config audit, OUT-8/C001) was never related to these OUT-7 targets, so there was no overlap risk to begin with.
- C001/Phase 0 (NEU-832) Done, so the charter's "Phase 0 merges shift touched paths" risk is a settled question — **spot-check correct**; this report confirms via Linear that NEU-832 completed 2026-07-08, and both NEU-837 and NEU-839 are individually Done as well.

No point in the spot-check was found to be wrong.
