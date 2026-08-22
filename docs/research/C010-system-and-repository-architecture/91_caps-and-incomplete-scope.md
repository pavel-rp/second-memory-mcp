# 91 — Caps and Incomplete Scope

**Task:** NEU-971 (SUB-1) opens it · **Charter:** C010 (umbrella NEU-895) · **Opened:** 2026-08-21
**Model:** claude-opus-5[1m]
**Entries owned by:** each appending sub-task. **Reconciled by a single named owner:** **NEU-986 (SUB-12)**.

---

## What belongs here

Every **cap** — a place where this package's scope stops short, stated honestly — and every statement of incomplete scope.

**A cap is an admission that there is no resolving event.** That is what separates it from an open item:

| | Has a resolving event | Named owner | Register |
| --- | --- | --- | --- |
| **Open item** | yes — an observable event closes it | yes | `90_open-items-and-provisional-register.md` |
| **Cap** | **no** — this package will not close it | **yes, always** | this file |

**Every cap carries a named owner.** "The package", "a later charter" and "whoever picks this up" are not owners. A cap with no owner is an orphaned gap wearing a label, and it is the failure mode this register exists to prevent.

**A cap is available only where a spike is infeasible.** If a bounded experiment would settle the claim, run the spike (`92_spike-register.md` §2) — a cap is not the cheap way out of an experiment.

**Recording a cap is not a way to mark a completeness-gate item as passing.** `94_package-completeness-gate.md` answers each item with cited evidence; an item that cannot be so answered is **recorded as a cap here rather than marked passing**. The two are alternatives, not a formality and its escape hatch.

## The single reconciling owner

**NEU-986 (SUB-12) is the declared single owner that reconciles this register at the end.** It merges duplicate entries, resolves cross-references, and publishes the reconciled register alongside `94_package-completeness-gate.md`.

Until SUB-12 runs, **a duplicate entry is correct-by-convention**, and any other sub-task that "tidies" one is destroying evidence rather than helping. Two sub-tasks independently capping the same gap is *signal* — it says the gap is visible from two directions — and collapsing it early throws that away.

Naming one owner is deliberate: a register that everyone reconciles is a register nobody reconciles.

## Append convention

> Each sub-task appends its own `### SUB-<n>` section. No sub-task reflows, renumbers, or rewrites another sub-task's entries. On a merge conflict in this file, keep **both** sides.

**Keep both sides is not a suggestion.** The default conflict resolution — pick one side — silently deletes a sibling's cap, and a silently deleted cap is the worst artifact this package can produce: the completeness gate then reads as passing over a gap that nobody owns and nobody can see. A visible duplicate is the intended failure mode, and SUB-12 is the declared owner that cleans it up once, at the end.

## Id namespacing (there is no global counter in this file)

Ids are **`CAP-S<n>-<k>`**, where `<n>` is the sub-task number and `<k>` restarts at `1` inside that sub-task's own section. SUB-3 allocates `CAP-S3-1`, `CAP-S3-2`, …; SUB-12 allocates `CAP-S12-1`, … — concurrently, without coordination, and without collision.

**No global counter exists here, and SUB-12's reconciliation does not introduce one.** Reconciling means merging duplicates and resolving cross-references; it does **not** mean renumbering into a single sequence. Renumbering would break every citation already written against the namespaced ids, which is precisely what the namespacing was adopted to prevent. Cite a cap in its full form (`CAP-S12-1`), never as a bare `CAP-1`.

## Stable field set (the same fields on every entry, in this order)

Entries are written as **blocks rather than table rows** — a table row carrying long cells is a single line, so two sub-tasks appending rows conflict on adjacent lines, while two sub-tasks appending whole sections do not overlap at all.

| Field | What it records |
| --- | --- |
| **Id** | `CAP-S<n>-<k>` |
| **Cap** | What this package does **not** do, stated as a limit rather than a topic. |
| **Why it is capped** | Why no experiment, no reading and no available party settles it here. |
| **What it leaves unsupported** | The decision, outcome or claim that is weaker because of this cap — named, so the cost is visible. |
| **Owner** | The named party accountable. Never "the package". |
| **What would lift it** | What would have to be true or available for the cap to be removed. Not a promise, and not a resolving event — a cap has none, by definition. |

---

## Entries

### SUB-1

*Three entries. SUB-1's caps are all about the limits of opening a package: it shipped conventions it cannot itself exercise, carried facts it did not itself re-verify, and had no QA engine to run.*

#### `CAP-S1-1` — The package conventions are unproven until siblings actually append

