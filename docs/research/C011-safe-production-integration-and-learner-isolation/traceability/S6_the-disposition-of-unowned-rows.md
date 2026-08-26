# S6 — The disposition of every unowned row already in production

**Sub-task:** SUB-6 (NEU-1000) · **Covers:** OUT-2
**Written:** 2026-08-25 · **Model:** claude-opus-5[1m]
**Codebase cutoff:** `origin/develop` @ `35f92ba`

---

## OUT-2 — Migration of the existing global rows: what happens to every unowned row currently in production

| Outcome | Claim | Discharged by | Evidence class | Status | Residual |
| --- | --- | --- | --- | --- | --- |
| OUT-2 | Every table in `src/infrastructure/db/schema.ts` and both raw-SQL log tables carries a stated disposition | `../06_the-disposition-of-every-unowned-row.md` §3 — 14 rows, zero unaddressed | `observed-in-repository` | **met** | — |
| OUT-2 | The choice is justified per table rather than applied uniformly | §3's justification column; the evidence-based partition in `../decision-records/DR-C11-S6-1_the-migration-disposition-scheme.md` | `derived` | **met** | — |
| OUT-2 | A table for which no disposition can be justified is reported as a finding with an owner | §3 closing paragraph — checked against all 14, none found, recorded as *checked and not filed* | `derived` | **met** | — |
| OUT-2 | Cross-checked against C010's 45-category state inventory, unmatched reported in both directions | §8 — 17 persisted categories → dispositions, 0 unmatched; 14 tables → categories, 0 unmatched | `derived` | **met** | Both zeros inherit C010's own six falsifiers, which this chapter did not re-derive |
| OUT-2 | The target subject is explicitly verified against a real token before it is written, never inferred | §5 publishes procedure V1–V7 and makes it a hard entry condition on the backfill stage | `derived` | **NOT MET** | **The verification was not performed** — no credential exists. `SPK-S6-1`; the gate holds, the observation does not exist |
| OUT-2 | A position is stated on rows created by the deploy pipeline's `client_credentials` principal | §3 row 10 (`purge`) and §10's per-stage analysis | `observed-in-repository` | **met** | — |
| OUT-2 | It states whether the migration is staged, reversible or single-step | §9.1 — **staged**, and forced by `F-S5-10` rather than chosen | `derived` | **met** | — |
| OUT-2 | It states what is lost if it is reversed, per stage | §9.2 — five stages; four fully reversible, S2 the only irreversible one, and its loss entailed by a consumed decision | `derived` | **met** | — |
| OUT-2 | Per-disposition row counts come from read-only aggregate queries against production | §6.1 publishes `Q1`–`Q5` | `derived` | **NOT MET** | **Not executed — no credential.** `SPK-S6-2`. No count is reported and no cell reads `0` |
| OUT-2 | The query set includes an explicit probe per named dirty-data pathology, per table | §6.2 — 12 probes across all five named classes, 8 carrying executable SQL and 4 structural foreclosures; §6.3 resolves every pathology per table | `observed-in-repository` | **met with cap** | **The cap is the literal "per table" reading.** §6.3 names the **7** tables in the not-probed state; `operation_event_log` is the consequential one. `F-S6-6`, owner SUB-13 |
| OUT-2 | A pathology class for which no probe could be written is reported as a finding | `F-S6-2` — mis-ownership is undetectable by aggregate because no column distinguishes principals | `derived` | **met** | — |
| OUT-2 | Each pathology found is reproduced in the synthetic dataset | §7.1's generation record ties each reproduced pathology to its probe | `derived` | **NOT MET** | No pathology was found because none was probed; the dataset was not generated. `OI-S6-2` |
| OUT-2 | A generation record ties every synthetic distribution back to the aggregate it came from | §7.1 — five enumerated inputs, each mapped to the distribution it drives | `derived` | **met** | Three of the five inputs are unexecuted aggregates; the *record* is complete, its *values* are not |
| OUT-2 | An audit confirms the dataset contains no row copied out of production | §7.2 — an input-closure argument over the complete input set, with its falsifier stated | `derived` | **met with cap** | **The cap:** it is a proof about the *construction*, not a confirmation about an artifact — the dataset does not exist (rows 24 and 29). Stronger in scope than the empirical form, since it quantifies over every dataset the generator can emit; weaker in evidential status, since it constrains a generator not yet built. `A-S6-3` |
| OUT-2 | The dataset is recorded as not a member of the sixth copy class, citing SUB-3's derivation test at position 3 | §7.2; `../decision-records/DR-C11-S6-3_aggregate-then-generate-and-the-exclusion-evidence.md` | `derived` | **met** | — |
| OUT-2 | This sub-task sets no owner, retention bound or destruction condition for the dataset | §7.2 closing paragraph; §16 | `derived` | **met** | — |
| OUT-2 | The dry-run claims every row of the dataset or surfaces it as a finding | §7.4 | `derived` | **NOT MET** | The dataset does not exist, so no unclaimed-row count is reported. `OI-S6-2` |
| OUT-2 | The report distinguishes real production counts from generated counts | §7.4 states the rule and records both sets as empty for different reasons | `derived` | **met** | — |
| OUT-2 | The throwaway SQL is recorded as scratch verification code, distinct from SUB-13's artifact | §7.3 | `derived` | **met** | Not written, because the dataset it would run against does not exist |
| OUT-2 | The unprobed-pathology residual is recorded in the risk register with an owner, a pre-flight probe re-run and an abort condition | `R9` in `../92_risk-register.md` | `derived` | **met** | — |
| OUT-2 | Every other residual this sub-task states carries a severity, mitigation, named owner and escalation route | `R-S6-1`, `R-S6-2` in `../92_risk-register.md` | `derived` | **met** | — |
| OUT-2 | OUT-2's outcome-register row carries its resolving evidence and its authored success measure | `../90_outcome-register.md` § `OUT-2` | `derived` | **met** | The measured result reports **21 of 25 traced claims met** across an eight-limb success measure, and names the four that are not |
| OUT-2 | The result sits inside `A-28`'s tolerance envelope | §12 — every disposition inside, under both readings for `no-key-owed`; the invalidating outcome did not fire | `derived` | **met** | No amendment routed to `NEU-895` |
| OUT-2 | `NEU-850`'s `OUT-2` is honoured and cited | §13; cited at `../../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:50`–`:53` | `observed-in-repository` | **met** | — |
| OUT-2 | No change to `src/` or `drizzle/`; nothing is applied | §14 | `observed-in-repository` | **met** | — |

