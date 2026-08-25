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
