# GitHub Copilot Instructions for second-memory-mcp

## Repository Overview

**Second Memory Learning** is a Model Context Protocol (MCP) server implementing an AI-powered spaced repetition learning system. It integrates with Claude Desktop via MCP SDK to provide sophisticated tutoring capabilities using evidence-based learning science principles (enhanced SM-2 algorithm, scaffolding, cognitive load theory).

**Tech Stack:**

- TypeScript ES modules (Node.js 20+, pnpm package manager)
- MCP SDK for Claude Desktop integration
- SQLite with Drizzle ORM for local-first data storage
- Zod for schema validation and type safety
- Vitest for testing with coverage reporting

**Repository Size:** ~30 test files, ~40 source files across 9 source directories

## Build & Validation Commands

**CRITICAL:** Always run commands in this exact order to avoid failures.

### Initial Setup

```bash
# Install pnpm globally if not available
npm install -g pnpm

# Install dependencies (ALWAYS use --frozen-lockfile in CI/PR workflows)
pnpm install --frozen-lockfile
```

### Development Workflow (Execute in Order)

```bash
# 1. Type check (takes ~1-2 seconds, catches type errors early)
pnpm run type-check

# 2. Build TypeScript to dist/ (takes ~2-3 seconds)
pnpm run build

# 3. Lint code (takes ~5 seconds, max 100 warnings allowed)
pnpm run lint

# 4. Check formatting (takes ~1-2 seconds)
pnpm run format:check

# 5. Run tests with coverage (takes ~8-10 seconds)
pnpm test
```

**Build Output:** All compiled JavaScript goes to `dist/` directory (gitignored)

### Fix Commands

```bash
# Auto-fix lint issues
pnpm run lint:fix

# Auto-fix formatting issues
pnpm run format
```

### Database Commands

```bash
# Apply schema migrations (REQUIRES MIGRATE_SOURCE env var or JSON file)
# Without import file, use: MIGRATE_SOURCE=/tmp/empty.json (create { } file first)
pnpm run db:migrate

# Launch Drizzle Studio for visual database inspection
pnpm run db:studio
```

### Running the Server

```bash
# Run built server (must run 'pnpm run build' first)
pnpm run start

# Build and run in one step
pnpm run start:pnpm

# Run in MCP stdio mode (for Claude Desktop integration/debugging)
pnpm run start:stdio
```

## Common Build Issues & Solutions

1. **"pnpm: command not found"** → Run `npm install -g pnpm` first
2. **Test database conflicts** → Tests automatically create temp databases (tmp-test-\*.db). Cleanup script runs after tests.
3. **better-sqlite3 binding errors** → Reinstall: `pnpm rebuild better-sqlite3`
4. **Migration script fails** → Ensure empty JSON file exists: `echo '{}' > /tmp/empty.json && MIGRATE_SOURCE=/tmp/empty.json pnpm run db:migrate`
5. **TypeScript version warning in lint** → Safe to ignore. Project uses TypeScript 5.9.2; ESLint supports <5.6.0

## CI/CD Workflows

### GitHub Actions (runs on all PRs to `develop` branch)

**`.github/workflows/ci.yml`** - Main CI pipeline:

1. Setup Node.js 20.x and pnpm
2. Install system dependencies for SQLite (build-essential, python3, libsqlite3-dev)
3. Rebuild better-sqlite3 with native bindings
4. Install dependencies with `--frozen-lockfile`
5. Verify SQLite bindings with test script
6. Run lint → type-check → build → test (with coverage upload to codecov)

**`.github/workflows/code-quality.yml`** - Format and quality checks:

1. Setup Node.js 20 and pnpm
2. Install dependencies
3. Run format:check → lint → type-check → test

### Pre-commit Hooks

**`.husky/pre-commit`** - Automatically runs `lint-staged` before every commit:

- Runs `eslint --fix` and `prettier --write` on staged `.ts`, `.tsx`, `.js`, `.jsx` files
- Runs `prettier --write` on staged `.json`, `.md` files
- **Commits WILL FAIL if formatting/linting fails**

## Code Style & Formatting

**Enforced via Prettier (`.prettierrc.json`):**

- 2-space indentation, single quotes, trailing commas
- 100 character print width
- Semicolons required
- Arrow functions without parens for single args

**ESLint Configuration (`.eslintrc.json`):**

- TypeScript recommended rules
- Prettier integration (errors on formatting violations)
- Max 100 warnings allowed in CI
- Test files have relaxed rules (no-console allowed, any types permitted)

**Code Style Requirements:**

- Descriptive function/variable names
- Explicit types for public APIs
- Prefer early returns and minimal nesting
- NO `any` types in production code (use precise TypeScript types)
- DRY principle: Don't inline type definitions/schemas; move to separate locations if reused

## Project Architecture

### Directory Structure

