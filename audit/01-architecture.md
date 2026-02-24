# Architectural Consistency Audit — Second Memory Learning

> Generated: 2026-02-21
> Branch: `feature/audit-phase2`
> Scope: Layer violations, dependency direction, module boundaries, inconsistent patterns, phantom abstractions, missing abstractions
> **Last updated:** 2026-02-23

---

## Progress Overview

| Status    | Count  | Findings                                            |
| --------- | ------ | --------------------------------------------------- |
| DONE      | 9      | F1, F2, F3, F4, F5, F6, F7, F10, F11                |
| PLANNED   | 11     | F8, F9, F12, F13, F14, F15, F16, F17, F18, F19, F20 |
| **Total** | **20** | **9/20 complete (45%)**                             |

```
[===================>                          ] 45%
```

---

## Executive Summary

The codebase declares a clean three-tier architecture (Server → Services → Tools/Algorithms) with DB access restricted to the service layer. In practice, **multiple critical layer violations** exist: the server and tools layers both access the database directly, and the tools layer imports from services, inverting the declared dependency direction. Beyond structural violations, error handlingyep and response formatting are inconsistent across server tools, and several high-value abstractions are missing (the same error-extraction and MCP-response boilerplate is repeated 35+ times). No circular dependencies were detected.

**Findings: 6 critical, 6 major, 8 minor = 20 total**

---

## 1. Layer Violations

### F1 — Server layer directly accesses DB (`content-tools.ts`) [DONE]

| Field           | Value                                                                                                                                                                                        |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **File**        | `src/server/content-tools.ts` (lines 3–4, 111–125)                                                                                                                                           |
| **Severity**    | Critical                                                                                                                                                                                     |
| **Description** | The `get_topic_summary` tool handler imports `getSql` and `learningTopics` from the DB layer, then constructs and executes a Drizzle query inline. This bypasses the service layer entirely. |

**Imports:**

```typescript
import { getSql } from '../db/operations.js';
import { learningTopics } from '../db/schema.js';
```

**Inline query (lines 111–125):**

```typescript
const db = getSql();
const topicResult = db
  .select({
    id: learningTopics.id,
    title: learningTopics.title,
    subject: learningTopics.subject,
    summary: learningTopics.summary,
    // ...
  })
  .from(learningTopics)
  .where(eq(learningTopics.id, topicId))
  .get();
```

**Recommended fix:** Create `getTopicSummaryById()` in `src/services/topics.ts` and call it from the tool handler.

---

### F2 — Server layer directly calls DB migration (`main.ts`) [DONE]

| Field           | Value                                                                                                                                                                |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **File**        | `src/server/main.ts` (line 6)                                                                                                                                        |
| **Severity**    | Minor                                                                                                                                                                |
| **Description** | The bootstrap file imports `ensureSchema` directly from `../db/migrate.js`. While DB initialization at startup is necessary, it creates a direct server→DB coupling. |

**Recommended fix:** Wrap migration in an initialization service function (e.g., `initializeDatabase()` in a services or db init module) to keep the server layer decoupled from migration internals.

---

### F3 — Tools layer directly accesses DB (`session-manager.ts`) [DONE]

| Field           | Value                                                                                                                                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **File**        | `src/tools/session-manager.ts` (lines 13–14)                                                                                                                                                                            |
| **Severity**    | Critical                                                                                                                                                                                                                |
| **Description** | The session manager tool imports `withTx` (transaction helper) and `sessionChunks` schema from the DB layer. It executes database transactions directly, violating the "pure computation" principle of the tools layer. |

**Imports:**

```typescript
import { withTx } from '../db/operations.js';
import { sessionChunks, type SessionChunkRow } from '../db/schema.js';
```

**Recommended fix:** Move all DB operations from `session-manager.ts` into `src/services/sessions.ts` and have the tool call service functions instead.

---

### F4 — Tools layer directly accesses DB (`prerequisite-reference-validator.ts`) [DONE]

| Field           | Value                                                                                                                                                                                                                |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **File**        | `src/tools/prerequisite-reference-validator.ts` (lines 2–3)                                                                                                                                                          |
| **Severity**    | Critical                                                                                                                                                                                                             |
| **Description** | The prerequisite reference validator imports `getSql` and `learningChunks` from the DB layer. It queries the database for chunk IDs and caches them, acting as a data-access component rather than a pure validator. |

**Imports:**

```typescript
import { getSql } from '../db/operations.js';
import { learningChunks } from '../db/schema.js';
```