**Twenty-five claims. Twenty-one met — of which two are met with a stated cap — and four not met.** All four failures are the same failure —
**no production credential exists in this environment** — and each is recorded as a spike or an open
item with a named owner rather than hedged, deferred silently, or reported green.

---

## What this file does not establish

- **That any count, population size or probe result is known.** Every one of them is unobserved.
  `observed-in-production` is used **zero** times in this chapter, as in every merged chapter of
  this package before it.
- **That the target subject is correct.** §5's procedure would establish it; the procedure did not
  run. The backfill is gated on it, which is the strongest position available without a credential.
- **That the single-principal premise holds.** `A-S6-1` is `[unconfirmed]`, and `F-S6-2` records
  that no aggregate probe can settle it.
- **What a data right does to the pre-cutover population.** That is SUB-9's (NEU-1003) under
  `F-S8-2`; `../06_the-disposition-of-every-unowned-row.md` §4.3 states the boundary.
- **That `F-S8-2` is discharged.** It is not. It remains blocking, with its owner unchanged.
- **That the citation gate is meaningful for this package.** C011 is not in the checker's `GATED`
  list (`scripts/check-citation-paths.ts:21`), so CI will not fail on a broken C011 citation;
  `CAP-S1-2` carries this and SUB-14 owns it. The local run is the only gate, and it was run.
- **Anything about applied behaviour.** Nothing is implemented, no test is written, no migration is
  executed.
