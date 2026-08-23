# `DR-C10-S8-2` — Identity is bound to the context token at issue time, not carried per call

**Task:** NEU-981 (SUB-8) · **Charter:** C010 (umbrella NEU-895) · **Decided:** 2026-08-22 · **Verification cutoff:** `ad5eebb`, 2026-08-22
**Model:** claude-opus-5[1m]
**Discharges:** part of `OUT-6` (`../01_outcome-register.md`) — the compatibility contract's obligated option, published as `../12_application-versus-core-rule-and-compatibility-contract.md` §9.

---

## Decision

**The compatibility contract obligates `CC-S8-2`: the authenticated principal is bound to the context
token at issue time, server-side. `CC-S8-4` — carrying identity as a per-call tool argument — is
rejected.** Concretely:

1. **`context_tokens` gains a principal column.** It carries `id`, `created_at`, `expires_at` today
   (`src/infrastructure/db/schema.ts:312`–`:321`) and names no principal, which is what makes this option
   live rather than hypothetical.
2. **`init_agent_context` becomes the binding point.** It already mints the token
   (`ctx.createContextToken()`, `src/server/server-context-tools.ts:11`) and returns it. It must resolve
   the authenticated principal at mint time and bind it, and **refuse to mint** when none exists rather
   than issue an unbound token.
3. **No tool input schema changes.** All 43 gated tools already declare `context_token`; **zero** schemas
   newly declare an identity argument and there is **no bulk schema migration**. What changes is the
   argument's *meaning* — from a session handle to a principal-bearing capability.
4. **Tokens minted before the change carry no principal and must be rejected, not grandfathered.**
5. **The exempt three are decided separately and not uniformly.** `init_agent_context` changes contract
   (clause 2). `get_server_info` and `get_server_workflow` return static server metadata, touch no learner
   state, and change under neither option. **1 of 3 changes.**
6. **This decision is HTTP-qualified and does not close STDIO.** STDIO produces no authenticated principal
   at all, so there is nothing to bind. `CC-S8-3` — a STDIO gate — remains a separate, breaking, **unowned**
   core change (`OI-S8-2`).
7. **The obligation is on unwritten code.** No principal column exists and no regression suite exists to
   detect a break in it (`CAP-S8-1`).

---

## Rationale

The criteria set, weighted **before** the scoring:

| Criterion | Weight | Why |
| --- | --- | --- |
| **Forgeability by the caller** | **decisive** | An identity mechanism the caller can assert is not an identity mechanism. Everything else is a cost comparison; this is a correctness one. |
| **Wire compatibility** | high | SUB-5's obligation requires existing callers keep working. |
| **Semantic compatibility** | high | The invisible half of the same obligation, and the one a diff cannot police. |
| **Blast radius of a defect** | high | How many independent places can get it wrong. |
| **Transport coverage** | high | SUB-5's obligation is explicit that a core change *"must hold across both transports, including STDIO, which has no auth"*. |
| **Store cost** | medium | Real, but a migration is a known quantity. |

**Forgeability decides it, and the two options are not close on that axis.** An identity carried in a tool
argument is caller-supplied. Nothing in the MCP argument path distinguishes *the client's true subject*
from *a subject the client typed*. Making it trustworthy requires the server to cross-check the argument
against the transport-level principal — at which point the argument is redundant with the check that makes
it trustworthy, and all that remains is 43 opportunities to forget the cross-check. The context token, by
contrast, is **server-minted**: binding at issue time means the caller never names its own identity, so
there is nothing to forge.

**The fact that made per-call identity look cheap is the same fact that makes token-binding cheap — and
sound.** All 43 gated tools already declare `context_token` (§7.3), so a per-call identity slot appears to
cost nothing: zero schemas newly declaring, no bulk migration. But the value already flowing through that
slot is already server-minted. The slot's existence is an argument **for** binding the thing already in it,
not for adding a second, weaker thing beside it.

**On semantic compatibility the two options differ in direction, not just degree.** Per-call identity
**widens** an argument's meaning across 43 tools simultaneously — every one of which must then be trusted
to interpret it identically. Token-binding **narrows** one server-side check: the client-visible contract
is unchanged in shape and strictly stricter in effect, and the enforcement lives at one mint point and one
middleware rather than at 43 call sites.

