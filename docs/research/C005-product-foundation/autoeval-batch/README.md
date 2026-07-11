# `BATCH-AUTOEVAL` — Executed Automated-Evaluation Batch (raw evidence)

**Task:** NEU-903 (SUB-10) · **Compiled:** 2026-07-11 · **Child of:** NEU-887 (C005 program).
**Sole inputs (merged on develop):** NEU-897 (`../`, 7-class taxonomy) · NEU-898 (`../product-model/`) · NEU-899 (`../traceability/`) · NEU-900 (`../benchmark-suite/`) · NEU-901 (`../measurement-contracts/`, frozen `MC-1…11 v1.0`, `GATE-STATE=PASS`, privacy gate `PLA-*`) · **NEU-902** (`../automated-evaluation/`, `AEP-1` / `ACS-1 v1.0` / `CCR-1…7`).

This package **executes** the `BATCH-AUTOEVAL` batch that NEU-902 (`../automated-evaluation/04_…` §4) allocated to NEU-903 — the single automatable hypothesis **H-F3 (DP-grading over-validation)** via `AEP-1`, case set `ACS-1 v1.0` (12 cases) — and records **raw evidence only**: retained inputs, per-case per-run grader outputs, run conditions (`ENV` + `CCR-1…7`), and the run-level verdict comparison against the declared tolerance. It sets **no** hypothesis or decision status; adjudication of R3/FM4/BM-5 is **NEU-906's** exclusive authority via `LINK-4`.

**Covers:** OUT-4 (retained results) + OUT-7 (clean-context repeat & isolation).

---

## What this package contains

| File | Content |
| --- | --- |
| `00_pre-run-gate-check.md` | Verifies NEU-901's complete mapping gate is `PASS` at `v1.0`, that `MC-4` / `AEP-1` / `ACS-1 v1.0` are versioned+frozen, reproduces the blocked-run test, records the batch-cap check, and records the `JNY-F3` minimal-grading-harness gate decision + privacy pre-condition. **Acceptance scenario 1 + 4.** |
| `01_case-fixtures-and-inputs.md` | The three DP-pattern topic fixtures and the twelve authored (synthetic) answer texts — the retained input half of `RET`, plus the retained oracle table (hidden from the grader). |
| `02_run-conditions-and-env.md` | Per-run `ENV` identity records and the `CCR-1…7` clean-context evidence bundle (baseline id, snapshot hash, isolated-run id, cache/namespace evidence, config digest, seed status, prior-output isolation) for all three isolated runs. **Acceptance scenario 2.** |
| `03_per-case-results.md` | Per-case, per-run raw grader `quality`/`action`, oracle-vs-actual comparison, and the resulting per-item over-validation flag (read from the grader response, never fabricated). |
| `04_repeat-comparison-and-integrity.md` | Run-level verdict comparison against the declared `GRADER-VAR` tolerance (agreement/divergence raw), CONTROL oracle-validity guard, batch-count/coverage check, incomplete-run register, and the no-mutable-status-set attestation. **Acceptance scenario 3.** |
| `05_traceability-binding-and-self-check.md` | `LINK-3` results-binding note (protocol→results) and the adversarial self-check. |

## Execution-fidelity disclosure (read this first — evidence integrity)

`AEP-1`'s system-under-test is the `submit_answer` grading path, whose `quality` (0–5) is **client-LLM-derived**, not server-computed (`src/domain/types/spaced-repetition-tools.ts` rubric; `01_…` §1). At execution time the **live Second Memory MCP learning tools** (`start_learning` / `submit_answer` / `teach_next`) and a configured production grader **were not reachable in this environment** (same condition NEU-904 recorded), so the real end-to-end `submit_answer` path could not be driven to hold the grader prompt/context fixed. Per `../automated-evaluation/02_…` §4, this **opens the gate** for the reserved `JNY-F3` **minimal grading-harness** — an isolated LLM applying **only** the frozen quality-derivation rubric against each fixture, with no learner history/streak/personalization leaking in. Building it created **no** UI, architecture, provider, or production commitment (EX4/BX-4). The executor is an **LLM agent** serving as the grader; the exact grader **model/version is recorded per run** (`ENV`, `MODEL-VERSION-BOUND`). The grader is never presented as a human learner, an expert, or external-user validation (`../automated-evaluation/05_…` claim discipline; evidence stays **class-5 `[automated-eval]`**).

**Isolation.** The three runs were executed by **separately-initialized isolated subagents** (fresh context per run, no carried-over grader state, no access to any prior run's outputs) — the genuine `CCR-3`/`CCR-7` mechanism, documented in `02_…`. Every record is **payload-free** (authored synthetic answers; `PLA-1…3`).

**What this batch does NOT do:** it adjudicates no evidence, sets no mutable hypothesis/decision status, changes no frozen metric/threshold/tolerance, adds no hypothesis or case beyond the NEU-902 cap, and presents no automated result as external-user/expert/market validation.
