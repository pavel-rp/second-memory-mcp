# `DR-C10-N987-1` — Each of `SC-S3-17`, `SC-S3-33` and `SC-S3-34` has exactly one writing component

**Written by:** NEU-987 · **Charter:** C010 (umbrella NEU-895) · **Covers:** `F-S10-6`, `F-S14-8`, `F-S16-4`
**Written:** 2026-08-23
**Model:** claude-opus-5[1m]
**Carried in:** `../05_system-context-and-responsibility-boundaries.md` §3.2, §5, §7;
`../08_per-state-authority-matrix.md` §8.3, §8.6; `../10_republished-authority-matrix.md` §6.2, §5.5;
`DR-C10-S6-1_state-ownership-model.md`

---

## Decision

| Category | **The single writing component** | What the other named component actually is |
| --- | --- | --- |
| `SC-S3-17` — Operation event log | **`CMP-S4-9`** — persistence adapters and Postgres | `CMP-S4-19` is the **issuing write path** (a `W` annotation), off the request path, never an authority |
| `SC-S3-33` — Cached citation-drift verdict | **`CMP-S4-17`** — citation-drift verdict producer | `CMP-S4-18` **holds** the cache; it is substrate, never a writer |
| `SC-S3-34` — Citation-drift verdict store | **`CMP-S4-17`** | — (uncontested on every surface) |

`SC-S3-16` — the request log — rides along with `SC-S3-17`: the same two flow rows named its writer,
so the same ruling applies and the same cells were amended. It is stated here for completeness; the
task's acceptance names the three categories above.

**This record is an adjudication, not new analysis.** Every fact it relies on was already published
in the merged package. What was missing was the authority to amend another sub-task's merged chapter
— which is exactly what three sub-tasks said they lacked.

## Why this needed a separate record

`F-S10-6`, `F-S14-8` and `F-S16-4` were each **correctly routed** by the sub-task that found them.
SUB-10 took the matrix and routed the exclusive-writer conflict, noting its own substrate selection
survived either reading. SUB-14 confirmed the authority by re-running clause 5 and revised the write
path, explicitly not editing `05_…md`. SUB-16 dispositioned the intra-`05_…md` contradiction and
re-routed the residue as `F-S16-4`.

None of them was wrong to stop. `../10_republished-authority-matrix.md` §6.3 states the reason with
precision: *"SUB-14's phrase '`05_…md`'s half is SUB-16's to amend' assigns ownership of the outcome,
not a licence."* No sub-task held the licence. The consequence was that the package was internally
consistent about *what the rule says* and internally contradictory about *who writes state* — and a
cold reader given only the published package stopped on exactly that, twice.

## Argument — `SC-S3-17` → `CMP-S4-9`

1. **Two of the four surfaces already agreed, and had been validated.**
   `../08_per-state-authority-matrix.md` §8.3 reads *"Authority: `CMP-S4-9`, written through
   `CMP-S4-19`"*. `../10_republished-authority-matrix.md` §6.2 re-derives it on clause 5 and states
   outright that **"`CMP-S4-19` remains a `W` annotation and never a second authority."** The outlier
   was `../05_system-context-and-responsibility-boundaries.md` alone.

2. **The assignment rule does not condition authority on which thread issues the write.**
   `../07_state-ownership-model-selection.md` §6.1 clause 5 keys authority off the row's own
   `Learner-scoped` cell. Nothing in the six clauses or the tie-break mentions the issuing thread.
   `10_…md` §6.2 puts it exactly: *"The deviation is in the write path, never in the authority."*

3. **The outlier contradicted its own neighbour.** `FL-S4-20`, three rows below `FL-S4-8` in the same
   table, already named `CMP-S4-9` for the same rows. Ratifying `CMP-S4-9` repairs two cells and
   breaks none; ratifying `CMP-S4-19` would have required amending `FL-S4-20`, `08_…md`, `10_…md`
   **and** the validated clause-5 derivation.

4. **The real defect was a scoping clause, not an authority.** `05_…md` §3.2 scoped `CMP-S4-9` to
   *"the only writer of the `public` and `infrastructure` database schemas **on the request path**"*.
   The log write is off the request path, so that sentence failed to cover a write everyone agreed
   was `CMP-S4-9`'s — which is precisely what made `CMP-S4-19` look like a second authority. The
   amendment widens the clause. Once it covers both paths, the second writer disappears without any
   authority moving.

