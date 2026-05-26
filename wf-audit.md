# Audit Rules — second-memory-mcp

Project-specific rules for the diff-auditor. Referenced from `wf.config.js` via `auditRules`.

---

## Happy-Path Blindness (50% of all findings)

These three patterns alone caused half of all reviewer findings across 11 PRs. Check these first.

1. **Check every `ServiceResult` / return value from persistence calls.** `await deps.foo.update(...)` on a line by itself is almost always a bug. If the function returns a result/error/status type, the return value must be checked. Silent failures corrupt data.

2. **Guard every `.find()`, array access, and optional field.** `.find()` can return `undefined`. `array[0]` without length check crashes on empty. Optional fields need `if` guards or `??` defaults before use.

3. **Validate external data at runtime before casting.** JSONB columns, JWT payloads, OIDC metadata, API responses — never cast to a typed interface without Zod `.parse()` or equivalent runtime validation.

## Error Handling (20% of all findings)

4. **Zod `.parse()` must be inside try/catch.** Placing `Schema.parse(input)` before the try/catch block means validation errors bypass structured error handling and surface as untyped exceptions.

5. **Orchestration functions must return result objects for expected business failures — never throw.** Throwing causes the server layer's blanket catch to mark deterministic errors ("not found", "already exists", "wrong status") as `retryable: true`. Use `{ status: 'error', message }` for expected failures. Only throw for unexpected/infrastructure errors. Match the pattern used by sibling functions in the same file.

## Consistency (13% of all findings)

6. **MCP tool responses must use snake_case keys.** All tool result payloads pass through `toSnakeCase()` before serialization. New tools returning camelCase break API consistency.

7. **Derived values must use consistent computation across all locations.** If `quality` uses `Math.round()`, then `passed` must derive from the rounded value — not the raw input. Any time the same logical value appears in multiple places (response object, DB write, synthetic record), verify they all use the same derivation chain.

8. **Entity types must use narrow literal unions matching DB constraints.** If the DB has `CHECK(status IN ('pending', 'answered', 'skipped'))`, the entity type must be `'pending' | 'answered' | 'skipped'`, not `string`. If `attempt_number` is CHECK'd to `(1, 2)`, the type must be `1 | 2`, not `number`. Adapter code must cast Drizzle results to narrow types.

## Queries & Schema (6% of all findings, but high severity)

9. **Every Drizzle query returning a list must include ORDER BY with a deterministic tie-breaker.** If the consumer iterates or indexes into results, nondeterministic ordering is a bug. Always include a tie-breaker column (e.g., `id` or `created_at`).

10. **DB constraints must mirror application-level invariants.** If orchestration enforces "max 2 attempts per question", the schema must have `CHECK(attempt_number IN (1, 2))` and `UNIQUE(session_question_id, attempt_number)`. Never rely on application logic alone — concurrent requests bypass it.

11. **Creation operations must reject duplicates.** If `createX()` is called twice with the same parent ID, the second call must error — not silently create duplicates. Check for existing records before inserting. Pair with a DB unique constraint.

## Guards & Backward Compatibility

12. **Mutation functions must validate all preconditions before executing.** Before recording an attempt: check `question.status === 'pending'` and `chunk.status === 'in_progress'`. Guards must cover all entry points, not just the primary flow. Return an error result when preconditions fail.
13. **Backward-compatible completion paths must produce equivalent output.** When a new flow supplements a legacy flow, the new flow must write the same data structures legacy consumers read. If `buildCompleteResponse()` reads `attemptsJson`, the new flow must write a compatible `attemptsJson` entry.

14. **Comments must match code behavior exactly.** "Selects the quality from the last attempt" when the code uses `.find()` (which returns the first match) is a reviewer magnet. When modifying behavior, update adjacent comments in the same commit.

## Architecture Layer Purity

15. **`src/domain/**`must stay pure — zero I/O, zero logging.** Files under`src/domain/`must not import from`src/shared/logger`, `src/infrastructure/**`, `src/adapters/**`, `src/transport/**`, or `src/server/**`. They must not call `Date.now()`, `new Date()`(use injected clock instead),`crypto.randomUUID()`, `process.env._`, `fetch`, filesystem APIs, or any Drizzle/DB helper. When a domain function needs to notify callers about internal events (rule exceptions, metric emissions), expose an optional callback via an options parameter (e.g. `{ onRuleError?: (name, err) => void }`) so the orchestration/server layer plumbs in the logger — not the domain module itself. Quick check: `grep -rE "from._(shared/logger|infrastructure|adapters|transport|server)" src/domain/` should return zero hits.

## Performance & Testing

16. **Independent async operations must run in parallel.** `await a(); await b();` where `a` and `b` are independent should be `await Promise.all([a(), b()])`.

17. **Tests must use injected clock, never `Date.now()` or `new Date()`.** The project has a clock injection pattern. Tests creating `Date.now()` timestamps introduce flaky timing dependencies.
