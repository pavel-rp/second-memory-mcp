# Second Memory — Full Project Audit

> Generated: 2026-02-21
> Purpose: Pre-demo audit for job application (Riverty — Software Engineer, RAG, Knowledge Graphs & Agentic Systems)

## Scope

Seven dimensions audited:

1. MCP server architecture & design
2. Code cleanliness & smells
3. Architecture consistency & best practices
4. Test quality
5. _(Additional)_ Job-fit gap analysis — RAG / Knowledge Graphs / Agentic
6. _(Additional)_ Schema design
7. _(Additional)_ Documentation & developer experience

---

## 1. MCP Server Architecture & Design

**Grade: B+**

**Strengths:**

- Consistent tool-registration pattern (`server.registerTool` + Zod input validation + JSON text response)
- Correct stdio/stderr channel split — the JSON-RPC channel stays clean; logger routes to stderr in MCP mode
- Prompts registered as first-class MCP prompts (`server.registerPrompt`), not just tool wrappers — this is the right pattern
- `StdioServerTransport` is the appropriate transport for Claude Desktop integration
- Good tool categorisation across 7 focused files

**Issues:**

| ID  | Severity       | Location                             | Finding                                                                                                                                                                                                                                                                                                                |
| --- | -------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | ~~**High**~~   | `src/server/persistence-tools.ts:48` | ~~`list_learning_items_sqlite` is registered as a live tool but its own description reads "LEGACY two-step approach". A deprecated tool must not be on the active surface — it clutters discoverability and confuses LLM tool selection.~~ **DONE**                                                                    |
| A2  | ~~**High**~~   | `src/server/persistence-tools.ts:48` | ~~The tool name leaks the storage implementation (`…_sqlite`). If the storage layer changes, the API contract breaks. Tool names should be storage-agnostic (e.g. `list_learning_items`).~~ **DONE**                                                                                                                   |
| A3  | ~~**Medium**~~ | `src/server/main.ts:9–22`            | ~~Two local type definitions (`ChunkGenerationPromptArgs`, `ChunkManagementPromptArgs`) live at the top of `main.ts`. `main.ts` should only orchestrate; types belong in `src/types/`.~~ **DONE**                                                                                                                      |
| A4  | ~~**Medium**~~ | `src/server/persistence-tools.ts:79` | ~~`await import('../services/topic-creation.js')` is a **dynamic import inside the tool handler body**. This hides the dependency graph, delays module resolution to first invocation, and complicates static analysis. Should be a static top-level import.~~ **DONE**                                                |
| A5  | ~~**Low**~~    | `src/server/main.ts:25`              | ~~`ensureSchema()` is called without `await` inside an `async` function. Even if `better-sqlite3` is synchronous today, the missing `await` is misleading and fragile — if `ensureSchema` ever becomes truly async the bug becomes silent. Needs verification and either `await` or an explanatory comment.~~ **DONE** |

---

## 2. Code Cleanliness & Smells

**Grade: A-**

**Strengths:**

- `strict: true` TypeScript throughout; only ~17 `any` usages, all in test overrides or justified by SDK types
- Zero `console.*` outside the logger utility; logger auto-detects MCP mode and routes accordingly
- DRY across services — no significant copy-paste detected
- Pre-commit hooks (Husky + lint-staged) and CI enforce formatting/linting automatically
- Zod schemas defined once in `src/types/` and imported everywhere — no duplication of validation logic

**Issues:**

