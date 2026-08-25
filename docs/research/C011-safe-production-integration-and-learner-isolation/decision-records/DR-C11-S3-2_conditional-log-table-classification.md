# `DR-C11-S3-2` — Classify the two port-less log tables under both readings with a stated condition, and record the entry as complete rather than pending

**Task:** NEU-995 (SUB-3) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-25 · **Verification cutoff:** `86fb38a`, 2026-08-25
**Model:** claude-opus-5[1m]
**Discharges:** OUT-9 (`../90_outcome-register.md`) — *"each carries both the unattributed and the attributed classification, the condition that selects between them, and an explicit pointer to SUB-16 as the sub-task that determines it"*

## Decision

`LD-S3-16` (`infrastructure.mcp_request_log`) and `LD-S3-17` (`infrastructure.operation_event_log`)
each carry **two** personal-data classifications rather than one:

> **Unattributed learner content** at this cutoff — they hold learner free text with no principal
> column to attribute it. → **`Learner-linked` personal data** if a principal column is added, or an
> existing column is made to carry an authenticated principal.

The condition that selects between the readings is **stated once and applies to both entries**, and
**SUB-16 (OUT-15)** is named explicitly as the sub-task that determines it. The determination happens
**once, downstream**, and flows forward into SUB-8's export and erasure duties (OUT-11) and SUB-9's
propagation matrix (OUT-12).

**The conditional entry is the finished form of the entry.** It is recorded as **complete**, not as
awaiting revision: no back-edge revision of the inventory is required, requested or owed.

This treatment is **exclusive to these two entries.** The other thirty are not written conditionally.

## Rationale

The distinction that justifies treating these two differently from everything else is that their
attribution is **undetermined**, not merely pending.

For the `public` and Drizzle-`infrastructure` tables, attribution is a **scheduled** change with a
known cause: OUT-8 obligates an ownership column and OUT-13 designs what the `context_tokens` row
carries beyond its three fields. Those entries can therefore say *"unattributed today, `learner-linked`
once that column lands"* as a transition, and the cause is named.

For these two, three separate questions are open at once and none is this package's to answer:
whether `NEU-850`'s *"every core table"* even ranges over them is `OI-S5-1`, owned by `NEU-850`
(carried here as the stand-in `A-S3-1`); whether a request is made attributable at all is SUB-16's
determination under OUT-15; and whether their production rows contain learner content is `OI-S1-5` /
`OI-S1-6`, owned and unclosed. A single classification would have to pick an answer to the first two.

Writing both readings is what makes the entry **complete without pre-empting anyone**. The reader
learns what the tables hold, what they are today, what they become, and exactly which sub-task decides
— which is everything an entry can honestly carry at position 3. Recording it as complete is the part
that matters structurally: several other outcomes rest on OUT-9's no-back-edge rule, and an entry
labelled *pending* is a revision request in all but name.

These are also the two entries where getting it wrong costs the most. `LD-S3-16` holds whole,
unredacted learner free text (`F-S3-1`), and `LD-S3-17` is **indefinitely retained** with no cleanup
script at all. They are the copies the charter's own `R2` names first — *"erasure completes on paper
while learner data survives in a copy nobody owns"*.

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **Classify them as `unattributed learner content` only** — the accurate-today reading. | Accurate and silently wrong-shaped. It presents a snapshot as a settled classification, and a reader designing erasure against it would conclude no per-learner duty can attach — which is true today and may be false the moment SUB-16 reports. It quietly assumes the answer to a question SUB-16 owns, and it is the reading that would force a back-edge revision of this chapter later, breaking the rule other outcomes rest on. |
| 2 | **Classify them as `learner-linked` pre-emptively**, on the grounds that they obviously contain learner content. | Overstates what the schema supports. Neither table has any principal column — `mcp_request_log.session_id` is the MCP *transport* session id, not an identity, and `operation_event_log` has nothing at all. Asserting a link the data cannot make is exactly the overstatement `R10` is registered against, and it would make SUB-16's determination look like a formality confirming a decision already taken. |
| 3 | **Leave the status blank pending SUB-16** and mark the entries provisional. | An entry with no reading is not an entry. It leaves a blank for SUB-14 to fill — which the register conventions forbid outright — and creates precisely the back-edge dependency the no-revision rule exists to prevent. It would also mean the two most exposed categories in the inventory carry the least information. |
| 4 | **Raise a C011 open item for the attribution question**, alongside the two readings. | It already has records: `OI-S5-1` (owned by `NEU-850`) for the scope question and OUT-15 (SUB-16) for the determination. A third record would be a second id for a question already owned, which is the failure the one-question-one-id contract is written against and which SUB-14's cross-register check cannot catch. The stand-in `A-S3-1` carries the assumption; nothing more is needed. |
| 5 | **Split each table into two entries**, one per reading. | Doubles the entry count for two tables and breaks *"every category appears exactly once"* — the criterion this inventory is judged against. The readings are two values of one field, not two categories. |

