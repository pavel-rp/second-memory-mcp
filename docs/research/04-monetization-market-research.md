# Research Prompt 04 — Monetization Market Research

> **How to run:** Give this entire file as the prompt to a Claude Code session (Sonnet) with web access. No repo access needed.
> **Output:** Write your full report to `docs/research/results/04-monetization-market-research.md`. Do not edit any source files.

## Role

You are doing market research to ground a monetization strategy for `second-memory`: an open-source (MIT) MCP server that turns any MCP-capable AI client (Claude, ChatGPT, Cursor, …) into a personal tutor with spaced repetition, a prerequisite knowledge graph, and persistent learner memory. It already runs as a remote server (Streamable HTTP + OAuth 2.1 RS). Key economics: the **client's** LLM does all the teaching — the operator pays only for Postgres + a Node process, near-zero marginal inference cost. Currently single-user; multi-tenancy is planned. Today is July 2026 — verify market facts against live sources and date-stamp pricing claims.

## Research tasks

### A. MCP/connector monetization landscape (mid-2026)
1. Which commercial/paid remote MCP servers or Claude/ChatGPT connectors exist today? Find 5–10 concrete examples with their business model (subscription, usage, freemium, bundled-with-SaaS) and, where discoverable, traction signals.
2. Anthropic connectors directory & official MCP Registry: current listing requirements, review process, whether any payment/billing rails are offered to server developers, discovery volume (any public data on directory traffic/installs).
3. OpenAI ChatGPT apps/connectors: does ChatGPT support third-party MCP servers for consumers in 2026, and is there a revenue-share or app-store-like model?
4. Agent-native payment rails: state of Stripe's agentic-commerce tooling, x402/HTTP-402 micropayments, any MCP payments extension — production-ready or experimental? Any MCP server actually charging per tool call?
5. Platform risk scan: have Anthropic/OpenAI shipped (or announced) first-party "learning mode"/memory/tutor features that overlap (e.g. ChatGPT Study Mode, Claude learning features, Projects memory)? How does first-party overlap usually play out for connector devs?

### B. Spaced-repetition & AI-tutoring market
6. Pricing and positioning table for: Anki (+AnkiHub/AnkiPro/AnkiWeb ecosystem), RemNote, SuperMemo, Quizlet (Q-Chat), Mochi, Traverse, Duolingo (Max), Speak, Synthesis Tutor, Khanmigo, and any notable AI-tutor startups (2024–2026 vintage). Include free-tier limits and paid tiers.
7. What do we know about willingness to pay and retention in the SRS niche (Anki's user base size, share who pay for anything, AnkiHub subscription uptake, medical-student segment economics)?
8. Are there products specifically selling "AI tutor that remembers you across sessions / builds a knowledge graph of you"? Who's closest to this positioning?

### C. B2B learning angle
9. Corporate L&D / onboarding / compliance-training SaaS: typical per-seat pricing (Docebo, 360Learning, WorkRamp, Sana, Arist, Seven / AI-native entrants), and evidence of demand for "learning inside the tools you already use" (Slack/Teams/copilot-embedded learning).
10. Any companies selling learning/memory infrastructure as an API (SR-as-a-service, knowledge-tracing APIs)? Pricing models?

### D. Open-core precedents
11. For solo/small OSS infra projects that added a paid cloud (n8n, Cal.com, Plausible, Umami, Outline, Typebot…): what conversion patterns, pricing, and license strategies (MIT vs AGPL vs fair-source) worked at small scale? Any cautionary tales of clouds that flopped while OSS thrived?

## Output format

Markdown report: (1) executive summary — the 5 facts most decision-relevant for this project; (2) sections A–D with findings and inline source URLs; (3) a pricing landscape table; (4) a final section "Implications" — given the evidence, score each candidate model (consumer hosted SaaS, B2B teams, open-core cloud, learning-infra API, content marketplace, per-call micropayments) on demand evidence, achievable pricing, competition, and platform risk, 1–5 each, with a one-paragraph justification. Date-stamp all pricing. Mark anything unverifiable as **UNVERIFIED**.
