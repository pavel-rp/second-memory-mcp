# DR-S05 — Extending NEU-887's Registers

**Decision:** `D-S5` · **Task:** NEU-933 · **Status:** settled (see `../adjudication/01_schema-decision-ledger.md` — this record does not set status) · **Compiled:** 2026-07-16

---

## The decision

> **NEU-887's evidence taxonomy, materiality rule, status values, relation vocabulary, orphan-check discipline, and incomplete-marker discipline are extended to the DP map BY REFERENCE. Nothing is restated, redefined, or re-derived. Only `-S`-namespaced ids are added.**

Full statement: `../04_register-extension.md`.

## Rationale

**The spec's bar is "extends — does not re-derive", and the register-completeness audit checks exactly that.** So the decision is mostly about **restraint**, and the deliverable is a **boundary an auditor can check** rather than new machinery.

**The pattern is inherited, not invented.** NEU-933 is the **third** package to extend NEU-887: NEU-888 established the pattern, NEU-932 followed it, and inventing a fourth style would itself be a re-derivation — of the *extension method*. The pattern: reference the parent by file path; namespace new ids; keep the parent's finding ids verbatim; declare rather than disguise any decision resting on reasoning.

**Why re-derivation is genuinely tempting here, and genuinely wrong.** The parent's machinery was built for **product** evidence, and this package's subject is a **graph**. The fit is imperfect and that imperfection invites a fork. But a fork would break the one property the machinery exists for: **an audit's ability to compare classes, statuses, and traces across all four C005 packages.** Machinery that means something different in each package is not machinery.

## The two near-misses — considered and declined

Recorded because *"we didn't rebuild it"* is easier to assert than to prove, and the audit deserves the close calls.

**A DP-specific evidence class** — e.g. "graph-structural": evidence that a prerequisite edge is real. Plausible, because the seven classes were built for product evidence and a prerequisite claim is a different kind of thing. **Declined:** the parent's taxonomy already classifies the **source** (class 1 `[literature]` for *"CP-Algorithms presents X as a prerequisite of Y"*; class 2 `[code-evidence]`), and **what is new here is the claim, not the evidence.** Adding a class would fork the taxonomy for the third time in the program and destroy cross-package comparison. `evidence_class` holds the parent's number, unchanged.

**A DP-specific materiality rule.** Tempting because *"is this node material?"* feels like a map question. **Declined:** the parent's rule is about **what a product decision must rest on**, and the map makes **no product decision**. The genuine map-specific question — *is this technique covered?* — is `coverage.status`, which is **OUT-7's**, is not a materiality question, and is not NEU-933's.

## What is new, and why it had to be

Every new id is namespaced `-S`, colliding with nothing in NEU-887 (`INC-1…5`, `OC-*`, `R1`, `X1`), NEU-888 (`INC-I#`), or NEU-932 (`D-F*`, `INC-D#`, `X-D#`, `CAP-#`, `SOC-#`).

| Namespace | What | Why it could not be an existing id |
| --- | --- | --- |
| `D-S1`…`D-S5`, `D-S1a` | NEU-933's decisions | New decisions. `D-S1` **resolves** NEU-932's `D-F3a`. |
| `INC-S1`…`INC-S3` | Incomplete-state markers | New missing artifacts, each with an owner. |
| `X-S1` | The `D-S4` refinement, carried | NEU-932 did not anticipate it. |
| `SOC-1-S2`…`SOC-9-S2` | Orphan/completeness checks | The parent's check **logic**, namespaced for this register. |
| `CAP-S1`…`CAP-S6` | This package's caps | New caps. |
| `AR-1` | The anchor-request route | **No parent equivalent — nothing upstream had a boundary register.** |
| `FC-1`…`FC-12`, `V-1`…`V-18`, `DR-1`…`DR-8`, `RE-1`…`RE-12` | Self-checks over new artifacts | New verification evidence. |

**Nothing else is new.** No taxonomy class, no relation type, no status value, no materiality clause, no marker discipline.

## The extension's most important property: SOC-7-S2

**`../traceability/01_schema-evidence-register.md`'s `SOC-7-S2` is the row a reviewer should read first**, and it exists because of a specific temptation this package faced.

**Most of NEU-933's decisions are design decisions, not empirical findings.** A schema is *argued* from constraints — five mappers must run in parallel; the floor must be reachable at map time; the charter mandates a knowledge/skill distinction and eight skill types — **not discovered in the literature**. The register **says so** rather than manufacturing `F-S-*` rows to make `D-S1`, `D-S4`, and `D-S5` look evidenced.

**Manufacturing findings for design decisions would launder a choice as a discovery** — the specific dishonesty `SOC-7` exists to prevent. NEU-932's `SOC-7` made exactly this disclosure for `D-F3`/`D-F4`. **The disclosure is inherited, not worked around.** It is also why this package has five findings rather than fifty: no source was fetched, because none was needed, and padding the register would misrepresent what the package is.

## Rejected alternatives

| Alternative | Why it was plausible | Why rejected |
| --- | --- | --- |
| **A DP-specific evidence class** | The seven classes were built for product evidence; a prerequisite claim is a different kind of thing. | Forks the taxonomy a third time and destroys cross-package comparison. **What is new is the claim, not the evidence** — and the parent already classifies sources correctly. |
| **A DP-specific materiality rule** | "Is this node material?" feels like a map question. | The map makes no product decision. The real question is `coverage.status` — **OUT-7's**, not materiality, not NEU-933's. |
| **Manufacturing `F-S-*` rows for the design decisions** | Every decision would trace to a finding; `SOC-5` would pass cleanly with no awkward disclosure. | **Rejected as laundering.** It would make a design choice look like a discovery and would defeat `SOC-7`'s purpose. The honest `SOC-5` result — *"`D-S1`, `D-S4`, `D-S5` are reachable from no or partial evidence, see `SOC-7-S2`"* — is the correct output. |
| **A fourth extension style** (new register shape for a graph subject) | The parent's registers were built for prose findings; a graph is different. | Inventing a new style **is** re-deriving the extension method. NEU-888 and NEU-932 already solved this; the third extension follows the pattern. |

## Status and revision trigger

**Status:** settled. Set only in the ledger.

**Revision trigger:** an audit finds NEU-887 machinery **re-derived rather than referenced**.

**Self-check:** `../04_register-extension.md` §5, `RE-1`…`RE-12`, all pass.

## Evidence and its honest class

**Declared at `SOC-7-S2`: `D-S5` is a DESIGN DECISION.** Its correctness is a matter of **argument and inspection** — the `RE-1`…`RE-12` self-check is a structural audit of this package's own files, not evidence about the world. That is what a re-derivation check *is*, and no `F-S-*` row claims otherwise.
