# `DR-C11-S15-2` — The connection pool is named as the first break even though the charter's enumeration does not list it, and all five structures are ranked

**Task:** NEU-998 (SUB-15) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-25 · **Verification cutoff:** `86fb38a`, 2026-08-25
**Model:** claude-opus-5[1m]
**Discharges:** OUT-14 (`../90_outcome-register.md`) — *"a first-break analysis of the single-instance assumption under multi-learner load"*, and the acceptance clause *"names which process-local structure breaks first and at what threshold."*

## Decision

The first-break analysis names the **shared Postgres connection pool** (`max: 4`,
`src/infrastructure/db/client.ts:42`) as the structure that breaks first, **even though it is not
one of the four the charter's OUT-14 row enumerates** (transport map, subject-binding map,
rate-limit windows, circuit-breaker set).

The four charter-named structures are then **ranked separately and completely**, so the enumeration
is answered in its own terms rather than replaced. Both answers are published; neither is suppressed
to make the other tidy.

Two further sub-decisions:

1. **The transport map and the subject-binding map are treated as one exposure, not two.** They
   share a key and a lifecycle, so the second cannot break before the first.
2. **The rate-limit windows are named as the first of the four to give way — as a *protection*
   rather than as a *structure*.** The map itself is in no danger; what fails is what it is for.

## Rationale

The charter's enumeration was written to name the *category* of thing at risk — process-local,
in-memory, lost on restart, wrong under replication — and it names four good examples of it. It was
not written as an exhaustive inventory, and reading it as one produces a false answer to the question
OUT-14 actually asks.

The false answer is easy to reach. Rank only the four, and the honest conclusion is that none of them
has a hard numeric ceiling at all: the rate-limit map is swept every window, the circuit-breaker set
is keyed by a fixed enum, and the two session maps grow only with abandoned sessions. A reader would
close the chapter believing the single-instance assumption has considerable headroom.

It does not. The pool is capped at **4**, and it is the smallest hard numeric ceiling anywhere in the
process — smaller than any of the four by roughly two orders of magnitude. It is also
unambiguously process-local in-memory state by every property the charter's category cares about: a
module-level singleton (`poolInstance`, `src/infrastructure/db/client.ts:5`), lost on restart, and
wrong under replication in exactly the way `.env.example:79`–`:81` describes for the rate limiter.
Excluding it would be excluding the answer on a technicality about which four examples the charter
happened to list.

The rate-limit finding only becomes visible once the two are analysed together, and it is the
operationally important one. The limiter is keyed on the JWT subject
(`src/transport/rate-limit-middleware.ts:58`), so N subjects admit N × 2 req/s while the pool stays
at 4. **The limiter cannot defend the pool at any learner count, by construction** — at three
subjects the admitted aggregate already saturates four connections at any service time above 0.667 s.
Ranking the four alone would have recorded the windows map as "healthy, swept every 60 s," which is
true about the data structure and completely misses that the mechanism provides zero aggregate
protection. That is `F-S15-2`, and it exists only because the pool was admitted into the comparison.

Merging the two session maps into one exposure is the same instinct applied in the opposite
direction. They are declared on adjacent lines, keyed identically, and deleted in the same handler
(`src/transport/http.ts:82-83`, `:212-218`). Listing them as separate ranked entries would imply a
reader might have to fix one before the other, or that one could be exhausted while the other was
not. Neither is true, so they are one row and one finding (`F-S15-3`).

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | Rank only the four structures the charter enumerates | Produces a materially misleading answer. None of the four has a hard numeric ceiling, so the chapter would conclude the single-instance assumption has headroom while the real ceiling — 4 concurrent DB-bound calls — sits unmentioned. It would also have hidden `F-S15-2` entirely, since the limiter's inadequacy is only visible against the resource it fails to protect. |
| 2 | Name the pool as first break and drop the four | Fails the acceptance criterion in its own terms and discards real content: the session-map eviction gap (`F-S15-3`) and the process-lifetime circuit-breaker trip are genuine findings that only the four-way ranking surfaces. The enumeration deserves an answer, not a substitution. |
| 3 | Treat the pool as out of scope and route it to SUB-16 | SUB-16 (NEU-999) designs how a breach of an objective is **detected**; it does not set the objective. Routing the single most important capacity fact out of the capacity chapter would leave OUT-14 without its central number and hand SUB-16 something it has no remit to author. |
| 4 | List the transport map and subject-binding map as two ranked entries | Implies an independence they do not have. Same key, same lifecycle, same single eviction path — one can never be exhausted while the other is not, so two rows would overstate the number of distinct exposures and invite two separate fixes for one gap. |
| 5 | Name the rate-limit windows map as "does not break," which is true of the data structure | True and useless. The question is where the single-instance assumption gives way under multi-learner load; the limiter's per-subject keying is the reason aggregate load is unbounded, which is a break in the protection even though the `Map` is fine. Recording it as healthy would have suppressed `F-S15-2`. |
| 6 | State a single point value for the learner threshold | No evidence selects any point in the 2–200 band over any other, because `t_db` is unobserved (`OI-S15-3`). See `DR-C11-S15-1`. |

