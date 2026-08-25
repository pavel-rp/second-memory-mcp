# `DR-C11-S1-3` — The eight-register band is numbered in the charter's own enumeration order, and every shared id family is fixed so fifteen authors never negotiate a number

**Task:** NEU-993 (SUB-1) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-25 · **Verification cutoff:** `546ee90`, 2026-08-25
**Model:** claude-opus-5[1m]
**Discharges:** OUT-18 (`../90_outcome-register.md`) structurally — SUB-1 must create the package root and the band its own entries live in. **OUT-20 owns the package's assembly**, and SUB-14 (NEU-1007) supersedes anything here it needs to.

## Decision

SUB-1, as the package's first sub-task, fixes four conventions:

1. **The `90`–`99` band is numbered in the charter's own enumeration order.**

   | File | Register |
   | --- | --- |
   | `../90_outcome-register.md` | Outcomes |
   | `../91_findings-register.md` | Findings |
   | `../92_risk-register.md` | Risks |
   | `../93_open-items-and-provisional-register.md` | Open items / provisional |
   | `../94_caps-and-incomplete-scope.md` | Caps / incomplete scope |
   | `../95_stand-in-assumption-register.md` | Stand-in assumptions |
   | `../96_spike-register.md` | Spikes |
   | `../97_package-completeness-gate.md` | Package-completeness gate |

2. **The chapter number is the sub-task number.** SUB-1 writes `01_…`, SUB-2 writes `02_…`, SUB-17
   writes `17_…`. `00_` is reserved for SUB-14's method-and-provenance chapter.

3. **Shared id families are fixed so no two authors can collide:**
   - `S<n>` in any id is always the **sub-task number**, never a dependency-order position.
   - **`A-<n>` continues the charter's own assumption numbering** — the stand-in for charter
     assumption 33 is `A-33`, not `A-1`.
   - **`R<n>` is the row's position in the charter's § Risks table** — SUB-1 authors `R8`, `R13`,
     `R14`.

4. **Every register carries the shared-register append convention verbatim:** each sub-task appends
   its own `### SUB-<n>` section; no sub-task reflows, renumbers or rewrites another's entries; on a
   merge conflict, keep **both** sides.

## Rationale

Fifteen sub-tasks write into eight shared files, most of them in parallel and none able to see the
others' work at authoring time. Every convention above exists to remove a decision that would
otherwise have to be made fifteen times, differently.

**On the band order (1).** C010's band is not a template that can be copied: its outcome and findings
registers sit at `01_`/`02_` and its risk register is a *section* of chapter 17. C011 carries all
eight in the band, so the order had to be chosen rather than inherited. The charter enumerates them
in a fixed order twice — *"an outcome register, a findings register, a risk register, an open-items
register, a caps register, a stand-in register, the spike register and the package-completeness
gate"* — and adopting that order means the numbering is **derived from the authoritative text** rather
than from one sub-task's preference. A reader who knows the charter can predict the filenames.

**On chapter numbers (2).** Sub-task ids are permanent and are never renumbered, so the dependency
order and the id sequence diverge — SUB-15 and SUB-16 occupy positions 6 and 7. Numbering chapters by
*position* would therefore produce a scheme that changes if the order is ever revised, and two
sub-tasks authoring in parallel could compute different positions. Numbering by **id** is stable
under revision and independently computable, at the cost of a package whose chapter numbers do not
read in dependency order — which is the right trade, because a reading order is what the README's
table is for.

**On `R<n>` (3).** This is the sharpest instance of the collision problem. The charter's § Risks table
has fifteen rows with fifteen different authoring sub-tasks (SUB-1 ×3, SUB-3 ×2, SUB-5, SUB-6, SUB-7
×2, SUB-9, SUB-11, SUB-17 ×4), and SUB-14 aggregates them **authoring none**. Any scheme where an
author picks the next free number requires seeing the other fourteen entries first, which no author
can do. Binding the id to the charter row makes every number computable from a document all fifteen
already read, and lets SUB-14 detect a missing entry **by number** — a gap becomes "`R9` never
arrived, its author is SUB-6" rather than an anonymous shortfall.

