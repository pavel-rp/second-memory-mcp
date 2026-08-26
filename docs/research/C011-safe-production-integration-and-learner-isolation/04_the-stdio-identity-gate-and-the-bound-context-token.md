# The STDIO identity gate, and the context token bound to a principal

**Sub-task:** SUB-4 (NEU-996) · **Covers:** OUT-7, OUT-13
**Written:** 2026-08-25 · **Model:** claude-opus-5[1m]
**Codebase cutoff:** `origin/develop` @ `5111841`
**Depends on:** SUB-2 (NEU-994), published at `02_identity-the-learner-key-and-principal-kind.md`
**Consumes:** `../C010-system-and-repository-architecture/decision-records/DR-C10-S8-2_token-bound-identity-over-per-call-identity.md` (token-bound identity, all seven clauses), `../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md` (checks `I1`–`I5`; §4.3's sequencing consequence; §5.4's reachability routing), `../C010-system-and-repository-architecture/05_system-context-and-responsibility-boundaries.md` (`BND-S4-17`), `../C010-system-and-repository-architecture/12_application-versus-core-rule-and-compatibility-contract.md` (`CC-S8-3`), and `../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md` (`OI-S8-1`, `OI-S8-2`) — all published 2026-08-22.
**Decision records:** `DR-C11-S4-1`, `DR-C11-S4-2`, `DR-C11-S4-3` · **Traceability:** `traceability/S4_stdio-gate-and-bound-context-token.md`

---

## 0. What this chapter is

The settled answer to two questions C010 took as far as it could and then parked: **what closes the
identity gate on the transport that has none**, and **what a context token has to carry so that it
authorizes one principal rather than any caller**. Four later sub-tasks design against the answers
here rather than against `src/transport/main.ts:55`–`:59`.

**Two terms are disambiguated before anything else, because both already mean something specific in
this codebase and the chapter uses both constantly.**

- A **context token** is the opaque, TTL-bounded string `init_agent_context` returns and every gated
  tool call must present. It is a row in `context_tokens`. It is **not** an LLM token and **not** an
  OAuth access token (`docs/GLOSSARY.md`, row `context token`).
- A **session** in this chapter always means the domain's *learning* session — the
  `session_lifecycle` concept — **never** an HTTP session and never the MCP transport session the
  SDK maintains. Where the transport-level notion is meant, it is written *transport session* in
  full. Nothing in this chapter binds identity to a session in either sense; the binding is to the
  context-token row.

**The headline, stated first.** The gate is **closed on STDIO, not left open**, and the closure is
achieved without inventing an authentication flow that this deployment cannot supply. That second
half is the chapter's organising constraint and it comes from `F-S2-1`: the production learner
arrives on a **manually provisioned static client**, not through DCR
(`91_findings-register.md` § `F-S2-1`; `docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md:63`–`:67`).
There is therefore **no self-registration path** a STDIO client could walk to obtain a credential of
its own, and §2 works out what follows.

The second half of the chapter designs the `context_tokens` row. C010 obligated the binding and
recorded that the table has nothing to bind to (`OI-S8-1`); this chapter says what the row carries,
when it is written, what happens to every row that predates it, and where the purge that exists in
the codebase but is never called gets called from.

This chapter does **not** decide where confinement is enforced below the transport (SUB-5), the
order the stages actually run in (SUB-7), or the compatibility contract across the whole tool
surface (SUB-11). It states this change's own compatibility consequence and hands the mechanism to
the party that owns it.

---

## 1. The starting position

Everything in this section is a read of the tree at `5111841`, not an inference.

### 1.1 One transport carries every control; the other carries none

| Control | HTTP | STDIO | Evidence |
| --- | --- | --- | --- |
| Authentication (JWT) | mounted | **none** | `src/transport/http.ts:164`; `src/config/resolve-auth-config.ts:105` returns `null` for `stdio` |
| Origin / CORS check | mounted | **none** | `src/transport/http.ts:108`, `:123` |
| Rate limiting | mounted | **none** | `src/transport/http.ts:173`; `src/config/resolve-rate-limit-config.ts:31` returns `null` for `stdio` |
| Audit logging | mounted | **none** | `src/transport/http.ts:180` |
| Context-token gate | mounted | **none** | `src/transport/http.ts:186` |

`src/config/resolve-auth-config.ts:2` states the position in the file's own words: *"Returns null for
STDIO transport (inherently trusted, no auth needed)"*.

### 1.2 There is no STDIO transport module to mount anything on

This is a fact the charter's framing does not contain and it changes the price of the change.
`src/transport/` holds ten files and **none of them is a STDIO module**. The STDIO path is three
statements inline in the transport switch:

```
src/transport/main.ts:55–59
  } else {
    const server = createMcpServer(ctx);
    const transport = new StdioServerTransport();
    await server.connect(transport);
  }
```

`createAuditMiddleware` (`src/transport/audit-middleware.ts:23`) and
`createContextTokenMiddleware` (`src/transport/context-token-middleware.ts:43`) both return an
Express `RequestHandler`. A `StdioServerTransport` is not an Express application, so "mount the gate
on STDIO" is not a mount at all — it is a rewrite of the gate against a transport-neutral seam that
does not yet exist. That cost is recorded as `F-S4-4` and handed on; it is **not** priced by
`CC-S8-3`'s *reusable core* classification
(`../C010-system-and-repository-architecture/12_application-versus-core-rule-and-compatibility-contract.md:233`).

### 1.3 STDIO is the default, not the exception

`src/config/resolve-transport-config.ts:35` parses the transport mode as
`parseEnum(env.TRANSPORT, ['stdio', 'http'] as const, 'stdio')`. An unset `TRANSPORT` selects
**stdio**. Every local run, every developer invocation and every harness that does not set the
variable is on the ungated transport by default. Recorded as `F-S4-2`, because it makes the
compatibility class in §7 row 4 the largest one rather than an edge case.

### 1.4 The row has nothing to bind to, and the gate checks almost nothing

`context_tokens` declares exactly three columns and one index
(`src/infrastructure/db/schema.ts:312`–`:321`; `drizzle/0014_create_context_tokens.sql`):
`id TEXT PRIMARY KEY`, `created_at BIGINT NOT NULL`, `expires_at BIGINT NOT NULL`. No principal, no
subject, no owner.

