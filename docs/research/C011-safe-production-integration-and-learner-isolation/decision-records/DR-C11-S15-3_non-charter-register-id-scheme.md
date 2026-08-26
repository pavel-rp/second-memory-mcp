# `DR-C11-S15-3` — A register entry with no charter row takes a sub-task-scoped id (`R-S15-<k>`, `A-S15-<k>`), not the next free number

**Task:** NEU-998 (SUB-15) · **Charter:** C011 (umbrella NEU-893) · **Decided:** 2026-08-25 · **Verification cutoff:** `86fb38a`, 2026-08-25
**Model:** claude-opus-5[1m]
**Discharges:** OUT-14 (`../90_outcome-register.md`) — structurally, by making SUB-15's risk and stand-in entries addressable without colliding with a concurrently authored sibling. OUT-20 owns assembly and may overrule this record.

## Decision

Where SUB-15 must write a **risk** entry that no row of the charter's § Risks table covers, or a **stand-in** entry that is not a stand-in for one of the charter's own numbered assumptions, the entry takes a **sub-task-scoped id** — `R-S15-<k>` and `A-S15-<k>` respectively — rather than the next free integer in the `R<n>` / `A-<n>` sequence.

Charter-covered entries are unaffected and keep the existing rule: `R<n>` remains the charter § Risks row position, and `A-33` / `A-34` remain SUB-1's stand-ins for charter assumptions 33 and 34, cited by SUB-15 and never restated or renumbered.

SUB-15 authors **no** `R<n>` entry at all, because no row of the charter's fifteen names OUT-14 as its owning outcome (charter assumption 48).

## Rationale

Both existing id rules are closed sets that SUB-15 falls outside of, and the registers are silent on what happens next.

`../92_risk-register.md` § "Id convention" fixes `R<n>` to the charter row position and states the purpose in the same breath: *"fifteen authors write into one register without negotiating numbers, and SUB-14 renumbers nothing."* The charter's § Risks table has exactly fifteen rows, all fifteen claimed by a named author. A sixteenth risk therefore has no charter-derived number, and the only sequence-continuing answer — `R16` — reintroduces precisely the negotiation the rule was written to abolish.

`../95_stand-in-assumption-register.md` § "Id convention" is a **mapping**, not an allocator: *"`A-33` is the stand-in for charter assumption 33."* It defines `A-<n>` for charter assumptions and says nothing about a stand-in that has no charter assumption behind it. The charter's highest assumption number is **51**, so the sequence-continuing answer would be `A-52`.

The negotiation problem is not hypothetical at this position. **SUB-2 (NEU-994) and SUB-3 (NEU-995) are being authored concurrently with this sub-task**, on disjoint chapters, and every id rule in this package is explicitly designed so that authors never have to read one another's output to pick a number — the README states it as *"`S<n>` in an id is always the sub-task number, never a position."* Two authors independently computing "the next free number" from the same charter would independently arrive at the same integer. A sub-task-scoped id cannot collide, because the sub-task number is unique by construction.

The scheme is also the one the package already uses five times over. `F-S<n>-<k>`, `OI-S<n>-<k>`, `CAP-S<n>-<k>` and `SPK-S<n>-<k>` are all sub-task-scoped; the risk and stand-in registers are the two that are not, and only because their ids were pinned to an external table that has now run out of rows. Extending the existing majority convention to the overflow case is a smaller divergence than minting a colliding integer.

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| 1 | Continue the sequence — `R16`, `A-52` | Deterministically collides with any concurrent sibling applying the same rule. SUB-2 and SUB-3 are in flight right now against the same charter, and the whole point of the package's id conventions is that authors never coordinate. It also silently implies the charter's § Risks table gained a sixteenth row, which it did not. |
| 2 | Raise no non-charter risk at all, and fold every residual exposure into the chapter's prose | Directly forbidden. SUB-15's brief requires *"for every residual exposure it states, a risk-register entry carrying a severity, a mitigation, a named owner and an escalation route"*, and § Constraints requires *"a stated residual exposure carried in the risk register, never an assumed absence."* Prose is not a register entry. |
| 3 | Route every non-charter stand-in to the open-items register as `OI-S15-<k>` and mint no `A-` entry | Fails the registers' own admission rule (`../93_open-items-and-provisional-register.md`): an open item records an unanswered question; a stand-in records an assumption the design provisionally rests on, **with a tolerance envelope and an invalidating outcome**. A capacity-sizing assumption has both, so filing it as an open item would strip exactly the two fields that make it useful and would misfile it. Used for the genuine questions, not for the assumptions. |
| 4 | Leave the ids blank and let SUB-14 assign them at assembly | Authoring at assembly, which charter assumption 46 forbids outright: *"a register that would otherwise be empty is a routed gap against its named author, never content invented at assembly."* An unnumbered entry is also uncitable, and SUB-7 and SUB-9 need to cite these by id. |
| 5 | Reserve a per-sub-task numeric block (`A-1500`+ for SUB-15) | Collision-free, but unreadable and unmotivated — it neither continues the charter's numbering nor matches any convention in the package, and a reader meeting `A-1503` has no way to infer where it came from. |

