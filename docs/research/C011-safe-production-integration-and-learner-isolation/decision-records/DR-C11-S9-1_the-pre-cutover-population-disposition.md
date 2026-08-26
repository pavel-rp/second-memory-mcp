# `DR-C11-S9-1` — The pre-cutover log population is disposed of by bulk deletion at archive close, under storage limitation rather than under per-request erasure

**Task:** NEU-1003 (SUB-9) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-26 · **Verification cutoff:** `ee0a750`, 2026-08-26
**Model:** claude-opus-5[1m]
**Discharges:** OUT-12 (`../90_outcome-register.md`) — the propagation action for the operational-log and audit-log columns; and `F-S8-2`'s stated resolving event

## Decision

**Clause 1 — the population.** The rows of `infrastructure.mcp_request_log` and
`infrastructure.operation_event_log` written before the attribution carrier lands. They carry
`principal_kind = 'none'` and no learner key, and no later process can supply one
(`../16_attribution-and-detection.md:279`–`:285`).

**Clause 2 — the disposition is bulk deletion.** The entire pre-cutover population is deleted in
one operation at the close of the archive `DR-C11-S6-2` creates. Not a per-learner delete; not a
sampled delete; not a delete predicated on any key. **The predicate is the archive's own boundary**
— every row in the archive is in the population, which is what `DR-C11-S6-2` bought by making the
set finite and closed.

**Clause 3 — the duty discharged is storage limitation, not per-request erasure.** The erasure duty
cannot be discharged over this population, because it is per-learner and no per-learner predicate
selects a row (`../91_findings-register.md:431`). The **storage-limitation** duty *can* be
discharged over it, because that duty is population-wide and a population-wide predicate exists.
Bulk deletion discharges the storage-limitation duty directly, and discharges the erasure duty over
the population **as a consequence** — a request cannot fail to reach a row that does not exist.

**Clause 4 — the justification `F-S8-2` says cannot be supplied is not supplied, and is not needed.**
`F-S8-2` audits the population as a *retention exception* and finds it fails two of the four fields
outright: no justification and no learner-scoped bound. This decision does not manufacture either.
It **removes the population from the class of things that need them**, by declining to retain it at
all. An exception needs a justification; a disposal does not.

**Clause 5 — the deadline.** The archive is created at cutover and deleted at the close of the
rollback window, which is SUB-7's (NEU-1001) to set under OUT-3/OUT-4. Where SUB-7 sets none, the
bound is **90 days after cutover**, carried as `A-S9-1` with an invalidating outcome. The deletion
is a single dated operation, not a policy.

**Clause 6 — this decision is not `DR-C11-S6-2`, and does not amend it.** SUB-6 decided *where the
rows live*; this decides *what a data right does to them*. `DR-C11-S6-2`'s `archive` is a value on
the **migration** axis; this decision's `delete` is a value on the **propagation** axis. The two are
different axes over the same rows (`../06_the-disposition-of-every-unowned-row.md:162`–`:176`), and
the archive is the precondition that makes this disposal bounded and safe, not a competing answer to
it.

**Clause 7 — the archive is not the discharge; this decision is.** `R-S6-1` registered the hazard
that a tidy archive reads as a resolution. It does not, and this record is the reason it need not:
the archive relocated, and this disposes.

## Rationale

**The two properties that made the population intractable are jointly why bulk deletion is both
available and cheap.**

SUB-8 established that the mechanism **under-reaches** the population: a
`DELETE … WHERE learner_key = $1` "returns success and a row count while the entire pre-cutover
population survives" (`../08_consent-and-what-a-learner-can-export-and-erase.md:441`–`:452`), and
SUB-8 refused to narrow the duty to fit the mechanism — "the duty covers both populations; only the
mechanism reaches one" (`:470`–`:472`).

SUB-5 established that confinement **over-reaches** it, in the opposite direction: a read predicated
on the ownership key excludes every unowned row from every principal, so "where erasure misses
pre-cutover rows, confinement **hides** them: they become unreachable to everyone, including the
learner who created them"
(`../05_the-enforcement-point-that-confines-every-read-and-write.md:616`–`:641`).

Read together these are not two problems but one asymmetry with a single exit:

1. **Un-erasability removes the alternative.** No per-learner predicate exists, and none can be
   built, so every disposition that operates per learner is unavailable *by construction*. The only
   predicates available over this population are population-wide ones.
2. **Invisibility removes the cost.** Once confinement lands, no learner can read these rows and no
   learner-facing feature depends on them. Their only remaining value is operational — and
   `DR-C11-S16-2` establishes that pre-cutover rows carry `principal_kind = 'none'`, so they cannot
   answer *"who did this"* for any row either. A population that nobody can see, that cannot be
   attributed, and that no feature reads has nothing weighing against its disposal.

The exposure and the remedy therefore have the same cause. That is what makes bulk deletion the
correct answer rather than the merely convenient one: the same boundary that makes the rows
un-erasable makes them worthless to retain.

**Why not the other two options `F-S8-2` admits.**