The gate (`src/transport/context-token-middleware.ts:43`–`:88`) reads the tool name, waves through
the three exempt tools, requires `context_token` to be present on the call, and then asks the
repository a single question — `validateWithStatus`
(`src/adapters/drizzle/context-token-repository.ts:39`–`:55`), which is a lookup by id plus an
expiry comparison. **Nothing else is checked.** Any bearer of any live token id passes as
completely as the caller who minted it.

### 1.5 The purge exists and is never called

`deleteExpired(before: number)` is declared at `src/ports/context-token-repository.ts:6` and
implemented at `src/adapters/drizzle/context-token-repository.ts:61`. An exhaustive search of `src/`
finds **zero** call sites — no scheduler, no cleanup job, no call from the composition root. The
only callers anywhere are tests.

There *is* a delete that runs in production, and it is easy to mistake for a purge: `validate()` and
`validateWithStatus()` delete the single row they were asked about when they find it expired. That
removes only rows that are **presented**. A row that is minted and then abandoned — the normal fate
of a token whose client crashed, and the guaranteed fate of every token minted by a CI run that
ends — is never presented again and is never removed by anything. Recorded as `F-S4-1`.

### 1.6 The surface the gate covers

Re-counted at this chapter's own cutoff rather than inherited: `server.registerTool(` occurs **46**
times across `src/server/`, and `EXCLUDED_TOOLS` at `src/transport/context-token-middleware.ts:5`–`:9`
holds exactly three names — `init_agent_context`, `get_server_info`, `get_server_workflow`. **46
registered / 43 gated / 3 exempt**, matching the settled figure fixed by C010's `F-S5-3`
(`../C010-system-and-repository-architecture/02_findings-register.md:249`–`:254`) and diagnosed by
`F-S8-1` (`:604`–`:609`). No contradiction with C010 is found on this count.

---

## 2. What `F-S2-1` forecloses, and why it is the constraint that shapes the gate

`F-S2-1` establishes that the production learner path is the **static-client** shape: ADR-0001's
NEU-909 amendment states that *"The claude.ai connector in production authenticates with a
**manually provisioned static client** (`claude-web`) rather than DCR"*
(`docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md:65`). Three consequences follow,
and together they eliminate the answer a reader would otherwise reach for first.

**(1) There is no self-registration path.** Under DCR, the obvious STDIO gate almost designs
itself: let each STDIO installation register itself with the authorization server, receive its own
client id, and bind the context token to that. On this deployment that path does not exist for the
learner, and standing one up for STDIO alone would mean a **manual per-installation provisioning
task at the AS** — the same manual act that produced `claude-web`. That is a real cost and it is why
a bearer token is not the baseline answer in §3.

**(2) Even if it did exist, the value it would yield is not a learner key.** A DCR-registered STDIO
client's identity arrives as `azp`, and `DR-C11-S2-1` fixes that *"`azp` is never a learner key"*.
Binding a context token to an `azp` would produce a token that authorizes a *client installation*
rather than a *learner*, which is the confusion the whole outcome exists to remove. The DCR-shaped
answer is therefore rejected twice over, on evidence and on rule, not on taste.

**(3) The audience carries no learner information at all.** Because the production client is
static, every learner reaching the connector presents `aud = "claude-web"` — one shared bare client
id (`src/config/resolve-auth-config.ts:94`–`:99` parses `AUTH_ADDITIONAL_AUDIENCES`, called at
`:110`;
`src/transport/jwt-middleware.ts:119` matches it). The audience distinguishes nothing between two
learners. This is what makes SUB-2's rule — *principal kind is determined by `sub`-presence, never
inferred from the audience shape* — **load-bearing here rather than merely preferred**: on this
deployment the audience is the one field that provably cannot tell you who is calling.

**The design conclusion.** The STDIO principal cannot come from the caller, cannot come from a
client registry that does not exist, and cannot be read off an audience that carries no learner
information. What is left is **state the server already holds** — which is, word for word, what
check `I5` asks for.

---

## 3. Decision — the STDIO identity gate

Recorded in full, with six rejected alternatives, at
`decision-records/DR-C11-S4-1_the-stdio-identity-gate.md`. Stated here in six clauses.

1. **STDIO is gated.** The three exempt tools answer as they do today. The 43 gated tools require a
   context token bound to a principal, on exactly the terms HTTP will require after `DR-C10-S8-2`
   lands. *"Leave STDIO ungated"* is argued and rejected — see §3.1, and rejected alternative 1 in
   the decision record. It is not available as a default.

2. **The STDIO principal is server-held deployment configuration.** A STDIO process is launched with
   a principal identifier and an explicitly declared **principal kind**, supplied by the operator
   through the same configuration channel every other transport setting uses. It is read by the
   server at start-up and is never accepted from, or influenced by, the caller.

3. **With no principal configured, the STDIO transport refuses every gated tool.** It does not mint
   a token; it does not mint an unbound one; it does not degrade to today's behaviour. This clause
   is **not new** — it is `DR-C10-S8-2` clause 2 applied
   (*"refuse to mint when none exists rather than issue an unbound token"*), and this chapter
   consumes it rather than re-arguing it. An unconfigured deployment is therefore **inert, not
   open**: the failure direction is refusal.

4. **Audit logging reaches STDIO on the same terms as the gate.** The invariant's transport clause
   is about enforcement, so audit parity is not required for `I4` to pass (§9) — but a gate that
   refuses without recording leaves the two transports unequal in what a reader can later
   reconstruct. The cost is real and is stated rather than assumed away: the audit middleware is
   Express-typed (§1.2), so this is a rewrite. Recorded as `F-S4-4` and `R-S4-4`.

5. **Bearer-on-STDIO is an operator-elective superset, not the baseline.** Where an operator is
   willing to provision a static client at the AS — the same manual mechanism that produced
   `claude-web` — a STDIO client may present a bearer token and the principal resolves by exactly
   the HTTP rule, with no second code path. This is offered because it is strictly better where it
   is affordable, and it is not required because `F-S2-1` shows it is not affordable by default.

