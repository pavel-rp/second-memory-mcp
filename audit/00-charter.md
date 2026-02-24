# Audit Charter

## Project

Second Memory Learning — an MCP server implementing AI-powered spaced repetition.

## Declared Stack

| Layer           | Technology                      | package.json specifier / resolved |
| --------------- | ------------------------------- | --------------------------------- |
| Runtime         | Node.js                         | ≥ 20 (CI: 20.x; audited on 22.x)  |
| Language        | TypeScript (ES modules)         | ^5.5.0 (resolved 5.5.x)           |
| MCP Framework   | @modelcontextprotocol/sdk       | ^1.0.0 (resolved 1.18.2)          |
| Database        | SQLite via better-sqlite3       | 12.4.1                            |
| ORM             | Drizzle ORM                     | 0.44.7                            |
| Validation      | Zod                             | ^3.23.8 (resolved 3.25.76)        |
| Test Runner     | Vitest + @vitest/coverage-v8    | ^2.0.0                            |
| Linting         | ESLint 8 + @typescript-eslint 7 | 8.57 / 7.x                        |
| Formatting      | Prettier                        | ^3.2.5                            |
| Package Manager | pnpm (workspace)                | latest                            |
| CI              | GitHub Actions                  | Node 20.x matrix                  |
| Pre-commit      | Husky + lint-staged             | 9.x / 15.x                        |

## Scope

Full-stack best-practices audit covering framework patterns, dependency management,
configuration, async/concurrency, and security.
