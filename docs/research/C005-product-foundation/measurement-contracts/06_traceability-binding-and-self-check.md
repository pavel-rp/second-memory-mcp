# Traceability Binding, Hand-off & Adversarial Self-Check

**Task:** NEU-901 · **Compiled:** 2026-07-11 · **Inputs:** NEU-899 (`../traceability/`) + NEU-900 (`../benchmark-suite/`) + NEU-898 (`../product-model/`) + NEU-897 (`../`).
This file binds the NEU-899 deferred slot `LINK-2` to this package, states what remains UNRESOLVED, hands off to the consuming siblings, and runs the adversarial self-check. It **adjudicates no status** and **invents no mutable value**.

---

## 1. `LINK-2` binding (per the NEU-899 binding protocol)

NEU-899 reserved `LINK-2` as the UNBOUND slot for "the validated measurement contract + thresholds + revision rules", resolving `INC-2` and `INC-4` (`../traceability/03_…` §3). This package binds it.

| Slot | Will hold | Owner | Binding by NEU-901 |
| --- | --- | --- | --- |
| **`LINK-2`** | The validated measurement contract + thresholds + revision rules. | SUB-4 (NEU-901) | **BOUND** → `measurement-contracts/` (this package): frozen register `MC-1…MC-11` (`v1.0`), the complete mapping gate (`GATE-STATE = PASS`), proxy-replacement contracts `PRX-1…PRX-8` (`INC-4`), and the OUT-4 privacy gate `PLA-1…PLA-3`. |

The `../traceability/03_…` `LINK-2` row is updated to reflect this binding, and the `INC-2`/`INC-4` marker rows are marked bound. Per the NEU-899 binding protocol, this attaches the artifact identifier to the slot and marks the resolved `INC-*` markers **without** editing any element's evidence class, limitation, or id, and **without** enacting any mutable STATUS change (that is NEU-906 via `LINK-4`).

## 2. What stays UNRESOLVED after this binding (reported, never invented)

Binding `LINK-2` supplies the **contract artifact**; it does **not** supply the *evidence* or the *mutable status* those contracts will eventually carry.

| Marker | State after NEU-901 | Why |
| --- | --- | --- |
| **`INC-2`** | **BOUND → `measurement-contracts/`** — the validated measurement contract now exists. But the **values** it specifies for `averageQuality` (MC-7 `UNCOMPUTED`), per-pattern mastery (MC-6 `UNAVAILABLE`), and `time_spent_ms` reliability (MC-8) remain **uncollectible** until the telemetry/log work happens; those elements' mutable STATUS stays for NEU-906. |
| **`INC-4`** | **BOUND → `measurement-contracts/`** — revision rules + production replacement signals now exist (`PRX-1…PRX-8`). Their **firing** (a real production result) is future; NEU-906 enacts any status flip via `LINK-4`. |
| **`INC-1`** | **UNRESOLVED** (unchanged) — DP-domain benchmark **evidence** (MC-9) is owned by the NEU-900 suite / NEU-904/905 results, adjudicated by NEU-906. NEU-901 defines the contract it will be measured against; it does not produce the evidence. |
| **`INC-3`** | **UNRESOLVED** (unchanged) — DP-grading **reliability** (MC-4) is an OUT-7 automated-eval artifact (NEU-902). |
| **`INC-5`** | **UNRESOLVED** (unchanged) — class-7 demand/adherence prevalence (MC-10/MC-5) has no in-program owner (EX3). |

Distinction preserved (NEU-899 discipline note): NEU-901 fills the **measurement-contract** holes (`INC-2`, `INC-4`) it solely owns; it never fills a **benchmark** hole (`INC-1`), an **automated-eval** hole (`INC-3`), or a **class-7** hole (`INC-5`) with an invented metric.

## 3. Hand-off map

