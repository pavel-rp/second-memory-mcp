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
