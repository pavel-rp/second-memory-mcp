# Decision-Status Register (OUT-5 · mutable status per hypothesis/requirement)

**Task:** NEU-906 · **Compiled:** 2026-07-12 · **Evidence adjudication:** `01_…` · **Rule versions:** `00_…` §2.
The mutable-status ledger. §1 sets **decision status per material hypothesis**. §2 is the **full element inventory** — every material element carries *evidence status* + *decision status* + applicable `MC-*`+version + `INC-*`/`LINK-*` marker + confidence limitation, so **zero elements are unadjudicated** (the acceptance bar). §3 confirms the High-risk severity floor. §4 records the proxy-replacement state per accepted proxy. §5 is the open-states honesty section. **`accepted` is reserved for the MC-11 audit-settled set; no empirical element is `accepted` (agreement between creator and AI is not external validity).**

---

## 1. Decision status per material hypothesis (H-*)

| Hypothesis | Contract (v1.0) | Evidence status (`01_…`) | **Decision status** | Confidence limitation carried |
| --- | --- | --- | --- | --- |
| **H-B1** spaced retention holds a learned DP pattern | MC-1 (+ MC-9 for the in-domain effect) | `PROXY-DIRECTIONAL-PRESENT` (class-3 RETRO + class-6 corroboration; unanimous class-4 `supports`) | **provisional** (retention-holds *direction* present) · the DP in-domain **transfer/effect** half is **unresolved** (INC-1, non-downgradable via R1) | n=1; retrospective, **not pre-registered**; pooled-across-chunks (not a single tracked pattern); class-4 agreement ≠ external validity; no effect size (G1.1). |
| **H-B2** rating-driven learner abandons spaced review (adherence collapse) | MC-5 | `PROXY-DIRECTIONAL-PRESENT` (failure *shape*, n=1) + `CLASS-7-ABSENT` (prevalence) | **provisional** (failure *shape* present) · **prevalence unresolved** (INC-5, CLASS-7) · R5 (High) non-downgradable | n=1 cannot represent a population; retrospective; **no market/demand/preference/prevalence claim** (EX3/BX-3); log window post-dates sharpest swings. |
| **H-F1** schema transfer beats surface memorization | MC-2 | `INSUFFICIENT-EVIDENCE` (no transfer probe → not isolable) | **unresolved** (INC-1; carried `incomplete`) · BM-7 reversal **INCOMPLETE** (cap-bound G2.1) | Transfer not isolable without a novel-instance probe; n=1; expertise-reversal not exercisable. |
| **H-F2** long-gap decay/relapse + hierarchical scheduling | MC-3 | `INSUFFICIENT-EVIDENCE` (decay *shape* pooled, not per-pattern) | **unresolved** (INC-1; carried `incomplete`) · BM-3 optimum **INCOMPLETE** (cap-bound G1.2, COLLECTION-GAP) | Pooled decay ≠ single-pattern curve; low consecutive-failure rate cuts against naive relapse; optimal schedule not computable within caps. |
| **H-F3** AI grading over-validates a shallow/wrong DP answer → false confidence | MC-4 | `PROXY-BOUNDING-PRESENT` (over-validation stable 3/3 on INCOMPLETE archetype; shallow/wrong correctly failed) | **contradicted (as literally worded)** — shallow/wrong not over-validated · **FM4/BM-5/R3 remain `unresolved` (INC-3), reinforced, non-downgradable** · reformulation flagged + routed | Bounded to the probed items + this grader model/version; **no rate, no DP-grading reliability** (G5.1); FM4 lands on the INCOMPLETE (correct-core-omitted-rigor) archetype, not shallow/wrong. |

**H-F3 discipline (the notable verdict).** The `contradicted` status applies **only** to H-F3's literal wording. It **does not** propagate to FM4, BM-5, or R3: the MC-4 v1.0 BOUNDING rule fired correctly and found a **real** over-validation on a valid adversarial archetype, which **reinforces** R3 (grading unreliable) and **reaffirms RA5** (AI grading is not the signal of record). R3 stays UNRESOLVED and non-downgradable. NEU-906 **records** that H-F3 should be reformulated/split to name the INCOMPLETE archetype and **routes** it to NEU-907; it does **not** rewrite the hypothesis (out of scope).

## 2. Full element inventory (zero unadjudicated)

Evidence-status abbreviations per `00_…` §4. `Rule` = applicable frozen contract (all `v1.0`). Decision status ∈ {accepted, provisional, withheld, contradicted, unresolved}. `INC/LINK` = artifact marker.

### 2.1 Jobs (J), motivations (M)

