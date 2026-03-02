# Domain Layer Purity Audit

> **Status:** Draft
> **Date:** 2026-03-02

This document lists discrete architectural violations found in `src/domain/` and `src/ports/`. Findings are ordered by significance and implementation order — later findings often depend on earlier ones being resolved first.

---

## Finding 1: Integration tests lack explicit embedding dependency

**Severity:** High — causes test failures and 5s+ latency on machines with `EMBEDDING_PROVIDER` set
**Depends on:** Nothing — immediate fix, no production code changes

**Location:** `tests/integration/workflows/chunks.test.ts` and any other test calling `createAppContext()` without overrides

**Problem:** Non-embedding integration tests call `createAppContext()` bare. The composition root creates a real `LangChainEmbeddingAdapter` when `EMBEDDING_PROVIDER` is in `process.env` (loaded via `vitest.setup.ts` → `dotenv/config` → `.env`). Tests that update chunk content trigger real OpenAI API calls.

**Fix:** Pass `{ embedding: undefined }` in every non-embedding test that calls `createAppContext()`. No production code changes.

**Success:** `pnpm test` produces identical results regardless of whether `.env` contains `EMBEDDING_PROVIDER`.

---

## Finding 2: Drizzle row types used as domain entities

**Severity:** High — the database schema is the de facto domain model
**Depends on:** Nothing — foundational, unblocks Findings 3 and 4

**Location:** 8 row types defined in `src/infrastructure/db/schema.ts` via Drizzle's `InferSelectModel`/`InferInsertModel`:

- Select types: `LearningChunkRow`, `LearningTopicRow`, `LearningSessionRow`, `SessionChunkRow`
- Insert types: `NewLearningChunkRow`, `NewLearningTopicRow`, `NewLearningSessionRow`, `NewSessionChunkRow`

Imported by **19 files** outside the definition site. Of these, 5 are in adapters/infrastructure (legitimate), leaving **16 violation sites** across every other layer:

| Layer            | Files                                                                                                                                     | Violation?      |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| Ports            | `chunk-repository.ts`, `topic-repository.ts`, `session-repository.ts`, `review-persistence-port.ts`                                       | Yes (4)         |
| Orchestration    | `chunk-workflows.ts`, `topic-workflows.ts`, `session-workflows.ts`, `query-workflows.ts`                                                  | Yes (4)         |
| Server           | `chunk-tools.ts`                                                                                                                          | Yes (1)         |
| Shared           | `chunk-mapping.ts`                                                                                                                        | Yes (1)         |
| Composition root | `composition-root.ts`                                                                                                                     | Yes (1)         |
| Tests            | `factories.ts`, `chunk-repository.ts`, `topic-repository.ts`, `session-repository.ts`, `review-persistence.ts`                            | Yes (5)         |
| Adapters         | `chunk-repository.ts`, `topic-repository.ts`, `session-repository.ts`, `review-persistence-adapter.ts`, `prerequisite-mastery-adapter.ts` | No (legitimate) |
| Infrastructure   | `migrate.ts`                                                                                                                              | No (legitimate) |

**Problem:** There are no domain entity types. Every layer — ports, orchestration, server, shared, composition root, tests — imports Drizzle-inferred row types from infrastructure. This means:

- The database schema defines what a "learning chunk" is, not the domain.
- Every consumer is structurally coupled to Drizzle's type system.
- Row types carry infrastructure concerns (e.g., `contentEmbedding: number[] | null`) that most consumers never touch.
- Findings 3 and 4 are direct consequences: there's no domain type to import instead.

**Fix:** Define domain entity types in `src/domain/types/` (`LearningChunk`, `LearningTopic`, `LearningSession`, `SessionChunk`). The Drizzle schema conforms to and reuses the domain types — the dependency arrow points from infrastructure to domain, not the reverse. Adapters map between Drizzle rows and domain entities where they diverge (e.g., omitting `contentEmbedding`).

**Success:** `grep -r "from.*infrastructure/db/schema" src/` matches only `src/adapters/` and `src/infrastructure/`.

---

## Finding 3: Port interfaces import from infrastructure

**Severity:** Medium — inverts the dependency direction
**Depends on:** Finding 2 (domain entity types must exist first)

**Location:**

- `src/ports/chunk-repository.ts` → imports from `src/infrastructure/db/schema.js`
- `src/ports/topic-repository.ts` → imports from `src/infrastructure/db/schema.js`
- `src/ports/session-repository.ts` → imports from `src/infrastructure/db/schema.js`
- `src/ports/review-persistence-port.ts` → imports from `src/infrastructure/db/schema.js`

**Problem:** Ports define contracts that adapters implement. The dependency arrow should point inward: infrastructure → ports → domain. Here, ports depend on infrastructure (Drizzle-inferred row types from the database schema). This couples every port consumer to Drizzle's type system.

