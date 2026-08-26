# `DR-C11-S7-1` — The rollout is ten stages in one total order, with the transport gate's observe-only stage placed before the only irreversible stage

**Task:** NEU-1001 (SUB-7) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-26 · **Verification cutoff:** `ee0a750`, 2026-08-26
**Model:** claude-opus-5[1m]
**Discharges:** OUT-3 (`../90_outcome-register.md`) — the ordered sequence by which isolation reaches production, and the audit that the transport gate is not last

---

## Decision

1. **The rollout is a single total order of ten stages, `T0` … `T9`**, composed from the four partial
   orders the predecessors hand forward. Each stage carries an entry condition, an exit condition, a
   measurable isolation signal, a health signal and a named owner.

   | | Stage |
   | --- | --- |
   | `T0` | Dispose of the deploy pipeline's smoke run |
   | `T1` | Land **SUB-2's identity rule** and the attribution carrier |
   | `T2` | `S1` — archive the pre-cutover log population |
   | `T3` | Additive schema, nullable: gate stage `A` **and** `S3` |
   | `T4` | Gate stage `B` — observe-only on both transports |
   | `T5` | `S2` — purge `context_tokens` |
   | `T6` | Gate stage `C` — enforce |
   | `T7` | `S4` — backfill, in `§9.3`'s four waves |
   | `T8` | Enforcement point live at the Drizzle adapter |
   | `T9` | Tighten: `S5`, gate stage `D`, and the carrier's constraint |

2. **The principal-kind defect is surfaced by an observe-only stage, not by enforcement.** `T4`
   records what *would* be refused and refuses nothing. This is the instrument C010 §4.3's
   consequence calls for, and it is placed at position 5 of 10.

3. **`T4` precedes `T5`, and `T5`'s entry condition requires `T4`'s observation to have been read.**
   `T5` is the only stage in the sequence that destroys state. Gating it on the *evidence* rather
   than merely ordering it after the stage is what discharges the irreversibility concern — **which
   is the charter's § Risks row 3, this package's `R3`, and not C010 §4.3.** §4.3's own words are
   *"will discover the principal-kind problem at the end"*; it says nothing about irreversibility,
   and an earlier draft of this record attributed the § Risks wording to it in quotation marks. The
   two are now carried as separate constraints, `K9` and `K12`.

3a. **SUB-2's identity rule lands at `T1`, with the carrier.** `principal_kind` *is*
   `DR-C11-S2-2`'s determined kind, so a carrier landing before the determination has no correct
   value to write. The first draft of this order **presupposed the determination at `T1`, `T6` and
   `T8` without staging it**; `K11` and this clause exist because an independent adversarial pass
   caught that omission.

4. **`T0` is a stage, not a prerequisite note.** `R-S4-2` offers three mutually exclusive routes for
   the smoke run and one must be *chosen*; making it a stage with an entry condition means the choice
   cannot be made by omission. It is placed first, six stages before the earliest stage that breaks
   the suite, so all three routes are still open when it is taken.

5. **Two pairs of stages are deliberately merged to spend one restart instead of several.** `T3`
   combines gate stage `A` with `S3` — both are pure nullable additions with no refusal behaviour.
   `T9` combines `S5`, gate stage `D` and the carrier's tightening — three constraint additions, none
   of which changes behaviour. Every merge is between stages that are already adjacent in the
   constraint graph and that share a boot migration.

6. **The backfill precedes the enforcement point.** `T7` before `T8`, so the predicate goes live over
   a population that already carries an owner. The reverse order would confine a partly-NULL
   population, which is `R-S5-1`'s exact failure mode.

7. **The transport gate precedes the enforcement point.** `T6` before `T8`, on SUB-5's own argument
   that an adapter-level refusal *"fails it inside the adapter where the failure is harder to
   attribute"* (`../05_the-enforcement-point-that-confines-every-read-and-write.md:1217`–`:1221`).

---

## Rationale

No predecessor could have produced this order, and each says so. SUB-4 states its four-stage set is
compatible with §4.3 and that *"Whether the schedule SUB-7 builds honours it is SUB-7's audit"*
(`../04_the-stdio-identity-gate-and-the-bound-context-token.md:452`–`:454`). SUB-6 registers `A-S6-2`
precisely because *"Sequencing is SUB-7's under OUT-3 and is **not fixed here**"*
(`../06_the-disposition-of-every-unowned-row.md:274`–`:279`). SUB-5 hands its nullability constraint
forward as *"a rollout fact"* belonging to OUT-3.

The composition is therefore the work, and it is done as an explicit constraint-satisfaction rather
than a narrative: twelve constraints `K1` … `K12` are enumerated with their sources, the order is
proposed, and the order is audited against each constraint in turn. Twelve of twelve are satisfied.

