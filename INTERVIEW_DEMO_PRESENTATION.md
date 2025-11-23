# Interview Demo Presentation
**Second Memory Learning - AI-Powered Spaced Repetition MCP Server**

---

## Slide 1: Title & One-Sentence Pitch

**Title:** Second Memory Learning - Local-First AI Learning Platform

**Bullet points:**
- **One-sentence pitch:** An MCP server that brings evidence-based spaced repetition to Claude Desktop with zero external dependencies—100% local, 100% intelligent, 100% yours.
- Built with TypeScript, SQLite, and the Model Context Protocol
- Orchestrates complete learning workflows through conversational AI

**Speaker notes:**

"I'm going to walk you through Second Memory Learning, a project that represents a synthesis of AI integration, full-stack TypeScript engineering, and cognitive science principles. This isn't just another CRUD app—it's a sophisticated learning platform that uses the Model Context Protocol to turn Claude Desktop into an intelligent tutor. Everything runs locally using SQLite, which means complete data ownership and zero reliance on external SaaS services. What makes this interesting from an engineering standpoint is how it combines spaced repetition algorithms, dependency resolution, and conversational AI orchestration into a cohesive system."

---

## Slide 2: Problem & Context

**Title:** The Learning Problem

**Bullet points:**
- **The gap:** Spaced repetition apps (Anki, etc.) are powerful but friction-heavy—manual card creation, rigid workflows, no intelligent guidance
- **The opportunity:** Claude Desktop can orchestrate complex workflows, but needs rich tool/prompt surfaces to be truly useful
- **The insight:** Combine local-first data storage with AI-powered conversation to create zero-friction learning

**Speaker notes:**

"Let's start with the problem. Spaced repetition is scientifically proven to work—it's based on the forgetting curve and optimal review intervals. But tools like Anki require constant manual effort: creating cards, scheduling reviews, managing decks. There's no intelligence guiding what to study next or how to break down complex topics.

Meanwhile, Claude Desktop introduced the Model Context Protocol—a way for LLMs to call tools and access data. But most MCP servers are simple fetch-and-display utilities. I saw an opportunity to build something more sophisticated: a learning system where the AI handles all the orchestration—topic scaffolding, schedule optimization, session guidance—while keeping 100% of the data local in SQLite. No cloud sync, no vendor lock-in, just pure local intelligence."

---

## Slide 3: High-Level Solution

**Title:** What Second Memory Does

**Bullet points:**
- **For learners:** Say "teach me DFS" and Claude creates a scaffolded learning path, schedules reviews, and guides you through sessions
- **For Claude:** Rich MCP tool surface (20+ tools) for spaced repetition calculations, session management, content CRUD, and search
- **For data:** Local SQLite database with Drizzle ORM—full ownership, fast queries, zero dependencies

**Speaker notes:**

"Here's what this system does in practice. As a learner, you can literally just tell Claude 'I want to learn depth-first search' and the system will:
1. Search for existing content to avoid duplication
2. Generate 5-9 scaffolded learning chunks using prompt engineering
3. Validate prerequisites and create a dependency graph
4. Schedule optimal review intervals using enhanced SM-2 algorithms
5. Guide you through learning sessions conversationally

From Claude's perspective, this is a rich MCP server exposing 20+ tools across five categories: spaced repetition algorithms, recommendation engine, session management, content persistence, and semantic search. Each tool has full Zod schema validation for type safety.

From an architecture standpoint, everything lives in a local SQLite database. We're using Drizzle ORM for type-safe queries and migrations. The entire database schema is version-controlled and can be inspected with Drizzle Studio. This is local-first done right."

---

## Slide 4: Architecture Overview

**Title:** System Architecture

**Bullet points:**
- **Frontend (implicit):** Claude Desktop (Electron app) communicates via MCP stdio transport
- **MCP Server Layer:** TypeScript/Node.js 20+ with @modelcontextprotocol/sdk
  - Tool registration (20+ tools)
  - Prompt registration (scaffolding, learning, retrieval, review, workflow guidance)
  - Zod schema validation on all inputs/outputs
