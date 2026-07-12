# Pre-Run Gate Check — Mapping-Gate PASS, Contract Freeze, Reserved-Prototype Gate & Blocked-Run Test

**Task:** NEU-905 · **Compiled:** 2026-07-12 · **Verifies:** NEU-901 (`../measurement-contracts/`).
This file discharges **acceptance scenario 1** for `BATCH-FAILURE`: the pre-run complete-mapping and contract-freeze audit, the explicit blocked-run test, the privacy pre-condition, and the reserved-prototype gate decision. It re-reads NEU-901's frozen artifacts and records the gate state that **unblocks** NEU-905's evidence collection. It **re-adjudicates nothing** and **invents no metric** — it confirms the pre-existing frozen contract set.

**Gate rule (NEU-901 `03_…` §1):** downstream evidence collection (NEU-904, NEU-905, AI-review, automated-eval, operational-log) is **BLOCKED until `GATE-STATE = PASS` at contract freeze `v1.0`**, and only for that frozen set.

**Independence note.** `BATCH-FAILURE` (NEU-905) and `BATCH-BASELINE` (NEU-904) are **disjoint and independently shippable** (`../benchmark-suite/02_batch-allocation.md` §1): no shared cell, vehicle instance, or observation record. NEU-904's completion is therefore **not a dependency** of NEU-905. The real unblocking gate is NEU-901's mapping-gate PASS at `v1.0` (§1 below). NEU-904 is referenced only as the **precedent that established the versioned vehicle-revision mechanism** this batch reuses (`01_…`; `../baseline-batch/06_vehicle-revision.md`).

---

## 1. Mapping-gate verification (`GATE-STATE`)

Read from `../measurement-contracts/03_requirement-decision-mapping-gate.md` §3:

> **`GATE-STATE = PASS`** — as of measurement-contract freeze **`v1.0` (2026-07-11)**. Unmapped material items: **0**. Material hypotheses without a frozen contract: **0**. High risks placed in `NON-MEASURED-SETTLED`: **0** (`OC-7` holds).

**NEU-905 pre-run confirmation:** ✅ `GATE-STATE = PASS` at `v1.0`. Every material requirement/decision family (P/D/J/M/FM/R/DEC/RA/EX/BX/BM) maps to ≥1 testable hypothesis + frozen `MC-*` contract, or to an explicit `NON-MEASURED-SETTLED` / `CLASS-7-DEFERRED` / `COLLECTION-GAP` disposition. **This unblocks NEU-905's collection for the frozen `v1.0` set only.**

## 2. Applicable-contract freeze audit (the three failure journeys)

Only the contracts governing the `BATCH-FAILURE` journeys are in NEU-905's scope. Each is read from the frozen register `../measurement-contracts/01_measurement-contract-register.md` (`v1.0`, "**Compiled & FROZEN: 2026-07-11 at v1.0**").

| Journey | Hypothesis | Governing frozen contract(s) | Version | Status label | Frozen? |
| --- | --- | --- | --- | --- | --- |
| **JNY-F1** (BM-1, BM-7) | H-F1 | **MC-2** (schema transfer vs surface memorization + expertise-reversal boundary) · **MC-9** (DP transfer effect, R1 High) | `v1.0` | `PROXY-DIRECTIONAL` (transfer) · **INCOMPLETE** (BM-7 reversal, G2.1) | ✅ |
| **JNY-F2** (BM-3, BM-4) | H-F2 | **MC-3** (long-horizon decay/relapse + hierarchical scheduling) · **MC-9** (R1 High, decay claim) | `v1.0` | `PROXY-DIRECTIONAL` (BM-4 decay) · `COLLECTION-GAP` (BM-3 optimum, G1.2) | ✅ |
| **JNY-F3** (BM-5) | H-F3 | **MC-4** (AI-grading over-validation / false confidence) | `v1.0` | `PROXY-BOUNDING` | ✅ |

**Freeze confirmation:** ✅ Every contract applicable to JNY-F1/F2/F3 is versioned `v1.0` and frozen before the first NEU-905 run. NEU-901's rule (`01_…` header) holds: *"any post-run change is a new version + rerun."* NEU-905 introduces **no** new contract and changes **no** frozen value.

**Journey-closure cross-check** (register `03_…` §2.5, "so NEU-904/905 can run"): JNY-F1 → MC-2/MC-9 = PASS; JNY-F2 → MC-3/MC-9 = PASS; JNY-F3 → MC-4 = PASS. Every failure-journey hypothesis has ≥1 frozen contract; **no journey can be executed against an unspecified metric or invented threshold.**

## 3. Privacy-gate pre-condition (`PLA-1…3`)

The batch's evidence records are subject to NEU-901's operational-log privacy gate (`../measurement-contracts/05_operational-log-privacy-gate.md`) and NEU-897 class-6 discipline: **no raw operational-log payload** is exported as evidence; `src/shared/logger.ts` leaves learner response text unredacted, so log-derived claims must be aggregate / query-scope / field-list only (`P5/EX6/BX-5`). **NEU-905 confirmation:** every `OBS-*` / `OPLOG-*` / `AIR-*` record in this package is **payload-free**; the JNY-F1/F2 retrospective aggregates read counts/distributions from the authorized snapshot (`neu904-retrospective-evidence.md`), never learner response text; the JNY-F3 evidence bound from `../autoeval-batch/` uses authored synthetic answers (no operational-log payload at all). ✅

