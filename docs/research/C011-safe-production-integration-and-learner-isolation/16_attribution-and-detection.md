# 16 — Attribution, and the detection of an isolation or privacy failure

**Task:** NEU-999 (SUB-16) · **Charter:** C011 (umbrella NEU-893) · **Covers:** OUT-15
**Model:** claude-opus-5[1m] · **Written:** 2026-08-25 · **Verification cutoff:** `5111841`, 2026-08-25
**Depends on:** SUB-1 (NEU-993), SUB-2 (NEU-994), SUB-3 (NEU-995). Consumes SUB-15 (NEU-998).
**Decision records:** `decision-records/DR-C11-S16-1_the-attribution-carrier.md`,
`decision-records/DR-C11-S16-2_the-audit-log-privacy-determination.md`,
`decision-records/DR-C11-S16-3_the-stalled-propagation-signal-contract.md`
**Traceability:** `traceability/S16_attribution-and-detection.md`

---

## 0. What this chapter is, and what it is not

**It is** four things. An **attributability audit** reporting, per transport and separately, what a
request is attributable to today and what it would be attributable to under a proposed change (§1,
§2). A **detection matrix** mapping four failure modes to a signal, a threshold, an alert route and
an owner (§3), with every signal that needs data the deployment does not emit naming that missing
emission and its owner (§4). A **determination** — not a deferral — of the privacy classification
SUB-3 left conditional (§5). And a **signal contract** stating the exact proof shape the
stalled-propagation signal reads (§6).

**It is not** an implementation. **Nothing under `src/` or `drizzle/` changes in this sub-task.**
Every column, every emission and every alert route described here is a shape a later charter builds;
this chapter states the shape so that SUB-7, SUB-8, SUB-9, SUB-12 and SUB-13 design against one
answer instead of five.

**It is not measured.** No production credential exists in the environment this package was written
in. Across four merged chapters **zero spikes have executed**, and the evidence label
`observed-in-production` has been used **zero times** — SUB-1 delivered a complete access discipline
and an empty evidence base, and `92_risk-register.md` § `R13` records the position as `n = 0` rather
than the charter's assumed `n = 1`. **Every threshold in §3 is derived from repository constants, and
none is calibrated.** That is carried as `94_caps-and-incomplete-scope.md` § `CAP-S16-1`, and `R13`
is cited for the evidence position rather than restated.

**One qualification the package requires.** Per `91_findings-register.md` § `F-S2-2`, the id
`OI-S1-2` denotes different facts in C010 and C011. Every cross-package reference in this chapter is
written qualified.

---

## 1. The attributability audit — HTTP and STDIO, separately, before and after

The two transports are in genuinely different states, and reporting them together would hide the
worse one. They are reported as two rows and never averaged.

| Transport | **Before** — at cutoff `5111841` | **After** — under the carrier of `DR-C11-S16-1` | Residual, with owner |
| --- | --- | --- | --- |
| **HTTP** | **Unattributable.** An audit row is written to `infrastructure.mcp_request_log`, but **0 of its 11 columns carry a server-derived principal**. The two columns that look as though they might do are both caller-asserted: `session_id` is lifted verbatim from the tool call's own arguments (`src/transport/audit-middleware.ts:94`–`:99`) and `correlation_id` echoes a caller-supplied `X-Correlation-ID` header, minting a UUID only in its absence (`src/transport/http.ts:154`–`:157`). Emission is itself **conditional** on `auditDbUrl` being set (`src/transport/http.ts:177`–`:182`). | **Attributable**, for every request that reaches the audit middleware. `principal_kind` (`NOT NULL`, one of `user` / `client` / `none`) and `learner_key` (the `sub` verbatim, non-null **iff** kind is `user`) are written from the signature-verified token. | **Requests that never reach the middleware.** If `AUDIT_DATABASE_URL` / `DATABASE_URL` is unset in production, no row is written and an audited deployment is indistinguishable from a silent one. Whether it is set is unobserved — `93_open-items-and-provisional-register.md` § `OI-S16-1`. **Owner: the creator, as sole maintainer and sole operator.** |
| **STDIO** | **Unattributable *and* unrecorded** — strictly worse than HTTP, and the difference matters. `src/transport/main.ts:55`–`:58` constructs the server and a bare `StdioServerTransport`; the audit middleware, the JWT middleware and the context-token gate are mounted only inside `startHttpTransport` — at `src/transport/http.ts:180`, `:164` and `:186` respectively — which is called only from the `mode === 'http'` branch at `src/transport/main.ts:46`–`:54`, and which the STDIO branch never reaches. `resolveAuthConfig` returns `null` for `stdio` outright (`src/config/resolve-auth-config.ts:105`). **No row is written to either log table, and no principal is resolved to write.** | **Still unattributable.** The carrier adds columns to a row STDIO never writes. Attribution on STDIO is a **two-step** problem — first an audit record must exist, then it can carry a principal — and this chapter supplies only the second step. Reporting it as "improved" would be false. | **Named, with two owners, because there are two missing things.** The *record* is **SUB-7**'s (NEU-1001) to sequence under OUT-3. The *principal* is downstream of STDIO acquiring an identity at all, which is C010's `OI-S8-2` — the named, classified and priced STDIO gate, **owner `SUB-10 of C010` (NEU-984), co-named `NEU-896`** — for which **OUT-7** supplies the mechanism. |

