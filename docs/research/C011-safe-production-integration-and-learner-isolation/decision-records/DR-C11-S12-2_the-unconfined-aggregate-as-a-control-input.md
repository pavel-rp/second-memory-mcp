# `DR-C11-S12-2` — The unconfined aggregate as a control input, and the amendment it routes to `DR-C10-S5-1`

**Sub-task:** SUB-12 (NEU-1005) · **Covers:** OUT-17 · **Written:** 2026-08-26
**Model:** claude-opus-5[1m] · **Codebase cutoff:** `origin/develop` @ `57aeba3`
**Carried in:** `../12_threat-model-and-the-gates-that-authorize-implementation.md` §7, §10
**Registers:** `F-S12-1` (`../91_findings-register.md`); `GATE-S12-10`; `R-S12-4`

---

## Decision

**An unconfined aggregate consumed as a *control input* is a distinct failure mode from an unconfined
aggregate *disclosed as a result*, it is filed separately as `F-S12-1`, and it is routed as an
amendment to `DR-C10-S5-1` under that record's third revision trigger.**

Three clauses.

**Clause 1 — the finding is actuation, not disclosure.** `F-S5-9` establishes that
`Tier2BlockingStatsRepository` aggregates a table with no ownership key, so *"A `COUNT(*)` over an unconfined row set
discloses a true fact about another learner's data while returning no learner data at all"*
(`../05_the-enforcement-point-that-confines-every-read-and-write.md:592`–`:593`). That is correct and
it is about disclosure. This record is about what happens when the same aggregate is not returned to
anyone but is **consumed as the input to a control decision**: nobody learns anything about learner A,
and the system's behaviour toward learner B changes because of A.

**Clause 2 — the two are not closed by the same disposition, which is why one is not a note under the
other.** SUB-5 routes port 9 to C010's `CAP-S3-3` and `CAP-S4-1` — the log-table **retention and
deletion** caps, owner `NEU-986`, co-named `NEU-896`. Adding a retention bound or a deletion owner to
`infrastructure.operation_event_log` does nothing whatever about a breaker reading that table as a
control input. **A disposition aimed at the right table can still miss the failure mode.**

**Clause 3 — the amendment routes the finding and offers a suggestion, and does not rewrite C010's
procedure.** C010's isolation invariant is consumed as given (charter assumption 1). What is routed
is that trigger 3 fired and what fired it; the shape of any sixth check is `NEU-895`'s to decide.

## The mechanism, from four code facts

Each read at cutoff `57aeba3`.

1. **The aggregate carries no principal predicate.** `DrizzleTier2BlockingStatsRepository` aggregates
   `infrastructure.operation_event_log`, filtered to `event = 'classifier.tier2_blocked'` and bounded
   to `NOW() - INTERVAL '5 weeks'` (`src/adapters/drizzle/tier2-blocking-stats-repository.ts:39`–`:42`).
   The table has no learner column and the query has no learner predicate. The counts span every
   learner.
2. **The breaker is one per process, shared by every learner.** *"callers should create exactly one
   breaker per process and reuse it across requests"* (`src/orchestration/tier2-circuit-breaker.ts:59`).
3. **It trips on a threshold over those counts.** Per verdict field it computes `mean + 2σ` of prior
   weekly buckets and trips when the current week exceeds it (`:124`–`:128`; `SIGMA_MULTIPLIER = 2`
   at `:40`). The trip is one-shot per process and field, held in a `Set` cleared only by restart
   (`:65`–`:68`, `:148`–`:151`).
4. **A tripped field is removed from the blocking set for every subsequent caller.** `applyTo`
   returns the input set minus the tripped fields (`:182`–`:187`).

**The chain.** Learner A submits content rejected on field F, repeatedly. Those rejections are
counted in an aggregate that does not distinguish A from anyone else. When the week's count crosses
`mean + 2σ`, the breaker trips F. From that moment, for every other learner in the process, field F
stops blocking content creation — until the next restart.

## Why the five checks do not generate it

Run `DR-C10-S5-1`'s five ordered checks against the classifier's blocking behaviour and every one
passes or is silent: the category is in domain (`I1`); the acting principal is attributed (`I2`); no
row of A's is read by B, so confinement is not breached (`I3`); the behaviour is identical on both
transports (`I4`); the principal's provenance is intact (`I5`). **The procedure returns `holds` and
the failure is real.**

The five checks range over *which rows a principal may reach*. They have no limb for *shared derived
state that mediates between principals*. That is trigger 3 verbatim — *"a sixth failure mode is found
that none of I1–I5 detects"*
(`../../C010-system-and-repository-architecture/decision-records/DR-C10-S5-1_isolation-invariant-as-a-decision-procedure.md:165`–`:167`).

**A second item rides the same amendment.** The closed verdict set is six — `not-applicable`,
`not-evaluable`, `fails-confinement`, `fails-transport`, `fails-principal`, `holds` — and **none of
them means "confines too much"**. A category whose predicate excludes every row from every principal,
including the learner who created them, passes `I3` perfectly and reaches `holds`. SUB-5 named the
phenomenon as *"data loss by predicate"* and observed that *"a design that only checked for
over-exposure would score it as a success"*
(`../05_the-enforcement-point-that-confines-every-read-and-write.md:624`–`:629`). The procedure is
that design. SUB-5 could not route it — its remit was the enforcement point and nothing in its own
content contradicted the procedure, which is why it correctly recorded that no amendment was routed
(`:1284`–`:1285`). It takes running the procedure over *paths* rather than over one category for the
asymmetry to be visible.

