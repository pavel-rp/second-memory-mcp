# Implementation Plan – Second Memory Learning MCP Server

This plan documents the current architecture of the Second Memory Learning MCP server and highlights the components that deliver an evidence-based learning experience. It focuses on the local-first SQLite implementation that powers the production system and serves as the reference for future enhancements.

## Product Vision

Second Memory Learning pairs Claude Desktop with a purpose-built MCP server so learners can:

- Generate scaffolded learning plans and chunked explanations.
- Schedule reviews using an enhanced SM-2 algorithm with leech handling and cognitive load balancing.
- Track structured sessions with persisted attempts, durations, and qualitative feedback.
- Operate entirely offline with auditable storage in SQLite.

## Learning Science Foundations

The system implements well-established learning principles:

1. **Spaced Repetition** – SM-2 derivatives improve long-term retention versus massed practice.[^1]
2. **Cognitive Load Management** – Content is delivered in 5–9 chunk scaffolds to stay within working-memory limits.[^2]
3. **Retrieval Practice** – Two-attempt policies and varied drill formats strengthen recall over passive review.[^3]
4. **Interleaving** – Recommendation logic blends new, review, and remediation items to avoid forgetting curves.[^4]

[^1]: Cepeda et al., "Spacing effects in learning", 2006.

[^2]: Sweller, "Cognitive Load Theory", 2010.

[^3]: Karpicke & Roediger, "The critical importance of retrieval practice", 2008.

[^4]: Rohrer, "Interleaving helps students distinguish among similar concepts", 2012.

## High-Level Architecture

```
Claude Desktop ──MCP──► src/server/main.ts ──► Tool Registrars (src/server/*.ts)
                                           │
                                           ├─► Prompt Pack (src/prompts/prompt-pack.ts)
                                           ├─► Services (src/services/*.ts)
                                           └─► Calculation Engines (src/tools/*.ts)
                                                │
                                                └─► SQLite Persistence (src/db/*)
```

### Core Modules

| Module                       | Responsibility                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| `src/server/main.ts`         | Bootstraps the MCP server, registers prompts, and ensures the SQLite schema exists.                     |
| `src/server/tools.ts`        | Aggregates tool registrars (spaced repetition, sessions, analytics, persistence, content).              |
| `src/services/`              | Business logic with transactional operations (topics, chunks, sessions, reviews, prerequisite mastery). |
| `src/tools/`                 | Pure computation engines (SM-2 calculations, recommendation engine, analytics helpers).                 |
| `src/db/`                    | SQLite client, Drizzle schema definitions, migrations, and utility helpers.                             |
| `src/prompts/prompt-pack.ts` | Template strings that power the MCP prompt endpoints.                                                   |
| `tests/`                     | Vitest suites covering integration flows and edge cases.                                                |

## Data Model & Persistence Strategy

SQLite is the source of truth. Tables are defined in `src/db/schema.ts` and mirrored by TypeScript models:

- **learning_topics** – Contains `title`, `subject`, optional `summary`, and timestamps.
- **learning_chunks** – Stores chunk metadata, estimated duration, SM-2 attributes (`easeFactor`, `repetitions`, `nextReviewAt`), plus optional content, tags, and prerequisites.
- **review_schedule** – Tracks interval progression for each chunk.
- **learning_sessions** – Persists session mode (`scaffolding`, `learning`, `retrieval`, `review`), timing, status, and optional feedback.
- **session_chunks** – Captures per-chunk session data (attempts, time spent, quality scores).

`src/db/migrate.ts` guarantees the schema exists, upgrades columns required for persisted content, and cleans up legacy tables (`session_logs`, `performance_analytics`, `friction_metrics`). It can also ingest seed data from JSON; see `docs/MIGRATION_GUIDE.md`.

## Service Layer Responsibilities

- **Topics (`src/services/topics.ts`)** – Fetch minimal topic data, batch lookup helpers, and metadata updates.
- **Topic Creation (`src/services/topic-creation.ts`)** – Validates input, creates a topic plus multiple chunks transactionally, and returns a learner-ready structure.
- **Chunks (`src/services/chunks.ts`)** – Handles CRUD operations, list transforms for recommendation inputs, and review result processing.
- **Reviews (`src/services/reviews.ts`)** – Applies SM-2 calculations to review events and updates schedules.
- **Sessions (`src/services/sessions.ts`)** – Manages the entire session lifecycle including automatic session chunk creation, progress aggregation, and completion metrics.
- **Prerequisite Mastery (`src/services/prerequisite-mastery.ts`)** – Scores learner readiness by analyzing prerequisite completion rates.