| ID  | Severity       | Location                             | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --- | -------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | ~~**Medium**~~ | `src/server/main.ts:9–22`            | ~~Same as A3 — inline type definitions are a smell in an orchestration file~~ **DONE**                                                                                                                                                                                                                                                                                                                                                                            |
| B2  | ~~**Medium**~~ | `src/server/persistence-tools.ts:79` | ~~Same as A4 — dynamic import is a code smell inside a handler~~ **DONE**                                                                                                                                                                                                                                                                                                                                                                                         |
| B3  | ~~**Low**~~    | `src/db/schema.ts:30,31,55,75,76`    | ~~Five columns store serialised JSON arrays as `TEXT` (`prerequisitesJson`, `tagsJson`, `chunkIds`, `attemptsJson`, `qualityScoresJson`). Pragmatically acceptable for SQLite, but there are no encode/decode helpers documented at the schema level. Confirm `db/operations.ts` has the wrappers and add a schema-level comment pointing to them.~~ **DONE** — Schema-level comments added pointing to `encodeJsonArray`/`decodeJsonArray` in `db/operations.ts` |

---

## 3. Architecture Consistency & Best Practices

**Grade: B**

**Strengths:**

- Clean three-tier layering: Server (MCP registration) → Services (business logic + persistence) → Tools (pure algorithms)
- All SM-2 algorithm parameters are environment-variable-driven — excellent for testability and tuning
- Transaction helpers centralised in `db/operations.ts`
- Local-first design is deliberate and consistent — no external SaaS dependencies

**Issues:**

| ID  | Severity       | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | ~~**High**~~   | ~~**`review_schedule` denormalises `learning_chunks`.** Both tables hold `nextReviewAt`, `intervalDays`, `repetitions`, and `easeFactor`. Any write path that updates one but not the other produces silently wrong scheduling. The invariant is not enforced by a transaction wrapper or a DB trigger. Fix: either (a) delete `review_schedule` and add an index on `learning_chunks.next_review_at`, or (b) create a documented, tested `syncReviewSchedule()` helper that guarantees atomic dual-write.~~ **DONE** — Option (a): `review_schedule` table removed; `intervalDays` consolidated into `learning_chunks`; index added on `next_review_at`; `listDueReviews` now queries `learning_chunks` directly |
| C2  | ~~**Medium**~~ | ~~**`chunkType`, `mode`, and `status` are unconstrained at the database level.** Drizzle defines them as `text` with inline string-literal comments, but SQLite enforces no `CHECK` constraint. An out-of-range value inserted via a raw query or future migration would silently corrupt domain logic. Add `CHECK` constraints or use Drizzle's `.enum()`.~~ **DONE** — CHECK constraints added to `ensureSchema()` for `chunk_type`, `mode`, and `status` columns across all tables                                                                                                                                                                                                                             |
| C3  | ~~**Medium**~~ | ~~**AGENTS.md documents the old 2-step SQLite workflow as the primary path.** The "SQLite Integration" section instructs contributors to call `list_learning_items_sqlite` first, then pass results to `what_to_learn_today` — but `fetchFromDatabase: true` is now the canonical single-call approach. This is misleading and perpetuates use of the LEGACY tool.~~ **DONE**                                                                                                                                                                                                                                                                                                                                     |
| C4  | ~~**Low**~~    | ~~README uses `fetchFromDatabase: true` correctly in its example, but AGENTS.md directly contradicts it. The two documents must be consistent.~~ **DONE**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

---

## 4. Test Quality

**Grade: A-**

**Strengths:**

- 32 test files, ~9 884 lines vs ~11 551 source lines (ratio ≈ 0.86) — excellent
- Each test run gets a UUID-named isolated SQLite file — zero cross-test pollution
- Good spread: unit (algorithm), service (CRUD), integration (full workflows), performance, and MCP protocol output validation
- `tests/integration/mcp-stdout-validation.test.ts` verifies the JSON-RPC output format — this is rare and impressive

**Issues:**

