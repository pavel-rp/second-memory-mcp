# 90 — Open Items and Provisional Register

**Task:** NEU-971 (SUB-1) opens it · **Charter:** C010 (umbrella NEU-895) · **Opened:** 2026-08-21
**Model:** claude-opus-5[1m]
**Owner:** every sub-task owns its own entries. **No single owner reconciles this file** — that is `91_caps-and-incomplete-scope.md`'s arrangement, not this one.

---

## What belongs here

Every `[unconfirmed]` item in this package that is **material** and **not** a stand-in for one of the four unbuilt upstream packages, plus every **provisional reliance** — a place where a decision leans on something that may yet change.

**What does not belong here:**

- A stand-in for **NEU-891 / NEU-892 / NEU-893 / NEU-894** → `93_stand-in-assumption-register.md`. That register is **closed** at five entries; see its admission rule.
- Something this package will **not** resolve at all → `91_caps-and-incomplete-scope.md`.
- A bounded experiment that would settle the question → `92_spike-register.md`.
- A fact about the programme's own shape → `02_findings-register.md`.

An open item is not a cap. **An open item has a resolving event; a cap is an admission that there is none.** Filing a cap as an open item overstates the package's completeness, and filing an open item as a cap understates it.

## Append convention

> Each sub-task appends its own `### SUB-<n>` section. No sub-task reflows, renumbers, or rewrites another sub-task's entries. On a merge conflict in this file, keep **both** sides.

**Keep both sides is not a suggestion.** Sibling sub-tasks run concurrently and cannot see each other's working trees. The default conflict resolution — pick one side — silently deletes a sibling's open item, and a silently deleted open item is worse than one never filed: the package then reads as complete while carrying an unowned gap. A visible duplicate is the intended failure mode.

**Do not tidy duplicates in flight.** A duplicate entry is correct-by-convention until the package is complete.

## Id namespacing (there is no global counter in this file)

Ids are **`OI-S<n>-<k>`**, where `<n>` is the sub-task number and `<k>` restarts at `1` inside that sub-task's own section. SUB-4 allocates `OI-S4-1`, `OI-S4-2`, …; SUB-7 allocates `OI-S7-1`, … — concurrently, without coordination, and without collision.

**This is why there is no global numbering anywhere in this register.** A global counter would mean that appending a section obliges its author to know what every concurrent sibling has already allocated, and a merge would then oblige someone to renumber — breaking every cross-reference already written against the old numbers. The namespaced form makes an append a **clean addition**: a new section, new ids, nothing above it touched.

Cite an open item in its full form (`OI-S5-2`), never as a bare `OI-2`.

## Stable field set (the same fields on every entry, in this order)

Entries are written as **blocks rather than table rows**, and the field list below is the stable column set rendered vertically. Blocks are used deliberately: a table row carrying eight long cells is a single line, so two sub-tasks appending rows to one table conflict on adjacent lines, while two sub-tasks appending whole sections do not overlap at all.

| Field | What it records |
| --- | --- |
| **Id** | `OI-S<n>-<k>` |
| **Item** | The `[unconfirmed]` claim or provisional reliance, stated as a claim rather than a topic. |
| **Status** | `[unconfirmed]` or `provisional`. |
| **Source** | The citation that establishes the item exists — a real path with a line where the claim is line-specific, or an upstream package with its version or compilation date. |
| **Consumer** | The sub-task that must act on it, named as `SUB-<n> (NEU-…)`. |
| **Owner** | Who is accountable for resolving it. Usually the consumer; never "the package". |
| **Resolving event** | The **observable event** that closes it. Never a date, never a party's satisfaction. |
| **Why not a stand-in** | The admission-rule check, recorded so the split between this register and `93_…` stays auditable. |

An entry missing any field is a defect. `NEU-985 (SUB-11)` audits for it.

---

## Entries

### SUB-1

*Three entries. These are the charter's numbered assumptions 19, 30 and 31 — the `[unconfirmed]` items that are **not** stand-ins for the four unbuilt packages, filed here so they do not dilute `93_stand-in-assumption-register.md`.*

#### `OI-S1-1` — An authoring-time execution environment is implied by NEU-890's `automated` gate class

- **Id:** `OI-S1-1`
- **Item:** NEU-890 selects no runtime, compiler, sandbox or execution environment **for the learner path**, but its `automated` gate class is defined as requiring "an execution environment, and a re-run budget", and gate `EQ-S4-6` runs an authored approach over authored fixtures at authoring time. **Whether an authoring-time execution environment is an architectural component of the selected system — and with what isolation, trust and resource boundary — is unresolved.** It is recorded as a tension to resolve, not as a settled placement.
- **Status:** `[unconfirmed]`
- **Source:** `../C009-course-content-quality/09_enforceable-quality-system.md:70` (NEU-890, compiled 2026-08-10). Counterpart evidence for the learner path: `../C009-course-content-quality/06_assessment-evidence-out-of-band.md:54,409` and `../C009-course-content-quality/decision-records/DR-C09-04_authoring-languages.md:92`.
- **Consumer:** **SUB-2 (NEU-972)**
- **Owner:** SUB-2 (NEU-972)
- **Resolving event:** SUB-2 publishes its topic document under `docs/research/C010-system-and-repository-architecture/` recording, in terms `OUT-9` can be answered against, **whether an authoring-time execution environment is an architectural component** — and, if it is, its isolation, trust and resource boundary. The item closes on that document landing on `origin/develop`, whichever way it decides.
- **Why not a stand-in:** It stands in for nothing. NEU-890 is **built and published**; this is a genuine open question inside a delivered upstream package's output, not a placeholder for an unbuilt one. Filing it in `93_…` would put a fifth package in a register whose contract is four.

#### `OI-S1-2` — The authenticated subject a token yields may be an OAuth client, not a human learner

- **Id:** `OI-S1-2`
- **Item:** `payload.sub || azp` resolves to the **OAuth client** for client_credentials grants — Rauthy sets `sub=null` there — and the deployment's own smoke tests use exactly that grant. **Whether the production learner flow yields a human `sub` at all is unverified.** Every isolation and authority decision that treats "the authenticated subject" as "the learner" rests on this until it is confirmed against a live token.
- **Status:** `[unconfirmed]`
- **Source:** `src/transport/jwt-middleware.ts:116,127`; `.github/workflows/cd-prod.yml` (smoke job).
- **Consumer:** **SUB-5 (NEU-975)**. **Also named as an input to NEU-893** — it is one of the threat cases `OUT-4` hands on, and NEU-893 is the package positioned to confirm it against production.
- **Owner:** SUB-5 (NEU-975)
- **Resolving event:** **A live production token is inspected and its `sub` claim recorded** — the observable event is the recorded inspection result, not the decision to look. SUB-5 records the `sub`-versus-`azp` threat case against the isolation invariant either way; the item closes when NEU-893 publishes the recorded inspection. Until then every decision resting on it names `OI-S1-2` in place.
- **Why not a stand-in:** It is a fact about **this repository's existing transport layer**, verifiable today against `src/`, not an assumption standing in for an unbuilt package. NEU-893 is the natural *confirmer*, which is not the same as this being a stand-in *for* NEU-893 — that role is `A-28`'s, and conflating the two would put a repository fact into NEU-896's reconciliation list.

