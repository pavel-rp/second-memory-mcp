# Research Prompt 02 — New MCP Protocol Features Survey & Applicability Map

> **How to run:** Give this entire file as the prompt to a Claude Code session (Sonnet) with web access. Repo access useful but secondary.
> **Output:** Write your full report to `docs/research/results/02-mcp-new-features-survey.md`. Do not edit any source files.

## Role

You are surveying every MCP protocol capability added or matured since the **2025-03-26** spec revision, as of **July 2026**, and mapping each to concrete opportunities for this server. Check modelcontextprotocol.io, the spec GitHub changelog, the TypeScript SDK release notes (`@modelcontextprotocol/typescript-sdk`), and Anthropic/OpenAI client documentation. Your training data is likely stale — verify everything against live sources.

## Context: the server in one paragraph

`second-memory` is a spaced-repetition learning MCP server (TypeScript, SDK ^1.27.1, stdio + Streamable HTTP with OAuth RS). It exposes 45 snake_case tools (session lifecycle, teaching flow `start_learning`/`teach_next`/`submit_answer`, SM-2 scheduling, knowledge-graph CRUD, hybrid pgvector search, analytics) and 3 prompts. Crucially, the **server generates no LLM output itself**: it returns "teaching instructions" as text and the connected AI client improvises the actual questions, grades answers pass/fail, and reports quality 0–5 back. Tool results are JSON-stringified text (no structured output). No resources, sampling, elicitation, tasks, progress, completions, or resumability are used. It maintains an ~8KB `instructions` field because clients like claude.ai historically dropped it (there's a `get_server_workflow` fallback tool).

## Tasks

For **each** feature below (plus anything newer you discover), report: (a) what it is + spec revision that introduced it; (b) TS SDK support status and minimum SDK version; (c) **client support matrix as of July 2026** — Claude Desktop, claude.ai web, Claude Code, ChatGPT (desktop/web connectors), Cursor, VS Code/Copilot, Gemini/other notable clients; (d) applicability to this server — concrete, named use case or "not applicable, because…".

1. **Structured tool output** (`outputSchema` + `structuredContent`) — including whether clients actually validate/use it.
2. **Tool annotations** (readOnly/destructive/idempotent/openWorld hints) — do any clients change behavior based on them (e.g. auto-approve read-only)?
3. **Elicitation** — including any newer modes (e.g. URL-mode / form-mode). Use case here: server asking the learner a question directly, confirmations for destructive ops (delete_chunk), onboarding.
4. **Sampling** (`sampling/createMessage`) — client support reality check (historically almost none). Use case here: **server-driven question generation and answer grading** via the client's own LLM — this would move pedagogy control server-side at zero inference cost. Assess honestly whether client support makes this viable in 2026.
5. **Tasks / async long-running operations** (2025-11-25 spec, if adopted) — status, client support. Use case: Tier-2 LLM content audits, bulk imports, embedding backfills.
6. **Resources & resource links in tool results** — use case: exposing chunks/topics/analytics as addressable resources instead of fetch-tools; `resource_link` returns from search.
7. **Completions** (argument autocomplete for prompts/resources).
8. **Progress notifications + cancellation** — for bulk operations.
9. **Resumability / event store for Streamable HTTP** — redelivery after disconnect; does any client resume?
10. **`instructions` field handling in 2026** — do claude.ai / ChatGPT connectors now pass server instructions? (This server carries a workaround; is it still needed?)
11. **Icons / server metadata / well-known discovery** (`.well-known/mcp`?), server identity — anything that affects directory listing or client UX.
12. **Extensions framework** (if in spec) — any registered extensions relevant to learning/memory/payments.
13. **Authorization updates** since 2025-06-18 — Dynamic Client Registration expectations, client ID metadata documents, enterprise SSO patterns for remote servers.
14. **Anything else** in spec revisions after 2025-11-25 that a tool-heavy stateful server should know about.

## Output format

(1) A timeline of spec revisions 2025-03-26 → latest with one-line summaries; (2) a feature table (feature × spec version × SDK support × client support × applicability verdict); (3) a "top 5 opportunities for this server" section — each with expected user-visible benefit, client-support risk, and rough implementation surface (which layers of `src/` it touches: transport/server/orchestration); (4) a "not worth it yet" list with reasons. Mark any claim you could not verify against a live source as **UNVERIFIED**.
