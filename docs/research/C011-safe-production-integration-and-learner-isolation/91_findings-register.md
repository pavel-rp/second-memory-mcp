# `91` — Findings register

**Charter:** C011 (umbrella NEU-893) · **Opened:** 2026-08-25 · **Verification cutoff:** `546ee90`, 2026-08-25
**Model:** claude-opus-5[1m]

Append-only. Each sub-task appends its own `### SUB-<n>` section. No sub-task reflows, renumbers, or
rewrites another sub-task's entries. On a merge conflict in this file, keep **both** sides.

## What this register records

| Field | What it records |
| --- | --- |
| **Id** | `F-S<n>-<k>` |
| **Finding** | The fact, stated as a fact. |
| **Evidence** | What establishes it — a real path, an upstream package with its version or date, or a tracker record with its read date. |
| **Consequence** | What is weaker, riskier or differently-shaped because this is true. |
| **What is assumed rather than derived** | Where the finding rests on an inverted dependency, the specific inputs that were assumed, each cited by id. |
| **Handed to** | Who must act on it, and what they receive. |

## The standing rule OUT-18 owns

§ Constraints states feature-wide: *"Any further exception must be argued and registered the same
way; **an unregistered mutation is a blocking finding** — raised by OUT-18, which owns this
discipline, and landing in the findings register."*

**This register is that landing route.** A mutation the access audit surfaces that is not a
registered argued exception is recorded here as a **blocking finding with a named owner** — never
absorbed into the access audit's prose, and never reported only as a deviation from the zero-mutation
count. The audit reports the count *and* enumerates the single registered exception; anything outside
that becomes an entry here.

**At revision 1 the rule has fired zero times.** The access audit
(`01_production-evidence-and-the-access-audit.md` §3) reports zero production operations of any kind,
so there was no mutation to register, registered or otherwise. **Zero blocking findings on this
trigger** is a measured result, not an absence of checking.

---

### SUB-1

#### `F-S1-1` — `context_tokens` carries no principal binding of any kind

- **Id:** `F-S1-1`
- **Finding:** The `context_tokens` table has exactly three columns — `id` (text, primary key), `createdAt` (bigint, epoch ms) and `expiresAt` (bigint, epoch ms) — with a single index on `expiresAt`. There is no `sub`, no `azp`, no learner column, and no foreign key to any owner. A context token therefore identifies a session's existence and lifetime and nothing about whose session it is.
- **Evidence:** `src/infrastructure/db/schema.ts` at cutoff `546ee90`, 2026-08-25. The minting path is `src/server/server-context-tools.ts`, where `init_agent_context` calls `createContextToken()` in parallel with `buildLearnerContext()`, the latter fail-open (a failure yields `null`, not an error).
- **Consequence:** The token-bound identity decision C010 settled in `DR-C10-S8-2` — bind the principal to the `context_tokens` row **at mint time** — has no column to bind to today. Every gated tool call therefore passes a token that cannot attribute the request to a principal, which is precisely the gap OUT-7 and OUT-13 exist to close. It also means a pre-existing token cannot be grandfathered into a bound world, because there is nothing in the row from which to infer its owner: `DR-C10-S8-2`'s "reject, do not grandfather" position is the only available one, and this finding is why.
- **What is assumed rather than derived:** Nothing. The schema is read directly at a stated cutoff.
- **Handed to:** **SUB-4** (NEU-996), which binds the context token to a principal, and **SUB-13** (NEU-1006), which authors the DDL. Both receive the exact current column set above, so neither has to re-read it.

#### `F-S1-2` — C011's production-evidence base is empty of live observation, and the design proceeds on repository-derived evidence alone

