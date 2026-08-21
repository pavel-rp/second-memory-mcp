# 91 — Caps and Incomplete Scope

**Task:** NEU-971 (SUB-1) opens it · **Charter:** C010 (umbrella NEU-895) · **Opened:** 2026-08-21
**Model:** claude-opus-5[1m]
**Entries owned by:** each appending sub-task. **Reconciled by a single named owner:** **NEU-986 (SUB-12)**.

---

## What belongs here

Every **cap** — a place where this package's scope stops short, stated honestly — and every statement of incomplete scope.

**A cap is an admission that there is no resolving event.** That is what separates it from an open item:

| | Has a resolving event | Named owner | Register |
| --- | --- | --- | --- |
| **Open item** | yes — an observable event closes it | yes | `90_open-items-and-provisional-register.md` |
| **Cap** | **no** — this package will not close it | **yes, always** | this file |

**Every cap carries a named owner.** "The package", "a later charter" and "whoever picks this up" are not owners. A cap with no owner is an orphaned gap wearing a label, and it is the failure mode this register exists to prevent.

**A cap is available only where a spike is infeasible.** If a bounded experiment would settle the claim, run the spike (`92_spike-register.md` §2) — a cap is not the cheap way out of an experiment.

**Recording a cap is not a way to mark a completeness-gate item as passing.** `94_package-completeness-gate.md` answers each item with cited evidence; an item that cannot be so answered is **recorded as a cap here rather than marked passing**. The two are alternatives, not a formality and its escape hatch.

## The single reconciling owner

**NEU-986 (SUB-12) is the declared single owner that reconciles this register at the end.** It merges duplicate entries, resolves cross-references, and publishes the reconciled register alongside `94_package-completeness-gate.md`.

Until SUB-12 runs, **a duplicate entry is correct-by-convention**, and any other sub-task that "tidies" one is destroying evidence rather than helping. Two sub-tasks independently capping the same gap is *signal* — it says the gap is visible from two directions — and collapsing it early throws that away.

Naming one owner is deliberate: a register that everyone reconciles is a register nobody reconciles.

## Append convention

> Each sub-task appends its own `### SUB-<n>` section. No sub-task reflows, renumbers, or rewrites another sub-task's entries. On a merge conflict in this file, keep **both** sides.

**Keep both sides is not a suggestion.** The default conflict resolution — pick one side — silently deletes a sibling's cap, and a silently deleted cap is the worst artifact this package can produce: the completeness gate then reads as passing over a gap that nobody owns and nobody can see. A visible duplicate is the intended failure mode, and SUB-12 is the declared owner that cleans it up once, at the end.

## Id namespacing (there is no global counter in this file)

Ids are **`CAP-S<n>-<k>`**, where `<n>` is the sub-task number and `<k>` restarts at `1` inside that sub-task's own section. SUB-3 allocates `CAP-S3-1`, `CAP-S3-2`, …; SUB-12 allocates `CAP-S12-1`, … — concurrently, without coordination, and without collision.

**No global counter exists here, and SUB-12's reconciliation does not introduce one.** Reconciling means merging duplicates and resolving cross-references; it does **not** mean renumbering into a single sequence. Renumbering would break every citation already written against the namespaced ids, which is precisely what the namespacing was adopted to prevent. Cite a cap in its full form (`CAP-S12-1`), never as a bare `CAP-1`.

## Stable field set (the same fields on every entry, in this order)

Entries are written as **blocks rather than table rows** — a table row carrying long cells is a single line, so two sub-tasks appending rows conflict on adjacent lines, while two sub-tasks appending whole sections do not overlap at all.

| Field | What it records |
| --- | --- |
| **Id** | `CAP-S<n>-<k>` |
| **Cap** | What this package does **not** do, stated as a limit rather than a topic. |
| **Why it is capped** | Why no experiment, no reading and no available party settles it here. |
| **What it leaves unsupported** | The decision, outcome or claim that is weaker because of this cap — named, so the cost is visible. |
| **Owner** | The named party accountable. Never "the package". |
| **What would lift it** | What would have to be true or available for the cap to be removed. Not a promise, and not a resolving event — a cap has none, by definition. |

---

## Entries

### SUB-1

*Three entries. SUB-1's caps are all about the limits of opening a package: it shipped conventions it cannot itself exercise, carried facts it did not itself re-verify, and had no QA engine to run.*

#### `CAP-S1-1` — The package conventions are unproven until siblings actually append