**Recommended fix:** Refactor the validator to accept chunk IDs as input (injected by a service), or move DB queries into a service that feeds the validator.

---

## 2. Dependency Direction Violations

### F5 — Tools layer imports from services (3 files) [DONE]

| Field           | Value                                                                                                                                                                                                           |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Files**       | `src/tools/recommendation-engine.ts` (line 5), `src/tools/prerequisite-validator.ts` (line 3), `src/tools/session-manager.ts` (line 11)                                                                         |
| **Severity**    | Major                                                                                                                                                                                                           |
| **Description** | The declared architecture positions tools as pure computation, receiving data as parameters. Instead, three tool modules import service functions to fetch data themselves, inverting the dependency direction. |

**Imports:**

```typescript
// recommendation-engine.ts
import { getChunk, mapChunkRowToLearningItem } from '../services/chunks.js';

// prerequisite-validator.ts
import { prerequisiteMasteryService } from '../services/prerequisite-mastery.js';

// session-manager.ts
import { getSessionWithChunks, validateChunkIds } from '../services/sessions.js';
```

**Recommended fix:** Restructure tool functions to accept all required data as parameters. The calling service (or server handler) should fetch data and pass it in.

---

### F6 — Services layer calls tools layer directly [DONE]

| Field           | Value                                                                                                                                                                                                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **File**        | `src/services/chunks.ts` (lines 10–12)                                                                                                                                                                                                                                 |
| **Severity**    | Major                                                                                                                                                                                                                                                                  |
| **Description** | The chunks service imports from three tool modules (`sr-calculator`, `prerequisite-reference-validator`, `dependency-resolver`). While services calling algorithms is arguably valid, it creates tight coupling and the charter positions tools as a downstream layer. |

**Imports:**

```typescript
import { calculateNextReviewAdvanced } from '../tools/sr-calculator.js';
import { prerequisiteReferenceValidator } from '../tools/prerequisite-reference-validator.js';
import { dependencyResolver } from '../tools/dependency-resolver.js';
```

**Recommended fix:** If tools are meant to be pure algorithms, services calling them is acceptable but should be made explicit in the architecture declaration. Alternatively, move these utilities into the services layer or a dedicated `utils/` layer.

---

## 3. Module Boundary Violations

### F7 — Chunks service is a God Service [DONE]

| Field           | Value                                                                                                                                                                                                                                                                        |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **File**        | `src/services/chunks.ts` (978 lines)                                                                                                                                                                                                                                         |
| **Severity**    | Major                                                                                                                                                                                                                                                                        |
| **Description** | The chunks service handles CRUD, SM-2 scheduling, prerequisite validation, content similarity, pagination, dependency resolution, and review processing. It reaches into session, spaced-repetition, and validation domains. At 978 lines it is 2× the next largest service. |

**Recommended fix:** Extract into focused modules:

- `services/chunk-reviews.ts` — review result processing + SM-2 scheduling
- `services/chunk-prerequisites.ts` — prerequisite validation orchestration
- `services/chunk-queries.ts` — pagination and filtering logic

---

## 4. Inconsistent Patterns

### F8 — Three different error handling patterns across server tools [PLANNED]

| Field           | Value                                                       |
| --------------- | ----------------------------------------------------------- |
| **Files**       | All `src/server/*.ts` tool modules                          |
| **Severity**    | Major                                                       |
| **Description** | Server tools use three incompatible error response formats: |

**Pattern A** — Simple error object (analytics-tools, search-tools):

```typescript
return { content: [{ type: 'text', text: JSON.stringify({ error: errorMsg }) }] };
```

**Pattern B** — Structured result with `success` boolean (persistence-tools, content-tools):

```typescript
return {
  content: [
    {
      type: 'text',
      text: JSON.stringify({
        success: false,
        error: { type: 'database', message: errorMsg, retryable: true },
        message: `Failed to create: ${errorMsg}`,
      }),
    },
  ],
};
```

**Pattern C** — Bug: `success: true` on error (content-tools `list_items_with_content`, line ~232):

```typescript
return {
  content: [
    {
      type: 'text',
      text: JSON.stringify({
        success: true, // BUG: should be false
        items: [],
        warning: `Failed to retrieve: ${errorMsg}`,
      }),
    },
  ],
};
```

**Recommended fix:** Standardize on Pattern B. Create `formatErrorResponse()` and `formatSuccessResponse()` helpers. Fix the `success: true` bug in `list_items_with_content`.