| Consumer | Consumes from this package | Produces |
| --- | --- | --- |
| **NEU-904** (SUB-7) | `GATE-STATE = PASS`; MC-1/MC-5/MC-6/MC-9 (BASELINE journeys JNY-B1/B2); `PLA-1/2/3` for any log-derived claim. | Baseline/boundary `OBS-*`/`AIR-*` runs against frozen contracts. |
| **NEU-905** (SUB-8) | `GATE-STATE = PASS`; MC-2/MC-3/MC-4/MC-9 (FAILURE journeys JNY-F1/F2/F3); the reserved-prototype gate. | Failure/conflict runs against frozen contracts. |
| **NEU-902** (OUT-7 automated-eval) | MC-4's `INC-3` dependency + `PRX-4` revision trigger. | DP-grading reliability bound (feeds `PRX-4`). |
| **NEU-906** (adjudication) | The frozen rules, `PRX-*` triggers, `GATE-STATE`. | Mutable status flips via `LINK-4` under these frozen rules (new version ⇒ rerun). |
| **NEU-907** (decision package) | The bound `LINK-2` + all contracts + gate. | Consolidated prompt-ready product-decision package (`LINK-5`). |

NEU-901 sets **no** mutable status, executes **no** journey, collects **no** operational-log evidence, builds **no** telemetry/dashboard, and selects **no** production UI/architecture/provider (charter out-of-scope, all honored).

## 4. Adversarial self-check (claim discipline)

Performed 2026-07-11 before completion, mirroring the NEU-897/898/899/900 self-checks.

- **Complete mapping gate.** Every material requirement/decision family (P/D/J/M/FM/R/DEC/RA/EX/BX/BM) maps to `≥1` hypothesis + frozen contract or an explicit settled/deferred/gap disposition (`03_…`). Unmapped material items = **0**; `GATE-STATE = PASS`. The gate-failure test shows one unmapped item ⇒ `FAIL` ⇒ downstream blocked. ✔
- **Feasibility checked, not inferred.** Every signal a contract uses cites a `FEAS-*` finding checked against real code (`averageQuality` `UNCOMPUTED` at `learner-context-workflows.ts` L170; per-pattern mastery `UNAVAILABLE`; `time_spent_ms` `COMPUTABLE-UNVALIDATED`). No metric invented from a field name (P4). ✔
- **No invented authority.** Every threshold/decision-rule/revision-trigger lives **only** here (SUB-4); no duplicate metric defined in traceability or elsewhere. `COLLECTION-GAP`/`CLASS-7-DEFERRED` contracts authorize **no** verdict and carry **no** invented value (NEU-899 `OC-5`). ✔
- **Frozen + versioned.** All contracts frozen at `v1.0` before any evidence run; a post-run change ⇒ new version + rerun, never in-place edit or retroactive rescoring (`00_…` §4; acceptance scenario 6). ✔
- **Proxy never laundered.** Every proxy is class-3/4/code-capability and names a class-5/6/7 replacement (`PRX-*`); no proxy is presented as external-user/expert/market validation. A forbidden-phrasing scan ("users want", "market validates", "experts confirm", "proven", "validated by", "demand") finds these strings only inside prohibitions and this check. ✔
- **Proxy-replacement dry-run without status change.** `04_…` §3 fires a revision trigger, makes the contradiction discoverable across the affected set, produces the expected adjudication action, and routes to NEU-906 — **setting no mutable status** (acceptance scenario 5). ✔
- **Privacy gate (OUT-4).** Payload-bearing columns identified from real code (`response_body`, `params` free text, `event_log.data`); redaction confirmed credentials-only. Every authorized `PLA-*` is aggregate-only, least-privilege, time-bounded, with a named deletion owner and payload-free provenance; any missing condition BLOCKS. **Zero raw payloads** in this package. ✔
- **Severity floor.** R1–R5 (High) map to contracts (MC-9/MC-2/MC-4/MC-10/MC-5) that keep them UNRESOLVED/PROVISIONAL and **non-downgradable**; none is placed in `NON-MEASURED-SETTLED` (`OC-7`). ✔
- **Authority firewall.** Mutable status = NEU-906 (`LINK-4`); automated-eval detail = NEU-902 (OUT-7); benchmark execution = NEU-904/905. This package owns only contracts, the mapping gate, revision rules, and log-privacy approvals. ✔
- **No new-id collision / no renumbering.** Only `MC-*`, `FEAS-*`, `RDM-*`, `GATE-STATE`, `PRX-*`, `PLA-*` introduced; every upstream id reused verbatim; `LINK-2` bound, not duplicated. ✔
