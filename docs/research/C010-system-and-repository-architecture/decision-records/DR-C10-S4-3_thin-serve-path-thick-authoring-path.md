# `DR-C10-S4-3` — A thin serve path and a thick authoring path

**Task:** NEU-974 (SUB-4) · **Charter:** C010 (umbrella NEU-895) · **Decided:** 2026-08-21
**Model:** claude-opus-5[1m]
**Discharges:** `OUT-1` (content-orchestration placement) and `OUT-9`'s placement half
**Applied in:** `../05_system-context-and-responsibility-boundaries.md` §7

---

## Decision

**The full quality-gate battery runs at authoring time. Exactly one gate sits at serve time, and it is a
single keyed cache read.**

- Authoring path: `CMP-S4-13` (authoring pipeline) → `CMP-S4-14` (quality-gate battery) → `CMP-S4-15`
  (authoring-time gate runner). Every content gate except the citation-drift check is evaluated here, and
  every gate that needs to *execute* anything executes here, inside `CMP-S4-15`'s terminable isolate.
- Serve path: `CMP-S4-16` (content serve path) performs **one keyed read** of `CMP-S4-18` (drift-verdict
  cache) and applies the four-row disposition — quarantine on `blocked`, on `quarantined`, on a **stale**
  verdict and on an **absent** verdict; serve otherwise. **The learner's request always completes**;
  quarantine changes what is served, never whether the request resolves.
- `CMP-S4-16` carries **no reviewer, no model call and no execution**, and has **no egress**. Its entire
  gate surface is that one read.
- **Stale-or-absent is the serve path's ordinary operating mode**, not its exceptional one, because the
  per-source revalidation budget is zero. A serve path that is only correct when a fresh verdict exists is
  mis-built.

## Rationale

The criteria and their weights, fixed **before** any option was scored:

| # | Criterion | Weight |
| --- | --- | --- |
| C1 | The learner's request must always complete. | **decisive** |
| C2 | No component on the learner's latency path may have egress to a party outside the operator's control. | **decisive** |
| C3 | A gate whose verdict can only be produced out of band must not be evaluated inline. | high |
| C4 | The serve path must be correct in its **ordinary** mode — which, at a revalidation budget of zero, is stale-or-absent. | high |
| C5 | No gate may need two implementations, one per path. | medium |

**Why the split falls where it does.** Almost every content gate is a property of the *unit*: it can be
settled once, at authoring time, and stays settled until the unit changes. The citation-drift check is the
one exception, and the reason is specific rather than incidental — **drift is a property of the world, not
of the unit.** An external source page can move, change or disappear at any time after authoring, so no
authoring-time evaluation can be relied on indefinitely; `../03_…` §4.2's ninety-day staleness window is
exactly that admission. That single asymmetry is what forces one gate — and only one — to the serve side.