**The audit's finding, stated plainly.** Attribution on HTTP is not absent for want of an identity.
The verified subject is computed at `src/transport/jwt-middleware.ts:127` and stored into the
in-process binding map at `src/transport/http.ts:204`–`:210`. It exists, in the process, at the
moment the audit row is written — and it is **discarded at the persistence boundary**. The gap is one
of carriage, not of derivation, which is why it is closable by a column pair rather than by a new
identity mechanism.

**The audit's second finding.** The only structure that has ever held a session-to-subject binding is
that in-process map (`src/transport/http.ts:83`). It is process-local, its sole eviction path is a
clean session close (`91_findings-register.md` § `F-S15-3`), and the deployment restarts at a
measured **≥3.29 times per day over the most recent 7 days**
(`15_operational-objectives-for-the-real-platform.md` §2.2, `C-17`). It also **fails open**:
`src/transport/http.ts:57`–`:58` returns `true` when no binding is found. **Historical rows can
therefore never be attributed retroactively** — the binding that would have done it is gone. Carried
as `91_findings-register.md` § `F-S16-5`.

---

## 2. The attribution model, and the third principal state

`DR-C11-S16-1` fixes the carrier. Its substance, for a reader of this chapter alone:

- **`principal_kind`** — `TEXT NOT NULL`, domain exactly `{ user, client, none }`.
- **`learner_key`** — `TEXT NULL`, the OIDC `sub` claim **verbatim**, non-null **if and only if**
  `principal_kind = 'user'`.

Both values are **carried, not re-derived**: `principal_kind` is `DR-C11-S2-2`'s determined kind and
`learner_key` is `DR-C11-S2-1`'s learner key, persisted at a new site. **`azp` is never written to
`learner_key`**, under any shape.

**Three values, because there are three states.** This is the load-bearing part of the model and the
reason it is not a single nullable column:

| `principal_kind` | What it means | What a signal may conclude |
| --- | --- | --- |
| `user` | A learner. The token carried a `sub`. | This request owns learner state and may read it. |
| `client` | A **service principal**, admitted and holding **no learner state**. Learner access under it is **refused, not empty-scoped** (`DR-C11-S2-2` decision 3). | This request must never have touched learner-owned rows. A row saying it did is a detection event, not an ordinary emptiness. |
| `none` | No principal was determined for this record. | Either the request bypassed the gate (a confinement failure) or the record predates attribution. The two are distinguished by the record's timestamp against the cutover, not by the column. |

**Why the third state is the point.** `DR-C11-S2-2` rejected empty-scoping a `client` principal's
learner queries on exactly this ground: an empty result set and a refusal look identical, so *"a
machine principal wired into a learner path"* becomes indistinguishable from *"a learner with no
data"* — and that record noted the consequence would land here, as *"exactly the class of silent
failure OUT-15's detection design would then have to reconstruct from nothing."* A two-valued carrier
would re-create that failure one layer down: it would add a column and keep the silence. Folding
`client` into `none` would also make `R-S2-2` — the smoke principal silently acquiring a `sub` and
beginning to own production rows — permanently invisible, and `92_risk-register.md` § `R-S2-2` hands
that detection gap to this sub-task **by name**.

**The model is designed against the static-client shape, not DCR.** `91_findings-register.md` §
`F-S2-1` establishes from ADR-0001's NEU-909 amendment
(`docs/adr/0001-oidc-issuer-and-dedicated-as-audience-binding.md:65`, `:67`) that *"the claude.ai
connector in production authenticates with a manually provisioned static client (`claude-web`) rather
than DCR"* — so **the production human-learner path is principal shape 2, the static client**, and
the `dyn$` DCR shape may carry no production traffic at all. `F-S2-1` names SUB-16 among the
sub-tasks that would otherwise design against the wrong shape.