| Element | Rule | Evidence status | Decision status | INC/LINK | Limitation |
| --- | --- | --- | --- | --- | --- |
| J1, J3 | MC-11 context | class-1 documented job | provisional | INC-5 (weighting) | Community doc, not measured; ranking class-7 (G6.1). |
| J2 | MC-2 context | class-1 | provisional | — (G2.2) | DP worked-example evidence is a gap. |
| J4 (durable mastery — thesis job) | MC-1/MC-9 | `PROXY-DIRECTIONAL-PRESENT` | provisional | INC-1 | Mechanism-backed; that this learner ranks J4 first is class-7. |
| M1–M4 | MC-5/MC-10 | `CLASS-7-ABSENT` | unresolved | INC-5 | Motivation distribution/weighting is class-7; not a finding. |

### 2.2 Failure modes (FM)

| Element | Rule | Evidence status | Decision status | INC/LINK | Limitation |
| --- | --- | --- | --- | --- | --- |
| FM1 (forgetting after grind) | MC-1/MC-3 | `PROXY-DIRECTIONAL-PRESENT` | provisional | INC-1 | Population-general mechanism; dominance is class-7. |
| FM2 (shallow/misgeneralized schema) | MC-2 | `INSUFFICIENT-EVIDENCE` | unresolved | INC-1 | Transfer not isolable (no probe); reversal unverified. |
| FM3 (mis-scheduled hierarchical review) | MC-3 | `INCOMPLETE` (cap-bound) | unresolved | INC-2/G1.2 | Optimal schedule unanswerable within caps (EX5). |
| FM4 (AI over-validation → false confidence) | MC-4 | `PROXY-BOUNDING-PRESENT` | unresolved (present-bounded on INCOMPLETE archetype) | INC-3 | Bounded, this grader/version; no rate/reliability; **non-downgradable via R3**. |
| FM5 (adherence collapse) | MC-5 | `PROXY-DIRECTIONAL-PRESENT` (shape) | provisional (shape) · prevalence unresolved | INC-5 | Shape at n=1; prevalence class-7; **non-downgradable via R5**. |

### 2.3 Principles (P), differentiators (D)

| Element | Rule | Evidence status | Decision status | INC/LINK | Limitation |
| --- | --- | --- | --- | --- | --- |
| P1 (optimize durable retention/transfer) | MC-1/MC-9 | `PROXY-DIRECTIONAL-PRESENT` | provisional | INC-1 | Direction only; effect size is G1.1. |
| P2 (retention & transfer both required) | MC-2 | `INSUFFICIENT-EVIDENCE` | provisional (principle) · transfer half unresolved | INC-1 | Interaction untested (G2.3); transfer not isolated. |
| P3 (evidence-label mastery signals) | MC-11 | `NON-MEASURED-SETTLED` | **accepted** | — | Discipline decision (DEC2), audit-verified. |
| P4 (measure only what is computable; verify per signal) | MC-11 (+ MC-6/7/8) | `NON-MEASURED-SETTLED` discipline · per-signal `COLLECTION-GAP` | **accepted** (discipline) · per-signal feasibility unresolved | INC-2 | Discipline settled; per-signal feasibility open. |
| P5 (never expose raw payloads; aggregate-only logs) | MC-11 | `NON-MEASURED-SETTLED` | **accepted** | — | Privacy gate verified (`02_…`, `../measurement-contracts/05_…`). |
| P6 (keep gaps visible/provisional) | MC-11 | `NON-MEASURED-SETTLED` | **accepted** | — | Discipline decision (DEC3). |
| D1 (built-in retention model differentiator) | MC-10 | `CLASS-7-ABSENT` (demand) | provisional (positioning) · demand unresolved | INC-5 | Landscape gap ≠ demand; confirmation class-7 (DEC4). |
| D2 (transfer-oriented schema building) | MC-2 | `INSUFFICIENT-EVIDENCE` | provisional | INC-1 | Literatures disjoint (G2.3); interaction untested. |
| D3 (evidence-labeled gap-honest signals) | MC-4/MC-11 | `NON-MEASURED-SETTLED` (property) | provisional (value-to-learners class-7) | INC-5 | Value to learners is class-7 preference. |
| D4 (reuse SR + memory-graph substrate) | MC-11 | `NON-MEASURED-SETTLED` (capability-only) | provisional (capability-only) | — | Capability ≠ product-fit (R8). |

### 2.4 Decisions (DEC), rejected alternatives (RA), exclusions (EX), boundary walls (BX)

