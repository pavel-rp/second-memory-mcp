# Audit 05 — Test Suite Quality

## Executive Summary

The test suite contains **32 test files** with **324 passing tests** covering a spaced repetition MCP server. Overall statement coverage is **72.94%** (threshold: 65%), function coverage is **82.6%** (threshold: 75%). The tests are structurally well-organized, with proper database isolation per test. However, several critical paths have no coverage at all, some tests use weak assertions that would pass regardless of correctness, and a few files show patterns consistent with coverage-padding rather than behavior validation.

---

## 1. Coverage Gaps

### 1.1 Source Files With Zero or Near-Zero Test Coverage

| File | Stmts | What It Does | Risk |
|---|---|---|---|
| `src/server/main.ts` | **0%** | MCP server bootstrap, prompt registration, stdio transport setup | **High** — the entry point is completely untested; misconfigurations in tool/prompt wiring would only surface at runtime |
| `src/services/chunk-reviews.ts` | **2.43%** | `processReviewResult()` — applies SM-2 algorithm to real chunks in the database, updates ease factor/interval/repetitions, detects leeches | **Critical** — this is the write path for the entire spaced repetition system |
| `src/services/prerequisite-mastery.ts` | **14.47%** | `PrerequisiteMasteryService` — determines mastery status based on quality scores, attempt counts, recency, success rate | **High** — mastery checks gate which items users see; incorrect mastery logic silently breaks recommendation quality |
| `src/services/reviews.ts` | **0%** | `listDueReviews()` — queries chunks that are due for review | **Medium** — basic query function, but untested SQL logic could silently return wrong results |
| `src/db/migrate.ts` | **27.06%** | Schema creation, legacy table removal, JSON import | **Medium** — only the JSON import path is tested via child process fork; `ensureSchema()` is exercised indirectly by other tests but `initializeDatabase()` is not directly tested |
| `src/types/prerequisite-validation.ts` | **0%** | Zod schemas for prerequisite validation types | **Low** — type definitions only, but validation schemas are untested |
| `src/types/sr.ts` | **0%** | Zod schemas for SR calculator input/output types | **Low** — type definitions, but if schemas are used for runtime validation these should be tested |
| `src/types/topic-creation.ts` | **0%** | Zod schemas for topic creation types | **Low** — same as above |

### 1.2 Critical Paths Without Tests

**Review result processing** (`src/services/chunk-reviews.ts:processReviewResult`): The function that actually writes SM-2 updates back to chunks in the database has no tests at all. This is the core write path of the entire system — it takes a quality score, calculates the next review using the algorithm, updates the chunk in SQLite, and returns leech status. A bug here would corrupt all scheduling data.

**MCP tool handlers under `src/server/`**: While `registerServerTools` is tested for tool name registration, the actual handler functions inside the individual tool files (`analytics-tools.ts` at 45%, `persistence-tools.ts` at 26%, `spaced-repetition-tools.ts` at 40%) have significant untested branches. These handlers perform input parsing, database calls, and response formatting — the integration layer between MCP protocol and business logic.

**Server startup** (`src/server/main.ts`): No tests for the bootstrap sequence, prompt registration, or MCP transport setup. A misconfiguration in prompt registration (wrong argument names, missing prompts) would only be caught by the MCP stdout validation integration test, which only checks that the server starts and responds to `initialize` — it does not exercise individual prompts or tools.

**Content validation utilities** (`src/utils/content-validation.ts` at 66%): Functions like `isEducationalContent()` and `estimateReadingTime()` are untested. `validateContentBatch()` is also untested.

### 1.3 Untested Error Paths

- `src/services/chunk-reviews.ts` — no error path testing at all (chunk not found, database errors during review write)
- `src/server/persistence-tools.ts` — error handling for content update failures (26% coverage)
- `src/tools/conversation-manager.ts` — the `handleSessionContinuation` and `handleRecordResult` private methods have no coverage (71.7% overall)
- `src/config/algorithm.ts` — invalid environment variable parsing (only 1 test case for env overrides; no test for malformed values like `SM_MIN_EASE_FACTOR=abc`)

---

## 2. Test Quality Issues

### 2.1 Tests That Assert Nothing Meaningful