Each service uses Drizzle transactions via `src/db/operations.ts` to ensure atomic updates.

## Tool Surface Overview

### Spaced Repetition (`src/server/spaced-repetition-tools.ts`)

- `calculate_next_review` & `calculate_next_review_advanced` – SM-2 scheduling utilities.
- `calculate_priority_score` – Computes urgency using ease, repetitions, difficulty, and due date.
- `rank_candidates` – Orders learning items under time-box or tag constraints.
- `what_to_learn_today` – End-to-end recommendation generator with `fetchFromDatabase` mode.
- `guided_learning_conversation` – Conversational interface layered on the recommendation engine.

### Session Management (`src/server/session-management-tools.ts`)

- `create_session` – Initializes a session and, when `chunkIds` are provided, automatically seeds `session_chunks` rows.
- `create_session_chunk` – Updates chunk-level progress with structured attempts.
- `get_active_session`, `session_progress`, `session_completion`, `session_workflow`, `session_readiness` – Diagnostics and decision support.
- `complete_session` – Marks sessions finished and stores optional qualitative feedback.

### Analytics (`src/server/analytics-tools.ts`)

- `analyze_attempts` – Summarizes attempt history and provides follow-up suggestions.
- `analyze_trends` – Aggregates performance over time windows.
- `prerequisite_mastery` – Surfaces weak prerequisite chains to address.

### Persistence Utilities (`src/server/persistence-tools.ts`)

- `create_topic_with_chunks` – Primary content ingestion path for scaffolding outputs.
- `create_learning_item` – Lightweight helper to create a topic and chunk simultaneously.
- Update helpers (`update_topic`, `update_topic_summary`, `update_chunk`, `update_chunk_metadata`, `update_chunk_content`).
- Batch fetch tools (`batch_fetch_topics`, `batch_fetch_chunks`) for hydration.
- `list_learning_items` – Two-step fetch for manual item listing; for convenience, use `what_to_learn_today` with `fetchFromDatabase: true`.

## Prompt Pack

`src/prompts/prompt-pack.ts` contains ready-to-use prompt strings for MCP prompt registration:

- **Scaffolding** – Breaks complex problems into 5–9 chunks with prerequisites.
- **Learning** – Guides active exploration of a single chunk with drills and reflections.
- **Retrieval** – Enforces the two-attempt policy with targeted hints on failure.
- **Review** – Frames spaced review sessions with metacognitive coaching.
- **Workflow Guidance** – Reminds the assistant to fetch items, plan sessions, and log progress using the available tools.

These prompts can be called independently or paired with tool responses depending on the host client’s orchestration logic.

## Workflow Scenarios

### 1. Topic Onboarding

1. Claude generates a scaffolded plan.
2. Client calls `create_topic_with_chunks` to persist the plan.
3. Newly created chunks become eligible for recommendations immediately (initial `nextReviewAt` set to `Date.now()`).

### 2. Daily Study Planning

1. Client invokes `what_to_learn_today({ fetchFromDatabase: true, dueOnly: true, timeAvailable: 30 })`.
2. Recommendation engine fetches chunks via `listChunksAsLearningItems`, calculates priorities, and balances cognitive load.
3. The response includes `recommendations`, `sessionSummary`, `nextActions`, and `conversationGuidance` to drive follow-up prompts.

### 3. Session Execution

1. Create a session with `create_session` (optionally passing `chunkIds` for automatic chunk seeding).
2. Track progress with `create_session_chunk` and periodically call `session_progress` for analytics.
3. Run `session_completion` to determine when to stop; if `shouldComplete` is true, call `complete_session` and log feedback.
4. Post-session analytics can feed into future recommendation weighting.

## Quality & Testing Strategy

- **Vitest integration suites** in `tests/integration/` validate end-to-end flows (recommendations, prerequisite mastery, session lifecycle).
- **Service unit tests** cover edge cases for persistence and calculation logic.
- **Static analysis** uses ESLint and TypeScript strict typing; formatting is enforced through Prettier and lint-staged.
- **Database migrations** run as part of test setup to guarantee schema parity with production.

Before shipping new features:

1. Add or update tests reflecting the new workflow.
2. Run `pnpm run type-check`, `pnpm run lint`, and `pnpm test`.
3. Update relevant documentation sections (README, migration guide, tool docs).

## Roadmap Considerations

- Expand analytics with spaced repetition heatmaps once additional telemetry is captured.
- Introduce snapshot exports that mirror the JSON import format for easier backups.
- Extend prerequisite mastery to feed back into `what_to_learn_today` weighting heuristics.
- Explore optional encryption at rest for the SQLite database for privacy-sensitive deployments.
