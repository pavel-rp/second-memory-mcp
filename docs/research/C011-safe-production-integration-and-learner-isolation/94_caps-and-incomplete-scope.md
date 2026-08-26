# `94` — Caps and incomplete scope

**Charter:** C011 (umbrella NEU-893) · **Opened:** 2026-08-25 · **Verification cutoff:** `546ee90`, 2026-08-25
**Model:** claude-opus-5[1m]

Append-only. Each sub-task appends its own `### SUB-<n>` section. No sub-task reflows, renumbers, or
rewrites another sub-task's entries. On a merge conflict in this file, keep **both** sides.

A **cap** is what this package does **not** do, stated as a limit rather than a topic. It is
distinct from an open item (an unanswered question) and from a stand-in (an assumption the design
provisionally rests on).

## What this register records

| Field | What it records |
| --- | --- |
| **Id** | `CAP-S<n>-<k>` |
| **Cap** | What this package does not do, stated as a limit. |
| **Why it is capped** | The reason the limit exists. |
| **What it leaves unsupported** | The claim or capability a reader must not assume. |
| **Owner** | Who is accountable for the limit. |
| **What would lift it** | The observable change that removes the cap. |

---

### SUB-1

#### `CAP-S1-1` — This package carries no live production evidence

- **Id:** `CAP-S1-1`
- **Cap:** C011 contains **zero observations of the running production system**. No token claim set, no schema dump, no log sample, no row count, no metric. Every production fact in this package is derived from the repository at a stated cutoff, or cited from C010.
- **Why it is capped:** No production credential of any kind was available to the authoring environment, and the constraint forbids obtaining one by any route other than the registered exception, which requires a credential the authoring party does not hold. Fabricating, inferring or substituting an observation was not available — the brief forbids it and it would poison thirteen downstream sub-tasks.
- **What it leaves unsupported:** Any claim of the form *"in production, X is observed to be Y."* In particular a reader must **not** assume: that `sub` is absent on a real `client_credentials` token (believed, not observed — `OI-S1-1`); that a DCR principal carries or lacks a human-identifying `sub` (`OI-S1-3`); that the live schema matches `drizzle/` (`OI-S1-4`); that the two log tables do or do not hold learner-derived content (`OI-S1-5`, `OI-S1-6`); or that backups exist (`OI-S1-8`).
- **Owner:** The creator, as sole maintainer and sole operator of the production deployment.
- **What would lift it:** Any of `OI-S1-1` … `OI-S1-9` closing. The cap narrows with each and lifts entirely when all nine close.

#### `CAP-S1-2` — C011 is not registered in the citation-path CI gate

- **Id:** `CAP-S1-2`
- **Cap:** `scripts/check-citation-paths.ts` gates only `C010-system-and-repository-architecture`. C011 is **not** in its gated list, so this package's relative citations are not enforced by CI.
- **Why it is capped:** Registering a package in the gate is package-closure work. Gating an incomplete package would fail CI for every sub-task that lands a partially-cross-referenced chapter, and the gate's value is at closure, when every cross-reference has a target. SUB-1 is position 1 of 16.
- **What it leaves unsupported:** A reader must not infer from a green CI run that C011's citations resolve. **SUB-1's own files were written to the convention regardless** — a package-root file cites a package-root sibling bare, a `decision-records/` or `traceability/` file cites one with a single `../`, and source paths are written bare from any depth — and were checked locally against the same checker, but the enforcement is voluntary until the package is registered.
- **Owner:** **SUB-14 (NEU-1007)**, which owns the package's house-style assembly and closure.
- **What would lift it:** Adding `C011-safe-production-integration-and-learner-isolation` to the `GATED` list in `scripts/check-citation-paths.ts`, once the package's cross-references have targets. This is the one change outside `docs/research/` that closing C011 will require; it touches `scripts/`, not `src/` or `drizzle/`, so it stays inside the charter's no-source-change constraint.

---

**SUB-1 register totals at revision 1:** two caps, `CAP-S1-1` and `CAP-S1-2`, each with a named owner
and an observable lifting condition.

---

### SUB-3

#### `CAP-S3-1` — The inventory classifies the declared schema, not observed production data

- **Id:** `CAP-S3-1`
- **Cap:** `03_learner-data-inventory-and-classification.md` establishes what the system **is declared to hold** — the tables in `src/infrastructure/db/schema.ts` and `drizzle/`, the process-local structures in `src/`, and the code that writes each — at cutoff `86fb38a`. It establishes **nothing about what production rows actually contain**. No row was counted, no value was sampled, no schema was introspected against the live database.
- **Why it is capped:** No production credential of any kind is available to the authoring environment; SUB-1 designed nine spikes at position 1 and executed zero for exactly this reason (`F-S1-2`), and `CAP-S1-1` already states the package-wide form of the limit. This cap is the **inventory-specific** consequence: a classification derived from a schema is a classification of a declaration, and the distinction matters most precisely where this inventory's conclusions are strongest.
- **What it leaves unsupported:** A reader must **not** infer from this chapter that `mcp_request_log.response_body` in fact contains learner free text in production — that it *can* is established from the write path, that it *does* is `OI-S1-5`; nor that `operation_event_log.data` in fact quotes learner content (`OI-S1-6`); nor that the live schema matches `drizzle/` at all (`OI-S1-4`); nor any count of rows in any category. **`F-S3-1` is bounded by this cap and says so in its own text.** Two further limits worth naming: the process-local group (`LD-S3-18` … `LD-S3-27`) rests on a manual read plus C010's independent agreement, because no mechanical enumeration of module-level mutable state exists — stated in §11; and the shape of a stored `validator_report` (`LD-S3-4`) is not establishable from the declared schema, which is why its minimization position is flagged as *worth watching* rather than assessed.
- **Owner:** The creator, as sole maintainer and sole operator of the production deployment — the only party who can supply a read-only observation.
- **What would lift it:** `OI-S1-4`, `OI-S1-5` and `OI-S1-6` closing. The cap narrows with each: `OI-S1-4` would confirm the declared surface is the real one, and `OI-S1-5` / `OI-S1-6` would replace the two log tables' *can-hold* classification with a *does-hold* observation. It lifts entirely when all three close.

---

**SUB-3 register totals at revision 1:** one cap, `CAP-S3-1`, with a named owner and an observable
lifting condition.

