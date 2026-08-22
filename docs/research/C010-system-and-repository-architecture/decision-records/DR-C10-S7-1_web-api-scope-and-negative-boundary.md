# `DR-C10-S7-1` — How the general web API's scope is bounded: projection and intent, never authorship

**Task:** NEU-980 (SUB-7) · **Charter:** C010 (umbrella NEU-895) · **Decided:** 2026-08-22 · **Verification cutoff:** 2026-08-22
**Model:** claude-opus-5[1m]
**Discharges:** part of `OUT-5` (`../01_outcome-register.md`) — the scope statement and the negative boundary that `11_web-api-scope-and-resource-inventory.md` publishes.

---

## Decision

**The general web API's scope is bounded to two access modes over the state categories that already
exist — `read-projection` and `write-intent` — and it is the authority for none of them.** Concretely:

1. **A `read-projection`** means the API serves a value whose authority is a `CMP-S4-*` component named
   in `../10_…md` §8. A web-tier or browser copy is a **cache** (`../05_…md` `FL-S4-2`), never an
   authority.
2. **A `write-intent`** means the API accepts a learner action and **forwards it as an MCP tool call
   across `CMP-S4-4`** (`FL-S4-5`). The listed authority performs the write; the API performs none and,
   under `M-A`, holds no database credential.
3. **One inventory entry is one `(state category, access mode)` pair.** The matrix's unit is the state
   category and exactly-one-authority is a per-category property, so the inventory's unit is keyed to
   the matrix's rather than to any surface artifact.
4. **The inventory covers only categories whose `Status` is `existing`.** A category marked
   `required-by-upstream` or `assumed` has no store, so no capability over it can be scoped — only a
   **stated deliberate non-exposure with a named lifting condition** (`CAP-S7-2`).
5. **The negative boundary is enumerated per category, all forty-five, one at a time**, each with the
   authority that displaces the API and a row-specific reason. Silence for any category is a defect in
   the chapter, not a permission.

**This decision rests on stand-in assumption `A-27`** — a rich authenticated web surface whose
interaction state is **not gate-bearing** — whose tolerance envelope permits arbitrarily rich
client-side state *"provided the server re-evaluates every gate from server-held state"*, and whose
invalidating outcome is a UI direction requiring **offline-capable or client-authoritative learning
state**. `A-27` is `[unconfirmed]`; so is this decision.

---

## Rationale

**The negative half is the control, so it is designed first.** The charter's Critical risk is *"MCP and
web-owned state diverge or permit conflicting writes"*. Divergence requires two writers. Under `M-A` the
MCP core is the exclusive writer of all forty-five categories, so the control is to make the API's
non-authorship **explicit per category** rather than implied by absence. A downstream implementation
charter that finds no statement about a category will reasonably assume it may write it — which is
exactly how the Critical risk materialises without anyone deciding it should.

**The access-mode split is what makes the boundary checkable.** "The API does not own state" is not
auditable: every API reads and writes *something*. Splitting exposure into projection and intent makes
each entry carry a claim that **can** be falsified — *this value's authority is that component* — and
that claim is checked in both directions in `../11_…md` §11. It also captures the distinction the
chapter most needs: many categories are legitimately readable and illegitimately writable, and a
collapsed entry cannot say which.

**Keying the inventory's unit to the matrix's unit is what keeps the cross-check honest.** If the
inventory were individuated per screen or per operation, its unmatched counts would measure the
individuation rule rather than the system. Keying to the state category means an unmatched item is a
statement about the *category set*, which is a real object with a real owner.

**Restricting to `existing` categories is an honesty constraint, not a convenience.** Eight
learner-facing categories have no store anywhere. Publishing a capability over one would publish a
resource that does not exist and would hand SUB-15 (NEU-982) a surface to design a protocol over that
nothing can serve. Declaring the non-exposure with a lifting condition says the same thing without
asserting a resource into being.

**The expected shape of the result was reasoned about before it was produced, so that a small positive
surface would not be mistaken for incomplete work.** `../10_…md` §11 already states that `CMP-S4-3`
holds zero of forty-five rows *by construction* under `M-A`. A large negative boundary and a small
positive one is therefore the **correct** outcome of applying this decision, not a shortfall in
applying it.

---

## Rejected alternatives

### 1. A co-authority web tier — the API writes some categories directly

