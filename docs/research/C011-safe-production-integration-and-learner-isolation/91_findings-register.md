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
### SUB-5

*`NEU-997`, covering `OUT-8`, which charter assumption 49 names in the findings-register enumeration.
**A namespace warning applies to this whole section:** C010 has its own SUB-5 and allocated
`F-S5-1` … `F-S5-4`, three of which this package cites heavily. Per `F-S2-2`'s rule, **a bare
`F-S5-<k>` here is C011's**; C010's is always written with its full package path.*

#### `F-S5-1` — Only 7 of the 13 ports are row-owning, not 9, and one of the two misfits is a second write path into a table it does not own

- **Id:** `F-S5-1`
- **Finding:** Charter assumption 23 states *"The port surface is 13, of which 9 are row-owning"* and enumerates them. The count of 13 is correct; the composition is not. **`Tier2BlockingStatsRepository` owns no rows at all** — its single method runs a raw aggregate over `infrastructure.operation_event_log` and never touches a table of its own, which its port doc states outright. **`ReviewPersistencePort` owns no table either** — its one write method writes into `learning_chunks`, the table `ChunkRepository` owns, making it **a second write path into a chunk-owned table**. The corrected composition is 7 row-owning · 1 cross-table write-and-read · 1 aggregate read-path · 1 read-path · 1 transactional composer · 2 external-service = 13.
- **Evidence:** `src/adapters/drizzle/tier2-blocking-stats-repository.ts:32`–`:47` (raw CTE over `infrastructure.operation_event_log`); `src/ports/tier2-blocking-stats-repository.ts:10`–`:11` (*"This port intentionally returns aggregated weekly bins rather than raw events"*); `src/adapters/drizzle/review-persistence-adapter.ts:78`–`:82` (`.update(learningChunks).set(updates).where(eq(learningChunks.id, chunkId))`). Direct listing of all 13 files in `src/ports/` at cutoff `cc38cc9`.
- **Consequence:** Load-bearing for the enforcement point, in two directions. A per-port table built on the charter's 9 would scope `Tier2BlockingStatsRepository` with a predicate it has nothing to attach to, and — far worse — would treat `ReviewPersistencePort` as self-contained, **leaving `learning_chunks` writable through an unscoped route after `ChunkRepository` was scoped**. `05_the-enforcement-point-that-confines-every-read-and-write.md` §3 rows 8 and 9 handle both explicitly.
- **What is assumed rather than derived:** Nothing. Both claims are direct reads of the adapter bodies at a stated cutoff.
- **Handed to:** **SUB-14 (NEU-1007)** under OUT-20, for reconciliation against charter assumption 23; **SUB-13 (NEU-1006)** under OUT-19, whose DDL must give `learning_chunks` a key that both write paths honour; **SUB-12 (NEU-1005)** under OUT-17, whose per-path matrix inherits the second write path as a path.

#### `F-S5-2` — `EmbeddingPort` and `ContentClassifierPort` are excluded correctly and for the wrong stated reason: they are outbound-network adapters, not pure-compute, and therefore a data-egress path

- **Id:** `F-S5-2`
- **Finding:** Charter assumption 23 describes the two excluded ports as *"2 pure-compute ports … that own no rows and are outside the blast radius"*. The **exclusion is right** — they own no persistent state, so no ownership predicate can attach — but *pure-compute* is not what they are. Both are adapters to **external LLM and embedding providers**, reached over the network, and both are the only optional members of `AppPorts`. The correct justification is *owns no persistent state*, not *performs no I/O*.
- **Evidence:** `src/composition-root.ts:130`–`:131` (the only two `?`-optional port members); the concrete adapters live under `src/adapters/langchain/` and are injected only when a provider environment variable is configured.
- **Consequence:** The difference is not pedantic. A pure-compute port has no confinement surface of any kind; an outbound-network port has one the enforcement point does **not** cover — chunk content and classifier prompts **leave the deployment**. That is not a cross-learner exposure and is not represented as one, but it is a data-protection surface, and an exclusion justified as *"pure"* would have closed the question silently. `05_the-enforcement-point-that-confines-every-read-and-write.md` §6.1 states the egress as escaping.
- **What is assumed rather than derived:** That the providers are third parties rather than self-hosted. The repository configures them by provider environment variable and names no self-hosted deployment; whether a given operator points them at a self-hosted endpoint is a deployment fact this package cannot observe.
- **Handed to:** **SUB-8 (NEU-1002)** under OUT-11, which defines what learners can export and erase and is where a third-party processor belongs; **the named owner of `OI-S3-1`**, the controller/processor and lawful-basis item, cited and not duplicated; **SUB-14 (NEU-1007)** for the assumption-23 wording.

#### `F-S5-3` — `AppContext` carries 57 members, not 56, and the charter's line range is off by two at both ends — a miscount, not drift

- **Id:** `F-S5-3`
- **Finding:** Charter assumption 13 states *"All **56** `AppContext` members (`src/composition-root.ts:516`–`:631`) are subject-less — **52 closures**, 2 shorthand references … the `contextTokens` port handle and the `contextTokenTtlMs` scalar (`:601`–`:602`, declared at `:285`–`:286`)"*, and records the split as re-derived member by member at round 6. Re-read at this cutoff, the object literal opens at **`:518`** and closes at **`:636`**, and carries **57** members: **53** closures + 2 shorthand references + 1 port handle + 1 scalar. The two shorthand references are at **`:608`** and **`:627`**, not `:606` and `:622`; the handle and scalar are at **`:603`**–**`:604`**, not `:601`–`:602`. The interface declaration at `:285`–`:286` is correct, and so is every structural claim: all 57 are subject-less and they are not all closures.
- **Evidence:** `src/composition-root.ts:518`–`:636`, enumerated member by member with each member's line recorded at `05_the-enforcement-point-that-confines-every-read-and-write.md` §5.1. **`git log` establishes this is not drift:** the file was last modified on 2026-08-04 by commit `aa56c05`, three weeks before the charter was written and before any C011 chapter landed. The file the charter counted is byte-for-byte the file counted here.
- **Consequence:** The `AppContext` walk is an acceptance condition stated as an arithmetic identity — *"`52 + 4 = 56` is reported so the walk is checkably complete"*. The walk reports **`53 + 4 = 57`**. The condition's intent is met exactly (every member accounted for, no non-closure asked a closure question); its literal figure cannot be, because it is wrong about the file. The measure is recorded as written in `90_outcome-register.md` and the true figure reported against it rather than the measure being quietly restated.
- **What is assumed rather than derived:** Nothing. Both the count and the non-drift are mechanical.
- **Handed to:** **SUB-14 (NEU-1007)** under OUT-20, which reconciles charter figures at assembly; **SUB-17 (NEU-1008)**, whose completeness audit checks stated counts against their sources.

#### `F-S5-4` — A third unscoped session read path exists that the charter does not name, and it returns every session row in the database

- **Id:** `F-S5-4`
- **Finding:** The charter names two write-path invariants. A search for every query reaching `public.learning_sessions` without an owner predicate returns a third: **`DrizzleSessionRepository.listSessions()`** applies a status filter only when one is passed and applies no other predicate at any time. Called with `{ status: 'active' }` it is a second unscoped active-session read; **called with no options it returns every session row in the database.**
- **Evidence:** `src/adapters/drizzle/session-repository.ts:105`–`:118`, with the only predicate applied conditionally at `:111` and ordering at `:113`; reached from `src/orchestration/learner-context-workflows.ts:99`, in the same `Promise.all` fan-out as `getActiveSession`.
- **Consequence:** A change set implementing exactly the charter's two named removals **ships with this path intact**. Charter § Risks row `R1` is worded as *"an ownership column lands while the unscoped `getActiveSession()` … still permits access"* — this is that risk under a different method name, and it is registered inside `R1` rather than as a separate exposure.
- **What is assumed rather than derived:** Nothing. The absent predicate is read directly from the method body.
- **Handed to:** **SUB-13 (NEU-1006)** under OUT-19; **SUB-7 (NEU-1001)** under OUT-3, whose stage must land all three removals together; **SUB-12 (NEU-1005)** under OUT-17.

#### `F-S5-5` — The deployed transport still derives the subject as `sub || azp`, contradicting the settled identity rule the enforcement point consumes

- **Id:** `F-S5-5`
- **Finding:** `DR-C11-S2-1` fixes the learner key as the OIDC `sub` verbatim and rules that *"`azp` is never a learner key"*. The deployed middleware does the opposite: when `sub` is absent the resolved subject **is** `azp`, and it is then written into a field named `sub`. Every downstream reader consumes the merged value under that name.
- **Evidence:** `src/transport/jwt-middleware.ts:127` — `const subject = (typeof payload.sub === 'string' && payload.sub) || azp || undefined;` — populated into `res.locals.auth` as `{ sub: subject, … }` at `:133`–`:136`; consumed at `src/transport/rate-limit-middleware.ts:76`–`:79` (per-subject rate-limit key) and `src/transport/http.ts:52`–`:72` (session binding).
- **Consequence:** This is the merge `R-S4-1` warns will reappear below the transport edge, and it is **already live above it**. An enforcement point that took its principal from `res.locals.auth.sub` as that field stands today would confine a `client`-kind principal as though it were a learner — passing check `I5`'s letter while inverting its purpose. Removal is therefore assumed as **C4** of the composed target state in `05_the-enforcement-point-that-confines-every-read-and-write.md` §8.1, not treated as already done.
- **What is assumed rather than derived:** Nothing about the code. That the merge is *reachable* in production depends on whether any admitted token lacks a `sub`, which is `OI-S2-2` / `OI-S1-1` and is unobserved — the finding is about the code path's existence, not its frequency.
- **Handed to:** **SUB-13 (NEU-1006)** under OUT-19, whose cutover work must remove it; **SUB-7 (NEU-1001)** under OUT-3, since removing it is a stage with an ordering constraint; **SUB-2 (NEU-994)** by citation, as the author of the rule it contradicts — **no amendment is routed to SUB-2**, whose decision is correct and simply unimplemented.

#### `F-S5-6` — `principal_kind` has two different domains in this package, both handed to the enforcement point, and nobody reconciles them

