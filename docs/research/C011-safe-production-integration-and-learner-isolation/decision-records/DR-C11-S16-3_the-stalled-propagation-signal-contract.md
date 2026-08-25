# `DR-C11-S16-3` — The stalled-propagation signal reads a completion proof of a fixed nine-field shape, in a durable store outside both log tables, evaluated at the declared deadline and counted against a declared cardinality

**Task:** NEU-999 (SUB-16) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-25 · **Verification cutoff:** `5111841`, 2026-08-25
**Model:** claude-opus-5[1m]
**Discharges:** OUT-15 (`../90_outcome-register.md`) — the stalled-data-lifecycle-propagation row of the detection matrix, published as a contract. **Direction: forward-only.** SUB-9 (NEU-1003, position 11) writes its completion-proof design to conform, and **SUB-9's acceptance asserts the match**. This record asserts only that its contract is stated precisely enough to be conformed to; it does not, and cannot, evaluate SUB-9's design, which does not exist at position 7.

## Decision

**The signal is:** *a propagation whose completion deadline passes without its proof emitted.*

Three things must be fixed for that sentence to be executable: what a proof **is**, **where** it
lives, and **when** it is read. All three are fixed here, completely, without reference to any
artifact that does not yet exist.

### 1. The proof shape — nine required fields, all non-null

A **completion proof** is one record. It asserts that one action, on one copy, for one data-right
request, is done. Every field below is **required and non-null**; a record missing any one of them is
not a proof and the signal does not count it.

| # | Field | Type | Meaning | Why the signal needs it |
| --- | --- | --- | --- | --- |
| 1 | `propagation_id` | stable opaque identifier | The one propagation instance this proof belongs to. | The only key the signal joins on. |
| 2 | `request_kind` | enum: `erasure`, `export`, `withdrawal`, `rectification` | Which data right is being propagated. | Different rights may carry different deadlines; the signal must not compare across kinds. |
| 3 | `learner_key` | the OIDC `sub`, verbatim | Whose right. Must equal the `learner_key` the request was raised under. | Lets a stalled propagation be attributed to a learner without re-deriving identity. Verbatim per `DR-C11-S2-1`; **never `azp`**. |
| 4 | `copy_class` | enum over the copy classes SUB-9's propagation matrix enumerates | Which copy this proof accounts for. | The signal counts distinct `copy_class` values, so a proof that does not name one cannot be counted. |
| 5 | `action` | enum: `deleted`, `anonymized`, `exported`, `not-applicable`, `refused` | What was actually done to that copy. | `not-applicable` and `refused` are **legal, distinct outcomes** — see the negative clauses. |
| 6 | `rows_affected` | non-negative integer | How many rows the action touched. | `0` is a legal value and **must be distinguishable from the field being absent**. |
| 7 | `emitted_at` | timestamp with time zone | When the proof was written. | Establishes that the proof exists as of an instant, so a late proof can close a fired signal. |
| 8 | `deadline_at` | timestamp with time zone | The completion deadline this proof is measured against. | Carried **on the proof**, not looked up elsewhere, so the signal needs no second source. |
| 9 | `emitter` | stable identifier of the emitting component | Who emitted it. | A stalled propagation must be routable to something; without this the alert has no addressee. |

The propagation itself must additionally declare, once, its **`copy_class` cardinality** — the number
of distinct copy classes this propagation is expected to produce a proof for. The signal reads that
declaration; it does not infer it from the proofs that happen to arrive, because inferring it would
make a propagation that emitted zero proofs look complete.

### 2. The location — three properties, stated as requirements rather than as a table name

The proof lives in a durable store that satisfies all three:

- **(a) Queryable on `propagation_id` alone.** The signal must be able to ask *"how many distinct
  `copy_class` proofs exist for this `propagation_id`?"* without a join to anything else.
