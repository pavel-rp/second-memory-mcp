# C005 Product-Foundation — Gate Battery Report

**Task:** NEU-907 (final consolidation · OUT-6) · **Compiled:** 2026-07-12
**Method:** consolidation **by citation**. Each gate maps to the artifact that already ran it under its owning sub-task; this report **re-adjudicates nothing** and creates no new evidence. Where a gate can pass only under a recorded condition, it is marked **CONDITIONAL-PASS** with the condition stated — never silently passed.

## Summary

| # | Gate | Verdict |
| --- | --- | --- |
| G1 | Package completeness | PASS |
| G2 | Bounded-research / evidence-search reproducibility | PASS |
| G3 | Requirement-and-decision → contract mapping | PASS |
| G4 | Benchmark coverage | **CONDITIONAL-PASS** |
| G5 | Automated-eval coverage + clean-context repeatability | **CONDITIONAL-PASS** |
| G6 | AI-review-independence audit | PASS |
| G7 | Operational-log privacy + sensitive-content scan | PASS |
| G8 | Bidirectional trace + orphan audit | PASS |
| G9 | Measurement-authority + adjudication completeness | PASS |
| G10 | Adversarial unsupported-claims audit | PASS |
| G11 | Remaining INC-1…5 accounting | PASS (holes explicitly open) |

**Tally: 9 PASS · 2 CONDITIONAL-PASS · 0 FAIL.** No gate fails; the two conditionals are both the same recorded reality — journeys were resolved via the versioned **v1.1 vehicle revision** (retrospective, privacy-gated production-DB aggregates) rather than live pre-registered runs, and two material cells (BM-3, BM-7) remain honestly INCOMPLETE.

---

## G1 — Package completeness · PASS

Every sub-package of the corpus is present at the synced `origin/develop` HEAD, each with its own `README.md`, plus the NEU-907 consolidation layer:

- Root synthesis (NEU-897): `00_method-and-provenance.md`, `01_evidence-taxonomy.md`, `02_research-questions.md`, `03_synthesis.md`, `04_caps-and-incomplete-scope.md`, `questions/RQ1…RQ6.md`.
- `product-model/` (NEU-898), `traceability/` (NEU-899), `measurement-contracts/` (NEU-901), `automated-evaluation/` (NEU-902), `autoeval-batch/` (NEU-903), `benchmark-suite/` (NEU-900), `baseline-batch/` (NEU-904), `failure-batch/` (NEU-905), `adjudication/` (NEU-906).
- Consolidation (NEU-907): `README.md` (master index), `00_vocabulary.md`, `00_hypothesis-reformulations.md`, `00_gates-report.md` (this file), `00_dry-run-handoff.md`.

**Condition:** none. LINK-5 (consolidated package) is now bound by this layer.

## G2 — Bounded-research / evidence-search reproducibility · PASS

The research synthesis is reproducible by construction: fixed caps (≤6 questions / ≤5 candidates / ≤3 included), recorded search interfaces + exact queries + cutoff dates, and a stated source-selection rule (`00_method-and-provenance.md`; per-question ledgers in `questions/RQ*.md`; caps ledger in `04_caps-and-incomplete-scope.md`). The automated batch is separately reproducible: 12/12 identical verdicts across three isolated runs (`autoeval-batch/04_repeat-comparison-and-integrity.md`). **Condition:** none (see G5 for the seed caveat scoped to the automated batch).

## G3 — Requirement-and-decision → contract mapping · PASS

The RDM gate inventories every material requirement/decision and maps each to ≥1 testable hypothesis + a frozen `MC-* v1.0` contract (or an explicit NON-MEASURED-SETTLED / CLASS-7-DEFERRED / COLLECTION-GAP disposition). `GATE-STATE = PASS` at freeze v1.0: unmapped material items = 0; High risks parked in NON-MEASURED-SETTLED = 0; every element family (P/D/J/M/FM/R/DEC/RA/EX/BX/BM) and journey-closure row = PASS. **Source:** `measurement-contracts/03_requirement-decision-mapping-gate.md`. **Condition:** none.

## G4 — Benchmark coverage · CONDITIONAL-PASS

