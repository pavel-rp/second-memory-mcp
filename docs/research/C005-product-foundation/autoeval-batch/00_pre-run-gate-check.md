# Pre-Run Gate Check — Mapping-Gate PASS, Contract & Protocol Freeze, Cap & Harness Gate

**Task:** NEU-903 · **Compiled:** 2026-07-11 · **Verifies:** NEU-901 (`../measurement-contracts/`) + NEU-902 (`../automated-evaluation/`).
This file discharges **acceptance scenarios 1 and 4** and the verification evidence "*pre-run complete-mapping and contract-freeze audits; explicit blocked-run test; hypothesis-count and case-count checks*". It re-reads the frozen upstream artifacts and records the gate state that **unblocks** `BATCH-AUTOEVAL` execution. It **re-adjudicates nothing**, **invents no metric**, and **changes no frozen value**.

**Gate rule (NEU-901 `03_…` §1):** downstream evidence collection — including **automated-eval** — is **BLOCKED until `GATE-STATE = PASS` at contract freeze `v1.0`**, and only for that frozen set.

---

## 1. Mapping-gate verification (`GATE-STATE`)

Read from `../measurement-contracts/03_requirement-decision-mapping-gate.md` §3:

> **`GATE-STATE = PASS`** — as of measurement-contract freeze **`v1.0` (2026-07-11)**. Unmapped material items: **0**. Material hypotheses without a frozen contract: **0**. High risks placed in `NON-MEASURED-SETTLED`: **0** (`OC-7` holds).

**NEU-903 pre-run confirmation:** ✅ `GATE-STATE = PASS` at `v1.0`. Every material requirement/decision family (P/D/J/M/FM/R/DEC/RA/EX/BX/BM) maps to ≥1 testable hypothesis + frozen `MC-*`, or to an explicit `NON-MEASURED-SETTLED` / `CLASS-7-DEFERRED` / `COLLECTION-GAP` disposition. This **unblocks** automated-eval collection **for the frozen `v1.0` set only**.

## 2. Applicable-contract & protocol freeze audit (H-F3 only)

`BATCH-AUTOEVAL` executes exactly one automatable hypothesis, so only the `MC-4` contract and the `AEP-1`/`ACS-1` protocol are in scope.

| Artifact | Id / version | Source | Frozen? |
| --- | --- | --- | --- |
| Measurement contract | **`MC-4 v1.0`** (AI-grading over-validation; governs FM4, R3, BM-5, RA5, D3, P3) | `../measurement-contracts/01_…` ("Compiled & FROZEN 2026-07-11 at v1.0") | ✅ |
| Decision rule referenced | **BOUNDING** + `PROXY-BOUNDING` status; pass = `quality ≥ 3` | `../measurement-contracts/01_…` MC-4 (quoted, not redefined) | ✅ |
| Nondeterminism tolerance | **`GRADER-VAR` + `MODEL-VERSION-BOUND`** | `../measurement-contracts/01_…` MC-4 | ✅ |
| Automatable protocol block | **`AEP-1`** (H-F3 / MC-4) | `../automated-evaluation/02_…` | ✅ |
| Case set | **`ACS-1 v1.0`** (12 cases, 3 patterns × 4 archetypes) | `../automated-evaluation/02_…` §1 ("frozen at v1.0 before its first run") | ✅ |
| Clean-context-repeat spec | **`CCR-1…7`** (one auditable evidence field each) | `../automated-evaluation/03_…` | ✅ |

**Freeze confirmation:** ✅ `MC-4` is `v1.0`-frozen; `AEP-1` references it by id+version and redefines nothing; `ACS-1` is frozen at `v1.0` before this first run. NEU-903 introduces **no** new contract, changes **no** frozen threshold/tolerance, and adds **no** case. Per NEU-901's rule, *any post-run change is a new version + rerun* — honored: the concrete answer texts (`01_…`) are the faithful realization of the frozen `ACS-1 v1.0` essence and are snapshot-hashed (`CCR-2`) before Run-1.

## 3. Batch-cap check (acceptance scenario 4)

