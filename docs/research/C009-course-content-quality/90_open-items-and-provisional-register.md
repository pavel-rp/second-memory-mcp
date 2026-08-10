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

### SUB-4 — NEU-960, correctness standards and authoring languages (OUT-2)

**Residual ownership and owner defaults, stated once.** SUB-4 is **OUT-2's residual owner**. Where an entry below names SUB-4 or the creator as owner, that is the residual clause or an authoring-pass **default**; where it names another party, the assignment is a **proposal addressed to that owner**, surfaced here precisely so it can be reassigned or refused. **SUB-4 takes no decision it does not own:** every obligation below that wants a field, a gate, a placement or an upstream correction is filed here instead of being absorbed locally.

**Cross-reference note.** `04_correctness-standards-and-authoring-languages.md` §1 references `OI-S4-1` … `OI-S4-7` by id and files none of them itself; they are minted here. `OI-S4-8` and `OI-S4-9` are filed here and referenced nowhere else.

#### `OI-S4-1` — the solution invariant is carried as a named slot inside the existing REQUIRED `reasoning` field, not as a field of its own · **provisional / proposed, never taken**

| | |
| --- | --- |
| **Item** | The solution standard (`04_…` §2.2) obliges a solution to state an invariant. That obligation is expressed as a **named `invariant` slot inside the existing REQUIRED `reasoning` field**, **not** as an `invariant` field on SUB-2's `solution` form. **SUB-4 adds no field to SUB-2's frozen ten-form catalogue and promotes no `OPTIONAL` field to `REQUIRED`** (`04_…` §1). Whether the invariant deserves a dedicated field is **proposed here and decided elsewhere.** |
| **Why it matters** | A standard that quietly mints a field produces artifacts validating against a catalogue nobody published, and a merge in which SUB-2's owner meets a field they never defined. A constrained payload inside a field SUB-2 already marked REQUIRED is checkable **today**, against the catalogue actually on `origin/develop`. The cost of the discipline is real and is named rather than hidden: a slot is weaker than a field — see `OI-S4-3`. |
| **Owner** | **SUB-2 (NEU-958)**, as the form catalogue's owner, and **SUB-9 (NEU-965)**, as the quality-system owner — **the creator by default.** A producing task may not promote its own artifact (`A1`–`A5`). |
| **Revision trigger** | **SUB-2's owner amends the `solution` form**, or **SUB-9 publishes a gate that must address the invariant separately from the rest of `reasoning`.** It does not close by SUB-4 deciding a field would be tidier. |

#### `OI-S4-2` — the conditional `complexity_claim` tension: the standard fails on a field the form marks `OPTIONAL` · **open, left standing deliberately**

| | |
| --- | --- |
| **Item** | `complexity_claim` is **`OPTIONAL`** on SUB-2's `solution` form (`02_…` §3.5) and **stays `OPTIONAL`**. The solution standard nonetheless **fails** a solution authored for a node whose skill type is `optimization` or `implementation` when it omits a complexity statement (`04_…` §2.2). **That is a standard-level obligation on an `OPTIONAL` form field — a real tension, and `04_…` §1 states it out loud rather than implying the form was amended.** |
| **Why it matters** | The tension has exactly three honest resolutions and SUB-4 owns none of them: a dedicated field, a **conditional** REQUIRED keyed to the node's recorded skill type, or a rejection of the obligation. Resolving it locally would mean SUB-4 amending a frozen catalogue by implication. Leaving it unrecorded would mean an author meeting a failure the form told them could not happen. |
| **Owner** | **SUB-2 (NEU-958)** and **SUB-9 (NEU-965)**, between them — **the creator by default.** |
| **Revision trigger** | **SUB-2's owner marks `complexity_claim` conditionally REQUIRED, or SUB-9 publishes a gate that either enforces or rejects the conditional obligation.** Until one of those, the standard fails on it and the form does not. |

#### `OI-S4-3` — a slot inside a REQUIRED field has no addressable identity a gate can name · **open / structural**

| | |
| --- | --- |
| **Item** | Three of SUB-4's obligations are **within-field payloads**: the `proof` form's three-slot `argument` payload (`optimal_substructure` / `overlapping_subproblems` / `recurrence_justification`), the `solution`'s `invariant` slot inside `reasoning`, and the `test`'s `kind:` label inside `misconception_or_edge_case`. **A slot is not separately addressable by a validator until SUB-9 defines how a slot is referenced** — `04_…` §6 describes the generic surface this would need (an optional **slot manifest** per field), and **describing it is not deciding to build it.** |
| **Why it matters** | It bounds every "detected mechanically" claim SUB-4 makes about a slot. The checks are stated as rules a reviewer can apply today; **they are not stated as gates, because the addressing scheme a gate would need does not exist at this cutoff.** A reader who reads slot-presence as machine-enforced would be reading more than was written. |
| **Owner** | **SUB-9 (NEU-965)** — which owns the gates, their mechanism vocabulary, and any slot-addressing scheme. |
| **Revision trigger** | **SUB-9 defines how a slot inside a field is referenced** (a slot manifest or an equivalent), or decides the three payloads should be fields — in which case `OI-S4-1` and `OI-S4-5` resolve with it. |