- **Id:** `F-S5-6`
- **Finding:** SUB-4's `context_tokens` column is **two-valued** — `user | client`. SUB-16's log-table column is **three-valued and `NOT NULL`** — `user | client | none`. Both records hand their column to the enforcement point as its input, and neither states a relationship to the other.
- **Evidence:** `04_the-stdio-identity-gate-and-the-bound-context-token.md:248` (two-valued); `decision-records/DR-C11-S16-1_the-attribution-carrier.md:14` (three-valued, `NOT NULL`, *"exactly one of `user`, `client`, `none`"*).
- **Consequence:** SUB-13 would otherwise author two `CHECK` constraints that disagree about the domain of a column of the same name, and a consumer reading one and validating against the other would reject valid rows. `05_the-enforcement-point-that-confines-every-read-and-write.md` §2 states the reconciliation: the enforcement point reads the **three-valued** domain, because a two-valued one cannot represent *no principal was determined at all* and would collapse an outage into an authorization boundary; and `none` is **unreachable on the token row by construction**, since a `context_tokens` row exists only because a principal was determined. Neither predecessor is wrong for its own table.
- **What is assumed rather than derived:** That `none` is genuinely unreachable on `context_tokens` — derived from `DR-C11-S4-1` clause 3, under which an unconfigured transport mints nothing rather than minting an unattributed row. If a future path minted a row without a determined principal, the reconciliation would need restating.
- **Handed to:** **SUB-13 (NEU-1006)** under OUT-19, which writes both constraints; **SUB-14 (NEU-1007)** under OUT-20, for the cross-register consistency check.

#### `F-S5-7` — The `…md` citation shorthand this package uses is invisible to the citation checker, so a clean run is not evidence about it

- **Id:** `F-S5-7`
- **Finding:** The citation checker discards **any** candidate token containing `…` or `...` before the token is counted at all. Predecessor chapters cite siblings in the `06_…md` form throughout. Those references are therefore never validated in either direction — they appear in no resolved, non-resolving or exempted bucket — so a `0 non-resolving` result says nothing whatever about them. The same applies to any backticked reference containing a space, which the checker also discards.
- **Evidence:** `scripts/citation-paths/checker.ts:121` (`if (t.includes('…') || t.includes('...')) return null;`), reached from `normalizeCandidate` before the counter increments; `scripts/citation-paths/checker.ts:123` (whitespace discard). Independently confirmed by grep over the package: the form is in active use across the merged chapters.
- **Consequence:** Two. First, **this chapter writes every reference as a full filename with its line**, so its own count is meaningful; the ellipsis occurrences that remain in it are prose elisions and SQL elisions, not path citations. Second, and more consequentially for the package: **C011 reports `0 non-resolving` and that figure is true but incomplete**, because it never ranged over the shorthand references at all. A reader treating the zero as a package-wide guarantee would be over-reading it.
- **What is assumed rather than derived:** Nothing. Both the discard and the ordering relative to the counter are read directly from the checker.
- **Handed to:** **SUB-14 (NEU-1007)** under OUT-20, which owns `CAP-S1-2` — the cap recording that C011 is not in the checker's gated list — and which will be registering the package. Registering a package whose shorthand references were never checked would make the gate green on first run and silently exempt; **SUB-17 (NEU-1008)** for the citation audit.

#### `F-S5-8` — The single-learner guard is a time-of-check-to-time-of-use race, so it does not enforce the invariant it appears to enforce

- **Id:** `F-S5-8`
- **Finding:** `createSession` reads for an existing active session and then inserts, with nothing atomic between the two. Two concurrent calls both read `null` and both proceed to insert. The guard therefore prevents two active sessions **only when the calls are serialized**; under concurrency it prevents nothing.
- **Evidence:** `src/orchestration/session-workflows.ts:39`–`:46` — the read at `:39`, the conditional failure at `:40`–`:46`, and no transaction, lock or unique constraint anywhere between the read and the subsequent insert. `public.learning_sessions` carries no unique constraint on status (`src/infrastructure/db/schema.ts:99`).
- **Consequence:** It strengthens the case for §4.2's disposition rather than complicating it. The guard is being **deleted** and the rule re-expressed as a partial unique index, and a database constraint closes the race as a side effect of closing the placement problem — so the correct fix for the placement defect C010's `../C010-system-and-repository-architecture/02_findings-register.md:237` records is also the correct fix for this one. Had the design merely scoped the guard's read, the race would have survived scoped.
- **What is assumed rather than derived:** That concurrent `createSession` calls are reachable. On HTTP they plainly are; the frequency is unobserved and no rate is asserted.
- **Handed to:** **SUB-13 (NEU-1006)** under OUT-19, which authors the index and inherits the concurrent integration test §7.4 names as required.

#### `F-S5-9` — One aggregate cannot be confined by any port-boundary mechanism, because the table it reads has no ownership key and sits behind no port that `OUT-2` reaches

- **Id:** `F-S5-9`
- **Finding:** `Tier2BlockingStatsRepository.getWeeklyBlockingCounts()` aggregates `infrastructure.operation_event_log`, a table `NEU-850`'s `OUT-2` does not reach because the key is threaded *through the ports* and this table sits behind none. There is therefore no predicate to push below its aggregation, and its weekly counts span every learner. It returns no rows, which is exactly why the exposure is easy to miss.
- **Evidence:** `src/adapters/drizzle/tier2-blocking-stats-repository.ts:32`–`:47`; C010's `OI-S5-1` at `../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:202`, which records that the two log tables sit behind no port and that the assumed set threads the key through the ports.
- **Consequence:** It is named as **escaping** the enforcement point rather than covered by it, and it is the concrete instance of the general rule `05_the-enforcement-point-that-confines-every-read-and-write.md` §6.3 states: an aggregate is confined **iff** the predicate applies before aggregation, and *"returns no rows"* is not a confinement argument. Whether the disclosure matters depends on what the counts reveal, which is a retention-and-deletion question over the log tables rather than an isolation one.
- **What is assumed rather than derived:** The reading of `OI-S5-1`'s scope — whether `OUT-2`'s *"every core table"* ranges over the port-less log tables. This package carries that reading as `A-S3-1` and does not decide it; the finding holds under either reading, because under the wider one the key would still need a port to be threaded through.
- **Handed to:** **`NEU-986` (`SUB-12 of C010`)**, co-named **`NEU-896`**, as owner of `CAP-S3-3` and `CAP-S4-1`, the retention-and-deletion caps over the two log tables; **SUB-12 (NEU-1005)** under OUT-17, whose matrix must carry the path with an explicit invariant rather than exempting it.

#### `F-S5-10` — `user_id NOT NULL` cannot be added to a populated table in one step, so the ownership key, the backfill and the predicate are three stages and not one

- **Id:** `F-S5-10`
- **Finding:** `NEU-850`'s `OUT-2` specifies the ownership key as `NOT NULL`. Adding a `NOT NULL` column to a table that already holds rows requires either a backfill or a default, and the existing rows have no owner to backfill *to* until SUB-6 dispositions them. The column, the backfill and the confinement predicate therefore cannot land together, and the ordering between them determines whether the intermediate state is unavailable, unconfined, or wrong.
- **Evidence:** `NEU-850`'s `OUT-2` as reproduced at `../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:50`–`:53` (`user_id` column, `NOT NULL`, on every core table); the tables are populated in production, and zero ownership columns exist today (`05_the-enforcement-point-that-confines-every-read-and-write.md` §1.5).
- **Consequence:** A rollout constraint, not a design defect, and it is stated here so SUB-7 inherits it rather than deriving it from the DDL. It compounds with `R-S5-1`: during any window in which the predicate is live and the backfill is incomplete, unowned rows are invisible to every principal.
- **What is assumed rather than derived:** That the target tables are non-empty in production. No row count is asserted and none is observed; the assumption is that a deployment backing a live product holds rows.
- **Handed to:** **SUB-7 (NEU-1001)** under OUT-3, which owns the stage sequence; **SUB-6 (NEU-1000)** under OUT-2, which owns the disposition the backfill needs; **SUB-13 (NEU-1006)** under OUT-19, which writes the migration.

#### `F-S5-11` — `notes.author` is a role enum, not an identity, and it is the column most likely to be mistaken for attribution

- **Id:** `F-S5-11`
- **Finding:** `public.notes` already carries a column named `author`, constrained to `IN ('agent', 'user')`. It records **whether a note was written by the agent or by the human**, and its value is identical across every learner in the deployment. It is not an ownership key, cannot become one, and its value `'user'` is unrelated to `principal_kind = 'user'` despite the shared token.
- **Evidence:** `src/infrastructure/db/schema.ts:296` (the column) and `:308` (the `chk_note_author` check constraint).
- **Consequence:** `SC-S3-12` is the category this package carries to `holds`, and its `I2` answer turns on the table resolving each row to exactly one principal. A reader — or an implementer — who took `author` for attribution would mark `I2` satisfied on a column that distinguishes nobody, and the resulting `holds` would be worthless. The distinction is stated explicitly inside the `I2` answer at `05_the-enforcement-point-that-confines-every-read-and-write.md` §8.4 rather than left to inference.
- **What is assumed rather than derived:** Nothing. The constraint is read directly.
- **Handed to:** **SUB-13 (NEU-1006)** under OUT-19, which must add a distinct ownership column to this table rather than repurposing `author`; **SUB-9 (NEU-1003)** under OUT-12, whose propagation matrix must not treat `author` as a learner predicate.

#### `F-S5-12` — The enforcement point is a second, independent cause of the deploy-pipeline break, so unmounting the transport gate does not unbreak the release

- **Id:** `F-S5-12`
- **Finding:** `F-S4-3` and `R-S4-2` establish that the CD smoke run mints a `client_credentials` token and calls gated learner-state tools, which the transport gate refuses under `DR-C11-S2-2` — breaking the deploy on every release. The enforcement point refuses **the same principal again, one layer lower**: `DR-C11-S5-1` clause 3 refuses every row-owning operation for a `client`-kind principal, at the adapter, unconditionally on any middleware being mounted. **The two refusals are independent.**
- **Evidence:** `92_risk-register.md:269`–`:278` (`R-S4-2`) and `91_findings-register.md:260` (`F-S4-3`) for the first cause; `decision-records/DR-C11-S5-1_the-enforcement-point.md` clause 3 and `05_the-enforcement-point-that-confines-every-read-and-write.md` §2 for the second.
- **Consequence:** It removes a mitigation an unwary rollout would reach for. Shipping the enforcement stage while holding back or unmounting the transport gate — a natural way to de-risk the sequence — **still fails the smoke suite**, and fails it inside the adapter where the failure is harder to attribute to its cause. Any stage that ships clause 3 breaks the deploy gate on its own. Softening the refusal to an empty result is not available: `DR-C11-S2-2` rejects it at the transport and clause 3 rejects it again at the adapter, for the same reason.
- **What is assumed rather than derived:** Nothing about the pipeline, which is read from SUB-4's evidence. That the smoke suite's gated calls reach row-owning adapters is derived from the tools it calls being learner-state tools.
- **Handed to:** **SUB-7 (NEU-1001)** under OUT-3 — the sequencing obligation, which now binds the enforcement stage and not only the transport-gate stage; **the creator, as sole maintainer and sole operator**, who owns the fix itself per `R-S4-2` and is the only party who can re-scope the suite or re-provision the principal.

