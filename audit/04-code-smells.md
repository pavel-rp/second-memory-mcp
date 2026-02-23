# Code Smell Audit

## DRY VIOLATIONS

### DRY-1: Milliseconds-per-day constant repeated 4 times

The magic number `24 * 60 * 60 * 1000` (or `86400000`) for converting milliseconds to days is computed inline in four separate locations with no shared constant.

- `src/tools/analytics.ts:29` — `const msPerDay = 24 * 60 * 60 * 1000;`
- `src/services/prerequisite-mastery.ts:114` — `Math.floor((Date.now() - chunk.lastReviewedAt) / (24 * 60 * 60 * 1000))`
- `src/tools/preference-filter.ts:111` — `Math.floor((aDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))`
- `src/tools/preference-filter.ts:112` — `Math.floor((bDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))`
- `src/algorithms/sr-calculator.ts:81` — uses `86400000` literal

**Fix:** Extract a `MS_PER_DAY` constant into `src/constants/validation.ts` or a new `time.ts` constants file.

---

### DRY-2: `error instanceof Error ? error.message : 'Unknown ...'` repeated 16+ times

The identical error-extraction pattern is copy-pasted across the entire codebase despite a utility function `extractErrorMessage` already existing in `src/server/tool-helpers.ts:19-21`.

| File | Line(s) |
|------|---------|
| `src/services/chunks.ts` | 160, 249, 368, 517 |
| `src/services/topic-creation.ts` | 144, 289, 392 |
| `src/tools/prerequisite-validator.ts` | 71, 219, 272 |
| `src/algorithms/prerequisite-reference-validator.ts` | 65 |
| `src/algorithms/dependency-resolver.ts` | 87 |
| `src/db/migrate.ts` | 138, 151, 169 |

**Fix:** Replace all occurrences with `extractErrorMessage(error)` from `tool-helpers.ts`, or move it to `src/utils/errors.ts` so non-server code can import it.

---

### DRY-3: Duplicate JSON-array parsing — `parseJsonArraySafely` vs `decodeJsonArray`

`src/services/topic-creation.ts:22-31` defines `parseJsonArraySafely`, which is functionally identical to `decodeJsonArray` at `src/db/operations.ts:47-55`. Both parse a nullable JSON string into a `string[]`, with the same `try/catch → []` fallback.

- `src/services/topic-creation.ts:22` — `parseJsonArraySafely`
- `src/services/topic-creation.ts:122,125,182,185` — called 4 times
- `src/db/operations.ts:47` — `decodeJsonArray` (canonical version)

**Fix:** Delete `parseJsonArraySafely` and use `decodeJsonArray` in `topic-creation.ts`.

---

### DRY-4: `Math.round(x * 100) / 100` repeated 7 times

The "round to 2 decimal places" pattern is inlined across analytics and session management rather than using a shared utility.

- `src/tools/session-manager.ts:78`
- `src/tools/session-manager.ts:81`
- `src/tools/analytics.ts:136`
- `src/tools/analytics.ts:196`
- `src/tools/analytics.ts:228`
- `src/tools/analytics.ts:254`
- `src/tools/preference-filter.ts:291`

**Fix:** Extract a `roundTo(value, decimals)` utility function.

---

### DRY-5: Chunk "find by ID" query repeated 11 times

The pattern `db.select().from(learningChunks).where(eq(learningChunks.id, id)).get()` is duplicated in nearly every chunk service function rather than being centralized through `getChunk()`.

- `src/services/chunks.ts:49,105,149,192,239,284,357,397`
- `src/services/chunk-reviews.ts:19,52`
- `src/services/prerequisite-mastery.ts:100`

**Fix:** Reuse the existing `getChunk(id)` function from `src/services/chunks.ts:47` which does exactly this.

---

### DRY-6: Identical error result type defined 4 times in `chunks.ts`

The same `{ type: 'validation' | 'not_found' | 'database'; message: string; field?: string }` error shape is redefined as part of `UpdateChunkContentResult`, `UpdateChunkMetadataResult`, `UpdateChunkWithProgressResetResult`, and `DeleteChunkResult`.

- `src/services/chunks.ts:91-94`
- `src/services/chunks.ts:177-181`
- `src/services/chunks.ts:269-273`
- `src/services/chunks.ts:386-390`

**Fix:** Extract a shared `ChunkOperationError` type and reuse it across all result types.

---

### DRY-7: Three structurally identical chunk-update functions in `chunks.ts`