- **Id:** `CAP-S1-1`
- **Cap:** SUB-1 published the append convention, the `*-S<n>-<k>` id namespacing, the `00`–`89` / `90`–`99` numbering split and the keep-both-sides conflict rule, but **it did not and cannot demonstrate that they survive fifteen concurrent appends.** The registers are exercised by exactly one sub-task — the one that wrote them.
- **Why it is capped:** No experiment available to SUB-1 settles it. Simulating concurrent appends against files no sibling has written yet would test SUB-1's guess at what siblings will write, not the convention. The only evidence that counts is the real appends, and they arrive after this sub-task ships. It is not a spike (nothing to run), and it is not an open item (no single observable event closes it — it is discharged gradually, by fifteen of them).
- **What it leaves unsupported:** `OUT-12`'s house-style claim rests, for now, on the conventions being *mirrored from a package that did survive concurrent appends* (`../C009-course-content-quality/`, compiled 2026-08-10) rather than on this package's own evidence. That is a **proxy signal** under `00_method-and-provenance.md` §1.1 — precedent, not validation.
- **Owner:** **NEU-985 (SUB-11)** for the mechanical audit — id-namespace collisions, renumbered entries, entries missing a required field; **NEU-986 (SUB-12)** for the completeness gate's answer.
- **What would lift it:** SUB-11's audit reporting zero id collisions, zero renumbered entries and zero lost entries across every sub-task's appends — at which point the conventions have been exercised for real and the cap is answered by evidence rather than by precedent.

#### `CAP-S1-2` — SUB-1 re-verified none of the charter's codebase facts

- **Id:** `CAP-S1-2`
- **Cap:** The charter's numbered assumptions carry counted codebase facts — 45 registered tools across 16 modules, 42 gated and 3 exempt, 40 + 2 `context_token` declarations, 165 source files, ~25,200 lines, 197 test files, 25 Drizzle migrations, 431 non-bot commits of 648, 10 `public` tables and 2 Drizzle-defined `infrastructure` tables. **SUB-1 carried every one of them as `consumed` and re-counted none.**
- **Why it is capped:** Re-counting them was not SUB-1's scope, and doing it anyway would have produced a second set of numbers at a second cutoff with no mechanism to keep the two in step — a worse outcome than one clearly-attributed set. The charter records its own verification method and date for each fact.
- **What it leaves unsupported:** Any decision that depends on one of those counts depends on a number this package has not itself verified. `OUT-6`'s regression boundary (the 45/42/3 split) and `OUT-7`'s topology criteria (the maintainer tally, the single-package facts) are the two most exposed.
- **Owner:** **the sub-task that depends on the number.** A sub-task resting a decision on one of these counts **re-verifies it against `src/` at its own cutoff and cites its own command** — it does not inherit SUB-1's word for it. This is stated in `00_method-and-provenance.md` §6.
- **What would lift it:** Each dependent sub-task publishing its own re-verified count with its own cutoff and command. The cap is discharged piecewise, by the sub-tasks that actually need the numbers, not centrally.

#### `CAP-S1-3` — `qa-execution:engine` is unconfigured, so no QA pass exists

- **Id:** `CAP-S1-3`
- **Cap:** This repository's capability registry resolves to **`git, linear`** only; no `qa-execution:engine` provider is registered. The automated QA-execution phase is a genuine **no-op** for this package.
- **Why it is capped:** There is no engine to run and, for a documentation deliverable, nothing for one to exercise — this package contains no runtime behaviour. Registering a QA engine to satisfy a phase that has no subject would be theatre.
- **What it leaves unsupported:** **Nothing. No QA pass is claimed, fabricated, or implied anywhere in this package.** The phase is recorded as a no-op rather than as a skipped step, and verification here is by file inspection and `git diff` against the named success criteria — see `00_method-and-provenance.md` §5 and `94_package-completeness-gate.md`.
- **Owner:** **NEU-986 (SUB-12)**, which answers the completeness gate and records the no-op there rather than leaving the item blank.
- **What would lift it:** A registered `qa-execution:engine` provider **and** a deliverable with runtime behaviour for it to exercise. Neither exists for this package, and the first without the second would not lift it.

---

<!--
Later sub-tasks: append your own `### SUB-<n>` section BELOW this comment. Do not edit any
section above your own. On conflict, keep both sides — NEU-986 (SUB-12) reconciles duplicates
once, at the end.
-->

### SUB-2

*Two entries. Both are limits on **quantifying** what this sub-task's conclusions establish qualitatively — a budget with no corpus to measure against, and a failure frequency with no population to measure over. Neither is a spike in disguise: no experiment available to this package produces either number, because both need artifacts that do not exist.*

**Deliberately not filed here:** the `qa-execution:engine` no-op. `../00_method-and-provenance.md` §5.1 states that a sub-task whose QA phase produced no execution *"records that fact and moves on; it does not report a pass it did not obtain, **and it does not file a cap for a check that was never applicable**."* The package-level statement is already `CAP-S1-3`, and this sub-task records the no-op in `../03_execution-environment-and-citation-drift-component.md` §9 instead. A second cap for the same never-applicable check would inflate the register's count without adding a gap.

#### `CAP-S2-1` — The re-run budget the `automated` gate class requires cannot be quantified by this package

