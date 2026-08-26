# `S7` — The rollout sequence, and what each stage cannot undo

**Task:** NEU-1001 (SUB-7) · **Charter:** C011 (umbrella NEU-893) · **Covers:** OUT-3, OUT-4
**Written:** 2026-08-26 · **Verification cutoff:** `ee0a750`, 2026-08-26
**Model:** claude-opus-5[1m]

Every row resolves into `docs/research/`. **A green type-check or lint line is not evidence about
this package's content**, and none is cited as such below.

---

## OUT-3 — Staged rollout

| Outcome | Claim | Discharged by | Evidence class | Status | Residual |
| --- | --- | --- | --- | --- | --- |
| OUT-3 | The four partial orders the predecessors hand forward compose into **one total order of ten stages**, `T0` … `T9`. | `../07_the-rollout-sequence-and-what-each-stage-cannot-undo.md` §3; `DR-C11-S7-1` | Derivation from four cited upstream artifacts | confirmed | Nothing in the platform enforces the order; an out-of-order merge is possible (`F-S7-5`), carried as a residual of `R3`. |
| OUT-3 | The composition is **audited**, not asserted: twelve constraints `K1` … `K12` with their sources, twelve satisfied — including `K11`, a SUB-2 ordering constraint the first draft of the audit missed entirely. | `../07_the-rollout-sequence-and-what-each-stage-cannot-undo.md` §2, §4 | Mechanical check against cited sources | confirmed | **The audit is only as complete as the constraint set, and this was demonstrated rather than hypothesised**: `K11` is a partial order two predecessors *did* state, and the first draft still missed it. The residual is therefore stronger than "an unstated partial order would not appear" — a **stated** one did not appear either, and only an independent pass caught it. |
| OUT-3 | **The transport gate is not last.** It is at `T4` and `T6`, with three stages after it. | `../07_the-rollout-sequence-and-what-each-stage-cannot-undo.md` §4 | Positional fact about the published order | confirmed | — |
| OUT-3 | The principal-kind work is at `T4`, **before `T5`, the only irreversible stage**, and `T5`'s entry condition requires `T4`'s observation to have been read. | `../07_the-rollout-sequence-and-what-each-stage-cannot-undo.md` §4, §6; `DR-C11-S7-1` decision 3 | Positional fact plus a stated entry condition | confirmed | The entry condition is a **human read**: no alert route is established (`A-S16-1`), so it cannot be evaluated mechanically. Residual of `R3`. |
| OUT-3 | C010 §4.3's `I4`→`I5` consequence is honoured, and **no amendment is routed to `NEU-895`**. | `../07_the-rollout-sequence-and-what-each-stage-cannot-undo.md` §4 | Consumed constraint, checked | consumed | What this sub-task adds — that observe-only is the right instrument — is an **addition** to the consumed position, not a contradiction, which is the distinction the amendment route turns on. |
| OUT-3 | Every stage carries an entry condition, an exit condition, a measurable isolation signal, a health signal and a named owner. **Ten stages, five fields, zero omissions.** | `../07_the-rollout-sequence-and-what-each-stage-cannot-undo.md` §6 | Enumeration | confirmed | Signals are computations, not notifications — every alert route is `[unconfirmed]` (`R-S16-2`, `OI-S1-9`). |
| OUT-3 | Signals are resolved against SUB-16's matrix (`FM-S16-1` … `FM-S16-4`, `SIG-S16-1` … `SIG-S16-4`) rather than invented. | `../07_the-rollout-sequence-and-what-each-stage-cannot-undo.md` §6 | Consumed upstream artifact | consumed | `SIG-S16-1` limb 1a is not computable until `T8`; limb 1b not until `T1`. Stated per stage. |
| OUT-3 | Each stage carries a **deploy-independent disable path** — control surface, operator, observability, behaviour in each position — **or an explicit named exception with a reason and an owner. Zero blanks.** Six controls, four named exceptions. | `../07_the-rollout-sequence-and-what-each-stage-cannot-undo.md` §8; `DR-C11-S7-2` | Specification against a cited in-repository precedent | confirmed | **None of the controls exists.** They are specified; SUB-13 (NEU-1006) builds them. Residual of `R4`. |
| OUT-3 | The control class reuses the repository's **existing env-var toggle shape**; the **deploy-independent application of it is new**. | `DR-C11-S7-2` decision 2 | Codebase read: `src/config/resolve-classifier-config.ts:22`–`:62` (the toggle); `docs/runbooks/classifier-blocking-activation.md:261`–`:262` (the runbook's own emergency path is *"Set `CLASSIFIER_ENABLE=false` … immediately"* then *"`Deploy.`"*) | confirmed, **and weaker than the first draft claimed** | **The first draft said this split was "already in house practice". It is not** — every path in that runbook routes through a deploy, and the `:167`/`:169` "next deploy" wording is about a different variable, `CLASSIFIER_BLOCKING_FIELDS`. What is precedented is the toggle shape; applying it over SSH to the off-repo compose stack is unprecedented here and depends on a capability only the creator has. Residual of `R4`. |
| OUT-3 | Each stage's feasibility under auto-deploy and auto-migrate is assessed. **All ten are executable; none is executable at a chosen moment.** | `../07_the-rollout-sequence-and-what-each-stage-cannot-undo.md` §7; `F-S7-5` | Codebase read: `.github/workflows/cd-prod.yml:3`–`:7`, `:19`–`:21` | confirmed | The conditional finding OUT-3 names — a stage that cannot be executed at all — was checked against all ten and returned **none**, recorded as *checked and returned empty* rather than filed as an empty entry. |
| OUT-3 | Both `F-S5-12` causes are sequenced around **independently**, at `T0`, six and eight stages ahead. | `../07_the-rollout-sequence-and-what-each-stage-cannot-undo.md` §5 | Consumed finding plus a positional fact | confirmed | Which route `T0` takes is unchosen (`OI-S7-1`); the exposure of the third route is `R-S7-1`. |
| OUT-3 | **Exactly two of the suite's eight scenarios break, and both break twice** — established by reading the suite, not assumed. | `../07_the-rollout-sequence-and-what-each-stage-cannot-undo.md` §5 | Codebase read: all eight `it()` blocks at `tests/smoke/smoke.test.ts:104`, `:111`, `:128`, `:152`, `:163`, `:200`, `:231`, `:263`; `../05_the-enforcement-point-that-confines-every-read-and-write.md:338`; `F-S11-3` for the `tools/call`-only method predicate | confirmed **at revision 2** | **The first draft said "six of six" and enumerated seven**, missing the eighth scenario (`:263`, an HTTP `DELETE`) entirely; corrected after an independent adversarial pass. Also rests on `ContextTokenRepository` staying unscoped — if SUB-13 scopes it, `init_agent_context` becomes a third broken scenario. |
| OUT-3 | The smoke break **blinds** the rollout rather than blocking it. | `F-S7-1` | Codebase read: `.github/workflows/cd-prod.yml:110`–`:111`, `:19`–`:21` | confirmed | Whether a red run is noticed is `R-S16-2`, cited not restated. |
| OUT-3 | The outcome-register row for OUT-3, with its resolving evidence and its **success measure**, is authored here. | `../90_outcome-register.md` § OUT-3 | Authored content | confirmed | SUB-14 aggregates it and authors none of it. |