#### `F-S5-13` — Five files in this package end with a stray `</content>` tag

- **Id:** `F-S5-13`
- **Finding:** Five files authored by SUB-15 carry a stray `</content>` closing tag on their final line — an authoring artifact, not content. No other file in this package, and no file in C010, carries one.
- **Evidence:** the last line of `15_operational-objectives-for-the-real-platform.md`, `traceability/S15_operational-objectives.md`, `decision-records/DR-C11-S15-1_objective-basis-and-evidence-labels.md`, `decision-records/DR-C11-S15-2_first-break-ranking.md` and `decision-records/DR-C11-S15-3_non-charter-register-id-scheme.md`, each read at cutoff `cc38cc9`.
- **Consequence:** Cosmetic in isolation, and material for a package whose deliverable is a cold-readable document set: OUT-20's cold read is performed by an agent working only from the published package, and a stray markup tag is the kind of artifact that reads as a truncation. **It is not fixed here** — the registers are append-only and a chapter is another sub-task's artifact, so editing five of them for a cosmetic gain would breach the no-rewrite rule this package's every register states.
- **What is assumed rather than derived:** That it is an authoring artifact rather than intentional content. No plausible reading makes a bare closing tag with no opening tag intentional.
- **Handed to:** **SUB-14 (NEU-1007)** under OUT-20, which owns house-style assembly and is the party permitted to touch another sub-task's file.

---

**SUB-5 register totals at revision 1:** thirteen findings, `F-S5-1` … `F-S5-13`. Four are
corrections to figures the charter carries (`F-S5-1`, `F-S5-3`, `F-S5-4`, and `F-S5-6` against two
predecessors); four are defects in the deployed code found while enumerating access paths (`F-S5-5`,
`F-S5-8`, `F-S5-9`, `F-S5-11`); three are consequences of this outcome's own design (`F-S5-10`,
`F-S5-12`, and `F-S5-2`'s egress); two are package-hygiene defects found in passing (`F-S5-7`,
`F-S5-13`). Every entry carries an owner.

**No contradiction with C010 was found by SUB-5, and no amendment is routed to `NEU-895`.** Twelve
C010 items were checked one by one at
`05_the-enforcement-point-that-confines-every-read-and-write.md` §13 and the check returned empty.
The two candidates that might have routed one did not: the `A-28` envelope check places the design
**inside** the envelope under two of its three named forms, so the invalidating outcome did not
fire; and §2 clause 3's refusal of `client`-kind principals at the adapter is an **addition** to a
C010 pricing rather than a contradiction of one. The checks are recorded so SUB-17's audit can see
that they ran and returned empty.

**One near-duplicate is deliberately recorded as such.** `F-S5-12` and SUB-4's `F-S4-3` describe the
same broken release gate. They are not folded together because they are **different causes** — one
at the transport, one at the adapter — and the whole content of `F-S5-12` is that fixing the first
does not fix the second. Collapsing them would lose exactly the fact SUB-7 needs.

---

### SUB-6

#### `F-S6-1` — The pre-cutover population is addressable only as a whole, and the two mechanisms fail in opposite directions for one reason

- **Id:** `F-S6-1`
- **Finding:** SUB-8 and SUB-5 describe the same rows and reach opposite conclusions — erasure
  **under**-reaches them (`DELETE … WHERE learner_key = $1` reports success while the whole
  pre-cutover population survives) and confinement **over**-reaches them (a per-learner predicate
  matches none of them, so they are hidden from everyone). Neither is a defect in the other's
  design. Both are consequences of a single fact: **both mechanisms are per-learner, and the
  population has no per-learner structure**, because attribution is not retroactive. The two
  failures look opposite because one is a write and the other is a read; they are the same absence.
- **Evidence:** `08_consent-and-what-a-learner-can-export-and-erase.md:450`–`:452` and `:459`–`:463`;
  `05_the-enforcement-point-that-confines-every-read-and-write.md:624`–`:629`;
  `16_attribution-and-detection.md:279`–`:283`.
- **Consequence:** A disposition cannot fix either mechanism on these rows, and any that claimed to
  would be contradicting SUB-16. `DR-C11-S6-2` instead **closes the population** — which is the one
  property both failures actually need and neither mechanism supplies.
- **What is assumed rather than derived:** Nothing. All three source statements are quoted from
  merged chapters.
- **Handed to:** **SUB-9 (NEU-1003)** under OUT-12, which owes the population its propagation
  action; **SUB-7 (NEU-1001)** under OUT-3, which sequences the cutover that closes it.

#### `F-S6-2` — Mis-ownership is undetectable by aggregate: the pathology class for which no probe can be written

- **Id:** `F-S6-2`
- **Finding:** OUT-2 requires that a pathology class for which no probe could be written is reported
  as a finding rather than recorded as a silent omission. This is that class. **No aggregate query
  can detect that two human principals' rows are commingled in the pre-cutover population**, because
  no column in any of the ten population-A tables distinguishes one principal from another — a grep
  for every ownership-column form returns zero matches at `35f92ba`. There is no count, no grouping
  and no `DISTINCT` that returns a different answer under one human than under two. The probe set of
  `06_the-disposition-of-every-unowned-row.md` §6 looks for dirty data; this is not dirty data, it is
  **absent** data, and no probe of any size reaches it.
- **Evidence:** the zero-match grep recorded at `06_the-disposition-of-every-unowned-row.md` §1.2,
  corroborated at
  `../C010-system-and-repository-architecture/04_state-category-inventory.md:442`–`:443`;
  `notes.author` is a two-value kind enum carrying no identity (`src/infrastructure/db/schema.ts:296`,
  constrained at `:308`); `mcp_request_log.session_id` is a *learning*-session id read from tool
  arguments (`src/transport/audit-middleware.ts:94`–`:99`), not a principal.
- **Consequence:** `A-S6-1` — the single-principal premise on which ten of the fourteen dispositions
  rest — **is unfalsifiable in place**. If it is false, the backfill commingles two people's data
  under one identity, which is worse than leaving the rows unowned and is the opposite of what this
  package exists to deliver. The premise can only be settled from knowledge outside the database.
- **What is assumed rather than derived:** Nothing about the finding itself. The finding is precisely
  that the *assumption* `A-S6-1` cannot be converted into a derivation by any available query.
- **Handed to:** **The creator, as sole maintainer and sole operator** — the only party who knows
  whether any second human ever used the deployment. Additionally **SUB-9 (NEU-1003)** and
  **SUB-17 (NEU-1008)**, whose audits range over the premise's consequences.

#### `F-S6-3` — The Tier-2 blocking aggregate under-reports for five weeks after cutover, then becomes fixable for the first time

- **Id:** `F-S6-3`
- **Finding:** `DrizzleTier2BlockingStatsRepository` aggregates `infrastructure.operation_event_log`
  over a rolling five-week window. Archiving the pre-cutover rows removes from that window every row
  written before the cutover, so for the five weeks immediately following it the aggregate reads a
  truncated set and **under-reports its weekly blocking counts**. After five weeks it reads only
  carrier-bearing rows — at which point a confinement predicate **can** be pushed below its
  aggregation, and `F-S5-9` becomes fixable for the first time.
- **Evidence:** the query and its five-week window at
  `src/adapters/drizzle/tier2-blocking-stats-repository.ts:34`–`:47`, whose `WHERE` clause at
  `:40`–`:42` filters only on event type, the window and a not-null guard, with **no ownership
  predicate** because the table has no ownership column; SUB-5's registration of the same query as
  `F-S5-9`.
- **Consequence:** A live code path changes behaviour for a bounded period as a direct result of this
  sub-task's disposition. It is **not fixed here** — nothing in this sub-task touches `src/` — and
  the under-reporting is transient and self-correcting, but a consumer reading those counts across
  the cutover would see an unexplained dip.
- **What is assumed rather than derived:** That the archive removes the rows from the table the
  aggregate reads. That is what `archive` means in `DR-C11-S6-2`, but the mechanism by which the rows
  leave — a move to a separate table, a partition detach — is SUB-13's to choose, and a choice that
  left them readable by this query would make the finding moot.
- **Handed to:** **SUB-7 (NEU-1001)** under OUT-3 for the sequencing, and **SUB-13 (NEU-1006)** under
  OUT-19, which writes the migration and chooses the mechanism.

#### `F-S6-4` — `LD-S3-32` does not exist at position 8 either: a classified artifact that has still never been produced

- **Id:** `F-S6-4`
- **Finding:** SUB-3 inventoried the aggregate result set as `LD-S3-32`, classified it *not personal
  data*, and recorded that it "does not exist at position 3". SUB-5 restated it as SUB-6's to
  produce. **SUB-6 could not produce it.** The queries are specified and published; their values
  require a credential that does not exist. The package therefore carries a classified artifact that
  has now failed to appear at two consecutive positions, and would carry it silently if this were not
  recorded.
