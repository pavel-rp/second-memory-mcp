# Run Conditions — `ENV` Identity & `CCR-1…7` Clean-Context Evidence

**Task:** NEU-903 · **Compiled:** 2026-07-11 · **Discharges:** acceptance scenario 2 + verification evidence "*baseline, snapshot, isolation, cache, configuration, seed, prior-output, tool/model/environment, and retained-result audits*".

`AEP-1`/`ACS-1 v1.0` was executed across **three separately-initialized isolated runs** — `RUN-1` (initial) plus `RUN-2` and `RUN-3` (clean-context repeats) — satisfying `MC-4`'s `≥ 2`-clean-context-repeat requirement (`GRADER-VAR`, `../automated-evaluation/02_…` §5). Each run is a fresh, isolated LLM grader (minimal harness; gate decision in `00_…` §5) that graded all 12 cases and emitted `quality`/`action` per case (raw outputs in `03_…`). This file records, per run, the `ENV` identity and the full `CCR-1…7` evidence bundle; a repeat missing any of the seven fields would be rejected (`../automated-evaluation/03_…` §2) — none is missing.

---

## 1. Isolation mechanism (how `CCR-3`/`CCR-7` were genuinely achieved)

Each run was a **separately-initialized isolated subagent** dispatched by the executor (NEU-903). Each subagent:
- started from a **fresh context** with no carried-over grader state, no shared in-memory session, and no learner history;
- received a **byte-identical grader prompt** containing only the frozen rubric (`01_…` §1), the three fixtures, and the twelve answers — and **no** prior run's `quality`/`action`/verdict/over-validation flag (the retained oracle table in `01_…` §4 and the archetype labels were **withheld** from every grader);
- committed its 12-case output **before** any oracle comparison; the oracle-vs-actual comparison (`03_…`) was performed by the executor **after** the grader committed, so no prior verdict could steer a later grader.

The three subagents ran as **independent isolated processes that cannot observe one another** — the genuine mechanism behind `CCR-3` (newly initialized, isolated) and `CCR-7` (prior-output isolation). The executor never fed any run's output into another run's prompt.

## 2. `ENV` identity record (per run)

Identical controlled configuration across all three runs (that identity is itself `CCR-5`).

| ENV field | `RUN-1` | `RUN-2` | `RUN-3` |
| --- | --- | --- | --- |
| Grader model id + version (`MODEL-VERSION-BOUND`) | Claude Opus 4.8 (`claude-opus-4-8`, opus tier) | Claude Opus 4.8 (`claude-opus-4-8`, opus tier) | Claude Opus 4.8 (`claude-opus-4-8`, opus tier) |
| Tool / harness version | minimal grading-harness (`00_…` §5); rubric source `src/domain/types/spaced-repetition-tools.ts` at base commit `ea87fbb` (develop head; docs-only branch adds no source) | same | same |
| Runtime | Node.js v24.14.1, Windows 10 | same | same |
| Data/schema base | none — minimal harness seeds **no** DB; the fixtures (`01_…`) are the entire input surface (see `CCR-1`) | same | same |
| Config digest (`CCR-5`) | `sha256:c149e2ee…66eed1` | `sha256:c149e2ee…66eed1` | `sha256:c149e2ee…66eed1` |
| Sampling params | default model decoding; no custom temperature/top-p set; **no seed exposed** | same | same |
| Seed status (`CCR-6`) | `UNSUPPORTED` + tolerance `GRADER-VAR` (`MC-4`) | `UNSUPPORTED` + `GRADER-VAR` | `UNSUPPORTED` + `GRADER-VAR` |

Full config digest: `c149e2eed5daac5874945888843f31610edb3e32444619e7079d041cbb66eed1` (SHA-256 over `ACS-1@v1.0 ;; grader=claude-opus-4-8 ;; rubric=SM2-quality-0-5-derive-from-response ;; params=default-decoding-no-seed ;; fixtures=FIX-KNAP,FIX-LCS,FIX-COIN ;; context=clean-no-learner-history`).

