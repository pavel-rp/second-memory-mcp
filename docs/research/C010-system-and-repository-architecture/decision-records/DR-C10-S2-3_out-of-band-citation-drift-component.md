# `DR-C10-S2-3` — The citation-drift verdict is produced out of band and read from cache on the serve path

**Task:** NEU-972 (SUB-2) · **Charter:** C010 (umbrella NEU-895) · **Decided:** 2026-08-21
**Model:** claude-opus-5[1m]
**Discharges:** `OUT-9`, third of its three conclusions.
**Chapter:** `../03_execution-environment-and-citation-drift-component.md` §4

---

## Decision

**The architecture contains two components, not one, and the split is the decision.**

1. A **`citation-drift verdict producer`** — asynchronous, triggered out of band, with egress to external source sites. It re-executes the verification procedure for **one** cited problem and writes **one dated verdict**.
2. A **`drift-verdict cache`** — internal, no egress, on the learner's latency path, whose only admissible operation is a keyed read.

**The serve path reads a verdict; it never computes one.** A **stale or absent verdict quarantines the unit** with `reason: retracted-input`, and **the learner's request completes**. No reviewer, no model call and no execution ever sits on that path.

Both components' eight-field specifications are chapter §4.2 and §4.3. This record decides the split and the serve-path rule; the specifications record them.

## Rationale

The criteria, weighted **before** the scoring:

| Criterion | Weight | Why |
| --- | --- | --- |
| **Compliance with the serve-time gate rule** | **Highest, and non-negotiable.** *"A serve-time gate is on a learner's latency path and may not carry a reviewer, a model call, or an execution"* (`09_…:103`). | It is stated as a hard architectural requirement by the package that owns it, and `G-DRIFT` is the **only** serve-time gate in the system (`09_…:461`, `:468`). Violating it here would violate it everywhere. |
| **Honesty about the degraded state** | High. | At a revalidation budget of zero, *quarantined-for-stale-verdict* is the state **every** citation would be in (`10_…:221`). An architecture sized for the exceptional case would be wrong on day one. |
| **Containment of the egress surface** | High. This is the only component in the system that talks to a party outside the operator's control. | An egress path that a serve request could trigger inline is a learner-latency dependency on a third party's uptime, and a corpus-walk risk (`10_…:105`). |
| **Not re-deciding the detection design** | High. It is `consumed` from NEU-890's SUB-10 (NEU-966). | `../00_method-and-provenance.md` §1.2 permits amendment only by routing it to the owner. |
| Cache freshness sophistication (TTL strategies, negative caching, warmers) | **Zero weight.** | There are 0 content units and 0 serve surfaces. Any such choice would be tuned against numbers that do not exist. |

**Why two components and not one.** The two halves have **opposite** properties on every axis that matters architecturally: one has external egress and the other must have none; one is off the latency path by requirement and the other is on it by definition; one performs an execution, which the serve path bars, and the other performs a keyed read, which is all the serve path admits. Modelling them as a single "drift service" would produce a component whose specification contradicts itself in four fields, and `SUB-4 (NEU-974)` could not place it or classify its trust boundary. **The split is what makes the serve-time rule enforceable by inspection**: a reviewer can check that the component on the latency path has an empty egress field, rather than checking that a combined component never happens to take its slow path.

**Why quarantine and not block.** `09_…:472` states it directly, and `10_…:233` carries it: a stale-or-absent verdict *"**quarantines** the unit … rather than blocking the learner's request."* Quarantine is the state for a verdict that is **not decidable now** (`09_…:90`); a drifted citation, by contrast, is a decided failure with an available repair, and blocks. This record consumes both dispositions verbatim.

## Rejected alternatives