---

### F9 — Inconsistent service error strategies [PLANNED]

| Field           | Value                                                                                                                                                                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Files**       | `src/services/chunks.ts` vs `src/services/topics.ts`, `src/services/reviews.ts`                                                                                                                                                                |
| **Severity**    | Major                                                                                                                                                                                                                                          |
| **Description** | The chunks service returns typed result objects (`UpdateChunkContentResult` with `success`, `error` fields), while topics and reviews services throw errors directly or return raw counts. Callers must know which strategy each service uses. |

**Recommended fix:** Pick one strategy and apply it consistently. Typed result objects (chunks pattern) are more explicit and composable — adopt across all services.

---

### F10 — Inconsistent input validation [DONE]

| Field           | Value                                                                                                                                                                                           |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Files**       | `src/server/spaced-repetition-tools.ts` (lines 164–177)                                                                                                                                         |
| **Severity**    | Minor                                                                                                                                                                                           |
| **Description** | Most tools validate input via Zod schemas, but `spaced-repetition-tools.ts` adds manual mutual-exclusivity checks after Zod parsing. This validation should be a Zod `.refine()` on the schema. |

**Recommended fix:** Move the `fetchFromDatabase` / `learningItems` mutual-exclusivity check into the Zod schema as a `.refine()`.

---

### F11 — Three different DB query construction patterns [DONE]

| Field           | Value                                                                                                                                                                                               |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **File**        | `src/services/chunks.ts`                                                                                                                                                                            |
| **Severity**    | Minor                                                                                                                                                                                               |
| **Description** | The same service uses three different query styles: direct `.get()`, conditional filter building with manual `if` chains, and raw SQL template literals. This makes the service harder to maintain. |

**Recommended fix:** Standardize on Drizzle's query builder. Extract a `buildWhereClause()` helper for conditional filtering. Minimize raw SQL usage.

---

## 5. Phantom Abstractions

### F12 — Duplicate session analysis schemas [PLANNED]

| Field           | Value                                                                                                                                                                                                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **File**        | `src/server/session-tools.ts` (lines 18–32)                                                                                                                                                                                                                                                 |
| **Severity**    | Minor                                                                                                                                                                                                                                                                                       |
| **Description** | Two near-identical Zod schemas exist: `SessionAnalysisInputSchema` (with `.refine()`) and `SessionAnalysisInputShape` (without). The `Shape` variant exists solely because `.refine()` schemas can't be used with MCP `inputSchema`. Both are defined in the same file and used only there. |

**Recommended fix:** Use a single base schema and apply `.refine()` only where needed, or document why both are necessary.

---

### F13 — Thin wrapper mapping function [PLANNED]

| Field           | Value                                                                                                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **File**        | `src/services/chunks.ts` (lines ~128–170)                                                                                                                                                                    |
| **Severity**    | Minor                                                                                                                                                                                                        |
| **Description** | `mapChunkRowToLearningItemWithContent()` is a thin wrapper that calls `mapChunkRowToLearningItem()` and adds 3 optional fields. This could be a single function with an optional `includeContent` parameter. |

**Recommended fix:** Merge into a single mapping function, or use object spread at the call site.

---

### F14 — Single-use snake_case → camelCase converter [PLANNED]

| Field           | Value                                                                                                                                                      |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **File**        | `src/prompts/prompt-pack.ts` (lines 25–32)                                                                                                                 |
| **Severity**    | Minor                                                                                                                                                      |
| **Description** | `mapHistoricalFeedbackToPromptFeedback()` is a pure field-rename function (snake_case to camelCase) used exactly once. The mapping adds no business logic. |

**Recommended fix:** Inline the mapping at the call site, or handle naming in the type definitions.

---

### F15 — PrerequisiteValidator class as singleton [PLANNED]

| Field           | Value                                                                                                                                                                                                             |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **File**        | `src/tools/prerequisite-validator.ts`                                                                                                                                                                             |
| **Severity**    | Minor                                                                                                                                                                                                             |
| **Description** | The `PrerequisiteValidator` class is instantiated exactly once as a module-level singleton. Most methods are private. The class structure exists only to hold a `databaseAvailable` cache and a timeout constant. |

**Recommended fix:** Replace with a set of plain functions and a module-level cache variable.

---

## 6. Missing Abstractions

### F16 — Repeated error message extraction (35+ instances) [PLANNED]

