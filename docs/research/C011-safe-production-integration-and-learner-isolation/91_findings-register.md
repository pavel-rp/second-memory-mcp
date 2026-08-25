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

---

### SUB-2

#### `F-S2-1` — The production static client is named in the repository, and it — not the DCR client — is the learner path

- **Id:** `F-S2-1`
- **Finding:** ADR-0001's NEU-909 amendment states that *"the claude.ai connector in production authenticates with a **manually provisioned static client** (`claude-web`) rather than DCR"* and that *"prod sets `claude-web`"* as the `AUTH_ADDITIONAL_AUDIENCES` value. Two things follow. First, the **production human-learner path is principal shape 2 (static client), not shape 3 (DCR)**. Second, the static client's **identity** is repository-established; only its **claim set** is unobserved.
- **Evidence:** `docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md:65`, `:67`, read at cutoff `86fb38a`. Corroborated by `.env.example:63` (`# AUTH_ADDITIONAL_AUDIENCES=claude-web`) and by the middleware's own comment at `src/transport/jwt-middleware.ts:64`–`:66`. The parse site is `src/config/resolve-auth-config.ts:95`.
- **Consequence:** It narrows two SUB-1 records without contradicting either. C011's `OI-S1-2` states *"neither which client that is nor what its token carries has been observed"* — the first half is now answered from the repository, so the residual is only the claim set, carried forward as `OI-S2-2`. And `01_production-evidence-and-the-access-audit.md` §2 calls the DCR shape *"the shape OUT-1 and OUT-5 most need"*; on this amendment the shape that most needs observing is the **static client**, because that is where the human is. It also kills, on evidence rather than on principle, the tempting rule *"`dyn$` audience means a human"* — see `decision-records/DR-C11-S2-2_principal-kind-and-the-service-principal-disposition.md` rejected alternative 4, where that rule would have misclassified the actual production learner as a machine.
- **What is assumed rather than derived:** Nothing about the client's *identity* — ADR-0001 names it directly. What remains assumed, and is stated as such wherever it is used, is the **grant type** `claude-web` uses and therefore whether its tokens carry a human `sub`; that is `OI-S2-2`, not a derivation.
- **Handed to:** **SUB-1's record is not amended** — `SPK-S1-2`'s statement that *"`cd-prod.yml` never names it"* is accurate, and the naming sits in a different document. This is a narrowing, and **no finding is routed against SUB-1**. Handed to **SUB-4** (NEU-996), **SUB-5** (NEU-997), **SUB-7** (NEU-1001) and **SUB-16** (NEU-999), each of which would otherwise design against the wrong shape as the learner path; and to whoever executes `SPK-S1-2` / `SPK-S2-2`, who now knows which client to ask for.

#### `F-S2-2` — `OI-S1-2` denotes two different facts in two packages, and a bare reference to it is ambiguous

- **Id:** `F-S2-2`
- **Finding:** The id `OI-S1-2` is live in both packages and means something different in each. In C010 it is *"The authenticated subject a token yields may be an OAuth client, not a human learner"* — the human-`sub` question, List B `H5`, owner moved to `NEU-893`. In C011 it is SUB-1's own item: *"The pre-registered static client's real claim set is unobserved, and the client is unnamed."* The two are related — the second is evidence that would help settle the first — but they are not the same record, have different owners and close on different events.
- **Evidence:** `../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:74`–`:83` and `:615`; `93_open-items-and-provisional-register.md` § `OI-S1-2` (SUB-1). Both read at cutoff `86fb38a`.
- **Consequence:** Every unqualified `OI-S1-2` in this package is ambiguous, and the two readings pull in opposite directions on the one question that matters most: whether the item is **owned here** (C010's, yes) or **open here** (C011's, also yes, but as an evidence gap SUB-1 raised). A reader who conflates them will conclude either that C011 has closed its own static-client observation, or that C010's `H5` is SUB-1's to answer. Neither is true. The package's id convention scopes `S<n>` to the sub-task but says nothing about the **package**, so the collision is a real gap in the convention rather than a mistake by either author.
- **What is assumed rather than derived:** Nothing. Both entries are read directly.
- **Handed to:** **Every later C011 sub-task**, with the disambiguation rule this sub-task adopts and applies: **a cross-package open item is always written qualified** — *C010's `OI-S1-2`* — exactly as the house style already requires for a C010 sub-task reference (`README.md` § "Id conventions"). A bare `OI-S1-2` always means this package's own. Also handed to **SUB-14** (NEU-1007), which owns the house style and may wish to state the rule in `README.md` for the package rather than leaving it in this entry, and to **SUB-17** (NEU-1008), whose citation audit would otherwise have to adjudicate each occurrence.