| Element | Rule | Evidence status | Decision status | Limitation |
| --- | --- | --- | --- | --- |
| DEC1–DEC5 | MC-11 | `NON-MEASURED-SETTLED` | **accepted** | Scope/process/discipline decisions, audit-verified. |
| RA1–RA6 | MC-11 (RA5 also MC-4) | `NON-MEASURED-SETTLED` | **accepted** (rejected-and-recorded) | Each names its reopen condition; **RA5 reaffirmed** by the MC-4 over-validation finding. |
| EX1–EX6 | MC-11 | `NON-MEASURED-SETTLED` | **accepted** | Charter/scope/privacy walls. |
| BX-1–BX-5 | MC-11 | `NON-MEASURED-SETTLED` | **accepted** | Exclusion-boundary walls; EX3/BX-3 (no market claim) actively enforced this stage. |

### 2.5 Risks (R)

| Element | Sev | Rule | Evidence status | Decision status | INC/LINK | Non-downgradable? |
| --- | --- | --- | --- | --- | --- | --- |
| R1 (mechanism may not transfer to DP) | High | MC-9 | `UNRESOLVED` | **unresolved** | INC-1 | ✅ (G-a) |
| R2 (retention without transfer) | High | MC-2 | `INSUFFICIENT-EVIDENCE` | **provisional** | INC-1 | ✅ (G-a) |
| R3 (AI grading unreliable → false confidence) | High | MC-4 | `PROXY-BOUNDING-PRESENT` (reinforcing) | **unresolved** | INC-3 | ✅ (G-a) |
| R4 (no demand) | High | MC-10 | `CLASS-7-ABSENT` | **unresolved** | INC-5 | ✅ (G-a) |
| R5 (adherence collapse) | High | MC-5 | `PROXY-DIRECTIONAL-PRESENT` (shape) | **provisional** (shape) · prevalence **unresolved** | INC-5 | ✅ (G-a) |
| R6 (signal feasibility gap) | Med | MC-6 | `CONFIRMED-CLASS-2` (gap real) / `COLLECTION-GAP` (signal) | **unresolved** | INC-2 | — |
| R7 (mis-scheduling hierarchical) | Med | MC-3 | `INCOMPLETE` (cap-bound) | **unresolved** | INC-2/G1.2 | — |
| R8 (over-reliance on codebase as validated) | Med | MC-11 | `NON-MEASURED-SETTLED` (capability-only) | **provisional** | — | — |

### 2.6 Benchmark-state cells (BM)

| Cell | Rule | Evidence status | Decision status | INC/LINK |
| --- | --- | --- | --- | --- |
| BM-1 (first pattern; surface vs schema) | MC-2 | `INSUFFICIENT-EVIDENCE` | unresolved | INC-1 |
| BM-2 (hold pattern by spaced retrieval) | MC-1 | `PROXY-DIRECTIONAL-PRESENT` | provisional | INC-1 |
| BM-3 (hierarchical scheduling optimum) | MC-3 | `INCOMPLETE` (COLLECTION-GAP) | unresolved | INC-2/G1.2 |
| BM-4 (long-gap decay/relapse) | MC-3 | `INSUFFICIENT-EVIDENCE` (pooled) | unresolved | INC-1 |
| BM-5 (over-validated wrong/shallow answer) | MC-4 | `PROXY-BOUNDING-PRESENT` (on INCOMPLETE archetype) | unresolved (present-bounded) | INC-3 |
| BM-6 (grind volume, abandons review) | MC-5 | `PROXY-DIRECTIONAL-PRESENT` (shape) | provisional (shape) · prevalence unresolved | INC-5 |
| BM-7 (expertise-reversal) | MC-2 | `INCOMPLETE` (cap-bound G2.1) | unresolved | INC-2/G2.1 |
| BM-8 (wants per-pattern mastery signal; none computed) | MC-6 | `CONFIRMED-CLASS-2` (none today) / `COLLECTION-GAP` | unresolved | INC-2 |

### 2.7 Signals & candidates

| Element | Rule | Evidence status | Decision status | INC/LINK |
| --- | --- | --- | --- | --- |
| `averageQuality` (CAND-15) | MC-7 | `COLLECTION-GAP` (hardcoded `0`, class-2) | unresolved | INC-2 |
| `time_spent_ms` (CAND-18) | MC-8 | `COLLECTION-GAP` (reliability uncharacterized) | unresolved | INC-2 (PLA-3) |
| per-pattern mastery (CAND-17) | MC-6 | `COLLECTION-GAP` | unresolved | INC-2 |
| CAND-1/2/3/4/5/6/22/23/24/25/26/31 | inherit governing element | inherit | inherit (provisional/unresolved) | inherit |
| CAND-7/27 | MC-3/MC-5 | `INCOMPLETE` (cap-bound) | unresolved | G1.2/G6.1 |
| CAND-8/9/10 | MC-10 | `CLASS-7-ABSENT` / landscape | provisional (D1) · demand unresolved (CAND-10/R4) | INC-5 |
| CAND-16/29/30/32 | MC-11 | `NON-MEASURED-SETTLED` | **accepted** (privacy/discipline/caps/provenance) | — |
| CAND-14/19/20/28 | MC-4/MC-6 | inherit | provisional→unresolved (INC-2/INC-3); CAND-28 journey-suite → provisional | INC-2/INC-3 |

