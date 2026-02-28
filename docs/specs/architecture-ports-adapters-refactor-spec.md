# Architecture Refactor Spec — Second Memory MCP

> **Status:** Draft
> **Date:** 2026-02-28
> **Scope:** Full structural refactor — repository layer, ports/adapters, composition root, directory reorganization
> **Out of scope:** LangChain/semantic search implementation (architecture MUST accommodate it without breaking changes)

---

## 1. Problem Statement

The codebase has grown to ~57 source files, ~25 MCP tools, and 10 service modules. An earlier audit (audit/01-architecture.md) identified 20 architectural findings, 9 of which have been resolved. The remaining issues share a root cause: **the service layer conflates data access, business orchestration, and domain logic**, making it impossible to unit-test business rules without a live database and impossible to swap the data-access strategy (e.g., adding vector search) without rewriting orchestration code.

### Goals

1. **Testability** — Every layer of business logic MUST be testable with deterministic, in-memory substitutes. Zero I/O in unit tests.
2. **Separation of concerns** — Each module has exactly one reason to change.
3. **Future-proofing** — Adding a new data-access strategy (e.g., embedding-based search via pgvector/LangChain) MUST be achievable by implementing a new adapter behind an existing port, with zero modifications to orchestration or domain layers.
4. **Remain lightweight** — No application framework. The system continues to run as a direct `@modelcontextprotocol/sdk` STDIO process.

### Non-goals

- Migrating to NestJS or any application framework.
- Implementing semantic/vector search (architecture only accommodates it).
- Rewriting working algorithm code (`sr-calculator`, `dependency-resolver`, `content-similarity`).

---

## 2. Target Architecture

### 2.1 Layer Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        Transport Layer                           │
│   MCP SDK bootstrap, STDIO transport                             │
│   Concern: process lifecycle only                                │
├──────────────────────────────────────────────────────────────────┤
│                        Server Layer                              │
│   MCP tool registration, Zod input parsing, response formatting  │
│   Concern: protocol adaptation only                              │
├──────────────────────────────────────────────────────────────────┤
│                     Orchestration Layer                           │
│   Use-case workflows that compose domain logic + repository calls│
│   Concern: "what happens when" — sequencing, transactions        │
├──────────────────────────────────────────────────────────────────┤
│                       Domain Layer                                │
│   Pure computation: SR algorithm, dependency resolution,         │
│   recommendation engine, cognitive load, session analysis,       │
│   content similarity, prerequisite validation                    │
│   Concern: business rules — ZERO I/O, ZERO side effects         │
├──────────────────────────────────────────────────────────────────┤
│                        Ports Layer                                │
│   Interfaces (TypeScript types/interfaces) that define           │
│   data-access contracts                                          │
│   Concern: boundary definition only — no implementations         │
├──────────────────────────────────────────────────────────────────┤
│                       Adapters Layer                              │
│   Concrete implementations of ports: Drizzle/Postgres today,     │
│   pgvector/LangChain tomorrow, in-memory for tests               │
│   Concern: translating port contracts into storage technology    │
├──────────────────────────────────────────────────────────────────┤
│                     Infrastructure Layer                          │
│   Database client, connection pooling, migrations, logging       │
│   Concern: runtime plumbing — shared across adapters             │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2 Dependency Rule

Dependencies flow **strictly downward**. No layer may import from a layer above it. Lateral imports within a layer are permitted only where explicitly noted.

| Layer          | MAY import from                                  | MUST NOT import from             |
| -------------- | ------------------------------------------------ | -------------------------------- |
| Transport      | Server                                           | —                                |
| Server         | Orchestration, Domain (for type refs only)       | Adapters, Infrastructure         |
| Orchestration  | Domain, Ports                                    | Adapters, Infrastructure, Server |
| Domain         | Ports (interface types only), shared types/utils | Everything else                  |
| Ports          | Shared types only                                | Everything                       |
| Adapters       | Ports, Infrastructure, shared types              | Domain, Orchestration, Server    |
| Infrastructure | Nothing (leaf layer)                             | Everything                       |

**Critical constraint:** The Orchestration layer depends on **port interfaces**, never on adapter implementations. Adapter selection happens exclusively in the Composition Root (see §3).

### 2.3 Type-Only Import Enforcement

Cross-layer type references (e.g., Server importing domain types for Zod schema alignment) MUST use `import type` syntax. This is enforced at the compiler level, not by convention.

