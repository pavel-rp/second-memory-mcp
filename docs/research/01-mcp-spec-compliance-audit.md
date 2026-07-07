# Research Prompt 01 — MCP Spec & Guidelines Compliance Audit

> **How to run:** Give this entire file as the prompt to a Claude Code session (Sonnet) running inside `B:\Projects\second-memory`, with web access enabled.
> **Output:** Write your full report to `docs/research/results/01-mcp-spec-compliance-audit.md`. Do not edit any source files.

## Role

You are auditing an MCP server implementation against the **current** Model Context Protocol specification and official best-practice guidance. Today is July 2026 — first establish what the latest spec revision actually is (check https://modelcontextprotocol.io/specification and the `modelcontextprotocol/modelcontextprotocol` GitHub repo changelog); do not assume your training data is current.

## Context: what a prior recon already established (verify spot-checks, don't redo)

The repo is a TypeScript MCP server (`@modelcontextprotocol/sdk` ^1.27.1) for spaced-repetition learning. Recon findings you can build on:

- 45 tools via `server.registerTool()` (see `src/server/tools.ts` + 16 registrar modules). All have `title`; **none** have `annotations` (readOnlyHint/destructiveHint/idempotentHint/openWorldHint); **none** have `outputSchema`/`structuredContent` — every result is `{content:[{type:'text', text: JSON.stringify(...)}]}`.
- App-level error helper `toolError()` (`src/server/tool-helpers.ts`) returns a `{status:'error', ...}` JSON envelope **without** `isError: true`. Meanwhile uncaught exceptions produce SDK-shaped `isError:true` plain-text results, and `src/transport/context-token-middleware.ts` produces a third shape with `isError:true`. Three inconsistent error envelopes.
- Capabilities are implicit (SDK auto-registers tools/prompts with `listChanged:true`, never actually sent). `instructions` is set (~8KB, `src/shared/instructions.ts`). 3 prompts registered with Zod argsSchema; **no completions**, **no resources at all**, no sampling/elicitation/roots/progress/cancellation/pagination/MCP-logging (pino → stderr only).
- Transports: stdio + `StreamableHTTPServerTransport` (stateful, `sessionIdGenerator: randomUUID`, transports kept in an in-memory Map, **no eventStore/resumability**). Express app via SDK `createMcpExpressApp({host})` — DNS-rebinding protection only via default localhost validation; **no `allowedHosts` configured**; binding to 0.0.0.0 only logs a warning. Custom CORS middleware in `src/transport/http.ts`.
- Auth: OAuth 2.1 resource server — `jose` JWT verify against issuer JWKS (`src/transport/jwt-middleware.ts`), RFC 9728 PRM at `/.well-known/oauth-protected-resource/mcp`, `WWW-Authenticate` with `resource_metadata` on 401, session-to-subject binding with 403 on mismatch. **`aud` validated only if `AUTH_AUDIENCE` set; no scope enforcement anywhere.**
- **Single-tenant**: no `user_id`/owner column on any table (`src/infrastructure/db/schema.ts`); all authenticated users share one dataset.
- Public unauthenticated `GET /health` and `GET /version` (exposes exact version + build time).

## Tasks

1. **Spec baseline.** Identify the latest spec revision and enumerate all normative requirements (MUST/SHOULD) relevant to: tool definitions, tool results & `isError` semantics, structured output, annotations, prompts, resources, pagination, logging, transports (Streamable HTTP session lifecycle, security requirements), and authorization (OAuth RS obligations — audience binding / RFC 8707 resource indicators, token validation MUSTs).
2. **Compliance matrix.** For each area, grade this repo: **Compliant / Partial / Non-compliant / N-A**, citing spec section + repo file:line. Pay special attention to:
   - `isError` semantics — does the spec require execution errors to set `isError:true`? Is the app's envelope pattern spec-conformant or merely tolerated?
   - Whether `aud` validation is a MUST for resource servers in the current authorization spec (token audience binding / confused-deputy guidance), and whether missing scope enforcement violates anything normative.
   - Streamable HTTP security guidance: Origin validation, session hijacking protections, whether unauthenticated health/version endpoints matter.
   - Whether advertising `listChanged` without ever emitting it is conformant.
3. **Best-practice guidance.** Beyond the spec: collect Anthropic's and modelcontextprotocol.io's published server best-practices (tool naming, tool count/description budgets for client context windows, annotations usage, when to use resources vs tools, structured output adoption). 45 tools is a lot — find any published guidance on tool-count impact on client tool-selection accuracy and whether consolidation is recommended.
4. **Directory/registry requirements.** What are the current listing requirements for (a) the official MCP Registry and (b) Anthropic's connector directory for Claude (and ChatGPT connectors if MCP-compatible)? List every requirement this server does not yet meet (e.g. multi-tenancy, privacy policy, remote availability, annotations, OAuth specifics like Dynamic Client Registration support).

## Output format

Markdown report: (1) spec revision identified + changelog since 2025-06-18 in two paragraphs; (2) compliance matrix table; (3) prioritized gap list — each gap with severity (blocker/should-fix/nice-to-have), spec/guidance citation (URL + section), affected files, and a one-paragraph fix sketch; (4) directory-listing readiness checklist. Cite every claim — if you cannot verify a requirement in an official source, mark it **UNVERIFIED** rather than asserting it.