**`tests/integration/prerequisite-recommendation.test.ts`** — 4 tests that primarily check structural existence rather than behavioral correctness:

```typescript
// Lines 66-71: These assertions pass for any object with the right shape,
// regardless of whether the recommendation logic is correct
expect(result).toBeDefined();
expect(result).toHaveProperty('recommendations');
expect(result).toHaveProperty('rationale');
expect(Array.isArray(result.recommendations)).toBe(true);
```

The test comment itself acknowledges this: `"Should get a result object (may be empty due to no database setup, but shouldn't crash)"`. These tests verify the tool doesn't throw, not that it produces correct recommendations. An implementation returning `{ recommendations: [], rationale: "" }` for all inputs would pass every assertion.

**`tests/server/tools-registration.test.ts`** and **`tests/server/create-learning-item.test.ts`** — These 4 tests only verify that tool names appear in a stub's array after `registerServerTools()` is called. They confirm registration happened but not that any tool handler works correctly:

```typescript
// This passes even if the handler throws on every call
expect(stub.tools).toContain('calculate_next_review');
```

### 2.2 Tests Coupled to Implementation Details

**`tests/tools/conversation-manager.test.ts`** — Several tests assert on specific internal string content that will break on any copy change:

```typescript
// Lines 103-106: Coupled to exact tool names and prompt names in output text
expect(out.message).toContain('create_topic_with_chunks');
expect(out.message).toContain('chunk_generation');
expect(out.message).toContain('search_learning_content');
```

```typescript
// Line 129: Coupled to exact subject inference output format
expect(out.message).toContain('subject: "SWE"');
```

These tests will break if the conversation guidance text is reworded, even if the behavior is identical. They test the prose of the output rather than the behavior (e.g., "does it recommend the correct workflow?").

**`tests/tools/conversation-manager.test.ts` lines 130-135** — Tests assert on exact `nextActions` array values:

```typescript
expect(out.recommendations?.nextActions).toContain(
  'Call search_learning_content tool with topic keywords'
);
```

Any change to the wording of these guidance strings breaks the test, even though the underlying recommendation behavior hasn't changed.

### 2.3 Weak Assertion Patterns

Several tests use `toBeDefined()` or `toBeGreaterThan(0)` where more specific assertions would catch regressions:

**`tests/tools/session-manager.test.ts` line 82-83**:
```typescript
expect(result.estimated_time_remaining_ms).toBeDefined();
expect(result.estimated_time_remaining_ms).toBeGreaterThan(0);
```
This passes for any positive number. Given the test fixture has known timing data (30 minutes total, 1 of 3 chunks done), the test could assert a specific expected range.

**`tests/tools/recommendation-engine.test.ts` line 119-122**:
```typescript
expect(out.recommendations.length).toBeGreaterThan(0);
expect(out.sessionSummary.totalItems).toBe(out.recommendations.length);
expect(out.conversationGuidance).toBeDefined();
expect(out.rationale).toMatch(/spaced repetition/i);
```
The `toBeDefined()` on `conversationGuidance` passes for any truthy value, and `toMatch(/spaced repetition/i)` on `rationale` only checks that a phrase appears somewhere — not that the rationale accurately describes what happened.

### 2.4 Conditional Assertions That May Never Execute

**`tests/tools/recommendation-engine.test.ts`** has several patterns where the important assertions are wrapped in conditionals:

```typescript
// Lines 209-214
if (out.alternatives && out.alternatives.length > 0) {
  const selectedIds = new Set(out.recommendations.map(r => r.item.id));
  for (const alt of out.alternatives) {
    expect(selectedIds.has(alt.item.id)).toBe(false);
  }
}
```

```typescript
// Lines 322-332
if (hasPrerequisiteReason) {
  expect(result.rationale).toMatch(/prerequisite/i);
}
if (result.dependencyResolution && result.dependencyResolution.addedPrerequisites.length > 0) {
  expect(result.dependencyResolution.addedPrerequisites).toBeDefined();
  // ...
}
```

If the condition is false, the test passes trivially without validating the behavior it's named for. This pattern appears in 7 test cases across the recommendation engine tests, with 9 conditional blocks total containing assertions.

---

