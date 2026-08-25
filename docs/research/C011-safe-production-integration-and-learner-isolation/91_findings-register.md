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
- **Finding:** `.github/workflows/cd-prod.yml:145`–`:168` fetches an OAuth token by `grant_type=client_credentials` on **every** production deploy, and `:170`–`:174` runs `pnpm run test:smoke` with it as a deploy step. The smoke suite calls `init_agent_context` (exempt), captures the context token at `tests/smoke/smoke.test.ts:195`, and then calls **gated learner-state tools** with it — `list_learning_items` at `:206` and `session_status` at `:237`. Under `DR-C11-S2-2` a `client_credentials` principal is `client`-kind and those calls are **refused, not empty-scoped**. A refused smoke call fails the suite, and a failed suite fails the deploy.
- **Evidence:** `.github/workflows/cd-prod.yml:145`–`:174`; `tests/smoke/smoke.test.ts:163`–`:196`, `:206`, `:237`. Read at `5111841`. The rule applied is `decision-records/DR-C11-S2-2_principal-kind-and-the-service-principal-disposition.md`, not a new one.
- **Consequence:** The identity rule this package is writing has the **production release pipeline** among its consumers, and that consumer has not been adapted. This is not a defect in the rule — refusing a service principal's learner reads is the rule working — and it is not a reason to soften it into an empty scope, which `DR-C11-S2-2` rejects on the ground that a silent empty result is indistinguishable from a learner with no data. It is a sequencing obligation: the smoke suite must be re-scoped, or the smoke principal re-provisioned as a `user`-kind static client, **before** the enforcement stage lands. Reported as a finding rather than absorbed into the rollout prose, because the party that owns `cd-prod.yml` is not the party that owns the rollout.
- **What is assumed rather than derived:** That the production `client_credentials` token carries no `sub`. That is **`OI-S1-1` / `SPK-S1-1`, still open** — the code comment at `src/transport/jwt-middleware.ts:116` states it, and no token has been observed. Both branches are live, and this finding is the branch where the belief holds. The opposite branch is already registered as `R-S2-2`; the two are complements, not duplicates.
- **Handed to:** **The creator, as sole operator** and owner of the CD pipeline; **SUB-7** (NEU-1001) for the sequencing obligation; and **`NEU-896`** at convergence, because a release gate is a program-level surface.

#### `F-S4-4` — There is no STDIO transport module, so the gate cannot be *mounted* on STDIO at all, and `CC-S8-3`'s classification does not price that

- **Id:** `F-S4-4`
- **Finding:** `src/transport/` holds ten files and none is a STDIO module. The STDIO path is five inline lines (three statements) in the transport switch (`src/transport/main.ts:55`–`:59`), connecting `createMcpServer(ctx)` to a bare `StdioServerTransport` with nothing interposed. Both the pieces that would have to reach it are Express-typed: `createAuditMiddleware` returns a `RequestHandler` (`src/transport/audit-middleware.ts:23`) and so does `createContextTokenMiddleware` (`src/transport/context-token-middleware.ts:43`). "Mount the gate on STDIO" is therefore not a mount — it is a rewrite against a transport-neutral seam that does not exist in the tree.
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
- **Consequence:** Small in isolation and load-bearing in aggregate. `R13` — the `n = 1` evidence risk — is argued partly on the ratio of spikes designed to spikes executed, and `96_spike-register.md`'s header reports the package's evidence posture in exactly these counts. A total that understates the designed side by a quarter — twelve against a correct sixteen at SUB-2's revision — makes the designed-to-executed gap look smaller than it is, which is the direction that flatters the package. SUB-14 aggregates these registers and SUB-17 audits their internal consistency, so a cumulative figure that two sub-tasks compute differently is a reconciliation item rather than a matter of taste.
- **What is assumed rather than derived:** Nothing. All four sections were counted directly.
- **Independently corroborated by SUB-16, which was authored in parallel.** `SUB-16` (NEU-999) records the same correction in its own `96_spike-register.md` closing note — *"SUB-15's four are counted here"* — reached from its own position and without sight of this section, since the two sub-tasks ran concurrently and SUB-16 merged first. **Two authors reaching the same arithmetic separately is corroboration, not a duplicated defect**, and it is stated here so SUB-14 sees one fact with two records rather than a contradiction between them. The two totals differ only by SUB-16's own entry: SUB-16 counts seventeen at its position, SUB-4 eighteen at its own, and **nineteen** is the package figure once both have landed.
- **Handed to:** **SUB-14** (NEU-1007), which owns register assembly and is the party that reconciles a cumulative figure three authors computed on different bases; and **SUB-17** (NEU-1008), whose cross-register consistency audit would otherwise have to adjudicate it. **No finding is routed against SUB-2, SUB-15 or SUB-16** — this is an arithmetic reconciliation, not a defect in any sub-task's own entries, and no sub-task edits another's section (`README.md` § "Shared-register append convention"), so the original line is left exactly as written.

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

