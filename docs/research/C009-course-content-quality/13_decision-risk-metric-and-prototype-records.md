# The Package's Decision, Risk, Metric and Prototype Records

**Task:** NEU-968 (SUB-13) · **Charter:** C009 (umbrella NEU-890) · **Compiled:** 2026-08-11 · **Verification cutoff:** 2026-08-10 (inherited — this sub-task performed **no** new external verification and issued **zero** requests on any access path) · **Covers:** OUT-11 (the four C005-shape records only), OUT-9 (self-classification of its own post-SUB-9 quality requirements only) · **Status:** **deferred — this document SETS no status.** Status lives in a ledger (`A4`: a producing task may not promote its own artifact)
**Model:** claude-opus-5[1m]

Eleven sub-tasks decided things, discovered things, measured a few things and declined to measure many more. Each recorded its own share inside the section that produced it. This document is the fourth C005-shape deliverable set the charter names as an output in its own right: **what this package decided and what it deliberately did not; what it is exposed to and how far each exposure was actually reduced; which of its numbers were measured, which were declared, and which are inadmissible outright; and which of its claims were settled by running something rather than by arguing.**

**It is a report, not a revision.** Nothing here is re-decided, re-graded for severity, re-owned or resolved. A decision that looks wrong is a finding routed to its producing sub-task; a severity that looks wrong is a finding routed to the charter's owner; a cap is cited by id and nothing more.

---

## 0. The result, stated first

**Ten material decisions, one of them still open. Sixteen risks — fourteen inherited from the charter at its own severities, two discovered in execution. Exactly one frozen measurement contract in use and zero metrics defined locally. Exactly one prototype that ran code; five desk-executed specimens.**

And one finding that is the reason this document exists rather than being a table of contents:

> **Every execution-bearing surface in this package is at zero.** 59 gates specified and **0** implemented; **0** serve surfaces for the 1 serve-time gate; the authoring workflow run on **0** real content units; **179/179** `creator_review` values still `deferred-provisional`; the seed citation set **empty** and cluster coverage **0/4**; **no** calibrated value computed for any node. The single exception is a bounded prototype whose AI half is stubbed. **Six sub-tasks each recorded their own zero; no sub-task was positioned to observe that they are all the same zero.**

The package is a specification of high internal quality whose every enforcement, execution and measurement surface is unbuilt, and whose one live external dependency — source rights — is shut. That is the honest one-paragraph answer to *"may course production begin?"*, and §3 and §4 are where it is derived rather than asserted.

**Id namespacing.** `DEC-*`, `RK-*`, `MET-*` and `PROTO-*` ids are introduced by this document and are namespaced to it; they are register row labels. `EQ-S13-*` follows the package's established `EQ-S<n>-k` convention. **No new gate id (`G-*`) is introduced anywhere in this document** (§7.5).

---

## 1. The durable source of record, named before it is used

The C009 charter body lives in gitignored `_local/`. A completeness check written against an unretrievable file is unrunnable by the reader it is written for, so this document names a retrievable source and then carries the material inline as well.

| | |
| --- | --- |
| **Durable source of record for the charter risk set** | The **published tracker umbrella `NEU-890`**, cited by id. |
| **Date the risk set was taken from it** | **2026-08-11.** |
| **What was observed at that date** | The full charter body **is** appended to `NEU-890` — `## Problem & why now`, `## Users & journeys`, `## Outcomes`, `## Scope`, `## Constraints & principles`, `## Dependencies & impact`, `## Risks`, `## Assumptions & decisions`, `## Open questions`. The `## Risks` table carries **14** rows. Class **2 `[code-evidence]`** — an operational fact about a retrieved record, dated. |
| **The assumption this rests on** | **Charter assumption 25 (confirmed)** — *"the published tracker umbrella NEU-890 is a durable, retrievable source of record for this charter's body, including its risk set."* Cited as the cross-artifact assumption it is, not restated on local authority. |
| **The hedge assumption 25 names, kept** | Assumption 25's own row provides that where a publish landed **without** the body appended, the acceptance falls back to the inline risk-set copy. **The primary path was observed to hold on 2026-08-11 and the inline copy is carried anyway** (§3.2). A completeness check that depends on a single retrieval path is one outage away from unrunnable, and the hedge costs one table. |
| **Never the source** | **`_local/` is cited nowhere in this document as a source of record**, for the charter risk set or for anything else. |

---

## 2. The decisions-and-rejected-alternatives record

Every material choice the package made, with the alternatives rejected, the reason, **the party that decided it**, and the artifact version each row was read from. A choice that is still open is recorded as open (§2.2).

### 2.1 The decisions

