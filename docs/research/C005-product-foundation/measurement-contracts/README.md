# Authoritative Measurement & Proxy-Replacement Contracts

**Task:** NEU-901 (SUB-4) · **Covers:** OUT-2, OUT-4, OUT-5 · **Compiled:** 2026-07-11
**Depends on:** NEU-899 (`../traceability/`) + NEU-900 (`../benchmark-suite/`) + NEU-898 (`../product-model/`) + NEU-897 (`../`).
**Contract freeze:** `v1.0` — frozen 2026-07-11, before any NEU-904/NEU-905/automated-eval/operational-log evidence run.

This package is the **immutable measurement authority** for the C005 product foundation. It is the sole owner of:

1. **Frozen measurement contracts** (`MC-*`) — one per material requirement, decision, and hypothesis: intended learner behavior, metric, feasible collection method, threshold/decision-rule, declared nondeterminism tolerance, present evidence-status label, and the named production signal that will replace or revise each proxy.
2. **The complete requirement-and-decision mapping gate** (`RDM-*` / `GATE-STATE`) — every material requirement and decision maps to ≥1 testable material hypothesis and a frozen contract (or an explicit, auditable non-measured disposition). **NEU-904/NEU-905 evidence collection is BLOCKED until this gate passes.**
3. **Proxy-replacement contracts** (`PRX-*`) — for each accepted proxy, the production/external-user signal that replaces it, the result that triggers revision vs confirmation, and a dry-run-able replacement process.
4. **Operational-log privacy approvals** (`PLA-*`, OUT-4) — least-privilege, time-bounded, minimized, retention-bounded, payload-free-provenance access records for every payload-bearing log use.
5. **Rule-versioning discipline** — a frozen rule found invalid later requires a **new contract version + reruns**; no retrospective reinterpretation.

**This package does not** record or update mutable evidence STATUS, adjudicate any journey/AI/automated/literature/code evidence, execute any journey, collect external-user evidence, invent a metric because a similarly named field exists, or select pedagogy/curriculum/UI/architecture/provider/telemetry. Mutable status adjudication is **NEU-906** (via `LINK-4`); automated-eval protocol detail is **NEU-902 (OUT-7)**.

---

## What this binds

This package binds the NEU-899 deferred slot **`LINK-2`** (the UNBOUND slot reserved for measurement contracts) and resolves markers **`INC-2`** (validated measurement contract) and **`INC-4`** (revision rules & production replacement signals). Binding is structural only — the artifact now exists; the *mutable STATUS* of every element it governs still awaits NEU-906 (`LINK-4`). See `06_traceability-binding-and-self-check.md`.

## File index

| File | Contents |
| --- | --- |
| `00_contract-schema-and-versioning.md` | The `MC-*` contract schema; freeze + versioning + rerun discipline; evidence-status labels; nondeterminism-tolerance vocabulary. |
| `01_measurement-contract-register.md` | The frozen contracts `MC-1…MC-11` covering the five `JNY-*` journeys' measurements, the inspected signal list, and the non-measured settled decisions. |
| `02_feasibility-and-telemetry-inventory.md` | Per-signal feasibility checked against actual code (`FEAS-*`): COMPUTABLE / UNCOMPUTED / UNAVAILABLE, each citing the exact source. The unavailable-telemetry inventory. |
| `03_requirement-decision-mapping-gate.md` | The complete mapping gate: every material requirement/decision → hypothesis + contract; explicit `GATE-STATE`; the gate-failure test. |
| `04_proxy-replacement-contracts.md` | `PRX-*`: production/external-user replacement signal, revision-vs-confirmation triggers, and a dry-run of the replacement process per accepted proxy. |
| `05_operational-log-privacy-gate.md` | The OUT-4 privacy gate: `PLA-*` access records, field allowlist + minimization/redaction, exclusion rules, retention + deletion owner, payload-free provenance. |
| `06_traceability-binding-and-self-check.md` | `LINK-2` binding, hand-off map, and the adversarial self-check. |

## New identifier families introduced (no collision, no renumbering)

`MC-*` (measurement contract), `FEAS-*` (per-signal feasibility finding), `RDM-*` (requirement/decision mapping row), `GATE-STATE` (the pre-evidence gate verdict), `PRX-*` (proxy-replacement contract), `PLA-*` (privacy log-access record). Every upstream identifier (`J/M/FM/P/D/EX/R/DEC/RA`, `CAND-*`, `BM-*/BX-*`, `TR-*`, `REL:*`, `INC-*/LINK-*`, `OC-*`, `JNY-*/OBS-*/AIR-*`) is **reused verbatim** — this package consumes and extends, it never duplicates, contradicts, or renumbers.
