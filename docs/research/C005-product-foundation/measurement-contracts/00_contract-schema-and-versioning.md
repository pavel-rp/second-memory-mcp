# Contract Schema, Evidence-Status Labels & Versioning Discipline

**Task:** NEU-901 · **Compiled:** 2026-07-11 · **Inputs:** NEU-899 (`../traceability/`) + NEU-900 (`../benchmark-suite/`) + NEU-898 (`../product-model/`) + NEU-897 (`../`).
This file defines the *structure* every `MC-*` contract in `01_…` instantiates, the closed evidence-status label set, the nondeterminism-tolerance vocabulary, and the freeze/versioning/rerun rules that make the contracts immutable. It decides no product content and adjudicates no status.

---

## 1. Why the structure looks like this (design constraints)

1. **A contract is a frozen governing hypothesis, not a result.** NEU-899 recorded that any metric/threshold/decision-rule/revision-trigger is **UNRESOLVED** and owned exclusively by SUB-4 (this task), and that inventing such a value anywhere else is an `OC-5` failure. This package supplies those values **once**, freezes them, and every downstream artifact points here rather than restating them (single-authority rule, acceptance scenario 6).
2. **Feasibility is checked, never assumed.** Per P4 (`../product-model/01_…` §1) a signal is not presumed to exist because a field name exists. Every contract's collection method cites a `FEAS-*` finding (`02_…`) that was checked against the actual code; a contract whose signal is `UNCOMPUTED`/`UNAVAILABLE` authorizes **no** evidence verdict and assumes no current collection capability (acceptance scenario 3).
3. **A proxy names its replacement before it is used.** Every contract that rests on a class-3 dogfooding / class-4 AI proxy (all of NEU-900's journeys) declares the production/external-user signal that would replace or revise it (`PRX-*`, `04_…`), so no proxy can silently become the signal of record.
4. **Immutability by versioning, not overwrite.** A frozen rule that is later found invalid is **not edited in place**; a new version supersedes it and the affected evidence is rerun (§4). This preserves the audit trail acceptance scenario 6 requires.

## 2. The `MC-*` contract schema

Every measurement contract has exactly these fields, in this order. Absent or not-yet-existing values are written explicitly (`—`, `UNRESOLVED`, or an `INC-*`/`FEAS-*` reference), never left blank.

| Field | Meaning |
| --- | --- |
| **Contract id** | `MC-<n>`, and the `v<major>.<minor>` version it was frozen at. |
| **Governs** | The material requirement(s)/decision(s)/hypothesis it is the authoritative contract for — upstream ids (`P*`, `D*`, `R*`, `FM*`, `BM-*`, `H-*`, `CAND-*`) reused verbatim. |
| **Intended learner behavior** | The observable learner behavior the metric is a proxy for — the handle a reviewer walks back from (mirrors the NEU-899 reverse anchor). |
| **Metric** | The quantity computed. Named precisely; where it rests on an existing signal, the exact signal is named (never a similarly named field — P4). |
| **Collection method** | How the metric is obtained, at what fidelity, via which `JNY-*` vehicle and/or code signal. Cites the `FEAS-*` feasibility finding. |
| **Threshold / decision rule** | The frozen rule that maps the metric to a `present/absent/inconclusive` (or `supports/contradicts/insufficient-evidence`) reading of the governed hypothesis. Directional where an effect size is unbacked (G1.1). |
| **Nondeterminism tolerance** | Declared where relevant (§3) — the run-to-run / model-to-model variance the rule tolerates before a reading is called `inconclusive`. `—` when the metric is deterministic. |
| **Evidence-status label** | The present status of the *proxy* (§3 label set) — never a settled finding. |
| **Replacement signal** | The `PRX-*` production/external-user signal that replaces or revises this proxy (`04_…`). `—` only for non-measured settled dispositions. |
| **Blocking marker** | The `INC-*` marker whose artifact this contract is (usually `INC-2`/`INC-4`), or the `INC-*` the contract still depends on downstream (`INC-1`/`INC-3`). |
| **Freeze note** | The freeze date + the rule that a post-run change requires a new version (§4). |

## 3. Closed vocabularies

### 3.1 Evidence-status labels (of the proxy — never a finding)

| Label | Meaning |
| --- | --- |
| **`PROXY-DIRECTIONAL`** | A computable proxy exists and yields a *directional* reading only (no effect-size / prevalence claim). The dominant label for NEU-900's class-3 journeys (G1.1). |
| **`PROXY-BOUNDING`** | The proxy *bounds* a failure for specific items (e.g. adversarial grading items) but does not establish a population/reliability property. |
| **`COLLECTION-GAP`** | The intended metric is **not collectible** with current capability (`UNCOMPUTED`/`UNAVAILABLE` per `02_…`); the contract authorizes **no** verdict and specifies the later work. |
| **`CLASS-7-DEFERRED`** | The metric requires real-user/market/adherence-prevalence evidence that does not exist in this program stage (EX3); no in-program verdict is authorized. |
| **`NON-MEASURED-SETTLED`** | The governed item is a settled scope/discipline decision measured by **audit, not a metric**; no evidence run is gated on it and no proxy is claimed. |

No label asserts validation. `PROXY-*` labels are class-3/4 proxies (`../benchmark-suite/03_…`, `04_…`); `CLASS-7-DEFERRED` and `COLLECTION-GAP` authorize no verdict; `NON-MEASURED-SETTLED` records that the item needs no measurement.

### 3.2 Nondeterminism-tolerance vocabulary

Declared for any metric whose collection path includes a stochastic component (LLM grading, LLM review, model-version drift):

| Token | Meaning |
| --- | --- |
| **`DET`** | Deterministic given inputs (schema counts, `interval_days`, pass/fail from a fixed rule). No tolerance needed. |
| **`GRADER-VAR`** | Depends on the server's LLM-derived `quality`; the rule requires the reading to hold across the journey's `≥2` repeat runs (`../benchmark-suite/03_…` §2) before it is not `inconclusive`. |
| **`REVIEWER-VAR`** | Depends on AI-reviewer verdicts; a non-unanimous `≥2`-reviewer set is `conflicted` and routed to NEU-906, never averaged (`../benchmark-suite/04_…` §4). |
| **`MODEL-VERSION-BOUND`** | Reading is valid only for the exact `AIR-model-version` recorded; a model/version change is a **new run**, not a reinterpretation of the frozen rule (§4). |

## 4. Freeze, versioning & rerun discipline (the immutability rule)

1. **Freeze point.** All contracts in `01_…` are frozen at **`v1.0`, 2026-07-11**, strictly **before** the first NEU-904/NEU-905/automated-eval/operational-log evidence run. The mapping gate (`03_…`) must read `GATE-STATE = PASS` at this freeze for any evidence collection to begin.
2. **No retrospective reinterpretation.** Once an applicable evidence run has started against a contract, the contract's metric, threshold, decision rule, nondeterminism tolerance, and replacement signal are **immutable for that version**. A reading is interpreted only under the version it was collected against.
3. **A change is a new version.** A proposed change after any applicable run has started creates **`MC-<n> v2.0`** (or `vX.(y+1)` for a clarification that does not alter the rule's meaning — clarifications are labeled and must not change any threshold/rule). The new version:
   - marks prior-version results **inapplicable to the new version** (not rescored);
   - **requires the affected evidence to be rerun** under the new version;
   - never edits the prior version in place — both versions remain in the register with their freeze dates.
4. **Invalidity is not silent.** A frozen rule found invalid later (e.g. the threshold was mis-specified) is handled by (3): a new version + rerun, with the reason recorded. It is never overwritten and never applied retroactively. This mirrors the Drizzle-migration lesson that silent in-place edits corrupt an ordered, audited history.
5. **Authority firewall.** Versioning changes the *contract*; it never sets or flips a mutable evidence STATUS (that is NEU-906 via `LINK-4`). A High risk `R1–R5` is non-downgradable regardless of any contract version (NEU-899 `OC-7`).
