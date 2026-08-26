# Production evidence, the access audit, and what the repository cannot supply

**Sub-task:** SUB-1 (NEU-993) · **Covers:** OUT-18
**Written:** 2026-08-25 · **Model:** claude-opus-5[1m]
**Codebase cutoff:** `origin/develop` @ `546ee90`
**Depends on:** — (position 1; no predecessor sub-task)
**Consumes:** `../C010-system-and-repository-architecture/decision-records/DR-C10-S10-2_deployment-shape.md` (deployment shape; hosting, TLS, backup and monitoring non-discoverability) and `DR-C10-S8-2` (token-bound identity), both published 2026-08-22.
**Decision records:** `DR-C11-S1-1`, `DR-C11-S1-2`, `DR-C11-S1-3` · **Traceability:** `traceability/S1_production-evidence.md`

---

## 0. What this chapter is

The record of C011's production-evidence episode: what was asked, what the repository could answer,
what it could not, what was therefore attempted, and what came back. It is **evidence capture, not
interpretation.** Turning this evidence into an identity rule is SUB-2's, into recovery objectives
SUB-15's, into a detection design SUB-16's, and into a propagation matrix SUB-9's. Nothing below
does any of those.

**The headline, stated first because burying it would be the failure mode this outcome exists to
prevent: no production observation was obtained.** Nine spikes were designed against nine material
questions and none was executed, because no production credential of any kind was available. Every
claim routed to an owned open item with a named owner. The access discipline held completely — and it
protected an empty evidence base. Both halves are reported.

## 1. The repository-answerable / repository-unanswerable boundary

Every spike must first fail the *"could this have been read from the repository instead?"* test. The
boundary was mapped by an exhaustive read-only sweep at cutoff `546ee90`.

**Answered from the repository, and therefore never spike candidates (six):**

| # | Question | Answered by |
|---|---|---|
| 1 | What request does the deployment's own CI make to obtain a token? | `.github/workflows/cd-prod.yml` — `POST` of `grant_type=client_credentials` to `https://auth.neurasphere.ee/auth/v1/oidc/token`, credentials from the `SMOKE_PROD_CLIENT_ID` / `SMOKE_PROD_CLIENT_SECRET` secrets, response immediately masked and passed to the smoke suite as `MCP_AUTH_TOKEN`. |
| 2 | What are the three principal shapes, as designed? | `docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md`. |
| 3 | Which claims does the code actually consume? | `src/transport/jwt-middleware.ts` (`iss`, `aud`, `azp`, `sub`, optional `email`), `src/transport/http.ts` (session binding on `sub`), `src/transport/rate-limit-middleware.ts` (limiter keyed on `sub`). |
| 4 | What is `context_tokens`' schema, and what mints a row? | `src/infrastructure/db/schema.ts`; `src/server/server-context-tools.ts`. Recorded as `F-S1-1`. |
| 5 | What are the two log tables' schemas, and what writes them? | `drizzle/0010_create_infrastructure_mcp_request_log.sql`, `drizzle/0012_extend_mcp_request_log.sql`, `drizzle/0013_create_operation_event_log.sql`; writers `src/transport/pg-audit-transport.ts` and `src/transport/pg-event-transport.ts`. |
| 6 | What is the deployment shape? | `.github/workflows/cd-prod.yml` — SSH to a single host named by `VPS_HOST`, `git reset --hard`, `docker compose up -d --build`, health poll, **no rollback step**; migrations run unconditionally at boot from `src/transport/main.ts`. Already recorded by C010 in `../C010-system-and-repository-architecture/decision-records/DR-C10-S10-2_deployment-shape.md` and **cited rather than re-derived**. |

**Not answerable from the repository (nine)** — these became `SPK-S1-1` … `SPK-S1-9` in
`96_spike-register.md`. In every case the repository fixes a *design* or a *request* and leaves the
*observation* open: it establishes what a token request is, not what the response carries; what a
schema declares, not what the live database holds; what a writer stores, not what real rows contain;
and it can produce only a negative result about backups and hosting, which cannot distinguish
*absent* from *arranged outside the repository*.

## 2. The three principal shapes, and their acquisition methods

The three shapes are **not interchangeable**, and the method is stated per shape.

| # | Principal shape | Acquisition method (named and distinct) | Outcome |
|---|---|---|---|
| 1 | **`client_credentials` grant** — the CI smoke principal; the shape Rauthy sets `sub = null` for | A direct grant against `https://auth.neurasphere.ee/auth/v1/oidc/token`, exactly the request `.github/workflows/cd-prod.yml` makes, using the smoke principal's own credentials. **This is the single registered exception** to the zero-mutation constraint. | **Not obtained.** `SPK-S1-1` designed, not executed — credentials unset. Routed to `OI-S1-1`. |
| 2 | **Pre-registered static client** | A grant against the statically registered client the deployment configures, using **that client's own credentials** under the project's existing secret conventions — a different principal from shape 1, not the same grant repeated. | **Not obtained.** `SPK-S1-2` designed, not executed — credentials unset, and the repository does not name which static client is configured. Routed to `OI-S1-2`. |
| 3 | **DCR client with `aud = dyn$<random>`** | **Not obtainable from the `client_credentials` endpoint at all.** Issued through the remote connector's dynamic-client-registration plus authorization-code flow, so the only read-only acquisition method is **capturing the decoded claim set from an existing authenticated connector session**. | **Not obtained.** `SPK-S1-3` designed, not executed — no authenticated connector session was available. Routed to `OI-S1-3`. |