6. **The gate-exempt set stays at exactly three, as a stated decision.** `init_agent_context`,
   `get_server_info`, `get_server_workflow`, each with an empty input schema
   (`src/server/server-context-tools.ts:21` for the first). This is not inherited silently: it is
   re-affirmed here, and it is consistent with `DR-C10-S8-2` clause 5, which decides the exempt
   three separately and non-uniformly — **1 of 3 changes** (`init_agent_context` gains the binding
   obligation; the two metadata tools change under neither option).

### 3.1 "Leave STDIO ungated", argued and rejected

The charter admits this answer *only if it is argued, owned, and shown compatible with the
invariant*. It is argued here and it fails on the third clause.

- **Compatibility with the invariant.** C010 is explicit that the verdict does not depend on whether
  anyone can reach the edge: *"a transport that produces no principal fails I4 whether or not anyone
  can currently reach it"*
  (`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:482`–`:485`).
  An ungated STDIO transport therefore keeps every in-domain category at `fails-transport`
  permanently. There is no reading of the invariant on which leaving it open is compatible.
- **Ownership.** Nobody has offered to own it. `BND-S4-17`'s owner is recorded as `nobody`
  (`../C010-system-and-repository-architecture/05_system-context-and-responsibility-boundaries.md:197`),
  which is the condition this decision exists to end, not a state to ratify.
- **The reachability argument does not rescue it.** Even granting the optimistic answer to §11's
  open question — that no STDIO client reaches production — `TRANSPORT` defaults to `stdio`
  (§1.3), so the ungated transport is one unset environment variable away in every environment,
  including any future one.

The alternative is therefore rejected on the invariant, not on preference.

---

## 4. Decision — what the `context_tokens` row carries

Recorded in full, with six rejected alternatives, at
`decision-records/DR-C11-S4-2_what-the-context-token-row-carries.md`.

**Three columns are added.** Nothing is removed and no existing column changes meaning.

| Column | Holds | On HTTP with `sub` | On HTTP without `sub` | On STDIO |
| --- | --- | --- | --- | --- |
| `principal_id` | the identifier this token authorizes | the `sub` claim, **verbatim** — and this is the learner key | the `azp` value — an identifier, and **explicitly not a learner key** | the configured principal identifier |
| `principal_kind` | `user` \| `client` | `user` | `client` | the operator's **declared** kind |
| `principal_claim_source` | where the identifier came from | `token:sub` | `token:azp` | `configured:transport-principal` |

**The binding rule, stated once and load-bearing.** `principal_id` **is a learner key if and only if
`principal_kind = 'user'`.** The kind is not decoration and not an optimisation; a consumer that
reads `principal_id` and ignores `principal_kind` has re-created, one layer lower, exactly the
`payload.sub || azp` collapse that sits at `src/transport/jwt-middleware.ts:127` today and that
`DR-C11-S2-1` exists to fix. That failure mode is registered as `R-S4-1` with an owner, because a
rule whose violation is invisible is not a mitigation.

**Kind is determined, never inferred from the audience.** `DR-C11-S2-2`'s three-outcome table is
consumed unchanged: `sub` present → `user`; `sub` absent and `azp` present → `client`; neither
usable → no principal, 401, which is already the deployed behaviour at
`src/transport/jwt-middleware.ts:129`–`:131`. §2(3) is why this matters more on this deployment than
it would on a DCR one.

**A `client`-kind row is admitted and refused, not empty-scoped.** A service principal may hold a
context token, may call the three exempt tools, and may call any gated tool that touches no
learner-owned row. Any read, write or delete of learner-owned state under a `client` token is
**refused**. `DR-C11-S2-2`'s reasoning is consumed verbatim and is not softened here: an
empty-scoped query returns zero rows and is indistinguishable from a learner with no data, whereas a
refusal is observable. Where that refusal is enforced is SUB-5's (`OUT-8`); this chapter fixes only
that the row carries enough for the enforcement point to tell the two cases apart.

**Provenance is a separate field, never encoded into the key.** `DR-C11-S2-3` fixed that the
resolved identity records which claim it came from, in flight and at rest, and named the
`context_tokens` binding as the at-rest site. `principal_claim_source` is that site. It is what makes
check `I5` answerable from stored state rather than only at the transport edge, where the token is
already gone.

**Nullability is staged, because it has to be.** The columns are added **nullable**. A `NOT NULL`
column cannot be added to a table holding live unbound rows without either backfilling them — which
is grandfathering under another name and is forbidden by `DR-C10-S8-2` clause 4 — or deleting them
first. So: add nullable; have the gate treat `principal_id IS NULL` as **reject**; purge; only then
set `NOT NULL`. The DDL and the migration plan themselves are OUT-19's artifacts, not this
chapter's; what is fixed here is the ordering constraint they must honour.

**No tool input schema changes.** All 43 gated tools already declare `context_token`. Zero schemas
newly declare an identity argument. What changes is the argument's *meaning* — `DR-C10-S8-2` clause
3, consumed. §10 audits this.

---

## 5. Where the principal is obtained, per transport

`init_agent_context` is the binding point (`DR-C10-S8-2` clause 2). It is itself gate-exempt and
takes an empty input schema (`src/server/server-context-tools.ts:21`), so it can never learn who is
calling from its arguments — which is the property that makes it safe as the binding point rather
than a problem to solve.

| Transport | Where the principal comes from | If it is absent |
| --- | --- | --- |
| HTTP | the signature-verified token, already resolved at the transport edge and placed in the response-local at `src/transport/jwt-middleware.ts:133`–`:136`; kind determined per `DR-C11-S2-2` | the request never reaches `init_agent_context` — `src/transport/jwt-middleware.ts:129`–`:131` already replies 401 |
| STDIO, principal configured | the server-held configuration read at start-up (§3 clause 2) | n/a |
| STDIO, no principal configured | nothing | **refuse to mint**, and refuse every gated tool — `DR-C10-S8-2` clause 2 |
| STDIO, elective bearer path | the presented token, by the HTTP rule; no second code path | as HTTP |