## 4. Reserved-prototype gate decision (`../benchmark-suite/02_batch-allocation.md` §3)

The suite permits **≤1 targeted prototype, in `BATCH-FAILURE` only**, pre-designated to **JNY-F3** (AI-grading over-validation). NEU-905 evaluates the four-part authorization gate:

1. *the existing `submit_answer` vehicle demonstrably cannot isolate FM4 from confounds during execution* — **holds:** the live end-to-end `submit_answer` grading path was unreachable in this environment, and it does not expose a way to hold the grader prompt/context fixed enough to attribute over-validation (`../autoeval-batch/README.md` execution-fidelity disclosure; NEU-902 `../automated-evaluation/02_…` §4);
2. *no paper/WoZ artifact can substitute (grading is a runtime behavior)* — **holds** (a paper artifact cannot exercise the LLM quality-derivation step);
3. *a written why-lower-fidelity-is-insufficient rationale recorded at build time* — **satisfied by NEU-903** at build time (`../autoeval-batch/00_pre-run-gate-check.md` §5, `../automated-evaluation/02_…` §4);
4. *no UI/architecture/provider/production commitment (EX4); a throwaway grading harness exposing only the quality-derivation step* — **satisfied** (`../autoeval-batch/README.md`).

**Determination.** The reserved prototype gate is **already accounted for**: the minimal grading-harness was **built and executed by NEU-903** as the `BATCH-AUTOEVAL` batch (the JNY-F3 minimal harness). The suite's single ≤1 allowance is consumed by **that existing harness**. Therefore **NEU-905 builds 0 prototypes** — the FM4 uncertainty was already tested at that fidelity, and a second prototype would breach the suite allowance (`02_…` §3 last bullet; §4 routing rule). NEU-905 **does not re-adjudicate** whether NEU-903 opened the gate correctly (that batch is merged and owns its own gate decision) and **claims no authorization of its own**; it records that the gate is closed with the allowance spent, and binds the resulting evidence (`06_…`).

## 5. Blocked-run test (reproduced — proves the gate is a real block)

Per NEU-901 `03_…` §4 and the verification evidence "*explicit blocked-run test for any unmapped material requirement or decision*", the gate is demonstrated to actually block, not rubber-stamp:

1. **Inject an unmapped item.** Hypothetically add a material requirement `RDM-Ftest` with **no** `MC-*` contract and no `NON-MEASURED-SETTLED` / `CLASS-7-DEFERRED` / `COLLECTION-GAP` disposition.
2. **Apply the gate rule (§1).** `RDM-Ftest` matches **none** of the three pass paths ⇒ `Verdict = BLOCK`.
3. **Aggregate.** One `BLOCK` ⇒ `GATE-STATE = FAIL` ⇒ **all** downstream evidence collection blocked — including NEU-905's first JNY-F1/F2/F3 run.
4. **Attempt to force the pass** by inventing a threshold for `RDM-Ftest` ⇒ trips `OC-5` (invented authority, NEU-899) ⇒ **still `FAIL`.**

**Result:** the only ways to clear a `BLOCK` are a genuine frozen contract, a genuine settled/deferred disposition, or removing the item from the material set (only NEU-898/899 may do so). **The current `v1.0` inventory has zero `BLOCK`s** (§1), so — and only so — NEU-905 collection proceeds. Had any applicable contract for JNY-F1/F2/F3 been unfrozen or unmapped, this batch would be **blocked** and would record no evidence.

## 6. NEU-904 revision-mechanism precedent (recorded honestly — a precedent, not a gate)

NEU-904 (`../baseline-batch/`) first encountered the live-creator-unavailable condition and resolved its two class-3 halves via a **versioned vehicle revision v1.0→v1.1** (`../baseline-batch/06_vehicle-revision.md` + `05_…` §8): the infeasible live-creator vehicles were revised to retrospective privacy-gated aggregates + informal creator testimony, labeled class-3 RETROSPECTIVE + class-6 operational-log, with 2 isolated AI reviews per journey (opus + sonnet), integrity caveats preserved, statuses left to NEU-906. **NEU-905 pre-run check against that resolved state:** the mechanism is established, versioned, and reviewable; NEU-905 **reuses it** for JNY-F1/JNY-F2 (`01_…`). This is a **methodological precedent**, not a cross-batch dependency — NEU-904 and NEU-905 share no cell/vehicle/record (§Independence note above). NEU-904's own mutable-status flips remain NEU-906's, and its Linear Done-flip is tracked separately.

## 7. Gate decision for NEU-905

> ✅ **PRE-RUN GATE = PASS.** NEU-901's complete mapping gate is `PASS` at frozen `v1.0`; every contract applicable to JNY-F1, JNY-F2, and JNY-F3 is versioned and frozen; the privacy gate pre-condition holds; the reserved-prototype gate is accounted for (allowance spent by NEU-903's existing harness; NEU-905 builds 0); the blocked-run test confirms the block is real. **NEU-905 evidence collection is authorized** for the frozen `v1.0` contract set — subject to the execution-fidelity disclosure (`README.md`): the class-3 creator-dogfooding halves of JNY-F1/JNY-F2 are executed at lower fidelity under vehicle revision v1.1 (retrospective aggregates + testimony) and carried honestly as a downgrade; unanswerable slices (BM-1 transfer isolation, BM-7 reversal, BM-3 optimum) are carried INCOMPLETE, never fabricated; JNY-F3 evidence is bound (not re-run) from NEU-903.
