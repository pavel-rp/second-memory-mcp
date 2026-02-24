# Audit 03: Principles & Conventions Compliance

**Date**: 2026-02-23
**Scope**: Does the code actually follow what AGENTS.md, README.md, and inline documentation claim?

---

## 1. README / AGENTS.md Promises vs Actual Code

### 1.1 File Path Claims — INCORRECT

| Documented Path                                                 | Actual Path                              | Status    |
| --------------------------------------------------------------- | ---------------------------------------- | --------- |
| `src/tools/sr-calculator.ts` (AGENTS.md Key Components)         | `src/algorithms/sr-calculator.ts`        | **WRONG** |
| "Algorithm logic in `src/tools/`" (AGENTS.md File Organization) | `src/algorithms/` for core SR algorithms | **WRONG** |

AGENTS.md completely omits the `src/algorithms/` directory from its File Organization section and Key Components listing. The `src/algorithms/` directory contains three files (`sr-calculator.ts`, `dependency-resolver.ts`, `prerequisite-reference-validator.ts`) that are core to the system. Similarly, `src/constants/` is undocumented.

**Severity**: Medium. A developer following AGENTS.md would look in the wrong directory for the core algorithm code.

### 1.2 Tool Registration — Significant Drift Between README and Implementation

**Tools listed in README that DO NOT EXIST:**

| README Claims        | Status                                                               |
| -------------------- | -------------------------------------------------------------------- |
| `session_readiness`  | **NOT FOUND** — no registration anywhere                             |
| `analyze_attempts`   | **NOT FOUND** — no registration anywhere                             |
| `list_sessions`      | **NOT FOUND** as MCP tool — exists only as internal service function |
| `batch_fetch_topics` | Tool actually named `batch_fetch_topics_minimal`                     |
| `batch_fetch_chunks` | Tool actually named `batch_fetch_chunks_minimal`                     |

**Tools that EXIST but are NOT listed in README:**

| Actual Tool                   | Registration File             |
| ----------------------------- | ----------------------------- |
| `record_review_result`        | `spaced-repetition-tools.ts`  |
| `analytics_daily`             | `analytics-tools.ts`          |
| `analytics_window`            | `analytics-tools.ts`          |
| `get_chunk_content`           | `content-tools.ts`            |
| `get_topic_summary`           | `content-tools.ts`            |
| `list_items_with_content`     | `content-tools.ts`            |
| `search_learning_content`     | `search-tools.ts`             |
| `batch_update_session_chunks` | `session-management-tools.ts` |
| `get_session`                 | `session-management-tools.ts` |
| `get_historical_feedback`     | `session-management-tools.ts` |

The README tool table is substantially out of date — 3 tools are phantom (never existed or were removed), 2 are renamed, and 10 real tools are unlisted.

**Severity**: High. The README tool table is the primary API reference for consumers. It is missing ~30% of the actual surface area and advertises tools that don't exist.

### 1.3 AGENTS.md Claims `orchestrate_learning_workflow` Tool — NOT FOUND

AGENTS.md states: "`orchestrate_learning_workflow`: Provides step-by-step guidance for SQLite-based workflows". No tool with this name exists in the codebase.

**Severity**: Medium.

### 1.4 AGENTS.md Claims "Resources: Local SQLite database integration"

The MCP server registers **tools** and **prompts** but no MCP **Resources** are registered anywhere in `main.ts` or `tools.ts`. There is no `server.registerResource()` call.

**Severity**: Low. The database integration exists through tools, but calling it a "Resource" in the MCP sense is technically incorrect.

### 1.5 Verified Claims (Accurate)

- Node.js 20+, TypeScript ES modules: **Confirmed** (`package.json` engines, `tsconfig.json` target ES2022)
- MCP SDK for Claude Desktop integration: **Confirmed**
- Zod for schema validation: **Confirmed** (extensive usage across all types)
- Vitest for testing with coverage: **Confirmed** (`vitest.config.ts` with v8 coverage, thresholds set)
- Enhanced SM-2 algorithm: **Confirmed** (`calculateNextReview`, `calculateNextReviewAdvanced` in `src/algorithms/sr-calculator.ts`)
- Spaced Repetition Flow functions: `calculateNextReview()`, `calculateNextReviewAdvanced()`, `calculatePriorityScore()`, `rankCandidatesWithConstraints()` — all **exist and work as described**
- SQLite via Drizzle ORM: **Confirmed** (`src/db/schema.ts`, `src/db/operations.ts`)
- Prettier/ESLint/Husky toolchain: **Confirmed** (configs exist, lint-staged configured)
- Database schema (4 tables): **Confirmed** — `learning_topics`, `learning_chunks`, `learning_sessions`, `session_chunks`
- Tests mirror source structure: **Mostly confirmed** (see note below)
- Prompts registered: scaffolding, learning, retrieval, review, workflow_guidance, chunk_generation, chunk_management — all **confirmed**