#### `OI-S1-3` — Hosting region, provider, TLS termination, backup and monitoring are not discoverable in the repository

- **Id:** `OI-S1-3`
- **Item:** The repository contains **no IaC, no reverse-proxy configuration, no monitoring configuration** and no runbook beyond `docs/runbooks/classifier-blocking-activation.md`. Hosting region, hosting provider, TLS termination, backup arrangements and monitoring arrangements are therefore **not discoverable from the tracked tree**. The only signals are a `deploy` VPS user, an `.ee` domain on the test host, and the Rauthy AS.
- **Status:** `[unconfirmed]`
- **Source:** Repository sweep, 2026-08-19, recorded in the C010 charter's assumption table.
- **Consumer:** **SUB-10 (NEU-984)**
- **Owner:** SUB-10 (NEU-984)
- **Resolving event:** **The operator answers, and the answer is published in this package** — each of the five facts either recorded with the operator's answer cited as its source, or converted to a `CAP-S10-<k>` entry in `91_caps-and-incomplete-scope.md` stating which fact remains unknown and what decision it leaves unsupported. The item closes on that document landing. **Anything this package needs from these is `[unconfirmed]` and confirmed with the operator rather than assumed** — a plausible guess about a hosting region is not a resolution of this item.
- **Why not a stand-in:** It is a gap in **operational knowledge about the existing deployment**, not a placeholder for an unbuilt package's requirements. No one of NEU-891/892/893/894 landing would answer it; only the operator would.

---

<!--
Later sub-tasks: append your own `### SUB-<n>` section BELOW this comment, in sub-task order
where that is convenient and anywhere below it where it is not. Do not edit any section above
your own. On conflict, keep both sides.
-->

### SUB-2

*Two entries, plus the recorded disposition of **`OI-S1-1`** — the item SUB-1 filed with SUB-2 as its named consumer and owner. **SUB-1's section above is untouched.** The closure is recorded here, inside SUB-2's own section, because the append convention permits a sub-task to add its own section and nothing else; editing SUB-1's entry to mark it closed would be exactly the rewrite the convention forbids.*

#### Disposition of `OI-S1-1` — **resolved**

**This block is a disposition record, not an entry.** It carries no `OI-S2-<k>` id and is not counted as an open item; it exists so that a reader of SUB-1's `OI-S1-1` can find its outcome without opening a tracker.

- **Item, as SUB-1 filed it:** *"Whether an authoring-time execution environment is an architectural component of the selected system — and with what isolation, trust and resource boundary — is unresolved."*
- **Disposition:** **Resolved.** It **is** an architectural component. Its isolation boundary is a **terminable isolate per executed unit** with a **host-enforced wall-clock bound**; its trust boundary is **first-party, creator-authored code**, and the isolation exists for **liveness and resource reclamation**, not for containment of hostile code.
- **Where the resolution lives:** `../03_execution-environment-and-citation-drift-component.md` §3.4–§3.5 and `../decision-records/DR-C10-S2-2_authoring-time-execution-boundary.md`, resting on **`SPK-S2-1`**.
- **Resolving event, as SUB-1 stated it:** *"SUB-2 publishes its topic document … recording … whether an authoring-time execution environment is an architectural component … The item closes on that document landing on `origin/develop`."* **That is the event this change performs.** Until the merge lands, the item is resolved-pending-merge, not closed.
- **Owner after closure:** none — the item is closed, not transferred. **But the resolution is only as fresh as `SPK-S2-1`**: on that record's expiry the conclusion is stale and must be re-run or re-labelled (`../92_spike-register.md` §6). A stale conclusion does not reopen this item; it makes every document citing it stale, which is a defect in the citing document.
- **What was *not* resolved here, and is filed as its own entry:** which authority owns the gate-verdict state the component writes (**`OI-S2-2`**), and what scheduling mechanism drives the out-of-band producer (**`OI-S2-1`**). Neither was in `OI-S1-1`'s statement.

#### `OI-S2-1` — The scheduling mechanism that drives the out-of-band drift-verdict producer is unselected

- **Id:** `OI-S2-1`
- **Item:** `../03_execution-environment-and-citation-drift-component.md` §4.2 specifies a component whose trigger is **out of band, always** — the serve-time trigger *enqueues* per served citation and never executes inline. **What performs the dequeue is unselected.** A cron-style periodic pass, a queue worker, a job runner co-located with the MCP core process, and an operator-triggered batch are all consistent with the specification, and they differ materially in what the deployment substrate must provide. The component's *specification* is settled; its *scheduling mechanism* is not.
- **Status:** `provisional` — the component specification is published and stable; this is a reliance on a substrate decision that has not been taken.
- **Source:** `../03_execution-environment-and-citation-drift-component.md` §4.2 (Trigger); `../C009-course-content-quality/10_citation-drift-detection-and-revalidation.md:103` (NEU-890, compiled 2026-08-11) — *"the serve-time trigger fires **per served citation**, never as a corpus-wide walk"*, which fixes the trigger's granularity and says nothing about its mechanism.
- **Consumer:** **SUB-10 (NEU-984)**
- **Owner:** SUB-10 (NEU-984)
- **Resolving event:** **SUB-10 publishes its substrate document naming the scheduling mechanism** — or filing a `CAP-S10-<k>` stating that it does not select one and what that leaves unsupported. The item closes on that document landing on `origin/develop`, whichever way it goes. A plausible guess at a mechanism is not a resolution.
- **Why not a stand-in:** It stands in for nothing. No unbuilt upstream package would answer it: NEU-891, NEU-892, NEU-893 and NEU-894 decide tutoring, UI, production integration and handoff respectively, and none of them selects this package's own scheduling substrate. It is a decision **this** package owes, allocated to the sub-task that owns the substrate.

#### `OI-S2-2` — The gate-verdict state the authoring-time execution component writes has no assigned authority

- **Id:** `OI-S2-2`
- **Item:** `../03_execution-environment-and-citation-drift-component.md` §3.5 specifies that the authoring-time gate runner writes **one gate verdict per executed unit** onto that unit's review record. **Which authority owns that state category is unassigned.** The same gap exists for the drift-verdict store of §4.2 and the cache of §4.3 — three state categories, each requiring **exactly one** authority. This sub-task states the requirement and assigns none; assigning one here would pre-empt the authority matrix and risk two owners for one category.
- **Status:** `[unconfirmed]` — the requirement (*exactly one authority*) is stated and load-bearing; the assignment is not made.
- **Source:** `../03_execution-environment-and-citation-drift-component.md` §3.5 (Authority requirement), §4.2 and §4.3 (same field); `../01_outcome-register.md` `OUT-9`'s verified-by line, which names *"its verdict store in the `OUT-3` authority matrix"* as part of this outcome's verification.
- **Consumer:** **SUB-13 (NEU-987)**
- **Owner:** SUB-13 (NEU-987)
- **Resolving event:** **SUB-13 publishes the `OUT-3` authority matrix with exactly one authority named for each of the three state categories** — the gate-verdict record, the drift-verdict store, and the drift-verdict cache. The item closes on that matrix landing on `origin/develop`. A matrix that omits one of the three, or names two owners for one, does not close it.
- **Why not a stand-in:** It is a decision **this** package owes and has explicitly allocated, not a placeholder for an unbuilt package. `OUT-3` is a C010 outcome with a named sub-task; nothing about NEU-891/892/893/894 landing would assign it, and filing it in `93_…` would put a resolvable in-package allocation into a register whose contract is four unbuilt packages.