- **Id:** `F-S1-2`
- **Finding:** Not one of the nine designed production spikes was executed. No production credential of any kind was available to the authoring environment — `SMOKE_PROD_CLIENT_ID`, `SMOKE_PROD_CLIENT_SECRET`, `DATABASE_URL`, `AUTH_ISSUER`, `AUTH_AUDIENCE`, `VPS_HOST` and `VPS_SSH_KEY` are all unset — so no token was minted for any principal shape and no read-only inspection of the production database, its metrics or its logs was performed. The single registered exception to the zero-mutation constraint was registered and **not exercised**.
- **Evidence:** `96_spike-register.md`, nine entries each recording `Result: not executed` with its reason; `93_open-items-and-provisional-register.md`, nine owned open items; `01_production-evidence-and-the-access-audit.md` §3, the access audit.
- **Consequence:** This is the finding that shapes the rest of the package, and it cuts in two directions. **The discipline held perfectly** — zero mutations, zero unregistered operations, zero unredacted captures, no shape substituted from another flow, and nothing fabricated to fill a register row. **And the evidence base the discipline was protecting is empty.** OUT-1 and OUT-5 must therefore derive the identity rule from `docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md` and from `src/transport/jwt-middleware.ts` rather than from an observed token, and must state that derivation as `[unconfirmed]` against `OI-S1-1` … `OI-S1-3`. C010 handed `OI-S1-2` forward once rather than observing it; **C011 has now handed an analogous set forward a second time**, and that is a fact about the program rather than about either package's diligence. Every downstream sub-task inherits nine `[unconfirmed]` platform claims instead of nine observations.
- **What is assumed rather than derived:** Nothing about the environment — the credential absence was probed directly. What *is* assumed downstream, and must be stated by its consumers rather than here, is the claim content of all three principal shapes; those assumptions are enumerated at `OI-S1-1`, `OI-S1-2` and `OI-S1-3`, with `OI-S1-3` additionally recording what OUT-1 and OUT-5 must assume in its absence.
- **Handed to:** **Every later C011 sub-task**, which receives nine owned open items with named owners and observable resolving events instead of nine observations; and **`NEU-896` at convergence**, which receives the program-level fact that the production-evidence gap has now survived two consecutive packages. Escalation is carried as `R13` in `92_risk-register.md`.

#### `F-S1-3` — The DCR principal shape cannot be observed through the endpoint the deployment's own CI uses, so no substitution is possible even in principle

- **Id:** `F-S1-3`
- **Finding:** A dynamically registered client receives a random, non-URL `client_id` of the form `dyn$<random>`, and **a DCR client can therefore never obtain `aud = <resource URL>` on Rauthy.** The `client_credentials` endpoint that `.github/workflows/cd-prod.yml` calls mints only the CI smoke principal's shape. The DCR shape is reachable only through the remote connector's dynamic-client-registration plus authorization-code flow, so it must be captured from an existing authenticated session.
- **Evidence:** `docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md`; the token request at `.github/workflows/cd-prod.yml`; the acceptance rule implemented in `src/transport/jwt-middleware.ts`, which admits `aud` equal to `AUTH_AUDIENCE`, or any `dyn$`-prefixed `aud`, or an absent `aud` with a `dyn$`-prefixed `azp`.
- **Consequence:** The temptation this closes off is a specific and plausible one: running the `client_credentials` grant three times and presenting the results as three shapes. That would be **silently wrong**, because the shapes differ in exactly the field the identity rule turns on — `sub`. A `client_credentials` capture has `sub` absent by design, so substituting it for the DCR shape would fabricate evidence for the proposition that DCR principals have no `sub`, which is the very question `OI-S1-3` exists to answer. The structural impossibility is therefore a **safeguard**, not merely an obstacle, and it is recorded so a later session does not rediscover the shortcut and take it.
- **What is assumed rather than derived:** Nothing. ADR-0001 states the `dyn$` form and the never-`aud`-equals-resource-URL consequence directly.
- **Handed to:** **SUB-2** (NEU-994), which must write the identity rule total over the `sub`-absent case without treating the three shapes as interchangeable; and any later session tempted to close `OI-S1-3` cheaply.

---

**SUB-1 register totals at revision 1:** three findings, `F-S1-1` … `F-S1-3`. **Zero blocking
findings** on the unregistered-mutation trigger, because zero production operations were performed.

**No contradiction with C010 was found.** SUB-1's facts were checked against C010's published
package — in particular `../C010-system-and-repository-architecture/decision-records/DR-C10-S10-2_deployment-shape.md`
(deployment shape, hosting/TLS/backup/monitoring non-discoverability) and `DR-C10-S8-2`
(token-bound identity) — and every one is consistent with it or cites it. **No amendment is routed
to `NEU-895` by SUB-1.** The check is recorded so SUB-17's audit can see that it ran and returned
empty, rather than having to infer it from the absence of an amendment.