- **Business Logic:** Service layer with transactional operations
  - `services/` - Session management, topic creation, prerequisite validation
  - `tools/` - Pure functions for SR algorithms, recommendation engine, analytics
- **Data Layer:** SQLite + Drizzle ORM
  - Tables: learning_topics, learning_chunks, review_schedule, learning_sessions, session_chunks
  - Migrations, seed data, constraint enforcement

**ASCII diagram:**
```
Claude Desktop ←[stdio]→ MCP Server ←[tools/prompts]→ Services ←[Drizzle ORM]→ SQLite
```

**Speaker notes:**

"Let me walk through the architecture from left to right.

**Claude Desktop** is the user interface—it's an Electron app that communicates with MCP servers via stdio transport. Think of it like a rich terminal for AI conversations.

**The MCP Server layer** is where I register all the tools and prompts. This is built on the official MCP SDK. Every tool has a Zod schema for input validation and outputs JSON responses. We expose 20+ tools across five categories, plus seven prompts for guided workflows.

**The business logic layer** is split into `services/` and `tools/`. Services handle stateful operations—creating sessions, validating prerequisites, persisting data with transactions. Tools are pure functions for calculations—spaced repetition algorithms, priority scoring, cognitive load estimation, dependency resolution.

**The data layer** is SQLite with Drizzle ORM. We have five core tables with proper foreign key constraints and cascading deletes. The schema supports versioning for content updates and tracks millisecond-precision timestamps for review scheduling.

**Key architectural decisions:**
1. **Separation of pure functions from side effects** - SR calculations in `tools/`, persistence in `services/`
2. **Zod schemas as single source of truth** - Types inferred from schemas, used for validation and MCP registration
3. **Drizzle ORM for type safety** - No raw SQL, all queries are type-checked at compile time
4. **ES modules throughout** - Modern Node.js patterns, explicit `.js` extensions in imports"

---

## Slide 5: Key Flow #1 - Intelligent Recommendation Engine

**Title:** End-to-End Recommendation Flow

**Bullet points:**
1. **Trigger:** User asks "what should I learn today?" or provides time/subject constraints
2. **Fetch:** Query SQLite for all learning chunks (`list_learning_items_sqlite`)
3. **Filter:** Validate prerequisites—only recommend items where dependencies are mastered
4. **Prioritize:** Calculate priority scores using SM-2 (urgency × ease × novelty × difficulty)
5. **Compose:** Balance session with cognitive load caps, interleave easy/medium/hard items
6. **Resolve:** Auto-include missing prerequisites in correct dependency order
7. **Return:** Recommendations with rationale, alternatives, session summary, next actions

**Key files:**
- `src/tools/recommendation-engine.ts` - Main orchestrator (700 LOC)
- `src/tools/sr-calculator.ts` - Priority scoring and SM-2 algorithms
- `src/tools/prerequisite-validator.ts` - Mastery validation
- `src/tools/dependency-resolver.ts` - Topological sort for prerequisites
- `src/tools/cognitive-load.ts` - Working memory load estimation
- `src/server/spaced-repetition-tools.ts` - MCP tool registration

**Speaker notes:**

"This is the most sophisticated flow in the system, and it showcases senior-level system thinking. Let me walk through it step by step.

**Step 1 - Trigger:** The user says something like 'teach me' or 'I have 30 minutes for CS topics.' The conversation manager parses this intent and extracts time/subject hints.

**Step 2 - Fetch:** We query the SQLite database to get all learning chunks. This is a simple SELECT but it returns rich data—SM-2 attributes (ease factor, repetitions, next review date), prerequisites, tags, difficulty levels.

**Step 3 - Prerequisite filtering:** Here's where it gets interesting. Before we even calculate priorities, we validate prerequisites. If chunk B depends on chunk A, and you haven't mastered A yet, B gets filtered out. This is implemented in `prerequisite-validator.ts` and uses actual attempt history to determine mastery (requires 2 successful attempts with quality ≥4).

**Step 4 - Priority scoring:** For each valid candidate, we calculate a multi-factor priority score using the enhanced SM-2 algorithm. The formula combines:
- **Urgency:** Items overdue get exponentially higher priority
- **Inverse ease factor:** Items you struggle with get more attention
- **Novelty:** New content is weighted lower to prioritize reviews
- **Difficulty:** Adjusts for inherent complexity