### SUB-3

*Two entries. Both are questions this inventory deliberately poses and does not answer, because answering either would pre-empt a sub-task that owns the answer. Neither stands in for an unbuilt upstream package.*

#### `OI-S3-1` — The learner-scoping answer is open for most of the inventory, and the inventory records the question rather than guessing

- **Id:** `OI-S3-1`
- **Item:** `../04_state-category-inventory.md` §2 defines `Learner-scoped` as a column that records the scoping **question**, never a schema fact, and §6 establishes why: a search of `src/infrastructure/db/schema.ts` for `user_id`/`userId`/`learner_id`/`learnerId` returns **zero matches** at the 2026-08-21 cutoff, so no ownership column exists to read an answer off. **The majority of entries therefore carry `question — open`.** `NEU-850's OUT-2` commits learner ownership to the MCP core database schema keyed to the **JWT subject**, and this package consumes that commitment — but a commitment about *where* ownership lives is not an answer about *which* categories are learner-scoped.
- **Status:** `[unconfirmed]` — the question is posed per entry and is load-bearing; no entry's answer is asserted.
- **Source:** `../04_state-category-inventory.md` §2 (the column's definition), §3 (the per-entry values), §6 (the zero-match schema check and the consumed `NEU-850's OUT-2`).
- **Consumer:** **SUB-13 (NEU-977)** and **SUB-14 (NEU-978)**
- **Owner:** SUB-13 (NEU-977)
- **Resolving event:** **SUB-13 publishes the `OUT-3` authority matrix carrying a resolved learner-scoping value for every `SC-S3-*` row**, and **SUB-14 publishes its per-row judgement against `SUB-5`'s isolation invariant**. The item closes when both land on `origin/develop`. A matrix that carries the column forward still marked `question — open` does not close it; neither does a general statement that the system is single-tenant or multi-tenant.
- **Why not a stand-in:** It is not waiting on an unbuilt package. `A-28` already stands in for the *enforceability* of a learner-identity mapping, and `SC-S3-45` carries that as an `assumed` entry — this item is the separate, in-package question of which **existing** categories fall under it, which `OUT-3` allocates to a named C010 sub-task. Filing it in `93_…` would move a resolvable in-package allocation into a register whose contract is four unbuilt packages, and `93_…` is closed at five entries in any case.

#### `OI-S3-2` — Whether the two upstream-owned artifacts become state in this system, or stay upstream documents, is unassigned

- **Id:** `OI-S3-2`
- **Item:** Two `required-by-upstream` entries are unlike the other nine. `SC-S3-37` (the DP-map node and prerequisite-edge records) and `SC-S3-40` (the frozen measurement-contract register) **already exist as committed, gate-verified artifacts in their own upstream packages** — they are absent from *this* system's stores, not absent from the programme. **Whether either is imported into a store here, read in place as a versioned document, or never held by this system at all is undecided.** The inventory records them as categories because a component in this system reads them; it does not decide how.
- **Status:** `[unconfirmed]` — the categories are established and cited; the disposition is not chosen.
- **Source:** `../04_state-category-inventory.md` §3.6 (the two entries and the note distinguishing them), §5.3 and §5.1 (their upstream provenance: `../C005-dp-map-package/README.md:3`, v1.0.0, compiled 2026-07-16; `../C005-product-foundation/README.md:3`, dated 2026-07-12).
- **Consumer:** **SUB-4 (NEU-974)** and **SUB-10 (NEU-984)**
- **Owner:** SUB-4 (NEU-974)
- **Resolving event:** **SUB-4 publishes its component placement naming, for each of the two categories, which component reads it and whether that component holds a copy** — or files a `CAP-S4-<k>` recording that it does not decide and what that leaves unsupported. The item closes on that document landing on `origin/develop`, whichever way it goes.
- **Why not a stand-in:** Both upstream packages are **built and published**, not unbuilt — `93_…`'s entire contract is the four unbuilt packages NEU-891…NEU-894, and neither of these is one of them. Nothing about those four landing would answer this; it is a placement decision this package owes and has allocated to the sub-task that owns placement.

### SUB-4

*One entry, plus the disposition of the item SUB-3 filed with this sub-task as its named owner. Following the `OI-S1-1` precedent, that disposition is recorded **here, in SUB-4's own section**, and `OI-S3-2`'s entry above is left exactly as SUB-3 wrote it.*

#### Disposition of `OI-S3-2` — discharged by publication, not capped

- **Item:** `OI-S3-2` — whether `SC-S3-37` (the DP-map node and prerequisite-edge records) and `SC-S3-40` (the frozen measurement-contract register) become state in this system or stay upstream documents. Owner: **SUB-4 (NEU-974)**. Its resolving event was *"SUB-4 publishes its component placement naming, for each of the two categories, which component reads it and whether that component holds a copy — or files a `CAP-S4-<k>`."*
- **Disposition:** **Discharged by publication.** `../05_system-context-and-responsibility-boundaries.md` §8 names both, and **no `CAP-S4-<k>` is filed for either**:
  - **`SC-S3-37` — read by two components, and one in-system copy is held.** `CMP-S4-13` (the authoring pipeline) reads it to place a content unit on a node and is the **importer**; `CMP-S4-16` (the content serve path) reads the same imported copy to resolve a unit's node and prerequisite edges when selecting what to serve. The reasoning is published in §8.1 so it can be contested rather than re-derived: `SC-S3-38` is in-system learner-scoped state that references nodes and cannot express a reference to a document in another repository; and `CMP-S4-16` is on the learner's latency path with no egress and no execution, so it cannot read an upstream document in place at serve time.
  - **`SC-S3-40` — read by exactly one component, and no copy is held.** `CMP-S4-20` (the operational-log derived-extract producer) reads the register **in place** as the committed, versioned NEU-887 artifact. What crosses into this system is not the register but the **contract version identifier**, carried as an attribute of the extract derived under it (`FL-S4-22`). Nothing on the learner path and nothing on the authoring path reads it.
- **What the disposition does *not* decide:** the **authority** over the imported `SC-S3-37` copy — that is a state category like any other and belongs to `SUB-13 (NEU-977)`'s matrix — and what happens to the copy when the upstream graph changes, which is `OI-S4-1` below.

#### `OI-S4-1` — Whether a change to the upstream DP-map graph propagates into the imported copy is unassigned

- **Id:** `OI-S4-1`
- **Item:** `../05_system-context-and-responsibility-boundaries.md` §8.1 establishes that `SC-S3-37` is **imported** into this system by `CMP-S4-13` and read by both `CMP-S4-13` and `CMP-S4-16`. **What happens to that copy when NEU-889's published graph changes is undecided.** A re-import on every authoring run, a versioned import pinned per content unit, an operator-triggered refresh, and a one-time import that never refreshes are all consistent with the placement, and they differ materially in whether a learner can be served against a prerequisite edge that upstream has since removed. The placement is settled; the **staleness discipline over the copy** is not.
- **Status:** `provisional` — the placement is published and stable; this is a reliance on a lifecycle rule that has not been set.
- **Source:** `../05_…` §8.1 (the placement and its reasoning); `../04_state-category-inventory.md:173` (`SC-S3-37`, store `none` in this system, *"authored and gate-verified upstream → imported → to be defined"* — the lifecycle column already says `to be defined`), and `:174` (`SC-S3-38`, the per-learner position against the graph).
- **Consumer:** **SUB-13 (NEU-977)** and **SUB-6 (NEU-976)**
- **Owner:** SUB-13 (NEU-977)
- **Resolving event:** **SUB-13 publishes the `OUT-3` authority matrix naming exactly one authority for the imported `SC-S3-37` copy *and* stating whether a re-import is that authority's write.** The item closes on that matrix landing on `origin/develop`. A matrix that assigns the authority but leaves the re-import unattributed does not close it, because an unattributed re-import is a second writer by another name.
- **Why not a stand-in:** NEU-889's DP-map package is **built and published** — `93_…`'s contract is the four unbuilt packages NEU-891…NEU-894, and this is not one of them, and the register is closed at five entries in any case. Nothing about those four landing would set a staleness rule over a copy of a published upstream artifact. It is a lifecycle decision **this** package owes, and `OUT-3` already allocates lifecycle-and-authority questions to a named C010 sub-task.

### SUB-5

*Three entries, plus the disposition of the item SUB-1 filed with this sub-task as its named owner. Following the `OI-S1-1` and `OI-S3-2` precedent, that disposition is recorded **here, in SUB-5's own section**, and `OI-S1-2`'s entry above is left exactly as SUB-1 wrote it. The three new entries are each a question the isolation invariant made askable and could not itself answer.*

#### Disposition of `OI-S1-2` — SUB-5's half is discharged; the item stays open, and its ownership must move

- **Item:** `OI-S1-2` — `payload.sub || azp` may resolve to an OAuth client rather than a human learner, and whether the production learner flow yields a human `sub` at all is unverified. Consumer and owner: **SUB-5 (NEU-975)**; also named as an input to NEU-893. Its resolving event is *"a live production token is inspected and its `sub` claim recorded"*, with the item closing *"when NEU-893 publishes the recorded inspection."*
- **Disposition:** **Half discharged, and deliberately not closed.** SUB-1's entry allocates SUB-5 exactly one obligation — *"SUB-5 records the `sub`-versus-`azp` threat case against the isolation invariant either way"* — and that is discharged: `../06_isolation-invariant-and-the-neu-893-split.md` §4.1 walks the case to a stated verdict (`fails-principal` at check I5), and §3.6 case 5 works it against a named target state. The invariant does **not** assume a human learner; it confines per **authenticated principal** and states the consequence when that principal is an OAuth client — two humans behind one client_credentials client collapse to one principal, so per-learner confinement fails even with the ownership column present, every query scoped and both transports gated.
- **What is *not* discharged, and cannot be here:** the inspection itself. **No live production token was inspected by this sub-task, and nothing in this package can inspect one** — this is a decision package with no production access, and fabricating the observation is the one thing worse than leaving it open. The item therefore stays `[unconfirmed]` and is named in place at every decision resting on it.
- **An ownership fact this disposition surfaces, recorded rather than acted on:** `OI-S1-2` names **SUB-5** as owner while its resolving event requires **NEU-893** to publish. Those cannot both hold — an owner who cannot cause the resolving event is not the owner. This sub-task **does not edit SUB-1's entry to reassign it**, because no sub-task rewrites another's entries; it records that ownership must move to NEU-893 and routes the fact to **`NEU-986 (SUB-12)`** to settle at the completeness gate. In the meantime the item travels on `../06_…` §5.3's handed-on list as **`H5`**, which is where its practical ownership already sits.
- **What the disposition does *not* decide:** whether a principal of kind `client` should be rejected, mapped to a learner, or admitted as a service principal holding no learner state. That is NEU-893's, and the prior obligation behind it — that the resolved identity carry its provenance at all — is filed below as `OI-S5-2`.

#### `OI-S5-1` — Whether `NEU-850's OUT-2` ranges over the two operational log tables, which no repository port reaches

- **Id:** `OI-S5-1`
- **Item:** `NEU-850's OUT-2` commits learner ownership to `user_id NOT NULL` **on every core table**, with the JWT subject threaded **through the row-owning repository ports**. `infrastructure.mcp_request_log` (`SC-S3-16`) and `infrastructure.operation_event_log` (`SC-S3-17`) are behind **no port at all** — they are created by raw SQL migrations and written directly from the pino transports — so OUT-2's stated mechanism has no path to either, whatever its stated scope. **Whether "every core table" is meant to include them is undecided**, and the two readings differ materially: under one, the tables are out of scope and their unattributability is somebody else's problem; under the other, OUT-2 is committed to a change its own mechanism cannot deliver.
- **Status:** `[unconfirmed]`
- **Source:** `drizzle/0010_create_infrastructure_mcp_request_log.sql:3`–`:15`, `drizzle/0012_extend_mcp_request_log.sql:1`–`:3`, `drizzle/0013_create_operation_event_log.sql:1`–`:12` (no principal column in any of them); written at `src/transport/pg-audit-transport.ts:117` and `src/transport/pg-event-transport.ts:109`, neither through a port. OUT-2's substance as consumed at `../06_…` §1.1, from C010 intake Q6 and a tracker read of NEU-850 dated **2026-08-19**. Read at the 2026-08-21 cutoff.
- **Consumer:** **NEU-893**, which builds the mechanism and needs to know whether the two tables are in its change set; and **`NEU-986 (SUB-12)`**, at the completeness gate.
- **Owner:** **NEU-850**, through its `OUT-1` execution-time drift check. The scope of a consumed constraint belongs to its author.
- **Resolving event:** **NEU-850 publishes a scope answer stating whether `OUT-2` ranges over the two `infrastructure` log tables** — and, if it does, names the mechanism that reaches them, since port threading provably does not. The item closes on that answer being published; a mechanism change that silently adds a principal column to both tables also closes it, because the answer is then observable in the migration.
- **Why not a stand-in:** NEU-850 is **converged**, not unbuilt. `93_…`'s admission rule covers assumptions standing in for packages that do not exist yet, and the register is closed at five entries in any case. This is a clarification owed by a package that has already decided — an open item with a real owner and a real resolving event, which is precisely the distinction the two registers are split on. It is also **not an amendment**: `../06_…` §2 examines it against the bounded amendment right and records why a scope question about a constraint's edge is not evidence that actively contradicts its centre.

#### `OI-S5-2` — Whether the resolved identity will carry its `sub`-versus-`azp` provenance, so check I5 is answerable at all

- **Id:** `OI-S5-2`
- **Item:** The isolation invariant's fifth check asks whether the authenticated principal's **kind** is determined. Today it cannot be: `payload.sub || azp` collapses two materially different principals — a human learner and an OAuth client — into **one opaque string that records no trace of which claim it came from**, and nothing downstream re-derives the distinction. **Whether NEU-893's identity mapping will preserve that provenance is undecided.** This is the design obligation behind `OI-S1-2`'s fact: even once a production token is inspected, a system that discards the provenance cannot answer I5 for any request, only for the one token somebody looked at.
- **Status:** `provisional` — the isolation invariant's I5 relies on a discriminator that does not exist and has not been committed to by anyone.
- **Source:** `src/transport/jwt-middleware.ts:127` — `const subject = (typeof payload.sub === 'string' && payload.sub) || azp || undefined;` — assigned to `res.locals.auth` at `:133`–`:136`; consumed only at `src/transport/rate-limit-middleware.ts:76`–`:77` and `src/transport/http.ts:32`–`:35`, `:52`–`:72`, `:83`, `:206`–`:209`, with **zero** occurrences in `src/orchestration/`, `src/ports/` or `src/adapters/`. Read at the 2026-08-21 cutoff. The check it gates is `../06_…` §3.3 (I5); the walk is §4.1.
- **Consumer:** **`SUB-14 (NEU-978)`**, which cannot return anything but `fails-principal` for any category that reaches I5 while this is unresolved; and **NEU-893**.
- **Owner:** **NEU-893** — it is a property of the identity mechanism, and this package decides the invariant, not the mechanism (charter assumption 3).
- **Resolving event:** **NEU-893 publishes its identity mapping stating whether the resolved principal carries its kind** — and what the system does with a principal of kind `client`: reject it, map it to a learner, or admit it as a service principal holding no learner state. Any of the three closes the item; leaving the kind undetermined does not, whatever else the mapping decides.
- **Why not a stand-in:** It is a question about **this repository's existing transport layer** and a design obligation on a named, live package — not an assumption standing in for an unbuilt one. `A-28` is the stand-in *for* NEU-893 and already exists; filing this as a second stand-in would double-count the same package in `NEU-896`'s reconciliation list. It is also distinct from `OI-S1-2`: that item is a **fact to confirm** (what does production actually yield), this one is a **design property to commit to** (will the answer be knowable per-request at all). Confirming the first without the second leaves I5 unanswerable.

#### `OI-S5-3` — The isolation invariant is published unexercised against a real authority matrix

- **Id:** `OI-S5-3`
- **Item:** `../06_…` §3 publishes the invariant as a decision procedure and demonstrates it on **five** hand-picked state categories chosen to reach five different verdicts. **It has never been run over a real row set.** The target states in cases 3–5 are named by that chapter itself, because `SUB-13 (NEU-977)`'s authority matrix — the thing the procedure is designed to be parameterized by — does not exist yet. Whether every one of the 45 categories can actually be evaluated by these five checks is therefore **relied on, not shown**.
- **Status:** `provisional` — a published procedure is relied upon by two downstream sub-tasks before anything has exercised it end to end.
- **Source:** `../06_…` §3.6 (the five worked cases) and §3.7 (what they do and do not establish, stated explicitly); the domain is `../04_state-category-inventory.md` §3's 45 rows, `SC-S3-1` … `SC-S3-45` (45 is the count; the §3 heading's "41" is stale per `F-S4-2`).
- **Consumer:** **`SUB-14 (NEU-978)`**, which is the first party to run it at scale and the first that would discover a check unanswerable from the artifact it names.
- **Owner:** **`SUB-14 (NEU-978)`**
- **Resolving event:** **SUB-14 publishes its per-row application of the invariant over the `OUT-3` matrix**, reporting a verdict for every row. The item closes on that landing on `origin/develop`. A partial application that skips rows it could not evaluate does **not** close it — an unevaluable row is exactly the signal this item exists to surface, and it should be reported as a finding against `DR-C10-S5-1` rather than omitted.
- **Why not a stand-in:** The matrix is a **C010 deliverable with a named owner and a scheduled sub-task**, not an unbuilt upstream package; `93_…`'s admission rule does not reach it and the register is closed. Nor is this a cap: it has a real, observable resolving event within this charter's own reach, which is the whole distinction between `90_…` and `91_…`. The related **cap** — that the invariant has zero positive instances and is shown well-formed rather than satisfiable — is a different limit and is filed as `CAP-S5-1`.

