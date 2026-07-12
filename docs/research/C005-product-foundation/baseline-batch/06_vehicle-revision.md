# Vehicle Revision — JNY-B1/BM-2 & JNY-B2/BM-6 (versioned, reviewable)

**Task:** NEU-904 · **Compiled:** 2026-07-12 · **Governs:** `../benchmark-suite/01_journey-vehicles-and-fidelity.md` (NEU-900) vehicle selections for JNY-B1's BM-2 half and JNY-B2's BM-6.
This file records a **versioned vehicle revision** for the two class-3 creator-dogfooding halves that were carried `INCOMPLETE / pending-creator` in the first NEU-904 pass (`01_…` Part B, `03_…`, `05_…` §5). It **never rewrites** the original NEU-900 selection; it supersedes it *by pointer* with a new, reviewable version, its rationale, and an explicit account of what the original vehicle would have added that the revised vehicle does not. It **sets no BM-cell status, invents no metric/threshold, and draws no market/prevalence conclusion.**

**Why a revision exists (honestly).** The original vehicles required the **live human creator** — a live MCP staged run across `≥2` SM-2 spaced intervals (BM-2) and a simulated-week grind-vs-review role-play (BM-6). In the first pass the creator was **AFK** and the live tools were **unreachable**, so both halves were carried incomplete, not fabricated. The creator has since **declined the original live/role-play vehicles** and **authorized a lower-fidelity substitute**: retrospective, privacy-gated operational evidence from the production DB plus informal verbatim testimony. Per NEU-900's discipline that a re-selection may **never silently** change a vehicle (`02_batch-allocation.md` §4 routing rule; NEU-899 binding protocol "without editing evidence class, limitation, or id"), the substitution is recorded here as a distinct version rather than edited into `01_…`.

---

## 1. Relationship to NEU-900's infeasibility-routing rule (`../benchmark-suite/02_batch-allocation.md` §4)

NEU-900's routing rule is a **suite-scope** rule: it fires when the *material matrix cannot be covered* by ≤6 journeys / two ≤3 batches / ≤1 prototype, and it forbids resolving that by adding a journey, building a second prototype, dropping/downgrading a material cell, or relabeling a boundary wall. **That trigger is not met here** — the material matrix and journey set are unchanged; no cell is dropped or downgraded; no journey or prototype is added. What changed is the **vehicle** of two already-selected journeys, because the originally-selected vehicle became infeasible/declined at execution time.

The routing rule therefore does not *require* re-routing, but its **spirit governs**: a vehicle change must be **explicit, versioned, and reviewable — never silent**, and must not be used to smuggle coverage or downgrade a cell. This revision is recorded to satisfy that spirit. **Prohibition check:** no 4th baseline journey added (still JNY-B1, JNY-B2); no prototype built (`BATCH-BASELINE` permits none); no material cell dropped or downgraded (BM-2/BM-6 keep their inherited PROVISIONAL/UNRESOLVED states — §3); no `BX-*` wall relabeled as covered (EX3/BX-3 explicitly re-asserted for BM-6). ✅

## 2. The two vehicle versions

### JNY-B1 / BM-2 — spaced-retention

| | **Vehicle v1.0** (original, NEU-900) | **Vehicle v1.1** (revised, NEU-904) |
| --- | --- | --- |
| **Version / date** | v1.0 — `../benchmark-suite/01_…` JNY-B1, 2026-07-11 | v1.1 — this file, 2026-07-12 |
| **Vehicle** | Live MCP TEACHING FLOW / rolling-session loop (`start_learning`→`submit_answer`→`teach_next`) over one DP-pattern topic, re-exposed across `≥2` SM-2 intervals read from `interval_days`; creator as first-class **learner**. | **Retrospective, privacy-gated aggregate** of the creator's already-accumulated production learning data (repetition/interval ladders, quality distribution, completed-session mix) **+ informal verbatim creator testimony**. Evidence in `07_JNY-B1-BM2-retrospective-evidence.md`. |
| **Evidence class** | class-3 `[dogfooding]`, pre-registered protocol run | class-3 `[dogfooding]` **RETROSPECTIVE** (learning-table aggregates + testimony) **and** class-6 `[operational-log]` (request/event-log aggregates) — recorded as **separate** labeled records (§ class purity). |
| **Status at execution** | Infeasible in pass 1 (creator AFK; tools unreachable), then **declined** by creator in favor of v1.1. | Executed 2026-07-12 from the authorized snapshot. |

