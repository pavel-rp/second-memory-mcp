# 02 — Findings Register

**Task:** NEU-971 (SUB-1) opens it · **Charter:** C010 (umbrella NEU-895) · **Opened:** 2026-08-21
**Model:** claude-opus-5[1m]
**Entries owned by:** each appending sub-task. **Consumer:** **NEU-896** (convergence).

---

## What belongs here

A **finding** is a fact about the programme's own shape that a later reader must know and would otherwise have to rediscover: a circularity, an ownership collision, a decision made in the wrong order, a gap between what a charter assumed and what the evidence shows.

A finding is **not** an open item (which has a resolving event and an owner who closes it), **not** a cap (which is an admission of a scope limit), and **not** a decision (which belongs in `decision-records/`). It is a **first-class record of something that is true about how this work happened**, published so that NEU-896 converges over a stated situation instead of rediscovering a contested one.

**A finding is recorded in its own right, not as an aside.** The charter is explicit about this for the two it names: the NEU-893 circularity and the C003/NEU-850 decision-ownership collision are each "recorded as a finding in its own right", carrying an id, not mentioned in passing inside a document about something else.

## Why this register is numbered `02` and not `9x`

It sits in the `00`–`89` per-sub-task range because SUB-1 owns and seeds it, but it behaves like a `90`-range shared register: **append-only, `F-S<n>-<k>` namespaced, keep both sides.** Read these rules, not the filename, for how to write into it. The README states the same exception.

## Append convention

> Each sub-task appends its own `### SUB-<n>` section. No sub-task reflows, renumbers, or rewrites another sub-task's entries. On a merge conflict in this file, keep **both** sides.

**Do not tidy duplicates in flight.** Two sub-tasks independently finding the same thing is evidence that it is visible from two directions; collapsing it early throws that away.

## Id namespacing (there is no global counter in this file)

Ids are **`F-S<n>-<k>`**, where `<n>` is the sub-task number and `<k>` restarts at `1` inside that sub-task's own section. SUB-12 allocates `F-S12-1`, `F-S12-2`, … concurrently with SUB-4's `F-S4-1`, without coordination and without collision. Cite a finding in its full form (`F-S1-1`), never as a bare `F-1`.

## Stable field set (the same fields on every entry, in this order)

| Field | What it records |
| --- | --- |
| **Id** | `F-S<n>-<k>` |
| **Finding** | The fact, stated as a fact. |
| **Evidence** | What establishes it — a real path, an upstream package with its version or date, or a tracker record with its read date. |
| **Consequence** | What is weaker, riskier or differently-shaped because this is true. |
| **What is assumed rather than derived** | Where the finding is about an inverted dependency, the specific inputs that were assumed, each cited by id. |
| **Handed to** | Who must act on it, and what they receive. |

---

## Entries

### SUB-1

*One entry. `F-S1-1` is the circularity the charter required to be published as a finding in its own right. The C003/NEU-850 decision-ownership collision is the other named finding this charter requires; it is **SUB-12 (NEU-986)**'s to file, together with its settled disposition, and it is deliberately not pre-filed here.*

#### `F-S1-1` — This package ran ahead of NEU-893, and the dependency between them is circular

- **Id:** `F-S1-1`
- **Finding:** **C005's OUT-9** (NEU-893, safe production integration and learner isolation) presupposes an application architecture, and **C005's OUT-8** — this package — needs the ownership model that NEU-893 would settle. The dependency runs both ways, so one of the two had to proceed on assumptions, and **it is this one.** NEU-893 is Backlog and unbuilt at this package's cutoff.

  *(Both ids in that sentence are **program-level C005 outcomes**, not this package's own `OUT-8`/`OUT-9`. See `00_method-and-provenance.md` §2.5 — a bare `OUT-n` in this package always means an entry in `01_outcome-register.md`.)*

- **Evidence:** The C010 charter records the circularity as a confirmed decision of its intake, sourced to the intake's first question and to a host finding. NEU-891, NEU-892, NEU-893 and NEU-894 were all Backlog and unstarted at the 2026-08-19 tracker read. The choice to proceed rather than block was made deliberately and recorded, not defaulted into.

- **Consequence:** Every decision in this package that touches learner isolation, the production deployment or the data-store topology rests on assumptions about NEU-893's output rather than on NEU-893's output. Those decisions are **not** thereby wrong — they are bounded by a stated tolerance envelope and carry a named invalidating outcome — but they are **assumed, not derived**, and NEU-893 must be chartered knowing which ones.

  The affected outcomes are `OUT-3` (the authority matrix), `OUT-4` (the isolation invariant and the NEU-893 disjointness contract) and `OUT-8` (the deployment-shape and data-store-topology selections).

- **What is assumed rather than derived:**

  | Input | Id | Status |
  | --- | --- | --- |
  | Learner isolation will be enforced **server-side at or below the port boundary** | `A-28` | **assumed** — `[unconfirmed]` stand-in |
  | The **existing production deployment continues to back the product** | `A-28` | **assumed** — `[unconfirmed]` stand-in |
  | A **backward-compatible migration path for existing global rows** exists | `A-28` | **assumed** — `[unconfirmed]` stand-in |
  | The authenticated subject a production token yields is a **human learner** rather than an OAuth client | `OI-S1-2` | **unverified** — no live token has been inspected |

  **And, equally important, what is *not* assumed:** learner-ownership **placement** is **consumed** from **NEU-850's** OUT-2 (`user_id` NOT NULL on every core table, keyed to the JWT subject, threaded through the 9 row-owning repository ports) with its source cited — it is a decision to honour, not a guess, and NEU-850 is converged though unimplemented. Likewise the deployment facts (single self-hosted VPS, unversioned compose stack outside the repository, no Dockerfile, no IaC, no rollback, automatic migration on boot, process-local in-memory state) are **confirmed against the repository**, not assumed from NEU-893.

  **The circularity is therefore narrower than it first appears**, and stating its exact boundary is the point of this record: three clauses of one stand-in plus one unverified transport fact — not the whole isolation question.

- **Handed to:**
  - **NEU-893**, which is chartered knowing exactly which of this package's inputs were assumed rather than derived — the four rows above — and which receives `OUT-4`'s two-list disjointness contract naming what this package closed and what it handed on.
  - **NEU-896**, which receives this finding alongside `93_stand-in-assumption-register.md`, so convergence reconciles a **stated** inversion rather than rediscovering it. The second named finding NEU-896 expects — the C003/NEU-850 decision-ownership collision with its settled disposition and any routed amendment — arrives from **SUB-12 (NEU-986)**.

---

<!--
Later sub-tasks: append your own `### SUB-<n>` section BELOW this comment. Do not edit any
section above your own. On conflict, keep both sides.
-->