## 3. AI Test Patterns

### 3.1 Coverage-Padding Tests

**`tests/server/create-learning-item.test.ts`** — 3 tests, each doing the exact same thing (create stub, register, check name):

```typescript
it('should register the create_learning_item tool', () => {
  const stub = new StubServer();
  registerServerTools(stub as unknown as McpServer);
  expect(stub.tools).toContain('create_learning_item');
});
it('should register the record_review_result tool', () => {
  const stub = new StubServer();
  registerServerTools(stub as unknown as McpServer);
  expect(stub.tools).toContain('record_review_result');
});
it('should register the delete_chunk tool', () => {
  const stub = new StubServer();
  registerServerTools(stub as unknown as McpServer);
  expect(stub.tools).toContain('delete_chunk');
});
```

Three test cases that inflate the count but verify only that `registerServerTools` pushes names to an array. The file name `create-learning-item.test.ts` suggests it should test the create_learning_item functionality, but it only tests name registration. A single test asserting all three names would be equivalent.

**`tests/integration/prerequisite-recommendation.test.ts` test 3** — Named "should process tool registration successfully" but only checks:
```typescript
expect(tool).toBeDefined();
expect(tool.spec).toBeDefined();
expect(tool.handler).toBeDefined();
expect(typeof tool.handler).toBe('function');
```
This is a registration check dressed as an integration test.

### 3.2 Over-Mocked Tests

**`tests/tools/prerequisite-validator.test.ts`** — The entire module under test depends on two injected services (`referenceValidator` and `masteryService`), both of which are fully mocked. While this is valid unit test practice, the test never verifies that the mocks are wired correctly to the real services. The actual `PrerequisiteReferenceValidator` and `PrerequisiteMasteryService` classes (which have 70% and 14% coverage respectively) are never exercised through the validator. A wiring bug between the real services and the validator would go undetected.

**`tests/tools/conversation-manager.test.ts`** — Creates a `ConversationManager` with a mocked `PrerequisiteValidator` and a `RecommendationEngine` that has a no-op `chunkLookupFn` (`async () => undefined`). This means no database interaction occurs, and recommendation logic is tested in isolation from the data layer. The conversation manager tests verify message generation patterns but never validate that actual recommendations are correct.

### 3.3 Test Names That Don't Describe Scenarios

Several test names describe what the code does rather than what scenario is being validated:

- `"should process tool registration successfully"` — what scenario? All tool registrations?
- `"handles edge cases gracefully"` — which edge cases? (test in `checkSessionCompletion` only checks empty chunks)
- `"should handle prerequisite processing without database"` — the name doesn't specify what the expected behavior should be

---

## 4. Testing Infrastructure

### 4.1 Isolation

**Database isolation is strong.** Each database-dependent test creates a unique temp file via `crypto.randomUUID()`:
```typescript
function tmpDbPath() {
  return path.resolve(`./tmp-test-${crypto.randomUUID()}.db`);
}
```

The `vitest.setup.ts` file provides a safety net that prevents tests from accidentally using the production database:
```typescript
if (!process.env.SM_DB_PATH || process.env.SM_DB_PATH.includes("second-memory.db")) {
  process.env.SM_DB_PATH = path.resolve(`./tmp-test-${crypto.randomUUID()}.db`);
}
```

Cleanup is handled in `afterEach` blocks that delete `.db`, `.db-shm`, and `.db-wal` files, plus a post-test cleanup script.

**Module isolation is adequate.** Tests use `vi.resetModules()` where env-var-dependent modules need fresh imports (algorithm config tests, SR calculator config tests).

### 4.2 Test Execution Order Independence

Tests do **not** depend on execution order. Each database test uses `beforeEach` to create a fresh database and `afterEach` to tear it down. Pure function tests (analytics, preference-filter, session-manager) are stateless.

One minor concern: `tests/services/sessions.test.ts` and `tests/services/topics.test.ts` define their own inline `ensureSchema()` functions with raw SQL `CREATE TABLE` statements rather than importing from the migration module. If the schema definition in these tests diverges from the actual migration in `src/db/migrate.ts`, tests could pass while production fails. Other test files (e.g., `chunks.test.ts`, `topic-creation.test.ts`) correctly import `ensureSchema` from the migration module. Currently the inline schemas are in sync with the migration.