The way this chapter applies that finding is by **making the carrier indifferent to the audience**.
`principal_kind` is computed from `sub`-presence and nothing else; `aud` is never read. A carrier
keyed to the audience shape — `dyn$` means a learner — would have misclassified the actual production
learner as a machine, which is `DR-C11-S2-2`'s rejected alternative 4 arriving at the log layer. The
correct response to `F-S2-1` is therefore not to hard-code `claude-web` anywhere; it is to build a
carrier that is right on the static-client path *because* it never looks at the audience. **The
literal string `claude-web` appears nowhere in `src/`** — the value is supplied at runtime through
`AUTH_ADDITIONAL_AUDIENCES` (`src/config/resolve-auth-config.ts:94`–`:99`) and the middleware's own
comment describes the shape at `src/transport/jwt-middleware.ts:64`–`:66`. That is consistent with
`F-S2-1`, which located the client's identity in ADR-0001 and `.env.example`, not in the source.

---

## 3. The detection matrix

Four failure modes, four signals. **Zero failure modes without a signal.**

Two conventions apply to every row and are stated once rather than fifteen times.

- **Every alert route is `[unconfirmed]`.** No monitoring, alerting or log-shipping arrangement is
  discoverable in the repository, and where production runs is unknown —
  `93_open-items-and-provisional-register.md` § `OI-S1-9`, owner **the creator, as sole maintainer
  and sole operator**, which names SUB-16 as a consumer precisely because *"[its] detection design
  needs to know where signals can be observed."* This chapter raises **no second record** of that
  fact. The reading it proceeds on is carried as the stand-in
  `95_stand-in-assumption-register.md` § `A-S16-1`.
- **Every count-based threshold reads a lower bound**, never an exact count, because the audit
  pipeline drops entries silently. See §7 and `91_findings-register.md` § `F-S16-2`. Thresholds are
  chosen so that this degrades safely: a dropped entry can **hide** an event but cannot
  **manufacture** one, so a zero-tolerance threshold can produce a false negative and never a false
  positive.

| Id | Failure mode | Signal | Threshold | Alert route | Owner |
| --- | --- | --- | --- | --- | --- |
| `FM-S16-1` | **Cross-learner access** — a request is served rows owned by a different learner | `SIG-S16-1`, two limbs (below) | **Zero-tolerance: > 0 in any 24 h window**, either limb | `[unconfirmed]` — `OI-S1-9`; stand-in `A-S16-1` | **Signal:** the creator, as sole operator. **Emission:** **SUB-5** (NEU-997) for limb 1a; this chapter's carrier for limb 1b |
| `FM-S16-2` | **Failed confinement** — the gate that should have stopped a request did not | `SIG-S16-2` — count of `tools/call` admitted on a **gated** tool with `principal_kind = 'none'` | **Zero-tolerance: > 0 on HTTP.** **Unsettable on STDIO** — no record exists to count | `[unconfirmed]` — `OI-S1-9` | **Emission:** **SUB-7** (NEU-1001) for HTTP; C010's `OI-S8-2`, owner **`SUB-10 of C010` (NEU-984)**, for STDIO |
| `FM-S16-3` | **Stalled data-lifecycle propagation** — a completion deadline passes without proof | `SIG-S16-3` — the signal contract of `DR-C11-S16-3` (§6) | **Any propagation with ≥ 1 missing copy-class proof at `t ≥ deadline_at`.** Fully specified; **not yet evaluable**, because `deadline_at`'s *value* is SUB-8's under OUT-11 | `[unconfirmed]` — `OI-S1-9`; the proof's own `emitter` field is the addressee | **Contract:** this sub-task. **Signal:** **SUB-9** (NEU-1003) once its proof design lands |
| `FM-S16-4` | **Rollout regression** — a deploy silently reverses a confinement or attribution gain | `SIG-S16-4` — a paired before/after comparison across each deploy boundary, two limbs (below) | **(a)** the `principal_kind = 'none'` share of admitted gated calls **increases** across a deploy boundary; **or (b)** the refusal rate **falls to zero** on a transport where the prior window was non-zero | The deploy pipeline's existing post-deploy smoke is the only automated post-deploy signal the platform has; where a *failure* would be seen is `[unconfirmed]` — `OI-S1-9` | **Stages:** **SUB-7** (NEU-1001). **Channel:** the creator, as sole operator |

### 3.1 `SIG-S16-1` — cross-learner access, in two limbs

The direct signal and the available signal are not the same thing, and conflating them would let this
chapter claim a detection capability it does not have.

- **Limb 1a — the direct signal.** Count of responses in which a **returned row's owner column
  differs from the request's `learner_key`**. This is the actual failure. It needs **two** things
  that do not exist: the carrier of `DR-C11-S16-1`, and the per-row ownership column OUT-8 obligates.
  Missing emission `ME-S16-4`; emission owner **SUB-5** (NEU-997).
