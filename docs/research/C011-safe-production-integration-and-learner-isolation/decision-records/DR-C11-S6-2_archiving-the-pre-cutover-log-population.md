# `DR-C11-S6-2` — The pre-cutover log population is archived at the cutover instant: closed, moved out of the confined surface, and deleted by nothing

**Task:** NEU-1000 (SUB-6) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-25 · **Verification cutoff:** `35f92ba`, 2026-08-25
**Model:** claude-opus-5[1m]
**Discharges:** OUT-2 (`../90_outcome-register.md`) — the disposition of the unowned rows for which no target subject can be verified, and the reversal position for the stage that moves them.

---

## Decision

1. **At the cutover instant, the pre-cutover rows of `infrastructure.mcp_request_log` and
   `infrastructure.operation_event_log` are moved intact into a retained store outside the confined
   surface.** They are not deleted, not backfilled, and not de-identified by this migration.

2. **The move's purpose is *relocation*, not closure.** Closure is the **attribution carrier's**
   doing: the unowned set stops growing the moment the carrier lands, whether or not anything is
   moved. What the archive adds is that the closed set leaves the confined surface, so the live
   tables hold only attributable rows and the unowned population is addressable as a whole rather
   than interleaved with rows a predicate will match. **This depends on S1 executing at or after the
   carrier lands** — sequencing is SUB-7's, so the ordering requirement is registered as `A-S6-2`
   rather than assumed by the word "cutover".

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

Relocating the closed population addresses both without pretending either mechanism can be made to
work on these rows.

**Two events, and this record is careful about which one it can claim.** *Closure* belongs to the
carrier: `DR-C11-S8-2`'s own revision trigger 3 already credits it, noting that fixing a cutover
instant "converts `unreachable` from a standing property into a bounded, countable population for the
first time" (`DR-C11-S8-2_export-erasure-and-the-completion-deadline.md:169`–`:170`). *Relocation* is
what this decision adds.

Against the under-reach: archiving does not make the rows per-learner selectable — nothing can. What
it adds to the closure the carrier already delivered is that the only bound SUB-8 said was available,
"time-based and population-wide", now applies to a set that sits in **one place** rather than
interleaved with attributable rows in the live tables — so the bound is not merely well-defined but
mechanically applicable.

Against the over-reach: after the move the live tables hold only post-cutover rows, every one
carrying the attribution carrier (`A-S6-2`). Confinement over them is then complete and correct, and nothing is
hidden by predicate — because nothing unowned remains inside the confined surface for a predicate to
hide. The archived rows sit outside that surface by construction. **The same rows remain equally
unreadable to the learner; what changes is that their unreadability is a declared boundary with a
named owner instead of a side effect of a `WHERE` clause.**

That is the resolution: the carrier closes the population, and this move relocates it — together
converting two accidental properties into one deliberate, bounded, owned quarantine.

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
   drop rather than crash, so the failure mode is lost audit entries rather than a failed deploy or
   a crashed process. **Whether the loss fits inside `OBJ-10`'s ≤ 60 s allowance is not claimed** —
   that depends on S1's duration, which is unbounded and is `R-S6-2`'s subject.
5. **The stage is reversible in its rows but not in its effects.** The rows come back, provided the
   archive is retained, because they are moved rather than destroyed. Two things do not: the window
   in which the Tier-2 aggregate under-reported is not replayed, and any row written while the
   reversal stood re-mixes the two populations, so a re-run faces a set no longer cleanly separable
   by timestamp. `../06_the-disposition-of-every-unowned-row.md` §9.2 states it per stage.
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
| A cutover instant converts `unreachable` into a bounded population | `DR-C11-S8-2_export-erasure-and-the-completion-deadline.md:169`–`:170` |
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
3a. **SUB-7 sequences S1 before the carrier lands** — `A-S6-2`'s invalidating outcome. The archive
   would then hold only part of the pre-cutover set while the live tables resumed accumulating
   unowned rows, which is not the artifact this decision describes; it would need re-deriving against
   a two-population archive rather than amending.
4. **`OBJ-8`'s conflict (`R-S6-2`) is resolved by a deploy-independent way to defer boot-time
   migration** — the staging constraint on the move would relax, and the stage could run outside the
   boot path.
