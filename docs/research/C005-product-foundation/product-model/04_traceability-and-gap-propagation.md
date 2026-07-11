# Traceability, Gap Propagation & Adversarial Self-Check

**Task:** NEU-898 · **Compiled:** 2026-07-11 · **Sole evidence source:** NEU-897 package (`../`).
This is the audit surface. §1 proves every NEU-897 evidence item is consumed and every model element traces back; §2 propagates every unresolved gap into the elements it keeps provisional; §3 is the provisional/incomplete register; §4 is the adversarial self-check (mirrors `../03_synthesis.md` §4).

---

## 1. Evidence-trace index (NEU-897 item → model element, with class & limitation)

Every NEU-897 finding, conflict, and gap appears exactly once below with the model element(s) it feeds. This is the completeness proof for acceptance scenario 1 (nothing undocumented) and the inventory audit hook (`02_…` §3).

### 1.1 Findings → elements

| NEU-897 item | Class | Structural limitation (carried) | Consumed by |
| --- | --- | --- | --- |
| F1.1–F1.3 retrieval+spacing retention/transfer | [literature] | Populations/tasks ≠ this DP product; transfer < retention | P1, P2, J4, FM1, CAND-1, BM-2, BM-4 |
| F1.4 repo pedagogy audit (thresholds diverge) | [literature] via repo research | Parameter choices uncertified by mechanism support | FM3, R7 |
| F2.1–F2.3 worked examples / subgoals / schema | [literature] | Strongest on novices; DP-specific gap | P2, D2, J2, FM2, CAND-4, BM-1, BM-7 |
| F3.1–F3.2 CP platforms optimize volume, SR niche | [literature] tool-doc | Documents landscape, not demand | D1, RA2, CAND-8/9, BM-6 |
| F3.3 uncrowded niche ≠ demand | [literature] | Empty niche is not evidence of demand | D1, D3, EX3, R4, RA6, CAND-10 |
| F4.1–F4.3 per-attempt data persisted; `averageQuality` uncomputed | [code-evidence] | Capability ≠ pedagogical validity; verify per signal | P4, D4, R6, CAND-14/15, BM-8 |
| F4.4 responses unredacted in logs | [code-evidence] | Aggregate-only provenance required | P5, EX6, CAND-16 |
| F5.1–F5.3 LLM-judge bias; tutor over-validation | [literature] + repo research | Not human validation; config-sensitive | P3, D3, FM4, R3, RA5, CAND-19, BM-5 |
| F6.1 documented jobs (rating/patterns/interview), grind culture | [literature] community-doc | Not a measured motivation study | J1–J3, RA2, CAND-22/24, BM-6 |
| F6.2 population-general forgetting | [literature] | Mechanism-level, not product-population | FM1, J4, CAND-23, BM-2/4 |
| F6.3 positioning frame; "no demand evidence" | [existing-project research] | Cutoff 2026-07-07; not demand evidence | D1, EX3, R4, CAND-10/32 |

### 1.2 Conflicts → elements (preserved, not adjudicated)

| NEU-897 conflict | Carried into |
| --- | --- |
| X1 retention ≠ transfer | P2, FM2, R2, CAND-2, BM-1/2/4, axis E1 |
| X2 expertise-reversal (novice-biased worked examples) | FM2 limitation, RA4, CAND-5, BM-7, axis E2 |
| X3 documented culture vs evidence practice | RA2, FM5 context, CAND-24, BM-6, axis E3 |
| X4 AI-judge transfer to DP grading | FM4, R3, CAND-19, BM-5, axis E4 |

### 1.3 Gaps → elements (each keeps its element provisional/incomplete — see §2)

| NEU-897 gap | Carried into |
| --- | --- |
| G1.1 DP-domain retrieval/spacing effect unmeasured | R1, CAND-3, BM-1/2/4 (provisional) |
| G1.2 hierarchical spacing schedule (incomplete scope) | FM3, R7, CAND-7, BM-3 (incomplete) |
| G2.1 expertise-reversal boundary (incomplete scope) | FM2 limitation, RA4, CAND-5, BM-7 (provisional/incomplete) |
| G2.2 worked-example evidence for DP specifically | J2 limitation, D2 |
| G2.3 retrieval × worked-example interaction | P2, D2, CAND-6, BM-1 (provisional) |
| G3.1 no outcome data for CP methods | R1 context, FM1 population limit |
| G3.2 demand for SR-for-CP unmeasured | R4, EX3, D1 |
| G4.1 `time_spent_ms` real-usage reliability | R6, CAND-18 (needs OUT-4 gate) |
| G4.2 no per-DP-pattern mastery signal | R6, CAND-17, BM-8 (provisional) |
| G5.1 LLM grading reliability on algorithmic solutions | R3, FM4 limitation, CAND-20, BM-5 (provisional) |
| G5.2 trustworthy-AI-grading measurement design | CAND-21 (routed → NEU-899+) |
| G6.1 no direct jobs/motivations study (incomplete scope) | M1–M4 provisionality, FM5, R5, CAND-27, BM-6 |
| G6.2 persona/benchmark-journey construction | `03_…` matrix (state-level; journey suite routed → NEU-900) |

**Every NEU-897 F/X/G item above is consumed.** No finding, conflict, or gap is dropped; the reverse direction (each model element cites its trace) is enforced inline in `00_…`–`03_…`.

