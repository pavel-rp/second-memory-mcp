# `DR-C11-S16-2` — Both log tables are determined `learner-linked` personal data under the proposed attribution, classified per table and keyed per row, with the adoption condition stated rather than assumed

**Task:** NEU-999 (SUB-16) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-25 · **Verification cutoff:** `5111841`, 2026-08-25
**Model:** claude-opus-5[1m]
**Discharges:** OUT-15 (`../90_outcome-register.md`) — *"the audit log's privacy classification under attribution determined in this outcome and consumed by OUT-11 and OUT-12"*. It is the determination `DR-C11-S3-2` names SUB-16 as the resolver of.

## Decision

1. **The attributed reading is determined, for both tables.** `LD-S3-16`
   (`infrastructure.mcp_request_log`) and `LD-S3-17` (`infrastructure.operation_event_log`) are
   **`learner-linked` personal data** under the attribution `DR-C11-S16-1` proposes. The condition
   `DR-C11-S3-2` stated — *"if a principal column is added, or an existing column is made to carry an
   authenticated principal"* — is satisfied by that carrier, and by nothing weaker.

2. **The determination is per table; the key is per row.** A table is `learner-linked` if **any** row
   in it can be linked to a learner, because export and erasure are duties that attach to the *store*
   and must be scoped somewhere. Within the table, the row's `principal_kind` is what makes the duty
   executable:

   | `principal_kind` | `learner_key` | The row is | In scope of a learner's export/erasure request? |
   | --- | --- | --- | --- |
   | `user` | the `sub`, non-null | `learner-linked` personal data | **Yes**, for the learner whose `sub` it is |
   | `client` | `NULL` | operational data about a service principal, holding no learner state | **No** — there is no learner to link it to |
   | `none` | `NULL` | `unattributed learner content` — the pre-attribution reading, unchanged | **No, and it cannot be made so** — see decision 5 |

   The three-valued kind is therefore not decoration: it is the discriminator that turns *"this table
   is personal data"* into an executable predicate rather than a table-wide obligation.

3. **The adoption condition is stated, not assumed.** This determination selects the attributed
   reading **for the design**. It does **not** assert that the deployment carries attribution today —
   it does not; neither table has any principal column at this cutoff
   (`drizzle/0010_create_infrastructure_mcp_request_log.sql`,
   `drizzle/0012_extend_mcp_request_log.sql`, `drizzle/0013_create_operation_event_log.sql`). The
   determination binds every design downstream of it; the deployment reaches it when SUB-13's DDL
   lands under SUB-7's sequencing. Asserting the attributed reading as a present fact would be the
   overstatement `R10` is registered against.

