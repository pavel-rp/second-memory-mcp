# Proxy-Replacement Contracts & Dry-Run

**Task:** NEU-901 · **Compiled:** 2026-07-11 · **Contracts:** `01_…`.
Every measurement in this program stage is a **proxy** — class-3 creator dogfooding, class-4 AI review, or a code-capability inspection — **never** external-user, expert, or market validation (EX3; `../benchmark-suite/03_…`, `04_…`). This file makes each accepted proxy name the **production / external-user signal that will replace or revise it**, the result that triggers **revision vs confirmation**, and a **dry-run-able replacement process**. It sets **no** mutable status (NEU-906 via `LINK-4`) and invents **no** current-status value (acceptance scenario 5). This is the `INC-4` artifact (revision rules & production replacement signals).

---

## 1. Replacement-contract schema (`PRX-*`)

| Field | Meaning |
| --- | --- |
| **`PRX-id`** | `PRX-<n>` + the `MC-*` proxy it replaces/revises. |
| **Proxy replaced** | The current proxy metric + its evidence-status label (`00_…` §3.1). |
| **Production / external-user replacement signal** | The real signal that supersedes the proxy — what it is and the *evidence class* it would be (class-6 operational-log aggregate, class-7 real-user). Named, not built here (EX4). |
| **Confirmation trigger** | The replacement result that **confirms** the proxy's direction (no contract change — the proxy stood up). |
| **Revision trigger** | The replacement result that **contradicts/revises** the proxy ⇒ a **new contract version + rerun** (`00_…` §4) and routes affected elements to NEU-906. |
| **Discoverability** | The affected requirements/decisions (`R*`,`P*`,`BM-*`,`D*`) a revision would touch — so a contradiction is *discoverable*, per acceptance scenario 5. |

## 2. The replacement contracts

| Id | Proxy replaced (`MC-*`) | Production / external-user replacement signal | Confirmation trigger | Revision trigger (⇒ new version + rerun) | Affected (discoverable) |
| --- | --- | --- | --- | --- | --- |
| **PRX-1** | MC-1 spaced retention `PROXY-DIRECTIONAL` | **Class-6** aggregate cohort retention curve (recall-pass rate vs elapsed interval), privacy-gated (`PLA-1`). | Cohort retention holds across intervals in the proxy's direction. | Cohort shows no retention benefit, or decay faster than the proxy implied. | P1, FM1, BM-2, J4, R1 |
| **PRX-2** | MC-2 schema transfer `PROXY-DIRECTIONAL` | **Class-6/7** novel-problem transfer rate (pass on unseen instances of a trained pattern) across real learners. | Novel-instance transfer rate materially above surface-recall baseline. | Transfer indistinguishable from surface recall, or expertise-reversal confirmed for competent learners (BM-7). | P2, FM2, D2, BM-1, BM-7, R2 |
| **PRX-3** | MC-3 decay/relapse + schedule `PROXY-DIRECTIONAL`/`COLLECTION-GAP` | **Class-6** long-horizon retention + schedule-outcome telemetry (relapse rate; adherence-to-schedule vs retention). | Real decay/relapse matches the illustrated shape; scheduled reviews reduce relapse. | Real decay diverges from the illustration; a computed hierarchical schedule is later validated (closes G1.2 downstream, not here). | FM1, FM3, BM-3, BM-4, R7 |
| **PRX-4** | MC-4 AI over-validation `PROXY-BOUNDING` | **Class-5** OUT-7 automated-evaluation DP-grading **reliability** bound (`INC-3`, NEU-902), adjudicated by NEU-906. | Automated-eval confirms bounded, acceptable over-validation on the item class. | Automated-eval shows over-validation beyond the bound ⇒ FM4 realized; RA5 reaffirmed. | FM4, R3, BM-5, D3, RA5 |
| **PRX-5** | MC-5 adherence `CLASS-7-DEFERRED` | **Class-7** production adherence / schedule-retention rate across real learners. | Real adherence within a tolerable band; FM5 not dominant. | Real adherence collapses ⇒ FM5 realized; R5 stays High (non-downgradable regardless). | FM5, R5, BM-6, M1–M4 |
| **PRX-6** | MC-6 per-pattern mastery `COLLECTION-GAP` | **Validated production per-DP-pattern mastery signal** (a computed estimator + schema storage — later content-model work). | The built signal correlates with independent mastery evidence. | The signal fails validation or cannot be computed ⇒ BM-8 stays UNRESOLVED; scoring of BM-1…BM-7 remains gated. | BM-8, R6, all scored cells |
| **PRX-7** | MC-7/MC-8 `averageQuality` + `time_spent_ms` `COLLECTION-GAP` | **Class-6** aggregate session-quality + time-on-task distributions (privacy-gated `PLA-2`/`PLA-3`). | Aggregates are stable and reliable enough to support (not settle) a signal. | `time_spent_ms` proves unreliable (idle/outlier-dominated), or `averageQuality` cannot be aggregated meaningfully ⇒ signals stay supporting-only. | CAND-15, CAND-18, P4, R6 |
| **PRX-8** | MC-10 demand `CLASS-7-DEFERRED` | **Class-7** external-user demand/adoption — a **future real-user program only** (no current owner, `INC-5`). | Real adoption/willingness materializes for D1–D4. | No demand materializes ⇒ R4 realized. R4 stays High regardless (EX3). | R4, D1, D3, RA6 |

