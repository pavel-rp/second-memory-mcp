# Agents Guide

MCP server for AI-powered spaced repetition learning. TypeScript, Node.js 20+, SQLite via Drizzle ORM.

## File Organization (Hexagonal Architecture)

```
src/
├── transport/          # MCP SDK bootstrap, STDIO transport
├── server/             # MCP tool registration (parse → delegate → format)
├── orchestration/      # Use-case workflows composing domain + ports
├── domain/             # Pure computation — zero I/O
│   ├── algorithms/     # SR calculator, dependency resolver, content similarity
│   ├── services/       # Recommendation engine, analytics, validators
│   ├── types/          # Shared type definitions and Zod schemas
│   └── config/         # Algorithm configuration
├── ports/              # Interface definitions (8 port interfaces)
├── adapters/drizzle/   # Concrete Drizzle implementations of ports
├── infrastructure/     # DB client, schema, migrations, logger
├── shared/             # Constants, prompts, cross-cutting utilities
└── composition-root.ts # Wires adapters → ports → orchestration → server
```

Tests: `tests/unit/` (pure logic), `tests/integration/` (DB-backed), `tests/helpers/`, `tests/performance/`.

## Naming Conventions

- **MCP tool schemas** (`src/domain/types/spaced-repetition-tools.ts`): snake_case (`ease_factor`, `next_review_date`). Other tool schemas use camelCase — follow existing style per schema.
- **Internal types/logic** (`src/domain/types/sr.ts`, `src/domain/algorithms/`): camelCase.
- **Conversion** in `src/server/spaced-repetition-tools.ts`: maps snake_case ↔ camelCase at the boundary.

## Error Handling

- **Domain** (`src/domain/`): Pure functions, never throw. Return computed values or Result objects.
- **Orchestration** (`src/orchestration/`): Result objects for expected failures; throw for unexpected.
- **Server** (`src/server/*-tools.ts`): try/catch everything. `toolOk()`/`toolJson()` for success, `toolError()` for caught exceptions.
- **Fail-open**: Log to stderr, always return valid MCP responses, never crash.

## Workflow Specs

- Follow spec-workflow from corresponding MCP server when explicitly asked.
- Checkout feature branch from develop before starting. Ask if uncommitted/unsynced changes exist.
- Run all builds, lints, and tests before claiming completion.

## Windows `gh api` Workaround

Backticks break in `-f body=` on Windows bash. Write JSON to `$TEMP/reply.json`, then:

```bash
gh api repos/OWNER/REPO/pulls/PR/comments/ID/replies --input "$TEMP/reply.json"
```

## Commit & PR Conventions

- Concise commit messages: what, not how. No advertising signatures.
- No promotional taglines in PR descriptions.
