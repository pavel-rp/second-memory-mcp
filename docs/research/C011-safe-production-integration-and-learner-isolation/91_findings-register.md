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

### SUB-3

#### `F-S3-1` — `mcp_request_log.response_body` stores whole, unredacted learner free text for a diagnostic purpose that no code path reads

- **Id:** `F-S3-1`
- **Finding:** `infrastructure.mcp_request_log.response_body` holds the entire MCP response buffer decoded as UTF-8, stored **whole and unredacted**. Its stated purpose is diagnostic — `src/shared/logger.ts:35`–`:36` records the choice explicitly: *"Learner `response` text is intentionally NOT redacted — it is useful diagnostic data."* **No read path for that column exists anywhere in the repository.** Every occurrence is on the write side. The purpose is therefore not traceable to a real use at this cutoff, which makes the retention of the most sensitive field in the inventory a purpose-limitation and data-minimization failure on its face.
- **Evidence:** Captured at `src/transport/audit-middleware.ts:88`; assigned with **no redaction call** at `:109` (contrast `:105`, where `params` is passed through `redactParams`); carried at `src/transport/pg-audit-transport.ts:112` and inserted at `:117`. The redactor is a credentials-only denylist of six exact key names — `src/shared/redact-params.ts:1`, `/^(token|authorization|secret|password|api_key|apikey)$/i` — which never touches `response_body`. The only bound is a size cap, `MAX_CAPTURE_BYTES = 65_536` (`src/transport/audit-middleware.ts:14`), which **truncates rather than redacts**. The only statement anywhere that reads `mcp_request_log` is `scripts/retention-cleanup.sql`, which deletes; `scripts/lint-corpus-seed.ts:18` names a hand-labelling pass against the table as a *"deferred follow-up"*, i.e. not implemented. Cutoff `86fb38a`, 2026-08-25.
- **Consequence:** The category with the weakest minimization position in the whole inventory (`LD-S3-16`) is also the one whose justification is unsupported. Three consequences follow. **For OUT-11 (SUB-8):** an erasure duty over this table cannot be argued down on the strength of a diagnostic necessity that nothing exercises. **For OUT-12 (SUB-9):** this is the copy the charter's `R2` names first — *"erasure completes on paper while learner data survives in a copy nobody owns"* — and it is unattributed, so no principal-scoped `DELETE` can currently reach a specific learner's rows. **For the retention caps `CAP-S3-3` / `CAP-S4-1`:** their owner now has a stated reason the field could be narrowed or dropped rather than merely time-bounded. Separately, the same content transits `LD-S3-25`'s in-memory batch buffers, which no SQL erasure reaches at all.
- **What is assumed rather than derived:** Two bounds, stated so the finding is not overread. This is a statement about the **repository at cutoff `86fb38a`**, not about production: an operator querying the table by hand is a use this method cannot see, and whether production rows contain learner text at all is **`OI-S1-5`**, owned and unclosed. Neither bound is resolved here, and neither weakens the repository-level fact.
- **Handed to:** **`NEU-986` (`SUB-12 of C010`)**, owner of `CAP-S3-3` and `CAP-S4-1` — the retention-and-deletion caps over the two log tables, for which this package supplies the mechanism but which it does not own — **co-named `NEU-896`** at convergence. It receives the exact write path, the exact redactor scope, and the absence of a reader. **Consumed by SUB-8** (OUT-11, export and erasure) and **SUB-9** (OUT-12, propagation), neither of which has to re-derive it. Changing the logging choice itself is a `src/` edit and is outside this package's scope by constraint.

#### `F-S3-2` — The omission probe surfaced six process-local structures the sub-task's own scope did not name

