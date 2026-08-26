# `DR-C11-S7-2` — The deploy-independent disable path is an operator-set environment variable on the off-repo compose stack, and it costs one restart that re-runs the migrator

**Task:** NEU-1001 (SUB-7) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-26 · **Verification cutoff:** `ee0a750`, 2026-08-26
**Model:** claude-opus-5[1m]
**Discharges:** OUT-3 (`../90_outcome-register.md`) — the per-stage disable path independent of deploy, its control surface, its operator, its observability and its positions; and OUT-4's requirement that containment be separately exercisable from reversal

---

## Decision

1. **The control class is a server-held environment variable set on the off-repo compose stack** at
   `/home/deploy/docker-services/second-memory-mcp`, applied by the operator over SSH and taking
   effect on container restart. It is deploy-independent in the sense OUT-3 requires: it never
   traverses `git`, CI or the deploy pipeline.

2. **The toggle *shape* is the one the repository already has; the deploy-independent *application*
   of it is new.** `CLASSIFIER_ENABLE` (`src/config/resolve-classifier-config.ts:22`–`:62`) is an
   existing env-var toggle with a deprecated alias and explicit conflict detection, operated by
   `docs/runbooks/classifier-blocking-activation.md`. **That runbook is not a precedent for
   deploy-independence** — its emergency path is *"Set `CLASSIFIER_ENABLE=false` … immediately"*
   followed by *"`Deploy.`"* (`:261`–`:262`), and no path in it avoids a deploy. Applying the toggle
   over SSH to the off-repo compose stack, bypassing the pipeline, is **unprecedented here** and is
   specified rather than demonstrated.

3. **Six of the ten stages carry such a control; four carry a named exception with a reason and an
   owner.** The exceptions are `T0` (no runtime behaviour to disable), `T2` (the move can be paused
   but a moved row cannot be un-moved by a toggle), `T5` (irreversible by construction) and `T9` (a
   `NOT NULL` constraint is not toggleable; removing it is a migration). **Zero stages are blank.**

4. **Every application of the control costs one restart, and that restart re-runs the boot
   migrator.** This is stated as a property of the control class rather than a per-stage caveat,
   because it follows from the boot order and therefore holds for all six: configuration is resolved
   at `src/transport/main.ts:42`–`:43` and `src/composition-root.ts:379`, both **after**
   `await initializeDatabase()` at `src/transport/main.ts:27`.

5. **A pause therefore lands between batches, never during one.** On the two batched stages this
   makes `R-S6-2`'s batched-idempotent-resumable requirement a **hard obligation on SUB-13**, not a
   mitigation preference — a sweep that is not resumable cannot be paused by this control class at
   all.

6. **`T8`'s off position is recorded as unsafe rather than neutral.** Disabling the enforcement
   predicate returns the system to today's unconfined behaviour. It is a containment control against
   a regression, not a resting place, and the feature-control table says so.

7. **One control is pipeline-level and all-or-nothing, and is credited to no individual stage.**
   Disabling the `CD Prod` workflow in the GitHub Actions UI stops all deployment. It is a real
   deploy-independent control — the only one in this package needing no SSH — and it is recorded
   separately so that "every stage has a disable path" is not quietly satisfied by a switch that
   stops everything.

8. **This record names the controls. It does not build them.** No file under `src/` or `drizzle/`
   changes here; SUB-13 (NEU-1006) implements them, and until it does, every "off" position is a
   specification.

---

## Rationale

SUB-15's recovery tabletop already recorded the hard version of this problem: of six recovery rows,
four resolve to a capability the platform is not established to have, and the "stop the bleeding" row
found **no deploy-independent disable path established** at all. That is the position this decision
has to improve on, and the improvement has to be real rather than nominal, because charter assumption
45 is explicit that on a deployment where a schema change and its deployment are not separable
events, a stage whose only undo is a deploy has *no containment step between detection and reversal*.

