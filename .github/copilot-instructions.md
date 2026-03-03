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

1. **"pnpm: command not found"** -> Run `npm install -g pnpm` first
2. **Test database conflicts** -> Tests automatically create temp databases (tmp-test-\*.db). Cleanup script runs after tests.
3. **better-sqlite3 binding errors** -> Reinstall: `pnpm rebuild better-sqlite3`
4. **Migration script fails** -> Ensure empty JSON file exists: `echo '{}' > /tmp/empty.json && MIGRATE_SOURCE=/tmp/empty.json pnpm run db:migrate`
5. **TypeScript version warning in lint** -> Safe to ignore. Project uses TypeScript 5.9.2; ESLint supports <5.6.0

## CI/CD Workflows

### GitHub Actions (runs on all PRs to `develop` branch)

**`.github/workflows/ci.yml`** - Main CI pipeline:

1. Setup Node.js 20.x and pnpm
2. Install system dependencies for SQLite (build-essential, python3, libsqlite3-dev)
3. Rebuild better-sqlite3 with native bindings
4. Install dependencies with `--frozen-lockfile`
5. Verify SQLite bindings with test script
6. Run lint -> type-check -> build -> test (with coverage upload to codecov)

**`.github/workflows/code-quality.yml`** - Format and quality checks:

1. Setup Node.js 20 and pnpm
2. Install dependencies
3. Run format:check -> lint -> type-check -> test

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

### Directory Structure (Hexagonal / Ports-and-Adapters)

```
src/
├── transport/          # MCP SDK bootstrap, STDIO transport (process lifecycle only)
├── server/             # MCP tool registration — parse -> delegate -> format
│   ├── tools.ts        # Master tool registrar (imports all *-tools.ts)
│   └── *-tools.ts      # Tool registration modules (persistence, session, spaced-repetition, analytics, content)
├── orchestration/      # Use-case workflows composing domain logic + port calls
├── domain/             # Pure computation — zero I/O
│   ├── algorithms/     # SR calculator, dependency resolver, content similarity
│   ├── services/       # Recommendation engine, prerequisite validator, analytics
│   ├── types/          # Shared type definitions and Zod schemas
│   └── config/         # Algorithm configuration (SM_* env vars with defaults)
├── ports/              # Interface definitions (8 port interfaces)
├── adapters/drizzle/   # Concrete Drizzle implementations of ports
├── infrastructure/     # Database client, schema, migrations, logger
│   └── db/             # SQLite setup (Drizzle ORM): schema.ts, client.ts, operations.ts, migrate.ts
├── shared/             # Cross-cutting utilities, constants, prompts
│   └── prompts/        # MCP prompt pack definitions (prompt-pack.ts)
├── config/             # Runtime configuration
└── composition-root.ts # Wires adapters -> ports -> orchestration -> server
```

### Key Files

- **Entry Point:** `src/transport/main.ts` (boots MCP server, initializes DB, invokes composition root)
- **Composition Root:** `src/composition-root.ts` (sole module importing concrete adapter classes)
- **Tool Registration:** `src/server/tools.ts` (imports all tool registrars with pre-wired AppContext)
- **Algorithm Config:** `src/domain/config/algorithm.ts` (all SM\_\* environment variables with defaults)
- **Database Schema:** `src/infrastructure/db/schema.ts` (tables defined with Drizzle)
- **Migration:** `src/infrastructure/db/migrate.ts` (creates schema, imports seed data)

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
- `SM_EASE_DELTA_GOOD` (default: 0.1) - Ease increase for quality >= 4
- `SM_EASE_PENALTY_FAILURE` (default: -0.2) - Ease penalty for failures
- `SM_LEECH_CONSEC_FAILS` (default: 3) - Consecutive failures for leech status
- `SM_DAILY_CAP_REVIEWS` (default: 200) - Max reviews per day
- Full list in `src/domain/config/algorithm.ts` (20+ configurable parameters)

**Test/Debug:**

- `DEBUG` - Enables verbose logging in `src/shared/logger.ts`
- `NODE_ENV` - Set to 'test' for test environment
- `VITEST` - Set by Vitest during test runs
- `FORCE_SQLITE_TESTS` - Forces SQLite tests to run (set in CI)

## Testing

**Test Framework:** Vitest with coverage via @vitest/coverage-v8

**Test Organization:**

```
tests/
├── unit/
│   ├── domain/         # Pure function tests — no mocks, no I/O
│   ├── orchestration/  # In-memory port substitutes, no DB
│   └── server/         # Verify parse -> delegate -> format
├── integration/
│   ├── db/             # Database client, schema, migration tests
│   └── workflows/      # Full stack with test DB
├── helpers/            # In-memory adapters, fixtures, DB setup
└── performance/        # Performance benchmarks
```

**Critical Test Setup (vitest.setup.ts):**

- ALWAYS uses unique temp database per test run: `tmp-test-${uuid}.db`
- NEVER touches production database (`second-memory.db`)
- Cleanup script automatically removes temp files after tests

**Test Coverage Thresholds:**

- Algorithm functions require comprehensive coverage
- Test edge cases, invalid inputs, boundary conditions

## Documentation

**Key Documentation Files:**

- `README.md` - Main documentation (getting started, usage examples, architecture)
- `CLAUDE.md` - Guidance for Claude Code agent (architecture, conventions, error handling)

## Best Practices

1. **Always run type-check before building** to catch type errors early
2. **Run tests frequently** during development (takes only ~8 seconds)
3. **Use lint:fix and format** before committing to pass pre-commit hooks
4. **Follow hexagonal architecture** - domain has zero I/O, orchestration uses ports, only composition root imports adapters
5. **Update tests alongside code changes** - test files organized by layer under tests/
6. **Database changes require migration updates** in src/infrastructure/db/migrate.ts
7. **All tool schemas use Zod** - define in src/domain/types/ if reused
8. **Trust these instructions** - only search codebase if information is incomplete or incorrect