**Zero shapes are represented by a capture taken from a different flow.** This is not merely a
procedural nicety, and the reason is recorded as `F-S1-3`: the three shapes differ in exactly the
field the identity rule turns on. Running the shape-1 grant three times and labelling the results as
three shapes would fabricate evidence for the proposition that DCR principals carry no `sub` — the
very question `OI-S1-3` exists to answer. ADR-0001's structural rule that **a DCR client can never
obtain `aud = <resource URL>` on Rauthy** makes the substitution impossible rather than merely
forbidden, which is a safeguard worth naming.

`OI-S1-3` additionally records **what OUT-1 and OUT-5 must therefore assume** in the DCR shape's
absence: that a DCR principal may present with no `sub` at all, so the identity rule must be total
over the `sub`-absent case and must not treat `azp` as human-identifying without evidence. Stating
that assumption is SUB-2's; SUB-1 records only that it is required.

## 3. The access audit

**Scope.** Every operation performed against the production database, the running MCP server, and
the deployment, during the whole of SUB-1's evidence episode.

**Result: zero mutating operations. In fact, zero operations of any kind.**

| Protected system | Operations performed | Mutating operations |
|---|---|---|
| The production database | **0** | **0** |
| The running MCP server | **0** | **0** |
| The deployment | **0** | **0** |

No database write. No schema change. No deployment. No MCP tool call that persists state. No read
either — the audit is stronger than the constraint requires, and that is because no credential was
available rather than because of extra restraint. It is reported as what it is.

**The single registered exception, enumerated.** Obtaining a token from the production Rauthy IdP is
the one permitted state-creating operation. It necessarily mints a token and writes an IdP audit
record — **both of which land outside the three systems the constraint protects**, which is why it is
admissible. It is registered here with its scope and residue as the charter requires.

**It was not exercised.** The exception is registered and unused: zero tokens minted, zero IdP audit
records created.

**`init_agent_context` appears in neither list**, because it is a mutating call SUB-1 never makes. It
is excluded by name rather than by omission: it mints a `context_tokens` row in the production
database and is therefore outside the exception, notwithstanding that it looks like a read-only
bootstrap.

**Unregistered mutations: zero.** The standing rule that an unregistered mutation is a blocking
finding with a named owner, routed to `91_findings-register.md`, is declared there and **fired zero
times**. That is a measured result of a check that ran, not the absence of a check.

## 4. The counts

**Uncertain-and-material production claims: 9.**

| Disposition | Count |
|---|---|
| Closed by dated, redacted, read-only observation | **0** |
| Recorded as an owned open item with a named owner | **9** |
| **Total** | **9** |

The two dispositions sum to the total; no claim is unaccounted for. Each of the nine appears once in
`96_spike-register.md` as `SPK-S1-1` … `SPK-S1-9` and once in
`93_open-items-and-provisional-register.md` as `OI-S1-1` … `OI-S1-9`, one-to-one.

Separately, **six** questions were answered from the repository and were therefore never spike
candidates — enumerated in §1. They are not part of the nine and are not counted as closures by
observation, because reading the repository is not an observation of production.

## 5. The redaction audit

**Scope.** Every capture this sub-task publishes.

**Captures published: 0. Captures containing token material, a signature, or any secret value: 0.**

The audit is **satisfied vacuously**, and is reported as vacuous rather than as a clean audit of a
non-empty set. A zero-over-zero result establishes that nothing leaked; it establishes nothing
whatever about whether the redaction discipline would hold against a real capture. That discipline is
specified in §6 and in `SPK-S1-1`'s method — decode the payload segment only, never the signature;
record each claim name with either its value or a redaction marker — and it remains **untested**, a
residual named in `R8`.

Secret **names** appear throughout this package (`SMOKE_PROD_CLIENT_ID`, `VPS_SSH_KEY`, and so on).
No secret **value** appears anywhere in it.

## 6. The per-capture terms record — the sixth copy class

Charter assumption 39 makes this package's own captured production evidence the **sixth copy class**:
copies of learner-derived data subject to the same erasure duty as any other. Assumption 44 narrows
membership by derivation — SUB-6's dry-run dataset is generated synthetically from the real schema
and read-only aggregate counts, holds no real learner-derived data, and is **not** a member. It is not
SUB-1's concern and no term is set for it.

**The terms are set here, at position 1, before any consumer of them exists.** They apply to every
capture this package produces, whenever it is produced.

