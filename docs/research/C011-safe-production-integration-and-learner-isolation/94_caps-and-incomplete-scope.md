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

### SUB-15

#### `CAP-S15-1` — Every objective in this package is modelled, none is measured

- **Id:** `CAP-S15-1`
- **Cap:** The objective set in `15_operational-objectives-for-the-real-platform.md` contains **zero numbers observed from the running production system**. Every capacity, latency, availability and failure figure is read out of this repository's shipped constants at cutoff `86fb38a`, computed from this repository's own git history, or cited from C010's own measured micro-benchmark. **No load test was run, no production metric was read, and no restart was timed.**
- **Why it is capped:** No production credential of any kind is available — `DATABASE_URL`, `SMOKE_PROD_*`, `AUTH_*` and `VPS_*` were re-probed at this cutoff and are all unset, independently reproducing SUB-1's `F-S1-2`. Load-testing the production instance would in any case be a mutation of the running system, outside the read-only constraint and outside the single registered exception. Fabricating a plausible figure was not available: it would poison SUB-7's rollout gating and SUB-9's lifecycle work, and it is the precise failure mode charter assumption 49 forbids.
- **What it leaves unsupported:** Any claim of the form *"the deployment is measured to sustain X."* In particular a reader must **not** quote: an availability percentage (`OBJ-8` states what each target would *require*, not what is achieved); a single concurrent-learner capacity figure (the honest answer is the band **2–200**, and the band is the finding); a concurrent-load latency figure (`OBJ-5` is `[unconfirmed]`); an entry-count threshold for the session-map leak (`OI-S15-4`); or an RPO or an RTO (`F-S15-1`).
- **Owner:** The creator, as sole maintainer and sole operator of the production deployment.
- **What would lift it:** Any of `OI-S15-1` … `OI-S15-4` closing narrows the cap; `OI-S15-3` narrows it most, since it collapses the two-order-of-magnitude capacity band to a value. The cap lifts entirely only when all four close **and** a load observation is taken against the real deployment — which is work no sub-task in this package is authorized to do.

---

**SUB-15 register totals at revision 1:** one cap, `CAP-S15-1`, with a named owner and an observable
lifting condition. It is the objective-specific form of SUB-1's package-wide `CAP-S1-1` and cites it
rather than restating it.