The project SHALL enable `verbatimModuleSyntax: true` in `tsconfig.json`. This makes `import type` vs `import` a compile error rather than a linting suggestion — a runtime import where only a type is needed will fail `tsc`.

Any cross-layer import that appears in the dependency rule table as "type refs only" MUST use `import type`. If a module needs both a type and a runtime value from a lower layer, it is a signal that the dependency relationship needs review.

### 2.4 Layer Responsibilities — Detailed

#### Transport Layer

- Bootstraps the MCP server and connects the STDIO transport.
- Invokes the Composition Root to obtain wired dependencies.
- Passes the composed context to the Server layer.
- Contains **no business logic, no tool registration, no database awareness**.

#### Server Layer

- Registers MCP tools and prompts against the `McpServer` instance.
- Parses raw input via Zod schemas.
- Delegates to the appropriate orchestration function.
- Formats the return value into the MCP `CallToolResult` envelope.
- Contains **no business logic, no data access, no direct service calls**.
- Every tool handler follows the same shape: `parse → delegate → format`.

#### Orchestration Layer

- Implements use-case workflows: "create topic with chunks", "process review result", "generate recommendations", "search learning content".
- Composes calls to domain functions and repository ports.
- Manages transactional boundaries (when a use case requires atomicity, the orchestrator requests it via a port method, not by importing a DB transaction helper).
- MAY call multiple ports and domain functions in a single workflow.
- Contains **no Drizzle imports, no SQL, no MCP formatting**.

#### Domain Layer

- Pure functions and classes with **no I/O, no side effects, no async** (with one exception: domain services that accept port interfaces as constructor dependencies MAY be async, but they MUST NOT perform I/O themselves — all I/O is delegated to the injected port).
- Includes: SR calculator, dependency resolver, prerequisite reference validator, recommendation engine, cognitive load calculator, session manager (progress/workflow/completion analysis), analytics computations, content similarity.
- All existing `src/algorithms/` and `src/tools/` modules that are already pure belong here.
- Domain types (e.g., `LearningItem`, `SessionInput`, `ServiceResult`) live here.

#### Ports Layer

- TypeScript interfaces only. Zero runtime code.
- Defines the contracts that the Orchestration layer programs against and that Adapters implement.
- Each port groups a cohesive set of data-access operations (see §4).

#### Adapters Layer

- One sub-directory per port implementation strategy (e.g., `drizzle/`, and in the future `pgvector/`, `in-memory/`).
- Each adapter module exports a class or factory that satisfies a port interface.
- Adapters MAY import from Infrastructure for database access.
- The `in-memory` adapter set exists exclusively for tests and is part of the test infrastructure, not the production source tree.

#### Infrastructure Layer

- Database client singleton management, connection pooling, Drizzle instance, migration runner, logger.
- Shared by all adapters but **never imported by Orchestration or Domain**.

---

## 3. Composition Root & Dependency Inversion

### 3.1 Architectural Decision: DI Approach

The system SHALL use a **manual composition root** — a single factory function that wires all dependencies and returns a fully typed application context object.

**Rationale:**

- The dependency graph has ~15–20 nodes. This is below the threshold where an auto-wiring container (awilix, tsyringe, NestJS) provides net value over explicit wiring.
- A manual root is zero-dep, fully type-safe at compile time, and trivially debuggable.
- If the graph grows beyond ~40 nodes or requires scope-per-request semantics, migrating to awilix is a mechanical refactor — the port interfaces don't change.

### 3.2 Composition Root Contract

The Composition Root SHALL:

- Be the **only module in the system that knows about concrete adapter classes**.
- Accept an optional overrides object for testing (partial substitution of any port).
- Return a frozen, typed context object that the Server layer receives.
- Be invoked exactly once, at startup, by the Transport layer.

### 3.3 Testing Composition

Tests SHALL construct their own context using in-memory adapters (or partial mocks) without touching the production Composition Root. This ensures:

- Unit tests for Orchestration inject in-memory ports — no DB, no pool, no migrations.
- Unit tests for Domain inject nothing — pure function calls.
- Integration tests use the production Composition Root pointed at a `_test` database.

---

## 4. Port Definitions

Each port is a TypeScript interface. The names below are logical — final naming follows project conventions.

### 4.1 ChunkRepository

Operations: create, get by ID, update, delete, get content, get with content, list (with filters: subject, due-only, limit, offset, include-content), batch fetch minimal metadata, find dependents by prerequisite ID.