| Term | Value |
|---|---|
| **Class** | Sixth copy class — C011's own captures of real learner-derived production data. |
| **Members at revision 1** | **None.** Zero captures were produced. |
| **Named owner** | The creator, as sole maintainer and sole operator of the production deployment. |
| **Retention bound** | A capture is retained only until the decision it was taken to settle is published in this package, and in no case longer than the package's own publication. |
| **Destruction condition** | **Tied to the package's publication:** on publication of C011 under `docs/research/`, every capture is destroyed at its quarantine path. What survives publication is the redacted claim *names* and the derived conclusion in the register — never the capture. |
| **Redaction discipline** | Payload segment only; never the signature. Each claim recorded as a name plus either a value or a redaction marker. No token material, no secret value, published. |
| **Quarantine path** | `_local/scratch/` — gitignored, outside `src/`, `tests/` and `drizzle/`. |

**Empty membership is not absent terms.** SUB-3 (position 3) inventories these terms **as recorded** —
it reads them, it does not set them — and SUB-9 (position 11) reads them and assigns the class its
propagation action. Both need the terms to exist regardless of whether any capture does, which is why
they are written here rather than deferred until a capture appears. The data flow is forward-only:
**SUB-1 records → SUB-3 inventories → SUB-9 propagates.** SUB-1 asks nothing of either and asserts
nothing about their artifacts; whether the assembled class in fact contains every capture is SUB-9's
acceptance at position 11.

## 7. Source-change confirmation

`git diff --name-only origin/develop` for this branch lists files **only** under
`docs/research/C011-safe-production-integration-and-learner-isolation/`.

**Zero files changed under `src/`. Zero under `drizzle/`. Zero deployment-configuration files.** This
package is research and design; a source edit would be out of scope, and the spike-becomes-disguised-
implementation risk (`R14`) is discharged on that limb by construction — nothing was executed, so
nothing could leak into product code.

## 8. The tool surface, re-derived at this cutoff

The settled figure is **46 registered / 43 gated / 3 exempt**, re-derived here at `546ee90` rather
than inherited:

- **46 registered** — `server.registerTool(` occurs 46 times across `src/server/`.
- **3 exempt** — `src/transport/context-token-middleware.ts` holds an `EXCLUDED_TOOLS` set of exactly
  three names: `init_agent_context`, `get_server_info`, `get_server_workflow`.
- **43 gated** — 46 − 3. **This subtraction is a cross-check, not the derivation of record.** The
  derivation of record is `11_the-client-compatibility-contract.md` §1.3, which maps the 43
  `context_token` schema declarations onto the non-exempt registrations module by module across
  thirteen rows and balances in both directions; that chapter states plainly that *"`46 − 3 = 43` is
  arithmetic, not evidence"*, and it is right. The subtraction is retained here because it agrees,
  and agreement between two independent routes is worth recording — but a reader wanting the evidence
  should read the mapping. *(Reconciled by SUB-14 (NEU-1007) at assembly; both derivations were
  published and only their evidential status differed, never the figure. Re-derived independently at
  cutoff `d526ffe`: 46 registered, 3 exempt, 43 gated — unchanged.)*

The figure carried by C010's charter and by some tracker descriptions is a **corrected miscount** and
is not repeated here as a codebase fact.

`init_agent_context` being *exempt from the context-token gate* is worth separating from its status
in §3: it is ungated at the transport layer **and** it is a mutating call this sub-task must never
make. Those are two different facts about the same tool, and only the second bears on the access
audit.

## 9. Ids allocated by this sub-task

- **Spikes:** `SPK-S1-1` … `SPK-S1-9` (`96_spike-register.md`).
- **Open items:** `OI-S1-1` … `OI-S1-9` (`93_open-items-and-provisional-register.md`).
- **Findings:** `F-S1-1` … `F-S1-3` (`91_findings-register.md`).
- **Caps:** `CAP-S1-1`, `CAP-S1-2` (`94_caps-and-incomplete-scope.md`).
- **Stand-ins:** `A-33`, `A-34` (`95_stand-in-assumption-register.md`).
- **Outcomes:** OUT-18's row (`90_outcome-register.md`).
- **Risks:** `R8`, `R13`, `R14` (`92_risk-register.md`).
- **Decision records:** `DR-C11-S1-1`, `DR-C11-S1-2`, `DR-C11-S1-3`.
- **Completeness-gate rows:** `G-1` … `G-15` (`97_package-completeness-gate.md`), SUB-1's own only.
- **Document numbers:** `01_` only.

## 10. What this chapter does not establish

- **It establishes nothing about production.** Every production claim here is repository-derived or
  cited from C010; `CAP-S1-1` states the limit.
- It does not decide which claim becomes the persisted learner key (SUB-2), set any recovery
  objective (SUB-15), design any detection (SUB-16), or build any propagation matrix (SUB-9).
- It does not classify the two log tables' privacy status. It supplies only the observation SUB-16
  would classify — and at revision 1 it does not supply even that.
- It does not assert anything about band placement or cross-register consistency (SUB-14), or about
  the package's audit set (SUB-17).
- It does not state what C010's `A-28` re-check is handed. `A-28`'s re-validation trigger fires on
  this package's publication, but stating the handoff is SUB-14's closure obligation.