**Why a configured principal satisfies `I5` rather than evading it.** `I5` asks whether the
principal is *"server-derived rather than caller-asserted"* and whether its kind is *"determined
rather than assumed"*
(`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:174`).
Deployment configuration is state the server holds; the caller cannot influence it, cannot present
an alternative, and cannot enumerate it. The kind is declared by the operator at configuration time
and read by the server, so it is determined from server-held state — not inferred from the shape of
anything the caller sent. Both clauses are met. What the configured principal does **not** do is
tell you a human is present; neither does `principal_kind = 'user'` on HTTP, and `DR-C11-S2-2`
already states that explicitly. The two transports are equal in that limitation, which is the point.

---

## 6. The token lifecycle, walked on both transports

| Step | HTTP | STDIO (principal configured) | STDIO (not configured) |
| --- | --- | --- | --- |
| **Mint** | `init_agent_context` resolves the principal from the verified token, determines the kind, writes `principal_id` / `principal_kind` / `principal_claim_source` on the new row, returns the id | same, from the configured principal, `principal_claim_source = configured:transport-principal` | **refuses to mint** |
| **Use** | the gate resolves the row, reads the binding, and hands the enforcement point one principal and one kind; a `client`-kind token is refused for learner-owned state | identical — the decision is the same decision, from the same row | every gated tool refused; the three exempt tools answer |
| **Expiry** | `expires_at` unchanged in meaning; the presented-row delete inside `validateWithStatus` is unchanged | identical | n/a |
| **Purge** | `deleteExpired()` wired at the mint path (§7) | identical — the sweep is transport-agnostic by construction, which the middleware is not | never runs, because nothing mints |
| **Cutover** | every pre-existing row is unbound and is rejected on presentation and purged (§8) | identical | identical |

Fourteen of the fifteen cells carry a defined behaviour; the fifteenth — expiry on an unconfigured
STDIO process — is an explicit `n/a`, because a transport that mints nothing has nothing to expire.
Two cells record an existing behaviour as **unchanged**, which is a defined behaviour: what none of
them is, is "unchanged, and therefore fine".

---

## 7. Expiry and purge — the wired path

Recorded at `decision-records/DR-C11-S4-3_expiry-purge-and-the-cutover-rejection-rule.md`.

**`deleteExpired()` is wired, at the mint path.** The call site is the token-creation path
`init_agent_context` already uses — `ctx.createContextToken()`, reached from
`src/server/server-context-tools.ts:33` — as a bounded opportunistic sweep of rows already past
`expires_at`.

Three reasons this site rather than another. **(1)** No scheduler exists anywhere in the composition
root, so a timer is new infrastructure rather than a wiring change. **(2)** Mint frequency bounds
sweep frequency, which makes the cost proportional to the thing that creates the rows. **(3)** It is
**transport-agnostic** — it runs identically on STDIO and HTTP, which is precisely the property the
existing middleware mounting lacks and the property `I4` is about. A periodic timer in the long-lived
HTTP process is a **recommended addition**, not the primary, and it is explicitly not sufficient on
its own: a STDIO process that exits when its client disconnects may never fire one.

**The delete that already runs is not a purge, and the chapter says so.** §1.5 records the
distinction. Any later reader who sees the delete inside `validateWithStatus` and concludes the
table is self-cleaning will be wrong in exactly the case that matters — the abandoned row.

**The wired sweep is not the cutover purge, and cannot be.** `deleteExpired`'s predicate is
`lte(contextTokens.expiresAt, before)` (`src/adapters/drizzle/context-token-repository.ts:62`) — it
selects on **expiry**, not on the binding. An unbound row that has not yet expired is invisible to
it. §9.1's stage D therefore names a **second, differently-predicated operation** — a one-shot purge
of rows whose binding is NULL — which is a migration act rather than the wired sweep running once.
`DR-C11-S4-3` clause 5 records it as such. Conflating the two would leave stage D unable to set the
columns `NOT NULL`, because the rows blocking it would still be there.

**Why the answer is "wire it" rather than "state why not".** The charter admits either. Once a
principal is bound, `context_tokens` stops being the anonymous three-column table SUB-3 classified
and becomes learner-identifying — SUB-3's inventory says so directly, classifying it as *not*
personal data *at this cutoff* and recording that it becomes learner-identifying the moment a
principal is bound to it (`03_learner-data-inventory-and-classification.md`, entry `LD-S3-13`).
Unbounded retention of a learner-identifying table is a retention position, and this package has not
taken one for it. Wiring the purge avoids opening a retention question as a side effect of an
identity decision.

---

## 8. Cutover — every class of token that will be rejected

`DR-C10-S8-2` clause 4 is consumed, not re-argued: *"Tokens minted before the change carry no
principal and must be rejected, not grandfathered."* Four classes, all named.

| # | Class | Why it is rejected | When |
| --- | --- | --- | --- |
| **C1** | **Every `context_tokens` row that exists at cutover.** All of them, without exception — the table declares no column that could carry a binding (`src/infrastructure/db/schema.ts:312`–`:321`), so an already-bound pre-existing row is not a possible state. | Unbound; `principal_id IS NULL` | Once, at cutover |
| **C2** | **The token the deploy pipeline's `client_credentials` smoke run mints on every deploy.** The CD job fetches an OAuth token by `grant_type=client_credentials` (`.github/workflows/cd-prod.yml:145`–`:168`) and runs `pnpm run test:smoke` with it (`:170`–`:174`). Under `DR-C11-S2-2` a `client_credentials` principal is `client`-kind, and the smoke suite calls **gated learner-state tools** with the token it obtains — `list_learning_items` at `tests/smoke/smoke.test.ts:206` and `session_status` at `:237`, using the context token captured at `:195`. Those calls are refused, not empty-scoped. | Rejected for learner-owned state, permanently, by the service-principal rule — **not** by the unbound rule | **Every deploy**, indefinitely |
| **C3** | **Any `claude-web` learner token's context-token row minted before cutover.** Falls under C1; the learner re-mints a bound row on the next `init_agent_context` call and loses nothing but the in-flight call. | Unbound | Once, at cutover |
| **C4** | **Any context-token row minted over STDIO before cutover**, if the edge is reachable. Falls under C1 at cutover; after cutover an unconfigured STDIO process mints nothing at all, so the class becomes empty by construction rather than by policy. | Unbound, then never created | Once, then n/a |

