# Hypothesis Automation Classification (`ACL-1…ACL-10`)

**Task:** NEU-902 · **Compiled:** 2026-07-11 · **Inputs:** the frozen contract register `MC-1…MC-11` (`../measurement-contracts/01_…`) + the materiality inventory (`../product-model/02_…`).
Every material hypothesis is classified **automatable** or **non-automatable** by the deterministic test in `00_…` §3. Non-automated ones carry the explicit validity/proportionality rationale acceptance scenario 3 requires **and** the named non-automated evidence path they remain covered by — none is dropped from the inventory.

---

## 1. The material-hypothesis inventory being classified

The feature-wide materiality inventory carries each material hypothesis through exactly one frozen measurement contract (`../measurement-contracts/01_…`). The complete set to classify is the ten hypothesis-carrying contracts `MC-1…MC-10`; `MC-11` is `NON-MEASURED-SETTLED` (settled scope/discipline decisions **measured by audit, not a metric**) and therefore carries **no hypothesis to automate** — recorded here so nothing disappears (`ACL` note at end of §2). This inventory is complete against NEU-901's register and NEU-898's candidate inventory.

## 2. Classification register

Each row applies `00_…` §3 clauses 1–5 in order; the first failing clause is the recorded rationale.

### ACL-1 · MC-1 / H-B1 (retention half) — spaced retention of a learned DP pattern
- **Governs:** P1, FM1, BM-2, J4; CAND-1, CAND-23.
- **Test result:** FAIL at **clause 2 (session-sizable)** and clause 1 (oracle). Retention is a property of a *person* recalling a pattern across `≥2` real spaced intervals (`interval_days`); there is no authored oracle for "did a human still remember it weeks later," and the window cannot be compressed into one initialized run.
- **Classification:** **NON-AUTOMATABLE.**
- **Rationale (validity):** Automation would have to fabricate a learner's memory state; a class-5 oracle cannot stand in for human retention without becoming an invalid proxy. Disproportionate even if approximated (needs real elapsed time).
- **Retained evidence path:** `JNY-B1` class-3 dogfooding (n=1, directional), `MC-1 v1.0 PROXY-DIRECTIONAL`; replacement `PRX-1`; effect size stays `INC-1`.

### ACL-2 · MC-2 / H-F1 — schema transfer vs surface memorization (+ expertise-reversal boundary)
- **Governs:** P2, FM2, D2, BM-1, BM-7, R2; CAND-4, CAND-5, CAND-6.
- **Test result:** FAIL at **clause 1 (oracle)**. Whether a *learner* formed a transferable schema (solved a novel instance because they generalized, not memorized) is a human cognitive outcome; no authored input has a deterministic "schema-formed" ground truth. The BM-7 expertise-reversal slice is additionally `INCOMPLETE` (G2.1, EX5).
- **Classification:** **NON-AUTOMATABLE.**
- **Rationale (validity):** A transfer verdict requires a validated transfer instrument on a real learner; automating it would launder a proxy probe as a transfer measurement (the exact `INC-1` limitation).
- **Retained evidence path:** `JNY-F1` class-3 dogfooding, `MC-2 v1.0 PROXY-DIRECTIONAL`; replacement `PRX-2`; transfer validity stays `INC-1`.

### ACL-3 · MC-3 / H-F2 — long-horizon decay/relapse & hierarchical scheduling
- **Governs:** FM1, FM3, BM-3, BM-4, R7; CAND-7.
- **Test result:** FAIL at **clause 2 (session-sizable)**. A multi-month decay curve and a multi-pattern hierarchical schedule cannot be produced in one initialized run; BM-3's optimal schedule is `COLLECTION-GAP` / cap-bound `INCOMPLETE` (G1.2, EX5).
- **Classification:** **NON-AUTOMATABLE.**
- **Rationale (proportionality):** Automation cannot fast-forward real forgetting; a synthetic timeline would be illustrative, not measured — no valid class-5 oracle for real decay.
- **Retained evidence path:** `JNY-F2` class-3 paper / Wizard-of-Oz timeline, `MC-3 v1.0 PROXY-DIRECTIONAL` (BM-4) / `COLLECTION-GAP` (BM-3); replacement `PRX-3`.

