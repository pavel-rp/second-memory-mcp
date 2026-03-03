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
| Search             | `search_learning_content`                                                                                                                                                                                                                                      | Hybrid keyword + semantic retrieval over topics and chunks (pgvector cosine similarity, HNSW index) |
| Recommendations    | `what_to_learn_today`, `guided_learning_conversation`                                                                                                                                                                                                          | Graph-aware recommendation engine with conversational guidance                                      |
| Session management | `create_session`, `create_session_chunk`, `get_active_session`, `get_session`, `complete_session`, `batch_update_session_chunks`, `get_historical_feedback`                                                                                                    | Multi-step session lifecycle with automatic chunk initialization                                    |
| Session analytics  | `session_progress`, `session_completion`, `session_workflow`                                                                                                                                                                                                   | Track session health and decision points                                                            |
| Spaced repetition  | `calculate_next_review`, `calculate_next_review_advanced`, `calculate_priority_score`, `rank_candidates`, `record_review_result`                                                                                                                               | SM-2 scheduling, priority scoring, and review recording                                             |
| Persistence        | `create_topic_with_chunks`, `create_learning_item`, `update_topic`, `update_topic_summary`, `update_chunk`, `update_chunk_content`, `update_chunk_metadata`, `delete_chunk`, `batch_fetch_topics_minimal`, `batch_fetch_chunks_minimal`, `list_learning_items` | CRUD for topics and chunks with prerequisite graph edges                                            |
| Content            | `get_chunk_content`, `get_topic_summary`, `list_items_with_content`                                                                                                                                                                                            | Retrieve chunk content, topic summaries, and paginated item listings                                |
| Analytics          | `analytics_daily`, `analytics_window`                                                                                                                                                                                                                          | Daily KPIs and date-range analytics with optional breakdowns                                        |

### Recommendation Example

```ts
const result = await what_to_learn_today({
  fetchFromDatabase: true,
  subjectFilter: 'Math',
  dueOnly: true,
  timeAvailable: 30,
});

/* → {
  recommendations: [
    { id: 'chunk-123', priority: 0.94, reason: 'Overdue review with high impact', ... }
  ],
  estimatedDuration: 28,
  sessionSummary: { newItems: 1, reviews: 4, remediation: 0 },
  nextActions: ['Run guided_learning_conversation', 'Start a retrieval drill']
} */
```

### Session Lifecycle Example

```ts
const session = await create_session({
  topicId: 'math-linear-algebra',
  chunkIds: ['chunk-123', 'chunk-456'],
  mode: 'learning',
  estimatedDuration: 40,
});

await create_session_chunk({
  sessionId: session.sessionId,
  chunkId: 'chunk-123',
  status: 'completed',
  attempts: [{ timestamp: Date.now(), completed: true, quality: 4, timeSpentMs: 480000 }],
  qualityScores: [4],
  timeSpentMs: 480000,
});

const completion = await session_completion({ sessionId: session.sessionId });
if (completion.shouldComplete) {
  await complete_session({
    sessionId: session.sessionId,
    feedback: 'Reached fluency for both chunks.',
  });
}
```

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
