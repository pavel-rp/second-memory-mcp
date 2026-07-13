# EXP-01 — M03 Retrieval: massed-exclusion control enforceability (AI review)

- **Task:** NEU-924 · **Decision:** DR-M03 (retrieval) · **Conflict:** C2 (HIGH · non-downgradable · learning-critical) · **Threshold shapes touched:** MM-T1 (K non-massed successes)
- **Vehicle:** AI review under NEU-887's independence protocol (`../../C005-product-foundation/benchmark-suite/04_ai-review-independence-protocol.md`) · **Evidence class of every result: 4 `[ai-critique]`** — never human/expert/user validation
- **Executed:** 2026-07-13 · **Status: provisional evidence attachment. Settles nothing; flips no status; resolves no conflict; modifies no source file.**

## 1. Contested point and why it is materially inconclusive

DR-M03's enforceable control — same-session massed re-recalls flagged and **excluded** from the mastery-signal aggregate, as a runtime invariant + CI test at the review-aggregation path — was authored against a **static** reading of the orchestration, and the reconciliation's C2 GAP verdict for M03 is likewise a static read. The materially inconclusive residual on the C2 / prose-only-control axis: *(a) is the control actually needed (does the live aggregation really fold same-session re-recalls into the mastery signal with no exclusion?), and (b) is it implementable — does a concrete enforcement point exist in the live code where session identity and per-question attempt history are both in scope?* If (b) failed, the learning-critical control would be prose-only in practice — exactly the charter risk.

**Vehicle selection (smallest sufficient).** The aggregation is orchestration-level and DB-coupled (`teaching-workflows.ts` + repositories), so a deterministic in-session oracle cannot exercise it without standing up DB infrastructure (larger vehicle); the contested point is a design-soundness/enforceability judgment over live code — AI review is the smallest sufficient vehicle. Dogfooding/WoZ add nothing to a code-enforceability question.

## 2. Fidelity limitation (explicit)

Class-4 structural bound: AI reviewers carry systematic biases and are not human/expert validation; both reviewers judged the same static live source (no dynamic execution of the aggregation), so this evidence bounds *what the code declares*, not runtime behavior under load. It says nothing about retrieval practice's DP-transfer effect (INC-I1 untouched) and calibrates no MM-T1 value.

## 3. Independence-protocol compliance (AIR record)

Two reviewers, **separately initialized** in fresh isolated contexts (no shared conversation, memory, or state; different model families), received an **identical context package**, and each **committed its initial verdict before any exposure** to the other's verdict or to any experimenter conclusion (none existed in the package; verdicts below are transcribed append-only and unedited). Closed verdict set: `supports` / `contradicts` / `insufficient-evidence`.

**Identical context package (both reviewers):** the review hypothesis + rubric below, plus the instruction to read `decision-records/DR-M03_retrieval.md`, `src/orchestration/teaching-workflows.ts`, `src/domain/algorithms/sr-calculator.ts` (repo state: commit `bc77bc6`). Explicit instruction not to consult any memory system.

**Review hypothesis (H-EXP-01, verbatim):** "The decision record DR-M03's enforceable control — flagging same-session massed re-recalls and EXCLUDING them from the mastery-signal aggregate, enforced as a runtime invariant plus CI test at the review-aggregation path — is (a) NEEDED, because the live Second Memory code does not already flag or exclude same-session repeated recalls from the mastery signal it feeds to spaced-repetition scheduling; and (b) IMPLEMENTABLE, because a concrete, identifiable enforcement point exists in the live codebase where the exclusion could be mechanically enforced." Rubric: clause (a) — contradicted if the exclusion already exists; clause (b) — name the concrete code path and whether session identity / attempt history are available there; both clauses required for `supports`.

| Field | AIR-EXP01-A | AIR-EXP01-B |
| --- | --- | --- |
| Reviewer identity | independent subagent A | independent subagent B |
| Provider | Anthropic | Anthropic |
| Model (self-reported) | claude-sonnet-5 | Claude Opus 4.8 (`claude-opus-4-8[1m]`) |
| Run date | 2026-07-13 | 2026-07-13 |
| Context exposure | context package only; **no** other verdict, **no** experimenter conclusion, no memory systems | same |
| Conditions | fresh isolated context; read-only repo tools; harness-default sampling (temperature not exposed by harness — recorded as harness-default) | same |
| **Committed verdict** | **`supports`** | **`supports`** |
| Post-commit note | — | — |

## 4. Committed initial verdicts (append-only, transcribed verbatim)

### AIR-EXP01-A (claude-sonnet-5) — verdict `supports`

