# Traceability Binding, Hand-off & Adversarial Self-Check

**Task:** NEU-900 · **Compiled:** 2026-07-11 · **Sole inputs:** NEU-898 (`../product-model/`) + NEU-899 (`../traceability/`) + NEU-897 (`../`).
This file binds the NEU-899 deferred slot `LINK-1` to this package, states precisely what remains UNRESOLVED, hands off to the executing/measuring/adjudicating siblings, and runs the adversarial self-check. It **adjudicates no status** and **invents no measurement value**.

---

## 1. `LINK-1` binding (per the NEU-899 binding protocol)

NEU-899 reserved `LINK-1` as the UNBOUND slot for the bounded benchmark suite (`../traceability/03_…` §3). This package binds it — but only the part NEU-900 owns: the **selection + review protocol**. Results are produced downstream.

| Slot | Will hold | Owner | Binding by NEU-900 |
| --- | --- | --- | --- |
| **`LINK-1`** | The bounded benchmark suite + journey selection + results. | NEU-900 (selection/protocol) → NEU-904/905 (results) | **PARTIALLY BOUND** → `benchmark-suite/` (this package): journey suite `JNY-B1, JNY-B2, JNY-F1, JNY-F2, JNY-F3`, batch allocation, and the creator/AI review protocol. **Results remain pending** NEU-904/NEU-905 execution and NEU-906 adjudication. |

The `../traceability/03_…` `LINK-1` row is updated to reflect this binding (selection bound; results pending). Per the NEU-899 binding protocol, this attaches the artifact identifier to the slot **without** editing any element's evidence class, limitation, or id, and **without** enacting any mutable STATUS change (that is NEU-906 via `LINK-4`).

## 2. What stays UNRESOLVED (reported, never invented)

NEU-900 does **not** resolve the `INC-*` markers that `LINK-1`'s *results* would eventually feed — it only supplies the vehicle by which evidence could later be produced. Each stays exactly as NEU-899 set it:

| Marker | What it needs | Why NEU-900 does not resolve it | State after NEU-900 |
| --- | --- | --- | --- |
| **`INC-1`** | DP-domain benchmark **evidence** that retrieval+spacing / schema-building move DP skill in-domain (R1, P1 effect size, BM-1/2/4). | NEU-900 selects the journeys (JNY-B1, JNY-F1, JNY-F2) that *could* produce it; **collecting** the evidence is NEU-904/905, and **settling** R1/BM statuses is NEU-906. | **UNRESOLVED** (vehicle selected; results pending). |
| **`INC-2`** | Validated **measurement contract** — computable signals, thresholds, decision/revision rules — for `averageQuality`, `time_spent_ms`, per-DP-pattern mastery (R6, BM-8). | Sole authority is **SUB-4**. JNY-B1's BM-8 half only *inspects capability*; inventing a threshold here would usurp SUB-4 (NEU-899 `OC-5`). | **UNRESOLVED** (owned by SUB-4). |
| **`INC-3`** | DP-domain **AI-grading reliability** bound from an automated-evaluation protocol (R3, FM4/BM-5). | JNY-F3 *bounds* classes 4–5 for specific items; **reliability** is an OUT-7 automated-eval artifact, adjudicated by NEU-906. | **UNRESOLVED** (vehicle selected; reliability pending). |

Distinction preserved (NEU-899 discipline note): `INC-1`/`INC-3` are **benchmark/automated-eval** holes NEU-900's suite feeds; `INC-2` is a **measurement-contract** hole owned exclusively by SUB-4. NEU-900 never fills a measurement hole with a benchmark run, and never fills a benchmark hole with an invented metric.

## 3. Hand-off map