### JNY-B2 / BM-6 — motivation & adherence under grind culture

| | **Vehicle v1.0** (original, NEU-900) | **Vehicle v1.1** (revised, NEU-904) |
| --- | --- | --- |
| **Version / date** | v1.0 — `../benchmark-suite/01_…` JNY-B2, 2026-07-11 | v1.1 — this file, 2026-07-12 |
| **Vehicle** | Paper / Wizard-of-Oz role-play in which the creator role-plays the grind-vs-review decision across a **simulated week**; creator as `learner`/`wizard`. | **Retrospective, privacy-gated aggregate** of the creator's real month-by-month grind-vs-review mix, usage lapse, and current review debt **+ informal verbatim creator testimony** (which explicitly declines the role-play). Evidence in `08_JNY-B2-BM6-retrospective-evidence.md`. |
| **Evidence class** | class-3 `[dogfooding]` role-play | class-3 `[dogfooding]` **RETROSPECTIVE** (learning-table aggregates + testimony) **and** class-6 `[operational-log]` — **separate** labeled records. |
| **Status at execution** | Declined by creator: *"I'm not gonna roleplay a week lol"* (verbatim, 2026-07-12). | Executed 2026-07-12 from the authorized snapshot; real behavioral aggregates substitute for the simulated week. |

## 3. What the original vehicle would have added (fidelity delta — this is a DOWNGRADE)

The revised vehicle is **lower fidelity** than the original, not equivalent. Recording it is not a claim that the cell is now covered. The original v1.0 vehicles would have added, specifically:

- **Pre-registration under the frozen protocol.** v1.0 runs would have been collected under `../benchmark-suite/03_creator-dogfooding-protocol.md` with held-constant / varied dimensions fixed **before** observation. The v1.1 aggregates are **retrospective** — collected after the behavior, never pre-registered.
- **`interval_days`-driven spacing on a single tracked pattern (BM-2).** The live loop would have re-exposed **one** DP pattern at the server-emitted `interval_days` and recorded per-re-review retention of *that* pattern. The v1.1 repetition/interval ladders are **pooled across chunks** — they show interval growth in aggregate, not the retention trajectory of a single tracked pattern across its own re-reviews.
- **Sealed-conclusion ordering.** v1.0's `OBS-creator-conclusion` would have been written **last and sealed** until the AI verdicts committed (`03_…` §3). v1.1 has **no sealed creator conclusion**; the testimony is informal and pre-existing.
- **Structured role-play with controlled grind-pressure (BM-6).** v1.0 would have varied grind-pressure one dimension at a time across a simulated week with adherence counters (`streakDays`/`dueToday`/`overdue`) read live. v1.1 reads real historical mix and current debt — richer in some ways (real behavior, not simulated) but **uncontrolled**, retrospective, and n=1.
- **No structured interview.** The creator supplied informal in-conversation testimony; **no structured interview answers** were collected.

**Consequence (unchanged inherited status).** BM-2 remains **PROVISIONAL → UNRESOLVED via `INC-1`** (DP-domain retention/transfer benchmark evidence, owned by the NEU-900 suite, adjudicated by NEU-906). BM-6 remains **PROVISIONAL/Gap (G6.1)**; its **prevalence stays `CLASS-7-DEFERRED` / `INC-5`** (no in-program owner); **R5 (High) is untouched and non-downgradable** (`OC-7`); BM-6 evidence is **failure-*shape* only**, and **no market / demand / preference / prevalence conclusion** may be drawn (EX3/BX-3). This revision changes the **vehicle and its fidelity**, not the cell's status — adjudication remains **NEU-906's** exclusive authority via `LINK-4`.

## 4. Reviewability

This revision is reviewable because it is versioned (v1.0 vs v1.1, both preserved), carries its rationale and fidelity delta, names the exact evidence files it authorizes (`07_…`, `08_…`), and preserves every original record append-only (`01_…` Part B and `03_…` are **not** overwritten; they gain a resolution pointer only). A reviewer can compare v1.0 and v1.1 side by side and independently judge whether the substitution is an honest lower-fidelity fallback or an over-reach. The independent AI reviews of the resulting evidence packages are in `09_…` (BM-2) and `10_…` (BM-6).
