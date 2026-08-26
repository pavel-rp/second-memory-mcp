# S9 — Propagation and completion proof across every copy

**Task:** NEU-1003 (SUB-9) · **Charter:** C011 (umbrella NEU-893) · **Written:** 2026-08-26 · **Verification cutoff:** `ee0a750`, 2026-08-26
**Model:** claude-opus-5[1m]
**Covers:** OUT-12

| Outcome | Claim | Discharged by | Evidence class | Status | Residual |
| --- | --- | --- | --- | --- | --- |
| OUT-12 | Six copy classes × three duties, every cell carrying an action, a deadline, a retention exception, a learner-visible result and an auditable proof | `../09_proving-a-data-right-reaches-every-copy.md` §7.1–§7.3 — 18 cells | `derived` | **confirmed** | The cells are a design; none has been exercised. Execution is `R-S9-1` |
| OUT-12 | Zero cells read "unknown" without a named owner and a date | §7 — three C3 cells read *not determinable at this cutoff* with the owner and resolving event carried from `OI-S1-8` | `derived` | **confirmed** | The backups class stays unresolved until `OI-S1-8` closes; the owner is carried, not the answer |
| OUT-12 | Every column heading resolves to a defined class rather than an inherited label | §3 — six definitions with SUB-3 inventory mappings | `derived` | **confirmed** | — |
| OUT-12 | `web-owned state` is resolved to browser-side device state, server-side empty-by-decision under `M-A` | §3.1, cited to `DR-C10-S6-1` | `consumed` | **consumed** | Any future server-side web state is a grant `NEU-896` converges; not pre-empted here |
| OUT-12 | The sixth column carries the owner, retention bound and destruction condition SUB-1 recorded at position 1, with that origin named | §7.4, reading `../01_production-evidence-and-the-access-audit.md:151`–`:159` | `consumed` | **consumed** | The terms are unexercised — zero captures exist (`../01_…md:128`), so no term has been tested against a real capture. SUB-1 carries that as `R8` |
| OUT-12 | The "destroy on schedule" action is stated with its reasoning rather than assumed | §7.4 — reasoned from the retention bound's **unconditional** expiry at publication, which is earlier than or equal to any request deadline | `derived` | **confirmed** | It does not replace erase-on-request pre-publication, where the action is a manual operator deletion — `F-S9-4` |
| OUT-12 | A data right routes *through* the zero-member class rather than around it | §7.5 — the request requires the class to emit a proof, not to yield members; `action = not-applicable`, `rows_affected = 0` | `derived` | **confirmed** | Untested against a real member, because the class has none |
| OUT-12 | Each candidate package-internal copy is admitted or excluded on its **derivation**, with the answer written down | §5 — five candidates tested | `derived` | **confirmed** | — |
| OUT-12 | SUB-6's synthetic dry-run dataset is excluded, citing SUB-3's inventory entry and SUB-6's no-copied-rows audit; no term is set for it here | §5.1, citing `../03_learner-data-inventory-and-classification.md:484`–`:506` and `../06_the-disposition-of-every-unowned-row.md:551`–`:565`, `:579`–`:585` | `consumed` | **consumed** | SUB-6's closure is over the input set **at position 8**. §5.1 adds the exclusion's falsifier — an input of row type — which SUB-6 did not state |
| OUT-12 | The aggregate result set is carried as SUB-3 inventoried it — counts over rows are not the rows | §5.2, citing `../03_…md:468`–`:482` | `consumed` | **consumed** | The disclosure boundary is SUB-5's aggregate rule and `F-S5-9`, not this sub-task's |
| OUT-12 | The backups column is populated by citation to the package's single record, with its owner carried | §10, citing `../93_open-items-and-provisional-register.md:117`–`:132` | `consumed` | **[unconfirmed]** | `OI-S1-8` is open. **Zero backups records are raised here**, verified by grep over this sub-task's output |
| OUT-12 | The unowned-copy audit runs mechanically over SUB-3's inventory ∪ `LD-S8-1` and reports a count | §8 — 33 categories, 0 with no propagation owner | `derived` | **confirmed** | The zero holds only within the inventory; **1** copy location outside it is unclaimed — `F-S9-1`. `R-S9-3` carries the risk that the qualification is dropped downstream |
| OUT-12 | Every copy the audit surfaces that no class claims is reported as a finding with an owner | `F-S9-1` in `../91_findings-register.md` | `observed-in-repository` | **confirmed** | The provider's actual retention terms are unknown — `SPK-S9-1`, unexecuted |
| OUT-12 | The copy set is **closed by an argument with a stated falsifier**, not assumed complete | §4.2 (`W-1` … `W-7`) and §4.3; `../decision-records/DR-C11-S9-2_the-copy-set-closure-argument.md` | `observed-in-repository` | **confirmed** | Static at `ee0a750`. One new outbound client or one `writeFile` invalidates it — `R-S9-2` |
| OUT-12 | The deployment writes no learner data to disk outside the database | §4.2 `W-2` — grep over `src/` for `writeFile` / `appendFile` / `createWriteStream` / `writeFileSync` / `mkdir` returned **zero matches** | `observed-in-repository` | **confirmed** | A measurement at one cutoff, not a standing property |
| OUT-12 | The pre-cutover population receives a disposition rather than a key | §6; `../decision-records/DR-C11-S9-1_the-pre-cutover-population-disposition.md` — bulk deletion at archive close, under storage limitation | `derived` | **confirmed** | The disposal is designed, not executed — `R-S9-1`. Its date rests on `A-S9-1` pending `OI-S9-1` |
| OUT-12 | `F-S8-2` is downgraded from blocking to resolved on its own stated resolving event | §6.5, citing `../91_findings-register.md:436` | `derived` | **confirmed** | What is discharged is the design obligation, not the rows |
| OUT-12 | `R-S6-1`'s residual is closed, and the archive is not mistaken for the discharge | §6.4, citing `../92_risk-register.md:586`–`:588` | `derived` | **confirmed** | SUB-6's entry is unedited; SUB-14 reflects the closure at assembly |
| OUT-12 | The retention and deletion mechanism is **designed and handed** to the log-table caps' owners, not absorbed | §6.6; `../94_caps-and-incomplete-scope.md` § SUB-9 | `derived` | **confirmed** | `CAP-S3-3` and `CAP-S4-1` (both C010) stay with `NEU-986`, co-named `NEU-896` |
| OUT-12 | `CAP-S7-1` is discharged by supplying its own stated lifting condition, including the gate-input statement no party had made | §6.6, against `../../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md:283`–`:284` | `observed-in-repository` | **confirmed** | The 5-week floor is read from `src/adapters/drizzle/tier2-blocking-stats-repository.ts:41` and moves with that literal |
| OUT-12 | The completion-proof design conforms to SUB-16's signal contract field by field | `../decision-records/DR-C11-S9-3_the-completion-proof-record.md` — 9/9 fields, 3/3 location properties, timing, 6/6 negative clauses | `derived` | **confirmed** | Asserted against the contract **as published at position 7**; an amended contract requires re-walking, not re-citing |
| OUT-12 | A declared `copy_class` cardinality of **6** is published, firing `A-S8-1`'s re-validation trigger | §8; `DR-C11-S9-3` clause 2 | `derived` | **confirmed** | `deadline_at`'s **value** stays `A-S8-1`'s stand-in and is consumed, not set |
| OUT-12 | `CAP-S3-3`, `CAP-S4-1`, `CAP-S7-1`, `CAP-S5-1` and `OI-S5-1` each carry an explicit disposition with its actual owner | `../94_caps-and-incomplete-scope.md` § SUB-9 — five rows | `derived` | **confirmed** | C010's `CAP-S4-1` and C011's are different caps sharing an id — `F-S9-3` |
| OUT-12 | OUT-12's outcome row with its resolving evidence and success measure is authored here | `../90_outcome-register.md` § SUB-9 | `derived` | **confirmed** | — |
| OUT-12 | The Critical OUT-12-owned charter § Risks row is authored here with severity, mitigation, owner and escalation route | `../92_risk-register.md` § `R2` | `derived` | **confirmed** | Partially mitigated; the egressed copy, the backups class and the unexecuted disposal all remain |
| OUT-12 | Propagation is demonstrated against a real copy | — | — | **not established** | **No production credential exists.** Zero of twenty-three designed spikes have executed. `G-S9-13` records this as `not met`; the §4 argument stands in its place and is **not** restated as a demonstration |