**C2 is the consequential one and it is not a variant of C1.** C1 is a one-time migration event that
resolves itself the first time each client re-mints. C2 **recurs on every deploy** and it lands on
the deploy pipeline's own gate: `cd-prod.yml` runs the smoke suite as a deploy step, so a smoke
suite that fails is a deploy that fails. The correct reading is that **this package's identity rule
has the production release pipeline as one of its consumers**, and that consumer has not been
adapted. Recorded as `F-S4-3` and as `R-S4-2` with a named owner and an escalation route.

**C2 is a different fact from `R-S2-2`, and the distinction is stated so it is not read as a
duplicate.** `R-S2-2` is the risk that the smoke principal *acquires* a `sub` and silently becomes a
learner owning production rows. `R-S4-2` is the opposite branch: it *does not* acquire one, is
correctly classified `client`, is correctly refused — and the refusal breaks the deploy. Both
branches are live because `OI-S1-1` / `SPK-S1-1` remain open; neither has been observed.

**How many rows are in C1 is not stated.** No production credential exists in this environment, so
the population is not counted, not estimated and not bounded. It is carried as `A-S4-1` with an
owner and a re-validation trigger, and it resolves through `OI-S1-7` / `SPK-S1-7`, which already ask
exactly this question. **The cutover procedure is correct for any population including zero**, so
nothing in this chapter rests on the number.

---

## 9. Compatibility — every existing STDIO client path

Each path is classified **unaffected**, **degraded** or **broken**. "Degraded" means it still works
and something about it got worse; "broken" means it stops working until an action is taken.

| # | Path | Today | Under the gate | Class |
| --- | --- | --- | --- | --- |
| 1 | A local MCP client calling one of the three exempt tools | works, unauthenticated | works, unauthenticated | **unaffected** |
| 2 | A local MCP client calling any of the 43 gated tools, **no principal configured** | works, unauthenticated, unlogged | refused with a named reason | **broken** — by design; this is the change `CC-S8-3` prices |
| 3 | The same client, **principal configured** | works | works, and every call is confined to that principal | **degraded** — a one-time operator configuration step is now required, and access that was previously unbounded is now bounded |
| 4 | Any process launched with `TRANSPORT` unset — the **default** (`src/config/resolve-transport-config.ts:35`) | STDIO, ungated | STDIO, gated | **broken** until configured. **This is the largest class**, because it is what happens when nobody chooses |
| 5 | A test or development harness constructing `createMcpServer(ctx)` directly and bypassing the transport | unaffected | unaffected | **unaffected** — the gate is a transport concern and these callers are below it |
| 6 | The deploy pipeline's smoke run | HTTP, not STDIO | unchanged **by the STDIO limb** | **unaffected here** — it is broken by the *binding* limb instead (§8, C2), and that is where it is counted |
| 7 | A STDIO client presenting a bearer token | no such path — `resolveAuthConfig` returns `null` on stdio, so a token is ignored entirely | accepted under §3 clause 5 | **unaffected** — nothing can break, because the path does not exist today |

**Two of the seven are broken, and both are broken deliberately.** Row 2 is the change itself. Row 4
is row 2 reached by default rather than by choice, and it is called out separately because a reader
who assumes STDIO is an opt-in minority path will under-scope the migration.

### 9.1 The breaking-change position and its staging

**This change is breaking, and unavoidably so.** C010 already priced it and warned against the
softening this chapter might otherwise be tempted by:
*"Every existing STDIO client calls with no token today and would begin to fail. The obligation is
to state it as a breaking change with a version boundary — not to soften it with a permissive mode,
which would reproduce the current gap under a new name"*
(`../C010-system-and-repository-architecture/12_application-versus-core-rule-and-compatibility-contract.md:552`).
This chapter takes that position unchanged. No permissive mode is proposed. The observe-only stage
below is **not** a permissive mode: it changes no refusal behaviour and exists only to measure.

**The stage set, with its ordering constraints. The schedule is SUB-7's, not this chapter's.**

| Stage | Content | Breaking? |
| --- | --- | --- |
| **A** | Add the three columns **nullable**. HTTP mint binds. The gate still accepts a NULL binding. | No |
| **B** | The gate and the audit path reach STDIO in **observe-only**: record what *would* be refused; refuse nothing. | No |
| **C** | Enforce. Both transports refuse an absent or NULL binding identically. | **Yes** — this is `CC-S8-3` |
| **D** | Purge the NULL rows — a **one-shot, binding-predicated** operation, not the expiry-predicated sweep §7 wires — then set the columns `NOT NULL`. | No, once C has landed |

Two constraints bind any schedule built on this set. **First**, D cannot precede C without
grandfathering, and cannot precede A at all. **Second**, C010 §4.3 is binding, not advisory:
*"A rollout that treats the STDIO gate as the last item will discover the principal-kind problem at
the end"*
(`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:487`–`:496`).
Under this stage set the transport gate is B and C, with only bookkeeping after it — so the set is
compatible with §4.3. Whether the schedule SUB-7 builds honours it is SUB-7's audit, and this
chapter asserts only that the set does not preclude it.

### 9.2 The routed hand-off

The **mechanism** above is supplied. The **item** is not claimed.

`OI-S8-2` and `CC-S8-3` are owned by **`SUB-10 of C010 (NEU-984)`, co-named `NEU-896`**
(`../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:428`;
`:614` for the co-naming). `OI-S8-1` — *"`context_tokens` names no principal, so the obligated
identity binding has nothing to bind to"* — has the same owner (`:417`). This chapter supplies
`OI-S8-1`'s mechanism in §4 and `OI-S8-2` / `CC-S8-3`'s in §3 and §9.1, and routes all three to that
owner. None of the three is classified owned-here or resolved-here; all three are **supplied-to**,
exactly as the charter's split-fidelity record has them.

`OI-S8-1`'s own resolving event
(`../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:418`) is *a
migration landing on `origin/develop`*, which this chapter does not produce and may not produce —
`src/` and `drizzle/` are out of scope by constraint. It therefore **remains open**, and saying so is
the correct outcome rather than a shortfall.

---

## 10. The checks, and the audit against `DR-C10-S8-2`

### 10.1 Check `I4` — transport invariance

