# Adjudication Method, Frozen-Rule Versions & Evidence-Class Discipline

**Task:** NEU-906 · **Compiled:** 2026-07-12 · **Binds:** `LINK-4` (`../traceability/03_…` §3).
**Sole inputs (raw evidence, adjudicated — never re-run):** `../traceability/` (NEU-899 trace structure + `INC-*`/`LINK-*`/`REL-*`), `../measurement-contracts/` (NEU-901 frozen `MC-1…11 v1.0`, `PRX-1…8`, `PLA-1…3`, versioning rule), `../automated-evaluation/` + `../autoeval-batch/` (NEU-902/903 `AEP-1`/`ACS-1`/`CCR-*` results), `../baseline-batch/` (NEU-904 `JNY-B1/B2` results incl. v1.1 vehicle revision), `../failure-batch/` (NEU-905 `JNY-F1/F2/F3` results).

This package is the **mutable-status adjudication layer** deferred to NEU-906 by every upstream sibling ("NEU-906 owns adjudication via `LINK-4`"). It reconciles every material element and evidence link, applies each item's **applicable frozen `MC-*` contract**, and sets the mutable **evidence status** and **decision status** per material hypothesis/requirement — under frozen rules, changing no frozen rule and inventing no metric/threshold. Covers OUT-2 (reconcile), OUT-4 (log-privacy admissibility), OUT-5 (decision status), OUT-7 (automated-eval adjudication).

---

## 1. What this task may and may not do

| May (in scope) | May not (out of scope) |
| --- | --- |
| Reconcile every material element + evidence link; report unadjudicated/omitted items as a failure. | Collect new evidence, re-run any journey, or re-query the DB (the authorized snapshot is the sole extract). |
| Apply each frozen `MC-* v1.0` rule to its evidence and record the resulting reading. | Change, reinterpret, or re-version a frozen rule; retrospectively rescore v1.0 results. |
| Set mutable **evidence status** + **decision status** (accepted / provisional / withheld / contradicted / unresolved) per element. | Invent a metric, threshold, decision rule, revision trigger, or over-validation **rate** (SUB-4 authority; `OC-5`). |
| Privacy-adjudicate class-6 log items against `PLA-1…3`; reject any that fail; record the rejection. | Export or quote any raw learner payload; select any payload column. |
| Flag that a hypothesis warrants reformulation and route it. | Rewrite the hypothesis / product model / benchmark suite (NEU-907 / model tasks). |
| Bind `LINK-4`; record the rule version used for every adjudication. | Renumber, re-class, or edit any element's evidence class / limitation / id. |

## 2. Frozen rule versions used for every adjudication (`00_…` §4 versioning)

Every adjudication below is stamped with the **frozen contract version it was decided under**. The register is `../measurement-contracts/01_…`, frozen `2026-07-11 at v1.0`. **No contract was changed, reinterpreted, or re-versioned by this task; no v1.0 result was retrospectively rescored.**

| Contract | Version applied | Governs (headline) | Frozen decision-rule kind |
| --- | --- | --- | --- |
| MC-1 | `v1.0` | Spaced retention (P1/FM1/BM-2/J4) | DIRECTIONAL |
| MC-2 | `v1.0` | Schema transfer + reversal (P2/FM2/BM-1/BM-7) | DIRECTIONAL (BM-7 INCOMPLETE) |
| MC-3 | `v1.0` | Decay/relapse + hierarchical schedule (FM1/FM3/BM-3/BM-4) | DIRECTIONAL / COLLECTION-GAP |
| MC-4 | `v1.0` | AI over-validation (FM4/R3/BM-5/RA5) | BOUNDING + `GRADER-VAR`/`MODEL-VERSION-BOUND` |
| MC-5 | `v1.0` | Adherence under grind (FM5/R5/BM-6/M1–M4) | DIRECTIONAL SHAPE-ONLY / CLASS-7-DEFERRED |
| MC-6 | `v1.0` | Per-pattern mastery signal (BM-8/R6) | COLLECTION-GAP (no threshold) |
| MC-7 | `v1.0` | `averageQuality` aggregate (CAND-15/P4) | COLLECTION-GAP |
| MC-8 | `v1.0` | `time_spent_ms` reliability (CAND-18) | COLLECTION-GAP |
| MC-9 | `v1.0` | DP transfer effect — R1 (High) | DIRECTIONAL proxy only (INC-1) |
| MC-10 | `v1.0` | Demand — R4 (High) | CLASS-7-DEFERRED (no verdict) |
| MC-11 | `v1.0` | Settled scope/discipline decisions | NON-MEASURED-SETTLED (audit) |

**Rule-validity check (mandatory).** For each contract actually exercised by executed evidence (MC-1, MC-2, MC-3, MC-4, MC-5, MC-6), the frozen rule was checked against the evidence it received. **None proved invalid:** each produced the reading its frozen rule authorizes and no more (see `01_…` per-item column *rule held?*). Therefore **no evidence is marked `NON-ADJUDICABLE-FOR-CHANGED-RULE`, and no new contract version + rerun is required by this task.** The MC-4 / H-F3 wording mismatch (§below) is a *hypothesis-wording* mismatch, **not** a rule invalidity: the BOUNDING rule fired exactly as frozen on valid adversarial items.