An **accepted named residual** leaves the erasure duty attached and undischarged over a live
population indefinitely. That is precisely "the silent indefinite retention OUT-11 exists to end",
and it converts a bounded migration artifact into a permanent one. `R-S6-1` anticipates this reading
and calls it "the correct outcome, but one that looks like completion"
(`../92_risk-register.md:562`–`:588`); this record disagrees on the first half. It is *an* outcome
that no rule forbids; it is not the outcome the charter's own constraint — "no silent indefinite
retention" — permits, once a disposal is available and cheap.

**Bulk anonymization** is rejected on a stronger ground than cost: it cannot be shown complete.
`response_body` is stored whole and unredacted, and the only redaction that has ever existed is a
credentials-only denylist (`src/shared/redact-params.ts:1`). Anonymizing this population means
identifying learner content inside arbitrary free text, and any residue that is missed is still
personal data sitting behind a claim that it was removed. An anonymization that cannot be proved
complete is worse than no anonymization, because it *asserts* a discharge it has not achieved —
which is the false self-certification this package has repeatedly produced. Deletion has no such
failure mode: an empty set is verifiable by counting it.

**What lifts `CAP-S7-1` (C010), and the extra condition nobody had discharged.**
`../../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md:283` names `NEU-893`
the owner of `CAP-S7-1` outright, and `:284` states its lifting condition: a named deletion owner on
`SC-S3-16` and `SC-S3-17` with a retention window, plus — for `SC-S3-17` specifically — a statement
of "what happens to a gate input, **which no party has yet done**."

That statement is made here, from the code rather than by assumption. The Tier-2 blocking gate reads
`infrastructure.operation_event_log` at
`src/adapters/drizzle/tier2-blocking-stats-repository.ts:39`, filtered to
`event = 'classifier.tier2_blocked'` (`:40`) and bounded to
`"timestamp" >= NOW() - INTERVAL '5 weeks'` (`:41`). Two independent consequences follow:

- **A retention window of ≥ 5 weeks leaves the gate input entirely intact**, because the gate's own
  query never reads a row older than that. The lower bound on the retention window is therefore not
  a policy preference — it is fixed at 5 weeks by the gate's `WHERE` clause. The window set in
  `../09_proving-a-data-right-reaches-every-copy.md` §7 is 90 days, comfortably above the floor.
- **The bulk deletion cannot affect the gate at all**, on a second and independent ground: it
  operates on the archive, and the gate queries `infrastructure.operation_event_log`. The archive is
  a different store by `DR-C11-S6-2`'s construction.

The gate's input is also not learner content — it reads `data->>'field'` on classifier telemetry
rows, not free text — so no part of the erasure duty attaches to what the gate actually reads.

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **Accepted and named residual** — keep the archive, name the exposure, accept it | Leaves the erasure duty attached and undischarged over a live population with no end date, which is the silent indefinite retention the charter's own constraint forbids. Available only if no disposal were available; one is, and it is cheap. |
| 2 | **Bulk anonymization** — strip learner-authored free text, keep the operational skeleton | Cannot be shown complete. `response_body` is stored whole and the only redaction ever written is a credentials denylist (`src/shared/redact-params.ts:1`). Any missed residue is personal data behind a claim of removal — a self-certification the evidence cannot support. |
| 3 | **Narrow the erasure duty to the attributable population** so the mechanism is complete by definition | Exactly what SUB-8 refused at `../08_consent-and-what-a-learner-can-export-and-erase.md:470`–`:472`. Redefining the duty to match the mechanism is the paper-completion failure `R2` names. |
| 4 | **Retroactively attribute the rows**, then delete per learner | Impossible, not merely hard. The only structure that ever held the binding is the process-local map at `src/transport/http.ts:83`, emptied by every restart at a measured ≥3.29/day. `../16_attribution-and-detection.md:279`–`:285` establishes the impossibility; a design that assumed otherwise would be asserting against a finding. |
| 5 | **Delete the live log tables at cutover instead of archiving first** | Removes SUB-7's rollback material and destroys the population before anyone has counted it. `DR-C11-S6-2` archived precisely so the set becomes finite and countable; deleting at cutover discards that and is unreversible if the migration reverses. |
| 6 | **Set the retention window below 5 weeks** to minimize retention aggressively | Would break the Tier-2 blocking gate, whose query reads a 5-week rolling window (`src/adapters/drizzle/tier2-blocking-stats-repository.ts:41`). Minimization does not license breaking a running gate; the floor is a code fact, not a preference. |
| 7 | **Leave the deadline unset** and let the implementation charter choose | Reproduces the unbounded-exception shape `F-S8-2` records. A disposal with no date is a retention with extra steps. |

## Consequences

1. **`F-S8-2` is downgraded from blocking to resolved**, on the finding's own stated resolving
   event: "SUB-9 publishes a disposition for the pre-cutover population — bulk deletion, bulk
   anonymization, or an accepted and named residual" (`../91_findings-register.md:436`). Bulk
   deletion is published here. **What is discharged is the design obligation, not the rows** — the
   execution is carried as `R-S9-1` with a named owner, because this package applies nothing.