All **8/8 material BM cells (BM-1…BM-8)** are covered, each by exactly one journey in exactly one batch, with 0 uncovered (`benchmark-suite/00_selection-and-coverage.md` §3). Batches are disjoint and were shipped sequentially (BATCH-BASELINE → NEU-904, BATCH-FAILURE → NEU-905).

**Conditions (why not an unconditional PASS):**
1. **Journeys resolved via the v1.1 vehicle revision, not live pre-registered runs.** At execution the creator was unavailable and the live MCP tools were unreachable; JNY-B1(BM-2)/B2/F1/F2 were executed as **retrospective, privacy-gated production-DB aggregates + verbatim creator testimony** under the versioned v1.1 revision (`baseline-batch/06_…`, `failure-batch/01_…`). This is a fidelity **downgrade, not a coverage gap** — recorded as separate class-3 RETRO + class-6 records, n=1, not pre-registered.
2. **Two cells honestly INCOMPLETE:** BM-3 (hierarchical-scheduling optimum, cap-bound G1.2) and BM-7 (expertise-reversal, not exercisable) — carried INCOMPLETE, never counted as exercised.
3. **JNY-F3 is bound-not-run:** its BM-5 evidence was executed by the NEU-903 automated batch (the single reserved ≤1 prototype) and **bound** into `failure-batch/06_JNY-F3-binding.md`, not re-run.

All three conditions are exactly as recorded upstream; none is silently passed.

## G5 — Automated-eval coverage + clean-context repeatability · CONDITIONAL-PASS

Coverage: 10/10 hypothesis-carrying contracts classified (`automated-evaluation/01_…`), exactly one automatable — **ACL-4 (MC-4 / H-F3)** — defined as AEP-1 over the frozen 12-case `ACS-1 v1.0` set and **executed** (`autoeval-batch/`). Clean-context repeatability is linked through **CCR-1…CCR-7** (`automated-evaluation/03_…`), each field recorded per run; result reproduced **12/12 identical across RUN-1/2/3**.

**Condition:** **CCR-6 seed is `UNSUPPORTED`** for the LLM grader; per the CCR-6 rule this is permitted only with an explicitly declared nondeterminism tolerance (GRADER-VAR + MODEL-VERSION-BOUND), so reproducibility is evidenced by **cross-repeat verdict agreement**, not seed determinism. Two FAIL cases showed sub-threshold GRADER-VAR jitter (`q=0`↔`q=1`) with no verdict change. Bound to grader model/version `claude-opus-4-8`; the live `submit_answer` path was unreachable, so a minimal grading-harness stood in for it (recorded, `autoeval-batch/02_…`).

## G6 — AI-review-independence audit · PASS

The AI-review-independence protocol (`benchmark-suite/04_ai-review-independence-protocol.md`) requires ≥2 separately-initialized reviews per journey, each committing an isolated verdict (append-only, timestamped) **before** exposure to the creator's conclusion or any other reviewer, from a closed verdict set (`supports`/`contradicts`/`insufficient-evidence`); disagreement routes the journey to NEU-906 (`conflicted`), never averaged. AI review is class-4, explicitly never validation. The JNY-F3 reviews (Opus + Sonnet, unanimous `contradicts` of H-F3-as-worded) are the load-bearing instance (`failure-batch/07_…`). **Condition:** none. *(Independence here concerns reviewer isolation, not vehicle fidelity — the latter is covered by G4.)*

## G7 — Operational-log privacy + sensitive-content scan · PASS

The OUT-4 privacy gate (`measurement-contracts/05_operational-log-privacy-gate.md`) admits class-6 evidence only via least-privilege, field-allowlisted, minimized, aggregate-only, payload-free access records; **PLA-1/PLA-2/PLA-3 all Verdict PASS**. All executed class-6 `OPLOG-*` and class-3 RETRO records passed the gate with **zero privacy rejections** (`adjudication/02_operational-log-admissibility.md`). A sensitive-content scan across the entire package (including the NEU-907 consolidation files) found **no raw learner-response payloads, no credentials, no secrets** — the only matches for credential/PII patterns are *descriptions* of the codebase redaction denylist (field names `password, token, apiKey, …`) and the F4.4 finding that `src/shared/logger.ts` leaves learner `response` text unredacted. The DP answer strings in `ACS-1` are synthetic test fixtures authored for the eval, not learner data. **Condition:** none.