#### `OI-S4-4` — the explanation standard's depth obligation is `AI-judgment-only` and needs a compensating observable gate · **open / residual for SUB-9**

| | |
| --- | --- |
| **Item** | The explanation standard's correctness obligation — *a learner holding exactly the node named in `prerequisite_recall` can reconstruct the applicability decision in both directions from the explanation alone* — is detected by **judgment**, and `04_…` §2.1 and §3.1 flag it **`AI-judgment-only`**. The field floor beneath it (presence of `applies_when`, `does_not_apply_when`, `prerequisite_recall`, `claim_citations`; the restatement check) is mechanical; **the depth obligation itself is not, and no mechanical proxy is proposed for it.** |
| **Why it matters** | **`04_…` refuses to invent a metric to make the obligation look enforceable** — a word count is not depth, a readability score is not depth, and counting defined terms rewards padding. The honest consequence is that the explanation standard is **the weakest of the four, and weak in the place that matters most to a learner.** Naming that is more useful to SUB-9 than a fabricated metric would be. Nothing in `04_…` describes this standard as enforced, gated or blocking. |
| **Owner** | **SUB-9 (NEU-965)** — owner of the compensating observable gate. |
| **Revision trigger** | **SUB-9 publishes a compensating observable gate for the depth obligation, or records that none exists and the residue stands.** Either is a resolution; silence is not. |

#### `OI-S4-5` — the hatch-authored artifact's JavaScript-failure note payload is unspecified in its field and its citation shape · **open**

| | |
| --- | --- |
| **Item** | Every escape-hatch-authored artifact **carries a stated JavaScript-failure note citing the forcing `JS-E*` id(s)** (`04_…` §4.2, `DR-C09-04` Consequences). Two things about that note are **not** decided by SUB-4: **which field it lives in** — it is currently a payload inside the artifact's existing REQUIRED body-bearing fields, not a `forced_by_effects` field — and **exactly which `JS-E*` id(s) an artifact must cite** when NEU-941 recorded several effects on its node. |
| **Why it matters** | The note is what makes the hatch **legible instead of arbitrary**: it answers *which enumerated effect made the standard realization wrong or unreachable here*, in the audit's own vocabulary. Its detection is stated as a **presence-and-id-membership check** (`schema`) — the note is present and every id it cites is one of `JS-E1`…`JS-E9`. **A membership check over an unspecified payload location is weaker than it reads**, which is why this is filed rather than assumed settled. |
| **Owner** | **SUB-9 (NEU-965)** for the check's shape and placement; **SUB-2 (NEU-958)** if it becomes a field — **the creator by default.** |
| **Revision trigger** | **SUB-9 specifies the note's carrying field and citation obligation**, or SUB-2's owner adds a field for it. Not by an author choosing a convenient field per artifact. |

#### `OI-S4-6` — pressure to widen the escape hatch beyond NEU-941's enumerated 19 · **standing / filed, never absorbed**

| | |
| --- | --- |
| **Item** | An author will at some point believe a twentieth technique belongs in the escape hatch. **That belief is filed here as a new `OI-S4-k`-class entry addressed to NEU-941's owner, and the artifact is authored in TypeScript in the meantime** (`DR-C09-04` §3, `04_…` §4.3). This entry is the standing slot that pressure lands in. |
| **Why it matters** | **Membership is by node id at `rule_version: 1.0.0`, and only by node id.** *"This technique also carries `JS-E2`"* is an observation about an effect, **not an admission argument** — the 19 are the set NEU-941 adjudicated on evidence and recorded as a **severity**, not a set of symptoms anyone may re-derive. **The hatch cannot widen by precedent:** one artifact in C++17 creates no entitlement for a neighbouring technique, for the rest of its cluster, or for the technique it is most often taught beside. Absorbing the pressure locally is the one failure mode that **leaves no trace**, which is exactly why it is given a filing slot instead of a prohibition alone. |
| **Owner** | **NEU-941's owner** — the audit's, at its own `rule_version` — **the creator by default.** |
| **Revision trigger** | **NEU-941 publishes a new `rule_version`.** That is the only route. Not a downstream reading, not an effect resemblance, not this package's scope. |