**SUB-3 registers no citation-gate cap of its own.** `CAP-S1-2` — that C011 is not yet in
`scripts/check-citation-paths.ts`'s gated list — already covers this chapter, and its owner is
SUB-14. Raising a second cap for the same limit would be a duplicate record of one fact. This
chapter's citations were nonetheless written to the convention and **checked locally against the same
checker**, which reports zero non-resolving paths across the corpus.
### SUB-15

#### `CAP-S15-1` — Every objective in this package is modelled, none is measured

- **Id:** `CAP-S15-1`
- **Cap:** The objective set in `15_operational-objectives-for-the-real-platform.md` contains **zero numbers observed from the running production system**. Every capacity, latency, availability and failure figure is read out of this repository's shipped constants at cutoff `86fb38a`, computed from this repository's own git history, or cited from C010's own measured micro-benchmark. **No load test was run, no production metric was read, and no restart was timed.**
- **Why it is capped:** No production credential of any kind is available — `DATABASE_URL`, `SMOKE_PROD_*`, `AUTH_*` and `VPS_*` were re-probed at this cutoff and are all unset, independently reproducing SUB-1's `F-S1-2`. Load-testing the production instance would in any case be a mutation of the running system, outside the read-only constraint and outside the single registered exception. Fabricating a plausible figure was not available: it would poison SUB-7's rollout gating and SUB-9's lifecycle work, and it is the precise failure mode charter assumption 49 forbids.
- **What it leaves unsupported:** Any claim of the form *"the deployment is measured to sustain X."* In particular a reader must **not** quote: an availability percentage (`OBJ-8` states what each target would *require*, not what is achieved); a single concurrent-learner capacity figure (the honest answer is the band **2–200**, and the band is the finding); a concurrent-load latency figure (`OBJ-5` is `[unconfirmed]`); an entry-count threshold for the session-map leak (`OI-S15-4`); or an RPO or an RTO (`F-S15-1`).
- **Owner:** The creator, as sole maintainer and sole operator of the production deployment.
- **What would lift it:** Any of `OI-S15-1` … `OI-S15-4` closing narrows the cap; `OI-S15-3` narrows it most, since it collapses the two-order-of-magnitude capacity band to a value. The cap lifts entirely only when all four close **and** a load observation is taken against the real deployment — which is work no sub-task in this package is authorized to do.

---

**SUB-15 register totals at revision 1:** one cap, `CAP-S15-1`, with a named owner and an observable
lifting condition. It is the objective-specific form of SUB-1's package-wide `CAP-S1-1` and cites it
rather than restating it.

---

### SUB-2

#### `CAP-S2-1` — The identity rule is settled, but **no principal shape's population is confirmed**

