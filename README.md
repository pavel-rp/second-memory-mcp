[![CI](https://github.com/pavel-rp/second-memory-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/pavel-rp/second-memory-mcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

# Second Memory Learning

Second Memory Learning is a Model Context Protocol (MCP) server that delivers an AI-powered spaced repetition experience backed by a Postgres database. The server exposes rich tool and prompt surfaces so Claude Desktop can orchestrate complete learning sessions without relying on any external SaaS integrations.

## Key Capabilities

- **Evidence-based scheduling** – Enhanced SM-2 algorithms with lapse handling, cognitive load caps, and candidate ranking (`src/domain/algorithms/sr-calculator.ts`).
- **Guided recommendations** – `what_to_learn_today` can fetch items directly from the database, balance new vs. review work, and produce conversational guidance for the learner (`src/domain/services/recommendation-engine.ts`).
- **Session management** – Create, track, and complete structured learning sessions with automatic session chunk creation (`src/orchestration/session-workflows.ts`).
- **Content operations** – Topic and chunk creation helpers with validation and transactional persistence (`src/orchestration/topic-workflows.ts`, `src/orchestration/chunk-workflows.ts`).
- **Prompt pack integration** – First-class MCP prompts for scaffolding, learning, retrieval, review, and workflow guidance (`src/shared/prompts/prompt-pack.ts`).

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

| Category           | Tool                                                                                                                                                                                                                                                           | Purpose                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Spaced repetition  | `calculate_next_review`, `calculate_next_review_advanced`, `calculate_priority_score`, `rank_candidates`, `record_review_result`                                                                                                                               | Core SM-2 computations, scheduling, and review recording                   |
| Recommendations    | `what_to_learn_today`, `guided_learning_conversation`                                                                                                                                                                                                          | Generate or converse through personalized learning plans                   |
| Session analytics  | `session_progress`, `session_completion`, `session_workflow`                                                                                                                                                                                                   | Track session health and decision points                                   |
| Session management | `create_session`, `create_session_chunk`, `get_active_session`, `get_session`, `complete_session`, `batch_update_session_chunks`, `get_historical_feedback`                                                                                                    | Persisted session lifecycle management with automatic chunk initialization |
| Persistence        | `create_topic_with_chunks`, `create_learning_item`, `update_topic`, `update_topic_summary`, `update_chunk`, `update_chunk_content`, `update_chunk_metadata`, `delete_chunk`, `batch_fetch_topics_minimal`, `batch_fetch_chunks_minimal`, `list_learning_items` | CRUD helpers for topics and chunks backed by Postgres                      |
| Content            | `get_chunk_content`, `get_topic_summary`, `list_items_with_content`                                                                                                                                                                                            | Retrieve chunk content, topic summaries, and paginated item listings       |
| Search             | `search_learning_content`                                                                                                                                                                                                                                      | Search topics and chunks by title                                          |
| Analytics          | `analytics_daily`, `analytics_window`                                                                                                                                                                                                                          | Compute daily KPIs and date-range analytics with optional breakdowns       |

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
├── adapters/drizzle/   # Concrete Drizzle/PostgreSQL implementations of ports
├── infrastructure/     # Database client, schema, migrations, logger
├── shared/             # Cross-cutting utilities, constants, prompts
└── composition-root.ts # Wires adapters → ports → orchestration → server
```

**Layer dependency rule:** Each layer depends only on layers below it. Domain has zero I/O imports. Orchestration depends on ports (interfaces), never adapters. Only the composition root imports concrete adapter classes.

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

- **learning_topics** – Topic metadata, optional summaries, timestamps.
- **learning_chunks** – Individual learning items with content, SM-2 attributes (ease factor, interval, next review date), tags, and prerequisites.
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

Vitest integration tests exercise recommendation workflows, prerequisite mastery, and session management to ensure parity with the live MCP behavior. Refer to the `tests/` directory for concrete examples of tool invocations.