## Argument — `SC-S3-33` → `CMP-S4-17`

1. **`FL-S4-13`, in the same table as the outlier, already called `CMP-S4-17` the cache's *only*
   writer.** `../03_execution-environment-and-citation-drift-component.md` §4.3 agrees.
2. **Re-running the rule reproduces it.** Clause 2 with tie-break (c) yields `CMP-S4-17` —
   `10_…md` §5.5 and `08_…md` §8.6.
3. **`CMP-S4-18` is a holder, and the distinction is load-bearing.** `10_…md` records the
   holder-versus-authority separation as the thing *"the whole chapter exists to establish"*, with
   `CMP-S4-18` as its cleanest illustration: it *holds* `SC-S3-33` without writing it, and its own
   responsibility statement in `05_…md` §3.2 says it **"never derives, refreshes or ages"** a verdict.
   A component that never derives, refreshes or ages a value is not its writer. `FL-S4-14` named the
   holder in a column that asks for the authority — a column misuse, not a rival ruling.

## Argument — `SC-S3-34` → `CMP-S4-17`, and the `F-S10-6` quantifier

`SC-S3-34` was never actually contested: `05_…md` §3.2 (*"Writes `SC-S3-34`"*), `05_…md` §4
`BND-S4-3`, `08_…md` §8.6 (*"`CMP-S4-17`, exclusively"*) and `10_…md`'s republished table all name
`CMP-S4-17`. What made it *look* contested was `DR-C10-S6-1`'s headline — *"the MCP core is the
exclusive writer of all 45 categories"* — read as a claim about components.

It is not. `DR-C10-S6-1` is the **all-MCP versus hybrid** selection, and its own Decision paragraph
continues *"The web tier (`CMP-S4-3`) holds no write authority over any category and no database
credential."* The quantifier ranges over **deployment tiers**. `CMP-S4-17` is on the operator's
server side — `05_…md` §3.1 places it in zone `Z-CONT`, one of the three operator-side zones behind
the MCP tool surface — and the tier the decision excludes is `Z-WEB`.

So `F-S10-6` was **a conflict of quantifier scope, not a conflict of fact**. Both statements were
true as intended and irreconcilable as written. The amendment states the quantifier and defers the
per-category component assignment to the matrix. **No authority moved.**

This is why `F-S10-6` is resolved rather than overturned, and why `../07_state-ownership-model-selection.md`
needed no amendment: each of its restatements of the claim already continues into *"The web tier …"*
or is explicitly qualified (*"exclusive writer of every category the isolation invariant's domain
touches"*), so they are tier-scoped in situ and never read component-wise. The bare headline was the
only surface that had lost the qualifier.

## The amendment discipline this record commits to

`10_…md` §6.3 declined to repair `05_…md` partly on ownership and partly on a substantive objection
worth preserving: *"silently reconciling one to the other would destroy the record of which one was
written first and on what evidence."* That objection survives the grant of amend authority, so every
amendment made under this record is **disclosed**:

- each amended cell states what it previously said, and why;
- each points at where the original routing or disposition is preserved (`10_…md` §6.2/§6.3/§5.5);
- no routed finding, disposition, or owner line was deleted or renumbered;
- `../02_findings-register.md` records the resolution against the **existing** ids `F-S10-6`,
  `F-S14-8`, `F-S16-4` — no replacement ids were minted for them.

The package now reads consistently **and** still carries the record of having been inconsistent.

## Consequences

- The cold reader's blocking question — *"I cannot implement a Tier-2 gate against a category with
  two writers"* — is answered: `SC-S3-17` has one writer, `CMP-S4-9`.
- `CAP-S4-1` is **not** affected. Deletion ownership for `SC-S3-16`/`SC-S3-17` remains structurally
  unassignable for want of a principal field, and `05_…md` §9.2 is untouched. Write authority and
  deletion ownership are different questions, as `10_…md` §9 already insists.
- `FL-S4-16` is **not** affected. Its authority is genuinely undetermined under the open `OI-S2-2`,
  which is an unanswered question rather than a contradiction, and is out of this record's scope.
- `F-S13-1` — SUB-13's disclosure of the narrow reading of tie-break (b) behind `SC-S3-33`'s clause-2
  assignment — is **not** closed here. This record ratifies the *outcome* (`CMP-S4-17`) on the
  independent grounds above; whether the tie-break reading itself should be restated remains SUB-6's,
  and is unchanged by the amendment.
