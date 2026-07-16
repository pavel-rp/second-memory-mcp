# Selection Decision Ledger

**Task:** NEU-932 · **Compiled:** 2026-07-16 · **Extends (references, never rebuilds):** `../../C005-product-foundation/adjudication/` (NEU-887 adjudication method and status discipline)

**This file is the sole source of truth for the status of every NEU-932 decision.** No other file in this package — including its README — sets a status. A downstream sub-task that wants a status changed files a challenge here; it never re-decides locally.

---

## 1. Status values (inherited from NEU-887, not redefined)

| Status | Meaning for a downstream consumer |
| --- | --- |
| **settled** | Binding. Adjudicated on correctly-classed evidence. Consume it; do not re-derive it. Change requires a ledger entry. |
| **provisional** | Recorded and usable but **not binding**. Carries a named revision trigger. A consumer relying on it must surface that reliance. |
| **unresolved** | Known open, with a named owner. A consumer **must not invent a value**. |

## 2. The ledger

| Id | Decision | Status | Evidence | Rejected alternatives recorded | Revision trigger | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| **D-F1** | The six selected reference taxonomies (T1 CP-Algorithms, T2 CPH, T3 USACO Guide, T4 Codeforces catalogues, T5 CN/JP olympiad traditions, T6 primary literature). | **settled** | `../01_taxonomy-selection.md` F-T-1…5, class 1 | ✅ 7 recorded (CLRS, Kleinberg–Tardos, CP4, LeetCode, Wikipedia, LLM-generated, single-reference) | The coverage audit finds a technique present in a rejected reference (esp. CP4) but in no selected one. | Coverage-audit sub-task |
| **D-F2** | The six selected problem corpora (C1 CSES, C2 EDPC, C3 TDPC, C4 Codeforces problemset, C5 ICPC/OI archives, C6 Library Checker). | **settled** | `../02_corpus-selection.md` F-C-1…5, class 1 | ✅ 7 recorded (LeetCode, Project Euler, Kattis, SPOJ, HackerRank/Codechef, LLM-generated, scraping) | The audit finds Kattis-only or CP4-only techniques; or a corpus's terms change. | Coverage-audit sub-task |
| **D-F3** | The representation format: per-cluster YAML node files under a versioned manifest, markdown entry point, per-cluster file ownership. | **settled** | `../03_representation-format.md`; validated by `../dry-run/00_representation-dry-run.md` (5/6 requirements pass, 1 deferred as `INC-D1`) | ✅ 5 recorded (single graph file, pure markdown, JSON+Schema, graph DB, DOT/Mermaid) | SUB-2 finds the container cannot carry the node schema; or the generated index drifts from the YAML. | SUB-2 |
| **D-F4** | The four-cluster partition (CL-1…CL-4), the ordered first-match-wins rule (T1→T4), and Convention U. | **settled** | `../04_family-cluster-partition.md`, self-check PC-1…PC-7 all pass | ✅ recorded (five clusters splitting the frontier out; CL-1-as-sink) | **>10 `D-F4a` indeterminate (U2) entries accrue** — signals the cascade needs revision rather than the sink absorbing drift. Or a mapper's U4 challenge succeeds against the rule itself. | This task; challenges via any mapper |
| **D-F4a** | Placement of *specific* contested/indeterminate techniques via the cascade — currently **SOS DP → CL-4** (contested by CL-3) and **Steiner-tree DP → CL-3** (T2 over T3). | **provisional** | `../04_…` §4.2; the CL-3/CL-4 disagreement is **carried, not smoothed** | ✅ CL-3 ownership of SOS DP recorded as the live counter-claim | SUB-5 files a U4 challenge arguing the mask encoding, not the speedup, is SOS DP's defining contribution. | SUB-5 / SUB-6 |
| **D-F5** | The provenance-and-rights dispositions; 10 sources inform-only, 2 cite-only, 1 (T1) reusable. | **settled** | `../05_provenance-and-rights.md`, checks RC-1…RC-6 all pass | ✅ recorded (scraping any corpus into the repo) | Any source's terms change; or a downstream sub-task proposes to reproduce content. **A later curriculum-production charter must re-verify all dispositions** — it reproduces content this map never touches. | This task; re-verified by the curriculum charter |
| **D-F3a** | The node-level schema inside the chosen format (field names, types, skill-type vocabulary, edge semantics). | **unresolved — by design** | — | — | Bound when SUB-2 lands. **Consumers must not invent node fields.** Constraints inherited from here: `status` field required with three legal values; `adjudicated_at_map_version` required; string enums quoted; **no field may hold verbatim external content** (`D-F5`). | **SUB-2** |