The improvement available is smaller than the first draft of this record claimed, and the difference
matters. **The draft said the repository "already solved this once" and that the classifier
runbook "already distinguishes the immediate flip from the permanent deploy-borne change." It does
not.** That runbook's own emergency procedure is *"1. Set `CLASSIFIER_ENABLE=false` … immediately"*
followed directly by *"2. `Deploy.`"* (`docs/runbooks/classifier-blocking-activation.md:261`–`:262`),
and every other application point in it routes through a deploy (`:131`, `:137`, `:140`, `:185`).
The *"next deploy"* wording at `:167`/`:169` is about `CLASSIFIER_BLOCKING_FIELDS`, a different
variable from the one the sentence was about.

**What the precedent actually supplies is the toggle *shape*** — shipped code that reads a behaviour
switch from an environment variable at configuration-resolution time, with alias handling and
conflict detection, and an operator runbook that treats flipping it as a normal operation. That is
worth having: the disable paths specified here are an instance of a pattern this codebase already
runs, not an invention. **What the precedent does not supply is deploy-independence.** Applying the
toggle over SSH directly to the off-repo compose stack, bypassing the pipeline entirely, is
**unprecedented in this repository**, depends on a capability only the creator holds, and has never
been exercised. It is specified here on that footing, and `R4`'s mitigation says the same rather than
borrowing confidence the runbook does not lend.

**The cost had to be stated, not assumed away.** The obvious reading of "deploy-independent" is
"cheap", and on this platform it is not: configuration is read at boot, and boot runs the migrator
first. So the control is deploy-independent but not restart-free, and during a migration-bearing
stage it re-enters the migration it is being used to contain. Discovering that after writing ten
confident disable paths would have produced a chapter whose central feature-control claim was
unsound. It is registered as `F-S7-2` and it is why the rollback tabletop measures time bounds in
restarts rather than in seconds.

**Four named exceptions are the honest count.** OUT-3 permits a stage to carry an explicit named
exception with a reason and an owner, and forbids leaving one blank. Manufacturing a toggle for a
`NOT NULL` constraint or for a completed row-move in order to reach ten-out-of-ten would have been
the false-completeness failure the package has already been bitten by twice.

---

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **A database-backed feature-flag table**, read per request, so a flip needs no restart. | It is the only design that would make containment restart-free, and it is unavailable for the two stages that need it most: a flag read per request is read through the same `pg.Pool` whose `max: 4` is `OBJ-1`'s first scaling break, and during a boot migration the flag table may itself be mid-migration. It also invents a mechanism, which this sub-task is explicitly out of scope to build. |
| 2 | **Treat "revert the deploy" as the disable path.** | It is exactly what OUT-3's feature-control clause exists to reject. Reverting is reversal, not containment, and on this platform reverting a schema change is not available at all — there are no down-migrations (`../15_operational-objectives-for-the-real-platform.md` §5.1). |
| 3 | **Declare the GitHub Actions workflow toggle as each stage's disable path.** | It is a real control and it is recorded, but crediting it per stage would be false: it disables *deployment*, not the landed behaviour. After a stage has landed, disabling the workflow changes nothing about what the running container does — which is precisely the behaviour a disable path is supposed to stop. |
| 4 | **Give every stage a toggle, including `T5` and `T9`.** | A toggle over an executed `DELETE` and a toggle over a `NOT NULL` constraint are both fictions. OUT-3 permits a named exception with a reason and an owner, and using it is the accurate answer; a fabricated control would report ten-of-ten and mean less than four honest exceptions. |
| 5 | **Specify the control surface concretely — env var names, defaults, precedence.** | Attractive for SUB-13, but it is DDL-adjacent implementation detail and would pre-empt SUB-13's own design. It would also collide with `OI-S4-1`, which records that no configuration surface for the STDIO principal exists anywhere yet — naming one here would invent a fact rather than specify a class. |

---

## Consequences

1. **Containment on the two batched stages is a between-batches pause, not a stop.** SUB-13 must make
   the sweeps idempotent and resumable or the control does not work on them at all.
