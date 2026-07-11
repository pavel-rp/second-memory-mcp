# Orphan Audit, Inventory Reconciliation & Adversarial Self-Check

**Task:** NEU-899 · **Compiled:** 2026-07-11 · **Sole inputs:** NEU-898 (`../product-model/`) + NEU-897 (`../`).
This is the enforcement surface. §1 runs the orphan checks `OC-1…OC-7` (defined in `00_…` §6) and records the result of each. §2 reconciles the complete candidate inventory CAND-1…32 so nothing can disappear silently. §3 is the adversarial self-check for proxy-evidence relabeling and locally invented measurement authority. An item failing any check is **reported here and cannot silently count toward approval** (acceptance scenario 4).

---

## 1. Orphan checks

| Id | Check | Method | Result |
| --- | --- | --- | --- |
| **OC-1** | Forward-orphan (element → evidence) | Every `TR-*` record in `01_…` must carry ≥1 `REL:evidenced-by` (or an explicit charter/discipline basis for a SETTLED decision). | **PASS.** All 60 material records (J1–4, M1–4, FM1–5, P1–6, D1–4, R1–8, DEC1–5, RA1–6, EX1–6, BM-1…8, BX-1…5) carry a forward evidence source or a named decision basis. Zero forward orphans. |
| **OC-2** | Reverse-orphan (evidence → element) | Every NEU-897 `F1.1–F6.3`, `X1–X4`, `G1.1–G6.2` must be consumed by ≥1 element; reconciled 1:1 against the reverse index (`02_…` §2) and NEU-898 `04_…` §1. | **PASS.** All 11 finding groups, 4 conflicts, 13 gaps map to ≥1 element. Zero reverse orphans. G5.2 and G6.2 are consumed as *routed/discharged* entries (SUB-4 / NEU-900), not dropped. |
| **OC-3** | Candidate-orphan | Every CAND-1…32 must appear as Included (with materiality criterion) or Non-material/Routed (with retained rationale). | **PASS.** 28 Included (cross-mapped in `01_…` §5), 4 Non-material/Routed (CAND-11/12/13/21, in `05_…`), plus the non-material register items — see §2. Zero missing candidates. |
| **OC-4** | Decision-orphan | Every DEC and RA must link to its basis **and** to what it governs / was weighed against. | **PASS.** DEC1–5 each carry a basis + an `owns`/`keeps-provisional`/`excludes` edge (`01_…` §3); RA1–6 each carry a rejection basis + a `rejected-for` edge + a reopen condition. Zero decision orphans. |
| **OC-5** | Metric/signal-orphan & invented-authority | Every metric/signal (`averageQuality`, `time_spent_ms`, per-pattern mastery, any threshold/decision-rule/revision-trigger) must tie to a material element **and** a completeness state; no UNRESOLVED metric may carry a locally invented value. | **PASS.** All four signals tie to P4/R6/BM-8/FM4 and are marked UNRESOLVED under INC-2/INC-3 (`03_…` §1.4/§2). No threshold, decision rule, or revision trigger is defined anywhere in this package — searched; none present. Authority is reserved to SUB-4. |
| **OC-6** | Exclusion-orphan | Every EX and BX must carry its rationale and name the boundary it guards. | **PASS.** EX1–6 each carry a rationale + an `excludes` edge to an axis-F/A region; BX-1…5 each name their wall + governing EX (`01_…` §3–4). Zero exclusion orphans. |
| **OC-7** | Risk severity-floor (G-a) | Every High risk (R1–R5) must be present, material, and non-downgradable; none SETTLED-as-closed. | **PASS.** R1–R5 all present, all marked **High** and **non-downgradable**; R1/R3/R4 UNRESOLVED (INC-1/3/5), R2/R5 PROVISIONAL. None is SETTLED-closed. |

**All seven checks PASS.** No orphan, no invented measurement authority, no downgraded High risk.

## 2. Complete-inventory reconciliation (CAND-1…32)

Every candidate from NEU-898 `02_…`, with where it now lives in the trace structure. This is the proof for acceptance scenario 2 ("cannot disappear from the inventory silently").