- CLAUSE-A: needed? **yes**. "The live aggregation loop (`teaching-workflows.ts:226-239`) folds every question mapped to a chunk in the session — including roadblock-triggered follow-up questions, which are exactly the 'same-session massed re-recalls' DR-M03 describes — into the same uniform-weighted average that becomes the mastery/SR-input quality. No flag, filter, or exclusion of any kind exists (confirmed by the zero-match grep)."
- CLAUSE-B: implementable? **yes**. "The named enforcement point is `getNextTeachingStep` step 3b in `src/orchestration/teaching-workflows.ts`, specifically the loop at lines 232-239 that builds `perQuestionQualities` … and the call to `aggregateQuestionQualities` at line 256. Both `session.id` … and full per-question/per-attempt history (`questionsByChunkId`, `attemptsByQuestion`, already fetched at lines 130-157) are available at this exact point with no new I/O required. `roadblock-gate.ts` already computes the trigger-vs-follow-up distinction needed to derive `is_same_session_repeat` deterministically."
- Key cited findings: `aggregateQuestionQualities` (lines 905-909) is a plain uniform-weighted average with no filtering; grep for `is_same_session_repeat`/`massed`/`same_session` across `src/` — zero matches; `processReviewResult` (`review-workflows.ts:28-33, 60-68`) receives only a scalar quality; `sr-calculator.ts` pure functions take a single `quality: number` — "cannot be the enforcement point since the exclusion decision must already be made before this scalar exists"; `session_question_attempts` schema carries `attemptNumber`.
- RATIONALE (verbatim): "The live mastery-signal path unconditionally averages the last-attempt quality of every question mapped to a chunk within a session — including roadblock follow-up questions that are, by construction, same-session massed re-recalls of the same chunk — with no exclusion, flag, or session-scoped filtering anywhere in the codebase (verified by direct code read and an exhaustive grep for the relevant terms). This satisfies clause (a) … Clause (b) is also satisfied: a single, precisely identifiable enforcement point exists (`getNextTeachingStep` step 3b, `teaching-workflows.ts` lines 226-256) where both session identity and full per-question/per-attempt history are already in scope, and `roadblock-gate.ts` demonstrates the trigger/follow-up distinction is already mechanically derivable from existing data without new fetches. Since both clauses hold on direct evidence from the live code, the hypothesis is supported."

### AIR-EXP01-B (Claude Opus 4.8) — verdict `supports`

- CLAUSE-A: needed? **YES**. "The live aggregate averages the final-attempt quality of *all* same-session questions on a chunk, explicitly including the roadblock-triggered follow-up re-recalls, then rounds and feeds that single value to the SR scheduler. No `is_same_session_repeat` flag is derived and no event is excluded — exactly the C2 failure mode the DR describes."
- CLAUSE-B: implementable? **YES**. "Named enforcement point: `getNextTeachingStep` in `src/orchestration/teaching-workflows.ts`, step 3b, the `perQuestionQualities` construction loop at lines 227-239, immediately feeding `aggregateQuestionQualities` (lines 905-909) before `processReviewResult` (line 264). The required data is all present at that site … session identity is fixed … per-question attempt history and recall ordering are available via `SessionQuestion.questionIndex` and attempt records … The scalar-only downstream (`processReviewResult`, `sr-calculator.ts`) confirms the exclusion cannot live below this point, pinning it to this aggregate."
- Key cited findings: `teaching-workflows.ts:226-239` (aggregate includes initial question and every roadblock follow-up); `:256, 264-269` single funnel to the scheduler; `review-workflows.ts:28-56` scalar-only; `sr-calculator.ts:74-240` no session concept; case-insensitive grep for same-session/massed exclusion logic — zero matches.
- RATIONALE (verbatim, closing): "The scheduler and SR calculator take only a pre-aggregated scalar quality, so they neither already perform nor can perform the exclusion, which both rules out redundancy and confirms the aggregation path is the correct locus. A codebase-wide search found no existing same-session/massed logic, corroborating the need. Both clauses required for `supports` are met."

## 5. Outcome

**2/2 separately-initialized initial verdicts: `supports` — unanimous; not `conflicted`** (no adjudication routing needed). Both reviewers independently converged on the **same enforcement point** (`getNextTeachingStep` step 3b, `teaching-workflows.ts` ~226–256, ahead of `aggregateQuestionQualities`/`processReviewResult`) and independently confirmed the aggregate currently counts same-session re-recalls with no exclusion anywhere in `src/`.

## 6. Result statement (class 4 `[ai-critique]`) — finding `F-EXP-01`

Two independent AI reviews support that DR-M03's massed-exclusion control is **needed** (the live mastery aggregate demonstrably folds same-session massed re-recalls — including roadblock follow-ups — into the SR-feeding signal with no flag or exclusion; C2 GAP corroborated at the named path) and **implementable at a concrete enforcement point** where session identity and per-attempt history are already in scope — i.e. the learning-critical control is **not prose-only in practice**: its named enforcement point exists and carries the required data.

**What this does *not* establish:** runtime behavior (static review only); retrieval-practice DP-transfer (INC-I1 open); any MM-T1 value; human/expert endorsement (class-4 bound). Attached to DR-M03 / ledger §EXP; decision stays `provisional`, C2 stays `unresolved` · non-downgradable.

## 7. Self-check

- ≥2 separately-initialized reviewers, identical context package, verdicts committed before any cross-exposure, closed verdict set, conditions recorded. **PASS.**
- Verdicts transcribed append-only and unedited; disagreement rule not triggered (unanimous). **PASS.**
- Class-4 labeling throughout; no laundering; nothing settled. **PASS.**
