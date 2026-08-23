# `DR-C10-S15-4` — Server-composed rendering on every gate-bearing read, decided on the serve path's ordinary operating mode rather than on the trust property

**Task:** NEU-982 (SUB-15) · **Charter:** C010 (umbrella NEU-895) · **Decided:** 2026-08-22 · **Verification cutoff:** `229e8f4`, 2026-08-22
**Model:** claude-opus-5[1m]
**Discharges:** part of `OUT-8` (`../01_outcome-register.md`) — the rendering model, published as `../13_architecture-material-rule-and-web-tier-decisions.md` §8.

---

## Decision

**The learner-facing surface is server-rendered and server-composed on every gate-bearing read.
Client-side enhancement is permitted and expected, confined to interaction state that is not
gate-bearing.**

Concretely, which surfaces render where:

- **Each of the eleven read-projections is composed on the server** for the render that displays it.
- **Each of the five write-intents is submitted as an intent**, and its outcome is re-rendered from
  the server's response — never applied locally as an authoritative mutation.
- **Interaction state that is nobody's authority lives in the browser**: scroll, focus, draft text,
  expand/collapse, and optimistic *display* of an intent the server has already accepted.

**This decision rests on stand-in assumption `A-27`** — a rich, stateful, authenticated learner-facing
web surface whose interaction state is not gate-bearing — which is `[unconfirmed]` and stands in for
**NEU-892**, unbuilt. Its **tolerance envelope** admits *"any rendering model — server-rendered,
client-rendered, or a mix"* together with *"arbitrarily rich client-side interaction state, arbitrary
client-side caching of read data, and optimistic UI, **provided the server re-evaluates every gate
from server-held state**"*; its **invalidating outcome** is *"a UI direction requiring offline-capable
or client-authoritative learning state"*; its **re-validation trigger** is NEU-892 landing. The
selection above sits inside that envelope, and §Consequences records what happens if it is
invalidated.

---

## Rationale

### The criteria, and their weights, fixed before any rendering model was scored

| # | Criterion | Weight |
| --- | --- | --- |
| **D1** | The content path must apply the serve-time quarantine disposition **on every serve**, because that disposition changes in the ordinary case. | **decisive** |
| **D2** | The argument must be **independent of the browser trust property**, which `../05_…md` §6.3 **R-5** forbids citing for or against any rendering model. | **decisive** (a constraint on the reasoning, not on the outcome) |
| **D3** | The model must sit inside `A-27`'s tolerance envelope, and must not require what `A-27` names as its invalidating outcome. | high |
| **D4** | The model must satisfy the four forced constraints `../05_…md` §6.3 hands over as inputs (`R-1`…`R-4`). | high |
| **D5** | It should use, rather than spend, the freedom the envelope grants — `A-27` describes a *rich, stateful* surface. | medium |

### D2 first, because it shapes everything else

`../05_…md` §6.3 **R-5** states: *"The trust property must not be cited as an argument for or against
any rendering model. It is satisfied by all of them."* And §6.2 closes: *"This document therefore
states no preference between rendering models, and nothing above may be cited as an argument for
one."*

**So the obvious argument is unavailable.** "Server-rendered because the browser must not hold
gate-bearing state" is exactly the reasoning R-5 forbids, and it would in any case prove nothing —
the property holds under every rendering model, which is why it cannot select among them. SUB-4
supplied the property; this record must supply the **selection**, on independent evidence. That is
the whole difficulty of this decision and the reason the criteria are ordered as they are.

### D1 — the independent evidence that decides it

`DR-C10-S4-3` decides that the full gate battery runs at authoring time and **exactly one gate sits at
serve time**: `CMP-S4-16` performs *one keyed read* of `CMP-S4-18` and applies a four-row disposition
— quarantine on `blocked`, on `quarantined`, on a **stale** verdict and on an **absent** verdict;
serve otherwise. And, decisively:

> **Stale-or-absent is the serve path's ordinary operating mode**, not its exceptional one, because
> the per-source revalidation budget is zero. A serve path that is only correct when a fresh verdict
> exists is mis-built.

That is a statement about **content disposition changing between one serve and the next, in the normal
case**. It is a property of the serve path's operating mode, not of the browser's trustworthiness, so
citing it does not breach R-5.

