# EXP-06 — M06 Feedback: correct-answer-exposure outcome gate (AI review)

- **Task:** NEU-924 · **Decision:** DR-M06 (feedback) · **Conflict:** C6 (MEDIUM-HIGH · learning-critical) · **Threshold shapes touched:** MM-T7 (exposure-detection rate — shape context only)
- **Vehicle:** AI review under NEU-887's independence protocol (`../../C005-product-foundation/benchmark-suite/04_ai-review-independence-protocol.md`) · **Evidence class of every result: 4 `[ai-critique]`** — never human/expert/user validation
- **Executed:** 2026-07-13 · **Status: provisional evidence attachment. Settles nothing; flips no status; resolves no conflict; modifies no source file.**

## 1. Contested point and why it is materially inconclusive

DR-M06 requires corrective feedback with **correct-answer exposure after terminal failure, behind a server-side outcome gate** with a constrained (structured) payload. Reconciliation verdict (C6): **GAP** — no exposure gate (L11) — from a static read. The materially inconclusive residual on the C6 / prose-only-control axis: *(a) is the gate genuinely absent (nothing server-side requires exposure before the outcome is recorded — prose instructions to the client AI do not count), and (b) is the DR-M06 gate implementable at a concrete enforcement point in the live terminal-failure recording path?* If (b) failed, the learning-critical control would be prose-only in practice.

**Vehicle selection (smallest sufficient).** Same rationale as EXP-01: the terminal-failure path is orchestration-level and DB-coupled; the contested point is an absence/enforceability judgment over live code — AI review is the smallest sufficient vehicle in-session. Dogfooding/WoZ add nothing to a code-enforceability question; the *pedagogical* residual (AI diagnostic reliability on DP-specific errors) is in-domain and defers (`07_deferral-register.md`).

## 2. Fidelity limitation (explicit)

Class-4 structural bound: AI reviewers are not human/expert validation; static review only (no dynamic execution of the terminal-failure path); says nothing about corrective feedback's DP-transfer effect (INC-I1 untouched); calibrates no MM-T7 value.

## 3. Independence-protocol compliance (AIR record)

Two reviewers, **separately initialized** in fresh isolated contexts (no shared state; different model families), received an **identical context package**, and each **committed its initial verdict before any exposure** to the other's verdict or any experimenter conclusion (verdicts transcribed append-only, unedited). Closed verdict set: `supports` / `contradicts` / `insufficient-evidence`.

**Identical context package (both reviewers):** the review hypothesis + rubric below, plus the instruction to read `decision-records/DR-M06_feedback.md`, `src/orchestration/teaching-workflows.ts` (submit_answer flow, retry and terminal-failure branches), `src/shared/instructions.ts` (repo state: commit `bc77bc6`). Explicit instruction not to consult any memory system.

**Review hypothesis (H-EXP-06, verbatim):** "The decision record DR-M06's enforceable control — a server-side OUTCOME GATE requiring a corrective-feedback / correct-answer-exposure step after a terminal failed attempt BEFORE the chunk outcome is recorded, with a constrained (structured) feedback payload rather than free-form prose only — is (a) ABSENT from the live Second Memory code, i.e. the live terminal-failure path records the outcome without any server-side requirement that correct-answer exposure occurred; and (b) IMPLEMENTABLE, because a concrete, identifiable enforcement point exists in the live terminal-failure recording path where such a gate could be mechanically enforced." Rubric: clause (a) — prose instructions to the client AI do not count as a server-side gate; contradicted if a gate already exists; clause (b) — name the concrete code path and whether a structured exposure payload could be validated there; both clauses required for `supports`.

| Field | AIR-EXP06-A | AIR-EXP06-B |
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

### AIR-EXP06-A (claude-sonnet-5) — verdict `supports`