```
src/
├── server/              # MCP server registration (main.ts, tools.ts, *-tools.ts)
│   ├── main.ts         # Entry point: MCP server bootstrap, prompt registration
│   ├── tools.ts        # Master tool registrar (imports all *-tools.ts)
│   └── *-tools.ts      # Tool registration modules (persistence, session, spaced-repetition, analytics, content)
├── services/           # Business logic with transactional persistence
│   ├── sessions.ts     # Session lifecycle management
│   ├── chunks.ts       # Chunk CRUD operations
│   ├── topics.ts       # Topic operations
│   └── topic-creation.ts # Topic creation helpers
├── tools/              # Pure calculation engines (no DB dependencies)
│   ├── sr-calculator.ts       # Core SM-2 algorithm implementations
│   ├── recommendation-engine.ts # Learning recommendation logic
│   ├── session-manager.ts     # Session analytics
│   └── conversation-manager.ts # Conversational guidance
├── db/                 # SQLite setup (Drizzle ORM)
│   ├── schema.ts       # Drizzle table definitions (5 tables: learning_topics, learning_chunks, review_schedule, learning_sessions, session_chunks)
│   ├── client.ts       # Database connection singleton
│   ├── operations.ts   # Low-level CRUD helpers
│   └── migrate.ts      # Schema migrations and data import
├── prompts/            # MCP prompt pack definitions (prompt-pack.ts)
├── types/              # Zod schemas and shared types for tool inputs/outputs
├── config/             # Configuration (algorithm.ts - all SM_* env vars)
└── utils/              # Logger and helper utilities

tests/                  # Mirror structure of src/ for tests
```

### Key Files

- **Entry Point:** `src/server/main.ts` (boots MCP server, registers tools/prompts)
- **Tool Registration:** `src/server/tools.ts` (imports all tool registrars)
- **Algorithm Config:** `src/config/algorithm.ts` (all SM\_\* environment variables with defaults)
- **Database Schema:** `src/db/schema.ts` (5 tables defined with Drizzle)
- **Migration:** `src/db/migrate.ts` (creates schema, imports seed data)

### Configuration Files

- `package.json` - Scripts, dependencies, engines (Node 20+)
- `tsconfig.json` - TypeScript config (ES2022 target, Node module resolution, dist/ output)
- `.eslintrc.json` - ESLint rules (max 100 warnings)
- `.prettierrc.json` - Code formatting rules
- `.editorconfig` - Cross-editor consistency (2-space indent, LF line endings)
- `.gitignore` - Excludes dist/, node_modules/, coverage/, \*.db files, test-artifacts/

## Environment Variables

**Database:**

- `SM_DB_PATH` - Path to SQLite database (default: `./second-memory.db`)
- `MIGRATE_SOURCE` - Path to JSON import file for `pnpm run db:migrate`

**Spaced Repetition Algorithm (all prefixed with `SM_`):**

- `SM_MIN_EASE_FACTOR` (default: 1.3) - Minimum ease factor floor
- `SM_INITIAL_INTERVAL_DAYS` (default: 1) - First review interval
- `SM_SECOND_INTERVAL_DAYS` (default: 6) - Second review interval
- `SM_EASE_DELTA_GOOD` (default: 0.1) - Ease increase for quality ≥4
- `SM_EASE_PENALTY_FAILURE` (default: -0.2) - Ease penalty for failures
- `SM_LEECH_CONSEC_FAILS` (default: 3) - Consecutive failures for leech status
- `SM_DAILY_CAP_REVIEWS` (default: 200) - Max reviews per day
- Full list in `src/config/algorithm.ts` (20+ configurable parameters)

**Test/Debug:**

- `DEBUG` - Enables verbose logging in utils/logger.ts
- `NODE_ENV` - Set to 'test' for test environment
- `VITEST` - Set by Vitest during test runs
- `FORCE_SQLITE_TESTS` - Forces SQLite tests to run (set in CI)

## Testing

**Test Framework:** Vitest with coverage via @vitest/coverage-v8

**Test Organization:** Mirror src/ structure in tests/ directory

- `tests/tools/` - Pure function tests (sr-calculator, recommendation-engine, etc.)
- `tests/services/` - Business logic tests with database mocking
- `tests/integration/` - End-to-end MCP server tests
- `tests/server/` - Tool registration and validation tests
- `tests/db/` - Database migration and operation tests

**Critical Test Setup (vitest.setup.ts):**

- ALWAYS uses unique temp database per test run: `tmp-test-${uuid}.db`
- NEVER touches production database (`second-memory.db`)
- Cleanup script automatically removes temp files after tests

**Test Coverage Thresholds:**

- Algorithm functions require comprehensive coverage
- Test edge cases, invalid inputs, boundary conditions
- Current coverage: ~68% overall (68% statements, 75% branches)

## Documentation

**Key Documentation Files:**

- `README.md` - Main documentation (getting started, usage examples, architecture)
- `AGENTS.md` - Guidance for Claude Code agent (detailed patterns, workflows)
- `docs/MIGRATION_GUIDE.md` - Database migration and seeding instructions
- `docs/tools/` - Specific tool documentation (session-management.md, what-to-learn-today.md)

## Best Practices

1. **Always run type-check before building** to catch type errors early
2. **Run tests frequently** during development (takes only ~8 seconds)
3. **Use lint:fix and format** before committing to pass pre-commit hooks
4. **Follow existing TypeScript patterns** in similar files (see src/tools/ for pure functions, src/services/ for DB logic)
5. **Update tests alongside code changes** - test files mirror src/ structure
6. **Database changes require migration updates** in src/db/migrate.ts
7. **All tool schemas use Zod** - define in src/types/ if reused
8. **Trust these instructions** - only search codebase if information is incomplete or incorrect