### SUB-6

#### Disposition of `OI-S4-1` — the DP-map import staleness item, which names SUB-6 as a consumer

`OI-S4-1` names `SUB-13 (NEU-977)` and `SUB-6 (NEU-976)` as its consumers. **It does not gate this sub-task's output, and it is not closed here** — closing another sub-task's item is not this section's to do, and the original entry is not edited.

The reason it does not gate: the only place the DP-map could have bitten this chapter is the authority assignment for `SC-S3-37` (the static DP graph), and `../07_state-ownership-model-selection.md` §6.2 demonstrates that the assignment is **robust to the item's resolution either way**. `SC-S3-37`'s `Learner-scoped` cell is an explicit `no`, so clause 5 does not fire and clause 6 — the default — assigns it to the MCP core. If the import lands and a gate begins reading the graph, **clause 2 fires instead of clause 6 and the answer is unchanged**. An item that cannot change an output does not block it. `OI-S4-1` remains open and remains `SUB-13 (NEU-977)`'s to resolve, which must decide the import's refresh authority — a question this chapter's assignment rule deliberately does not answer, because authority over a row and refresh policy for a row are different questions.

#### `OI-S6-1` — SUB-10's data-store selection may reverse the ownership model selected here, and only SUB-6 can act on it

- **Id:** `OI-S6-1`
- **Item:** The selection of `M-A` (all-MCP) in `../07_state-ownership-model-selection.md` §5.1 is stable across both store assumptions scored, but **not unconditionally stable**: §5.3 publishes a three-clause conjunction — `R1` a separate web store with no shared credential path, `R2` a single cross-tier principal enforcement point from NEU-893, `R3` a SUB-7 resource requiring web-surface state that cannot be expressed as an MCP tool — which together reverse it to `M-C` by **2 points out of 500**. Any two of the three leave `M-A` ahead. Until `SUB-10 (NEU-984)` publishes its topology, whether clause `R1` holds is unknown.
- **Status:** `provisional` — the selection is made and is the basis for `SUB-13 (NEU-977)`'s matrix; it is provisional on a store decision that has not been taken.
- **Source:** `../07_state-ownership-model-selection.md` §5.2 (the topology lookup table SUB-10 checks against) and §5.3 (the three clauses with their per-cell deltas and the pair-and-triple arithmetic); `../01_outcome-register.md` `OUT-8`, which assigns the store decision to SUB-10.
- **Consumer:** **`SUB-10 (NEU-984)`** — it runs the §5.3 check against its selected topology and files the finding if the conjunction holds, or if it selects a topology §5.2's table marks as raising a finding.
- **Owner:** **`SUB-6 (NEU-976)`** — named here as the owner of any finding the check produces, as `OUT-3`'s own acceptance criterion requires. The reversal is to be **detected and routed**, never absorbed into residual uncertainty.
- **Resolving event:** **`SUB-10 (NEU-984)` publishes its data-store record on `origin/develop` and the §5.3 three-clause check is run against it**, with the outcome recorded either as a match (no action) or as a finding routed to SUB-6. The item closes on that check being run and its result recorded — not on the store record merely landing, because a store record that nobody checks against §5.3 leaves exactly the exposure this item exists to surface.
- **Why not a stand-in:** `93_stand-in-assumption-register.md` is **closed at five entries**, and this is not an assumption in any case: it is a **scheduled check with a named owner, a named consumer and a mechanically evaluable condition**. Nor is it a cap — it has a real, observable resolving event inside this charter's own reach, which is the distinction between this register and `91_…`. The related **cap** — that the two-writer divergence underpinning the comparison was never observed — is a different limit and is filed as `CAP-S6-1`.