- CLAUSE-A: absent? **yes**. "The terminal-failure branch (`teaching-workflows.ts` lines 1131–1134) and the chunk-outcome-recording branch (`getNextTeachingStep` lines 222–295, esp. 243–247 and 264) both execute unconditionally on second-attempt failure with no server-side check, flag, or schema field asserting that correct-answer exposure occurred. The only 'feedback' channel is a free-form string (`teaching.ts` line 274), matching the DR's own rejected-alternative description."
- CLAUSE-B: implementable? **yes**. "Two concrete, well-defined enforcement points exist: (1) `submitAnswerForQuestion()` … the `if (!passed && attemptNumber === 2)` block at lines 1131–1134, before the `return { action: 'recorded', … }` at line 1159 …; (2) `getNextTeachingStep()` step 3b, lines 222–295, specifically before `updateSessionChunk(..., {status:'completed'})` (line 243) / `processReviewResult` (line 264) — the actual point where the 'chunk outcome' … is persisted. Both sites already have full access to attempt-level data … so wiring in a validated structured payload … and a synchronous assertion is a mechanical, in-place change — no architectural obstacle."
- Key cited findings: `teaching.ts:274` `feedback: z.string().trim().min(1)` — unstructured free text; repo-wide grep for `correct_answer|canonical_answer|correct_answer_exposed|exposure` — only two unrelated hits, neither a gate; `SERVER_INSTRUCTIONS` never mentions revealing the correct answer after terminal failure; `RETRY_PIVOT` pivots exist only for the first-attempt retry path — "the terminal (second) failure path applies no such pivot/reveal instruction at all — it just records and returns."
- RATIONALE (verbatim, closing): "Both identified enforcement points sit in code that already has the necessary attempt/quality data in scope, so a structured-payload gate is a localized, mechanical addition rather than a redesign, satisfying clause (b). … reinforcing that no server-side enforcement exists. Both required clauses hold, so the hypothesis is supported by the current code."

### AIR-EXP06-B (Claude Opus 4.8) — verdict `supports`

- CLAUSE-A: absent? **YES**. "The live terminal-failure path (`submitAnswerForQuestion` 1131-1134) records the attempt/answered status, and the chunk outcome is later persisted in `getNextTeachingStep` step 3b (222-295 / `processReviewResult` 264-269) with no server-side assertion that correct-answer exposure occurred on a path with ≥1 failed attempt. The `feedback` field is free-text (`teaching.ts:274`), not the structured verdict/exposure payload. Only prose instructions exist."
- CLAUSE-B: implementable? **YES**. "The concrete enforcement point for the outcome gate is `getNextTeachingStep` step 3b … (block ~lines 222-295, immediately before the `processReviewResult` call at 264-269) — the single site where the chunk outcome is persisted; a guard there could reject a pass/mastered outcome when the chunk had ≥1 failed attempt … and no exposure flag is set. The structured signal it would validate does not yet exist but has an obvious home: add `correct_answer_exposed`/`canonical_answer_ref` to `SubmitAnswerInputShape` (`src/domain/types/teaching.ts` ~line 274 …), persist it on the attempt at `createAttempt` (`teaching-workflows.ts:1020-1034`), and validate it at the server tool boundary (`src/server/*-tools.ts`) — exactly the enforcement points DR-M06 names."
- Key cited findings: the only server-side progression gates are the roadblock gate (`evaluateRoadblock`, 194-220) and the quality cap (`computeQualityCap`, 1014) — "these gate on quality scores and follow-up-question counts — not on correct-answer exposure. A chunk with a terminal failure can be completed with no exposure ever having occurred"; grep for exposure fields — zero relevant hits; `instructions.ts:19,29,77` — client prose only, per rubric not a server-side gate.
- RATIONALE (verbatim, closing): "The existing roadblock/quality gates constrain progression on scores and follow-up counts, not on correct-answer exposure, so they are not the DR-M06 control. Both hypothesis clauses hold: the gate is absent (Clause A), and a concrete, identifiable enforcement point exists … where such a gate could be mechanically enforced (Clause B)."

## 5. Outcome

**2/2 separately-initialized initial verdicts: `supports` — unanimous; not `conflicted`.** Both reviewers independently converged on the same terminal-failure branch (`teaching-workflows.ts:1131–1134`) and the same outcome-persistence site (`getNextTeachingStep` step 3b, before `processReviewResult`) as the gate's enforcement point, and independently confirmed the `feedback` channel is free-form prose with no exposure field anywhere in `src/`.

## 6. Result statement (class 4 `[ai-critique]`) — finding `F-EXP-06`

Two independent AI reviews support that the DR-M06 outcome gate is **absent** from the live code (C6 GAP corroborated at the exact terminal-failure and outcome-persistence sites; today's only channel is free-form prose to the client AI — the very thing the DR rejects) and **implementable at concrete enforcement points** already holding the needed attempt-level data — i.e. the learning-critical control is **not prose-only in practice**: its enforcement points exist and admit a structured, validatable payload.

**What this does *not* establish:** runtime behavior; AI diagnostic reliability on DP-specific errors (in-domain, deferred); corrective-feedback DP-transfer (INC-I1 open); any MM-T7 value; human/expert endorsement (class-4 bound). Attached to DR-M06 / ledger §EXP; decision stays `provisional`, C6 stays `unresolved`.

## 7. Self-check

- ≥2 separately-initialized reviewers, identical context package, verdicts committed before any cross-exposure, closed verdict set, conditions recorded. **PASS.**
- Verdicts transcribed append-only and unedited; disagreement rule not triggered (unanimous). **PASS.**
- Class-4 labeling throughout; no laundering; nothing settled. **PASS.**
