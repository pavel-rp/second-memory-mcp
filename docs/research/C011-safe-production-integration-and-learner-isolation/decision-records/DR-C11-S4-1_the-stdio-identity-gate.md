# `DR-C11-S4-1` — STDIO is gated, and its principal is server-held deployment configuration rather than a caller-presented credential

**Task:** NEU-996 (SUB-4) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-25 · **Verification cutoff:** `5111841`, 2026-08-25
**Model:** claude-opus-5[1m]
**Discharges:** OUT-7 (`../90_outcome-register.md`) — the identity gate on the transport that has none, and the disposition of `BND-S4-17`

---

## Decision

**The STDIO transport is gated on the same terms as HTTP. The principal it gates on is read from
server-held deployment configuration at start-up, never from the caller; where no principal is
configured, every gated tool is refused and nothing is minted.** Six clauses.

1. **STDIO is gated.** The three exempt tools answer unauthenticated as they do today. The 43 gated
   tools require a context token bound to a principal, on the terms `DR-C10-S8-2` sets for HTTP.
2. **The STDIO principal is server-held configuration.** A STDIO process is launched with a
   principal identifier and an **explicitly declared principal kind**, supplied through the same
   configuration channel every other transport setting uses, read at start-up, and never influenced
   by the caller.
3. **With no principal configured, the transport refuses every gated tool and mints nothing.** This
   is `DR-C10-S8-2` clause 2 applied — *"refuse to mint when none exists rather than issue an
   unbound token"* — not a new rule. An unconfigured deployment is **inert, not open**.
4. **Audit logging reaches STDIO on the same terms as the gate**, with the cost stated rather than
   assumed: the audit path is Express-typed, so this is a rewrite and not a mount.
5. **A caller-presented bearer token on STDIO is an operator-elective superset, not the baseline.**
   Where an operator provisions a static client at the authorization server, a STDIO client may
   present a token and the principal resolves by exactly the HTTP rule, with no second code path.
6. **The gate-exempt set stays at exactly three**, restated as a decision rather than inherited
   silently, consistent with `DR-C10-S8-2` clause 5's non-uniform treatment of the three.

---

## Rationale

**The shape of the production deployment eliminates the obvious answer before it is evaluated.**
`F-S2-1` (`../91_findings-register.md`) establishes that the production learner authenticates with a
manually provisioned **static client**, `claude-web`, *"rather than DCR"*
(`docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md:65`). Under a DCR deployment the
STDIO gate nearly designs itself — each installation self-registers and the token binds to its own
client id. Here there is no self-registration path at all, so requiring a bearer token on STDIO
means a **manual per-installation provisioning act at the authorization server**. That is why clause
5 offers the bearer path rather than requiring it.

**And the value that path would yield is the wrong value anyway.** A self-registered client's
identity arrives as `azp`, and `DR-C11-S2-1` fixes that `azp` is never a learner key. A token bound
to an `azp` authorizes a *client installation*, not a *learner* — the exact confusion OUT-7 and
OUT-13 exist to remove.

**What is left is what `I5` asks for.** With the caller ruled out, the client registry non-existent,
and the audience carrying no learner information (every `claude-web` learner presents the same bare
client id), the only remaining source is state the server already holds. Check `I5` asks whether the
principal is *"server-derived rather than caller-asserted"* and its kind *"determined rather than
assumed"* (`../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:174`).
Deployment configuration is server-held, is not enumerable or forgeable by the caller, and carries a
kind the operator declares and the server reads. Both clauses are met without inventing a flow this
deployment cannot supply.

**Refusal is the failure direction because the alternative reproduces the gap.** Clause 3's refusal
is not this chapter's invention; it is already obligated. C010 also warned specifically against
softening the change *"with a permissive mode, which would reproduce the current gap under a new
name"* (`../../C010-system-and-repository-architecture/12_application-versus-core-rule-and-compatibility-contract.md:552`).

---

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **Leave STDIO ungated**, with an argued rationale and a named owner | Fails the invariant clause the charter attaches to this option. C010: *"a transport that produces no principal fails I4 whether or not anyone can currently reach it"* (`../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:482`–`:485`). Every in-domain category stays at `fails-transport` permanently, so no reading of the invariant makes it compatible. It also ratifies `BND-S4-17`'s owner-`nobody` state rather than ending it, and the reachability argument does not rescue it because `TRANSPORT` defaults to `stdio` (`src/config/resolve-transport-config.ts:35`) |
| 2 | **Require a caller-presented bearer token on STDIO** as the baseline | Not wrong, but unaffordable by default under `F-S2-1`: with no DCR path, every STDIO installation becomes a manual provisioning task at the authorization server. Kept as clause 5's elective superset precisely because it is strictly better where an operator will pay for it |
| 3 | **Let each STDIO client self-register through DCR and bind to its `azp`** | Rejected twice over. On evidence: DCR is not the production learner path (`F-S2-1`), so this builds the gate against the shape the learner does not use. On rule: `DR-C11-S2-1` fixes that `azp` is never a learner key, so the resulting token would authorize an installation rather than a learner |
| 4 | **Accept a per-call `subject` or `learner_id` argument on STDIO**, since there is no token to carry it | Directly rejected by the decision this chapter consumes. `DR-C10-S8-2`: *"An identity carried in a tool argument is caller-supplied. Nothing in the MCP argument path distinguishes the client's true subject from a subject the client typed."* It would also make STDIO's rule structurally different from HTTP's, which is the thing check `I4` measures |
| 5 | **Mint an unbound token on STDIO and scope it to nothing** | Forbidden by `DR-C10-S8-2` clause 2, and independently by `DR-C11-S2-2`'s refuse-don't-empty-scope rule: a zero-scoped result is indistinguishable from a learner with no data, so the failure is silent where a refusal would be observable |
| 6 | **Disable the STDIO transport entirely** | Superficially the safest answer and materially the most destructive one: `TRANSPORT` defaults to `stdio` (`src/config/resolve-transport-config.ts:35`), so this breaks every local, development and harness invocation that never set the variable. It also converts a security decision into an availability decision that C010 does not ask for — the invariant wants a principal produced, not a transport removed |