| Alternative | Why it was rejected |
| --- | --- |
| **Compute the drift verdict on the serve path** — check the citation when the unit is served. The simplest design, and the one with no cache and no staleness. | Barred by `09_…:103`: a serve-time gate may not carry an execution, and a re-check **is** an execution (`09_…:472`). Concretely, it would put a third-party HTTP round trip on a learner's latency path and make the product's responsiveness a function of a source site's uptime. |
| **Fail the request when the verdict is stale or absent** — treat an unknown citation as unsafe and refuse to serve. | Contradicts the consumed rule at `09_…:472` and `10_…:233`, and at a revalidation budget of **zero** it is catastrophic rather than conservative: every citation is in that state (`10_…:221`), so the product would serve nothing at all. Quarantining the *unit* while completing the *request* keeps the failure proportional to what is actually unknown. |
| **Serve the unit anyway and log the staleness** — the availability-first reading. | `10_…:221` refuses it in as many words: *"a unit whose verdict has aged past the window and could not be re-checked does not serve as though it had passed."* A stale verdict is not a pass, and treating it as one converts an unknown miss rate into a silent pass on the learner's path. |
| **One combined "citation service"** with an internal fast path and a slow path. | The four-field contradiction above. It also destroys the property that makes the rule checkable: with one component, "no execution on the serve path" becomes a claim about runtime behaviour rather than a property visible in the specification. |
| **Have the cache refresh itself on read when a verdict is stale** — read-through caching, the ordinary pattern. | It reintroduces the execution on the latency path through the back door, which is precisely what `10_…:161` forecloses: *"the serve path **reads a verdict**, it does not **compute** one."* Named rather than silently dropped because read-through is the default reflex for anything called a cache. |
| **Let the producer fetch a source's problem list once and diff many citations locally** — by far the most efficient re-check strategy. | A corpus walk, prohibited under every branch (`10_…:105`), and a retention breach even if the list is discarded (`10_…:126`). Its efficiency *is* the reason the prohibition has to be restated at the component boundary rather than left to be inherited. |
| **Assign the verdict store's authority here.** | Out of scope by the charter's own split: this package states the requirement, and **`SUB-13 (NEU-987)`** assigns exactly one authority in `OUT-3`'s matrix. Assigning it here would pre-empt the matrix and create two owners for one state category. |

## Consequences

- **Committed:** an asynchronous component with third-party egress, and an internal read-only cache on the serve path. `SUB-4 (NEU-974)` places both; `SUB-13 (NEU-987)` assigns one authority to the verdict store.
- **Foreclosed:** any inline verification at serve time; read-through refresh; corpus-walk revalidation; any retention of a source's enumeration.
- **Made more expensive:** the serve path gains a dependency on state that something else must keep fresh, and the system gains a scheduling problem it does not yet have a mechanism for (`OI-S2-1`, owner `SUB-10 (NEU-984)`).
- **Accepted honestly:** at a `per_source_revalidation_budget` of 0, the normal operating state of every citation is *quarantined*. This record does not treat that as a defect to be engineered around; it is the corpus's actual state and the architecture is sized for it.
- **Migration path:** none is implied — no serve surface and no citation store exist.

## Evidence

- `../../C009-course-content-quality/09_enforceable-quality-system.md:103`, `:461`, `:468`–`:473` (NEU-890, compiled 2026-08-10) — the serve-time gate rule; exactly one serve-time gate; `G-DRIFT`'s cached-asynchronous admission and the quarantine disposition.
- `../../C009-course-content-quality/10_citation-drift-detection-and-revalidation.md` (NEU-890, compiled 2026-08-11) — `:52`–`:62` the five signals; `:68`–`:72` the residual clause and `retracted-input`; `:90`, `:96` the inherited access path; `:103`, `:105` one request, never a corpus walk; `:118` `verdict stale`; `:126` the single retained tuple; `:161` the cached-verdict rule; `:165` the 90-day window, declared not measured; `:180` the zero budget; `:221` stale is not fresh; `:229`–`:234` the detection-to-state table; `:318` `EQ-S10-9`.
- `../../C009-course-content-quality/03_problem-citation-verification-and-access-paths.md:52`, `:183` — the permitted stored field set, *"Never widened locally"*, and `CH-F5-1` unresolved at that cutoff.
- **Consumed, not derived:** the detection design, the window and the budget are NEU-890's SUB-10 (NEU-966)'s. This record adopts them and re-decides none.

## Revision trigger

**Any of these observable events reopens this record:**

1. **NEU-890's owner publishes an amendment to `09_…` §7.2 or `10_…` §5.1** — the two passages that make the cached-asynchronous form the only admissible one. The split in the decision sentence exists because of them.
2. **`CH-F5-1` resolves in the ledger** (`../C009-course-content-quality/03_…:183`) — the stored field set changes, and with it the state the producer reads and the signals `D3`–`D5` can compare against.
3. **`per_source_revalidation_budget` becomes non-zero for any source** — i.e. a source's rate limit is read and dated by the rights re-verification pass, so the budget is derivable above zero (`10_…:186`). The "every citation is quarantined" consequence above stops holding, and the component is then sized for a case that actually occurs.