### 4.2 TopicRepository

Operations: create, get by ID, get summary by ID, update metadata, update summary, delete, list, batch fetch minimal metadata.

### 4.3 SessionRepository

Operations: create session, get by ID, get active session, update, complete, delete, list (with status filter), create session chunk, get session chunks, update session chunk, batch create session chunks, get session with chunks, get historical feedback for chunk IDs, persist batch session chunk operations.

### 4.4 SearchPort

Operations:

- `searchByQuery(query: string, opts)` — text-based search (keyword/Levenshtein today).
- `searchByVector(vector: number[], opts)` — vector-similarity search against pre-stored embeddings. Accepts a **pre-computed** embedding vector, not raw text.

The split between `searchByQuery` and `searchByVector` is deliberate: it separates the **embedding computation** concern (an external API call) from the **similarity retrieval** concern (a database operation). This enables:

- **0-token CI:** Integration tests for the future semantic adapter seed the DB with pre-computed embeddings (generated once, stored as JSON fixtures), then call `searchByVector` directly. No embedding API calls in CI, ever.
- **Orchestration flexibility:** The orchestration layer decides whether to call an embedding service and then `searchByVector`, or just `searchByQuery`, or both with a merge step. That decision is orchestration logic, not adapter logic.

Today's keyword adapter implements `searchByQuery` and returns empty results from `searchByVector`. A future vector adapter implements both. A composite adapter delegates to both and merges/re-ranks.

### 4.5 ChunkIdLookupPort

Operations: get existing IDs by list, get all IDs.

Used exclusively by the `PrerequisiteReferenceValidator` domain class (already injected via constructor today).

### 4.6 PrerequisiteMasteryPort

Operations: check mastery status for chunk IDs.

Used by `PrerequisiteValidator` domain class.

### 4.7 ReviewPersistencePort

Operations: persist updated SR values for a chunk after review processing.

Keeps the `processReviewResult` orchestration function decoupled from Drizzle.

### 4.8 UnitOfWorkPort

Operations: execute a callback within an atomic transaction, providing **tx-scoped port instances** to the callback.

The callback receives a context object containing tx-bound versions of every repository port. All operations performed through these tx-bound ports participate in the same transaction. This prevents the bug where `withTx()` opens a transaction but repositories still query through the non-tx default connection.

```
unitOfWork.execute(async (txPorts) => {
  // txPorts.chunks, txPorts.topics, txPorts.sessions — all tx-bound
  // all reads and writes here share a single transaction
});
```

The production adapter wraps a Drizzle transaction and constructs tx-scoped adapter instances that use the transaction handle instead of the global pool. The in-memory test adapter runs the callback against the same in-memory stores (optionally with rollback-on-error semantics for error-path testing).

---

## 5. Directory Structure

