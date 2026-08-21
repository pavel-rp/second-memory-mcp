# 93 — Stand-in Assumption Register (`A-25` … `A-29`)

**Task:** NEU-971 (SUB-1) · **Charter:** C010 (umbrella NEU-895) · **Compiled:** 2026-08-21
**Model:** claude-opus-5[1m]
**Owner:** SUB-1 (NEU-971) · **Consumer:** **NEU-896** (convergence)

---

## This register is CLOSED, not append-only

**It holds exactly five entries — `A-25` … `A-29` — and no sub-task adds a sixth.**

This is the one register in the package that does not grow. Every other shared register here (`90_…`, `91_…`, `92_…`, `02_…`) is append-only and expects sixteen sub-tasks to write into it. This one is closed on purpose, and the purpose is its consumer: **NEU-896 receives this file as its reconciliation list.** A list of five things that must be re-checked when four named packages land is actionable. A list of forty things, most of them unrelated to those four packages, is an uncertainty dump that NEU-896 has to triage before it can start — which is exactly the work this register exists to have already done.

## The admission rule

An entry belongs in this register **if and only if** it stands in for one of the four unbuilt upstream packages:

- **NEU-891** — tutoring
- **NEU-892** — UI
- **NEU-893** — production integration and learner isolation
- **NEU-894** — chat handoff

**Nothing else enters this register.** Not an uncertainty about this repository. Not an uncertainty about an upstream package that *is* built. Not an uncertainty about hosting, or tooling, or a decision this package has simply not made yet. Those are real and they are recorded — elsewhere.

### Routing for a rejected candidate

A candidate that fails the admission rule is **rejected from this register and routed**, never quietly filed here anyway:

| The candidate is… | It goes to | Its id shape |
| --- | --- | --- |
| `[unconfirmed]`, material, and expected to resolve — but not by one of the four packages landing | `90_open-items-and-provisional-register.md` | `OI-S<n>-<k>` |
| Something this package will **not** resolve at all, and says so honestly | `91_caps-and-incomplete-scope.md` | `CAP-S<n>-<k>` |
| Uncertain, material, and answerable by a bounded experiment | `92_spike-register.md` | `SPK-S<n>-<k>` |
| A fact about the programme's own shape worth recording as a named record | `02_findings-register.md` | `F-S<n>-<k>` |

**A sub-task that believes it has found a sixth stand-in has almost certainly found an open item.** If it genuinely has not — if it has found an architecture decision resting on an unbuilt one of the four that `A-25` … `A-29` do not already cover — that is a **charter-level gap**, and the route is a finding in `02_findings-register.md` naming the gap, plus a cap in `91_…`. It is not a sixth row added here, because a sixth row silently changes the contract NEU-896 was handed.

## Required field set (all five, on every entry — zero exceptions)

Every entry below carries all of these. An entry missing any one of them fails `OUT-11`'s completeness audit:

| # | Literal label | What it records |
| --- | --- | --- |
| 1 | `**Status:**` | Always `[unconfirmed]`. Nothing in this register is confirmed; that is what makes it this register. |
| 2 | `**Stands in for:**` | Exactly one of NEU-891 / NEU-892 / NEU-893 / NEU-894. |
| 3 | `**Tolerance envelope:**` | The range of outcomes the architecture tolerates without being invalidated. |
| 4 | `**Invalidating outcome:**` | The specific, named outcome that breaks the decisions resting on this entry. |
| 5 | `**Re-validation trigger:**` | The **observable event** that fires the re-check — never a date, never a party's satisfaction. |

**The labels are literal, and the exact strings above are load-bearing.** `NEU-985 (SUB-11)` audits this register mechanically by counting label occurrences against the entry count; a label written as `**Tolerance envelope.**` or `**Envelope:**` is invisible to that count and reads as a missing field. Each entry additionally carries an `**Assumption:**` field stating the claim itself.