#### `OI-S6-2` — The SUB-10 → SUB-6 finding has no re-dispatch mechanism, and SUB-6 will have shipped

- **Id:** `OI-S6-2`
- **Item:** `OI-S6-1` routes a finding **backwards**, to a sub-task that has already shipped, and **nothing in this package re-dispatches its owner**. `SUB-11 (NEU-985)` only audits and routes; `SUB-12 (NEU-986)` explicitly out-of-scopes making or revising any architecture decision. A store reversal detected at SUB-10 would invalidate the ownership model selected here **and every artifact derived from it** — `SUB-13`'s matrix, `SUB-14`'s validation, `SUB-7`'s boundary, `SUB-8`'s compatibility contract — yet the only disposition actually available is an open-items entry recording the contradiction.
- **Status:** `[unconfirmed]` — that the mechanism is absent is confirmed; whether it will matter depends on whether `OI-S6-1`'s condition ever holds, which is unknown.
- **Source:** The route itself is published at `../07_state-ownership-model-selection.md` §5.4, and the absence of a re-dispatch mechanism is checkable against the two published statements of the only downstream scopes that could act: `../README.md:44` gives `NEU-985 (SUB-11)` **the mechanical audit rows** and nothing more, and `../94_package-completeness-gate.md:5`, `:21` and `:40` give `NEU-986 (SUB-12)` the completeness gate with an explicit must-not list. Neither scope includes making or revising an architecture decision, so neither can act on a reversal. The charter's review accepted this as warning **`F5.7`**, naming all four backward routes — SUB-10 → SUB-6 (this one), SUB-13 → SUB-7, SUB-13 → SUB-8, SUB-9 → SUB-15. **The warning is cited by id and not by path:** the review log lives outside this package's published tree, and `../00_method-and-provenance.md` §3 forbids a published file requiring a reader to open it — so the warning's content is restated here in full rather than referenced.
- **Consumer:** **`NEU-986 (SUB-12)`**, at the package-completeness gate — the last point at which the package can state that a routed finding has no actionable owner.
- **Owner:** **`NEU-895`**, the umbrella charter, as the only party positioned to re-dispatch a shipped sub-task. Not SUB-6: this sub-task cannot re-dispatch itself, and naming it here would record an owner that cannot act.
- **Resolving event:** **Either** the umbrella re-dispatches `NEU-976` (or an implementation charter takes the decision over) in response to a finding filed under `OI-S6-1`, **or** `NEU-986 (SUB-12)` records at the completeness gate that the back-routed finding is unactioned and states the consequence for the derived artifacts. Either landing on `origin/develop` closes the item; the second closes it as an accepted defect rather than a fix.
- **Why not a stand-in:** It is not an assumption about an unbuilt upstream — it is a **structural property of this package's own sub-task graph**, observed and recorded. `93_…` is closed and its admission rule does not reach it. It is not a cap either: it has an observable resolving event, though one of the two available events resolves it by acknowledgement rather than by repair. **Carried as the residual it is, and not fixed** — that was the disposition accepted at charter review as warning `F5.7`, and this sub-task does not reopen it.