This is implemented in `sr-calculator.ts` and all parameters are environment-configurable.

**Step 5 - Compose balanced session:** We don't just take the top N items. We balance the session:
- Separate items into overdue/review/new buckets
- Prioritize overdue (urgent)
- Add reviews up to cognitive load cap
- Include new items up to configured limit (default 3-5)
- Interleave by difficulty (easy → medium → hard) to optimize working memory load

This uses `cognitive-load.ts` which implements George Miller's 7±2 rule and intrinsic/extraneous load theory.

**Step 6 - Dependency resolution:** Here's the magic—if the recommended items have prerequisites that weren't included, we automatically fetch them from the database and insert them in the correct order. This uses `dependency-resolver.ts` which does a topological sort to ensure prerequisites always come before dependents. We track what was added and explain it in the rationale.

**Step 7 - Return rich response:** The output includes:
- Ordered recommendations with reasons ('overdue - needs immediate attention', 'new content - expanding knowledge')
- Session summary (total items, duration, cognitive load, breakdown by type)
- Conversational guidance ('Start with X, then Y...')
- Rationale explaining the algorithm's choices
- Alternatives (next 3 items that didn't make the cut)
- Next actions for the user

**Why this demonstrates senior thinking:**
- **Separation of concerns:** Pure algorithms in tools/, stateful orchestration in services/
- **Composability:** Each step is independently testable and reusable
- **Extensibility:** Adding new filtering criteria or scoring factors is straightforward
- **Observability:** Rich rationales explain every decision
- **Robustness:** Handles missing prerequisites, invalid data, empty results gracefully
- **User experience:** Zero friction—just ask and get intelligent recommendations"

---

## Slide 6: Key Flow #2 - Conversational Topic Creation with Search Integration

**Title:** AI-Powered Learning Workflow Orchestration

**Bullet points:**
- **Natural language input:** User says "I want to learn depth-first search"
- **Conversation manager parses intent** (`src/tools/conversation-manager.ts`)
  - Pattern matching extracts topic title
  - Infers subject (CS, Math, SWE, Language) from keywords
- **Step 1 - Deduplication:** System instructs Claude to call `search_learning_content` tool
  - Semantic search using content similarity scoring
  - Returns existing topics/chunks matching query
  - Prevents duplicate content creation
- **Step 2 - Chunk generation:** If no match, uses `chunk_generation` prompt
  - Claude generates 5-9 scaffolded chunks with titles, summaries, prerequisites
  - Follows cognitive load theory (small chunks, progressive complexity)
- **Step 3 - Validation & persistence:** `create_topic_with_chunks` tool
  - Validates chunk structure, prerequisites, content
  - Performs transactional insert (topic + chunks + review schedule)
  - Returns created IDs for immediate use
- **Zero user friction:** Entire workflow happens in conversation, no forms or manual steps

**Key files:**
- `src/tools/conversation-manager.ts` - Intent parsing and workflow orchestration (560 LOC)
- `src/server/search-tools.ts` - Semantic search registration
- `src/services/search.ts` - Content similarity algorithms
- `src/prompts/prompt-pack.ts` - Chunk generation prompt engineering
- `src/services/topic-creation.ts` - Transactional persistence with validation

**Speaker notes:**

"This flow showcases AI integration as a first-class architectural component, not just a bolt-on feature.

**The user experience:** You tell Claude 'I want to learn DFS' and the system handles everything—searching for duplicates, generating scaffolded chunks, validating prerequisites, persisting to the database. All through natural conversation.

**How it works technically:**

**Step 1 - Intent parsing:** The ConversationManager uses regex pattern matching to extract structured data from natural language. When it detects patterns like 'I want to learn X' or 'teach me Y', it extracts the topic title and infers the subject using keyword matching. This is a pragmatic approach—more reliable than full NLP for this domain.

**Step 2 - Search integration:** Before creating anything, the system instructs Claude to call `search_learning_content`. This tool implements semantic search using content similarity scoring. It's not just keyword matching—it analyzes title similarity, subject alignment, and content overlap. The algorithm is in `utils/content-similarity.ts` and uses techniques like:
- Normalized string distance (Levenshtein-based)
- Jaccard similarity for tag overlap
- Subject exact matching
- Combined scoring with configurable weights

This prevents duplicate content. If you already learned DFS last week, it finds that topic and suggests reusing it.

**Step 3 - Chunk generation:** If no match is found, the system uses the `chunk_generation` MCP prompt. This is where prompt engineering meets cognitive science. The prompt instructs Claude to:
- Generate 5-9 chunks (optimal for working memory)
- Scaffold from simple → complex (prerequisite ordering)
- Include concrete examples and practice drills
- Specify prerequisites explicitly (for dependency resolution)

The prompt is defined in `prompts/prompt-pack.ts` and supports templating with topic details.

**Step 4 - Validation & persistence:** When Claude returns the generated chunks, we validate the structure using Zod schemas, check prerequisite references exist, and perform a transactional insert. The service layer (`services/topic-creation.ts`) handles this with proper error handling and rollback on failure.

**Why this demonstrates 'agent operator' skills:**

1. **Workflow orchestration:** The system doesn't just expose tools—it guides Claude through multi-step workflows with clear instructions.

2. **Guardrails:** We use schema validation, content similarity checks, and prerequisite validation to prevent garbage data.

3. **Observability:** Every step returns rich feedback explaining what happened and what to do next.

4. **Robustness:** If search fails, we fall back gracefully. If chunk generation produces invalid data, we report specific errors, not generic failures.

5. **Maintainability:** The conversation logic is separated from the tool implementations. We can swap out the search algorithm without touching the conversation manager.

This is how you build LLM-powered systems that are production-ready, not just demos."

---

## Slide 7: Engineering Practices & Developer Experience

**Title:** Code Quality & Team Productivity

**Bullet points:**
- **Project structure:** Clean separation of concerns
  - `src/server/` - MCP registration layer
  - `src/services/` - Business logic with side effects
  - `src/tools/` - Pure functions for algorithms
  - `src/types/` - Zod schemas (single source of truth)
  - `tests/` - Vitest integration tests with coverage
- **Type safety across the stack:**
  - Zod schemas validate runtime data
  - TypeScript types inferred from schemas
  - Drizzle ORM generates types from database schema
  - Zero `any` types in production code
- **Testing strategy:**
  - Vitest for unit and integration tests
  - Coverage requirements enforced in CI
  - Test fixtures for realistic scenarios
  - Tests for algorithm edge cases (lapses, leeches, prerequisites)
- **Developer experience:**
  - `pnpm run dev` - Watch mode with instant recompilation
  - `pnpm run db:studio` - Visual database inspection (Drizzle Studio)
  - `pnpm test` - Run full test suite with coverage
  - Husky pre-commit hooks - Auto-format and lint
  - Prettier + ESLint configured for consistency

**Speaker notes:**

"Let me talk about the engineering practices that make this codebase maintainable and scalable.

**Project structure:** We follow a strict layering pattern. The `server/` directory only does MCP registration—it's thin handlers that delegate to services. The `services/` layer handles business logic with database transactions. The `tools/` layer is pure functions for calculations—no I/O, fully testable. The `types/` directory is our single source of truth for schemas.

**Type safety is non-negotiable:** Every MCP tool input is validated with Zod schemas at runtime. TypeScript types are inferred from those schemas, so they can never drift. The database schema is defined in Drizzle, which generates TypeScript types for all tables. We have zero `any` types in production code—every variable has an explicit type or inferred type from a schema.

**Testing strategy:** We use Vitest because it's fast and has great TypeScript support. The tests focus on:
- Algorithm correctness (SR calculations, priority scoring)
- Prerequisite validation edge cases
- Dependency resolution with circular references
- Integration tests that exercise the full MCP tool flow

Coverage is enforced in CI—we don't merge code without tests.

**Developer experience:**
- Local dev with `pnpm run dev` gives instant recompilation on file changes
- `pnpm run db:studio` launches Drizzle Studio for visual database inspection
- Pre-commit hooks auto-format code with Prettier and run ESLint
- All scripts are documented in package.json and the README

**Examples of senior-level decisions:**

1. **Avoiding over-abstraction:** We don't have a generic 'Repository' pattern or ORM wrapper. Drizzle is already a great abstraction. Adding another layer would just add ceremony.

2. **Configuration as code:** Algorithm parameters are environment variables with typed config in `config/algorithm.ts`. This makes A/B testing easy—just change an env var, no code changes.

3. **Explicit over implicit:** Import paths use explicit `.js` extensions (required for ES modules). It's more verbose but prevents runtime errors.

4. **Fail fast:** Zod validation throws on invalid input. We don't try to coerce bad data—we reject it immediately with clear error messages.

These practices aren't flashy, but they're what makes a codebase productive for a team long-term."

---

## Slide 8: Trade-Offs & Limitations

**Title:** Honest Assessment

**Bullet points:**
- **What we optimized for:**
  1. Local-first simplicity over distributed scalability
  2. SQLite performance for single-user workloads over multi-tenancy
  3. Rich MCP tool surface over generic REST API
- **What we didn't build (and why):**
  1. No cloud sync - Deliberate choice for privacy and simplicity, but limits cross-device use
  2. No collaborative features - Single-user focus keeps complexity manageable
  3. No frontend UI - MCP + Claude Desktop is the interface (reduces scope, increases focus)
- **What I'd improve next:**
  1. **Add vector search for semantic content retrieval** - Currently using string similarity; embeddings would be more accurate
  2. **Implement session analytics dashboard** - Rich data exists but no visualization beyond JSON output
  3. **Add conflict-free replicated data types (CRDTs)** - Would enable eventual consistency for multi-device sync without cloud dependency

**Speaker notes:**

"Let me be honest about the trade-offs and limitations.

**What we optimized for:**

1. **Local-first simplicity:** SQLite in a single file is incredibly simple to reason about. No connection pools, no network latency, no distributed transactions. This is perfect for a single-user learning app. The trade-off is that you can't easily share data across devices or collaborate with others. But for this use case, that's fine—learning is personal.

2. **Rich MCP integration:** By going all-in on MCP, we get deep Claude Desktop integration with minimal code. The trade-off is that this server is useless without an MCP client. If we wanted a standalone web app, we'd need to build a REST API layer. But that would add complexity without clear user benefit.

3. **TypeScript everywhere:** We use modern Node.js with ES modules, top-level await, and strict TypeScript. This makes the codebase maintainable but requires Node.js 20+. Older environments won't work.

**What we didn't build:**

1. **No cloud sync:** This is deliberate. Every spaced repetition app with cloud sync eventually has privacy concerns, sync conflicts, and vendor lock-in. By staying local, we avoid all of that. The limitation is you can't seamlessly sync across devices. The improvement path is CRDTs for peer-to-peer sync, not cloud dependencies.

2. **No collaborative features:** This is a single-user learning system. We don't support shared decks, leaderboards, or social features. That's a conscious scope decision—better to do one thing extremely well than many things poorly.

3. **No frontend UI:** Claude Desktop is the UI. We don't have a React app or a web dashboard. The benefit is we can focus all our energy on the algorithms and data model. The limitation is non-technical users can't use this without Claude Desktop.

**What I'd improve next:**

1. **Vector search:** Right now, content similarity uses string distance and keyword matching. It works but it's not smart. Adding embeddings (via local models or OpenAI API) would dramatically improve duplicate detection and semantic search.

2. **Analytics visualization:** We track session performance, quality scores, and time spent. But it's all JSON. A simple dashboard showing learning curves, retention rates, and mastery progression would be valuable.

3. **CRDT-based sync:** If we wanted multi-device support without a cloud backend, we could use CRDTs (like Yjs or Automerge) to enable peer-to-peer sync. This keeps data local but allows merging across devices.

**Why this matters:** Talking about limitations confidently shows you understand trade-offs and have thought beyond the current implementation. It's not about having perfect code—it's about knowing *why* you made each decision."

---

## Slide 9: Summary & Takeaways

**Title:** What This Project Demonstrates

**Bullet points:**
- **Problem:** Spaced repetition works but existing tools are friction-heavy and lack intelligence
- **Solution:** Local-first MCP server that turns Claude Desktop into an intelligent tutor with zero external dependencies
- **Senior skills demonstrated:**
  - **System architecture:** Clean layering (server/services/tools/data), separation of pure functions from side effects
  - **Full-stack TypeScript:** Advanced type safety with Zod schemas, Drizzle ORM, strict TypeScript config
  - **Algorithm implementation:** Enhanced SM-2 with lapse handling, multi-factor priority scoring, dependency resolution
  - **AI integration:** Conversational workflow orchestration, prompt engineering, guardrails for LLM-powered systems
  - **Engineering practices:** Type safety across the stack, comprehensive testing, DX-focused tooling

**Speaker notes:**

"Let me tie this all together.

**The problem** we're solving is making evidence-based learning accessible and intelligent. Spaced repetition has decades of research backing it, but the tools are clunky. You manually create flashcards, manually schedule reviews, and get zero guidance on what to study next.

**The solution** is a local-first MCP server that orchestrates the entire learning workflow through Claude. You tell it what to learn, it scaffolds the content, schedules reviews using SM-2 algorithms, validates prerequisites, and guides you through sessions conversationally. All your data stays in a local SQLite database.

**What this demonstrates from a senior engineering perspective:**

1. **System thinking:** This isn't just a pile of features. It's a thoughtfully layered architecture where each component has a clear responsibility. Pure functions for calculations, services for business logic, MCP handlers as thin adapters.

2. **Full-stack TypeScript expertise:** We use advanced TypeScript patterns—discriminated unions, type inference from Zod schemas, branded types, strict null checks. The Drizzle ORM integration shows deep understanding of type-safe database access.

3. **Algorithm implementation:** The spaced repetition engine isn't a library we imported—it's a custom implementation of enhanced SM-2 with lapse handling, leech detection, and configurable parameters. The priority scoring combines multiple factors with weights. The dependency resolver does topological sorting. This shows comfort with non-trivial algorithms.

4. **AI as a component, not a gimmick:** The LLM integration is architected properly. We use structured prompts, schema validation, workflow orchestration, and error handling. The conversation manager parses intent and guides Claude through multi-step processes. This is production-grade AI engineering, not just API calls.

5. **Engineering rigor:** Type safety, test coverage, linting, pre-commit hooks, clear documentation. This is maintainable code built for a team.

This project represents the intersection of AI-era development and solid full-stack fundamentals. It's what you get when you combine modern LLM capabilities with rigorous software engineering practices."

---

# Cheat Sheet (for the candidate)

## One-Sentence Pitch
An MCP server that brings evidence-based spaced repetition to Claude Desktop with zero external dependencies—100% local, 100% intelligent, 100% yours.

## 3 Key Technical Bullets
1. **Enhanced SM-2 spaced repetition engine** with multi-factor priority scoring, prerequisite dependency resolution, and cognitive load management
2. **Local-first architecture** using SQLite + Drizzle ORM for complete data ownership, type-safe queries, and zero cloud dependencies
3. **Rich MCP integration** with 20+ tools and 7 prompts exposing spaced repetition calculations, recommendation engine, session management, and conversational workflows to Claude Desktop

## 3 Key Architecture Decisions + Why
1. **Separation of pure functions (`tools/`) from stateful services (`services/`)**
   - *Why:* Makes algorithms independently testable, reusable across MCP tools, and easier to optimize without touching persistence logic

2. **Zod schemas as single source of truth for types**
   - *Why:* Runtime validation and compile-time types stay in sync automatically; impossible for API contracts to drift from implementation

3. **Local SQLite with Drizzle ORM over cloud database**
   - *Why:* Learning data is personal and sensitive; local-first ensures privacy, zero latency, and works offline; Drizzle gives type safety without SQL injection risk

## 2 Key AI/LLM Details
1. **Conversational workflow orchestration** - The ConversationManager parses natural language intents ("I want to learn DFS"), orchestrates multi-step workflows (search duplicates → generate chunks → validate → persist), and provides guardrails through Zod schema validation and prerequisite checks

2. **Prompt engineering for content scaffolding** - The `chunk_generation` prompt uses cognitive load theory principles to instruct Claude to generate 5-9 chunks with progressive complexity, explicit prerequisites, and concrete examples—turning unstructured topics into structured learning paths

## 2 Likely Follow-Up Questions

### Question 1: "How do you handle conflicts when the LLM generates invalid data?"

**Answer:**
"Great question. We handle this with a defense-in-depth strategy. First layer is prompt engineering—the `chunk_generation` prompt explicitly specifies the expected JSON structure with examples. Second layer is Zod schema validation—every MCP tool input is validated at runtime before touching the database. If validation fails, we return a detailed error message explaining exactly what's wrong, not a generic 'invalid input' message.

Third layer is prerequisite reference validation—before creating a topic, we check that all prerequisite IDs referenced actually exist in the database. If they don't, we reject the entire transaction and tell Claude to fix the references.

The key insight is that LLMs are probabilistic, so you can't just trust the output. You need strong contracts at every boundary. Zod gives us that at the type level, and our service layer enforces business logic constraints like 'prerequisites must reference valid chunks.' This isn't just good AI engineering—it's good engineering period."

### Question 2: "Why did you choose SQLite over PostgreSQL for this project?"

**Answer:**
"This comes down to the local-first architecture decision. SQLite is the right tool for single-user, local-first applications because:

1. **Zero configuration:** No server to run, no connection pooling, just a file on disk. This dramatically lowers the barrier to entry for users.

2. **Performance:** For single-user workloads with fewer than 100K rows, SQLite is often *faster* than PostgreSQL because there's no network overhead and fewer layers of abstraction.

3. **Data ownership:** Your learning data stays on your machine in a file you can back up, inspect, and migrate. No cloud dependency, no vendor lock-in.

4. **Simplicity:** The entire database is a single file. Drizzle migrations are simple file-based operations. No need to manage database servers, user permissions, or connection strings.

The trade-off is you can't easily scale to multi-user scenarios or distributed deployments. But that's not a goal for this project—learning is inherently personal and local.

If this were a SaaS product serving thousands of users, PostgreSQL would absolutely be the right choice. But for an MCP server that runs locally on a user's machine, SQLite is perfect. It's about choosing the right tool for the constraints, not defaulting to the 'enterprise' option."

### Question 3: "Walk me through how you'd add a new feature, say, analytics for learning patterns."

**Answer:**
"Let me think through this systematically.

**Step 1 - Define the data model:** First, I'd extend the schema. We already have `session_chunks` with quality scores and time spent. For pattern analysis, I might add a `learning_analytics` table with aggregated metrics like:
- Success rate by subject
- Average time per difficulty level
- Retention curves (performance decay over time)
- Optimal session duration by user

I'd define this in `src/db/schema.ts` using Drizzle, create a migration script, and update types.

**Step 2 - Implement the analytics engine:** Create `src/tools/pattern-analyzer.ts` with pure functions that take session data and compute metrics. Things like:
- `calculateRetentionCurve(attempts: ChunkAttempt[]): RetentionCurve`
- `analyzeSubjectPerformance(chunks: LearningChunkRow[]): SubjectAnalytics`

Keep this pure—no database access, just calculations.

**Step 3 - Create a service layer:** Implement `src/services/analytics.ts` that queries the database, calls the pure functions, and returns structured results. This layer handles the I/O.

**Step 4 - Register MCP tools:** In `src/server/analytics-tools.ts`, register tools like `analyze_learning_patterns` with Zod schemas for inputs and outputs. This exposes the analytics to Claude.

**Step 5 - Test:** Write Vitest tests for the pure functions with edge cases (empty data, outliers, etc.). Add integration tests that exercise the full MCP tool.

**Step 6 - Documentation:** Update the README with examples of calling the new analytics tools.

The key is maintaining the same layering pattern: pure functions in `tools/`, business logic in `services/`, MCP registration in `server/`, and Zod schemas in `types/`. This keeps the codebase consistent and predictable."

---

**End of Presentation**

*Total slides: 9*
*Estimated time: 12-15 minutes*
*Target audience: Senior engineering panel*
