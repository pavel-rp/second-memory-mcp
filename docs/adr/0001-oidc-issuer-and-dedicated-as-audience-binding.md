# ADR-0001: OIDC issuer matching and the dedicated-AS audience binding

- **Status:** Accepted
- **Date:** 2026-07-09
- **Issue:** [NEU-882](https://linear.app/neurasphere/issue/NEU-882)
- **Supersedes:** the "adopt RFC 8707 `aud = resource URL` via a Rauthy upgrade" framing of NEU-882
- **Related:** [NEU-63](https://linear.app/neurasphere/issue/NEU-63) (made `AUTH_AUDIENCE` optional), [NEU-833](https://linear.app/neurasphere/issue/NEU-833) (required + enforced `aud == AUTH_AUDIENCE`), [NEU-850](https://linear.app/neurasphere/issue/NEU-850) / [NEU-858](https://linear.app/neurasphere/issue/NEU-858) (Phase 2 hosted multi-tenant AS)

## Context

The MCP server runs as an OAuth 2.1 resource server behind a **single, dedicated** self-hosted [Rauthy](https://github.com/sebadob/rauthy) authorization server (AS). The Claude MCP connector obtains tokens by **self-registering via Dynamic Client Registration (DCR)**. Two facts about that deployment drive this decision:

1. **Rauthy mints `iss` with a trailing slash** (e.g. `https://iam.example.com/auth/v1/`). The JWT middleware stripped trailing slashes from the configured issuer and exact-matched the token `iss` against the stripped value, so every request 401'd on an issuer mismatch regardless of audience.

2. **DCR clients get a random, non-URL `client_id`** of the form `dyn$<random>` (e.g. `dyn$ZeqN7HUePudbYlt2`), and — absent RFC 8707 resource indicators — Rauthy sets the token **`aud` to that client id**. Validation on an isolated Rauthy 0.36 instance confirmed:
   - a token requesting `resource=https://mcp.example.com/mcp` → `400 invalid_target` ("this client has no allowed_resources configured");
   - a token without `resource` → `aud = dyn$<random>`.
     Rauthy's `allowed_resources` / `default_aud` are per-client fields that the DCR registration endpoint silently drops, and there is no global default. **A DCR client can therefore never obtain `aud = <resource URL>` on Rauthy.**

NEU-833 hardened audience validation by making `AUTH_AUDIENCE` **required** and enforcing `aud == AUTH_AUDIENCE`, under the stated assumption that `AUTH_AUDIENCE` would be set to the **static** `client_id` Rauthy emits (Rauthy hardcodes `aud` to the OAuth `client_id`). That assumption holds for a manually-provisioned static client, but **not** for the Claude connector's DCR client, whose `dyn$<random>` id is generated at registration time and cannot be pinned in configuration ahead of time. Under NEU-833 as written, real Rauthy DCR tokens 401 on audience.

The original remedy — upgrade Rauthy and adopt RFC 8707 resource-URL audiences — was falsified by the validation above: it is unreachable on self-hosted Rauthy with the DCR flow, and unnecessary for this topology.

## Decision

Two changes to `src/transport/jwt-middleware.ts`, documented here as the intentional model for a dedicated AS:

### 1. Issuer: tolerate a trailing slash on either side

Validate the token `iss` against **both** slash variants of the configured issuer — the middleware passes jose `issuer: [issuer, `${issuer}/`]`, where `issuer` is `AUTH_ISSUER` with trailing slashes stripped (still used, stripped, to build the OIDC discovery URL so it never double-slashes). A token whose `iss` carries a trailing slash (Rauthy) and one that does not both match; any other issuer is rejected, and its signature would fail against the trusted JWKS regardless. Auth no longer depends on the operator configuring the trailing slash exactly.

### 2. Audience: accept the configured audience **or** a `dyn$` DCR client id of the trusted issuer

`AUTH_AUDIENCE` remains **required** (it also identifies the resource in the PRM document and the `WWW-Authenticate: resource_metadata` challenge). jose no longer performs the `aud` check; the middleware validates audience explicitly, accepting a token when:

- any `aud` value equals `AUTH_AUDIENCE` (NEU-833's static client_id / resource binding — unchanged), **or**
- any `aud` value is a `dyn$`-prefixed DCR client id, **or**
- `aud` is absent **and** `azp` is a `dyn$`-prefixed DCR client id.

Otherwise the request is 401. This **extends** NEU-833's enforcement rather than disabling it: a token with an unrelated, non-`dyn$` `aud`, or with no audience binding at all, is still rejected.

## Rationale — why this satisfies the MCP audience requirement here

The MCP spec's audience requirement exists to prevent the **confused-deputy** attack: a token minted for resource A being replayed against resource B behind the **same multi-resource AS**. That attack requires the AS to serve more than one resource. This deployment is **one dedicated AS serving exactly one resource** (this MCP server). Under that topology:

- Strict issuer validation + RS256 signature verification against the trusted AS's JWKS prove the token was **minted by the trusted AS for one of its own registered clients**.
- With a single resource behind that AS, "a client of the trusted issuer" and "a client authorized for this resource" are the same set. There is no second resource for a token to be confused with.

So `dyn$`-prefixed `aud`/`azp` from the trusted issuer is a sound audience binding for this topology, and matching a specific pre-known client id is neither possible (DCR ids are random) nor necessary.

## Consequences

**Positive**

- Real Rauthy DCR tokens authenticate: the issuer trailing-slash 401 and the DCR-audience 401 are both resolved.
- No Rauthy upgrade, no RFC 8707 dependency, no config off-flag, no relaxation of the "reject unrelated/absent audiences" behavior NEU-833 shipped.

**Negative / accepted trade-offs**

- Any `dyn$` DCR client registered with the trusted AS is accepted, not just the Claude connector's specific client. This is acceptable **only** because the AS is dedicated to this single resource — every client it can mint a token for is, by construction, a client of this resource.
- The `dyn$` prefix is a Rauthy-specific heuristic. If the AS changes its DCR id format, this check must be revisited.

## Amendment (2026-07-12, [NEU-909](https://linear.app/neurasphere/issue/NEU-909)): `AUTH_ADDITIONAL_AUDIENCES` for static clients

The claude.ai connector in production authenticates with a **manually provisioned static client** (`claude-web`) rather than DCR, so its tokens carry `aud = "claude-web"` — rejected by the rule set above (not `AUTH_AUDIENCE`, not `dyn$`), which broke the connector with a silent 401. Since `AUTH_AUDIENCE` doubles as the PRM resource URL, it cannot be set to a bare client id.

The middleware now additionally accepts any `aud` listed in the optional `AUTH_ADDITIONAL_AUDIENCES` env var (comma-separated static client ids; prod sets `claude-web`). This is the same trust argument as the `dyn$` rule — a pre-registered client of the dedicated single-resource AS — but opt-in and explicit per client id, so the "reject unrelated/absent audiences" posture is unchanged. The safety premise below applies to these entries identically.

## Safety premise and what would change this decision

This decision is valid **only while the deployment is a single dedicated AS serving a single resource.** It must be revisited if either becomes false:

- **The AS becomes multi-resource / multi-tenant.** Then confused-deputy is live again and audience must bind to a real resource identifier.
- **Migration to a hosted AS (Phase 2 — NEU-850 / NEU-858).** WorkOS AuthKit / Stytch support DCR **and** RFC 8707 resource indicators, so `aud = <resource URL>` becomes both reachable and necessary there. That is where real resource-URL audience validation belongs; it is explicitly out of scope here.