### SUB-13

*One entry, plus the disposition of the three items filed with this sub-task as their named owner. Following the `OI-S1-1` / `OI-S3-2` / `OI-S1-2` / `OI-S4-1` precedent, those dispositions are recorded **here, in SUB-13's own section**, carry no new id, and leave each original entry exactly as its author wrote it.*

*A note on ids, once, so the three dispositions read correctly: `OI-S2-2` records its consumer and owner as "SUB-13 (NEU-987)". **`NEU-987` is not a child of this charter at all** — the mapping error is `F-S3-2`, and `../05_…md` §12 states the correction. **SUB-13 is NEU-977**, and this section is NEU-977's.*

#### Disposition of `OI-S2-2` — **resolved**

- **Item:** `OI-S2-2` — the gate-verdict state written by the authoring-time gate runner, the drift-verdict store and the drift-verdict cache each have no assigned authority. Owner: **SUB-13**, recorded under the wrong tracker id per `F-S3-2`. Its resolving event was *"SUB-13 publishes the `OUT-3` authority matrix with exactly one authority named for each of the three state categories… A matrix that omits one of the three, or names two owners for one, does not close it."*
- **Disposition:** **Resolved by publication.** `../08_per-state-authority-matrix.md` §8.6 gives each of the three its own row, with exactly one authority each:
  - **`SC-S3-35`, the gate-verdict record → `CMP-S4-14`** (the quality-gate battery), written through `CMP-S4-15` (the gate runner) inside its terminable isolate under the host-enforced wall-clock bound. Clause 2 of `../07_…md` §6.1 matches on the authoring path and its answer is exercisable without a tie-break. `CMP-S4-15` executes the write; `CMP-S4-14` holds the authority.
  - **`SC-S3-34`, the drift-verdict store → `CMP-S4-17`** (the citation-drift verdict producer), which `../03_…md` §4.2 specifies as its **only** writer. Clause 6's default named `CMP-S4-7`; tie-break (c) — the producing component wins — resolves it to `CMP-S4-17`.
  - **`SC-S3-33`, the drift-verdict cache → `CMP-S4-17`**, which `../05_…md` `FL-S4-13` names "the cache's only writer". `CMP-S4-18` **holds** the value and has authority over nothing, exactly as `../03_…md` §4.3 specifies. Clause 2 matched and named `CMP-S4-7`; tie-break (c) resolves it to `CMP-S4-17`.
