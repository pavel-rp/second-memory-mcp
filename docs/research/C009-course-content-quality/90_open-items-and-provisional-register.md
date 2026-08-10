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