- **Id:** `CAP-S2-1`
- **Cap:** `../C009-course-content-quality/09_enforceable-quality-system.md:70` states the `automated` class's cost as *"An execution environment, and a re-run budget."* This sub-task decides the **execution environment** half — `DR-C10-S2-2`, with an isolation boundary and a wall-clock bound. **It puts no number on the re-run budget:** not the per-unit wall-clock bound, not the per-revision re-run allowance, not the concurrency the authoring pipeline may spend on gate execution. The specification in `../03_execution-environment-and-citation-drift-component.md` §3.5 names the bound as **required** and leaves its value unset.
- **Why it is capped:** There is nothing to measure. NEU-890 specified 59 gates and implemented **none**; there are **0 content units**, so there are no nodes, no `test` instances and no authored approaches to run a battery over. A number produced here would be a guess with a unit attached, and it would then be inherited as though it were derived — the exact laundering `../00_method-and-provenance.md` §1.2 exists to prevent. It is **not** a spike, because no bounded experiment available to this package produces the number: `SPK-S2-1` could settle whether a bound is *needed* using a stand-in unit, and did, but it cannot settle what the bound should *be* without real authored approaches and real boundary inputs. It is **not** an open item, because no observable event available to this package closes it.
- **What it leaves unsupported:** Any downstream decision that depends on the **cost** of the gate battery rather than on its **existence**. Concretely: `OUT-8`'s deployment-shape decision, if it were argued on the authoring pipeline's compute footprint; and any claim that the authoring-time battery is affordable at a given corpus size. Neither claim may cite this package as its basis. The **qualitative** conclusion — that a host-enforced bound is required — is unaffected and rests on `SPK-S2-1`.
- **Owner:** **NEU-986 (SUB-12)**, which answers the package-completeness gate and records this as an unanswerable item rather than marking it passing — the alternative `91_…`'s own admission rule names.
- **What would lift it:** A corpus with placed content units and a running gate battery to measure against — that is, the state after NEU-890's gates are implemented and a real node carries real `test` instances. The first without the second would not lift it: an implemented battery with nothing to run over produces no budget either.

#### `CAP-S2-2` — How often the failure mode `SPK-S2-1` demonstrates actually occurs is unmeasurable here

- **Id:** `CAP-S2-2`
- **Cap:** `SPK-S2-1` establishes the **consequence** of a non-terminating authored unit: an in-process same-thread guard cannot fire, the host is unrecoverable, and every gate queued behind it dies. **It establishes nothing about how often a creator writes one.** This package therefore states that the boundary is required, and does **not** state that the failure is common, rare, or worth a given cost.
- **Why it is capped:** Frequency is a property of a population, and this programme's population is one creator and zero authored units. `../00_method-and-provenance.md` §1.1 is explicit that creator dogfooding is *"`n=1`, and the `1` is the person who designed it"*, and that a proxy signal may not be promoted to fill an external-validation gap. No experiment available to this package produces a rate: running the harness more times measures the harness, not the creators. It is **not** an open item — no observable event within this package's reach closes it — and it is **not** a spike, for the reason just given.
- **What it leaves unsupported:** Any cost-benefit argument about the isolation boundary — *"the boundary is worth its cost because runaway units are common"* — and any priority claim about implementing the bound early. `DR-C10-S2-2` deliberately makes **neither**: it argues from the consequence being unrecoverable and unobservable, which holds at any non-zero frequency, rather than from the frequency being high. A reader who needs the frequency argument does not have it.
- **Owner:** **NEU-986 (SUB-12)**, at the completeness gate, alongside `CAP-S1-1`'s and `CAP-S1-2`'s treatment of the package's other unmeasured quantities.
- **What would lift it:** Recorded gate-runner timeouts over a corpus authored by more than one creator — a production measurement over a population greater than one, which is `../00_method-and-provenance.md` §1.1's definition of external validation and which this programme does not have. Not a promise, and no event in this package produces it.

### SUB-3

*Three entries. One is a field set this package is forbidden to widen, one is a permanent maintenance cost this sub-task's own decision record creates and names, and one is an upstream requirement the codebase does not meet and this package cannot meet on its behalf.*

#### `CAP-S3-1` — The problem-citation record's field set is unresolved upstream, and this package may not widen it

- **Id:** `CAP-S3-1`
- **Cap:** `SC-S3-32` — the problem-citation record — carries **`stable_id` + `canonical_url` and nothing else**. `title`, numeric `constraints`, difficulty signal and curriculum placement are **not admitted**, and are routed upstream to ledger challenge **`CH-F5-1`**, which is unresolved at NEU-890's cutoff. The inventory therefore specifies a record that is **known to be narrower than a downstream consumer may need**, and states so at the entry rather than quietly carrying the wider set.
- **Why it is capped:** `../C009-course-content-quality/decision-records/DR-C09-01_permitted-field-set.md:17` names the **only** permitted route for a sub-task that needs a wider set: cite `CH-F5-1` by id and carry the unresolved field set as a cap with a named owner. It does not permit local widening, and `../00_method-and-provenance.md` §2.5's owner-attachment rule means this package cannot resolve another package's ledger challenge by asserting a preferred answer. It is **not** an open item: no observable event **within this package's reach** closes it — the resolving event belongs to NEU-890's ledger, not to any C010 sub-task. It is **not** a spike: no bounded experiment here decides what another package's decision ledger admits.
- **What it leaves unsupported:** Any downstream claim that a stored problem reference is sufficient to render, rank, place, or difficulty-sort a problem without a live fetch. Concretely: any component `SUB-4` places that would read `title` or `constraints` from local state; and any sizing argument that assumes citation records are self-describing. `SUB-13`'s authority assignment over `SC-S3-32` is unaffected — the authority question does not depend on the field count.
- **Owner:** **NEU-986 (SUB-12)**, which records it at the package-completeness gate as an item this package cannot answer, alongside the resolving owner named upstream in `CH-F5-1` itself.
- **What would lift it:** `CH-F5-1` resolving in NEU-890's decision ledger, either admitting the four contested fields or confirming the two-field set as final. Until then `SC-S3-32`'s field set is provisional-by-inheritance, and a later C010 sub-task re-reads the challenge rather than this entry.

