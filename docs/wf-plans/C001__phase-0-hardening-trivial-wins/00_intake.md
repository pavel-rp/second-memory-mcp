# C001 — Intake

**Date:** 2026-07-07
**Captured by:** claude-fable-5
**Input source:** feature description (conversation context)

## Original idea (verbatim)

> phase 0

Refers to **Phase 0 — Hardening & trivial wins** of the research-synthesis roadmap at `docs/research/SYNTHESIS.md` (§ Unified roadmap), produced 2026-07-07 from the four research reports in `docs/research/results/`.

## Adopted context — Phase 0 as defined in the synthesis

Ordering principle: compliance blockers and trivial pedagogy fixes first (they're small and everything downstream inherits them). Estimated scale: days.

| Item | What | Source report |
|---|---|---|
| 0.1 | Make `AUTH_AUDIENCE` required; always pass `audience` to `jwtVerify` | 01 gap B1 (spec MUST) |
| 0.2 | Origin-validation middleware, 403 on invalid Origin, `ALLOWED_HOSTS` env → `createMcpExpressApp` | 01 gaps B2, S3 (spec MUST) |
| 0.3 | Add `isError: true` to `toolError()`; delete dead `toolOk`/`toolJson` | 01 gap B3 (spec requirement) |
| 0.4 | Assessment quality mapping: pass→4, fail→2 (two constants) | 03 Q2 |
| 0.5 | Interval fuzz (Anki-style few-percent randomization) | 03 Q8 |
| 0.6 | Prereq mastery: gate on existing retrievability R≥0.7 instead of `repetitions > 0` | 03 Q9 (highest-leverage pedagogy fix) |
| 0.7 | Restructure `SERVER_INSTRUCTIONS`: critical workflow rules in first ~1.5–2KB, depth stays in `get_server_workflow` | 02 §3.1 |
| 0.8 | Leech: require minimum total attempts before consecutive-3 fires (or raise to 4); wire or delete `leechFailureThreshold` | 03 Q7 |
| 0.9 | Rate limiting on `POST /mcp` (per-subject) — or document it as delegated to the reverse proxy | 01 gap S1 (spec MUST) |

Known tension found during intake: item 0.1 conflicts with **NEU-63** (`docs/wf-plans/NEU-63__remove-aud-claim-validation-jwt-middleware/PLAN.md`), which deliberately made `AUTH_AUDIENCE` optional because Rauthy v0.34.3 hardcodes `aud` to the OAuth `client_id` and does not support RFC 8707 resource indicators.

## Clarifications

**2026-07-07 — Q:** Item 0.1 makes AUTH_AUDIENCE required (MCP spec MUST), but NEU-63 deliberately made it optional because Rauthy hardcodes `aud` to the OAuth client_id and doesn't support RFC 8707 resource indicators. How should the charter resolve this conflict?
**A:** Enforce, aud=client_id — make `AUTH_AUDIENCE` required and set it to the client_id value Rauthy actually emits; restores the spec MUST and works today. Spec phase should also check whether current (2026) Rauthy has added RFC 8707 support so the proper resource URL can be used instead.

**2026-07-07 — Q:** Where should the spec-required rate limiting on tool invocations (item 0.9) live?
**A:** In-app middleware — per-subject limiter in front of `POST /mcp` inside the server, limits configurable via env. Self-contained compliance for any deployment.

**2026-07-07 — Q:** Items 0.4 (assessment quality mapping), 0.5 (interval fuzz), 0.6 (prereq mastery gate), and 0.8 (leech threshold) change live scheduling behavior for existing learner data. How should they roll out?
**A:** Hard change, no config — just change the behavior; do not add new rollout flags or env knobs for these items. (Existing algorithm-config knobs that already cover a value may keep working; the decision is: no *new* configuration surface for rollout purposes.)

**2026-07-07 — Q:** Should the charter cover all nine Phase 0 items, or trim the scope?
**A:** All nine items (0.1–0.9) as scoped in the synthesis.

**2026-07-07 — Q (reviewer Q1.1):** Should requests without an Origin header be accepted on /mcp, with 403 reserved for present-but-not-allowlisted origins?
**A:** Allow absent Origin — reject only when an Origin header is present and not allowlisted. DNS-rebinding attacks come from browsers, which always send Origin; non-browser MCP clients typically omit it and must keep working. (Confirms charter assumption #7.)

**2026-07-07 — Q (reviewer Q2.1):** The Origin-403 check reuses CORS_ALLOWED_ORIGINS, default `*` — with that default the spec-MUST Origin rejection ships inert on default configs. Keep `*` or require explicit origins?
**A:** Require explicit origins — when `TRANSPORT=http`, `CORS_ALLOWED_ORIGINS` must be set to explicit origins (no `*`); fail-fast at startup like `AUTH_ISSUER`. Actually closes gap B2. Accepted as a breaking change. (Confirms charter assumption #12 in its strict variant.)

**2026-07-07 — Q (reviewer Q2.2):** Should ALLOWED_HOSTS be required always in HTTP mode, or only for non-localhost binds (the SDK already auto-protects 127.0.0.1/localhost/::1)?
**A:** Non-localhost binds only — conditional fail-fast: default 127.0.0.1 bind keeps SDK auto-protection with no new requirement; binding 0.0.0.0/:: without `ALLOWED_HOSTS` fails startup instead of today's console warning. (Confirms charter assumption #13 in its conditional variant.)

## Deferred