| Id | Decision | Deciding party | Rejected alternatives, and why | Read from |
| --- | --- | --- | --- | --- |
| **`DEC-1`** | **The restricted-by-default rule.** Where a source's terms, robots directives or stated rate limits could not be established at the cutoff, the source is recorded **restricted** — never permissive by omission — and the gap is filed with a named owner and a revision trigger. At this cutoff that is **all twelve** sources. | **SUB-1 (NEU-957)** | *"We could not find a prohibition, therefore it is allowed"* — rejected by name as **precisely how rights leak**. An inability to read a source's terms is not evidence that the terms permit anything, and the resulting failure direction (more restrictive than the 2026-07-16 baseline, never less) is the deliberate one. | `00_method-and-provenance.md` §4.4 |
| **`DEC-2`** | **The permitted problem-reference field set is `stable id` + `canonical URL` and nothing else** — admitted by quoting `D-F3a`'s own words, not by constructing a fresh rights theory. `title`, numeric `constraints`, `difficulty signal` and `curriculum placement` are **not admitted on this package's judgment**. | **SUB-1 proposes; the decision belongs to `D-F5`'s owner** — see §2.2, this row records the **interim** position only | (a) *Admit `title` and `constraints` locally on charter assumption 19* — fails on **standing, not merit**: assumption 19 is `[unconfirmed]` and `D-F5` §5 forbids proceeding on local judgment; a field set that merely *looks* adjudicated is the worst artifact of the three, because twelve siblings would build against it. (b) *Store nothing at all* — exceeds the recorded rights position rather than tracking it; over-restriction nobody can work under gets quietly circumvented. (c) *Defer to SUB-3's execution experience* — inverts the ordering, and mistakes a **rights** question for a **utility** question. | `decision-records/DR-C09-01_permitted-field-set.md` §Decision, §Rejected alternatives; `01_provenance-and-rights.md` §4 |
| **`DEC-3`** | **The sanctioned corpus-access hierarchy.** Preferred: a source's **documented public API**. Permitted fallback: **a single targeted fetch of one problem by its id** — one request per cited problem, robots and stated rate limits respected, each resolution dated and recorded. **Prohibited under every branch: bulk enumeration, crawling and corpus walks.** | **The charter (assumption 23, confirmed)**; **SUB-3 (NEU-959)** executes and records, and re-decides no part of it | (a) *Bulk enumeration as the fallback when a resolution fails* — prohibited under every branch, never a fallback; it is the exact activity that produced `CAP-2`'s 403. (b) *Treat a `Restricted` row as merely default and fetch anyway* — the local re-decision `01_…` §3.1 forbids, and the "a successful fetch is evidence about reachability, never about rights" laundering. (c) *Scale one request per problem into a loop over a problem list* — the request bound is a **rule, not a preference**. | `03_problem-citation-verification-and-access-paths.md` §0, §4 |
| **`DEC-4`** | **The bound on an enumerating response is retention, not request count.** A sanctioned API response that returns a source's whole problem set is read only to resolve the already-selected cited problem, and is **never stored, cached, transcribed, re-published, or used to enumerate or rank candidates.** Candidate selection comes from the graph node's own criteria. | **SUB-1 (rights half)**, **SUB-3 (retention check)** | *Rely on the one-request-per-problem rule and the no-text rule to cover it* — neither reaches it: a list of ids, titles and ratings is not problem statement text, and one request can still return the whole list. | `01_provenance-and-rights.md` §6; `03_…` §9 |
| **`DEC-5`** | **The authoring languages.** TypeScript on a Node runtime is the **standard** language. **C++17** is the escape hatch, and **the hatch is entered by id**: *a technique is authored in the hatch language if and only if its node id is one of NEU-941's 19 blocking node ids at `rule_version: 1.0.0`.* **The hatch cannot widen** on local judgment. | **SUB-4 (NEU-960)**; owner of the artifacts it governs: **the creator** | (a) *JavaScript as the standard* — the audit's own reference language, exact mapping, but rejected. (b) *C++ everywhere, no hatch* — the simplicity is real and rejected on two grounds. (c) *Rust as the hatch* — better on several effect axes and still rejected. (d) *Python 3 as the hatch* — **the most tempting on paper**; it dissolves the largest effect class outright. (e) *No hatch at all — TypeScript with `BigInt`, explicit stacks and typed arrays* — **the most serious alternative, and technically sufficient**: NEU-941 says every one of the 19 *can* be written correctly this way. | `decision-records/DR-C09-04_authoring-languages.md` §Decision.3, §Rejected alternatives; `04_correctness-standards-and-authoring-languages.md` §4.2–§4.3 |
| **`DEC-6`** | **`DR-M08` routing — honoured, not challenged.** Gate-bearing evidence comes **only** from in-app artifacts the system owns: the `retrieval` item result, the `assessment` item result, and the **pasted-back solution**. **Bare self-report feeds no gate** — its may-feed list is empty and gates A–E all appear in its may-not-feed list. Gates D and E cannot be opened by out-of-band evidence at all; gate C cannot be opened directly by any signal. | **SUB-6 (NEU-962)**; owner: **the creator** | (a) *File an instructional-ledger challenge against `DR-M08`* — **a challenge is for a control you need to change**, and this design does not need it changed. (b) *Admit bare self-report as a weak, discounted signal* — **the single most tempting option**, and it fails on the composition invariant. (c) *Infer the missing evidence from `return_timing`* — manufactures a measurement out of a quantity that does not contain it. (d) *Require the learner to solve in-app after all* — re-decides a settled product choice (assumption 5, confirmed). | `decision-records/DR-C09-02_dr-m08-routing.md` §Decision, §Rejected alternatives; `06_assessment-evidence-out-of-band.md` §1 (R1–R5) |
| **`DEC-7`** | **Spread supersedes union-completeness for `conceptual`.** Every cluster must carry **non-root** `conceptual` coverage — a strictly higher bar than OUT-2's graph-wide `≥1`. The content-side half is dischargeable on **one** node in CL-1; the whole obligation for CL-2, CL-3 and CL-4 is **map-side** and is routed to the map's owner as **`D-R6`**. | **The charter (assumption 9, decided; closure pending the routed map-side change)**; **SUB-5 (NEU-961)** specifies and routes | (a) *Retype an existing near-candidate to `conceptual`* — **barred**, not merely unattractive: it would contradict that node's own committed `skill_type_rationale` under a `settled` decision and install a type the `S1→S8` cascade does not produce. (b) *Amend the cascade* — `D-S1`'s `>10 D-S1a entries` trigger **has not fired; the count is 1**, so this route needs the second limb and the map owner must decide whether the spread bar constitutes it. (c) *Decline the spread bar and revert to union-completeness* — a charter-level reversal, named so the routed decision is complete rather than leading. | `05_per-cluster-conceptual-obligation.md` §2, §5, §6, §7 |
| **`DEC-8`** | **The calibration output is a triple, not a scalar**, over `prerequisite_depth` (verified) plus five provisional load dimensions; `provisional_load_index` weights the five **equally by declaration**. Four input shapes are **inadmissible outright** (§5.4). | **SUB-7 (NEU-964)** — with the honest qualifier that **the dimension set itself could not be settled and was escalated to the creator** (`OI-S7-1`) | (a) *Publish a scalar* — downstream consumers will want one, and it would collapse a verified input and five provisional ones into a single number that hides which is which (`OI-S7-4`). (b) *Weight the five dimensions unequally* — no evidence discriminates a weighting, so equal weight is **the absence of a finding, not a finding of equality** (`OI-S7-3`). (c) *Use a percentile, cohort band, difficulty distribution or ranking against a returned set* — **inadmissible**, closed by `RS-4`; not a gap awaiting access. | `07_difficulty-calibration.md` §4.4, §5.1, §5.2 |
| **`DEC-9`** | **Gate placement.** **59** distinct named gates, **all** placed at authoring time; **exactly one** is placed at serve time — **`G-DRIFT`** — and it is the package's single legitimate `both`. Enforcement mechanism is a closed five-value vocabulary applied **weakest-sufficient, first-match-wins**; blocking behaviour a closed three-value vocabulary. | **SUB-9 (NEU-965)** — both axes, exactly as SUB-4, SUB-6 and SUB-8 left them | (a) *Place more gates at serve time* — **there is no serve surface to place them on** (`CAP-S9-6`, `CAP-S10-4`), so a serve-time placement would be a specification of a gate on a surface that does not exist. (b) *Let SUB-4 or SUB-8 assign blocking behaviour and placement alongside the mechanism* — deliberately refused by both, so that one party owns the enforcement axes and the tables merge without translation. | `09_enforceable-quality-system.md` §7.1, §7.2, §8.1 |
| **`DEC-10`** | **Two of SUB-4's four provisional mechanism assignments are reassigned:** the **proof** standard `schema` → **`deterministic`**; the **test** standard `deterministic` → **`server-side`**. **The source of truth for the four standards' mechanisms is now `09_…` §5.1, not SUB-4's §3.1 table.** | **SUB-9 (NEU-965)** — the one axis SUB-4 declared provisional and assigned to SUB-9 by name | *Leave SUB-4's pre-classification standing* — rejected because SUB-4's table is explicitly `PROVISIONAL and NON-BINDING` and says so in its own header. The cost is a live staleness hazard: a reader who consults `04_…` §3.1 gets two wrong mechanisms, which is why `OI-S9-17` exists. | `09_…` §5.1, §5.5; `04_…` §3.1 |
| **`DEC-11`** | **The quarantine slot vocabularies are closed:** `reason` (5 values), `owner` (6 values), `exit_condition` (4 shapes). **The owner is whoever can satisfy the exit condition, never the party who recorded the quarantine**, and **the passage of time is never an exit condition.** `T-13` returns a released unit to `draft` and only `draft`. | **SUB-9 (NEU-965)**; the slots were named-and-unpopulated by **SUB-8 (NEU-963)** by design | *Let SUB-8 supply example values* — refused by SUB-8 itself: *"a quarantine record whose slots this sub-task filled would be a workflow failure; so would one that omitted them."* An example value in a specification is a default in practice. | `08_authoring-workflow-and-in-situ-review-loop.md` §0.2, §5; `09_…` §8.2, §8.4 |