```
src/
├── transport/              # Transport Layer
│   └── main.ts             # Bootstrap, STDIO, invokes composition root
│
├── server/                 # Server Layer
│   ├── tools/              # MCP tool registration modules (parse → delegate → format)
│   │   ├── analytics.ts
│   │   ├── chunks.ts
│   │   ├── content.ts
│   │   ├── persistence.ts
│   │   ├── query.ts
│   │   ├── search.ts
│   │   ├── session-lifecycle.ts
│   │   ├── session-management.ts
│   │   ├── session-progress.ts
│   │   ├── spaced-repetition.ts
│   │   └── topics.ts
│   ├── prompts/            # MCP prompt registration
│   ├── helpers.ts          # toolOk, toolError, toolJson — MCP response formatting
│   └── register.ts         # Wires all tool modules to McpServer
│
├── orchestration/          # Orchestration Layer
│   ├── chunk-workflows.ts        # create, update, delete chunk workflows
│   ├── topic-workflows.ts        # create topic with chunks, update summary
│   ├── review-workflows.ts       # process review result (SR calc + persist)
│   ├── session-workflows.ts      # create/complete session, batch operations
│   ├── recommendation-workflows.ts  # generate recommendations (composes domain + repos)
│   ├── search-workflows.ts       # search orchestration (delegates to SearchPort)
│   └── query-workflows.ts        # listing, batch fetch, content retrieval
│
├── domain/                 # Domain Layer — pure logic, zero I/O
│   ├── algorithms/
│   │   ├── sr-calculator.ts
│   │   ├── dependency-resolver.ts
│   │   └── content-similarity.ts
│   ├── services/
│   │   ├── recommendation-engine.ts
│   │   ├── prerequisite-validator.ts
│   │   ├── prerequisite-reference-validator.ts
│   │   ├── session-analyzer.ts       # progress, workflow phase, completion check
│   │   ├── cognitive-load.ts
│   │   └── analytics-calculator.ts
│   ├── types/              # All domain types, shared across layers
│   │   ├── learning-item.ts
│   │   ├── session.ts
│   │   ├── recommendations.ts
│   │   ├── analytics.ts
│   │   ├── service-result.ts
│   │   ├── search.ts
│   │   └── ...
│   └── config/
│       └── algorithm.ts
│
├── ports/                  # Ports Layer — interfaces only
│   ├── chunk-repository.ts
│   ├── topic-repository.ts
│   ├── session-repository.ts
│   ├── search-port.ts
│   ├── chunk-id-lookup-port.ts
│   ├── prerequisite-mastery-port.ts
│   ├── review-persistence-port.ts
│   └── unit-of-work-port.ts
│
├── adapters/               # Adapters Layer — concrete implementations
│   └── drizzle/
│       ├── chunk-repository.ts
│       ├── topic-repository.ts
│       ├── session-repository.ts
│       ├── search-adapter.ts
│       ├── chunk-id-lookup-adapter.ts
│       ├── prerequisite-mastery-adapter.ts
│       ├── review-persistence-adapter.ts
│       └── unit-of-work-adapter.ts
│
├── infrastructure/         # Infrastructure Layer
│   ├── db/
│   │   ├── client.ts       # Pool management, safety checks
│   │   ├── schema.ts       # Drizzle schema definitions
│   │   ├── migrate.ts      # Migration runner
│   │   └── operations.ts   # getSql(), withTx(), bulkInsert()
│   └── logger.ts
│
├── composition-root.ts     # Wires adapters → ports → orchestration → server
│
└── shared/                 # Cross-cutting utilities (zero domain logic)
    ├── errors.ts
    ├── math.ts
    ├── constants/
    │   ├── time.ts
    │   └── validation.ts
    └── prompts/
        └── prompt-pack.ts

tests/
├── unit/
│   ├── domain/             # Pure function tests — no mocks, no I/O
│   ├── orchestration/      # In-memory port substitutes — no DB
│   └── server/             # Verify parse → delegate → format (mock orchestration)
├── integration/
│   ├── adapters/           # Drizzle adapters against _test DB
│   └── workflows/          # Full stack with _test DB (existing integration tests)
├── helpers/
│   ├── in-memory/          # In-memory adapter implementations for testing
│   │   ├── chunk-repository.ts
│   │   ├── topic-repository.ts
│   │   ├── session-repository.ts
│   │   └── search-adapter.ts
│   ├── fixtures/           # Deterministic test data factories
│   └── db-setup.ts         # Test DB lifecycle (existing)
└── performance/            # Existing perf tests
```

---

## 6. Error Strategy

### 6.1 Architectural Decision: Unified Error Flow

All layers SHALL use the existing `ServiceResult<T>` pattern for operations that can fail. Exceptions are reserved for **programmer errors only** (invariant violations, assertion failures).

| Layer         | Error mechanism                                                             | Rationale                                               |
| ------------- | --------------------------------------------------------------------------- | ------------------------------------------------------- |
| Domain        | Returns `ServiceResult<T>` or throws on invariant violations                | Pure, composable, no try/catch needed by callers        |
| Ports         | Defined in terms of `ServiceResult<T>` return types                         | Adapters translate storage errors into `ServiceResult`  |
| Adapters      | Catches storage-specific exceptions, returns `ServiceResult`                | Isolates Drizzle/pg errors from upper layers            |
| Orchestration | Propagates `ServiceResult` from domain + ports, composes multi-step results | Never catches — early-returns on failure                |
| Server        | Translates `ServiceResult` into `toolOk()` / `toolError()` MCP envelopes    | Single mapping point between domain errors and protocol |

### 6.2 Remaining Audit Items Addressed

This error strategy resolves audit findings F8 (inconsistent error patterns), F9 (inconsistent service error strategies), F16 (repeated error extraction), and F17 (repeated MCP response formatting) — all of which stem from the current lack of a single error-flow convention.

---

## 7. Testing Strategy

### 7.1 Test Pyramid