### 1.6 Test Coverage Gaps

Tests directory mirrors source structure, but several source files lack corresponding tests:

- `src/server/analytics-tools.ts` — no direct test
- `src/server/persistence-tools.ts` — no direct test
- `src/server/session-tools.ts` — no direct test
- `src/server/tool-helpers.ts` — no direct test
- `src/server/spaced-repetition-tools.ts` — no direct test
- `src/algorithms/prerequisite-reference-validator.ts` — no direct test
- `src/services/chunk-prerequisites.ts`, `chunk-queries.ts`, `chunk-reviews.ts`, `prerequisite-mastery.ts`, `reviews.ts` — no direct tests
- `src/tools/cognitive-load.ts` — no direct test
- `src/constants/validation.ts` — no direct test

Note: `src/server/session-management-tools.ts` is covered by `tests/server/session-management-tools.test.ts` (exercises `registerSessionManagementTools`). `src/utils/content-validation.ts` is exercised by the **Content Validation** suite in `tests/services/content-persistence.test.ts` (covers `validateContent()` / `sanitizeContent()`).

Some of these may be tested transitively through integration tests, but 13 source files have no dedicated test file.

**Severity**: Medium. AGENTS.md states "Algorithm functions must have comprehensive test coverage" and "Every behavior change must include corresponding test additions." The coverage gaps span services, server registrations, and utilities. (Two files initially listed — `session-management-tools.ts` and `content-validation.ts` — are actually tested indirectly.)

---

## 2. Comment Accuracy — 10 Complex Functions Sampled

| #   | Function                           | File                                 | Comment Claim                                                          | Actual Behavior                                                   | Verdict         |
| --- | ---------------------------------- | ------------------------------------ | ---------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------- |
| 1   | `calculateNextReview()`            | `algorithms/sr-calculator.ts:29`     | "reset reps to 0, interval to 0/1 day"                                 | Always sets `nextInterval = 1` (never 0)                          | **Minor drift** |
| 2   | `calculatePriorityScore()`         | `algorithms/sr-calculator.ts:75`     | "Map daysUntil into [0,1] where 7 days => ~0.125"                      | `1/(1+7) = 0.125`                                                 | **Accurate**    |
| 3   | `calculateNextReviewAdvanced()`    | `algorithms/sr-calculator.ts:115`    | "Advanced next review with lapses/leech handling"                      | Handles both lapse penalty and leech detection                    | **Accurate**    |
| 4   | `rankCandidatesWithConstraints()`  | `algorithms/sr-calculator.ts:164`    | "simplified: assume all are reviews"                                   | Only applies `maxReviews` cap, no new item cap                    | **Accurate**    |
| 5   | `generateRecommendations()`        | `tools/recommendation-engine.ts:42`  | "Generate personalized learning recommendations"                       | Full pipeline: defaults, filter, balance, prerequisites, summary  | **Accurate**    |
| 6   | `filterAndPrioritizeCandidates()`  | `tools/recommendation-engine.ts:171` | "Filter and prioritize learning items using existing algorithms"       | Filters by subject, excludes IDs, validates prerequisites, scores | **Accurate**    |
| 7   | `computeWindowRollup()`            | `tools/analytics.ts:144`             | "Compute analytics for a window of dates with optional breakdowns"     | Groups by date, computes KPIs, adds topic/tag breakdowns          | **Accurate**    |
| 8   | `calculateSessionProgress()`       | `tools/session-manager.ts:48`        | "Calculate session progress metrics from session input data"           | Returns completion %, quality, time elapsed                       | **Accurate**    |
| 9   | `checkSessionCompletion()`         | `tools/session-manager.ts:208`       | "Check if session should be completed based on multiple criteria"      | Checks quality, time, progress thresholds                         | **Accurate**    |
| 10  | `resolveAndIncludePrerequisites()` | `tools/recommendation-engine.ts:401` | "Resolve dependencies and automatically include missing prerequisites" | Walks dependency graph, includes prereqs, reorders                | **Accurate**    |