### 2.2 The one decision that is still open — recorded as open, never as decided

> **The stored field set beyond `stable id` and `canonical URL` is NOT decided by this package.**

| | |
| --- | --- |
| **The open question** | Whether `title`, numeric `constraints`, `difficulty signal` and `curriculum placement` may be stored for a problem reference. |
| **Where it sits** | Ledger challenge **`CH-F5-1`**, filed **by append** against **`D-F5`** in `../C005-dp-map-foundations/adjudication/01_selection-decision-ledger.md`. |
| **The deciding party** | **`D-F5`'s owner** — NEU-932, the owning package's ledger holder. **Not this charter, and not any C009 sub-task.** |
| **The interim position, labelled interim** | `stable id` + `canonical URL` only. It binds every C009 sub-task from the moment `01_provenance-and-rights.md` landed **until `CH-F5-1` resolves**. It is **not a finding that the wider set is impermissible** — it is a refusal to act on an undecided question in the permissive direction. |
| **The cap, cited by id** | **`CAP-S1-2`**. Consumed downstream and cited, never re-owned, at **`CAP-S2-1`**, **`CAP-S3-3`**, **`CAP-S4-5`**, **`CAP-S9-7`**, **`CAP-S10-6`**. |
| **Charter assumption 19** | **`[unconfirmed]`** — it answers only one of the two independent grounds on which the four contested fields fail, and its status is why `DEC-2` files rather than decides. |

**Six sub-tasks consumed this interim position and not one of them widened it.** That is the single most consistently honoured constraint in the package, and it is recorded here because a constraint that held eleven times is evidence about the package's discipline, not a formality.

---

## 3. The risk register

### 3.1 How a status in this table was obtained

Every mitigation status below is **read from a finished predecessor's evidence and cited to it**, never asserted. Where the mitigation branch was taken and left a cap, the row **cites the cap by id and stops** — the cap's owner and its resolution condition live in `91_caps-and-incomplete-scope.md` and are deliberately not restated anywhere in this document, because two registers that both state an owner are two registers that can disagree about one.

**Severities are the charter's own, carried verbatim.** A severity that looks wrong is a finding routed to the charter's owner; this document changes none.

### 3.2 The fourteen charter risks, carried inline

Statement and severity are reproduced from the `## Risks` table of the published **`NEU-890`** umbrella, taken **2026-08-11** (§1).

| Id | Risk, as the charter states it (abridged; severity verbatim) | Severity | Mitigation status, and the evidence that produced it | Caps, by id |
| --- | --- | --- | --- | --- |
| **`RK-1`** | A **fabricated problem-level citation** is published — the `EXC-1` failure repeating, now in learner-facing content where it looks checkable. | **Critical** | **Mitigated to the limit of what is reachable, and the limit is unusual.** Two independent fabrication probes returned **10/10 PASS** each (`dry-run/02_` §, `dry-run/03_` §), the `problem-reference` template **refusing outright** in both. But the deeper reason nothing has been fabricated is that **nothing has been cited**: the seed set is empty, so the publishing path the risk describes has never been walked. The probes are real evidence about *templates*; they are not evidence about *a citation run that did not happen*. | `CAP-S2-3`, `CAP-S3-1`, `CAP-S3-5`, `CAP-S1-5`, `CAP-S2-6` |
| **`RK-2`** | **Out-of-band solving** makes assessment evidence unfalsifiable and self-report is laundered into a mastery-gate advance, violating `DR-M08`. | **Critical** | **Mitigated by design, unexercised in fact.** `DR-M08` is honoured rather than challenged (`DEC-6`); `self_report_outcome`'s may-feed list is **empty**; gates D and E are closed to out-of-band evidence entirely. Adversarial false-report scenarios were run **as desk walks**. No runtime gate exists to enforce any of it. | `CAP-S6-1`, `CAP-S6-2`, `CAP-S6-6` |
| **`RK-3`** | A cited problem **moves, disappears or changes**, silently invalidating a placement while the learner keeps reporting against it. | **High** | **Specified in full; detection surface at zero.** A drift definition with five signals, a degradation rule, and the package's only serve-time gate (`G-DRIFT`) are specified. **No serve surface, no verdict cache and no scheduler exists**, the drift simulations are desk-executed, and the per-source re-check budget derives to **0** while stated rate limits are unestablished. | `CAP-S10-4`, `CAP-S10-5`, `CAP-S9-6` |
| **`RK-4`** | **Difficulty calibration** is anchored to 179 unreviewed `deferred-provisional` values and the result is presented as grounded. | **High** | **The mitigation's own stated failure branch was taken, and it was taken correctly.** The charter's mitigation named C4's numeric ratings as the external cross-check *and* named the branch to take if that path proved unusable. The path is unusable (access gate shut), so the calibration runs on the provisional dimensions alone, records the missing anchor, and carries the verbatim label **"no external cross-check"** at every point of use. **The risk is made visible rather than treated as mitigated — exactly as the charter's mitigation provides.** | `CAP-S7-1`, `CAP-S7-3`, `CAP-S3-1` |
| **`RK-5`** | **Semantic correctness** ends up enforced only by an AI judge. | **High** | **Analysed exhaustively; the compensating layer is incomplete and says so.** Every control is classified by mechanism and every AI-judgment-only residual is named with a compensating observable gate — except **two of sixteen, which carry no compensating gate at all**. Over-validation was measured against `MC-4 v1.0` (§6, `PROTO-1`), and `RA5` — AI grading is not the signal of record — holds. **The measurement does not reach the AI stage** it was commissioned to bound. | `CAP-S9-3`, `CAP-S9-2`, `CAP-S9-1` |
| **`RK-6`** | An AI grader or generator has **memorized the editorial solution**, so its agreement is contamination rather than evidence. | **High** | **Policy shipped; probe not executed.** An explicit contamination policy and the evidence-class discipline that forbids presenting contaminated agreement as independent confirmation are specified and binding. **The designed probe was not run**, and the only instance available to run it against is a single-model package. Contamination is **not detectable in general**, and the control states that rather than implying otherwise. | `CAP-S9-4` |
| **`RK-7`** | The permitted **single-fetch fallback is scaled up** into a loop over a problem list, re-running the activity that produced `CAP-2`'s 403. | **High** | **Bound stated as a rule and never tested, because the gate upstream of it never opened.** The one-request-per-problem bound, the robots/rate-limit obligation and the per-source access-path record are specified and auditable. **Zero requests were issued by any sub-task**, so the request-pattern audit passes **vacuously** and the budget rule has never been exercised. A vacuous pass is recorded as vacuous. | `CAP-S3-4`, `CAP-S9-5`, `CAP-S3-1` |
| **`RK-8`** | An **enumerating API response** is stored, cached or mined for candidate selection, reproducing the source's selection and curation. | **High** | **Disposition decided before the first request (`DEC-4`), and the retention check is vacuously clean.** The bound is retention, not request count; OUT-7's repository scan looked for a **retained problem list**, not only for statement text, and found none. **No live enumerating response has ever been handled**, so the discipline is untested under the condition it exists for. | `CAP-S3-4`, `CAP-S1-5` |
| **`RK-9`** | Storing `title` and `constraints` exceeds `D-F3a`'s "URLs and identifiers only" bar, making a rights-clean design quietly rights-sensitive. | **Medium** | **Not mitigated — filed.** The question is open at `CH-F5-1` (§2.2) and the interim narrow set binds. This is the charter's mitigation working as written: the pass **decides the field set explicitly**, and "explicitly" here means *explicitly routed to the party entitled to decide it*, not decided locally. | `CAP-S1-2` |
| **`RK-10`** | The field-set challenge sits with `D-F5`'s owner, **outside this charter**, and citation-touching outcomes **stall behind it or quietly decide it themselves**. | **High** | **Mitigated, and this is the package's most consistently discharged obligation.** Every citation-touching outcome specified its record for **both** dispositions and produced its artifact on the restricted set. Six sub-tasks consumed the interim position; **zero widened it on local judgment**. Nothing stalled: SUB-3, SUB-4, SUB-7, SUB-9, SUB-10 and SUB-11 all shipped with the challenge open. | `CAP-S2-1`, `CAP-S3-3`, `CAP-S4-5`, `CAP-S9-7`, `CAP-S10-6` |
| **`RK-11`** | This charter's own **decomposition rebuilds the `INC-C1` seam** — a split with no residual owner, or two sub-tasks sequenced on file disjointness while sharing data. | **High** | **Mitigated structurally, with one live consequence.** Every sub-task carries a residual clause and every derived sub-task records the version of the input it derived from. The mechanism worked: SUB-9's reassignment of SUB-4's mechanisms (`DEC-10`) was caught **because** SUB-4 recorded its table as provisional and named its successor. The residual `INC-C1` techniques themselves remain unmapped, so their conceptual obligation cannot be enumerated at all. | `CAP-S5-2` |
| **`RK-12`** | The package **drifts into bulk authoring**, producing course content instead of the rules content is authored against. | **Medium** | **Mitigated, demonstrably.** Exemplars are capped at one per cluster, labelled R&D artifacts, and the acceptance check is for rules and forms rather than volume: **4/4 cluster coverage on 4 exemplar nodes**, of which **1** is completable. **This package authored no map content** — no node, edge, stage, gate, difficulty value or manifest entry was created or edited by any sub-task, and that is verifiable by diff. | — |
| **`RK-13`** | The **incremental creator-review loop** produces opinions that never reach a ledger, so all 179 nodes stay provisional while review appears to be happening. | **High** | **Route built; backlog unmoved.** The loop's success condition is a correctly-classed ledger entry, dry-run once, with recording a judgement anywhere else defined as a workflow failure. **After the loop landed the count is still 179/179 with zero creator-confirmed.** What changed is that a judgement now has exactly one place, one class, one route and one adjudicator; **the flag flip is specified end to end and performed by nobody.** | `CAP-S8-2`, `CAP-S8-1`, `CAP-S8-4` |
| **`RK-14`** | The quality system is **specified but unbuildable** — no committed evaluation harness exists, only a protocol. | **Medium** | **Confirmed rather than mitigated, and the charter's mitigation is the honest one.** The package states which gates are specified versus prototyped, bounds its one prototype to a single unresolved claim, and hands harness construction onward with the protocol fixed. **59 gates specified, 0 implemented, 0 run against a real content unit.** This is the risk that §0's finding generalises. | `CAP-S9-1`, `CAP-S8-3` |

