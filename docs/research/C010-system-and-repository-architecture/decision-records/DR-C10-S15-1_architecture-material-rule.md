# `DR-C10-S15-1` — What makes a technology choice architecture-material: a three-limb test with its terms bound to named package artifacts

**Task:** NEU-982 (SUB-15) · **Charter:** C010 (umbrella NEU-895) · **Decided:** 2026-08-22 · **Verification cutoff:** `229e8f4`, 2026-08-22
**Model:** claude-opus-5[1m]
**Discharges:** part of `OUT-8` (`../01_outcome-register.md`) — the classification rule and its demonstrations, published as `../13_architecture-material-rule-and-web-tier-decisions.md` §4.

---

## Decision

**A choice is architecture-material when changing it, on its own, would move a boundary, reassign an
authority, or alter a compatibility contract. A choice reversible without any of those three moving
is not architecture-material, and this package does not make it.**

The rule is a **test**, not a list, and it is applicable only because its three terms are bound to
artifacts a reader can open:

| Term | Resolves to | Where |
| --- | --- | --- |
| **a boundary** | a `BND-S4-*` row — its **existence**, its **pair**, or its **class** | `../05_…md` §4.2 |
| **an authority** | an **Authority cell** among `SC-S3-1`…`SC-S3-45` | `../10_…md` §8, revision `post-validation` (SUB-16 / NEU-979) |
| **a compatibility contract** | a `CC-S8-*` clause, or the public tool surface it bounds (46 tools / 43 gated / 3 exempt) | `../12_…md` §6.1, §7 |

**The procedure.** For a candidate choice C: state the system with C and with C's most plausible
alternative; ask whether any `BND-S4-*` row differs, whether any of the 45 Authority cells differs,
and whether any `CC-S8-*` clause or the gated-tool count differs. **One yes → architecture-material.
All three no → not.**

Two clauses are part of the decision, not commentary on it:

1. **"On its own."** The test asks what changing *this* choice moves, holding everything else fixed.
   Bundled choices are separated first (see the ORM case in Rationale).
2. **A "yes" makes the choice the *package's*, not necessarily *this chapter's*.** Where the rule
   returns material and the charter's decomposition names another owner, the correct action is to
   **route**, never to decide.

---

## Rationale

### The criteria, and their weights, fixed before any candidate rule was scored

| # | Criterion | Weight |
| --- | --- | --- |
| **C1** | A downstream reader can classify a choice **this package never anticipated**, without further interpretation. | **decisive** |
| **C2** | The rule's terms resolve to artifacts already published in this package, so applying it needs no new judgement call. | **decisive** |
| **C3** | It excludes framework and library picks **by derivation**, not by naming them. | high |
| **C4** | It does not silently absorb a choice belonging to another sub-task — it must be able to return *material* and still hand the choice away. | high |
| **C5** | It is stable against the package's own open questions: an `undecided` cell must not have to be resolved to run the test. | medium |

### Why these three limbs and not others

The candidate limbs considered were: boundary, authority, compatibility contract, **cost**,
**reversibility**, and **blast radius**. The three selected are exactly the three this package has
already **enumerated and published as tables**, which is what satisfies **C2**. Cost, reversibility
and blast radius are all real properties and none of them is written down anywhere in this package as
a checkable list — a rule resting on them would require the reader to estimate, which fails **C1**.

The three are also jointly what the package's own outcomes are *about*: `OUT-1`/`OUT-2` produce the
boundary model, `OUT-3` the authority matrix, `OUT-6` the compatibility contract. A choice that moves
none of them moves nothing this package has authority over — which is the substantive reason the rule
is not merely a convenient formulation.

### Why "on its own" earns its place