## 3. `CCR-1…7` evidence bundle (per run — the auditable surface)

Each condition's single auditable evidence field (`../automated-evaluation/03_…` §2), recorded for every run.

| Condition | Auditable evidence field | `RUN-1` | `RUN-2` | `RUN-3` |
| --- | --- | --- | --- | --- |
| **`CCR-1`** documented-baseline restoration | baseline identifier | `BASE-ACS1v1.0` (fixtures `FIX-KNAP/LCS/COIN` + frozen `ACS-1 v1.0` answer set; no DB seed applies to the minimal harness — fixtures are the baseline; tool base `ea87fbb`) | same baseline `BASE-ACS1v1.0` | same baseline `BASE-ACS1v1.0` |
| **`CCR-2`** identical input-data snapshot | snapshot hash | `sha256:7d36ba22…d5c48` | `sha256:7d36ba22…d5c48` (equal) | `sha256:7d36ba22…d5c48` (equal) |
| **`CCR-3`** newly initialized, isolated run | isolated-run identifier | `a068728c2b21d40db` | `a0ae93d2d6775ae51` | `adf58572c8240329d` |
| **`CCR-4`** cleared / namespaced caches | cache-reset / namespace evidence | fresh subagent context; no shared model/response cache, no DB query cache, no embedding cache exists in the minimal harness; run artifacts namespaced by isolated-run id `a068728c…` | fresh context; namespace `a0ae93d2…` | fresh context; namespace `adf58572…` |
| **`CCR-5`** identical versioned configuration | configuration digest | `sha256:c149e2ee…66eed1` | `sha256:c149e2ee…66eed1` (equal) | `sha256:c149e2ee…66eed1` (equal) |
| **`CCR-6`** recorded seed / unsupported record | seed status | `UNSUPPORTED` + `GRADER-VAR` tolerance | `UNSUPPORTED` + `GRADER-VAR` | `UNSUPPORTED` + `GRADER-VAR` |
| **`CCR-7`** prior-output isolation | prior-output isolation record | grader prompt byte-identical, contained **no** prior `quality`/`action`/verdict/flag and no oracle/archetype; commit-before-compare order held (comparison in `03_…` done post-commit by executor) | same attestation; `RUN-2` prompt contained no `RUN-1` output | same attestation; `RUN-3` prompt contained no `RUN-1`/`RUN-2` output |

**Full hashes:** snapshot `7d36ba2266b992965a289bd013f1e4be72aaac34cbc4adad94c58da8d86d5c48` (SHA-256 over `01_case-fixtures-and-inputs.md`); config digest as §2.

**Seed note (`CCR-6`, honest unsupported-record).** The grading path's `quality` is LLM-derived and the harness exposes **no** decoding seed, so deterministic seed control is **`UNSUPPORTED`**. Per `../automated-evaluation/03_…` `CCR-6`, this is recorded explicitly together with the declared nondeterminism tolerance `GRADER-VAR` (`MC-4`), under which the readings are interpreted — **not** faked as a supported seed. Reproducibility is therefore evidenced by the run-level verdict agreement across the three isolated repeats (`04_…`), the mechanism `GRADER-VAR` prescribes for a seedless grader.

## 4. Clean-context validity conclusion

All three runs present **all seven** `CCR-*` evidence fields ⇒ each is **clean-context-valid** and counts toward the `≥ 2`-repeat requirement. `RUN-2` and `RUN-3` are two independent clean-context repeats of `RUN-1`'s revision, each restoring the identical baseline/snapshot/configuration and isolated from prior outputs. The retained-result set (`RET`, `../automated-evaluation/02_…` §6) is complete: inputs (`01_…`), raw `quality`/`action` (`03_…`), `ENV` (§2), run ids + isolation bundle (§3), and the oracle-vs-actual comparison + over-validation flag (`03_…`) are all retained, keyed by isolated-run id.