## Consequences

1. SUB-15's register entries are collision-free against SUB-2 and SUB-3 **by construction**, with no coordination and no reading of a sibling's output.
2. The risk and stand-in registers now carry **two id shapes each** — the charter-pinned `R<n>` / `A-<n>` and the overflow `R-S15-<k>` / `A-S15-<k>`. This is a real cost: a reader must learn that the two shapes mean different things (charter-covered versus sub-task-raised). The chapter and both register sections state the distinction where the entries land, rather than leaving it to this record.
3. **SUB-14 (NEU-1007) is the adjudicator and may overrule this.** The package README is explicit that SUB-14 owns house-style assembly and that *"where SUB-14 diverges, SUB-14 is right."* If SUB-14 renumbers these entries at assembly, the ids in this chapter, in `../traceability/S15_operational-objectives.md` and in any downstream citation move together; this record is the single place that explains why they existed in this shape.
4. **SUB-17 (NEU-1008) inherits a cross-register consistency check that now ranges over two id shapes** in two of the eight registers. The check is unchanged in kind — an id appears in exactly one register and carries the same owner and status wherever cited — but its id-matching must not assume a bare integer.
5. If SUB-2 or SUB-3 independently mint `R16` or `A-52`, that is not a conflict with these entries; it is a conflict between the two of them, and SUB-14 settles it. This record's scheme takes no number either could want.
6. SUB-15 writes **no rows into `../97_package-completeness-gate.md`**. `G-<n>` is a bare global sequence with the identical overflow problem, the register states its owner is SUB-17 rather than each sub-task, and SUB-1's rows are the seed author's exception rather than a precedent. Extending this record's scheme to a third register to solve a problem nobody asked SUB-15 to solve would be scope this sub-task does not have; the gate rows are left to their named owner.

## Evidence

| Claim | Source |
| --- | --- |
| `R<n>` is the charter § Risks row position, adopted so fifteen authors need not negotiate numbers | `../92_risk-register.md` § "Id convention — why the numbering starts at `R8`" |
| The charter's § Risks table has exactly fifteen rows, all fifteen with a named author | `../92_risk-register.md`, the fifteen-row author table; charter assumption 48 |
| No § Risks row names OUT-14 as its owning outcome; row 4 names OUT-4 and is SUB-7's | `../92_risk-register.md` (`R4` … OUT-4 … SUB-7); charter assumption 48 |
| `A-<n>` maps onto the charter's own assumption numbers; `A-33` is the stand-in for charter assumption 33 | `../95_stand-in-assumption-register.md` § "Id convention"; `../README.md` § "Id conventions" |
| The charter's highest assumption number is 51 | Charter C011 § Assumptions, rows 50 and 51 are the last; `_local/` charter, read 2026-08-25 |
| `F-S<n>-<k>`, `OI-S<n>-<k>`, `CAP-S<n>-<k>` and `SPK-S<n>-<k>` are all sub-task-scoped | `../README.md` § "The eight-register band" |
| A stand-in is distinguished from an open item by carrying a tolerance envelope and an invalidating outcome | `../93_open-items-and-provisional-register.md` § "An open item and a stand-in are not the same record" |
| SUB-14 owns house-style assembly and supersedes the seed conventions | `../README.md` § "What this file is" |
| SUB-17 fills the completeness gate; SUB-1 recorded only its own rows | `../97_package-completeness-gate.md` front matter |
| Authoring at assembly is forbidden | Charter assumption 46 |

## Revision trigger

- **SUB-14 (NEU-1007) publishes its house-style assembly** and adopts, renames or renumbers the overflow id shape — SUB-14's decision supersedes this one outright.
- **A sixteenth row is added to the charter's § Risks table**, which would give a charter-derived number to a risk that currently has none and would shrink this record's scope to the stand-in register alone.
- **SUB-2 or SUB-3 publishes a colliding `R16` / `A-52`**, which would confirm the collision hazard this record was written against and is worth recording as evidence either way.
- **SUB-17's cross-register consistency check** finds an id-shape ambiguity this record did not anticipate.