2. **Every time bound in the rollback tabletop is expressed in restarts and operator actions**, never
   in seconds, because the only quantity that would convert them — restart duration — is unobserved
   (`OI-S15-1`).
3. **Using a disable path during a migration-bearing stage consumes `OBJ-8` budget twice** — once for
   the restart that applies it and once for the restart that removes it — on a day that already
   carries that stage's own restart.
4. **The four named exceptions concentrate the rollout's irreversibility at `T5` and its
   un-containability at `T9`.** A reader can see at a glance which stages have no containment step,
   which is the point of naming them rather than leaving them blank.
5. **What becomes harder:** the operator now needs SSH access to the off-repo compose stack to
   operate any per-stage control. That is a real prerequisite the runbook must state, and it is a
   capability only the creator has.
6. **Nothing is verifiable until SUB-13 builds it.** Every position in the feature-control table is a
   specification, and the package must not be read as though the controls exist.

---

## Evidence

| Claim | Source |
| --- | --- |
| An env-var feature toggle with alias handling and conflict detection already exists | `src/config/resolve-classifier-config.ts:22`–`:62` |
| Its runbook's emergency path sets the toggle *"immediately"* and then **requires a deploy** — step 1 then step 2 | `docs/runbooks/classifier-blocking-activation.md:261`–`:262` |
| No path in that runbook is deploy-independent | `docs/runbooks/classifier-blocking-activation.md:131`, `:137`, `:140`, `:185` |
| The *"next deploy"* wording is about `CLASSIFIER_BLOCKING_FIELDS`, a different variable | `docs/runbooks/classifier-blocking-activation.md:167`, `:169` |
| Configuration is resolved at boot, after the migrator | `src/transport/main.ts:27`, `:42`–`:43`; `src/composition-root.ts:377`, `:379` |
| The migrator runs unconditionally with no guard and no lock | `src/infrastructure/db/migrate.ts:38`–`:50` |
| The compose stack is outside this repository | `.github/workflows/cd-prod.yml:15`, `:26`–`:30` |
| Unsetting `SMOKE_PROD_BASE_URL` fails the smoke job hard rather than skipping it | `.github/workflows/cd-prod.yml:140`–`:143` |
| No deploy-independent disable path was established at the platform level | `../15_operational-objectives-for-the-real-platform.md` §5.1 |
| `OBJ-1`'s pool of four is the first scaling break | `../15_operational-objectives-for-the-real-platform.md:248`; `src/infrastructure/db/client.ts:42` |
| Batching converts one long availability breach into several short ones, which is not "no breach" | `../92_risk-register.md:590`–`:618` (`R-S6-2`) |
| No configuration surface for the STDIO principal exists in the repository | `../93_open-items-and-provisional-register.md:333`–`:342` (`OI-S4-1`) |
| Every alert route is unconfirmed, so a control's state is observed by direct inspection | `../95_stand-in-assumption-register.md:498` (`A-S16-1`); `../92_risk-register.md:336` (`R-S16-2`) |

---

## Revision trigger

- **SUB-13 publishes the control surface** — concrete variable names, defaults and precedence. This
  record's class-level specification is superseded by that artifact for everything except the cost
  statement, which is a property of the boot order rather than of the naming.
- **A per-request configuration path is introduced** that does not read through the main pool. Then
  rejected alternative 1 becomes available and containment could be made restart-free, which would
  retire `F-S7-2`'s consequence for the two batched stages.
- **`OI-S15-1` closes** and restart duration is observed. Every time bound here can then be expressed
  in seconds and checked against `OBJ-8` directly rather than counted in restarts.
- **An alert or log-shipping channel is established** (`OI-S1-9` closes). The "observed how" column
  stops describing a computation the operator must run by hand and `A-S16-1` retires.
- **The compose stack is brought into the repository, or an IaC layer is introduced.** The control
  class changes entirely, because a configuration change would then traverse the pipeline and would
  no longer be deploy-independent.