#### `CAP-S3-2` — The inventory cannot be regenerated from the schema, permanently

- **Id:** `CAP-S3-2`
- **Cap:** There is **no script that reproduces `../04_state-category-inventory.md` from the database schema, and there will not be one.** The inventory is maintained by hand, and a schema change does not mechanically propagate into it.
- **Why it is capped:** The individuation rule `DR-C10-S3-1` selects has four discriminators — the writing component, the lifecycle/retention rule, the volatility class, and the store. **Two of the four are not present in the schema**: the writing component, and the prospective authority under an ownership model `SUB-6` has not yet selected. A generator could reproduce §4.1's fourteen tables; it could not reproduce the three splits, any of the ten process-local entries, any of the three derived entries, or any of the fifteen entries with no store — that is, 31 of 45 rows. It is **not** an open item: no event closes it, because the cause is the rule's design and the rule was chosen deliberately over the table-keyed alternative that *would* be generatable (`DR-C10-S3-1`, rejected alternative 1, which cannot represent two thirds of the problem). It is **not** a spike: nothing is uncertain here.
- **What it leaves unsupported:** Any claim that the inventory is automatically current with `src/`. Its freshness is exactly its stated verification cutoff, **2026-08-21**, and no later. A reader at a later cutoff re-runs §7.3's falsifiers rather than trusting the row set — which is why those falsifiers are published in advance and are each mechanically runnable.
- **Owner:** **NEU-986 (SUB-12)**, at the package-completeness gate; the recurring maintenance obligation itself falls on whichever sub-task or contributor changes the schema, per `DR-C10-S3-1`'s "one judgement per schema change".
- **What would lift it:** Nothing available to this programme. It would require the ownership model to be selected **and** the writing component of every category to be derivable from the schema itself — the second of which is a property the codebase does not have and that no C010 outcome proposes to give it. Recorded as permanent rather than deferred.

#### `CAP-S3-3` — The operational logs' retention window and deletion owner are required upstream and set nowhere

- **Id:** `CAP-S3-3`
- **Cap:** NEU-887's operational-log privacy gate requires a **stated retention window** and a **named deletion owner** for the learner payload held in `mcp_request_log` and `operation_event_log`. Neither is implemented, and **this sub-task sets neither.** `../04_state-category-inventory.md` §3.3 records the two entries with the gap named; `F-S3-3` states the finding in full.
- **Why it is capped:** Setting a retention window is a product and compliance decision about how long learner text may be held, and naming a deletion owner assigns an operational responsibility to a person or team. **Neither is a state-category question, and neither is any C010 outcome.** `OUT-2` enumerates and classifies; `OUT-3` assigns authority over categories, which is not the same as setting a retention policy over one. It is **not** an open item: no observable event within this package's reach closes it — `SUB-13` assigning authority over `SC-S3-16` does not produce a number of days, and `SUB-14` applying the isolation invariant does not name a deletion owner. It is **not** a spike: nothing here is settled by a bounded experiment.
- **What it leaves unsupported:** Any claim that this system's operational logging is compliant with NEU-887's privacy gate, and any claim that learner data held by this system is deletable on request — the second of which is currently false in a stronger sense than the cap alone conveys, because neither table carries a principal field to key a deletion on. Any `PLA-*` derived extract (`SC-S3-41`) inherits the same gap, since the gate requires the retention statement on the derivative as well as on the raw result.
- **Owner:** **NEU-986 (SUB-12)**, which records it at the package-completeness gate as an unmet upstream requirement rather than marking the gate passing — the treatment `91_…`'s own admission rule names.
- **What would lift it:** A retention window and a named deletion owner recorded against both tables, plus a principal field to key per-learner deletion on. The third is a schema change no C010 sub-task makes; the first two are decisions outside this charter's outcomes entirely.

### SUB-4

*One entry — a deliberate **second sighting** of a gap `CAP-S3-3` already carries, filed from the placement direction because it establishes something the first sighting does not: that the gap is not merely unassigned but currently **unassignable**. Two sub-tasks independently capping the same gap is signal, and duplicates in this register are recorded rather than tidied.*