`updateChunkContent` (97-164), `updateChunkMetadata` (184-253), and `updateChunkWithProgressReset` (276-372) follow the same pattern:
1. Get current chunk (or return not_found error)
2. Build update payload
3. Execute update (or return database error)
4. Re-fetch and return updated chunk (or return database error)
5. Catch → database error

All three share ~60% identical code. `updateChunkWithProgressReset` is essentially a superset that could replace the other two with optional parameters.

- `src/services/chunks.ts:97-164` — `updateChunkContent`
- `src/services/chunks.ts:184-253` — `updateChunkMetadata`
- `src/services/chunks.ts:276-372` — `updateChunkWithProgressReset`

**Fix:** Unify into a single `updateChunkFields(id, input, options?)` function.

---

### DRY-8: Topic-level update methods duplicate the same pattern in `topic-creation.ts`

`updateTopic` (203-293) and `updateTopicSummary` (298-396) both:
1. Check if topic exists (return not_found)
2. Validate input (return validation error)
3. Build update data, execute update
4. Re-fetch and return updated topic
5. Catch → database error

- `src/services/topic-creation.ts:203-293` — `updateTopic`
- `src/services/topic-creation.ts:298-396` — `updateTopicSummary`

**Fix:** Unify into a single generic update with field-specific validation.

---

### DRY-9: Duplicate `RankCandidate` type in two locations

`RankCandidate` is defined identically in both:
- `src/types/sr.ts:34-41` — plain TypeScript type
- `src/types/spaced-repetition-tools.ts:59-60` — Zod-inferred type

These represent the same domain concept with different origins. The `sr.ts` version is only consumed by `sr-calculator.ts`, while the Zod version is used by server tools.

**Fix:** Consolidate to a single source, deriving the plain type from the Zod schema if both are needed.

---

### DRY-10: Topic/chunk breakdown calculation duplicated in analytics

The topic breakdown and tag breakdown blocks in `computeWindowRollup` are structurally identical — same accumulation into a `Map<string, { reviews: number; qualities: number[] }>`, same average quality calculation, same output shape.

- `src/tools/analytics.ts:207-230` — topic breakdown
- `src/tools/analytics.ts:233-256` — tag breakdown

**Fix:** Extract a generic `computeBreakdown(entries, keyExtractor)` function.

---

### DRY-11: `composeBalancedSession` and `generateIntelligentConstraints` exist in two forms

These functions exist as standalone exports in `preference-filter.ts` and as private methods in the `RecommendationEngine` class in `recommendation-engine.ts`. The class methods are used; the standalone functions are never imported in production code.

- `src/tools/preference-filter.ts:159-205` — `composeBalancedSession` (standalone, unused in production)
- `src/tools/preference-filter.ts:210-235` — `generateIntelligentConstraints` (standalone, unused in production)
- `src/tools/recommendation-engine.ts:237-330` — `composeBalancedSession` (class method, used)
- `src/tools/recommendation-engine.ts:145-175` — `generateIntelligentConstraints` (class method, used)

**Fix:** Remove the unused standalone versions or delegate the class methods to the standalone functions.

---

## SOLID VIOLATIONS

### SOLID-1 (SRP): `TopicCreationService` handles both topic CRUD and validation

`TopicCreationService` in `src/services/topic-creation.ts:37-441` is responsible for:
- Topic creation with bulk chunk insertion
- Topic retrieval with chunk aggregation
- Topic title updates with validation
- Topic summary updates with version management
- Input validation

This class mixes persistence orchestration, validation logic, and two different update workflows.

**Fix:** Extract update operations into a separate `TopicUpdateService` or convert to standalone functions matching the pattern used in other service files.

---

### SOLID-2 (SRP): `session-management-tools.ts` registers 8 tools in one 666-line file

`src/server/session-management-tools.ts` (666 lines) registers 8 distinct MCP tools in a single `registerSessionManagementTools` function. Each tool handler contains its own input parsing, business logic orchestration, and response formatting.

Similarly, `src/server/persistence-tools.ts` (629 lines) registers 11 tools in a single function.

- `src/server/session-management-tools.ts:1-666`
- `src/server/persistence-tools.ts:1-629`

**Fix:** Split each tool registration into its own file or at minimum into separate registration functions.

---

### SOLID-3 (OCP): `PromptPack.getPrompt` switch statement requires modification for new prompt types

`src/prompts/prompt-pack.ts:63-80` uses a `switch` statement over `PromptName` literals. Adding a new prompt type requires modifying this class.

**Fix:** Use a `Map<PromptName, (context) => string>` registration pattern so new prompts can be added without modifying existing code.

---

### SOLID-4 (OCP): `cognitive-load.ts` switch statement on `chunkType`

