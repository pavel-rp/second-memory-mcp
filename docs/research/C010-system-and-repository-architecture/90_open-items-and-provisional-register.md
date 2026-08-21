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
