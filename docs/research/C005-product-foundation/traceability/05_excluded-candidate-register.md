# Excluded-Candidate Register

**Task:** NEU-899 · **Compiled:** 2026-07-11 · **Sole inputs:** NEU-898 (`../product-model/`) + NEU-897 (`../`).
Every research-discovered candidate that is **not** a material product-foundation element is registered here with its **retained non-materiality criterion**, so an included/excluded candidate's status is always traceable and **no candidate can disappear from the inventory silently** (acceptance scenario 2; enforced by `04_…` OC-3). Exclusion here means *non-material for the product foundation* — most are **material elsewhere** and are routed to the owning chapter, not discarded. Recording a candidate here is **not** an adjudication that it is closed; a candidate can re-enter the material inventory only through the same materiality and trace rules (NEU-898 `02_…`), never by silent omission.

---

## 1. Routed / non-material candidates (CAND-*)

| CAND | Candidate | Non-materiality criterion (retained verbatim from NEU-898) | Owning chapter / re-entry rule |
| --- | --- | --- | --- |
| **CAND-11** | Willingness-to-pay / pricing depth. | Routed to the monetization chapter; also a class-7 question (EX3). Non-material *here* — no product-foundation element depends on a pricing value. | Monetization chapter. Re-enters only with correctly-classed evidence under the materiality rule; **never** as a validated-demand claim (EX3). |
| **CAND-12** | DP curriculum sequencing (which patterns, what order). | Routed to the curriculum chapter (EX4). Non-material here — the product foundation fixes *who/what defeats mastery*, not the sequence. | Curriculum chapter. Re-enters if a sequencing decision would change a material element (materiality rule clause 1–6). |
| **CAND-13** | UI modality (chat vs IDE vs web). | Routed to the UI chapter (EX4). Non-material here. | UI chapter. Same re-entry rule. |
| **CAND-21** | Trustworthy-AI-grading **measurement design**. | Routed to the measurement-contract task **SUB-4** (NEU-899+). Material *there*, not here — this task owns trace structure, not the measurement contract. | SUB-4. Its authoritative artifact binds via LINK-2 (`03_…` §3) and resolves INC-2/INC-3; it does **not** re-enter as a product-foundation element. |

## 2. Below-the-bar / scope-routed non-material register (non-CAND)

Recorded in NEU-898 `02_…` §3; retained here so the exclusion is auditable, not silent.

| Item | Non-materiality criterion | Rule |
| --- | --- | --- |
| **Community sub-jobs** — contest logistics, editorial/solution reading, social/team practice (from RQ6 F6.1). | Workflow/UI scope (EX4); **no** product-foundation element (J/M/FM/P/D/R/DEC) depends on them. | Routed to workflow/UI chapters. Re-enters only if one would change a material element. |
| **Aggregator / anecdote sources** — e.g. `brandon-gong/grind` (n≈1), Medium / GeeksforGeeks listicles (RQ6 C4/C5). | Below the NEU-897 evidence bar; **never included** as evidence for any claim. | Permanently below-bar; would need a correctly-classed replacement source to contribute anything. |

## 3. Why an excluded candidate cannot silently vanish

1. **Presence is mandatory.** `04_…` OC-3 fails if any CAND-1…32 is absent from either the Included cross-map (`01_…` §5) or this register — so dropping a candidate is a detectable audit failure, not a silent edit.
2. **Criterion is retained, not summarized away.** Each row keeps the *specific* reason it is non-material (routed-to-chapter vs below-bar), so a reviewer can challenge the classification directly.
3. **Re-entry is gated, not free.** A non-material candidate becomes material again only by satisfying the materiality rule (NEU-898 `02_…` §1, clauses 1–6 / guardrails G-a…G-c) with correctly-classed evidence — the same gate every candidate passed. A High/Critical-risk-touching candidate can never be routed to non-material (G-a); none in this register touches a High risk (checked in `04_…` §3).
4. **Routing is a link, not a deletion.** "Routed" candidates carry a `REL:routed-to` edge (`00_…` §3) to their owning chapter; the chapter `owns` them. The candidate stays in the inventory with a live pointer, so downstream work can always find and reclaim it.
