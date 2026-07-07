# C001 — sub-task decomposition

**Updated:** 2026-07-07
**Decomposed by:** claude-fable-5

## Coverage map

| Outcome | Covered by |
|---------|-----------|
| OUT-1 | SUB-1 |
| OUT-2 | SUB-2 |
| OUT-3 | SUB-4 |
| OUT-4 | SUB-5 |
| OUT-5 | SUB-6 |
| OUT-6 | SUB-8 |
| OUT-7 | SUB-9 |
| OUT-8 | SUB-7 |
| OUT-9 | SUB-3 |

## Dependency order

1. SUB-1
2. SUB-2 (no functional dependency; ordered after SUB-1 — both churn src/config/resolve-auth-config.ts: SUB-1 tightens `AUTH_AUDIENCE` at :82, SUB-2 adds the `CORS_ALLOWED_ORIGINS` explicit-origins fail-fast beside the origin normalization at :83)
3. SUB-3 (no functional dependency; ordered after SUB-2 — both churn src/transport/http.ts)
4. SUB-4 [P]
5. SUB-5 [P]
6. SUB-6 [P]
7. SUB-7 (no functional dependency; ordered after SUB-6 — both churn src/domain/algorithms/sr-calculator.ts)
8. SUB-8 [P]
9. SUB-9 (depends on SUB-5)

## Published ids

Umbrella: NEU-832

| SUB | Tracker id |
|-----|-----------|
| SUB-1 | NEU-833 |
| SUB-2 | NEU-834 |
| SUB-3 | NEU-835 |
| SUB-4 | NEU-836 |
| SUB-5 | NEU-837 |
| SUB-6 | NEU-838 |
| SUB-7 | NEU-839 |
| SUB-8 | NEU-840 |
| SUB-9 | NEU-841 |

---

## SUB-1: Require and enforce JWT audience validation in HTTP mode

**Covers:** OUT-1
**Complexity:** M
**Type:** fix
**Depends on:** —
**Actor:** Server operator self-hosting over HTTP (behind Rauthy)

**Problem slice:** `AUTH_AUDIENCE` is resolved via `optionalUrl()` (src/config/resolve-auth-config.ts:82) and only conditionally passed to `jwtVerify` (src/transport/jwt-middleware.ts:73–76). A token minted for any audience is accepted — a token-confusion hole and a violation of an MCP-spec MUST (research report 01, gap B1). Directory submission is blocked on this. Complication: `AUTH_AUDIENCE` is URL-validated at startup (`optionalUrl` throws on non-URLs, src/config/resolve-auth-config.ts:33–42) and doubles as the PRM `resource` identifier (src/transport/prm-handler.ts:6) and the WWW-Authenticate `resource_metadata` base URL (src/transport/jwt-middleware.ts:56–58), so setting it to a non-URL client_id would break startup parsing and PRM URL construction.

**Desired outcome:** After this PR, an HTTP deployment cannot start without `AUTH_AUDIENCE`, and every JWT is validated against it: startup throws a self-explanatory error when `TRANSPORT=http` and `AUTH_AUDIENCE` is unset (same fail-fast pattern as `AUTH_ISSUER`); a token with a missing or wrong `aud` claim receives 401. The audience↔PRM coupling is resolved in the same PR, so enforcement never lands with a broken startup parse or broken PRM/WWW-Authenticate URLs.

**In scope:**
- Make `AUTH_AUDIENCE` required whenever `TRANSPORT=http`, with a fail-fast startup error that names the env var and the fix.
- Pass `audience` to `jwtVerify` unconditionally.
- Resolve the audience↔PRM coupling before enforcement lands (this sub-task owns it, per OUT-1): either decouple the PRM `resource` identifier and the WWW-Authenticate `resource_metadata` base URL from the audience value, or confirm the deployed client_id is URL-shaped so the existing derivation keeps working.
- Spec-phase check: does current (2026) Rauthy support RFC 8707 resource indicators? If yes, use a proper resource URL as the audience value; if not, `AUTH_AUDIENCE` is set to the client_id Rauthy actually emits (Rauthy v0.34.3 hardcodes `aud` to the OAuth `client_id`).
- Release-notes callout: this is a breaking change for existing HTTP deployments.
- Update any existing tests that encode the optional-audience behavior.

