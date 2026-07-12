# Vehicle Revision — JNY-F1 (BM-1/BM-7) & JNY-F2 (BM-3/BM-4) (versioned, reviewable)

**Task:** NEU-905 · **Compiled:** 2026-07-12 · **Governs:** `../benchmark-suite/01_journey-vehicles-and-fidelity.md` (NEU-900) vehicle selections for JNY-F1 and JNY-F2. **Follows the precedent** established by NEU-904 (`../baseline-batch/06_vehicle-revision.md`).
This file records a **versioned vehicle revision** for the two class-3 creator-dogfooding failure journeys whose original vehicles required the **live human creator**. It **never rewrites** the original NEU-900 selection; it supersedes it *by pointer* with a new, reviewable version, its rationale, and an explicit account of what the original vehicle would have added that the revised vehicle does not. It **sets no BM-cell status, invents no metric/threshold, and draws no market/prevalence conclusion.** **JNY-F3 is not revised here** — its vehicle gate opened during NEU-903 and its evidence is bound (not duplicated) in `06_…`.

**Why a revision exists (honestly).** The original vehicles required the **live human creator**: JNY-F1 a live MCP CONTENT-CREATION→TEACHING-FLOW run at two prerequisite positions with a *novel-instance transfer probe*; JNY-F2 a *paper / Wizard-of-Oz decay timeline* the creator constructs. At execution time the creator was unavailable for live/paper runs and the live tools were unreachable (same condition NEU-903/904 recorded). The creator has **authorized a lower-fidelity substitute**: retrospective, privacy-gated operational evidence from the production DB plus informal verbatim testimony. Per NEU-900's discipline that a re-selection may **never silently** change a vehicle (`02_batch-allocation.md` §4 routing rule; NEU-899 binding protocol "without editing evidence class, limitation, or id"), the substitution is recorded here as a distinct version rather than edited into `01_…`.

---

## 1. Relationship to NEU-900's infeasibility-routing rule (`../benchmark-suite/02_batch-allocation.md` §4)

NEU-900's routing rule is a **suite-scope** rule: it fires when the *material matrix cannot be covered* by ≤6 journeys / two ≤3 batches / ≤1 prototype, and it forbids resolving that by adding a journey, building a second prototype, dropping/downgrading a material cell, or relabeling a boundary wall. **That trigger is not met here** — the material matrix and journey set are unchanged; no cell is dropped or downgraded; no journey or prototype is added. What changed is the **vehicle** of two already-selected journeys, because the originally-selected vehicle became infeasible/declined at execution time.

The routing rule therefore does not *require* re-routing, but its **spirit governs**: a vehicle change must be **explicit, versioned, and reviewable — never silent**, and must not be used to smuggle coverage or downgrade a cell. This revision is recorded to satisfy that spirit.

**Prohibition check.** ✅ No 4th failure journey added (still JNY-F1, JNY-F2, JNY-F3); ✅ no prototype built by NEU-905 (the suite's ≤1 allowance is already spent on NEU-903's JNY-F3 minimal harness — `00_…` §4; building a second would breach the cap); ✅ no material cell dropped or downgraded (BM-1/BM-7/BM-3/BM-4 keep their inherited PROVISIONAL/INCOMPLETE/UNRESOLVED states — §3); ✅ no `BX-*` wall relabeled as covered (BX-1/BX-2 prerequisite walls, and the transfer≠recall conflict X1, explicitly re-asserted — §3).

## 2. The vehicle versions

### JNY-F1 / BM-1 + BM-7 — schema transfer vs surface memorization; expertise-reversal boundary

| | **Vehicle v1.0** (original, NEU-900) | **Vehicle v1.1** (revised, NEU-905) |
| --- | --- | --- |
| **Version / date** | v1.0 — `../benchmark-suite/01_…` JNY-F1, 2026-07-11 | v1.1 — this file, 2026-07-12 |
| **Vehicle** | Live MCP CONTENT CREATION (`create_topic_with_chunks` with a subgoal-labeled worked-example DP chunk) → TEACHING FLOW at **two fixed prerequisite positions** (A1 first-pattern → BM-1; A2 harder-pattern-for-a-competent-learner → BM-7), with a **Level-2/3 novel-instance transfer probe** to distinguish schema transfer from surface recall. | **Retrospective, privacy-gated aggregate** of the creator's already-accumulated production learning data (quality distribution incl. failed attempts, repetition/interval ladders, authoring-tool usage) **+ informal verbatim creator testimony**. Evidence in `02_JNY-F1-runs.md`. |
| **Evidence class** | class-3 `[dogfooding]`, pre-registered protocol run with a designed transfer probe | class-3 `[dogfooding]` **RETROSPECTIVE** (learning-table aggregates + testimony) **and** class-6 `[operational-log]` (request/event-log aggregates) — recorded as **separate** labeled records (§ class purity). |
| **Status at execution** | Infeasible (creator unavailable for live run; tools unreachable), then substituted by v1.1 under creator authorization. | Executed 2026-07-12 from the authorized snapshot. |

### JNY-F2 / BM-3 + BM-4 — long-horizon decay/relapse & hierarchical scheduling