### 3.3 Risks discovered in execution, not present in the charter's table

| Id | Risk | Severity (assigned here, and stated as locally assigned) | Basis | Caps, by id |
| --- | --- | --- | --- | --- |
| **`RK-15`** | **A published roll-up can disagree with its own rows, and a reader who trusts the summary line inherits the error.** Three instances now exist in or adjacent to this package: `OI-S1-14` (the C005 baseline's summary lines), `OI-S4-8` (the `JS-E2` blocking subtotal), and a third found by this sub-task — **`11_…` §10.2 publishes `deterministic 14 · schema 5` while its own §10.1 rows yield `deterministic 15 · schema 4`** (§8). Each is individually trivial; the pattern is that **no mechanism in this package re-derives a summary line**, and three have now slipped. | **Medium**, locally assigned — the operative rows are correct in every instance, so nothing downstream computes a wrong result unless it reads the summary instead of the rows | Re-derivation of all 135 classification rows from the merged blobs (§8). Class **2 `[code-evidence]`**. | `CAP-S13-1` |
| **`RK-16`** | **The package's aggregate "PASS" surface is systematically stronger than its row-level state.** Five separate green-or-passing results are vacuous, criterion-mismatched or scope-limited in ways their own sub-tasks recorded but no reader can see from a summary: `OI-S5-2`, `CAP-S3-4`, `CAP-S7-2`, `OI-S8-4`, `OI-S11-3` (§4.1). A reader who counts greens will over-read this package. | **High**, locally assigned — it is the mechanism by which every other mitigation status could be misread | Cross-read of five sub-tasks' own recorded qualifications (§4.1). Class **2 `[code-evidence]`** as to the existence of the five records; the *pattern* is this document's judgment and is labelled as such. | `CAP-S13-1` |

---

## 4. Five syntheses no single sub-task was positioned to file

Each of the five is assembled from records **two or more sub-tasks filed independently and correctly, and which change meaning when read together.** Each is stated with the ids it is built from so it can be checked rather than believed.

### 4.1 The false-green family — five vacuous or criterion-mismatched passes, filed by five sub-tasks

| Instance | What returns a pass | Why the pass is weaker than it reads |
| --- | --- | --- |
| `OI-S5-2` | OUT-2's union-completeness check for `conceptual` returns **PASS** (3 instances graph-wide, `≥1`). | The bar that now governs is the charter's **spread** bar, which **fails 3 of 4 clusters**. An audit running OUT-2 unmodified is *correct about the criterion it ran and silent about the criterion that governs.* |
| `CAP-S3-4` | The retention audit is **clean**. | Zero requests were issued, so it proves nothing about a live enumerating response. |
| `CAP-S7-2` | The observation-read path **passes**. | Vacuously — no real rating was ever read. |
| `OI-S8-4` | The misfiling audit **passes**. | Vacuously, and *the vacuity is the finding*: zero judgements have been filed anywhere. |
| `OI-S11-3` | The adversarial walk **blocks three times**, from three distinct non-`AI` mechanisms. | The hidden failing case is **not caught**, because `G-BOUNDARY` is `unreachable` wherever `test` is unplaced. |

**Why no sub-task could file this.** Each sub-task saw exactly one instance and recorded it with exemplary honesty. The pattern is only visible from outside all five, and it is what makes `RK-16` a risk rather than a footnote: **the package's discipline about vacuity is excellent per-row and invisible in aggregate.**

### 4.2 Every execution-bearing surface is at zero, and they are the same zero

`CAP-S9-1` (59 gates specified, 0 implemented) · `CAP-S9-6` and `CAP-S10-4` (no serve surface for the 1 serve-time gate) · `CAP-S8-4` (workflow never run on a real unit) · `CAP-S8-2` (179/179 unflipped) · `CAP-S3-1` (empty seed set, cluster coverage 0/4) · `CAP-S7-3` (no calibrated value computed for any node) · `CAP-S11-3` (the end-to-end proof is desk-executed; nothing passed through any pipeline).

**Seven caps, six sub-tasks, one fact.** The single exception is `PROTO-1`, and its AI half is stubbed (`CAP-S9-2`). **This is the sentence a reader deciding whether to build on the package needs, and it appears in no sub-task's document because no sub-task's scope contained more than one of the seven.**

### 4.3 The rights gate is the package's only live external dependency, and it propagates into six sub-tasks

`CAP-S1-1` (twelve rows restricted **by default**, not verified-restricted) → `CAP-S3-1` / `CAP-S3-2` (empty seed set; `CAP-2` closure **declined**) → `CAP-S5-4` (the conceptual obligation rests on zero verified citations) → `CAP-S7-1` (external difficulty anchor absent for all 179) → `CAP-S9-5` (the request-budget rule unexercised because the access gate shuts every source first) and `EQ-S10-11` (per-source budget derives to **0**) → `11_…` §0 (zero requests, zero citations).

**And the trigger on the head of that chain has already fired.** `OI-S3-2` records, as a dated class 2 observation against a **neutral non-source endpoint**, that outbound network capability exists — which is `CAP-S1-1`'s named revision trigger. **The gate correctly stayed shut anyway**: *capability is not authority.* Authority belongs to a SUB-1-owned dated re-verification pass, and no sub-task has claimed it.

**Why no sub-task could file this.** SUB-3 saw the trigger fire and correctly declined to act on it. It could not also state that five later sub-tasks would each independently inherit the same shut gate, because four of them had not run yet.

### 4.4 The mechanism axis moved twice, and two published surfaces are now stale

SUB-4 pre-classified four standards' mechanisms and marked the table **`PROVISIONAL and NON-BINDING`**. SUB-9 reassigned two of the four (`DEC-10`, `OI-S9-17`). SUB-11 then published a mechanism roll-up that disagrees with its own rows (`RK-15`, §8).

**Net effect on a reader:** consulting `04_…` §3.1 yields **two wrong mechanisms**; consulting `11_…` §10.2 yields a **wrong mechanism distribution**. The governing surfaces are `09_…` §5.1 for the four standards and the per-document row tables for counts. Both stale surfaces are correctly flagged in their own documents — and a reader who lands on either directly sees the flag only if they read the header.

### 4.5 The evidence ceiling is class 3 at n = 1, and classes 4, 5 and 6 are absent from the whole package

**What is already correctly filed, and is not claimed as new here.** `CAP-S8-1`'s *"zero class 3 `[dogfooding]` evidence was collected"* is scoped to **SUB-8's creator-review loop**, which genuinely collected none. `CAP-S11-3` states that scoping explicitly and cross-references SUB-6's specimen by name — *"the same class and the same n as `dry-run/06_corpus-swap-verification.md` §6"*. **SUB-11 filed that reconciliation; this row does not re-file it.**

**What no sub-task was positioned to state.** Reading all twelve documents' evidence-class declarations together:

| Class | Present in this package? | Instances |
| --- | --- | --- |
| **1 `[literature]`** | yes | every claim about an external source's terms (`00_…` §3) |
| **2 `[code-evidence]`** | yes, extensively | `MET-1`–`MET-6`, `MET-8`–`MET-12`; node-record reads, id resolutions, triple computations, reference scans |
| **3 `[dogfooding]`** | yes — **and n = 1 in every instance** | `dry-run/06_` §6 (SUB-6); `11_…` §3, §5, §6 — the four exemplars and both scenario walks (SUB-11) |
| **4 `[ai-critique]`** | **no** | — |
| **5** (operational) | **no** | — |
| **6** (operational logs) | **no** | — |
| **7 `[future-real-user]`** | **no, and a single instance is a gate failure** | — |

**The synthesis: this package's evidence ceiling is class 3, its n is 1 wherever class 3 appears, and three whole classes are empty.** No AI-critique round was run anywhere; no automated evaluation was run anywhere; no operational log was consulted anywhere. SUB-1 §3 recorded *"classes 3–6 were not collected"* **about itself**, correctly — it could not also record that eleven successors would each land in the same place. And class 3 carries its own stated structural limitation — *"one skilled learner; overfits; not representative of the target population"* (`08_…` §7.2) — so **every dogfooding claim in this package inherits an overfit warning that no summary of it repeats.**

---

## 5. The success-metric register

### 5.1 The frozen contracts in use — by id and version, defined nowhere here

| Id | Contract | Version | Where the package uses it | Defined by |
| --- | --- | --- | --- | --- |
| **`MC-4`** | AI-grading **over-validation rate** — deliberately shallow or wrong adversarial answers scored pass / `quality ≥ 3`. Decision rule **BOUNDING**; label **`PROXY-BOUNDING`**; `RA5` retained. | **`v1.0`** | `09_…` §12 — the package's one executed prototype (`PROTO-1`). | **NEU-887**, frozen measurement-contract register `v1.0` |

> **Exactly one NEU-887 frozen measurement contract is used by this package, and it is `MC-4 v1.0`. No metric is defined locally, in this document or in any of the twelve preceding ones, and no frozen contract is redefined.** The `MM-T*` values quoted across `06_…`, `08_…` and `09_…` are **NEU-888 mastery thresholds**, cited by id, **binding in shape and open in value** — they are not metrics this package defines and not NEU-887 measurement contracts.

### 5.2 MEASURED — a named tool produced this number against a named artifact

Class **2 `[code-evidence]`** throughout unless marked otherwise, with the limitation each measurement's own document states.

| Id | Measured quantity | Value | Instrument and source |
| --- | --- | --- | --- |
| **`MET-1`** | `prerequisite_depth` re-derivation agreement over non-root nodes | **179 / 179 agree · 0 disagree · 0 depth mismatches · 0 stage inversions** | The untouched C005 integrity validator; `07_…` §0, §3.3 |
| **`MET-2`** | Graph shape the calibration ranges over | **187** nodes · **8** frozen roots · **179** non-root · **5** registered anchors; all 179 share one dimension key-set | `07_…` §3.3 |
| **`MET-3`** | `progression_stage` distribution | `PS-1` **19** · `PS-2` **26** · `PS-3` **27** · `PS-4` **107** (= 179); **`PS-0` instantiated by none** | `07_…` §3.3 |
| **`MET-4`** | `entry_gate` distribution | `gate-a` **19** · `gate-c` **160**; **`gate-b`, `gate-d`, `gate-e` all 0** | `07_…` §3.3 |
| **`MET-5`** | `MC-4 v1.0` false-accept rate on the committed adversarial batch | **0 of 10** known-incorrect fixtures scored `quality ≥ 3` → **0.000**, against an `overValidationCeiling` of **0.1** → **within ceiling**; **0 of 5** valid-but-unusual fixtures falsely rejected. Collection **non-zero and checked before the verdict**: 2 files, 10 tests. | `09_…` §12 — **bounds the deterministic half only; the AI-grading stage is stubbed** (`CAP-S9-2`) |
| **`MET-6`** | Template fabrication-probe pass rate, identifier-bearing fields | **10 / 10** (run 1) and **10 / 10** (run 2), independently | `dry-run/02_` §, `dry-run/03_` § — scoped to identifier-bearing fields (`OI-S2-8`); *not* ten blank refusals |
| **`MET-7`** | Corpus-swap post-conditions | **4 / 4 PASS** | `dry-run/06_` §5 — class **3 `[dogfooding]`**, constructed specimen, **n = 1** |
| **`MET-8`** | Exemplar form-slot completability | **27** REQUIRED slots · **21** instantiated · **6** `unreachable`; cluster coverage **4 / 4**; completable **1 / 4** | `11_…` §3.5 |
| **`MET-9`** | Standards-conformance review | **16** cells · **8** verdicts · **0** artifact violations · **2** violations inside the standards' own reach | `11_…` §4.1–§4.5 |
| **`MET-10`** | First execution of the combination rule | **n = 4**; four triples; load dimensions observed in **{0, 1, 2, 3, 4, 5}** | `11_…` §5.1 — **explicitly does not close `CAP-S7-3`** |
| **`MET-11`** | Package classification rows and their distribution, **re-derived** | **135** rows · mechanism `deterministic` **50** · `schema` **28** · `server-side` **19** · `automated` **19** · `AI` **19** · blocking `blocks` **108** · `warns` **4** · `quarantines` **23** · placement (rows) authoring-time **121** · both **14** · serve-time-only **0** | This document, §8 — parsed from the merged `09_`/`10_`/`11_` row tables |
| **`MET-12`** | Distinct named gate ids across the package, and new ones | **59** distinct · **0** introduced by `10_` or `11_` · **0** introduced by this document · serve-time gates **1** (`G-DRIFT`) | This document, §8 |

### 5.3 DECLARED — a value this package fixed by decision, which no measurement supports

**This section exists so that not one number in it can be read as a member of §5.2.** Each of these is a legitimate engineering choice; none is evidence.

| Id | Declared value | What it is not |
| --- | --- | --- |
| **`MET-13`** | `provisional_load_index` weights the five load dimensions **equally**. | **Not a finding that the five contribute equally.** Equal weight was chosen *because no evidence discriminates a weighting* — the absence of a finding, expressed as a number. `OI-S7-3`. |
| **`MET-14`** | The staleness window **`W` = 90 days**. | **Declared, not measured** — validating it requires observing drift over real citations, and there are none. `CAP-S10-1`, `OI-S10-2`. |
| **`MET-15`** | The nominal per-source request budget **`B` = 1 per source per day**. | A **placeholder that binds nothing**. The **operative** per-source budget is **`0`** while stated rate limits are unestablished (`EQ-S10-11`) — and that `0` is *derived from a restricted rights row*, not measured either. It was reached by refusing a polite-looking non-zero number, which is the house style. |
| **`MET-16`** | Every `MM-T*` threshold value quoted anywhere in the package. | **Binding in shape, open in value.** A design may cite a provisional value and may **never lower** one. `CAP-S6-6`. |
| **`MET-17`** | `MM-T7`'s ≥ 0.90 correct-answer-exposure detection rate. | Measured **on the in-app path, in the owning package**. Nothing in C009 measured it, and the out-of-band path owes no such step. |

### 5.4 INADMISSIBLE — not missing, not deferred, not awaiting access

Four input shapes are **inadmissible outright** for difficulty calibration. This is closed by **`RS-4`** and is *"not a gap awaiting access; it is a thing this project does not do."*

| Inadmissible input | Why |
| --- | --- |
| A **percentile** of any population | Requires a population this project neither has nor is entitled to construct. |
| A **cohort, band or quantile** | Same, one level of aggregation up. |
| A **difficulty distribution** over a returned set | Requires retaining an enumerating response — prohibited by `DEC-4` independently. |
| A **ranking against a returned set** | Same, and it also reproduces the source's evaluative curation. |

**And one class-level inadmissibility, package-wide:** **class 7 `[future-real-user]` does not exist for this package.** No claim anywhere says or implies that users want something, that the market validates something, that experts confirm something, or that a position has been externally validated. **A single class-7 claim is a gate failure, not a note** — and this document asserts none.

---

## 6. The targeted-prototype record

A prototype here is bounded to **exactly one** quality claim that could not be resolved on paper. **One ran code. Five are desk-executed specimens.** Every entry is labelled for what it is, and no evidence class is upgraded.

| Id | Prototype | The **single** claim it was bounded to | What it is | Result | Cap, by id |
| --- | --- | --- | --- | --- | --- |
| **`PROTO-1`** | The committed adversarial over-validation batch, run 2026-08-10 via the local `vitest` binary directly (`09_…` §12). | *Does the deterministic rubric→quality mapper over-validate deliberately shallow or wrong answers beyond `MC-4 v1.0`'s ceiling?* | **A bounded prototype. Not a harness, and not an end-to-end `MC-4 v1.0` measurement.** It feeds hand-encoded rubric payloads directly to `mapRubricToQuality`; **the AI-grading stage is stubbed**, so it bounds only the downstream deterministic half. Class **2**. | `MET-5` — within ceiling. Collection was non-zero and checked **before** the verdict was read. | `CAP-S9-2` |
| **`PROTO-2`** | The corpus-swap verification (`dry-run/06_`). | *Does retiring a citation strand a learner's accumulated mastery evidence?* | **A desk-executed constructed specimen**, class **3 `[dogfooding]`**, **n = 1**. No store implements the record shape. | `MET-7` — 4/4 PASS. | `CAP-S6-3` |
| **`PROTO-3`** | The template fabrication probes, runs 1 and 2 (`dry-run/02_`, `dry-run/03_`). | *Will a content template elicit a fabricated identifier, address or citation?* | **Two desk-executed probe runs**, one agent each. The pass condition is **scoped to identifier-bearing fields** and that scope is owned, not implied. | `MET-6` — 10/10 and 10/10. **The admitting branch was never exercised**: no source was reachable, so whether a real resolution produces a real PASS remains untested. | `CAP-S2-3`, `CAP-S3-5` |
| **`PROTO-4`** | The contamination probe designed in `09_…` §10. | *Is an AI reviewer's agreement with an editorial solution independent evidence, or memorisation?* | **NOT RUN.** The desk-check that replaced it: the explicit contamination policy plus the `C-3` probe finding over committed documents, with the honest statement that **contamination is not detectable in general**. Recorded as a desk-check, **never as an executed measurement**. | — (no measurement is claimed) | `CAP-S9-4` |
| **`PROTO-5`** | The two acceptance scenarios and the end-to-end walk (`11_…` §5, §6). | *Does the specified system block a hostile authoring attempt, and does it catch a hidden failing case?* | **Desk-executed. Nothing passed through any pipeline.** The first claim is discharged (three blocks, three distinct non-`AI` mechanisms); **the second is not** — the hidden failing case is **not caught**, because the boundary limb is `unreachable`. | `MET-8`, `MET-9`, `MET-10`; `OI-S11-3` | `CAP-S11-3` |
| **`PROTO-6`** | The drift simulations (`10_…`). | *Do the five drift signals fire on the changes they were written for?* | **Desk-executed by the producing task.** The signal set's **miss rate is unknown**. | — (no measurement is claimed) | `CAP-S10-5` |

> **No prototype in this table is described as validated, user-tested, expert-confirmed, or proven for our learners.** `PROTO-2`'s class 3 is a **proxy** signal — one skilled party's constructed run — and under NEU-887's rule 3 it may never be relabelled or summarised as class 7. It is worth a great deal more than nothing and a great deal less than validation.

---

## 7. Self-classification of this sub-task's own quality requirements

This sub-task lands **after** SUB-9, so every quality requirement it creates is out of reach of SUB-9's classification pass and its residual clause. Each is classified below **in SUB-9's published scheme and table shape**, so the tables merge without translation: mechanism from the closed five-value vocabulary applied **weakest-sufficient, first-match-wins**; blocking behaviour from the closed three-value vocabulary; two placement columns, **exhaustive-not-exclusive**.

### 7.1 The classification table

| Id | Quality requirement this sub-task creates | Mechanism | Blocking | Authoring-time | Serve-time |
| --- | --- | --- | --- | --- | --- |
| **`EQ-S13-1`** | The risk register names a **durable source of record**, cited by id, with the date the risk set was taken from it. | `deterministic` | `blocks` | ✅ | — |
| **`EQ-S13-2`** | The inline charter risk set is **row-complete** against that source — one row per risk the named source carries. | `deterministic` | `blocks` | ✅ | — |
| **`EQ-S13-3`** | **No record names a gitignored path as a source of record.** | `deterministic` | `blocks` | ✅ | — |
| **`EQ-S13-4`** | Every cap reference resolves to an id **defined in `91_caps-and-incomplete-scope.md`**. | `deterministic` | `blocks` | ✅ | — |
| **`EQ-S13-5`** | **No cap's owner or resolution condition is restated** anywhere in these records. | `AI` | `blocks` | ✅ | — |
| **`EQ-S13-6`** | Every metric carries a **frozen contract id and a version**. | `deterministic` | `blocks` | ✅ | — |
| **`EQ-S13-7`** | **No metric is defined locally** and no frozen contract is redefined. | `AI` | `blocks` | ✅ | — |
| **`EQ-S13-8`** | Every prototype entry names **exactly one** bounded claim and is labelled a **prototype**, never a harness. | `deterministic` | `blocks` | ✅ | — |
| **`EQ-S13-9`** | Every published figure sits under **exactly one** of *measured* / *declared* / *inadmissible*. | `schema` | `blocks` | ✅ | — |
| **`EQ-S13-10`** | Every register entry cites the **artifact version** (file and section) it was built from. | `deterministic` | `blocks` | ✅ | — |
| **`EQ-S13-11`** | **An open question is recorded as open, never as decided.** | `AI` | `blocks` | ✅ | — |

**Serve-time placement is `—` on every row, and that is a finding rather than an omission:** these requirements govern a published document, and **no serve surface exists** to place any of them on (`CAP-S9-6`).

### 7.2 Roll-up

| Axis | Distribution |
| --- | --- |
| **Mechanism** | `deterministic` **7** · `schema` **1** · `server-side` **0** · `automated` **0** · `AI` **3** — total **11** |
| **Blocking** | `blocks` **11** · `warns` **0** · `quarantines` **0** — total **11** |
| **Placement (rows)** | authoring-time **11** · serve-time **0** · both **0** — total **11** |

**Package totals after this sub-task** (§8's re-derived 135 rows plus these 11): **146 rows** · `deterministic` **57** · `schema` **29** · `server-side` **19** · `automated` **19** · `AI` **22** · `blocks` **119** · `warns` **4** · `quarantines` **23** · authoring-time **132** · both **14** · serve-time-only **0**. Each axis sums to 146.

### 7.3 Enforcement-gap entries — one per `AI` row

Each names the residual, the compensating **observable** gate, that gate's owner, and — the part that matters — **what the compensating gate does not catch.**

| Row | The `AI`-judgment residual | Compensating observable | Owner | **What it does not catch** |
| --- | --- | --- | --- | --- |
| **`EQ-S13-5`** | Whether a sentence restates a cap's owner or resolution condition, as opposed to citing the cap by id, is a reading judgement. A lexical scan can find the id; it cannot find a paraphrase of an owner. | **`92_package-completeness-gate.md`**'s declared **Register integrity** check — *"every gap recorded in a topic document has a matching register entry, and every register entry traces back to the document that raised it."* | **NEU-969 (SUB-12)** | A restatement written in different words from the register's own. The gate's scans are lexical and **cannot establish the absence of semantic paraphrase** — the same limitation `CAP-S1-5` and `CAP-S2-6` name. |
| **`EQ-S13-7`** | Whether a sentence *defines* a metric or merely *reports* one is a judgement. `MET-11` and `MET-12` publish numbers this sub-task derived — the boundary between "derived and reported" and "defined" is exactly where an unnoticed local definition would sit. | **None that is observable today.** Carried as **`CAP-S13-1`**. | — (no gate can be named; the cap carries it) | Everything. This is recorded as a gap with no compensating gate rather than assigned to a gate that would not detect it — the same honesty `CAP-S9-3` applies to its two uncompensated residuals. |
| **`EQ-S13-11`** | Whether a decision has been recorded as *open* rather than quietly presented as *decided* is a reading judgement over prose. §2.2 is structurally separated for exactly this reason, but structure is not proof. | **`92_…`**'s declared **Status discipline** check — *"no producing task has promoted its own artifact to `settled`"*, and **Honest residuals** — *"every unresolved item names who carries it and what would close it."* | **NEU-969 (SUB-12)** | A decision recorded as open in one section and leaned on as settled in another. The gate checks that open items are *declared*; it does not trace how each is *used*. |

### 7.4 The residual clause

> **"…and any material decision, risk, metric or prototype this package produced that is not enumerated in the four records above."**

**Owned by this sub-task, and standing.** An unenumerated item **never defaults to "not material"** — it defaults to *unrecorded*, which is a gap with an owner, filed at `OI-S13-3`. And, mirroring `09_…` §3.5, `10_…` §7.4 and `11_…` §10.4:

> **"…and any quality requirement this sub-task creates that is not classified in §7.1."** An unclassified requirement is **blocked until classified**, never admitted by default. Filed at `OI-S13-6`.

Any OUT-11 obligation outside these four records and outside SUB-11's exemplars belongs to **SUB-12**.

### 7.5 No new gate id

**Zero new gate ids (`G-*`) are introduced by this document.** The two compensating observables named in §7.3 are the **already-existing** `92_package-completeness-gate.md` and its declared checks — a package artifact, not a member of SUB-9's `G-*` namespace — and the third `AI` row names **none**, carrying a cap instead. The package's distinct gate-id count is unchanged at **59** (§8).

---

## 8. Every figure in this document was re-derived, and one predecessor's roll-up did not survive it

**Method.** The `EQ-S9-*`, `EQ-S10-*` and `EQ-S11-*` classification rows were parsed out of the merged blobs on trunk with a `node -e` table parse — split each row on `|`, read the mechanism, blocking and placement cells positionally — and recounted. No published roll-up was taken on trust. This follows SUB-10's precedent, which caught its own `grep -o` over-count and re-derived every figure the same way.

| Check | Derived | As published | Verdict |
| --- | --- | --- | --- |
| `09_…` §4.9 roll-up vs its own §4 rows | 89 rows; `deterministic` 28 · `schema` 20 · `server-side` 15 · `automated` 11 · `AI` 15 | identical | **matches exactly** |
| `10_…` §7.2 roll-up vs its own §7.1 rows | 23 rows; `deterministic` 7 · `schema` 4 · `server-side` 3 · `automated` 7 · `AI` 2 | identical | **matches exactly** |
| `11_…` §10.2 **blocking and placement** roll-ups vs its §10.1 rows | — | identical | **matches exactly** |
| `11_…` §10.2 **mechanism** roll-up vs its own §10.1 rows | `deterministic` **15** · `schema` **4** · `server-side` 1 · `automated` 1 · `AI` 2 | `deterministic` **14** · `schema` **5** · `server-side` 1 · `automated` 1 · `AI` 2 | **DISAGREES — one row counted as `schema` is `deterministic`** |
| Distinct named gate ids across `09_`/`10_`/`11_` | **59** | 59 | matches |
| Gate ids appearing in `10_` or `11_` and absent from `09_` | **0** (empty set) | "no new gate id" | matches |
| Serve-time gates | **1** — `G-DRIFT`; all 14 `both` rows resolve to it | 1 | matches |

**The consequence, stated so nobody propagates the wrong line.** The package mechanism totals after SUB-11 are **`deterministic` 50 · `schema` 28**, not the 49/29 that `11_…` §10.2's roll-up would produce. **Every operative row is correct**; only the summary line disagrees with them — the same shape as `OI-S1-14` and `OI-S4-8`.

**And it is routed, not corrected.** `11_…` belongs to SUB-11. The shared registers are append-only and *"no sub-task reflows, renumbers, or rewrites another sub-task's entries"*; that rule protects a sibling's document at least as strongly as it protects a register section. **Filed as `OI-S13-1`** with an owner and a revision trigger. A unilateral edit of another sub-task's published table — even a correct one — is the failure mode the append-only convention exists to prevent.

**Units matter and are stated.** `09_…` §7.1's *"authoring-time 59, serve-time 1, both 1"* counts **gates**; `MET-11`'s *"authoring-time 121, both 14"* counts **rows**. The 14 `both` rows all resolve to the single `both` gate. The two are consistent and are not two measurements of the same thing.

---

## 9. Scope — what this document does not do

- **It produces no exemplar, no standards-conformance review and no acceptance-scenario run.** SUB-11's results are **read and cited; nothing is re-run.**
- **It does not run the completeness gate, the §8 acceptance checklist, or the register reconciliation.** All three are **SUB-12's (NEU-969)** alone, and `92_…` is not touched here.
- **It owns, restates, re-severity-es and resolves no cap and no risk.** Caps are cited by id; charter severities are carried verbatim; §3.3's two locally-assigned severities are labelled as locally assigned.
- **It re-decides, re-opens and improves no decision.** A decision that looks wrong is a finding routed to its producing sub-task — which is what §8 does with `11_…` §10.2 rather than editing it.
- **It defines no metric and redefines no frozen contract**, and it runs no further prototype.
- **It reaches no source on any access path.** **Zero requests were issued by this sub-task.**
- **It sets no status and promotes nothing to `settled`** (`A4`).
- **It authors no map content and changes no source, schema, migration or test.**

---

## 10. Verification note — `qa-execution:engine` is unconfigured

The repository's capability registry resolves **`git` and `linear` only**. **No capability owns the `qa-execution:engine` surface**, so the QA-execution phase over this deliverable is a genuine **Core Article 8 no-op** — the phase runs inert by design, not skipped.

**What was refused: reporting a QA pass.** No engine ran, so no engine's verdict is claimed, implied or summarised. What *was* executed is recorded for exactly what it is: a `node -e` re-derivation of every published figure against the merged blobs (§8), a cross-reference resolution scan over every id cited here, and `git diff --numstat` to establish that both shared-register edits are pure additions. **A type-check is not claimed as evidence about this change**: the deliverable is markdown, a linked worktree carries no installed dependency tree, and a green compile of an unrelated tree would be a **vacuous pass dressed as a green line** — the exact move `CAP-S3-4`, `CAP-S7-2`, `CAP-S10-3` and `OI-S8-4` each refuse in their own domain. `CAP-S13-1` names what remains uncovered.

---

## 11. `docs/GLOSSARY.md` — untouched, and the decision disclosed rather than implied

**`docs/GLOSSARY.md` is not modified by this sub-task.** This **follows** the precedent SUB-2, SUB-6, SUB-7, SUB-8, SUB-9, SUB-10 and SUB-11 each set and each disclosed. The reasoning is theirs and is not re-derived: the glossary is the **product's** domain-term lookup, and the ids introduced here (`DEC-*`, `RK-*`, `MET-*`, `PROTO-*`, `EQ-S13-*`) are **register row labels local to one research document**, not product vocabulary. `OI-S6-9` already carries the standing deferral for the package's signal ids; this document adds no new class of term to it.

---

## 12. Evidence and records

| Artifact | What it carries |
| --- | --- |
| `90_open-items-and-provisional-register.md` § `SUB-13` | `OI-S13-1` … `OI-S13-8`, each with an owner and a revision trigger. |
| `91_caps-and-incomplete-scope.md` § `SUB-13` | **`CAP-S13-1`** — one entry, with an owner and a closure condition. |
| The published **`NEU-890`** umbrella | The durable source of record for the charter risk set (§1), taken 2026-08-11. |

**Evidence classes carried by this document.** The decisions record, the scope statements and the residual clauses are **reports of specification**, and are claimed as such. `MET-1`–`MET-12` and the §8 re-derivation are class **2 `[code-evidence]`** — operational facts about committed files and a retrieved tracker record, with each measurement's stated limitation carried alongside it. `MET-7` is class **3 `[dogfooding]`**, n = 1, and is labelled a **proxy** wherever it appears. The five syntheses in §4 are this document's own reading of records other sub-tasks filed; **each names the ids it is built from so it can be checked rather than believed**, and none upgrades the evidence class of any record it reads. **No class 5, class 6 or class 7 evidence appears anywhere in this document, and no claim in it is or implies a class 7 claim.**

**Provenance.** Inputs: the NEU-968 issue and its acceptance scenarios; the published NEU-890 umbrella (retrieved 2026-08-11, charter body present, `## Risks` 14 rows); and every merged C009 artifact at base `db696a9` — `README.md`, `00_`–`11_`, `90_`, `91_`, `92_`, `decision-records/DR-C09-01`, `DR-C09-02`, `DR-C09-04`, and `dry-run/02_`, `03_`, `06_`.

**Consumers:** **SUB-12 (NEU-969)**, which reconciles the registers and runs the completeness gate; and the downstream charters NEU-891, NEU-892, NEU-895 and NEU-896, **none of which can retrieve this charter** — which is why §1 exists.

**This document modifies no source file, no MCP behaviour, no schema, no migration and no test.**