2. **`R-S6-1`'s residual closes.** Its mitigation status records that "the only thing that actually
   closes it is SUB-9 publishing its disposition" and that "that residual's owner is SUB-9"
   (`../92_risk-register.md:586`–`:588`). The disposition is published and is **not** "accepted
   residual", so the specific misreading `R-S6-1` guards against does not arise. SUB-6's entry is
   **not edited**; the closure is recorded in this sub-task's own append.
3. **`CAP-S7-1` (C010) is discharged**, by supplying exactly the lifting condition
   `../../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md:284` names,
   including the gate-input statement it records as never made.
4. **`CAP-S3-3` and `CAP-S4-1` (both C010) are supplied-to, not absorbed.** The retention window,
   its 5-week code-derived floor and the deletion owner are designed here and handed to `NEU-986`
   (`SUB-12 of C010`), co-named `NEU-896`, whose ownership is unchanged
   (`../../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md:499`–`:500`).
5. **A-S8-1's re-validation trigger fires.** Its trigger is "SUB-9 (NEU-1003) publishes its
   completion-proof design with a copy-class cardinality"
   (`../95_stand-in-assumption-register.md:600`–`:608`). The cardinality is declared as **6** in
   `../09_proving-a-data-right-reaches-every-copy.md` §8.
6. **The 90-day bound is a stand-in, not a determination.** It is carried as `A-S9-1` and is
   subordinate to SUB-7's rollback window wherever SUB-7 sets one. No sibling's in-flight output was
   read to choose it.

## Evidence

| Claim | Source |
| --- | --- |
| Pre-cutover rows carry no key and can never be given one | `../16_attribution-and-detection.md:279`–`:285` |
| The binding structure is a process-local `Map`, emptied by every restart | `src/transport/http.ts:83` |
| A per-learner delete reports success while the population survives | `../08_consent-and-what-a-learner-can-export-and-erase.md:441`–`:452` |
| SUB-8 refused to narrow the duty to fit the mechanism | `../08_consent-and-what-a-learner-can-export-and-erase.md:470`–`:472` |
| `unreachable` is a real value in the erasure enum | `../08_consent-and-what-a-learner-can-export-and-erase.md:398` |
| Confinement hides the same rows from everyone — data loss by predicate | `../05_the-enforcement-point-that-confines-every-read-and-write.md:616`–`:641` |
| `archive` moves rows intact to a closed store, not deleted | `../06_the-disposition-of-every-unowned-row.md:175` |
| The migration axis and the erasure axis are different axes | `../06_the-disposition-of-every-unowned-row.md:162`–`:176` |
| All three of SUB-9's options survive the archive | `../06_the-disposition-of-every-unowned-row.md:311`–`:313` |
| SUB-6 neither discharges nor re-raises `F-S8-2` | `../06_the-disposition-of-every-unowned-row.md:337`–`:341` |
| `F-S8-2`'s finding text, owner and resolving event | `../91_findings-register.md:431`, `:435`, `:436` |
| `R-S6-1`'s residual is closed only by SUB-9 publishing a disposition | `../92_risk-register.md:586`–`:588` |
| `CAP-S7-1`'s owner is `NEU-893` outright | `../../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md:283` |
| `CAP-S7-1`'s lifting condition, incl. the undischarged gate-input statement | `../../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md:284` |
| `CAP-S3-3` / `CAP-S4-1` owner is `NEU-986`, co-named `NEU-896` | `../../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md:499`–`:500` |
| The Tier-2 gate reads `operation_event_log` | `src/adapters/drizzle/tier2-blocking-stats-repository.ts:39` |
| The gate filters to `classifier.tier2_blocked` | `src/adapters/drizzle/tier2-blocking-stats-repository.ts:40` |
| The gate reads a 5-week rolling window only | `src/adapters/drizzle/tier2-blocking-stats-repository.ts:41` |
| Redaction is a credentials-only denylist | `src/shared/redact-params.ts:1` |
| `A-S8-1`'s re-validation trigger is SUB-9's cardinality | `../95_stand-in-assumption-register.md:600`–`:608` |

## Revision trigger

- **SUB-7 (NEU-1001) publishes a rollback window.** Clause 5's 90-day default is superseded by it
  wherever the two differ; the default exists only because SUB-7 ships concurrently and its output
  was deliberately not read.
- **The archive is found to be non-empty of attributable rows** — i.e. the cutover boundary is not
  where `DR-C11-S6-2` places it. The population would then be mixed, and a per-learner delete would
  become partially available, changing the analysis in clause 3.
- **A learner-facing or operational feature is found to read the pre-cutover population.** Clause 3
  rests on the population having no remaining reader; a reader would restore a retention
  justification and reopen the choice.
- **The Tier-2 gate's window changes** at `src/adapters/drizzle/tier2-blocking-stats-repository.ts:41`.
  The 5-week retention floor is derived from that literal and moves with it.
- **A lawful-basis determination closes `OI-S3-1`** and fixes a statutory disposal period shorter
  than the rollback window, which would make clause 5's bound non-compliant rather than merely
  conservative.
