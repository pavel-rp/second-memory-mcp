# Traceability Binding, Hand-off & Adversarial Self-Check

**Task:** NEU-902 · **Compiled:** 2026-07-11 · **Inputs:** NEU-901 (`../measurement-contracts/`), NEU-900 (`../benchmark-suite/`), NEU-899 (`../traceability/`), NEU-898 (`../product-model/`), NEU-897 (`../`).
This file binds the NEU-899 deferred slot `LINK-3` to this package, states precisely what remains `INC-3`-UNRESOLVED, hands off to the executing/adjudicating siblings, and runs the adversarial self-check. It **adjudicates no status** and **invents no measurement value**.

---

## 1. `LINK-3` binding (per the NEU-899 binding protocol)

NEU-899 reserved `LINK-3` as the UNBOUND slot for "the automated-eval reliability protocol + DP-domain results" (`../traceability/03_…` §3), resolving `INC-3`. This package binds the part NEU-902 owns — the **protocol**. Results are produced downstream.

| Slot | Will hold | Owner | Binding by NEU-902 |
| --- | --- | --- | --- |
| **`LINK-3`** | The automated-eval reliability protocol + DP-domain results. | OUT-7 (NEU-902 protocol) → NEU-903 (results) | **PARTIALLY BOUND** → `automated-evaluation/` (this package): automation classification `ACL-1…10`, the automatable protocol `AEP-1` (H-F3/MC-4), case set `ACS-1 v1.0`, and the clean-context-repeat spec `CCR-1…7`. **Results remain pending** NEU-903 execution and NEU-906 adjudication. |

The `../traceability/03_…` `LINK-3` row is updated to reflect this binding (protocol bound; results pending). Per the NEU-899 binding protocol, this attaches the artifact identifier to the slot **without** editing any element's evidence class, limitation, or id, and **without** enacting any mutable STATUS change (that is NEU-906 via `LINK-4`).

## 2. What stays UNRESOLVED (reported, never invented)

| Marker | State after NEU-902 | Why |
| --- | --- | --- |
| **`INC-3`** | **UNRESOLVED** (protocol bound; results pending) | NEU-902 supplies the *vehicle* (the automatable classification + `AEP-1` + `ACS-1` + `CCR-*`) by which the DP-grading reliability **bound** can be produced; **collecting** it is NEU-903, and **settling** R3/FM4/BM-5 is NEU-906. Mirrors NEU-900's treatment of `INC-1` (`../benchmark-suite/05_…` §2). |
| **`INC-1`** | **UNRESOLVED** (unchanged) | DP-domain benchmark *effect* evidence (MC-9) is owned by the NEU-900 suite / NEU-904/905; automated eval does not produce it (`ACL-9`). |
| **`INC-2`** | **BOUND → `../measurement-contracts/`** (unchanged) | Measurement-contract collection gaps (MC-6/7/8) are SUB-4's; automation classifies them non-automatable (`ACL-6/7/8`) but resolves none. |
| **`INC-5`** | **UNRESOLVED** (unchanged) | Class-7 demand/adherence (MC-10/MC-5) has no in-program owner; automation cannot produce it (`ACL-5/10`). |

**Discipline note (preserved).** `INC-3` is an **automated-eval** hole this protocol's *results* will feed; it is not a measurement-contract hole (`INC-2`, SUB-4), a benchmark-effect hole (`INC-1`, NEU-900 suite), or a class-7 hole (`INC-5`). NEU-902 never fills a measurement, benchmark-effect, or class-7 hole with an automated result. R3 (the FM4/BM-5 reliability risk) stays **non-downgradable** (`OC-7`).

## 3. Hand-off map

| Consumer | Consumes from this package | Produces |
| --- | --- | --- |
| **NEU-903** (SUB-10, execution) | `BATCH-AUTOEVAL`: `AEP-1`, `ACS-1 v1.0`, `CCR-1…7`, `ENV`/`RET` requirements, `MC-4 v1.0` reference, the `JNY-F3` reserved-harness gate | Executed class-5 runs (`RET` artifacts) feeding `PRX-4` |
| **NEU-906** (adjudication) | The retained over-validation flags + `MC-4` BOUNDING rule + `GRADER-VAR`/`MODEL-VERSION-BOUND` tolerance | Mutable status flips for R3/FM4/BM-5 via `LINK-4` (new version ⇒ rerun) |
| **NEU-907** (decision package) | The bound `LINK-3` + the coverage audit (`04_…`) + NEU-903's results | Consolidated prompt-ready product-decision package (`LINK-5`) |