- **Limb 1b — the available proxy.** Count of `tools/call` requests where `principal_kind = 'client'`
  **and** the tool is not one of the three gate-exempt tools. It needs only the carrier, so it lands
  a full charter earlier than 1a.

**Why zero-tolerance rather than a rate.** The only `client`-kind principal known to exist on this
deployment is the CI smoke principal, which authenticates by `client_credentials` and calls
`init_agent_context` on every deploy (charter assumption 20;
`decision-records/DR-C11-S2-2_principal-kind-and-the-service-principal-disposition.md` § Rationale) —
and `init_agent_context` is **one of the three exempt tools**, named literally at
`src/transport/context-token-middleware.ts:5`–`:9` alongside `get_server_info` and
`get_server_workflow`. So the expected steady-state count of limb 1b is **exactly zero**, and any
non-zero value is either a machine principal nobody declared or `R-S2-2` materializing. A rate
threshold over an expected-zero population is a way of tolerating the first occurrence.

**Evidence label: `n = 0`.** The claim *"a non-exempt `client` call indicates a leak"* has never been
checked against a real population, single-tenant or otherwise. `92_risk-register.md` § `R13` is cited
for the position; no second record is raised.

### 3.2 `SIG-S16-2` — failed confinement

This is not a hypothetical mode. **Three fail-open sites** are readable in the repository today:

1. `src/transport/http.ts:57`–`:58` — `verifySessionBinding` does
   `const bound = sessionIdentity.get(sessionId); if (!bound) return true;`. A missing binding is
   admitted. Because the map is emptied by every restart (§1), it is missing for every pre-existing
   session after each of ≥3.29 daily deploys.
2. `src/transport/context-token-middleware.ts:83`–`:86` — the context-token gate catches an internal
   exception, logs it, and calls `next()`. **An error in the gate admits the call.**
3. `src/transport/http.ts:184`–`:187` — the gate is mounted only when the context-token repository is
   non-null. An unmounted gate is not a failing gate; it is an absent one.

**Why the threshold is zero and not a rate.** A confinement failure is not a load phenomenon. One
admitted ungated call on a gated tool is the whole failure, and there is no volume at which it
becomes acceptable.

**STDIO is reported as unsettable, not as zero.** No audit record is emitted on STDIO at all
(`src/transport/main.ts:55`–`:58`), so the count is not zero — it is undefined. Recording it as zero
would be the single most misleading number this chapter could publish, because STDIO is also the
transport with **no gate at all**, which is the state C010 records as `I4` failing first and *masking*
the `I5` defect (`../C010-system-and-repository-architecture/02_findings-register.md:267`).

### 3.3 `SIG-S16-4` — rollout regression

A regression is a **change in a distribution**, not an absolute value, so both limbs are
paired comparisons across a deploy boundary rather than thresholds on a level.

**Limb (b) is the only signal in this entire matrix computable from data the deployment emits
today.** `mcp_request_log.response_status` already exists
(`drizzle/0010_create_infrastructure_mcp_request_log.sql:10`), so the refusal rate — 401/403 responses
as a share of requests — is derivable now, with no schema change and no new emission. It is worth
naming because it is the one thing on this page that could be switched on before anything else in
C011 lands. Its weakness is that it says nothing about *who* was refused, which is exactly what
attribution adds.

**The comparison window is a deploy interval, and that window is thin.** At ≥3.29 deploys/day
(`15_operational-objectives-for-the-real-platform.md` §2.2, `C-17`) the window is hours. At `n = 0`
observed traffic there is no basis to say whether hours of traffic is enough to make the comparison
meaningful, and this chapter does not assert that it is. **The request arrival rate that would settle
it is unobserved and no register item in this package covers it** — `OI-S15-3` is SUB-15's distinct
`t_db` question (mean per-call database service time) and is **not** claimed to answer this one. No
new open item is raised for it, because this signal is a *paired comparison* rather than a threshold
on a level: it degrades to "not enough data to compare" rather than to a wrong verdict.

---

## 4. Missing emissions — every one named, with an owner

The fifth acceptance condition of this sub-task is that a signal requiring data the deployment does
not emit must **name the missing emission with an owner rather than assume it available**. Seven are
named. None is assumed.

