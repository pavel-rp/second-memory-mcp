# Protocol Scope, Caps, Automatability Test & Record Schemas

**Task:** NEU-902 · **Compiled:** 2026-07-11 · **Inputs:** NEU-901 (`../measurement-contracts/`), NEU-900 (`../benchmark-suite/`), NEU-899 (`../traceability/`), NEU-898 (`../product-model/`), NEU-897 (`../`).
This file fixes the *structure* the rest of the package instantiates: what this protocol may and may not decide, the hard caps, the deterministic automatability test, the identifier scheme, and the schemas every `ACL-*` / `AEP-*` / `ACS-*` / `CCR-*` record obeys. It decides no product content, invents no metric, and adjudicates no status.

---

## 1. Altitude & scope

**In scope (this protocol owns):**
- Classifying **every** material hypothesis as automatable or non-automatable under the feature-wide materiality inventory (`../product-model/02_…`; carried by the frozen contracts `MC-1…MC-10`).
- Recording, for **every** non-automated material hypothesis, why automation is invalid or disproportionate, and the named non-automated evidence path it stays on.
- Selecting a **complete** automatable set (capped at 6 hypotheses) and designing its versioned case set (capped at 18 total cases).
- Defining, per automatable hypothesis: the scoring oracle / expected result, the **referenced** frozen threshold/decision rule, controlled configuration, declared nondeterminism tolerance, tool/model/environment identity, retained-result requirements, and clean-context reset + isolation evidence requirements.
- Allocating the bounded run to the execution task (SUB-10 / NEU-903) as `BATCH-AUTOEVAL`.
- Binding the automated-evaluation traceability slot (`LINK-3`) per the NEU-899 binding protocol.