**Fix:** Ports import domain entity types instead of Drizzle row types. Adapters map at the boundary.

**Success:** `grep -r "from.*infrastructure" src/ports/` returns zero matches.

---

## Finding 4: Domain config modules read `process.env` at import time

**Severity:** Medium — violates domain layer contract, caused Finding 1
**Depends on:** Nothing — independent of Findings 2-3

**Location:**

- `src/domain/config/algorithm.ts` — 40+ `SM_*` env var reads, exported as `algorithmConfig` constant
- `src/domain/config/embedding.ts` — `EMBEDDING_PROVIDER`, `OPENAI_API_KEY`, `EMBEDDING_*` env var reads, exported as `embeddingConfig` constant plus `VECTOR_SIMILARITY_THRESHOLD`, `HYBRID_*_WEIGHT`

**Problem:** The domain layer is defined as having zero I/O. These modules perform environment I/O at module evaluation time and bake the results into top-level constants. Config resolution (reading env vars, parsing, defaulting) is composition root responsibility.

**Fix:** Domain config modules export types and hardcoded defaults only. A config resolution function at the composition root level reads `process.env` and returns the typed config. Domain consumers receive config via parameter injection.

**Affected consumers:**

- `src/domain/algorithms/sr-calculator.ts`
- `src/domain/algorithms/dependency-resolver.ts`
- `src/domain/services/session-analyzer.ts`
- `src/domain/services/prerequisite-validator.ts`

**Success:** `grep -r "process.env" src/domain/` returns zero matches.

---

## Finding 5: Domain code calls `new Date()` / `Date.now()`

**Severity:** Medium — makes pure functions non-deterministic
**Depends on:** Nothing — independent

**Location:**

- `src/domain/algorithms/sr-calculator.ts:67,78,157,173` — `new Date()` inside calculation functions
- `src/domain/services/recommendation-engine.ts:248,250` — `new Date()` for overdue filtering
- `src/domain/services/session-analyzer.ts:16,28,365` — `new Date()` for time resolution
- `src/domain/services/prerequisite-validator.ts:59` — `Date.now()` for cache timing
- `src/domain/services/prerequisite-reference-validator.ts:106,140,162` — `Date.now()` for cache expiry

**Problem:** Functions that should be pure (same inputs → same outputs) silently depend on wall clock time. Tests can't control time without mocking globals.

**Fix:** Functions receive `now` (or equivalent) as a parameter. Callers provide it.

**Success:** `grep -rE "new Date\(\)|Date\.now\(\)" src/domain/` returns zero matches.

---

## Finding 6: Domain service sniffs test environment

**Severity:** Low — hack that masks a deeper design issue
**Depends on:** Finding 4 (removing `process.env` from domain eliminates this naturally)

**Location:** `src/domain/services/prerequisite-validator.ts:79-80`

**Problem:** Domain code checks `process.env.NODE_ENV === 'test'` and `process.env.VITEST` to change behavior during tests. Domain should be environment-unaware; the underlying issue (database availability detection) should be handled through the port abstraction.

**Fix:** Remove the env check. If the port is unavailable, the port should communicate that — not the domain service inspecting which runtime it's in.

**Success:** No `NODE_ENV` or `VITEST` references in `src/domain/`.

---

## Finding 7: Domain service uses `setTimeout`

**Severity:** Low — side effect in the domain layer
**Depends on:** Nothing — independent, but naturally resolved alongside Findings 4-6 since the same file is affected

**Location:** `src/domain/services/prerequisite-validator.ts:101`

**Problem:** A timeout wrapper around a database query lives in a domain service. Timeout management is an infrastructure or orchestration concern.

**Fix:** Move the timeout to the adapter or orchestration layer. The domain service calls the port; the port implementation decides its own timeout policy.

**Success:** No `setTimeout` / `setInterval` in `src/domain/`.

---

## Enforcement

After all findings are resolved, add ESLint overrides to prevent regression:

```js
// Scoped to src/domain/**/*.ts
{
  'no-restricted-globals': ['error',
    { name: 'process', message: 'Domain must not access process. Receive config via injection.' },
    { name: 'Date', message: 'Domain must receive time as a parameter.' },
    { name: 'setTimeout', message: 'Timeout management belongs in infrastructure.' },
    { name: 'setInterval', message: 'Timer management belongs in infrastructure.' },
  ]
}
```

```js
// Scoped to src/ports/**/*.ts
{
  'no-restricted-imports': ['error', {
    patterns: [{ group: ['**/infrastructure/**'], message: 'Ports must not import from infrastructure.' }]
  }]
}
```

```js
// Scoped to src/orchestration/**/*.ts and src/server/**/*.ts
{
  'no-restricted-imports': ['error', {
    patterns: [{ group: ['**/infrastructure/db/schema**'], message: 'Import domain entity types, not Drizzle row types.' }]
  }]
}
```
