# Provenance, Rights, Attribution, and the Permitted Problem-Reference Field Set

**Task:** NEU-957 (SUB-1) · **Charter:** C009 (umbrella NEU-890) · **Covers:** OUT-7 · **Compiled:** 2026-08-10 · **Verification cutoff:** 2026-08-10 · **Prior cutoff:** 2026-07-16 · **Status:** deferred — set only in `adjudication/` (this package) and `../C005-dp-map-foundations/adjudication/01_selection-decision-ledger.md` (inherited C005 decisions)
**Model:** claude-opus-5[1m]

`D-F5` §5 requires a fresh dated re-verification from any charter that intends to **use** problems rather than merely be informed by them. C009 is that charter, and this is that pass. It re-verifies all twelve source dispositions at the 2026-08-10 cutoff, records the per-source **access-permission** precondition that did not exist at the prior cutoff, fixes exactly **what a problem reference may store**, states the **no-text** and **enumerating-response retention** rules as enforceable prohibitions with named detection methods, records per-source **attribution**, sets the **generated-content policy** for our own artifacts, extends the `RC-*` rights checks, and records the repository scan that proves the package practises what it states.

**Read `00_method-and-provenance.md` first.** It states, in the open, that no network re-fetch was available or permitted, that this pass is therefore a **documentary re-verification**, and that fabricating a live fetch result is an absolute prohibition. Every table below is written to make that limitation unmistakable rather than to paper over it.

---

## 1. The dated re-verification (2026-08-10)

The baseline is `../C005-dp-map-foundations/05_provenance-and-rights.md` §1, verified 2026-07-16. **This file never edits that one.** The baseline disposition is carried in its own column and stays visible in every row, so a reader can see what was inherited and what this pass concluded, side by side.

**What "what was checked" means in this table.** It means the documentary act actually performed on 2026-08-10 — a re-read of a recorded disposition and its recorded evidence in this repository. **It never means a fetch.** Not one of the twelve sources was contacted; zero HTTP requests were issued. Every cell says so.

**How "no change" is recorded.** Where this pass found no difference from the baseline, the row states *no change since 2026-07-16* **explicitly**, in its own column. An empty or absent change cell is not a permitted way to say "unchanged": a silent cell is indistinguishable from a row nobody re-read, and the whole value of a re-verification is the ability to tell those two apart.

| Source | Baseline disposition (2026-07-16) | Verification date | What was checked (**documentary — no fetch performed**) | Evidence class | Disposition at 2026-08-10 | Change since 2026-07-16 |
| --- | --- | --- | --- | --- | --- | --- |
| **T1** CP-Algorithms (`cp-algorithms.com`) | **CC BY-SA 4.0** — reusable with attribution + share-alike; verified by fetch 2026-07-16 | 2026-08-10 | **Documentary re-read only** of the recorded licence finding (`../C005-dp-map-foundations/01_taxonomy-selection.md` F-T-1 and `05_…` §1 row T1). The licence page was **not** re-fetched on 2026-08-10 and the licence text was not re-read at source. | 1 `[literature]` | **Reusable with attribution + share-alike (CC BY-SA 4.0)** — carried forward unchanged. Share-alike is viral over any derivative, so C009 reproduces none of it either, exactly as C005 did not. | **No change since 2026-07-16.** |
| **T2** Competitive Programmer's Handbook (Laaksonen) | **CC BY-NC-SA** — INFORM-ONLY; licence *asserted from the work's stated terms, not machine-verified* | 2026-08-10 | **Documentary re-read only** of the recorded assertion and of `05_…` §5's standing note that this licence was never machine-verified. **It remains unverified at this cutoff too** — the second consecutive cutoff at which it is asserted rather than observed. | 1 `[literature]` | **INFORM-ONLY.** The **NC** clause is disqualifying for a project with any commercial path; share-alike would additionally be viral over derived content. Not relied on as reusable. | **No change since 2026-07-16.** The known weakness is carried forward undiminished, not downgraded by age. |
| **T3** USACO Guide (`usaco.guide`) | **All rights reserved — explicit reproduction bar**; INFORM-ONLY; verified by fetch 2026-07-16 | 2026-08-10 | **Documentary re-read only** of the recorded verbatim licensing term (`05_…` §1 row T3; `01_taxonomy-selection.md` F-T-2): *"No part of this website may be reproduced or commercialized in any manner without prior written permission."* The site was **not** re-fetched. | 1 `[literature]` | **INFORM-ONLY.** The reproduction bar is explicit, was verified once, and binds C009 more tightly than it bound C005, because C009 intends to cite problems rather than only be informed by a taxonomy. | **No change since 2026-07-16.** |
| **T4** Codeforces community DP catalogues | User-authored under site terms; INFORM-ONLY; entry-level fetch returned HTTP 403 (`CAP-2`) | 2026-08-10 | **Documentary re-read only** of the recorded site-terms disposition and of `CAP-2` (`01_taxonomy-selection.md` F-T-5: automated fetch returned HTTP 403 on 2026-07-16). No fetch was attempted on 2026-08-10, so **no new information about the 403 exists**. | 1 `[literature]` | **INFORM-ONLY.** Content is user-authored under site terms; the site terms govern, and the specific catalogue entry ids remain unverified. | **No change since 2026-07-16.** `CAP-2` is unresolved and stays unresolved by this pass; closing it is SUB-3's work, not SUB-1's. |
| **T5** CN/JP olympiad technique traditions | Mixed / frequently unclear; **INFORM-ONLY — most restrictive treatment** | 2026-08-10 | **Documentary re-read only** of the recorded most-restrictive treatment. Provenance is per-writeup and was **not verifiable per source** at the prior cutoff; it is **not verifiable at this one either**, and no attempt was made. | 1 `[literature]` | **INFORM-ONLY — most restrictive treatment.** Where provenance is unclear the unclear case is treated as restricted, never as permissive. | **No change since 2026-07-16.** |
| **T6** Primary literature (SMAWK, Knuth–Yao, Monge/total monotonicity, Lagrangian relaxation) | Per-paper, mostly all-rights-reserved; **Cite-only** | 2026-08-10 | **Documentary re-read only** of the recorded per-paper disposition. No publisher terms page was fetched; no individual paper's licence was re-checked on 2026-08-10. | 1 `[literature]` | **Cite-only.** Facts and applicability conditions may be stated in this project's own words with attribution; **no text, figure, table, or proof is reproduced** — a constraint that binds C009's own proofs and lessons directly (§8). | **No change since 2026-07-16.** |
| **C1** CSES Problem Set (`cses.fi/problemset`) | Author-owned statements; **INFORM-ONLY**; section verified by fetch 2026-07-16 | 2026-08-10 | **Documentary re-read only** of the recorded disposition and of finding `F-C-1` (section counts as read on 2026-07-16). The set was **not** re-fetched; the recorded counts are **not re-confirmed** at this cutoff and are not restated here as current. | 1 `[literature]` | **INFORM-ONLY.** Problem statements are the authors'; structure may inform, text is never copied, **and the problem list itself is never recorded** (§2). | **No change since 2026-07-16.** |
| **C2** AtCoder Educational DP Contest (EDPC) | AtCoder terms; **INFORM-ONLY** | 2026-08-10 | **Documentary re-read only** of the recorded site-terms disposition. AtCoder's terms were **not** retrieved on 2026-08-10. | 1 `[literature]` | **INFORM-ONLY.** The corpus's *ordering* is itself the author's curation and is never imported as this project's ordering (`05_…` §2; `02_corpus-selection.md` F-C-5). | **No change since 2026-07-16.** |
| **C3** AtCoder Typical DP Contest (TDPC) | AtCoder terms; **INFORM-ONLY** | 2026-08-10 | **Documentary re-read only** of the recorded site-terms disposition. AtCoder's terms were **not** retrieved on 2026-08-10. | 1 `[literature]` | **INFORM-ONLY.** Same disposition and same curation constraint as C2. | **No change since 2026-07-16.** |
| **C4** Codeforces problemset | Site/user terms; **INFORM-ONLY** | 2026-08-10 | **Documentary re-read only** of the recorded site-terms disposition, plus the recorded charter fact (assumption 24, **confirmed** from an intake decision, not from a fetch) that C4 is the one selected source with a documented public API on record. **No API call was made and no terms-of-use document was read.** | 1 `[literature]` | **INFORM-ONLY.** Having an API changes the **access method**, never the rights disposition (§7). C4 remains inform-only, and its enumerating endpoint carries the additional retention bound of §6. | **No change since 2026-07-16.** |
| **C5** ICPC / IOI / JOI / POI / CEOI archives | Per-contest, often unclear; **INFORM-ONLY — most restrictive treatment** | 2026-08-10 | **Documentary re-read only** of the recorded most-restrictive treatment. Terms are per-contest and were **not verifiable per source** at either cutoff; no archive was fetched. | 1 `[literature]` | **INFORM-ONLY — most restrictive treatment.** Each contest archive carries its own terms; absent a per-contest reading, the most restrictive assumption governs the whole class. | **No change since 2026-07-16.** |
| **C6** Library Checker (`judge.yosupo.jp`) | Permissive/open; **Cite-only** by C005's own choice | 2026-08-10 | **Documentary re-read only** of the recorded repo-terms disposition. The repository's licence file was **not** re-read on 2026-08-10, so "permissive/open" is carried as a recorded prior reading, not as an observation at this cutoff. | 1 `[literature]` | **Cite-only**, retained as this package's own choice. A permissive licence does not create a reason to copy: nothing in C009 needs Library Checker's text, and cite-only costs nothing. | **No change since 2026-07-16.** |

