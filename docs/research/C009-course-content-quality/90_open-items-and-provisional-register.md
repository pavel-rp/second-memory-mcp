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
