# `DR-C10-S4-1` — The component-individuation rule

**Task:** NEU-974 (SUB-4) · **Charter:** C010 (umbrella NEU-895) · **Decided:** 2026-08-21
**Model:** claude-opus-5[1m]
**Discharges:** `OUT-1` · **Applied in:** `../05_system-context-and-responsibility-boundaries.md` §2, §3

---

## Decision

**A thing is a component in this model if and only if it holds one responsibility that no other
component holds, *and* it owns at least one boundary — a boundary it must still handle correctly when
the other side misbehaves, fails, or is delayed.** Anything that satisfies only the first half is a
module, not a component, and does not appear in the inventory.

Two corollaries are part of the decision, not consequences of it:

1. **Where `src/` already carries a cut along responsibility lines, the model follows it rather than
   re-cutting it.** `transport` → `server` → `orchestration` → `domain`, with `ports/` and `adapters/`,
   is the mapping surface.
2. **Where one `src/` directory contains two halves that own *different* boundaries, the model splits
   it.** This fires exactly once at this cutoff: `src/transport/` becomes `CMP-S4-4` (the HTTP edge) and
   `CMP-S4-5` (the STDIO edge), because `src/transport/main.ts:46` mounts a protected path and the `else`
   branch at `:55`–`:59` mounts a bare one.

## Rationale

The criteria and their weights, fixed **before** any option was scored:

| # | Criterion | Weight |
| --- | --- | --- |
| C1 | A downstream implementation charter must be able to map its slice onto exactly one component without asking a question. | **decisive** |
| C2 | No component may appear that no requirement demands — `OUT-1` states this as an acceptance condition, not a preference. | high |
| C3 | The cut must stop at the altitude where a boundary, an authority or a compatibility contract is at stake, and not below it. | high |
| C4 | The cut must survive the twelve sub-tasks and the several components that do not exist yet. | medium |
| C5 | Brevity — a model nobody finishes reading is not consulted. | low |

The two-part rule scores best on C1 because both halves are checkable by a reader holding only the
component's own description: "what is it responsible for" and "what must it get right when its
counterpart is wrong". The boundary half is what does the real work — it is precisely the test that
excludes the dozens of internal modules that have a distinct job but no independent failure mode, and it
is what makes C3 mechanical rather than a matter of taste.

C4 is why the rule is stated in terms of boundaries rather than in terms of deployment or storage. Four
of the twenty components exist only because a stand-in predicts them — `CMP-S4-1` and `CMP-S4-3` under
**`A-27`** (the rich authenticated learner-facing web surface), `CMP-S4-2` under **`A-29`** (the bounded,
expiring, revocable handoff envelope), and `CMP-S4-20` under `SC-S3-41`. A rule keyed on anything that
must already be built would have been unable to place them at all; a rule keyed on boundaries places them
and labels them `[unconfirmed]` in the same row.

## Rejected alternatives

| Alternative | The specific consequence that decided against it |
| --- | --- |
| **One component per `src/` top-level directory.** | `src/transport/` becomes a single component, and the fact that HTTP and STDIO mount different protections — the single most load-bearing boundary fact in the model — has nowhere to be stated. Fails C1 and C3. |
| **One component per deployable process.** | Nothing is deployable yet: the deployment shape is `SUB-10 (NEU-984)`'s. The whole inventory would be provisional on an unmade decision, and this document would be leaking into SUB-10's scope to make it. Fails C4 and the charter's scope wall. |
| **One component per state category.** | Forty-five components, most with no distinct responsibility, and a direct collision with `SUB-13 (NEU-977)`'s authority matrix — which assigns an authority *to* components and cannot do so if the components *are* the categories. Fails C2, C3 and C5. |
| **One component per MCP tool.** | Forty-six components at this cutoff, all sharing the same boundaries and the same responsibility shape (parse, delegate, format). It multiplies rows without adding a single actionable distinction. Fails C3 and C5. |
| **A fresh domain-driven decomposition that ignores `src/`.** | Produces a model no charter can map onto the code it actually edits, so every downstream slice needs a translation step — which this package would then own forever. Fails C1 decisively. |
| **Responsibility alone, dropping the boundary test.** | `src/domain/algorithms/` and `src/domain/services/` become components despite owning no boundary and having no failure mode independent of their caller. The inventory inflates and C3's altitude rule becomes unenforceable. Fails C2 and C5. |
| **Boundary alone, dropping the responsibility test.** | Two components could own the same boundary from the same side, which is exactly the ambiguity — two slices each believing they own a hop — that `OUT-1` exists to remove. Fails C1. |

## Consequences

- **The programme is committed to the hexagonal cut as its mapping surface.** A charter that reshapes
  `src/`'s layering owes an update to `../05_…` §3.2; a charter that merely adds a module inside an
  existing layer owes nothing.
- **A deployment-shaped component model is foreclosed.** `SUB-10 (NEU-984)` selects a deployment shape
  *for* these components; it does not get to select a different component set as a side effect.
- **Adding a component is deliberately more expensive than adding a module.** A new component owes a
  demanding requirement in `../05_…` §3.2 and at least one row in §4.2 — and §4.3's completeness argument
  is structural, so introducing a flow between two components not already paired creates an unclassified
  boundary that someone must classify.
- **Removing a stand-in removes its component.** If `A-27` or `A-29` is invalidated, `CMP-S4-1`,
  `CMP-S4-3` or `CMP-S4-2` leaves the inventory with it, and the boundaries they own leave too. This is
  intended: it is why they carry the assumption id in the row rather than in a footnote.
- **Migration path:** none is implied. This decision documents an existing cut; it does not ask for one
  line of code to move.

## Evidence

- `src/transport/main.ts:46` (HTTP branch) and `:55`–`:59` (bare STDIO branch) — the one split the rule
  forces at this cutoff.
- `src/orchestration/` (14 modules), `src/ports/` (13 port interfaces), `src/adapters/`
  (`drizzle`, `langchain`), `src/domain/`, `src/server/` (46 `registerTool(` sites across 16 modules) —
  the existing cut the rule follows. Counted at the 2026-08-21 cutoff; the count itself is filed as
  `F-S4-1` because it diverges from the charter's consumed value.
- `../03_execution-environment-and-citation-drift-component.md` §3.5, §4.2, §4.3 (NEU-972, merged
  2026-08-21) — the three components consumed rather than individuated here.
- `../04_state-category-inventory.md` §9 (NEU-973, merged 2026-08-21) — the entry set the components are
  placed around.
- `../93_stand-in-assumption-register.md` `A-27`, `A-29` — named in the Rationale above, in the sentence.
- `../00_method-and-provenance.md` §1.2 (evidence labels), §2.3 (stand-ins named at the decision), §5
  (verification by file inspection).

## Revision trigger

Either of these **observable events** reopens this record:

1. **A merged change to `src/transport/main.ts` that moves a protection between the two branches** — that
   is, one that mounts auth, origin checking, rate limiting or audit capture on the STDIO path, or
   removes one from the HTTP path. The two-transport split exists because those branches differ; if they
   stop differing, corollary 2 no longer holds.
2. **A merged change that introduces a `src/` top-level directory that is none of `transport`, `server`,
   `orchestration`, `domain`, `ports`, `adapters`, `infrastructure` or `shared`.** That is the observable
   signal that the existing cut is no longer the whole cut, and corollary 1's claim that the model can
   follow it becomes false.