### 1.1 Result of the pass

**Twelve of twelve dispositions are unchanged.** The baseline shape is preserved exactly: **11 of 12 sources are inform-only or cite-only** (9 inform-only, 2 cite-only), and **exactly one — T1 — is freely reusable under CC BY-SA 4.0 with attribution and share-alike**, from which this package still reproduces nothing.

**Zero dispositions differ from the baseline at this cutoff**, so the flagging procedure below was not exercised. It is stated anyway, because a procedure invented at the moment it is first needed is a procedure that will be bent:

> **If a re-verification finds a disposition that differs from the baseline, the baseline value is left visible in its own column and the new reading is recorded beside it as a flagged difference with a named owner and an entry in `90_open-items-and-provisional-register.md` carrying a revision trigger. The baseline is never overwritten, and `../C005-dp-map-foundations/05_provenance-and-rights.md` is never edited.** A difference that would *loosen* a disposition additionally requires a ledger challenge against `D-F5` before it may be relied on; a difference that *tightens* one takes effect immediately, because the restrictive direction is always the safe one to act on first.

### 1.2 One observation about the baseline, recorded rather than corrected

The baseline's per-source rows resolve to **9 inform-only + 2 cite-only + 1 reusable = 12**, and its own §1 summary line — *"11 of 12 sources are inform-only or cite-only"* — agrees with that. Its `RC-2` result cell and the `D-F5` ledger row both summarise the same set as *"10 inform-only, 2 cite-only, 1 reusable"*, which totals **13 against a 12-source set**.

This is a **summary-line arithmetic discrepancy in the baseline, not a disposition difference**: every per-source row is unchanged and every operative statement — 11 of 12 inform-only or cite-only, exactly one freely reusable — is consistent across both documents. It is therefore **recorded, not corrected**: this package never edits `05_provenance-and-rights.md` or a ledger row in place. Filed as an open item with the creator as default owner and a revision trigger of *"the next `D-F5` re-verification or ledger touch"* — see `90_open-items-and-provisional-register.md`. Evidence class 2 `[code-evidence]`; provenance `../C005-dp-map-foundations/05_provenance-and-rights.md:26,63` and `../C005-dp-map-foundations/adjudication/01_selection-decision-ledger.md:26`, commit base `c558ff9`.

### 1.3 The restricted-by-default rule, applied