**Why observe-only is the load-bearing choice.** C010 §4.3's consequence is easy to satisfy
superficially — put the gate anywhere but last — and that satisfies the letter while missing the
point, because a gate placed early *in enforcing form* breaks the deploy pipeline early and forces
the operator to choose between reverting it and proceeding blind. Observe-only dissolves the
dilemma: it produces exactly the evidence §4.3 wants (what the `sub`/`azp` distribution actually is
in production) at zero refusal cost, and SUB-4 already designed it and already stated it is *"not a
permissive mode"* (`../04_the-stdio-identity-gate-and-the-bound-context-token.md:435`–`:436`). The
decision here is to make that stage's *output* the entry condition of the irreversible stage, which
is what converts an ordering into a guarantee.

**Why `T0` is first even though it does not block execution.** `F-S7-1` establishes that the smoke
job runs after the deploy (`.github/workflows/cd-prod.yml:110`–`:111`), so a broken suite does not
prevent later stages from landing. `T0` is nonetheless first because every later stage is *watched*
through the signal it breaks, and because two of `R-S4-2`'s three routes stop being available once
the enforcement stages have landed and the operator is mid-incident.

---

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | **Follow SUB-6's `S1`–`S5` as the spine and slot the gate stages around it.** | It has no place for observe-only, because SUB-6's set contains no observation stage. The earliest the principal-kind defect could then surface is gate stage `C`, which is enforcing — so the defect and the breaking change arrive together, and the operator learns about the defect from an outage rather than from a record. It also puts `S2`, the irreversible purge, at position 2, before anything has been observed at all. |
| 2 | **Put the transport gate first, enforcing, to honour §4.3 as literally as possible.** | Satisfies the letter and breaks the pipeline before any of the migration work has started, with `F-S5-12`'s second cause still unlanded — so the operator debugs a broken deploy gate for the entire remainder of the rollout, and `SIG-S16-4` is dark from stage 1 rather than from stage 7. §4.3 asks that the defect not be *discovered late*, not that enforcement be early. |
| 3 | **Collapse to five or six stages by merging aggressively.** | Fewer stages means fewer restarts, which is attractive against `OBJ-8` until the arithmetic is done: §10.2 shows the per-restart allowance is the daily budget divided by the day's *total* restarts, so merging only helps if it reduces the total, and it does not — it concentrates the same work into fewer, longer boots, each of which must still fit ≤ 13 s. Merging also destroys the property the whole order exists for: `T4` and `T5` must be separate stages, because `T5`'s entry condition is `T4`'s output. |
| 4 | **Put the enforcement point before the backfill**, so confinement exists as early as possible. | The predicate would then run over a population whose ownership column is still NULL, hiding every pre-cutover row from every principal — `R-S5-1` exactly, and SUB-5 already names it Critical-adjacent. Early confinement over an unkeyed population is not earlier safety; it is an outage that scores as a success. |
| 5 | **Treat `T0` as a prerequisite in prose rather than a numbered stage.** | `R-S4-2`'s three routes have materially different consequences and no default. A prerequisite in prose is satisfied by anyone's reading of it; a stage with an entry condition — *"one of the three routes is chosen and recorded"* — is not. The cost of getting this wrong is `R-S7-1`, which is precisely the failure of choosing by omission. |
| 6 | **Sequence around the smoke break by unmounting the transport gate during the migration stages.** | Foreclosed by `F-S5-12`, which exists to foreclose it: the two refusals are independent, so a stage that ships the enforcement point while holding back the gate still fails the suite, and fails it where the failure is harder to attribute. This is the "natural-looking way to de-risk the sequence" SUB-5 names and rejects. |

---

## Consequences

1. **`T5` becomes gated on a human read.** Its entry condition — *"`T4` exited **and** its observation
   has been read"* — cannot be evaluated mechanically, because no alert route is established
   (`A-S16-1`, `R-S16-2`). This is recorded as the residual of `R3` rather than presented as closed.
2. **Three stages cannot be entered from their predecessor's disable position** — `T5`, `T8` and
   `T9`. That is designed: in each case entering would mean proceeding on evidence or a population
   the disable position has withdrawn.
3. **Ten stages means ten planned restarts**, which tightens the per-restart `OBJ-8` allowance on
   every day a stage lands. The cadence between stages becomes an availability variable, which
   `R-S6-2` did not state. At most one stage per day keeps the allowance near the published ≤ 13 s.
4. **Two stages' durations remain unbounded** — `T2` and `T7` scale with row counts that were never
   taken (`OI-S6-1`). The order cannot fix this and does not claim to; `CAP-S7-1` records the limit.
5. **What becomes harder:** the sequence is now long enough that an out-of-order merge is a realistic
   operator error, and nothing in the platform enforces the order (`F-S7-5`). A five-stage sequence
   would have been easier to execute correctly and would have honoured §4.3 less well.