- **Id:** `CAP-S2-1`
- **Cap:** This package states which claim becomes the learner key, how principal kind is determined, and what happens in every branch — and it confirms, for **zero** of the three principal shapes, which branch that shape actually takes in production. The rule is total; the population of each branch is unobserved.
- **Why it is capped:** SUB-1 obtained no token for any shape (`96_spike-register.md`, `SPK-S1-1` … `SPK-S1-3`, all `Result: not executed`), and no production credential of any kind exists in the authoring environment (`91_findings-register.md` § `F-S1-2`). SUB-2 has no independent route to one — the constraint forbids obtaining a credential by any route other than OUT-18's registered exception, which requires a credential the authoring party does not hold. **Deriving the rule anyway was the right response, not a workaround:** kind is determined by `sub` presence rather than by audience shape, so the rule is well-defined under every possible answer, and deferring it would have left nine downstream sub-tasks inheriting `payload.sub || azp`.
- **What it leaves unsupported:** Any claim of the form *"in production, principal shape X resolves to kind Y."* In particular a reader must **not** assume: that the CI smoke principal really carries no `sub` (believed from a code comment, not observed — `OI-S1-1`); that `claude-web` really yields a human `sub` (inferred from the flow's shape, not read from a token — `OI-S2-2`); that a DCR principal carries or lacks one (`OI-S1-3`); that any `dyn$` client exists in production at all (`OI-S2-3`); or that `sub` is stable, unique over time or opaque in format (`OI-S2-1`). **What it does support** is every statement about what the system *does* given a token, which is what OUT-1 and OUT-6 are discharged on.
- **Owner:** The creator, as sole maintainer and sole operator of the production deployment — the only party who can obtain a token for any shape.
- **What would lift it:** `OI-S1-1`, `OI-S2-2` and `OI-S1-3` closing — one per shape. The cap narrows with each; it lifts entirely when all three close. `OI-S2-2` lifts the most, because it covers the shape the production learner actually arrives on.

---

**SUB-2 register totals at revision 1:** one cap, `CAP-S2-1`, with a named owner and an observable
lifting condition. It is a **narrower restatement** of `CAP-S1-1` applied to this sub-task's own
output, not a second record of the same fact: `CAP-S1-1` caps the package's evidence base, while
this entry caps what the identity rule specifically may be read to establish.

---

### SUB-4

#### `CAP-S4-1` — The mechanism is designed and **never exercised**; `I4`, `I2` and `I5` are all answered against a proposal, not against a running system

- **Id:** `CAP-S4-1`
- **Cap:** `04_the-stdio-identity-gate-and-the-bound-context-token.md` §10.1, §10.2 and §10.3 state that checks `I4`, `I2` (for `context_tokens` itself) and `I5` are satisfied **under the proposed gate and row design**. **All three are verdicts about a design**, and the cap covers all three rather than the `I4` limb alone. This sub-task establishes that the mechanism is **well-formed** — a principal is produced on both transports, the refusal is defined in every branch including the unconfigured one, each token row resolves to exactly one principal, and the confinement input handed downward is the same shape from the same table on both transports. It does **not** establish that any of it **works**: nothing is implemented, no request has ever been refused by it, no row has ever carried a binding, and no test has ever observed a STDIO call resolve to a principal.
- **Why it is capped:** Exercising it requires code, and this sub-task may write none — `src/` and `drizzle/` are out of scope by constraint, and `04_the-stdio-identity-gate-and-the-bound-context-token.md` §14 records zero changes to either. No reading settles it, because the thing to be established is a property of running code rather than of a document. No bounded read-only experiment settles it either, so it is **not a spike**. And no event within this package's reach closes it, so it is **not an open item** — which is exactly the line C010 drew when it filed `CAP-S5-1` separately from `OI-S5-3`.
- **What it leaves unsupported:** Any claim that the STDIO gate *is* closed, as opposed to *decided*. Any reading of §10.1's `I4`, §10.2's `I2` or §10.3's `I5` verdict as a measurement rather than a derivation. Any downstream plan that treats the transport precondition of C010's `CAP-S5-1` as **discharged** rather than **designed** — this sub-task supplies one of the three simultaneous preconditions that cap names, in design only, and the other two are `NEU-850`'s `OUT-2` and SUB-5's port-boundary scoping. It also leaves unsupported the converse: nothing here shows the gate is unworkable either, and the honest statement is that it is untested in both directions.
- **Owner:** **`SUB-10 of C010 (NEU-984)`**, co-named **`NEU-896`**, as the party that owns `CC-S8-3` and would land the mechanism. Named alongside **SUB-5 (NEU-997)**, for which this cap is the standing precondition on its own `I4` limb.
- **What would lift it:** **One `I4` observation on a running system** — a DB-backed test in which the same gated tool is refused identically on both transports for an absent principal, and admitted identically for a bound one. That requires the mechanism to land on `origin/develop`, which is `OI-S8-1`'s and `OI-S8-2`'s resolving event and not this package's act. Recorded as a precondition, not as a promise.

---

**SUB-4 register totals at revision 1:** one cap, `CAP-S4-1`, with a named owner and an observable
lifting condition. It is a **narrower restatement of C010's `CAP-S5-1` applied to the three checks
this sub-task answers**, not a second record of the same fact: `CAP-S5-1` caps the invariant's
satisfiability across all five checks and every state category, while this entry caps what this
sub-task's `I4`, `I2` and `I5` answers specifically may be read to establish. The distinction matters because `CAP-S5-1` names the STDIO gate as one of three
preconditions, and a reader could otherwise take this chapter's publication as having discharged it.

---

### SUB-16

#### `CAP-S16-1` — The detection matrix is published uncalibrated: every threshold is derived from a repository constant and none has been exercised

- **Id:** `CAP-S16-1`
- **Cap:** The four signals in `16_attribution-and-detection.md` §3 each carry a threshold, and **none of the four has ever been evaluated against a real population** — not in production, not in a staging environment, not against a synthetic replay. Every threshold is derived: `SIG-S16-1` and `SIG-S16-2` are zero-tolerance because the expected steady-state count is *arithmetically* zero given the three exempt tools (`src/transport/context-token-middleware.ts:5`–`:9`) and the single known `client` principal; `SIG-S16-4`'s comparison window is one deploy interval because the deploy cadence is a counted repository fact (`15_operational-objectives-for-the-real-platform.md` §2.2, `C-17`); `SIG-S16-3`'s threshold is complete but **not yet evaluable**, because `deadline_at`'s value is SUB-8's under OUT-11. **What this sub-task publishes is therefore a matrix of correctly-shaped signals with uncalibrated thresholds, not a validated detection capability**, and no reader may cite a threshold here as a tuned or observed value.
- **Why the scope is incomplete:** Calibration requires either production observation or a representative replay. Neither exists: no production credential is present in the environment this package was written in, **sixteen spikes across SUB-1, SUB-2 and SUB-15 were designed and zero executed** — and seventeen
counting this sub-task's own `SPK-S16-1`, also not executed — and `92_risk-register.md` § `R13` records the package's position as `n = 0` rather than the charter's assumed `n = 1`. Calibrating against an invented population would produce a number that looked measured and was not, which is the failure `R13` and `R-S15-1` are both registered against.
- **Named owner:** **The creator, as sole maintainer and sole operator of the production deployment** — the only party who could run any signal against real data.
- **Lifting condition — observable, and in two stages.** **Stage 1:** `OI-S16-1` closes (the audit writer is confirmed mounted) **and** `OI-S1-9` closes (an observation channel is named), at which point a signal can be run at all. **Stage 2:** any one of `SIG-S16-1`, `SIG-S16-2` or `SIG-S16-4` limb (b) is evaluated once against real production data and its result recorded in `96_spike-register.md`. Limb (b) of `SIG-S16-4` is the cheapest first target: it reads `mcp_request_log.response_status` (`drizzle/0010_create_infrastructure_mcp_request_log.sql:10`), which **already exists**, so it needs no schema change and no new emission. The cap lifts for a signal when that signal has been run once; it lifts **entirely** only when all four have.
- **Why this is not a second record of `CAP-S1-1` or `R13`:** `CAP-S1-1` caps the **package's evidence base** — what the package as a whole may claim from zero observations. `R13` carries the **risk** that a reader treats the design as validated. This entry caps something narrower and specific to this sub-task's own output: **what a threshold in this particular matrix may be read to mean.** It is the same relationship `CAP-S2-1` bears to `CAP-S1-1`, and it is recorded on the same rule. `R13` is **cited** in the mitigation reasoning above rather than restated.

---

**SUB-16 register totals at revision 1:** one cap, `CAP-S16-1`, with a named owner and a two-stage
observable lifting condition. It is a **narrower restatement** of `CAP-S1-1` applied to this
sub-task's own output, not a second record: `CAP-S1-1` caps the package's evidence base, while this
entry caps what a threshold in the detection matrix may be read to establish. **No cap is recorded as
lifted.**

---

### SUB-8

#### `CAP-S8-1` — Every duty in this chapter is specified; not one has ever been exercised, and the export was reviewed on paper

- **Id:** `CAP-S8-1`
- **Cap:** `08_consent-and-what-a-learner-can-export-and-erase.md` states a consent boundary, an export design, a per-category erasure disposition, a completion deadline and a retention-exception audit. **None of it has ever run.** **Zero** consents have been captured — there is no consent record and no surface to capture one on. **Zero** exports have been produced. **Zero** erasures have been requested or executed. The **table-top export in §7.3 is a paper exercise over the declared schema**: no database was read, no row was counted, no artifact was generated and handed to anyone, and its dispositions are derived from SUB-3's classifications rather than from data. The `deadline_at` value in §9.1 is a **chosen policy number**, not a measurement of anything.
- **Why it is capped:** No production credential of any kind exists in the authoring environment — `SMOKE_PROD_*`, `DATABASE_URL`, `AUTH_*` and `VPS_*` were re-probed at cutoff `d2e2b55` and are all unset, independently reproducing SUB-1's `F-S1-2`. There is additionally **nothing to exercise**: the mechanisms these duties would run on do not exist (`F-S8-3`, `R-S8-4`), so even with a credential there is no export path to invoke and no consent record to write. Generating a plausible export artifact and presenting it as produced was not available — it would be an observation this package does not have, and it is the failure mode charter assumption 49 forbids.
- **What it leaves unsupported:** Any claim of the form *"the product can export a learner's data"*, *"an erasure request completes in 30 days"*, or *"consent has been obtained for X."* In particular a reader must **not** infer: that the 25-section export was ever rendered (it was enumerated, not rendered); that 30 days is achievable, since no propagation has ever been timed and no register item in this package covers propagation duration; that the four passing retention exceptions are enforced — only #3's ≤ 5 s bound is enforced by a constant, and #4's 30-day script has a cron registration present **only as a comment**; or that any category's disposition has been tested against real rows, which is bounded by `OI-S1-5`, `OI-S1-6` and `OI-S1-4`.
- **Owner:** **The creator, as sole maintainer and sole operator of the production deployment** — the only party who could supply a credential or authorise the `src/` work that would make any duty here exercisable.
- **What would lift it:** In two stages, and the first is not an observation. **Stage 1:** an export path and an erasure path are built, and a consent record exists to write — the `src/` and `drizzle/` work `F-S8-3` and `R-S8-4` name, owned outside this package. **Stage 2:** one export is produced against real data and reviewed for readability and completeness, and one erasure is executed and its propagation timed against the 30-day deadline, with both recorded in `96_spike-register.md`. The cap narrows when either duty becomes exercisable and lifts **entirely** only when both have been exercised once.
- **Why this is not a second record of `CAP-S1-1`:** `CAP-S1-1` caps the **package's evidence base** — what the package as a whole may claim from zero production observations. This entry caps something narrower and specific to this sub-task's own output: **what a duty stated in this chapter may be read to mean about the product's capability.** The two differ in a way that matters here, because `CAP-S8-1`'s stage 1 is *not* an evidence problem at all — it is an absent mechanism, and no amount of production access would lift it. It is the same relationship `CAP-S2-1` and `CAP-S16-1` bear to `CAP-S1-1`, and it is recorded on the same rule. `CAP-S1-1` and `92_risk-register.md` § `R13` are **cited** in the reasoning above rather than restated.

---

**SUB-8 register totals at revision 1:** one cap, `CAP-S8-1`, with a named owner and a two-stage
observable lifting condition. **No cap is recorded as lifted.** **SUB-8 registers no citation-gate
cap of its own** — `CAP-S1-2`, that C011 is not yet in `scripts/check-citation-paths.ts`'s gated
list, already covers this chapter and its owner is SUB-14; raising a second would be a duplicate
record of one fact. This chapter's citations were nonetheless written to the convention and **checked
locally against the same checker**, which reports zero non-resolving paths across the corpus.
### SUB-5

**No new cap is filed here, and that is a deliberate result rather than an omission.** This sub-task's
subject matter *is* a cap — C010's `CAP-S5-1`, which this package co-owns and which OUT-8 discharges
— and the discharge record below is what this section exists for. Two limits that might look like
caps are named with their real classifications so the reconciliation is not left guessing.

#### `CAP-S5-1` (C010) — the discharge record: a positive instance now exists, and the cap is **not** lifted

- **Id:** `CAP-S5-1` — **C010's**, defined at `../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md:182`–`:189`. **Recorded here, not re-filed**, because the cap belongs to C010 and this package co-owns rather than owns it. A C011 `CAP-S5-1` does not exist and must not be minted; a bare `CAP-S5-1` anywhere in this package means C010's.
- **Cap:** *"The isolation invariant is published with **zero** positive instances: shown well-formed, never shown satisfiable."* C010 established the invariant has a named domain, ordered checks and a closed verdict set, but that *"No positive instance exists anywhere in the package, and the demonstrations are all failures or exemptions"* (`:185`). It also recorded the honest converse at `:187`: nothing showed it **un**satisfiable either, and *"satisfiability is untested in both directions."*
- **Why it is capped:** `:186` names three things that must be *"simultaneously true"* and that no C010 sub-task makes — an ownership key on the store, the reaching query bodies scoped at or below the port boundary, and an identity gate on the STDIO transport. `:188` names **`NEU-986` (`SUB-12 of C010`)** as owner *"alongside **NEU-893**, which is the party positioned to produce the first positive instance and for which this cap is the standing definition of done."* Charter assumption 38 records the co-ownership and assigns the discharge to OUT-8.
- **What is discharged here, precisely:** **the cap's subject matter, not its condition.** `05_the-enforcement-point-that-confines-every-read-and-write.md` §8 carries `SC-S3-12` (Notes) to verdict **`holds`** — all five checks answered in order, against target state form (c) with four enumerated assumed changes, and with `I3` answered from a published **enumerated access-path set** of four SQL statements closed by the module boundary. That is the invariant's **first published positive instance**, and it establishes satisfiability, which is the one thing the cap said no package had shown. The three preconditions each trace to something already settled when the derivation was written: the ownership key to `NEU-850`'s `OUT-2` as consumed through SUB-2's identity rule; port-boundary scoping to OUT-8, designed here; the STDIO gate to OUT-7 / SUB-4 at position 4. **Zero trace to an artifact that does not yet exist** — in particular, none traces to SUB-13's OUT-19 DDL, which is named only as the later realization that re-verifies this derivation in the other direction.
- **What it still leaves unsupported:** Everything the cap's `:187` names that turns on **applied** work. Any claim that a category `holds` on the deployment as it stands — under target state (a), `SC-S3-12` is `not-evaluable`, because no ownership column exists. Any reading of the `holds` verdict as a test the system currently passes. Any generalization from one category to the other fourteen Census-B `fails-confinement` rows, each of which needs its own enumerated access-path set. And any claim that the closure argument survives a change to `src/`: it is a statement about the code at cutoff `cc38cc9`, and a single new import of the `notes` table object falsifies it (`R-S5-3`).
- **Owner:** **Unchanged — `NEU-986` (`SUB-12 of C010`)** at C010's package-completeness gate, co-named **`NEU-893`**. This package supplies the positive instance it was positioned to supply; **it does not take the cap over, does not close it on its owner's behalf, and does not claim it lifted.**
- **What would lift it:** C010's own text at `:189` is *"**One state category evaluating to `holds`** — which requires all three preconditions above to land together."* **Land** is the operative word, and nothing has landed. Stated as a four-part landing condition on applied work: (1) `NEU-850`'s `OUT-2` ownership key **applied** to the category's table in `drizzle/` — SUB-13 (OUT-19) realizes it, SUB-6 (OUT-2) dispositions the existing unowned rows; (2) the enforcement point **applied** in `src/` for that category's enumerated access-path set; (3) SUB-4's STDIO identity gate **applied** in `src/transport/`; and (4) **the enumerated access-path set re-verified at that cutoff**, because the closure argument is cutoff-bound and clause 4 is not optional. The party that observes all four is not named anywhere and is raised as `OI-S5-2`, owner `NEU-896`.

**Two limits that are deliberately not filed as caps, so the reconciliation is not left guessing.**

- **The RLS second layer's unpriced transaction cost** is an **open item, not a cap** — `OI-S5-1`, owner **SUB-13 (NEU-1006)**. A cap is for a limit no available party settles; this one has both an available party and an observable resolving event, and the design rests on nothing it would settle, because clause 5 is explicitly the second layer.
- **The `qa-execution:engine` no-op.** The automated QA phase is a genuine Core Article 8 no-op for this sub-task as for every other in the package: the capability registry resolves to `git, linear`, no QA execution provider is registered, **no QA pass exists and none is claimed**. **`CAP-S1-3` already carries this at package level** and a per-sub-task duplicate would make one package-wide condition look like several independent ones — the same disposition SUB-6 of C010 recorded for the identical situation.

---

**SUB-5 register totals at revision 1:** **zero new caps filed.** One inherited cap is **recorded
with its discharge** — C010's `CAP-S5-1`, co-owned, whose subject matter is discharged by the first
published positive instance and whose **condition is not met**. Two limits are classified as
not-caps with their real registers named. **No cap is recorded as lifted**, and `CAP-S5-1`'s owner
and co-owner are unchanged.

---

### SUB-6

**Three limits are classified as not-caps, with their real registers named, so the reconciliation is
not left guessing.**

- **The unexecuted aggregate query set** is a **spike and two open items, not a cap** — `SPK-S6-2`,
  `OI-S6-1`, `OI-S6-2`. A cap is for a limit no available party settles. This one has an available
  party (the creator, as sole operator and sole holder of a production credential), an observable
  resolving event (the queries run), and a complete specification waiting on nothing but execution.
  Filing it as a cap would say no party can close it, which is false.
- **The unperformed target-subject verification** is a **spike, not a cap** — `SPK-S6-1`. Same
  reasoning, and additionally the design does not rest on its result: the backfill stage carries
  V1–V7 as a hard **entry condition**, so an unverified target cannot reach production. What is
  missing is an observation, not a decision.
- **The `qa-execution:engine` no-op.** The automated QA phase is a genuine Core Article 8 no-op for
  this sub-task as for every other in the package: the capability registry resolves to `git, linear`,
  no QA execution provider is registered, **no QA pass exists and none is claimed**. **`CAP-S1-3`
  already carries this at package level**, and a per-sub-task duplicate would make one package-wide
  condition look like several independent ones — the same disposition SUB-5 and `SUB-6 of C010` each
  recorded for the identical situation.

**One inherited cap is touched only by citation.** `CAP-S1-2` — that C011 is absent from the citation
checker's `GATED` list at `scripts/check-citation-paths.ts:21`, so CI will not fail on a broken C011
citation — bears directly on this sub-task, whose chapter carries a large number of `file:line`
claims. It is **not re-filed**: its owner is SUB-14 (NEU-1007) and it is already recorded once. This
sub-task's response is procedural rather than registrable — the citation checker was run locally, and
the `…md` ellipsis shorthand, which the checker discards at `scripts/citation-paths/checker.ts:121`
and therefore cannot gate, was grepped for explicitly so that a green result is evidence rather than a
vacuous pass.

---

**SUB-6 register totals at revision 1:** **zero new caps filed.** Three limits are classified as
not-caps with their real registers named, and one inherited cap (`CAP-S1-2`) is cited rather than
re-filed, with its owner unchanged. **No cap is recorded as lifted.**

**Why this sub-task files no cap, stated rather than left as an absence.** Every limit SUB-6 hit is a
missing *observation*, and every one of them has a named party who could take it and an event that
would close it. None is a limit on what this package can decide — the dispositions in
`06_the-disposition-of-every-unowned-row.md` §3 are settled, and not one of them turns on a row count
or a probe result. A cap filed here would mis-describe the situation as unresolvable when it is
merely unobserved, and would give SUB-17's audit a permanent limit where there is a closable one.

---

### SUB-7

> **Id-collision disclosure — all six, not one.** This sub-task mints **six** ids that already exist
> in C010, and an earlier draft of this note disclosed only the caps one. The full set is
> **`F-S7-1`, `F-S7-2`, `F-S7-3`, `F-S7-4`** (in `91_findings-register.md`), **`OI-S7-1`** (in
> `93_open-items-and-provisional-register.md`) and **`CAP-S7-1`** (here). `F-S7-5`, `F-S7-6`,
> `F-S7-7`, `A-S7-1` and `R-S7-1` have no C010 counterpart. Before this sub-task, the only S7-series
> id present anywhere in C011 was `CAP-S7-1`, and it was always written qualified as C010's — so
> **all six collisions are created here.** Under the package-wide rule `F-S2-2` establishes, a bare
> `F-S7-<k>` / `OI-S7-1` / `CAP-S7-1` means **this** package's, and C010's is always written
> qualified. Matching one-line notes appear in the `### SUB-7` sections of `91_findings-register.md`
> and `93_open-items-and-provisional-register.md`, so a reader of either register sees the hazard
> without having to reach this one.
>
> **On the caps id specifically.** C010 also has a
> sub-task 7, and its caps register carries a `CAP-S7-1` of its own — *"The web API's erasure
> capability cannot be scoped at all, because no row holding learner payload has a deletion owner"*,
> at `../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md:277`, whose `Owner:`
> line at `:283` names `NEU-893`. **The `CAP-S7-1` below is C011's, and is a different record about a
> different subject.** Under the package-wide rule `F-S2-2` establishes, a bare `CAP-S7-1` means this
> package's, and C010's is always written qualified — *"C010's `CAP-S7-1`"*. The collision is
> disclosed here because this sub-task is the one that creates it, and because the package has
> already been bitten once by same-numbered ids across the two packages meaning different things.

#### `CAP-S7-1` — This package prices no rollout stage's duration, so no stage is shown to fit `OBJ-8`

- **Id:** `CAP-S7-1`
- **Cap:** The rollout sequence states what `OBJ-8`'s availability budget **would allow** per restart, and derives how the allowance tightens as stages land. It does **not** state how long any stage takes. No stage is shown to fit the budget, and two of the ten — `T2`, the log-table archive, and `T7`, the ten-table backfill — have durations that scale with row counts and are therefore unbounded here.
- **Why it is capped:** Pricing a stage needs two things this package does not have. The **row counts** were never taken: SUB-6's aggregate probes were published but not executed for want of a credential (`OI-S6-1`, `SPK-S6-2`). And the **restart duration** of a `docker compose up -d --build` with a boot-time migration is itself unobserved (`OI-S15-1`, cited by `OBJ-8`'s own evidence cell at `15_operational-objectives-for-the-real-platform.md:255`). With neither, any duration written here would be invented, and an invented duration in a runbook is worse than an absent one because it reads as a budget an operator can plan against.
- **What it leaves unsupported:** A reader must **not** infer that the rollout fits inside `OBJ-8`, that any individual stage does, or that the ten-stage decomposition reduces the availability cost. The §10.2 arithmetic supports only the opposite direction: adding stages *tightens* the per-restart allowance, so compressing the rollout concentrates its cost rather than reducing it. A reader must also not treat the "at most one stage per day" cadence as a duration guarantee — it is a statement about the denominator, not the numerator.
- **Owner:** **SUB-13 (NEU-1006)**, which chooses the batching and therefore fixes each slice's size, co-named **the creator** as the only party who can execute the aggregates that would supply the counts.
- **What would lift it:** `OI-S6-1` closing — the aggregate probe set executed against production, yielding per-table row counts — together with `OI-S15-1` closing, which supplies the restart-duration baseline. With both, each stage's slice count becomes computable and `R-S6-2`'s conflict becomes an arithmetic question rather than an open one.