### ACL-4 · MC-4 / H-F3 — AI-grading over-validation / false confidence  ⟶ **AUTOMATABLE**
- **Governs:** FM4, R3, BM-5, RA5, D3, P3; CAND-19, CAND-20.
- **Test result:** **PASS** on all five clauses. (1) Oracle: each case is an **authored** DP answer whose correctness is a fixed, human-independent property — a deliberately shallow/wrong answer has ground truth "should not pass"; a strong control has ground truth "should pass." (2) Session-sizable: the `submit_answer` grading path returns a verdict per call, no elapsed time. (3) Signal collectible now: `FEAS-1`/`FEAS-2` — pass/`quality` are computed today from the real grading path. (4) Class-fit: `MC-4`'s replacement is `PRX-4` = *OUT-7 automated-eval DP-grading reliability bound*, blocking marker `INC-3` — the program explicitly routes this hypothesis to the class-5 path. (5) Bounded: fits in one hypothesis, ≤ 18 cases (`ACS-1`, `02_…`).
- **Classification:** **AUTOMATABLE.** Full definition: **`AEP-1`** (`02_…`); case set `ACS-1 v1.0`.
- **Retained evidence path:** promotes `JNY-F3`'s class-3-of-a-class-4 dogfood into the versioned class-5 `[automated-eval]` bound the program reserved for `INC-3` / `PRX-4`. Still **bounds**, does not establish full reliability (MC-4 rule).

### ACL-5 · MC-5 / H-B2 — motivation & adherence under grind culture
- **Governs:** FM5, R5, BM-6, M1–M4, RA2; CAND-24, CAND-25, CAND-26.
- **Test result:** FAIL at **clause 1 (oracle)** and clause 4 (class-fit). Adherence *prevalence* is a `CLASS-7-DEFERRED` real-user/population question (`INC-5`); the failure *shape* is a class-3 role-play. No authored oracle yields population adherence.
- **Classification:** **NON-AUTOMATABLE.**
- **Rationale (validity):** Automating adherence would manufacture a population distribution that only real users can supply — a direct `EX3`/`BX-3` wall crossing (no market/demand/preference conclusion from proxy).
- **Retained evidence path:** `JNY-B2` class-3 paper role-play (shape only) + `INC-5` class-7 deferral; `MC-5 v1.0`; replacement `PRX-5`. R5 non-downgradable (G-a).

### ACL-6 · MC-6 — per-DP-pattern mastery signal
- **Governs:** BM-8, R6; CAND-17.
- **Test result:** FAIL at **clause 3 (signal collectible now)**. `FEAS-6 UNAVAILABLE` — no schema field for a per-pattern mastery estimate exists; `MC-6` is `COLLECTION-GAP` and authorizes no verdict.
- **Classification:** **NON-AUTOMATABLE.**
- **Rationale (validity):** Automating an evaluation of a signal that does not exist would invent the very metric `MC-6` refuses to invent (`OC-5`). The gate is the missing content model + estimator + storage (EX4/EX5), not an eval.
- **Retained evidence path:** `MC-6 v1.0 COLLECTION-GAP` (`INC-2` core, SUB-4); specifies later telemetry work; replacement `PRX-6`.

### ACL-7 · MC-7 — `averageQuality` session-summary signal
- **Governs:** CAND-15, P4, R6.
- **Test result:** FAIL at **clause 3 (signal collectible now)**. `FEAS-5 UNCOMPUTED` — `averageQuality` is hardcoded `0` (`learner-context-workflows.ts` L170, TODO); the aggregate is derivable but not collected today.
- **Classification:** **NON-AUTOMATABLE.**
- **Rationale (proportionality):** There is no computed signal to score; automating an eval of a stubbed `0` would risk presenting the stub as a real signal (the exact P4 trap `MC-7` forbids). The proportionate next step is the aggregation, owned by SUB-4/downstream, not an eval.
- **Retained evidence path:** `MC-7 v1.0 COLLECTION-GAP` (`INC-2`); replacement `PRX-7`.

### ACL-8 · MC-8 — `time_spent_ms` reliability
- **Governs:** CAND-18, R6.
- **Test result:** FAIL at **clause 3 (signal collectible now)** for the *reliability* question. `FEAS-3 COMPUTABLE-UNVALIDATED` — the value is persisted but its real-usage reliability needs the **privacy-gated aggregate log study `PLA-3`** (`../measurement-contracts/05_…`), not an automated case set.
- **Classification:** **NON-AUTOMATABLE.**
- **Rationale (validity + proportionality):** Reliability of a real-usage timing signal is a class-6 operational-log characterization gated by the OUT-4 privacy gate; an authored automated case cannot observe real idle/AFK behavior, and doing so via raw logs would violate `EX6`/`BX-5`.
- **Retained evidence path:** `MC-8 v1.0 COLLECTION-GAP` (reliability) via `PLA-3` (`INC-2`); replacement `PRX-7`.