**Summary**: 9 of 10 comments are accurate. One has minor drift (the "0/1 day" wording when the code always sets interval to 1). No fabricated or misleading JSDoc found.

---

## 3. Naming Consistency

### 3.1 Deliberate snake_case / camelCase Boundary — UNDOCUMENTED

The codebase maintains a deliberate naming convention boundary that is **never documented**:

**MCP API layer** (types used in tool schemas): **snake_case**

```typescript
// src/types/session.ts, src/types/analytics.ts, src/types/spaced-repetition-tools.ts
(ease_factor,
  next_review_date,
  time_spent_ms,
  chunk_id,
  session_id,
  quality_scores,
  reviews_completed,
  average_quality,
  consecutive_failures);
```

**Internal algorithm/service layer**: **camelCase**

```typescript
// src/types/sr.ts, src/services/sessions.ts
(easeFactor, nextReviewDate, timeSpentMs, chunkId, sessionId, qualityScores, consecutiveFailures);
```

The conversion happens in tool registration files (e.g., `spaced-repetition-tools.ts:63-75` maps `ease_factor` to `easeFactor`). This is architecturally reasonable but the convention should be documented in AGENTS.md since it affects every contributor.

**Severity**: Medium. Undocumented architectural convention creates confusion risk.

### 3.2 Same Concept, Different Names

| Concept              | Name in one place                  | Name in another place                   | Files                                    |
| -------------------- | ---------------------------------- | --------------------------------------- | ---------------------------------------- |
| SR calculator module | `src/tools/sr-calculator.ts`       | `src/algorithms/sr-calculator.ts`       | AGENTS.md vs filesystem                  |
| Batch fetch topics   | `batch_fetch_topics`               | `batch_fetch_topics_minimal`            | README vs actual tool name               |
| Batch fetch chunks   | `batch_fetch_chunks`               | `batch_fetch_chunks_minimal`            | README vs actual tool name               |
| Session data         | `SessionInput` (snake_case fields) | `CreateSessionInput` (camelCase fields) | types/session.ts vs services/sessions.ts |

### 3.3 AI-Session Boundary Artifacts

- `// New: chunk prompts` comment at `server/main.ts:149` — casual comment suggesting content from a different editing session.
- `// eslint-disable-next-line @typescript-eslint/no-unused-vars` before `daysBetween()` at `tools/analytics.ts:27` — dead function marked "for future use" rather than deleted.
- `// LearningItemSchema would be imported from recommendations.ts` comment at `types/prerequisite-validation.ts:141` — a TODO left behind as `z.any()`, acknowledging the correct type exists but wasn't wired up.

**Severity**: Low (the artifacts) to Medium (the naming inconsistencies).

---

## 4. Pattern Consistency

### 4.1 Tool Registration Pattern — GENERALLY CONSISTENT

Most of the 7 tool registrar files follow the same pattern:

1. Parse input via Zod schema
2. Call business logic
3. Return `{ content: [{ type: 'text', text: JSON.stringify(result) }] }`
4. Catch exceptions via `extractErrorMessage()` + `toolError()`

Notable exceptions are several pure-calculation tools in `src/server/spaced-repetition-tools.ts` (`calculate_next_review`, `calculate_priority_score`, `calculate_next_review_advanced`, `rank_candidates`), which parse input and return results directly without wrapping handlers in `try/catch`; any errors surface as unhandled exceptions from the MCP tool.

Aside from these specific tools in `spaced-repetition-tools.ts`, this pattern is followed across `analytics-tools.ts`, `session-tools.ts`, `session-management-tools.ts`, `persistence-tools.ts`, `content-tools.ts`, and `search-tools.ts`.

### 4.2 Zod Schema Dual-Export Pattern — MOSTLY CONSISTENT

Standard pattern in `src/types/` files:

```typescript
export const SomeInputShape = { ... } as const;      // For MCP registration
export const SomeInputSchema = z.object(SomeInputShape);  // For runtime validation
export type SomeInput = z.infer<typeof SomeInputSchema>;   // For TypeScript
```

**Violation**: `session-management-tools.ts` defines 5 Zod schemas inline (lines 27-82) rather than in `src/types/`. This contradicts AGENTS.md's guideline: "DRY. Don't inline type definitions, schemas, etc. Move them to separate locations if they must be reused" and "Shared types and Zod schemas are defined in `src/types/` — import, don't duplicate."