**Deliberately not filed here: the automated QA no-op.** `qa-execution:engine` and `qa-execution:host` are unconfigured in this repository's capability registry, so the automated QA phase is a genuine Core Article 8 no-op for this sub-task. It is **not** a cap, because `../00_method-and-provenance.md` §5.1 is explicit that a sub-task *"does not file a cap for a check that was never applicable"*. `CAP-S1-3` already carries the package-level statement; this is the same no-op, not a second one. The disposition is recorded in `../05_system-context-and-responsibility-boundaries.md` §13's verification note, which is where a verification fact belongs.

**Also deliberately not filed here: `OI-S3-2`.** The item SUB-3 filed with this sub-task as its named owner offered a cap as one of two permitted outcomes. It is **discharged by publication instead** — `../05_…` §8 names the reading component and the copy disposition for both `SC-S3-37` and `SC-S3-40` — and the disposition is recorded in `../90_open-items-and-provisional-register.md`'s `### SUB-4` section. Filing a cap for a question this sub-task actually answered would misreport the package's completeness in the direction that matters most.

#### `CAP-S4-1` — No component in the published model can be the operational logs' deletion owner, and the obstruction is structural

- **Id:** `CAP-S4-1`
- **Cap:** `../05_system-context-and-responsibility-boundaries.md` places twenty components, and **none of them can be named the deletion owner for `SC-S3-16` (`infrastructure.mcp_request_log`) or `SC-S3-17` (`infrastructure.operation_event_log`).** This sub-task names none, and states why naming one would be worse than naming none: **a deletion owner must be able to enumerate one learner's rows in both tables, and no component can do that while neither table carries a principal field.** Naming an owner today would name a component that provably cannot perform the duty.
- **Why it is capped:** `CAP-S3-3` capped the missing retention window and deletion owner as a product-and-compliance decision outside every C010 outcome. This entry caps a different and narrower thing — the **placement** consequence — and it is capped rather than opened because **no observable event within this package's reach closes it.** `SUB-13 (NEU-977)` assigning authority over `SC-S3-16` does not create a principal column; `SUB-14 (NEU-978)` applying the isolation invariant finds no column to apply it to; and the mapping that would make enumeration possible, `SC-S3-45`, is itself `assumed` under **`A-28`** with no store. It is **not** a spike: nothing here is settled by a bounded experiment, and it is **not** an open item for the reason just given. It is filed **knowing `CAP-S3-3` exists**: the register's own rule is that two independent sightings of the same gap are signal, and duplicates are not tidied away.
- **What it leaves unsupported:** Any claim that this system's component model is complete with respect to NEU-887's operational-log privacy gate; any claim that a per-learner deletion request is expressible against the placed components; and any downstream sizing of `CMP-S4-20` (the operational-log derived-extract producer) that assumes its inputs are deletable — `SC-S3-41` is the only category in the entire inventory that carries "a named deletion owner" as part of its own definition, and it inherits the gap from the two categories it derives from. It also leaves `../05_…` §9.1's disposition table with a uniform **"inherits and does not fix"** against NEU-890's `OI-S6-5`, which this cap does not improve.
- **Owner:** **NEU-986 (SUB-12)**, at the package-completeness gate, recorded alongside `CAP-S3-3` as the same gap sighted twice — once from the state inventory, once from the component placement — rather than merged into it.
- **What would lift it:** A principal field on both log tables, or `SC-S3-45` given a store, either of which turns the deletion owner from **unassignable** into merely **unassigned** — at which point `SUB-13 (NEU-977)` can assign it and this entry collapses into `CAP-S3-3`. Neither is a change any C010 sub-task makes; both are schema changes outside this charter's outcomes. Recorded as a precondition, not as a promise.

### SUB-5

*One entry — the limit on what publishing an invariant can establish when nothing in the package can satisfy it. It is filed because the gap between "well-formed" and "satisfiable" is invisible in the deliverable itself: a procedure that returns a verdict on every category it is given looks complete whether or not any category can ever pass.*

**Deliberately not filed here: the automated QA no-op.** `qa-execution:engine` and `qa-execution:host` are unconfigured in this repository's capability registry, so the automated QA phase is a genuine Core Article 8 no-op for this sub-task too. It is **not** a cap — `../00_method-and-provenance.md` §5.1 is explicit that a sub-task *"does not file a cap for a check that was never applicable"* — and `CAP-S1-3` already carries the package-level statement. This is the same no-op, sighted a fourth time, not a new one. The disposition is recorded in `../06_isolation-invariant-and-the-neu-893-split.md` §8's verification note, following the placement SUB-2 and SUB-4 established. **No QA pass is claimed and none was fabricated.**

**Deliberately not filed here: a third sighting of the deletion-owner gap.** `CAP-S3-3` caps the missing retention window and deletion owner; `CAP-S4-1` caps its structural unassignability from the placement direction. This sub-task reaches the same two categories from a **third** direction — `SC-S3-16` and `SC-S3-17` return verdict `not-evaluable` under the isolation invariant, so no question about their isolation can be answered in either direction (`../06_…` §3.6 case 2). That is a genuinely distinct consequence and it is recorded, but **as a property of the invariant's verdict set rather than as a third cap**: the underlying gap, its owner and its lifting condition are identical to `CAP-S4-1`'s, and a third entry would multiply the register without adding a party, a precondition or an unsupported claim. The register's duplicate-tolerance rule admits second sightings as signal; it does not oblige a sighting per direction.