---

**SUB-7 register totals at revision 1:** one cap, `CAP-S7-1`, with a named owner and an observable
lifting condition, plus one id-collision disclosure. One cap rather than several because this
sub-task's other limits are not limits on what it could decide — the sequence is complete, every
stage carries its five fields, every stage carries a control or a named exception, and every stage
has a reversal or is named irreversible. What it cannot do is **price** what it has ordered, and that
is a single limit with a single cause.

**Two things that would look like caps and are filed elsewhere.** That the disable paths are
specified but not built is not a cap on this package — it is the correct division of labour, since
building them is SUB-13's and would require touching `src/`, which the charter forbids here; it is
recorded as a residual of `R4`. That no signal is established to reach anybody is `R-S16-2` under
`OI-S1-9`, already capped by SUB-1's `CAP-S1-1` as part of the package-wide absence of live
production evidence.
### SUB-11

#### `CAP-S11-1` — The compatibility contract is written for a client population of unknown size and unknown composition, and no existing client's behaviour was observed

- **Id:** `CAP-S11-1`
- **Cap:** `11_the-client-compatibility-contract.md` may be read as establishing what **would** happen to a client of each described shape. It may **not** be read as establishing that any such client exists, how many do, or what any of them actually does today. Every path classification in §6.3, every probe in §4.1 and every scenario verdict in §7 is a derivation from repository facts, not an observation of a client.
- **Why it is capped:** **No production credential exists in this environment.** `SMOKE_PROD_BASE_URL`, `SMOKE_PROD_CLIENT_ID`, `SMOKE_PROD_CLIENT_SECRET`, `DATABASE_URL`, the `AUTH_*` set and the `VPS_*` set are all unset, so the production deployment cannot be reached, no token can be minted, and no client can be enumerated. This is not particular to this sub-task: across the published package **twenty-three spikes are designed and zero have been executed** — twenty at this sub-task's cutoff, plus its own `SPK-S11-1`, plus SUB-6's two, which landed between that cutoff and the merge (`96_spike-register.md`, re-enumerated by section heading, with all three figures and the reason for stating three at `11_the-client-compatibility-contract.md` §12) — and the same absence produces `CAP-S1-1`'s standing position. The one exception a reader might expect — that the CD smoke suite is itself a known client — is real and is used (§7 walks it scenario by scenario), but it is read from `tests/smoke/smoke.test.ts` and `.github/workflows/cd-prod.yml`, not observed running.
- **What it leaves unsupported:** Four claims this chapter does **not** make. That the STDIO edge is reachable by anyone in production — C010's question, `A-S4-2` / `SPK-S4-1`. That path 4 (`TRANSPORT` unset) is the largest class **by installation count** rather than by construction — §6.3 calls it the largest class because it is what happens when nobody chooses, which is a property of the default, not a census. That the migration cost of `CH-1` is bounded — it scales with a population nobody has counted. And that the DP rubric of `F-S11-2` has ever inconvenienced a real self-hoster; it is a breach of a charter constraint, observed in the schema, with no observed victim.
- **Owner:** **The creator, as sole maintainer and sole operator of the production deployment** — the only party who can reach it; **`NEU-896`** at convergence, as the recipient of a package-level evidence gap no sub-task can close from inside the repository.
- **What would lift it:** Execution of **`SPK-S11-1`** — enumerate the clients that have actually authenticated against the deployment, by transport and by principal kind — with its result recorded against this cap. Partial lift is available and worth stating: executing `SPK-S4-1` alone (is the STDIO edge reachable, and to whom) would close the reachability limb without closing the population limb. **Nothing lifts it from the repository**, which is why it is a cap and not an open item.