```
         ╱  E2E (MCP protocol)  ╲         Rare, CI-only
        ╱ Integration (DB-backed) ╲        Per-adapter, per-workflow
       ╱   Orchestration (in-mem)   ╲      Per use-case, fast
      ╱      Domain (pure unit)       ╲    Per function, instant
     ╱─────────────────────────────────╲
```

### 7.2 Layer Testing Contracts

| Layer             | Test type   | Dependencies                            | Database? | Speed           |
| ----------------- | ----------- | --------------------------------------- | --------- | --------------- |
| Domain algorithms | Unit        | None                                    | No        | <1ms per test   |
| Domain services   | Unit        | In-memory ports (constructor injection) | No        | <5ms per test   |
| Orchestration     | Unit        | In-memory ports (from test helpers)     | No        | <10ms per test  |
| Server tools      | Unit        | Mock orchestration functions            | No        | <5ms per test   |
| Drizzle adapters  | Integration | Test Postgres (`_test` DB)              | Yes       | <100ms per test |
| Full workflows    | Integration | Production composition root + test DB   | Yes       | <200ms per test |

### 7.3 Future Search Testability (LangChain-Ready Seam)

The `SearchPort` interface is the designated seam, with `searchByQuery` and `searchByVector` as separate operations (see §4.4). When a vector-search adapter is added:

- The **adapter** is integration-tested against a pgvector-enabled test DB. Embeddings are pre-computed once, stored as JSON fixtures, and seeded into the test DB. Tests call `searchByVector(fixtureVector, opts)` directly — **zero embedding API calls in CI**.
- A **composite adapter** (merging keyword + vector results) is tested with two in-memory `SearchPort` stubs returning canned results. The merge/re-rank logic is pure domain and unit-tested independently.
- The **orchestration layer** decides when to call an external embedding service and routes the resulting vector to `searchByVector`. This decision logic is unit-tested with in-memory ports — no API calls, no DB.
- **Zero production code outside the new adapter and orchestration wiring needs modification.**

### 7.4 In-Memory Test Adapters

A set of in-memory adapter implementations SHALL exist in `tests/helpers/in-memory/`. These are **not** mocks or stubs — they are complete, behaviorally correct implementations of each port backed by plain arrays/maps. They support:

- Seeding with fixture data.
- Inspecting state after orchestration calls (assertion-friendly).
- Optional failure injection (simulating DB errors) for error-path testing.

---

## 8. Migration Plan

### Phasing Principles

- Each phase produces a **green CI** at completion.
- Each phase is **independently mergeable** — no phase depends on a future phase being complete.
- Existing tests continue to pass throughout — tests are migrated to the new structure incrementally, not rewritten.
- The audit progress tracker (audit/01-architecture.md) is updated at each phase boundary.

### Coverage Preservation Rule

Current coverage is near 100%. The refactor MUST NOT regress it.

**Phase 0 action:** Raise `vitest.config.ts` thresholds to match actual coverage before any structural changes begin. Specifically:

- `statements`, `lines`, `branches`, `functions` — all set to the current actual values (rounded down to the nearest integer).
- This makes the current coverage the CI-enforced floor. Any phase that drops below fails the build.

**Per-phase rule:** Every phase acceptance criteria includes "coverage thresholds unchanged or raised." If a phase moves code such that v8 coverage attribution shifts (e.g., a file rename breaks coverage mapping), the phase is responsible for restoring coverage before merge.

**New code rule:** Any new module introduced by the refactor (orchestration workflows, adapters, in-memory test implementations) MUST have corresponding tests that maintain the floor. Untested new code dilutes the percentage and fails the threshold.

---

### Phase 0 — Ports & Shared Types

**Goal:** Define all port interfaces and establish the shared type system without changing any runtime behavior.

**Acceptance criteria:**

- [ ] `vitest.config.ts` thresholds raised to match actual coverage (statements, lines, branches, functions — all at current actuals rounded down).
- [ ] All port interfaces from §4 exist in `src/ports/`.
- [ ] `ServiceResult<T>`, `serviceOk`, `serviceFail` are the canonical error types used by all port return types.
- [ ] Domain types (`LearningItem`, `SessionInput`, etc.) are relocated to `src/domain/types/`.
- [ ] `verbatimModuleSyntax: true` is enabled in `tsconfig.json`. All cross-layer type-only imports use `import type`.
- [ ] No runtime behavior changes. All existing tests pass.
- [ ] `tsc --noEmit` passes with the new directory structure.
- [ ] Coverage thresholds pass (CI-enforced).