## 3. Evidence-class discipline (the adjudication firewall)

The 7-class taxonomy is preserved at adjudication. The following disciplines are **binding on every status below**:

1. **Classes kept distinct.** class-3 `[dogfooding]`, class-4 `[ai-critique]`, class-5 `[automated-eval]`, class-6 `[operational-log]` are never fused. A class-3 `OBS-*` and its co-collected class-6 `OPLOG-*` are adjudicated as **separate** items.
2. **Agreement ≠ external validity.** Two independent AI reviewers agreeing `supports` on a creator's class-3 evidence is **class-4 agreeing with class-3** — it is **not** class-7 external/user/market/expert validation. No such agreement upgrades any status to `accepted`. This is stamped on every empirical status.
3. **`accepted` is reserved.** Only the **MC-11 NON-MEASURED-SETTLED** set (decisions the product-foundation tier owns, verified by audit) is `accepted`. **No empirical (class-1–6) element is `accepted`** in this stage; the strongest an empirical element reaches is `provisional`.
4. **Severity floor (G-a / `OC-7`).** A High risk (R1–R5) is never `accepted`-as-closed and never downgraded off the inventory; its status may only move on new correctly-classed evidence. Confirmatory-direction proxy evidence does **not** downgrade it.
5. **No rate / no invented value.** Bounding evidence is reported as *bounded presence for the probed items under the recorded model/version* — never a rate, reliability, prevalence, effect size, or threshold (`OC-5`).

## 4. Status vocabularies

**Evidence status** (the state of the *evidence* for an element, under its MC rule):
`CONFIRMED-CLASS-2` (operator-independent code fact) · `PROXY-DIRECTIONAL-PRESENT` / `PROXY-DIRECTIONAL-DECAY` · `PROXY-BOUNDING-PRESENT` (bounded, probed items) · `INCONCLUSIVE` (executed, signal not isolable) · `INSUFFICIENT-EVIDENCE` (unanimous reviewer verdict) · `COLLECTION-GAP` (no metric collectible) · `CLASS-7-ABSENT` (the evidence class that could settle it does not exist) · `NON-MEASURED-SETTLED`.

**Decision status** (the mutable adjudicated disposition of the *hypothesis/requirement*, per OUT-5):
`accepted` (settled at product altitude, audit-verified — MC-11 only) · `provisional` (directional/bounded proxy present, cannot settle; class-7 or in-domain measurement still required) · `withheld` (not used as a positive signal — reserved; see `03_…`) · `contradicted` (the claim as literally worded is not matched by its evidence) · `unresolved` (depends on a missing downstream artifact — carries an `INC-*` marker).

**Completeness state** (unchanged 4-value lattice from `../traceability/00_…` §4): SETTLED / PROVISIONAL / INCOMPLETE / UNRESOLVED — cited where a status is cap-bound (INCOMPLETE) vs artifact-bound (UNRESOLVED).

## 5. The four executed-evidence packages adjudicated here

| Package | Journeys | Evidence classes | Headline raw signal (from source, not re-derived) |
| --- | --- | --- | --- |
| `../baseline-batch/` (NEU-904) | JNY-B1 (BM-2 + BM-8), JNY-B2 (BM-6) | class-2 (BM-8), class-3 RETRO + class-6 (BM-2/BM-6) | BM-8 feasibility-gap present (unanimous `supports`); BM-2 retention-holds direction present-leaning (unanimous `supports`); BM-6 adherence-collapse *shape* present-leaning (unanimous `supports`). |
| `../failure-batch/` (NEU-905) | JNY-F1 (BM-1/BM-7), JNY-F2 (BM-3/BM-4), JNY-F3 (BM-5) | class-3 RETRO + class-6 (F1/F2), class-5 bound + class-4 (F3) | F1/F2 unanimous `insufficient-evidence` (transfer/decay not isolable); F3 over-validation present-and-stable on INCOMPLETE archetype, shallow/wrong correctly failed, unanimous `contradicts` of H-F3-as-worded. |
| `../autoeval-batch/` (NEU-903) | JNY-F3 source | class-5 `[automated-eval]` | 3/9 adversarial (the three INCOMPLETE cases) over-validated `q=3` PASS, stable 3/3 across isolated repeats; 6 SHALLOW/WRONG correctly failed; 3 CONTROLs pass (oracle-valid). |
| `../measurement-contracts/` (NEU-901) | — | frozen contracts | `MC-1…11 v1.0`, `PRX-1…8`, `PLA-1…3`, `GATE-STATE = PASS`. |

The per-item adjudication is `01_…`; log-admissibility is `02_…`; decision-status register is `03_…`; proxy-replacement dry-run is `04_…`; audit is `05_…`; `LINK-4` binding + self-check is `06_…`.
