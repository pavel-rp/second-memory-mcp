# T010 — Test suite reorganization (remaining spec items)

**Type:** feat
**Complexity:** L
**Depends on:** T009 (completed — helper extraction only)
**Created:** 2026-03-01 12:00

> This is an L-complexity item. Consider breaking into sub-tasks before executing.

---

## Description

PR #117 (T009) extracted shared test helpers and performed cosmetic file moves but did not implement the core structural reorganization. All 14 acceptance criteria from the spec (`docs/specs/test-suite-reorganization.md`) remain unmet:

- 10 DB-dependent tests still live in `tests/unit/server/`
- No independent test tiers (unit/integration/embedding)
- No per-tier npm scripts or vitest configs
- `vitest.setup.ts` still hard-requires `DATABASE_URL`
- CI still calls `pnpm test` instead of `test:ci`
- No quarantine mechanism
- No embedding tier
- Unit tests run with `fileParallelism: false`

This task implements everything the spec requires.

---

## Approach

Use **Vitest workspace projects** (inline in `vitest.config.ts` using `defineWorkspace` or separate config files) to create three tiers. Each tier gets its own config, setup file (or none), and npm script. The existing `vitest.config.ts` becomes a workspace root that composes the three projects.

Key decisions:
1. **Separate config files** (`vitest.unit.config.ts`, `vitest.integration.config.ts`, `vitest.embedding.config.ts`) rather than inline workspace — cleaner separation, each invocable standalone.
2. **Root `vitest.config.ts`** becomes a workspace that composes unit + integration (for `test:ci` and coverage merge).
3. **Unit tests calling `createAppContext()`** — the three files (analytics-tools, spaced-repetition-tools, tools-registration) will be modified to either pass `InMemoryEmbeddingAdapter` as override or mock the composition root, ensuring zero external deps.
4. **Quarantine** via `.quarantine.test.ts` file suffix — grep-able, reviewable in PRs.

---

## Relevant Files

**Must change:**
- `vitest.config.ts` — convert to workspace root composing unit + integration projects
- `vitest.setup.ts` — keep for integration/embedding only; unit tier must not load this
- `package.json` — add `test:unit`, `test:integration`, `test:embedding`, `test:ci`, `test:quarantine` scripts
- `.github/workflows/ci.yml` — switch to `test:ci`, add non-blocking `test:quarantine` step
- 10 files in `tests/unit/server/` — move to `tests/integration/server/`
- `tests/unit/server/analytics-tools.test.ts` — remove `createAppContext()` dependency
- `tests/unit/server/spaced-repetition-tools.test.ts` — remove `createAppContext()` dependency
- `tests/unit/server/tools-registration.test.ts` — remove `createAppContext()` dependency
- `tests/unit/server/create-learning-item.test.ts` — remove `createAppContext()` dependency

**Must create:**
- `vitest.unit.config.ts` — unit tier config (no setup file, `fileParallelism: true`)
- `vitest.integration.config.ts` — integration tier config (setup file, `fileParallelism: false`)
- `vitest.embedding.config.ts` — embedding tier config (setup file, `fileParallelism: false`)
- `tests/embedding/` — directory with at least one skeleton test
- Quarantine exclude globs in all configs

**May change:**
- `vitest.global-teardown.ts` — may need to be scoped to integration/embedding only
- `tests/integration/workflows/search-modes.test.ts` — currently uses `vi.fn()` mocks; may serve as template for embedding-tier counterpart

**Read-only context:**
- `docs/specs/test-suite-reorganization.md` — the source spec
- `src/composition-root.ts` — understand `createAppContext()` override mechanism
- `tests/helpers/in-memory/embedding-adapter.ts` — available for unit-tier use
- `tests/helpers/db-setup.ts` — understand what integration setup does
- `tests/performance/content-retrieval.test.ts` — must remain in integration tier

---

## Progress

- [x] STEP-001: Read affected files and confirm approach
- [x] STEP-002: Create per-tier vitest configs and convert root to workspace
- [x] STEP-003: Move 10 DB-dependent tests from `tests/unit/server/` to `tests/integration/server/`
- [x] STEP-004: Fix unit tests that call `createAppContext()` to have zero external deps
- [x] STEP-005: Create embedding tier skeleton
- [x] STEP-006: Add npm scripts and update `vitest.setup.ts`
- [x] STEP-007: Update CI pipeline (`ci.yml`)
- [x] STEP-008: Add quarantine mechanism
- [x] STEP-009: Run build/typecheck/tests — confirm no regressions
- [x] STEP-010: Commit — `feat(T010): test suite three-tier reorganization`

---

## Execution Plan

### - [x] STEP-001: Read affected files and confirm approach

> Implemented: Confirmed approach is sound. `create-learning-item.test.ts` does not exist — will skip. All other files match expected patterns.

