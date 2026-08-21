# Traceability

**Opened by:** NEU-971 (SUB-1) · **Charter:** C010 (umbrella NEU-895) · **Opened:** 2026-08-21
**Model:** claude-opus-5[1m]
**Written by:** each sub-task, for its own coverage. **The audit rows are owned by `NEU-985 (SUB-11)`.**

**This folder is empty of registers.** SUB-1 declared the shape and wrote none — it discharged no outcome's content.

---

## What this set is for

The traceability set answers one question, mechanically: **for each of `OUT-1` … `OUT-12`, what discharges it, and where is the evidence?**

It is the surface `NEU-986 (SUB-12)`'s completeness gate reads. An outcome with no row is an outcome nobody covered; a row with no evidence is a claim, not coverage.

## Every row resolves into `docs/research/`, never into `_local/`

**This is the set's binding constraint, and it is why `../01_outcome-register.md` exists.**

`_local/` is gitignored (`.gitignore:100`) and `docs/wf-plans/*` is gitignored (`.gitignore:78`) with two tracked exceptions at `:79`–`:80` that do not include the C005 program charter. **A traceability row pointing into either tree is a dangling pointer for every reader but its author** — and a traceability set whose rows dangle is worse than none, because it reads as though the outcomes were checked.

So:

- An outcome is cited by **this package's own id** — `OUT-4` — resolving into `../01_outcome-register.md`.
- Evidence is cited as a path **inside this package**, or a real `src/` path with a line, or an upstream package under `docs/research/` with its version or compilation date.
- **Zero rows resolve into `_local/` or `docs/wf-plans/`.** `NEU-985 (SUB-11)` audits this and reports the count.
- Program-level outcomes are written owner-attached (`C005's OUT-9`, `NEU-850's OUT-2`), so they are never mistaken for a row in `../01_outcome-register.md`. See `../00_method-and-provenance.md` §2.5.

## Required columns (stable across every register in this folder)

| Column | What it records |
| --- | --- |
| **Outcome** | `OUT-<n>`, resolving into `../01_outcome-register.md`. |
| **Claim** | The specific thing asserted to discharge it — not the topic, the assertion. |
| **Discharged by** | The document, decision record (`DR-C10-S<n>-<k>`) or register entry that carries it. |
| **Evidence class** | Which proxy signal or citation type backs it, per `../00_method-and-provenance.md` §1.1. **A green type-check or lint line is not evidence about this package's content.** |
| **Status** | `confirmed`, `[unconfirmed]`, or `consumed` — the three labels in `../00_method-and-provenance.md` §1.2. |
| **Residual** | What the row does **not** establish, cited by id where it is an open item (`OI-S<n>-<k>`), a cap (`CAP-S<n>-<k>`) or a stand-in (`A-<n>`). |

## Naming and allocation

**`S<n>_<slug>.md`** — where `<n>` is the sub-task number. SUB-4 writes `S4_isolation-invariant-coverage.md`; SUB-11 writes `S11_outcome-coverage-audit.md`. Each sub-task allocates only inside its own namespace and **never renumbers or rewrites another's file**, for the same reason the shared registers carry that rule.

A sub-task documents **its own** coverage. **`NEU-985 (SUB-11)` owns the audit rows** — the cross-cutting check that every outcome has coverage, that every row's evidence resolves, and that the counts hold. SUB-11's audit is a separate file, not an edit to anyone else's.