**Out of scope:** Origin/Host validation (SUB-2); rate limiting (SUB-3); scope-based access control (`sr:read`/`sr:write`) and multi-tenancy — Phase 2; any change to STDIO deployments (`resolveAuthConfig` returns `null` for STDIO, src/config/resolve-auth-config.ts:78).

**Acceptance scenarios:**
- Given `TRANSPORT=http` and `AUTH_AUDIENCE` unset, when the server starts, then startup throws with an actionable message naming `AUTH_AUDIENCE` (same pattern as the existing `AUTH_ISSUER` failure).
- Given a JWT with a missing or wrong `aud` claim, when a request hits `/mcp`, then the response is 401.
- Given a JWT whose `aud` matches `AUTH_AUDIENCE`, when a request hits `/mcp`, then authentication proceeds as today.
- Given the final `AUTH_AUDIENCE` value shape (resource URL or client_id), when the server starts and a 401 is produced, then startup parsing succeeds and the PRM `resource` identifier and WWW-Authenticate `resource_metadata` URL are valid and consistent with that value.
- Given `TRANSPORT=stdio` with no `AUTH_AUDIENCE` set, when the server starts, then it starts normally (no HTTP auth config is resolved).

**Constraints:** This deliberately reverses NEU-63's optional-audience decision (charter decision, 2026-07-07). OUT-1 owns resolving the audience↔PRM coupling — enforcement must not ship before the coupling is decoupled or the value shape confirmed. HTTP-only blast radius — STDIO untouched. Integration tests are a ship-gate for the 401 request-blocking path (project CLAUDE.md); stub-only unit coverage is insufficient.
**Assumptions:** `aud = client_id` is an accepted (weaker-than-resource-indicator) binding for now (charter assumptions #1, #2 — confirmed); the RFC 8707 check is a spec-phase task, not a blocker.
**Verification evidence:** Unit tests on `resolveAuthConfig` (required-in-http, absent-in-stdio); integration test through the JWT middleware covering wrong-`aud` → 401 and correct-`aud` → pass; PRM and WWW-Authenticate URLs verified with the final audience value.

---

## SUB-2: Reject forged-Origin requests and activate Host-header DNS-rebinding protection

**Covers:** OUT-2
**Complexity:** M
**Type:** fix
**Depends on:** — (no functional dependency; ordered after SUB-1 because both modify src/config/resolve-auth-config.ts)
**Actor:** Server operator self-hosting over HTTP

**Problem slice:** The `/mcp` middleware sets CORS headers but never rejects any Origin (src/transport/http.ts:93–119) — and with the shipped `CORS_ALLOWED_ORIGINS` default of `*`, an origin-based rejection would be inert on default configs. The SDK's Host-header DNS-rebinding check is auto-active on the default `HTTP_HOST` of 127.0.0.1 (src/config/resolve-transport-config.ts:20) and disengages only for non-localhost binds, because `createMcpExpressApp` is called without `allowedHosts` (src/transport/http.ts:81) — with a console warning for 0.0.0.0/:: and silently for any other non-localhost host (node_modules/@modelcontextprotocol/sdk/dist/esm/server/express.js:30–47). Both are MCP-spec MUST gaps (report 01, gaps B2 and S3), and directory submission is blocked on B2.

**Desired outcome:** After this PR, a request bearing a non-allowlisted `Origin` header is rejected with 403 before any handler runs; requests without an `Origin` header pass; `CORS_ALLOWED_ORIGINS` must hold explicit origins in HTTP mode (unset or `*` fails startup); and Host-header DNS-rebinding protection is active regardless of bind address — SDK localhost auto-protection on the default bind, the new `ALLOWED_HOSTS` env (fail-fast required) on non-localhost binds.

**In scope:**
- New Origin-validation middleware ahead of CORS on `/mcp`: reject with 403 only when an `Origin` header is present and not allowlisted; requests without an `Origin` header pass (non-browser MCP clients omit it; intake decision 2026-07-07).
- The Origin allowlist is the existing `CORS_ALLOWED_ORIGINS` env (full-origin scheme+host+port values, already normalized at src/config/resolve-auth-config.ts:83) — no second origin-allowlist env is introduced. It becomes required-and-explicit in HTTP mode: unset or containing `*` fails startup with a self-explanatory error (same fail-fast pattern as `AUTH_ISSUER`; breaking change accepted, decision 2026-07-07). One list governs both CORS reflection and the new 403 rejection. The strictness check lives in `resolveAuthConfig` (src/config/resolve-auth-config.ts) beside the existing origin normalization — the same file SUB-1 tightens for the audience, hence the ordering after SUB-1.
- Host validation is separate and differently shaped: the new `ALLOWED_HOSTS` env (hostname list) is passed to `createMcpExpressApp` (the SDK option exists: node_modules/@modelcontextprotocol/sdk/dist/esm/server/express.d.ts:19) and is required only when `HTTP_HOST` is a non-localhost bind — the default 127.0.0.1/localhost/::1 binds keep the SDK's automatic localhost validation with no new requirement, while a non-localhost bind without `ALLOWED_HOSTS` fails startup with a self-explanatory error (same fail-fast pattern) instead of today's console warning (decision 2026-07-07).
- Release-notes callout: breaking for existing HTTP deployments — `CORS_ALLOWED_ORIGINS` must be set to explicit origins, and `ALLOWED_HOSTS` is newly required for non-localhost binds (localhost-bound deployments are not broken by the host allowlist).
- Transport integration tests: allowed/disallowed/absent Origin; startup failures for unset and for `*`-containing `CORS_ALLOWED_ORIGINS`, and for a non-localhost bind without `ALLOWED_HOSTS`; localhost bind starts without `ALLOWED_HOSTS`.

**Out of scope:** Audience enforcement (SUB-1); rate limiting (SUB-3); any CORS-policy redesign beyond placing the rejection ahead of the existing CORS handling; STDIO deployments (unaffected).

**Acceptance scenarios:**
- Given an allowlisted `Origin`, when a request hits `/mcp`, then it proceeds to the handler.
- Given a present, non-allowlisted `Origin`, when a request hits `/mcp`, then the response is 403 and no handler runs.
- Given no `Origin` header, when a request hits `/mcp`, then it proceeds (not rejected).
- Given `TRANSPORT=http` and `CORS_ALLOWED_ORIGINS` unset or containing `*`, when the server starts, then startup fails with an actionable message naming `CORS_ALLOWED_ORIGINS`.
- Given a non-localhost `HTTP_HOST` (e.g. 0.0.0.0) and `ALLOWED_HOSTS` unset, when the server starts, then startup fails with an actionable message naming `ALLOWED_HOSTS`.
- Given the default localhost `HTTP_HOST` and `ALLOWED_HOSTS` unset, when the server starts, then it starts normally and the SDK's automatic localhost Host validation is active.
- Given a non-localhost bind with `ALLOWED_HOSTS` set, when the server is up, then the SDK's Host-header check is engaged via `allowedHosts`.

**Constraints:** Two allowlists, two shapes: `ALLOWED_HOSTS` holds hostnames for the SDK Host check; the 403 Origin check compares full origins from `CORS_ALLOWED_ORIGINS` (charter Dependencies). Rejections are transport-level, not tool-layer crashes (fail-open server behavior, project CLAUDE.md). No SDK upgrade — the pinned SDK already exposes `allowedHosts`. Integration tests are a ship-gate for the 403 request-blocking path and the startup fail-fasts.
**Assumptions:** Absent-`Origin` requests are not rejected — DNS-rebinding attacks come from browsers, which always send `Origin` (charter assumption #7, confirmed by intake clarification 2026-07-07). `CORS_ALLOWED_ORIGINS` is the single origin list and is required-and-explicit in HTTP mode — unset or `*` fails startup (charter assumption #12, confirmed strict variant, reviewer Q2.1). `ALLOWED_HOSTS` is required only for non-localhost binds (charter assumption #13, confirmed conditional variant, reviewer Q2.2).
**Verification evidence:** Transport integration tests in `tests/integration/` covering the Origin cases (allowed, disallowed, absent), the startup failures (unset/`*` `CORS_ALLOWED_ORIGINS` in HTTP mode; non-localhost bind without `ALLOWED_HOSTS`), the localhost bind starting without `ALLOWED_HOSTS`, and Host-allowlist engagement.

---

## SUB-3: Rate-limit POST /mcp per authenticated subject

**Covers:** OUT-9
**Complexity:** M
**Type:** feat
**Depends on:** — (no functional dependency; ordered after SUB-2 because both modify src/transport/http.ts)
**Actor:** Server operator self-hosting over HTTP (protects all learners of a deployment from an abusive or runaway subject)

**Problem slice:** No rate limiting exists anywhere in `src/transport/**` (report 01, gap S1 — an MCP-spec MUST for tool invocations). Any subject can hammer `POST /mcp` without bound.

**Desired outcome:** After this PR, a subject exceeding the configured request limit on `POST /mcp` receives HTTP 429 while other subjects are unaffected; the limits are env-configurable, and compliance is self-contained in the app (no reverse-proxy dependency).

**In scope:**
- In-app rate-limiting middleware in front of `POST /mcp`.
- Limiter keys on the JWT subject (the `sub`/`azp` identity the JWT middleware already extracts) — not the MCP session.
- Pre-auth traffic decision (spec-time, must not remain unowned): subject-keyed limiting engages only after JWT verification, so an unauthenticated flood of `POST /mcp` — each request costing JWKS/JWT-verify work before its 401 — is not throttled by the subject limiter. The spec either adds a pre-auth limiter (e.g. per-IP) or explicitly records the unthrottled-pre-auth gap as an accepted risk. This one decision also covers every request without an authenticated subject: "HTTP without `authConfig`" is not a production configuration — `resolveAuthConfig` throws when `TRANSPORT=http` and `AUTH_ISSUER` is unset (src/config/resolve-auth-config.ts:74–85) and src/transport/main.ts:42–51 always passes the resolved non-null config; it is reachable only via direct `startHttpTransport` invocation in tests — so no standalone auth-disabled fallback identity is needed beyond this pre-auth choice.
- Limiter state-store decision (spec-time): a per-instance in-memory store multiplies the effective limit across replicas; the spec either states the single-instance deployment assumption explicitly or picks a shared store.
- Env-configurable limits; over-limit response is HTTP 429.
- Integration test with two subjects, one over-limit.

**Out of scope:** Delegating limiting to a reverse proxy (explicitly rejected by charter decision); keying on the MCP session (the 2026-07-28 spec RC removes protocol sessions); STDIO transport; per-tool or per-tenant quota schemes.

**Acceptance scenarios:**
- Given subject A has exceeded the configured limit, when A sends another `POST /mcp`, then the response is 429.
- Given subject A is over-limit, when subject B sends `POST /mcp` within its own limit, then B's request succeeds normally.
- Given the pre-auth handling the spec selects, when unauthenticated requests (missing or invalid JWT) flood `POST /mcp`, then they are throttled per the chosen fallback identity (e.g. per-IP) or the unthrottled-pre-auth gap is explicitly recorded as an accepted risk in the spec — never left silently unowned.

**Constraints:** In-app middleware by charter decision (self-contained compliance for any deployment). 429 is a transport-level rejection, not a tool-layer crash. Integration tests are a ship-gate for the 429 request-blocking path — DB-independent transport integration tests in `tests/integration/`.
**Assumptions:** Requests without an authenticated JWT subject fall under the pre-auth decision — per-IP fallback or explicitly accepted gap (charter assumption #9, [unconfirmed]); 429 as the refusal status (charter assumption #11, [unconfirmed]) — both flagged for reviewer, resolved at spec time. Working assumption pending the spec-time state-store decision: single-instance deployment with per-instance in-memory limiter state — multi-replica deployments would silently multiply the effective limit.
**Verification evidence:** Transport integration test: two subjects, one driven over-limit → 429 for it, success for the other.

---

## SUB-4: Flag tool business errors with isError and delete dead success helpers

**Covers:** OUT-3
**Complexity:** S
**Type:** fix
**Depends on:** —
**Actor:** AI agent (Claude Code, claude.ai, ChatGPT, …) orchestrating tools for a learner

**Problem slice:** Business-logic tool errors never set `isError: true`: `toolError()` (src/server/tool-helpers.ts:53–77) is the one non-conformant envelope path of three (the SDK wrapper and context-token middleware already conform), so client models treat error envelopes as data and cannot self-correct (report 01, gap B3). The same file carries two dead success helpers, `toolOk` and `toolJson`, with zero call sites in `src/`.

**Desired outcome:** After this PR, every `toolError()` result is a spec-conformant Tool Execution Error carrying `isError: true`, so agents recognize failures and self-correct; the dead helpers and their tests are gone.

**In scope:**
- `toolError()` sets `isError: true` on its results.
- Delete `toolOk` and `toolJson` and their tests.
- Update existing tests that assert the old envelope (missing `isError`).

**Out of scope:** Any change to the JSON error body — `{ status: 'error', error: { type, message, retryable } }` stays byte-identical; the two already-conformant envelope paths; retry semantics or new error types.

**Acceptance scenarios:**
- Given a tool call that fails a business rule, when the result is returned, then it carries `isError: true` and the JSON body is unchanged in shape and content.
- Given the codebase after the change, when type-check and grep run, then there are zero references to `toolOk` or `toolJson`.

**Constraints:** Error envelope shape is stable — only the MCP-level `isError` flag is added (charter constraint). Fail-open server behavior: handlers keep returning valid MCP responses.
**Assumptions:** `isError: true` changing client retry/handling behavior is an accepted low risk — the flag matches spec-required behavior and the two code paths that already set it.
**Verification evidence:** Unit tests on tool-helpers asserting `isError: true` and unchanged body; type-check/grep showing zero references to the deleted helpers.

---

## SUB-5: Map assessment answers to quality pass→4 / fail→2

**Covers:** OUT-4
**Complexity:** S
**Type:** fix
**Depends on:** —
**Actor:** Learner (via the agent) — scheduling reflects actual answer quality instead of flawless/blackout extremes

**Problem slice:** Assessment mode forces `quality = passed ? 5 : 1` (src/orchestration/teaching-workflows.ts:1226), so every correct answer registers as flawless (max ease gain) and every failure as near-blackout (report 03, Q2). Ease trajectories are mechanically inflated.

**Desired outcome:** After this PR, `submit_answer` in assessment mode persists quality 4 on pass and 2 on fail, and every piece of prose that documents the old 5/1 mapping matches the new behavior.

**In scope:**
- Change the assessment quality mapping to pass→4, fail→2.
- Update prose that documents 5/1, including at the change site itself: the JSDoc "Pass → quality 5, fail → quality 1 (no retry)" (src/orchestration/teaching-workflows.ts:1212), the inline "override quality to 5/1 for SR" comment (src/orchestration/teaching-workflows.ts:1223), src/shared/instructions.ts:33, and the schema comment at src/infrastructure/db/schema.ts:208.
- Update existing tests asserting the 5/1 mapping.

**Out of scope:** The SM-2 quality scale itself (stays 0–5, src/shared/constants/validation.ts — the change is which points assessment maps to, not the scale); self-assessed review quality paths; correct-answer exposure after second failure (Phase 1); FSRS migration (Phase 3); restructuring `SERVER_INSTRUCTIONS` (SUB-9 — this sub-task only corrects the 5/1 prose in place).

**Acceptance scenarios:**
- Given an assessment-mode `submit_answer` with a passing answer, when the result is persisted, then the stored quality is 4.
- Given an assessment-mode `submit_answer` with a failing answer, when the result is persisted, then the stored quality is 2.

**Constraints:** Hard cutover — no new rollout flags or env knobs (charter decision, 2026-07-07). No data migration; stored SR state is not rewritten; the change applies to future submissions only.
**Assumptions:** Changed ease trajectories on live data are accepted by the hard-cutover decision.
**Verification evidence:** Unit tests on the assessment submit path asserting 4/2 persistence; updated documentation strings verified in the same change.

---

## SUB-6: Add fuzz to review intervals so batch-taught chunks stop co-landing

**Covers:** OUT-5
**Complexity:** S
**Type:** feat
**Depends on:** —
**Actor:** Learner — review load spreads out instead of piling identical chunks on the same future dates forever

**Problem slice:** No interval fuzz exists anywhere in the scheduler, so chunks introduced together co-land on identical review dates indefinitely (report 03, Q8) — review sessions lump instead of spreading.

**Desired outcome:** After this PR, computed review intervals carry a small Anki-style randomized window (a few percent, scaled to interval length), so same-day-introduced chunks drift apart; a fuzzed interval never drops below 1 day; the domain calculator stays pure and tests stay deterministic.

**In scope:**
- Apply a randomized fuzz window to computed intervals in the SR calculator (src/domain/algorithms/sr-calculator.ts), scaled to interval length, with a hard floor of 1 day.
- Inject randomness as an explicit input parameter to the pure domain function (never `Math.random()` inside `src/domain/`); wire the real randomness source at the orchestration/composition boundary.
- Seeded/injected-randomness unit tests; update any existing tests asserting exact unfuzzed intervals.

**Out of scope:** A fuzz-magnitude config knob (no new rollout configuration — charter decision); FSRS migration and lapse partial retention (Phase 3 — the interval-reset-on-lapse behavior stays as-is); rewriting already-scheduled review dates (future computations only).

**Acceptance scenarios:**
- Given two chunks with identical SR state reviewed the same day, when their next intervals are computed with different injected random values, then their next-review dates differ within the fuzz window.
- Given a computed interval of 1 day, when fuzz is applied with any injected random value, then the resulting interval is never below 1 day.
- Given a fixed injected random value, when the same computation runs twice, then the result is identical (deterministic tests).

**Constraints:** Hexagonal purity — `src/domain/` is zero-I/O and never throws; randomness must arrive as an injected input (charter constraint). Hard cutover, no new env knobs. Fuzz magnitude follows Anki's model; exact percentage decided at spec time (charter assumption #10, [unconfirmed]).
**Assumptions:** Spread review dates on live data are accepted by the hard-cutover decision; stored SR state is not rewritten.
**Verification evidence:** Seeded/injected-randomness unit tests on the SR calculator covering the fuzz window, the 1-day floor, and determinism.

---

## SUB-7: Require a minimum evidence base before leech flagging and eliminate dead leech config

**Covers:** OUT-8
**Complexity:** M
**Type:** fix
**Depends on:** — (no functional dependency; ordered after SUB-6 because both modify src/domain/algorithms/sr-calculator.ts)
**Actor:** Learner — a new-and-hard chunk is no longer branded a leech on its first three attempts

**Problem slice:** The leech flag fires at `config.leechConsecutiveFailures` consecutive failures — default 3, already env-configurable via `SM_LEECH_CONSEC_FAILS` (src/config/resolve-algorithm-config.ts:57–59) — with no minimum evidence base (src/domain/algorithms/sr-calculator.ts:157), structurally far more aggressive than Anki's 8-lifetime standard, while the `leechFailureThreshold` config knob (default 6, env `SM_LEECH_FAIL_THRESHOLD`) is parsed but never read by any algorithm (report 03, Q7).

**Desired outcome:** After this PR, a chunk cannot be flagged leech before a minimum number of total attempts, and no dead leech configuration remains: `leechFailureThreshold` is either wired into the new rule or deleted.

**In scope:**
- Add a minimum-total-attempts precondition to the leech rule.
- Choose the evidence mechanism at spec time — the committed outcome admits all three options: derive a lifetime-attempt count from `session_question_attempts`, add a counter, or fall back to raising the default of the existing `leechConsecutiveFailures` knob (e.g. 3 → 4 — a default change; the knob is already env-tunable via `SM_LEECH_CONSEC_FAILS`). (Chunks carry only `repetitions` — reset to 0 on failure — and `consecutiveFailures`; no lifetime-attempt counter exists in `learning_chunks`, src/infrastructure/db/schema.ts.)
- Wire `leechFailureThreshold` as the minimum, or delete it.
- Config audit: every `AlgorithmConfig` field is consumed by some algorithm.
- Unit tests on the leech path.

**Out of scope:** Roadblock → successive-relearning redesign (Phase 3 — explicitly must not creep in); leech handling/UX beyond the flagging rule itself; rewriting existing leech flags on stored chunks.

**Acceptance scenarios:**
- Given a chunk with 3 consecutive failures but total attempts below the minimum, when the leech rule evaluates, then the chunk is not flagged.
- Given a chunk with total attempts at or above the minimum and consecutive failures at the threshold, when the leech rule evaluates, then the chunk is flagged.
- Given the final `AlgorithmConfig`, when the config audit runs, then no field is parsed-but-never-read.

**Constraints:** Hard cutover, no new rollout knobs; existing `SM_*` env knobs that already cover a value keep working (so wiring `SM_LEECH_FAIL_THRESHOLD` is preferred over introducing a new env var). Hexagonal purity — if a derived attempt count is used, it enters the pure calculator as an input, fetched by an adapter/orchestration layer.
**Assumptions:** Minimum-total-attempts precondition is preferred over merely raising the consecutive threshold to 4 (charter assumption #8, [unconfirmed]; flagged for reviewer, final mechanism picked at spec time).
**Verification evidence:** Unit tests on the leech path (below-minimum → not flagged; at-minimum + threshold → flagged); config audit showing every `AlgorithmConfig` field consumed.

---

## SUB-8: Re-include decayed prerequisites by gating mastery on retrievability

**Covers:** OUT-6
**Complexity:** S
**Type:** fix
**Depends on:** —
**Actor:** Learner — a prerequisite reviewed once long ago re-enters the session when its memory has actually decayed

**Problem slice:** "Prerequisite mastered" currently means `repetitions > 0` (src/orchestration/session-workflows.ts:314) — a single lifetime success counts as permanent mastery — even though the codebase already computes FSRS-style retrievability for teaching-tier selection (src/domain/algorithms/classify-chunk.ts). Report 03 calls this the cheapest, highest-leverage fix in the audit (Q9).

**Desired outcome:** After this PR, the auto-added-prerequisite partition skips a prerequisite only when it has been successfully reviewed at least once (`repetitions > 0`) **and** its estimated retrievability is ≥ 0.7; a once-reviewed prerequisite whose retrievability has decayed below 0.7 re-enters the session, and never-reviewed prerequisites keep being included and taught, exactly as today.

**In scope:**
- Replace the `repetitions > 0`-only mastery test in the auto-added-prerequisite partition (src/orchestration/session-workflows.ts:309–319) with the compound gate `repetitions > 0` AND retrievability ≥ 0.7.
- Reuse the existing `classifyChunk` retrievability computation and the existing 0.7 recall-tier cutoff (src/domain/algorithms/classify-chunk.ts:31) — no new constant.
- Guard the fresh-chunk case explicitly: `classifyChunk` returns R = 1.0 for chunks with no established interval ("Fresh item or null interval → treat as fully retrievable", src/domain/algorithms/classify-chunk.ts:45–47), so R alone must never trigger the skip branch — a never-reviewed prerequisite (`repetitions === 0`) is always included.
- Unit tests for all three branches.

**Out of scope:** Any new threshold constant or config knob; tier smoothing and interleaving (Phase 3); changes to how prerequisites are auto-added or resolved (only the skip/include gate changes); FSRS migration.

**Acceptance scenarios:**
- Given a never-reviewed prerequisite (`repetitions === 0`, which scores R = 1.0 under `classifyChunk`), when the session partitions auto-added prerequisites, then the prerequisite is included in the session (today's behavior is preserved).
- Given a prerequisite with `repetitions > 0` and estimated retrievability < 0.7, when the session partitions auto-added prerequisites, then the prerequisite is included in the session.
- Given a prerequisite with `repetitions > 0` and estimated retrievability ≥ 0.7, when the session partitions auto-added prerequisites, then the prerequisite is skipped.

**Constraints:** Mastery is `repetitions > 0` AND R ≥ 0.7 — retrievability alone must never skip a fresh chunk, because `classifyChunk` scores never-reviewed chunks as R = 1.0 (charter OUT-6). Reuse the system's own recall-tier threshold rather than inventing a new one (charter assumption #6, confirmed). Hard cutover, no new rollout knobs. Intended, material side effect: previously "mastered" prerequisites re-enter sessions, so some sessions get longer immediately after the upgrade — accepted by the hard-cutover decision.
**Assumptions:** No data migration; stored SR state untouched; the change affects session composition for future sessions only.
**Verification evidence:** Unit tests: reps=0 (R=1.0) → included; reps>0 & R<0.7 → included; reps>0 & R≥0.7 → skipped.

---

## SUB-9: Restructure server instructions so critical rules survive 2 KB client truncation

**Covers:** OUT-7
**Complexity:** M
**Type:** fix
**Depends on:** SUB-5 (SUB-5 corrects the 5/1 quality-mapping prose inside src/shared/instructions.ts; restructuring after it lands means the new layout documents pass→4/fail→2 once, instead of churning the same file twice)
**Actor:** AI agent (Claude Code, claude.ai, ChatGPT, …) connecting to the server

**Problem slice:** `SERVER_INSTRUCTIONS` (src/shared/instructions.ts, ~7.9 KB) is truncated at 2 KB by Claude Code and to ~512 useful chars in ChatGPT, so critical workflow rules are invisible to exactly the clients most likely to connect (report 02 §3.1). Agents on truncating clients never see the teaching loop, the `submit_answer` contract, or the never-fabricate-scores rule.

**Desired outcome:** After this PR, the first ~1.5–2 KB (≤2,048 bytes) of `SERVER_INSTRUCTIONS` contain the critical workflow rules — teaching loop, `submit_answer` contract, never-fabricate-scores — so even a truncating client's agent can follow the workflow, while full depth remains available through `get_server_workflow`.

**In scope:**
- Restructure `SERVER_INSTRUCTIONS` so the critical rules fit within the first 2,048 bytes.
- Preserve full semantic depth: `get_server_workflow` (src/server/server-workflow-tools.ts) serves `SERVER_INSTRUCTIONS` verbatim, so the restructuring propagates there automatically — the restructured full text must remain semantically complete for non-truncating clients.
- Automated byte-budget + content-presence test pinning the critical rules into the first 2,048 bytes.

**Out of scope:** New tools or changes to the `get_server_workflow` mechanism itself; instruction content for Phase 1/2 features (analytics, tenancy, annotations); the quality-mapping prose correction (owned by SUB-5 — this sub-task carries the already-corrected text forward).

**Acceptance scenarios:**
- Given the built `SERVER_INSTRUCTIONS` string, when the byte-budget test runs, then each critical rule (teaching loop, `submit_answer` contract, never-fabricate-scores) is present within the first 2,048 bytes.
- Given an agent on a truncating client (sees only the first 2 KB), when it needs full depth, then `get_server_workflow` returns the complete instructions.
- Given an agent on a non-truncating client, when it reads the restructured instructions, then the content is semantically complete (restructured, nothing lost).

**Constraints:** Full depth preserved verbatim via `get_server_workflow` (charter journey requirement). Regression risk on non-truncating clients is mitigated by the byte-budget and content-presence tests — they are part of the deliverable, not optional.
**Assumptions:** 2,048 bytes is the binding budget for the critical-rules head (from the Claude Code truncation limit); ChatGPT's ~512-char window gets the best-effort ordering of the most critical rule first, but 2 KB is the tested contract.
**Verification evidence:** Automated byte-budget + content-presence test on the instructions string; existing `get_server_workflow` tests still pass with the restructured content.