## 3. Incomplete-state markers (`INC-D#`)

Namespaced `-D` so they never collide with NEU-887's `INC-1…5` or NEU-888's `INC-I#`. Each names a **missing artifact with an owner** — reported, never invented (NEU-899 rule 4, inherited).

| Marker | Missing artifact | Owner |
| --- | --- | --- |
| **INC-D1** | A **real cold-context handoff** of the representation to a downstream agent. This package's dry-run is a desk-check against a constructed specimen — class 1/2 evidence about the format's *expressiveness*, not class 4 evidence that an agent *succeeded*. Not provable before nodes exist. | Final packaging sub-task (OUT-9's cold-context dry-run supersedes this one) |
| **INC-D2** | The **node schema** (`D-F3a`). | SUB-2 |
| **INC-D3** | The **technique inventory** the partition rule applies to. This package's worked examples are illustrative, so the rule is stress-tested but not exhaustively exercised. | The five family-mapping sub-tasks |
| **INC-D4** | Hand-verified **exact citations** for T4's Codeforces entries (`CAP-2`: automated fetch returned HTTP 403). | Coverage-audit sub-task |

## 4. Carried conflicts (preserved, not smoothed)

| Id | Conflict | Disposition |
| --- | --- | --- |
| **X-D1** | **SOS DP: CL-4 vs CL-3.** T1 (cost reduction of a correct transition) and T2 (inseparable from the mask encoding) both plausibly fire. | Adjudicated to CL-4 **by rule order**, logged `D-F4a` **provisional**, CL-3's claim recorded as live, U4 challenge route named. Carried in-band in the map itself via `contested_by` (`../dry-run/00_…` §2). |
| **X-D2** | **Naming instability across references** (F-T-4): the same technique carries different names by tradition. | Not resolved here — **preserved for OUT-7**, which must issue *mapped equivalence* verdicts and must not read a naming difference as a coverage gap. |
| **X-D3** | **Inherited NEU-887 R1 (DP-transfer gap).** No selected corpus is ordered by *learning* dependency (F-C-5); EDPC's authored ramp is one expert's design judgment, not validated prerequisite evidence. | Carried undiminished. The map must not import any corpus's ordering as a prerequisite claim. Non-downgradable High. |

## 5. Self-check

| Check | Passing condition | Result |
| --- | --- | --- |
| **AC-1** | Every material NEU-932 decision has exactly one ledger row. | **Pass** — 7 rows (D-F1…D-F5, D-F4a, D-F3a). |
| **AC-2** | Every settled decision records its rejected alternatives. | **Pass** — 5/5 settled rows. |
| **AC-3** | Every non-settled item names an owner and a trigger. | **Pass** — D-F4a and D-F3a both. |
| **AC-4** | No status is set outside this file. | **Pass** — every topic file defers here in its header. |
| **AC-5** | No NEU-887/NEU-888 machinery is re-derived. | **Pass** — taxonomy, materiality rule, status values, and marker discipline are referenced; only `-D`-namespaced ids are added. |
| **AC-6** | Conflicts are carried, not smoothed. | **Pass** — X-D1…X-D3, §4. |
| **AC-7** | No class-1–6 evidence is presented as class 7. | **Pass** — no external-user, expert, or market claim appears anywhere in this package. |
