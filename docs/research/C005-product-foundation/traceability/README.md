# C005 Product Foundation — Independent Traceability Structure

**Task:** NEU-899 (SUB of NEU-887 · program C005, AI-backed dynamic-programming course) · **Covers:** OUT-2, OUT-4 · **Compiled:** 2026-07-11
**Depends on / built on:** NEU-898 product model (`../product-model/`, files `00_…`–`04_…` + README) and, transitively, the NEU-897 bounded-research package (`../`). **These are the sole inputs.**

**What this is:** the independently traceable structure over the NEU-898 product model. It gives every material candidate, requirement, and decision a **stable trace record** with a **bidirectional** link between (evidence source + evidence class + structural limitation) and (intended learner behavior, metric/signal, decision rule, rejected alternative, materiality classification, inclusion/exclusion status), plus an **explicit completeness state**. It provides forward and reverse **orphan audits**, represents missing downstream artifacts (benchmark evidence, measurement contracts, decision rules, replacement signals) as **explicit incomplete states** rather than inventing values for them, and reserves empty **link slots** so authoritative artifacts from later sub-tasks can be bound later without their content being defined here.

**What it is not:** it does **not** create, renumber, duplicate, contradict, or re-decide any NEU-897/NEU-898 identifier — it *wraps* them. It runs **no** new research, exceeds **none** of NEU-897's caps, and adds **no** new evidence. It does **not** adjudicate mutable evidence/decision STATUS (that is NEU-906), does **not** define or validate metrics, thresholds, decision rules, revision triggers, or production replacement signals (that is the measurement-contracts task, SUB-4), and selects **no** benchmark journey suite (that is NEU-900). It defines the trace *structure* and the *current* completeness states only.

## How to read this package

| File | Contents |
| --- | --- |
| `00_trace-schema-and-conventions.md` | The normative trace-record schema; the trace-relation (edge) vocabulary; the completeness-state lattice (with a mapping onto NEU-898's `settled`/`provisional`/`incomplete` terms); the orphan-check definitions; the ID conventions this package introduces. |
| `01_material-element-trace-register.md` | The trace register: one record per material element (P·D·FM·J·M·R·DEC·RA·EX·BM·BX and every Included CAND), giving forward evidence trace (source + class + limitation), reverse anchor (behavior / metric / decision rule / rejected alternative), relation edges, materiality classification, inclusion status, and completeness state. |
| `02_bidirectional-walk-index.md` | The two walkable indices that make each trace followable in both directions: the **forward** index (element → evidence) and the **reverse** index (evidence item / behavior / metric / decision rule / rejected alternative → element), so an independent reviewer can start from either end. |
| `03_completeness-states-and-incomplete-markers.md` | The completeness-state register (SETTLED / PROVISIONAL / INCOMPLETE / UNRESOLVED) for every material element; the `INC-*` incomplete-state markers for absent downstream artifacts, each with its owning sub-task; and the `LINK-*` deferred authoritative-artifact link slots (currently UNBOUND). |
| `04_orphan-and-inventory-reconciliation-audit.md` | The forward/reverse orphan checks (`OC-*`) over candidates, evidence, requirements, decisions, metrics, exclusions, and risks; the complete-inventory reconciliation against NEU-898's CAND-1…32; and the adversarial audit for proxy-evidence relabeling and locally invented measurement authority. |
| `05_excluded-candidate-register.md` | Every non-material / excluded / routed candidate with its retained non-materiality criterion and the rule that keeps it from disappearing from the inventory silently (acceptance scenario 2). |

## Trace-identifier conventions (inherited and extended)

This package **reuses every NEU-897 and NEU-898 identifier verbatim** and introduces **no** competing numbering for existing elements. Reused families:

- NEU-897: findings `F1.1…F6.3`, conflicts `X1…X4`, gaps `G1.1…G6.2`, per-question sources `S1…S3`, evidence classes `[literature] (1) · [code-evidence] (2) · [dogfooding] (3) · [ai-critique] (4) · [automated-eval] (5) · [operational-log] (6) · [future-real-user] (7)`.
- NEU-898: jobs `J#`, motivations `M#`, failure modes `FM#`, principles `P#`, differentiators `D#`, exclusions `EX#`, risks `R#`, decisions `DEC#`, rejected alternatives `RA#`, candidates `CAND-#`, benchmark-state cells `BM-#`, exclusion-boundary walls `BX-#`.

It **introduces** only these NEU-899 structural identifiers (stable, prompt-ready, non-colliding with any element numbering; downstream siblings consume them as the trace backbone):

| Prefix | Element | Defined in |
| --- | --- | --- |
| `TR-<elementId>` | A trace record wrapping one material element (keyed by the element's own id — never a new number for the element) | `01_…` |
| `REL:<verb>` | A typed trace edge (e.g. `REL:evidenced-by`, `REL:mitigates`, `REL:excludes`, `REL:rejects`, `REL:covers`, `REL:provisional-on`, `REL:incomplete-on`, `REL:routed-to`, `REL:blocked-by-artifact`) | `00_…` |
| `INC-#` | An explicit incomplete-state marker for a missing downstream authoritative artifact (benchmark evidence, measurement contract, decision rule, replacement signal) | `03_…` |
| `LINK-#` | A deferred authoritative-artifact link slot, currently UNBOUND, to be bound by the named owning sub-task without its content being defined here | `03_…` |
| `OC-#` | An orphan-check / audit rule | `04_…` |

## Rules this package obeys (inherited, extended)

1. **Wrap, never rewrite.** Every element keeps its NEU-898 id, disposition, and evidence class/limitation exactly. This package adds structure and current completeness state; it changes no prior classification.
2. **Evidence discipline is inherited unchanged.** Each trace carries the NEU-897 evidence class and structural limitation of its source. **No class-1–6 claim is presented as external-user, expert, or market validation**, and no proxy is relabeled as validation (`04_…` adversarial audit).
3. **Bidirectional or it is an orphan.** Every material element must be reachable from its evidence *and* its evidence reachable from it; anything that fails either direction is reported by an orphan check (`04_…`) and cannot silently count toward approval (acceptance scenario 4).
4. **Missing downstream artifacts are reported, never invented.** Where a benchmark result, measurement contract, decision rule, or production replacement signal does not yet exist, the item is marked UNRESOLVED with an `INC-*` marker naming its owner — never populated with a locally invented value (acceptance scenario 3; constraints).
5. **No candidate disappears silently.** Every CAND-1…32 is present here as Included (with its materiality criterion) or Excluded/Routed/Non-material (with its retained rationale); the reconciliation in `04_…` proves the inventory is complete (acceptance scenario 2).

## Relation to other artifacts

- **Upstream inputs:** `../product-model/` (NEU-898) and `../` (NEU-897) — sole sources.
- **Downstream consumers:** NEU-900 (bounded benchmark suite + review protocol — binds the benchmark-evidence `INC-*`/`LINK-*` slots), the measurement-contracts task **SUB-4** (sole authority for validated measurement contracts and revision rules — binds the metric/decision-rule slots), NEU-906 (evidence/decision STATUS adjudication under frozen rules), NEU-907 (consolidated prompt-ready decision package), and the remaining siblings. Each trace record is addressable by `TR-<elementId>` and every deferred dependency by `INC-#` / `LINK-#`.
- **Not consumed here:** the C005 charter's later chapters (pedagogy, curriculum, UI, architecture, providers, telemetry). This structure stops at product-foundation altitude.