6. **SUB-13 inherits a stage list, not a runbook.** Every entry condition resolves to a named
   predicate or a named upstream id, so SUB-13 re-decides nothing — but it must still write the
   batching, the resume logic and the operator steps.

---

## Evidence

| Claim | Source |
| --- | --- |
| SUB-4's four stages and their two ordering constraints | `../04_the-stdio-identity-gate-and-the-bound-context-token.md:440`–`:445`, `:447`–`:451` |
| SUB-4 scopes "only bookkeeping after it" to its own set and hands the audit to SUB-7 | `../04_the-stdio-identity-gate-and-the-bound-context-token.md:452`–`:454` |
| Observe-only is "not a permissive mode" | `../04_the-stdio-identity-gate-and-the-bound-context-token.md:435`–`:436` |
| SUB-6's five stages, their reversal positions, and `S2` as the only irreversible one | `../06_the-disposition-of-every-unowned-row.md:679`–`:685`, `:695`–`:697` |
| `A-S6-2` — `S1` at or after the carrier lands, sequencing explicitly left to SUB-7 | `../06_the-disposition-of-every-unowned-row.md:274`–`:279` |
| `§9.3`'s intra-`S4` four-wave order and `P-ORPHAN-2` as a hard entry condition | `../06_the-disposition-of-every-unowned-row.md:703`–`:721` |
| V1–V7, the target-subject verification, with V7's immediately-before re-run | `../06_the-disposition-of-every-unowned-row.md:391`–`:399` |
| `F-S5-12` — two independent causes; unmounting one does not unbreak the run | `../91_findings-register.md:610`–`:617`; `../05_the-enforcement-point-that-confines-every-read-and-write.md:1217`–`:1221` |
| `ContextTokenRepository` is deliberately unscoped, so `init_agent_context` survives both causes | `../05_the-enforcement-point-that-confines-every-read-and-write.md:338` |
| The column lands nullable with the predicate live, tightened to `NOT NULL` only after every row carries an owner | `../05_the-enforcement-point-that-confines-every-read-and-write.md:762` |
| The carrier's two fields, and `none` meaning "the record predates attribution" | `../16_attribution-and-detection.md:74`, `:89` |
| The smoke job runs after the deploy | `.github/workflows/cd-prod.yml:110`–`:111` |
| Deploys are gated on the CI workflow's conclusion, not cd-prod's own | `.github/workflows/cd-prod.yml:3`–`:7`, `:19`–`:21` |
| Which smoke scenarios exist and which tools they call — **all eight `it()` blocks** | `tests/smoke/smoke.test.ts:104`, `:111`, `:128`, `:152`, `:163`, `:200`, `:231`, `:263` |
| `OBJ-7` (≥ 7 restarts/day) and `OBJ-8` (≤ 13 s / ≤ 65 s / ≤ 131 s, with its derivation) | `../15_operational-objectives-for-the-real-platform.md:254`, `:255` |
| C010 §4.3's `I4`→`I5` sequencing consequence — *"the two are sequential, not parallel, and fixing the first surfaces the second"*, and *"will discover the principal-kind problem at the end"*. **No irreversibility clause.** | `../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:494`–`:496` |
| SUB-2's identity rule is what makes the surfaced kind answerable, and it names SUB-7's rollout directly | `../02_identity-the-learner-key-and-principal-kind.md:213`–`:216` |
| `principal_kind` is `DR-C11-S2-2`'s determined kind, so the carrier cannot precede the determination | `../16_attribution-and-detection.md:78` |
| The eighth smoke scenario is an HTTP `DELETE`, not a `tools/call`, and the gate's predicate covers `tools/call` only | `tests/smoke/smoke.test.ts:263`, `:266`–`:268`; `F-S11-3` in `../91_findings-register.md:959` |

---

## Revision trigger

- **`OI-S7-1` closes on the third route** — "accept a known-failing step." `T0`'s exit condition
  changes shape and `R-S7-1` becomes live rather than open; the order itself is unaffected.
- **`OI-S6-1` closes** and the row counts show `T2` or `T7` cannot be batched inside `OBJ-8` at any
  slice size. The order is unaffected but the cadence conclusion in §10.2 must be re-derived, and
  `R-S6-2`'s escalation to `NEU-896` becomes an active decision rather than a recorded residual.
- **SUB-13 finds a stage needs more than one deploy.** `A-S7-1`'s invalidating outcome; the
  ten-restart figure and every allowance derived from it are re-derived.
- **SUB-11 (NEU-1004) contracts a client guarantee that the smoke run violates**, or that changes
  which `R-S4-2` routes are available. `T0`'s content changes; its position does not.
- **An alert route is established** (`OI-S1-9` closes). `T5`'s entry condition can then be evaluated
  mechanically and `R3`'s principal residual closes.
- **C010 amends §4.3's sequencing consequence** via `NEU-895`. The audit at §4 is re-run against the
  amended text.