The consequence for rendering is direct. A model that composes content once and re-renders it from a
durable client-side copy will display a unit under a disposition that may since have changed, and it
has **no way to find out**: the disposition belongs to `CMP-S4-16`, applied at serve, and
**`R-4`** forbids the browser reading `CMP-S4-18` directly.

**Therefore the content path must be composed server-side, per serve.** That conclusion follows from
`DR-C10-S4-3`'s operating mode plus `R-4`, and from neither the trust property nor `R-5`'s forbidden
premise.

### D5 — why the remaining freedom is used rather than spent

Once the content path is server-composed, everything else is free, and the temptation is to spend that
freedom on strictness — to forbid client-side state entirely. **`A-27` argues against it.** The
assumption describes a *rich, stateful* surface, and its envelope explicitly tolerates *"arbitrarily
rich client-side interaction state"* and *"optimistic UI"*, on the sole proviso that the server
re-evaluates every gate from server-held state — which this model does by construction. Forbidding
enhancement would cost interactivity and buy nothing any published constraint asks for.

---

## Rejected alternatives

| # | Alternative | Why it lost |
| --- | --- | --- |
| **1** | **Client-rendered SPA holding a durable client-side store of learner state** | **Fails D1.** Content composed once and re-rendered from a client-held copy can display a unit whose quarantine disposition has since changed, and **`R-4`** forbids the browser checking. Also fails **D3** via **`R-2`**, which makes any client-held copy a cache with **no authority**. **Explicitly not rejected on the trust property** — that rejection was available and is forbidden by **R-5**, so it is not used. |
| **2** | **Offline-capable / local-first learner surface** | **Fails D3 at its cheapest.** This is `A-27`'s **named invalidating outcome** — *"a UI direction requiring offline-capable or client-authoritative learning state"* — restated at `../05_…md` §6.3 **R-3** as outside the envelope. Recorded as settled by a published constraint rather than by analysis here; dressing it up as a considered trade would misrepresent how little work it took. |
| **3** | **Fully server-rendered with no client-side enhancement — a full page composition per interaction** | **The genuine competitor on the other side**, and the one a naive reading of D1 lands on. **Fails D5.** `A-27` describes a rich, stateful surface and tolerates arbitrarily rich client-side interaction state and optimistic UI. Since the server re-evaluates every gate either way, forbidding enhancement costs interactivity and buys nothing the envelope requires. Decisive criterion: **no constraint in the package asks for it.** |
| **4** | **A mixed model in which the browser reads the drift-verdict cache and decides display** | **Not this record's rejection to claim, and it is listed so a reader does not think it was overlooked.** `DR-C10-S4-3` already rejected it — *"The quarantine decision is gate-bearing, so this violates `../05_…` §6.1 and the R-4 constraint handed to SUB-15 (NEU-982)"* — and `../05_…md` §6.3 hands it here as constraint **R-4**. It is **consumed, not re-decided**. |
| **5** | **Let SUB-4's narration settle it** — read `../05_…md` §6 as having already chosen server rendering | Rejected because `../05_…md` says the opposite of what such a reading assumes. §6.2 closes *"This document therefore states no preference between rendering models"*, §12 lists the rendering model as something it does not decide, and §13's own verification note checks that every rendering mention sits in the "satisfied by all of them" argument or the handed-to-SUB-15 list, *"none in a decision"*. Treating the trust property as having chosen would have produced an unargued selection and breached **R-5**. |

---

## Consequences

1. **Every gate-bearing read is a server round trip**, by construction of the published component
   model: `../05_…md` §6.2 point 3 records every gate evaluator behind `BND-S4-2`, *"None of them is
   reachable from the browser except as a request"*. **This was established by reading, not measured**
   — the spike candidate that would have measured it was withdrawn under the *"could this have been
   read instead?"* test (`../92_spike-register.md`, SUB-15 section).
2. **What that round trip costs is not settled here.** `SPK-S6-1` measured the MCP tool boundary at
   **≤0.02% of the sub-second budget `A-25` predicates** — cited by id, **inheriting its expiry of
   2027-08-21** — but its own residual records that the harness used `InMemoryTransport`, so **no
   network hop is included**; the figure is a **floor, not a prediction**. The real cost depends on the
   deployment shape, which is **SUB-10 (NEU-984)**'s. Recorded as **`CAP-S15-1`** (owner SUB-10) and as
   **`F-S15-2`**, because a consumer citing 0.02% as a deployment round-trip cost is over-reading it.
