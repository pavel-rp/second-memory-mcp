# Synthesis — Repo Assessment & Monetization Strategy

**Date:** 2026-07-07. Synthesized from the four research reports in `docs/research/results/` (01 spec compliance, 02 protocol features, 03 pedagogy evidence, 04 monetization market) plus direct code recon. Each claim below traces to a report section.

---

## Verdicts on the three original questions

**Does it follow MCP server guidelines?** Mostly, with three genuine spec violations (MUSTs in the current 2025-11-25 spec): missing token-audience validation when `AUTH_AUDIENCE` is unset (auth spec MUST), no `Origin` header validation on Streamable HTTP (transport MUST + MUST-403), and business-logic errors never setting `isError: true` (tools error-handling requirement, clarified by SEP-1303). Plus two MUST-level gaps that are deployment-dependent: rate limiting and access control (no scopes, no tenancy). Everything else graded Compliant or N/A. (Report 01 §2–3.)

**Is it pedagogically correct?** Grade **C+** — real evidence-aligned foundations (retrieval practice core, retrievability-tiered instruction, retry-with-hint, leech flagging), but two mechanisms are flatly contradicted by the literature (prerequisite mastery = one successful review ever; lapse = full reset to 1 day regardless of history), the LLM-self-grading reliability problem is only narrowly mitigated, and the system has **no closed loop** — it cannot tell whether it is working. (Report 03 §1.)

**New MCP features it should adopt?** Fewer than expected. The evidence inverted my first-pass: **sampling is deprecated** in the 2026-07-28 RC (and only VS Code supports it today) — the server-driven-teaching-via-client-LLM idea is dead on that rail. **Structured output** has no confirmed consumer in any first-party client — skip. **Tool annotations** don't change client behavior (only VS Code consumes them) but are **required for directory listings** — add them for distribution, not runtime. The real wins are unglamorous: restructure the 8KB `instructions` (truncated at 2KB in Claude Code, ~512 chars useful in ChatGPT), form-mode elicitation for destructive ops, progress notifications on long calls, `_meta["anthropic/requiresUserInteraction"]` on `delete_chunk`. (Report 02 §2–4.)

---

## Corrections to the first-pass assessment

| First-pass call | Evidence verdict | Source |
|---|---|---|
| Structured output = "cheap, high-value" | No client consumes it; skip until adoption data exists | 02 §2.1, §4 |
| Sampling = "the strategic one" | Deprecated in 2026-07-28 RC; ~1 client supports it. Use direct provider-API calls server-side instead | 02 §2.4, §4 |
| Annotations = cheap runtime win | Runtime no-op in most clients; mandatory for Anthropic/OpenAI directory listing | 01 §4, 02 §2.2 |
| Instructions workaround "check if still needed" | More needed than ever — 2KB cap documented in Claude Code, and instructions are now load-bearing for its lazy tool-search | 02 §2.10, §3.1 |
| isError inconsistency = "compliance issue" | Confirmed: the app's `toolError()` is the one non-conformant path of the three | 01 §2 row 4–5 |
| Consumer SaaS as recommended wedge | Demoted to #2 — highest platform risk (Claude Learning Mode + Memory already free); **open-core cloud** is the best-evidenced model | 04 Implications |

Also new and load-bearing: the **2026-07-28 spec RC** (final ~3 weeks away) removes protocol sessions, the `initialize` handshake, SSE resumability, and deprecates Roots/Sampling/Logging and OAuth DCR. This server's HTTP transport is built around exactly the session machinery being removed. Not urgent (v1 SDK supported ≥6 months post-v2), but: **stop investing in session-lifecycle code**, and note the existing `context_token`-as-tool-argument pattern is already the shape the spec is moving toward. (01 §1, 02 §1.)

---

## Monetization strategy

**Chosen model: open-core cloud** — free MIT self-hostable core, paid hosted multi-tenant service. Best demand evidence (Plausible: 19K self-reported paying subscribers on the same "hosted convenience over free core" shape), healthy comp pricing ($9–50/mo across Plausible/Umami/n8n/Typebot), no direct competitor, and the safest platform-risk profile because the value sold is hosting + the user's accumulated graph, not a chat feature a model vendor can clone. (04 Implications §3.)