| Id | Missing emission | Which signal needs it | Owner |
| --- | --- | --- | --- |
| `ME-S16-1` | **No principal column on either log table.** Neither `infrastructure.mcp_request_log` (`drizzle/0010_create_infrastructure_mcp_request_log.sql`, extended by `drizzle/0012_extend_mcp_request_log.sql`) nor `infrastructure.operation_event_log` (`drizzle/0013_create_operation_event_log.sql`) has a principal, subject, user or learner column. | `SIG-S16-1` (both limbs), `SIG-S16-2`, `SIG-S16-4` limb (a) | **Shape:** this chapter (`DR-C11-S16-1`). **DDL:** **SUB-13** (NEU-1006) under OUT-19. **Sequencing:** **SUB-7** (NEU-1001) |
| `ME-S16-2` | **No audit record of any kind on STDIO.** `src/transport/main.ts:55`–`:58`. | every signal, on STDIO | **SUB-7** (NEU-1001) for the record; C010's `OI-S8-2`, owner **`SUB-10 of C010` (NEU-984)**, co-named `NEU-896`, for the gate that would give it a principal |
| `ME-S16-3` | **No refusal event.** `DR-C11-S2-2` decision 3 requires learner access under a `client` principal to be **refused**, and that record's own consequence 5 states the refusal path *"is a new observable behaviour that does not exist today"*. Nothing emits it. | `SIG-S16-1` limb 1b's stronger form | **SUB-5** (NEU-997) under OUT-8 |
| `ME-S16-4` | **No per-row ownership column** to compare a returned row against. | `SIG-S16-1` limb 1a — the *direct* cross-learner signal | **SUB-5** (NEU-997) under OUT-8; realized as DDL by **SUB-13** (NEU-1006) |
| `ME-S16-5` | **No alerting, notification or log-shipping channel of any kind is known to exist.** This is why every route in §3 is `[unconfirmed]`. | all four signals | **The creator, as sole maintainer and sole operator** — the single record is `93_open-items-and-provisional-register.md` § `OI-S1-9`; no second record is raised here |
| `ME-S16-6` | **No completion-proof store, no `propagation_id`, and no propagation emits anything.** The contract in §6 describes a record nothing writes today. | `SIG-S16-3` | **SUB-9** (NEU-1003) under OUT-12 |
| `ME-S16-7` | **Audit emission is conditional on `auditDbUrl`** (`src/transport/http.ts:177`–`:182`). If it is unset in production, *nothing* is emitted and the deployment looks identical to one with no traffic. Whether it is set is unobserved. | all four signals, on HTTP | **The creator, as sole maintainer and sole operator** — `93_open-items-and-provisional-register.md` § `OI-S16-1`, with `96_spike-register.md` § `SPK-S16-1` |

**`ME-S16-7` is the one that decides whether any of this has an input at all**, which is why it is
raised as this sub-task's single new open item rather than folded into `OI-S1-9`. `OI-S1-9` asks where
signals *can be observed*; `OI-S16-1` asks whether the writer is *mounted*. They are different facts
with different resolving events, and the one-question-one-id contract is satisfied by keeping them
apart rather than by merging them.

---

## 5. The privacy determination — exactly one reading, per table

SUB-3's inventory records `LD-S3-16` (`infrastructure.mcp_request_log`) and `LD-S3-17`
(`infrastructure.operation_event_log`) with **two** classifications and names this sub-task as the
resolver (`03_learner-data-inventory-and-classification.md` §5, §12;
`decision-records/DR-C11-S3-2_conditional-log-table-classification.md`). The determination is made
here, once, in `DR-C11-S16-2`.

> **Determined: both tables are `learner-linked` personal data** under the attribution
> `DR-C11-S16-1` proposes. The condition SUB-3 stated — *"if a principal column is added, or an
> existing column is made to carry an authenticated principal"* — is satisfied by that carrier, and
> by nothing weaker.

**The classification is per table; the key is per row.** A table is `learner-linked` if any row in it
can be linked to a learner, because export and erasure are duties that attach to a store and need a
scope. Within the table, `principal_kind` makes the duty executable: a `user` row is in scope for
that learner; a `client` row is not learner-linked at all; a `none` row remains
`unattributed learner content`, the pre-attribution reading, unchanged.

**The adoption condition is stated, not assumed.** This determination binds every design downstream
of it. It does **not** assert that the deployment carries attribution today — it does not. Asserting
it would be the overstatement `92_risk-register.md` § `R10` is registered against.

### 5.1 Consequence, per duty