- **(b) Not either of the two log tables.** Not `infrastructure.mcp_request_log`, not
  `infrastructure.operation_event_log`. Both are themselves subject to the propagation being proved
  (`DR-C11-S16-2`), so a proof stored in them is a proof an erasure may delete — the proof and the
  thing it proves would share a fate.
- **(c) Not a process-local structure.** Not an in-memory `Map`, not a module-level array, not
  request-scoped async storage. The signal must be readable across a restart, and the deployment
  restarts at a measured ≥3.29/day (`../15_operational-objectives-for-the-real-platform.md` §3);
  the one existing in-memory binding structure is already known to be lost on every one of them
  (`src/transport/http.ts:83`; `F-S15-3`).

**A concrete table is deliberately not named.** Naming one would be designing the propagation, which
is SUB-9's under OUT-12 and explicitly out of this sub-task's scope. The three properties are what
the signal actually depends on, and they are checkable against any store SUB-9 proposes.

### 3. The timing — one rule, idempotent

- **Evaluation instant.** The signal is evaluated at any instant `t ≥ deadline_at`. Before
  `deadline_at` it never fires, whatever the proof count.
- **Fire condition.** At any such `t`, the signal **fires** for a `propagation_id` when

  > `count(distinct copy_class where the proof is complete and non-null in all nine fields)`
  > **<** `the propagation's declared copy_class cardinality`.

- **Idempotence.** Evaluation may run any number of times and must return the same verdict for the
  same store state. It carries no memory of prior runs; the store is the only state.
- **A late proof closes; it does not un-fire.** A proof arriving at `t > deadline_at` raises the
  count and, once the count reaches the cardinality, the signal stops firing. It does **not**
  retroactively make the propagation timely — the fact that it was late is preserved by
  `emitted_at > deadline_at` on the proof itself, which is why field 7 is required.
- **No grace period is added.** `deadline_at` **is** the grace period; adding a second one would mean
  the deadline on the proof is not the deadline the signal enforces, and a reader could not tell
  which was real.

### 4. Negative clauses — what a conforming proof may **not** do

1. **May not rely on a caller-asserted identifier.** Not `session_id`, not `correlation_id`. Both are
   caller-controlled (`src/transport/audit-middleware.ts:94`–`:99`;
   `src/transport/http.ts:154`–`:157`) and are disqualified for the same reason they are disqualified
   as attribution carriers (`F-S16-1`, `DR-C11-S16-1` decision 3).
2. **May not live only in memory.** Location property (c).
3. **May not treat the absence of an error as evidence of completion.** The audit path drops entries
   silently — the circuit breaker discards the whole buffer with only a `stderr` line
   (`src/transport/pg-audit-transport.ts:83`–`:90`), and a batch that fails its `pool.query` is
   already out of the buffer (`:92`–`:93`) and is not retried. *Nothing went wrong* is not
   observable on this platform, so a proof must be a positive emission.
4. **May not omit a copy class because there was nothing to do.** A copy with no matching rows emits
   a proof with `action = not-applicable` and `rows_affected = 0`. The signal cannot distinguish
   *"nothing to do"* from *"nothing done"*, and it must not be asked to.
5. **May not be emitted before the action it proves is durable.** A proof written in the same
   uncommitted transaction as the action it describes, or before a commit, asserts something that may
   not survive.
6. **May not carry a `learner_key` that differs from the request's.** The signal attributes a stall
   to a learner; a mismatched key attributes it to the wrong one, which is the wrong-target failure
   OUT-2 names.

### 5. What this contract does not do

It does not design the propagation, enumerate the copy classes, set a value for `deadline_at`, or
choose the store. `deadline_at`'s **value** rests on a duty whose lawful basis is `OI-S3-1` (SUB-3's
record, cited not duplicated) and is SUB-8's to state under OUT-11. This contract fixes only that the
field exists, is non-null, and is carried on the proof.

## Rationale