- **Id:** `F-S3-2`
- **Finding:** SUB-3's scope names the process-local in-memory structures parenthetically as four — transport map, subject-binding map, rate-limit windows, circuit-breaker set. An independent walk of `src/` at this cutoff found **ten**. The six unnamed are the DB client singletons, the event-logger sink toggle, the audit/event transport batch buffers and their per-sink breakers, the JWKS remote key set, the classifier per-field model cache, and the request-scoped `AsyncLocalStorage` pair. All six were **admitted** to the inventory as `LD-S3-22` … `LD-S3-27`.
- **Evidence:** `src/infrastructure/db/client.ts:5` and `src/infrastructure/db/operations.ts:5`; `src/shared/logger.ts:214`; `src/transport/pg-audit-transport.ts:45` and `src/transport/pg-event-transport.ts:41`; `src/transport/jwt-middleware.ts:90`; `src/adapters/langchain/content-classifier-adapter.ts:47`; `src/shared/logger.ts:115`–`:116`. Independently corroborated by C010's own sweep, which individuates the same ten as `SC-S3-18` … `SC-S3-27` (`../C010-system-and-repository-architecture/04_state-category-inventory.md` §3.4).
- **Consequence:** The inventory is complete, but a reader who took the scope's parenthetical four as exhaustive would miss six categories — and **one of the six is materially the most awkward in the package**: `LD-S3-25`, the audit/event batch buffers, transiently hold the same unredacted `response_body` content as `F-S3-1`, live outside every table, and are reachable by no `DELETE` whatsoever. An erasure or unowned-copy audit driven off a four-item reading would report clean while that copy existed. The completeness method's **stated falsifier** (`03_learner-data-inventory-and-classification.md` §11) is exactly the check that surfaced this, and it is discharged **by admission, not by argument**.
- **What is assumed rather than derived:** That ten is now the complete set. The falsifier remains standing and unretired: a reader who names an eleventh process-local structure holding learner-derived data at cutoff `86fb38a` falsifies the inventory. No mechanical enumeration exists for module-level mutable state — unlike the tables, which `pgTable(` counts — so this group rests on a manual read plus C010's independent agreement, which is a weaker footing and is stated as such in §11.
- **Handed to:** **SUB-9 (`NEU-1003`)**, whose unowned-copy audit must range over all ten rather than four, and which receives `LD-S3-25` specifically as a propagation target no SQL statement reaches; and **SUB-14 (`NEU-1007`)**, which aggregates the registers and owns the package's completeness assembly.

#### `F-S3-3` — SUB-1's forward-allocation table permutes charter § Risks rows 10–12 against the charter's own order

