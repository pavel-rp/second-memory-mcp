# Frozen Measurement-Contract Register (`v1.0`)

**Task:** NEU-901 · **Compiled & FROZEN:** 2026-07-11 at `v1.0` · **Schema:** `00_…` §2 · **Feasibility:** `02_…`.
The authoritative, immutable contracts. Each covers a material requirement/decision/hypothesis, names the intended learner behavior, the metric, the feasibility-checked collection method, the frozen threshold/decision-rule, the declared nondeterminism tolerance, the present proxy evidence-status label, and the `PRX-*` replacement signal. **No value here is a finding.** These are frozen before the first evidence run; any post-run change is a new version + rerun (`00_…` §4).

Contracts cover the five NEU-900 journeys' measurements (`JNY-B1, JNY-B2, JNY-F1, JNY-F2, JNY-F3`) so NEU-904/NEU-905 can pass the mapping gate (`03_…`), plus the inspected signal list and the class-7 / non-measured dispositions.

---

## 1. Measurement contracts (`MC-*`)

### MC-1 · Spaced retention of a learned DP pattern — `v1.0`
- **Governs:** P1, FM1, BM-2, J4 (retention half of `H-B1`); CAND-1, CAND-23.
- **Intended learner behavior:** After learning a DP pattern, the learner still recalls/reapplies it after a spaced gap rather than forgetting it (FM1).
- **Metric:** Proportion of scheduled spaced re-reviews (across `≥2` intervals) whose outcome is a retained pass — `FEAS-1` pass / `FEAS-2` `quality ≥ 3`.
- **Collection method:** `JNY-B1` teaching / rolling-session loop over one DP-pattern topic, re-exposed at the gap read from `interval_days` (`FEAS-4`, never hardcoded); class-3 dogfooding, n=1.
- **Threshold / decision rule:** **DIRECTIONAL** — pattern retained across `≥2` re-reviews ⇒ FM1-mitigation signal `present`; decayed recall ⇒ `present` decay. **No effect-size claim** is authorized (G1.1); the rule reads direction only.
- **Nondeterminism tolerance:** `GRADER-VAR` where `quality` is LLM-derived (reading must hold across the journey's `≥2` repeat runs), else `DET`.
- **Evidence-status label:** `PROXY-DIRECTIONAL` (class-3, n=1, weeks-not-months).
- **Replacement signal:** `PRX-1` (production cohort retention curve). **Blocking:** part of `INC-2`; DP effect size stays `INC-1` (owned by NEU-900 suite / NEU-906).

### MC-2 · Schema transfer vs surface memorization (+ expertise-reversal boundary) — `v1.0`
- **Governs:** P2, FM2, D2, BM-1, BM-7, R2 (`H-F1`); CAND-4, CAND-5, CAND-6.
- **Intended learner behavior:** The learner forms a *transferable* schema (solves a novel instance of the pattern), not just recalls the trained surface solution (FM2, X1).
- **Metric:** Transfer-probe pass rate on a **novel** instance of the pattern (Level-2/3 probe) contrasted with the trained instance — `FEAS-1`/`FEAS-2`.
- **Collection method:** `JNY-F1` CONTENT CREATION (subgoal-labeled worked-example chunk) → TEACHING FLOW at two fixed prerequisite positions (A1 first pattern → BM-1; A2 harder pattern → BM-7); class-3, n=1.
- **Threshold / decision rule:** **DIRECTIONAL** — novel-instance pass with the subgoal schema ⇒ transfer signal `present`; novel-instance fail after a trained-instance pass ⇒ FM2 (surface memorization) `present`. The **expertise-reversal boundary (BM-7) is INCOMPLETE** (G2.1, EX5): the contract *surfaces* it and authorizes **no** boundary verdict.
- **Nondeterminism tolerance:** `GRADER-VAR` (probe scored via `quality`) across `≥2` runs.
- **Evidence-status label:** `PROXY-DIRECTIONAL` — a proxy probe, **not** a validated transfer instrument (`INC-1`).
- **Replacement signal:** `PRX-2` (production novel-problem transfer rate). **Blocking:** part of `INC-2`; transfer validity stays `INC-1`.

### MC-3 · Long-horizon decay/relapse & hierarchical scheduling — `v1.0`
- **Governs:** FM1, FM3, BM-3, BM-4, R7 (`H-F2`); CAND-7.
- **Intended learner behavior:** After a long gap a mastered pattern decays and needs re-learning (BM-4); and review for hierarchical multi-month DP dependencies must be correctly scheduled (BM-3/FM3).
- **Metric:** BM-4 — presence of decay-then-relearn on the constructed timeline; BM-3 — schedule-adequacy for interdependent patterns.
- **Collection method:** `JNY-F2` paper / Wizard-of-Oz timeline (a multi-month decay curve and a multi-pattern schedule cannot be compressed into an MCP session); class-3 (paper artifact).
- **Threshold / decision rule:** BM-4 **DIRECTIONAL** — decay observed on the (time-compressed, illustrative) timeline ⇒ relapse `present`; **no measured decay curve** is claimed (G1.1). BM-3 **COLLECTION-GAP** — the *optimal hierarchical schedule* is **cap-bound INCOMPLETE** (G1.2, EX5); the contract **invents no interval rule** and authorizes no schedule verdict.
- **Nondeterminism tolerance:** `DET` (paper artifact; the illustration is fixed and labeled time-compressed).
- **Evidence-status label:** `PROXY-DIRECTIONAL` (BM-4) / `COLLECTION-GAP` (BM-3 optimum).
- **Replacement signal:** `PRX-3` (production long-horizon retention + schedule-outcome telemetry). **Blocking:** `INC-2` (no interval rule invented); BM-3 optimum unanswerable within caps.

### MC-4 · AI-grading over-validation / false confidence — `v1.0`
- **Governs:** FM4, R3, BM-5, RA5, D3, P3 (`H-F3`); CAND-19, CAND-20.
- **Intended learner behavior:** The learner is **not** told a wrong/shallow DP answer is good — the grader does not over-validate and manufacture false confidence (FM4, X4).
- **Metric:** Over-validation rate — proportion of deliberately shallow/wrong adversarial DP answers the server-derived grading scores as pass / `quality ≥ 3` (`FEAS-1`/`FEAS-2`), with adversarial shallowness varied across runs.
- **Collection method:** `JNY-F3` real `submit_answer` grading path; derived `quality`/`action` **read from the response, never fabricated** (server never-fabricate-scores rule); class-3 dogfooding of a class-4 grader, n=1, a few items.
- **Threshold / decision rule:** **BOUNDING** — any over-validation on the adversarial items ⇒ FM4 `present` **for those items**. This **bounds** classes 4–5 for the specific items; it does **not** establish DP-domain grading **reliability** (G5.1). RA5 retained: AI grading is **not** the signal of record.
- **Nondeterminism tolerance:** `GRADER-VAR` + `MODEL-VERSION-BOUND` — a reading is valid only for the exact grader model/version recorded; a model change is a new run, not a reinterpretation.
- **Evidence-status label:** `PROXY-BOUNDING`.
- **Replacement signal:** `PRX-4` (OUT-7 automated-eval DP-grading reliability bound). **Blocking:** reliability stays `INC-3` (OUT-7 / NEU-902, adjudicated NEU-906).

### MC-5 · Motivation & adherence under grind culture — `v1.0`
- **Governs:** FM5, R5, BM-6, M1–M4, RA2 (`H-B2`); CAND-24, CAND-25, CAND-26.
- **Intended learner behavior:** A rating-motivated learner keeps up scheduled review rather than abandoning it for contest-volume grinding (FM5, X3).
- **Metric:** Adherence **shape** at n=1 — scheduled reviews completed vs due, and the grind-vs-review choice (`FEAS-8`: `streakDays`, `dueToday`, `overdue`).
- **Collection method:** `JNY-B2` paper / Wizard-of-Oz role-play across a simulated week; class-3, n=1. Existing MCP cannot manufacture population adherence.
- **Threshold / decision rule:** **DIRECTIONAL, SHAPE-ONLY** — the run may show the adherence-collapse *shape* (FM5) `present`; it authorizes **no prevalence, demand, preference, or market conclusion** (EX3/BX-3 — the wall most at risk here). R5 is **non-downgradable** (G-a) regardless of the reading.
- **Nondeterminism tolerance:** `DET` for the counters; the role-play choice is a single-participant illustration, not a distribution.
- **Evidence-status label:** `CLASS-7-DEFERRED` (prevalence) + `PROXY-DIRECTIONAL` (failure shape at n=1).
- **Replacement signal:** `PRX-5` (production adherence / retention-of-schedule rate). **Blocking:** prevalence is `INC-5` (class-7, no in-program owner).

### MC-6 · Per-DP-pattern mastery signal — `v1.0`  *(core of `INC-2`)*
- **Governs:** BM-8, R6, CAND-17 — the scoring-feasibility state gating BM-1…BM-7.
- **Intended learner behavior:** The system can say, per DP pattern, how well the learner has mastered it (to score any of the above journeys).
- **Metric:** A per-DP-pattern mastery estimate.
- **Collection method:** **NONE today** — `FEAS-6` `UNAVAILABLE` (no schema field). `JNY-B1`'s BM-8 half is **capability inspection only** (which signals are persisted vs computed), never a scoring run.
- **Threshold / decision rule:** **NONE — `COLLECTION-GAP`.** The contract authorizes **no** verdict and **invents no threshold** (doing so would be an `OC-5` failure). It **specifies the later work**: design a per-pattern content model + a computed mastery estimator + schema storage (out of this task's altitude, EX4/EX5).
- **Nondeterminism tolerance:** `—` (no metric exists yet).
- **Evidence-status label:** `COLLECTION-GAP`.
- **Replacement signal:** `PRX-6` (validated production per-pattern mastery signal). **Blocking:** this contract **is** the `INC-2` mastery artifact; its *value* remains uncollectible until the telemetry exists.

### MC-7 · `averageQuality` session-summary signal — `v1.0`
- **Governs:** CAND-15, P4, R6.
- **Intended learner behavior:** A learner's recent-session quality is summarized truthfully (not shown as `0`/absent, and not shown as validated mastery).
- **Metric:** Session mean of per-attempt `quality` (`FEAS-2`).
- **Collection method:** **NONE today** — `FEAS-5` `UNCOMPUTED` (`learner-context-workflows.ts` L170 hardcodes `averageQuality: 0`, TODO). Derivable by aggregating `sessionQuestionAttempts.quality`, but not collected.
- **Threshold / decision rule:** **NONE — `COLLECTION-GAP`.** Authorizes no verdict; specifies the aggregation as later work; **forbids** presenting the stubbed `0` as a real signal (the exact P4 trap).
- **Nondeterminism tolerance:** `GRADER-VAR` once implemented (aggregate of LLM-derived quality).
- **Evidence-status label:** `COLLECTION-GAP`.
- **Replacement signal:** `PRX-7` (production session-quality aggregate). **Blocking:** part of `INC-2`.

### MC-8 · `time_spent_ms` reliability — `v1.0`
- **Governs:** CAND-18, R6 (RQ4 G4.1).
- **Intended learner behavior:** Time-on-task reflects real engaged effort, not idle/AFK time — before any metric trusts it.
- **Metric:** A reliability/noise characterization of `time_spent_ms` in real usage (outlier/idle rate).
- **Collection method:** `FEAS-3` `COMPUTABLE-UNVALIDATED` — the value is persisted (`schema.ts` L211) but its real-usage reliability is unverified; characterizing it needs the **privacy-gated aggregate log study `PLA-3`** (`05_…`), never a raw-payload export.
- **Threshold / decision rule:** **NONE until characterized — `COLLECTION-GAP` on reliability.** Until `PLA-3` yields an aggregate reliability bound, `time_spent_ms` is a **supporting proxy only**, never a sole verdict basis.
- **Nondeterminism tolerance:** `DET` (the stored value) — but reliability, not determinism, is the open question.
- **Evidence-status label:** `COLLECTION-GAP` (reliability).
- **Replacement signal:** `PRX-7` (production time-on-task distribution, aggregate). **Blocking:** part of `INC-2`; depends on `PLA-3`.

### MC-9 · DP-domain retention→transfer effect (the High-risk umbrella) — `v1.0`
- **Governs:** R1 (**High**, non-downgradable), P1 effect size, BM-1/BM-2/BM-4 transfer claim, CAND-3.
- **Intended learner behavior:** The retrieval+spacing / schema mechanism actually moves the learner's **DP problem-solving skill in-domain** — not just a math-analogy proxy.
- **Metric:** In-domain DP problem-solving skill movement attributable to the mechanism.
- **Collection method:** Directional proxy only via `JNY-B1`/`JNY-F1`/`JNY-F2`; the **in-domain effect is `INC-1`** — DP-domain benchmark evidence owned by the NEU-900 suite (results NEU-904/905), adjudicated by NEU-906.
- **Threshold / decision rule:** **DIRECTIONAL proxy only** — no effect-size claim authorized (G1.1). R1 stays **UNRESOLVED and non-downgradable** until in-domain measurement + adjudication exist; the contract cannot settle or drop it (`OC-7`).
- **Nondeterminism tolerance:** `GRADER-VAR` across repeat runs.
- **Evidence-status label:** `PROXY-DIRECTIONAL` (depends on `INC-1`).
- **Replacement signal:** `PRX-1` + `PRX-2` combined (production skill-transfer signal). **Blocking:** `INC-1` (benchmark evidence, not owned here).

### MC-10 · Demand for the differentiators — `v1.0`
- **Governs:** R4 (**High**, non-downgradable), D1 demand, RA6, CAND-10, EX3.
- **Intended learner behavior:** Real learners *want* the built-in retention/transfer model (they adopt and pay attention to it) — the demand the differentiators assume.
- **Metric:** External-user demand / adoption for D1–D4.
- **Collection method:** **NONE in this program stage** — this is a **class-7** question; "an empty niche is not demand evidence" (RQ3 F3.3). No creator/AI proxy may stand in for it (EX3/BX-3).
- **Threshold / decision rule:** **NONE — `CLASS-7-DEFERRED`.** Authorizes no verdict; R4 stays UNRESOLVED and non-downgradable.
- **Nondeterminism tolerance:** `—`.
- **Evidence-status label:** `CLASS-7-DEFERRED`.
- **Replacement signal:** `PRX-8` (external-user demand signal — a **future real-user program only**, no current owner). **Blocking:** `INC-5` (class-7).

## 2. Non-measured settled decisions (`MC-11`) — measured by audit, not metric

`MC-11 · v1.0` is a single contract recording the material requirements/decisions that are **settled at product altitude** and therefore governed by **audit**, not a measurement metric. No evidence run is gated on them and **no proxy is claimed** for them. Assigning them a metric would be inventing measurement where none is needed.

- **Governs:** DEC1–DEC5; P3, P5, P6 (discipline principles that *constrain how* measurement is done, verified by audit — P5 by the `05_…` privacy gate, P3/P6 by the evidence-status labels of `00_…` §3.1); EX1–EX6; BX-1…BX-5; RA1, RA3, RA4; D4/R8 (capability-only, no product-fit metric asserted).
- **Metric / threshold / nondeterminism / replacement:** `—` (`NON-MEASURED-SETTLED`).
- **Collection method (audit basis):** NEU-899 orphan checks `OC-1…OC-7`; this package's self-check (`06_…`); the privacy gate (`05_…`) for P5/EX6/BX-5.
- **Evidence-status label:** `NON-MEASURED-SETTLED`.
- **Rule:** These items **pass the mapping gate** (`03_…`) as settled decisions with no measurement contract required; they are **not** unmapped. A High risk is **never** placed here (`OC-7`); RA5 is measured via MC-4, not settled-away.

## 3. Contract → journey / marker coverage summary

| Contract | Journey(s) | Governs (headline) | Status label | Marker |
| --- | --- | --- | --- | --- |
| MC-1 | JNY-B1 | Spaced retention (P1/FM1/BM-2) | `PROXY-DIRECTIONAL` | `INC-2`; ↓`INC-1` |
| MC-2 | JNY-F1 | Schema transfer + reversal (P2/FM2/BM-1/BM-7) | `PROXY-DIRECTIONAL` | `INC-2`; ↓`INC-1` |
| MC-3 | JNY-F2 | Decay/relapse + hierarchical schedule (FM1/FM3/BM-3/BM-4) | `PROXY-DIRECTIONAL` / `COLLECTION-GAP` | `INC-2`; G1.2 |
| MC-4 | JNY-F3 | AI over-validation (FM4/R3/BM-5/RA5) | `PROXY-BOUNDING` | ↓`INC-3` |
| MC-5 | JNY-B2 | Adherence under grind (FM5/R5/BM-6/M1–M4) | `CLASS-7-DEFERRED` / `PROXY-DIRECTIONAL` | `INC-5` |
| MC-6 | JNY-B1 (inspect) | Per-pattern mastery signal (BM-8/R6) | `COLLECTION-GAP` | `INC-2` core |
| MC-7 | — (signal) | `averageQuality` aggregate (CAND-15/P4) | `COLLECTION-GAP` | `INC-2` |
| MC-8 | — (signal) | `time_spent_ms` reliability (CAND-18) | `COLLECTION-GAP` | `INC-2`; `PLA-3` |
| MC-9 | JNY-B1/F1/F2 | DP transfer effect — R1 (High) | `PROXY-DIRECTIONAL` | `INC-1` |
| MC-10 | — | Demand — R4 (High) | `CLASS-7-DEFERRED` | `INC-5` |
| MC-11 | — | Settled scope/discipline decisions | `NON-MEASURED-SETTLED` | — |