**A reader holding only this record can say what a conforming proof looks like.** That is the whole
acceptance test this sub-task can honestly run at position 7, and every design choice above is made
to satisfy it. Nine named fields with types and meanings; three checkable location properties; one
fire condition written as an inequality; six negative clauses. Nothing in it says *"as SUB-9 shall
determine"*.

**Why the count is over distinct `copy_class` and not over proofs.** Counting proofs would let a
propagation satisfy the signal by emitting six proofs for one copy class. Counting distinct classes
against a declared cardinality is the only formulation where *partial* propagation — three of six
copies done — is detectable, and partial propagation is the realistic failure. The charter's § Risks
row `R2` names it
directly: erasure completing on paper while a copy survives.

**Why `rows_affected` is mandatory and `0` is legal.** This is the same distinction
`DR-C11-S2-2` made at the query layer when it required a `client` principal's learner access to be
**refused rather than empty-scoped**: an empty result and a refusal look identical unless the system
says which it was. Here, an absent `rows_affected` and `rows_affected = 0` look identical unless the
field is required. Making it required and permitting `0` is the same decision, one layer out, and
recording it that way is cheaper than re-arguing it.

**Why the deadline is carried on the proof.** The alternative is a lookup — the signal reads the
proof, then reads a policy table for the deadline. That introduces a second source that can drift,
and it makes the signal unevaluable for any propagation whose policy row was deleted. Carrying
`deadline_at` on the proof makes each proof self-describing, at the cost of denormalizing one value.

**Why a late proof closes rather than un-fires.** A signal that a late proof erased would let a
system be persistently late and never observably so. Preserving `emitted_at > deadline_at` means the
lateness is a queryable fact after the fact, which is what an incident review needs.

**Why the store is specified by properties rather than by name.** Naming a table would be the
propagation design, which is SUB-9's. Specifying properties gives SUB-9 full latitude and still gives
this contract something to be conformed to — and gives SUB-9's acceptance something mechanical to
assert the match against.

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **Define the signal as "no error observed by the deadline."** | Requires that errors are observable. On this platform they are not: the audit transport drops a full buffer on a circuit-open with only a `stderr` write (`src/transport/pg-audit-transport.ts:83`–`:90`) and loses a failed batch outright (`:92`–`:93`). A signal built on absence-of-error would read clean during exactly the outage that caused the stall. |
| 2 | **Store the proof in `operation_event_log`.** | Superficially the natural home — it is the existing event store. It fails location property (b): under `DR-C11-S16-2` that table is itself `learner-linked` personal data subject to the erasure being proved, so an erasure could delete its own proof. It also fails (a) in practice: the table has no `propagation_id` column and its only keys are `correlation_id` and `timestamp` (`drizzle/0013_create_operation_event_log.sql:4`, `:3`), and it is indefinitely retained with no bound. |
| 3 | **Let SUB-9 define the proof shape and have SUB-16 read whatever arrives.** | Reverses the direction the charter fixes for this pair, and would make SUB-16's acceptance depend on an artifact that does not exist at position 7 — the exact evaluation-direction violation the decomposition's standing rule sweeps for. |
| 4 | **Require only `propagation_id` and `completed_at`.** | The minimal shape, and it cannot distinguish complete propagation from partial. Six copy classes and one proof would satisfy it. It also gives a fired signal no learner, no action and no addressee. |
| 5 | **Make `rows_affected` optional.** | Collapses `0` and *absent* into one observation. See § Rationale; it is `DR-C11-S2-2`'s empty-versus-refused failure re-created in the proof record. |
| 6 | **Add a grace period after `deadline_at` before firing.** | Means the deadline carried on the proof is not the deadline enforced, so two numbers exist and a reader cannot tell which binds. If more time is wanted, `deadline_at` is the field to move. |
| 7 | **Name a concrete proof table and its DDL here.** | That is the propagation design, explicitly SUB-9's under OUT-12 and out of scope. It would also put a schema decision in a chapter that is forbidden to change `drizzle/`. |