---

## OUT-4 — Rollback

| Outcome | Claim | Discharged by | Evidence class | Status | Residual |
| --- | --- | --- | --- | --- | --- |
| OUT-4 | Every stage carries a rollback **trigger, action, time bound, owner and data-loss position** — or is named irreversible. | `../07_the-rollout-sequence-and-what-each-stage-cannot-undo.md` §9 | Enumeration | confirmed | No reversal has been exercised; none can be, absent a production credential (`F-S1-2`). |
| OUT-4 | **One stage is named irreversible** — `T5`, the `context_tokens` purge — rather than given a nominal rollback. | `../07_the-rollout-sequence-and-what-each-stage-cannot-undo.md` §9; `../06_the-disposition-of-every-unowned-row.md:682`, `:695`–`:697` | Consumed upstream disposition | consumed | The loss is bounded by `DR-C10-S8-2` having already voided the rows — bounded, not eliminated. |
| OUT-4 | Time bounds are stated in **restarts and operator actions**, not seconds. | `../07_the-rollout-sequence-and-what-each-stage-cannot-undo.md` §9 | Stated method | confirmed | Restart duration is unobserved (`OI-S15-1`), which is why no second is quoted. |
| OUT-4 | **No rollback action depends on a capability the deployment is not established to have** — zero depend on an image registry, an IaC revert, a schema down-migration or a backup. | `../07_the-rollout-sequence-and-what-each-stage-cannot-undo.md` §7 | Audit against SUB-15's recovery position | confirmed | Forced rather than achieved: `OBJ-13`/`OBJ-14` are unset under `F-S15-1`. |
| OUT-4 | The backups question is cited to **`OI-S1-8`**, SUB-1's single record, and **no second record is raised** anywhere in this sub-task's artifacts. | `../07_the-rollout-sequence-and-what-each-stage-cannot-undo.md` §7; `../93_open-items-and-provisional-register.md` § SUB-7 totals | One-id-per-fact discipline | consumed | — |
| OUT-4 | **Containment and reversal are recorded separately**, per stage, each disable position stating which behaviour stops, which persisted state remains, and whether the next stage can still be entered. | `../07_the-rollout-sequence-and-what-each-stage-cannot-undo.md` §10.1 | Enumeration | confirmed | **Three stages cannot be entered from their predecessor's disable position** — `T5`, `T8`, `T9` — stated as designed properties. |
| OUT-4 | Where a stage's only reversal is a deploy, that is **stated as the finding it is** — `T0`, `T3`, `T9`. | `F-S7-5` | Positional fact plus a codebase read | confirmed | Escalates to `NEU-896`, since a stage that cannot be reversed on the real platform is a go / conditional-go input. |
| OUT-4 | **Containment is not free of what it contains**: every control is read at boot and every boot re-runs the migrator first. | `F-S7-2` | Codebase read: `src/transport/main.ts:27`, `:42`–`:43`; `src/composition-root.ts:379`; `src/infrastructure/db/migrate.ts:38`–`:50` | confirmed | Makes `R-S6-2`'s batched-idempotent-resumable requirement a hard obligation on SUB-13. |
| OUT-4 | The sequence's availability cost is **derived** against `OBJ-8`: the per-restart allowance is the daily budget over the day's total restarts, so every stage landing tightens it — ≤ 13.1 s at baseline, ≤ 11.4 s at one stage/day, ≤ 5.2 s at ten. | `../07_the-rollout-sequence-and-what-each-stage-cannot-undo.md` §10.2 | Arithmetic from `../15_operational-objectives-for-the-real-platform.md:254`, `:255` | confirmed | **No stage is shown to fit** — `T2` and `T7` scale with row counts that were never taken (`OI-S6-1`). `CAP-S7-1`. |
| OUT-4 | `R-S6-2`'s residual is **discharged as owner, not re-raised**: the batch boundary is fixed, the cadence is priced, and the obligation is forwarded to SUB-13. | `../07_the-rollout-sequence-and-what-each-stage-cannot-undo.md` §10.2; `../92_risk-register.md:590`–`:618` | One-id-per-fact discipline | consumed | The residual — several short breaches are still breaches — is unchanged and still escalates to `NEU-896`. |
| OUT-4 | The forwarded pre-flight abort condition is **re-verified against the codebase**, not inherited. | `../07_the-rollout-sequence-and-what-each-stage-cannot-undo.md` §11; `F-S7-7` | Codebase read: `src/config/resolve-algorithm-config.ts:12`–`:14`; `src/shared/constants/validation.ts:6`–`:7`; `src/domain/types/spaced-repetition-tools.ts:102`; `src/domain/algorithms/sr-calculator.ts:191` | confirmed | The predicate is forwarded unchanged; the `ease_factor` limb's completeness is an **addition** to SUB-6's derivation, so no amendment is routed. |
| OUT-4 | The outcome-register row for OUT-4, with its resolving evidence and its **success measure**, is authored here, as are risk-register entries **`R3`** and **`R4`**. | `../90_outcome-register.md` § OUT-4; `../92_risk-register.md` § SUB-7 | Authored content | confirmed | SUB-14 aggregates and authors none. |

---

## What this file does not establish

- **That any stage fits `OBJ-8`.** Two of ten have unbounded duration (`OI-S6-1`, `CAP-S7-1`). §10.2
  states what the budget allows, never what a stage takes.
- **That any signal reaches anybody.** Every alert route is `[unconfirmed]` under `A-S16-1`; the
  exposure is `R-S16-2`. Every "observed how" cell describes a computation, not a notification.
- **That the disable paths exist.** They are specified with a cited precedent; SUB-13 builds them.
- **That the order will be followed.** Nothing in the platform enforces it (`F-S7-5`); an out-of-order
  merge is a residual of `R3`.
- **That `T0`'s route has been chosen.** `OI-S7-1` is open and the creator owns it.
- **That the smoke run's disposition preserves regression value.** That is SUB-4's `OI-S4-2`, cited
  and not restated.
- **Anything about propagation, erasure or a data right over the archived population.** `T2`
  relocates rows; what a data right does to them is SUB-9's (NEU-1003), under `F-S8-2` and `R-S6-1`,
  and all of SUB-9's options remain open after the move.
- **Any production quantity.** `observed-in-production` is used **zero** times, no row count is
  claimed, and no duration is measured.
- **Any implementation.** Zero files under `src/` or `drizzle/` change.