| Field           | Value                                                                                                                                               |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Files**       | All `src/server/*.ts` modules                                                                                                                       |
| **Severity**    | Critical                                                                                                                                            |
| **Description** | The pattern `const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred'` is repeated 35+ times across server tool handlers. |

**Recommended fix:** Create a shared utility:

```typescript
// src/utils/errors.ts
export function extractErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error occurred';
}
```

---

### F17 — Repeated MCP response formatting (35+ instances) [PLANNED]

| Field           | Value                                                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Files**       | All `src/server/*.ts` modules                                                                                                               |
| **Severity**    | Critical                                                                                                                                    |
| **Description** | Every tool handler manually constructs `{ content: [{ type: 'text', text: JSON.stringify(result) }] }`. This boilerplate appears 35+ times. |

**Recommended fix:** Create a shared helper:

```typescript
// src/utils/mcp-response.ts
export function mcpResponse(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data) }] };
}
```

---

### F18 — Duplicated JSON array parsing [PLANNED]

| Field           | Value                                                                                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Files**       | `src/db/operations.ts` (`decodeJsonArray`) vs `src/services/topic-creation.ts` (`parseJsonArraySafely`)                                                   |
| **Severity**    | Major                                                                                                                                                     |
| **Description** | `topic-creation.ts` reimplements `decodeJsonArray` from `db/operations.ts` as `parseJsonArraySafely`. The only difference is an added `logger.warn` call. |

**Recommended fix:** Use the existing `decodeJsonArray` everywhere. Add optional logging at the call site if needed.

---

### F19 — Repeated column selection lists [PLANNED]

| Field           | Value                                                                                                                        |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **File**        | `src/services/chunks.ts` (lines ~72–95, ~537–558, and others)                                                                |
| **Severity**    | Minor                                                                                                                        |
| **Description** | The same 12+ column selection object for `learningChunks` is repeated across multiple query functions in the chunks service. |

**Recommended fix:** Define a shared column selection constant:

```typescript
const CHUNK_LIST_COLUMNS = {
  id: learningChunks.id,
  topicId: learningChunks.topicId,
  title: learningChunks.title,
  // ...
};
```

---

### F20 — Repeated clamping logic [PLANNED]

| Field           | Value                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| **Files**       | `src/tools/session-manager.ts` (`clampQuality`), `src/config/algorithm.ts` (`clampEaseFactor`)         |
| **Severity**    | Minor                                                                                                  |
| **Description** | Two separate clamping functions implement `Math.max(min, Math.min(max, value))` with different bounds. |

**Recommended fix:** Create a generic `clamp(value, min, max)` utility and use it in both locations.

---

## Summary

| Severity     | Count | Done | Remaining | Key Areas                                                                                                      |
| ------------ | ----- | ---- | --------- | -------------------------------------------------------------------------------------------------------------- |
| **Critical** | 6     | 3    | 3         | Layer violations (~~F1~~, ~~F3~~, ~~F4~~), missing abstractions (F8 bug, F16, F17)                             |
| **Major**    | 6     | 4    | 2         | Dependency inversion (~~F5~~, ~~F6~~), God Service (~~F7~~), inconsistent patterns (F8, F9), duplication (F18) |
| **Minor**    | 8     | 2    | 6         | Phantom abstractions (F12–F15), minor inconsistencies (~~F2~~, ~~F10~~, ~~F11~~), minor duplication (F19, F20) |

### Priority Order for Fixes

1. ~~**Fix the `success: true` bug** in `content-tools.ts` `list_items_with_content` error handler (F8 Pattern C)~~ — partially addressed by F1–F7 refactors; F8 plan covers remaining work
2. **Extract MCP response helpers** — `mcpResponse()` and `formatErrorResponse()` (F16, F17) — highest ROI, touches every tool
3. ~~**Move DB access out of tools layer** — `session-manager.ts` and `prerequisite-reference-validator.ts` (F3, F4)~~ DONE
4. ~~**Move DB access out of server layer** — `content-tools.ts` `get_topic_summary` (F1)~~ DONE
5. **Standardize error handling** across all server tools (F8, F9)
6. ~~**Break up chunks service** into focused modules (F7)~~ DONE
7. ~~**Resolve tools→services dependency** by passing data as parameters (F5)~~ DONE
8. **Clean up phantom abstractions and minor duplication** (F12–F15, F18–F20)

---

_This audit was generated by systematic codebase exploration. Status last updated 2026-02-23._
