# `DR-C11-S6-2` — The pre-cutover log population is archived at the cutover instant: closed, moved out of the confined surface, and deleted by nothing

**Task:** NEU-1000 (SUB-6) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-25 · **Verification cutoff:** `35f92ba`, 2026-08-25
**Model:** claude-opus-5[1m]
**Discharges:** OUT-2 (`../90_outcome-register.md`) — the disposition of the unowned rows for which no target subject can be verified, and the reversal position for the stage that moves them.

---

## Decision

1. **At the cutover instant, the pre-cutover rows of `infrastructure.mcp_request_log` and
   `infrastructure.operation_event_log` are moved intact into a retained store outside the confined
   surface.** They are not deleted, not backfilled, and not de-identified by this migration.

2. **The move's purpose is to *close the population*.** Before it, the set of unowned log rows is
   open and grows with every request. After it, the set is finite, carries an end timestamp, and is
   separately addressable as a whole.

3. **This is a migration disposition, not a propagation action.** It states where the rows live. It
   does not state what an erasure or withdrawal request does to them — that is SUB-9's (NEU-1003),
   under `F-S8-2` and `R-S16-1`, and all three of SUB-9's options remain open after the move.

4. **This record sets no retention bound, no owner and no destruction condition for the archive.**
   Those are terms on a copy of learner data and belong to OUT-12 and to the `CAP-S3-3` /
   `CAP-S4-1` owners.

5. **Archiving is not a discharge of the erasure duty.** `F-S8-2` remains blocking. Registered as
   `R-S6-1` so the non-discharge is recorded rather than implied by the archive's existence.

---

## Rationale

Two merged predecessors describe these rows in opposite directions, and both are right.

SUB-8: a `DELETE … WHERE learner_key = $1` "returns success and a row count while the entire
pre-cutover population survives" (`../08_consent-and-what-a-learner-can-export-and-erase.md:450`–`:452`),
and the population "cannot be given a learner-scoped retention bound at all" (`:459`–`:463`).

SUB-5: "Where erasure misses pre-cutover rows, confinement **hides** them: they become unreachable to
everyone, including the learner who created them. … it is **data loss by predicate**"
(`../05_the-enforcement-point-that-confines-every-read-and-write.md:624`–`:629`).

The two failures are one absence seen twice. Both mechanisms are *per-learner*, and the population
has no per-learner structure — because attribution is not retroactive and these rows "can never be
given" a key (`../16_attribution-and-detection.md:279`–`:283`). Erasure needs a predicate and finds
none, so it under-reaches; confinement applies one and the rows match nobody's, so it over-reaches.

Closing the population addresses both without pretending either mechanism can be made to work on
these rows.

Against the under-reach: archiving does not make the rows per-learner selectable — nothing can. It
converts the only bound SUB-8 said was available, "time-based and population-wide", from a bound over
an unbounded and still-growing set into a bound over a closed and countable one. `DR-C11-S8-2`'s own
revision trigger 3 anticipated the event, noting that fixing a cutover instant "converts
`unreachable` from a standing property into a bounded, countable population for the first time"
(`DR-C11-S8-2_export-erasure-and-the-completion-deadline.md:169`).

Against the over-reach: after the move the live tables hold only post-cutover rows, every one
carrying the attribution carrier. Confinement over them is then complete and correct, and nothing is
hidden by predicate — because nothing unowned remains inside the confined surface for a predicate to
hide. The archived rows sit outside that surface by construction. **The same rows remain equally
unreadable to the learner; what changes is that their unreadability is a declared boundary with a
named owner instead of a side effect of a `WHERE` clause.**

That is the whole of the resolution: one move converts two accidental properties into one
deliberate, bounded, owned quarantine.

---

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **Backfill the log rows to the verified target subject** | Contradicts SUB-16 outright (`../16_attribution-and-detection.md:279`–`:283`) and is provably false for a subset: `mcp_request_log` records every request including the deploy smoke job's `client_credentials` calls, so a uniform human key would misattribute those rows specifically. |
| 2 | **Delete the pre-cutover population at cutover** | Pre-empts SUB-9, which owes this population a disposition with three options — bulk deletion, bulk anonymization, or an accepted and named residual (`../08_consent-and-what-a-learner-can-export-and-erase.md:464`–`:466`). Deleting removes two of the three before SUB-9 is reached, and is irreversible. |
| 3 | **De-identify the free text in place** | Not mechanically achievable at this cutoff. `response_body` is stored whole and unredacted and `redactParams` is a credentials-only denylist (`src/shared/redact-params.ts:1`); no component identifies learner-authored free text inside a response body. Proposing it would be proposing an unbuilt mechanism as a mitigation. |
| 4 | **Leave the rows in place, unowned** | The status quo and the failure both predecessors describe. It also leaves the population open, so it grows for as long as the decision is deferred. |
| 5 | **Move the rows to a different database or host** | Would trip `A-28`'s named invalidating outcome — a finding that safe isolation requires a separate datastore (`../../C010-system-and-repository-architecture/93_stand-in-assumption-register.md:113`) — and route an amendment to `NEU-895` for a gain the same-database archive already delivers. |
| 6 | **Archive *and* truncate in one stage** | Makes the stage irreversible for no benefit. Splitting them leaves the destructive half to SUB-9, whose decision it actually is. |

