# C011 decision records

**Charter:** C011 (umbrella NEU-893) · **Seeded:** 2026-08-25 by SUB-1 (NEU-993)
**Model:** claude-opus-5[1m]

One file per decision. A decision record exists so a later reader can see **what was decided, why,
and what was rejected** — not merely what the package ended up saying.

## Naming

`DR-C11-S<n>-<k>_<slug>.md`, where `S<n>` is the **authoring sub-task's number** and `<k>` counts
that sub-task's records from 1. Amendment records filed outside normal sub-task numbering use
`DR-C11-N<tracker>-<k>_<slug>.md`, following C010's precedent.

C010's records keep their own source and are always written `DR-C10-…`, never renamed.

## Required sections

Every record carries these six, in this order:

| # | Section | What it holds |
| --- | --- | --- |
| 1 | `## Decision` | What was decided, stated so it could have gone the other way. |
| 2 | `## Rationale` | Why. |
| 3 | `## Rejected alternatives` | A table: `\| # \| Alternative \| Why it lost \|`. Never empty — a decision with no rejected alternative was not a decision. |
| 4 | `## Consequences` | A numbered list of what follows, including what becomes harder. |
| 5 | `## Evidence` | A table: `\| Claim \| Source \|`. Every source a real path, or an upstream package with its date. |
| 6 | `## Revision trigger` | The observable events that would reopen the decision. |

## Front matter

```
# `DR-C11-S<n>-<k>` — <title, stated as the decision>

**Task:** NEU-<id> (SUB-<n>) · **Charter:** C011 (umbrella NEU-893) · **Decided:** <date> · **Verification cutoff:** `<sha>`, <date>
**Model:** <model identifier>
**Discharges:** OUT-<n> (`../90_outcome-register.md`) — <clause>
```

## Citation rule inside this folder

A file here cites a **package-root sibling with one `../`** (`../96_spike-register.md`) and a file in
**another package with two** (`../../C010-system-and-repository-architecture/README.md`). Source and
non-research paths (`src/…`, `drizzle/…`) are written **bare from any depth**.

## Index

| Record | Author | Discharges |
| --- | --- | --- |
| `DR-C11-S1-1_principal-shape-acquisition-methods.md` | SUB-1 (NEU-993) | OUT-18 |
| `DR-C11-S1-2_evidence-routing-and-expiry-discipline.md` | SUB-1 (NEU-993) | OUT-18 |
| `DR-C11-S1-3_package-house-style.md` | SUB-1 (NEU-993) | OUT-18 (structurally; OUT-20 owns assembly) |
| `DR-C11-S3-1_learner-data-classification-scheme.md` | SUB-3 (NEU-995) | OUT-9 |
| `DR-C11-S3-2_conditional-log-table-classification.md` | SUB-3 (NEU-995) | OUT-9 |
| `DR-C11-S3-3_package-own-copies-and-the-derivation-test.md` | SUB-3 (NEU-995) | OUT-9 |