#### `CAP-S5-1` — The isolation invariant is published with **zero** positive instances: shown well-formed, never shown satisfiable

- **Id:** `CAP-S5-1`
- **Cap:** `../06_isolation-invariant-and-the-neu-893-split.md` §3 publishes the isolation invariant as a decision procedure and demonstrates that it terminates, returning five different verdicts over five state categories. **Not one of them — and, as §4.2 establishes, not one of the 45 — reaches verdict `holds`.** This package therefore establishes that the invariant is **well-formed**: it has a named domain, ordered checks answerable from cited artifacts, and a closed verdict set in which every category lands exactly once. It does **not** establish that the invariant is **satisfiable** — that any state category, in any reachable state of this system, can pass all five checks. No positive instance exists anywhere in the package, and the demonstrations are all failures or exemptions.
- **Why it is capped:** Producing one positive instance requires three things to be simultaneously true, and **no C010 sub-task makes any of them**: an ownership key on the store (`NEU-850's OUT-2`, converged but unimplemented), the reaching query bodies scoped at or below the port boundary (`SUB-8 (NEU-981)`'s blast radius, which SUB-8 sizes and does not build), and an identity gate on the STDIO transport, which **does not exist as a component at all** (`src/transport/main.ts:55`–`:59`; `BND-S4-17`, owner `nobody`). No reading settles it, because the thing to be established is a property of running code rather than of a document. No bounded experiment settles it, so it is **not a spike**. And no observable event within this package's reach closes it, so it is **not an open item** — which is exactly why `OI-S5-3`, the *unexercised-against-a-real-matrix* item, is filed separately: that one has a resolving event (SUB-14 publishes) and this one has none.
- **What it leaves unsupported:** Any claim that the isolation outcome `OUT-4` describes is **achievable** as specified — as opposed to well-specified. Any downstream plan that treats "apply the invariant" as a step with a reachable success state, rather than as a measurement whose current answer is uniformly negative. Any reading of `SUB-14 (NEU-978)`'s forthcoming per-row application as a *test the system can pass*: at this cutoff every in-domain row returns `fails-transport` or worse, and a uniform negative result is a fact about the system rather than a defect in SUB-14's application. It also leaves unsupported the converse — nothing here shows the invariant is **un**satisfiable either; the honest statement is that satisfiability is untested in both directions, and this package could not have tested it.
- **Owner:** **`NEU-986 (SUB-12)`**, at the package-completeness gate, which must weigh an outcome whose deliverable is complete and whose subject matter has no demonstrated positive case. Named alongside **NEU-893**, which is the party positioned to produce the first positive instance and for which this cap is the standing definition of done.
- **What would lift it:** **One state category evaluating to `holds`** — which requires all three preconditions above to land together, since the invariant's ordered checks mean any one of them missing returns a failure verdict before the others are reached. The most likely first candidate is a durable learner-scoped category on the HTTP path once `NEU-850's OUT-2`, port-level scoping and a STDIO gate are all in place; nothing here reserves that outcome or predicts it. Recorded as a precondition, not as a promise.

### SUB-6

**Deliberately not filed here.** Two limits surfaced during this sub-task and neither is filed as a new cap.

- **The `qa-execution:engine` no-op.** The automated QA phase is a genuine Core Article 8 no-op for this sub-task as for every other in the package — the capability registry resolves to `git, linear` and no QA execution provider is registered, so no QA pass exists and none is claimed. **`CAP-S1-3` already carries this at package level**; a per-sub-task duplicate would make a single package-wide condition look like six independent ones.
- **The deletion-owner gap on `SC-S3-16` / `SC-S3-17`.** This is the **fourth** sighting of the gap `F-S3-3` opened and `CAP-S4-1` capped, and it is load-bearing here: criterion `C6` in `../07_state-ownership-model-selection.md` §3.3 is scored against it. Following the precedent SUB-4 and SUB-5 set, the new **consequence** — that under the selected model the gap is frozen exactly as `CAP-S4-1` describes it, because no new log producer is introduced — is recorded in `../decision-records/DR-C10-S6-1_state-ownership-model.md` § Consequences rather than as a fourth register entry. A structural gap does not become more owned by being filed again.

#### `CAP-S6-1` — The two-writer divergence this comparison rejects `M-B` for was never observed against a live database

- **Id:** `CAP-S6-1`
- **Cap:** The claim that the read-modify-write pattern this codebase uses for learner state **actually loses an update** when two independent writer processes race it against a live Postgres under the default isolation level was **not observed**. It is derived from reading the code and the database schema, not from watching it happen. No two-process harness was run, and no `M-B`-shaped deployment was stood up and stressed.
- **Why it is capped:** No Postgres instance was reachable at this sub-task's cutoff. Five connection probes were attempted — `127.0.0.1:5432`, `127.0.0.1:5433`, `localhost:5432`, `postgres:5432` and `db:5432` — and all five returned `ECONNREFUSED` or timed out; no `DATABASE_URL` is present in the environment and the repository carries only `.env.example`. `../92_spike-register.md` §2's three-way rule admits a spike, a cap with a named owner, or a read; **asserting is not an available third option**, and the observation this claim needs cannot be made without a database. The *readable* half of the claim was read rather than capped and is recorded in full at `../07_state-ownership-model-selection.md` §3.1 — eight facts, each cited to a path and line range: the scheduling write is read-modify-write (`src/orchestration/review-workflows.ts:35`, `:60`–`:89`, `:99`), the codebase's own comment states its single-writer premise (`:190`–`:191`), no optimistic concurrency control exists anywhere in `src/`, no transaction sets an isolation level (`src/infrastructure/db/operations.ts:21`–`:24`), and `learning_sessions` has no partial unique index behind its one-active-**learning session** invariant (`src/infrastructure/db/schema.ts:99`–`:124`).
- **What it leaves unsupported:** Any claim that divergence under two writers has been **demonstrated** in this system, as opposed to being unprevented by anything in the code or the database schema. Any quantitative claim about how *often* a race would be lost, or how wide the window is — the source comment calls it "small" (`src/orchestration/review-workflows.ts:190`) and nothing here measures it. Any claim that a *carefully drawn* `M-B` partition would fail in practice. It does **not** leave `M-B`'s rejection unsupported: that rejection rests on the readable facts — nothing prevents divergence, and the codebase states a premise `M-B` falsifies — plus the independent durability-property disqualification at `../07_…md` §7, neither of which needs the unobserved half. **The cap is on the strength of the evidence, not on the conclusion.**
- **Owner:** **`SUB-10 (NEU-984)`**, which decides data-store topology under `OUT-8` and must therefore stand up a store to reason about one; it is the first party in this charter positioned to make the observation, and it is already the consumer of this chapter's reversal check (`OI-S6-1`). Named alongside **NEU-896**, the implementation charter that would have to fix the pattern if the observation confirms it, and for which this cap is the standing reason to treat the single-writer premise as load-bearing rather than incidental.
- **What would lift it:** **A two-process harness run against a reachable Postgres**, under the default isolation level, exercising the `getChunk → compute → persistReviewUpdate` sequence concurrently from two processes and recording whether the second write silently discards the first. Filed under `../92_spike-register.md`'s template, quarantined to `_local/scratch/`, with its result stated in full and an expiry. That is a spike this sub-task would have run had a database been reachable, and its absence is a property of the environment at this cutoff — not of the question's tractability.

### SUB-13

**No new cap.** Stated explicitly rather than by omission, because an empty section and a missing section read the same way at the completeness gate, and this register's reconciling owner (`NEU-986 (SUB-12)`) needs to be able to tell them apart.

Every limit this sub-task encountered was either **assignable** (and was assigned), **routable** (and was routed as a finding to a named owner), or **already capped** by an entry above. There was no limit left over that no party can act on — which is this register's admission test, and this sub-task did not meet it.

Recorded for the reconciliation, the four existing caps that bound `../08_per-state-authority-matrix.md`, each **cited at the point of use and none re-filed**:

- **`CAP-S4-1`** — no component in `../05_…md`'s inventory can be the deletion owner for `SC-S3-16` or `SC-S3-17`, and the obstruction is **structural**. **It stays open and this sub-task does not close it.** The matrix assigns both rows a write authority (`CMP-S4-9`, written through `CMP-S4-19`), because **deletion ownership is not write authority** — two different questions, and the rule answers only the second. `../05_…md` §9.2's unblocking condition is unchanged: a principal field on both tables, or `SC-S3-45` given a store, turns the deletion owner from *unassignable* into merely *unassigned*, and only then can it be assigned. `SC-S3-41`'s row is the constructive counterpart — an extract carrying **its own** retention window and named deletion owner — and its migration-path cell records that shipping it without both would reproduce this cap one layer up rather than resolve it.
- **`CAP-S3-1`** — the problem-citation field set is frozen at `stable_id` + `canonical_url` under `DR-C09-01`, with the wider set carried against ledger challenge `CH-F5-1`. `SC-S3-32`'s row **does not widen the set** and cites the cap at the row rather than re-filing it.
- **`CAP-S1-3`** — no QA pass exists for this package. Cited, not duplicated. It applies unchanged to `../08_…md`: the chapter's two audits are mechanical checks over its own row set, and a mechanical self-audit is not a QA pass.
- **`CAP-S6-1`** — two-writer divergence could not be observed, so the cap is on evidence strength rather than on the conclusion. It bears on `SC-S3-21`'s row, whose migration-path cell states that per-process trip state lets *n* processes hold *n* opinions about whether Tier-2 blocking is tripped, and that the **cost** of that divergence is capped evidence rather than a measured quantity.

Two limits that might look like caps and are deliberately not filed as such, so the reconciliation is not left guessing:

- **The two rows the assignment rule under-determined** (`SC-S3-33`/`SC-S3-34`, and `SC-S3-45`) are **findings, not caps** — `F-S13-1` and `F-S13-2`, both routed to **`SUB-6 (NEU-976)`**, which owns the rule and can act. A cap is for a limit no available party settles; these have an available party.
- **The migration destination for the eighteen store-`none` categories** is an **open item, not a cap** — `OI-S13-1`, owner **`SUB-10 (NEU-984)`**, with an observable resolving event inside this charter's reach. That is precisely the distinction this register draws against `../90_…md`.

### SUB-14

**No new cap.** Stated explicitly rather than by omission, following SUB-13's precedent, because an empty section and a missing section read identically at the completeness gate and this register's reconciling owner (`NEU-986 (SUB-12)`) needs to tell them apart.

Every limit this sub-task encountered was **routable** (and was routed as one of eleven `F-S14-*` findings, each naming an owning sub-task), **already capped** by an entry above, or **already answered by a merged record** (the worker-terminability claim, settled by `SPK-S2-1` arrangement C — see `92_spike-register.md`'s `### SUB-14` note, which discloses that this sub-task measured it before re-reading the register and reports the run as a **replication, not a new spike**). Nothing was left over that no party can act on, which is this register's admission test.

**Three uncertain-and-material claims were deliberately *not* spiked, because a cap with a named owner already covers them.** Asserting them was not an available third option and none is asserted:

- **`CAP-S6-1`** — two-writer divergence **could not be observed**; five Postgres probes refused or timed out at SUB-6's cutoff, and no `DATABASE_URL` exists in this environment either. The cap is on **evidence strength, not on the conclusion**, and its named owner is **`SUB-10 (NEU-984)`**, alongside **NEU-896**. It bounds `09_authority-matrix-validation.md` §9 throughout: that section states what the matrix **requires** and what the code **fails to prevent** — nine rows carry a serialization requirement, no optimistic concurrency control exists in `src/`, no transaction sets an isolation level (`src/infrastructure/db/operations.ts:21`–`:24`), and `F-S6-2` records `reviewPersistence` absent from `UnitOfWorkPort`'s `TransactionPorts` — and asserts **nothing** about what was observed. **Re-running a probe already recorded as unrunnable would add no evidence, so it was not re-run and no duplicate cap is filed.** The lifting condition is unchanged.
- **`CAP-S5-1`** — the invariant's **satisfiability** is untested. `09_…md` §6 finds **zero `holds` across 90 row-evaluations**, which is consistent with unsatisfiability **and** with a merely-unimplemented mechanism; `06_…md` §3.4.1's asymmetry means a census **cannot** distinguish them. The cap therefore stands unchanged and this sub-task does not claim to have narrowed it. Owner: **SUB-5 / NEU-893**.
- **`CAP-S4-1`** — no component in `05_…md`'s inventory can be the deletion owner for `SC-S3-16` or `SC-S3-17`, and the obstruction is **structural**. **It stays open and this sub-task does not close it.** This is its **fifth sighting** (SUB-3, SUB-4, SUB-6, SUB-13, here), and this chapter records a **new consequence** rather than a new cap: §11's recovery walk classifies both categories as **R5 — not recoverable by construction**, because the only source that could reconstruct either is itself, and **`SC-S3-17` is read by the Tier-2 blocking gate**. A record that cannot be completed, cannot be deleted by anyone in particular, and is read by a blocking gate is the sharpest form the cap has taken. The unblocking condition in `05_…md` §9.2 is unchanged.

Recorded for the reconciliation, the two further existing caps that bound this chapter, **cited at the point of use and neither re-filed**:

- **`CAP-S1-3`** — **no QA pass exists for this package.** It applies unchanged here: the `qa-execution:engine` surface is unconfigured, so scenario execution is a genuine **Core Article 8 no-op**, the scenarios authored for NEU-978 are marked **`NOT RUN`**, and **no QA pass is claimed anywhere in `09_…md`**. A mechanical parse of the matrix is not a QA pass, and neither is a documentation gate.
- **`CAP-S3-1`** — the problem-citation field set is frozen at `stable_id` + `canonical_url` under `DR-C09-01`, with the wider set carried against ledger challenge `CH-F5-1`. §13's durability walk **relies on that narrowness**: because `SC-S3-32`'s whole content is those two fields, a retirement cannot carry collateral state into the evidence chain. The cap is cited at that verdict and the set is not widened.

Two limits that might look like caps and are deliberately **not** filed as such, so the reconciliation is not left guessing:

- **The two undefined scenario outcomes** (`SC-S3-42`'s divergence, `SC-S3-31`'s conflicting write) are **findings, not caps** — `F-S14-4` routed to **NEU-891**, `F-S14-5` routed to **`SUB-10 (NEU-984)`**. A cap is for a limit no available party settles; both of these name an available party, and the matrix named it first.
- **The re-run obligation against SUB-16's post-absorption revision** is an **open item, not a cap** — `OI-S14-1`, owner **`SUB-16 (NEU-980)`**, with an observable resolving event inside this charter's reach.