- **Three rows, three single authorities, none omitted and none shared** — which is the condition as written. The two tie-breaks are disclosed at their rows and routed to SUB-6 as **`F-S13-1`**, because the rule under-determined them; the finding accompanies the assignment rather than substituting for it.
- **What the disposition also does:** it resolves `FL-S4-16`'s **"Undetermined"** authority column in `../05_…md` §5 and hop F1-5 in §10.2, and thereby **discharges `F-S4-3`**. Both rows named `OI-S2-2` as the gap and this matrix as the resolving artifact.
- **What the disposition does *not* decide:** the scheduling mechanism that drives the producer (`OI-S2-1`, owner SUB-10) — authority over a category and the schedule on which its authority writes are different questions, and this matrix answers only the first.

#### Disposition of `OI-S4-1` — **resolved**

- **Item:** `OI-S4-1` — whether a change to the upstream DP-map graph propagates into the imported copy, and under whose authority. Owner: **SUB-13 (NEU-977)**; consumers SUB-13 and SUB-6. Its resolving event required the matrix to name exactly one authority for the imported `SC-S3-37` copy **and** to state whether a re-import is that authority's write, because *"an unattributed re-import is a second writer by another name"*.
- **Disposition:** **Resolved by publication**, in both halves.
  - **Authority: `CMP-S4-7`.** This is SUB-6's own worked demonstration (`../07_…md` §6.2), reproduced at the row: clause 1 does not match because the volatility cell reads `to be defined` and `to be defined` is not `derived-on-read`; clause 2 does not match at this cutoff; clause 3 cannot match (§6.3 is empty under `M-A`); clause 4 does not match; clause 5 does not match because `Learner-scoped` is an explicit **`no`** and only an explicit `no` leaves the domain; **clause 6 matches**.
  - **Re-import: attributed.** A re-import is **`CMP-S4-7`'s write, executed through `CMP-S4-13`** — the importer, and the only component that may originate an admission under `BND-S4-15`. **No other component may refresh the copy, and a refresh performed by anything else is a second writer.** A re-import **replaces** the copy whole; it does not reconcile node-by-node. Exactly one in-system copy is held, per `../05_…md` §8.1.
  - Upstream **NEU-889 remains authoritative for the graph itself** (`FL-S4-21`); this row is about the imported copy only, and the two are not in tension.
- **Robustness, as SUB-6 predicted:** if the import lands and a gate begins reading the graph, clause 2 fires instead of clause 6 and the answer is unchanged. The assignment does not depend on the item's resolution, which is why `../07_…md` was able to ship without it.
- **What the disposition does *not* decide:** the import mechanism, the store shape, or the refresh **schedule** — SUB-10's and SUB-8's. It decides who may write, and that a re-import is that write.

#### Disposition of `OI-S3-1` — half-discharged; the item **stays open**, and its closure condition is contested

- **Item:** `OI-S3-1` — the learner-scoping answer is open for most of the inventory. Owner: **SUB-13 (NEU-977)**; consumers SUB-13 and **SUB-14 (NEU-978)**. Its resolving event requires the matrix to carry *"a resolved learner-scoping value for every `SC-S3-*` row"* **and** SUB-14 to publish its per-row judgement, and states that *"a matrix that carries the column forward still marked `question — open` does not close it."*
- **Disposition:** **Half-discharged. Not closed** — and it could not close on SUB-13 alone in any case, since the condition names SUB-14 as well.
  - **What is discharged:** every row's **isolation-domain membership**, and hence the clause that produced its authority. `../08_…md` §11.1 reconciles this independently against `../06_…md` §3.3's census — 26 in-domain categories, less 5 taken first by clause 1 and 1 by clause 4, leaves exactly the **20** rows that reach clause 5. Clause 5's rule that *only an explicit `no` leaves the domain* means every unresolved question was treated **conservatively**, never as an exemption, which is precisely what `../06_…md` handed SUB-13.
  - **What is not discharged, and must not be:** the column's values. `../04_…md` §2 defines `Learner-scoped` as recording the scoping **question, never a schema fact**, and §6 establishes by a four-term search that **no ownership column exists on any table today**. `NEU-850`'s `OUT-2` is a **decision to honour, not an existing fact**. A matrix that resolved the column would be asserting a schema fact the package forbids it to assert — so the condition as written is unsatisfiable by any document that respects `../04_…md` §6.
- **The contest is filed, not absorbed:** **`F-S13-3`**, routed to **`NEU-986 (SUB-12)`**, which reconciles the registers and is the only party that can restate a closure condition without violating the append convention, and to **SUB-14**, which will hit the same wall.
- **Why this is stated so explicitly:** the risk is that a later reader treats the item's non-closure as SUB-13 having skipped it, and closes it by asserting the values — putting a false schema fact into the package's most-consumed matrix. The item is left open **deliberately**, and the original entry is not edited.

#### `OI-S13-1` — The migration path for the store-`none` categories is a shape, not a destination, until the store topology lands

- **Id:** `OI-S13-1`
- **Item:** `../08_per-state-authority-matrix.md` populates `OUT-3`'s **migration path** attribute for all 45 rows. For the `existing` rows it is substantive and settled — overwhelmingly "none required", because the category is already in the store the model places it in under the authority the model assigns. For the **18 rows whose store cell is `none`** — the eleven `required-by-upstream` categories of §8.6, the four `assumed` categories of §8.7, and the three derived-never-persisted categories of §8.5 — the attribute records **the shape of the path and the constraints that bind it**, not its destination: which authority the category arrives under, which write edge it must not create, and which properties (a principal field, an expiry, a retention window, a never-edit-in-place invariant) are preconditions rather than later additions. **The destination itself — table, schema, or store — is not decided here and is not this sub-task's to decide.** Several rows additionally name a real cross-category interaction the topology must resolve: per-process counters multiplied by instance count (`SC-S3-20`), per-process breaker state diverging across replicas (`SC-S3-21`), MCP session affinity (`SC-S3-18`), and progression rows referencing nodes a re-import may remove (`SC-S3-38` against `SC-S3-37`).
- **Status:** `[unconfirmed]` — the constraints are stated and load-bearing; no destination is asserted for any of the eighteen.
- **Source:** `../08_per-state-authority-matrix.md` §8.4 (the single-instance consequence, per row), §8.5, §8.6 and §8.7 (the *migration path* cell of each store-`none` row); `../01_outcome-register.md` `OUT-3` (which requires the attribute) and `OUT-8` (which owns the store topology). The store cells are `../04_state-category-inventory.md` §3.5–§3.7.
- **Consumer:** **`SUB-10 (NEU-984)`**, which selects the data-store topology, and **SUB-16**, which republishes the matrix after validation and would carry a resolved destination if one existed by then.
- **Owner:** **`SUB-10 (NEU-984)`** — the sub-task that causes the resolving event. Not SUB-13: this matrix cannot decide a topology, and naming itself here would record an owner that cannot act.
- **Resolving event:** **`SUB-10` publishes its data-store record on `origin/develop`**, at which point each of the eighteen shapes resolves to a destination or is recorded as still unplaced. The item closes on that record landing **and** the eighteen being reconciled against it — a store record that names stores without saying which of these categories land in them leaves exactly the gap this item exists to surface.
- **Why not a stand-in:** `93_stand-in-assumption-register.md` is **closed at five entries**, and this is not an assumption in any case — it is an in-package allocation with a named owner, a named consumer and an observable resolving event inside this charter's reach, which is the distinction between this register and `91_…`. It is also **not** a cap: nothing about it is permanently out of scope, and `OUT-8` is a C010 outcome with a named sub-task. Note the interaction with `OI-S6-1`: if SUB-10's store selection reverses the ownership model, the reversal is routed to SUB-6 under that item, and this one's resolution would be re-derived against the new model rather than carried forward.

