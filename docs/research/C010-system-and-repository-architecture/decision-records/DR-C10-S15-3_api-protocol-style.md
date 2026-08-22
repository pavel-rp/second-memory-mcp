# `DR-C10-S15-3` — A resource-oriented read surface with named-intent writes, decided against SUB-7's sixteen-entry inventory

**Task:** NEU-982 (SUB-15) · **Charter:** C010 (umbrella NEU-895) · **Decided:** 2026-08-22 · **Verification cutoff:** `229e8f4`, 2026-08-22
**Model:** claude-opus-5[1m]
**Discharges:** part of `OUT-8` (`../01_outcome-register.md`) — the API's protocol style, published as `13_architecture-material-rule-and-web-tier-decisions.md` §7.

---

## Decision

**The general web API takes a resource-oriented read surface over the eleven read-projections, and
named-intent writes over the five write-intents. A write is never a verb-mutation on a read
resource.**

Two clauses are part of the decision:

1. **The asymmetry is deliberate and is what the evidence supports.** The read side is individuated by
   state category and each entry names exactly one authority, which an addressable read surface
   expresses directly. The write side is named-action forwarding with no CRUD symmetry, which it does
   not.
2. **The stop is honoured.** This record specifies **no endpoint path, no payload schema, no error
   catalogue, no versioning scheme and no pagination model** — `../11_…md` §12.2 states that stop and
   it is not crossed. A reader finding no endpoint path here should conclude the contract is **open by
   design, not missing**.

**Decided against `../11_…md` §9's published inventory**, not against a hypothetical resource set.

---

## Rationale

### The criteria, and their weights, fixed before any protocol style was scored

| # | Criterion | Weight |
| --- | --- | --- |
| **P1** | The surface must faithfully render what the inventory **is** — 11 category-individuated projections and 5 named intents — without inventing entries the matrix has no counterpart for. | **decisive** |
| **P2** | The exactly-one-authority property (16 of 16) must stay **verifiable from the surface**, so SUB-11 (NEU-985) can audit it against `../10_…md` §8 without reconstructing anyone's screen design. | **decisive** |
| **P3** | The surface must not expand beyond the sixteen entries SUB-7 published — this chapter has no authority to widen it. | high |
| **P4** | It must be expressible without fixing a wire contract this package has no authority to set. | high |
| **P5** | It should not require a schema-negotiation layer the runtime decision makes unnecessary. | medium |

### The four properties of the inventory that do the work

Read off `../11_…md` §9 and §6:

1. **Write-intents are named actions, not resource mutations.** *"the API accepts a learner action and
   forwards it as an MCP tool call across `CMP-S4-4`. The listed authority performs the write. The API
   performs none."* (§9.2)
2. **The write set has no CRUD symmetry.** Five intents over four categories, and `W5` (notes) is
   *"Create and delete only: `04_…md` records **no update path**, so no update intent is published."*
3. **Three of eleven reads have no store to be a resource of.** `SC-S3-28` mastery — *"derived on read
   with no store … structurally unwritable by anyone, the API included"*; `SC-S3-29` `LearnerContext`
   — *"Derived on read from **five parallel repository reads**. No store"*; `SC-S3-30` analytics —
   *"Computed per request and discarded. No store."*
4. **One read composes across two authorities.** `R7` — *"the derived quality shown is `CMP-S4-8`'s
   (`grade-mapper.ts:71`); the record is `CMP-S4-9`'s."*

And the individuation rule that constrains any surface built over the set: *"One inventory entry = one
(state category, access mode) pair"*, with per-screen, per-view and per-operation individuation
explicitly rejected because *"any unit finer than the state category creates entries with no matrix
counterpart"* (§6; `DR-C10-S7-1`).

### Why the split follows

**P1 and P2 point the same way and they point in opposite directions for the two halves.** Eleven
projections, each one (category, access mode) pair naming exactly one authority, is precisely the
structure an addressable read surface renders one-to-one — and that one-to-one is what keeps P2
satisfiable, because each addressable read maps back to a matrix row an auditor can check.