**Rejected on ownership, not on taste.** `../05_…md` records `BND-S4-16` (web tier ↔ Postgres) as
**undecided**, and `M-A` resolves it as *the write edge does not exist*. Giving the API a direct write
would resurrect that edge, which is **SUB-6 (NEU-976)**'s decision and not this sub-task's.

**The specific consequence that decided it:** it would make `CMP-S4-3` a second writer for at least
`SC-S3-43`, and `../05_…md` §4.4 states what `M-A` buys by refusing — *"`BND-S4-2` then carries the
entire authority contract."* One boundary carrying the whole contract is auditable; two writers over one
category is the Critical risk itself, adopted deliberately.

### 2. A web-tier-owned presentation namespace — new categories, outside the forty-five

Shadowing nothing in the matrix, the web tier would own its own presentation-state categories, leaving
the matrix untouched.

**Rejected because `../07_…md` §6.3 forecloses it and because it would break the cross-check.** Clause 3
— the presentation exception — is **empty** under `M-A`: *"`M-A` makes the MCP core the exclusive writer
of all 45 categories, so clause 3 matches no row."* A namespace outside the forty-five would put entries
in the inventory with **no matrix counterpart by construction**, manufacturing unmatched items that
measure the invention rather than the system, and quietly relocating `SC-S3-43` — the one row a model
reversal would move — without the reversal having been decided.

### 3. Individuating the inventory per operation, per screen, or per view

**Rejected on the same mechanism as alternative 2, at finer grain.** Any unit finer than the state
category creates entries with no matrix counterpart. The cross-check's unmatched counts would then be a
function of how the surface was drawn, and SUB-11 (NEU-985) could not reproduce them without also
reproducing the surface design — which does not exist yet and belongs to SUB-15 (NEU-982).

**The converse was also rejected:** one entry per category with access mode collapsed. That hides the
chapter's most useful distinction (§10.2's seven access-mode non-exposures) and would have made
`SC-S3-3`'s read-yes/write-no status unstatable.

### 4. Publishing capabilities over `required-by-upstream` and `assumed` categories

It would have produced a larger, more complete-looking inventory covering all nineteen learner-facing
rows rather than eleven.

**Rejected because eight of those categories have no store in any component.** The consequence that
decided it: `../11_…md` §11.2's exactly-one-authority audit would have passed on entries that resolve to
an authority for a category **nothing holds** — a green audit over resources that cannot be served. The
audit's value comes from every passing entry being genuinely serveable.

### 5. Stating the negative boundary once, as a blanket sentence

*"Under `M-A` the API owns none of the forty-five categories"* is true, short, and would have been
defensible.

**Rejected because it fails the only reader who matters here.** A downstream charter looks up **one**
category. A blanket sentence forces it to derive the answer for its category from a general claim, and
the derivation is exactly where an implementer talks themselves into an exception. Forty-five row-
specific reasons cost length and buy the property that no lookup returns silence — which is what the
acceptance criterion asks for and why `../11_…md` §10.1 is a table rather than a paragraph.

---

## Consequences

**Accepted, and stated as costs rather than as neutral facts.**

1. **The API's positive surface is small — sixteen entries — and its negative boundary is total.** That
   asymmetry is correct under `M-A` and will read as thin to anyone expecting an API specification. It
   is a scope document, and `../11_…md` §12 states the stop so the thinness is not read as an omission.
2. **Every future web resource inherits a proof obligation.** Whoever writes the wire contract must,
   for each resource, name exactly one `CMP-S4-*` authority from the matrix or file a routed finding.
   That is a real constraint on a contract that does not exist yet.
3. **Two required capabilities have no home, and the API is therefore incomplete by construction.**
   `F-S7-1` (no category for the web session's own identity binding) and `F-S7-2` (no deletion owner for
   the two learner-payload rows) are absences in the category set, not defects in this decision — but
   the API cannot be fully scoped until they are settled, and `CAP-S7-1` records the second as a cap
   because no available party settles it.
4. **Both findings route to a closed owner.** SUB-13 (NEU-977) is merged. That is the accepted **F5.7**
   warning, carried here rather than fixed, with NEU-896 and SUB-12 (NEU-986) co-named so the routing is
   not solely to a closed party.
5. **This decision cannot outlive a matrix revision.** Every authority in `../11_…md` is read off the
   `post-validation` revision. A later revision obliges a re-run of the cross-check, not a patch.