### SUB-14

*One new entry, plus the disposition of the two items that named this sub-task as a consumer or whose resolving event is this sub-task's publication. Following the precedent set by `OI-S1-1` / `OI-S3-2` / `OI-S1-2` / `OI-S4-1` and continued by SUB-13, those dispositions are recorded **here, in SUB-14's own section**, carry no new id, and leave each original entry exactly as its author wrote it.*

#### Disposition of `OI-S5-3` — **resolved**

- **Item:** `OI-S5-3` — the isolation-invariant decision procedure is **unexercised against a real matrix**. Owner: SUB-5. Its resolving event was that **SUB-14 publishes a per-row application** of the procedure against the authority matrix.
- **Disposition:** **Resolved by publication.** `09_authority-matrix-validation.md` §5–§6 applies `06_isolation-invariant-and-the-neu-893-split.md` §3's ordered checks to **all 45 rows**, under **two** named target states (§3.2 form **(b)**, and form **(c)** with its assumed set explicitly enumerated), producing **90 row-evaluations**. The procedure terminated on every one, in the intended order, drawing only from the closed six-verdict set.
- **What the exercise established about the procedure itself**, beyond that it runs:
  - **No seventh verdict was ever needed.** The closed set is sufficient for a real 45-row matrix — which was not obvious in advance, since §3.6's five worked cases reach five of the six.
  - **`I5` was never reached.** Every in-domain row failed at `I2`, `I3` or `I4` first, so **principal integrity is untested by this census** and `fails-principal: 0` must be read as *unreached*, never as *passed*. Filed as **`F-S14-2`**.
  - **`I3`'s locus is undefined for a portless category.** Fifteen categories sit behind no port, so *"at or below the port boundary"* has no referent. Read purposively, **disclosed** rather than applied silently, and filed as **`F-S14-1`**. No row's disposition changes under either reading.
  - **§3.4.1's asymmetry rule bound the result, exactly as written.** `holds` requires an enumerated access-path set covering reads *and* writes; none exists for any category; the count of `holds` is therefore **zero rather than "unfalsified"**, and no row was passed by failure to find a counter-example.
- **What the disposition does *not* do:** it does **not** establish that the invariant is **satisfiable**. `CAP-S5-1` stands. Zero `holds` across 90 evaluations is consistent with unsatisfiability *and* with a merely-unimplemented mechanism, and §3.4.1's asymmetry means this census **cannot** distinguish them. Claiming otherwise would be precisely the absence-of-evidence error the rule forbids.

#### Disposition of `OI-S3-1` — **stays open**; the co-consumer hit the wall `F-S13-3` predicted

- **Item:** `OI-S3-1` — the learner-scoping answer is open for most of the inventory. Owner: **SUB-13 (NEU-977)**; consumers SUB-13 and **SUB-14 (NEU-978)**. Its resolving event requires the matrix to carry a resolved learner-scoping value for every row **and** SUB-14 to publish its per-row judgement.
- **Disposition:** **SUB-14's half is discharged; the item stays open, and its closure condition remains unsatisfiable.** `09_…md` §5 publishes a per-row judgement for all 45 rows and §4.2 re-derives the `I1` census independently from `04_state-category-inventory.md` §3 — **19** explicit `no`, **18** `question — open`, **8** explicit `yes` → **26 in domain**, agreeing with `06_…md` §3.3.
- **The wall is exactly where `F-S13-3` said it would be.** The condition also requires *"a resolved learner-scoping value for every `SC-S3-*` row"*, and `04_…md` §2 defines that column as recording the **question, never a schema fact**, while §6's four-term search establishes that **no ownership column exists on any table today**. **This chapter does not resolve the column, and no verdict in it rests on an ownership column being present.** Where an ownership key is assumed, it is assumed **only** inside the explicitly enumerated composed target state of §4.2 and every verdict under it is labelled as composed.
- **No new finding is filed for this.** `F-S13-3` already routes the unsatisfiable closure condition to **`NEU-986 (SUB-12)`** and named SUB-14 as the co-consumer that would hit it. Filing a second finding for the same defect would inflate the register and misrepresent the count. **The original entry is not edited.**

#### `OI-S14-1` — This validation record is bound to the `pre-validation` revision it read, and its re-run obligation is undecidable until SUB-16 republishes

- **Id:** `OI-S14-1`
- **Item:** `09_authority-matrix-validation.md` validates `08_per-state-authority-matrix.md` at its **`pre-validation`** revision, which is the only revision that exists. **SUB-7, SUB-8 and SUB-10 consume SUB-16's post-absorption revision, not that one.** Absorbing the eleven `F-S14-*` findings may change an authority (`F-S14-7` and `F-S14-9` both put an assignment in question), and any authority change re-opens that row's invariant verdict, its conflict disposition and its place in the cause tally. **Whether this record must be re-run — in whole, or only over the changed rows — is not decidable from here**, because it depends on dispositions SUB-16 has not yet made.
- **Status:** `[unconfirmed]` — the dependency is certain; its extent is not.
- **Source:** `08_…md`'s `**Revision:** pre-validation` marker and its §2 who-validates/who-supersedes statement; `09_…md` §15.3 (the eleven findings) and §16; the sub-task graph's ordering, in which SUB-16 absorbs before SUB-7/SUB-8/SUB-10 consume.
- **Consumer:** **`NEU-983 (SUB-11)`**, whose audits read this record and would otherwise read it as revision-independent, and **`NEU-986 (SUB-12)`**, whose completeness gate consumes it as evidence.
- **Owner:** **`SUB-16 (NEU-980)`** — the sub-task that causes the resolving event. Not SUB-14: this chapter cannot decide what its own findings' absorption will change, and naming itself would record an owner that cannot act.
- **Resolving event:** **SUB-16 publishes the post-absorption revision on `origin/develop`** and states, per finding, whether the disposition altered an authority. The item closes when that statement exists **and** each altered row is either re-validated or explicitly recorded as unchanged in verdict. A republication that absorbs the findings without saying which rows moved leaves exactly the gap this item exists to surface.
- **Why not a stand-in:** `93_stand-in-assumption-register.md` is **closed at five entries**, and this is not an assumption about an unbuilt upstream in any case — it is an in-package ordering dependency with a named owner, a named consumer and an observable resolving event inside this charter's reach. It is **not** a cap either: nothing is permanently out of scope, and the resolving sub-task exists and is scheduled.