`I4` asks: *"Does I3's enforcement hold identically on **both** transports — does it depend on
nothing mounted on only one of them?"*
(`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:173`).

**Verdict: under the proposed gate, `I4` no longer fails.** The principal is produced on both
transports; the gate refuses on both; the confinement input handed to the enforcement point is one
row with one `principal_id` and one `principal_kind`, obtained the same way from the same table on
both. The enforcement no longer depends on anything mounted on only one transport, which is exactly
what the check asks.

**Three things this verdict does not claim.**

1. **It is not a `holds` verdict for any category.** `I4` is the fourth of five ordered checks;
   passing it advances the frontier to `I5` and no further. Whether a category reaches `holds`
   depends on `I1`–`I3`, and `I3` — confinement at or below the port boundary — is **SUB-5's**
   (`OUT-8`). This chapter supplies the input to SUB-5's `I4` answer; it does not derive one.
2. **It is a verdict about the proposed gate, not the deployed one.** No positive instance exists
   and this package cannot produce one, because producing one needs code it may not write. That is
   C010's `CAP-S5-1` (`../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md:182`–`:189`),
   whose *"what would lift it"* names an identity gate on STDIO as one of three simultaneous
   preconditions. This chapter supplies the **design** of that precondition and nothing more; the
   transport-limb restatement is capped here as `CAP-S4-1`.
3. **Audit parity is a separate residual.** `I4` is about enforcement, and audit is not enforcement,
   so the observability gap does not change the verdict. It is carried as `F-S4-4` / `R-S4-4` rather
   than folded into the check, because folding it in would misreport an observability gap as an
   isolation failure.

**One named residual on the verdict itself.** The configured STDIO principal is a **per-process
singleton**: one STDIO process serves one principal. Two learners sharing one STDIO process is
therefore not supported, and would not be caught by the gate — it would be *correctly* confined to
the configured principal, which is the wrong principal for one of them. This is not an `I4` failure
(the decision is identical on both transports) but it is a real limit, and it is named with an
owner: **`SUB-10 of C010 (NEU-984)`**, co-named `NEU-896`, as the party that owns the deployment
shape this limit is a property of. Carried as `R-S4-3`.

### 10.2 Check `I2` — principal attribution

`I2` asks: *"Does every instance of the category resolve to exactly one authenticated principal,
expressed as a value the server holds?"*
(`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:171`).

**Verdict: under the proposed design, satisfied for `context_tokens` itself; consumed, not
supplied, for every other category.** Like §10.1's, this is a verdict about a design and not about
running code — nothing here is implemented (`CAP-S4-1`). After §4, each `context_tokens` row
resolves to exactly one principal — `principal_id`,
a server-held value written at mint time and never caller-supplied. For the *other* state
categories, `I2` turns on the ownership column `NEU-850`'s `OUT-2` fixes (`user_id NOT NULL`, keyed
to the JWT subject), which this package consumes and does not supply. The distinction is stated
rather than blurred: this chapter makes `I2` answerable for the token table and leaves it exactly as
it found it everywhere else.

### 10.3 Check `I5` — principal integrity and kind

`I5` asks whether the principal is *"server-derived rather than caller-asserted"* and its kind
*"determined rather than assumed"*
(`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:174`).

**Verdict: under the proposed design, satisfied on both transports** — again a verdict about a
design rather than a running system, on the same terms as §10.1 and §10.2 (`CAP-S4-1`).
Server-derived: on HTTP from the signature-verified
token, on STDIO from start-up configuration; in neither case from anything the caller sends.
Determined: `DR-C11-S2-2`'s three-outcome table on HTTP, the operator's declared kind on STDIO —
never inferred from the audience shape, which §2(3) shows carries no learner information on this
deployment anyway. Recorded: `principal_claim_source` makes the derivation legible at rest, which is
what `DR-C11-S2-3` obligated.

**And `I5` is now reachable, which it was not.** C010's §4.3 states that STDIO's `I4` failure
*masks* the `sub`/`azp` defect and that closing the gap *"makes the `sub`/`azp` defect visible, by
advancing the frontier from I4 to I5"*
(`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:487`–`:496`).
SUB-2 made `I5` **evaluable**; this
chapter makes it **reached**. Both are steps short of `holds`, and neither is described here as more
than it is.

### 10.4 Audit against `DR-C10-S8-2`, clause by clause

| Clause | What it requires | This chapter |
| --- | --- | --- |
| 1 | `context_tokens` gains a principal column | §4 — three columns, with the staged-nullability constraint stated |
| 2 | `init_agent_context` binds at mint time and **refuses to mint** when no principal exists | §5, §6 — and §3 clause 3 applies the refusal to STDIO, which is the case the clause was written before anyone had a principal for |
| 3 | **No tool input schema changes**; the argument's *meaning* changes | §4 — zero schemas touched. All 43 gated tools already declare `context_token`; **no per-call identity argument is added anywhere** |
| 4 | Pre-existing tokens rejected, not grandfathered | §8 — four classes named; backfill and grace-window alternatives both rejected in `DR-C11-S4-3` |
| 5 | The exempt three decided separately, 1 of 3 changes | §3 clause 6 — restated as a decision, not inherited |
| 6 | The decision is HTTP-qualified and **does not close STDIO** | §3, §9.2 — this chapter supplies the STDIO mechanism and routes the item to `NEU-984`; it does not claim the item |
| 7 | The obligation is on unwritten code | §11 — nothing here is implemented; `src/` and `drizzle/` are untouched by constraint |

**No per-call identity argument is added — and one thing that looks like a counterexample is not
one.** The gate reads the token from `body.params.arguments.context_token`
(`src/transport/context-token-middleware.ts:62`), so the context token *is* carried as a per-call
argument. `DR-C10-S8-2` rejects a per-call **identity** argument on forgeability — *"An identity
carried in a tool argument is caller-supplied. Nothing in the MCP argument path distinguishes the
client's true subject from a subject the client typed"*. A context token is server-minted and its
binding is server-written; a caller who types one has typed a value that resolves to no row. The
distinction is between *asserting who you are* and *presenting something the server issued*, and the
design stays on the correct side of it. Stated as `F-S4-5` so a later reader who notices the
argument does not read the audit as contradicted by the code.

---

## 11. Disposition of `BND-S4-17` — **resolved here**