| | **Vehicle v1.0** (original, NEU-900) | **Vehicle v1.1** (revised, NEU-905) |
| --- | --- | --- |
| **Version / date** | v1.0 — `../benchmark-suite/01_…` JNY-F2, 2026-07-11 | v1.1 — this file, 2026-07-12 |
| **Vehicle** | Paper / Wizard-of-Oz timeline the creator constructs — a decayed-pattern relapse scenario (BM-4) and a multi-pattern dependency review schedule (BM-3), labeled time-compressed. | **Retrospective, privacy-gated aggregate** of the creator's **real** month-by-month usage lapse (Dec-2025/Jan-2026 zero-activity gap), current review debt (266/271 overdue = 98%), and repetition/interval ladders **+ informal verbatim testimony**. Evidence in `04_JNY-F2-runs.md`. |
| **Evidence class** | class-3 `[dogfooding]` paper artifact | class-3 `[dogfooding]` **RETROSPECTIVE** (learning-table aggregates + testimony) **and** class-6 `[operational-log]` — **separate** labeled records. |
| **Status at execution** | Infeasible (creator unavailable to construct/run the paper timeline). | Executed 2026-07-12 from the authorized snapshot; **real** decay/relapse behavioral aggregates substitute for the simulated timeline — in one respect *higher* fidelity (real forgetting, not simulated) but uncontrolled and retrospective. |

## 3. What the original vehicle would have added (fidelity delta — this is a DOWNGRADE)

The revised vehicle is **lower fidelity** than the original on the cells' load-bearing claims, not equivalent. Recording it is not a claim that a cell is now covered. The original v1.0 vehicles would have added, specifically:

**JNY-F1 (BM-1 transfer, BM-7 reversal):**
- **A designed novel-instance transfer probe.** v1.0 would have administered a Level-2/3 probe on a *novel* instance of the pattern and contrasted it with the trained instance — the **only** way to distinguish schema *transfer* from surface *recall* (MC-2 metric). The v1.1 aggregates contain **no transfer probe**: pass/fail on historically-attempted items conflates recall and transfer. **Consequence: BM-1's transfer claim is not isolable retrospectively — carried as insufficient-evidence / INCOMPLETE, not `present`.**
- **Two controlled prerequisite trajectories (A1 vs A2).** v1.0 would have fixed A1 (first pattern) vs A2 (harder pattern for a competent learner) to surface the expertise-reversal boundary (BM-7). Retrospectively, n=1 cannot un-know a pattern and the A-axis is not independently controllable. **Consequence: BM-7 remains cap-bound INCOMPLETE (G2.1) — the revised vehicle cannot even *surface* the reversal, let alone resolve it (EX5).**
- **Pre-registration + sealed-conclusion ordering** under `../benchmark-suite/03_…`, absent here (retrospective, informal testimony).

**JNY-F2 (BM-4 decay/relapse, BM-3 schedule):**
- **A constructed, labeled decay timeline for a single tracked pattern (BM-4).** v1.0 would have laid out a decay-then-relearn scenario for one pattern. v1.1 shows **real** aggregate usage-lapse + review-debt across the whole corpus — richer as *real behavior* but **pooled**, uncontrolled, and not a per-pattern decay curve (still `PROXY-DIRECTIONAL`, no effect size, G1.1).
- **A multi-pattern hierarchical review schedule (BM-3).** v1.0's paper artifact would have *illustrated* a schedule for interdependent patterns. v1.1 cannot: the *optimal hierarchical schedule* is **cap-bound INCOMPLETE** (`COLLECTION-GAP`, G1.2) and the retrospective aggregate invents no interval rule (`INC-2`, SUB-4). **Consequence: BM-3 optimum stays INCOMPLETE regardless of the aggregates.**
- **Pre-registration + sealed conclusion**, absent here.

**Consequence (unchanged inherited status).** BM-1 remains **PROVISIONAL → UNRESOLVED via `INC-1`** (DP-domain transfer benchmark evidence, adjudicated NEU-906); **BM-7** remains **PROVISIONAL/INCOMPLETE (G2.1)**; **BM-4** remains **PROVISIONAL → UNRESOLVED via `INC-1`** (effect size G1.1); **BM-3** remains **INCOMPLETE (G1.2)**. R1 (High) and R7 are **untouched and non-downgradable** (`OC-7`). This revision changes the **vehicle and its fidelity**, not any cell's status — adjudication remains **NEU-906's** exclusive authority via `LINK-4`.

## 4. Reviewability

This revision is reviewable because it is versioned (v1.0 vs v1.1, both preserved), carries its rationale and fidelity delta, names the exact evidence files it authorizes (`02_…`, `04_…`), and preserves every original NEU-900 record append-only (`../benchmark-suite/01_…` is **not** overwritten). A reviewer can compare v1.0 and v1.1 side by side and independently judge whether the substitution is an honest lower-fidelity fallback or an over-reach — and, in particular, whether the retrospective vehicle's inability to isolate transfer (BM-1) or surface the reversal (BM-7) is faithfully carried as INCOMPLETE rather than smoothed into `supports`. The independent AI reviews of the resulting evidence packages are in `03_…` (JNY-F1) and `05_…` (JNY-F2); JNY-F3's binding and reviews are in `06_…`/`07_…`.