#### `F-S2-3` — OUT-5's success measure and this sub-task's fourth acceptance condition are unsatisfiable at position 2, because they presuppose evidence SUB-1 could not obtain

- **Id:** `F-S2-3`
- **Finding:** OUT-5's charter success measure requires the human-`sub` question to be *"answered from a **real token obtained from the production Rauthy IdP** (OUT-18), not from inference"*, and this sub-task's acceptance requires C010's `OI-S1-2` to be recorded *"as **closed with the observed value**"*. **No token was obtained, for any of the three principal shapes, so there is no observed value and the condition cannot be satisfied as written.** Both were authored on the expectation that OUT-18 would deliver observations; OUT-18 delivered a complete access discipline and an empty evidence base.
- **Evidence:** `96_spike-register.md` — `SPK-S1-1`, `SPK-S1-2`, `SPK-S1-3`, each `Result: not executed`; `91_findings-register.md` § `F-S1-2`; `94_caps-and-incomplete-scope.md` § `CAP-S1-1`; `92_risk-register.md` § `R13`, which records the position as `n = 0` rather than the charter's assumed `n = 1`. C010's `OI-S1-2` resolving event at `../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:82` is *"A live production token is inspected and its `sub` claim recorded."*
- **Consequence:** This sub-task ships with **one acceptance condition not met**, and it is reported rather than reinterpreted. The three available responses were: record a closure that did not happen; silently restate the condition as satisfied by repository evidence; or deliver everything the condition's *design* half asks for, decline its *evidence* half, and register the gap. The third is taken. The concrete effect is that OUT-5's outcome-register row carries a **not-met** measured result, `A-35` spans all three shapes rather than one, and no downstream sub-task may treat the human-`sub` question as settled. **The identity rule itself is unaffected** — it is total over every answer — so the unmet condition costs the package a confirmed population, not a decision.
- **What is assumed rather than derived:** Nothing. The absence of every credential was probed directly by SUB-1 and is recorded per spike.
- **Handed to:** **`NEU-896`** at convergence, which receives the program-level fact that an acceptance condition written against production evidence has now gone unsatisfiable for a second consecutive package — `F-S1-2` records the first — and which is the only party that can decide whether the identity design proceeds without it. **The creator, as sole maintainer and sole operator**, as the only holder of the credentials that would close it. And **SUB-17** (NEU-1008), whose completeness audit would otherwise have to discover the unmet condition itself; it is named here so the audit finds it declared.

---

**SUB-2 register totals at revision 1:** three findings, `F-S2-1` … `F-S2-3`. **Zero blocking
findings** — none of the three meets a blocking trigger: `F-S2-1` and `F-S2-2` are narrowings of
existing records, and `F-S2-3` is an unmet acceptance condition with a named owner and an
escalation route, not an unregistered mutation.

**No contradiction with C010 was found by SUB-2.** The identity rule was checked against
`DR-C10-S8-2` (which treats the principal as an already-resolved opaque value and does not itself
choose `sub` over `azp`, so naming the claim is an addition), against check `I5`
(`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:174`,
consumed as stated), against `NEU-850`'s `OUT-2`
(`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:50`–`:51`
— the key is the JWT subject written verbatim into `user_id`, and the kind discriminator lives on the
`context_tokens` binding rather than on the owning row, so the single ownership column is
undisturbed), and against `A-28`'s tolerance envelope
(`../C010-system-and-repository-architecture/93_stand-in-assumption-register.md:104`–`:115`, not
breached). **No amendment is routed to `NEU-895` by SUB-2.** The checks are recorded so SUB-17's
audit can see that they ran and returned empty.
