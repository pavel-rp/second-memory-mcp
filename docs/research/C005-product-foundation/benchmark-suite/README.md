# C005 Product Foundation — Bounded Benchmark Suite & Reproducible Review Protocol

**Task:** NEU-900 (SUB of NEU-887 · program C005, AI-backed dynamic-programming course) · **Covers:** OUT-1, OUT-3, OUT-4 · **Compiled:** 2026-07-11
**Depends on / built on:** NEU-898 product model (`../product-model/`) and NEU-899 traceability structure (`../traceability/`), and transitively the NEU-897 bounded-research package (`../`). **These are the sole inputs.**

**What this is:** the *selection* of a bounded benchmark journey suite and the *definition* of a reproducible review protocol for the C005 product foundation. It (a) maps every material benchmark-state cell (BM-1…BM-8) to at least one executable journey; (b) allocates the journeys into two zero-overlap, independently shippable execution batches (baseline/boundary → NEU-904; failure/evidence-conflict → NEU-905); (c) names, per journey, the smallest sufficient research vehicle and records its fidelity boundary; (d) fixes the reproducible creator-dogfooding observation format and repeat-run conditions; and (e) defines the independent AI-review protocol (≥2 separately initialized reviews per journey, isolated initial verdicts, full reproduction record, disagreement/incomplete handling). It binds the NEU-899 `LINK-1` slot.

**What it is not:** it does **not** execute any journey, build the targeted prototype, or collect creator/AI evidence (NEU-904/NEU-905 own execution); it defines **no** measurement contract, metric, threshold, decision rule, or revision trigger (SUB-4 / `INC-2`); it adjudicates **no** evidence/decision STATUS and flips no BM-cell or risk status (NEU-906 via `LINK-4`); it decides **no** pedagogy, curriculum, tutoring protocol, UI, architecture, provider, or telemetry design (EX4); and it produces **no** external-user, expert, or market validation. Creator dogfooding is **class-3** evidence and AI review is **class-4** evidence — neither is class-7 real-user/market validation, which does not exist (EX3).

## How to read this package

| File | Contents |
| --- | --- |
| `00_selection-and-coverage.md` | The BM-cell → journey coverage matrix; the materiality-preserving selection rule; the zero-uncovered-material-cell audit (acceptance scenario 1); inherited FM/X coverage. |
| `01_journey-vehicles-and-fidelity.md` | One record per selected journey (`JNY-*`): hypothesis, cells covered, smallest sufficient vehicle, fidelity boundary, and the provisional/incomplete/unresolved status it inherits (acceptance scenario 2). |
| `02_batch-allocation.md` | The two zero-overlap batches with per-batch caps; the journey-count and prototype-allowance check; the prototype reservation; the incomplete-suite routing rule (acceptance scenario 4). |
| `03_creator-dogfooding-protocol.md` | The fixed observation-record format, the repeat-run conditions, the evidence-class-3 discipline, and the aggregate-only privacy gate (P5/EX6). |
| `04_ai-review-independence-protocol.md` | The ≥2-separately-initialized-reviews protocol, verdict isolation, the full reproduction record (identity, provider, model/version, prompt, context exposure, run date, conditions), and disagreement/incomplete handling (acceptance scenario 3). |
| `05_traceability-binding.md` | The `LINK-1` binding; the `INC-1`/`INC-3` status (kept UNRESOLVED — results are downstream); the hand-off to NEU-901/904/905/906; and the adversarial self-check. |

## Trace-identifier conventions (inherited and extended)

This package **reuses every NEU-897/898/899 identifier verbatim** and introduces **no** competing numbering for existing elements. Reused families:

- NEU-897: findings `F*`, conflicts `X1…X4`, gaps `G*`, evidence classes `[literature] (1) · [code-evidence] (2) · [dogfooding] (3) · [ai-critique] (4) · [automated-eval] (5) · [operational-log] (6) · [future-real-user] (7)`.
- NEU-898: jobs `J#`, motivations `M#`, failure modes `FM#`, principles `P#`, differentiators `D#`, exclusions `EX#`, risks `R#`, decisions `DEC#`, rejected alternatives `RA#`, candidates `CAND-#`, benchmark-state cells `BM-#`, exclusion-boundary walls `BX-#`.
- NEU-899: trace records `TR-<elementId>`, relation edges `REL:*`, incomplete markers `INC-#`, deferred link slots `LINK-#`, orphan checks `OC-#`.

It **introduces** only these NEU-900 identifiers (stable, prompt-ready, non-colliding):

| Prefix | Element | Defined in |
| --- | --- | --- |
| `JNY-#` | A selected benchmark journey (executable vehicle covering ≥1 material BM cell) | `01_…` |
| `BATCH-BASELINE` / `BATCH-FAILURE` | The two zero-overlap execution batches (→ NEU-904 / NEU-905) | `02_…` |
| `OBS-*` | A field in the fixed creator-dogfooding observation record | `03_…` |
| `AIR-*` | A field in the independent AI-review reproduction record | `04_…` |

## Rules this package obeys (inherited, extended)

1. **Select, do not run.** This task selects journeys, allocates batches, and fixes the review conditions; it executes nothing and collects no evidence. Execution is NEU-904/NEU-905; measurement contracts are SUB-4; adjudication is NEU-906.
2. **Zero uncovered material cells at selection exit.** Selection is valid only if every BM-1…BM-8 maps to ≥1 selected journey and each journey belongs to exactly one batch (`00_…`). If coverage were unachievable within six journeys and one prototype, the suite would be reported incomplete and routed back, not silently expanded (`02_…`).
3. **Smallest sufficient vehicle, fidelity recorded.** Each journey names the smallest sufficient existing-MCP, paper/Wizard-of-Oz, or (last-resort) targeted-prototype vehicle with its fidelity limitation; the whole suite uses **no more than one** targeted prototype (`01_…`, `02_…`).
4. **Evidence discipline is inherited unchanged.** Creator dogfooding is class-3, AI review is class-4; **neither is presented as external-user, expert, or market validation** (class-7 does not exist — EX3). Every gap/conflict from NEU-897/898/899 is preserved, not smoothed.
5. **Missing downstream artifacts are reported, never invented.** Benchmark *results* (`INC-1`), DP-domain AI-grading reliability (`INC-3`), and every metric/threshold/decision-rule (`INC-2`, owned by SUB-4) stay UNRESOLVED here; this task binds only the *selection + protocol* to `LINK-1` and leaves the status flips to NEU-906 (`LINK-4`).

## Relation to other artifacts

- **Upstream inputs:** `../product-model/` (NEU-898), `../traceability/` (NEU-899), `../` (NEU-897) — sole sources.
- **Downstream consumers:** NEU-904 (`BATCH-BASELINE` execution), NEU-905 (`BATCH-FAILURE` execution), NEU-901 (authoritative measurement/proxy-replacement contracts — consumes the observation/verdict record shapes), NEU-906 (evidence/decision STATUS adjudication — flips `INC-1`/`INC-3` and BM/ risk statuses under frozen rules via `LINK-4`), NEU-907 (consolidated prompt-ready decision package).
- **Not consumed here:** the C005 charter's later chapters (pedagogy, curriculum, UI, architecture, providers, telemetry). This package stops at benchmark-selection + review-protocol altitude.