**No proxy is laundered.** Each `PRX-*` explicitly types the replacement as class-5/6/7 — never presents the *current* class-3/4 proxy as the replacement. A confirmation trigger firing does **not** upgrade any status here; it is input to NEU-906.

## 3. Dry-run of the replacement process (acceptance scenario 5 — no mutable status set)

**Scenario (simulated, not real):** a future production/external-user result **contradicts an accepted proxy** — say the class-6 cohort retention curve (`PRX-1`) shows **no** retention benefit, contradicting MC-1's `PROXY-DIRECTIONAL` "retention held" reading.

**Dry-run steps (executed on paper here; changes nothing):**

1. **Locate the proxy.** The contradicted signal is MC-1 (`PROXY-DIRECTIONAL`), replacement `PRX-1`.
2. **Fire the revision trigger.** `PRX-1`'s revision trigger ("cohort shows no retention benefit") matches ⇒ the immutable rule's expected action is: **open MC-1 `v2.0`** with the corrected metric/threshold and **require the affected evidence rerun** (`00_…` §4). The prior `v1.0` results are marked **inapplicable to `v2.0`**, not rescored.
3. **Discover the blast radius.** `PRX-1`'s "Affected" column ⇒ the contradiction is **discoverable** across **P1, FM1, BM-2, J4, R1** (and, through MC-9, the R1 High-risk umbrella). A reviewer walking the register reaches every element a revision would touch.
4. **Route, do not adjudicate.** The contradiction + the affected set are **routed to NEU-906** (via `LINK-4`) for the mutable-status decision. This dry-run **sets no status**: MC-1 keeps `v1.0`, R1 stays UNRESOLVED and non-downgradable, and no BM/R/D element is promoted or demoted.
5. **Result (expected adjudication action, not taken):** NEU-906 *would* mark MC-1-`v1.0` results inapplicable and require a `v2.0` rerun; R1 remains High. The immutable rule produced a **deterministic, expected** action **without** changing any current evidence status — which is exactly what acceptance scenario 5 requires.

**Confirmation direction (also dry-run):** had `PRX-1` instead *confirmed* MC-1's direction, the confirmation trigger fires, **no** new version is created, and the result is routed to NEU-906 as supporting input — again with **no** status set here. Confirmation and revision are symmetric: both are *inputs* to adjudication, neither is adjudication.

**Reproducibility.** Any operator can re-run this dry-run from the `PRX-*` table alone: pick a proxy, apply the stated trigger, read the affected set, and route — the process is fully specified and requires no data that does not exist.