**Consumer positioning on top of the cloud** at $8–15/mo freemium (bracketed by AnkiHub $6–10, RemNote $8–18, Duolingo Max ~$14/mo-equivalent). The surviving differentiator vs. free first-party features (Claude Learning Mode, Claude Memory) is narrow but real: **explicit SR scheduling + a queryable knowledge graph + portability across clients** — Claude Memory is explicitly claude.ai-app-only and does not apply to API access or Claude Code. "Your learning state follows you across Claude, ChatGPT, and Cursor" is the pitch a platform vendor structurally can't match. (04 A5, B8.)

**Rejected/deferred models:** learning-infra API and content marketplace fail the demand gate (no proven buyer anywhere; Anki's ecosystem has actively rejected creator payments); per-call micropayments are a product-shape mismatch (a tutor is a relationship, not a metered call); B2B teams is deferred, not dead — Haekka ($1–2/employee/mo, Slack-native compliance training) proves "learning inside tools you already use" is a paid category, but Microsoft is bundling a free Learning Agent into Copilot, so enter B2B later with the analytics dashboard as the differentiated surface. (04 Implications.)

**The license decision (must be made before any cloud launch):** MIT alone provides zero legal barrier to someone cloning the hosted service. The two proven small-operator playbooks: (a) Plausible — AGPL + deliberate feature-gating of cloud-only features; (b) n8n/Outline/Typebot — fair-source license with anti-competing-hosting clause. Cal.com's April 2026 closed-sourcing shows even funded players retreat from open-core; Locust Cloud and Sandstorm Oasis show bolted-on clouds can quietly die while the OSS thrives. Recommendation: keep the existing repo MIT (community trust, top-of-funnel), build the cloud's tenant/billing/dashboard layer as a **separate private repo** — Plausible's pattern without the license migration drama. (04 D, Implications §3.)

**Distribution reality check:**
- **Official MCP Registry** — easiest listing; blocked only by `"private": true` in package.json and namespace verification. Process work, do early.
- **Anthropic Connectors Directory** — requires: privacy policy (missing = immediate reject), `title` + `readOnlyHint`/`destructiveHint` on every tool (currently 0/45), public HTTPS reachability, per-user data isolation (structurally required by its OAuth model), and submission via a **Team/Enterprise org** — an individual account cannot submit. No payment rails offered.
- **ChatGPT apps** — consumer reach possible post-review (Free/Plus/Pro users outside EEA/CH/UK); digital-goods monetization not yet approved, so billing must run through external checkout regardless.
- **No MCP-native payment rail exists** (SEP-2007 still draft; didn't make the RC). Subscriptions via ordinary web checkout (e.g. Stripe) remain the only sane billing path. (04 A2–A4, 01 §5.)

---

## Unified roadmap

Ordering principle: compliance blockers and trivial pedagogy fixes first (they're small and everything downstream inherits them); then measurement (it validates every later change and becomes the future paid dashboard); then tenancy + distribution (the monetization gate); then the deep pedagogy work.

### Phase 0 — Hardening & trivial wins (days)
| Item | What | Source |
|---|---|---|
| 0.1 | Make `AUTH_AUDIENCE` required; always pass `audience` to `jwtVerify` | 01 B1 |
| 0.2 | Origin-validation middleware, 403 on invalid Origin, `ALLOWED_HOSTS` env → `createMcpExpressApp` | 01 B2, S3 |
| 0.3 | Add `isError: true` to `toolError()`; delete dead `toolOk`/`toolJson` | 01 B3 |
| 0.4 | Assessment quality mapping: pass→4, fail→2 (two constants) | 03 Q2 |
| 0.5 | Interval fuzz (Anki-style few-percent randomization) | 03 Q8 |
| 0.6 | Prereq mastery: gate on existing retrievability R≥0.7 instead of `repetitions > 0` — the cheapest, highest-leverage pedagogy fix in the audit | 03 Q9 |
| 0.7 | Restructure `SERVER_INSTRUCTIONS`: critical workflow rules in first ~1.5–2KB, depth stays in `get_server_workflow` | 02 §3.1 |
| 0.8 | Leech: require minimum total attempts before consecutive-3 fires (or raise to 4); wire or delete `leechFailureThreshold` | 03 Q7 |
| 0.9 | Rate limiting on `POST /mcp` (per-subject) — or document it as delegated to the reverse proxy | 01 S1 |

### Phase 1 — Measurement (the closed loop; 1–2 weeks)
| Item | What | Source |
|---|---|---|
| 1.1 | True retention rate (pass-rate at due time, overall + by tier/interval band) | 03 Q13 |
| 1.2 | Calibration check (RMSE-bins/log-loss of implicit predicted recall vs. observed) | 03 Q13 |
| 1.3 | Correct-answer exposure step after second failed attempt (Pashler: +494% retention from corrective feedback) | 03 Q4 |
| 1.4 | Use `time_spent_ms`: per-session latency+quality trend as fatigue signal; replace hard 90-min cutoff with break prompts; make session/day caps config | 03 Q12, Q13 |
| 1.5 | Wire the cognitive-load model to real signals or delete it; delete dead session-composition config or implement it (see 3.3) | 03 Q13 |

This phase doubles as product: these metrics are the future consumer "is this working for me" screen and the B2B dashboard.

### Phase 2 — Tenancy, distribution, cloud (the monetization gate; weeks)
| Item | What | Source |
|---|---|---|
| 2.1 | Multi-tenancy: `user_id` on all tables, thread JWT `sub` through ports/adapters, row-level scoping | 01 S4 |
| 2.2 | Scope enforcement (`sr:read`/`sr:write`), publish in PRM, 403 `insufficient_scope` | 01 S2 |
| 2.3 | Annotations (`title` + read-only/destructive hints) on all 45 tools + `_meta["anthropic/requiresUserInteraction"]` on destructive ones | 01 S5, 02 §3.3 |
| 2.4 | Tool consolidation pass (45 → fewer; merge `calculate_*` trio, fetch/list overlaps) before directory review | 01 N2 |
| 2.5 | Privacy policy; flip `"private": true`; publish package; MCP Registry listing | 01 §5 |
| 2.6 | Hosted deployment; billing via Stripe web checkout (no MCP payment rail exists); cloud layer in separate private repo | 04 A4, D |
| 2.7 | Anthropic directory submission (needs Team/Enterprise org) + ChatGPT app submission | 01 §5, 04 A3 |

### Phase 3 — Pedagogy depth (differentiation; ongoing)
| Item | What | Source |
|---|---|---|
| 3.1 | FSRS migration — backfill from `session_question_attempts`, fit weights, warm-start S/D per chunk. Highest absolute impact, largest effort | 03 Q1 |
| 3.2 | Lapse partial retention: scale post-lapse interval by prior learning depth instead of unconditional reset | 03 Q6 |
| 3.3 | Roadblock → true successive relearning: recovery recalls in *next* sessions, cap how much massed in-session success can move EF (68% vs 26% retention, spaced vs massed criterion) | 03 Q5 |
| 3.4 | Topic/category interleaving in review sessions (not the dead easy-medium-hard config — wrong axis per the literature) | 03 Q10 |
| 3.5 | Grading trust: independent judge pass on sampled gradings + anchor to canonical answers + leniency-drift monitoring. In the cloud this is an operator-paid LLM call — a paid-tier "verified grading" feature | 03 Q3, 02 §4 |
| 3.6 | Tier smoothing: hinted-recall step between cued_recall and scaffold; in-session re-promotion | 03 Q11 |
| 3.7 | Form-mode elicitation for destructive confirmations; progress notifications on bulk ops; resource-links spike on search results | 02 §3.2, §3.4–3.5 |
| 3.8 | SDK v2 / 2026-07-28 spec migration (sessions removed) — schedule once a Tier-1 client ships it | 02 §1, §2.14 |

---

## Open decisions for the owner

1. **License/repo split** — recommended: MIT core stays, cloud layer in a private repo (Plausible pattern, minus the AGPL migration). Alternative: fair-source relicense (community friction, see Cal.com backlash).
2. **Anthropic directory org** — submission requires a Team/Enterprise claude.ai org. Individual accounts cannot submit.
3. **B2B timing** — enter after consumer cloud proves the loop, leading with team dashboards, or skip while Microsoft's free bundling plays out.
4. **FSRS now vs. later** — Phase 3 as written; moving it earlier improves the algorithm story ("FSRS-based" is marketable in the Anki-literate segment) at the cost of delaying the cloud.
