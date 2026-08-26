# `DR-C11-S13-3` — Six environment variables, each with its own safe position, and one of them is three-valued so the forbidden state is unreachable

**Task:** NEU-1006 (SUB-13) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-26 · **Verification cutoff:** `fd05ca1`, 2026-08-26
**Model:** claude-opus-5[1m]
**Discharges:** OUT-19 (`../90_outcome-register.md`) — the concrete control surface `DR-C11-S7-2`'s revision trigger names SUB-13 as publishing

---

## Decision

1. **Six variables cover the stages SUB-7 credits with a real control** — four behaviour toggles plus
   two numeric parameters of the sweep, serving `T1`, `T2`'s in-flight move, `T3`, `T4`, `T6`, `T7`
   and `T8`. *(The table below has six rows and SUB-7 credits six stages; the two counts coincide and
   are **not** a one-to-one mapping — two toggles each serve more than one stage, and the two numeric
   parameters disable nothing on their own.)* The four stages SUB-7
   gives a named exception get none, because manufacturing one would be the false-completeness failure
   `DR-C11-S7-2` rejected in its own alternative 4.

   | Variable | Stages | Values | Default |
   | --- | --- | --- | --- |
   | `SM_ISOLATION_CARRIER_WRITE` | `T1` | `on` \| `off` | `on` |
   | `SM_MIGRATION_SWEEP` | `T2`, `T3`, `T7` | `run` \| `pause` | `run` |
   | `SM_MIGRATION_SLICE_MS` | `T2`, `T3`, `T7` | positive integer | `5000` (`A-S13-1`) |
   | `SM_MIGRATION_SLICE_ROWS` | `T2`, `T3`, `T7` | positive integer | `10000` (`A-S13-1`) |
   | `SM_IDENTITY_GATE` | `T4`, `T6` | `off` \| `observe` \| `enforce` | `off` |
   | `SM_ADAPTER_CONFINEMENT` | `T8` | `on` \| `off` | `on` |

2. **The safe position on an unparseable value differs per control, and there is deliberately no
   global rule.** `SM_MIGRATION_SWEEP` falls to `pause`; `SM_IDENTITY_GATE` falls to `observe`;
   `SM_ADAPTER_CONFINEMENT` and `SM_ISOLATION_CARRIER_WRITE` fall to `on`; the two numeric parameters
   fall to their defaults. A uniform *"default to off on a parse error"* would fail **open** on
   `SM_ADAPTER_CONFINEMENT`, which is the one control where failing open is the failure the package
   exists to prevent.

3. **`SM_IDENTITY_GATE` is one three-position variable rather than two booleans.** SUB-7 requires
   `T6`'s off position to be *"observe-only, **not** open"*. Two booleans admit
   `enforce=off, observe=off`, reachable from `T6` by one operator action — the open position SUB-7
   forbids. Three ordered positions make it unreachable by construction rather than by procedure.

4. **`SM_MIGRATION_SWEEP` is one variable rather than one per stage**, because `T3` and `T7` are four
   stages apart and never run concurrently, so which sweep is paused is never ambiguous.

5. **Precedence follows the shape the repository already runs.** An explicitly set value wins; unset
   takes the default; an unrecognised value takes clause 2's per-control safe position **and logs at
   warn**, mirroring `CLASSIFIER_ENABLE`'s conflict detection at
   `src/config/resolve-classifier-config.ts:22`–`:62`. No alias is defined for any of the six: there
   is no deprecated predecessor to be compatible with.

6. **Every application costs one restart, and that restart re-runs the boot migrator.** This is
   `F-S7-2`, re-verified here: configuration resolves at `src/transport/main.ts:42`–`:43` and
   `src/composition-root.ts:379`, both after `await initializeDatabase()` at
   `src/transport/main.ts:27`.

7. **This record names and specifies the controls. It does not build them.** No file under `src/`
   changes. Until the implementation charter builds them, **every position above is a specification**,
   and the runbook says so at each use.

---

## Rationale

`DR-C11-S7-2` deliberately declined to specify this surface, on the grounds that doing so *"would
pre-empt SUB-13's own design"* and would collide with `OI-S4-1`, which records that no configuration
surface for the STDIO principal exists anywhere yet. Its revision trigger is explicit: *"SUB-13
publishes the control surface — concrete variable names, defaults and precedence."* This is that
publication, and it is careful to publish only what OUT-19 owns — a control surface for the ten
rollout stages — and not a configuration surface for the STDIO principal, which remains `OI-S4-1`'s.