Per `00_method-and-provenance.md` §4.4: **where a source's terms, robots directives, or stated rate limits could not be established at the 2026-08-10 cutoff, the source is recorded restricted — never permissive by omission.** At this cutoff that is **every one of the twelve sources**, because no network read was available for any of them. §3 records that reading per source, and every such gap is filed in `90_open-items-and-provisional-register.md` with a named owner and a revision trigger.

**No row in this section asserts a fetch that did not happen, and no row reads permissive because a prohibition could not be found.** An unread licence is not a permissive licence.

---

## 2. The selection-and-curation bright line — a rule about **reproduction and retention**, not only about text

The operative rule is inherited verbatim in substance from `../C005-dp-map-foundations/05_provenance-and-rights.md` §2, and C009 restates it because C009 is the first charter that will actually reach a source:

> **The map may record *that* CSES has a DP section with 25 problems (a fact about the source). It may not record *what those 25 problems are* (the source's expression and curation). Facts about a source are ours to state; a source's selection and arrangement are not.**

**C009's restatement, and the widening that matters:** the bright line governs the rights of **reproduction *and* retention**, and it governs them **independently of whether any statement text is involved**. Three consequences follow, and each closes a hole that a text-only reading would leave open:

1. **A list of problem identifiers is not "just identifiers".** A source's problem *list* is its selection; a source's *ordering* of that list is its arrangement. Both are protected as curation even when every individual element is a bare id or a URL that this project is otherwise free to record. **The project may record that a source has N problems; it may not record which N.**
2. **Retention is the operative verb, not copying.** Reading a curated list in order to resolve one already-chosen item is a use of a fact. **Keeping** that list — in a file, a cache, a fixture, a test snapshot, a commit, a scratch note, or an agent's persisted context — is retention of the curation, and it is forbidden by this section whether or not anything was "copied" in the ordinary sense.
3. **The no-text rule does not subsume this rule, and neither subsumes the other.** §5 forbids statement text. §2 forbids a retained list or arrangement. A list of ids, titles and ratings passes §5 cleanly and fails §2 completely. Both are checked, separately, by the scan in §10.

**What this permits, unchanged from the baseline:** learning that a technique exists and what practitioners call it; learning that a technique is exercised by real problems and roughly at what difficulty; learning that one technique presupposes another; recording, in this project's own words, a fact about a source; and citing a source by URL and title with attribution.

**What this forbids, unchanged from the baseline and made explicit for a citing charter:** copying or paraphrasing-to-evade a problem statement; copying prose, tables, figures, proofs, or code from a taxonomy or editorial; reproducing a source's problem list or section contents as an artifact — *even reworded, even reordered, even reduced to bare ids*; mirroring, scraping, or vendoring any corpus into the repository; and treating a source's ordering as this project's ordering.

---

## 3. The per-source access-permission record — a **precondition**, dated 2026-08-10

**What this section is.** A dated rights record, at the same 2026-08-10 cutoff as §1, covering the **rights half** of the sanctioned corpus-access hierarchy (charter assumptions 23 and 24, both **confirmed**). It records, per source, whether a documented public API is on record, what the source's robots directives and stated rate limits say about **a single targeted fetch of one problem by its id**, and the standing per-source prohibition on bulk methods.

**What this section is *not*.** It is **not a finding written up after a citation request**, and it is not a report of any access this sub-task performed. **This sub-task issued zero requests.** The record is a **precondition dated at or before the cutoff SUB-3 (NEU-959) works against**, which is the whole point of writing it in SUB-1 rather than in SUB-3: a rights precondition that is only produced once the first request has already gone out is not a precondition at all.

| Source | Documented public API (2026-08-10) | Robots directives & stated rate limits for **a single targeted fetch of one problem by its id** | Bulk enumeration / crawling / corpus walks | Access disposition |
| --- | --- | --- | --- | --- |
| **T1** CP-Algorithms | no documented API on record | **Unestablished at cutoff ⇒ restricted.** No `robots.txt` was read and no stated rate limit was observed on 2026-08-10; no network read was available. | **PROHIBITED** — under every disposition, including T1's permissive CC BY-SA licence. A reusable licence is not a crawl permission. | **Restricted.** |
| **T2** Competitive Programmer's Handbook | no documented API on record | **Unestablished at cutoff ⇒ restricted.** A distributed document rather than a queryable site; no directive or rate limit was read on 2026-08-10. | **PROHIBITED** — under every disposition. | **Restricted.** |
| **T3** USACO Guide | no documented API on record | **Unestablished at cutoff ⇒ restricted.** No `robots.txt` was read on 2026-08-10. The recorded reproduction bar governs content independently of any access directive. | **PROHIBITED** — under every disposition; the recorded reproduction bar makes a corpus walk doubly impermissible. | **Restricted.** |
| **T4** Codeforces catalogues | no documented API on record — the community catalogues are site pages, not an API surface | **Unestablished at cutoff ⇒ restricted.** No `robots.txt` was read on 2026-08-10, and the one recorded automated-access datapoint is `CAP-2`'s HTTP 403 from 2026-07-16, which is evidence of refusal, never of permission. | **PROHIBITED** — under every disposition. **This is the exact activity that produced `CAP-2`'s 403.** | **Restricted.** |
| **T5** CN/JP olympiad traditions | no documented API on record | **Unestablished at cutoff ⇒ restricted.** A heterogeneous set of community writeups with no single terms surface; nothing was read on 2026-08-10. | **PROHIBITED** — under every disposition, and per host within the class. | **Restricted.** |
| **T6** Primary literature | no documented API on record | **Unestablished at cutoff ⇒ restricted.** Per-publisher terms; no publisher's directives or rate limits were read on 2026-08-10. | **PROHIBITED** — under every disposition; bulk retrieval of publisher-hosted material is additionally a per-publisher terms violation in the general case. | **Restricted.** |
| **C1** CSES | no documented API on record (charter assumption 24) | **Unestablished at cutoff ⇒ restricted.** No `robots.txt` and no stated rate limit were read on 2026-08-10. | **PROHIBITED** — under every disposition. | **Restricted.** |
| **C2** AtCoder EDPC | no documented API on record (charter assumption 24) | **Unestablished at cutoff ⇒ restricted.** No `robots.txt` and no stated rate limit were read on 2026-08-10. | **PROHIBITED** — under every disposition. | **Restricted.** |
| **C3** AtCoder TDPC | no documented API on record (charter assumption 24) | **Unestablished at cutoff ⇒ restricted.** No `robots.txt` and no stated rate limit were read on 2026-08-10. | **PROHIBITED** — under every disposition. | **Restricted.** |
| **C4** Codeforces problemset | **On record — `api.codeforces.com`** (charter assumption 24, confirmed from an intake decision, **not** from a call made here). The only selected source with a documented public API on record. Its enumerating endpoint `problemset.problems` carries the additional retention bound of §6. | **Unestablished at cutoff ⇒ restricted.** The API's own stated rate limits and the site's `robots.txt` were **not** read on 2026-08-10. **An API's existence is not a rate-limit reading and is not a permission**; the restricted default applies to C4 exactly as to the other eleven. | **PROHIBITED** — under every disposition. Note precisely: **calling an enumerating endpoint once is not a bulk walk, but retaining or mining what it returns is the same harm** (§6). | **Restricted.** |
| **C5** ICPC / IOI / JOI / POI / CEOI archives | no documented API on record (charter assumption 24) | **Unestablished at cutoff ⇒ restricted.** Per-contest hosts with per-contest terms; none was read on 2026-08-10, and a reading of one host would not transfer to another. | **PROHIBITED** — under every disposition and separately per archive host. | **Restricted.** |
| **C6** Library Checker | no documented API on record (charter assumption 24) | **Unestablished at cutoff ⇒ restricted.** No `robots.txt` and no stated rate limit were read on 2026-08-10, notwithstanding the recorded permissive licence. | **PROHIBITED** — under every disposition. A permissive content licence is not a crawl permission. | **Restricted.** |

### 3.1 How SUB-3 consumes this record

1. **SUB-3 consumes this record and never re-decides it.** It is a rights fact dated 2026-08-10, not an execution result. SUB-3 reads it before it resolves anything, records which access path each source was finally resolved through, and files a challenge if it believes a row is wrong — it does not overwrite a row, and it does not form its own view of a source's disposition.
2. **No access outcome SUB-3 later records can promote a restricted source to permissive.** A `200 OK` proves a server answered a request; it proves nothing about a licence, a terms document, or a robots directive. Neither a successful fetch, nor an absent `robots.txt`, nor an unenforced rate limit, nor a permissive-looking API response is admissible as evidence that a use is permitted. **The only thing that promotes a restricted row is a dated reading of the source's own terms, recorded as a new re-verification pass with its own cutoff.**
3. **Every "unestablished at cutoff" cell above is an open item, not a shrug.** Each is filed in `90_open-items-and-provisional-register.md` with a named owner (default: **the creator**, consistent with `CAP-2`'s owner precedent) and a revision trigger of *"network access becomes available to a re-verification pass, or a source's terms are read and dated."*
4. **A source that blocks its whole hierarchy becomes a recorded cap with a named owner** — never a reason to widen the method. Bulk enumeration is not a fallback when the sanctioned paths fail; it is prohibited under every branch, including that one.

---

## 4. The permitted-field decision — what a problem reference may store

**The tension, stated exactly.** The reference-only product decision (charter assumption 1, confirmed) says the system stores a problem's id, canonical URL, title, constraints, difficulty signal and curriculum placement, and never the statement text. `D-F3a` reads *"no field may hold verbatim external content; problem references are URLs and identifiers only"* (`../C005-dp-map-foundations/adjudication/01_selection-decision-ledger.md:27`). Those two statements do not both hold for four of the six fields.

**`D-F3a` is the bar to argue against, not around.** A proposal to store anything beyond ids and canonical URLs **files a ledger challenge and never proceeds on local judgment** (`D-F5` §5). That is what this section does.

| # | Field | What it is | Rights rationale | Decision at 2026-08-10 | Route |
| --- | --- | --- | --- | --- | --- |
| 1 | **`stable id`** | The source's own opaque handle for the problem. | An identifier, not expression. It carries no authored content, is not curated arrangement (one id is not a list), and is exactly what `D-F3a` names as permitted. Recording it is a fact about a source, permitted by §2. | **ADMITTED** on the recorded `D-F3a` rationale. | **No ledger challenge required** — the field is *inside* the bar, and the challenge path is reserved for fields that exceed it. |
| 2 | **`canonical URL`** | The source's own address for the problem. | A locator, not expression. `D-F3a` names URLs explicitly; `05_…` §2 permits citing a source by URL and title with attribution. A single URL is a reference, not a reproduction of a list. | **ADMITTED** on the recorded `D-F3a` rationale. | **No ledger challenge required** — inside the bar. |
| 3 | **`title`** | The problem's name as the source gives it. | **Contested.** Charter assumption 19 holds it is *provisionally* a fact about a source rather than its expression; `D-F3a` says "URLs and identifiers only", and a title is neither. A title is also short authored text, and a set of titles is a legible reproduction of a curated list — which §2 forbids independently of the no-text rule. | **NOT ADMITTED on this package's judgment.** | **Routed to ledger challenge `CH-F5-1`** against `D-F5`, filed by append in `../C005-dp-map-foundations/adjudication/01_selection-decision-ledger.md`. |
| 4 | **numeric `constraints`** | The problem's bounds — e.g. its stated limits on input size, value range, time and memory. | **Contested.** Numeric bounds read most like facts of any field here, and assumption 19 leans that way. But they are *selected and expressed* by the problem author as part of the statement, they are the field most likely to be transcribed verbatim in practice, and the boundary between "the bound" and "the sentence stating the bound" is exactly where paraphrase-to-evade happens. | **NOT ADMITTED on this package's judgment.** | **Routed to `CH-F5-1`.** |
| 5 | **`difficulty signal`** | The source's own difficulty marker — for C4, its numeric rating; elsewhere, a tier. | **Contested.** A rating is a fact the source computed, not text it authored — but it is also the source's most valuable derived data, and a stored table of ratings across many problems is a reproduction of the source's evaluative curation, which §2 reaches. `02_corpus-selection.md` F-C-3 additionally warns it is a contest-performance proxy, never a learning-difficulty measurement. | **NOT ADMITTED on this package's judgment.** | **Routed to `CH-F5-1`.** While the challenge is open, an external rating is read from a **dated verification observation** and never from a stored field, and every dependent calibrated output carries that observation date. |
| 6 | **`curriculum placement`** | Where *this project* places the problem in *its own* map — cluster, node, progression stage. | **Ours, but entangled.** The placement value is this project's own judgment and carries no source expression at all. The rights question is the **join**: a placement row is meaningful only next to a problem reference, so a table of placements is also a table of selected problems, and §2's curation concern attaches to *our* stored selection of *their* problems. | **NOT ADMITTED on this package's judgment** as a field of a problem-reference record — pending `CH-F5-1`, which must settle the field set as a whole rather than field by field. | **Routed to `CH-F5-1`.** |

### 4.1 The interim stored set

> **Until `CH-F5-1` resolves, a problem reference stores `stable id` and `canonical URL` — and nothing else.**

This is the binding position for every C009 sub-task from the moment this file lands. It is deliberately the narrowest defensible set: two fields that `D-F3a` names in its own words, admitted on the rationale `D-F3a` already records, with no local reasoning required to justify either. **A sub-task that needs a wider set does not widen it; it cites `CH-F5-1` by id, specifies its record for both dispositions, and carries the unresolved field set as a cap with a named owner.**

**Charter assumption 19 is `[unconfirmed]`, and this sub-task files the challenge that will confirm or refute it — it does not decide it.** Recording an interim narrow set is not a decision that the wider set is impermissible; it is a refusal to act on an undecided question in the permissive direction. Should `CH-F5-1` resolve in favour of the wider set, the four fields become admissible with no other change to this package: the dispositions in §1, the access-permission record in §3, the no-text rule in §5 and the retention rule in §6 are all independent of the field set and are unaffected either way.

**Status discipline note.** `CH-F5-1` is filed **`unresolved`/open with a named owner** (`D-F5`'s own owner, NEU-932, or the creator by default), by **union — a new appended section, never a replaced row**. **This package does not promote its own artifact to `settled`**, and `DR-C09-01_permitted-field-set.md` sets no status of its own.

---

## 5. The no-text rule — an enforceable prohibition, with a detection method

> **No problem statement text — in whole or in part, from any of the twelve sources — is stored, mirrored, paraphrased into storage, or generated anywhere in this repository.**

Four modes, stated separately because each fails differently:

| Mode | What it forbids | Why it is listed separately |
| --- | --- | --- |
| **Stored** | Writing statement text into a file, a database column, a fixture, a test snapshot, a commit message, or a cache. | The obvious case, and the only one a naive reading covers. |
| **Mirrored** | Serving, embedding, iframing, or re-hosting the source's statement, including "for convenience" or "for offline use". | A mirror stores nothing locally in the author's mental model, yet reproduces the work to every reader. Reference-only means the learner reads the statement **on the original site**. |
| **Paraphrased into storage** | Rewriting the statement in our own words and storing *that*. | Paraphrase-to-evade is explicitly forbidden by `05_…` §2. A close paraphrase of a protected statement is a derivative of it; wording that is our own does not make the expression ours. |
| **Generated** | Having a model produce statement text — a "restatement", a "summary of the problem", a "simplified version", a reconstruction from an id, or a plausible-looking substitute. | The failure mode unique to an AI-authored course, and the one no upstream rule covered. A generated statement is either a reconstruction of the protected work (a reproduction) or an invention presented as the source's problem (a fabrication). **Both are prohibited, and the second is worse.** |

### 5.1 Detection method

The rule is enforced by a **repository scan**, whose shape is fixed here so that it is reproducible rather than improvised:

- **What is scanned:** every tracked text file in this package, plus any file any C009 sub-task adds that is intended to hold a problem reference. The scan reads file content, not filenames.
- **Over which paths:** `docs/research/C009-course-content-quality/` in full, recursively, including subfolders. The scan is extended by each sub-task to cover any new path that stores citations, and is re-run by the completeness gate (`92_package-completeness-gate.md`) over the whole package before it is published.
- **For which shapes:** (a) **statement-section markers at line start** — `Input`, `Output`, `Constraints`, `Sample Input`, `Sample Output` — the structural skeleton of a competitive-programming statement, which survives paraphrase and is far harder to disguise than any phrase; (b) **verbatim-quote blocks and fenced code blocks** that would carry an example, a sample case, or a statement excerpt; (c) **problem-level URLs** of the twelve sources, which is the shape a stored statement or a stored list is reachable through.
- **What counts as a hit:** any match is a **failure to fix, not a note to add**. The scan is a gate, not a report.
- **Its stated limitation** (evidence class 2 `[code-evidence]`, and honest about what it can prove): a lexical scan detects the *shapes* text takes, not semantic paraphrase. It cannot prove that no sentence anywhere is a disguised paraphrase. It **can** prove the structural absence of stored statements and stored lists, which is what §10 records. The residual is a review obligation on every sub-task, not a claim of mechanical completeness.

---

## 6. The retention disposition for an enumerating API response

**Dated:** 2026-08-10 · **Owner:** SUB-1 (NEU-957); the creator by default, as the party carrying the rights exposure · **Ground:** §2's selection-and-curation bright line, `../C005-dp-map-foundations/05_provenance-and-rights.md` §2

**The exposure, named concretely.** A sanctioned access path may answer with the source's **whole problem set in one response**: `problemset.problems` on `api.codeforces.com` returns Codeforces' entire rated problem list — ids, names, tags and ratings — in a single reply. **Neither of the rules that already exist reaches this.** The no-text rule (§5) does not: a list of ids, titles and ratings is not statement text, and passes that rule cleanly. The one-request-per-cited-problem rule does not: **one request is not one list**, and a rule that counts requests says nothing about what a single request returned or what happens to it afterwards.

The bound is therefore stated on the correct axis:

> **RETENTION, NOT REQUEST COUNT.**

**The disposition.** An enumerating response is **read only to resolve the already-selected cited problem**, and is **never stored, cached, mirrored, transcribed, re-published, or used to enumerate, browse or rank candidate problems.** It is not written to disk, not committed, not kept in a fixture or a test snapshot, not summarised into a "shortlist", and not retained in an agent's persisted context beyond the resolution it was fetched for. **Candidate selection comes from this project's own criteria against the graph node — never from a returned list.** A problem that appears in a response but was not already selected is not a candidate; it is noise the project is not entitled to keep.

**Why it grounds in §2 and not in §5.** Retaining or mining an enumerating response reproduces the source's **selection and curation** — which §2 forbids **independently of the no-text rule**. This project may record *that* a source has N problems; it **may not record what those problems are**. The response is precisely the thing that says what they are.

**Ordering — the property that makes this disposition worth anything.** This disposition is dated **at or before the cutoff SUB-3 (NEU-959) works against**, which is why it is written in SUB-1 rather than discovered in SUB-3. **No citation request is ever issued against an undecided retention rule.** A retention rule dated after the first citation request is a failure of this sub-task, not a finding for SUB-3.

**Detection method** (distinct from §5.1's, and this distinction is the point): a repository scan for a **retained problem list or enumerated candidate set** — **explicitly not only for statement text**. It looks for what a retained enumeration actually looks like in a repository: three or more sibling rows or list items each carrying a problem identifier or a problem-level URL of one of the twelve sources; a stored table pairing problem ids with ratings, tags, or titles; a serialised API response body in any file, fixture, snapshot, or cache; and any file whose content is a candidate shortlist. **A scan that only looks for statement text would pass a repository that had stored the entire Codeforces rated list**, which is exactly the failure this disposition exists to prevent. §10 records the result of running both scans.

---

## 7. Attribution, and the access-path rule

### 7.1 Per-source attribution requirements

| Source | Attribution obligation | Basis |
| --- | --- | --- |
| T1 CP-Algorithms | **Mandatory and licence-imposed.** Name the source and the CC BY-SA 4.0 licence at any point of use; share-alike would additionally bind any derivative, which is why none is made. | CC BY-SA 4.0 attribution + share-alike terms |
| T2 Competitive Programmer's Handbook | **Mandatory where relied on.** Name the work and its author (Laaksonen) wherever a definition or framing derives from it. The NC clause bars reuse regardless of attribution — attribution does not cure it. | CC BY-NC-SA; inform-only disposition |
| T3 USACO Guide | **Mandatory where relied on**, and attribution grants nothing further: the recorded reproduction bar stands with or without it. Cite by name and URL; reproduce nothing. | Recorded reproduction bar |
| T4 Codeforces catalogues | **Mandatory where relied on** — name the catalogue and its author where a specific entry is cited. Entry ids remain unverified (`CAP-2`), so an entry is cited only once SUB-3 has resolved it. | Site terms; user-authored content |
| T5 CN/JP olympiad traditions | **Mandatory and per-writeup.** Attribute the specific writeup relied on, never "the tradition" generically; an unattributable writeup is not relied on at all. | Most-restrictive treatment of unclear provenance |
| T6 Primary literature | **Mandatory and per-paper**, in full scholarly form (authors, title, venue, year). A result's applicability conditions are stated in our own words; no text, figure, table or proof is reproduced. | Per-paper terms; cite-only |
| C1 CSES | **Mandatory per cited problem** — the source name plus the problem's canonical URL. | Author-owned statements; inform-only |
| C2 AtCoder EDPC | **Mandatory per cited problem** — the source and contest name plus the canonical URL. | AtCoder terms; inform-only |
| C3 AtCoder TDPC | **Mandatory per cited problem** — the source and contest name plus the canonical URL. | AtCoder terms; inform-only |
| C4 Codeforces problemset | **Mandatory per cited problem** — the source name plus the canonical URL. Where a rating is used as a difficulty signal, the signal is attributed to Codeforces and dated. | Site/user terms; inform-only |
| C5 ICPC / IOI / JOI / POI / CEOI archives | **Mandatory per cited problem and per contest** — the specific contest, year and archive, since terms are per-contest and a generic archive credit identifies nothing. | Per-contest terms; most-restrictive treatment |
| C6 Library Checker | **Mandatory where relied on** — name the project and the specific verification problem whose contract is cited. Permissive licensing does not remove the attribution obligation. | Repo terms; cite-only by choice |

### 7.2 Where attribution must appear

1. **On every artifact that reaches a learner** — a lesson, an exercise wrapper, a solution, a proof, or an assessment item — at the point of use, visible without interaction, naming the source and linking the canonical URL. An attribution a learner must expand a panel to see is not attribution.
2. **On every stored problem reference**, as part of the record: the source and the canonical URL travel with the id, so an exported or copied record can never become an unattributed one.
3. **In the package's own documents**, wherever a source's fact, framing, tiering or applicability condition is relied on — with the evidence class and cutoff, per NEU-887 discipline.
4. **In any generated artifact's provenance block** (§8), stating which source is being referred to and — where this matters — that the reference has **not** been verified.
5. **Nowhere as a substitute for permission.** Attribution discharges an attribution obligation. It does not create a reproduction right, and adding a credit line never converts a forbidden reproduction into a permitted one.

### 7.3 Every sanctioned access path is an access method, **not a licence**

Reaching a source through its **documented public API** (`api.codeforces.com`, C4 only) or through a **single targeted fetch of one problem by its id** grants **nothing beyond ids, URLs and facts**. Both paths change *how* a fact is obtained; **neither changes what may be done with what is obtained**. Rights disposition comes only from §1's dated re-verification and §3's access-permission record.

**Prohibited anywhere in this package, in any document, table, record, commit message or generated artifact:** citing either access path as evidence that a use is permitted. Concretely, none of the following is admissible as a rights argument, and each is a review-stopping defect wherever it appears:

- *"It is in the public API, so we may store it."*
- *"The fetch succeeded, so access was permitted."*
- *"There is no `robots.txt` entry against it, so it is allowed."*
- *"The rate limit was not exceeded, so the use is within terms."*
- *"The response was public, so the content is unrestricted."*

A server answering a request is an operational fact of class 2 `[code-evidence]` at best. A rights permission is a class 1 `[literature]` claim about a terms document, and **the two may never be laundered into one another** — that is exactly the cross-class laundering NEU-887's taxonomy prohibits.

---

## 8. The generated-content policy for our own artifacts

C009's artifacts — lessons, solutions, proofs, tests, hints, assessment items — are **AI-produced**. That does not weaken any rule above, and it adds one: a generated artifact can assert provenance it never had, fluently and at scale. This policy fixes what such an artifact **may** and **may never** claim.

**An AI-produced artifact MAY:**

1. State a **fact about a source** in this project's own words — that a technique is exercised by problems in a corpus, that a source tiers its content, that a corpus has N problems — with attribution, an evidence class, and a cutoff.
2. Carry a **problem reference** consisting of the fields §4 admits (currently `stable id` and `canonical URL`), attributed per §7, and direct the learner to solve **on the original site**.
3. Present **its own** explanation, derivation, solution, proof or test as this project's original work, labelled as generated.
4. State an **applicability condition** taken from primary literature in our own words with full per-paper attribution (§7.1, T6).
5. **Refuse.** An artifact that cannot produce a verified citation says so explicitly and produces a refusal or a placeholder. **A refusal is a success of this policy, never a defect of the artifact.**

**An AI-produced artifact MAY NEVER:**

1. **Assert a problem id it has not had verified** — inventing, guessing, completing, or pattern-matching an id, or presenting an unverified id without the "unverified" marking. A fabricated id is worse than a missing one: it is unfalsifiable at a glance and it points a learner at the wrong problem or at nothing.
2. **Cite a source it did not fetch as though it had been fetched.** Neither an artifact nor a package document may write "verified", "fetched", "confirmed" or a verification date against a source no request was ever made to. *(This document's §1 is the worked example of the correct alternative: every cell states the documentary act actually performed.)*
3. **Reproduce, restate, summarise, simplify, translate, or reconstruct a problem statement**, in any of §5's four modes.
4. **Retain or reproduce a source's problem list, ordering, or curation** (§2, §6) — including as a "recommended set", a "shortlist", or an "example selection".
5. **Claim permission from an access path** (§7.3), or claim a rights position this package has not recorded.
6. **Claim any class-7 evidence** — that users want, that the market validates, that experts confirm, or that anything is proven to work for our learners. **Class 7 does not exist in this program.**
7. **Present its own generated content as a source's content**, or a source's content as its own — the two directions of the same failure.

**Enforcement.** Claims 1 and 2 are detectable: an artifact carrying a problem id with no corresponding dated resolution record in SUB-3's verification record is a **fail**, mechanically checkable at review time. Claims 3, 4 and 6 are covered by the scans of §5.1 and §6 and by the register discipline in `traceability/`. Claims 5 and 7 are review obligations, and are recorded as such rather than asserted as mechanically enforced — **an obligation whose only enforcement is judgment is named as one** (SUB-9 owns the enforcement-gap treatment for the quality system as a whole).

---

## 9. Rights-check self-check

`RC-1`…`RC-6` are inherited from `../C005-dp-map-foundations/05_provenance-and-rights.md` §4 and re-resolved at this cutoff against **this** package — they are not restated as C005's results. `RC-7` and `RC-8` are **new**, added because C009 reaches sources where C005 only read them.

| Check | Passing condition | Result at 2026-08-10 |
| --- | --- | --- |
| **RC-1** | Every selected source has a recorded rights disposition at the current cutoff. | **Pass** — 12/12, §1, each dated 2026-08-10 with the documentary act stated. |
| **RC-2** | Every rights-sensitive source is marked inform-only or cite-only, and none is relied on as reusable beyond its licence. | **Pass** — 9 inform-only, 2 cite-only, 1 reusable (T1); **11 of 12 inform-only or cite-only**, and nothing is reproduced even from T1. The baseline's summary-line arithmetic discrepancy is recorded in §1.2, not corrected here. |
| **RC-3** | No rights-sensitive content is reproduced in this package. | **Pass** — §10's scan returns no problem statement text, no fenced example block, and no problem-level URL. The one verbatim quotation (T3's reproduction bar, §1) is a short attributed quotation of a **licensing term**, quoted because accuracy about a rights restriction is required. |
| **RC-4** | Unclear provenance is treated as restricted, never as permissive. | **Pass** — T5 and C5 keep the most-restrictive treatment (§1), and §3 applies the restricted default to **all twelve** access-permission rows, including T1's permissively-licensed and C6's open-licensed sources. |
| **RC-5** | The constraint is inherited by downstream sub-tasks, not merely observed here. | **Pass** — §4.1 binds every C009 sub-task to the interim stored set; §3.1 binds SUB-3 to consume rather than re-decide; §6 binds every access before the first request; §8 binds every generated artifact. |
| **RC-6** | Dispositions carry a re-verification trigger. | **Pass** — §11.2. Additionally, every "unestablished at cutoff" row of §3 carries its own trigger in `90_open-items-and-provisional-register.md`. |
| **RC-7** *(new)* | A **completed per-source access-permission record** exists — API presence, robots/rate-limit disposition, and a restricted default wherever terms are unestablished — **dated at or before the first citation request**. | **Pass** — §3, 12/12 rows, dated 2026-08-10. Documented API on record for C4 only; the eleven others record that fact literally rather than leaving a blank cell; all twelve record the robots/rate-limit reading as unestablished ⇒ restricted; all twelve record bulk enumeration, crawling and corpus walks as **PROHIBITED** under every disposition. **Zero citation requests have been issued by any C009 sub-task at this cutoff**, so the precondition genuinely precedes the first request rather than being back-dated to look as though it did. |
| **RC-8** *(new)* | A **stated §2 selection-and-curation retention disposition covering enumerating API responses** exists, is dated at or before SUB-3's cutoff, names an owner, and carries a detection method that looks for a retained list rather than only for statement text. | **Pass** — §6, dated 2026-08-10, owner named, bound on **retention rather than request count**, grounded in §2, with the enumerated-set scan recorded in §10. |

---

## 10. Repository-scan result

**Scan date:** 2026-08-10 · **Scope:** `docs/research/C009-course-content-quality/`, recursive, all files · **Commit base:** `c558ff9` · **Evidence class:** 2 `[code-evidence]`

Five greps, run from the repository root before this section was written and re-run against the final file set. Two independent obligations are checked: **no problem statement text** (§5) **and no retained problem list or enumerated candidate set** (§6). They are separate scans because they detect different shapes and a repository can pass one while failing the other.

| # | Checks for | Command (paths relative to the repository root) | Outcome |
| --- | --- | --- | --- |
| **A** | **Statement text** — the structural skeleton of a competitive-programming statement, at line start, which survives paraphrase. | `grep -rnE '^(Input\|Output\|Constraints\|Sample Input\|Sample Output)\b' docs/research/C009-course-content-quality/` | **0 matches.** No output. |
| **B** | **Problem-level URLs** of the twelve sources — the shape a stored statement or a stored list is reachable through. | `grep -rnE '(codeforces\.com/(problemset/problem\|contest)/\|cses\.fi/problemset/task/\|atcoder\.jp/contests/[A-Za-z0-9_-]+/tasks/\|usaco\.org/index\.php\?page=viewproblem\|judge\.yosupo\.jp/problem/)' docs/research/C009-course-content-quality/` | **0 matches.** No output. |
| **C** | **An enumerated candidate set** — list items or table rows carrying source-native problem identifiers, the shape a retained problem list takes. | `grep -rncE '^(\s*[-*]\|\|)\s*.*\b(abc\|arc\|agc\|dp)[0-9]{2,4}_[a-z]\b' docs/research/C009-course-content-quality/` | **0 matches in each of the 12 files** (per-file counts all `0`, re-run over the complete package). |
| **D** | **Fenced code blocks**, which are where a sample case, an example, or a serialised API response body would sit. | `grep -rn '^\`\`\`' docs/research/C009-course-content-quality/` | **0 matches.** No output — the package contains no fenced block at all, so no serialised response can be hiding in one. |
| **E** | **The enumerating endpoint by name**, to confirm every mention is policy prose and not a retained response body. | `grep -rniE '(problemset\.problems\|api\.codeforces\.com)' docs/research/C009-course-content-quality/` | **3 matches**, all in `01_provenance-and-rights.md` (§3 row C4, §6, §7.3). Each names the endpoint as the **subject of a prohibition**; none carries, quotes, or summarises a response. **Expected and correct** — a retention rule has to be able to name the thing it bounds. |

**Outcome: PASS.** No problem statement text is stored anywhere in the package, and no retained problem list or enumerated candidate set is stored anywhere in the package. Scans A–D returned nothing; scan E returned only the three policy references above.

**Stated limitation** (per NEU-887 discipline, class 2 `[code-evidence]`): these are lexical scans. They prove the **structural absence** of stored statements, stored problem-level URLs, enumerated id lists, and fenced example or response blocks. They do **not** prove that no sentence anywhere is a semantic paraphrase of a protected statement, which no grep can prove. That residual is a review obligation on every C009 sub-task, is named here rather than papered over, and is why §5's four modes list *paraphrased into storage* separately from *stored*.

**Re-run obligation.** Both scans are re-run by `92_package-completeness-gate.md` over the whole package before publication, and by any sub-task that adds a path holding problem references. **A hit is a failure to fix, not a note to add.**

---

## 11. Scope, and what this document does not decide

### 11.1 Out of scope

| Out of scope for SUB-1 | Owner |
| --- | --- |
| **The AI-contamination control and its probe** — contamination rules for AI-generated solutions and AI graders whose training may already contain a problem's editorial solution. | **SUB-9 (NEU-965)** — one explicitly carved-out part of OUT-7 |
| **Selecting or licensing a corpus.** `C1`–`C6` are selected by `D-F2`; this pass **re-verifies rather than re-selects** them, and commercial licensing is out of scope charter-wide. | Nobody in C009 |
| **Fetching or verifying any individual problem**, resolving any citation, or exercising any part of the sanctioned access hierarchy. This document records the hierarchy's rights half only; **zero requests were issued here**. | **SUB-3 (NEU-959)** |
| **Editing `D-F5`, `../C005-dp-map-foundations/05_provenance-and-rights.md`, or any existing ledger row in place.** A change is filed as an **appended** challenge; the ledger is written by union, never by replacement. | Prohibited |
| **Filling the shared registers with anything other than SUB-1's own entries.** `90_…` and `91_…` are created well-formed and carry a `### SUB-1` section only; no sibling's entries are pre-populated. | each sub-task writes its own; **NEU-969 (SUB-12)** reconciles the caps register |
| **Deciding charter assumption 19.** This document files `CH-F5-1`; it does not resolve it. | the `D-F5` ledger challenge |

### 11.2 Residual clause, and the revision triggers

> **SUB-1 (NEU-957) is the residual owner of OUT-7. Any provenance, rights, attribution or generated-content obligation of OUT-7 not enumerated in SUB-9's contamination carve-out belongs to SUB-1 — including obligations discovered later.**

An obligation that surfaces after this document lands is **SUB-1's**, not an orphan and not the discovering sub-task's problem to absorb silently; it is raised as an entry in `90_open-items-and-provisional-register.md` against SUB-1 as owner.

**Revision triggers on everything in this document:**

- **Network access becomes available to a re-verification pass** — every "unestablished at cutoff ⇒ restricted" row of §3 is re-read against the source's own terms and re-dated. This is the only route by which a restricted row becomes permissive.
- **A source's terms change**, or a source's terms are read and dated for the first time.
- **`CH-F5-1` resolves** — §4's four not-admitted fields are re-decided by the ledger, and §4.1's interim stored set is superseded by whatever the ledger records.
- **A downstream sub-task proposes to store or reproduce anything beyond the admitted field set** — it files a ledger challenge against `D-F5` and never proceeds on local judgment.
- **A scan in §5.1 or §6 returns a hit** — a failure to fix before the package is published, never a note to add.
