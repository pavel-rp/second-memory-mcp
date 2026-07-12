# Proxy-Replacement Dry-Run (from the adjudicated status; history preserved)

**Task:** NEU-906 · **Compiled:** 2026-07-12 · **Contracts:** `../measurement-contracts/04_…` (`PRX-1…8`, immutable revision/confirmation rules).
Item 6 of the adjudication: for at least one **accepted proxy**, show how a future production/external-user signal would **replace or revise** it, **with history preserved**. Unlike the NEU-901 dry-run (which set no status), this dry-run starts from a **status this task actually adjudicated** (`03_…`) and walks the immutable `PRX-*` machinery from there. It **enacts no future flip** (the production signals do not exist yet); it demonstrates that a future contradiction/confirmation is discoverable and that this ledger's history is preserved when it arrives.

---

## 1. Chosen accepted proxy: MC-1 spaced retention (`PROXY-DIRECTIONAL-PRESENT` → decision **provisional**)

Adjudicated status (`03_…` H-B1 / BM-2): retention-holds **direction present** as a class-3 RETRO + class-6 proxy, decision status **provisional**; the DP in-domain effect is **unresolved (INC-1)**. Replacement contract: **PRX-1** — a **class-6 aggregate cohort retention curve** (recall-pass rate vs elapsed interval), privacy-gated by **PLA-1**.

### 1a. Revision branch (production contradicts the proxy)

**Simulated future result:** the PLA-1 cohort retention curve shows **no retention benefit** (decay as fast as no-spacing), contradicting MC-1's directional reading.

**Deterministic walk (enacted on paper; changes nothing now):**
1. **Locate.** Contradicted signal = MC-1 `PROXY-DIRECTIONAL-PRESENT`; replacement = PRX-1.
2. **Fire the revision trigger.** PRX-1's revision trigger ("cohort shows no retention benefit / faster decay") matches ⇒ the immutable rule requires **MC-1 `v2.0`** (corrected metric/threshold) + an **evidence rerun** (`../measurement-contracts/00_…` §4). Prior **`v1.0` results are marked `inapplicable to v2.0`, not rescored** (no retrospective rescoring).
3. **Discover the blast radius.** PRX-1 "Affected" ⇒ **P1, FM1, BM-2, J4, R1** (and, via MC-9, the R1 High umbrella). Every element a revision touches is reachable from the register.
4. **Adjudicate (what NEU-906 *would* then do).** Re-open this ledger's rows for P1/FM1/BM-2/J4: BM-2/H-B1 decision status **provisional → contradicted** (the proxy direction is overturned by higher-class evidence); **R1 stays unresolved and High, non-downgradable** (a contradiction cannot close a High risk, only keep it open). MC-1-`v1.0` reading is stamped **superseded-by-v2.0**, retained verbatim for history.
5. **History preservation.** The current `03_…` rows are **not deleted or overwritten** — a future revision **appends** a new dated status with a pointer to the superseded v1.0 reading (append-only, mirroring the upstream batches' discipline). An auditor can always read what was believed at `v1.0` and why it changed.

### 1b. Confirmation branch (production confirms the proxy)

**Simulated future result:** the PLA-1 curve **holds** across intervals in the proxy's direction.
- PRX-1's **confirmation trigger** fires ⇒ **no new version**, no rerun. The result is routed to NEU-906 as **supporting input**. Even so, the decision status does **not** jump to `accepted`: a class-6 aggregate is a stronger proxy but the **in-domain DP effect (R1/INC-1)** and **class-7 external validity** are still owed. Best achievable movement: **provisional (stronger)** — never `accepted`-as-closed while R1 is High and INC-1 open. Confirmation and revision are symmetric **inputs** to adjudication, not adjudication.

## 2. Second dry-run: MC-4 over-validation (`PROXY-BOUNDING-PRESENT`) → PRX-4

Adjudicated status (`03_…` H-F3 / BM-5): over-validation **present-bounded** on the INCOMPLETE archetype; FM4/R3 **unresolved (INC-3)**. Replacement: **PRX-4** — a **class-5 OUT-7 automated-evaluation DP-grading reliability bound**.
- **Revision trigger** ("over-validation beyond the bound"): fires ⇒ FM4 **realized**, RA5 reaffirmed, **new reliability contract version** if the bound redefines the metric; R3 stays High. Affected: **FM4, R3, BM-5, D3, RA5**.
- **Confirmation trigger** ("bounded, acceptable over-validation on the item class"): no new version; routed to NEU-906. R3 still cannot be closed (High, INC-3). The current bounding reading is preserved; the reliability *bound* is appended when it arrives.
- **Model-version binding preserved.** Any grader model/version change is a **new run** (`MODEL-VERSION-BOUND`), not a reinterpretation of the current `v1.0` reading — the history of *which grader produced which reading* is retained.

## 3. Dry-run properties satisfied (acceptance scenario 5)

| Property | Satisfied |
| --- | --- |
| Starts from an actually-adjudicated status (not a hypothetical) | ✅ (`03_…` MC-1, MC-4) |
| Future signal is correctly typed higher-class (class-6/class-5), never the current class-3/4 proxy laundered | ✅ |
| Revision ⇒ new version + rerun; v1.0 results marked inapplicable, **not rescored** | ✅ |
| Blast radius discoverable from the register | ✅ (PRX Affected columns) |
| History preserved (append-only; superseded readings retained with pointers) | ✅ |
| No future flip enacted now; no current status changed by this dry-run | ✅ |
| High risk (R1/R3) remains non-downgradable under both branches | ✅ |

**Reproducibility.** Any operator can re-run either dry-run from the `PRX-*` table + this ledger's current statuses alone: pick a proxy, apply the stated trigger, read the Affected set, append the resulting status with a pointer to the superseded reading. No data that does not exist is required.
