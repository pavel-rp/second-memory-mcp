# 90 — Open Items and Provisional Register (shared, package-level)

**Package:** C009 course content quality · **Charter:** C009 (umbrella NEU-890) · **Opened:** 2026-08-10 by **NEU-957 (SUB-1)** · **Writers:** all thirteen sub-tasks, by append · **Status:** **this file SETS no status.** Status lives in a ledger — this package's `adjudication/`, or the owning package's ledger for an inherited decision
**Model:** claude-opus-5[1m]

---

## Append convention — read this before writing a single line

> Each sub-task appends its own `### <SUB-id>` section. No sub-task reflows, renumbers, or rewrites another sub-task's entries. On a merge conflict in this file, keep **both** sides.

**Why it is stated this bluntly.** Up to **three of the thirteen sibling sub-tasks are in flight concurrently**, none of them able to see another's working tree, and **all thirteen** write into this file and into `91_caps-and-incomplete-scope.md`. That makes both files **merge-conflict magnets**, and the default resolution — pick one side — silently deletes a sibling's open item. **An open item that is silently deleted is worse than one that was never filed:** the package then reads as complete while carrying an unowned gap, which is precisely the failure this register exists to prevent. Keeping both sides converts that failure into a **visible duplicate** — noisy, harmless, and fixable by one declared owner at the end.

**Duplicates are expected and are not cleaned up in flight.** **NEU-969 (SUB-12) is the declared single owner that reconciles the caps register at the end** — it merges duplicate entries across both shared registers, resolves cross-references, and publishes the reconciled result alongside the completeness gate (`92_package-completeness-gate.md`). Until SUB-12 runs, a duplicate entry is correct-by-convention, and any other sub-task that "tidies" one is destroying evidence rather than helping.