---

### SUB-16

#### `F-S16-1` — Both columns that look like attribution carriers are caller-asserted, so attribution cannot be added by reusing one

- **Id:** `F-S16-1`
- **Severity:** High. Not blocking — it narrows the design space rather than invalidating an outcome, and the alternative it forces (a new column pair) is stated and costed in `decision-records/DR-C11-S16-1_the-attribution-carrier.md`.
- **Finding:** `infrastructure.mcp_request_log` carries two identifier-shaped columns and **neither may carry a principal**, for the same reason. `session_id` is lifted verbatim out of the tool call's own arguments — `src/transport/audit-middleware.ts:94`–`:99` reads `params.arguments.session_id` and `String()`s it — and is cross-checked against nothing: not the verified subject, not the MCP transport session, not `context_tokens`. `correlation_id`, present on **both** log tables, echoes a caller-supplied `X-Correlation-ID` header sanitized to printable ASCII and capped at 128 characters, minting a `randomUUID()` **only when the header is absent** (`src/transport/http.ts:154`–`:157`).
- **Evidence:** The `file:line` citations above, read at cutoff `5111841`. Persistence sites: `drizzle/0012_extend_mcp_request_log.sql:2`–`:3` (`correlation_id`, `session_id`); `drizzle/0013_create_operation_event_log.sql:4` (`correlation_id`).
- **Consequence:** Attribution is not addable by reuse; it needs a new server-derived column. **`correlation_id` is the more dangerous of the two precisely because it is *usually* a server-minted UUID** — it is trustworthy on every request where the client declines to set the header, and untrustworthy on exactly the requests where a client chose to set it. A carrier whose soundness is selected by the caller is not a carrier, and it would fail C010's check `I5` (`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:174`) while appearing to pass it in every test.
- **What is assumed rather than derived:** Nothing. Both extraction sites were read directly.
- **Named owner:** **The creator, as sole maintainer and sole operator**, for the deployed behaviour; **SUB-13** (NEU-1006) for the column that replaces it.
- **Handed to:** **SUB-13** (NEU-1006) and **SUB-5** (NEU-997), which would otherwise reuse an existing column; **SUB-9** (NEU-1003), whose completion proof is forbidden from relying on either identifier by `DR-C11-S16-3`'s first negative clause; **SUB-12** (NEU-1004), for which a caller-asserted identifier in an audit record is a threat-model input.

#### `F-S16-2` — `OBJ-10` bounds the circuit-open audit loss only; a second, unbounded loss path runs before the breaker opens