| Duty | `mcp_request_log` | `operation_event_log` |
| --- | --- | --- |
| **Export** (OUT-11) | Rows with `learner_key = <requester's sub>` are in scope. `response_body` is stored **whole and unredacted** (`91_findings-register.md` § `F-S3-1`; `src/transport/audit-middleware.ts:88`, assigned at `:109`) and is capped at 65 536 bytes (`OBJ-11`), so an export must be labelled **possibly truncated**. `params` is redacted only by a credentials denylist (`src/shared/redact-params.ts:1`). | Rows with `learner_key = <requester's sub>` are in scope. `data` is free-form `JSONB` (`drizzle/0013_create_operation_event_log.sql:9`) and rationales may quote learner content verbatim, capped at 256 characters (`src/orchestration/topic-workflows.ts:591`; `src/orchestration/chunk-workflows.ts:168`). |
| **Erasure** (OUT-12) | Becomes reachable by `DELETE … WHERE learner_key = $1`. **Today it is reachable by no per-learner predicate at all** — that is the material change. The 30-day script (`scripts/retention-cleanup.sql`) is time-based and does not discharge an erasure request. | Becomes reachable by the same predicate. |
| **Retention** | The 30-day script bounds the window but is not learner-scoped. | **There is no retention bound at all.** No cleanup script covers this table, and the codebase describes it as *"indefinitely-retained"*. Attribution therefore converts an unbounded store into an unbounded store **of learner-linked personal data** — `92_risk-register.md` § `R-S16-4`. |

### 5.2 The consequence a downstream reader would otherwise miss

**Attribution is not retroactive.** Rows written before the carrier lands carry no key and **can
never be given one**: the only structure that ever held the binding is the process-local map at
`src/transport/http.ts:83`, emptied by every restart (§1, `F-S15-3`). A per-learner erasure over
either table is therefore **provably incomplete for the entire pre-cutover population**, and no
downstream design changes that. **SUB-9 (NEU-1003) must give that population a disposition — bulk
deletion, bulk anonymization, or an accepted and named residual — rather than a key.** Carried as
`91_findings-register.md` § `F-S16-5` and `92_risk-register.md` § `R-S16-1`.

This is the charter's § Risks row `R2` — *"erasure completes on paper while learner data survives in
a copy nobody owns"* — arriving through the front door, and it is the reason the determination was
worth a decision record rather than a sentence.

### 5.3 What is not determined, and what is not owed

- **Whether either table holds learner-derived content in production is unobserved** and stays so:
  `93_open-items-and-provisional-register.md` § `OI-S1-5` and § `OI-S1-6`, both owned by the creator
  as sole operator. This chapter **cites them and does not resolve them by assumption.** The
  determination is sound under either answer, because linkability is a property of the schema while
  content is a property of the rows.
- **The lawful basis and the controller/processor role** are one question with one record —
  `93_open-items-and-provisional-register.md` § `OI-S3-1`, owned by SUB-3. Cited, not duplicated.
- **`F-S3-1`'s minimization finding** — the unread, unredacted `response_body` — was routed by SUB-3
  to **`NEU-986`**. This chapter **does not re-route it** and **does not design as though it were
  already fixed**: §5.1's export row states the unredacted-and-truncated consequence as it stands.
- **Zero revisions are raised against SUB-3's inventory.** No revision of
  `03_learner-data-inventory-and-classification.md` is **produced, requested or owed**.
  `DR-C11-S3-2`'s first revision trigger fires with this determination, and firing it is the designed
  path — the determination lives here and is cited from downstream, which is what forward-only means.

---

## 6. The stalled-propagation signal contract

`SIG-S16-3` reads a **completion proof**. `DR-C11-S16-3` fixes its shape completely. In summary, so
that a reader holding only this chapter can say what a conforming proof looks like:

**Nine required fields, all non-null:** `propagation_id` · `request_kind` (`erasure` | `export` |
`withdrawal` | `rectification`) · `learner_key` (the `sub` verbatim; never `azp`) · `copy_class` ·
`action` (`deleted` | `anonymized` | `exported` | `not-applicable` | `refused`) · `rows_affected`
(non-negative integer; **`0` is legal and must be distinguishable from absent**) · `emitted_at` ·
`deadline_at` (carried **on the proof**) · `emitter`. The propagation additionally declares, once, its
**`copy_class` cardinality**.

**Location — three properties, no table named:** (a) queryable on `propagation_id` alone; (b) **not**
either log table, because both are subject to the erasure being proved (§5) and a proof stored there
shares the fate of the thing it proves; (c) **not** a process-local structure, because the signal must
survive a restart and the one in-memory binding structure already does not.

**Timing — one rule:** evaluated at any `t ≥ deadline_at`; **fires** when the count of distinct
`copy_class` values with a complete proof is **less than** the declared cardinality; **idempotent**;
a late proof **closes** the signal without un-firing it, its lateness preserved by
`emitted_at > deadline_at`; **no grace period beyond `deadline_at`**, because `deadline_at` is the
grace.

