# Clean-Context Repeat & Isolation (`CCR-1…CCR-7`)

**Task:** NEU-902 · **Compiled:** 2026-07-11 · This file is the **OUT-7 core**.
It specifies the conditions under which every automatable case (`AEP-1` / `ACS-1`) is repeated from a clean context, and — critically — makes **each condition independently auditable** through exactly one recorded evidence field. A repeat that cannot produce all seven evidence fields is **not** a clean-context repeat and its result is rejected (mirrors the NEU-900 run-defect rule, `../benchmark-suite/00_…` §4).

The requirement is structural: a class-5 result is only reproducible if a *different* session, later, can restore the same starting point and re-derive the verdict without contamination from the prior run. `CCR-1…CCR-7` are the guarantees that make that true.

---

## 1. The seven conditions

Each condition names the guarantee, the requirement every run must meet, and the **single auditable evidence field** (the artifact NEU-903 records and NEU-907's gate verifies).

### CCR-1 · Documented-baseline restoration
- **Requirement:** before each run, the system is restored to a **documented baseline state** — the fixed DP-pattern topic/chunk fixtures and the seeded schema `AEP-1` submits against — with no residue from any prior run.
- **Auditable evidence field:** **baseline identifier** — the id (and migration/seed commit) of the documented baseline the run was restored to.

### CCR-2 · Identical input-data snapshot
- **Requirement:** the run uses the **identical, versioned input-data snapshot** — `ACS-1` at the exact frozen version plus its pattern fixtures — as every other repeat of the same case.
- **Auditable evidence field:** **snapshot hash** — a content hash over the `ACS-1 v1.0` case set + fixtures; equal across repeats of the same case, changing only on a new case-set version.

### CCR-3 · Newly initialized, isolated run
- **Requirement:** each run is a **newly initialized** process/session, **isolated from prior mutable state** (no reused in-memory grader context, no carried-over session, no shared learner history).
- **Auditable evidence field:** **isolated-run identifier** — a fresh unique run id minted at initialization, distinct per repeat, tying all of a run's artifacts together.

### CCR-4 · Cleared or uniquely namespaced caches
- **Requirement:** every cache the grading path could read (model/response cache, memoized context, DB query cache, any embedding/similarity cache) is **cleared or uniquely namespaced per run**, so no prior run's computation is served to a later one.
- **Auditable evidence field:** **cache-reset / namespace evidence** — the reset action or the unique cache namespace/key-prefix recorded for the run.

### CCR-5 · Identical versioned configuration
- **Requirement:** the controlled configuration (`02_…` §4 — fixtures, grading prompt/context, sampling params, grader model+version) is **identical and versioned** across repeats.
- **Auditable evidence field:** **configuration digest** — the `ENV` config digest (`02_…` §4); equal across repeats that must be comparable, changing only when the configuration deliberately changes (which is then a new run/version).

### CCR-6 · Recorded seed, or explicit unsupported-seed record
- **Requirement:** where the grading path supports a seed, the **same seed** is recorded and reused across repeats; where it does not, an **explicit `UNSUPPORTED` record** is kept together with the **declared nondeterminism tolerance** (`MC-4` `GRADER-VAR`, `02_…` §5) under which readings are still interpreted.
- **Auditable evidence field:** **seed status** — the seed value, or `UNSUPPORTED` + the tolerance token the run is interpreted under.

### CCR-7 · Prior-output isolation (no verdict leakage)
- **Requirement:** the grader (system-under-test) has **no access to prior runs' outputs or verdicts** — no prior `quality`/`action`, no prior over-validation flags, no accumulated context — until it has committed the current case's result. The oracle comparison is performed **after** the grader commits, so no prior verdict can steer the current one.
- **Auditable evidence field:** **prior-output isolation record** — an attestation (context manifest / input provenance) that the run's grader input contained none of the retained prior outputs (`RET`, `02_…` §5), and that the commit-before-compare ordering held.

## 2. Condition → evidence-field map (the auditable surface)

| Condition | Guarantee | Auditable evidence field |
| --- | --- | --- |
| `CCR-1` | Documented-baseline restoration | baseline identifier |
| `CCR-2` | Identical input-data snapshot | snapshot hash |
| `CCR-3` | Newly initialized, isolated run | isolated-run identifier |
| `CCR-4` | Cleared / namespaced caches | cache-reset / namespace evidence |
| `CCR-5` | Identical versioned configuration | configuration digest |
| `CCR-6` | Recorded seed / unsupported record | seed status |
| `CCR-7` | Prior-output isolation | prior-output isolation record |

A repeat is **clean-context-valid** only when all seven fields are present in its retained artifact (`RET`, `02_…` §6). A missing field ⇒ the repeat is **not** clean-context and is rejected; it cannot count toward the `≥ 2`-repeat requirement (`MC-4` `GRADER-VAR`, `02_…` §5) or toward coverage (`04_…`).

## 3. Why each condition is necessary (adversarial rationale)

- **Without `CCR-1`/`CCR-2`** a later session cannot reproduce the run — a different baseline or snapshot silently changes what "the same case" means.
- **Without `CCR-3`/`CCR-4`** a stale cache or reused context can serve a prior grader output, so a "green" run is not evidence about *this* input.
- **Without `CCR-5`/`CCR-6`** the reading is not attributable — a config or seed drift is indistinguishable from a real grader change (defeats `MODEL-VERSION-BOUND`).
- **Without `CCR-7`** the grader could anchor on a prior verdict, manufacturing false stability (an over-validation could hide behind a leaked earlier pass). `CCR-7` is the specific guard that keeps repeat agreement from being an artifact of contamination rather than genuine determinism.

Together, `CCR-1…CCR-7` make the class-5 provenance (`../01_evidence-taxonomy.md`: case-set version, oracle, config digest, seed, environment) **auditable per repeat**, so NEU-903's runs are reproducible and NEU-907's gate can verify them without re-running.