- **Evidence:** `03_learner-data-inventory-and-classification.md:473`–`:476` (the classification and
  the "does not exist at position 3" note);
  `05_the-enforcement-point-that-confines-every-read-and-write.md:613`–`:614` (SUB-5 naming it as
  SUB-6's); `06_the-disposition-of-every-unowned-row.md` §6.4, where every result cell reads *not
  executed — no credential*.
- **Consequence:** SUB-3's classification is correct and stays correct — it is a correct
  classification of something that does not exist. But OUT-20's band reconciliation would otherwise
  find an inventoried category with no producing artifact and no explanation.
- **What is assumed rather than derived:** Nothing. The non-existence is a fact about this
  environment, recorded rather than inferred.
- **Handed to:** **SUB-14 (NEU-1007)** under OUT-20 for the band reconciliation, and
  **SUB-17 (NEU-1008)** for the completeness audit. Tracked as `OI-S6-1`.

#### `F-S6-5` — The archive stage opens a transient write-unavailability window on both log tables — and it is not a third cause of the smoke-run break

- **Id:** `F-S6-5`
- **Finding:** Stage S1 moves the pre-cutover rows of both log tables. During the move, the audit and
  event transports' batch inserts can fail. This is a **transient** window bounded by the stage's
  duration, not a standing refusal, so it is **not a third independent cause** of the deploy-pipeline
  smoke-run break `F-S5-12` records — that break still has exactly the two causes SUB-4 and SUB-5
  identified. It is nonetheless a new sequencing input that SUB-7 does not otherwise have.
- **Evidence:** the two raw batch inserts at `src/transport/pg-audit-transport.ts:117`–`:118` and
  `src/transport/pg-event-transport.ts:109`–`:110`; `F-S5-12` at
  `05_the-enforcement-point-that-confines-every-read-and-write.md:1217`–`:1221`; the per-stage
  analysis at `06_the-disposition-of-every-unowned-row.md` §10.
- **Consequence:** Both transports buffer and drop rather than crash, so the failure mode is lost
  audit entries within `OBJ-10`'s stated allowance rather than a failed deploy or a crashed process.
  SUB-7 must nonetheless place S1 where that loss is acceptable.
- **What is assumed rather than derived:** That the drop-rather-than-crash behaviour holds under this
  particular failure. The transports' circuit-breaker path is designed for a failing sink, and a
  missing or locked table is within that class, but no test exercises this specific case.
- **Handed to:** **SUB-7 (NEU-1001)** under OUT-3.

#### `F-S6-6` — Seven of the fourteen tables carry no pathology probe, and `operation_event_log` is the one that matters

- **Id:** `F-S6-6`
- **Finding:** OUT-2 asks for a probe per named pathology **per table**. The published set does not
  deliver 5 × 14. `06_the-disposition-of-every-unowned-row.md` §6.3 resolves every pathology, for
  every table, to **probed**, **foreclosed by constraint or type**, or **not probed** — and seven
  tables fall in the third state: `session_chunks`, `session_question_chunks`,
  `session_question_attempt_revisions`, `context_tokens`, `linter_validation_corpus`,
  `linter_rule_validation_report` and `operation_event_log`.
- **Evidence:** the coverage table at `06_the-disposition-of-every-unowned-row.md` §6.3, derived from
  the probe set at §6.2 by resolving each of the twelve probes against each of the fourteen tables in
  §3.
- **Consequence:** Six of the seven are defensibly low-consequence — five carry only `NOT NULL`
  scalars behind constraint-backed foreign keys and take `backfill-by-join`, and
  `linter_rule_validation_report` takes `no-key-owed` and is read by no stage.
  **`operation_event_log` is not.** It takes `archive`, it holds learner free text, it is the table
  the one unconfinable aggregate reads (`F-S5-9`), and it is named inside `P-ENC-1`'s column list
  without a discovery query of its own. A pathology in it would reach the archive unexamined.
- **What is assumed rather than derived:** That the six low-consequence tables really are low
  consequence. That rests on their columns being constraint-covered scalars, which is read from the
  schema, and on their dispositions not reading any un-probed column, which is read from §9.2 — but
  neither has been exercised against real rows, because no probe has run at all.
- **Handed to:** **SUB-13 (NEU-1006)** under OUT-19, which inherits the pre-flight probe re-run
  `R9` requires and is the party that would write the missing `operation_event_log` probe before
  execution.

---

**SUB-6 register totals at revision 1:** six findings, `F-S6-1` … `F-S6-6`. **Two are the findings
OUT-2 names by requirement**: `F-S6-2` is the pathology class for which no probe can be written, and
the companion requirement — a table for which no disposition can be justified — was checked against
all fourteen and returned **none**, so it is recorded as *checked and not filed* at
`06_the-disposition-of-every-unowned-row.md` §3 rather than filed as an empty entry, and `F-S6-6`
records the residual on the *other* half of that clause — the literal "per table" reading the probe
set does not fully satisfy. Of the remaining four, one reconciles two predecessors' opposite
conclusions (`F-S6-1`), one is a behavioural consequence of this sub-task's own disposition on a live
code path (`F-S6-3`), one is a package-hygiene defect found in passing (`F-S6-4`), and one is a
sequencing input with an explicit statement of what it is **not** (`F-S6-5`). Every entry carries an
owner.

**No contradiction with C010 was found by SUB-6, and no amendment is routed to `NEU-895`.** Seven
C010 items were checked one by one at `06_the-disposition-of-every-unowned-row.md` §13 and the check
returned empty. The three candidates that might have routed one did not. The `A-28` envelope check
places every disposition **inside** the envelope, and `no-key-owed` — the one value the envelope does
not name — is inside under **both** readings of its scope, so the invalidating outcome did not fire.
`SC-S3-45` is a category this migration **creates**, which is an addition to a C010 pricing rather
than a contradiction of one. And the 46 / 43 / 3 tool surface was re-counted independently at this
cutoff and **agreed** with `F-S5-3`; `42` is not repeated as a codebase fact anywhere.

**One finding is deliberately framed by what it excludes.** `F-S6-5` exists as much to state that
this sub-task adds **no third cause** to `F-S5-12` as to record the window it does add. SUB-5 was
explicit that the whole content of `F-S5-12` is that fixing one cause does not fix the other; a
sub-task that quietly introduced a third would destroy that fact's usefulness to SUB-7, and one that
introduced a transient window without saying it was *not* a third would leave SUB-7 to work it out.
### SUB-11

#### `F-S11-1` — The package's SUB-11 / SUB-12 tracker-id block is inconsistent, and every hand-forward addressed to this sub-task is misaddressed

- **Id:** `F-S11-1`
- **Finding:** Three tracker ids are used for two sub-tasks across already-merged chapters, in three mutually exclusive ways. **SUB-11 is cited as `NEU-1003`** at `04_the-stdio-identity-gate-and-the-bound-context-token.md:735`, `91_findings-register.md:258`, `:276`, `:285`, and `93_open-items-and-provisional-register.md:350`, `:361`. **SUB-11 is cited as `NEU-1005`** at `91_findings-register.md:109` (`F-S3-3`, the entry that co-names this sub-task by id), `:356`, and `93_open-items-and-provisional-register.md:289`. **SUB-12 is cited as `NEU-1004`** at `91_findings-register.md:334`, `:345`, `:356`, `:367`, `:425`, `:437`, `:448`, `:459`; `93_open-items-and-provisional-register.md:161`, `:289`, `:408`, `:450`; `16_attribution-and-detection.md:449`, `:450`; `decision-records/DR-C11-S16-3_the-stalled-propagation-signal-contract.md:158`; `96_spike-register.md:507`. **SUB-12 is also cited as `NEU-1005`** at `05_the-enforcement-point-that-confines-every-read-and-write.md:717`, `91_findings-register.md:518`, `:545`, `:590`, and `92_risk-register.md:463`.
- **Evidence:** The **tracker is authoritative and was read directly at this cutoff**, which settles it rather than adjudicating between chapters: `NEU-1003` = *"Prove a data right propagates to every copy, including the ones this package itself created"* = **SUB-9**; `NEU-1004` = *"Contract what existing MCP clients are guaranteed, over a surface re-counted at this cutoff"* = **SUB-11**; `NEU-1005` = *"Threat-model every path and turn each critical gap into a measurable gate with an owner"* = **SUB-12**. This reproduces the decomposition's own publication table (`_local/C011__resolve-safe-production-integration-and-learner-isolation/02_subtasks.md:209`–`:211`, gitignored — which is why the published package is the only place a reader can meet the correction; the path is written in full because the `…` shorthand is discarded by `scripts/citation-paths/checker.ts:121` before it is ever counted, so a reference written that way is exempted rather than checked). **Correct usages therefore are:** SUB-9 = `NEU-1003` (cited consistently and correctly everywhere), SUB-11 = `NEU-1004`, SUB-12 = `NEU-1005`. The chapter-05 usage is right; the `NEU-1004`-for-SUB-12 usage is wrong; both `NEU-1003` and `NEU-1005` for SUB-11 are wrong.
- **Consequence:** Two live effects, and the second is the one that costs something. **First**, every hand-forward this sub-task was supposed to receive is addressed to a tracker id that belongs to another sub-task — including `F-S4-4`'s unpriced cost (`:276`) and `F-S4-5`'s changed-meaning obligation (`:285`), both of which are load-bearing for OUT-16 and both of which this chapter nonetheless discharges, because the routing that matters is by `SUB-<n>` and that is unambiguous throughout. **Second**, `SUB-14` aggregates these registers by id and `SUB-17` audits them for cross-register consistency; an aggregator that trusts the parenthetical ids will attribute this chapter's inbound items to SUB-9 or SUB-12 and SUB-12's to SUB-11. The failure is silent — every citation resolves to a real, live tracker issue, so nothing is broken enough to notice.
- **What is assumed rather than derived:** Nothing. Every occurrence was enumerated by grep over the published package at this cutoff, and the resolution comes from the tracker rather than from any chapter's claim about it. **Not asserted:** that any author erred rather than the ids having moved — the sub-tasks were published in one batch and the drift is consistent with a block being read at different moments, which is not decidable from here.
- **Handed to:** **SUB-14 (`NEU-1007`)** under OUT-20, which owns register assembly and is the only party permitted to touch another sub-task's entries — **nothing is corrected in place here**, exactly as `F-S4-2`, `F-S5-3` and `F-S4-6` each declined to edit a sibling's text; and **SUB-17 (`NEU-1008`)**, whose consistency audit would otherwise have to adjudicate three readings without an authority to adjudicate against. **No finding is routed against SUB-3, SUB-4, SUB-8, SUB-16 or SUB-5.**

#### `F-S11-2` — The core tool surface already carries a course-specific concept, so the non-DP-specific limb of C005 `:61` is breached before this package changes anything

- **Id:** `F-S11-2`
- **Finding:** `GradingPayloadShape` (`src/domain/types/teaching.ts:275`–`:287`) declares four **required** boolean criterion keys — `correct_recurrence`, `correct_base_case`, `correct_iteration_order`, `complexity_stated` — and its own `.describe()`, a two-line concatenation at `:285`–`:286`, names them *"Per-criterion booleans for the **DP** grading rubric. Each is true only if the learner's answer demonstrably satisfies that criterion. All four are required."* These are dynamic-programming concepts, and the DP course is the first-party application, not the core. The shape reaches **3 of the 46 registered tools**: `submit_answer` (`src/server/teaching-tools.ts:111`) through `SubmitAnswerInputShape`'s `grading:` at `src/domain/types/teaching.ts:330`; `revise_grade` (`src/server/teaching-tools.ts:198`) through `ReviseGradeInputShape`'s `grading:` at `:472`; and `teach_next` (`src/server/teaching-tools.ts:19`), which spells the four keys out in the `nextStep` guidance of its **response** payload at `:62` and `:88`. **The same four keys also reach the prompt surface** — `formatQualityRubric()` (`src/shared/prompts/prompt-pack.ts:837`, `:855`, `:857`) is spliced into seven prompt builders (`:247`, `:281`, `:319`, `:687`, `:731`, `:774`, `:818`) — so the breach ranges over the 49 registered entry points `F-S11-3` establishes, not only the 46 tools. That is a distinct instance rather than a second record of the same one: the shape constrains what a client may **send**, the rubric text shapes what the server **tells** a client to send, and removing either leaves the other.
- **Evidence:** All locations read directly at cutoff `35f92ba`, 2026-08-25. The constraint breached is the core-change clause the charter cites as **C005 charter `:61`** — *core changes must be reusable, backward-compatible, **non-DP-specific** and fail safely* — which this sub-task's own § Constraints carries and which OUT-16's DP-specificity review exists to check. **That citation resolves to no file in this repository** and is registered as `OI-S11-3`; the finding does not depend on it, because the observation about `src/` holds under any phrasing of a non-DP-specificity rule, but the *standard* is inherited on the charter's authority rather than read.
- **Consequence:** A self-hoster teaching any other subject cannot supply a meaningful `correct_recurrence`, and cannot omit it: all four are `z.boolean()` and required, so a Zod failure is the only alternative to inventing a value. A compatibility contract that promised a reusable, non-DP-specific core over this surface would be **false**, which is why the review reports it rather than returning the clean verdict its own scope would have permitted. **The verdict on this package's changes is separately clean** — `CH-1` … `CH-7` introduce zero course-specific concepts — and the two results are stated separately so neither is read as the other.
- **What is assumed rather than derived:** Nothing about the code. **Not asserted:** that this is an isolation or privacy defect — it is neither. It is a **reusability** defect. **Not asserted:** that it should be fixed by any particular party or in any particular way; the remedy is a `src/` change, which this sub-task may not make by constraint, and naming the remedy would be deciding it.
- **Handed to:** **`NEU-896`** at convergence, as a core-reusability breach that no charter in flight owns and that outlives this package; **SUB-14 (`NEU-1007`)** for aggregation. **No amendment is routed to `NEU-895`** — this is not a C010 decision and contradicts none; `DR-C10-S8-1`'s `R8-4` rule is the standard it fails, not a record it disputes.

#### `F-S11-3` — The gate's method predicate covers `tools/call` only, so the registered MCP surface is 49 entry points and the prompt surface is outside the gate on both transports

- **Id:** `F-S11-3`
- **Finding:** `createMcpServer` registers **three prompts** alongside the 46 tools — `scaffolding` (`src/transport/create-server.ts:25`), `chunk_generation` (`:45`), `chunk_management` (`:80`) — so the registered MCP entry-point surface is **49: 46 tools plus 3 prompts**. The context-token middleware's first predicate is `body?.method !== 'tools/call'` (`src/transport/context-token-middleware.ts:51`), so `prompts/list`, `prompts/get`, `tools/list` and the initialize handshake pass it untouched. On HTTP the JWT middleware is mounted for all methods at `/mcp` (`src/transport/http.ts:164`) and is the real outer boundary; on STDIO there is no boundary at all.
- **Evidence:** All five locations read at cutoff `35f92ba`. The three prompt handlers each call `promptPack.getPrompt(...)` on caller-supplied arguments alone (`src/transport/create-server.ts:32`–`:42`, `:56`–`:77`, `:94`–`:118`); none receives `ctx`, none reaches a port, and none can return learner content.
- **Consequence:** **This is a counting completeness finding, not an exposure finding, and the distinction is stated so it is not over-read.** The prompt surface carries no learner data, so nothing leaks. What it does is make *"the tool surface"* an incomplete description of what an MCP client can reach, and a compatibility contract written over the incomplete description would silently omit three entry points. The figure is published **separately** — 46 tools plus 3 prompts, never 49 tools — precisely because folding it into the settled 46 / 43 / 3 would reproduce the propagation defect OUT-16 exists to prevent. It also sharpens what *"43 gated"* means: 43 of 46 **tools**, within the `tools/call` method only, on HTTP only (`F-S16-3`), and fail-open under internal error (`F-S16-3`).
- **What is assumed rather than derived:** Nothing. **Not asserted:** that the prompts should be gated. Gating a prompt that reads no learner state would add a token requirement with no confinement benefit, and deciding it is not this chapter's.
- **Handed to:** **SUB-12 (`NEU-1005`)** under OUT-17, for which an ungated method predicate on both transports is a threat-model path even where today's handlers are inert; and **SUB-14 (`NEU-1007`)** for aggregation.

#### `F-S11-4` — An unpaid gate extraction does not preserve SUB-4's seven paths; it silently re-classifies three of them, and leaves STDIO refused at the adapter with no gate to explain why

- **Id:** `F-S11-4`
- **Finding:** SUB-4's seven-path table classifies each path *under the assumption that the gate reaches STDIO*. `F-S4-4` establishes that reaching STDIO is a **rewrite** and leaves its cost unpriced. Pricing it (`11_the-client-compatibility-contract.md` §6) produces three delivery tiers, and under the tier where the extraction is cut entirely (**Tier N**) paths 2, 3 and 4 read **unaffected** — the same word path 1 carries. That reading is wrong in a specific and dangerous way. `CH-5` … `CH-7` land regardless, because the enforcement point is the **adapter**, below both transports and unconditional on any middleware being mounted (`F-S5-12`). A STDIO caller under Tier N therefore supplies no principal, resolves to kind `none`, and is **refused by `DR-C11-S5-1` clause 3** — with no transport gate present to name the reason.
- **Evidence:** `04_the-stdio-identity-gate-and-the-bound-context-token.md:413`–`:421` (the seven paths); `91_findings-register.md:269`–`:276` (`F-S4-4`); `decision-records/DR-C11-S5-1_the-enforcement-point.md` clause 3; `F-S5-12`; `src/transport/main.ts:55`–`:59` and `src/config/resolve-transport-config.ts:35` (STDIO is the default limb and the default mode). Tiers and per-path re-classification tabulated at `11_the-client-compatibility-contract.md` §6.3.
- **Consequence:** Three. **First**, the word *unaffected* in a cut-extraction reading means *unaffected by the gate*, not *unaffected in outcome* — and the largest class (path 4, everything launched with `TRANSPORT` unset) is the one it misdescribes. **Second**, Tier N is not the safe default it resembles: it produces a refusal with no explanation, which is operationally worse than either a working gate or a stated absence. **Third**, the gap between full extraction and gate-only is exactly **reconstructability** — both refuse identically, so `I4` passes under either, which is precisely why `R-S4-4` warns the audit limb is the piece most likely to be cut and why a green `I4` may not be cited as the argument for cutting it.
- **What is assumed rather than derived:** That `CH-5` … `CH-7` would in fact ship while `CH-1` was cut. That is a **rollout shape, not a fact** — it is the natural de-risking move `F-S5-12` already identifies as available and mistaken, and it is the branch this finding prices. The complementary branch (nothing ships) needs no finding. **No effort estimate is asserted** for the extraction; §6 prices what the cost is a cost of and which fork sizes it, not how large it is.
- **Handed to:** **`SUB-10 of C010 (NEU-984)`**, co-named **`NEU-896`**, as `CC-S8-3`'s owner and the party the extraction belongs to; **SUB-7 (`NEU-1001`)** under OUT-3, whose stage sequence determines which tier actually ships; and **SUB-12 (`NEU-1005`)** under OUT-17, for which *"refused with no gate to explain why"* is a path the matrix should carry.

#### `F-S11-5` — `CAP-S1-3` does not exist, so the `qa-execution:engine` no-op is carried by no cap-register entry while four records decline to file one on its authority

- **Id:** `F-S11-5`
- **Finding:** Four places in the published package rest the `qa-execution:engine` no-op on **`CAP-S1-3`**, in three different ways: `94_caps-and-incomplete-scope.md:197` **declines to file** a per-sub-task cap on its authority; `97_package-completeness-gate.md:232` (`G-S5-20`) answers a completeness-gate row **not applicable** by pointing at it; and `05_the-enforcement-point-that-confines-every-read-and-write.md:1408` and `traceability/S5_the-enforcement-point.md:67` **state plainly that it applies**. Only the first is literally a declined filing, and the distinction matters because it is the one that leaves a cap unwritten. **`CAP-S1-3` is not filed in `94_caps-and-incomplete-scope.md`.** The register's complete set of C011-owned cap ids at this cutoff is `CAP-S1-1`, `CAP-S1-2`, `CAP-S3-1`, `CAP-S15-1`, `CAP-S2-1`, `CAP-S4-1`, `CAP-S16-1`, `CAP-S8-1` — eight, plus C010's `CAP-S5-1` recorded-not-filed, plus this sub-task's `CAP-S11-1`. SUB-1 filed two caps, not three.
- **Evidence:** Every `CAP-` id in the register enumerated directly by its `- **Id:**` line at cutoff `35f92ba`; the four citing locations read at the same cutoff. The no-op itself **is** stated at package level — `README.md` § *"Verification note — `qa-execution:engine` is unconfigured"* — but as prose in the README, not as an entry in the cap register.
- **Consequence:** The fact is true and undisputed: the registry resolves to `git, linear`, no capability owns `qa-execution`, the QA phase is a genuine Core Article 8 no-op, and **no sub-task in this package claims a QA pass**. Nothing is mis-stated about QA. What is defective is the **routing**. A declined filing is only sound if the record it defers to exists, and four records decline on the authority of one that does not — so the condition they defer about has **no entry in the register that OUT-20's band-completeness check ranges over**. That check requires every cap the package raised to appear in exactly one of the eight registers; this one appears in none, while being cited as though it appeared in the cap register four times. `G-S5-20`'s evidence cell is the sharpest case: a completeness-gate row is answered *not applicable* by pointing at a record that is not there.
- **What is assumed rather than derived:** Nothing about the register. **Not asserted:** that a `CAP-S1-3` *should* be filed, or by whom. SUB-1's section is closed and no sub-task edits another's entries; whether the remedy is a late cap, a README cross-reference the band check recognises, or an explicit assembly-level record is **SUB-14's** call, and naming one would be taking it. **Not asserted** that SUB-5 erred rather than SUB-1 having filed and later removed a third cap — `docs/research/` is versioned, so this is checkable, but it is checkable by the party that owns assembly and is not decidable from the tree as it stands.
- **Handed to:** **SUB-14 (`NEU-1007`)** under OUT-20, which owns register assembly and is the only party permitted to touch another sub-task's entries — **nothing is corrected in place here**, on the same rule `F-S4-2`, `F-S5-3` and `F-S4-6` each followed; and **SUB-17 (`NEU-1008`)**, whose band-completeness audit would otherwise meet a dangling id rather than a declared one. **No finding is routed against SUB-1 or SUB-5.** This sub-task **also declines** to file a duplicate cap (`94_caps-and-incomplete-scope.md` § SUB-11), because minting a per-sub-task record would resolve an assembly-level gap in exactly the wrong direction.

---

**SUB-11 register totals at revision 1:** five findings, `F-S11-1` … `F-S11-5`. **Zero blocking
findings.** `F-S11-2` is the closest — it names a live breach of a charter constraint in shipped
code — but it is **pre-existing, out of this sub-task's scope to repair by constraint, and carries a
named escalation route**, so it does not meet a blocking trigger. `F-S11-1`, `F-S11-3` and `F-S11-5`
are package-hygiene and counting-completeness defects found while re-deriving the surface; `F-S11-4`
is a consequence of this outcome's own pricing work. Every entry carries an owner.

**Three of the five are register-integrity defects, and that is worth stating rather than
smoothing.** `F-S11-1` (three tracker ids for two sub-tasks), `F-S11-3` (a counted surface that
omits three entry points) and `F-S11-5` (four citations to a cap that does not exist) were each
found by re-deriving something the package had already asserted, rather than by reading what it
asserted. That is the method `F-S8-1` prescribes after C010's own verification procedure returned a
wrong number when honestly executed, and it is the reason this chapter publishes its derivations as
re-runnable commands instead of as results.

**No contradiction with C010 was found by SUB-11, and no amendment is routed to `NEU-895`.** Six
C010 items were checked one by one at `11_the-client-compatibility-contract.md` §11 and the check
returned empty. The two candidates that might have routed one did not: the re-count **agrees** with
`F-S5-3` at the 41 / 1 / 1 granularity, so `R11`'s escalation condition did not arise; and
`F-S11-2`'s DP-rubric breach is measured against `DR-C10-S8-1`'s `R8-4` **rule** rather than
disputing any C010 record, so it routes to `NEU-896` and not to `NEU-895`. §6's pricing is an
**addition** to `CC-S8-3`, exactly as `F-S4-4` established, not a contradiction of it. The checks
are recorded so SUB-17's audit can see that they ran and what they returned.

**One id-namespace note, stated once.** `F-S5-3` and `F-S8-1` cited in this section are **C010's**.
This package has its own `F-S5-*` (SUB-5's, thirteen entries) and its own `F-S8-*` (SUB-8's), and
C010 also has a sub-task 8 — so any `S<n>`-scoped id may collide across the two packages. Per
`README.md` § Id conventions, a C010 record is always cited qualified and a bare id is always this
charter's own. `F-S2-2` records the same hazard for `OI-S1-2`.

---

### SUB-9

#### `F-S9-1` — Learner content egresses to two external providers, and the resulting copy rests outside every copy class the propagation matrix defines

- **Id:** `F-S9-1`
- **Finding:** Chunk text and classifier prompts over learner content are sent to external providers on two outbound call sites. The copy that results rests **in a third party's systems** — outside all six copy classes, outside every port, and outside any mechanism this package can bind. No propagation action, no completion deadline and no auditable proof can be written for it, because nothing in this deployment can reach it. This is the one copy location the unowned-copy audit surfaced that no class claims.
- **Evidence:** `src/adapters/langchain/embedding-adapter.ts:89` (`new OpenAIEmbeddings({`); `src/adapters/langchain/content-classifier-adapter.ts:199` (`new ChatOpenAI({`), invoked at `:145`. Enumerated as write channel `W-3` in `09_proving-a-data-right-reaches-every-copy.md` §4.2, whose grep over `src/` returned exactly three outbound call sites, the third (`src/transport/jwt-middleware.ts:15`, the IdP discovery request) carrying no learner content. SUB-5 named the confinement half at `05_the-enforcement-point-that-confines-every-read-and-write.md:549`–`:562`.
- **Consequence:** OUT-12's *"no unowned copy"* claim is **true only over copies this deployment creates**, and false as an unqualified statement. An erasure that clears all six classes leaves the egressed copy untouched, and the learner cannot be shown a proof for it because no proof can be emitted. Every completeness claim in `09_…md` §7 and §8 is bounded by this finding explicitly rather than silently.
- **What is assumed rather than derived:** That the two adapters are actually reachable in the production configuration — the enumeration is static over `src/` at cutoff `ee0a750` and no production observation exists. Which provider actually receives the content, and on what retention terms, is **not** established: `SPK-S8-1` asks the first question and is unexecuted, and `SPK-S9-1` asks what the terms are. Neither is assumed here.
- **Handed to:** **`NEU-896`** at convergence, as a cross-package data-lifecycle exposure that outlives this package and that no single package can close — a third party's retention terms are not this repository's to set. **`NEU-986`** is *not* the route: this is not a log-table retention gap. **SUB-12** (NEU-1004) under OUT-17, which must model the egress path as a threat rather than exempt it. **SUB-14** (NEU-1007) for aggregation.

#### `F-S9-2` — The package's designed-spike total is twenty-two at this cutoff, and a heading-level inconsistency makes a naive count return twenty

- **Id:** `F-S9-2`
- **Finding:** Two counting methods disagree on this register's size, and the gap grows with every entry added at the wrong heading level. Counting **distinct `SPK-` ids** and counting **`####`-level entry headings** — the method SUB-5 used to reconcile the figure to twenty at cutoff `cc38cc9` — differ by exactly the number of entries written at `##` level. A later sub-task re-running the heading-count method silently undercounts.
- **Evidence:** Three entries are written at `##` rather than `####`: `96_spike-register.md:447` (`## \`SPK-S16-1\``), `:491` (`## \`SPK-S8-1\``), and SUB-11's `SPK-S11-1`. Counts taken mechanically:

  | Point | Distinct `SPK-` ids | `####` headings | `##` headings |
  | --- | --- | --- | --- |
  | Cutoff `ee0a750` (this chapter's cutoff, before this sub-task's own entry) | **22** | 20 | 2 |
  | This branch at HEAD, after merging `origin/develop` @ `7450bfb` and adding `SPK-S9-1` | **24** | 21 | 3 |

  The 22 decomposes as SUB-1 nine, SUB-2 three, SUB-4 two, SUB-15 four, SUB-16 one, SUB-8 one, SUB-6 two; SUB-6 independently reached the same figure by arithmetic rather than by counting headings, at `96_spike-register.md:673`–`:679`. The 24 adds SUB-11's `SPK-S11-1` (merged from `develop`) and this sub-task's `SPK-S9-1`. **The heading-level divergence is recorded nowhere in the register.** The one divergence it does note, at `:693`–`:697`, concerns *content ownership* — that the front matter names SUB-1 as owning every entry while five sub-tasks have appended their own — and is a different fact entirely.
- **Consequence:** The running correction chain is eighteen → nineteen → twenty → twenty-two → twenty-four, and each step was a real correction rather than drift. This finding records **why** the two methods disagree, so the next sub-task to state a total does not rediscover it — and records that the gap is **not fixed at two**: it is the count of `##`-level entries, which grew from two to three while this sub-task was in flight. A figure is only correct at a named cutoff, the convention SUB-4 recorded and SUB-5 and SUB-6 each restated.
- **What is assumed rather than derived:** Nothing. Every figure above was counted mechanically over the file at the stated point. **The two cutoffs are given separately rather than collapsed**, because this sub-task's chapter is written against `ee0a750` while its branch contains the later merge, and reporting one number for both would be the drift this finding is about.
- **Handed to:** **SUB-14** (NEU-1007) under OUT-20, which owns register reconciliation and is the only party that may normalise a heading level in a merged file. **No predecessor's text is edited here** — this register is append-only, and repairing the two headings in place would mean rewriting SUB-16's and SUB-8's sections.

#### `F-S9-3` — C010 and C011 each define a different `CAP-S4-1`, and the charter's shorthand for the C010 one resolves to a different register in C011

- **Id:** `F-S9-3`
- **Finding:** `CAP-S4-1` denotes two unrelated caps. In **C011** it is SUB-4's — that the STDIO mechanism is designed and never exercised (`94_caps-and-incomplete-scope.md:115`). In **C010** it is the log-table deletion-owner cap, owned by `NEU-986` (`../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md:165`). OUT-12 requires a disposition for the C010 one; writing it bare would route the disposition to SUB-4's cap and to the wrong owner. Compounding it, the charter cites the C010 cap register as `91_…md:283` — a shorthand that in C011's own band resolves to the **findings** register, since C010 numbers caps `91_` and C011 numbers findings `91_`.
- **Evidence:** `94_caps-and-incomplete-scope.md:115` (C011's `CAP-S4-1`); `../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md:165` (C010's), `:148` (`CAP-S3-3`), `:277`–`:284` (`CAP-S7-1`, whose `Owner:` line at `:283` names `NEU-893`), `:499`–`:500` (both owners). `README.md:61`–`:64` records that C011's band differs from C010's — *"the outcome and findings registers sat at `01_`/`02_`"* — which establishes that the two packages number differently; **the specific consequence that `91_` means caps in C010 and findings in C011 is derived here, not quoted from there**, and is checkable against `README.md:52`–`:59`'s own band table.
- **Consequence:** This is a second instance of the collision class `F-S2-2` records for `OI-S1-2`, and it is sharper, because the two `CAP-S4-1`s have **different owners** — misrouting is not merely ambiguous, it hands a deliverable to a party that does not hold the cap. Every C010 cap reference in `09_…md` §10 is therefore written fully qualified with its path and line, and the package rule is restated there: a bare `-S4-` id in this package is C011's own.
- **What is assumed rather than derived:** Nothing. Both entries were read directly at this cutoff.
- **Handed to:** **SUB-14** (NEU-1007) under OUT-20, for the cross-register consistency check, which must treat `CAP-S4-1` as two ids rather than one. **SUB-17** (NEU-1008) at the gate. **`NEU-895`** (C010) is **not** routed anything: this is a naming collision between two packages' independent id spaces, not a contradiction of a C010 decision, and an addition is not a contradiction.

#### `F-S9-4` — Three of the six copy classes have no mechanism the deployment can execute, so half the matrix propagates by instruction, citation or hand

- **Id:** `F-S9-4`
- **Finding:** Only three of the six classes are reachable by a statement this deployment can issue. **C2** (web-owned, browser-side) is on the learner's own device and the server cannot reach it — propagation is an *instruction* the client may or may not honour. **C3** (backups) has no established contents, location or restore path, so no statement can be written at all. **C6** (the package's own captures) lives at `_local/scratch/`, behind no port and reached by no SQL statement, so propagation is a *manual operator action*. Only C1, C4 and C5 are propagated to by a query.
- **Evidence:** C2 — `DR-C10-S6-1` (`M-A`): the web tier holds no write authority and no database credential, so there is no server-side copy to act on, and the device copy is outside the deployment. C3 — `93_open-items-and-provisional-register.md:117`–`:126`. C6 — `05_the-enforcement-point-that-confines-every-read-and-write.md:564`–`:582`, which records that the class is outside the database, "reached by no port and by no SQL statement", and `03_learner-data-inventory-and-classification.md:451` for the quarantine path.
- **Consequence:** A completion proof for C2 and C6 attests to an *action taken*, not to a *state reached* — the deployment can prove it issued the instruction or that the operator ran the deletion, and cannot prove the bytes are gone. `DR-C11-S9-3`'s fifth negative clause (nothing emitted before the action is durable) is satisfiable for these classes only in the weaker sense, and the matrix says so rather than implying parity across the six. This bounds what `SIG-S16-3` can detect: it detects a **missing proof**, never an **unhonoured instruction**.
- **What is assumed rather than derived:** That no future server-side web-owned state is introduced — a grant `NEU-896` converges, explicitly not pre-empted here. C6's non-reachability is derived from SUB-5's recorded observation, not re-derived.
- **Handed to:** **SUB-12** (NEU-1004) under OUT-17, whose threat model must treat an unhonoured client instruction and an unperformed manual deletion as distinct failure modes from a missing proof. **SUB-14** (NEU-1007) for aggregation.