---

**SUB-11 register totals at revision 1:** **one new cap**, `CAP-S11-1`. **No cap is recorded as
lifted**, and no other sub-task's cap has its owner or condition altered here.

**Two limits are deliberately classified as not-caps, with their real registers named.** The
**absence of an automated set-equality check** between the empty-schema tools and `EXCLUDED_TOOLS`
is an **open item** (`OI-S11-1`), not a cap: a cap bounds what a document may be read to establish,
and this bounds nothing the chapter claims — the exempt set is observed at a stated cutoff and
reported as observed. The **`qa-execution:engine` no-op** is not filed here either, and the reason
needs one sentence more than the customary one. The automated QA phase is a genuine Core Article 8
no-op for this sub-task as for every other: the capability registry resolves to `git, linear`, no
provider owns the `qa-execution` surface, **no QA pass exists and none is claimed**. A per-sub-task
duplicate would make one package-wide condition look like several independent ones, which is the
disposition SUB-5 recorded and which this sub-task follows. **But the record SUB-5 declined in favour
of — `CAP-S1-3` — does not exist in this register**, so the no-op is presently carried at package
level by `README.md` § *"Verification note — `qa-execution:engine` is unconfigured"* alone, as prose
rather than as a cap. That is registered as **`F-S11-5`** and routed to SUB-14; **this sub-task
still declines to file a duplicate**, because filing one would resolve an assembly-level gap by
minting a per-sub-task record, which is the opposite of what the gap needs.

