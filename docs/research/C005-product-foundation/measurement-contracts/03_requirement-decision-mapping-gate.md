# The Complete Requirement-and-Decision Mapping Gate

**Task:** NEU-901 · **Compiled:** 2026-07-11 · **Contract set:** `01_…` (`v1.0`, frozen).
This is the **pre-evidence gate**. It inventories **every** material requirement and decision from the product model (NEU-898) and the selected journey suite (NEU-900), maps each to `≥1` testable material hypothesis and a frozen authoritative contract (or an explicit, auditable non-measured disposition), and publishes a single `GATE-STATE`. **NEU-904/NEU-905 (and any AI-review, automated-evaluation, or operational-log evidence collection) are BLOCKED until `GATE-STATE = PASS` at contract freeze `v1.0`** (acceptance scenario 2).

---

## 1. The gate rule

A material requirement/decision **passes** iff it maps to **at least one** of:

- a **testable hypothesis** (`H-B1/B2/F1/F2/F3` from NEU-900, or an element's governing hypothesis) **and** a **frozen `MC-*` contract** (`01_…`); or
- an explicit **`NON-MEASURED-SETTLED`** disposition (`MC-11`) with an audit basis (for settled scope/discipline decisions); or
- an explicit **`CLASS-7-DEFERRED`** / **`COLLECTION-GAP`** disposition (`MC-5/6/7/8/10`) that **authorizes no verdict** and names the later work / `INC-*` owner.

A material item with **no** mapping, or a material hypothesis with **no** frozen contract, **FAILS** the gate. Any single FAIL sets `GATE-STATE = FAIL` and blocks all downstream evidence collection. Inventing a metric to force a pass is itself a failure (NEU-899 `OC-5`).

**Materiality source of truth:** NEU-898 `02_…` (DEC5 rule) + the completeness register NEU-899 `03_…`. This gate re-classes nothing; it maps the existing material set.

## 2. The complete mapping (`RDM-*`)

Every material element family is listed. `MC-*` = the governing contract; **Testable hypothesis** = the `H-*` (or governing hypothesis) it is tested through; **Verdict** = `PASS` (mapped) — the gate blocks on any `BLOCK`.

### 2.1 Product principles & differentiators

| Id | Element | Testable hypothesis | Contract | Verdict |
| --- | --- | --- | --- | --- |
| RDM-P1 | P1 durable retention+transfer | H-B1 (retention), H-F1 (transfer) | MC-1, MC-2, MC-9 | PASS |
| RDM-P2 | P2 retention & transfer are two mechanisms | H-F1 | MC-2 | PASS |
| RDM-P3 | P3 evidence-labeled provisional signals | (discipline — audited via `00_…` §3.1 labels) | MC-11 | PASS |
| RDM-P4 | P4 measure only what is computable | (verified per-signal) | MC-6, MC-7, MC-8 + `02_…` | PASS |
| RDM-P5 | P5 never expose raw payloads; aggregate-only | (privacy gate) | MC-11 + `05_…` | PASS |
| RDM-P6 | P6 keep gaps visible | (discipline — audited) | MC-11 | PASS |
| RDM-D1 | D1 built-in retention model | H-B1 (capability) + demand class-7 | MC-1 / MC-10 (demand) | PASS |
| RDM-D2 | D2 transfer-oriented schema building | H-F1 | MC-2 | PASS |
| RDM-D3 | D3 evidence-labeled mastery signals | H-F3 (grading honesty) | MC-4 | PASS |
| RDM-D4 | D4 reuse existing SR substrate (capability-only) | (capability; no product-fit metric) | MC-11 (+ R8) | PASS |

### 2.2 Learner jobs, motivations, failure modes

| Id | Element | Testable hypothesis | Contract | Verdict |
| --- | --- | --- | --- | --- |
| RDM-J1..J3 | J1 rating / J2 pattern mastery / J3 interview | H-B2 (J1/M1), H-F1 (J2) | MC-5, MC-2 | PASS |
| RDM-J4 | J4 durable mastery (thesis job) | H-B1 | MC-1, MC-9 | PASS |
| RDM-M1..M4 | Motivation weighting (provisional) | H-B2 | MC-5 (`CLASS-7-DEFERRED` prevalence) | PASS |
| RDM-FM1 | Forgetting after grind | H-B1 / H-F2 | MC-1, MC-3 | PASS |
| RDM-FM2 | Shallow schema | H-F1 | MC-2 | PASS |
| RDM-FM3 | Mis-scheduled review | H-F2 | MC-3 (BM-3 `COLLECTION-GAP`, G1.2) | PASS |
| RDM-FM4 | False confidence from AI grading | H-F3 | MC-4 | PASS |
| RDM-FM5 | Adherence collapse | H-B2 | MC-5 | PASS |

### 2.3 Risks (High risks non-downgradable — `OC-7`)

| Id | Element | Testable hypothesis | Contract | Verdict |
| --- | --- | --- | --- | --- |
| RDM-R1 | R1 mechanism may not transfer to DP (**High**) | H-B1/H-F1 (proxy) | MC-9 (`INC-1`) | PASS |
| RDM-R2 | R2 retention without transfer (**High**) | H-F1 | MC-2 | PASS |
| RDM-R3 | R3 AI grading unreliable (**High**) | H-F3 | MC-4 (`INC-3`) | PASS |
| RDM-R4 | R4 no demand (**High**) | class-7 | MC-10 (`CLASS-7-DEFERRED`, `INC-5`) | PASS |
| RDM-R5 | R5 adherence collapse (**High**) | H-B2 | MC-5 (`INC-5`) | PASS |
| RDM-R6 | R6 signal feasibility gap | (per-signal) | MC-6, MC-7, MC-8 | PASS |
| RDM-R7 | R7 mis-scheduling (hierarchical) | H-F2 | MC-3 (`COLLECTION-GAP`) | PASS |
| RDM-R8 | R8 over-reliance on codebase | (capability-only) | MC-11 | PASS |

### 2.4 Decisions, rejected alternatives, exclusions, benchmark-state cells

| Id | Element | Disposition | Contract | Verdict |
| --- | --- | --- | --- | --- |
| RDM-DEC1..5 | DEC1–DEC5 | `NON-MEASURED-SETTLED` | MC-11 | PASS |
| RDM-RA1/3/4 | RA1, RA3, RA4 | `NON-MEASURED-SETTLED` (rejected, audited) | MC-11 | PASS |
| RDM-RA2 | RA2 volume/grind rejected (design-against) | H-B2 (behavior to design against) | MC-5 | PASS |
| RDM-RA5 | RA5 don't trust AI grading | H-F3 | MC-4 | PASS |
| RDM-RA6 | RA6 don't claim niche as validated market | class-7 | MC-10 | PASS |
| RDM-EX1..6 | EX1–EX6 | `NON-MEASURED-SETTLED` walls | MC-11 (EX6 via `05_…`) | PASS |
| RDM-BX1..5 | BX-1…BX-5 | `NON-MEASURED-SETTLED` guards | MC-11 (BX-5 via `05_…`) | PASS |
| RDM-BM1 | BM-1 first pattern / schema | H-F1 | MC-2 | PASS |
| RDM-BM2 | BM-2 spaced retention | H-B1 | MC-1 | PASS |
| RDM-BM3 | BM-3 hierarchical schedule | H-F2 | MC-3 (`COLLECTION-GAP`) | PASS |
| RDM-BM4 | BM-4 decay/relapse | H-F2 | MC-3 | PASS |
| RDM-BM5 | BM-5 AI over-validation | H-F3 | MC-4 (`INC-3`) | PASS |
| RDM-BM6 | BM-6 adherence under grind | H-B2 | MC-5 | PASS |
| RDM-BM7 | BM-7 expertise reversal | H-F1 | MC-2 (INCOMPLETE, G2.1) | PASS |
| RDM-BM8 | BM-8 per-pattern mastery signal | H-B1 (BM-8 inspect) | MC-6 (`COLLECTION-GAP`) | PASS |

### 2.5 Journey-hypothesis → contract closure (so NEU-904/905 can run)

| Journey | Batch → task | Hypothesis | Governing contract(s) | Verdict |
| --- | --- | --- | --- | --- |
| JNY-B1 | BASELINE → NEU-904 | H-B1 | MC-1, MC-6 (inspect), MC-9 | PASS |
| JNY-B2 | BASELINE → NEU-904 | H-B2 | MC-5 | PASS |
| JNY-F1 | FAILURE → NEU-905 | H-F1 | MC-2, MC-9 | PASS |
| JNY-F2 | FAILURE → NEU-905 | H-F2 | MC-3, MC-9 | PASS |
| JNY-F3 | FAILURE → NEU-905 | H-F3 | MC-4 | PASS |

Every selected journey's hypothesis has `≥1` frozen contract; no journey can be executed against an unspecified metric or an invented threshold.

## 3. `GATE-STATE`

> **`GATE-STATE = PASS`** — as of measurement-contract freeze **`v1.0` (2026-07-11)**.
> Material requirements/decisions inventoried: **all** families above (P/D/J/M/FM/R/DEC/RA/EX/BX/BM). **Unmapped material items: 0.** Material hypotheses without a frozen contract: **0.** High risks placed in `NON-MEASURED-SETTLED`: **0** (`OC-7` holds).

Downstream evidence collection (NEU-904, NEU-905, AI-review, automated-eval, operational-log) is **UNBLOCKED** for the frozen `v1.0` contract set — and only for it. A new contract version (`00_…` §4) re-opens the gate for the affected items until it re-reads `PASS`.

## 4. The gate-failure test (auditable)

To prove the gate actually blocks (verification evidence: "explicit gate-failure test for any unmapped material item"):

1. **Inject an unmapped item.** Add a hypothetical material requirement `RDM-Xtest` with no `MC-*`.
2. **Run the gate rule (§1).** `RDM-Xtest` matches none of the three pass paths ⇒ `Verdict = BLOCK`.
3. **Aggregate.** One `BLOCK` ⇒ `GATE-STATE = FAIL` ⇒ all downstream evidence collection blocked.
4. **Injecting a metric to force the pass** (giving `RDM-Xtest` a fabricated threshold) trips `OC-5` (invented authority) ⇒ still `FAIL`.

This demonstrates the gate is a real block, not a rubber stamp: the only ways to clear a `BLOCK` are a genuine frozen contract, a genuine settled/deferred disposition, or removing the item from the material set (which only NEU-898/899 may do). The current inventory has **zero** such `BLOCK`s, hence §3's `PASS`.