## Consequences

1. **The chapter's headline capacity number is 4**, not a learner count — a hard, verifiable,
   repository-cited ceiling. That is a more useful and more defensible headline than any learner
   figure available today.
2. **`F-S15-2` exists**, and it is arguably the most actionable finding in the chapter: the mechanism
   the deployment has for protecting itself does not protect the thing that actually runs out.
3. **The ranking has five rows over two id spaces** — one structure the charter did not name, and
   four it did. A reader must not read rank 1 as "the charter's first-named structure." The chapter's
   §3.3 table marks the pool explicitly as *not one of the charter's four* in the row itself.
4. **What becomes harder:** SUB-14's assembly and SUB-17's audit both check chapters against the
   charter's own wording, and this chapter deliberately answers a superset of what OUT-14's
   enumeration lists. This record is the justification they should find when they notice.
5. **The four-connection ceiling is now a package fact that SUB-7 will gate rollout stages on.** If
   the pool size changes in `src/`, `OBJ-1`, the entire §3 band and SUB-7's staging move together.
   The revision trigger names it.
6. **A second-order pool fact is recorded rather than resolved:** the process opens three pools, not
   one (`src/transport/pg-audit-transport.ts:44`, `src/transport/pg-event-transport.ts:40`), so total
   server connections exceed 4. Whether that collides with the server's `max_connections` is
   unanswerable here — the host and its database configuration are unknown, cited to `OI-S1-9`.

## Evidence

| Claim | Source |
| --- | --- |
| The main pool is `max: 4` with a 5 000 ms acquisition timeout and a 30 000 ms idle timeout | `src/infrastructure/db/client.ts:40-47` |
| The pool is a module-level process-local singleton | `src/infrastructure/db/client.ts:5` |
| Two further `pg.Pool` instances exist in the same process at library defaults | `src/transport/pg-audit-transport.ts:44`; `src/transport/pg-event-transport.ts:40` |
| The rate limiter is keyed on the JWT subject | `src/transport/rate-limit-middleware.ts:58`; `.env.example:76`–`:78` |
| Per-subject ceiling is 120 requests per 60 000 ms | `src/config/resolve-rate-limit-config.ts:24-25` |
| The rate-limit map is swept lazily at most once per window | `src/transport/rate-limit-middleware.ts:63-68`, `:85` |
| The transport and subject-binding maps are declared adjacently and share a key | `src/transport/http.ts:82-83` |
| Their only eviction path is `transport.onclose`; shutdown drains both | `src/transport/http.ts:212-218`, `:304-311` |
| The tier-2 breaker set is keyed by a fixed enum and is process-lifetime | `src/orchestration/tier2-circuit-breaker.ts:68`, header `:6-11` |
| Replication multiplies per-instance limiter state by the replica count | `.env.example:79`–`:81`; charter assumption 22 |
| `t_db` is unobserved, so the learner threshold is a band | `../93_open-items-and-provisional-register.md` § `OI-S15-3` |
| Host resources and database configuration are unknown | `../93_open-items-and-provisional-register.md` § `OI-S1-9` (SUB-1's record, cited not restated) |

## Revision trigger

- **The pool's `max` changes in `src/infrastructure/db/client.ts`**, which moves `OBJ-1`, the entire
  §3 band, and every downstream stage gated on it.
- **An aggregate rate limiter is added**, which would close `F-S15-2` and give `OBJ-3` a mechanism.
- **An eviction path with a TTL or size bound is added to the session maps**, which would close
  `F-S15-3` and retire `R-S15-2` and `A-S15-2` together.
- **`OI-S15-3` closes**, collapsing the 2–200 band to a value and making the ranking's thresholds
  concrete rather than parametric.
- **`OI-S1-9` closes**, supplying host resources and the database's `max_connections`, which would
  settle whether the three-pool total is itself a ceiling.
- **SUB-14 or SUB-17 rules that the analysis must be confined to the charter's four**, in which case
  the pool row moves out of the ranking and into a finding — but is not deleted.
