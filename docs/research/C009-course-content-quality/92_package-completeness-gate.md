# 92 — Package Completeness Gate

**Package:** C009 course content quality · **Charter:** C009 (umbrella NEU-890) · **Stub created:** 2026-08-10 by **NEU-957 (SUB-1)** · **Owner:** **NEU-969 (SUB-12)**, the final packaging sub-task · **Status:** **NOT YET RUNNABLE.** This file SETS no status and asserts no result
**Model:** claude-opus-5[1m]

---

## This gate is NOT YET RUNNABLE

**One of thirteen sub-tasks has landed.** The gate checks a **complete** package against the charter's outcome list; there is no complete package to check, so **the gate has not been run, has no result, and is not partially satisfied.**

> **NO PASS/FAIL COUNT IS ASSERTED ANYWHERE IN THIS FILE.** Not a total, not a fraction, not an "n of n so far", and emphatically not a `0/0` or a `1/1` dressed as an early green. **A count written before the gate has run is a fabricated result** — the same failure as a fetch that never happened or a QA report for a run that never executed, and this package refuses all three by name (`91_caps-and-incomplete-scope.md` `CAP-S1-1`, `CAP-S1-3`).

**Why the stub exists at all rather than being created at the end.** The `90`–`99` range is reserved for package-level files, and twelve sibling sub-tasks read this package's layout off `origin/develop` while they work. A named, honest, empty gate tells every one of them **where the gate will be, who owns it, and what it will ask of their files** — early enough to write to it. A gate that appears only at the end is a gate nobody wrote for.

## Owner

**NEU-969 (SUB-12)** — the final packaging sub-task. It is also **the declared single owner that reconciles the shared registers** (`90_open-items-and-provisional-register.md` and `91_caps-and-incomplete-scope.md`), merging the duplicate entries the append-only keep-both-sides convention deliberately produces. **Reconciliation and the gate run are one job, in that order:** a gate run against an unreconciled register would count the same open item twice and could miss a cap that was silently dropped in a merge.

**No other sub-task runs this gate**, marks it satisfied, or records a partial result in it. A sub-task that believes its own contribution is complete says so in its own topic document; completeness of the **package** is a single owner's judgment, made once, at the end.

## What the gate will check, once the package is complete

Stated now, in prose rather than as a checklist with boxes to tick, because a checklist in a stub invites exactly the premature counting this file forbids. Each item below is a question the gate answers with evidence, not an assertion this file makes.

**File-set and layout completeness.** That every outcome the charter allocates to C009 has a landed topic document with a named owning sub-task; that every file sits in the `00`–`89` per-sub-task range or the reserved `90`–`99` package-level range, with nothing squatting in the reserved range; that no sub-task's file was renumbered or renamed by another; and that the package directory name is still exactly the string twelve siblings read off `origin/develop`.

**House-form conformance.** That every document carries the house header line — task, charter, compiled date, verification cutoff, and a status that **defers** rather than decides — and that every file carries its `**Model:** <id>` attribution line, per the constitution's Article 4.

**Evidence discipline.** That every material claim in the package carries **exactly one** NEU-887 evidence class with the provenance that class requires; that no claim is laundered across classes; and that **no class-7 `[future-real-user]` claim appears anywhere** — class 7 does not exist for this package, and the gate treats a single one as a failure rather than a note.

**Status discipline.** That no status is set outside a ledger; that no producing task has promoted its own artifact to `settled`; that every ledger interaction this package made was a **union** — an appended row or section, never a replacement — and that every challenge the package filed against another package's ledger is either resolved there or carried here as an open item with a named owner.

**Register integrity.** That both shared registers are reconciled: duplicates merged rather than dropped, every entry still carrying an **owner** and a **revision trigger**, no sub-task's section reflowed or rewritten by another, and no entry lost to a merge. That every gap recorded in a topic document has a matching register entry, and every register entry traces back to the document that raised it.

**The rights obligations, re-checked over the whole package.** That both detection scans of `01_provenance-and-rights.md` — the no-text scan (§5.1) and the **retained problem list or enumerated candidate set** scan (§6) — are **re-run over the entire package** at the gate's own date, with commands, date, commit base and outcome recorded. **A hit is a failure to fix before publication, never a note to add.** That every stored problem reference carries only the fields the ledger admits at that time, with its attribution; and that no artifact asserts an unverified problem id or cites a source as fetched that was never fetched.

**Cross-reference resolution.** That every internal path, section reference and id cited anywhere in the package resolves to something that exists — including references written by one sub-task against another's file while both were in flight.

**Honest residuals.** That the package's remaining weaknesses are ranked and stated, not smoothed; that every unresolved item names who carries it and what would close it; and that the gate's own limitations — in particular that its scans are lexical and cannot establish the absence of semantic paraphrase — are recorded in the same breath as its result.

## Until then

The authoritative statements of what this package knows and does not know are the two shared registers and each sub-task's own topic documents. **Read them; do not read a result into this file.**