---

## Consequences

1. **The change is breaking, and is stated as breaking.** Every existing STDIO client calling a
   gated tool begins to fail until a principal is configured. No permissive mode is offered.
2. **The largest broken class is the one nobody chose.** Because `TRANSPORT` defaults to `stdio`,
   the default invocation is the ungated one, so the migration surface is wider than an opt-in
   reading of STDIO suggests.
3. **A cost lands that `CC-S8-3`'s classification does not price.** There is no STDIO transport
   module: the path is four inline lines at `src/transport/main.ts:55`–`:59`, and both the gate and
   the audit path are Express `RequestHandler`s. "Mount the gate on STDIO" is a rewrite against a
   transport-neutral seam that does not exist. Recorded as `F-S4-4`.
4. **A per-process singleton limit is introduced.** One STDIO process serves one configured
   principal, so two learners sharing one process are both confined to that principal — correctly
   by the gate's rule, wrongly for one of them. Recorded as `R-S4-3`, owner
   `SUB-10 of C010 (NEU-984)`, co-named `NEU-896`.
5. **`BND-S4-17` gains an owner.** This decision is the naming act limb one of `OI-S8-2`'s resolving
   event admits (`../../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:429`),
   and it names `SUB-10 of C010 (NEU-984)`, co-named `NEU-896`.
6. **Check `I5` becomes reachable rather than merely evaluable.** SUB-2 made it evaluable; closing
   `I4` advances the frontier to it, which is C010 §4.3's stated consequence and not a surprise.
7. **What becomes harder:** every STDIO deployment now has a configuration prerequisite it did not
   have, and an operator who does not perform it gets a server that answers three tools and refuses
   forty-three. That is the intended failure direction, and it will be experienced as a regression
   by anyone who did not read the release note.

---

## Evidence

| Claim | Source |
| --- | --- |
| STDIO carries no auth, no origin check, no rate limit, no audit and no gate | `src/config/resolve-auth-config.ts:2`, `:105`; `src/config/resolve-rate-limit-config.ts:31`; `src/transport/http.ts:108`, `:123`, `:164`, `:173`, `:180`, `:186` |
| There is no STDIO transport module; the path is four inline lines | `src/transport/main.ts:55`–`:59`; `src/transport/audit-middleware.ts:23`; `src/transport/context-token-middleware.ts:43` |
| `TRANSPORT` defaults to `stdio` | `src/config/resolve-transport-config.ts:35` |
| The gate-exempt set is exactly three | `src/transport/context-token-middleware.ts:5`–`:9`; `src/server/server-context-tools.ts:21` |
| The production learner path is a static client, not DCR | `docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md:63`–`:67`; `../91_findings-register.md` § `F-S2-1` |
| `azp` is never a learner key; kind is determined, not inferred from audience | `DR-C11-S2-1_the-persisted-learner-key.md`; `DR-C11-S2-2_principal-kind-and-the-service-principal-disposition.md` |
| Refuse-to-mint rather than issue unbound; HTTP-qualified; STDIO left open | `../../C010-system-and-repository-architecture/decision-records/DR-C10-S8-2_token-bound-identity-over-per-call-identity.md` clauses 2, 5, 6 |
| The invariant's verdict is unconditional on STDIO reachability | `../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:482`–`:485` |
| Check `I5`'s wording | `../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:174` |
| `BND-S4-17`, class *trust — unenforced*, owner `nobody` | `../../C010-system-and-repository-architecture/05_system-context-and-responsibility-boundaries.md:197` |
| `OI-S8-2`'s resolving event and its three admissible naming parties | `../../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:429` |
| `CC-S8-3` priced as breaking, and the warning against a permissive mode | `../../C010-system-and-repository-architecture/12_application-versus-core-rule-and-compatibility-contract.md:233`, `:552` |

---

## Revision trigger

- **`OI-S2-3` closes with a positive answer** — a `dyn$` DCR client is found to carry real
  production traffic. That would not restore the DCR-shaped answer (rejected alternative 3 also
  fails on the `azp` rule), but it would change the weight of rejected alternative 2 by showing a
  self-registration path is live after all.
- **The operator declines a configured STDIO principal** (`OI-S4-1`), which forces clause 5's
  elective bearer path to become the baseline and re-opens rejected alternative 2.
- **The deployment-shape answer establishes that no STDIO edge exists and none can be created** —
  which would not change the verdict (see rejected alternative 1) but would change the staging
  urgency `SUB-7` reads off it.
- **A transport-neutral middleware seam lands on `origin/develop`**, which retires consequence 3 and
  makes clause 4 a mount rather than a rewrite.