**The precedent supplies the shape and nothing else, and that has to be said plainly because the
opposite was drafted once and corrected.** `CLASSIFIER_ENABLE` is a real, shipped env-var toggle with
alias handling and conflict detection, read at configuration-resolution time. Its runbook's emergency
procedure is *"1. Set `CLASSIFIER_ENABLE=false` … 2. `Deploy.`"*
(`docs/runbooks/classifier-blocking-activation.md:261`–`:262`), re-read at this cutoff and confirmed.
**No path in that runbook avoids a deploy.** So what these six variables inherit is a pattern the
codebase already runs; what they add — applying the value over SSH directly to the off-repo compose
stack, bypassing the pipeline — is unprecedented here, depends on a capability only the creator has,
and is specified rather than demonstrated.

**The per-control safe position is the part most likely to be got wrong by a uniform rule.** It is
natural to write "unknown value ⇒ treat as disabled" once and apply it everywhere; it reads as
conservative. It is conservative for a migration sweep, where not running is safe, and it is the
opposite for the enforcement predicate, where not running returns the system to today's unconfined
behaviour — the state the whole package exists to end. The two controls have opposite safe
directions, so a single default cannot serve both, and stating that explicitly is cheaper than
discovering it during an incident.

**`SM_IDENTITY_GATE`'s three positions do real work.** SUB-7's feature-control table says `T6`'s off
position is *"Gate reverts to observe-only, **not** to open"*. Expressed as two booleans that is a
procedural promise: the operator must remember to set one while unsetting the other, at 3 a.m.,
over SSH. Expressed as one ordered variable it is a type: `off`, `observe` and `enforce` are the only
three states, `T6`'s containment is one step down the ladder, and the open-after-enforce state is not
spellable. This is the same move as `DR-C11-S13-1`'s generated column — take a rule that a human must
remember and make it a property of the artifact.

**Four stages get nothing, and that is the honest count.** `T0` has no runtime behaviour; `T2`'s
completed move cannot be un-moved by a toggle (though the move *in flight* is paused by
`SM_MIGRATION_SWEEP`, which is why `T2` appears in the table and still carries an exception); `T5` is
irreversible by construction; `T9`'s product is a schema constraint, and a constraint is not
toggleable. Inventing a control for any of them to reach ten-out-of-ten would report more and mean
less.

---

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **A database-backed feature-flag table read per request, so a flip needs no restart.** | The only design that makes containment restart-free, and `DR-C11-S7-2` already rejected it: the flag would be read through the same `pg.Pool` whose `max: 4` is `OBJ-1`'s first scaling break, and during a boot migration the flag table may itself be mid-migration. It also invents a mechanism this sub-task is out of scope to build. Re-stated here rather than silently inherited, because it is the alternative a reader will think of first. |
| 2 | **One global `SM_ISOLATION_ROLLOUT` variable with a stage number.** | Fewer variables, and it couples every control to a single value, so containing one stage means asserting a position on all of them. It also makes the six controls' independent lifetimes — `SM_MIGRATION_SWEEP` matters at three separated stages — unexpressible. |
| 3 | **Two booleans for the gate: `SM_IDENTITY_GATE_OBSERVE` and `SM_IDENTITY_GATE_ENFORCE`.** | Admits the state SUB-7 forbids (`T6` contained all the way to open) and makes the forbidden state one operator slip away. Clause 3. |
| 4 | **A uniform "unrecognised value ⇒ off" rule across all six.** | Fails open on `SM_ADAPTER_CONFINEMENT`. The whole point of a fail-closed default is lost if the failure direction is chosen for uniformity rather than per control. Clause 2. |
| 5 | **Per-stage sweep toggles: `SM_MIGRATION_SWEEP_T2`, `_T3`, `_T7`.** | More precise and unnecessary: the three stages are separated in the order and never run concurrently, so there is never an ambiguous target. Three variables that can disagree, to disambiguate a case that cannot arise. |
| 6 | **Reuse `CLASSIFIER_ENABLE`'s alias-plus-deprecation machinery for the new variables.** | There is nothing to be compatible with — these six do not exist yet, so they have no deprecated predecessor. Copying the machinery would import a maintenance obligation for a migration that never happened. |
| 7 | **Credit the `CD Prod` workflow toggle as each stage's disable path.** | `DR-C11-S7-2` rejected it and this record keeps the rejection: it disables *deployment*, not the landed behaviour, so after a stage has landed it changes nothing about what the running container does. It is recorded separately as the all-or-nothing master switch, credited to no stage. |

