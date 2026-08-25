# `94` — Caps and incomplete scope

**Charter:** C011 (umbrella NEU-893) · **Opened:** 2026-08-25 · **Verification cutoff:** `546ee90`, 2026-08-25
**Model:** claude-opus-5[1m]

Append-only. Each sub-task appends its own `### SUB-<n>` section. No sub-task reflows, renumbers, or
rewrites another sub-task's entries. On a merge conflict in this file, keep **both** sides.

A **cap** is what this package does **not** do, stated as a limit rather than a topic. It is
distinct from an open item (an unanswered question) and from a stand-in (an assumption the design
provisionally rests on).

## What this register records

| Field | What it records |
| --- | --- |
| **Id** | `CAP-S<n>-<k>` |
| **Cap** | What this package does not do, stated as a limit. |
| **Why it is capped** | The reason the limit exists. |
| **What it leaves unsupported** | The claim or capability a reader must not assume. |
| **Owner** | Who is accountable for the limit. |
| **What would lift it** | The observable change that removes the cap. |

---

### SUB-1

#### `CAP-S1-1` — This package carries no live production evidence

- **Id:** `CAP-S1-1`
- **Cap:** C011 contains **zero observations of the running production system**. No token claim set, no schema dump, no log sample, no row count, no metric. Every production fact in this package is derived from the repository at a stated cutoff, or cited from C010.
- **Why it is capped:** No production credential of any kind was available to the authoring environment, and the constraint forbids obtaining one by any route other than the registered exception, which requires a credential the authoring party does not hold. Fabricating, inferring or substituting an observation was not available — the brief forbids it and it would poison thirteen downstream sub-tasks.
- **What it leaves unsupported:** Any claim of the form *"in production, X is observed to be Y."* In particular a reader must **not** assume: that `sub` is absent on a real `client_credentials` token (believed, not observed — `OI-S1-1`); that a DCR principal carries or lacks a human-identifying `sub` (`OI-S1-3`); that the live schema matches `drizzle/` (`OI-S1-4`); that the two log tables do or do not hold learner-derived content (`OI-S1-5`, `OI-S1-6`); or that backups exist (`OI-S1-8`).
- **Owner:** The creator, as sole maintainer and sole operator of the production deployment.
- **What would lift it:** Any of `OI-S1-1` … `OI-S1-9` closing. The cap narrows with each and lifts entirely when all nine close.

#### `CAP-S1-2` — C011 is not registered in the citation-path CI gate

- **Id:** `CAP-S1-2`
- **Cap:** `scripts/check-citation-paths.ts` gates only `C010-system-and-repository-architecture`. C011 is **not** in its gated list, so this package's relative citations are not enforced by CI.
- **Why it is capped:** Registering a package in the gate is package-closure work. Gating an incomplete package would fail CI for every sub-task that lands a partially-cross-referenced chapter, and the gate's value is at closure, when every cross-reference has a target. SUB-1 is position 1 of 16.
- **What it leaves unsupported:** A reader must not infer from a green CI run that C011's citations resolve. **SUB-1's own files were written to the convention regardless** — a package-root file cites a package-root sibling bare, a `decision-records/` or `traceability/` file cites one with a single `../`, and source paths are written bare from any depth — and were checked locally against the same checker, but the enforcement is voluntary until the package is registered.
- **Owner:** **SUB-14 (NEU-1007)**, which owns the package's house-style assembly and closure.
- **What would lift it:** Adding `C011-safe-production-integration-and-learner-isolation` to the `GATED` list in `scripts/check-citation-paths.ts`, once the package's cross-references have targets. This is the one change outside `docs/research/` that closing C011 will require; it touches `scripts/`, not `src/` or `drizzle/`, so it stays inside the charter's no-source-change constraint.

---

**SUB-1 register totals at revision 1:** two caps, `CAP-S1-1` and `CAP-S1-2`, each with a named owner
and an observable lifting condition.

---

### SUB-2

#### `CAP-S2-1` — The identity rule is settled, but **no principal shape's population is confirmed**

- **Id:** `CAP-S2-1`
- **Cap:** This package states which claim becomes the learner key, how principal kind is determined, and what happens in every branch — and it confirms, for **zero** of the three principal shapes, which branch that shape actually takes in production. The rule is total; the population of each branch is unobserved.
- **Why it is capped:** SUB-1 obtained no token for any shape (`96_spike-register.md`, `SPK-S1-1` … `SPK-S1-3`, all `Result: not executed`), and no production credential of any kind exists in the authoring environment (`91_findings-register.md` § `F-S1-2`). SUB-2 has no independent route to one — the constraint forbids obtaining a credential by any route other than OUT-18's registered exception, which requires a credential the authoring party does not hold. **Deriving the rule anyway was the right response, not a workaround:** kind is determined by `sub` presence rather than by audience shape, so the rule is well-defined under every possible answer, and deferring it would have left nine downstream sub-tasks inheriting `payload.sub || azp`.
- **What it leaves unsupported:** Any claim of the form *"in production, principal shape X resolves to kind Y."* In particular a reader must **not** assume: that the CI smoke principal really carries no `sub` (believed from a code comment, not observed — `OI-S1-1`); that `claude-web` really yields a human `sub` (inferred from the flow's shape, not read from a token — `OI-S2-2`); that a DCR principal carries or lacks one (`OI-S1-3`); that any `dyn$` client exists in production at all (`OI-S2-3`); or that `sub` is stable, unique over time or opaque in format (`OI-S2-1`). **What it does support** is every statement about what the system *does* given a token, which is what OUT-1 and OUT-6 are discharged on.
- **Owner:** The creator, as sole maintainer and sole operator of the production deployment — the only party who can obtain a token for any shape.
- **What would lift it:** `OI-S1-1`, `OI-S2-2` and `OI-S1-3` closing — one per shape. The cap narrows with each; it lifts entirely when all three close. `OI-S2-2` lifts the most, because it covers the shape the production learner actually arrives on.

---

**SUB-2 register totals at revision 1:** one cap, `CAP-S2-1`, with a named owner and an observable
lifting condition. It is a **narrower restatement** of `CAP-S1-1` applied to this sub-task's own
output, not a second record of the same fact: `CAP-S1-1` caps the package's evidence base, while
this entry caps what the identity rule specifically may be read to establish.