**Candidate reconciliation:** every CAND-1…32 is adjudicated above either directly or by inheriting its governing element's status (`../traceability/01_…` §5 cross-map). None is absent (OC-3, `05_…`).

## 3. High-risk severity-floor confirmation (`OC-7`)

| Risk | Present & material? | SETTLED-as-closed? | Downgraded? | Status this stage |
| --- | --- | --- | --- | --- |
| R1 | ✅ | ❌ never | ❌ | unresolved (INC-1) |
| R2 | ✅ | ❌ | ❌ | provisional |
| R3 | ✅ | ❌ | ❌ (over-validation finding **reinforces** it) | unresolved (INC-3) |
| R4 | ✅ | ❌ | ❌ | unresolved (INC-5) |
| R5 | ✅ | ❌ | ❌ (adherence *shape* does not settle prevalence) | provisional/unresolved (INC-5) |

**No High risk is accepted-as-closed or downgraded.** The only status movement any High risk could take is on new correctly-classed evidence, which this stage does not supply.

## 4. Proxy-replacement state per accepted proxy (summary; dry-run in `04_…`)

| Proxy (MC / status) | Replacement (`PRX-*`) | Current proxy-replacement state |
| --- | --- | --- |
| MC-1 retention `PROXY-DIRECTIONAL-PRESENT` | PRX-1 (class-6 cohort retention) | **awaiting-replacement** — proxy stands; class-6/7 signal not yet available. |
| MC-2 transfer `INSUFFICIENT-EVIDENCE` | PRX-2 (class-6/7 novel-problem transfer) | **awaiting-evidence** — no probe run; replacement would be first real signal. |
| MC-4 over-validation `PROXY-BOUNDING-PRESENT` | PRX-4 (class-5 OUT-7 reliability bound) | **partially-exercised** — bounding present; reliability *rate/bound* still owed (INC-3). |
| MC-5 adherence `PROXY-DIRECTIONAL-PRESENT` (shape) | PRX-5 (class-7 adherence rate) | **awaiting-replacement** — shape only; prevalence class-7. |
| MC-6/7/8 signals `COLLECTION-GAP` | PRX-6/PRX-7 | **uncollectible** — telemetry does not exist yet. |
| MC-10 demand `CLASS-7-ABSENT` | PRX-8 (class-7 demand) | **uncollectible** — future real-user program only. |

## 5. Open-states honesty (mandated handling)

- **INC-1 (BM-2 settled result / DP transfer effect).** The BM-2 retention *proxy* is `PROXY-DIRECTIONAL-PRESENT`, but the **settled in-domain DP transfer/effect result is `UNRESOLVED` via INC-1** and owned by the NEU-900 benchmark suite. The present-leaning proxy does **not** settle BM-2's transfer claim or move R1. No effect size is asserted.
- **INC-5 / CLASS-7-DEFERRED (BM-6 prevalence).** The BM-6 adherence-collapse *shape* is present at n=1; **prevalence is `CLASS-7-ABSENT` via INC-5** — no market/demand/preference/prevalence conclusion is drawn (EX3/BX-3). R5 (High) is non-downgradable regardless.
- **Retrospective-evidence limitations (n=1, not pre-registered).** All class-3 RETRO evidence (BM-2/BM-6/F1/F2) is n=1, retrospective, **not pre-registered**, and (for BM-2/BM-4) **pooled-across-chunks** rather than a single tracked pattern. These are fidelity **downgrades**, carried into every status above, never smoothed into a stronger claim. Two AI reviewers agreeing is class-4↔class-3 corroboration, **not external validity**.
- **Over-validation finding under its frozen decision rule.** Stable 3/3 over-validation on the INCOMPLETE archetype = FM4 **present (bounded)** under MC-4 v1.0 — a real, rule-compliant finding that **reinforces R3** and **reaffirms RA5**, while H-F3-as-worded is `contradicted`. **No rate, no reliability, no threshold** is inferred (INC-3 remains the owed artifact). MC-4 is **not** invalidated; no rerun/new version is required by this task.