---

### SUB-9

**Five inherited caps are dispositioned here, and none is re-filed.** OUT-12 requires each to carry
an explicit recorded disposition with its actual owner named, so that SUB-14's classification and
SUB-17's split-fidelity record both have a source. **This sub-task files no cap of its own.**

| Id | Class | Actual owner | Disposition recorded here |
| --- | --- | --- | --- |
| **`CAP-S3-3` (C010)** | **Supplied-to** | `NEU-986` (`SUB-12 of C010`), co-named `NEU-896` | The retention window, its **code-derived** 5-week floor and the deletion owner are designed at `09_proving-a-data-right-reaches-every-copy.md` §6.6 and **handed over**. The cap stays with its owner; this package supplies what it lacks, exactly as OUT-12 states. Defined at `../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md:148` |
| **`CAP-S4-1` (C010)** | **Supplied-to** | `NEU-986` (`SUB-12 of C010`), co-named `NEU-896` | The same gap sighted from component placement; the same mechanism is handed over and the structural obstruction is unchanged by this sub-task. Defined at `../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md:165`. **Not to be confused with this package's own `CAP-S4-1`** at `:115` above — see `F-S9-3` |
| **`CAP-S7-1` (C010)** | **Owned here, discharged here** | `NEU-893`, named first of three | Its `Owner:` line names `NEU-893` *"the only party positioned to assign a retention-and-deletion owner"* (`../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md:283`), alongside `NEU-986` at the gate and `NEU-896` at convergence. **Discharged** at `09_…md` §6.6 by supplying exactly the lifting condition `:284` names — a named deletion owner on `SC-S3-16` and `SC-S3-17` with a retention window, **plus the `SC-S3-17` gate-input statement that entry records as never made by any party** |
| **`CAP-S5-1` (C010)** | **Co-owned here, discharged elsewhere** | Co-owned with `NEU-986` | **Discharged under OUT-8 by SUB-5**, not here, including the one worked `holds` verdict that is the invariant's first positive instance. Recorded as owned-here-discharged-elsewhere so SUB-14's classification has a source; this sub-task **neither absorbs nor declines it**, and files no C011 `CAP-S5-1` — a bare `CAP-S5-1` in this package is always C010's, per `:186` above |
| **`OI-S5-1`** | **Consumed, not owned** | `NEU-850` | Not a cap; listed here because OUT-12 requires its disposition alongside the four. Consumed by **citing the stand-in entry SUB-3 authored at position 3** rather than assuming a reading of its own. Recorded in `93_open-items-and-provisional-register.md` § SUB-9 |