**Transport coverage does not separate the options, and the honest statement is that neither satisfies
SUB-5's obligation in full.** `F-S5-4` establishes that *"a column cannot supply a principal the transport
never produced"* — every in-domain category fails at `I4` before confinement is assessed, because STDIO
produces no principal. Per-call identity under STDIO would be **worse than nothing**: entirely
caller-asserted, with no authenticated principal to check against, while *looking* like identity.
Token-binding under STDIO refuses to mint, which is a smaller surface and an honest failure. Neither closes
`I4`. Claiming otherwise would be the transport-unqualified claim `AC-9` forbids.

**The existing plumbing lowers the cost asymmetrically, and it is why this is "connect two things" rather
than "build identity".** `src/transport/jwt-middleware.ts` already resolves a per-request principal into
`res.locals.auth`, and `rate-limit-middleware.ts` already consumes it — but nothing wires it into token
minting. The gap between here and `CC-S8-2` is one column and one call, under HTTP.

---

## Rejected alternatives

### 1. Per-call identity as a **new required** argument on every gated tool

**Rejected on forgeability first, and on wire compatibility second.** A new required argument breaks every
existing client at once — the plain breaking change — and SUB-5's obligation is explicit that existing
callers keep working. **The specific consequence that decided it:** even paying that breakage buys nothing,
because the resulting field is still caller-supplied. It is a breaking change that does not deliver the
property it breaks compatibility for.

### 2. Per-call identity by **reusing the existing `context_token` argument** to carry a principal

The cheapest-looking option: zero schema changes, and it is the reading charter assumption 8 gestures at
when it prices *"the semantics of reusing or widening an argument already declared to every client"*.

**Rejected because it is token-binding with the binding done in the wrong place.** If the token is to
resolve to a principal, the resolution is server-side from server-held state — which *is* `CC-S8-2`. If
instead the caller is to encode a principal into the value it passes, the value stops being a server-minted
capability and becomes a caller assertion. **The specific consequence that decided it:** this option is
indistinguishable from `CC-S8-2` in the diff and opposite to it in the threat model, so it is the option
most likely to be implemented by accident while believing `CC-S8-2` was implemented. It is named here for
exactly that reason.

### 3. Per-call identity as an **optional** argument, honoured when present

Avoids the breaking change of alternative 1.

**Rejected because an optional identity argument is unenforceable by construction.** Any caller can omit
it, so the server must have a fallback — and the fallback is the current behaviour, which is the thing
being fixed. **The specific consequence that decided it:** it produces a system that passes a
cross-principal replay test whenever the argument is supplied and fails it whenever it is not, which is
worse than a uniform failure because it is intermittent and will be read as a flaky test.

### 4. Bind the principal at the **transport edge only**, with no token change

Let `CMP-S4-4` resolve the principal per request from the JWT and scope everything from `res.locals.auth`,
leaving `context_tokens` untouched.

**Rejected because it re-creates the transport asymmetry inside the design rather than at its edge.** The
mechanism would exist only where a JWT exists — HTTP with `authConfig` set — and would be absent not only
on STDIO but on HTTP deployments with auth unconfigured, which `src/transport/http.ts` permits. **The
specific consequence that decided it:** the context token is the one artifact that already crosses both
the gate and the tool surface on every gated call. Binding to it puts the principal on the same path as
the check, which is what makes `RD-S8-1` a meaningful test rather than a test of the deployment's
configuration.

### 5. Defer the choice — publish both options priced, and let the implementation charter pick

Defensible: this package publishes no code, and the implementation charter will know more.

**Rejected because `AC-7` forbids it in terms** — *"names which of the two it obligates; mentioning the
alternative without choosing fails"* — and because the deferral has a specific cost. Alternative 2 shows
the two options are **indistinguishable in review** and opposite in effect. An implementation charter
handed two priced options without an obligation is being handed the opportunity to implement the wrong one
while believing it implemented either. The choice is the deliverable precisely because the difference is
invisible downstream.

---

## Consequences

**Accepted, and stated as costs rather than as neutral facts.**

1. **A migration on `context_tokens`, and a cohort with no correct value.** Tokens minted before the change
   carry no principal. Decision clause 4 rejects rather than grandfathers them, which means a deployment
   window in which live sessions are invalidated. That is a real operational cost, chosen over leaving an
   unbound-token path open indefinitely.
2. **`init_agent_context`'s contract changes without its schema changing.** Its input schema stays empty,
   its behaviour and its failure modes do not. Any client treating "init succeeded" as unconditional will
   now meet a refusal it has no branch for.
3. **43 tools change meaning and nothing in the diff says so.** This is the cost the pricing exists to
   surface. `RD-S8-4` (golden manifest snapshot) is specified to return **zero delta**, and that expected
   zero is itself the assertion — which is why `RD-S8-1` (cross-principal replay) is mandatory alongside
   it. A review that reads only the schema diff will see nothing.