### 4.3 Integration vs Unit Test Boundaries

The test directory structure separates integration tests (`tests/integration/`) from unit tests, which is good. However:

- **`tests/services/*.test.ts`** are effectively integration tests since they use real SQLite databases. They're correctly categorized under `services/` but are full integration tests, not unit tests.
- **`tests/server/*.test.ts`** is mixed: `tools-registration.test.ts` and `create-learning-item.test.ts` are pure unit tests (stub server), while `content-tools.test.ts`, `search-tools.test.ts`, `session-management-tools.test.ts` are integration tests with real databases.
- **`tests/tools/session-manager-batch.test.ts`** uses a real database despite being in the `tools/` directory, making it an integration test.

This mixing doesn't cause problems, but the implicit categorization is imprecise.

### 4.4 SQLite Binding Skip Pattern

Many test files include a `hasBinding` check that skips database tests when `better-sqlite3` native bindings aren't available:

```typescript
(hasBinding ? describe : describe.skip)('sessions service', () => { ... });
```

This is replicated in 6 test files with identical boilerplate (`migrate.test.ts`, `chunks.test.ts`, `sessions.test.ts`, `topics.test.ts`, `topic-creation.test.ts`, `content-persistence.test.ts`). The remaining database-dependent tests (integration tests, server tests, `session-manager-batch.test.ts`) do not include this guard and would fail directly if bindings were missing. A CI environment without native bindings would skip these 6 files while the other database tests would fail hard.

### 4.5 Coverage Thresholds

The configured thresholds in `vitest.config.ts` are:
- Statements: 65%
- Lines: 65%
- Functions: 75%

Current actuals are 72.94% / 72.94% / 82.6%, which clear the thresholds but with modest margin. The thresholds are low enough that significant new untested code could be added without failing the coverage check.

---

## 5. Summary of Findings

### Must Fix

| # | Finding | Location | Impact |
|---|---------|----------|--------|
| 1 | `processReviewResult()` has no tests | `src/services/chunk-reviews.ts` | Core SM-2 write path is completely untested |
| 2 | `PrerequisiteMasteryService` has 14% coverage | `src/services/prerequisite-mastery.ts` | Mastery logic gates recommendation filtering |
| 3 | Conditional assertions in recommendation tests may never execute | `tests/tools/recommendation-engine.test.ts` | 7 test cases with 9 conditional assertion blocks that may silently pass |

### Should Fix

| # | Finding | Location | Impact |
|---|---------|----------|--------|
| 4 | Prerequisite-recommendation integration tests use trivial assertions | `tests/integration/prerequisite-recommendation.test.ts` | 4 tests pass regardless of recommendation correctness |
| 5 | Tool registration tests inflate count without testing behavior | `tests/server/create-learning-item.test.ts`, `tests/server/tools-registration.test.ts` | 4 tests that only verify name strings |
| 6 | MCP server tool handler branches at 26-45% coverage | `src/server/persistence-tools.ts`, `src/server/analytics-tools.ts`, `src/server/spaced-repetition-tools.ts` | Error handling and edge case branches in the MCP layer are untested |
| 7 | `listDueReviews()` has 0% coverage | `src/services/reviews.ts` | Query logic for finding due reviews is untested |
| 8 | Conversation manager tests coupled to exact output strings | `tests/tools/conversation-manager.test.ts` | Tests break on any copy change without behavior change |

### Consider

| # | Finding | Location | Impact |
|---|---------|----------|--------|
| 9 | SQLite binding skip pattern is duplicated across 6 files | `tests/db/migrate.test.ts`, `tests/services/{chunks,sessions,topics,topic-creation,content-persistence}.test.ts` | Inconsistent: these 6 skip silently, other database tests would fail hard |
| 10 | Algorithm config has 1 test for env overrides, no test for invalid values | `tests/config/algorithm.test.ts` | Malformed env vars could cause runtime errors |
| 11 | Schema definitions in some tests are inline SQL, not using the migration module | `tests/services/sessions.test.ts`, `tests/services/topics.test.ts` | Schema drift between tests and production possible |
