# Per-Signal Feasibility & Unavailable-Telemetry Inventory

**Task:** NEU-901 · **Compiled:** 2026-07-11 · **Checked against:** the actual codebase at develop `f917ca0`.
This file discharges principle **P4** ("measure only what the system can actually compute; verify per signal") and risk **R6** for the measurement contracts. Every signal a contract in `01_…` relies on is checked **against real code** — not inferred from a field name (acceptance scenario 3). Each finding cites the source file/line. A signal found `UNCOMPUTED` or `UNAVAILABLE` makes any contract that would depend on it a `COLLECTION-GAP` that authorizes **no** verdict.

---

## 1. Feasibility verdict vocabulary

| Verdict | Meaning |
| --- | --- |
| **`COMPUTABLE`** | The signal is persisted **and** produced today; a contract may read it (at its stated fidelity). |
| **`COMPUTABLE-UNVALIDATED`** | The signal is persisted/produced, but its **reliability in real usage** is unverified; usable as a proxy only, with the reliability gap named. |
| **`UNCOMPUTED`** | The field/type exists but is **not populated** (hardcoded/stubbed); derivable in principle but not collected today. Authorizes no verdict until implemented. |
| **`UNAVAILABLE`** | No schema field or computation exists; would require **new telemetry**. Authorizes no verdict; specified as later work only. |

## 2. The inventory (`FEAS-*`)

| Id | Signal | Verdict | Evidence (source) | Consequence for contracts |
| --- | --- | --- | --- | --- |
| **FEAS-1** | Per-attempt **pass/fail** | `COMPUTABLE` | `infrastructure/db/schema.ts` L208 `quality` (assessment: server-derived `pass=4 / fail=2`); persisted in `sessionQuestionAttempts`. | Usable directly by MC-1/MC-2/MC-4 as the base outcome signal. `DET` given the fixed derivation rule. |
| **FEAS-2** | Per-attempt **derived `quality`** (0–5) | `COMPUTABLE` | `schema.ts` L208 `quality` (server-derived for assessment), L209 `agentQuality` (agent-provided, teaching). Read from the response, never fabricated (server never-fabricate-scores rule; `../benchmark-suite/03_…` `OBS-server-signals`). | Base signal for over-validation (MC-4) and retention-quality (MC-1). `GRADER-VAR` where the value is LLM-derived. |
| **FEAS-3** | **`time_spent_ms`** | `COMPUTABLE-UNVALIDATED` | `schema.ts` L211 `timeSpentMs integer notNull` (per attempt); L138 (session/chunk level). Persisted. **Reliability in real usage is a documented gap** (CAND-18 / RQ4 G4.1). | MC may use it only as a supporting proxy; the reliability gap is carried (needs the OUT-4 privacy-gated log query `PLA-3` to characterize, `05_…`). Never a sole verdict basis. |
| **FEAS-4** | **`interval_days`** (SM-2 schedule) | `COMPUTABLE` | SM-2 scheduler output, surfaced in responses and read by `../benchmark-suite/03_…` (`OBS-varied` = elapsed interval "read from `interval_days`, never hardcoded"). | Drives the spaced dimension of MC-1/MC-3. `DET`. |
| **FEAS-5** | **`averageQuality`** (session summary aggregate) | `UNCOMPUTED` | `orchestration/learner-context-workflows.ts` L170 — `averageQuality: 0, // TODO: not yet computed — quality lives in sessionQuestionAttempts, not sessionChunks`. The type field (L28) exists but is stubbed to `0`. | **Derivable** (aggregate `FEAS-2` over a session) but **not collected today**. MC-7 is a `COLLECTION-GAP`: authorizes no verdict; specifies the aggregation as later work. Exactly the P4 trap — a name exists, the value does not. |
| **FEAS-6** | **Per-DP-pattern mastery signal** | `UNAVAILABLE` | No mastery/`masteryLevel` column in `schema.ts` (grep: none); RQ4 G4.2 / CAND-17 / BM-8 ("no per-DP-pattern mastery signal in the schema today"). | MC-6 is a `COLLECTION-GAP` (the core of `INC-2`): authorizes no verdict; the signal must be **designed as later content-model + telemetry work**, never assumed. |
| **FEAS-7** | **Ease factor / leech / weak-area** signals | `COMPUTABLE` | `learner-context-workflows.ts` L179–201 (`weakAreaEaseThreshold`, `getWeakAreas`, leech count); `schema.ts` L62 `consecutiveFailures`. | Supporting signals for MC-1/MC-6's *interim* proxy; not a validated mastery signal (FEAS-6 remains the gap). |
| **FEAS-8** | **Adherence** (scheduled reviews completed vs due; streak) | `COMPUTABLE (n=1) / CLASS-7 (prevalence)` | `learner-context-workflows.ts` `streakDays` (L58–82, L204), `dueToday`/`overdue` (L109–122), `getReviewsByDateRange`. | MC-5 may read adherence **for a single creator** as failure-*shape* only; **population prevalence is class-7** (RQ6 §class-7, R5 non-downgradable) — `CLASS-7-DEFERRED`, no prevalence verdict. |
| **FEAS-9** | **Roadblock / `roadblock_forecast`** gate signals | `COMPUTABLE` | `domain/algorithms/roadblock-gate.ts`; surfaced in responses and listed in `../benchmark-suite/03_…` `OBS-server-signals`. | Supporting signal read from the response for MC-1/MC-4 context; not a mastery verdict on its own. |

## 3. Unavailable-telemetry inventory (explicit — never assumed collectible)

The signals below are **not collectible with current evidence sources** and are specified for later work. No contract may authorize an evidence verdict from them, and no downstream task (NEU-904/905/906) may treat them as available (acceptance scenario 3).

| Signal | State | What it would require (later work — not started here, EX4/EX5) | Owning marker |
| --- | --- | --- | --- |
| `averageQuality` session aggregate (`FEAS-5`) | `UNCOMPUTED` | Aggregate `sessionQuestionAttempts.quality` per session and populate the `LearnerContext` field (the code TODO's own path). Implementation is telemetry work, out of this task's product-foundation altitude. | MC-7 / `INC-2` |
| Per-DP-pattern mastery signal (`FEAS-6`) | `UNAVAILABLE` | A per-pattern content-model + a computed mastery estimator + schema storage. No field exists. | MC-6 / `INC-2` |
| `time_spent_ms` real-usage reliability (`FEAS-3`) | `COMPUTABLE-UNVALIDATED` | A privacy-gated aggregate log study (`PLA-3`, `05_…`) to characterize noise/outliers before the signal is trusted. | MC-8 / `INC-2` |
| Population **adherence prevalence** (`FEAS-8`) | `CLASS-7` | Real-user longitudinal usage data that does not exist in this program stage (EX3). | MC-5 / `INC-5` (class-7, no in-program owner) |
| DP-domain **AI-grading reliability** | not a signal — an **automated-eval artifact** | The OUT-7 automated-evaluation protocol (NEU-902), adjudicated by NEU-906. | MC-4 depends on `INC-3` (owned elsewhere) |

**Discipline note.** `FEAS-5`/`FEAS-6`/`FEAS-3` are **measurement-contract** gaps this task owns (`INC-2`); AI-grading *reliability* is a **benchmark/automated-eval** gap owned by OUT-7 (`INC-3`); adherence *prevalence* is a **class-7** gap with no in-program owner (`INC-5`). A contract never fills one kind of hole with another (mirrors NEU-899's discipline note).