**One inherited cap is touched only by citation.** `CAP-S1-2` — that C011 is absent from the
citation checker's `GATED` list at `scripts/check-citation-paths.ts:21`, so CI will not fail on a
broken C011 citation — bears directly on this sub-task, whose chapter and three decision records
carry a large number of `file:line` claims. It is **not re-filed**: its owner is SUB-14 (NEU-1007)
and it is already recorded once. This sub-task's response is procedural, following SUB-6's: the
citation checker was run locally, and the `…` ellipsis shorthand — which the checker discards at
`scripts/citation-paths/checker.ts:121` and therefore cannot gate — was grepped for explicitly, so a
green result is evidence rather than a vacuous pass — **23 shorthand refs were found and each was
resolved by a separate verifier that opens the target file and prints the cited line**, so the
checker's silence about them is covered rather than relied on.

**What that verifier does and does not establish, stated because an earlier revision of this
paragraph overstated it.** It resolves every `file:line` and confirms the target exists and is in
range; it **does not** confirm that the cited line says what the citing sentence claims. That second
check is a judgement, it was performed by an independent adversarial pass rather than mechanically,
and **it found six citations whose line was right but whose substance was not** — each corrected in
place, with the corrections themselves recorded in `F-S9-2` and in `09_…md` §4.2.1. The earlier
wording, *"every `file:line` was additionally re-read at the cited line"*, claimed the stronger
check and is withdrawn.

**The `qa-execution:engine` no-op is carried at package level and not duplicated.** The capability
registry resolves to `git, linear`, no capability owns the `qa-execution` surface, **no QA pass
exists and none is claimed**. `CAP-S1-3` already carries this package-wide, and a per-sub-task
duplicate would make one package-wide condition look like several independent ones — the same
disposition SUB-5, SUB-6 and `SUB-6 of C010` each recorded.

---

**SUB-9 register totals at revision 1:** **zero new caps filed.** Five inherited ids are
dispositioned with their actual owners named, one further inherited cap (`CAP-S1-2`) is cited rather
than re-filed with its owner unchanged, and **one cap is recorded as discharged** — `CAP-S7-1`
(C010), by supplying its own stated lifting condition. No other cap is recorded as lifted.