**Severity**: Medium.

### 4.3 `z.any()` Violations — 3 Instances in Source Code

AGENTS.md declares: "No `any` types - use precise TypeScript types; `any` is only acceptable in test overrides or SDK type boundaries."

| Location                                | Usage                             | Justification                                                              |
| --------------------------------------- | --------------------------------- | -------------------------------------------------------------------------- |
| `server/session-tools.ts:28`            | `sessionData: z.any().optional()` | Comment says "// SessionInput object" — the proper schema exists           |
| `types/prerequisite-validation.ts:141`  | `items: z.array(z.any())`         | Comment says "// LearningItemSchema would be imported" — acknowledged TODO |
| `server/session-management-tools.ts:69` | `session: z.any().nullable()`     | Comment says "// SessionInput or null" — result schema, not input          |

The first two are genuine violations. The third is a result validation schema (less critical). None qualify as "SDK type boundaries."

**Severity**: Medium. The convention is clear and the violations are acknowledged by inline comments, suggesting they were left as technical debt rather than being unknown.

### 4.4 Two Competing Error Response Formats

**Pattern A — Direct structured JSON** (used for business logic failures):

```typescript
return {
  content: [
    {
      type: 'text',
      text: JSON.stringify({
        success: false,
        error: { type: 'not_found', message: '...' },
        message: '...',
      }),
    },
  ],
};
```

**Pattern B — `toolError()` helper** (used for system/catch exceptions):

```typescript
return toolError('Failed to ...', { type: 'database', message: msg, retryable: true });
```

These produce similar but not identical JSON. Both patterns coexist in the same tool handlers (e.g., `persistence-tools.ts` uses Pattern A for "chunk not found" and Pattern B for database exceptions). Additionally, some tools use `toolOk()` (content-tools.ts) while others construct success responses manually.

**Severity**: Medium. MCP clients consuming these tools will encounter inconsistent error structures. The `toolError()` and `toolOk()` helpers exist and work well — they're just not used everywhere.

### 4.5 Service Layer — Mixed Return Conventions

| Service                                       | Error Strategy                                | Pattern       |
| --------------------------------------------- | --------------------------------------------- | ------------- |
| `TopicCreationService`                        | Returns `{ success: boolean, error?: {...} }` | Result object |
| `services/sessions.ts` (`createSession`)      | Throws `Error`                                | Exception     |
| `services/chunks.ts` (`deleteChunk`)          | Returns `{ success: boolean, error?: {...} }` | Result object |
| `services/chunks.ts` (`createChunkWithTopic`) | Throws `Error`                                | Exception     |
| `services/chunk-reviews.ts`                   | Throws `Error`                                | Exception     |

There is no declared or consistent service-layer error convention. Some services throw, some return Result-like objects, and some do both depending on the method.

**Severity**: Medium-High. This forces tool registration code to handle both patterns inconsistently.

---

## 5. Error Handling Strategy

### 5.1 No Declared Strategy

Neither AGENTS.md nor README explicitly declares an error handling strategy. The only relevant guidance is:

- "Descriptive error messages for invalid inputs"
- "Schema validation on all inputs"

### 5.2 Actual Patterns by Layer

**MCP Tool Layer**: Most tools use try/catch with `toolError()`. Notable exceptions are the pure-calculation tools in `spaced-repetition-tools.ts` (`calculate_next_review`, `calculate_priority_score`, `calculate_next_review_advanced`, `rank_candidates`) which lack try/catch — errors from these surface as unhandled MCP exceptions. Tools with I/O (database, recommendation engine) consistently wrap in try/catch. **Grade: Good (with gaps in pure-calculation tools).**

**Service Layer**: Mixed — some throw, some return Result objects (see 4.5 above). **Grade: Inconsistent.**

**Algorithm Layer**: Pure functions that never throw. They use defensive clamping (`Math.max`, `Math.min`, `clampEaseFactor()`, `Number.isFinite()` guards). **Grade: Excellent.**

**Database Layer**: `operations.ts` helper functions (`decodeJsonArray`, `encodeJsonArray`) silently return defaults on parse failure. `getSql()` and `withTx()` allow errors to propagate. **Grade: Acceptable.**

### 5.3 Silent Error Handling Inventory