**Goal:** Verify the planned approach is sound. Confirm Vitest 4.x workspace API supports the planned config structure. Check that no recent changes conflict.

**Files to read:**
- `vitest.config.ts`
- `vitest.setup.ts`
- `vitest.global-teardown.ts`
- `package.json` (scripts, vitest version)
- `.github/workflows/ci.yml`
- `src/composition-root.ts` (createAppContext signature and overrides)
- `tests/unit/server/analytics-tools.test.ts`
- `tests/unit/server/spaced-repetition-tools.test.ts`
- `tests/unit/server/tools-registration.test.ts`
- All 10 files being moved (imports only — confirm they all follow same pattern)

**Depends on:** —

---

### - [x] STEP-002: Create per-tier vitest configs and convert root to workspace

> Implemented: as planned. Root uses `projects` array (Vitest 4.x API). Standalone tier configs also created for independent invocation.

**Goal:** Establish three independently invocable test tiers with correct parallelism, setup files, and include/exclude globs. Coverage is configured on the workspace root to produce a single merged report.

**Changes:**

- Create `vitest.unit.config.ts`:
  - `include: ['tests/unit/**/*.test.ts']`
  - `exclude: ['**/*.quarantine.test.ts']`
  - `fileParallelism: true`
  - No `setupFiles`
  - No coverage (handled by workspace root)

- Create `vitest.integration.config.ts`:
  - `include: ['tests/integration/**/*.test.ts', 'tests/performance/**/*.test.ts']`
  - `exclude: ['**/*.quarantine.test.ts']`
  - `setupFiles: ['./vitest.setup.ts']`
  - `globalTeardown: ['./vitest.global-teardown.ts']`
  - `fileParallelism: false`

- Create `vitest.embedding.config.ts`:
  - `include: ['tests/embedding/**/*.test.ts']`
  - `exclude: ['**/*.quarantine.test.ts']`
  - `setupFiles: ['./vitest.setup.ts']` (needs DB too)
  - `fileParallelism: false`

- Update `vitest.config.ts` to use `defineWorkspace` composing unit + integration projects, with coverage thresholds on the merged report (statements ≥67%, branches ≥59%, lines ≥67%, functions ≥68%)

**Files:**
| File | Action |
|------|--------|
| `vitest.config.ts` | modify — workspace root |
| `vitest.unit.config.ts` | create |
| `vitest.integration.config.ts` | create |
| `vitest.embedding.config.ts` | create |

**Depends on:** STEP-001

---

### - [x] STEP-003: Move 10 DB-dependent tests to `tests/integration/server/`

> Implemented: as planned. No import path changes needed — same directory depth.

**Goal:** Correctly classify DB-dependent tests as integration tests. Fix relative import paths after the move.

**Changes:**

- Create `tests/integration/server/` directory
- Move the 10 files:
  - `chunk-tools.test.ts`
  - `content-tools.test.ts`
  - `persistence-tools.test.ts`
  - `query-tools.test.ts`
  - `search-tools.test.ts`
  - `session-lifecycle-tools.test.ts`
  - `session-management-tools.test.ts`
  - `session-progress-tools.test.ts`
  - `session-tools.test.ts`
  - `topic-tools.test.ts`
- Update relative import paths in each file (depth changes from `../../` / `../../../` to match new location)

**Files:**
| File | Action |
|------|--------|
| `tests/unit/server/*.test.ts` (10 files) | move to `tests/integration/server/` |

**Depends on:** STEP-002

---

### - [x] STEP-004: Fix unit tests that call `createAppContext()` to remove external deps

> Implemented: Created `tests/helpers/mock-app-context.ts` providing all pure domain functions with DB-dependent stubs. Updated 3 test files (create-learning-item.test.ts does not exist — skipped).

**Goal:** Ensure `tests/unit/server/analytics-tools.test.ts`, `spaced-repetition-tools.test.ts`, `tools-registration.test.ts`, and `create-learning-item.test.ts` can run without `DATABASE_URL` or any DB/embedding provider. These tests use `createAppContext()` only for tool registration scaffolding — the handlers themselves are pure functions.

**Changes:**

- Option A (preferred): Replace `createAppContext()` with a lightweight mock/stub that provides only what the registration functions need — no real DB adapters, no embedding initialization. Use the in-memory adapters from `tests/helpers/in-memory/` or construct a minimal mock context.
- Option B: If `createAppContext` accepts overrides, pass in-memory implementations for all ports so no real DB connection is attempted.
- Verify that after changes, these four files pass with `vitest --config vitest.unit.config.ts` and no `DATABASE_URL`.

**Files:**
| File | Action |
|------|--------|
| `tests/unit/server/analytics-tools.test.ts` | modify |
| `tests/unit/server/spaced-repetition-tools.test.ts` | modify |
| `tests/unit/server/tools-registration.test.ts` | modify |
| `tests/unit/server/create-learning-item.test.ts` | modify |