The five writes have neither property. They are relays: the API accepts an intent and forwards it,
performing no write itself. Rendering a relay as a resource mutation would misdescribe what happens
and would require verbs the domain has no meaning for — `W5` has no update path at all.

**So the two halves take the two shapes their evidence supports.** The asymmetry is not a compromise
between two styles; it is a faithful rendering of an inventory that is itself asymmetric, and any
uniform style has to distort one half to gain the other.

---

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| **1** | **Uniform REST/CRUD over resources, writes included** | **Fails P1 on two counted facts.** (i) The write set has no CRUD symmetry — five intents over four categories, notes create-and-delete with **no update path** — so a uniform verb model publishes verbs the domain has no meaning for. (ii) **Three of eleven reads have no store to be a resource of** (`SC-S3-28`, `SC-S3-29`, `SC-S3-30`, all derived on read). Forcing them into resources invents entities the matrix does not have, which is the same error `DR-C10-S7-1` rejected at a finer grain of individuation. |
| **2** | **Uniform RPC, reads included** | **Fails P2.** It discards the one strong structural property the inventory has: each read-projection is individuated by state category and names exactly one authority. A resource-shaped read surface keeps that one-to-one **visible on the wire**; flattening every read into a named procedure hides it, leaving SUB-11's exactly-one-authority audit with nothing on the surface to reproduce it from. Note the asymmetry with alternative 1: RPC is *right* for the writes and *wrong* for the reads, for the same reason resource-shape is right for the reads and wrong for the writes. |
| **3** | **GraphQL, or any client-composed query language** | **The tempting one**, because three of eleven reads are aggregates and `SC-S3-29` is *five parallel repository reads* — exactly the shape client-composed querying exists to serve. **Fails P2 and P3.** P2: an arbitrary client-composed query has no fixed entry to map back to a matrix row, so exactly-one-authority stops being verifiable from the surface. P3: it expands the surface beyond the sixteen published entries, which this chapter has no authority to do. Note what it is **not** rejected on — it does not violate the browser trust property, since no gate moves; that is why the rejection is argued on authority visibility instead. |
| **4** | **Typed RPC with a generated shared client (tRPC-style)** | **Rejected because it is not a protocol style** — it is a framework and library pick, and `DR-C10-S15-1` classifies it out of scope: swapping it moves no `BND-S4-*` row, no Authority cell and no `CC-S8-*` clause. A downstream charter may adopt it *underneath* the style selected here. Recording it as rejected-at-this-level rather than silently omitting it is what keeps the exclusion derived rather than assumed. |
| **5** | **Defer the protocol style to the implementation charter** | Rejected on ordering. `../11_…md` §5.3 and §15 name **SUB-15 (NEU-982)** as the owner of protocol style precisely so the wire contract is written *after* the style that governs it is chosen — *"Deciding them here would have fixed a wire contract before the protocol style that governs it was chosen, and a downstream charter would then be inheriting a contract nobody had authority to set."* Deferring again reproduces the problem one level down. |

---

## Consequences

1. **The constraint on whoever writes the wire contract is inherited unchanged** from `../11_…md`
   §12.2: **no resource may be authoritative for any of the forty-five categories, and every resource
   must resolve to exactly one of the authorities §9 names.** This record adds a shape; it does not
   relax that constraint.
2. **SUB-11 (NEU-985) can audit exactly-one-authority from the surface.** This is P2 discharged, and
   it is the practical payoff of not flattening the reads.
3. **The read surface's shape depends on `F-S7-1` / `F-S7-2`.** `../11_…md` §11.2 reports two
   unmatched inventory→matrix items (`U-1`, `U-2`), routed to **SUB-13 (NEU-977)**. If SUB-13
   dispositions either by adding a state category, the inventory grows and this surface gains an
   entry. Recorded as **`OI-S15-1`**.
4. **Nothing here widens the negative boundary.** `../11_…md` §10 records 45 of 45 categories
   explicitly not-owned by the web API, 0 silent, and `CMP-S4-3` holds zero of 45 rows under `M-A`.
   This record originates no authority and moves no row.