Given that one gate must exist at serve time, C1 and C2 jointly determine what it may be. It cannot fetch
(C2 forbids egress on the latency path, and `CMP-S4-17` is specified as the *only* component with egress
outside the operator's control). It cannot compute a verdict from a fetch it did not make. What remains is
a read of something another component already wrote — which is precisely `CMP-S4-18`, and precisely why
SUB-2 specified the cache as internal, keyed-read-only, and forbidden from deriving, refreshing or ageing
a verdict.

C4 is the criterion most likely to be overlooked and is stated explicitly for that reason. With a
per-source revalidation budget of zero, the *normal* state of a citation is that its verdict is stale or
was never produced. A design that treats those two rows as exceptions has built a gate that fires on
almost every serve — which is not a bug in the gate but a misreading of the budget.

The browser exclusion in `../05_…` §6.3 R-4 is the same argument reaching the trust split: a quarantine
decision is gate-bearing, and under **`A-27`** the browser holds nothing gate-bearing, so the cache read
cannot move client-side under any rendering model.

## Rejected alternatives

| Alternative | The specific consequence that decided against it |
| --- | --- |
| **Run every gate at serve time.** | Violates C2 immediately — the drift check needs egress — and C1, because a gate that may have to fetch an external page cannot bound the learner's latency. It also multiplies every gate's cost by the number of serves rather than the number of authorings. |
| **Run every gate at authoring time and none at serve.** | This is the alternative that looks cleanest, and it is wrong for one specific reason: a citation that drifts *after* authoring would be served indefinitely, and `../03_…` §4.2's ninety-day staleness window would be unenforceable — a published constraint with no component able to honour it. |
| **A serve-time drift check that fetches on a cache miss.** | Puts egress directly on the learner's latency path (C2), and at a per-source revalidation budget of zero it would fetch on essentially every serve (C4) — converting a cache into a synchronous crawler. |
| **A serve-time check that serves on a miss (fail-open).** | At budget zero, stale-or-absent is the ordinary state, so the gate would exist and never fire. A gate that is structurally guaranteed not to fire is worse than no gate: it reads as coverage. |
| **A serve-time check that blocks the request until a verdict arrives.** | Violates C1 outright. The four-row disposition deliberately quarantines the *unit* rather than stalling the *request*. |
| **Duplicate the battery at both ends, so either path can gate.** | Fails C5 and doubles the surface on which two implementations can disagree about the same unit — which is the divergence this package exists to prevent, reproduced inside a single sub-system. |
| **Let the browser read the cache and decide whether to display.** | The quarantine decision is gate-bearing, so this violates `../05_…` §6.1 and the R-4 constraint handed to `SUB-15 (NEU-982)`. Under **`A-27`** the browser holds nothing gate-bearing under any rendering model. |
| **Fold `CMP-S4-18` into `CMP-S4-17`, so the serve path reads the producer's own store.** | Puts the serve path's latency behind a component that is specified to be out of band, and merges two state categories (`SC-S3-33`, `SC-S3-34`) that `../04_…` §9 records as distinct and written by different components. `F-S2-2` warns against exactly this merge. |

## Consequences

- **`CMP-S4-16` is committed to being genuinely thin.** It can be built with no model client, no sandbox,
  no reviewer and no network egress. Any charter that adds one of those to the serve path is contradicting
  a published decision, not making a local implementation choice.
- **Any future serve-time gate owes an argument against C1–C4.** The default answer for a new gate is
  "authoring time"; the burden of proof sits with the exception.
- **The out-of-band producer's availability becomes a content-availability problem, not a latency
  problem.** If `CMP-S4-17` stops producing, units quarantine; requests do not hang. That is the intended
  failure mode and it is the reason the boundary between them (`BND-S4-10`) is classified `process`.
- **What this makes more expensive:** content freshness. Every unit whose verdict is stale is quarantined,
  and at budget zero that is most of them — so the cost of this decision is paid in served-content volume,
  and it is paid deliberately.
- **It records, and does not bless, today's post-commit Tier-2 shape.** `runTier2AuditPostCommit`
  (`src/orchestration/audit-pipeline.ts:174`) means part of the battery's verdict lands after the unit is
  written; that is why `BND-S4-15` is a process boundary. A charter that makes a *blocking* gate depend on
  a post-commit pass owes an explanation.
- **Migration path:** none. Neither the isolate runner, the full gate set nor the serve-time cache read
  exists at this cutoff; this decision constrains what gets built rather than moving what exists.

## Evidence

- `../03_execution-environment-and-citation-drift-component.md` §3.5 (the gate runner: authoring-time
  trigger, no egress, terminable isolate under a host-enforced wall-clock bound), §4.2 (the producer:
  exactly one request per citation, corpus walk prohibited, ninety-day staleness window, per-source
  revalidation budget zero), §4.3 (the cache: internal, no egress, keyed read only, never derives,
  refreshes or ages), §4.4 (the four-row quarantine table), §5 (the three inherited egress constraints) —
  NEU-972, merged 2026-08-21. Consumed unchanged.
- `../04_state-category-inventory.md` `SC-S3-33`, `SC-S3-34`, `SC-S3-35`, and §9's statement that they are
  three categories written by different components — NEU-973, merged 2026-08-21.
- `../02_findings-register.md` `F-S2-2` — the explicit hand-off to `SUB-4 (NEU-974)` instructing that the
  gate runner and the egress producer must not be merged.
- `src/orchestration/audit-pipeline.ts:94` (`runTier1Audit`), `:129`–`:137` (the tier1a/tier1b split),
  `:174` (`runTier2AuditPostCommit`), `:165`–`:191` (fail-open on the Tier-2 circuit breaker) — the
  partial battery that exists at the 2026-08-21 cutoff.
- `src/orchestration/teaching-workflows.ts` — the serve reads that exist today, none of which performs a
  drift-verdict read.
- `../93_stand-in-assumption-register.md` **`A-27`** — named in the Rationale, carrying the browser
  exclusion.

## Revision trigger

Either of these **observable events** reopens this record:

1. **NEU-890's per-source revalidation budget being published as non-zero for any source.** That moves
   stale-or-absent from the ordinary path to the exceptional one, and reopens the two alternatives —
   fetch-on-miss and fail-open — that were rejected specifically because the budget is zero.
2. **A published requirement for a serve-time gate whose verdict cannot be produced by a keyed read of
   state another component already wrote.** That is the event that would force something other than a
   cache read onto the serve path, and it invalidates the C1/C2 reasoning that made the serve path thin.