**Depends on:** STEP-002

---

### - [x] STEP-005: Create embedding tier with skeleton tests for all embedding-optional workflows

> Implemented: as planned. Three skeleton tests created with `describe.skipIf(!process.env.EMBEDDING_PROVIDER)` for graceful skip.

**Goal:** Establish the `tests/embedding/` directory with skeleton tests covering **every** workflow that has an optional embedding dependency (AC #8). The spec identifies three: `searchLearningContent`, `createChunkWithTopic`, `createTopicWithChunks`. Each must have a corresponding test in `tests/embedding/`.

**Changes:**

- Create `tests/embedding/` directory
- Create skeleton tests, each using `describe.skipIf(!process.env.EMBEDDING_PROVIDER)` for graceful skip when env vars are missing:
  1. `tests/embedding/search-with-embeddings.test.ts` — exercises `searchLearningContent` with semantic search via real provider
  2. `tests/embedding/chunk-creation-with-embeddings.test.ts` — exercises `createChunkWithTopic` with real embedding generation
  3. `tests/embedding/topic-creation-with-embeddings.test.ts` — exercises `createTopicWithChunks` with real embedding generation
- Each test imports `createAppContext` configured with a real embedding provider, requires `EMBEDDING_PROVIDER` + API key
- Verify the tier is independently invocable via `vitest run --config vitest.embedding.config.ts`

**Files:**
| File | Action |
|------|--------|
| `tests/embedding/search-with-embeddings.test.ts` | create |
| `tests/embedding/chunk-creation-with-embeddings.test.ts` | create |
| `tests/embedding/topic-creation-with-embeddings.test.ts` | create |

**Depends on:** STEP-002

---

### - [x] STEP-006: Add npm scripts and update `vitest.setup.ts`

> Implemented: as planned. Added test:unit, test:integration, test:embedding, test:ci, test:quarantine scripts. `vitest.setup.ts` unchanged — only referenced by integration/embedding configs.

**Goal:** Add all required npm scripts. Ensure `vitest.setup.ts` is only loaded by integration and embedding tiers.

**Changes:**

- Add to `package.json` scripts:
  - `"test:unit": "vitest run --config vitest.unit.config.ts"`
  - `"test:integration": "pnpm run build && vitest run --config vitest.integration.config.ts"`
  - `"test:embedding": "pnpm run build && vitest run --config vitest.embedding.config.ts"`
  - `"test:ci": "pnpm run build && vitest run --coverage"` (runs workspace root = unit + integration)
  - `"test:quarantine": "pnpm run build && vitest run --config vitest.quarantine.config.ts"` (or equivalent)
  - Update `"test"` to run all three tiers sequentially: `"pnpm run test:ci && pnpm run test:embedding"`. The workspace root (`test:ci`) already covers unit + integration with merged coverage. The embedding tier runs separately because it is excluded from the workspace root (no coverage contribution, different infra requirements). Quarantined tests are excluded from `test` — they only run via `test:quarantine`.
- `vitest.setup.ts` stays unchanged — it's only referenced by integration and embedding configs, not unit

**Files:**
| File | Action |
|------|--------|
| `package.json` | modify |

**Depends on:** STEP-002, STEP-005

---

### - [x] STEP-007: Update CI pipeline (`ci.yml`)

> Implemented: as planned. CI now calls `test:ci`, added non-blocking `test:quarantine` step with `continue-on-error: true`.

**Goal:** CI calls `test:ci` instead of `test`. Add non-blocking `test:quarantine` step.

**Changes:**

- Change `Run tests` step from `pnpm run test` to `pnpm run test:ci`
- Add a new step after tests: `Run quarantine tests` with `continue-on-error: true` calling `pnpm run test:quarantine`
- Verify no embedding env vars are set in CI (they shouldn't be — confirm `EMBEDDING_PROVIDER` is not in the workflow)

**Files:**
| File | Action |
|------|--------|
| `.github/workflows/ci.yml` | modify |

**Depends on:** STEP-006

---

### - [x] STEP-008: Add quarantine mechanism

> Implemented: as planned. Created `vitest.quarantine.config.ts` with two projects (unit-tier, DB-tier). Added sample quarantine test with issue link convention.

**Goal:** Implement the quarantine infrastructure so flaky tests can be isolated without deletion.

**Changes:**

- Define convention: quarantined tests use `.quarantine.test.ts` suffix
- Create `vitest.quarantine.config.ts` as a **workspace** composing two projects — one for unit-tier quarantined tests (no setup file, `include: ['tests/unit/**/*.quarantine.test.ts']`) and one for integration/embedding-tier quarantined tests (`setupFiles: ['./vitest.setup.ts']`, `include: ['tests/integration/**/*.quarantine.test.ts', 'tests/embedding/**/*.quarantine.test.ts', 'tests/performance/**/*.quarantine.test.ts']`). Both projects use `fileParallelism: false`. This ensures quarantined tests from different tiers get the correct infrastructure (DB setup vs. none).
- All tier configs already exclude `**/*.quarantine.test.ts` (from STEP-002)
- Add a sample quarantined test (can be a renamed copy of an existing test or a placeholder) with a comment referencing a GitHub issue, demonstrating the pattern
- Verify `pnpm test:quarantine` runs only quarantined tests

**Files:**
| File | Action |
|------|--------|
| `vitest.quarantine.config.ts` | create |

**Depends on:** STEP-006

---

### - [x] STEP-009: Run build/typecheck/tests — confirm no regressions

> Implemented: All checks pass. type-check clean, lint clean, test:unit 25 files/290 tests (no DATABASE_URL), test:integration 33 files/258 tests, test:ci 58 files/548 tests with merged coverage above thresholds, test:quarantine 1 file/1 test. Added lcov reporter to coverage config. No unit test imports DB deps, no integration test requires embedding vars.

**Goal:** Verify the complete reorganization works end-to-end.

**Commands:**
1. `pnpm run type-check` — TypeScript compiles
2. `pnpm run lint` — no lint errors
3. `pnpm run test:unit` — passes without `DATABASE_URL`
4. `pnpm run test:integration` — passes with `DATABASE_URL`
5. `pnpm run test:ci` — passes, produces `coverage/lcov.info`
6. `pnpm run test:quarantine` — runs (may have no tests yet, should exit clean)
7. Verify coverage thresholds are met (statements ≥67%, branches ≥59%, lines ≥67%, functions ≥68%)
8. Verify unit tier runs faster than full suite (parallelism enabled)

**Verification for AC #7 (no embedding env vars in integration tier):**
9. Grep `tests/integration/` for imports of `LangChainEmbeddingAdapter`, `EMBEDDING_PROVIDER`, `OPENAI_API_KEY`, `OLLAMA_BASE_URL`. If any test depends on these to pass, refactor it to use `InMemoryEmbeddingAdapter` or mocks instead.

**Verification for AC #8 (optional embedding workflow coverage):**
10. Grep `tests/integration/` for `searchLearningContent`, `createChunkWithTopic`, and `createTopicWithChunks` — each must appear in at least one test exercising the workflow without real embeddings. If any is missing, add a test.
11. Confirm all three embedding-tier skeletons exist in `tests/embedding/` (created in STEP-005): search, chunk creation, topic creation.

**Depends on:** STEP-008

---

### - [x] STEP-010: Commit

> Committed across 3 commits on feat/t010-test-suite-three-tier-reorganization branch.

**Goal:** Produce an atomic, traceable commit for this task.

**Message:** `feat(T010): test suite three-tier reorganization`

**Depends on:** STEP-009

---

## Done When

1. `pnpm test:unit` passes with no `DATABASE_URL` and no Postgres running.
2. `pnpm test:integration` passes with DB; no embedding env vars required.
3. `pnpm test:ci` runs unit + integration, produces merged coverage, exits zero.
4. No file under `tests/unit/` imports `setupTestDb` or requires `DATABASE_URL`.
5. `ci.yml` calls `test:ci` with a non-blocking `test:quarantine` step.
6. `tests/embedding/` has skeleton tests for all three embedding-optional workflows (search, chunk creation, topic creation).
6b. No file under `tests/integration/` requires `EMBEDDING_PROVIDER` or embedding API keys to pass.
7. Unit tier runs with `fileParallelism: true`.
8. All 14 acceptance criteria from `docs/specs/test-suite-reorganization.md` are met.

## Resolution Summary

Implemented three-tier test suite reorganization (unit/integration/embedding) using Vitest 4.x projects API. Created `vitest.unit.config.ts`, `vitest.integration.config.ts`, `vitest.embedding.config.ts` as standalone configs and converted root `vitest.config.ts` to a workspace composing unit + integration with merged coverage (including lcov reporter for Codecov). Moved 10 DB-dependent tests from `tests/unit/server/` to `tests/integration/server/` (no import path changes needed — same directory depth). Created `tests/helpers/mock-app-context.ts` to replace `createAppContext()` in 3 unit test files, eliminating their DATABASE_URL dependency. Created 3 embedding tier skeleton tests with `describe.skipIf(!process.env.EMBEDDING_PROVIDER)`. Added npm scripts: `test:unit`, `test:integration`, `test:embedding`, `test:ci`, `test:quarantine`. Updated CI to call `test:ci` with non-blocking `test:quarantine` step. Created quarantine infrastructure via `vitest.quarantine.config.ts` with `.quarantine.test.ts` naming convention. Deviation: `create-learning-item.test.ts` referenced in plan does not exist — skipped.