**Six negative clauses** — a conforming proof may not rely on a caller-asserted identifier, may not
live only in memory, may not treat absence-of-error as completion, may not omit a copy class because
there was nothing to do (`action = not-applicable`, `rows_affected = 0`), may not be emitted before
the action it proves is durable, and may not carry a `learner_key` differing from the request's.

**The direction is forward-only, and this chapter asserts only its own half.** SUB-9 (NEU-1003), at
position 11, writes its completion-proof design to conform, and **SUB-9's acceptance asserts the
match**. This sub-task ships at position 7, before that design exists; it asserts only that the
contract is stated precisely enough to be conformed to, and it neither evaluates nor predicts SUB-9's
design.

**One thing the contract deliberately leaves without a value.** `deadline_at`'s *value* rests on a
duty whose lawful basis is `OI-S3-1`, and stating it is SUB-8's under OUT-11. The contract fixes that
the field exists, is required and is carried on the proof. Until SUB-8 states a policy, `SIG-S16-3`
is **fully specified and not yet evaluable** — recorded that way in §3's threshold column rather than
given an invented default.

---

## 7. Consistency with SUB-15's `OBJ-10` and `OBJ-11`

`15_operational-objectives-for-the-real-platform.md` §"What this chapter hands forward" hands both
objectives to this sub-task as **stated facts rather than facts to re-derive**. Both were checked
against the source at this cutoff.

**`OBJ-11` — ≤ 65 536 bytes of response body retained per entry. Consistent.** The bound holds and is
applied **twice, by two separate constants of the same value**: `MAX_CAPTURE_BYTES` at
`src/transport/audit-middleware.ts:14` caps the in-memory capture, and `MAX_RESPONSE_BODY_BYTES` at
`src/transport/pg-audit-transport.ts:36` truncates again before insertion. The duplication is
recorded as a fact, not as a defect. **Its consequence for detection:** a signal reading
`response_body` must treat a body of exactly 65 536 bytes as **possibly truncated**, never as
complete — which is also why §5.1 labels an export the same way.

**`OBJ-10` — ≤ 60 s of audit traffic lost per 60 000 ms circuit-open window, entries dropped and not
retried. Consistent, and a lower bound rather than the total.** SUB-15's citation is accurate: the
constants are at `src/transport/pg-audit-transport.ts:30`–`:36` and the drop is at `:83`–`:90`, where
a circuit-open flush discards the whole buffer with only a `stderr` write. What `OBJ-10` bounds is the
**open window**. There is a **second loss path it does not bound**: `:92`–`:93` swaps the buffer out
**before** `pool.query` runs, so a batch whose query throws is already out of the buffer and is not
requeued — and this happens on each of the **five** consecutive failures that must accumulate before
the breaker opens at all (`DEFAULT_CIRCUIT_BREAKER_THRESHOLD = 5`, `:32`). Total loss across one
outage is therefore *(up to five pre-open batches, each up to `DEFAULT_BATCH_SIZE = 100` entries or
`DEFAULT_FLUSH_INTERVAL_MS = 5 000` ms of traffic, `:30`–`:31`)* **plus** *(60 s of traffic per open
window)*.

This is registered as `91_findings-register.md` § `F-S16-2` — **an extension, not a contradiction**.
`OBJ-10` is accurate about what it bounds, its citation resolves, and **no revision is routed to
SUB-15 and none is owed**; the chapter reports the additional path rather than absorbing it into
prose or amending a shipped record.

**The consequence for every signal in §3.** A count read from `mcp_request_log` is a **lower bound on
the true count**, not the count. Every threshold in the matrix is chosen so this degrades safely: a
dropped entry can hide an event but cannot invent one, so a zero-tolerance threshold yields false
negatives and never false positives. Carried as `92_risk-register.md` § `R-S16-3`, because a false
negative on a cross-learner-access signal is exactly the failure the signal exists to prevent.

---

## 8. The tool-surface figure, disclosed

The settled figure this package uses is **46 registered / 43 gated / 3 exempt**, consumed from C010's
`F-S5-3` and `F-S8-1` through OUT-16. It was re-counted at this cutoff and **it holds**: 46 tools
across `src/server/*.ts`, and exactly three exempt, named literally at
`src/transport/context-token-middleware.ts:5`–`:9` as `init_agent_context`, `get_server_info` and
`get_server_workflow`. 46 − 3 = 43.

Two disclosures, made here so SUB-17's audit meets the explanation rather than the anomaly:

1. **"43 gated" describes a mount, not an invariant.** The context-token gate is mounted only in HTTP
   mode and only when the context-token repository is non-null
   (`src/transport/http.ts:184`–`:187`); it **never runs for STDIO**, where all 46 tools are ungated.