**Out of scope (owned elsewhere — never done here):**
- Executing any case or adjudicating its evidence (NEU-903 executes; NEU-906 adjudicates).
- Defining or altering any metric, threshold, decision rule, or revision trigger — those are frozen in `../measurement-contracts/01_…` (`MC-*`) and referenced here by id + version. Inventing one is an `OC-5` failure (`../traceability/00_…` §6).
- Exceeding 6 automatable hypotheses or 18 cases (routes to scope revision, `04_…`).
- Building production telemetry, dashboards, a production application, pedagogy, curriculum, UI, architecture, or provider selection (EX1–EX6 / BX-1…BX-5).
- Presenting an automated result as external-user, expert, or market validation (evidence class discipline, `../01_evidence-taxonomy.md` #3), or as a substitute for creator dogfooding (class-3) or independent AI review (class-4) where those answer a *different* hypothesis.

## 2. Hard caps (charter-fixed)

| Cap | Value | Enforcement |
| --- | --- | --- |
| Automatable hypotheses in the first feature batch | **≤ 6** | `04_…` count check; exceedance ⇒ incomplete + scope revision. |
| Total cases across the batch | **≤ 18** | `04_…` count check; a valid design needing > 18 ⇒ incomplete + scope revision. |
| Batches | **1** (`BATCH-AUTOEVAL` → NEU-903) | All automatable coverage in one downstream session. |

The caps are **upper bounds proving the batch is sizable to one session**, not targets. A *complete* automatable set smaller than the cap is a valid, expected outcome; the audit records the true count either way (`04_…`).

## 3. The automatability test (deterministic)

A material hypothesis is **automatable** only if, reading its frozen `MC-*` contract's collection method (`../measurement-contracts/01_…`) and the class-5 definition (`../01_evidence-taxonomy.md`), **all** of the following hold. First failing clause ⇒ **non-automatable**, with that clause recorded as the rationale.

1. **Oracle exists.** A deterministic ground-truth expectation (a scoring oracle) can be authored for each case *without* recruiting a real user, an expert, or the creator-as-learner — the expected verdict is a property of an **authored** input, not of a person's behavior over time.
2. **Session-sizable.** The evidence is obtainable inside a single, newly initialized run — not a multi-week/-month temporal window, an adherence-over-time curve, or a population distribution.
3. **Signal collectible now.** The system-under-test path and the signal the oracle reads already exist and are computable today (a `FEAS-*` finding that is not `UNCOMPUTED`/`UNAVAILABLE`; `../measurement-contracts/02_…`). Automating an eval of a signal that does not yet exist is invalid.
4. **Class-fit.** The frozen contract's replacement signal / blocking marker is an **automated-eval** artifact (`PRX-4` / `INC-3`), i.e. the class-5 path is the one the program actually assigned to this hypothesis — not class-3 dogfooding (`INC-1`), class-7 (`INC-5`), or a measurement-contract collection gap (`INC-2`).
5. **Bounded within caps.** A valid case design for it fits inside the residual 6-hypothesis / 18-case budget.

Clause 4 is the sharpest filter: the frozen register already routes each hypothesis to its owning evidence path, so automatability is *demonstrated against the frozen contract*, never asserted.

## 4. Identifier scheme (new, non-colliding)

All upstream ids (`MC-*`, `H-*`, `JNY-*`, `FM*`, `BM-*`, `R*`, `PRX-*`, `INC-*`, `LINK-*`, `FEAS-*`, `CAND-*`, `EX*`, `BX*`) are reused **verbatim**. This package introduces only:

| Family | Meaning |
| --- | --- |
| **`ACL-<n>`** | Automation-classification record — one per material hypothesis (`01_…`). |
| **`AEP-<n>`** | Automatable-evaluation protocol block — one per automatable hypothesis (`02_…`). |
| **`ACS-<n>`** | Automated case set, carried at an explicit `v<major>.<minor>` version (`02_…`). |
| **`ACS-<n>-<k>`** | An individual case `k` inside case set `n` (`02_…`). |
| **`CCR-<n>`** | Clean-context-repeat / isolation condition (`03_…`). |
| **`ENV`** | The environment-identity record schema captured per run (`02_…` §4). |
| **`RET`** | The retained-result requirement set (`02_…` §5). |
| **`BATCH-AUTOEVAL`** | The single bounded execution batch allocated to NEU-903 (SUB-10). |

Versioning of `ACS-*` follows the NEU-901 immutability discipline (`../measurement-contracts/00_…` §4): a case set is frozen at a version before its first run; a post-run change is a **new version + rerun**, never an in-place edit.

## 5. Record schemas

### 5.1 Automation-classification record (`ACL-*`)

| Field | Meaning |
| --- | --- |
| **Id / hypothesis** | `ACL-<n>`; the material hypothesis and the frozen contract carrying it (`MC-*`, `H-*`). |
| **Governed material elements** | The `FM*/BM-*/R*/P*/D*/CAND-*` the contract governs (reused verbatim). |
| **Automatability test result** | PASS ⇒ automatable, or the **first failing clause** (`§3` 1–5). |
| **Classification** | `AUTOMATABLE` / `NON-AUTOMATABLE`. |
| **Rationale** | For non-automatable: the validity or proportionality reason (why automation is invalid or disproportionate). For automatable: the `AEP-*` it is defined in. |
| **Retained evidence path** | The named non-automated path the hypothesis remains covered by (`JNY-*` class-3/paper vehicle, `INC-*` marker, class-7 deferral) — so it never disappears from the inventory. |

### 5.2 Automatable-evaluation protocol block (`AEP-*`) — required fields (acceptance scenario 2)

`Hypothesis` · `Frozen contract referenced (MC-* v)` · `Case set (ACS-* v)` · `Per-case scoring oracle` · `Referenced threshold / decision rule (quoted from MC-*, not redefined)` · `Controlled configuration` · `Nondeterminism tolerance (token from MC-*)` · `Environment identity (ENV)` · `Retained-result requirements (RET)` · `Clean-context evidence requirements (CCR-*)`.

### 5.3 Clean-context-repeat condition (`CCR-*`)

| Field | Meaning |
| --- | --- |
| **Id / condition** | `CCR-<n>`; the reset/isolation guarantee it enforces. |
| **Requirement** | What every run must do to satisfy it. |
| **Auditable evidence field** | The single recorded artifact that proves it (baseline id / snapshot hash / isolated-run id / cache evidence / config digest / seed status / prior-output isolation record). |

## 6. Evidence-class placement

The automated case set realizes evidence **class 5 [automated-eval]** (`../01_evidence-taxonomy.md`): *deterministic/versioned automated evaluation against an oracle*, with the required provenance (case-set version, oracle, config digest, seed, environment). Its structural limitation is carried unchanged: **it only tests what the oracle encodes; a green result does not establish product correctness** — it *bounds* the specific failure the oracle probes, exactly as the frozen `MC-4` rule states. No `AEP-*` result may be summarized as class 3/4/6/7.