- **Id:** `F-S16-2`
- **Severity:** Medium. Not blocking — `OBJ-10` is accurate about what it bounds and its citation resolves; this is an extension of the accounting, not a contradiction of it.
- **Finding:** `OBJ-10` states *"≤ 60 s of audit traffic per 60 000 ms open window; entries buffered at the moment of opening are dropped, not retried"*, citing `src/transport/pg-audit-transport.ts:30`–`:36` and `:83`–`:90`. **Both of `OBJ-10`'s own citations were read at this cutoff and are correct.** (A separate pointer in the same chapter is not: `OBJ-10`'s provenance constant `C-8` cites `src/transport/pg-audit-transport.ts:34-35` for the *"5 consecutive failures / 60 000 ms"* pair, where line 34 is blank and line 35 is a comment — the two constants are at `:32`–`:33`. Reported here because this entry certifies having checked; **no revision is routed to SUB-15 and none is owed**, and `15_operational-objectives-for-the-real-platform.md` is unmodified by this sub-task.) But `:92`–`:93` swaps the buffer out **before** `pool.query` runs, so a batch whose query throws is already out of the buffer and is **never requeued** — and that happens on each of the **five** consecutive failures that must accumulate before the breaker opens at all (`DEFAULT_CIRCUIT_BREAKER_THRESHOLD = 5`, `:32`). Total loss across one outage is therefore *(up to five pre-open batches, each up to `DEFAULT_BATCH_SIZE = 100` entries or `DEFAULT_FLUSH_INTERVAL_MS = 5 000` ms of traffic, `:30`–`:31`)* **plus** *(60 s of traffic per 60 000 ms open window)*. The same pattern holds for the event log: `src/transport/pg-event-transport.ts` implements an identical drop-on-open and lose-on-exception path.
- **Evidence:** The `file:line` citations above, read at cutoff `5111841`. `15_operational-objectives-for-the-real-platform.md` §4 (`OBJ-10`) and §6 item 7, which records a *"bounded reading gap"* about entries arriving during an already-open window and explicitly leaves it readable from the repository for *"whoever needs the entry-count bound"*.
- **Consequence:** **A count read from either log table is a lower bound on the true count, never the count.** Every threshold in `16_attribution-and-detection.md` §3 is chosen so this degrades safely — a dropped entry can hide an event but cannot manufacture one, so a zero-tolerance threshold yields false negatives and never false positives. The residual exposure that a cross-learner access is silently dropped rather than counted is carried as `92_risk-register.md` § `R-S16-3`.
- **What is assumed rather than derived:** The **magnitude** of the pre-open loss depends on the **audit-entry arrival rate**, which is unobserved and which **no register item in this package currently covers** — stated plainly rather than pointed at the nearest-looking id. `OI-S15-3` is *"mean per-call database service time in production is unobserved"* (`93_open-items-and-provisional-register.md` § `OI-S15-3`), the `t_db` term in SUB-15's first-break derivation; it is a related but **distinct** quantity, and this entry does not claim it settles the arrival rate. **No entry count is stated**, only the structure of the bound. **No new open item is raised for the arrival rate either**, because this sub-task states no threshold that depends on its value — every count-based threshold here is zero-tolerance precisely so that it does not.
- **Named owner:** **The creator, as sole maintainer and sole operator.**
- **Handed to:** **SUB-9** (NEU-1003), whose completion proof may not treat absence-of-error as evidence of completion for exactly this reason; **SUB-12** (NEU-1004), whose gates measure counts from these tables. **No revision is routed to SUB-15, and none is owed** — `OBJ-10`'s statement, its provenance and its citations are all accurate for what they bound, and this entry extends the accounting downstream of it rather than amending a shipped record. `15_operational-objectives-for-the-real-platform.md` §8 item 7 anticipated exactly this reader.

#### `F-S16-3` — "43 gated" describes a mount, not an invariant: the gate is HTTP-only and fails open on internal error

