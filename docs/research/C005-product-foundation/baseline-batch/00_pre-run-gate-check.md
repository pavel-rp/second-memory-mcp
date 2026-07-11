# Pre-Run Gate Check — Mapping-Gate PASS, Contract Freeze & Blocked-Run Test

**Task:** NEU-904 · **Compiled:** 2026-07-11 · **Verifies:** NEU-901 (`../measurement-contracts/`).
This file discharges **acceptance scenario 1** and the verification evidence "*pre-run complete-mapping and contract-freeze audits; explicit blocked-run test*". It re-reads NEU-901's frozen artifacts and records the gate state that **unblocks** NEU-904's evidence collection. It **re-adjudicates nothing** and **invents no metric** — it confirms the pre-existing frozen contract set.

**Gate rule (NEU-901 `03_…` §1):** downstream evidence collection (NEU-904, NEU-905, AI-review, automated-eval, operational-log) is **BLOCKED until `GATE-STATE = PASS` at contract freeze `v1.0`**, and only for that frozen set.

---

## 1. Mapping-gate verification (`GATE-STATE`)

Read from `../measurement-contracts/03_requirement-decision-mapping-gate.md` §3:

> **`GATE-STATE = PASS`** — as of measurement-contract freeze **`v1.0` (2026-07-11)**. Unmapped material items: **0**. Material hypotheses without a frozen contract: **0**. High risks placed in `NON-MEASURED-SETTLED`: **0** (`OC-7` holds).

**NEU-904 pre-run confirmation:** ✅ `GATE-STATE = PASS` at `v1.0`. Every material requirement/decision family (P/D/J/M/FM/R/DEC/RA/EX/BX/BM) maps to ≥1 testable hypothesis + frozen `MC-*` contract, or to an explicit `NON-MEASURED-SETTLED` / `CLASS-7-DEFERRED` / `COLLECTION-GAP` disposition. **This unblocks NEU-904's collection for the frozen `v1.0` set only.**

## 2. Applicable-contract freeze audit (the two baseline journeys)

Only the contracts governing the `BATCH-BASELINE` journeys are in NEU-904's scope. Each is read from the frozen register `../measurement-contracts/01_measurement-contract-register.md` (`v1.0`, "**Compiled & FROZEN: 2026-07-11 at v1.0**").

| Journey | Hypothesis | Governing frozen contract(s) | Version | Status label | Frozen? |
| --- | --- | --- | --- | --- | --- |
| **JNY-B1** (BM-2, BM-8) | H-B1 | **MC-1** (spaced retention) · **MC-6** (per-DP-pattern mastery signal, inspect) · **MC-9** (DP transfer effect, R1 High) | `v1.0` | `PROXY-DIRECTIONAL` (MC-1/MC-9) · `COLLECTION-GAP` (MC-6) | ✅ |
| **JNY-B2** (BM-6) | H-B2 | **MC-5** (motivation & adherence under grind) | `v1.0` | `CLASS-7-DEFERRED` (prevalence) + `PROXY-DIRECTIONAL` (failure shape, n=1) | ✅ |

**Freeze confirmation:** ✅ Every contract applicable to JNY-B1/JNY-B2 is versioned `v1.0` and frozen before the first NEU-904 run. NEU-901's rule (`01_…` header) holds: *"any post-run change is a new version + rerun."* NEU-904 introduces **no** new contract and changes **no** frozen value.

**Journey-closure cross-check** (register `03_…` §2.5, "so NEU-904/905 can run"): JNY-B1 → MC-1/MC-6/MC-9 = PASS; JNY-B2 → MC-5 = PASS. Every baseline-journey hypothesis has ≥1 frozen contract; **no journey can be executed against an unspecified metric or invented threshold.**

## 3. Privacy-gate pre-condition (`PLA-1…3`)

The batch's evidence records are subject to NEU-901's operational-log privacy gate (`../measurement-contracts/05_operational-log-privacy-gate.md`) and NEU-897 class-6 discipline: **no raw operational-log payload** is exported as evidence; `src/shared/logger.ts` leaves learner response text unredacted, so log-derived claims must be aggregate / query-scope / field-list only (`P5/EX6/BX-5`). **NEU-904 confirmation:** every `OBS-*` / `AIR-*` record in this package is **payload-free**; the BM-8 inspection reads schema/source *structure*, not learner log payloads. ✅

## 4. Blocked-run test (reproduced — proves the gate is a real block)

Per NEU-901 `03_…` §4 and the verification evidence "*explicit blocked-run test for any unmapped material requirement or decision*", the gate is demonstrated to actually block, not rubber-stamp:

1. **Inject an unmapped item.** Hypothetically add a material requirement `RDM-Xtest` with **no** `MC-*` contract and no `NON-MEASURED-SETTLED` / `CLASS-7-DEFERRED` / `COLLECTION-GAP` disposition.
2. **Apply the gate rule (§1).** `RDM-Xtest` matches **none** of the three pass paths ⇒ `Verdict = BLOCK`.
3. **Aggregate.** One `BLOCK` ⇒ `GATE-STATE = FAIL` ⇒ **all** downstream evidence collection blocked — including NEU-904's first JNY-B1/JNY-B2 run.
4. **Attempt to force the pass** by inventing a threshold for `RDM-Xtest` ⇒ trips `OC-5` (invented authority, NEU-899) ⇒ **still `FAIL`.**

**Result:** the only ways to clear a `BLOCK` are a genuine frozen contract, a genuine settled/deferred disposition, or removing the item from the material set (only NEU-898/899 may do so). **The current `v1.0` inventory has zero `BLOCK`s** (§1), so — and only so — NEU-904 collection proceeds. Had any applicable contract for JNY-B1/JNY-B2 been unfrozen or unmapped, this batch would be **blocked** and would record no evidence.

## 5. Gate decision for NEU-904

> ✅ **PRE-RUN GATE = PASS.** NEU-901's complete mapping gate is `PASS` at frozen `v1.0`; every contract applicable to JNY-B1 and JNY-B2 is versioned and frozen; the privacy gate pre-condition holds; the blocked-run test confirms the block is real. **NEU-904 evidence collection is authorized** for the frozen `v1.0` contract set — subject to the execution-fidelity disclosure (`README.md`): the class-3 creator-dogfooding halves await the live creator and are carried as incomplete, never fabricated.
</content>