---

### Phase 1 — Domain Extraction

**Goal:** Move all pure-computation modules into `src/domain/` and verify they have zero I/O dependencies.

**Acceptance criteria:**

- [ ] `src/domain/algorithms/` contains: `sr-calculator`, `dependency-resolver`, `content-similarity`.
- [ ] `src/domain/services/` contains: `recommendation-engine`, `prerequisite-validator`, `prerequisite-reference-validator`, `session-analyzer` (renamed from session-manager), `cognitive-load`, `analytics-calculator`.
- [ ] `src/domain/config/` contains: `algorithm.ts`.
- [ ] **Lint rule or CI check:** No file under `src/domain/` imports from `src/adapters/`, `src/infrastructure/`, `src/server/`, or `src/orchestration/`.
- [ ] All existing domain-level unit tests pass from their new locations.
- [ ] No runtime behavior changes.
- [ ] Coverage thresholds pass (CI-enforced).

---

### Phase 2 — Adapter Extraction

**Goal:** Extract Drizzle-specific data access from current service files into adapter classes that implement port interfaces.

**Acceptance criteria:**

- [ ] `src/adapters/drizzle/` contains one adapter per port defined in Phase 0.
- [ ] Each adapter class implements its corresponding port interface.
- [ ] Each adapter depends only on `src/infrastructure/` and `src/ports/`.
- [ ] **Lint rule or CI check:** No file under `src/adapters/` imports from `src/domain/`, `src/orchestration/`, or `src/server/`.
- [ ] Existing integration tests are redirected to test adapters directly against the `_test` database.
- [ ] No runtime behavior changes (old service files may still exist as thin wrappers during this phase).
- [ ] Coverage thresholds pass (CI-enforced).

---

### Phase 3 — Orchestration Extraction

**Goal:** Create orchestration modules that compose domain logic and port calls, replacing the current service layer's business-logic responsibilities.

**Acceptance criteria:**

- [ ] `src/orchestration/` contains workflow modules as defined in §5.
- [ ] Each orchestration function accepts port interfaces (injected), never concrete adapters.
- [ ] **Lint rule or CI check:** No file under `src/orchestration/` imports from `src/adapters/`, `src/infrastructure/`, or `src/server/`.
- [ ] New orchestration unit tests exist using in-memory port implementations — zero database dependency.
- [ ] No runtime behavior changes.
- [ ] Coverage thresholds pass (CI-enforced).

---

### Phase 4 — Composition Root & Server Rewire

**Goal:** Wire everything together. Server tools delegate to orchestration. The composition root assembles the dependency graph.

**Acceptance criteria:**

- [ ] `src/composition-root.ts` exists and is the sole module importing concrete adapter classes.
- [ ] `src/transport/main.ts` invokes the composition root and passes context to server registration.
- [ ] Server tool handlers follow the `parse → delegate → format` pattern with no direct domain or port calls.
- [ ] **Lint rule or CI check:** No file under `src/server/` imports from `src/adapters/` or `src/infrastructure/`.
- [ ] All existing tests pass (integration tests may use the composition root with test overrides).
- [ ] No runtime behavior changes.
- [ ] Coverage thresholds pass (CI-enforced).

---

### Phase 5 — Cleanup & Legacy Removal

**Goal:** Remove the old `src/services/` directory, old `src/tools/` directory (now `src/domain/services/`), and any transitional shims.

**Acceptance criteria:**

- [ ] `src/services/` directory no longer exists.
- [ ] Old `src/tools/` directory no longer exists (contents now in `src/domain/`).
- [ ] `src/server/shared-instances.ts` no longer exists (replaced by composition root).
- [ ] Test directory structure matches §5 (`tests/unit/`, `tests/integration/`, `tests/helpers/in-memory/`).
- [ ] In-memory test adapters exist for all ports.
- [ ] **Coverage:** Orchestration layer has full test coverage from unit tests (no DB). Overall project coverage thresholds unchanged or raised from Phase 0 baseline.
- [ ] Audit findings F8, F9, F12–F20 are resolved or explicitly tracked as closed.
- [ ] `README.md` documents the new architecture.
- [ ] CI is green.

---

## 9. Architectural Decisions Log