`src/tools/cognitive-load.ts:11-21` uses a `switch` on `item.chunkType` with hardcoded multipliers. Adding a new chunk type requires modifying this function.

**Fix:** Use a configuration map: `const CHUNK_TYPE_MULTIPLIERS: Record<ChunkType, number>`.

---

### SOLID-5 (DIP): Services directly call `getSql()` instead of receiving a DB handle

Every service function directly calls `getSql()` to obtain a database handle:
- `src/services/chunks.ts:33,48,57,101,188,280,394,528,594,612`
- `src/services/sessions.ts:80,124,180,186,197,219,228,247,251,306,385,410,446`
- `src/services/topics.ts:14,19,23,36,54,63,82`
- `src/services/search.ts:149`
- `src/services/prerequisite-mastery.ts:99`
- `src/services/chunk-prerequisites.ts:11,24`
- `src/services/chunk-queries.ts:95,154,238`

This couples every service to the global singleton and makes unit testing without database impossible.

**Fix:** Accept the database handle as a parameter, defaulting to `getSql()` for backward compatibility.

---

## COMPLEXITY SMELLS

### CPLX-1: Functions over 40 lines

| Function | File | Lines | LOC |
|----------|------|-------|-----|
| `registerSessionManagementTools` | `src/server/session-management-tools.ts` | 1-666 | 666 |
| `registerPersistenceTools` | `src/server/persistence-tools.ts` | 1-629 | 629 |
| `recommend` | `src/tools/recommendation-engine.ts` | 32-100 | 68 |
| `processDefaults` | `src/tools/recommendation-engine.ts` | 102-142 | 40 |
| `composeBalancedSession` (class) | `src/tools/recommendation-engine.ts` | 237-330 | 93 |
| `fetchAndConvertItems` | `src/tools/recommendation-engine.ts` | 332-395 | 63 |
| `resolvePrerequisiteDependencies` | `src/tools/recommendation-engine.ts` | 397-493 | 96 |
| `buildRecommendations` | `src/tools/recommendation-engine.ts` | 495-573 | 78 |
| `buildGuidance` | `src/tools/recommendation-engine.ts` | 575-648 | 73 |
| `computeWindowRollup` | `src/tools/analytics.ts` | 144-272 | 128 |
| `composeBalancedSession` (standalone) | `src/tools/preference-filter.ts` | 159-205 | 46 |
| `calculateSessionQuality` | `src/tools/preference-filter.ts` | 240-292 | 52 |
| `handle` (ConversationManager) | `src/tools/conversation-manager.ts` | 33-100 | 67 |
| `handleStartLearning` | `src/tools/conversation-manager.ts` | 102-196 | 94 |
| `handleGetRecommendations` | `src/tools/conversation-manager.ts` | 198-290 | 92 |
| `handleContinueSession` | `src/tools/conversation-manager.ts` | 292-380 | 88 |
| `filterByPrerequisites` | `src/tools/prerequisite-validator.ts` | 113-227 | 114 |
| `validatePrerequisiteReferences` | `src/tools/prerequisite-validator.ts` | 229-280 | 51 |
| `calculateProgress` | `src/tools/session-manager.ts` | 45-127 | 82 |
| `calculateWorkflowPhase` | `src/tools/session-manager.ts` | 129-234 | 105 |
| `checkCompletion` | `src/tools/session-manager.ts` | 236-352 | 116 |
| `deleteChunk` | `src/services/chunks.ts` | 393-522 | 129 |
| `updateChunkWithProgressReset` | `src/services/chunks.ts` | 276-372 | 96 |
| `updateChunkContent` | `src/services/chunks.ts` | 97-164 | 67 |
| `updateChunkMetadata` | `src/services/chunks.ts` | 184-253 | 69 |
| `createTopicWithChunks` | `src/services/topic-creation.ts` | 41-149 | 108 |
| `updateTopic` | `src/services/topic-creation.ts` | 203-293 | 90 |
| `updateTopicSummary` | `src/services/topic-creation.ts` | 298-396 | 98 |
| `getTopicWithChunks` | `src/services/topic-creation.ts` | 154-195 | 41 |
| `convertSessionToSessionInput` | `src/services/sessions.ts` | 289-381 | 92 |
| `persistBatchSessionChunkOperations` | `src/services/sessions.ts` | 514-596 | 82 |
| `getHistoricalFeedbackForChunks` | `src/services/sessions.ts` | 435-508 | 73 |
| `createSession` | `src/services/sessions.ts` | 123-177 | 54 |
| `searchLearningContent` | `src/services/search.ts` | 146-243 | 97 |
| `ensureSchema` | `src/db/migrate.ts` | 33-172 | 139 |
| `getChunkWithContent` | `src/services/chunks.ts` | 608-641 | 33 (borderline) |
| `resolveDependencies` | `src/algorithms/dependency-resolver.ts` | 26-92 | 66 |
| `registerSpacedRepetitionTools` | `src/server/spaced-repetition-tools.ts` | 1-259 | 259 |
| `registerSessionTools` | `src/server/session-tools.ts` | 1-235 | 235 |
| `registerContentTools` | `src/server/content-tools.ts` | 1-173 | 173 |
| `registerSearchTools` | `src/server/search-tools.ts` | 1-77 | 77 |
| `registerAnalyticsTools` | `src/server/analytics-tools.ts` | 1-120 | 120 |

