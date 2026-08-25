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