**Citing an entry.** A decision resting on one of these **names it in the decision**, in the sentence — `…tolerable under A-27…` — not only in an appendix or a summary table. `OUT-11`'s decision-level check looks for exactly that.

**Provenance of the five.** These are the charter's numbered assumptions 25–29, restated with their numbers preserved. The numbers are **not** re-based to `A-1` … `A-5`: re-basing would silently break every cross-reference written against the charter's numbering, and the gap below `A-25` is the intended signal that these five are a slice of a larger numbered set rather than a fresh sequence. Where an entry's charter wording left a required field implicit, the field is filled here and **marked as derived by SUB-1**, never presented as charter text.

---

## `A-25` — Tutoring needs per-learner interaction state on the learner path

**Status:** `[unconfirmed]`
**Stands in for:** **NEU-891** (tutoring). Program-level source: **C005's OUT-5**, unbuilt.

**Assumption:** Adaptive hinting needs per-learner, per-node interaction state, with sub-second read latency on the learner's path, and at least one AI provider call per hint escalation.

**Tolerance envelope:** The architecture tolerates any hint model in which the AI call is made **outside a gate-bearing write path** — synchronous on a read path, asynchronous anywhere, or batched ahead of time. It tolerates hint state being learner-scoped and node-scoped at any granularity, and it tolerates any number of escalation levels. It tolerates the hint store being a new category with its own authority under `OUT-3`, or an extension of an existing one.

**Invalidating outcome:** A hint model requiring **synchronous multi-turn AI orchestration inside a gate-bearing write path** — because that puts a variable-latency external dependency inside the transaction that decides mastery, which no authority assignment in `OUT-3` can make safe without changing the boundary `OUT-1` draws.

**Re-validation trigger:** **NEU-891 lands** — its package is published under `docs/research/`. On that event, every decision citing `A-25` is re-checked against the envelope above, and the result is recorded.

---

## `A-26` — No AI latency, privacy or cost budget exists yet

**Status:** `[unconfirmed]`
**Stands in for:** **NEU-891** (AI budgets). Program-level source: C005 routes these budgets to **C005's OUT-5**, which is unbuilt; the charter's intake recorded them as deferred.

**Assumption:** **No latency, privacy or cost budget for AI orchestration exists.** This entry deliberately does **not** assume one. The architecture states the envelope it tolerates and names the outcome that would invalidate its AI-placement decision, rather than inventing a budget and presenting it as grounded.

**Tolerance envelope:** The `OUT-8` AI-orchestration placement tolerates any budget under which (a) at least one AI provider call may be made **server-side**, from our infrastructure, with learner-derived content in the request; (b) AI work may be moved **off** the learner's synchronous path without changing which component owns it; and (c) cost is bounded per call rather than per learner-session, so an escalation is priced by the call. Within that envelope the placement decision is unchanged whatever the numbers turn out to be.

**Invalidating outcome:** *(Field derived by SUB-1 — the charter states the obligation to name one but leaves the naming to this package.)* A budget under which **learner-derived content may not leave our infrastructure at all**, or under which **no AI provider call may be made server-side on any path**. Either forces AI orchestration out of the placement `OUT-8` selects and into a component — on-device, or a separately-governed processor — that `OUT-1` does not currently draw a boundary for.

**Re-validation trigger:** **NEU-891 lands** and publishes budgets. On that event the stated envelope is compared against the published numbers and the `OUT-8` AI-placement decision is re-checked.

---

## `A-27` — The UI is a rich authenticated web surface whose state is not gate-bearing

**Status:** `[unconfirmed]`
**Stands in for:** **NEU-892** (UI). Program-level source: **C005's OUT-6**, unbuilt.

**Assumption:** A rich, stateful, authenticated learner-facing web surface, with interaction state that is *not* gate-bearing — **no mastery gate depends on browser-held state**.