| ID  | Severity       | Finding                                                                                                                                                                                                                                                                         |
| --- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | ~~**Medium**~~ | ~~**No coverage thresholds configured.** CI uploads coverage to CodeCov but does not fail if it drops below any floor. An uncovered code path can be merged silently. Add minimum thresholds (`statements: 80, lines: 80, functions: 80`) to the vitest config in `package.json`.~~ **DONE** — Coverage thresholds added via `vitest.config.ts` (statements: 65, lines: 65, functions: 75) scoped to `src/`; baseline guards against regression, can be raised incrementally |
| D2  | ~~**Medium**~~ | ~~**`list_learning_items_sqlite` tests will become dead weight** if the tool is removed (see A1). They should be removed or repurposed when the tool is cleaned up.~~ **DONE** — Tool renamed to `list_learning_items`; tests remain valid                                      |
| D3  | ~~**Low**~~    | ~~`tests/performance/content-retrieval.test.ts` — verify it includes **assertion-based time budgets** (e.g. `expect(elapsed).toBeLessThan(100)`) rather than just "doesn't throw". Without a numeric assertion the test provides no performance regression protection.~~ **DONE** — Verified: all 4 test cases already include `toBeLessThan` assertions (1000ms, 2000ms, 1500ms, 1000ms) |

---

## 5. Job-Fit Gap Analysis

**Overall Grade: C** _(for the specific Riverty role)_

The role title is **RAG, Knowledge Graphs & Agentic Systems**. Current state per dimension:

### Agentic Systems — Grade: A

The MCP server with 30+ tools, session lifecycle management, prerequisite-aware recommendations, cognitive load balancing, and guided conversation is a legitimate agentic system. The integration with Claude Desktop via the MCP protocol is exactly the right pattern. This is the strongest dimension of the project.

### RAG (Retrieval-Augmented Generation) — Grade: D

The search implementation in `src/services/search.ts` uses **token splitting + Levenshtein distance** — this is fuzzy text matching, not RAG. There are no embeddings, no vector index, and no retrieval-augmentation step. The project stores and retrieves text but does not demonstrate the RAG pattern at any layer.

**Recommended fix (future):** Integrate a local embedding model (e.g. `@xenova/transformers` with `all-MiniLM-L6-v2`) to store chunk embeddings in SQLite and replace/augment the Levenshtein search with cosine similarity retrieval. This would directly and concretely demonstrate the RAG pattern.

### Knowledge Graphs — Grade: D

Prerequisites are stored as JSON arrays of chunk IDs. `dependency-resolver.ts` correctly implements topological sort over this structure, but a topological sort over a flat array is a **DAG**, not a knowledge graph. There are no typed entity nodes, no semantic edge types (REQUIRES, TEACHES, RELATED_TO), no graph query interface, and no graph database.

**Recommended fix (future):** Introduce a `KnowledgeGraph` class that models topics and chunks as typed nodes with typed, labelled edges. Expose a `get_knowledge_graph` MCP tool that returns an adjacency list or JSON-LD representation. The underlying data already exists; it just needs a graph-oriented API on top.

---

## 6. Schema Design

**Grade: B**

- Schema is clean and well-commented throughout
- Foreign keys with `ON DELETE CASCADE` correctly applied on all child tables
- Epoch-ms timestamps are consistent across all tables
- ~~`review_schedule` denormalisation (C1) is the main structural concern — potential data-consistency hazard~~ Resolved — table removed, data consolidated into `learning_chunks`
- ~~JSON-in-TEXT columns (B3) are pragmatic for SQLite but add invisible serialisation risk~~ Mitigated — schema-level comments now point to encode/decode helpers

---

## 7. Documentation & Developer Experience

**Grade: B+**

**Strengths:**

- README is well-structured: tool table, working code examples, architecture diagram
- AGENTS.md is thorough: algorithm config, formatting rules, workflow guidelines, MCP patterns
- `docs/MIGRATION_GUIDE.md` and `docs/Implementation_Plan.md` demonstrate planning discipline

**Issues:**

- ~~AGENTS.md §"SQLite Integration" is outdated — contradicts current canonical workflow (C3)~~ **DONE**
- No consolidated tool reference for the 30+ exposed tools (a `docs/tools-reference.md` would strengthen the demo for reviewers)
- ~~README Contributing section is minimal (3 bullet points) — could be expanded for a public-facing demo repo~~ **DONE** — Expanded with subsections for Getting Started, Development Workflow, Code Conventions, and Project Structure