#### `F-S9-5` — Learner free text is written to stderr by the shared pino sink, so an erasure that correctly clears both log tables leaves the same content in the container's logs

- **Id:** `F-S9-5`
- **Finding:** The pino logger writes to **file descriptor 2** in MCP mode, and its redact configuration is **shared across every sink** — the file states it "censors credential/secret fields to `[REDACTED]` at serialization time across every pino sink (**stderr** + both DB transports)". The redaction is **credentials-only**, and the same file records that "**Learner `response` text is intentionally NOT redacted** — it is useful diagnostic data". Therefore **every learner payload that reaches `infrastructure.operation_event_log` or `infrastructure.mcp_request_log` through a pino transport also reaches stderr**, which in this deployment is captured by the container runtime and written to the host. The copy rests outside the database, outside every port, and outside all six copy classes.
- **Evidence:** `src/shared/logger.ts:65` (`pino.destination(2)`); `:25`–`:26` (the sink-scope statement); `:39`–`:54` (the fourteen credentials-only redact paths); `:35`–`:36` (learner `response` deliberately not redacted). Enumerated as write channel `W-8` in `09_proving-a-data-right-reaches-every-copy.md` §4.2 and §4.5. Consistent with charter assumption 19 and with `F-S3-1`, neither of which reaches the **stderr** sink — both are about what the two tables persist.
- **Consequence:** **This is the sharpest instance of `R2` in the package**, and it is created by a path no outcome had examined. The entire mechanism of `09_…md` §6 and §7 — the per-learner delete, the bulk disposal of the pre-cutover population, the retention windows handed to `CAP-S3-3` / `CAP-S4-1` (both C010) — operates on the two tables and **does nothing whatever to the log-file copy**. An operator who executes every action in the matrix correctly, and can prove it, has still not erased the learner's free text. It also bounds `F-S9-4`: a completion proof for C4 or C5 attests to rows removed from a table, never to bytes removed from a log file.
- **What is assumed rather than derived:** That the deployment's container runtime persists stderr, and for how long. **Neither is established** — the log driver, its rotation and its retention are a deployment arrangement outside this repository, in the same class of unknown as `OI-S1-9`'s hosting and log-shipping facts, and **no claim is made about them here**. What *is* derived, from the code alone, is that the learner content reaches the stream. Whether anything downstream keeps it is the open half.
- **Handed to:** **`NEU-896`** at convergence, as a data-lifecycle exposure whose remedy is a deployment change (a log driver with a bounded retention, or redacting `response` at the sink) rather than a schema or code change this package scopes. **The creator, as sole maintainer and sole operator**, as the only party who can inspect or change the log driver. **SUB-12** (NEU-1004) under OUT-17, whose threat model must carry a learner-content sink that no erasure path reaches. **SUB-14** (NEU-1007) for aggregation. **`NEU-986` is deliberately not the route** — this is not a log-*table* retention gap, and routing it to `CAP-S3-3`/`CAP-S4-1`'s owner would hand it to a party whose caps do not cover it.

