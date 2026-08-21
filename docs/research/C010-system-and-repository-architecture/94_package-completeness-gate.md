# 94 — Package Completeness Gate

**Location reserved by:** NEU-971 (SUB-1) · **Charter:** C010 (umbrella NEU-895) · **Opened:** 2026-08-21
**Model:** claude-opus-5[1m]
**Owner:** **NEU-986 (SUB-12)** — sole. No other sub-task writes here.

---

## Status: not runnable

**This gate is not runnable until the package is complete, and it is deliberately unanswered.**

SUB-1 reserved this location and nothing more. The gate checks the package against the charter's completeness checklist, and there is no honest way to answer an item about a document that has not been written. **An item answered early is an item answered about a package that no longer exists by the time the gate matters.**

## Why the location is reserved now rather than created later

So that **no sub-task invents another one.** Fifteen sibling sub-tasks read this directory off `origin/develop`; if the gate had no declared home, two of them could each create a plausible one — `95_completeness.md`, `gate.md`, `traceability/gate.md` — and the package would ship with two partial gates and no single answer. The filename is part of SUB-1's deliverable for the same reason the package path is.

`95`–`99` remain free for further package-level registers. See the README's numbering convention.

## What SUB-12 must do here

**Answer the charter's completeness checklist item by item, each with cited evidence.** Not a summary, not a percentage, not a pass mark — one answer per item, each pointing at the document, decision record or register entry that discharges it.

**An item that cannot be so answered is recorded as a cap in `91_caps-and-incomplete-scope.md` with a named owner — never marked passing.** That routing is the gate's whole point: the alternative to a cited answer is an owned admission, not a benefit of the doubt.

The gate reads, at minimum:

- `01_outcome-register.md` and the `traceability/` set — every one of `OUT-1` … `OUT-12` covered, every row's evidence resolving into `docs/research/` and **never** into `_local/` or `docs/wf-plans/`.
- `decision-records/` — every record carrying all six required sections, rejected alternatives included.
- `93_stand-in-assumption-register.md` — exactly five entries, four packages covered, zero entries missing a required field. **Closed**; a sixth entry is itself a gate failure.
- `90_open-items-and-provisional-register.md` — every entry with an owner and an **observable** resolving event.
- `91_caps-and-incomplete-scope.md` — every cap with a named owner; duplicates reconciled by SUB-12, **without renumbering**.
- `92_spike-register.md` — every record with a mandatory expiry, a justification against the "could this have been read instead?" test, an **observable-event** exit condition, and no artifact under `src/`; every uncertain-and-material claim resolving to a spike record or a cap, with the count of each reported.
- `02_findings-register.md` — both named findings present: the NEU-893 circularity (`F-S1-1`, filed by SUB-1) and the C003/NEU-850 decision-ownership collision with its settled disposition and any routed amendment (**SUB-12's own to file**).
- `NEU-985 (SUB-11)`'s mechanical audit results, consumed rather than re-run.

**`qa-execution:engine` is unconfigured** in this repository (`git, linear`). The gate records that as a genuine no-op — see `CAP-S1-3` — and **claims no QA pass**.

## What SUB-12 must not do here

- **Not** promote its own work to passing. A producing task does not grade its own artifact; the cold-read review `OUT-12` requires is by an independent reader working only from the published package.
- **Not** answer an item by citing `_local/` or `docs/wf-plans/`. A cold reader cannot open either.
- **Not** renumber anything while reconciling. Merging duplicates is reconciliation; renumbering breaks every citation written against the namespaced ids.