- **Id:** `F-S16-3`
- **Severity:** High. Not blocking — it qualifies a settled figure rather than contradicting it, and both limbs are already implied by C010's `I4` position.
- **Finding:** The settled tool-surface figure **46 registered / 43 gated / 3 exempt** was re-counted at this cutoff and **holds**: 46 `registerTool` sites across `src/server/*.ts`, and exactly three exempt tools named literally at `src/transport/context-token-middleware.ts:5`–`:9` (`init_agent_context`, `get_server_info`, `get_server_workflow`). Two qualifications attach to the word *gated*. **(a)** The context-token gate is mounted only in HTTP mode and only when the context-token repository is non-null (`src/transport/http.ts:184`–`:187`); it **never runs for STDIO**, where all 46 tools are ungated (`src/transport/main.ts:55`–`:58`). **(b)** The gate **fails open on internal error** — `src/transport/context-token-middleware.ts:83`–`:86` catches an exception, logs it and calls `next()`, admitting the call ungated.
- **Evidence:** The `file:line` citations above, read at cutoff `5111841`. Consumed figure: C010's `F-S5-3` and `F-S8-1` via OUT-16.
- **Consequence:** *"43 gated"* is true of a mounted gate on one transport under no internal error. It is the count `SIG-S16-2` measures deviations from, so the qualifications are load-bearing rather than pedantic: limb (b) in particular means a failing gate and a passing gate produce the same observable outcome today. **The figure itself is not disputed and is not re-derived** — this entry adds only what *gated* means.
- **What is assumed rather than derived:** Nothing. The count and both qualifications were read directly.
- **Named owner:** **The creator, as sole maintainer and sole operator.**
- **Handed to:** **SUB-11** (NEU-1005 — OUT-16's compatibility contract), which re-counts the tool surface and should meet this qualification rather than re-discover it; **SUB-7** (NEU-1001), whose transport gate closes limb (a); **SUB-12** (NEU-1004), for which a fail-open gate is a threat-model input; **SUB-17** (NEU-1008), whose citation audit would otherwise meet the anomaly rather than the explanation.

#### `F-S16-4` — Audit emission is conditional on a database URL, so an unaudited deployment is indistinguishable from an idle one

- **Id:** `F-S16-4`
- **Severity:** Medium.
- **Finding:** The audit middleware is mounted only `if (auditDbUrl)` — `src/transport/http.ts:177`–`:182`. If neither `AUDIT_DATABASE_URL` nor `DATABASE_URL` is set in the production environment, **no audit row is written at all**, and the resulting empty table is indistinguishable from a table belonging to a deployment that served no traffic.
- **Evidence:** `src/transport/http.ts:177`–`:182`, read at cutoff `5111841`.
- **Consequence:** Every signal in `16_attribution-and-detection.md` §3 that counts rows has **no input** in that configuration, and it fails silently rather than reporting that it has no input. Whether the variable is set in production is unobserved and is raised as this sub-task's single new open item, `93_open-items-and-provisional-register.md` § `OI-S16-1`, with `96_spike-register.md` § `SPK-S16-1`.
- **What is assumed rather than derived:** The production value. It is not discoverable in the repository, and it is **not assumed set** — the detection design states the dependency rather than presuming it satisfied.
- **Named owner:** **The creator, as sole maintainer and sole operator.**
- **Handed to:** **SUB-7** (NEU-1001), whose rollout stages depend on a signal having an input; **SUB-12** (NEU-1004), for which "the audit writer is mounted" is a production gate rather than an assumption.

#### `F-S16-5` — Attribution is not retroactive, so every pre-cutover audit row is permanently unattributable and a per-learner erasure over the log tables is provably incomplete

- **Id:** `F-S16-5`
- **Severity:** High. Not blocking — it is fully mitigable by a disposition decision, and that decision has a named owner at a defined position.
- **Finding:** Under `DR-C11-S16-2` both log tables become `learner-linked` personal data once the carrier lands. Rows written **before** it lands carry `principal_kind = 'none'` and no key, and **no later process can supply one**: the only structure that has ever held a session-to-subject binding is the process-local map declared at `src/transport/http.ts:83`, whose sole eviction path is a clean session close (`F-S15-3`) and which is emptied by every restart — at a measured **≥3.29 restarts/day over the most recent 7 days** (`15_operational-objectives-for-the-real-platform.md` §2.2, `C-17`). A `DELETE … WHERE learner_key = $1` therefore **provably misses the entire pre-cutover population**, and reports success while doing so.
- **Evidence:** `src/transport/http.ts:83`, `:57`–`:58`, `:212`–`:218`; `91_findings-register.md` § `F-S15-3`; `15_operational-objectives-for-the-real-platform.md` §3. Read at cutoff `5111841`.
- **Consequence:** This is the charter's § Risks row `R2` — *"erasure completes on paper while learner data survives in a copy nobody owns"* — reached not by an overlooked copy but by the very change that creates the duty. **SUB-9 (NEU-1003) must give the pre-cutover population a disposition — bulk deletion, bulk anonymization, or an accepted and named residual — rather than a key.** Carried as `92_risk-register.md` § `R-S16-1`.
- **What is assumed rather than derived:** The **size** of the pre-cutover population is unobserved, and depends on whether rows exist at all (`OI-S1-5`, `OI-S1-6`) and on whether the writer is mounted (`OI-S16-1`). **No row count is stated.**
- **Named owner:** **SUB-9** (NEU-1003) for the disposition; **the creator, as sole maintainer and sole operator**, for the population itself.
- **Handed to:** **SUB-9** (NEU-1003) under OUT-12, as a matrix cell it would otherwise resolve to *"delete by key"* and ship incomplete; **SUB-8** (NEU-1002) under OUT-11, whose export duty has the same boundary; **SUB-7** (NEU-1001), because the cutover instant is a rollout artefact and its timestamp is the only thing that will ever separate the two populations.

---

**SUB-16 register totals at revision 1:** five findings, `F-S16-1` … `F-S16-5`. **Zero blocking
findings** — none meets a blocking trigger: `F-S16-1`, `F-S16-3` and `F-S16-4` are qualifications or
narrowings of existing records, `F-S16-2` is an extension of an accounting whose owning record stays
accurate, and `F-S16-5` is a named consequence with a named owner at a defined position — none is an
unregistered mutation. Every entry carries a named owner.

**Zero second records.** This sub-task raises no record of a question already owned elsewhere. Where
signals can be observed is **`OI-S1-9`** (SUB-1); whether the two log tables hold learner-derived
content in production is **`OI-S1-5`** / **`OI-S1-6`** (SUB-1); the audit-entry arrival rate is
**`OI-S15-3`** (SUB-15); the controller/processor role and lawful basis is **`OI-S3-1`** (SUB-3); the
unread, unredacted `response_body` minimization finding is **`F-S3-1`**, routed by SUB-3 to
**`NEU-986`** and **not re-routed here**; and the charter § Risks rows 10–12 permutation — which
makes a bare `R10` or `R12` resolve differently in `92_risk-register.md`'s charter-row table than in
its authored sections — is **`F-S3-3`**, already owned by SUB-3 and handed to SUB-14 with SUB-11
co-named. This sub-task hit that ambiguity while citing `R10`, **qualified each use to SUB-3's
authored section rather than raising a sixth finding**, and cites `F-S3-3` for the defect itself.
Each is consumed by citation. The one genuinely new
question — whether the audit writer is mounted in production at all — is `OI-S16-1`, and it is
distinct from `OI-S1-9` because `OI-S1-9` asks where a signal can be *observed* while `OI-S16-1` asks
whether one is *emitted*.

**No contradiction with C010 was found by SUB-16.** The tool-surface figure was checked against
`F-S5-3` and `F-S8-1` as consumed through OUT-16 and **holds at 46 / 43 / 3**; the
server-derived-principal rule against `DR-C10-S8-2`; check `I5` against
`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:174`; and
the `I4`-masks-`I5` position against
`../C010-system-and-repository-architecture/02_findings-register.md:267`, which
`16_attribution-and-detection.md` §3.2 reproduces rather than re-derives. **No amendment is routed to `NEU-895` by SUB-16.** The checks are
recorded so SUB-17's audit can see that they ran and returned empty.

---

### SUB-8

#### `F-S8-1` — Operational logging is a purpose that would rest on consent it could never withdraw, and it fails withdrawability in three independent ways

- **Id:** `F-S8-1`
- **Severity:** High. Not blocking — it is closed by a design choice this chapter makes (operational logging is placed on legitimate interests and stays there), and the residual is an exposure rather than an unmet obligation.
- **Finding:** This is the finding OUT-10's consent boundary is required to produce. Were consent claimed as the lawful basis for operational logging — the request log `LD-S3-16` and the event log `LD-S3-17` — that consent **could not be withdrawn**, for three reasons each independently sufficient. **(a) No consent check can run before the write.** The audit middleware is mounted at the transport layer and writes its row around the request, before any orchestration workflow — which `DR-C11-S8-1` establishes as the *authority* for consent state — is reached. **(b) No per-learner emission switch exists.** Emission is conditional on one process-wide variable at `src/transport/http.ts:177`–`:182`, which is all-or-nothing for the whole deployment; there is no per-principal predicate anywhere on the write path. **(c) Historical rows cannot be located.** Pre-cutover rows carry no key and can never be given one, so a withdrawal could not identify the processing it was withdrawing.
- **Evidence:** `src/transport/audit-middleware.ts` (the middleware write path); `src/transport/http.ts:177`–`:182` (the `if (auditDbUrl)` mount guard); `src/transport/main.ts:55`–`:58` (STDIO writes no row at all, so on that transport the question does not even arise); `91_findings-register.md` § `F-S16-5` for limb (c); `decision-records/DR-C11-S8-1_the-consent-record-and-the-consent-boundary.md` for the authority that limb (a) turns on. Read at cutoff `d2e2b55`.
- **Consequence:** Operational logging is placed on **legitimate interests** in `08_consent-and-what-a-learner-can-export-and-erase.md` §4 and stays there — which is the same position SUB-3 already recorded, now with a stated reason rather than by default. The wider consequence is a constraint on every later design: **a purpose whose processing happens below the layer that owns consent state cannot be consent-governed at all**, which rules out consent as a basis for anything in the transport tier by construction. A later charter that adds a per-learner logging switch would change limb (b) but not limbs (a) or (c).
- **What is assumed rather than derived:** Nothing about the code — all three limbs are read directly. What is **not** established is whether production rows contain learner-derived content at all (`OI-S1-5`, `OI-S1-6`, both owned by SUB-1 and **cited, not re-raised**); the finding is about the *basis available to the purpose*, which holds either way.
- **Named owner:** **The creator, as sole maintainer and sole operator of the production deployment** — the only party who could add a per-learner emission control or decide the logging position. **Co-named `NEU-986` (`SUB-12 of C010`)**, which already owns C010's `CAP-S3-3` / `CAP-S4-1` retention-and-deletion caps over these two tables.
- **Handed to:** **SUB-9** (NEU-1003), whose propagation matrix covers the same two tables and which must not treat a withdrawal as reaching them; **SUB-12** (NEU-1004), for which *"a purpose that cannot be switched off per learner"* is a threat-model input.

#### `F-S8-2` — **BLOCKING.** The pre-cutover log population is a retention exception that cannot be given a justification or a learner-scoped bound

- **Id:** `F-S8-2`
- **Severity:** **Blocking**, per this sub-task's OUT-11 trigger — *a retention exception that cannot be given all four of a justification, a bound, an owner and a stated basis is recorded as a blocking finding rather than accepted, because an unbounded exception is exactly the silent indefinite retention OUT-11 exists to end.*
- **Finding:** Under `DR-C11-S16-2` both log tables become `learner-linked` personal data once the attribution carrier lands, and become reachable by `DELETE … WHERE learner_key = $1`. Rows written **before** the carrier lands carry `principal_kind = 'none'` and no key. **They are personal data that no per-learner predicate selects**, so the erasure duty attaches to them and no mechanism discharges it. Audited against the four-field rule they fail **two** fields outright: there is **no justification** — nobody decided to retain them, the retention is a consequence of a boundary — and there is **no learner-scoped time bound**, because a bound that is population-wide does not discharge one learner's request. Owner and basis can be supplied; justification and bound cannot.
- **Evidence:** `08_consent-and-what-a-learner-can-export-and-erase.md` §9, exception #5, and §8.2. The unattributability itself is `91_findings-register.md` § `F-S16-5` and `92_risk-register.md` § `R-S16-1`, **cited and not re-derived**; the binding structure and its eviction path are `src/transport/http.ts:83` with `F-S15-3`; the restart cadence is `15_operational-objectives-for-the-real-platform.md` §2.2, `C-17`.
- **Consequence:** **An erasure over either log table reports success and a row count while the entire pre-cutover population survives.** The chapter's response is to scope the *guarantee* rather than the *request*: an erasure is stated complete for the attributable population only, and a completion notice that omits that qualifier is false. It also fixes what a population-wide time bound is **not** — recording one here would convert an inability into a policy, which is why this is a finding rather than exception #6.
- **What is assumed rather than derived:** **No row count is asserted.** The population's size is unobserved and depends on `OI-S1-5`, `OI-S1-6` and `OI-S16-1`, all owned and unclosed. It is also not asserted that the population is non-empty — if the audit writer has never been mounted (`OI-S16-1`), it may be empty, and the finding would then be blocking over nothing. That possibility is stated rather than used to downgrade the severity, because the design cannot rest on it.
- **Named owner:** **SUB-9** (NEU-1003) for the population's disposition, under OUT-12; **the creator, as sole maintainer and sole operator**, for the population itself and for the decision to delete or retain it.
- **Resolving event:** SUB-9 publishes a disposition for the pre-cutover population — bulk deletion, bulk anonymization, or an accepted and named residual. On that event this finding is downgraded from blocking to resolved, and `08_…md` §9's exception #5 takes the corresponding treatment.
- **Handed to:** **SUB-9** (NEU-1003), which receives it as an exception it must dispose of rather than as a matrix cell it may resolve to *"delete by key"*; **SUB-12** (NEU-1004), whose gate register cannot record an erasure gate as measurable while it stands; **SUB-17** (NEU-1008), whose completeness audit meets a declared blocking finding rather than discovering one.

#### `F-S8-3` — Four deletion methods are defined and unwired, not one, and no user-facing tool deletes a topic, a session or an answer

- **Id:** `F-S8-3`
- **Severity:** High. Not blocking — it reports the codebase's capability rather than a defect in this package's own output, and the erasure design is explicitly published as a specification in consequence.
- **Finding:** Two facts from one audit. **(a) Four deletion methods are defined on a port, implemented in the Drizzle adapter, and invoked from nowhere in `src/`** — `ContextTokenRepository.deleteExpired` (`src/ports/context-token-repository.ts:6`, `src/adapters/drizzle/context-token-repository.ts:61`), `SessionRepository.deleteSession` (`src/ports/session-repository.ts:62`, `src/adapters/drizzle/session-repository.ts:100`), `SessionRepository.deleteSessionChunk` (`src/ports/session-repository.ts:76`, `src/adapters/drizzle/session-repository.ts:160`) and `LinterValidationRepository.deleteCorpusEntry` (`src/ports/linter-validation-repository.ts:73`, `src/adapters/drizzle/linter-validation-repository.ts:52`). Charter assumption 16 calls `deleteExpired()` *"the only purge path in the codebase"* — accurate for a **bulk/sweep** purge, and narrower than the deletion surface actually is. **(b) Exactly two delete paths are reachable from a user-facing MCP tool** — `delete_chunk` and `delete_note`. There is **no `delete_topic`, no `delete_session`, and no way to delete an attempt or an answer**; `TopicRepository.delete` exists but is reached only as rollback compensation, never from a tool.
- **Evidence:** The `file:line` citations above, each read directly at cutoff `d2e2b55`. Call-site counts by grep over `src/` for each method name: `deleteExpired`, `deleteSession`, `deleteSessionChunk` and `deleteCorpusEntry` each return **only** their port declaration and their adapter definition. `08_consent-and-what-a-learner-can-export-and-erase.md` §10.1 carries the full table.
- **Consequence:** **The erasure design of `08_…md` §8 is a specification, not a description of a capability.** Of the **thirteen** categories it dispositions as `delete` or `cascade` outright — `LD-S3-1` … `LD-S3-10`, `LD-S3-12`, `LD-S3-14`, `LD-S3-31` — a learner can today reach **three**: `LD-S3-2` and `LD-S3-12` directly, and `LD-S3-14` by `ON DELETE CASCADE`. `LD-S3-3` and `LD-S3-4` go only because they are column groups of the same row a chunk deletion removes. Everything else needs code that does not exist. Separately, `deleteExpired()`'s unwired status means expired `context_tokens` rows accumulate without bound, and §10.3 confirms there is no scheduler in `src/` that could ever call it.
- **What is assumed rather than derived:** Nothing. Every method, every call-site count and the absence of each tool were read directly. The finding ranges over the **repository at this cutoff** and says nothing about whether an operator deletes rows by hand — a use this method cannot see, exactly as `CAP-S3-1` bounds `F-S3-1`.
- **Named owner:** **The creator, as sole maintainer and sole operator of the production deployment.**
- **Handed to:** **SUB-9** (NEU-1003), whose propagation matrix must not assume a mechanism exists for a copy class merely because a disposition is stated for it; **SUB-13** (NEU-1006), which authors the DDL and inherits the question of what an erasure path needs; **SUB-12** (NEU-1004), for which *"the erasure duty exceeds the erasure surface"* is a measurable gate with no control behind it.

#### `F-S8-4` — Zero of the inventory's thirty-two categories rests on consent, so the consent boundary is created by this outcome rather than documented

- **Id:** `F-S8-4`
- **Severity:** Medium. Not blocking — it frames the chapter rather than obstructing it, and it is the reason the severability test is published as a re-applicable test.
- **Finding:** **Not one of SUB-3's thirty-two inventory entries carries `consent` as its lawful-basis position.** Every entry reads *contract* or *legitimate interests*. The codebase agrees from the other side: `consent`, `gdpr`, `dsar` and `erasure` return **zero** hits across `src/` and `drizzle/`, and every `retention` hit is the SM-2 spaced-repetition *retention rate* domain metric, unrelated to data-retention policy.
- **Evidence:** `03_learner-data-inventory-and-classification.md` §4–§8, all thirty-two entries read directly. Greps over `src/` and `drizzle/` at cutoff `d2e2b55`. This corroborates charter assumption 37's greenfield claim **from the codebase**, where the charter established it from a sweep of C010's package — two independent routes to the same position.
- **Consequence:** OUT-10 **creates** a consent boundary; it does not document one. A reader who assumes the chapter describes an existing surface will misread every section of it. It is also why the boundary is drawn by a **published test** — a purpose rests on consent iff the service survives switching it off — rather than by an enumeration a reader must accept: with no upstream position to inherit, a test is falsifiable where a list is not. This is `R12`'s exposure (*the data-lifecycle half written as if it had an upstream*) arriving at the outcome `R12` was registered to protect, and the response is the one `R12`'s mitigation names: state the greenfield status, and carry every position's own evidence.
- **What is assumed rather than derived:** Nothing. Both readings were taken directly. The finding says nothing about whether consent *should* have been a basis for any existing category — that would be a legal determination, which is `OI-S3-1`.
- **Named owner:** **SUB-8** (NEU-1002) for the boundary as drawn; **the creator, as sole maintainer and sole operator**, for whether it matches the product's intent.
- **Handed to:** **SUB-9** (NEU-1003) and **SUB-12** (NEU-1004), each of which would otherwise read the consent boundary as an inherited constraint rather than as this package's own first statement of one; **SUB-14** (NEU-1007), for aggregation.

#### `F-S8-5` — SUB-3's enumeration table cites eight of its twelve tables one line past the `export const` its own header names

- **Id:** `F-S8-5`
- **Severity:** Low. Not blocking, and materially harmless — every cited line falls **inside the same declaration**, one line into it, so no reader is sent to the wrong table.
- **Finding:** `03_learner-data-inventory-and-classification.md` §3 heads its table *"The ten `public` tables, in schema-file order, each with the line its `export const` sits on"*. Eight of the twelve table citations in that section point one line **past** that: `learning_chunks` is cited `:50` and its `export const` is at `:49`; likewise `learning_sessions` `:100`/`:99`, `session_chunks` `:127`/`:126`, `session_questions` `:157`/`:156`, `session_question_chunks` `:180`/`:179`, `session_question_attempts` `:198`/`:197`, `session_question_attempt_revisions` `:251`/`:250`, and `notes` `:289`/`:288`. In each case the cited line is the SQL table-name string on the line below. **Four are exact** — `learning_topics` `:21`, `context_tokens` `:312`, `linter_validation_corpus` `:333` and `linter_rule_validation_report` `:364`.
- **Evidence:** `src/infrastructure/db/schema.ts`, `grep -n "^export const"`, read at cutoff `d2e2b55`. **Checked against SUB-3's own cutoff to rule out a line shift:** `git show 86fb38a:src/infrastructure/db/schema.ts` gives byte-identical `export const` line numbers, so this is not an artefact of the file moving between the two cutoffs. That check is recorded because reporting a citation defect against a merged chapter without it would have been the more likely error.
- **Consequence:** Minor and worth exactly the care it is given here. A reader following a citation lands one line into the right declaration. Two live effects: this chapter therefore **cites its own re-derived line numbers** for `src/infrastructure/db/schema.ts` rather than re-using SUB-3's, so the two documents will differ by one at eight points and a later reader should not read that as a disagreement about *which table*; and **SUB-17's citation audit** would otherwise meet the anomaly rather than the explanation. The citation-path checker gates paths, not line numbers, so nothing mechanical catches it.
- **What is assumed rather than derived:** Nothing about SUB-3's intent. This entry takes **no position** on whether the header or the citations were meant to move, and **requests no revision** — `03_learner-data-inventory-and-classification.md` is unmodified by this sub-task and the append-only rule holds. It is **not** a contradiction with C010 and is **not** routed to `NEU-895`.
- **Named owner:** **SUB-14** (NEU-1007), which aggregates the registers and runs the cross-register consistency check, and is the only party positioned to reconcile a citation convention without authoring content. **Co-named SUB-17** (NEU-1008), whose citation audit is the check that would otherwise surface it.
- **Handed to:** SUB-14 and SUB-17, each receiving the eight pairs and the same-cutoff verification above.

---

**SUB-8 register totals at revision 1:** five findings, `F-S8-1` … `F-S8-5`, of which **one is
blocking** (`F-S8-2`). All five carry a named owner. **Both findings the charter's enumeration
requires of this sub-task are present and are the required kind** — `F-S8-1` is the OUT-10
consent-boundary finding (a purpose resting on consent that could not be withdrawn, reported with an
owner), and `F-S8-2` is the OUT-11 blocking finding (a retention exception that cannot be given all
four fields). **Zero findings absorbed into the chapter's prose.**

**Zero second records.** This sub-task raises no record of a question already owned elsewhere. The
controller/processor role and the lawful basis each purpose rests on is **`OI-S3-1`** (SUB-3), cited
in `08_…md` §0 and §15 and in the exception table's basis column; whether either log table holds
learner-derived content in production is **`OI-S1-5`** / **`OI-S1-6`** (SUB-1); whether the audit
writer is mounted at all is **`OI-S16-1`** (SUB-16); where a signal can be observed, and whether the
30-day cleanup script is actually scheduled, is **`OI-S1-9`** (SUB-1); the unread, unredacted
`response_body` minimization finding is **`F-S3-1`**, routed by SUB-3 to **`NEU-986`** and **not
re-routed here**; and that attribution is not retroactive is **`F-S16-5`** / **`R-S16-1`** (SUB-16),
cited rather than restated — `F-S8-2` is the *retention-exception consequence* of that fact, not a
second record of it. Each is consumed by citation. The one genuinely new question — which model
provider the deployment uses, and therefore whether learner content leaves it — is `OI-S8-1`.

**No contradiction with C010 was found by SUB-8.** The authority-assignment rule was checked against
`../C010-system-and-repository-architecture/08_per-state-authority-matrix.md` §5 and applied rather
than re-invented; the individuation rule against
`../C010-system-and-repository-architecture/decision-records/DR-C10-S3-1_state-category-individuation.md:11`–`:13`;
the `post-validation` revision's scope against
`../C010-system-and-repository-architecture/10_republished-authority-matrix.md:46`, `:62`–`:65` and
`:94`–`:96`; charter assumption 37's greenfield claim against C010's `CAP-S3-3` / `CAP-S4-1` /
`F-S3-3` / `CAP-S7-1` chain (**C010's** ids, written qualified); and C010's `CAP-S7-1` against this
chapter's erasure scope, which is consistent with it and does not discharge it — **discharging
`CAP-S7-1` is SUB-9's**. Every one is consistent or cited. **No amendment is routed to `NEU-895` by
SUB-8.** The checks are recorded so SUB-17's audit can see that they ran and returned empty.