---

## Consequences

1. **SUB-9 (NEU-1003) receives a strictly better position, not a constrained one.** All three of its
   options survive the move, and the population it must dispose of is finite and countable rather
   than open and growing.
2. **`F-S8-2` is neither discharged nor re-raised here.** Its severity, its owner and its routing are
   unchanged. What changes is the shape of the thing it points at.
3. **The Tier-2 aggregate under-reports for five weeks after cutover**, because its window is five
   weeks and the rows it would have summed now live in the archive. After that window it reads only
   carrier-bearing rows, at which point a predicate can be pushed below its aggregation and
   `F-S5-9` becomes fixable. Registered as `F-S6-3`.
4. **A transient write-unavailability window exists during the move.** Both transports buffer and
   drop rather than crash, so the failure mode is lost audit entries within `OBJ-10`'s allowance,
   not a failed deploy. Registered as `F-S6-5` and handed to SUB-7. **It is not a third cause of the
   smoke-run break `F-S5-12` records** — it is transient, not a standing refusal.
5. **The stage is fully reversible with nothing lost**, provided the archive is retained, because the
   rows are moved rather than destroyed.
6. **The disposition is correct under both readings of `OI-S5-1`**, because `archive` adds no
   ownership column to either log table. The package therefore does not wait on `NEU-850`.

---

## Evidence

| Claim | Source |
| --- | --- |
| Erasure reports success while the pre-cutover population survives | `../08_consent-and-what-a-learner-can-export-and-erase.md:450`–`:452` |
| The only available bound is time-based and population-wide | `../08_consent-and-what-a-learner-can-export-and-erase.md:459`–`:463` |
| SUB-9 owes the population a disposition, with three options | `../08_consent-and-what-a-learner-can-export-and-erase.md:464`–`:466`; `../91_findings-register.md:435` |
| Confinement hides pre-cutover rows from everyone — data loss by predicate | `../05_the-enforcement-point-that-confines-every-read-and-write.md:624`–`:629` |
| Attribution is not retroactive; the rows can never be given a key | `../16_attribution-and-detection.md:279`–`:283` |
| The binding lived only in a process-local map, emptied on restart | `src/transport/http.ts:83`, cited at `../16_attribution-and-detection.md:279`–`:283` |
| A cutover instant converts `unreachable` into a bounded population | `DR-C11-S8-2_export-erasure-and-the-completion-deadline.md:169` |
| `response_body` is stored whole and unredacted; `redactParams` is credentials-only | `src/shared/redact-params.ts:1` |
| The Tier-2 aggregate reads `operation_event_log` over a five-week window with no ownership predicate | `src/adapters/drizzle/tier2-blocking-stats-repository.ts:34`–`:47`, predicate at `:40`–`:42`; registered as `F-S5-9` |
| The log tables are written by the two transports | `src/transport/pg-audit-transport.ts:117`–`:118`; `src/transport/pg-event-transport.ts:109`–`:110` |
| `A-28` tolerates existing global rows being archived | `../../C010-system-and-repository-architecture/93_stand-in-assumption-register.md:111` |

---

## Revision trigger

1. **SUB-9 (NEU-1003) publishes the population's propagation disposition** — if it chooses bulk
   deletion, the archive acquires a destruction condition this record deliberately did not set, and
   the reversal position in the chapter's §9.2 stage S1 must be restated as conditional on that
   choice not yet having executed.
2. **A per-row attribution source for pre-cutover rows is discovered** — any durable structure that
   held a session-to-subject binding and survived a restart. That would falsify
   `../16_attribution-and-detection.md:279`–`:283`, and alternative 1 above would become available,
   overturning this decision rather than amending it.
3. **The attribution carrier lands with a shape other than `DR-C11-S16-1`'s column pair** — the
   cutover instant this record is written against would be defined by a different event.
4. **`OBJ-8`'s conflict (`R-S6-2`) is resolved by a deploy-independent way to defer boot-time
   migration** — the staging constraint on the move would relax, and the stage could run outside the
   boot path.