#### `OI-S4-7` — inherited reliance on SUB-1's source rows, `restricted` **by default rather than by verification**, and on the interim field set · **provisional / inherited**

| | |
| --- | --- |
| **Item** | Every statement in SUB-4's output about what may be stored regarding an external problem rests on SUB-1's twelve source access-permission rows. Those rows are **`restricted` by the restricted-default rule — NEU-957 had no network access and issued zero HTTP requests** (`OI-S1-1`…`OI-S1-12`, `CAP-S1-1`). **They are not verified-restricted.** Riding on the same inheritance: the interim problem-reference field set is **`stable_id` + `canonical_url` only**, governed by the open ledger challenge **`CH-F5-1`** (`DR-C09-01`, `CAP-S1-2`), and the wider set is **NOT-YET-STORABLE**. |
| **Why it matters** | The failure direction is the safe one — the standards consume a set **at least** as narrow as it must be, so no statement here can make the package less safe. But **no sentence in SUB-4's output may be read as evidence that any source's terms were checked.** An inability to read terms is not evidence the terms permit anything, and equally not evidence that they forbid it. `04_…` §2.2 accordingly writes an unverifiable `problem_ref` value as the literal `REFUSED — not verifiable`, **never invented**. |
| **Owner** | **the creator** for the inherited reliance; **NEU-932 (`D-F5`'s owner)** for the field-set disposition — surfaced for reassignment. |
| **Revision trigger** | **A dated re-verification pass with network access**, closing `OI-S1-1`…`OI-S1-12`; and, separately, **the foundations ledger recording a disposition for `CH-F5-1`** (`OI-S1-13`). Neither closes by a standard in this package needing a wider set. |

#### `OI-S4-8` — the `JS-E2` blocking-subtotal discrepancy in the upstream audit register · **recorded, never corrected upstream**

| | |
| --- | --- |
| **Item** | In `../C005-dp-js-materiality/02_audit-register.md`, the **§3.1 heading and the §2 headline attribute `JS-E2` to 9 blocking nodes**, while **the §2 per-node table carries `JS-E2` on 10 blocking rows**. The rest of the arithmetic is **internally consistent**: the **19-node blocking total** holds, the **`JS-E1` subtotal (7)** holds, and the **`JS-E4` subtotal (2)** holds. This is a **summary-line discrepancy against the rows, not a verdict difference** — no node's `blocking` severity is in doubt, and no id enters or leaves the 19 either way. |
| **Why it is filed rather than fixed** | **SUB-4 writes no path under `docs/research/C005-*`** — the prohibition is absolute for this sub-task, and a correction is the owning task's to make by its own route. SUB-4 **consumes the 19 ids as binding rather than re-deriving them**, so nothing in this package's output depends on which subtotal is right. Filing it is the same discipline as `OI-S1-14`: an upstream arithmetic slip is **recorded where a downstream reader will meet it**, and repaired by the party entitled to repair it. |
| **Owner** | **NEU-941 / the creator** — the audit register's owner. |
| **Revision trigger** | **NEU-941 publishes a new `rule_version`**, or otherwise next touches the `JS-E2` subtotal. At that point the summary line is brought into agreement with the rows by the party entitled to edit them. |

#### `OI-S4-9` — residual numbering-collision risk in the `00`–`89` topic band and the `DR-C09-NN` decision-record band · **provisional / reconciliation-time**

| | |
| --- | --- |
| **Item** | SUB-4 claimed topic number **`04`**, decision record **`DR-C09-04`** and traceability register **`04_`**, all matching its own SUB number — the collision-free convention SUB-1 set (owns `01`, wrote `DR-C09-01`). All three were **re-confirmed free on `origin/develop` immediately before authoring**. **They cannot be confirmed free against a sibling's working tree**, because concurrent sub-tasks claim numbers at the same time and none can see another's tree. |
| **Why it matters** | A number collision is a **merge-visible, cheap** failure — two files, one number — and it is filed here so the reconciling owner meets it as a known item rather than as a surprise. It is not a reason for any sub-task to renumber another's document in flight; **that would be the expensive failure this register exists to prevent.** |
| **Owner** | **NEU-969 (SUB-12)** at reconciliation. |
| **Revision trigger** | **SUB-12's reconciliation pass**, or a merge in which two sub-tasks land the same topic or decision-record number. |

### SUB-3 — NEU-959, problem-level citation verification and access paths (OUT-3, OUT-1 probe run 2)

#### `OI-S3-1` — the access gate is shut for all twelve sources, so the seed set is empty · **open**

| | |
| --- | --- |
| **Open item** | `03_problem-citation-verification-and-access-paths.md` §4.1 records that **all twelve sources fail the access gate** at the 2026-08-10 cutoff: every one carries access disposition `Restricted` in `01_provenance-and-rights.md` §3, and the charter's Branch C rule states that a source SUB-1 recorded as restricted **is not fetched**. **Zero requests were issued to any of the twelve sources**, so the sanctioned hierarchy has no reachable leaf and the seed citation set has **zero entries**. |
| **Why it is an open item and not a defect** | The procedure, the selection criteria and the record shapes all ship and are re-executable. What is missing is a **rights precondition**, and it is one SUB-3 is expressly forbidden to re-decide (`01_provenance-and-rights.md` §3.1 clause 1). **No unverified id was admitted to preserve the appearance of coverage.** |
| **Owner** | **SUB-1 (NEU-957)** as residual owner of OUT-7, for the re-verification that would lift a restricted row — **the creator by default.** |
| **Revision trigger** | **A SUB-1-owned dated re-verification pass reads each source's own terms, robots directives and rate limits and re-dates its §3 access-permission row.** Nothing else lifts it; `01_provenance-and-rights.md` §11.2 names this as the only route. |

#### `OI-S3-2` — outbound network capability now exists; the named trigger on `CAP-S1-1` has fired · **provisional / newly observed**

| | |
| --- | --- |
| **Observation** | At 2026-08-10, an outbound HTTPS request from this execution environment to a **neutral, non-source endpoint** (`example.com`, chosen precisely because it is **none of the twelve sources**) succeeded. **Outbound network capability exists.** Evidence class 2 `[code-evidence]`; recorded at `traceability/03_access-path-and-verification-record.md` §1.1. |
| **What it establishes** | `CAP-S1-1`'s premise — *"no network access was available to this sub-task and none was permitted"* — **is no longer true of the environment.** Its named closure condition, and §11.2's revision trigger, both read *"network access becomes available to a re-verification pass."* **The capability half of that condition is now satisfied and dated.** |
| **What it does not establish** | **Nothing whatsoever about any of the twelve sources.** No source was contacted. It is not a robots reading, not a rate-limit reading, not a terms reading, and **not a permission**. Citing it as one would be the exact class-2-to-class-1 laundering `01_provenance-and-rights.md` §7.3 lists as a review-stopping defect. **Capability is not authority.** |
| **Owner** | **SUB-1 (NEU-957)** — the re-verification pass is OUT-7's, not SUB-3's — **the creator by default.** |
| **Revision trigger** | **SUB-1 schedules the re-verification pass this observation now makes actionable**, closing `OI-S1-1`…`OI-S1-12` and `CAP-S1-1`. |

#### `OI-S3-3` — twelve rows read `Restricted` by default, and SUB-3 treated them as binding anyway · **recorded judgment, open to challenge**

| | |
| --- | --- |
| **Open item** | SUB-1's twelve access rows are restricted **by the restricted-default rule**, not by an observed refusal (`OI-S2-7` records the same caveat for SUB-2). SUB-3 nonetheless treated every row as **binding**, issued no request, and produced no citation. The contrary reading — that a merely-default restriction may be probed once by a sub-task that could read the source's `robots.txt` first — was **considered and rejected on standing**, with the argument recorded in full at `03_…` §4.2. |
| **Why it is filed rather than settled** | It is the one judgment in SUB-3's output that could plausibly have gone the other way, and it is the judgment that produced an empty seed set. **A reader who disagrees should be able to find the argument and challenge it**, not reverse-engineer it from an absence. The three grounds are: SUB-3 may not form its own view of a disposition (§3.1 clause 1); only a rights re-verification promotes a row (§11.2); and the failure directions are asymmetric — over-caution costs a cap, a wrong permissive call costs a rights breach recorded in a package whose whole claim is that it does not commit one. |
| **Owner** | **NEU-969 (SUB-12)** at reconciliation, and any reviewer of this change — **the creator by default.** |
| **Revision trigger** | **`D-F5`'s owner or the creator rules on whether a restricted-by-default row is fetchable by a downstream sub-task**, or the re-verification pass makes the question moot. |

#### `OI-S3-4` — `OI-S2-4` and `OI-S2-8` are discharged as to SUB-3's probe run · **discharged, rows untouched**

| | |
| --- | --- |
| **Open item** | Two of SUB-2's entries name **SUB-3's probe run** as their revision trigger. Both triggers have now fired, and the result is recorded here **without editing either row** — they are SUB-2's, and this register is append-only. |
| **`OI-S2-4`** (unsourced provenance characterization) | **Did not recur.** Run 2's output (`dry-run/03_…` §4.3) contains **no appeal to an unnamed authority**; every claim is definitional or explicitly marked as a claim. **Not escalated to a template defect**, and no template is revised. One observation, not a trend — `claim_citations` stays REQUIRED for the reason `OI-S2-4` gives. |
| **`OI-S2-8`** (pass condition scoped to identifier-bearing fields) | **Discharged as required.** Run 2 **states its own pass condition and its scope explicitly** (`dry-run/03_…` §1, §2) rather than inheriting SUB-2's by reference, including the restatement that "10/10 PASS" does not mean ten blank refusals. |
| **Owner** | **SUB-2 (NEU-958)** for the rows themselves; **NEU-969 (SUB-12)** to reconcile the discharge into them at the end |
| **Revision trigger** | **SUB-12's reconciliation pass**, which may fold this discharge into the two rows it refers to. |

#### `OI-S3-5` — the retention discipline passed vacuously and remains untested under a live response · **open**

| | |
| --- | --- |
| **Open item** | `01_provenance-and-rights.md` §6 binds an enumerating API response on **retention, not request count**. SUB-3 confirmed the disposition was in force before the first request on path (1) — but **C4 failed the access gate, so `problemset.problems` was never called and no enumerating response was ever received.** The check therefore passes **vacuously**: there was nothing to retain. |
| **Why it is filed** | A vacuous pass reads identically to a demonstrated one in a summary table. **Nothing in SUB-3's output establishes that the retention discipline holds under a real enumerating response**, and a future pass must not cite `03_…` §8 as precedent that it does. |
| **Owner** | **SUB-3's successor** — whoever first executes path (1) against a live API — **the creator by default.** |
| **Revision trigger** | **The first sanctioned call that actually returns an enumerating response**, at which point the retention check is run for real and its result replaces this vacuous one. |

### SUB-5 — NEU-961, per-cluster non-root conceptual obligation (OUT-6)

**The headline, stated before the entries.** This sub-task was commissioned to specify the per-cluster non-root `conceptual` obligation and to **route** its map-side half. **It specified all four obligations and routed three of them. It achieved coverage for none of the three, and it did not close `F-943-2`.** The completion condition is *specified and routed*, exactly as charter assumption 9 states. **Every entry below describes pending coverage with a named owner; none of them may be read as coverage achieved.**

#### `OI-S5-1` — non-root `conceptual` coverage for CL-2, CL-3 and CL-4 is **routed and pending**, never achieved · **open**

| | |
| --- | --- |
| **Open item** | `05_per-cluster-conceptual-obligation.md` §5 records non-root `conceptual` coverage at **1/4 clusters** — **0/3** across CL-2, CL-3 and CL-4. The obligation for each of those three is stated in full (§4.2–§4.4) and its **entire** discharge is map-side: the clusters contain no node typed `conceptual`, so SUB-2's form set has no `node_id` to attach to. Filed as **`D-R6`** in `../C005-dp-map-schema/adjudication/01_schema-decision-ledger.md` §3.11, **by union** — a new appended subsection and row, no prior row replaced, **not self-promoted to `settled`** (`A4`). |
| **Why it is an open item and not a defect** | The specification ships complete and is actionable: four named acquisitions, an evidenced discharge split, the reason content cannot close three of them, and three enumerated routes with the barred fourth explained. What is missing is a **map-side decision** this package is forbidden to make — authoring, minting or reclassifying a map node is out of scope charter-wide. **No conceptual-flavoured content was authored against a `strategic` or `transfer` node to make the coverage row read better.** |
| **Owner** | **The map's owner — the creator, and whichever task next writes `nodes/*.yaml`** (the same routing `INC-C7` and the `INC-S2` residual already carry) — **the creator by default.** Which party ultimately satisfies a map-side conceptual obligation is a charter open question; this sub-task routes it and does not resolve it. |
| **Revision trigger** | **The map's owner adjudicates among `D-R6`'s three routes** — mint a per-cluster S8-residual node, amend the `D-S1` cascade, or decline the spread bar — **and records the disposition in the owning ledger.** **No content authored under C009 closes this**, which is the whole point of the split. |

#### `OI-S5-2` — the spread bar supersedes union-completeness, so OUT-2's check now returns a **false green** for `conceptual` · **open**

| | |
| --- | --- |
| **Open item** | OUT-2's criterion is union-completeness **over the graph** and explicitly **not** per-cluster (`../C005-dp-map-integrity/02_skill-type-union-completeness.md` §4). The charter's `F-943-2` closure raised the bar to per-cluster **non-root** spread. The two disagree in the most dangerous available way: **the union check returns PASS on today's graph while the live bar fails 3 of 4 clusters.** An audit running the criterion as written will be correct about what it ran and **silent about what now governs**. |
| **What a future coverage audit must do instead** | Count **non-root** instances only (a frozen `D-S2` root is a floor artifact, not evidence the mapping phase produced the type); count **per cluster**, not by union; and **report the owner named in `D-R6` rather than filing a fresh finding** — a duplicate finding against an already-routed obligation makes the routed one harder to see. |
| **Owner** | **The coverage / integrity audit's owner** (NEU-942's and NEU-943's remit) — **the creator by default.** |
| **Revision trigger** | **The next coverage or integrity audit is parameterised to the spread bar**, or OUT-2's criterion text is amended to state which bar it now expresses. Either resolves the disagreement; leaving both criteria live and unreconciled is what this entry exists to prevent. |

#### `OI-S5-3` — the 10 `INC-C1` techniques have no nodes, so their conceptual obligation cannot be enumerated at all · **open**

| | |
| --- | --- |
| **Open item** | CL-4's analysis is scoped to the cluster's **mapped** members. **The 10 `INC-C1` techniques have no nodes**, and a technique with no node has nowhere for a conceptual obligation to attach or to be checked. `F-939-A` (SOS DP) and `F-939-B` (bitset / word-parallel) are **left standing exactly as `../C005-dp-map-integrity/05_findings-register.md` records them** — both *"🔴 GENUINE GAP — confirmed"*. **No node was minted, no edge was faked, `D-F4a` was not re-decided.** |
| **Why it is filed separately rather than folded into CL-4's row** | Folding it in would **misreport an unmapped gap as a mapped one**. Even a fully discharged CL-4 map-side obligation leaves these ten untouched, and a CL-4 row that read "covered" would then be true of the mapped members and false of the cluster's real technique space. |
| **Owner** | **NEU-942 / the `INC-C1` CL-4 completion task** — the existing owner of the hole, cited here and **untouched here** — **the creator by default.** |
| **Revision trigger** | **The `INC-C1` techniques are mapped**, at which point their conceptual obligation becomes enumerable and this entry is superseded by an ordinary per-member analysis under `OI-S5-5`'s residual clause. |

#### `OI-S5-4` — CL-1's compliance rests on **one** node, and its two frozen roots do not count · **provisional / recorded fragility**

| | |
| --- | --- |
| **Open item** | CL-1 is the only cluster meeting the spread bar today, and it meets it on **exactly one** non-root node — `cl-1.judge-dp-applicability`. Its two `conceptual` roots are **frozen `D-S2` floor artifacts** and are **not** evidence under a non-root bar. This is `F-943-2`'s original point, restated rather than smoothed: **if that one node were retyped or removed, non-root `conceptual` would be instantiated nowhere in the graph.** |
| **Why it is filed rather than treated as a pass** | A 1/4 row and a 4/4 row look equally green in a cluster column. Recording the margin is the difference between a reader who knows CL-1 is one edit from zero and one who does not. **Counting the frozen roots to make CL-1 look doubly covered was considered and rejected** — the bar is non-root, and generosity here would conceal the margin. |
| **Owner** | **The map's owner** — **the creator by default.** |
| **Revision trigger** | **`cl-1.judge-dp-applicability` is retyped or removed** (which converts `D-R6`'s subject from a spread shortfall into a total absence), **or a second non-root `conceptual` node lands in CL-1**, which retires the fragility. |

#### `OI-S5-5` — the residual clause, standing and live · **open by design**

| | |
| --- | --- |
| **Open item** | > *"…and any cluster member whose conceptual obligation is not enumerated above."* **SUB-5 (NEU-961) owns this clause.** The four-cluster enumeration in `05_…` §4 is **the floor, not the boundary.** If a cluster member — an existing technique node, a member added by a later mapping pass, or an `INC-C1` technique once mapped — carries a conceptual obligation that §4 does not enumerate, that omission is **this sub-task's to record**, not one that disappears because 4/4 clusters are addressed. |
| **Why it is filed rather than read as discharged** | **Cluster-level completeness is not member-level completeness**, and conflating the two is the specific error the clause exists to prevent. At this cutoff the clause is **standing and exercised exactly once** — `OI-S5-3`'s `INC-C1` member set is a group whose conceptual obligation §4 cannot enumerate. Recording it live keeps a 4/4 cluster check from being read as a complete member check. |
| **Owner** | **SUB-5 (NEU-961)** as the clause's residual owner; **NEU-969 (SUB-12)** to reconcile it at the end — **the creator by default.** |
| **Revision trigger** | **Any cluster member surfaces with a conceptual obligation `05_…` §4 does not enumerate** — recorded as a new entry under this clause, never absorbed into an existing cluster row. |

### SUB-7 — NEU-964, difficulty calibration and its provisional inputs (OUT-4)

**The headline, stated before the entries.** The calibration standard ships. **Exactly one of its inputs was verified** — `prerequisite_depth`, re-derived 2026-08-10 by the untouched C005 integrity validator, **179/179 agree, 0 disagree**. **Six are provisional** on 179/179 unreviewed values. **The external cross-check is absent for every node**, not for some. And **which dimensions define calibration could not be settled on the evidence available**, so it is escalated below rather than assumed through.

#### `OI-S7-1` — the dimension set could not be settled; **escalated to the creator** · **open — this is OUT-4's named escalation exit**

| | |
| --- | --- |
| **Open item** | **Charter assumption 16 — *which* dimensions define calibration — is `[unconfirmed]` and is NOT settled by this sub-task.** OUT-4 requires it settled **or** escalated, never assumed through. It is **escalated.** `07_difficulty-calibration.md` §3 adopts assumption 16's default as the **working** set, **loudly and visibly**, and labels every calibrated output provisional on this choice (`PR-7`). **The default is not adopted silently as though it had been settled.** |
| **Why it could not be settled** | The evidence that would discriminate between candidate sets is of exactly two kinds, and **neither exists at this cutoff**: (a) the **creator's plausibility review** of the map's provisional values — **deferred on 179/179**; and (b) **a non-empty seed set of externally-rated cited problems** permitting the §5.4 ordering comparison — **zero, `CAP-S3-1`**. A set chosen now would be chosen on the authoring pass's taste, and shipping that as settled is the exact laundering OUT-4 exists to prevent. |
| **Candidate dimension sets considered** | **(1)** Assumption 16's default — `prerequisite_depth` + the five load dimensions + `progression_stage`, `entry_gate` excluded (**the working set**). **(2)** A **depth-only** set — `prerequisite_depth` alone, on the ground that it is the sole re-derivable input; rejected as a *settled* answer because it discards every stated-load signal on a provenance argument rather than an evidential one. **(3)** The default **plus a `javascript_materiality`-derived implementation term**, which would make `JS-U1`/`JS-U2`/`JS-U3`/`JS-U5` live reliances. **(4)** A **reduced subset** of D2–D6 retaining only dimensions the creator reviews first. **(5)** A **weighted** set with weights fitted to an external anchor — **not evaluable at all** while the anchor is absent. |
| **The evidence that would discriminate between them** | **The creator's plausibility review of the 179 deferred values** (which of D2–D6 the creator affirms, and whether `progression_stage` survives as an independent band or collapses into depth); **and** a **non-empty externally-rated seed set** large enough to compare orderings under each candidate set against an independent signal (`07_…` §5.4). Candidate **(5)** additionally requires the anchor to exist at all. |
| **Owner** | **the creator** — **the only qualified reviewer of the map's provisional values.** This is not a default assignment of convenience: `02_authoring-requirements.md` §4.3 names the creator as owner of the deferred review, and every candidate set turns on it. |
| **Revision trigger** | **The creator reviews the deferred progression and load values and states which dimensions define calibration** — or NEU-888 supplies the discriminating evidence for the stage granularity and an externally-rated seed set becomes available, permitting the comparison to decide it empirically. **This entry does not close by a downstream sub-task finding the working set convenient.** |
| **Note on the exit taken** | **Exactly one of {settled decision record, this escalation entry} exists — this one.** No dimension-set decision record was written to `decision-records/`. `traceability/07_…` §5.3 records the choice explicitly. |

#### `OI-S7-2` — the calibration rests on 179/179 `deferred-provisional` values · **provisional / the standing reliance**

| | |
| --- | --- |
| **Open item** | Six of the standard's seven input fields — `state_formulation_load`, `transition_derivation_load`, `proof_obligation_load`, `implementation_load`, `recognition_load` and `progression_stage` — carry `creator_review: "deferred-provisional"` on **all 179** non-root nodes. They are **usable and not binding**. Every point of use is enumerated as `PR-1`…`PR-6` in `07_…` §7 and audited against `../C005-dp-map-package/03_…` §9 in `traceability/07_…` §2. |
| **Why it is filed rather than absorbed** | §4.3's own words: *"A curriculum charter calibrating against these values MUST surface that reliance."* Surfacing it once in prose would satisfy the letter; **surfacing it at every point of use** is what the constraint actually asks, and it is why the standard carries a per-use table rather than a caveat paragraph. |
| **What is refused** | **Re-classing any of the six upward.** Agreement with an external rating would **not** promote a provisional dimension (`07_…` §5.4 step 4) — corroboration is not review. |
| **Owner** | **the creator** |
| **Revision trigger** | **The creator reviews the progression and load assignments for plausibility** (C005 charter assumption #11). Nothing else closes it — not a cross-check, not a downstream consumer's confidence, and not the passage of time. |

#### `OI-S7-3` — `provisional_load_index` weights the five dimensions equally **by declaration, not by measurement** · **provisional**

| | |
| --- | --- |
| **Open item** | `PLI` is the **equal-weight sum** of the five load dimensions. **Equal weighting is declared because no evidence discriminates a weighting** — **not** because the five were found to contribute equally. No pass has ever measured their relative contribution. |
| **Why it is filed** | An equal-weight sum reads, to a downstream consumer, exactly like a considered choice. It is not one; it is the absence of a choice, made explicit. Left unfiled it would harden into a finding by repetition. |
| **What the standard does about it** | It **refuses to collapse the triple into a scalar** (`07_…` §5.2), because a scalar would bake this non-choice into a sortable number. A reader wanting a scalar must resolve `OI-S7-1` first. **That friction is intended.** |
| **Owner** | **the creator** — the same review that settles `OI-S7-1` |
| **Revision trigger** | **`OI-S7-1` resolves**, supplying either a reviewed dimension set with weights or the evidence to fit them. |

#### `OI-S7-4` — the calibrated value is a triple, and downstream consumers will want a scalar · **open by design**

| | |
| --- | --- |
| **Open item** | `calibrated_difficulty` is the labelled triple `(structural_tier, provisional_load_index, stage_band)`, lexicographically ordered, and **nodes with equal triples are declared incomparable rather than tie-broken.** A tie-break would need either `entry_gate` (**forbidden**, `F-943-3`) or a weight (**unsettled**, `OI-S7-1`). |
| **Why it is filed** | **SUB-9 (NEU-965)** merges this standard into one enforceable quality system, and a gate that must sort will meet the incomparability. It should meet it as a **recorded design decision with a named resolution route**, not as a surprise. |
| **Owner** | **SUB-9 (NEU-965)** for the consuming half; **the creator** for the resolution — surfaced for reassignment |
| **Revision trigger** | **`OI-S7-1` resolves** and a weighting becomes available; or SUB-9 specifies a gate whose semantics tolerate incomparability. |

#### `OI-S7-5` — the ordering is a structural-load claim and **not** a learning order · **provisional, non-downgradable (inherited)**

| | |
| --- | --- |
| **Open item** | `R1` / `X-D3` is carried **undiminished** and **non-downgradable**: *nothing in C005 measures DP learning*, and no selected corpus is ordered by learning dependency. The calibrated ordering is therefore a claim about **structural and stated load only**. Recorded as `PR-8`. |
| **Why it is filed here rather than left upstream** | This is the sub-task that produces an artifact a curriculum would sort learners by. **The misreading has a natural home here and nowhere else**, so the disclaimer belongs at the point of production, not only in the register that first recorded it. |
| **Owner** | **NEU-887 / the creator** |
| **Revision trigger** | **Nothing in C005 or C009 can close it.** It closes only if DP learning is actually measured. |

#### `OI-S7-6` — node-level coverage is `unaudited` on all 179, so no calibrated value carries a coverage claim · **open (inherited `INC-C7`)**

| | |
| --- | --- |
| **Open item** | `coverage.status` reads `unaudited` on all 179 nodes (`INC-C7`). Any node-level coverage claim attached to a calibrated value therefore rests on an unaudited field. Recorded as `PR-9`; **the standard attaches none.** |
| **Owner** | **NEU-942's route / a later pass** |
| **Revision trigger** | **A node-level coverage write-back is commissioned.** |

#### `OI-S7-7` — the node set a calibration ranges over is known-incomplete · **open (inherited `INC-C1`)**

| | |
| --- | --- |
| **Open item** | The **10-instance `INC-C1` CL-4 gap class has no nodes**, so a calibration over the map ranges over a **known-incomplete** node set. SUB-3's disqualifier `X3` names the same seam from the sourcing side. Recorded as `PR-10`. **Stated so a completeness claim is never read into a calibrated ordering.** |
| **Owner** | **the creator** — commission the CL-4 completion task, scoped by the cascade |
| **Revision trigger** | **The completion task lands**, or a further CL-4-by-cascade technique surfaces. |

#### `OI-S7-8` — no per-node calibrated value is published · **deliberate, recorded so it is not read as an omission**

| | |
| --- | --- |
| **Open item** | The standard publishes **no per-node difficulty table**. Publishing 179 provisional triples with **no external cross-check** would circulate them as results, and a table is exactly the artifact that outlives its labels once it is copied into a second document. |
| **What ships instead** | The **rule**, its **input classification**, its **labels**, and the **branch behaviour** — everything needed to compute a calibrated value and to know precisely how far to trust it. |
| **Owner** | **SUB-9 (NEU-965)** — the first consumer that may need instantiated values — **or the creator by default** |
| **Revision trigger** | **`OI-S7-1` resolves and the anchor becomes available** (`CAP-S7-1` closes), at which point instantiated values can be published with a cross-check rather than with a caveat. |