## Consequences

1. SUB-16 receives a precisely scoped determination: not *"classify the log tables"* but *"decide
   whether a principal column is added"*, with both downstream classifications already written.
2. SUB-8 (OUT-11) and SUB-9 (OUT-12) can each write **two** branches against a stated condition rather
   than waiting on SUB-16 to start, because both readings are already published.
3. **No revision of chapter `03_` is owed to anyone.** OUT-9 is complete at position 3.
4. **A cost:** two of thirty-two entries do not have a single answer in the status column, so any
   mechanical count of *"categories that are personal data"* over this inventory must handle a
   two-valued cell. The chapter states the condition once, in one place, so such a count has exactly
   one thing to resolve.
5. `A-S3-1`'s **invalidating outcome** is bound to this record: if `NEU-850` excludes both tables and no
   other obligation reaches them, the attributed reading becomes unreachable rather than undetermined,
   and SUB-9 is left with two matrix cells it cannot resolve to an action — which OUT-12 forbids.

## Evidence

| Claim | Source |
| --- | --- |
| `mcp_request_log` has no principal column | `drizzle/0010_create_infrastructure_mcp_request_log.sql:3`; extended by `drizzle/0012_extend_mcp_request_log.sql:1` adding only `correlation_id` and `session_id` |
| `session_id` is a transport session id, not an identity | `src/transport/http.ts:82` keys the transport registry on the MCP session id; identity is held separately at `:83` |
| `operation_event_log` has no principal column of any kind | `drizzle/0013_create_operation_event_log.sql:1` |
| `response_body` is stored whole and unredacted | `src/transport/audit-middleware.ts:88`, assigned at `:109`; `redactParams` applied only to `params` at `:105` |
| The redactor is a credentials-only denylist | `src/shared/redact-params.ts:1` |
| Not redacting learner response text is a deliberate documented choice | `src/shared/logger.ts:35`–`:36` |
| `operation_event_log` is indefinitely retained; `mcp_request_log` has a 30-day delete script | `scripts/retention-cleanup.sql` (covers `mcp_request_log` only); `src/orchestration/topic-workflows.ts:585` and `src/orchestration/chunk-workflows.ts:161` both describe the event log as *"indefinitely-retained"* |
| Rationales may quote learner content verbatim, capped at 256 chars | `src/orchestration/topic-workflows.ts:585`; `src/orchestration/chunk-workflows.ts:161` |
| Whether the two tables hold learner content **in production** is unobserved | `../93_open-items-and-provisional-register.md` § `OI-S1-5`, `OI-S1-6`; `../94_caps-and-incomplete-scope.md` § `CAP-S1-1` |
| Whether *"every core table"* covers them is `NEU-850`'s to decide | Charter assumption 36; `../95_stand-in-assumption-register.md` § `A-S3-1` |

## Revision trigger

- **SUB-16 (OUT-15) reports its attribution determination** — the condition resolves, one reading is
  selected for each table, and both entries' status collapses to a single value.
- **`OI-S5-1` closes** — `NEU-850` states whether *"every core table"* ranges over these two, which
  fires `A-S3-1`'s re-validation trigger and may fire its invalidating outcome.
- **A principal column is added to either table** by any route, scheduled or otherwise, which
  satisfies the stated condition directly.
- **`OI-S1-5` or `OI-S1-6` closes** with an observation that a table holds **no** learner-derived
  content in production, which would make the attributed reading moot for that table regardless of
  attribution.