Applied to "which ORM does the web tier use", the naive reading returns *material*, because an ORM in
the web tier presupposes the web tier reaches Postgres — and whether that edge exists is
`BND-S4-16`, recorded **`undecided`** at `../05_…md` §4.4. The "on its own" clause separates the
bundle into two choices: *does the web tier reach durable storage at all* (**material**, and SUB-6's),
and *given that edge, which ORM* (**not material**). Without the clause the rule would either
over-reach into every library that touches storage, or need an ad-hoc exception. This is the
strongest evidence that the rule is a test rather than a list: on a bundled input it does not return
"it depends" — it locates the materiality and routes that part.

### Why a "yes" is separated from ownership

**C4.** `13_…md` §4.4 runs the rule on a choice the charter never enumerated — whether the web tier
keeps a server-side web-session store — and gets *material* on two limbs at once (`BND-S4-16`'s
existence; `SC-S3-43`'s authority). The right outcome is **not** for this chapter to decide it. A rule
that conflated "the package should decide this" with "I should decide this" would have licensed
exactly the over-reach the sub-task's problem slice warns against.

---

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| **1** | **An enumerated list of in-scope choice types** (runtime, protocol, rendering, data store, deployment, orchestration) | Fails **C1** outright, which is the decisive criterion. A list cannot classify what it does not contain, and the acceptance criterion explicitly requires classifying an unanticipated choice. It also silently converts the charter's enumeration into a boundary, so anything the charter forgot becomes invisible rather than out of scope. |
| **2** | **"Architecture-material means hard to reverse later"** (a cost/reversibility test) | Fails **C2**. Reversal cost is not published anywhere in this package, so two readers get two answers and neither can be checked. It also inverts the dependency: reversal cost is largely a *consequence* of where the boundaries are, so the test would rest on the thing it is trying to classify. |
| **3** | **"Architecture-material means it appears in the component model"** (`../05_…md` §3.2's `CMP-S4-*` inventory) | Fails **C3** and **C4**. Every framework runs inside some component, so the test admits component kits and routers; and it gives no way to distinguish a choice that *moves* a component boundary from one that merely *lives* inside a component. |
| **4** | **Reuse SUB-8's `R8-1`…`R8-5`** rather than state a second rule | Category error, and rejected on that ground rather than on quality. `R8-*` classifies *where a capability lives* — public reusable core or private closed application — and returns a distribution-line consequence. It has no limb that answers *whether the package should decide the choice at all*, and every one of its clauses presupposes a capability already judged worth having. `13_…md` §4.5 works a single choice through both rules and shows they return different, composable answers. |
| **5** | **A two-limb rule (boundary and authority only)**, dropping the compatibility contract | Rejected because it would have classified this chapter's own runtime decision as **not** material — neither `BND-S4-*` nor an Authority cell moves on the web tier's language (`13_…md` §4.3). The contract limb is what carries it, via `CC-S8-5`'s premise and `RD-S8-4`'s reach. A rule that excludes the decision the same chapter must take is self-refuting. |

---

## Consequences

1. **SUB-10 (NEU-984) applies this rule; it does not restate it.** Its substrate choices — data-store
   topology, deployment shape, AI-orchestration placement — are run through §4.2's procedure, and the
   rule's terms are already bound, so no local re-derivation is needed.
2. **Framework and library selection is out of scope by derivation.** `13_…md` §4.7 runs router, ORM,
   component kit, test runner and styling approach through the test individually. The exclusion is
   reproducible rather than asserted, which is what the acceptance criterion requires.
3. **Being a criterion input is not the same as being architecture-material.** The test runner is not
   material *and* is a criterion SUB-9 scores. Conflating the two would pull tooling into this package
   through SUB-9's dependency.
4. **The rule can return *material* and still route.** Two of the chapter's four demonstrations do
   exactly that (`13_…md` §4.4, §4.7's ORM split), both landing on `BND-S4-16`, which stays
   `undecided` and SUB-6's.
5. **A choice whose materiality depends on an `undecided` cell is material.** The rule never resolves
   an undecided cell to obtain an answer; it returns material and routes. This is `C5`, and it is why
   `BND-S4-16` is reachable by the test without being disturbed by it.
6. **The rule does not prioritise, does not name an owner, and does not settle contested cells.**
   Stated as a limit at `13_…md` §4.8 so it is not read as more than it is.

---

## Evidence

| Claim | Source |
| --- | --- |
| The boundary inventory and its classes, including `BND-S4-16` `undecided` and `BND-S4-17` unenforced | `../05_…md` §4.2, §4.4 |
| The 45 authority rows and `CMP-S4-3` holding zero of them under `M-A` | `../10_…md` §8, §11, revision `post-validation` (SUB-16 / NEU-979) |
| Corroboration that `CMP-S4-3` is named zero times on the resource surface | `../11_…md` §9.3 |
| The `CC-S8-*` clauses and the compatibility contract's contents | `../12_…md` §6.1, §8 |
| The compatibility surface: 46 tools / 43 gated / 3 exempt / 49 audit entries | `../12_…md` §7.1–§7.2, §10.1; `F-S8-1` |
| SUB-8's rule, consumed for the §4.5 comparison and not restated | `../12_…md` §5 (`R8-1`…`R8-5`) |
| `SC-S3-43`'s authorship and its `assumed — A-27` basis | `../10_…md` §8; `F-S8-3` |

---

## Revision trigger

This record is revised if any of the following occurs:

1. **A limb's backing table is republished with a different shape** — in particular if `../10_…md`
   §8 is republished at a revision later than `post-validation`, or if `../05_…md` §4.2 gains or
   loses a `BND-S4-*` row. The rule's terms are bindings to those tables; a change in the tables
   changes what the rule tests against, though not the rule's form.
2. **`BND-S4-16` is decided** by SUB-6 (NEU-976). Two of the four published demonstrations route to
   it; once it is decided they resolve rather than route, and the demonstrations should be re-stated
   against the settled edge.
3. **A downstream sub-task applies the rule and gets an indeterminate answer.** The acceptance
   criterion is that the rule yields in-scope or out-of-scope *without further interpretation*; a
   reported indeterminacy is a defect in this record and is routed here as a finding, not patched
   locally.
4. **A fourth limb is shown necessary** — a choice that is uncontroversially architecture-material
   and that moves no boundary, no authority and no compatibility contract. None was found across the
   four demonstrations and the three decisions this chapter takes.