| Range | Disposition | Where traced now |
| --- | --- | --- |
| CAND-1,2,4,6,8,9,22,23,24,25,26,31 | Included / Provisional | `01_…` §5 → provisional model-element records (`03_…` §1.2). |
| CAND-3,10,15,17,18,19,20 | Included, UNRESOLVED-dependent | `01_…` §5 → INC-1/INC-2/INC-3 (`03_…` §2). |
| CAND-5,7,27 | Included, INCOMPLETE (cap-bound) | `01_…` §5 → `03_…` §1.3 (EX5). |
| CAND-14,16,28,29,30,32 | Included (capability / discipline / provenance / state-level) | `01_…` §5 → SETTLED or provisional per row. |
| CAND-11,12,13,21 | Non-material / Routed | `05_…` §1 (retained non-materiality rationale + owning chapter). |
| Community sub-jobs; aggregator/anecdote sources | Non-material (below bar / routed) | `05_…` §2. |

**Reconciliation result:** 32/32 candidates present; 28 Included, 4 Non-material/Routed, plus the two non-material register classes. Count matches NEU-898 `02_…` exactly. No candidate is absent, and none can be dropped without failing OC-3.

## 3. Adversarial self-check (claim discipline)

Performed 2026-07-11 before completion, mirroring NEU-898 `04_…` §4 and NEU-897 method §6. This task's specific adversarial targets (from the verification-evidence list) are proxy-evidence relabeling and locally invented measurement authority.

- **No new content / no new evidence.** This package issued **zero** searches, reviewed **zero** new sources, and added **zero** findings. Every trace restates a NEU-898/NEU-897 link. NEU-897 caps (≤6/≤5/≤3) untouched (EX5). ✔
- **No renumbering / no contradiction.** Every element keeps its NEU-898 id, disposition, and evidence class/limitation verbatim; the only new identifiers are structural (`TR-`, `INC-`, `LINK-`, `OC-`, `REL:`) and collide with no element numbering. ✔
- **Proxy-evidence relabeling scan.** Searched all six traceability files for external-validation phrasing ("users want", "market validates", "experts confirm", "proven", "validated by", "demand for"). Occurrences exist **only** inside prohibitions (EX3), UNRESOLVED/PROVISIONAL disclaimers, or this check's own text — never as an assertion. No class-1–6 item is relabeled as class-7. D1–D4 remain provisional with the class-7 evidence each needs (INC-5). ✔
- **Locally-invented-measurement-authority scan.** No metric, threshold, decision rule, scoring protocol, revision trigger, or production replacement signal is defined anywhere here. Every such artifact is represented as an UNRESOLVED `INC-*` hole owned by SUB-4 / NEU-900 / OUT-7, with an UNBOUND `LINK-*` slot (`03_…` §2–3). OC-5 confirms zero invented values. ✔
- **Completeness-state integrity.** Every state in `03_…` is derived mechanically (`00_…` §5) and cites its NEU-898 source line; UNRESOLVED is used only for missing downstream artifacts, never as a synonym for PROVISIONAL evidence-insufficiency. ✔
- **Severity-floor integrity (G-a).** OC-7 confirms R1–R5 non-downgradable; no candidate touching a High risk is marked non-material (checked against `05_…`). ✔
- **Bidirectional walkability.** For a sampled requirement (BM-2) and a sampled decision (RA5): BM-2 → (`01_…`) evidence F1.1–F1.3/F6.2, class 1, limitation G1.1 → (`02_…` §2) reverse index lists BM-2 under F1.1–F1.3 and F6.2 → reverse-anchor index (`02_…` §3) reaches BM-2 from "retain & transfer over months". RA5 → basis F5.1–F5.3/G5.1 → reverse index lists RA5 under F5.1–F5.3 → reverse-anchor index reaches RA5 from "trust AI grading as signal of record", with reopen condition INC-3. Both walkable in both directions with no undocumented context. ✔
- **Adjudication boundary.** No mutable STATUS is adjudicated here; promotion/demotion of any element is explicitly reserved to NEU-906 via LINK-4 (`03_…` §3 binding protocol). ✔

**Result:** all orphan checks pass, the inventory reconciles 32/32, no proxy is relabeled as validation, and no measurement authority is locally invented. The structure is prompt-ready for NEU-900, SUB-4, NEU-906, and NEU-907 to bind their artifacts without renumbering.
