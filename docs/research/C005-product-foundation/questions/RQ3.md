# RQ3 — Existing competitive-programming practice tools: documented approaches and gaps

**Declared:** 2026-07-11 (see `../02_research-questions.md`) · **Search cutoff:** 2026-07-11
**Status:** Answered within caps (5 candidates reviewed, 3 included).

## Search record

| Field | Value |
| --- | --- |
| Interface | `WebSearch` (Claude Code tool, US region), 2026-07-11 |
| Exact query | `competitive programming practice platforms LeetCode Codeforces spaced repetition mastery skill acquisition patterns` |
| Supplementary interface | Repo corpus: `docs/research/results/04-monetization-market-research.md` and `docs/research/SYNTHESIS.md` (verification cutoff 2026-07-07) |
| Selection method | Per method §3: primary sources (platform/tool repos, official blogs) over listicles; the repo's prior market research is a labeled existing-project-research source. |

## Candidate ledger (5 reviewed / cap 5)

| # | Candidate | Decision | Rationale |
| - | --- | --- | --- |
| C1 | `brandon-gong/grind` — CLI for spaced-repetition scheduling of LeetCode problems (github.com/brandon-gong/grind) | **INCLUDED** (S1) | Primary source (repo); direct evidence that SR-for-CP exists as a niche tool shape (SM-2-based). |
| C2 | Codeforces community resource threads (codeforces.com/blog/entry/23054, /150461) | **INCLUDED** (S2) | Primary community documentation of prevailing practice culture (volume + rating grind, curated problem lists). |
| C3 | Repo prior research: `docs/research/results/04-monetization-market-research.md` (competitive landscape sections) + `SYNTHESIS.md` | **INCLUDED** (S3) | Existing-project research with its own T1/T2 provenance discipline; covers SR-market and AI-tutor adjacency (AnkiHub, Gradual Learning, Mem0, SuperMemo API). |
| C4 | Medium listicle "The 7 Best Platforms for Competitive Programming" | EXCLUDED | SEO/opinion aggregator; no primary data beyond what S2 documents. |
| C5 | GeeksforGeeks "Top 10 Coding Platforms" blogs | EXCLUDED | Same aggregator class; duplicative of S2's platform inventory. |

## Included sources & findings

- **F3.1 [literature]** (tool documentation) Mainstream CP platforms (LeetCode, Codeforces, AtCoder) document practice as contest participation and curated problem-list grinding; none of the major platforms document built-in spaced-repetition scheduling or an explicit learner-retention model. Cutoff 2026-07-11. *(S2)*
- **F3.2 [literature]** (tool documentation) Spaced repetition for CP practice exists only as bolt-on community tooling (e.g., `grind`, an SM-2 CLI wrapper for LeetCode lists) — evidence the combination is conceivable and desired by some practitioners, **not** evidence of demand at product scale. Cutoff 2026-07-11. *(S1)*
- **F3.3 [existing-project research]** The prior market research found no dominant commercial product occupying "AI tutor that remembers you across sessions + queryable knowledge graph," with adjacent players either early/unpriced, domain-narrow, or infrastructure-positioned; it also documents that absence of a competitor is *not* evidence of demand. `docs/research/results/04-monetization-market-research.md` (Exec Summary #4), cutoff 2026-07-07. *(S3)*
- **F3.4 [existing-project research]** The SR niche shows real but narrow willingness-to-pay layered on free cores (AnkiHub $6–10/mo atop free Anki), per the prior research's own T1 verification. This bounds — but does not validate — the product's economic frame. Same provenance and cutoff as F3.3. *(S3)*

## Conflicts

- S1/S2 (practitioner culture: volume grinding, contest ratings as the mastery proxy) vs. RQ1/RQ2 literature (durable mastery needs spaced retrieval and schema formation): the prevailing CP practice culture and the learning-science evidence point at different practice structures. This conflict is a candidate differentiator input for NEU-898 — recorded, not adjudicated.

## Unresolved gaps

- **G3.1** No included source provides retention/outcome data for any CP practice method (platforms do not publish learning outcomes). Any claim that a CP tool "works" is unsupported by this record.
- **G3.2** Usage/adoption figures for SR-for-CP bolt-on tools were not obtainable from primary sources within the candidate cap; demand remains unmeasured. [unverified]