6. **`M-A`'s known weakness is settled rather than deferred, and settled *against* reversal.**
   `S6_state-ownership-model-selection.md` records that whether `M-A`'s `C7 = 2` — presentation state
   forced through the MCP tool surface — is *"merely awkward or actually blocking is `SUB-7 (NEU-980)`'s
   to settle"*. `../11_…md` §13 settles it: **awkward, not blocking**, so `R3` is not established. The
   cost of that answer is that it inherits `A-27`'s `[unconfirmed]` status entirely.

---

## Evidence

| What | Where |
| --- | --- |
| The web tier's scoping and its `[unconfirmed]` status under `A-27` | `../05_…md` `CMP-S4-3` |
| The four boundaries the API sits between, with transport qualification | `../05_…md` `BND-S4-1`, `BND-S4-2`, `BND-S4-16` (+ §4.4), `BND-S4-17` |
| Browser copies are caches, never authorities | `../05_…md` `FL-S4-2`; interaction reported not decided, `FL-S4-1` |
| Web mutations reach the core as tool calls through the context-token gate | `../05_…md` `FL-S4-5` |
| Identity is neither the browser's nor the web tier's | `../05_…md` `FL-S4-3` |
| The forty-five authorities, clauses and status markings | `../10_…md` §8, revision `post-validation` (SUB-16 / NEU-979) |
| `CMP-S4-3` holds zero of forty-five rows by construction | `../10_…md` §11; §8's authority distribution |
| The two audits are different audits over different inventories | `../10_…md` §3.1, §7.2, §11 |
| Clause 3 (presentation exception) is empty under `M-A` | `../07_…md` §6.3 |
| `R3` and the `R1 ∧ R2 ∧ R3` conjunction, with its 2/500 margin | `../07_…md` §5.3 |
| `M-A`'s `C7 = 2` weakness handed to this sub-task to settle | `../traceability/S6_state-ownership-model-selection.md` |
| `Learner-scoped` cells, `Status` markings, and the categories with no store | `../04_…md` §3.1–§3.7, §8 |
| No ownership column exists on any table | `../04_…md` §6 (zero matches in `schema.ts`) |
| `A-27`'s statement, tolerance envelope, invalidating outcome and re-validation trigger | `../93_…md` `A-27` (closed register — cited, never appended to) |
| An offline-capable learner surface is outside the envelope | `../05_…md` §6.3 constraint `R-3` |
| No component can be the deletion owner for `SC-S3-16`/`SC-S3-17` | `../91_…md` `CAP-S4-1` (seventh sighting at `../11_…md` §11.2, left open) |

**Evidence class.** The component, boundary and flow facts are `confirmed` against `../05_…md`'s cited
paths. The authority assignments are `consumed` from `../10_…md` — honoured, not re-derived. The scope
decision itself and everything downstream of it in `../11_…md` §10.3 and §13 are `[unconfirmed]`, resting
on `A-27`.

**A green type-check or lint line is not evidence about this decision** and appears nowhere above.

---

## Revision trigger

This record is revised — not patched — when any one of the following becomes observable:

1. **`A-27` is invalidated.** Its re-validation trigger is **NEU-892 lands** (its package published
   under `docs/research/`). If that package requires **offline-capable or client-authoritative learning
   state**, the browser becomes an authority for a category under `OUT-3`: the negative boundary must be
   re-derived rather than amended, and `../11_…md` §13's `R3` verdict re-opens immediately.
2. **The ownership model reverses.** If `../07_…md` §5.3's conjunction `R1 ∧ R2 ∧ R3` is satisfied and
   `M-C` is selected, clause 3's exception list stops being empty — and `../07_…md` §6.3 names the single
   row it would then contain, `SC-S3-43`. Alternative 2 above would need re-deciding on the new model,
   and this record's Decision clause 5 would no longer hold at forty-five.
3. **The matrix is revised past `post-validation`.** Every authority here is read off that revision. A
   new revision obliges a re-run of `../11_…md` §11's cross-check in both directions and a fresh count,
   because a carried-forward count over a changed matrix would be a claim about the wrong artifact.
4. **A category covering *web session → authenticated principal* is added** (the resolving event for
   `OI-S7-1`). The provisional reading in `../11_…md` §8.2 claim 5 is then replaced by an assigned row,
   and `F-S7-1` closes.
5. **A deletion owner is named for `SC-S3-16` or `SC-S3-17`.** `CAP-S7-1` lifts, an erasure write-intent
   becomes scopable, and the inventory gains its first entry not present at this revision.