| Cap | Limit | This batch | Result |
| --- | --- | --- | --- |
| Automatable material hypotheses | ≤ 6 | **1** (H-F3 / `ACL-4`) | ✔ within cap |
| Total cases | ≤ 18 | **12** (`ACS-1-01…12`) | ✔ within cap |
| Batches | 1 | **1** (`BATCH-AUTOEVAL`) | ✔ |

The completeness proof is NEU-902's (`../automated-evaluation/04_…` §3): all ten hypothesis-carrying contracts `MC-1…MC-10` were classified and exactly one (`MC-4`) cleared the automatability test, so `{H-F3}` is the **complete** automatable set, not a sample. NEU-903 executes **all and only** these 12 cases. **A request to exceed 6 hypotheses or 18 cases is rejected and routed to scope revision (`../automated-evaluation/04_…` §5), never expanded here** — not triggered (1 ≤ 6, 12 ≤ 18).

## 4. Blocked-run test (reproduced — proves the gate is a real block)

Per NEU-901 `03_…` §4 and the verification evidence "*explicit blocked-run test for any unmapped material requirement or decision*":

1. **Inject an unmapped item.** Hypothetically add material requirement `RDM-Xtest` with **no** `MC-*` and no settled/deferred disposition.
2. **Apply the gate rule (§1).** `RDM-Xtest` matches **none** of the three pass paths ⇒ `Verdict = BLOCK`.
3. **Aggregate.** One `BLOCK` ⇒ `GATE-STATE = FAIL` ⇒ **all** downstream evidence collection blocked, including this `BATCH-AUTOEVAL` first run.
4. **Force the pass** by inventing a threshold for `RDM-Xtest` ⇒ trips `OC-5` (invented authority) ⇒ **still `FAIL`.**

**Result:** the only ways to clear a `BLOCK` are a genuine frozen contract, a genuine settled/deferred disposition, or removing the item (NEU-898/899 only). The current `v1.0` inventory has **zero** `BLOCK`s (§1), so — and only so — this batch proceeds. Had `MC-4` been unfrozen or H-F3 unmapped, `BATCH-AUTOEVAL` would be **blocked** and would record no evidence.

## 5. Minimal-grading-harness gate decision (`JNY-F3` reserved prototype)

`../automated-evaluation/02_…` §4 permits the reserved `JNY-F3` **minimal grading-harness that exposes only the quality-derivation step** *iff* the real `submit_answer` path cannot hold the grader prompt/context fixed enough to attribute over-validation.

**Decision (NEU-903, gated):** the live MCP learning tools and a configured production grader were **not reachable in this environment**, so the end-to-end `submit_answer` path could **not** be driven with a held-fixed grader context. The gate therefore **opens**: execution uses the minimal grading harness — an isolated LLM grader applying **only** the frozen quality-derivation rubric (`01_…` §1) against each fixture, no learner history/streak/personalization. This harness creates **no** UI, architecture, provider, or production commitment (**EX4/BX-4 honored**); it exposes only the quality-derivation step and reads `quality`/`action` as the grader emits them (never fabricated). The grader model/version is recorded per run (`ENV`, §`02_…`).

## 6. Privacy-gate pre-condition (`PLA-1…3`)

The batch's records are subject to NEU-901's operational-log privacy gate (`../measurement-contracts/05_…`) and NEU-897 class-6 discipline: **no raw operational-log payload** is used as evidence. `AEP-1`'s inputs are **authored synthetic DP answers** (`01_…`), so no learner payload is involved; had a real learner answer been substituted, `PLA-*` would bar raw payloads (`EX6`/`BX-5`). **Confirmation:** every record in this package is **payload-free**. ✅

## 7. Gate decision for NEU-903

> ✅ **PRE-RUN GATE = PASS.** NEU-901's complete mapping gate is `PASS` at frozen `v1.0`; `MC-4 v1.0`, `AEP-1`, and `ACS-1 v1.0` are versioned and frozen; the batch is within caps (1 hypothesis ≤ 6, 12 cases ≤ 18); the blocked-run test confirms the block is real; the minimal-harness gate is documented; the privacy pre-condition holds. **`BATCH-AUTOEVAL` execution is authorized** for the frozen `v1.0` set — recording raw evidence and run-level verdicts only, setting **no** mutable status (NEU-906 owns adjudication).