3. **`R-1`…`R-4` are all satisfied**, and none of them is used as the *selecting* argument: `R-1` — no
   gate is evaluated in the browser; `R-2` — client state is display-only and holds no authority;
   `R-3` — the surface is not offline-capable; `R-4` — the browser never reads `CMP-S4-18`.
4. **`R-5` is honoured.** The trust property appears in this record only as a consumed constraint and
   never as a premise of the selection. `13_…md` §11.3 records the check.
5. **This decision, and the two it interacts with, go stale together if `A-27` is invalidated.** If
   NEU-892 lands requiring offline-capable or client-authoritative learning state, `A-27`'s named
   invalidating outcome fires and all three of this chapter's decisions need re-deciding, not
   patching. Recorded as **`CAP-S15-2`**, owner NEU-896.
6. **No boundary moves.** `BND-S4-1` remains a trust boundary between `CMP-S4-1` and `CMP-S4-3` under
   this model exactly as under any other — which is `../05_…md` §6.2's point 1, consumed.

---

## The two dependencies this decision carries

Recorded here because this is the decision they constrain — `13_…md` §8.5 carries the same statement
in the chapter body.

- **From `DR-C10-S15-2` (runtime → rendering model).** Server-side composition in the same language as
  the tool schemas means the eleven composed projections are typed end-to-end from tool response to
  rendered output. A foreign-language web tier would re-express all eleven projection shapes at the
  composition boundary — the same re-expression cost `DR-C10-S15-2` identified at the contract, paid a
  second time at render.
- **From `DR-C10-S15-3` (protocol style → rendering model).** Named-intent writes map one-to-one onto
  learner actions, which is what makes the confinement of client state coherent: the browser **submits
  an intent** rather than applying a mutation locally, so optimistic display is a display concern and
  never an authority claim — exactly the line **`R-2`** draws. Under a verb-mutation write surface the
  same optimism would be much harder to keep on the safe side of that line.

---

## Evidence

| Claim | Source |
| --- | --- |
| Exactly one gate at serve time; the four-row disposition; **stale-or-absent is the ordinary mode** | `DR-C10-S4-3`; `../05_…md` §7.2–§7.3 |
| `R-1`…`R-5`, the five constraints handed to SUB-15 as inputs | `../05_…md` §6.3 |
| `../05_…md` states no preference between rendering models and decides none | `../05_…md` §6.2, §12, §13 |
| Every gate evaluator sits behind `BND-S4-2`; none reachable from the browser except as a request | `../05_…md` §6.2 point 3 |
| `BND-S4-1` is a trust boundary under every rendering model | `../05_…md` §6.2 point 1, §4.2 |
| `A-27`'s statement, tolerance envelope, invalidating outcome and re-validation trigger | `../93_…md` `A-27` (`[unconfirmed]`, stands in for NEU-892) |
| MCP tool-boundary overhead ≤0.02% of the `A-25` budget, `InMemoryTransport`, no network hop | `SPK-S6-1` (`../92_…md`), expiry 2027-08-21 |
| The eleven read-projections and five write-intents this model renders | `../11_…md` §9.1, §9.2 |
| The browser holds `SC-S3-43`, explicitly not gate-bearing | `../04_…md`; `../05_…md` §6.2 point 2 |

---

## Revision trigger

1. **NEU-892 lands.** `A-27`'s re-validation trigger fires and this record is re-checked against the
   published UI direction. If that direction requires offline-capable or client-authoritative learning
   state, the invalidating outcome fires and this decision is re-decided (`CAP-S15-2`).
2. **`DR-C10-S4-3` is revised such that stale-or-absent is no longer the serve path's ordinary mode**
   — for instance if a non-zero per-source revalidation budget is established. D1 is the decisive
   criterion, so a change there re-opens the decision directly.
3. **The per-serve quarantine disposition moves off the serve path**, or `CMP-S4-18`'s read is
   relocated — the mechanism at D1 no longer applies.
4. **`CAP-S15-1` is discharged by SUB-10 (NEU-984)** with a measured deployment round-trip cost that
   does not fit `A-25`'s sub-second budget — the model stands, but its cost profile becomes a live
   constraint on how many gate-bearing reads a single learner interaction may make, which this record
   does not currently bound.
5. **`SPK-S6-1` expires (2027-08-21) without re-run** — Consequence 2's citation goes stale, and this
   record's statement about round-trip cost must be re-labelled, per `../92_…md` §6.