`BND-S4-17` is C010's record of the STDIO trust boundary that nothing enforces, classified
*trust — unenforced*, with owner recorded as **`nobody`**
(`../C010-system-and-repository-architecture/05_system-context-and-responsibility-boundaries.md:197`).

`OI-S8-2`'s resolving event, at
`../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:429`, reads:
*"**A party is named for `BND-S4-17`** — by `NEU-893`, `SUB-10 (NEU-984)` or `NEU-896` — **or** a
STDIO identity mechanism lands on `origin/develop`. Either is observable. The item closes when one
occurs **and names which**."*

**This decision is that naming.** `NEU-893` is one of the three parties the event admits, this
chapter is `NEU-893`'s, and the party it names as `BND-S4-17`'s owner is **`SUB-10 of C010
(NEU-984)`, co-named `NEU-896`** — the same party that already owns `OI-S8-2`, `OI-S8-1` and
`CC-S8-3`. The boundary now has the owner its own blocking open item has, which is the state the
absence of an owner was blocking.

**The citation is `OI-S8-2`'s, never `OI-S8-1`'s.** `OI-S8-1`'s resolving event is a different
event at a different line — *a migration adding a principal column landing on `origin/develop`* at
`:418`. Charter rounds 1–5 mis-attributed `:429` to `OI-S8-1`, and charter assumption 51 records the
correction. This chapter cites `:429` as `OI-S8-2`'s.

**The classification is `resolved here`, not `owned and resolved here`.** `BND-S4-17` was never
C011's to own; what this chapter supplies is the naming act its blocking item required. **SUB-17**
records the classification in the resolved-here class; this section is the source that classification
rests on. It is not consumed as a constraint, and it is not left with owner `nobody`.

**Which limb fired, stated because the event requires it.** Limb **one** — a party is named. Limb
two (a mechanism landing on `origin/develop`) has **not** fired and cannot fire from this package,
which writes no file under `src/` or `drizzle/`. Whether `OI-S8-2` itself now closes is
`SUB-10 of C010 (NEU-984)`'s to record against its own item; this chapter fires the event and routes
it, and does not close another package's open item on its behalf.

---

## 12. The reachability question, and which answer this chapter planned against

Whether the unenforced STDIO edge is reachable in the production deployment is **C010's own open
question**, deliberately not decided there and routed to `SUB-10 of C010 (NEU-984)`
(`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:482`–`:485`).

**This chapter planned against "reachable"** — the conservative answer. Three reasons. The
invariant's verdict is unconditional on it, so the decision is unchanged either way and C010 says so
in the same passage. `TRANSPORT` defaults to `stdio` (§1.3), so unreachability today is one unset
variable away from being false tomorrow. And the two errors are not symmetric: planning against
"reachable" and being wrong costs one configuration step, while planning against "unreachable" and
being wrong leaves an unauthenticated edge open.

Carried as `A-S4-2` with its owner and re-validation trigger, and as `SPK-S4-1`.

---

## 13. Consistency checks against C010

Run and reported, whether or not they returned anything, so SUB-17's audit can see that they ran.

| Checked against | Result |
| --- | --- |
| `DR-C10-S8-2`, all seven clauses | Consistent — §10.4, clause by clause. Clause 6's HTTP-qualification is honoured: the mechanism is supplied, the item is not claimed |
| `DR-C10-S8-1`'s reusable-core rule (`R8-4`) and `CC-S8-3`'s classification | Consistent — the gate is statable in vocabulary the public surface already publishes and a second operator would want it. **One addition, not a contradiction:** `CC-S8-3`'s pricing does not account for there being no STDIO transport module to mount on (§1.2), which is a cost the classification does not change. Recorded as `F-S4-4` and handed to the owner |
| `../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md` §3.3's ordered checks `I1`–`I5` | Consistent — §10 applies `I2`, `I4`, `I5` and explicitly declines to derive `I3` |
| The same file's §4.3 `I4`→`I5` sequencing consequence (`:487`–`:496`) | Consistent — §9.1's stage set places the transport gate at B/C with only bookkeeping after |
| The same file's §4.2 unconditional-verdict statement (`:482`–`:485`) | Consistent — §3.1 and §12 both turn on it |
| `F-S5-4` (`../C010-system-and-repository-architecture/02_findings-register.md:262`–`:268`) | Consistent — *"a column cannot supply a principal the transport never produced"* is the reason §4's columns are not sufficient on their own and §3's gate is not optional |
| `A-28`'s tolerance envelope (`../C010-system-and-repository-architecture/93_stand-in-assumption-register.md:104`–`:115`) | **Not breached — and one clause is honestly outside the enumeration rather than argued into it.** The envelope tolerates enforcement at the repository-port layer or in the schema, and a staged, reversible or single-step migration; §9.1's stage set is staged and reversible, so that limb is squarely inside. The row-disposition limb is not: the envelope enumerates existing global rows *"backfilled **to a single owner**, quarantined, or archived"* (`:111`), and quarantine and archival both **preserve** the rows, whereas §8 **deletes** them. Deletion is a fourth disposition the envelope does not name, and calling it a reading of the other three would be a reclassification. It is nonetheless not a breach, for two reasons stated instead of blurred: the envelope's own **invalidating outcome** — *"a finding that safe isolation requires a separate deployment or a separate datastore"* (`:113`) — does not fire, and `DR-C10-S8-2` clause 4 is a **later and more specific C010 decision** that forecloses backfill outright, so the two C010 records are not in conflict and this chapter is not choosing between them. Note also that the envelope's rows are the *learner-owned global rows*, not `context_tokens`, which owns no learner state |
| `F-S5-3` / `F-S8-1`'s settled tool-surface figure | Consistent — re-counted independently at `5111841` in §1.6 and matching at **46 / 43 / 3** |
| `NEU-850`'s `OUT-2` | Consistent — the learner key is written to `user_id` unchanged; the kind discriminator lives on the token binding, not on the owning row, so the single ownership column is undisturbed |

**No amendment is routed to `NEU-895` by SUB-4.** Every check above returned consistent or returned
an addition that C010's own records already leave room for. Nothing found here contradicts a C010
decision, so nothing is routed as an amendment and nothing is absorbed silently either.