4. **STDIO is not closed, and this decision must not be read as closing it.** `CC-S8-3` remains breaking
   and unowned (`OI-S8-2`). Every security claim resting on this decision is HTTP-qualified.
5. **`F-S5-4` is not resolved.** No state category reaches `holds` before or after. This decision improves
   the HTTP path's principal integrity; it does not satisfy `I4`.
6. **The detection methods are specified, not run** (`CAP-S8-1`). There is no implementation to run them
   against and no regression suite to host them, so this decision's verification is entirely prospective.

---

## Evidence

| What | Where |
| --- | --- |
| `context_tokens` carries `id`, `created_at`, `expires_at` and names no principal | `src/infrastructure/db/schema.ts:312`–`:321` |
| `init_agent_context` mints and returns the token, with an empty input schema | `src/server/server-context-tools.ts:11` (`inputSchema: z.object({}).shape`), `ctx.createContextToken()` |
| The exempt list, verbatim, and the token read | `src/transport/context-token-middleware.ts:5`–`:9`, `:62` |
| The gate is mounted only on HTTP `/mcp`, and only when `contextTokenRepo` is configured | `src/transport/http.ts:186` |
| STDIO mounts no gate, no auth, no origin check, no rate limit, no audit | `src/transport/main.ts:55`–`:59`; `../05_…md` `CMP-S4-5`, `BND-S4-17` (owner **nobody**) |
| Per-request principal resolution already exists: `payload.sub` falling back to `azp` | `src/transport/jwt-middleware.ts`; consumed by `src/transport/rate-limit-middleware.ts` |
| The principal is an OAuth client, not necessarily a person — `fails-principal` | `../06_…md` §4.1; `F-S5-4`; `docs/GLOSSARY.md` → `authenticated principal` |
| A column cannot supply a principal the transport never produced; no category reaches `holds` | `F-S5-4`; `CAP-S5-1` |
| The backward-compatibility obligation: reusable, backward-compatible, non-DP-specific, **across both transports including STDIO** | `../06_…md` §6.1 |
| 46 registered / 43 gated / 3 exempt; 43 of 43 declare `context_token` (41 + 2) | `12_…md` §7.1–§7.3, re-derived at `ad5eebb`; corroborates `F-S5-3` |
| The charter's pricing of the per-call option, including the token-bound alternative as "the live alternative" | Charter C010 assumption **8** (`confirmed`) |
| Zero `user_id`/`userId` anywhere in the schema | `../04_…md` §6 |
| `SC-S3-13` (context tokens) authority `CMP-S4-9`, enforced at `CMP-S4-4`, clause 5 | `../10_…md` §8 |
| A web-originated mutation arrives **gated but not attributed** | `F-S7-4` — handed to SUB-8 (NEU-981) by `../10_…md` §8.3 |

**Evidence class.** The code facts are `confirmed` at cutoff `ad5eebb` with paths and lines. The identity
placement, the isolation invariant and `F-S5-4` are `consumed` from `../06_…md` — honoured, not re-derived.
The decision itself is `[unconfirmed]`: nothing implements it, and `CAP-S8-1` records that its detection
methods are specified rather than executed.

**A green type-check or lint line is not evidence about this decision** and appears nowhere above.

---

## Revision trigger

This record is revised — not patched — when any one of the following becomes observable:

1. **STDIO acquires an authenticated principal** — `CC-S8-3` lands, or a transport-level identity mechanism
   is adopted. Decision clause 6's qualification lifts, `I4` becomes assessable for the first time, and the
   refuse-to-mint behaviour in clause 2 needs re-deciding rather than amending.
2. **NEU-850's `OUT-2` lands in a shape that binds identity somewhere other than the token** — for example
   a per-request principal threaded through `AppContext` or the port boundary. The store cost and the blast
   radius in the Rationale were both scored against binding at the token; a different binding point changes
   both.
3. **The MCP protocol acquires a first-class caller-identity channel** distinct from tool arguments. That
   would introduce a third option which is neither of the two assessed here, and the forgeability criterion
   — the decisive one — would have to be re-scored against it rather than assumed to favour the token.
4. **A cross-principal replay (`RD-S8-1`) passes against an implementation believed to satisfy this
   decision.** That is the observable signature of alternative 2 having been implemented by accident, and
   it reopens the decision rather than merely filing a bug.
5. **`context_tokens` acquires a principal column with no rejection of pre-existing unbound tokens.**
   Decision clause 4 is then violated in the implementation, and the grandfathering path must be either
   removed or decided explicitly here.