- **Id:** `F-S3-3`
- **Finding:** `92_risk-register.md` fixes the id rule as *"`R<n>` is the row's position in the charter's § Risks table"*, and `README.md` states the same rule. SUB-1's forward-allocation table at `92_risk-register.md:33`–`:35` assigns `R10` = compatibility contract / stale tool count (OUT-16, SUB-11), `R11` = lifecycle half written as if it had an upstream (OUT-9, SUB-3), `R12` = legal determination asserted (OUT-9, SUB-3). Read at cutoff `86fb38a`, the charter's § Risks table has those three rows in the order **legal determination (Medium, OUT-9)**, **stale tool count (High, OUT-16)**, **greenfield lifecycle half (High, OUT-9)** — so by the stated rule they are `R10`, `R11`, `R12` respectively. Rows `R1`–`R9` and `R13`–`R15` agree exactly between the two; **only rows 10–12 differ**, and they differ as a permutation, with each risk's severity correctly paired in both.
- **Evidence:** `92_risk-register.md:33`–`:35` (SUB-1's table). The charter's § Risks table, read 2026-08-25 — fifteen rows, with the legal-determination row carrying Medium and OUT-9, the tool-count row carrying High and OUT-16, and the greenfield row carrying High and OUT-9, in that order. The charter lives in gitignored `_local/`, which is precisely why the risk register exists (charter assumption 46) and why this discrepancy is otherwise invisible to a reader of the published package.
- **Consequence:** SUB-3 authored **`R10`** (legal determination, Medium) and **`R12`** (greenfield lifecycle half, High), computed from the charter alone as both the README and SUB-1's own stated rule require. Two live consequences follow. **`R12` now carries different content from the row SUB-1's table predicts for it** — greenfield rather than legal — so a reader reconciling the two will see a conflict at that id. And **`R11` is left unwritten by SUB-3**: if SUB-11 computes from the charter it will author `R11` (tool count), whereas SUB-1's table directs it to `R10`, which SUB-3 has taken. The risk is a **collision at `R10` or a hole at `R11`**, depending on which source SUB-11 follows.
- **What is assumed rather than derived:** That the charter's § Risks table has not been reordered between SUB-1's read and this one. `_local/` is gitignored and unversioned, so the two readings cannot be diffed and this finding does **not** assert that SUB-1 erred — only that the two sources disagree at rows 10–12 as read at their respective cutoffs. SUB-1's entries are left **untouched** under the append-only rule; nothing here reflows, renumbers or rewrites them.
- **Handed to:** **SUB-14 (`NEU-1007`)**, which aggregates the risk register and runs the cross-register consistency check, and is the only party positioned to reconcile an id conflict without authoring content; **co-named SUB-11 (`NEU-1005`)**, whose own id is directly affected and which should compute from the charter rather than from the allocation table. Both receive the exact row order read at this cutoff.

#### `F-S3-4` — C010's state-inventory heading states 41 entries while its own count table states 45

- **Id:** `F-S3-4`
- **Finding:** `../C010-system-and-repository-architecture/04_state-category-inventory.md:70` heads the inventory *"The inventory — 41 entries, each appearing exactly once"*. The same document's §8 count table at `:528`–`:535` reports **45** — `existing` 30, `required-by-upstream` 11, `assumed` 4 — with ids running to `SC-S3-45`, and its subsections 3.1–3.7 sum to 45 (13 + 2 + 2 + 10 + 3 + 11 + 4).
- **Evidence:** Both locations read directly at cutoff `86fb38a`, 2026-08-25.
- **Consequence:** Minor for this package and worth exactly one sentence of care: SUB-3's bidirectional cross-check used **45**, the count of record, because it is the figure the ids and the subsection totals both support, and the cross-check's arithmetic (30 matched + 15 unmatched = 45) is stated against it. A later reader taking 41 from the heading would find the cross-check's totals unreconcilable. The wider consequence belongs to C010, not here: any consumer citing *"C010's 41-category inventory"* is citing a number the document's own content contradicts.
- **What is assumed rather than derived:** Nothing about C010's intent. This chapter takes **no position** on which number C010 meant, and does not resolve the discrepancy — under this package's constraint a contradiction with C010 is recorded and routed, never settled here.
- **Handed to:** **`NEU-895` (C010)**, as a **recorded amendment** to `../C010-system-and-repository-architecture/04_state-category-inventory.md`, co-named **`NEU-896`** at convergence as the live recipient of C010's residual. It receives both line references and the subsection arithmetic.

---

**SUB-3 register totals at revision 1:** four findings, `F-S3-1` … `F-S3-4`. One minimization
finding (`F-S3-1`) and one omission-probe finding (`F-S3-2`) — the two OUT-9 is named for in the
charter's findings enumeration (assumption 49) — plus two cross-artifact discrepancies surfaced by
this sub-task's own reconciliation work. **Zero findings absorbed into the chapter's prose**, and
every entry names the party that must act on it.

**One contradiction with C010 was found, and is routed rather than resolved** — `F-S3-4`, an
amendment to `NEU-895`. SUB-3's own facts were otherwise checked against C010's published package —
in particular `../C010-system-and-repository-architecture/04_state-category-inventory.md` and
`../C010-system-and-repository-architecture/decision-records/DR-C10-S3-1_state-category-individuation.md`,
whose individuation rule this
chapter consumes with its source cited — and every one is consistent with it or cites it.
### SUB-15

#### `F-S15-1` — **BLOCKING.** No RPO or RTO position can be set while the backups question is open

- **Id:** `F-S15-1`
- **Severity:** **Blocking**, per charter assumption 49 — *an objective that cannot be set at all, the RPO/RTO position in particular, is recorded as a blocking finding with a named owner rather than given an assumed number or left blank.*
- **Finding:** The two recovery objectives OUT-14 is required to state — **RPO** (maximum tolerable data loss) and **RTO** (maximum tolerable time to restore) — **cannot be set**. Neither has a number, and neither is left blank; both are carried by this record.
- **This is a finding about an objective, not about backups.** Whether production database backups exist is a separate fact with exactly one register record in this package: **`OI-S1-8`** in `93_open-items-and-provisional-register.md`, owned by SUB-1. **This entry raises no second record of that fact and does not restate it** — it cites `OI-S1-8` for the fact and records only the consequence for the objective. A reader meets one record for the unanswered production question and one for the operational objective that cannot be stated without the answer, never two competing records of the same question.
- **Evidence:** `15_operational-objectives-for-the-real-platform.md` §5 — the recovery tabletop, in which **four of six** recovery steps resolve to a capability the platform is not established to have. Detection: no monitoring is established (`OI-S1-9`). Code rollback: the deploy is `git reset --hard "$SHA"` against an off-repo compose stack with no rollback step (charter assumption 21). Schema rollback: no down-migrations; the migrator runs forward unconditionally at boot (`src/infrastructure/db/migrate.ts:38-50`). Data restore: `OI-S1-8`. The remaining two steps depend on the four.
- **Consequence:** Every downstream artifact that assumes a recovery position is assuming one nobody has stated. **SUB-7** (NEU-1001) cannot write a rollback action that assumes a restore. **SUB-9** (NEU-1003) cannot populate a backups column with anything but a citation. **SUB-12** cannot close an erasure-propagation cell for a backup copy. The data-lifecycle half of this package rests on a recovery position that does not exist, which is the exact gap this sub-task's problem slice names.
- **What is assumed rather than derived:** **Nothing.** No RPO and no RTO value is assumed, inferred, or defaulted. The two positions that *would* follow from each possible answer to `OI-S1-8` are published as **explicitly conditional** in `15_operational-objectives-for-the-real-platform.md` §5.4, so closing `OI-S1-8` yields an objective immediately without redoing the analysis — and neither conditional position is asserted. Both fall inside the tolerance envelope SUB-1's stand-in `A-33` already states.
- **Named owner:** **The creator, as sole maintainer and sole operator of the production deployment** — the only party who can state whether a backup arrangement exists, since none is discoverable in the repository. The same owner `OI-S1-8` names, deliberately, so the fact and the objective close together.
- **Resolving event:** **`OI-S1-8` closes.** On that event `OBJ-13` and `OBJ-14` in `15_operational-objectives-for-the-real-platform.md` §4 take the corresponding row of §5.4's conditional table, and this finding is downgraded from blocking to resolved.
- **Handed to:** **SUB-7** (NEU-1001), for every rollback action that assumes a restore; **SUB-9** (NEU-1003), for its backups column; **SUB-12**, for the erasure-propagation matrix. Each receives one id for the fact (`OI-S1-8`) and one for the objective (`F-S15-1`). **The direction is forward-only** — whether each in fact cites them is that sub-task's acceptance, not this one's.

#### `F-S15-2` — The per-subject rate limiter provides zero aggregate protection, so nothing defends the four-connection pool

- **Id:** `F-S15-2`
- **Severity:** High. Not blocking — the objective it concerns (`OBJ-3`) is stated with a named gap rather than being unsettable.
- **Finding:** The in-app rate limiter is keyed on the JWT subject (`src/transport/rate-limit-middleware.ts:58`) and admits **120 requests per 60 000 ms per subject** (`src/config/resolve-rate-limit-config.ts:24-25`). It therefore admits **N × 2 req/s** for N distinct subjects and imposes **no aggregate ceiling of any kind**. The resource it would have to protect — the shared Postgres pool — is fixed at **`max: 4`** (`src/infrastructure/db/client.ts:42`). Admitted load grows linearly with the learner population while the resource stays constant, so **the limiter cannot defend the pool at any learner count, by construction.**
- **Evidence:** The three `file:line` citations above, read at cutoff `86fb38a`. Derived threshold: at **N = 3** subjects the aggregate admitted rate is 6 req/s, which saturates 4 connections at any mean per-call database service time `t_db ≥ 0.667 s`. Full derivation and its bounded band at `15_operational-objectives-for-the-real-platform.md` §3.
- **Consequence:** `OBJ-3` — an aggregate admission ceiling — is an objective the platform has **no mechanism to enforce**. Beyond saturation, calls queue; past the pool's 5 000 ms acquisition timeout (`src/infrastructure/db/client.ts:44`) they **fail** rather than merely slow down. The shipped comment at `.env.example:76`–`:78` states the limiter's per-subject intent accurately, so this is a gap in what was built, not a defect against what was specified.
- **What is assumed rather than derived:** The **learner count** at which it bites depends on `t_db`, the mean per-call database service time, which is unobserved in production and carried as `OI-S15-3`. The band **2–200 concurrently active learners** is published in place of a point value, with both endpoints' bases stated.
- **Named owner:** **The creator, as sole maintainer and sole operator.**
- **Handed to:** **SUB-16** (NEU-999), which designs how a breach of `OBJ-1`/`OBJ-3` would be detected — and which inherits the fact that nothing currently would; **SUB-7** (NEU-1001), whose rollout stages are checked against these objectives.

#### `F-S15-3` — The transport and subject-binding maps have no eviction path but a clean session close, and the leak is masked by deploy churn

- **Id:** `F-S15-3`
- **Severity:** Medium.
- **Finding:** `src/transport/http.ts:82-83` declares `transports` and `sessionIdentity` side by side, keyed on the same MCP session id. `:212-218` — the `transport.onclose` handler — is the **only** eviction path; `:304-311` drains both on process shutdown. There is **no TTL, no idle sweep and no size bound**. A session abandoned without a clean close is therefore retained until the process restarts.
- **Evidence:** The `file:line` citations above at cutoff `86fb38a`. Because the two maps share a key and a lifecycle, the subject-binding map cannot break before the transport map: they are **one exposure, not two**, which is why this register carries one entry and not two.
- **Consequence:** The break mode is **monotonic memory growth**, not a learner-count threshold. It is currently masked by deployment churn: the measured deploy cadence is **≥1.36 restarts/day over 90 days and ≥3.29/day over the most recent 7** (`git rev-list --count origin/develop --grep="chore: bump version"` at `86fb38a`), and **every restart empties both maps**. The leak is real and is being contained by an accident of release cadence rather than by a mechanism — carried as `R-S15-2` in `92_risk-register.md`.
- **What is assumed rather than derived:** The threshold **in entries** is not stated. It needs a per-entry memory footprint that has never been measured (`OI-S15-4`) and a host RAM figure that is unknown (`C-26`, citing `OI-S1-9`). **No entry count is given**, rather than an estimated one.
- **Named owner:** **The creator, as sole maintainer and sole operator.**
- **Handed to:** **SUB-16** (NEU-999), for detection; **SUB-4** (NEU-996), which binds the context token to a principal and touches the same session lifecycle.

---

**SUB-15 register totals at revision 1:** three findings, `F-S15-1` … `F-S15-3`, of which **one is
blocking** (`F-S15-1`). All three carry a named owner. **Zero restate the backups fact**; `F-S15-1`
cites `OI-S1-8` for it and records only the objective that cannot be set.

**No contradiction with C010 was found.** SUB-15's facts were checked against C010's published
package — the tool-surface figure against `F-S5-3` / `F-S8-1`
(`../C010-system-and-repository-architecture/02_findings-register.md`), the MCP-boundary overhead
against `SPK-S6-1` (`../C010-system-and-repository-architecture/92_spike-register.md`), the 1 000 ms
latency budget against `A-25`
(`../C010-system-and-repository-architecture/08_per-state-authority-matrix.md`), and the deployment
shape against `DR-C10-S10-2` — and every one is consistent with it or cites it. **No amendment is
routed to `NEU-895` by SUB-15.** The check is recorded so SUB-17's audit can see that it ran and
returned empty, rather than having to infer it from the absence of an amendment.

---

### SUB-2

#### `F-S2-1` — The production static client is named in the repository, and it — not the DCR client — is the learner path

- **Id:** `F-S2-1`
- **Finding:** ADR-0001's NEU-909 amendment states that *"the claude.ai connector in production authenticates with a **manually provisioned static client** (`claude-web`) rather than DCR"* and that *"prod sets `claude-web`"* as the `AUTH_ADDITIONAL_AUDIENCES` value. Two things follow. First, the **production human-learner path is principal shape 2 (static client), not shape 3 (DCR)**. Second, the static client's **identity** is repository-established; only its **claim set** is unobserved.
- **Evidence:** `docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md:65`, `:67`, read at cutoff `86fb38a`. Corroborated by `.env.example:63` (`# AUTH_ADDITIONAL_AUDIENCES=claude-web`) and by the middleware's own comment at `src/transport/jwt-middleware.ts:64`–`:66`. The parse site is `src/config/resolve-auth-config.ts:95`.
- **Consequence:** It narrows two SUB-1 records without contradicting either. C011's `OI-S1-2` states *"neither which client that is nor what its token carries has been observed"* — the first half is now answered from the repository, so the residual is only the claim set, carried forward as `OI-S2-2`. And SUB-1 calls the DCR shape *"the shape OUT-1 and OUT-5 most need"* (`93_open-items-and-provisional-register.md` § `OI-S1-3`, repeated at `96_spike-register.md` § `SPK-S1-3`); on this amendment the shape that most needs observing is the **static client**, because that is where the human is. It also kills, on evidence rather than on principle, the tempting rule *"`dyn$` audience means a human"* — see `decision-records/DR-C11-S2-2_principal-kind-and-the-service-principal-disposition.md` rejected alternative 4, where that rule would have misclassified the actual production learner as a machine.
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
- **Consequence:** This sub-task ships with **one acceptance condition not met**, and it is reported rather than reinterpreted. The three available responses were: record a closure that did not happen; silently restate the condition as satisfied by repository evidence; or deliver everything the condition's *design* half asks for, decline its *evidence* half, and register the gap. The third is taken. The concrete effect is that OUT-5's outcome-register row carries a **not-met** measured result, `A-S2-1` spans all three shapes rather than one, and no downstream sub-task may treat the human-`sub` question as settled. **The identity rule itself is unaffected** — it is total over every answer — so the unmet condition costs the package a confirmed population, not a decision.
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

---

### SUB-4

#### `F-S4-1` — The only bulk purge is dead code, and the delete that *does* run looks like a purge and is not

- **Id:** `F-S4-1`
- **Finding:** `deleteExpired(before)` is declared at `src/ports/context-token-repository.ts:6` and implemented at `src/adapters/drizzle/context-token-repository.ts:61`, and is called from **nowhere** in `src/` — no scheduler, no cleanup job, no call from the composition root; the only callers anywhere are tests. Separately, `validate()` and `validateWithStatus()` (`src/adapters/drizzle/context-token-repository.ts:39`–`:55`) *do* delete a row in production, but only the single row they were asked about. The table therefore appears self-maintaining and is not: a row that is minted and then abandoned — the normal fate of a token whose client crashed, and the guaranteed fate of every token a finished CI run minted — is never presented again and is removed by nothing.
- **Evidence:** Exhaustive search of `src/` at `origin/develop` @ `5111841` returns zero call sites for `deleteExpired`. `src/ports/context-token-repository.ts:6`; `src/adapters/drizzle/context-token-repository.ts:39`–`:55`, `:61`.
- **Consequence:** Two. **(1)** `context_tokens` grows without bound in exactly the population the presented-row delete cannot reach, which today is harmless because the table is anonymous and stops being harmless the moment a principal is bound to it — `03_learner-data-inventory-and-classification.md` entry `LD-S3-13` records that transition. **(2)** The second half is the more dangerous one for a reader: anyone who finds the hot-path delete and concludes the purge question is already answered will decline to wire the real one. `DR-C11-S4-3` therefore states the distinction as a clause rather than leaving it to be noticed.
- **What is assumed rather than derived:** Nothing. Both halves are reads of the tree.
- **Handed to:** **SUB-6** (NEU-1000) and **OUT-19**, which own the migration artifacts the wiring lands in; and `SUB-10 of C010 (NEU-984)`, co-named `NEU-896`, as `OI-S8-1`'s owner.

#### `F-S4-2` — The ungated transport is the **default**, not an opt-in minority path

- **Id:** `F-S4-2`
- **Finding:** `src/config/resolve-transport-config.ts:35` resolves the transport as `parseEnum(env.TRANSPORT, ['stdio', 'http'] as const, 'stdio')`. An **unset** `TRANSPORT` selects `stdio` — the transport that mounts no authentication, no origin check, no rate limit, no audit and no context-token gate. The same value gates auth to `null` at `src/config/resolve-auth-config.ts:105` and rate limiting to `null` at `src/config/resolve-rate-limit-config.ts:31`.
- **Evidence:** `src/config/resolve-transport-config.ts:35`; `src/config/resolve-auth-config.ts:105`; `src/config/resolve-rate-limit-config.ts:31`; `src/transport/main.ts:46`–`:59`. Read at `5111841`.
- **Consequence:** It resizes the migration. A reader who treats STDIO as a niche local-development path will under-scope the compatibility work: the broken class is not "the few installations that chose STDIO" but "every invocation where nobody chose anything" — `04_the-stdio-identity-gate-and-the-bound-context-token.md` §9 row 4. It also disposes of the reachability argument for leaving STDIO ungated (§3.1): unreachability today is one unset environment variable away from being false tomorrow, in any environment.
- **What is assumed rather than derived:** Nothing. The default is the third argument of the parse call.
- **Handed to:** **SUB-7** (NEU-1001), whose rollout has to size the broken class correctly, and **SUB-11** (NEU-1003) for the compatibility contract.

#### `F-S4-3` — The deploy pipeline's own smoke run is an unadapted consumer of this package's identity rule, and the CD gate breaks on it

- **Id:** `F-S4-3`
- **Finding:** `.github/workflows/cd-prod.yml:145`–`:168` fetches an OAuth token by `grant_type=client_credentials` on **every** production deploy, and `:170`–`:174` runs `pnpm run test:smoke` with it as a deploy step. The smoke suite calls `init_agent_context` (exempt), captures the context token at `tests/smoke/smoke.test.ts:192`, and then calls **gated learner-state tools** with it — `list_learning_items` at `:207` and `session_status` at `:239`. Under `DR-C11-S2-2` a `client_credentials` principal is `client`-kind and those calls are **refused, not empty-scoped**. A refused smoke call fails the suite, and a failed suite fails the deploy.
- **Evidence:** `.github/workflows/cd-prod.yml:145`–`:174`; `tests/smoke/smoke.test.ts:163`–`:193`, `:207`, `:239`. Read at `5111841`. The rule applied is `decision-records/DR-C11-S2-2_principal-kind-and-the-service-principal-disposition.md`, not a new one.
- **Consequence:** The identity rule this package is writing has the **production release pipeline** among its consumers, and that consumer has not been adapted. This is not a defect in the rule — refusing a service principal's learner reads is the rule working — and it is not a reason to soften it into an empty scope, which `DR-C11-S2-2` rejects on the ground that a silent empty result is indistinguishable from a learner with no data. It is a sequencing obligation: the smoke suite must be re-scoped, or the smoke principal re-provisioned as a `user`-kind static client, **before** the enforcement stage lands. Reported as a finding rather than absorbed into the rollout prose, because the party that owns `cd-prod.yml` is not the party that owns the rollout.
- **What is assumed rather than derived:** That the production `client_credentials` token carries no `sub`. That is **`OI-S1-1` / `SPK-S1-1`, still open** — the code comment at `src/transport/jwt-middleware.ts:116` states it, and no token has been observed. Both branches are live, and this finding is the branch where the belief holds. The opposite branch is already registered as `R-S2-2`; the two are complements, not duplicates.
- **Handed to:** **The creator, as sole operator** and owner of the CD pipeline; **SUB-7** (NEU-1001) for the sequencing obligation; and **`NEU-896`** at convergence, because a release gate is a program-level surface.

#### `F-S4-4` — There is no STDIO transport module, so the gate cannot be *mounted* on STDIO at all, and `CC-S8-3`'s classification does not price that

- **Id:** `F-S4-4`
- **Finding:** `src/transport/` holds ten files and none is a STDIO module. The STDIO path is four inline lines in the transport switch (`src/transport/main.ts:55`–`:59`), connecting `createMcpServer(ctx)` to a bare `StdioServerTransport` with nothing interposed. Both the pieces that would have to reach it are Express-typed: `createAuditMiddleware` returns a `RequestHandler` (`src/transport/audit-middleware.ts:23`) and so does `createContextTokenMiddleware` (`src/transport/context-token-middleware.ts:43`). "Mount the gate on STDIO" is therefore not a mount — it is a rewrite against a transport-neutral seam that does not exist in the tree.
- **Evidence:** Directory listing of `src/transport/` and `src/transport/main.ts:55`–`:59`, `:46`–`:54`; `src/transport/audit-middleware.ts:23`; `src/transport/context-token-middleware.ts:43`. Read at `5111841`.
- **Consequence:** C010 classifies `CC-S8-3` — *"a gate on the STDIO transport"* — as **reusable core** under `R8-4` and prices it as *"breaking, and unavoidably so"* (`../C010-system-and-repository-architecture/12_application-versus-core-rule-and-compatibility-contract.md:233`, `:552`). Both of those remain correct. What neither captures is that the work is not *extend the existing gate to a second mount point* but *extract a transport-neutral gate and give STDIO something to mount it on*. This is an **addition to C010's pricing, not a contradiction of it**, so no amendment is routed to `NEU-895`. It also means audit parity across transports (`DR-C11-S4-1` clause 4) is a rewrite rather than a configuration change — carried as `R-S4-4`.
- **What is assumed rather than derived:** Nothing about the tree. What is *not* established is how large the extraction is; this finding states that it exists, not what it costs.
- **Handed to:** **`SUB-10 of C010 (NEU-984)`**, co-named **`NEU-896`**, as `CC-S8-3`'s owner; **SUB-11** (NEU-1003) for the compatibility contract; and **SUB-16** (NEU-999) for the audit-parity limb.

#### `F-S4-5` — The context token *is* a per-call argument, and that is not the per-call identity argument `DR-C10-S8-2` rejects

- **Id:** `F-S4-5`
- **Finding:** The gate reads the token from `body.params?.arguments?.context_token` (`src/transport/context-token-middleware.ts:62`) — that is, from a per-call tool argument. `DR-C10-S8-2` rejects *per-call identity arguments* as forgeable. A reader comparing the two could reasonably conclude the audit in `04_the-stdio-identity-gate-and-the-bound-context-token.md` §10.4 is contradicted by the code it cites.
- **Evidence:** `src/transport/context-token-middleware.ts:62`; the rejection's own reasoning in `../C010-system-and-repository-architecture/decision-records/DR-C10-S8-2_token-bound-identity-over-per-call-identity.md` — *"An identity carried in a tool argument is caller-supplied. Nothing in the MCP argument path distinguishes the client's true subject from a subject the client typed."*
- **Consequence:** The distinction is between **asserting who you are** and **presenting something the server issued**. A context token is server-minted and its binding is server-written, so a caller who types one has typed a value that resolves to no row; an identity string a caller types resolves to whatever they typed. The design stays on the correct side of the line, and the line is recorded here so a later reader does not "fix" a contradiction that is not one. Nothing about the mechanism changes as a result of this finding — it exists purely to prevent a misreading that would.
- **What is assumed rather than derived:** Nothing.
- **Handed to:** **SUB-11** (NEU-1003), whose compatibility contract has to describe the argument's changed *meaning* without describing a schema change, and **SUB-17** (NEU-1008)'s consistency audit.

#### `F-S4-6` — The spike register's cumulative total omits SUB-15's four entries, so "twelve designed" understates the package at eighteen

- **Id:** `F-S4-6`
- **Finding:** `96_spike-register.md`'s SUB-2 closing note reads *"Cumulative across SUB-1 and SUB-2: twelve spikes designed, zero executed."* Twelve is 9 + 3. **SUB-15's four entries — `SPK-S15-1` … `SPK-S15-4` — sit in the same register**, between SUB-1's section and SUB-2's, and are not in the total. The correct cumulative at SUB-2's revision was **sixteen**, and at SUB-4's it is **eighteen**.
- **Evidence:** `96_spike-register.md` § SUB-1 (`SPK-S1-1` … `SPK-S1-9`, nine), § SUB-15 (`SPK-S15-1` … `SPK-S15-4`, four), § SUB-2 (`SPK-S2-1` … `SPK-S2-3`, three), § SUB-4 (`SPK-S4-1`, `SPK-S4-2`, two) — read at `5111841`. The understating line is SUB-2's own closing note.
- **Consequence:** Small in isolation and load-bearing in aggregate. `R13` — the `n = 1` evidence risk — is argued partly on the ratio of spikes designed to spikes executed, and `96_spike-register.md`'s header reports the package's evidence posture in exactly these counts. A total that understates the designed side by a third makes the designed-to-executed gap look smaller than it is, which is the direction that flatters the package. SUB-14 aggregates these registers and SUB-17 audits their internal consistency, so a cumulative figure that two sub-tasks compute differently is a reconciliation item rather than a matter of taste.
- **What is assumed rather than derived:** Nothing. All four sections were counted directly.
- **Handed to:** **SUB-14** (NEU-1007), which owns register assembly and is the party that reconciles a cumulative figure two authors computed on different bases; and **SUB-17** (NEU-1008), whose cross-register consistency audit would otherwise have to adjudicate it. **No finding is routed against SUB-2 or SUB-15** — this is an arithmetic reconciliation, not a defect in either sub-task's own entries, and no sub-task edits another's section (`README.md` § "Shared-register append convention"), so the original line is left exactly as written.

---

**SUB-4 register totals at revision 1:** six findings, `F-S4-1` … `F-S4-6`. **Zero blocking
findings.** `F-S4-3` is the closest — it names a live break in the production release pipeline — but
it is a **sequencing obligation with a named owner and an escalation route**, not an unregistered
mutation and not a defect in the rule, so it does not meet a blocking trigger. `F-S4-4` and `F-S4-5`
are narrowings of existing C010 records; `F-S4-1` and `F-S4-2` are reads of the tree that no prior
sub-task had cause to take; `F-S4-6` is an intra-package register reconciliation, routed to the
sub-task that owns assembly rather than against either author.

**No contradiction with C010 was found by SUB-4.** The design was checked against `DR-C10-S8-2`
clause by clause (all seven), against `DR-C10-S8-1`'s `R8-4` classification of `CC-S8-3`, against
the ordered checks `I1`–`I5`
(`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:166`–`:174`),
against §4.3's sequencing consequence (`:487`–`:496`), against §4.2's unconditional-verdict
statement (`:482`–`:485`), against `F-S5-4`
(`../C010-system-and-repository-architecture/02_findings-register.md:262`–`:268`), against the
settled tool-surface figure fixed by `F-S5-3` (`:249`–`:254`) and diagnosed by `F-S8-1`
(`:604`–`:609`), and against `A-28`'s tolerance envelope
(`../C010-system-and-repository-architecture/93_stand-in-assumption-register.md:104`–`:115`, not
breached). `F-S4-4` is an **addition** to `CC-S8-3`'s pricing rather than a contradiction of it.
**No amendment is routed to `NEU-895` by SUB-4.** The checks are recorded so SUB-17's audit can see
that they ran and what they returned.