NEU-902 executes **no** case, sets **no** mutable status, defines **no** metric/threshold, builds **no** telemetry/dashboard/prototype, recruits **no** external user, and selects **no** production UI/architecture/provider (charter out-of-scope, all honored).

## 4. Adversarial self-check (claim discipline)

Performed 2026-07-11 before completion, mirroring the NEU-897/898/899/900/901 self-checks.

- **Define-not-run.** This task executes **zero** cases, collects **zero** evidence, and builds **zero** prototypes. It classifies, defines the protocol, and allocates the batch only. ✔
- **Complete classification.** All ten hypothesis-carrying contracts `MC-1…MC-10` are classified (`ACL-1…10`); `MC-11` is recorded as `NON-MEASURED-SETTLED` (no hypothesis to automate). Unclassified material hypotheses = **0** (acceptance scenario 1). ✔
- **Automatable status demonstrated, not assumed.** Each classification cites the first failing clause of the deterministic test (`00_…` §3) against the frozen contract; the single automatable case (`ACL-4`) passes all five clauses because `MC-4`'s replacement is the automated-eval `PRX-4`/`INC-3` path (assumption in the spec discharged). ✔
- **Non-automated hypotheses preserved.** Every non-automatable hypothesis carries a validity/proportionality rationale **and** its named retained non-automated evidence path (`JNY-*` class-3/paper, `INC-*`, class-7) — none disappears (acceptance scenario 3). ✔
- **Caps intact.** Automatable hypotheses = 1 (≤ 6); cases = 12 (≤ 18); one batch. The cap-exceedance routing rule is fixed and not triggered (`04_…` §5; acceptance scenario 4). ✔
- **Reference, never redefine.** Every threshold/decision-rule/tolerance/replacement is quoted from `MC-4 v1.0` by id + version; **no** metric or threshold is defined here (`OC-5` respected). A scan for an invented numeric threshold finds none — the only quantity, `quality ≥ 3`, is `MC-4`/`FEAS-2`'s, quoted. ✔
- **Evidence-class integrity (no laundering).** The case set is labeled class-5 `[automated-eval]` with its "green ≠ product-correct" limitation; it is **never** presented as class-3 dogfooding, class-4 AI-critique, class-6 log, or class-7 external-user/expert/market validation. A forbidden-phrasing scan ("users want", "market validates", "experts confirm", "proven", "validated by", "demand", "reliable" as a settled claim) finds these strings only inside prohibitions and this check — never as an assertion; the grading result **bounds**, it does not establish reliability (G5.1). ✔
- **Clean-context auditable.** Each of `CCR-1…7` has exactly one recorded evidence field; a repeat missing any field is rejected and cannot count toward the `≥ 2`-repeat requirement or coverage (`03_…` §2; OUT-7). ✔
- **Never-fabricate-scores.** `AEP-1` reads `quality`/`action` from the real grader response; the oracle is the *authored input's* ground truth, not a fabricated score (`02_…`). ✔
- **Severity floor.** R3 (and the untouched R1/R2/R4/R5) stay UNRESOLVED/PROVISIONAL and **non-downgradable**; no automated result can settle or drop a High risk (`OC-7`). ✔
- **Privacy scan.** Inputs are authored synthetic DP answers — **no** operational-log payload is used; the only log reference is the aggregate-only constraint that would apply if a real learner answer were ever substituted (`PLA-*`, `EX6`/`BX-5`). ✔
- **No new-id collision / no renumbering.** Only `ACL-*`, `AEP-*`, `ACS-*`, `CCR-*`, `ENV`, `RET`, `BATCH-AUTOEVAL` are introduced; every upstream `MC-*`/`H-*`/`JNY-*`/`FM*`/`BM-*`/`R*`/`PRX-*`/`INC-*`/`LINK-*`/`FEAS-*` id is reused verbatim. `LINK-3` is bound, not duplicated. ✔