| Consumer | Consumes from this package | Produces |
| --- | --- | --- |
| **NEU-904** (SUB-7) | `BATCH-BASELINE` (JNY-B1, JNY-B2), `03_…` + `04_…` protocols | Executed baseline/boundary runs (`OBS-*` + `AIR-*` records) |
| **NEU-905** (SUB-8) | `BATCH-FAILURE` (JNY-F1, JNY-F2, JNY-F3), the reserved-prototype gate, `03_…` + `04_…` protocols | Executed failure/conflict runs; prototype only if the §gate opens |
| **NEU-901** (measurement/proxy-replacement contracts) | The `OBS-*`/`AIR-*` record shapes and the signal list JNY-B1 inspects | Authoritative measurement contracts (`INC-2`) |
| **NEU-906** (adjudication) | `conflicted`/`incomplete`/`supports`/`contradicts` results | Status flips for BM/R/D elements via `LINK-4` (frozen rules) |
| **NEU-907** (decision package) | The bound `LINK-1` + all downstream results | Consolidated prompt-ready product-decision package (`LINK-5`) |

NEU-900 sets **no** BM-cell status, defines **no** metric/threshold, builds **no** prototype, recruits **no** external user, and selects **no** production UI/architecture/provider (charter out-of-scope, all honored).

## 4. Adversarial self-check (claim discipline)

Performed 2026-07-11 before completion, mirroring the NEU-897/898/899 self-checks.

- **Select-not-run.** This task executes **zero** journeys, collects **zero** creator/AI evidence, and builds **zero** prototypes. It selects, allocates, and defines protocol only. ✔
- **Zero uncovered material cells.** All of BM-1…BM-8 map to ≥ 1 of five journeys; each cell sits in exactly one batch with no cross-batch overlap (`00_…` §3). ✔
- **Caps intact.** 5 journeys (≤ 6); `BATCH-BASELINE` = 2, `BATCH-FAILURE` = 3 (each ≤ 3); targeted prototypes used = 0 (≤ 1, one reserved to the failure batch). No batch was expanded to force coverage; the infeasibility-routing rule is fixed (`02_…` §4). ✔
- **Smallest-sufficient vehicle + fidelity.** Every journey names an existing-MCP or paper/WoZ vehicle with its fidelity boundary; the one prototype allowance is unused and gated (`01_…`, `02_…` §3). ✔
- **No new identifiers collide / no renumbering.** Only `JNY-*`, `BATCH-*`, `OBS-*`, `AIR-*` are introduced; every BM/FM/X/R/EX/BX/INC/LINK id is reused verbatim. `LINK-1` is bound, not duplicated by a parallel structure. ✔
- **Evidence-class integrity (no proxy laundering).** Creator dogfooding is labeled **class-3, n=1**; AI review is **class-4**; **neither is presented as external-user, expert, or market validation** (EX3). A forbidden-phrasing intent scan ("users want", "market validates", "experts confirm", "proven", "validated by", "demand") finds these strings only inside prohibitions and this check — never as an assertion. ✔
- **Conflicts & gaps preserved.** Disagreeing verdicts → `conflicted` → NEU-906; no verdict is averaged or smoothed (`04_…` §4). Every fidelity caveat ties to an existing gap (G1.1/G1.2/G2.1/G2.3/G5.1/G6.1) or `INC-*`; no gap is silently closed. ✔
- **Measurement-authority firewall.** No metric, threshold, decision rule, or revision trigger is defined; BM-8/BM-5 stay UNRESOLVED under `INC-2`/`INC-3`; SUB-4 remains the sole measurement authority (NEU-899 `OC-5`). ✔
- **Severity floor.** R1–R5 (High) are untouched and non-downgradable; no verdict path can drop or settle-as-closed a High risk (`04_…` §4; NEU-899 `OC-7`). ✔
- **Privacy scan.** No raw learner-log payloads anywhere; the only log reference is the aggregate-only constraint (P5/EX6/BX-5) enforced in the `OBS-*` record. ✔
- **Boundary-wall respect.** `BX-1…BX-5` are guards, not coverage targets; each journey's `OBS-boundary-check` enforces them; crossing one is a run defect, not coverage (`00_…` §4). ✔
