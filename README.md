[![codecov](https://codecov.io/gh/pavel-rp/second-memory-mcp/branch/develop/graph/badge.svg)](https://codecov.io/gh/pavel-rp/second-memory-mcp)
[![CI](https://github.com/pavel-rp/second-memory-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/pavel-rp/second-memory-mcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

# Second Memory Learning

An MCP server that turns any compatible AI client into a full learning assistant — backed by a knowledge graph of prerequisites, hybrid retrieval over pgvector embeddings, and multi-step agentic workflows that orchestrate spaced repetition sessions with no required external SaaS — embedding providers are optional and pluggable.

## Key Capabilities

- **Knowledge graph & prerequisite resolution** – Learning items form a directed graph of prerequisite relationships. `DependencyResolver` performs topological sorting, cycle detection, and transitive dependency resolution so the recommendation engine can sequence material in the right order (`src/domain/algorithms/dependency-resolver.ts`).
- **Hybrid retrieval pipeline** – Three search modes — keyword (title + content text matching), semantic (cosine similarity over pgvector embeddings), and hybrid (weighted linear combination of normalized keyword + semantic scores). Embedding vectors are stored alongside content in Postgres with HNSW indexes for sub-linear lookups (`src/orchestration/search-workflows.ts`, `src/adapters/drizzle/search-adapter.ts`).
- **Agentic session orchestration** – Multi-step learning workflows where the AI client creates sessions, walks through chunks, records review quality, and decides when to complete — all driven through MCP tool calls that maintain session state across turns (`src/orchestration/session-workflows.ts`).
- **Context-aware recommendations** – `what_to_learn_today` returns topic-level recommendations ranked by urgency, applying prerequisite filtering via the knowledge graph and sequencing due chunks by overdue status and review timing (`src/domain/services/recommendation-engine.ts`).
- **Prompt engineering surface** – Three MCP prompt resources are registered (scaffolding, chunk generation, chunk management) that give the connected AI client structured context for content creation and maintenance; additional internal prompt templates are used by teaching tools (`src/shared/prompts/prompt-pack.ts`).
- **Evidence-based scheduling** – Enhanced SM-2 algorithm with lapse handling, cognitive load modeling, candidate ranking, and automatic leech detection — items with repeated failures are flagged for remediation (`src/domain/algorithms/sr-calculator.ts`).
- **Leech detection & remediation** – Items that a learner repeatedly fails are automatically flagged as leeches (`chunk_type: 'remediation'`). Dedicated tools (`get_leeches`, `resolve_leech`) let the agent list flagged items and apply resolution strategies: reset progress, archive, or mark as reviewed. Leeches are excluded from daily recommendations by default to keep the review queue productive (`src/orchestration/review-workflows.ts`).

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
| Recommendations    | `what_to_learn_today`                                                                                                                                                                                                                                          | Graph-aware recommendation engine with prerequisite-resolved ranking                                |
| Session management | `create_session`, `create_session_chunk`, `get_active_session`, `get_session`, `complete_session`, `batch_update_session_chunks`, `get_historical_feedback`                                                                                                    | Multi-step session lifecycle with automatic chunk initialization                                    |
| Session analytics  | `session_status`                                                                                                                                                                                                                                               | Track session health and decision points                                                            |
| Spaced repetition  | `calculate_next_review`, `calculate_next_review_advanced`, `calculate_priority_score`, `rank_candidates`, `get_leeches`, `resolve_leech`                                                                                                                       | SM-2 scheduling, priority scoring, and leech remediation                                            |
| Persistence        | `create_topic_with_chunks`, `create_learning_item`, `update_topic`, `update_topic_summary`, `update_chunk`, `update_chunk_content`, `update_chunk_metadata`, `delete_chunk`, `batch_fetch_topics_minimal`, `batch_fetch_chunks_minimal`, `list_learning_items` | CRUD for topics and chunks with prerequisite graph edges                                            |
| Content            | `get_chunk_content`, `get_topic_summary`, `list_items_with_content`                                                                                                                                                                                            | Retrieve chunk content, topic summaries, and paginated item listings                                |
| Analytics          | `analytics_daily`, `analytics_window`                                                                                                                                                                                                                          | Daily KPIs and date-range analytics from stored review history                                      |

The server also exposes MCP prompt resources (discoverable via `prompts/list`) for content scaffolding, chunk generation, and chunk management. Teaching and session orchestration are now handled through dedicated MCP tools rather than prompt resources.

### Example: AI-Guided Learning Session

The examples below show how an AI agent orchestrates a learning session through MCP tool calls. Each step is a tool invocation with JSON parameters — the agent decides what to call based on the user's goals and prior results.

**1. Get today's recommendations**

The user says: _"I want to study math."_

The agent calls `what_to_learn_today`:

```json
{
  "subject_filter": "Math",
  "limit": 5
}
```

The server responds with topic-level recommendations ranked by urgency:

```json
{
  "recommendations": [
    {
      "topic_id": "topic-001",
      "topic_title": "Linear Algebra",
      "urgency_score": 0.94,
      "urgency_reason": "overdue",
      "due_chunk_ids": ["chunk-123", "chunk-124"],
      "due_chunk_count": 2,
      "total_chunk_count": 5,
      "estimated_duration": 15,
      "has_new_chunks": false
    },
    {
      "topic_id": "topic-002",
      "topic_title": "Calculus",
      "urgency_score": 0.81,
      "urgency_reason": "optimal timing",
      "due_chunk_ids": ["chunk-456"],
      "due_chunk_count": 1,
      "total_chunk_count": 3,
      "estimated_duration": 8,
      "has_new_chunks": true
    }
  ],
  "total_due_topics": 2,
  "total_due_chunks": 3
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

Since `create_session` was called with `chunk_ids`, session-chunk rows already exist in `pending` status. The agent presents material, quizzes the user, and records results via `batch_update_session_chunks`:

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

The agent calls `session_status` to decide whether to continue or wrap up:

```json
{ "session_id": "ses-abc-123" }
```

```json
{
  "chunks_completed": 3,
  "chunks_remaining": 0,
  "overall_progress": 1.0,
  "average_quality": 4.5,
  "time_elapsed_ms": 1800000,
  "should_complete": true,
  "reason": "Learning goals achieved with high quality performance.",
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

**6. Spaced repetition scheduling**

Spaced repetition scheduling is handled automatically — `submit_answer` (Teaching Flow) and `batch_update_session_chunks` (Rolling Session Flow) both update each chunk's SM-2 parameters (`easeFactor`, `intervalDays`, `nextReviewAt`) so it appears at the right time in future sessions.

## Using with Claude.ai

Claude.ai connects to MCP servers but does not receive the server's `instructions` field. To ensure Claude follows the correct workflow, paste the block below into your **Project's custom instructions** (or your account-level custom instructions):

```text
Second Memory is a spaced-repetition learning server. Follow these workflows:

TEACHING FLOW (start_learning → submit_answer loop)
1. Call start_learning to create a session and get the first chunk's teaching
   instruction. If status is "nothing_due" or "error", surface the message and stop.
2. Present the instruction to the learner and collect their response.
3. Call submit_answer with the question, response, pass/fail judgment, feedback,
   and time_spent_ms.
4. If the result says "retry", ask the learner to try again and re-call submit_answer.
5. If "recorded", check next.status:
   "teach" → present the instruction and repeat from step 3.
   "blocked" or "error" → surface the message and stop.
6. When next.status is "complete", call complete_session with the session_id
   from start_learning and optional feedback.

SM-2 QUALITY SCALE (used internally — do not fabricate scores)
0 = total blackout, 1 = wrong but recognised on reveal, 2 = wrong but close,
3 = correct with significant difficulty, 4 = correct with minor hesitation,
5 = instant perfect recall.
The server derives quality from your pass/fail judgment via submit_answer.

NOTES LIFECYCLE
After a learner answers, you may call add_note with:
- type "insight"    — learner made a useful connection
- type "confusion"  — learner struggled or asked a clarifying question
- type "connection" — links this chunk to another topic or chunk

ANTI-PATTERNS — do NOT:
- Call get_chunk_content or get_topic_summary during active teaching
  (the server already provides the instruction text).
- Skip drills — the server decides when a chunk is mastered.
- Manually hydrate prompt templates — call prompts through the MCP protocol.
- Hardcode interval_days — always read it from the response.
```

> **Tip:** If you're using an MCP client that does pass `instructions`, you don't need to paste anything — the server sends its own workflow guide automatically. You can also call the `get_server_workflow` tool at any time to retrieve the server's full workflow guide, which covers additional flows (rolling sessions, content creation, tool disambiguation) beyond the essentials above.

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
pnpm test                  # Full suite: build + unit/integration with coverage, then embedding tests
pnpm run test:unit         # Unit tests only (no build required)
pnpm run test:integration  # Build + integration tests (requires running Postgres)
pnpm run test:embedding    # Build + embedding/semantic-search tests
pnpm run test:ci           # Build + all tests with coverage (unit + integration)
```

```bash
pnpm run type-check        # Type-check only
pnpm run lint              # Lint
pnpm run format            # Format
```

Integration tests exercise the retrieval pipeline (keyword, semantic, and hybrid search modes), recommendation workflows, prerequisite mastery via the knowledge graph, and session management. Refer to the `tests/` directory for concrete examples.