---

### CPLX-2: Nesting depth over 3 levels

| Location | Max depth | Description |
|----------|-----------|-------------|
| `src/services/chunks.ts:458-503` | 4 | `deleteChunk` → try → withTx → for → if chain |
| `src/services/sessions.ts:529-592` | 4 | `persistBatchSessionChunkOperations` → withTx → for → if/else |
| `src/tools/recommendation-engine.ts:397-493` | 4 | `resolvePrerequisiteDependencies` → try → if → for → if |
| `src/tools/conversation-manager.ts:102-196` | 4 | `handleStartLearning` → try → if → ternary chains |
| `src/tools/analytics.ts:203-268` | 4 | breakdown loops: `if → for → if → if` |
| `src/db/migrate.ts:106-171` | 3-4 | Sequential try blocks with nested if checks |
| `src/services/sessions.ts:320-345` | 4 | `convertSessionToSessionInput` → map → try → if |
| `src/tools/prerequisite-validator.ts:113-227` | 4 | `filterByPrerequisites` → try → for → if → for |

---

### CPLX-3: Functions with more than 4 parameters

| Function | File:Line | Params |
|----------|-----------|--------|
| `persistBatchSessionChunkOperations` | `src/services/sessions.ts:514` | Takes object with 3 named fields, but the inner closure uses 6+ variables — borderline |

Most functions use object destructuring for options, which is good practice. No egregious >4 parameter cases found.

---

### CPLX-4: Boolean parameters that control behavior (flag arguments)

| Function | File:Line | Flag |
|----------|-----------|------|
| `filterByTimeConstraints` | `src/tools/preference-filter.ts:35` | `includeBuffer: boolean = true` |
| `estimateSessionDuration` | `src/tools/preference-filter.ts:66` | `includeTransitions: boolean = true` |
| `mapChunkRowToLearningItem` | `src/services/chunk-queries.ts:52-58` | `options.includeContent: boolean` — triggers different return type via overloads |
| `listChunksWithContent` | `src/services/chunk-queries.ts:151` | `includeContent` in filter options |
| `validateContent` | `src/utils/content-validation.ts:168` | `sanitize` and `preserveBasicMarkdown` |
| `sanitizeContent` | `src/utils/content-validation.ts:117` | `preserveBasicMarkdown` and `preserveNewlines` |

---

### CPLX-5: God function — `registerSessionManagementTools`

`src/server/session-management-tools.ts:1-666` is a single 666-line function that registers 8 MCP tools. It mixes input validation, business logic orchestration, error handling, and response formatting for all 8 tools. Similarly, `src/server/persistence-tools.ts:1-629` registers 11 tools.

---

## AI-SPECIFIC SMELLS

### AI-1: Dead code — `daysBetween` function suppressed with eslint-disable

`src/tools/analytics.ts:26-31` defines a `daysBetween` helper function marked "for future use" with an explicit `eslint-disable-next-line @typescript-eslint/no-unused-vars` comment. It is never called.

```typescript
// Helper function to calculate days between dates (for future use)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function daysBetween(start: Date, end: Date): number {
```

**Fix:** Remove the function. If needed later, it can be re-implemented.

---

### AI-2: Dead code — unused import `SubjectPreference` in `topic-creation.ts`

`src/types/topic-creation.ts:4-5` imports `SubjectPreference` with an explicit eslint-disable, but it's never used in the file.

```typescript
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { SubjectPreference } from './recommendations.js';
```

**Fix:** Remove the unused import.

---

### AI-3: Orphaned file — `src/services/reviews.ts` never imported

`src/services/reviews.ts` exports `listDueReviews` but is never imported anywhere in production or test code. It appears to be leftover from before `chunk-queries.ts` provided `listChunks({ dueOnly: true })` which covers the same use case.