**Id namespacing.** Each sub-task ids its own entries `OI-S<n>-k` (SUB-1's are `OI-S1-1` … `OI-S1-15`), so two sections appended concurrently can never collide on an id and no sub-task ever needs to renumber another's.

**Every entry carries an owner and a revision trigger.** An entry with neither is not an open item; it is a complaint.

---

## Entries

### SUB-1 — NEU-957, provenance and rights (OUT-7)

**Owner defaults, stated once and surfaced for reassignment.** Where an entry below names **the creator** as owner, that is a **default assignment made by the authoring pass**, consistent with `CAP-2`'s owner precedent (`../C005-dp-map-package/03_open-items-and-provisional-register.md:307-309`), not a decision that the creator has accepted the item. Every default is visible here precisely so it can be reassigned; reassignment is an edit **within this section**, by its owner.

#### `OI-S1-1` … `OI-S1-12` — terms, robots directives and stated rate limits could not be established for any source · **provisional / restricted by default**

**The gap, once, for all twelve.** No network access was available or permitted to this sub-task and **zero HTTP requests were issued** (`00_method-and-provenance.md` §4.1). No licence page, terms document, `robots.txt` or rate-limit header was read on 2026-08-10 for **any** of the twelve sources. Under the restricted-by-default rule (`00_…` §4.4), every source is therefore recorded **restricted** in `01_provenance-and-rights.md` §3 — **never permissive by omission.** These twelve entries are the register half of that record: one per source, each an open item rather than a shrug.

**An inability to read a source's terms is not evidence that the terms permit anything.** These entries close only by a **dated reading of the source's own terms**, recorded as a new re-verification pass with its own cutoff. No fetch outcome, absent `robots.txt`, or unenforced rate limit closes any of them.

| Id | Source | What is unestablished at the 2026-08-10 cutoff | Recorded disposition | Owner | Revision trigger |
| --- | --- | --- | --- | --- | --- |
| **`OI-S1-1`** | **T1** CP-Algorithms | Robots directives and stated rate limits for a single targeted fetch of one problem by its id. The CC BY-SA content licence is recorded, but **a content licence is not a crawl permission** and says nothing about access. | **Restricted** | the creator (default) | **Network access becomes available to a re-verification pass** — or the source's terms are read and dated by any other means. |
| **`OI-S1-2`** | **T2** Competitive Programmer's Handbook | Robots directives and stated rate limits. Separately, the **licence itself has never been machine-verified** — asserted from the work's stated terms at two consecutive cutoffs (see `91_caps-and-incomplete-scope.md`). | **Restricted** | the creator (default) | **Network access becomes available to a re-verification pass** — or the work's licence is read and dated at source. |
| **`OI-S1-3`** | **T3** USACO Guide | Robots directives and stated rate limits. The recorded reproduction bar governs **content** and is independent of any access directive; it neither grants nor withholds access. | **Restricted** | the creator (default) | **Network access becomes available to a re-verification pass.** |
| **`OI-S1-4`** | **T4** Codeforces community catalogues | Robots directives and stated rate limits. The single recorded automated-access datapoint is `CAP-2`'s **HTTP 403** at the prior cutoff — **evidence of refusal, never of permission**, and no new information about it exists at this cutoff. | **Restricted** | the creator (default) | **Network access becomes available to a re-verification pass.** Closing `CAP-2` itself is SUB-3's work, not SUB-1's. |
| **`OI-S1-5`** | **T5** CN/JP olympiad traditions | Robots directives and stated rate limits, **per host within the class**. A heterogeneous set of community writeups with no single terms surface; a reading of one host would not transfer to another. | **Restricted** | the creator (default) | **Network access becomes available to a re-verification pass** — and per host, not class-wide. |
| **`OI-S1-6`** | **T6** Primary literature | Robots directives and stated rate limits, **per publisher**. No publisher's directives were read. | **Restricted** | the creator (default) | **Network access becomes available to a re-verification pass** — and per publisher. |
| **`OI-S1-7`** | **C1** CSES | Robots directives and stated rate limits for a single targeted fetch of one problem by its id. | **Restricted** | the creator (default) | **Network access becomes available to a re-verification pass.** |
| **`OI-S1-8`** | **C2** AtCoder EDPC | Robots directives and stated rate limits; AtCoder's terms document was not retrieved. | **Restricted** | the creator (default) | **Network access becomes available to a re-verification pass.** |
| **`OI-S1-9`** | **C3** AtCoder TDPC | Robots directives and stated rate limits; the disposition is additionally inherited by analogy from C2 rather than read separately. | **Restricted** | the creator (default) | **Network access becomes available to a re-verification pass.** |
| **`OI-S1-10`** | **C4** Codeforces problemset | The API's own **stated rate limits** and the site's robots directives, neither of which was read. **A documented API is on record for C4 (charter assumption 24) — and an API's existence is not a rate-limit reading and is not a permission.** The restricted default applies to C4 exactly as to the other eleven. | **Restricted** | the creator (default) | **Network access becomes available to a re-verification pass** — and the API's stated terms and limits are read and dated. |
| **`OI-S1-11`** | **C5** ICPC / IOI / JOI / POI / CEOI archives | Robots directives and stated rate limits, **per contest host**. Terms are per-contest; a reading of one archive would not transfer to another. | **Restricted** | the creator (default) | **Network access becomes available to a re-verification pass** — and per archive host. |
| **`OI-S1-12`** | **C6** Library Checker | Robots directives and stated rate limits, notwithstanding the recorded permissive content licence. **A permissive licence is not a crawl permission.** | **Restricted** | the creator (default) | **Network access becomes available to a re-verification pass.** |

#### `OI-S1-13` — `CH-F5-1`, the ledger challenge against `D-F5` · **unresolved / open**

| | |
| --- | --- |
| **Open item** | **`CH-F5-1`** — the challenge filed against **`D-F5`** covering **every problem-reference field beyond the stable id and the canonical URL**: `title`, numeric `constraints`, difficulty signal, curriculum placement. Filed by **NEU-957 (SUB-1) of charter C009**, by append, as a new section in `../C005-dp-map-foundations/adjudication/01_selection-decision-ledger.md`. |
| **Status** | **unresolved / open.** Never decided here: **a producing task may not promote its own artifact** (`A1`–`A5`). `decision-records/DR-C09-01_permitted-field-set.md` sets no status of its own, and this register sets none either. |
| **Interim position everyone relies on** | **Until the challenge resolves, a problem reference stores `stable id` + `canonical URL` and nothing else** (`01_provenance-and-rights.md` §4.1). **Charter assumption 19 remains `[unconfirmed]`** and is relied on by nothing in this package. A sub-task needing a wider set cites `CH-F5-1` by id, records its position for **both** dispositions, and carries the unresolved field set as a cap in `91_caps-and-incomplete-scope.md`. |
| **Owner** | **`D-F5`'s own owner — NEU-932 — or the creator by default.** The default is surfaced here for reassignment; SUB-1 filed the challenge and does not own its resolution. |
| **Revision trigger** | **The foundations ledger records a disposition for `CH-F5-1`.** That is the only route: this entry does not close by a downstream sub-task deciding it needs the fields, by SUB-3's execution experience, or by charter assumption 19 being restated. |
| **Supporting record** | `01_provenance-and-rights.md` §4 and §4.1 · `decision-records/DR-C09-01_permitted-field-set.md` · `traceability/01_rights-evidence-register.md` `RG-24`…`RG-26` |

#### `OI-S1-14` — the C005 baseline's summary lines disagree arithmetically with its own rows · **recorded, not corrected**

| | |
| --- | --- |
| **Observation** | In `../C005-dp-map-foundations/05_provenance-and-rights.md`, the **twelve per-source rows** and the **§1 summary line at `:26`** resolve consistently to **9 inform-only + 2 cite-only + 1 reusable = 12**, summarised as *"11 of 12 sources are inform-only or cite-only"*. Its **`RC-2` result cell at `:63`** and the **`D-F5` ledger row at `../C005-dp-map-foundations/adjudication/01_selection-decision-ledger.md:26`** both instead summarise the same set as *"10 inform-only, 2 cite-only, 1 reusable"* — which totals **13 against a 12-source set**. |
| **What it is** | A **summary-line arithmetic slip, NOT a disposition difference.** This is the material distinction and it is why the entry reads the way it does: **every per-source row is unchanged**, and **every operative statement** — 11 of 12 inform-only or cite-only, exactly one (T1) freely reusable, nothing reproduced even from T1 — **is consistent across both documents**. No source's disposition is in doubt, nothing downstream was decided on the wrong count, and the C009 re-verification reproduces the per-source rows, not the summary. |
| **What it is not** | It is **not** a finding that a disposition changed since 2026-07-16 (§1.1 records twelve of twelve unchanged), and it is **not** a defect this package repairs. **The baseline file is never edited by this package**, and no ledger row is edited in place — a correction is the owning package's to make, by its own route. |
| **Owner** | **NEU-932 (`D-F5`'s owner) — the creator by default.** Surfaced here for reassignment. |
| **Revision trigger** | **The next `D-F5` re-verification, or the next touch of the `D-F5` ledger row** — whichever comes first. At that point the summary line is brought into agreement with the rows by the party entitled to edit them. |
| **Provenance** | `01_provenance-and-rights.md` §1.2 · `../C005-dp-map-foundations/05_provenance-and-rights.md:26,63` · `../C005-dp-map-foundations/adjudication/01_selection-decision-ledger.md:26` · commit base `c558ff9` · class 2 `[code-evidence]` |

#### `OI-S1-15` — the §10 repository scan was recorded against the file set present when it ran · **provisional**

| | |
| --- | --- |
| **Open item** | `01_provenance-and-rights.md` §10 records five scans, their commands, their date and their outcomes against **the package files present at the moment it ran**. SUB-1's remaining files — the decision record, the evidence register and these three package-level files — landed in the same change, and every C009 sub-task will add more. The **outcome** is unaffected (none of the later files stores statement text, a problem-level URL, an enumerated candidate set, or a fenced block), but the recorded per-file counts describe a smaller file set than the package now has. |
| **Why it is filed rather than patched** | §10 is a **dated scan result**. Rewriting its counts to match a later file set would present a re-run that did not happen as though it had — the same failure mode as a fabricated fetch, at smaller scale. The honest form is a re-run with its own date, which is exactly what §10's re-run obligation already requires. |
| **Owner** | **SUB-1 (NEU-957) / the creator** — SUB-1 is the residual owner of OUT-7. |
| **Revision trigger** | **The completeness gate (`92_package-completeness-gate.md`) re-runs both scans over the whole package**, or any sub-task adds a path that holds problem references. **A hit is a failure to fix, not a note to add.** |

### SUB-2 — NEU-958, content and exercise forms (OUT-1)

**Residual ownership, stated once.** SUB-2 is **OUT-1's residual owner**. Where an entry below names SUB-2 as owner, that is not a default assignment — it is the residual clause operating. Where it names another party, the assignment is a **default made by the authoring pass** and is surfaced here precisely so it can be reassigned.

#### `OI-S2-1` — the residual clause is standing and unexercised, not discharged · **open by design**

| | |
| --- | --- |
| **Open item** | The residual clause — *"…and any content or exercise form required by a mechanism `M01`–`M10` that is not one of the ten enumerated above"* — is an **owned, standing clause** (`02_content-and-exercise-forms.md` §8.2). At this cutoff it is **unexercised**: the reverse trace (§8.1) shows all ten mechanisms served by an enumerated form, so no eleventh form is required today. |
| **Why it is filed rather than closed** | "No gap today" is not "no gap possible". The clause exists because the absence of exactly this rule upstream produced **all ten `INC-C1` gaps**. Closing it on a clean reverse-trace would recreate the condition it was written to prevent — a mechanism revision could strand a mechanism and the trace table would simply omit it. |
| **Owner** | **SUB-2 (NEU-958) / the creator** — residual owner of OUT-1. |
| **Revision trigger** | **Any revision to `M01`–`M10`**, or any mechanism found to require an observable behaviour no enumerated form carries. At that point the missing form is recorded here as a new `OI-S2-k` entry and resolved — **never left as a silent omission in the trace table.** |

#### `OI-S2-2` — whether the **solution** form should carry the discriminative field pair · **decided provisionally, filed as reviewable**

| | |
| --- | --- |
| **Open item** | Seven of the ten forms are decided discriminative and carry the REQUIRED `misconception_or_edge_case` / `separating_distractor_or_boundary_input` pair. **`solution` was decided NOT discriminative** (`02_…` §4), on the grounds that its learning function is post-attempt exposure (`M06`), not separation. The task's enumeration was a **floor, not a boundary**, so the decision to stop at seven is a judgement, not a derivation. |
| **What was added beyond the floor** | **visualization** and **proof**, each with a stated per-form rationale (§4). The floor five — retrieval, assessment, reflection, test, worked example — are all included. |
| **Owner** | **SUB-9 (NEU-965)** — the quality-system owner, which specifies what validates a form — **or the creator by default.** Surfaced for reassignment. |
| **Revision trigger** | **SUB-9 specifying a gate over the solution form**, or **SUB-4** setting a correctness bar that the pair would carry evidence for. Either resolves whether the pair belongs on `solution`. |

#### `OI-S2-3` — the placement matrix is a design assertion, not a per-node derivation · **provisional**

| | |
| --- | --- |
| **Open item** | `02_…` §6.3 states, per form and per skill type, whether a form is required, optional or not applicable. The matrix is asserted from each form's learning function; it is **not** derived by inspecting the 187 mapped nodes, and no node was checked against it. |
| **Why it is filed** | An author reading the matrix will treat it as authoritative for their node. If a real node's requirements contradict a cell, that is a finding about the matrix, and it must land somewhere visible rather than being resolved silently per author. |
| **Owner** | **SUB-11 (exemplars)** — the first sub-task to instantiate forms against real nodes — **or the creator by default.** |
| **Revision trigger** | **The first exemplar authored against a real node whose required forms contradict a matrix cell**, or any node-level authoring pass that exercises the matrix at scale. |

#### `OI-S2-4` — the probe produced an unsourced provenance characterization · **recorded, below the failure threshold**

| | |
| --- | --- |
| **Observation** | In the cold-agent fabrication probe (`dry-run/02_template-fabrication-probe.md` §3), the **example** template's output described a hand-constructed instance as *"the standard textbook counterexample."* **No book, author, identifier or address was produced**, so this is **not** a fabricated citation and does **not** fail the probe's stated condition (which the run passed 10/10). |
| **Why it is filed anyway** | An appeal to an unnamed authority occupies the **same rhetorical position a citation would**. It is the nearest thing the run produced to the `EXC-1` failure mode, and recording it is cheaper than rediscovering it. It is the reason the lesson form's `claim_citations` field is REQUIRED rather than optional — that field forces the same impulse into a slot where its absence is visible. |
| **Owner** | **SUB-3 (NEU-959)** — which re-runs the probe against a real verification procedure — **or the creator by default.** |
| **Revision trigger** | **SUB-3's probe run.** If the same shape recurs there, it is escalated from an observation to a template defect and the affected template is revised. |

#### `OI-S2-5` — `README.md`'s index granularity was left undecided · **open**

| | |
| --- | --- |
| **Open item** | `README.md` carries a **generic** index row covering `02_…`–`89_…` as "the remaining topic documents, one or more per sub-task". SUB-2's documents are therefore **not** made stale by this change, and `README.md` was **deliberately not edited** — editing it would contend with concurrent siblings on a shared file for no correctness gain. Whether the index should eventually name each sub-task's document by number is **not decided here.** |
| **Owner** | **NEU-969 (SUB-12)** — the declared reconciling owner — **or the creator by default.** |
| **Revision trigger** | **SUB-12's reconciliation pass**, or the package reaching a document count at which the generic row stops being navigable. |

#### `OI-S2-6` — a fourth file was added beyond the spec's enumerated scope · **recorded, not silently taken**

| | |
| --- | --- |
| **Open item** | `traceability/02_form-mechanism-placement-matrix.md` is **not** in the spec's enumerated scope list. It was written because `traceability/README.md`'s own convention requires each sub-task to write the register rows for its own claims, and because the task's verification evidence names a traceability audit. It claims SUB-2's already-exclusive number `02`, so **no sibling can collide with it.** |
| **Why it is filed** | A reviewer should **see** a scope deviation rather than discover it in a diff. The verbatim probe output stayed at its separately named path (`dry-run/02_…`) rather than being folded in. |
| **Owner** | **SUB-2 (NEU-958) / the creator.** |
| **Revision trigger** | **Review of this change**, or SUB-12's reconciliation, either of which may fold the matrix elsewhere or ratify it in place. |

#### `OI-S2-7` — this catalogue relies on SUB-1's rows, which are restricted **by default**, not verified-restricted · **provisional / inherited**

| | |
| --- | --- |
| **Open item** | The problem-reference form and every statement about what may be stored about an external problem rest on SUB-1's twelve source access-permission rows. Those rows are **restricted by the restricted-default rule** — **no network access was available and zero requests were issued** (`OI-S1-1`…`OI-S1-12`). They are **not** verified-restricted. |
| **What that means here** | The form's narrow fillable set is **at least** as narrow as it must be, so the caveat cannot make this catalogue *less* safe. But no statement here may be read as evidence that any source's terms were checked. **An inability to read terms is not evidence the terms permit anything** — and equally, not evidence that they forbid it. |
| **Owner** | **SUB-3 (NEU-959)** for the sourcing half; **`D-F5`'s owner (NEU-932)** for the dispositions — **the creator by default.** |
| **Revision trigger** | **A dated re-verification pass with network access**, closing `OI-S1-1`…`OI-S1-12`. This entry does not close by this catalogue being reviewed. |

#### `OI-S2-8` — the probe's pass condition is scoped to identifier-bearing fields · **owned, not silent**

| | |
| --- | --- |
| **Open item** | The fabrication probe's stated condition — "every template yields an explicit refusal or the template's own non-data placeholder" — is applied to the **identifier-bearing fields**, not to the expository fields. **One** of the ten templates (problem-reference) refused outright; the other nine refused precisely in their identifier-bearing fields while authoring their prose fields. "10/10 PASS" therefore does **not** mean "ten refusals". |
| **Why it is filed rather than left as a reading** | A template whose purpose is to elicit exposition cannot honestly be failed for eliciting exposition — so the narrowing is defensible. But an unstated narrowing of a pass condition is how a check quietly becomes weaker than its headline, and this probe's headline is load-bearing for the whole catalogue. Stating the scope costs nothing; discovering it later costs the result's credibility. |
| **Owner** | **SUB-3 (NEU-959)** — which re-runs the probe and restates the condition for the admitting run — **or the creator by default.** |
| **Revision trigger** | **SUB-3's probe run**, which must state its own pass condition and its scope explicitly rather than inheriting this one by reference. |

### SUB-6 — NEU-962, assessment evidence out of band (OUT-5)

#### `OI-S6-1` — the residual signal clause is **standing and undischarged**, not closed by this document · **open by design**

| | |
| --- | --- |
| **Open item** | `06_assessment-evidence-out-of-band.md` §3.3 closes its signal enumeration with the clause *"…and any observable signal not enumerated above"*, which defaults to reliability class **`unclassified`** and **may feed no gate**. The enumeration is a **floor, not a boundary**: six signals were enumerated because six were observable at this cutoff, not because six is the complete set. |
| **Why it is filed rather than treated as discharged** | A residual clause that is recorded as "handled" stops being read. The safe default only works if someone is responsible for noticing when it fires — otherwise a seventh signal appears, nobody classifies it, and the honest failure mode (a signal that feeds nothing) quietly becomes a dishonest one (a signal used before it was classified). **The clause is unexercised: no unenumerated signal has ever been run through it** (`RG-S6-10`). |
| **Owner** | **SUB-6 (NEU-962)** as the classifying authority the clause names — **the creator by default.** Surfaced for reassignment. |
| **Revision trigger** | **Any new observable signal reaching the product** — a submission surface, a telemetry field, an integration with the source platform — which must be classified in `06_…md` §3.1 **before** it may feed anything. Also **SUB-9 (NEU-965)** specifying gates over a signal not in the enumeration. |

#### `OI-S6-2` — a false success report still pollutes **placement**, which no gate protects · **residual, bounded**

| | |
| --- | --- |
| **Open item** | Adversarial scenario (a) — a learner who reports success falsely (`06_…md` §7.1) — is stopped at every **gate**, because `self_report_outcome` has an empty may-feed list. It is **not** stopped at **placement**: the system may stop offering a problem the learner never solved, and may sequence past a node the learner has not met. |
| **What that costs, stated plainly** | A scheduling cost, not a mastery claim. No gate advances, no unlock fires, and no mastery history records a success. What degrades is the *usefulness* of what the learner is offered next — which is real, and is a different kind of harm from an unearned unlock. |
| **Why it is not fixed here** | Placement is not a gate, and this sub-task's remit is gate-bearing evidence. Fixing it would mean either treating the report as evidence (forbidden) or ignoring the learner's stated preference (a product decision not owned here). |
| **Owner** | **SUB-9 (NEU-965)** for whether placement warrants a gate at all; **the creator by default** for the product question. |
| **Revision trigger** | **SUB-9 specifying a placement-affecting gate**, or a product decision on whether a self-report may influence sequencing at all. |

#### `OI-S6-3` — the **unaidedness and authorship** of an out-of-band solve are not observable · **residual exposure, compensated not closed**

| | |
| --- | --- |
| **Open item** | Two scenarios collapse to one unobservable property. `MM-T9` (Gate A) requires an **unaided** correct application, and adversarial scenario (c) (`06_…md` §7.3) concerns a learner who pastes back a solution they did not write. **Neither unaidedness nor authorship of the external solve is observable to us.** A learner may have read an editorial, or copied the solution outright, and the pasted text is identical either way. |
| **The bound, stated exactly** | **At most one counted success toward `MM-T1`** may be obtained by copying. Gate A is not opened by the paste alone (`06_…md` §4.2); Gate B needs **K = 3** at q ≥ 3 across **≥ 2 sessions ≥ 1 day apart** (`MM-T1`, `MM-T2`); Gate C is server-evaluated and unreachable by any single artifact (`MM-T8`); Gates D and E are unreachable on out-of-band evidence entirely. |
| **The compensating in-app signal** | The remaining successes must come from **`retrieval_item_result`** and **`assessment_item_result`** on our own items, in **separated sessions**, each of which must **discriminate the node's named misconception** (`06_…md` §5). A copied solution transfers no ability to answer a discriminating item. |
| **What was deliberately refused** | **No stylometric, timing-based, or similarity-based authorship inference is proposed.** Each would manufacture a confident-looking signal from evidence that does not support one — the same failure `RA5` already forbids for AI judgement. **Refuse rather than invent applies to inferences, not only to citations.** |
| **Owner** | **SUB-9 (NEU-965)** as the gate owner that would have to enforce any narrower bound — **the creator by default.** |
| **Revision trigger** | **A genuinely observable authorship or unaidedness signal becomes available** (an in-app editor with captured attempts, or a source-platform integration), falsifying charter assumption 5. Also **SUB-9 deciding the one-success exposure is too wide**, which would tighten `MM-T1`'s admission rule rather than this design. |

#### `OI-S6-4` — a **drifted problem** can make a gate-bearing item wrong, and this design does not detect drift · **provisional / routed to SUB-10**

| | |
| --- | --- |
| **Open item** | Adversarial scenario (b) (`06_…md` §7.2): a learner solves the problem **as it now stands** after the source changed its constraints. The report itself feeds nothing, and a `pasted_solution` is graded against **our** rubric criteria — properties of the learner's *method*, not of the source's current constraint text — so the grade largely survives. What does **not** survive is an item authored against the old constraints: a `retrieval` item's `expected_response` may be stale, and a learner reasoning correctly about the current problem would be marked incorrect. |
| **What this design supplies instead of detection** | **Survivability, not detection.** Because the evidence record is corpus-neutral (`06_…md` §6), the blast radius of a drifted citation is **two subfields and one placement** — never a learner's mastery history. When drift *is* detected downstream, the swap procedure replaces the citation and every accumulated gate result stands (verified: `dry-run/06_corpus-swap-verification.md`, 4/4 PASS). |
| **What is explicitly not claimed** | **This design does not detect drift and does not claim to.** No staleness check, no re-verification schedule, and no constraint-diffing is specified here. |
| **Owner** | **SUB-10 (NEU-966)** — drift detection is its remit, and it cites the corpus-swap result rather than re-running it. |
| **Revision trigger** | **SUB-10 landing drift detection**, which supplies the missing half and may require this design to state what a detected-drift event does to an *already-counted* success. |

#### `OI-S6-5` — learner `response` text is **deliberately not redacted** in logging today · **live exposure, recorded not fixed**

| | |
| --- | --- |
| **Open item** | `src/shared/logger.ts`'s `LOG_REDACT` redacts only `password`, `token`, `apiKey`, `api_key`, `authorization` and `secret`, and its own doc comment records that learner `response` text is **intentionally not redacted** because it is useful diagnostic data. Every signal in this design that carries learner content — a `pasted_solution`, an `assessment` answer, a `post_hoc_reflection` — therefore travels through a logging path that does not redact it. |
| **Why it is filed here** | `P5` binds this package: raw learner payloads are never exposed, and log-derived evidence is aggregate-only; `EX6` excludes un-gated operational-log payloads. **This design does not lean on redaction it does not have** — it states the exposure rather than assuming it away. The two class-6 signals it defines (`self_report_outcome`, `return_timing`) are also the two that feed no gate, so no per-learner mastery claim rests on log-derived evidence. |
| **Why it is not fixed here** | **No `src/` change is in scope** — implementing any surface is explicitly excluded by this sub-task's brief. A redaction change is a code change with its own diagnostic trade-off, owned by whoever owns the logging policy, not smuggled into a research document's PR. |
| **Owner** | **the creator** (default) as the owner of the logging/privacy policy; **NEU-887**'s privacy gate as the governing artifact. Surfaced for reassignment. |
| **Revision trigger** | **A decision on whether learner `response` text is redacted, sampled, or retained under a bounded policy** — or any signal in this design being routed to a log-derived evidence path, which would make the exposure load-bearing rather than incidental. |

#### `OI-S6-6` — `DR-C09-02` may **collide** with a concurrent sibling's decision-record id · **procedural, for SUB-12**

| | |
| --- | --- |
| **Open item** | `DR-C09-nn` ids are **not namespaced per sub-task** — unlike `OI-S<n>-k`, `CAP-S<n>-k` and `RG-S<n>-nn`, which cannot collide by construction. Only `DR-C09-01` existed on the base this sub-task cut from, so `DR-C09-02` was free; **up to three siblings are in flight concurrently** and none can see another's working tree. |
| **What was done about it** | The id was used as-is and the risk filed, rather than renumbering to a speculative gap. **Renumbering to avoid a collision that may not happen is how a numbering scheme acquires holes nobody can explain later**, and this sub-task may not renumber another's record in any case. |
| **Owner** | **NEU-969 (SUB-12)** at reconciliation — the declared owner for exactly this class of cross-sub-task collision. |
| **Revision trigger** | **A second `DR-C09-02` appearing in the package**, at merge or at SUB-12's reconciliation. |

#### `OI-S6-7` — the corpus-swap run was kept in `dry-run/` rather than folded into the topic document · **scope decision, filed for visibility**

| | |
| --- | --- |
| **Open item** | `dry-run/06_corpus-swap-verification.md` is a separate file rather than a section of `06_…md`. It claims SUB-6's already-exclusive number `06`, so **no sibling can collide with it**. Mirrors `OI-S2-6`'s shape: a reviewer should **see** a scope decision rather than discover it in a diff. |
| **Why it was decided this way** | `dry-run/README.md` declares that folder the home for runs against constructed specimens, and SUB-2 kept its probe output at `dry-run/02_…` rather than folding it in. More importantly, **SUB-10 must cite this run by path**, and a citable run is easier to cite when it is a document rather than a subsection. |
| **Owner** | **SUB-6 (NEU-962) / the creator.** |
| **Revision trigger** | **Review of this change**, or **SUB-12's reconciliation**, either of which may fold the run elsewhere or ratify it in place. |

#### `OI-S6-8` — this design's statements about external sources inherit SUB-1's **restricted-by-default** rows · **provisional / inherited**

| | |
| --- | --- |
| **Open item** | Anything this design says about an external problem — that a citation may be retired, that constraints may drift, that a reference stores `stable_id` and `canonical_url` only — rests on SUB-1's twelve source access-permission rows. Those rows are **restricted by the restricted-default rule**; **no network access was available and zero requests were issued** (`OI-S1-1`…`OI-S1-12`). They are **not** verified-restricted. |
| **What that means here** | Mirrors `OI-S2-7`. The caveat cannot make this design *less* safe — a narrower permitted set only narrows what may be stored. But **no statement in `06_…md` may be read as evidence that any source's terms were checked**, and the corpus-swap run deliberately used a **placeholder** citation precisely so that it needed no verified one. |
| **Owner** | **SUB-3 (NEU-959)** for the sourcing half; **`D-F5`'s owner (NEU-932)** for the dispositions — **the creator by default.** |
| **Revision trigger** | **A dated re-verification pass with network access**, closing `OI-S1-1`…`OI-S1-12`. This entry does not close by this design being reviewed. |

#### `OI-S6-9` — the signal ids introduced here are **not** registered in `docs/GLOSSARY.md` · **deliberate deferral**

| | |
| --- | --- |
| **Open item** | `06_…md` §3.1 introduces six signal ids — `self_report_outcome`, `pasted_solution`, `retrieval_item_result`, `assessment_item_result`, `post_hoc_reflection`, `return_timing` — plus the evidence-record field names in §6.1. The repository convention is that a new domain term gets a `docs/GLOSSARY.md` row in the same change. **No such row was added.** |
| **Why it was deferred rather than taken** | These are **research-package vocabulary, not implemented domain terms**: no module owns them, no file defines them in code, and the glossary's own columns (owning module, defining file) would have to be filled with a research-document path. Adding a seventh file outside this sub-task's declared write set would also contend with concurrent siblings for no correctness gain. **The names become glossary-eligible when SUB-9 makes them enforceable and something in `src/` owns them.** |
| **Owner** | **SUB-9 (NEU-965)** — the sub-task that turns this vocabulary into an enforceable quality system and therefore into implemented domain terms — **the creator by default.** |
| **Revision trigger** | **Any of these ids appearing in `src/`**, or SUB-9 landing the gates that consume them, at which point each earns a glossary row with a real owning module. |