| ID     | Decision                                               | Status       | Rationale                                                                                                                                                                   |
| ------ | ------------------------------------------------------ | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ADR-01 | No application framework (no NestJS)                   | **Accepted** | ~25 tools, ~15 providers, STDIO transport. Framework overhead exceeds value at current scale. Revisit if tool count exceeds 50 or HTTP/SSE transport is added.              |
| ADR-02 | Manual composition root, no DI library                 | **Accepted** | Dependency graph has ~15–20 nodes. Explicit wiring is type-safe, zero-dep, and debuggable. Migrate to awilix if graph exceeds ~40 nodes.                                    |
| ADR-03 | `ServiceResult<T>` as universal error envelope         | **Accepted** | Already partially adopted. Extending to all layers eliminates the three inconsistent error patterns (audit F8, F9).                                                         |
| ADR-04 | `SearchPort` splits `searchByQuery` / `searchByVector` | **Accepted** | Separating embedding computation from similarity retrieval enables 0-token CI: test vector search with pre-computed fixture embeddings, no API calls.                       |
| ADR-05 | In-memory test adapters (not mocks/stubs)              | **Accepted** | Behavioral correctness over test doubles. Enables orchestration-layer unit tests that verify multi-step workflows without DB.                                               |
| ADR-06 | No changes to the MCP SDK integration pattern          | **Accepted** | Direct `server.registerTool()` remains the most stable and documented approach. Third-party NestJS-MCP wrappers are immature (<1 year, single maintainers).                 |
| ADR-07 | `UnitOfWorkPort` provides tx-scoped port instances     | **Accepted** | Passing a bare `tx` handle leaks DB internals and doesn't guarantee repos use it. Providing tx-bound port instances makes transactional consistency structural, not opt-in. |
| ADR-08 | `verbatimModuleSyntax: true` in tsconfig               | **Accepted** | Makes `import type` enforcement a compile error. Prevents accidental runtime cross-layer coupling where only type refs are intended.                                        |

---

## 10. Resolved Audit Findings Mapping

| Audit Finding                              | Resolved By Phase | Mechanism                                                                              |
| ------------------------------------------ | ----------------- | -------------------------------------------------------------------------------------- |
| F8 — Inconsistent error patterns           | Phase 4, 5        | Unified `ServiceResult → toolOk/toolError` mapping in Server layer                     |
| F9 — Inconsistent service error strategies | Phase 3           | All orchestration returns `ServiceResult<T>`                                           |
| F12 — Duplicate session schemas            | Phase 1           | Consolidated in `domain/types/session.ts`                                              |
| F13 — Thin wrapper mapping function        | Phase 2           | Single mapper with options in adapter                                                  |
| F14 — Single-use snake_case converter      | Phase 1           | Inlined or handled in type definitions                                                 |
| F15 — PrerequisiteValidator singleton      | Phase 1, 4        | Instantiated in composition root, not as module singleton                              |
| F16 — Repeated error extraction            | Phase 4           | Single `extractErrorMessage` in `shared/errors.ts` (already exists, now enforced)      |
| F17 — Repeated MCP response formatting     | Phase 4           | `toolOk`/`toolError`/`toolJson` in `server/helpers.ts` (already exists, now universal) |
| F18 — Duplicate JSON array parsing         | Phase 2           | Single implementation in adapter layer                                                 |
| F19 — Repeated column selection            | Phase 2           | Adapter-internal concern, consolidated per adapter                                     |
| F20 — Repeated clamping logic              | Phase 1           | `clamp()` in `shared/math.ts` (already exists, now enforced)                           |

---

## 11. Success Metrics

| Metric                                     | Current                                          | Target                                                    |
| ------------------------------------------ | ------------------------------------------------ | --------------------------------------------------------- |
| Coverage thresholds (vitest.config.ts)     | 80/80/—/85 (statements/lines/branches/functions) | Actual coverage locked as floor (near 100%)               |
| Unit test DB dependency                    | ~60% of test files need Postgres                 | ≤ integration + adapter tests only                        |
| Orchestration test speed                   | N/A (no isolated orchestration tests)            | <2s for full orchestration suite                          |
| Domain test speed                          | ~200ms                                           | <500ms (more tests, same speed characteristic)            |
| Lines touched to add a new search strategy | Entire `services/search.ts` + server tool        | One new adapter + orchestration wiring for embedding call |
| Import violations (layer boundary)         | Unchecked                                        | CI-enforced via lint rule or path restrictions            |