## Severity, bounded honestly

**High, not critical.** Three bounds, stated rather than left to be discovered:

- **The harm weakens a quality gate rather than exposing data.** `applyTo` *shrinks* the blocking
  set. No learner reads another's content through this channel; the impact is on the integrity and
  availability of a control, not on confidentiality.
- **The window is bounded by restart cadence** — the trip set clears on restart, and the deployment
  restarts ≥3.29 times per day over the most recent 7 days (`C-17`,
  `../15_operational-objectives-for-the-real-platform.md` §2.2). **That is a dependency on an
  accident, not a control**, the same shape `R-S15-2` registers for the session maps, and it fails
  precisely when the deployment stabilises and stops shipping daily.
- **It requires volume, not privilege**, and **no number is offered for how much.** The arrival rate
  is unobserved, the prior-week distribution has never been seen, and `OI-S15-3` is SUB-15's distinct
  `t_db` question and is **not** claimed to answer this one. `SPK-S12-3` states the observation that
  would settle it and is recorded `not executed`.

Recording it as critical would overstate it. Recording it as medium would let it be deferred past the
gate that OUT-17 requires it to pass.

## Alternatives rejected

**A1 — File it as a note under `F-S5-9`.** Rejected: `F-S5-9`'s route is the log-table retention and
deletion caps, and that route does not close the actuation half (clause 2). A finding whose stated
disposition cannot resolve it is a finding that will be closed while remaining true.

**A2 — Route a revision to SUB-5 rather than an amendment to C010.** Rejected on two grounds. SUB-5's
chapter is merged and this package does not rewrite another sub-task's artifact; and the defect is
not in SUB-5's design, which correctly declares port 9 not confinable. The gap is in the *procedure*
that would score the category as `holds`.

**A3 — Treat it as an availability concern and route it to SUB-15.** Rejected: it is a cross-learner
effect, which is an isolation question by subject even though its impact is on a control. SUB-15's
objectives are about capacity and recovery, and there is no `OBJ-*` this would attach to.

**A4 — Propose the sixth check's exact wording and treat C010 as amended.** Rejected: `NEU-895` owns
`DR-C10-S5-1`. A suggestion is offered; the decision is not taken here.

**A5 — Wait for a production observation before filing.** Rejected: no production credential exists,
so the wait is unbounded, and the four code facts are readable today. The finding is about what the
deployment *permits*, which is a property of the code.

## Consequences

1. **`GATE-S12-10` is set on it**, with three admissible controls: confine the breaker's input to the
   acting principal, make the breaker per-learner rather than per-process, or fix the shrinkable field
   set by configuration rather than by a learner-influenced statistic. The threshold is a count of
   cross-learner control inputs; the target is zero and **today it is one**.
2. **Ownership is `NEU-896`'s at convergence**, co-named SUB-13 (NEU-1006) if the answer turns out to
   be schema-shaped. The breaker is a product-behaviour decision and not a confinement mechanism this
   package may redesign.
3. **`F-S9-6` becomes materially sharper**, and this is registered as `R-S12-4` rather than as a
   second copy of SUB-9's finding. A 30-day retention window truncates the breaker's prior-week
   buckets below the five weeks its arithmetic assumes, changing the mean, the σ and therefore when
   the breaker trips. A retention policy set for storage-limitation reasons silently retunes a
   production control.
4. **The amendment is the package's first.** Eleven chapters each recorded *"no amendment routed"*.
   The charter's inherited-universe risk requires that whether the route fired be reported
   (`01_charter.md:587`); it fired, and SUB-17 (NEU-1008) is the named recipient.

## The amendment, in the form SUB-17 consumes

| Field | Value |
| --- | --- |
| Record amended | `DR-C10-S5-1` |
| Trigger fired | Revision trigger 3 — *"a sixth failure mode is found that none of I1–I5 detects"* |
| Fired by | SUB-12 of C011 (NEU-1005), under OUT-17 |
| Items | **(1)** cross-learner actuation via shared derived state (`F-S12-1`); **(2)** the verdict set admits no over-confinement outcome |
| Suggested shape (not decided here) | **(1)** a sixth check between `I3` and `I4`: *does any control input to this category aggregate over more than one principal?* **(2)** a seventh verdict, `fails-availability-to-owner` |
| Routed to | **`NEU-895`**, owner of `DR-C10-S5-1`; co-named **`NEU-896`** |
| Recipient in this package | **SUB-17** (NEU-1008), which holds the inherited-universe risk record |
| Effect on C010's two zeros | The *"on neither list"* zero is **not** falsified — this is not a lost ownership question. What is affected is the cost `DR-C10-S5-2` states against itself at `:96`–`:99`: that a missing failure mode is inherited *"in exactly the same place"*. **That cost has now been incurred once, concretely** |

## Revision trigger

- `NEU-895` accepts, amends or rejects the routed amendment.
- The breaker's input acquires a principal predicate, or the breaker becomes per-learner, at which
  point `F-S12-1` resolves and `GATE-S12-10` closes.
- `SPK-S12-3` executes and establishes whether any field has ever tripped in production.
- The Tier-2 blocking mechanism is removed or replaced, at which point the finding is moot rather
  than resolved, and should be recorded as such rather than as a fix.