---

## Summary Scorecard

| Dimension                 | Grade  | Primary Action Needed                                                    |
| ------------------------- | ------ | ------------------------------------------------------------------------ |
| MCP Architecture          | **B+** | ~~Remove/rename LEGACY tool; fix dynamic import~~ Done                   |
| Code Quality              | **A-** | ~~Move prompt arg types out of `main.ts`~~ Done                          |
| Architecture Consistency  | **B+** | ~~Resolve `review_schedule` denorm; add DB-level enum constraints~~ Done |
| Testing                   | **A-** | ~~Add coverage thresholds to CI~~ Done                                   |
| Job Fit — Agentic         | **A**  | Already strong — no changes needed                                       |
| Job Fit — RAG             | **D**  | Add embedding-based search (future scope)                                |
| Job Fit — Knowledge Graph | **D**  | Add typed graph layer (future scope)                                     |
| Schema Design             | **B+** | ~~Add `CHECK` constraints on enum-like columns~~ Done                    |
| Documentation             | **B+** | ~~Update AGENTS.md; add tools reference~~ AGENTS.md done; Contributing expanded; README references fixed |

---

## Prioritised Fix List

### Must Fix (before sharing as demo)

1. ~~**[A1/A2]** Remove `list_learning_items_sqlite` from the tool surface, or rename it to `list_learning_items` and remove the LEGACY label from its description~~ **DONE** — Renamed to `list_learning_items`, removed LEGACY description, updated all references
2. ~~**[C1]** Resolve `review_schedule` denormalisation — add index on `learning_chunks.next_review_at` and drop the table, or enforce atomic dual-write via a shared helper~~ **DONE** — `review_schedule` table removed; `intervalDays` consolidated into `learning_chunks`; index added on `next_review_at`
3. ~~**[A3/B1]** Move `ChunkGenerationPromptArgs` and `ChunkManagementPromptArgs` out of `main.ts` into `src/types/`~~ **DONE** — Moved to `src/types/prompts.ts`
4. ~~**[A4/B2]** Change dynamic `await import(…)` inside `persistence-tools.ts` to a static top-level import~~ **DONE** — All 7 dynamic imports converted to static top-level imports
5. ~~**[C3/C4]** Update AGENTS.md "SQLite Integration" section to reflect `fetchFromDatabase: true` as the canonical workflow~~ **DONE** — References updated to `list_learning_items` (storage-agnostic)

### Should Fix

6. ~~**[C2]** Add `CHECK` constraints (or Drizzle `.enum()`) on `chunkType`, `mode`, and `status` columns~~ **DONE** — CHECK constraints added to `ensureSchema()` SQL for all enum-like columns
7. ~~**[D1]** Add coverage thresholds to the vitest config~~ **DONE** — `vitest.config.ts` created with thresholds (statements: 65, lines: 65, functions: 75) scoped to `src/`
8. ~~**[A5]** Audit `ensureSchema()` — add `await` or add a comment explaining why it is intentionally sync~~ **DONE** — Added `await` to `ensureSchema()` call in `main.ts`

### Nice to Have

9. ~~**[D3]** Verify `tests/performance/content-retrieval.test.ts` has numeric `toBeLessThan` assertions~~ **DONE** — Verified: all 4 tests have numeric `toBeLessThan` assertions
10. ~~**[B3]** Add a schema-level comment on JSON-TEXT columns pointing to encode/decode helpers in `db/operations.ts`~~ **DONE** — Comments added to all JSON-TEXT columns in `schema.ts`
11. ~~Expand README Contributing section for a public-demo-ready repo~~ **DONE** — Expanded with Getting Started, Development Workflow, Code Conventions, and Project Structure subsections
