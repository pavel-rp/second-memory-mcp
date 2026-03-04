[![codecov](https://codecov.io/gh/pavel-rp/second-memory-mcp/branch/develop/graph/badge.svg)](https://codecov.io/gh/pavel-rp/second-memory-mcp)
[![CI](https://github.com/pavel-rp/second-memory-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/pavel-rp/second-memory-mcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

# Second Memory Learning

An MCP server that turns any compatible AI client into a full learning assistant — backed by a knowledge graph of prerequisites, hybrid retrieval over pgvector embeddings, and multi-step agentic workflows that orchestrate spaced repetition sessions with no required external SaaS — embedding providers are optional and pluggable.

## Key Capabilities

- **Knowledge graph & prerequisite resolution** – Learning items form a directed graph of prerequisite relationships. `DependencyResolver` performs topological sorting, cycle detection, and transitive dependency resolution so the recommendation engine can sequence material in the right order (`src/domain/algorithms/dependency-resolver.ts`).
- **Hybrid retrieval pipeline** – Three search modes — keyword (title + content text matching), semantic (cosine similarity over pgvector embeddings), and hybrid (weighted linear combination of normalized keyword + semantic scores). Embedding vectors are stored alongside content in Postgres with HNSW indexes for sub-linear lookups (`src/orchestration/search-workflows.ts`, `src/adapters/drizzle/search-adapter.ts`).
- **Agentic session orchestration** – Multi-step learning workflows where the AI client creates sessions, walks through chunks, records review quality, and decides when to complete — all driven through MCP tool calls that maintain session state across turns (`src/orchestration/session-workflows.ts`).
- **Context-aware recommendations** – `what_to_learn_today` fetches items from the database, applies prerequisite filtering via the knowledge graph, balances new vs. review work using cognitive load caps, and produces ranked suggestions with conversational guidance (`src/domain/services/recommendation-engine.ts`).
- **Prompt engineering surface** – Seven MCP prompt templates (scaffolding, learning, retrieval, review, workflow guidance, chunk generation, chunk management) that give the connected AI client structured context for each phase of a session (`src/shared/prompts/prompt-pack.ts`).
- **Evidence-based scheduling** – Enhanced SM-2 algorithm with lapse handling, cognitive load modeling, and candidate ranking (`src/domain/algorithms/sr-calculator.ts`).

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm

### Installation & Build

```bash
# Clone and install dependencies
git clone https://github.com/pavel-rp/second-memory-mcp.git
cd second-memory-mcp
pnpm install

# Type-check and compile TypeScript to dist/
pnpm run build
```

### Running the MCP Server

```bash
# Run the already-built server
pnpm run start

# Or build and run in a single step
pnpm run start:pnpm

# Launch in stdio mode (for Claude Desktop integration / debugging)
pnpm run start:stdio
```

### Database Setup

The server requires a Postgres database with the [pgvector](https://github.com/pgvector/pgvector) extension. The easiest way to get one running locally is with Docker Compose:

```bash
# Start Postgres (pgvector/pgvector:pg16, matches CI)
docker compose up -d

# Configure environment variables (DATABASE_URL is pre-filled for Docker)
cp .env.example .env

# Apply schema migrations and optional seed import
pnpm run db:migrate
```

If you prefer to manage Postgres yourself, set the connection string manually:

```bash
export DATABASE_URL=postgresql://user:pass@localhost:5432/second_memory
pnpm run db:migrate
```

See [`.env.example`](.env.example) for the full list of configurable environment variables with documented defaults.

To inspect the database visually, start Drizzle Studio:

```bash
pnpm run db:studio
```

### Claude Desktop Integration

Add the following to your `claude_desktop_config.json` to register the MCP server:

```json
{
  "mcpServers": {
    "second-memory": {
      "command": "node",
      "args": ["<path-to-project>/dist/transport/main.js"],
      "env": {
        "DATABASE_URL": "postgresql://postgres:postgres@localhost:5432/second_memory"
      }
    }
  }
}
```

Replace `<path-to-project>` with the absolute path to your cloned repository. Build with `pnpm run build` before first use.

## Using the MCP Tools

The server registers tools across eight categories:

| Category           | Tool                                                                                                                                                                                                                                                           | Purpose                                                                                             |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Search             | `search_learning_content`                                                                                                                                                                                                                                      | Keyword, semantic, or hybrid search over topics and chunks (pgvector cosine similarity, HNSW index) |
| Recommendations    | `what_to_learn_today`, `guided_learning_conversation`                                                                                                                                                                                                          | Graph-aware recommendation engine with conversational guidance                                      |
| Session management | `create_session`, `create_session_chunk`, `get_active_session`, `get_session`, `complete_session`, `batch_update_session_chunks`, `get_historical_feedback`                                                                                                    | Multi-step session lifecycle with automatic chunk initialization                                    |
| Session analytics  | `session_progress`, `session_completion`, `session_workflow`                                                                                                                                                                                                   | Track session health and decision points                                                            |
| Spaced repetition  | `calculate_next_review`, `calculate_next_review_advanced`, `calculate_priority_score`, `rank_candidates`, `record_review_result`                                                                                                                               | SM-2 scheduling, priority scoring, and review recording                                             |
| Persistence        | `create_topic_with_chunks`, `create_learning_item`, `update_topic`, `update_topic_summary`, `update_chunk`, `update_chunk_content`, `update_chunk_metadata`, `delete_chunk`, `batch_fetch_topics_minimal`, `batch_fetch_chunks_minimal`, `list_learning_items` | CRUD for topics and chunks with prerequisite graph edges                                            |
| Content            | `get_chunk_content`, `get_topic_summary`, `list_items_with_content`                                                                                                                                                                                            | Retrieve chunk content, topic summaries, and paginated item listings                                |
| Analytics          | `analytics_daily`, `analytics_window`                                                                                                                                                                                                                          | Daily KPIs and date-range analytics with optional breakdowns                                        |

### Example: AI-Guided Learning Session

The examples below show how an AI agent orchestrates a learning session through MCP tool calls. Each step is a tool invocation with JSON parameters — the agent decides what to call based on the user's goals and prior results.

**1. Get today's recommendations**

The user says: _"I have 30 minutes to study math."_

The agent calls `what_to_learn_today`:

```json
{
  "fetch_from_database": true,
  "subject_filter": "Math",
  "due_only": true,
  "time_available": 30
}
```

The server responds with prioritized items, prerequisite-resolved ordering, and session guidance:

```jsonc
{
  "recommendations": [
    {
      "item": { "id": "chunk-123", "title": "Matrix multiplication" /* ... */ },
      "priority": 0.94,
      "reason": "overdue",
    },
    {
      "item": { "id": "chunk-456", "title": "Determinants" /* ... */ },
      "priority": 0.81,
      "reason": "optimal timing",
    },
  ],
  "estimated_duration": 28,
  "session_summary": { "new_items": 0, "review_items": 2, "remediation_items": 0 },
  "next_actions": ["Start a review session with these items"],
}
```

**2. Start a session**

The agent creates a session scoped to the recommended chunks:

```json
{
  "topic_id": "math-linear-algebra",
  "chunk_ids": ["chunk-123", "chunk-456"],
  "mode": "review",
  "estimated_duration": 30
}
```

The server returns:

```json
{
  "session_id": "ses-abc-123",
  "status": "created",
  "message": "Review session created with 2 chunks."
}
```

**3. Work through chunks**

The agent presents material, quizzes the user, and records each result. After the user successfully recalls matrix multiplication:

```json
{
  "session_id": "ses-abc-123",
  "chunk_id": "chunk-123",
  "status": "completed",
  "attempts": [
    { "timestamp": 1709550000000, "completed": true, "quality": 4, "time_spent_ms": 480000 }
  ],
  "quality_scores": [4],
  "time_spent_ms": 480000
}
```

For multiple chunks at once, the agent can use `batch_update_session_chunks`:

```json
{
  "session_id": "ses-abc-123",
  "operations": [
    {
      "chunk_id": "chunk-123",
      "status": "completed",
      "quality_scores": [4],
      "time_spent_ms": 480000
    },
    {
      "chunk_id": "chunk-456",
      "status": "completed",
      "quality_scores": [3],
      "time_spent_ms": 360000
    }
  ]
}
```

**4. Check completion**

The agent calls `session_completion` to decide whether to continue or wrap up:

```json
{ "session_id": "ses-abc-123" }
```

```json
{
  "is_complete": true,
  "completion_reason": "All chunks completed with sufficient quality",
  "quality_threshold_met": true,
  "time_threshold_met": true,
  "chunk_threshold_met": true,
  "recommendation": "complete"
}
```

**5. Complete the session**

Since `recommendation` is `"complete"`, the agent finishes the session:

```json
{
  "session_id": "ses-abc-123",
  "feedback": "User recalled both matrix topics fluently."
}
```

**6. Persist spaced repetition data**

The agent calls `record_review_result` for each chunk to update the SM-2 scheduling:

```json
{ "item_id": "chunk-123", "quality": 4, "time_spent_ms": 480000 }
```

This updates the chunk's `ease_factor`, `interval`, and `next_review_date` so it appears at the right time in future sessions.

## Architecture Overview

The codebase follows a **ports-and-adapters (hexagonal) architecture** with strict layer dependencies:

```
src/
├── transport/          # MCP SDK bootstrap, STDIO transport (process lifecycle only)
├── server/             # MCP tool registration — parse → delegate → format
├── orchestration/      # Use-case workflows composing domain logic + port calls
├── domain/             # Pure computation — zero I/O
│   ├── algorithms/     # SR calculator, dependency resolver, content similarity
│   ├── services/       # Recommendation engine, prerequisite validator, analytics
│   ├── types/          # Shared type definitions
│   └── config/         # Algorithm configuration
├── ports/              # Interface definitions (8 port interfaces)
├── adapters/
│   ├── drizzle/        # PostgreSQL implementations (search, persistence, sessions)
│   └── langchain/      # LangChain embedding adapter (pluggable provider)
├── infrastructure/     # Database client, schema, migrations, logger
├── shared/             # Cross-cutting utilities, constants, prompts
└── composition-root.ts # Wires adapters → ports → orchestration → server
```

**Layer dependency rule:** Each layer depends only on layers below it. Domain has zero I/O imports. Orchestration depends on ports (interfaces), never adapters. Only the composition root imports concrete adapter classes.

The domain layer contains the core intelligence: a **knowledge graph** built from prerequisite relationships (`DependencyResolver` — topological sort, cycle detection, transitive resolution), a **recommendation engine** that traverses the graph to sequence learning items by priority and cognitive load, and a **prerequisite validator** that gates progression on demonstrated mastery.

The retrieval pipeline supports three modes — keyword search via case-insensitive token matching, semantic search via pgvector cosine similarity with HNSW indexing, and hybrid search that merges both using a configurable weighted linear combination of normalized scores.

Key entry points:

- `src/transport/main.ts` – Boots the MCP server, initializes the database, and invokes the composition root.
- `src/composition-root.ts` – The sole module importing concrete adapter classes; assembles the full dependency graph.
- `src/server/tools.ts` – Wires up all tool registrars with the pre-wired AppContext.

```
tests/
├── unit/
│   ├── domain/         # Pure function tests — no mocks, no I/O
│   ├── orchestration/  # In-memory port substitutes, no DB
│   └── server/         # Verify parse → delegate → format
├── integration/
│   ├── db/             # Database client, schema, migration tests
│   └── workflows/      # Full stack with _test DB
├── helpers/            # In-memory adapters, fixtures, DB setup
└── performance/        # Performance benchmarks
```

## Database Schema Summary

- **learning_topics** – Topic metadata, optional summaries, and 1536-dimensional summary embeddings (pgvector).
- **learning_chunks** – Individual learning items with content, SM-2 attributes (ease factor, interval, next review date), content embeddings, prerequisite references, and tags. HNSW indexes on embedding columns enable fast cosine-similarity lookups.
- **learning_sessions** – Persisted session metadata (mode, status, timing, feedback, chunk list).
- **session_chunks** – Per-session chunk progress including attempts, quality scores, and time spent.

Legacy tables (`session_logs`, `performance_analytics`, `friction_metrics`, `review_schedule`) are automatically removed during migration to keep the database clean.

## Testing & Quality

```bash
# Compile and run the full Vitest suite with coverage
pnpm test

# Type-check only
pnpm run type-check

# Lint and format
pnpm run lint
pnpm run format
```

Vitest integration tests exercise the retrieval pipeline (keyword, semantic, and hybrid search modes), recommendation workflows, prerequisite mastery via the knowledge graph, and session management to ensure parity with the live MCP behavior. Refer to the `tests/` directory for concrete examples of tool invocations.