- **Id:** `CAP-S1-1`
- **Cap:** SUB-1 published the append convention, the `*-S<n>-<k>` id namespacing, the `00`–`89` / `90`–`99` numbering split and the keep-both-sides conflict rule, but **it did not and cannot demonstrate that they survive fifteen concurrent appends.** The registers are exercised by exactly one sub-task — the one that wrote them.
- **Why it is capped:** No experiment available to SUB-1 settles it. Simulating concurrent appends against files no sibling has written yet would test SUB-1's guess at what siblings will write, not the convention. The only evidence that counts is the real appends, and they arrive after this sub-task ships. It is not a spike (nothing to run), and it is not an open item (no single observable event closes it — it is discharged gradually, by fifteen of them).
- **What it leaves unsupported:** `OUT-12`'s house-style claim rests, for now, on the conventions being *mirrored from a package that did survive concurrent appends* (`../C009-course-content-quality/`, compiled 2026-08-10) rather than on this package's own evidence. That is a **proxy signal** under `00_method-and-provenance.md` §1.1 — precedent, not validation.
- **Owner:** **NEU-985 (SUB-11)** for the mechanical audit — id-namespace collisions, renumbered entries, entries missing a required field; **NEU-986 (SUB-12)** for the completeness gate's answer.
- **What would lift it:** SUB-11's audit reporting zero id collisions, zero renumbered entries and zero lost entries across every sub-task's appends — at which point the conventions have been exercised for real and the cap is answered by evidence rather than by precedent.

#### `CAP-S1-2` — SUB-1 re-verified none of the charter's codebase facts

- **Id:** `CAP-S1-2`
- **Cap:** The charter's numbered assumptions carry counted codebase facts — 45 registered tools across 16 modules, 42 gated and 3 exempt, 40 + 2 `context_token` declarations, 165 source files, ~25,200 lines, 197 test files, 25 Drizzle migrations, 431 non-bot commits of 648, 10 `public` tables and 2 Drizzle-defined `infrastructure` tables. **SUB-1 carried every one of them as `consumed` and re-counted none.**
- **Why it is capped:** Re-counting them was not SUB-1's scope, and doing it anyway would have produced a second set of numbers at a second cutoff with no mechanism to keep the two in step — a worse outcome than one clearly-attributed set. The charter records its own verification method and date for each fact.
- **What it leaves unsupported:** Any decision that depends on one of those counts depends on a number this package has not itself verified. `OUT-6`'s regression boundary (the 45/42/3 split) and `OUT-7`'s topology criteria (the maintainer tally, the single-package facts) are the two most exposed.
- **Owner:** **the sub-task that depends on the number.** A sub-task resting a decision on one of these counts **re-verifies it against `src/` at its own cutoff and cites its own command** — it does not inherit SUB-1's word for it. This is stated in `00_method-and-provenance.md` §6.
- **What would lift it:** Each dependent sub-task publishing its own re-verified count with its own cutoff and command. The cap is discharged piecewise, by the sub-tasks that actually need the numbers, not centrally.

#### `CAP-S1-3` — `qa-execution:engine` is unconfigured, so no QA pass exists

- **Id:** `CAP-S1-3`
- **Cap:** This repository's capability registry resolves to **`git, linear`** only; no `qa-execution:engine` provider is registered. The automated QA-execution phase is a genuine **no-op** for this package.
- **Why it is capped:** There is no engine to run and, for a documentation deliverable, nothing for one to exercise — this package contains no runtime behaviour. Registering a QA engine to satisfy a phase that has no subject would be theatre.
- **What it leaves unsupported:** **Nothing. No QA pass is claimed, fabricated, or implied anywhere in this package.** The phase is recorded as a no-op rather than as a skipped step, and verification here is by file inspection and `git diff` against the named success criteria — see `00_method-and-provenance.md` §5 and `94_package-completeness-gate.md`.
- **Owner:** **NEU-986 (SUB-12)**, which answers the completeness gate and records the no-op there rather than leaving the item blank.
- **What would lift it:** A registered `qa-execution:engine` provider **and** a deliverable with runtime behaviour for it to exercise. Neither exists for this package, and the first without the second would not lift it.

---

<!--
Later sub-tasks: append your own `### SUB-<n>` section BELOW this comment. Do not edit any
section above your own. On conflict, keep both sides — NEU-986 (SUB-12) reconciles duplicates
once, at the end.
-->
