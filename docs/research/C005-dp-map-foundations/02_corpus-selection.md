# Representative Problem Corpus Selection

**Task:** NEU-932 · **Decision:** `D-F2` · **Compiled:** 2026-07-16 · **Verification cutoff:** 2026-07-16 · **Status:** settled (see `adjudication/01_selection-decision-ledger.md`)

The representative competitive-programming problem corpora the NEU-889 map is calibrated and audited against. Like the taxonomies, these are **research inputs, not authoritative curricula**, and **every one of them is rights-sensitive** — see §5 and `05_provenance-and-rights.md`.

---

## 1. What a corpus is for here (and what it is emphatically not for)

A taxonomy says what techniques *exist*. A corpus is evidence about what techniques are *actually exercised*, at what difficulty, and in what combinations. The map uses corpora for exactly three things:

1. **Existence evidence** — a technique that a real problem set demands is not a taxonomist's invention.
2. **Difficulty calibration** (feeds OUT-3) — problem ratings are an independent difficulty signal, orthogonal to a taxonomy's tiering.
3. **Coverage auditing** (feeds OUT-7) — a technique repeatedly required by problems but present in no selected taxonomy is a genuine gap, and this is the only way to find it.

**The map does not copy problems, and this charter authors no content.** Selecting final problem licenses is explicitly a later curriculum-production charter's job (NEU-932 out-of-scope). The corpora inform the map's *structure*; their text stays where it is.

## 2. The selected corpora

| Id | Corpus | What it contributes | Rights disposition |
| --- | --- | --- | --- |
| **C1** | **CSES Problem Set** (`cses.fi/problemset`) — DP section | A small, deliberately curated, technique-per-problem DP section. Verified 2026-07-16: **25 problems** in the Dynamic Programming section. Its curation is the value — each problem targets a distinct technique, making it the cleanest available foundational→intermediate skeleton. Its **Advanced Techniques** section (26 problems) carries further DP material. | **INFORM-ONLY.** Problem statements are the authors'; structure informs, text is never copied. |
| **C2** | **AtCoder Educational DP Contest** ("EDPC", 26 problems A–Z) | The single best **ordered** DP corpus in existence: designed as a curriculum, ramping from trivial recurrences to bitmask, tree, and optimization DP. Directly informs the CL-1→CL-4 difficulty ramp and OUT-6's representative paths. | **INFORM-ONLY.** AtCoder terms; inform-only. |
| **C3** | **AtCoder Typical DP Contest** ("TDPC") | EDPC's harder sibling. Reaches into the state-compression and specialized-domain material (CL-3) that EDPC only touches. Where EDPC ends, TDPC is the evidence that the ramp continues. | **INFORM-ONLY.** |
| **C4** | **Codeforces problemset**, `dp` tag intersected with `bitmasks` / `profile dynamics` / `divide and conquer` / `matrices`, filtered to Div1-D and above | The **frontier corpus and the primary difficulty signal**. Two irreplaceable properties: (a) numeric problem *ratings*, the only quantitative difficulty evidence available anywhere in this selection; (b) tag intersections that surface real technique *combinations* — which is where the frontier actually lives, since research-tier DP is usually two techniques composed. | **INFORM-ONLY.** User- and site-owned; inform-only. |
| **C5** | **ICPC World Finals / regional archives and national-olympiad (IOI, JOI, POI, CEOI) DP problems** | The **provenance of the frontier**. Techniques like slope trick and plug DP entered the canon *through* olympiad problems; the olympiad archives are where a research-tier technique's first real instance lives. Also the only corpus reaching the Chinese/Japanese tradition T5 names. | **INFORM-ONLY.** Per-contest, often unclear; treated as most-restrictive. |
| **C6** | **Library Checker** (`judge.yosupo.jp`) | Not a problem set — a **verification** corpus. It pins the exact algorithmic contract of frontier primitives (Li Chao tree, segment-tree-beats, convolutions) that CL-4 techniques depend on. Where community writeups are informally worded, Library Checker is unambiguous about what the primitive must do. | Permissive/open; still cited, not copied. |

## 3. The comparison

| Criterion | C1 CSES | C2 EDPC | C3 TDPC | C4 CF | C5 ICPC/OI | C6 LibChk |
| --- | --- | --- | --- | --- | --- | --- |
| **Frontier reach** | low | low | medium | **high** | **high** | medium (primitives) |
| Curation quality | **high** | **high** | **high** | low (tags are noisy) | medium | **high** |
| Explicit ordering | medium | **high** | medium | none | none | none |
| **Numeric difficulty signal** | none | none | none | **yes (ratings)** | none | none |
| Technique-per-problem isolation | **high** | **high** | medium | low (compositions) | low | **high** |
| Volume | small (25) | small (26) | small | very large | large | small |

**The stratification is deliberate and mirrors the taxonomy set's logic.** C1/C2/C3 are small, curated, isolated-technique corpora — ideal for establishing that a technique exists and where it sits in a ramp, useless for the frontier. C4/C5 are large, noisy, composed, and are the only route to the frontier. C6 pins the primitives. No corpus does two of these jobs well.

