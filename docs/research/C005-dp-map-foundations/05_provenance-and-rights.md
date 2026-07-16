# Provenance and Rights

**Task:** NEU-932 · **Decision:** `D-F5` · **Compiled:** 2026-07-16 · **Verification cutoff:** 2026-07-16 · **Status:** settled (see `adjudication/01_selection-decision-ledger.md`)

The NEU-889 charter carries a Medium risk — *"rights-sensitive corpora are copied rather than used to inform the taxonomy"* — and the binding constraint: **rights-sensitive content may inform the taxonomy without being copied.** This file records the per-source disposition and states exactly what "inform-only" permits and forbids, so the rule is enforceable rather than aspirational.

---

## 1. The dispositions

| Source | Type | Rights status | Disposition | Verified |
| --- | --- | --- | --- | --- |
| **T1** CP-Algorithms | Taxonomy | **CC BY-SA 4.0** | **Reusable with attribution + share-alike.** The only freely reusable selected reference. Even so, this package reproduces none of it. | ✅ Fetched 2026-07-16 |
| **T2** Competitive Programmer's Handbook | Taxonomy | **CC BY-NC-SA** | **INFORM-ONLY.** The **NC** clause is disqualifying for a project with any commercial path; share-alike would additionally be viral over derived content. Not relied on as reusable. | Asserted from the work's stated license; not machine-verified at this cutoff |
| **T3** USACO Guide | Taxonomy | **All rights reserved — explicit reproduction bar** | **INFORM-ONLY.** Verified quote: *"No part of this website may be reproduced or commercialized in any manner without prior written permission."* | ✅ Fetched 2026-07-16 |
| **T4** Codeforces catalogues | Taxonomy | User-authored under site terms | **INFORM-ONLY.** | Site terms; entry-level fetch returned HTTP 403 (see `CAP-2`) |
| **T5** CN/JP olympiad traditions | Taxonomy | Mixed / frequently unclear | **INFORM-ONLY — most restrictive treatment.** Where provenance is unclear, the *unclear* case is treated as restricted, never as permissive. | Not verifiable per-source |
| **T6** Primary literature | Taxonomy | Per-paper (mostly all-rights-reserved) | **Cite-only.** Facts and applicability conditions may be stated in this package's own words with attribution; no text, figure, or proof is reproduced. | Per-paper |
| **C1** CSES | Corpus | Author-owned statements | **INFORM-ONLY.** | ✅ Fetched 2026-07-16 |
| **C2** AtCoder EDPC | Corpus | AtCoder terms | **INFORM-ONLY.** | Site terms |
| **C3** AtCoder TDPC | Corpus | AtCoder terms | **INFORM-ONLY.** | Site terms |
| **C4** Codeforces problemset | Corpus | Site/user terms | **INFORM-ONLY.** | Site terms |
| **C5** ICPC / IOI / JOI / POI / CEOI archives | Corpus | Per-contest, often unclear | **INFORM-ONLY — most restrictive treatment.** | Not verifiable per-source |
| **C6** Library Checker | Corpus | Permissive/open | **Cite-only** by this package's own choice (nothing needs copying). | Repo terms |

**Summary: 11 of 12 sources are inform-only or cite-only. Exactly one (T1) is freely reusable, and this package reproduces nothing even from it.** The map is therefore built to be rights-clean by construction, not by later cleanup.

## 2. What "inform-only" means (the operative rule)

The term is used precisely, because "inform-only" without a definition is exactly how rights leak.

**Permitted** — the source may shape the map's *structure*:

- Learning **that a technique exists** and what practitioners call it.
- Learning **that a technique is exercised** by real problems, and roughly at what difficulty.
- Learning **that one technique presupposes another** — prerequisite evidence.
- Recording, in this project's own words, a **fact about a source**: that a section exists, that a corpus has N problems, that a site tiers its content. (Every finding in `01_…`/`02_…` is of this kind.)
- **Citing** the source by URL and title with attribution.

**Forbidden** — the source's *expression* never enters this repository:

- Copying or paraphrasing-to-evade a **problem statement**, in whole or in part.
- Copying **prose, tables, figures, proofs, or code** from a taxonomy or editorial.
- Reproducing a source's **problem list** or **section contents** as a map artifact — a technique inventory transcribed from T3 would be a reproduction of T3's organization, even reworded.
- Mirroring, scraping, or vendoring any corpus into the repo.
- Treating a source's **ordering** as this map's ordering (a rights concern *and* an evidence concern — see `02_…` F-C-5).

**The bright line:** the map may record *that* CSES has a DP section with 25 problems (a fact about the source, stated here). It may not record *what those 25 problems are* (the source's expression and curation). Facts about a source are ours to state; a source's selection and arrangement are not.

## 3. Why the map's own structure keeps this clean

The rights constraint is not enforced only by discipline — it is largely enforced by what the map *is*:

- The map is a **knowledge-and-skill graph**, whose nodes are techniques and skills, not problems. There is no field in which a problem statement could sit. `D-F3a` (SUB-2's schema) inherits a constraint from here: **no node field may hold verbatim external content**; problem references, if any, are URLs and identifiers only.
- The map's node set is derived from the **partition rule** (`04_…`), not transcribed from any reference's table of contents. This matters: a map that mirrored T3's module list would be a derivative work of T3's organization regardless of wording. The partition rule is this project's own, so the resulting organization is too.
- The **multi-reference requirement** (OUT-7) is incidentally a rights safeguard: a structure synthesized across six disagreeing references, adjudicated by our own rule, is not any one reference's arrangement.

## 4. The rights check (NEU-932 verification evidence)

| Check | Passing condition | Result |
| --- | --- | --- |
| **RC-1** | Every selected source has a recorded rights disposition. | **Pass** — 12/12, §1. |
| **RC-2** | Every rights-sensitive source is marked inform-only. | **Pass** — 10 inform-only, 2 cite-only, 1 reusable (T1); none relied on as reusable beyond its license. |
| **RC-3** | No rights-sensitive content is reproduced in this package. | **Pass** — this package contains no problem statement, no copied prose, no transcribed problem list, and no source's section contents. The one verbatim quotation (T3's reproduction bar, `01_…` F-T-2) is a short attributed quotation of a **licensing term**, quoted precisely *because* accuracy about a rights restriction is required, and is fair use of a legal notice. |
| **RC-4** | Unclear provenance is treated as restricted, not permissive. | **Pass** — T5 and C5 explicitly take the most-restrictive treatment. |
| **RC-5** | The constraint is inherited by downstream sub-tasks, not just observed here. | **Pass** — §3 binds `D-F3a` (no verbatim external content in any node field); the ledger carries `D-F5` as binding on all downstream mappers. |
| **RC-6** | Dispositions carry a re-verification trigger. | **Pass** — §5. |

## 5. Revision triggers

- **Terms change.** Every disposition rests on terms as read at the 2026-07-16 cutoff. A later curriculum-production charter that intends to *use* problems (not merely be informed by them) must re-verify every disposition — it operates under a stricter bar than this map does, because it would reproduce content this map never touches.
- **T2's license is asserted, not machine-verified** at this cutoff. Recorded as a known weakness; it does not change the disposition, since inform-only is already the most conservative usable treatment.
- **A downstream sub-task proposing to copy anything** files a ledger challenge against `D-F5`. It never proceeds on local judgment.