### ACL-9 · MC-9 — DP-domain retention→transfer effect (R1, **High**)
- **Governs:** R1 (High, non-downgradable), P1 effect size, BM-1/BM-2/BM-4 transfer claim; CAND-3.
- **Test result:** FAIL at **clause 4 (class-fit)** and clause 1 (oracle). The in-domain skill-movement effect is `INC-1` **benchmark** evidence owned by the NEU-900 suite (NEU-904/905), adjudicated by NEU-906 — not a class-5 oracle question. No authored input yields "the mechanism moved a real learner's DP skill."
- **Classification:** **NON-AUTOMATABLE.**
- **Rationale (validity):** An automated eval would test what an oracle encodes, never in-domain human skill movement; presenting it as the R1 effect would be a proxy-laundering of the High-risk umbrella. R1 stays UNRESOLVED, non-downgradable (`OC-7`).
- **Retained evidence path:** `MC-9 v1.0 PROXY-DIRECTIONAL` via `JNY-B1/F1/F2`; effect `INC-1`; replacement `PRX-1`+`PRX-2`.

### ACL-10 · MC-10 — demand for the differentiators (R4, **High**)
- **Governs:** R4 (High, non-downgradable), D1 demand, RA6, EX3; CAND-10.
- **Test result:** FAIL at **clause 1 (oracle)** and clause 4 (class-fit). Demand is a `CLASS-7-DEFERRED` external-user question (`INC-5`); "an empty niche is not demand evidence." No proxy — creator, AI, or automated — may stand in (EX3/BX-3).
- **Classification:** **NON-AUTOMATABLE.**
- **Rationale (validity):** Automating "do real users want this" is categorically invalid at class 5; it is the canonical forbidden class-7 laundering.
- **Retained evidence path:** `MC-10 v1.0 CLASS-7-DEFERRED` (`INC-5`, no in-program owner); replacement `PRX-8` (future real-user program only). R4 non-downgradable.

**`MC-11` note (no hypothesis to classify):** `MC-11 v1.0 NON-MEASURED-SETTLED` records settled scope/discipline decisions (DEC1–DEC5, EX1–EX6, BX-1…BX-5, RA1/RA3/RA4, D4/R8 capability-only, P3/P5/P6). These are governed by **audit, not a metric**; there is no measurement hypothesis and therefore nothing to automate. Recorded so the classification is complete over the whole register.

## 3. Classification summary

| ACL | Contract / hypothesis | Classification | First failing clause | Retained non-automated path |
| --- | --- | --- | --- | --- |
| ACL-1 | MC-1 / H-B1 retention | NON-AUTOMATABLE | 2 (session) | JNY-B1 class-3; INC-1 |
| ACL-2 | MC-2 / H-F1 transfer | NON-AUTOMATABLE | 1 (oracle) | JNY-F1 class-3; INC-1 |
| ACL-3 | MC-3 / H-F2 decay/schedule | NON-AUTOMATABLE | 2 (session) | JNY-F2 class-3 paper |
| **ACL-4** | **MC-4 / H-F3 over-validation** | **AUTOMATABLE** | — (PASS) | **AEP-1 / ACS-1 v1.0 (class-5)** |
| ACL-5 | MC-5 / H-B2 adherence | NON-AUTOMATABLE | 1 (oracle) | JNY-B2 class-3 + INC-5 |
| ACL-6 | MC-6 per-pattern mastery | NON-AUTOMATABLE | 3 (signal) | MC-6 COLLECTION-GAP; INC-2 |
| ACL-7 | MC-7 averageQuality | NON-AUTOMATABLE | 3 (signal) | MC-7 COLLECTION-GAP; INC-2 |
| ACL-8 | MC-8 time_spent_ms reliab. | NON-AUTOMATABLE | 3 (signal) | MC-8 COLLECTION-GAP via PLA-3 |
| ACL-9 | MC-9 DP transfer effect (R1) | NON-AUTOMATABLE | 4 (class-fit) | MC-9 PROXY-DIRECTIONAL; INC-1 |
| ACL-10 | MC-10 demand (R4) | NON-AUTOMATABLE | 1 (oracle) | MC-10 CLASS-7-DEFERRED; INC-5 |

**Result:** 10 / 10 material hypotheses classified; **1 automatable** (`ACL-4`), 9 non-automatable each with a recorded rationale and a retained evidence path. The automatable count (1) is `≤ 6`; the case budget is carried by `ACS-1` (`02_…`, `≤ 18`). No hypothesis left the inventory (acceptance scenario 3).