2. **The gate fails open on internal error.** `src/transport/context-token-middleware.ts:83`–`:86`
   catches an exception, logs it and calls `next()`, admitting the call ungated.

Both are recorded as `91_findings-register.md` § `F-S16-3`. Neither contradicts the 46/43/3 figure;
both qualify what "gated" means, and both are load-bearing for `SIG-S16-2`.

**`42` does not appear as a codebase fact anywhere in this chapter**, and no citation in it resolves
to a line 42.

---

## 9. What this chapter does not claim

1. **No signal here has ever fired, or been run.** Every threshold is derived from repository
   constants at `n = 0` observed production events. `94_caps-and-incomplete-scope.md` § `CAP-S16-1`;
   `92_risk-register.md` § `R13` for the evidence position.
2. **No alert route is real.** All four are `[unconfirmed]` against `OI-S1-9`. A signal that fires
   today reaches nobody, and that is `92_risk-register.md` § `R-S16-2`.
3. **STDIO is not made attributable by anything here**, and §1 says so rather than reporting an
   improvement.
4. **The privacy determination is conditional on adoption** and asserts nothing about the deployment
   as it stands.
5. **No claim is made about SUB-9's completion-proof design**, which does not exist at this position.
6. **No production quantity in this chapter is labelled observed.** Every one cites its owning open
   item, or is carried as a stand-in with a re-validation trigger, or is deferred to a spike marked
   `not executed`.
7. **This is a product and engineering document, not legal advice.** Every duty named in §5 is stated
   as an engineering consequence of a classification, and the determination that would make it a
   legal obligation is `OI-S3-1`, owned elsewhere.
8. **No contradiction with C010 was found.** The tool-surface figure was checked against `F-S5-3` and
   `F-S8-1`, the server-derived-principal rule against `DR-C10-S8-2`, check `I5` against
   `../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:174`,
   and the `I4`-masks-`I5` position against
   `../C010-system-and-repository-architecture/02_findings-register.md:267`. Each is consistent or
   cited. **No amendment is routed to `NEU-895` by SUB-16.** The check is recorded so SUB-17's audit
   can see that it ran and returned empty.

---

## 10. What this chapter hands forward

| Id | What it is | Who consumes it |
| --- | --- | --- |
| `DR-C11-S16-1` | The attribution carrier — a three-valued `principal_kind` plus a nullable `learner_key`, and the ruling that neither existing column may be reused | **SUB-13** (NEU-1006) DDL; **SUB-5** (NEU-997) enforcement point; **SUB-7** (NEU-1001) sequencing |
| `DR-C11-S16-2` | The determined privacy classification of both log tables, with its export, erasure and retention consequence | **SUB-8** (NEU-1002) under OUT-11; **SUB-9** (NEU-1003) under OUT-12 |
| `DR-C11-S16-3` | The stalled-propagation **signal contract** — nine fields, three location properties, one fire condition, six negative clauses | **SUB-9** (NEU-1003), whose acceptance asserts the match; **SUB-12** (NEU-1004) as a measurable gate |
| `SIG-S16-1` … `SIG-S16-4` | The four signals, with thresholds and owners | **SUB-12** (NEU-1004) threat model and gate register; **SUB-7** (NEU-1001) rollout stages |
| `ME-S16-1` … `ME-S16-7` | The seven missing emissions, each with an owner | **SUB-5**, **SUB-7**, **SUB-9**, **SUB-13**; the creator as sole operator |
| `F-S16-1` … `F-S16-5` | Findings — the caller-asserted carriers, `OBJ-10`'s lower bound, the gate qualifications, the conditional emission, the permanently unattributable history | **SUB-9**, **SUB-12**, **SUB-14** (aggregation), **SUB-17** (gate) |
| `R-S16-1` … `R-S16-4` | Residual exposures with severity, mitigation, owner and escalation route | **SUB-14** (aggregation); **SUB-17** (gate) |
| `OI-S16-1` / `SPK-S16-1` | Whether the audit writer is mounted in production at all | **SUB-7**; **SUB-12**; the creator as sole operator |
| `A-S16-1` | The stand-in the alert routes rest on, with its tolerance envelope and invalidating outcome | **SUB-7**; **SUB-12**; **SUB-14** |
| OUT-15's outcome-register row | The outcome, its resolving evidence and its authored success measure | **SUB-14** (NEU-1007), which aggregates and authors none |

**The direction is forward-only.** This chapter publishes these ids; whether SUB-8, SUB-9, SUB-12 or
SUB-13 in fact cites them is each of their own acceptances, at positions 10, 11, 13 and 14.