4. **Consequences, stated per duty.**

   | Duty | `mcp_request_log` (`LD-S3-16`) | `operation_event_log` (`LD-S3-17`) |
   | --- | --- | --- |
   | **Export** (OUT-11) | Rows with `learner_key = <requester's sub>` are in scope. `response_body` is stored **whole and unredacted** (`F-S3-1`; `src/transport/audit-middleware.ts:88`, assigned at `:109`), so an export returns the learner's own free text back to them — capped at 65 536 bytes per entry (`OBJ-11`), which means an export must be labelled **possibly truncated** rather than complete. `params` is redacted only by a credentials denylist (`src/shared/redact-params.ts:1`), so learner content in arguments is exported too. | Rows with `learner_key = <requester's sub>` are in scope. `data` is free-form `JSONB` (`drizzle/0013_create_operation_event_log.sql:9`) and rationales may quote learner content verbatim, capped at 256 characters (`src/orchestration/topic-workflows.ts:585`; `src/orchestration/chunk-workflows.ts:161`). |
   | **Erasure** (OUT-12) | Becomes reachable by `DELETE … WHERE learner_key = $1`. **Today it is reachable by no per-learner predicate at all** — this is the material change attribution makes. A 30-day retention delete exists (`scripts/retention-cleanup.sql`) but it is time-based, not learner-based, and does not discharge an erasure request. | Becomes reachable by the same predicate. **No cleanup script covers this table at all**; it is described in the codebase as *"indefinitely-retained"* (`src/orchestration/topic-workflows.ts:585`; `src/orchestration/chunk-workflows.ts:161`). Attribution therefore converts an indefinitely-retained store into an indefinitely-retained store **of learner-linked personal data** — carried as `R-S16-4`. |
   | **Retention** | The 30-day script bounds the exposure window but is not a learner-scoped control. Under the attributed reading it becomes a *retention* control over personal data rather than over logs. | **There is no retention bound.** This is the single largest consequence of the determination and it is stated as an exposure, not resolved here: setting a retention period is a policy decision resting on the lawful basis, which is `OI-S3-1` (SUB-3's record, cited not duplicated). |

5. **Pre-attribution rows are permanently unattributable, and the population is therefore mixed.**
   Rows written before the carrier lands carry `principal_kind = 'none'` and no key, and no later
   process can supply one: the only structure that ever held the session-to-subject binding is the
   process-local map at `src/transport/http.ts:83`, whose only eviction path is a clean session close
   (`F-S15-3`), and which is emptied by every restart at a measured cadence of ≥3.29/day
   (`../15_operational-objectives-for-the-real-platform.md` §3). A per-learner erasure over either
   table is therefore **provably incomplete for the pre-cutover population**, and no amount of
   downstream design changes that. **SUB-9 (NEU-1003) must give that population a disposition —
   bulk deletion, bulk anonymization, or an accepted and named residual — rather than a key.**
   Carried as `F-S16-5` and `R-S16-1`.

6. **Zero revisions are raised against SUB-3's inventory.** No revision of
   `../03_learner-data-inventory-and-classification.md` is **produced, requested or owed**. The
   conditional entry was complete as written; this record supplies the determination downstream of it,
   exactly as `DR-C11-S3-2`'s decision and consequence 3 provide for. `DR-C11-S3-2`'s first revision
   trigger — *"SUB-16 (OUT-15) reports its attribution determination"* — fires with this record, and
   firing it is the designed path, not an exception.

7. **What is not determined here.** Whether the two tables actually hold learner-derived content **in
   production** is unobserved and remains so: `OI-S1-5` and `OI-S1-6`, owned by the creator as sole
   operator. This record does not resolve them by assumption and does not need to — linkability is a
   property of the schema, which is readable, whereas content is a property of the rows, which is
   not. The determination is sound under either answer: if a table turns out to hold no
   learner-derived content, the attributed reading becomes *moot* for it rather than *wrong*, which
   is exactly `OI-S1-5`'s own stated resolving consequence.

## Rationale

**Determining the attributed reading is not a formality, and the reason is decision 5.** The tempting
read of this sub-task is that the determination is trivially forced — the chapter proposes
attribution, so of course the attributed reading holds. If that were all, `DR-C11-S3-2` would have
resolved it itself. What makes the determination worth a record is that selecting the attributed
reading immediately exposes something neither prior chapter could see: attribution is **not
retroactive**, so the classification the reading selects is true of the table *going forward* and
false of the table's existing contents, permanently. A downstream designer who read only
*"`learner-linked` personal data"* and built an erasure predicate would ship an erasure that reports
success and misses every historical row. That is the charter's § Risks row `R2` — *"erasure completes on paper
while learner data survives in a copy nobody owns"* — arriving through the front door.

**Why per-table rather than per-row alone.** Export and erasure are duties owed to a person about a
store. A purely per-row classification gives SUB-8 nothing to scope a duty to: it would have to say
*"some rows of this table may be personal data"*, which is not a classification a design can consume.
Classifying the table and keying the row gives both halves — an obligation with a scope, and a
predicate with a key.

**Why both tables get the same reading, when they are not the same table.** `operation_event_log` has
no `response_body` and no `params`; it is the less obviously exposed of the two, and treating it
identically looks like a lack of discrimination. It is not. Its `data` column is free-form `JSONB`
and the codebase's own comments record that rationales written into it may quote learner content
verbatim up to 256 characters. Once a principal column exists on it, the link is exactly as direct as
the request log's. Splitting the reading would give SUB-9 two matrix cells with different rules for
no difference in the underlying fact — and it would put the *indefinitely retained* table on the
weaker side, which is the wrong direction to be wrong in.

**Why the adoption condition is written out rather than left implicit.** Every other statement in
this package about the deployment is either an observation or an explicitly labelled `[unconfirmed]`.
A determination that read *"these tables are learner-linked personal data"* full stop would be the
package's first unlabelled assertion about a state the deployment is not in. `R10` — *"legal
determination asserted, authority overstated"* — is registered by SUB-3 against exactly this shape of
error, and the cheapest way not to commit it is one sentence naming the condition.

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **Determine the unattributed reading** — accurate at this cutoff, since no principal column exists. | It is accurate about today and wrong as a determination. The same chapter that determined it would, four sections earlier, have proposed the attribution that falsifies it. It would hand SUB-8 and SUB-9 a classification with a known expiry date, which is the *"snapshot presented as a settled classification"* failure `DR-C11-S3-2` rejected as its own alternative 1. |
| 2 | **Determine per row only**, leaving the table unclassified. | Gives SUB-8 nothing to attach an export or erasure duty to. A duty needs a scope; *"some rows may be"* is not one. Also breaks the inventory's *"every category appears exactly once"* criterion by implying the table is more than one category. |
| 3 | **Defer until `OI-S1-5` and `OI-S1-6` close**, so the determination rests on observed content. | Forbidden by the charter's own acceptance — *"the condition is never left open for a later sub-task to resolve by assumption"* — and unnecessary. The two items ask what the rows *contain*; the classification turns on whether they can be *linked*, which the schema answers. Deferring would also make the determination hostage to two observations that have gone unexecuted across four merged chapters, with `n = 0` (`R13`). |
| 4 | **Split the reading: attributed for `mcp_request_log`, unattributed for `operation_event_log`**, on the grounds that only the first stores whole free text. | Genuinely tempting and the closest alternative. It loses on the `data` `JSONB` column and the 256-character verbatim quotes the codebase's own comments describe, which make the event log's link just as direct once a principal column exists. It would also assign the weaker reading to the table with **no retention bound at all**, putting the least-controlled store in the least-protected class. |
| 5 | **Determine `learner-linked` unconditionally**, with no adoption condition. | Asserts a deployment fact that is false at this cutoff. It is precisely the overstatement `R10` names, and it would let a reader conclude the erasure predicate already exists. |
| 6 | **Classify the pre-cutover rows as a separate category**, so the table is not mixed. | Would require revising SUB-3's inventory to add a thirty-third category — the one thing this sub-task is forbidden to produce, request or owe. The mixed population is a property of the transition, not a new category of data, and it is correctly carried as a finding and a risk rather than as an inventory entry. |

## Consequences

1. **SUB-8 (OUT-11) receives a settled classification** and can write one branch instead of two: both
   tables are in scope of export and erasure, keyed on `learner_key`, with the truncation and
   redaction caveats stated per column.
2. **SUB-9 (OUT-12) receives the same, plus an obligation this record creates for it**: give the
   pre-cutover population a disposition (decision 5). That is a matrix cell SUB-9 would otherwise have
   resolved to *"delete by key"* and shipped incomplete.
3. **The retention gap becomes a named exposure rather than an implicit one.** `operation_event_log`
   is indefinitely retained and, under this determination, indefinitely retains learner-linked
   personal data. `R-S16-4`.
4. **`DR-C11-S3-2`'s first revision trigger fires**, and both entries' status collapses to a single
   value — which is what that record designed for. **No edit to chapter `03_` is required to
   effect it**: the determination lives here and is cited from downstream, which is the whole point
   of the forward-only rule.
5. **A cost.** A mechanical count of *"categories that are personal data"* over SUB-3's inventory now
   has to resolve its two two-valued cells against **this** record, in a different file. SUB-14's
   aggregation pass carries that hop. It is cheaper than a back-edge revision, which is the trade
   `DR-C11-S3-2` consequence 4 already priced.

## Evidence

| Claim | Source |
| --- | --- |
| The two entries carry two readings, with the condition stated once and SUB-16 named as its resolver. | `DR-C11-S3-2_conditional-log-table-classification.md` decision; `../03_learner-data-inventory-and-classification.md` §5, §12 |
| No revision of the inventory is required, requested or owed. | `DR-C11-S3-2_conditional-log-table-classification.md` consequence 3 |
| Neither table has any principal column at this cutoff. | `drizzle/0010_create_infrastructure_mcp_request_log.sql`; `drizzle/0012_extend_mcp_request_log.sql`; `drizzle/0013_create_operation_event_log.sql` |
| `response_body` is stored whole and unredacted; `redactParams` is a credentials-only denylist. | `src/transport/audit-middleware.ts:88`, `:105`, `:109`; `src/shared/redact-params.ts:1` |
| Response bodies are capped at 65 536 bytes. | `../15_operational-objectives-for-the-real-platform.md` §4 (`OBJ-11`); `src/transport/audit-middleware.ts:14`; `src/transport/pg-audit-transport.ts:36` |
| `operation_event_log.data` is free-form `JSONB`; rationales may quote learner content verbatim capped at 256 chars; the table is indefinitely retained with no cleanup script. | `drizzle/0013_create_operation_event_log.sql:9`; `src/orchestration/topic-workflows.ts:585`; `src/orchestration/chunk-workflows.ts:161`; `scripts/retention-cleanup.sql` covers `mcp_request_log` only |
| The subject-binding map is process-local and emptied by every restart, at a measured cadence of ≥3.29/day. | `src/transport/http.ts:83`; `../91_findings-register.md` § `F-S15-3`; `../15_operational-objectives-for-the-real-platform.md` §3 |
| Whether either table holds learner-derived content in production is unobserved. | `../93_open-items-and-provisional-register.md` § `OI-S1-5`, § `OI-S1-6` |
| The lawful basis and controller/processor role are one question with one record, owned elsewhere. | `../93_open-items-and-provisional-register.md` § `OI-S3-1` |
| Overstating a legal determination is a registered risk. | `../92_risk-register.md` § `R10` |
| Erasure completing on paper while a copy survives is the charter's § Risks row `R2`. | C011 charter, § Risks (`_local/`, gitignored — quoted here rather than cited as a resolvable path, per `DR-C11-S1-3` § Evidence). Its register entry is **SUB-9**'s to author (charter assumption 48; the fifteen-row author mapping is reproduced in `../92_risk-register.md`), so no `R2` section exists in that register at this cutoff. |

## Revision trigger

1. **`DR-C11-S16-1`'s carrier is superseded** by a different attribution shape — decision 1's
   satisfying condition changes with it.
2. **`OI-S1-5` or `OI-S1-6` closes with an observation that a table holds no learner-derived content
   in production** — the attributed reading becomes moot for that table (decision 7), and the
   downstream duties narrow accordingly. It does **not** become wrong.
3. **`OI-S3-1` closes** with a controller/processor role and a lawful basis per purpose — the
   retention consequence in decision 4 acquires a bound it currently cannot state.
4. **`OI-S5-1` closes** — `NEU-850` states whether *"every core table"* ranges over these two, which
   fires `A-S3-1`'s re-validation trigger and may reach `DR-C11-S3-2`'s invalidating outcome.
5. **A retention or cleanup script is added covering `operation_event_log`** — `R-S16-4`'s exposure
   narrows and decision 4's retention row is re-stated.
