# Reproducible Creator-Dogfooding Protocol

**Task:** NEU-900 · **Compiled:** 2026-07-11 · **Sole inputs:** NEU-898 (`../product-model/`) + NEU-899 (`../traceability/`) + NEU-897 (`../`).
This file fixes **how the creator observes each journey** so a run is reproducible: a fixed observation-record format, the repeat-run conditions, the evidence-class discipline, and the privacy gate. It defines the protocol **before** any evidence is collected (acceptance scenario 3); it collects none.

**The creator is the only initial human learner.** Creator dogfooding is **class-3 (`[dogfooding]`) evidence at n=1** — a single participant exercising the product as both learner and observer. It is **not** class-7 real-user, expert, or market validation (which does not exist — EX3), and no run may be relabeled as such (`04_…` adversarial check; NEU-899 `OC` proxy-relabel prohibition).

---

## 1. The fixed observation record (`OBS-*`) — one per run

Every run of a journey produces exactly one observation record with these fields, in this order. Absent values are written explicitly (`—`), never blank.

| Field | Meaning |
| --- | --- |
| **`OBS-run-id`** | `JNY-<id>#<n>` — journey id + monotonically increasing run number (e.g. `JNY-F3#2`). |
| **`OBS-journey`** | Journey id + the BM cell(s) the run targets. |
| **`OBS-datetime`** | ISO 8601 start timestamp (and end, for spaced runs). |
| **`OBS-vehicle`** | Existing-MCP flow (named) / paper-WoZ artifact / (if ever) reserved prototype. |
| **`OBS-prereq-position`** | The fixed A-axis position exercised (A1/A2/A3) — must never be A0/A4 (BX-1/BX-2). |
| **`OBS-content-ref`** | DP pattern/topic id, `chunk_ids`, and `session_id` (or the paper-artifact id). |
| **`OBS-creator-role`** | `learner` / `wizard` (WoZ) / `inspector` (schema inspection for BM-8). |
| **`OBS-held-constant`** | The conditions held fixed for this run (see §2). |
| **`OBS-varied`** | The condition(s) deliberately varied for this run (see §2). |
| **`OBS-prompts`** | The exact prompts/questions asked (verbatim), and their taxonomy level (1/2/3). |
| **`OBS-server-signals`** | Values **read from** server responses — `action`, derived `quality`, `interval_days`, roadblock/`roadblock_forecast` signals, `pass/fail`, `time_spent_ms`. **Read from the response, never hardcoded or fabricated** (server never-fabricate-scores rule). |
| **`OBS-failure-signal`** | For each targeted FM/X: `present` / `absent` / `inconclusive` + a one-line rationale grounded in `OBS-server-signals` and observed behavior. |
| **`OBS-boundary-check`** | Confirmation that no `BX-*` wall was crossed (prereq stayed in-audience; DP-only; no market claim; no raw-log export). |
| **`OBS-fidelity-hit`** | Which fidelity caveat(s) from `01_…` this run actually hit. |
| **`OBS-creator-conclusion`** | The creator's per-journey conclusion — **written LAST and SEALED** (§3): recorded only *after* the independent AI verdicts are committed (`04_…`), so it cannot leak into reviewer isolation. |

Records are **append-only**; a corrected value is a new record, never an overwrite (so run-to-run variance and the seal ordering stay auditable).

## 2. Repeat-run conditions

- **Minimum repeats.** Each journey is run **≥ 2 times**. Runs 1..n hold the same *core* conditions and vary at most one controlled dimension, so run-to-run variance is attributable.
- **Held constant across a journey's repeat runs (`OBS-held-constant`):** the targeted BM cell(s); the DP pattern family; the fixed prerequisite position; the vehicle and flow; the prompt template and taxonomy level; the boundary guards.
- **Deliberately varied (`OBS-varied`), one dimension at a time:** for spaced journeys (JNY-B1 BM-2, JNY-F2 BM-4) the **elapsed interval** (read from `interval_days`, not chosen ad hoc) is the varied dimension across runs; for the grading journey (JNY-F3 BM-5) the **shallowness/wrongness of the adversarial answer** is varied to map the over-validation boundary; for the schema-inspection half (BM-8) the **signal under inspection** is varied.
- **Spaced-journey scheduling.** JNY-B1 (BM-2) and JNY-F2 (BM-4) span the SM-2-derived interval; each re-exposure is a separate `OBS-*` record under the same journey. The paper/WoZ vehicle for JNY-F2 records a *simulated* timeline and labels it as time-compressed (not a measured decay curve — `01_…` fidelity boundary).
- **Reproduction sufficiency.** A run is reproducible when another operator, given the `OBS-*` record, can re-create the vehicle, content, prompts, prereq position, and held/varied conditions and obtain a comparable `OBS-server-signals` distribution. Any condition needed to reproduce the run must appear in the record.

## 3. Verdict-seal ordering (isolates the creator conclusion)

To keep the independent AI reviews (`04_…`) genuinely independent, the creator's conclusion is **sealed** until all initial AI verdicts for that journey are committed:

1. Creator runs the journey ≥ 2× and completes every `OBS-*` field **except** `OBS-creator-conclusion`.
2. The observation record (minus the creator conclusion) is the **context package** exposed to the AI reviewers (`04_…` defines exactly what each reviewer sees).
3. Each AI reviewer commits its initial verdict (append-only, timestamped) **before** any exposure to the creator's conclusion or another reviewer's verdict.
4. Only **after** all initial verdicts are committed does the creator write `OBS-creator-conclusion`.

This ordering is the reproducibility guarantee that no verdict was anchored on the creator's belief.

## 4. Evidence-class & privacy discipline

- **Class-3 only.** Every observation is labeled `[dogfooding]` (class 3), n=1. It may support or weaken a *hypothesis* (`H-*` in `01_…`); it may **never** be phrased as "users want", "the market validates", "proven", or "experts confirm" (EX3; NEU-897 taxonomy #3). BM-6's motivation/adherence run is especially exposed to this and is explicitly bounded to failure-*shape*, not prevalence.
- **Aggregate-only privacy gate (P5/EX6/BX-5).** `src/shared/logger.ts` leaves learner response text unredacted; therefore **no raw operational-log payload** is exported as evidence. The creator's own responses may be captured *inside* the `OBS-*` record for the creator's review, but log-derived claims must use query-scope / time-range / field-list / aggregate provenance through the NEU-887 OUT-4 privacy gate — the observation record is not an operational-log extract.
- **No status setting.** A run records `OBS-failure-signal` as `present/absent/inconclusive`; it does **not** set the BM cell's status, does **not** compute a metric or threshold (SUB-4 / `INC-2`), and does **not** promote/demote any element (NEU-906 / `LINK-4`). An `inconclusive` or unexecutable run is carried as an **incomplete result** (`04_…` §4), never as coverage.
