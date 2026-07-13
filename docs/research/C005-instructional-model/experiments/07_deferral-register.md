# Experiment Deferral Register — dogfooding-unavailable, cap-overflow, and untestable items

- **Task:** NEU-924 · **Companion to:** `00_experiment-inventory-and-ranking.md` (inventory + ranking) and the six executed records `01_…`–`06_…`
- **Compiled:** 2026-07-13 · **Status: provisional. Settles nothing; flips no status.**

Deferral discipline (per NEU-924's charter slice): a deferred experiment **does not block** — its decision ships **marked provisional with an explicit revision trigger**. The same discipline applies symmetrically to (§1) dogfooding vehicles the unavailable creator cannot service (charter Assumption #10 — **the creator is not available inside this autonomous run**) and (§2) non-deferrable-vehicle candidates past the six-item cap. Every decision below is *already* `provisional` in the ledger (nothing here downgrades or upgrades anything); this register adds the deferred-experiment record and its named revision trigger.

## §1 Ships WITHOUT dogfooding evidence (creator-unavailable dogfooding vehicles)

Every decision whose smallest sufficient vehicle for its residual uncertainty is **creator dogfooding / in-domain measurement**. Ranked first among all materially inconclusive items is the R1 transfer risk itself — deferred not because of the cap but because **no smaller vehicle can reduce a transfer claim**.

| # | Decision / element | Deferred experiment (dogfooding vehicle) | Ships as | Explicit revision trigger |
| --- | --- | --- | --- | --- |
| D-1 | **R1 / G1 / INC-I1 — DP transfer, all ten mechanisms + every durable-vs-speed resolution** | Creator dogfooding of representative DP benchmark journeys (per `../../C005-product-foundation/benchmark-suite/03_creator-dogfooding-protocol.md`, ≥2 runs/journey, `OBS-*` records) measuring whether the mechanism effects appear in-domain | provisional (unchanged) | Creator dogfooding runs land `OBS-*` records for the affected journeys, or production DP measurement lands (INC-I1/G1 close path); until then no external or population validity is claimed |
| D-2 | **M01 sequencing — DP-ordering-vs-transfer effectiveness; demonstrated-competence threshold** | Dogfooded ordering walkthrough on a real DP path | provisional | In-domain DP-ordering-vs-transfer measurement; jointly bounded with the MM-T8/MM-T9 calibration signal |
| D-3 | **M02 worked examples — fade calibration + per-learner expertise proxy (MM-T10)** | Dogfooded fading study on DP sub-skills | provisional | DP fading measurement / expertise-signal calibration (mastery-model MM-T10 revision signal); G4 magnitude re-fetch is out-of-caps, not a vehicle |
| D-4 | **M05 interleaving — blocking-first-for-novices ordering (F-M05-2 UNVERIFIED); framework §6 walkthrough** | Creator walkthrough of the staged blocked→interleaved ordering — the vehicle **named by the artifact itself** (framework §6 primary revision trigger) | provisional | (a) Creator walkthrough validates/rejects the blocking-first ordering; (b) in-domain DP interleaving measurement (INC-I1/G1) |
| D-5 | **M07 productive struggle — accomplishable-band boundary for DP; attempt count "2" (G6)** | Dogfooded struggle-band probe on DP items | provisional | In-domain band/attempt-count measurement (G6 evidence) |
| D-6 | **Mastery-model value calibrations — MM-T1 (K), MM-T2 (S), MM-T4/T5 (agreement / over-validation rates), MM-T8 (bar value), MM-T11/T12/T13 (fluency / discrimination / leech counts), MM-T14 (floor coefficient)** | Dogfooding/production calibration per each row's named revision signal in `../mastery-model/00_operational-mastery-model.md` | provisional, banded (unchanged) | Each MM-T row's own named revision signal (in-domain retention curve, grading-fixture measurement, leech rate, relearning-savings measurement, …); bands stay as-is until then |

**Note.** EXP-02/03/04/05/01/06 tested the *shape/enforceability/live-divergence* side of several of these decisions (see `00_…` §5); nothing in §1 was reachable by a non-dogfooding vehicle — the deferred residuals are precisely the in-domain/effectiveness halves.

## §2 Cap overflow (non-deferrable vehicles past the six-item cap)

The cap on non-deferrable-vehicle executions is **six per session**; exactly six ran. The following ranked-below-cap candidates defer under the same discipline:

| # | Decision / element | Deferred experiment (non-deferrable vehicle) | Rank vs cap | Ships as | Explicit revision trigger |
| --- | --- | --- | --- | --- | --- |
| O-1 | **M05 interleaving — axis-conflict characterization** (is the live `interleaveStrategy: 'easy-medium-hard'` knob actively conflicting with, or merely orthogonal to, DR-M05's category-axis staging?) | AI review (2 independent reviewers) of the live recommendation-composition path vs DR-M05 | 7th of 7 (C5 MEDIUM — lowest severity tier) | provisional | A future experiment session runs the deferred AI review, or the implementation charter reconciles the difficulty-axis knob against DR-M05 (C5 closure path) |
| O-2 | **M09 remediation — leech reformulate-vs-suspend path** (`resolve_leech` behavior, outside both the reconciliation's authoritative file set and EXP-04's fixture scope) | AI review or automated-eval of the `resolve_leech` tool path vs DR-M09 behavior 1 | beyond cap (sub-question of an already-experimented decision; C3-linked) | provisional | A future experiment session exercises `resolve_leech`, or the implementation charter installs/verifies the reformulation path (DR-M09 behavior 1) |

## §3 Materially inconclusive but untestable in-charter (no sufficient vehicle exists)

| # | Element | Why no vehicle suffices | Ships as | Explicit revision trigger |
| --- | --- | --- | --- | --- |
| U-1 | **MM-T15 contest-speed criterion** (widest band, 1.25–2×; G5) | Its validating evidence is **class-7 contest-outcome data**, which does not exist project-wide; no NEU-887 vehicle (including dogfooding) produces it in-charter | provisional, widest band (unchanged) | Contest-outcome data (class-7) lands; G5 pacing anchors; until then Stage-2 speed criteria never lower any unlock bar (DR-M10 invariant) |

## §4 Self-check

- Every deferred experiment names its decision, vehicle, provisional marking, and an **explicit revision trigger** — none blocks the charter. **PASS.**
- §1 is the complete "ships without dogfooding evidence" list; §2 is symmetric cap-overflow deferral (acceptance scenarios 2 and 4). **PASS.**
- No deferred item had a smaller sufficient vehicle that was skipped (D-1…D-6 are transfer/calibration claims — dogfooding/in-domain by nature; O-1/O-2 are ranked below the cap). **PASS.**
- Nothing here flips a status, invents a value, or claims external validity. **PASS.**