## What this file does not establish

- **That any copy was actually reached.** Every row above describes a design. No propagation has
  been executed, no proof row has ever been written, and `propagation_proof` does not exist as a
  relation. `R-S9-1` carries the unexecuted disposal with a named owner.
- **That the copy set is complete over copies that exist.** It is complete over copies **this
  deployment creates**, bounded explicitly by the external-provider egress (`F-S9-1`) and by the
  operator and `psql` paths SUB-5 names at
  `../05_the-enforcement-point-that-confines-every-read-and-write.md:719`–`:722`, which are
  SUB-12's to model under OUT-17.
- **Any production fact.** No row count, no population size, no backup fact, no provider identity.
  `observed-in-production` is used **zero** times in this sub-task's output, and no quantity
  anywhere in it is a production measurement.
- **That the archived population still exists, or that it does not.** Its size was never observed;
  `OI-S1-5`, `OI-S1-6` and `OI-S16-1` bear on it and all three are open.
- **Anything about confinement.** Who may read a copy once it rests somewhere is SUB-5's under
  OUT-8. This file establishes only where copies come to rest.
- **That `SIG-S16-3` can fire on this deployment.** The design makes it evaluable; the signal still
  has no alert route, which is `R-S16-2` and is SUB-16's.
- **A QA pass.** The `qa-execution` surface is unconfigured, so the automated QA phase is a genuine
  Core Article 8 no-op, carried at package level as `CAP-S1-3`. **No QA pass is claimed.**
- **Any applied behaviour.** No file under `src/` or `drizzle/` changes, no DDL is authored, and
  nothing is executed.
