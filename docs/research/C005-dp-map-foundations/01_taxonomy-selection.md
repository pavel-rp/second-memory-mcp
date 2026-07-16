# Reference DP Taxonomy Selection

**Task:** NEU-932 · **Decision:** `D-F1` · **Compiled:** 2026-07-16 · **Verification cutoff:** 2026-07-16 · **Status:** settled (see `adjudication/01_selection-decision-ledger.md`)

The reference DP taxonomies the NEU-889 map is audited against. These are **research inputs, not authoritative curricula** (charter constraint): the map is not obliged to agree with any of them, and where they disagree, the disagreement is preserved for the coverage-audit sub-task (OUT-7), not settled here.

Every finding below is class 1 `[literature]` under NEU-887's seven-class taxonomy (`../C005-product-foundation/01_evidence-taxonomy.md`), which this package references and does not re-derive.

---

## 1. Why multiple taxonomies, and why these

The charter requires a **coverage matrix against multiple selected references** (OUT-7). A single reference cannot support that — a matrix with one column is a copy, and the map would inherit that source's blind spots as its own definition of complete. The selection therefore optimizes for **complementary blind spots**, not for individual quality.

The maximalist bar (charter Assumption #4: "the maximal known competitive DP technique space, including rare / research-tier techniques beyond the standard Div1/ICPC canon") drives the shape of the set: **no textbook or single site reaches the frontier.** Published, well-edited references stop at the canon almost by definition — the frontier lives in community writeups, national-olympiad traditions, and primary papers. The set is deliberately stratified across four tiers:

| Tier | Purpose | Selected |
| --- | --- | --- |
| **Canonical/edited** | A stable, well-reviewed spine | T1, T2 |
| **Pedagogically ordered** | Difficulty/progression signal | T3 |
| **Community/frontier** | Reaches past the canon — the maximalist bar | T4, T5 |
| **Primary/research** | Grounds the research-tier claims T4/T5 make informally | T6 |

Selecting only the first two tiers would silently cap the map at the canon and quietly fail Assumption #4. That is the single most important property of this selection.

## 2. The selected taxonomies

| Id | Reference | Tier | What it contributes | Rights disposition |
| --- | --- | --- | --- | --- |
| **T1** | **CP-Algorithms** (`cp-algorithms.com`) — DP section | Canonical | An edited, open-licensed technique spine. Verified to cover introduction to DP, knapsack, LIS, **DP optimizations (divide-and-conquer DP, Knuth's optimization)**, and **DP on broken profile** — i.e. it reaches slightly past the canon into CL-3/CL-4 territory. | **CC BY-SA 4.0** — reusable with attribution + share-alike. Verified 2026-07-16. |
| **T2** | **Competitive Programmer's Handbook** (Laaksonen) | Canonical | A coherent, single-author DP treatment with consistent notation; the best available *definitional* baseline for foundational and bitmask DP. | **CC BY-NC-SA** — inform-only for this project's purposes (see `05_…`). |
| **T3** | **USACO Guide** (`usaco.guide`) — DP modules | Pedagogically ordered | The only selected reference that carries an explicit **difficulty/progression tiering** (General → Bronze → Silver → Gold → Platinum → Advanced), verified 2026-07-16. Feeds OUT-3's difficulty dimensions as a *signal*, not an authority. | **Rights-sensitive — INFORM-ONLY.** Verified 2026-07-16: the site states "No part of this website may be reproduced or commercialized in any manner without prior written permission." No content reproduced. |
| **T4** | **Codeforces community DP catalogues** — chiefly the long-standing "Dynamic Programming Type" catalogue of DP problem types, plus the community DP-optimizations writeups (Knuth, divide-and-conquer, CHT, Lagrangian/"Aliens", SOS DP, slope trick, segment-tree-beats/kinetic interplay) | Community/frontier | **The primary frontier source.** This is where research-tier techniques are named and circulated before any textbook records them. Indispensable to the maximalist bar. | **Rights-sensitive — INFORM-ONLY.** Codeforces content is user-authored under site terms; treated as inform-only. |
| **T5** | **Chinese/Japanese olympiad technique traditions**, as reachable through English-language community writeups — plug DP (插头DP), broken-profile DP, slope trick, kinetic segment tree / segment-tree-beats | Community/frontier | Covers the frontier's **other** origin. Techniques that are standard in the Chinese and Japanese OI traditions are frequently absent from Anglophone references entirely; T4 alone would inherit that blind spot. Plug DP — a technique the NEU-932 spec names explicitly — comes from here. | **Rights-sensitive — INFORM-ONLY.** Mixed and often unclear provenance; treated as the most restrictive case. |
| **T6** | **Primary literature** for the research-tier optimizations — the SMAWK algorithm (Aggarwal et al.), Knuth–Yao quadrangle inequality, Monge/totally-monotone matrix theory, and the Lagrangian-relaxation basis of the "Aliens trick" | Primary/research | Grounds CL-4's frontier in **primary sources with actual correctness conditions**, rather than the informal folklore of T4/T5. The applicability conditions (when the quadrangle inequality holds; when Lagrangian relaxation is valid) are exactly what a *learning map* needs and what community writeups most often omit. | Per-paper; cited, never reproduced. |

**T1 is the only selected taxonomy whose content is freely reusable.** Everything else informs the taxonomy without being copied. This is a real constraint on the map's construction, not a formality — see `05_provenance-and-rights.md`.

## 3. The comparison

Scored on what the map actually needs. **Maximalist reach** is weighted highest because it is the criterion a reference set can fail *silently*.

| Criterion | T1 CP-Algo | T2 CPH | T3 USACO | T4 CF | T5 CN/JP | T6 Papers |
| --- | --- | --- | --- | --- | --- | --- |
| **Maximalist reach (frontier)** | partial | low | low | **high** | **high** | **high** (narrow) |
| Canon coverage | **high** | **high** | **high** | medium | low | low |
| Difficulty/progression signal | low | low | **high** | low | low | none |
| Definitional precision | **high** | **high** | medium | low | low | **high** |
| Editorial stability | **high** | **high** | **high** | low (churns) | low | **high** |
| Freely reusable | **yes (CC BY-SA)** | no (NC) | **no** | no | no | no |
| Correctness conditions stated | medium | medium | low | low | low | **high** |

**Complementarity is the point.** T1/T2 are precise but stop early. T4/T5 reach the frontier but are imprecise and unstable. T6 is precise *and* reaches the frontier but covers only a handful of techniques. T3 is the only difficulty signal. Each covers at least one other's blind spot; dropping any tier loses a capability nothing else supplies.

## 4. Rejected alternatives (recorded per the NEU-932 acceptance bar)

| Rejected | Why it was a serious candidate | Why rejected |
| --- | --- | --- |
| **CLRS** (Cormen et al.) | The canonical algorithms textbook; precise; universally known. | Rejected on **scope mismatch**. CLRS treats DP as one chapter of a general algorithms course — rod cutting, matrix-chain, LCS. It stops far below even the Div1 canon, let alone the maximalist bar, and its audience (general CS) is not this charter's (competitive-oriented). It would add a column to the coverage matrix that is a strict subset of T1/T2's — pure cost, no signal. Also fully copyrighted. |
| **Kleinberg & Tardos** | Excellent DP *design*-technique framing (the "six representative problems" pedagogy). | Rejected for the same scope reason as CLRS. Its framing influence is real but is a *pedagogy* input, and pedagogy is NEU-888's decided territory, which this charter consumes rather than re-derives. |
| **Competitive Programming 4** (Halim & Halim) | Explicitly competitive-oriented; wide technique coverage; well organized. | Rejected on **rights vs. marginal coverage**. Fully copyrighted with no reuse path, and its DP coverage is largely a subset of T1+T2+T4's union. Where a reference is rights-restricted *and* adds no unique reach, the materiality rule (NEU-887) says exclude rather than carry an inform-only dependency for nothing. **Recorded as a material exclusion**: if the coverage audit finds a technique in no selected reference but present in CP4, that is a revision trigger on `D-F1`. |
| **LeetCode DP topic taxonomy** | Very large DP problem taxonomy; widely used; well tagged. | Rejected on **audience and rights**. Its taxonomy is interview-oriented and truncates precisely where this map gets interesting (essentially nothing at the frontier), and its terms of service are the most restrictive of any candidate. It would import interview-shaped category boundaries into a competitive-programming map. |
| **Wikipedia's DP article / category** | Free (CC BY-SA); broad; accessible. | Rejected on **inconsistent granularity**. It mixes DP-the-mathematical-method (Bellman, optimal control) with DP-the-programming-technique at wildly different levels of detail, and has no competitive-programming technique boundary at all. Its correctness-condition material is better sourced directly from T6. |
| **An LLM-generated DP taxonomy** | Fast; would reach the frontier plausibly; zero rights issues. | Rejected on **evidence class**. It would be class 4 `[ai-critique]` at best, presented as a reference. The map would then be audited against a generated artifact — circular, and precisely the "invents its own references" failure NEU-932 exists to prevent. AI review remains valid as an *adversarial check* on the map (OUT-7), never as a *reference* for it. |
| **A single reference (T1 only)** | Simplest; freely licensed; already covers a lot. | Rejected on **charter conflict**. OUT-7 requires a coverage matrix against *multiple* references; with one column there is nothing to adjudicate and the map's definition of complete collapses into CP-Algorithms' table of contents. |

## 5. Findings

| Id | Finding | Class | Provenance | Cutoff | Limitation |
| --- | --- | --- | --- | --- | --- |
| **F-T-1** | CP-Algorithms is licensed CC BY-SA 4.0 and its DP section covers introduction, knapsack, LIS, DP optimizations (D&C, Knuth), and DP on broken profile. | 1 `[literature]` | `cp-algorithms.com` — fetched and verified 2026-07-16 | 2026-07-16 | A table of contents is not a technique space; its frontier coverage is thin and it is not authoritative over what "is DP." |
| **F-T-2** | The USACO Guide organizes content into General/Bronze/Silver/Gold/Platinum/Advanced tiers and prohibits reproduction without prior written permission. | 1 `[literature]` | `usaco.guide` — fetched and verified 2026-07-16 | 2026-07-16 | Tiering is USACO-contest-shaped, not this audience's; it is a difficulty *signal*, never a progression authority. Rights bar is verified and binding. |
| **F-T-3** | No single selected reference reaches the maximalist bar alone; frontier techniques (plug DP, slope trick, kinetic-segment-tree interplay) are carried only by community/olympiad sources (T4/T5) and primary papers (T6). | 1 `[literature]` | This section's comparison, §3 | 2026-07-16 | An argument from the surveyed candidate set, not a proof of non-existence. A reference reaching the frontier alone may exist outside the sweep — recorded as cap `CAP-1` in `06_…`. |
| **F-T-4** | The frontier's naming is unstable across sources: the same technique carries different names by tradition (e.g. the Lagrangian-relaxation technique is widely called the "Aliens trick"; kinetic/segment-tree-beats material circulates under several names). | 1 `[literature]` | T4/T5 survey | 2026-07-16 | Practitioner naming, not a formal synonymy claim. **Consequence:** the coverage audit must expect *mapped equivalence* verdicts (OUT-7's named category) frequently, and must not read a naming difference as a coverage gap. |
| **F-T-5** | The exact URL of the Codeforces "Dynamic Programming Type" catalogue could not be machine-verified: `codeforces.com` returned HTTP 403 to automated fetching on 2026-07-16. | 1 `[literature]` | Fetch attempt, 2026-07-16 | 2026-07-16 | T4 is selected on the basis of the tradition it names, which is well-attested, but its **specific entry ids are unverified at this cutoff**. Recorded as cap `CAP-2`; the coverage-audit sub-task must resolve exact citations by hand before relying on any specific entry. Not asserted as verified. |

## 6. What this selection does not do

- It does **not** adjudicate disagreements between T1…T6 about what counts as DP. That is OUT-7. Disagreements are preserved for it.
- It does **not** treat any reference as authoritative over the map. The map may include a technique no reference lists (the partition's Convention U handles ownership) and may exclude one every reference lists (with a recorded rationale).
- It does **not** enumerate the technique space. A list here would be topic volume, not coverage.