---

## Consequences

1. **`DR-C11-S7-2`'s revision trigger fires.** Its class-level specification is superseded by this
   record for the naming, defaults and precedence, and **not** for the cost statement, which is a
   property of the boot order and stands unchanged.
2. **The operator needs SSH to an off-repo host for every one of the six.** That is a real
   prerequisite the runbook states, and it is a capability exactly one person has. `R-S13-2`.
3. **Containment on `T2`, `T3` and `T7` is a between-batches pause**, and the restart that applies the
   pause gives the sweep one more slice first. Self-referential, stated, and the reason
   `DR-C11-S13-2`'s time box is per-boot rather than per-sweep.
4. **Using a control during a migration-bearing stage spends `OBJ-8` budget twice** — once for the
   restart that applies it and once for the restart that removes it — on a day that already carries
   that stage's own restart. `DR-C11-S7-2` consequence 3, unchanged.
5. **Six specifications, zero implementations.** Nothing here is verifiable until the implementation
   charter builds it, and the package must not be read as though the controls exist.
6. **What becomes harder:** six variables is six things to get wrong in a compose file, and there is
   no mechanism that validates the set. A misspelled variable name is indistinguishable from an unset
   one, and takes the default silently — which for five of the six is the *on* position.

---

## Evidence

| Claim | Source |
| --- | --- |
| SUB-13 publishes the control surface — names, defaults, precedence | `DR-C11-S7-2_the-deploy-independent-disable-path.md`, Revision trigger |
| Specifying it here was declined so as not to pre-empt SUB-13, and to avoid colliding with `OI-S4-1` | `DR-C11-S7-2_the-deploy-independent-disable-path.md`, rejected alternative 5 |
| Six stages carry a real control; four carry a named exception; zero are blank | `DR-C11-S7-2_the-deploy-independent-disable-path.md` clause 3; `../07_the-rollout-sequence-and-what-each-stage-cannot-undo.md:445`–`:459` |
| `T6`'s off position is observe-only, **not** open | `../07_the-rollout-sequence-and-what-each-stage-cannot-undo.md:453` |
| `T8`'s off position is today's unconfined behaviour, not a resting place | `DR-C11-S7-2_the-deploy-independent-disable-path.md` clause 6 |
| An env-var toggle with alias handling and conflict detection already exists | `src/config/resolve-classifier-config.ts:22`–`:62`; resolved once at `src/composition-root.ts:379` |
| Its runbook's emergency path sets the toggle and then requires a deploy | `docs/runbooks/classifier-blocking-activation.md:261`–`:262` |
| Configuration is resolved at boot, after the migrator | `src/transport/main.ts:27`, `:42`–`:43`; `src/composition-root.ts:379` |
| The migrator runs unconditionally with no guard and no lock | `src/infrastructure/db/migrate.ts:45`–`:49` |
| The compose stack is outside this repository | `.github/workflows/cd-prod.yml:15`, `:26`–`:30` |
| A per-request flag would read through the pool whose `max: 4` is `OBJ-1`'s first scaling break | `src/infrastructure/db/client.ts:42`; `../15_operational-objectives-for-the-real-platform.md:248` |
| No configuration surface for the STDIO principal exists anywhere yet | `../93_open-items-and-provisional-register.md` § `OI-S4-1` |

---

## Revision trigger

- **The implementation charter builds the six controls.** Every position here stops being a
  specification, and the runbook's per-stage containment sections become testable for the first time.
- **A per-request configuration path is introduced that does not read through the main pool.**
  Rejected alternative 1 becomes available and containment could be made restart-free.
- **`OI-S4-1` closes** and a configuration surface for the STDIO principal is defined. It may
  subsume or collide with `SM_IDENTITY_GATE`'s STDIO limb; whichever, the two must be reconciled by
  the owner of `OI-S4-1`, not here.
- **A stage is added to or removed from SUB-7's order.** Clause 1's six-and-four split is recounted;
  it is not arithmetic on ten but a mapping onto SUB-7's own feature-control table.
- **The compose stack is brought into the repository, or an IaC layer is introduced.** The control
  class changes entirely — a configuration change would then traverse the pipeline and would no
  longer be deploy-independent at all.