**Why this sub-task files no cap, stated rather than left as an absence.** The two limits this
sub-task hit are both genuinely closable by a named party. The **egressed copy** (`F-S9-1`) is not a
cap: it has an available party (`NEU-896` at convergence), and its unknown half is a bounded
observation registered as `SPK-S9-1`. The **unexecuted disposal** (`R-S9-1`) is not a cap either: it
has an available party (the creator, as sole operator) and an observable resolving event (the
deletion runs). A cap says no party can close a limit; filing either as one would mis-describe an
unperformed action as an unresolvable gap, and would hand SUB-17's audit a permanent limit where
there is a closable one — the reasoning SUB-6 recorded for the same choice.

---

### SUB-13

> **Id-collision disclosure — five, and this register carries none of them.** This sub-task mints
> five ids that already exist in C010, which has its own sub-task 13 about the authority matrix:
> **`F-S13-1`** (`../C010-system-and-repository-architecture/02_findings-register.md:336`),
> **`F-S13-2`** (`:347`), **`F-S13-3`** (`:359`) and **`F-S13-4`** (`:370`), all in
> `91_findings-register.md` here; and **`OI-S13-1`**
> (`../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:301`), in
> `93_open-items-and-provisional-register.md` here. **`CAP-S13-1` below has no C010 counterpart** —
> C010's caps register carries no `CAP-S13-*` — so, unlike SUB-7's case, the caps id is the one that
> does *not* collide. `F-S13-5` … `F-S13-10`, `R-S13-1` … `R-S13-4`, `OI-S13-2`, `A-S13-1`,
> `SPK-S13-1` and `G-S13-1` … `G-S13-7` are likewise free. `DR-C11-S13-1` … `-3` do **not** collide
> with C010's `DR-C10-S13-1`, because the package prefix differs. Under the package-wide rule
> `F-S2-2` establishes, a bare `F-S13-<k>` or `OI-S13-<k>` means **this** package's, and C010's is
> always written qualified. The set is enumerated once here, with matching one-line notes in the
> `### SUB-13` sections of `91_findings-register.md` and
> `93_open-items-and-provisional-register.md`, so a reader of either register meets the hazard
> without having to reach this one.

#### `CAP-S13-1` — Every artifact this sub-task publishes is unexecuted, so the package prices no operation and validates no batch size

- **Id:** `CAP-S13-1`
- **Cap:** The DDL, the migration plan and the runbook are authored, reviewed and **applied nowhere**. Not one `CREATE`, `ALTER`, `UPDATE` or `DELETE` statement has been executed against any database — production, staging, local or synthetic. No stage has been walked, no reversal exercised, no disable path built or flipped, no probe run and no pre-flight predicate evaluated against real rows. The two batch parameters are stand-ins (`A-S13-1`) and have been validated against nothing.
- **Why it is capped:** Two causes, and neither is closable from here. **No production credential exists** in the authoring environment — `SMOKE_PROD_*`, `DATABASE_URL`, `AUTH_*` and `VPS_*` were probed and are all unset, which is `F-S1-2`'s condition, unchanged across all thirteen chapters. And **the sub-task's own charter forbids applying anything**: no file under `src/`, `drizzle/` or any deployment configuration may change, so even a local execution would require producing the migration this sub-task is explicitly out of scope to produce. Executing against a synthetic dataset was available and was **declined**: SUB-6 already built one and was explicit that its throwaway SQL *"is explicitly not the OUT-19 migration artifact"*, and a batch size measured against synthetic data of unknown resemblance to production would look derived without being so — which is worse than a stand-in that says what it is.
- **What it leaves unsupported:** A reader must **not** infer that any statement in `13_the-ddl-the-migration-plan-and-the-runbook.md` executes without error, that any sweep completes, that any disable path works, that any reversal restores what it claims, or that the two slice defaults are appropriate for the real population. In particular: **`CAP-S7-1` is not lifted.** `DR-C11-S13-2` re-shapes its residual — the per-boot cost becomes bounded by construction while total completion stays unbounded — and re-shaping is not pricing. A reader must also not treat the four repository gates this sub-task ran (type-check, lint, unit tests, citation paths) as evidence about the SQL: they establish that the repository still builds, and the chapter changes no code, so they were never capable of saying anything about its content.
- **Owner:** **The creator**, as sole operator and the only party who can execute anything against production, co-named **the implementation charter** that will run this artifact and is the first party in a position to discover that a statement is wrong.
- **What would lift it:** A migration derived from this DDL executing against production, or against a restored copy of it, with the result recorded. Partial lifts are available and are worth naming separately, because they are cheaper: `SPK-S6-2` executing supplies the row counts and makes each stage's slice count arithmetic; `SPK-S15-1` executing supplies the restart-duration baseline and turns `A-S13-1`'s *"leaves margin"* into *"fits"* or *"does not"*; `SPK-S13-1` executing confirms whether the two PostgreSQL-12-dependent constructs are available at all. None of the three requires the migration to run.

---

**SUB-13 register totals at revision 1:** one cap, `CAP-S13-1`, with a named owner and an observable
lifting condition, plus one id-collision disclosure of five ids. One cap rather than several because
this sub-task's limits share a single cause: everything it produces is a document, and no document
executes. What it could decide it decided — the constraint shape, the sweep contract and the control
surface each have a decision record with rejected alternatives — and what it could verify against the
codebase it verified, limb by limb, at a stated cutoff. The one thing it cannot do is **run** any of
it, and that is a single limit with a single cause.

**Three things that would look like caps and are filed elsewhere.** That no stage is priced against
`OBJ-8` is **`CAP-S7-1`**, whose named owner is this sub-task; it is inherited and re-shaped, **not
lifted**, and opening a second cap over the same fact would give SUB-14's cross-register check two
ids for one limit. That the batch parameters may be wrong in either direction is **`R-S13-1`**, an
exposure with a mitigation, not a bound on what the published scope establishes. That the DDL may
never be applied at all is **`R-S13-3`**, for the same reason — a cap says no party can close a
limit, and there is an available party here (the creator) and an observable closing event (a
migration lands on `origin/develop`).

**And one that would look like something filed elsewhere and is genuinely a cap.** It is tempting to
read `CAP-S13-1` as merely restating `F-S1-2`, the package-wide absence of live production evidence.
It is narrower and it bites differently: `F-S1-2` is about **evidence not gathered**, and this is
about **an artifact not exercised**. A package could have had complete production evidence and still
publish an unexecuted migration; the two limits are independent, and this one would survive
`F-S1-2`'s closure entirely.
