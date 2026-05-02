# Agents Guide

MCP server for AI-powered spaced repetition learning. TypeScript, Node.js 20+, Postgres via Drizzle ORM.

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

## Knowledge Discovery

- **MemPalace is the ultimate knowledge base.** Always search MemPalace before investigating from scratch — it contains architecture decisions, implementation history, research findings, issue context, and prior session learnings that may already answer your question.
- Prioritize Sourcebot MCP for fast code lookups.

## Naming Conventions

- **MCP tool schemas** (`src/domain/types/*-tools.ts`, `recommendations.ts`, `session.ts`, `analytics.ts`): snake_case for all field names (`ease_factor`, `next_review_date`, `chunk_id`, `time_spent_ms`).
- **Internal types/logic** (`src/domain/types/` hand-written types, `src/domain/algorithms/`): camelCase.
- **Conversion** in `src/server/*-tools.ts`: maps snake_case ↔ camelCase at the boundary.

## Error Handling

- **Domain** (`src/domain/`): Pure functions, never throw. Return computed values or Result objects.
- **Orchestration** (`src/orchestration/`): Result objects for expected failures; throw for unexpected.
- **Server** (`src/server/*-tools.ts`): try/catch everything. `toolOk()`/`toolJson()` for success, `toolError()` for caught exceptions.
- **Fail-open**: Log to stderr, always return valid MCP responses, never crash.
- **Structured `findings` only flow through `error.type === 'content_quality'`.** The server tool layer (`src/server/topic-tools.ts`) only serializes the `findings` array on `content_quality` errors; any other error type silently drops them. If you need to surface per-item structured failure data (chunk id, field, score, rationale), use `content_quality` — not `validation`.

## Drizzle Migrations

- `drizzle/meta/_journal.json` `when` timestamps **must be monotonically increasing** with `idx`. Drizzle's migrator uses `when` (not `idx` or filename prefix) to determine applied vs. pending status. Out-of-order timestamps cause migrations to be **silently skipped** with no error.
- When inserting manual migrations or reordering entries in `_journal.json`, always set `when` to be strictly greater than the previous entry's `when`.
- If bumping an existing entry to a higher `idx`, update its `when` to be after the new predecessor's.
- After any `_journal.json` edit, verify monotonicity: `jq '[.entries[] | .when] | . as $ws | [range(1; length) | select($ws[.] <= $ws[. - 1])] | if length == 0 then "OK" else "BAD at indices: \(.)" end' drizzle/meta/_journal.json`

## Workflow Specs

- Follow spec-workflow from corresponding MCP server when explicitly asked.
- Checkout feature branch from develop before starting. Ask if uncommitted/unsynced changes exist.
- Run all builds, lints, and tests before claiming completion.

## GitHub PR Comment Replies

The endpoint **must** include the PR number — without it you get a 404:

```bash
gh api --method POST "repos/OWNER/REPO/pulls/{PR_NUMBER}/comments/{COMMENT_ID}/replies" -f body="message"
```

On Windows bash, backticks break in `-f body=`. For complex bodies write JSON to `.tmp/reply.json`, then:

```bash
gh api --method POST "repos/OWNER/REPO/pulls/{PR_NUMBER}/comments/{COMMENT_ID}/replies" --input ".tmp/reply.json"
```

## Commit & PR Conventions

- Concise commit messages: what, not how. No advertising signatures.
- No promotional taglines in PR descriptions.

## Test Authoring Rules

- Never `as any` — build properly typed fixtures or use `Partial<T>`.
- Assert on structured data (return fields, objects), not on formatted message strings.
- Don't import types you don't use.
- Keep PR description accurate — mention all changes (e.g., lint config), not just tests.
- Cover every early-return guard (`undefined`, `""`, `"  "`) — don't assume one nullish test covers all branches.
- **Integration tests are non-negotiable for DB-mutating blocking paths.** If a plan touches rollback (`delete` after a commit), circuit-breakers that query the event log, or any branch that rejects a request _after_ persisting state, a DB-backed `tests/integration/` test is a hard ship-gate — never deferred to a follow-up. Unit tests with stubbed ports cannot prove the rollback actually rolls back, and concurrency races on cached DB queries are invisible to single-process unit tests. If integration-test infra is broken, fix the infra in the same PR; do not skip the test.

## Linear

- **Team**: Neurasphere (key: NEU)
- **Project**: Second Memory MCP

## Bash Commands

- **No piped commands** (`|`). Run each command as a separate Bash call. If you need to process output, save to `.tmp/file` first, then read it in the next call.
- **No output redirections** (`>`, `1>`, `2>`). Run the command, let stdout return the result. If you need to save to a file, use a second Bash call with `echo`.
- **No `cd`** — working directory persists. Use absolute or relative paths.
- **No `cat`/`head`/`tail`** for reading files — use the Read tool.
- **No `jq`** — not available. Use `node -e` with `JSON.parse`.
- **No `python`** — use `node -e` for scripting.
- **No `ls` with glob patterns** for file/folder existence checks — use the Glob tool.
- **No `$?`** or shell variable interpolation in commands — triggers security warnings.

## Package manager

pnpm, not npm.
Use scripts from package.json, don't make up anything.