**Tolerance envelope:** The architecture tolerates any rendering model — server-rendered, client-rendered, or a mix — because `OUT-1` states the browser-trust property as one that must hold under **every** rendering model, and *which* surface renders where is `OUT-8`'s decision. It tolerates arbitrarily rich client-side interaction state, arbitrary client-side caching of read data, and optimistic UI, **provided the server re-evaluates every gate from server-held state**.

**Invalidating outcome:** A UI direction requiring **offline-capable or client-authoritative learning state** — because that makes the browser an authority for a state category under `OUT-3`, which contradicts the trust property `OUT-1` asserts and the isolation invariant `OUT-4` states.

**Re-validation trigger:** **NEU-892 lands** — its package is published under `docs/research/`. On that event, the browser-trust property in `OUT-1` and the rendering-model decision in `OUT-8` are both re-checked against the published direction.

---

## `A-28` — Isolation is enforceable server-side on the existing deployment

**Status:** `[unconfirmed]`
**Stands in for:** **NEU-893** (production integration and learner isolation). Program-level source: **C005's OUT-9**, unbuilt. **See also `F-S1-1`** in `02_findings-register.md` — the circularity that makes this entry necessary.

**Assumption:** Learner isolation will be enforced **server-side at or below the port boundary**; the **existing production deployment continues to back the product**; and a **backward-compatible migration path for existing global rows** exists.

**Tolerance envelope:** The architecture tolerates isolation enforced at the repository-port layer, in the database schema (row-level or predicate-based), or at both. It tolerates the migration being staged, reversible, or run in a single step. It tolerates existing global rows being backfilled to a single owner, quarantined, or archived. It tolerates the production Postgres being shared with a new web tier or fronted by one, since `OUT-8` decides data-store topology within this envelope.

**Invalidating outcome:** A finding that **safe isolation requires a separate deployment or a separate datastore** — because that relocates the authority assignments `OUT-3` makes and the boundary `OUT-1` draws between the web tier and the MCP core, and it invalidates the deployment-shape decision in `OUT-8`.

**Re-validation trigger:** **NEU-893 lands** — its package is published under `docs/research/`. On that event the `OUT-4` disjointness contract is re-checked for gaps and overlaps against what NEU-893 actually decided, and every decision citing `A-28` is re-checked against the envelope.

---

## `A-29` — Handoff is a bounded, expiring, revocable authorization envelope

**Status:** `[unconfirmed]`
**Stands in for:** **NEU-894** (chat handoff). Program-level source: **C005's OUT-7**, unbuilt.

**Assumption:** Course-to-chat handoff needs a **bounded, expiring, revocable authorization and context envelope** crossing the trust boundary to an external MCP client, and **no continuous bidirectional state sync**.

**Tolerance envelope:** The architecture tolerates any envelope shape — a token, a scoped grant, a signed context blob — and any lifetime, provided it **expires** and can be **revoked**. It tolerates the external client reading any state category the envelope's scope permits, at any freshness. It tolerates one-way push of context at handoff time, and it tolerates the external client writing back through an existing gated MCP tool under its own authorization.

**Invalidating outcome:** A handoff design requiring the **external client to hold write authority over any state category** — because `OUT-3` gives each category exactly one authority, and an external client holding write authority puts a component outside our trust boundary inside the authority matrix, which no isolation invariant under `OUT-4` can then enforce.

**Re-validation trigger:** **NEU-894 lands** — its package is published under `docs/research/`. On that event the trust boundary in `OUT-1` and the authority matrix in `OUT-3` are both re-checked against the published handoff design.

---

## Register close-out

**Entries: 5.** `A-25`, `A-26`, `A-27`, `A-28`, `A-29`.
**Packages covered: 4.** NEU-891 (`A-25`, `A-26`), NEU-892 (`A-27`), NEU-893 (`A-28`), NEU-894 (`A-29`).
**Entries missing a required field: 0.**

This register is complete as of SUB-1 and is **closed**. `NEU-985 (SUB-11)` audits it for the counts above; `NEU-986 (SUB-12)` answers the completeness gate against it; **NEU-896** consumes it as the reconciliation list.