## 2. Propagated unresolved-gap inventory

Per acceptance scenario 3 and P6/DEC3: an unresolved NEU-897 gap that could change a material element keeps that element **provisional** or **incomplete**; no new research is started here to close it (EX5).

| Gap | Elements held provisional/incomplete | Earliest owner (from NEU-897) | This task's action |
| --- | --- | --- | --- |
| G1.1 | R1 (High), CAND-3, BM-1/2/4, P1 effect-size | later chapters / class-7 | Marked provisional; R1 non-downgradable. |
| G1.2 | FM3, R7, CAND-7, BM-3 | future research batch | Marked **incomplete**; no new schedule research (EX5). |
| G2.1 | FM2 limitation, RA4, CAND-5, BM-7 | future research batch | Provisional; novice caveat retained. |
| G2.2 | J2, D2 | later chapters | Provisional differentiator. |
| G2.3 | P2, D2, CAND-6, BM-1 | future research batch | Provisional; combination untested. |
| G3.2 | R4 (High), D1, EX3 | class-7 | Held open; no market claim (EX3). |
| G4.1 / G4.2 | R6, CAND-17/18, BM-8 | later chapters / OUT-4 gate | Provisional; per-signal verification required. |
| G5.1 | R3 (High), FM4, CAND-20, BM-5 | later chapters (OUT-7 automated-eval) | Provisional; AI grading not trusted (RA5). |
| G6.1 | M1–M4, FM5, R5 (High), CAND-27, BM-6 | future batch / class-7 | Provisional; motivation weighting reserved for class-7. |
| G6.2 | `03_…` matrix | NEU-898 (this task) | Discharged at **state** level; journey-suite selection routed → NEU-900. |

**High/Critical risks touching an open gap (R1, R3, R4, R5)** remain material and non-downgradable (materiality rule G-a); each is held open with the correctly-classed evidence that would resolve it, never asserted as settled.

## 3. Provisional / incomplete register

Elements this model explicitly does **not** present as settled:

- **Provisional (evidence exists but is insufficient / class-7-dependent):** M1–M4 (motivation weighting); D1–D4 (all differentiators); CAND-2, CAND-3, CAND-5, CAND-6, CAND-10, CAND-17, CAND-18, CAND-20, CAND-25, CAND-31; BM-1, BM-2, BM-4, BM-5, BM-7, BM-8; risks R1–R5 (High, held open).
- **Incomplete (cap-bound; would need new research barred by EX5):** CAND-7 / FM3 / R7 / BM-3 (hierarchical spacing schedule, G1.2); CAND-5 / G2.1 slice (expertise-reversal); CAND-27 (direct jobs/motivations study, G6.1).
- **Settled at product altitude (decisions this task is entitled to make):** DEC1–DEC5; EX1–EX6; the prerequisite boundary; the materiality rule.

## 4. Adversarial self-check (claim discipline)

Performed 2026-07-11 before completion, mirroring `../03_synthesis.md` §4 and method §6.

- **No new research / caps intact.** This task issued **zero** new searches and reviewed **zero** new candidate sources; it consumes only NEU-897's already-included evidence. NEU-897's caps (≤6 questions / ≤5 reviewed / ≤3 included) are untouched (EX5). ✔
- **Evidence-label integrity.** Every asserted claim carries a NEU-897 trace and inherits that item's class and limitation (§1). Classes 3 (dogfooding), 5 (automated-eval), 6 (operational-log), 7 (real-user) contribute **zero** findings — as in NEU-897, by design; class 7 does not exist. ✔
- **Forbidden-phrasing scan.** Searched all five product-model files for external-validation phrasing ("users want", "market validates", "experts confirm", "proven", "validated by", "demand for"). Occurrences exist **only** inside prohibitions (EX3, taxonomy #3), provisional-status disclaimers, or this check's own description — never as an assertion. Differentiators D1–D4 are each explicitly labeled provisional with the class-7 evidence they need. ✔
- **Decision-altitude scan.** No sentence selects a pedagogy, curriculum, tutoring protocol, UI, architecture, provider, or telemetry design. Decisions taken (DEC1–DEC5) are product-foundation/discipline decisions only; every downstream design choice is routed via EX4 and the "routed" dispositions in `02_…`. ✔
- **Materiality / severity guardrail.** All High risks (R1–R5) are classified material and non-downgradable; no candidate touching a High/Critical risk is marked non-material (materiality rule G-a). The non-material register (`02_…` §3) contains only routed or below-bar items. ✔
- **Gap-propagation check.** Every NEU-897 gap G1.1–G6.2 maps to at least one element held provisional/incomplete (§2); no gap was silently resolved. G6.2 is the only gap this task discharges, and only at the state level, with journey-suite selection explicitly deferred to NEU-900. ✔
- **Privacy scan.** No raw log payloads, learner responses, or payload excerpts anywhere; the only log-related content is the aggregate-only constraint (P5/EX6). ✔
- **Completeness cross-check.** §1 lists every NEU-897 F/X/G item with a consumer; the candidate inventory (`02_…`) is complete against the same set. An independent reviewer can walk NEU-897 → this index → model element with no undocumented context (acceptance scenario 1). ✔
