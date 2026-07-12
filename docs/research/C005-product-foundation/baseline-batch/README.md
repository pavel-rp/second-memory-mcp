# `BATCH-BASELINE` — Executed Baseline & Boundary Journey Runs (raw evidence)

**Task:** NEU-904 (SUB-7) · **Compiled:** 2026-07-11 · **Child of:** NEU-887 (C005 program).
**Sole inputs (merged on develop):** NEU-897 (`../`, 7-class taxonomy) · NEU-898 (`../product-model/`) · NEU-899 (`../traceability/`) · NEU-900 (`../benchmark-suite/`, journey suite + protocols) · NEU-901 (`../measurement-contracts/`, frozen `MC-1…11 v1.0`, `GATE-STATE=PASS`, privacy gate `PLA-*`).

This package **executes** the `BATCH-BASELINE` batch that NEU-900 (`../benchmark-suite/02_batch-allocation.md` §2) allocated to NEU-904 — **JNY-B1 and JNY-B2 only** (JNY-F1/F2/F3 are `BATCH-FAILURE` and belong to NEU-905; they are **not** executed here) — and records **raw evidence only**. It sets **no** hypothesis or decision status: adjudication is NEU-906's exclusive authority via `LINK-4`.

---

## What this package contains

| File | Content |
| --- | --- |
| `00_pre-run-gate-check.md` | Verifies and records that NEU-901's complete requirement-and-decision mapping gate is `PASS` at contract freeze `v1.0`, that every applicable contract is versioned+frozen, and reproduces the blocked-run test. **Acceptance scenario 1 / verification-evidence: pre-run mapping + contract-freeze audit + blocked-run test.** |
| `01_JNY-B1-runs.md` | `OBS-*` observation records for JNY-B1 (spaced-retention baseline BM-2 + measurement-feasibility inspection BM-8). |
| `02_JNY-B1-ai-reviews.md` | `AIR-*` independent-AI-review records for JNY-B1 (≥2 separately initialized reviewers, isolated initial verdicts). |
| `03_JNY-B2-runs.md` | `OBS-*` observation records for JNY-B2 (motivation & adherence under grind culture BM-6). |
| `04_JNY-B2-ai-reviews.md` | `AIR-*` independent-AI-review records for JNY-B2. |
| `05_batch-integrity-and-handoff.md` | Batch-count check, raw disagreement log, incomplete-run register, `LINK-1` results-binding note, pending-creator action list, adversarial self-check. **§8 (appended 2026-07-12): revised-vehicle resolution** (updated ledger, disagreement log, pending-creator status, additive `LINK-1`, self-check delta). |
| `06_vehicle-revision.md` | **Versioned, reviewable vehicle revision** (2026-07-12): JNY-B1/BM-2 and JNY-B2/BM-6 v1.0 (live loop / role-play, declined) → v1.1 (retrospective aggregates + informal testimony), with rationale and the fidelity **downgrade** the original vehicle would have avoided. Honors NEU-900's `02_…` §4 routing-rule spirit; overwrites nothing. |
| `07_JNY-B1-BM2-retrospective-evidence.md` | BM-2 revised-vehicle raw evidence: class-3 `[dogfooding]` RETROSPECTIVE (`OBS-JNY-B1#RETRO-BM2`) **and** separately-labeled class-6 `[operational-log]` (`OPLOG-JNY-B1#BM2`). Payload-free; provenance = query scope + collection date + creator authorization quote. |
| `08_JNY-B2-BM6-retrospective-evidence.md` | BM-6 revised-vehicle raw evidence: class-3 RETROSPECTIVE (`OBS-JNY-B2#RETRO-BM6`) **and** class-6 (`OPLOG-JNY-B2#BM6`). EX3/BX-3 enforced (failure-*shape* only, no market/prevalence claim). |
| `09_JNY-B1-BM2-ai-reviews.md` | `AIR-*` records for BM-2's revised-vehicle evidence — 2 separately-initialized isolated reviewers (opus + sonnet), unanimous `supports`, caveats preserved. |
| `10_JNY-B2-BM6-ai-reviews.md` | `AIR-*` records for BM-6's revised-vehicle evidence — 2 separately-initialized isolated reviewers (opus + sonnet), unanimous `supports` of the failure *shape*, caveats preserved. |

## Execution-fidelity disclosure (read this first — evidence-integrity)

NEU-904's protocol vehicle for the load-bearing halves of this batch is **class-3 `[dogfooding]`: the human creator running the journey as a first-class learner** (`../benchmark-suite/03_creator-dogfooding-protocol.md` §concept; `../01_evidence-taxonomy.md` class 3). At execution time the human creator was **not available (AFK)** and the live Second Memory MCP learning tools (`start_learning` / `submit_answer` / `teach_next`) were **not reachable in this environment**. Per NEU-904's evidence-integrity rule, **no agent-executed run is ever relabeled as class-3 creator evidence, and no creator evidence is fabricated.** The batch therefore records, truthfully classed:

- **Executed now (agent-executable, honestly classed):** the **BM-8 measurement-feasibility inspection** half of JNY-B1 — a static schema/code inspection whose result is **class-2 `[code-evidence]`** (objective facts about what the codebase persists vs. computes, identical regardless of operator) — plus **≥2 genuine, separately initialized, isolated AI reviews** of that evidence (**class-4 `[ai-critique]`**), and the full pre-run gate audit.
- **Recorded INCOMPLETE / pending-creator (cannot be met without the live creator):** JNY-B1's **BM-2 spaced-retention** runs and **both** JNY-B2 **motivation/adherence** role-play runs — these are class-3 creator dogfooding across spaced/simulated time and **cannot** be authentically produced by an agent. They are carried via the incomplete-run mechanism (`../benchmark-suite/04_ai-review-independence-protocol.md` §4; acceptance scenario 5), **not** as coverage, with a precise creator action list in `05_…`.

No `BX-*` boundary wall is crossed; no BM-cell status is set; every record is payload-free (`PLA-1…3`).

## Revised-vehicle update (2026-07-12 — read after the disclosure above)

The two class-3 halves recorded INCOMPLETE / pending-creator above have since been **executed at lower fidelity** under an authorized **vehicle revision** (`06_vehicle-revision.md`): the creator declined the original live-loop (BM-2) and simulated-week role-play (BM-6) vehicles and authorized a **retrospective, privacy-gated operational aggregate + informal testimony** substitute. This is folded in **honestly, as a fidelity downgrade, never as coverage or as external-user/market validation**:

- **BM-2** (`07_…`, reviews `09_…`) and **BM-6** (`08_…`, reviews `10_…`) each carry class-3 RETROSPECTIVE and class-6 operational-log evidence as **separate labeled records**, plus 2 isolated AI reviews (opus + sonnet), **unanimous `supports`** with all fidelity caveats preserved.
- The higher-fidelity v1.0 runs remain optionally open but no longer block NEU-904.
- **Nothing changes at the status layer:** BM-2 stays UNRESOLVED via `INC-1`; BM-6 prevalence stays `CLASS-7-DEFERRED`/`INC-5`; R5 (High) non-downgradable; EX3/BX-3 enforced. Adjudication remains NEU-906's via `LINK-4`.
</content>
</invoke>