5. **The seven access-mode non-exposures and eight deliberate learner-facing non-exposures are
   consumed, not revisited.** A surface is not designed over a capability SUB-7 deliberately did not
   expose (`../11_…md` §10.2, §10.3).

---

## The two dependencies this decision carries

Recorded here because this is the decision they constrain — `13_…md` §7.4 carries the same statement
in the chapter body.

- **From `DR-C10-S15-2` (runtime → protocol style).** The shared TypeScript runtime lets the 43 gated
  tool schemas serve as the web tier's own contract types. That is why the protocol style can stay
  **thin** — a projection/intent split with no schema-negotiation layer (**P5**). Had the runtime gone
  to a foreign language, alternative 3 gains its strongest argument, because a self-describing schema
  is the only mechanical grip a foreign-language client has on 43 schemas. **The runtime choice
  narrowed the credible protocol styles.**
- **From `DR-C10-S15-4` (rendering model → protocol style).** Because the server composes every
  gate-bearing read, the read surface needs **whole-projection reads**, not client-selected fields —
  the composition is server-side by construction. That is an independent reason alternative 3 loses,
  and it is recorded at this decision because it constrains *this* one.

---

## Evidence

| Claim | Source |
| --- | --- |
| The 16-entry inventory: 11 read-projections, 5 write-intents, 16 of 16 exactly-one-authority, 0 originated | `../11_…md` §9, §9.3 |
| Write-intents are forwarded MCP tool calls; the API performs no write | `../11_…md` §9.2 |
| `W5` notes: create and delete only, no update path | `../11_…md` §9.2; `../04_…md` |
| `SC-S3-28`, `SC-S3-29`, `SC-S3-30` are derived on read with no store | `../11_…md` §10.1 |
| `R7` composes across two authorities | `../11_…md` §9.1; `src/domain/algorithms/grade-mapper.ts:71` |
| The individuation rule and the rejection of finer grains | `../11_…md` §6; `DR-C10-S7-1` |
| The stop: 0 endpoint paths / payload schemas / error catalogues / versioning / pagination | `../11_…md` §12.1, §12.2 |
| SUB-15 named as the owner of protocol style | `../11_…md` §5.3, §15 |
| Two unmatched inventory→matrix items routed to SUB-13 | `../11_…md` §11.2; `F-S7-1`, `F-S7-2` |
| Negative boundary: 45 of 45 not-owned, 0 silent; `CMP-S4-3` holds zero rows | `../11_…md` §10.1, §5.1; `../10_…md` §11 |
| 43 gated tool schemas as the contract surface | `../12_…md` §7.1–§7.2; `F-S8-1` |

---

## Revision trigger

1. **SUB-13 (NEU-977) dispositions `F-S7-1` or `F-S7-2` by adding a state category** — the inventory
   grows and this surface gains an entry (`OI-S15-1`).
2. **`../11_…md` §9's inventory is republished with a different entry count or a different access-mode
   split** — the decision is argued from the inventory's shape, so a change in that shape re-opens it.
3. **`M-A` is reversed** and `CMP-S4-3` acquires authority over any category — the read surface would
   then carry a resource that *is* authoritative, which this record's inherited constraint forbids.
   `../11_…md` §13 records `R3` as **not established**, so this is not currently in prospect.
4. **A downstream charter reports that the projection/intent split cannot express one of the sixteen
   entries** — routed here as a finding, not resolved locally.
5. **`A-27` is invalidated by NEU-892 landing outside its envelope.** This record's dependency on
   `A-27` is **indirect and it is stated here so it is not missed**: the protocol style is argued from
   the inventory's shape, and `A-27` is what makes the surface a *server-composed* one whose reads are
   whole projections rather than client-selected fields — the constraint `DR-C10-S15-4` supplies and
   this record consumes at §"The two dependencies this decision carries". If `A-27` is invalidated,
   the rendering model re-opens, and the read surface's shape re-opens with it. Recorded as
   **`CAP-S15-2`**, which notes that this is the one of the three records whose `A-27` dependency is
   inherited rather than direct.