- `src/services/reviews.ts:1-9` — entire file is orphaned

**Fix:** Delete the file.

---

### AI-4: Scaffolding never wired up — `preference-filter.ts` standalone functions unused in production

`src/tools/preference-filter.ts` exports 9 functions (293 lines), but none are imported by any production code. Only its test file imports them. The `RecommendationEngine` class in `recommendation-engine.ts` has its own private implementations of `composeBalancedSession` and `generateIntelligentConstraints`, duplicating the standalone versions.

Functions exported but never imported in production:
- `filterBySubject` (line 18)
- `filterByTimeConstraints` (line 32)
- `filterByCognitiveLoad` (line 46)
- `estimateSessionDuration` (line 64)
- `filterByPrerequisites` (line 86)
- `prioritizeByUrgency` (line 103)
- `filterByLearningPatterns` (line 131)
- `composeBalancedSession` (line 159)
- `generateIntelligentConstraints` (line 210)
- `calculateSessionQuality` (line 240)

**Fix:** Either wire these into the recommendation engine (replacing the private methods) or delete them.

---

### AI-5: Dead code — `clearAllTables` references removed legacy tables

`src/db/client.ts:60-71` defines `clearAllTables()` which references tables that have been dropped (`friction_metrics`, `review_schedule`, `session_logs`, `performance_analytics`). These tables no longer exist after the migration in `migrate.ts:155-171`.

```typescript
export function clearAllTables(): void {
  const db = getDb();
  db.exec(`
    DELETE FROM friction_metrics;
    DELETE FROM review_schedule;
    ...
  `);
}
```

**Fix:** Update to reference only the current 4 tables (`session_chunks`, `learning_sessions`, `learning_chunks`, `learning_topics`) in correct cascade order.

---

### AI-6: Dead code — utility functions in `content-validation.ts` never called

`src/utils/content-validation.ts` exports 7 functions, but only `validateContentSize` is used (indirectly, as the file is only imported in its own test). The remaining functions are scaffolding that was never wired into any tool or service:

- `validateContentFormat` (line 66) — never called in production
- `sanitizeContent` (line 115) — never called in production
- `validateContent` (line 167) — never called in production
- `validateContentBatch` (line 203) — never called in production
- `isEducationalContent` (line 216) — never called in production
- `estimateReadingTime` (line 227) — never called in production

**Fix:** Remove uncalled functions or wire them into the content creation pipeline.

---

### AI-7: Dead code — `EDUCATIONAL_PATTERNS` constant in `content-validation.ts`

`src/utils/content-validation.ts:6-11` defines `EDUCATIONAL_PATTERNS` which is only used by the uncalled `isEducationalContent` function. This is dead code.

---

### AI-8: Legacy stale comment in `db/schema.ts`

`src/db/schema.ts:70` has a comment `// Legacy tables (to be removed in migration)` followed by no actual table definitions. The legacy tables have already been removed, but the comment remains as a ghost.

---

### AI-9: Stale `services/reviews.ts` duplicates existing `chunk-queries` functionality

`src/services/reviews.ts:5-8` provides `listDueReviews()` which is:
```typescript
db.select().from(learningChunks).where(lte(learningChunks.nextReviewAt, now)).all()
```

This is functionally equivalent to calling `listChunks({ dueOnly: true })` from `src/services/chunk-queries.ts:94`, which is the active, wired-up implementation.

---

### AI-10: `services/chunk-reviews.ts` comment suggests removed table

`src/services/chunk-reviews.ts:37` contains the comment:
```typescript
// Update chunk with new SM-2 values (single source of truth — no separate review_schedule table)
```

This is a historical note from a refactor. While accurate, it references a table that no longer exists in the schema. It reads as maintenance debt commentary.

---

## SUMMARY

| Category | Count | Severity |
|----------|-------|----------|
| DRY violations | 11 | Medium-High |
| SOLID violations | 5 | Medium |
| Complexity smells | 5 categories, 35+ long functions | Medium |
| AI-specific smells | 10 | Low-High |

### Highest-impact findings:

1. **DRY-7**: Three near-identical chunk update functions (~250 combined lines) — highest duplication by volume
2. **AI-4**: `preference-filter.ts` is 293 lines of scaffolding never wired into production
3. **DRY-2**: `extractErrorMessage` utility exists but is ignored 16+ times
4. **CPLX-5**: `session-management-tools.ts` is a 666-line single function
5. **SOLID-5**: Every service function is hard-coupled to the global DB singleton
6. **AI-5**: `clearAllTables` will fail at runtime due to referencing dropped tables