| Function                            | Behavior on Error                             | File                                     |
| ----------------------------------- | --------------------------------------------- | ---------------------------------------- |
| `decodeJsonArray()`                 | Returns `[]`                                  | `db/operations.ts:47`                    |
| `parseJsonArraySafely()`            | Returns `[]`, logs warning                    | `services/topic-creation.ts:22`          |
| `getHistoricalFeedbackForChunks()`  | Returns `[]`, logs error                      | `services/sessions.ts:504`               |
| `getTopicWithChunks()`              | Returns `null`, logs error                    | `services/topic-creation.ts:191`         |
| `resolveAndIncludePrerequisites()`  | Returns original list, logs error             | `tools/recommendation-engine.ts:513`     |
| `resolveSessionChunkDependencies()` | Returns original list, logs error             | `server/session-management-tools.ts:205` |
| `filterAndPrioritizeCandidates()`   | Continues without prereq filter, logs warning | `tools/recommendation-engine.ts:203`     |
| `convertSessionToSessionInput()`    | Logs parse errors, continues with empty data  | `services/sessions.ts:343`               |

None of these truly "swallow" errors — they all log via the centralized logger and degrade gracefully. This is a defensible pattern for an MCP server (failing open rather than crashing), but it is an **implicit** strategy, not a documented one.

### 5.4 Centralized Logging — GOOD

All error logging flows through `src/utils/logger.ts`, which correctly routes output to stderr in MCP mode to avoid corrupting the JSON-RPC stdout channel. Every catch block uses `logger.error()` or `logger.warn()`. No raw `console.log()` calls in source code outside the logger module.

---

## Summary of Findings

### Critical (should fix before external consumers rely on it)

| #     | Finding                                                        | Section |
| ----- | -------------------------------------------------------------- | ------- |
| PC-C1 | README tool table is ~30% incomplete and lists 3 phantom tools | 1.2     |

### High Severity

| #     | Finding                                                                                          | Section |
| ----- | ------------------------------------------------------------------------------------------------ | ------- |
| PC-H1 | AGENTS.md references `src/tools/sr-calculator.ts` — file is at `src/algorithms/sr-calculator.ts` | 1.1     |
| PC-H2 | AGENTS.md File Organization omits `src/algorithms/` and `src/constants/` directories             | 1.1     |
| PC-H3 | `orchestrate_learning_workflow` tool documented but does not exist                               | 1.3     |

### Medium Severity

| #     | Finding                                                                     | Section  |
| ----- | --------------------------------------------------------------------------- | -------- |
| PC-M1 | snake_case/camelCase boundary convention is undocumented                    | 3.1      |
| PC-M2 | 3 `z.any()` violations in source code against "no any" policy               | 4.3      |
| PC-M3 | Inline Zod schemas in session-management-tools.ts violate DRY principle     | 4.2      |
| PC-M4 | Two competing error response formats (Pattern A vs Pattern B) in tool layer | 4.4      |
| PC-M5 | No declared error handling strategy; services mix throw vs Result patterns  | 4.5, 5.1 |
| PC-M6 | 13 source files lack dedicated test files                                   | 1.6      |
| PC-M7 | MCP "Resources" claim is inaccurate — no resources are registered           | 1.4      |

### Low Severity

| #     | Finding                                                           | Section |
| ----- | ----------------------------------------------------------------- | ------- |
| PC-L1 | Minor comment drift: "0/1 day" when code always sets 1            | 2       |
| PC-L2 | Dead `daysBetween()` function with eslint-disable                 | 3.3     |
| PC-L3 | AI-session artifact comments (`// New: chunk prompts`)            | 3.3     |
| PC-L4 | `sessionToolInputSchema` export in tool-helpers.ts appears unused | 3.3     |

### Positive Findings

| #     | Finding                                                                                                         |
| ----- | --------------------------------------------------------------------------------------------------------------- |
| PC-P1 | Tool registration pattern is generally consistent across registrar files (minor gaps in pure-calculation tools) |
| PC-P2 | Algorithm layer is pure, defensive, and never throws                                                            |
| PC-P3 | Centralized logger correctly routes to stderr in MCP mode                                                       |
| PC-P4 | Zod validation is comprehensive at system boundaries                                                            |
| PC-P5 | Database schema matches documentation claims                                                                    |
| PC-P6 | Prompt registrations match documented capabilities                                                              |
| PC-P7 | 9/10 sampled function comments are accurate                                                                     |
| PC-P8 | Environment-driven configuration with sensible defaults is well-implemented                                     |
| PC-P9 | Pre-commit hooks, Prettier, and ESLint are properly configured                                                  |