**Small and curated beat large and tagged for a map** — which is the corpus-side restatement of the charter's "topic volume is never coverage." C4's size is why it is included (frontier + ratings), not evidence of quality; its tags are noisy and its problems compose techniques, so it cannot establish a clean technique boundary. C1/C2's 51 combined problems carry more *structural* signal than C4's tens of thousands.

## 4. Rejected alternatives (recorded per the NEU-932 acceptance bar)

| Rejected | Why it was a serious candidate | Why rejected |
| --- | --- | --- |
| **LeetCode DP problem set** | The largest tagged DP corpus available; enormous volume; excellent tagging. | Rejected on **audience mismatch and rights**. Interview-oriented, effectively no frontier material, and duplicative of C1/C2 below the frontier. Its terms of service are the most restrictive of any candidate. Volume without reach is exactly the trap the charter's anti-goal names. |
| **Project Euler** | Free; deep; mathematically rich; several genuinely hard DP problems. | Rejected on **fit and rights**. Its problems are number-theoretic/mathematical rather than competitive-DP-shaped, and it explicitly discourages publishing solutions/derived material, making even inform-only use awkward. Its DP content is largely digit-DP-adjacent, already covered by C4. |
| **Kattis / open.kattis.com** | Large, open, ICPC-aligned; good problem quality. | Rejected on **redundancy**. Its ICPC-tradition DP material is covered by C5 at the frontier and by C1/C2 below it, and it offers no unique difficulty signal (no public numeric rating comparable to C4's). Adds a matrix column that duplicates others. **Recorded as a material exclusion** — a revision trigger on `D-F2` if the audit finds Kattis-only techniques. |
| **SPOJ** | Historically important; large; some classic DP problems. | Rejected on **curation decay**. Inconsistent quality, largely unmaintained tagging, and no difficulty signal. Its historically important DP problems are reachable through C4/C5. |
| **HackerRank / Codechef DP tracks** | Structured tracks; some ordering. | Rejected on **redundancy with C1/C2** below the frontier and **no reach** above it. Nothing unique. |
| **An LLM-generated problem corpus** | Unlimited; zero rights issues; targetable at any technique. | Rejected on **evidence class**, exactly as in `01_…` §4. Generated problems are not evidence that a technique is exercised in practice — they are evidence that a model can produce a prompt. Calibrating difficulty against them would be circular. |
| **Scraping any corpus into the repo** | Would make the map self-contained and auditable offline. | Rejected on **rights** — this is the specific act the charter's rights constraint forbids, and the risk register names it ("rights-sensitive corpora are copied rather than used to inform the taxonomy", Medium). No corpus content enters this repository. |

## 5. Findings

| Id | Finding | Class | Provenance | Cutoff | Limitation |
| --- | --- | --- | --- | --- | --- |
| **F-C-1** | The CSES Problem Set's Dynamic Programming section contains 25 problems; its Advanced Techniques section contains 26. | 1 `[literature]` | `cses.fi/problemset` — fetched and verified 2026-07-16 | 2026-07-16 | A problem count is not technique coverage; several problems may exercise one technique and vice versa. Counts drift as the set is maintained. |
| **F-C-2** | Every selected corpus except C6 is rights-sensitive and is marked inform-only; no corpus content is reproduced in this package or the map. | 1 `[literature]` | §2; `05_provenance-and-rights.md` | 2026-07-16 | Dispositions rest on site terms as read at this cutoff; terms change. Re-verification is a named revision trigger on `D-F5`. |
| **F-C-3** | Codeforces problem ratings are the only quantitative difficulty signal in the selected corpus set. | 1 `[literature]` | §3 comparison | 2026-07-16 | Ratings measure *contest performance* of a specific population — they are a proxy for solve difficulty under time pressure, not for *learning* difficulty. OUT-3 must not treat a rating as a learning-difficulty measurement. This is a real limitation on the only quantitative input available. |
| **F-C-4** | Frontier techniques appear in corpora predominantly as **compositions** with other techniques rather than in isolation. | 1 `[literature]` | C4/C5 survey | 2026-07-16 | Survey-level observation, not a measured frequency. **Consequence for the mappers:** a frontier node's prerequisites will rarely be readable off a single problem, and CL-4's mappers (SUB-6/SUB-13) should expect to decompose compositions rather than find clean instances. |
| **F-C-5** | No selected corpus is ordered by *learning* dependency; C2 (EDPC) is ordered by the contest author's intended ramp, which is the closest available proxy. | 1 `[literature]` | §3 | 2026-07-16 | An authored ramp is one expert's judgment, not a validated prerequisite order — it is class-1 evidence about *a* design, not about learning. The map must not import EDPC's order as a prerequisite claim; NEU-887's R1 (DP-transfer gap) applies undiminished. |

## 6. What this selection does not do

- It does **not** select problem licenses — explicitly a later curriculum-production charter's job.
- It does **not** copy, mirror, or restate any problem statement.
- It does **not** treat any corpus as defining the technique space; corpora are evidence *about* it.
- It does **not** enumerate problems. A problem list here would be volume, not coverage.