#### `F-S9-6` — SUB-8's merged 30-day window for `operation_event_log` is five days below the 5-week floor the Tier-2 gate's own query fixes

- **Id:** `F-S9-6`
- **Finding:** Two merged positions conflict, and neither is wrong on its own terms. **SUB-8** set `operation_event_log`'s retention window at **30 days**, audited it against the four-field rule and recorded it as passing (`08_consent-and-what-a-learner-can-export-and-erase.md:491`). **The Tier-2 blocking gate reads a rolling 5-week (35-day) window** of that same table (`src/adapters/drizzle/tier2-blocking-stats-repository.ts:41`). A retention policy that deletes at 30 days therefore **removes rows the gate still reads**, permanently truncating its last five days of input rather than transiently as `F-S6-3` describes for the archive. The gate is a live blocking-eligibility control (`src/orchestration/tier2-circuit-breaker.ts`), so the effect is on running behaviour, not only on reporting.
- **Evidence:** `08_…md:491` (SUB-8's window, *"30 days, the same window as `LD-S3-16`, set here as a position"*, and its own note that **no mechanism implements it**); `src/adapters/drizzle/tier2-blocking-stats-repository.ts:41` (`AND "timestamp" >= NOW() - INTERVAL '5 weeks'`), `:39`–`:40` for the table and event filter. SUB-8's exception #5 **cites `:39` itself**, so the table's role as a gate input was known; the arithmetic against the window was not performed.
- **Consequence:** The retention-and-deletion mechanism this sub-task hands to `CAP-S3-3` / `CAP-S4-1`'s owner (`09_…md` §6.6) **cannot implement SUB-8's window as written** without degrading a running gate. Implementing it needs one of: widen the window to ≥ 35 days; narrow the deletion to exclude `event = 'classifier.tier2_blocked'` rows; or accept the truncation with a stated reason. **This sub-task does not choose** — the window is SUB-8's under OUT-11 and the gate is C010's territory, and picking a number here would be the silent override this finding exists to prevent. Note the exposure is currently latent: SUB-8 records that **no mechanism implements the window at all**, so nothing deletes from this table today.
- **What is assumed rather than derived:** Nothing. Both figures were read at this cutoff. **Not assumed: that the gate matters enough to widen the window for** — that is a product judgement for the owner, not a fact this chapter can settle.
- **Handed to:** **`NEU-986`** (`SUB-12 of C010`), co-named **`NEU-896`**, as owner of `CAP-S3-3` and `CAP-S4-1` — the caps whose mechanism this conflict blocks. **SUB-8** (NEU-1002) is named as the window's author so the conflict is visible to whoever revisits OUT-11, but **no revision of SUB-8's entry is requested and none is owed**: its audit was correct against the four fields it tested, and this is a fifth consideration outside them. **SUB-14** (NEU-1007) for cross-register consistency; **SUB-17** (NEU-1008) at the gate.

---

**SUB-9 register totals at revision 1:** **six findings**, `F-S9-1` … `F-S9-6`, none blocking.
`F-S9-1` and `F-S9-5`, together with the STDIO-host location carried in `F-S9-4`, are the findings
OUT-12 requires — the **three** copy locations the unowned-copy audit surfaced that no class claims —
and each carries a named owner and an escalation route.

**`F-S9-5` was found by re-attacking an enumeration that had already returned green**, and that is
recorded rather than smoothed over. The first draft of `DR-C11-S9-2` asserted seven write channels
and the sentence *"there is no eighth channel"*, backed by four greps that all passed. The greps
searched for filesystem-API call names, and a logger writing to a file descriptor calls none of
them — so a channel carrying unredacted learner free text sat outside a check that reported clean.
The lesson is registered with the finding because it is the package's most concrete instance of the
failure class its own reviews keep naming: **a green mechanical check is evidence about the check,
not about the claim.**

**One inherited blocking finding is dispositioned rather than re-raised.** `F-S8-2` is downgraded
from **blocking** to **resolved** on its own stated resolving event at `:436` — *"SUB-9 publishes a
disposition for the pre-cutover population"* — which `DR-C11-S9-1` does, selecting bulk deletion.
**SUB-8's entry is not edited**: this register is append-only and no sub-task rewrites another's, so
the downgrade is recorded here and routed to **SUB-14** (NEU-1007) to reflect at assembly. What is
discharged is the **design obligation**, not the rows; the execution is `R-S9-1`.

**One finding was checked for and deliberately not filed.** OUT-12 requires that a copy class for
which no propagation action, deadline or owner can be named be reported as a finding. **C3
(backups) was tested against that trigger and does not meet it:** its cells carry a named owner and
a resolving event, both carried across from `OI-S1-8` (`93_…md:123`–`:125`), which is precisely the
state OUT-12 permits — the prohibition is on a cell reading "unknown" *that lacks an owner and a
date*, not on an unresolved cell as such. Filing one anyway would raise **a second register record
of the backups fact**, which this sub-task's scope forbids outright and which would leave SUB-14's
cross-register check reconciling two ids for one question. Recorded as *checked and not filed*, on
the precedent SUB-5 and SUB-6 each set, rather than left as a silent absence.

**No contradiction with C010 was found by SUB-9.** `F-S9-3` records a **naming collision** between
two independent id spaces, which is not a contradiction of a C010 decision and routes no amendment
to `NEU-895`. C010's `CAP-S3-3`, `CAP-S4-1` and `CAP-S7-1` are consumed with their owners exactly as
`NEU-988` left them; `CAP-S7-1` is discharged by supplying the lifting condition its own entry
names, which its entry invites rather than contradicts. The settled **46 / 43 / 3** tool surface is
not restated as a codebase fact anywhere in `09_…md`, and `42` appears nowhere in it.

---

### SUB-12

Seven findings. **Two are blocking** (`F-S12-5`, `F-S12-6`) under OUT-17's rule that a critical gap
without a measurable control is recorded as a blocking finding rather than accepted. The seventh
(`F-S12-7`) is a package-hygiene defect observed in passing and **reported rather than fixed**, on
the precedent SUB-5 set with `F-S5-13`.

#### `F-S12-1` — An unconfined aggregate consumed as a **control input** lets one learner change the controls applied to another

- **Finding.** `DrizzleTier2BlockingStatsRepository` aggregates `infrastructure.operation_event_log`
  with **no principal predicate** (`src/adapters/drizzle/tier2-blocking-stats-repository.ts:39`–`:42`).
  The Tier-2 circuit breaker is **one per process, shared by every learner**
  (`src/orchestration/tier2-circuit-breaker.ts:59`), trips a verdict field when that cross-learner
  count exceeds `mean + 2σ` of prior weeks (`:124`–`:128`), holds the trip **one-shot until restart**
  (`:65`–`:68`, `:148`–`:151`), and **removes the tripped field from the blocking set for every
  subsequent caller** (`:182`–`:187`). So a learner who accumulates rejections on a field can durably
  disable that content-quality control **for every other learner in the process**, with no access to
  their data of any kind.
- **Why it is not `F-S5-9`.** `F-S5-9` is a **disclosure** finding — an unconfined `COUNT` discloses a
  true fact while returning no rows. This is **actuation**: the aggregate is returned to nobody, and
  what changes is the system's behaviour toward a third party. It carries **no row and creates no
  copy**, so it is invisible to `I3`, to SUB-9's six copy classes, and to `SIG-S16-1`. Critically,
  **`F-S5-9`'s route does not close it** — port 9 is routed to C010's `CAP-S3-3` / `CAP-S4-1`, which
  are *retention and deletion* caps, and a retention bound on the table does nothing about a breaker
  reading it.
- **Severity: high, not critical**, and bounded honestly. The harm weakens a quality control rather
  than exposing data; the window is bounded by restart cadence (≥3.29/day, `C-17`), **which is a
  dependency on an accident rather than a control**; and the volume required is unknown — no number
  is offered, because the arrival rate is unobserved and `OI-S15-3` is SUB-15's distinct `t_db`
  question and is not claimed to answer this one.
- **Owner.** **`NEU-896`** at convergence — the breaker is a product-behaviour decision, not a
  confinement mechanism this package may redesign. Co-named **SUB-13** (NEU-1006) if the resolution
  is schema-shaped.
- **Control.** `GATE-S12-10`. **Resolving event.** The breaker's input is confined to the acting
  principal, or the breaker becomes per-learner, or the shrinkable field set is fixed by
  configuration rather than by a learner-influenced statistic.
- **Routed.** As an **amendment to `DR-C10-S5-1`** under that record's trigger 3, since the five
  ordered checks return `holds` on this category while the failure is real. See
  `decision-records/DR-C11-S12-2_the-unconfined-aggregate-as-a-control-input.md`.

#### `F-S12-2` — The fail-open session binding composed with a map that empties on every restart admits every pre-existing session unverified

- **Finding.** `verifySessionBinding` returns `true` when no binding is found
  (`src/transport/http.ts:57`–`:58`), and the binding map's **only** eviction path is a clean session
  close (`F-S15-3`), so every restart empties it. The deployment restarts **≥3.29 times per day** over
  the most recent 7 days (`C-17`). **After each deploy, every pre-existing session is therefore
  admitted with its binding unverified** — not as an edge case but as the steady state for the
  remaining lifetime of those sessions.
- **Why it is new.** Neither half is new; the **composition** is. `F-S15-3` owns the eviction and `R1`
  owns the fail-open, and each predecessor correctly stayed inside its own remit. The compound
  behaviour appears only when the two are read against the measured restart cadence.
- **Severity:** high. **Owner:** **SUB-7** (NEU-1001) under OUT-3. **Control:** `GATE-S12-6`.
- **Resolving event.** `verifySessionBinding` refuses an unknown session instead of returning `true`.

#### `F-S12-3` — The search **query** is a fourth learner-content egress, distinct from the corpus

- **Finding.** A learner's raw search text is embedded before any row is read
  (`src/orchestration/search-workflows.ts:48`, `:85` reach `EmbeddingPort`), so it leaves the
  deployment on the same three provider paths the corpus does. SUB-9's `W-3` enumerated the embedding
  **call sites** and correctly found chunk text; it did not separate the **query** from the corpus.
- **This is an addition, not a contradiction**, and **no revision is routed to SUB-9 and none is
  owed.** The distinction is a lifecycle one: a chunk is stored learner content with a retention
  window, while a query is transient, is never persisted by this deployment, and still egresses. It
  is therefore **not** filed as a new copy class — nothing comes to rest.
- **Severity:** medium. **Owner:** the owner of `OI-S3-1` (the creator, as sole operator); **SUB-8**
  (NEU-1002) under OUT-11 for the lawful-basis position. **Control:** `GATE-S12-8`.

#### `F-S12-4` — The `TRUNCATE … CASCADE` guard tests the caller's environment, not the target database

- **Finding.** `clearAllTables()` truncates ten tables including every learner table
  (`src/infrastructure/db/client.ts:77`–`:79`) — the most destructive statement in the repository, and
  a **raw SQL template via `db.execute`**, invisible to a `.insert(`- or `.delete(`-shaped search. Its
  guard (`:66`–`:73`) is three disjuncts over `NODE_ENV`, `process.argv` and `VITEST` — **all
  properties of the caller's own environment**. It answers *"does this process believe it is a
  test?"*, never *"is this a test database?"*.
- **The target-shaped check exists but does not compose cleanly.** `getDatabaseUrl()` requires a
  `_test` substring **only when `isTestEnv` is already true** (`:17`–`:32`), it runs **only** inside
  `getPool()` and **only** when the pool is not yet memoized (`:38`–`:39`), and the check is a
  substring test. A process that built its pool before `NODE_ENV` was `test` satisfies
  `clearAllTables`'s guard against a pool the `_test` check never saw.
- **What keeps it safe today is a call-graph fact, not an invariant:** the only call sites are
  `tests/helpers/db-setup.ts:62`, `tests/integration/db/client.test.ts:47` and
  `tests/integration/db/migrate.test.ts:40`. That is a real mitigation and is stated as one; it is
  enforced by nothing.
- **Severity:** high. **Owner:** the creator, as sole operator, for the deployment; the implementation
  charter `NEU-896` hands OUT-19 to, for the guard. **Control:** `GATE-S12-16` — which is why this is
  a finding with a gate rather than a blocking finding.

#### `F-S12-5` — **BLOCKING.** A database-side execution path cannot be ruled out by any reading of this repository

- **Finding.** A trigger, a rule, a function-backed view, a foreign data wrapper or a logical
  replication slot created through a direct database session would read and write learner rows
  indefinitely and leave **no artifact in this repository**. The threat enumeration closes over
  ingress (`DR-C11-S12-1`), and this is the one extension shape (`X-3`) that no search over `src/` or
  `drizzle/` at any cutoff can close.
- **Why it is blocking rather than a caveat.** OUT-17 requires a measurable control per critical gap.
  A control requires something to measure, and the only measurement is a query against the production
  database, for which **no credential exists**. This is not a threshold left unset — the control is
  structurally unavailable to this package.
- **It attaches to the enumeration's boundary, not to a path**, and §9.2 keeps those counts separate
  rather than promoting it to a path the model claims to have enumerated.
- **Severity:** high. **Owner:** the creator, as sole maintainer and sole operator, for the
  observation; escalates to **`NEU-896`**, since a second writer to the production database is a
  program-level fact. **Spike:** `SPK-S12-2`, method stated, **not executed**.

#### `F-S12-6` — **BLOCKING.** A propagation instruction to an MCP host has no observable compliance

- **Finding.** Under STDIO the MCP response comes to rest in the peer host's own application state — a
  transcript, a local cache, a log — which C2's browser-side definition excludes by its own words
  (`09_proving-a-data-right-reaches-every-copy.md` §4.6). A propagation action into that class is an
  **instruction**, and the deployment has no channel by which to observe whether it was followed.
- **Why it is blocking.** A threshold over an unobservable population is not a measurement. No
  admissible provenance under `DR-C11-S12-3` produces one.
- **Not re-filed as a copy finding.** SUB-9 carries the location within `F-S9-4`; what is new here is
  only that it is a **gate-less gap** under OUT-17's rule, which is a different statement about the
  same fact.
- **Severity:** medium. **Owner:** **`NEU-896`**, which converges the client surface.

#### `F-S12-7` — The glossary row for `write-path closure` carries the exact claim its own defining file repudiates

- **Finding.** `docs/GLOSSARY.md`'s `write-path closure` row states that *"re-running it costs **four
  greps** and needs no production access"*, and cites
  `09_proving-a-data-right-reaches-every-copy.md` §4 as its defining file. **That chapter's §4.3 says
  the opposite, in terms**: the falsifier *"is deliberately **not** stated as a fixed number of
  greps. 'Four greps' is what the first draft said, and four greps is exactly what missed `W-8`"*
  (`:169`–`:172`). The glossary row preserves the superseded phrasing of the very defect its source
  chapter published against itself.
- **Why it matters more than a wording slip.** `docs/GLOSSARY.md` is the project's one-hop lookup, and
  a reader who greps the term lands on the row rather than on §4.3. The row therefore teaches the
  falsifier in the form that failed, and it does so with a citation that looks authoritative. This is
  the same shape as `F-S8-1`'s diagnosis of the `42`: a figure travelling without the qualification
  that corrects it.
- **Reported, not fixed.** The row is SUB-9's, and no sub-task rewrites another's entry. This
  sub-task's own glossary rows are **appends only**, and `ingress closure` states the corrected
  position explicitly so the pair of rows is not self-contradictory to a reader who finds both.
- **Severity:** low. **Owner:** **SUB-14** (NEU-1007) under OUT-20, which owns house-style assembly
  and is the party permitted to touch another sub-task's file — the same routing SUB-5 used for
  `F-S5-13`. Co-named **SUB-9** (NEU-1003) as the row's author.
- **Resolving event.** The row's final clause is brought into line with `09_…md:169`–`:172`, or the
  citation is repointed.

**Two findings this sub-task deliberately does *not* raise.** That the boot migrator runs unguarded
is **`R-S15-3`**, and that the archive sweep breaches `OBJ-8` is **`R-S6-2`**; both are cited by
`TP-S12-31` and `TP-S12-32` and **neither is re-raised**, because a second register record of a
settled question would hand SUB-14's cross-register check two ids for one fact. `F-S9-6`'s retention
conflict is likewise cited and not re-raised — what is new is its *consequence* for a control, and a
consequence of another sub-task's finding is registered as a risk of this one (`R-S12-4`).

**One contradiction routed to `NEU-895` by SUB-12, and it is the package's first.** `F-S12-1` and the
one-sided verdict set are two failure modes `DR-C10-S5-1`'s five ordered checks do not generate,
which is that record's own trigger 3 verbatim. The amendment is routed to `NEU-895`, co-named
`NEU-896`, with **SUB-17** (NEU-1008) as the recipient within this package. **This is an amendment
under a stated trigger, not a rewrite:** C010's procedure is consumed as given and the shape of any
sixth check is its owner's to decide. The settled **46 / 43 / 3** tool surface was re-derived at this
cutoff and **holds**; `42` appears nowhere in `12_…md` as a codebase fact.
