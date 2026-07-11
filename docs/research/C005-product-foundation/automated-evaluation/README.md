# Bounded Automated-Evaluation Protocol

**Task:** NEU-902 (SUB-9 of NEU-887 · program C005) · **Compiled:** 2026-07-11
**Inputs (verbatim, never re-decided):** NEU-901 (`../measurement-contracts/`) + NEU-900 (`../benchmark-suite/`) + NEU-899 (`../traceability/`) + NEU-898 (`../product-model/`) + NEU-897 (`../`).

**What this is:** the bounded, reproducible *protocol* for the class-5 **[automated-eval]** evidence path (NEU-887 OUT-4 evidence class + OUT-7 clean-context repeat). It classifies **every** material hypothesis as automatable or non-automatable, records why each non-automated hypothesis is excluded, and specifies — for the one automatable hypothesis that clears the bar — a versioned case set, a scoring oracle, the frozen decision rule (referenced from NEU-901, never redefined), controlled configuration, nondeterminism tolerance, environment identity, retained-result requirements, and the clean-context-repeat and isolation evidence.

**What it is not:** an execution. It **runs no case, collects no evidence, and adjudicates no status.** Execution is SUB-10 (NEU-903); status adjudication is NEU-906. It defines **no new metric or threshold** — those are frozen in NEU-901's `MC-*` register and are referenced here by id. It uses no automated result as external-user, expert, or market validation (evidence discipline, `../01_evidence-taxonomy.md` #3).

## How to read this package

| File | Contents |
| --- | --- |
| `00_protocol-schema-and-scope.md` | Scope, altitude, caps (≤6 automatable hypotheses / ≤18 cases), the identifier scheme (`ACL-*`, `AEP-*`, `ACS-*`, `CCR-*`, `ENV`, `RET`, `BATCH-AUTOEVAL`), the automatability test, and the schema every classification / case / clean-context record instantiates. |
| `01_hypothesis-automation-classification.md` | `ACL-1…ACL-10` — every material hypothesis (carried by frozen `MC-1…MC-10`) classified **automatable** or **non-automatable**, each non-automated one with an explicit validity/proportionality rationale and its retained non-automated evidence path. |
| `02_automatable-evaluation-definitions.md` | `AEP-1` — the full definition for the one automatable hypothesis (H-F3 / MC-4, DP-grading over-validation): case set `ACS-1 v1.0`, per-case oracle, the referenced frozen `MC-4` BOUNDING rule, controlled configuration, `GRADER-VAR`+`MODEL-VERSION-BOUND` tolerance, `ENV` identity fields, `RET` retained-result requirements. |
| `03_clean-context-repeat-and-isolation.md` | The OUT-7 core: `CCR-1…CCR-7` clean-context-repeat & isolation conditions, each with its single auditable evidence field (baseline id, snapshot hash, isolated-run id, cache evidence, config digest, seed status, prior-output isolation record). |
| `04_coverage-audit-and-caps.md` | Case-to-hypothesis coverage audit, the hypothesis-count and case-count cap proofs, and the cap-exceedance routing rule (route the feature back for scope revision, never create an unbounded task). |
| `05_traceability-binding-and-self-check.md` | Binds NEU-899 slot `LINK-3` (**PARTIALLY BOUND**), states what stays `INC-3`-UNRESOLVED, hands off to NEU-903/906/907, and runs the adversarial self-check. |

## Rules this package obeys (inherited, not invented)

1. **Reference, never redefine.** Every threshold / decision rule / nondeterminism tolerance / replacement signal is quoted from a frozen `MC-*` contract (`../measurement-contracts/01_…`) by id and version. Inventing one here would be an `OC-5` failure (`../traceability/00_…` §6).
2. **Caps are hard.** ≤ 6 automatable hypotheses, ≤ 18 total cases, in one batch (`BATCH-AUTOEVAL` → NEU-903). Exceedance is an **incomplete** result that routes the feature back for scope revision (`04_…`), never a silent expansion (acceptance scenario 4).
3. **Automatable status is demonstrated, not assumed.** A hypothesis is automatable only if it passes the automatability test (`00_…` §3) against the frozen contract's collection method; otherwise it is non-automatable with a recorded rationale and stays on its named non-automated evidence path (never dropped — acceptance scenario 3).
4. **Class-5 is its own evidence class.** An automated result bounds only what its oracle encodes (green ≠ product-correct, `../01_evidence-taxonomy.md` class 5); it is never relabeled as class-3 dogfooding, class-4 AI-critique, or class-7 real-user/market validation.
5. **Clean-context by construction.** Every automatable case is defined so a single downstream session can restore a documented baseline, run in isolation from prior mutable state, and repeat under identical versioned configuration with a recorded seed status — each condition independently auditable (`03_…`).

## Relation to the rest of C005

- Consumes the frozen contract `MC-4 v1.0` (and its `INC-3` / `PRX-4` handles) from **NEU-901**, and the `JNY-F3` grading-path vehicle + its reserved minimal grading-harness gate from **NEU-900**.
- Binds **NEU-899**'s `LINK-3` slot as **PARTIALLY BOUND** (protocol defined; results pending). `INC-3` (DP-grading reliability) stays **UNRESOLVED** until NEU-903 executes and NEU-906 adjudicates.
- Hands off to **NEU-903** (SUB-10, execution of `BATCH-AUTOEVAL`), **NEU-906** (status adjudication via `LINK-4`), and **NEU-907** (consolidated decision package via `LINK-5`).
