# C011 Safe Production Integration and Learner Isolation — Package Index

**Task:** NEU-993 (SUB-1) · **Charter:** C011 (umbrella NEU-893) · **Seeded:** 2026-08-25 · **Verification cutoff:** `546ee90`, 2026-08-25 · **Status:** seed — the package root, its conventions and SUB-1's own content only
**Model:** claude-opus-5[1m]

The package path is `docs/research/C011-safe-production-integration-and-learner-isolation/`.

## What this file is

A **seed index**, written by the package's first sub-task because a package root with no index is
unnavigable for the fifteen sub-tasks that extend it. It establishes the conventions below and
indexes what exists today.

**SUB-14 (NEU-1007) owns the package's house-style assembly and supersedes this file.** Nothing here
binds SUB-14: the numbering, the reading order and the reservation tables are a starting position
chosen to be collision-free, not an adjudication. Where SUB-14 diverges, SUB-14 is right.

## What this package is

The C011 decision package: how the product integrates safely with the existing production
deployment, and how learner data is isolated. Sixteen sub-tasks, twenty outcomes (OUT-1 … OUT-20).

## What this package is not

It is not an implementation. No file under `src/` or `drizzle/` is changed by any sub-task in this
package, and nothing in it reaches production.

## ▶ Start here (reading order)

| Step | File | What it gives you | Owner |
| --- | --- | --- | --- |
| 1 | `README.md` | This index and the package conventions | SUB-1 (seed) → SUB-14 |
| 2 | `01_production-evidence-and-the-access-audit.md` | What is actually known about the production deployment, and what is not | SUB-1 |
| 3 | `02_identity-the-learner-key-and-principal-kind.md` | The settled identity rule: which claim becomes the persisted learner key, how principal kind is determined, and whether provenance is carried | SUB-2 |
| 4 | `15_operational-objectives-for-the-real-platform.md` | The numeric capacity, availability, latency, failure and recovery objectives, set against the platform that exists | SUB-15 |
| 5 | `96_spike-register.md` | Every uncertain-and-material production claim, closed or routed | SUB-1, SUB-2, SUB-15 |
| 6 | `93_open-items-and-provisional-register.md` | The claims that could not be closed, each with a named owner | SUB-1, SUB-2, SUB-15 |
| 7 | `95_stand-in-assumption-register.md` | The platform assumptions carried forward, with owners and re-validation triggers | SUB-1, SUB-2, SUB-15 |
| — | `90_outcome-register.md` · `91_findings-register.md` · `92_risk-register.md` · `94_caps-and-incomplete-scope.md` · `97_package-completeness-gate.md` | The rest of the reserved band | per-entry authors → SUB-14 |
| — | `decision-records/` | The decisions, each with rejected alternatives | per-record authors |
| — | `traceability/` | Outcome-to-evidence matrices | per-sub-task authors |

## Numbering convention

| Range | Holds |
| --- | --- |
| `00`–`89` | Numbered chapters. **The chapter number is the sub-task number**: SUB-1 writes `01_…`, SUB-2 writes `02_…`, SUB-17 writes `17_…`. Ids are permanent and never renumbered, so a chapter number is *not* a position in the dependency order. `00_` is reserved for SUB-14's method-and-provenance chapter. |
| `90`–`99` | The reserved register band — **eight** registers, listed below. |

**The eight-register band**, in the order the charter enumerates them:

| File | Register | Id family |
| --- | --- | --- |
| `90_outcome-register.md` | Outcomes | `OUT-<n>` |
| `91_findings-register.md` | Findings | `F-S<n>-<k>` |
| `92_risk-register.md` | Risks | `R<n>` |
| `93_open-items-and-provisional-register.md` | Open items / provisional | `OI-S<n>-<k>` |
| `94_caps-and-incomplete-scope.md` | Caps / incomplete scope | `CAP-S<n>-<k>` |
| `95_stand-in-assumption-register.md` | Stand-in assumptions | `A-<n>` |
| `96_spike-register.md` | Spikes | `SPK-S<n>-<k>` |
| `97_package-completeness-gate.md` | Package-completeness gate | `G-<n>` |

The band differs from C010's, where the outcome and findings registers sat at `01_`/`02_` and the
risk register was a section of chapter 17. C011 carries all eight in the band. The choice of
ordering, and the alternative that was rejected, are recorded in
`decision-records/DR-C11-S1-3_package-house-style.md`.

## Id conventions

- `S<n>` in an id is always the **sub-task number**, never a position. `SPK-S1-2` is SUB-1's second
  spike.
- **`A-<n>` continues the charter's own assumption numbering.** A stand-in for charter assumption 33
  is `A-33`. It does not restart at 1, and it does not collide with C010's `A-25`…`A-29`, which live
  in C010's register.
- **`R<n>` is the row's position in the charter's § Risks table**, so fifteen authors can write into
  one register without negotiating numbers and without SUB-14 renumbering anything. SUB-1 authors
  `R8`, `R13` and `R14`.
- A C010 sub-task is always cited qualified — `SUB-10 of C010 (NEU-984)` — never as a bare `SUB-n`.
  A bare `SUB-n` is always this charter's own.

## Shared-register append convention

Each sub-task appends its own `### SUB-<n>` section. No sub-task reflows, renumbers, or rewrites
another sub-task's entries. On a merge conflict in one of these files, keep **both** sides.

## Citation rules

Enforced for the corpus by `scripts/check-citation-paths.ts`; every relative citation resolves from
**the directory of the file that contains it**.

- A package-root file cites a package-root sibling by **bare filename** — `96_spike-register.md`.
- A file in `decision-records/` or `traceability/` cites a package-root sibling with **one** `../`,
  and a file in another package with **two**.
- A package-root file cites another package with **one** `../` —
  `../C010-system-and-repository-architecture/README.md`.
- Source and non-research paths (`src/…`, `drizzle/…`, `docs/GLOSSARY.md`) are written **bare from
  any depth** and are an excluded class, not a gated one.

**C011 is not yet in the checker's gated list** — `scripts/check-citation-paths.ts` gates only
C010 today. Adding C011 is package-closure work, not SUB-1's; it is registered as `CAP-S1-2` in
`94_caps-and-incomplete-scope.md`, with SUB-14 named as its owner, so it is not lost.

## What this package hands on

`A-28` in C010's `95`-equivalent register — `../C010-system-and-repository-architecture/93_stand-in-assumption-register.md`
— is the stand-in for **NEU-893**, this very charter, and its re-validation trigger is *"NEU-893
lands — its package is published under `docs/research/`."* Publishing this package fires that
trigger. Stating what the C010-side re-check is handed is **SUB-14's** closure obligation, not
SUB-1's; it is noted here so the seam is visible from the package root from day one.

## Verification note — `qa-execution:engine` is unconfigured

The capability registry is `git, linear`. No capability owns the `qa-execution` surface, so the
autonomous QA phase is a genuine no-op under Core Article 8 (*core never requires a capability*)
rather than a skipped gate. No QA pass is claimed for any sub-task in this package on that basis.

## Provenance

Every codebase claim in this package cites a real path and a stated cutoff, on a branch containing
C010's package. SUB-1's cutoff is `546ee90` (2026-08-25). The settled tool-surface figure for this
package is **46 registered / 43 gated / 3 exempt**.
