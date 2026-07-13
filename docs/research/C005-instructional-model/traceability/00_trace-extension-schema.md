# Instructional Trace Extension — Schema & Conventions

**Task:** NEU-916 · **Compiled:** 2026-07-13 · **Extends (references, never rebuilds):** `../../C005-product-foundation/traceability/00_trace-schema-and-conventions.md` (NEU-899 trace-record schema, relation vocabulary, completeness lattice, orphan checks) and `../../C005-product-foundation/01_evidence-taxonomy.md` (NEU-897 seven-class taxonomy). **Sole content input:** the NEU-915 synthesis in this package (`../` — the mechanism files, `02_…`, `03_synthesis.md`).

This file says **how** the NEU-887 traceability register is extended to instructional evidence. It defines no new taxonomy and no new lattice — it instantiates NEU-899's schema for a new class of tracked item (an evidence *finding*, `F-*`) and adds only the namespaced identifiers the instructional layer needs. The register itself is `01_instructional-evidence-register.md`. **It adjudicates no status** (that is `../adjudication/`) and decides no mechanism.

---

## 1. What is tracked here (and why the key differs from product-foundation)

NEU-899 keys one trace record per **material product element** (`TR-<elementId>`: principle, differentiator, risk, decision, candidate…). NEU-916 tracks a different population: the **labeled evidence findings** the NEU-915 synthesis produced. So the instructional register keys one record per **finding id**, reusing the finding's own id verbatim (`F-M01-1`, `F-CL-2`, `F-TR-3`, …) exactly as NEU-899 reused the element's own id — **no second numbering is introduced for any finding.**

A finding is the atomic tracked item because NEU-916's acceptance bar is *finding-level*: "every synthesis finding is registered with its evidence class, provenance, cutoff, and limitation." Product elements are not re-registered here (NEU-887 already traces them); the instructional register links **outward** to the mechanism a finding informs and to the downstream decision record (`DR-Mxx`) that will consume it.

## 2. The instructional trace-record schema (per finding)

Every NEU-915 finding gets exactly one register row with these fields. Absent values are written explicitly (`—`), never left blank. The first four columns are the NEU-916 acceptance-bar fields (class, provenance, cutoff, limitation); the rest provide the bidirectional walk.

| Field | Meaning | Source of truth |
| --- | --- | --- |
| **Finding** | The finding id, reused verbatim (`F-Mxx-n` / `F-CL-n` / `F-DD-n` / `F-TR-n`). | NEU-915 |
| **Class** | The single NEU-887 evidence class (1 `[literature]` / 2 `[code-evidence]` / 6 `[operational-log]`; the only classes NEU-915 produced). Never re-classed here. | NEU-915 via `../01_evidence-labeling.md` |
| **Evidence type** | causal / correlational / meta-analytic / theoretical / review / algorithm-spec / practitioner / code-fact / contested / inherited-risk (verbatim from the finding). | NEU-915 |
| **Cutoff** | The finding's verification cutoff (2026-07-13 fresh / 2026-07-07 reused). Never silently upgraded. | NEU-915 |
| **Provenance** | The source-of-record pointer: the mechanism/framing file + finding anchor (URLs and repo paths live in the finding itself and are not duplicated here). | NEU-915 |
| **Structural limitation** | The one-line "what it can never prove," always carrying the DP-transfer uncertainty where the finding does. | NEU-915 |
| **Informs (reverse anchor)** | The mechanism(s) `Mxx` / cross-cutting axis the finding governs — the handle a decision agent walks *back* from. | NEU-915 |
| **Carried gap / conflict** | The `G*` gap and/or `C*` conflict the finding is entangled in (from `03_synthesis.md`), or `—`. | NEU-915 `03_…` |
| **Incomplete marker** | The `INC-I#` marker if the finding depends on a missing downstream artifact; else `—`. | this task, §4 |

The register does **not** carry a completeness state per finding: a finding is *evidence*, not a decision, so its disposition (`provisional` / `unresolved`) is set in the **adjudication ledger** (`../adjudication/`), not here — mirroring NEU-899, where mutable status was deferred to NEU-906, not asserted in the trace register.

## 3. Relation edges (reused vocabulary)

The instructional register reuses NEU-899's `REL:*` edge vocabulary unchanged and adds no new edge *type*. The two edges it exercises most:

- `REL:evidences` — a finding **evidences** a mechanism / cross-cutting axis (inverse of NEU-899's `evidenced-by`). This is the forward walk: finding → mechanism.
- `REL:provisional-on` — a finding is **provisional-on** an open gap (`G*`) or conflict (`C*`) that keeps it from settling.
- `REL:blocked-by-artifact` — a finding is **blocked-by-artifact** an `INC-I#` (a missing downstream decision record, mastery contract, or in-domain measurement).

`code-evidence` findings (`F-Mxx-5`, the "prior in-repo reconciliation evidence") additionally carry an implicit `REL:covers` to the conflict they surface (e.g. `F-M09-5 covers C3`), recorded in the *Carried conflict* column rather than a separate edge.

## 4. Instructional incomplete-state markers (`INC-I#`) and link slots (`LINK-I#`)

Namespaced `-I` so they never collide with product-foundation `INC-1…5` / `LINK-1…4`. Each marks a **missing downstream artifact**, named with its owner, per NEU-899 rule 4 (report, never invent).

| Marker | Missing artifact | Owning sub-task | Maps to inherited |
| --- | --- | --- | --- |
| **INC-I1** | In-domain (dynamic-programming) transfer/effect measurement for **every** mechanism. | experiment sub-task + reconciliation (NEU-888) | NEU-887 `INC-1` / R1 / conflict X1 (non-downgradable High) |
| **INC-I2** | The per-mechanism **decision records** themselves (`DR-Mxx`) — behaviors, mastery signals, thresholds, enforceable controls. | mechanism-decision sub-tasks NEU-917…921 | new (this task authors only the template) |
| **INC-I3** | The **reconciliation verdict** for each `code-evidence` conflict (C1–C6): which live rule is in force and whether it aligns. | reconciliation sub-task (NEU-888) | new |
| **INC-I4** | The **durable-mastery-vs-contest-speed** decision framework the transfer/speed findings feed. | NEU-917 | NEU-888 OUT-3 |
| **INC-I5** | The recovered content of the **three absent spec-named input files** (AI-tutored-SRS specifics, chunking-capacity numbers, graduated-reteaching parameters). | out-of-caps (NEU-915 G2) — may stay unrecovered | new (cap-bound) |

**Link slots (`LINK-I#`, currently UNBOUND):** `LINK-I1` = the decision record per mechanism (`DR-M01…DR-M10`), bound when a mechanism-decision sub-task authors it; `LINK-I2` = the mastery-signal contract per learning-critical mechanism, bound by the mastery-model sub-task. Their content is **not** defined here.

## 5. Instructional orphan / completeness checks (`IOC-#`, enforced by an audit)

Mirrors NEU-899's `OC-*`. An item failing any check is reported and **cannot silently count toward register completeness** (NEU-916 acceptance scenario 2: "every synthesis finding is registered … and no NEU-887 machinery was re-derived rather than extended").

| Id | Check | Passing condition |
| --- | --- | --- |
| **IOC-1** | Finding-completeness | Every NEU-915 finding (`F-M01-1…F-M10-5`, `F-CL-1/2`, `F-DD-1/2/3`, `F-TR-1/2/3`) has exactly one register row. |
| **IOC-2** | Class fidelity | Every row's class is the finding's own NEU-887 class, unchanged; no class-1–6 finding is presented as class-7 or as external validation. |
| **IOC-3** | Provenance + cutoff present | Every row carries a source pointer and a cutoff; no cutoff is silently upgraded. |
| **IOC-4** | Limitation present | Every row carries a structural limitation; every mechanism finding carries or inherits the DP-transfer uncertainty (`INC-I1`). |
| **IOC-5** | Reverse-walk | Every finding names the mechanism / axis it informs; every mechanism M01–M10 and every cross-cutting axis is reachable from ≥1 finding. |
| **IOC-6** | No invented value | No finding row asserts a value for a gap `G*`; gap-entangled findings carry the `G*` and (where artifact-bound) an `INC-I#`, never a locally invented number (NEU-887 discipline). |
| **IOC-7** | No re-derivation | No row re-defines a taxonomy class, materiality clause, or lattice value; each references the product-foundation file instead. |

The audit itself is a downstream verification step (NEU-916 "register-completeness audit"); this schema defines the checks, `01_…` is the data they run over.

## 6. Register-completeness self-attestation (NEU-916)

The register in `01_…` contains **60 finding rows** — the full NEU-915 inventory: 52 mechanism findings (M01: 6, M02: 5, M03: 5, M04: 6, M05: 5, M06: 5, M07: 5, M08: 5, M09: 5, M10: 5) plus 8 cross-cutting findings (`F-CL-1/2`, `F-DD-1/2/3`, `F-TR-1/2/3`). `IOC-1` passes by construction; the remaining checks are attested in `01_…` §7.