## G8 — Bidirectional trace + orphan audit · PASS

Every material element carries a forward trace (→ evidence + class + limitation) and a reverse anchor (→ behavior/metric/decision-rule/rejected-alternative), materialized as walkable indices (`traceability/02_bidirectional-walk-index.md`). The orphan/inventory-reconciliation audit runs **OC-1…OC-7, all 7/7 PASS** (`traceability/04_orphan-and-inventory-reconciliation-audit.md`), re-confirmed post-adjudication (`adjudication/05_…`). No forward orphan, reverse orphan, candidate orphan, decision orphan, invented-authority metric, exclusion orphan, or downgraded High risk. **Condition:** none.

## G9 — Measurement-authority + adjudication completeness · PASS

Mutable status lives in exactly one authority — the LINK-4 ledger (`adjudication/`), bound by NEU-906 under frozen `MC-* v1.0` rules (no rule changed, no v1.0 result rescored). The full element inventory is adjudicated with **zero unadjudicated elements** (`adjudication/03_decision-status-register.md` §2; OC-1/OC-2 of `adjudication/05_…`). Frozen rule versions (all `v1.0`) are held separate from mutable decision statuses throughout. **Condition:** none.

## G10 — Adversarial unsupported-claims audit · PASS

The adversarial audit (`adjudication/05_orphan-and-unsupported-claims-audit.md`) found **no external-user, expert, or market/demand/WTP validation claim** anywhere; class-7 is empty and every empirical element stays provisional/unresolved. This report additionally audited the **NEU-907 consolidation prose itself** (README, vocabulary, reformulation): a scan for validation/market language returned only (a) negations/discipline statements, (b) quotations of the EX3 exclusion rule, and (c) the term-of-art "validated measurement contract" (a contract validated against code feasibility, i.e. the INC-2 artifact — not a product-validation claim). No unsupported claim introduced. **Condition:** none.

## G11 — Remaining INC-1…5 accounting · PASS (holes explicitly open)

The package does not close these; it accounts for them honestly (verified against `traceability/03_completeness-states-and-incomplete-markers.md` §2 and `adjudication/03_…` §5):

| Marker | Open hole | Owner | Status |
| --- | --- | --- | --- |
| INC-1 | DP-domain transfer/retention benchmark evidence (holds R1, P1 effect size, BM-1/2/4). | NEU-900 | **UNRESOLVED** |
| INC-2 | Validated measurement contract (computable signals, thresholds, decision-rules; holds R6, BM-8, per-pattern mastery, `averageQuality`, `time_spent_ms`). | NEU-901 (SUB-4) | **BOUND** structurally → `measurement-contracts/`; **values still uncollectible** (COLLECTION-GAP) |
| INC-3 | DP-domain AI-grading reliability bound (holds R3, FM4/BM-5 reliability, RA5 reopen; H-F3.1 handed to it). | NEU-902 (OUT-7) | **UNRESOLVED** |
| INC-4 | Revision rules & production replacement signals. | SUB-4 | **BOUND** → `measurement-contracts/` (PRX-1…8) |
| INC-5 | Class-7 evidence (real-user / market / adherence prevalence; holds R4, R5 prevalence, D1 demand, M1–M4). | none yet (EX3) | **UNRESOLVED** |

**All five High risks (R1–R5) remain open and non-downgradable** (OC-7 severity floor). No INC-* marker was filled with a locally invented value.

---

## Overall

**9 PASS · 2 CONDITIONAL-PASS · 0 FAIL.** The two conditionals (G4, G5) are honest reflections of recorded upstream reality — v1.1 retrospective vehicle revision and grader-seed nondeterminism — not defects introduced by this consolidation. The package is complete, internally traceable, single-authority for mutable status, privacy-clean, free of unsupported validation claims, and explicit about its five open holes and their owners.