---

## 14. Source-change confirmation

This chapter changes **no** executable file. `src/` and `drizzle/` are out of scope by constraint,
and the branch is audited for zero paths under either. Every claim above is a read of
`origin/develop` @ `5111841`, and every `file:line` reference in it resolves at that cutoff.

The design is an **obligation on unwritten code**, exactly as `DR-C10-S8-2` clause 7 describes its
own. Nothing here is implemented, and no claim in this chapter should be read as describing running
behaviour.

---

## 15. Ids allocated by this sub-task

All scoped to `S4`, computed from the charter's id scheme and not continued from any shared
sequence.

| Register | Ids |
| --- | --- |
| `91_findings-register.md` | `F-S4-1` … `F-S4-6` |
| `92_risk-register.md` | `R-S4-1` … `R-S4-4` — **zero** charter `R<n>` rows, correctly: no row of the charter's §Risks table names OUT-7 or OUT-13 as its owning outcome |
| `93_open-items-and-provisional-register.md` | `OI-S4-1` … `OI-S4-3`, plus five dispositions: `BND-S4-17`, the `OI-S8-1` / `OI-S8-2` / `CC-S8-3` routings, and C010's STDIO-reachability question recorded as planned-against |
| `94_caps-and-incomplete-scope.md` | `CAP-S4-1` |
| `95_stand-in-assumption-register.md` | `A-S4-1`, `A-S4-2` |
| `96_spike-register.md` | `SPK-S4-1`, `SPK-S4-2` |
| `97_package-completeness-gate.md` | `G-S4-1` … `G-S4-10` |
| `decision-records/` | `DR-C11-S4-1`, `DR-C11-S4-2`, `DR-C11-S4-3` |

**Two spikes, not three, and the missing one is missing on purpose.** A third candidate — *would the
existing smoke suite pass under the refusal rule?* — was dropped because it fails the
*"could this have been read instead?"* test that `R14` and `DR-C11-S1-2` impose: it was settled by
reading `tests/smoke/smoke.test.ts:206` and `:237` and observing that both are gated learner-state
tools. Filing it would have been a spike standing in for a read.

**One finding is a register reconciliation rather than a claim about the system, and is named here
so it is reachable from the chapter.** `F-S4-6` records that `96_spike-register.md`'s cumulative
total — *"twelve spikes designed"* — omits SUB-15's four entries, making the correct figure sixteen
at SUB-2's revision and eighteen at this one. It is routed to SUB-14, which owns register assembly;
no sub-task edits another's section, so the original line is left as written.

**A namespace note, stated once.** This package's `S4` ids belong to **SUB-4 of C011**. C010 has its
own `S4` namespace — `BND-S4-17` and `CMP-S4-5` in §11 are C010's, and C010 has a `F-S4-5` of its
own that is unrelated to this chapter's. The house rule that resolves it is already in
`README.md` § "Id conventions": a C010 record is always cited qualified, a bare id is always this
charter's own. Both appear in this chapter, so the rule is exercised here rather than merely
available.

---

## 16. What this chapter does not establish

- **That any state category reaches `holds`.** `I4` is one of five ordered checks and `I3` is
  SUB-5's. C010's `F-S5-4` census is not moved by this chapter alone.
- **That the gate works.** Nothing is implemented and no positive instance of the invariant exists.
  `CAP-S4-1` states this for the transport limb; C010's `CAP-S5-1` states it for the invariant.
- **How many pre-existing rows exist in production, or how many learners are affected at cutover.**
  Not counted, not estimated. `A-S4-1`; resolves through `OI-S1-7` / `SPK-S1-7`.
- **Whether the STDIO edge is reachable in production.** C010's question, `SUB-10 of C010
  (NEU-984)`'s to answer. `A-S4-2`, `SPK-S4-1`.
- **Whether the configured STDIO principal corresponds to a human being.** `principal_kind = 'user'`
  records which claim the identity came from, never humanity — `DR-C11-S2-2`'s limitation is
  inherited unchanged and the configured principal is no better and no worse in this respect.
- **Whether `claude-web` tokens carry a human `sub`.** `OI-S2-2` / `SPK-S2-2`, still open. The design
  is total over both branches, so nothing here waits on it.
- **The order the stages actually run in.** SUB-7's (`OUT-3`). §9.1 supplies the set and its
  ordering constraints, not a schedule.
- **The compatibility contract across the whole tool surface.** SUB-11's (`OUT-16`). §9 states this
  change's own consequence only.
- **A retention position for `context_tokens` once it becomes learner-identifying.** §7 wires the
  purge so the question is not *opened* by this decision; it does not answer it.

---

## What this chapter hands forward

- **To SUB-5 (NEU-997), OUT-8.** The `I4` input its answer depends on, and the row shape its
  enforcement point reads: one `principal_id`, one `principal_kind`, and the rule that the first is
  a learner key only when the second is `user`. `R-S4-1` is the failure mode to enforce against.
  `CAP-S5-1`'s transport precondition is supplied in design.
- **To SUB-7 (NEU-1001), OUT-3 / OUT-4.** §9.1's four-stage set with its two ordering constraints,
  and `R-S4-3`'s per-process-singleton limit as a deployment-shape input.
- **To SUB-11 (NEU-1004), OUT-16.** This change's own compatibility consequence — seven paths, two
  broken deliberately — for folding into the whole-surface contract, plus `F-S4-4`'s unpriced cost.
- **To SUB-16 (NEU-999).** `F-S4-4` / `R-S4-4`: audit parity across transports is not achieved by
  mounting, because there is nothing to mount on.
- **To SUB-17 (NEU-1008).** The `BND-S4-17` disposition and its source (§11), for the resolved-here
  class.
- **To `SUB-10 of C010 (NEU-984)`, co-named `NEU-896`.** The mechanism for `OI-S8-1`, `OI-S8-2` and
  `CC-S8-3`; the naming that fires limb one of `OI-S8-2`'s resolving event; and `R-S4-3`'s
  deployment-shape limit.
- **To the creator, as sole operator.** `R-S4-2` — the deploy pipeline's own smoke run is a consumer
  of this rule and has not been adapted — and `OI-S4-1` / `OI-S4-2`.