## Consequences

1. **SUB-9 (NEU-1003) receives a conformable target** — nine fields, three location properties, one
   fire condition, six negative clauses — and its acceptance at position 11 asserts the match.
2. **SUB-12 (NEU-1004) receives a gate it can measure.** *"Every propagation emits a complete proof
   set by its deadline"* is now a checkable statement rather than an aspiration.
3. **The contract creates work that does not exist today.** No proof store exists, no
   `propagation_id` exists, and no propagation emits anything. That is named as a **missing
   emission** with an owner in `../16_attribution-and-detection.md` §4 rather than assumed available.
4. **A cost.** The nine-field shape is stricter than a first propagation implementation is likely to
   want, and requiring a `not-applicable` proof for every empty copy class means a propagation over
   six classes always writes six records even when five are no-ops. That is deliberate: the write
   volume is trivial and the alternative is a signal that cannot tell silence from success.
5. **`deadline_at` has no value yet**, and this record does not invent one. Until SUB-8 states it, the
   signal is fully specified and unevaluable — which is an honest state and is recorded as such in
   the detection matrix's threshold column rather than papered over with a default.

## Evidence

| Claim | Source |
| --- | --- |
| The audit transport drops its whole buffer on a circuit-open with only a `stderr` write, and loses a failed batch because the buffer is cleared before the query. | `src/transport/pg-audit-transport.ts:83`–`:90`, `:92`–`:93` |
| `session_id` and `correlation_id` are caller-asserted. | `src/transport/audit-middleware.ts:94`–`:99`; `src/transport/http.ts:154`–`:157`; `../91_findings-register.md` § `F-S16-1` |
| The one existing in-memory binding structure is process-local and lost on every restart. | `src/transport/http.ts:83`; `../91_findings-register.md` § `F-S15-3` |
| Restart cadence is ≥3.29/day over the most recent 7 days. | `../15_operational-objectives-for-the-real-platform.md` §2.2 (`C-17`) |
| `operation_event_log` is keyed only on `correlation_id` and `timestamp` and is indefinitely retained. | `drizzle/0013_create_operation_event_log.sql:3`, `:4`, `:14`, `:15`; `src/orchestration/topic-workflows.ts:585` |
| Both log tables are `learner-linked` personal data under the proposed attribution. | `DR-C11-S16-2_the-audit-log-privacy-determination.md` decision 1 |
| The learner key is the `sub` verbatim and `azp` is never a learner key. | `DR-C11-S2-1_the-persisted-learner-key.md` |
| An empty result and a refusal must be distinguishable. | `DR-C11-S2-2_principal-kind-and-the-service-principal-disposition.md` decision 3 and rejected alternative 5 |
| Erasure completing on paper while a copy survives is the charter's § Risks row `R2`. | C011 charter, § Risks (`_local/`, gitignored — quoted rather than cited as a resolvable path, per `DR-C11-S1-3` § Evidence). Its register entry is **SUB-9**'s to author, so no `R2` section exists in `../92_risk-register.md` at this cutoff. |
| The lawful basis a deadline would rest on is one question with one record, owned elsewhere. | `../93_open-items-and-provisional-register.md` § `OI-S3-1` |

## Revision trigger

1. **SUB-9 (NEU-1003) reports that a field, a location property or the fire condition cannot be
   conformed to** — the contract is amended here rather than diverged from silently.
2. **SUB-8 (NEU-1002) states a deadline policy** — `deadline_at` acquires a value and consequence 5
   discharges.
3. **A copy class is added or removed from SUB-9's matrix** — the declared cardinality changes and
   every open propagation's count is re-based.
4. **A proof store is chosen that fails one of the three location properties** — the choice is
   re-taken, or the property is amended here with its reason.
5. **`DR-C11-S16-2`'s determination is revised** — location property (b)'s ground changes with it.