**On `A-<n>` (3).** Restarting stand-in numbering at 1 would produce a `A-1` in C011 alongside C010's
`A-28`, with nothing in either id saying which package it belongs to. Continuing the charter's
assumption numbering means the id points straight back at the assumption it stands in for.

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | Preserve C010's band numbering for the five registers it has (`90` open items, `91` caps, `92` spike, `93` stand-in, `94` gate) and append outcome/findings/risk at `95`–`97`. | Genuinely tempting — it preserves muscle memory for anyone who has read C010. But it puts the outcome register, the most-read file in the band, at `95`, and its rationale is "C010 happened to do it that way" rather than anything in C011's own charter. Recorded as the closest alternative. |
| 2 | Mirror C010 exactly: outcome at `01_`, findings at `02_`, risk inside a closure chapter. | Contradicts C011's charter, which requires all **eight** registers in the reserved `90`–`99` band and states the count moved from seven to eight when the risk register was added. |
| 3 | Number chapters by dependency-order position. | Unstable under revision, and not independently computable by two sub-tasks authoring in parallel. |
| 4 | Let each author pick the next free `R<n>`. | Requires seeing the other fourteen entries. Guarantees collisions under parallel authoring and makes a missing entry undetectable. |
| 5 | Defer every convention to SUB-14 at position 15. | Fifteen sub-tasks would author against no convention and SUB-14 would renumber all of it — the largest possible churn, landing at the point of least remaining time. |
| 6 | Have SUB-1 write no README, since SUB-14 owns assembly. | A package root with no index is unnavigable for the fifteen sub-tasks that extend it. The README is written as an explicitly labelled **seed** instead. |

## Consequences

1. The package root carries eight band files from its first commit, six of them holding SUB-1 content
   and two (`../97_package-completeness-gate.md` partially, and the outcome register's other nineteen
   rows) seeded for later authors.
2. Downstream sub-tasks can compute their own chapter number, their `S<n>` id prefix and their `R<n>`
   rows **from the charter alone**, without reading another sub-task's output.
3. **SUB-14 may renumber any of this**, and the README says so. If it does, the cost is a
   mechanical rename plus a citation-path re-check — bounded, and cheaper than fifteen sub-tasks
   authoring against no convention.
4. `../97_package-completeness-gate.md` exists but is mostly empty, because it is **SUB-17's** to fill
   at position 16. Creating the file without owning its content is deliberate: the band is complete
   from day one, and the file states its own owner.
5. The band diverges from C010's numbering, so a reader moving between the two packages cannot assume
   `92_` means the same thing in both. The README's band table exists to absorb that.

## Evidence

| Claim | Source |
| --- | --- |
| The charter requires all eight registers in the reserved `90`–`99` band, and enumerates them in the adopted order. | C011 charter, OUT-20's outcome cell and assumption 43 (`_local/`, gitignored — quoted in `../README.md` and here rather than cited as a resolvable path) |
| The count moved from seven to eight when the risk register was added. | C011 charter, assumption 43 |
| Each § Risks row names an owning outcome, and each is authored by the sub-task covering it. | C011 charter, assumption 48; the fifteen-row mapping is reproduced in `../92_risk-register.md` |
| Risk-register entries are authored by the raiser and aggregated, never authored, by SUB-14. | C011 charter, assumption 46 |
| Success measures are authored per outcome by the producing sub-task. | C011 charter, assumption 47 |
| C010's band places open items at `90_`, caps at `91_`, spike at `92_`, stand-in at `93_`, gate at `94_`, with outcome and findings at `01_`/`02_`. | `../../C010-system-and-repository-architecture/README.md` |
| Sub-task ids are permanent and diverge from dependency-order position. | C011 charter's decomposition, § Dependency order |

## Revision trigger

1. **SUB-14 (NEU-1007) assembles the package** and adopts, renumbers or supersedes any convention
   here. That is the expected path, not an exception.
2. **A ninth register is added** to the band, which would break the `90`–`97` allocation.
3. **The charter's § Risks table gains or loses a row**, which would break `R<n>` as a stable id and
   require an explicit remapping rather than a silent renumber.
4. **A sub-task id is ever reused or renumbered**, which would break both the chapter-number rule and
   the `S<n>` prefix.
5. **The package is registered in the citation-path CI gate** (`CAP-S1-2`), at which point any
   numbering change also requires a citation re-check across every file.
